import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  updateDoc,
  deleteDoc,
  Timestamp,
  onSnapshot,
  addDoc
} from 'firebase/firestore';
import { 
  ref,
  set,
  get,
  onValue,
  push,
  remove,
  serverTimestamp,
  off
} from 'firebase/database';
import { db } from '../firebaseConfig';
import type { 
  CollaborationSession,
  CollaborationParticipant,
  RealtimeEdit,
  Comment,
  CommentReply
} from '../types';

export class CollaborationService {
  private static rtdb: any = null; // Firebase Realtime Database
  private static currentSession: CollaborationSession | null = null;
  private static currentUserId: string | null = null;
  private static listeners: Map<string, () => void> = new Map();
  private static presenceRef: any = null;

  // **INICIALIZAÇÃO**

  static async initialize(userId: string, realtimeDatabase: any): Promise<void> {
    this.rtdb = realtimeDatabase;
    this.currentUserId = userId;
    
    // Configurar presença do usuário
    await this.setupUserPresence();
  }

  static async cleanup(): Promise<void> {
    // Limpar listeners
    this.listeners.forEach(unsubscribe => unsubscribe());
    this.listeners.clear();

    // Remover presença
    if (this.presenceRef) {
      await remove(this.presenceRef);
    }

    // Sair da sessão atual
    if (this.currentSession) {
      await this.leaveSession(this.currentSession.id);
    }
  }

  // **GESTÃO DE SESSÕES**

  static async createSession(
    projectId: string,
    hostUserId: string,
    settings: CollaborationSession['settings']
  ): Promise<CollaborationSession> {
    try {
      const session: CollaborationSession = {
        id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        projectId,
        hostUserId,
        participants: [],
        status: 'active',
        settings: {
          allowEdit: true,
          allowComment: true,
          allowVoiceChat: false,
          maxParticipants: 10,
          ...settings
        },
        startedAt: Timestamp.now()
      };

      // Adicionar host como primeiro participante
      const hostParticipant: CollaborationParticipant = {
        userId: hostUserId,
        displayName: 'Host', // Seria obtido do perfil do usuário
        email: '', // Seria obtido do perfil do usuário
        role: 'owner',
        permissions: {
          canEdit: true,
          canComment: true,
          canShare: true,
          canDelete: true
        },
        status: 'online',
        joinedAt: Timestamp.now(),
        lastActive: Timestamp.now()
      };

      session.participants.push(hostParticipant);

      // Salvar no Firestore
      await setDoc(doc(db, 'collaboration_sessions', session.id), session);

      // Criar sala em tempo real
      await this.createRealtimeRoom(session.id);

      this.currentSession = session;
      return session;

    } catch (error) {
      console.error('Erro ao criar sessão de colaboração:', error);
      throw error;
    }
  }

  static async joinSession(sessionId: string, userId: string): Promise<CollaborationSession> {
    try {
      const sessionDoc = await getDoc(doc(db, 'collaboration_sessions', sessionId));
      
      if (!sessionDoc.exists()) {
        throw new Error('Sessão não encontrada');
      }

      const session = sessionDoc.data() as CollaborationSession;

      if (session.status !== 'active') {
        throw new Error('Sessão não está ativa');
      }

      if (session.participants.length >= session.settings.maxParticipants) {
        throw new Error('Sessão lotada');
      }

      // Verificar se usuário já está na sessão
      const existingParticipant = session.participants.find(p => p.userId === userId);
      
      if (!existingParticipant) {
        // Adicionar novo participante
        const participant: CollaborationParticipant = {
          userId,
          displayName: 'Usuário', // Seria obtido do perfil
          email: '', // Seria obtido do perfil
          role: 'editor',
          permissions: {
            canEdit: session.settings.allowEdit,
            canComment: session.settings.allowComment,
            canShare: false,
            canDelete: false
          },
          status: 'online',
          joinedAt: Timestamp.now(),
          lastActive: Timestamp.now()
        };

        session.participants.push(participant);

        // Atualizar no Firestore
        await updateDoc(doc(db, 'collaboration_sessions', sessionId), {
          participants: session.participants
        });
      }

      // Conectar à sala em tempo real
      await this.joinRealtimeRoom(sessionId, userId);

      this.currentSession = session;
      return session;

    } catch (error) {
      console.error('Erro ao entrar na sessão:', error);
      throw error;
    }
  }

  static async leaveSession(sessionId: string): Promise<void> {
    try {
      if (!this.currentUserId) return;

      const sessionDoc = await getDoc(doc(db, 'collaboration_sessions', sessionId));
      
      if (sessionDoc.exists()) {
        const session = sessionDoc.data() as CollaborationSession;
        
        // Remover participante
        session.participants = session.participants.filter(
          p => p.userId !== this.currentUserId
        );

        // Se foi o host ou não há mais participantes, encerrar sessão
        if (session.hostUserId === this.currentUserId || session.participants.length === 0) {
          await this.endSession(sessionId);
        } else {
          // Atualizar lista de participantes
          await updateDoc(doc(db, 'collaboration_sessions', sessionId), {
            participants: session.participants
          });
        }
      }

      // Sair da sala em tempo real
      await this.leaveRealtimeRoom(sessionId);

      this.currentSession = null;

    } catch (error) {
      console.error('Erro ao sair da sessão:', error);
    }
  }

  static async endSession(sessionId: string): Promise<void> {
    try {
      // Atualizar status no Firestore
      await updateDoc(doc(db, 'collaboration_sessions', sessionId), {
        status: 'ended',
        endedAt: Timestamp.now(),
        duration: Date.now() - (this.currentSession?.startedAt.toMillis() || Date.now())
      });

      // Remover sala em tempo real
      await this.removeRealtimeRoom(sessionId);

      this.currentSession = null;

    } catch (error) {
      console.error('Erro ao encerrar sessão:', error);
    }
  }

  // **EDIÇÃO EM TEMPO REAL**

  static async sendEdit(
    sessionId: string,
    operation: RealtimeEdit['operation'],
    position: number,
    content: string
  ): Promise<void> {
    if (!this.rtdb || !this.currentUserId) return;

    try {
      const edit: RealtimeEdit = {
        id: `edit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sessionId,
        userId: this.currentUserId,
        operation,
        position,
        content,
        timestamp: Timestamp.now(),
        applied: false
      };

      // Enviar para sala em tempo real
      const editsRef = ref(this.rtdb, `sessions/${sessionId}/edits`);
      await push(editsRef, edit);

    } catch (error) {
      console.error('Erro ao enviar edição:', error);
    }
  }

  static subscribeToEdits(
    sessionId: string,
    callback: (edit: RealtimeEdit) => void
  ): () => void {
    if (!this.rtdb) {
      return () => {};
    }

    const editsRef = ref(this.rtdb, `sessions/${sessionId}/edits`);
    
    const unsubscribe = onValue(editsRef, (snapshot) => {
      const edits = snapshot.val();
      if (edits) {
        Object.values(edits).forEach((edit: any) => {
          // Só processar edições de outros usuários
          if (edit.userId !== this.currentUserId && !edit.applied) {
            callback(edit);
            
            // Marcar como aplicada
            const editRef = ref(this.rtdb, `sessions/${sessionId}/edits/${edit.id}`);
            set(editRef, { ...edit, applied: true });
          }
        });
      }
    });

    this.listeners.set(`edits_${sessionId}`, unsubscribe);
    return unsubscribe;
  }

  // **CURSOR E SELEÇÃO**

  static async updateCursor(
    sessionId: string,
    x: number,
    y: number,
    selection?: { start: number; end: number }
  ): Promise<void> {
    if (!this.rtdb || !this.currentUserId) return;

    try {
      const cursorRef = ref(this.rtdb, `sessions/${sessionId}/cursors/${this.currentUserId}`);
      await set(cursorRef, {
        x,
        y,
        selection,
        timestamp: serverTimestamp(),
        userId: this.currentUserId
      });
    } catch (error) {
      console.error('Erro ao atualizar cursor:', error);
    }
  }

  static subscribeToCursors(
    sessionId: string,
    callback: (cursors: Record<string, any>) => void
  ): () => void {
    if (!this.rtdb) {
      return () => {};
    }

    const cursorsRef = ref(this.rtdb, `sessions/${sessionId}/cursors`);
    
    const unsubscribe = onValue(cursorsRef, (snapshot) => {
      const cursors = snapshot.val() || {};
      // Filtrar cursor do usuário atual
      const otherCursors = Object.fromEntries(
        Object.entries(cursors).filter(([userId]) => userId !== this.currentUserId)
      );
      callback(otherCursors);
    });

    this.listeners.set(`cursors_${sessionId}`, unsubscribe);
    return unsubscribe;
  }

  // **SISTEMA DE COMENTÁRIOS**

  static async addComment(
    projectId: string,
    userId: string,
    content: string,
    position: { start: number; end: number; selectedText: string }
  ): Promise<Comment> {
    try {
      const comment: Comment = {
        id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        projectId,
        userId,
        content,
        position,
        thread: [],
        status: 'open',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      await setDoc(doc(db, 'comments', comment.id), comment);
      return comment;

    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      throw error;
    }
  }

  static async replyToComment(
    commentId: string,
    userId: string,
    content: string
  ): Promise<CommentReply> {
    try {
      const reply: CommentReply = {
        id: `reply_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        content,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      // Adicionar resposta ao thread
      const commentDoc = await getDoc(doc(db, 'comments', commentId));
      if (commentDoc.exists()) {
        const comment = commentDoc.data() as Comment;
        comment.thread.push(reply);
        comment.updatedAt = Timestamp.now();

        await updateDoc(doc(db, 'comments', commentId), {
          thread: comment.thread,
          updatedAt: comment.updatedAt
        });
      }

      return reply;

    } catch (error) {
      console.error('Erro ao responder comentário:', error);
      throw error;
    }
  }

  static async resolveComment(commentId: string, userId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'comments', commentId), {
        status: 'resolved',
        resolvedAt: Timestamp.now(),
        resolvedBy: userId,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Erro ao resolver comentário:', error);
    }
  }

  static async getProjectComments(projectId: string): Promise<Comment[]> {
    try {
      const commentsQuery = query(
        collection(db, 'comments'),
        where('projectId', '==', projectId),
        where('status', '!=', 'deleted'),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(commentsQuery);
      return snapshot.docs.map(doc => doc.data() as Comment);

    } catch (error) {
      console.error('Erro ao obter comentários:', error);
      return [];
    }
  }

  // **PRESENÇA E STATUS**

  private static async setupUserPresence(): Promise<void> {
    if (!this.rtdb || !this.currentUserId) return;

    try {
      // Configurar presença
      this.presenceRef = ref(this.rtdb, `presence/${this.currentUserId}`);
      
      await set(this.presenceRef, {
        online: true,
        lastSeen: serverTimestamp(),
        status: 'online'
      });

      // Configurar desconexão
      const connectedRef = ref(this.rtdb, '.info/connected');
      onValue(connectedRef, (snapshot) => {
        if (snapshot.val() === false) return;

        // Quando desconectar, marcar como offline
        const offlineRef = ref(this.rtdb, `presence/${this.currentUserId}`);
        set(offlineRef, {
          online: false,
          lastSeen: serverTimestamp(),
          status: 'offline'
        });
      });

    } catch (error) {
      console.error('Erro ao configurar presença:', error);
    }
  }

  static subscribeToParticipants(
    sessionId: string,
    callback: (participants: CollaborationParticipant[]) => void
  ): () => void {
    if (!this.rtdb) {
      return () => {};
    }

    const participantsRef = ref(this.rtdb, `sessions/${sessionId}/participants`);
    
    const unsubscribe = onValue(participantsRef, (snapshot) => {
      const participants = snapshot.val();
      if (participants) {
        callback(Object.values(participants));
      }
    });

    this.listeners.set(`participants_${sessionId}`, unsubscribe);
    return unsubscribe;
  }

  // **GESTÃO DE SALAS EM TEMPO REAL**

  private static async createRealtimeRoom(sessionId: string): Promise<void> {
    if (!this.rtdb) return;

    try {
      const roomRef = ref(this.rtdb, `sessions/${sessionId}`);
      await set(roomRef, {
        id: sessionId,
        createdAt: serverTimestamp(),
        participants: {},
        edits: {},
        cursors: {},
        messages: {}
      });
    } catch (error) {
      console.error('Erro ao criar sala em tempo real:', error);
    }
  }

  private static async joinRealtimeRoom(sessionId: string, userId: string): Promise<void> {
    if (!this.rtdb) return;

    try {
      const participantRef = ref(this.rtdb, `sessions/${sessionId}/participants/${userId}`);
      await set(participantRef, {
        userId,
        joinedAt: serverTimestamp(),
        status: 'online'
      });
    } catch (error) {
      console.error('Erro ao entrar na sala em tempo real:', error);
    }
  }

  private static async leaveRealtimeRoom(sessionId: string): Promise<void> {
    if (!this.rtdb || !this.currentUserId) return;

    try {
      const participantRef = ref(this.rtdb, `sessions/${sessionId}/participants/${this.currentUserId}`);
      await remove(participantRef);

      const cursorRef = ref(this.rtdb, `sessions/${sessionId}/cursors/${this.currentUserId}`);
      await remove(cursorRef);
    } catch (error) {
      console.error('Erro ao sair da sala em tempo real:', error);
    }
  }

  private static async removeRealtimeRoom(sessionId: string): Promise<void> {
    if (!this.rtdb) return;

    try {
      const roomRef = ref(this.rtdb, `sessions/${sessionId}`);
      await remove(roomRef);
    } catch (error) {
      console.error('Erro ao remover sala em tempo real:', error);
    }
  }

  // **MENSAGENS DE CHAT**

  static async sendMessage(
    sessionId: string,
    message: string,
    type: 'text' | 'system' = 'text'
  ): Promise<void> {
    if (!this.rtdb || !this.currentUserId) return;

    try {
      const messagesRef = ref(this.rtdb, `sessions/${sessionId}/messages`);
      await push(messagesRef, {
        id: `msg_${Date.now()}`,
        userId: this.currentUserId,
        message,
        type,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  }

  static subscribeToMessages(
    sessionId: string,
    callback: (messages: any[]) => void
  ): () => void {
    if (!this.rtdb) {
      return () => {};
    }

    const messagesRef = ref(this.rtdb, `sessions/${sessionId}/messages`);
    
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const messages = snapshot.val();
      if (messages) {
        const messagesList = Object.values(messages).sort((a: any, b: any) => 
          a.timestamp - b.timestamp
        );
        callback(messagesList);
      }
    });

    this.listeners.set(`messages_${sessionId}`, unsubscribe);
    return unsubscribe;
  }

  // **PERMISSÕES E ROLES**

  static async updateParticipantRole(
    sessionId: string,
    userId: string,
    role: CollaborationParticipant['role']
  ): Promise<void> {
    try {
      const sessionDoc = await getDoc(doc(db, 'collaboration_sessions', sessionId));
      
      if (sessionDoc.exists()) {
        const session = sessionDoc.data() as CollaborationSession;
        
        const participantIndex = session.participants.findIndex(p => p.userId === userId);
        if (participantIndex !== -1) {
          session.participants[participantIndex].role = role;
          
          // Atualizar permissões baseado no role
          session.participants[participantIndex].permissions = this.getRolePermissions(role);

          await updateDoc(doc(db, 'collaboration_sessions', sessionId), {
            participants: session.participants
          });
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar role do participante:', error);
    }
  }

  private static getRolePermissions(role: CollaborationParticipant['role']): CollaborationParticipant['permissions'] {
    switch (role) {
      case 'owner':
        return {
          canEdit: true,
          canComment: true,
          canShare: true,
          canDelete: true
        };
      case 'editor':
        return {
          canEdit: true,
          canComment: true,
          canShare: false,
          canDelete: false
        };
      case 'commenter':
        return {
          canEdit: false,
          canComment: true,
          canShare: false,
          canDelete: false
        };
      case 'viewer':
        return {
          canEdit: false,
          canComment: false,
          canShare: false,
          canDelete: false
        };
      default:
        return {
          canEdit: false,
          canComment: false,
          canShare: false,
          canDelete: false
        };
    }
  }

  // **ANALYTICS E HISTÓRICO**

  static async getSessionAnalytics(sessionId: string): Promise<{
    duration: number;
    participantCount: number;
    editCount: number;
    commentCount: number;
    messageCount: number;
  }> {
    try {
      const sessionDoc = await getDoc(doc(db, 'collaboration_sessions', sessionId));
      
      if (!sessionDoc.exists()) {
        throw new Error('Sessão não encontrada');
      }

      const session = sessionDoc.data() as CollaborationSession;

      // Contar edições, comentários e mensagens
      // Em uma implementação real, isso seria otimizado com contadores
      
      return {
        duration: session.duration || 0,
        participantCount: session.participants.length,
        editCount: 0, // Seria contado das edições
        commentCount: 0, // Seria contado dos comentários
        messageCount: 0 // Seria contado das mensagens
      };

    } catch (error) {
      console.error('Erro ao obter analytics da sessão:', error);
      return {
        duration: 0,
        participantCount: 0,
        editCount: 0,
        commentCount: 0,
        messageCount: 0
      };
    }
  }

  static async getUserCollaborationHistory(userId: string): Promise<CollaborationSession[]> {
    try {
      const sessionsQuery = query(
        collection(db, 'collaboration_sessions'),
        where('participants', 'array-contains-any', [{ userId }]),
        orderBy('startedAt', 'desc'),
        limit(50)
      );

      const snapshot = await getDocs(sessionsQuery);
      return snapshot.docs.map(doc => doc.data() as CollaborationSession);

    } catch (error) {
      console.error('Erro ao obter histórico de colaboração:', error);
      return [];
    }
  }

  // **UTILITÁRIOS**

  static isHost(sessionId: string): boolean {
    return this.currentSession?.hostUserId === this.currentUserId;
  }

  static canEdit(sessionId: string): boolean {
    if (!this.currentSession || !this.currentUserId) return false;
    
    const participant = this.currentSession.participants.find(
      p => p.userId === this.currentUserId
    );
    
    return participant?.permissions.canEdit || false;
  }

  static canComment(sessionId: string): boolean {
    if (!this.currentSession || !this.currentUserId) return false;
    
    const participant = this.currentSession.participants.find(
      p => p.userId === this.currentUserId
    );
    
    return participant?.permissions.canComment || false;
  }

  static getCurrentSession(): CollaborationSession | null {
    return this.currentSession;
  }

  static isInSession(): boolean {
    return this.currentSession !== null;
  }
} 