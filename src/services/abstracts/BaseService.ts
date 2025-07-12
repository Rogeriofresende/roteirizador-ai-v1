/**
 * Base Service Abstract Class
 * Implementação base para todos os serviços do sistema
 */

import { createLogger } from '../../utils/logger';
import {
  IBaseService,
  ServiceHealthStatus,
  ServiceMetrics,
  ServiceConfig,
  ServiceLifecycleState
} from '../interfaces';

export abstract class BaseService implements IBaseService {
  protected logger: ReturnType<typeof createLogger>;
  protected config: ServiceConfig;
  protected state: ServiceLifecycleState = ServiceLifecycleState.UNINITIALIZED;
  protected metrics: ServiceMetrics = {
    operationCount: 0,
    errorCount: 0
  };
  private initStartTime?: number;

  constructor(config: ServiceConfig) {
    this.config = config;
    this.logger = createLogger(this.getServiceName());
    this.logger.info(`${this.getServiceName()} created`, {
      version: this.getVersion(),
      enabled: config.enabled
    });
  }

  /**
   * Initialize the service
   */
  async initialize(): Promise<void> {
    if (this.state !== ServiceLifecycleState.UNINITIALIZED) {
      this.logger.warn(`Service already initialized: ${this.state}`);
      return;
    }

    this.state = ServiceLifecycleState.INITIALIZING;
    this.initStartTime = Date.now();

    try {
      this.logger.info('Initializing service...');
      
      if (!this.config.enabled) {
        this.logger.info('Service disabled by configuration');
        this.state = ServiceLifecycleState.OFFLINE;
        return;
      }

      await this.onInitialize();
      
      this.metrics.initTime = Date.now() - this.initStartTime;
      this.state = ServiceLifecycleState.READY;
      
      this.logger.info('Service initialized successfully', {
        initTime: this.metrics.initTime
      });
    } catch (error) {
      this.state = ServiceLifecycleState.OFFLINE;
      this.metrics.errorCount++;
      this.logger.error('Service initialization failed', error);
      throw error;
    }
  }

  /**
   * Dispose the service
   */
  async dispose(): Promise<void> {
    if (this.state === ServiceLifecycleState.DISPOSED) {
      return;
    }

    this.state = ServiceLifecycleState.DISPOSING;

    try {
      this.logger.info('Disposing service...');
      await this.onDispose();
      this.state = ServiceLifecycleState.DISPOSED;
      this.logger.info('Service disposed successfully');
    } catch (error) {
      this.logger.error('Service disposal failed', error);
      throw error;
    }
  }

  /**
   * Get service health status
   */
  async getHealth(): Promise<ServiceHealthStatus> {
    try {
      const customHealth = await this.checkHealth();
      const baseStatus = this.getBaseHealthStatus();

      return {
        status: customHealth.status || baseStatus.status,
        lastCheck: new Date(),
        details: {
          ...baseStatus.details,
          ...customHealth.details,
          state: this.state,
          uptime: this.getUptime()
        },
        error: customHealth.error || baseStatus.error
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
   * Get service metrics
   */
  getMetrics(): ServiceMetrics {
    return {
      ...this.metrics,
      lastActivity: new Date()
    };
  }

  /**
   * Get service name (must be implemented by subclasses)
   */
  abstract getServiceName(): string;

  /**
   * Get service version (must be implemented by subclasses)
   */
  abstract getVersion(): string;

  /**
   * Custom initialization logic (optional override)
   */
  protected async onInitialize(): Promise<void> {
    // Default implementation - do nothing
  }

  /**
   * Custom disposal logic (optional override)
   */
  protected async onDispose(): Promise<void> {
    // Default implementation - do nothing
  }

  /**
   * Custom health check logic (optional override)
   */
  protected async checkHealth(): Promise<Partial<ServiceHealthStatus>> {
    return {
      status: this.state === ServiceLifecycleState.READY ? 'healthy' : 'degraded'
    };
  }

  /**
   * Increment operation counter
   */
  protected incrementOperationCount(): void {
    this.metrics.operationCount = (this.metrics.operationCount || 0) + 1;
    this.metrics.lastActivity = new Date();
  }

  /**
   * Increment error counter
   */
  protected incrementErrorCount(): void {
    this.metrics.errorCount = (this.metrics.errorCount || 0) + 1;
  }

  /**
   * Execute operation with metrics tracking
   */
  protected async executeWithMetrics<T>(
    operation: () => Promise<T>,
    operationName?: string
  ): Promise<T> {
    this.incrementOperationCount();
    
    try {
      const result = await operation();
      return result;
    } catch (error) {
      this.incrementErrorCount();
      this.logger.error(`Operation failed: ${operationName || 'unknown'}`, error);
      throw error;
    }
  }

  /**
   * Execute operation with retry logic
   */
  protected async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries?: number,
    backoffMs?: number
  ): Promise<T> {
    const retries = maxRetries || this.config.retryPolicy?.maxRetries || 3;
    const backoff = backoffMs || this.config.retryPolicy?.backoffMs || 1000;

    let lastError: Error;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt === retries) {
          break;
        }

        this.logger.warn(`Operation failed, retrying... (${attempt + 1}/${retries})`, {
          error: lastError.message
        });

        await this.delay(backoff * Math.pow(2, attempt));
      }
    }

    this.incrementErrorCount();
    throw lastError!;
  }

  /**
   * Check if service is ready
   */
  protected isReady(): boolean {
    return this.state === ServiceLifecycleState.READY;
  }

  /**
   * Check if service is enabled
   */
  protected isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Get base health status
   */
  private getBaseHealthStatus(): ServiceHealthStatus {
    let status: 'healthy' | 'degraded' | 'offline';

    switch (this.state) {
      case ServiceLifecycleState.READY:
        status = 'healthy';
        break;
      case ServiceLifecycleState.DEGRADED:
        status = 'degraded';
        break;
      default:
        status = 'offline';
    }

    return {
      status,
      lastCheck: new Date(),
      details: {
        state: this.state,
        enabled: this.config.enabled,
        operations: this.metrics.operationCount,
        errors: this.metrics.errorCount
      }
    };
  }

  /**
   * Get service uptime
   */
  private getUptime(): number | undefined {
    return this.metrics.initTime ? Date.now() - this.initStartTime! : undefined;
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 