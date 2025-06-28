import React, { useState, useMemo } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Skeleton } from '../ui/Skeleton';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb, 
  RefreshCw,
  Eye,
  Target,
  Zap,
  BarChart3,
  Users
} from 'lucide-react';
import { useAIAnalytics } from '../../hooks/useAIAnalytics';
import { PredictiveInsight, UserSegment } from '../../services/aiAnalyticsService';
import { cn } from '../../lib/utils';

interface AIInsightsDashboardProps {
  className?: string;
  showUserSegments?: boolean;
  maxInsights?: number;
}

const AIInsightsDashboard: React.FC<AIInsightsDashboardProps> = ({
  className,
  showUserSegments = true,
  maxInsights = 5
}) => {
  const { 
    insights, 
    segments, 
    isLoading, 
    error, 
    lastUpdated, 
    refreshInsights 
  } = useAIAnalytics();

  const [selectedInsightType, setSelectedInsightType] = useState<string>('all');

  // Filter insights by type
  const filteredInsights = useMemo(() => {
    if (selectedInsightType === 'all') {
      return insights.slice(0, maxInsights);
    }
    return insights.filter(insight => insight.type === selectedInsightType).slice(0, maxInsights);
  }, [insights, selectedInsightType, maxInsights]);

  // Get priority color
  const getPriorityColor = (priority: PredictiveInsight['priority']) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Get type icon
  const getTypeIcon = (type: PredictiveInsight['type']) => {
    switch (type) {
      case 'performance': return <Zap className="h-4 w-4" />;
      case 'usage': return <BarChart3 className="h-4 w-4" />;
      case 'recommendation': return <Lightbulb className="h-4 w-4" />;
      case 'optimization': return <Target className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  // Get confidence color
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (error) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="flex items-center space-x-2 text-red-600">
          <AlertTriangle className="h-5 w-5" />
          <span>Failed to load AI insights: {error}</span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={refreshInsights}
          className="mt-4"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Brain className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">AI Insights</h3>
            <p className="text-sm text-gray-600">
              {lastUpdated 
                ? `Last updated ${lastUpdated.toLocaleTimeString()}` 
                : 'Loading insights...'
              }
            </p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={refreshInsights}
          disabled={isLoading}
        >
          <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Insight Type Filters */}
      <div className="flex flex-wrap gap-2">
        {['all', 'performance', 'usage', 'recommendation', 'optimization'].map((type) => (
          <Button
            key={type}
            variant={selectedInsightType === type ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedInsightType(type)}
            className="capitalize"
          >
            {type === 'all' ? (
              <Eye className="h-4 w-4 mr-1" />
            ) : (
              getTypeIcon(type as PredictiveInsight['type'])
            )}
            {type}
          </Button>
        ))}
      </div>

      {/* Insights Grid */}
      <div className="space-y-4">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </Card>
          ))
        ) : filteredInsights.length === 0 ? (
          // No insights
          <Card className="p-8 text-center">
            <Brain className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h4 className="text-lg font-medium text-gray-600 mb-2">No insights available</h4>
            <p className="text-gray-500">
              {selectedInsightType === 'all' 
                ? 'AI is still learning from your usage patterns. Check back soon!'
                : `No ${selectedInsightType} insights found. Try a different filter.`
              }
            </p>
          </Card>
        ) : (
          // Insights list
          filteredInsights.map((insight) => (
            <Card key={insight.id} className="p-4 transition-all hover:shadow-md">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={cn("p-1.5 rounded", getPriorityColor(insight.priority))}>
                      {getTypeIcon(insight.type)}
                    </div>
                    <div>
                      <h4 className="font-medium">{insight.title}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge 
                          variant="secondary" 
                          className={cn("text-xs", getPriorityColor(insight.priority))}
                        >
                          {insight.priority}
                        </Badge>
                        <Badge variant="outline" className="text-xs capitalize">
                          {insight.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={cn("text-sm font-medium", getConfidenceColor(insight.confidence))}>
                      {Math.round(insight.confidence * 100)}%
                    </div>
                    <div className="text-xs text-gray-500">confidence</div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-700">{insight.description}</p>

                {/* Suggested Action */}
                {insight.actionable && insight.suggestedAction && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-blue-800">Suggested Action</div>
                        <div className="text-sm text-blue-700">{insight.suggestedAction}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Evidence */}
                {insight.evidence.length > 0 && (
                  <details className="text-sm">
                    <summary className="cursor-pointer text-gray-600 hover:text-gray-800 font-medium">
                      Evidence ({insight.evidence.length} items)
                    </summary>
                    <ul className="mt-2 space-y-1 pl-4">
                      {insight.evidence.map((evidence, i) => (
                        <li key={i} className="text-gray-600 text-xs">
                          • {evidence}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}

                {/* Timestamp */}
                <div className="text-xs text-gray-500 border-t pt-2">
                  Generated {insight.created.toLocaleString()}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* User Segments */}
      {showUserSegments && segments.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-gray-600" />
            <h4 className="font-medium">User Segments</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {segments.map((segment) => (
              <Card key={segment.id} className="p-4">
                <div className="space-y-3">
                  <div>
                    <h5 className="font-medium">{segment.name}</h5>
                    <div className="text-sm text-gray-600">
                      {segment.userCount} users
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Avg. Session:</span>
                      <span className="font-medium">
                        {Math.round(segment.avgSessionDuration)}s
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Conversion:</span>
                      <span className="font-medium">
                        {Math.round(segment.conversionRate * 100)}%
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Top Actions:</div>
                    <div className="flex flex-wrap gap-1">
                      {segment.topActions.slice(0, 3).map((action, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {action}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {insights.length}
            </div>
            <div className="text-sm text-gray-600">Total Insights</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {insights.filter(i => i.actionable).length}
            </div>
            <div className="text-sm text-gray-600">Actionable</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {insights.filter(i => i.priority === 'high' || i.priority === 'critical').length}
            </div>
            <div className="text-sm text-gray-600">High Priority</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {segments.length}
            </div>
            <div className="text-sm text-gray-600">User Segments</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AIInsightsDashboard; 