import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ArrowRight, ArrowLeft, Check, Sparkles, Target, Zap, Gift, Play, Users } from 'lucide-react';
import { cn } from '../../lib/utils';
import { TouchGestureHandler } from '../mobile/TouchGestureHandler';
import { analyticsService } from '../../services/analyticsService';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: string;
  cta?: string;
  skippable?: boolean;
  timeEstimate?: string;
  benefits?: string[];
}

interface OnboardingFlowProps {
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
  steps?: OnboardingStep[];
  variant?: 'first-time' | 'feature-intro' | 'quick-start';
}

// OPTIMIZED: Reduced from 5 to 3 steps for better conversion
const OPTIMIZED_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Bem-vindo! Vamos criar seu primeiro roteiro? 🚀',
    description: 'Em menos de 60 segundos você terá um roteiro profissional. Sem API keys, sem complexidade.',
    icon: <Sparkles className="h-8 w-8 text-blue-500" />,
    cta: 'Vamos começar!',
    timeEstimate: '60s',
    benefits: ['🤖 IA real integrada', '📱 15+ plataformas', '⚡ Resultado em segundos']
  },
  {
    id: 'quick-setup',
    title: 'Conte-nos sobre seu conteúdo 🎯',
    description: 'Quanto mais específico, melhor será seu roteiro. A IA adapta o conteúdo para seu estilo.',
    icon: <Target className="h-8 w-8 text-green-500" />,
    action: 'quick-setup',
    cta: 'Gerar meu roteiro',
    timeEstimate: '30s',
    benefits: ['🎨 Tom personalizado', '👥 Público-alvo específico', '📊 Duração otimizada']
  },
  {
    id: 'success',
    title: 'Parabéns! Seu roteiro está pronto! 🎉',
    description: 'Agora você pode editá-lo, copiá-lo ou explorar features avançadas como síntese de voz e colaboração.',
    icon: <Gift className="h-8 w-8 text-pink-500" />,
    cta: 'Explorar features',
    benefits: ['🎙️ Síntese de voz', '🤝 Colaboração', '📊 Analytics'],
    skippable: true
  }
];

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  isOpen,
  onComplete,
  onSkip,
  steps = OPTIMIZED_STEPS,
  variant = 'first-time'
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [userInputs, setUserInputs] = useState({
    subject: '',
    platform: 'youtube-shorts',
    tone: 'informal',
    audience: 'geral'
  });
  const [startTime] = useState(Date.now());

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;
  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setUserInputs({ subject: '', platform: 'youtube-shorts', tone: 'informal', audience: 'geral' });
      
      // Track onboarding start
      analyticsService.trackEvent('onboarding_flow_started', {
        variant,
        timestamp: Date.now(),
        userAgent: navigator.userAgent
      });
    }
  }, [isOpen, variant]);

  const handleNext = useCallback(() => {
    const stepDuration = Date.now() - startTime;
    
    // Track step completion
    analyticsService.trackEvent('onboarding_step_completed', {
      stepId: currentStepData.id,
      stepNumber: currentStep + 1,
      duration: stepDuration,
      variant,
      userInputs: currentStep === 1 ? userInputs : undefined
    });

    if (isLastStep) {
      onComplete();
      
      // Track successful completion
      analyticsService.trackEvent('onboarding_completed_success', {
        totalDuration: stepDuration,
        variant,
        conversionRate: 100,
        userInputs
      });
      return;
    }

    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(prev => prev + 1);
      setIsAnimating(false);
    }, 200);
  }, [currentStep, currentStepData.id, isLastStep, onComplete, startTime, userInputs, variant]);

  const handlePrevious = useCallback(() => {
    if (isFirstStep) return;
    
    const stepDuration = Date.now() - startTime;
    
    // Track step back navigation
    analyticsService.trackEvent('onboarding_step_back', {
      stepId: currentStepData.id,
      stepNumber: currentStep + 1,
      duration: stepDuration,
      variant
    });
    
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(prev => prev - 1);
      setIsAnimating(false);
    }, 200);
  }, [currentStep, currentStepData.id, isFirstStep, startTime, variant]);

  const handleSkip = useCallback(() => {
    const totalDuration = Date.now() - startTime;
    
    // Track skip with detailed analytics
    analyticsService.trackEvent('onboarding_skipped', {
      stepId: currentStepData.id,
      stepNumber: currentStep + 1,
      totalDuration,
      variant,
      skipReason: 'user_initiated',
      completionRate: (currentStep / steps.length) * 100
    });
    
    onSkip();
  }, [currentStep, currentStepData.id, onSkip, startTime, steps.length, variant]);

  const handleGesture = useCallback((gesture: any) => {
    if (gesture.type === 'swipe') {
      if (gesture.direction === 'left' && !isLastStep) {
        handleNext();
      } else if (gesture.direction === 'right' && !isFirstStep) {
        handlePrevious();
      }
    }
  }, [handleNext, handlePrevious, isFirstStep, isLastStep]);

  const renderStepContent = () => {
    switch (currentStepData.action) {
      case 'quick-setup':
        return (
          <div className="space-y-6">
            {/* Benefits Grid */}
            {currentStepData.benefits && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                {currentStepData.benefits.map((benefit, index) => (
                  <div 
                    key={index}
                    className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="text-sm font-medium text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Setup Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📝 Sobre o que você quer falar?
                </label>
                <input
                  type="text"
                  placeholder="Ex: Como fazer café perfeito, Dicas de produtividade..."
                  value={userInputs.subject}
                  onChange={(e) => setUserInputs(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📱 Plataforma
                  </label>
                  <select
                    value={userInputs.platform}
                    onChange={(e) => setUserInputs(prev => ({ ...prev, platform: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="youtube-shorts">YouTube Shorts</option>
                    <option value="instagram-reels">Instagram Reels</option>
                    <option value="tiktok">TikTok</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="youtube-long">YouTube Longo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🎭 Tom
                  </label>
                  <select
                    value={userInputs.tone}
                    onChange={(e) => setUserInputs(prev => ({ ...prev, tone: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="informal">Informal</option>
                    <option value="profissional">Profissional</option>
                    <option value="educativo">Educativo</option>
                    <option value="humoristico">Humorístico</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        // Welcome or Success step
        return (
          <div className="text-center">
            {currentStepData.benefits && (
              <div className="grid grid-cols-1 gap-3 mb-6">
                {currentStepData.benefits.map((benefit, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-center space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200"
                  >
                    <span className="text-sm font-medium text-blue-800">{benefit}</span>
                  </div>
                ))}
              </div>
            )}
            
            {currentStep === 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200 mb-6">
                <p className="text-sm text-gray-600">
                  ✨ <strong>Novidade:</strong> IA real integrada - sem necessidade de configurar API keys!
                </p>
              </div>
            )}
          </div>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <TouchGestureHandler onGesture={handleGesture}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className={cn(
          "w-full max-w-2xl bg-white shadow-2xl transition-all duration-300",
          isAnimating && "scale-95 opacity-50"
        )}>
          {/* Header with Progress */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  {currentStepData.icon}
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Passo {currentStep + 1} de {steps.length}
                  </span>
                  {currentStepData.timeEstimate && (
                    <span className="text-xs text-gray-400 block">
                      ⏱️ {currentStepData.timeEstimate}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {variant === 'first-time' && (
                  <button
                    onClick={handleSkip}
                    className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Pular tutorial
                  </button>
                )}
              </div>
            </div>
            
            {/* Enhanced Progress Bar */}
            <div className="relative">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500 relative overflow-hidden"
                  style={{ width: `${progressPercentage}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
              </div>
              <div className="flex justify-between mt-2">
                {steps.map((_, index) => (
                  <div 
                    key={index}
                    className={cn(
                      "w-2 h-2 rounded-full transition-colors",
                      index <= currentStep ? "bg-blue-500" : "bg-gray-300"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              {currentStepData.title}
            </h2>
            <p className="text-gray-600 mb-6">
              {currentStepData.description}
            </p>
            
            {renderStepContent()}
          </div>

          {/* Footer */}
          <div className="p-6 border-t bg-gray-50">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={isFirstStep}
                className={cn(
                  "flex items-center space-x-2",
                  isFirstStep && "opacity-50 cursor-not-allowed"
                )}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Anterior</span>
              </Button>

              <div className="flex items-center space-x-3">
                {currentStep === 1 && !userInputs.subject.trim() && (
                  <span className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-lg">
                    💡 Preencha o assunto para continuar
                  </span>
                )}
                
                <Button
                  onClick={handleNext}
                  disabled={currentStep === 1 && !userInputs.subject.trim()}
                  className={cn(
                    "flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600",
                    currentStep === 1 && !userInputs.subject.trim() && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <span>{currentStepData.cta || 'Próximo'}</span>
                  {isLastStep ? (
                    <Gift className="w-4 h-4" />
                  ) : currentStep === 1 ? (
                    <Zap className="w-4 h-4" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </TouchGestureHandler>
  );
};

// ENHANCED: Quick Start Prompt with better CRO copy
export const QuickStartPrompt: React.FC<{
  onStartOnboarding: () => void;
  onDismiss: () => void;
}> = ({ onStartOnboarding, onDismiss }) => {
  return (
    <Card className="p-4 border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-blue-900 flex items-center space-x-2">
            <Sparkles className="w-4 h-4" />
            <span>Primeiro acesso? Vamos acelerar! 🚀</span>
          </h3>
          <p className="text-sm text-blue-700 mt-1">
            <strong>60 segundos</strong> para seu primeiro roteiro profissional. IA real, sem complicação.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onDismiss}
            className="text-blue-600 border-blue-300 hover:bg-blue-100"
          >
            Depois
          </Button>
          <Button
            size="sm"
            onClick={onStartOnboarding}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
          >
            <Play className="w-3 h-3 mr-1" />
            Começar agora
          </Button>
        </div>
      </div>
    </Card>
  );
}; 