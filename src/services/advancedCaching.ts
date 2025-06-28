// Advanced Caching System for Production Performance
export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

export interface CacheMetrics {
  hits: number;
  misses: number;
  evictions: number;
  totalEntries: number;
  hitRate: number;
}

export class AdvancedCacheManager {
  private cache = new Map<string, CacheEntry>();
  private metrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    evictions: 0,
    totalEntries: 0,
    hitRate: 0
  };
  
  private maxSize = 1000;
  private defaultTTL = 300000; // 5 minutes
  
  async set<T>(key: string, data: T, ttl?: number): Promise<void> {
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }
    
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
      accessCount: 0,
      lastAccessed: Date.now()
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
    
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.metrics.misses++;
      this.updateMetrics();
      return null;
    }
    
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    
    this.metrics.hits++;
    this.updateMetrics();
    
    return entry.data as T;
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
  
  private updateMetrics(): void {
    this.metrics.totalEntries = this.cache.size;
    this.metrics.hitRate = this.metrics.hits + this.metrics.misses > 0 
      ? this.metrics.hits / (this.metrics.hits + this.metrics.misses) * 100
      : 0;
  }
  
  getMetrics(): CacheMetrics {
    return { ...this.metrics };
  }
  
  clear(): void {
    this.cache.clear();
    this.updateMetrics();
  }
}

export const globalCache = new AdvancedCacheManager(); 