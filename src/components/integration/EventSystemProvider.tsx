/**
 * 🚀 EVENT SYSTEM PROVIDER V8.0 - FRONTEND INTEGRATION
 * React provider para UnifiedEventSystem + EventIntegrationLayer
 * Conecta aos 4 providers consolidados Phase 1.3
 * Metodologia: V8.0 Consolidation Strategy
 */

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { UnifiedEventSystem, UnifiedEvent } from '../../services/events/UnifiedEventSystem';
import { EventIntegrationLayer } from '../../services/events/EventIntegrationLayer';
import { useDI } from './DIProvider';
import { useCache } from './CacheProvider';
import { useMonitoring } from './MonitoringProvider';
import { createLogger } from '../../utils/logger';

const logger = createLogger('EventSystemProvider');

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface EventSystemContextValue {
  isInitialized: boolean;
  eventSystem: UnifiedEventSystem | null;
  integrationLayer: EventIntegrationLayer | null;
  
  // Command & Query methods (CQRS)
  executeCommand: <T>(commandType: string, command: T) => Promise<UnifiedEvent[]>;
  executeQuery: <T, R>(queryType: string, query: T) => Promise<R>;
  
  // Event publishing & subscription
  publishEvent: (event: Omit<UnifiedEvent, 'id' | 'timestamp' | 'version' | 'retry_count'>) => Promise<void>;
  subscribe: (eventType: string, handler: (event: UnifiedEvent) => void) => () => void;
  
  // Saga execution
  executeSaga: (sagaType: string, initialData: any) => Promise<any>;
  
  // System status & metrics
  getSystemStatus: () => Promise<any>;
  getMetrics: () => any;
  healthCheck: () => Promise<any>;
  
  // Real-time event stream
  subscribeToEventStream: (callback: (event: UnifiedEvent) => void) => () => void;
}

const EventSystemContext = createContext<EventSystemContextValue | null>(null);

// =============================================================================
// EVENT SYSTEM PROVIDER COMPONENT
// =============================================================================

interface EventSystemProviderProps {
  children: ReactNode;
  autoInitialize?: boolean;
}

export const EventSystemProvider: React.FC<EventSystemProviderProps> = ({
  children,
  autoInitialize = true
}) => {
  const di = useDI();
  const cache = useCache();
  const monitoring = useMonitoring();
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [eventSystem, setEventSystem] = useState<UnifiedEventSystem | null>(null);
  const [integrationLayer, setIntegrationLayer] = useState<EventIntegrationLayer | null>(null);
  const [eventStreamSubscribers] = useState(new Set<(event: UnifiedEvent) => void>());

  // =============================================================================
  // INITIALIZATION
  // =============================================================================

  const initializeEventSystem = useCallback(async () => {
    try {
      logger.info('🚀 Initializing Event System V8.0...');
      const startTime = performance.now();

      // Create UnifiedEventSystem with consolidated providers
      const unifiedEventSystem = new UnifiedEventSystem(
        undefined, // Use default in-memory event store
        {
          di: di.isInitialized ? {
            isInitialized: di.isInitialized,
            services: di.services,
            getService: di.getService,
            registryMetrics: di.registryMetrics
          } : undefined,
          cache: cache.isInitialized ? {
            isInitialized: cache.isInitialized,
            metrics: cache.metrics,
            get: cache.get,
            set: cache.set,
            clear: cache.clear,
            invalidateTag: cache.invalidateTag
          } : undefined,
          monitoring: monitoring.isInitialized ? {
            isInitialized: monitoring.isInitialized,
            systemHealth: monitoring.systemHealth,
            alerts: monitoring.alerts,
            runHealthCheck: monitoring.runHealthCheck,
            performanceMetrics: monitoring.performanceMetrics
          } : undefined,
          performance: {
            metrics: {
              loadTime: monitoring.performanceMetrics?.loadTime || 0,
              memoryUsage: monitoring.performanceMetrics?.memoryUsage || 0,
              responseTime: 0
            },
            budgets: {
              loadTime: 3000,
              memoryUsage: 100,
              responseTime: 200
            },
            recordMetric: (metric: string, value: number) => {
              logger.debug(`Performance metric recorded: ${metric} = ${value}`);
            },
            checkBudget: (metric: string, value: number) => {
              const budgets = { loadTime: 3000, memoryUsage: 100, responseTime: 200 };
              return value <= budgets[metric as keyof typeof budgets];
            }
          }
        }
      );

      // Create integration layer
      const integrationLayer = new EventIntegrationLayer(
        unifiedEventSystem,
        {
          di: di.isInitialized ? {
            isInitialized: di.isInitialized,
            services: di.services,
            getService: di.getService,
            registryMetrics: di.registryMetrics
          } : undefined,
          cache: cache.isInitialized ? {
            isInitialized: cache.isInitialized,
            metrics: cache.metrics,
            get: cache.get,
            set: cache.set,
            clear: cache.clear,
            invalidateTag: cache.invalidateTag
          } : undefined,
          monitoring: monitoring.isInitialized ? {
            isInitialized: monitoring.isInitialized,
            systemHealth: monitoring.systemHealth,
            alerts: monitoring.alerts,
            runHealthCheck: monitoring.runHealthCheck,
            performanceMetrics: monitoring.performanceMetrics
          } : undefined,
          performance: {
            metrics: {
              loadTime: monitoring.performanceMetrics?.loadTime || 0,
              memoryUsage: monitoring.performanceMetrics?.memoryUsage || 0,
              responseTime: 0
            },
            budgets: {
              loadTime: 3000,
              memoryUsage: 100,
              responseTime: 200
            },
            recordMetric: (metric: string, value: number) => {
              logger.debug(`Performance metric recorded: ${metric} = ${value}`);
            },
            checkBudget: (metric: string, value: number) => {
              const budgets = { loadTime: 3000, memoryUsage: 100, responseTime: 200 };
              return value <= budgets[metric as keyof typeof budgets];
            }
          }
        }
      );

      // Setup event stream forwarding
      unifiedEventSystem.on('event-published', (event: UnifiedEvent) => {
        eventStreamSubscribers.forEach(callback => {
          try {
            callback(event);
          } catch (error) {
            logger.error('Error in event stream subscriber:', error);
          }
        });
      });

      setEventSystem(unifiedEventSystem);
      setIntegrationLayer(integrationLayer);
      setIsInitialized(true);

      const duration = performance.now() - startTime;
      logger.info(`✅ Event System V8.0 initialized in ${duration.toFixed(2)}ms`, {
        diIntegration: !!di.isInitialized,
        cacheIntegration: !!cache.isInitialized,
        monitoringIntegration: !!monitoring.isInitialized
      });

      // Publish system initialization event
      await unifiedEventSystem.publishEvent({
        type: 'system.event_system.initialized',
        source: 'EventSystemProvider',
        data: {
          duration,
          integrations: {
            di: !!di.isInitialized,
            cache: !!cache.isInitialized,
            monitoring: !!monitoring.isInitialized
          }
        },
        priority: 'medium'
      });

    } catch (error) {
      logger.error('❌ Failed to initialize Event System:', error);
      throw error;
    }
  }, [di, cache, monitoring, eventStreamSubscribers]);

  // =============================================================================
  // COMMAND & QUERY METHODS
  // =============================================================================

  const executeCommand = useCallback(async <T extends unknown>(
    commandType: string, 
    command: T
  ): Promise<UnifiedEvent[]> => {
    if (!eventSystem) {
      throw new Error('Event system not initialized');
    }
    
    return await eventSystem.executeCommand(commandType, command);
  }, [eventSystem]);

  const executeQuery = useCallback(async <T, R>(
    queryType: string, 
    query: T
  ): Promise<R> => {
    if (!eventSystem) {
      throw new Error('Event system not initialized');
    }
    
    return await eventSystem.executeQuery(queryType, query);
  }, [eventSystem]);

  // =============================================================================
  // EVENT PUBLISHING & SUBSCRIPTION
  // =============================================================================

  const publishEvent = useCallback(async (
    event: Omit<UnifiedEvent, 'id' | 'timestamp' | 'version' | 'retry_count'>
  ): Promise<void> => {
    if (!eventSystem) {
      throw new Error('Event system not initialized');
    }

    const fullEvent: UnifiedEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      version: 1,
      retry_count: 0,
      ...event
    };

    await eventSystem.publishEvent(fullEvent);
  }, [eventSystem]);

  const subscribe = useCallback((
    eventType: string, 
    handler: (event: UnifiedEvent) => void
  ): (() => void) => {
    if (!eventSystem) {
      throw new Error('Event system not initialized');
    }
    
    return eventSystem.subscribe(eventType, handler);
  }, [eventSystem]);

  // =============================================================================
  // SAGA EXECUTION
  // =============================================================================

  const executeSaga = useCallback(async (
    sagaType: string, 
    initialData: any
  ): Promise<any> => {
    if (!eventSystem) {
      throw new Error('Event system not initialized');
    }
    
    return await eventSystem.executeSaga(sagaType, initialData);
  }, [eventSystem]);

  // =============================================================================
  // SYSTEM STATUS & METRICS
  // =============================================================================

  const getSystemStatus = useCallback(async (): Promise<any> => {
    if (!eventSystem) {
      return { initialized: false };
    }
    
    return await executeQuery('system.status', { detailed: true });
  }, [eventSystem, executeQuery]);

  const getMetrics = useCallback((): any => {
    if (!eventSystem || !integrationLayer) {
      return { initialized: false };
    }
    
    return {
      eventSystem: eventSystem.getMetrics(),
      integration: integrationLayer.getIntegrationMetrics(),
      deadLetterQueue: eventSystem.getDeadLetterQueue().length
    };
  }, [eventSystem, integrationLayer]);

  const healthCheck = useCallback(async (): Promise<any> => {
    if (!integrationLayer) {
      return { initialized: false, healthy: false };
    }
    
    return await integrationLayer.healthCheck();
  }, [integrationLayer]);

  // =============================================================================
  // REAL-TIME EVENT STREAM
  // =============================================================================

  const subscribeToEventStream = useCallback((
    callback: (event: UnifiedEvent) => void
  ): (() => void) => {
    eventStreamSubscribers.add(callback);
    
    return () => {
      eventStreamSubscribers.delete(callback);
    };
  }, [eventStreamSubscribers]);

  // =============================================================================
  // EFFECTS
  // =============================================================================

  useEffect(() => {
    if (autoInitialize && !isInitialized) {
      // Wait for consolidated providers to be ready
      if (di.isInitialized || cache.isInitialized || monitoring.isInitialized) {
        initializeEventSystem().catch(error => {
          logger.error('Auto-initialization failed:', error);
        });
      }
    }
  }, [autoInitialize, isInitialized, di.isInitialized, cache.isInitialized, monitoring.isInitialized, initializeEventSystem]);

  // =============================================================================
  // CONTEXT VALUE
  // =============================================================================

  const contextValue: EventSystemContextValue = {
    isInitialized,
    eventSystem,
    integrationLayer,
    executeCommand,
    executeQuery,
    publishEvent,
    subscribe,
    executeSaga,
    getSystemStatus,
    getMetrics,
    healthCheck,
    subscribeToEventStream
  };

  return (
    <EventSystemContext.Provider value={contextValue}>
      {children}
    </EventSystemContext.Provider>
  );
};

// =============================================================================
// CUSTOM HOOKS
// =============================================================================

export const useEventSystem = (): EventSystemContextValue => {
  const context = useContext(EventSystemContext);
  if (!context) {
    throw new Error('useEventSystem must be used within EventSystemProvider');
  }
  return context;
};

// =============================================================================
// SPECIALIZED HOOKS
// =============================================================================

export const useEventPublisher = () => {
  const { publishEvent, isInitialized } = useEventSystem();
  
  return {
    publishEvent,
    isReady: isInitialized
  };
};

export const useEventSubscriber = (eventType: string) => {
  const { subscribe, isInitialized } = useEventSystem();
  const [lastEvent, setLastEvent] = useState<UnifiedEvent | null>(null);
  
  useEffect(() => {
    if (!isInitialized) return;
    
    const unsubscribe = subscribe(eventType, (event) => {
      setLastEvent(event);
    });
    
    return unsubscribe;
  }, [eventType, subscribe, isInitialized]);
  
  return {
    lastEvent,
    isSubscribed: isInitialized
  };
};

export const useCommand = <T extends unknown>(commandType: string) => {
  const { executeCommand, isInitialized } = useEventSystem();
  const [isExecuting, setIsExecuting] = useState(false);
  const [lastResult, setLastResult] = useState<UnifiedEvent[] | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  const execute = useCallback(async (command: T) => {
    if (!isInitialized) {
      throw new Error('Event system not initialized');
    }
    
    setIsExecuting(true);
    setError(null);
    
    try {
      const result = await executeCommand(commandType, command);
      setLastResult(result);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsExecuting(false);
    }
  }, [commandType, executeCommand, isInitialized]);
  
  return {
    execute,
    isExecuting,
    lastResult,
    error,
    isReady: isInitialized
  };
};

export const useQuery = <T, R>(queryType: string) => {
  const { executeQuery, isInitialized } = useEventSystem();
  const [isExecuting, setIsExecuting] = useState(false);
  const [lastResult, setLastResult] = useState<R | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  const execute = useCallback(async (query: T) => {
    if (!isInitialized) {
      throw new Error('Event system not initialized');
    }
    
    setIsExecuting(true);
    setError(null);
    
    try {
      const result = await executeQuery(queryType, query);
      setLastResult(result);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsExecuting(false);
    }
  }, [queryType, executeQuery, isInitialized]);
  
  return {
    execute,
    isExecuting,
    lastResult,
    error,
    isReady: isInitialized
  };
};

export const useSaga = (sagaType: string) => {
  const { executeSaga, isInitialized } = useEventSystem();
  const [isExecuting, setIsExecuting] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);
  
  const execute = useCallback(async (initialData: any) => {
    if (!isInitialized) {
      throw new Error('Event system not initialized');
    }
    
    setIsExecuting(true);
    setError(null);
    
    try {
      const result = await executeSaga(sagaType, initialData);
      setLastResult(result);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsExecuting(false);
    }
  }, [sagaType, executeSaga, isInitialized]);
  
  return {
    execute,
    isExecuting,
    lastResult,
    error,
    isReady: isInitialized
  };
};

// =============================================================================
// EXPORTS
// =============================================================================

export default EventSystemProvider; 