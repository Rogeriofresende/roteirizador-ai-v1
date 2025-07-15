/**
 * 📊 PERFORMANCE DASHBOARD
 * Real-time performance monitoring dashboard
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Activity, Zap, Clock, Eye, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { WebVitalsService, WebVitalMetric, PerformanceReport } from '../services/monitoring/WebVitalsService';

interface PerformanceDashboardProps {
  userId?: string;
  reportingEndpoint?: string;
}

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  userId,
  reportingEndpoint = '/api/performance'
}) => {
  const [webVitalsService, setWebVitalsService] = useState<WebVitalsService | null>(null);
  const [metrics, setMetrics] = useState<WebVitalMetric[]>([]);
  const [performanceReport, setPerformanceReport] = useState<PerformanceReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now());

  // Initialize Web Vitals Service
  useEffect(() => {
    const service = new WebVitalsService({
      reportingEndpoint,
      userId,
      reportingInterval: 15000 // 15 seconds
    });
    
    setWebVitalsService(service);
    
    return () => {
      service.destroy();
    };
  }, [userId, reportingEndpoint]);

  // Update metrics periodically
  useEffect(() => {
    if (!webVitalsService) return;

    const updateMetrics = () => {
      const latestMetrics = webVitalsService.getMetrics();
      const latestReport = webVitalsService.getLatestReport();
      
      setMetrics(latestMetrics);
      setPerformanceReport(latestReport);
      setLastUpdateTime(Date.now());
      setIsLoading(false);
    };

    // Initial update
    updateMetrics();

    // Set up interval for updates
    const interval = setInterval(updateMetrics, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [webVitalsService]);

  const getMetricIcon = (metricName: string) => {
    switch (metricName.toLowerCase()) {
      case 'lcp':
        return <Eye className="w-5 h-5" />;
      case 'fid':
        return <Zap className="w-5 h-5" />;
      case 'cls':
        return <Activity className="w-5 h-5" />;
      case 'fcp':
        return <Clock className="w-5 h-5" />;
      case 'ttfb':
        return <TrendingUp className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  const getMetricColor = (rating: string) => {
    switch (rating) {
      case 'good':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'needs-improvement':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'poor':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getMetricDescription = (metricName: string) => {
    switch (metricName.toLowerCase()) {
      case 'lcp':
        return 'Largest Contentful Paint - Time to render the largest visible element';
      case 'fid':
        return 'First Input Delay - Time from first interaction to browser response';
      case 'cls':
        return 'Cumulative Layout Shift - Visual stability of page elements';
      case 'fcp':
        return 'First Contentful Paint - Time to render first content';
      case 'ttfb':
        return 'Time to First Byte - Time to receive first byte from server';
      default:
        return 'Performance metric';
    }
  };

  const formatMetricValue = (metricName: string, value: number) => {
    switch (metricName.toLowerCase()) {
      case 'cls':
        return value.toFixed(3);
      case 'lcp':
      case 'fcp':
      case 'ttfb':
        return `${Math.round(value)}ms`;
      case 'fid':
        return `${Math.round(value)}ms`;
      default:
        return Math.round(value).toString();
    }
  };

  const getOverallScore = () => {
    if (metrics.length === 0) return 0;
    
    const goodMetrics = metrics.filter(m => m.rating === 'good').length;
    const totalMetrics = metrics.length;
    
    return Math.round((goodMetrics / totalMetrics) * 100);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const clearMetrics = useCallback(() => {
    if (webVitalsService) {
      webVitalsService.clearMetrics();
      setMetrics([]);
      setPerformanceReport(null);
    }
  }, [webVitalsService]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Carregando métricas de performance...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Performance Dashboard
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Monitoramento em tempo real das Web Vitals
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className={`text-2xl font-bold ${getScoreColor(getOverallScore())}`}>
                {getOverallScore()}%
              </div>
              <div className="text-sm text-gray-600">Score Geral</div>
            </div>
            <button
              onClick={clearMetrics}
              className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Limpar Métricas
            </button>
          </div>
        </div>
      </div>

      {/* Web Vitals Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <div
            key={`${metric.name}-${index}`}
            className={`bg-white rounded-lg border p-4 ${getMetricColor(metric.rating)}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {getMetricIcon(metric.name)}
                <span className="font-medium text-sm uppercase">{metric.name}</span>
              </div>
              <div className="flex items-center">
                {metric.rating === 'good' ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                )}
              </div>
            </div>
            
            <div className="mb-2">
              <div className="text-2xl font-bold">
                {formatMetricValue(metric.name, metric.value)}
              </div>
              <div className="text-xs opacity-75 capitalize">
                {metric.rating.replace('-', ' ')}
              </div>
            </div>
            
            <div className="text-xs opacity-75">
              {getMetricDescription(metric.name)}
            </div>
          </div>
        ))}
      </div>

      {/* Performance Summary */}
      {performanceReport && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold mb-4">Resumo de Performance</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-blue-600 font-medium">Page Load Time</div>
              <div className="text-2xl font-bold text-blue-900">
                {Math.round(performanceReport.pageLoadTime)}ms
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-green-600 font-medium">DOM Content Loaded</div>
              <div className="text-2xl font-bold text-green-900">
                {Math.round(performanceReport.domContentLoadedTime)}ms
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-sm text-purple-600 font-medium">First Paint</div>
              <div className="text-2xl font-bold text-purple-900">
                {Math.round(performanceReport.firstPaintTime)}ms
              </div>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="text-sm text-orange-600 font-medium">Resources Loaded</div>
              <div className="text-2xl font-bold text-orange-900">
                {performanceReport.resourceLoadTimes.length}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resource Performance */}
      {performanceReport && performanceReport.resourceLoadTimes.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold mb-4">Performance de Recursos</h4>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2">Recurso</th>
                  <th className="text-left py-2">Tipo</th>
                  <th className="text-left py-2">Duração</th>
                  <th className="text-left py-2">Tamanho</th>
                  <th className="text-left py-2">Cache</th>
                </tr>
              </thead>
              <tbody>
                {performanceReport.resourceLoadTimes
                  .sort((a, b) => b.duration - a.duration)
                  .slice(0, 10)
                  .map((resource, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-2 max-w-xs truncate" title={resource.name}>
                        {resource.name.split('/').pop()}
                      </td>
                      <td className="py-2">
                        <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                          {resource.type}
                        </span>
                      </td>
                      <td className="py-2">{Math.round(resource.duration)}ms</td>
                      <td className="py-2">{Math.round(resource.size / 1024)}KB</td>
                      <td className="py-2">
                        {resource.cached ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-gray-400" />
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Last Update */}
      <div className="text-center text-sm text-gray-500">
        Última atualização: {new Date(lastUpdateTime).toLocaleTimeString()}
      </div>
    </div>
  );
};

export default PerformanceDashboard; 