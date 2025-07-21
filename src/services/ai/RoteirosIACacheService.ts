/**
 * 🧠 SISTEMA DE CACHE INTELIGENTE - ROTEIROS IA V9.0
 * 
 * Cache avançado para otimizar custos e performance da API Gemini
 * Inclui cache de respostas, rate limiting e fallbacks
 * 
 * @methodology V9.0_NATURAL_LANGUAGE_FIRST
 * @specification ROIA-GR-001
 */

import { logger } from '../../utils/logger';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
  size: number;
  hash: string;
}

interface CacheConfig {
  maxSize: number;
  defaultTTL: number;
  maxMemoryMB: number;
  compressionEnabled: boolean;
  persistToStorage: boolean;
}

interface CacheStats {
  hits: number;
  misses: number;
  entries: number;
  totalSize: number;
  hitRate: number;
  memoryUsage: number;
  oldestEntry: number;
  newestEntry: number;
}

interface PromptCacheKey {
  type: 'structure' | 'characters' | 'scenes' | 'dialogue' | 'directions';
  config: {
    genre: string;
    audience: string;
    duration: string;
    format: string;
    tone: string;
  };
  contentHash?: string;
}

// ============================================================================
// CACHE UTILITIES
// ============================================================================

class CacheUtils {
  static hashObject(obj: any): string {
    const str = JSON.stringify(obj, Object.keys(obj).sort());
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  static calculateSize(data: any): number {
    const str = JSON.stringify(data);
    return new Blob([str]).size;
  }

  static compressData(data: any): string {
    // Simple compression using JSON.stringify optimization
    return JSON.stringify(data);
  }

  static decompressData(compressed: string): any {
    return JSON.parse(compressed);
  }

  static isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }
}

// ============================================================================
// INTELLIGENT CACHE MANAGER
// ============================================================================

export class RoteirosIACacheService {
  private cache = new Map<string, CacheEntry>();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    entries: 0,
    totalSize: 0,
    hitRate: 0,
    memoryUsage: 0,
    oldestEntry: 0,
    newestEntry: 0
  };

  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 1000,
      defaultTTL: 24 * 60 * 60 * 1000, // 24 hours
      maxMemoryMB: 50,
      compressionEnabled: true,
      persistToStorage: true,
      ...config
    };

    this.loadFromStorage();
    this.startMaintenanceTasks();
  }

  // ============================================================================
  // CORE CACHE OPERATIONS
  // ============================================================================

  set<T>(key: string, data: T, ttl?: number): boolean {
    try {
      const hash = CacheUtils.hashObject({ key, data });
      const size = CacheUtils.calculateSize(data);
      const now = Date.now();

      // Check memory limits
      if (this.stats.totalSize + size > this.config.maxMemoryMB * 1024 * 1024) {
        this.evictLRU();
      }

      // Check entry limits
      if (this.cache.size >= this.config.maxSize) {
        this.evictLRU();
      }

      const entry: CacheEntry<T> = {
        data: this.config.compressionEnabled ? CacheUtils.compressData(data) : data,
        timestamp: now,
        ttl: ttl || this.config.defaultTTL,
        accessCount: 0,
        lastAccessed: now,
        size,
        hash
      };

      this.cache.set(key, entry);
      this.updateStats();

      logger.log('debug', 'Cache entry stored', {
        key,
        size,
        ttl: entry.ttl,
        totalEntries: this.cache.size
      }, 'CACHE');

      return true;
    } catch (error) {
      logger.log('warn', 'Failed to store cache entry', {
        key,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'CACHE');
      return false;
    }
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      this.updateStats();
      return null;
    }

    if (CacheUtils.isExpired(entry)) {
      this.cache.delete(key);
      this.stats.misses++;
      this.updateStats();
      
      logger.log('debug', 'Cache entry expired and removed', { key }, 'CACHE');
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.stats.hits++;
    this.updateStats();

    const data = this.config.compressionEnabled ? 
      CacheUtils.decompressData(entry.data) : entry.data;

    logger.log('debug', 'Cache hit', {
      key,
      accessCount: entry.accessCount,
      age: Date.now() - entry.timestamp
    }, 'CACHE');

    return data;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    return entry !== undefined && !CacheUtils.isExpired(entry);
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.updateStats();
      logger.log('debug', 'Cache entry deleted', { key }, 'CACHE');
    }
    return deleted;
  }

  clear(): void {
    this.cache.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      entries: 0,
      totalSize: 0,
      hitRate: 0,
      memoryUsage: 0,
      oldestEntry: 0,
      newestEntry: 0
    };
    this.clearStorage();
    logger.log('info', 'Cache cleared', {}, 'CACHE');
  }

  // ============================================================================
  // SPECIALIZED ROTEIROS IA OPERATIONS
  // ============================================================================

  generatePromptCacheKey(promptKey: PromptCacheKey): string {
    const configHash = CacheUtils.hashObject(promptKey.config);
    return `roteiros_${promptKey.type}_${configHash}_${promptKey.contentHash || ''}`;
  }

  async cacheGeminiResponse(
    promptKey: PromptCacheKey,
    response: any,
    ttl?: number
  ): Promise<void> {
    const key = this.generatePromptCacheKey(promptKey);
    this.set(key, response, ttl);
  }

  async getCachedGeminiResponse(promptKey: PromptCacheKey): Promise<any | null> {
    const key = this.generatePromptCacheKey(promptKey);
    return this.get(key);
  }

  cacheScriptStructure(config: any, structure: any): void {
    const key = this.generatePromptCacheKey({
      type: 'structure',
      config,
      contentHash: CacheUtils.hashObject(config)
    });
    this.set(key, structure, 7 * 24 * 60 * 60 * 1000); // 7 days for structures
  }

  getCachedScriptStructure(config: any): any | null {
    const key = this.generatePromptCacheKey({
      type: 'structure',
      config,
      contentHash: CacheUtils.hashObject(config)
    });
    return this.get(key);
  }

  cacheCharacters(config: any, characters: any): void {
    const key = this.generatePromptCacheKey({
      type: 'characters',
      config,
      contentHash: CacheUtils.hashObject(config)
    });
    this.set(key, characters, 3 * 24 * 60 * 60 * 1000); // 3 days for characters
  }

  getCachedCharacters(config: any): any | null {
    const key = this.generatePromptCacheKey({
      type: 'characters',
      config,
      contentHash: CacheUtils.hashObject(config)
    });
    return this.get(key);
  }

  // ============================================================================
  // CACHE MAINTENANCE
  // ============================================================================

  private evictLRU(): void {
    if (this.cache.size === 0) return;

    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      logger.log('debug', 'Evicted LRU cache entry', {
        key: oldestKey,
        age: Date.now() - oldestTime
      }, 'CACHE');
    }
  }

  private cleanupExpired(): void {
    const now = Date.now();
    let expiredCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (CacheUtils.isExpired(entry)) {
        this.cache.delete(key);
        expiredCount++;
      }
    }

    if (expiredCount > 0) {
      this.updateStats();
      logger.log('debug', 'Cleaned up expired cache entries', {
        expiredCount,
        remainingEntries: this.cache.size
      }, 'CACHE');
    }
  }

  private updateStats(): void {
    let totalSize = 0;
    let oldestEntry = Date.now();
    let newestEntry = 0;

    for (const entry of this.cache.values()) {
      totalSize += entry.size;
      oldestEntry = Math.min(oldestEntry, entry.timestamp);
      newestEntry = Math.max(newestEntry, entry.timestamp);
    }

    this.stats.entries = this.cache.size;
    this.stats.totalSize = totalSize;
    this.stats.hitRate = this.stats.hits + this.stats.misses > 0 ? 
      (this.stats.hits / (this.stats.hits + this.stats.misses)) * 100 : 0;
    this.stats.memoryUsage = totalSize / (1024 * 1024); // MB
    this.stats.oldestEntry = oldestEntry;
    this.stats.newestEntry = newestEntry;
  }

  private startMaintenanceTasks(): void {
    // Cleanup expired entries every 5 minutes
    setInterval(() => {
      this.cleanupExpired();
    }, 5 * 60 * 1000);

    // Save to storage every 10 minutes
    if (this.config.persistToStorage) {
      setInterval(() => {
        this.saveToStorage();
      }, 10 * 60 * 1000);
    }

    // Log statistics every hour
    setInterval(() => {
      logger.log('info', 'Cache statistics', this.getStats(), 'CACHE');
    }, 60 * 60 * 1000);
  }

  // ============================================================================
  // PERSISTENCE
  // ============================================================================

  private saveToStorage(): void {
    if (!this.config.persistToStorage) return;

    try {
      const cacheData = Array.from(this.cache.entries());
      localStorage.setItem('roteirosIA_cache', JSON.stringify(cacheData));
      localStorage.setItem('roteirosIA_cache_stats', JSON.stringify(this.stats));
      
      logger.log('debug', 'Cache saved to storage', {
        entries: cacheData.length,
        size: JSON.stringify(cacheData).length
      }, 'CACHE');
    } catch (error) {
      logger.log('warn', 'Failed to save cache to storage', {
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'CACHE');
    }
  }

  private loadFromStorage(): void {
    if (!this.config.persistToStorage) return;

    try {
      const cacheData = localStorage.getItem('roteirosIA_cache');
      const cacheStats = localStorage.getItem('roteirosIA_cache_stats');

      if (cacheData) {
        const entries: [string, CacheEntry][] = JSON.parse(cacheData);
        const now = Date.now();
        let loadedCount = 0;

        for (const [key, entry] of entries) {
          if (!CacheUtils.isExpired(entry)) {
            this.cache.set(key, entry);
            loadedCount++;
          }
        }

        logger.log('info', 'Cache loaded from storage', {
          totalEntries: entries.length,
          loadedEntries: loadedCount,
          expiredEntries: entries.length - loadedCount
        }, 'CACHE');
      }

      if (cacheStats) {
        this.stats = { ...this.stats, ...JSON.parse(cacheStats) };
      }

      this.updateStats();
    } catch (error) {
      logger.log('warn', 'Failed to load cache from storage', {
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'CACHE');
    }
  }

  private clearStorage(): void {
    if (!this.config.persistToStorage) return;

    try {
      localStorage.removeItem('roteirosIA_cache');
      localStorage.removeItem('roteirosIA_cache_stats');
    } catch (error) {
      logger.log('warn', 'Failed to clear cache storage', {
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'CACHE');
    }
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  getStats(): CacheStats {
    return { ...this.stats };
  }

  getConfig(): CacheConfig {
    return { ...this.config };
  }

  updateConfig(newConfig: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.log('info', 'Cache configuration updated', this.config, 'CACHE');
  }

  exportCache(): any {
    return {
      entries: Array.from(this.cache.entries()),
      stats: this.stats,
      config: this.config,
      timestamp: Date.now()
    };
  }

  importCache(cacheData: any): boolean {
    try {
      this.cache.clear();
      
      for (const [key, entry] of cacheData.entries) {
        if (!CacheUtils.isExpired(entry)) {
          this.cache.set(key, entry);
        }
      }

      this.updateStats();
      logger.log('info', 'Cache imported successfully', {
        entriesImported: this.cache.size
      }, 'CACHE');
      
      return true;
    } catch (error) {
      logger.log('error', 'Failed to import cache', {
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'CACHE');
      return false;
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const roteirosIACacheService = new RoteirosIACacheService({
  maxSize: 500,
  defaultTTL: 12 * 60 * 60 * 1000, // 12 hours
  maxMemoryMB: 25,
  compressionEnabled: true,
  persistToStorage: true
});

export default roteirosIACacheService;