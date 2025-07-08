/**
 * V6.2 Enhanced Framework - Shared Types
 * Tipos compartilhados entre services e componentes
 */

// Re-export types from services for easy import
export type { 
  AIProvider, 
  AIResponse, 
  MultiAIPreferences,
  ComparisonResult,
  UsageStats
} from '../services/multiAIService';

export type {
  UserPattern,
  SmartSuggestion,
  InteractionData,
  PlatformScore
} from '../services/predictiveUXService';

export type {
  LoadingContext,
  LoadingState,
  LoadingPattern,
  LoadingMessage
} from '../services/smartLoadingService';

export type {
  QuickAction,
  AccessPattern,
  ShortcutMap
} from '../services/directAccessService';

export type {
  DashboardData,
  MetricWidget,
  ServiceHealth,
  InsightData,
  AlertData
} from '../services/intelligenceDashboardService';

export type {
  MicroInteraction,
  HapticPattern,
  VisualEffect,
  AudioFeedback
} from '../services/advancedMicroInteractionsService';

export type {
  PerformanceMetrics,
  ComponentMetrics,
  NetworkMetrics,
  OptimizationSuggestion
} from '../services/enhancedPerformanceService';

// Shared enums
export enum ServiceStatus {
  INITIALIZING = 'initializing',
  READY = 'ready',
  DEGRADED = 'degraded',
  ERROR = 'error',
  OFFLINE = 'offline'
}

export enum FeatureFlag {
  PREDICTIVE_UX = 'predictive_ux',
  MULTI_AI = 'multi_ai',
  VOICE_SYNTHESIS = 'voice_synthesis',
  SMART_LOADING = 'smart_loading',
  DIRECT_ACCESS = 'direct_access',
  MICRO_INTERACTIONS = 'micro_interactions',
  PERFORMANCE_MONITORING = 'performance_monitoring',
  INTELLIGENCE_DASHBOARD = 'intelligence_dashboard'
}

// Service initialization config
export interface ServiceConfig {
  enablePredictiveUX?: boolean;
  enableMultiAI?: boolean;
  enableVoiceSynthesis?: boolean;
  enableSmartLoading?: boolean;
  enableDirectAccess?: boolean;
  enableMicroInteractions?: boolean;
  enablePerformanceMonitoring?: boolean;
  enableIntelligenceDashboard?: boolean;
  
  // API keys (if needed)
  openaiApiKey?: string;
  geminiApiKey?: string;
  
  // Feature configs
  microInteractionsIntensity?: 'subtle' | 'normal' | 'premium';
  performanceThresholds?: {
    fps?: number;
    memory?: number;
    latency?: number;
  };
}

// Global V6.2 context type
export interface V62Context {
  services: {
    predictiveUX: boolean;
    multiAI: boolean;
    voiceSynthesis: boolean;
    smartLoading: boolean;
    directAccess: boolean;
    microInteractions: boolean;
    performanceMonitoring: boolean;
    intelligenceDashboard: boolean;
  };
  
  user: {
    id: string;
    preferences: Record<string, any>;
    subscription: 'free' | 'pro' | 'enterprise';
  } | null;
  
  config: ServiceConfig;
  
  performance: {
    fps: number;
    latency: number;
    errorRate: number;
  };
}

// Hook return types for consistency
export interface UseServiceReturn<T = any> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// Event types for cross-service communication
export interface V62Event {
  type: string;
  service: string;
  data: any;
  timestamp: number;
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type AsyncReturnType<T extends (...args: any) => Promise<any>> = 
  T extends (...args: any) => Promise<infer R> ? R : any; 