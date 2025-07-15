import React from 'react';
import { cn } from '../../lib/utils';

// Simple Badge Props
export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
}

// Badge Variants
const badgeVariants = {
  default: 'bg-blue-100 text-blue-800 border border-blue-200',
  secondary: 'bg-gray-100 text-gray-800 border border-gray-200',
  destructive: 'bg-red-100 text-red-800 border border-red-200',
  outline: 'border border-gray-300 bg-transparent text-gray-700',
  success: 'bg-green-100 text-green-800 border border-green-200',
  warning: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  info: 'bg-blue-100 text-blue-800 border border-blue-200'
};

// Badge Sizes
const badgeSizes = {
  xs: 'px-1.5 py-0.5 text-xs',
  sm: 'px-2 py-0.5 text-sm',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base'
};

// Main Badge Component
export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  size = 'sm',
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-md font-medium transition-colors',
        badgeVariants[variant],
        badgeSizes[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Default export for compatibility
export default Badge; 