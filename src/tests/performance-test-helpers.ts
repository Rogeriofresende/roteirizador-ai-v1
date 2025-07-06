// Performance testing utilities
export interface PerformanceMetrics {
  renderTime: number;
  memoryUsed: number;
  componentCount: number;
  reRenderCount: number;
}

export interface MemoryLeakResult {
  initialMemory: number;
  finalMemory: number;
  leaked: boolean;
  leakSize: number;
}

// Performance monitoring helper
export class PerformanceMonitor {
  private startTime: number = 0;
  private startMemory: number = 0;
  private renderCount: number = 0;

  start() {
    this.startTime = performance.now();
    this.startMemory = this.getCurrentMemory();
    this.renderCount = 0;
  }

  recordRender() {
    this.renderCount++;
  }

  getMetrics(): PerformanceMetrics {
    return {
      renderTime: performance.now() - this.startTime,
      memoryUsed: this.getCurrentMemory() - this.startMemory,
      componentCount: document.querySelectorAll('[data-testid]').length,
      reRenderCount: this.renderCount
    };
  }

  private getCurrentMemory(): number {
    // Use performance.memory if available (Chrome DevTools)
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    // Fallback for other browsers
    return 0;
  }
}

// Memory leak detection
export class MemoryLeakDetector {
  private initialMemory: number = 0;
  private threshold: number;

  constructor(thresholdMB: number = 5) {
    this.threshold = thresholdMB * 1024 * 1024; // Convert MB to bytes
  }

  startMonitoring(): void {
    // Force garbage collection if available (requires --expose-gc flag)
    if (global.gc) {
      global.gc();
    }
    this.initialMemory = this.getCurrentMemory();
  }

  async detectLeaks(iterations: number = 10): Promise<MemoryLeakResult> {
    const finalMemory = this.getCurrentMemory();
    const memoryDiff = finalMemory - this.initialMemory;
    
    return {
      initialMemory: this.initialMemory,
      finalMemory,
      leaked: memoryDiff > this.threshold,
      leakSize: memoryDiff
    };
  }

  private getCurrentMemory(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }
}

// Load testing helper
export const loadTest = async (
  renderFunction: () => Promise<void>,
  iterations: number = 100
): Promise<PerformanceMetrics[]> => {
  const results: PerformanceMetrics[] = [];
  
  for (let i = 0; i < iterations; i++) {
    const monitor = new PerformanceMonitor();
    monitor.start();
    
    try {
      await renderFunction();
      results.push(monitor.getMetrics());
    } catch (error: unknown) {
      console.error(`Load test iteration ${i} failed:`, error);
    }
  }
  
  return results;
};

// Component stress testing
export const stressTestComponent = async (
  component: React.ComponentType<any>,
  propsVariations: unknown[],
  renderFunction: (Component: React.ComponentType<any>, props: any) => Promise<void>
): Promise<{ passed: number; failed: number; errors: Error[] }> => {
  let passed = 0;
  let failed = 0;
  const errors: Error[] = [];

  for (const props of propsVariations) {
    try {
      await renderFunction(component, props);
      passed++;
    } catch (error: unknown) {
      failed++;
      errors.push(error as Error);
    }
  }

  return { passed, failed, errors };
};

// Async operation timeout helper
export const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number = 5000,
  errorMessage?: string
): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(errorMessage || `Operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    promise
      .then(resolve)
      .catch(reject)
      .finally(() => clearTimeout(timeout));
  });
};

// Test data generator for consistent testing
export const generateTestData = {
  user: (overrides: Partial<any> = {}) => ({
    id: Math.random().toString(36).substr(2, 9),
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    ...overrides
  }),
  
  itinerary: (overrides: Partial<any> = {}) => ({
    id: Math.random().toString(36).substr(2, 9),
    title: 'Test Itinerary',
    description: 'Test description',
    created_at: new Date().toISOString(),
    ...overrides
  }),
  
  largeDataset: (size: number = 100) => {
    return Array.from({ length: size }, (_, index) => ({
      id: index,
      name: `Item ${index}`,
      value: Math.random() * 100,
      timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString()
    }));
  }
};

// Browser compatibility testing helper
export const getBrowserCapabilities = () => {
  return {
    supportsIntersectionObserver: 'IntersectionObserver' in window,
    supportsResizeObserver: 'ResizeObserver' in window,
    supportsWebGL: !!document.createElement('canvas').getContext('webgl'),
    supportsLocalStorage: (() => {
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
      } catch {
        return false;
      }
    })(),
    supportsServiceWorker: 'serviceWorker' in navigator,
    userAgent: navigator.userAgent
  };
}; 