/**
 * 🚀 V8.0 UNIFIED - IA ALPHA PRIORITY 1 CORRECTIONS
 * ADAPTIVE SAMPLING & CIRCUIT BREAKER SYSTEM
 * 
 * @description Performance overhead optimization through intelligent sampling
 * @author IA Alpha - V8.0 Performance Optimization Specialist
 * @created 2025-01-16
 * @methodology V8.0_UNIFIED_DEVELOPMENT
 */

import { logger } from '../../utils/logger';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface SamplingStrategy {
  id: string;
  name: string;
  baseRate: number;        // Base sampling rate (0-1)
  currentRate: number;     // Current adaptive rate
  minRate: number;         // Minimum sampling rate
  maxRate: number;         // Maximum sampling rate
  performanceTarget: number; // Target execution time (ms)
  priority: 'high' | 'medium' | 'low';
  enabled: boolean;
}

interface CircuitBreakerState {
  id: string;
  state: 'closed' | 'open' | 'half-open';
  failureCount: number;
  lastFailure: number;
  timeout: number;
  threshold: number;
  resetTimeout: number;
}

interface PerformanceMetrics {
  executionTime: number;
  memoryUsage: number;
  cpuUsage: number;
  errorRate: number;
  throughput: number;
  timestamp: number;
}

interface AdaptiveSamplingConfig {
  globalPerformanceBudget: number;  // Max total overhead (ms)
  adaptationInterval: number;        // How often to adjust (ms)
  emergencyThreshold: number;        // Emergency circuit breaker threshold
  degradationSteps: number[];        // Progressive degradation levels
}

// =============================================================================
// ADAPTIVE SAMPLING MANAGER
// =============================================================================

export class AdaptiveSamplingManager {
  private strategies = new Map<string, SamplingStrategy>();
  private circuitBreakers = new Map<string, CircuitBreakerState>();
  private performanceHistory: PerformanceMetrics[] = [];
  private config: AdaptiveSamplingConfig;
  private isInitialized = false;
  private totalOverhead = 0;
  private adaptationInterval: number | null = null;

  constructor(config?: Partial<AdaptiveSamplingConfig>) {
    this.config = {
      globalPerformanceBudget: 5,    // 5ms total budget
      adaptationInterval: 10000,     // Adjust every 10 seconds
      emergencyThreshold: 20,        // Emergency at 20ms
      degradationSteps: [0.1, 0.25, 0.5, 0.75], // Progressive degradation
      ...config
    };
  }

  /**
   * Initialize adaptive sampling system
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Setup default sampling strategies
      this.setupDefaultStrategies();
      
      // Initialize circuit breakers
      this.initializeCircuitBreakers();
      
      // Start adaptive monitoring
      this.startAdaptiveMonitoring();

      this.isInitialized = true;
      
      logger.info('Adaptive Sampling Manager initialized', {
        config: this.config,
        strategiesCount: this.strategies.size,
        circuitBreakersCount: this.circuitBreakers.size
      }, 'ADAPTIVE_SAMPLING');

    } catch (error) {
      logger.error('Failed to initialize Adaptive Sampling Manager', { error }, 'ADAPTIVE_SAMPLING');
      throw error;
    }
  }

  /**
   * Setup default sampling strategies for different types of monitoring
   */
  private setupDefaultStrategies(): void {
    const defaultStrategies: SamplingStrategy[] = [
      {
        id: 'memory_monitoring',
        name: 'Memory Usage Monitoring',
        baseRate: 1.0,
        currentRate: 1.0,
        minRate: 0.1,
        maxRate: 1.0,
        performanceTarget: 1.0,
        priority: 'high',
        enabled: true
      },
      {
        id: 'performance_observers',
        name: 'Performance Observers',
        baseRate: 1.0,
        currentRate: 1.0,
        minRate: 0.2,
        maxRate: 1.0,
        performanceTarget: 2.0,
        priority: 'high',
        enabled: true
      },
      {
        id: 'network_monitoring',
        name: 'Network Monitoring',
        baseRate: 0.8,
        currentRate: 0.8,
        minRate: 0.1,
        maxRate: 1.0,
        performanceTarget: 1.5,
        priority: 'medium',
        enabled: true
      },
      {
        id: 'user_interactions',
        name: 'User Interaction Tracking',
        baseRate: 1.0,
        currentRate: 1.0,
        minRate: 0.5,
        maxRate: 1.0,
        performanceTarget: 0.5,
        priority: 'high',
        enabled: true
      },
      {
        id: 'analytics_collection',
        name: 'Analytics Collection',
        baseRate: 0.3,
        currentRate: 0.3,
        minRate: 0.05,
        maxRate: 0.5,
        performanceTarget: 2.0,
        priority: 'low',
        enabled: true
      }
    ];

    defaultStrategies.forEach(strategy => {
      this.strategies.set(strategy.id, strategy);
    });

    logger.debug('Default sampling strategies setup', {
      strategiesCount: defaultStrategies.length
    }, 'ADAPTIVE_SAMPLING');
  }

  /**
   * Initialize circuit breakers for different systems
   */
  private initializeCircuitBreakers(): void {
    const systems = ['memory_monitoring', 'performance_observers', 'network_monitoring', 'analytics_collection'];
    
    systems.forEach(systemId => {
      this.circuitBreakers.set(systemId, {
        id: systemId,
        state: 'closed',
        failureCount: 0,
        lastFailure: 0,
        timeout: 30000,    // 30 seconds timeout
        threshold: 5,      // 5 failures before opening
        resetTimeout: 60000 // 1 minute reset timeout
      });
    });

    logger.debug('Circuit breakers initialized', {
      systems: systems.length
    }, 'ADAPTIVE_SAMPLING');
  }

  /**
   * Start adaptive monitoring and adjustment
   */
  private startAdaptiveMonitoring(): void {
    this.adaptationInterval = window.setInterval(() => {
      this.adaptSamplingRates();
      this.updateCircuitBreakers();
      this.enforcePerformanceBudget();
    }, this.config.adaptationInterval);

    logger.debug('Adaptive monitoring started', {
      interval: this.config.adaptationInterval
    }, 'ADAPTIVE_SAMPLING');
  }

  /**
   * Determine if sampling should occur for a given strategy
   */
  shouldSample(strategyId: string): boolean {
    const strategy = this.strategies.get(strategyId);
    if (!strategy || !strategy.enabled) {
      return false;
    }

    // Check circuit breaker
    const circuitBreaker = this.circuitBreakers.get(strategyId);
    if (circuitBreaker && circuitBreaker.state === 'open') {
      return false;
    }

    // Apply sampling rate
    return Math.random() < strategy.currentRate;
  }

  /**
   * Record performance metrics for a sampling operation
   */
  recordMetrics(strategyId: string, executionTime: number, success: boolean = true): void {
    const strategy = this.strategies.get(strategyId);
    if (!strategy) return;

    // Record performance
    this.performanceHistory.push({
      executionTime,
      memoryUsage: this.getCurrentMemoryUsage(),
      cpuUsage: 0, // Would be calculated from actual metrics
      errorRate: success ? 0 : 1,
      throughput: 1,
      timestamp: Date.now()
    });

    // Keep only recent history (last 100 measurements)
    if (this.performanceHistory.length > 100) {
      this.performanceHistory = this.performanceHistory.slice(-100);
    }

    // Update circuit breaker
    this.updateCircuitBreakerState(strategyId, success, executionTime);

    // Update total overhead
    this.totalOverhead += executionTime;

    logger.debug('Performance metrics recorded', {
      strategyId,
      executionTime,
      success,
      totalOverhead: this.totalOverhead
    }, 'ADAPTIVE_SAMPLING');
  }

  /**
   * Adapt sampling rates based on performance
   */
  private adaptSamplingRates(): void {
    const recentMetrics = this.getRecentMetrics(30000); // Last 30 seconds
    const avgExecutionTime = this.calculateAverageExecutionTime(recentMetrics);

    this.strategies.forEach((strategy, id) => {
      const strategyMetrics = recentMetrics.filter(m => 
        Math.abs(m.timestamp - Date.now()) < 30000
      );

      if (strategyMetrics.length === 0) return;

      const avgTime = this.calculateAverageExecutionTime(strategyMetrics);
      let newRate = strategy.currentRate;

      // Adjust rate based on performance
      if (avgTime > strategy.performanceTarget * 2) {
        // Much slower than target, decrease rate significantly
        newRate = Math.max(strategy.minRate, strategy.currentRate * 0.5);
      } else if (avgTime > strategy.performanceTarget) {
        // Slower than target, decrease rate
        newRate = Math.max(strategy.minRate, strategy.currentRate * 0.8);
      } else if (avgTime < strategy.performanceTarget * 0.5) {
        // Much faster than target, can increase rate
        newRate = Math.min(strategy.maxRate, strategy.currentRate * 1.2);
      } else if (avgTime < strategy.performanceTarget) {
        // Faster than target, slightly increase rate
        newRate = Math.min(strategy.maxRate, strategy.currentRate * 1.1);
      }

      // Apply budget constraints
      if (this.totalOverhead > this.config.globalPerformanceBudget) {
        newRate *= 0.5; // Halve rate if over budget
      }

      strategy.currentRate = newRate;

      logger.debug('Sampling rate adapted', {
        strategyId: id,
        oldRate: strategy.currentRate,
        newRate,
        avgExecutionTime: avgTime,
        target: strategy.performanceTarget
      }, 'ADAPTIVE_SAMPLING');
    });

    // Reset total overhead for next period
    this.totalOverhead = 0;
  }

  /**
   * Update circuit breaker states
   */
  private updateCircuitBreakers(): void {
    this.circuitBreakers.forEach((breaker, id) => {
      const now = Date.now();

      switch (breaker.state) {
        case 'open':
          // Check if timeout has passed
          if (now - breaker.lastFailure > breaker.resetTimeout) {
            breaker.state = 'half-open';
            breaker.failureCount = 0;
            
            logger.info('Circuit breaker moved to half-open', { id }, 'ADAPTIVE_SAMPLING');
          }
          break;

        case 'half-open':
          // In half-open state, one failure closes the circuit again
          // This is handled in updateCircuitBreakerState method
          break;

        case 'closed':
          // Reset failure count if no recent failures
          if (now - breaker.lastFailure > breaker.timeout && breaker.failureCount > 0) {
            breaker.failureCount = Math.max(0, breaker.failureCount - 1);
          }
          break;
      }
    });
  }

  /**
   * Update individual circuit breaker state
   */
  private updateCircuitBreakerState(strategyId: string, success: boolean, executionTime: number): void {
    const breaker = this.circuitBreakers.get(strategyId);
    if (!breaker) return;

    const now = Date.now();

    if (!success || executionTime > this.config.emergencyThreshold) {
      breaker.failureCount++;
      breaker.lastFailure = now;

      if (breaker.state === 'half-open') {
        // In half-open, any failure reopens the circuit
        breaker.state = 'open';
        logger.warn('Circuit breaker reopened', { strategyId }, 'ADAPTIVE_SAMPLING');
      } else if (breaker.failureCount >= breaker.threshold) {
        // Too many failures, open the circuit
        breaker.state = 'open';
        logger.warn('Circuit breaker opened', { 
          strategyId, 
          failureCount: breaker.failureCount 
        }, 'ADAPTIVE_SAMPLING');
      }
    } else if (breaker.state === 'half-open') {
      // Success in half-open state, close the circuit
      breaker.state = 'closed';
      breaker.failureCount = 0;
      logger.info('Circuit breaker closed', { strategyId }, 'ADAPTIVE_SAMPLING');
    }
  }

  /**
   * Enforce global performance budget
   */
  private enforcePerformanceBudget(): void {
    if (this.totalOverhead > this.config.globalPerformanceBudget) {
      const excessOverhead = this.totalOverhead - this.config.globalPerformanceBudget;
      
      logger.warn('Performance budget exceeded', {
        totalOverhead: this.totalOverhead,
        budget: this.config.globalPerformanceBudget,
        excess: excessOverhead
      }, 'ADAPTIVE_SAMPLING');

      // Apply emergency degradation
      this.applyEmergencyDegradation();
    }
  }

  /**
   * Apply emergency performance degradation
   */
  private applyEmergencyDegradation(): void {
    // Sort strategies by priority (low priority first for degradation)
    const sortedStrategies = Array.from(this.strategies.values())
      .sort((a, b) => {
        const priorityOrder = { low: 0, medium: 1, high: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });

    // Apply progressive degradation
    sortedStrategies.forEach((strategy, index) => {
      const degradationLevel = Math.min(
        index / sortedStrategies.length, 
        this.config.degradationSteps.length - 1
      );
      
      const degradationFactor = this.config.degradationSteps[Math.floor(degradationLevel)];
      strategy.currentRate = Math.max(strategy.minRate, strategy.currentRate * degradationFactor);
    });

    logger.warn('Emergency degradation applied', {
      affectedStrategies: sortedStrategies.length
    }, 'ADAPTIVE_SAMPLING');
  }

  /**
   * Get recent performance metrics
   */
  private getRecentMetrics(timeWindowMs: number): PerformanceMetrics[] {
    const cutoff = Date.now() - timeWindowMs;
    return this.performanceHistory.filter(m => m.timestamp > cutoff);
  }

  /**
   * Calculate average execution time from metrics
   */
  private calculateAverageExecutionTime(metrics: PerformanceMetrics[]): number {
    if (metrics.length === 0) return 0;
    return metrics.reduce((sum, m) => sum + m.executionTime, 0) / metrics.length;
  }

  /**
   * Get current memory usage
   */
  private getCurrentMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }

  /**
   * Get current performance statistics
   */
  getPerformanceStats() {
    const recentMetrics = this.getRecentMetrics(60000); // Last minute
    const avgExecutionTime = this.calculateAverageExecutionTime(recentMetrics);
    
    return {
      totalOverhead: this.totalOverhead,
      budget: this.config.globalPerformanceBudget,
      budgetUtilization: (this.totalOverhead / this.config.globalPerformanceBudget) * 100,
      avgExecutionTime,
      strategiesEnabled: Array.from(this.strategies.values()).filter(s => s.enabled).length,
      circuitBreakersOpen: Array.from(this.circuitBreakers.values()).filter(cb => cb.state === 'open').length,
      samplingRates: Object.fromEntries(
        Array.from(this.strategies.entries()).map(([id, strategy]) => [id, strategy.currentRate])
      )
    };
  }

  /**
   * Dispose adaptive sampling manager
   */
  dispose(): void {
    if (this.adaptationInterval) {
      window.clearInterval(this.adaptationInterval);
      this.adaptationInterval = null;
    }

    this.strategies.clear();
    this.circuitBreakers.clear();
    this.performanceHistory = [];
    this.isInitialized = false;

    logger.info('Adaptive Sampling Manager disposed', {}, 'ADAPTIVE_SAMPLING');
  }
}

export default AdaptiveSamplingManager; 