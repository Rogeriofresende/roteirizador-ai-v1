/**
 * 🪟 Feature Introduction Modals - Migration Communication
 * 
 * Interactive modals for introducing new features during migration
 * Guided tours and feature discovery components
 * 
 * Part of: PRE-WEEK 0 - IA Beta Communication Templates Development
 * Integration: Alpha cost tier awareness + Charlie satisfaction tracking
 */

import React, { useState, useEffect } from 'react';

// Feature introduction interfaces
export interface FeatureIntroStep {
  id: string;
  title: string;
  description: string;
  benefit: string;
  icon: string;
  targetElement?: string; // CSS selector for highlighting
  costTierRestriction?: 'free' | 'premium' | 'all'; // Alpha integration
}

export interface FeatureIntroModalProps {
  isOpen: boolean;
  featureName: string;
  featureSteps: FeatureIntroStep[];
  onComplete: () => void;
  onSkip?: () => void;
  costTier?: 'free' | 'premium'; // Alpha integration
  userName?: string;
}

export interface GuidedTourProps {
  isActive: boolean;
  steps: FeatureIntroStep[];
  onComplete: () => void;
  onSkip?: () => void;
  costTier?: 'free' | 'premium';
}

// Main Feature Introduction Modal
export const FeatureIntroModal: React.FC<FeatureIntroModalProps> = ({
  isOpen,
  featureName,
  featureSteps,
  onComplete,
  onSkip,
  costTier = 'free',
  userName = 'Usuário'
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Filter steps based on cost tier
  const availableSteps = featureSteps.filter(step => 
    !step.costTierRestriction || 
    step.costTierRestriction === 'all' || 
    step.costTierRestriction === costTier
  );

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setIsAnimating(false);
    }
  }, [isOpen]);

  const handleNext = () => {
    if (currentStep < availableSteps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 200);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsAnimating(false);
      }, 200);
    }
  };

  const currentStepData = availableSteps[currentStep];
  const isLastStep = currentStep === availableSteps.length - 1;

  if (!isOpen || !currentStepData) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10000,
        background: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '16px',
          padding: '0',
          maxWidth: '600px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          transform: isAnimating ? 'scale(0.95)' : 'scale(1)',
          transition: 'transform 0.2s ease'
        }}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>
            {currentStepData.icon}
          </div>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: '700',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
          }}>
            {featureName}
            {costTier === 'premium' && (
              <span style={{ 
                fontSize: '12px', 
                background: 'rgba(255,255,255,0.2)',
                padding: '4px 8px', 
                borderRadius: '12px' 
              }}>
                ⭐ Premium
              </span>
            )}
          </h2>
          <p style={{ opacity: 0.9 }}>
            Olá, {userName}! Vamos conhecer essa novidade juntos
          </p>
        </div>

        {/* Progress bar */}
        <div style={{
          background: '#f8fafc',
          padding: '16px 24px',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            marginBottom: '8px',
            fontSize: '14px',
            color: '#64748b'
          }}>
            <span>Etapa {currentStep + 1} de {availableSteps.length}</span>
            <span>{Math.round(((currentStep + 1) / availableSteps.length) * 100)}%</span>
          </div>
          
          <div style={{
            width: '100%',
            height: '6px',
            background: '#e2e8f0',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div
              style={{
                width: `${((currentStep + 1) / availableSteps.length) * 100}%`,
                height: '100%',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '32px' }}>
          <h3 style={{ 
            fontSize: '20px', 
            fontWeight: '600', 
            color: '#1f2937',
            marginBottom: '16px'
          }}>
            {currentStepData.title}
          </h3>
          
          <p style={{ 
            fontSize: '16px', 
            color: '#6b7280',
            lineHeight: '1.6',
            marginBottom: '20px'
          }}>
            {currentStepData.description}
          </p>

          <div style={{
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <div style={{ 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#0369a1',
              marginBottom: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              ✨ Benefício Principal
            </div>
            <div style={{ fontSize: '14px', color: '#0c4a6e' }}>
              {currentStepData.benefit}
            </div>
          </div>

          {/* Cost tier notice for free users */}
          {costTier === 'free' && currentStepData.costTierRestriction === 'premium' && (
            <div style={{
              background: '#fef3c7',
              border: '1px solid #fcd34d',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#92400e',
                marginBottom: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                ⭐ Recurso Premium
              </div>
              <div style={{ fontSize: '14px', color: '#78350f' }}>
                Esta funcionalidade está disponível no plano premium. Faça upgrade para aproveitar!
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          background: '#f8fafc',
          padding: '20px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            {onSkip && (
              <button
                onClick={onSkip}
                style={{
                  background: 'transparent',
                  color: '#6b7280',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Pular tutorial
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              style={{
                background: currentStep === 0 ? '#f3f4f6' : 'transparent',
                color: currentStep === 0 ? '#9ca3af' : '#6b7280',
                border: '1px solid #d1d5db',
                padding: '10px 20px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: currentStep === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              Anterior
            </button>

            <button
              onClick={handleNext}
              style={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {isLastStep ? 'Finalizar' : 'Próximo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Guided Tour Component (for multi-step feature introduction)
export const GuidedTour: React.FC<GuidedTourProps> = ({
  isActive,
  steps,
  onComplete,
  onSkip,
  costTier = 'free'
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [highlightElement, setHighlightElement] = useState<HTMLElement | null>(null);

  const availableSteps = steps.filter(step => 
    !step.costTierRestriction || 
    step.costTierRestriction === 'all' || 
    step.costTierRestriction === costTier
  );

  const currentStep = availableSteps[currentStepIndex];

  useEffect(() => {
    if (isActive && currentStep?.targetElement) {
      const element = document.querySelector(currentStep.targetElement) as HTMLElement;
      if (element) {
        setHighlightElement(element);
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [isActive, currentStepIndex, currentStep]);

  const handleNext = () => {
    if (currentStepIndex < availableSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  if (!isActive || !currentStep) return null;

  const tooltipPosition = highlightElement ? 
    highlightElement.getBoundingClientRect() : 
    { top: window.innerHeight / 2, left: window.innerWidth / 2, width: 0, height: 0 };

  return (
    <>
      {/* Overlay */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          background: 'rgba(0, 0, 0, 0.5)',
          pointerEvents: 'none'
        }}
      />

      {/* Highlight spotlight */}
      {highlightElement && (
        <div
          style={{
            position: 'fixed',
            top: tooltipPosition.top - 8,
            left: tooltipPosition.left - 8,
            width: tooltipPosition.width + 16,
            height: tooltipPosition.height + 16,
            zIndex: 10000,
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
            pointerEvents: 'none'
          }}
        />
      )}

      {/* Tooltip */}
      <div
        style={{
          position: 'fixed',
          top: tooltipPosition.top + tooltipPosition.height + 16,
          left: Math.max(20, Math.min(tooltipPosition.left, window.innerWidth - 320)),
          zIndex: 10001,
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          maxWidth: '300px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e2e8f0'
        }}
      >
        <div style={{ marginBottom: '16px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            marginBottom: '8px'
          }}>
            <span style={{ fontSize: '20px' }}>{currentStep.icon}</span>
            <span style={{ 
              fontSize: '12px', 
              background: '#f3f4f6',
              color: '#6b7280',
              padding: '2px 8px',
              borderRadius: '10px'
            }}>
              {currentStepIndex + 1}/{availableSteps.length}
            </span>
          </div>
          
          <h4 style={{ 
            fontSize: '16px', 
            fontWeight: '600', 
            color: '#1f2937',
            marginBottom: '8px'
          }}>
            {currentStep.title}
          </h4>
          
          <p style={{ 
            fontSize: '14px', 
            color: '#6b7280',
            lineHeight: '1.4'
          }}>
            {currentStep.description}
          </p>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button
            onClick={onSkip}
            style={{
              background: 'transparent',
              color: '#6b7280',
              border: 'none',
              fontSize: '12px',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Pular
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handlePrevious}
              disabled={currentStepIndex === 0}
              style={{
                background: currentStepIndex === 0 ? '#f3f4f6' : 'transparent',
                color: currentStepIndex === 0 ? '#9ca3af' : '#6b7280',
                border: '1px solid #d1d5db',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: currentStepIndex === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              ←
            </button>

            <button
              onClick={handleNext}
              style={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              {currentStepIndex === availableSteps.length - 1 ? '✓' : '→'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// Feature Discovery Component (for subtle feature introductions)
export const FeatureDiscovery: React.FC<{
  feature: FeatureIntroStep;
  isVisible: boolean;
  onAcknowledge: () => void;
  onDismiss: () => void;
  costTier?: 'free' | 'premium';
}> = ({
  feature,
  isVisible,
  onAcknowledge,
  onDismiss,
  costTier = 'free'
}) => {
  if (!isVisible) return null;

  // Check if user has access to this feature
  const hasAccess = !feature.costTierRestriction || 
                   feature.costTierRestriction === 'all' || 
                   feature.costTierRestriction === costTier;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        maxWidth: '320px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
        border: hasAccess ? '2px solid #3b82f6' : '2px solid #f59e0b',
        animation: 'slideInUp 0.3s ease-out'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ fontSize: '24px', flexShrink: 0 }}>
          {feature.icon}
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            marginBottom: '8px'
          }}>
            <h4 style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              color: '#1f2937',
              margin: 0
            }}>
              {feature.title}
            </h4>
            
            {!hasAccess && (
              <span style={{ 
                fontSize: '10px', 
                background: '#f59e0b',
                color: 'white',
                padding: '2px 6px', 
                borderRadius: '8px',
                fontWeight: '600'
              }}>
                PREMIUM
              </span>
            )}
          </div>
          
          <p style={{ 
            fontSize: '14px', 
            color: '#6b7280',
            lineHeight: '1.4',
            margin: '0 0 12px 0'
          }}>
            {feature.description}
          </p>

          <div style={{
            background: hasAccess ? '#eff6ff' : '#fef3c7',
            padding: '8px',
            borderRadius: '6px',
            marginBottom: '16px'
          }}>
            <div style={{ 
              fontSize: '12px', 
              color: hasAccess ? '#1e40af' : '#92400e',
              fontWeight: '500'
            }}>
              {hasAccess ? '✨ ' + feature.benefit : '⭐ Faça upgrade para acessar este recurso'}
            </div>
          </div>

          <div style={{ 
            display: 'flex', 
            gap: '8px',
            justifyContent: 'flex-end'
          }}>
            <button
              onClick={onDismiss}
              style={{
                background: 'transparent',
                color: '#6b7280',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Depois
            </button>

            <button
              onClick={onAcknowledge}
              style={{
                background: hasAccess ? 
                  'linear-gradient(135deg, #3b82f6, #2563eb)' : 
                  'linear-gradient(135deg, #f59e0b, #d97706)',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              {hasAccess ? 'Experimentar' : 'Ver Planos'}
            </button>
          </div>
        </div>

        <button
          onClick={onDismiss}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#9ca3af',
            fontSize: '16px',
            cursor: 'pointer',
            padding: '4px',
            flexShrink: 0
          }}
        >
          ×
        </button>
      </div>

      <style>{`
        @keyframes slideInUp {
          from {
            transform: translateY(100px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

// Predefined feature introduction steps for common features
export const FEATURE_INTRO_TEMPLATES = {
  designSystem: {
    featureName: 'Novo Design System',
    steps: [
      {
        id: 'design-welcome',
        title: 'Interface Renovada',
        description: 'Apresentamos uma interface completamente renovada, mais moderna e intuitiva.',
        benefit: 'Experiência mais fluida e profissional',
        icon: '🎨',
        costTierRestriction: 'all' as const
      },
      {
        id: 'design-colors',
        title: 'Nova Paleta de Cores',
        description: 'Cores mais vibrantes e contrastes aprimorados para melhor legibilidade.',
        benefit: 'Redução da fadiga visual em sessões longas',
        icon: '🌈',
        costTierRestriction: 'all' as const
      },
      {
        id: 'design-components',
        title: 'Componentes Aprimorados',
        description: 'Botões, formulários e elementos interativos com visual mais moderno.',
        benefit: 'Interações mais claras e responsivas',
        icon: '🔧',
        costTierRestriction: 'all' as const
      }
    ]
  },
  
  enhancedIdeas: {
    featureName: 'Banco de Ideias Aprimorado',
    steps: [
      {
        id: 'ideas-welcome',
        title: 'Geração Mais Inteligente',
        description: 'Algoritmos aprimorados para sugestões mais precisas e personalizadas.',
        benefit: 'Ideias mais relevantes para seu estilo',
        icon: '🎯',
        costTierRestriction: 'all' as const
      },
      {
        id: 'ideas-personalization',
        title: 'Personalização Avançada',
        description: 'Sistema que aprende com suas preferências para sugestões ainda melhores.',
        benefit: 'Resultados cada vez mais alinhados com seu gosto',
        icon: '🧠',
        costTierRestriction: 'premium' as const
      },
      {
        id: 'ideas-organization',
        title: 'Organização Inteligente',
        description: 'Categorização automática e filtros avançados para suas ideias.',
        benefit: 'Encontre rapidamente a ideia perfeita',
        icon: '📚',
        costTierRestriction: 'all' as const
      }
    ]
  }
};

export default {
  FeatureIntroModal,
  GuidedTour,
  FeatureDiscovery,
  FEATURE_INTRO_TEMPLATES
}; 