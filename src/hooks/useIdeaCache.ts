import { useState, useCallback, useEffect } from 'react';
import { IdeaResponse } from '../types/IdeaTypes';

interface CacheEntry {
  data: IdeaResponse[];
  timestamp: number;
  key: string;
  ttl: number; // Time to live in milliseconds
}

interface CacheStats {
  hits: number;
  misses: number;
  totalQueries: number;
  hitRate: number;
}

const CACHE_PREFIX = 'idea_cache_';
const DEFAULT_TTL = 10 * 60 * 1000; // 10 minutes
const MAX_CACHE_SIZE = 50; // Maximum number of cache entries

export const useIdeaCache = () => {
  const [cacheStats, setCacheStats] = useState<CacheStats>({
    hits: 0,
    misses: 0,
    totalQueries: 0,
    hitRate: 0
  });

  // Update cache statistics
  const updateStats = useCallback((hit: boolean) => {
    setCacheStats(prev => {
      const newStats = {
        hits: hit ? prev.hits + 1 : prev.hits,
        misses: hit ? prev.misses : prev.misses + 1,
        totalQueries: prev.totalQueries + 1,
        hitRate: 0
      };
      newStats.hitRate = newStats.totalQueries > 0 ? (newStats.hits / newStats.totalQueries) * 100 : 0;
      return newStats;
    });
  }, []);

  // Generate cache key based on query parameters
  const generateCacheKey = useCallback((params: any): string => {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result: any, key: string) => {
        result[key] = params[key];
        return result;
      }, {});
    
    return `${CACHE_PREFIX}${btoa(JSON.stringify(sortedParams))}`;
  }, []);

  // Get cached data
  const getCachedData = useCallback((key: string): IdeaResponse[] | null => {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) {
        updateStats(false);
        return null;
      }

      const entry: CacheEntry = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is still valid
      if (now - entry.timestamp > entry.ttl) {
        localStorage.removeItem(key);
        updateStats(false);
        return null;
      }

      updateStats(true);
      return entry.data;
    } catch (error) {
      console.warn('Error reading from cache:', error);
      updateStats(false);
      return null;
    }
  }, [updateStats]);

  // Set cached data
  const setCachedData = useCallback((key: string, data: IdeaResponse[], ttl: number = DEFAULT_TTL) => {
    try {
      // Clean old cache entries if we're at max size
      const cacheKeys = Object.keys(localStorage).filter(k => k.startsWith(CACHE_PREFIX));
      if (cacheKeys.length >= MAX_CACHE_SIZE) {
        // Remove oldest entries
        const entries = cacheKeys.map(k => {
          try {
            const cached = localStorage.getItem(k);
            return cached ? { key: k, ...JSON.parse(cached) } : null;
          } catch {
            return null;
          }
        }).filter(Boolean) as (CacheEntry & { key: string })[];

        entries.sort((a, b) => a.timestamp - b.timestamp);
        entries.slice(0, 10).forEach(entry => localStorage.removeItem(entry.key));
      }

      const entry: CacheEntry = {
        data,
        timestamp: Date.now(),
        key,
        ttl
      };

      localStorage.setItem(key, JSON.stringify(entry));
    } catch (error) {
      console.warn('Error setting cache:', error);
    }
  }, []);

  // Clear specific cache
  const clearCache = useCallback((key?: string) => {
    if (key) {
      localStorage.removeItem(key);
    } else {
      // Clear all idea cache
      const cacheKeys = Object.keys(localStorage).filter(k => k.startsWith(CACHE_PREFIX));
      cacheKeys.forEach(k => localStorage.removeItem(k));
    }
  }, []);

  // Get cache with query function
  const getCachedOrFetch = useCallback(async <T>(
    queryParams: any,
    fetchFunction: () => Promise<T>,
    ttl: number = DEFAULT_TTL
  ): Promise<T> => {
    const cacheKey = generateCacheKey(queryParams);
    
    // Try to get from cache first
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      return cachedData as T;
    }

    // If not in cache, fetch and cache
    const freshData = await fetchFunction();
    setCachedData(cacheKey, freshData as IdeaResponse[], ttl);
    
    return freshData;
  }, [generateCacheKey, getCachedData, setCachedData]);

  // Preload cache with common queries
  const preloadCache = useCallback(async (commonQueries: { params: any; fetchFn: () => Promise<IdeaResponse[]> }[]) => {
    const preloadPromises = commonQueries.map(async ({ params, fetchFn }) => {
      const cacheKey = generateCacheKey(params);
      const existing = getCachedData(cacheKey);
      
      if (!existing) {
        try {
          const data = await fetchFn();
          setCachedData(cacheKey, data);
        } catch (error) {
          console.warn('Error preloading cache:', error);
        }
      }
    });

    await Promise.all(preloadPromises);
  }, [generateCacheKey, getCachedData, setCachedData]);

  // Get cache size info
  const getCacheInfo = useCallback(() => {
    const cacheKeys = Object.keys(localStorage).filter(k => k.startsWith(CACHE_PREFIX));
    let totalSize = 0;
    
    cacheKeys.forEach(key => {
      const item = localStorage.getItem(key);
      if (item) {
        totalSize += new Blob([item]).size;
      }
    });

    return {
      entriesCount: cacheKeys.length,
      totalSize: totalSize,
      maxSize: MAX_CACHE_SIZE,
      stats: cacheStats
    };
  }, [cacheStats]);

  return {
    getCachedData,
    setCachedData,
    clearCache,
    getCachedOrFetch,
    preloadCache,
    getCacheInfo,
    cacheStats,
    generateCacheKey
  };
};

export default useIdeaCache; 