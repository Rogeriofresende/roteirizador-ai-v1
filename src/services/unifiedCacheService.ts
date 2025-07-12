/**
 * 🗄️ UNIFIED CACHE SERVICE V6.4
 * Week 2 Consolidation: Unified multi-tier caching system
 * Consolidates: cacheService.ts + infrastructure/advancedCaching.ts
 */

import { logger } from '../utils/logger';
import { performanceService } from './performance';
import { IStorageService, StorageItem, CacheConfig } from './interfaces/IStorageService';

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

interface CacheMetrics {
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

interface UnifiedCacheConfig extends CacheConfig {
  strategy: CacheStrategy[];
  ttl: number;
  maxSize: number;
  priority: CachePriority;
  tags?: string[];
  version?: string;
  compression?: boolean;
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
      
      logger.debug('Memory cache set', { key, size: entry.size });
      return true;
    } catch (error: unknown) {
      logger.error('Memory cache set failed', { key, error });
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

  getEntries(): IterableIterator<[string, CacheEntry]> {
    return this.cache.entries();
  }

  invalidateByTag(tag: string): number {
    let invalidated = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.includes(tag)) {
        this.delete(key);
        invalidated++;
      }
    }
    return invalidated;
  }

  private evictLRU(neededSpace: number): void {
    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed);

    let freedSpace = 0;
    for (const [key, entry] of entries) {
      if (freedSpace >= neededSpace) break;
      
      this.delete(key);
      freedSpace += entry.size;
      
      logger.debug('Memory cache LRU eviction', { key, size: entry.size });
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
      
      logger.debug('LocalStorage cache set', { key, size: serialized.length });
      return true;
    } catch (error: unknown) {
      logger.error('LocalStorage cache set failed', { key, error });
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
      logger.error('LocalStorage cache get failed', { key, error });
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

  invalidateByTag(tag: string): number {
    let invalidated = 0;
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(this.prefix)) {
        try {
          const entry = JSON.parse(localStorage.getItem(key) || '{}');
          if (entry.tags && entry.tags.includes(tag)) {
            localStorage.removeItem(key);
            invalidated++;
          }
        } catch {
          // Remove invalid entries
          localStorage.removeItem(key);
        }
      }
    }
    return invalidated;
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
            store.createIndex('tags', 'tags', { multiEntry: true });
          }
        };
      });
    } catch (error: unknown) {
      logger.error('IndexedDB initialization failed', { error });
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
      logger.error('IndexedDB cache set failed', { key, error });
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
      logger.error('IndexedDB cache get failed', { key, error });
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
      logger.error('IndexedDB cache delete failed', { key, error });
      return false;
    }
  }

  async clear(): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    store.clear();
  }

  async invalidateByTag(tag: string): Promise<number> {
    if (!this.db) return 0;

    try {
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const index = store.index('tags');
        
        const request = index.getAll(tag);
        
        request.onsuccess = async () => {
          const entries = request.result;
          let deleted = 0;
          
          for (const entry of entries) {
            await this.delete(entry.key);
            deleted++;
          }
          
          resolve(deleted);
        };
        
        request.onerror = () => reject(request.error);
      });
    } catch (error: unknown) {
      logger.error('IndexedDB invalidateByTag failed', { tag, error });
      return 0;
    }
  }
}

/**
 * API Response Cache - Specialized cache for API responses
 */
class APIResponseCache {
  private cache = new Map<string, CacheEntry>();
  private defaultTTL = 600000; // 10 minutes for API responses

  generateAPIKey(endpoint: string, params: Record<string, unknown>): string {
    const paramString = JSON.stringify(params, Object.keys(params).sort());
    return `api:${endpoint}:${btoa(paramString)}`;
  }

  async cacheAPIResponse<T>(
    endpoint: string,
    params: Record<string, unknown>,
    data: T,
    ttl = this.defaultTTL
  ): Promise<void> {
    const key = this.generateAPIKey(endpoint, params);
    const tags = ['api', endpoint.split('/')[1]]; // Tag by endpoint type

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      version: '1.0.0',
      accessCount: 0,
      lastAccessed: Date.now(),
      size: this.estimateSize(data),
      priority: 'medium',
      tags
    });
  }

  async getAPIResponse<T>(
    endpoint: string,
    params: Record<string, unknown>
  ): Promise<T | null> {
    const key = this.generateAPIKey(endpoint, params);
    const entry = this.cache.get(key);

    if (!entry) return null;

    // Check TTL
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    entry.accessCount++;
    entry.lastAccessed = Date.now();

    return entry.data as T;
  }

  invalidateAPIEndpoint(endpoint: string): number {
    let invalidated = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.includes(endpoint.split('/')[1])) {
        this.cache.delete(key);
        invalidated++;
      }
    }
    return invalidated;
  }

  private estimateSize(data: any): number {
    return JSON.stringify(data).length * 2; // Rough estimate
  }
}

// =============================================================================
// UNIFIED CACHE SERVICE
// =============================================================================

export class UnifiedCacheService implements IStorageService {
  private memoryCache = new MemoryCache();
  private localStorageCache = new LocalStorageCache();
  private indexedDBCache = new IndexedDBCache();
  private apiCache = new APIResponseCache();
  
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    evictions: 0
  };

  private defaultConfig: UnifiedCacheConfig = {
    strategy: ['memory', 'localStorage'],
    ttl: 5 * 60 * 1000, // 5 minutes
    maxSize: 1024 * 1024, // 1MB
    priority: 'medium'
  };

  // =============================================================================
  // IStorageService IMPLEMENTATION
  // =============================================================================

  async initialize(): Promise<boolean> {
    try {
      const indexedDBReady = await this.indexedDBCache.initialize();
      
      logger.info('Unified Cache Service initialized', {
        memoryCache: true,
        localStorage: true,
        indexedDB: indexedDBReady,
        apiCache: true
      });

      return true;
    } catch (error: unknown) {
      logger.error('Unified Cache Service initialization failed', { error });
      return false;
    }
  }

  async dispose(): Promise<void> {
    await this.clear();
    logger.info('Unified Cache Service disposed');
  }

  async getHealth() {
    return {
      status: 'healthy' as const,
      lastCheck: new Date(),
      details: {
        stats: this.getStats(),
        memoryUsage: this.memoryCache.getUsage(),
        localStorageUsage: this.localStorageCache.getCurrentUsage(),
        entriesCount: this.memoryCache.size()
      }
    };
  }

  getServiceName(): string {
    return 'UnifiedCacheService';
  }

  async set<T>(key: string, item: StorageItem<T>): Promise<boolean> {
    const config = { ...this.defaultConfig, ...item.config };
    const startTime = performance.now();

    const entry: CacheEntry<T> = {
      data: item.data,
      timestamp: Date.now(),
      ttl: config.ttl,
      version: item.version || '1.0.0',
      accessCount: 0,
      lastAccessed: Date.now(),
      size: this.estimateSize(item.data),
      priority: config.priority,
      tags: config.tags || []
    };

    let success = false;

    // Try each cache strategy
    for (const strategy of config.strategy) {
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
        logger.warn(`Cache strategy ${strategy} failed`, { key, error });
      }
    }

    this.stats.sets++;
    
    const duration = performance.now() - startTime;
    performanceService.recordMetric('cache_set', duration, 'ms', 'cache', {
      key,
      strategies: config.strategy,
      size: entry.size,
      success
    });

    return success;
  }

  async get<T>(key: string): Promise<StorageItem<T> | null> {
    const startTime = performance.now();
    
    // Try memory cache first (fastest)
    let entry = this.memoryCache.get<T>(key);
    if (entry) {
      this.stats.hits++;
      this.recordCacheHit('memory', startTime);
      return {
        data: entry.data,
        version: entry.version,
        createdAt: new Date(entry.timestamp),
        updatedAt: new Date(entry.lastAccessed)
      };
    }

    // Try localStorage
    entry = this.localStorageCache.get<T>(key);
    if (entry) {
      // Promote to memory cache
      this.memoryCache.set(key, entry);
      
      this.stats.hits++;
      this.recordCacheHit('localStorage', startTime);
      return {
        data: entry.data,
        version: entry.version,
        createdAt: new Date(entry.timestamp),
        updatedAt: new Date(entry.lastAccessed)
      };
    }

    // Try IndexedDB
    entry = await this.indexedDBCache.get<T>(key);
    if (entry) {
      // Promote to faster caches
      this.memoryCache.set(key, entry);
      this.localStorageCache.set(key, entry);
      
      this.stats.hits++;
      this.recordCacheHit('indexedDB', startTime);
      return {
        data: entry.data,
        version: entry.version,
        createdAt: new Date(entry.timestamp),
        updatedAt: new Date(entry.lastAccessed)
      };
    }

    this.stats.misses++;
    
    const duration = performance.now() - startTime;
    performanceService.recordMetric('cache_miss', duration, 'ms', 'cache', { key });

    return null;
  }

  async delete(key: string): Promise<boolean> {
    const results = await Promise.allSettled([
      this.memoryCache.delete(key),
      this.localStorageCache.delete(key),
      this.indexedDBCache.delete(key)
    ]);

    this.stats.deletes++;
    
    return results.some(result => result.status === 'fulfilled' && result.value);
  }

  async query<T>(query: any): Promise<T[]> {
    // Implementation for query functionality
    // This would typically search across cache entries based on criteria
    logger.warn('Query not yet implemented for cache service');
    return [];
  }

  async count(query: any): Promise<number> {
    // Implementation for count functionality
    return 0;
  }

  async invalidateByTag(tag: string): Promise<number> {
    const results = await Promise.allSettled([
      this.memoryCache.invalidateByTag(tag),
      this.localStorageCache.invalidateByTag(tag),
      this.indexedDBCache.invalidateByTag(tag)
    ]);

    return results.reduce((total, result) => {
      return total + (result.status === 'fulfilled' ? result.value : 0);
    }, 0);
  }

  async getStorageMetrics() {
    return {
      totalItems: this.memoryCache.size(),
      totalSize: this.memoryCache.getUsage() + this.localStorageCache.getCurrentUsage(),
      availableSpace: 50 * 1024 * 1024, // 50MB
      lastCleanup: new Date(),
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) * 100
    };
  }

  // =============================================================================
  // UNIFIED CACHE METHODS
  // =============================================================================

  async clear(): Promise<void> {
    await Promise.allSettled([
      this.memoryCache.clear(),
      this.localStorageCache.clear(),
      this.indexedDBCache.clear()
    ]);

    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0
    };

    logger.info('All cache layers cleared');
  }

  getStats(): CacheMetrics {
    return {
      memoryUsage: this.memoryCache.getUsage(),
      localStorageUsage: this.localStorageCache.getCurrentUsage(),
      indexedDBUsage: 0, // Would need to be calculated
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) * 100,
      totalHits: this.stats.hits,
      totalMisses: this.stats.misses,
      entriesCount: this.memoryCache.size(),
      oldestEntry: 0, // Would need to be calculated
      newestEntry: Date.now()
    };
  }

  async getOrSet<T>(
    key: string, 
    fetchFn: () => Promise<T>, 
    config: Partial<UnifiedCacheConfig> = {}
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached) {
      return cached.data;
    }

    // Fetch fresh data
    const data = await fetchFn();
    
    // Store in cache
    await this.set(key, {
      data,
      version: '1.0.0',
      createdAt: new Date(),
      updatedAt: new Date(),
      config
    });

    return data;
  }

  // API Cache specific methods
  async cacheAPIResponse<T>(
    endpoint: string,
    params: Record<string, unknown>,
    data: T,
    ttl?: number
  ): Promise<void> {
    return this.apiCache.cacheAPIResponse(endpoint, params, data, ttl);
  }

  async getAPIResponse<T>(
    endpoint: string,
    params: Record<string, unknown>
  ): Promise<T | null> {
    return this.apiCache.getAPIResponse<T>(endpoint, params);
  }

  invalidateAPIEndpoint(endpoint: string): number {
    return this.apiCache.invalidateAPIEndpoint(endpoint);
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  private estimateSize(data: any): number {
    try {
      return JSON.stringify(data).length * 2; // Rough estimate
    } catch {
      return 1024; // Default size if can't stringify
    }
  }

  private recordCacheHit(strategy: string, startTime: number): void {
    const duration = performance.now() - startTime;
    performanceService.recordMetric('cache_hit', duration, 'ms', 'cache', {
      strategy,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) * 100
    });

    logger.debug('Cache hit', {
      strategy,
      duration: `${duration.toFixed(2)}ms`,
      hitRate: `${(this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(1)}%`
    });
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

// Global service instance
export const unifiedCacheService = new UnifiedCacheService();

// Convenience exports for backward compatibility
export const cacheService = unifiedCacheService;
export const advancedCacheManager = unifiedCacheService; // Alias for infrastructure usage

// Cache decorator function
export function Cached(config: Partial<UnifiedCacheConfig> = {}) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${target.constructor.name}.${propertyName}:${JSON.stringify(args)}`;
      
      return unifiedCacheService.getOrSet(
        cacheKey,
        () => method.apply(this, args),
        config
      );
    };

    return descriptor;
  };
} 