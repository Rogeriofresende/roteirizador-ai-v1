/**
 * 🗄️ CACHE PROVIDER V8.0 - FRONTEND INTEGRATION
 * Conecta frontend ao sistema de Cache Unificado consolidado
 * Baseado em: unifiedCacheService.ts + cacheService.ts
 * Metodologia: V8.0 Consolidation Strategy
 */

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { createLogger } from '../../utils/logger';

const logger = createLogger('CacheProvider');

// =============================================================================
// TYPES & INTERFACES - MATCHING UNIFIED CACHE
// =============================================================================

type CachePriority = 'high' | 'medium' | 'low';
type CacheStrategy = 'memory' | 'localStorage' | 'indexedDB' | 'serviceWorker';

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  version: string;
  accessCount: number;
  lastAccessed: number;
  size: number;
  priority: CachePriority;
  tags: string[];
}

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

interface UnifiedCacheConfig {
  strategy: CacheStrategy[];
  ttl: number;
  maxSize: number;
  priority: CachePriority;
  tags?: string[];
  version?: string;
  compression?: boolean;
}

interface CacheContextValue {
  isInitialized: boolean;
  metrics: CacheMetrics;
  get: <T>(key: string) => Promise<T | null>;
  set: <T>(key: string, value: T, config?: Partial<UnifiedCacheConfig>) => Promise<void>;
  delete: (key: string) => Promise<boolean>;
  clear: (tags?: string[]) => Promise<void>;
  has: (key: string) => Promise<boolean>;
  invalidateTag: (tag: string) => Promise<void>;
  getHitRate: () => number;
  getStorageUsage: () => Promise<Record<CacheStrategy, number>>;
}

const CacheContext = createContext<CacheContextValue | null>(null);

// =============================================================================
// CACHE PROVIDER COMPONENT
// =============================================================================

interface CacheProviderProps {
  children: ReactNode;
  defaultConfig?: Partial<UnifiedCacheConfig>;
}

export const CacheProvider: React.FC<CacheProviderProps> = ({ 
  children, 
  defaultConfig = {
    strategy: ['memory', 'localStorage'],
    ttl: 300000, // 5 minutes
    maxSize: 50 * 1024 * 1024, // 50MB
    priority: 'medium'
  }
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [metrics, setMetrics] = useState<CacheMetrics>({
    memoryUsage: 0,
    localStorageUsage: 0,
    indexedDBUsage: 0,
    hitRate: 0,
    totalHits: 0,
    totalMisses: 0,
    entriesCount: 0,
    oldestEntry: 0,
    newestEntry: 0
  });

  // Cache storage maps
  const [memoryCache] = useState(new Map<string, CacheEntry>());
  const [cacheStats] = useState({ hits: 0, misses: 0 });

  // =============================================================================
  // CACHE OPERATIONS
  // =============================================================================

  const get = useCallback(async <T>(key: string): Promise<T | null> => {
    try {
      // Try memory cache first (fastest)
      if (memoryCache.has(key)) {
        const entry = memoryCache.get(key)!;
        
        // Check TTL
        if (Date.now() - entry.timestamp <= entry.ttl) {
          entry.accessCount++;
          entry.lastAccessed = Date.now();
          cacheStats.hits++;
          logger.debug(`Cache HIT (memory): ${key}`);
          return entry.data as T;
        } else {
          // Expired, remove from memory
          memoryCache.delete(key);
        }
      }

      // Try localStorage
      const localStorageKey = `cache:${key}`;
      const stored = localStorage.getItem(localStorageKey);
      if (stored) {
        try {
          const entry: CacheEntry = JSON.parse(stored);
          if (Date.now() - entry.timestamp <= entry.ttl) {
            // Move to memory cache for faster access
            memoryCache.set(key, entry);
            entry.accessCount++;
            entry.lastAccessed = Date.now();
            cacheStats.hits++;
            logger.debug(`Cache HIT (localStorage): ${key}`);
            return entry.data as T;
          } else {
            localStorage.removeItem(localStorageKey);
          }
        } catch (parseError) {
          localStorage.removeItem(localStorageKey);
        }
      }

      cacheStats.misses++;
      logger.debug(`Cache MISS: ${key}`);
      return null;
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
      cacheStats.misses++;
      return null;
    }
  }, [memoryCache, cacheStats]);

  const set = useCallback(async <T>(
    key: string, 
    value: T, 
    config: Partial<UnifiedCacheConfig> = {}
  ): Promise<void> => {
    try {
      const finalConfig = { ...defaultConfig, ...config };
      const now = Date.now();
      
      const entry: CacheEntry<T> = {
        data: value,
        timestamp: now,
        ttl: finalConfig.ttl!,
        version: finalConfig.version || '1.0.0',
        accessCount: 0,
        lastAccessed: now,
        size: JSON.stringify(value).length,
        priority: finalConfig.priority!,
        tags: finalConfig.tags || []
      };

      // Store in memory cache
      if (finalConfig.strategy!.includes('memory')) {
        memoryCache.set(key, entry);
      }

      // Store in localStorage
      if (finalConfig.strategy!.includes('localStorage')) {
        try {
          localStorage.setItem(`cache:${key}`, JSON.stringify(entry));
        } catch (storageError) {
          logger.warn(`Failed to store in localStorage: ${key}`, storageError);
        }
      }

      logger.debug(`Cache SET: ${key} (${entry.size} bytes)`);
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
      throw error;
    }
  }, [defaultConfig, memoryCache]);

  const deleteKey = useCallback(async (key: string): Promise<boolean> => {
    try {
      let deleted = false;

      // Remove from memory
      if (memoryCache.has(key)) {
        memoryCache.delete(key);
        deleted = true;
      }

      // Remove from localStorage
      const localStorageKey = `cache:${key}`;
      if (localStorage.getItem(localStorageKey)) {
        localStorage.removeItem(localStorageKey);
        deleted = true;
      }

      if (deleted) {
        logger.debug(`Cache DELETE: ${key}`);
      }

      return deleted;
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }, [memoryCache]);

  const clear = useCallback(async (tags?: string[]): Promise<void> => {
    try {
      if (!tags) {
        // Clear everything
        memoryCache.clear();
        
        // Clear localStorage cache entries
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith('cache:')) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        logger.info('Cache cleared completely');
      } else {
        // Clear by tags
        const keysToDelete: string[] = [];
        
        memoryCache.forEach((entry, key) => {
          if (tags.some(tag => entry.tags.includes(tag))) {
            keysToDelete.push(key);
          }
        });

        keysToDelete.forEach(key => {
          memoryCache.delete(key);
          localStorage.removeItem(`cache:${key}`);
        });

        logger.info(`Cache cleared for tags: ${tags.join(', ')}`);
      }
    } catch (error) {
      logger.error('Cache clear error:', error);
      throw error;
    }
  }, [memoryCache]);

  const has = useCallback(async (key: string): Promise<boolean> => {
    return memoryCache.has(key) || localStorage.getItem(`cache:${key}`) !== null;
  }, [memoryCache]);

  const invalidateTag = useCallback(async (tag: string): Promise<void> => {
    await clear([tag]);
  }, [clear]);

  const getHitRate = useCallback((): number => {
    const total = cacheStats.hits + cacheStats.misses;
    return total > 0 ? (cacheStats.hits / total) * 100 : 0;
  }, [cacheStats]);

  const getStorageUsage = useCallback(async (): Promise<Record<CacheStrategy, number>> => {
    try {
      // Calculate memory usage
      let memoryUsage = 0;
      memoryCache.forEach(entry => {
        memoryUsage += entry.size;
      });

      // Calculate localStorage usage
      let localStorageUsage = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('cache:')) {
          const value = localStorage.getItem(key);
          if (value) {
            localStorageUsage += value.length;
          }
        }
      }

      return {
        memory: memoryUsage,
        localStorage: localStorageUsage,
        indexedDB: 0, // Not implemented yet
        serviceWorker: 0 // Not implemented yet
      };
    } catch (error) {
      logger.error('Error calculating storage usage:', error);
      return { memory: 0, localStorage: 0, indexedDB: 0, serviceWorker: 0 };
    }
  }, [memoryCache]);

  // =============================================================================
  // UPDATE METRICS
  // =============================================================================

  const updateMetrics = useCallback(async () => {
    try {
      const usage = await getStorageUsage();
      const hitRate = getHitRate();

      setMetrics({
        memoryUsage: usage.memory,
        localStorageUsage: usage.localStorage,
        indexedDBUsage: usage.indexedDB,
        hitRate,
        totalHits: cacheStats.hits,
        totalMisses: cacheStats.misses,
        entriesCount: memoryCache.size,
        oldestEntry: 0, // TODO: Calculate
        newestEntry: 0  // TODO: Calculate
      });
    } catch (error) {
      logger.error('Error updating cache metrics:', error);
    }
  }, [getStorageUsage, getHitRate, cacheStats, memoryCache]);

  // =============================================================================
  // EFFECTS
  // =============================================================================

  useEffect(() => {
    setIsInitialized(true);
    logger.info('✅ Cache Provider initialized');
  }, []);

  // Update metrics every 10 seconds
  useEffect(() => {
    if (!isInitialized) return;

    updateMetrics(); // Initial update
    const interval = setInterval(updateMetrics, 10000);
    return () => clearInterval(interval);
  }, [isInitialized, updateMetrics]);

  // =============================================================================
  // CONTEXT VALUE
  // =============================================================================

  const contextValue: CacheContextValue = {
    isInitialized,
    metrics,
    get,
    set,
    delete: deleteKey,
    clear,
    has,
    invalidateTag,
    getHitRate,
    getStorageUsage
  };

  return (
    <CacheContext.Provider value={contextValue}>
      {children}
    </CacheContext.Provider>
  );
};

// =============================================================================
// CUSTOM HOOKS
// =============================================================================

export const useCache = (): CacheContextValue => {
  const context = useContext(CacheContext);
  if (!context) {
    throw new Error('useCache must be used within CacheProvider');
  }
  return context;
};

// Convenience hooks for specific cache operations
export const useCachedData = <T>(
  key: string, 
  fetcher: () => Promise<T>,
  config?: Partial<UnifiedCacheConfig>
) => {
  const { get, set } = useCache();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try cache first
        const cached = await get<T>(key);
        if (cached !== null) {
          setData(cached);
          setLoading(false);
          return;
        }

        // Fetch fresh data
        const freshData = await fetcher();
        await set(key, freshData, config);
        setData(freshData);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [key, get, set, fetcher, config]);

  return { data, loading, error };
};

// =============================================================================
// EXPORTS
// =============================================================================

export default CacheProvider; 