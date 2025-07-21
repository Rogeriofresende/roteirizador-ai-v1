/**
 * 🚀 SERVICE BOOTSTRAP V8.0 - CONSOLIDATED DI SYSTEM
 * V8.0 Unified Methodology - CONSOLIDATION STRATEGY
 * 
 * CONSOLIDATES:
 * ✅ ServiceBootstrap.ts (344 linhas) - Sistema de inicialização e registro
 * ✅ ServiceRegistry.ts (305 linhas) - Descoberta e gerenciamento  
 * ✅ DIContainer.ts (280 linhas) - Container completo DI
 * ✅ IBaseService.ts (60 linhas) - Interface padrão
 * 
 * OPTIMIZATIONS:
 * ⚡ Performance: <2ms bootstrap time (target)
 * 📊 Telemetry: Advanced metrics and monitoring
 * 🔄 Health: Real-time service health monitoring
 * 🧩 Modularity: Clean separation of concerns
 * 
 * @author IA Alpha - V8.0 Consolidation Architect
 * @created 2025-01-17
 * @methodology V8.0_UNIFIED_DEVELOPMENT_CONSOLIDATION
 */

import { createLogger } from '../../utils/logger';
import { config } from '../../config/environment';
import { 
  ServiceIdentifier, 
  ServiceRegistration, 
  IBaseService, 
  ServiceHealthStatus,
  ServiceLifecycleState,
  ServiceConfig,
  ServiceMetrics
} from '../interfaces';

// V8.0 Optimized imports - static for performance
import { TemplateService } from '../templateService';
import { AnalyticsService } from '../analyticsService';
import { GeminiService } from '../geminiService';
import { AdvancedCacheService } from '../cacheService';
import { performanceService } from '../performance';
import { MockAnalyticsService } from '../mocks/MockAnalyticsService';

const logger = createLogger('ServiceBootstrapV8');

// =============================================================================
// V8.0 UNIFIED INTERFACES
// =============================================================================

interface ConsolidatedServiceInstance {
  instance: any;
  registration: ServiceRegistration;
  state: ServiceLifecycleState;
  health: ServiceHealthStatus;
  metrics: ServiceMetrics;
  createdAt: Date;
  lastAccessed: Date;
  initTime: number;
}

interface ServiceBootstrapTelemetry {
  totalBootstrapTime: number;
  serviceInitTimes: Map<string, number>;
  healthCheckCount: number;
  errorCount: number;
  lastHealthCheck: Date;
  performanceMetrics: {
    avgResponseTime: number;
    totalOperations: number;
    memoryUsage: number;
  };
}

// =============================================================================
// V8.0 SERVICE IDENTIFIERS (CONSOLIDATED)
// =============================================================================

export const ServiceIdentifiersV8 = {
  Analytics: {
    name: 'AnalyticsService',
    version: '8.0.0',
    interface: class {} as any
  } as ServiceIdentifier,
  
  Storage: {
    name: 'StorageService', 
    version: '8.0.0',
    interface: class {} as any
  } as ServiceIdentifier,
  
  Gemini: {
    name: 'GeminiService',
    version: '8.0.0', 
    interface: class {} as any
  } as ServiceIdentifier,
  
  Performance: {
    name: 'PerformanceService',
    version: '8.0.0',
    interface: class {} as any
  } as ServiceIdentifier,
  
  Template: {
    name: 'TemplateService',
    version: '8.0.0',
    interface: class {} as any
  } as ServiceIdentifier
} as const;

// =============================================================================
// V8.0 CONSOLIDATED SERVICE BOOTSTRAP
// =============================================================================

export class ServiceBootstrapV8 {
  private initialized = false;
  private registrations = new Map<string, ServiceRegistration>();
  private instances = new Map<string, ConsolidatedServiceInstance>();
  private disposalQueue: Array<() => Promise<void>> = [];
  private healthCheckInterval?: NodeJS.Timeout;
  private telemetry: ServiceBootstrapTelemetry;

  private readonly healthCheckIntervalMs = 30000; // 30 seconds

  constructor() {
    this.telemetry = {
      totalBootstrapTime: 0,
      serviceInitTimes: new Map(),
      healthCheckCount: 0,
      errorCount: 0,
      lastHealthCheck: new Date(),
      performanceMetrics: {
        avgResponseTime: 0,
        totalOperations: 0,
        memoryUsage: 0
      }
    };

    logger.info('ServiceBootstrapV8 created - Consolidated DI System', {
      version: '8.0.0',
      consolidatedSystems: [
        'ServiceBootstrap (344 lines)',
        'ServiceRegistry (305 lines)', 
        'DIContainer (280 lines)',
        'IBaseService (60 lines)'
      ]
    });
  }

  // =============================================================================
  // V8.0 MAIN BOOTSTRAP METHODS
  // =============================================================================

  /**
   * Initialize all services with V8.0 optimizations
   */
  async initialize(): Promise<{
    success: boolean;
    registeredServices: number;
    initializedServices: number;
    errors: string[];
    bootstrapTime: number;
    performanceScore: number;
  }> {
    if (this.initialized) {
      logger.warn('ServiceBootstrapV8 already initialized');
      return {
        success: true,
        registeredServices: this.registrations.size,
        initializedServices: this.instances.size,
        errors: [],
        bootstrapTime: this.telemetry.totalBootstrapTime,
        performanceScore: this.calculatePerformanceScore()
      };
    }

    const startTime = performance.now();
    logger.info('Starting ServiceBootstrapV8 initialization...', {
      environment: config.environment,
      isDevelopment: config.isDevelopment,
      targetBootstrapTime: '<2ms'
    });

    const errors: string[] = [];
    let registeredServices = 0;

    try {
      // PHASE 1: Service Registration (optimized order)
      registeredServices += await this.registerCoreServices();
      registeredServices += await this.registerAnalyticsServices();
      registeredServices += await this.registerAPIServices();
      registeredServices += await this.registerStorageServices();
      registeredServices += await this.registerSpecializedServices();

      // PHASE 2: Parallel Service Initialization (V8.0 optimization)
      const initResult = await this.initializeAllServicesParallel();
      
      if (!initResult.success) {
        errors.push(...initResult.errors);
      }

      // PHASE 3: Health Monitoring Setup
      this.startAdvancedHealthMonitoring();
      
      this.initialized = true;
      
      const bootstrapTime = performance.now() - startTime;
      this.telemetry.totalBootstrapTime = bootstrapTime;

      const summary = {
        success: errors.length === 0,
        registeredServices,
        initializedServices: initResult.initializedCount,
        errors,
        bootstrapTime,
        performanceScore: this.calculatePerformanceScore()
      };

      // V8.0 Performance validation
      if (bootstrapTime > 2) {
        logger.warn('Bootstrap time exceeded target', {
          actual: `${bootstrapTime.toFixed(2)}ms`,
          target: '<2ms',
          suggestion: 'Consider lazy loading for non-critical services'
        });
      } else {
        logger.info('✅ V8.0 Performance target achieved!', {
          bootstrapTime: `${bootstrapTime.toFixed(2)}ms`,
          target: '<2ms'
        });
      }

      logger.info('ServiceBootstrapV8 initialization completed', summary);
      
      return summary;

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      errors.push(errorMsg);
      this.telemetry.errorCount++;
      logger.error('ServiceBootstrapV8 initialization failed', error);
      
      return {
        success: false,
        registeredServices,
        initializedServices: 0,
        errors,
        bootstrapTime: performance.now() - startTime,
        performanceScore: 0
      };
    }
  }

  // =============================================================================
  // V8.0 DEPENDENCY INJECTION METHODS (CONSOLIDATED)
  // =============================================================================

  /**
   * Register a service (unified from ServiceRegistry + DIContainer)
   */
  register<T>(registration: ServiceRegistration<T>): void {
    const key = this.getServiceKey(registration.identifier);
    
    if (this.registrations.has(key)) {
      logger.warn(`Service ${key} already registered, overwriting`);
    }

    this.registrations.set(key, registration);
    logger.info(`Service registered: ${key} (${registration.lifecycle})`);
  }

  /**
   * Resolve service instance (async)
   */
  async resolve<T>(identifier: ServiceIdentifier<T>): Promise<T> {
    const startTime = performance.now();
    const key = this.getServiceKey(identifier);
    
    try {
      const registration = this.registrations.get(key);
      if (!registration) {
        throw new Error(`Service not registered: ${key}`);
      }

      let instance: T;
      
      switch (registration.lifecycle) {
        case 'singleton':
          instance = await this.resolveSingleton<T>(key, registration);
          break;
        case 'transient':
          instance = this.resolveTransient<T>(registration);
          break;
        case 'scoped':
          instance = await this.resolveScoped<T>(key, registration);
          break;
        default:
          throw new Error(`Unknown lifecycle: ${registration.lifecycle}`);
      }

      // Update telemetry
      const responseTime = performance.now() - startTime;
      this.updateTelemetryMetrics(responseTime);

      return instance;

    } catch (error) {
      this.telemetry.errorCount++;
      logger.error(`Error resolving service: ${key}`, error);
      throw error;
    }
  }

  /**
   * Resolve service synchronously (singletons only)
   */
  resolveSync<T>(identifier: ServiceIdentifier<T>): T {
    const key = this.getServiceKey(identifier);
    const existingInstance = this.instances.get(key);

    if (existingInstance) {
      existingInstance.lastAccessed = new Date();
      return existingInstance.instance;
    }

    const registration = this.registrations.get(key);
    if (!registration) {
      throw new Error(`Service not registered: ${key}`);
    }

    if (registration.lifecycle !== 'singleton') {
      throw new Error(`Sync resolution only supported for singletons: ${key}`);
    }

    return this.createInstance<T>(registration);
  }

  // =============================================================================
  // V8.0 HEALTH MONITORING (ADVANCED)
  // =============================================================================

  /**
   * Get comprehensive system health
   */
  async getSystemHealth(): Promise<{
    overall: 'healthy' | 'degraded' | 'offline';
    services: Array<{
      name: string;
      status: string;
      health: ServiceHealthStatus;
      metrics: ServiceMetrics;
    }>;
    summary: {
      total: number;
      healthy: number;
      degraded: number;
      offline: number;
    };
    telemetry: ServiceBootstrapTelemetry;
  }> {
    const services = Array.from(this.instances.values()).map(serviceInstance => ({
      name: serviceInstance.registration.identifier.name,
      status: serviceInstance.health.status,
      health: serviceInstance.health,
      metrics: serviceInstance.metrics
    }));

    const summary = {
      total: services.length,
      healthy: services.filter(s => s.status === 'healthy').length,
      degraded: services.filter(s => s.status === 'degraded').length,
      offline: services.filter(s => s.status === 'offline').length
    };

    // Determine overall health
    let overall: 'healthy' | 'degraded' | 'offline';
    if (summary.offline > 0) {
      overall = 'offline';
    } else if (summary.degraded > 0) {
      overall = 'degraded';
    } else {
      overall = 'healthy';
    }

    return {
      overall,
      services,
      summary,
      telemetry: this.telemetry
    };
  }

  // =============================================================================
  // PRIVATE IMPLEMENTATION METHODS
  // =============================================================================

  /**
   * Initialize all services in parallel (V8.0 optimization)
   */
  private async initializeAllServicesParallel(): Promise<{
    success: boolean;
    initializedCount: number;
    errors: string[];
  }> {
    const registrations = Array.from(this.registrations.entries());
    const errors: string[] = [];
    let initializedCount = 0;

    // Initialize services in parallel for better performance
    const initPromises = registrations.map(async ([key, registration]) => {
      try {
        await this.resolveSingleton(key, registration);
        initializedCount++;
        return { success: true, key };
      } catch (error) {
        const errorMsg = `${key}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMsg);
        return { success: false, key, error: errorMsg };
      }
    });

    await Promise.allSettled(initPromises);

    return {
      success: errors.length === 0,
      initializedCount,
      errors
    };
  }

  /**
   * Start advanced health monitoring
   */
  private startAdvancedHealthMonitoring(): void {
    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.performHealthCheck();
        this.telemetry.healthCheckCount++;
        this.telemetry.lastHealthCheck = new Date();
      } catch (error) {
        logger.error('Health check failed', error);
        this.telemetry.errorCount++;
      }
    }, this.healthCheckIntervalMs);

    logger.info('Advanced health monitoring started', {
      interval: `${this.healthCheckIntervalMs}ms`,
      services: this.instances.size
    });
  }

  /**
   * Perform health check on all services
   */
  private async performHealthCheck(): Promise<void> {
    const healthPromises = Array.from(this.instances.values()).map(async (serviceInstance) => {
      try {
        if (this.isBaseService(serviceInstance.instance)) {
          const health = await serviceInstance.instance.getHealth();
          serviceInstance.health = health;
          serviceInstance.metrics = serviceInstance.instance.getMetrics();
        }
      } catch (error) {
        serviceInstance.health = {
          status: 'offline',
          lastCheck: new Date(),
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    });

    await Promise.allSettled(healthPromises);
  }

  /**
   * Resolve singleton instance
   */
  private async resolveSingleton<T>(key: string, registration: ServiceRegistration<T>): Promise<T> {
    let serviceInstance = this.instances.get(key);

    if (!serviceInstance) {
      const instanceStartTime = performance.now();
      const instance = this.createInstance<T>(registration);
      const initTime = performance.now() - instanceStartTime;

      serviceInstance = {
        instance,
        registration,
        state: ServiceLifecycleState.INITIALIZING,
        health: { status: 'healthy', lastCheck: new Date() },
        metrics: { initTime, lastActivity: new Date(), operationCount: 0, errorCount: 0 },
        createdAt: new Date(),
        lastAccessed: new Date(),
        initTime
      };

      this.instances.set(key, serviceInstance);
      this.telemetry.serviceInitTimes.set(key, initTime);

      // Initialize if it's a base service
      if (this.isBaseService(instance)) {
        try {
          await instance.initialize();
          serviceInstance.state = ServiceLifecycleState.READY;
          serviceInstance.health = await instance.getHealth();
          logger.info(`Service initialized: ${key} (${initTime.toFixed(2)}ms)`);
        } catch (error) {
          serviceInstance.state = ServiceLifecycleState.OFFLINE;
          serviceInstance.health = {
            status: 'offline',
            lastCheck: new Date(),
            error: error instanceof Error ? error.message : 'Unknown error'
          };
          logger.error(`Service initialization failed: ${key}`, error);
          throw error;
        }
      } else {
        serviceInstance.state = ServiceLifecycleState.READY;
      }
    } else {
      serviceInstance.lastAccessed = new Date();
    }

    return serviceInstance.instance;
  }

  /**
   * Resolve transient instance
   */
  private resolveTransient<T>(registration: ServiceRegistration<T>): T {
    const instance = this.createInstance<T>(registration);
    
    if (this.isBaseService(instance)) {
      this.disposalQueue.push(async () => {
        await instance.dispose();
      });
    }

    return instance;
  }

  /**
   * Resolve scoped instance
   */
  private async resolveScoped<T>(key: string, registration: ServiceRegistration<T>): Promise<T> {
    // For now, treat scoped as singleton - could be enhanced for request/transaction scoping
    return this.resolveSingleton(key, registration);
  }

  /**
   * Create instance of service
   */
  private createInstance<T>(registration: ServiceRegistration<T>): T {
    try {
      if (registration.factory) {
        return registration.factory();
      }

      const dependencies = this.resolveDependencies(registration.dependencies || []);
      return new registration.implementation(...dependencies);
    } catch (error) {
      logger.error(`Error creating instance for ${registration.identifier.name}`, error);
      throw error;
    }
  }

  /**
   * Resolve service dependencies
   */
  private resolveDependencies(dependencies: ServiceIdentifier<any>[]): any[] {
    return dependencies.map(dep => {
      try {
        return this.resolveSync(dep);
      } catch (error) {
        logger.error(`Failed to resolve dependency: ${dep.name}`, error);
        throw error;
      }
    });
  }

  /**
   * Generate service key
   */
  private getServiceKey(identifier: ServiceIdentifier): string {
    return `${identifier.name}${identifier.version ? `@${identifier.version}` : ''}`;
  }

  /**
   * Check if instance implements IBaseService
   */
  private isBaseService(instance: any): instance is IBaseService {
    return (
      instance &&
      typeof instance.initialize === 'function' &&
      typeof instance.dispose === 'function' &&
      typeof instance.getHealth === 'function' &&
      typeof instance.getServiceName === 'function'
    );
  }

  /**
   * Update telemetry metrics
   */
  private updateTelemetryMetrics(responseTime: number): void {
    this.telemetry.performanceMetrics.totalOperations++;
    const { totalOperations, avgResponseTime } = this.telemetry.performanceMetrics;
    
    // Calculate rolling average
    this.telemetry.performanceMetrics.avgResponseTime = 
      (avgResponseTime * (totalOperations - 1) + responseTime) / totalOperations;
    
    // Update memory usage (if available)
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in window.performance) {
      this.telemetry.performanceMetrics.memoryUsage = (window.performance as any).memory.usedJSHeapSize;
    }
  }

  /**
   * Calculate performance score
   */
  private calculatePerformanceScore(): number {
    const { totalBootstrapTime, serviceInitTimes, errorCount } = this.telemetry;
    const { avgResponseTime, totalOperations } = this.telemetry.performanceMetrics;

    let score = 100;
    
    // Bootstrap time impact (target: <2ms)
    if (totalBootstrapTime > 2) score -= Math.min(30, (totalBootstrapTime - 2) * 5);
    
    // Average response time impact (target: <1ms)
    if (avgResponseTime > 1) score -= Math.min(20, (avgResponseTime - 1) * 10);
    
    // Error rate impact
    if (totalOperations > 0) {
      const errorRate = errorCount / totalOperations;
      score -= errorRate * 50;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  // =============================================================================
  // SERVICE REGISTRATION METHODS (FROM ORIGINAL BOOTSTRAP)
  // =============================================================================

  private async registerCoreServices(): Promise<number> {
    let count = 0;
    try {
      this.register({
        identifier: ServiceIdentifiersV8.Template,
        implementation: TemplateService,
        lifecycle: 'singleton',
        config: this.createServiceConfig('template')
      });
      count++;
      logger.info('Template service registered (V8.0)');
    } catch (error) {
      logger.error('Failed to register Template service', error);
    }
    return count;
  }

  private async registerAnalyticsServices(): Promise<number> {
    let count = 0;
    try {
      const AnalyticsImpl = (config.isDevelopment || !config.features.analyticsEnabled) 
        ? MockAnalyticsService 
        : AnalyticsService;
      
      this.register({
        identifier: ServiceIdentifiersV8.Analytics,
        implementation: AnalyticsImpl,
        lifecycle: 'singleton',
        config: this.createServiceConfig('analytics')
      });
      count++;
      logger.info(`${config.isDevelopment ? 'Mock' : 'Real'} Analytics service registered (V8.0)`);
    } catch (error) {
      logger.error('Failed to register Analytics service', error);
    }
    return count;
  }

  private async registerAPIServices(): Promise<number> {
    let count = 0;
    if (config.geminiApiKey) {
      try {
        this.register({
          identifier: ServiceIdentifiersV8.Gemini,
          implementation: GeminiService,
          lifecycle: 'singleton',
          config: this.createServiceConfig('gemini')
        });
        count++;
        logger.info('Gemini service registered (V8.0)');
      } catch (error) {
        logger.error('Failed to register Gemini service', error);
      }
    } else {
      logger.warn('Gemini API key not configured, skipping registration');
    }
    return count;
  }

  private async registerStorageServices(): Promise<number> {
    let count = 0;
    try {
      this.register({
        identifier: ServiceIdentifiersV8.Storage,
        implementation: AdvancedCacheService,
        lifecycle: 'singleton',
        config: this.createServiceConfig('storage')
      });
      count++;
      logger.info('Cache service registered (V8.0)');
    } catch (error) {
      logger.error('Failed to register Cache service', error);
    }
    return count;
  }

  private async registerSpecializedServices(): Promise<number> {
    let count = 0;
    try {
      this.register({
        identifier: ServiceIdentifiersV8.Performance,
        implementation: performanceService.constructor as any,
        lifecycle: 'singleton',
        config: this.createServiceConfig('performance')
      });
      count++;
      logger.info('Performance service registered (V8.0)');
    } catch (error) {
      logger.error('Failed to register Performance service', error);
    }
    return count;
  }

  private createServiceConfig(serviceName: string): ServiceConfig {
    return {
      enabled: true,
      environment: config.environment as 'development' | 'test' | 'production',
      retryPolicy: {
        maxRetries: config.isDevelopment ? 1 : 3,
        backoffMs: 1000
      },
      timeout: config.isDevelopment ? 5000 : 10000,
      ...(serviceName === 'analytics' && {
        analyticsEnabled: config.features.analyticsEnabled
      }),
      ...(serviceName === 'gemini' && {
        apiKey: config.geminiApiKey
      })
    };
  }

  /**
   * Dispose all services
   */
  async dispose(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    logger.info('Disposing all services...');
    
    try {
      // Clear health monitoring
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
      }

      // Dispose all singleton instances
      const disposePromises = Array.from(this.instances.values()).map(async (serviceInstance) => {
        if (this.isBaseService(serviceInstance.instance)) {
          try {
            await serviceInstance.instance.dispose();
          } catch (error) {
            logger.error(`Error disposing service: ${serviceInstance.registration.identifier.name}`, error);
          }
        }
      });

      // Dispose transient instances
      const transientDisposePromises = this.disposalQueue.map(dispose => dispose());

      await Promise.allSettled([...disposePromises, ...transientDisposePromises]);

      this.instances.clear();
      this.registrations.clear();
      this.disposalQueue = [];
      this.initialized = false;
      
      logger.info('All services disposed successfully');
    } catch (error) {
      logger.error('Error disposing services', error);
      throw error;
    }
  }

  /**
   * Get comprehensive statistics
   */
  getStats() {
    return {
      initialized: this.initialized,
      registeredServices: this.registrations.size,
      activeInstances: this.instances.size,
      telemetry: this.telemetry,
      performanceScore: this.calculatePerformanceScore(),
      services: Array.from(this.registrations.keys()),
      instances: Array.from(this.instances.entries()).map(([key, instance]) => ({
        key,
        state: instance.state,
        health: instance.health.status,
        createdAt: instance.createdAt,
        lastAccessed: instance.lastAccessed,
        lifecycle: instance.registration.lifecycle,
        initTime: instance.initTime
      }))
    };
  }

  /**
   * Get current performance score
   * @returns Performance score (0-100)
   */
  getPerformanceScore(): number {
    return this.calculatePerformanceScore();
  }

  /**
   * Get total bootstrap time in milliseconds
   */
  getTotalBootstrapTime(): number {
    return this.telemetry.totalBootstrapTime;
  }
}

// =============================================================================
// V8.0 GLOBAL INSTANCES
// =============================================================================

// Global V8.0 exports with compatibility aliases
export const serviceBootstrapV8 = new ServiceBootstrapV8();

// V8.0 Compatibility exports
export { serviceBootstrapV8 as serviceBootstrap };
export { serviceBootstrapV8 as serviceRegistry };
export { serviceBootstrapV8 as container };
export { ServiceIdentifiersV8 as ServiceIdentifiers };

logger.info('ServiceBootstrapV8 module loaded', {
  version: '8.0.0',
  consolidatedSystems: 4,
  performanceTarget: '<2ms bootstrap time',
  features: [
    'Unified DI Container',
    'Advanced Health Monitoring', 
    'Performance Telemetry',
    'Parallel Initialization',
    'Backward Compatibility'
  ]
}); 