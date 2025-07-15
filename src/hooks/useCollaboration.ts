/**
 * USE COLLABORATION HOOK - SPRINT 4
 * React hook for real-time collaboration features
 * V7.5 Enhanced - IA Beta Implementation
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import CollaborationService, { 
  CollaborationSession, 
  CollaborationParticipant, 
  CreateSessionRequest, 
  JoinSessionRequest,
  CursorPosition,
  CollaborationEvent
} from '../services/collaboration/CollaborationService';

interface UseCollaborationOptions {
  autoConnect?: boolean;
  enableCursor?: boolean;
  enableTypingStatus?: boolean;
}

interface CollaborationState {
  isConnected: boolean;
  currentSession: CollaborationSession | null;
  participants: CollaborationParticipant[];
  isCreating: boolean;
  isJoining: boolean;
  error: string | null;
  cursors: Map<string, CursorPosition>;
  typingUsers: Set<string>;
}

export const useCollaboration = (options: UseCollaborationOptions = {}) => {
  const {
    autoConnect = true,
    enableCursor = true,
    enableTypingStatus = true
  } = options;

  // Service instance
  const serviceRef = useRef<CollaborationService | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // State
  const [state, setState] = useState<CollaborationState>({
    isConnected: false,
    currentSession: null,
    participants: [],
    isCreating: false,
    isJoining: false,
    error: null,
    cursors: new Map(),
    typingUsers: new Set()
  });

  /**
   * Initialize collaboration service
   */
  const initializeService = useCallback(() => {
    if (!serviceRef.current) {
      serviceRef.current = new CollaborationService();
      
      // Set up event listeners
      serviceRef.current.on('connected', () => {
        setState(prev => ({ ...prev, isConnected: true, error: null }));
      });

      serviceRef.current.on('disconnected', () => {
        setState(prev => ({ ...prev, isConnected: false }));
      });

      serviceRef.current.on('error', (error) => {
        setState(prev => ({ ...prev, error: error.message }));
      });

      serviceRef.current.on('userJoined', (event: CollaborationEvent) => {
        if (state.currentSession?.id === event.sessionId) {
          setState(prev => {
            const session = prev.currentSession;
            if (session) {
              const updatedParticipants = [...session.participants];
              const existingIndex = updatedParticipants.findIndex(p => p.userId === event.userId);
              
              if (existingIndex === -1) {
                updatedParticipants.push({
                  userId: event.userId,
                  username: event.data.username,
                  role: 'editor',
                  joinedAt: new Date(),
                  status: 'online'
                });
              } else {
                updatedParticipants[existingIndex].status = 'online';
              }
              
              return {
                ...prev,
                participants: updatedParticipants,
                currentSession: { ...session, participants: updatedParticipants }
              };
            }
            return prev;
          });
        }
      });

      serviceRef.current.on('userLeft', (event: CollaborationEvent) => {
        if (state.currentSession?.id === event.sessionId) {
          setState(prev => {
            const session = prev.currentSession;
            if (session) {
              const updatedParticipants = session.participants.map(p => 
                p.userId === event.userId ? { ...p, status: 'offline' as const } : p
              );
              
              return {
                ...prev,
                participants: updatedParticipants,
                currentSession: { ...session, participants: updatedParticipants }
              };
            }
            return prev;
          });
        }
      });

      serviceRef.current.on('ideaUpdated', (event: CollaborationEvent) => {
        if (state.currentSession?.id === event.sessionId) {
          setState(prev => {
            const session = prev.currentSession;
            if (session) {
              return {
                ...prev,
                currentSession: { ...session, currentIdea: event.data.newIdea }
              };
            }
            return prev;
          });
        }
      });

      serviceRef.current.on('cursorMoved', (event: CollaborationEvent) => {
        if (enableCursor && state.currentSession?.id === event.sessionId) {
          setState(prev => {
            const newCursors = new Map(prev.cursors);
            newCursors.set(event.userId, event.data.cursor);
            return { ...prev, cursors: newCursors };
          });
        }
      });
    }
  }, [enableCursor, state.currentSession?.id]);

  /**
   * Create a new collaboration session
   */
  const createSession = useCallback(async (request: CreateSessionRequest): Promise<CollaborationSession | null> => {
    if (!serviceRef.current) return null;

    setState(prev => ({ ...prev, isCreating: true, error: null }));

    try {
      const session = await serviceRef.current.createSession(request);
      
      setState(prev => ({
        ...prev,
        isCreating: false,
        currentSession: session,
        participants: session.participants,
        cursors: new Map(),
        typingUsers: new Set()
      }));

      return session;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isCreating: false,
        error: error instanceof Error ? error.message : 'Failed to create session'
      }));
      return null;
    }
  }, []);

  /**
   * Join an existing collaboration session
   */
  const joinSession = useCallback(async (request: JoinSessionRequest): Promise<CollaborationSession | null> => {
    if (!serviceRef.current) return null;

    setState(prev => ({ ...prev, isJoining: true, error: null }));

    try {
      const session = await serviceRef.current.joinSession(request);
      
      setState(prev => ({
        ...prev,
        isJoining: false,
        currentSession: session,
        participants: session.participants,
        cursors: new Map(),
        typingUsers: new Set()
      }));

      return session;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isJoining: false,
        error: error instanceof Error ? error.message : 'Failed to join session'
      }));
      return null;
    }
  }, []);

  /**
   * Leave current session
   */
  const leaveSession = useCallback(async (): Promise<void> => {
    if (!serviceRef.current || !state.currentSession) return;

    const userId = localStorage.getItem('userId') || 'anonymous';
    
    try {
      await serviceRef.current.leaveSession(state.currentSession.id, userId);
      
      setState(prev => ({
        ...prev,
        currentSession: null,
        participants: [],
        cursors: new Map(),
        typingUsers: new Set()
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to leave session'
      }));
    }
  }, [state.currentSession]);

  /**
   * Update idea in current session
   */
  const updateIdea = useCallback(async (newIdea: string): Promise<void> => {
    if (!serviceRef.current || !state.currentSession) return;

    const userId = localStorage.getItem('userId') || 'anonymous';
    
    try {
      await serviceRef.current.updateIdeaInSession(state.currentSession.id, userId, newIdea);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update idea'
      }));
    }
  }, [state.currentSession]);

  /**
   * Update cursor position
   */
  const updateCursor = useCallback((cursor: CursorPosition): void => {
    if (!serviceRef.current || !state.currentSession || !enableCursor) return;

    const userId = localStorage.getItem('userId') || 'anonymous';
    serviceRef.current.updateCursorPosition(state.currentSession.id, userId, cursor);
  }, [state.currentSession, enableCursor]);

  /**
   * Set typing status
   */
  const setTypingStatus = useCallback((isTyping: boolean): void => {
    if (!enableTypingStatus || !state.currentSession) return;

    const userId = localStorage.getItem('userId') || 'anonymous';
    
    setState(prev => {
      const newTypingUsers = new Set(prev.typingUsers);
      
      if (isTyping) {
        newTypingUsers.add(userId);
        
        // Clear existing timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        
        // Set timeout to remove typing status
        typingTimeoutRef.current = setTimeout(() => {
          setState(current => {
            const updated = new Set(current.typingUsers);
            updated.delete(userId);
            return { ...current, typingUsers: updated };
          });
        }, 3000);
      } else {
        newTypingUsers.delete(userId);
        
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      }
      
      return { ...prev, typingUsers: newTypingUsers };
    });
  }, [enableTypingStatus, state.currentSession]);

  /**
   * Get online participants
   */
  const getOnlineParticipants = useCallback((): CollaborationParticipant[] => {
    return state.participants.filter(p => p.status === 'online');
  }, [state.participants]);

  /**
   * Get typing participants
   */
  const getTypingParticipants = useCallback((): CollaborationParticipant[] => {
    return state.participants.filter(p => 
      state.typingUsers.has(p.userId) && p.status === 'online'
    );
  }, [state.participants, state.typingUsers]);

  /**
   * Initialize service on mount
   */
  useEffect(() => {
    if (autoConnect) {
      initializeService();
    }

    return () => {
      if (serviceRef.current) {
        serviceRef.current.disconnect();
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [autoConnect, initializeService]);

  /**
   * Mouse tracking for cursor position
   */
  useEffect(() => {
    if (!enableCursor || !state.currentSession) return;

    const handleMouseMove = (event: MouseEvent) => {
      const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
      const userId = localStorage.getItem('userId') || 'anonymous';
      const userIndex = state.participants.findIndex(p => p.userId === userId);
      const color = colors[userIndex % colors.length];

      updateCursor({
        x: event.clientX,
        y: event.clientY,
        color,
        elementId: (event.target as HTMLElement)?.id
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [enableCursor, state.currentSession, state.participants, updateCursor]);

  return {
    // State
    isConnected: state.isConnected,
    currentSession: state.currentSession,
    participants: state.participants,
    isCreating: state.isCreating,
    isJoining: state.isJoining,
    error: state.error,
    cursors: state.cursors,
    typingUsers: state.typingUsers,
    
    // Actions
    createSession,
    joinSession,
    leaveSession,
    updateIdea,
    updateCursor,
    setTypingStatus,
    
    // Computed
    getOnlineParticipants,
    getTypingParticipants,
    
    // Service
    service: serviceRef.current
  };
};

export default useCollaboration; 