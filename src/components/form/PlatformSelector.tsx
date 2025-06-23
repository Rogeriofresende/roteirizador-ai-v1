import React from 'react';
import { PLATFORM_OPTIONS } from '../../constants';

type Platform = 'YouTube' | 'Instagram' | 'TikTok' | '';

interface PlatformSelectorProps {
  selectedPlatform: Platform;
  onPlatformChange: (platform: Platform) => void;
  disabled?: boolean;
}

const PlatformSelector: React.FC<PlatformSelectorProps> = ({ selectedPlatform, onPlatformChange, disabled }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Plataforma <span className="text-red-500">*</span>
      </label>
      <div className="flex space-x-2">
        {(PLATFORM_OPTIONS as Platform[]).map((platform) => (
          <button
            key={platform}
            type="button"
            onClick={() => onPlatformChange(platform)}
            disabled={disabled}
            className={`
              px-4 py-2 border rounded-md text-sm font-medium
              ${selectedPlatform === platform
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {platform}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PlatformSelector; 