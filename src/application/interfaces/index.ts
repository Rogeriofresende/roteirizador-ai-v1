// Application Layer Interfaces - Clean Architecture V6.4
// Central interfaces for application layer contracts

import { 
  CreateScriptDTO, 
  UpdateScriptDTO, 
  ScriptResponseDTO,
  CreateUserDTO,
  UpdateUserPreferencesDTO,
  UserResponseDTO,
  CreateTemplateDTO,
  TemplateResponseDTO,
  CreateCollaborationSessionDTO,
  JoinCollaborationSessionDTO,
  CollaborationSessionResponseDTO,
  ApiResponse
} from '../dto';

// ===== GENERIC TYPES SYSTEM =====

// Base Entity Interface
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Generic Repository Interface
export interface IRepository<TEntity extends BaseEntity, TCreateDTO, TUpdateDTO> {
  findById(id: string): Promise<TEntity | null>;
  create(data: TCreateDTO): Promise<TEntity>;
  update(id: string, data: TUpdateDTO): Promise<TEntity>;
  delete(id: string): Promise<void>;
  findAll(filters?: Record<string, unknown>): Promise<TEntity[]>;
}

// Generic Service Interface
export interface IService<TInput, TOutput> {
  execute(input: TInput): Promise<ApiResponse<TOutput>>;
}

// Generic Use Case Interface
export interface IUseCase<TInput, TOutput> {
  execute(input: TInput): Promise<ApiResponse<TOutput>>;
  validateInput(input: TInput): { isValid: boolean; errors: string[] };
}

// ===== DOMAIN ENTITY TYPES =====

// User Entity Type
export interface UserEntity extends BaseEntity {
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
  role: 'user' | 'admin';
  isActive: boolean;
  isBlocked: boolean;
  lastLoginAt: Date;
  lastActiveAt: Date;
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    notifications: boolean;
    analyticsOptIn: boolean;
  };
  subscription: 'free' | 'pro' | 'enterprise';
}

// Script Entity Type
export interface ScriptEntity extends BaseEntity {
  userId: string;
  title: string;
  content: string;
  status: 'draft' | 'completed' | 'published';
  tags: string[];
  folderId?: string;
  isFavorite: boolean;
  wordCount: number;
  version: number;
  formData: {
    platform: string;
    format: string;
    videoGoal: string;
    targetAudience: string;
    toneOfVoice: string;
    videoTopic: string;
    duration: string;
    details: string;
  };
}

// Template Entity Type
export interface TemplateEntity extends BaseEntity {
  title: string;
  description: string;
  category: 'educational' | 'entertainment' | 'marketing' | 'news' | 'tutorial' | 'review' | 'story';
  platform: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  popularity: number;
  usage: number;
  rating: number;
  isPublic: boolean;
  isPremium: boolean;
  authorId: string;
  structure: TemplateSection[];
  placeholders: TemplatePlaceholder[];
}

// Template Section Type
export interface TemplateSection {
  id: string;
  title: string;
  description: string;
  content: string;
  order: number;
  duration: number;
  isRequired: boolean;
  suggestions: string[];
}

// Template Placeholder Type
export interface TemplatePlaceholder {
  id: string;
  name: string;
  description: string;
  type: 'text' | 'number' | 'select' | 'multiselect';
  defaultValue?: unknown;
  options?: string[];
  validation?: {
    required: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}

// Project Entity Type
export interface ProjectEntity extends BaseEntity {
  userId: string;
  title: string;
  description?: string;
  settings: {
    isPublic: boolean;
    allowComments: boolean;
    allowCollaboration: boolean;
  };
  collaborators: ProjectCollaborator[];
  status: 'active' | 'archived' | 'deleted';
}

// Project Collaborator Type
export interface ProjectCollaborator {
  userId: string;
  role: 'owner' | 'editor' | 'commenter' | 'viewer';
  joinedAt: Date;
  permissions: string[];
}

// Collaboration Session Entity Type
export interface CollaborationSessionEntity extends BaseEntity {
  projectId: string;
  hostUserId: string;
  participants: SessionParticipant[];
  status: 'active' | 'paused' | 'ended';
  settings: {
    allowEdit: boolean;
    allowComment: boolean;
    allowVoiceChat: boolean;
    maxParticipants: number;
  };
  startedAt: Date;
  endedAt?: Date;
}

// Session Participant Type
export interface SessionParticipant {
  userId: string;
  displayName: string;
  email: string;
  role: 'owner' | 'editor' | 'commenter' | 'viewer';
  status: 'online' | 'away' | 'offline';
  joinedAt: Date;
}

// ===== USE CASE INTERFACES =====

// Use Case Interfaces
export type { IGenerateScriptUseCase } from '../usecases/GenerateScriptUseCase';
export type { IManageUserUseCase } from '../usecases/ManageUserUseCase';
export type { IManageTemplateUseCase } from '../usecases/ManageTemplateUseCase';
export type { ICollaborateOnProjectUseCase } from '../usecases/CollaborateOnProjectUseCase';

// Application Service Interfaces
export type { IScriptApplicationService } from '../services/ScriptApplicationService';

// ===== REPOSITORY INTERFACES =====

// Typed Repository Interfaces
export interface IUserRepository extends IRepository<UserEntity, CreateUserDTO, UpdateUserPreferencesDTO> {
  findByEmail(email: string): Promise<UserEntity | null>;
  updateLastAccess(id: string): Promise<void>;
  findByRole(role: 'user' | 'admin'): Promise<UserEntity[]>;
  findActiveUsers(): Promise<UserEntity[]>;
}

export interface IScriptRepository extends IRepository<ScriptEntity, CreateScriptDTO, UpdateScriptDTO> {
  findByUser(userId: string, filters?: { 
    status?: 'draft' | 'completed' | 'published';
    tags?: string[];
    folderId?: string;
  }): Promise<ScriptEntity[]>;
  findByTitle(title: string): Promise<ScriptEntity[]>;
  findFavorites(userId: string): Promise<ScriptEntity[]>;
  updateStatus(id: string, status: 'draft' | 'completed' | 'published'): Promise<ScriptEntity>;
}

export interface ITemplateRepository extends IRepository<TemplateEntity, CreateTemplateDTO, Partial<TemplateEntity>> {
  findByCategory(category: string, options?: { 
    limit?: number; 
    offset?: number;
    sortBy?: 'popularity' | 'rating' | 'createdAt';
  }): Promise<TemplateEntity[]>;
  findFeatured(options?: { limit?: number; offset?: number }): Promise<TemplateEntity[]>;
  search(params: {
    query?: string;
    category?: string;
    platform?: string;
    difficulty?: string;
    isPremium?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ templates: TemplateEntity[]; total: number }>;
  findByAuthor(authorId: string): Promise<TemplateEntity[]>;
  updateRating(id: string, rating: number): Promise<TemplateEntity>;
  incrementUsage(id: string): Promise<void>;
}

export interface IProjectRepository extends IRepository<ProjectEntity, Omit<ProjectEntity, 'id' | 'createdAt' | 'updatedAt'>, Partial<ProjectEntity>> {
  findByUser(userId: string, filters?: {
    status?: 'active' | 'archived' | 'deleted';
    includeCollaborated?: boolean;
  }): Promise<ProjectEntity[]>;
  hasCollaborationAccess(projectId: string, userId: string): Promise<boolean>;
  hasCollaborationRights(projectId: string, userId: string): Promise<boolean>;
  addCollaborator(projectId: string, collaborator: Omit<ProjectCollaborator, 'joinedAt'>): Promise<ProjectEntity>;
  removeCollaborator(projectId: string, userId: string): Promise<ProjectEntity>;
  updateCollaboratorRole(projectId: string, userId: string, role: ProjectCollaborator['role']): Promise<ProjectEntity>;
}

export interface ICollaborationRepository extends IRepository<CollaborationSessionEntity, CreateCollaborationSessionDTO, Partial<CollaborationSessionEntity>> {
  findActiveByProject(projectId: string): Promise<CollaborationSessionEntity | null>;
  findByHost(hostUserId: string): Promise<CollaborationSessionEntity[]>;
  findByParticipant(userId: string): Promise<CollaborationSessionEntity[]>;
  addParticipant(sessionId: string, participant: Omit<SessionParticipant, 'joinedAt'>): Promise<CollaborationSessionEntity>;
  removeParticipant(sessionId: string, userId: string): Promise<CollaborationSessionEntity>;
  updateParticipantStatus(sessionId: string, userId: string, status: SessionParticipant['status']): Promise<CollaborationSessionEntity>;
  transferOwnership(sessionId: string, newHostId: string): Promise<CollaborationSessionEntity>;
  endSession(sessionId: string): Promise<CollaborationSessionEntity>;
}

// ===== SERVICE INTERFACES =====

// AI Service Interface
export interface IGeminiService {
  generateContent(params: {
    prompt: string;
    context: {
      platform: string;
      audience: string;
      tone: string;
      duration: string;
    };
    options?: {
      temperature?: number;
      maxTokens?: number;
      topP?: number;
    };
  }): Promise<{
    success: boolean;
    content?: string;
    error?: string;
    metadata?: {
      tokensUsed: number;
      model: string;
      responseTime: number;
    };
  }>;
  
  enhanceTemplate(params: {
    templateId: string;
    improvements: string[];
    context: {
      platform: string;
      category: string;
    };
  }): Promise<{
    success: boolean;
    enhancedTemplate?: TemplateEntity;
    error?: string;
  }>;
  
  testConnection(): Promise<{ connected: boolean; latency?: number }>;
}

// Analytics Service Interface
export interface IAnalyticsService {
  trackEvent(event: {
    type: string;
    userId: string;
    metadata?: Record<string, unknown>;
    timestamp?: Date;
  }): Promise<void>;
  
  trackError(error: {
    type: string;
    userId: string;
    error: string;
    metadata?: Record<string, unknown>;
    timestamp?: Date;
  }): Promise<void>;
  
  initializeUserAnalytics(userId: string): Promise<void>;
  
  getUserAnalytics(userId: string, period: {
    start: Date;
    end: Date;
  }): Promise<{
    events: number;
    errors: number;
    mostUsedFeatures: Record<string, number>;
    performanceMetrics: {
      avgResponseTime: number;
      errorRate: number;
    };
  }>;
}

// Cache Service Interface
export interface ICacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, options?: { 
    ttl?: number; 
    tags?: string[];
  }): Promise<void>;
  del(key: string): Promise<void>;
  invalidatePattern(pattern: string): Promise<void>;
  invalidateByTag(tag: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  getMultiple<T>(keys: string[]): Promise<Record<string, T>>;
  setMultiple<T>(items: Record<string, T>, options?: { ttl?: number }): Promise<void>;
}

// Realtime Service Interface
export interface IRealtimeService {
  createRoom(roomId: string, options: {
    maxParticipants: number;
    allowVoiceChat: boolean;
    allowScreenShare: boolean;
    moderatorId: string;
  }): Promise<void>;
  
  joinRoom(roomId: string, userId: string, userData: {
    displayName: string;
    role: 'owner' | 'editor' | 'commenter' | 'viewer';
  }): Promise<void>;
  
  leaveRoom(roomId: string, userId: string): Promise<void>;
  closeRoom(roomId: string): Promise<void>;
  
  sendMessage(roomId: string, userId: string, message: {
    type: 'text' | 'file' | 'system';
    content: string;
    metadata?: Record<string, unknown>;
  }): Promise<void>;
  
  getRoomParticipants(roomId: string): Promise<SessionParticipant[]>;
}

// Notification Service Interface
export interface INotificationService {
  sendWelcomeEmail(params: { 
    email: string; 
    displayName: string;
    userId: string;
  }): Promise<void>;
  
  broadcastToSession(sessionId: string, message: {
    type: 'info' | 'warning' | 'error' | 'success';
    title: string;
    content: string;
    metadata?: Record<string, unknown>;
  }): Promise<void>;
  
  sendCollaborationInvite(params: {
    projectId: string;
    inviterUserId: string;
    inviteeEmail: string;
    role: 'editor' | 'commenter' | 'viewer';
  }): Promise<void>;
  
  sendScriptCompleted(params: {
    userId: string;
    scriptId: string;
    scriptTitle: string;
  }): Promise<void>;
}

// ===== APPLICATION LAYER CONFIGURATION =====

export interface IApplicationConfig {
  cacheConfig: {
    defaultTTL: number;
    scriptsCacheTTL: number;
    templatesCacheTTL: number;
    usersCacheTTL: number;
  };
  collaborationConfig: {
    maxParticipants: number;
    sessionTimeout: number;
    heartbeatInterval: number;
    maxRoomsPerUser: number;
  };
  analyticsConfig: {
    enableTracking: boolean;
    batchSize: number;
    flushInterval: number;
    retentionDays: number;
  };
  aiConfig: {
    maxRetries: number;
    timeoutMs: number;
    maxTokens: number;
    temperature: number;
  };
}

// ===== CROSS-CUTTING CONCERNS =====

// Logger Interface
export interface ILogger {
  info(message: string, metadata?: Record<string, unknown>): void;
  warn(message: string, metadata?: Record<string, unknown>): void;
  error(message: string, error?: Error, metadata?: Record<string, unknown>): void;
  debug(message: string, metadata?: Record<string, unknown>): void;
}

// Validator Interface
export interface IValidator {
  validate<T>(schema: unknown, data: T): { 
    isValid: boolean; 
    errors: Array<{ field: string; message: string; code: string }>;
  };
  validateDTO<T>(dto: T, validationRules: Record<string, unknown>): { 
    isValid: boolean; 
    errors: Array<{ field: string; message: string; code: string }>;
  };
}

// ===== DEFAULT CONFIGURATION =====

export const defaultApplicationConfig: IApplicationConfig = {
  cacheConfig: {
    defaultTTL: 300, // 5 minutes
    scriptsCacheTTL: 1800, // 30 minutes
    templatesCacheTTL: 3600, // 1 hour
    usersCacheTTL: 600, // 10 minutes
  },
  collaborationConfig: {
    maxParticipants: 10,
    sessionTimeout: 7200, // 2 hours
    heartbeatInterval: 30, // 30 seconds
    maxRoomsPerUser: 3,
  },
  analyticsConfig: {
    enableTracking: true,
    batchSize: 100,
    flushInterval: 10000, // 10 seconds
    retentionDays: 365,
  },
  aiConfig: {
    maxRetries: 3,
    timeoutMs: 30000, // 30 seconds
    maxTokens: 2048,
    temperature: 0.7,
  },
}; 