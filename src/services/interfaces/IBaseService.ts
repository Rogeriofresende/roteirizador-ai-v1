/**
 * Base Service Interface
 * Contract base para todos os serviços do sistema
 */

export interface ServiceHealthStatus {
  status: 'healthy' | 'degraded' | 'offline';
  lastCheck: Date;
  details?: Record<string, any>;
  error?: string;
}

export interface ServiceMetrics {
  initTime?: number;
  lastActivity?: Date;
  operationCount?: number;
  errorCount?: number;
  [key: string]: any;
}

export interface IBaseService {
  // Lifecycle methods
  initialize(): Promise<void> | void;
  dispose(): Promise<void> | void;
  
  // Health monitoring
  getHealth(): Promise<ServiceHealthStatus> | ServiceHealthStatus;
  getMetrics(): ServiceMetrics;
  
  // Service identification
  getServiceName(): string;
  getVersion(): string;
}

/**
 * Service configuration interface
 */
export interface ServiceConfig {
  enabled: boolean;
  environment: 'development' | 'test' | 'production';
  retryPolicy?: {
    maxRetries: number;
    backoffMs: number;
  };
  timeout?: number;
  [key: string]: any;
}

/**
 * Service lifecycle states
 */
export enum ServiceLifecycleState {
  UNINITIALIZED = 'uninitialized',
  INITIALIZING = 'initializing', 
  READY = 'ready',
  DEGRADED = 'degraded',
  OFFLINE = 'offline',
  DISPOSING = 'disposing',
  DISPOSED = 'disposed'
} 