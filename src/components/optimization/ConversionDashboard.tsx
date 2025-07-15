/**
 * 🔴 IA ALPHA - CONVERSION RATE OPTIMIZATION DASHBOARD
 * Interface profissional para otimização de conversão em tempo real
 * 
 * Features:
 * - Funnel de conversão em tempo real
 * - A/B testing management
 * - Landing page optimization
 * - User journey analysis
 * - Conversion intelligence
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Users, 
  MousePointer, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  PlayCircle,
  PauseCircle,
  BarChart3,
  Zap,
  Eye,
  ArrowRight,
  Smartphone,
  Monitor,
  RefreshCw
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  FunnelChart,
  Cell
} from 'recharts';

import { conversionOptimizationEngine } from '../../services/optimization/ConversionOptimizationEngine';
import type { 
  ConversionFunnelStep, 
  ConversionOptimization, 
  ABTest 
} from '../../services/optimization/ConversionOptimizationEngine';

interface ConversionDashboardProps {
  className?: string;
}

export const ConversionDashboard: React.FC<ConversionDashboardProps> = ({ 
  className = "" 
}) => {
  const [funnelData, setFunnelData] = useState<ConversionFunnelStep[]>([]);
  const [activeTests, setActiveTests] = useState<ABTest[]>([]);
  const [optimizations, setOptimizations] = useState<ConversionOptimization[]>([]);
  const [conversionIntelligence, setConversionIntelligence] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1d' | '7d' | '30d'>('7d');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    initializeDashboard();
    
    if (autoRefresh) {
      const interval = setInterval(refreshData, 30000); // 30 seconds
      return () => clearInterval(interval);
    }
  }, [selectedTimeRange, autoRefresh]);

  const initializeDashboard = async () => {
    setIsLoading(true);
    try {
      await conversionOptimizationEngine.initialize();
      await refreshData();
    } catch (error) {
      console.error('Failed to initialize conversion dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    try {
      const [funnel, intelligence, landingPageOpts] = await Promise.all([
        conversionOptimizationEngine.analyzeConversionFunnel(selectedTimeRange),
        conversionOptimizationEngine.getConversionIntelligence(),
        conversionOptimizationEngine.optimizeLandingPage(window.location.origin)
      ]);

      setFunnelData(funnel);
      setConversionIntelligence(intelligence);
      setOptimizations(landingPageOpts);
    } catch (error) {
      console.error('Failed to refresh conversion data:', error);
    }
  };

  const createNewABTest = async () => {
    try {
      const test = await conversionOptimizationEngine.createABTest({
        name: 'Landing Page Headline Test',
        description: 'Test different headlines to improve conversion',
        goal: 'signup_conversion',
        variants: [
          {
            name: 'Control',
            description: 'Original headline',
            changes: {},
            traffic: 50
          },
          {
            name: 'Value Proposition',
            description: 'Emphasize unique value',
            changes: { headline: 'Generate Content Ideas 10x Faster with AI' },
            traffic: 50
          }
        ],
        traffic: 100,
        duration: 14
      });

      await conversionOptimizationEngine.startABTest(test.id);
      refreshData();
    } catch (error) {
      console.error('Failed to create A/B test:', error);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const formatPercentage = (num: number): string => {
    return `${num.toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading conversion analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Conversion Optimization</h1>
          <p className="text-muted-foreground">
            Real-time conversion analytics and optimization tools
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <Eye className="h-4 w-4" />
            <span>Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? <PauseCircle className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
          </Button>
          <Button onClick={refreshData} size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      {conversionIntelligence && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatPercentage(conversionIntelligence.currentMetrics.conversionRate)}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                +{conversionIntelligence.trends.percentage}% vs last {conversionIntelligence.trends.timeframe}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatPercentage(conversionIntelligence.currentMetrics.bounceRate)}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingDown className="h-3 w-3 mr-1 text-green-500" />
                Improving
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Session</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.floor(conversionIntelligence.currentMetrics.averageSessionDuration / 60)}m {conversionIntelligence.currentMetrics.averageSessionDuration % 60}s
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                Quality engagement
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue/Visitor</CardTitle>
              <MousePointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${conversionIntelligence.currentMetrics.revenuePerVisitor.toFixed(2)}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                Growing value
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alerts */}
      {conversionIntelligence?.alerts && conversionIntelligence.alerts.length > 0 && (
        <div className="space-y-2">
          {conversionIntelligence.alerts.map((alert, index) => (
            <Alert key={index} className={
              alert.type === 'critical' ? 'border-red-500' :
              alert.type === 'warning' ? 'border-yellow-500' :
              'border-blue-500'
            }>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>{alert.message}</strong> - {alert.action}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      <Tabs defaultValue="funnel" className="space-y-4">
        <TabsList>
          <TabsTrigger value="funnel">Conversion Funnel</TabsTrigger>
          <TabsTrigger value="abtests">A/B Tests</TabsTrigger>
          <TabsTrigger value="optimizations">Optimizations</TabsTrigger>
          <TabsTrigger value="insights">Intelligence</TabsTrigger>
        </TabsList>

        {/* Conversion Funnel */}
        <TabsContent value="funnel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel Analysis</CardTitle>
              <CardDescription>
                Track user progression through your conversion funnel
              </CardDescription>
              <div className="flex items-center space-x-2">
                {(['1d', '7d', '30d'] as const).map((range) => (
                  <Button
                    key={range}
                    variant={selectedTimeRange === range ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTimeRange(range)}
                  >
                    {range}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {funnelData.map((step, index) => (
                  <div key={step.step} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                        <span className="font-medium">{step.name}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        <span>{formatNumber(step.visitors)} visitors</span>
                        <span className="font-medium">{formatPercentage(step.conversionRate)}</span>
                        {index > 0 && step.dropOffRate > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            -{formatPercentage(step.dropOffRate)} drop-off
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Progress value={step.conversionRate} className="h-2" />
                    {step.frictionPoints.length > 0 && (
                      <div className="ml-8 text-xs text-muted-foreground">
                        Friction points: {step.frictionPoints.join(', ')}
                      </div>
                    )}
                    {index < funnelData.length - 1 && (
                      <div className="flex justify-center">
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* A/B Tests */}
        <TabsContent value="abtests" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Active A/B Tests</h3>
            <Button onClick={createNewABTest}>
              <PlayCircle className="h-4 w-4 mr-2" />
              Create New Test
            </Button>
          </div>

          {activeTests.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Active Tests</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create your first A/B test to start optimizing conversions
                </p>
                <Button onClick={createNewABTest}>
                  Create A/B Test
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {activeTests.map((test) => (
                <Card key={test.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{test.name}</CardTitle>
                        <CardDescription>{test.description}</CardDescription>
                      </div>
                      <Badge variant={
                        test.status === 'running' ? 'default' :
                        test.status === 'completed' ? 'secondary' : 'outline'
                      }>
                        {test.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Traffic:</span>
                          <span className="ml-1 font-medium">{test.traffic}%</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Significance:</span>
                          <span className="ml-1 font-medium">{test.significance.toFixed(1)}%</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Lift:</span>
                          <span className="ml-1 font-medium text-green-600">
                            +{test.metrics.liftPercentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid gap-2">
                        {test.variants.map((variant) => (
                          <div key={variant.id} className="flex justify-between items-center p-2 border rounded">
                            <span className="font-medium">{variant.name}</span>
                            <div className="flex items-center space-x-4 text-sm">
                              <span>{variant.visitors} visitors</span>
                              <span className="font-medium">{formatPercentage(variant.conversionRate)}</span>
                              {test.winner === variant.id && (
                                <Badge variant="default">Winner</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Optimizations */}
        <TabsContent value="optimizations" className="space-y-4">
          <h3 className="text-lg font-semibold">Optimization Opportunities</h3>
          
          <div className="grid gap-4">
            {optimizations.map((opt, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg capitalize">
                        {opt.target.replace('_', ' ')} Optimization
                      </CardTitle>
                      <CardDescription>{opt.strategy}</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        +{opt.improvement}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {opt.confidence}% confidence
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span>Current: {formatPercentage(opt.currentRate)}</span>
                      <span>Target: {formatPercentage(opt.optimizedRate)}</span>
                    </div>
                    <Progress value={(opt.optimizedRate / Math.max(opt.currentRate * 2, opt.optimizedRate)) * 100} />
                    
                    <div>
                      <h4 className="font-medium mb-2">Implementation Steps:</h4>
                      <ul className="text-sm space-y-1">
                        {opt.implementation.map((step, stepIndex) => (
                          <li key={stepIndex} className="flex items-start">
                            <CheckCircle className="h-3 w-3 mt-1 mr-2 text-green-500 flex-shrink-0" />
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-sm text-muted-foreground">
                        Expected Impact: +{opt.expectedImpact}% conversion
                      </span>
                      <Button size="sm">
                        <Zap className="h-4 w-4 mr-1" />
                        Implement
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Intelligence */}
        <TabsContent value="insights" className="space-y-4">
          <h3 className="text-lg font-semibold">Conversion Intelligence</h3>
          
          {conversionIntelligence?.recommendations && (
            <div className="grid gap-4">
              {conversionIntelligence.recommendations.map((rec, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant={
                            rec.priority === 'high' ? 'destructive' :
                            rec.priority === 'medium' ? 'default' : 'secondary'
                          }>
                            {rec.priority} priority
                          </Badge>
                          <Badge variant="outline">
                            {rec.effort} effort
                          </Badge>
                        </div>
                        <h4 className="font-medium">{rec.action}</h4>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          +{rec.expectedImpact}%
                        </div>
                        <div className="text-xs text-muted-foreground">impact</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {/* Device Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Device Performance</CardTitle>
              <CardDescription>Conversion rates by device type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 border rounded">
                  <div className="flex items-center space-x-2">
                    <Monitor className="h-5 w-5 text-blue-500" />
                    <span>Desktop</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">4.2%</div>
                    <div className="text-xs text-green-600">+0.3%</div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded">
                  <div className="flex items-center space-x-2">
                    <Smartphone className="h-5 w-5 text-green-500" />
                    <span>Mobile</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">2.1%</div>
                    <div className="text-xs text-red-600">-0.8%</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConversionDashboard; 