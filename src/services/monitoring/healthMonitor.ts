// Infrastructure Health Monitoring Service
// Real-time health checks and system status monitoring

export interface HealthCheck {
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  latency: number;
  timestamp: number;
  error?: string;
}

export interface ServiceEndpoint {
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'HEAD';
  timeout: number;
  expectedStatus: number[];
  headers?: Record<string, string>;
}

export interface HealthStatus {
  overall: 'healthy' | 'warning' | 'critical';
  services: HealthCheck[];
  uptime: number;
  lastUpdate: number;
}

export class InfrastructureHealthMonitor {
  private healthChecks: Map<string, HealthCheck> = new Map();
  private startTime: number = Date.now();
  
  async checkService(name: string, url: string): Promise<HealthCheck> {
    const startTime = performance.now();
    
    try {
      const response = await fetch(url, { 
        method: 'HEAD',
        mode: 'no-cors'
      });
      
      const latency = Math.round(performance.now() - startTime);
      
      return {
        name,
        status: 'healthy',
        latency,
        timestamp: Date.now()
      };
      
    } catch (error: unknown) {
      return {
        name,
        status: 'critical',
        latency: Math.round(performance.now() - startTime),
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  async performHealthChecks(): Promise<HealthStatus> {
    const checks = await Promise.all([
      this.checkService('Frontend', window.location.origin),
      this.checkService('CDN', 'https://cdn.jsdelivr.net')
    ]);
    
    checks.forEach(check => {
      this.healthChecks.set(check.name, check);
    });
    
    const criticalCount = checks.filter(c => c.status === 'critical').length;
    const overall = criticalCount > 0 ? 'critical' : 'healthy';
    
    return {
      overall,
      services: checks,
      uptime: Date.now() - this.startTime,
      lastUpdate: Date.now()
    };
  }
  
  getStatus(): HealthStatus | null {
    const services = Array.from(this.healthChecks.values());
    if (services.length === 0) return null;
    
    const criticalCount = services.filter(s => s.status === 'critical').length;
    const overall = criticalCount > 0 ? 'critical' : 'healthy';
    
    return {
      overall,
      services,
      uptime: Date.now() - this.startTime,
      lastUpdate: Math.max(...services.map(s => s.timestamp))
    };
  }
}

// Error boundary for health monitoring
export class HealthMonitoringErrorBoundary {
  private errorCount: number = 0;
  private lastError: Error | null = null;
  
  captureError(error: Error, context?: string) {
    this.errorCount++;
    this.lastError = error;
    
    console.error(`🚨 Health Monitoring Error [${context}]:`, error);
    
    // Send error to monitoring service
    if (typeof window !== 'undefined' && 'fetch' in window) {
      fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: error.message,
          stack: error.stack,
          context,
          timestamp: Date.now(),
          url: window.location.href,
          userAgent: navigator.userAgent
        })
      }).catch(() => {
        // Fail silently to prevent error loops
      });
    }
  }
  
  getErrorStatus() {
    return {
      errorCount: this.errorCount,
      lastError: this.lastError ? {
        message: this.lastError.message,
        stack: this.lastError.stack
      } : null
    };
  }
}

// Global instances
export const healthMonitor = new InfrastructureHealthMonitor();
export const errorBoundary = new HealthMonitoringErrorBoundary();

// Auto-start health monitoring in production
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  healthMonitor.startMonitoring(120000); // Check every 2 minutes
  
  // Global error handling
  window.addEventListener('error', (event) => {
    errorBoundary.captureError(event.error, 'Global Error Handler');
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    errorBoundary.captureError(new Error(event.reason), 'Unhandled Promise Rejection');
  });
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    healthMonitor.stopMonitoring();
  });
} 