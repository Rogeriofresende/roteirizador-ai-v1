/**
 * ⚡ PERFORMANCE SERVICE
 * Professional performance monitoring with Web Vitals, custom metrics and analytics
 */

import { logger } from '../utils/logger';
import { config } from '../config/environment';
import { trackPerformanceIssue } from './errorTrackingService';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count' | 'percent' | 'score';
  timestamp: number;
  category: 'loading' | 'interactivity' | 'visual_stability' | 'custom' | 'network' | 'memory';
  context?: Record<string, unknown>;
}

export interface WebVitalsMetrics {
  // Core Web Vitals
  LCP?: number; // Largest Contentful Paint
  FID?: number; // First Input Delay
  CLS?: number; // Cumulative Layout Shift
  
  // Other Important Metrics
  FCP?: number; // First Contentful Paint
  TTFB?: number; // Time to First Byte
}

export interface ResourceMetrics {
  requestCount: number;
  totalTransferSize: number;
  jsSize: number;
  cssSize: number;
  imageSize: number;
  averageResponseTime: number;
}

export interface MemoryMetrics {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  memoryUsagePercent: number;
  domNodes: number;
  potentialLeaks: string[];
}

export interface PerformanceReport {
  sessionId: string;
  timestamp: string;
  webVitals: WebVitalsMetrics;
  resources: ResourceMetrics;
  memory: MemoryMetrics;
  customMetrics: PerformanceMetric[];
  overallScore: number;
  recommendations: string[];
}

// =============================================================================
// PERFORMANCE SERVICE
// =============================================================================

class PerformanceService {
  private metrics: PerformanceMetric[] = [];
  private webVitals: WebVitalsMetrics = {};
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeWebVitalsObserver();
    this.initializeMemoryMonitoring();
    
    logger.info('Performance service initialized', {
      sessionId: this.sessionId,
    }, 'PERFORMANCE');
  }

  /**
   * Record a custom performance metric
   */
  recordMetric(
    name: string,
    value: number,
    unit: PerformanceMetric['unit'] = 'ms',
    category: PerformanceMetric['category'] = 'custom',
    context?: Record<string, unknown>
  ): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      category,
      timestamp: performance.now(),
      context,
    };

    this.metrics.push(metric);
    
    logger.debug('Performance metric recorded', {
      name,
      value,
      unit,
      category,
    }, 'PERFORMANCE');
  }

  /**
   * Measure function execution time
   */
  measureFunction<T>(
    name: string,
    fn: () => T | Promise<T>,
    context?: Record<string, unknown>
  ): T | Promise<T> {
    const start = performance.now();
    
    const result = fn();
    
    if (result instanceof Promise) {
      return result.then((value) => {
        const duration = performance.now() - start;
        this.recordMetric(`function_${name}`, duration, 'ms', 'custom', context);
        return value;
      });
    } else {
      const duration = performance.now() - start;
      this.recordMetric(`function_${name}`, duration, 'ms', 'custom', context);
      return result;
    }
  }

  /**
   * Get current Web Vitals metrics
   */
  getWebVitals(): WebVitalsMetrics {
    return { ...this.webVitals };
  }

  /**
   * Get resource performance metrics
   */
  getResourceMetrics(): ResourceMetrics {
    const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    let jsSize = 0, cssSize = 0, imageSize = 0;
    let totalResponseTime = 0;
    
    entries.forEach(entry => {
      const size = entry.transferSize || 0;
      const responseTime = entry.responseEnd - entry.responseStart;
      
      totalResponseTime += responseTime;
      
      // Categorize by type
      if (entry.name.includes('.js')) jsSize += size;
      else if (entry.name.includes('.css')) cssSize += size;
      else if (entry.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) imageSize += size;
    });
    
    return {
      requestCount: entries.length,
      totalTransferSize: entries.reduce((sum, e) => sum + (e.transferSize || 0), 0),
      jsSize,
      cssSize,
      imageSize,
      averageResponseTime: entries.length > 0 ? totalResponseTime / entries.length : 0,
    };
  }

  /**
   * Get memory usage metrics
   */
  getMemoryMetrics(): MemoryMetrics {
    const memory = (performance as any).memory;
    const potentialLeaks: string[] = [];
    
    if (!memory) {
      return {
        usedJSHeapSize: 0,
        totalJSHeapSize: 0,
        memoryUsagePercent: 0,
        potentialLeaks: ['Memory API not available'],
        domNodes: document.querySelectorAll('*').length,
      };
    }

    const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
    
    // Check for potential memory leaks
    if (usagePercent > 70) potentialLeaks.push('High memory usage detected');
    
    const domNodeCount = document.querySelectorAll('*').length;
    if (domNodeCount > 3000) potentialLeaks.push('High DOM node count');

    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      memoryUsagePercent: usagePercent,
      potentialLeaks,
      domNodes: domNodeCount,
    };
  }

  /**
   * Generate comprehensive performance report
   */
  generateReport(): PerformanceReport {
    const webVitals = this.getWebVitals();
    const resources = this.getResourceMetrics();
    const memory = this.getMemoryMetrics();
    
    const overallScore = this.calculateOverallScore(webVitals, resources, memory);
    const recommendations = this.generateRecommendations(webVitals, resources, memory);
    
    return {
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      webVitals,
      resources,
      memory,
      customMetrics: [...this.metrics],
      overallScore,
      recommendations,
    };
  }

  /**
   * Clear all collected metrics
   */
  clearMetrics(): void {
    this.metrics = [];
    this.webVitals = {};
    logger.info('Performance metrics cleared', {}, 'PERFORMANCE');
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  private generateSessionId(): string {
    return `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeWebVitalsObserver(): void {
    if (!('PerformanceObserver' in window)) {
      logger.warn('PerformanceObserver not supported', {}, 'PERFORMANCE');
      return;
    }

    try {
      // Largest Contentful Paint
      this.observeEntryType('largest-contentful-paint', (entries) => {
        const lastEntry = entries[entries.length - 1];
        this.webVitals.LCP = lastEntry.startTime;
        this.recordMetric('LCP', lastEntry.startTime, 'ms', 'loading');
      });

      // First Input Delay
      this.observeEntryType('first-input', (entries) => {
        const firstEntry = entries[0];
        this.webVitals.FID = firstEntry.processingStart - firstEntry.startTime;
        this.recordMetric('FID', this.webVitals.FID, 'ms', 'interactivity');
      });

      // Cumulative Layout Shift
      this.observeEntryType('layout-shift', (entries) => {
        let cls = 0;
        entries.forEach(entry => {
          if (!(entry as any).hadRecentInput) {
            cls += (entry as any).value;
          }
        });
        this.webVitals.CLS = cls;
        this.recordMetric('CLS', cls, 'score', 'visual_stability');
      });

      // Paint metrics
      this.observeEntryType('paint', (entries) => {
        entries.forEach(entry => {
          if (entry.name === 'first-contentful-paint') {
            this.webVitals.FCP = entry.startTime;
            this.recordMetric('FCP', entry.startTime, 'ms', 'loading');
          }
        });
      });

    } catch (error: unknown) {
      logger.error('Failed to initialize Web Vitals observer', {
        error: error instanceof Error ? error.message : 'Unknown',
      }, 'PERFORMANCE');
    }
  }

  private observeEntryType(type: string, callback: (entries: PerformanceEntry[]) => void): void {
    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries());
      });
      observer.observe({ type, buffered: true });
    } catch (error: unknown) {
      logger.warn(`Failed to observe ${type}`, {
        error: error instanceof Error ? error.message : 'Unknown',
      }, 'PERFORMANCE');
    }
  }

  private initializeMemoryMonitoring(): void {
    // Monitor memory every 30 seconds
    setInterval(() => {
      const memory = this.getMemoryMetrics();
      
      this.recordMetric('memory_usage', memory.memoryUsagePercent, 'percent', 'memory');
      this.recordMetric('dom_nodes', memory.domNodes, 'count', 'memory');
      
      // Check for memory issues
      memory.potentialLeaks.forEach(leak => {
        logger.warn('Potential memory issue detected', { issue: leak }, 'PERFORMANCE');
      });
      
    }, 30000);
  }

  private calculateOverallScore(
    webVitals: WebVitalsMetrics,
    resources: ResourceMetrics,
    memory: MemoryMetrics
  ): number {
    let score = 100;
    
    // Web Vitals penalties
    if (webVitals.LCP && webVitals.LCP > 2500) score -= 20;
    if (webVitals.FID && webVitals.FID > 100) score -= 15;
    if (webVitals.CLS && webVitals.CLS > 0.1) score -= 15;
    
    // Resource penalties
    if (resources.jsSize > 1024 * 1024) score -= 15; // 1MB
    if (resources.requestCount > 50) score -= 10;
    
    // Memory penalties
    if (memory.memoryUsagePercent > 50) score -= 10;
    
    return Math.max(0, Math.min(100, score));
  }

  private generateRecommendations(
    webVitals: WebVitalsMetrics,
    resources: ResourceMetrics,
    memory: MemoryMetrics
  ): string[] {
    const recommendations: string[] = [];
    
    // Web Vitals recommendations
    if (webVitals.LCP && webVitals.LCP > 2500) {
      recommendations.push('Optimize Largest Contentful Paint by reducing server response times');
    }
    if (webVitals.FID && webVitals.FID > 100) {
      recommendations.push('Improve First Input Delay by reducing JavaScript execution time');
    }
    if (webVitals.CLS && webVitals.CLS > 0.1) {
      recommendations.push('Fix Cumulative Layout Shift by setting dimensions for images');
    }
    
    // Resource recommendations
    if (resources.jsSize > 512 * 1024) {
      recommendations.push('Reduce JavaScript bundle size through code splitting');
    }
    if (resources.requestCount > 30) {
      recommendations.push('Reduce number of HTTP requests by bundling resources');
    }
    
    // Memory recommendations
    if (memory.memoryUsagePercent > 40) {
      recommendations.push('Monitor memory usage and implement proper cleanup');
    }
    
    return recommendations;
  }
}

// =============================================================================
// SINGLETON INSTANCE & EXPORTS
// =============================================================================

export const performanceService = new PerformanceService();

// Helper functions
export const measureFunction = <T>(name: string, fn: () => T | Promise<T>, context?: Record<string, unknown>) =>
  performanceService.measureFunction(name, fn, context);

export const recordMetric = (name: string, value: number, unit?: PerformanceMetric['unit'], category?: PerformanceMetric['category'], context?: Record<string, unknown>) =>
  performanceService.recordMetric(name, value, unit, category, context);

export default performanceService; 