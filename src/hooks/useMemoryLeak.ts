/**
 * 🧠 MEMORY LEAK DETECTION HOOK
 * React hook para detectar e prevenir vazamentos de memória
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { logger } from '../utils/logger';
import { performanceService } from '../services/performance';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface MemoryLeakDetectionOptions {
  enabled?: boolean;
  checkInterval?: number; // milliseconds
  componentName?: string;
  warnThreshold?: number; // MB
  errorThreshold?: number; // MB
  onMemoryLeak?: (leak: MemoryLeakInfo) => void;
}

export interface MemoryLeakInfo {
  componentName: string;
  memoryUsed: number;
  memoryDelta: number;
  timestamp: number;
  severity: 'warn' | 'error';
  suggestions: string[];
}

export interface ComponentMemoryStats {
  initialMemory: number;
  currentMemory: number;
  peakMemory: number;
  allocations: number;
  leaksPrevented: number;
}

// =============================================================================
// MEMORY LEAK DETECTION HOOK
// =============================================================================

export function useMemoryLeak(options: MemoryLeakDetectionOptions = {}) {
  const {
    enabled = true,
    checkInterval = 10000, // 10 seconds
    componentName = 'UnknownComponent',
    warnThreshold = 10, // 10MB
    errorThreshold = 25, // 25MB
    onMemoryLeak,
  } = options;

  const memoryStatsRef = useRef<ComponentMemoryStats>({
    initialMemory: 0,
    currentMemory: 0,
    peakMemory: 0,
    allocations: 0,
    leaksPrevented: 0,
  });
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountTimeRef = useRef<number>(Date.now());
  const cleanupFunctionsRef = useRef<(() => void)[]>([]);

  /**
   * Get current memory usage in MB
   */
  const getCurrentMemory = useCallback((): number => {
    const memory = (performance as any).memory;
    if (!memory) return 0;
    return memory.usedJSHeapSize / (1024 * 1024); // Convert to MB
  }, []);

  /**
   * Check for memory leaks
   */
  const checkMemoryLeak = useCallback(() => {
    if (!enabled) return;

    const currentMemory = getCurrentMemory();
    const stats = memoryStatsRef.current;
    
    // Update stats
    stats.currentMemory = currentMemory;
    stats.peakMemory = Math.max(stats.peakMemory, currentMemory);
    stats.allocations++;

    // Calculate memory delta since mount
    const memoryDelta = currentMemory - stats.initialMemory;
    
    // Check thresholds
    let severity: 'warn' | 'error' | null = null;
    
    if (memoryDelta > errorThreshold) {
      severity = 'error';
    } else if (memoryDelta > warnThreshold) {
      severity = 'warn';
    }

    if (severity) {
      const leakInfo: MemoryLeakInfo = {
        componentName,
        memoryUsed: currentMemory,
        memoryDelta,
        timestamp: Date.now(),
        severity,
        suggestions: generateSuggestions(memoryDelta, severity),
      };

      // Log the leak
      const logLevel = severity === 'error' ? 'error' : 'warn';
      logger[logLevel]('Memory leak detected', {
        component: componentName,
        memoryUsed: `${currentMemory.toFixed(2)}MB`,
        memoryDelta: `+${memoryDelta.toFixed(2)}MB`,
        mountTime: Date.now() - mountTimeRef.current,
        severity,
      }, 'MEMORY_LEAK');

      // Record performance metric
      performanceService.recordMetric(
        `memory_leak_${componentName}`,
        memoryDelta,
        'bytes',
        'memory',
        {
          component: componentName,
          severity,
          suggestions: leakInfo.suggestions,
        }
      );

      // Call custom handler
      if (onMemoryLeak) {
        onMemoryLeak(leakInfo);
      }
    }
  }, [enabled, componentName, warnThreshold, errorThreshold, onMemoryLeak, getCurrentMemory]);

  /**
   * Register cleanup function
   */
  const addCleanup = useCallback((cleanupFn: () => void) => {
    cleanupFunctionsRef.current.push(cleanupFn);
    
    // Return unregister function
    return () => {
      const index = cleanupFunctionsRef.current.indexOf(cleanupFn);
      if (index > -1) {
        cleanupFunctionsRef.current.splice(index, 1);
      }
    };
  }, []);

  /**
   * Force garbage collection (development only)
   */
  const forceGC = useCallback(() => {
    if (typeof window !== 'undefined' && (window as any).gc) {
      (window as any).gc();
      logger.debug('Forced garbage collection', { component: componentName }, 'MEMORY_LEAK');
    } else {
      logger.warn('Garbage collection not available', { component: componentName }, 'MEMORY_LEAK');
    }
  }, [componentName]);

  /**
   * Get current memory stats
   */
  const getMemoryStats = useCallback((): ComponentMemoryStats => {
    return { ...memoryStatsRef.current };
  }, []);

  /**
   * Reset memory tracking
   */
  const resetMemoryTracking = useCallback(() => {
    const initialMemory = getCurrentMemory();
    memoryStatsRef.current = {
      initialMemory,
      currentMemory: initialMemory,
      peakMemory: initialMemory,
      allocations: 0,
      leaksPrevented: 0,
    };
    mountTimeRef.current = Date.now();
  }, [getCurrentMemory]);

  // Initialize memory tracking on mount
  useEffect(() => {
    if (!enabled) return;

    const initialMemory = getCurrentMemory();
    memoryStatsRef.current.initialMemory = initialMemory;
    memoryStatsRef.current.currentMemory = initialMemory;
    memoryStatsRef.current.peakMemory = initialMemory;

    logger.debug('Memory leak detection initialized', {
      component: componentName,
      initialMemory: `${initialMemory.toFixed(2)}MB`,
      checkInterval: `${checkInterval}ms`,
    }, 'MEMORY_LEAK');

    // Start periodic checks
    intervalRef.current = setInterval(checkMemoryLeak, checkInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, componentName, checkInterval, checkMemoryLeak, getCurrentMemory]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Run all registered cleanup functions
      cleanupFunctionsRef.current.forEach(cleanup => {
        try {
          cleanup();
          memoryStatsRef.current.leaksPrevented++;
        } catch (error: unknown) {
          logger.error('Error in cleanup function', {
            component: componentName,
            error: error instanceof Error ? error.message : 'Unknown',
          }, 'MEMORY_LEAK');
        }
      });

      // Clear cleanup array
      cleanupFunctionsRef.current = [];

      // Log final stats
      const stats = memoryStatsRef.current;
      const finalMemory = getCurrentMemory();
      const totalTime = Date.now() - mountTimeRef.current;

      logger.info('Component unmounted - Memory leak detection summary', {
        component: componentName,
        initialMemory: `${stats.initialMemory.toFixed(2)}MB`,
        finalMemory: `${finalMemory.toFixed(2)}MB`,
        peakMemory: `${stats.peakMemory.toFixed(2)}MB`,
        memoryDelta: `${(finalMemory - stats.initialMemory).toFixed(2)}MB`,
        totalTime: `${totalTime}ms`,
        allocations: stats.allocations,
        leaksPrevented: stats.leaksPrevented,
      }, 'MEMORY_LEAK');
    };
  }, [componentName, getCurrentMemory]);

  return {
    // Stats
    getMemoryStats,
    getCurrentMemory,
    
    // Actions
    checkMemoryLeak,
    forceGC,
    resetMemoryTracking,
    addCleanup,
    
    // Utilities
    isEnabled: enabled,
    componentName,
  };
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function generateSuggestions(memoryDelta: number, severity: 'warn' | 'error'): string[] {
  const suggestions: string[] = [];
  
  if (severity === 'error') {
    suggestions.push('Critical memory leak detected - immediate action required');
    suggestions.push('Check for unremoved event listeners');
    suggestions.push('Verify all subscriptions are cancelled in useEffect cleanup');
    suggestions.push('Look for circular references in object structures');
    suggestions.push('Consider using WeakMap/WeakSet for temporary references');
  } else {
    suggestions.push('Potential memory leak - monitor component');
    suggestions.push('Review useEffect dependencies and cleanup functions');
    suggestions.push('Check if large objects are being retained unnecessarily');
    suggestions.push('Consider memoization to prevent unnecessary re-renders');
  }
  
  if (memoryDelta > 50) {
    suggestions.push('Memory usage is extremely high - investigate large data structures');
  }
  
  return suggestions;
}

// =============================================================================
// HIGHER-ORDER COMPONENT
// =============================================================================

export function withMemoryLeakDetection<P extends object>(
  Component: React.ComponentType<P>,
  options?: MemoryLeakDetectionOptions
) {
  const WrappedComponent: React.FC<P> = (props: P) => {
    const memoryLeak = useMemoryLeak({
      componentName: Component.displayName || Component.name || 'WrappedComponent',
      ...options,
    });

    return React.createElement(Component, props);
  };

  WrappedComponent.displayName = `withMemoryLeakDetection(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// =============================================================================
// MEMORY MANAGEMENT UTILITIES
// =============================================================================

/**
 * Create a memory-safe event listener
 */
export function createSafeEventListener(
  target: EventTarget,
  event: string,
  handler: EventListener,
  options?: boolean | AddEventListenerOptions
): () => void {
  target.addEventListener(event, handler, options);
  
  return () => {
    target.removeEventListener(event, handler, options);
  };
}

/**
 * Create a memory-safe interval
 */
export function createSafeInterval(
  callback: () => void,
  delay: number
): () => void {
  const intervalId = setInterval(callback, delay);
  
  return () => {
    clearInterval(intervalId);
  };
}

/**
 * Create a memory-safe timeout
 */
export function createSafeTimeout(
  callback: () => void,
  delay: number
): () => void {
  const timeoutId = setTimeout(callback, delay);
  
  return () => {
    clearTimeout(timeoutId);
  };
}

/**
 * Create a memory-safe subscription
 */
export function createSafeSubscription<T>(
  subscribe: (callback: (value: T) => void) => () => void,
  callback: (value: T) => void
): () => void {
  return subscribe(callback);
}

export default useMemoryLeak; 