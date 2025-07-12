// Infrastructure Layer - Collaboration Repository Implementation
// Concrete repository for Collaboration entities using Firestore

import { DocumentData, Timestamp } from 'firebase/firestore';
import { FirestoreRepository, QueryOptions } from './FirestoreRepository';
import { createLogger } from '../../utils/logger';

const logger = createLogger('CollaborationRepository');

export interface CollaborationSession {
  id?: string;
  projectId: string;
  hostId: string;
  title: string;
  description?: string;
  type: 'brainstorming' | 'script_editing' | 'template_creation' | 'review' | 'general';
  status: 'waiting' | 'active' | 'paused' | 'ended';
  settings: {
    maxParticipants: number;
    requirePermission: boolean;
    allowAnonymous: boolean;
    recordSession: boolean;
    enableChat: boolean;
    enableVoice: boolean;
    enableScreenShare: boolean;
  };
  participants: {
    userId: string;
    displayName: string;
    role: 'host' | 'moderator' | 'participant' | 'observer';
    status: 'online' | 'away' | 'offline';
    permissions: {
      canEdit: boolean;
      canComment: boolean;
      canInvite: boolean;
      canModerate: boolean;
    };
    joinedAt: Timestamp;
    lastActiveAt: Timestamp;
    connectionId?: string;
  }[];
  content: {
    currentScript?: string;
    currentTemplate?: string;
    sharedResources: {
      id: string;
      type: 'document' | 'image' | 'link' | 'note';
      title: string;
      content: string;
      sharedBy: string;
      sharedAt: Timestamp;
    }[];
    chatMessages: {
      id: string;
      userId: string;
      displayName: string;
      message: string;
      timestamp: Timestamp;
      type: 'text' | 'system' | 'file' | 'reaction';
      replyTo?: string;
    }[];
    changes: {
      id: string;
      userId: string;
      type: 'text_edit' | 'structure_change' | 'comment' | 'suggestion';
      target: string; // field or element being changed
      before: string;
      after: string;
      timestamp: Timestamp;
      approved: boolean;
      approvedBy?: string;
    }[];
  };
  recording?: {
    isRecording: boolean;
    startedAt?: Timestamp;
    endedAt?: Timestamp;
    recordingUrl?: string;
    recordingSize?: number;
  };
  analytics: {
    totalParticipants: number;
    peakParticipants: number;
    totalMessages: number;
    totalChanges: number;
    duration: number; // in seconds
    engagementScore: number;
  };
  metadata: {
    createdAt: Timestamp;
    updatedAt: Timestamp;
    startedAt?: Timestamp;
    endedAt?: Timestamp;
    scheduledFor?: Timestamp;
    timezone: string;
    tags: string[];
  };
}

export interface CollaborationFilters {
  projectId?: string;
  hostId?: string;
  userId?: string; // User is host or participant
  type?: string;
  status?: 'waiting' | 'active' | 'paused' | 'ended';
  createdAfter?: Date;
  scheduledAfter?: Date;
  isActive?: boolean;
  hasRecording?: boolean;
}

export interface CollaborationStats {
  totalSessions: number;
  activeSessions: number;
  endedSessions: number;
  sessionsByType: Record<string, number>;
  sessionsByStatus: Record<string, number>;
  totalParticipants: number;
  averageParticipants: number;
  averageDuration: number;
  totalMessages: number;
  totalChanges: number;
  sessionsCreatedToday: number;
  sessionsCreatedThisWeek: number;
  sessionsCreatedThisMonth: number;
}

export class CollaborationRepository extends FirestoreRepository<CollaborationSession> {
  constructor() {
    super({
      collectionName: 'collaboration_sessions',
      enableLogging: true,
      enableCache: true
    });
  }

  /**
   * Map Firestore document to CollaborationSession entity
   */
  protected mapToEntity(data: DocumentData): CollaborationSession {
    return {
      projectId: data.projectId,
      hostId: data.hostId,
      title: data.title,
      description: data.description,
      type: data.type || 'general',
      status: data.status || 'waiting',
      settings: {
        maxParticipants: data.settings?.maxParticipants || 10,
        requirePermission: data.settings?.requirePermission ?? false,
        allowAnonymous: data.settings?.allowAnonymous ?? false,
        recordSession: data.settings?.recordSession ?? false,
        enableChat: data.settings?.enableChat ?? true,
        enableVoice: data.settings?.enableVoice ?? false,
        enableScreenShare: data.settings?.enableScreenShare ?? false
      },
      participants: data.participants || [],
      content: {
        currentScript: data.content?.currentScript,
        currentTemplate: data.content?.currentTemplate,
        sharedResources: data.content?.sharedResources || [],
        chatMessages: data.content?.chatMessages || [],
        changes: data.content?.changes || []
      },
      recording: data.recording,
      analytics: {
        totalParticipants: data.analytics?.totalParticipants || 0,
        peakParticipants: data.analytics?.peakParticipants || 0,
        totalMessages: data.analytics?.totalMessages || 0,
        totalChanges: data.analytics?.totalChanges || 0,
        duration: data.analytics?.duration || 0,
        engagementScore: data.analytics?.engagementScore || 0
      },
      metadata: {
        createdAt: data.metadata?.createdAt || data.createdAt || Timestamp.now(),
        updatedAt: data.metadata?.updatedAt || data.updatedAt || Timestamp.now(),
        startedAt: data.metadata?.startedAt,
        endedAt: data.metadata?.endedAt,
        scheduledFor: data.metadata?.scheduledFor,
        timezone: data.metadata?.timezone || 'UTC',
        tags: data.metadata?.tags || []
      }
    };
  }

  /**
   * Map CollaborationSession entity to Firestore document
   */
  protected mapFromEntity(entity: CollaborationSession): DocumentData {
    return {
      projectId: entity.projectId,
      hostId: entity.hostId,
      title: entity.title,
      description: entity.description,
      type: entity.type,
      status: entity.status,
      settings: entity.settings,
      participants: entity.participants,
      content: entity.content,
      recording: entity.recording,
      analytics: entity.analytics,
      metadata: entity.metadata
    };
  }

  /**
   * Find active session by project ID
   */
  async findActiveByProject(projectId: string): Promise<CollaborationSession | null> {
    try {
      const sessions = await this.find({
        where: [
          { field: 'projectId', operator: '==', value: projectId },
          { field: 'status', operator: '==', value: 'active' }
        ],
        limit: 1
      });

      return sessions.length > 0 ? sessions[0] : null;
    } catch (error) {
      this.logger.error(`Error finding active session for project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Find sessions by host ID
   */
  async findByHostId(hostId: string, limit = 20): Promise<CollaborationSession[]> {
    try {
      return await this.find({
        where: [{ field: 'hostId', operator: '==', value: hostId }],
        orderBy: [{ field: 'metadata.createdAt', direction: 'desc' }],
        limit
      });
    } catch (error) {
      this.logger.error(`Error finding sessions for host ${hostId}:`, error);
      throw error;
    }
  }

  /**
   * Find sessions by user (host or participant)
   */
  async findByUser(userId: string, limit = 20): Promise<CollaborationSession[]> {
    try {
      // Get sessions where user is host
      const hostedSessions = await this.find({
        where: [{ field: 'hostId', operator: '==', value: userId }],
        orderBy: [{ field: 'metadata.createdAt', direction: 'desc' }],
        limit
      });

      // Get sessions where user is participant
      const participatedSessions = await this.find({
        where: [{ field: 'participants', operator: 'array-contains', value: { userId } }],
        orderBy: [{ field: 'metadata.createdAt', direction: 'desc' }],
        limit
      });

      // Combine and deduplicate
      const allSessions = [...hostedSessions];
      participatedSessions.forEach(session => {
        if (!allSessions.find(s => s.id === session.id)) {
          allSessions.push(session);
        }
      });

      // Sort by created date and limit
      return allSessions
        .sort((a, b) => b.metadata.createdAt.toMillis() - a.metadata.createdAt.toMillis())
        .slice(0, limit);
    } catch (error) {
      this.logger.error(`Error finding sessions for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Find active sessions
   */
  async findActiveSessions(limit = 20): Promise<CollaborationSession[]> {
    try {
      return await this.find({
        where: [{ field: 'status', operator: '==', value: 'active' }],
        orderBy: [{ field: 'metadata.startedAt', direction: 'desc' }],
        limit
      });
    } catch (error) {
      this.logger.error('Error finding active sessions:', error);
      throw error;
    }
  }

  /**
   * Add participant to session
   */
  async addParticipant(sessionId: string, participant: {
    userId: string;
    displayName: string;
    role?: 'moderator' | 'participant' | 'observer';
  }): Promise<CollaborationSession> {
    try {
      const session = await this.getById(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // Check if user is already a participant
      if (session.participants.some(p => p.userId === participant.userId)) {
        throw new Error('User is already a participant');
      }

      // Check max participants limit
      if (session.participants.length >= session.settings.maxParticipants) {
        throw new Error('Maximum number of participants reached');
      }

      const newParticipant = {
        userId: participant.userId,
        displayName: participant.displayName,
        role: participant.role || 'participant',
        status: 'online' as const,
        permissions: this.getPermissionsForRole(participant.role || 'participant'),
        joinedAt: Timestamp.now(),
        lastActiveAt: Timestamp.now()
      };

      const updatedParticipants = [...session.participants, newParticipant];

      return await this.update(sessionId, {
        participants: updatedParticipants,
        'analytics.totalParticipants': Math.max(session.analytics.totalParticipants, updatedParticipants.length),
        'analytics.peakParticipants': Math.max(session.analytics.peakParticipants, updatedParticipants.length),
        'metadata.updatedAt': Timestamp.now()
      } as Partial<CollaborationSession>);
    } catch (error) {
      this.logger.error(`Error adding participant to session ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Remove participant from session
   */
  async removeParticipant(sessionId: string, userId: string): Promise<CollaborationSession> {
    try {
      const session = await this.getById(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      const updatedParticipants = session.participants.filter(p => p.userId !== userId);

      return await this.update(sessionId, {
        participants: updatedParticipants,
        'metadata.updatedAt': Timestamp.now()
      } as Partial<CollaborationSession>);
    } catch (error) {
      this.logger.error(`Error removing participant from session ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Update participant status
   */
  async updateParticipantStatus(sessionId: string, userId: string, status: 'online' | 'away' | 'offline'): Promise<CollaborationSession> {
    try {
      const session = await this.getById(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      const updatedParticipants = session.participants.map(p => {
        if (p.userId === userId) {
          return {
            ...p,
            status,
            lastActiveAt: Timestamp.now()
          };
        }
        return p;
      });

      return await this.update(sessionId, {
        participants: updatedParticipants,
        'metadata.updatedAt': Timestamp.now()
      } as Partial<CollaborationSession>);
    } catch (error) {
      this.logger.error(`Error updating participant status for session ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Transfer session ownership
   */
  async transferOwnership(sessionId: string, newHostId: string): Promise<CollaborationSession> {
    try {
      const session = await this.getById(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // Check if new host is a participant
      const newHost = session.participants.find(p => p.userId === newHostId);
      if (!newHost) {
        throw new Error('New host must be a participant');
      }

      // Update participants - old host becomes moderator, new host becomes host
      const updatedParticipants = session.participants.map(p => {
        if (p.userId === session.hostId) {
          return {
            ...p,
            role: 'moderator' as const,
            permissions: this.getPermissionsForRole('moderator')
          };
        }
        if (p.userId === newHostId) {
          return {
            ...p,
            role: 'host' as const,
            permissions: this.getPermissionsForRole('host')
          };
        }
        return p;
      });

      return await this.update(sessionId, {
        hostId: newHostId,
        participants: updatedParticipants,
        'metadata.updatedAt': Timestamp.now()
      } as Partial<CollaborationSession>);
    } catch (error) {
      this.logger.error(`Error transferring ownership for session ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Add chat message
   */
  async addChatMessage(sessionId: string, message: {
    userId: string;
    displayName: string;
    message: string;
    type?: 'text' | 'system' | 'file' | 'reaction';
    replyTo?: string;
  }): Promise<CollaborationSession> {
    try {
      const session = await this.getById(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      if (!session.settings.enableChat) {
        throw new Error('Chat is disabled for this session');
      }

      const newMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: message.userId,
        displayName: message.displayName,
        message: message.message,
        timestamp: Timestamp.now(),
        type: message.type || 'text',
        replyTo: message.replyTo
      };

      const updatedMessages = [...session.content.chatMessages, newMessage];

      return await this.update(sessionId, {
        'content.chatMessages': updatedMessages,
        'analytics.totalMessages': updatedMessages.length,
        'metadata.updatedAt': Timestamp.now()
      } as Partial<CollaborationSession>);
    } catch (error) {
      this.logger.error(`Error adding chat message to session ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Add content change
   */
  async addContentChange(sessionId: string, change: {
    userId: string;
    type: 'text_edit' | 'structure_change' | 'comment' | 'suggestion';
    target: string;
    before: string;
    after: string;
  }): Promise<CollaborationSession> {
    try {
      const session = await this.getById(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      const newChange = {
        id: `change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: change.userId,
        type: change.type,
        target: change.target,
        before: change.before,
        after: change.after,
        timestamp: Timestamp.now(),
        approved: false
      };

      const updatedChanges = [...session.content.changes, newChange];

      return await this.update(sessionId, {
        'content.changes': updatedChanges,
        'analytics.totalChanges': updatedChanges.length,
        'metadata.updatedAt': Timestamp.now()
      } as Partial<CollaborationSession>);
    } catch (error) {
      this.logger.error(`Error adding content change to session ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Start session
   */
  async startSession(sessionId: string): Promise<CollaborationSession> {
    try {
      return await this.update(sessionId, {
        status: 'active',
        'metadata.startedAt': Timestamp.now(),
        'metadata.updatedAt': Timestamp.now()
      } as Partial<CollaborationSession>);
    } catch (error) {
      this.logger.error(`Error starting session ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * End session
   */
  async endSession(sessionId: string): Promise<CollaborationSession> {
    try {
      const session = await this.getById(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      const endTime = Timestamp.now();
      const duration = session.metadata.startedAt 
        ? endTime.toMillis() - session.metadata.startedAt.toMillis()
        : 0;

      return await this.update(sessionId, {
        status: 'ended',
        'analytics.duration': Math.floor(duration / 1000), // Convert to seconds
        'metadata.endedAt': endTime,
        'metadata.updatedAt': endTime
      } as Partial<CollaborationSession>);
    } catch (error) {
      this.logger.error(`Error ending session ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Get collaboration statistics
   */
  async getCollaborationStats(userId?: string): Promise<CollaborationStats> {
    try {
      const query: QueryOptions = {
        where: userId ? [{ field: 'hostId', operator: '==', value: userId }] : []
      };

      const sessions = await this.find(query);
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      const stats: CollaborationStats = {
        totalSessions: sessions.length,
        activeSessions: sessions.filter(s => s.status === 'active').length,
        endedSessions: sessions.filter(s => s.status === 'ended').length,
        sessionsByType: {},
        sessionsByStatus: {},
        totalParticipants: 0,
        averageParticipants: 0,
        averageDuration: 0,
        totalMessages: 0,
        totalChanges: 0,
        sessionsCreatedToday: 0,
        sessionsCreatedThisWeek: 0,
        sessionsCreatedThisMonth: 0
      };

      let totalDuration = 0;

      sessions.forEach(session => {
        // Count by type and status
        stats.sessionsByType[session.type] = (stats.sessionsByType[session.type] || 0) + 1;
        stats.sessionsByStatus[session.status] = (stats.sessionsByStatus[session.status] || 0) + 1;

        // Sum analytics
        stats.totalParticipants += session.analytics.totalParticipants;
        stats.totalMessages += session.analytics.totalMessages;
        stats.totalChanges += session.analytics.totalChanges;
        totalDuration += session.analytics.duration;

        // Count new sessions
        const createdAt = session.metadata.createdAt.toDate();
        if (createdAt >= today) stats.sessionsCreatedToday++;
        if (createdAt >= weekAgo) stats.sessionsCreatedThisWeek++;
        if (createdAt >= monthAgo) stats.sessionsCreatedThisMonth++;
      });

      // Calculate averages
      stats.averageParticipants = sessions.length > 0 ? stats.totalParticipants / sessions.length : 0;
      stats.averageDuration = sessions.length > 0 ? totalDuration / sessions.length : 0;

      return stats;
    } catch (error) {
      this.logger.error('Error getting collaboration stats:', error);
      throw error;
    }
  }

  /**
   * Get permissions for role
   */
  private getPermissionsForRole(role: 'host' | 'moderator' | 'participant' | 'observer') {
    switch (role) {
      case 'host':
        return {
          canEdit: true,
          canComment: true,
          canInvite: true,
          canModerate: true
        };
      case 'moderator':
        return {
          canEdit: true,
          canComment: true,
          canInvite: true,
          canModerate: true
        };
      case 'participant':
        return {
          canEdit: true,
          canComment: true,
          canInvite: false,
          canModerate: false
        };
      case 'observer':
      default:
        return {
          canEdit: false,
          canComment: true,
          canInvite: false,
          canModerate: false
        };
    }
  }
} 