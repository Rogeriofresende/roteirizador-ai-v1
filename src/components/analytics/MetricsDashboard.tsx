/**
 * 📊 METRICS DASHBOARD V9.0
 * 
 * Dashboard avançado para visualização de métricas e analytics
 * Interface para administradores monitorarem uso e performance
 * 
 * @methodology V9.0_NATURAL_LANGUAGE_FIRST
 * @specification DASH-METRICS-001
 * @author IA Beta - Analytics UI Architect
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  Users,
  Activity,
  TrendingUp,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle,
  Download,
  Filter,
  RefreshCw,
  Eye,
  FileText,
  Play
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { metricsService, UsageStats, MetricEvent, MetricEventType } from '../../services/analytics/metricsService';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface DashboardFilter {
  timeRange: '1h' | '24h' | '7d' | '30d';
  eventType?: MetricEventType;
  userId?: string;
}

interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
  }>;
}

// ============================================================================
// METRICS DASHBOARD COMPONENT
// ============================================================================

export const MetricsDashboard: React.FC = () => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [stats, setStats] = useState<UsageStats>({
    totalUsers: 0,
    activeUsers: 0,
    scriptsGenerated: 0,
    scriptsExported: 0,
    averageSessionDuration: 0,
    topFeatures: [],
    performanceScore: 100
  });
  
  const [recentEvents, setRecentEvents] = useState<MetricEvent[]>([]);
  const [filter, setFilter] = useState<DashboardFilter>({ timeRange: '24h' });
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const fetchMetricsData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Calcular período baseado no filtro
      const now = new Date();
      let startDate: Date;
      
      switch (filter.timeRange) {
        case '1h':
          startDate = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case '24h':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
      }

      // Buscar estatísticas
      const usageStats = metricsService.getUsageStats({
        startDate,
        eventType: filter.eventType,
        userId: filter.userId
      });
      setStats(usageStats);

      // Buscar eventos recentes
      const events = metricsService.getEvents({
        startDate,
        eventType: filter.eventType,
        userId: filter.userId,
        limit: 50
      });
      setRecentEvents(events);

    } catch (error) {
      console.error('Erro ao buscar dados de métricas:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    fetchMetricsData();
  }, [fetchMetricsData]);

  // Auto-refresh a cada 30 segundos
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(fetchMetricsData, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchMetricsData]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleFilterChange = useCallback((newFilter: Partial<DashboardFilter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
  }, []);

  const handleRefresh = useCallback(() => {
    fetchMetricsData();
  }, [fetchMetricsData]);

  const handleExportData = useCallback(() => {
    const data = {
      stats,
      events: recentEvents,
      exportedAt: new Date().toISOString(),
      filter
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `metrics-export-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }, [stats, recentEvents, filter]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const getPerformanceScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getPerformanceScoreIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (score >= 70) return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    return <AlertTriangle className="w-5 h-5 text-red-600" />;
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getEventIcon = (type: MetricEventType) => {
    switch (type) {
      case 'script_generated': return <FileText className="w-4 h-4 text-blue-600" />;
      case 'script_exported': return <Download className="w-4 h-4 text-green-600" />;
      case 'feature_used': return <Play className="w-4 h-4 text-purple-600" />;
      case 'page_view': return <Eye className="w-4 h-4 text-gray-600" />;
      case 'error_occurred': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatEventType = (type: MetricEventType) => {
    const types: Record<MetricEventType, string> = {
      'page_view': 'Visualização',
      'feature_used': 'Recurso Usado',
      'script_generated': 'Roteiro Gerado',
      'script_exported': 'Roteiro Exportado',
      'user_interaction': 'Interação',
      'performance_metric': 'Performance',
      'error_occurred': 'Erro',
      'session_start': 'Sessão Iniciada',
      'session_end': 'Sessão Finalizada',
      'api_call': 'Chamada API',
      'auth_action': 'Ação de Auth'
    };
    return types[type] || type;
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BarChart3 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard de Métricas</h1>
            <p className="text-gray-600">Analytics e monitoramento de uso em tempo real</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? 'Auto-refresh: ON' : 'Auto-refresh: OFF'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportData}
          >
            <Download className="w-4 h-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Filtros</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Time Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Período
            </label>
            <select
              value={filter.timeRange}
              onChange={(e) => handleFilterChange({ timeRange: e.target.value as DashboardFilter['timeRange'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1h">Última hora</option>
              <option value="24h">Últimas 24 horas</option>
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
            </select>
          </div>

          {/* Event Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Evento
            </label>
            <select
              value={filter.eventType || ''}
              onChange={(e) => handleFilterChange({ eventType: e.target.value as MetricEventType || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos os tipos</option>
              <option value="script_generated">Roteiros Gerados</option>
              <option value="script_exported">Roteiros Exportados</option>
              <option value="feature_used">Recursos Utilizados</option>
              <option value="page_view">Visualizações</option>
              <option value="error_occurred">Erros</option>
            </select>
          </div>

          {/* User ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ID do Usuário
            </label>
            <input
              type="text"
              value={filter.userId || ''}
              onChange={(e) => handleFilterChange({ userId: e.target.value || undefined })}
              placeholder="Filtrar por usuário específico"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Usuários Totais</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalUsers}</p>
            </div>
            <Users className="w-5 h-5 text-blue-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Usuários Ativos</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeUsers}</p>
            </div>
            <Activity className="w-5 h-5 text-green-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Roteiros Gerados</p>
              <p className="text-2xl font-bold text-purple-600">{stats.scriptsGenerated}</p>
            </div>
            <FileText className="w-5 h-5 text-purple-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Score Performance</p>
              <p className={`text-2xl font-bold ${getPerformanceScoreColor(stats.performanceScore)}`}>
                {Math.round(stats.performanceScore)}%
              </p>
            </div>
            {getPerformanceScoreIcon(stats.performanceScore)}
          </div>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">Sessão Média</h3>
            <Clock className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-orange-600">
            {formatDuration(stats.averageSessionDuration)}
          </p>
          <p className="text-sm text-gray-600 mt-1">Duração por sessão</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">Exportações</h3>
            <Download className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.scriptsExported}</p>
          <p className="text-sm text-gray-600 mt-1">Roteiros exportados</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">Taxa de Conversão</h3>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {stats.scriptsGenerated > 0 
              ? Math.round((stats.scriptsExported / stats.scriptsGenerated) * 100)
              : 0}%
          </p>
          <p className="text-sm text-gray-600 mt-1">Geração → Exportação</p>
        </Card>
      </div>

      {/* Top Features */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Recursos Mais Utilizados
        </h3>
        
        {stats.topFeatures.length === 0 ? (
          <div className="text-center py-8">
            <Zap className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Nenhum dado de uso de recursos disponível</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.topFeatures.slice(0, 10).map((feature, index) => (
              <div key={feature.feature} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 text-sm font-medium rounded">
                    {index + 1}
                  </span>
                  <span className="font-medium text-gray-800">{feature.feature}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ 
                        width: `${Math.min((feature.usage / Math.max(...stats.topFeatures.map(f => f.usage))) * 100, 100)}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-600 w-12 text-right">
                    {feature.usage}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Recent Events */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Eventos Recentes ({recentEvents.length})
        </h3>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Carregando eventos...</p>
          </div>
        ) : recentEvents.length === 0 ? (
          <div className="text-center py-8">
            <Eye className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Nenhum evento encontrado para os filtros selecionados</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {recentEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  {getEventIcon(event.type)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">
                        {formatEventType(event.type)}
                      </span>
                      {event.data.feature && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          {event.data.feature}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {event.userId && `Usuário: ${event.userId.slice(0, 8)}...`}
                      {event.data.success !== undefined && ` • ${event.data.success ? 'Sucesso' : 'Falha'}`}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  {event.timestamp.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default MetricsDashboard;