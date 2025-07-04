import React, { useState } from 'react';
import { PLATFORM_OPTIONS } from '../../constants';
import { PlatformLogo } from '../ui/PlatformLogos';

type Platform = 'YouTube' | 'Instagram' | 'TikTok' | '';

interface PlatformSelectorProps {
  selectedPlatform: Platform;
  onPlatformChange: (platform: Platform) => void;
  disabled?: boolean;
}

/**
 * Platform Selector - Versão Simplificada e Funcional
 * Remove complexidade desnecessária, foca na funcionalidade essencial
 */
const PlatformSelector: React.FC<PlatformSelectorProps> = ({ 
  selectedPlatform, 
  onPlatformChange, 
  disabled = false
}) => {
  const [isChanging, setIsChanging] = useState(false);

  const handlePlatformChange = (platform: Platform) => {
    if (disabled || isChanging) return;
    
    // Feedback visual simples
    setIsChanging(true);
    
    // Pequeno delay para feedback visual
    setTimeout(() => {
      onPlatformChange(platform);
      setIsChanging(false);
    }, 150);
  };

  const getButtonClasses = (option: typeof PLATFORM_OPTIONS[0]) => {
    const isSelected = selectedPlatform === option.label;
    
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
      </label>
      
      {/* Platform grid simplificado */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${
        isChanging ? 'opacity-60' : ''
      }`}>
        {PLATFORM_OPTIONS.map((option) => {
          const isSelected = selectedPlatform === option.label;
          
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handlePlatformChange(option.label as Platform)}
              disabled={disabled || isChanging}
              aria-pressed={isSelected}
              className={getButtonClasses(option)}
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
              <span className="text-sm font-medium">
                {option.label}
              </span>
              
              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <div className="w-2.5 h-2.5 bg-primary rounded-full" />
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      {/* Feedback simples */}
      {selectedPlatform && (
        <div className="mt-4 text-sm text-gray-600">
          📱 <span className="font-medium text-gray-900">{selectedPlatform}</span> selecionado
        </div>
      )}
    </div>
  );
};

export default PlatformSelector;
