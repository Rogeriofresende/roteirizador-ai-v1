/**
 * 🚀 API PERFORMANCE ENHANCEMENTS
 * Week 7 Day 3: Final API performance optimizations for existing services
 */

import { logger } from '../utils/logger';
import { performanceService } from './performance';
import { NetworkOptimizationExtensions } from './networkOptimizationExtensions';

// =============================================================================
// API PERFORMANCE MONITORING
// =============================================================================

export class APIPerformanceEnhancements {
  private static performanceMetrics = {
    totalRequests: 0,
    avgResponseTime: 0,
    successRate: 0,
    errorRate: 0,
    throughput: 0 // requests per second
  };

  private static responseTimes: number[] = [];
  private static throughputWindow: number[] = [];

  /**
   * Enhanced API call with performance monitoring
   */
  static async performanceOptimizedAPICall<T>(
    endpoint: string,
    options: {
      method?: string;
      data?: any;
      headers?: Record<string, string>;
      timeout?: number;
      priority?: 'critical' | 'high' | 'medium' | 'low';
      enableCompression?: boolean;
      enableCaching?: boolean;
    } = {}
  ): Promise<T> {
    const startTime = performance.now();
    this.performanceMetrics.totalRequests++;
    
    try {
      // Apply API-specific optimizations
      const optimizedOptions = this.applyAPIOptimizations(options);
      
      // Track for throughput calculation
      this.throughputWindow.push(Date.now());
      
      // Make optimized request
      const result = await NetworkOptimizationExtensions.optimizedRequest<T>(
        endpoint,
        optimizedOptions,
        options.priority === 'critical' ? undefined : 'api_requests'
      );

      // Record successful metrics
      const duration = performance.now() - startTime;
      this.recordAPIMetrics(duration, true);

      return result;
    } catch (error) {
      // Record error metrics
      const duration = performance.now() - startTime;
      this.recordAPIMetrics(duration, false);
      
      throw error;
    }
  }

  private static applyAPIOptimizations(options: any): any {
    const optimized = {
      method: 'GET',
      timeout: 30000,
      retries: 3,
      cache: options.enableCaching !== false,
      ...options
    };

    // Apply compression for large payloads
    if (options.data && JSON.stringify(options.data).length > 1024) {
      optimized.headers = {
        ...optimized.headers,
        'Content-Encoding': 'gzip',
        'Accept-Encoding': 'gzip, deflate, br'
      };
    }

    // Adjust timeout based on priority
    if (options.priority === 'critical') {
      optimized.timeout = Math.min(optimized.timeout, 10000); // Max 10s for critical
    } else if (options.priority === 'low') {
      optimized.timeout = Math.max(optimized.timeout, 45000); // Allow 45s for low priority
    }

    return optimized;
  }

  private static recordAPIMetrics(duration: number, success: boolean): void {
    // Update response times
    this.responseTimes.push(duration);
    if (this.responseTimes.length > 1000) {
      this.responseTimes = this.responseTimes.slice(-500);
    }

    // Update average response time
    this.performanceMetrics.avgResponseTime = 
      (this.performanceMetrics.avgResponseTime * 0.9) + (duration * 0.1);

    // Update success/error rates
    if (success) {
      this.performanceMetrics.successRate = 
        (this.performanceMetrics.successRate * 0.95) + (1 * 0.05);
    } else {
      this.performanceMetrics.errorRate = 
        (this.performanceMetrics.errorRate * 0.95) + (1 * 0.05);
    }

    // Record in performance service
    performanceService.recordMetric(
      success ? 'api_request_success' : 'api_request_error',
      duration,
      'ms',
      'api',
      { success }
    );
  }

  /**
   * Calculate throughput (requests per second)
   */
  private static calculateThroughput(): void {
    const now = Date.now();
    const oneSecondAgo = now - 1000;
    
    // Remove requests older than 1 second
    this.throughputWindow = this.throughputWindow.filter(time => time > oneSecondAgo);
    this.performanceMetrics.throughput = this.throughputWindow.length;
  }

  /**
   * Get comprehensive API performance metrics
   */
  static getAPIPerformanceMetrics(): {
    performance: typeof APIPerformanceEnhancements.performanceMetrics;
    p95ResponseTime: number;
    network: any;
  } {
    // Calculate P95 response time
    let p95ResponseTime = 0;
    if (this.responseTimes.length > 0) {
      const sorted = [...this.responseTimes].sort((a, b) => a - b);
      const p95Index = Math.floor(sorted.length * 0.95);
      p95ResponseTime = sorted[p95Index] || 0;
    }

    // Update throughput
    this.calculateThroughput();

    return {
      performance: { ...this.performanceMetrics },
      p95ResponseTime,
      network: NetworkOptimizationExtensions.getNetworkMetrics()
    };
  }

  /**
   * Optimize specific service calls
   */
  static async optimizedGeminiCall(
    prompt: string,
    options: {
      temperature?: number;
      maxTokens?: number;
      priority?: 'critical' | 'high' | 'medium' | 'low';
    } = {}
  ): Promise<string> {
    return this.performanceOptimizedAPICall<{ response: string }>(
      '/api/ai/gemini',
      {
        method: 'POST',
        data: {
          prompt,
          temperature: options.temperature || 0.7,
          maxTokens: options.maxTokens || 1000
        },
        timeout: 45000, // AI calls need more time
        priority: options.priority || 'medium',
        enableCompression: true,
        enableCaching: false // AI responses shouldn't be cached
      }
    ).then(result => result.response);
  }

  static async optimizedDatabaseQuery<T>(
    query: string,
    params: any = {},
    options: {
      cache?: boolean;
      priority?: 'critical' | 'high' | 'medium' | 'low';
    } = {}
  ): Promise<T> {
    return this.performanceOptimizedAPICall<T>(
      '/api/database/query',
      {
        method: 'POST',
        data: { query, params },
        timeout: 20000,
        priority: options.priority || 'medium',
        enableCaching: options.cache !== false
      }
    );
  }

  static async optimizedAnalyticsEvent(
    event: string,
    data: any,
    options: {
      priority?: 'high' | 'medium' | 'low';
    } = {}
  ): Promise<void> {
    await this.performanceOptimizedAPICall(
      '/api/analytics/event',
      {
        method: 'POST',
        data: { event, data, timestamp: Date.now() },
        timeout: 5000,
        priority: options.priority || 'low',
        enableCaching: false
      }
    ).catch(error => {
      // Analytics failures shouldn't break the app
      logger.warn('Analytics event failed', { event, error }, 'API_PERFORMANCE');
    });
  }
}

// Start throughput calculation
setInterval(() => {
  (APIPerformanceEnhancements as any).calculateThroughput();
}, 1000); 