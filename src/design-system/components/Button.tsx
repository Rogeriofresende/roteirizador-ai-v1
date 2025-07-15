/**
 * 🔘 Button Component - Design System Foundation
 * 
 * Migration-friendly button with accessibility and cost tier integration
 * Supporting Primary, Secondary, Ghost variants with familiar/enhanced modes
 * 
 * Part of: WEEK 0 Days 3-4 - IA Beta Core Component Library
 * Integration: Design tokens + Migration patterns + Alpha cost tiers + Charlie monitoring
 */

import React, { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import { colors, spacing, typography, borderRadius, shadows, transitions } from '../tokens';
import { familiarElements, userComfortPatterns } from '../migration-patterns';
import { focusManagement, screenReaderSupport } from '../accessibility';
import { migrationAnimations } from '../animations';

// ============================================================================
// BUTTON TYPES & INTERFACES
// ============================================================================

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  /** Button visual variant */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  
  /** Button size */
  size?: 'small' | 'medium' | 'large';
  
  /** Migration mode - familiar preserves existing look, enhanced adds improvements */
  migrationMode?: 'familiar' | 'enhanced';
  
  /** Loading state */
  loading?: boolean;
  
  /** Icon to display before text */
  startIcon?: ReactNode;
  
  /** Icon to display after text */
  endIcon?: ReactNode;
  
  /** Full width button */
  fullWidth?: boolean;
  
  /** Cost tier for Alpha integration */
  costTier?: 'free' | 'premium';
  
  /** Analytics tracking for Charlie integration */
  trackingId?: string;
  
  /** Migration tooltip content */
  migrationTooltip?: string;
  
  /** Accessibility label override */
  'aria-label'?: string;
  
  children: ReactNode;
}

export interface ButtonStyleProps {
  variant: ButtonProps['variant'];
  size: ButtonProps['size'];
  migrationMode: ButtonProps['migrationMode'];
  loading: boolean;
  disabled: boolean;
  fullWidth: boolean;
  costTier: ButtonProps['costTier'];
}

// ============================================================================
// BUTTON STYLES
// ============================================================================

const getButtonStyles = ({
  variant = 'primary',
  size = 'medium',
  migrationMode = 'enhanced',
  loading,
  disabled,
  fullWidth,
  costTier = 'free'
}: ButtonStyleProps): React.CSSProperties => {
  
  // Validate inputs to prevent undefined access
  const safeVariant = variant || 'primary';
  const safeSize = size || 'medium';
  const safeMigrationMode = migrationMode || 'enhanced';
  const safeCostTier = costTier || 'free';
  
  // Base styles
  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    border: 'none',
    borderRadius: safeMigrationMode === 'familiar' ? borderRadius.md : borderRadius.lg,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.medium,
    textDecoration: 'none',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: transitions.common.all,
    position: 'relative',
    overflow: 'hidden',
    width: fullWidth ? '100%' : 'auto',
    opacity: disabled ? 0.5 : 1,
    userSelect: 'none',
    WebkitUserSelect: 'none',
    outline: 'none'
  };

  // Size styles
  const sizeStyles: Record<string, React.CSSProperties> = {
    small: {
      padding: `${spacing[2]} ${spacing[3]}`,
      fontSize: typography.fontSize.sm,
      lineHeight: typography.lineHeight.tight,
      minHeight: '32px'
    },
    medium: {
      padding: `${spacing[3]} ${spacing[4]}`,
      fontSize: typography.fontSize.sm,
      lineHeight: typography.lineHeight.normal,
      minHeight: '40px'
    },
    large: {
      padding: `${spacing[4]} ${spacing[6]}`,
      fontSize: typography.fontSize.base,
      lineHeight: typography.lineHeight.normal,
      minHeight: '48px'
    }
  };

  // Variant styles based on migration mode
  const variantStyles: Record<string, Record<string, React.CSSProperties>> = {
    primary: {
      familiar: {
        backgroundColor: colors.migration.familiar,
        color: 'white',
        boxShadow: 'none'
      },
      enhanced: {
        backgroundColor: safeCostTier === 'premium' ? colors.costTier.premium.primary : colors.primary[500],
        color: 'white',
        boxShadow: shadows.sm
      }
    },
    secondary: {
      familiar: {
        backgroundColor: 'transparent',
        color: colors.migration.familiar,
        border: `1px solid ${colors.migration.familiar}`
      },
      enhanced: {
        backgroundColor: 'transparent',
        color: safeCostTier === 'premium' ? colors.costTier.premium.primary : colors.primary[500],
        border: `1px solid ${safeCostTier === 'premium' ? colors.costTier.premium.border : colors.primary[500]}`
      }
    },
    ghost: {
      familiar: {
        backgroundColor: 'transparent',
        color: colors.neutral[700],
        border: 'none'
      },
      enhanced: {
        backgroundColor: 'transparent',
        color: colors.neutral[700],
        border: 'none'
      }
    },
    danger: {
      familiar: {
        backgroundColor: colors.error[500],
        color: 'white',
        boxShadow: 'none'
      },
      enhanced: {
        backgroundColor: colors.error[500],
        color: 'white',
        boxShadow: shadows.sm
      }
    }
  };

  // Safe access to variant styles with fallback
  const safeVariantStyles = variantStyles[safeVariant] || variantStyles.primary;
  const modeStyles = safeVariantStyles[safeMigrationMode] || safeVariantStyles.enhanced || {};

  return {
    ...baseStyles,
    ...sizeStyles[safeSize],
    ...modeStyles
  };
};

// ============================================================================
// BUTTON COMPONENT
// ============================================================================

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    variant = 'primary',
    size = 'medium',
    migrationMode = 'enhanced',
    loading = false,
    startIcon,
    endIcon,
    fullWidth = false,
    costTier = 'free',
    trackingId,
    migrationTooltip,
    disabled = false,
    className = '',
    onClick,
    children,
    'aria-label': ariaLabel,
    ...props
  }, ref) => {
    
    // Handle click with analytics tracking
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) {
        event.preventDefault();
        return;
      }

      // Analytics tracking for Charlie integration
      if (trackingId && typeof window !== 'undefined') {
        // Track button usage for monitoring
        const trackingData = {
          component: 'Button',
          variant,
          size,
          migrationMode,
          costTier,
          trackingId,
          timestamp: new Date().toISOString()
        };
        
        // Dispatch custom event for Charlie monitoring
        window.dispatchEvent(new CustomEvent('design-system-interaction', {
          detail: trackingData
        }));
      }

      // Migration tooltip announcement
      if (migrationTooltip) {
        screenReaderSupport.announceToScreenReader(migrationTooltip, 'polite');
      }

      onClick?.(event);
    };

    // Get computed styles
    const buttonStyles = getButtonStyles({
      variant,
      size,
      migrationMode,
      loading,
      disabled,
      fullWidth,
      costTier
    });

    // Hover styles
    const hoverStyles: Record<string, Record<string, React.CSSProperties>> = {
      primary: {
        enhanced: {
          backgroundColor: costTier === 'premium' ? colors.warning[600] : colors.primary[600],
          boxShadow: shadows.md,
          transform: 'translateY(-1px)'
        },
        familiar: {
          backgroundColor: colors.primary[600]
        }
      },
      secondary: {
        enhanced: {
          backgroundColor: costTier === 'premium' ? colors.costTier.premium.background : colors.primary[50],
          borderColor: costTier === 'premium' ? colors.costTier.premium.primary : colors.primary[600]
        },
        familiar: {
          backgroundColor: colors.neutral[50]
        }
      },
      ghost: {
        enhanced: {
          backgroundColor: colors.neutral[100]
        },
        familiar: {
          backgroundColor: colors.neutral[50]
        }
      },
      danger: {
        enhanced: {
          backgroundColor: colors.error[600],
          boxShadow: shadows.md,
          transform: 'translateY(-1px)'
        },
        familiar: {
          backgroundColor: colors.error[600]
        }
      }
    };

    // Focus styles
    const focusStyles: React.CSSProperties = {
      outline: `2px solid ${colors.primary[500]}`,
      outlineOffset: '2px'
    };

    // Loading spinner styles
    const spinnerStyles: React.CSSProperties = {
      width: '16px',
      height: '16px',
      border: '2px solid transparent',
      borderTop: '2px solid currentColor',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    };

    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled || loading}
        aria-label={ariaLabel || (loading ? `${children} - Carregando` : undefined)}
        aria-disabled={disabled || loading}
        data-variant={variant}
        data-size={size}
        data-migration-mode={migrationMode}
        data-cost-tier={costTier}
        data-tracking-id={trackingId}
        className={`design-system-button ${className}`}
        style={buttonStyles}
        onClick={handleClick}
        onMouseEnter={(e) => {
          if (!disabled && !loading && migrationMode === 'enhanced') {
            Object.assign(e.currentTarget.style, hoverStyles[variant][migrationMode]);
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled && !loading) {
            Object.assign(e.currentTarget.style, buttonStyles);
          }
        }}
        onFocus={(e) => {
          Object.assign(e.currentTarget.style, { ...buttonStyles, ...focusStyles });
        }}
        onBlur={(e) => {
          Object.assign(e.currentTarget.style, buttonStyles);
        }}
        {...props}
      >
        {/* Start Icon */}
        {startIcon && !loading && (
          <span 
            style={{ 
              display: 'flex', 
              alignItems: 'center',
              fontSize: size === 'small' ? '14px' : size === 'large' ? '20px' : '16px'
            }}
            aria-hidden="true"
          >
            {startIcon}
          </span>
        )}
        
        {/* Loading Spinner */}
        {loading && (
          <span 
            style={spinnerStyles}
            aria-hidden="true"
            role="status"
          />
        )}
        
        {/* Button Text */}
        <span style={{ opacity: loading ? 0.7 : 1 }}>
          {children}
        </span>
        
        {/* End Icon */}
        {endIcon && !loading && (
          <span 
            style={{ 
              display: 'flex', 
              alignItems: 'center',
              fontSize: size === 'small' ? '14px' : size === 'large' ? '20px' : '16px'
            }}
            aria-hidden="true"
          >
            {endIcon}
          </span>
        )}
        
        {/* Migration Tooltip */}
        {migrationTooltip && (
          <span className="sr-only">
            {migrationTooltip}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

// ============================================================================
// BUTTON VARIANTS (Pre-configured)
// ============================================================================

export const PrimaryButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => <Button ref={ref} variant="primary" {...props} />
);

export const SecondaryButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => <Button ref={ref} variant="secondary" {...props} />
);

export const GhostButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => <Button ref={ref} variant="ghost" {...props} />
);

export const DangerButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => <Button ref={ref} variant="danger" {...props} />
);

// ============================================================================
// MIGRATION-SPECIFIC BUTTON VARIANTS
// ============================================================================

export const FamiliarButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, 'migrationMode'>>(
  (props, ref) => <Button ref={ref} migrationMode="familiar" {...props} />
);

export const EnhancedButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, 'migrationMode'>>(
  (props, ref) => <Button ref={ref} migrationMode="enhanced" {...props} />
);

// ============================================================================
// COST TIER BUTTONS (Alpha Integration)
// ============================================================================

export const FreeButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, 'costTier'>>(
  (props, ref) => <Button ref={ref} costTier="free" {...props} />
);

export const PremiumButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, 'costTier'>>(
  (props, ref) => <Button ref={ref} costTier="premium" {...props} />
);

// ============================================================================
// BUTTON GROUP COMPONENT
// ============================================================================

export interface ButtonGroupProps {
  children: ReactNode;
  orientation?: 'horizontal' | 'vertical';
  spacing?: keyof typeof spacing;
  fullWidth?: boolean;
  className?: string;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  orientation = 'horizontal',
  spacing: spacingProp = '2',
  fullWidth = false,
  className = ''
}) => {
  const groupStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: orientation === 'vertical' ? 'column' : 'row',
    gap: spacing[spacingProp],
    width: fullWidth ? '100%' : 'auto'
  };

  return (
    <div 
      className={`design-system-button-group ${className}`}
      style={groupStyles}
      role="group"
    >
      {children}
    </div>
  );
};

// ============================================================================
// EXPORT ALL BUTTON COMPONENTS
// ============================================================================

export default Button;

export {
  type ButtonProps,
  type ButtonStyleProps,
  type ButtonGroupProps
}; 