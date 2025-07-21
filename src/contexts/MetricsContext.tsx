/**
 * 📊 METRICS CONTEXT V9.0
 * 
 * Contexto React para gerenciamento global de métricas
 * Fornece estado centralizado para analytics e tracking
 * 
 * @methodology V9.0_NATURAL_LANGUAGE_FIRST
 * @specification CTX-METRICS-001
 * @author IA Beta - React Context Architect
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { metricsService, UsageStats, MetricEvent, AnalyticsFilter } from '../services/analytics/metricsService';
import { useAuth } from './AuthContext';
import { createLogger } from '../utils/logger';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface MetricsContextType {
  // Current metrics state
  stats: UsageStats;
  recentEvents: MetricEvent[];
  isTracking: boolean;
  
  // Control functions
  startTracking: () => void;
  stopTracking: () => void;
  refreshStats: () => Promise<void>;
  
  // Filter functions
  setAnalyticsFilter: (filter: AnalyticsFilter) => void;
  clearFilter: () => void;
  currentFilter: AnalyticsFilter | null;
  
  // Export functions
  exportAnalytics: (format: 'json' | 'csv') => void;
  
  // Real-time updates
  lastUpdate: Date | null;
  updateInterval: number;
}

const defaultStats: UsageStats = {
  totalUsers: 0,
  activeUsers: 0,
  scriptsGenerated: 0,
  scriptsExported: 0,
  averageSessionDuration: 0,
  topFeatures: [],
  performanceScore: 100
};

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const MetricsContext = createContext<MetricsContextType>({
  stats: defaultStats,
  recentEvents: [],
  isTracking: false,
  startTracking: () => {},
  stopTracking: () => {},
  refreshStats: async () => {},
  setAnalyticsFilter: () => {},
  clearFilter: () => {},
  currentFilter: null,
  exportAnalytics: () => {},
  lastUpdate: null,
  updateInterval: 30000
});

// ============================================================================
// METRICS PROVIDER COMPONENT
// ============================================================================

interface MetricsProviderProps {
  children: ReactNode;
  autoStart?: boolean;
  updateInterval?: number;
}

export const MetricsProvider: React.FC<MetricsProviderProps> = ({
  children,
  autoStart = true,
  updateInterval = 30000
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const { currentUser } = useAuth();
  const logger = createLogger('MetricsContext');
  
  const [stats, setStats] = useState<UsageStats>(defaultStats);
  const [recentEvents, setRecentEvents] = useState<MetricEvent[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<AnalyticsFilter | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // ============================================================================
  // METRICS MANAGEMENT
  // ============================================================================

  const refreshStats = async () => {
    try {
      // Get usage statistics with current filter
      const usageStats = metricsService.getUsageStats(currentFilter || {});
      setStats(usageStats);

      // Get recent events
      const events = metricsService.getEvents({
        ...currentFilter,
        limit: 50
      });
      setRecentEvents(events);

      setLastUpdate(new Date());
      
      logger.debug('Metrics refreshed', {
        totalUsers: usageStats.totalUsers,
        activeUsers: usageStats.activeUsers,
        eventsCount: events.length
      });

    } catch (error) {
      logger.error('Failed to refresh metrics', { error });
    }
  };

  const startTracking = () => {
    setIsTracking(true);
    logger.info('Metrics tracking started');
  };

  const stopTracking = () => {
    setIsTracking(false);
    logger.info('Metrics tracking stopped');
  };

  const setAnalyticsFilter = (filter: AnalyticsFilter) => {
    setCurrentFilter(filter);
    logger.info('Analytics filter updated', filter);
    
    // Refresh data with new filter
    refreshStats();
  };

  const clearFilter = () => {
    setCurrentFilter(null);
    logger.info('Analytics filter cleared');
    
    // Refresh data without filter
    refreshStats();
  };

  const exportAnalytics = (format: 'json' | 'csv') => {
    const data = {
      stats,
      events: recentEvents,
      filter: currentFilter,
      exportedAt: new Date().toISOString(),
      metadata: {
        userId: currentUser?.uid,
        userEmail: currentUser?.email,
        totalEvents: recentEvents.length,
        timeRange: currentFilter ? {
          start: currentFilter.startDate?.toISOString(),
          end: currentFilter.endDate?.toISOString()
        } : null
      }
    };

    let content: string;
    let mimeType: string;
    let extension: string;

    if (format === 'json') {
      content = JSON.stringify(data, null, 2);
      mimeType = 'application/json';
      extension = 'json';
    } else {
      // CSV export
      const csvHeader = 'Timestamp,Type,User ID,Data,Success\n';
      const csvRows = recentEvents.map(event => {
        const timestamp = event.timestamp.toISOString();
        const type = event.type;
        const userId = event.userId || 'N/A';
        const dataStr = JSON.stringify(event.data).replace(/"/g, '""');
        const success = event.data.success !== undefined ? event.data.success : 'N/A';
        return `"${timestamp}","${type}","${userId}","${dataStr}","${success}"`;
      }).join('\n');
      
      content = csvHeader + csvRows;
      mimeType = 'text/csv';
      extension = 'csv';
    }

    // Create and download file
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `metrics-export-${Date.now()}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);

    logger.info(`Analytics exported as ${format}`, {
      eventsCount: recentEvents.length,
      format
    });
  };

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Auto-start tracking when user is authenticated
  useEffect(() => {
    if (currentUser && autoStart) {
      startTracking();
      refreshStats();
    }
  }, [currentUser, autoStart]);

  // Periodic refresh when tracking is enabled
  useEffect(() => {
    if (!isTracking) return;

    const interval = setInterval(refreshStats, updateInterval);
    return () => clearInterval(interval);
  }, [isTracking, updateInterval, currentFilter]);

  // Initial metrics load
  useEffect(() => {
    refreshStats();
  }, []);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: MetricsContextType = {
    stats,
    recentEvents,
    isTracking,
    startTracking,
    stopTracking,
    refreshStats,
    setAnalyticsFilter,
    clearFilter,
    currentFilter,
    exportAnalytics,
    lastUpdate,
    updateInterval
  };

  return (
    <MetricsContext.Provider value={contextValue}>
      {children}
    </MetricsContext.Provider>
  );
};

// ============================================================================
// HOOK FOR USING METRICS CONTEXT
// ============================================================================

export const useMetricsContext = () => {
  const context = useContext(MetricsContext);
  
  if (!context) {
    throw new Error('useMetricsContext must be used within a MetricsProvider');
  }
  
  return context;
};

// ============================================================================
// SPECIALIZED HOOKS
// ============================================================================

/**
 * Hook para estatísticas específicas de features
 */
export const useFeatureStats = (featureName: string) => {
  const { recentEvents, setAnalyticsFilter, clearFilter } = useMetricsContext();
  
  const featureEvents = recentEvents.filter(event => 
    event.type === 'feature_used' && event.data.feature === featureName
  );
  
  const totalUsage = featureEvents.length;
  const uniqueUsers = new Set(featureEvents.map(e => e.userId)).size;
  const averageUsagePerUser = uniqueUsers > 0 ? totalUsage / uniqueUsers : 0;
  
  const filterByFeature = () => {
    setAnalyticsFilter({
      eventType: 'feature_used',
      feature: featureName
    });
  };
  
  return {
    featureName,
    totalUsage,
    uniqueUsers,
    averageUsagePerUser,
    recentEvents: featureEvents,
    filterByFeature,
    clearFilter
  };
};

/**
 * Hook para métricas de performance
 */
export const usePerformanceMetrics = () => {
  const { recentEvents } = useMetricsContext();
  
  const performanceEvents = recentEvents.filter(event => 
    event.type === 'performance_metric'
  );
  
  const metrics = performanceEvents.reduce((acc, event) => {
    const metric = event.data.metric;
    if (!acc[metric]) {
      acc[metric] = [];
    }
    acc[metric].push(event.data.value);
    return acc;
  }, {} as Record<string, number[]>);
  
  const averages = Object.entries(metrics).reduce((acc, [key, values]) => {
    acc[key] = values.reduce((sum, val) => sum + val, 0) / values.length;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    metrics,
    averages,
    totalSamples: performanceEvents.length,
    latestUpdate: performanceEvents.length > 0 
      ? performanceEvents[performanceEvents.length - 1].timestamp 
      : null
  };
};

export default MetricsContext;