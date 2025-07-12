/**
 * 💾 RESOURCE MANAGEMENT SERVICE
 * Week 7 Day 4: Advanced resource management with memory optimization, lazy loading, and intelligent cleanup
 */

import { logger } from '../utils/logger';
import { performanceService } from './performance';
import { analyticsService } from './analyticsService';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface ResourceInfo {
  id: string;
  type: 'component' | 'service' | 'data' | 'asset';
  size: number;
  lastAccessed: number;
  accessCount: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  ttl?: number;
  dependencies: string[];
}

interface MemoryUsage {
  used: number;
  total: number;
  available: number;
  percentage: number;
  heapUsed?: number;
  heapTotal?: number;
}

interface ResourceMetrics {
  totalResources: number;
  memoryUsage: MemoryUsage;
  cacheHitRate: number;
  cleanupOperations: number;
  lazyLoadedComponents: number;
  preloadedAssets: number;
}

// =============================================================================
// MEMORY MONITOR
// =============================================================================

class MemoryMonitor {
  private memoryThreshold = 0.8; // 80% memory usage threshold
  private cleanupCallbacks: Array<() => Promise<void>> = [];
  private monitorInterval: NodeJS.Timeout | null = null;
  private metrics: ResourceMetrics = {
    totalResources: 0,
    memoryUsage: { used: 0, total: 0, available: 0, percentage: 0 },
    cacheHitRate: 0,
    cleanupOperations: 0,
    lazyLoadedComponents: 0,
    preloadedAssets: 0
  };

  startMonitoring(): void {
    if (this.monitorInterval) {
      return;
    }

    this.monitorInterval = setInterval(() => {
      this.checkMemoryUsage();
    }, 30000); // Check every 30 seconds

    logger.info('Memory monitoring started', {
      threshold: this.memoryThreshold
    }, 'RESOURCE_MANAGER');
  }

  stopMonitoring(): void {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
  }

  private async checkMemoryUsage(): Promise<void> {
    const memoryInfo = this.getMemoryInfo();
    this.metrics.memoryUsage = memoryInfo;

    if (memoryInfo.percentage > this.memoryThreshold) {
      logger.warn('High memory usage detected', {
        usage: memoryInfo.percentage,
        threshold: this.memoryThreshold
      }, 'RESOURCE_MANAGER');

      await this.triggerCleanup();
    }

    performanceService.recordMetric('memory_usage', memoryInfo.percentage, 'percent', 'resource_management');
  }

  private getMemoryInfo(): MemoryUsage {
    const memoryInfo = {
      used: 0,
      total: 0,
      available: 0,
      percentage: 0
    };

    // Use Performance API if available
    if ('memory' in performance) {
      const perfMemory = (performance as any).memory;
      memoryInfo.heapUsed = perfMemory.usedJSHeapSize;
      memoryInfo.heapTotal = perfMemory.totalJSHeapSize;
      memoryInfo.used = perfMemory.usedJSHeapSize;
      memoryInfo.total = perfMemory.totalJSHeapSize;
      memoryInfo.available = memoryInfo.total - memoryInfo.used;
      memoryInfo.percentage = memoryInfo.total > 0 ? (memoryInfo.used / memoryInfo.total) : 0;
    } else {
      // Fallback estimation
      memoryInfo.used = this.estimateMemoryUsage();
      memoryInfo.total = 1024 * 1024 * 100; // 100MB estimate
      memoryInfo.available = memoryInfo.total - memoryInfo.used;
      memoryInfo.percentage = memoryInfo.used / memoryInfo.total;
    }

    return memoryInfo;
  }

  private estimateMemoryUsage(): number {
    // Estimate memory usage based on DOM elements and caches
    const elements = document.getElementsByTagName('*').length;
    const estimatedSize = elements * 1000; // Rough estimate: 1KB per element
    
    return estimatedSize;
  }

  private async triggerCleanup(): Promise<void> {
    this.metrics.cleanupOperations++;
    
    logger.info('Triggering memory cleanup', {
      callbackCount: this.cleanupCallbacks.length
    }, 'RESOURCE_MANAGER');

    const cleanupPromises = this.cleanupCallbacks.map(callback => 
      callback().catch(error => {
        logger.error('Cleanup callback failed', { error }, 'RESOURCE_MANAGER');
      })
    );

    await Promise.allSettled(cleanupPromises);
  }

  addCleanupCallback(callback: () => Promise<void>): void {
    this.cleanupCallbacks.push(callback);
  }

  removeCleanupCallback(callback: () => Promise<void>): void {
    const index = this.cleanupCallbacks.indexOf(callback);
    if (index > -1) {
      this.cleanupCallbacks.splice(index, 1);
    }
  }

  getMetrics(): ResourceMetrics {
    return { ...this.metrics };
  }
}

// =============================================================================
// RESOURCE CACHE
// =============================================================================

class ResourceCache {
  private cache = new Map<string, ResourceInfo>();
  private accessLog: Array<{ id: string; timestamp: number }> = [];
  private maxCacheSize = 1000;
  private maxAge = 30 * 60 * 1000; // 30 minutes

  set(resource: ResourceInfo): void {
    // Remove old resource if exists
    if (this.cache.has(resource.id)) {
      this.cache.delete(resource.id);
    }

    // Add new resource
    this.cache.set(resource.id, {
      ...resource,
      lastAccessed: Date.now(),
      accessCount: resource.accessCount || 0
    });

    // Cleanup if needed
    this.cleanup();
  }

  get(resourceId: string): ResourceInfo | null {
    const resource = this.cache.get(resourceId);
    
    if (!resource) {
      return null;
    }

    // Check if resource is expired
    if (resource.ttl && Date.now() - resource.lastAccessed > resource.ttl) {
      this.cache.delete(resourceId);
      return null;
    }

    // Update access info
    resource.lastAccessed = Date.now();
    resource.accessCount++;
    
    // Log access
    this.accessLog.push({ id: resourceId, timestamp: Date.now() });
    
    // Keep access log size manageable
    if (this.accessLog.length > 10000) {
      this.accessLog = this.accessLog.slice(-5000);
    }

    return resource;
  }

  delete(resourceId: string): boolean {
    return this.cache.delete(resourceId);
  }

  private cleanup(): void {
    if (this.cache.size <= this.maxCacheSize) {
      return;
    }

    const now = Date.now();
    const resourcesToRemove: string[] = [];

    // First, remove expired resources
    for (const [id, resource] of this.cache.entries()) {
      if (resource.ttl && now - resource.lastAccessed > resource.ttl) {
        resourcesToRemove.push(id);
      } else if (now - resource.lastAccessed > this.maxAge) {
        resourcesToRemove.push(id);
      }
    }

    // If still over limit, remove least recently used
    if (this.cache.size - resourcesToRemove.length > this.maxCacheSize) {
      const sortedResources = Array.from(this.cache.entries())
        .filter(([id]) => !resourcesToRemove.includes(id))
        .sort(([,a], [,b]) => {
          // Sort by priority first, then by last accessed
          const priorityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
          const aPriority = priorityOrder[a.priority];
          const bPriority = priorityOrder[b.priority];
          
          if (aPriority !== bPriority) {
            return aPriority - bPriority;
          }
          
          return a.lastAccessed - b.lastAccessed;
        });

      const toRemove = this.cache.size - resourcesToRemove.length - this.maxCacheSize;
      for (let i = 0; i < toRemove; i++) {
        resourcesToRemove.push(sortedResources[i][0]);
      }
    }

    // Remove resources
    resourcesToRemove.forEach(id => this.cache.delete(id));

    if (resourcesToRemove.length > 0) {
      logger.debug('Resource cache cleanup', {
        removed: resourcesToRemove.length,
        remaining: this.cache.size
      }, 'RESOURCE_MANAGER');
    }
  }

  getUsageStats(): {
    totalResources: number;
    accessCount: number;
    hitRate: number;
    mostAccessed: Array<{ id: string; count: number }>;
  } {
    const totalResources = this.cache.size;
    const accessCount = this.accessLog.length;
    
    // Calculate hit rate (approximate)
    const recentAccesses = this.accessLog.filter(access => 
      Date.now() - access.timestamp < 60000 // Last minute
    );
    const uniqueAccesses = new Set(recentAccesses.map(a => a.id));
    const hitRate = recentAccesses.length > 0 ? uniqueAccesses.size / recentAccesses.length : 0;

    // Get most accessed resources
    const accessCounts = new Map<string, number>();
    for (const [id, resource] of this.cache.entries()) {
      accessCounts.set(id, resource.accessCount);
    }
    
    const mostAccessed = Array.from(accessCounts.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([id, count]) => ({ id, count }));

    return {
      totalResources,
      accessCount,
      hitRate,
      mostAccessed
    };
  }

  clear(): void {
    this.cache.clear();
    this.accessLog = [];
  }
}

// =============================================================================
// LAZY LOADING MANAGER
// =============================================================================

class LazyLoadingManager {
  private loadedComponents = new Set<string>();
  private loadingComponents = new Map<string, Promise<any>>();
  private componentRegistry = new Map<string, () => Promise<any>>();
  private preloadQueue: string[] = [];
  private metrics = {
    lazyLoaded: 0,
    preloaded: 0,
    failures: 0
  };

  registerComponent(componentId: string, loader: () => Promise<any>): void {
    this.componentRegistry.set(componentId, loader);
  }

  async loadComponent(componentId: string): Promise<any> {
    // Return if already loaded
    if (this.loadedComponents.has(componentId)) {
      return Promise.resolve();
    }

    // Return existing loading promise if in progress
    if (this.loadingComponents.has(componentId)) {
      return this.loadingComponents.get(componentId);
    }

    // Get loader
    const loader = this.componentRegistry.get(componentId);
    if (!loader) {
      throw new Error(`Component ${componentId} not registered`);
    }

    // Start loading
    const loadingPromise = this.executeLoad(componentId, loader);
    this.loadingComponents.set(componentId, loadingPromise);

    try {
      const result = await loadingPromise;
      this.loadedComponents.add(componentId);
      this.metrics.lazyLoaded++;
      
      logger.debug('Component lazy loaded', { componentId }, 'RESOURCE_MANAGER');
      
      return result;
    } catch (error) {
      this.metrics.failures++;
      logger.error('Component lazy loading failed', { componentId, error }, 'RESOURCE_MANAGER');
      throw error;
    } finally {
      this.loadingComponents.delete(componentId);
    }
  }

  private async executeLoad(componentId: string, loader: () => Promise<any>): Promise<any> {
    const startTime = performance.now();
    
    try {
      const result = await loader();
      const duration = performance.now() - startTime;
      
      performanceService.recordMetric('lazy_load_success', duration, 'ms', 'resource_management', {
        componentId
      });
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      performanceService.recordMetric('lazy_load_error', duration, 'ms', 'resource_management', {
        componentId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw error;
    }
  }

  preloadComponent(componentId: string): void {
    if (!this.loadedComponents.has(componentId) && 
        !this.loadingComponents.has(componentId) &&
        !this.preloadQueue.includes(componentId)) {
      this.preloadQueue.push(componentId);
      this.processPreloadQueue();
    }
  }

  private async processPreloadQueue(): Promise<void> {
    while (this.preloadQueue.length > 0) {
      const componentId = this.preloadQueue.shift()!;
      
      try {
        await this.loadComponent(componentId);
        this.metrics.preloaded++;
      } catch (error) {
        logger.warn('Component preload failed', { componentId, error }, 'RESOURCE_MANAGER');
      }
      
      // Small delay to not block main thread
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }

  getMetrics() {
    return {
      ...this.metrics,
      loadedComponents: this.loadedComponents.size,
      registeredComponents: this.componentRegistry.size,
      pendingLoads: this.loadingComponents.size,
      queuedPreloads: this.preloadQueue.length
    };
  }

  cleanup(): void {
    this.loadedComponents.clear();
    this.loadingComponents.clear();
    this.preloadQueue = [];
  }
}

// =============================================================================
// MAIN RESOURCE MANAGER SERVICE
// =============================================================================

export class ResourceManagerService {
  private static memoryMonitor = new MemoryMonitor();
  private static resourceCache = new ResourceCache();
  private static lazyLoadingManager = new LazyLoadingManager();
  private static isInitialized = false;

  static async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    try {
      // Start memory monitoring
      this.memoryMonitor.startMonitoring();
      
      // Register cleanup callbacks
      this.memoryMonitor.addCleanupCallback(async () => {
        await this.performCleanup();
      });
      
      this.isInitialized = true;
      
      logger.info('Resource Manager Service initialized', {
        memoryMonitoring: true,
        resourceCaching: true,
        lazyLoading: true
      }, 'RESOURCE_MANAGER');

      return true;
    } catch (error) {
      logger.error('Failed to initialize Resource Manager Service', { error }, 'RESOURCE_MANAGER');
      return false;
    }
  }

  /**
   * Register a resource for management
   */
  static registerResource(
    resourceId: string,
    type: 'component' | 'service' | 'data' | 'asset',
    size: number,
    options: {
      priority?: 'critical' | 'high' | 'medium' | 'low';
      ttl?: number;
      dependencies?: string[];
    } = {}
  ): void {
    this.ensureInitialized();
    
    const resource: ResourceInfo = {
      id: resourceId,
      type,
      size,
      lastAccessed: Date.now(),
      accessCount: 0,
      priority: options.priority || 'medium',
      ttl: options.ttl,
      dependencies: options.dependencies || []
    };

    this.resourceCache.set(resource);
  }

  /**
   * Access a resource (updates metrics)
   */
  static accessResource(resourceId: string): ResourceInfo | null {
    this.ensureInitialized();
    
    return this.resourceCache.get(resourceId);
  }

  /**
   * Register lazy-loaded component
   */
  static registerLazyComponent(
    componentId: string,
    loader: () => Promise<any>
  ): void {
    this.ensureInitialized();
    
    this.lazyLoadingManager.registerComponent(componentId, loader);
  }

  /**
   * Load component lazily
   */
  static async loadLazyComponent(componentId: string): Promise<any> {
    this.ensureInitialized();
    
    return this.lazyLoadingManager.loadComponent(componentId);
  }

  /**
   * Preload component
   */
  static preloadComponent(componentId: string): void {
    this.ensureInitialized();
    
    this.lazyLoadingManager.preloadComponent(componentId);
  }

  /**
   * Perform manual cleanup
   */
  static async performCleanup(): Promise<void> {
    this.ensureInitialized();
    
    logger.info('Performing resource cleanup', {}, 'RESOURCE_MANAGER');

    // Cleanup lazy loading manager
    this.lazyLoadingManager.cleanup();
    
    // Force garbage collection if available
    if ('gc' in window && typeof (window as any).gc === 'function') {
      (window as any).gc();
    }

    // Dispatch custom event for component cleanup
    window.dispatchEvent(new CustomEvent('resource-cleanup'));
  }

  /**
   * Get comprehensive metrics
   */
  static getResourceMetrics(): {
    memory: ResourceMetrics;
    cache: any;
    lazyLoading: any;
  } {
    this.ensureInitialized();
    
    return {
      memory: this.memoryMonitor.getMetrics(),
      cache: this.resourceCache.getUsageStats(),
      lazyLoading: this.lazyLoadingManager.getMetrics()
    };
  }

  /**
   * Configure memory threshold
   */
  static setMemoryThreshold(threshold: number): void {
    this.ensureInitialized();
    
    (this.memoryMonitor as any).memoryThreshold = Math.max(0.5, Math.min(0.95, threshold));
  }

  private static ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('Resource Manager Service not initialized. Call initialize() first.');
    }
  }

  static cleanup(): void {
    this.memoryMonitor.stopMonitoring();
    this.resourceCache.clear();
    this.lazyLoadingManager.cleanup();
    this.isInitialized = false;
  }
} 