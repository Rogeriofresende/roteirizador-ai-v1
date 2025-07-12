// Application Layer DTOs - Clean Architecture V6.4
// Data Transfer Objects para comunicação entre camadas

// Script DTOs
export interface CreateScriptDTO {
  userId: string;
  title: string;
  formData: {
    platform: string;
    format: string;
    videoGoal: string;
    targetAudience: string;
    toneOfVoice: string;
    videoTopic: string;
    duration: string;
    details: string;
    otherGoal?: string;
    customAudience?: string;
    customTone?: string;
    otherFormat?: string;
    customPlatform?: string;
    customFormat?: string;
    hook?: string;
    callToAction?: string;
    keyPoints?: string;
    additionalNotes?: string;
  };
}

export interface UpdateScriptDTO {
  id: string;
  userId: string;
  title?: string;
  content?: string;
  tags?: string[];
  folderId?: string;
  isFavorite?: boolean;
  status?: 'draft' | 'completed' | 'published';
}

export interface ScriptResponseDTO {
  id: string;
  title: string;
  content: string;
  status: 'draft' | 'completed' | 'published';
  tags: string[];
  folderId?: string;
  isFavorite: boolean;
  wordCount: number;
  version: number;
  createdAt: string;
  updatedAt: string;
}

// User DTOs
export interface CreateUserDTO {
  email: string;
  displayName: string;
  photoURL?: string;
  uid: string;
}

export interface UpdateUserPreferencesDTO {
  userId: string;
  preferences: {
    autoSave: boolean;
    autoSaveInterval: number;
    aiSuggestionsEnabled: boolean;
    defaultPlatform?: string;
    defaultTone?: string;
    defaultAudience?: string;
  };
}

export interface UserResponseDTO {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  isVerified: boolean;
  plan: string;
  createdAt: string;
  lastLoginAt: string;
}

// Template DTOs
export interface CreateTemplateDTO {
  title: string;
  description: string;
  category: 'educational' | 'entertainment' | 'marketing' | 'news' | 'tutorial' | 'review' | 'story';
  platform: string[];
  structure: {
    id: string;
    title: string;
    description: string;
    content: string;
    order: number;
    duration: number;
    isRequired: boolean;
    suggestions: string[];
  }[];
  placeholders: {
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
  }[];
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isPublic: boolean;
  isPremium: boolean;
}

export interface TemplateResponseDTO {
  id: string;
  title: string;
  description: string;
  category: string;
  platform: string[];
  difficulty: string;
  popularity: number;
  usage: number;
  rating: number;
  isPremium: boolean;
  isPublic: boolean;
  createdAt: string;
  author: {
    id: string;
    name: string;
    verified: boolean;
  };
}

// AI Improvement DTOs
export interface RequestAIImprovementDTO {
  scriptId: string;
  userId: string;
  selectedText: string;
  contextBefore: string;
  contextAfter: string;
  userFeedback: string;
  improvementType: 'clarity' | 'engagement' | 'brevity' | 'call_to_action' | 'tone' | 'grammar' | 'style' | 'custom';
}

export interface AIImprovementResponseDTO {
  id: string;
  suggestions: {
    id: string;
    text: string;
    reasoning: string;
    confidence: number;
    improvementType: string;
    tags: string[];
  }[];
  status: 'pending' | 'accepted' | 'rejected' | 'modified';
  processingTime: number;
  modelUsed: string;
  createdAt: string;
}

// Collaboration DTOs
export interface CreateCollaborationSessionDTO {
  projectId: string;
  hostUserId: string;
  settings: {
    allowEdit: boolean;
    allowComment: boolean;
    allowVoiceChat: boolean;
    maxParticipants: number;
  };
}

export interface JoinCollaborationSessionDTO {
  sessionId: string;
  userId: string;
  displayName: string;
  email: string;
}

export interface CollaborationSessionResponseDTO {
  id: string;
  projectId: string;
  hostUserId: string;
  participants: {
    userId: string;
    displayName: string;
    email: string;
    role: 'owner' | 'editor' | 'commenter' | 'viewer';
    status: 'online' | 'away' | 'offline';
    joinedAt: string;
  }[];
  status: 'active' | 'paused' | 'ended';
  startedAt: string;
  duration?: number;
}

// Analytics DTOs
export interface GetAnalyticsDTO {
  userId: string;
  period: {
    start: string;
    end: string;
  };
  metrics: ('productivity' | 'collaboration' | 'aiUsage' | 'contentQuality' | 'platformPerformance')[];
}

export interface AnalyticsResponseDTO {
  userId: string;
  period: {
    start: string;
    end: string;
  };
  productivity: {
    totalProjectsCreated: number;
    totalWordsWritten: number;
    totalEditingSessions: number;
    averageSessionDuration: number;
    peakProductivityHours: number[];
    productivityTrend: number;
  };
  collaboration: {
    sessionsHosted: number;
    sessionsParticipated: number;
    commentsGiven: number;
    commentsReceived: number;
  };
  aiUsage: {
    totalRequests: number;
    successfulSuggestions: number;
    acceptanceRate: number;
    favoriteTypes: Record<string, number>;
    tokensConsumed: number;
    qualityImprovement: number;
  };
  contentQuality: {
    averageReadabilityScore: number;
    averageEngagementScore: number;
    averageSentiment: number;
    topKeywords: Record<string, number>;
  };
}

// Validation DTOs
export interface ValidationResult {
  isValid: boolean;
  errors: {
    field: string;
    message: string;
    code: string;
  }[];
  warnings: {
    field: string;
    message: string;
    code: string;
  }[];
}

// Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  metadata?: {
    timestamp: string;
    version: string;
    requestId: string;
  };
} 