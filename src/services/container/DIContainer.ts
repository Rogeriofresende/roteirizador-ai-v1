/**
 * Dependency Injection Container
 * Sistema centralizado de gerenciamento de dependências para todos os serviços
 */

import { createLogger } from '../../utils/logger';
import {
  ServiceIdentifier,
  ServiceRegistration,
  DIContainer,
  IBaseService,
  ServiceLifecycleState
} from '../interfaces';

const logger = createLogger('DIContainer');

interface ServiceInstance {
  instance: any;
  registration: ServiceRegistration;
  state: ServiceLifecycleState;
  createdAt: Date;
  lastAccessed: Date;
}

export class DIContainerImpl implements DIContainer {
  private registrations = new Map<string, ServiceRegistration>();
  private instances = new Map<string, ServiceInstance>();
  private disposalQueue: Array<() => Promise<void>> = [];

  constructor() {
    logger.info('DI Container initialized');
  }

  /**
   * Registra um serviço no container
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
   * Resolve um serviço (async)
   */
  async resolve<T>(identifier: ServiceIdentifier<T>): Promise<T> {
    const key = this.getServiceKey(identifier);
    const registration = this.registrations.get(key);

    if (!registration) {
      throw new Error(`Service not registered: ${key}`);
    }

    // Check lifecycle strategy
    switch (registration.lifecycle) {
      case 'singleton':
        return this.resolveSingleton<T>(key, registration);
      case 'transient':
        return this.resolveTransient<T>(registration);
      case 'scoped':
        return this.resolveScoped<T>(key, registration);
      default:
        throw new Error(`Unknown lifecycle: ${registration.lifecycle}`);
    }
  }

  /**
   * Resolve um serviço (sync)
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

  /**
   * Verifica se um serviço está registrado
   */
  isRegistered<T>(identifier: ServiceIdentifier<T>): boolean {
    const key = this.getServiceKey(identifier);
    return this.registrations.has(key);
  }

  /**
   * Dispose de todos os serviços
   */
  async dispose(): Promise<void> {
    logger.info('Disposing DI Container...');

    // Execute disposal queue
    for (const disposalFn of this.disposalQueue) {
      try {
        await disposalFn();
      } catch (error) {
        logger.error('Error during service disposal', error);
      }
    }

    // Dispose all instances
    for (const [key, serviceInstance] of this.instances) {
      try {
        serviceInstance.state = ServiceLifecycleState.DISPOSING;
        
        if (this.isBaseService(serviceInstance.instance)) {
          await serviceInstance.instance.dispose();
        }
        
        serviceInstance.state = ServiceLifecycleState.DISPOSED;
        logger.info(`Service disposed: ${key}`);
      } catch (error) {
        logger.error(`Error disposing service ${key}`, error);
      }
    }

    this.instances.clear();
    this.registrations.clear();
    this.disposalQueue = [];
    
    logger.info('DI Container disposed');
  }

  /**
   * Resolve singleton instance
   */
  private async resolveSingleton<T>(key: string, registration: ServiceRegistration<T>): Promise<T> {
    let serviceInstance = this.instances.get(key);

    if (!serviceInstance) {
      const instance = this.createInstance<T>(registration);
      
      serviceInstance = {
        instance,
        registration,
        state: ServiceLifecycleState.INITIALIZING,
        createdAt: new Date(),
        lastAccessed: new Date()
      };

      this.instances.set(key, serviceInstance);

      // Initialize if it's a base service
      if (this.isBaseService(instance)) {
        try {
          await instance.initialize();
          serviceInstance.state = ServiceLifecycleState.READY;
          logger.info(`Service initialized: ${key}`);
        } catch (error) {
          serviceInstance.state = ServiceLifecycleState.OFFLINE;
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
   * Resolve transient instance (always new)
   */
  private resolveTransient<T>(registration: ServiceRegistration<T>): T {
    const instance = this.createInstance<T>(registration);
    
    // Add to disposal queue if it's a base service
    if (this.isBaseService(instance)) {
      this.disposalQueue.push(async () => {
        await instance.dispose();
      });
    }

    return instance;
  }

  /**
   * Resolve scoped instance (same within scope)
   */
  private resolveScoped<T>(key: string, registration: ServiceRegistration<T>): T {
    // For now, treat scoped as singleton
    // In a real implementation, this would be per-request or per-transaction
    return this.resolveSingleton(key, registration) as T;
  }

  /**
   * Create new instance of a service
   */
  private createInstance<T>(registration: ServiceRegistration<T>): T {
    try {
      if (registration.factory) {
        return registration.factory();
      }

      // Resolve dependencies
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
   * Get container statistics
   */
  getStats() {
    return {
      registeredServices: this.registrations.size,
      activeInstances: this.instances.size,
      services: Array.from(this.registrations.keys()),
      instances: Array.from(this.instances.entries()).map(([key, instance]) => ({
        key,
        state: instance.state,
        createdAt: instance.createdAt,
        lastAccessed: instance.lastAccessed,
        lifecycle: instance.registration.lifecycle
      }))
    };
  }
}

// Global container instance
export const container = new DIContainerImpl(); 