// Advanced Caching System for Production Performance
// Multi-layer caching with intelligent invalidation

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
  tags: string[];
}

export interface CacheConfig {
  maxSize: number;
  defaultTTL: number;
  enableCompression: boolean;
  enableMetrics: boolean;
}

export interface CacheMetrics {
  hits: number;
  misses: number;
  evictions: number;
  totalEntries: number;
  hitRate: number;
  memoryUsage: number;
}

export class AdvancedCacheManager {
  private cache = new Map<string, CacheEntry>();
  private metrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    evictions: 0,
    totalEntries: 0,
    hitRate: 0,
    memoryUsage: 0
  };
  
  private config: CacheConfig = {
    maxSize: 1000,
    defaultTTL: 300000, // 5 minutes
    enableCompression: true,
    enableMetrics: true
  };
  
  constructor(config?: Partial<CacheConfig>) {
    this.config = { ...this.config, ...config };
    this.startCleanupTask();
  }
  
  async set<T>(
    key: string, 
    data: T, 
    ttl?: number, 
    tags: string[] = []
  ): Promise<void> {
    // Check cache size and evict if necessary
    if (this.cache.size >= this.config.maxSize) {
      this.evictLRU();
    }
    
    const processedData = this.config.enableCompression 
      ? await this.compress(data)
      : data;
    
    const entry: CacheEntry<T> = {
      data: processedData,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL,
      accessCount: 0,
      lastAccessed: Date.now(),
      tags
    };
    
    this.cache.set(key, entry);
    this.updateMetrics();
  }
  
  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.metrics.misses++;
      this.updateMetrics();
      return null;
    }
    
    // Check if entry has expired
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.metrics.misses++;
      this.updateMetrics();
      return null;
    }
    
    // Update access tracking
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    
    this.metrics.hits++;
    this.updateMetrics();
    
    // Decompress if needed
    const data = this.config.enableCompression 
      ? await this.decompress(entry.data)
      : entry.data;
    
    return data as T;
  }
  
  invalidateByTag(tag: string): number {
    let invalidated = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.includes(tag)) {
        this.cache.delete(key);
        invalidated++;
      }
    }
    
    this.updateMetrics();
    return invalidated;
  }
  
  invalidateByPattern(pattern: RegExp): number {
    let invalidated = 0;
    
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
        invalidated++;
      }
    }
    
    this.updateMetrics();
    return invalidated;
  }
  
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.updateMetrics();
    }
    return deleted;
  }
  
  clear(): void {
    this.cache.clear();
    this.metrics.evictions += this.metrics.totalEntries;
    this.updateMetrics();
  }
  
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }
  
  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.metrics.evictions++;
    }
  }
  
  private startCleanupTask(): void {
    setInterval(() => {
      this.cleanupExpiredEntries();
    }, 60000); // Cleanup every minute
  }
  
  private cleanupExpiredEntries(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        expiredKeys.push(key);
      }
    }
    
    expiredKeys.forEach(key => {
      this.cache.delete(key);
      this.metrics.evictions++;
    });
    
    if (expiredKeys.length > 0) {
      this.updateMetrics();
    }
  }
  
  private updateMetrics(): void {
    if (!this.config.enableMetrics) return;
    
    this.metrics.totalEntries = this.cache.size;
    this.metrics.hitRate = this.metrics.hits + this.metrics.misses > 0 
      ? this.metrics.hits / (this.metrics.hits + this.metrics.misses) * 100
      : 0;
    
    // Estimate memory usage
    this.metrics.memoryUsage = this.estimateMemoryUsage();
  }
  
  private estimateMemoryUsage(): number {
    let totalSize = 0;
    
    for (const entry of this.cache.values()) {
      // Rough estimation - each entry ~1KB plus data size
      totalSize += 1024 + JSON.stringify(entry.data).length * 2;
    }
    
    return totalSize;
  }
  
  private async compress<T>(data: T): Promise<T> {
    // Simplified compression - in production, use actual compression
    if (typeof data === 'string' && data.length > 1000) {
      try {
        // Browser compression would use CompressionStream
        return data as T;
      } catch {
        return data;
      }
    }
    return data;
  }
  
  private async decompress<T>(data: T): Promise<T> {
    // Simplified decompression
    return data;
  }
  
  getMetrics(): CacheMetrics {
    return { ...this.metrics };
  }
  
  getStatistics(): Record<string, any> {
    const entries = Array.from(this.cache.values());
    const now = Date.now();
    
    return {
      metrics: this.getMetrics(),
      config: this.config,
      entries: {
        total: entries.length,
        expired: entries.filter(e => this.isExpired(e)).length,
        mostAccessed: entries
          .sort((a, b) => b.accessCount - a.accessCount)
          .slice(0, 5)
          .map(e => ({ accessCount: e.accessCount, tags: e.tags })),
        oldestEntry: entries.length > 0 
          ? Math.min(...entries.map(e => now - e.timestamp))
          : 0
      }
    };
  }
  
  exportCache(): string {
    return JSON.stringify({
      timestamp: Date.now(),
      entries: Array.from(this.cache.entries()),
      metrics: this.metrics,
      config: this.config
    }, null, 2);
  }
}

// Specialized cache for API responses
export class APIResponseCache extends AdvancedCacheManager {
  constructor() {
    super({
      maxSize: 500,
      defaultTTL: 600000, // 10 minutes for API responses
      enableCompression: true,
      enableMetrics: true
    });
  }
  
  async cacheAPIResponse(
    endpoint: string,
    params: Record<string, any>,
    response: any,
    customTTL?: number
  ): Promise<void> {
    const key = this.generateAPIKey(endpoint, params);
    const tags = ['api', endpoint.split('/')[1]]; // Tag by endpoint type
    
    await this.set(key, response, customTTL, tags);
  }
  
  async getAPIResponse<T>(
    endpoint: string,
    params: Record<string, any>
  ): Promise<T | null> {
    const key = this.generateAPIKey(endpoint, params);
    return await this.get<T>(key);
  }
  
  invalidateAPIEndpoint(endpoint: string): number {
    const pattern = new RegExp(`^${endpoint.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);
    return this.invalidateByPattern(pattern);
  }
  
  private generateAPIKey(endpoint: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {} as Record<string, any>);
    
    return `${endpoint}:${JSON.stringify(sortedParams)}`;
  }
}

// Global cache instances
export const globalCache = new AdvancedCacheManager({
  maxSize: 2000,
  defaultTTL: 300000, // 5 minutes
  enableCompression: true,
  enableMetrics: true
});

export const apiCache = new APIResponseCache();

// Cache statistics endpoint
export const getCacheStatistics = () => ({
  global: globalCache.getStatistics(),
  api: apiCache.getStatistics()
});

// Production monitoring integration
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  // Expose cache metrics to performance monitoring
  setInterval(() => {
    const stats = getCacheStatistics();
    
    // Send to performance monitoring
    if ('performanceMonitor' in window) {
      (window as any).performanceMonitor?.recordMetric('Cache Hit Rate', stats.global.metrics.hitRate);
      (window as any).performanceMonitor?.recordMetric('Cache Memory Usage', stats.global.metrics.memoryUsage / 1024 / 1024); // MB
    }
  }, 30000); // Every 30 seconds
} 