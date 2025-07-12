/**
 * 🩺 SYSTEM HEALTH SERVICE V6.4
 * Week 2 Consolidation: Unified system health monitoring and diagnostics
 * Consolidates: healthCheckService.ts + monitoring/healthMonitor.ts + monitoring/performanceMonitor.ts
 */

import { logger } from '../utils/logger';
import { config } from '../config/environment';
import { IBaseService, ServiceHealthStatus } from './interfaces/IBaseService';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface HealthMetric {
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  timestamp: Date;
  threshold?: {
    warning: number;
    critical: number;
  };
}

interface ServiceStatus {
  name: string;
  status: 'online' | 'offline' | 'degraded';
  responseTime?: number;
  lastCheck: Date;
  errorCount: number;
  consecutiveFailures: number;
  details?: Record<string, unknown>;
}

interface SystemDiagnostic {
  component: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  details?: Record<string, unknown>;
  timestamp: Date;
}

interface HealthReport {
  overall: 'healthy' | 'degraded' | 'critical';
  score: number; // 0-100
  timestamp: Date;
  services: ServiceStatus[];
  metrics: HealthMetric[];
  diagnostics: SystemDiagnostic[];
  summary: {
    servicesOnline: number;
    servicesTotal: number;
    errorRate: number;
    avgResponseTime: number;
    lastIncident?: Date;
  };
}

interface AlertConfig {
  enabled: boolean;
  channels: Array<'console' | 'webhook' | 'email'>;
  webhookUrl?: string;
  emailRecipients?: string[];
  cooldownMs: number;
}

interface PerformanceAlert {
  id: string;
  metric: string;
  threshold: number;
  value: number;
  severity: 'warning' | 'critical';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

// =============================================================================
// SYSTEM HEALTH SERVICE
// =============================================================================

export class SystemHealthService implements IBaseService {
  private healthMetrics: Map<string, HealthMetric> = new Map();
  private serviceStatuses: Map<string, ServiceStatus> = new Map();
  private diagnostics: SystemDiagnostic[] = [];
  private alerts: Map<string, PerformanceAlert> = new Map();
  private lastAlerts: Map<string, Date> = new Map();
  
  private healthCheckInterval?: NodeJS.Timer;
  private metricsCollectionInterval?: NodeJS.Timer;
  private initialized = false;

  private alertConfig: AlertConfig = {
    enabled: true,
    channels: ['console'],
    cooldownMs: 300000, // 5 minutes
  };

  private readonly serviceEndpoints = [
    { name: 'Gemini API', url: 'https://generativelanguage.googleapis.com/v1beta/models' },
    { name: 'CDN', url: 'https://cdn.jsdelivr.net' },
    { name: 'Analytics', url: '/api/analytics' },
    { name: 'Cache Service', url: '/api/cache' },
    { name: 'Health API', url: '/api/health' }
  ];

  constructor() {
    this.initializeDefaultMetrics();
    
    logger.info('System Health Service initialized');
  }

  // =============================================================================
  // IBaseService IMPLEMENTATION
  // =============================================================================

  async initialize(): Promise<boolean> {
    try {
      // Start health monitoring
      await this.startHealthMonitoring();
      
      // Start metrics collection
      this.startMetricsCollection();
      
      // Initial health check
      await this.performFullHealthCheck();
      
      this.initialized = true;
      
      logger.info('System Health Service initialized successfully', {
        endpoints: this.serviceEndpoints.length,
        metrics: this.healthMetrics.size,
        alertsEnabled: this.alertConfig.enabled
      });

      return true;
    } catch (error: unknown) {
      logger.error('System Health Service initialization failed', { error });
      return false;
    }
  }

  async dispose(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    if (this.metricsCollectionInterval) {
      clearInterval(this.metricsCollectionInterval);
    }

    this.healthMetrics.clear();
    this.serviceStatuses.clear();
    this.diagnostics = [];
    this.alerts.clear();
    
    this.initialized = false;
    
    logger.info('System Health Service disposed');
  }

  async getHealth(): Promise<ServiceHealthStatus> {
    const report = await this.generateHealthReport();
    
    return {
      status: report.overall === 'healthy' ? 'healthy' : 
              report.overall === 'degraded' ? 'degraded' : 'offline',
      lastCheck: new Date(),
      details: {
        score: report.score,
        servicesOnline: report.summary.servicesOnline,
        servicesTotal: report.summary.servicesTotal,
        errorRate: report.summary.errorRate,
        avgResponseTime: report.summary.avgResponseTime,
        activeAlerts: this.alerts.size
      }
    };
  }

  getServiceName(): string {
    return 'SystemHealthService';
  }

  // =============================================================================
  // HEALTH MONITORING METHODS
  // =============================================================================

  async performFullHealthCheck(): Promise<HealthReport> {
    logger.info('Performing full health check...');
    
    // Check all services
    await this.checkAllServices();
    
    // Collect system metrics
    await this.collectSystemMetrics();
    
    // Run diagnostics
    await this.runSystemDiagnostics();
    
    // Generate comprehensive report
    const report = await this.generateHealthReport();
    
    // Check for alerts
    await this.processAlerts(report);
    
    logger.info('Full health check completed', {
      overall: report.overall,
      score: report.score,
      servicesOnline: report.summary.servicesOnline,
      servicesTotal: report.summary.servicesTotal
    });

    return report;
  }

  async checkService(name: string, url: string): Promise<ServiceStatus> {
    const startTime = Date.now();
    let status: ServiceStatus = {
      name,
      status: 'offline',
      lastCheck: new Date(),
      errorCount: 0,
      consecutiveFailures: 0
    };

    try {
      // Get existing status for error tracking
      const existing = this.serviceStatuses.get(name);
      if (existing) {
        status.errorCount = existing.errorCount;
        status.consecutiveFailures = existing.consecutiveFailures;
      }

      const response = await fetch(url, {
        method: 'HEAD',
        timeout: 5000,
        signal: AbortSignal.timeout(5000)
      });

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        status = {
          ...status,
          status: 'online',
          responseTime,
          consecutiveFailures: 0,
          details: {
            statusCode: response.status,
            headers: Object.fromEntries(response.headers.entries())
          }
        };
      } else {
        status = {
          ...status,
          status: 'degraded',
          responseTime,
          errorCount: status.errorCount + 1,
          consecutiveFailures: status.consecutiveFailures + 1,
          details: {
            statusCode: response.status,
            statusText: response.statusText
          }
        };
      }

    } catch (error: unknown) {
      status = {
        ...status,
        status: 'offline',
        errorCount: status.errorCount + 1,
        consecutiveFailures: status.consecutiveFailures + 1,
        details: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };

      logger.warn(`Service check failed: ${name}`, { url, error });
    }

    this.serviceStatuses.set(name, status);
    return status;
  }

  async checkAllServices(): Promise<void> {
    const checks = this.serviceEndpoints.map(endpoint => 
      this.checkService(endpoint.name, endpoint.url)
    );

    await Promise.allSettled(checks);
  }

  // =============================================================================
  // METRICS COLLECTION
  // =============================================================================

  async collectSystemMetrics(): Promise<void> {
    try {
      // Memory metrics
      if (typeof window !== 'undefined' && 'performance' in window && 'memory' in performance) {
        const memory = (performance as any).memory;
        
        this.recordMetric('Memory Usage', {
          name: 'Memory Usage',
          value: memory.usedJSHeapSize / 1024 / 1024, // MB
          unit: 'MB',
          status: memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.8 ? 'warning' : 'healthy',
          timestamp: new Date(),
          threshold: {
            warning: memory.jsHeapSizeLimit * 0.7 / 1024 / 1024,
            critical: memory.jsHeapSizeLimit * 0.9 / 1024 / 1024
          }
        });

        this.recordMetric('Memory Limit', {
          name: 'Memory Limit',
          value: memory.jsHeapSizeLimit / 1024 / 1024, // MB
          unit: 'MB',
          status: 'healthy',
          timestamp: new Date()
        });
      }

      // Performance metrics
      if (typeof window !== 'undefined' && 'performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (navigation) {
          this.recordMetric('Page Load Time', {
            name: 'Page Load Time',
            value: navigation.loadEventEnd - navigation.fetchStart,
            unit: 'ms',
            status: navigation.loadEventEnd - navigation.fetchStart > 3000 ? 'warning' : 'healthy',
            timestamp: new Date(),
            threshold: {
              warning: 3000,
              critical: 5000
            }
          });

          this.recordMetric('DOM Content Loaded', {
            name: 'DOM Content Loaded',
            value: navigation.domContentLoadedEventEnd - navigation.fetchStart,
            unit: 'ms',
            status: navigation.domContentLoadedEventEnd - navigation.fetchStart > 2000 ? 'warning' : 'healthy',
            timestamp: new Date(),
            threshold: {
              warning: 2000,
              critical: 3000
            }
          });
        }
      }

      // Network metrics
      if (typeof navigator !== 'undefined' && 'connection' in navigator) {
        const connection = (navigator as any).connection;
        
        this.recordMetric('Network Effective Type', {
          name: 'Network Effective Type',
          value: this.networkTypeToValue(connection.effectiveType),
          unit: 'score',
          status: connection.effectiveType === 'slow-2g' ? 'warning' : 'healthy',
          timestamp: new Date()
        });

        this.recordMetric('Network Downlink', {
          name: 'Network Downlink',
          value: connection.downlink,
          unit: 'Mbps',
          status: connection.downlink < 1 ? 'warning' : 'healthy',
          timestamp: new Date(),
          threshold: {
            warning: 1,
            critical: 0.5
          }
        });
      }

      // Service response times
      const avgResponseTime = this.calculateAverageResponseTime();
      this.recordMetric('Average Response Time', {
        name: 'Average Response Time',
        value: avgResponseTime,
        unit: 'ms',
        status: avgResponseTime > 1000 ? 'warning' : 'healthy',
        timestamp: new Date(),
        threshold: {
          warning: 1000,
          critical: 2000
        }
      });

      // Error rate
      const errorRate = this.calculateErrorRate();
      this.recordMetric('Error Rate', {
        name: 'Error Rate',
        value: errorRate,
        unit: '%',
        status: errorRate > 5 ? 'warning' : 'healthy',
        timestamp: new Date(),
        threshold: {
          warning: 5,
          critical: 10
        }
      });

    } catch (error: unknown) {
      logger.error('Failed to collect system metrics', { error });
    }
  }

  recordMetric(name: string, metric: HealthMetric): void {
    this.healthMetrics.set(name, metric);
    
    // Check for alert conditions
    this.checkMetricAlert(metric);
  }

  // =============================================================================
  // DIAGNOSTICS
  // =============================================================================

  async runSystemDiagnostics(): Promise<void> {
    this.diagnostics = [];

    // Check critical services
    const criticalServices = ['Gemini API', 'Cache Service'];
    for (const serviceName of criticalServices) {
      const service = this.serviceStatuses.get(serviceName);
      if (!service || service.status === 'offline') {
        this.diagnostics.push({
          component: serviceName,
          status: 'fail',
          message: `Critical service ${serviceName} is offline`,
          timestamp: new Date(),
          details: { service }
        });
      } else if (service.status === 'degraded') {
        this.diagnostics.push({
          component: serviceName,
          status: 'warn',
          message: `Service ${serviceName} is degraded`,
          timestamp: new Date(),
          details: { service }
        });
      } else {
        this.diagnostics.push({
          component: serviceName,
          status: 'pass',
          message: `Service ${serviceName} is healthy`,
          timestamp: new Date(),
          details: { responseTime: service.responseTime }
        });
      }
    }

    // Check memory usage
    const memoryMetric = this.healthMetrics.get('Memory Usage');
    if (memoryMetric) {
      if (memoryMetric.status === 'critical') {
        this.diagnostics.push({
          component: 'Memory',
          status: 'fail',
          message: `Memory usage critical: ${memoryMetric.value.toFixed(1)}${memoryMetric.unit}`,
          timestamp: new Date(),
          details: { metric: memoryMetric }
        });
      } else if (memoryMetric.status === 'warning') {
        this.diagnostics.push({
          component: 'Memory',
          status: 'warn',
          message: `Memory usage high: ${memoryMetric.value.toFixed(1)}${memoryMetric.unit}`,
          timestamp: new Date(),
          details: { metric: memoryMetric }
        });
      } else {
        this.diagnostics.push({
          component: 'Memory',
          status: 'pass',
          message: `Memory usage normal: ${memoryMetric.value.toFixed(1)}${memoryMetric.unit}`,
          timestamp: new Date()
        });
      }
    }

    // Check error rate
    const errorRateMetric = this.healthMetrics.get('Error Rate');
    if (errorRateMetric) {
      if (errorRateMetric.status === 'critical') {
        this.diagnostics.push({
          component: 'Error Rate',
          status: 'fail',
          message: `Error rate critical: ${errorRateMetric.value.toFixed(1)}%`,
          timestamp: new Date(),
          details: { metric: errorRateMetric }
        });
      } else if (errorRateMetric.status === 'warning') {
        this.diagnostics.push({
          component: 'Error Rate',
          status: 'warn',
          message: `Error rate elevated: ${errorRateMetric.value.toFixed(1)}%`,
          timestamp: new Date(),
          details: { metric: errorRateMetric }
        });
      } else {
        this.diagnostics.push({
          component: 'Error Rate',
          status: 'pass',
          message: `Error rate normal: ${errorRateMetric.value.toFixed(1)}%`,
          timestamp: new Date()
        });
      }
    }

    // Browser compatibility check
    if (typeof window !== 'undefined') {
      const features = {
        'localStorage': 'localStorage' in window,
        'sessionStorage': 'sessionStorage' in window,
        'indexedDB': 'indexedDB' in window,
        'serviceWorker': 'serviceWorker' in navigator,
        'fetch': 'fetch' in window
      };

      const unsupported = Object.entries(features)
        .filter(([, supported]) => !supported)
        .map(([feature]) => feature);

      if (unsupported.length > 0) {
        this.diagnostics.push({
          component: 'Browser Compatibility',
          status: 'warn',
          message: `Unsupported features: ${unsupported.join(', ')}`,
          timestamp: new Date(),
          details: { features, unsupported }
        });
      } else {
        this.diagnostics.push({
          component: 'Browser Compatibility',
          status: 'pass',
          message: 'All required features supported',
          timestamp: new Date(),
          details: { features }
        });
      }
    }
  }

  // =============================================================================
  // HEALTH REPORTING
  // =============================================================================

  async generateHealthReport(): Promise<HealthReport> {
    const services = Array.from(this.serviceStatuses.values());
    const metrics = Array.from(this.healthMetrics.values());
    
    // Calculate overall status and score
    const { overall, score } = this.calculateOverallHealth(services, metrics);
    
    // Calculate summary statistics
    const summary = {
      servicesOnline: services.filter(s => s.status === 'online').length,
      servicesTotal: services.length,
      errorRate: this.calculateErrorRate(),
      avgResponseTime: this.calculateAverageResponseTime(),
      lastIncident: this.getLastIncident()
    };

    return {
      overall,
      score,
      timestamp: new Date(),
      services,
      metrics,
      diagnostics: [...this.diagnostics],
      summary
    };
  }

  // =============================================================================
  // ALERT MANAGEMENT
  // =============================================================================

  async processAlerts(report: HealthReport): Promise<void> {
    // Check for new alerts based on report
    for (const metric of report.metrics) {
      if (metric.status === 'critical' || metric.status === 'warning') {
        await this.triggerAlert({
          id: `metric-${metric.name}`,
          metric: metric.name,
          threshold: metric.threshold?.[metric.status] || 0,
          value: metric.value,
          severity: metric.status === 'critical' ? 'critical' : 'warning',
          message: `${metric.name} is ${metric.status}: ${metric.value}${metric.unit}`,
          timestamp: new Date(),
          acknowledged: false
        });
      }
    }

    // Check for service alerts
    for (const service of report.services) {
      if (service.status === 'offline' && service.consecutiveFailures >= 3) {
        await this.triggerAlert({
          id: `service-${service.name}`,
          metric: `Service ${service.name}`,
          threshold: 0,
          value: service.consecutiveFailures,
          severity: 'critical',
          message: `Service ${service.name} has been offline for ${service.consecutiveFailures} consecutive checks`,
          timestamp: new Date(),
          acknowledged: false
        });
      }
    }
  }

  async triggerAlert(alert: PerformanceAlert): Promise<void> {
    // Check cooldown
    const lastAlert = this.lastAlerts.get(alert.id);
    if (lastAlert && Date.now() - lastAlert.getTime() < this.alertConfig.cooldownMs) {
      return;
    }

    this.alerts.set(alert.id, alert);
    this.lastAlerts.set(alert.id, alert.timestamp);

    // Send alerts through configured channels
    for (const channel of this.alertConfig.channels) {
      try {
        switch (channel) {
          case 'console':
            logger.warn(`ALERT [${alert.severity.toUpperCase()}]`, {
              metric: alert.metric,
              message: alert.message,
              value: alert.value,
              threshold: alert.threshold
            });
            break;
            
          case 'webhook':
            if (this.alertConfig.webhookUrl) {
              await this.sendWebhookAlert(alert);
            }
            break;
            
          case 'email':
            if (this.alertConfig.emailRecipients?.length) {
              await this.sendEmailAlert(alert);
            }
            break;
        }
      } catch (error: unknown) {
        logger.error(`Failed to send alert via ${channel}`, { error, alert });
      }
    }
  }

  acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.acknowledged = true;
      this.alerts.set(alertId, alert);
      logger.info(`Alert acknowledged: ${alertId}`);
      return true;
    }
    return false;
  }

  clearAlert(alertId: string): boolean {
    if (this.alerts.delete(alertId)) {
      this.lastAlerts.delete(alertId);
      logger.info(`Alert cleared: ${alertId}`);
      return true;
    }
    return false;
  }

  // =============================================================================
  // PUBLIC API METHODS
  // =============================================================================

  getHealthReport(): Promise<HealthReport> {
    return this.generateHealthReport();
  }

  getMetrics(): HealthMetric[] {
    return Array.from(this.healthMetrics.values());
  }

  getServiceStatuses(): ServiceStatus[] {
    return Array.from(this.serviceStatuses.values());
  }

  getActiveAlerts(): PerformanceAlert[] {
    return Array.from(this.alerts.values()).filter(alert => !alert.acknowledged);
  }

  getAllAlerts(): PerformanceAlert[] {
    return Array.from(this.alerts.values());
  }

  getDiagnostics(): SystemDiagnostic[] {
    return [...this.diagnostics];
  }

  updateAlertConfig(config: Partial<AlertConfig>): void {
    this.alertConfig = { ...this.alertConfig, ...config };
    logger.info('Alert configuration updated', { config: this.alertConfig });
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  private initializeDefaultMetrics(): void {
    // Initialize with default values
    this.recordMetric('System Status', {
      name: 'System Status',
      value: 1,
      unit: 'status',
      status: 'healthy',
      timestamp: new Date()
    });
  }

  private async startHealthMonitoring(): Promise<void> {
    // Initial check
    await this.performFullHealthCheck();
    
    // Schedule periodic checks
    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.performFullHealthCheck();
      } catch (error: unknown) {
        logger.error('Scheduled health check failed', { error });
      }
    }, 60000); // Every minute

    logger.info('Health monitoring started');
  }

  private startMetricsCollection(): void {
    this.metricsCollectionInterval = setInterval(async () => {
      try {
        await this.collectSystemMetrics();
      } catch (error: unknown) {
        logger.error('Metrics collection failed', { error });
      }
    }, 30000); // Every 30 seconds

    logger.info('Metrics collection started');
  }

  private networkTypeToValue(type: string): number {
    const typeMap: Record<string, number> = {
      'slow-2g': 1,
      '2g': 2,
      '3g': 3,
      '4g': 4,
      '5g': 5
    };
    return typeMap[type] || 0;
  }

  private calculateAverageResponseTime(): number {
    const services = Array.from(this.serviceStatuses.values());
    const responseTimes = services
      .filter(s => s.responseTime !== undefined)
      .map(s => s.responseTime!);
    
    if (responseTimes.length === 0) return 0;
    return responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
  }

  private calculateErrorRate(): number {
    const services = Array.from(this.serviceStatuses.values());
    if (services.length === 0) return 0;
    
    const failedServices = services.filter(s => s.status === 'offline').length;
    return (failedServices / services.length) * 100;
  }

  private getLastIncident(): Date | undefined {
    const services = Array.from(this.serviceStatuses.values());
    const incidents = services
      .filter(s => s.status === 'offline' || s.errorCount > 0)
      .map(s => s.lastCheck)
      .sort((a, b) => b.getTime() - a.getTime());
    
    return incidents[0];
  }

  private calculateOverallHealth(services: ServiceStatus[], metrics: HealthMetric[]): { overall: 'healthy' | 'degraded' | 'critical', score: number } {
    let score = 100;
    
    // Service health impact
    const offlineServices = services.filter(s => s.status === 'offline').length;
    const degradedServices = services.filter(s => s.status === 'degraded').length;
    
    score -= offlineServices * 20; // -20 points per offline service
    score -= degradedServices * 10; // -10 points per degraded service
    
    // Metrics impact
    const criticalMetrics = metrics.filter(m => m.status === 'critical').length;
    const warningMetrics = metrics.filter(m => m.status === 'warning').length;
    
    score -= criticalMetrics * 15; // -15 points per critical metric
    score -= warningMetrics * 5; // -5 points per warning metric
    
    score = Math.max(0, Math.min(100, score));
    
    let overall: 'healthy' | 'degraded' | 'critical';
    if (score >= 80) {
      overall = 'healthy';
    } else if (score >= 50) {
      overall = 'degraded';
    } else {
      overall = 'critical';
    }
    
    return { overall, score };
  }

  private checkMetricAlert(metric: HealthMetric): void {
    if (metric.threshold) {
      if (metric.value >= metric.threshold.critical) {
        metric.status = 'critical';
      } else if (metric.value >= metric.threshold.warning) {
        metric.status = 'warning';
      } else {
        metric.status = 'healthy';
      }
    }
  }

  private async sendWebhookAlert(alert: PerformanceAlert): Promise<void> {
    if (!this.alertConfig.webhookUrl) return;

    await fetch(this.alertConfig.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'system_alert',
        severity: alert.severity,
        metric: alert.metric,
        message: alert.message,
        value: alert.value,
        threshold: alert.threshold,
        timestamp: alert.timestamp.toISOString()
      })
    });
  }

  private async sendEmailAlert(alert: PerformanceAlert): Promise<void> {
    // Email implementation would go here
    logger.info('Email alert would be sent', { alert });
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

// Global service instance
export const systemHealthService = new SystemHealthService();

// Convenience exports for backward compatibility
export const healthCheckService = systemHealthService;
export const healthMonitor = systemHealthService;
export const performanceMonitor = systemHealthService;

// Helper functions
export const getSystemHealth = () => systemHealthService.getHealthReport();
export const getHealthMetrics = () => systemHealthService.getMetrics();
export const getServiceStatuses = () => systemHealthService.getServiceStatuses();
export const getActiveAlerts = () => systemHealthService.getActiveAlerts(); 