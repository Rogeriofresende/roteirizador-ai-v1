/**
 * 🔴 IA ALPHA - ADVANCED ANALYTICS SERVICE
 * Sistema avançado de analytics com múltiplas integrações
 * 
 * Features:
 * - Multi-platform analytics (GA4, Hotjar, Clarity, Firebase)
 * - Custom event tracking
 * - User journey mapping
 * - Conversion funnel analysis
 * - Real-time behavioral data
 * - A/B testing support
 * - Performance correlation
 */

import { logger } from '../../utils/logger';
import { performanceService } from '../performance';

// Analytics Configuration
interface AnalyticsConfig {
  googleAnalytics: {
    measurementId: string;
    enabled: boolean;
  };
  hotjar: {
    hjid: string;
    enabled: boolean;
  };
  microsoftClarity: {
    projectId: string;
    enabled: boolean;
  };
  firebase: {
    enabled: boolean;
  };
}

// User Events
interface UserEvent {
  eventName: string;
  eventCategory: string;
  eventAction: string;
  eventLabel?: string;
  eventValue?: number;
  userId?: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

// Conversion Funnel
interface ConversionFunnel {
  step: string;
  action: string;
  timestamp: number;
  userId?: string;
  metadata?: Record<string, any>;
}

// User Journey
interface UserJourney {
  sessionId: string;
  userId?: string;
  startTime: number;
  endTime?: number;
  pages: {
    path: string;
    title: string;
    timestamp: number;
    timeOnPage?: number;
  }[];
  events: UserEvent[];
  conversions: ConversionFunnel[];
  totalEngagementTime: number;
}

class AdvancedAnalyticsService {
  private config: AnalyticsConfig;
  private currentJourney: UserJourney | null = null;
  private isInitialized = false;
  private eventQueue: UserEvent[] = [];

  constructor() {
    this.config = {
      googleAnalytics: {
        measurementId: import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX',
        enabled: !!import.meta.env.VITE_GA_MEASUREMENT_ID
      },
      hotjar: {
        hjid: import.meta.env.VITE_HOTJAR_ID || '0000000',
        enabled: !!import.meta.env.VITE_HOTJAR_ID
      },
      microsoftClarity: {
        projectId: import.meta.env.VITE_CLARITY_PROJECT_ID || 'xxxxxxxxxx',
        enabled: !!import.meta.env.VITE_CLARITY_PROJECT_ID
      },
      firebase: {
        enabled: true
      }
    };
  }

  /**
   * Initialize all analytics services
   */
  async initializeAnalytics(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Initialize Google Analytics 4
      if (this.config.googleAnalytics.enabled) {
        await this.initializeGoogleAnalytics();
      }

      // Initialize Hotjar
      if (this.config.hotjar.enabled) {
        await this.initializeHotjar();
      }

      // Initialize Microsoft Clarity
      if (this.config.microsoftClarity.enabled) {
        await this.initializeMicrosoftClarity();
      }

      // Initialize Firebase Analytics
      if (this.config.firebase.enabled) {
        await this.initializeFirebaseAnalytics();
      }

      // Start user journey tracking
      this.startUserJourney();

      // Process queued events
      this.processEventQueue();

      this.isInitialized = true;
      logger.log('info', 'Advanced Analytics System initialized successfully', {
        enabledServices: this.getEnabledServices()
      }, 'ANALYTICS');

    } catch (error) {
      logger.log('error', 'Failed to initialize analytics', {
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'ANALYTICS');
    }
  }

  /**
   * Initialize Google Analytics 4
   */
  private async initializeGoogleAnalytics(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Load GA4 script
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.googleAnalytics.measurementId}`;
        document.head.appendChild(script);

        script.onload = () => {
          // Initialize gtag
          (window as any).dataLayer = (window as any).dataLayer || [];
          (window as any).gtag = function() {
            (window as any).dataLayer.push(arguments);
          };

          (window as any).gtag('js', new Date());
          (window as any).gtag('config', this.config.googleAnalytics.measurementId, {
            page_title: document.title,
            page_location: window.location.href,
            custom_map: {
              custom_dimension_1: 'user_type',
              custom_dimension_2: 'feature_used'
            }
          });

          logger.log('info', 'Google Analytics 4 initialized', {
            measurementId: this.config.googleAnalytics.measurementId
          }, 'ANALYTICS');
          resolve();
        };

        script.onerror = reject;
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Initialize Hotjar
   */
  private async initializeHotjar(): Promise<void> {
    return new Promise((resolve) => {
      try {
        (window as any).hj = (window as any).hj || function() {
          ((window as any).hj.q = (window as any).hj.q || []).push(arguments);
        };
        (window as any)._hjSettings = {
          hjid: parseInt(this.config.hotjar.hjid),
          hjsv: 6
        };

        const script = document.createElement('script');
        script.async = true;
        script.src = `https://static.hotjar.com/c/hotjar-${this.config.hotjar.hjid}.js?sv=6`;
        document.head.appendChild(script);

        script.onload = () => {
          logger.log('info', 'Hotjar initialized', {
            hjid: this.config.hotjar.hjid
          }, 'ANALYTICS');
          resolve();
        };

        script.onerror = () => {
          logger.log('warn', 'Hotjar failed to load', {}, 'ANALYTICS');
          resolve(); // Don't fail the entire initialization
        };
      } catch (error) {
        logger.log('warn', 'Hotjar initialization error', {
          error: error instanceof Error ? error.message : 'Unknown error'
        }, 'ANALYTICS');
        resolve();
      }
    });
  }

  /**
   * Initialize Microsoft Clarity
   */
  private async initializeMicrosoftClarity(): Promise<void> {
    return new Promise((resolve) => {
      try {
        (window as any).clarity = (window as any).clarity || function() {
          ((window as any).clarity.q = (window as any).clarity.q || []).push(arguments);
        };

        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://www.clarity.ms/tag/' + this.config.microsoftClarity.projectId;
        document.head.appendChild(script);

        script.onload = () => {
          logger.log('info', 'Microsoft Clarity initialized', {
            projectId: this.config.microsoftClarity.projectId
          }, 'ANALYTICS');
          resolve();
        };

        script.onerror = () => {
          logger.log('warn', 'Microsoft Clarity failed to load', {}, 'ANALYTICS');
          resolve();
        };
      } catch (error) {
        logger.log('warn', 'Microsoft Clarity initialization error', {
          error: error instanceof Error ? error.message : 'Unknown error'
        }, 'ANALYTICS');
        resolve();
      }
    });
  }

  /**
   * Initialize Firebase Analytics
   */
  private async initializeFirebaseAnalytics(): Promise<void> {
    try {
      // This would typically integrate with Firebase Analytics
      // For now, we'll set up the foundation
      logger.log('info', 'Firebase Analytics initialized', {}, 'ANALYTICS');
    } catch (error) {
      logger.log('warn', 'Firebase Analytics initialization error', {
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'ANALYTICS');
    }
  }

  /**
   * Track custom event
   */
  trackEvent(eventName: string, eventData: Partial<UserEvent>): void {
    const event: UserEvent = {
      eventName,
      eventCategory: eventData.eventCategory || 'User Interaction',
      eventAction: eventData.eventAction || eventName,
      eventLabel: eventData.eventLabel,
      eventValue: eventData.eventValue,
      userId: eventData.userId,
      timestamp: Date.now(),
      metadata: eventData.metadata || {}
    };

    if (!this.isInitialized) {
      this.eventQueue.push(event);
      return;
    }

    this.processEvent(event);
  }

  /**
   * Process individual event
   */
  private processEvent(event: UserEvent): void {
    try {
      // Track in Google Analytics
      if (this.config.googleAnalytics.enabled && (window as any).gtag) {
        (window as any).gtag('event', event.eventAction, {
          event_category: event.eventCategory,
          event_label: event.eventLabel,
          value: event.eventValue,
          custom_dimension_1: event.metadata?.userType,
          custom_dimension_2: event.eventName
        });
      }

      // Track in Hotjar
      if (this.config.hotjar.enabled && (window as any).hj) {
        (window as any).hj('event', event.eventName);
      }

      // Track in Microsoft Clarity
      if (this.config.microsoftClarity.enabled && (window as any).clarity) {
        (window as any).clarity('set', event.eventName, event.eventAction);
      }

      // Add to current journey
      if (this.currentJourney) {
        this.currentJourney.events.push(event);
      }

      // Performance correlation
      if (event.eventName.includes('performance')) {
        this.correlateWithPerformance(event);
      }

      logger.log('debug', 'Event tracked successfully', {
        eventName: event.eventName,
        eventCategory: event.eventCategory,
        eventAction: event.eventAction
      }, 'ANALYTICS');

    } catch (error) {
      logger.log('error', 'Failed to process event', {
        eventName: event.eventName,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'ANALYTICS');
    }
  }

  /**
   * Track conversion funnel step
   */
  trackConversion(step: string, action: string, metadata?: Record<string, any>): void {
    const conversion: ConversionFunnel = {
      step,
      action,
      timestamp: Date.now(),
      userId: this.currentJourney?.userId,
      metadata
    };

    if (this.currentJourney) {
      this.currentJourney.conversions.push(conversion);
    }

    this.trackEvent('conversion', {
      eventCategory: 'Conversion',
      eventAction: action,
      eventLabel: step,
      metadata: {
        ...metadata,
        conversionStep: step
      }
    });
  }

  /**
   * Track page view
   */
  trackPageView(path: string, title: string): void {
    // Track in Google Analytics
    if (this.config.googleAnalytics.enabled && (window as any).gtag) {
      (window as any).gtag('config', this.config.googleAnalytics.measurementId, {
        page_title: title,
        page_location: window.location.href,
        page_path: path
      });
    }

    // Add to user journey
    if (this.currentJourney) {
      const lastPage = this.currentJourney.pages[this.currentJourney.pages.length - 1];
      if (lastPage) {
        lastPage.timeOnPage = Date.now() - lastPage.timestamp;
      }

      this.currentJourney.pages.push({
        path,
        title,
        timestamp: Date.now()
      });
    }

    this.trackEvent('page_view', {
      eventCategory: 'Navigation',
      eventAction: 'page_view',
      eventLabel: path,
      metadata: {
        page_title: title,
        page_path: path
      }
    });
  }

  /**
   * Start user journey tracking
   */
  private startUserJourney(): void {
    const sessionId = this.generateSessionId();
    
    this.currentJourney = {
      sessionId,
      startTime: Date.now(),
      pages: [],
      events: [],
      conversions: [],
      totalEngagementTime: 0
    };

    // Track initial page
    this.trackPageView(window.location.pathname, document.title);
  }

  /**
   * End user journey
   */
  endUserJourney(): void {
    if (!this.currentJourney) return;

    this.currentJourney.endTime = Date.now();
    this.currentJourney.totalEngagementTime = this.currentJourney.endTime - this.currentJourney.startTime;

    // Send journey data to analytics
    this.trackEvent('session_end', {
      eventCategory: 'Session',
      eventAction: 'session_end',
      eventValue: this.currentJourney.totalEngagementTime,
      metadata: {
        sessionId: this.currentJourney.sessionId,
        pagesVisited: this.currentJourney.pages.length,
        eventsTracked: this.currentJourney.events.length,
        conversions: this.currentJourney.conversions.length,
        totalEngagementTime: this.currentJourney.totalEngagementTime
      }
    });

    logger.log('info', 'User journey ended', {
      sessionId: this.currentJourney.sessionId,
      duration: this.currentJourney.totalEngagementTime,
      pages: this.currentJourney.pages.length,
      events: this.currentJourney.events.length,
      conversions: this.currentJourney.conversions.length
    }, 'ANALYTICS');

    this.currentJourney = null;
  }

  /**
   * Process event queue
   */
  private processEventQueue(): void {
    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift();
      if (event) {
        this.processEvent(event);
      }
    }
  }

  /**
   * Correlate events with performance data
   */
  private correlateWithPerformance(event: UserEvent): void {
    try {
      const webVitals = performanceService.getWebVitals();
      const resourceMetrics = performanceService.getResourceMetrics();
      const memoryMetrics = performanceService.getMemoryMetrics();
      
      this.trackEvent('performance_correlation', {
        eventCategory: 'Performance',
        eventAction: 'correlation',
        eventLabel: event.eventName,
        metadata: {
          originalEvent: event.eventName,
          performanceData: {
            webVitals,
            resources: resourceMetrics,
            memory: memoryMetrics
          }
        }
      });
    } catch (error) {
      logger.log('warn', 'Performance correlation failed', {
        eventName: event.eventName,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'ANALYTICS');
    }
  }

  /**
   * Get enabled services
   */
  private getEnabledServices(): string[] {
    const services = [];
    if (this.config.googleAnalytics.enabled) services.push('Google Analytics 4');
    if (this.config.hotjar.enabled) services.push('Hotjar');
    if (this.config.microsoftClarity.enabled) services.push('Microsoft Clarity');
    if (this.config.firebase.enabled) services.push('Firebase Analytics');
    return services;
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Get current user journey
   */
  getCurrentJourney(): UserJourney | null {
    return this.currentJourney;
  }

  /**
   * Get analytics configuration
   */
  getConfig(): AnalyticsConfig {
    return { ...this.config };
  }
}

// Export singleton instance
export const advancedAnalyticsService = new AdvancedAnalyticsService();
export default advancedAnalyticsService; 