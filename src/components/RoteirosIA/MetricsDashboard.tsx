/**
 * 📊 METRICS DASHBOARD V9.0
 * 
 * Dashboard completo de métricas e analytics para o sistema Roteirar IA
 * Monitoramento de performance, uso e eficácia dos roteiros gerados
 * 
 * @methodology V9.0_NATURAL_LANGUAGE_FIRST
 * @specification ROIA-GR-001
 * @author IA Beta - Solution Architect + Frontend
 */

import React, { useState, useCallback, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  Target, 
  Zap,
  Brain,
  Award,
  AlertCircle,
  RefreshCw,
  Download,
  Calendar,
  Activity
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface MetricData {
  label: string;
  value: number | string;
  change?: number;
  trend: 'up' | 'down' | 'stable';
}

interface UsageMetrics {
  totalScripts: number;
  totalUsers: number;
  avgGenerationTime: number;
  successRate: number;
  popularGenres: Array<{ genre: string; count: number; percentage: number }>;
  dailyUsage: Array<{ date: string; scripts: number; users: number }>;
}

interface PerformanceMetrics {
  aiAccuracy: number;
  userSatisfaction: number;
  exportRate: number;
  avgWordCount: number;
  generationSpeed: number;
  errorRate: number;
}

interface MetricsDashboardProps {
  className?: string;
  realTime?: boolean;
}

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

const generateMockUsageMetrics = (): UsageMetrics => ({
  totalScripts: 2847,
  totalUsers: 1425,
  avgGenerationTime: 42.3,
  successRate: 97.8,
  popularGenres: [
    { genre: 'educational', count: 1284, percentage: 45.1 },
    { genre: 'comedy', count: 625, percentage: 22.0 },
    { genre: 'documentary', count: 398, percentage: 14.0 },
    { genre: 'action', count: 312, percentage: 11.0 },
    { genre: 'drama', count: 228, percentage: 8.0 }
  ],
  dailyUsage: Array.from({ length: 7 }, (_, i) => ({
    date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
    scripts: Math.floor(Math.random() * 100) + 50,
    users: Math.floor(Math.random() * 50) + 25
  }))
});

const generateMockPerformanceMetrics = (): PerformanceMetrics => ({
  aiAccuracy: 94.2,
  userSatisfaction: 4.7,
  exportRate: 78.5,
  avgWordCount: 847,
  generationSpeed: 2.1,
  errorRate: 2.3
});

// ============================================================================
// METRICS DASHBOARD COMPONENT
// ============================================================================

export const MetricsDashboard: React.FC<MetricsDashboardProps> = ({
  className = "",
  realTime = false
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [activeTab, setActiveTab] = useState<'overview' | 'usage' | 'performance' | 'ai'>('overview');
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d');
  const [usageMetrics, setUsageMetrics] = useState<UsageMetrics>(generateMockUsageMetrics());
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>(generateMockPerformanceMetrics());
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // ============================================================================
  // DATA REFRESH
  // ============================================================================
  
  const refreshMetrics = useCallback(async () => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setUsageMetrics(generateMockUsageMetrics());
    setPerformanceMetrics(generateMockPerformanceMetrics());
    setLastUpdated(new Date());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (realTime) {
      const interval = setInterval(refreshMetrics, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [realTime, refreshMetrics]);

  // ============================================================================
  // METRIC CARDS
  // ============================================================================
  
  const renderMetricCard = (
    title: string,
    value: string | number,
    change?: number,
    icon?: React.ReactNode,
    color: string = 'blue'
  ) => (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-1 text-sm ${
              change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-500'
            }`}>
              <TrendingUp className={`w-3 h-3 ${change < 0 ? 'rotate-180' : ''}`} />
              {Math.abs(change)}%
            </div>
          )}
        </div>
        {icon && (
          <div className={`p-3 rounded-lg bg-${color}-100`}>
            {React.cloneElement(icon as React.ReactElement, { 
              className: `w-6 h-6 text-${color}-600` 
            })}
          </div>
        )}
      </div>
    </Card>
  );

  // ============================================================================
  // TAB RENDERERS
  // ============================================================================
  
  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {renderMetricCard('Roteiros Gerados', usageMetrics.totalScripts.toLocaleString(), 12.5, <BarChart3 />, 'blue')}
        {renderMetricCard('Usuários Ativos', usageMetrics.totalUsers.toLocaleString(), 8.2, <Users />, 'green')}
        {renderMetricCard('Taxa de Sucesso', `${usageMetrics.successRate}%`, 2.1, <Target />, 'purple')}
        {renderMetricCard('Tempo Médio', `${usageMetrics.avgGenerationTime}s`, -5.3, <Clock />, 'orange')}
      </div>

      {/* Usage Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Uso por Gênero</h3>
          <div className="space-y-3">
            {usageMetrics.popularGenres.map((genre, index) => (
              <div key={genre.genre} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 capitalize">{genre.genre}</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full" 
                      style={{ width: `${genre.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-800 w-12 text-right">
                    {genre.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Atividade dos Últimos 7 Dias</h3>
          <div className="space-y-3">
            {usageMetrics.dailyUsage.map((day, index) => (
              <div key={day.date} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{day.date}</span>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <BarChart3 className="w-3 h-3 text-blue-500" />
                    <span className="text-sm text-gray-700">{day.scripts}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-green-500" />
                    <span className="text-sm text-gray-700">{day.users}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  const renderUsageTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {renderMetricCard('Scripts Hoje', '147', 15.2, <Activity />, 'blue')}
        {renderMetricCard('Usuários Únicos', '89', 12.8, <Users />, 'green')}
        {renderMetricCard('Pico de Uso', '14:30', undefined, <Clock />, 'purple')}
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Padrões de Uso</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Horários Mais Ativos</h4>
            <div className="space-y-2">
              {[
                { time: '09:00 - 12:00', percentage: 35 },
                { time: '14:00 - 17:00', percentage: 42 },
                { time: '19:00 - 22:00', percentage: 23 }
              ].map((period, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{period.time}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${period.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-800">{period.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-700 mb-3">Dispositivos Mais Usados</h4>
            <div className="space-y-2">
              {[
                { device: 'Desktop', percentage: 68 },
                { device: 'Mobile', percentage: 25 },
                { device: 'Tablet', percentage: 7 }
              ].map((device, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{device.device}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${device.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-800">{device.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderPerformanceTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {renderMetricCard('Satisfação', `${performanceMetrics.userSatisfaction}/5`, 0.3, <Award />, 'green')}
        {renderMetricCard('Taxa de Export', `${performanceMetrics.exportRate}%`, 5.7, <Download />, 'blue')}
        {renderMetricCard('Taxa de Erro', `${performanceMetrics.errorRate}%`, -1.2, <AlertCircle />, 'red')}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance do Sistema</h3>
          <div className="space-y-4">
            {[
              { metric: 'Velocidade de Geração', value: `${performanceMetrics.generationSpeed}s`, target: '< 3s', status: 'good' },
              { metric: 'Disponibilidade', value: '99.8%', target: '> 99%', status: 'excellent' },
              { metric: 'Latência da API', value: '145ms', target: '< 200ms', status: 'good' },
              { metric: 'Uso de CPU', value: '62%', target: '< 80%', status: 'good' }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-800">{item.metric}</div>
                  <div className="text-xs text-gray-500">Target: {item.target}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{item.value}</span>
                  <div className={`w-2 h-2 rounded-full ${
                    item.status === 'excellent' ? 'bg-green-500' :
                    item.status === 'good' ? 'bg-blue-500' :
                    'bg-yellow-500'
                  }`}></div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Qualidade dos Roteiros</h3>
          <div className="space-y-4">
            {[
              { metric: 'Contagem Média de Palavras', value: performanceMetrics.avgWordCount },
              { metric: 'Estrutura Narrativa', value: '94%' },
              { metric: 'Coerência de Diálogos', value: '91%' },
              { metric: 'Originalidade', value: '88%' }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{item.metric}</span>
                <span className="text-sm font-medium text-gray-800">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  const renderAITab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {renderMetricCard('Precisão da IA', `${performanceMetrics.aiAccuracy}%`, 1.8, <Brain />, 'purple')}
        {renderMetricCard('Processamentos/min', '23.4', 8.5, <Zap />, 'yellow')}
        {renderMetricCard('Tokens Processados', '2.8M', 15.2, <Activity />, 'blue')}
        {renderMetricCard('Custo por Roteiro', 'R$ 0.12', -8.3, <Target />, 'green')}
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance da IA por Gênero</h3>
        <div className="space-y-3">
          {[
            { genre: 'Educational', accuracy: 96.2, avgTime: 38.5 },
            { genre: 'Comedy', accuracy: 92.1, avgTime: 45.2 },
            { genre: 'Documentary', accuracy: 94.8, avgTime: 52.1 },
            { genre: 'Action', accuracy: 91.5, avgTime: 41.8 },
            { genre: 'Drama', accuracy: 93.7, avgTime: 48.9 }
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-800">{item.genre}</span>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-800">{item.accuracy}%</div>
                  <div className="text-xs text-gray-500">Precisão</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-800">{item.avgTime}s</div>
                  <div className="text-xs text-gray-500">Tempo</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Otimizações Recentes</h3>
        <div className="space-y-3">
          {[
            { date: '2025-07-18', optimization: 'Redução de tokens em prompts de estrutura', impact: '+12% velocidade' },
            { date: '2025-07-15', optimization: 'Cache inteligente para personagens recorrentes', impact: '+8% eficiência' },
            { date: '2025-07-12', optimization: 'Otimização de parsing de respostas JSON', impact: '-15% erros' }
          ].map((item, index) => (
            <div key={index} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg">
              <Calendar className="w-4 h-4 text-gray-500 mt-1" />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-800">{item.optimization}</div>
                <div className="text-xs text-gray-500 mt-1">{item.date}</div>
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                {item.impact}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard de Métricas V9.0</h1>
            <p className="text-gray-600 mt-1">
              Analytics em tempo real do sistema Roteirar IA
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="24h">Últimas 24h</option>
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
              <option value="90d">Últimos 90 dias</option>
            </select>
            
            <Button
              onClick={refreshMetrics}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        
        <div className="mt-4 text-xs text-gray-500">
          Última atualização: {lastUpdated.toLocaleTimeString('pt-BR')}
          {realTime && <span className="ml-2 text-green-600">• Tempo real ativo</span>}
        </div>
      </Card>

      {/* Tabs */}
      <Card className="p-6">
        <div className="flex border-b border-gray-200 mb-6">
          {[
            { id: 'overview', label: 'Visão Geral', icon: <BarChart3 className="w-4 h-4" /> },
            { id: 'usage', label: 'Uso', icon: <Users className="w-4 h-4" /> },
            { id: 'performance', label: 'Performance', icon: <Zap className="w-4 h-4" /> },
            { id: 'ai', label: 'IA', icon: <Brain className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              className={`flex items-center gap-2 px-4 py-2 font-medium text-sm ${
                activeTab === tab.id 
                  ? 'text-purple-600 border-b-2 border-purple-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab(tab.id as any)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'usage' && renderUsageTab()}
        {activeTab === 'performance' && renderPerformanceTab()}
        {activeTab === 'ai' && renderAITab()}
      </Card>
    </div>
  );
};

export default MetricsDashboard;