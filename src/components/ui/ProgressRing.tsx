import React from 'react';
import { cn } from '../../lib/utils';

export interface ProgressRingProps {
  value: number; // 0-100
  max?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  strokeWidth?: number;
  showValue?: boolean;
  showLabel?: boolean;
  label?: string;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
  gradient?: boolean;
  animated?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  value,
  max = 100,
  size = 'md',
  strokeWidth,
  showValue = true,
  showLabel = false,
  label,
  color = 'blue',
  gradient = false,
  animated = true,
  className,
  children
}) => {
  // Dimensões baseadas no tamanho
  const dimensions = {
    sm: { width: 60, height: 60, fontSize: 'text-xs' },
    md: { width: 80, height: 80, fontSize: 'text-sm' },
    lg: { width: 120, height: 120, fontSize: 'text-base' },
    xl: { width: 160, height: 160, fontSize: 'text-lg' }
  };

  const { width, height, fontSize } = dimensions[size];
  const defaultStrokeWidth = strokeWidth || (size === 'sm' ? 4 : size === 'md' ? 6 : size === 'lg' ? 8 : 10);
  
  // Cálculos do círculo
  const center = width / 2;
  const radius = center - defaultStrokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Cores baseadas no valor
  const getColor = () => {
    if (color !== 'blue') {
      return {
        blue: 'stroke-blue-500',
        green: 'stroke-green-500',
        yellow: 'stroke-yellow-500',
        red: 'stroke-red-500',
        purple: 'stroke-purple-500',
        gray: 'stroke-gray-500'
      }[color];
    }

    // Cor dinâmica baseada no valor
    if (percentage >= 90) return 'stroke-red-500';
    if (percentage >= 70) return 'stroke-yellow-500';
    return 'stroke-blue-500';
  };

  // Gradiente dinâmico
  const getGradientId = () => `gradient-${color}-${Math.random().toString(36).substr(2, 9)}`;
  const gradientId = gradient ? getGradientId() : '';

  const getGradientColors = () => {
    const gradients = {
      blue: ['#3B82F6', '#1D4ED8'],
      green: ['#10B981', '#059669'],
      yellow: ['#F59E0B', '#D97706'],
      red: ['#EF4444', '#DC2626'],
      purple: ['#8B5CF6', '#7C3AED'],
      gray: ['#6B7280', '#4B5563']
    };
    return gradients[color] || gradients.blue;
  };

  return (
    <div 
      className={cn(
        'relative inline-flex items-center justify-center',
        className
      )}
      style={{ width, height }}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label || `Progress: ${percentage}%`}
    >
      <svg
        width={width}
        height={height}
        className="transform -rotate-90"
        viewBox={`0 0 ${width} ${height}`}
      >
        {/* Definir gradiente se necessário */}
        {gradient && (
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={getGradientColors()[0]} />
              <stop offset="100%" stopColor={getGradientColors()[1]} />
            </linearGradient>
          </defs>
        )}

        {/* Círculo de fundo */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={defaultStrokeWidth}
          className="text-gray-200 dark:text-gray-700"
        />

        {/* Círculo de progresso */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={gradient ? `url(#${gradientId})` : 'currentColor'}
          strokeWidth={defaultStrokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={cn(
            gradient ? '' : getColor(),
            animated && 'transition-all duration-1000 ease-out'
          )}
          style={{
            filter: 'drop-shadow(0 0 6px rgba(0, 0, 0, 0.1))'
          }}
        />

        {/* Ponto indicador no final do progresso */}
        {percentage > 5 && (
          <circle
            cx={center + radius * Math.cos((percentage / 100) * 2 * Math.PI - Math.PI / 2)}
            cy={center + radius * Math.sin((percentage / 100) * 2 * Math.PI - Math.PI / 2)}
            r={defaultStrokeWidth / 3}
            fill={gradient ? `url(#${gradientId})` : 'currentColor'}
            className={cn(
              gradient ? '' : getColor(),
              animated && 'transition-all duration-1000 ease-out'
            )}
            style={{
              filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))'
            }}
          />
        )}
      </svg>

      {/* Conteúdo central */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children || (
          <>
            {showValue && (
              <div className={cn(
                'font-bold leading-none',
                fontSize,
                percentage >= 90 ? 'text-red-600 dark:text-red-400' :
                percentage >= 70 ? 'text-yellow-600 dark:text-yellow-400' :
                'text-blue-600 dark:text-blue-400'
              )}>
                {Math.round(percentage)}%
              </div>
            )}
            
            {showLabel && label && (
              <div className={cn(
                'text-gray-600 dark:text-gray-400 text-center leading-tight mt-1',
                size === 'sm' ? 'text-xs' : 'text-xs'
              )}>
                {label}
              </div>
            )}
          </>
        )}
      </div>

      {/* Brilho animado opcional */}
      {animated && percentage > 0 && (
        <div 
          className="absolute inset-0 rounded-full animate-pulse"
          style={{
            background: `conic-gradient(from 0deg, transparent ${(100-percentage)*3.6}deg, rgba(59, 130, 246, 0.1) ${percentage*3.6}deg, transparent ${percentage*3.6 + 20}deg)`,
            animation: percentage === 100 ? 'spin 2s linear infinite' : undefined
          }}
        />
      )}
    </div>
  );
};

// Componente com múltiplos anéis
export interface MultiProgressRingProps {
  rings: Array<{
    value: number;
    max?: number;
    color: ProgressRingProps['color'];
    label?: string;
  }>;
  size?: ProgressRingProps['size'];
  className?: string;
  showLegend?: boolean;
}

export const MultiProgressRing: React.FC<MultiProgressRingProps> = ({
  rings,
  size = 'lg',
  className,
  showLegend = true
}) => {
  const dimensions = {
    sm: 80,
    md: 100,
    lg: 140,
    xl: 180
  };

  const diameter = dimensions[size];
  const center = diameter / 2;
  const strokeWidth = size === 'sm' ? 6 : size === 'md' ? 8 : size === 'lg' ? 10 : 12;
  const spacing = strokeWidth + 4;

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      <div className="relative" style={{ width: diameter, height: diameter }}>
        <svg
          width={diameter}
          height={diameter}
          className="transform -rotate-90"
          viewBox={`0 0 ${diameter} ${diameter}`}
        >
          {rings.map((ring, index) => {
            const radius = center - strokeWidth / 2 - (spacing * index);
            const circumference = 2 * Math.PI * radius;
            const percentage = Math.min(100, Math.max(0, (ring.value / (ring.max || 100)) * 100));
            const strokeDasharray = circumference;
            const strokeDashoffset = circumference - (percentage / 100) * circumference;

            const colors = {
              blue: 'stroke-blue-500',
              green: 'stroke-green-500',
              yellow: 'stroke-yellow-500',
              red: 'stroke-red-500',
              purple: 'stroke-purple-500',
              gray: 'stroke-gray-500'
            };

            return (
              <g key={index}>
                {/* Círculo de fundo */}
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                  className="text-gray-200 dark:text-gray-700"
                />

                {/* Círculo de progresso */}
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className={cn(
                    colors[ring.color],
                    'transition-all duration-1000 ease-out'
                  )}
                />
              </g>
            );
          })}
        </svg>

        {/* Valores centrais */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {Math.round(rings.reduce((sum, ring) => sum + ring.value, 0) / rings.length)}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Média
            </div>
          </div>
        </div>
      </div>

      {/* Legenda */}
      {showLegend && (
        <div className="flex flex-wrap justify-center gap-3">
          {rings.map((ring, index) => {
            const colors = {
              blue: 'bg-blue-500',
              green: 'bg-green-500',
              yellow: 'bg-yellow-500',
              red: 'bg-red-500',
              purple: 'bg-purple-500',
              gray: 'bg-gray-500'
            };

            return (
              <div key={index} className="flex items-center gap-2">
                <div className={cn('w-3 h-3 rounded-full', colors[ring.color])} />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {ring.label}: {Math.round((ring.value / (ring.max || 100)) * 100)}%
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}; 