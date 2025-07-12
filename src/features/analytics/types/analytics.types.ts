/**
 * Analytics Types
 * IA Beta - Week 5 - Feature-based Organization
 */

export interface AnalyticsEvent {
  id: string;
  type: EventType;
  properties: Record<string, any>;
  timestamp: Date;
  userId?: string;
  sessionId: string;
}

export type EventType = 
  | 'script_generated'
  | 'voice_synthesized'
  | 'page_viewed'
  | 'button_clicked'
  | 'form_submitted'
  | 'error_occurred'
  | 'feature_used'
  | 'user_action';

export interface AnalyticsMetrics {
  totalUsers: number;
  activeUsers: number;
  scriptsGenerated: number;
  voicesSynthesized: number;
  errorRate: number;
  conversionRate: number;
  retentionRate: number;
  performanceScore: number;
}

export interface UserBehavior {
  userId: string;
  sessions: number;
  avgSessionDuration: number;
  featuresUsed: string[];
  lastActivity: Date;
  conversionStage: 'visitor' | 'trial' | 'subscriber' | 'churn';
}

export interface PerformanceMetrics {
  loadTime: number;
  bundleSize: number;
  memoryUsage: number;
  errorCount: number;
  successRate: number;
  apiResponseTime: number;
} 