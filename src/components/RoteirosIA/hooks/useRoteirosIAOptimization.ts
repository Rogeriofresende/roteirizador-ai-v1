/**
 * 🚀 HOOK DE OTIMIZAÇÃO - ROTEIROS IA V9.0
 * 
 * Hook customizado para otimizações de performance do sistema Roteiros IA
 * Inclui lazy loading, cache, preload inteligente e bundle optimization
 * 
 * @methodology V9.0_NATURAL_LANGUAGE_FIRST
 * @specification ROIA-GR-001
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { ScriptConfig, GeneratedScript } from '../ScriptGeneratorEngine';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  cacheHitRate: number;
}

interface OptimizationConfig {
  enableCache: boolean;
  enablePreload: boolean;
  enableLazyLoading: boolean;
  maxCacheSize: number;
  preloadDelay: number;
}

interface CachedScript {
  script: GeneratedScript;
  timestamp: number;
  accessCount: number;
}

// ============================================================================
// CACHE MANAGEMENT
// ============================================================================

class RoteirosIACache {
  private cache = new Map<string, CachedScript>();
  private maxSize: number;

  constructor(maxSize = 50) {
    this.maxSize = maxSize;
  }

  private generateKey(config: ScriptConfig): string {
    return `${config.title}-${config.genre}-${config.audience}-${config.duration}-${config.format}-${config.tone}`;
  }

  set(config: ScriptConfig, script: GeneratedScript): void {
    const key = this.generateKey(config);
    
    // Remove oldest if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = Array.from(this.cache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0][0];
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      script,
      timestamp: Date.now(),
      accessCount: 1
    });
  }

  get(config: ScriptConfig): GeneratedScript | null {
    const key = this.generateKey(config);
    const cached = this.cache.get(key);
    
    if (cached) {
      // Update access count and timestamp
      cached.accessCount++;
      cached.timestamp = Date.now();
      return cached.script;
    }
    
    return null;
  }

  has(config: ScriptConfig): boolean {
    return this.cache.has(this.generateKey(config));
  }

  clear(): void {
    this.cache.clear();
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      entries: Array.from(this.cache.entries()).map(([key, value]) => ({
        key,
        accessCount: value.accessCount,
        age: Date.now() - value.timestamp
      }))
    };
  }
}

// ============================================================================
// PRELOADER
// ============================================================================

class ComponentPreloader {
  private preloadedComponents = new Set<string>();

  async preloadComponent(componentName: string): Promise<boolean> {
    if (this.preloadedComponents.has(componentName)) {
      return true;
    }

    try {
      switch (componentName) {
        case 'ScriptWizard':
          await import('../ScriptWizard');
          break;
        case 'ScriptExporter':
          await import('../ScriptExporter');
          break;
        case 'ExpansionPack':
          await import('../ExpansionPack');
          break;
        case 'MetricsDashboard':
          await import('../MetricsDashboard');
          break;
        default:
          return false;
      }

      this.preloadedComponents.add(componentName);
      return true;
    } catch (error) {
      console.warn(`Failed to preload component ${componentName}:`, error);
      return false;
    }
  }

  async preloadAllComponents(): Promise<void> {
    const components = ['ScriptWizard', 'ScriptExporter', 'ExpansionPack', 'MetricsDashboard'];
    await Promise.allSettled(
      components.map(component => this.preloadComponent(component))
    );
  }

  isPreloaded(componentName: string): boolean {
    return this.preloadedComponents.has(componentName);
  }
}

// ============================================================================
// PERFORMANCE MONITOR
// ============================================================================

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    cacheHitRate: 0
  };

  private startTimes = new Map<string, number>();

  startTimer(operation: string): void {
    this.startTimes.set(operation, performance.now());
  }

  endTimer(operation: string): number {
    const startTime = this.startTimes.get(operation);
    if (!startTime) return 0;

    const duration = performance.now() - startTime;
    this.startTimes.delete(operation);

    switch (operation) {
      case 'load':
        this.metrics.loadTime = duration;
        break;
      case 'render':
        this.metrics.renderTime = duration;
        break;
    }

    return duration;
  }

  updateMemoryUsage(): void {
    if ('memory' in performance) {
      this.metrics.memoryUsage = (performance as any).memory.usedJSHeapSize;
    }
  }

  updateCacheHitRate(hits: number, total: number): void {
    this.metrics.cacheHitRate = total > 0 ? (hits / total) * 100 : 0;
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }
}

// ============================================================================
// MAIN OPTIMIZATION HOOK
// ============================================================================

export const useRoteirosIAOptimization = (
  config: OptimizationConfig = {
    enableCache: true,
    enablePreload: true,
    enableLazyLoading: true,
    maxCacheSize: 50,
    preloadDelay: 2000
  }
) => {
  // ============================================================================
  // STATE & REFS
  // ============================================================================
  
  const [isOptimized, setIsOptimized] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    cacheHitRate: 0
  });

  const cacheRef = useRef<RoteirosIACache>();
  const preloaderRef = useRef<ComponentPreloader>();
  const monitorRef = useRef<PerformanceMonitor>();
  const cacheHits = useRef(0);
  const cacheTotal = useRef(0);

  // ============================================================================
  // INITIALIZATION
  // ============================================================================
  
  useEffect(() => {
    cacheRef.current = new RoteirosIACache(config.maxCacheSize);
    preloaderRef.current = new ComponentPreloader();
    monitorRef.current = new PerformanceMonitor();

    monitorRef.current.startTimer('load');

    const initialize = async () => {
      // Preload components after delay
      if (config.enablePreload) {
        setTimeout(async () => {
          await preloaderRef.current?.preloadAllComponents();
          setIsOptimized(true);
        }, config.preloadDelay);
      } else {
        setIsOptimized(true);
      }

      // Update performance metrics periodically
      const metricsInterval = setInterval(() => {
        if (monitorRef.current) {
          monitorRef.current.updateMemoryUsage();
          monitorRef.current.updateCacheHitRate(cacheHits.current, cacheTotal.current);
          setMetrics(monitorRef.current.getMetrics());
        }
      }, 5000);

      return () => clearInterval(metricsInterval);
    };

    const cleanup = initialize();

    return () => {
      cleanup.then(cleanupFn => cleanupFn?.());
      monitorRef.current?.endTimer('load');
    };
  }, [config]);

  // ============================================================================
  // CACHE OPERATIONS
  // ============================================================================
  
  const getCachedScript = useCallback((scriptConfig: ScriptConfig): GeneratedScript | null => {
    if (!config.enableCache || !cacheRef.current) return null;

    cacheTotal.current++;
    const cached = cacheRef.current.get(scriptConfig);
    
    if (cached) {
      cacheHits.current++;
      return cached;
    }
    
    return null;
  }, [config.enableCache]);

  const setCachedScript = useCallback((scriptConfig: ScriptConfig, script: GeneratedScript): void => {
    if (!config.enableCache || !cacheRef.current) return;
    
    cacheRef.current.set(scriptConfig, script);
  }, [config.enableCache]);

  const clearCache = useCallback((): void => {
    if (cacheRef.current) {
      cacheRef.current.clear();
      cacheHits.current = 0;
      cacheTotal.current = 0;
    }
  }, []);

  const getCacheStats = useCallback(() => {
    return cacheRef.current?.getStats() || { size: 0, maxSize: 0, entries: [] };
  }, []);

  // ============================================================================
  // PRELOADING OPERATIONS
  // ============================================================================
  
  const preloadComponent = useCallback(async (componentName: string): Promise<boolean> => {
    if (!config.enablePreload || !preloaderRef.current) return false;
    
    return preloaderRef.current.preloadComponent(componentName);
  }, [config.enablePreload]);

  const isComponentPreloaded = useCallback((componentName: string): boolean => {
    return preloaderRef.current?.isPreloaded(componentName) || false;
  }, []);

  // ============================================================================
  // PERFORMANCE OPERATIONS
  // ============================================================================
  
  const startPerformanceTimer = useCallback((operation: string): void => {
    monitorRef.current?.startTimer(operation);
  }, []);

  const endPerformanceTimer = useCallback((operation: string): number => {
    return monitorRef.current?.endTimer(operation) || 0;
  }, []);

  // ============================================================================
  // OPTIMIZED SCRIPT GENERATION
  // ============================================================================
  
  const optimizedScriptGeneration = useCallback(async (
    scriptConfig: ScriptConfig,
    generateFunction: (config: ScriptConfig) => Promise<GeneratedScript>
  ): Promise<GeneratedScript> => {
    // Check cache first
    const cachedScript = getCachedScript(scriptConfig);
    if (cachedScript) {
      return cachedScript;
    }

    // Start performance monitoring
    startPerformanceTimer('generation');

    try {
      // Generate new script
      const script = await generateFunction(scriptConfig);
      
      // Cache the result
      setCachedScript(scriptConfig, script);
      
      return script;
    } finally {
      endPerformanceTimer('generation');
    }
  }, [getCachedScript, setCachedScript, startPerformanceTimer, endPerformanceTimer]);

  // ============================================================================
  // MEMOIZED VALUES
  // ============================================================================
  
  const optimizationStats = useMemo(() => ({
    isOptimized,
    cacheEnabled: config.enableCache,
    preloadEnabled: config.enablePreload,
    lazyLoadingEnabled: config.enableLazyLoading,
    cacheStats: getCacheStats(),
    performance: metrics
  }), [isOptimized, config, getCacheStats, metrics]);

  // ============================================================================
  // RETURN INTERFACE
  // ============================================================================
  
  return {
    // Cache operations
    getCachedScript,
    setCachedScript,
    clearCache,
    getCacheStats,
    
    // Preloading operations
    preloadComponent,
    isComponentPreloaded,
    
    // Performance monitoring
    startPerformanceTimer,
    endPerformanceTimer,
    metrics,
    
    // Optimized operations
    optimizedScriptGeneration,
    
    // Stats and status
    optimizationStats,
    isOptimized
  };
};

export default useRoteirosIAOptimization;