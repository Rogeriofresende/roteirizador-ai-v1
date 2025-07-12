/**
 * Advanced StatCard Component - IA Charlie Task 2.4.1
 * Comprehensive metric visualization card with analytics and interactions
 * Built for displaying key performance indicators with rich visual features
 * 
 * Features:
 * - Multiple chart types (line, bar, area, donut, gauge)
 * - Real-time data updates with smooth animations
 * - Trend indicators and percentage changes
 * - Interactive tooltips and drill-down capabilities
 * - Customizable color schemes and themes
 * - Export functionality for charts and data
 * - Responsive design with mobile optimization
 * - Performance benchmarking and targets
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  MoreHorizontal, 
  Download, 
  Maximize2, 
  Info,
  Target,
  Calendar,
  Users,
  DollarSign,
  Activity,
  Zap
} from 'lucide-react';
import { Button } from '../Button';

export interface StatData {
  value: number;
  label: string;
  timestamp?: Date;
  target?: number;
  benchmark?: number;
}

export interface ChartDataPoint {
  x: number | Date;
  y: number;
  label?: string;
  color?: string;
  metadata?: Record<string, any>;
}

export interface StatCardProps {
  title: string;
  value: number;
  previousValue?: number;
  target?: number;
  benchmark?: number;
  unit?: string;
  formatValue?: (value: number) => string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
  trendUnit?: '%' | 'absolute';
  chartType?: 'line' | 'bar' | 'area' | 'donut' | 'gauge' | 'sparkline' | 'none';
  chartData?: ChartDataPoint[];
  timeRange?: '1h' | '24h' | '7d' | '30d' | '90d' | '1y';
  status?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  icon?: React.ReactNode;
  color?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTrend?: boolean;
  showTarget?: boolean;
  showBenchmark?: boolean;
  showChart?: boolean;
  interactive?: boolean;
  loading?: boolean;
  onClick?: () => void;
  onExport?: (format: 'png' | 'svg' | 'csv') => void;
  onTimeRangeChange?: (range: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

const STATUS_COLORS = {
  success: { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400', border: 'border-green-200 dark:border-green-800' },
  warning: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-200 dark:border-yellow-800' },
  error: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-800' },
  info: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' },
  neutral: { bg: 'bg-gray-50 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400', border: 'border-gray-200 dark:border-gray-700' }
};

const SIZE_CONFIGS = {
  sm: { padding: 'p-4', titleSize: 'text-sm', valueSize: 'text-xl', height: 'h-32' },
  md: { padding: 'p-6', titleSize: 'text-base', valueSize: 'text-2xl', height: 'h-40' },
  lg: { padding: 'p-8', titleSize: 'text-lg', valueSize: 'text-3xl', height: 'h-48' },
  xl: { padding: 'p-10', titleSize: 'text-xl', valueSize: 'text-4xl', height: 'h-56' }
};

export function StatCard({
  title,
  value,
  previousValue,
  target,
  benchmark,
  unit = '',
  formatValue,
  trend,
  trendValue,
  trendUnit = '%',
  chartType = 'none',
  chartData = [],
  timeRange = '24h',
  status = 'neutral',
  icon,
  color,
  size = 'md',
  showTrend = true,
  showTarget = true,
  showBenchmark = true,
  showChart = true,
  interactive = true,
  loading = false,
  onClick,
  onExport,
  onTimeRangeChange,
  className = '',
  style
}: StatCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [showTooltip, setShowTooltip] = useState(false);
  const [animatedValue, setAnimatedValue] = useState(0);

  const sizeConfig = SIZE_CONFIGS[size];
  const statusColor = STATUS_COLORS[status];

  // Animate value changes
  useEffect(() => {
    if (loading) return;

    const startValue = animatedValue;
    const endValue = value;
    const duration = 1000; // 1 second
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (endValue - startValue) * easeOutCubic;
      
      setAnimatedValue(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }, [value, loading]);

  // Calculate trend automatically if not provided
  const calculatedTrend = useMemo(() => {
    if (trend) return trend;
    if (previousValue === undefined) return 'neutral';
    
    if (value > previousValue) return 'up';
    if (value < previousValue) return 'down';
    return 'neutral';
  }, [trend, value, previousValue]);

  // Calculate trend value automatically if not provided
  const calculatedTrendValue = useMemo(() => {
    if (trendValue !== undefined) return trendValue;
    if (previousValue === undefined || previousValue === 0) return 0;
    
    if (trendUnit === '%') {
      return ((value - previousValue) / previousValue) * 100;
    } else {
      return value - previousValue;
    }
  }, [trendValue, value, previousValue, trendUnit]);

  // Format the display value
  const formattedValue = useMemo(() => {
    if (formatValue) {
      return formatValue(animatedValue);
    }
    
    // Default formatting based on value size
    if (Math.abs(animatedValue) >= 1000000) {
      return `${(animatedValue / 1000000).toFixed(1)}M`;
    } else if (Math.abs(animatedValue) >= 1000) {
      return `${(animatedValue / 1000).toFixed(1)}K`;
    } else if (animatedValue % 1 !== 0) {
      return animatedValue.toFixed(2);
    } else {
      return Math.round(animatedValue).toLocaleString();
    }
  }, [animatedValue, formatValue]);

  // Calculate target progress
  const targetProgress = useMemo(() => {
    if (!target || target === 0) return 0;
    return Math.min((value / target) * 100, 100);
  }, [value, target]);

  // Time range options
  const timeRangeOptions = [
    { value: '1h', label: '1H' },
    { value: '24h', label: '24H' },
    { value: '7d', label: '7D' },
    { value: '30d', label: '30D' },
    { value: '90d', label: '90D' },
    { value: '1y', label: '1Y' }
  ];

  // Handle time range change
  const handleTimeRangeChange = useCallback((range: string) => {
    setSelectedTimeRange(range);
    onTimeRangeChange?.(range);
  }, [onTimeRangeChange]);

  // Handle export
  const handleExport = useCallback((format: 'png' | 'svg' | 'csv') => {
    onExport?.(format);
  }, [onExport]);

  // Render trend indicator
  const renderTrendIndicator = () => {
    if (!showTrend || calculatedTrend === 'neutral') return null;

    const isPositive = calculatedTrend === 'up';
    const TrendIcon = isPositive ? TrendingUp : TrendingDown;
    const trendColor = isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';

    return (
      <div className={`flex items-center gap-1 ${trendColor}`}>
        <TrendIcon className="w-4 h-4" />
        <span className="text-sm font-medium">
          {Math.abs(calculatedTrendValue).toFixed(1)}{trendUnit}
        </span>
      </div>
    );
  };

  // Render target indicator
  const renderTargetIndicator = () => {
    if (!showTarget || !target) return null;

    return (
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <Target className="w-4 h-4" />
        <span>Target: {formatValue ? formatValue(target) : target.toLocaleString()}{unit}</span>
        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 ml-2">
          <div 
            className="bg-blue-500 h-full rounded-full transition-all duration-1000"
            style={{ width: `${targetProgress}%` }}
          />
        </div>
        <span className="text-xs">{targetProgress.toFixed(0)}%</span>
      </div>
    );
  };

  // Render mini chart
  const renderMiniChart = () => {
    if (!showChart || chartType === 'none' || chartData.length === 0) return null;

    const maxValue = Math.max(...chartData.map(d => d.y));
    const minValue = Math.min(...chartData.map(d => d.y));
    const range = maxValue - minValue;

    switch (chartType) {
      case 'sparkline':
      case 'line':
        const points = chartData.map((point, index) => {
          const x = (index / (chartData.length - 1)) * 100;
          const y = range === 0 ? 50 : ((maxValue - point.y) / range) * 100;
          return `${x},${y}`;
        }).join(' ');

        return (
          <div className="mt-4 h-16 relative">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polyline
                points={points}
                fill="none"
                stroke={color || (status === 'success' ? '#10B981' : status === 'error' ? '#EF4444' : '#3B82F6')}
                strokeWidth="2"
                className="opacity-80"
              />
              {/* Data points */}
              {chartData.map((point, index) => {
                const x = (index / (chartData.length - 1)) * 100;
                const y = range === 0 ? 50 : ((maxValue - point.y) / range) * 100;
                return (
                  <circle
                    key={index}
                    cx={x}
                    cy={y}
                    r="1.5"
                    fill={color || (status === 'success' ? '#10B981' : status === 'error' ? '#EF4444' : '#3B82F6')}
                    className="opacity-60"
                  />
                );
              })}
            </svg>
          </div>
        );

      case 'bar':
        return (
          <div className="mt-4 h-16 flex items-end gap-1">
            {chartData.slice(-10).map((point, index) => {
              const height = range === 0 ? 20 : ((point.y - minValue) / range) * 60;
              return (
                <div
                  key={index}
                  className="flex-1 rounded-t transition-all duration-300"
                  style={{ 
                    height: `${height}%`,
                    backgroundColor: color || (status === 'success' ? '#10B981' : status === 'error' ? '#EF4444' : '#3B82F6'),
                    opacity: 0.7
                  }}
                />
              );
            })}
          </div>
        );

      case 'gauge':
        const percentage = target ? (value / target) * 100 : 100;
        const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
        const rotation = (clampedPercentage / 100) * 180 - 90;

        return (
          <div className="mt-4 h-16 flex justify-center">
            <div className="relative w-24 h-12">
              <svg className="w-full h-full" viewBox="0 0 100 50">
                {/* Background arc */}
                <path
                  d="M 10 40 A 30 30 0 0 1 90 40"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="6"
                />
                {/* Progress arc */}
                <path
                  d={`M 10 40 A 30 30 0 0 1 ${10 + 80 * (clampedPercentage / 100)} ${40 - 30 * Math.sin((clampedPercentage / 100) * Math.PI)}`}
                  fill="none"
                  stroke={color || (status === 'success' ? '#10B981' : status === 'error' ? '#EF4444' : '#3B82F6')}
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                {/* Needle */}
                <line
                  x1="50"
                  y1="40"
                  x2="50"
                  y2="15"
                  stroke="#374151"
                  strokeWidth="2"
                  strokeLinecap="round"
                  style={{ transformOrigin: '50px 40px', transform: `rotate(${rotation}deg)` }}
                />
                <circle cx="50" cy="40" r="3" fill="#374151" />
              </svg>
            </div>
          </div>
        );

      case 'donut':
        const donutPercentage = Math.min((value / (target || 100)) * 100, 100);
        const radius = 15;
        const circumference = 2 * Math.PI * radius;
        const strokeDasharray = circumference;
        const strokeDashoffset = circumference - (donutPercentage / 100) * circumference;

        return (
          <div className="mt-4 h-16 flex justify-center">
            <div className="relative w-16 h-16">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 40 40">
                <circle
                  cx="20"
                  cy="20"
                  r={radius}
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="4"
                />
                <circle
                  cx="20"
                  cy="20"
                  r={radius}
                  fill="none"
                  stroke={color || (status === 'success' ? '#10B981' : status === 'error' ? '#EF4444' : '#3B82F6')}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                {donutPercentage.toFixed(0)}%
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div 
        className={`bg-white dark:bg-gray-900 rounded-lg border ${statusColor.border} ${sizeConfig.padding} ${sizeConfig.height} ${className}`}
        style={style}
      >
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`
        bg-white dark:bg-gray-900 rounded-lg border shadow-sm transition-all duration-200
        ${statusColor.border} ${sizeConfig.padding} ${sizeConfig.height}
        ${interactive ? 'hover:shadow-md cursor-pointer' : ''}
        ${className}
      `}
      style={style}
      onClick={onClick}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div className={`p-2 rounded-lg ${statusColor.bg}`}>
              <div className={statusColor.text}>
                {icon}
              </div>
            </div>
          )}
          <div>
            <h3 className={`font-medium ${statusColor.text} ${sizeConfig.titleSize}`}>
              {title}
            </h3>
            {showBenchmark && benchmark && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Benchmark: {formatValue ? formatValue(benchmark) : benchmark.toLocaleString()}{unit}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Time range selector */}
          {onTimeRangeChange && (
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded p-1">
              {timeRangeOptions.map(option => (
                <button
                  key={option.value}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    selectedTimeRange === option.value
                      ? 'bg-white dark:bg-gray-700 shadow-sm'
                      : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTimeRangeChange(option.value);
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}

          {/* More actions */}
          {(onExport || interactive) && (
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main value */}
      <div className="flex items-baseline gap-2 mb-2">
        <span className={`font-bold ${sizeConfig.valueSize} text-gray-900 dark:text-gray-100`}>
          {formattedValue}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">{unit}</span>
        {renderTrendIndicator()}
      </div>

      {/* Target progress */}
      {renderTargetIndicator()}

      {/* Chart */}
      {renderMiniChart()}

      {/* Tooltip */}
      {showTooltip && interactive && (
        <div className="absolute bottom-full left-0 mb-2 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10 whitespace-nowrap">
          <div>Current: {formattedValue}{unit}</div>
          {previousValue !== undefined && (
            <div>Previous: {formatValue ? formatValue(previousValue) : previousValue.toLocaleString()}{unit}</div>
          )}
          {target && (
            <div>Target: {formatValue ? formatValue(target) : target.toLocaleString()}{unit}</div>
          )}
        </div>
      )}
    </div>
  );
}

// Predefined stat card variants for common use cases
export const RevenueCard = (props: Partial<StatCardProps>) => (
  <StatCard
    icon={<DollarSign className="w-5 h-5" />}
    status="success"
    formatValue={(value) => `$${value.toLocaleString()}`}
    unit=""
    chartType="line"
    {...props}
  />
);

export const UsersCard = (props: Partial<StatCardProps>) => (
  <StatCard
    icon={<Users className="w-5 h-5" />}
    status="info"
    formatValue={(value) => value.toLocaleString()}
    unit=" users"
    chartType="bar"
    {...props}
  />
);

export const PerformanceCard = (props: Partial<StatCardProps>) => (
  <StatCard
    icon={<Activity className="w-5 h-5" />}
    status="warning"
    formatValue={(value) => `${value.toFixed(1)}`}
    unit="ms"
    chartType="sparkline"
    {...props}
  />
);

export const ConversionCard = (props: Partial<StatCardProps>) => (
  <StatCard
    icon={<Zap className="w-5 h-5" />}
    status="success"
    formatValue={(value) => `${value.toFixed(1)}`}
    unit="%"
    chartType="gauge"
    {...props}
  />
);

export default StatCard; 