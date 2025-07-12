/**
 * Mock Analytics Service
 * Service mock para testes e desenvolvimento
 */

import { BaseService } from '../abstracts/BaseService';
import {
  IAnalyticsService,
  AnalyticsEvent,
  AnalyticsPageView,
  AnalyticsUserProperties,
  AnalyticsMetrics,
  AnalyticsConfig,
  ServiceConfig
} from '../interfaces';

export class MockAnalyticsService extends BaseService implements IAnalyticsService {
  private events: AnalyticsEvent[] = [];
  private pageViews: AnalyticsPageView[] = [];
  private userProperties: Map<string, Record<string, any>> = new Map();
  private currentUserId?: string;
  private sessionId?: string;
  private analyticsConfig?: AnalyticsConfig;

  constructor(config: ServiceConfig) {
    super(config);
  }

  getServiceName(): string {
    return 'MockAnalyticsService';
  }

  getVersion(): string {
    return '1.0.0';
  }

  protected async onInitialize(): Promise<void> {
    this.logger.info('Mock Analytics Service initialized - no real tracking');
  }

  async track(event: AnalyticsEvent): Promise<void> {
    return this.executeWithMetrics(async () => {
      this.events.push({
        ...event,
        timestamp: event.timestamp || new Date(),
        userId: event.userId || this.currentUserId,
        sessionId: event.sessionId || this.sessionId
      });

      this.logger.debug('Event tracked (mock)', {
        name: event.name,
        parameters: event.parameters
      });
    }, 'track');
  }

  async trackPageView(pageView: AnalyticsPageView): Promise<void> {
    return this.executeWithMetrics(async () => {
      this.pageViews.push({
        ...pageView,
        timestamp: pageView.timestamp || new Date()
      });

      this.logger.debug('Page view tracked (mock)', {
        page: pageView.page,
        title: pageView.title
      });
    }, 'trackPageView');
  }

  async setUserProperties(userProps: AnalyticsUserProperties): Promise<void> {
    return this.executeWithMetrics(async () => {
      this.userProperties.set(userProps.userId, userProps.properties);
      
      this.logger.debug('User properties set (mock)', {
        userId: userProps.userId,
        properties: Object.keys(userProps.properties)
      });
    }, 'setUserProperties');
  }

  async setUserId(userId: string): Promise<void> {
    return this.executeWithMetrics(async () => {
      this.currentUserId = userId;
      
      this.logger.debug('User ID set (mock)', { userId });
    }, 'setUserId');
  }

  async startSession(): Promise<string> {
    return this.executeWithMetrics(async () => {
      this.sessionId = `mock-session-${Date.now()}`;
      
      this.logger.debug('Session started (mock)', { sessionId: this.sessionId });
      
      return this.sessionId;
    }, 'startSession');
  }

  async endSession(sessionId: string): Promise<void> {
    return this.executeWithMetrics(async () => {
      if (this.sessionId === sessionId) {
        this.sessionId = undefined;
      }
      
      this.logger.debug('Session ended (mock)', { sessionId });
    }, 'endSession');
  }

  async getMetrics(timeRange?: { start: Date; end: Date }): Promise<AnalyticsMetrics> {
    return this.executeWithMetrics(async () => {
      const filteredEvents = timeRange 
        ? this.events.filter(e => 
            e.timestamp && 
            e.timestamp >= timeRange.start && 
            e.timestamp <= timeRange.end
          )
        : this.events;

      const filteredPageViews = timeRange
        ? this.pageViews.filter(pv =>
            pv.timestamp &&
            pv.timestamp >= timeRange.start &&
            pv.timestamp <= timeRange.end
          )
        : this.pageViews;

      const uniqueUsers = new Set(filteredEvents.map(e => e.userId).filter(Boolean)).size;

      return {
        totalEvents: filteredEvents.length,
        uniqueUsers,
        pageViews: filteredPageViews.length,
        sessionDuration: 0, // Mock value
        conversionRate: 0.1 // Mock value
      };
    }, 'getMetrics');
  }

  async getEvents(filters?: Record<string, any>): Promise<AnalyticsEvent[]> {
    return this.executeWithMetrics(async () => {
      if (!filters) {
        return [...this.events];
      }

      return this.events.filter(event => {
        return Object.entries(filters).every(([key, value]) => {
          if (key === 'name') {
            return event.name === value;
          }
          if (key === 'userId') {
            return event.userId === value;
          }
          if (event.parameters && key in event.parameters) {
            return event.parameters[key] === value;
          }
          return false;
        });
      });
    }, 'getEvents');
  }

  async configure(config: AnalyticsConfig): Promise<void> {
    return this.executeWithMetrics(async () => {
      this.analyticsConfig = config;
      
      this.logger.info('Analytics configured (mock)', {
        enabled: config.enabled,
        debug: config.debug
      });
    }, 'configure');
  }

  isEnabled(): boolean {
    return this.analyticsConfig?.enabled ?? this.config.enabled;
  }

  // Mock-specific methods for testing
  getMockData() {
    return {
      events: [...this.events],
      pageViews: [...this.pageViews],
      userProperties: Object.fromEntries(this.userProperties),
      currentUserId: this.currentUserId,
      sessionId: this.sessionId
    };
  }

  clearMockData(): void {
    this.events = [];
    this.pageViews = [];
    this.userProperties.clear();
    this.currentUserId = undefined;
    this.sessionId = undefined;
    
    this.logger.debug('Mock data cleared');
  }

  protected async checkHealth() {
    return {
      status: 'healthy' as const,
      details: {
        totalEvents: this.events.length,
        totalPageViews: this.pageViews.length,
        totalUsers: this.userProperties.size,
        isMock: true
      }
    };
  }
} 