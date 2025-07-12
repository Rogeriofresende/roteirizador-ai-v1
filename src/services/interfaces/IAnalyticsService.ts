/**
 * Analytics Service Interface
 * Contract para serviços de analytics e tracking
 */

import { IBaseService } from './IBaseService';

export interface AnalyticsEvent {
  name: string;
  parameters?: Record<string, any>;
  timestamp?: Date;
  userId?: string;
  sessionId?: string;
}

export interface AnalyticsPageView {
  page: string;
  title?: string;
  referrer?: string;
  timestamp?: Date;
}

export interface AnalyticsUserProperties {
  userId: string;
  properties: Record<string, any>;
}

export interface AnalyticsMetrics {
  totalEvents: number;
  uniqueUsers: number;
  pageViews: number;
  sessionDuration: number;
  conversionRate?: number;
}

export interface IAnalyticsService extends IBaseService {
  // Event tracking
  track(event: AnalyticsEvent): Promise<void>;
  trackPageView(pageView: AnalyticsPageView): Promise<void>;
  
  // User management
  setUserProperties(userProps: AnalyticsUserProperties): Promise<void>;
  setUserId(userId: string): Promise<void>;
  
  // Session management
  startSession(): Promise<string>;
  endSession(sessionId: string): Promise<void>;
  
  // Data retrieval
  getMetrics(timeRange?: { start: Date; end: Date }): Promise<AnalyticsMetrics>;
  getEvents(filters?: Record<string, any>): Promise<AnalyticsEvent[]>;
  
  // Configuration
  configure(config: AnalyticsConfig): Promise<void>;
  isEnabled(): boolean;
}

export interface AnalyticsConfig {
  trackingId?: string;
  clarityProjectId?: string;
  tallyFormIds?: {
    feedback?: string;
    nps?: string;
    features?: string;
    bugs?: string;
  };
  enabled: boolean;
  debug?: boolean;
  sampleRate?: number;
} 