/**
 * 🔲 BUTTON GRID - V7.5 Enhanced Professional Button Grid Component
 * Componente de grade de botões profissional seguindo metodologia V7.5 Enhanced
 * Enhanced with Lucide React icons, validation states, and professional styling
 */

import React from 'react';
import { cn } from '../../lib/utils';

// V7.5 Enhanced Design System Imports
import { Layout } from '../../design-system/components/Layout';

// V7.5 Enhanced Icons
import { 
  CheckCircle2, 
  AlertCircle, 
  Info,
  Sparkles,
  Zap,
  Grid3X3,
  ArrowRight
} from 'lucide-react';

interface ButtonGridOption {
  value: string;
  label: string;
  icon?: React.ReactNode | string; // V7.5 Enhanced: Support both Lucide React components and legacy strings
  description?: string;
  color?: string;
  disabled?: boolean; // V7.5 Enhanced: Per-option disabled state
}

interface ButtonGridProps {
  options: ButtonGridOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  columns?: 2 | 3 | 4 | 6;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string; // V7.5 Enhanced: Optional label
  required?: boolean; // V7.5 Enhanced: Required indicator
  error?: string; // V7.5 Enhanced: Error state
  success?: boolean; // V7.5 Enhanced: Success state
  helperText?: string; // V7.5 Enhanced: Helper text
  variant?: 'default' | 'outlined' | 'filled' | 'minimal'; // V7.5 Enhanced: Style variants
  showSelectionCount?: boolean; // V7.5 Enhanced: Show selection indicator
  searchable?: boolean; // V7.5 Enhanced: Future feature indicator
}

export const ButtonGrid: React.FC<ButtonGridProps> = ({
  options,
  value,
  onChange,
  disabled = false,
  columns = 3,
  size = 'md',
  className,
  label,
  required = false,
  error,
  success = false,
  helperText,
  variant = 'default',
  showSelectionCount = false,
  searchable = false
}) => {
  // V7.5 Enhanced Validation State
  const validationState = error ? 'error' : success ? 'success' : 'neutral';
  
  // V7.5 Enhanced Selection Count
  const selectedCount = value ? 1 : 0;
  const totalCount = options.length;

  // V7.5 Enhanced Grid Classes (maintained from legacy)
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
    6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6'
  };

  // V7.5 Enhanced Button Sizes (maintained from legacy)
  const buttonSizes = {
    sm: 'min-h-[60px] p-3 text-sm',
    md: 'min-h-[80px] p-4 text-sm',
    lg: 'min-h-[100px] p-5 text-base'
  };

  // V7.5 Enhanced Variant Classes
  const variantClasses = {
    default: 'bg-background border-border',
    outlined: 'bg-transparent border-primary-300',
    filled: 'bg-neutral-50 border-neutral-200',
    minimal: 'bg-transparent border-transparent'
  };

  // V7.5 Enhanced Button Classes (enhanced from legacy)
  const getButtonClasses = (option: ButtonGridOption) => {
    const isSelected = value === option.value;
    const isOptionDisabled = disabled || option.disabled;
    
    const baseClasses = `
      relative border-2 rounded-xl font-medium text-center
      transition-all duration-300 ease-out
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50
      flex flex-col items-center justify-center gap-2
      group overflow-hidden cursor-pointer
      ${buttonSizes[size]}
      ${variantClasses[variant]}
    `;
    
    if (isOptionDisabled) {
      return cn(baseClasses, 
        'opacity-50 cursor-not-allowed border-neutral-300 bg-neutral-100 text-neutral-400'
      );
    }
    
    // V7.5 Enhanced Validation State Classes
    if (validationState === 'error') {
      return cn(baseClasses,
        isSelected 
          ? 'border-error-500 bg-error-50 text-error-700 shadow-lg shadow-error-500/20'
          : 'border-error-300 hover:border-error-400 hover:bg-error-50'
      );
    }
    
    if (validationState === 'success') {
      return cn(baseClasses,
        isSelected 
          ? 'border-success-500 bg-success-50 text-success-700 shadow-lg shadow-success-500/20'
          : 'border-success-300 hover:border-success-400 hover:bg-success-50'
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
      'hover:border-primary/50 hover:bg-primary/5 hover:scale-[1.01]',
      'hover:shadow-md hover:shadow-primary/10',
      'active:scale-[0.98]',
      'dark:border-border dark:bg-card',
      'dark:hover:bg-primary/10 dark:hover:border-primary/30'
    );
  };

  // V7.5 Enhanced Icon Renderer
  const renderIcon = (icon: React.ReactNode | string | undefined) => {
    if (!icon) return null;
    
    // V7.5 Enhanced: Support for Lucide React components
    if (typeof icon === 'object') {
      return (
        <div className="text-2xl transition-all duration-300 group-hover:scale-105">
          {icon}
        </div>
      );
    }
    
    // Legacy string support maintained
    return (
      <div className="text-2xl transition-all duration-300 group-hover:scale-105">
        {icon}
      </div>
    );
  };

  // V7.5 Enhanced Validation Icon Component
  const ValidationIcon = () => {
    if (validationState === 'error') {
      return <AlertCircle className="w-4 h-4 text-error-500" />;
    }
    if (validationState === 'success') {
      return <CheckCircle2 className="w-4 h-4 text-success-500" />;
    }
    if (helperText && validationState === 'neutral') {
      return <Info className="w-3 h-3 text-neutral-400" />;
    }
    return null;
  };

  return (
    <Layout.Section spacing="compact" className="w-full">
      
      {/* V7.5 Enhanced Label & Header */}
      {label && (
        <div className="mb-4">
          <Layout.Heading level={5} className="flex items-center gap-2 mb-2">
            <Grid3X3 className="w-4 h-4 text-primary-600" />
            {label}
            {required && <span className="text-error-500">*</span>}
          </Layout.Heading>
          
          {/* V7.5 Enhanced Selection Count */}
          {showSelectionCount && (
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <CheckCircle2 className="w-4 h-4" />
              <span>{selectedCount}/{totalCount} selected</span>
            </div>
          )}
        </div>
      )}

      {/* V7.5 Enhanced Button Grid */}
      <div className={cn(`grid gap-3 ${gridCols[columns]}`, className)}>
        {options.map((option) => {
          const isSelected = value === option.value;
          const isOptionDisabled = disabled || option.disabled;
          
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => !isOptionDisabled && onChange(option.value)}
              disabled={isOptionDisabled}
              aria-pressed={isSelected}
              aria-describedby={error ? `${option.value}-error` : undefined}
              className={getButtonClasses(option)}
              title={option.description}
            >
              {/* V7.5 Enhanced Icon */}
              {renderIcon(option.icon)}
              
              {/* V7.5 Enhanced Label */}
              <span className={cn(
                'font-medium transition-all duration-300 leading-tight',
                size === 'sm' ? 'text-xs' : 'text-sm',
                isSelected && 'font-semibold'
              )}>
                {option.label}
              </span>
              
              {/* V7.5 Enhanced Description for larger sizes */}
              {option.description && size === 'lg' && (
                <span className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {option.description}
                </span>
              )}
              
              {/* V7.5 Enhanced Selection indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <div className={cn(
                    'w-2.5 h-2.5 rounded-full animate-pulse',
                    validationState === 'error' ? 'bg-error-500' :
                    validationState === 'success' ? 'bg-success-500' :
                    'bg-primary'
                  )} />
                </div>
              )}
              
              {/* V7.5 Enhanced Validation indicator */}
              {validationState !== 'neutral' && (
                <div className="absolute top-2 left-2">
                  <ValidationIcon />
                </div>
              )}
              
              {/* Hover effect overlay (maintained from legacy) */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
              
              {/* Ripple effect (maintained from legacy) */}
              <div className="absolute inset-0 rounded-xl overflow-hidden">
                <div className="absolute inset-0 bg-primary/10 transform scale-0 group-active:scale-100 transition-transform duration-200 rounded-xl" />
              </div>
            </button>
          );
        })}
      </div>

      {/* V7.5 Enhanced Helper/Error Text */}
      {(error || helperText) && (
        <div className="mt-3 flex items-start gap-2">
          {error && (
            <Layout.Text 
              variant="bodySmall" 
              color="error" 
              className="flex items-center gap-1"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </Layout.Text>
          )}
          
          {!error && helperText && (
            <Layout.Text 
              variant="bodySmall" 
              color="muted" 
              className="flex items-center gap-1"
            >
              <Info className="w-4 h-4 flex-shrink-0" />
              {helperText}
            </Layout.Text>
          )}
        </div>
      )}

      {/* V7.5 Enhanced Success Feedback */}
      {success && !error && value && (
        <div className="mt-3">
          <Layout.Text 
            variant="bodySmall" 
            color="success"
            className="flex items-center gap-1"
          >
            <CheckCircle2 className="w-4 h-4" />
            Perfect selection!
          </Layout.Text>
        </div>
      )}

      {/* V7.5 Enhanced Feature Indicators */}
      {(showSelectionCount || searchable || required) && (
        <div className="mt-2 flex items-center gap-3 text-xs text-neutral-400">
          {showSelectionCount && (
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Selection tracking</span>
            </div>
          )}
          {searchable && (
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              <span>Searchable</span>
            </div>
          )}
          {required && (
            <div className="flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              <span>Required field</span>
            </div>
          )}
        </div>
      )}

    </Layout.Section>
  );
}; 