// Integrated Alert System - Week 4.3 Emergency Fixes
// IA Charlie System Stabilization - Advanced Alert Integration
// Connects Enhanced Health Monitor with existing Alert Systems

import { enhancedHealthMonitor, SystemStabilityMetrics, EnhancedHealthCheck } from './enhancedHealthMonitor';
import { AlertSystem } from '../qualityGates/AlertSystem';
import { SystemHealthService } from '../systemHealthService';
import { logger } from '../../utils/logger';

export interface AlertIntegrationConfig {
  healthCheckAlerts: boolean;
  performanceAlerts: boolean;
  stabilityAlerts: boolean;
  networkResilienceAlerts: boolean;
  alertThresholds: {
    errorRateThreshold: number;
    responseTimeThreshold: number;
    availabilityThreshold: number;
    stabilityDegradationThreshold: number;
  };
  escalationConfig: {
    criticalEscalationTime: number;
    warningEscalationTime: number;
    maxEscalations: number;
  };
}

export interface SystemIncident {
  id: string;
  type: 'health_check_failure' | 'performance_degradation' | 'stability_issue' | 'network_failure';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  startTime: number;
  endTime?: number;
  resolved: boolean;
  impactedServices: string[];
  rootCause?: string;
  resolution?: string;
  escalationLevel: number;
}

export class IntegratedAlertSystem {
  private alertSystem: AlertSystem;
  private systemHealthService: SystemHealthService;
  private config: AlertIntegrationConfig;
  private activeIncidents: Map<string, SystemIncident> = new Map();
  private alertHistory: any[] = [];
  private isMonitoring: boolean = false;
  private monitoringInterval: number | null = null;
  
  // Alert suppression and rate limiting
  private suppressedAlerts: Set<string> = new Set();
  private alertRateLimit: Map<string, number[]> = new Map();
  private readonly maxAlertsPerHour = 10;
  
  constructor(config?: Partial<AlertIntegrationConfig>) {
    this.config = {
      healthCheckAlerts: true,
      performanceAlerts: true,
      stabilityAlerts: true,
      networkResilienceAlerts: true,
      alertThresholds: {
        errorRateThreshold: 5, // 5%
        responseTimeThreshold: 3000, // 3 seconds
        availabilityThreshold: 95, // 95%
        stabilityDegradationThreshold: 80 // 80% degradation
      },
      escalationConfig: {
        criticalEscalationTime: 300000, // 5 minutes
        warningEscalationTime: 900000, // 15 minutes
        maxEscalations: 3
      },
      ...config
    };
    
    this.alertSystem = new AlertSystem();
    this.systemHealthService = new SystemHealthService();
    
    this.setupEventListeners();
    
    logger.info('Integrated Alert System initialized', {
      config: this.config,
      maxAlertsPerHour: this.maxAlertsPerHour
    });
  }
  
  private setupEventListeners(): void {
    // Listen for enhanced health monitor events (simulated)
    this.startHealthMonitoringIntegration();
  }
  
  async startIntegratedMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      logger.warn('Integrated monitoring already running');
      return;
    }
    
    this.isMonitoring = true;
    
    // Start comprehensive monitoring
    this.monitoringInterval = window.setInterval(async () => {
      await this.performIntegratedHealthAssessment();
    }, 30000); // Check every 30 seconds
    
    logger.info('Integrated alert monitoring started');
    
    // Perform initial assessment
    await this.performIntegratedHealthAssessment();
  }
  
  stopIntegratedMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    this.isMonitoring = false;
    logger.info('Integrated alert monitoring stopped');
  }
  
  private async performIntegratedHealthAssessment(): Promise<void> {
    try {
      // Get current system state
      const stabilityMetrics = enhancedHealthMonitor.getStabilityMetrics();
      const healthHistory = enhancedHealthMonitor.getHealthHistory(10);
      const networkStatus = enhancedHealthMonitor.getNetworkResilienceStatus();
      
      // Assess different alert categories
      await Promise.all([
        this.assessHealthCheckAlerts(healthHistory),
        this.assessPerformanceAlerts(stabilityMetrics),
        this.assessStabilityAlerts(stabilityMetrics),
        this.assessNetworkResilienceAlerts(networkStatus)
      ]);
      
      // Update incident statuses
      this.updateIncidentStatuses(stabilityMetrics, healthHistory);
      
    } catch (error) {
      logger.error('Error during integrated health assessment', error);
      
      // Generate alert for monitoring system failure
      await this.triggerAlert({
        type: 'monitoring_system_failure',
        severity: 'high',
        message: 'Integrated alert system encountered an error during health assessment',
        details: {
          error: error instanceof Error ? error.message : String(error),
          timestamp: Date.now()
        },
        timestamp: new Date().toISOString()
      });
    }
  }
  
  private async assessHealthCheckAlerts(healthHistory: EnhancedHealthCheck[]): Promise<void> {
    if (!this.config.healthCheckAlerts || healthHistory.length === 0) return;
    
    // Check for consecutive failures
    const recentChecks = healthHistory.slice(-5);
    const failedServices = new Set<string>();
    
    recentChecks.forEach(check => {
      if (check.status === 'critical') {
        failedServices.add(check.name);
      }
    });
    
    // Alert for critical service failures
    for (const serviceName of failedServices) {
      const serviceChecks = recentChecks.filter(c => c.name === serviceName);
      const consecutiveFailures = serviceChecks.filter(c => c.status === 'critical').length;
      
      if (consecutiveFailures >= 3) {
        await this.triggerServiceFailureAlert(serviceName, consecutiveFailures, serviceChecks);
      }
    }
    
    // Check for fallback usage
    const fallbackUsage = recentChecks.filter(c => c.fallbackUsed).length;
    if (fallbackUsage > recentChecks.length * 0.5) {
      await this.triggerAlert({
        type: 'fallback_mode_active',
        severity: 'medium',
        message: `High fallback usage detected: ${fallbackUsage}/${recentChecks.length} checks using fallbacks`,
        details: {
          fallbackPercentage: (fallbackUsage / recentChecks.length) * 100,
          affectedServices: recentChecks.filter(c => c.fallbackUsed).map(c => c.name)
        },
        timestamp: new Date().toISOString()
      });
    }
  }
  
  private async assessPerformanceAlerts(metrics: SystemStabilityMetrics): Promise<void> {
    if (!this.config.performanceAlerts) return;
    
    const { errorRateThreshold, responseTimeThreshold, availabilityThreshold } = this.config.alertThresholds;
    
    // Error rate alert
    if (metrics.errorRate > errorRateThreshold) {
      await this.triggerAlert({
        type: 'high_error_rate',
        severity: metrics.errorRate > errorRateThreshold * 2 ? 'critical' : 'high',
        message: `Error rate exceeded threshold: ${metrics.errorRate.toFixed(2)}% > ${errorRateThreshold}%`,
        details: {
          currentErrorRate: metrics.errorRate,
          threshold: errorRateThreshold,
          uptime: metrics.uptime
        },
        timestamp: new Date().toISOString()
      });
    }
    
    // Response time alert
    if (metrics.responseTimeP95 > responseTimeThreshold) {
      await this.triggerAlert({
        type: 'slow_response_time',
        severity: metrics.responseTimeP95 > responseTimeThreshold * 2 ? 'high' : 'medium',
        message: `P95 response time exceeded threshold: ${metrics.responseTimeP95}ms > ${responseTimeThreshold}ms`,
        details: {
          currentP95: metrics.responseTimeP95,
          threshold: responseTimeThreshold,
          trend: metrics.stabilityTrend
        },
        timestamp: new Date().toISOString()
      });
    }
    
    // Availability alert
    if (metrics.availabilityScore < availabilityThreshold) {
      await this.triggerAlert({
        type: 'low_availability',
        severity: metrics.availabilityScore < availabilityThreshold * 0.8 ? 'critical' : 'high',
        message: `Availability below threshold: ${metrics.availabilityScore.toFixed(2)}% < ${availabilityThreshold}%`,
        details: {
          currentAvailability: metrics.availabilityScore,
          threshold: availabilityThreshold,
          uptime: metrics.uptime,
          overall: metrics.overall
        },
        timestamp: new Date().toISOString()
      });
    }
  }
  
  private async assessStabilityAlerts(metrics: SystemStabilityMetrics): Promise<void> {
    if (!this.config.stabilityAlerts) return;
    
    // Overall system stability
    if (metrics.overall === 'critical' || metrics.overall === 'unstable') {
      await this.triggerAlert({
        type: 'system_instability',
        severity: metrics.overall === 'critical' ? 'critical' : 'high',
        message: `System stability compromised: ${metrics.overall}`,
        details: {
          stabilityStatus: metrics.overall,
          trend: metrics.stabilityTrend,
          errorRate: metrics.errorRate,
          availabilityScore: metrics.availabilityScore,
          uptime: metrics.uptime
        },
        timestamp: new Date().toISOString()
      });
    }
    
    // Stability trend degradation
    if (metrics.stabilityTrend === 'degrading') {
      await this.triggerAlert({
        type: 'stability_degradation',
        severity: 'medium',
        message: 'System stability trend is degrading',
        details: {
          trend: metrics.stabilityTrend,
          overall: metrics.overall,
          errorRate: metrics.errorRate,
          responseTimeP95: metrics.responseTimeP95
        },
        timestamp: new Date().toISOString()
      });
    }
  }
  
  private async assessNetworkResilienceAlerts(networkStatus: any): Promise<void> {
    if (!this.config.networkResilienceAlerts) return;
    
    // Network offline detection
    if (!networkStatus.isOnline) {
      await this.triggerAlert({
        type: 'network_offline',
        severity: 'high',
        message: 'Network connection lost - system operating in offline mode',
        details: {
          isOnline: networkStatus.isOnline,
          fallbackMode: networkStatus.fallbackMode,
          failuresByService: networkStatus.failuresByService
        },
        timestamp: new Date().toISOString()
      });
    }
    
    // High failure rate for specific services
    Object.entries(networkStatus.failuresByService).forEach(async ([service, failures]) => {
      if (failures >= 5) {
        await this.triggerAlert({
          type: 'service_connectivity_issues',
          severity: failures >= 10 ? 'high' : 'medium',
          message: `High failure count for ${service}: ${failures} consecutive failures`,
          details: {
            service,
            consecutiveFailures: failures,
            lastSuccessful: networkStatus.lastSuccessfulChecks[service] || 'never',
            fallbackMode: networkStatus.fallbackMode
          },
          timestamp: new Date().toISOString()
        });
      }
    });
  }
  
  private async triggerServiceFailureAlert(serviceName: string, failures: number, checks: EnhancedHealthCheck[]): Promise<void> {
    const latestCheck = checks[checks.length - 1];
    
    await this.triggerAlert({
      type: 'service_failure',
      severity: failures >= 5 ? 'critical' : 'high',
      message: `Service ${serviceName} has ${failures} consecutive failures`,
      details: {
        service: serviceName,
        consecutiveFailures: failures,
        latestError: latestCheck.error,
        latestLatency: latestCheck.latency,
        fallbackUsed: latestCheck.fallbackUsed,
        checkHistory: checks.map(c => ({
          status: c.status,
          latency: c.latency,
          timestamp: c.timestamp
        }))
      },
      timestamp: new Date().toISOString()
    });
  }
  
  private async triggerAlert(alert: any): Promise<void> {
    // Rate limiting check
    if (!this.checkRateLimit(alert.type)) {
      logger.warn(`Alert rate limit exceeded for ${alert.type}`);
      return;
    }
    
    // Suppression check
    if (this.suppressedAlerts.has(alert.type)) {
      logger.info(`Alert suppressed: ${alert.type}`);
      return;
    }
    
    try {
      // Use the existing alert system
      await this.alertSystem.triggerAlert(alert);
      
      // Track in history
      this.alertHistory.push({
        ...alert,
        triggeredAt: Date.now(),
        id: this.generateAlertId()
      });
      
      // Create or update incident
      await this.handleIncidentManagement(alert);
      
      logger.info(`Alert triggered: ${alert.type} [${alert.severity}]`, {
        message: alert.message,
        details: alert.details
      });
      
    } catch (error) {
      logger.error('Failed to trigger alert', { alert, error });
    }
  }
  
  private checkRateLimit(alertType: string): boolean {
    const now = Date.now();
    const hourAgo = now - 3600000; // 1 hour ago
    
    if (!this.alertRateLimit.has(alertType)) {
      this.alertRateLimit.set(alertType, []);
    }
    
    const recentAlerts = this.alertRateLimit.get(alertType)!;
    
    // Remove old alerts
    const filteredAlerts = recentAlerts.filter(timestamp => timestamp > hourAgo);
    
    if (filteredAlerts.length >= this.maxAlertsPerHour) {
      return false;
    }
    
    // Add current alert
    filteredAlerts.push(now);
    this.alertRateLimit.set(alertType, filteredAlerts);
    
    return true;
  }
  
  private async handleIncidentManagement(alert: any): Promise<void> {
    const incidentKey = `${alert.type}_${alert.severity}`;
    
    if (this.activeIncidents.has(incidentKey)) {
      // Update existing incident
      const incident = this.activeIncidents.get(incidentKey)!;
      incident.escalationLevel++;
      incident.description += `\n- ${new Date().toISOString()}: ${alert.message}`;
    } else {
      // Create new incident
      const incident: SystemIncident = {
        id: this.generateIncidentId(),
        type: alert.type,
        severity: alert.severity,
        title: alert.message,
        description: alert.message,
        startTime: Date.now(),
        resolved: false,
        impactedServices: this.extractImpactedServices(alert),
        escalationLevel: 0
      };
      
      this.activeIncidents.set(incidentKey, incident);
      logger.info(`New incident created: ${incident.id}`, incident);
    }
  }
  
  private updateIncidentStatuses(metrics: SystemStabilityMetrics, healthHistory: EnhancedHealthCheck[]): void {
    // Auto-resolve incidents when conditions improve
    for (const [key, incident] of this.activeIncidents.entries()) {
      if (this.shouldAutoResolveIncident(incident, metrics, healthHistory)) {
        incident.resolved = true;
        incident.endTime = Date.now();
        incident.resolution = 'Auto-resolved: System metrics returned to normal thresholds';
        
        logger.info(`Incident auto-resolved: ${incident.id}`, {
          duration: incident.endTime - incident.startTime,
          type: incident.type
        });
        
        this.activeIncidents.delete(key);
      }
    }
  }
  
  private shouldAutoResolveIncident(incident: SystemIncident, metrics: SystemStabilityMetrics, healthHistory: EnhancedHealthCheck[]): boolean {
    // Only auto-resolve if system has been stable for at least 5 minutes
    const stabilityDuration = 300000; // 5 minutes
    const recentHealthy = healthHistory.slice(-10).every(check => 
      check.status === 'healthy' && check.timestamp > Date.now() - stabilityDuration
    );
    
    return recentHealthy && 
           metrics.overall === 'stable' && 
           metrics.errorRate < this.config.alertThresholds.errorRateThreshold &&
           metrics.availabilityScore > this.config.alertThresholds.availabilityThreshold;
  }
  
  private extractImpactedServices(alert: any): string[] {
    const services = [];
    
    if (alert.details?.service) {
      services.push(alert.details.service);
    }
    
    if (alert.details?.affectedServices) {
      services.push(...alert.details.affectedServices);
    }
    
    return [...new Set(services)];
  }
  
  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private generateIncidentId(): string {
    return `incident_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private startHealthMonitoringIntegration(): void {
    // Integrate with enhanced health monitor
    enhancedHealthMonitor.startContinuousMonitoring(60000); // 1 minute intervals
  }
  
  // Public API methods
  getActiveIncidents(): SystemIncident[] {
    return Array.from(this.activeIncidents.values());
  }
  
  getAlertHistory(limit: number = 50): any[] {
    return this.alertHistory.slice(-limit);
  }
  
  getSystemStatus(): {
    monitoring: boolean;
    activeIncidents: number;
    alertsLastHour: number;
    suppressedAlerts: number;
  } {
    const hourAgo = Date.now() - 3600000;
    const alertsLastHour = this.alertHistory.filter(a => a.triggeredAt > hourAgo).length;
    
    return {
      monitoring: this.isMonitoring,
      activeIncidents: this.activeIncidents.size,
      alertsLastHour,
      suppressedAlerts: this.suppressedAlerts.size
    };
  }
  
  suppressAlert(alertType: string, durationMs: number = 3600000): void {
    this.suppressedAlerts.add(alertType);
    
    setTimeout(() => {
      this.suppressedAlerts.delete(alertType);
      logger.info(`Alert suppression lifted for ${alertType}`);
    }, durationMs);
    
    logger.info(`Alert suppressed for ${durationMs}ms: ${alertType}`);
  }
  
  resolveIncident(incidentId: string, resolution: string): boolean {
    for (const [key, incident] of this.activeIncidents.entries()) {
      if (incident.id === incidentId) {
        incident.resolved = true;
        incident.endTime = Date.now();
        incident.resolution = resolution;
        
        this.activeIncidents.delete(key);
        
        logger.info(`Incident manually resolved: ${incidentId}`, {
          resolution,
          duration: incident.endTime! - incident.startTime
        });
        
        return true;
      }
    }
    
    return false;
  }
}

// Global integrated alert system instance
export const integratedAlertSystem = new IntegratedAlertSystem({
  healthCheckAlerts: true,
  performanceAlerts: true,
  stabilityAlerts: true,
  networkResilienceAlerts: true,
  alertThresholds: {
    errorRateThreshold: 5,
    responseTimeThreshold: 3000,
    availabilityThreshold: 95,
    stabilityDegradationThreshold: 80
  }
});

// Auto-start integrated monitoring
if (typeof window !== 'undefined') {
  // Start after a brief delay to allow other systems to initialize
  setTimeout(() => {
    integratedAlertSystem.startIntegratedMonitoring();
  }, 5000);
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    integratedAlertSystem.stopIntegratedMonitoring();
  });
} 