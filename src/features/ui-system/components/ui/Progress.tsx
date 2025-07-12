/**
 * 📊 PROGRESS COMPONENT
 * Simple progress bar component for visual feedback
 */

import React from 'react';
import { cn } from '../../lib/utils';

interface ProgressProps {
  value: number; // 0-100
  max?: number;
  className?: string;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'green' | 'blue' | 'red' | 'yellow';
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  className,
  showValue = false,
  size = 'md',
  color = 'primary'
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  const colorClasses = {
    primary: 'bg-primary',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500'
  };

  return (
    <div className={cn('w-full', className)}>
      <div 
        className={cn(
          'w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden',
          sizeClasses[size]
        )}
      >
        <div
          className={cn(
            'transition-all duration-300 ease-out rounded-full',
            colorClasses[color],
            sizeClasses[size]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {showValue && (
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{Math.round(percentage)}%</span>
          <span>{value}/{max}</span>
        </div>
      )}
    </div>
  );
};

export default Progress; 