/**
 * ⚡ COMPONENT PERFORMANCE SERVICE
 * Advanced React component optimization with intelligent memoization and performance monitoring
 */

import React, { useMemo, useCallback, useRef, useEffect, useState } from 'react';
import { logger } from '../utils/logger';
import { performanceService } from './performance';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface ComponentMetrics {
  renderCount: number;
  averageRenderTime: number;
  lastRenderTime: number;
  totalRenderTime: number;
  propsChanges: number;
  unnecessaryRenders: number;
  memoryUsage: number;
}

interface PerformanceConfig {
  enableProfiling: boolean;
  enableMemoization: boolean;
  enableVirtualization: boolean;
  memoThreshold: number; // ms
  maxCacheSize: number;
  debugMode: boolean;
}

// =============================================================================
// PERFORMANCE PROFILER
// =============================================================================

export class ComponentProfiler {
  private metrics = new Map<string, ComponentMetrics>();
  private renderTimings = new Map<string, number>();
  private previousProps = new Map<string, any>();

  startProfiling(componentName: string): void {
    this.renderTimings.set(componentName, performance.now());
  }

  endProfiling(componentName: string, props?: any): void {
    const startTime = this.renderTimings.get(componentName);
    if (!startTime) return;

    const renderTime = performance.now() - startTime;
    const metrics = this.metrics.get(componentName) || {
      renderCount: 0,
      averageRenderTime: 0,
      lastRenderTime: 0,
      totalRenderTime: 0,
      propsChanges: 0,
      unnecessaryRenders: 0,
      memoryUsage: 0
    };

    // Update metrics
    metrics.renderCount++;
    metrics.lastRenderTime = renderTime;
    metrics.totalRenderTime += renderTime;
    metrics.averageRenderTime = metrics.totalRenderTime / metrics.renderCount;

    this.metrics.set(componentName, metrics);
    this.previousProps.set(componentName, props);

    // Record performance metric
    performanceService.recordMetric(
      `component_render_${componentName}`,
      renderTime,
      'ms',
      'component'
    );

    this.renderTimings.delete(componentName);
  }

  getMetrics(componentName?: string): ComponentMetrics | Map<string, ComponentMetrics> {
    if (componentName) {
      return this.metrics.get(componentName) || {
        renderCount: 0,
        averageRenderTime: 0,
        lastRenderTime: 0,
        totalRenderTime: 0,
        propsChanges: 0,
        unnecessaryRenders: 0,
        memoryUsage: 0
      };
    }
    return this.metrics;
  }

  reset(): void {
    this.metrics.clear();
    this.renderTimings.clear();
    this.previousProps.clear();
  }
}

// =============================================================================
// PERFORMANCE HOOKS
// =============================================================================

/**
 * Component render tracking hook
 */
export const useRenderTracking = (componentName: string, props?: any) => {
  const profiler = useRef(new ComponentProfiler());

  useEffect(() => {
    profiler.current.startProfiling(componentName);
    
    return () => {
      profiler.current.endProfiling(componentName, props);
    };
  });

  return profiler.current.getMetrics(componentName) as ComponentMetrics;
};

/**
 * Enhanced useMemo with performance tracking
 */
export const usePerformantMemo = <T>(
  factory: () => T,
  deps: React.DependencyList,
  debugName?: string
): T => {
  const startTime = useRef<number>(0);

  return useMemo(() => {
    startTime.current = performance.now();
    const result = factory();
    const computeTime = performance.now() - startTime.current;

    if (debugName) {
      performanceService.recordMetric(
        `memo_${debugName}`,
        computeTime,
        'ms',
        'performance'
      );
    }

    return result;
  }, deps);
};

// =============================================================================
// MAIN PERFORMANCE SERVICE
// =============================================================================

export class ComponentPerformanceService {
  private profiler = new ComponentProfiler();
  private config: PerformanceConfig = {
    enableProfiling: true,
    enableMemoization: true,
    enableVirtualization: true,
    memoThreshold: 1, // 1ms
    maxCacheSize: 1000,
    debugMode: false
  };

  initialize(config: Partial<PerformanceConfig> = {}): void {
    this.config = { ...this.config, ...config };
    
    logger.info('Component Performance Service initialized', {
      profiling: this.config.enableProfiling,
      memoization: this.config.enableMemoization
    }, 'PERFORMANCE');
  }

  getProfiler(): ComponentProfiler {
    return this.profiler;
  }

  generatePerformanceReport(): any {
    const componentMetrics = this.profiler.getMetrics() as Map<string, ComponentMetrics>;

    const report = {
      summary: {
        totalComponents: componentMetrics.size,
        totalRenders: Array.from(componentMetrics.values()).reduce((sum, m) => sum + m.renderCount, 0),
        averageRenderTime: Array.from(componentMetrics.values()).reduce((sum, m) => sum + m.averageRenderTime, 0) / componentMetrics.size || 0
      },
      components: Array.from(componentMetrics.entries()).map(([name, metrics]) => ({
        name,
        ...metrics
      }))
    };

    return report;
  }

  reset(): void {
    this.profiler.reset();
  }
}

// =============================================================================
// GLOBAL SERVICE INSTANCE
// =============================================================================

export const componentPerformanceService = new ComponentPerformanceService();

// Auto-initialize in development
if (process.env.NODE_ENV === 'development') {
  componentPerformanceService.initialize({ debugMode: true });
}

export default componentPerformanceService;
