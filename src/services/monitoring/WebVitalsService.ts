import { onCLS, onFCP, onFID, onLCP, onTTFB } from 'web-vitals';

export interface WebVitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  timestamp: number;
  url: string;
  userAgent: string;
}

export interface PerformanceReport {
  timestamp: number;
  url: string;
  metrics: WebVitalMetric[];
  sessionId: string;
  userId?: string;
  pageLoadTime: number;
  domContentLoadedTime: number;
  firstPaintTime: number;
  resourceLoadTimes: ResourceTiming[];
}

export interface ResourceTiming {
  name: string;
  duration: number;
  size: number;
  type: string;
  cached: boolean;
}

export interface PerformanceThresholds {
  lcp: { good: number; poor: number };
  fid: { good: number; poor: number };
  cls: { good: number; poor: number };
  fcp: { good: number; poor: number };
  ttfb: { good: number; poor: number };
}

// Web Vitals thresholds based on Google's recommendations
const PERFORMANCE_THRESHOLDS: PerformanceThresholds = {
  lcp: { good: 2500, poor: 4000 },
  fid: { good: 100, poor: 300 },
  cls: { good: 0.1, poor: 0.25 },
  fcp: { good: 1800, poor: 3000 },
  ttfb: { good: 800, poor: 1800 }
};

export class WebVitalsService {
  private metrics: WebVitalMetric[] = [];
  private sessionId: string;
  private userId?: string;
  private reportingEndpoint: string;
  private reportingInterval: number = 30000; // 30 seconds
  private performanceObserver?: PerformanceObserver;

  constructor(options: {
    reportingEndpoint?: string;
    userId?: string;
    reportingInterval?: number;
  } = {}) {
    this.sessionId = this.generateSessionId();
    this.userId = options.userId;
    this.reportingEndpoint = options.reportingEndpoint || '/api/performance';
    this.reportingInterval = options.reportingInterval || 30000;
    
    this.initializeWebVitals();
    this.initializePerformanceObserver();
    this.startPeriodicReporting();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeWebVitals(): void {
    // Collect Core Web Vitals
    onCLS(this.handleMetric.bind(this));
    onFCP(this.handleMetric.bind(this));
    onFID(this.handleMetric.bind(this));
    onLCP(this.handleMetric.bind(this));
    onTTFB(this.handleMetric.bind(this));
  }

  private handleMetric(metric: any): void {
    const rating = this.getRating(metric.name, metric.value);
    
    const webVitalMetric: WebVitalMetric = {
      name: metric.name,
      value: metric.value,
      rating,
      delta: metric.delta || 0,
      id: metric.id,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    this.metrics.push(webVitalMetric);
    this.sendMetricToAnalytics(webVitalMetric);
  }

  private getRating(metricName: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds = PERFORMANCE_THRESHOLDS[metricName.toLowerCase() as keyof PerformanceThresholds];
    
    if (!thresholds) return 'good';
    
    if (value <= thresholds.good) return 'good';
    if (value <= thresholds.poor) return 'needs-improvement';
    return 'poor';
  }

  private initializePerformanceObserver(): void {
    if ('PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.handlePerformanceEntry(entry);
        }
      });

      // Observe different types of performance entries
      try {
        this.performanceObserver.observe({ entryTypes: ['navigation', 'resource', 'paint'] });
      } catch (error) {
        console.warn('Performance Observer not fully supported:', error);
      }
    }
  }

  private handlePerformanceEntry(entry: PerformanceEntry): void {
    // Process different types of performance entries
    if (entry.entryType === 'navigation') {
      this.processNavigationEntry(entry as PerformanceNavigationTiming);
    } else if (entry.entryType === 'resource') {
      this.processResourceEntry(entry as PerformanceResourceTiming);
    } else if (entry.entryType === 'paint') {
      this.processPaintEntry(entry as PerformancePaintTiming);
    }
  }

  private processNavigationEntry(entry: PerformanceNavigationTiming): void {
    const navigationMetrics = {
      domContentLoadedTime: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
      domInteractiveTime: entry.domInteractive - entry.navigationStart,
      loadEventTime: entry.loadEventEnd - entry.loadEventStart,
      redirectTime: entry.redirectEnd - entry.redirectStart,
      dnsTime: entry.domainLookupEnd - entry.domainLookupStart,
      connectTime: entry.connectEnd - entry.connectStart,
      requestTime: entry.responseStart - entry.requestStart,
      responseTime: entry.responseEnd - entry.responseStart,
      totalTime: entry.loadEventEnd - entry.navigationStart
    };

    // Store for reporting
    this.storeNavigationMetrics(navigationMetrics);
  }

  private processResourceEntry(entry: PerformanceResourceTiming): void {
    const resourceMetrics = {
      name: entry.name,
      duration: entry.duration,
      size: entry.transferSize || 0,
      type: this.getResourceType(entry.name),
      cached: entry.transferSize === 0 && entry.decodedBodySize > 0
    };

    // Store for reporting
    this.storeResourceMetrics(resourceMetrics);
  }

  private processPaintEntry(entry: PerformancePaintTiming): void {
    const paintMetrics = {
      name: entry.name,
      startTime: entry.startTime,
      timestamp: Date.now()
    };

    // Store for reporting
    this.storePaintMetrics(paintMetrics);
  }

  private getResourceType(url: string): string {
    const extension = url.split('.').pop()?.toLowerCase();
    
    if (['js', 'jsx', 'ts', 'tsx'].includes(extension || '')) return 'script';
    if (['css', 'scss', 'sass'].includes(extension || '')) return 'stylesheet';
    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(extension || '')) return 'image';
    if (['woff', 'woff2', 'ttf', 'otf'].includes(extension || '')) return 'font';
    if (url.includes('/api/')) return 'api';
    
    return 'other';
  }

  private storeNavigationMetrics(metrics: any): void {
    // Store navigation metrics for reporting
    localStorage.setItem('navigation_metrics', JSON.stringify(metrics));
  }

  private storeResourceMetrics(metrics: ResourceTiming): void {
    // Store resource metrics for reporting
    const existing = JSON.parse(localStorage.getItem('resource_metrics') || '[]');
    existing.push(metrics);
    localStorage.setItem('resource_metrics', JSON.stringify(existing));
  }

  private storePaintMetrics(metrics: any): void {
    // Store paint metrics for reporting
    const existing = JSON.parse(localStorage.getItem('paint_metrics') || '[]');
    existing.push(metrics);
    localStorage.setItem('paint_metrics', JSON.stringify(existing));
  }

  private sendMetricToAnalytics(metric: WebVitalMetric): void {
    // Send to analytics service (Google Analytics, custom endpoint, etc.)
    if (typeof gtag !== 'undefined') {
      gtag('event', metric.name, {
        event_category: 'Web Vitals',
        event_label: metric.id,
        value: Math.round(metric.value),
        custom_map: {
          metric_rating: metric.rating,
          metric_delta: metric.delta
        }
      });
    }

    // Send to custom endpoint
    this.sendToCustomEndpoint(metric);
  }

  private async sendToCustomEndpoint(metric: WebVitalMetric): Promise<void> {
    try {
      await fetch(this.reportingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'web-vital',
          sessionId: this.sessionId,
          userId: this.userId,
          metric
        })
      });
    } catch (error) {
      console.warn('Failed to send metric to endpoint:', error);
    }
  }

  private startPeriodicReporting(): void {
    setInterval(() => {
      this.generatePerformanceReport();
    }, this.reportingInterval);
  }

  public generatePerformanceReport(): PerformanceReport {
    const navigationMetrics = JSON.parse(localStorage.getItem('navigation_metrics') || '{}');
    const resourceMetrics = JSON.parse(localStorage.getItem('resource_metrics') || '[]');
    const paintMetrics = JSON.parse(localStorage.getItem('paint_metrics') || '[]');

    const report: PerformanceReport = {
      timestamp: Date.now(),
      url: window.location.href,
      metrics: this.metrics,
      sessionId: this.sessionId,
      userId: this.userId,
      pageLoadTime: navigationMetrics.totalTime || 0,
      domContentLoadedTime: navigationMetrics.domContentLoadedTime || 0,
      firstPaintTime: paintMetrics.find((p: any) => p.name === 'first-paint')?.startTime || 0,
      resourceLoadTimes: resourceMetrics
    };

    // Send report to analytics
    this.sendReportToAnalytics(report);
    
    return report;
  }

  private async sendReportToAnalytics(report: PerformanceReport): Promise<void> {
    try {
      await fetch(this.reportingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'performance-report',
          report
        })
      });
    } catch (error) {
      console.warn('Failed to send performance report:', error);
    }
  }

  public getMetrics(): WebVitalMetric[] {
    return this.metrics;
  }

  public getLatestReport(): PerformanceReport {
    return this.generatePerformanceReport();
  }

  public clearMetrics(): void {
    this.metrics = [];
    localStorage.removeItem('navigation_metrics');
    localStorage.removeItem('resource_metrics');
    localStorage.removeItem('paint_metrics');
  }

  public destroy(): void {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
    this.clearMetrics();
  }
}

export default WebVitalsService; 