/**
 * COLLABORATION SERVICE - SPRINT 4
 * Real-time collaboration system for idea sharing and co-creation
 * V7.5 Enhanced - IA Alpha Implementation
 */

import { EventEmitter } from 'events';

// Types and Interfaces
export interface CollaborationSession {
  id: string;
  title: string;
  createdBy: string;
  createdAt: Date;
  participants: CollaborationParticipant[];
  currentIdea: string;
  status: 'active' | 'paused' | 'completed';
  permissions: CollaborationPermissions;
}

export interface CollaborationParticipant {
  userId: string;
  username: string;
  role: 'owner' | 'editor' | 'viewer';
  joinedAt: Date;
  status: 'online' | 'offline' | 'typing';
  cursor?: CursorPosition;
}

export interface CursorPosition {
  x: number;
  y: number;
  color: string;
  elementId?: string;
}

export interface CollaborationPermissions {
  canEdit: boolean;
  canComment: boolean;
  canShare: boolean;
  canInvite: boolean;
}

export interface CollaborationEvent {
  type: 'user_joined' | 'user_left' | 'idea_updated' | 'comment_added' | 'cursor_moved';
  sessionId: string;
  userId: string;
  timestamp: Date;
  data: any;
}

export interface CreateSessionRequest {
  title: string;
  initialIdea?: string;
  permissions?: Partial<CollaborationPermissions>;
}

export interface JoinSessionRequest {
  sessionId: string;
  userId: string;
  username: string;
}

// Real-time Collaboration Service
export class CollaborationService extends EventEmitter {
  private sessions: Map<string, CollaborationSession> = new Map();
  private userSessions: Map<string, string[]> = new Map();
  private websocket: WebSocket | null = null;
  private reconnectInterval: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.initializeWebSocket();
  }

  /**
   * Initialize WebSocket connection for real-time communication
   */
  private initializeWebSocket(): void {
    try {
      // In production, use environment variable for WebSocket URL
      const wsUrl = process.env.VITE_WEBSOCKET_URL || 'ws://localhost:3001';
      this.websocket = new WebSocket(wsUrl);

      this.websocket.onopen = () => {
        console.log('✅ Collaboration WebSocket connected');
        this.emit('connected');
        this.startHeartbeat();
      };

      this.websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleWebSocketMessage(data);
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
        }
      };

      this.websocket.onclose = () => {
        console.log('🔌 Collaboration WebSocket disconnected');
        this.emit('disconnected');
        this.stopHeartbeat();
        this.scheduleReconnect();
      };

      this.websocket.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        this.emit('error', error);
      };
    } catch (error) {
      console.error('❌ Error initializing WebSocket:', error);
      this.scheduleReconnect();
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleWebSocketMessage(data: any): void {
    const event: CollaborationEvent = data;
    
    switch (event.type) {
      case 'user_joined':
        this.handleUserJoined(event);
        break;
      case 'user_left':
        this.handleUserLeft(event);
        break;
      case 'idea_updated':
        this.handleIdeaUpdated(event);
        break;
      case 'comment_added':
        this.handleCommentAdded(event);
        break;
      case 'cursor_moved':
        this.handleCursorMoved(event);
        break;
      default:
        console.warn('Unknown collaboration event type:', event.type);
    }
  }

  /**
   * Create a new collaboration session
   */
  public async createSession(request: CreateSessionRequest): Promise<CollaborationSession> {
    const sessionId = this.generateSessionId();
    const userId = this.getCurrentUserId();
    
    const session: CollaborationSession = {
      id: sessionId,
      title: request.title,
      createdBy: userId,
      createdAt: new Date(),
      participants: [{
        userId,
        username: await this.getUsernameById(userId),
        role: 'owner',
        joinedAt: new Date(),
        status: 'online'
      }],
      currentIdea: request.initialIdea || '',
      status: 'active',
      permissions: {
        canEdit: true,
        canComment: true,
        canShare: true,
        canInvite: true,
        ...request.permissions
      }
    };

    this.sessions.set(sessionId, session);
    this.addUserSession(userId, sessionId);
    
    this.emit('sessionCreated', session);
    return session;
  }

  /**
   * Join an existing collaboration session
   */
  public async joinSession(request: JoinSessionRequest): Promise<CollaborationSession> {
    const session = this.sessions.get(request.sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Check if user is already in session
    const existingParticipant = session.participants.find(p => p.userId === request.userId);
    if (existingParticipant) {
      existingParticipant.status = 'online';
      existingParticipant.joinedAt = new Date();
    } else {
      // Add new participant
      const participant: CollaborationParticipant = {
        userId: request.userId,
        username: request.username,
        role: 'editor',
        joinedAt: new Date(),
        status: 'online'
      };
      session.participants.push(participant);
    }

    this.addUserSession(request.userId, request.sessionId);
    
    // Notify other participants
    this.broadcastToSession(request.sessionId, {
      type: 'user_joined',
      sessionId: request.sessionId,
      userId: request.userId,
      timestamp: new Date(),
      data: { username: request.username }
    });

    this.emit('userJoined', { session, userId: request.userId });
    return session;
  }

  /**
   * Leave a collaboration session
   */
  public async leaveSession(sessionId: string, userId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Update participant status
    const participant = session.participants.find(p => p.userId === userId);
    if (participant) {
      participant.status = 'offline';
    }

    this.removeUserSession(userId, sessionId);

    // Notify other participants
    this.broadcastToSession(sessionId, {
      type: 'user_left',
      sessionId,
      userId,
      timestamp: new Date(),
      data: {}
    });

    this.emit('userLeft', { session, userId });
  }

  /**
   * Update idea in collaboration session
   */
  public async updateIdeaInSession(sessionId: string, userId: string, newIdea: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Check permissions
    const participant = session.participants.find(p => p.userId === userId);
    if (!participant || (participant.role === 'viewer' && !session.permissions.canEdit)) {
      throw new Error('Insufficient permissions to edit');
    }

    session.currentIdea = newIdea;

    // Broadcast update to all participants
    this.broadcastToSession(sessionId, {
      type: 'idea_updated',
      sessionId,
      userId,
      timestamp: new Date(),
      data: { newIdea }
    });

    this.emit('ideaUpdated', { session, userId, newIdea });
  }

  /**
   * Update cursor position in session
   */
  public updateCursorPosition(sessionId: string, userId: string, cursor: CursorPosition): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const participant = session.participants.find(p => p.userId === userId);
    if (participant) {
      participant.cursor = cursor;
    }

    // Broadcast cursor update
    this.broadcastToSession(sessionId, {
      type: 'cursor_moved',
      sessionId,
      userId,
      timestamp: new Date(),
      data: { cursor }
    });
  }

  /**
   * Get active sessions for a user
   */
  public getUserSessions(userId: string): CollaborationSession[] {
    const sessionIds = this.userSessions.get(userId) || [];
    return sessionIds.map(id => this.sessions.get(id)).filter(Boolean) as CollaborationSession[];
  }

  /**
   * Get session by ID
   */
  public getSession(sessionId: string): CollaborationSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Broadcast message to all participants in a session
   */
  private broadcastToSession(sessionId: string, event: CollaborationEvent): void {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify({
        action: 'broadcast',
        sessionId,
        event
      }));
    }
  }

  /**
   * Event handlers
   */
  private handleUserJoined(event: CollaborationEvent): void {
    this.emit('userJoined', event);
  }

  private handleUserLeft(event: CollaborationEvent): void {
    this.emit('userLeft', event);
  }

  private handleIdeaUpdated(event: CollaborationEvent): void {
    const session = this.sessions.get(event.sessionId);
    if (session) {
      session.currentIdea = event.data.newIdea;
      this.emit('ideaUpdated', event);
    }
  }

  private handleCommentAdded(event: CollaborationEvent): void {
    this.emit('commentAdded', event);
  }

  private handleCursorMoved(event: CollaborationEvent): void {
    this.emit('cursorMoved', event);
  }

  /**
   * Utility methods
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCurrentUserId(): string {
    // Get from auth context or localStorage
    return localStorage.getItem('userId') || 'anonymous';
  }

  private async getUsernameById(userId: string): Promise<string> {
    // Get from user service or localStorage
    return localStorage.getItem('username') || 'Usuário';
  }

  private addUserSession(userId: string, sessionId: string): void {
    const sessions = this.userSessions.get(userId) || [];
    if (!sessions.includes(sessionId)) {
      sessions.push(sessionId);
      this.userSessions.set(userId, sessions);
    }
  }

  private removeUserSession(userId: string, sessionId: string): void {
    const sessions = this.userSessions.get(userId) || [];
    const index = sessions.indexOf(sessionId);
    if (index > -1) {
      sessions.splice(index, 1);
      this.userSessions.set(userId, sessions);
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectInterval) {
      clearTimeout(this.reconnectInterval);
    }
    
    this.reconnectInterval = setTimeout(() => {
      console.log('🔄 Attempting to reconnect WebSocket...');
      this.initializeWebSocket();
    }, 5000);
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
        this.websocket.send(JSON.stringify({ action: 'ping' }));
      }
    }, 30000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Cleanup resources
   */
  public disconnect(): void {
    if (this.websocket) {
      this.websocket.close();
    }
    if (this.reconnectInterval) {
      clearTimeout(this.reconnectInterval);
    }
    this.stopHeartbeat();
    this.removeAllListeners();
  }
}

export default CollaborationService; 