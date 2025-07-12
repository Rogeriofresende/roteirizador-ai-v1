/**
 * ✨ FeatureHighlight Component - Migration Wrapper
 * 
 * Wrapper component to highlight new features with smooth animations
 * A/B testing framework integration and cost tier aware highlighting
 * 
 * Part of: WEEK 0 Days 3-4 - IA Beta Migration Components
 * Integration: A/B testing + Migration services + Alpha cost tiers + Charlie monitoring
 */

import React, { 
  forwardRef, 
  ReactNode, 
  useEffect, 
  useState, 
  useRef,
  HTMLAttributes 
} from 'react';
import { colors, spacing, borderRadius, shadows, transitions } from '../../tokens';
import { migrationAnimations } from '../../animations';
import { screenReaderSupport } from '../../accessibility';

// ============================================================================
// FEATURE HIGHLIGHT TYPES & INTERFACES
// ============================================================================

export interface FeatureHighlightProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Content to highlight */
  children: ReactNode;
  
  /** Highlight variant */
  variant?: 'glow' | 'pulse' | 'outline' | 'badge' | 'gradient';
  
  /** Highlight intensity */
  intensity?: 'subtle' | 'moderate' | 'strong';
  
  /** Feature title for announcement */
  featureTitle?: string;
  
  /** Feature description */
  featureDescription?: string;
  
  /** Show/hide highlight */
  active?: boolean;
  
  /** Auto-dismiss after duration (ms) */
  autoDismiss?: number;
  
  /** Cost tier for Alpha integration */
  costTier?: 'free' | 'premium';
  
  /** A/B testing experiment ID */
  experimentId?: string;
  
  /** A/B testing variant */
  variant_ab?: 'control' | 'treatment_a' | 'treatment_b';
  
  /** Analytics tracking for Charlie integration */
  trackingId?: string;
  
  /** Delay before showing highlight (ms) */
  delay?: number;
  
  /** Animation duration override */
  duration?: number;
  
  /** Show callout bubble */
  showCallout?: boolean;
  
  /** Callout position */
  calloutPosition?: 'top' | 'bottom' | 'left' | 'right';
  
  /** Callout content */
  calloutContent?: ReactNode;
  
  /** Click anywhere to dismiss */
  dismissOnClick?: boolean;
  
  /** Callback when highlighted */
  onHighlight?: () => void;
  
  /** Callback when dismissed */
  onDismiss?: () => void;
  
  /** Callback when clicked */
  onFeatureClick?: () => void;
}

// ============================================================================
// FEATURE HIGHLIGHT STYLES
// ============================================================================

const getHighlightStyles = (
  variant: FeatureHighlightProps['variant'] = 'glow',
  intensity: FeatureHighlightProps['intensity'] = 'moderate',
  costTier: FeatureHighlightProps['costTier'] = 'free',
  active: boolean = true
): React.CSSProperties => {
  
  // Base highlight color
  const highlightColor = costTier === 'premium' 
    ? colors.costTier.premium.primary 
    : colors.primary[500];
  
  // Intensity multipliers
  const intensityMap = {
    subtle: 0.3,
    moderate: 0.6,
    strong: 1.0
  };
  
  const alpha = intensityMap[intensity];
  
  if (!active) {
    return {
      transition: transitions.common.all
    };
  }
  
  switch (variant) {
    case 'glow':
      return {
        position: 'relative',
        transition: transitions.common.all,
        boxShadow: `0 0 ${spacing[6]} ${highlightColor}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`,
        borderRadius: borderRadius.lg,
        animation: `glowPulse 2s ease-in-out infinite`
      };
      
    case 'pulse':
      return {
        position: 'relative',
        transition: transitions.common.all,
        animation: `featurePulse 1.5s ease-in-out infinite`
      };
      
    case 'outline':
      return {
        position: 'relative',
        transition: transitions.common.all,
        border: `2px solid ${highlightColor}`,
        borderRadius: borderRadius.lg,
        boxShadow: `0 0 0 4px ${highlightColor}${Math.round(alpha * 50).toString(16).padStart(2, '0')}`
      };
      
    case 'badge':
      return {
        position: 'relative',
        transition: transitions.common.all,
        '&::after': {
          content: '"Novo"',
          position: 'absolute',
          top: '-8px',
          right: '-8px',
          backgroundColor: highlightColor,
          color: 'white',
          padding: `${spacing[1]} ${spacing[2]}`,
          borderRadius: borderRadius.full,
          fontSize: '12px',
          fontWeight: '500',
          zIndex: 10
        }
      };
      
    case 'gradient':
      return {
        position: 'relative',
        transition: transitions.common.all,
        background: `linear-gradient(135deg, ${highlightColor}${Math.round(alpha * 40).toString(16).padStart(2, '0')} 0%, transparent 100%)`,
        borderRadius: borderRadius.lg
      };
      
    default:
      return {
        transition: transitions.common.all
      };
  }
};

// ============================================================================
// FEATURE HIGHLIGHT COMPONENT
// ============================================================================

export const FeatureHighlight = forwardRef<HTMLDivElement, FeatureHighlightProps>(
  ({
    children,
    variant = 'glow',
    intensity = 'moderate',
    featureTitle,
    featureDescription,
    active = true,
    autoDismiss,
    costTier = 'free',
    experimentId,
    variant_ab = 'control',
    trackingId,
    delay = 0,
    duration = 2000,
    showCallout = false,
    calloutPosition = 'top',
    calloutContent,
    dismissOnClick = false,
    onHighlight,
    onDismiss,
    onFeatureClick,
    className = '',
    ...props
  }, ref) => {
    
    const [isHighlighted, setIsHighlighted] = useState(false);
    const [showHighlight, setShowHighlight] = useState(false);
    const highlightRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    
    // Initialize highlight
    useEffect(() => {
      if (active && !isHighlighted) {
        const delayTimeout = setTimeout(() => {
          setShowHighlight(true);
          setIsHighlighted(true);
          
          // Announce to screen readers
          if (featureTitle) {
            screenReaderSupport.announceToScreenReader(
              `Nova funcionalidade destacada: ${featureTitle}${featureDescription ? '. ' + featureDescription : ''}`,
              'polite'
            );
          }
          
          // Analytics tracking for Charlie integration
          if (trackingId && typeof window !== 'undefined') {
            const trackingData = {
              component: 'FeatureHighlight',
              action: 'highlight_shown',
              featureTitle,
              variant,
              intensity,
              costTier,
              experimentId,
              variant_ab,
              trackingId,
              timestamp: new Date().toISOString()
            };
            
            window.dispatchEvent(new CustomEvent('design-system-interaction', {
              detail: trackingData
            }));
          }
          
          onHighlight?.();
          
          // Auto dismiss
          if (autoDismiss) {
            timeoutRef.current = setTimeout(() => {
              handleDismiss();
            }, autoDismiss);
          }
          
        }, delay);
        
        return () => clearTimeout(delayTimeout);
      }
    }, [active, isHighlighted, delay, autoDismiss, featureTitle, featureDescription, trackingId, variant, intensity, costTier, experimentId, variant_ab, onHighlight]);
    
    // Cleanup timeout on unmount
    useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);
    
    // Handle dismiss
    const handleDismiss = () => {
      setShowHighlight(false);
      setIsHighlighted(false);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      // Analytics tracking
      if (trackingId && typeof window !== 'undefined') {
        const trackingData = {
          component: 'FeatureHighlight',
          action: 'highlight_dismissed',
          featureTitle,
          variant,
          intensity,
          costTier,
          experimentId,
          variant_ab,
          trackingId,
          timestamp: new Date().toISOString()
        };
        
        window.dispatchEvent(new CustomEvent('design-system-interaction', {
          detail: trackingData
        }));
      }
      
      onDismiss?.();
    };
    
    // Handle click
    const handleClick = (event: React.MouseEvent) => {
      // Analytics tracking
      if (trackingId && typeof window !== 'undefined') {
        const trackingData = {
          component: 'FeatureHighlight',
          action: 'feature_clicked',
          featureTitle,
          variant,
          intensity,
          costTier,
          experimentId,
          variant_ab,
          trackingId,
          timestamp: new Date().toISOString()
        };
        
        window.dispatchEvent(new CustomEvent('design-system-interaction', {
          detail: trackingData
        }));
      }
      
      onFeatureClick?.();
      
      if (dismissOnClick) {
        handleDismiss();
      }
      
      props.onClick?.(event);
    };
    
    // Get computed styles
    const highlightStyles = getHighlightStyles(variant, intensity, costTier, showHighlight);
    
    // Callout styles
    const calloutStyles: React.CSSProperties = {
      position: 'absolute',
      backgroundColor: 'white',
      border: `1px solid ${colors.neutral[200]}`,
      borderRadius: borderRadius.lg,
      padding: spacing[4],
      boxShadow: shadows.lg,
      fontSize: '14px',
      maxWidth: '200px',
      zIndex: 1000,
      opacity: showCallout && showHighlight ? 1 : 0,
      visibility: showCallout && showHighlight ? 'visible' : 'hidden',
      transition: transitions.common.all
    };
    
    // Position callout
    switch (calloutPosition) {
      case 'top':
        calloutStyles.bottom = '100%';
        calloutStyles.left = '50%';
        calloutStyles.transform = 'translateX(-50%)';
        calloutStyles.marginBottom = spacing[2];
        break;
      case 'bottom':
        calloutStyles.top = '100%';
        calloutStyles.left = '50%';
        calloutStyles.transform = 'translateX(-50%)';
        calloutStyles.marginTop = spacing[2];
        break;
      case 'left':
        calloutStyles.right = '100%';
        calloutStyles.top = '50%';
        calloutStyles.transform = 'translateY(-50%)';
        calloutStyles.marginRight = spacing[2];
        break;
      case 'right':
        calloutStyles.left = '100%';
        calloutStyles.top = '50%';
        calloutStyles.transform = 'translateY(-50%)';
        calloutStyles.marginLeft = spacing[2];
        break;
    }
    
    return (
      <>
        {/* CSS Keyframes Injection */}
        <style jsx>{`
          @keyframes glowPulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
          
          @keyframes featurePulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.02); }
          }
          
          @media (prefers-reduced-motion: reduce) {
            @keyframes glowPulse {
              0%, 100% { opacity: 1; }
            }
            
            @keyframes featurePulse {
              0%, 100% { transform: scale(1); }
            }
          }
        `}</style>
        
        <div
          ref={ref}
          className={`design-system-feature-highlight ${className}`}
          style={{
            ...highlightStyles,
            position: 'relative',
            display: 'inline-block'
          }}
          data-variant={variant}
          data-intensity={intensity}
          data-cost-tier={costTier}
          data-experiment-id={experimentId}
          data-ab-variant={variant_ab}
          data-tracking-id={trackingId}
          data-highlighted={showHighlight}
          onClick={handleClick}
          role={onFeatureClick ? 'button' : undefined}
          tabIndex={onFeatureClick ? 0 : undefined}
          aria-label={featureTitle ? `Nova funcionalidade: ${featureTitle}` : undefined}
          aria-describedby={featureDescription ? 'feature-description' : undefined}
          {...props}
        >
          {children}
          
          {/* Badge for badge variant */}
          {variant === 'badge' && showHighlight && (
            <span
              style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                backgroundColor: costTier === 'premium' ? colors.costTier.premium.primary : colors.primary[500],
                color: 'white',
                padding: `${spacing[1]} ${spacing[2]}`,
                borderRadius: borderRadius.full,
                fontSize: '12px',
                fontWeight: '500',
                zIndex: 10
              }}
              aria-label="Nova funcionalidade"
            >
              Novo
            </span>
          )}
          
          {/* Callout */}
          {showCallout && (
            <div style={calloutStyles}>
              {calloutContent || (
                <div>
                  {featureTitle && (
                    <div style={{ 
                      fontWeight: '600', 
                      marginBottom: spacing[1],
                      color: colors.neutral[900]
                    }}>
                      {featureTitle}
                    </div>
                  )}
                  {featureDescription && (
                    <div id="feature-description" style={{ 
                      color: colors.neutral[700] 
                    }}>
                      {featureDescription}
                    </div>
                  )}
                  {dismissOnClick && (
                    <div style={{ 
                      marginTop: spacing[2],
                      fontSize: '12px',
                      color: colors.neutral[500]
                    }}>
                      Clique para dispensar
                    </div>
                  )}
                </div>
              )}
              
              {/* Callout arrow */}
              <div
                style={{
                  position: 'absolute',
                  width: 0,
                  height: 0,
                  ...(calloutPosition === 'top' && {
                    top: '100%',
                    left: '50%',
                    marginLeft: '-6px',
                    borderLeft: '6px solid transparent',
                    borderRight: '6px solid transparent',
                    borderTop: `6px solid ${colors.neutral[200]}`
                  }),
                  ...(calloutPosition === 'bottom' && {
                    bottom: '100%',
                    left: '50%',
                    marginLeft: '-6px',
                    borderLeft: '6px solid transparent',
                    borderRight: '6px solid transparent',
                    borderBottom: `6px solid ${colors.neutral[200]}`
                  }),
                  ...(calloutPosition === 'left' && {
                    left: '100%',
                    top: '50%',
                    marginTop: '-6px',
                    borderTop: '6px solid transparent',
                    borderBottom: '6px solid transparent',
                    borderLeft: `6px solid ${colors.neutral[200]}`
                  }),
                  ...(calloutPosition === 'right' && {
                    right: '100%',
                    top: '50%',
                    marginTop: '-6px',
                    borderTop: '6px solid transparent',
                    borderBottom: '6px solid transparent',
                    borderRight: `6px solid ${colors.neutral[200]}`
                  })
                }}
              />
            </div>
          )}
        </div>
      </>
    );
  }
);

FeatureHighlight.displayName = 'FeatureHighlight';

// ============================================================================
// FEATURE HIGHLIGHT VARIANTS
// ============================================================================

export const GlowHighlight = forwardRef<HTMLDivElement, Omit<FeatureHighlightProps, 'variant'>>(
  (props, ref) => <FeatureHighlight ref={ref} variant="glow" {...props} />
);

export const PulseHighlight = forwardRef<HTMLDivElement, Omit<FeatureHighlightProps, 'variant'>>(
  (props, ref) => <FeatureHighlight ref={ref} variant="pulse" {...props} />
);

export const OutlineHighlight = forwardRef<HTMLDivElement, Omit<FeatureHighlightProps, 'variant'>>(
  (props, ref) => <FeatureHighlight ref={ref} variant="outline" {...props} />
);

export const BadgeHighlight = forwardRef<HTMLDivElement, Omit<FeatureHighlightProps, 'variant'>>(
  (props, ref) => <FeatureHighlight ref={ref} variant="badge" {...props} />
);

export const GradientHighlight = forwardRef<HTMLDivElement, Omit<FeatureHighlightProps, 'variant'>>(
  (props, ref) => <FeatureHighlight ref={ref} variant="gradient" {...props} />
);

// ============================================================================
// FEATURE HIGHLIGHT HOOKS
// ============================================================================

export const useFeatureHighlight = () => {
  const [highlightedFeatures, setHighlightedFeatures] = useState<Set<string>>(new Set());
  
  const highlightFeature = (featureId: string) => {
    setHighlightedFeatures(prev => new Set(prev).add(featureId));
  };
  
  const dismissFeature = (featureId: string) => {
    setHighlightedFeatures(prev => {
      const newSet = new Set(prev);
      newSet.delete(featureId);
      return newSet;
    });
  };
  
  const isHighlighted = (featureId: string) => {
    return highlightedFeatures.has(featureId);
  };
  
  const dismissAll = () => {
    setHighlightedFeatures(new Set());
  };
  
  return {
    highlightFeature,
    dismissFeature,
    isHighlighted,
    dismissAll,
    highlightedFeatures: Array.from(highlightedFeatures)
  };
};

// ============================================================================
// EXPORT ALL FEATURE HIGHLIGHT COMPONENTS
// ============================================================================

export default FeatureHighlight;

export {
  type FeatureHighlightProps
}; 