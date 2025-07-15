/**
 * 🚀 V8.0 UNIFIED - IA ALPHA PRIORITY 1 CORRECTIONS
 * MEMORY MANAGEMENT SYSTEM INITIALIZATION
 * 
 * @description Auto-initialization of memory management with critical fixes
 * @author IA Alpha - V8.0 Memory Management Specialist
 * @created 2025-01-16
 * @methodology V8.0_UNIFIED_DEVELOPMENT
 */

import { memoryManager, WeakMemoryManager } from './WeakMemoryManager';
import { applyAllCriticalFixes, ServiceMigrationHelper } from './ServiceMigrationHelper';
import { logger } from '../../lib/logger';

// =============================================================================
// AUTO-INITIALIZATION
// =============================================================================

class MemoryManagementInitializer {
  private static isInitialized = false;
  private static initializationPromise: Promise<void> | null = null;

  /**
   * Initialize memory management system automatically
   */
  static async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.performInitialization();
    return this.initializationPromise;
  }

  private static async performInitialization(): Promise<void> {
    try {
      logger.info('🚀 Initializing V8.0 Memory Management System...', {}, 'MEMORY_INIT');

      // Step 1: Initialize core memory manager
      await memoryManager.initialize();
      
      // Step 2: Apply critical fixes to existing services
      await applyAllCriticalFixes();
      
      // Step 3: Setup global error handling
      this.setupGlobalErrorHandling();
      
      // Step 4: Start health monitoring
      this.startHealthMonitoring();

      this.isInitialized = true;

      const stats = ServiceMigrationHelper.getStats();
      const memoryStats = memoryManager.getStats();

      logger.info('✅ V8.0 Memory Management System initialized successfully', {
        migrationStats: stats,
        memoryStats,
        features: [
          'WeakRef Memory Management',
          'Adaptive Intervals',
          'Global Cleanup Protocols',
          'Service Migration Helper',
          'Automatic Leak Prevention'
        ]
      }, 'MEMORY_INIT');

    } catch (error) {
      logger.error('❌ Failed to initialize Memory Management System', { error }, 'MEMORY_INIT');
      throw error;
    }
  }

  /**
   * Setup global error handling for memory management
   */
  private static setupGlobalErrorHandling(): void {
    if (typeof window !== 'undefined') {
      // Handle uncaught errors that might indicate memory issues
      window.addEventListener('error', (event) => {
        if (event.message?.includes('memory') || event.message?.includes('heap')) {
          logger.warn('Potential memory-related error detected', {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno
          }, 'MEMORY_ERROR_HANDLER');

          // Force cleanup on memory errors
          memoryManager.forceCleanup();
        }
      });

      // Handle unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        if (event.reason?.message?.includes('memory')) {
          logger.warn('Memory-related promise rejection detected', {
            reason: event.reason
          }, 'MEMORY_ERROR_HANDLER');

          memoryManager.forceCleanup();
        }
      });
    }
  }

  /**
   * Start periodic health monitoring
   */
  private static startHealthMonitoring(): void {
    memoryManager.createAdaptiveInterval(
      'health_monitor',
      () => {
        const stats = memoryManager.getStats();
        const migrationStats = ServiceMigrationHelper.getStats();

        // Log health stats periodically
        logger.debug('Memory Management Health Check', {
          memoryStats: stats,
          migrationStats,
          timestamp: new Date().toISOString()
        }, 'MEMORY_HEALTH');

        // Check for potential issues
        if (stats.totalMemoryUsage > 0) {
          const memoryPercent = ('memory' in performance) ? 
            ((performance as any).memory.usedJSHeapSize / (performance as any).memory.jsHeapSizeLimit) * 100 : 
            0;

          if (memoryPercent > 90) {
            logger.warn('Critical memory usage detected', {
              memoryPercent: memoryPercent.toFixed(2),
              leaksPrevented: stats.leaksPrevented
            }, 'MEMORY_HEALTH');

            // Emergency cleanup
            memoryManager.forceCleanup();
          }
        }
      },
      60000, // 1 minute
      {
        adaptive: true,
        maxInterval: 300000, // Max 5 minutes
        minInterval: 30000   // Min 30 seconds
      }
    );
  }

  /**
   * Get initialization status
   */
  static getStatus() {
    return {
      isInitialized: this.isInitialized,
      memoryStats: this.isInitialized ? memoryManager.getStats() : null,
      migrationStats: this.isInitialized ? ServiceMigrationHelper.getStats() : null
    };
  }

  /**
   * Force cleanup and reset (for emergencies)
   */
  static async forceReset(): Promise<void> {
    logger.warn('Force reset requested for Memory Management System', {}, 'MEMORY_INIT');

    try {
      await memoryManager.dispose();
      ServiceMigrationHelper.reset();
      this.isInitialized = false;
      this.initializationPromise = null;

      logger.info('Memory Management System reset completed', {}, 'MEMORY_INIT');
    } catch (error) {
      logger.error('Error during force reset', { error }, 'MEMORY_INIT');
    }
  }
}

// =============================================================================
// AUTO-START ON IMPORT
// =============================================================================

// Automatically initialize when this module is imported
let autoInitStarted = false;

async function autoInit() {
  if (autoInitStarted) return;
  autoInitStarted = true;

  try {
    // Small delay to allow other systems to initialize first
    setTimeout(async () => {
      await MemoryManagementInitializer.initialize();
    }, 100);
  } catch (error) {
    logger.error('Auto-initialization failed', { error }, 'MEMORY_INIT');
  }
}

// Start auto-initialization
autoInit();

// =============================================================================
// EXPORTS
// =============================================================================

export { 
  memoryManager, 
  WeakMemoryManager,
  ServiceMigrationHelper,
  applyAllCriticalFixes,
  MemoryManagementInitializer
};

export default MemoryManagementInitializer; 