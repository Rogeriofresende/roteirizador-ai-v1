/**
 * 🔗 SYSTEM HEALTH HOOK V8.0 - UNIFIED INTEGRATION
 * Hook unificado para todos os sistemas consolidados
 * Integra: DI + Cache + Monitoring + Performance
 * Metodologia: V8.0 Consolidation Strategy
 */

import { useEffect, useState, useCallback } from 'react';
import { useDI } from '../components/integration/DIProvider';
import { useCache } from '../components/integration/CacheProvider';
import { useMonitoring } from '../components/integration/MonitoringProvider';
import { createLogger } from '../utils/logger';

const logger = createLogger('useSystemHealth');

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface SystemOverview {
  overall: {
    status: 'healthy' | 'degraded' | 'critical';
    score: number; // 0-100
    lastUpdate: number;
  };
  di: {
    isInitialized: boolean;
    totalServices: number;
    healthyServices: number;
    averageResponseTime: number;
  };
  cache: {
    isInitialized: boolean;
    hitRate: number;
    memoryUsage: number;
    entriesCount: number;
  };
  monitoring: {
    isInitialized: boolean;
    systemHealth: any;
    alertCount: number;
    performanceScore: number;
  };
}

interface SystemActions {
  refreshAll: () => Promise<void>;
  runDiagnostics: () => Promise<DiagnosticReport>;
  clearCaches: () => Promise<void>;
  exportMetrics: () => SystemMetricsExport;
}

interface DiagnosticReport {
  timestamp: number;
  duration: number;
  tests: {
    di: { passed: boolean; time: number; details: string };
    cache: { passed: boolean; time: number; details: string };
    monitoring: { passed: boolean; time: number; details: string };
    integration: { passed: boolean; time: number; details: string };
  };
  recommendations: string[];
  overallHealth: number;
}

interface SystemMetricsExport {
  timestamp: number;
  version: string;
  systems: {
    di: any;
    cache: any;
    monitoring: any;
  };
  performance: {
    responseTime: number;
    memoryUsage: number;
    cacheEfficiency: number;
  };
}

// =============================================================================
// MAIN HOOK
// =============================================================================

export const useSystemHealth = () => {
  const di = useDI();
  const cache = useCache();
  const monitoring = useMonitoring();
  
  const [overview, setOverview] = useState<SystemOverview>({
    overall: { status: 'healthy', score: 100, lastUpdate: Date.now() },
    di: { isInitialized: false, totalServices: 0, healthyServices: 0, averageResponseTime: 0 },
    cache: { isInitialized: false, hitRate: 0, memoryUsage: 0, entriesCount: 0 },
    monitoring: { isInitialized: false, systemHealth: null, alertCount: 0, performanceScore: 100 }
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastDiagnostic, setLastDiagnostic] = useState<DiagnosticReport | null>(null);

  // =============================================================================
  // SYSTEM OVERVIEW CALCULATION
  // =============================================================================

  const calculateOverview = useCallback((): SystemOverview => {
    try {
      // DI System Status
      const diStatus = {
        isInitialized: di.isInitialized,
        totalServices: di.registryMetrics.totalServices,
        healthyServices: di.registryMetrics.healthyServices,
        averageResponseTime: di.registryMetrics.averageResponseTime
      };

      // Cache System Status  
      const cacheStatus = {
        isInitialized: cache.isInitialized,
        hitRate: cache.metrics.hitRate,
        memoryUsage: cache.metrics.memoryUsage,
        entriesCount: cache.metrics.entriesCount
      };

      // Monitoring System Status
      const monitoringStatus = {
        isInitialized: monitoring.isInitialized,
        systemHealth: monitoring.systemHealth,
        alertCount: monitoring.alerts.length,
        performanceScore: monitoring.systemHealth.score
      };

      // Calculate overall score
      const scores = [
        diStatus.isInitialized ? (diStatus.healthyServices / Math.max(diStatus.totalServices, 1)) * 100 : 0,
        cacheStatus.isInitialized ? Math.min(cacheStatus.hitRate, 100) : 0,
        monitoringStatus.isInitialized ? monitoringStatus.performanceScore : 0
      ];

      const overallScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      const overallStatus = overallScore >= 80 ? 'healthy' : overallScore >= 50 ? 'degraded' : 'critical';

      return {
        overall: {
          status: overallStatus,
          score: overallScore,
          lastUpdate: Date.now()
        },
        di: diStatus,
        cache: cacheStatus,
        monitoring: monitoringStatus
      };
    } catch (error) {
      logger.error('Error calculating system overview:', error);
      return overview; // Return previous state on error
    }
  }, [di, cache, monitoring, overview]);

  // =============================================================================
  // SYSTEM ACTIONS
  // =============================================================================

  const refreshAll = useCallback(async (): Promise<void> => {
    try {
      setIsRefreshing(true);
      logger.info('🔄 Refreshing all systems...');

      const promises = [];

      // Refresh DI system if not initialized
      if (!di.isInitialized) {
        promises.push(di.bootstrap());
      }

      // Run health check in monitoring
      if (monitoring.isInitialized) {
        promises.push(monitoring.runHealthCheck());
      }

      await Promise.all(promises);
      
      // Update overview
      const newOverview = calculateOverview();
      setOverview(newOverview);

      logger.info('✅ All systems refreshed successfully');
    } catch (error) {
      logger.error('❌ Error refreshing systems:', error);
      throw error;
    } finally {
      setIsRefreshing(false);
    }
  }, [di, monitoring, calculateOverview]);

  const runDiagnostics = useCallback(async (): Promise<DiagnosticReport> => {
    try {
      logger.info('🔍 Running system diagnostics...');
      const startTime = performance.now();

      const tests = {
        di: await testDISystem(),
        cache: await testCacheSystem(),
        monitoring: await testMonitoringSystem(),
        integration: await testIntegration()
      };

      const duration = performance.now() - startTime;
      const passedTests = Object.values(tests).filter(test => test.passed).length;
      const overallHealth = (passedTests / Object.keys(tests).length) * 100;

      const recommendations = generateRecommendations(tests);

      const report: DiagnosticReport = {
        timestamp: Date.now(),
        duration,
        tests,
        recommendations,
        overallHealth
      };

      setLastDiagnostic(report);
      logger.info(`✅ Diagnostics completed in ${duration.toFixed(2)}ms`);
      
      return report;
    } catch (error) {
      logger.error('❌ Error running diagnostics:', error);
      throw error;
    }
  }, []);

  const clearCaches = useCallback(async (): Promise<void> => {
    try {
      logger.info('🗑️ Clearing all caches...');
      
      if (cache.isInitialized) {
        await cache.clear();
      }

      // Clear browser caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }

      logger.info('✅ All caches cleared');
    } catch (error) {
      logger.error('❌ Error clearing caches:', error);
      throw error;
    }
  }, [cache]);

  const exportMetrics = useCallback((): SystemMetricsExport => {
    try {
      return {
        timestamp: Date.now(),
        version: '8.0',
        systems: {
          di: {
            isInitialized: di.isInitialized,
            metrics: di.registryMetrics,
            services: Object.keys(di.services)
          },
          cache: {
            isInitialized: cache.isInitialized,
            metrics: cache.metrics
          },
          monitoring: {
            isInitialized: monitoring.isInitialized,
            health: monitoring.systemHealth,
            alerts: monitoring.alerts.length,
            metrics: monitoring.performanceMetrics
          }
        },
        performance: {
          responseTime: di.registryMetrics.averageResponseTime,
          memoryUsage: cache.metrics.memoryUsage,
          cacheEfficiency: cache.metrics.hitRate
        }
      };
    } catch (error) {
      logger.error('Error exporting metrics:', error);
      throw error;
    }
  }, [di, cache, monitoring]);

  // =============================================================================
  // DIAGNOSTIC TESTS
  // =============================================================================

  const testDISystem = async () => {
    const startTime = performance.now();
    try {
      if (!di.isInitialized) {
        throw new Error('DI system not initialized');
      }

      // Test service access
      const analyticsService = di.getService('AnalyticsService');
      if (!analyticsService) {
        throw new Error('Failed to access analytics service');
      }

      const time = performance.now() - startTime;
      return {
        passed: true,
        time,
        details: `DI system healthy, ${di.registryMetrics.totalServices} services registered`
      };
    } catch (error) {
      return {
        passed: false,
        time: performance.now() - startTime,
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const testCacheSystem = async () => {
    const startTime = performance.now();
    try {
      if (!cache.isInitialized) {
        throw new Error('Cache system not initialized');
      }

      // Test cache operations
      const testKey = 'health-check-test';
      const testValue = { test: true, timestamp: Date.now() };
      
      await cache.set(testKey, testValue);
      const retrieved = await cache.get(testKey);
      
      if (!retrieved || retrieved.test !== true) {
        throw new Error('Cache set/get test failed');
      }

      await cache.delete(testKey);

      const time = performance.now() - startTime;
      return {
        passed: true,
        time,
        details: `Cache system healthy, ${cache.metrics.hitRate.toFixed(1)}% hit rate`
      };
    } catch (error) {
      return {
        passed: false,
        time: performance.now() - startTime,
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const testMonitoringSystem = async () => {
    const startTime = performance.now();
    try {
      if (!monitoring.isInitialized) {
        throw new Error('Monitoring system not initialized');
      }

      // Test health check
      const health = await monitoring.runHealthCheck();
      if (health.status === 'unhealthy') {
        throw new Error('System health check failed');
      }

      const time = performance.now() - startTime;
      return {
        passed: true,
        time,
        details: `Monitoring healthy, system score: ${health.score.toFixed(1)}`
      };
    } catch (error) {
      return {
        passed: false,
        time: performance.now() - startTime,
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const testIntegration = async () => {
    const startTime = performance.now();
    try {
      // Test that all systems are properly integrated
      if (!di.isInitialized || !cache.isInitialized || !monitoring.isInitialized) {
        throw new Error('Not all systems are initialized');
      }

      // Test cross-system integration
      const overview = calculateOverview();
      if (overview.overall.score < 50) {
        throw new Error('Integration health score too low');
      }

      const time = performance.now() - startTime;
      return {
        passed: true,
        time,
        details: `Integration healthy, overall score: ${overview.overall.score.toFixed(1)}`
      };
    } catch (error) {
      return {
        passed: false,
        time: performance.now() - startTime,
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const generateRecommendations = (tests: DiagnosticReport['tests']): string[] => {
    const recommendations: string[] = [];

    if (!tests.di.passed) {
      recommendations.push('Initialize DI system and verify service registrations');
    }

    if (!tests.cache.passed) {
      recommendations.push('Clear cache and verify storage permissions');
    }

    if (!tests.monitoring.passed) {
      recommendations.push('Check network connectivity and system resources');
    }

    if (!tests.integration.passed) {
      recommendations.push('Verify all systems are properly configured and initialized');
    }

    if (cache.metrics.hitRate < 50) {
      recommendations.push('Consider adjusting cache TTL settings for better hit rate');
    }

    if (di.registryMetrics.averageResponseTime > 100) {
      recommendations.push('Optimize service initialization for better response times');
    }

    return recommendations;
  };

  // =============================================================================
  // EFFECTS
  // =============================================================================

  useEffect(() => {
    // Update overview when any system changes
    const newOverview = calculateOverview();
    setOverview(newOverview);
  }, [
    di.isInitialized, di.registryMetrics,
    cache.isInitialized, cache.metrics,
    monitoring.isInitialized, monitoring.systemHealth, monitoring.alerts,
    calculateOverview
  ]);

  // =============================================================================
  // RETURN VALUE
  // =============================================================================

  const actions: SystemActions = {
    refreshAll,
    runDiagnostics,
    clearCaches,
    exportMetrics
  };

  return {
    overview,
    actions,
    isRefreshing,
    lastDiagnostic,
    
    // Individual system access
    di,
    cache,
    monitoring
  };
};

// =============================================================================
// CONVENIENCE HOOKS
// =============================================================================

export const useSystemScore = () => {
  const { overview } = useSystemHealth();
  return overview.overall.score;
};

export const useSystemStatus = () => {
  const { overview } = useSystemHealth();
  return overview.overall.status;
};

export const useSystemDiagnostics = () => {
  const { actions, lastDiagnostic } = useSystemHealth();
  return { runDiagnostics: actions.runDiagnostics, lastDiagnostic };
};

// =============================================================================
// EXPORTS
// =============================================================================

export default useSystemHealth; 