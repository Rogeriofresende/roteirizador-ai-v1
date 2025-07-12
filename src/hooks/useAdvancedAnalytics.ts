/**
 * 📊 ADVANCED ANALYTICS HOOK
 * Week 7 Day 5: Real-time analytics with user behavior tracking and performance monitoring
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { AdvancedUXService } from '../services/advancedUXService';
import { analyticsService } from '../services/analyticsService';
import { performanceService } from '../services/performance';
import { logger } from '../utils/logger';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface AnalyticsEvent {
  name: string;
  properties: Record<string, any>;
  timestamp: number;
  sessionId: string;
  userId?: string;
}

interface UserBehavior {
  clicks: number;
  scrolls: number;
  timeOnPage: number;
  interactions: number;
  errors: number;
  completedTasks: number;
}

interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  timeToInteractive: number;
}

interface AnalyticsData {
  events: AnalyticsEvent[];
  userBehavior: UserBehavior;
  performance: PerformanceMetrics;
  uxMetrics: any;
}

// =============================================================================
// MAIN HOOK
// =============================================================================

export function useAdvancedAnalytics(config: {
  trackPageViews?: boolean;
  trackInteractions?: boolean;
  trackPerformance?: boolean;
  trackErrors?: boolean;
  realTimeUpdates?: boolean;
  batchSize?: number;
} = {}) {
  const {
    trackPageViews = true,
    trackInteractions = true,
    trackPerformance = true,
    trackErrors = true,
    realTimeUpdates = false,
    batchSize = 50
  } = config;

  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    events: [],
    userBehavior: {
      clicks: 0,
      scrolls: 0,
      timeOnPage: 0,
      interactions: 0,
      errors: 0,
      completedTasks: 0
    },
    performance: {
      pageLoadTime: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      cumulativeLayoutShift: 0,
      firstInputDelay: 0,
      timeToInteractive: 0
    },
    uxMetrics: {}
  });

  const sessionId = useRef<string>(crypto.randomUUID());
  const pageStartTime = useRef<number>(Date.now());
  const eventBuffer = useRef<AnalyticsEvent[]>([]);
  const isInitialized = useRef<boolean>(false);

  // Initialize analytics
  useEffect(() => {
    const initializeAnalytics = async () => {
      if (!isInitialized.current) {
        await AdvancedUXService.initialize();
        isInitialized.current = true;
        
        if (trackPageViews) {
          trackPageView();
        }
        
        if (trackPerformance) {
          setupPerformanceTracking();
        }
        
        if (trackInteractions) {
          setupInteractionTracking();
        }
        
        if (trackErrors) {
          setupErrorTracking();
        }
        
        logger.info('Advanced Analytics initialized', {
          sessionId: sessionId.current,
          config
        }, 'ANALYTICS');
      }
    };

    initializeAnalytics();
  }, []);

  // Flush events periodically
  useEffect(() => {
    const flushInterval = setInterval(() => {
      flushEvents();
    }, 30000); // Flush every 30 seconds

    return () => clearInterval(flushInterval);
  }, []);

  // Track page view
  const trackPageView = useCallback(() => {
    const event: AnalyticsEvent = {
      name: 'page_view',
      properties: {
        url: window.location.href,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        timestamp: Date.now()
      },
      timestamp: Date.now(),
      sessionId: sessionId.current
    };

    addEvent(event);
  }, []);

  // Track custom event
  const trackEvent = useCallback((
    name: string,
    properties: Record<string, any> = {}
  ) => {
    const event: AnalyticsEvent = {
      name,
      properties: {
        ...properties,
        sessionId: sessionId.current,
        timestamp: Date.now()
      },
      timestamp: Date.now(),
      sessionId: sessionId.current
    };

    addEvent(event);
    
    // Update user behavior
    setAnalyticsData(prev => ({
      ...prev,
      userBehavior: {
        ...prev.userBehavior,
        interactions: prev.userBehavior.interactions + 1
      }
    }));
  }, []);

  // Track user action
  const trackUserAction = useCallback((
    action: string,
    target?: string,
    value?: any
  ) => {
    trackEvent('user_action', {
      action,
      target,
      value,
      context: AdvancedUXService.getUserContext()
    });
  }, [trackEvent]);

  // Track error
  const trackError = useCallback((
    error: Error,
    context?: Record<string, any>
  ) => {
    trackEvent('error', {
      message: error.message,
      stack: error.stack,
      context,
      severity: 'error'
    });
    
    setAnalyticsData(prev => ({
      ...prev,
      userBehavior: {
        ...prev.userBehavior,
        errors: prev.userBehavior.errors + 1
      }
    }));
  }, [trackEvent]);

  // Track task completion
  const trackTaskCompletion = useCallback((
    taskName: string,
    success: boolean,
    duration?: number
  ) => {
    trackEvent('task_completion', {
      taskName,
      success,
      duration,
      timestamp: Date.now()
    });
    
    if (success) {
      setAnalyticsData(prev => ({
        ...prev,
        userBehavior: {
          ...prev.userBehavior,
          completedTasks: prev.userBehavior.completedTasks + 1
        }
      }));
    }
  }, [trackEvent]);

  // Add event to buffer
  const addEvent = useCallback((event: AnalyticsEvent) => {
    eventBuffer.current.push(event);
    
    if (realTimeUpdates) {
      setAnalyticsData(prev => ({
        ...prev,
        events: [...prev.events, event].slice(-100) // Keep last 100 events
      }));
    }
    
    // Flush if buffer is full
    if (eventBuffer.current.length >= batchSize) {
      flushEvents();
    }
  }, [realTimeUpdates, batchSize]);

  // Flush events to analytics service
  const flushEvents = useCallback(() => {
    if (eventBuffer.current.length === 0) return;
    
    const eventsToFlush = [...eventBuffer.current];
    eventBuffer.current = [];
    
    eventsToFlush.forEach(event => {
      analyticsService.trackEvent(event.name, event.properties);
    });
    
    logger.debug('Analytics events flushed', {
      count: eventsToFlush.length,
      sessionId: sessionId.current
    }, 'ANALYTICS');
  }, []);

  // Setup performance tracking
  const setupPerformanceTracking = useCallback(() => {
    // Web Vitals
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach(entry => {
          if (entry.entryType === 'largest-contentful-paint') {
            setAnalyticsData(prev => ({
              ...prev,
              performance: {
                ...prev.performance,
                largestContentfulPaint: entry.startTime
              }
            }));
          }
          
          if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
            setAnalyticsData(prev => ({
              ...prev,
              performance: {
                ...prev.performance,
                cumulativeLayoutShift: prev.performance.cumulativeLayoutShift + (entry as any).value
              }
            }));
          }
        });
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint', 'layout-shift'] });
    }
    
    // Page load time
    window.addEventListener('load', () => {
      const loadTime = Date.now() - pageStartTime.current;
      setAnalyticsData(prev => ({
        ...prev,
        performance: {
          ...prev.performance,
          pageLoadTime: loadTime
        }
      }));
      
      trackEvent('page_load_time', { duration: loadTime });
    });
  }, [trackEvent]);

  // Setup interaction tracking
  const setupInteractionTracking = useCallback(() => {
    // Click tracking
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      
      setAnalyticsData(prev => ({
        ...prev,
        userBehavior: {
          ...prev.userBehavior,
          clicks: prev.userBehavior.clicks + 1
        }
      }));
      
      trackEvent('click', {
        elementType: target.tagName,
        elementId: target.id,
        elementClass: target.className,
        x: event.clientX,
        y: event.clientY
      });
    });
    
    // Scroll tracking
    let scrollTimeout: NodeJS.Timeout;
    document.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setAnalyticsData(prev => ({
          ...prev,
          userBehavior: {
            ...prev.userBehavior,
            scrolls: prev.userBehavior.scrolls + 1
          }
        }));
        
        trackEvent('scroll', {
          scrollTop: window.pageYOffset,
          scrollHeight: document.body.scrollHeight,
          viewportHeight: window.innerHeight
        });
      }, 100);
    });
  }, [trackEvent]);

  // Setup error tracking
  const setupErrorTracking = useCallback(() => {
    window.addEventListener('error', (event) => {
      trackError(event.error, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      trackError(new Error(event.reason), {
        type: 'unhandledrejection'
      });
    });
  }, [trackError]);

  // Get analytics summary
  const getAnalyticsSummary = useCallback(() => {
    const timeOnPage = Date.now() - pageStartTime.current;
    const uxMetrics = AdvancedUXService.getUXMetrics();
    
    return {
      sessionId: sessionId.current,
      timeOnPage,
      events: eventBuffer.current.length,
      userBehavior: analyticsData.userBehavior,
      performance: analyticsData.performance,
      uxMetrics
    };
  }, [analyticsData]);

  // Get real-time metrics
  const getRealTimeMetrics = useCallback(() => {
    const currentTime = Date.now();
    const timeOnPage = currentTime - pageStartTime.current;
    
    return {
      ...analyticsData,
      userBehavior: {
        ...analyticsData.userBehavior,
        timeOnPage
      },
      uxMetrics: AdvancedUXService.getUXMetrics()
    };
  }, [analyticsData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      flushEvents();
      
      // Track session end
      trackEvent('session_end', {
        duration: Date.now() - pageStartTime.current,
        totalEvents: eventBuffer.current.length
      });
      
      logger.info('Analytics session ended', {
        sessionId: sessionId.current,
        duration: Date.now() - pageStartTime.current
      }, 'ANALYTICS');
    };
  }, []);

  return {
    trackEvent,
    trackUserAction,
    trackError,
    trackTaskCompletion,
    flushEvents,
    getAnalyticsSummary,
    getRealTimeMetrics,
    analyticsData: realTimeUpdates ? getRealTimeMetrics() : analyticsData
  };
} 