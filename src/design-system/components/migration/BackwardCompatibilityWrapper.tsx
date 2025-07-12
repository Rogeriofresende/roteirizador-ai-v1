/**
 * 🔄 BackwardCompatibilityWrapper Component - Legacy Support
 * 
 * Wrapper for legacy component support with gradual enhancement patterns
 * Fallback behavior implementation and migration phase orchestration
 * 
 * Part of: WEEK 0 Days 3-4 - IA Beta Migration Components
 * Integration: Migration orchestration + User migration framework + Alpha cost tiers + Charlie monitoring
 */

import React, { 
  forwardRef, 
  ReactNode, 
  useState, 
  useEffect, 
  useRef,
  cloneElement,
  isValidElement,
  HTMLAttributes 
} from 'react';
import { colors, spacing, typography, borderRadius, shadows, transitions } from '../../tokens';
import { progressiveEnhancement, familiarElements, backwardCompatibility } from '../../migration-patterns';
import { screenReaderSupport } from '../../accessibility';

// ============================================================================
// BACKWARD COMPATIBILITY WRAPPER TYPES & INTERFACES
// ============================================================================

export interface LegacyComponent {
  component: ReactNode;
  version?: string;
  deprecated?: boolean;
  fallbackProps?: Record<string, any>;
  migrationPath?: string[];
}

export interface EnhancementPhase {
  id: string;
  name: string;
  order: number;
  description?: string;
  condition?: () => boolean;
  enhancement: (originalComponent: ReactNode, props: any) => ReactNode;
  rollbackMethod?: () => void;
  isBreaking?: boolean;
}

export interface BackwardCompatibilityWrapperProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Legacy component to wrap */
  legacyComponent: LegacyComponent;
  
  /** Modern component alternative */
  modernComponent?: ReactNode;
  
  /** Enhancement phases to apply */
  enhancementPhases?: EnhancementPhase[];
  
  /** Current migration phase */
  migrationPhase?: 'foundation' | 'enhancement' | 'modernization';
  
  /** Use legacy or modern component */
  useMode?: 'legacy' | 'modern' | 'auto';
  
  /** User migration preference */
  userPreference?: 'conservative' | 'balanced' | 'progressive';
  
  /** Fallback strategy */
  fallbackStrategy?: 'graceful' | 'immediate' | 'none';
  
  /** Show migration notice */
  showMigrationNotice?: boolean;
  
  /** Migration notice position */
  noticePosition?: 'top' | 'bottom' | 'overlay';
  
  /** Cost tier for Alpha integration */
  costTier?: 'free' | 'premium';
  
  /** Analytics tracking for Charlie integration */
  trackingId?: string;
  
  /** Feature flag for modern component */
  featureFlag?: boolean;
  
  /** A/B testing configuration */
  abTesting?: {
    enabled: boolean;
    variant: 'control' | 'treatment';
    splitRatio?: number;
  };
  
  /** Performance monitoring */
  performanceMonitoring?: boolean;
  
  /** Error boundary behavior */
  errorBoundary?: 'strict' | 'fallback' | 'none';
  
  /** Callback when component upgrades */
  onUpgrade?: (fromVersion: string, toVersion: string) => void;
  
  /** Callback when fallback is used */
  onFallback?: (reason: string) => void;
  
  /** Callback when enhancement is applied */
  onEnhancement?: (phaseId: string) => void;
  
  /** Callback when error occurs */
  onError?: (error: Error, componentInfo: any) => void;
}

// ============================================================================
// ERROR BOUNDARY COMPONENT
// ============================================================================

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
}

class CompatibilityErrorBoundary extends React.Component<
  { 
    children: ReactNode; 
    fallback: ReactNode; 
    onError?: (error: Error, errorInfo: any) => void;
    errorBoundary: 'strict' | 'fallback' | 'none';
  },
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.errorBoundary === 'strict') {
        throw this.state.error;
      } else if (this.props.errorBoundary === 'fallback') {
        return this.props.fallback;
      }
    }

    return this.props.children;
  }
}

// ============================================================================
// BACKWARD COMPATIBILITY WRAPPER COMPONENT
// ============================================================================

export const BackwardCompatibilityWrapper = forwardRef<HTMLDivElement, BackwardCompatibilityWrapperProps>(
  ({
    legacyComponent,
    modernComponent,
    enhancementPhases = [],
    migrationPhase = 'foundation',
    useMode = 'auto',
    userPreference = 'balanced',
    fallbackStrategy = 'graceful',
    showMigrationNotice = false,
    noticePosition = 'top',
    costTier = 'free',
    trackingId,
    featureFlag = true,
    abTesting,
    performanceMonitoring = false,
    errorBoundary = 'fallback',
    onUpgrade,
    onFallback,
    onEnhancement,
    onError,
    className = '',
    ...props
  }, ref) => {
    
    const [currentMode, setCurrentMode] = useState<'legacy' | 'modern'>('legacy');
    const [appliedEnhancements, setAppliedEnhancements] = useState<Set<string>>(new Set());
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [fallbackReason, setFallbackReason] = useState<string | null>(null);
    const [performanceMetrics, setPerformanceMetrics] = useState<any>({});
    
    const wrapperRef = useRef<HTMLDivElement>(null);
    const renderStartTime = useRef<number>(0);
    const componentMountTime = useRef<number>(0);
    
    // Performance monitoring
    useEffect(() => {
      if (performanceMonitoring) {
        componentMountTime.current = performance.now();
        
        return () => {
          const unmountTime = performance.now();
          const lifecycleTime = unmountTime - componentMountTime.current;
          
          setPerformanceMetrics(prev => ({
            ...prev,
            lifecycleTime,
            unmountTime
          }));
        };
      }
    }, [performanceMonitoring]);
    
    // Determine which component to use
    const determineComponentMode = (): 'legacy' | 'modern' => {
      // Feature flag check
      if (!featureFlag) {
        return 'legacy';
      }
      
      // A/B testing logic
      if (abTesting?.enabled) {
        if (abTesting.variant === 'control') {
          return 'legacy';
        } else if (abTesting.variant === 'treatment') {
          return 'modern';
        }
      }
      
      // Migration phase considerations
      switch (migrationPhase) {
        case 'foundation':
          return userPreference === 'progressive' ? 'modern' : 'legacy';
        case 'enhancement':
          return userPreference === 'conservative' ? 'legacy' : 'modern';
        case 'modernization':
          return 'modern';
        default:
          return 'legacy';
      }
    };
    
    // Apply enhancement phases
    const applyEnhancements = (component: ReactNode): ReactNode => {
      if (!enhancementPhases.length || !isValidElement(component)) {
        return component;
      }
      
      const sortedPhases = [...enhancementPhases].sort((a, b) => a.order - b.order);
      let enhancedComponent = component;
      
      for (const phase of sortedPhases) {
        // Check if phase should be applied
        if (phase.condition && !phase.condition()) {
          continue;
        }
        
        // Check if already applied
        if (appliedEnhancements.has(phase.id)) {
          continue;
        }
        
        try {
          enhancedComponent = phase.enhancement(enhancedComponent, props);
          
          setAppliedEnhancements(prev => new Set(prev).add(phase.id));
          
          // Analytics tracking
          if (trackingId && typeof window !== 'undefined') {
            const trackingData = {
              component: 'BackwardCompatibilityWrapper',
              action: 'enhancement_applied',
              phaseId: phase.id,
              phaseName: phase.name,
              migrationPhase,
              userPreference,
              costTier,
              trackingId,
              timestamp: new Date().toISOString()
            };
            
            window.dispatchEvent(new CustomEvent('design-system-interaction', {
              detail: trackingData
            }));
          }
          
          onEnhancement?.(phase.id);
          
        } catch (error) {
          console.warn(`Enhancement phase ${phase.id} failed:`, error);
          
          if (phase.isBreaking && fallbackStrategy === 'graceful') {
            setFallbackReason(`Enhancement phase ${phase.name} failed`);
            onFallback?.(`Enhancement phase ${phase.name} failed`);
            break;
          }
        }
      }
      
      return enhancedComponent;
    };
    
    // Handle component upgrade
    const handleUpgrade = () => {
      const fromVersion = legacyComponent.version || 'legacy';
      const toVersion = 'modern';
      
      setIsEnhancing(true);
      
      setTimeout(() => {
        setCurrentMode('modern');
        setIsEnhancing(false);
        
        // Analytics tracking
        if (trackingId && typeof window !== 'undefined') {
          const trackingData = {
            component: 'BackwardCompatibilityWrapper',
            action: 'component_upgraded',
            fromVersion,
            toVersion,
            migrationPhase,
            userPreference,
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
          'Componente atualizado para versão moderna. Novos recursos disponíveis.',
          'polite'
        );
        
        onUpgrade?.(fromVersion, toVersion);
      }, 300);
    };
    
    // Handle fallback
    const handleFallback = (reason: string) => {
      setCurrentMode('legacy');
      setFallbackReason(reason);
      
      // Analytics tracking
      if (trackingId && typeof window !== 'undefined') {
        const trackingData = {
          component: 'BackwardCompatibilityWrapper',
          action: 'fallback_triggered',
          reason,
          migrationPhase,
          userPreference,
          costTier,
          trackingId,
          timestamp: new Date().toISOString()
        };
        
        window.dispatchEvent(new CustomEvent('design-system-interaction', {
          detail: trackingData
        }));
      }
      
      onFallback?.(reason);
    };
    
    // Initialize component mode
    useEffect(() => {
      if (useMode === 'auto') {
        const determinedMode = determineComponentMode();
        setCurrentMode(determinedMode);
      } else {
        setCurrentMode(useMode as 'legacy' | 'modern');
      }
    }, [useMode, migrationPhase, userPreference, featureFlag, abTesting]);
    
    // Performance measurement
    useEffect(() => {
      if (performanceMonitoring) {
        renderStartTime.current = performance.now();
      }
    });
    
    useEffect(() => {
      if (performanceMonitoring && renderStartTime.current) {
        const renderTime = performance.now() - renderStartTime.current;
        
        setPerformanceMetrics(prev => ({
          ...prev,
          renderTime,
          componentMode: currentMode,
          enhancementsApplied: appliedEnhancements.size
        }));
      }
    }, [currentMode, appliedEnhancements, performanceMonitoring]);
    
    // Get component to render
    const getComponentToRender = (): ReactNode => {
      try {
        if (currentMode === 'modern' && modernComponent) {
          return applyEnhancements(modernComponent);
        } else {
          return applyEnhancements(legacyComponent.component);
        }
      } catch (error) {
        console.error('Component rendering failed:', error);
        
        if (fallbackStrategy === 'graceful') {
          handleFallback('Component rendering failed');
          return legacyComponent.component;
        } else if (fallbackStrategy === 'immediate') {
          return legacyComponent.component;
        } else {
          throw error;
        }
      }
    };
    
    // Migration notice component
    const renderMigrationNotice = () => {
      if (!showMigrationNotice) return null;
      
      const noticeStyles: React.CSSProperties = {
        padding: spacing[3],
        backgroundColor: costTier === 'premium' ? colors.costTier.premium.background : colors.primary[50],
        color: costTier === 'premium' ? colors.costTier.premium.primary : colors.primary[700],
        border: `1px solid ${costTier === 'premium' ? colors.costTier.premium.border : colors.primary[200]}`,
        borderRadius: borderRadius.md,
        fontSize: typography.fontSize.sm,
        margin: noticePosition === 'top' ? `0 0 ${spacing[3]} 0` : 
               noticePosition === 'bottom' ? `${spacing[3]} 0 0 0` : '0',
        position: noticePosition === 'overlay' ? 'absolute' : 'static',
        top: noticePosition === 'overlay' ? spacing[2] : undefined,
        right: noticePosition === 'overlay' ? spacing[2] : undefined,
        zIndex: noticePosition === 'overlay' ? 10 : undefined,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing[3]
      };
      
      return (
        <div style={noticeStyles} role="alert">
          <div>
            <strong>Migração Disponível:</strong> 
            {currentMode === 'legacy' ? 
              ' Este componente pode ser atualizado para uma versão moderna com novos recursos.' :
              ' Você está usando a versão moderna deste componente.'
            }
            {fallbackReason && (
              <div style={{ fontSize: typography.fontSize.xs, marginTop: spacing[1] }}>
                Motivo do fallback: {fallbackReason}
              </div>
            )}
          </div>
          
          {currentMode === 'legacy' && modernComponent && (
            <button
              style={{
                padding: `${spacing[1]} ${spacing[3]}`,
                backgroundColor: costTier === 'premium' ? colors.costTier.premium.primary : colors.primary[500],
                color: 'white',
                border: 'none',
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.sm,
                cursor: 'pointer',
                transition: transitions.common.all
              }}
              onClick={handleUpgrade}
              disabled={isEnhancing}
            >
              {isEnhancing ? 'Atualizando...' : 'Atualizar'}
            </button>
          )}
        </div>
      );
    };
    
    // Component styles
    const wrapperStyles: React.CSSProperties = {
      position: 'relative',
      transition: transitions.common.all,
      opacity: isEnhancing ? 0.7 : 1
    };
    
    // Render component with error boundary
    const renderWithErrorBoundary = (component: ReactNode) => {
      if (errorBoundary === 'none') {
        return component;
      }
      
      return (
        <CompatibilityErrorBoundary
          fallback={legacyComponent.component}
          onError={onError}
          errorBoundary={errorBoundary}
        >
          {component}
        </CompatibilityErrorBoundary>
      );
    };
    
    const componentToRender = getComponentToRender();
    
    return (
      <div
        ref={wrapperRef}
        className={`design-system-backward-compatibility-wrapper ${className}`}
        style={wrapperStyles}
        data-migration-phase={migrationPhase}
        data-user-preference={userPreference}
        data-current-mode={currentMode}
        data-cost-tier={costTier}
        data-tracking-id={trackingId}
        data-fallback-reason={fallbackReason}
        data-enhancements-count={appliedEnhancements.size}
        {...props}
      >
        {/* Migration Notice */}
        {noticePosition === 'top' && renderMigrationNotice()}
        
        {/* Component */}
        {renderWithErrorBoundary(componentToRender)}
        
        {/* Migration Notice */}
        {noticePosition === 'bottom' && renderMigrationNotice()}
        {noticePosition === 'overlay' && renderMigrationNotice()}
        
        {/* Performance Debug Info (Development only) */}
        {performanceMonitoring && process.env.NODE_ENV === 'development' && (
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: spacing[2],
            fontSize: typography.fontSize.xs,
            borderRadius: `0 0 ${borderRadius.md} ${borderRadius.md}`
          }}>
            Mode: {currentMode} | Render: {performanceMetrics.renderTime?.toFixed(2)}ms | 
            Enhancements: {appliedEnhancements.size}
          </div>
        )}
      </div>
    );
  }
);

BackwardCompatibilityWrapper.displayName = 'BackwardCompatibilityWrapper';

// ============================================================================
// BACKWARD COMPATIBILITY WRAPPER HOOKS
// ============================================================================

export const useBackwardCompatibility = () => {
  const [migrationState, setMigrationState] = useState({
    isUpgrading: false,
    currentVersion: 'legacy',
    appliedEnhancements: new Set<string>(),
    lastError: null as Error | null
  });
  
  const upgradeComponent = (callback?: () => void) => {
    setMigrationState(prev => ({ ...prev, isUpgrading: true }));
    
    setTimeout(() => {
      setMigrationState(prev => ({
        ...prev,
        isUpgrading: false,
        currentVersion: 'modern'
      }));
      callback?.();
    }, 300);
  };
  
  const rollbackComponent = () => {
    setMigrationState(prev => ({
      ...prev,
      currentVersion: 'legacy',
      appliedEnhancements: new Set()
    }));
  };
  
  const applyEnhancement = (enhancementId: string) => {
    setMigrationState(prev => ({
      ...prev,
      appliedEnhancements: new Set(prev.appliedEnhancements).add(enhancementId)
    }));
  };
  
  const handleError = (error: Error) => {
    setMigrationState(prev => ({ ...prev, lastError: error }));
  };
  
  const clearError = () => {
    setMigrationState(prev => ({ ...prev, lastError: null }));
  };
  
  return {
    migrationState,
    upgradeComponent,
    rollbackComponent,
    applyEnhancement,
    handleError,
    clearError,
    isModern: migrationState.currentVersion === 'modern',
    isUpgrading: migrationState.isUpgrading,
    enhancementsCount: migrationState.appliedEnhancements.size
  };
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const createEnhancementPhase = (
  id: string,
  name: string,
  order: number,
  enhancement: (component: ReactNode, props: any) => ReactNode,
  options?: Partial<EnhancementPhase>
): EnhancementPhase => {
  return {
    id,
    name,
    order,
    enhancement,
    ...options
  };
};

export const createLegacyComponent = (
  component: ReactNode,
  options?: Partial<LegacyComponent>
): LegacyComponent => {
  return {
    component,
    version: 'legacy',
    deprecated: false,
    ...options
  };
};

// ============================================================================
// EXPORT ALL BACKWARD COMPATIBILITY COMPONENTS
// ============================================================================

export default BackwardCompatibilityWrapper;

export {
  type BackwardCompatibilityWrapperProps,
  type LegacyComponent,
  type EnhancementPhase
}; 