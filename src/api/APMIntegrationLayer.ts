/**
 * APM Integration Layer V8.0 - Enterprise Application Performance Monitoring
 * 
 * Integrates with established WeakMemoryManager and AdaptiveSamplingManager
 * following V8.0 Unified Methodology for comprehensive observability
 * 
 * @version 8.0.0
 * @since 2025-01-16
 */

import { WeakMemoryManager } from '../services/memory-management/WeakMemoryManager';
import { AdaptiveSamplingManager } from '../services/performance-optimization/AdaptiveSamplingManager';
import { performance } from 'perf_hooks';
import { EventEmitter } from 'events';

// Types
export interface APMMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  tags?: Record<string, string>;
  source: 'memory' | 'performance' | 'network' | 'user' | 'business';
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface APMAlert {
  id: string;
  metric: string;
  threshold: number;
  current: number;
  message: string;
  timestamp: number;
  acknowledged: boolean;
  resolvedAt?: number;
}

export interface APMDashboard {
  id: string;
  name: string;
  metrics: APMMetric[];
  alerts: APMAlert[];
  timeRange: {
    start: number;
    end: number;
  };
  autoRefresh: boolean;
  refreshInterval: number;
}

export interface PerformanceBudget {
  metric: string;
  budget: number;
  current: number;
  compliance: number; // 0-100%
  lastViolation?: number;
}

export interface ServiceHealth {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  responseTime: number;
  errorRate: number;
  availability: number;
  lastCheck: number;
}

/**
 * APM Integration Layer - Enterprise Performance Monitoring
 * 
 * Coordinates with existing V8.0 systems:
 * - WeakMemoryManager for memory metrics
 * - AdaptiveSamplingManager for performance sampling
 * - Circuit breakers for reliability
 * - Real-time alerting for incidents
 */
export class APMIntegrationLayer extends EventEmitter {
  private static instance: APMIntegrationLayer;
  private memoryManager: WeakMemoryManager;
  private samplingManager: AdaptiveSamplingManager;
  
  private metrics: Map<string, APMMetric> = new Map();
  private alerts: Map<string, APMAlert> = new Map();
  private dashboards: Map<string, APMDashboard> = new Map();
  private performanceBudgets: Map<string, PerformanceBudget> = new Map();
  private serviceHealth: Map<string, ServiceHealth> = new Map();
  
  private metricsBuffer: APMMetric[] = [];
  private bufferFlushInterval: number = 30000; // 30 seconds
  private maxBufferSize: number = 1000;
  
  private monitoringEnabled: boolean = true;
  private realTimeThreshold: number = 5000; // 5 seconds for real-time alerts
  
  private constructor() {
    super();
    this.memoryManager = WeakMemoryManager.getInstance();
    this.samplingManager = new AdaptiveSamplingManager();
    
    this.initializePerformanceBudgets();
    this.startMetricsCollection();
    this.startBufferFlush();
    this.setupEventListeners();
  }

  public static getInstance(): APMIntegrationLayer {
    if (!APMIntegrationLayer.instance) {
      APMIntegrationLayer.instance = new APMIntegrationLayer();
    }
    return APMIntegrationLayer.instance;
  }

  /**
   * Initialize performance budgets based on V8.0 standards
   */
  private initializePerformanceBudgets(): void {
    const budgets: PerformanceBudget[] = [
      {
        metric: 'memory_usage',
        budget: 100 * 1024 * 1024, // 100MB
        current: 0,
        compliance: 100
      },
      {
        metric: 'response_time',
        budget: 5000, // 5ms as established in Priority 1 Corrections
        current: 0,
        compliance: 100
      },
      {
        metric: 'memory_leaks',
        budget: 0, // Zero tolerance for memory leaks
        current: 0,
        compliance: 100
      },
      {
        metric: 'error_rate',
        budget: 1, // 1% error rate threshold
        current: 0,
        compliance: 100
      },
      {
        metric: 'availability',
        budget: 99.9, // 99.9% availability
        current: 100,
        compliance: 100
      }
    ];

    budgets.forEach(budget => {
      this.performanceBudgets.set(budget.metric, budget);
    });
  }

  /**
   * Start comprehensive metrics collection
   */
  private startMetricsCollection(): void {
    // Memory metrics integration
    setInterval(() => {
      this.collectMemoryMetrics();
    }, 10000); // Every 10 seconds

    // Performance metrics integration
    setInterval(() => {
      this.collectPerformanceMetrics();
    }, 5000); // Every 5 seconds

    // Service health monitoring
    setInterval(() => {
      this.collectServiceHealthMetrics();
    }, 30000); // Every 30 seconds

    // Business metrics collection
    setInterval(() => {
      this.collectBusinessMetrics();
    }, 60000); // Every minute
  }

  /**
   * Collect memory metrics from WeakMemoryManager
   */
  private collectMemoryMetrics(): void {
    if (!this.monitoringEnabled) return;

    try {
      const memoryStats = this.memoryManager.getStats();
      
      const metrics: APMMetric[] = [
        {
          id: `memory_usage_${Date.now()}`,
          name: 'memory_usage',
          value: memoryStats.totalMemoryUsage || 0,
          unit: 'bytes',
          timestamp: Date.now(),
          source: 'memory',
          severity: (memoryStats.totalMemoryUsage || 0) > 80 * 1024 * 1024 ? 'high' : 'low',
          tags: {
            type: 'heap',
            environment: process.env.NODE_ENV || 'development'
          }
        },
        {
          id: `memory_leaks_${Date.now()}`,
          name: 'memory_leaks_prevented',
          value: memoryStats.leaksPrevented || 0,
          unit: 'count',
          timestamp: Date.now(),
          source: 'memory',
          severity: 'low',
          tags: {
            type: 'leak_prevention',
            threshold: '0'
          }
        },
        {
          id: `memory_weak_refs_${Date.now()}`,
          name: 'weak_refs_count',
          value: memoryStats.weakRefs || 0,
          unit: 'count',
          timestamp: Date.now(),
          source: 'memory',
          severity: 'low',
          tags: {
            type: 'weak_references'
          }
        }
      ];

      metrics.forEach(metric => {
        this.addMetric(metric);
        this.checkThresholds(metric);
      });

    } catch (error) {
      this.emit('error', {
        type: 'metrics_collection_error',
        source: 'memory',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Collect performance metrics from AdaptiveSamplingManager
   */
  private collectPerformanceMetrics(): void {
    if (!this.monitoringEnabled) return;

    try {
      const perfStats = this.samplingManager.getPerformanceStats();
      
      const metrics: APMMetric[] = [
        {
          id: `performance_overhead_${Date.now()}`,
          name: 'performance_overhead',
          value: perfStats.totalOverhead || 0,
          unit: 'milliseconds',
          timestamp: Date.now(),
          source: 'performance',
          severity: (perfStats.totalOverhead || 0) > 5000 ? 'high' : 'low',
          tags: {
            type: 'system_overhead',
            budget: '5000ms'
          }
        },
        {
          id: `avg_execution_time_${Date.now()}`,
          name: 'avg_execution_time',
          value: perfStats.avgExecutionTime || 0,
          unit: 'milliseconds',
          timestamp: Date.now(),
          source: 'performance',
          severity: (perfStats.avgExecutionTime || 0) > 100 ? 'medium' : 'low',
          tags: {
            type: 'execution_performance'
          }
        },
        {
          id: `budget_utilization_${Date.now()}`,
          name: 'budget_utilization',
          value: perfStats.budgetUtilization || 0,
          unit: 'percentage',
          timestamp: Date.now(),
          source: 'performance',
          severity: (perfStats.budgetUtilization || 0) > 80 ? 'high' : 'low',
          tags: {
            type: 'budget_monitoring',
            threshold: '80%'
          }
        }
      ];

      metrics.forEach(metric => {
        this.addMetric(metric);
        this.checkThresholds(metric);
      });

    } catch (error) {
      this.emit('error', {
        type: 'metrics_collection_error',
        source: 'performance',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Collect service health metrics
   */
  private collectServiceHealthMetrics(): void {
    if (!this.monitoringEnabled) return;

    const services = ['api', 'database', 'cache', 'auth', 'storage'];
    
    services.forEach(service => {
      const startTime = performance.now();
      
      // Simulate health check (in real implementation, this would be actual service calls)
      const health: ServiceHealth = {
        service,
        status: 'healthy',
        responseTime: performance.now() - startTime,
        errorRate: Math.random() * 2, // Simulate error rate
        availability: 99.5 + Math.random() * 0.5,
        lastCheck: Date.now()
      };

      // Determine status based on metrics
      if (health.errorRate > 5) {
        health.status = 'unhealthy';
      } else if (health.errorRate > 2 || health.responseTime > 1000) {
        health.status = 'degraded';
      }

      this.serviceHealth.set(service, health);

      // Create metrics for service health
      const metric: APMMetric = {
        id: `service_health_${service}_${Date.now()}`,
        name: 'service_health',
        value: health.status === 'healthy' ? 1 : health.status === 'degraded' ? 0.5 : 0,
        unit: 'status',
        timestamp: Date.now(),
        source: 'network',
        severity: health.status === 'unhealthy' ? 'critical' : health.status === 'degraded' ? 'medium' : 'low',
        tags: {
          service,
          status: health.status,
          response_time: health.responseTime.toString(),
          availability: health.availability.toString()
        }
      };

      this.addMetric(metric);
      this.checkThresholds(metric);
    });
  }

  /**
   * Collect business metrics
   */
  private collectBusinessMetrics(): void {
    if (!this.monitoringEnabled) return;

    try {
      // Simulate business metrics collection
      const businessMetrics: APMMetric[] = [
        {
          id: `user_sessions_${Date.now()}`,
          name: 'active_users',
          value: Math.floor(Math.random() * 1000) + 100,
          unit: 'count',
          timestamp: Date.now(),
          source: 'business',
          severity: 'low',
          tags: {
            type: 'user_engagement',
            period: 'current'
          }
        },
        {
          id: `api_calls_${Date.now()}`,
          name: 'api_usage',
          value: Math.floor(Math.random() * 10000) + 1000,
          unit: 'count',
          timestamp: Date.now(),
          source: 'business',
          severity: 'low',
          tags: {
            type: 'api_consumption',
            period: 'last_minute'
          }
        }
      ];

      businessMetrics.forEach(metric => {
        this.addMetric(metric);
      });

    } catch (error) {
      this.emit('error', {
        type: 'metrics_collection_error',
        source: 'business',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Add metric to collection and buffer
   */
  private addMetric(metric: APMMetric): void {
    this.metrics.set(metric.id, metric);
    this.metricsBuffer.push(metric);

    // Update performance budgets
    this.updatePerformanceBudget(metric);

    // Emit real-time metric event
    this.emit('metric', metric);

    // Flush buffer if it's full
    if (this.metricsBuffer.length >= this.maxBufferSize) {
      this.flushMetricsBuffer();
    }
  }

  /**
   * Check thresholds and create alerts
   */
  private checkThresholds(metric: APMMetric): void {
    const budget = this.performanceBudgets.get(metric.name);
    if (!budget) return;

    if (metric.value > budget.budget) {
      const alert: APMAlert = {
        id: `alert_${metric.name}_${Date.now()}`,
        metric: metric.name,
        threshold: budget.budget,
        current: metric.value,
        message: `${metric.name} exceeded threshold: ${metric.value}${metric.unit} > ${budget.budget}${metric.unit}`,
        timestamp: Date.now(),
        acknowledged: false
      };

      this.alerts.set(alert.id, alert);
      this.emit('alert', alert);

      // Update budget violation
      budget.lastViolation = Date.now();
      budget.compliance = Math.max(0, 100 - ((metric.value - budget.budget) / budget.budget * 100));
    }
  }

  /**
   * Update performance budget with current metric
   */
  private updatePerformanceBudget(metric: APMMetric): void {
    const budget = this.performanceBudgets.get(metric.name);
    if (!budget) return;

    budget.current = metric.value;
    
    if (metric.value <= budget.budget) {
      budget.compliance = 100;
    } else {
      budget.compliance = Math.max(0, 100 - ((metric.value - budget.budget) / budget.budget * 100));
    }
  }

  /**
   * Setup event listeners for integration
   */
  private setupEventListeners(): void {
    // Note: Memory manager and sampling manager events would be integrated here
    // when they support EventEmitter pattern in future versions
    
    // For now, we rely on periodic metrics collection to detect issues
    this.emit('apm-initialized', { timestamp: Date.now() });
  }

  /**
   * Start automatic buffer flushing
   */
  private startBufferFlush(): void {
    setInterval(() => {
      this.flushMetricsBuffer();
    }, this.bufferFlushInterval);
  }

  /**
   * Flush metrics buffer
   */
  private flushMetricsBuffer(): void {
    if (this.metricsBuffer.length === 0) return;

    const batch = [...this.metricsBuffer];
    this.metricsBuffer = [];

    // Emit batch event for external processing
    this.emit('metrics-batch', batch);

    // Log batch info
    console.log(`APM: Flushed ${batch.length} metrics to storage`);
  }

  // Public API Methods

  /**
   * Get current metrics
   */
  public getMetrics(filter?: {
    source?: string;
    name?: string;
    severity?: string;
    timeRange?: { start: number; end: number };
  }): APMMetric[] {
    let metrics = Array.from(this.metrics.values());

    if (filter) {
      if (filter.source) {
        metrics = metrics.filter(m => m.source === filter.source);
      }
      if (filter.name) {
        metrics = metrics.filter(m => m.name === filter.name);
      }
      if (filter.severity) {
        metrics = metrics.filter(m => m.severity === filter.severity);
      }
      if (filter.timeRange) {
        metrics = metrics.filter(m => 
          m.timestamp >= filter.timeRange!.start && 
          m.timestamp <= filter.timeRange!.end
        );
      }
    }

    return metrics.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Get current alerts
   */
  public getAlerts(filter?: {
    acknowledged?: boolean;
    severity?: string;
    metric?: string;
  }): APMAlert[] {
    let alerts = Array.from(this.alerts.values());

    if (filter) {
      if (filter.acknowledged !== undefined) {
        alerts = alerts.filter(a => a.acknowledged === filter.acknowledged);
      }
      if (filter.severity) {
        // Filter by related metric severity
        alerts = alerts.filter(a => {
          const metric = this.metrics.get(a.metric);
          return metric?.severity === filter.severity;
        });
      }
      if (filter.metric) {
        alerts = alerts.filter(a => a.metric === filter.metric);
      }
    }

    return alerts.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Get performance budgets status
   */
  public getPerformanceBudgets(): PerformanceBudget[] {
    return Array.from(this.performanceBudgets.values());
  }

  /**
   * Get service health status
   */
  public getServiceHealth(): ServiceHealth[] {
    return Array.from(this.serviceHealth.values());
  }

  /**
   * Acknowledge an alert
   */
  public acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.acknowledged = true;
      this.emit('alert-acknowledged', alert);
      return true;
    }
    return false;
  }

  /**
   * Resolve an alert
   */
  public resolveAlert(alertId: string): boolean {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.resolvedAt = Date.now();
      this.emit('alert-resolved', alert);
      return true;
    }
    return false;
  }

  /**
   * Create custom dashboard
   */
  public createDashboard(dashboard: Omit<APMDashboard, 'id'>): string {
    const id = `dashboard_${Date.now()}`;
    const newDashboard: APMDashboard = {
      id,
      ...dashboard
    };
    
    this.dashboards.set(id, newDashboard);
    this.emit('dashboard-created', newDashboard);
    
    return id;
  }

  /**
   * Get dashboard
   */
  public getDashboard(dashboardId: string): APMDashboard | null {
    return this.dashboards.get(dashboardId) || null;
  }

  /**
   * Get all dashboards
   */
  public getDashboards(): APMDashboard[] {
    return Array.from(this.dashboards.values());
  }

  /**
   * Get system overview
   */
  public getSystemOverview(): {
    totalMetrics: number;
    activeAlerts: number;
    systemHealth: string;
    budgetCompliance: number;
    lastUpdate: number;
  } {
    const activeAlerts = this.getAlerts({ acknowledged: false });
    const budgets = this.getPerformanceBudgets();
    
    const averageCompliance = budgets.reduce((sum, budget) => sum + budget.compliance, 0) / budgets.length;
    
    let systemHealth = 'healthy';
    if (activeAlerts.length > 10 || averageCompliance < 80) {
      systemHealth = 'unhealthy';
    } else if (activeAlerts.length > 5 || averageCompliance < 90) {
      systemHealth = 'degraded';
    }

    return {
      totalMetrics: this.metrics.size,
      activeAlerts: activeAlerts.length,
      systemHealth,
      budgetCompliance: averageCompliance,
      lastUpdate: Date.now()
    };
  }

  /**
   * Export metrics for external analysis
   */
  public exportMetrics(format: 'json' | 'csv' = 'json'): string {
    const metrics = this.getMetrics();
    
    if (format === 'csv') {
      const headers = 'id,name,value,unit,timestamp,source,severity,tags';
      const rows = metrics.map(m => [
        m.id,
        m.name,
        m.value,
        m.unit,
        m.timestamp,
        m.source,
        m.severity,
        JSON.stringify(m.tags || {})
      ].join(',')).join('\n');
      
      return headers + '\n' + rows;
    }
    
    return JSON.stringify(metrics, null, 2);
  }

  /**
   * Clean up resources
   */
  public cleanup(): void {
    this.monitoringEnabled = false;
    this.metrics.clear();
    this.alerts.clear();
    this.metricsBuffer = [];
    this.removeAllListeners();
  }

  /**
   * Health check endpoint
   */
  public healthCheck(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    version: string;
    uptime: number;
    metrics: number;
    alerts: number;
    memory: number;
    compliance: number;
  } {
    const overview = this.getSystemOverview();
    const memoryUsage = process.memoryUsage();
    
    return {
      status: overview.systemHealth as any,
      version: '8.0.0',
      uptime: process.uptime(),
      metrics: overview.totalMetrics,
      alerts: overview.activeAlerts,
      memory: memoryUsage.heapUsed,
      compliance: overview.budgetCompliance
    };
  }
}

// Export singleton instance
export const apmIntegrationLayer = APMIntegrationLayer.getInstance();
export default APMIntegrationLayer; 