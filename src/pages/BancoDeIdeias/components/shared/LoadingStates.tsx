/**
 * 🧠 BANCO DE IDEIAS - LOADING STATES V8.0
 * Reusable loading components extracted from monolithic BancoDeIdeias.tsx
 * Following V8.0 Unified Development methodology
 */

import React from 'react';
import { Layout } from '../../../../design-system/components/Layout';
import { Sparkles, Loader2 } from 'lucide-react';
import { LOADING_MESSAGES } from '../../constants';

// ============================================================================
// COMPONENT LOADING SKELETON
// ============================================================================

export const ComponentLoadingSkeleton: React.FC = () => (
  <Layout.Card variant="outlined" padding="lg" className="animate-pulse">
    <div className="space-y-4">
      <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
      <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
      <div className="h-32 bg-neutral-200 rounded"></div>
      <div className="flex gap-2">
        <div className="h-8 bg-neutral-200 rounded w-20"></div>
        <div className="h-8 bg-neutral-200 rounded w-24"></div>
      </div>
    </div>
  </Layout.Card>
);

// ============================================================================
// IDEAS LIST SKELETON
// ============================================================================

export const IdeasListSkeleton: React.FC = () => (
  <div className="space-y-4">
    {Array.from({ length: 3 }).map((_, index) => (
      <Layout.Card key={index} variant="outlined" padding="md" className="animate-pulse">
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <div className="h-5 bg-neutral-200 rounded w-2/3"></div>
            <div className="h-4 bg-neutral-200 rounded w-16"></div>
          </div>
          <div className="h-4 bg-neutral-200 rounded w-full"></div>
          <div className="h-4 bg-neutral-200 rounded w-4/5"></div>
          <div className="flex gap-2 mt-4">
            <div className="h-6 bg-neutral-200 rounded-full w-16"></div>
            <div className="h-6 bg-neutral-200 rounded-full w-20"></div>
          </div>
        </div>
      </Layout.Card>
    ))}
  </div>
);

// ============================================================================
// IDEA GENERATION LOADING
// ============================================================================

interface IdeaGenerationLoadingProps {
  progress?: number;
  message?: string;
}

export const IdeaGenerationLoading: React.FC<IdeaGenerationLoadingProps> = ({
  progress = 0,
  message
}) => {
  const displayMessage = message || LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)];
  
  return (
    <Layout.Card variant="elevated" padding="lg" className="text-center">
      <div className="flex flex-col items-center space-y-6">
        {/* Animated Icon */}
        <div className="relative">
          <Sparkles className="w-12 h-12 text-primary-600 animate-pulse" />
          <div className="absolute inset-0 animate-spin">
            <Loader2 className="w-12 h-12 text-primary-300" />
          </div>
        </div>
        
        {/* Progress Bar */}
        {progress > 0 && (
          <div className="w-full max-w-xs">
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-primary-500 to-warm-500 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <Layout.Text variant="bodySmall" color="muted" className="mt-2">
              {progress}% concluído
            </Layout.Text>
          </div>
        )}
        
        {/* Loading Message */}
        <div className="space-y-2">
          <Layout.Heading level={4} className="text-neutral-700">
            {displayMessage}
          </Layout.Heading>
          <Layout.Text variant="body" color="muted">
            Isso pode levar alguns segundos...
          </Layout.Text>
        </div>
        
        {/* Animated Dots */}
        <div className="flex space-x-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            ></div>
          ))}
        </div>
      </div>
    </Layout.Card>
  );
};

// ============================================================================
// SIMPLE SPINNER
// ============================================================================

interface SimpleSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

export const SimpleSpinner: React.FC<SimpleSpinnerProps> = ({
  size = 'md',
  message
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };
  
  return (
    <div className="flex items-center justify-center space-x-2">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-primary-600`} />
      {message && (
        <Layout.Text variant="bodySmall" color="muted">
          {message}
        </Layout.Text>
      )}
    </div>
  );
};

// ============================================================================
// INLINE LOADING
// ============================================================================

interface InlineLoadingProps {
  message: string;
}

export const InlineLoading: React.FC<InlineLoadingProps> = ({ message }) => (
  <div className="flex items-center space-x-2 py-2">
    <Loader2 className="w-4 h-4 animate-spin text-primary-600" />
    <Layout.Text variant="bodySmall" color="muted">
      {message}
    </Layout.Text>
  </div>
);

// ============================================================================
// FULL PAGE LOADING
// ============================================================================

interface FullPageLoadingProps {
  message?: string;
}

export const FullPageLoading: React.FC<FullPageLoadingProps> = ({
  message = "Carregando..."
}) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
    <div className="relative">
      <Sparkles className="w-16 h-16 text-primary-600 animate-pulse" />
      <div className="absolute inset-0 animate-spin">
        <Loader2 className="w-16 h-16 text-primary-300" />
      </div>
    </div>
    
    <div className="text-center space-y-2">
      <Layout.Heading level={3} className="text-neutral-700">
        {message}
      </Layout.Heading>
      <Layout.Text variant="body" color="muted">
        Aguarde enquanto preparamos tudo para você...
      </Layout.Text>
    </div>
  </div>
);

// ============================================================================
// EXPORTS
// ============================================================================

export const LoadingStates = {
  ComponentSkeleton: ComponentLoadingSkeleton,
  IdeasListSkeleton,
  IdeaGeneration: IdeaGenerationLoading,
  SimpleSpinner,
  InlineLoading,
  FullPage: FullPageLoading,
}; 