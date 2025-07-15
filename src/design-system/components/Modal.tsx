/**
 * 🪟 Modal Component - Design System Foundation
 * 
 * Migration-friendly modal with focus management and accessibility
 * Supporting Basic, Confirmation, Feature Intro variants with familiar/enhanced modes
 * 
 * Part of: WEEK 0 Days 3-4 - IA Beta Core Component Library
 * Integration: Design tokens + Migration patterns + Alpha cost tiers + Charlie monitoring
 */

import React, { 
  forwardRef, 
  HTMLAttributes, 
  ReactNode, 
  useEffect, 
  useRef, 
  useCallback,
  useState 
} from 'react';
import { colors, spacing, typography, borderRadius, shadows, transitions, zIndex } from '../tokens';
import { familiarElements } from '../migration-patterns';
import { focusManagement, screenReaderSupport, keyboardNavigation } from '../accessibility';
import { migrationAnimations } from '../animations';

// ============================================================================
// MODAL TYPES & INTERFACES
// ============================================================================

export interface ModalProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Modal visibility */
  open: boolean;
  
  /** Modal visual variant */
  variant?: 'basic' | 'confirmation' | 'feature-intro' | 'fullscreen';
  
  /** Modal size */
  size?: 'small' | 'medium' | 'large' | 'extra-large';
  
  /** Migration mode - familiar preserves existing look, enhanced adds improvements */
  migrationMode?: 'familiar' | 'enhanced';
  
  /** Modal title */
  title?: ReactNode;
  
  /** Modal subtitle */
  subtitle?: ReactNode;
  
  /** Modal header content */
  header?: ReactNode;
  
  /** Modal footer content */
  footer?: ReactNode;
  
  /** Primary action button */
  primaryAction?: ReactNode;
  
  /** Secondary action button */
  secondaryAction?: ReactNode;
  
  /** Close button visibility */
  showCloseButton?: boolean;
  
  /** Close on backdrop click */
  closeOnBackdrop?: boolean;
  
  /** Close on escape key */
  closeOnEscape?: boolean;
  
  /** Loading state */
  loading?: boolean;
  
  /** Cost tier for Alpha integration */
  costTier?: 'free' | 'premium';
  
  /** Analytics tracking for Charlie integration */
  trackingId?: string;
  
  /** Migration tooltip content */
  migrationTooltip?: string;
  
  /** Focus element selector on open */
  initialFocus?: string;
  
  /** Return focus element selector on close */
  returnFocus?: string;
  
  /** Modal icon */
  icon?: ReactNode;
  
  /** Confirmation variant type */
  confirmationType?: 'danger' | 'warning' | 'info' | 'success';
  
  /** Feature intro step count */
  stepCount?: { current: number; total: number };
  
  /** Callback when modal opens */
  onOpen?: () => void;
  
  /** Callback when modal closes */
  onClose?: () => void;
  
  /** Callback when backdrop is clicked */
  onBackdropClick?: () => void;
  
  /** Callback when escape is pressed */
  onEscapePress?: () => void;
  
  children?: ReactNode;
}

export interface ModalStyleProps {
  variant: ModalProps['variant'];
  size: ModalProps['size'];
  migrationMode: ModalProps['migrationMode'];
  loading: boolean;
  costTier: ModalProps['costTier'];
  confirmationType?: ModalProps['confirmationType'];
}

// ============================================================================
// MODAL STYLES
// ============================================================================

const getModalStyles = ({
  variant = 'basic',
  size = 'medium',
  migrationMode = 'enhanced',
  loading,
  costTier = 'free',
  confirmationType
}: ModalStyleProps) => {
  
  // Backdrop styles
  const backdropStyles: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.semantic.backdrop,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[4],
    zIndex: zIndex.modal,
    opacity: loading ? 0.7 : 1
  };

  // Modal container styles
  const containerStyles: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: migrationMode === 'familiar' ? borderRadius.base : borderRadius.xl,
    boxShadow: shadows['2xl'],
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '90vh',
    outline: 'none',
    animation: migrationMode === 'enhanced' ? 'modalEntrance 200ms ease-out forwards' : undefined
  };

  // Size styles
  const sizeStyles: Record<string, React.CSSProperties> = {
    small: {
      width: '100%',
      maxWidth: '400px'
    },
    medium: {
      width: '100%',
      maxWidth: '500px'
    },
    large: {
      width: '100%',
      maxWidth: '700px'
    },
    'extra-large': {
      width: '100%',
      maxWidth: '900px'
    }
  };

  // Variant-specific styles
  const variantStyles: Record<string, React.CSSProperties> = {
    basic: {
      ...sizeStyles[size]
    },
    confirmation: {
      ...sizeStyles.small,
      maxWidth: '450px'
    },
    'feature-intro': {
      ...sizeStyles.medium,
      maxWidth: '600px'
    },
    fullscreen: {
      width: '100vw',
      height: '100vh',
      maxWidth: 'none',
      maxHeight: 'none',
      borderRadius: 0
    }
  };

  // Confirmation type styles
  if (variant === 'confirmation' && confirmationType) {
    const typeColors = {
      danger: colors.error[50],
      warning: colors.warning[50],
      info: colors.primary[50],
      success: colors.success[50]
    };
    
    containerStyles.borderTop = `4px solid ${colors[confirmationType === 'info' ? 'primary' : confirmationType][500]}`;
    if (migrationMode === 'enhanced') {
      containerStyles.backgroundColor = typeColors[confirmationType];
    }
  }

  return {
    backdrop: backdropStyles,
    container: {
      ...containerStyles,
      ...variantStyles[variant]
    }
  };
};

// ============================================================================
// MODAL COMPONENT
// ============================================================================

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({
    open,
    variant = 'basic',
    size = 'medium',
    migrationMode = 'enhanced',
    title,
    subtitle,
    header,
    footer,
    primaryAction,
    secondaryAction,
    showCloseButton = true,
    closeOnBackdrop = true,
    closeOnEscape = true,
    loading = false,
    costTier = 'free',
    trackingId,
    migrationTooltip,
    initialFocus,
    returnFocus,
    icon,
    confirmationType,
    stepCount,
    onOpen,
    onClose,
    onBackdropClick,
    onEscapePress,
    className = '',
    children,
    ...props
  }, ref) => {
    
    const [isVisible, setIsVisible] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const backdropRef = useRef<HTMLDivElement>(null);
    const previousFocusRef = useRef<Element | null>(null);
    const cleanupFocusTrapRef = useRef<(() => void) | null>(null);
    
    // Handle modal opening
    useEffect(() => {
      if (open && !isVisible) {
        setIsVisible(true);
        
        // Store current focus
        previousFocusRef.current = document.activeElement;
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        // Analytics tracking for Charlie integration
        if (trackingId && typeof window !== 'undefined') {
          const trackingData = {
            component: 'Modal',
            variant,
            size,
            migrationMode,
            costTier,
            confirmationType,
            action: 'open',
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
        
        onOpen?.();
      }
    }, [open, isVisible, trackingId, variant, size, migrationMode, costTier, confirmationType, migrationTooltip, onOpen]);
    
    // Handle modal closing
    useEffect(() => {
      if (!open && isVisible) {
        setIsVisible(false);
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        // Cleanup focus trap
        if (cleanupFocusTrapRef.current) {
          cleanupFocusTrapRef.current();
          cleanupFocusTrapRef.current = null;
        }
        
        // Return focus
        const returnElement = returnFocus 
          ? document.querySelector(returnFocus)
          : previousFocusRef.current;
        
        if (returnElement && 'focus' in returnElement) {
          (returnElement as HTMLElement).focus();
        }
        
        onClose?.();
      }
    }, [open, isVisible, returnFocus, onClose]);
    
    // Setup focus trap when modal becomes visible
    useEffect(() => {
      if (isVisible && modalRef.current) {
        // Setup focus trap
        cleanupFocusTrapRef.current = focusManagement.trapFocus(modalRef.current);
        
        // Focus initial element
        setTimeout(() => {
          if (modalRef.current) {
            const focusElement = initialFocus 
              ? modalRef.current.querySelector(initialFocus)
              : modalRef.current.querySelector('[data-autofocus="true"]') ||
                modalRef.current.querySelector('button') ||
                modalRef.current;
            
            if (focusElement && 'focus' in focusElement) {
              (focusElement as HTMLElement).focus();
            }
          }
        }, 100);
      }
    }, [isVisible, initialFocus]);
    
    // Handle escape key
    useEffect(() => {
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === keyboardNavigation.shortcuts.ESCAPE && isVisible && closeOnEscape) {
          event.preventDefault();
          onEscapePress?.();
          onClose?.();
        }
      };
      
      if (isVisible) {
        document.addEventListener('keydown', handleEscape);
      }
      
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }, [isVisible, closeOnEscape, onEscapePress, onClose]);
    
    // Handle backdrop click
    const handleBackdropClick = useCallback((event: React.MouseEvent) => {
      if (event.target === backdropRef.current && closeOnBackdrop) {
        onBackdropClick?.();
        onClose?.();
      }
    }, [closeOnBackdrop, onBackdropClick, onClose]);
    
    // Don't render if not visible
    if (!isVisible) {
      return null;
    }
    
    // Get computed styles
    const modalStyles = getModalStyles({
      variant,
      size,
      migrationMode,
      loading,
      costTier,
      confirmationType
    });
    
    // Header styles
    const headerStyles: React.CSSProperties = {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      padding: `${spacing[6]} ${spacing[6]} ${spacing[4]}`,
      borderBottom: title || subtitle ? `1px solid ${colors.neutral[100]}` : 'none'
    };
    
    // Title styles
    const titleStyles: React.CSSProperties = {
      fontSize: variant === 'confirmation' ? typography.fontSize.lg : typography.fontSize.xl,
      fontWeight: typography.fontWeight.semibold,
      color: colors.neutral[900],
      lineHeight: typography.lineHeight.tight,
      margin: 0,
      flex: 1
    };
    
    // Content styles
    const contentStyles: React.CSSProperties = {
      padding: spacing[6],
      flex: 1,
      overflow: 'auto'
    };
    
    // Footer styles
    const footerStyles: React.CSSProperties = {
      display: 'flex',
      gap: spacing[3],
      justifyContent: 'flex-end',
      alignItems: 'center',
      padding: `${spacing[4]} ${spacing[6]} ${spacing[6]}`,
      borderTop: footer || primaryAction || secondaryAction ? `1px solid ${colors.neutral[100]}` : 'none'
    };
    
    // Close button styles
    const closeButtonStyles: React.CSSProperties = {
      position: 'absolute',
      top: spacing[4],
      right: spacing[4],
      width: '32px',
      height: '32px',
      border: 'none',
      backgroundColor: 'transparent',
      borderRadius: borderRadius.full,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: colors.neutral[500],
      fontSize: '20px',
      transition: transitions.common.colors,
      zIndex: 1
    };
    
    // Confirmation icon styles
    const confirmationIconStyles: React.CSSProperties = {
      width: '48px',
      height: '48px',
      borderRadius: borderRadius.full,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px',
      marginBottom: spacing[4],
      color: 'white'
    };
    
    if (variant === 'confirmation' && confirmationType) {
      const iconColors = {
        danger: colors.error[500],
        warning: colors.warning[500],
        info: colors.primary[500],
        success: colors.success[500]
      };
      confirmationIconStyles.backgroundColor = iconColors[confirmationType];
    }
    
    return (
      <div
        ref={backdropRef}
        className="design-system-modal-backdrop"
        style={modalStyles.backdrop}
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-describedby={children ? 'modal-content' : undefined}
      >
        <div
          ref={modalRef}
          className={`design-system-modal ${className}`}
          style={modalStyles.container}
          data-variant={variant}
          data-size={size}
          data-migration-mode={migrationMode}
          data-cost-tier={costTier}
          data-tracking-id={trackingId}
          {...props}
        >
          {/* Close Button */}
          {showCloseButton && (
            <button
              type="button"
              style={closeButtonStyles}
              onClick={onClose}
              aria-label={screenReaderSupport.ariaLabels.close}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.neutral[100];
                e.currentTarget.style.color = colors.neutral[700];
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = colors.neutral[500];
              }}
            >
              ×
            </button>
          )}
          
          {/* Header */}
          {(header || title || subtitle || stepCount) && (
            <div style={headerStyles}>
              <div style={{ flex: 1 }}>
                {/* Feature Intro Step Count */}
                {variant === 'feature-intro' && stepCount && (
                  <div style={{ 
                    fontSize: typography.fontSize.sm,
                    color: colors.neutral[600],
                    marginBottom: spacing[2]
                  }}>
                    Passo {stepCount.current} de {stepCount.total}
                  </div>
                )}
                
                {/* Custom Header */}
                {header && header}
                
                {/* Title */}
                {title && (
                  <h2 id={`modal-title-${finalId}`} style={titleStyles}>
                    {title}
                  </h2>
                )}
                
                {/* Subtitle */}
                {subtitle && (
                  <p style={{
                    fontSize: typography.fontSize.sm,
                    color: colors.neutral[600],
                    lineHeight: typography.lineHeight.normal,
                    margin: `${spacing[2]} 0 0 0`
                  }}>
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
          )}
          
          {/* Content */}
          <div id={`modal-content-${finalId}`} style={contentStyles}>
            {/* Confirmation Icon */}
            {variant === 'confirmation' && (icon || confirmationType) && (
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: spacing[4] }}>
                <div style={confirmationIconStyles}>
                  {icon || (confirmationType === 'danger' ? '⚠️' : 
                           confirmationType === 'warning' ? '⚠️' :
                           confirmationType === 'info' ? 'ℹ️' : '✓')}
                </div>
              </div>
            )}
            
            {children}
          </div>
          
          {/* Footer */}
          {(footer || primaryAction || secondaryAction) && (
            <div style={footerStyles}>
              {footer && footer}
              
              {/* Action Buttons */}
              {(primaryAction || secondaryAction) && (
                <div style={{ display: 'flex', gap: spacing[3] }}>
                  {secondaryAction}
                  {primaryAction}
                </div>
              )}
            </div>
          )}
          
          {/* Loading Overlay */}
          {loading && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: modalStyles.container.borderRadius,
              zIndex: 2
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                border: '3px solid transparent',
                borderTop: `3px solid ${colors.primary[500]}`,
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            </div>
          )}
          
          {/* Migration Tooltip */}
          {migrationTooltip && (
            <span className="sr-only">
              {migrationTooltip}
            </span>
          )}
        </div>
      </div>
    );
  }
);

Modal.displayName = 'Modal';

// ============================================================================
// MODAL VARIANTS (Pre-configured)
// ============================================================================

export const BasicModal = forwardRef<HTMLDivElement, Omit<ModalProps, 'variant'>>(
  (props, ref) => <Modal ref={ref} variant="basic" {...props} />
);

export const ConfirmationModal = forwardRef<HTMLDivElement, Omit<ModalProps, 'variant'>>(
  (props, ref) => <Modal ref={ref} variant="confirmation" {...props} />
);

export const FeatureIntroModal = forwardRef<HTMLDivElement, Omit<ModalProps, 'variant'>>(
  (props, ref) => <Modal ref={ref} variant="feature-intro" {...props} />
);

export const FullscreenModal = forwardRef<HTMLDivElement, Omit<ModalProps, 'variant'>>(
  (props, ref) => <Modal ref={ref} variant="fullscreen" {...props} />
);

// ============================================================================
// MIGRATION-SPECIFIC MODAL VARIANTS
// ============================================================================

export const FamiliarModal = forwardRef<HTMLDivElement, Omit<ModalProps, 'migrationMode'>>(
  (props, ref) => <Modal ref={ref} migrationMode="familiar" {...props} />
);

export const EnhancedModal = forwardRef<HTMLDivElement, Omit<ModalProps, 'migrationMode'>>(
  (props, ref) => <Modal ref={ref} migrationMode="enhanced" {...props} />
);

// ============================================================================
// COST TIER MODALS (Alpha Integration)
// ============================================================================

export const FreeModal = forwardRef<HTMLDivElement, Omit<ModalProps, 'costTier'>>(
  (props, ref) => <Modal ref={ref} costTier="free" {...props} />
);

export const PremiumModal = forwardRef<HTMLDivElement, Omit<ModalProps, 'costTier'>>(
  (props, ref) => <Modal ref={ref} costTier="premium" {...props} />
);

// ============================================================================
// MODAL HOOKS
// ============================================================================

export const useModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);
  const toggleModal = useCallback(() => setIsOpen(prev => !prev), []);
  
  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal
  };
};

// ============================================================================
// EXPORT ALL MODAL COMPONENTS
// ============================================================================

export default Modal;

export {
  type ModalProps,
  type ModalStyleProps
}; 