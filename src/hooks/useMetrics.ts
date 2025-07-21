/**
 * 📊 USE METRICS HOOK V9.0
 * 
 * Hook React para integração simples com o sistema de métricas
 * Fornece interface declarativa para tracking de eventos
 * 
 * @methodology V9.0_NATURAL_LANGUAGE_FIRST
 * @specification HOOK-METRICS-001
 * @author IA Beta - React Integration Architect
 */

import { useCallback, useEffect, useRef } from 'react';
import { metricsService, MetricEventType } from '../services/analytics/metricsService';
import { useAuth } from '../contexts/AuthContext';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface UseMetricsOptions {
  /** ID da sessão personalizada (opcional) */
  sessionId?: string;
  /** Ativar tracking automático de página */
  autoTrackPageView?: boolean;
  /** Ativar tracking automático de performance */
  autoTrackPerformance?: boolean;
  /** Prefixo para categorização de eventos */
  eventPrefix?: string;
}

interface MetricsHookReturn {
  /** Rastreia evento personalizado */
  trackEvent: (type: MetricEventType, data?: Record<string, any>, duration?: number) => void;
  /** Rastreia uso de funcionalidade */
  trackFeature: (feature: string, action: string, metadata?: Record<string, any>) => void;
  /** Rastreia geração de roteiro */
  trackScriptGeneration: (config: Record<string, any>, success: boolean, duration: number) => void;
  /** Rastreia exportação de roteiro */
  trackScriptExport: (format: string, scriptTitle: string, success: boolean) => void;
  /** Rastreia erro da aplicação */
  trackError: (error: Error, context: string) => void;
  /** Rastreia chamada de API */
  trackApiCall: (endpoint: string, method: string, responseTime: number, success: boolean) => void;
  /** Rastreia tempo gasto em componente */
  trackComponentTime: (componentName: string) => () => void;
  /** Inicia tracking da sessão atual */
  startSession: () => string;
  /** Finaliza tracking da sessão atual */
  endSession: () => void;
}

// ============================================================================
// USE METRICS HOOK
// ============================================================================

export const useMetrics = (options: UseMetricsOptions = {}): MetricsHookReturn => {
  const { currentUser } = useAuth();
  const sessionStartTime = useRef<number | null>(null);
  const componentStartTime = useRef<number | null>(null);
  
  const {
    sessionId: customSessionId,
    autoTrackPageView = true,
    autoTrackPerformance = true,
    eventPrefix = ''
  } = options;

  // ============================================================================
  // TRACKING FUNCTIONS
  // ============================================================================

  const trackEvent = useCallback((
    type: MetricEventType, 
    data: Record<string, any> = {}, 
    duration?: number
  ) => {
    const eventType = eventPrefix ? `${eventPrefix}_${type}` as MetricEventType : type;
    metricsService.trackEvent(eventType, data, currentUser?.uid, duration);
  }, [currentUser?.uid, eventPrefix]);

  const trackFeature = useCallback((
    feature: string, 
    action: string, 
    metadata: Record<string, any> = {}
  ) => {
    const featureName = eventPrefix ? `${eventPrefix}_${feature}` : feature;
    metricsService.trackFeatureUsage(featureName, action, metadata, currentUser?.uid);
  }, [currentUser?.uid, eventPrefix]);

  const trackScriptGeneration = useCallback((
    config: Record<string, any>, 
    success: boolean, 
    duration: number
  ) => {
    metricsService.trackScriptGeneration(config, success, duration, currentUser?.uid);
  }, [currentUser?.uid]);

  const trackScriptExport = useCallback((
    format: string, 
    scriptTitle: string, 
    success: boolean
  ) => {
    metricsService.trackScriptExport(format, scriptTitle, success, currentUser?.uid);
  }, [currentUser?.uid]);

  const trackError = useCallback((error: Error, context: string) => {
    const errorContext = eventPrefix ? `${eventPrefix}_${context}` : context;
    metricsService.trackError(error, errorContext, currentUser?.uid);
  }, [currentUser?.uid, eventPrefix]);

  const trackApiCall = useCallback((
    endpoint: string, 
    method: string, 
    responseTime: number, 
    success: boolean
  ) => {
    metricsService.trackApiCall(endpoint, method, responseTime, success, currentUser?.uid);
  }, [currentUser?.uid]);

  const trackComponentTime = useCallback((componentName: string) => {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      trackEvent('user_interaction', {
        component: componentName,
        interactionType: 'component_usage',
        duration
      }, duration);
    };
  }, [trackEvent]);

  const startSession = useCallback((): string => {
    if (!currentUser?.uid) {
      throw new Error('Cannot start session without authenticated user');
    }
    
    sessionStartTime.current = Date.now();
    return metricsService.startUserSession(currentUser.uid);
  }, [currentUser?.uid]);

  const endSession = useCallback(() => {
    if (customSessionId) {
      metricsService.endUserSession(customSessionId);
    }
    sessionStartTime.current = null;
  }, [customSessionId]);

  // ============================================================================
  // AUTO TRACKING EFFECTS
  // ============================================================================

  // Auto track page view
  useEffect(() => {
    if (!autoTrackPageView) return;

    const currentPage = window.location.pathname;
    metricsService.trackPageView(currentPage, currentUser?.uid);
  }, [autoTrackPageView, currentUser?.uid]);

  // Auto track performance metrics
  useEffect(() => {
    if (!autoTrackPerformance) return;

    const trackPerformance = () => {
      // Track page load time
      if (performance.navigation && performance.timing) {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        if (loadTime > 0) {
          trackEvent('performance_metric', {
            metric: 'page_load_time',
            value: loadTime,
            page: window.location.pathname
          });
        }
      }

      // Track memory usage if available
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        trackEvent('performance_metric', {
          metric: 'memory_usage',
          value: memory.usedJSHeapSize,
          totalHeapSize: memory.totalJSHeapSize,
          heapSizeLimit: memory.heapSizeLimit
        });
      }
    };

    // Track on mount and periodically
    trackPerformance();
    const interval = setInterval(trackPerformance, 60000); // Every minute

    return () => clearInterval(interval);
  }, [autoTrackPerformance, trackEvent]);

  // Track user interactions
  useEffect(() => {
    const handleUserInteraction = (event: Event) => {
      const target = event.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      const elementInfo = {
        tag: tagName,
        className: target.className,
        id: target.id,
        textContent: target.textContent?.slice(0, 50)
      };

      trackEvent('user_interaction', {
        type: event.type,
        element: elementInfo,
        timestamp: Date.now()
      });
    };

    // Track clicks and form submissions
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('submit', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('submit', handleUserInteraction);
    };
  }, [trackEvent]);

  // Track errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      trackError(
        new Error(event.message), 
        `${event.filename}:${event.lineno}:${event.colno}`
      );
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      trackError(
        new Error(event.reason?.message || 'Unhandled Promise Rejection'),
        'promise_rejection'
      );
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [trackError]);

  // Start session on user login
  useEffect(() => {
    if (currentUser?.uid && !sessionStartTime.current) {
      startSession();
    }
  }, [currentUser?.uid, startSession]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sessionStartTime.current) {
        endSession();
      }
    };
  }, [endSession]);

  // ============================================================================
  // RETURN HOOK API
  // ============================================================================

  return {
    trackEvent,
    trackFeature,
    trackScriptGeneration,
    trackScriptExport,
    trackError,
    trackApiCall,
    trackComponentTime,
    startSession,
    endSession
  };
};

// ============================================================================
// SPECIALIZED HOOKS
// ============================================================================

/**
 * Hook especializado para tracking de componentes específicos
 */
export const useComponentMetrics = (componentName: string) => {
  const metrics = useMetrics({ 
    eventPrefix: 'component',
    autoTrackPageView: false 
  });
  
  const componentTrackRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Iniciar tracking do componente
    componentTrackRef.current = metrics.trackComponentTime(componentName);
    
    // Registrar montagem do componente
    metrics.trackEvent('user_interaction', {
      component: componentName,
      action: 'mounted'
    });

    return () => {
      // Finalizar tracking e registrar desmontagem
      if (componentTrackRef.current) {
        componentTrackRef.current();
      }
      
      metrics.trackEvent('user_interaction', {
        component: componentName,
        action: 'unmounted'
      });
    };
  }, [componentName, metrics]);

  return {
    ...metrics,
    componentName
  };
};

/**
 * Hook para tracking de features específicas
 */
export const useFeatureMetrics = (featureName: string) => {
  const metrics = useMetrics({ 
    eventPrefix: 'feature',
    autoTrackPageView: false 
  });

  const trackFeatureAction = useCallback((action: string, metadata?: Record<string, any>) => {
    metrics.trackFeature(featureName, action, metadata);
  }, [metrics, featureName]);

  const trackFeatureError = useCallback((error: Error, action: string) => {
    metrics.trackError(error, `${featureName}_${action}`);
  }, [metrics, featureName]);

  const trackFeaturePerformance = useCallback((action: string, duration: number) => {
    metrics.trackEvent('performance_metric', {
      feature: featureName,
      action,
      duration
    }, duration);
  }, [metrics, featureName]);

  return {
    ...metrics,
    featureName,
    trackFeatureAction,
    trackFeatureError,
    trackFeaturePerformance
  };
};

export default useMetrics;