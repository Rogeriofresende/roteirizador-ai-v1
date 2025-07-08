/**
 * V6.2 Intelligence Dashboard - Admin Component
 * Dashboard inteligente com métricas em tempo real e insights de IA
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Users, 
  Zap, 
  Brain,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  LineChart,
  RefreshCw,
  Settings,
  Download,
  ChevronRight,
  Info
} from 'lucide-react';
import { useIntelligenceDashboard } from '../../hooks/useIntelligenceDashboard';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Alert, AlertDescription, AlertTitle } from '../ui/Alert';
import { cn } from '../../lib/utils';

interface IntelligenceDashboardProps {
  className?: string;
  refreshInterval?: number;
  onExportData?: (data: any) => void;
}

export const IntelligenceDashboard: React.FC<IntelligenceDashboardProps> = ({
  className,
  refreshInterval = 30000, // 30 segundos
  onExportData
}) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [showSettings, setShowSettings] = useState(false);
  
  const {
    isInitialized,
    isLoading,
    error,
    lastUpdate,
    metrics,
    insights,
    layout,
    refreshMetrics,
    getSummaryStats,
    hasCriticalInsights,
    conversionRate,
    userSatisfaction,
    avgGenerationTime,
    isHealthy
  } = useIntelligenceDashboard({
    autoInitialize: true,
    refreshInterval,
    onInsightReceived: (insight) => {
      // Notificar sobre insights críticos
      if (insight.impact === 'high') {
        console.log('🚨 Insight crítico:', insight.message);
      }
    }
  });

  const summaryStats = useMemo(() => getSummaryStats(), [getSummaryStats]);

  // Formatar tempo de atualização
  const formatLastUpdate = () => {
    if (!lastUpdate) return 'Nunca';
    const diff = Date.now() - lastUpdate.getTime();
    if (diff < 60000) return 'Agora mesmo';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}min atrás`;
    return lastUpdate.toLocaleTimeString();
  };

  // Exportar dados
  const handleExportData = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      timeRange: selectedTimeRange,
      metrics,
      insights,
      summary: summaryStats
    };
    
    if (onExportData) {
      onExportData(exportData);
    } else {
      // Download como JSON
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `intelligence-dashboard-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  if (!isInitialized) {
    return (
      <div className={cn("flex items-center justify-center h-96", className)}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="w-full h-full border-4 border-gray-200 border-t-primary rounded-full animate-spin" />
            <Brain className="absolute inset-0 m-auto h-6 w-6 text-primary" />
          </div>
          <p className="text-muted-foreground">Inicializando Intelligence Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            Intelligence Dashboard
          </h2>
          <p className="text-muted-foreground mt-1">
            Métricas em tempo real e insights de IA
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant={isHealthy ? "success" : "destructive"}>
            {isHealthy ? '✅ Sistema Saudável' : '⚠️ Atenção Necessária'}
          </Badge>
          
          <Button
            variant="outline"
            size="sm"
            onClick={refreshMetrics}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Atualizar
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex items-center gap-2">
        {(['1h', '24h', '7d', '30d'] as const).map(range => (
          <Button
            key={range}
            variant={selectedTimeRange === range ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTimeRange(range)}
          >
            {range === '1h' ? 'Última Hora' : 
             range === '24h' ? 'Últimas 24h' :
             range === '7d' ? 'Últimos 7 dias' : 'Últimos 30 dias'}
          </Button>
        ))}
        
        <div className="ml-auto text-sm text-muted-foreground">
          Atualizado: {formatLastUpdate()}
        </div>
      </div>

      {/* Critical Insights Alert */}
      {hasCriticalInsights && (
        <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertTitle>Insights Críticos Detectados</AlertTitle>
          <AlertDescription>
            {insights.filter(i => i.impact === 'high').length} insights requerem atenção imediata.
            Verifique a aba de Insights abaixo.
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
                <p className="text-3xl font-bold">{conversionRate ? `${(conversionRate * 100).toFixed(1)}%` : 'N/A'}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </div>
            <Progress value={conversionRate ? conversionRate * 100 : 0} className="mt-4" />
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Satisfação do Usuário</p>
                <p className="text-3xl font-bold">{userSatisfaction ? userSatisfaction.toFixed(1) : 'N/A'}/5</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <div
                  key={star}
                  className={cn(
                    "h-2 flex-1 rounded-full transition-colors",
                    star <= (userSatisfaction || 0) ? "bg-yellow-400" : "bg-gray-200"
                  )}
                />
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tempo Médio Geração</p>
                <p className="text-3xl font-bold">{avgGenerationTime ? `${avgGenerationTime.toFixed(1)}s` : 'N/A'}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 text-xs text-muted-foreground">
              Meta: &lt; 10s
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Métricas Ativas</p>
                <p className="text-3xl font-bold">{summaryStats.totalMetrics}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                {summaryStats.improving}
              </span>
              <span className="flex items-center gap-1">
                <TrendingDown className="h-3 w-3 text-red-500" />
                {summaryStats.declining}
              </span>
              <span className="flex items-center gap-1">
                <Activity className="h-3 w-3 text-gray-500" />
                {summaryStats.stable}
              </span>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="metrics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Métricas
          </TabsTrigger>
          <TabsTrigger value="insights">
            <Brain className="h-4 w-4 mr-2" />
            Insights ({insights.length})
          </TabsTrigger>
          <TabsTrigger value="performance">
            <Zap className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
        </TabsList>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{metric.label}</h4>
                      <p className="text-sm text-muted-foreground">
                        {metric.category}
                      </p>
                    </div>
                    <Badge 
                      variant={
                        metric.trend === 'up' ? 'success' : 
                        metric.trend === 'down' ? 'destructive' : 
                        'secondary'
                      }
                    >
                      {metric.trend === 'up' ? '↑' : 
                       metric.trend === 'down' ? '↓' : '→'}
                      {metric.changePercent ? ` ${Math.abs(metric.changePercent)}%` : ''}
                    </Badge>
                  </div>
                  
                  <div className="flex items-end justify-between">
                    <div className="text-2xl font-bold">
                      {typeof metric.value === 'number' 
                        ? metric.value.toFixed(metric.format === 'percentage' ? 1 : 0)
                        : metric.value
                      }
                      {metric.unit}
                    </div>
                    
                    {metric.sparkline && (
                      <div className="h-12 w-24">
                        {/* Mini gráfico aqui */}
                        <div className="h-full flex items-end gap-0.5">
                          {metric.sparkline.map((value, i) => (
                            <div
                              key={i}
                              className="flex-1 bg-primary/30 rounded-t"
                              style={{ height: `${(value / Math.max(...metric.sparkline)) * 100}%` }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          {insights.length === 0 ? (
            <Card className="p-12 text-center">
              <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">Nenhum insight disponível</p>
              <p className="text-muted-foreground">
                Os insights serão gerados à medida que mais dados forem coletados
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {insights.map((insight, index) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={cn(
                    "p-4 border-l-4",
                    insight.impact === 'high' ? 'border-l-red-500' :
                    insight.impact === 'medium' ? 'border-l-yellow-500' :
                    'border-l-blue-500'
                  )}>
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0",
                        insight.type === 'improvement' ? 'bg-green-100 dark:bg-green-900/20' :
                        insight.type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                        insight.type === 'anomaly' ? 'bg-red-100 dark:bg-red-900/20' :
                        'bg-blue-100 dark:bg-blue-900/20'
                      )}>
                        {insight.type === 'improvement' ? <TrendingUp className="h-4 w-4 text-green-600" /> :
                         insight.type === 'warning' ? <AlertCircle className="h-4 w-4 text-yellow-600" /> :
                         insight.type === 'anomaly' ? <Activity className="h-4 w-4 text-red-600" /> :
                         <Info className="h-4 w-4 text-blue-600" />}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="font-medium">{insight.title}</h4>
                          <Badge 
                            variant={
                              insight.impact === 'high' ? 'destructive' :
                              insight.impact === 'medium' ? 'warning' :
                              'secondary'
                            }
                            className="ml-2"
                          >
                            {insight.impact}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          {insight.message}
                        </p>
                        
                        {insight.metrics && insight.metrics.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-2">
                            {insight.metrics.map(metricId => {
                              const metric = metrics.find(m => m.id === metricId);
                              return metric ? (
                                <Badge key={metricId} variant="outline" className="text-xs">
                                  {metric.label}
                                </Badge>
                              ) : null;
                            })}
                          </div>
                        )}
                        
                        {insight.actionable && insight.action && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-2"
                            onClick={() => {
                              // Executar ação do insight
                              console.log('Executando ação:', insight.action);
                            }}
                          >
                            {insight.action.label}
                            <ChevronRight className="h-3 w-3 ml-1" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                Taxa de Sucesso
              </h3>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                {/* Gráfico de linha aqui */}
                <p>Gráfico de taxa de sucesso</p>
              </div>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Distribuição de Uso
              </h3>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                {/* Gráfico de pizza aqui */}
                <p>Gráfico de distribuição</p>
              </div>
            </Card>
          </div>
          
          {/* Performance Summary */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Resumo de Performance</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Uptime do Sistema</span>
                <span className="font-mono">99.9%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Latência Média</span>
                <span className="font-mono">125ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Taxa de Erro</span>
                <span className="font-mono">0.1%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Requisições/min</span>
                <span className="font-mono">1,234</span>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Export Button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={handleExportData}
        >
          <Download className="h-4 w-4 mr-2" />
          Exportar Dados
        </Button>
      </div>
    </div>
  );
}; 