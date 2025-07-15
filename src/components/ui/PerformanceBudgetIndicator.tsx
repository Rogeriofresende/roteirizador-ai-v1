/**
 * 📊 PERFORMANCE BUDGET INDICATOR V8.0 - UX ENHANCEMENT
 * Indicadores visuais de performance budget em tempo real
 * Baseado em: sistemas de monitoring consolidados
 * Metodologia: V8.0 Consolidation Strategy
 */

import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Zap, Clock, HardDrive, Wifi } from 'lucide-react';
import { useMonitoring } from '../integration/MonitoringProvider';
import { useCache } from '../integration/CacheProvider';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface PerformanceBudgetProps {
  showDetails?: boolean;
  compactMode?: boolean;
  budgets?: PerformanceBudgets;
}

interface PerformanceBudgets {
  loadTime: number; // milliseconds
  memoryUsage: number; // MB
  cacheHitRate: number; // percentage
  responseTime: number; // milliseconds
  networkLatency: number; // milliseconds
}

interface BudgetStatus {
  metric: string;
  current: number;
  budget: number;
  percentage: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  unit: string;
  icon: React.ComponentType<any>;
}

// =============================================================================
// DEFAULT BUDGETS
// =============================================================================

const DEFAULT_BUDGETS: PerformanceBudgets = {
  loadTime: 3000, // 3 seconds
  memoryUsage: 100, // 100 MB
  cacheHitRate: 80, // 80%
  responseTime: 200, // 200ms
  networkLatency: 500 // 500ms
};

// =============================================================================
// COMPONENT
// =============================================================================

export const PerformanceBudgetIndicator: React.FC<PerformanceBudgetProps> = ({
  showDetails = false,
  compactMode = false,
  budgets = DEFAULT_BUDGETS
}) => {
  const monitoring = useMonitoring();
  const cache = useCache();
  
  const [previousMetrics, setPreviousMetrics] = useState<any>(null);
  const [budgetStatuses, setBudgetStatuses] = useState<BudgetStatus[]>([]);

  // =============================================================================
  // BUDGET CALCULATION
  // =============================================================================

  const calculateBudgetStatuses = (): BudgetStatus[] => {
    const current = monitoring.performanceMetrics;
    const cacheMetrics = cache.metrics;

    const statuses: BudgetStatus[] = [
      {
        metric: 'Load Time',
        current: current.loadTime,
        budget: budgets.loadTime,
        percentage: (current.loadTime / budgets.loadTime) * 100,
        status: getBudgetStatus(current.loadTime, budgets.loadTime, false),
        trend: getTrend(current.loadTime, previousMetrics?.loadTime),
        unit: 'ms',
        icon: Clock
      },
      {
        metric: 'Memory Usage',
        current: current.memoryUsage,
        budget: budgets.memoryUsage,
        percentage: (current.memoryUsage / budgets.memoryUsage) * 100,
        status: getBudgetStatus(current.memoryUsage, budgets.memoryUsage, false),
        trend: getTrend(current.memoryUsage, previousMetrics?.memoryUsage),
        unit: 'MB',
        icon: HardDrive
      },
      {
        metric: 'Cache Hit Rate',
        current: cacheMetrics.hitRate,
        budget: budgets.cacheHitRate,
        percentage: (cacheMetrics.hitRate / budgets.cacheHitRate) * 100,
        status: getBudgetStatus(cacheMetrics.hitRate, budgets.cacheHitRate, true),
        trend: getTrend(cacheMetrics.hitRate, previousMetrics?.hitRate),
        unit: '%',
        icon: Zap
      },
      {
        metric: 'Network Latency',
        current: current.networkLatency,
        budget: budgets.networkLatency,
        percentage: (current.networkLatency / budgets.networkLatency) * 100,
        status: getBudgetStatus(current.networkLatency, budgets.networkLatency, false),
        trend: getTrend(current.networkLatency, previousMetrics?.networkLatency),
        unit: 'ms',
        icon: Wifi
      }
    ];

    return statuses;
  };

  const getBudgetStatus = (current: number, budget: number, higherIsBetter: boolean): BudgetStatus['status'] => {
    const ratio = current / budget;
    
    if (higherIsBetter) {
      // For metrics where higher is better (like cache hit rate)
      if (ratio >= 1) return 'excellent';
      if (ratio >= 0.8) return 'good';
      if (ratio >= 0.6) return 'warning';
      return 'critical';
    } else {
      // For metrics where lower is better (like load time, memory usage)
      if (ratio <= 0.5) return 'excellent';
      if (ratio <= 0.8) return 'good';
      if (ratio <= 1.0) return 'warning';
      return 'critical';
    }
  };

  const getTrend = (current: number, previous: number | undefined): BudgetStatus['trend'] => {
    if (previous === undefined) return 'stable';
    
    const change = Math.abs(current - previous) / previous;
    if (change < 0.05) return 'stable'; // Less than 5% change
    
    return current > previous ? 'up' : 'down';
  };

  // =============================================================================
  // EFFECTS
  // =============================================================================

  useEffect(() => {
    const statuses = calculateBudgetStatuses();
    setBudgetStatuses(statuses);

    // Store current metrics for trend calculation
    setPreviousMetrics({
      loadTime: monitoring.performanceMetrics.loadTime,
      memoryUsage: monitoring.performanceMetrics.memoryUsage,
      hitRate: cache.metrics.hitRate,
      networkLatency: monitoring.performanceMetrics.networkLatency
    });
  }, [monitoring.performanceMetrics, cache.metrics, budgets]);

  // =============================================================================
  // STYLING
  // =============================================================================

  const getStatusColor = (status: BudgetStatus['status']) => {
    switch (status) {
      case 'excellent':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'good':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'critical':
        return 'text-red-600 bg-red-100 border-red-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getTrendIcon = (trend: BudgetStatus['trend'], status: BudgetStatus['status']) => {
    const isPositiveTrend = (trend === 'up' && status === 'excellent') || 
                          (trend === 'down' && status !== 'excellent');
    
    switch (trend) {
      case 'up':
        return <TrendingUp className={`w-3 h-3 ${isPositiveTrend ? 'text-green-500' : 'text-red-500'}`} />;
      case 'down':
        return <TrendingDown className={`w-3 h-3 ${isPositiveTrend ? 'text-green-500' : 'text-red-500'}`} />;
      default:
        return <div className="w-3 h-3 bg-gray-300 rounded-full" />;
    }
  };

  // =============================================================================
  // RENDER COMPACT MODE
  // =============================================================================

  if (compactMode) {
    const overallStatus = budgetStatuses.reduce((worst, status) => {
      const statusPriority = { excellent: 4, good: 3, warning: 2, critical: 1 };
      return statusPriority[status.status] < statusPriority[worst] ? status.status : worst;
    }, 'excellent' as BudgetStatus['status']);

    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs border ${getStatusColor(overallStatus)}`}>
        <Zap className="w-3 h-3" />
        <span>Performance</span>
        <div className="flex gap-1">
          {budgetStatuses.map((status, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                status.status === 'excellent' ? 'bg-green-500' :
                status.status === 'good' ? 'bg-blue-500' :
                status.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              title={`${status.metric}: ${status.current}${status.unit}`}
            />
          ))}
        </div>
      </div>
    );
  }

  // =============================================================================
  // RENDER FULL MODE
  // =============================================================================

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-500" />
          Performance Budget
        </h3>
        <div className="text-sm text-gray-500">
          Real-time monitoring
        </div>
      </div>

      {/* Budget Items */}
      <div className="space-y-3">
        {budgetStatuses.map((status, index) => {
          const IconComponent = status.icon;
          
          return (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              {/* Left Side - Metric Info */}
              <div className="flex items-center gap-3">
                <IconComponent className="w-4 h-4 text-gray-600" />
                <div>
                  <div className="font-medium text-gray-800">{status.metric}</div>
                  <div className="text-sm text-gray-600">
                    Budget: {status.budget}{status.unit}
                  </div>
                </div>
              </div>

              {/* Right Side - Status */}
              <div className="flex items-center gap-3">
                {/* Current Value */}
                <div className="text-right">
                  <div className="font-mono text-lg">
                    {typeof status.current === 'number' ? status.current.toFixed(1) : status.current}
                    <span className="text-sm text-gray-500">{status.unit}</span>
                  </div>
                  <div className="flex items-center gap-1 justify-end">
                    {getTrendIcon(status.trend, status.status)}
                    <span className={`text-xs ${getStatusColor(status.status).split(' ')[0]}`}>
                      {status.status}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-24">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        status.status === 'excellent' ? 'bg-green-500' :
                        status.status === 'good' ? 'bg-blue-500' :
                        status.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ 
                        width: `${Math.min(Math.max(status.percentage, 5), 100)}%` 
                      }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1 text-center">
                    {Math.round(status.percentage)}%
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {showDetails && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-700">
            <strong>Performance Summary:</strong> {
              budgetStatuses.filter(s => s.status === 'excellent' || s.status === 'good').length
            } of {budgetStatuses.length} metrics within budget
          </div>
        </div>
      )}
    </div>
  );
};

// =============================================================================
// SPECIALIZED COMPONENTS
// =============================================================================

export const PerformanceBadge: React.FC<{ metric: keyof PerformanceBudgets }> = ({ metric }) => {
  const monitoring = useMonitoring();
  const cache = useCache();
  
  const getValue = () => {
    switch (metric) {
      case 'loadTime':
        return monitoring.performanceMetrics.loadTime;
      case 'memoryUsage':
        return monitoring.performanceMetrics.memoryUsage;
      case 'cacheHitRate':
        return cache.metrics.hitRate;
      case 'responseTime':
        return monitoring.performanceMetrics.renderTime;
      case 'networkLatency':
        return monitoring.performanceMetrics.networkLatency;
      default:
        return 0;
    }
  };

  const value = getValue();
  const budget = DEFAULT_BUDGETS[metric];
  const isWithinBudget = metric === 'cacheHitRate' ? value >= budget : value <= budget;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${
      isWithinBudget ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
    }`}>
      <Zap className="w-3 h-3" />
      {metric}: {value.toFixed(1)}
    </span>
  );
};

// =============================================================================
// EXPORTS
// =============================================================================

export default PerformanceBudgetIndicator; 