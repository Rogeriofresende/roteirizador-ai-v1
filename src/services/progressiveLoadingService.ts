/**
 * 🚀 PROGRESSIVE LOADING SERVICE
 * Week 7 Day 4: Advanced progressive loading with virtual scrolling, pagination, and intelligent preloading
 */

import { logger } from '../utils/logger';
import { performanceService } from './performance';
import { analyticsService } from './analyticsService';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface LoadingConfig {
  pageSize: number;
  preloadPages: number;
  virtualScrolling: boolean;
  cacheStrategy: 'memory' | 'indexedDB' | 'mixed';
  priorityLoading: boolean;
  placeholder: 'skeleton' | 'shimmer' | 'custom';
}

interface ProgressiveDataset<T> {
  items: T[];
  totalCount: number;
  currentPage: number;
  hasNextPage: boolean;
  isLoading: boolean;
  error: string | null;
  loadedPages: Set<number>;
  cache: Map<number, T[]>;
}

interface ViewportInfo {
  startIndex: number;
  endIndex: number;
  overscan: number;
  itemHeight: number;
  containerHeight: number;
}

interface LoadingMetrics {
  totalRequests: number;
  successfulLoads: number;
  cacheHits: number;
  avgLoadTime: number;
  bytesLoaded: number;
  virtualizedItems: number;
}

// =============================================================================
// VIRTUAL SCROLLING MANAGER
// =============================================================================

class VirtualScrollingManager {
  private itemHeight: number;
  private containerHeight: number;
  private overscan: number;
  private totalItems: number;
  private scrollTop: number = 0;

  constructor(itemHeight: number, containerHeight: number, overscan: number = 5) {
    this.itemHeight = itemHeight;
    this.containerHeight = containerHeight;
    this.overscan = overscan;
    this.totalItems = 0;
  }

  updateScrollPosition(scrollTop: number): ViewportInfo {
    this.scrollTop = scrollTop;
    return this.calculateViewport();
  }

  updateDimensions(containerHeight: number, itemHeight?: number): ViewportInfo {
    this.containerHeight = containerHeight;
    if (itemHeight) {
      this.itemHeight = itemHeight;
    }
    return this.calculateViewport();
  }

  setTotalItems(totalItems: number): void {
    this.totalItems = totalItems;
  }

  private calculateViewport(): ViewportInfo {
    const visibleStart = Math.floor(this.scrollTop / this.itemHeight);
    const visibleEnd = Math.min(
      Math.ceil((this.scrollTop + this.containerHeight) / this.itemHeight),
      this.totalItems
    );

    const startIndex = Math.max(0, visibleStart - this.overscan);
    const endIndex = Math.min(this.totalItems, visibleEnd + this.overscan);

    return {
      startIndex,
      endIndex,
      overscan: this.overscan,
      itemHeight: this.itemHeight,
      containerHeight: this.containerHeight
    };
  }

  getTotalHeight(): number {
    return this.totalItems * this.itemHeight;
  }

  getItemPosition(index: number): { top: number; height: number } {
    return {
      top: index * this.itemHeight,
      height: this.itemHeight
    };
  }
}

// =============================================================================
// INTELLIGENT PRELOADER
// =============================================================================

class IntelligentPreloader<T> {
  private loadFunction: (page: number, pageSize: number) => Promise<{ items: T[]; totalCount: number }>;
  private cache = new Map<number, T[]>();
  private loadingPages = new Set<number>();
  private preloadQueue: number[] = [];
  private maxCacheSize: number = 50; // Max pages to cache
  private metrics: LoadingMetrics = {
    totalRequests: 0,
    successfulLoads: 0,
    cacheHits: 0,
    avgLoadTime: 0,
    bytesLoaded: 0,
    virtualizedItems: 0
  };

  constructor(
    loadFunction: (page: number, pageSize: number) => Promise<{ items: T[]; totalCount: number }>,
    maxCacheSize?: number
  ) {
    this.loadFunction = loadFunction;
    if (maxCacheSize) {
      this.maxCacheSize = maxCacheSize;
    }
  }

  async loadPage(
    page: number, 
    pageSize: number, 
    priority: 'high' | 'medium' | 'low' = 'medium'
  ): Promise<{ items: T[]; totalCount: number; fromCache: boolean }> {
    const startTime = performance.now();
    this.metrics.totalRequests++;

    // Check cache first
    if (this.cache.has(page)) {
      this.metrics.cacheHits++;
      const duration = performance.now() - startTime;
      
      performanceService.recordMetric('progressive_load_cache_hit', duration, 'ms', 'progressive_loading', {
        page,
        priority
      });

      return {
        items: this.cache.get(page)!,
        totalCount: 0, // Will be updated by caller
        fromCache: true
      };
    }

    // Check if already loading
    if (this.loadingPages.has(page)) {
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (this.cache.has(page)) {
            clearInterval(checkInterval);
            resolve({
              items: this.cache.get(page)!,
              totalCount: 0,
              fromCache: true
            });
          }
        }, 100);
      });
    }

    // Load page
    this.loadingPages.add(page);

    try {
      const result = await this.loadFunction(page, pageSize);
      
      // Cache result
      this.cache.set(page, result.items);
      this.metrics.successfulLoads++;
      this.metrics.bytesLoaded += this.estimateSize(result.items);
      
      // Cleanup cache if needed
      this.cleanupCache();
      
      const duration = performance.now() - startTime;
      this.metrics.avgLoadTime = (this.metrics.avgLoadTime * 0.9) + (duration * 0.1);
      
      performanceService.recordMetric('progressive_load_success', duration, 'ms', 'progressive_loading', {
        page,
        itemCount: result.items.length,
        priority
      });

      return {
        ...result,
        fromCache: false
      };
    } catch (error) {
      const duration = performance.now() - startTime;
      
      performanceService.recordMetric('progressive_load_error', duration, 'ms', 'progressive_loading', {
        page,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      throw error;
    } finally {
      this.loadingPages.delete(page);
    }
  }

  preloadPages(pages: number[], pageSize: number): void {
    // Add to preload queue with deduplication
    const newPages = pages.filter(page => 
      !this.cache.has(page) && 
      !this.loadingPages.has(page) &&
      !this.preloadQueue.includes(page)
    );
    
    this.preloadQueue.push(...newPages);
    
    // Process preload queue
    this.processPreloadQueue(pageSize);
  }

  private async processPreloadQueue(pageSize: number): Promise<void> {
    while (this.preloadQueue.length > 0) {
      const page = this.preloadQueue.shift()!;
      
      try {
        await this.loadPage(page, pageSize, 'low');
        
        // Small delay to not block main thread
        await new Promise(resolve => setTimeout(resolve, 10));
      } catch (error) {
        logger.warn('Preload failed', { page, error }, 'PROGRESSIVE_LOADING');
      }
    }
  }

  private cleanupCache(): void {
    if (this.cache.size <= this.maxCacheSize) {
      return;
    }

    // Remove oldest entries (simple LRU)
    const entries = Array.from(this.cache.entries());
    const toRemove = entries.slice(0, this.cache.size - this.maxCacheSize);
    
    toRemove.forEach(([page]) => {
      this.cache.delete(page);
    });
  }

  private estimateSize(items: T[]): number {
    try {
      return JSON.stringify(items).length;
    } catch {
      return items.length * 1024; // 1KB per item estimate
    }
  }

  getMetrics(): LoadingMetrics {
    return { ...this.metrics };
  }

  invalidateCache(pageFilter?: (page: number) => boolean): void {
    if (pageFilter) {
      for (const page of this.cache.keys()) {
        if (pageFilter(page)) {
          this.cache.delete(page);
        }
      }
    } else {
      this.cache.clear();
    }
  }
}

// =============================================================================
// PROGRESSIVE LOADING HOOK
// =============================================================================

export class ProgressiveLoadingService {
  private static datasets = new Map<string, ProgressiveDataset<any>>();
  private static preloaders = new Map<string, IntelligentPreloader<any>>();
  private static virtualScrollers = new Map<string, VirtualScrollingManager>();

  /**
   * Initialize a progressive dataset
   */
  static initializeDataset<T>(
    datasetId: string,
    loadFunction: (page: number, pageSize: number) => Promise<{ items: T[]; totalCount: number }>,
    config: Partial<LoadingConfig> = {}
  ): ProgressiveDataset<T> {
    const finalConfig: LoadingConfig = {
      pageSize: 20,
      preloadPages: 2,
      virtualScrolling: true,
      cacheStrategy: 'mixed',
      priorityLoading: true,
      placeholder: 'skeleton',
      ...config
    };

    const dataset: ProgressiveDataset<T> = {
      items: [],
      totalCount: 0,
      currentPage: 0,
      hasNextPage: true,
      isLoading: false,
      error: null,
      loadedPages: new Set(),
      cache: new Map()
    };

    this.datasets.set(datasetId, dataset);
    
    // Initialize preloader
    const preloader = new IntelligentPreloader(loadFunction);
    this.preloaders.set(datasetId, preloader);

    // Initialize virtual scroller if enabled
    if (finalConfig.virtualScrolling) {
      const virtualScroller = new VirtualScrollingManager(80, 600, 5); // Default values
      this.virtualScrollers.set(datasetId, virtualScroller);
    }

    logger.info('Progressive dataset initialized', {
      datasetId,
      config: finalConfig
    }, 'PROGRESSIVE_LOADING');

    return dataset;
  }

  /**
   * Load initial page of data
   */
  static async loadInitialData<T>(
    datasetId: string,
    pageSize?: number
  ): Promise<{ items: T[]; totalCount: number }> {
    const dataset = this.datasets.get(datasetId);
    const preloader = this.preloaders.get(datasetId);
    
    if (!dataset || !preloader) {
      throw new Error(`Dataset ${datasetId} not initialized`);
    }

    dataset.isLoading = true;
    dataset.error = null;

    try {
      const result = await preloader.loadPage(0, pageSize || 20, 'high');
      
      dataset.items = result.items;
      dataset.totalCount = result.totalCount;
      dataset.currentPage = 0;
      dataset.hasNextPage = result.items.length === (pageSize || 20);
      dataset.loadedPages.add(0);
      
      // Setup virtual scrolling
      const virtualScroller = this.virtualScrollers.get(datasetId);
      if (virtualScroller) {
        virtualScroller.setTotalItems(result.totalCount);
      }

      // Preload next pages
      if (result.totalCount > (pageSize || 20)) {
        preloader.preloadPages([1, 2], pageSize || 20);
      }

      return result;
    } catch (error) {
      dataset.error = error instanceof Error ? error.message : 'Loading failed';
      throw error;
    } finally {
      dataset.isLoading = false;
    }
  }

  /**
   * Load next page of data
   */
  static async loadNextPage<T>(
    datasetId: string,
    pageSize?: number
  ): Promise<{ items: T[]; hasMore: boolean }> {
    const dataset = this.datasets.get(datasetId);
    const preloader = this.preloaders.get(datasetId);
    
    if (!dataset || !preloader || !dataset.hasNextPage) {
      return { items: [], hasMore: false };
    }

    const nextPage = dataset.currentPage + 1;
    
    if (dataset.loadedPages.has(nextPage)) {
      return { items: [], hasMore: dataset.hasNextPage };
    }

    dataset.isLoading = true;

    try {
      const result = await preloader.loadPage(nextPage, pageSize || 20, 'medium');
      
      dataset.items.push(...result.items);
      dataset.currentPage = nextPage;
      dataset.hasNextPage = result.items.length === (pageSize || 20);
      dataset.loadedPages.add(nextPage);
      
      // Preload next pages
      preloader.preloadPages([nextPage + 1, nextPage + 2], pageSize || 20);
      
      return {
        items: result.items,
        hasMore: dataset.hasNextPage
      };
    } catch (error) {
      dataset.error = error instanceof Error ? error.message : 'Loading failed';
      throw error;
    } finally {
      dataset.isLoading = false;
    }
  }

  /**
   * Get virtual scrolling viewport
   */
  static updateVirtualScrolling(
    datasetId: string,
    scrollTop: number,
    containerHeight?: number,
    itemHeight?: number
  ): ViewportInfo | null {
    const virtualScroller = this.virtualScrollers.get(datasetId);
    
    if (!virtualScroller) {
      return null;
    }

    if (containerHeight) {
      return virtualScroller.updateDimensions(containerHeight, itemHeight);
    }

    return virtualScroller.updateScrollPosition(scrollTop);
  }

  /**
   * Get dataset by ID
   */
  static getDataset<T>(datasetId: string): ProgressiveDataset<T> | null {
    return this.datasets.get(datasetId) || null;
  }

  /**
   * Invalidate dataset cache
   */
  static invalidateDataset(
    datasetId: string,
    pageFilter?: (page: number) => boolean
  ): void {
    const preloader = this.preloaders.get(datasetId);
    const dataset = this.datasets.get(datasetId);
    
    if (preloader) {
      preloader.invalidateCache(pageFilter);
    }
    
    if (dataset) {
      dataset.items = [];
      dataset.currentPage = 0;
      dataset.loadedPages.clear();
      dataset.cache.clear();
      dataset.hasNextPage = true;
      dataset.error = null;
    }
  }

  /**
   * Get comprehensive metrics for all datasets
   */
  static getProgressiveLoadingMetrics(): {
    datasets: Array<{
      id: string;
      itemCount: number;
      loadedPages: number;
      isLoading: boolean;
      error: string | null;
    }>;
    preloaderMetrics: LoadingMetrics[];
  } {
    const datasets = Array.from(this.datasets.entries()).map(([id, dataset]) => ({
      id,
      itemCount: dataset.items.length,
      loadedPages: dataset.loadedPages.size,
      isLoading: dataset.isLoading,
      error: dataset.error
    }));

    const preloaderMetrics = Array.from(this.preloaders.values()).map(preloader =>
      preloader.getMetrics()
    );

    return {
      datasets,
      preloaderMetrics
    };
  }

  /**
   * Cleanup unused datasets
   */
  static cleanup(datasetIds?: string[]): void {
    const idsToClean = datasetIds || Array.from(this.datasets.keys());
    
    idsToClean.forEach(id => {
      this.datasets.delete(id);
      this.preloaders.delete(id);
      this.virtualScrollers.delete(id);
    });

    logger.info('Progressive loading datasets cleaned up', {
      cleanedIds: idsToClean
    }, 'PROGRESSIVE_LOADING');
  }
} 