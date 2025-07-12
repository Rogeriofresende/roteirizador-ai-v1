/**
 * Service Registry
 * Sistema centralizado de descoberta e gerenciamento de serviços
 */

import { createLogger } from '../../utils/logger';
import { container } from '../container/DIContainer';
import {
  ServiceIdentifier,
  ServiceRegistration,
  IBaseService,
  ServiceHealthStatus
} from '../interfaces';

const logger = createLogger('ServiceRegistry');

export interface ServiceInfo {
  identifier: ServiceIdentifier;
  health: ServiceHealthStatus;
  instance?: IBaseService;
  registration: ServiceRegistration;
  dependencies: string[];
}

export class ServiceRegistry {
  private healthCheckInterval?: NodeJS.Timeout;
  private readonly healthCheckIntervalMs = 30000; // 30 seconds

  constructor() {
    logger.info('Service Registry initialized');
  }

  /**
   * Register a service in the container
   */
  register<T>(registration: ServiceRegistration<T>): void {
    container.register(registration);
    logger.info(`Service registered: ${registration.identifier.name}`);
  }

  /**
   * Get service instance
   */
  async get<T>(identifier: ServiceIdentifier<T>): Promise<T> {
    return container.resolve(identifier);
  }

  /**
   * Get service instance synchronously (only for singletons)
   */
  getSync<T>(identifier: ServiceIdentifier<T>): T {
    return container.resolveSync(identifier);
  }

  /**
   * Check if service is registered
   */
  isRegistered<T>(identifier: ServiceIdentifier<T>): boolean {
    return container.isRegistered(identifier);
  }

  /**
   * Get all registered services info
   */
  async getAllServices(): Promise<ServiceInfo[]> {
    const stats = container.getStats();
    const services: ServiceInfo[] = [];

    for (const serviceName of stats.services) {
      try {
        const identifier = this.parseServiceName(serviceName);
        const instanceInfo = stats.instances.find(i => i.key === serviceName);
        
        if (instanceInfo) {
          const instance = container.resolveSync(identifier);
          const health = await this.getServiceHealth(instance);
          
          services.push({
            identifier,
            health,
            instance: this.isBaseService(instance) ? instance : undefined,
            registration: instanceInfo.lifecycle as any, // Simplified for now
            dependencies: [] // Would need to track this separately
          });
        }
      } catch (error) {
        logger.warn(`Failed to get info for service: ${serviceName}`, error);
      }
    }

    return services;
  }

  /**
   * Get system health overview
   */
  async getSystemHealth(): Promise<{
    overall: 'healthy' | 'degraded' | 'offline';
    services: Array<{
      name: string;
      status: string;
      health: ServiceHealthStatus;
    }>;
    summary: {
      total: number;
      healthy: number;
      degraded: number;
      offline: number;
    };
  }> {
    const services = await this.getAllServices();
    const healthStatuses = services.map(s => ({
      name: s.identifier.name,
      status: s.health.status,
      health: s.health
    }));

    const summary = {
      total: services.length,
      healthy: healthStatuses.filter(s => s.status === 'healthy').length,
      degraded: healthStatuses.filter(s => s.status === 'degraded').length,
      offline: healthStatuses.filter(s => s.status === 'offline').length
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
      services: healthStatuses,
      summary
    };
  }

  /**
   * Start automatic health monitoring
   */
  startHealthMonitoring(): void {
    if (this.healthCheckInterval) {
      return;
    }

    this.healthCheckInterval = setInterval(async () => {
      try {
        const health = await this.getSystemHealth();
        logger.info('Health check completed', {
          overall: health.overall,
          summary: health.summary
        });

        // Log warnings for unhealthy services
        health.services
          .filter(s => s.status !== 'healthy')
          .forEach(s => {
            logger.warn(`Service unhealthy: ${s.name}`, {
              status: s.status,
              error: s.health.error
            });
          });
      } catch (error) {
        logger.error('Health check failed', error);
      }
    }, this.healthCheckIntervalMs);

    logger.info('Health monitoring started');
  }

  /**
   * Stop automatic health monitoring
   */
  stopHealthMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = undefined;
      logger.info('Health monitoring stopped');
    }
  }

  /**
   * Initialize all services
   */
  async initializeAll(): Promise<{
    success: boolean;
    results: Array<{
      service: string;
      success: boolean;
      error?: string;
    }>;
  }> {
    const stats = container.getStats();
    const results: Array<{ service: string; success: boolean; error?: string }> = [];
    let overallSuccess = true;

    logger.info('Initializing all services...');

    for (const serviceName of stats.services) {
      try {
        const identifier = this.parseServiceName(serviceName);
        const instance = await container.resolve(identifier);
        
        if (this.isBaseService(instance)) {
          await instance.initialize();
        }

        results.push({ service: serviceName, success: true });
        logger.info(`Service initialized: ${serviceName}`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        results.push({ service: serviceName, success: false, error: errorMsg });
        logger.error(`Failed to initialize service: ${serviceName}`, error);
        overallSuccess = false;
      }
    }

    const summary = {
      total: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    };

    logger.info('Service initialization completed', summary);

    return {
      success: overallSuccess,
      results
    };
  }

  /**
   * Dispose all services
   */
  async disposeAll(): Promise<void> {
    logger.info('Disposing all services...');
    
    this.stopHealthMonitoring();
    await container.dispose();
    
    logger.info('All services disposed');
  }

  /**
   * Get container statistics
   */
  getStats() {
    return container.getStats();
  }

  /**
   * Get service health
   */
  private async getServiceHealth(instance: any): Promise<ServiceHealthStatus> {
    try {
      if (this.isBaseService(instance)) {
        return await instance.getHealth();
      }
      
      return {
        status: 'healthy',
        lastCheck: new Date(),
        details: { type: 'non-base-service' }
      };
    } catch (error) {
      return {
        status: 'offline',
        lastCheck: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
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
   * Parse service name back to identifier (simplified)
   */
  private parseServiceName(serviceName: string): ServiceIdentifier {
    const [name, version] = serviceName.split('@');
    return {
      name,
      version,
      interface: class {} as any // Simplified for this implementation
    };
  }
}

// Global registry instance
export const serviceRegistry = new ServiceRegistry(); 