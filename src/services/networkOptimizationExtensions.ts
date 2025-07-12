/**
 * 🌐 NETWORK OPTIMIZATION EXTENSIONS
 * Week 7 Day 3: Advanced network optimizations for existing services
 */

import { logger } from '../utils/logger';
import { performanceService } from './performance';
import { unifiedHttpService } from './unifiedHttpService';

// =============================================================================
// NETWORK OPTIMIZATION UTILITIES
// =============================================================================

export class NetworkOptimizationExtensions {
  private static requestBatches = new Map<string, Array<{
    resolve: (value: any) => void;
    reject: (error: any) => void;
    url: string;
    options: any;
  }>>();
  
  private static batchTimers = new Map<string, NodeJS.Timeout>();
  private static readonly BATCH_DELAY = 50; // 50ms batching window
  private static readonly MAX_BATCH_SIZE = 5;

  /**
   * Enhanced HTTP request with intelligent batching
   */
  static async optimizedRequest<T>(
    url: string, 
    options: any = {},
    batchKey?: string
  ): Promise<T> {
    // If batchable and has batch key, try to batch
    if (batchKey && options.method === 'GET' && !options.urgent) {
      return this.batchedRequest<T>(url, options, batchKey);
    }

    // Direct request for non-batchable calls
    return this.directOptimizedRequest<T>(url, options);
  }

  private static async batchedRequest<T>(
    url: string,
    options: any,
    batchKey: string
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      // Add to batch
      let batch = this.requestBatches.get(batchKey);
      if (!batch) {
        batch = [];
        this.requestBatches.set(batchKey, batch);
      }

      batch.push({ resolve, reject, url, options });

      // Process batch if full
      if (batch.length >= this.MAX_BATCH_SIZE) {
        this.processBatch(batchKey);
      } else {
        // Set timer for batch processing
        if (!this.batchTimers.has(batchKey)) {
          const timer = setTimeout(() => {
            this.processBatch(batchKey);
          }, this.BATCH_DELAY);
          this.batchTimers.set(batchKey, timer);
        }
      }
    });
  }

  private static async processBatch(batchKey: string): Promise<void> {
    const batch = this.requestBatches.get(batchKey);
    if (!batch || batch.length === 0) {
      return;
    }

    // Clear batch and timer
    this.requestBatches.delete(batchKey);
    const timer = this.batchTimers.get(batchKey);
    if (timer) {
      clearTimeout(timer);
      this.batchTimers.delete(batchKey);
    }

    // Execute batch in parallel
    const promises = batch.map(async ({ resolve, reject, url, options }) => {
      try {
        const result = await this.directOptimizedRequest(url, options);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });

    await Promise.allSettled(promises);

    logger.debug('Request batch processed', {
      batchKey,
      batchSize: batch.length
    }, 'NETWORK_OPTIMIZER');
  }

  private static async directOptimizedRequest<T>(
    url: string,
    options: any
  ): Promise<T> {
    const startTime = performance.now();

    try {
      // Apply connection-based optimizations
      const optimizedOptions = this.applyConnectionOptimizations(options);

      // Make request through unified HTTP service
      const response = await unifiedHttpService.request<T>({
        url,
        method: optimizedOptions.method || 'GET',
        data: optimizedOptions.data,
        headers: optimizedOptions.headers,
        timeout: optimizedOptions.timeout,
        retries: optimizedOptions.retries,
        cache: optimizedOptions.cache
      });

      const duration = performance.now() - startTime;
      performanceService.recordMetric('optimized_network_request', duration, 'ms', 'network', {
        url,
        method: optimizedOptions.method || 'GET',
        cached: response.data ? false : true // Basic cache detection
      });

      return response.data;
    } catch (error) {
      const duration = performance.now() - startTime;
      performanceService.recordMetric('optimized_network_error', duration, 'ms', 'network', {
        url,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      throw error;
    }
  }

  private static applyConnectionOptimizations(options: any): any {
    const optimized = { ...options };

    // Get connection quality (simplified)
    const connectionType = this.getConnectionType();
    
    // Adjust timeouts based on connection
    if (connectionType === 'slow-2g' || connectionType === '2g') {
      optimized.timeout = Math.max(optimized.timeout || 30000, 60000);
      optimized.retries = Math.min(optimized.retries || 3, 2);
    } else if (connectionType === '4g' || connectionType === 'wifi') {
      optimized.timeout = optimized.timeout || 15000;
      optimized.retries = optimized.retries || 3;
    }

    // Enable compression for slow connections
    if (connectionType === 'slow-2g' || connectionType === '2g') {
      optimized.headers = {
        ...optimized.headers,
        'Accept-Encoding': 'gzip, deflate, br'
      };
    }

    return optimized;
  }

  private static getConnectionType(): string {
    if ('connection' in navigator) {
      return (navigator as any).connection?.effectiveType || 'unknown';
    }
    return 'unknown';
  }

  /**
   * Prefetch resources for better performance
   */
  static async prefetchResources(
    urls: string[],
    options: {
      priority?: 'high' | 'medium' | 'low';
      timeout?: number;
    } = {}
  ): Promise<void> {
    const { priority = 'low', timeout = 10000 } = options;
    
    const prefetchPromises = urls.map(url =>
      this.optimizedRequest(url, {
        method: 'GET',
        cache: true,
        timeout,
        priority
      }).catch(error => {
        logger.warn('Prefetch failed', { url, error }, 'NETWORK_OPTIMIZER');
      })
    );

    await Promise.allSettled(prefetchPromises);
    
    logger.info('Resource prefetch completed', {
      urlCount: urls.length,
      priority
    }, 'NETWORK_OPTIMIZER');
  }

  /**
   * Get network optimization metrics
   */
  static getNetworkMetrics(): {
    activeBatches: number;
    batchedRequests: number;
    connectionType: string;
    httpStats: any;
  } {
    return {
      activeBatches: this.requestBatches.size,
      batchedRequests: Array.from(this.requestBatches.values())
        .reduce((sum, batch) => sum + batch.length, 0),
      connectionType: this.getConnectionType(),
      httpStats: unifiedHttpService.getStats()
    };
  }
}

// =============================================================================
// ENHANCED SERVICE EXTENSIONS
// =============================================================================

/**
 * Extensions for existing services to use network optimizations
 */
export class ServiceNetworkExtensions {
  /**
   * Enhanced AI service requests with network optimization
   */
  static async optimizedAIRequest(
    endpoint: string,
    data: any,
    options: {
      priority?: 'critical' | 'high' | 'medium' | 'low';
      timeout?: number;
      retries?: number;
    } = {}
  ): Promise<any> {
    const { priority = 'medium', timeout = 30000, retries = 3 } = options;
    
    return NetworkOptimizationExtensions.optimizedRequest(
      endpoint,
      {
        method: 'POST',
        data,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-Priority': priority
        },
        timeout,
        retries,
        urgent: priority === 'critical'
      },
      priority === 'critical' ? undefined : 'ai_requests' // Batch non-critical requests
    );
  }

  /**
   * Enhanced database requests with network optimization
   */
  static async optimizedDatabaseRequest(
    operation: string,
    params: any,
    options: {
      cache?: boolean;
      timeout?: number;
      batchable?: boolean;
    } = {}
  ): Promise<any> {
    const { cache = true, timeout = 15000, batchable = true } = options;
    
    return NetworkOptimizationExtensions.optimizedRequest(
      `/api/database/${operation}`,
      {
        method: 'POST',
        data: params,
        cache,
        timeout,
        retries: 2
      },
      batchable ? 'database_requests' : undefined
    );
  }

  /**
   * Enhanced analytics requests with network optimization
   */
  static async optimizedAnalyticsRequest(
    event: string,
    data: any,
    options: {
      batch?: boolean;
      priority?: 'high' | 'medium' | 'low';
    } = {}
  ): Promise<any> {
    const { batch = true, priority = 'low' } = options;
    
    return NetworkOptimizationExtensions.optimizedRequest(
      '/api/analytics/track',
      {
        method: 'POST',
        data: { event, data, timestamp: Date.now() },
        timeout: 5000, // Short timeout for analytics
        retries: 1, // Don't retry analytics too much
        urgent: priority === 'high'
      },
      batch ? 'analytics_requests' : undefined
    );
  }
} 