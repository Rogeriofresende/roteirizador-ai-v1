/**
 * 📊 PERFORMANCE DASHBOARD
 * Real-time performance monitoring dashboard
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { performanceService } from '../services/performance';
import { bundleOptimizer } from '../services/bundleOptimizer';
import { useMemoryLeak } from '../hooks/useMemoryLeak';
import { Activity, Zap, Package, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface DashboardMetrics {
  webVitals: {
    LCP?: number;
    FID?: number;
    CLS?: number;
    FCP?: number;
  };
  bundle: {
    size: number;
    score: number;
    loadTime: number;
  };
  memory: {
    usage: number;
    domNodes: number;
    leaks: string[];
  };
  lastUpdated: string;
}

// =============================================================================
// PERFORMANCE DASHBOARD COMPONENT
// =============================================================================

export const PerformanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  const memoryLeak = useMemoryLeak({
    componentName: 'PerformanceDashboard',
    checkInterval: 5000,
  });

  // Update metrics
  const updateMetrics = useCallback(async () => {
    setIsRefreshing(true);
    
    try {
      const webVitals = performanceService.getWebVitals();
      const resourceMetrics = performanceService.getResourceMetrics();
      const memoryMetrics = performanceService.getMemoryMetrics();
      const bundleMetrics = bundleOptimizer.getCurrentMetrics();

      setMetrics({
        webVitals,
        bundle: {
          size: bundleMetrics.currentBundleSize,
          score: 85, // Would come from bundle analysis
          loadTime: bundleMetrics.loadTime,
        },
        memory: {
          usage: memoryMetrics.memoryUsagePercent,
          domNodes: memoryMetrics.domNodes,
          leaks: memoryMetrics.potentialLeaks,
        },
        lastUpdated: new Date().toISOString(),
      });
    } catch (error: unknown) {
      console.error('Failed to update metrics:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    updateMetrics();
    
    if (autoRefresh) {
      const interval = setInterval(updateMetrics, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, updateMetrics]);

  // Generate report
  const generateReport = useCallback(() => {
    const report = performanceService.generateReport();
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  if (!metrics) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <Activity className="w-6 h-6 animate-spin mr-2" />
          <span>Carregando métricas de performance...</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Activity className="w-6 h-6 text-blue-500" />
          <h2 className="text-2xl font-bold">Performance Dashboard</h2>
          <Badge variant={autoRefresh ? 'default' : 'secondary'}>
            {autoRefresh ? 'Tempo Real' : 'Manual'}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? 'Pausar' : 'Auto-refresh'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={updateMetrics}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Activity className="w-4 h-4 animate-spin" />
            ) : (
              'Atualizar'
            )}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={generateReport}
          >
            Exportar
          </Button>
        </div>
      </div>

      {/* Web Vitals */}
      <Card className="p-6">
        <div className="flex items-center mb-4">
          <Zap className="w-5 h-5 text-yellow-500 mr-2" />
          <h3 className="text-lg font-semibold">Core Web Vitals</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <VitalMetric
            name="LCP"
            value={metrics.webVitals.LCP}
            unit="ms"
            threshold={2500}
            description="Largest Contentful Paint"
          />
          <VitalMetric
            name="FID"
            value={metrics.webVitals.FID}
            unit="ms"
            threshold={100}
            description="First Input Delay"
          />
          <VitalMetric
            name="CLS"
            value={metrics.webVitals.CLS}
            unit=""
            threshold={0.1}
            description="Cumulative Layout Shift"
          />
          <VitalMetric
            name="FCP"
            value={metrics.webVitals.FCP}
            unit="ms"
            threshold={1800}
            description="First Contentful Paint"
          />
        </div>
      </Card>

      {/* Bundle & Memory */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bundle Metrics */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <Package className="w-5 h-5 text-purple-500 mr-2" />
            <h3 className="text-lg font-semibold">Bundle Performance</h3>
          </div>
          
          <div className="space-y-4">
            <MetricRow
              label="Bundle Size"
              value={`${(metrics.bundle.size / 1024).toFixed(1)} KB`}
              status={metrics.bundle.size < 1024 * 1024 ? 'good' : 'warning'}
            />
            <MetricRow
              label="Performance Score"
              value={`${metrics.bundle.score}/100`}
              status={metrics.bundle.score > 80 ? 'good' : metrics.bundle.score > 60 ? 'warning' : 'error'}
            />
            <MetricRow
              label="Load Time"
              value={`${metrics.bundle.loadTime.toFixed(0)} ms`}
              status={metrics.bundle.loadTime < 500 ? 'good' : 'warning'}
            />
          </div>
        </Card>

        {/* Memory Metrics */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
            <h3 className="text-lg font-semibold">Memory Usage</h3>
          </div>
          
          <div className="space-y-4">
            <MetricRow
              label="Memory Usage"
              value={`${metrics.memory.usage.toFixed(1)}%`}
              status={metrics.memory.usage < 50 ? 'good' : metrics.memory.usage < 70 ? 'warning' : 'error'}
            />
            <MetricRow
              label="DOM Nodes"
              value={metrics.memory.domNodes.toLocaleString()}
              status={metrics.memory.domNodes < 2000 ? 'good' : metrics.memory.domNodes < 3000 ? 'warning' : 'error'}
            />
            <MetricRow
              label="Memory Leaks"
              value={metrics.memory.leaks.length === 0 ? 'None' : `${metrics.memory.leaks.length} detected`}
              status={metrics.memory.leaks.length === 0 ? 'good' : 'error'}
            />
          </div>
          
          {metrics.memory.leaks.length > 0 && (
            <div className="mt-4 p-3 bg-red-50 rounded-lg">
              <h4 className="text-sm font-medium text-red-700 mb-2">Potential Memory Leaks:</h4>
              <ul className="text-sm text-red-600 space-y-1">
                {metrics.memory.leaks.map((leak, index) => (
                  <li key={index}>• {leak}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      </div>

      {/* Footer */}
      <Card className="p-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Última atualização: {new Date(metrics.lastUpdated).toLocaleTimeString()}
          </span>
          <span>
            Monitoramento: {autoRefresh ? 'Ativo' : 'Pausado'}
          </span>
        </div>
      </Card>
    </div>
  );
};

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

interface VitalMetricProps {
  name: string;
  value?: number;
  unit: string;
  threshold: number;
  description: string;
}

const VitalMetric: React.FC<VitalMetricProps> = ({ name, value, unit, threshold, description }) => {
  const getStatus = () => {
    if (!value) return 'unknown';
    return value <= threshold ? 'good' : 'warning';
  };

  const getStatusIcon = () => {
    const status = getStatus();
    switch (status) {
      case 'good':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="p-3 border rounded-lg">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium">{name}</span>
        {getStatusIcon()}
      </div>
      <div className="text-lg font-bold">
        {value ? `${value.toFixed(name === 'CLS' ? 3 : 0)}${unit}` : 'N/A'}
      </div>
      <div className="text-xs text-muted-foreground">{description}</div>
    </div>
  );
};

interface MetricRowProps {
  label: string;
  value: string;
  status: 'good' | 'warning' | 'error';
}

const MetricRow: React.FC<MetricRowProps> = ({ label, value, status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'good':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'good':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
  };

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center space-x-2">
        <span className={`text-sm font-medium ${getStatusColor()}`}>{value}</span>
        {getStatusIcon()}
      </div>
    </div>
  );
};

export default PerformanceDashboard; 