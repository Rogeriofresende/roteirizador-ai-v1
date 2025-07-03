import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonGridOption {
  value: string;
  label: string;
  icon?: string;
  description?: string;
  color?: string;
}

interface ButtonGridProps {
  options: ButtonGridOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  columns?: 2 | 3 | 4 | 6;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ButtonGrid: React.FC<ButtonGridProps> = ({
  options,
  value,
  onChange,
  disabled = false,
  columns = 3,
  size = 'md',
  className
}) => {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
    6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6'
  };

  const buttonSizes = {
    sm: 'min-h-[60px] p-3 text-sm',
    md: 'min-h-[80px] p-4 text-sm',
    lg: 'min-h-[100px] p-5 text-base'
  };

  const getButtonClasses = (option: ButtonGridOption) => {
    const isSelected = value === option.value;
    
    const baseClasses = `
      relative border-2 rounded-xl font-medium text-center
      transition-all duration-300 ease-out
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50
      flex flex-col items-center justify-center gap-2
      group overflow-hidden cursor-pointer
      ${buttonSizes[size]}
    `;
    
    if (disabled) {
      return cn(baseClasses, 
        'opacity-50 cursor-not-allowed border-border bg-muted text-muted-foreground'
      );
    }
    
    if (isSelected) {
      return cn(baseClasses,
        'border-primary bg-primary/10 text-primary shadow-lg shadow-primary/20',
        'scale-[1.02] ring-2 ring-primary/20',
        'dark:bg-primary/20 dark:border-primary'
      );
    }
    
    return cn(baseClasses,
      'border-border bg-background text-foreground',
      'hover:border-primary/50 hover:bg-primary/5 hover:scale-[1.01]',
      'hover:shadow-md hover:shadow-primary/10',
      'active:scale-[0.98]',
      'dark:border-border dark:bg-card',
      'dark:hover:bg-primary/10 dark:hover:border-primary/30'
    );
  };

  return (
    <div className={cn(`grid gap-3 ${gridCols[columns]}`, className)}>
      {options.map((option) => {
        const isSelected = value === option.value;
        
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => !disabled && onChange(option.value)}
            disabled={disabled}
            aria-pressed={isSelected}
            className={getButtonClasses(option)}
            title={option.description}
          >
            {/* Icon */}
            {option.icon && (
              <div className={cn(
                'text-2xl transition-all duration-300',
                isSelected ? 'scale-110' : 'group-hover:scale-105'
              )}>
                {option.icon}
              </div>
            )}
            
            {/* Label */}
            <span className={cn(
              'font-medium transition-all duration-300 leading-tight',
              size === 'sm' ? 'text-xs' : 'text-sm',
              isSelected && 'font-semibold'
            )}>
              {option.label}
            </span>
            
            {/* Description for larger sizes */}
            {option.description && size === 'lg' && (
              <span className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {option.description}
              </span>
            )}
            
            {/* Selection indicator */}
            {isSelected && (
              <div className="absolute top-2 right-2">
                <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse" />
              </div>
            )}
            
            {/* Hover effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
            
            {/* Ripple effect */}
            <div className="absolute inset-0 rounded-xl overflow-hidden">
              <div className="absolute inset-0 bg-primary/10 transform scale-0 group-active:scale-100 transition-transform duration-200 rounded-xl" />
            </div>
          </button>
        );
      })}
    </div>
  );
}; 