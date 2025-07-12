// API Monitoring Service for Gemini Integration
import { geminiService } from './geminiService';
import { analyticsService } from './analyticsService';

export class APIMonitoringService {
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private healthCheckFrequency = 30000; // 30 seconds
  private metrics: APIMetrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    uptime: 0,
    lastHealthCheck: null,
    circuitBreakerState: 'CLOSED',
    failureRate: 0
  };

  constructor() {
    this.loadMetrics();
  }

  startMonitoring(): void {
    console.log('🔍 Iniciando monitoramento da API Gemini...');
    
    // Start health check interval
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, this.healthCheckFrequency);

    // Initial health check
    this.performHealthCheck();
  }

  stopMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
      console.log('⏹️ Monitoramento da API Gemini parado.');
    }
  }

  private async performHealthCheck(): Promise<void> {
    const startTime = Date.now();
    
    try {
      const isHealthy = await geminiService.testConnection();
      const responseTime = Date.now() - startTime;
      
      this.updateMetrics({
        successful: isHealthy,
        responseTime,
        circuitBreakerState: geminiService.getSystemStatus().circuitBreakerState
      });

      if (isHealthy) {
        console.log(`✅ API Health Check: OK (${responseTime}ms)`);
      } else {
        console.warn(`⚠️ API Health Check: FAILED (${responseTime}ms)`);
        this.handleHealthCheckFailure();
      }

    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error('❌ Health Check Error:', error);
      
      this.updateMetrics({
        successful: false,
        responseTime,
        circuitBreakerState: geminiService.getSystemStatus().circuitBreakerState
      });
      
      this.handleHealthCheckFailure();
    }
  }

  private updateMetrics(checkResult: {
    successful: boolean;
    responseTime: number;
    circuitBreakerState: string;
  }): void {
    this.metrics.totalRequests++;
    
    if (checkResult.successful) {
      this.metrics.successfulRequests++;
    } else {
      this.metrics.failedRequests++;
    }

    // Update average response time
    this.metrics.averageResponseTime = (
      (this.metrics.averageResponseTime * (this.metrics.totalRequests - 1)) + 
      checkResult.responseTime
    ) / this.metrics.totalRequests;

    // Update failure rate
    this.metrics.failureRate = (this.metrics.failedRequests / this.metrics.totalRequests) * 100;

    // Update circuit breaker state
    this.metrics.circuitBreakerState = checkResult.circuitBreakerState;
    
    // Update last health check
    this.metrics.lastHealthCheck = new Date();

    // Calculate uptime (simplified)
    this.metrics.uptime = (this.metrics.successfulRequests / this.metrics.totalRequests) * 100;

    // Save metrics
    this.saveMetrics();

    // Track analytics
    analyticsService.trackUserAction('api_health_check', {
      successful: checkResult.successful,
      response_time: checkResult.responseTime,
      circuit_breaker_state: checkResult.circuitBreakerState,
      failure_rate: this.metrics.failureRate,
      uptime: this.metrics.uptime
    });
  }

  private handleHealthCheckFailure(): void {
    // Alert if failure rate is high
    if (this.metrics.failureRate > 50) {
      console.error('🚨 HIGH FAILURE RATE DETECTED:', this.metrics.failureRate + '%');
      
      // Track critical alert
      analyticsService.trackError('High API Failure Rate', {
        failure_rate: this.metrics.failureRate,
        uptime: this.metrics.uptime,
        circuit_breaker_state: this.metrics.circuitBreakerState
      });
    }

    // Alert if circuit breaker is open
    if (this.metrics.circuitBreakerState === 'OPEN') {
      console.error('🚨 CIRCUIT BREAKER OPEN - API UNAVAILABLE');
      
      analyticsService.trackError('Circuit Breaker Open', {
        uptime: this.metrics.uptime,
        failure_rate: this.metrics.failureRate
      });
    }
  }

  getMetrics(): APIMetrics {
    return { ...this.metrics };
  }

  getHealthStatus(): HealthStatus {
    const systemStatus = geminiService.getSystemStatus();
    
    return {
      healthy: systemStatus.configured && this.metrics.circuitBreakerState === 'CLOSED',
      configured: systemStatus.configured,
      circuitBreakerState: systemStatus.circuitBreakerState,
      failureCount: systemStatus.failureCount,
      lastTested: systemStatus.lastTested,
      uptime: this.metrics.uptime,
      averageResponseTime: this.metrics.averageResponseTime,
      failureRate: this.metrics.failureRate
    };
  }

  private saveMetrics(): void {
    try {
      localStorage.setItem('api_metrics', JSON.stringify(this.metrics));
    } catch (error) {
      console.warn('Failed to save API metrics:', error);
    }
  }

  private loadMetrics(): void {
    try {
      const saved = localStorage.getItem('api_metrics');
      if (saved) {
        this.metrics = { ...this.metrics, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.warn('Failed to load API metrics:', error);
    }
  }

  // Reset metrics (for testing)
  resetMetrics(): void {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      uptime: 0,
      lastHealthCheck: null,
      circuitBreakerState: 'CLOSED',
      failureRate: 0
    };
    this.saveMetrics();
  }
}

// Types
interface APIMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  uptime: number;
  lastHealthCheck: Date | null;
  circuitBreakerState: string;
  failureRate: number;
}

interface HealthStatus {
  healthy: boolean;
  configured: boolean;
  circuitBreakerState: string;
  failureCount: number;
  lastTested: Date | null;
  uptime: number;
  averageResponseTime: number;
  failureRate: number;
}

// Singleton export
export const apiMonitoringService = new APIMonitoringService(); 