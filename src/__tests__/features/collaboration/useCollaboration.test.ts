/**
 * useCollaboration Hook Tests
 * Week 8 - IA Alpha - Collaboration Frontend Implementation
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useCollaboration } from '../../../features/collaboration/hooks/useCollaboration';

// Mock Firebase hooks
jest.mock('react-firebase-hooks/auth', () => ({
  useAuthState: () => [{
    uid: 'test-user-id',
    email: 'test@example.com',
    displayName: 'Test User'
  }, false, null]
}));

// Mock Firebase config
jest.mock('../../../firebaseConfig', () => ({
  auth: {},
  db: {},
  storage: {}
}));

// Mock collaboration service - reorganized to fix dependency order
const mockCollaborationService = {
  createSession: jest.fn(),
  joinSession: jest.fn(),
  leaveSession: jest.fn(),
  sendMessage: jest.fn(),
  sendEdit: jest.fn(),
  addComment: jest.fn(),
  updateCursor: jest.fn(),
  subscribeToEdits: jest.fn(() => () => {}),
  subscribeToMessages: jest.fn(() => () => {}),
  subscribeToParticipants: jest.fn(() => () => {}),
  canEdit: jest.fn(() => true),
  canComment: jest.fn(() => true),
  cleanup: jest.fn()
};

jest.mock('../../../services/collaborationService', () => ({
  CollaborationService: {
    createSession: jest.fn(),
    joinSession: jest.fn(),
    leaveSession: jest.fn(),
    sendMessage: jest.fn(),
    sendEdit: jest.fn(),
    addComment: jest.fn(),
    updateCursor: jest.fn(),
    subscribeToEdits: jest.fn(() => () => {}),
    subscribeToMessages: jest.fn(() => () => {}),
    subscribeToParticipants: jest.fn(() => () => {}),
    canEdit: jest.fn(() => true),
    canComment: jest.fn(() => true),
    cleanup: jest.fn()
  }
}));

// Mock analytics service
jest.mock('../../../services/analyticsService', () => ({
  analyticsService: {
    trackUserAction: jest.fn(),
    trackError: jest.fn()
  }
}));

describe('useCollaboration', () => {
  const mockSession = {
    id: 'test-session-id',
    projectId: 'test-project-id',
    hostUserId: 'test-user-id',
    participants: [{
      userId: 'test-user-id',
      displayName: 'Test User',
      email: 'test@example.com',
      role: 'owner' as const,
      permissions: {
        canEdit: true,
        canComment: true,
        canShare: true,
        canDelete: true
      },
      status: 'online' as const,
      joinedAt: { seconds: Date.now() / 1000 } as any,
      lastActive: { seconds: Date.now() / 1000 } as any
    }],
    status: 'active' as const,
    settings: {
      allowEdit: true,
      allowComment: true,
      allowVoiceChat: false,
      maxParticipants: 10
    },
    startedAt: { seconds: Date.now() / 1000 } as any
  };

  let mockCollaborationServiceInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();
    const { CollaborationService } = require('../../../services/collaborationService');
    mockCollaborationServiceInstance = CollaborationService;
    mockCollaborationServiceInstance.canEdit.mockReturnValue(true);
    mockCollaborationServiceInstance.canComment.mockReturnValue(true);
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useCollaboration('test-project-id'));
    
    expect(result.current.isActive).toBe(false);
    expect(result.current.session).toBeNull();
    expect(result.current.participants).toEqual([]);
    expect(result.current.messages).toEqual([]);
    expect(result.current.edits).toEqual([]);
    expect(result.current.comments).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('creates collaboration session successfully', async () => {
    mockCollaborationServiceInstance.createSession.mockResolvedValue(mockSession);
    
    const { result } = renderHook(() => useCollaboration('test-project-id'));
    
    await act(async () => {
      await result.current.createSession('test-project-id', {
        allowEdit: true,
        allowComment: true,
        allowVoiceChat: false,
        maxParticipants: 10
      });
    });
    
    expect(mockCollaborationServiceInstance.createSession).toHaveBeenCalledWith(
      'test-project-id',
      'test-user-id',
      {
        allowEdit: true,
        allowComment: true,
        allowVoiceChat: false,
        maxParticipants: 10
      }
    );
    
    expect(result.current.isActive).toBe(true);
    expect(result.current.session).toEqual(mockSession);
    expect(result.current.participants).toEqual(mockSession.participants);
  });

  it('joins existing collaboration session', async () => {
    mockCollaborationServiceInstance.joinSession.mockResolvedValue(mockSession);
    
    const { result } = renderHook(() => useCollaboration('test-project-id'));
    
    await act(async () => {
      await result.current.joinSession('test-session-id');
    });
    
    expect(mockCollaborationServiceInstance.joinSession).toHaveBeenCalledWith('test-session-id', 'test-user-id');
    expect(result.current.isActive).toBe(true);
    expect(result.current.session).toEqual(mockSession);
  });

  it('leaves collaboration session', async () => {
    mockCollaborationServiceInstance.createSession.mockResolvedValue(mockSession);
    
    const { result } = renderHook(() => useCollaboration('test-project-id'));
    
    // First create a session
    await act(async () => {
      await result.current.createSession('test-project-id', mockSession.settings);
    });
    
    // Then leave it
    await act(async () => {
      await result.current.leaveSession();
    });
    
    expect(mockCollaborationServiceInstance.leaveSession).toHaveBeenCalledWith('test-session-id');
    expect(result.current.isActive).toBe(false);
    expect(result.current.session).toBeNull();
    expect(result.current.participants).toEqual([]);
  });

  it('sends messages in collaboration session', async () => {
    mockCollaborationServiceInstance.createSession.mockResolvedValue(mockSession);
    
    const { result } = renderHook(() => useCollaboration('test-project-id'));
    
    await act(async () => {
      await result.current.createSession('test-project-id', mockSession.settings);
    });
    
    await act(async () => {
      await result.current.sendMessage('Hello, world!');
    });
    
    expect(mockCollaborationServiceInstance.sendMessage).toHaveBeenCalledWith('test-session-id', 'Hello, world!', 'text');
  });

  it('sends edits in collaboration session', async () => {
    mockCollaborationServiceInstance.createSession.mockResolvedValue(mockSession);
    
    const { result } = renderHook(() => useCollaboration('test-project-id'));
    
    await act(async () => {
      await result.current.createSession('test-project-id', mockSession.settings);
    });
    
    await act(async () => {
      await result.current.sendEdit('insert', 10, 'New text');
    });
    
    expect(mockCollaborationServiceInstance.sendEdit).toHaveBeenCalledWith('test-session-id', 'insert', 10, 'New text');
  });

  it('adds comments', async () => {
    const mockComment = {
      id: 'comment-id',
      projectId: 'test-project-id',
      userId: 'test-user-id',
      content: 'Test comment',
      position: { start: 0, end: 10, selectedText: 'test' },
      thread: [],
      status: 'open' as const,
      createdAt: { seconds: Date.now() / 1000 } as any,
      updatedAt: { seconds: Date.now() / 1000 } as any
    };
    
    mockCollaborationServiceInstance.addComment.mockResolvedValue(mockComment);
    
    const { result } = renderHook(() => useCollaboration('test-project-id'));
    
    await act(async () => {
      await result.current.addComment('Test comment', {
        start: 0,
        end: 10,
        selectedText: 'test'
      });
    });
    
    expect(mockCollaborationServiceInstance.addComment).toHaveBeenCalledWith(
      'test-project-id',
      'test-user-id',
      'Test comment',
      { start: 0, end: 10, selectedText: 'test' }
    );
    
    expect(result.current.comments).toContain(mockComment);
  });

  it('updates cursor position', async () => {
    mockCollaborationServiceInstance.createSession.mockResolvedValue(mockSession);
    
    const { result } = renderHook(() => useCollaboration('test-project-id'));
    
    await act(async () => {
      await result.current.createSession('test-project-id', mockSession.settings);
    });
    
    await act(async () => {
      await result.current.updateCursor(100, 200, { start: 0, end: 10 });
    });
    
    expect(mockCollaborationServiceInstance.updateCursor).toHaveBeenCalledWith(
      'test-session-id',
      100,
      200,
      { start: 0, end: 10 }
    );
  });

  it('computes isHost correctly', async () => {
    mockCollaborationServiceInstance.createSession.mockResolvedValue(mockSession);
    
    const { result } = renderHook(() => useCollaboration('test-project-id'));
    
    await act(async () => {
      await result.current.createSession('test-project-id', mockSession.settings);
    });
    
    expect(result.current.isHost).toBe(true);
  });

  it('computes canEdit correctly', async () => {
    mockCollaborationServiceInstance.createSession.mockResolvedValue(mockSession);
    
    const { result } = renderHook(() => useCollaboration('test-project-id'));
    
    await act(async () => {
      await result.current.createSession('test-project-id', mockSession.settings);
    });
    
    expect(result.current.canEdit).toBe(true);
  });

  it('computes canComment correctly', async () => {
    mockCollaborationServiceInstance.createSession.mockResolvedValue(mockSession);
    
    const { result } = renderHook(() => useCollaboration('test-project-id'));
    
    await act(async () => {
      await result.current.createSession('test-project-id', mockSession.settings);
    });
    
    expect(result.current.canComment).toBe(true);
  });

  it('filters online participants correctly', async () => {
    const sessionWithMultipleParticipants = {
      ...mockSession,
      participants: [
        { ...mockSession.participants[0], status: 'online' as const },
        { ...mockSession.participants[0], userId: 'user2', status: 'offline' as const },
        { ...mockSession.participants[0], userId: 'user3', status: 'online' as const }
      ]
    };
    
    mockCollaborationServiceInstance.createSession.mockResolvedValue(sessionWithMultipleParticipants);
    
    const { result } = renderHook(() => useCollaboration('test-project-id'));
    
    await act(async () => {
      await result.current.createSession('test-project-id', mockSession.settings);
    });
    
    expect(result.current.onlineParticipants).toHaveLength(2);
    expect(result.current.onlineParticipants.every(p => p.status === 'online')).toBe(true);
  });

  it('provides utility functions for participant management', async () => {
    mockCollaborationServiceInstance.createSession.mockResolvedValue(mockSession);
    
    const { result } = renderHook(() => useCollaboration('test-project-id'));
    
    await act(async () => {
      await result.current.createSession('test-project-id', mockSession.settings);
    });
    
    const participant = result.current.getParticipantById('test-user-id');
    expect(participant).toEqual(mockSession.participants[0]);
    
    const isOnline = result.current.isParticipantOnline('test-user-id');
    expect(isOnline).toBe(true);
  });

  it('handles errors gracefully', async () => {
    const error = new Error('Connection failed');
    mockCollaborationServiceInstance.createSession.mockRejectedValue(error);
    
    const onError = jest.fn();
    const { result } = renderHook(() => 
      useCollaboration('test-project-id', { onError })
    );
    
    await act(async () => {
      await result.current.createSession('test-project-id', mockSession.settings);
    });
    
    expect(result.current.error).toBe('Connection failed');
    expect(onError).toHaveBeenCalledWith('CONNECTION_FAILED', 'Connection failed');
  });

  it('calls event handlers for collaboration events', async () => {
    const onParticipantJoined = jest.fn();
    const onMessageReceived = jest.fn();
    const onEditReceived = jest.fn();
    
    mockCollaborationServiceInstance.createSession.mockResolvedValue(mockSession);
    
    const { result } = renderHook(() => 
      useCollaboration('test-project-id', {
        onParticipantJoined,
        onMessageReceived,
        onEditReceived
      })
    );
    
    await act(async () => {
      await result.current.createSession('test-project-id', mockSession.settings);
    });
    
    expect(onParticipantJoined).toHaveBeenCalledWith(mockSession.participants[0]);
  });

  it('cleans up listeners on unmount', () => {
    const { unmount } = renderHook(() => useCollaboration('test-project-id'));
    
    unmount();
    
    expect(mockCollaborationServiceInstance.cleanup).toHaveBeenCalled();
  });

  it('handles authentication errors', async () => {
    // Mock service to reject with authentication error
    mockCollaborationServiceInstance.createSession.mockRejectedValue(
      new Error('User not authenticated')
    );
    
    const { result } = renderHook(() => useCollaboration('test-project-id'));
    
    await act(async () => {
      await result.current.createSession('test-project-id', mockSession.settings);
    });
    
    expect(result.current.error).toBe('User not authenticated');
  });
});
