/**
 * Service Bootstrap
 * Sistema de inicialização e registro de todos os serviços
 */

import { createLogger } from '../../utils/logger';
import { config } from '../../config/environment';
import { serviceRegistry } from '../registry/ServiceRegistry';
import { ServiceIdentifier, ServiceRegistration, ServiceConfig } from '../interfaces';

// Import mock services
import { MockAnalyticsService } from '../mocks/MockAnalyticsService';

// V6.4 DI Optimization: Static imports to resolve dynamic import conflicts
import { TemplateService } from '../templateService';
import { AnalyticsService } from '../analyticsService';
import { GeminiService } from '../geminiService';
import { AdvancedCacheService } from '../cacheService';
import { performanceService } from '../performance';

const logger = createLogger('ServiceBootstrap');

/**
 * Service identifiers for type-safe dependency injection
 */
export const ServiceIdentifiers = {
  Analytics: {
    name: 'AnalyticsService',
    version: '1.0.0',
    interface: class {} as any
  } as ServiceIdentifier,
  
  Storage: {
    name: 'StorageService', 
    version: '1.0.0',
    interface: class {} as any
  } as ServiceIdentifier,
  
  Gemini: {
    name: 'GeminiService',
    version: '1.0.0', 
    interface: class {} as any
  } as ServiceIdentifier,
  
  Performance: {
    name: 'PerformanceService',
    version: '1.0.0',
    interface: class {} as any
  } as ServiceIdentifier,
  
  Template: {
    name: 'TemplateService',
    version: '1.0.0',
    interface: class {} as any
  } as ServiceIdentifier
} as const;

export class ServiceBootstrap {
  private initialized = false;

  constructor() {
    logger.info('Service Bootstrap created');
  }

  /**
   * Initialize all services based on environment configuration
   */
  async initialize(): Promise<{
    success: boolean;
    registeredServices: number;
    initializedServices: number;
    errors: string[];
  }> {
    if (this.initialized) {
      logger.warn('Services already initialized');
      return {
        success: true,
        registeredServices: 0,
        initializedServices: 0,
        errors: []
      };
    }

    logger.info('Starting service bootstrap...', {
      environment: config.environment,
      isDevelopment: config.isDevelopment
    });

    const errors: string[] = [];
    let registeredServices = 0;

    try {
      // Register core services
      registeredServices += await this.registerCoreServices();
      
      // Register analytics services  
      registeredServices += await this.registerAnalyticsServices();
      
      // Register API services
      registeredServices += await this.registerAPIServices();
      
      // Register storage services
      registeredServices += await this.registerStorageServices();
      
      // Register specialized services
      registeredServices += await this.registerSpecializedServices();

      // Initialize all registered services
      const initResult = await serviceRegistry.initializeAll();
      
      if (!initResult.success) {
        errors.push(...initResult.results
          .filter(r => !r.success)
          .map(r => `${r.service}: ${r.error}`)
        );
      }

      // Start health monitoring
      serviceRegistry.startHealthMonitoring();
      
      this.initialized = true;

      const summary = {
        success: errors.length === 0,
        registeredServices,
        initializedServices: initResult.results.filter(r => r.success).length,
        errors
      };

      logger.info('Service bootstrap completed', summary);
      
      return summary;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      errors.push(errorMsg);
      logger.error('Service bootstrap failed', error);
      
      return {
        success: false,
        registeredServices,
        initializedServices: 0,
        errors
      };
    }
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
      await serviceRegistry.disposeAll();
      this.initialized = false;
      logger.info('All services disposed successfully');
    } catch (error) {
      logger.error('Error disposing services', error);
      throw error;
    }
  }

  /**
   * Get system status
   */
  async getSystemStatus() {
    if (!this.initialized) {
      return {
        initialized: false,
        health: { overall: 'offline' as const },
        stats: { registeredServices: 0, activeInstances: 0 }
      };
    }

    const health = await serviceRegistry.getSystemHealth();
    const stats = serviceRegistry.getStats();

    return {
      initialized: true,
      health,
      stats
    };
  }

  /**
   * Register core services (always enabled)
   */
  private async registerCoreServices(): Promise<number> {
    let count = 0;

    // Template Service - always needed
    try {
      serviceRegistry.register({
        identifier: ServiceIdentifiers.Template,
        implementation: TemplateService,
        lifecycle: 'singleton',
        config: this.createServiceConfig('template')
      });
      count++;
      logger.info('Template service registered');
    } catch (error) {
      logger.error('Failed to register Template service', error);
    }

    return count;
  }

  /**
   * Register analytics services
   */
  private async registerAnalyticsServices(): Promise<number> {
    let count = 0;

    // Choose between real and mock analytics based on environment
    try {
      if (config.isDevelopment || !config.features.analyticsEnabled) {
        // Use mock service for development/testing
        serviceRegistry.register({
          identifier: ServiceIdentifiers.Analytics,
          implementation: MockAnalyticsService,
          lifecycle: 'singleton',
          config: this.createServiceConfig('analytics')
        });
        logger.info('Mock Analytics service registered');
      } else {
        // Use real analytics service for production
        serviceRegistry.register({
          identifier: ServiceIdentifiers.Analytics,
          implementation: AnalyticsService,
          lifecycle: 'singleton',
          config: this.createServiceConfig('analytics')
        });
        logger.info('Real Analytics service registered');
      }
      count++;
    } catch (error) {
      logger.error('Failed to register Analytics service', error);
    }

    return count;
  }

  /**
   * Register API services
   */
  private async registerAPIServices(): Promise<number> {
    let count = 0;

    // Gemini Service
    if (config.geminiApiKey) {
      try {
        serviceRegistry.register({
          identifier: ServiceIdentifiers.Gemini,
          implementation: GeminiService,
          lifecycle: 'singleton',
          config: this.createServiceConfig('gemini')
        });
        count++;
        logger.info('Gemini service registered');
      } catch (error) {
        logger.error('Failed to register Gemini service', error);
      }
    } else {
      logger.warn('Gemini API key not configured, skipping registration');
    }

    return count;
  }

  /**
   * Register storage services
   */
  private async registerStorageServices(): Promise<number> {
    let count = 0;

    // Cache Service
    try {
      serviceRegistry.register({
        identifier: ServiceIdentifiers.Storage,
        implementation: AdvancedCacheService,
        lifecycle: 'singleton',
        config: this.createServiceConfig('storage')
      });
      count++;
      logger.info('Cache service registered');
    } catch (error) {
      logger.error('Failed to register Cache service', error);
    }

    return count;
  }

  /**
   * Register specialized services
   */
  private async registerSpecializedServices(): Promise<number> {
    let count = 0;

    // Performance Service
    try {
      serviceRegistry.register({
        identifier: ServiceIdentifiers.Performance,
        implementation: performanceService.constructor as any,
        lifecycle: 'singleton',
        config: this.createServiceConfig('performance')
      });
      count++;
      logger.info('Performance service registered');
    } catch (error) {
      logger.error('Failed to register Performance service', error);
    }

    return count;
  }

  /**
   * Create standardized service configuration
   */
  private createServiceConfig(serviceName: string): ServiceConfig {
    return {
      enabled: true,
      environment: config.environment as 'development' | 'test' | 'production',
      retryPolicy: {
        maxRetries: config.isDevelopment ? 1 : 3,
        backoffMs: 1000
      },
      timeout: config.isDevelopment ? 5000 : 10000,
      // Service-specific configurations
      ...(serviceName === 'analytics' && {
        analyticsEnabled: config.features.analyticsEnabled
      }),
      ...(serviceName === 'gemini' && {
        apiKey: config.geminiApiKey
      })
    };
  }
}

// Global bootstrap instance
export const serviceBootstrap = new ServiceBootstrap(); 