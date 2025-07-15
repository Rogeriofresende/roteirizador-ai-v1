import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  Smartphone,
  Zap,
  Target,
  Sparkles,
  TrendingUp,
  Users,
  Brain,
  Eye,
  Settings
} from 'lucide-react';
import { PLATFORM_OPTIONS } from '../../constants';
import { animationClasses, darkModeClasses } from '../../design-system/tokens';
import { PlatformLogo } from '../ui/PlatformLogos';
import { SmartLoading } from '../ui/SmartLoading';
import { usePredictiveUX } from '../../hooks/usePredictiveUX';

// Layout.Section - V7.5 Enhanced Structure
const Layout = {
  Section: ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`relative ${className}`}>{children}</div>
  ),
  Container: ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`flex flex-col space-y-3 ${className}`}>{children}</div>
  ),
  Row: ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`flex items-center space-x-2 ${className}`}>{children}</div>
  ),
  Grid: ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`grid gap-4 ${className}`}>{children}</div>
  )
};

// V7.5 Enhanced Types
type ValidationState = 'error' | 'success' | 'neutral';
type SizeVariant = 'sm' | 'md' | 'lg';
type StyleVariant = 'default' | 'outlined' | 'filled' | 'minimal';
type Platform = 'YouTube' | 'Instagram' | 'TikTok' | '';

interface PlatformSelectorEnhancedProps {
  selectedPlatform: Platform;
  onPlatformChange: (platform: Platform) => void;
  disabled?: boolean;
  
  // V7.5 Enhanced Props
  validationState?: ValidationState;
  errorMessage?: string;
  successMessage?: string;
  helperText?: string;
  size?: SizeVariant;
  variant?: StyleVariant;
  required?: boolean;
  showPredictiveIndicators?: boolean;
  showAdvancedFeatures?: boolean;
  showDarkModeFeatures?: boolean;
  compactMode?: boolean;
  'aria-describedby'?: string;
  'aria-label'?: string;
}

// V7.5 Enhanced Styling System
const getEnhancedSelectorStyles = (
  validationState: ValidationState,
  size: SizeVariant,
  variant: StyleVariant,
  disabled: boolean
) => {
  const baseContainer = `transition-all duration-200 ease-in-out ${animationClasses.themeTransition}`;
  
  // Grid size variants
  const gridSizes = {
    sm: 'grid-cols-1 sm:grid-cols-3 gap-3',
    md: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
    lg: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
  };
  
  // Button size variants
  const buttonSizes = {
    sm: 'min-h-[70px] p-3 text-xs',
    md: 'min-h-[80px] p-4 text-sm',
    lg: 'min-h-[100px] p-5 text-base'
  };
  
  return {
    container: `${baseContainer} ${disabled ? 'opacity-60' : ''}`,
    grid: gridSizes[size],
    buttonSize: buttonSizes[size]
  };
};

// V7.5 Enhanced Feature Indicators Component  
const EnhancedFeatureIndicators: React.FC<{
  validationState: ValidationState;
  predictedCount: number;
  selectedPlatform: Platform;
  showAdvancedFeatures: boolean;
  showDarkModeFeatures: boolean;
  isLoading: boolean;
  size: SizeVariant;
}> = ({ validationState, predictedCount, selectedPlatform, showAdvancedFeatures, showDarkModeFeatures, isLoading, size }) => {
  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 20 : 16;
  
  return (
    <Layout.Row className="justify-between items-center">
      <Layout.Row>
        {validationState === 'error' && (
          <AlertCircle 
            size={iconSize} 
            className="text-red-500 animate-pulse" 
            aria-label="Erro de validação"
          />
        )}
        {validationState === 'success' && (
          <CheckCircle2 
            size={iconSize} 
            className="text-green-500" 
            aria-label="Seleção válida"
          />
        )}
        {validationState === 'neutral' && (
          <Info 
            size={iconSize} 
            className="text-blue-500" 
            aria-label="Informação"
          />
        )}
        
        {selectedPlatform && (
          <Smartphone 
            size={iconSize} 
            className="text-purple-500" 
            aria-label="Plataforma selecionada"
          />
        )}
        
        {predictedCount > 0 && showAdvancedFeatures && (
          <Brain 
            size={iconSize} 
            className="text-blue-500 animate-pulse" 
            aria-label={`${predictedCount} predições ativas`}
          />
        )}
        
        {isLoading && (
          <TrendingUp 
            size={iconSize} 
            className="text-orange-500 animate-pulse" 
            aria-label="Carregamento inteligente"
          />
        )}
      </Layout.Row>
      
      <Layout.Row>
        {showAdvancedFeatures && (
          <>
            <Zap 
              size={iconSize - 2} 
              className="text-yellow-500" 
              aria-label="Micro-interactions ativas"
            />
            <Target 
              size={iconSize - 2} 
              className="text-green-500" 
              aria-label="Sistema preditivo Phase 6"
            />
          </>
        )}
        {showDarkModeFeatures && (
          <Eye 
            size={iconSize - 2} 
            className="text-indigo-500" 
            aria-label="Dark mode support"
          />
        )}
      </Layout.Row>
    </Layout.Row>
  );
};

// Enhanced Smart Loading with V7.5 styling
const EnhancedSmartLoadingIndicator: React.FC<{
  isLoading: boolean;
  loadingProgress: number;
  size: SizeVariant;
  variant: StyleVariant;
  showAdvancedFeatures: boolean;
}> = ({ isLoading, loadingProgress, size, variant, showAdvancedFeatures }) => {
  if (!isLoading) return null;
  
  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 24 : 20;
  
  return (
    <Layout.Section className="mb-4">
      <Layout.Row className="items-center space-x-3">
        {showAdvancedFeatures && (
          <Brain 
            size={iconSize} 
            className="text-blue-500 animate-pulse" 
            aria-hidden="true"
          />
        )}
        <Layout.Section className="flex-1">
          <SmartLoading
            isLoading={isLoading}
            progress={loadingProgress}
            stage="Preparando plataforma selecionada..."
            type="progress"
            size={size}
            showProgress={true}
            showStage={true}
            showTimeEstimate={false}
          />
        </Layout.Section>
        <Settings 
          size={iconSize - 2} 
          className="text-gray-400 animate-spin" 
          aria-hidden="true"
        />
      </Layout.Row>
    </Layout.Section>
  );
};

// Enhanced Platform Button Component
const EnhancedPlatformButton: React.FC<{
  option: typeof PLATFORM_OPTIONS[0];
  isSelected: boolean;
  isPredicted: boolean;
  isHovered: boolean;
  disabled: boolean;
  isLoading: boolean;
  size: SizeVariant;
  variant: StyleVariant;
  showAdvancedFeatures: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  styles: ReturnType<typeof getEnhancedSelectorStyles>;
}> = ({ 
  option, 
  isSelected, 
  isPredicted, 
  isHovered,
  disabled, 
  isLoading, 
  size, 
  variant, 
  showAdvancedFeatures,
  onClick, 
  onMouseEnter,
  onMouseLeave,
  styles 
}) => {
  
  const getButtonClasses = useCallback(() => {
    const baseClasses = `
      relative border-2 rounded-xl font-medium text-center
      transition-all duration-300 ease-out
      focus:outline-none focus:ring-2 focus:ring-offset-2
      ${styles.buttonSize} flex flex-col items-center justify-center
      group overflow-hidden cursor-pointer
      ${animationClasses.themeTransition}
    `;
    
    if (disabled || isLoading) {
      return `${baseClasses} opacity-50 cursor-not-allowed border-border bg-muted text-muted-foreground`;
    }
    
    if (isSelected) {
      const selectedStyles = {
        default: `border-primary bg-primary/10 text-primary shadow-lg shadow-primary/20 scale-[1.02] ring-2 ring-primary/20 dark:bg-primary/20 dark:border-primary`,
        outlined: `border-primary bg-primary/5 text-primary ring-2 ring-primary/30 dark:bg-primary/15`,
        filled: `border-primary bg-primary/15 text-primary shadow-lg dark:bg-primary/25`,
        minimal: `border-b-4 border-primary bg-primary/5 text-primary dark:bg-primary/15`
      };
      return `${baseClasses} ${selectedStyles[variant]}`;
    }
    
    if (isPredicted && !isSelected) {
      const predictiveStyles = {
        default: `border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20 hover:border-blue-400 hover:bg-blue-100 hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-200/50 ring-1 ring-blue-200/50 dark:hover:bg-blue-800/30 ${darkModeClasses.card}`,
        outlined: `border-blue-500 bg-blue-50 hover:border-blue-600 ring-2 ring-blue-500/30 dark:bg-blue-900/20`,
        filled: `border-blue-400 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30`,
        minimal: `border-b-3 border-blue-400 bg-blue-50 hover:border-blue-500 dark:bg-blue-900/20`
      };
      return `${baseClasses} ${predictiveStyles[variant]}`;
    }
    
    if (isHovered) {
      const hoveredStyles = {
        default: `border-primary/50 bg-primary/5 scale-[1.01] shadow-md shadow-primary/10 dark:bg-primary/10 dark:border-primary/30 ${darkModeClasses.card}`,
        outlined: `border-primary bg-primary/5 ring-1 ring-primary/20 dark:bg-primary/10`,
        filled: `border-primary bg-primary/10 dark:bg-primary/15`,
        minimal: `border-b-3 border-primary bg-primary/5 dark:bg-primary/10`
      };
      return `${baseClasses} ${hoveredStyles[variant]}`;
    }
    
    const defaultStyles = {
      default: `border-border hover:border-primary/50 hover:bg-primary/5 hover:scale-[1.01] hover:shadow-md hover:shadow-primary/10 active:scale-[0.98] dark:hover:bg-primary/10 dark:hover:border-primary/30 ${darkModeClasses.card}`,
      outlined: `border-border hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10`,
      filled: `border-border bg-muted hover:bg-primary/10 hover:border-primary dark:bg-muted/50`,
      minimal: `border-b-2 border-border hover:border-primary bg-transparent hover:bg-primary/5`
    };
    
    return `${baseClasses} ${defaultStyles[variant]}`;
  }, [isSelected, isPredicted, isHovered, disabled, isLoading, variant, styles.buttonSize]);
  
  const logoSize = size === 'sm' ? 'md' : size === 'lg' ? 'xl' : 'lg';
  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 24 : 20;
  
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      disabled={disabled || isLoading}
      aria-pressed={isSelected}
      className={getButtonClasses()}
      data-track-id={`platform-${option.value.toLowerCase()}`}
    >
      {/* Platform Logo com animação enhanced */}
      <div className="flex items-center justify-center mb-3">
        <PlatformLogo 
          platform={option.value}
          selected={isSelected}
          size={logoSize}
        />
      </div>
      
      {/* Platform Name */}
      <span className={`font-medium truncate ${
        size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'
      }`}>
        {option.label}
      </span>
      
      {/* V7.5: Enhanced indicators */}
      <div className="absolute top-2 right-2 flex gap-1">
        {isSelected && (
          <CheckCircle2 
            size={iconSize} 
            className="text-primary animate-pulse"
            aria-label="Selecionado"
          />
        )}
        {isPredicted && !isSelected && (
          <Sparkles 
            size={iconSize} 
            className="text-blue-400 animate-pulse" 
            aria-label="Sugestão baseada no seu padrão de uso"
          />
        )}
        {showAdvancedFeatures && isHovered && (
          <Eye 
            size={iconSize - 4} 
            className="text-purple-400 animate-pulse" 
            aria-label="Tracking ativo"
          />
        )}
      </div>
      
      {/* Hover effect overlay (PRESERVADO) */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
      
      {/* Ripple effect for interactions (PRESERVADO) */}
      {isHovered && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-current opacity-5 rounded-xl animate-ping" />
        </div>
      )}
    </button>
  );
};

/**
 * Enhanced Platform Selector V7.5 - Phase 6 Premium Edition
 * Sistema preditivo que aprende padrões do usuário
 * Smart loading, dark mode, design tokens integrados
 * V7.5: Layout.Section, Lucide icons, validation states
 */
const PlatformSelectorEnhanced: React.FC<PlatformSelectorEnhancedProps> = ({ 
  selectedPlatform, 
  onPlatformChange, 
  disabled = false,
  validationState = 'neutral',
  errorMessage,
  successMessage,
  helperText,
  size = 'md',
  variant = 'default',
  required = false,
  showPredictiveIndicators = true,
  showAdvancedFeatures = true,
  showDarkModeFeatures = true,
  compactMode = false,
  'aria-describedby': ariaDescribedBy,
  'aria-label': ariaLabel,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [hoveredPlatform, setHoveredPlatform] = useState<string | null>(null);
  
  // Phase 6: Predictive UX integration (PRESERVADO)
  const { trackAction, predictions } = usePredictiveUX();
  const styles = getEnhancedSelectorStyles(validationState, size, variant, disabled);
  
  // Phase 6: Smart loading simulation (PRESERVADO)
  const simulateSmartLoading = useCallback((platform: Platform) => {
    setIsLoading(true);
    setLoadingProgress(0);
    
    const stages = [
      { progress: 25, delay: 100, stage: 'Validating platform...' },
      { progress: 60, delay: 150, stage: 'Loading templates...' },
      { progress: 90, delay: 100, stage: 'Finalizing...' },
      { progress: 100, delay: 100, stage: 'Complete!' },
    ];
    
    stages.forEach(({ progress, delay }, index) => {
      setTimeout(() => {
        setLoadingProgress(progress);
        if (progress === 100) {
          setTimeout(() => {
            setIsLoading(false);
            setLoadingProgress(0);
            onPlatformChange(platform);
          }, 200);
        }
      }, stages.slice(0, index + 1).reduce((acc, stage) => acc + stage.delay, 0));
    });
  }, [onPlatformChange]);
  
  // Enhanced platform change handler with predictive tracking (PRESERVADO)
  const handlePlatformChange = useCallback((platform: Platform) => {
    if (disabled || isLoading) return;
    
    // Track user action for learning (PRESERVADO)
    trackAction(
      'click',
      `platform-${platform.toLowerCase()}`,
      { 
        previousPlatform: selectedPlatform,
        sessionLength: Date.now() - performance.timeOrigin 
      }
    );
    
    // Immediate feedback for selected state
    if (platform === selectedPlatform) {
      onPlatformChange(platform);
      return;
    }
    
    // Smart loading for new selections (PRESERVADO)
    simulateSmartLoading(platform);
  }, [disabled, isLoading, selectedPlatform, trackAction, simulateSmartLoading, onPlatformChange]);

  // Hover handlers for predictive learning (PRESERVADO)
  const handleMouseEnter = useCallback((platform: string) => {
    setHoveredPlatform(platform);
    
    if (showAdvancedFeatures) {
      trackAction(
        'hover',
        `platform-${platform.toLowerCase()}`,
        { currentlySelected: selectedPlatform }
      );
    }
  }, [trackAction, selectedPlatform, showAdvancedFeatures]);

  const handleMouseLeave = useCallback(() => {
    setHoveredPlatform(null);
  }, []);

  // Validation message display
  const getValidationMessage = () => {
    if (validationState === 'error' && errorMessage) return errorMessage;
    if (validationState === 'success' && successMessage) return successMessage;
    return helperText;
  };
  
  const validationMessage = getValidationMessage();

  return (
    <Layout.Section className="w-full">
      <Layout.Container>
        {/* Enhanced Label Section */}
        <Layout.Row className="justify-between items-center">
          <label 
            className={`block font-medium text-foreground ${
              size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'
            }`}
            aria-label={ariaLabel || 'Seleção de plataforma avançada'}
          >
            <Layout.Row>
              <Smartphone 
                size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} 
                className="text-primary"
                aria-hidden="true"
              />
              <span>Plataforma</span>
              {required && <span className="text-destructive ml-1">*</span>}
            </Layout.Row>
            
            {/* V7.5: Enhanced predictive feedback */}
            {predictions.length > 0 && showPredictiveIndicators && !compactMode && (
              <Layout.Row className="mt-1">
                <Brain size={14} className="text-blue-500" aria-hidden="true" />
                <span className="text-xs text-blue-600 dark:text-blue-400">
                  🔮 {predictions.length} sugestão{predictions.length > 1 ? 'ões' : ''} inteligente{predictions.length > 1 ? 's' : ''}
                </span>
              </Layout.Row>
            )}
          </label>
          
          {/* Advanced features indicator */}
          {showAdvancedFeatures && !compactMode && (
            <Layout.Row className="text-xs text-muted-foreground">
              <Target size={12} aria-hidden="true" />
              <span>Phase 6</span>
            </Layout.Row>
          )}
        </Layout.Row>
        
        {/* V7.5: Enhanced Feature Indicators */}
        {!compactMode && (
          <EnhancedFeatureIndicators
            validationState={validationState}
            predictedCount={predictions.length}
            selectedPlatform={selectedPlatform}
            showAdvancedFeatures={showAdvancedFeatures}
            showDarkModeFeatures={showDarkModeFeatures}
            isLoading={isLoading}
            size={size}
          />
        )}
        
        {/* Enhanced Smart Loading (PRESERVADO + V7.5) */}
        <EnhancedSmartLoadingIndicator
          isLoading={isLoading}
          loadingProgress={loadingProgress}
          size={size}
          variant={variant}
          showAdvancedFeatures={showAdvancedFeatures}
        />
        
        {/* Enhanced Platform Grid */}
        <Layout.Grid 
          className={`${styles.grid} ${styles.container} ${
            isLoading ? 'opacity-60 pointer-events-none' : ''
          }`}
        >
          {PLATFORM_OPTIONS.map((option) => {
            const isSelected = selectedPlatform === option.label;
            const isHovered = hoveredPlatform === option.value;
            
            // FIX: Get predicted actions correctly (PRESERVADO)
            const predictedActions = predictions.map(p => p.nextAction || '');
            const isPredicted = predictedActions.includes(`platform-${option.value.toLowerCase()}`) && showPredictiveIndicators;
            
            return (
              <EnhancedPlatformButton
                key={option.value}
                option={option}
                isSelected={isSelected}
                isPredicted={isPredicted}
                isHovered={isHovered}
                disabled={disabled}
                isLoading={isLoading}
                size={size}
                variant={variant}
                showAdvancedFeatures={showAdvancedFeatures}
                onClick={() => handlePlatformChange(option.label as Platform)}
                onMouseEnter={() => handleMouseEnter(option.value)}
                onMouseLeave={handleMouseLeave}
                styles={styles}
              />
            );
          })}
        </Layout.Grid>
        
        {/* Enhanced feedback section (PRESERVADO + V7.5) */}
        <Layout.Container className="space-y-2">
          {/* Selection feedback */}
          {selectedPlatform && !compactMode && (
            <Layout.Row className={`items-center p-3 rounded-lg ${
              validationState === 'success' ? 'bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800' :
              validationState === 'error' ? 'bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800' :
              'bg-muted/50 border border-border'
            }`}>
              <Users 
                size={16} 
                className={
                  validationState === 'success' ? 'text-green-600 dark:text-green-400' :
                  validationState === 'error' ? 'text-red-600 dark:text-red-400' :
                  'text-muted-foreground'
                } 
                aria-hidden="true"
              />
              <span className={`font-medium ${
                validationState === 'success' ? 'text-green-900 dark:text-green-100' :
                validationState === 'error' ? 'text-red-900 dark:text-red-100' :
                'text-foreground'
              }`}>
                {selectedPlatform}
              </span>
              <span className={`${
                size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'
              } ${
                validationState === 'success' ? 'text-green-600 dark:text-green-400' :
                validationState === 'error' ? 'text-red-600 dark:text-red-400' :
                'text-muted-foreground'
              }`}>
                selecionado
              </span>
              {isLoading && (
                <Layout.Row className="ml-auto">
                  <TrendingUp size={14} className="animate-pulse text-orange-500" />
                  <span className="text-xs animate-pulse text-orange-600">Carregando...</span>
                </Layout.Row>
              )}
            </Layout.Row>
          )}
          
          {/* Predictive insights (PRESERVADO) */}
          {predictions.length > 0 && !isLoading && showAdvancedFeatures && !compactMode && (
            <Layout.Row className="items-center text-xs text-blue-600 dark:text-blue-400 opacity-75 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Brain size={14} className="text-blue-500" />
              <span>Baseado no seu uso: {predictions.slice(0, 2).map(p => p.nextAction?.replace('platform-', '') || '').filter(Boolean).join(', ')}</span>
            </Layout.Row>
          )}
          
          {/* Development info (PRESERVADO) */}
          {process.env.NODE_ENV === 'development' && showAdvancedFeatures && !compactMode && (
            <Layout.Row className="items-center text-xs text-green-600 dark:text-green-400 opacity-75 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Settings size={14} className="text-green-500" />
              <span>✨ Phase 6 Enhanced: Predictive UX • Smart Loading • Advanced Micro-interactions • V7.5 Design System</span>
            </Layout.Row>
          )}
        </Layout.Container>
        
        {/* V7.5: Validation Message */}
        {validationMessage && (
          <Layout.Row className="items-start space-x-2">
            {validationState === 'error' && (
              <AlertCircle 
                size={14} 
                className="text-red-500 mt-0.5 flex-shrink-0" 
                aria-hidden="true"
              />
            )}
            {validationState === 'success' && (
              <CheckCircle2 
                size={14} 
                className="text-green-500 mt-0.5 flex-shrink-0" 
                aria-hidden="true"
              />
            )}
            {validationState === 'neutral' && (
              <Info 
                size={14} 
                className="text-blue-500 mt-0.5 flex-shrink-0" 
                aria-hidden="true"
              />
            )}
            <p 
              id={ariaDescribedBy || `platform-selector-enhanced-description`}
              className={`text-sm ${
                validationState === 'error' ? 'text-red-600 dark:text-red-400' :
                validationState === 'success' ? 'text-green-600 dark:text-green-400' :
                'text-muted-foreground'
              }`}
            >
              {validationMessage}
            </p>
          </Layout.Row>
        )}
        
        {/* Screen Reader Description */}
        <div className="sr-only">
          Sistema avançado de seleção de plataforma com predições inteligentes Phase 6, 
          micro-interactions, smart loading e suporte completo a dark mode.
          {showAdvancedFeatures && " Inclui sistema preditivo baseado em padrões de uso e tracking de hover."}
          {showDarkModeFeatures && " Totalmente compatível com modo escuro."}
        </div>
      </Layout.Container>
    </Layout.Section>
  );
};

export default PlatformSelectorEnhanced;
