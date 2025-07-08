import React, { useState, useEffect } from 'react';
import { PLATFORM_OPTIONS } from '../../constants';
import { PlatformLogo } from '../ui/PlatformLogos';
import { usePredictiveUX } from '../../hooks/usePredictiveUX';
import { AdvancedMicroInteractions } from '../ui/AdvancedMicroInteractions';

type Platform = 'YouTube' | 'Instagram' | 'TikTok' | '';

interface PlatformSelectorProps {
  selectedPlatform: Platform;
  onPlatformChange: (platform: Platform) => void;
  disabled?: boolean;
}

/**
 * Platform Selector V5.1 - Premium Edition
 * Sistema preditivo que aprende padrões do usuário
 * Micro-interactions avançadas e smart loading integrado
 */
const PlatformSelector: React.FC<PlatformSelectorProps> = ({ 
  selectedPlatform, 
  onPlatformChange, 
  disabled = false
}) => {
  const [isChanging, setIsChanging] = useState(false);
  const [loadingStage, setLoadingStage] = useState<string>('');
  const [predictedPlatform, setPredictedPlatform] = useState<Platform | null>(null);
  
  const { trackAction, getSmartSuggestions, getMostLikelyNext, predictions } = usePredictiveUX();

  // V5.1: Detecção de padrões preditivos
  useEffect(() => {
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
  }, [predictions, getSmartSuggestions, getMostLikelyNext]);

  // V5.1: Smart loading com stages
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
    
    // V5.1: Track action para predictive system
    trackAction('click', `platform-${platform}`, {
      previousPlatform: selectedPlatform,
      wasPredicted: platform === predictedPlatform
    });
    
    simulateSmartLoading(platform);
  };

  const getButtonClasses = (option: typeof PLATFORM_OPTIONS[0]) => {
    const isSelected = selectedPlatform === option.label;
    const isPredicted = predictedPlatform === option.label;
    
    const baseClasses = `
      relative border-2 rounded-xl font-medium text-center
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-2
      min-h-[80px] flex flex-col items-center justify-center p-4
      cursor-pointer
    `;
    
    if (disabled || isChanging) {
      return `${baseClasses} opacity-50 cursor-not-allowed border-gray-300 bg-gray-50`;
    }
    
    if (isSelected) {
      return `${baseClasses} 
        border-primary bg-primary/10 text-primary
        shadow-md scale-[1.02] 
        ring-2 ring-primary/20
      `;
    }
    
    // V5.1: Destaque preditivo
    if (isPredicted && !isSelected) {
      return `${baseClasses}
        border-blue-400/60 bg-blue-50 
        hover:border-primary hover:bg-primary/10
        ring-2 ring-blue-400/30 ring-offset-1
      `;
    }
    
    return `${baseClasses}
      border-gray-300 hover:border-primary/50 hover:bg-primary/5 
      hover:scale-[1.01] hover:shadow-sm
      active:scale-[0.98]
    `;
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-4">
        Plataforma <span className="text-red-500">*</span>
        {predictedPlatform && !selectedPlatform && (
          <span className="ml-2 text-xs text-blue-600 font-normal">
            (💡 Sugestão: {predictedPlatform})
          </span>
        )}
      </label>
      
      {/* Platform grid premium com micro-interactions */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${
        isChanging ? 'opacity-60' : ''
      }`}>
        {PLATFORM_OPTIONS.map((option) => {
          const isSelected = selectedPlatform === option.label;
          const isPredicted = predictedPlatform === option.label;
          
          return (
            <AdvancedMicroInteractions
              key={option.value}
              type="button"
              enhancedFeedback={true}
              predictiveHover={true}
              data-track-id={`platform-${option.value}`}
              onClick={() => handlePlatformChange(option.label as Platform)}
            >
              <button
                type="button"
                disabled={disabled || isChanging}
                aria-pressed={isSelected}
                className={getButtonClasses(option)}
              >
                {/* Platform Logo com animação */}
                <div className={`flex items-center justify-center mb-3 transition-transform duration-200 ${
                  isSelected ? 'scale-110' : ''
                }`}>
                  <PlatformLogo 
                    platform={option.value}
                    selected={isSelected}
                    size="lg"
                  />
                </div>
                
                {/* Platform Name */}
                <span className="text-sm font-medium">
                  {option.label}
                </span>
                
                {/* Selected indicator */}
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse" />
                  </div>
                )}
                
                {/* V5.1: Predictive indicator */}
                {isPredicted && !isSelected && (
                  <div className="absolute -top-1 -right-1">
                    <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
                    <div className="w-3 h-3 bg-blue-300 rounded-full animate-ping absolute top-0 right-0" />
                  </div>
                )}
              </button>
            </AdvancedMicroInteractions>
          );
        })}
      </div>
      
      {/* V5.1: Smart feedback com loading stages */}
      {isChanging && loadingStage && (
        <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-primary font-medium animate-pulse">
              {loadingStage}
            </span>
          </div>
        </div>
      )}
      
      {/* Feedback premium */}
      {selectedPlatform && !isChanging && (
        <div className="mt-4 text-sm text-gray-600 flex items-center gap-2">
          <span className="text-lg">📱</span>
          <span className="font-medium text-gray-900">{selectedPlatform}</span> selecionado
          {selectedPlatform === predictedPlatform && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
              ✨ Previsto
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default PlatformSelector;
