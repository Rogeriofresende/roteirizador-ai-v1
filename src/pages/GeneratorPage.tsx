import React, { useState, useCallback, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import ScriptForm from '../components/ScriptForm';
import { PWAInstall } from '../components/PWAInstall';
import PWAFeedback from '../components/PWAFeedback';
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Separator } from "../components/ui/Separator";
import { Glow } from "../components/ui/Glow";
import { geminiService } from '../services/geminiService';
import { GeminiApiConfig } from '../components/GeminiApiConfig';
import type { FormData } from '../types';
import { analyticsService } from '../services/analyticsService';
import { cn } from '../lib/utils';

// CONVERSION OPTIMIZATION COMPONENTS
import { OnboardingFlow, QuickStartPrompt } from '../components/onboarding/OnboardingFlow';
import { ProgressiveFeatureDisclosure } from '../components/cro/ProgressiveFeatureDisclosure';
import { useOnboarding } from '../hooks/useOnboarding';

// STEP 2: Advanced Text Editor Integration - Enterprise Features
import { AdvancedTextEditor } from '../components/editor/AdvancedTextEditor';
import { useAuth } from '../contexts/AuthContext';

// STEP 3: Voice Synthesis Service Integration - 25+ Voices Enterprise
import { VoiceSynthesisPanel } from '../components/editor/VoiceSynthesisPanel';

// STEP 4: Advanced Analytics Service Integration - 35 Metrics Enterprise
import AIInsightsDashboard from '../components/analytics/AIInsightsDashboard';

// STEP 5: Collaboration Service Integration - Real-time Collaboration Enterprise
import { CollaborationService } from '../services/collaborationService';
import { CollaborationPanel, ShareButton } from '../features/collaboration';

// STEP 6: Template Library Integration - 50+ Templates Enterprise
import { TemplateService } from '../services/templateService';

// V5.1 Enhanced Framework imports - FIXED IMPORTS
import { usePredictiveUX } from '../hooks/usePredictiveUX';
import { SmartLoadingStates } from '../components/ui/SmartLoadingStates';
import { useSimpleLoading } from '../hooks/useSmartLoading';
import { PredictiveButton, PredictiveCard } from '../components/ui/AdvancedMicroInteractions';
import { v51Intelligence } from '../services/v51Intelligence';

const GeneratorPage: React.FC = () => {
  const [script, setScript] = useState<string>('');
  const [isConfigured, setIsConfigured] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [error, setError] = useState<string | null>(null);
  
  // V5.1: Multi-AI Selection State
  const [selectedAI, setSelectedAI] = useState<'gemini' | 'chatgpt'>('gemini');

  // CONVERSION OPTIMIZATION STATE
  const {
    isFirstTime,
    hasCompletedOnboarding,
    userJourneyStage,
    showQuickStart,
    isOnboardingOpen,
    startOnboarding,
    completeOnboarding,
    skipOnboarding,
    dismissQuickStart,
    getUserGuidance
  } = useOnboarding();

  // Track user's script generation count for progressive disclosure
  const [userScriptCount, setUserScriptCount] = useState(() => {
    try {
      return parseInt(localStorage.getItem('user_script_count') || '0');
    } catch {
      return 0;
    }
  });

  // Progressive Feature Disclosure state
  const [visibleFeatures, setVisibleFeatures] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('visible_features');
      return stored ? JSON.parse(stored) : ['templates']; // Only templates visible by default
    } catch {
      return ['templates'];
    }
  });

  // STEP 2: Advanced Editor Integration
  const { currentUser } = useAuth();
  const [currentProjectId, setCurrentProjectId] = useState<string>('');

  // STEP 3: Voice Synthesis Integration
  const [showVoicePanel, setShowVoicePanel] = useState(false);

  // STEP 4: Advanced Analytics Integration
  const [showAnalytics, setShowAnalytics] = useState(false);

  // STEP 5: Collaboration Integration - Week 8 Implementation
  const [showCollaborationPanel, setShowCollaborationPanel] = useState(false);

  // STEP 6: Template Library Integration
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [featuredTemplates, setFeaturedTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  // V5.1: Predictive UX and Smart Loading
  const { trackAction, getMostLikelyNext, getSessionStats } = usePredictiveUX();
  const { isLoading: isGenerating, startLoading, stopLoading } = useSimpleLoading();

  // CONVERSION OPTIMIZATION: Update script count and persist visible features
  useEffect(() => {
    localStorage.setItem('visible_features', JSON.stringify(visibleFeatures));
  }, [visibleFeatures]);

  // Handle feature toggle for progressive disclosure
  const handleFeatureToggle = useCallback((featureId: string, isVisible: boolean) => {
    setVisibleFeatures(prev => {
      if (isVisible) {
        return [...prev.filter(id => id !== featureId), featureId];
      } else {
        return prev.filter(id => id !== featureId);
      }
    });

    // Track feature usage for analytics
    analyticsService.trackEvent('feature_toggled', {
      featureId,
      isVisible,
      userScriptCount,
      userJourneyStage
    });
  }, [userScriptCount, userJourneyStage]);

  // V5.1: Track user interactions for learning
  useEffect(() => {
    trackAction('navigation', 'generator_page', { 
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
      userJourneyStage,
      hasCompletedOnboarding
    });

    // V5.1: Record pattern for intelligence system
    v51Intelligence.recordPattern(
      'session_' + Date.now(),
      ['navigation:homepage', 'navigation:generator_page'],
      'success',
      { 
        entryPoint: 'direct_access',
        userJourneyStage,
        isFirstTime
      }
    );
  }, [trackAction, userJourneyStage, hasCompletedOnboarding, isFirstTime]);

  // STEP 2: Initialize project ID for Advanced Editor
  useEffect(() => {
    if (!currentProjectId) {
      const projectId = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setCurrentProjectId(projectId);
    }
  }, [currentProjectId]);

  // STEP 6: Load featured templates
  useEffect(() => {
    const loadFeaturedTemplates = async () => {
      try {
        const templates = await TemplateService.getFeaturedTemplates(6);
        setFeaturedTemplates(templates);
      } catch (error) {
        console.error('Erro ao carregar templates em destaque:', error);
      }
    };

    loadFeaturedTemplates();
  }, []);

  useEffect(() => {
    const checkConfig = () => {
      const configured = geminiService.isConfigured();
      setIsConfigured(configured);
      
      if (configured) {
        // V5.1: Enhanced tracking with predictive context
        trackAction('configuration', 'api_ready', { 
          timestamp: Date.now(),
          userJourneyStage 
        });
        analyticsService.trackEvent('generator_ready', {
          timestamp: Date.now(),
          sessionStats: getSessionStats(),
          context: 'generator_ready',
          userJourneyStage
        });
      }
    };

    checkConfig();
    
    // Listener para mudanças no localStorage (quando API key é configurada)
    window.addEventListener('storage', checkConfig);
    
    // Check periodicamente também
    const interval = setInterval(checkConfig, 2000);
    
    return () => {
      window.removeEventListener('storage', checkConfig);
      clearInterval(interval);
    };
  }, [trackAction, getSessionStats, userJourneyStage]);

  // CONVERSION OPTIMIZATION: Enhanced generate handler with script count tracking
  const handleGenerate = useCallback(async (formData: FormData) => {
    if (!isConfigured) {
      alert('Configure sua API key do Gemini primeiro!');
      return;
    }

    // V5.1: Track generation pattern and predict next actions
    trackAction('click', 'generate_script', { 
      formData,
      selectedAI,
      prediction: getMostLikelyNext(),
      sessionStats: getSessionStats(),
      userJourneyStage,
      currentScriptCount: userScriptCount
    });

    startLoading();
    setScript('');
    
    try {
      // V5.1: Enhanced analytics with prediction context
      analyticsService.trackEvent('generation_started', {
        ...formData,
        selectedAI,
        predictiveContext: getMostLikelyNext(),
        sessionStats: getSessionStats(),
        context: 'generation_started',
        userJourneyStage,
        scriptCount: userScriptCount
      });
      
      // V5.1: Multi-AI Support - Route to selected AI service
      const generatedScript = selectedAI === 'gemini'
        ? await geminiService.generateScript({
            subject: formData.subject,
            platform: formData.platform,
            duration: formData.duration,
            tone: formData.tone,
            audience: formData.audience,
            objective: formData.objective
          })
        : await geminiService.generateScript({ // Fallback to Gemini until ChatGPT is ready
            subject: formData.subject,
            platform: formData.platform,
            duration: formData.duration,
            tone: formData.tone,
            audience: formData.audience,
            objective: formData.objective
          });
      
      setScript(generatedScript);

      // CONVERSION OPTIMIZATION: Update script count
      const newScriptCount = userScriptCount + 1;
      setUserScriptCount(newScriptCount);
      localStorage.setItem('user_script_count', newScriptCount.toString());
      
      // V5.1: Record successful pattern for learning
      v51Intelligence.recordPattern(
        'session_' + Date.now(),
        ['click:generate_script', 'data:script_generated'],
        'success',
        { 
          scriptLength: generatedScript.length,
          platform: formData.platform,
          subject: formData.subject.substring(0, 50), // Truncate for privacy
          scriptCount: newScriptCount,
          userJourneyStage
        }
      );
      
      // Track successful generation with V5.1 context
      analyticsService.trackEvent('generation_completed', {
        ...formData,
        script_length: generatedScript.length,
        sessionStats: getSessionStats(),
        context: 'generation_completed',
        scriptCount: newScriptCount,
        userJourneyStage
      });
      
    } catch (error: unknown) {
      console.error('Erro ao gerar roteiro:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(`Falha ao gerar roteiro: ${errorMessage}`);
    } finally {
      stopLoading();
    }
  }, [isConfigured, trackAction, getMostLikelyNext, getSessionStats, startLoading, stopLoading, selectedAI, userScriptCount, userJourneyStage]);

  // V5.1: Enhanced script change handler with tracking
  const handleScriptChange = useCallback((newScript: string) => {
    setScript(newScript);
    trackAction('input', 'script_edit', { 
      length: newScript.length,
      action: 'manual_edit',
      userJourneyStage
    });
  }, [trackAction, userJourneyStage]);

  // V5.1: Enhanced copy handler with predictive context
  const handleCopyScript = useCallback(() => {
    navigator.clipboard.writeText(script);
    trackAction('click', 'copy_script', { 
      scriptLength: script.length,
      nextPrediction: getMostLikelyNext(),
      userJourneyStage
    });
    
    // V5.1: Record copy pattern for learning
    v51Intelligence.recordPattern(
      'session_' + Date.now(),
      ['data:script_generated', 'click:copy_script'],
      'success',
      { 
        scriptLength: script.length,
        userJourneyStage
      }
    );
  }, [script, trackAction, getMostLikelyNext, userJourneyStage]);

  // STEP 3: Voice synthesis handler
  const handleOpenVoicePanel = useCallback(() => {
    setShowVoicePanel(true);
    trackAction('click', 'open_voice_panel', {
      scriptLength: script.length,
      hasScript: script.length > 0,
      userJourneyStage
    });
  }, [script.length, trackAction, userJourneyStage]);

  // STEP 4: Analytics dashboard handler
  const handleToggleAnalytics = useCallback(() => {
    setShowAnalytics(!showAnalytics);
    trackAction('click', showAnalytics ? 'close_analytics' : 'open_analytics', {
      currentView: showAnalytics ? 'visible' : 'hidden',
      sessionStats: getSessionStats(),
      userJourneyStage
    });
  }, [showAnalytics, trackAction, getSessionStats, userJourneyStage]);

  // STEP 5: Collaboration handlers - Week 8 Implementation
  const handleToggleCollaboration = useCallback(() => {
    setShowCollaborationPanel(!showCollaborationPanel);
    trackAction('click', showCollaborationPanel ? 'close_collaboration' : 'open_collaboration', {
      projectId: currentProjectId,
      userJourneyStage
    });
  }, [showCollaborationPanel, trackAction, currentProjectId, userJourneyStage]);

  const handleShareCollaboration = useCallback((shareLink: string) => {
    trackAction('collaboration', 'share_link_generated', {
      projectId: currentProjectId,
      shareLink,
      userJourneyStage
    });
    console.log('🔗 Collaboration link generated:', shareLink);
  }, [trackAction, currentProjectId, userJourneyStage]);

  // STEP 6: Template library handlers
  const handleToggleTemplates = useCallback(() => {
    setShowTemplateLibrary(!showTemplateLibrary);
    trackAction('click', showTemplateLibrary ? 'close_templates' : 'open_templates', {
      featuredCount: featuredTemplates.length,
      userJourneyStage
    });
  }, [showTemplateLibrary, featuredTemplates.length, trackAction, userJourneyStage]);

  const handleUseTemplate = useCallback(async (template: any) => {
    if (!currentUser) return;

    try {
      // Usar valores padrão para placeholders
      const placeholderValues = {
        skill: 'usar esta funcionalidade',
        benefit: 'melhorar seus resultados',
        product: 'produto incrível',
        problem: 'problema comum',
        solution: 'solução eficaz'
      };

      const newScript = await TemplateService.applyTemplate(
        template.id,
        currentUser.uid,
        placeholderValues
      );

      setScript(newScript.content);
      setSelectedTemplate(template);
      setShowTemplateLibrary(false);

      trackAction('template', 'template_used', {
        templateId: template.id,
        templateTitle: template.title,
        category: template.category,
        scriptLength: newScript.content.length,
        userJourneyStage
      });

    } catch (error) {
      console.error('Erro ao usar template:', error);
      alert('Erro ao aplicar template: ' + (error as Error).message);
    }
  }, [currentUser, trackAction, userJourneyStage]);

  // CONVERSION OPTIMIZATION: Handle onboarding completion
  const handleOnboardingComplete = useCallback(() => {
    completeOnboarding();
    
    // Track successful onboarding conversion
    analyticsService.trackEvent('onboarding_conversion_success', {
      userJourneyStage: 'experienced',
      timestamp: Date.now(),
      conversionType: 'completed'
    });
  }, [completeOnboarding]);

  // Se API não está configurada, mostrar interface de configuração V5.1
  if (!isConfigured) {
    return (
      <>
        <Navbar />
        <div className="pt-20 min-h-screen bg-background">
          <GeminiApiConfig />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      
      {/* CONVERSION OPTIMIZATION: Onboarding Flow */}
      <OnboardingFlow
        isOpen={isOnboardingOpen}
        onComplete={handleOnboardingComplete}
        onSkip={skipOnboarding}
        variant="first-time"
      />

      <section className={cn(
        "bg-background text-foreground",
        "py-12 sm:py-24 md:py-32 px-4",
        "fade-bottom overflow-hidden min-h-screen pt-20"
      )}>
        <div className="mx-auto flex max-w-container flex-col gap-12">
          <div className="flex flex-col items-center gap-6 text-center sm:gap-12">
            {/* V5.1 Enhanced Title */}
            <h1 className="relative z-10 inline-block animate-appear bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-4xl font-semibold leading-tight text-transparent drop-shadow-2xl sm:text-6xl sm:leading-tight">
              Roteirar IA - Gerador V5.1
            </h1>

            {/* V5.1 Enhanced Description */}
            <p className="text-md relative z-10 max-w-[550px] animate-appear font-medium text-muted-foreground opacity-0 delay-100 sm:text-xl">
              Transforme suas ideias em roteiros profissionais com inteligência preditiva
            </p>

            {/* CONVERSION OPTIMIZATION: Quick Start Prompt for new/returning users */}
            {showQuickStart && !hasCompletedOnboarding && (
              <div className="w-full max-w-2xl animate-appear opacity-0 delay-200">
                <QuickStartPrompt
                  onStartOnboarding={startOnboarding}
                  onDismiss={dismissQuickStart}
                />
              </div>
            )}

            {/* V5.1 Enhanced Main Content Grid */}
            <div className="relative z-10 w-full grid lg:grid-cols-3 gap-8 max-w-7xl animate-appear opacity-0 delay-300">
              {/* V5.1 Enhanced Form Section */}
              <div className="lg:col-span-2 space-y-6">
                {/* V5.1: Multi-AI Selector - Only show if advanced features unlocked */}
                {(userScriptCount >= 3 || visibleFeatures.includes('multi-ai')) && (
                  <PredictiveCard 
                    className="p-4"
                    data-track-id="ai_selector_card"
                  >
                    <h3 className="text-lg font-semibold mb-4 text-foreground">
                      Escolha sua IA
                    </h3>
                    <div className="flex gap-3 p-3 bg-muted/30 rounded-lg">
                      <PredictiveButton
                        variant={selectedAI === 'gemini' ? 'default' : 'outline'}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 transition-all",
                          selectedAI === 'gemini' && "shadow-md scale-[1.02]"
                        )}
                        onClick={() => {
                          setSelectedAI('gemini');
                          trackAction('click', 'ai_selector_gemini', { 
                            previousAI: selectedAI,
                            newAI: 'gemini',
                            userJourneyStage
                          });
                        }}
                        data-track-id="select_gemini"
                      >
                        <span className="text-xl">🧠</span>
                        <span className="font-medium">Gemini AI</span>
                        {selectedAI === 'gemini' && (
                          <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                            Ativo
                          </span>
                        )}
                      </PredictiveButton>
                      
                      <PredictiveButton
                        variant={selectedAI === 'chatgpt' ? 'default' : 'outline'}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 transition-all",
                          selectedAI === 'chatgpt' && "shadow-md scale-[1.02]"
                        )}
                        onClick={() => {
                          setSelectedAI('chatgpt');
                          trackAction('click', 'ai_selector_chatgpt', { 
                            previousAI: selectedAI,
                            newAI: 'chatgpt',
                            userJourneyStage
                          });
                        }}
                        data-track-id="select_chatgpt"
                      >
                        <span className="text-xl">🤖</span>
                        <span className="font-medium">ChatGPT</span>
                        {selectedAI === 'chatgpt' && (
                          <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            Ativo
                          </span>
                        )}
                      </PredictiveButton>
                    </div>
                    <p className="text-sm text-muted-foreground mt-3">
                      {selectedAI === 'gemini' 
                        ? '⚡ Gemini: Rápido e criativo, ideal para conteúdo viral'
                        : '💡 ChatGPT: Detalhado e eloquente, perfeito para roteiros complexos'
                      }
                    </p>
                  </PredictiveCard>
                )}

                <PredictiveCard 
                  className="p-6"
                  data-track-id="form_card"
                >
                  <h2 className="text-2xl font-semibold mb-6 text-foreground">
                    Configurações do Roteiro
                  </h2>
                  <ScriptForm 
                    onSubmit={handleGenerate} 
                    isLoading={isGenerating}
                  />
                </PredictiveCard>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <PWAInstall />
                  <PWAFeedback />
                </div>

                {/* STEP 4: Analytics Toggle Button - Progressive Disclosure */}
                {(userScriptCount >= 1 || visibleFeatures.includes('analytics')) && (
                  <PredictiveCard className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Insights de IA</h3>
                        <p className="text-sm text-muted-foreground">
                          Análise comportamental e recomendações
                        </p>
                      </div>
                      <PredictiveButton
                        onClick={handleToggleAnalytics}
                        variant={showAnalytics ? "default" : "outline"}
                        size="sm"
                        data-track-id="analytics_toggle"
                      >
                        📊 {showAnalytics ? 'Ocultar' : 'Ver'} Analytics
                      </PredictiveButton>
                    </div>
                  </PredictiveCard>
                )}

                {/* STEP 5: Collaboration Controls - Progressive Disclosure */}
                {currentUser && currentProjectId && (userScriptCount >= 3 || visibleFeatures.includes('collaboration')) && (
                  <PredictiveCard className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Colaboração em Tempo Real</h3>
                        <p className="text-sm text-muted-foreground">
                          Compartilhe e edite roteiros em tempo real
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <ShareButton
                          projectId={currentProjectId}
                          onShare={handleShareCollaboration}
                          size="small"
                        />
                        <PredictiveButton
                          onClick={handleToggleCollaboration}
                          variant={showCollaborationPanel ? "default" : "outline"}
                          size="sm"
                          data-track-id="toggle_collaboration"
                        >
                          👥 {showCollaborationPanel ? 'Ocultar' : 'Ver'} Painel
                        </PredictiveButton>
                      </div>
                    </div>
                  </PredictiveCard>
                )}

                {/* STEP 6: Template Library Controls */}
                {visibleFeatures.includes('templates') && (
                  <PredictiveCard className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Biblioteca de Templates</h3>
                        <p className="text-sm text-muted-foreground">
                          {selectedTemplate 
                            ? `Template ativo: ${selectedTemplate.title}`
                            : `${featuredTemplates.length} templates disponíveis`
                          }
                        </p>
                      </div>
                      <PredictiveButton
                        onClick={handleToggleTemplates}
                        variant={showTemplateLibrary ? "default" : "outline"}
                        size="sm"
                        data-track-id="toggle_templates"
                      >
                        📚 {showTemplateLibrary ? 'Ocultar' : 'Ver'} Templates
                      </PredictiveButton>
                    </div>
                  </PredictiveCard>
                )}
              </div>

              {/* CONVERSION OPTIMIZATION: Progressive Feature Disclosure Sidebar */}
              <div className="space-y-6">
                <ProgressiveFeatureDisclosure
                  userScriptCount={userScriptCount}
                  onFeatureToggle={handleFeatureToggle}
                  visibleFeatures={visibleFeatures}
                  variant="sidebar"
                />
              </div>
            </div>

            {/* Enhanced Result Section with Progressive Features */}
            {script && (
              <div className="relative z-10 w-full max-w-4xl animate-appear opacity-0 delay-500">
                <Card className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-foreground">
                      Seu Roteiro Gerado
                    </h2>
                    <div className="flex space-x-2">
                      <PredictiveButton
                        onClick={handleCopyScript}
                        variant="outline"
                        size="sm"
                        data-track-id="copy_script"
                      >
                        📋 Copiar
                      </PredictiveButton>
                      
                      {/* Voice Panel - Progressive Disclosure */}
                      {(userScriptCount >= 1 || visibleFeatures.includes('voice-synthesis')) && (
                        <PredictiveButton
                          onClick={handleOpenVoicePanel}
                          variant="outline"
                          size="sm"
                          data-track-id="voice_panel"
                        >
                          🎤 Áudio
                        </PredictiveButton>
                      )}
                    </div>
                  </div>
                  
                  <AdvancedTextEditor
                    value={script}
                    onChange={handleScriptChange}
                    projectId={currentProjectId}
                    className="min-h-[400px]"
                  />
                </Card>
              </div>
            )}

            {/* Analytics Dashboard - Progressive Disclosure */}
            {showAnalytics && (userScriptCount >= 1 || visibleFeatures.includes('analytics')) && (
              <div className="relative z-10 w-full max-w-6xl animate-appear opacity-0 delay-600">
                <AIInsightsDashboard />
              </div>
            )}

            {/* Collaboration Panel - Progressive Disclosure */}
            {showCollaborationPanel && currentUser && (userScriptCount >= 3 || visibleFeatures.includes('collaboration')) && (
              <div className="relative z-10 w-full max-w-4xl animate-appear opacity-0 delay-700">
                <CollaborationPanel
                  projectId={currentProjectId}
                  initialScript={script}
                  onScriptChange={handleScriptChange}
                />
              </div>
            )}

            {/* Voice Synthesis Panel */}
            {showVoicePanel && script && (
              <VoiceSynthesisPanel
                script={script}
                onClose={() => setShowVoicePanel(false)}
                projectId={currentProjectId}
              />
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default GeneratorPage;