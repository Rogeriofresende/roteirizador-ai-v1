/**
 * Comprehensive Database Schema - Week 0 IA Alpha Implementation  
 * Foundation schema supporting all planned features with cost management integration
 * 
 * Supports:
 * - User tier management and cost tracking
 * - Idea generation and personalization systems
 * - Referral system with gamification
 * - Analytics and performance tracking
 * - Migration support and backward compatibility
 */

// User Management Schema
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  tier: 'free' | 'premium' | 'enterprise';
  status: 'active' | 'suspended' | 'migrating' | 'inactive';
  
  // Tier management
  tierInfo: {
    currentTier: 'free' | 'premium' | 'enterprise';
    upgradeDate?: Date;
    expiryDate?: Date;
    autoRenew: boolean;
    paymentStatus: 'active' | 'pending' | 'failed' | 'cancelled';
  };
  
  // Usage tracking
  usage: {
    ideasGenerated: number;
    personalizations: number;
    referrals: number;
    lastActive: Date;
    monthlyReset: Date;
    streakDays: number;
  };
  
  // Cost tracking
  costTracking: {
    totalCost: number;
    dailyCost: number;
    monthlyCost: number;
    lastCostUpdate: Date;
    budgetAlerts: boolean;
    costEfficiency: number; // cost per idea
  };
  
  // Migration support
  migration: {
    status: 'none' | 'pending' | 'in_progress' | 'completed';
    startDate?: Date;
    completedDate?: Date;
    dataPreserved: boolean;
    experienceMode: 'legacy' | 'hybrid' | 'new';
  };
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

// User Preferences and Personalization
export interface UserPreferences {
  id: string;
  userId: string;
  
  // Content preferences
  categories: Record<string, number>; // category -> preference score
  styles: Record<string, number>; // style -> preference score
  audiences: Record<string, number>; // audience -> preference score
  keywords: string[];
  
  // Interaction history
  interactions: {
    likes: string[]; // idea IDs
    dislikes: string[]; // idea IDs
    saves: string[]; // idea IDs
    shares: string[]; // idea IDs
    implementations: string[]; // idea IDs
  };
  
  // Personalization settings
  settings: {
    personalizedRecommendations: boolean;
    trendingContent: boolean;
    categoryDiversity: number; // 0-1 scale
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    contentLength: 'short' | 'medium' | 'long';
  };
  
  // Learning system
  learning: {
    level: 'basic' | 'behavioral' | 'contextual';
    confidenceScore: number;
    lastLearningUpdate: Date;
    dataPoints: number;
  };
  
  updatedAt: Date;
}

// Idea Generation System
export interface Idea {
  id: string;
  userId: string;
  
  // Content
  title: string;
  description: string;
  category: string;
  targetAudience: string;
  implementation: string[];
  
  // AI metadata
  aiMetadata: {
    model: string;
    tokensUsed: number;
    cost: number;
    confidence: number;
    personalizedScore: number;
    trending: boolean;
    prompt: string;
    processingTime: number;
  };
  
  // User interaction
  userFeedback: {
    rating?: number; // 1-5 stars
    feedback?: string;
    implemented: boolean;
    implementationDate?: Date;
    results?: string;
  };
  
  // Analytics
  analytics: {
    views: number;
    saves: number;
    shares: number;
    implementations: number;
    engagementScore: number;
    viralScore: number;
  };
  
  // Status
  status: 'generated' | 'reviewed' | 'implemented' | 'archived';
  tags: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

// Cost Management Schema
export interface CostTracking {
  id: string;
  userId: string;
  
  // Cost details
  amount: number;
  currency: 'USD';
  service: 'idea_generation' | 'personalization' | 'referral' | 'analytics';
  
  // Usage details
  tokensUsed?: number;
  requestType: string;
  userTier: 'free' | 'premium' | 'enterprise';
  
  // Context
  metadata: {
    ideaId?: string;
    requestId?: string;
    sessionId?: string;
    features: string[];
    efficiency: number; // cost per unit
  };
  
  // Aggregation support
  period: {
    day: string; // YYYY-MM-DD
    week: string; // YYYY-WW
    month: string; // YYYY-MM
    year: string; // YYYY
  };
  
  timestamp: Date;
}

// Rate Limiting and Usage Tracking
export interface RateLimit {
  id: string;
  userId: string;
  
  // Limits by service
  limits: {
    ideasPerDay: number;
    ideasPerHour: number;
    personalizationsPerDay: number;
    requestsPerMinute: number;
  };
  
  // Current usage
  usage: {
    ideasToday: number;
    ideasThisHour: number;
    personalizationsToday: number;
    requestsThisMinute: number;
    lastReset: Date;
  };
  
  // Tier-specific settings
  tierConfig: {
    tier: 'free' | 'premium' | 'enterprise';
    overage: {
      allowed: boolean;
      maxOverage: number;
      currentOverage: number;
    };
  };
  
  // Violation tracking
  violations: {
    count: number;
    lastViolation?: Date;
    escalated: boolean;
  };
  
  updatedAt: Date;
}

// Referral System Schema
export interface Referral {
  id: string;
  referrerId: string; // User who made the referral
  refereeId?: string; // User who was referred (null if not signed up)
  
  // Referral details
  referralCode: string;
  status: 'pending' | 'completed' | 'expired' | 'cancelled';
  channel: 'email' | 'social' | 'direct' | 'qr_code';
  
  // Gamification
  tier: 'helper' | 'advocate' | 'champion';
  points: number;
  badges: string[];
  
  // Tracking
  tracking: {
    clicks: number;
    views: number;
    conversions: number;
    lastClicked?: Date;
    lastConverted?: Date;
    viralCoefficient: number;
  };
  
  // Rewards
  rewards: {
    referrerReward: {
      type: 'tier_upgrade' | 'bonus_ideas' | 'premium_features';
      value: number;
      granted: boolean;
      grantedAt?: Date;
    };
    refereeReward: {
      type: 'welcome_bonus' | 'free_trial' | 'premium_access';
      value: number;
      granted: boolean;
      grantedAt?: Date;
    };
  };
  
  // Metadata
  metadata: {
    campaign?: string;
    medium?: string;
    source?: string;
    content?: string;
  };
  
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

// Analytics and Performance Schema
export interface Analytics {
  id: string;
  userId?: string; // null for global analytics
  
  // Metric details
  metric: string;
  value: number;
  dimensions: Record<string, string | number>;
  
  // Time aggregation
  timeframe: 'minute' | 'hour' | 'day' | 'week' | 'month';
  timestamp: Date;
  
  // Context
  context: {
    feature: string;
    userTier?: 'free' | 'premium' | 'enterprise';
    serviceLevel?: 'normal' | 'degraded' | 'minimal' | 'emergency';
    deviceType?: 'mobile' | 'desktop' | 'tablet';
    location?: string;
  };
  
  createdAt: Date;
}

// System Health and Monitoring
export interface SystemHealth {
  id: string;
  
  // Service status
  services: {
    geminiAI: 'healthy' | 'degraded' | 'critical' | 'down';
    database: 'healthy' | 'degraded' | 'critical' | 'down';
    costManagement: 'healthy' | 'degraded' | 'critical' | 'down';
    rateLimiting: 'healthy' | 'degraded' | 'critical' | 'down';
    fallback: 'healthy' | 'degraded' | 'critical' | 'down';
  };
  
  // Performance metrics
  performance: {
    responseTime: number;
    throughput: number;
    errorRate: number;
    cacheHitRate: number;
    queueDepth: number;
  };
  
  // Cost metrics
  costs: {
    daily: number;
    weekly: number;
    monthly: number;
    budgetUsage: number; // percentage
    emergencyActivated: boolean;
  };
  
  // User metrics
  users: {
    active: number;
    new: number;
    churned: number;
    tierDistribution: Record<'free' | 'premium' | 'enterprise', number>;
  };
  
  timestamp: Date;
}

// Emergency and Alert Schema
export interface Alert {
  id: string;
  
  // Alert details
  type: 'cost_overrun' | 'service_degradation' | 'rate_limit_exceeded' | 'error_spike' | 'user_feedback';
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  
  // Context
  context: {
    userId?: string;
    service?: string;
    metric?: string;
    value?: number;
    threshold?: number;
    metadata?: Record<string, any>;
  };
  
  // Resolution
  status: 'active' | 'acknowledged' | 'resolved' | 'suppressed';
  resolvedAt?: Date;
  resolvedBy?: string;
  resolution?: string;
  
  // Notification
  notifications: {
    email: boolean;
    sms: boolean;
    slack: boolean;
    webhook: boolean;
    sent: boolean;
    sentAt?: Date;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

// Migration Support Schema
export interface MigrationLog {
  id: string;
  userId: string;
  
  // Migration details
  operation: 'user_migration' | 'feature_toggle' | 'rollback' | 'data_sync';
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'rolled_back';
  
  // Data tracking
  dataChanged: {
    before: Record<string, any>;
    after: Record<string, any>;
    preserved: boolean;
  };
  
  // A/B Testing
  experiment: {
    id?: string;
    variant?: 'control' | 'treatment';
    startDate?: Date;
    endDate?: Date;
  };
  
  // Metrics
  metrics: {
    migrationTime: number;
    userSatisfaction?: number;
    errorCount: number;
    rollbackRequired: boolean;
  };
  
  // Context
  metadata: {
    version: string;
    environment: 'development' | 'staging' | 'production';
    triggeredBy: 'user' | 'system' | 'admin';
    reason?: string;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

// Configuration Schema
export interface Configuration {
  id: string;
  
  // Configuration details
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  
  // Context
  context: {
    environment: 'development' | 'staging' | 'production';
    feature: string;
    version: string;
  };
  
  // Management
  metadata: {
    description: string;
    defaultValue: any;
    validationRules?: Record<string, any>;
    deprecated: boolean;
    sensitive: boolean;
  };
  
  // Audit
  audit: {
    createdBy: string;
    updatedBy: string;
    reason?: string;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

// Database Indexes for Performance
export const DatabaseIndexes = {
  // User indexes
  users: [
    { fields: ['email'], unique: true },
    { fields: ['tier', 'status'] },
    { fields: ['usage.lastActive'] },
    { fields: ['costTracking.dailyCost'] },
    { fields: ['migration.status'] }
  ],
  
  // Idea indexes
  ideas: [
    { fields: ['userId', 'createdAt'] },
    { fields: ['category', 'targetAudience'] },
    { fields: ['analytics.engagementScore'] },
    { fields: ['aiMetadata.cost'] },
    { fields: ['status'] }
  ],
  
  // Cost tracking indexes
  costTracking: [
    { fields: ['userId', 'timestamp'] },
    { fields: ['service', 'userTier'] },
    { fields: ['period.day'] },
    { fields: ['period.month'] },
    { fields: ['amount'] }
  ],
  
  // Rate limiting indexes
  rateLimit: [
    { fields: ['userId'], unique: true },
    { fields: ['tierConfig.tier'] },
    { fields: ['usage.lastReset'] },
    { fields: ['violations.count'] }
  ],
  
  // Referral indexes
  referrals: [
    { fields: ['referrerId', 'status'] },
    { fields: ['referralCode'], unique: true },
    { fields: ['tier', 'points'] },
    { fields: ['tracking.viralCoefficient'] },
    { fields: ['createdAt'] }
  ],
  
  // Analytics indexes
  analytics: [
    { fields: ['metric', 'timestamp'] },
    { fields: ['userId', 'timeframe'] },
    { fields: ['context.feature'] },
    { fields: ['context.userTier'] },
    { fields: ['timestamp'] }
  ],
  
  // System health indexes
  systemHealth: [
    { fields: ['timestamp'] },
    { fields: ['costs.budgetUsage'] },
    { fields: ['performance.errorRate'] },
    { fields: ['services.geminiAI'] }
  ],
  
  // Alert indexes
  alerts: [
    { fields: ['type', 'severity'] },
    { fields: ['status', 'createdAt'] },
    { fields: ['context.userId'] },
    { fields: ['context.service'] }
  ],
  
  // Migration indexes
  migrationLog: [
    { fields: ['userId', 'operation'] },
    { fields: ['status', 'createdAt'] },
    { fields: ['experiment.id'] },
    { fields: ['metrics.userSatisfaction'] }
  ],
  
  // Configuration indexes
  configuration: [
    { fields: ['key', 'context.environment'], unique: true },
    { fields: ['context.feature'] },
    { fields: ['metadata.deprecated'] }
  ]
};

// Migration Support Queries
export const MigrationQueries = {
  // User migration support
  getUsersForMigration: (batchSize: number) => ({
    filter: { 'migration.status': { $in: ['none', 'pending'] } },
    sort: { createdAt: 1 },
    limit: batchSize
  }),
  
  // Data preservation validation
  validateDataPreservation: (userId: string) => ({
    users: { id: userId },
    ideas: { userId },
    preferences: { userId },
    referrals: { $or: [{ referrerId: userId }, { refereeId: userId }] }
  }),
  
  // A/B testing queries
  getExperimentUsers: (experimentId: string, variant: string) => ({
    'experiment.id': experimentId,
    'experiment.variant': variant,
    status: 'completed'
  })
};

// Cost Management Queries
export const CostQueries = {
  // Daily cost summary
  getDailyCosts: (date: string) => ({
    'period.day': date,
    aggregate: [
      { $group: { _id: '$service', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]
  }),
  
  // User tier costs
  getTierCosts: (tier: string, period: string) => ({
    userTier: tier,
    'period.month': period,
    aggregate: [
      { $group: { _id: '$userId', total: { $sum: '$amount' }, ideas: { $sum: 1 } } },
      { $match: { total: { $gt: 0 } } },
      { $sort: { total: -1 } }
    ]
  }),
  
  // Budget monitoring
  getBudgetStatus: () => ({
    aggregate: [
      { $group: { 
        _id: '$period.day', 
        dailyTotal: { $sum: '$amount' },
        userCount: { $addToSet: '$userId' }
      }},
      { $project: {
        date: '$_id',
        cost: '$dailyTotal',
        users: { $size: '$userCount' },
        budgetUsage: { $multiply: [{ $divide: ['$dailyTotal', 1.67] }, 100] }
      }},
      { $sort: { date: -1 } },
      { $limit: 30 }
    ]
  })
};

export default {
  User,
  UserPreferences,
  Idea,
  CostTracking,
  RateLimit,
  Referral,
  Analytics,
  SystemHealth,
  Alert,
  MigrationLog,
  Configuration,
  DatabaseIndexes,
  MigrationQueries,
  CostQueries
}; 