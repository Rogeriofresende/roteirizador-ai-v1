/**
 * 🗃️ DATABASE OPTIMIZATION SERVICE
 * Advanced database optimization with connection pooling, query batching, and intelligent caching
 */

import { db } from '../firebaseConfig';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  getDoc, 
  doc, 
  writeBatch,
  runTransaction,
  enableNetwork,
  disableNetwork,
  clearIndexedDbPersistence,
  enableIndexedDbPersistence
} from 'firebase/firestore';
import { logger } from '../utils/logger';
import { performanceService } from './performance';
import { cacheService } from './cacheService';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface QueryOptimization {
  batchSize: number;
  cacheStrategy: 'aggressive' | 'conservative' | 'none';
  indexHints: string[];
  timeoutMs: number;
  retryConfig: {
    maxRetries: number;
    backoffMs: number;
  };
}

interface DatabaseMetrics {
  queryLatency: number;
  hitRate: number;
  connectionPoolSize: number;
  activeQueries: number;
  errorRate: number;
  throughput: number;
}

interface BatchOperation {
  type: 'create' | 'update' | 'delete';
  collection: string;
  docId: string;
  data?: any;
}

interface ConnectionPoolConfig {
  maxConnections: number;
  connectionTimeout: number;
  idleTimeout: number;
  retryDelay: number;
}

// =============================================================================
// CONNECTION POOL MANAGER
// =============================================================================

class ConnectionPoolManager {
  private connections: Set<any> = new Set();
  private pendingQueries: Array<() => Promise<any>> = [];
  private activeQueries = 0;
  private maxConcurrentQueries = 10;
  private queryTimeouts = new Map<string, NodeJS.Timeout>();

  async executeQuery<T>(
    queryFn: () => Promise<T>,
    queryId: string,
    timeoutMs: number = 30000
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const execute = async () => {
        const startTime = performance.now();
        
        try {
          this.activeQueries++;
          
          // Set timeout
          const timeout = setTimeout(() => {
            this.activeQueries--;
            reject(new Error(`Query timeout: ${queryId}`));
          }, timeoutMs);
          
          this.queryTimeouts.set(queryId, timeout);
          
          const result = await queryFn();
          
          // Clear timeout
          clearTimeout(timeout);
          this.queryTimeouts.delete(queryId);
          
          this.activeQueries--;
          this.processQueue();
          
          const duration = performance.now() - startTime;
          performanceService.recordMetric('db_query_success', duration, 'ms', 'database', {
            queryId,
            activeQueries: this.activeQueries
          });
          
          resolve(result);
        } catch (error: unknown) {
          this.activeQueries--;
          this.processQueue();
          
          const duration = performance.now() - startTime;
          performanceService.recordMetric('db_query_error', duration, 'ms', 'database', {
            queryId,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          
          reject(error);
        }
      };

      if (this.activeQueries < this.maxConcurrentQueries) {
        execute();
      } else {
        this.pendingQueries.push(execute);
      }
    });
  }

  private processQueue(): void {
    while (this.pendingQueries.length > 0 && this.activeQueries < this.maxConcurrentQueries) {
      const nextQuery = this.pendingQueries.shift();
      if (nextQuery) {
        nextQuery();
      }
    }
  }

  getActiveQueries(): number {
    return this.activeQueries;
  }

  getPendingQueries(): number {
    return this.pendingQueries.length;
  }
}

// =============================================================================
// QUERY OPTIMIZER
// =============================================================================

class QueryOptimizer {
  private queryCache = new Map<string, any>();
  private queryStats = new Map<string, { count: number; avgDuration: number }>();

  optimizeQuery(queryConfig: any, optimization: QueryOptimization): any {
    // Apply query optimizations
    let optimizedQuery = { ...queryConfig };

    // Add intelligent batching
    if (optimization.batchSize > 1) {
      optimizedQuery = {
        ...optimizedQuery,
        limit: Math.min(queryConfig.limit || 100, optimization.batchSize)
      };
    }

    // Add index hints (Firebase specific optimizations)
    if (optimization.indexHints.length > 0) {
      logger.debug('Applying index hints', { hints: optimization.indexHints }, 'DATABASE');
    }

    return optimizedQuery;
  }

  async executeOptimizedQuery<T>(
    queryKey: string,
    queryFn: () => Promise<T>,
    optimization: QueryOptimization
  ): Promise<T> {
    const startTime = performance.now();

    // Check cache first
    if (optimization.cacheStrategy !== 'none') {
      const cached = await cacheService.get<T>(queryKey);
      if (cached) {
        logger.debug('Query served from cache', { queryKey }, 'DATABASE');
        return cached;
      }
    }

    // Execute query with retries
    let lastError: Error | null = null;
    for (let attempt = 0; attempt <= optimization.retryConfig.maxRetries; attempt++) {
      try {
        const result = await queryFn();
        
        // Cache result based on strategy
        if (optimization.cacheStrategy === 'aggressive') {
          await cacheService.set(queryKey, result, {
            ttl: 10 * 60 * 1000, // 10 minutes
            strategy: ['memory', 'localStorage', 'indexedDB']
          });
        } else if (optimization.cacheStrategy === 'conservative') {
          await cacheService.set(queryKey, result, {
            ttl: 2 * 60 * 1000, // 2 minutes
            strategy: ['memory']
          });
        }

        // Update query stats
        const duration = performance.now() - startTime;
        this.updateQueryStats(queryKey, duration);
        
        return result;
      } catch (error: unknown) {
        lastError = error as Error;
        
        if (attempt < optimization.retryConfig.maxRetries) {
          await new Promise(resolve => 
            setTimeout(resolve, optimization.retryConfig.backoffMs * Math.pow(2, attempt))
          );
        }
      }
    }

    throw lastError;
  }

  private updateQueryStats(queryKey: string, duration: number): void {
    const stats = this.queryStats.get(queryKey) || { count: 0, avgDuration: 0 };
    stats.count++;
    stats.avgDuration = (stats.avgDuration * (stats.count - 1) + duration) / stats.count;
    this.queryStats.set(queryKey, stats);
  }

  getQueryStats(): Map<string, { count: number; avgDuration: number }> {
    return this.queryStats;
  }
}

// =============================================================================
// BATCH OPERATION MANAGER
// =============================================================================

class BatchOperationManager {
  private pendingOperations: Array<BatchOperation & { resolve?: () => void; reject?: (error: unknown) => void }> = [];
  private batchTimeout: NodeJS.Timeout | null = null;
  private maxBatchSize = 500; // Firestore limit
  private batchTimeoutMs = 1000; // 1 second

  addOperation(operation: BatchOperation): Promise<void> {
    return new Promise((resolve, reject) => {
      this.pendingOperations.push({ ...operation, resolve, reject });
      
      if (this.pendingOperations.length >= this.maxBatchSize) {
        this.flushBatch();
      } else if (!this.batchTimeout) {
        this.batchTimeout = setTimeout(() => this.flushBatch(), this.batchTimeoutMs);
      }
    });
  }

  private async flushBatch(): Promise<void> {
    if (this.pendingOperations.length === 0) return;

    const operations = this.pendingOperations.splice(0, this.maxBatchSize);
    
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }

    const startTime = performance.now();

    try {
      const batch = writeBatch(db);
      
      for (const operation of operations) {
        const docRef = doc(db, operation.collection, operation.docId);
        
        switch (operation.type) {
          case 'create':
          case 'update':
            batch.set(docRef, operation.data, { merge: operation.type === 'update' });
            break;
          case 'delete':
            batch.delete(docRef);
            break;
        }
      }

      await batch.commit();

      const duration = performance.now() - startTime;
      performanceService.recordMetric('batch_operation_success', duration, 'ms', 'database', {
        operationCount: operations.length,
        types: operations.map(op => op.type)
      });

      // Resolve all operations
      operations.forEach((op) => op.resolve?.());

      logger.info('Batch operation completed', {
        operationCount: operations.length,
        duration: `${duration.toFixed(2)}ms`
      }, 'DATABASE');

    } catch (error: unknown) {
      const duration = performance.now() - startTime;
      performanceService.recordMetric('batch_operation_error', duration, 'ms', 'database', {
        operationCount: operations.length,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      // Reject all operations
      operations.forEach((op) => op.reject?.(error));

      logger.error('Batch operation failed', {
        operationCount: operations.length,
        error
      }, 'DATABASE');
    }
  }

  async flush(): Promise<void> {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }
    await this.flushBatch();
  }
}

// =============================================================================
// MAIN DATABASE OPTIMIZATION SERVICE
// =============================================================================

export class DatabaseOptimizationService {
  private connectionPool = new ConnectionPoolManager();
  private queryOptimizer = new QueryOptimizer();
  private batchManager = new BatchOperationManager();
  private metrics: DatabaseMetrics = {
    queryLatency: 0,
    hitRate: 0,
    connectionPoolSize: 0,
    activeQueries: 0,
    errorRate: 0,
    throughput: 0
  };

  private defaultOptimization: QueryOptimization = {
    batchSize: 100,
    cacheStrategy: 'conservative',
    indexHints: [],
    timeoutMs: 30000,
    retryConfig: {
      maxRetries: 3,
      backoffMs: 1000
    }
  };

  async initialize(): Promise<boolean> {
    try {
      // Enable offline persistence
      await enableIndexedDbPersistence(db, {
        forceOwnership: false
      });

      logger.info('Database optimization service initialized', {
        offlinePersistence: true,
        connectionPooling: true,
        batchOperations: true
      }, 'DATABASE');

      return true;
    } catch (error: unknown) {
      logger.warn('Failed to enable offline persistence', { error }, 'DATABASE');
      return false; // Not critical, continue without persistence
    }
  }

  /**
   * Optimized query execution with caching and connection pooling
   */
  async executeQuery<T>(
    queryKey: string,
    queryFn: () => Promise<T>,
    optimization: Partial<QueryOptimization> = {}
  ): Promise<T> {
    const mergedOptimization = { ...this.defaultOptimization, ...optimization };
    
    return this.connectionPool.executeQuery(
      () => this.queryOptimizer.executeOptimizedQuery(queryKey, queryFn, mergedOptimization),
      queryKey,
      mergedOptimization.timeoutMs
    );
  }

  /**
   * Optimized collection queries with intelligent batching
   */
  async getCollectionOptimized<T>(
    collectionName: string,
    queryConstraints: unknown[] = [],
    optimization: Partial<QueryOptimization> = {}
  ): Promise<T[]> {
    const queryKey = `collection_${collectionName}_${JSON.stringify(queryConstraints)}`;
    
    return this.executeQuery(
      queryKey,
      async () => {
        const q = query(collection(db, collectionName), ...queryConstraints);
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
      },
      optimization
    );
  }

  /**
   * Optimized document retrieval with caching
   */
  async getDocumentOptimized<T>(
    collectionName: string,
    docId: string,
    optimization: Partial<QueryOptimization> = {}
  ): Promise<T | null> {
    const queryKey = `document_${collectionName}_${docId}`;
    
    return this.executeQuery(
      queryKey,
      async () => {
        const docRef = doc(db, collectionName, docId);
        const snapshot = await getDoc(docRef);
        return snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as T) : null;
      },
      optimization
    );
  }

  /**
   * Batch operations for high-throughput scenarios
   */
  async batchCreate(collectionName: string, documents: Array<{ id: string; data: any }>): Promise<void> {
    const operations = documents.map(doc => ({
      type: 'create' as const,
      collection: collectionName,
      docId: doc.id,
      data: doc.data
    }));

    await Promise.all(operations.map(op => this.batchManager.addOperation(op)));
  }

  async batchUpdate(collectionName: string, updates: Array<{ id: string; data: any }>): Promise<void> {
    const operations = updates.map(update => ({
      type: 'update' as const,
      collection: collectionName,
      docId: update.id,
      data: update.data
    }));

    await Promise.all(operations.map(op => this.batchManager.addOperation(op)));
  }

  async batchDelete(collectionName: string, docIds: string[]): Promise<void> {
    const operations = docIds.map(docId => ({
      type: 'delete' as const,
      collection: collectionName,
      docId
    }));

    await Promise.all(operations.map(op => this.batchManager.addOperation(op)));
  }

  /**
   * Transaction support for complex operations
   */
  async executeTransaction<T>(transactionFn: (transaction: any) => Promise<T>): Promise<T> {
    const startTime = performance.now();
    
    try {
      const result = await runTransaction(db, transactionFn);
      
      const duration = performance.now() - startTime;
      performanceService.recordMetric('transaction_success', duration, 'ms', 'database');
      
      return result;
    } catch (error: unknown) {
      const duration = performance.now() - startTime;
      performanceService.recordMetric('transaction_error', duration, 'ms', 'database', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw error;
    }
  }

  /**
   * Network optimization controls
   */
  async enableOfflineMode(): Promise<void> {
    await disableNetwork(db);
    logger.info('Database switched to offline mode', {}, 'DATABASE');
  }

  async enableOnlineMode(): Promise<void> {
    await enableNetwork(db);
    logger.info('Database switched to online mode', {}, 'DATABASE');
  }

  /**
   * Cache management
   */
  async clearDatabaseCache(): Promise<void> {
    await clearIndexedDbPersistence(db);
    logger.info('Database cache cleared', {}, 'DATABASE');
  }

  async preloadCriticalData(preloadQueries: Array<{ key: string; queryFn: () => Promise<any> }>): Promise<void> {
    const startTime = performance.now();
    
    try {
      await Promise.all(
        preloadQueries.map(({ key, queryFn }) =>
          this.executeQuery(key, queryFn, { cacheStrategy: 'aggressive' })
        )
      );

      const duration = performance.now() - startTime;
      performanceService.recordMetric('data_preload_success', duration, 'ms', 'database', {
        queryCount: preloadQueries.length
      });

      logger.info('Critical data preloaded', {
        queryCount: preloadQueries.length,
        duration: `${duration.toFixed(2)}ms`
      }, 'DATABASE');
    } catch (error: unknown) {
      logger.error('Critical data preload failed', { error }, 'DATABASE');
    }
  }

  /**
   * Performance monitoring and metrics
   */
  getMetrics(): DatabaseMetrics {
    return {
      ...this.metrics,
      activeQueries: this.connectionPool.getActiveQueries(),
      queryLatency: this.calculateAverageLatency(),
      hitRate: this.calculateCacheHitRate()
    };
  }

  private calculateAverageLatency(): number {
    const stats = Array.from(this.queryOptimizer.getQueryStats().values());
    if (stats.length === 0) return 0;
    
    return stats.reduce((sum, stat) => sum + stat.avgDuration, 0) / stats.length;
  }

  private calculateCacheHitRate(): number {
    const cacheStats = cacheService.getStats();
    const total = cacheStats.totalHits + cacheStats.totalMisses;
    return total > 0 ? (cacheStats.totalHits / total) * 100 : 0;
  }

  /**
   * Cleanup and resource management
   */
  async cleanup(): Promise<void> {
    await this.batchManager.flush();
    logger.info('Database optimization service cleaned up', {}, 'DATABASE');
  }
}

// =============================================================================
// QUERY HELPERS AND UTILITIES
// =============================================================================

/**
 * Query builder with optimization hints
 */
export class OptimizedQueryBuilder {
  private queryConstraints: unknown[] = [];
  private optimization: Partial<QueryOptimization> = {};

  where(field: string, operator: any, value: any): this {
    this.queryConstraints.push(where(field, operator, value));
    return this;
  }

  orderBy(field: string, direction: 'asc' | 'desc' = 'asc'): this {
    this.queryConstraints.push(orderBy(field, direction));
    return this;
  }

  limit(count: number): this {
    this.queryConstraints.push(limit(count));
    return this;
  }

  cache(strategy: 'aggressive' | 'conservative' | 'none'): this {
    this.optimization.cacheStrategy = strategy;
    return this;
  }

  timeout(ms: number): this {
    this.optimization.timeoutMs = ms;
    return this;
  }

  retry(maxRetries: number, backoffMs: number = 1000): this {
    this.optimization.retryConfig = { maxRetries, backoffMs };
    return this;
  }

  build(): { constraints: unknown[]; optimization: Partial<QueryOptimization> } {
    return {
      constraints: this.queryConstraints,
      optimization: this.optimization
    };
  }
}

// =============================================================================
// DECORATORS
// =============================================================================

/**
 * Database query decorator with automatic optimization
 */
export function DatabaseOptimized(optimization: Partial<QueryOptimization> = {}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: unknown[]) {
      const queryKey = `${target.constructor.name}_${propertyKey}_${JSON.stringify(args)}`;
      
      return databaseOptimizationService.executeQuery(
        queryKey,
        () => originalMethod.apply(this, args),
        optimization
      );
    };
  };
}

// =============================================================================
// GLOBAL SERVICE INSTANCE
// =============================================================================

export const databaseOptimizationService = new DatabaseOptimizationService();

// Auto-initialize
databaseOptimizationService.initialize().catch(error => {
  logger.error('Failed to initialize database optimization service', { error }, 'DATABASE');
});

export default databaseOptimizationService; 