/**
 * Data Layer APIs V8.0 - Enterprise Database & Cache Management
 * 
 * Optimized data access layer with intelligent caching, connection pooling,
 * and performance monitoring integration following V8.0 methodology
 * 
 * @version 8.0.0
 * @since 2025-01-16
 */

import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';
import { apmIntegrationLayer, APMMetric } from './APMIntegrationLayer';

// Types
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
  connectionLimit: number;
  acquireTimeout: number;
  timeout: number;
  reconnect: boolean;
}

export interface CacheConfig {
  provider: 'memory' | 'redis' | 'memcached';
  host?: string;
  port?: number;
  maxMemory: number;
  ttl: number;
  compression: boolean;
  serialization: 'json' | 'binary';
}

export interface QueryMetrics {
  query: string;
  executionTime: number;
  rows: number;
  cached: boolean;
  timestamp: number;
  database: string;
}

export interface ConnectionPoolStats {
  total: number;
  active: number;
  idle: number;
  waiting: number;
  created: number;
  destroyed: number;
  avgResponseTime: number;
  errors: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  memoryUsage: number;
  itemCount: number;
  evictions: number;
}

export interface DataLayerHealth {
  database: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    connections: ConnectionPoolStats;
    avgQueryTime: number;
  };
  cache: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    stats: CacheStats;
    memoryUtilization: number;
  };
  overall: 'healthy' | 'degraded' | 'unhealthy';
}

/**
 * Intelligent Cache with adaptive algorithms
 */
class IntelligentCache extends EventEmitter {
  private cache: Map<string, { value: any; timestamp: number; accessCount: number; size: number }> = new Map();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    hitRate: 0,
    memoryUsage: 0,
    itemCount: 0,
    evictions: 0
  };
  
  private maxMemory: number;
  private defaultTtl: number;
  private compressionEnabled: boolean;

  constructor(config: CacheConfig) {
    super();
    this.maxMemory = config.maxMemory;
    this.defaultTtl = config.ttl;
    this.compressionEnabled = config.compression;
    
    // Start cleanup process
    setInterval(() => this.cleanup(), 60000); // Every minute
    setInterval(() => this.updateStats(), 10000); // Every 10 seconds
  }

  set(key: string, value: any, ttl?: number): void {
    const effectiveTtl = ttl || this.defaultTtl;
    const serialized = this.serialize(value);
    const size = this.calculateSize(serialized);
    
    // Check memory limits
    if (this.stats.memoryUsage + size > this.maxMemory) {
      this.evictLeastRecentlyUsed(size);
    }
    
    this.cache.set(key, {
      value: serialized,
      timestamp: Date.now() + effectiveTtl,
      accessCount: 0,
      size
    });
    
    this.stats.memoryUsage += size;
    this.stats.itemCount++;
    
    this.emit('cache-set', { key, size, ttl: effectiveTtl });
  }

  get(key: string): any {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      this.updateHitRate();
      this.emit('cache-miss', { key });
      return null;
    }
    
    // Check expiration
    if (Date.now() > entry.timestamp) {
      this.delete(key);
      this.stats.misses++;
      this.updateHitRate();
      this.emit('cache-expired', { key });
      return null;
    }
    
    entry.accessCount++;
    this.stats.hits++;
    this.updateHitRate();
    this.emit('cache-hit', { key, accessCount: entry.accessCount });
    
    return this.deserialize(entry.value);
  }

  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (entry) {
      this.stats.memoryUsage -= entry.size;
      this.stats.itemCount--;
      this.cache.delete(key);
      this.emit('cache-delete', { key, size: entry.size });
      return true;
    }
    return false;
  }

  clear(): void {
    const itemCount = this.stats.itemCount;
    this.cache.clear();
    this.stats.memoryUsage = 0;
    this.stats.itemCount = 0;
    this.emit('cache-clear', { itemsRemoved: itemCount });
  }

  private evictLeastRecentlyUsed(requiredSpace: number): void {
    const entries = Array.from(this.cache.entries())
      .sort((a, b) => a[1].accessCount - b[1].accessCount || a[1].timestamp - b[1].timestamp);
    
    let freedSpace = 0;
    let evicted = 0;
    
    for (const [key, entry] of entries) {
      if (freedSpace >= requiredSpace) break;
      
      this.cache.delete(key);
      freedSpace += entry.size;
      evicted++;
      this.stats.memoryUsage -= entry.size;
      this.stats.itemCount--;
      this.stats.evictions++;
    }
    
    this.emit('cache-eviction', { evicted, freedSpace });
  }

  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.timestamp) {
        this.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      this.emit('cache-cleanup', { cleaned });
    }
  }

  private updateStats(): void {
    this.updateHitRate();
    this.emit('cache-stats', this.stats);
  }

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
  }

  private serialize(value: any): any {
    if (this.compressionEnabled) {
      // In real implementation, use actual compression library
      return JSON.stringify(value);
    }
    return value;
  }

  private deserialize(value: any): any {
    if (this.compressionEnabled && typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  }

  private calculateSize(value: any): number {
    if (typeof value === 'string') {
      return value.length * 2; // UTF-16
    }
    return JSON.stringify(value).length * 2;
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }
}

/**
 * Advanced Connection Pool with intelligent management
 */
class AdvancedConnectionPool extends EventEmitter {
  private connections: Map<string, { 
    connection: any; 
    created: number; 
    lastUsed: number; 
    inUse: boolean; 
    queryCount: number;
    avgResponseTime: number;
  }> = new Map();
  
  private config: DatabaseConfig;
  private stats: ConnectionPoolStats = {
    total: 0,
    active: 0,
    idle: 0,
    waiting: 0,
    created: 0,
    destroyed: 0,
    avgResponseTime: 0,
    errors: 0
  };
  
  private waitingQueue: Array<{ resolve: Function; reject: Function; timestamp: number }> = [];

  constructor(config: DatabaseConfig) {
    super();
    this.config = config;
    
    // Initialize pool
    this.initializePool();
    
    // Start maintenance
    setInterval(() => this.maintainPool(), 30000); // Every 30 seconds
    setInterval(() => this.updateStats(), 5000); // Every 5 seconds
  }

  private async initializePool(): Promise<void> {
    const initialConnections = Math.min(5, this.config.connectionLimit);
    
    for (let i = 0; i < initialConnections; i++) {
      try {
        await this.createConnection();
      } catch (error) {
        console.error('Failed to initialize connection:', error);
      }
    }
  }

  private async createConnection(): Promise<string> {
    if (this.stats.total >= this.config.connectionLimit) {
      throw new Error('Connection limit reached');
    }
    
    const id = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // Simulate connection creation (in real implementation, use actual database driver)
      const connection = { id, database: this.config.database };
      
      this.connections.set(id, {
        connection,
        created: Date.now(),
        lastUsed: Date.now(),
        inUse: false,
        queryCount: 0,
        avgResponseTime: 0
      });
      
      this.stats.total++;
      this.stats.created++;
      this.stats.idle++;
      
      this.emit('connection-created', { id });
      return id;
      
    } catch (error) {
      this.stats.errors++;
      this.emit('connection-error', { error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  }

  async getConnection(): Promise<{ id: string; connection: any }> {
    // Try to get idle connection
    for (const [id, conn] of this.connections.entries()) {
      if (!conn.inUse) {
        conn.inUse = true;
        conn.lastUsed = Date.now();
        this.stats.idle--;
        this.stats.active++;
        this.emit('connection-acquired', { id });
        return { id, connection: conn.connection };
      }
    }
    
    // Try to create new connection
    if (this.stats.total < this.config.connectionLimit) {
      try {
        const id = await this.createConnection();
        const conn = this.connections.get(id)!;
        conn.inUse = true;
        this.stats.idle--;
        this.stats.active++;
        return { id, connection: conn.connection };
      } catch (error) {
        // Fall through to queue
      }
    }
    
    // Queue request
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        const index = this.waitingQueue.findIndex(item => item.resolve === resolve);
        if (index !== -1) {
          this.waitingQueue.splice(index, 1);
          this.stats.waiting--;
          reject(new Error('Connection acquire timeout'));
        }
      }, this.config.acquireTimeout);
      
      this.waitingQueue.push({
        resolve: (result) => {
          clearTimeout(timeout);
          resolve(result);
        },
        reject: (error) => {
          clearTimeout(timeout);
          reject(error);
        },
        timestamp: Date.now()
      });
      
      this.stats.waiting++;
    });
  }

  releaseConnection(id: string): void {
    const conn = this.connections.get(id);
    if (conn && conn.inUse) {
      conn.inUse = false;
      conn.lastUsed = Date.now();
      this.stats.active--;
      this.stats.idle++;
      
      this.emit('connection-released', { id });
      
      // Process waiting queue
      if (this.waitingQueue.length > 0) {
        const waiter = this.waitingQueue.shift()!;
        this.stats.waiting--;
        
        conn.inUse = true;
        this.stats.idle--;
        this.stats.active++;
        
        waiter.resolve({ id, connection: conn.connection });
      }
    }
  }

  private maintainPool(): void {
    const now = Date.now();
    const maxIdleTime = 300000; // 5 minutes
    
    // Remove old idle connections
    for (const [id, conn] of this.connections.entries()) {
      if (!conn.inUse && (now - conn.lastUsed) > maxIdleTime) {
        this.destroyConnection(id);
      }
    }
    
    // Ensure minimum connections
    const minConnections = Math.min(2, this.config.connectionLimit);
    if (this.stats.total < minConnections) {
      this.createConnection().catch(console.error);
    }
  }

  private destroyConnection(id: string): void {
    const conn = this.connections.get(id);
    if (conn) {
      this.connections.delete(id);
      this.stats.total--;
      
      if (conn.inUse) {
        this.stats.active--;
      } else {
        this.stats.idle--;
      }
      
      this.stats.destroyed++;
      this.emit('connection-destroyed', { id });
    }
  }

  private updateStats(): void {
    const connections = Array.from(this.connections.values());
    
    if (connections.length > 0) {
      const totalResponseTime = connections.reduce((sum, conn) => sum + conn.avgResponseTime, 0);
      this.stats.avgResponseTime = totalResponseTime / connections.length;
    }
    
    this.emit('pool-stats', this.stats);
  }

  getStats(): ConnectionPoolStats {
    return { ...this.stats };
  }

  async destroy(): Promise<void> {
    // Reject all waiting requests
    this.waitingQueue.forEach(waiter => {
      waiter.reject(new Error('Connection pool destroyed'));
    });
    this.waitingQueue = [];
    
    // Destroy all connections
    const connectionIds = Array.from(this.connections.keys());
    connectionIds.forEach(id => this.destroyConnection(id));
    
    this.emit('pool-destroyed');
  }
}

/**
 * Main Data Layer APIs Class
 */
export class DataLayerAPIs extends EventEmitter {
  private static instance: DataLayerAPIs;
  private cache: IntelligentCache;
  private connectionPool: AdvancedConnectionPool;
  private queryMetrics: QueryMetrics[] = [];
  private maxQueryMetrics: number = 1000;

  private constructor(dbConfig: DatabaseConfig, cacheConfig: CacheConfig) {
    super();
    this.cache = new IntelligentCache(cacheConfig);
    this.connectionPool = new AdvancedConnectionPool(dbConfig);
    
    this.setupEventListeners();
    this.startMetricsCollection();
  }

  public static getInstance(dbConfig?: DatabaseConfig, cacheConfig?: CacheConfig): DataLayerAPIs {
    if (!DataLayerAPIs.instance) {
      if (!dbConfig || !cacheConfig) {
        throw new Error('Configuration required for first initialization');
      }
      DataLayerAPIs.instance = new DataLayerAPIs(dbConfig, cacheConfig);
    }
    return DataLayerAPIs.instance;
  }

  private setupEventListeners(): void {
    // Cache events
    this.cache.on('cache-hit', (data) => {
      this.emit('cache-hit', data);
    });
    
    this.cache.on('cache-miss', (data) => {
      this.emit('cache-miss', data);
    });
    
    // Connection pool events
    this.connectionPool.on('connection-error', (data) => {
      this.emit('database-error', data);
    });
    
    this.connectionPool.on('pool-stats', (stats) => {
      this.reportConnectionPoolMetrics(stats);
    });
    
    // Cache stats
    this.cache.on('cache-stats', (stats) => {
      this.reportCacheMetrics(stats);
    });
  }

  private startMetricsCollection(): void {
    setInterval(() => {
      this.collectDataLayerMetrics();
    }, 30000); // Every 30 seconds
  }

  private collectDataLayerMetrics(): void {
    const cacheStats = this.cache.getStats();
    const poolStats = this.connectionPool.getStats();
    
    // Report to APM
    const metrics: APMMetric[] = [
      {
        id: `cache_hit_rate_${Date.now()}`,
        name: 'cache_hit_rate',
        value: cacheStats.hitRate,
        unit: 'percentage',
        timestamp: Date.now(),
        source: 'performance',
        severity: cacheStats.hitRate < 70 ? 'medium' : 'low',
        tags: {
          type: 'cache_performance',
          hits: cacheStats.hits.toString(),
          misses: cacheStats.misses.toString()
        }
      },
      {
        id: `db_pool_utilization_${Date.now()}`,
        name: 'database_pool_utilization',
        value: (poolStats.active / poolStats.total) * 100,
        unit: 'percentage',
        timestamp: Date.now(),
        source: 'performance',
        severity: (poolStats.active / poolStats.total) > 0.8 ? 'medium' : 'low',
        tags: {
          active: poolStats.active.toString(),
          total: poolStats.total.toString(),
          waiting: poolStats.waiting.toString()
        }
      }
    ];

    metrics.forEach(metric => {
      apmIntegrationLayer.emit('metric', metric);
    });
  }

  private reportConnectionPoolMetrics(stats: ConnectionPoolStats): void {
    const metric: APMMetric = {
      id: `db_response_time_${Date.now()}`,
      name: 'database_response_time',
      value: stats.avgResponseTime,
      unit: 'milliseconds',
      timestamp: Date.now(),
      source: 'performance',
      severity: stats.avgResponseTime > 100 ? 'medium' : 'low',
      tags: {
        active_connections: stats.active.toString(),
        total_connections: stats.total.toString(),
        errors: stats.errors.toString()
      }
    };

    apmIntegrationLayer.emit('metric', metric);
  }

  private reportCacheMetrics(stats: CacheStats): void {
    const metric: APMMetric = {
      id: `cache_memory_usage_${Date.now()}`,
      name: 'cache_memory_usage',
      value: stats.memoryUsage,
      unit: 'bytes',
      timestamp: Date.now(),
      source: 'memory',
      severity: stats.memoryUsage > 50 * 1024 * 1024 ? 'medium' : 'low', // 50MB threshold
      tags: {
        hit_rate: stats.hitRate.toString(),
        item_count: stats.itemCount.toString(),
        evictions: stats.evictions.toString()
      }
    };

    apmIntegrationLayer.emit('metric', metric);
  }

  // Public API Methods

  /**
   * Execute database query with caching and monitoring
   */
  async executeQuery<T>(
    query: string, 
    params: any[] = [], 
    options: { 
      useCache?: boolean; 
      cacheKey?: string; 
      cacheTtl?: number; 
      timeout?: number 
    } = {}
  ): Promise<T> {
    const startTime = performance.now();
    const cacheKey = options.cacheKey || `query_${Buffer.from(query + JSON.stringify(params)).toString('base64')}`;
    
    // Try cache first
    if (options.useCache !== false) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        const metrics: QueryMetrics = {
          query: query.substring(0, 100), // Truncate for storage
          executionTime: performance.now() - startTime,
          rows: Array.isArray(cached) ? cached.length : 1,
          cached: true,
          timestamp: Date.now(),
          database: 'cache'
        };
        
        this.recordQueryMetrics(metrics);
        return cached;
      }
    }
    
    // Execute query
    const { id, connection } = await this.connectionPool.getConnection();
    
    try {
      // Simulate query execution (in real implementation, use actual database driver)
      const result = await this.simulateQuery(query, params, options.timeout);
      
      const executionTime = performance.now() - startTime;
      
      // Cache result if applicable
      if (options.useCache !== false && this.isCacheable(query)) {
        this.cache.set(cacheKey, result, options.cacheTtl);
      }
      
      // Record metrics
      const metrics: QueryMetrics = {
        query: query.substring(0, 100),
        executionTime,
        rows: Array.isArray(result) ? result.length : 1,
        cached: false,
        timestamp: Date.now(),
        database: 'primary'
      };
      
      this.recordQueryMetrics(metrics);
      
      return result;
      
    } catch (error) {
      this.emit('query-error', { query, error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    } finally {
      this.connectionPool.releaseConnection(id);
    }
  }

  /**
   * Execute transaction with rollback support
   */
  async executeTransaction<T>(operations: Array<{ query: string; params: any[] }>): Promise<T[]> {
    const { id, connection } = await this.connectionPool.getConnection();
    const startTime = performance.now();
    
    try {
      // Begin transaction (simulated)
      const results: T[] = [];
      
      for (const op of operations) {
        const result = await this.simulateQuery(op.query, op.params);
        results.push(result);
      }
      
      // Commit transaction (simulated)
      const executionTime = performance.now() - startTime;
      
      // Record transaction metrics
      const metrics: QueryMetrics = {
        query: `TRANSACTION (${operations.length} operations)`,
        executionTime,
        rows: results.reduce((sum, r) => sum + (Array.isArray(r) ? r.length : 1), 0),
        cached: false,
        timestamp: Date.now(),
        database: 'primary'
      };
      
      this.recordQueryMetrics(metrics);
      
      return results;
      
    } catch (error) {
      // Rollback transaction (simulated)
      this.emit('transaction-rollback', { operations: operations.length, error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    } finally {
      this.connectionPool.releaseConnection(id);
    }
  }

  /**
   * Bulk operations with optimized performance
   */
  async executeBulkOperation(
    operation: 'insert' | 'update' | 'delete',
    table: string,
    data: any[],
    options: { batchSize?: number; parallel?: boolean } = {}
  ): Promise<number> {
    const batchSize = options.batchSize || 1000;
    const startTime = performance.now();
    let totalAffected = 0;
    
    // Process in batches
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      
      if (options.parallel && batch.length > 10) {
        // Parallel execution for large batches
        const promises = batch.map(item => this.executeSingleBulkOperation(operation, table, item));
        const results = await Promise.all(promises);
        totalAffected += results.reduce((sum, r) => sum + r, 0);
      } else {
        // Sequential execution
        for (const item of batch) {
          totalAffected += await this.executeSingleBulkOperation(operation, table, item);
        }
      }
    }
    
    const executionTime = performance.now() - startTime;
    
    // Record bulk operation metrics
    const metrics: QueryMetrics = {
      query: `BULK ${operation.toUpperCase()} ${table}`,
      executionTime,
      rows: totalAffected,
      cached: false,
      timestamp: Date.now(),
      database: 'primary'
    };
    
    this.recordQueryMetrics(metrics);
    
    return totalAffected;
  }

  private async executeSingleBulkOperation(operation: string, table: string, item: any): Promise<number> {
    // Simulate single bulk operation (in real implementation, use actual SQL)
    await new Promise(resolve => setTimeout(resolve, 1)); // Simulate work
    return 1; // Simulate affected rows
  }

  private async simulateQuery(query: string, params: any[] = [], timeout?: number): Promise<any> {
    // Simulate database execution time
    const executionTime = Math.random() * 50 + 10; // 10-60ms
    
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        if (query.toLowerCase().includes('select')) {
          resolve([{ id: 1, data: 'sample' }]); // Simulate SELECT result
        } else {
          resolve({ affectedRows: 1 }); // Simulate INSERT/UPDATE/DELETE result
        }
      }, executionTime);
      
      if (timeout) {
        setTimeout(() => {
          clearTimeout(timer);
          reject(new Error('Query timeout'));
        }, timeout);
      }
    });
  }

  private isCacheable(query: string): boolean {
    const lowerQuery = query.toLowerCase().trim();
    return lowerQuery.startsWith('select') && 
           !lowerQuery.includes('now()') && 
           !lowerQuery.includes('rand()') &&
           !lowerQuery.includes('uuid()');
  }

  private recordQueryMetrics(metrics: QueryMetrics): void {
    this.queryMetrics.push(metrics);
    
    // Keep only recent metrics
    if (this.queryMetrics.length > this.maxQueryMetrics) {
      this.queryMetrics = this.queryMetrics.slice(-this.maxQueryMetrics);
    }
    
    this.emit('query-metrics', metrics);
  }

  // Cache Management API
  cacheSet(key: string, value: any, ttl?: number): void {
    this.cache.set(key, value, ttl);
  }

  cacheGet(key: string): any {
    return this.cache.get(key);
  }

  cacheDelete(key: string): boolean {
    return this.cache.delete(key);
  }

  cacheClear(): void {
    this.cache.clear();
  }

  getCacheStats(): CacheStats {
    return this.cache.getStats();
  }

  // Connection Pool Management API
  getConnectionPoolStats(): ConnectionPoolStats {
    return this.connectionPool.getStats();
  }

  // Query Analytics API
  getQueryMetrics(filter?: {
    startTime?: number;
    endTime?: number;
    cached?: boolean;
    minExecutionTime?: number;
  }): QueryMetrics[] {
    let metrics = [...this.queryMetrics];
    
    if (filter) {
      if (filter.startTime) {
        metrics = metrics.filter(m => m.timestamp >= filter.startTime!);
      }
      if (filter.endTime) {
        metrics = metrics.filter(m => m.timestamp <= filter.endTime!);
      }
      if (filter.cached !== undefined) {
        metrics = metrics.filter(m => m.cached === filter.cached);
      }
      if (filter.minExecutionTime) {
        metrics = metrics.filter(m => m.executionTime >= filter.minExecutionTime!);
      }
    }
    
    return metrics.sort((a, b) => b.timestamp - a.timestamp);
  }

  // Health Check API
  getDataLayerHealth(): DataLayerHealth {
    const cacheStats = this.cache.getStats();
    const poolStats = this.connectionPool.getStats();
    
    const cacheStatus = cacheStats.hitRate > 70 ? 'healthy' : 
                       cacheStats.hitRate > 50 ? 'degraded' : 'unhealthy';
    
    const dbStatus = poolStats.avgResponseTime < 100 && poolStats.errors < 5 ? 'healthy' :
                     poolStats.avgResponseTime < 200 && poolStats.errors < 10 ? 'degraded' : 'unhealthy';
    
    const overall = (cacheStatus === 'healthy' && dbStatus === 'healthy') ? 'healthy' :
                   (cacheStatus === 'unhealthy' || dbStatus === 'unhealthy') ? 'unhealthy' : 'degraded';

    return {
      database: {
        status: dbStatus,
        connections: poolStats,
        avgQueryTime: poolStats.avgResponseTime
      },
      cache: {
        status: cacheStatus,
        stats: cacheStats,
        memoryUtilization: (cacheStats.memoryUsage / (100 * 1024 * 1024)) * 100 // Assuming 100MB max
      },
      overall
    };
  }

  // Cleanup
  async destroy(): Promise<void> {
    this.cache.clear();
    await this.connectionPool.destroy();
    this.queryMetrics = [];
    this.removeAllListeners();
  }
}

// Factory function for easy initialization
export function createDataLayerAPIs(dbConfig: DatabaseConfig, cacheConfig: CacheConfig): DataLayerAPIs {
  return DataLayerAPIs.getInstance(dbConfig, cacheConfig);
}

export default DataLayerAPIs; 