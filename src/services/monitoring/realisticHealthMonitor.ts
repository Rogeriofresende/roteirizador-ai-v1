// Realistic Health Monitor - Week 4.4 Critical Integration Fixes
// IA CHARLIE - Monitoring Reality Check & Quality Gates
// Simplified monitoring that only checks what actually exists

import { logger } from '../../utils/logger';

interface RealisticHealthCheck {
  name: string;
  check: () => Promise<boolean>;
  timeout: number;
  required: boolean;
}

interface HealthStatus {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  checks: Record<string, boolean>;
  timestamp: Date;
  errors: string[];
  score: number;
}

interface SystemInfo {
  uptime: number;
  lastCheck: Date;
  monitoringActive: boolean;
  environment: 'development' | 'production';
}

export class RealisticHealthMonitor {
  private checks: RealisticHealthCheck[] = [];
  private healthHistory: HealthStatus[] = [];
  private startTime: number = Date.now();
  private monitoringInterval?: number;

  constructor() {
    this.setupRealisticChecks();
    logger.info('Realistic Health Monitor initialized - monitoring only existing components');
  }

  private setupRealisticChecks(): void {
    // ✅ REALISTIC: Only monitor things that actually exist
    this.checks = [
      {
        name: 'localStorage_available',
        check: async () => {
          try {
            localStorage.setItem('health_test', 'test');
            localStorage.removeItem('health_test');
            return true;
          } catch {
            return false;
          }
        },
        timeout: 1000,
        required: true
      },
      {
        name: 'analytics_service_available',
        check: async () => {
          try {
            // Import the actual analytics service
            const { analyticsService } = await import('../analyticsService');
            
            // Test if analytics service has required methods (post Alpha fix)
            return typeof analyticsService?.trackEvent === 'function';
          } catch {
            return false;
          }
        },
        timeout: 1000,
        required: true
      },
      {
        name: 'react_rendering',
        check: async () => {
          try {
            // Test if React is rendering without errors
            const reactRoot = document.getElementById('root');
            return reactRoot !== null && reactRoot.children.length > 0;
          } catch {
            return false;
          }
        },
        timeout: 1000,
        required: true
      },
      {
        name: 'firebase_available',
        check: async () => {
          try {
            // Test if Firebase Auth is available (not required for core functionality)
            return typeof window !== 'undefined' && 
                   'firebase' in window;
          } catch {
            return false;
          }
        },
        timeout: 1000,
        required: false
      },
      {
        name: 'browser_apis',
        check: async () => {
          try {
            // Test browser APIs that the app depends on
            return typeof fetch !== 'undefined' &&
                   typeof localStorage !== 'undefined' &&
                   typeof sessionStorage !== 'undefined';
          } catch {
            return false;
          }
        },
        timeout: 500,
        required: true
      }
    ];
  }

  async performHealthCheck(): Promise<HealthStatus> {
    const results: Record<string, boolean> = {};
    const errors: string[] = [];
    let healthyCount = 0;
    let requiredCount = 0;

    for (const check of this.checks) {
      if (check.required) requiredCount++;

      try {
        const result = await this.executeWithTimeout(check.check, check.timeout);
        results[check.name] = result;
        if (result) healthyCount++;
      } catch (error) {
        results[check.name] = false;
        errors.push(`${check.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Determine overall health
    let overall: 'healthy' | 'degraded' | 'unhealthy';
    const requiredHealthy = this.checks
      .filter(c => c.required)
      .filter(c => results[c.name])
      .length;

    if (requiredHealthy === requiredCount && healthyCount === this.checks.length) {
      overall = 'healthy';
    } else if (requiredHealthy === requiredCount) {
      overall = 'degraded';
    } else {
      overall = 'unhealthy';
    }

    // Calculate health score (0-100)
    const score = Math.round((healthyCount / this.checks.length) * 100);

    const healthStatus: HealthStatus = {
      overall,
      checks: results,
      timestamp: new Date(),
      errors,
      score
    };

    // Store in history (keep last 20)
    this.healthHistory.push(healthStatus);
    if (this.healthHistory.length > 20) {
      this.healthHistory = this.healthHistory.slice(-20);
    }

    logger.debug('Realistic health check completed', {
      overall,
      score,
      healthyCount,
      totalChecks: this.checks.length,
      errorsCount: errors.length
    });

    return healthStatus;
  }

  private async executeWithTimeout<T>(
    fn: () => Promise<T>,
    timeout: number
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Health check timeout'));
      }, timeout);

      fn()
        .then(resolve)
        .catch(reject)
        .finally(() => clearTimeout(timer));
    });
  }

  // ✅ SIMPLIFIED: Real monitoring without over-engineering
  startMonitoring(intervalMs: number = 30000): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.monitoringInterval = window.setInterval(async () => {
      try {
        await this.performHealthCheck();
      } catch (error) {
        logger.error('Error during realistic health monitoring', error);
      }
    }, intervalMs);

    logger.info(`Realistic health monitoring started with ${intervalMs}ms interval`);
  }

  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
    logger.info('Realistic health monitoring stopped');
  }

  getStatus(): HealthStatus | null {
    return this.healthHistory.length > 0 ? this.healthHistory[this.healthHistory.length - 1] : null;
  }

  getSystemInfo(): SystemInfo {
    return {
      uptime: Date.now() - this.startTime,
      lastCheck: this.healthHistory.length > 0 ? this.healthHistory[this.healthHistory.length - 1].timestamp : new Date(),
      monitoringActive: this.monitoringInterval !== undefined,
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'development'
    };
  }

  getHealthHistory(): HealthStatus[] {
    return [...this.healthHistory];
  }

  // ✅ REMOVED: No more localhost:3001 dependencies
  // ✅ SIMPLIFIED: From 1,535+ lines to ~200 lines
  // ✅ REALISTIC: Only checks components that exist
  // ✅ FUNCTIONAL: Actually works without connection refused errors
}

// Global instance
export const realisticHealthMonitor = new RealisticHealthMonitor();

// Auto-start monitoring if in browser
if (typeof window !== 'undefined') {
  // Start with reasonable interval
  realisticHealthMonitor.startMonitoring(30000); // 30 seconds
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    realisticHealthMonitor.stopMonitoring();
  });
} 