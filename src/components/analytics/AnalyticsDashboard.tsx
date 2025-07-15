/**
 * 🔴 IA ALPHA - ANALYTICS DASHBOARD
 * Dashboard completo para visualização de dados de analytics
 * 
 * Features:
 * - Multi-platform analytics visualization
 * - User journey mapping
 * - Conversion funnel tracking
 * - Real-time metrics
 * - Performance correlation
 * - Export capabilities
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  FunnelChart,
  Funnel,
  Area,
  AreaChart
} from 'recharts';
import { 
  Activity, 
  Users, 
  TrendingUp, 
  Target, 
  Clock, 
  MousePointer,
  Eye,
  Download,
  RefreshCw,
  Filter,
  Calendar,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  MapPin,
  Star,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';

import { advancedAnalyticsService } from '@/services/analytics/AdvancedAnalyticsService';
import { realTimePerformanceMonitor } from '@/services/performance/RealTimePerformanceMonitor';

interface AnalyticsMetrics {
  totalUsers: number;
  activeUsers: number;
  pageViews: number;
  sessions: number;
  bounceRate: number;
  avgSessionDuration: number;
  conversionRate: number;
  topPages: Array<{
    page: string;
    views: number;
    avgTime: number;
  }>;
  userJourney: Array<{
    step: string;
    users: number;
    dropOff: number;
  }>;
  conversionFunnel: Array<{
    stage: string;
    users: number;
    rate: number;
  }>;
  deviceBreakdown: Array<{
    device: string;
    users: number;
    percentage: number;
  }>;
  geographicData: Array<{
    country: string;
    users: number;
    sessions: number;
  }>;
  realtimeEvents: Array<{
    timestamp: number;
    event: string;
    user: string;
    page: string;
  }>;
}

const AnalyticsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAnalyticsData();
    
    // Set up real-time updates
    const interval = setInterval(() => {
      loadAnalyticsData();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [selectedTimeRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Simulate analytics data loading
      // In real implementation, this would fetch from multiple analytics services
      const analyticsData: AnalyticsMetrics = {
        totalUsers: 12547,
        activeUsers: 324,
        pageViews: 45678,
        sessions: 8932,
        bounceRate: 23.4,
        avgSessionDuration: 342, // seconds
        conversionRate: 8.7,
        topPages: [
          { page: '/', views: 12547, avgTime: 145 },
          { page: '/generator', views: 8932, avgTime: 287 },
          { page: '/dashboard', views: 5634, avgTime: 198 },
          { page: '/auth/login', views: 3456, avgTime: 67 },
          { page: '/profile', views: 2345, avgTime: 156 }
        ],
        userJourney: [
          { step: 'Landing', users: 1000, dropOff: 0 },
          { step: 'Registration', users: 750, dropOff: 25 },
          { step: 'First Use', users: 625, dropOff: 16.7 },
          { step: 'Feature Discovery', users: 500, dropOff: 20 },
          { step: 'Conversion', users: 435, dropOff: 13 }
        ],
        conversionFunnel: [
          { stage: 'Visitors', users: 12547, rate: 100 },
          { stage: 'Engaged', users: 8932, rate: 71.2 },
          { stage: 'Registered', users: 5634, rate: 44.9 },
          { stage: 'Active', users: 3456, rate: 27.5 },
          { stage: 'Converted', users: 1092, rate: 8.7 }
        ],
        deviceBreakdown: [
          { device: 'Mobile', users: 7528, percentage: 60 },
          { device: 'Desktop', users: 3764, percentage: 30 },
          { device: 'Tablet', users: 1255, percentage: 10 }
        ],
        geographicData: [
          { country: 'Brasil', users: 8932, sessions: 15634 },
          { country: 'Estados Unidos', users: 2345, sessions: 4567 },
          { country: 'Portugal', users: 1234, sessions: 2345 },
          { country: 'Espanha', users: 1092, sessions: 1876 },
          { country: 'Reino Unido', users: 856, sessions: 1543 }
        ],
        realtimeEvents: [
          { timestamp: Date.now() - 1000, event: 'page_view', user: 'User_001', page: '/generator' },
          { timestamp: Date.now() - 2000, event: 'button_click', user: 'User_002', page: '/dashboard' },
          { timestamp: Date.now() - 3000, event: 'video_play', user: 'User_003', page: '/' },
          { timestamp: Date.now() - 4000, event: 'form_submit', user: 'User_001', page: '/profile' },
          { timestamp: Date.now() - 5000, event: 'feature_used', user: 'User_004', page: '/generator' }
        ]
      };

      setMetrics(analyticsData);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadAnalyticsData();
  };

  const exportData = () => {
    if (!metrics) return;
    
    const dataToExport = {
      exportDate: new Date().toISOString(),
      timeRange: selectedTimeRange,
      metrics: metrics
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const formatTimeAgo = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) {
      return 'Agora mesmo';
    } else if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}m atrás`;
    } else {
      return `${Math.floor(diff / 3600000)}h atrás`;
    }
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <ArrowUp className="w-4 h-4 text-green-500" />;
    if (current < previous) return <ArrowDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Carregando dados de analytics...</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Não foi possível carregar os dados de analytics. Tente novamente.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Monitoramento completo de métricas e comportamento do usuário
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1d">Últimas 24h</option>
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
          </select>
          
          <Button
            onClick={handleRefresh}
            variant="outline"
            disabled={refreshing}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </Button>
          
          <Button
            onClick={exportData}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Exportar</span>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeUsers.toLocaleString()}</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {getTrendIcon(metrics.activeUsers, 280)}
              <span>+15.7% vs período anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visualizações</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.pageViews.toLocaleString()}</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {getTrendIcon(metrics.pageViews, 42000)}
              <span>+8.6% vs período anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.conversionRate}%</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {getTrendIcon(metrics.conversionRate, 8.2)}
              <span>+0.5% vs período anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(metrics.avgSessionDuration)}</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {getTrendIcon(metrics.avgSessionDuration, 320)}
              <span>+6.9% vs período anterior</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="funnel">Funil</TabsTrigger>
          <TabsTrigger value="journey">Jornada</TabsTrigger>
          <TabsTrigger value="devices">Dispositivos</TabsTrigger>
          <TabsTrigger value="geography">Geografia</TabsTrigger>
          <TabsTrigger value="realtime">Tempo Real</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Páginas Mais Visitadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.topPages.map((page, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium">{page.page === '/' ? 'Home' : page.page}</div>
                        <div className="text-sm text-gray-500">
                          {page.views.toLocaleString()} visualizações
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatDuration(page.avgTime)}</div>
                        <div className="text-sm text-gray-500">tempo médio</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Dispositivos</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={metrics.deviceBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="users"
                    >
                      {metrics.deviceBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="funnel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Funil de Conversão</CardTitle>
              <p className="text-sm text-gray-600">
                Análise detalhada das etapas de conversão
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.conversionFunnel.map((stage, index) => (
                  <div key={index} className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">{stage.stage}</div>
                      <div className="text-sm text-gray-500">
                        {stage.users.toLocaleString()} usuários ({stage.rate}%)
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${stage.rate}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="journey" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Jornada do Usuário</CardTitle>
              <p className="text-sm text-gray-600">
                Análise do fluxo de navegação dos usuários
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={metrics.userJourney}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="step" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="users" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Dispositivos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {metrics.deviceBreakdown.map((device, index) => (
                  <div key={index} className="text-center p-4 border rounded-lg">
                    <div className="flex justify-center mb-2">
                      {device.device === 'Mobile' && <Smartphone className="w-8 h-8 text-blue-500" />}
                      {device.device === 'Desktop' && <Monitor className="w-8 h-8 text-green-500" />}
                      {device.device === 'Tablet' && <Tablet className="w-8 h-8 text-purple-500" />}
                    </div>
                    <div className="text-2xl font-bold">{device.users.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">{device.device}</div>
                    <div className="text-sm text-gray-500">{device.percentage}%</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geography" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição Geográfica</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.geographicData.map((country, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <div>
                        <div className="font-medium">{country.country}</div>
                        <div className="text-sm text-gray-500">
                          {country.sessions.toLocaleString()} sessões
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{country.users.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">usuários</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="realtime" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Atividade em Tempo Real</span>
                <Badge variant="secondary" className="ml-2">
                  {metrics.activeUsers} usuários ativos
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.realtimeEvents.map((event, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <div>
                        <div className="font-medium">{event.event}</div>
                        <div className="text-sm text-gray-500">{event.page}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{event.user}</div>
                      <div className="text-sm text-gray-500">{formatTimeAgo(event.timestamp)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard; 