// Production Performance Monitoring Service
// Real-time performance tracking and alerting

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface PerformanceThreshold {
  metric: string;
  warning: number;
  critical: number;
  unit: string;
}

export interface AlertConfig {
  enabled: boolean;
  webhookUrl?: string;
  emailRecipients?: string[];
  slackChannel?: string;
}

export class ProductionPerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private thresholds: Map<string, PerformanceThreshold> = new Map();
  private alertConfig: AlertConfig;
  private monitoringInterval: number | null = null;
  
  // Core Web Vitals tracking
  private observer: PerformanceObserver | null = null;
  
  constructor(alertConfig: AlertConfig = { enabled: false }) {
    this.alertConfig = alertConfig;
    this.setupDefaultThresholds();
    this.initializeWebVitals();
  }
  
  private setupDefaultThresholds() {
    this.thresholds.set('LCP', {
      metric: 'Largest Contentful Paint',
      warning: 2500,
      critical: 4000,
      unit: 'ms'
    });
    
    this.thresholds.set('FID', {
      metric: 'First Input Delay',
      warning: 100,
      critical: 300,
      unit: 'ms'
    });
    
    this.thresholds.set('CLS', {
      metric: 'Cumulative Layout Shift',
      warning: 0.1,
      critical: 0.25,
      unit: 'score'
    });
    
    this.thresholds.set('TTFB', {
      metric: 'Time to First Byte',
      warning: 800,
      critical: 1800,
      unit: 'ms'
    });
    
    this.thresholds.set('Bundle Size', {
      metric: 'JavaScript Bundle Size',
      warning: 500,
      critical: 1000,
      unit: 'KB'
    });
  }
  
  private initializeWebVitals() {
    if (!window.PerformanceObserver) {
      console.warn('PerformanceObserver not supported');
      return;
    }
    
    // Largest Contentful Paint
    this.observeMetric('largest-contentful-paint', (entry: any) => {
      this.recordMetric('LCP', entry.startTime, {
        element: entry.element?.tagName,
        url: entry.url
      });
    });
    
    // First Input Delay
    this.observeMetric('first-input', (entry: any) => {
      this.recordMetric('FID', entry.processingStart - entry.startTime, {
        inputType: entry.name,
        target: entry.target?.tagName
      });
    });
    
    // Cumulative Layout Shift
    this.observeMetric('layout-shift', (entry: any) => {
      if (!entry.hadRecentInput) {
        this.recordMetric('CLS', entry.value, {
          sources: entry.sources?.map((s: any) => s.node?.tagName)
        });
      }
    });
  }
  
  private observeMetric(type: string, callback: (entry: any) => void) {
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(callback);
      });
      
      observer.observe({ type, buffered: true });
    } catch (error: unknown) {
      console.warn(`Failed to observe ${type}:`, error);
    }
  }
  
  recordMetric(name: string, value: number, metadata?: Record<string, unknown>) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata
    };
    
    this.metrics.push(metric);
    this.checkThresholds(metric);
    
    // Keep only last 1000 metrics to prevent memory leaks
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }
  
  private checkThresholds(metric: PerformanceMetric) {
    const threshold = this.thresholds.get(metric.name);
    if (!threshold || !this.alertConfig.enabled) return;
    
    if (metric.value >= threshold.critical) {
      this.sendAlert('critical', metric, threshold);
    } else if (metric.value >= threshold.warning) {
      this.sendAlert('warning', metric, threshold);
    }
  }
  
  private async sendAlert(level: 'warning' | 'critical', metric: PerformanceMetric, threshold: PerformanceThreshold) {
    const alertMessage = {
      level,
      metric: metric.name,
      value: metric.value,
      threshold: level === 'critical' ? threshold.critical : threshold.warning,
      unit: threshold.unit,
      timestamp: new Date(metric.timestamp).toISOString(),
      metadata: metric.metadata
    };
    
    console.warn(`🚨 Performance Alert [${level.toUpperCase()}]:`, alertMessage);
    
    // Send to monitoring service
    if (this.alertConfig.webhookUrl) {
      try {
        await fetch(this.alertConfig.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `🚨 Roteirar IA Performance Alert: ${metric.name} = ${metric.value}${threshold.unit} (threshold: ${level === 'critical' ? threshold.critical : threshold.warning}${threshold.unit})`,
            ...alertMessage
          })
        });
      } catch (error: unknown) {
        console.error('Failed to send performance alert:', error);
      }
    }
  }
  
  startMonitoring(intervalMs: number = 30000) {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    
    this.monitoringInterval = window.setInterval(() => {
      this.collectSystemMetrics();
    }, intervalMs);
    
    console.log('🔍 Performance monitoring started');
  }
  
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    if (this.observer) {
      this.observer.disconnect();
    }
    
    console.log('⏹️ Performance monitoring stopped');
  }
  
  private collectSystemMetrics() {
    // Memory usage
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.recordMetric('Memory Used', memory.usedJSHeapSize / 1024 / 1024, {
        total: memory.totalJSHeapSize / 1024 / 1024,
        limit: memory.jsHeapSizeLimit / 1024 / 1024
      });
    }
    
    // Connection info
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      this.recordMetric('Network Speed', connection.downlink, {
        effectiveType: connection.effectiveType,
        rtt: connection.rtt
      });
    }
    
    // Battery status (if available)
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        this.recordMetric('Battery Level', battery.level * 100, {
          charging: battery.charging
        });
      });
    }
  }
  
  getMetrics(since?: number): PerformanceMetric[] {
    if (!since) return this.metrics;
    
    return this.metrics.filter(metric => metric.timestamp >= since);
  }
  
  getAverageMetric(name: string, windowMs: number = 300000): number | null {
    const since = Date.now() - windowMs;
    const relevantMetrics = this.metrics.filter(
      metric => metric.name === name && metric.timestamp >= since
    );
    
    if (relevantMetrics.length === 0) return null;
    
    return relevantMetrics.reduce((sum, metric) => sum + metric.value, 0) / relevantMetrics.length;
  }
  
  getPerformanceReport(): Record<string, unknown> {
    const report: Record<string, unknown> = {};
    
    this.thresholds.forEach((threshold, metricName) => {
      const average = this.getAverageMetric(metricName);
      const latest = this.metrics
        .filter(m => m.name === metricName)
        .sort((a, b) => b.timestamp - a.timestamp)[0];
      
      report[metricName] = {
        latest: latest?.value,
        average,
        threshold: threshold.warning,
        critical: threshold.critical,
        unit: threshold.unit,
        status: latest ? (
          latest.value >= threshold.critical ? 'critical' :
          latest.value >= threshold.warning ? 'warning' : 'good'
        ) : 'no-data'
      };
    });
    
    return report;
  }
  
  exportMetrics(): string {
    return JSON.stringify({
      timestamp: Date.now(),
      metrics: this.metrics,
      thresholds: Object.fromEntries(this.thresholds),
      report: this.getPerformanceReport()
    }, null, 2);
  }
}

// Global instance
export const performanceMonitor = new ProductionPerformanceMonitor({
  enabled: process.env.NODE_ENV === 'production'
});

// Auto-start monitoring in production
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  performanceMonitor.startMonitoring();
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    performanceMonitor.stopMonitoring();
  });
} 