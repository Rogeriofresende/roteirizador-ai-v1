/**
 * 💬 MigrationTooltip Component - Contextual Guidance
 * 
 * Contextual tooltips for migration guidance with screen reader support
 * Keyboard navigation support and familiar/enhanced content adaptation
 * 
 * Part of: WEEK 0 Days 3-4 - IA Beta Migration Components
 * Integration: Migration patterns + Accessibility + Alpha cost tiers + Charlie monitoring
 */

import React, { 
  forwardRef, 
  ReactNode, 
  useState, 
  useEffect, 
  useRef,
  HTMLAttributes 
} from 'react';
import { colors, spacing, typography, borderRadius, shadows, transitions, zIndex } from '../../tokens';
import { familiarElements, userComfortPatterns } from '../../migration-patterns';
import { keyboardNavigation, screenReaderSupport } from '../../accessibility';

// ============================================================================
// MIGRATION TOOLTIP TYPES & INTERFACES
// ============================================================================

export interface MigrationTooltipProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'content'> {
  /** Tooltip content */
  content: ReactNode;
  
  /** Tooltip title */
  title?: string;
  
  /** Tooltip position */
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  
  /** Tooltip trigger */
  trigger?: 'hover' | 'click' | 'focus' | 'manual';
  
  /** Migration mode for content adaptation */
  migrationMode?: 'familiar' | 'enhanced';
  
  /** Migration phase */
  migrationPhase?: 'foundation' | 'enhancement' | 'modernization';
  
  /** User experience level */
  userLevel?: 'beginner' | 'intermediate' | 'advanced';
  
  /** Show/hide tooltip manually */
  visible?: boolean;
  
  /** Tooltip variant */
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'feature';
  
  /** Maximum width */
  maxWidth?: string;
  
  /** Show arrow pointing to trigger */
  showArrow?: boolean;
  
  /** Delay before showing (ms) */
  showDelay?: number;
  
  /** Delay before hiding (ms) */
  hideDelay?: number;
  
  /** Cost tier for Alpha integration */
  costTier?: 'free' | 'premium';
  
  /** Analytics tracking for Charlie integration */
  trackingId?: string;
  
  /** Disable tooltip */
  disabled?: boolean;
  
  /** Keep tooltip open on hover */
  persistent?: boolean;
  
  /** Close on escape key */
  closeOnEscape?: boolean;
  
  /** Keyboard shortcut to show tooltip */
  keyboardShortcut?: string;
  
  /** Callback when tooltip shows */
  onShow?: () => void;
  
  /** Callback when tooltip hides */
  onHide?: () => void;
  
  /** Callback when tooltip is clicked */
  onTooltipClick?: () => void;
  
  children: ReactNode;
}

// ============================================================================
// MIGRATION TOOLTIP STYLES
// ============================================================================

const getTooltipStyles = (
  variant: MigrationTooltipProps['variant'] = 'default',
  migrationMode: MigrationTooltipProps['migrationMode'] = 'enhanced',
  costTier: MigrationTooltipProps['costTier'] = 'free',
  maxWidth?: string
): React.CSSProperties => {
  
  // Base styles
  const baseStyles: React.CSSProperties = {
    position: 'absolute',
    padding: spacing[3],
    borderRadius: migrationMode === 'familiar' ? borderRadius.base : borderRadius.lg,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.normal,
    boxShadow: shadows.lg,
    zIndex: zIndex.tooltip,
    maxWidth: maxWidth || '250px',
    wordWrap: 'break-word',
    transition: transitions.common.all
  };
  
  // Variant styles
  const variantStyles: Record<string, React.CSSProperties> = {
    default: {
      backgroundColor: colors.neutral[800],
      color: 'white',
      border: `1px solid ${colors.neutral[700]}`
    },
    success: {
      backgroundColor: colors.success[50],
      color: colors.success[800],
      border: `1px solid ${colors.success[200]}`
    },
    warning: {
      backgroundColor: colors.warning[50],
      color: colors.warning[800],
      border: `1px solid ${colors.warning[200]}`
    },
    error: {
      backgroundColor: colors.error[50],
      color: colors.error[800],
      border: `1px solid ${colors.error[200]}`
    },
    info: {
      backgroundColor: colors.primary[50],
      color: colors.primary[800],
      border: `1px solid ${colors.primary[200]}`
    },
    feature: {
      backgroundColor: costTier === 'premium' ? colors.costTier.premium.background : colors.primary[50],
      color: costTier === 'premium' ? colors.costTier.premium.primary : colors.primary[800],
      border: `1px solid ${costTier === 'premium' ? colors.costTier.premium.border : colors.primary[200]}`
    }
  };
  
  return {
    ...baseStyles,
    ...variantStyles[variant]
  };
};

const getArrowStyles = (
  position: string,
  variant: MigrationTooltipProps['variant'] = 'default',
  costTier: MigrationTooltipProps['costTier'] = 'free'
): React.CSSProperties => {
  
  const arrowSize = 6;
  
  // Variant colors
  const variantColors = {
    default: colors.neutral[800],
    success: colors.success[200],
    warning: colors.warning[200],
    error: colors.error[200],
    info: colors.primary[200],
    feature: costTier === 'premium' ? colors.costTier.premium.border : colors.primary[200]
  };
  
  const arrowColor = variantColors[variant as keyof typeof variantColors];
  
  const baseArrowStyles: React.CSSProperties = {
    position: 'absolute',
    width: 0,
    height: 0,
    borderStyle: 'solid'
  };
  
  switch (position) {
    case 'top':
      return {
        ...baseArrowStyles,
        top: '100%',
        left: '50%',
        marginLeft: `-${arrowSize}px`,
        borderWidth: `${arrowSize}px ${arrowSize}px 0 ${arrowSize}px`,
        borderColor: `${arrowColor} transparent transparent transparent`
      };
    case 'bottom':
      return {
        ...baseArrowStyles,
        bottom: '100%',
        left: '50%',
        marginLeft: `-${arrowSize}px`,
        borderWidth: `0 ${arrowSize}px ${arrowSize}px ${arrowSize}px`,
        borderColor: `transparent transparent ${arrowColor} transparent`
      };
    case 'left':
      return {
        ...baseArrowStyles,
        left: '100%',
        top: '50%',
        marginTop: `-${arrowSize}px`,
        borderWidth: `${arrowSize}px 0 ${arrowSize}px ${arrowSize}px`,
        borderColor: `transparent transparent transparent ${arrowColor}`
      };
    case 'right':
      return {
        ...baseArrowStyles,
        right: '100%',
        top: '50%',
        marginTop: `-${arrowSize}px`,
        borderWidth: `${arrowSize}px ${arrowSize}px ${arrowSize}px 0`,
        borderColor: `transparent ${arrowColor} transparent transparent`
      };
    default:
      return baseArrowStyles;
  }
};

// ============================================================================
// MIGRATION TOOLTIP COMPONENT
// ============================================================================

export const MigrationTooltip = forwardRef<HTMLDivElement, MigrationTooltipProps>(
  ({
    content,
    title,
    position = 'auto',
    trigger = 'hover',
    migrationMode = 'enhanced',
    migrationPhase = 'foundation',
    userLevel = 'intermediate',
    visible,
    variant = 'default',
    maxWidth,
    showArrow = true,
    showDelay = 500,
    hideDelay = 200,
    costTier = 'free',
    trackingId,
    disabled = false,
    persistent = false,
    closeOnEscape = true,
    keyboardShortcut,
    onShow,
    onHide,
    onTooltipClick,
    className = '',
    children,
    ...props
  }, ref) => {
    
    const [isVisible, setIsVisible] = useState(visible || false);
    const [calculatedPosition, setCalculatedPosition] = useState(position);
    const [isHovering, setIsHovering] = useState(false);
    
    const triggerRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const uniqueId = useRef(`tooltip-${Math.random().toString(36).substr(2, 9)}`);
    
    // Calculate optimal position
    const calculatePosition = () => {
      if (position !== 'auto' || !triggerRef.current || !tooltipRef.current) {
        return position;
      }
      
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      };
      
      // Check space in each direction
      const spaceTop = triggerRect.top;
      const spaceBottom = viewport.height - triggerRect.bottom;
      const spaceLeft = triggerRect.left;
      const spaceRight = viewport.width - triggerRect.right;
      
      // Find the direction with most space
      const spaces = [
        { direction: 'top', space: spaceTop },
        { direction: 'bottom', space: spaceBottom },
        { direction: 'left', space: spaceLeft },
        { direction: 'right', space: spaceRight }
      ];
      
      const bestSpace = spaces.reduce((max, current) => 
        current.space > max.space ? current : max
      );
      
      return bestSpace.direction as 'top' | 'bottom' | 'left' | 'right';
    };
    
    // Show tooltip
    const showTooltip = () => {
      if (disabled) return;
      
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
      
      showTimeoutRef.current = setTimeout(() => {
        setIsVisible(true);
        
        // Calculate position after showing
        setTimeout(() => {
          setCalculatedPosition(calculatePosition());
        }, 0);
        
        // Analytics tracking
        if (trackingId && typeof window !== 'undefined') {
          const trackingData = {
            component: 'MigrationTooltip',
            action: 'tooltip_shown',
            variant,
            migrationMode,
            migrationPhase,
            userLevel,
            costTier,
            trackingId,
            timestamp: new Date().toISOString()
          };
          
          window.dispatchEvent(new CustomEvent('design-system-interaction', {
            detail: trackingData
          }));
        }
        
        // Screen reader announcement
        if (title || content) {
          const announcement = title 
            ? `${title}. ${typeof content === 'string' ? content : 'Informação adicional disponível'}`
            : typeof content === 'string' ? content : 'Informação adicional disponível';
          
          screenReaderSupport.announceToScreenReader(announcement, 'polite');
        }
        
        onShow?.();
      }, showDelay);
    };
    
    // Hide tooltip
    const hideTooltip = () => {
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
        showTimeoutRef.current = null;
      }
      
      if (!persistent || !isHovering) {
        hideTimeoutRef.current = setTimeout(() => {
          setIsVisible(false);
          onHide?.();
        }, hideDelay);
      }
    };
    
    // Handle trigger events
    const handleMouseEnter = () => {
      setIsHovering(true);
      if (trigger === 'hover') {
        showTooltip();
      }
    };
    
    const handleMouseLeave = () => {
      setIsHovering(false);
      if (trigger === 'hover') {
        hideTooltip();
      }
    };
    
    const handleClick = () => {
      if (trigger === 'click') {
        if (isVisible) {
          hideTooltip();
        } else {
          showTooltip();
        }
      }
    };
    
    const handleFocus = () => {
      if (trigger === 'focus') {
        showTooltip();
      }
    };
    
    const handleBlur = () => {
      if (trigger === 'focus') {
        hideTooltip();
      }
    };
    
    const handleKeyDown = (event: React.KeyboardEvent) => {
      // Escape key
      if (event.key === keyboardNavigation.shortcuts.ESCAPE && closeOnEscape && isVisible) {
        hideTooltip();
        return;
      }
      
      // Custom keyboard shortcut
      if (keyboardShortcut && event.key === keyboardShortcut) {
        event.preventDefault();
        if (isVisible) {
          hideTooltip();
        } else {
          showTooltip();
        }
      }
    };
    
    // Handle tooltip click
    const handleTooltipClick = () => {
      // Analytics tracking
      if (trackingId && typeof window !== 'undefined') {
        const trackingData = {
          component: 'MigrationTooltip',
          action: 'tooltip_clicked',
          variant,
          migrationMode,
          migrationPhase,
          userLevel,
          costTier,
          trackingId,
          timestamp: new Date().toISOString()
        };
        
        window.dispatchEvent(new CustomEvent('design-system-interaction', {
          detail: trackingData
        }));
      }
      
      onTooltipClick?.();
    };
    
    // Controlled visibility
    useEffect(() => {
      if (visible !== undefined) {
        setIsVisible(visible);
      }
    }, [visible]);
    
    // Cleanup timeouts
    useEffect(() => {
      return () => {
        if (showTimeoutRef.current) {
          clearTimeout(showTimeoutRef.current);
        }
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
        }
      };
    }, []);
    
    // Get positioning styles
    const getPositionStyles = (): React.CSSProperties => {
      const baseOffset = 8;
      
      switch (calculatedPosition) {
        case 'top':
          return {
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: `${baseOffset}px`
          };
        case 'bottom':
          return {
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginTop: `${baseOffset}px`
          };
        case 'left':
          return {
            right: '100%',
            top: '50%',
            transform: 'translateY(-50%)',
            marginRight: `${baseOffset}px`
          };
        case 'right':
          return {
            left: '100%',
            top: '50%',
            transform: 'translateY(-50%)',
            marginLeft: `${baseOffset}px`
          };
        default:
          return {
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginTop: `${baseOffset}px`
          };
      }
    };
    
    // Get computed styles
    const tooltipStyles = getTooltipStyles(variant, migrationMode, costTier, maxWidth);
    const arrowStyles = getArrowStyles(calculatedPosition, variant, costTier);
    const positionStyles = getPositionStyles();
    
    // Migration mode content adaptation
    const getAdaptedContent = () => {
      if (migrationMode === 'familiar' && userLevel === 'beginner') {
        // Add extra guidance for beginners in familiar mode
        return (
          <div>
            {content}
            {typeof content === 'string' && content.length > 50 && (
              <div style={{ 
                marginTop: spacing[2], 
                fontSize: typography.fontSize.xs,
                opacity: 0.8 
              }}>
                💡 Dica: Esta informação ajuda você a entender melhor a funcionalidade.
              </div>
            )}
          </div>
        );
      }
      
      return content;
    };
    
    return (
      <div
        ref={triggerRef}
        className={`design-system-migration-tooltip-trigger ${className}`}
        style={{ position: 'relative', display: 'inline-block' }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        aria-describedby={isVisible ? uniqueId.current : undefined}
        data-migration-mode={migrationMode}
        data-migration-phase={migrationPhase}
        data-user-level={userLevel}
        data-cost-tier={costTier}
        data-tracking-id={trackingId}
        {...props}
      >
        {children}
        
        {/* Tooltip */}
        {isVisible && (
          <div
            ref={tooltipRef}
            id={uniqueId.current}
            role="tooltip"
            className="design-system-migration-tooltip"
            style={{
              ...tooltipStyles,
              ...positionStyles,
              opacity: isVisible ? 1 : 0,
              visibility: isVisible ? 'visible' : 'hidden'
            }}
            onClick={handleTooltipClick}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {/* Title */}
            {title && (
              <div style={{
                fontWeight: typography.fontWeight.semibold,
                marginBottom: spacing[1],
                fontSize: typography.fontSize.sm
              }}>
                {title}
              </div>
            )}
            
            {/* Content */}
            <div>
              {getAdaptedContent()}
            </div>
            
            {/* Keyboard shortcut hint */}
            {keyboardShortcut && migrationMode === 'enhanced' && (
              <div style={{
                marginTop: spacing[2],
                fontSize: typography.fontSize.xs,
                opacity: 0.7,
                borderTop: `1px solid ${variant === 'default' ? colors.neutral[600] : 'currentColor'}`,
                paddingTop: spacing[1]
              }}>
                Atalho: {keyboardShortcut}
              </div>
            )}
            
            {/* Arrow */}
            {showArrow && (
              <div style={arrowStyles} />
            )}
          </div>
        )}
      </div>
    );
  }
);

MigrationTooltip.displayName = 'MigrationTooltip';

// ============================================================================
// MIGRATION TOOLTIP VARIANTS
// ============================================================================

export const SuccessTooltip = forwardRef<HTMLDivElement, Omit<MigrationTooltipProps, 'variant'>>(
  (props, ref) => <MigrationTooltip ref={ref} variant="success" {...props} />
);

export const WarningTooltip = forwardRef<HTMLDivElement, Omit<MigrationTooltipProps, 'variant'>>(
  (props, ref) => <MigrationTooltip ref={ref} variant="warning" {...props} />
);

export const ErrorTooltip = forwardRef<HTMLDivElement, Omit<MigrationTooltipProps, 'variant'>>(
  (props, ref) => <MigrationTooltip ref={ref} variant="error" {...props} />
);

export const InfoTooltip = forwardRef<HTMLDivElement, Omit<MigrationTooltipProps, 'variant'>>(
  (props, ref) => <MigrationTooltip ref={ref} variant="info" {...props} />
);

export const FeatureTooltip = forwardRef<HTMLDivElement, Omit<MigrationTooltipProps, 'variant'>>(
  (props, ref) => <MigrationTooltip ref={ref} variant="feature" {...props} />
);

// ============================================================================
// MIGRATION TOOLTIP HOOKS
// ============================================================================

export const useMigrationTooltip = () => {
  const [visibleTooltips, setVisibleTooltips] = useState<Set<string>>(new Set());
  
  const showTooltip = (tooltipId: string) => {
    setVisibleTooltips(prev => new Set(prev).add(tooltipId));
  };
  
  const hideTooltip = (tooltipId: string) => {
    setVisibleTooltips(prev => {
      const newSet = new Set(prev);
      newSet.delete(tooltipId);
      return newSet;
    });
  };
  
  const toggleTooltip = (tooltipId: string) => {
    if (visibleTooltips.has(tooltipId)) {
      hideTooltip(tooltipId);
    } else {
      showTooltip(tooltipId);
    }
  };
  
  const hideAll = () => {
    setVisibleTooltips(new Set());
  };
  
  const isVisible = (tooltipId: string) => {
    return visibleTooltips.has(tooltipId);
  };
  
  return {
    showTooltip,
    hideTooltip,
    toggleTooltip,
    hideAll,
    isVisible,
    visibleTooltips: Array.from(visibleTooltips)
  };
};

// ============================================================================
// EXPORT ALL MIGRATION TOOLTIP COMPONENTS
// ============================================================================

export default MigrationTooltip;

export {
  type MigrationTooltipProps
}; 