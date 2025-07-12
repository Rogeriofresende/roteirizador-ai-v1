import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ArrowRight, ArrowLeft, Check, Sparkles, Target, Users, Zap, Gift } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: string;
  cta?: string;
  skippable?: boolean;
  timeEstimate?: string;
}

interface OnboardingFlowProps {
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
  steps?: OnboardingStep[];
  variant?: 'first-time' | 'feature-intro' | 'quick-start';
}

const DEFAULT_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Bem-vindo ao Roteirar IA! 🎉',
    description: 'Vamos criar seu primeiro roteiro profissional em menos de 2 minutos. Pronto para começar?',
    icon: <Sparkles className="h-8 w-8 text-blue-500" />,
    cta: 'Vamos começar!',
    timeEstimate: '2 min'
  },
  {
    id: 'choose-topic',
    title: 'Escolha um Assunto',
    description: 'Sobre o que você quer criar conteúdo? Pode ser qualquer coisa: educação, entretenimento, negócios...',
    icon: <Target className="h-8 w-8 text-green-500" />,
    action: 'subject-input',
    cta: 'Próximo',
    timeEstimate: '30s'
  },
  {
    id: 'select-platform',
    title: 'Selecione a Plataforma',
    description: 'Onde você vai publicar? Cada plataforma tem suas particularidades e otimizações.',
    icon: <Users className="h-8 w-8 text-purple-500" />,
    action: 'platform-select',
    cta: 'Continuar',
    timeEstimate: '15s'
  },
  {
    id: 'magic-time',
    title: 'Momento da Mágica! ✨',
    description: 'Agora vamos gerar seu roteiro personalizado com IA. Em segundos você terá conteúdo profissional.',
    icon: <Zap className="h-8 w-8 text-yellow-500" />,
    action: 'generate',
    cta: 'Gerar Roteiro',
    timeEstimate: '5s'
  },
  {
    id: 'success',
    title: 'Parabéns! 🎊',
    description: 'Seu primeiro roteiro está pronto! Agora você pode editá-lo, copiá-lo ou explorar features avançadas.',
    icon: <Gift className="h-8 w-8 text-pink-500" />,
    cta: 'Explorar Features',
    skippable: true
  }
];

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  isOpen,
  onComplete,
  onSkip,
  steps = DEFAULT_STEPS,
  variant = 'first-time'
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [userInputs, setUserInputs] = useState({
    subject: '',
    platform: ''
  });

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setUserInputs({ subject: '', platform: '' });
    }
  }, [isOpen]);

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
      return;
    }

    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(prev => prev + 1);
      setIsAnimating(false);
    }, 200);
  };

  const handlePrevious = () => {
    if (isFirstStep) return;
    
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(prev => prev - 1);
      setIsAnimating(false);
    }, 200);
  };

  const handleSkip = () => {
    // Track skip action for analytics
    onSkip();
  };

  const renderStepContent = () => {
    const stepData = currentStepData;
    
    switch (stepData.action) {
      case 'subject-input':
        return (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Ex: Como fazer café perfeito"
              value={userInputs.subject}
              onChange={(e) => setUserInputs(prev => ({ ...prev, subject: e.target.value }))}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
            <div className="text-sm text-gray-500 space-y-1">
              <p>💡 <strong>Dicas:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Seja específico: "Como organizar home office" vs "Organização"</li>
                <li>Pense no seu público: iniciantes ou experts?</li>
                <li>Use palavras que você realmente falaria</li>
              </ul>
            </div>
          </div>
        );
        
      case 'platform-select':
        return (
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'youtube', name: 'YouTube', icon: '📺', description: 'Vídeos longos e detalhados' },
              { id: 'instagram', name: 'Instagram', icon: '📸', description: 'Visual e rápido' },
              { id: 'tiktok', name: 'TikTok', icon: '🎵', description: 'Curto e viral' },
              { id: 'linkedin', name: 'LinkedIn', icon: '💼', description: 'Profissional' }
            ].map((platform) => (
              <button
                key={platform.id}
                onClick={() => setUserInputs(prev => ({ ...prev, platform: platform.id }))}
                className={cn(
                  "p-4 border rounded-lg text-left transition-all hover:shadow-md",
                  userInputs.platform === platform.id
                    ? "border-blue-500 bg-blue-50 shadow-md"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <div className="text-2xl mb-2">{platform.icon}</div>
                <div className="font-medium">{platform.name}</div>
                <div className="text-sm text-gray-500">{platform.description}</div>
              </button>
            ))}
          </div>
        );
        
      case 'generate':
        return (
          <div className="text-center space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
              <div className="text-4xl mb-3">🚀</div>
              <p className="font-medium">Configuração completa!</p>
              <p className="text-sm text-gray-600 mt-2">
                <strong>Assunto:</strong> {userInputs.subject || 'Não definido'}<br/>
                <strong>Plataforma:</strong> {userInputs.platform || 'Não definida'}
              </p>
            </div>
            <p className="text-gray-600">
              Clique em "Gerar Roteiro" para ver a mágica acontecer!
            </p>
          </div>
        );
        
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className={cn(
        "w-full max-w-2xl bg-white shadow-2xl transition-all duration-300",
        isAnimating && "scale-95 opacity-50"
      )}>
        {/* Header with Progress */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              {currentStepData.icon}
              <span className="text-sm font-medium text-gray-500">
                Passo {currentStep + 1} de {steps.length}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {currentStepData.timeEstimate && (
                <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                  ⏱️ {currentStepData.timeEstimate}
                </span>
              )}
              {currentStepData.skippable && (
                <button
                  onClick={handleSkip}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Pular
                </button>
              )}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
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
        <div className="p-6 border-t bg-gray-50 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={isFirstStep}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Anterior</span>
          </Button>
          
          <div className="flex space-x-2">
            {!isLastStep && (
              <Button
                variant="outline"
                onClick={handleSkip}
                className="text-gray-600"
              >
                Pular Tutorial
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={
                (currentStepData.action === 'subject-input' && !userInputs.subject.trim()) ||
                (currentStepData.action === 'platform-select' && !userInputs.platform)
              }
              className="flex items-center space-x-2"
            >
              <span>{currentStepData.cta || (isLastStep ? 'Finalizar' : 'Próximo')}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Quick Start Mini Component for return users
export const QuickStartPrompt: React.FC<{
  onStartOnboarding: () => void;
  onDismiss: () => void;
}> = ({ onStartOnboarding, onDismiss }) => {
  return (
    <Card className="p-4 border-l-4 border-l-blue-500 bg-blue-50 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-blue-900">Primeiro acesso? 👋</h3>
          <p className="text-sm text-blue-700">
            Te ajudamos a criar seu primeiro roteiro em 2 minutos!
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onDismiss}
            className="text-blue-600 border-blue-300"
          >
            Não, obrigado
          </Button>
          <Button
            size="sm"
            onClick={onStartOnboarding}
            className="bg-blue-600 text-white"
          >
            🚀 Começar
          </Button>
        </div>
      </div>
    </Card>
  );
}; 