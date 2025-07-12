// CollaborateOnProjectUseCase - Clean Architecture V6.4
// Use Case para gerenciamento de colaboração em tempo real

import { 
  CreateCollaborationSessionDTO, 
  JoinCollaborationSessionDTO,
  CollaborationSessionResponseDTO, 
  ValidationResult, 
  ApiResponse 
} from '../dto';

import {
  ICollaborationRepository,
  IProjectRepository,
  IUserRepository,
  IRealtimeService,
  IAnalyticsService,
  INotificationService,
  ILogger,
  CollaborationSessionEntity,
  ProjectEntity,
  UserEntity
} from '../interfaces';

// Interface para o Use Case
export interface ICollaborateOnProjectUseCase {
  createSession(input: CreateCollaborationSessionDTO): Promise<ApiResponse<CollaborationSessionResponseDTO>>;
  joinSession(input: JoinCollaborationSessionDTO): Promise<ApiResponse<CollaborationSessionResponseDTO>>;
  leaveSession(sessionId: string, userId: string): Promise<ApiResponse<CollaborationSessionResponseDTO>>;
  endSession(sessionId: string, hostUserId: string): Promise<ApiResponse<CollaborationSessionResponseDTO>>;
  getActiveSession(projectId: string): Promise<ApiResponse<CollaborationSessionResponseDTO | null>>;
  validateSessionInput(input: CreateCollaborationSessionDTO): ValidationResult;
}

// Implementação do Use Case
export class CollaborateOnProjectUseCase implements ICollaborateOnProjectUseCase {
  constructor(
    private readonly collaborationRepository: ICollaborationRepository,
    private readonly projectRepository: IProjectRepository,
    private readonly userRepository: IUserRepository,
    private readonly realtimeService: IRealtimeService,
    private readonly analyticsService: IAnalyticsService,
    private readonly notificationService: INotificationService,
    private readonly logger: ILogger
  ) {}

  async createSession(input: CreateCollaborationSessionDTO): Promise<ApiResponse<CollaborationSessionResponseDTO>> {
    const requestId = this.generateRequestId();
    const timestamp = new Date().toISOString();

    try {
      // 1. Validate input
      const validation = this.validateSessionInput(input);
      if (!validation.isValid) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Session input validation failed',
            details: validation.errors
          },
          metadata: { timestamp, version: '6.4', requestId }
        };
      }

      // 2. Verify project exists and user has permission
      const project = await this.projectRepository.findById(input.projectId);
      if (!project) {
        return {
          success: false,
          error: {
            code: 'PROJECT_NOT_FOUND',
            message: 'Project not found',
            details: { projectId: input.projectId }
          },
          metadata: { timestamp, version: '6.4', requestId }
        };
      }

      // 3. Check if user owns project or has collaboration rights
      if (project.userId !== input.hostUserId) {
        const hasCollabRights = await this.projectRepository.hasCollaborationRights(
          input.projectId, 
          input.hostUserId
        );
        if (!hasCollabRights) {
          return {
            success: false,
            error: {
              code: 'INSUFFICIENT_PERMISSIONS',
              message: 'User does not have permission to start collaboration on this project',
              details: { projectId: input.projectId, userId: input.hostUserId }
            },
            metadata: { timestamp, version: '6.4', requestId }
          };
        }
      }

      // 4. Check for existing active session
      const existingSession = await this.collaborationRepository.findActiveByProject(input.projectId);
      if (existingSession) {
        return {
          success: false,
          error: {
            code: 'SESSION_ALREADY_ACTIVE',
            message: 'An active collaboration session already exists for this project',
            details: { 
              projectId: input.projectId, 
              existingSessionId: existingSession.id 
            }
          },
          metadata: { timestamp, version: '6.4', requestId }
        };
      }

      // 5. Get host user information
      const hostUser = await this.userRepository.findById(input.hostUserId);
      if (!hostUser) {
        return {
          success: false,
          error: {
            code: 'HOST_USER_NOT_FOUND',
            message: 'Host user not found',
            details: { hostUserId: input.hostUserId }
          },
          metadata: { timestamp, version: '6.4', requestId }
        };
      }

      // 6. Create collaboration session
      const session = {
        id: this.generateSessionId(),
        projectId: input.projectId,
        hostUserId: input.hostUserId,
        participants: [{
          userId: input.hostUserId,
          displayName: hostUser.displayName,
          email: hostUser.email,
          role: 'owner' as const,
          permissions: {
            canEdit: true,
            canComment: true,
            canShare: true,
            canDelete: true
          },
          status: 'online' as const,
          joinedAt: new Date(),
          lastActive: new Date()
        }],
        status: 'active' as const,
        settings: input.settings,
        startedAt: new Date(),
        metadata: {
          projectTitle: project.title,
          inviteCode: this.generateInviteCode()
        }
      };

      // 7. Save session to repository
      const savedSession = await this.collaborationRepository.create(session);

      // 8. Initialize real-time session
      await this.realtimeService.createRoom(savedSession.id, {
        projectId: input.projectId,
        hostUserId: input.hostUserId,
        settings: input.settings
      });

      // 9. Track session creation
      await this.analyticsService.trackEvent({
        type: 'collaboration_session_created',
        userId: input.hostUserId,
        metadata: {
          sessionId: savedSession.id,
          projectId: input.projectId,
          settings: input.settings,
          maxParticipants: input.settings.maxParticipants
        }
      });

      // 10. Return response
      const response: CollaborationSessionResponseDTO = {
        id: savedSession.id,
        projectId: savedSession.projectId,
        hostUserId: savedSession.hostUserId,
        participants: savedSession.participants.map(p => ({
          userId: p.userId,
          displayName: p.displayName,
          email: p.email,
          role: p.role,
          status: p.status,
          joinedAt: p.joinedAt.toISOString()
        })),
        status: savedSession.status,
        startedAt: savedSession.startedAt.toISOString()
      };

      return {
        success: true,
        data: response,
        metadata: { timestamp, version: '6.4', requestId }
      };

    } catch (error) {
      console.error('CollaborateOnProjectUseCase createSession failed:', error);
      
      return {
        success: false,
        error: {
          code: 'SESSION_CREATION_ERROR',
          message: 'Failed to create collaboration session',
          details: error.message
        },
        metadata: { timestamp, version: '6.4', requestId }
      };
    }
  }

  async joinSession(input: JoinCollaborationSessionDTO): Promise<ApiResponse<CollaborationSessionResponseDTO>> {
    const requestId = this.generateRequestId();
    const timestamp = new Date().toISOString();

    try {
      // 1. Find active session
      const session = await this.collaborationRepository.findById(input.sessionId);
      if (!session || session.status !== 'active') {
        return {
          success: false,
          error: {
            code: 'SESSION_NOT_FOUND',
            message: 'Active collaboration session not found',
            details: { sessionId: input.sessionId }
          },
          metadata: { timestamp, version: '6.4', requestId }
        };
      }

      // 2. Check if user is already in session
      const existingParticipant = session.participants.find(p => p.userId === input.userId);
      if (existingParticipant) {
        // Update participant status to online
        await this.collaborationRepository.updateParticipantStatus(
          input.sessionId, 
          input.userId, 
          'online'
        );
        
        const updatedSession = await this.collaborationRepository.findById(input.sessionId);
        const response: CollaborationSessionResponseDTO = {
          id: updatedSession.id,
          projectId: updatedSession.projectId,
          hostUserId: updatedSession.hostUserId,
          participants: updatedSession.participants.map(p => ({
            userId: p.userId,
            displayName: p.displayName,
            email: p.email,
            role: p.role,
            status: p.status,
            joinedAt: p.joinedAt.toISOString()
          })),
          status: updatedSession.status,
          startedAt: updatedSession.startedAt.toISOString(),
          duration: updatedSession.duration
        };

        return {
          success: true,
          data: response,
          metadata: { timestamp, version: '6.4', requestId, rejoined: true }
        };
      }

      // 3. Check session capacity
      if (session.participants.length >= session.settings.maxParticipants) {
        return {
          success: false,
          error: {
            code: 'SESSION_FULL',
            message: 'Collaboration session is full',
            details: { 
              sessionId: input.sessionId, 
              currentParticipants: session.participants.length,
              maxParticipants: session.settings.maxParticipants 
            }
          },
          metadata: { timestamp, version: '6.4', requestId }
        };
      }

      // 4. Verify user exists
      const user = await this.userRepository.findById(input.userId);
      if (!user) {
        return {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
            details: { userId: input.userId }
          },
          metadata: { timestamp, version: '6.4', requestId }
        };
      }

      // 5. Add participant to session
      const newParticipant = {
        userId: input.userId,
        displayName: input.displayName || user.displayName,
        email: input.email || user.email,
        role: 'editor' as const,
        permissions: {
          canEdit: session.settings.allowEdit,
          canComment: session.settings.allowComment,
          canShare: false,
          canDelete: false
        },
        status: 'online' as const,
        joinedAt: new Date(),
        lastActive: new Date()
      };

      const updatedSession = await this.collaborationRepository.addParticipant(
        input.sessionId, 
        newParticipant
      );

      // 6. Join real-time room
      await this.realtimeService.joinRoom(input.sessionId, input.userId, {
        displayName: newParticipant.displayName,
        role: newParticipant.role,
        permissions: newParticipant.permissions
      });

      // 7. Notify other participants
      await this.notificationService.broadcastToSession(input.sessionId, {
        type: 'user_joined',
        data: {
          userId: input.userId,
          displayName: newParticipant.displayName,
          joinedAt: newParticipant.joinedAt.toISOString()
        },
        excludeUserId: input.userId
      });

      // 8. Track session join
      await this.analyticsService.trackEvent({
        type: 'collaboration_session_joined',
        userId: input.userId,
        metadata: {
          sessionId: input.sessionId,
          projectId: session.projectId,
          hostUserId: session.hostUserId,
          participantCount: updatedSession.participants.length
        }
      });

      // 9. Return response
      const response: CollaborationSessionResponseDTO = {
        id: updatedSession.id,
        projectId: updatedSession.projectId,
        hostUserId: updatedSession.hostUserId,
        participants: updatedSession.participants.map(p => ({
          userId: p.userId,
          displayName: p.displayName,
          email: p.email,
          role: p.role,
          status: p.status,
          joinedAt: p.joinedAt.toISOString()
        })),
        status: updatedSession.status,
        startedAt: updatedSession.startedAt.toISOString(),
        duration: updatedSession.duration
      };

      return {
        success: true,
        data: response,
        metadata: { timestamp, version: '6.4', requestId }
      };

    } catch (error) {
      console.error('CollaborateOnProjectUseCase joinSession failed:', error);
      
      return {
        success: false,
        error: {
          code: 'SESSION_JOIN_ERROR',
          message: 'Failed to join collaboration session',
          details: error.message
        },
        metadata: { timestamp, version: '6.4', requestId }
      };
    }
  }

  async leaveSession(sessionId: string, userId: string): Promise<ApiResponse<CollaborationSessionResponseDTO>> {
    const requestId = this.generateRequestId();
    const timestamp = new Date().toISOString();

    try {
      // 1. Find session and verify participant
      const session = await this.collaborationRepository.findById(sessionId);
      if (!session) {
        return {
          success: false,
          error: {
            code: 'SESSION_NOT_FOUND',
            message: 'Collaboration session not found',
            details: { sessionId }
          },
          metadata: { timestamp, version: '6.4', requestId }
        };
      }

      const participant = session.participants.find(p => p.userId === userId);
      if (!participant) {
        return {
          success: false,
          error: {
            code: 'USER_NOT_IN_SESSION',
            message: 'User is not a participant in this session',
            details: { sessionId, userId }
          },
          metadata: { timestamp, version: '6.4', requestId }
        };
      }

      // 2. If host is leaving, transfer ownership or end session
      if (session.hostUserId === userId) {
        const otherParticipants = session.participants.filter(p => p.userId !== userId);
        
        if (otherParticipants.length > 0) {
          // Transfer ownership to first participant
          const newHost = otherParticipants[0];
          await this.collaborationRepository.transferOwnership(sessionId, newHost.userId);
        } else {
          // End session if no other participants
          return this.endSession(sessionId, userId);
        }
      }

      // 3. Remove participant from session
      const updatedSession = await this.collaborationRepository.removeParticipant(sessionId, userId);

      // 4. Leave real-time room
      await this.realtimeService.leaveRoom(sessionId, userId);

      // 5. Notify other participants
      await this.notificationService.broadcastToSession(sessionId, {
        type: 'user_left',
        data: {
          userId,
          displayName: participant.displayName,
          leftAt: new Date().toISOString()
        },
        excludeUserId: userId
      });

      // 6. Track session leave
      await this.analyticsService.trackEvent({
        type: 'collaboration_session_left',
        userId,
        metadata: {
          sessionId,
          projectId: session.projectId,
          participantCount: updatedSession.participants.length,
          sessionDuration: Date.now() - session.startedAt.getTime()
        }
      });

      // 7. Return response
      const response: CollaborationSessionResponseDTO = {
        id: updatedSession.id,
        projectId: updatedSession.projectId,
        hostUserId: updatedSession.hostUserId,
        participants: updatedSession.participants.map(p => ({
          userId: p.userId,
          displayName: p.displayName,
          email: p.email,
          role: p.role,
          status: p.status,
          joinedAt: p.joinedAt.toISOString()
        })),
        status: updatedSession.status,
        startedAt: updatedSession.startedAt.toISOString(),
        duration: updatedSession.duration
      };

      return {
        success: true,
        data: response,
        metadata: { timestamp, version: '6.4', requestId }
      };

    } catch (error) {
      console.error('CollaborateOnProjectUseCase leaveSession failed:', error);
      
      return {
        success: false,
        error: {
          code: 'SESSION_LEAVE_ERROR',
          message: 'Failed to leave collaboration session',
          details: error.message
        },
        metadata: { timestamp, version: '6.4', requestId }
      };
    }
  }

  async endSession(sessionId: string, hostUserId: string): Promise<ApiResponse<CollaborationSessionResponseDTO>> {
    const requestId = this.generateRequestId();
    const timestamp = new Date().toISOString();

    try {
      // 1. Find and validate session
      const session = await this.collaborationRepository.findById(sessionId);
      if (!session) {
        return {
          success: false,
          error: {
            code: 'SESSION_NOT_FOUND',
            message: 'Collaboration session not found',
            details: { sessionId }
          },
          metadata: { timestamp, version: '6.4', requestId }
        };
      }

      if (session.hostUserId !== hostUserId) {
        return {
          success: false,
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: 'Only the host can end the collaboration session',
            details: { sessionId, hostUserId, actualHost: session.hostUserId }
          },
          metadata: { timestamp, version: '6.4', requestId }
        };
      }

      // 2. End session
      const endedSession = await this.collaborationRepository.endSession(sessionId);

      // 3. Close real-time room
      await this.realtimeService.closeRoom(sessionId);

      // 4. Notify all participants
      await this.notificationService.broadcastToSession(sessionId, {
        type: 'session_ended',
        data: {
          endedAt: new Date().toISOString(),
          endedBy: hostUserId,
          duration: endedSession.duration
        }
      });

      // 5. Track session end
      await this.analyticsService.trackEvent({
        type: 'collaboration_session_ended',
        userId: hostUserId,
        metadata: {
          sessionId,
          projectId: session.projectId,
          participantCount: session.participants.length,
          sessionDuration: endedSession.duration,
          endReason: 'host_ended'
        }
      });

      // 6. Return response
      const response: CollaborationSessionResponseDTO = {
        id: endedSession.id,
        projectId: endedSession.projectId,
        hostUserId: endedSession.hostUserId,
        participants: endedSession.participants.map(p => ({
          userId: p.userId,
          displayName: p.displayName,
          email: p.email,
          role: p.role,
          status: p.status,
          joinedAt: p.joinedAt.toISOString()
        })),
        status: endedSession.status,
        startedAt: endedSession.startedAt.toISOString(),
        duration: endedSession.duration
      };

      return {
        success: true,
        data: response,
        metadata: { timestamp, version: '6.4', requestId }
      };

    } catch (error) {
      console.error('CollaborateOnProjectUseCase endSession failed:', error);
      
      return {
        success: false,
        error: {
          code: 'SESSION_END_ERROR',
          message: 'Failed to end collaboration session',
          details: error.message
        },
        metadata: { timestamp, version: '6.4', requestId }
      };
    }
  }

  async getActiveSession(projectId: string): Promise<ApiResponse<CollaborationSessionResponseDTO | null>> {
    const requestId = this.generateRequestId();
    const timestamp = new Date().toISOString();

    try {
      const session = await this.collaborationRepository.findActiveByProject(projectId);
      
      if (!session) {
        return {
          success: true,
          data: null,
          metadata: { timestamp, version: '6.4', requestId }
        };
      }

      const response: CollaborationSessionResponseDTO = {
        id: session.id,
        projectId: session.projectId,
        hostUserId: session.hostUserId,
        participants: session.participants.map(p => ({
          userId: p.userId,
          displayName: p.displayName,
          email: p.email,
          role: p.role,
          status: p.status,
          joinedAt: p.joinedAt.toISOString()
        })),
        status: session.status,
        startedAt: session.startedAt.toISOString(),
        duration: session.duration
      };

      return {
        success: true,
        data: response,
        metadata: { timestamp, version: '6.4', requestId }
      };

    } catch (error) {
      console.error('CollaborateOnProjectUseCase getActiveSession failed:', error);
      
      return {
        success: false,
        error: {
          code: 'SESSION_FETCH_ERROR',
          message: 'Failed to fetch active session',
          details: error.message
        },
        metadata: { timestamp, version: '6.4', requestId }
      };
    }
  }

  validateSessionInput(input: CreateCollaborationSessionDTO): ValidationResult {
    const errors: Array<{ field: string; message: string; code: string }> = [];
    const warnings: Array<{ field: string; message: string; code: string }> = [];

    // Required fields validation
    if (!input.projectId) {
      errors.push({ field: 'projectId', message: 'Project ID is required', code: 'REQUIRED' });
    }

    if (!input.hostUserId) {
      errors.push({ field: 'hostUserId', message: 'Host user ID is required', code: 'REQUIRED' });
    }

    if (!input.settings) {
      errors.push({ field: 'settings', message: 'Session settings are required', code: 'REQUIRED' });
    } else {
      // Settings validation
      if (typeof input.settings.maxParticipants !== 'number' || input.settings.maxParticipants < 1) {
        errors.push({ 
          field: 'settings.maxParticipants', 
          message: 'Max participants must be a positive number', 
          code: 'INVALID_VALUE' 
        });
      } else if (input.settings.maxParticipants > 10) {
        warnings.push({ 
          field: 'settings.maxParticipants', 
          message: 'Large sessions may impact performance', 
          code: 'PERFORMANCE_WARNING' 
        });
      }

      if (typeof input.settings.allowEdit !== 'boolean') {
        errors.push({ 
          field: 'settings.allowEdit', 
          message: 'allowEdit must be a boolean', 
          code: 'INVALID_TYPE' 
        });
      }

      if (typeof input.settings.allowComment !== 'boolean') {
        errors.push({ 
          field: 'settings.allowComment', 
          message: 'allowComment must be a boolean', 
          code: 'INVALID_TYPE' 
        });
      }

      if (typeof input.settings.allowVoiceChat !== 'boolean') {
        errors.push({ 
          field: 'settings.allowVoiceChat', 
          message: 'allowVoiceChat must be a boolean', 
          code: 'INVALID_TYPE' 
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private generateSessionId(): string {
    return `collab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateInviteCode(): string {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
} 