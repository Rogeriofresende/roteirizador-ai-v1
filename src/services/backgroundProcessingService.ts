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

/**
 * 🔄 BACKGROUND PROCESSING SERVICE
 * Week 7 Day 4: Advanced background processing with Web Workers, task queues, and intelligent scheduling
 */

import { logger } from '../utils/logger';
import { performanceService } from './performance';
import { analyticsService } from './analyticsService';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface BackgroundTask {
  id: string;
  type: string;
  data: any;
  priority: 'critical' | 'high' | 'medium' | 'low';
  timeout: number;
  retries: number;
  maxRetries: number;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  error?: string;
  result?: any;
  dependencies?: string[];
}

interface TaskQueue {
  pending: BackgroundTask[];
  running: Map<string, BackgroundTask>;
  completed: Map<string, BackgroundTask>;
  failed: Map<string, BackgroundTask>;
}

interface WorkerPool {
  workers: Worker[];
  available: Worker[];
  busy: Map<Worker, BackgroundTask>;
  maxWorkers: number;
}

interface ProcessingMetrics {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  avgProcessingTime: number;
  queueLength: number;
  activeWorkers: number;
  throughput: number; // tasks per second
}

// =============================================================================
// WEB WORKER MANAGER
// =============================================================================

class WebWorkerManager {
  private workerPool: WorkerPool;
  private workerScript: string;
  private metrics: ProcessingMetrics = {
    totalTasks: 0,
    completedTasks: 0,
    failedTasks: 0,
    avgProcessingTime: 0,
    queueLength: 0,
    activeWorkers: 0,
    throughput: 0
  };

  constructor(maxWorkers: number = navigator.hardwareConcurrency || 4) {
    this.workerPool = {
      workers: [],
      available: [],
      busy: new Map(),
      maxWorkers: Math.min(maxWorkers, 8) // Cap at 8 workers
    };
    
    this.workerScript = this.createWorkerScript();
    this.initializeWorkers();
  }

  private createWorkerScript(): string {
    // Create inline worker script for background processing
    return `
      // Background Worker Script
      const taskProcessors = {
        // Data processing tasks
        processData: (data) => {
          const startTime = performance.now();
          
          try {
            // Simulate data processing
            const result = data.items?.map(item => ({
              ...item,
              processed: true,
              processedAt: Date.now()
            })) || [];
            
            return {
              success: true,
              result,
              processingTime: performance.now() - startTime
            };
          } catch (error) {
            return {
              success: false,
              error: error.message,
              processingTime: performance.now() - startTime
            };
          }
        },
        
        // Text analysis
        analyzeText: (data) => {
          const startTime = performance.now();
          
          try {
            const text = data.text || '';
            const words = text.split(/\\s+/).filter(word => word.length > 0);
            const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
            const paragraphs = text.split(/\\n\\s*\\n/).filter(p => p.trim().length > 0);
            
            const result = {
              wordCount: words.length,
              sentenceCount: sentences.length,
              paragraphCount: paragraphs.length,
              averageWordsPerSentence: sentences.length > 0 ? words.length / sentences.length : 0,
              readingTime: Math.ceil(words.length / 200), // Assumes 200 WPM
              complexity: words.length > 1000 ? 'high' : words.length > 500 ? 'medium' : 'low'
            };
            
            return {
              success: true,
              result,
              processingTime: performance.now() - startTime
            };
          } catch (error) {
            return {
              success: false,
              error: error.message,
              processingTime: performance.now() - startTime
            };
          }
        },
        
        // Image processing simulation
        processImage: (data) => {
          const startTime = performance.now();
          
          try {
            // Simulate image processing
            const result = {
              originalSize: data.size || 0,
              optimizedSize: Math.floor((data.size || 0) * 0.7),
              format: data.format || 'jpeg',
              dimensions: data.dimensions || { width: 800, height: 600 },
              optimized: true
            };
            
            return {
              success: true,
              result,
              processingTime: performance.now() - startTime
            };
          } catch (error) {
            return {
              success: false,
              error: error.message,
              processingTime: performance.now() - startTime
            };
          }
        },
        
        // Search indexing
        indexContent: (data) => {
          const startTime = performance.now();
          
          try {
            const content = data.content || {};
            const searchIndex = {
              id: content.id,
              title: content.title?.toLowerCase() || '',
              content: content.text?.toLowerCase() || '',
              tags: content.tags || [],
              keywords: this.extractKeywords(content.text || ''),
              indexed: true,
              indexedAt: Date.now()
            };
            
            return {
              success: true,
              result: searchIndex,
              processingTime: performance.now() - startTime
            };
          } catch (error) {
            return {
              success: false,
              error: error.message,
              processingTime: performance.now() - startTime
            };
          }
        },
        
        extractKeywords: (text) => {
          const words = text.toLowerCase().split(/\\W+/);
          const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
          const wordCount = {};
          
          words.forEach(word => {
            if (word.length > 3 && !stopWords.has(word)) {
              wordCount[word] = (wordCount[word] || 0) + 1;
            }
          });
          
          return Object.entries(wordCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([word]) => word);
        }
      };
      
      self.onmessage = function(e) {
        const { taskId, type, data, timeout } = e.data;
        
        try {
          // Set timeout for task
          const timeoutId = setTimeout(() => {
            self.postMessage({
              taskId,
              success: false,
              error: 'Task timeout',
              processingTime: timeout
            });
          }, timeout);
          
          // Process task
          const processor = taskProcessors[type];
          if (!processor) {
            clearTimeout(timeoutId);
            self.postMessage({
              taskId,
              success: false,
              error: \`Unknown task type: \${type}\`,
              processingTime: 0
            });
            return;
          }
          
          const result = processor(data);
          clearTimeout(timeoutId);
          
          self.postMessage({
            taskId,
            ...result
          });
          
        } catch (error) {
          self.postMessage({
            taskId,
            success: false,
            error: error.message,
            processingTime: 0
          });
        }
      };
    `;
  }

  private initializeWorkers(): void {
    const blob = new Blob([this.workerScript], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);

    for (let i = 0; i < this.workerPool.maxWorkers; i++) {
      try {
        const worker = new Worker(workerUrl);
        
        worker.onmessage = (e) => this.handleWorkerMessage(worker, e);
        worker.onerror = (error) => this.handleWorkerError(worker, error);
        
        this.workerPool.workers.push(worker);
        this.workerPool.available.push(worker);
      } catch (error) {
        logger.warn('Failed to create worker', { index: i, error }, 'BACKGROUND_PROCESSING');
      }
    }

    URL.revokeObjectURL(workerUrl);
    
    logger.info('Web Workers initialized', {
      totalWorkers: this.workerPool.workers.length,
      maxWorkers: this.workerPool.maxWorkers
    }, 'BACKGROUND_PROCESSING');
  }

  private handleWorkerMessage(worker: Worker, event: MessageEvent): void {
    const { taskId, success, result, error, processingTime } = event.data;
    const task = this.workerPool.busy.get(worker);
    
    if (!task || task.id !== taskId) {
      logger.warn('Received message for unknown task', { taskId }, 'BACKGROUND_PROCESSING');
      return;
    }

    // Update task
    task.completedAt = Date.now();
    if (success) {
      task.result = result;
      this.metrics.completedTasks++;
    } else {
      task.error = error;
      this.metrics.failedTasks++;
    }

    // Update metrics
    this.metrics.avgProcessingTime = 
      (this.metrics.avgProcessingTime * 0.9) + (processingTime * 0.1);

    // Release worker
    this.workerPool.busy.delete(worker);
    this.workerPool.available.push(worker);
    this.metrics.activeWorkers = this.workerPool.busy.size;

    // Notify task completion
    this.notifyTaskCompletion(task);

    performanceService.recordMetric(
      success ? 'background_task_success' : 'background_task_error',
      processingTime,
      'ms',
      'background_processing',
      {
        taskType: task.type,
        taskId: task.id,
        retries: task.retries
      }
    );
  }

  private handleWorkerError(worker: Worker, error: ErrorEvent): void {
    const task = this.workerPool.busy.get(worker);
    
    if (task) {
      task.error = error.message || 'Worker error';
      task.completedAt = Date.now();
      this.metrics.failedTasks++;
      
      // Release worker
      this.workerPool.busy.delete(worker);
      this.workerPool.available.push(worker);
      this.metrics.activeWorkers = this.workerPool.busy.size;
      
      this.notifyTaskCompletion(task);
    }

    logger.error('Worker error', { error: error.message }, 'BACKGROUND_PROCESSING');
  }

  async executeTask(task: BackgroundTask): Promise<BackgroundTask> {
    return new Promise((resolve) => {
      const worker = this.workerPool.available.pop();
      
      if (!worker) {
        // No workers available - this should be handled by the queue
        task.error = 'No workers available';
        task.completedAt = Date.now();
        resolve(task);
        return;
      }

      // Setup task completion callback
      task.onComplete = resolve;
      
      // Track worker usage
      this.workerPool.busy.set(worker, task);
      this.metrics.activeWorkers = this.workerPool.busy.size;
      
      // Start task
      task.startedAt = Date.now();
      worker.postMessage({
        taskId: task.id,
        type: task.type,
        data: task.data,
        timeout: task.timeout
      });
    });
  }

  private notifyTaskCompletion(task: BackgroundTask): void {
    if (task.onComplete) {
      task.onComplete(task);
    }
  }

  getAvailableWorkers(): number {
    return this.workerPool.available.length;
  }

  getMetrics(): ProcessingMetrics {
    return { ...this.metrics };
  }

  terminate(): void {
    this.workerPool.workers.forEach(worker => worker.terminate());
    this.workerPool.workers = [];
    this.workerPool.available = [];
    this.workerPool.busy.clear();
  }
}

// =============================================================================
// TASK SCHEDULER
// =============================================================================

class TaskScheduler {
  private taskQueue: TaskQueue = {
    pending: [],
    running: new Map(),
    completed: new Map(),
    failed: new Map()
  };
  
  private workerManager: WebWorkerManager;
  private schedulerInterval: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor(maxWorkers?: number) {
    this.workerManager = new WebWorkerManager(maxWorkers);
    this.startScheduler();
  }

  addTask(
    type: string,
    data: any,
    options: {
      priority?: 'critical' | 'high' | 'medium' | 'low';
      timeout?: number;
      maxRetries?: number;
      dependencies?: string[];
    } = {}
  ): string {
    const task: BackgroundTask = {
      id: this.generateTaskId(),
      type,
      data,
      priority: options.priority || 'medium',
      timeout: options.timeout || 30000,
      retries: 0,
      maxRetries: options.maxRetries || 3,
      createdAt: Date.now(),
      dependencies: options.dependencies || []
    };

    // Insert task based on priority
    this.insertTaskByPriority(task);
    
    logger.debug('Task added to queue', {
      taskId: task.id,
      type: task.type,
      priority: task.priority,
      queueLength: this.taskQueue.pending.length
    }, 'BACKGROUND_PROCESSING');

    return task.id;
  }

  private insertTaskByPriority(task: BackgroundTask): void {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    const taskPriority = priorityOrder[task.priority];
    
    let insertIndex = this.taskQueue.pending.length;
    
    for (let i = 0; i < this.taskQueue.pending.length; i++) {
      const existingPriority = priorityOrder[this.taskQueue.pending[i].priority];
      if (taskPriority > existingPriority) {
        insertIndex = i;
        break;
      }
    }
    
    this.taskQueue.pending.splice(insertIndex, 0, task);
  }

  private startScheduler(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.schedulerInterval = setInterval(() => {
      this.processPendingTasks();
    }, 100); // Check every 100ms
  }

  private async processPendingTasks(): Promise<void> {
    const availableWorkers = this.workerManager.getAvailableWorkers();
    
    if (availableWorkers === 0 || this.taskQueue.pending.length === 0) {
      return;
    }

    // Process as many tasks as we have workers for
    const tasksToProcess = Math.min(availableWorkers, this.taskQueue.pending.length);
    
    for (let i = 0; i < tasksToProcess; i++) {
      const task = this.findNextExecutableTask();
      
      if (!task) break;
      
      // Remove from pending and add to running
      const index = this.taskQueue.pending.indexOf(task);
      this.taskQueue.pending.splice(index, 1);
      this.taskQueue.running.set(task.id, task);
      
      // Execute task
      this.executeTask(task);
    }
  }

  private findNextExecutableTask(): BackgroundTask | null {
    for (const task of this.taskQueue.pending) {
      // Check if dependencies are satisfied
      if (this.areDependenciesSatisfied(task)) {
        return task;
      }
    }
    return null;
  }

  private areDependenciesSatisfied(task: BackgroundTask): boolean {
    if (!task.dependencies || task.dependencies.length === 0) {
      return true;
    }

    return task.dependencies.every(depId => 
      this.taskQueue.completed.has(depId)
    );
  }

  private async executeTask(task: BackgroundTask): Promise<void> {
    try {
      const completedTask = await this.workerManager.executeTask(task);
      
      // Move task to appropriate queue
      this.taskQueue.running.delete(task.id);
      
      if (completedTask.error && completedTask.retries < completedTask.maxRetries) {
        // Retry task
        completedTask.retries++;
        completedTask.error = undefined;
        this.insertTaskByPriority(completedTask);
        
        logger.warn('Task failed, retrying', {
          taskId: completedTask.id,
          retry: completedTask.retries,
          maxRetries: completedTask.maxRetries
        }, 'BACKGROUND_PROCESSING');
      } else if (completedTask.error) {
        // Task failed permanently
        this.taskQueue.failed.set(completedTask.id, completedTask);
        
        logger.error('Task failed permanently', {
          taskId: completedTask.id,
          error: completedTask.error,
          retries: completedTask.retries
        }, 'BACKGROUND_PROCESSING');
      } else {
        // Task completed successfully
        this.taskQueue.completed.set(completedTask.id, completedTask);
        
        logger.debug('Task completed successfully', {
          taskId: completedTask.id,
          processingTime: completedTask.completedAt! - completedTask.startedAt!
        }, 'BACKGROUND_PROCESSING');
      }
      
    } catch (error) {
      logger.error('Unexpected error in task execution', {
        taskId: task.id,
        error
      }, 'BACKGROUND_PROCESSING');
      
      this.taskQueue.running.delete(task.id);
      task.error = error instanceof Error ? error.message : 'Unexpected error';
      task.completedAt = Date.now();
      this.taskQueue.failed.set(task.id, task);
    }
  }

  getTaskStatus(taskId: string): {
    status: 'pending' | 'running' | 'completed' | 'failed' | 'not_found';
    task?: BackgroundTask;
  } {
    if (this.taskQueue.pending.find(t => t.id === taskId)) {
      return { status: 'pending', task: this.taskQueue.pending.find(t => t.id === taskId) };
    }
    
    if (this.taskQueue.running.has(taskId)) {
      return { status: 'running', task: this.taskQueue.running.get(taskId) };
    }
    
    if (this.taskQueue.completed.has(taskId)) {
      return { status: 'completed', task: this.taskQueue.completed.get(taskId) };
    }
    
    if (this.taskQueue.failed.has(taskId)) {
      return { status: 'failed', task: this.taskQueue.failed.get(taskId) };
    }
    
    return { status: 'not_found' };
  }

  getQueueMetrics(): {
    pending: number;
    running: number;
    completed: number;
    failed: number;
    processing: ProcessingMetrics;
  } {
    return {
      pending: this.taskQueue.pending.length,
      running: this.taskQueue.running.size,
      completed: this.taskQueue.completed.size,
      failed: this.taskQueue.failed.size,
      processing: this.workerManager.getMetrics()
    };
  }

  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  cleanup(): void {
    if (this.schedulerInterval) {
      clearInterval(this.schedulerInterval);
    }
    this.workerManager.terminate();
    this.isRunning = false;
  }
}

// =============================================================================
// MAIN BACKGROUND PROCESSING SERVICE
// =============================================================================

export class BackgroundProcessingService {
  private static scheduler: TaskScheduler | null = null;
  private static isInitialized = false;

  static async initialize(maxWorkers?: number): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    try {
      this.scheduler = new TaskScheduler(maxWorkers);
      this.isInitialized = true;
      
      logger.info('Background Processing Service initialized', {
        maxWorkers: maxWorkers || navigator.hardwareConcurrency || 4,
        webWorkersSupported: typeof Worker !== 'undefined'
      }, 'BACKGROUND_PROCESSING');

      return true;
    } catch (error) {
      logger.error('Failed to initialize Background Processing Service', { error }, 'BACKGROUND_PROCESSING');
      return false;
    }
  }

  /**
   * Process data in background
   */
  static processData(
    data: any[],
    options: {
      priority?: 'critical' | 'high' | 'medium' | 'low';
      timeout?: number;
      maxRetries?: number;
    } = {}
  ): string {
    this.ensureInitialized();
    
    return this.scheduler!.addTask('processData', { items: data }, options);
  }

  /**
   * Analyze text in background
   */
  static analyzeText(
    text: string,
    options: {
      priority?: 'critical' | 'high' | 'medium' | 'low';
      timeout?: number;
    } = {}
  ): string {
    this.ensureInitialized();
    
    return this.scheduler!.addTask('analyzeText', { text }, options);
  }

  /**
   * Process image in background
   */
  static processImage(
    imageData: {
      size: number;
      format: string;
      dimensions: { width: number; height: number };
    },
    options: {
      priority?: 'critical' | 'high' | 'medium' | 'low';
      timeout?: number;
    } = {}
  ): string {
    this.ensureInitialized();
    
    return this.scheduler!.addTask('processImage', imageData, options);
  }

  /**
   * Index content for search
   */
  static indexContent(
    content: {
      id: string;
      title: string;
      text: string;
      tags: string[];
    },
    options: {
      priority?: 'critical' | 'high' | 'medium' | 'low';
      dependencies?: string[];
    } = {}
  ): string {
    this.ensureInitialized();
    
    return this.scheduler!.addTask('indexContent', { content }, options);
  }

  /**
   * Get task status
   */
  static getTaskStatus(taskId: string): {
    status: 'pending' | 'running' | 'completed' | 'failed' | 'not_found';
    task?: BackgroundTask;
  } {
    this.ensureInitialized();
    
    return this.scheduler!.getTaskStatus(taskId);
  }

  /**
   * Wait for task completion
   */
  static async waitForTask(taskId: string, timeout: number = 30000): Promise<BackgroundTask> {
    this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        const status = this.scheduler!.getTaskStatus(taskId);
        
        if (status.status === 'completed' || status.status === 'failed') {
          clearInterval(checkInterval);
          clearTimeout(timeoutHandle);
          
          if (status.task) {
            resolve(status.task);
          } else {
            reject(new Error('Task not found'));
          }
        }
      }, 100);

      const timeoutHandle = setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error('Task wait timeout'));
      }, timeout);
    });
  }

  /**
   * Get comprehensive metrics
   */
  static getMetrics(): {
    queue: any;
    performance: {
      tasksPerSecond: number;
      avgProcessingTime: number;
      successRate: number;
    };
  } {
    this.ensureInitialized();
    
    const queueMetrics = this.scheduler!.getQueueMetrics();
    
    return {
      queue: queueMetrics,
      performance: {
        tasksPerSecond: queueMetrics.processing.throughput,
        avgProcessingTime: queueMetrics.processing.avgProcessingTime,
        successRate: queueMetrics.processing.totalTasks > 0 
          ? (queueMetrics.processing.completedTasks / queueMetrics.processing.totalTasks) * 100 
          : 0
      }
    };
  }

  private static ensureInitialized(): void {
    if (!this.isInitialized || !this.scheduler) {
      throw new Error('Background Processing Service not initialized. Call initialize() first.');
    }
  }

  static cleanup(): void {
    if (this.scheduler) {
      this.scheduler.cleanup();
      this.scheduler = null;
    }
    this.isInitialized = false;
  }
} 