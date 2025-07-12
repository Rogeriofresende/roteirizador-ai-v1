/**
 * 🔍 ProgressiveDisclosure Component - Migration System
 * 
 * System for gradual feature revelation with phase-based rollout support
 * User comfort patterns implementation and migration orchestration integration
 * 
 * Part of: WEEK 0 Days 3-4 - IA Beta Migration Components
 * Integration: Migration services + User comfort patterns + Alpha cost tiers + Charlie monitoring
 */

import React, { 
  forwardRef, 
  ReactNode, 
  useState, 
  useEffect, 
  useRef,
  HTMLAttributes 
} from 'react';
import { colors, spacing, typography, borderRadius, shadows, transitions } from '../../tokens';
import { progressiveEnhancement, userComfortPatterns } from '../../migration-patterns';
import { screenReaderSupport } from '../../accessibility';

// ============================================================================
// PROGRESSIVE DISCLOSURE TYPES & INTERFACES
// ============================================================================

export interface DisclosurePhase {
  id: string;
  name: string;
  description?: string;
  order: number;
  content: ReactNode;
  delay?: number;
  duration?: number;
  condition?: () => boolean;
  onReveal?: () => void;
  onComplete?: () => void;
}

export interface ProgressiveDisclosureProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Disclosure phases */
  phases: DisclosurePhase[];
  
  /** Current active phase */
  currentPhase?: number;
  
  /** Auto advance to next phase */
  autoAdvance?: boolean;
  
  /** Interval between auto advances (ms) */
  autoAdvanceInterval?: number;
  
  /** Allow manual phase navigation */
  allowManualNavigation?: boolean;
  
  /** Show phase indicators */
  showPhaseIndicators?: boolean;
  
  /** Disclosure trigger */
  trigger?: 'auto' | 'manual' | 'scroll' | 'hover' | 'click';
  
  /** Scroll offset for scroll trigger */
  scrollOffset?: number;
  
  /** Animation variant */
  animation?: 'fade' | 'slide' | 'grow' | 'flip' | 'none';
  
  /** Cost tier for Alpha integration */
  costTier?: 'free' | 'premium';
  
  /** Migration phase */
  migrationPhase?: 'foundation' | 'enhancement' | 'modernization';
  
  /** User comfort level */
  userComfortLevel?: 'beginner' | 'intermediate' | 'advanced';
  
  /** Analytics tracking for Charlie integration */
  trackingId?: string;
  
  /** Pause disclosure on user interaction */
  pauseOnInteraction?: boolean;
  
  /** Reset on completion */
  resetOnComplete?: boolean;
  
  /** Callback when phase changes */
  onPhaseChange?: (phase: number, phaseData: DisclosurePhase) => void;
  
  /** Callback when disclosure starts */
  onStart?: () => void;
  
  /** Callback when disclosure completes */
  onComplete?: () => void;
  
  /** Callback when user interacts */
  onInteraction?: (type: string) => void;
}

// ============================================================================
// PROGRESSIVE DISCLOSURE STYLES
// ============================================================================

const getDisclosureStyles = (
  animation: ProgressiveDisclosureProps['animation'] = 'fade',
  costTier: ProgressiveDisclosureProps['costTier'] = 'free',
  migrationPhase: ProgressiveDisclosureProps['migrationPhase'] = 'foundation'
): React.CSSProperties => {
  
  const baseStyles: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden'
  };
  
  // Migration phase specific styles
  const phaseStyles = {
    foundation: {
      // Gentle, familiar patterns
      borderRadius: borderRadius.base,
      transition: transitions.common.all
    },
    enhancement: {
      // Enhanced with subtle improvements
      borderRadius: borderRadius.md,
      transition: transitions.common.all,
      boxShadow: shadows.sm
    },
    modernization: {
      // Full modern design
      borderRadius: borderRadius.lg,
      transition: transitions.common.all,
      boxShadow: shadows.md
    }
  };
  
  return {
    ...baseStyles,
    ...phaseStyles[migrationPhase]
  };
};

const getPhaseStyles = (
  revealed: boolean,
  animation: ProgressiveDisclosureProps['animation'] = 'fade'
): React.CSSProperties => {
  
  const baseStyles: React.CSSProperties = {
    transition: transitions.common.all
  };
  
  if (!revealed) {
    switch (animation) {
      case 'fade':
        return {
          ...baseStyles,
          opacity: 0,
          visibility: 'hidden'
        };
      case 'slide':
        return {
          ...baseStyles,
          opacity: 0,
          transform: 'translateY(20px)',
          visibility: 'hidden'
        };
      case 'grow':
        return {
          ...baseStyles,
          opacity: 0,
          transform: 'scale(0.8)',
          visibility: 'hidden'
        };
      case 'flip':
        return {
          ...baseStyles,
          opacity: 0,
          transform: 'rotateX(90deg)',
          visibility: 'hidden'
        };
      case 'none':
        return {
          display: 'none'
        };
      default:
        return {
          ...baseStyles,
          opacity: 0,
          visibility: 'hidden'
        };
    }
  }
  
  return {
    ...baseStyles,
    opacity: 1,
    transform: 'none',
    visibility: 'visible',
    display: 'block'
  };
};

// ============================================================================
// PROGRESSIVE DISCLOSURE COMPONENT
// ============================================================================

export const ProgressiveDisclosure = forwardRef<HTMLDivElement, ProgressiveDisclosureProps>(
  ({
    phases,
    currentPhase = 0,
    autoAdvance = false,
    autoAdvanceInterval = 3000,
    allowManualNavigation = true,
    showPhaseIndicators = true,
    trigger = 'auto',
    scrollOffset = 100,
    animation = 'fade',
    costTier = 'free',
    migrationPhase = 'foundation',
    userComfortLevel = 'intermediate',
    trackingId,
    pauseOnInteraction = true,
    resetOnComplete = false,
    onPhaseChange,
    onStart,
    onComplete,
    onInteraction,
    className = '',
    ...props
  }, ref) => {
    
    const [activePhase, setActivePhase] = useState(currentPhase);
    const [revealedPhases, setRevealedPhases] = useState<Set<number>>(new Set([currentPhase]));
    const [isRunning, setIsRunning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    
    const disclosureRef = useRef<HTMLDivElement>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);
    
    // Sort phases by order
    const sortedPhases = [...phases].sort((a, b) => a.order - b.order);
    
    // Start disclosure
    const startDisclosure = () => {
      if (hasStarted) return;
      
      setHasStarted(true);
      setIsRunning(true);
      
      // Analytics tracking
      if (trackingId && typeof window !== 'undefined') {
        const trackingData = {
          component: 'ProgressiveDisclosure',
          action: 'disclosure_started',
          totalPhases: sortedPhases.length,
          migrationPhase,
          userComfortLevel,
          costTier,
          trackingId,
          timestamp: new Date().toISOString()
        };
        
        window.dispatchEvent(new CustomEvent('design-system-interaction', {
          detail: trackingData
        }));
      }
      
      // Screen reader announcement
      screenReaderSupport.announceToScreenReader(
        `Revelação progressiva iniciada. ${sortedPhases.length} fases serão reveladas.`,
        'polite'
      );
      
      onStart?.();
    };
    
    // Advance to next phase
    const advancePhase = () => {
      if (activePhase < sortedPhases.length - 1) {
        const nextPhase = activePhase + 1;
        const phaseData = sortedPhases[nextPhase];
        
        // Check condition if exists
        if (phaseData.condition && !phaseData.condition()) {
          return;
        }
        
        setActivePhase(nextPhase);
        setRevealedPhases(prev => new Set(prev).add(nextPhase));
        
        // Analytics tracking
        if (trackingId && typeof window !== 'undefined') {
          const trackingData = {
            component: 'ProgressiveDisclosure',
            action: 'phase_revealed',
            phaseId: phaseData.id,
            phaseName: phaseData.name,
            phaseOrder: phaseData.order,
            currentPhase: nextPhase,
            totalPhases: sortedPhases.length,
            migrationPhase,
            userComfortLevel,
            costTier,
            trackingId,
            timestamp: new Date().toISOString()
          };
          
          window.dispatchEvent(new CustomEvent('design-system-interaction', {
            detail: trackingData
          }));
        }
        
        // Screen reader announcement
        screenReaderSupport.announceToScreenReader(
          `Fase ${nextPhase + 1} revelada: ${phaseData.name}${phaseData.description ? '. ' + phaseData.description : ''}`,
          'polite'
        );
        
        onPhaseChange?.(nextPhase, phaseData);
        phaseData.onReveal?.();
        
        // Check if completed
        if (nextPhase === sortedPhases.length - 1) {
          setIsRunning(false);
          
          setTimeout(() => {
            onComplete?.();
            sortedPhases[nextPhase].onComplete?.();
            
            // Screen reader announcement
            screenReaderSupport.announceToScreenReader(
              'Revelação progressiva concluída. Todas as funcionalidades foram reveladas.',
              'polite'
            );
            
            if (resetOnComplete) {
              setTimeout(() => resetDisclosure(), 2000);
            }
          }, phaseData.duration || 1000);
        }
      }
    };
    
    // Reset disclosure
    const resetDisclosure = () => {
      setActivePhase(0);
      setRevealedPhases(new Set([0]));
      setIsRunning(false);
      setIsPaused(false);
      setHasStarted(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    
    // Manual navigation
    const goToPhase = (phaseIndex: number) => {
      if (!allowManualNavigation || phaseIndex < 0 || phaseIndex >= sortedPhases.length) {
        return;
      }
      
      const phaseData = sortedPhases[phaseIndex];
      
      // Check condition if exists
      if (phaseData.condition && !phaseData.condition()) {
        return;
      }
      
      setActivePhase(phaseIndex);
      setRevealedPhases(prev => new Set(prev).add(phaseIndex));
      
      // Track interaction
      if (pauseOnInteraction) {
        setIsPaused(true);
      }
      
      onInteraction?.('manual_navigation');
      onPhaseChange?.(phaseIndex, phaseData);
    };
    
    // Auto advance effect
    useEffect(() => {
      if (autoAdvance && isRunning && !isPaused) {
        intervalRef.current = setInterval(() => {
          advancePhase();
        }, autoAdvanceInterval);
        
        return () => {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
        };
      }
    }, [autoAdvance, isRunning, isPaused, activePhase, autoAdvanceInterval]);
    
    // Trigger effects
    useEffect(() => {
      switch (trigger) {
        case 'auto':
          startDisclosure();
          break;
          
        case 'scroll':
          observerRef.current = new IntersectionObserver(
            (entries) => {
              if (entries[0].isIntersecting) {
                startDisclosure();
              }
            },
            { rootMargin: `${scrollOffset}px` }
          );
          
          if (disclosureRef.current) {
            observerRef.current.observe(disclosureRef.current);
          }
          
          return () => {
            if (observerRef.current) {
              observerRef.current.disconnect();
            }
          };
          
        default:
          break;
      }
    }, [trigger, scrollOffset]);
    
    // User comfort adjustments
    const getComfortAdjustments = () => {
      switch (userComfortLevel) {
        case 'beginner':
          return {
            showMore: true,
            slowerPace: true,
            extraGuidance: true
          };
        case 'intermediate':
          return {
            showMore: false,
            slowerPace: false,
            extraGuidance: false
          };
        case 'advanced':
          return {
            showMore: false,
            slowerPace: false,
            extraGuidance: false,
            fastTrack: true
          };
        default:
          return {};
      }
    };
    
    const comfortAdjustments = getComfortAdjustments();
    
    // Trigger handlers
    const handleClick = () => {
      if (trigger === 'click' && !hasStarted) {
        startDisclosure();
      } else if (trigger === 'click' && isRunning) {
        advancePhase();
      }
      
      onInteraction?.('click');
    };
    
    const handleMouseEnter = () => {
      if (trigger === 'hover' && !hasStarted) {
        startDisclosure();
      }
      
      onInteraction?.('hover');
    };
    
    // Get computed styles
    const disclosureStyles = getDisclosureStyles(animation, costTier, migrationPhase);
    
    return (
      <div
        ref={disclosureRef}
        className={`design-system-progressive-disclosure ${className}`}
        style={disclosureStyles}
        data-migration-phase={migrationPhase}
        data-user-comfort={userComfortLevel}
        data-cost-tier={costTier}
        data-tracking-id={trackingId}
        data-active-phase={activePhase}
        data-running={isRunning}
        onClick={trigger === 'click' ? handleClick : props.onClick}
        onMouseEnter={trigger === 'hover' ? handleMouseEnter : props.onMouseEnter}
        {...props}
      >
        {/* Phase Indicators */}
        {showPhaseIndicators && (
          <div style={{
            display: 'flex',
            gap: spacing[2],
            marginBottom: spacing[4],
            justifyContent: 'center'
          }}>
            {sortedPhases.map((phase, index) => (
              <button
                key={phase.id}
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: revealedPhases.has(index) 
                    ? (costTier === 'premium' ? colors.costTier.premium.primary : colors.primary[500])
                    : colors.neutral[300],
                  cursor: allowManualNavigation ? 'pointer' : 'default',
                  transition: transitions.common.all,
                  opacity: index === activePhase ? 1 : 0.7
                }}
                onClick={() => goToPhase(index)}
                disabled={!allowManualNavigation}
                aria-label={`Fase ${index + 1}: ${phase.name}`}
                aria-current={index === activePhase ? 'step' : undefined}
              />
            ))}
          </div>
        )}
        
        {/* Phases Content */}
        <div style={{ position: 'relative', minHeight: '100px' }}>
          {sortedPhases.map((phase, index) => (
            <div
              key={phase.id}
              style={{
                ...getPhaseStyles(revealedPhases.has(index), animation),
                ...(index === activePhase ? { zIndex: 1 } : { zIndex: 0 })
              }}
              aria-hidden={!revealedPhases.has(index)}
            >
              {phase.content}
            </div>
          ))}
        </div>
        
        {/* Controls */}
        {allowManualNavigation && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: spacing[4],
            gap: spacing[3]
          }}>
            <button
              style={{
                padding: `${spacing[2]} ${spacing[3]}`,
                backgroundColor: 'transparent',
                border: `1px solid ${colors.neutral[300]}`,
                borderRadius: borderRadius.md,
                cursor: activePhase > 0 ? 'pointer' : 'not-allowed',
                opacity: activePhase > 0 ? 1 : 0.5,
                fontSize: typography.fontSize.sm
              }}
              onClick={() => goToPhase(activePhase - 1)}
              disabled={activePhase === 0}
            >
              Anterior
            </button>
            
            <span style={{
              fontSize: typography.fontSize.sm,
              color: colors.neutral[600]
            }}>
              {activePhase + 1} de {sortedPhases.length}
            </span>
            
            <button
              style={{
                padding: `${spacing[2]} ${spacing[3]}`,
                backgroundColor: costTier === 'premium' ? colors.costTier.premium.primary : colors.primary[500],
                color: 'white',
                border: 'none',
                borderRadius: borderRadius.md,
                cursor: activePhase < sortedPhases.length - 1 ? 'pointer' : 'not-allowed',
                opacity: activePhase < sortedPhases.length - 1 ? 1 : 0.5,
                fontSize: typography.fontSize.sm
              }}
              onClick={() => goToPhase(activePhase + 1)}
              disabled={activePhase === sortedPhases.length - 1}
            >
              Próximo
            </button>
          </div>
        )}
        
        {/* User Comfort Guidance */}
        {comfortAdjustments.extraGuidance && (
          <div style={{
            marginTop: spacing[3],
            padding: spacing[3],
            backgroundColor: colors.primary[50],
            borderRadius: borderRadius.md,
            fontSize: typography.fontSize.sm,
            color: colors.neutral[700]
          }}>
            💡 Dica: Use as setas ou indicadores para navegar entre as fases no seu próprio ritmo.
          </div>
        )}
      </div>
    );
  }
);

ProgressiveDisclosure.displayName = 'ProgressiveDisclosure';

// ============================================================================
// PROGRESSIVE DISCLOSURE HOOKS
// ============================================================================

export const useProgressiveDisclosure = (phases: DisclosurePhase[]) => {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [completedPhases, setCompletedPhases] = useState<Set<string>>(new Set());
  
  const revealNext = () => {
    if (currentPhase < phases.length - 1) {
      setCurrentPhase(prev => prev + 1);
    }
  };
  
  const revealPrevious = () => {
    if (currentPhase > 0) {
      setCurrentPhase(prev => prev - 1);
    }
  };
  
  const markCompleted = (phaseId: string) => {
    setCompletedPhases(prev => new Set(prev).add(phaseId));
  };
  
  const reset = () => {
    setCurrentPhase(0);
    setCompletedPhases(new Set());
  };
  
  const isCompleted = (phaseId: string) => {
    return completedPhases.has(phaseId);
  };
  
  const progress = ((currentPhase + 1) / phases.length) * 100;
  
  return {
    currentPhase,
    setCurrentPhase,
    revealNext,
    revealPrevious,
    markCompleted,
    isCompleted,
    reset,
    progress,
    isFirstPhase: currentPhase === 0,
    isLastPhase: currentPhase === phases.length - 1
  };
};

// ============================================================================
// EXPORT ALL PROGRESSIVE DISCLOSURE COMPONENTS
// ============================================================================

export default ProgressiveDisclosure;

export {
  type ProgressiveDisclosureProps,
  type DisclosurePhase
}; 