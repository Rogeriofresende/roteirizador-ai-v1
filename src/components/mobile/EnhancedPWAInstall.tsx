import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  Smartphone, 
  Download, 
  Zap, 
  Wifi, 
  Bell, 
  Share2, 
  X, 
  Check,
  ArrowRight,
  Heart,
  Star
} from 'lucide-react';
import { TouchGestureHandler } from './TouchGestureHandler';
import { usePWA } from '../../hooks/usePWA';
import { analyticsService } from '../../services/analyticsService';

interface PWABenefit {
  icon: React.ReactNode;
  title: string;
  description: string;
  highlight?: boolean;
}

interface PWAInstallStep {
  id: string;
  title: string;
  description: string;
  visual: string;
  platform: 'ios' | 'android' | 'desktop';
}

interface EnhancedPWAInstallProps {
  onInstall?: () => void;
  onDismiss?: () => void;
  onSkip?: () => void;
  variant?: 'banner' | 'modal' | 'fullscreen' | 'minimal';
  showBenefits?: boolean;
  showInstructions?: boolean;
  autoShow?: boolean;
  triggerDelay?: number;
}

export const EnhancedPWAInstall: React.FC<EnhancedPWAInstallProps> = ({
  onInstall,
  onDismiss,
  onSkip,
  variant = 'modal',
  showBenefits = true,
  showInstructions = true,
  autoShow = true,
  triggerDelay = 3000
}) => {
  const { isInstalled, canInstall, install: installPWA, isSupported } = usePWA();
  const [showPrompt, setShowPrompt] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [installationPhase, setInstallationPhase] = useState<'prompt' | 'benefits' | 'instructions' | 'installing' | 'success'>('prompt');
  const [userInteracted, setUserInteracted] = useState(false);
  const [deviceType, setDeviceType] = useState<'ios' | 'android' | 'desktop'>('desktop');

  // PWA Benefits data
  const pwaBenefits: PWABenefit[] = [
    {
      icon: <Zap className="w-6 h-6 text-yellow-500" />,
      title: "Acesso Instantâneo",
      description: "Abra o app direto da tela inicial, sem navegador",
      highlight: true
    },
    {
      icon: <Wifi className="w-6 h-6 text-blue-500" />,
      title: "Funciona Offline",
      description: "Use suas funcionalidades mesmo sem internet",
      highlight: true
    },
    {
      icon: <Bell className="w-6 h-6 text-green-500" />,
      title: "Notificações",
      description: "Receba alertas sobre novos recursos e updates"
    },
    {
      icon: <Download className="w-6 h-6 text-purple-500" />,
      title: "Sem App Store",
      description: "Instale diretamente, sem downloads pesados"
    },
    {
      icon: <Smartphone className="w-6 h-6 text-indigo-500" />,
      title: "Experiência Nativa",
      description: "Interface otimizada como um app nativo"
    },
    {
      icon: <Star className="w-6 h-6 text-amber-500" />,
      title: "Sempre Atualizado",
      description: "Versão mais recente automaticamente"
    }
  ];

  // Installation instructions by platform
  const installInstructions: PWAInstallStep[] = [
    {
      id: 'ios-1',
      platform: 'ios',
      title: "Toque no ícone de compartilhar",
      description: "No Safari, toque no ícone de compartilhar na parte inferior",
      visual: "📤"
    },
    {
      id: 'ios-2',
      platform: 'ios',
      title: "Adicionar à Tela de Início",
      description: "Role para baixo e toque em 'Adicionar à Tela de Início'",
      visual: "➕"
    },
    {
      id: 'ios-3',
      platform: 'ios',
      title: "Confirmar instalação",
      description: "Toque em 'Adicionar' para instalar o app",
      visual: "✅"
    },
    {
      id: 'android-1',
      platform: 'android',
      title: "Toque no menu",
      description: "No Chrome, toque nos 3 pontos no canto superior direito",
      visual: "⋮"
    },
    {
      id: 'android-2',
      platform: 'android',
      title: "Instalar app",
      description: "Toque em 'Instalar app' ou 'Adicionar à tela inicial'",
      visual: "📱"
    },
    {
      id: 'android-3',
      platform: 'android',
      title: "Confirmar",
      description: "Toque em 'Instalar' para finalizar",
      visual: "✨"
    },
    {
      id: 'desktop-1',
      platform: 'desktop',
      title: "Ícone na barra de endereço",
      description: "Procure pelo ícone ⊕ na barra de endereço",
      visual: "⊕"
    },
    {
      id: 'desktop-2',
      platform: 'desktop',
      title: "Clique para instalar",
      description: "Clique no ícone e depois em 'Instalar'",
      visual: "🖱️"
    },
    {
      id: 'desktop-3',
      platform: 'desktop',
      title: "App instalado!",
      description: "O app aparecerá no seu sistema operacional",
      visual: "🎉"
    }
  ];

  // Detect device type
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setDeviceType('ios');
    } else if (/android/.test(userAgent)) {
      setDeviceType('android');
    } else {
      setDeviceType('desktop');
    }
  }, []);

  // Auto-show logic
  useEffect(() => {
    if (!autoShow || !isSupported || isInstalled || !canInstall) return;

    const hasSeenPrompt = localStorage.getItem('pwa-install-dismissed');
    const lastShown = localStorage.getItem('pwa-install-last-shown');
    const now = Date.now();

    // Don't show if dismissed recently (24h)
    if (hasSeenPrompt && lastShown) {
      const hoursSinceLastShown = (now - parseInt(lastShown)) / (1000 * 60 * 60);
      if (hoursSinceLastShown < 24) return;
    }

    const timer = setTimeout(() => {
      setShowPrompt(true);
      localStorage.setItem('pwa-install-last-shown', now.toString());
      
      analyticsService.trackEvent('pwa_install_prompt_shown', {
        variant,
        deviceType,
        auto: true,
        timestamp: Date.now()
      });
    }, triggerDelay);

    return () => clearTimeout(timer);
  }, [autoShow, isSupported, isInstalled, canInstall, triggerDelay, variant, deviceType]);

  // Handle install
  const handleInstall = useCallback(async () => {
    try {
      setInstallationPhase('installing');
      setUserInteracted(true);
      
      const success = await installPWA();
      
      if (success) {
        setInstallationPhase('success');
        
        // Show success for 2 seconds then close
        setTimeout(() => {
          setShowPrompt(false);
          onInstall?.();
        }, 2000);

        analyticsService.trackEvent('pwa_install_success', {
          variant,
          deviceType,
          timestamp: Date.now()
        });
      } else {
        // Fallback to manual instructions
        setInstallationPhase('instructions');
        
        analyticsService.trackEvent('pwa_install_fallback', {
          variant,
          deviceType,
          timestamp: Date.now()
        });
      }
    } catch (error) {
      console.error('PWA installation failed:', error);
      setInstallationPhase('instructions');
      
      analyticsService.trackEvent('pwa_install_error', {
        variant,
        deviceType,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });
    }
  }, [installPWA, variant, deviceType, onInstall]);

  // Handle dismiss
  const handleDismiss = useCallback(() => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
    localStorage.setItem('pwa-install-last-shown', Date.now().toString());
    onDismiss?.();

    analyticsService.trackEvent('pwa_install_dismissed', {
      variant,
      deviceType,
      phase: installationPhase,
      userInteracted,
      timestamp: Date.now()
    });
  }, [variant, deviceType, installationPhase, userInteracted, onDismiss]);

  // Handle skip
  const handleSkip = useCallback(() => {
    setShowPrompt(false);
    onSkip?.();

    analyticsService.trackEvent('pwa_install_skipped', {
      variant,
      deviceType,
      phase: installationPhase,
      timestamp: Date.now()
    });
  }, [variant, deviceType, installationPhase, onSkip]);

  // Handle gesture (swipe down to dismiss on mobile)
  const handleGesture = useCallback((gesture: any) => {
    if (gesture.type === 'swipe' && gesture.direction === 'down') {
      handleDismiss();
    }
  }, [handleDismiss]);

  // Navigation for instruction steps
  const nextStep = () => {
    const steps = installInstructions.filter(step => step.platform === deviceType);
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Don't render if conditions not met
  if (!isSupported || isInstalled || !showPrompt) {
    return null;
  }

  // Render different phases
  const renderPrompt = () => (
    <div className="text-center">
      <div className="mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
          <Smartphone className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Instalar Roteirar IA
        </h3>
        <p className="text-gray-600 text-sm">
          Tenha acesso rápido na sua tela inicial
        </p>
      </div>

      <div className="space-y-3 mb-6">
        <Button 
          onClick={handleInstall}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl"
        >
          <Download className="w-5 h-5 mr-2" />
          Instalar App
        </Button>
        
        {showBenefits && (
          <Button 
            variant="outline" 
            onClick={() => setInstallationPhase('benefits')}
            className="w-full"
          >
            Ver Benefícios
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>

      <div className="flex justify-center space-x-4">
        <Button variant="ghost" size="sm" onClick={handleSkip}>
          Agora não
        </Button>
        <Button variant="ghost" size="sm" onClick={handleDismiss}>
          Não mostrar mais
        </Button>
      </div>
    </div>
  );

  const renderBenefits = () => (
    <div>
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Por que instalar?
        </h3>
        <p className="text-gray-600 text-sm">
          Experimente todos os benefícios do app
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {pwaBenefits.map((benefit, index) => (
          <div 
            key={index}
            className={`p-3 rounded-xl border transition-all duration-200 ${
              benefit.highlight ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-start space-x-2">
              {benefit.icon}
              <div>
                <h4 className="font-semibold text-sm text-gray-900 mb-1">
                  {benefit.title}
                </h4>
                <p className="text-xs text-gray-600">
                  {benefit.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <Button 
          onClick={handleInstall}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl"
        >
          <Download className="w-5 h-5 mr-2" />
          Instalar Agora
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => setInstallationPhase('prompt')}
          className="w-full"
        >
          Voltar
        </Button>
      </div>
    </div>
  );

  const renderInstructions = () => {
    const steps = installInstructions.filter(step => step.platform === deviceType);
    const currentStepData = steps[currentStep];

    return (
      <div>
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Como instalar
          </h3>
          <p className="text-gray-600 text-sm">
            Siga os passos para seu dispositivo
          </p>
        </div>

        <div className="mb-6">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center text-4xl">
              {currentStepData.visual}
            </div>
          </div>
          
          <div className="text-center">
            <h4 className="font-semibold text-gray-900 mb-2">
              {currentStepData.title}
            </h4>
            <p className="text-gray-600 text-sm">
              {currentStepData.description}
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            Anterior
          </Button>
          
          <div className="flex space-x-2">
            {steps.map((_, index) => (
              <div 
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={nextStep}
            disabled={currentStep === steps.length - 1}
          >
            Próximo
          </Button>
        </div>

        <Button 
          variant="ghost" 
          onClick={handleDismiss}
          className="w-full"
        >
          Fechar
        </Button>
      </div>
    );
  };

  const renderInstalling = () => (
    <div className="text-center">
      <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse">
        <Download className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        Instalando...
      </h3>
      <p className="text-gray-600 text-sm">
        Aguarde enquanto o app é instalado
      </p>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center">
      <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
        <Check className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        App Instalado!
      </h3>
      <p className="text-gray-600 text-sm mb-4">
        Agora você pode acessar o Roteirar IA direto da sua tela inicial
      </p>
      <div className="flex justify-center">
        <Heart className="w-6 h-6 text-red-500 animate-pulse" />
      </div>
    </div>
  );

  // Render based on variant
  const renderContent = () => {
    switch (installationPhase) {
      case 'benefits':
        return renderBenefits();
      case 'instructions':
        return renderInstructions();
      case 'installing':
        return renderInstalling();
      case 'success':
        return renderSuccess();
      default:
        return renderPrompt();
    }
  };

  if (variant === 'banner') {
    return (
      <TouchGestureHandler onGesture={handleGesture}>
        <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 z-50 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Smartphone className="w-6 h-6" />
              <div>
                <p className="font-semibold text-sm">Instalar Roteirar IA</p>
                <p className="text-xs text-blue-100">Acesso rápido na tela inicial</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="ghost" onClick={handleInstall} className="text-white border-white hover:bg-white hover:text-blue-600">
                Instalar
              </Button>
              <Button size="sm" variant="ghost" onClick={handleDismiss} className="text-white hover:bg-white hover:text-blue-600">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </TouchGestureHandler>
    );
  }

  if (variant === 'minimal') {
    return (
      <TouchGestureHandler onGesture={handleGesture}>
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:w-80 z-50">
          <Card className="p-4 shadow-lg border-0 bg-white">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-gray-900">Instalar App</p>
                <p className="text-xs text-gray-600">Acesso rápido e offline</p>
              </div>
              <div className="flex space-x-1">
                <Button size="sm" onClick={handleInstall}>
                  Instalar
                </Button>
                <Button size="sm" variant="ghost" onClick={handleDismiss}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </TouchGestureHandler>
    );
  }

  // Modal and fullscreen variants
  return (
    <TouchGestureHandler onGesture={handleGesture}>
      <div className={`fixed inset-0 z-50 flex items-center justify-center ${variant === 'fullscreen' ? 'bg-white' : 'bg-black bg-opacity-50'}`}>
        <div className={`${variant === 'fullscreen' ? 'w-full h-full' : 'max-w-md w-full mx-4'}`}>
          <Card className={`${variant === 'fullscreen' ? 'border-0 rounded-none h-full' : 'shadow-xl'} bg-white`}>
            <div className="p-6">
              {variant !== 'fullscreen' && (
                <div className="flex justify-end mb-4">
                  <Button variant="ghost" size="sm" onClick={handleDismiss}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
              
              {renderContent()}
            </div>
          </Card>
        </div>
      </div>
    </TouchGestureHandler>
  );
}; 