/**
 * useCollaboration Hook - Real-time Collaboration
 * Week 8 - IA Alpha - Collaboration Frontend Implementation
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../../firebaseConfig';
import { CollaborationService } from '../../../services/collaborationService';
import { analyticsService } from '../../../services/analyticsService';
import type {
  CollaborationState,
  CollaborationActions,
  UseCollaborationReturn,
  CollaborationEventHandlers,
  CollaborationSession,
  CollaborationParticipant,
  RealtimeEdit,
  Comment,
  CollaborationMessage
} from '../types/collaboration.types';

/**
 * Custom hook for real-time collaboration functionality
 * Integrates with existing CollaborationService backend
 */
export function useCollaboration(
  projectId: string,
  eventHandlers?: CollaborationEventHandlers
): UseCollaborationReturn {
  const [user] = useAuthState(auth);
  
  // Core collaboration state
  const [state, setState] = useState<CollaborationState>({
    isActive: false,
    session: null,
    participants: [],
    messages: [],
    edits: [],
    comments: [],
    isLoading: false,
    error: null
  });

  // Real-time listeners cleanup functions
  const [listeners] = useState<Map<string, () => void>>(new Map());

  // Initialize collaboration service when user is available
  useEffect(() => {
    if (user) {
      const initializeService = async () => {
        try {
          // Initialize collaboration service with user ID
          // Note: This would need the realtime database instance
          console.log('🤝 Initializing collaboration for user:', user.uid);
        } catch (error) {
          console.error('❌ Failed to initialize collaboration:', error);
          setState(prev => ({ 
            ...prev, 
            error: 'Failed to initialize collaboration service' 
          }));
        }
      };
      
      initializeService();
    }

    // Cleanup on unmount
    return () => {
      listeners.forEach(unsubscribe => unsubscribe());
      listeners.clear();
      CollaborationService.cleanup();
    };
  }, [user]);

  // Create collaboration session
  const createSession = useCallback(async (
    projectId: string, 
    settings: CollaborationSession['settings']
  ) => {
    if (!user) {
      setState(prev => ({ ...prev, error: 'User not authenticated' }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const session = await CollaborationService.createSession(
        projectId,
        user.uid,
        settings
      );

      setState(prev => ({
        ...prev,
        isActive: true,
        session,
        participants: session.participants,
        isLoading: false
      }));

      // Set up real-time listeners
      setupRealtimeListeners(session.id);

      // Track analytics
      analyticsService.trackUserAction('collaboration_session_created', {
        sessionId: session.id,
        projectId,
        participantCount: session.participants.length
      });

      eventHandlers?.onParticipantJoined?.(session.participants[0]);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create session';
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));
      
      eventHandlers?.onError?.('CONNECTION_FAILED', errorMessage);
    }
  }, [user, eventHandlers]);

  // Join existing collaboration session
  const joinSession = useCallback(async (sessionId: string) => {
    if (!user) {
      setState(prev => ({ ...prev, error: 'User not authenticated' }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const session = await CollaborationService.joinSession(sessionId, user.uid);

      setState(prev => ({
        ...prev,
        isActive: true,
        session,
        participants: session.participants,
        isLoading: false
      }));

      // Set up real-time listeners
      setupRealtimeListeners(sessionId);

      // Track analytics
      analyticsService.trackUserAction('collaboration_session_joined', {
        sessionId,
        projectId,
        participantCount: session.participants.length
      });

      // Find current user participant
      const currentParticipant = session.participants.find(p => p.userId === user.uid);
      if (currentParticipant) {
        eventHandlers?.onParticipantJoined?.(currentParticipant);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to join session';
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));
      
      if (errorMessage.includes('não encontrada')) {
        eventHandlers?.onError?.('SESSION_NOT_FOUND', errorMessage);
      } else if (errorMessage.includes('lotada')) {
        eventHandlers?.onError?.('MAX_PARTICIPANTS_REACHED', errorMessage);
      } else {
        eventHandlers?.onError?.('CONNECTION_FAILED', errorMessage);
      }
    }
  }, [user, projectId, eventHandlers]);

  // Leave collaboration session
  const leaveSession = useCallback(async () => {
    if (!state.session) return;

    try {
      await CollaborationService.leaveSession(state.session.id);

      // Clean up listeners
      listeners.forEach(unsubscribe => unsubscribe());
      listeners.clear();

      setState({
        isActive: false,
        session: null,
        participants: [],
        messages: [],
        edits: [],
        comments: [],
        isLoading: false,
        error: null
      });

      // Track analytics
      analyticsService.trackUserAction('collaboration_session_left', {
        sessionId: state.session.id,
        projectId
      });

      eventHandlers?.onSessionEnded?.();

    } catch (error) {
      console.error('❌ Failed to leave session:', error);
    }
  }, [state.session, projectId, eventHandlers]);

  // Send message to chat
  const sendMessage = useCallback(async (message: string) => {
    if (!state.session) return;

    try {
      await CollaborationService.sendMessage(
        state.session.id,
        message,
        'text'
      );

      // Analytics
      analyticsService.trackUserAction('collaboration_message_sent', {
        sessionId: state.session.id,
        messageLength: message.length
      });

    } catch (error) {
      console.error('❌ Failed to send message:', error);
      eventHandlers?.onError?.('INVALID_OPERATION', 'Failed to send message');
    }
  }, [state.session, eventHandlers]);

  // Send real-time edit
  const sendEdit = useCallback(async (
    operation: RealtimeEdit['operation'],
    position: number,
    content: string
  ) => {
    if (!state.session) return;

    try {
      await CollaborationService.sendEdit(
        state.session.id,
        operation,
        position,
        content
      );

      // Analytics
      analyticsService.trackUserAction('collaboration_edit_sent', {
        sessionId: state.session.id,
        operation,
        contentLength: content.length
      });

    } catch (error) {
      console.error('❌ Failed to send edit:', error);
      eventHandlers?.onError?.('INVALID_OPERATION', 'Failed to send edit');
    }
  }, [state.session, eventHandlers]);

  // Add comment
  const addComment = useCallback(async (
    content: string,
    position: Comment['position']
  ) => {
    if (!user) return;

    try {
      const comment = await CollaborationService.addComment(
        projectId,
        user.uid,
        content,
        position
      );

      setState(prev => ({
        ...prev,
        comments: [...prev.comments, comment]
      }));

      // Analytics
      analyticsService.trackUserAction('collaboration_comment_added', {
        projectId,
        commentLength: content.length
      });

      eventHandlers?.onCommentAdded?.(comment);

    } catch (error) {
      console.error('❌ Failed to add comment:', error);
      eventHandlers?.onError?.('INVALID_OPERATION', 'Failed to add comment');
    }
  }, [user, projectId, eventHandlers]);

  // Update cursor position
  const updateCursor = useCallback(async (
    x: number,
    y: number,
    selection?: { start: number; end: number }
  ) => {
    if (!state.session) return;

    try {
      await CollaborationService.updateCursor(
        state.session.id,
        x,
        y,
        selection
      );
    } catch (error) {
      console.error('❌ Failed to update cursor:', error);
    }
  }, [state.session]);

  // Set up real-time listeners
  const setupRealtimeListeners = useCallback((sessionId: string) => {
    // Listen to edits
    const editsUnsubscribe = CollaborationService.subscribeToEdits(
      sessionId,
      (edit: RealtimeEdit) => {
        setState(prev => ({
          ...prev,
          edits: [...prev.edits, edit]
        }));
        eventHandlers?.onEditReceived?.(edit);
      }
    );
    listeners.set('edits', editsUnsubscribe);

    // Listen to messages
    const messagesUnsubscribe = CollaborationService.subscribeToMessages(
      sessionId,
      (messages: CollaborationMessage[]) => {
        setState(prev => ({ ...prev, messages }));
        
        // Check for new messages
        const newMessage = messages[messages.length - 1];
        if (newMessage && newMessage.userId !== user?.uid) {
          eventHandlers?.onMessageReceived?.(newMessage);
        }
      }
    );
    listeners.set('messages', messagesUnsubscribe);

    // Listen to participants
    const participantsUnsubscribe = CollaborationService.subscribeToParticipants(
      sessionId,
      (participants: CollaborationParticipant[]) => {
        setState(prev => {
          const previousParticipants = prev.participants;
          
          // Check for new participants
          participants.forEach(participant => {
            const wasAlreadyThere = previousParticipants.find(p => p.userId === participant.userId);
            if (!wasAlreadyThere && participant.userId !== user?.uid) {
              eventHandlers?.onParticipantJoined?.(participant);
            }
          });

          // Check for left participants
          previousParticipants.forEach(participant => {
            const stillThere = participants.find(p => p.userId === participant.userId);
            if (!stillThere && participant.userId !== user?.uid) {
              eventHandlers?.onParticipantLeft?.(participant.userId);
            }
          });

          return { ...prev, participants };
        });
      }
    );
    listeners.set('participants', participantsUnsubscribe);

  }, [user, eventHandlers]);

  // Computed properties
  const isHost = useMemo(() => {
    return state.session?.hostUserId === user?.uid;
  }, [state.session, user]);

  const canEdit = useMemo(() => {
    if (!state.session || !user) return false;
    return CollaborationService.canEdit(state.session.id);
  }, [state.session, user]);

  const canComment = useMemo(() => {
    if (!state.session || !user) return false;
    return CollaborationService.canComment(state.session.id);
  }, [state.session, user]);

  const onlineParticipants = useMemo(() => {
    return state.participants.filter(p => p.status === 'online');
  }, [state.participants]);

  // Utility functions
  const getParticipantById = useCallback((userId: string) => {
    return state.participants.find(p => p.userId === userId);
  }, [state.participants]);

  const isParticipantOnline = useCallback((userId: string) => {
    const participant = getParticipantById(userId);
    return participant?.status === 'online';
  }, [getParticipantById]);

  return {
    // State
    ...state,
    
    // Actions
    createSession,
    joinSession,
    leaveSession,
    sendMessage,
    sendEdit,
    addComment,
    updateCursor,
    
    // Computed properties
    isHost,
    canEdit,
    canComment,
    onlineParticipants,
    
    // Utilities
    getParticipantById,
    isParticipantOnline
  };
}
