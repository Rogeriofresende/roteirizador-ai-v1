/**
 * 📝 Input Component - Design System Foundation
 * 
 * Migration-friendly input with validation, accessibility and cost tier integration
 * Supporting Text, Email, Password types with familiar/enhanced modes
 * 
 * Part of: WEEK 0 Days 3-4 - IA Beta Core Component Library
 * Integration: Design tokens + Migration patterns + Alpha cost tiers + Charlie monitoring
 */

import React, { forwardRef, InputHTMLAttributes, ReactNode, useState, useCallback } from 'react';
import { colors, spacing, typography, borderRadius, shadows, transitions } from '../tokens';
import { familiarElements } from '../migration-patterns';
import { formAccessibility, screenReaderSupport } from '../accessibility';

// ============================================================================
// INPUT TYPES & INTERFACES
// ============================================================================

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Input visual variant */
  variant?: 'default' | 'outlined' | 'filled';
  
  /** Input size */
  size?: 'small' | 'medium' | 'large';
  
  /** Migration mode - familiar preserves existing look, enhanced adds improvements */
  migrationMode?: 'familiar' | 'enhanced';
  
  /** Label text */
  label?: string;
  
  /** Helper text displayed below input */
  helperText?: string;
  
  /** Error message */
  error?: string;
  
  /** Success message */
  success?: string;
  
  /** Icon to display before input */
  startIcon?: ReactNode;
  
  /** Icon to display after input */
  endIcon?: ReactNode;
  
  /** Loading state */
  loading?: boolean;
  
  /** Full width input */
  fullWidth?: boolean;
  
  /** Cost tier for Alpha integration */
  costTier?: 'free' | 'premium';
  
  /** Analytics tracking for Charlie integration */
  trackingId?: string;
  
  /** Migration tooltip content */
  migrationTooltip?: string;
  
  /** Required field indicator */
  required?: boolean;
  
  /** Show character count */
  showCharCount?: boolean;
  
  /** Maximum character count */
  maxLength?: number;
}

export interface InputStyleProps {
  variant: InputProps['variant'];
  size: InputProps['size'];
  migrationMode: InputProps['migrationMode'];
  disabled: boolean;
  error: boolean;
  success: boolean;
  focused: boolean;
  fullWidth: boolean;
  costTier: InputProps['costTier'];
}

// ============================================================================
// INPUT STYLES
// ============================================================================

const getInputStyles = ({
  variant = 'default',
  size = 'medium',
  migrationMode = 'enhanced',
  disabled,
  error,
  success,
  focused,
  fullWidth,
  costTier = 'free'
}: InputStyleProps): React.CSSProperties => {
  
  // Base styles
  const baseStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.base,
    lineHeight: typography.lineHeight.normal,
    color: colors.neutral[900],
    backgroundColor: 'white',
    border: '1px solid',
    borderRadius: migrationMode === 'familiar' ? borderRadius.base : borderRadius.md,
    transition: transitions.common.all,
    width: fullWidth ? '100%' : 'auto',
    position: 'relative',
    outline: 'none'
  };

  // Size styles
  const sizeStyles: Record<string, React.CSSProperties> = {
    small: {
      padding: `${spacing[2]} ${spacing[3]}`,
      fontSize: typography.fontSize.sm,
      minHeight: '32px'
    },
    medium: {
      padding: `${spacing[3]} ${spacing[4]}`,
      fontSize: typography.fontSize.base,
      minHeight: '40px'
    },
    large: {
      padding: `${spacing[4]} ${spacing[5]}`,
      fontSize: typography.fontSize.lg,
      minHeight: '48px'
    }
  };

  // State-based border colors
  let borderColor = colors.neutral[300];
  let boxShadow = 'none';
  
  if (error) {
    borderColor = colors.error[500];
    boxShadow = focused ? `0 0 0 3px ${colors.error[100]}` : 'none';
  } else if (success) {
    borderColor = colors.success[500];
    boxShadow = focused ? `0 0 0 3px ${colors.success[100]}` : 'none';
  } else if (focused) {
    borderColor = costTier === 'premium' ? colors.costTier.premium.primary : colors.primary[500];
    boxShadow = `0 0 0 3px ${costTier === 'premium' ? colors.costTier.premium.background : colors.primary[100]}`;
  }

  // Variant styles
  const variantStyles: Record<string, React.CSSProperties> = {
    default: {
      borderColor,
      boxShadow: migrationMode === 'enhanced' ? boxShadow : 'none'
    },
    outlined: {
      borderColor,
      backgroundColor: 'transparent',
      boxShadow: migrationMode === 'enhanced' ? boxShadow : 'none'
    },
    filled: {
      borderColor: 'transparent',
      backgroundColor: colors.neutral[50],
      boxShadow: migrationMode === 'enhanced' ? boxShadow : 'none'
    }
  };

  // Disabled styles
  if (disabled) {
    return {
      ...baseStyles,
      ...sizeStyles[size],
      ...variantStyles[variant],
      opacity: 0.5,
      cursor: 'not-allowed',
      backgroundColor: colors.neutral[100],
      borderColor: colors.neutral[200]
    };
  }

  return {
    ...baseStyles,
    ...sizeStyles[size],
    ...variantStyles[variant]
  };
};

// ============================================================================
// INPUT COMPONENT
// ============================================================================

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    variant = 'default',
    size = 'medium',
    migrationMode = 'enhanced',
    label,
    helperText,
    error,
    success,
    startIcon,
    endIcon,
    loading = false,
    fullWidth = false,
    costTier = 'free',
    trackingId,
    migrationTooltip,
    required = false,
    showCharCount = false,
    maxLength,
    disabled = false,
    className = '',
    id,
    onFocus,
    onBlur,
    onChange,
    ...props
  }, ref) => {
    
    const [focused, setFocused] = useState(false);
    const [value, setValue] = useState(props.value || props.defaultValue || '');
    
    // Generate unique IDs
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const helperId = helperText ? `${inputId}-helper` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;
    const successId = success ? `${inputId}-success` : undefined;
    
    // Handle focus
    const handleFocus = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
      setFocused(true);
      
      // Migration tooltip announcement
      if (migrationTooltip) {
        screenReaderSupport.announceToScreenReader(migrationTooltip, 'polite');
      }
      
      onFocus?.(event);
    }, [migrationTooltip, onFocus]);
    
    // Handle blur
    const handleBlur = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
      setFocused(false);
      onBlur?.(event);
    }, [onBlur]);
    
    // Handle change
    const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      setValue(newValue);
      
      // Analytics tracking for Charlie integration
      if (trackingId && typeof window !== 'undefined') {
        const trackingData = {
          component: 'Input',
          variant,
          size,
          migrationMode,
          costTier,
          trackingId,
          valueLength: newValue.length,
          timestamp: new Date().toISOString()
        };
        
        window.dispatchEvent(new CustomEvent('design-system-interaction', {
          detail: trackingData
        }));
      }
      
      onChange?.(event);
    }, [trackingId, variant, size, migrationMode, costTier, onChange]);

    // Get computed styles
    const inputStyles = getInputStyles({
      variant,
      size,
      migrationMode,
      disabled: disabled || false,
      error: !!error,
      success: !!success,
      focused,
      fullWidth,
      costTier
    });

    // Container styles
    const containerStyles: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: spacing[1],
      width: fullWidth ? '100%' : 'auto'
    };

    // Input wrapper styles (for icons)
    const inputWrapperStyles: React.CSSProperties = {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      width: '100%'
    };

    // Icon styles
    const iconStyles: React.CSSProperties = {
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      color: colors.neutral[500],
      pointerEvents: 'none',
      fontSize: size === 'small' ? '14px' : size === 'large' ? '20px' : '16px'
    };

    const startIconStyles: React.CSSProperties = {
      ...iconStyles,
      left: spacing[3]
    };

    const endIconStyles: React.CSSProperties = {
      ...iconStyles,
      right: spacing[3]
    };

    // Adjust input padding for icons
    const inputPadding: React.CSSProperties = {
      paddingLeft: startIcon ? spacing[10] : undefined,
      paddingRight: endIcon || loading ? spacing[10] : undefined
    };

    // Loading spinner styles
    const spinnerStyles: React.CSSProperties = {
      ...endIconStyles,
      width: '16px',
      height: '16px',
      border: '2px solid transparent',
      borderTop: `2px solid ${colors.primary[500]}`,
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    };

    // Character count
    const charCount = typeof value === 'string' ? value.length : 0;
    const isOverLimit = maxLength && charCount > maxLength;

    return (
      <div 
        className={`design-system-input-container ${className}`}
        style={containerStyles}
      >
        {/* Label */}
        {label && (
          <label 
            htmlFor={inputId}
            style={{
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              color: colors.neutral[700],
              cursor: disabled ? 'not-allowed' : 'pointer'
            }}
          >
            {label}
            {required && (
              <span 
                style={{ color: colors.error[500], marginLeft: spacing[1] }}
                aria-label="obrigatório"
              >
                *
              </span>
            )}
          </label>
        )}
        
        {/* Input Wrapper */}
        <div style={inputWrapperStyles}>
          {/* Start Icon */}
          {startIcon && (
            <span style={startIconStyles} aria-hidden="true">
              {startIcon}
            </span>
          )}
          
          {/* Input Element */}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            required={required}
            maxLength={maxLength}
            aria-invalid={!!error}
            aria-describedby={[helperId, errorId, successId].filter(Boolean).join(' ') || undefined}
            aria-label={props['aria-label']}
            data-variant={variant}
            data-size={size}
            data-migration-mode={migrationMode}
            data-cost-tier={costTier}
            data-tracking-id={trackingId}
            className="design-system-input"
            style={{
              ...inputStyles,
              ...inputPadding,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              width: '100%'
            }}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            {...props}
          />
          
          {/* End Icon */}
          {!loading && endIcon && (
            <span style={endIconStyles} aria-hidden="true">
              {endIcon}
            </span>
          )}
          
          {/* Loading Spinner */}
          {loading && (
            <span style={spinnerStyles} aria-hidden="true" role="status" />
          )}
        </div>
        
        {/* Helper Text, Error, Success Messages */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            {/* Helper Text */}
            {helperText && !error && !success && (
              <p
                id={helperId}
                style={{
                  margin: 0,
                  fontSize: typography.fontSize.sm,
                  color: colors.neutral[600]
                }}
              >
                {helperText}
              </p>
            )}
            
            {/* Error Message */}
            {error && (
              <p
                id={errorId}
                role="alert"
                style={{
                  margin: 0,
                  fontSize: typography.fontSize.sm,
                  color: colors.error[600],
                  fontWeight: typography.fontWeight.medium
                }}
              >
                {error}
              </p>
            )}
            
            {/* Success Message */}
            {success && !error && (
              <p
                id={successId}
                style={{
                  margin: 0,
                  fontSize: typography.fontSize.sm,
                  color: colors.success[600],
                  fontWeight: typography.fontWeight.medium
                }}
              >
                {success}
              </p>
            )}
          </div>
          
          {/* Character Count */}
          {showCharCount && maxLength && (
            <span
              style={{
                fontSize: typography.fontSize.xs,
                color: isOverLimit ? colors.error[500] : colors.neutral[500],
                fontWeight: isOverLimit ? typography.fontWeight.medium : typography.fontWeight.normal,
                marginLeft: spacing[2]
              }}
              aria-live="polite"
            >
              {charCount}/{maxLength}
            </span>
          )}
        </div>
        
        {/* Migration Tooltip */}
        {migrationTooltip && (
          <span className="sr-only">
            {migrationTooltip}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// ============================================================================
// INPUT VARIANTS (Pre-configured)
// ============================================================================

export const TextInput = forwardRef<HTMLInputElement, Omit<InputProps, 'type'>>(
  (props, ref) => <Input ref={ref} type="text" {...props} />
);

export const EmailInput = forwardRef<HTMLInputElement, Omit<InputProps, 'type'>>(
  (props, ref) => <Input ref={ref} type="email" {...props} />
);

export const PasswordInput = forwardRef<HTMLInputElement, Omit<InputProps, 'type'>>(
  (props, ref) => <Input ref={ref} type="password" {...props} />
);

export const NumberInput = forwardRef<HTMLInputElement, Omit<InputProps, 'type'>>(
  (props, ref) => <Input ref={ref} type="number" {...props} />
);

export const SearchInput = forwardRef<HTMLInputElement, Omit<InputProps, 'type'>>(
  (props, ref) => <Input ref={ref} type="search" {...props} />
);

// ============================================================================
// MIGRATION-SPECIFIC INPUT VARIANTS
// ============================================================================

export const FamiliarInput = forwardRef<HTMLInputElement, Omit<InputProps, 'migrationMode'>>(
  (props, ref) => <Input ref={ref} migrationMode="familiar" {...props} />
);

export const EnhancedInput = forwardRef<HTMLInputElement, Omit<InputProps, 'migrationMode'>>(
  (props, ref) => <Input ref={ref} migrationMode="enhanced" {...props} />
);

// ============================================================================
// COST TIER INPUTS (Alpha Integration)
// ============================================================================

export const FreeInput = forwardRef<HTMLInputElement, Omit<InputProps, 'costTier'>>(
  (props, ref) => <Input ref={ref} costTier="free" {...props} />
);

export const PremiumInput = forwardRef<HTMLInputElement, Omit<InputProps, 'costTier'>>(
  (props, ref) => <Input ref={ref} costTier="premium" {...props} />
);

// ============================================================================
// EXPORT ALL INPUT COMPONENTS
// ============================================================================

export default Input;

export {
  type InputProps,
  type InputStyleProps
}; 