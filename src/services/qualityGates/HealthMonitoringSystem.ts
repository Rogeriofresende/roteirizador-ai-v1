// Continuous Health Monitoring System
interface HealthCheck {
  name: string;
  check: () => Promise<HealthCheckResult>;
  interval: number;
  threshold: number;
  critical: boolean;
}

interface HealthCheckResult {
  healthy: boolean;
  metrics: any;
  error?: string;
  timestamp: string;
}

interface HealthStatus {
  overall: 'healthy' | 'warning' | 'critical';
  score: number;
  checks: HealthCheckResult[];
  issues: string[];
  recommendations: string[];
  timestamp: string;
}

interface Alert {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details: any;
  timestamp: string;
}

export class HealthMonitoringSystem {
  private healthChecks: HealthCheck[] = [];
  private monitoringInterval: NodeJS.Timeout | null = null;
  private isMonitoring: boolean = false;
  private healthHistory: HealthStatus[] = [];
  private alertCallbacks: ((alert: Alert) => void)[] = [];
  
  constructor() {
    this.setupHealthChecks();
  }
  
  private setupHealthChecks(): void {
    this.healthChecks = [
      {
        name: 'Application Load',
        check: () => this.checkApplicationLoad(),
        interval: 30000, // 30 seconds
        threshold: 95, // 95% success rate
        critical: true
      },
      {
        name: 'API Response Time',
        check: () => this.checkAPIResponseTime(),
        interval: 15000, // 15 seconds
        threshold: 90,
        critical: true
      },
      {
        name: 'Error Rate',
        check: () => this.checkErrorRate(),
        interval: 60000, // 1 minute
        threshold: 99, // 99% success rate (1% error rate)
        critical: true
      },
      {
        name: 'Performance Metrics',
        check: () => this.checkPerformanceMetrics(),
        interval: 120000, // 2 minutes
        threshold: 85,
        critical: false
      },
      {
        name: 'Memory Usage',
        check: () => this.checkMemoryUsage(),
        interval: 60000, // 1 minute
        threshold: 80, // 80% threshold
        critical: false
      },
      {
        name: 'DOM Health',
        check: () => this.checkDOMHealth(),
        interval: 45000, // 45 seconds
        threshold: 95,
        critical: false
      },
      {
        name: 'Console Errors',
        check: () => this.checkConsoleErrors(),
        interval: 30000, // 30 seconds
        threshold: 99, // 1% error rate acceptable
        critical: true
      },
      {
        name: 'Network Connectivity',
        check: () => this.checkNetworkConnectivity(),
        interval: 60000, // 1 minute
        threshold: 95,
        critical: true
      }
    ];
  }
  
  startMonitoring(): void {
    if (this.isMonitoring) {
      console.log('Health monitoring already running');
      return;
    }
    
    this.isMonitoring = true;
    console.log('🔄 Starting continuous health monitoring...');
    
    // Run initial health check
    this.runHealthCheck();
    
    // Schedule continuous monitoring
    this.monitoringInterval = setInterval(() => {
      this.runHealthCheck();
    }, 10000); // Run every 10 seconds
    
    this.triggerAlert({
      type: 'monitoring_started',
      severity: 'low',
      message: 'Health monitoring system started',
      details: { 
        checksCount: this.healthChecks.length,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });
  }
  
  stopMonitoring(): void {
    if (!this.isMonitoring) {
      console.log('Health monitoring not running');
      return;
    }
    
    this.isMonitoring = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    console.log('⏹️ Health monitoring stopped');
    
    this.triggerAlert({
      type: 'monitoring_stopped',
      severity: 'low',
      message: 'Health monitoring system stopped',
      details: { timestamp: new Date().toISOString() },
      timestamp: new Date().toISOString()
    });
  }
  
  private async runHealthCheck(): Promise<void> {
    const startTime = Date.now();
    const checkResults: HealthCheckResult[] = [];
    
    try {
      // Run all health checks in parallel
      const checkPromises = this.healthChecks.map(async (healthCheck) => {
        try {
          const result = await Promise.race([
            healthCheck.check(),
            new Promise<HealthCheckResult>((_, reject) => 
              setTimeout(() => reject(new Error('Health check timeout')), 10000)
            )
          ]);
          
          await this.processHealthCheckResult(healthCheck, result);
          return result;
        } catch (error) {
          const errorResult: HealthCheckResult = {
            healthy: false,
            error: error instanceof Error ? error.message : String(error),
            metrics: { error: true },
            timestamp: new Date().toISOString()
          };
          
          await this.handleHealthCheckError(healthCheck, errorResult);
          return errorResult;
        }
      });
      
      const results = await Promise.allSettled(checkPromises);
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          checkResults.push(result.value);
        } else {
          checkResults.push({
            healthy: false,
            error: result.reason,
            metrics: { error: true },
            timestamp: new Date().toISOString()
          });
        }
      });
      
      // Calculate overall health status
      const healthStatus = this.calculateHealthStatus(checkResults);
      
      // Store health history
      this.healthHistory.push(healthStatus);
      
      // Keep only last 100 health checks
      if (this.healthHistory.length > 100) {
        this.healthHistory = this.healthHistory.slice(-100);
      }
      
      const executionTime = Date.now() - startTime;
      console.log(`📊 Health check completed in ${executionTime}ms - Status: ${healthStatus.overall}`);
      
      // Trigger alerts for health issues
      if (healthStatus.overall === 'critical' || healthStatus.overall === 'warning') {
        this.triggerHealthAlert(healthStatus);
      }
      
    } catch (error) {
      console.error('Error running health check:', error);
      
      this.triggerAlert({
        type: 'health_check_system_error',
        severity: 'high',
        message: 'Health monitoring system encountered an error',
        details: { error: error instanceof Error ? error.message : String(error) },
        timestamp: new Date().toISOString()
      });
    }
  }
  
  private async checkApplicationLoad(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // Check if main application container exists
      const appContainer = document.querySelector('#app');
      if (!appContainer) {
        throw new Error('Main application container not found');
      }
      
      // Check if React root is mounted
      const reactRoot = appContainer.children.length > 0;
      if (!reactRoot) {
        throw new Error('React application not mounted');
      }
      
      // Test a simple page request
      const response = await fetch(window.location.href, { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      
      const responseTime = Date.now() - startTime;
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return {
        healthy: response.ok && responseTime < 5000,
        metrics: {
          responseTime,
          statusCode: response.status,
          hasAppContainer: !!appContainer,
          hasReactRoot: reactRoot,
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        healthy: false,
        error: error instanceof Error ? error.message : String(error),
        metrics: {
          responseTime: Date.now() - startTime,
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      };
    }
  }
  
  private async checkAPIResponseTime(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // Test API endpoint (using a lightweight request)
      const response = await fetch('/api/health', {
        method: 'GET',
        cache: 'no-cache'
      }).catch(() => {
        // If no API endpoint, use main page as fallback
        return fetch(window.location.href, { method: 'HEAD' });
      });
      
      const responseTime = Date.now() - startTime;
      const healthy = response.ok && responseTime < 2000; // 2 second threshold
      
      return {
        healthy,
        metrics: {
          responseTime,
          statusCode: response.status,
          threshold: 2000,
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        healthy: false,
        error: error instanceof Error ? error.message : String(error),
        metrics: {
          responseTime: Date.now() - startTime,
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      };
    }
  }
  
  private async checkErrorRate(): Promise<HealthCheckResult> {
    try {
      // Monitor console errors
      const errorCount = this.getConsoleErrorCount();
      const totalOperations = this.getTotalOperations();
      
      const errorRate = totalOperations > 0 ? (errorCount / totalOperations) * 100 : 0;
      const healthy = errorRate <= 1; // 1% error rate threshold
      
      return {
        healthy,
        metrics: {
          errorCount,
          totalOperations,
          errorRate,
          threshold: 1,
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        healthy: false,
        error: error instanceof Error ? error.message : String(error),
        metrics: { timestamp: new Date().toISOString() },
        timestamp: new Date().toISOString()
      };
    }
  }
  
  private async checkPerformanceMetrics(): Promise<HealthCheckResult> {
    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (!navigation) {
        return {
          healthy: false,
          error: 'Navigation timing not available',
          metrics: { timestamp: new Date().toISOString() },
          timestamp: new Date().toISOString()
        };
      }
      
      const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
      const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
      
      // Performance thresholds
      const loadTimeThreshold = 3000; // 3 seconds
      const domThreshold = 2000; // 2 seconds
      
      const healthy = loadTime <= loadTimeThreshold && domContentLoaded <= domThreshold;
      
      return {
        healthy,
        metrics: {
          loadTime,
          domContentLoaded,
          loadTimeThreshold,
          domThreshold,
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        healthy: false,
        error: error instanceof Error ? error.message : String(error),
        metrics: { timestamp: new Date().toISOString() },
        timestamp: new Date().toISOString()
      };
    }
  }
  
  private async checkMemoryUsage(): Promise<HealthCheckResult> {
    try {
      if (!performance.memory) {
        return {
          healthy: true,
          metrics: {
            available: false,
            reason: 'Memory API not available',
            timestamp: new Date().toISOString()
          },
          timestamp: new Date().toISOString()
        };
      }
      
      const memory = performance.memory as any;
      const usedMB = memory.usedJSHeapSize / 1024 / 1024;
      const totalMB = memory.totalJSHeapSize / 1024 / 1024;
      const limitMB = memory.jsHeapSizeLimit / 1024 / 1024;
      
      const usagePercentage = (usedMB / limitMB) * 100;
      const healthy = usagePercentage <= 80; // 80% threshold
      
      return {
        healthy,
        metrics: {
          usedMB: Math.round(usedMB),
          totalMB: Math.round(totalMB),
          limitMB: Math.round(limitMB),
          usagePercentage: Math.round(usagePercentage),
          threshold: 80,
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        healthy: false,
        error: error instanceof Error ? error.message : String(error),
        metrics: { timestamp: new Date().toISOString() },
        timestamp: new Date().toISOString()
      };
    }
  }
  
  private async checkDOMHealth(): Promise<HealthCheckResult> {
    try {
      const domStats = {
        totalElements: document.querySelectorAll('*').length,
        scripts: document.querySelectorAll('script').length,
        stylesheets: document.querySelectorAll('link[rel="stylesheet"]').length,
        images: document.querySelectorAll('img').length,
        forms: document.querySelectorAll('form').length
      };
      
      // Check for reasonable DOM size
      const healthy = domStats.totalElements < 10000 && domStats.scripts < 100;
      
      return {
        healthy,
        metrics: {
          ...domStats,
          domSizeThreshold: 10000,
          scriptsThreshold: 100,
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        healthy: false,
        error: error instanceof Error ? error.message : String(error),
        metrics: { timestamp: new Date().toISOString() },
        timestamp: new Date().toISOString()
      };
    }
  }
  
  private async checkConsoleErrors(): Promise<HealthCheckResult> {
    try {
      // This would typically track console errors over time
      // For now, we'll simulate error tracking
      const errorCount = this.getRecentConsoleErrors();
      const healthy = errorCount === 0;
      
      return {
        healthy,
        metrics: {
          recentErrors: errorCount,
          threshold: 0,
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        healthy: false,
        error: error instanceof Error ? error.message : String(error),
        metrics: { timestamp: new Date().toISOString() },
        timestamp: new Date().toISOString()
      };
    }
  }
  
  private async checkNetworkConnectivity(): Promise<HealthCheckResult> {
    try {
      const online = navigator.onLine;
      
      if (!online) {
        return {
          healthy: false,
          error: 'Network offline',
          metrics: {
            online: false,
            timestamp: new Date().toISOString()
          },
          timestamp: new Date().toISOString()
        };
      }
      
      // Test actual connectivity with a simple request
      const startTime = Date.now();
      const response = await fetch('/', { 
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000)
      });
      
      const responseTime = Date.now() - startTime;
      const healthy = response.ok && responseTime < 5000;
      
      return {
        healthy,
        metrics: {
          online: true,
          responseTime,
          statusCode: response.status,
          threshold: 5000,
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        healthy: false,
        error: error instanceof Error ? error.message : String(error),
        metrics: {
          online: navigator.onLine,
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      };
    }
  }
  
  private calculateHealthStatus(checkResults: HealthCheckResult[]): HealthStatus {
    const healthyChecks = checkResults.filter(result => result.healthy);
    const unhealthyChecks = checkResults.filter(result => !result.healthy);
    
    const score = checkResults.length > 0 ? (healthyChecks.length / checkResults.length) * 100 : 0;
    
    // Determine overall status
    let overall: 'healthy' | 'warning' | 'critical';
    const criticalFailures = unhealthyChecks.filter(result => 
      this.healthChecks.find(check => result.error?.includes(check.name))?.critical
    );
    
    if (criticalFailures.length > 0) {
      overall = 'critical';
    } else if (score < 80) {
      overall = 'warning';
    } else {
      overall = 'healthy';
    }
    
    const issues = unhealthyChecks.map(result => 
      result.error || 'Unknown health check failure'
    );
    
    const recommendations = this.generateHealthRecommendations(unhealthyChecks, score);
    
    return {
      overall,
      score: Math.round(score),
      checks: checkResults,
      issues,
      recommendations,
      timestamp: new Date().toISOString()
    };
  }
  
  private generateHealthRecommendations(unhealthyChecks: HealthCheckResult[], score: number): string[] {
    const recommendations: string[] = [];
    
    if (score < 50) {
      recommendations.push('System health is critical - immediate attention required');
    } else if (score < 80) {
      recommendations.push('System health needs attention - monitor closely');
    }
    
    if (unhealthyChecks.length > 0) {
      recommendations.push('Review and address failed health checks');
      recommendations.push('Check system logs for detailed error information');
    }
    
    return recommendations;
  }
  
  private async processHealthCheckResult(healthCheck: HealthCheck, result: HealthCheckResult): Promise<void> {
    // Store result if needed (could implement persistent storage here)
    console.log(`📊 Health check: ${healthCheck.name} - ${result.healthy ? '✅' : '❌'}`);
    
    // Trigger alert for failed critical checks
    if (!result.healthy && healthCheck.critical) {
      this.triggerAlert({
        type: 'critical_health_check_failed',
        severity: 'critical',
        message: `Critical health check failed: ${healthCheck.name}`,
        details: result,
        timestamp: new Date().toISOString()
      });
    }
  }
  
  private async handleHealthCheckError(healthCheck: HealthCheck, result: HealthCheckResult): Promise<void> {
    console.error(`❌ Health check error: ${healthCheck.name}`, result.error);
    
    this.triggerAlert({
      type: 'health_check_error',
      severity: healthCheck.critical ? 'high' : 'medium',
      message: `Health check error: ${healthCheck.name}`,
      details: result,
      timestamp: new Date().toISOString()
    });
  }
  
  private triggerHealthAlert(healthStatus: HealthStatus): void {
    const severity = healthStatus.overall === 'critical' ? 'critical' : 'medium';
    
    this.triggerAlert({
      type: 'health_status_degraded',
      severity,
      message: `System health status: ${healthStatus.overall} (${healthStatus.score}%)`,
      details: healthStatus,
      timestamp: new Date().toISOString()
    });
  }
  
  private triggerAlert(alert: Alert): void {
    console.log(`🚨 ALERT [${alert.severity.toUpperCase()}]: ${alert.message}`);
    
    // Call all registered alert callbacks
    this.alertCallbacks.forEach(callback => {
      try {
        callback(alert);
      } catch (error) {
        console.error('Error in alert callback:', error);
      }
    });
  }
  
  // Utility methods
  private getConsoleErrorCount(): number {
    // In a real implementation, this would track console errors
    return 0;
  }
  
  private getTotalOperations(): number {
    // In a real implementation, this would track total operations
    return 100; // Simulated value
  }
  
  private getRecentConsoleErrors(): number {
    // In a real implementation, this would track recent console errors
    return 0;
  }
  
  // Public methods for external integration
  public onAlert(callback: (alert: Alert) => void): void {
    this.alertCallbacks.push(callback);
  }
  
  public getHealthHistory(): HealthStatus[] {
    return [...this.healthHistory];
  }
  
  public getCurrentHealthStatus(): HealthStatus | null {
    return this.healthHistory.length > 0 ? this.healthHistory[this.healthHistory.length - 1] : null;
  }
  
  public isMonitoringActive(): boolean {
    return this.isMonitoring;
  }
} 