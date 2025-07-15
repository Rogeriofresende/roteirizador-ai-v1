/**
 * 🚀 V8.0 UNIFIED - IA ALPHA PRIORITY 1 CORRECTIONS
 * ADVANCED MEMORY MANAGEMENT SYSTEM
 * 
 * @description WeakMap/WeakRef-based memory management to prevent leaks
 * @author IA Alpha - V8.0 Memory Management Specialist
 * @created 2025-01-16
 * @methodology V8.0_UNIFIED_DEVELOPMENT
 */

import { logger } from '../../lib/logger';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface CleanupTask {
  id: string;
  cleanup: () => Promise<void> | void;
  priority: 'high' | 'medium' | 'low';
  created: number;
  lastExecuted?: number;
}

interface MemoryStats {
  weakRefs: number;
  cleanupTasks: number;
  intervalManagers: number;
  observerManagers: number;
  totalMemoryUsage: number;
  leaksPrevented: number;
}

interface IntervalConfig {
  interval: number;
  adaptive: boolean;
  maxInterval: number;
  minInterval: number;
  backoffMultiplier: number;
}

// =============================================================================
// WEAK REFERENCE MANAGER
// =============================================================================

class WeakReferenceManager {
  private weakRefs = new Set<WeakRef<any>>();
  private cleanupTasks = new Map<string, CleanupTask>();
  private cleanupScheduled = false;

  createWeakRef<T extends object>(
    target: T, 
    cleanupCallback?: () => void
  ): WeakRef<T> {
    const weakRef = new WeakRef(target);
    this.weakRefs.add(weakRef);

    if (cleanupCallback) {
      const taskId = this.generateId();
      this.cleanupTasks.set(taskId, {
        id: taskId,
        cleanup: cleanupCallback,
        priority: 'medium',
        created: Date.now()
      });
    }

    this.scheduleCleanup();
    return weakRef;
  }

  registerCleanup(
    id: string, 
    cleanup: () => Promise<void> | void, 
    priority: 'high' | 'medium' | 'low' = 'medium'
  ): void {
    this.cleanupTasks.set(id, {
      id,
      cleanup,
      priority,
      created: Date.now()
    });
  }

  async executeCleanup(): Promise<void> {
    const deadRefs = [];
    for (const weakRef of this.weakRefs) {
      if (!weakRef.deref()) {
        deadRefs.push(weakRef);
      }
    }

    deadRefs.forEach(ref => this.weakRefs.delete(ref));

    const tasks = Array.from(this.cleanupTasks.values())
      .sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });

    for (const task of tasks) {
      try {
        await Promise.resolve(task.cleanup());
        task.lastExecuted = Date.now();
      } catch (error) {
        logger.error('Cleanup task failed', { taskId: task.id, error }, 'WEAK_MEMORY_MANAGER');
      }
    }

    this.cleanupScheduled = false;
  }

  private scheduleCleanup(): void {
    if (this.cleanupScheduled) return;
    this.cleanupScheduled = true;
    queueMicrotask(async () => {
      await this.executeCleanup();
    });
  }

  private generateId(): string {
    return `cleanup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getStats(): Partial<MemoryStats> {
    return {
      weakRefs: this.weakRefs.size,
      cleanupTasks: this.cleanupTasks.size
    };
  }
}

// =============================================================================
// ADAPTIVE INTERVAL MANAGER
// =============================================================================

class AdaptiveIntervalManager {
  private intervals = new Map<string, {
    id: number;
    config: IntervalConfig;
    callback: () => void;
    executionTimes: number[];
    errors: number;
  }>();

  createAdaptiveInterval(
    id: string,
    callback: () => void,
    config: IntervalConfig
  ): void {
    if (this.intervals.has(id)) {
      this.clearInterval(id);
    }

    const intervalData = {
      id: 0,
      config,
      callback,
      executionTimes: [],
      errors: 0
    };

    const adaptiveCallback = () => {
      const startTime = performance.now();

      try {
        callback();
        intervalData.errors = Math.max(0, intervalData.errors - 1);
      } catch (error) {
        intervalData.errors++;
        logger.error('Adaptive interval callback error', { id, errors: intervalData.errors }, 'ADAPTIVE_INTERVAL');
      }

      const executionTime = performance.now() - startTime;
      intervalData.executionTimes.push(executionTime);

      if (intervalData.executionTimes.length > 10) {
        intervalData.executionTimes.shift();
      }

      if (config.adaptive) {
        this.adjustInterval(id, intervalData);
      }
    };

    intervalData.id = window.setInterval(adaptiveCallback, config.interval);
    this.intervals.set(id, intervalData);
  }

  private adjustInterval(id: string, data: any): void {
    if (data.executionTimes.length < 3) return;

    const avgTime = data.executionTimes.reduce((a, b) => a + b, 0) / data.executionTimes.length;
    const currentInterval = data.config.interval;
    let newInterval = currentInterval;

    if (avgTime < 5 && data.errors === 0) {
      newInterval = Math.max(data.config.minInterval, currentInterval * 0.9);
    } else if (avgTime > 20 || data.errors > 0) {
      newInterval = Math.min(data.config.maxInterval, currentInterval * data.config.backoffMultiplier);
    }

    if (newInterval !== currentInterval) {
      data.config.interval = newInterval;
      this.clearInterval(id);
      this.createAdaptiveInterval(id, data.callback, data.config);
    }
  }

  clearInterval(id: string): void {
    const intervalData = this.intervals.get(id);
    if (intervalData) {
      window.clearInterval(intervalData.id);
      this.intervals.delete(id);
    }
  }

  clearAllIntervals(): void {
    this.intervals.forEach((data, id) => {
      window.clearInterval(data.id);
    });
    this.intervals.clear();
  }

  getStats(): Partial<MemoryStats> {
    return {
      intervalManagers: this.intervals.size
    };
  }
}

// =============================================================================
// MAIN WEAK MEMORY MANAGER
// =============================================================================

export class WeakMemoryManager {
  private static instance: WeakMemoryManager;
  private weakRefManager = new WeakReferenceManager();
  private intervalManager = new AdaptiveIntervalManager();
  private isInitialized = false;
  private leaksPrevented = 0;

  static getInstance(): WeakMemoryManager {
    if (!this.instance) {
      this.instance = new WeakMemoryManager();
    }
    return this.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.setupGlobalCleanup();
      this.startMemoryMonitoring();
      this.isInitialized = true;
      
      logger.info('WeakMemoryManager initialized', {
        features: ['WeakRef', 'AdaptiveIntervals']
      }, 'WEAK_MEMORY_MANAGER');

    } catch (error) {
      logger.error('Failed to initialize WeakMemoryManager', { error }, 'WEAK_MEMORY_MANAGER');
      throw error;
    }
  }

  createWeakRef<T extends object>(target: T, cleanupCallback?: () => void): WeakRef<T> {
    return this.weakRefManager.createWeakRef(target, cleanupCallback);
  }

  registerCleanup(
    id: string, 
    cleanup: () => Promise<void> | void, 
    priority: 'high' | 'medium' | 'low' = 'medium'
  ): void {
    this.weakRefManager.registerCleanup(id, cleanup, priority);
  }

  createAdaptiveInterval(
    id: string,
    callback: () => void,
    baseInterval: number,
    options: Partial<IntervalConfig> = {}
  ): void {
    const config: IntervalConfig = {
      interval: baseInterval,
      adaptive: true,
      maxInterval: options.maxInterval || baseInterval * 4,
      minInterval: options.minInterval || Math.max(1000, baseInterval / 4),
      backoffMultiplier: options.backoffMultiplier || 1.5,
      ...options
    };

    this.intervalManager.createAdaptiveInterval(id, callback, config);
  }

  clearInterval(id: string): void {
    this.intervalManager.clearInterval(id);
  }

  async forceCleanup(): Promise<void> {
    await this.weakRefManager.executeCleanup();
    this.leaksPrevented++;
  }

  private setupGlobalCleanup(): void {
    if (typeof window !== 'undefined') {
      const cleanup = async () => {
        await this.dispose();
      };

      window.addEventListener('beforeunload', cleanup);
      window.addEventListener('pagehide', cleanup);
      this.registerCleanup('global_cleanup', cleanup, 'high');
    }
  }

  private startMemoryMonitoring(): void {
    this.createAdaptiveInterval(
      'memory_monitor',
      () => {
        if ('memory' in performance) {
          const memory = (performance as any).memory;
          const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;

          if (usagePercent > 80) {
            this.forceCleanup();
          }
        }
      },
      30000,
      {
        maxInterval: 120000,
        minInterval: 10000
      }
    );
  }

  getStats(): MemoryStats {
    const weakRefStats = this.weakRefManager.getStats();
    const intervalStats = this.intervalManager.getStats();

    let totalMemoryUsage = 0;
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      totalMemoryUsage = memory.usedJSHeapSize;
    }

    return {
      weakRefs: weakRefStats.weakRefs || 0,
      cleanupTasks: weakRefStats.cleanupTasks || 0,
      intervalManagers: intervalStats.intervalManagers || 0,
      observerManagers: 0,
      totalMemoryUsage,
      leaksPrevented: this.leaksPrevented
    };
  }

  async dispose(): Promise<void> {
    if (!this.isInitialized) return;

    try {
      await this.weakRefManager.executeCleanup();
      this.intervalManager.clearAllIntervals();
      this.isInitialized = false;

      logger.info('WeakMemoryManager disposed', {
        leaksPrevented: this.leaksPrevented
      }, 'WEAK_MEMORY_MANAGER');

    } catch (error) {
      logger.error('Error disposing WeakMemoryManager', { error }, 'WEAK_MEMORY_MANAGER');
    }
  }
}

export const memoryManager = WeakMemoryManager.getInstance();
export default WeakMemoryManager; 