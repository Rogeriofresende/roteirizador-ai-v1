// System Stabilization Dashboard - Week 4.3 Emergency Fixes
// IA Charlie System Stabilization - Unified Monitoring Interface
// Integrates Enhanced Health Monitor + Integrated Alert System + Performance Monitoring

import React, { useState, useEffect, useCallback } from 'react';
import { enhancedHealthMonitor, SystemStabilityMetrics, EnhancedHealthCheck } from '../../services/monitoring/enhancedHealthMonitor';
import { integratedAlertSystem, SystemIncident } from '../../services/monitoring/integratedAlertSystem';
import { performanceMonitor } from '../../services/monitoring/performanceMonitor';
import { logger } from '../../utils/logger';

interface DashboardState {
  stabilityMetrics: SystemStabilityMetrics | null;
  healthHistory: EnhancedHealthCheck[];
  activeIncidents: SystemIncident[];
  alertHistory: any[];
  networkStatus: any;
  performanceReport: any;
  systemStatus: any;
  isLoading: boolean;
  lastUpdate: number;
}

export const SystemStabilizationDashboard: React.FC = () => {
  const [state, setState] = useState<DashboardState>({
    stabilityMetrics: null,
    healthHistory: [],
    activeIncidents: [],
    alertHistory: [],
    networkStatus: null,
    performanceReport: null,
    systemStatus: null,
    isLoading: true,
    lastUpdate: 0
  });

  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  const refreshData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      // Fetch all monitoring data in parallel
      const [
        stabilityMetrics,
        healthHistory,
        networkStatus,
        activeIncidents,
        alertHistory,
        performanceReport,
        systemStatus
      ] = await Promise.all([
        enhancedHealthMonitor.getStabilityMetrics(),
        enhancedHealthMonitor.getHealthHistory(20),
        enhancedHealthMonitor.getNetworkResilienceStatus(),
        integratedAlertSystem.getActiveIncidents(),
        integratedAlertSystem.getAlertHistory(10),
        performanceMonitor.getPerformanceReport(),
        integratedAlertSystem.getSystemStatus()
      ]);

      setState({
        stabilityMetrics,
        healthHistory,
        networkStatus,
        activeIncidents,
        alertHistory,
        performanceReport,
        systemStatus,
        isLoading: false,
        lastUpdate: Date.now()
      });

      logger.info('Dashboard data refreshed', {
        stabilityStatus: stabilityMetrics.overall,
        activeIncidents: activeIncidents.length,
        networkOnline: networkStatus.isOnline
      });

    } catch (error) {
      logger.error('Error refreshing dashboard data', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    refreshData();

    if (autoRefresh) {
      const interval = setInterval(refreshData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, refreshData]);

  // Manual actions
  const handleIncidentResolve = async (incidentId: string) => {
    const resolution = prompt('Enter resolution description:');
    if (resolution) {
      const success = integratedAlertSystem.resolveIncident(incidentId, resolution);
      if (success) {
        await refreshData();
      }
    }
  };

  const handleAlertSuppress = async (alertType: string) => {
    const duration = prompt('Suppress duration in minutes (default: 60):');
    const durationMs = (parseInt(duration || '60') * 60 * 1000);
    integratedAlertSystem.suppressAlert(alertType, durationMs);
    await refreshData();
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'stable':
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'degraded':
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'unstable':
      case 'critical': return 'text-red-600 bg-red-100';
      case 'offline': return 'text-gray-600 bg-gray-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical': return 'text-red-800 bg-red-200 border-red-300';
      case 'high': return 'text-orange-800 bg-orange-200 border-orange-300';
      case 'medium': return 'text-yellow-800 bg-yellow-200 border-yellow-300';
      case 'low': return 'text-blue-800 bg-blue-200 border-blue-300';
      default: return 'text-gray-800 bg-gray-200 border-gray-300';
    }
  };

  const formatUptime = (uptime: number): string => {
    const hours = Math.floor(uptime / (1000 * 60 * 60));
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString();
  };

  if (state.isLoading && !state.stabilityMetrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading system stabilization data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Stabilization Dashboard</h1>
          <p className="text-gray-600">Week 4.3 Emergency Monitoring - IA Charlie</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Auto-refresh:</label>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
          </div>
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="text-sm border rounded px-2 py-1"
            disabled={!autoRefresh}
          >
            <option value={10000}>10s</option>
            <option value={30000}>30s</option>
            <option value={60000}>1m</option>
            <option value={300000}>5m</option>
          </select>
          <button
            onClick={refreshData}
            disabled={state.isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {state.isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* System Overview */}
      {state.stabilityMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold text-gray-700 mb-2">Overall Status</h3>
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(state.stabilityMetrics.overall)}`}>
              {state.stabilityMetrics.overall.toUpperCase()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Trend: {state.stabilityMetrics.stabilityTrend}
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold text-gray-700 mb-2">Uptime</h3>
            <p className="text-2xl font-bold text-blue-600">
              {formatUptime(state.stabilityMetrics.uptime)}
            </p>
            <p className="text-xs text-gray-500">Since system start</p>
          </div>

          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold text-gray-700 mb-2">Error Rate</h3>
            <p className="text-2xl font-bold text-red-600">
              {state.stabilityMetrics.errorRate.toFixed(2)}%
            </p>
            <p className="text-xs text-gray-500">Last 10 checks per service</p>
          </div>

          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold text-gray-700 mb-2">Availability</h3>
            <p className="text-2xl font-bold text-green-600">
              {state.stabilityMetrics.availabilityScore.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500">P95: {state.stabilityMetrics.responseTimeP95}ms</p>
          </div>
        </div>
      )}

      {/* Network Status */}
      {state.networkStatus && (
        <div className="mb-6 p-4 bg-gray-50 rounded">
          <h3 className="font-semibold text-gray-700 mb-3">Network & Resilience Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className={`w-3 h-3 rounded-full ${state.networkStatus.isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className="font-medium">
                  {state.networkStatus.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Fallback mode: {state.networkStatus.fallbackMode ? 'Active' : 'Inactive'}
              </p>
            </div>
            
            <div>
              <p className="font-medium">Service Failures</p>
              {Object.entries(state.networkStatus.failuresByService).length > 0 ? (
                <div className="text-sm">
                  {Object.entries(state.networkStatus.failuresByService).map(([service, failures]) => (
                    <div key={service} className="flex justify-between">
                      <span>{service}:</span>
                      <span className={failures > 5 ? 'text-red-600' : 'text-yellow-600'}>
                        {failures} failures
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-green-600">No failures</p>
              )}
            </div>

            <div>
              <p className="font-medium">Last Successful Checks</p>
              <div className="text-sm">
                {Object.entries(state.networkStatus.lastSuccessfulChecks).map(([service, timestamp]) => (
                  <div key={service} className="flex justify-between">
                    <span>{service}:</span>
                    <span>{formatTimestamp(timestamp as number)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Incidents */}
      {state.activeIncidents.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">Active Incidents ({state.activeIncidents.length})</h3>
          <div className="space-y-3">
            {state.activeIncidents.map((incident) => (
              <div key={incident.id} className={`p-4 border rounded-lg ${getSeverityColor(incident.severity)}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-semibold">{incident.title}</span>
                      <span className="text-sm bg-white px-2 py-1 rounded">
                        {incident.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm mb-2">{incident.description}</p>
                    <div className="flex items-center space-x-4 text-xs">
                      <span>Started: {formatTimestamp(incident.startTime)}</span>
                      <span>Duration: {formatUptime(Date.now() - incident.startTime)}</span>
                      <span>Escalation: Level {incident.escalationLevel}</span>
                      {incident.impactedServices.length > 0 && (
                        <span>Services: {incident.impactedServices.join(', ')}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleIncidentResolve(incident.id)}
                    className="ml-4 bg-white text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-100"
                  >
                    Resolve
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Health Check History */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-700 mb-3">Recent Health Checks</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Latency</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {state.healthHistory.slice(-10).map((check, index) => (
                <tr key={`${check.name}-${check.timestamp}-${index}`} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm font-medium">{check.name}</td>
                  <td className="px-4 py-2">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(check.status)}`}>
                      {check.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm">{check.latency}ms</td>
                  <td className="px-4 py-2 text-sm">{formatTimestamp(check.timestamp)}</td>
                  <td className="px-4 py-2 text-sm">
                    {check.fallbackUsed && <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs mr-2">Fallback</span>}
                    {check.retryCount && check.retryCount > 0 && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-2">Retries: {check.retryCount}</span>}
                    {check.error && <span className="text-red-600 text-xs" title={check.error}>Error</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Metrics */}
      {state.performanceReport && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">Performance Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(state.performanceReport).map(([metric, data]: [string, any]) => (
              <div key={metric} className="bg-gray-50 p-3 rounded">
                <h4 className="font-medium text-sm text-gray-700">{metric}</h4>
                <p className="text-lg font-bold">{data.latest || 'N/A'} {data.unit}</p>
                <div className="flex items-center space-x-2 text-xs">
                  <span className={`px-2 py-1 rounded ${getStatusColor(data.status)}`}>
                    {data.status}
                  </span>
                  <span className="text-gray-500">Avg: {data.average?.toFixed(1) || 'N/A'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alert History */}
      {state.alertHistory.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">Recent Alerts</h3>
          <div className="space-y-2">
            {state.alertHistory.map((alert, index) => (
              <div key={`${alert.id}-${index}`} className={`p-3 border-l-4 ${getSeverityColor(alert.severity).split(' ')[2]} bg-gray-50`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium">{alert.type.replace(/_/g, ' ').toUpperCase()}</span>
                      <span className={`text-xs px-2 py-1 rounded ${getSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(alert.triggeredAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleAlertSuppress(alert.type)}
                    className="ml-4 text-xs text-gray-600 hover:text-gray-800"
                  >
                    Suppress
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System Status Summary */}
      {state.systemStatus && (
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="font-semibold text-gray-700 mb-3">System Status Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="font-medium">Monitoring</p>
              <p className={state.systemStatus.monitoring ? 'text-green-600' : 'text-red-600'}>
                {state.systemStatus.monitoring ? 'Active' : 'Inactive'}
              </p>
            </div>
            <div>
              <p className="font-medium">Active Incidents</p>
              <p className="text-lg font-bold">{state.systemStatus.activeIncidents}</p>
            </div>
            <div>
              <p className="font-medium">Alerts (Last Hour)</p>
              <p className="text-lg font-bold">{state.systemStatus.alertsLastHour}</p>
            </div>
            <div>
              <p className="font-medium">Suppressed Alerts</p>
              <p className="text-lg font-bold">{state.systemStatus.suppressedAlerts}</p>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            Last updated: {new Date(state.lastUpdate).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
}; 