/**
 * ⚡ PERFORMANCE SERVICE
 * Professional performance monitoring with Web Vitals, custom metrics and analytics
 */

import { logger } from '../utils/logger';
import { config } from '../config/environment';
import { trackPerformanceIssue } from './errorTrackingService';

// 🚀 WEEK 7 PERFORMANCE OPTIMIZATION - ENHANCED WEB VITALS TRACKING
import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';

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
  INP?: number; // Interaction to Next Paint (replaces FID in v4)
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

interface WebVitalsMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  entries: PerformanceEntry[];
}

interface PerformanceBudget {
  metric: string;
  budget: number;
  unit: string;
  current?: number;
  status?: 'pass' | 'warn' | 'fail';
}

// 🚀 WEEK 7: Performance budgets for production monitoring
const PERFORMANCE_BUDGETS: PerformanceBudget[] = [
  { metric: 'LCP', budget: 2500, unit: 'ms' }, // Largest Contentful Paint
  { metric: 'INP', budget: 200, unit: 'ms' },  // Interaction to Next Paint (replaces FID in v4)
  { metric: 'CLS', budget: 0.1, unit: 'score' }, // Cumulative Layout Shift
  { metric: 'FCP', budget: 1800, unit: 'ms' }, // First Contentful Paint
  { metric: 'TTFB', budget: 800, unit: 'ms' }, // Time to First Byte
  { metric: 'bundle_size', budget: 400, unit: 'KB' }, // Bundle size budget
  { metric: 'page_load', budget: 3000, unit: 'ms' }, // Page load time
  { metric: 'memory_usage', budget: 50, unit: 'MB' }, // Memory usage
  { metric: 'cpu_usage', budget: 30, unit: '%' } // CPU usage
];

// =============================================================================
// PERFORMANCE SERVICE
// =============================================================================

class EnhancedPerformanceService {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private vitalsMetrics: Map<string, WebVitalsMetric> = new Map();
  private performanceBudgets: PerformanceBudget[] = PERFORMANCE_BUDGETS;
  private performanceObserver?: PerformanceObserver;
  private memoryMonitorInterval?: number;
  private startTime: number = performance.now();
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeAdvancedMonitoring();
    
    logger.log('info', 'Enhanced performance monitoring initialized', {
      webVitals: true,
      performanceObserver: true,
      memoryMonitoring: true,
      networkMonitoring: true,
      budgets: this.performanceBudgets.length
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

    const categoryMetrics = this.metrics.get(category) || [];
    categoryMetrics.push(metric);
    this.metrics.set(category, categoryMetrics);
    
    logger.log('debug', 'Performance metric recorded', {
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
    return { ...this.vitalsMetrics };
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
    this.metrics.clear();
    this.vitalsMetrics.clear();
    logger.log('info', 'Performance metrics cleared', {}, 'PERFORMANCE');
  }

  // 🚀 WEEK 7 PERFORMANCE OPTIMIZATION - ENHANCED WEB VITALS TRACKING
  // 🚀 WEEK 7: Initialize comprehensive performance monitoring
  initializeAdvancedMonitoring(): void {
    // Initialize Web Vitals tracking
    this.initializeWebVitals();
    
    // Initialize performance observer for detailed metrics
    this.initializePerformanceObserver();
    
    // Initialize memory monitoring
    this.initializeMemoryMonitoring();
    
    // Initialize network monitoring
    this.initializeNetworkMonitoring();
    
    logger.log('info', 'Enhanced performance monitoring initialized', {
      webVitals: true,
      performanceObserver: true,
      memoryMonitoring: true,
      networkMonitoring: true,
      budgets: this.performanceBudgets.length
    }, 'PERFORMANCE');
  }

  // 🚀 WEEK 7: Web Vitals integration
  private initializeWebVitals(): void {
    const reportVital = (metric: WebVitalsMetric) => {
      this.vitalsMetrics.set(metric.name, metric);
      
      // Check against budget
      const budget = this.performanceBudgets.find(b => b.metric === metric.name);
      if (budget) {
        budget.current = metric.value;
        budget.status = this.getBudgetStatus(metric.value, budget.budget, metric.name);
      }
      
      // Record metric
      this.recordMetric(
        `web_vital_${metric.name.toLowerCase()}`,
        metric.value,
        'ms',
        'web_vitals',
        {
          rating: metric.rating,
          delta: metric.delta,
          id: metric.id,
          budgetStatus: budget?.status
        }
      );
      
      logger.log('debug', `Web Vital ${metric.name} recorded`, {
        value: metric.value,
        rating: metric.rating,
        budget: budget?.budget,
        status: budget?.status
      }, 'PERFORMANCE');
    };

    // Register all Web Vitals
    onCLS(reportVital);
    onINP(reportVital); // INP replaces FID in web-vitals v4
    onFCP(reportVital);
    onLCP(reportVital);
    onTTFB(reportVital);
  }

  // 🚀 WEEK 7: Performance Observer for detailed metrics
  private initializePerformanceObserver(): void {
    try {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach((entry) => {
          // Navigation timing
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            this.recordNavigationMetrics(navEntry);
          }
          
          // Resource timing (for chunk loading performance)
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
            this.recordResourceMetrics(resourceEntry);
          }
          
          // Paint timing
          if (entry.entryType === 'paint') {
            this.recordMetric(
              entry.name.replace('-', '_'),
              entry.startTime,
              'ms',
              'paint',
              { entryType: entry.entryType }
            );
          }
          
          // Layout shift (CLS components)
          if (entry.entryType === 'layout-shift') {
            const layoutEntry = entry as any;
            if (!layoutEntry.hadRecentInput) {
              this.recordMetric(
                'layout_shift',
                layoutEntry.value,
                'score',
                'layout',
                { sources: layoutEntry.sources?.length || 0 }
              );
            }
          }
        });
      });

      // Observe all relevant entry types
      this.performanceObserver.observe({
        entryTypes: ['navigation', 'resource', 'paint', 'layout-shift', 'largest-contentful-paint']
      });
      
    } catch (error) {
      logger.log('warn', 'Performance Observer not supported', { error }, 'PERFORMANCE');
    }
  }

  // 🚀 WEEK 7: Memory monitoring for memory leaks detection
  private initializeMemoryMonitoring(): void {
    if (!('memory' in performance)) {
      logger.log('warn', 'Memory API not supported', {}, 'PERFORMANCE');
      return;
    }

    this.memoryMonitorInterval = window.setInterval(() => {
      const memory = (performance as any).memory;
      
      if (memory) {
        const usedMemoryMB = memory.usedJSHeapSize / 1024 / 1024;
        const totalMemoryMB = memory.totalJSHeapSize / 1024 / 1024;
        const limitMemoryMB = memory.jsHeapSizeLimit / 1024 / 1024;
        
        // Record memory metrics
        this.recordMetric('memory_used', usedMemoryMB, 'MB', 'memory');
        this.recordMetric('memory_total', totalMemoryMB, 'MB', 'memory');
        this.recordMetric('memory_usage_percent', (usedMemoryMB / limitMemoryMB) * 100, '%', 'memory');
        
        // Check memory budget
        const memoryBudget = this.performanceBudgets.find(b => b.metric === 'memory_usage');
        if (memoryBudget) {
          memoryBudget.current = usedMemoryMB;
          memoryBudget.status = this.getBudgetStatus(usedMemoryMB, memoryBudget.budget, 'memory_usage');
          
          // Alert on high memory usage
          if (memoryBudget.status === 'fail') {
            logger.log('warn', 'High memory usage detected', {
              used: `${usedMemoryMB.toFixed(2)}MB`,
              budget: `${memoryBudget.budget}MB`,
              percentage: `${((usedMemoryMB / limitMemoryMB) * 100).toFixed(1)}%`
            }, 'PERFORMANCE');
          }
        }
      }
    }, 10000); // Every 10 seconds
  }

  // 🚀 WEEK 7: Network monitoring for chunk loading performance
  private initializeNetworkMonitoring(): void {
    // Monitor navigator connection (if available)
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      this.recordMetric('network_downlink', connection.downlink || 0, 'Mbps', 'network', {
        effectiveType: connection.effectiveType,
        rtt: connection.rtt
      });
      
      // Monitor connection changes
      connection.addEventListener('change', () => {
        this.recordMetric('network_change', connection.downlink || 0, 'Mbps', 'network', {
          effectiveType: connection.effectiveType,
          rtt: connection.rtt,
          changeEvent: true
        });
      });
    }
  }

  // 🚀 WEEK 7: Navigation metrics recording
  private recordNavigationMetrics(entry: PerformanceNavigationTiming): void {
    // Key navigation timing metrics
    this.recordMetric('dns_lookup', entry.domainLookupEnd - entry.domainLookupStart, 'ms', 'navigation');
    this.recordMetric('tcp_connection', entry.connectEnd - entry.connectStart, 'ms', 'navigation');
    this.recordMetric('server_response', entry.responseEnd - entry.requestStart, 'ms', 'navigation');
    this.recordMetric('dom_processing', entry.domContentLoadedEventEnd - entry.responseEnd, 'ms', 'navigation');
    this.recordMetric('page_load_complete', entry.loadEventEnd - entry.navigationStart, 'ms', 'navigation');
    
    // Check page load budget
    const pageLoadBudget = this.performanceBudgets.find(b => b.metric === 'page_load');
    if (pageLoadBudget) {
      const pageLoadTime = entry.loadEventEnd - entry.navigationStart;
      pageLoadBudget.current = pageLoadTime;
      pageLoadBudget.status = this.getBudgetStatus(pageLoadTime, pageLoadBudget.budget, 'page_load');
    }
  }

  // 🚀 WEEK 7: Resource metrics for chunk loading analysis
  private recordResourceMetrics(entry: PerformanceResourceTiming): void {
    // Focus on JavaScript chunks (our code splitting optimization)
    if (entry.name.includes('.js') && entry.name.includes('assets')) {
      const resourceName = entry.name.split('/').pop()?.split('-')[0] || 'unknown';
      const loadTime = entry.responseEnd - entry.requestStart;
      
      this.recordMetric(
        `chunk_load_${resourceName}`,
        loadTime,
        'ms',
        'chunk_loading',
        {
          size: entry.transferSize,
          cached: entry.transferSize === 0,
          type: 'javascript_chunk'
        }
      );
      
      // Log slow chunks
      if (loadTime > 1000) {
        logger.log('warn', 'Slow chunk loading detected', {
          chunk: resourceName,
          loadTime: `${loadTime.toFixed(2)}ms`,
          size: `${(entry.transferSize / 1024).toFixed(2)}KB`,
          url: entry.name
        }, 'PERFORMANCE');
      }
    }
  }

  // 🚀 WEEK 7: Budget status evaluation
  private getBudgetStatus(current: number, budget: number, metric: string): 'pass' | 'warn' | 'fail' {
    const ratio = current / budget;
    
    // Different thresholds for different metrics
    if (metric === 'CLS') {
      // CLS is a score, lower is better
      if (current <= budget) return 'pass';
      if (current <= budget * 1.5) return 'warn';
      return 'fail';
    } else {
      // Time-based metrics, lower is better
      if (current <= budget) return 'pass';
      if (current <= budget * 1.2) return 'warn';
      return 'fail';
    }
  }

  // 🚀 WEEK 7: Performance budget report
  getPerformanceBudgetReport(): {
    budgets: PerformanceBudget[];
    overallStatus: 'pass' | 'warn' | 'fail';
    failedBudgets: PerformanceBudget[];
    summary: string;
  } {
    const failedBudgets = this.performanceBudgets.filter(b => b.status === 'fail');
    const warnBudgets = this.performanceBudgets.filter(b => b.status === 'warn');
    
    let overallStatus: 'pass' | 'warn' | 'fail' = 'pass';
    if (failedBudgets.length > 0) overallStatus = 'fail';
    else if (warnBudgets.length > 0) overallStatus = 'warn';
    
    const summary = `${this.performanceBudgets.filter(b => b.status === 'pass').length}/${this.performanceBudgets.length} budgets passing`;
    
    return {
      budgets: this.performanceBudgets,
      overallStatus,
      failedBudgets,
      summary
    };
  }

  // 🚀 WEEK 7: Web Vitals summary
  getWebVitalsSummary(): {
    vitals: WebVitalsMetric[];
    overallScore: number;
    recommendations: string[];
  } {
    const vitals = Array.from(this.vitalsMetrics.values());
    
    // Calculate overall score (0-100)
    const scores = vitals.map(vital => {
      switch (vital.rating) {
        case 'good': return 100;
        case 'needs-improvement': return 70;
        case 'poor': return 30;
        default: return 0;
      }
    });
    
    const overallScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    
    // Generate recommendations
    const recommendations: string[] = [];
    vitals.forEach(vital => {
      if (vital.rating !== 'good') {
        switch (vital.name) {
          case 'LCP':
            recommendations.push('Optimize largest content element loading');
            break;
          case 'FID':
            recommendations.push('Reduce JavaScript execution time');
            break;
          case 'CLS':
            recommendations.push('Stabilize layout shifts');
            break;
          case 'FCP':
            recommendations.push('Optimize initial content rendering');
            break;
          case 'TTFB':
            recommendations.push('Improve server response time');
            break;
        }
      }
    });
    
    return {
      vitals,
      overallScore,
      recommendations
    };
  }

  // 🚀 WEEK 7: Enhanced cleanup
  dispose(): void {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
      this.performanceObserver = undefined;
    }
    
    if (this.memoryMonitorInterval) {
      clearInterval(this.memoryMonitorInterval);
      this.memoryMonitorInterval = undefined;
    }
    
    this.metrics.clear();
    this.vitalsMetrics.clear();
    
    logger.log('debug', 'Enhanced performance service disposed', {}, 'PERFORMANCE');
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  private generateSessionId(): string {
    return `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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

export const performanceService = new EnhancedPerformanceService();

// Helper functions
export const measureFunction = <T>(name: string, fn: () => T | Promise<T>, context?: Record<string, unknown>) =>
  performanceService.measureFunction(name, fn, context);

export const recordMetric = (name: string, value: number, unit?: PerformanceMetric['unit'], category?: PerformanceMetric['category'], context?: Record<string, unknown>) =>
  performanceService.recordMetric(name, value, unit, category, context);

export default performanceService; 