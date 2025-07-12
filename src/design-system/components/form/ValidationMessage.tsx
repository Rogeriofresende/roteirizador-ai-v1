/**
 * ⚠️ ValidationMessage Component - Form Validation
 * 
 * Specialized validation message component with screen reader support
 * Live regions, success/error/warning states, and migration tooltip integration
 * 
 * Part of: WEEK 0 Days 3-4 - IA Beta Form Components
 * Integration: Design tokens + Migration patterns + Alpha cost tiers + Charlie monitoring
 */

import React, { 
  forwardRef, 
  ReactNode, 
  useEffect, 
  useRef,
  HTMLAttributes 
} from 'react';
import { colors, spacing, typography, borderRadius, shadows, transitions } from '../../tokens';
import { familiarElements } from '../../migration-patterns';
import { screenReaderSupport } from '../../accessibility';

// ============================================================================
// VALIDATION MESSAGE TYPES & INTERFACES
// ============================================================================

export interface ValidationMessageProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Message content */
  message: string | ReactNode;
  
  /** Validation state */
  state?: 'error' | 'warning' | 'success' | 'info';
  
  /** Message size */
  size?: 'small' | 'medium' | 'large';
  
  /** Message variant */
  variant?: 'default' | 'inline' | 'toast' | 'tooltip';
  
  /** Show icon */
  showIcon?: boolean;
  
  /** Custom icon */
  icon?: ReactNode;
  
  /** Show close button */
  closable?: boolean;
  
  /** Auto dismiss after duration (ms) */
  autoDismiss?: number;
  
  /** Message is visible */
  visible?: boolean;
  
  /** Animation variant */
  animation?: 'fade' | 'slide' | 'shake' | 'bounce' | 'none';
  
  /** Live region politeness */
  politeness?: 'off' | 'polite' | 'assertive';
  
  /** Migration mode for styling */
  migrationMode?: 'familiar' | 'enhanced';
  
  /** Cost tier for Alpha integration */
  costTier?: 'free' | 'premium';
  
  /** Analytics tracking for Charlie integration */
  trackingId?: string;
  
  /** Field ID this message relates to */
  fieldId?: string;
  
  /** Additional help text */
  helpText?: string;
  
  /** Show progress indicator (for async validation) */
  showProgress?: boolean;
  
  /** Progress percentage */
  progress?: number;
  
  /** Action button */
  action?: {
    label: string;
    onClick: () => void;
  };
  
  /** Callback when message is dismissed */
  onDismiss?: () => void;
  
  /** Callback when message appears */
  onAppear?: () => void;
  
  /** Callback when action is clicked */
  onActionClick?: () => void;
}

// ============================================================================
// VALIDATION MESSAGE STYLES
// ============================================================================

const getValidationMessageStyles = (
  state: ValidationMessageProps['state'] = 'info',
  size: ValidationMessageProps['size'] = 'medium',
  variant: ValidationMessageProps['variant'] = 'default',
  migrationMode: ValidationMessageProps['migrationMode'] = 'enhanced',
  costTier: ValidationMessageProps['costTier'] = 'free',
  visible: boolean = true
): React.CSSProperties => {
  
  // State color mappings
  const stateColors = {
    error: {
      background: colors.error[50],
      border: colors.error[200],
      text: colors.error[700],
      icon: colors.error[500]
    },
    warning: {
      background: colors.warning[50],
      border: colors.warning[200],
      text: colors.warning[700],
      icon: colors.warning[500]
    },
    success: {
      background: colors.success[50],
      border: colors.success[200],
      text: colors.success[700],
      icon: colors.success[500]
    },
    info: {
      background: costTier === 'premium' ? colors.costTier.premium.background : colors.primary[50],
      border: costTier === 'premium' ? colors.costTier.premium.border : colors.primary[200],
      text: costTier === 'premium' ? colors.costTier.premium.primary : colors.primary[700],
      icon: costTier === 'premium' ? colors.costTier.premium.primary : colors.primary[500]
    }
  };
  
  const currentColors = stateColors[state];
  
  // Size configurations
  const sizeConfig = {
    small: {
      padding: spacing[2],
      fontSize: typography.fontSize.xs,
      iconSize: '14px'
    },
    medium: {
      padding: spacing[3],
      fontSize: typography.fontSize.sm,
      iconSize: '16px'
    },
    large: {
      padding: spacing[4],
      fontSize: typography.fontSize.base,
      iconSize: '20px'
    }
  };
  
  const config = sizeConfig[size];
  
  // Base styles
  const baseStyles: React.CSSProperties = {
    display: visible ? 'flex' : 'none',
    alignItems: 'flex-start',
    gap: spacing[2],
    padding: config.padding,
    borderRadius: migrationMode === 'familiar' ? borderRadius.base : borderRadius.md,
    fontSize: config.fontSize,
    lineHeight: typography.lineHeight.normal,
    fontWeight: typography.fontWeight.normal,
    backgroundColor: currentColors.background,
    color: currentColors.text,
    border: `1px solid ${currentColors.border}`,
    transition: transitions.common.all,
    position: 'relative',
    width: '100%'
  };
  
  // Variant-specific styles
  const variantStyles: Record<string, React.CSSProperties> = {
    default: {
      ...baseStyles
    },
    inline: {
      ...baseStyles,
      backgroundColor: 'transparent',
      border: 'none',
      padding: `${spacing[1]} 0`
    },
    toast: {
      ...baseStyles,
      boxShadow: shadows.lg,
      borderRadius: borderRadius.lg,
      minWidth: '300px',
      position: 'fixed',
      top: spacing[4],
      right: spacing[4],
      zIndex: 1000
    },
    tooltip: {
      ...baseStyles,
      backgroundColor: colors.neutral[800],
      color: 'white',
      border: `1px solid ${colors.neutral[700]}`,
      boxShadow: shadows.md,
      borderRadius: borderRadius.md,
      position: 'absolute',
      maxWidth: '250px',
      zIndex: 999
    }
  };
  
  return variantStyles[variant];
};

// ============================================================================
// VALIDATION MESSAGE COMPONENT
// ============================================================================

export const ValidationMessage = forwardRef<HTMLDivElement, ValidationMessageProps>(
  ({
    message,
    state = 'info',
    size = 'medium',
    variant = 'default',
    showIcon = true,
    icon,
    closable = false,
    autoDismiss,
    visible = true,
    animation = 'fade',
    politeness = 'polite',
    migrationMode = 'enhanced',
    costTier = 'free',
    trackingId,
    fieldId,
    helpText,
    showProgress = false,
    progress = 0,
    action,
    onDismiss,
    onAppear,
    onActionClick,
    className = '',
    ...props
  }, ref) => {
    
    const messageRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    
    // Get default icon based on state
    const getDefaultIcon = (): ReactNode => {
      const iconMap = {
        error: '⚠️',
        warning: '⚠️',
        success: '✅',
        info: 'ℹ️'
      };
      return iconMap[state];
    };
    
    // Handle auto dismiss
    useEffect(() => {
      if (visible && autoDismiss) {
        timeoutRef.current = setTimeout(() => {
          onDismiss?.();
        }, autoDismiss);
        
        return () => {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
        };
      }
    }, [visible, autoDismiss, onDismiss]);
    
    // Handle appearance
    useEffect(() => {
      if (visible) {
        onAppear?.();
        
        // Screen reader announcement
        if (politeness !== 'off' && typeof message === 'string') {
          screenReaderSupport.announceToScreenReader(message, politeness);
        }
        
        // Analytics tracking
        if (trackingId && typeof window !== 'undefined') {
          const trackingData = {
            component: 'ValidationMessage',
            action: 'message_shown',
            state,
            variant,
            size,
            migrationMode,
            costTier,
            fieldId,
            trackingId,
            timestamp: new Date().toISOString()
          };
          
          window.dispatchEvent(new CustomEvent('design-system-interaction', {
            detail: trackingData
          }));
        }
      }
    }, [visible, message, politeness, state, variant, size, migrationMode, costTier, fieldId, trackingId, onAppear]);
    
    // Handle dismiss
    const handleDismiss = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Analytics tracking
      if (trackingId && typeof window !== 'undefined') {
        const trackingData = {
          component: 'ValidationMessage',
          action: 'message_dismissed',
          state,
          variant,
          size,
          migrationMode,
          costTier,
          fieldId,
          trackingId,
          timestamp: new Date().toISOString()
        };
        
        window.dispatchEvent(new CustomEvent('design-system-interaction', {
          detail: trackingData
        }));
      }
      
      onDismiss?.();
    };
    
    // Handle action click
    const handleActionClick = () => {
      action?.onClick();
      onActionClick?.();
      
      // Analytics tracking
      if (trackingId && typeof window !== 'undefined') {
        const trackingData = {
          component: 'ValidationMessage',
          action: 'action_clicked',
          actionLabel: action?.label,
          state,
          variant,
          migrationMode,
          costTier,
          trackingId,
          timestamp: new Date().toISOString()
        };
        
        window.dispatchEvent(new CustomEvent('design-system-interaction', {
          detail: trackingData
        }));
      }
    };
    
    // Get computed styles
    const messageStyles = getValidationMessageStyles(
      state,
      size,
      variant,
      migrationMode,
      costTier,
      visible
    );
    
    // Animation styles
    const getAnimationStyles = (): React.CSSProperties => {
      if (animation === 'none' || !visible) return {};
      
      const animationMap = {
        fade: 'fadeIn 200ms ease-out',
        slide: 'slideDown 200ms ease-out',
        shake: 'shake 300ms ease-in-out',
        bounce: 'bounce 400ms ease-out'
      };
      
      return {
        animation: animationMap[animation]
      };
    };
    
    if (!visible) {
      return null;
    }
    
    return (
      <>
        {/* CSS Animations */}
        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes slideDown {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }
          
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
          }
          
          @media (prefers-reduced-motion: reduce) {
            @keyframes fadeIn, @keyframes slideDown, @keyframes shake, @keyframes bounce {
              from, to { opacity: 1; transform: none; }
            }
          }
        `}</style>
        
        <div
          ref={messageRef}
          className={`design-system-validation-message ${className}`}
          style={{
            ...messageStyles,
            ...getAnimationStyles()
          }}
          role={politeness !== 'off' ? 'alert' : undefined}
          aria-live={politeness !== 'off' ? politeness : undefined}
          aria-atomic="true"
          data-state={state}
          data-variant={variant}
          data-size={size}
          data-migration-mode={migrationMode}
          data-cost-tier={costTier}
          data-tracking-id={trackingId}
          data-field-id={fieldId}
          {...props}
        >
          {/* Icon */}
          {showIcon && (
            <div style={{
              fontSize: size === 'small' ? '14px' : size === 'large' ? '20px' : '16px',
              color: getValidationMessageStyles(state, size, variant, migrationMode, costTier, visible).color,
              flexShrink: 0,
              marginTop: '2px'
            }}>
              {icon || getDefaultIcon()}
            </div>
          )}
          
          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Main Message */}
            <div style={{ 
              wordBreak: 'break-word',
              lineHeight: typography.lineHeight.normal
            }}>
              {message}
            </div>
            
            {/* Help Text */}
            {helpText && (
              <div style={{
                fontSize: typography.fontSize.xs,
                opacity: 0.8,
                marginTop: spacing[1],
                lineHeight: typography.lineHeight.normal
              }}>
                {helpText}
              </div>
            )}
            
            {/* Progress Bar */}
            {showProgress && (
              <div style={{
                marginTop: spacing[2],
                height: '4px',
                backgroundColor: 'rgba(0,0,0,0.1)',
                borderRadius: borderRadius.full,
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  backgroundColor: 'currentColor',
                  width: `${Math.min(100, Math.max(0, progress))}%`,
                  transition: transitions.common.all,
                  borderRadius: borderRadius.full
                }} />
              </div>
            )}
            
            {/* Action Button */}
            {action && (
              <button
                style={{
                  marginTop: spacing[2],
                  padding: `${spacing[1]} ${spacing[2]}`,
                  backgroundColor: 'transparent',
                  border: `1px solid currentColor`,
                  borderRadius: borderRadius.sm,
                  color: 'inherit',
                  fontSize: typography.fontSize.xs,
                  cursor: 'pointer',
                  transition: transitions.common.all
                }}
                onClick={handleActionClick}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'currentColor';
                  e.currentTarget.style.color = variant === 'tooltip' ? colors.neutral[800] : 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'inherit';
                }}
              >
                {action.label}
              </button>
            )}
          </div>
          
          {/* Close Button */}
          {closable && (
            <button
              style={{
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                padding: spacing[1],
                color: 'inherit',
                fontSize: size === 'small' ? '14px' : '16px',
                borderRadius: borderRadius.sm,
                flexShrink: 0,
                opacity: 0.7,
                transition: transitions.common.all
              }}
              onClick={handleDismiss}
              aria-label="Fechar mensagem"
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '0.7';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              ×
            </button>
          )}
        </div>
      </>
    );
  }
);

ValidationMessage.displayName = 'ValidationMessage';

// ============================================================================
// VALIDATION MESSAGE VARIANTS
// ============================================================================

export const ErrorMessage = forwardRef<HTMLDivElement, Omit<ValidationMessageProps, 'state'>>(
  (props, ref) => <ValidationMessage ref={ref} state="error" {...props} />
);

export const WarningMessage = forwardRef<HTMLDivElement, Omit<ValidationMessageProps, 'state'>>(
  (props, ref) => <ValidationMessage ref={ref} state="warning" {...props} />
);

export const SuccessMessage = forwardRef<HTMLDivElement, Omit<ValidationMessageProps, 'state'>>(
  (props, ref) => <ValidationMessage ref={ref} state="success" {...props} />
);

export const InfoMessage = forwardRef<HTMLDivElement, Omit<ValidationMessageProps, 'state'>>(
  (props, ref) => <ValidationMessage ref={ref} state="info" {...props} />
);

// ============================================================================
// VALIDATION MESSAGE HOOKS
// ============================================================================

export const useValidationMessage = () => {
  const [message, setMessage] = React.useState<string>('');
  const [state, setState] = React.useState<ValidationMessageProps['state']>('info');
  const [visible, setVisible] = React.useState(false);
  
  const showMessage = (
    newMessage: string, 
    newState: ValidationMessageProps['state'] = 'info',
    duration?: number
  ) => {
    setMessage(newMessage);
    setState(newState);
    setVisible(true);
    
    if (duration) {
      setTimeout(() => {
        setVisible(false);
      }, duration);
    }
  };
  
  const showError = (errorMessage: string, duration?: number) => {
    showMessage(errorMessage, 'error', duration);
  };
  
  const showWarning = (warningMessage: string, duration?: number) => {
    showMessage(warningMessage, 'warning', duration);
  };
  
  const showSuccess = (successMessage: string, duration?: number) => {
    showMessage(successMessage, 'success', duration);
  };
  
  const showInfo = (infoMessage: string, duration?: number) => {
    showMessage(infoMessage, 'info', duration);
  };
  
  const hideMessage = () => {
    setVisible(false);
  };
  
  const clearMessage = () => {
    setMessage('');
    setVisible(false);
  };
  
  return {
    message,
    state,
    visible,
    showMessage,
    showError,
    showWarning,
    showSuccess,
    showInfo,
    hideMessage,
    clearMessage
  };
};

// ============================================================================
// VALIDATION MESSAGE QUEUE HOOK
// ============================================================================

export const useValidationMessageQueue = () => {
  const [messages, setMessages] = React.useState<Array<{
    id: string;
    message: string;
    state: ValidationMessageProps['state'];
    timestamp: number;
  }>>([]);
  
  const addMessage = (
    message: string, 
    state: ValidationMessageProps['state'] = 'info'
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    setMessages(prev => [...prev, {
      id,
      message,
      state,
      timestamp: Date.now()
    }]);
    return id;
  };
  
  const removeMessage = (id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  };
  
  const clearMessages = () => {
    setMessages([]);
  };
  
  return {
    messages,
    addMessage,
    removeMessage,
    clearMessages
  };
};

// ============================================================================
// EXPORT ALL VALIDATION MESSAGE COMPONENTS
// ============================================================================

export default ValidationMessage;

export {
  ErrorMessage,
  WarningMessage,
  SuccessMessage,
  InfoMessage,
  type ValidationMessageProps
}; 