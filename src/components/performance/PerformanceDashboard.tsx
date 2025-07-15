/**
 * 🔴 IA ALPHA - PERFORMANCE DASHBOARD
 * Dashboard em tempo real para monitoramento de performance
 * 
 * Features:
 * - Core Web Vitals visualization
 * - Real-time metrics display
 * - Performance alerts
 * - Memory usage monitoring
 * - Historical data charts
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Download, 
  Eye, 
  MemoryStick, 
  TrendingUp,
  Zap,
  RefreshCw,
  Settings
} from 'lucide-react';
import { realTimePerformanceMonitor, PerformanceMetrics, PerformanceAlert } from '../../services/performance/RealTimePerformanceMonitor';

interface PerformanceDashboardProps {
  showAdvanced?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  showAdvanced = false,
  autoRefresh = true,
  refreshInterval = 5000
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [performanceScore, setPerformanceScore] = useState(realTimePerformanceMonitor.getCurrentPerformanceScore());
  const [isLoading, setIsLoading] = useState(false);

  // Atualiza dados em tempo real
  useEffect(() => {
    const updateData = () => {
      setMetrics(realTimePerformanceMonitor.getMetrics());
      setAlerts(realTimePerformanceMonitor.getAlerts());
      setPerformanceScore(realTimePerformanceMonitor.getCurrentPerformanceScore());
    };

    // Initial load
    updateData();

    // Listen for real-time updates
    const handleMetricUpdate = () => updateData();
    const handleAlert = () => updateData();

    window.addEventListener('performance-metric-update', handleMetricUpdate);
    window.addEventListener('performance-alert', handleAlert);

    // Auto refresh interval
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(updateData, refreshInterval);
    }

    return () => {
      window.removeEventListener('performance-metric-update', handleMetricUpdate);
      window.removeEventListener('performance-alert', handleAlert);
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, refreshInterval]);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      // Force update
      setMetrics(realTimePerformanceMonitor.getMetrics());
      setAlerts(realTimePerformanceMonitor.getAlerts());
      setPerformanceScore(realTimePerformanceMonitor.getCurrentPerformanceScore());
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = () => {
    const data = realTimePerformanceMonitor.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGradeBadgeVariant = (grade: string) => {
    if (grade === 'A') return 'default';
    if (grade === 'B') return 'secondary';
    if (grade === 'C') return 'outline';
    return 'destructive';
  };

  const getMetricStatus = (value: number, metric: string) => {
    const thresholds: Record<string, { good: number; warning: number }> = {
      fcp: { good: 1800, warning: 3000 },
      lcp: { good: 2500, warning: 4000 },
      fid: { good: 100, warning: 300 },
      cls: { good: 0.1, warning: 0.25 },
      ttfb: { good: 600, warning: 1000 }
    };

    const threshold = thresholds[metric];
    if (!threshold) return 'secondary';

    if (value <= threshold.good) return 'default';
    if (value <= threshold.warning) return 'secondary';
    return 'destructive';
  };

  const latestMetrics = metrics[metrics.length - 1];
  const recentAlerts = alerts.slice(-5);
  const criticalAlerts = alerts.filter(alert => alert.type === 'critical').length;
  const warningAlerts = alerts.filter(alert => alert.type === 'warning').length;

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Performance Monitor</h2>
          <p className="text-gray-600">Real-time performance tracking • IA Alpha System</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportData}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Performance Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Overall Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-3">
              <div className={`text-3xl font-bold ${getScoreColor(performanceScore.score)}`}>
                {performanceScore.score}
              </div>
              <Badge variant={getGradeBadgeVariant(performanceScore.grade)}>
                Grade {performanceScore.grade}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium">{criticalAlerts}</span>
              </div>
              <div className="flex items-center space-x-1">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium">{warningAlerts}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Memory Usage</CardTitle>
          </CardHeader>
          <CardContent>
            {latestMetrics?.memoryUsage ? (
              <div className="space-y-1">
                <div className="text-lg font-semibold">
                  {latestMetrics.memoryUsage.percentage.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">
                  {Math.round(latestMetrics.memoryUsage.used / 1024 / 1024)}MB / {Math.round(latestMetrics.memoryUsage.total / 1024 / 1024)}MB
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-400">No data</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Data Points</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-lg font-semibold">{metrics.length}</div>
              <div className="text-xs text-gray-500">Metrics collected</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Core Web Vitals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5" />
            <span>Core Web Vitals</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* First Contentful Paint */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">FCP</span>
                {latestMetrics?.fcp && (
                  <Badge variant={getMetricStatus(latestMetrics.fcp, 'fcp')}>
                    {latestMetrics.fcp.toFixed(0)}ms
                  </Badge>
                )}
              </div>
              <div className="text-xs text-gray-500">First Contentful Paint</div>
            </div>

            {/* Largest Contentful Paint */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">LCP</span>
                {latestMetrics?.lcp && (
                  <Badge variant={getMetricStatus(latestMetrics.lcp, 'lcp')}>
                    {latestMetrics.lcp.toFixed(0)}ms
                  </Badge>
                )}
              </div>
              <div className="text-xs text-gray-500">Largest Contentful Paint</div>
            </div>

            {/* First Input Delay */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">FID</span>
                {latestMetrics?.fid && (
                  <Badge variant={getMetricStatus(latestMetrics.fid, 'fid')}>
                    {latestMetrics.fid.toFixed(0)}ms
                  </Badge>
                )}
              </div>
              <div className="text-xs text-gray-500">First Input Delay</div>
            </div>

            {/* Cumulative Layout Shift */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">CLS</span>
                {latestMetrics?.cls && (
                  <Badge variant={getMetricStatus(latestMetrics.cls, 'cls')}>
                    {latestMetrics.cls.toFixed(3)}
                  </Badge>
                )}
              </div>
              <div className="text-xs text-gray-500">Cumulative Layout Shift</div>
            </div>

            {/* Time to First Byte */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">TTFB</span>
                {latestMetrics?.ttfb && (
                  <Badge variant={getMetricStatus(latestMetrics.ttfb, 'ttfb')}>
                    {latestMetrics.ttfb.toFixed(0)}ms
                  </Badge>
                )}
              </div>
              <div className="text-xs text-gray-500">Time to First Byte</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {recentAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Recent Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentAlerts.map((alert, index) => (
              <Alert key={index} variant={alert.type === 'critical' ? 'destructive' : 'default'}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <span>{alert.message}</span>
                    <Badge variant="outline">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </Badge>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Advanced Metrics (opcional) */}
      {showAdvanced && latestMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Advanced Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {latestMetrics.interactionLatency && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Interaction Latency</div>
                  <div className="text-lg">{latestMetrics.interactionLatency.toFixed(2)}ms</div>
                </div>
              )}
              
              {latestMetrics.routeChangeTime && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Route Change Time</div>
                  <div className="text-lg">{latestMetrics.routeChangeTime.toFixed(2)}ms</div>
                </div>
              )}
              
              <div className="space-y-2">
                <div className="text-sm font-medium">Session ID</div>
                <div className="text-xs font-mono bg-gray-100 p-2 rounded">
                  {latestMetrics.sessionId}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Indicator */}
      <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
        <Activity className="w-4 h-4 animate-pulse text-green-500" />
        <span>Live monitoring active • {metrics.length} data points collected</span>
      </div>
    </div>
  );
};

export default PerformanceDashboard; 