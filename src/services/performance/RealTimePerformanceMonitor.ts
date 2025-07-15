/**
 * 🔴 IA ALPHA - REAL-TIME PERFORMANCE MONITOR
 * Sistema avançado de monitoramento de performance com Web Vitals
 * 
 * Features:
 * - Core Web Vitals tracking
 * - Memory monitoring
 * - Bundle size analysis
 * - User interaction performance
 * - Real-time alerts
 * - Performance degradation detection
 */

interface PerformanceMetrics {
  // Core Web Vitals
  fcp?: number;  // First Contentful Paint
  lcp?: number;  // Largest Contentful Paint
  fid?: number;  // First Input Delay
  cls?: number;  // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
  
  // Custom metrics
  bundleSize?: number;
  memoryUsage?: {
    used: number;
    total: number;
    percentage: number;
  };
  
  // User experience
  interactionLatency?: number;
  scrollPerformance?: number;
  routeChangeTime?: number;
  
  // Timestamp
  timestamp: number;
  sessionId: string;
  url: string;
}

interface PerformanceAlert {
  type: 'warning' | 'critical';
  metric: string;
  value: number;
  threshold: number;
  message: string;
  timestamp: number;
}

class RealTimePerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private alerts: PerformanceAlert[] = [];
  private sessionId: string;
  private isMonitoring: boolean = false;
  private observers: Map<string, PerformanceObserver> = new Map();
  // 🔧 ALPHA FIX: Alert throttling to prevent spam
  private lastAlertTime: Map<string, number> = new Map();
  
  // Performance thresholds (baseados em Core Web Vitals)
  private readonly thresholds = {
    fcp: 1800,      // Good: <1.8s
    lcp: 2500,      // Good: <2.5s
    fid: 100,       // Good: <100ms
    cls: 0.1,       // Good: <0.1
    ttfb: 600,      // Good: <600ms
    memoryUsage: 85, // 🔧 ALPHA FIX: Ajustado para desenvolvimento (80% → 85%)
    interactionLatency: 100 // 🔧 ALPHA FIX: Aumentado para desenvolvimento (50ms → 100ms)
  };

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeMonitoring();
  }

  /**
   * Inicializa o monitoramento de performance
   */
  public async initializeMonitoring(): Promise<void> {
    try {
      this.isMonitoring = true;
      
      // Core Web Vitals monitoring
      await this.setupWebVitalsMonitoring();
      
      // Memory monitoring
      this.setupMemoryMonitoring();
      
      // User interaction monitoring
      this.setupInteractionMonitoring();
      
      // Route change monitoring
      this.setupRouteChangeMonitoring();
      
      // Periodic health checks
      this.startPeriodicHealthChecks();
      
      console.log('🔴 Alpha Performance Monitor: Initialized successfully');
      
    } catch (error) {
      console.error('Performance monitoring initialization failed:', error);
    }
  }

  /**
   * Setup Web Vitals monitoring usando PerformanceObserver
   */
  private async setupWebVitalsMonitoring(): Promise<void> {
    try {
      // First Contentful Paint
      this.createObserver('paint', (entries) => {
        for (const entry of entries.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.recordMetric('fcp', entry.startTime);
          }
        }
      });

      // Largest Contentful Paint
      this.createObserver('largest-contentful-paint', (entries) => {
        const lcpEntries = entries.getEntries();
        if (lcpEntries.length > 0) {
          const lastEntry = lcpEntries[lcpEntries.length - 1];
          this.recordMetric('lcp', lastEntry.renderTime || lastEntry.loadTime);
        }
      });

      // First Input Delay
      this.createObserver('first-input', (entries) => {
        for (const entry of entries.getEntries()) {
          this.recordMetric('fid', entry.processingStart - entry.startTime);
        }
      });

      // Cumulative Layout Shift
      this.createObserver('layout-shift', (entries) => {
        let clsValue = 0;
        for (const entry of entries.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        this.recordMetric('cls', clsValue);
      });

      // Navigation timing
      this.setupNavigationTiming();

    } catch (error) {
      console.error('Web Vitals monitoring setup failed:', error);
    }
  }

  /**
   * Cria um PerformanceObserver para tipo específico
   */
  private createObserver(type: string, callback: (entries: PerformanceObserverEntryList) => void): void {
    try {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver(callback);
        observer.observe({ type });
        this.observers.set(type, observer);
      }
    } catch (error) {
      console.warn(`Cannot observe ${type}:`, error);
    }
  }

  /**
   * Setup Navigation Timing para TTFB
   */
  private setupNavigationTiming(): void {
    if ('performance' in window && 'getEntriesByType' in performance) {
      const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navEntries.length > 0) {
        const entry = navEntries[0];
        this.recordMetric('ttfb', entry.responseStart - entry.requestStart);
      }
    }
  }

  /**
   * Setup monitoramento de memória
   */
  private setupMemoryMonitoring(): void {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        const memoryUsage = {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
        };
        
        this.recordMemoryMetric(memoryUsage);
        
        // 🔧 ALPHA FIX: Check for memory alerts with development awareness
        const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';
        const adjustedThreshold = isDevelopment ? this.thresholds.memoryUsage + 10 : this.thresholds.memoryUsage;
        
        if (memoryUsage.percentage > adjustedThreshold) {
          const severity = memoryUsage.percentage > 95 ? 'critical' : 'warning';
          this.createAlert(severity, 'memoryUsage', memoryUsage.percentage, adjustedThreshold, 
            `${isDevelopment ? 'Dev: ' : ''}High memory usage: ${memoryUsage.percentage.toFixed(2)}%`);
        }
      }, 30000); // 🔧 ALPHA FIX: Check every 30 seconds (was 10s) to reduce alert frequency
    }
  }

  /**
   * Setup monitoramento de interações do usuário
   */
  private setupInteractionMonitoring(): void {
    let interactionStart = 0;
    
    const measureInteraction = (event: Event) => {
      if (interactionStart > 0) {
        const latency = performance.now() - interactionStart;
        this.recordMetric('interactionLatency', latency);
        
        // 🔧 ALPHA FIX: Intelligent interaction monitoring for development
        const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';
        const adjustedThreshold = isDevelopment ? this.thresholds.interactionLatency + 50 : this.thresholds.interactionLatency;
        
        if (latency > adjustedThreshold) {
          const severity = latency > 200 ? 'critical' : 'warning';
          this.createAlert(severity, 'interactionLatency', latency, adjustedThreshold,
            `${isDevelopment ? 'Dev: ' : ''}Slow interaction detected: ${latency.toFixed(2)}ms`);
        }
      }
    };

    const startInteraction = () => {
      interactionStart = performance.now();
    };

    // Monitor click interactions
    document.addEventListener('mousedown', startInteraction);
    document.addEventListener('mouseup', measureInteraction);
    
    // Monitor keyboard interactions
    document.addEventListener('keydown', startInteraction);
    document.addEventListener('keyup', measureInteraction);
  }

  /**
   * Setup monitoramento de mudanças de rota
   */
  private setupRouteChangeMonitoring(): void {
    let routeChangeStart = 0;
    
    // Listen for route changes (for React Router)
    window.addEventListener('popstate', () => {
      routeChangeStart = performance.now();
    });
    
    // Detect when new route is fully loaded
    const observer = new MutationObserver(() => {
      if (routeChangeStart > 0) {
        const routeTime = performance.now() - routeChangeStart;
        this.recordMetric('routeChangeTime', routeTime);
        routeChangeStart = 0;
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * Inicia health checks periódicos
   */
  private startPeriodicHealthChecks(): void {
    setInterval(() => {
      this.performHealthCheck();
    }, 30000); // Every 30 seconds
  }

  /**
   * Realiza health check completo
   */
  private performHealthCheck(): void {
    const currentMetrics = this.getCurrentMetrics();
    
    // Check all thresholds
    Object.entries(this.thresholds).forEach(([metric, threshold]) => {
      const value = currentMetrics[metric as keyof PerformanceMetrics];
      if (typeof value === 'number' && value > threshold) {
        this.createAlert('warning', metric, value, threshold,
          `Performance degradation detected in ${metric}: ${value}`);
      }
    });
  }

  /**
   * Registra uma métrica de performance
   */
  private recordMetric(metric: keyof PerformanceMetrics, value: number): void {
    const currentMetrics = this.getCurrentMetrics();
    currentMetrics[metric] = value;
    
    // Store in metrics array
    this.metrics.push({ ...currentMetrics });
    
    // Keep only last 100 metrics
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
    
    // Emit event for real-time updates
    this.emitMetricUpdate(metric, value);
  }

  /**
   * Registra métrica de memória
   */
  private recordMemoryMetric(memoryUsage: PerformanceMetrics['memoryUsage']): void {
    const currentMetrics = this.getCurrentMetrics();
    currentMetrics.memoryUsage = memoryUsage;
    
    this.metrics.push({ ...currentMetrics });
    
    // 🔧 ALPHA FIX: Memory optimization - reduced from 100 to 50 metrics
    if (this.metrics.length > 50) {
      this.metrics = this.metrics.slice(-50);
    }
  }

  /**
   * Cria um alerta de performance
   */
  private createAlert(type: PerformanceAlert['type'], metric: string, value: number, threshold: number, message: string): void {
    // 🔧 ALPHA FIX: Throttle similar alerts to prevent spam
    const alertKey = `${type}-${metric}`;
    const now = Date.now();
    const lastAlert = this.lastAlertTime.get(alertKey) || 0;
    const throttlePeriod = metric === 'interactionLatency' ? 5000 : 30000; // 5s for interactions, 30s for others
    
    // Skip if same type of alert was created recently
    if (now - lastAlert < throttlePeriod) {
      return;
    }
    
    this.lastAlertTime.set(alertKey, now);
    
    const alert: PerformanceAlert = {
      type,
      metric,
      value,
      threshold,
      message,
      timestamp: now
    };
    
    this.alerts.push(alert);
    
    // Keep only last 50 alerts
    if (this.alerts.length > 50) {
      this.alerts = this.alerts.slice(-50);
    }
    
    // Emit alert event
    this.emitAlert(alert);
    
    // Console warning for development
    if (process.env.NODE_ENV === 'development') {
      console.warn(`🔴 Performance Alert [${type}]:`, message);
    }
  }

  /**
   * Emite evento de atualização de métrica
   */
  private emitMetricUpdate(metric: string, value: number): void {
    window.dispatchEvent(new CustomEvent('performance-metric-update', {
      detail: { metric, value, timestamp: Date.now() }
    }));
  }

  /**
   * Emite evento de alerta
   */
  private emitAlert(alert: PerformanceAlert): void {
    window.dispatchEvent(new CustomEvent('performance-alert', {
      detail: alert
    }));
  }

  /**
   * Retorna métricas atuais
   */
  private getCurrentMetrics(): PerformanceMetrics {
    return {
      timestamp: Date.now(),
      sessionId: this.sessionId,
      url: window.location.href
    };
  }

  /**
   * Gera ID de sessão único
   */
  private generateSessionId(): string {
    return `alpha-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * API pública para obter métricas
   */
  public getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * API pública para obter alertas
   */
  public getAlerts(): PerformanceAlert[] {
    return [...this.alerts];
  }

  /**
   * API pública para obter métricas atuais resumidas
   */
  public getCurrentPerformanceScore(): {
    score: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    details: Record<string, { value: number; status: 'good' | 'warning' | 'poor' }>;
  } {
    const latest = this.metrics[this.metrics.length - 1];
    if (!latest) {
      return { score: 0, grade: 'F', details: {} };
    }

    const details: Record<string, { value: number; status: 'good' | 'warning' | 'poor' }> = {};
    let totalScore = 0;
    let metricCount = 0;

    // Evaluate each metric
    if (latest.fcp) {
      const status = latest.fcp <= 1800 ? 'good' : latest.fcp <= 3000 ? 'warning' : 'poor';
      details.fcp = { value: latest.fcp, status };
      totalScore += status === 'good' ? 100 : status === 'warning' ? 75 : 25;
      metricCount++;
    }

    if (latest.lcp) {
      const status = latest.lcp <= 2500 ? 'good' : latest.lcp <= 4000 ? 'warning' : 'poor';
      details.lcp = { value: latest.lcp, status };
      totalScore += status === 'good' ? 100 : status === 'warning' ? 75 : 25;
      metricCount++;
    }

    if (latest.fid) {
      const status = latest.fid <= 100 ? 'good' : latest.fid <= 300 ? 'warning' : 'poor';
      details.fid = { value: latest.fid, status };
      totalScore += status === 'good' ? 100 : status === 'warning' ? 75 : 25;
      metricCount++;
    }

    if (latest.cls) {
      const status = latest.cls <= 0.1 ? 'good' : latest.cls <= 0.25 ? 'warning' : 'poor';
      details.cls = { value: latest.cls, status };
      totalScore += status === 'good' ? 100 : status === 'warning' ? 75 : 25;
      metricCount++;
    }

    const score = metricCount > 0 ? Math.round(totalScore / metricCount) : 0;
    const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F';

    return { score, grade, details };
  }

  /**
   * Limpa dados de monitoramento
   */
  public clearData(): void {
    this.metrics = [];
    this.alerts = [];
  }

  /**
   * Para o monitoramento
   */
  public stopMonitoring(): void {
    this.isMonitoring = false;
    
    // Disconnect all observers
    this.observers.forEach(observer => {
      observer.disconnect();
    });
    this.observers.clear();
    
    console.log('🔴 Alpha Performance Monitor: Stopped');
  }

  /**
   * Exporta dados para análise
   */
  public exportData(): {
    metrics: PerformanceMetrics[];
    alerts: PerformanceAlert[];
    summary: ReturnType<RealTimePerformanceMonitor['getCurrentPerformanceScore']>;
  } {
    return {
      metrics: this.getMetrics(),
      alerts: this.getAlerts(),
      summary: this.getCurrentPerformanceScore()
    };
  }
}

// Singleton instance
export const realTimePerformanceMonitor = new RealTimePerformanceMonitor();

// Export types
export type { PerformanceMetrics, PerformanceAlert };

// Export class for advanced usage
export { RealTimePerformanceMonitor }; 