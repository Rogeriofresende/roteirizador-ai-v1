import React, { useRef } from 'react';
import { PLATFORM_OPTIONS } from '../../constants';
import { responsiveGridClasses, touchButtonClasses } from '../../design-system/tokens';
import { useOverflowDetection, getResponsiveGridCols } from '../../utils/responsive';

type Platform = 'YouTube' | 'Instagram' | 'TikTok' | '';

interface PlatformSelectorProps {
  selectedPlatform: Platform;
  onPlatformChange: (platform: Platform) => void;
  disabled?: boolean;
}

const PlatformSelector: React.FC<PlatformSelectorProps> = ({ 
  selectedPlatform, 
  onPlatformChange, 
  disabled 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasOverflow = useOverflowDetection(containerRef);
  
  // Professional responsive grid calculation
  const gridClasses = getResponsiveGridCols(PLATFORM_OPTIONS.length, 6);
  
  // Debug overflow in development
  if (process.env.NODE_ENV === 'development' && hasOverflow) {
    console.warn('🚨 PlatformSelector: Layout overflow detected!', {
      platformCount: PLATFORM_OPTIONS.length,
      containerWidth: containerRef.current?.clientWidth,
      scrollWidth: containerRef.current?.scrollWidth
    });
  }
  
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Plataforma <span className="text-red-500">*</span>
      </label>
      
      {/* Professional responsive grid with overflow protection */}
      <div 
        ref={containerRef}
        className={`${responsiveGridClasses.platformGrid} w-full`}
        role="group"
        aria-label="Seleção de plataforma"
      >
        {PLATFORM_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onPlatformChange(option.label as Platform)}
            disabled={disabled}
            aria-pressed={selectedPlatform === option.label}
            className={`
              ${touchButtonClasses.small}
              border rounded-md text-sm font-medium text-center
              transition-all duration-200 
              focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
              ${selectedPlatform === option.label
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
              }
              ${disabled 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:shadow-sm active:transform active:scale-[0.98]'
              }
              ${hasOverflow ? 'text-xs px-2' : ''}
            `}
          >
            {option.label}
          </button>
        ))}
      </div>
      
      {/* Development overflow warning */}
      {process.env.NODE_ENV === 'development' && hasOverflow && (
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
          ⚠️ Layout overflow detectado - considere ajustar breakpoints
        </div>
      )}
    </div>
  );
};

export default PlatformSelector; 