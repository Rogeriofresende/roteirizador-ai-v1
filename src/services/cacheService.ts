/**
 * 🗄️ ADVANCED CACHE SERVICE
 * Professional multi-tier caching system with performance optimization
 */

import { logger } from '../utils/logger';
import { performanceService } from './performance';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number; // time to live in milliseconds
  version: string;
  accessCount: number;
  lastAccessed: number;
  size: number; // estimated size in bytes
  priority: CachePriority;
  tags: string[];
}

type CachePriority = 'high' | 'medium' | 'low';
type CacheStrategy = 'memory' | 'localStorage' | 'indexedDB' | 'serviceWorker';

interface CacheConfig {
  strategy: CacheStrategy[];
  ttl: number;
  maxSize: number;
  priority: CachePriority;
  tags?: string[];
  version?: string;
  compression?: boolean;
}

interface CacheStats {
  memoryUsage: number;
  localStorageUsage: number;
  indexedDBUsage: number;
  hitRate: number;
  totalHits: number;
  totalMisses: number;
  entriesCount: number;
  oldestEntry: number;
  newestEntry: number;
}

// =============================================================================
// CACHE LAYERS
// =============================================================================

/**
 * Memory Cache Layer - Fastest access
 */
class MemoryCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize = 50 * 1024 * 1024; // 50MB
  private currentSize = 0;

  set<T>(key: string, entry: CacheEntry<T>): boolean {
    try {
      // Check if we need to evict entries
      if (this.currentSize + entry.size > this.maxSize) {
        this.evictLRU(entry.size);
      }

      this.cache.set(key, entry);
      this.currentSize += entry.size;
      
      logger.debug('Memory cache set', { key, size: entry.size }, 'CACHE');
      return true;
    } catch (error: unknown) {
      logger.error('Memory cache set failed', { key, error }, 'CACHE');
      return false;
    }
  }

  get<T>(key: string): CacheEntry<T> | null {
    const entry = this.cache.get(key) as CacheEntry<T>;
    
    if (!entry) return null;
    
    // Check TTL
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.delete(key);
      return null;
    }

    // Update access stats
    entry.accessCount++;
    entry.lastAccessed = Date.now();

    return entry;
  }

  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (entry) {
      this.currentSize -= entry.size;
      return this.cache.delete(key);
    }
    return false;
  }

  clear(): void {
    this.cache.clear();
    this.currentSize = 0;
  }

  size(): number {
    return this.cache.size;
  }

  getUsage(): number {
    return this.currentSize;
  }

  private evictLRU(neededSpace: number): void {
    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed);

    let freedSpace = 0;
    for (const [key, entry] of entries) {
      if (freedSpace >= neededSpace) break;
      
      this.delete(key);
      freedSpace += entry.size;
      
      logger.debug('Memory cache LRU eviction', { key, size: entry.size }, 'CACHE');
    }
  }
}

/**
 * LocalStorage Cache Layer - Persistent, synchronous
 */
class LocalStorageCache {
  private prefix = 'roteiropro_cache_';
  private maxSize = 10 * 1024 * 1024; // 10MB

  set<T>(key: string, entry: CacheEntry<T>): boolean {
    try {
      const serialized = JSON.stringify(entry);
      
      // Check size limits
      if (this.getCurrentUsage() + serialized.length > this.maxSize) {
        this.evictOldest();
      }

      localStorage.setItem(this.prefix + key, serialized);
      
      logger.debug('LocalStorage cache set', { key, size: serialized.length }, 'CACHE');
      return true;
    } catch (error: unknown) {
      logger.error('LocalStorage cache set failed', { key, error }, 'CACHE');
      return false;
    }
  }

  get<T>(key: string): CacheEntry<T> | null {
    try {
      const serialized = localStorage.getItem(this.prefix + key);
      if (!serialized) return null;

      const entry: CacheEntry<T> = JSON.parse(serialized);
      
      // Check TTL
      if (Date.now() - entry.timestamp > entry.ttl) {
        this.delete(key);
        return null;
      }

      // Update access stats
      entry.accessCount++;
      entry.lastAccessed = Date.now();
      this.set(key, entry); // Update with new stats

      return entry;
    } catch (error: unknown) {
      logger.error('LocalStorage cache get failed', { key, error }, 'CACHE');
      return null;
    }
  }

  delete(key: string): boolean {
    localStorage.removeItem(this.prefix + key);
    return true;
  }

  clear(): void {
    const keys = Object.keys(localStorage).filter(key => key.startsWith(this.prefix));
    keys.forEach(key => localStorage.removeItem(key));
  }

  getCurrentUsage(): number {
    const keys = Object.keys(localStorage).filter(key => key.startsWith(this.prefix));
    return keys.reduce((total, key) => {
      return total + (localStorage.getItem(key)?.length || 0);
    }, 0);
  }

  private evictOldest(): void {
    const entries: Array<[string, CacheEntry]> = [];
    
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(this.prefix)) {
        try {
          const entry = JSON.parse(localStorage.getItem(key) || '{}');
          entries.push([key.replace(this.prefix, ''), entry]);
        } catch {
          // Remove invalid entries
          localStorage.removeItem(key);
        }
      }
    }

    // Sort by timestamp and remove oldest
    entries.sort(([, a], [, b]) => a.timestamp - b.timestamp);
    
    const toRemove = Math.ceil(entries.length * 0.2); // Remove 20%
    for (let i = 0; i < toRemove; i++) {
      this.delete(entries[i][0]);
    }
  }
}

/**
 * IndexedDB Cache Layer - Large data, asynchronous
 */
class IndexedDBCache {
  private dbName = 'RoteiroPro_Cache';
  private version = 1;
  private storeName = 'cache_entries';
  private db: IDBDatabase | null = null;

  async initialize(): Promise<boolean> {
    try {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(this.dbName, this.version);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          this.db = request.result;
          resolve(true);
        };
        
        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          
          if (!db.objectStoreNames.contains(this.storeName)) {
            const store = db.createObjectStore(this.storeName, { keyPath: 'key' });
            store.createIndex('timestamp', 'timestamp');
            store.createIndex('lastAccessed', 'lastAccessed');
            store.createIndex('priority', 'priority');
          }
        };
      });
    } catch (error: unknown) {
      logger.error('IndexedDB initialization failed', { error }, 'CACHE');
      return false;
    }
  }

  async set<T>(key: string, entry: CacheEntry<T>): Promise<boolean> {
    if (!this.db) return false;

    try {
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        
        const request = store.put({ key, ...entry });
        
        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
      });
    } catch (error: unknown) {
      logger.error('IndexedDB cache set failed', { key, error }, 'CACHE');
      return false;
    }
  }

  async get<T>(key: string): Promise<CacheEntry<T> | null> {
    if (!this.db) return null;

    try {
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        
        const request = store.get(key);
        
        request.onsuccess = () => {
          const result = request.result;
          if (!result) {
            resolve(null);
            return;
          }

          // Check TTL
          if (Date.now() - result.timestamp > result.ttl) {
            this.delete(key);
            resolve(null);
            return;
          }

          // Update access stats
          result.accessCount++;
          result.lastAccessed = Date.now();
          this.set(key, result);

          resolve(result);
        };
        
        request.onerror = () => reject(request.error);
      });
    } catch (error: unknown) {
      logger.error('IndexedDB cache get failed', { key, error }, 'CACHE');
      return null;
    }
  }

  async delete(key: string): Promise<boolean> {
    if (!this.db) return false;

    try {
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        
        const request = store.delete(key);
        
        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
      });
    } catch (error: unknown) {
      logger.error('IndexedDB cache delete failed', { key, error }, 'CACHE');
      return false;
    }
  }

  async clear(): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    store.clear();
  }
}

// =============================================================================
// MAIN CACHE SERVICE
// =============================================================================

export class AdvancedCacheService {
  private memoryCache = new MemoryCache();
  private localStorageCache = new LocalStorageCache();
  private indexedDBCache = new IndexedDBCache();
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    evictions: 0
  };

  private defaultConfig: CacheConfig = {
    strategy: ['memory', 'localStorage'],
    ttl: 5 * 60 * 1000, // 5 minutes
    maxSize: 1024 * 1024, // 1MB
    priority: 'medium'
  };

  async initialize(): Promise<boolean> {
    try {
      const indexedDBReady = await this.indexedDBCache.initialize();
      
      logger.info('Cache service initialized', {
        memoryCache: true,
        localStorage: true,
        indexedDB: indexedDBReady
      }, 'CACHE');

      return true;
    } catch (error: unknown) {
      logger.error('Cache service initialization failed', { error }, 'CACHE');
      return false;
    }
  }

  /**
   * Set data in cache with multiple strategies
   */
  async set<T>(key: string, data: T, config: Partial<CacheConfig> = {}): Promise<boolean> {
    const mergedConfig = { ...this.defaultConfig, ...config };
    const startTime = performance.now();

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: mergedConfig.ttl,
      version: mergedConfig.version || '1.0.0',
      accessCount: 0,
      lastAccessed: Date.now(),
      size: this.estimateSize(data),
      priority: mergedConfig.priority,
      tags: mergedConfig.tags || []
    };

    let success = false;

    // Try each cache strategy
    for (const strategy of mergedConfig.strategy) {
      try {
        switch (strategy) {
          case 'memory':
            success = this.memoryCache.set(key, entry) || success;
            break;
          case 'localStorage':
            success = this.localStorageCache.set(key, entry) || success;
            break;
          case 'indexedDB':
            success = (await this.indexedDBCache.set(key, entry)) || success;
            break;
        }
      } catch (error: unknown) {
        logger.warn(`Cache strategy ${strategy} failed`, { key, error }, 'CACHE');
      }
    }

    this.stats.sets++;
    
    const duration = performance.now() - startTime;
    performanceService.recordMetric('cache_set', duration, 'ms', 'cache', {
      key,
      strategies: mergedConfig.strategy,
      size: entry.size,
      success
    });

    logger.debug('Cache set completed', {
      key,
      strategies: mergedConfig.strategy,
      success,
      duration: `${duration.toFixed(2)}ms`
    }, 'CACHE');

    return success;
  }

  /**
   * Get data from cache with fallback strategies
   */
  async get<T>(key: string): Promise<T | null> {
    const startTime = performance.now();
    
    // Try memory cache first (fastest)
    let entry = this.memoryCache.get<T>(key);
    if (entry) {
      this.stats.hits++;
      this.recordCacheHit('memory', startTime);
      return entry.data;
    }

    // Try localStorage
    entry = this.localStorageCache.get<T>(key);
    if (entry) {
      // Promote to memory cache
      this.memoryCache.set(key, entry);
      
      this.stats.hits++;
      this.recordCacheHit('localStorage', startTime);
      return entry.data;
    }

    // Try IndexedDB
    entry = await this.indexedDBCache.get<T>(key);
    if (entry) {
      // Promote to faster caches
      this.memoryCache.set(key, entry);
      this.localStorageCache.set(key, entry);
      
      this.stats.hits++;
      this.recordCacheHit('indexedDB', startTime);
      return entry.data;
    }

    this.stats.misses++;
    
    const duration = performance.now() - startTime;
    performanceService.recordMetric('cache_miss', duration, 'ms', 'cache', { key });

    logger.debug('Cache miss', { key, duration: `${duration.toFixed(2)}ms` }, 'CACHE');
    
    return null;
  }

  /**
   * Delete from all cache layers
   */
  async delete(key: string): Promise<boolean> {
    const results = await Promise.all([
      Promise.resolve(this.memoryCache.delete(key)),
      Promise.resolve(this.localStorageCache.delete(key)),
      this.indexedDBCache.delete(key)
    ]);

    this.stats.deletes++;
    
    const success = results.some(result => result);
    logger.debug('Cache delete', { key, success }, 'CACHE');
    
    return success;
  }

  /**
   * Clear all caches
   */
  async clear(): Promise<void> {
    await Promise.all([
      Promise.resolve(this.memoryCache.clear()),
      Promise.resolve(this.localStorageCache.clear()),
      this.indexedDBCache.clear()
    ]);

    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0
    };

    logger.info('All caches cleared', {}, 'CACHE');
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const hitRate = this.stats.hits + this.stats.misses > 0 
      ? (this.stats.hits / (this.stats.hits + this.stats.misses)) * 100 
      : 0;

    return {
      memoryUsage: this.memoryCache.getUsage(),
      localStorageUsage: this.localStorageCache.getCurrentUsage(),
      indexedDBUsage: 0, // Would need separate calculation
      hitRate,
      totalHits: this.stats.hits,
      totalMisses: this.stats.misses,
      entriesCount: this.memoryCache.size(),
      oldestEntry: 0, // Would need separate calculation
      newestEntry: Date.now()
    };
  }

  /**
   * Advanced cache operations
   */
  async getOrSet<T>(
    key: string, 
    fetchFn: () => Promise<T>, 
    config: Partial<CacheConfig> = {}
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Cache miss - fetch data
    logger.debug('Cache miss - fetching data', { key }, 'CACHE');
    
    const startTime = performance.now();
    const data = await fetchFn();
    const fetchDuration = performance.now() - startTime;

    // Cache the result
    await this.set(key, data, config);

    performanceService.recordMetric('cache_fetch', fetchDuration, 'ms', 'cache', {
      key,
      dataSize: this.estimateSize(data)
    });

    return data;
  }

  /**
   * Tag-based cache invalidation
   */
  async invalidateByTag(tag: string): Promise<void> {
    // This would require more complex implementation
    // For now, we'll implement a simple version
    logger.info('Tag-based invalidation requested', { tag }, 'CACHE');
    
    // In a full implementation, we'd iterate through all entries
    // and remove those matching the tag
  }

  // =============================================================================
  // PRIVATE HELPERS
  // =============================================================================

  private estimateSize(data: any): number {
    try {
      return JSON.stringify(data).length * 2; // Rough estimate (2 bytes per char)
    } catch {
      return 1024; // Default 1KB if can't stringify
    }
  }

  private recordCacheHit(strategy: string, startTime: number): void {
    const duration = performance.now() - startTime;
    performanceService.recordMetric('cache_hit', duration, 'ms', 'cache', { strategy });
  }
}

// =============================================================================
// CACHE UTILITIES
// =============================================================================

/**
 * Cache decorator for methods
 */
export function Cached(config: Partial<CacheConfig> = {}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: unknown[]) {
      const cacheKey = `${target.constructor.name}_${propertyKey}_${JSON.stringify(args)}`;
      
      return cacheService.getOrSet(
        cacheKey,
        () => originalMethod.apply(this, args),
        config
      );
    };
  };
}

/**
 * Global cache service instance
 */
export const cacheService = new AdvancedCacheService();

// Auto-initialize
cacheService.initialize().catch(error => {
  logger.error('Failed to initialize cache service', { error }, 'CACHE');
});

export default cacheService; 