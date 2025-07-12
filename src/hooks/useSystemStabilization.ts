// useSystemStabilization Hook - Week 4.3 Emergency Fixes
// IA Charlie System Stabilization - React Integration Hook
// Provides easy access to all stabilization monitoring systems

import { useState, useEffect, useCallback } from 'react';
import { enhancedHealthMonitor, SystemStabilityMetrics, EnhancedHealthCheck } from '../services/monitoring/enhancedHealthMonitor';
import { integratedAlertSystem, SystemIncident } from '../services/monitoring/integratedAlertSystem';
import { performanceMonitor } from '../services/monitoring/performanceMonitor';
import { logger } from '../utils/logger';

export interface SystemStabilizationData {
  // Core metrics
  stabilityMetrics: SystemStabilityMetrics | null;
  healthHistory: EnhancedHealthCheck[];
  networkStatus: any;
  
  // Incidents and alerts
  activeIncidents: SystemIncident[];
  alertHistory: any[];
  
  // Performance data
  performanceReport: any;
  systemStatus: any;
  
  // Control state
  isLoading: boolean;
  isMonitoring: boolean;
  lastUpdate: number;
  error: string | null;
}

export interface SystemStabilizationActions {
  refreshData: () => Promise<void>;
  resolveIncident: (incidentId: string, resolution: string) => Promise<boolean>;
  suppressAlert: (alertType: string, durationMs?: number) => void;
  startMonitoring: () => Promise<void>;
  stopMonitoring: () => void;
  getHealthSummary: () => {
    overall: string;
    uptime: string;
    errorRate: number;
    availability: number;
    trend: string;
  };
}

export function useSystemStabilization(autoRefresh: boolean = true, refreshInterval: number = 30000) {
  const [data, setData] = useState<SystemStabilizationData>({
    stabilityMetrics: null,
    healthHistory: [],
    networkStatus: null,
    activeIncidents: [],
    alertHistory: [],
    performanceReport: null,
    systemStatus: null,
    isLoading: true,
    isMonitoring: false,
    lastUpdate: 0,
    error: null
  });

  const refreshData = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, isLoading: true, error: null }));

      // Fetch all data in parallel for optimal performance
      const [
        stabilityMetrics,
        healthHistory,
        networkStatus,
        activeIncidents,
        alertHistory,
        performanceReport,
        systemStatus
      ] = await Promise.allSettled([
        enhancedHealthMonitor.getStabilityMetrics(),
        enhancedHealthMonitor.getHealthHistory(20),
        enhancedHealthMonitor.getNetworkResilienceStatus(),
        integratedAlertSystem.getActiveIncidents(),
        integratedAlertSystem.getAlertHistory(10),
        performanceMonitor.getPerformanceReport(),
        integratedAlertSystem.getSystemStatus()
      ]);

      // Process results and handle any failures gracefully
      const processResult = <T>(result: PromiseSettledResult<T>, fallback: T): T => {
        return result.status === 'fulfilled' ? result.value : fallback;
      };

      setData(prev => ({
        ...prev,
        stabilityMetrics: processResult(stabilityMetrics, null),
        healthHistory: processResult(healthHistory, []),
        networkStatus: processResult(networkStatus, null),
        activeIncidents: processResult(activeIncidents, []),
        alertHistory: processResult(alertHistory, []),
        performanceReport: processResult(performanceReport, null),
        systemStatus: processResult(systemStatus, null),
        isLoading: false,
        lastUpdate: Date.now()
      }));

      logger.info('System stabilization data refreshed', {
        stabilityStatus: processResult(stabilityMetrics, { overall: 'unknown' }).overall,
        incidents: processResult(activeIncidents, []).length,
        alerts: processResult(alertHistory, []).length
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error refreshing system stabilization data', error);
      
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
    }
  }, []);

  const resolveIncident = useCallback(async (incidentId: string, resolution: string): Promise<boolean> => {
    try {
      const success = integratedAlertSystem.resolveIncident(incidentId, resolution);
      if (success) {
        await refreshData();
        logger.info('Incident resolved via hook', { incidentId, resolution });
      }
      return success;
    } catch (error) {
      logger.error('Error resolving incident via hook', { incidentId, error });
      return false;
    }
  }, [refreshData]);

  const suppressAlert = useCallback((alertType: string, durationMs: number = 3600000) => {
    try {
      integratedAlertSystem.suppressAlert(alertType, durationMs);
      logger.info('Alert suppressed via hook', { alertType, durationMs });
      // Refresh data to show updated suppression status
      setTimeout(refreshData, 1000);
    } catch (error) {
      logger.error('Error suppressing alert via hook', { alertType, error });
    }
  }, [refreshData]);

  const startMonitoring = useCallback(async () => {
    try {
      await integratedAlertSystem.startIntegratedMonitoring();
      setData(prev => ({ ...prev, isMonitoring: true }));
      logger.info('Monitoring started via hook');
    } catch (error) {
      logger.error('Error starting monitoring via hook', error);
    }
  }, []);

  const stopMonitoring = useCallback(() => {
    try {
      integratedAlertSystem.stopIntegratedMonitoring();
      setData(prev => ({ ...prev, isMonitoring: false }));
      logger.info('Monitoring stopped via hook');
    } catch (error) {
      logger.error('Error stopping monitoring via hook', error);
    }
  }, []);

  const getHealthSummary = useCallback(() => {
    if (!data.stabilityMetrics) {
      return {
        overall: 'unknown',
        uptime: 'N/A',
        errorRate: 0,
        availability: 0,
        trend: 'unknown'
      };
    }

    const formatUptime = (uptime: number): string => {
      const hours = Math.floor(uptime / (1000 * 60 * 60));
      const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m`;
    };

    return {
      overall: data.stabilityMetrics.overall,
      uptime: formatUptime(data.stabilityMetrics.uptime),
      errorRate: data.stabilityMetrics.errorRate,
      availability: data.stabilityMetrics.availabilityScore,
      trend: data.stabilityMetrics.stabilityTrend
    };
  }, [data.stabilityMetrics]);

  // Auto-refresh effect
  useEffect(() => {
    refreshData();

    if (autoRefresh) {
      const interval = setInterval(refreshData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, refreshData]);

  // Initialize monitoring on mount
  useEffect(() => {
    startMonitoring();
    return () => {
      stopMonitoring();
    };
  }, [startMonitoring, stopMonitoring]);

  const actions: SystemStabilizationActions = {
    refreshData,
    resolveIncident,
    suppressAlert,
    startMonitoring,
    stopMonitoring,
    getHealthSummary
  };

  return {
    data,
    actions,
    // Convenience getters
    isHealthy: data.stabilityMetrics?.overall === 'stable',
    hasActiveIncidents: data.activeIncidents.length > 0,
    isNetworkOnline: data.networkStatus?.isOnline ?? true,
    errorRate: data.stabilityMetrics?.errorRate ?? 0,
    availability: data.stabilityMetrics?.availabilityScore ?? 100
  };
}

// Utility function for quick health check
export async function getQuickHealthStatus(): Promise<{
  status: 'healthy' | 'degraded' | 'critical';
  message: string;
  details: any;
}> {
  try {
    const metrics = enhancedHealthMonitor.getStabilityMetrics();
    const incidents = integratedAlertSystem.getActiveIncidents();

    if (incidents.length > 0) {
      const criticalIncidents = incidents.filter(i => i.severity === 'critical');
      if (criticalIncidents.length > 0) {
        return {
          status: 'critical',
          message: `${criticalIncidents.length} critical incident(s) active`,
          details: { incidents, metrics }
        };
      }
    }

    if (metrics.overall === 'stable') {
      return {
        status: 'healthy',
        message: 'All systems operating normally',
        details: { metrics }
      };
    } else {
      return {
        status: 'degraded',
        message: `System status: ${metrics.overall}`,
        details: { metrics, incidents }
      };
    }

  } catch (error) {
    return {
      status: 'critical',
      message: 'Unable to determine system health',
      details: { error: error instanceof Error ? error.message : String(error) }
    };
  }
}

// Global window object for debugging
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).systemStabilization = {
    getQuickStatus: getQuickHealthStatus,
    enhancedHealthMonitor,
    integratedAlertSystem,
    performanceMonitor
  };
} 