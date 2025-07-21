/**
 * 🩺 USE SYSTEM HEALTH V8.0 - UNIFIED MONITORING HOOK
 * Hook React para MonitoringHubV8 consolidado (1295 linhas, 5 sistemas enterprise)
 * V8.0 CONSOLIDATION: Distributed tracing + Auto-remediation + Intelligent alerting
 * Metodologia: V8.0 Unified Development + Frontend Integration
 */

import { useState, useEffect, useCallback } from 'react';
import { monitoringHubV8 } from '../services/monitoring/MonitoringHubV8';
import { createLogger } from '../utils/logger';

const logger = createLogger('useSystemHealthV8');

// =============================================================================
// V8.0 UNIFIED HEALTH INTERFACES
// =============================================================================

interface SystemHealthV8 {
  overall: 'healthy' | 'degraded' | 'critical';
  score: number;
  uptime: number;
  services: Array<{
    name: string;
    status: 'healthy' | 'degraded' | 'offline';
    health: any;
    metrics: any;
  }>;
  summary: {
    total: number;
    healthy: number;
    degraded: number;
    offline: number;
  };
  telemetry: any;
}

interface HealthMetricsV8 {
  systemHealth: {
    overall: 'healthy' | 'degraded' | 'critical';
    score: number;
    uptime: number;
    lastIncident?: Date;
  };
  performance: {
    responseTime: { avg: number; p95: number; p99: number; };
    fps: number;
    memoryUsage: number;
    cpuUsage: number;
    networkLatency: number;
  };
  application: {
    errorRate: number;
    throughput: number;
    activeUsers: number;
    cacheHitRate: number;
    apiCallCount: number;
  };
  infrastructure: {
    serviceAvailability: number;
    databaseConnections: number;
    queueDepth: number;
    diskUsage: number;
    networkConnections: number;
  };
}

interface UseSystemHealthV8Result {
  // State
  isInitialized: boolean;
  health: SystemHealthV8 | null;
  metrics: HealthMetricsV8 | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  
  // Methods  
  refreshHealth: () => Promise<void>;
  getMetrics: () => HealthMetricsV8 | null;
  startMonitoring: (intervalMs?: number) => void;
  stopMonitoring: () => void;
  
  // V8.0 Advanced features
  startTrace: (operationName: string, serviceName: string, tags?: Record<string, any>) => string;
  finishTrace: (traceId: string, status: 'success' | 'error' | 'timeout', tags?: Record<string, any>) => void;
  recordPerformanceMetric: (metric: string, value: number, unit: string, tags?: Record<string, any>) => void;
  createAlert: (type: string, severity: 'low' | 'medium' | 'high' | 'critical', message: string, details?: any) => void;
  triggerAutoRemediation: (issue: string) => Promise<boolean>;
  
  // Monitoring flags
  isMonitoring: boolean;
  monitoringInterval: number;
}

// =============================================================================
// MAIN HOOK
// =============================================================================

export const useSystemHealth = () => {
  const monitoring = monitoringHubV8;
  
  const [health, setHealth] = useState<SystemHealthV8 | null>(null);
  const [metrics, setMetrics] = useState<HealthMetricsV8 | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // =============================================================================
  // SYSTEM OVERVIEW CALCULATION
  // =============================================================================

  const calculateOverview = useCallback((): SystemHealthV8 => {
    try {
      if (!monitoring.isInitialized) {
        throw new Error('Monitoring system not initialized');
      }

      const systemHealth = monitoring.systemHealth;
      const performance = monitoring.performanceMetrics;
      const application = monitoring.applicationMetrics;
      const infrastructure = monitoring.infrastructureMetrics;

      const overallStatus = systemHealth.overall;
      const overallScore = systemHealth.score;
      const uptime = systemHealth.uptime;

      const services = Object.entries(monitoring.services).map(([name, service]) => ({
        name,
        status: service.status,
        health: service.health,
        metrics: service.metrics
      }));

      const summary = {
        total: Object.keys(monitoring.services).length,
        healthy: Object.values(monitoring.services).filter(s => s.status === 'healthy').length,
        degraded: Object.values(monitoring.services).filter(s => s.status === 'degraded').length,
        offline: Object.values(monitoring.services).filter(s => s.status === 'offline').length
      };

      const telemetry = monitoring.telemetry;

      return {
        overall: overallStatus,
        score: overallScore,
        uptime,
        services,
        summary,
        telemetry
      };
    } catch (error) {
      logger.error('Error calculating system overview:', error);
      throw error; // Re-throw to be caught by the hook's error state
    }
  }, [monitoring]);

  // =============================================================================
  // SYSTEM ACTIONS
  // =============================================================================

  const refreshHealth = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      logger.info('🔄 Refreshing system health...');

      await monitoring.refreshHealth();
      const newHealth = calculateOverview();
      setHealth(newHealth);
      setLastUpdated(new Date());
      logger.info('✅ System health refreshed successfully');
    } catch (error) {
      logger.error('❌ Error refreshing system health:', error);
      setError('Failed to refresh system health.');
    } finally {
      setIsLoading(false);
    }
  }, [monitoring, calculateOverview]);

  const getMetrics = useCallback((): HealthMetricsV8 | null => {
    if (!monitoring.isInitialized) {
      return null;
    }
    return monitoring.performanceMetrics;
  }, [monitoring]);

  const startMonitoring = useCallback((intervalMs: number = 5000) => {
    monitoring.startMonitoring(intervalMs);
  }, [monitoring]);

  const stopMonitoring = useCallback(() => {
    monitoring.stopMonitoring();
  }, [monitoring]);

  // V8.0 Advanced features
  const startTrace = useCallback((operationName: string, serviceName: string, tags?: Record<string, any>) => {
    return monitoring.startTrace(operationName, serviceName, tags);
  }, [monitoring]);

  const finishTrace = useCallback((traceId: string, status: 'success' | 'error' | 'timeout', tags?: Record<string, any>) => {
    monitoring.finishTrace(traceId, status, tags);
  }, [monitoring]);

  const recordPerformanceMetric = useCallback((metric: string, value: number, unit: string, tags?: Record<string, any>) => {
    monitoring.recordPerformanceMetric(metric, value, unit, tags);
  }, [monitoring]);

  const createAlert = useCallback((type: string, severity: 'low' | 'medium' | 'high' | 'critical', message: string, details?: any) => {
    monitoring.createAlert(type, severity, message, details);
  }, [monitoring]);

  const triggerAutoRemediation = useCallback(async (issue: string) => {
    return monitoring.triggerAutoRemediation(issue);
  }, [monitoring]);

  // Monitoring flags
  const isMonitoring = useCallback(() => {
    return monitoring.isMonitoring;
  }, [monitoring]);

  const monitoringInterval = useCallback(() => {
    return monitoring.monitoringInterval;
  }, [monitoring]);

  // =============================================================================
  // EFFECTS
  // =============================================================================

  useEffect(() => {
    const initializeMonitoring = async () => {
      try {
        await monitoring.bootstrap();
        const initialHealth = calculateOverview();
        setHealth(initialHealth);
        setLastUpdated(new Date());
        logger.info('✅ Monitoring system initialized successfully');
      } catch (error) {
        logger.error('❌ Error initializing monitoring system:', error);
        setError('Failed to initialize monitoring system.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeMonitoring();
    startMonitoring(); // Start monitoring on mount

    return () => {
      stopMonitoring(); // Clean up on unmount
    };
  }, [monitoring, calculateOverview, startMonitoring, stopMonitoring]);

  // =============================================================================
  // RETURN VALUE
  // =============================================================================

  const result: UseSystemHealthV8Result = {
    isInitialized: monitoring.isInitialized,
    health,
    metrics,
    isLoading,
    error,
    lastUpdated,
    refreshHealth,
    getMetrics,
    startMonitoring,
    stopMonitoring,
    startTrace,
    finishTrace,
    recordPerformanceMetric,
    createAlert,
    triggerAutoRemediation,
    isMonitoring,
    monitoringInterval
  };

  return result;
};

// =============================================================================
// CONVENIENCE HOOKS
// =============================================================================

export const useSystemScore = () => {
  const { health } = useSystemHealth();
  return health?.score || 0;
};

export const useSystemStatus = () => {
  const { health } = useSystemHealth();
  return health?.overall || 'healthy';
};

export const useSystemDiagnostics = () => {
  const { refreshHealth, getMetrics } = useSystemHealth();
  return { refreshHealth, getMetrics };
};

// =============================================================================
// EXPORTS
// =============================================================================

export default useSystemHealth; 