import React, { useState, useEffect, useCallback } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Target, 
  Zap, 
  Users, 
  Eye,
  Heart,
  Share2,
  Download,
  BarChart3,
  Activity,
  Award,
  Star,
  ChevronRight,
  RefreshCw, AlertCircle,
  Calendar,
  Filter
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ProgressRing, MultiProgressRing } from '../ui/ProgressRing';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { AdvancedAnalyticsService } from '../../services/advancedAnalyticsService';
import type { 
  ProductivityMetrics, 
  UserAnalytics, 
  PerformanceInsight,
  CollaborationMetrics,
  ContentQualityMetrics
} from '../../types';

interface DashboardStatsProps {
  userId: string;
  timeRange: '7d' | '30d' | '90d' | '1y';
  onTimeRangeChange: (range: '7d' | '30d' | '90d' | '1y') => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  userId,
  timeRange,
  onTimeRangeChange
}) => {
  // Estados
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [metrics, setMetrics] = useState<ProductivityMetrics | null>(null);
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [insights, setInsights] = useState<PerformanceInsight[]>([]);
  const [collaborationData, setCollaborationData] = useState<CollaborationMetrics | null>(null);
  const [qualityData, setQualityData] = useState<ContentQualityMetrics | null>(null);
  const [selectedView, setSelectedView] = useState<'overview' | 'detailed' | 'comparison'>('overview');
  const [animatedValues, setAnimatedValues] = useState<Record<string, number>>({});

  // Carregar dados iniciais
  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const [
        productivityData,
        analyticsData,
        insightsData,
        collaborationMetrics,
        qualityMetrics
      ] = await Promise.all([
        AdvancedAnalyticsService.getProductivityMetrics(userId, timeRange),
        AdvancedAnalyticsService.getUserAnalytics(userId),
        AdvancedAnalyticsService.generateInsights(userId, timeRange),
        AdvancedAnalyticsService.getCollaborationMetrics(userId, timeRange),
        AdvancedAnalyticsService.getContentQualityMetrics(userId, timeRange)
      ]);

      setMetrics(productivityData);
      setAnalytics(analyticsData);
      setInsights(insightsData);
      setCollaborationData(collaborationMetrics);
      setQualityData(qualityMetrics);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, timeRange]);

  useEffect(() => {
    loadDashboardData();
  }, [userId, timeRange, loadDashboardData]);

  // Animação de valores
  useEffect(() => {
    if (metrics) {
      const targets = {
        productivity: metrics.overallProductivity,
        efficiency: metrics.efficiencyScore,
        quality: qualityData?.overallQuality || 0,
        collaboration: collaborationData?.collaborationScore || 0
      };

      Object.entries(targets).forEach(([key, target]) => {
        let current = 0;
        const increment = target / 30; // Animação em 30 frames
        
        const animate = () => {
          current = Math.min(current + increment, target);
          setAnimatedValues(prev => ({ ...prev, [key]: current }));
          
          if (current < target) {
            requestAnimationFrame(animate);
          }
        };
        
        requestAnimationFrame(animate);
      });
    }
  }, [metrics, qualityData, collaborationData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboardData();
    setIsRefreshing(false);
  };

  const formatValue = (value: number, type: 'number' | 'percentage' | 'time' | 'score' = 'number') => {
    if (type === 'percentage') return `${Math.round(value)}%`;
    if (type === 'time') return `${Math.round(value)}min`;
    if (type === 'score') return `${value.toFixed(1)}/10`;
    return value.toLocaleString();
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Activity className="w-4 h-4 text-gray-500" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-600 dark:text-green-400';
    if (trend < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return { label: 'Excepcional', color: 'green', icon: Award };
    if (score >= 80) return { label: 'Excelente', color: 'blue', icon: Star };
    if (score >= 70) return { label: 'Bom', color: 'yellow', icon: Target };
    if (score >= 60) return { label: 'Regular', color: 'orange', icon: Activity };
    return { label: 'Precisa Melhorar', color: 'red', icon: TrendingDown };
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!metrics || !analytics) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Erro ao carregar dados do dashboard. Tente novamente.
        </p>
        <Button onClick={handleRefresh} className="mt-4">
          <RefreshCw className="w-4 h-4 mr-2" />
          Tentar Novamente
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com controles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard Analítico
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Insights em tempo real sobre sua produtividade
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Seletor de período */}
          <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
            {[
              { value: '7d', label: '7d' },
              { value: '30d', label: '30d' },
              { value: '90d', label: '90d' },
              { value: '1y', label: '1a' }
            ].map(period => (
              <button
                key={period.value}
                onClick={() => onTimeRangeChange(period.value as any)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  timeRange === period.value
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>

          {/* Seletor de visualização */}
          <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
            {[
              { value: 'overview', label: 'Visão Geral', icon: BarChart3 },
              { value: 'detailed', label: 'Detalhado', icon: Activity },
              { value: 'comparison', label: 'Comparação', icon: TrendingUp }
            ].map(view => (
              <button
                key={view.value}
                onClick={() => setSelectedView(view.value as any)}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  selectedView === view.value
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <view.icon className="w-3 h-3" />
                {view.label}
              </button>
            ))}
          </div>

          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Visão geral - Cards principais */}
      {selectedView === 'overview' && (
        <>
          {/* Cards de métricas principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Produtividade */}
            <Card className="p-6 relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Produtividade
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">
                        {formatValue(animatedValues.productivity || 0, 'percentage')}
                      </span>
                      {getTrendIcon(metrics.trends.productivity)}
                    </div>
                  </div>
                </div>
                <ProgressRing
                  value={animatedValues.productivity || 0}
                  size="sm"
                  color="blue"
                  gradient
                  showValue={false}
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className={getTrendColor(metrics.trends.productivity)}>
                  {metrics.trends.productivity > 0 ? '+' : ''}{metrics.trends.productivity.toFixed(1)}% vs período anterior
                </span>
                <Badge variant={metrics.overallProductivity >= 80 ? 'default' : 'secondary'}>
                  {getPerformanceLevel(metrics.overallProductivity).label}
                </Badge>
              </div>
            </Card>

            {/* Eficiência */}
            <Card className="p-6 relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Eficiência
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">
                        {formatValue(animatedValues.efficiency || 0, 'percentage')}
                      </span>
                      {getTrendIcon(metrics.trends.efficiency)}
                    </div>
                  </div>
                </div>
                <ProgressRing
                  value={animatedValues.efficiency || 0}
                  size="sm"
                  color="green"
                  gradient
                  showValue={false}
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className={getTrendColor(metrics.trends.efficiency)}>
                  {metrics.trends.efficiency > 0 ? '+' : ''}{metrics.trends.efficiency.toFixed(1)}% vs período anterior
                </span>
                <span className="text-gray-500">
                  {formatValue(metrics.averageTaskTime, 'time')} por tarefa
                </span>
              </div>
            </Card>

            {/* Qualidade */}
            <Card className="p-6 relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Star className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Qualidade
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">
                        {formatValue(animatedValues.quality || 0, 'percentage')}
                      </span>
                      {qualityData && getTrendIcon(qualityData.trends.overall)}
                    </div>
                  </div>
                </div>
                <ProgressRing
                  value={animatedValues.quality || 0}
                  size="sm"
                  color="purple"
                  gradient
                  showValue={false}
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className={qualityData ? getTrendColor(qualityData.trends.overall) : 'text-gray-500'}>
                  {qualityData ? `${qualityData.trends.overall > 0 ? '+' : ''}${qualityData.trends.overall.toFixed(1)}%` : 'N/A'} vs período anterior
                </span>
                <span className="text-gray-500">
                  Score: {qualityData ? qualityData.readabilityScore.toFixed(1) : 'N/A'}
                </span>
              </div>
            </Card>

            {/* Colaboração */}
            <Card className="p-6 relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <Users className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Colaboração
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">
                        {formatValue(animatedValues.collaboration || 0, 'percentage')}
                      </span>
                      {collaborationData && getTrendIcon(collaborationData.trends.overall)}
                    </div>
                  </div>
                </div>
                <ProgressRing
                  value={animatedValues.collaboration || 0}
                  size="sm"
                  color="yellow"
                  gradient
                  showValue={false}
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className={collaborationData ? getTrendColor(collaborationData.trends.overall) : 'text-gray-500'}>
                  {collaborationData ? `${collaborationData.trends.overall > 0 ? '+' : ''}${collaborationData.trends.overall.toFixed(1)}%` : 'N/A'} vs período anterior
                </span>
                <span className="text-gray-500">
                  {collaborationData?.activeSessions || 0} sessões ativas
                </span>
              </div>
            </Card>
          </div>

          {/* Análise multidimensional */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance geral */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Performance Geral</h3>
                <Button variant="ghost" size="sm">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center justify-center">
                <MultiProgressRing
                  size="lg"
                  rings={[
                    { value: metrics.overallProductivity, color: 'blue', label: 'Produtividade' },
                    { value: metrics.efficiencyScore, color: 'green', label: 'Eficiência' },
                    { value: qualityData?.overallQuality || 0, color: 'purple', label: 'Qualidade' },
                    { value: collaborationData?.collaborationScore || 0, color: 'yellow', label: 'Colaboração' }
                  ]}
                />
              </div>
            </Card>

            {/* Insights principais */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Insights Principais</h3>
                <Badge variant="default">{insights.length} insights</Badge>
              </div>

              <div className="space-y-4">
                {insights.slice(0, 3).map((insight, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className={`p-1.5 rounded-lg ${
                      insight.type === 'improvement' ? 'bg-blue-100 dark:bg-blue-900' :
                      insight.type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900' :
                      insight.type === 'success' ? 'bg-green-100 dark:bg-green-900' :
                      'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      {insight.type === 'improvement' && <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                      {insight.type === 'warning' && <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />}
                      {insight.type === 'success' && <Award className="w-4 h-4 text-green-600 dark:text-green-400" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {insight.title}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {insight.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {insight.category}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          Impacto: {insight.impact}/10
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {insights.length > 3 && (
                  <Button variant="ghost" size="sm" className="w-full">
                    Ver todos os {insights.length} insights
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </Card>
          </div>

          {/* Métricas secundárias */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Tempo Total
                </span>
              </div>
              <p className="text-xl font-bold">
                {formatValue(metrics.totalActiveTime, 'time')}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Este período
              </p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Tarefas
                </span>
              </div>
              <p className="text-xl font-bold">
                {formatValue(metrics.tasksCompleted)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Concluídas
              </p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Revisões
                </span>
              </div>
              <p className="text-xl font-bold">
                {formatValue(metrics.revisionsCount)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                IA + Manual
              </p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Share2 className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Compartilhamentos
                </span>
              </div>
              <p className="text-xl font-bold">
                {collaborationData?.totalShares || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Este período
              </p>
            </Card>
          </div>
        </>
      )}

      {/* Outras visualizações podem ser implementadas aqui */}
      {selectedView === 'detailed' && (
        <Card className="p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">Visualização Detalhada</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Em desenvolvimento - análises aprofundadas chegando em breve!
          </p>
        </Card>
      )}

      {selectedView === 'comparison' && (
        <Card className="p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">Análise Comparativa</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Em desenvolvimento - comparações temporais e benchmarks chegando em breve!
          </p>
        </Card>
      )}
    </div>
  );
}; 