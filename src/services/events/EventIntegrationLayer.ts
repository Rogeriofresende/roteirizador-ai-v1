/**
 * 🔌 EVENT INTEGRATION LAYER V8.0 - CONSOLIDATION BRIDGE
 * Conecta UnifiedEventSystem aos 4 sistemas consolidados Phase 1.3
 * Integration: DIProvider + CacheProvider + MonitoringProvider + PerformanceProvider
 * Metodologia: V8.0 Consolidation Strategy
 */

import { UnifiedEventSystem, UnifiedEvent } from './UnifiedEventSystem';
import { createLogger } from '../../utils/logger';

const logger = createLogger('EventIntegrationLayer');

// =============================================================================
// INTEGRATION INTERFACES
// =============================================================================

interface DIProviderIntegration {
  isInitialized: boolean;
  services: Record<string, any>;
  getService: <T>(identifier: string) => T | null;
  registryMetrics: {
    totalServices: number;
    healthyServices: number;
    averageResponseTime: number;
  };
}

interface CacheProviderIntegration {
  isInitialized: boolean;
  metrics: {
    hitRate: number;
    memoryUsage: number;
    entriesCount: number;
  };
  get: <T>(key: string) => Promise<T | null>;
  set: <T>(key: string, value: T, config?: any) => Promise<void>;
  clear: (tags?: string[]) => Promise<void>;
  invalidateTag: (tag: string) => Promise<void>;
}

interface MonitoringProviderIntegration {
  isInitialized: boolean;
  systemHealth: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    score: number;
  };
  alerts: any[];
  runHealthCheck: () => Promise<any>;
  performanceMetrics: {
    fps: number;
    memoryUsage: number;
    networkLatency: number;
    renderTime: number;
  };
}

interface PerformanceProviderIntegration {
  metrics: {
    loadTime: number;
    memoryUsage: number;
    responseTime: number;
  };
  budgets: {
    loadTime: number;
    memoryUsage: number;
    responseTime: number;
  };
  recordMetric: (metric: string, value: number) => void;
  checkBudget: (metric: string, value: number) => boolean;
}

// =============================================================================
// EVENT INTEGRATION LAYER - MAIN CLASS
// =============================================================================

export class EventIntegrationLayer {
  private eventSystem: UnifiedEventSystem;
  private diProvider?: DIProviderIntegration;
  private cacheProvider?: CacheProviderIntegration;
  private monitoringProvider?: MonitoringProviderIntegration;
  private performanceProvider?: PerformanceProviderIntegration;
  
  private integrationMetrics = {
    eventsProcessed: 0,
    cacheOperations: 0,
    healthChecks: 0,
    performanceAlerts: 0,
    serviceRegistrations: 0
  };

  constructor(
    eventSystem: UnifiedEventSystem,
    providers: {
      di?: DIProviderIntegration;
      cache?: CacheProviderIntegration;
      monitoring?: MonitoringProviderIntegration;
      performance?: PerformanceProviderIntegration;
    }
  ) {
    this.eventSystem = eventSystem;
    this.diProvider = providers.di;
    this.cacheProvider = providers.cache;
    this.monitoringProvider = providers.monitoring;
    this.performanceProvider = providers.performance;

    this.setupEventIntegrations();
    this.setupCommandHandlers();
    this.setupQueryHandlers();
    this.setupSagas();
    
    logger.info('🔌 Event Integration Layer V8.0 initialized', {
      diIntegration: !!this.diProvider,
      cacheIntegration: !!this.cacheProvider,
      monitoringIntegration: !!this.monitoringProvider,
      performanceIntegration: !!this.performanceProvider
    });
  }

  // =============================================================================
  // EVENT INTEGRATIONS - CORE CONNECTIONS
  // =============================================================================

  private setupEventIntegrations(): void {
    // CACHE INTEGRATION EVENTS
    this.eventSystem.subscribe('cache.invalidate', async (event: UnifiedEvent) => {
      if (this.cacheProvider) {
        const { tags, keys } = event.data;
        
        if (tags) {
          for (const tag of tags) {
            await this.cacheProvider.invalidateTag(tag);
          }
        }
        
        if (keys) {
          // Individual key invalidation would need cache provider enhancement
          await this.cacheProvider.clear(keys);
        }

        this.integrationMetrics.cacheOperations++;
        
        logger.info('Cache invalidation processed', { tags, keys });
      }
    });

    // HEALTH MONITORING EVENTS
    this.eventSystem.subscribe('health.degraded', async (event: UnifiedEvent) => {
      if (this.monitoringProvider) {
        const { component, severity, details } = event.data;
        
        // Create alert in monitoring system
        this.monitoringProvider.alerts.push({
          id: event.id,
          type: 'performance',
          severity: severity || 'medium',
          title: `Health Degraded: ${component}`,
          message: details || 'System health degradation detected',
          timestamp: event.timestamp,
          acknowledged: false,
          metadata: event.metadata
        });

        this.integrationMetrics.healthChecks++;
        
        logger.warn('Health degradation alert created', { component, severity });
      }
    });

    // PERFORMANCE BUDGET EVENTS  
    this.eventSystem.subscribe('performance.budget.exceeded', async (event: UnifiedEvent) => {
      if (this.performanceProvider && this.monitoringProvider) {
        const { metric, currentValue, budgetValue } = event.data;
        
        // Record in performance provider
        this.performanceProvider.recordMetric(`budget.exceeded.${metric}`, currentValue);
        
        // Create monitoring alert
        this.monitoringProvider.alerts.push({
          id: event.id,
          type: 'performance',
          severity: 'high',
          title: `Performance Budget Exceeded: ${metric}`,
          message: `${metric} is ${currentValue} (budget: ${budgetValue})`,
          timestamp: event.timestamp,
          acknowledged: false,
          metadata: { metric, currentValue, budgetValue }
        });

        this.integrationMetrics.performanceAlerts++;
        
        logger.error('Performance budget exceeded', { metric, currentValue, budgetValue });
      }
    });

    // SERVICE LIFECYCLE EVENTS
    this.eventSystem.subscribe('service.initialized', async (event: UnifiedEvent) => {
      if (this.diProvider) {
        const { serviceId, serviceType, metadata } = event.data;
        
        // Service would be registered in DI provider
        // This is more of a notification since registration likely happened already
        
        this.integrationMetrics.serviceRegistrations++;
        
        logger.info('Service initialization event processed', { serviceId, serviceType });
      }
    });

    // REAL-TIME COLLABORATION EVENTS
    this.eventSystem.subscribe('collaboration.session.started', async (event: UnifiedEvent) => {
      const { sessionId, projectId, participants } = event.data;
      
      // Cache session data for quick access
      if (this.cacheProvider) {
        await this.cacheProvider.set(`session:${sessionId}`, {
          projectId,
          participants,
          startTime: event.timestamp
        }, { ttl: 3600000, tags: ['collaboration', 'sessions'] });
      }
      
      // Monitor session performance
      if (this.monitoringProvider) {
        this.monitoringProvider.performanceMetrics.renderTime = Date.now() - event.timestamp;
      }
      
      logger.info('Collaboration session started', { sessionId, projectId, participantCount: participants.length });
    });

    // SYSTEM HEALTH MONITORING
    this.eventSystem.subscribe('system.health.check', async (event: UnifiedEvent) => {
      if (this.monitoringProvider) {
        const healthResult = await this.monitoringProvider.runHealthCheck();
        
        // Publish health result event
        await this.eventSystem.publishEvent({
          id: `health_result_${Date.now()}`,
          type: 'system.health.result',
          source: 'EventIntegrationLayer',
          data: healthResult,
          timestamp: Date.now(),
          version: 1,
          correlation_id: event.correlation_id,
          retry_count: 0,
          priority: 'medium'
        });
      }
    });
  }

  // =============================================================================
  // COMMAND HANDLERS - CQRS INTEGRATION
  // =============================================================================

  private setupCommandHandlers(): void {
    // CACHE MANAGEMENT COMMANDS
    this.eventSystem.registerCommandHandler('cache.set', {
      handle: async (command: { key: string; value: any; options?: any }) => {
        if (!this.cacheProvider) {
          throw new Error('Cache provider not available');
        }

        await this.cacheProvider.set(command.key, command.value, command.options);

        return [{
          id: `cache_set_${Date.now()}`,
          type: 'cache.value.set',
          source: 'EventIntegrationLayer',
          data: { key: command.key, size: JSON.stringify(command.value).length },
          timestamp: Date.now(),
          version: 1,
          retry_count: 0,
          priority: 'low'
        }];
      }
    });

    // HEALTH CHECK COMMANDS
    this.eventSystem.registerCommandHandler('health.check', {
      handle: async (command: { component?: string; full?: boolean }) => {
        if (!this.monitoringProvider) {
          throw new Error('Monitoring provider not available');
        }

        const healthResult = await this.monitoringProvider.runHealthCheck();

        return [{
          id: `health_check_${Date.now()}`,
          type: 'health.check.completed',
          source: 'EventIntegrationLayer',
          data: { 
            result: healthResult,
            component: command.component,
            full: command.full
          },
          timestamp: Date.now(),
          version: 1,
          retry_count: 0,
          priority: 'medium'
        }];
      }
    });

    // PERFORMANCE MONITORING COMMANDS
    this.eventSystem.registerCommandHandler('performance.record', {
      handle: async (command: { metric: string; value: number; metadata?: any }) => {
        if (!this.performanceProvider) {
          throw new Error('Performance provider not available');
        }

        this.performanceProvider.recordMetric(command.metric, command.value);

        // Check if budget is exceeded
        const budgetExceeded = !this.performanceProvider.checkBudget(command.metric, command.value);

        const events = [{
          id: `perf_recorded_${Date.now()}`,
          type: 'performance.metric.recorded',
          source: 'EventIntegrationLayer',
          data: { metric: command.metric, value: command.value, metadata: command.metadata },
          timestamp: Date.now(),
          version: 1,
          retry_count: 0,
          priority: 'low'
        }];

        if (budgetExceeded) {
          events.push({
            id: `budget_exceeded_${Date.now()}`,
            type: 'performance.budget.exceeded',
            source: 'EventIntegrationLayer',
            data: { 
              metric: command.metric, 
              currentValue: command.value,
              budgetValue: this.performanceProvider.budgets[command.metric as keyof typeof this.performanceProvider.budgets]
            },
            timestamp: Date.now(),
            version: 1,
            retry_count: 0,
            priority: 'high'
          });
        }

        return events;
      }
    });
  }

  // =============================================================================
  // QUERY HANDLERS - CQRS INTEGRATION
  // =============================================================================

  private setupQueryHandlers(): void {
    // SYSTEM STATUS QUERIES
    this.eventSystem.registerQueryHandler('system.status', {
      handle: async (query: { detailed?: boolean }) => {
        const status = {
          timestamp: Date.now(),
          di: this.diProvider ? {
            initialized: this.diProvider.isInitialized,
            services: this.diProvider.registryMetrics.totalServices,
            healthy: this.diProvider.registryMetrics.healthyServices,
            avgResponseTime: this.diProvider.registryMetrics.averageResponseTime
          } : null,
          cache: this.cacheProvider ? {
            initialized: this.cacheProvider.isInitialized,
            hitRate: this.cacheProvider.metrics.hitRate,
            memoryUsage: this.cacheProvider.metrics.memoryUsage,
            entries: this.cacheProvider.metrics.entriesCount
          } : null,
          monitoring: this.monitoringProvider ? {
            initialized: this.monitoringProvider.isInitialized,
            systemHealth: this.monitoringProvider.systemHealth,
            alertCount: this.monitoringProvider.alerts.length,
            performance: this.monitoringProvider.performanceMetrics
          } : null,
          performance: this.performanceProvider ? {
            metrics: this.performanceProvider.metrics,
            budgets: this.performanceProvider.budgets
          } : null,
          integration: this.integrationMetrics
        };

        return query.detailed ? status : {
          overall: this.calculateOverallHealth(),
          timestamp: status.timestamp
        };
      }
    });

    // CACHE QUERIES
    this.eventSystem.registerQueryHandler('cache.get', {
      handle: async (query: { key: string }) => {
        if (!this.cacheProvider) {
          throw new Error('Cache provider not available');
        }

        return await this.cacheProvider.get(query.key);
      }
    });

    // PERFORMANCE QUERIES
    this.eventSystem.registerQueryHandler('performance.metrics', {
      handle: async (query: { metric?: string; timeRange?: string }) => {
        if (!this.performanceProvider) {
          throw new Error('Performance provider not available');
        }

        return query.metric 
          ? this.performanceProvider.metrics[query.metric as keyof typeof this.performanceProvider.metrics]
          : this.performanceProvider.metrics;
      }
    });
  }

  // =============================================================================
  // SAGA PATTERNS - DISTRIBUTED OPERATIONS
  // =============================================================================

  private setupSagas(): void {
    // SYSTEM STARTUP SAGA
    this.eventSystem.registerSaga('system.startup', [
      {
        execute: async (data) => {
          // Initialize DI system
          if (this.diProvider && !this.diProvider.isInitialized) {
            logger.info('Starting DI system initialization...');
            // Trigger DI initialization
          }
          return { ...data, di: 'initialized' };
        },
        compensate: async (data) => {
          logger.warn('Compensating DI initialization');
        }
      },
      {
        execute: async (data) => {
          // Initialize cache system
          if (this.cacheProvider && !this.cacheProvider.isInitialized) {
            logger.info('Starting cache system initialization...');
            // Cache should auto-initialize
          }
          return { ...data, cache: 'initialized' };
        },
        compensate: async (data) => {
          if (this.cacheProvider) {
            await this.cacheProvider.clear();
          }
        }
      },
      {
        execute: async (data) => {
          // Initialize monitoring system
          if (this.monitoringProvider && !this.monitoringProvider.isInitialized) {
            logger.info('Starting monitoring system initialization...');
            await this.monitoringProvider.runHealthCheck();
          }
          return { ...data, monitoring: 'initialized' };
        },
        compensate: async (data) => {
          logger.warn('Compensating monitoring initialization');
        }
      }
    ]);

    // CACHE WARMING SAGA
    this.eventSystem.registerSaga('cache.warm', [
      {
        execute: async (data) => {
          if (!this.cacheProvider) throw new Error('Cache provider unavailable');
          
          const { keys } = data;
          for (const key of keys) {
            // Pre-load critical data
            logger.debug(`Warming cache for key: ${key}`);
          }
          return { ...data, warmed: keys.length };
        },
        compensate: async (data) => {
          if (this.cacheProvider) {
            await this.cacheProvider.clear(['warmup']);
          }
        }
      }
    ]);
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  private calculateOverallHealth(): string {
    let healthyCount = 0;
    let totalCount = 0;

    if (this.diProvider) {
      totalCount++;
      if (this.diProvider.isInitialized) healthyCount++;
    }

    if (this.cacheProvider) {
      totalCount++;
      if (this.cacheProvider.isInitialized) healthyCount++;
    }

    if (this.monitoringProvider) {
      totalCount++;
      if (this.monitoringProvider.isInitialized) healthyCount++;
    }

    const healthPercentage = totalCount > 0 ? (healthyCount / totalCount) * 100 : 0;

    if (healthPercentage >= 80) return 'healthy';
    if (healthPercentage >= 50) return 'degraded';
    return 'unhealthy';
  }

  public getIntegrationMetrics() {
    return {
      ...this.integrationMetrics,
      eventSystemMetrics: this.eventSystem.getMetrics(),
      providersStatus: {
        di: !!this.diProvider,
        cache: !!this.cacheProvider,
        monitoring: !!this.monitoringProvider,
        performance: !!this.performanceProvider
      }
    };
  }

  public async healthCheck(): Promise<any> {
    const startTime = Date.now();
    
    const result = {
      timestamp: startTime,
      duration: 0,
      overall: this.calculateOverallHealth(),
      providers: {
        di: this.diProvider ? {
          available: true,
          initialized: this.diProvider.isInitialized,
          services: this.diProvider.registryMetrics.totalServices
        } : { available: false },
        cache: this.cacheProvider ? {
          available: true,
          initialized: this.cacheProvider.isInitialized,
          hitRate: this.cacheProvider.metrics.hitRate
        } : { available: false },
        monitoring: this.monitoringProvider ? {
          available: true,
          initialized: this.monitoringProvider.isInitialized,
          systemHealth: this.monitoringProvider.systemHealth.status
        } : { available: false },
        performance: this.performanceProvider ? {
          available: true,
          metrics: this.performanceProvider.metrics
        } : { available: false }
      },
      integration: this.integrationMetrics
    };

    result.duration = Date.now() - startTime;
    
    return result;
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export default EventIntegrationLayer; 