/**
 * 📊 IdeaAnalytics Component - Analytics Dashboard for Banco de Ideias
 * 
 * Displays comprehensive analytics including usage metrics, cost analysis,
 * personalization insights, and performance tracking.
 * 
 * Part of: WEEK 1 - Banco de Ideias Implementation
 * Integration: AnalyticsService + BudgetManagement + Personalization
 */

import React, { useState, useEffect } from 'react';
import { getApplication } from '../../architecture/ServiceArchitecture';
import { useBudgetManagement } from '../../hooks/useBudgetManagement';
import { usePersonalization } from '../../hooks/usePersonalization';

// Design System Components
import { Card } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { Select } from '../../design-system/components/form/Select';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface AnalyticsMetrics {
  ideas: {
    total: number;
    thisWeek: number;
    thisMonth: number;
    averagePerDay: number;
  };
  costs: {
    total: number;
    average: number;
    trend: 'up' | 'down' | 'stable';
    efficiency: number;
  };
  engagement: {
    likesRate: number;
    savesRate: number;
    implementationRate: number;
    averageRating: number;
  };
  categories: {
    name: string;
    count: number;
    averageCost: number;
    successRate: number;
  }[];
  performance: {
    averageGenerationTime: number;
    successRate: number;
    errorRate: number;
  };
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
  }[];
}

// ============================================================================
// PROPS INTERFACE
// ============================================================================

interface IdeaAnalyticsProps {
  userId: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const IdeaAnalytics: React.FC<IdeaAnalyticsProps> = ({ userId }) => {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [timeRange, setTimeRange] = useState('30days');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Integration with other hooks
  const { costSummary, usageMetrics } = useBudgetManagement(userId);
  const { insights } = usePersonalization(userId);
  
  // Get services
  const getServices = () => {
    const app = getApplication();
    return {
      analyticsService: app.getService('AnalyticsService')
    };
  };
  
  // Load analytics data
  const loadAnalytics = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { analyticsService } = getServices();
      
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case '7days':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30days':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90days':
          startDate.setDate(endDate.getDate() - 90);
          break;
      }
      
      // Query analytics data
      const results = await analyticsService.query({
        timeRange: { start: startDate, end: endDate, granularity: 'day' },
        filters: { userId: [userId], category: ['idea_generation'] },
        aggregations: [
          { field: 'value', operation: 'sum' },
          { field: 'cost', operation: 'sum' },
          { field: 'cost', operation: 'avg' },
          { field: 'processingTime', operation: 'avg' },
          { field: 'rating', operation: 'avg' }
        ]
      });
      
      if (results.success) {
        // Transform data into metrics format
        const metricsData: AnalyticsMetrics = {
          ideas: {
            total: results.aggregations.totalIdeas || 0,
            thisWeek: results.aggregations.weeklyIdeas || 0,
            thisMonth: results.aggregations.monthlyIdeas || 0,
            averagePerDay: results.aggregations.avgDailyIdeas || 0
          },
          costs: {
            total: results.aggregations.totalCost || 0,
            average: results.aggregations.avgCost || 0,
            trend: calculateTrend(results.aggregations.costTrend),
            efficiency: calculateEfficiency(results.aggregations)
          },
          engagement: {
            likesRate: results.aggregations.likesRate || 0,
            savesRate: results.aggregations.savesRate || 0,
            implementationRate: results.aggregations.implementationRate || 0,
            averageRating: results.aggregations.avgRating || 0
          },
          categories: results.aggregations.categories || [],
          performance: {
            averageGenerationTime: results.aggregations.avgProcessingTime || 0,
            successRate: results.aggregations.successRate || 0,
            errorRate: results.aggregations.errorRate || 0
          }
        };
        
        setMetrics(metricsData);
      } else {
        setError('Erro ao carregar dados de analytics.');
      }
      
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar analytics.');
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate trend direction
  const calculateTrend = (trendData: any): 'up' | 'down' | 'stable' => {
    if (!trendData || trendData.length < 2) return 'stable';
    
    const recent = trendData.slice(-7).reduce((a: number, b: number) => a + b, 0);
    const previous = trendData.slice(-14, -7).reduce((a: number, b: number) => a + b, 0);
    
    if (recent > previous * 1.1) return 'up';
    if (recent < previous * 0.9) return 'down';
    return 'stable';
  };
  
  // Calculate cost efficiency
  const calculateEfficiency = (aggregations: any): number => {
    const avgCost = aggregations.avgCost || 0;
    const implementationRate = aggregations.implementationRate || 0;
    
    if (avgCost === 0) return 100;
    
    // Efficiency = Implementation Rate / Cost (normalized to 0-100)
    return Math.min(100, Math.round((implementationRate / avgCost) * 10));
  };
  
  // Format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4
    }).format(value);
  };
  
  // Format percentage
  const formatPercentage = (value: number): string => {
    return `${Math.round(value * 100)}%`;
  };
  
  // Time range options
  const timeRangeOptions = [
    { value: '7days', label: 'Últimos 7 dias' },
    { value: '30days', label: 'Últimos 30 dias' },
    { value: '90days', label: 'Últimos 90 dias' }
  ];
  
  // Load data on mount and time range change
  useEffect(() => {
    loadAnalytics();
  }, [userId, timeRange]);
  
  // ============================================================================
  // RENDER METHODS
  // ============================================================================
  
  const renderOverviewCards = () => {
    if (!metrics) return null;
    
    return (
      <div className="analytics-overview-grid">
        <Card variant="elevated" className="metric-card">
          <div className="metric-header">
            <h3>Total de Ideias</h3>
            <span className="metric-icon">🧠</span>
          </div>
          <div className="metric-value">{metrics.ideas.total}</div>
          <div className="metric-subtext">
            {metrics.ideas.averagePerDay.toFixed(1)} por dia
          </div>
        </Card>
        
        <Card variant="elevated" className="metric-card">
          <div className="metric-header">
            <h3>Custo Total</h3>
            <span className="metric-icon">💰</span>
          </div>
          <div className="metric-value">{formatCurrency(metrics.costs.total)}</div>
          <div className={`metric-subtext trend-${metrics.costs.trend}`}>
            {metrics.costs.trend === 'up' ? '↗️' : 
             metrics.costs.trend === 'down' ? '↘️' : '➡️'} 
            {formatCurrency(metrics.costs.average)} média
          </div>
        </Card>
        
        <Card variant="elevated" className="metric-card">
          <div className="metric-header">
            <h3>Taxa de Implementação</h3>
            <span className="metric-icon">🚀</span>
          </div>
          <div className="metric-value">
            {formatPercentage(metrics.engagement.implementationRate)}
          </div>
          <div className="metric-subtext">
            Eficiência: {metrics.costs.efficiency}%
          </div>
        </Card>
        
        <Card variant="elevated" className="metric-card">
          <div className="metric-header">
            <h3>Avaliação Média</h3>
            <span className="metric-icon">⭐</span>
          </div>
          <div className="metric-value">
            {metrics.engagement.averageRating.toFixed(1)}/5
          </div>
          <div className="metric-subtext">
            {formatPercentage(metrics.engagement.likesRate)} de likes
          </div>
        </Card>
      </div>
    );
  };
  
  const renderCategoryBreakdown = () => {
    if (!metrics?.categories.length) return null;
    
    return (
      <Card variant="elevated" className="category-breakdown">
        <div className="card-header">
          <h3>Breakdown por Categoria</h3>
        </div>
        
        <div className="category-list">
          {metrics.categories.map((category, index) => (
            <div key={index} className="category-item">
              <div className="category-info">
                <h4>{category.name}</h4>
                <span className="category-count">{category.count} ideias</span>
              </div>
              
              <div className="category-metrics">
                <div className="metric">
                  <span>Custo médio:</span>
                  <span>{formatCurrency(category.averageCost)}</span>
                </div>
                <div className="metric">
                  <span>Taxa de sucesso:</span>
                  <span>{formatPercentage(category.successRate)}</span>
                </div>
              </div>
              
              <div className="category-progress">
                <div 
                  className="progress-bar"
                  style={{ width: `${category.successRate * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  };
  
  const renderPersonalizationInsights = () => {
    if (!insights) return null;
    
    return (
      <Card variant="elevated" className="personalization-insights">
        <div className="card-header">
          <h3>Insights de Personalização</h3>
          <span className="learning-stage">
            {insights.progress.learningStage === 'optimized' ? '🎯 Otimizada' :
             insights.progress.learningStage === 'learning' ? '📚 Aprendendo' : '🔰 Inicial'}
          </span>
        </div>
        
        <div className="insights-grid">
          <div className="insight-item">
            <h4>Precisão da IA</h4>
            <div className="insight-value">{Math.round(insights.progress.accuracy * 100)}%</div>
            <div className="insight-progress">
              <div 
                className="progress-bar" 
                style={{ width: `${insights.progress.accuracy * 100}%` }}
              />
            </div>
          </div>
          
          <div className="insight-item">
            <h4>Dados Coletados</h4>
            <div className="insight-value">{insights.progress.dataPoints}</div>
            <div className="insight-subtext">pontos de dados</div>
          </div>
          
          <div className="insight-item">
            <h4>Completude do Perfil</h4>
            <div className="insight-value">{Math.round(insights.progress.completeness * 100)}%</div>
            <div className="insight-progress">
              <div 
                className="progress-bar" 
                style={{ width: `${insights.progress.completeness * 100}%` }}
              />
            </div>
          </div>
        </div>
        
        <div className="recommendations-section">
          <h4>Próximas Sugestões</h4>
          <ul className="recommendations-list">
            {insights.recommendations.nextSuggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </div>
      </Card>
    );
  };
  
  const renderPerformanceMetrics = () => {
    if (!metrics?.performance) return null;
    
    return (
      <Card variant="elevated" className="performance-metrics">
        <div className="card-header">
          <h3>Performance do Sistema</h3>
        </div>
        
        <div className="performance-grid">
          <div className="performance-item">
            <h4>Tempo de Geração</h4>
            <div className="performance-value">
              {(metrics.performance.averageGenerationTime / 1000).toFixed(1)}s
            </div>
            <div className="performance-status good">Ótimo</div>
          </div>
          
          <div className="performance-item">
            <h4>Taxa de Sucesso</h4>
            <div className="performance-value">
              {formatPercentage(metrics.performance.successRate)}
            </div>
            <div className={`performance-status ${
              metrics.performance.successRate > 0.95 ? 'excellent' :
              metrics.performance.successRate > 0.90 ? 'good' : 'average'
            }`}>
              {metrics.performance.successRate > 0.95 ? 'Excelente' :
               metrics.performance.successRate > 0.90 ? 'Bom' : 'Regular'}
            </div>
          </div>
          
          <div className="performance-item">
            <h4>Taxa de Erro</h4>
            <div className="performance-value">
              {formatPercentage(metrics.performance.errorRate)}
            </div>
            <div className={`performance-status ${
              metrics.performance.errorRate < 0.05 ? 'excellent' :
              metrics.performance.errorRate < 0.10 ? 'good' : 'poor'
            }`}>
              {metrics.performance.errorRate < 0.05 ? 'Excelente' :
               metrics.performance.errorRate < 0.10 ? 'Bom' : 'Precisa melhorar'}
            </div>
          </div>
        </div>
      </Card>
    );
  };
  
  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  
  if (loading) {
    return (
      <div className="analytics-loading">
        <Card variant="outlined">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <p>Carregando analytics...</p>
          </div>
        </Card>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="analytics-error">
        <Card variant="outlined" className="error-card">
          <h3>Erro ao carregar analytics</h3>
          <p>{error}</p>
          <Button variant="primary" onClick={loadAnalytics}>
            Tentar Novamente
          </Button>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="idea-analytics">
      {/* Controls */}
      <div className="analytics-controls">
        <Select
          label="Período"
          value={timeRange}
          onValueChange={setTimeRange}
          options={timeRangeOptions}
          className="time-range-select"
        />
        
        <Button
          variant="ghost"
          onClick={loadAnalytics}
          startIcon="🔄"
        >
          Atualizar
        </Button>
      </div>
      
      {/* Overview Cards */}
      {renderOverviewCards()}
      
      {/* Detailed Analytics */}
      <div className="analytics-details">
        <div className="analytics-left">
          {renderCategoryBreakdown()}
          {renderPersonalizationInsights()}
        </div>
        
        <div className="analytics-right">
          {renderPerformanceMetrics()}
          
          {/* Budget Integration */}
          {costSummary && (
            <Card variant="elevated" className="budget-integration">
              <h3>Resumo de Custos</h3>
              <div className="budget-summary">
                <p>Gasto hoje: {formatCurrency(costSummary.dailyCost)}</p>
                <p>Tier atual: {costSummary.tierInfo.currentTier}</p>
                <p>Status: {costSummary.budgetStatus.status}</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default IdeaAnalytics; 