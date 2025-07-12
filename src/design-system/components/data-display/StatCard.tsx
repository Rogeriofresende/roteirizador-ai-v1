/**
 * 📊 StatCard Component - Metric Visualization
 * 
 * Comprehensive stat card component for displaying metrics with trends and comparisons
 * Interactive charts, animations, and real-time data support
 * 
 * Part of: WEEK 0 Days 3-4 - IA Beta Advanced Components Task 2.4
 * Integration: Design tokens + Migration patterns + Alpha cost tiers + Charlie monitoring
 */

import React, { 
  forwardRef, 
  ReactNode, 
  useState, 
  useEffect, 
  useRef,
  HTMLAttributes 
} from 'react';
import { colors, spacing, typography, borderRadius, shadows, transitions } from '../../tokens';
import { familiarElements } from '../../migration-patterns';
import { screenReaderSupport } from '../../accessibility';

// ============================================================================
// STATCARD TYPES & INTERFACES
// ============================================================================

export interface StatCardTrend {
  value: number;
  percentage: number;
  direction: 'up' | 'down' | 'neutral';
  period: string;
  isPositive?: boolean;
}

export interface StatCardChart {
  type: 'line' | 'bar' | 'area' | 'donut' | 'sparkline';
  data: Array<{ label: string; value: number; color?: string }>;
  height?: number;
  showLabels?: boolean;
  showGrid?: boolean;
  animation?: boolean;
}

export interface StatCardAction {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
}

export interface StatCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Card title */
  title: string;
  
  /** Main value */
  value: string | number;
  
  /** Value unit */
  unit?: string;
  
  /** Card description */
  description?: string;
  
  /** Trend information */
  trend?: StatCardTrend;
  
  /** Chart data */
  chart?: StatCardChart;
  
  /** Card icon */
  icon?: ReactNode;
  
  /** Card variant */
  variant?: 'default' | 'outlined' | 'filled' | 'gradient' | 'minimal';
  
  /** Card size */
  size?: 'small' | 'medium' | 'large';
  
  /** Card color theme */
  colorTheme?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'custom';
  
  /** Custom color */
  customColor?: string;
  
  /** Loading state */
  loading?: boolean;
  
  /** Error state */
  error?: string;
  
  /** Show comparison */
  comparison?: {
    value: string | number;
    label: string;
    trend?: StatCardTrend;
  };
  
  /** Interactive card */
  interactive?: boolean;
  
  /** Card actions */
  actions?: StatCardAction[];
  
  /** Show refresh button */
  refreshable?: boolean;
  
  /** Auto refresh interval (ms) */
  autoRefresh?: number;
  
  /** Animate value changes */
  animateValue?: boolean;
  
  /** Value format function */
  formatValue?: (value: string | number) => string;
  
  /** Migration mode for styling */
  migrationMode?: 'familiar' | 'enhanced';
  
  /** Cost tier for Alpha integration */
  costTier?: 'free' | 'premium';
  
  /** Analytics tracking for Charlie integration */
  trackingId?: string;
  
  /** Custom value renderer */
  valueRenderer?: (value: string | number, unit?: string) => ReactNode;
  
  /** Custom trend renderer */
  trendRenderer?: (trend: StatCardTrend) => ReactNode;
  
  /** Callback when card is clicked */
  onCardClick?: () => void;
  
  /** Callback when refresh is triggered */
  onRefresh?: () => void;
  
  /** Callback when chart point is clicked */
  onChartPointClick?: (dataPoint: { label: string; value: number }, index: number) => void;
}

// ============================================================================
// STATCARD STYLES
// ============================================================================

const getStatCardStyles = (
  variant: StatCardProps['variant'] = 'default',
  size: StatCardProps['size'] = 'medium',
  colorTheme: StatCardProps['colorTheme'] = 'default',
  customColor: string | undefined,
  migrationMode: StatCardProps['migrationMode'] = 'enhanced',
  costTier: StatCardProps['costTier'] = 'free',
  interactive: boolean = false
): React.CSSProperties => {
  
  // Size configurations
  const sizeConfig = {
    small: {
      padding: spacing[3],
      titleSize: typography.fontSize.sm,
      valueSize: typography.fontSize.xl,
      descSize: typography.fontSize.xs
    },
    medium: {
      padding: spacing[4],
      titleSize: typography.fontSize.base,
      valueSize: typography.fontSize['2xl'],
      descSize: typography.fontSize.sm
    },
    large: {
      padding: spacing[6],
      titleSize: typography.fontSize.lg,
      valueSize: typography.fontSize['3xl'],
      descSize: typography.fontSize.base
    }
  };
  
  const config = sizeConfig[size];
  
  // Color theme configurations
  const themeColors = {
    default: {
      background: 'white',
      border: colors.neutral[200],
      primary: costTier === 'premium' ? colors.costTier.premium.primary : colors.primary[500],
      accent: costTier === 'premium' ? colors.costTier.premium.background : colors.primary[50]
    },
    success: {
      background: 'white',
      border: colors.success[200],
      primary: colors.success[500],
      accent: colors.success[50]
    },
    warning: {
      background: 'white',
      border: colors.warning[200],
      primary: colors.warning[500],
      accent: colors.warning[50]
    },
    error: {
      background: 'white',
      border: colors.error[200],
      primary: colors.error[500],
      accent: colors.error[50]
    },
    info: {
      background: 'white',
      border: colors.primary[200],
      primary: colors.primary[500],
      accent: colors.primary[50]
    },
    custom: {
      background: 'white',
      border: customColor ? `${customColor}33` : colors.neutral[200],
      primary: customColor || colors.neutral[500],
      accent: customColor ? `${customColor}1A` : colors.neutral[50]
    }
  };
  
  const theme = themeColors[colorTheme];
  
  // Base styles
  const baseStyles: React.CSSProperties = {
    position: 'relative',
    padding: config.padding,
    borderRadius: migrationMode === 'familiar' ? borderRadius.base : borderRadius.lg,
    transition: transitions.common.all,
    cursor: interactive ? 'pointer' : 'default',
    overflow: 'hidden'
  };
  
  // Variant styles
  const variantStyles: Record<string, React.CSSProperties> = {
    default: {
      ...baseStyles,
      backgroundColor: theme.background,
      border: `1px solid ${theme.border}`,
      boxShadow: migrationMode === 'enhanced' ? shadows.sm : 'none'
    },
    outlined: {
      ...baseStyles,
      backgroundColor: 'transparent',
      border: `2px solid ${theme.border}`,
      boxShadow: 'none'
    },
    filled: {
      ...baseStyles,
      backgroundColor: theme.accent,
      border: `1px solid ${theme.border}`,
      boxShadow: 'none'
    },
    gradient: {
      ...baseStyles,
      background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.primary}20 100%)`,
      border: `1px solid ${theme.border}`,
      boxShadow: migrationMode === 'enhanced' ? shadows.md : 'none'
    },
    minimal: {
      ...baseStyles,
      backgroundColor: 'transparent',
      border: 'none',
      boxShadow: 'none',
      padding: spacing[2]
    }
  };
  
  return variantStyles[variant];
};

// ============================================================================
// STATCARD COMPONENT
// ============================================================================

export const StatCard = forwardRef<HTMLDivElement, StatCardProps>(
  ({
    title,
    value,
    unit,
    description,
    trend,
    chart,
    icon,
    variant = 'default',
    size = 'medium',
    colorTheme = 'default',
    customColor,
    loading = false,
    error,
    comparison,
    interactive = false,
    actions = [],
    refreshable = false,
    autoRefresh,
    animateValue = false,
    formatValue,
    migrationMode = 'enhanced',
    costTier = 'free',
    trackingId,
    valueRenderer,
    trendRenderer,
    onCardClick,
    onRefresh,
    onChartPointClick,
    className = '',
    ...props
  }, ref) => {
    
    const [animatedValue, setAnimatedValue] = useState<string | number>(value);
    const [isHovered, setIsHovered] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    
    const cardRef = useRef<HTMLDivElement>(null);
    const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
    
    // Animate value changes
    useEffect(() => {
      if (!animateValue) {
        setAnimatedValue(value);
        return;
      }
      
      const numericValue = typeof value === 'number' ? value : parseFloat(String(value)) || 0;
      const currentValue = typeof animatedValue === 'number' ? animatedValue : parseFloat(String(animatedValue)) || 0;
      
      if (numericValue === currentValue) return;
      
      const duration = 1000; // 1 second
      const steps = 30;
      const stepValue = (numericValue - currentValue) / steps;
      let step = 0;
      
      const interval = setInterval(() => {
        step++;
        const newValue = currentValue + (stepValue * step);
        
        if (step >= steps) {
          setAnimatedValue(numericValue);
          clearInterval(interval);
        } else {
          setAnimatedValue(Math.round(newValue * 100) / 100);
        }
      }, duration / steps);
      
      return () => clearInterval(interval);
    }, [value, animateValue]);
    
    // Auto refresh
    useEffect(() => {
      if (autoRefresh && autoRefresh > 0) {
        refreshIntervalRef.current = setInterval(() => {
          onRefresh?.();
        }, autoRefresh);
        
        return () => {
          if (refreshIntervalRef.current) {
            clearInterval(refreshIntervalRef.current);
          }
        };
      }
    }, [autoRefresh, onRefresh]);
    
    // Handle card click
    const handleCardClick = () => {
      if (!interactive) return;
      
      // Analytics tracking
      if (trackingId && typeof window !== 'undefined') {
        const trackingData = {
          component: 'StatCard',
          action: 'card_clicked',
          title,
          value: animatedValue,
          variant,
          colorTheme,
          migrationMode,
          costTier,
          trackingId,
          timestamp: new Date().toISOString()
        };
        
        window.dispatchEvent(new CustomEvent('design-system-interaction', {
          detail: trackingData
        }));
      }
      
      onCardClick?.();
    };
    
    // Handle refresh
    const handleRefresh = async () => {
      if (refreshing) return;
      
      setRefreshing(true);
      
      try {
        await onRefresh?.();
      } finally {
        setTimeout(() => {
          setRefreshing(false);
        }, 500);
      }
    };
    
    // Format value
    const getFormattedValue = () => {
      if (formatValue) {
        return formatValue(animatedValue);
      }
      
      if (typeof animatedValue === 'number') {
        return animatedValue.toLocaleString('pt-BR');
      }
      
      return String(animatedValue);
    };
    
    // Render trend indicator
    const renderTrend = () => {
      if (!trend) return null;
      
      if (trendRenderer) {
        return trendRenderer(trend);
      }
      
      const trendColor = trend.isPositive !== undefined ? 
        (trend.isPositive ? colors.success[500] : colors.error[500]) :
        (trend.direction === 'up' ? colors.success[500] : 
         trend.direction === 'down' ? colors.error[500] : 
         colors.neutral[500]);
      
      const trendIcon = trend.direction === 'up' ? '↗' : 
                       trend.direction === 'down' ? '↘' : 
                       '→';
      
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing[1],
          fontSize: typography.fontSize.sm,
          color: trendColor,
          fontWeight: typography.fontWeight.medium
        }}>
          <span>{trendIcon}</span>
          <span>{Math.abs(trend.percentage)}%</span>
          <span style={{ 
            color: colors.neutral[500],
            fontWeight: typography.fontWeight.normal
          }}>
            {trend.period}
          </span>
        </div>
      );
    };
    
    // Render simple chart
    const renderChart = () => {
      if (!chart) return null;
      
      const chartHeight = chart.height || 60;
      const maxValue = Math.max(...chart.data.map(d => d.value));
      
      if (chart.type === 'sparkline') {
        const points = chart.data.map((point, index) => {
          const x = (index / (chart.data.length - 1)) * 100;
          const y = 100 - (point.value / maxValue) * 100;
          return `${x},${y}`;
        }).join(' ');
        
        return (
          <div style={{ height: chartHeight, marginTop: spacing[2] }}>
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polyline
                points={points}
                fill="none"
                stroke={customColor || (costTier === 'premium' ? colors.costTier.premium.primary : colors.primary[500])}
                strokeWidth="2"
                style={{ transition: transitions.common.all }}
              />
            </svg>
          </div>
        );
      }
      
      if (chart.type === 'bar') {
        return (
          <div style={{
            display: 'flex',
            alignItems: 'end',
            gap: spacing[1],
            height: chartHeight,
            marginTop: spacing[2]
          }}>
            {chart.data.map((point, index) => (
              <div
                key={index}
                style={{
                  flex: 1,
                  height: `${(point.value / maxValue) * 100}%`,
                  backgroundColor: point.color || customColor || 
                    (costTier === 'premium' ? colors.costTier.premium.primary : colors.primary[500]),
                  borderRadius: `${borderRadius.sm} ${borderRadius.sm} 0 0`,
                  transition: transitions.common.all,
                  cursor: onChartPointClick ? 'pointer' : 'default'
                }}
                onClick={() => onChartPointClick?.(point, index)}
                title={`${point.label}: ${point.value}`}
              />
            ))}
          </div>
        );
      }
      
      return null;
    };
    
    // Render comparison
    const renderComparison = () => {
      if (!comparison) return null;
      
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: spacing[3],
          padding: spacing[2],
          backgroundColor: colors.neutral[50],
          borderRadius: borderRadius.sm,
          fontSize: typography.fontSize.sm
        }}>
          <div>
            <div style={{ color: colors.neutral[600] }}>{comparison.label}</div>
            <div style={{ 
              fontWeight: typography.fontWeight.semibold,
              color: colors.neutral[900]
            }}>
              {formatValue ? formatValue(comparison.value) : comparison.value}
            </div>
          </div>
          
          {comparison.trend && (
            <div style={{ fontSize: typography.fontSize.xs }}>
              {renderTrend()}
            </div>
          )}
        </div>
      );
    };
    
    // Render actions
    const renderActions = () => {
      if (actions.length === 0 && !refreshable) return null;
      
      return (
        <div style={{
          display: 'flex',
          gap: spacing[2],
          marginTop: spacing[3],
          flexWrap: 'wrap'
        }}>
          {actions.map((action, index) => (
            <button
              key={index}
              disabled={action.disabled}
              onClick={action.onClick}
              style={{
                padding: `${spacing[1]} ${spacing[2]}`,
                backgroundColor: action.variant === 'primary' ? 
                  (customColor || (costTier === 'premium' ? colors.costTier.premium.primary : colors.primary[500])) :
                  action.variant === 'secondary' ? colors.neutral[100] : 'transparent',
                color: action.variant === 'primary' ? 'white' :
                       action.variant === 'secondary' ? colors.neutral[700] :
                       (customColor || (costTier === 'premium' ? colors.costTier.premium.primary : colors.primary[500])),
                border: action.variant === 'ghost' ? 
                  `1px solid ${customColor || (costTier === 'premium' ? colors.costTier.premium.primary : colors.primary[500])}` : 
                  'none',
                borderRadius: borderRadius.sm,
                cursor: action.disabled ? 'not-allowed' : 'pointer',
                opacity: action.disabled ? 0.5 : 1,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                display: 'flex',
                alignItems: 'center',
                gap: spacing[1],
                transition: transitions.common.all
              }}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
          
          {refreshable && (
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              style={{
                padding: spacing[1],
                backgroundColor: 'transparent',
                border: 'none',
                cursor: refreshing ? 'not-allowed' : 'pointer',
                borderRadius: borderRadius.sm,
                color: colors.neutral[500],
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: transitions.common.all,
                transform: refreshing ? 'rotate(360deg)' : 'rotate(0deg)'
              }}
              title="Atualizar"
            >
              🔄
            </button>
          )}
        </div>
      );
    };
    
    const cardStyles = getStatCardStyles(
      variant,
      size,
      colorTheme,
      customColor,
      migrationMode,
      costTier,
      interactive
    );
    
    if (loading) {
      return (
        <div
          ref={ref}
          className={`design-system-stat-card ${className}`}
          style={{
            ...cardStyles,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '120px'
          }}
        >
          <div style={{
            width: '32px',
            height: '32px',
            border: '3px solid transparent',
            borderTop: `3px solid ${customColor || (costTier === 'premium' ? colors.costTier.premium.primary : colors.primary[500])}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        </div>
      );
    }
    
    if (error) {
      return (
        <div
          ref={ref}
          className={`design-system-stat-card ${className}`}
          style={{
            ...cardStyles,
            borderColor: colors.error[200],
            backgroundColor: colors.error[50]
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2],
            color: colors.error[600],
            fontSize: typography.fontSize.sm
          }}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        </div>
      );
    }
    
    return (
      <div
        ref={ref}
        className={`design-system-stat-card ${className}`}
        style={{
          ...cardStyles,
          transform: interactive && isHovered ? 'translateY(-2px)' : 'translateY(0)',
          boxShadow: interactive && isHovered ? shadows.lg : cardStyles.boxShadow
        }}
        onClick={handleCardClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        data-variant={variant}
        data-size={size}
        data-color-theme={colorTheme}
        data-migration-mode={migrationMode}
        data-cost-tier={costTier}
        data-tracking-id={trackingId}
        {...props}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: spacing[2]
        }}>
          <div style={{ flex: 1 }}>
            <h3 style={{
              margin: 0,
              fontSize: size === 'small' ? typography.fontSize.sm : 
                       size === 'large' ? typography.fontSize.lg : 
                       typography.fontSize.base,
              fontWeight: typography.fontWeight.medium,
              color: colors.neutral[600],
              lineHeight: typography.lineHeight.tight
            }}>
              {title}
            </h3>
          </div>
          
          {icon && (
            <div style={{
              fontSize: size === 'small' ? '18px' : size === 'large' ? '28px' : '24px',
              color: customColor || (costTier === 'premium' ? colors.costTier.premium.primary : colors.primary[500]),
              opacity: 0.8
            }}>
              {icon}
            </div>
          )}
        </div>
        
        {/* Value */}
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: spacing[1],
          marginBottom: spacing[1]
        }}>
          {valueRenderer ? (
            valueRenderer(animatedValue, unit)
          ) : (
            <>
              <span style={{
                fontSize: size === 'small' ? typography.fontSize.xl : 
                         size === 'large' ? typography.fontSize['3xl'] : 
                         typography.fontSize['2xl'],
                fontWeight: typography.fontWeight.bold,
                color: colors.neutral[900],
                lineHeight: typography.lineHeight.none
              }}>
                {getFormattedValue()}
              </span>
              {unit && (
                <span style={{
                  fontSize: typography.fontSize.sm,
                  color: colors.neutral[500],
                  fontWeight: typography.fontWeight.normal
                }}>
                  {unit}
                </span>
              )}
            </>
          )}
        </div>
        
        {/* Trend */}
        {trend && (
          <div style={{ marginBottom: spacing[2] }}>
            {renderTrend()}
          </div>
        )}
        
        {/* Description */}
        {description && (
          <p style={{
            margin: 0,
            fontSize: size === 'small' ? typography.fontSize.xs : typography.fontSize.sm,
            color: colors.neutral[600],
            lineHeight: typography.lineHeight.relaxed,
            marginBottom: spacing[2]
          }}>
            {description}
          </p>
        )}
        
        {/* Chart */}
        {renderChart()}
        
        {/* Comparison */}
        {renderComparison()}
        
        {/* Actions */}
        {renderActions()}
      </div>
    );
  }
);

StatCard.displayName = 'StatCard';

// ============================================================================
// STATCARD HOOKS
// ============================================================================

export const useStatCard = (initialValue: string | number = 0) => {
  const [value, setValue] = useState<string | number>(initialValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trend, setTrend] = useState<StatCardTrend | null>(null);
  
  const updateValue = (newValue: string | number) => {
    setValue(newValue);
  };
  
  const updateTrend = (newTrend: StatCardTrend) => {
    setTrend(newTrend);
  };
  
  const refresh = async (fetchFunction: () => Promise<{ value: string | number; trend?: StatCardTrend }>) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchFunction();
      setValue(result.value);
      if (result.trend) {
        setTrend(result.trend);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };
  
  return {
    value,
    loading,
    error,
    trend,
    setValue: updateValue,
    setLoading,
    setError,
    setTrend: updateTrend,
    refresh
  };
};

// ============================================================================
// EXPORT ALL STATCARD COMPONENTS
// ============================================================================

export default StatCard;

export {
  type StatCardProps,
  type StatCardTrend,
  type StatCardChart,
  type StatCardAction
}; 