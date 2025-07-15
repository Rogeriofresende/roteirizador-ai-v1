import { useState, useEffect, useCallback } from 'react';
import { WebVitalsService, WebVitalMetric, PerformanceReport } from '../services/monitoring/WebVitalsService';

interface UsePerformanceMonitoringOptions {
  userId?: string;
  reportingEndpoint?: string;
  reportingInterval?: number;
  enabled?: boolean;
}

interface PerformanceMetrics {
  webVitals: WebVitalMetric[];
  performanceReport: PerformanceReport | null;
  overallScore: number;
  isLoading: boolean;
  lastUpdateTime: number;
}

interface PerformanceActions {
  clearMetrics: () => void;
  generateReport: () => PerformanceReport | null;
  refreshMetrics: () => void;
  getMetricByName: (name: string) => WebVitalMetric | undefined;
  getMetricHistory: (name: string) => WebVitalMetric[];
}

export const usePerformanceMonitoring = (
  options: UsePerformanceMonitoringOptions = {}
): PerformanceMetrics & PerformanceActions => {
  const {
    userId,
    reportingEndpoint = '/api/performance',
    reportingInterval = 15000,
    enabled = true
  } = options;

  const [webVitalsService, setWebVitalsService] = useState<WebVitalsService | null>(null);
  const [webVitals, setWebVitals] = useState<WebVitalMetric[]>([]);
  const [performanceReport, setPerformanceReport] = useState<PerformanceReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now());

  // Initialize Web Vitals Service
  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    const service = new WebVitalsService({
      reportingEndpoint,
      userId,
      reportingInterval
    });
    
    setWebVitalsService(service);
    
    return () => {
      service.destroy();
    };
  }, [enabled, userId, reportingEndpoint, reportingInterval]);

  // Update metrics periodically
  useEffect(() => {
    if (!webVitalsService || !enabled) return;

    const updateMetrics = () => {
      try {
        const latestMetrics = webVitalsService.getMetrics();
        const latestReport = webVitalsService.getLatestReport();
        
        setWebVitals(latestMetrics);
        setPerformanceReport(latestReport);
        setLastUpdateTime(Date.now());
        setIsLoading(false);
      } catch (error) {
        console.error('Error updating performance metrics:', error);
        setIsLoading(false);
      }
    };

    // Initial update
    updateMetrics();

    // Set up interval for updates
    const interval = setInterval(updateMetrics, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [webVitalsService, enabled]);

  // Calculate overall performance score
  const overallScore = (): number => {
    if (webVitals.length === 0) return 0;
    
    const goodMetrics = webVitals.filter(m => m.rating === 'good').length;
    const totalMetrics = webVitals.length;
    
    return Math.round((goodMetrics / totalMetrics) * 100);
  };

  // Clear all metrics
  const clearMetrics = useCallback(() => {
    if (webVitalsService) {
      webVitalsService.clearMetrics();
      setWebVitals([]);
      setPerformanceReport(null);
      setLastUpdateTime(Date.now());
    }
  }, [webVitalsService]);

  // Generate performance report
  const generateReport = useCallback((): PerformanceReport | null => {
    if (!webVitalsService) return null;
    
    try {
      const report = webVitalsService.getLatestReport();
      setPerformanceReport(report);
      return report;
    } catch (error) {
      console.error('Error generating performance report:', error);
      return null;
    }
  }, [webVitalsService]);

  // Refresh metrics manually
  const refreshMetrics = useCallback(() => {
    if (!webVitalsService) return;
    
    try {
      const latestMetrics = webVitalsService.getMetrics();
      const latestReport = webVitalsService.getLatestReport();
      
      setWebVitals(latestMetrics);
      setPerformanceReport(latestReport);
      setLastUpdateTime(Date.now());
    } catch (error) {
      console.error('Error refreshing metrics:', error);
    }
  }, [webVitalsService]);

  // Get specific metric by name
  const getMetricByName = useCallback((name: string): WebVitalMetric | undefined => {
    return webVitals.find(metric => metric.name.toLowerCase() === name.toLowerCase());
  }, [webVitals]);

  // Get metric history for a specific metric
  const getMetricHistory = useCallback((name: string): WebVitalMetric[] => {
    return webVitals.filter(metric => metric.name.toLowerCase() === name.toLowerCase());
  }, [webVitals]);

  // Performance alerts
  const getPerformanceAlerts = useCallback(() => {
    const alerts = [];
    
    // Check for poor performing metrics
    const poorMetrics = webVitals.filter(m => m.rating === 'poor');
    if (poorMetrics.length > 0) {
      alerts.push({
        type: 'performance',
        severity: 'high',
        message: `${poorMetrics.length} metrics with poor performance`,
        metrics: poorMetrics
      });
    }
    
    // Check for needs improvement metrics
    const needsImprovementMetrics = webVitals.filter(m => m.rating === 'needs-improvement');
    if (needsImprovementMetrics.length > 0) {
      alerts.push({
        type: 'performance',
        severity: 'medium',
        message: `${needsImprovementMetrics.length} metrics need improvement`,
        metrics: needsImprovementMetrics
      });
    }
    
    // Check overall score
    const score = overallScore();
    if (score < 70) {
      alerts.push({
        type: 'score',
        severity: 'high',
        message: `Overall performance score is ${score}% (target: 90%+)`,
        score
      });
    }
    
    return alerts;
  }, [webVitals, overallScore]);

  // Performance recommendations
  const getPerformanceRecommendations = useCallback(() => {
    const recommendations = [];
    
    // LCP recommendations
    const lcp = getMetricByName('lcp');
    if (lcp && lcp.rating !== 'good') {
      recommendations.push({
        metric: 'LCP',
        issue: 'Largest Contentful Paint is slow',
        suggestions: [
          'Optimize images and use modern formats (WebP, AVIF)',
          'Implement lazy loading for images',
          'Minimize CSS and JavaScript blocking resources',
          'Use CDN for static assets'
        ]
      });
    }
    
    // FID recommendations
    const fid = getMetricByName('fid');
    if (fid && fid.rating !== 'good') {
      recommendations.push({
        metric: 'FID',
        issue: 'First Input Delay is high',
        suggestions: [
          'Break up long-running JavaScript tasks',
          'Use web workers for heavy computations',
          'Optimize third-party scripts',
          'Implement code splitting'
        ]
      });
    }
    
    // CLS recommendations
    const cls = getMetricByName('cls');
    if (cls && cls.rating !== 'good') {
      recommendations.push({
        metric: 'CLS',
        issue: 'Cumulative Layout Shift is high',
        suggestions: [
          'Include size attributes on images and videos',
          'Reserve space for ads and embeds',
          'Avoid inserting content above existing content',
          'Use CSS aspect-ratio for responsive images'
        ]
      });
    }
    
    return recommendations;
  }, [getMetricByName]);

  return {
    // Metrics
    webVitals,
    performanceReport,
    overallScore: overallScore(),
    isLoading,
    lastUpdateTime,
    
    // Actions
    clearMetrics,
    generateReport,
    refreshMetrics,
    getMetricByName,
    getMetricHistory,
    
    // Additional utilities
    getPerformanceAlerts,
    getPerformanceRecommendations
  };
};

export default usePerformanceMonitoring; 