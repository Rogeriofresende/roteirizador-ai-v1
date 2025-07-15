/**
 * 🚦 SYSTEM HEALTH INDICATOR V8.0 - UX ENHANCEMENT
 * Indicador visual de saúde do sistema em tempo real
 * Baseado em: sistemas consolidados (DI + Cache + Monitoring)
 * Metodologia: V8.0 Consolidation Strategy
 */

import React, { useState, useEffect } from 'react';
import { Activity, AlertCircle, CheckCircle, Clock, Zap } from 'lucide-react';
import { useSystemHealth } from '../../hooks/useSystemHealth';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface SystemHealthIndicatorProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  showDetails?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
  onStatusChange?: (status: 'healthy' | 'degraded' | 'critical') => void;
}

interface StatusColors {
  healthy: string;
  degraded: string;
  critical: string;
  loading: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

export const SystemHealthIndicator: React.FC<SystemHealthIndicatorProps> = ({
  position = 'top-right',
  showDetails = false,
  autoRefresh = true,
  refreshInterval = 30000,
  onStatusChange
}) => {
  const { overview, actions, isRefreshing } = useSystemHealth();
  const [showTooltip, setShowTooltip] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  // =============================================================================
  // STYLING
  // =============================================================================

  const statusColors: StatusColors = {
    healthy: 'text-green-500 bg-green-100 border-green-200',
    degraded: 'text-yellow-500 bg-yellow-100 border-yellow-200',
    critical: 'text-red-500 bg-red-100 border-red-200',
    loading: 'text-blue-500 bg-blue-100 border-blue-200'
  };

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  };

  const currentStatus = isRefreshing ? 'loading' : overview.overall.status;
  const statusColor = statusColors[currentStatus as keyof StatusColors];

  // =============================================================================
  // ICON SELECTION
  // =============================================================================

  const getStatusIcon = () => {
    if (isRefreshing) return <Clock className="w-4 h-4 animate-spin" />;
    
    switch (overview.overall.status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4" />;
      case 'degraded':
        return <AlertCircle className="w-4 h-4" />;
      case 'critical':
        return <AlertCircle className="w-4 h-4 animate-pulse" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  // =============================================================================
  // EFFECTS
  // =============================================================================

  useEffect(() => {
    if (onStatusChange) {
      onStatusChange(overview.overall.status);
    }
  }, [overview.overall.status, onStatusChange]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      actions.refreshAll().then(() => {
        setLastRefresh(Date.now());
      });
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, actions]);

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const handleClick = async () => {
    if (isRefreshing) return;
    
    try {
      await actions.refreshAll();
      setLastRefresh(Date.now());
    } catch (error) {
      console.error('Failed to refresh system health:', error);
    }
  };

  const formatLastUpdate = () => {
    const secondsAgo = Math.floor((Date.now() - overview.overall.lastUpdate) / 1000);
    if (secondsAgo < 60) return `${secondsAgo}s ago`;
    const minutesAgo = Math.floor(secondsAgo / 60);
    if (minutesAgo < 60) return `${minutesAgo}m ago`;
    const hoursAgo = Math.floor(minutesAgo / 60);
    return `${hoursAgo}h ago`;
  };

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      {/* Main Indicator */}
      <div
        className={`
          relative flex items-center gap-2 px-3 py-2 rounded-lg border-2 shadow-lg
          backdrop-blur-sm cursor-pointer transition-all duration-200
          hover:scale-105 hover:shadow-xl
          ${statusColor}
        `}
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {/* Status Icon */}
        {getStatusIcon()}
        
        {/* Score Badge */}
        <span className="text-sm font-bold">
          {Math.round(overview.overall.score)}
        </span>

        {/* Performance Indicator */}
        <Zap className="w-3 h-3" />
      </div>

      {/* Detailed Tooltip */}
      {(showTooltip || showDetails) && (
        <div className="absolute top-full mt-2 right-0 w-80 bg-white border border-gray-200 rounded-lg shadow-xl p-4 z-60">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">System Health</h3>
              <span className={`px-2 py-1 rounded text-xs font-medium ${statusColor}`}>
                {overview.overall.status.toUpperCase()}
              </span>
            </div>

            {/* Overall Score */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Overall Score</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      overview.overall.score >= 80 ? 'bg-green-500' :
                      overview.overall.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${overview.overall.score}%` }}
                  />
                </div>
                <span className="text-sm font-medium">
                  {Math.round(overview.overall.score)}%
                </span>
              </div>
            </div>

            {/* System Details */}
            <div className="space-y-2 border-t pt-3">
              {/* Dependency Injection */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">DI System</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    overview.di.isInitialized ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span>{overview.di.healthyServices}/{overview.di.totalServices}</span>
                </div>
              </div>

              {/* Cache System */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Cache System</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    overview.cache.isInitialized ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span>{Math.round(overview.cache.hitRate)}% hit rate</span>
                </div>
              </div>

              {/* Monitoring System */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Monitoring</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    overview.monitoring.isInitialized ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span>{overview.monitoring.alertCount} alerts</span>
                </div>
              </div>
            </div>

            {/* Last Update */}
            <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-2">
              <span>Last update: {formatLastUpdate()}</span>
              <button 
                onClick={handleClick}
                disabled={isRefreshing}
                className="text-blue-500 hover:text-blue-700 disabled:opacity-50"
              >
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// =============================================================================
// MINI VERSION FOR NAVBAR
// =============================================================================

export const SystemHealthMini: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
  const { overview } = useSystemHealth();
  
  const getStatusColor = () => {
    switch (overview.overall.status) {
      case 'healthy': return 'text-green-500';
      case 'degraded': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
      title={`System Health: ${overview.overall.status} (${Math.round(overview.overall.score)}%)`}
    >
      <Activity className={`w-4 h-4 ${getStatusColor()}`} />
      <span className="text-xs font-medium">
        {Math.round(overview.overall.score)}
      </span>
    </button>
  );
};

// =============================================================================
// EXPORTS
// =============================================================================

export default SystemHealthIndicator; 