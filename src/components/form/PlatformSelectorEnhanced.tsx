import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { PLATFORM_OPTIONS } from '../../constants';
import { animationClasses, darkModeClasses } from '../../design-system/tokens';
import { PlatformLogo } from '../ui/PlatformLogos';
import { SmartLoading } from '../ui/SmartLoading';
import { usePredictiveUX } from '../../hooks/usePredictiveUX';

type Platform = 'YouTube' | 'Instagram' | 'TikTok' | '';

interface PlatformSelectorEnhancedProps {
  selectedPlatform: Platform;
  onPlatformChange: (platform: Platform) => void;
  disabled?: boolean;
}

/**
 * Enhanced Platform Selector - Phase 6 Feature
 * Includes predictive UX, smart loading, and advanced micro-interactions
 */
const PlatformSelectorEnhanced: React.FC<PlatformSelectorEnhancedProps> = ({ 
  selectedPlatform, 
  onPlatformChange, 
  disabled 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [hoveredPlatform, setHoveredPlatform] = useState<string | null>(null);
  
  // Phase 6: Predictive UX integration
  const { trackAction, predictions } = usePredictiveUX({
    enablePreloading: true,
    enableSmartSuggestions: true,
  });
  
  // Phase 6: Smart loading simulation
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
  
  // Enhanced platform change handler with predictive tracking
  const handlePlatformChange = useCallback((platform: Platform) => {
    if (disabled || isLoading) return;
    
    // Track user action for learning
    trackAction({
      type: 'click',
      target: `platform-${platform.toLowerCase()}`,
      timestamp: Date.now(),
      context: { 
        previousPlatform: selectedPlatform,
        sessionLength: Date.now() - performance.timeOrigin 
      },
    });
    
    // Immediate feedback for selected state
    if (platform === selectedPlatform) {
      onPlatformChange(platform);
      return;
    }
    
    // Smart loading for new selections
    simulateSmartLoading(platform);
  }, [disabled, isLoading, selectedPlatform, trackAction, simulateSmartLoading]);

  // Hover handlers for predictive learning
  const handleMouseEnter = useCallback((platform: string) => {
    setHoveredPlatform(platform);
    
    trackAction({
      type: 'hover',
      target: `platform-${platform.toLowerCase()}`,
      timestamp: Date.now(),
      context: { currentlySelected: selectedPlatform },
    });
  }, [trackAction, selectedPlatform]);

  const handleMouseLeave = useCallback(() => {
    setHoveredPlatform(null);
  }, []);

  // Enhanced button styling with predictive hints
  const getButtonClasses = useCallback((option: any) => {
    const isSelected = selectedPlatform === option.label;
    const isHovered = hoveredPlatform === option.value;
    const isPredicted = predictions.includes(`platform-${option.value.toLowerCase()}`);
    
    const baseClasses = `
      relative border-2 rounded-xl font-medium text-center
      transition-all duration-300 ease-out
      focus:outline-none focus:ring-2 focus:ring-offset-2
      min-h-[80px] flex flex-col items-center justify-center p-4
      group overflow-hidden cursor-pointer
      ${animationClasses.themeTransition}
    `;
    
    if (disabled || isLoading) {
      return `${baseClasses} opacity-50 cursor-not-allowed border-border bg-muted text-muted-foreground`;
    }
    
    if (isSelected) {
      return `${baseClasses} 
        border-primary bg-primary/10 text-primary
        shadow-lg shadow-primary/20
        scale-[1.02] 
        ring-2 ring-primary/20
        dark:bg-primary/20 dark:border-primary
      `;
    }
    
    if (isPredicted) {
      return `${baseClasses}
        border-blue-300 dark:border-blue-600
        bg-blue-50 dark:bg-blue-900/20
        hover:border-blue-400 hover:bg-blue-100 hover:scale-[1.02]
        hover:shadow-lg hover:shadow-blue-200/50
        ring-1 ring-blue-200/50
        dark:hover:bg-blue-800/30
        ${darkModeClasses.card}
      `;
    }
    
    if (isHovered) {
      return `${baseClasses}
        border-primary/50 bg-primary/5 scale-[1.01]
        shadow-md shadow-primary/10
        dark:bg-primary/10 dark:border-primary/30
        ${darkModeClasses.card}
      `;
    }
    
    return `${baseClasses}
      border-border hover:border-primary/50 hover:bg-primary/5 hover:scale-[1.01]
      hover:shadow-md hover:shadow-primary/10
      active:scale-[0.98]
      dark:hover:bg-primary/10 dark:hover:border-primary/30
      ${darkModeClasses.card}
    `;
  }, [selectedPlatform, hoveredPlatform, predictions, disabled, isLoading]);

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-foreground mb-4">
        Plataforma <span className="text-destructive">*</span>
        {predictions.length > 0 && (
          <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
            🔮 {predictions.length} sugestão{predictions.length > 1 ? 'ões' : ''} inteligente{predictions.length > 1 ? 's' : ''}
          </span>
        )}
      </label>
      
      {/* Smart loading indicator */}
      {isLoading && (
        <div className="mb-4">
          <SmartLoading
            isLoading={isLoading}
            progress={loadingProgress}
            stage="Preparando plataforma selecionada..."
            type="progress"
            size="md"
            showProgress={true}
            showStage={true}
            showTimeEstimate={false}
          />
        </div>
      )}
      
      {/* Enhanced platform grid */}
      <div 
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${
          isLoading ? 'opacity-60 pointer-events-none' : ''
        }`}
      >
        {PLATFORM_OPTIONS.map((option) => {
          const isSelected = selectedPlatform === option.label;
          const isPredicted = predictions.includes(`platform-${option.value.toLowerCase()}`);
          
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handlePlatformChange(option.label as Platform)}
              onMouseEnter={() => handleMouseEnter(option.value)}
              onMouseLeave={handleMouseLeave}
              disabled={disabled || isLoading}
              aria-pressed={isSelected}
              className={getButtonClasses(option)}
              data-track-id={`platform-${option.value.toLowerCase()}`}
            >
              {/* Platform Logo */}
              <div className="flex items-center justify-center mb-3">
                <PlatformLogo 
                  platform={option.value}
                  selected={isSelected}
                  size="lg"
                />
              </div>
              
              {/* Platform Name */}
              <span className="text-sm font-medium truncate">
                {option.label}
              </span>
              
              {/* Enhanced indicators */}
              <div className="absolute top-2 right-2 flex gap-1">
                {isSelected && (
                  <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse" />
                )}
                {isPredicted && !isSelected && (
                  <div 
                    className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-pulse" 
                    title="Sugestão baseada no seu padrão de uso"
                  />
                )}
              </div>
              
              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
              
              {/* Ripple effect for interactions */}
              {hoveredPlatform === option.value && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 bg-current opacity-5 rounded-xl animate-ping" />
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      {/* Enhanced feedback section */}
      <div className="mt-4 space-y-2">
        {/* Selection feedback */}
        {selectedPlatform && (
          <div className="text-sm text-muted-foreground">
            📱 <span className="font-medium text-foreground">{selectedPlatform}</span> selecionado
            {isLoading && <span className="ml-2 animate-pulse">• Carregando...</span>}
          </div>
        )}
        
        {/* Predictive insights */}
        {predictions.length > 0 && !isLoading && (
          <div className="text-xs text-blue-600 dark:text-blue-400 opacity-75">
            💡 Baseado no seu uso: {predictions.slice(0, 2).map(p => p.replace('platform-', '')).join(', ')}
          </div>
        )}
        
        {/* Development info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-green-600 dark:text-green-400 opacity-75">
            ✨ Phase 6 Enhanced: Predictive UX • Smart Loading • Advanced Micro-interactions
          </div>
        )}
      </div>
    </div>
  );
};

export default PlatformSelectorEnhanced;
