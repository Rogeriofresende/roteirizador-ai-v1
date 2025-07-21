/**
 * AutoTimestamp.ts - V8.1 Automatic Timestamp Injection Service
 * 
 * Automatic timestamp capture for CRUD operations
 * Event-driven timestamp injection to eliminate manual timestamp errors
 * 
 * Created: 15 Janeiro 2025 - V8.1 Implementation
 * IA ALPHA - Backend Timestamp Architect (Corrected for Test Compatibility)
 */

import { SystemTimestamp } from './SystemTimestamp';

export interface AutoTimestampConfig {
  enableCreated?: boolean;
  enableUpdated?: boolean;
  enableAccessed?: boolean;
  customFields?: Record<string, any>;
  prefix?: string;
  suffix?: string;
}

export interface TimestampedEntity {
  id?: string;
  createdAt?: number;
  updatedAt?: number;
  accessedAt?: number;
  _timestampVersion?: string;
  [key: string]: any;
}

export interface AutoStampResult {
  entity: TimestampedEntity;
  stampsApplied: string[];
  performance: number;
  source: 'auto-timestamp';
}

export type OperationType = 'CREATE' | 'UPDATE' | 'READ' | 'DELETE' | 'SHARE' | 'custom';

/**
 * AutoTimestamp - Automatic timestamp injection service
 * Eliminates manual timestamp management completely
 * CORRECTED: APIs now match test expectations
 */
export class AutoTimestamp {
  private static instance: SystemTimestamp;
  private systemTimestamp: SystemTimestamp;
  private readonly defaultConfig: AutoTimestampConfig = {
    enableCreated: true,
    enableUpdated: true,
    enableAccessed: false,
    prefix: '',
    suffix: 'At'
  };
  
  private eventListeners: Function[] = [];
  private operationHooks: Map<OperationType, Function[]> = new Map();
  
  constructor(systemTimestamp?: SystemTimestamp) {
    this.systemTimestamp = systemTimestamp || new SystemTimestamp();
    this.initializeOperationHooks();
  }

  /**
   * Automatically stamp entity with current timestamp
   * CORRECTED: Returns simple object with timestamps injected directly
   */
  public autoStamp(entity: any, config: AutoTimestampConfig = {}): any {
    const startTime = performance.now();
    const finalConfig = { ...this.defaultConfig, ...config };
    
    try {
      // Create timestamped copy of entity
      const timestampedEntity = { ...entity };
      const currentTimestamp = this.systemTimestamp.getTimestamp();
      
      // Inject timestamps
      timestampedEntity.createdAt = currentTimestamp;
      timestampedEntity.updatedAt = currentTimestamp;
      timestampedEntity._timestampVersion = 'V8.1';
      
      const duration = performance.now() - startTime;
      
      // Trigger events
      this.notifyEventListeners({
        operation: 'AUTO_STAMP',
        timestamp: currentTimestamp,
        data: timestampedEntity
      });
      
      console.debug('AutoTimestamp: Entity auto-stamped with timestamps');
      
      return timestampedEntity;
      
    } catch (error) {
      console.error('AutoTimestamp: Error auto-stamping entity', error);
      // Return original entity with fallback timestamp
      return {
        ...entity,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        _timestampVersion: 'V8.1'
      };
    }
  }

  /**
   * Inject timestamps into CRUD operations
   * CORRECTED: Method that tests expect to exist
   */
  public injectTimestamp(operation: OperationType, data: any): any {
    const currentTimestamp = this.systemTimestamp.getTimestamp();
    const result = { ...data };
    
    switch (operation) {
      case 'CREATE':
        result.createdAt = currentTimestamp;
        result.updatedAt = currentTimestamp;
        result._timestampVersion = 'V8.1';
        break;
        
      case 'UPDATE':
        result.updatedAt = currentTimestamp;
        // Don't overwrite createdAt on updates
        break;
        
      case 'SHARE':
        result.sharedAt = currentTimestamp;
        break;
        
      default:
        result.updatedAt = currentTimestamp;
        break;
    }
    
    return result;
  }

  /**
   * Update existing timestamps on data changes
   * CORRECTED: Method that tests expect to exist
   */
  public updateTimestamp(data: any): any {
    const currentTimestamp = this.systemTimestamp.getTimestamp();
    const result = { ...data };
    
    // Update the updatedAt timestamp, preserve createdAt
    result.updatedAt = currentTimestamp;
    
    // Add version if not present
    if (!result._timestampVersion) {
      result._timestampVersion = 'V8.1';
    }
    
    return result;
  }

  /**
   * Register event listener for timestamp events
   * CORRECTED: Method that tests expect to exist
   */
  public onTimestampUpdate(callback: Function): void {
    this.eventListeners.push(callback);
  }

  /**
   * Remove event listener
   */
  public removeEventListener(callback: Function): void {
    const index = this.eventListeners.indexOf(callback);
    if (index > -1) {
      this.eventListeners.splice(index, 1);
    }
  }

  /**
   * Notify all event listeners
   */
  private notifyEventListeners(event: any): void {
    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('AutoTimestamp: Error in event listener', error);
      }
    });
  }

  /**
   * Inject timestamp into entity with operation context  
   * PRESERVED: For backward compatibility with existing code
   */
  public injectTimestampWithContext(
    entity: any, 
    operation: OperationType = 'UPDATE',
    preserveCreated: boolean = true,
    config: AutoTimestampConfig = {}
  ): any {
    const originalCreatedAt = preserveCreated ? entity.createdAt : undefined;
    
    const result = this.autoStamp(entity, config);
    
    // Preserve original creation timestamp if requested
    if (preserveCreated && originalCreatedAt) {
      result.createdAt = originalCreatedAt;
    }
    
    return result;
  }

  /**
   * Batch timestamp multiple entities
   * Optimized for bulk operations
   */
  public batchAutoStamp(
    entities: any[],
    operation: OperationType = 'UPDATE',
    config: AutoTimestampConfig = {}
  ): any[] {
    const startTime = performance.now();
    
    const results = entities.map(entity => this.autoStamp(entity, config));
    
    const totalTime = performance.now() - startTime;
    console.debug(`AutoTimestamp: Batch processed ${entities.length} entities in ${totalTime.toFixed(2)}ms`);
    
    return results;
  }

  /**
   * Register operation hook for specific CRUD operations
   */
  public registerOperationHook(operation: OperationType, hook: Function): void {
    if (!this.operationHooks.has(operation)) {
      this.operationHooks.set(operation, []);
    }
    this.operationHooks.get(operation)!.push(hook);
  }

  /**
   * Initialize default operation hooks
   */
  private initializeOperationHooks(): void {
    // Hook for create operations
    this.registerOperationHook('CREATE', (entity: TimestampedEntity) => {
      console.debug('AutoTimestamp: Entity created with auto timestamps', entity.id);
    });
    
    // Hook for update operations
    this.registerOperationHook('UPDATE', (entity: TimestampedEntity) => {
      console.debug('AutoTimestamp: Entity updated with auto timestamp', entity.id);
    });
  }

  /**
   * Trigger operation hooks
   */
  private triggerOperationHooks(operation: OperationType, entity: TimestampedEntity): void {
    const hooks = this.operationHooks.get(operation);
    if (hooks) {
      hooks.forEach(hook => {
        try {
          hook(entity);
        } catch (error) {
          console.error(`AutoTimestamp: Error in ${operation} hook`, error);
        }
      });
    }
  }

  /**
   * Get configuration for specific service integration
   */
  public getServiceConfig(serviceName: string): AutoTimestampConfig {
    // Service-specific configurations
    const serviceConfigs: Record<string, AutoTimestampConfig> = {
      'IdeaBankService': {
        enableCreated: true,
        enableUpdated: true,
        enableAccessed: false,
        customFields: {
          'generated': { format: 'iso' },
          'analyzed': { format: 'iso' }
        }
      },
      'UserService': {
        enableCreated: true,
        enableUpdated: true,
        enableAccessed: true,
        customFields: {
          'lastLogin': { format: 'iso' }
        }
      }
    };
    
    return serviceConfigs[serviceName] || this.defaultConfig;
  }

  /**
   * Performance monitoring for auto timestamp operations
   */
  public getPerformanceMetrics(): {
    totalOperations: number;
    averageInjectionTime: number;
    successRate: number;
    mostUsedOperation: OperationType;
  } {
    // This would connect to a more sophisticated metrics system
    // For now, return mock data to demonstrate the interface
    return {
      totalOperations: 1000,
      averageInjectionTime: 0.5,
      successRate: 99.8,
      mostUsedOperation: 'UPDATE'
    };
  }
}

// Export singleton instance
export const autoTimestamp = new AutoTimestamp(); 