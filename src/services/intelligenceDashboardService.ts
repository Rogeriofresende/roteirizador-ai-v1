/**
 * V6.2 Enhanced Framework - Intelligence Dashboard Service
 * Dashboard inteligente com métricas e insights em tempo real
 */

import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  Timestamp,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { analyticsService } from './analyticsService';
import { PredictiveUXService } from './predictiveUXService';
import { createLogger } from '../utils/logger';

const logger = createLogger('intelligenceDashboardService');

export interface DashboardMetric {
  id: string;
  name: string;
  value: number;
  previousValue?: number;
  trend: 'up' | 'down' | 'stable';
  changePercent?: number;
  sparkline?: number[];
  lastUpdated: Date;
  category: 'performance' | 'usage' | 'quality' | 'engagement';
  priority: 'low' | 'medium' | 'high';
}

export interface DashboardInsight {
  id: string;
  type: 'recommendation' | 'warning' | 'achievement' | 'prediction';
  title: string;
  description: string;
  actionable: boolean;
  action?: {
    label: string;
    handler: string;
    params?: any;
  };
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  timestamp: Date;
}

export interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'list' | 'heatmap' | 'timeline';
  title: string;
  position: { x: number; y: number; w: number; h: number };
  config: Record<string, any>;
  refreshInterval?: number;
  dataSource: string;
}

interface UserDashboardConfig {
  userId: string;
  layout: DashboardWidget[];
  theme: 'light' | 'dark' | 'auto';
  refreshRate: number;
  favoriteMetrics: string[];
  customAlerts: Array<{
    metric: string;
    condition: 'above' | 'below' | 'equals';
    threshold: number;
    enabled: boolean;
  }>;
  lastUpdated: Timestamp;
}

export class IntelligenceDashboardService {
  private static metricsCache = new Map<string, DashboardMetric>();
  private static insightsCache = new Map<string, DashboardInsight>();
  private static subscriptions = new Map<string, Unsubscribe>();
  private static updateCallbacks = new Set<(metrics: DashboardMetric[]) => void>();

  /**
   * Métricas padrão do sistema
   */
  private static defaultMetrics: Partial<DashboardMetric>[] = [
    {
      name: 'Taxa de Conversão',
      category: 'performance',
      priority: 'high'
    },
    {
      name: 'Tempo Médio de Geração',
      category: 'performance',
      priority: 'medium'
    },
    {
      name: 'Satisfação do Usuário',
      category: 'quality',
      priority: 'high'
    },
    {
      name: 'Engajamento Diário',
      category: 'engagement',
      priority: 'medium'
    },
    {
      name: 'Precisão da IA',
      category: 'quality',
      priority: 'high'
    },
    {
      name: 'Uso de Recursos',
      category: 'usage',
      priority: 'low'
    }
  ];

  /**
   * Inicializa o dashboard para um usuário
   */
  static async initializeDashboard(userId: string): Promise<void> {
    try {
      // Carregar configuração do usuário
      const config = await this.loadUserConfig(userId);
      
      // Iniciar coleta de métricas
      await this.startMetricsCollection(userId);
      
      // Gerar insights iniciais
      await this.generateInitialInsights(userId);
      
      // Configurar atualizações em tempo real
      this.setupRealtimeUpdates(userId);

      logger.info('Dashboard inicializado', { userId });

    } catch (error) {
      logger.error('Erro ao inicializar dashboard', error);
      throw error;
    }
  }

  /**
   * Obtém métricas em tempo real
   */
  static async getRealtimeMetrics(
    userId: string,
    category?: DashboardMetric['category']
  ): Promise<DashboardMetric[]> {
    try {
      // Coletar métricas atuais
      const metrics = await this.collectCurrentMetrics(userId);
      
      // Filtrar por categoria se especificada
      const filtered = category 
        ? metrics.filter(m => m.category === category)
        : metrics;

      // Atualizar cache
      filtered.forEach(metric => {
        this.metricsCache.set(metric.id, metric);
      });

      // Calcular tendências
      const withTrends = filtered.map(metric => 
        this.calculateTrend(metric)
      );

      return withTrends;

    } catch (error) {
      logger.error('Erro ao obter métricas', error);
      return [];
    }
  }

  /**
   * Gera insights inteligentes
   */
  static async generateInsights(
    userId: string,
    metrics: DashboardMetric[]
  ): Promise<DashboardInsight[]> {
    const insights: DashboardInsight[] = [];

    try {
      // Analisar performance
      const perfInsights = await this.analyzePerformance(metrics);
      insights.push(...perfInsights);

      // Prever tendências
      const predictions = await this.predictTrends(userId, metrics);
      insights.push(...predictions);

      // Recomendações personalizadas
      const recommendations = await this.generateRecommendations(userId, metrics);
      insights.push(...recommendations);

      // Alertas importantes
      const alerts = await this.checkAlerts(userId, metrics);
      insights.push(...alerts);

      // Ordenar por impacto e confidence
      insights.sort((a, b) => {
        const impactScore = { low: 1, medium: 2, high: 3 };
        const scoreA = impactScore[a.impact] * a.confidence;
        const scoreB = impactScore[b.impact] * b.confidence;
        return scoreB - scoreA;
      });

      // Atualizar cache
      insights.forEach(insight => {
        this.insightsCache.set(insight.id, insight);
      });

      return insights;

    } catch (error) {
      logger.error('Erro ao gerar insights', error);
      return [];
    }
  }

  /**
   * Obtém layout personalizado do dashboard
   */
  static async getDashboardLayout(userId: string): Promise<DashboardWidget[]> {
    try {
      const config = await this.loadUserConfig(userId);
      
      if (config?.layout && config.layout.length > 0) {
        return config.layout;
      }

      // Retornar layout padrão
      return this.getDefaultLayout();

    } catch (error) {
      logger.error('Erro ao obter layout', error);
      return this.getDefaultLayout();
    }
  }

  /**
   * Atualiza configuração do dashboard
   */
  static async updateDashboardConfig(
    userId: string,
    updates: Partial<UserDashboardConfig>
  ): Promise<void> {
    try {
      const current = await this.loadUserConfig(userId) || this.getDefaultConfig(userId);
      
      const updated: UserDashboardConfig = {
        ...current,
        ...updates,
        lastUpdated: Timestamp.now()
      };

      await setDoc(doc(db, 'dashboard_configs', userId), updated);

      logger.info('Configuração atualizada', { userId, updates });

    } catch (error) {
      logger.error('Erro ao atualizar configuração', error);
      throw error;
    }
  }

  /**
   * Adiciona widget personalizado
   */
  static async addCustomWidget(
    userId: string,
    widget: Omit<DashboardWidget, 'id'>
  ): Promise<string> {
    try {
      const widgetId = `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newWidget: DashboardWidget = {
        ...widget,
        id: widgetId
      };

      const config = await this.loadUserConfig(userId);
      if (config) {
        config.layout.push(newWidget);
        await this.updateDashboardConfig(userId, { layout: config.layout });
      }

      logger.info('Widget adicionado', { userId, widgetId });
      return widgetId;

    } catch (error) {
      logger.error('Erro ao adicionar widget', error);
      throw error;
    }
  }

  /**
   * Remove widget do dashboard
   */
  static async removeWidget(userId: string, widgetId: string): Promise<void> {
    try {
      const config = await this.loadUserConfig(userId);
      if (config) {
        config.layout = config.layout.filter(w => w.id !== widgetId);
        await this.updateDashboardConfig(userId, { layout: config.layout });
      }

      logger.info('Widget removido', { userId, widgetId });

    } catch (error) {
      logger.error('Erro ao remover widget', error);
      throw error;
    }
  }

  /**
   * Registra callback para atualizações
   */
  static onMetricsUpdate(callback: (metrics: DashboardMetric[]) => void): () => void {
    this.updateCallbacks.add(callback);
    
    // Retornar função de cleanup
    return () => {
      this.updateCallbacks.delete(callback);
    };
  }

  /**
   * Coleta métricas atuais
   */
  private static async collectCurrentMetrics(userId: string): Promise<DashboardMetric[]> {
    const metrics: DashboardMetric[] = [];

    // Taxa de conversão
    const conversionRate = await this.calculateConversionRate(userId);
    metrics.push({
      id: 'conversion_rate',
      name: 'Taxa de Conversão',
      value: conversionRate,
      trend: 'stable',
      category: 'performance',
      priority: 'high',
      lastUpdated: new Date()
    });

    // Tempo médio de geração
    const avgGenerationTime = await this.calculateAvgGenerationTime(userId);
    metrics.push({
      id: 'avg_generation_time',
      name: 'Tempo Médio de Geração',
      value: avgGenerationTime,
      trend: 'stable',
      category: 'performance',
      priority: 'medium',
      lastUpdated: new Date()
    });

    // Satisfação do usuário
    const satisfaction = await this.calculateUserSatisfaction(userId);
    metrics.push({
      id: 'user_satisfaction',
      name: 'Satisfação do Usuário',
      value: satisfaction,
      trend: 'stable',
      category: 'quality',
      priority: 'high',
      lastUpdated: new Date()
    });

    // Engajamento diário
    const engagement = await this.calculateDailyEngagement(userId);
    metrics.push({
      id: 'daily_engagement',
      name: 'Engajamento Diário',
      value: engagement,
      trend: 'stable',
      category: 'engagement',
      priority: 'medium',
      lastUpdated: new Date()
    });

    // Precisão da IA
    const aiAccuracy = await this.calculateAIAccuracy(userId);
    metrics.push({
      id: 'ai_accuracy',
      name: 'Precisão da IA',
      value: aiAccuracy,
      trend: 'stable',
      category: 'quality',
      priority: 'high',
      lastUpdated: new Date()
    });

    // Uso de recursos
    const resourceUsage = await this.calculateResourceUsage(userId);
    metrics.push({
      id: 'resource_usage',
      name: 'Uso de Recursos',
      value: resourceUsage,
      trend: 'stable',
      category: 'usage',
      priority: 'low',
      lastUpdated: new Date()
    });

    return metrics;
  }

  /**
   * Calcula tendência da métrica
   */
  private static calculateTrend(metric: DashboardMetric): DashboardMetric {
    const previous = this.metricsCache.get(metric.id);
    
    if (!previous) {
      return metric;
    }

    const change = metric.value - previous.value;
    const changePercent = (change / previous.value) * 100;

    return {
      ...metric,
      previousValue: previous.value,
      trend: change > 0.01 ? 'up' : change < -0.01 ? 'down' : 'stable',
      changePercent: Math.round(changePercent * 10) / 10
    };
  }

  /**
   * Analisa performance
   */
  private static async analyzePerformance(
    metrics: DashboardMetric[]
  ): Promise<DashboardInsight[]> {
    const insights: DashboardInsight[] = [];

    // Verificar taxa de conversão
    const conversionRate = metrics.find(m => m.id === 'conversion_rate');
    if (conversionRate && conversionRate.value < 0.3) {
      insights.push({
        id: `insight_conversion_${Date.now()}`,
        type: 'warning',
        title: 'Taxa de Conversão Baixa',
        description: 'A taxa de conversão está abaixo do esperado. Considere revisar o fluxo de usuário.',
        actionable: true,
        action: {
          label: 'Ver Análise Detalhada',
          handler: 'openConversionAnalysis'
        },
        confidence: 0.85,
        impact: 'high',
        timestamp: new Date()
      });
    }

    // Verificar tempo de geração
    const genTime = metrics.find(m => m.id === 'avg_generation_time');
    if (genTime && genTime.value > 5000) {
      insights.push({
        id: `insight_gentime_${Date.now()}`,
        type: 'recommendation',
        title: 'Otimizar Tempo de Resposta',
        description: 'O tempo médio de geração está alto. Considere usar cache ou otimizar prompts.',
        actionable: true,
        action: {
          label: 'Ver Sugestões',
          handler: 'openOptimizationTips'
        },
        confidence: 0.9,
        impact: 'medium',
        timestamp: new Date()
      });
    }

    return insights;
  }

  /**
   * Prevê tendências
   */
  private static async predictTrends(
    userId: string,
    metrics: DashboardMetric[]
  ): Promise<DashboardInsight[]> {
    const insights: DashboardInsight[] = [];

    // Usar PredictiveUX para prever comportamento
    const predictions = await PredictiveUXService.getSmartSuggestions(
      userId,
      'dashboard',
      3
    );

    if (predictions.length > 0 && predictions[0].confidence > 0.7) {
      insights.push({
        id: `insight_predict_${Date.now()}`,
        type: 'prediction',
        title: 'Padrão de Uso Detectado',
        description: `Baseado no seu comportamento, você provavelmente irá ${predictions[0].action}`,
        actionable: false,
        confidence: predictions[0].confidence,
        impact: 'low',
        timestamp: new Date()
      });
    }

    return insights;
  }

  /**
   * Gera recomendações personalizadas
   */
  private static async generateRecommendations(
    userId: string,
    metrics: DashboardMetric[]
  ): Promise<DashboardInsight[]> {
    const insights: DashboardInsight[] = [];

    // Verificar satisfação do usuário
    const satisfaction = metrics.find(m => m.id === 'user_satisfaction');
    if (satisfaction && satisfaction.value > 0.8) {
      insights.push({
        id: `insight_achievement_${Date.now()}`,
        type: 'achievement',
        title: 'Excelente Satisfação!',
        description: 'Seus usuários estão muito satisfeitos. Continue o ótimo trabalho!',
        actionable: false,
        confidence: 0.95,
        impact: 'high',
        timestamp: new Date()
      });
    }

    // Sugerir melhorias baseadas em uso
    const engagement = metrics.find(m => m.id === 'daily_engagement');
    if (engagement && engagement.trend === 'down') {
      insights.push({
        id: `insight_engagement_${Date.now()}`,
        type: 'recommendation',
        title: 'Aumentar Engajamento',
        description: 'O engajamento está caindo. Experimente adicionar novos templates ou funcionalidades.',
        actionable: true,
        action: {
          label: 'Explorar Novidades',
          handler: 'openFeatureExplorer'
        },
        confidence: 0.8,
        impact: 'medium',
        timestamp: new Date()
      });
    }

    return insights;
  }

  /**
   * Verifica alertas personalizados
   */
  private static async checkAlerts(
    userId: string,
    metrics: DashboardMetric[]
  ): Promise<DashboardInsight[]> {
    const insights: DashboardInsight[] = [];
    const config = await this.loadUserConfig(userId);

    if (!config?.customAlerts) return insights;

    config.customAlerts.forEach(alert => {
      if (!alert.enabled) return;

      const metric = metrics.find(m => m.id === alert.metric);
      if (!metric) return;

      let triggered = false;
      switch (alert.condition) {
        case 'above':
          triggered = metric.value > alert.threshold;
          break;
        case 'below':
          triggered = metric.value < alert.threshold;
          break;
        case 'equals':
          triggered = Math.abs(metric.value - alert.threshold) < 0.01;
          break;
      }

      if (triggered) {
        insights.push({
          id: `alert_${alert.metric}_${Date.now()}`,
          type: 'warning',
          title: `Alerta: ${metric.name}`,
          description: `${metric.name} está ${alert.condition} ${alert.threshold}`,
          actionable: true,
          action: {
            label: 'Ver Detalhes',
            handler: 'openMetricDetails',
            params: { metricId: metric.id }
          },
          confidence: 1.0,
          impact: 'high',
          timestamp: new Date()
        });
      }
    });

    return insights;
  }

  /**
   * Calcula métricas específicas
   */
  private static async calculateConversionRate(userId: string): Promise<number> {
    // Simulação - em produção, buscar dados reais
    return Math.random() * 0.5 + 0.3; // 30-80%
  }

  private static async calculateAvgGenerationTime(userId: string): Promise<number> {
    // Simulação - em produção, buscar dados reais
    return Math.random() * 3000 + 2000; // 2-5 segundos
  }

  private static async calculateUserSatisfaction(userId: string): Promise<number> {
    // Simulação - em produção, buscar dados reais
    return Math.random() * 0.3 + 0.7; // 70-100%
  }

  private static async calculateDailyEngagement(userId: string): Promise<number> {
    // Simulação - em produção, buscar dados reais
    return Math.random() * 50 + 10; // 10-60 ações
  }

  private static async calculateAIAccuracy(userId: string): Promise<number> {
    // Simulação - em produção, buscar dados reais
    return Math.random() * 0.15 + 0.85; // 85-100%
  }

  private static async calculateResourceUsage(userId: string): Promise<number> {
    // Simulação - em produção, buscar dados reais
    return Math.random() * 60 + 20; // 20-80%
  }

  /**
   * Configurações e layouts
   */
  private static async loadUserConfig(userId: string): Promise<UserDashboardConfig | null> {
    try {
      const configDoc = await getDoc(doc(db, 'dashboard_configs', userId));
      return configDoc.exists() ? configDoc.data() as UserDashboardConfig : null;
    } catch (error) {
      logger.error('Erro ao carregar config', error);
      return null;
    }
  }

  private static getDefaultConfig(userId: string): UserDashboardConfig {
    return {
      userId,
      layout: this.getDefaultLayout(),
      theme: 'auto',
      refreshRate: 30000, // 30 segundos
      favoriteMetrics: ['conversion_rate', 'user_satisfaction'],
      customAlerts: [],
      lastUpdated: Timestamp.now()
    };
  }

  private static getDefaultLayout(): DashboardWidget[] {
    return [
      {
        id: 'widget_metrics_overview',
        type: 'metric',
        title: 'Visão Geral',
        position: { x: 0, y: 0, w: 12, h: 2 },
        config: { 
          metrics: ['conversion_rate', 'avg_generation_time', 'user_satisfaction'] 
        },
        dataSource: 'realtimeMetrics'
      },
      {
        id: 'widget_performance_chart',
        type: 'chart',
        title: 'Performance ao Longo do Tempo',
        position: { x: 0, y: 2, w: 8, h: 4 },
        config: { 
          chartType: 'line',
          metrics: ['conversion_rate', 'avg_generation_time'],
          timeRange: '7d'
        },
        refreshInterval: 60000,
        dataSource: 'historicalMetrics'
      },
      {
        id: 'widget_insights',
        type: 'list',
        title: 'Insights e Recomendações',
        position: { x: 8, y: 2, w: 4, h: 4 },
        config: { 
          maxItems: 5,
          filterTypes: ['recommendation', 'warning']
        },
        refreshInterval: 120000,
        dataSource: 'insights'
      },
      {
        id: 'widget_engagement_heatmap',
        type: 'heatmap',
        title: 'Mapa de Engajamento',
        position: { x: 0, y: 6, w: 6, h: 3 },
        config: { 
          metric: 'daily_engagement',
          granularity: 'hourly'
        },
        dataSource: 'engagementData'
      },
      {
        id: 'widget_ai_timeline',
        type: 'timeline',
        title: 'Atividade da IA',
        position: { x: 6, y: 6, w: 6, h: 3 },
        config: { 
          events: ['generation', 'feedback', 'optimization'],
          limit: 20
        },
        refreshInterval: 30000,
        dataSource: 'aiActivity'
      }
    ];
  }

  /**
   * Atualizações em tempo real
   */
  private static setupRealtimeUpdates(userId: string): void {
    // Atualizar métricas periodicamente
    const interval = setInterval(async () => {
      const metrics = await this.getRealtimeMetrics(userId);
      
      // Notificar callbacks
      this.updateCallbacks.forEach(callback => {
        callback(metrics);
      });
    }, 30000); // 30 segundos

    // Armazenar para cleanup
    const unsubscribe = () => clearInterval(interval);
    this.subscriptions.set(`metrics_${userId}`, unsubscribe);
  }

  /**
   * Inicia coleta de métricas
   */
  private static async startMetricsCollection(userId: string): Promise<void> {
    // Coletar métricas iniciais
    const metrics = await this.getRealtimeMetrics(userId);
    
    // Gerar insights iniciais
    const insights = await this.generateInsights(userId, metrics);
    
    logger.info('Coleta de métricas iniciada', {
      userId,
      metricsCount: metrics.length,
      insightsCount: insights.length
    });
  }

  /**
   * Gera insights iniciais
   */
  private static async generateInitialInsights(userId: string): Promise<void> {
    const welcomeInsight: DashboardInsight = {
      id: 'insight_welcome',
      type: 'achievement',
      title: 'Bem-vindo ao Intelligence Dashboard!',
      description: 'Seu dashboard está pronto. Explore as métricas e insights personalizados.',
      actionable: true,
      action: {
        label: 'Tour Guiado',
        handler: 'startDashboardTour'
      },
      confidence: 1.0,
      impact: 'low',
      timestamp: new Date()
    };

    this.insightsCache.set(welcomeInsight.id, welcomeInsight);
  }

  /**
   * Cleanup de recursos
   */
  static cleanup(userId?: string): void {
    if (userId) {
      const unsubscribe = this.subscriptions.get(`metrics_${userId}`);
      if (unsubscribe) {
        unsubscribe();
        this.subscriptions.delete(`metrics_${userId}`);
      }
    } else {
      // Limpar todos
      this.subscriptions.forEach(unsubscribe => unsubscribe());
      this.subscriptions.clear();
    }

    logger.info('Cleanup executado', { userId });
  }
} 