/**
 * 🎯 COMPLETE FLOW COMPONENT V8.0
 * Fluxo completo de qualificação integrando os 3 wireframes
 * Metodologia V8.0 Unified Development - MIGRADO PARA INTERFACE UNIFICADA
 */

import React, { useState } from 'react';
import { SocialMediaInput } from './SocialMediaInput';
import { AIAnalysisLoading } from './AIAnalysisLoading';
import { AIInsightsDisplay } from './AIInsightsDisplay';
import { 
  UnifiedAnalysisResult,
  QualificationFlowStep,
  QualificationCompletionData,
  CompleteFlowProps,
  SocialProfiles,
  AnalysisInsight,
  ProfileAnalysis,
  AnalysisStatistics,
  AnalysisMetadata,
  createEmptyAnalysisResult,
  getConfidenceLevel
} from '../../../../types/QualificationTypes';

// ============================================================================
// COMPLETE FLOW COMPONENT
// ============================================================================

export const CompleteFlow: React.FC<CompleteFlowProps> = ({ 
  onComplete,
  className = "",
  initialStep = 'input',
  skipSocialValidation = false
}) => {
  const [currentStep, setCurrentStep] = useState<QualificationFlowStep>(initialStep);
  const [socialProfiles, setSocialProfiles] = useState<SocialProfiles>({});
  const [analysisResult, setAnalysisResult] = useState<UnifiedAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  
  // Analytics tracking
  const [flowEvents, setFlowEvents] = useState<string[]>([]);
  
  const trackEvent = (event: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const eventLog = `${timestamp}: ${event}`;
    setFlowEvents(prev => [...prev, eventLog]);
    console.log('📊 [COMPLETE FLOW] Analytics:', eventLog);
  };

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSocialMediaSubmit = async (profiles: SocialProfiles) => {
    trackEvent(`Social profiles submitted (${Object.keys(profiles).length} platforms)`);
    setSocialProfiles(profiles);
    setCurrentStep('analysis');
    
    // Start AI analysis
    setIsAnalyzing(true);
    setAnalysisError(null);
    
    try {
      trackEvent('AI analysis started - REAL V8.0');
      
      // ✅ V8.0 REAL INTEGRATION: Usar análise real ao invés de simulação
      console.log('🧠 [V8.0 REAL] Starting real AI analysis with GeminiService...');
      
      // Import do serviço real de análise
      const { qualificationAnalysisService } = await import('../../../../services/qualificationAnalysisService');
      
      // Análise REAL usando GeminiService - substitui simulação completa
      const analysis = await qualificationAnalysisService.analyzeProfiles(profiles);
      
      console.log('✅ [V8.0 REAL] Real analysis completed:', {
        confidence: analysis.confidence,
        insights: analysis.insights.length,
        model: analysis.metadata?.modelUsed,
        version: analysis.metadata?.analysisVersion
      });

      setAnalysisResult(analysis);
      trackEvent(`AI analysis completed - REAL (confidence: ${analysis.confidence}%)`);
      setCurrentStep('insights');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro na análise';
      setAnalysisError(errorMessage);
      trackEvent(`AI analysis failed - REAL: ${errorMessage}`);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const handleInsightsProceed = () => {
    if (!analysisResult) return;
    
    trackEvent('User confirmed insights - proceeding to idea generation');
    setCurrentStep('completed');
    
    const completionData: QualificationCompletionData = {
      profiles: socialProfiles,
      analysis: analysisResult,
      userDecision: 'proceed',
      completedAt: new Date().toISOString(),
      flowDuration: performance.now(),
      userSatisfactionScore: 5 // Default high satisfaction
    };
    
    onComplete?.(completionData);
  };
  
  const handleInsightsRefine = () => {
    trackEvent('User requested refinement - returning to input');
    setCurrentStep('input');
    setAnalysisResult(null);
    setAnalysisError(null);
  };
  
  const handleAnalysisRetry = () => {
    trackEvent('User retrying analysis');
    handleSocialMediaSubmit(socialProfiles);
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderStepIndicator = () => {
    const steps = [
      { key: 'input', label: 'Perfis', number: 1 },
      { key: 'analysis', label: 'Análise', number: 2 },
      { key: 'insights', label: 'Insights', number: 3 }
    ] as const;

    return (
      <div className="flex items-center justify-center space-x-4 mb-8">
        {steps.map((step, index) => {
          const isActive = currentStep === step.key;
          const isCompleted = steps.findIndex(s => s.key === currentStep) > index || currentStep === 'completed';
          
          return (
            <div key={step.key} className="flex items-center">
              <div 
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300
                  ${isActive ? 'bg-blue-600 text-white shadow-lg scale-110' : 
                    isCompleted ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}
                `}
              >
                {step.number}
              </div>
              
              {/* Label */}
              <span className={`ml-2 text-sm font-medium ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                {step.label}
              </span>
              
              {/* Connector */}
              {index < steps.length - 1 && (
                <div className={`w-16 h-1 mx-4 transition-colors duration-300 ${isCompleted ? 'bg-green-600' : 'bg-gray-200'}`} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'input':
        return (
          <div className="animate-fadeIn">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                🔗 Conecte seus perfis sociais
              </h2>
              <p className="text-gray-600">
                Nossa IA analisará seu conteúdo para criar ideias personalizadas
              </p>
            </div>
            <SocialMediaInput
              onAnalyze={handleSocialMediaSubmit}
              initialProfiles={socialProfiles}
            />
          </div>
        );
      
      case 'analysis':
        return (
          <div className="animate-fadeIn">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                🧠 Analisando seus perfis
              </h2>
              <p className="text-gray-600">
                Aguarde enquanto nossa IA analisa seu conteúdo e estilo
              </p>
            </div>
            <AIAnalysisLoading
              isAnalyzing={isAnalyzing}
              error={analysisError}
              onRetry={handleAnalysisRetry}
              profiles={Object.keys(socialProfiles)}
            />
          </div>
        );
      
      case 'insights':
        return analysisResult ? (
          <div className="animate-fadeIn">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                ✨ Insights da sua análise
              </h2>
              <p className="text-gray-600">
                Veja o que descobrimos sobre seu perfil e audiência
              </p>
              <div className="mt-4 flex justify-center">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  getConfidenceLevel(analysisResult.confidence) === 'very-high' ? 'bg-green-100 text-green-800' :
                  getConfidenceLevel(analysisResult.confidence) === 'high' ? 'bg-blue-100 text-blue-800' :
                  getConfidenceLevel(analysisResult.confidence) === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  Confiança: {analysisResult.confidence}% ({getConfidenceLevel(analysisResult.confidence)})
                </div>
              </div>
            </div>
            <AIInsightsDisplay
              analysis={analysisResult}
              onProceed={handleInsightsProceed}
              onRefineAnalysis={handleInsightsRefine}
              loading={false}
            />
          </div>
        ) : null;
      
      case 'completed':
        return (
          <div className="animate-fadeIn text-center py-12">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎉</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Análise Concluída!
              </h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Agora podemos gerar ideias de conteúdo personalizadas baseadas no seu perfil.
              </p>
              {analysisResult && (
                <div className="mt-4 text-sm text-gray-500">
                  {analysisResult.stats.postsAnalyzed} posts analisados • 
                  {analysisResult.insights.length} insights gerados •
                  Modelo: {analysisResult.metadata?.modelUsed}
                </div>
              )}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className={`max-w-4xl mx-auto space-y-8 ${className}`}>
      {/* Step Indicator */}
      {renderStepIndicator()}
      
      {/* Step Content */}
      <div className="min-h-[600px]">
        {renderStepContent()}
      </div>
      
      {/* Debug Info (Development Only) */}
      {process.env.NODE_ENV === 'development' && flowEvents.length > 0 && (
        <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="font-medium text-gray-800 mb-2">
            📊 Flow Analytics (Dev Mode) - V8.0 Unified Interface
          </h3>
          <ul className="text-sm text-gray-600 space-y-1 max-h-32 overflow-y-auto">
            {flowEvents.map((event, index) => (
              <li key={index}>• {event}</li>
            ))}
          </ul>
          {analysisResult && (
            <div className="mt-2 text-xs text-gray-500">
              Interface Version: {analysisResult.metadata?.analysisVersion} |
              Confidence Level: {getConfidenceLevel(analysisResult.confidence)} |
              Processing Time: {analysisResult.metadata?.processingTime.toFixed(2)}ms
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// CSS ANIMATIONS (para ser adicionado ao CSS global)
// ============================================================================

/*
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease-out;
}
*/ 