import React, { useState, useEffect } from 'react';
import { healthCheckService } from '../services/healthCheckService';
import { analyticsService } from '../services/analyticsService';

interface SystemDashboardProps {
  onClose: () => void;
}

interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'down';
  score: number;
  checks: Record<string, any>;
  lastCheck: string;
  uptime: number;
}

export const SystemDashboard: React.FC<SystemDashboardProps> = ({ onClose }) => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Carregar dados do health check
      const healthData = await healthCheckService.getHealth();
      setHealth(healthData);
      
      // Carregar alertas
      const alertsData = healthCheckService.getAlerts();
      setAlerts(alertsData.slice(0, 10)); // Últimos 10 alertas
      
      // Carregar dados do analytics
      const analyticsData = analyticsService.getSessionData();
      setAnalytics(analyticsData);
      
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      case 'degraded': return 'text-orange-600';
      case 'down': return 'text-red-700';
      default: return 'text-gray-600';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100';
      case 'warning': return 'bg-yellow-100';
      case 'critical': return 'bg-red-100';
      case 'degraded': return 'bg-orange-100';
      case 'down': return 'bg-red-200';
      default: return 'bg-gray-100';
    }
  };

  const formatUptime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m`;
    return `${seconds}s`;
  };

  const exportData = () => {
    const data = {
      health,
      alerts,
      analytics,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `roteirizar-dashboard-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAlerts = () => {
    healthCheckService.clearAlerts();
    setAlerts([]);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Sistema Dashboard</h2>
            <p className="text-gray-600">Monitoramento e Status do Sistema</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Carregando...</span>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Status Geral */}
            {health && (
              <div className={`p-4 rounded-lg ${getStatusBgColor(health.overall)}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Status Geral</h3>
                    <p className={`text-xl font-bold ${getStatusColor(health.overall)}`}>
                      {health.overall.toUpperCase()} ({health.score}%)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Uptime</p>
                    <p className="font-mono">{formatUptime(health.uptime)}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Última verificação: {new Date(health.lastCheck).toLocaleString()}
                </p>
              </div>
            )}

            {/* Health Checks */}
            {health && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Health Checks</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(health.checks).map(([key, check]: [string, any]) => (
                    <div
                      key={key}
                      className={`p-3 rounded border-l-4 ${
                        check.status === 'healthy' 
                          ? 'border-green-500 bg-green-50' 
                          : check.status === 'warning'
                          ? 'border-yellow-500 bg-yellow-50'
                          : 'border-red-500 bg-red-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{key.replace('_', ' ').toUpperCase()}</h4>
                        <span className={`text-sm ${getStatusColor(check.status)}`}>
                          {check.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{check.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {check.responseTime}ms - {new Date(check.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Analytics Summary */}
            {analytics && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Analytics da Sessão</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-3 rounded">
                    <p className="text-sm text-blue-600 font-medium">Page Views</p>
                    <p className="text-2xl font-bold text-blue-900">{analytics.page_views}</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <p className="text-sm text-green-600 font-medium">Scripts Gerados</p>
                    <p className="text-2xl font-bold text-green-900">{analytics.scripts_generated}</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded">
                    <p className="text-sm text-purple-600 font-medium">Conversão</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {analytics.page_views > 0 
                        ? Math.round((analytics.scripts_generated / analytics.page_views) * 100)
                        : 0}%
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-600 font-medium">Duração</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatUptime(Date.now() - analytics.start_time)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Alertas */}
            {alerts.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">Alertas Recentes</h3>
                  <button
                    onClick={clearAlerts}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Limpar Alertas
                  </button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {alerts.map((alert, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded border-l-4 ${
                        alert.severity === 'CRITICAL' 
                          ? 'border-red-500 bg-red-50' 
                          : 'border-yellow-500 bg-yellow-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-medium ${
                          alert.severity === 'CRITICAL' ? 'text-red-800' : 'text-yellow-800'
                        }`}>
                          {alert.severity}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(alert.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">
                        Score: {alert.score}% | Uptime: {alert.uptime}
                      </p>
                      {alert.failedChecks?.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-600">Falhas:</p>
                          <ul className="text-xs text-gray-700 ml-2">
                            {alert.failedChecks.map((check: any, i: number) => (
                              <li key={i}>• {check.name}: {check.message}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comandos Úteis */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Comandos de Debug</h3>
              <div className="bg-gray-50 p-4 rounded font-mono text-sm space-y-1">
                <p><span className="text-blue-600">healthCheck.getHealth()</span> - Status completo</p>
                <p><span className="text-blue-600">analytics.getSessionData()</span> - Dados da sessão</p>
                <p><span className="text-blue-600">analytics.exportAnalyticsData()</span> - Exportar dados</p>
                <p className="text-xs text-gray-600 mt-2">
                  * Execute estes comandos no console do navegador (F12)
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-4 pt-4 border-t">
              <button
                onClick={loadDashboardData}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                🔄 Atualizar
              </button>
              <button
                onClick={exportData}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                📥 Exportar Dados
              </button>
              <button
                onClick={() => window.open('https://analytics.google.com', '_blank')}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                📊 Google Analytics
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 