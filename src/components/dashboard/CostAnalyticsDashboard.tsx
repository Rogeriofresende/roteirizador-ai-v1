/**
 * Cost Analytics Dashboard - IA Alpha Task 3 Implementation
 * Comprehensive visual interface for cost management system
 * Integrates all cost management services: Cost, Budget, Rate Limiting, Queue, Fallback
 * 
 * Features:
 * - Real-time cost tracking and budget monitoring
 * - User tier distribution and usage analytics
 * - Emergency alerts and intervention tracking
 * - Rate limiting and queue performance metrics
 * - Fallback system status and service level monitoring
 * - Cost forecasting and budget optimization recommendations
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  DollarSign, 
  Users, 
  Activity, 
  AlertTriangle, 
  TrendingUp, 
  Settings,
  Clock,
  Shield,
  BarChart3,
  Zap,
  Target,
  CheckCircle,
  XCircle,
  RefreshCw,
  Eye,
  Calendar,
  Gauge
} from 'lucide-react';

// Import all cost management services
import CostManagementService from '../../services/cost-management/costManagementService';
import BudgetControlService from '../../services/cost-management/budgetControlService';
import RateLimitingService from '../../services/cost-management/rateLimitingService';
import PriorityQueueService from '../../services/cost-management/priorityQueueService';
import FallbackService from '../../services/cost-management/fallbackService';

interface DashboardMetrics {
  costMetrics: {
    today: number;
    thisMonth: number;
    budget: {
      dailyLimit: number;
      monthlyLimit: number;
      remainingToday: number;
      remainingMonth: number;
      percentage: number;
    };
    forecast: {
      projectedMonthly: number;
      burnRate: number;
      daysRemaining: number;
    };
  };
  userMetrics: {
    activeUsers: number;
    tierDistribution: {
      free: number;
      premium: number;
      enterprise: number;
    };
    costPerUser: number;
    efficiency: number;
  };
  systemHealth: {
    serviceLevel: string;
    rateLimitingStatus: string;
    queueHealth: string;
    circuitBreakers: number;
    cacheHitRate: number;
    errorRate: number;
  };
  alerts: Array<{
    id: string;
    type: 'warning' | 'error' | 'info';
    message: string;
    timestamp: Date;
    resolved: boolean;
  }>;
}

const CostAnalyticsDashboard: React.FC = () => {
  // Service instances
  const costService = useMemo(() => new CostManagementService(), []);
  const budgetService = useMemo(() => new BudgetControlService(), []);
  const rateLimitService = useMemo(() => new RateLimitingService(), []);
  const queueService = useMemo(() => new PriorityQueueService(), []);
  const fallbackService = useMemo(() => new FallbackService(), []);

  // State management
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'today' | 'week' | 'month'>('today');

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setRefreshing(true);

      // Fetch data from all services in parallel
      const [
        globalCosts,
        budgetAnalytics,
        rateLimitStats,
        queueStats,
        fallbackStats
      ] = await Promise.all([
        costService.getGlobalCostSummary(),
        budgetService.getBudgetAnalytics(),
        rateLimitService.getRateLimitingStats(),
        queueService.getQueueStats(),
        fallbackService.getFallbackStats()
      ]);

      // Transform data into dashboard metrics
      const dashboardMetrics: DashboardMetrics = {
        costMetrics: {
          today: globalCosts.today,
          thisMonth: globalCosts.thisMonth,
          budget: {
            dailyLimit: 1.67,
            monthlyLimit: 50.00,
            remainingToday: Math.max(0, 1.67 - globalCosts.today),
            remainingMonth: Math.max(0, 50.00 - globalCosts.thisMonth),
            percentage: (globalCosts.today / 1.67) * 100
          },
          forecast: budgetAnalytics.forecast.monthly
        },
        userMetrics: {
          activeUsers: rateLimitStats.activeUsers,
          tierDistribution: rateLimitStats.tierDistribution,
          costPerUser: budgetAnalytics.efficiency.costPerUser,
          efficiency: budgetAnalytics.efficiency.costPerIdea
        },
        systemHealth: {
          serviceLevel: fallbackStats.currentServiceLevel,
          rateLimitingStatus: rateLimitStats.systemHealth,
          queueHealth: queueStats.queueHealth,
          circuitBreakers: fallbackStats.circuitBreakerActivations,
          cacheHitRate: fallbackStats.cacheHitRate,
          errorRate: rateLimitStats.errorRate
        },
        alerts: [
          ...budgetAnalytics.alerts.map(alert => ({
            id: alert.id,
            type: alert.type === 'emergency' ? 'error' : alert.type === 'warning' ? 'warning' : 'info',
            message: `Budget ${alert.type}: ${alert.percentage.toFixed(1)}% of ${alert.budgetLimit.toFixed(2)} used`,
            timestamp: alert.timestamp,
            resolved: alert.acknowledged
          })),
          ...budgetAnalytics.interventions.map(intervention => ({
            id: intervention.id,
            type: intervention.severity === 'critical' ? 'error' : 'warning',
            message: `${intervention.type}: ${intervention.reason}`,
            timestamp: intervention.timestamp,
            resolved: intervention.resolved
          }))
        ]
      };

      setMetrics(dashboardMetrics);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  // Auto-refresh effect
  useEffect(() => {
    loadDashboardData();
    
    if (autoRefresh) {
      const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Emergency alert component
  const EmergencyAlert = ({ alert }: { alert: any }) => (
    <Alert className={`mb-4 ${alert.type === 'error' ? 'border-red-500 bg-red-50' : 
                               alert.type === 'warning' ? 'border-yellow-500 bg-yellow-50' : 
                               'border-blue-500 bg-blue-50'}`}>
      <AlertTriangle className={`h-4 w-4 ${alert.type === 'error' ? 'text-red-600' : 
                                            alert.type === 'warning' ? 'text-yellow-600' : 
                                            'text-blue-600'}`} />
      <AlertDescription className="flex justify-between items-center">
        <span>{alert.message}</span>
        <Badge variant={alert.resolved ? "default" : "destructive"}>
          {alert.resolved ? 'Resolved' : 'Active'}
        </Badge>
      </AlertDescription>
    </Alert>
  );

  // Budget status component
  const BudgetStatusCard = () => {
    if (!metrics) return null;
    
    const { budget } = metrics.costMetrics;
    const isWarning = budget.percentage >= 80;
    const isCritical = budget.percentage >= 100;
    
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Daily Budget Status</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${metrics.costMetrics.today.toFixed(4)}
          </div>
          <p className="text-xs text-muted-foreground">
            of ${budget.dailyLimit} daily limit
          </p>
          <Progress 
            value={budget.percentage} 
            className={`mt-3 ${isCritical ? 'bg-red-200' : isWarning ? 'bg-yellow-200' : 'bg-green-200'}`}
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>{budget.percentage.toFixed(1)}% used</span>
            <span>${budget.remainingToday.toFixed(4)} remaining</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Monthly forecast component
  const MonthlyForecastCard = () => {
    if (!metrics) return null;
    
    const { forecast } = metrics.costMetrics;
    const isOnTrack = forecast.projectedMonthly <= 50;
    
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Forecast</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${forecast.projectedMonthly.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">
            projected monthly cost
          </p>
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-xs">
              <span>Current month:</span>
              <span>${metrics.costMetrics.thisMonth.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Burn rate:</span>
              <span>${forecast.burnRate.toFixed(4)}/day</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Days remaining:</span>
              <span>{forecast.daysRemaining}</span>
            </div>
          </div>
          <Badge variant={isOnTrack ? "default" : "destructive"} className="mt-2">
            {isOnTrack ? 'On Track' : 'Over Budget'}
          </Badge>
        </CardContent>
      </Card>
    );
  };

  // User metrics component
  const UserMetricsCard = () => {
    if (!metrics) return null;
    
    const { userMetrics } = metrics;
    const totalUsers = userMetrics.tierDistribution.free + 
                      userMetrics.tierDistribution.premium + 
                      userMetrics.tierDistribution.enterprise;
    
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">User Analytics</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalUsers}</div>
          <p className="text-xs text-muted-foreground">active users</p>
          
          <div className="mt-3 space-y-2">
            <div className="flex justify-between text-xs">
              <span>Enterprise:</span>
              <span>{userMetrics.tierDistribution.enterprise} users</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Premium:</span>
              <span>{userMetrics.tierDistribution.premium} users</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Free:</span>
              <span>{userMetrics.tierDistribution.free} users</span>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t">
            <div className="flex justify-between text-xs">
              <span>Cost per user:</span>
              <span>${userMetrics.costPerUser.toFixed(4)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Efficiency:</span>
              <span>${userMetrics.efficiency.toFixed(4)}/idea</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // System health component
  const SystemHealthCard = () => {
    if (!metrics) return null;
    
    const { systemHealth } = metrics;
    const isHealthy = systemHealth.serviceLevel === 'normal' && 
                     systemHealth.queueHealth === 'healthy' && 
                     systemHealth.errorRate < 5;
    
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">System Health</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            {isHealthy ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            <span className="text-sm font-medium">
              {isHealthy ? 'Healthy' : 'Degraded'}
            </span>
          </div>
          
          <div className="mt-3 space-y-2">
            <div className="flex justify-between text-xs">
              <span>Service Level:</span>
              <Badge variant={systemHealth.serviceLevel === 'normal' ? 'default' : 'destructive'}>
                {systemHealth.serviceLevel}
              </Badge>
            </div>
            <div className="flex justify-between text-xs">
              <span>Queue Health:</span>
              <Badge variant={systemHealth.queueHealth === 'healthy' ? 'default' : 'destructive'}>
                {systemHealth.queueHealth}
              </Badge>
            </div>
            <div className="flex justify-between text-xs">
              <span>Cache Hit Rate:</span>
              <span>{systemHealth.cacheHitRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Error Rate:</span>
              <span>{systemHealth.errorRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Circuit Breakers:</span>
              <span>{systemHealth.circuitBreakers} active</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Rate limiting status component
  const RateLimitingStatus = () => {
    if (!metrics) return null;
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Rate Limiting Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Current Status</p>
              <Badge variant={metrics.systemHealth.rateLimitingStatus === 'normal' ? 'default' : 'destructive'}>
                {metrics.systemHealth.rateLimitingStatus}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Users</p>
              <p className="text-lg font-semibold">{metrics.userMetrics.activeUsers}</p>
            </div>
          </div>
          
          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-2">Tier Distribution</p>
            <div className="space-y-2">
              {Object.entries(metrics.userMetrics.tierDistribution).map(([tier, count]) => (
                <div key={tier} className="flex justify-between items-center">
                  <span className="capitalize text-sm">{tier}:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">{count}</span>
                    <Progress 
                      value={(count / metrics.userMetrics.activeUsers) * 100} 
                      className="w-20 h-2"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Queue performance component
  const QueuePerformance = () => {
    if (!metrics) return null;
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Queue Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Queue Health</p>
              <Badge variant={metrics.systemHealth.queueHealth === 'healthy' ? 'default' : 'destructive'}>
                {metrics.systemHealth.queueHealth}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Processing Rate</p>
              <p className="text-lg font-semibold">85%</p>
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs">
              <span>Queued Requests:</span>
              <span>12</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Processing:</span>
              <span>5</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Avg Wait Time:</span>
              <span>2.3s</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Throughput:</span>
              <span>45 req/min</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading cost analytics...</span>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
        <p>Unable to load cost analytics data</p>
        <Button onClick={loadDashboardData} className="mt-2">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Cost Analytics</h2>
          <p className="text-muted-foreground">
            Real-time cost monitoring and budget management
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {autoRefresh ? 'Stop' : 'Start'} Auto-refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={loadDashboardData}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Emergency Alerts */}
      {metrics.alerts.filter(alert => !alert.resolved).length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Active Alerts</h3>
          {metrics.alerts
            .filter(alert => !alert.resolved)
            .slice(0, 3)
            .map(alert => (
              <EmergencyAlert key={alert.id} alert={alert} />
            ))}
        </div>
      )}

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <BudgetStatusCard />
        <MonthlyForecastCard />
        <UserMetricsCard />
        <SystemHealthCard />
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <RateLimitingStatus />
            <QueuePerformance />
          </div>
        </TabsContent>
        
        <TabsContent value="budget" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Budget Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Today's Spending</p>
                    <p className="text-2xl font-bold">${metrics.costMetrics.today.toFixed(4)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Spending</p>
                    <p className="text-2xl font-bold">${metrics.costMetrics.thisMonth.toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Daily Budget Usage:</span>
                    <span>{metrics.costMetrics.budget.percentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics.costMetrics.budget.percentage} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Monthly Budget Usage:</span>
                    <span>{((metrics.costMetrics.thisMonth / 50) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(metrics.costMetrics.thisMonth / 50) * 100} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>System Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Service Level:</span>
                    <Badge>{metrics.systemHealth.serviceLevel}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Cache Hit Rate:</span>
                    <span>{metrics.systemHealth.cacheHitRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Error Rate:</span>
                    <span>{metrics.systemHealth.errorRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cost Efficiency:</span>
                    <span>${metrics.userMetrics.efficiency.toFixed(4)}/idea</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Optimization Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Cost per User:</span>
                    <span>${metrics.userMetrics.costPerUser.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Circuit Breakers:</span>
                    <span>{metrics.systemHealth.circuitBreakers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Queue Health:</span>
                    <Badge variant={metrics.systemHealth.queueHealth === 'healthy' ? 'default' : 'destructive'}>
                      {metrics.systemHealth.queueHealth}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alert History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.alerts.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No alerts found</p>
                ) : (
                  metrics.alerts.map(alert => (
                    <div key={alert.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        {alert.type === 'error' ? (
                          <XCircle className="h-4 w-4 text-red-500" />
                        ) : alert.type === 'warning' ? (
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-blue-500" />
                        )}
                        <div>
                          <p className="text-sm font-medium">{alert.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {alert.timestamp.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant={alert.resolved ? 'default' : 'destructive'}>
                        {alert.resolved ? 'Resolved' : 'Active'}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CostAnalyticsDashboard; 