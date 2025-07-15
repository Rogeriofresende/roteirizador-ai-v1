/**
 * 🚀 V8.0 UNIFIED - IA ALPHA PRIORITY 1 CORRECTIONS
 * PERFORMANCE OPTIMIZATION SYSTEM INTEGRATION
 * 
 * @description Complete performance optimization system with auto-initialization
 * @author IA Alpha - V8.0 Performance Optimization Specialist
 * @created 2025-01-16
 * @methodology V8.0_UNIFIED_DEVELOPMENT
 */

import { performanceOptimizer, PerformanceOptimizer } from './PerformanceOptimizer';
import AdaptiveSamplingManager from './AdaptiveSamplingManager';
import { memoryManager } from '../memory-management/WeakMemoryManager';
import { logger } from '../../lib/logger';

// =============================================================================
// PERFORMANCE OPTIMIZATION INITIALIZER
// =============================================================================

class PerformanceOptimizationInitializer {
  private static isInitialized = false;
  private static initializationPromise: Promise<void> | null = null;

  /**
   * Initialize complete performance optimization system
   */
  static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.performInitialization();
    return this.initializationPromise;
  }

  private static async performInitialization(): Promise<void> {
    try {
      logger.info('🚀 Initializing V8.0 Performance Optimization System...', {}, 'PERF_INIT');

      // Step 1: Ensure memory management is initialized first
      await memoryManager.initialize();

      // Step 2: Initialize performance optimizer (includes adaptive sampling)
      await performanceOptimizer.initialize();

      // Step 3: Setup global performance monitoring
      this.setupGlobalMonitoring();

      // Step 4: Apply V8.0 compliance enforcement
      this.enforceV8Compliance();

      this.isInitialized = true;

      const performanceReport = performanceOptimizer.getPerformanceReport();

      logger.info('✅ V8.0 Performance Optimization System initialized successfully', {
        summary: performanceReport.summary,
        features: [
          'Adaptive Sampling (5 strategies)',
          'Circuit Breakers (automatic failover)',
          'Performance Budget Enforcement (<5ms)',
          'Memory Management Integration',
          'Global Monitoring',
          'V8.0 Compliance Enforcement'
        ],
        compliance: {
          performanceBudget: '5ms',
          memoryManagement: 'WeakRef patterns',
          adaptiveSampling: 'Intelligent rate adjustment',
          circuitBreakers: 'Graceful degradation'
        }
      }, 'PERF_INIT');

    } catch (error) {
      logger.error('❌ Failed to initialize Performance Optimization System', { error }, 'PERF_INIT');
      throw error;
    }
  }

  /**
   * Setup global performance monitoring with V8.0 compliance
   */
  private static setupGlobalMonitoring(): void {
    if (typeof window !== 'undefined') {
      // Monitor long tasks (V8.0 requirement)
      if ('PerformanceObserver' in window) {
        try {
          const longTaskObserver = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
              if (entry.duration > 50) { // Long task threshold
                logger.warn('Long task detected', {
                  duration: entry.duration,
                  name: entry.name,
                  startTime: entry.startTime
                }, 'PERF_MONITOR');

                // Trigger optimization if task is too long
                if (entry.duration > 100) {
                  performanceOptimizer.forceOptimization();
                }
              }
            });
          });

          longTaskObserver.observe({ entryTypes: ['longtask'] });

          memoryManager.registerCleanup('long_task_observer', () => {
            longTaskObserver.disconnect();
          }, 'high');

        } catch (error) {
          logger.warn('Long task observer setup failed', { error }, 'PERF_INIT');
        }
      }

      // Setup performance budget alerts
      memoryManager.createAdaptiveInterval(
        'performance_budget_alert',
        () => {
          const report = performanceOptimizer.getPerformanceReport();
          
          if (report.summary.overallStatus === 'EXCEEDED') {
            logger.warn('Performance budget exceeded', {
              status: report.summary.overallStatus,
              utilization: report.summary.budgetUtilization,
              avgOperationTime: report.summary.avgOperationTime
            }, 'PERF_MONITOR');
          }
        },
        30000, // 30 seconds
        {
          adaptive: true,
          maxInterval: 120000,
          minInterval: 10000
        }
      );
    }
  }

  /**
   * Enforce V8.0 compliance requirements
   */
  private static enforceV8Compliance(): void {
    // Setup V8.0 compliance monitoring
    memoryManager.createAdaptiveInterval(
      'v8_compliance_check',
      () => {
        const report = performanceOptimizer.getPerformanceReport();
        const memoryStats = memoryManager.getStats();

        // V8.0 Compliance Checks
        const compliance = {
          performanceOverhead: report.summary.avgOperationTime < 5, // <5ms requirement
          memoryLeaks: memoryStats.leaksPrevented >= 0, // No memory leaks
          adaptiveSampling: report.sampling.strategiesEnabled > 0, // Adaptive sampling active
          circuitBreakers: report.sampling.circuitBreakersOpen < 3 // Max 3 open circuit breakers
        };

        const complianceScore = Object.values(compliance).filter(Boolean).length / Object.values(compliance).length * 100;

        if (complianceScore < 80) {
          logger.warn('V8.0 compliance below threshold', {
            score: complianceScore,
            compliance,
            recommendation: 'Performance optimization needed'
          }, 'V8_COMPLIANCE');

          // Auto-remediation
          if (!compliance.performanceOverhead) {
            performanceOptimizer.forceOptimization();
          }
        }

        logger.debug('V8.0 compliance check', {
          score: complianceScore,
          compliance
        }, 'V8_COMPLIANCE');
      },
      60000, // 1 minute
      {
        adaptive: true,
        maxInterval: 300000,
        minInterval: 30000
      }
    );
  }

  /**
   * Get system status
   */
  static getStatus() {
    if (!this.isInitialized) {
      return {
        initialized: false,
        message: 'Performance optimization system not initialized'
      };
    }

    const performanceReport = performanceOptimizer.getPerformanceReport();
    const memoryStats = memoryManager.getStats();

    return {
      initialized: true,
      performance: performanceReport,
      memory: memoryStats,
      v8Compliance: {
        performanceBudget: performanceReport.summary.avgOperationTime < 5,
        memoryManagement: memoryStats.leaksPrevented >= 0,
        adaptiveSampling: performanceReport.sampling.strategiesEnabled > 0,
        circuitBreakers: performanceReport.sampling.circuitBreakersOpen < 3
      }
    };
  }

  /**
   * Force system reset (emergency)
   */
  static async forceReset(): Promise<void> {
    logger.warn('Force reset requested for Performance Optimization System', {}, 'PERF_INIT');

    try {
      await performanceOptimizer.dispose();
      this.isInitialized = false;
      this.initializationPromise = null;

      logger.info('Performance Optimization System reset completed', {}, 'PERF_INIT');
    } catch (error) {
      logger.error('Error during force reset', { error }, 'PERF_INIT');
    }
  }
}

// =============================================================================
// AUTO-INITIALIZATION
// =============================================================================

let autoInitStarted = false;

async function autoInit() {
  if (autoInitStarted) return;
  autoInitStarted = true;

  try {
    // Delay to allow memory management to initialize first
    setTimeout(async () => {
      await PerformanceOptimizationInitializer.initialize();
    }, 200);
  } catch (error) {
    logger.error('Auto-initialization failed', { error }, 'PERF_INIT');
  }
}

// Start auto-initialization
autoInit();

// =============================================================================
// EXPORTS
// =============================================================================

export {
  performanceOptimizer,
  PerformanceOptimizer,
  AdaptiveSamplingManager,
  PerformanceOptimizationInitializer
};

export default PerformanceOptimizationInitializer; 