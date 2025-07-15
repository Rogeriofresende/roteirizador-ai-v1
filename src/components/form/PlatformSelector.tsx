import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Info,
  Smartphone,
  Zap,
  Target,
  Sparkles,
  TrendingUp,
  Users
} from 'lucide-react';
import { PLATFORM_OPTIONS } from '../../constants';
import { PlatformLogo } from '../ui/PlatformLogos';
import { usePredictiveUX } from '../../hooks/usePredictiveUX';
import { AdvancedMicroInteractions } from '../ui/AdvancedMicroInteractions';

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

interface PlatformSelectorProps {
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
  compactMode?: boolean;
  'aria-describedby'?: string;
  'aria-label'?: string;
}

// V7.5 Enhanced Styling System
const getSelectorStyles = (
  validationState: ValidationState,
  size: SizeVariant,
  variant: StyleVariant,
  disabled: boolean
) => {
  const baseContainer = 'transition-all duration-200 ease-in-out';

  // Grid size variants
  const gridSizes = {
    sm: 'grid-cols-1 sm:grid-cols-3 gap-2',
    md: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
    lg: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
  };

  // Button size variants
  const buttonSizes = {
    sm: 'min-h-[60px] p-3 text-xs',
    md: 'min-h-[80px] p-4 text-sm',
    lg: 'min-h-[100px] p-5 text-base'
  };

  return {
    container: `${baseContainer} ${disabled ? 'opacity-60' : ''}`,
    grid: gridSizes[size],
    buttonSize: buttonSizes[size]
  };
};

// Feature Indicators Component
const FeatureIndicators: React.FC<{
  validationState: ValidationState;
  predictedPlatform: Platform | null;
  selectedPlatform: Platform;
  showAdvancedFeatures: boolean;
  size: SizeVariant;
}> = ({ validationState, predictedPlatform, selectedPlatform, showAdvancedFeatures, size }) => {
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

        {predictedPlatform && showAdvancedFeatures && (
          <Sparkles
            size={iconSize}
            className="text-blue-500 animate-pulse"
            aria-label="Predição ativa"
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
              aria-label="Sistema preditivo"
            />
          </>
        )}
      </Layout.Row>
    </Layout.Row>
  );
};

// Smart Loading Enhanced Component
const SmartLoadingIndicator: React.FC<{
  loadingStage: string;
  size: SizeVariant;
  variant: StyleVariant;
}> = ({ loadingStage, size, variant }) => {
  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 24 : 20;

  const containerStyles = {
    default: 'bg-primary/5 border border-primary/20',
    outlined: 'border-2 border-primary/30 bg-transparent',
    filled: 'bg-primary/10 border-0',
    minimal: 'border-b-2 border-primary/30 bg-transparent rounded-none'
  };

  return (
    <Layout.Section className={`mt-4 p-3 rounded-lg ${containerStyles[variant]}`}>
      <Layout.Row>
        <div
          className="border-2 border-primary border-t-transparent rounded-full animate-spin"
          style={{ width: iconSize, height: iconSize }}
          aria-label="Carregando"
        />
        <TrendingUp
          size={iconSize - 2}
          className="text-primary animate-pulse"
          aria-hidden="true"
        />
        <span className={`text-primary font-medium animate-pulse ${
          size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'
        }`}>
          {loadingStage}
        </span>
      </Layout.Row>
    </Layout.Section>
  );
};

// Enhanced Button Component
const PlatformButton: React.FC<{
  option: typeof PLATFORM_OPTIONS[0];
  isSelected: boolean;
  isPredicted: boolean;
  disabled: boolean;
  isChanging: boolean;
  size: SizeVariant;
  variant: StyleVariant;
  onClick: () => void;
  styles: ReturnType<typeof getSelectorStyles>;
}> = ({ option, isSelected, isPredicted, disabled, isChanging, size, variant, onClick, styles }) => {

  const getButtonClasses = () => {
    const baseClasses = `
      relative border-2 rounded-xl font-medium text-center
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-2
      ${styles.buttonSize} flex flex-col items-center justify-center
      cursor-pointer
    `;

    if (disabled || isChanging) {
      return `${baseClasses} opacity-50 cursor-not-allowed border-gray-300 bg-gray-50`;
    }

    if (isSelected) {
      const selectedStyles = {
        default: 'border-primary bg-primary/10 text-primary shadow-md scale-[1.02] ring-2 ring-primary/20',
        outlined: 'border-primary bg-primary/5 text-primary ring-2 ring-primary/30',
        filled: 'border-primary bg-primary/15 text-primary shadow-lg',
        minimal: 'border-b-4 border-primary bg-primary/5 text-primary'
      };
      return `${baseClasses} ${selectedStyles[variant]}`;
    }

    // V7.5: Enhanced predictive styling
    if (isPredicted && !isSelected) {
      const predictiveStyles = {
        default: 'border-blue-400/60 bg-blue-50 hover:border-primary hover:bg-primary/10 ring-2 ring-blue-400/30 ring-offset-1',
        outlined: 'border-blue-500 bg-blue-50 hover:border-primary ring-2 ring-blue-500/30',
        filled: 'border-blue-400 bg-blue-100 hover:bg-primary/10',
        minimal: 'border-b-3 border-blue-400 bg-blue-50 hover:border-primary'
      };
      return `${baseClasses} ${predictiveStyles[variant]}`;
    }

    const defaultStyles = {
      default: 'border-gray-300 hover:border-primary/50 hover:bg-primary/5 hover:scale-[1.01] hover:shadow-sm active:scale-[0.98]',
      outlined: 'border-gray-400 hover:border-primary hover:bg-primary/5',
      filled: 'border-gray-300 bg-gray-50 hover:bg-primary/10 hover:border-primary',
      minimal: 'border-b-2 border-gray-300 hover:border-primary bg-transparent'
    };

    return `${baseClasses} ${defaultStyles[variant]}`;
  };

  const logoSize = size === 'sm' ? 'md' : size === 'lg' ? 'xl' : 'lg';

  return (
    <AdvancedMicroInteractions
      type="button"
      enhancedFeedback={true}
      predictiveHover={true}
      data-track-id={`platform-${option.value}`}
      onClick={onClick}
    >
      <button
        type="button"
        disabled={disabled || isChanging}
        aria-pressed={isSelected}
        className={getButtonClasses()}
      >
        {/* Platform Logo com animação enhanced */}
        <div className={`flex items-center justify-center mb-3 transition-transform duration-200 ${
          isSelected ? 'scale-110' : ''
        }`}>
          <PlatformLogo
            platform={option.value}
            selected={isSelected}
            size={logoSize}
          />
        </div>

        {/* Platform Name */}
        <span className={`font-medium ${
          size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'
        }`}>
          {option.label}
        </span>

        {/* V7.5: Enhanced selected indicator */}
        {isSelected && (
          <div className="absolute top-2 right-2">
            <CheckCircle2
              size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20}
              className="text-primary animate-pulse"
              aria-label="Selecionado"
            />
          </div>
        )}

        {/* V7.5: Enhanced predictive indicator */}
        {isPredicted && !isSelected && (
          <div className="absolute -top-1 -right-1">
            <Sparkles
              size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20}
              className="text-blue-500 animate-pulse"
              aria-label="Predição"
            />
          </div>
        )}
      </button>
    </AdvancedMicroInteractions>
  );
};

/**
 * Platform Selector V7.5 Enhanced - Premium Edition
 * Sistema preditivo que aprende padrões do usuário
 * Micro-interactions avançadas e smart loading integrado
 * V7.5: Layout.Section, Lucide icons, validation states
 */
const PlatformSelector: React.FC<PlatformSelectorProps> = ({
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
  compactMode = false,
  'aria-describedby': ariaDescribedBy,
  'aria-label': ariaLabel,
}) => {
  const [isChanging, setIsChanging] = useState(false);
  const [loadingStage, setLoadingStage] = useState<string>('');
  const [predictedPlatform, setPredictedPlatform] = useState<Platform | null>(null);

  const { trackAction, getSmartSuggestions, getMostLikelyNext, predictions } = usePredictiveUX();
  const styles = getSelectorStyles(validationState, size, variant, disabled);

  // V5.1: Detecção de padrões preditivos (PRESERVADO)
  useEffect(() => {
    if (!showAdvancedFeatures) return;

    const suggestions = getSmartSuggestions('platform');
    const mostLikely = getMostLikelyNext();

    if (mostLikely && mostLikely.confidence > 0.7) {
      const predictedTarget = mostLikely.action.split(':')[1];
      const matchingPlatform = PLATFORM_OPTIONS.find(p =>
        p.value === predictedTarget || p.label === predictedTarget
      );

      if (matchingPlatform) {
        setPredictedPlatform(matchingPlatform.label as Platform);
      }
    }
  }, [predictions, getSmartSuggestions, getMostLikelyNext, showAdvancedFeatures]);

  // V5.1: Smart loading com stages (PRESERVADO)
  const simulateSmartLoading = async (platform: Platform) => {
    setIsChanging(true);

    const stages = [
      { stage: 'preparing', message: 'Preparando configurações...', duration: 300 },
      { stage: 'analyzing', message: `Analisando otimizações para ${platform}...`, duration: 400 },
      { stage: 'customizing', message: 'Personalizando experiência...', duration: 300 },
      { stage: 'ready', message: 'Pronto!', duration: 200 }
    ];

    for (const { stage, message, duration } of stages) {
      setLoadingStage(message);
      await new Promise(resolve => setTimeout(resolve, duration));
    }

    onPlatformChange(platform);
    setIsChanging(false);
    setLoadingStage('');
  };

  const handlePlatformChange = (platform: Platform) => {
    if (disabled || isChanging) return;

    // V5.1: Track action para predictive system (PRESERVADO)
    trackAction('click', `platform-${platform}`, {
      previousPlatform: selectedPlatform,
      wasPredicted: platform === predictedPlatform
    });

    simulateSmartLoading(platform);
  };

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
            className={`block font-medium text-gray-700 ${
              size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'
            }`}
            aria-label={ariaLabel || 'Seleção de plataforma'}
          >
            <Layout.Row>
              <Smartphone
                size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20}
                className="text-gray-600"
                aria-hidden="true"
              />
              <span>Plataforma</span>
              {required && <span className="text-red-500 ml-1">*</span>}
            </Layout.Row>

            {/* V7.5: Enhanced predictive suggestion */}
            {predictedPlatform && !selectedPlatform && showPredictiveIndicators && !compactMode && (
              <Layout.Row className="mt-1">
                <Sparkles size={14} className="text-blue-500" aria-hidden="true" />
                <span className="text-xs text-blue-600 font-normal">
                  Sugestão: {predictedPlatform}
                </span>
              </Layout.Row>
            )}
          </label>

          {/* Loading indicator in header */}
          {isChanging && compactMode && (
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-primary">Carregando...</span>
            </div>
          )}
        </Layout.Row>

        {/* V7.5: Feature Indicators */}
        {!compactMode && (
          <FeatureIndicators
            validationState={validationState}
            predictedPlatform={predictedPlatform}
            selectedPlatform={selectedPlatform}
            showAdvancedFeatures={showAdvancedFeatures}
            size={size}
          />
        )}

        {/* Enhanced Platform Grid */}
        <Layout.Grid className={`${styles.grid} ${styles.container}`}>
          {PLATFORM_OPTIONS.map((option) => {
            const isSelected = selectedPlatform === option.label;
            const isPredicted = predictedPlatform === option.label && showPredictiveIndicators;

            return (
              <PlatformButton
                key={option.value}
                option={option}
                isSelected={isSelected}
                isPredicted={isPredicted}
                disabled={disabled}
                isChanging={isChanging}
                size={size}
                variant={variant}
                onClick={() => handlePlatformChange(option.label as Platform)}
                styles={styles}
              />
            );
          })}
        </Layout.Grid>

        {/* V7.5: Enhanced Smart Loading */}
        {isChanging && loadingStage && !compactMode && (
          <SmartLoadingIndicator
            loadingStage={loadingStage}
            size={size}
            variant={variant}
          />
        )}

        {/* Enhanced Success Feedback */}
        {selectedPlatform && !isChanging && !compactMode && (
          <Layout.Section className={`mt-4 p-3 rounded-lg ${
            validationState === 'success' ? 'bg-green-50 border border-green-200' :
            validationState === 'error' ? 'bg-red-50 border border-red-200' :
            'bg-gray-50 border border-gray-200'
          }`}>
            <Layout.Row>
              <Users
                size={16}
                className={
                  validationState === 'success' ? 'text-green-600' :
                  validationState === 'error' ? 'text-red-600' :
                  'text-gray-600'
                }
                aria-hidden="true"
              />
              <span className={`font-medium ${
                validationState === 'success' ? 'text-green-900' :
                validationState === 'error' ? 'text-red-900' :
                'text-gray-900'
              }`}>
                {selectedPlatform}
              </span>
              <span className={`${
                size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'
              } ${
                validationState === 'success' ? 'text-green-600' :
                validationState === 'error' ? 'text-red-600' :
                'text-gray-600'
              }`}>
                selecionado
              </span>

              {/* Predictive success indicator */}
              {selectedPlatform === predictedPlatform && showPredictiveIndicators && (
                <Layout.Row className="ml-auto">
                  <Sparkles size={14} className="text-blue-500" />
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    ✨ Previsto
                  </span>
                </Layout.Row>
              )}
            </Layout.Row>
          </Layout.Section>
        )}

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
              id={ariaDescribedBy || `platform-selector-description`}
              className={`text-sm ${
                validationState === 'error' ? 'text-red-600' :
                validationState === 'success' ? 'text-green-600' :
                'text-gray-600'
              }`}
            >
              {validationMessage}
            </p>
          </Layout.Row>
        )}

        {/* Screen Reader Description */}
        <div className="sr-only">
          Sistema de seleção de plataforma com predições inteligentes e micro-interactions avançadas.
          {showAdvancedFeatures && " Inclui sistema preditivo baseado em padrões de uso."}
        </div>
      </Layout.Container>
    </Layout.Section>
  );
};

export default PlatformSelector;
