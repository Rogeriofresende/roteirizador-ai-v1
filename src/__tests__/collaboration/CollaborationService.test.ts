/**
 * COLLABORATION SERVICE TESTS - SPRINT 4
 * Testing suite for real-time collaboration functionality
 * V7.5 Enhanced - IA Charlie Implementation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import CollaborationService, { 
  CollaborationSession, 
  CreateSessionRequest, 
  JoinSessionRequest 
} from '../../services/collaboration/CollaborationService';

// Mock WebSocket
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  readyState = MockWebSocket.OPEN;
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  constructor(url: string) {
    setTimeout(() => {
      if (this.onopen) {
        this.onopen(new Event('open'));
      }
    }, 0);
  }

  send(data: string) {
    // Mock send
  }

  close() {
    this.readyState = MockWebSocket.CLOSED;
    if (this.onclose) {
      this.onclose(new CloseEvent('close'));
    }
  }
}

// Mock global WebSocket
global.WebSocket = MockWebSocket as any;

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('CollaborationService', () => {
  let service: CollaborationService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockImplementation((key: string) => {
      if (key === 'userId') return 'user123';
      if (key === 'username') return 'TestUser';
      return null;
    });
    
    service = new CollaborationService();
  });

  afterEach(() => {
    service.disconnect();
  });

  describe('Session Management', () => {
    it('should create a new collaboration session', async () => {
      const request: CreateSessionRequest = {
        title: 'Test Session',
        initialIdea: 'Initial idea content',
        permissions: {
          canEdit: true,
          canComment: true,
          canShare: true,
          canInvite: true
        }
      };

      const session = await service.createSession(request);

      expect(session).toBeDefined();
      expect(session.title).toBe('Test Session');
      expect(session.currentIdea).toBe('Initial idea content');
      expect(session.createdBy).toBe('user123');
      expect(session.participants).toHaveLength(1);
      expect(session.participants[0].userId).toBe('user123');
      expect(session.participants[0].username).toBe('TestUser');
      expect(session.participants[0].role).toBe('owner');
      expect(session.status).toBe('active');
    });

    it('should join an existing session', async () => {
      // Create session first
      const createRequest: CreateSessionRequest = {
        title: 'Test Session',
        initialIdea: 'Initial idea'
      };
      const session = await service.createSession(createRequest);

      // Join session
      const joinRequest: JoinSessionRequest = {
        sessionId: session.id,
        userId: 'user456',
        username: 'SecondUser'
      };

      const joinedSession = await service.joinSession(joinRequest);

      expect(joinedSession).toBeDefined();
      expect(joinedSession.id).toBe(session.id);
      expect(joinedSession.participants).toHaveLength(2);
      
      const newParticipant = joinedSession.participants.find(p => p.userId === 'user456');
      expect(newParticipant).toBeDefined();
      expect(newParticipant?.username).toBe('SecondUser');
      expect(newParticipant?.role).toBe('editor');
      expect(newParticipant?.status).toBe('online');
    });

    it('should handle joining non-existent session', async () => {
      const joinRequest: JoinSessionRequest = {
        sessionId: 'nonexistent',
        userId: 'user456',
        username: 'SecondUser'
      };

      await expect(service.joinSession(joinRequest)).rejects.toThrow('Session not found');
    });

    it('should leave a session', async () => {
      // Create and join session
      const createRequest: CreateSessionRequest = {
        title: 'Test Session',
        initialIdea: 'Initial idea'
      };
      const session = await service.createSession(createRequest);

      const joinRequest: JoinSessionRequest = {
        sessionId: session.id,
        userId: 'user456',
        username: 'SecondUser'
      };
      await service.joinSession(joinRequest);

      // Leave session
      await service.leaveSession(session.id, 'user456');

      const updatedSession = service.getSession(session.id);
      expect(updatedSession).toBeDefined();
      
      const participant = updatedSession?.participants.find(p => p.userId === 'user456');
      expect(participant?.status).toBe('offline');
    });
  });

  describe('Idea Management', () => {
    it('should update idea in session', async () => {
      const createRequest: CreateSessionRequest = {
        title: 'Test Session',
        initialIdea: 'Initial idea'
      };
      const session = await service.createSession(createRequest);

      const newIdea = 'Updated idea content';
      await service.updateIdeaInSession(session.id, 'user123', newIdea);

      const updatedSession = service.getSession(session.id);
      expect(updatedSession?.currentIdea).toBe(newIdea);
    });

    it('should reject idea update with insufficient permissions', async () => {
      const createRequest: CreateSessionRequest = {
        title: 'Test Session',
        initialIdea: 'Initial idea'
      };
      const session = await service.createSession(createRequest);

      // Join as viewer
      const joinRequest: JoinSessionRequest = {
        sessionId: session.id,
        userId: 'user456',
        username: 'ViewerUser'
      };
      await service.joinSession(joinRequest);

      // Manually set role to viewer
      const updatedSession = service.getSession(session.id);
      if (updatedSession) {
        const participant = updatedSession.participants.find(p => p.userId === 'user456');
        if (participant) {
          participant.role = 'viewer';
        }
      }

      await expect(
        service.updateIdeaInSession(session.id, 'user456', 'New idea')
      ).rejects.toThrow('Insufficient permissions to edit');
    });

    it('should handle idea update in non-existent session', async () => {
      await expect(
        service.updateIdeaInSession('nonexistent', 'user123', 'New idea')
      ).rejects.toThrow('Session not found');
    });
  });

  describe('Cursor Management', () => {
    it('should update cursor position', async () => {
      const createRequest: CreateSessionRequest = {
        title: 'Test Session',
        initialIdea: 'Initial idea'
      };
      const session = await service.createSession(createRequest);

      const cursor = {
        x: 100,
        y: 200,
        color: '#FF0000',
        elementId: 'textarea'
      };

      service.updateCursorPosition(session.id, 'user123', cursor);

      const updatedSession = service.getSession(session.id);
      const participant = updatedSession?.participants.find(p => p.userId === 'user123');
      expect(participant?.cursor).toEqual(cursor);
    });

    it('should handle cursor update in non-existent session', () => {
      const cursor = {
        x: 100,
        y: 200,
        color: '#FF0000'
      };

      // Should not throw error
      service.updateCursorPosition('nonexistent', 'user123', cursor);
    });
  });

  describe('Session Queries', () => {
    it('should get user sessions', async () => {
      const createRequest: CreateSessionRequest = {
        title: 'Test Session',
        initialIdea: 'Initial idea'
      };
      const session = await service.createSession(createRequest);

      const userSessions = service.getUserSessions('user123');
      expect(userSessions).toHaveLength(1);
      expect(userSessions[0].id).toBe(session.id);
    });

    it('should get session by ID', async () => {
      const createRequest: CreateSessionRequest = {
        title: 'Test Session',
        initialIdea: 'Initial idea'
      };
      const session = await service.createSession(createRequest);

      const retrievedSession = service.getSession(session.id);
      expect(retrievedSession).toBeDefined();
      expect(retrievedSession?.id).toBe(session.id);
    });

    it('should return undefined for non-existent session', () => {
      const session = service.getSession('nonexistent');
      expect(session).toBeUndefined();
    });
  });

  describe('Event Handling', () => {
    it('should emit sessionCreated event', async () => {
      const eventSpy = vi.fn();
      service.on('sessionCreated', eventSpy);

      const createRequest: CreateSessionRequest = {
        title: 'Test Session',
        initialIdea: 'Initial idea'
      };
      const session = await service.createSession(createRequest);

      expect(eventSpy).toHaveBeenCalledWith(session);
    });

    it('should emit userJoined event', async () => {
      const eventSpy = vi.fn();
      service.on('userJoined', eventSpy);

      const createRequest: CreateSessionRequest = {
        title: 'Test Session',
        initialIdea: 'Initial idea'
      };
      const session = await service.createSession(createRequest);

      const joinRequest: JoinSessionRequest = {
        sessionId: session.id,
        userId: 'user456',
        username: 'SecondUser'
      };
      await service.joinSession(joinRequest);

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          session: expect.any(Object),
          userId: 'user456'
        })
      );
    });

    it('should emit ideaUpdated event', async () => {
      const eventSpy = vi.fn();
      service.on('ideaUpdated', eventSpy);

      const createRequest: CreateSessionRequest = {
        title: 'Test Session',
        initialIdea: 'Initial idea'
      };
      const session = await service.createSession(createRequest);

      const newIdea = 'Updated idea';
      await service.updateIdeaInSession(session.id, 'user123', newIdea);

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          session: expect.any(Object),
          userId: 'user123',
          newIdea
        })
      );
    });
  });

  describe('WebSocket Integration', () => {
    it('should connect to WebSocket on initialization', (done) => {
      service.on('connected', () => {
        done();
      });
    });

    it('should handle WebSocket disconnection', (done) => {
      service.on('disconnected', () => {
        done();
      });

      // Simulate disconnect
      const ws = (service as any).websocket as MockWebSocket;
      ws.close();
    });

    it('should handle WebSocket errors', (done) => {
      service.on('error', (error) => {
        expect(error).toBeDefined();
        done();
      });

      // Simulate error
      const ws = (service as any).websocket as MockWebSocket;
      if (ws.onerror) {
        ws.onerror(new Event('error'));
      }
    });
  });

  describe('Cleanup', () => {
    it('should disconnect cleanly', () => {
      expect(() => service.disconnect()).not.toThrow();
    });

    it('should remove all event listeners on disconnect', () => {
      const eventSpy = vi.fn();
      service.on('connected', eventSpy);
      
      service.disconnect();
      
      // Should not have any listeners
      expect(service.listenerCount('connected')).toBe(0);
    });
  });
});

describe('CollaborationService Integration', () => {
  let service1: CollaborationService;
  let service2: CollaborationService;

  beforeEach(() => {
    service1 = new CollaborationService();
    service2 = new CollaborationService();
  });

  afterEach(() => {
    service1.disconnect();
    service2.disconnect();
  });

  it('should handle multiple users in same session', async () => {
    // User 1 creates session
    mockLocalStorage.getItem.mockImplementation((key: string) => {
      if (key === 'userId') return 'user1';
      if (key === 'username') return 'User1';
      return null;
    });

    const createRequest: CreateSessionRequest = {
      title: 'Multi-user Session',
      initialIdea: 'Initial idea'
    };
    const session = await service1.createSession(createRequest);

    // User 2 joins session
    mockLocalStorage.getItem.mockImplementation((key: string) => {
      if (key === 'userId') return 'user2';
      if (key === 'username') return 'User2';
      return null;
    });

    const joinRequest: JoinSessionRequest = {
      sessionId: session.id,
      userId: 'user2',
      username: 'User2'
    };
    const joinedSession = await service2.joinSession(joinRequest);

    expect(joinedSession.participants).toHaveLength(2);
    expect(joinedSession.participants.map(p => p.userId)).toContain('user1');
    expect(joinedSession.participants.map(p => p.userId)).toContain('user2');
  });

  it('should synchronize idea updates across users', async () => {
    // Create session with user 1
    mockLocalStorage.getItem.mockImplementation((key: string) => {
      if (key === 'userId') return 'user1';
      if (key === 'username') return 'User1';
      return null;
    });

    const createRequest: CreateSessionRequest = {
      title: 'Sync Session',
      initialIdea: 'Initial idea'
    };
    const session = await service1.createSession(createRequest);

    // User 2 joins
    const joinRequest: JoinSessionRequest = {
      sessionId: session.id,
      userId: 'user2',
      username: 'User2'
    };
    await service2.joinSession(joinRequest);

    // User 1 updates idea
    const newIdea = 'Updated by user 1';
    await service1.updateIdeaInSession(session.id, 'user1', newIdea);

    // Both services should have the updated idea
    const session1 = service1.getSession(session.id);
    const session2 = service2.getSession(session.id);

    expect(session1?.currentIdea).toBe(newIdea);
    expect(session2?.currentIdea).toBe(newIdea);
  });
});

describe('CollaborationService Performance', () => {
  it('should handle large number of sessions efficiently', async () => {
    const service = new CollaborationService();
    const startTime = Date.now();
    
    // Create 100 sessions
    const promises = [];
    for (let i = 0; i < 100; i++) {
      promises.push(service.createSession({
        title: `Session ${i}`,
        initialIdea: `Idea ${i}`
      }));
    }
    
    await Promise.all(promises);
    const endTime = Date.now();
    
    expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    
    service.disconnect();
  });

  it('should handle concurrent idea updates', async () => {
    const service = new CollaborationService();
    
    const session = await service.createSession({
      title: 'Concurrent Session',
      initialIdea: 'Initial'
    });
    
    // Simulate concurrent updates
    const updates = [];
    for (let i = 0; i < 10; i++) {
      updates.push(service.updateIdeaInSession(session.id, 'user123', `Update ${i}`));
    }
    
    await Promise.all(updates);
    
    const finalSession = service.getSession(session.id);
    expect(finalSession?.currentIdea).toMatch(/Update \d/);
    
    service.disconnect();
  });
}); 