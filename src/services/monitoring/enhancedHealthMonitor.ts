// Enhanced Infrastructure Health Monitoring Service
// Week 4.3 Emergency Fixes - IA Charlie System Stabilization
// Real-time health checks with network resilience and fallback mechanisms

import { healthMonitor as baseHealthMonitor, errorBoundary } from './healthMonitor';
import { performanceMonitor } from './performanceMonitor';
import { SystemHealthService } from '../systemHealthService';
import { logger } from '../../utils/logger';

export interface EnhancedHealthCheck {
  name: string;
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  latency: number;
  timestamp: number;
  error?: string;
  fallbackUsed?: boolean;
  retryCount?: number;
  lastSuccess?: number;
}

export interface NetworkResilienceConfig {
  maxRetries: number;
  retryDelayMs: number;
  fallbackTimeout: number;
  offlineDetection: boolean;
  networkChangeDetection: boolean;
}

export interface SystemStabilityMetrics {
  overall: 'stable' | 'degraded' | 'unstable' | 'critical';
  uptime: number;
  errorRate: number;
  responseTimeP95: number;
  availabilityScore: number;
  stabilityTrend: 'improving' | 'stable' | 'degrading';
  lastIncident?: {
    timestamp: number;
    type: string;
    severity: string;
    resolved: boolean;
  };
}

export class EnhancedHealthMonitor {
  private networkConfig: NetworkResilienceConfig;
  private healthHistory: EnhancedHealthCheck[] = [];
  private stabilityMetrics: SystemStabilityMetrics;
  private systemHealthService: SystemHealthService;
  private monitoringInterval: number | null = null;
  private isOnline: boolean = navigator.onLine;
  private fallbackMode: boolean = false;
  private startTime: number = Date.now();
  
  // Network resilience tracking
  private consecutiveFailures: Map<string, number> = new Map();
  private lastSuccessfulCheck: Map<string, number> = new Map();
  private fallbackProviders: Map<string, () => Promise<EnhancedHealthCheck>> = new Map();
  
  constructor(config?: Partial<NetworkResilienceConfig>) {
    this.networkConfig = {
      maxRetries: 3,
      retryDelayMs: 1000,
      fallbackTimeout: 5000,
      offlineDetection: true,
      networkChangeDetection: true,
      ...config
    };
    
    this.systemHealthService = new SystemHealthService();
    this.stabilityMetrics = this.initializeStabilityMetrics();
    
    this.setupNetworkDetection();
    this.setupFallbackProviders();
    
    logger.info('Enhanced Health Monitor initialized with network resilience', {
      config: this.networkConfig,
      fallbackProviders: this.fallbackProviders.size
    });
  }
  
  private initializeStabilityMetrics(): SystemStabilityMetrics {
    return {
      overall: 'stable',
      uptime: 0,
      errorRate: 0,
      responseTimeP95: 0,
      availabilityScore: 100,
      stabilityTrend: 'stable'
    };
  }
  
  private setupNetworkDetection(): void {
    if (!this.networkConfig.networkChangeDetection) return;
    
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.fallbackMode = false;
      logger.info('Network connection restored', { 
        timestamp: Date.now(),
        fallbackMode: this.fallbackMode
      });
      
      // Trigger immediate health check on reconnection
      this.performComprehensiveHealthCheck();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.fallbackMode = true;
      logger.warn('Network connection lost - switching to fallback mode', {
        timestamp: Date.now(),
        fallbackMode: this.fallbackMode
      });
    });
  }
  
  private setupFallbackProviders(): void {
    // Fallback for frontend health
    this.fallbackProviders.set('frontend', async () => ({
      name: 'Frontend (Fallback)',
      status: 'warning' as const,
      latency: 0,
      timestamp: Date.now(),
      fallbackUsed: true,
      error: 'Network unavailable - using local assessment'
    }));
    
    // Fallback for performance assessment
    this.fallbackProviders.set('performance', async () => {
      const memoryUsage = this.getLocalMemoryUsage();
      return {
        name: 'Performance (Fallback)',
        status: memoryUsage > 90 ? 'critical' : memoryUsage > 70 ? 'warning' : 'healthy',
        latency: 0,
        timestamp: Date.now(),
        fallbackUsed: true
      };
    });
    
    // Fallback for storage health
    this.fallbackProviders.set('storage', async () => {
      const storageHealth = this.checkLocalStorageHealth();
      return {
        name: 'Storage (Fallback)',
        status: storageHealth ? 'healthy' : 'warning',
        latency: 0,
        timestamp: Date.now(),
        fallbackUsed: true
      };
    });
  }
  
  async performEnhancedHealthCheck(serviceName: string, url: string): Promise<EnhancedHealthCheck> {
    const startTime = performance.now();
    const retryCount = this.consecutiveFailures.get(serviceName) || 0;
    
    // Check if we should use fallback immediately
    if (this.fallbackMode || retryCount >= this.networkConfig.maxRetries) {
      const fallbackProvider = this.fallbackProviders.get(serviceName);
      if (fallbackProvider) {
        logger.info(`Using fallback provider for ${serviceName}`, { 
          reason: this.fallbackMode ? 'offline' : 'max_retries_exceeded',
          retryCount 
        });
        return await fallbackProvider();
      }
    }
    
    // Attempt normal health check with retries
    for (let attempt = 0; attempt <= this.networkConfig.maxRetries; attempt++) {
      try {
        const response = await this.executeHealthCheckWithTimeout(url);
        const latency = Math.round(performance.now() - startTime);
        
        // Success - reset failure count
        this.consecutiveFailures.delete(serviceName);
        this.lastSuccessfulCheck.set(serviceName, Date.now());
        
        return {
          name: serviceName,
          status: this.determineHealthStatus(response, latency),
          latency,
          timestamp: Date.now(),
          retryCount: attempt
        };
        
      } catch (error) {
        const currentFailures = this.consecutiveFailures.get(serviceName) || 0;
        this.consecutiveFailures.set(serviceName, currentFailures + 1);
        
        // If not the last attempt, wait and retry
        if (attempt < this.networkConfig.maxRetries) {
          await this.delay(this.networkConfig.retryDelayMs * (attempt + 1));
          continue;
        }
        
        // Final attempt failed - check for fallback
        const fallbackProvider = this.fallbackProviders.get(serviceName);
        if (fallbackProvider) {
          logger.warn(`Using fallback after ${attempt + 1} failed attempts for ${serviceName}`);
          return await fallbackProvider();
        }
        
        // No fallback available
        return {
          name: serviceName,
          status: 'critical',
          latency: Math.round(performance.now() - startTime),
          timestamp: Date.now(),
          error: error instanceof Error ? error.message : 'Unknown error',
          retryCount: attempt + 1
        };
      }
    }
    
    // This should never be reached, but TypeScript requires it
    throw new Error('Unexpected end of health check attempts');
  }
  
  private async executeHealthCheckWithTimeout(url: string): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.networkConfig.fallbackTimeout);
    
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        mode: 'no-cors',
        signal: controller.signal,
        cache: 'no-cache'
      });
      
      clearTimeout(timeoutId);
      return response;
      
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }
  
  private determineHealthStatus(response: Response, latency: number): 'healthy' | 'warning' | 'critical' {
    if (!response.ok && response.status >= 500) {
      return 'critical';
    }
    
    if (!response.ok || latency > 5000) {
      return 'warning';
    }
    
    if (latency > 2000) {
      return 'warning';
    }
    
    return 'healthy';
  }
  
  async performComprehensiveHealthCheck(): Promise<SystemStabilityMetrics> {
    const checkStartTime = performance.now();
    
    logger.info('Performing comprehensive health check with network resilience');
    
    // Execute all health checks in parallel
    const healthChecks = await Promise.allSettled([
      this.performEnhancedHealthCheck('Frontend', window.location.origin),
      this.performEnhancedHealthCheck('CDN', 'https://cdn.jsdelivr.net'),
      this.performEnhancedHealthCheck('Performance', '/api/health'), // Fallback handled internally
      this.performEnhancedHealthCheck('Storage', window.location.origin + '/manifest.json')
    ]);
    
    // Process results
    const validChecks: EnhancedHealthCheck[] = healthChecks
      .filter(result => result.status === 'fulfilled')
      .map(result => (result as PromiseFulfilledResult<EnhancedHealthCheck>).value);
    
    // Update health history
    validChecks.forEach(check => {
      this.healthHistory.push(check);
    });
    
    // Keep only last 100 entries
    if (this.healthHistory.length > 100) {
      this.healthHistory = this.healthHistory.slice(-100);
    }
    
    // Calculate stability metrics
    this.updateStabilityMetrics(validChecks, performance.now() - checkStartTime);
    
    // Log comprehensive results
    logger.info('Comprehensive health check completed', {
      totalChecks: healthChecks.length,
      successfulChecks: validChecks.length,
      failedChecks: healthChecks.length - validChecks.length,
      overallStatus: this.stabilityMetrics.overall,
      fallbacksUsed: validChecks.filter(c => c.fallbackUsed).length,
      averageLatency: validChecks.reduce((sum, c) => sum + c.latency, 0) / validChecks.length
    });
    
    return this.stabilityMetrics;
  }
  
  private updateStabilityMetrics(checks: EnhancedHealthCheck[], checkDuration: number): void {
    const now = Date.now();
    this.stabilityMetrics.uptime = now - this.startTime;
    
    // Calculate error rate from last 10 checks per service
    const recentChecks = this.healthHistory.slice(-40); // Last 10 checks per 4 services
    const errorCount = recentChecks.filter(c => c.status === 'critical').length;
    this.stabilityMetrics.errorRate = recentChecks.length > 0 ? (errorCount / recentChecks.length) * 100 : 0;
    
    // Calculate P95 response time
    const latencies = recentChecks.map(c => c.latency).sort((a, b) => a - b);
    const p95Index = Math.floor(latencies.length * 0.95);
    this.stabilityMetrics.responseTimeP95 = latencies[p95Index] || 0;
    
    // Calculate availability score
    const healthyCount = checks.filter(c => c.status === 'healthy').length;
    const warningCount = checks.filter(c => c.status === 'warning').length;
    const criticalCount = checks.filter(c => c.status === 'critical').length;
    
    this.stabilityMetrics.availabilityScore = (
      (healthyCount * 100 + warningCount * 50 + criticalCount * 0) / checks.length
    );
    
    // Determine overall status
    if (criticalCount > checks.length * 0.5) {
      this.stabilityMetrics.overall = 'critical';
    } else if (criticalCount > 0 || warningCount > checks.length * 0.5) {
      this.stabilityMetrics.overall = 'unstable';
    } else if (warningCount > 0) {
      this.stabilityMetrics.overall = 'degraded';
    } else {
      this.stabilityMetrics.overall = 'stable';
    }
    
    // Update stability trend
    this.updateStabilityTrend();
  }
  
  private updateStabilityTrend(): void {
    if (this.healthHistory.length < 20) {
      this.stabilityMetrics.stabilityTrend = 'stable';
      return;
    }
    
    const recent = this.healthHistory.slice(-10);
    const previous = this.healthHistory.slice(-20, -10);
    
    const recentScore = recent.reduce((sum, c) => {
      switch (c.status) {
        case 'healthy': return sum + 100;
        case 'warning': return sum + 50;
        case 'critical': return sum + 0;
        default: return sum + 25;
      }
    }, 0) / recent.length;
    
    const previousScore = previous.reduce((sum, c) => {
      switch (c.status) {
        case 'healthy': return sum + 100;
        case 'warning': return sum + 50;
        case 'critical': return sum + 0;
        default: return sum + 25;
      }
    }, 0) / previous.length;
    
    const scoreDiff = recentScore - previousScore;
    
    if (scoreDiff > 10) {
      this.stabilityMetrics.stabilityTrend = 'improving';
    } else if (scoreDiff < -10) {
      this.stabilityMetrics.stabilityTrend = 'degrading';
    } else {
      this.stabilityMetrics.stabilityTrend = 'stable';
    }
  }
  
  startContinuousMonitoring(intervalMs: number = 60000): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    
    this.monitoringInterval = window.setInterval(async () => {
      try {
        await this.performComprehensiveHealthCheck();
      } catch (error) {
        logger.error('Error during continuous monitoring', error);
        errorBoundary.captureError(
          error instanceof Error ? error : new Error(String(error)),
          'Continuous Monitoring'
        );
      }
    }, intervalMs);
    
    logger.info(`Continuous monitoring started with ${intervalMs}ms interval`);
  }
  
  stopContinuousMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    logger.info('Continuous monitoring stopped');
  }
  
  getStabilityMetrics(): SystemStabilityMetrics {
    return { ...this.stabilityMetrics };
  }
  
  getHealthHistory(limit: number = 50): EnhancedHealthCheck[] {
    return this.healthHistory.slice(-limit);
  }
  
  getNetworkResilienceStatus(): {
    isOnline: boolean;
    fallbackMode: boolean;
    failuresByService: Record<string, number>;
    lastSuccessfulChecks: Record<string, number>;
  } {
    return {
      isOnline: this.isOnline,
      fallbackMode: this.fallbackMode,
      failuresByService: Object.fromEntries(this.consecutiveFailures),
      lastSuccessfulChecks: Object.fromEntries(this.lastSuccessfulCheck)
    };
  }
  
  // Utility methods
  private getLocalMemoryUsage(): number {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
    }
    return 0;
  }
  
  private checkLocalStorageHealth(): boolean {
    try {
      const testKey = 'health_check_test';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // Integration with existing systems
  async integrateWithExistingSystems(): Promise<void> {
    try {
      // Integrate with base health monitor
      const baseStatus = baseHealthMonitor.getStatus();
      if (baseStatus) {
        logger.info('Integrated with base health monitor', baseStatus);
      }
      
      // Integrate with performance monitor
      const performanceReport = performanceMonitor.getPerformanceReport();
      logger.info('Integrated with performance monitor', { 
        metricsCount: Object.keys(performanceReport).length 
      });
      
      // Integrate with system health service
      const systemHealth = await this.systemHealthService.performFullHealthCheck();
      logger.info('Integrated with system health service', {
        overall: systemHealth.overall,
        score: systemHealth.score
      });
      
    } catch (error) {
      logger.error('Error integrating with existing systems', error);
    }
  }
}

// Global enhanced health monitor instance
export const enhancedHealthMonitor = new EnhancedHealthMonitor({
  maxRetries: 3,
  retryDelayMs: 1500,
  fallbackTimeout: 5000,
  offlineDetection: true,
  networkChangeDetection: true
});

// Auto-start in development and production
if (typeof window !== 'undefined') {
  // Initialize integration with existing systems
  enhancedHealthMonitor.integrateWithExistingSystems();
  
  // Start monitoring with appropriate interval
  const interval = process.env.NODE_ENV === 'production' ? 120000 : 60000; // 2min prod, 1min dev
  enhancedHealthMonitor.startContinuousMonitoring(interval);
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    enhancedHealthMonitor.stopContinuousMonitoring();
  });
} 