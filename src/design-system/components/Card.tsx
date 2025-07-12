/**
 * 🃏 Card Component - Design System Foundation
 * 
 * Migration-friendly card with interactive states and cost tier integration
 * Supporting Default, Elevated, Interactive variants with familiar/enhanced modes
 * 
 * Part of: WEEK 0 Days 3-4 - IA Beta Core Component Library
 * Integration: Design tokens + Migration patterns + Alpha cost tiers + Charlie monitoring
 */

import React, { forwardRef, HTMLAttributes, ReactNode, useState } from 'react';
import { colors, spacing, typography, borderRadius, shadows, transitions } from '../tokens';
import { familiarElements, userComfortPatterns } from '../migration-patterns';
import { screenReaderSupport } from '../accessibility';

// ============================================================================
// CARD TYPES & INTERFACES
// ============================================================================

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Card visual variant */
  variant?: 'default' | 'elevated' | 'interactive' | 'outlined';
  
  /** Card size */
  size?: 'small' | 'medium' | 'large';
  
  /** Migration mode - familiar preserves existing look, enhanced adds improvements */
  migrationMode?: 'familiar' | 'enhanced';
  
  /** Card header content */
  header?: ReactNode;
  
  /** Card title */
  title?: ReactNode;
  
  /** Card subtitle */
  subtitle?: ReactNode;
  
  /** Card footer content */
  footer?: ReactNode;
  
  /** Card action area content */
  actions?: ReactNode;
  
  /** Card image */
  image?: ReactNode;
  
  /** Loading state */
  loading?: boolean;
  
  /** Clickable card */
  clickable?: boolean;
  
  /** Disabled state */
  disabled?: boolean;
  
  /** Cost tier for Alpha integration */
  costTier?: 'free' | 'premium';
  
  /** Analytics tracking for Charlie integration */
  trackingId?: string;
  
  /** Migration tooltip content */
  migrationTooltip?: string;
  
  /** Highlight new feature */
  isNewFeature?: boolean;
  
  /** Focus on mount */
  autoFocus?: boolean;
  
  children?: ReactNode;
}

export interface CardStyleProps {
  variant: CardProps['variant'];
  size: CardProps['size'];
  migrationMode: CardProps['migrationMode'];
  clickable: boolean;
  disabled: boolean;
  isHovered: boolean;
  isFocused: boolean;
  costTier: CardProps['costTier'];
  isNewFeature: boolean;
}

// ============================================================================
// CARD STYLES
// ============================================================================

const getCardStyles = ({
  variant = 'default',
  size = 'medium',
  migrationMode = 'enhanced',
  clickable,
  disabled,
  isHovered,
  isFocused,
  costTier = 'free',
  isNewFeature
}: CardStyleProps): React.CSSProperties => {
  
  // Base styles
  const baseStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'white',
    borderRadius: migrationMode === 'familiar' ? borderRadius.base : borderRadius.lg,
    transition: transitions.common.all,
    position: 'relative',
    overflow: 'hidden',
    cursor: clickable && !disabled ? 'pointer' : 'default',
    opacity: disabled ? 0.5 : 1,
    outline: 'none'
  };

  // Size styles
  const sizeStyles: Record<string, React.CSSProperties> = {
    small: {
      padding: spacing[4],
      gap: spacing[3]
    },
    medium: {
      padding: spacing[6],
      gap: spacing[4]
    },
    large: {
      padding: spacing[8],
      gap: spacing[6]
    }
  };

  // Variant styles
  const variantStyles: Record<string, React.CSSProperties> = {
    default: {
      border: `1px solid ${colors.neutral[200]}`,
      boxShadow: shadows.sm
    },
    elevated: {
      border: 'none',
      boxShadow: shadows.md
    },
    interactive: {
      border: `1px solid ${colors.neutral[200]}`,
      boxShadow: shadows.sm
    },
    outlined: {
      border: `2px solid ${costTier === 'premium' ? colors.costTier.premium.border : colors.neutral[200]}`,
      boxShadow: 'none'
    }
  };

  // Enhanced hover and focus styles
  if (migrationMode === 'enhanced' && !disabled) {
    if (isHovered && (clickable || variant === 'interactive')) {
      if (variant === 'elevated') {
        variantStyles[variant] = {
          ...variantStyles[variant],
          boxShadow: shadows.lg,
          transform: 'translateY(-2px)'
        };
      } else {
        variantStyles[variant] = {
          ...variantStyles[variant],
          boxShadow: shadows.md,
          transform: 'translateY(-1px)',
          borderColor: costTier === 'premium' ? colors.costTier.premium.primary : colors.neutral[300]
        };
      }
    }

    if (isFocused) {
      variantStyles[variant] = {
        ...variantStyles[variant],
        outline: `2px solid ${colors.primary[500]}`,
        outlineOffset: '2px'
      };
    }
  }

  // New feature highlight
  if (isNewFeature && migrationMode === 'enhanced') {
    variantStyles[variant] = {
      ...variantStyles[variant],
      borderColor: colors.primary[300],
      boxShadow: `${shadows.sm}, 0 0 0 1px ${colors.primary[200]}`
    };
  }

  return {
    ...baseStyles,
    ...sizeStyles[size],
    ...variantStyles[variant]
  };
};

// ============================================================================
// CARD COMPONENT
// ============================================================================

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({
    variant = 'default',
    size = 'medium',
    migrationMode = 'enhanced',
    header,
    title,
    subtitle,
    footer,
    actions,
    image,
    loading = false,
    clickable = false,
    disabled = false,
    costTier = 'free',
    trackingId,
    migrationTooltip,
    isNewFeature = false,
    autoFocus = false,
    className = '',
    onClick,
    onMouseEnter,
    onMouseLeave,
    onFocus,
    onBlur,
    children,
    ...props
  }, ref) => {
    
    const [isHovered, setIsHovered] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    
    // Handle click with analytics tracking
    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) {
        event.preventDefault();
        return;
      }

      // Analytics tracking for Charlie integration
      if (trackingId && typeof window !== 'undefined') {
        const trackingData = {
          component: 'Card',
          variant,
          size,
          migrationMode,
          costTier,
          clickable,
          isNewFeature,
          trackingId,
          timestamp: new Date().toISOString()
        };
        
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

    // Handle mouse enter
    const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement>) => {
      setIsHovered(true);
      onMouseEnter?.(event);
    };

    // Handle mouse leave
    const handleMouseLeave = (event: React.MouseEvent<HTMLDivElement>) => {
      setIsHovered(false);
      onMouseLeave?.(event);
    };

    // Handle focus
    const handleFocus = (event: React.FocusEvent<HTMLDivElement>) => {
      setIsFocused(true);
      onFocus?.(event);
    };

    // Handle blur
    const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
      setIsFocused(false);
      onBlur?.(event);
    };

    // Get computed styles
    const cardStyles = getCardStyles({
      variant,
      size,
      migrationMode,
      clickable,
      disabled,
      isHovered,
      isFocused,
      costTier,
      isNewFeature
    });

    // Content wrapper styles
    const contentStyles: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: spacing[3],
      flex: 1
    };

    // Header styles
    const headerStyles: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: spacing[2],
      borderBottom: `1px solid ${colors.neutral[100]}`
    };

    // Title styles
    const titleStyles: React.CSSProperties = {
      fontSize: size === 'small' ? typography.fontSize.lg : size === 'large' ? typography.fontSize['2xl'] : typography.fontSize.xl,
      fontWeight: typography.fontWeight.semibold,
      color: colors.neutral[900],
      lineHeight: typography.lineHeight.tight,
      margin: 0
    };

    // Subtitle styles
    const subtitleStyles: React.CSSProperties = {
      fontSize: typography.fontSize.sm,
      color: colors.neutral[600],
      lineHeight: typography.lineHeight.normal,
      margin: 0
    };

    // Actions styles
    const actionsStyles: React.CSSProperties = {
      display: 'flex',
      gap: spacing[2],
      justifyContent: 'flex-end',
      alignItems: 'center',
      paddingTop: spacing[3],
      borderTop: `1px solid ${colors.neutral[100]}`
    };

    // Loading overlay styles
    const loadingOverlayStyles: React.CSSProperties = {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1
    };

    // Loading spinner styles
    const spinnerStyles: React.CSSProperties = {
      width: '24px',
      height: '24px',
      border: '2px solid transparent',
      borderTop: `2px solid ${colors.primary[500]}`,
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    };

    // New feature badge styles
    const newFeatureBadgeStyles: React.CSSProperties = {
      position: 'absolute',
      top: spacing[3],
      right: spacing[3],
      backgroundColor: colors.primary[500],
      color: 'white',
      padding: `${spacing[1]} ${spacing[2]}`,
      borderRadius: borderRadius.full,
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.medium,
      zIndex: 2
    };

    return (
      <div
        ref={ref}
        role={clickable ? 'button' : undefined}
        tabIndex={clickable && !disabled ? 0 : undefined}
        disabled={disabled}
        aria-disabled={disabled}
        aria-label={props['aria-label']}
        data-variant={variant}
        data-size={size}
        data-migration-mode={migrationMode}
        data-cost-tier={costTier}
        data-tracking-id={trackingId}
        data-clickable={clickable}
        data-new-feature={isNewFeature}
        className={`design-system-card ${className}`}
        style={cardStyles}
        onClick={clickable ? handleClick : onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={clickable ? handleFocus : onFocus}
        onBlur={clickable ? handleBlur : onBlur}
        autoFocus={autoFocus}
        {...props}
      >
        {/* New Feature Badge */}
        {isNewFeature && migrationMode === 'enhanced' && (
          <span style={newFeatureBadgeStyles} aria-label="Nova funcionalidade">
            Novo
          </span>
        )}

        {/* Image */}
        {image && (
          <div style={{ marginBottom: spacing[4] }}>
            {image}
          </div>
        )}

        {/* Header */}
        {header && (
          <div style={headerStyles}>
            {header}
          </div>
        )}

        {/* Title and Subtitle */}
        {(title || subtitle) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[1] }}>
            {title && (
              <h3 style={titleStyles}>
                {title}
              </h3>
            )}
            {subtitle && (
              <p style={subtitleStyles}>
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Content */}
        {children && (
          <div style={contentStyles}>
            {children}
          </div>
        )}

        {/* Footer */}
        {footer && (
          <div style={{ marginTop: 'auto', paddingTop: spacing[4] }}>
            {footer}
          </div>
        )}

        {/* Actions */}
        {actions && (
          <div style={actionsStyles}>
            {actions}
          </div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div style={loadingOverlayStyles} aria-label="Carregando">
            <div style={spinnerStyles} role="status" />
          </div>
        )}

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

Card.displayName = 'Card';

// ============================================================================
// CARD VARIANTS (Pre-configured)
// ============================================================================

export const DefaultCard = forwardRef<HTMLDivElement, Omit<CardProps, 'variant'>>(
  (props, ref) => <Card ref={ref} variant="default" {...props} />
);

export const ElevatedCard = forwardRef<HTMLDivElement, Omit<CardProps, 'variant'>>(
  (props, ref) => <Card ref={ref} variant="elevated" {...props} />
);

export const InteractiveCard = forwardRef<HTMLDivElement, Omit<CardProps, 'variant'>>(
  (props, ref) => <Card ref={ref} variant="interactive" clickable {...props} />
);

export const OutlinedCard = forwardRef<HTMLDivElement, Omit<CardProps, 'variant'>>(
  (props, ref) => <Card ref={ref} variant="outlined" {...props} />
);

// ============================================================================
// MIGRATION-SPECIFIC CARD VARIANTS
// ============================================================================

export const FamiliarCard = forwardRef<HTMLDivElement, Omit<CardProps, 'migrationMode'>>(
  (props, ref) => <Card ref={ref} migrationMode="familiar" {...props} />
);

export const EnhancedCard = forwardRef<HTMLDivElement, Omit<CardProps, 'migrationMode'>>(
  (props, ref) => <Card ref={ref} migrationMode="enhanced" {...props} />
);

// ============================================================================
// COST TIER CARDS (Alpha Integration)
// ============================================================================

export const FreeCard = forwardRef<HTMLDivElement, Omit<CardProps, 'costTier'>>(
  (props, ref) => <Card ref={ref} costTier="free" {...props} />
);

export const PremiumCard = forwardRef<HTMLDivElement, Omit<CardProps, 'costTier'>>(
  (props, ref) => <Card ref={ref} costTier="premium" {...props} />
);

// ============================================================================
// SPECIALIZED CARD COMPONENTS
// ============================================================================

export interface FeatureCardProps extends Omit<CardProps, 'isNewFeature'> {
  /** Feature icon */
  icon?: ReactNode;
  /** Feature description */
  description?: string;
  /** Feature status */
  status?: 'new' | 'updated' | 'coming-soon';
}

export const FeatureCard = forwardRef<HTMLDivElement, FeatureCardProps>(
  ({ icon, description, status, title, children, ...props }, ref) => {
    const statusColors = {
      new: colors.success[500],
      updated: colors.warning[500],
      'coming-soon': colors.neutral[400]
    };

    const statusLabels = {
      new: 'Novo',
      updated: 'Atualizado',
      'coming-soon': 'Em breve'
    };

    return (
      <Card
        ref={ref}
        isNewFeature={status === 'new'}
        header={
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
            {icon && (
              <div style={{ 
                fontSize: '24px', 
                color: colors.primary[500],
                display: 'flex',
                alignItems: 'center'
              }}>
                {icon}
              </div>
            )}
            <div style={{ flex: 1 }}>
              {title && (
                <h3 style={{ 
                  margin: 0, 
                  fontSize: typography.fontSize.lg,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.neutral[900]
                }}>
                  {title}
                </h3>
              )}
              {description && (
                <p style={{ 
                  margin: 0, 
                  fontSize: typography.fontSize.sm,
                  color: colors.neutral[600]
                }}>
                  {description}
                </p>
              )}
            </div>
            {status && (
              <span style={{
                padding: `${spacing[1]} ${spacing[2]}`,
                borderRadius: borderRadius.full,
                fontSize: typography.fontSize.xs,
                fontWeight: typography.fontWeight.medium,
                backgroundColor: `${statusColors[status]}20`,
                color: statusColors[status]
              }}>
                {statusLabels[status]}
              </span>
            )}
          </div>
        }
        {...props}
      >
        {children}
      </Card>
    );
  }
);

FeatureCard.displayName = 'FeatureCard';

// ============================================================================
// CARD GRID COMPONENT
// ============================================================================

export interface CardGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4 | 6;
  gap?: keyof typeof spacing;
  responsive?: boolean;
  className?: string;
}

export const CardGrid: React.FC<CardGridProps> = ({
  children,
  columns = 3,
  gap = '4',
  responsive = true,
  className = ''
}) => {
  const gridColumns = responsive 
    ? {
        1: 'grid-cols-1',
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
        6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
      }[columns]
    : `repeat(${columns}, 1fr)`;

  const gridStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: typeof gridColumns === 'string' && gridColumns.includes('repeat') 
      ? gridColumns 
      : `repeat(${columns}, 1fr)`,
    gap: spacing[gap],
    width: '100%'
  };

  return (
    <div 
      className={`design-system-card-grid ${className}`}
      style={gridStyles}
    >
      {children}
    </div>
  );
};

// ============================================================================
// EXPORT ALL CARD COMPONENTS
// ============================================================================

export default Card;

export {
  type CardProps,
  type CardStyleProps,
  type FeatureCardProps,
  type CardGridProps
}; 