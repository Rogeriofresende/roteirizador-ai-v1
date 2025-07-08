/**
 * V6.2 Enhanced Framework - useIntelligenceDashboard Hook
 * Hook para dashboard inteligente com métricas em tempo real
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  IntelligenceDashboardService, 
  DashboardMetric, 
  DashboardInsight,
  DashboardWidget 
} from '../services/intelligenceDashboardService';
import { useAuth } from '../contexts/AuthContext';
import { createLogger } from '../utils/logger';

const logger = createLogger('useIntelligenceDashboard');

interface DashboardState {
  isInitialized: boolean;
  isLoading: boolean;
  metrics: DashboardMetric[];
  insights: DashboardInsight[];
  layout: DashboardWidget[];
  error: string | null;
  lastUpdate: Date | null;
}

interface UseIntelligenceDashboardOptions {
  autoInitialize?: boolean;
  refreshInterval?: number;
  metricsFilter?: DashboardMetric['category'];
  onMetricUpdate?: (metrics: DashboardMetric[]) => void;
  onInsightReceived?: (insight: DashboardInsight) => void;
}

export const useIntelligenceDashboard = (
  options: UseIntelligenceDashboardOptions = {}
) => {
  const { user } = useAuth();
  const [state, setState] = useState<DashboardState>({
    isInitialized: false,
    isLoading: false,
    metrics: [],
    insights: [],
    layout: [],
    error: null,
    lastUpdate: null
  });

  const cleanupRef = useRef<(() => void) | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Inicializar dashboard
  useEffect(() => {
    if (user?.uid && options.autoInitialize !== false) {
      initializeDashboard();
    }

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [user?.uid]);

  // Configurar listener de métricas
  useEffect(() => {
    if (!state.isInitialized) return;

    const cleanup = IntelligenceDashboardService.onMetricsUpdate((metrics) => {
      setState(prev => ({
        ...prev,
        metrics,
        lastUpdate: new Date()
      }));

      if (options.onMetricUpdate) {
        options.onMetricUpdate(metrics);
      }
    });

    cleanupRef.current = cleanup;
    return cleanup;
  }, [state.isInitialized, options.onMetricUpdate]);

  // Configurar refresh automático
  useEffect(() => {
    if (!state.isInitialized || !options.refreshInterval) return;

    refreshIntervalRef.current = setInterval(() => {
      refreshMetrics();
    }, options.refreshInterval);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [state.isInitialized, options.refreshInterval]);

  // Inicializar dashboard
  const initializeDashboard = useCallback(async () => {
    if (!user?.uid) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await IntelligenceDashboardService.initializeDashboard(user.uid);
      
      // Carregar dados iniciais
      const [metrics, layout] = await Promise.all([
        IntelligenceDashboardService.getRealtimeMetrics(user.uid, options.metricsFilter),
        IntelligenceDashboardService.getDashboardLayout(user.uid)
      ]);

      // Gerar insights iniciais
      const insights = await IntelligenceDashboardService.generateInsights(user.uid, metrics);

      setState(prev => ({
        ...prev,
        isInitialized: true,
        isLoading: false,
        metrics,
        insights,
        layout,
        lastUpdate: new Date()
      }));

      logger.info('Dashboard inicializado', {
        metricsCount: metrics.length,
        insightsCount: insights.length
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao inicializar';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      logger.error('Erro ao inicializar dashboard', error);
    }
  }, [user?.uid, options.metricsFilter]);

  // Atualizar métricas
  const refreshMetrics = useCallback(async () => {
    if (!user?.uid || !state.isInitialized) return;

    try {
      const metrics = await IntelligenceDashboardService.getRealtimeMetrics(
        user.uid,
        options.metricsFilter
      );

      setState(prev => ({
        ...prev,
        metrics,
        lastUpdate: new Date()
      }));

      // Gerar novos insights se houver mudanças significativas
      const significantChange = metrics.some(m => 
        Math.abs((m.changePercent || 0)) > 10
      );

      if (significantChange) {
        const insights = await IntelligenceDashboardService.generateInsights(
          user.uid,
          metrics
        );
        
        setState(prev => ({ ...prev, insights }));

        // Notificar sobre novos insights
        insights.forEach(insight => {
          if (options.onInsightReceived && insight.timestamp > (state.lastUpdate || new Date(0))) {
            options.onInsightReceived(insight);
          }
        });
      }

    } catch (error) {
      logger.error('Erro ao atualizar métricas', error);
    }
  }, [user?.uid, state.isInitialized, state.lastUpdate, options]);

  // Adicionar widget personalizado
  const addWidget = useCallback(async (
    widget: Omit<DashboardWidget, 'id'>
  ): Promise<string | null> => {
    if (!user?.uid) return null;

    try {
      const widgetId = await IntelligenceDashboardService.addCustomWidget(
        user.uid,
        widget
      );

      // Recarregar layout
      const layout = await IntelligenceDashboardService.getDashboardLayout(user.uid);
      setState(prev => ({ ...prev, layout }));

      logger.info('Widget adicionado', { widgetId });
      return widgetId;

    } catch (error) {
      logger.error('Erro ao adicionar widget', error);
      return null;
    }
  }, [user?.uid]);

  // Remover widget
  const removeWidget = useCallback(async (widgetId: string): Promise<void> => {
    if (!user?.uid) return;

    try {
      await IntelligenceDashboardService.removeWidget(user.uid, widgetId);

      // Atualizar layout local
      setState(prev => ({
        ...prev,
        layout: prev.layout.filter(w => w.id !== widgetId)
      }));

      logger.info('Widget removido', { widgetId });

    } catch (error) {
      logger.error('Erro ao remover widget', error);
    }
  }, [user?.uid]);

  // Atualizar layout do dashboard
  const updateLayout = useCallback(async (
    newLayout: DashboardWidget[]
  ): Promise<void> => {
    if (!user?.uid) return;

    try {
      await IntelligenceDashboardService.updateDashboardConfig(user.uid, {
        layout: newLayout
      });

      setState(prev => ({ ...prev, layout: newLayout }));
      logger.info('Layout atualizado');

    } catch (error) {
      logger.error('Erro ao atualizar layout', error);
    }
  }, [user?.uid]);

  // Executar ação de insight
  const executeInsightAction = useCallback(async (
    insight: DashboardInsight
  ): Promise<void> => {
    if (!insight.actionable || !insight.action) return;

    try {
      // Emitir evento customizado
      window.dispatchEvent(new CustomEvent(insight.action.handler, {
        detail: insight.action.params
      }));

      logger.info('Ação de insight executada', {
        insightId: insight.id,
        handler: insight.action.handler
      });

    } catch (error) {
      logger.error('Erro ao executar ação', error);
    }
  }, []);

  // Obter métrica específica
  const getMetric = useCallback((metricId: string): DashboardMetric | null => {
    return state.metrics.find(m => m.id === metricId) || null;
  }, [state.metrics]);

  // Filtrar insights
  const getInsightsByType = useCallback((
    type: DashboardInsight['type']
  ): DashboardInsight[] => {
    return state.insights.filter(i => i.type === type);
  }, [state.insights]);

  // Obter estatísticas resumidas
  const getSummaryStats = useCallback(() => {
    const metrics = state.metrics;
    
    const improving = metrics.filter(m => m.trend === 'up').length;
    const declining = metrics.filter(m => m.trend === 'down').length;
    const stable = metrics.filter(m => m.trend === 'stable').length;

    const avgChange = metrics.reduce((sum, m) => sum + (m.changePercent || 0), 0) / metrics.length;

    const criticalInsights = state.insights.filter(i => i.impact === 'high').length;
    const actionableInsights = state.insights.filter(i => i.actionable).length;

    return {
      totalMetrics: metrics.length,
      improving,
      declining,
      stable,
      avgChange,
      totalInsights: state.insights.length,
      criticalInsights,
      actionableInsights
    };
  }, [state.metrics, state.insights]);

  return {
    // Estado
    isInitialized: state.isInitialized,
    isLoading: state.isLoading,
    error: state.error,
    lastUpdate: state.lastUpdate,

    // Dados
    metrics: state.metrics,
    insights: state.insights,
    layout: state.layout,

    // Ações principais
    initializeDashboard,
    refreshMetrics,
    addWidget,
    removeWidget,
    updateLayout,
    executeInsightAction,

    // Utilidades
    getMetric,
    getInsightsByType,
    getSummaryStats,

    // Helpers
    hasData: state.metrics.length > 0,
    hasInsights: state.insights.length > 0,
    hasCriticalInsights: state.insights.some(i => i.impact === 'high'),
    
    // Métricas específicas rápidas
    conversionRate: getMetric('conversion_rate')?.value,
    userSatisfaction: getMetric('user_satisfaction')?.value,
    avgGenerationTime: getMetric('avg_generation_time')?.value,
    
    // Estados derivados
    isHealthy: state.metrics.every(m => 
      m.category !== 'performance' || m.value >= 0.7
    )
  };
}; 