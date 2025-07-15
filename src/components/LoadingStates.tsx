import React from 'react';
import { Loader2, Sparkles, Lightbulb } from 'lucide-react';

interface LoadingStateProps {
  type?: 'default' | 'generating' | 'saving' | 'searching' | 'exporting';
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  showProgress?: boolean;
  progress?: number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  type = 'default',
  size = 'md',
  message,
  showProgress = false,
  progress = 0
}) => {
  const getIcon = () => {
    switch (type) {
      case 'generating':
        return <Sparkles className="w-5 h-5 text-primary-600 animate-pulse" />;
      case 'saving':
        return <Lightbulb className="w-5 h-5 text-warm-500 animate-bounce" />;
      case 'searching':
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'exporting':
        return <Loader2 className="w-5 h-5 text-green-600 animate-spin" />;
      default:
        return <Loader2 className="w-5 h-5 text-neutral-600 animate-spin" />;
    }
  };

  const getSize = () => {
    switch (size) {
      case 'sm':
        return 'text-sm p-2';
      case 'lg':
        return 'text-lg p-6';
      default:
        return 'text-base p-4';
    }
  };

  const getLoadingMessage = () => {
    if (message) return message;
    
    switch (type) {
      case 'generating':
        return 'Gerando ideias incríveis...';
      case 'saving':
        return 'Salvando no seu banco de ideias...';
      case 'searching':
        return 'Buscando ideias...';
      case 'exporting':
        return 'Preparando exportação...';
      default:
        return 'Carregando...';
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center ${getSize()}`}>
      <div className="flex items-center gap-3 mb-2">
        {getIcon()}
        <span className="text-neutral-700 font-medium">{getLoadingMessage()}</span>
      </div>
      
      {showProgress && (
        <div className="w-full max-w-xs">
          <div className="bg-neutral-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-xs text-neutral-500 mt-1 text-center">
            {progress}% concluído
          </div>
        </div>
      )}
    </div>
  );
};

// Componente de skeleton para cards de ideias
export const IdeaCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg border border-neutral-200 p-6 animate-pulse">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-6 h-6 bg-neutral-200 rounded"></div>
      <div className="h-4 bg-neutral-200 rounded w-1/4"></div>
    </div>
    <div className="space-y-3">
      <div className="h-4 bg-neutral-200 rounded w-full"></div>
      <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
      <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
    </div>
    <div className="flex gap-2 mt-4">
      <div className="h-8 bg-neutral-200 rounded w-20"></div>
      <div className="h-8 bg-neutral-200 rounded w-24"></div>
    </div>
  </div>
);

// Componente de loading para lista de ideias
export const IdeasListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, index) => (
      <IdeaCardSkeleton key={index} />
    ))}
  </div>
);

export default LoadingState; 