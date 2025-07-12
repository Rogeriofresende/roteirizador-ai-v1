/**
 * 🔍 ENHANCED SEARCH OPTIMIZATIONS
 * Week 7 Day 3: Advanced search optimizations for existing SearchService
 */

import { logger } from '../utils/logger';
import { performanceService } from './performance';
import { databaseOptimizationService } from './databaseOptimizationService';

// =============================================================================
// SEARCH OPTIMIZATION EXTENSIONS
// =============================================================================

export class SearchOptimizations {
  /**
   * Enhanced search with query optimization and caching
   */
  static async optimizedSearchProjects(
    userId: string, 
    filters: any,
    options: {
      useCache?: boolean;
      batchSize?: number;
      priority?: 'high' | 'medium' | 'low';
    } = {}
  ): Promise<{ projects: any[]; totalCount: number; fromCache: boolean }> {
    const startTime = performance.now();
    const searchKey = `search_${userId}_${JSON.stringify(filters)}`;
    
    try {
      // Use database optimization service for enhanced performance
      const result = await databaseOptimizationService.executeQuery(
        searchKey,
        async () => {
          // Import SearchService dynamically to avoid circular dependencies
          const { SearchService } = await import('./searchService');
          return SearchService.searchProjects(userId, filters);
        },
        {
          cacheStrategy: options.useCache !== false ? 'conservative' : 'none',
          batchSize: options.batchSize || 50,
          timeoutMs: 15000, // 15 seconds for search
          retryConfig: {
            maxRetries: 2,
            backoffMs: 500
          }
        }
      );

      const duration = performance.now() - startTime;
      performanceService.recordMetric('optimized_search', duration, 'ms', 'search', {
        userId,
        resultCount: result.projects.length,
        cached: false
      });

      return {
        ...result,
        fromCache: false
      };
    } catch (error) {
      const duration = performance.now() - startTime;
      performanceService.recordMetric('optimized_search_error', duration, 'ms', 'search', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw error;
    }
  }

  /**
   * Batch search for multiple queries
   */
  static async batchSearch(
    userId: string,
    searchQueries: Array<{ filters: any; priority?: 'high' | 'medium' | 'low' }>
  ): Promise<Array<{ projects: any[]; totalCount: number }>> {
    const results = await Promise.allSettled(
      searchQueries.map(({ filters, priority }) =>
        this.optimizedSearchProjects(userId, filters, { priority })
      )
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        logger.warn('Batch search query failed', {
          index,
          error: result.reason
        }, 'SEARCH_OPTIMIZER');
        return { projects: [], totalCount: 0 };
      }
    });
  }

  /**
   * Preload popular searches
   */
  static async preloadPopularSearches(userId: string): Promise<void> {
    const popularFilters = [
      { sortBy: 'updatedAt', sortOrder: 'desc', limit: 10 }, // Recent projects
      { isFavorite: true, limit: 10 }, // Favorite projects
      { status: ['published'], limit: 10 }, // Published projects
    ];

    await Promise.allSettled(
      popularFilters.map(filters =>
        this.optimizedSearchProjects(userId, filters, { useCache: true })
      )
    );

    logger.info('Popular searches preloaded', { userId }, 'SEARCH_OPTIMIZER');
  }
} 