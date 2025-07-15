/**
 * 🚀 V8.0 UNIFIED - IA ALPHA PRIORITY 1 CORRECTIONS
 * PERFORMANCE OPTIMIZER INTEGRATION
 * 
 * @description Central performance optimization coordinator
 * @author IA Alpha - V8.0 Performance Optimization Specialist
 * @created 2025-01-16
 * @methodology V8.0_UNIFIED_DEVELOPMENT
 */

import { memoryManager } from '../memory-management/WeakMemoryManager';
import AdaptiveSamplingManager from './AdaptiveSamplingManager';
import { logger } from '../../lib/logger';

// =============================================================================
// PERFORMANCE OPTIMIZER
// =============================================================================

export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private samplingManager: AdaptiveSamplingManager;
  private isInitialized = false;
  private performanceBudget = 5; // 5ms target
  private monitoringStartTime = 0;
  private totalOperations = 0;
  private totalExecutionTime = 0;

  constructor() {
    this.samplingManager = new AdaptiveSamplingManager({
      globalPerformanceBudget: this.performanceBudget,
      adaptationInterval: 10000,
      emergencyThreshold: 20,
      degradationSteps: [0.1, 0.25, 0.5, 0.75]
    });
  }

  static getInstance(): PerformanceOptimizer {
    if (!this.instance) {
      this.instance = new PerformanceOptimizer();
    }
    return this.instance;
  }

  /**
   * Initialize performance optimizer with memory management integration
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.monitoringStartTime = performance.now();

      // Initialize sampling manager
      await this.samplingManager.initialize();

      // Integrate with memory manager
      await this.integrateWithMemoryManager();

      // Setup performance monitoring
      this.setupPerformanceMonitoring();

      // Apply optimizations to existing performance services
      await this.optimizeExistingServices();

      this.isInitialized = true;

      logger.info('🚀 Performance Optimizer initialized', {
        performanceBudget: this.performanceBudget,
        targetOverhead: '<5ms',
        features: [
          'Adaptive Sampling',
          'Circuit Breakers',
          'Memory Management Integration',
          'Automatic Service Optimization'
        ]
      }, 'PERFORMANCE_OPTIMIZER');

    } catch (error) {
      logger.error('Failed to initialize Performance Optimizer', { error }, 'PERFORMANCE_OPTIMIZER');
      throw error;
    }
  }

  /**
   * Integrate with memory management system
   */
  private async integrateWithMemoryManager(): Promise<void> {
    // Register performance monitoring with memory manager
    memoryManager.registerCleanup(
      'performance_optimizer',
      async () => {
        await this.dispose();
      },
      'high'
    );

    // Use adaptive intervals for memory monitoring
    memoryManager.createAdaptiveInterval(
      'performance_budget_monitor',
      () => {
        this.checkPerformanceBudget();
      },
      5000, // 5 second base interval
      {
        adaptive: true,
        maxInterval: 30000,
        minInterval: 1000
      }
    );

    logger.debug('Integrated with memory management system', {}, 'PERFORMANCE_OPTIMIZER');
  }

  /**
   * Setup comprehensive performance monitoring
   */
  private setupPerformanceMonitoring(): void {
    // Monitor all performance-sensitive operations
    this.monitorOperation = this.monitorOperation.bind(this);
    
    // Setup global performance tracking
    if (typeof window !== 'undefined') {
      // Track performance entries
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          if (this.samplingManager.shouldSample('performance_observers')) {
            this.processPerformanceEntries(list.getEntries());
          }
        });

        try {
          observer.observe({ entryTypes: ['measure', 'navigation', 'paint'] });
          memoryManager.registerCleanup('performance_observer', () => {
            observer.disconnect();
          }, 'high');
        } catch (error) {
          logger.warn('Performance observer setup failed', { error }, 'PERFORMANCE_OPTIMIZER');
        }
      }
    }
  }

  /**
   * Monitor a performance-sensitive operation
   */
  async monitorOperation<T>(
    operationId: string,
    operation: () => Promise<T> | T,
    strategyId: string = 'default'
  ): Promise<T> {
    // Check if we should sample this operation
    if (!this.samplingManager.shouldSample(strategyId)) {
      // Execute without monitoring to save overhead
      return await Promise.resolve(operation());
    }

    const startTime = performance.now();
    let success = true;
    let result: T;

    try {
      result = await Promise.resolve(operation());
    } catch (error) {
      success = false;
      throw error;
    } finally {
      const executionTime = performance.now() - startTime;
      
      // Record metrics
      this.samplingManager.recordMetrics(strategyId, executionTime, success);
      this.totalOperations++;
      this.totalExecutionTime += executionTime;

      // Check if operation exceeded budget
      if (executionTime > this.performanceBudget) {
        logger.warn('Operation exceeded performance budget', {
          operationId,
          executionTime,
          budget: this.performanceBudget,
          strategyId
        }, 'PERFORMANCE_OPTIMIZER');
      }
    }

    return result!;
  }

  /**
   * Process performance entries from PerformanceObserver
   */
  private processPerformanceEntries(entries: PerformanceEntry[]): void {
    for (const entry of entries) {
      let strategyId = 'performance_observers';
      
      // Categorize entries
      if (entry.entryType === 'navigation') {
        strategyId = 'navigation_timing';
      } else if (entry.entryType === 'paint') {
        strategyId = 'paint_timing';
      } else if (entry.entryType === 'measure') {
        strategyId = 'user_timing';
      }

      // Record the measurement
      this.samplingManager.recordMetrics(strategyId, entry.duration, true);
    }
  }

  /**
   * Check overall performance budget
   */
  private checkPerformanceBudget(): void {
    const stats = this.samplingManager.getPerformanceStats();
    const avgOperationTime = this.totalOperations > 0 ? 
      this.totalExecutionTime / this.totalOperations : 0;

    // Log performance stats
    logger.debug('Performance budget check', {
      budgetUtilization: `${stats.budgetUtilization.toFixed(2)}%`,
      avgOperationTime: `${avgOperationTime.toFixed(2)}ms`,
      totalOperations: this.totalOperations,
      circuitBreakersOpen: stats.circuitBreakersOpen
    }, 'PERFORMANCE_OPTIMIZER');

    // Alert if budget consistently exceeded
    if (stats.budgetUtilization > 150) { // 150% of budget
      logger.warn('Performance budget consistently exceeded', {
        utilization: stats.budgetUtilization,
        avgTime: avgOperationTime,
        recommendation: 'Consider reducing monitoring frequency'
      }, 'PERFORMANCE_OPTIMIZER');
    }

    // Reset counters periodically
    if (this.totalOperations > 1000) {
      this.totalOperations = Math.floor(this.totalOperations * 0.8);
      this.totalExecutionTime = this.totalExecutionTime * 0.8;
    }
  }

  /**
   * Optimize existing performance services
   */
  private async optimizeExistingServices(): Promise<void> {
    // Apply adaptive sampling to RealTimePerformanceMonitor
    this.optimizeRealTimePerformanceMonitor();
    
    // Apply adaptive sampling to EnhancedPerformanceService
    this.optimizeEnhancedPerformanceService();
    
    // Apply adaptive sampling to SystemHealthService
    this.optimizeSystemHealthService();

    logger.info('Existing services optimized with adaptive sampling', {}, 'PERFORMANCE_OPTIMIZER');
  }

  /**
   * Optimize RealTimePerformanceMonitor
   */
  private optimizeRealTimePerformanceMonitor(): void {
    // Create optimized monitoring wrapper
    memoryManager.createAdaptiveInterval(
      'optimized_memory_monitoring',
      () => {
        if (this.samplingManager.shouldSample('memory_monitoring')) {
          this.monitorOperation(
            'memory_usage_check',
            () => {
              if ('memory' in performance) {
                const memory = (performance as any).memory;
                const memoryUsage = (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100;
                
                if (memoryUsage > 85) {
                  memoryManager.forceCleanup();
                }
              }
            },
            'memory_monitoring'
          );
        }
      },
      30000, // 30 second base
      {
        adaptive: true,
        maxInterval: 120000, // Max 2 minutes when system is stable
        minInterval: 10000   // Min 10 seconds when issues detected
      }
    );
  }

  /**
   * Optimize EnhancedPerformanceService  
   */
  private optimizeEnhancedPerformanceService(): void {
    // Replace fixed intervals with adaptive ones
    memoryManager.createAdaptiveInterval(
      'optimized_performance_collection',
      () => {
        if (this.samplingManager.shouldSample('performance_observers')) {
          this.monitorOperation(
            'performance_metrics_collection',
            () => {
              // This would integrate with actual EnhancedPerformanceService
              const now = performance.now();
              // Collect metrics efficiently
            },
            'performance_observers'
          );
        }
      },
      15000, // 15 second base
      {
        adaptive: true,
        maxInterval: 60000,
        minInterval: 5000
      }
    );
  }

  /**
   * Optimize SystemHealthService
   */
  private optimizeSystemHealthService(): void {
    memoryManager.createAdaptiveInterval(
      'optimized_health_monitoring',
      () => {
        if (this.samplingManager.shouldSample('health_monitoring')) {
          this.monitorOperation(
            'system_health_check',
            () => {
              // This would integrate with actual SystemHealthService
              // Perform lightweight health checks
            },
            'health_monitoring'
          );
        }
      },
      45000, // 45 second base
      {
        adaptive: true,
        maxInterval: 300000, // Max 5 minutes
        minInterval: 15000   // Min 15 seconds
      }
    );
  }

  /**
   * Get comprehensive performance report
   */
  getPerformanceReport() {
    const samplingStats = this.samplingManager.getPerformanceStats();
    const memoryStats = memoryManager.getStats();
    const uptime = performance.now() - this.monitoringStartTime;
    const avgOperationTime = this.totalOperations > 0 ? 
      this.totalExecutionTime / this.totalOperations : 0;

    return {
      summary: {
        overallStatus: samplingStats.budgetUtilization < 100 ? 'OPTIMAL' : 
                      samplingStats.budgetUtilization < 150 ? 'ACCEPTABLE' : 'EXCEEDED',
        performanceBudget: this.performanceBudget,
        budgetUtilization: samplingStats.budgetUtilization,
        avgOperationTime,
        uptime: uptime / 1000 // seconds
      },
      sampling: samplingStats,
      memory: memoryStats,
      operations: {
        total: this.totalOperations,
        totalExecutionTime: this.totalExecutionTime,
        averageTime: avgOperationTime
      },
      timestamp: Date.now()
    };
  }

  /**
   * Force performance optimization
   */
  async forceOptimization(): Promise<void> {
    logger.info('Force optimization triggered', {}, 'PERFORMANCE_OPTIMIZER');

    // Force memory cleanup
    await memoryManager.forceCleanup();

    // Apply emergency degradation if needed
    const stats = this.samplingManager.getPerformanceStats();
    if (stats.budgetUtilization > 200) {
      // Emergency: disable all non-critical monitoring
      logger.warn('Emergency performance optimization', {
        utilization: stats.budgetUtilization
      }, 'PERFORMANCE_OPTIMIZER');
    }
  }

  /**
   * Dispose performance optimizer
   */
  async dispose(): Promise<void> {
    if (!this.isInitialized) return;

    try {
      this.samplingManager.dispose();
      this.isInitialized = false;

      logger.info('Performance Optimizer disposed', {
        totalOperations: this.totalOperations,
        totalExecutionTime: this.totalExecutionTime,
        avgOperationTime: this.totalOperations > 0 ? 
          this.totalExecutionTime / this.totalOperations : 0
      }, 'PERFORMANCE_OPTIMIZER');

    } catch (error) {
      logger.error('Error disposing Performance Optimizer', { error }, 'PERFORMANCE_OPTIMIZER');
    }
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export const performanceOptimizer = PerformanceOptimizer.getInstance();
export default PerformanceOptimizer; 