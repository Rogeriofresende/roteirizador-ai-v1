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

// DESIGN SYSTEM IMPORTS
import { Layout } from '../design-system/components/Layout';
import { theme } from '../design-system/tokens';

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
import { TouchGestureHandler } from '../components/mobile/TouchGestureHandler';

const GeneratorPage: React.FC = () => {
  const [script, setScript] = useState<string>('');
  const [isConfigured, setIsConfigured] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [error, setError] = useState<string | null>(null);

  // V5.1 Enhanced State Management
  const [selectedAI, setSelectedAI] = useState<'gemini' | 'chatgpt'>('gemini');
  const [userScriptCount, setUserScriptCount] = useState(0);
  const [showVoicePanel, setShowVoicePanel] = useState(false);
  const [showCollaborationPanel, setShowCollaborationPanel] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [featuredTemplates, setFeaturedTemplates] = useState([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  // CONVERSION OPTIMIZATION: Enhanced onboarding and progressive disclosure
  const { 
    isOnboardingOpen, 
    hasCompletedOnboarding, 
    showQuickStart, 
    startOnboarding, 
    completeOnboarding, 
    skipOnboarding, 
    dismissQuickStart 
  } = useOnboarding();

  // V5.1 Enhanced UX Intelligence
  const {
    trackAction,
    getMostLikelyNext,
    getSessionStats,
    userJourneyStage,
    visibleFeatures,
    handleFeatureToggle
  } = usePredictiveUX();

  // V5.1 Enhanced Loading States
  const { 
    isLoading, 
    startLoading, 
    stopLoading, 
    loadingStage 
  } = useSimpleLoading();

  const { currentUser } = useAuth();

  // Load featured templates
  const loadFeaturedTemplates = async () => {
    try {
      const templates = await TemplateService.getFeaturedTemplates();
      setFeaturedTemplates(templates.slice(0, 6)); // Limit to 6 featured
    } catch (error) {
      // Silently handle template loading errors - service already logs appropriately
      console.log('ℹ️ [GENERATOR] Template loading handled by TemplateService');
    }
  };

  useEffect(() => {
    const checkConfig = () => {
      const configured = geminiService.isConfigured();
      setIsConfigured(configured);
      
      if (configured) {
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
    window.addEventListener('storage', checkConfig);
    const interval = setInterval(checkConfig, 2000);
    
    return () => {
      window.removeEventListener('storage', checkConfig);
      clearInterval(interval);
    };
  }, [trackAction, getSessionStats, userJourneyStage]);

  // Enhanced generate handler
  const handleGenerate = useCallback(async (formData: FormData) => {
    if (!isConfigured) {
      alert('Configure sua API key do Gemini primeiro!');
      return;
    }

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
      const generatedScript = selectedAI === 'gemini'
        ? await geminiService.generateScript({
            subject: formData.subject,
            platform: formData.platform,
            duration: formData.duration,
            tone: formData.tone,
            audience: formData.audience,
            objective: formData.objective
          })
        : await geminiService.generateScript({
            subject: formData.subject,
            platform: formData.platform,
            duration: formData.duration,
            tone: formData.tone,
            audience: formData.audience,
            objective: formData.objective
          });
      
      setScript(generatedScript);
      
      const newScriptCount = userScriptCount + 1;
      setUserScriptCount(newScriptCount);
      localStorage.setItem('user_script_count', newScriptCount.toString());
      
      v51Intelligence.recordPattern(
        'session_' + Date.now(),
        ['click:generate_script', 'data:script_generated'],
        'success',
        { 
          scriptLength: generatedScript.length,
          platform: formData.platform,
          scriptCount: newScriptCount
        }
      );

      analyticsService.trackEvent('generation_success', {
        ...formData,
        selectedAI,
        scriptLength: generatedScript.length,
        scriptCount: newScriptCount,
        userJourneyStage
      });

    } catch (err) {
      console.error('Erro na geração:', err);
      setError('Erro ao gerar roteiro. Tente novamente.');
      
      analyticsService.trackEvent('generation_error', {
        error: (err as Error).message,
        selectedAI,
        userJourneyStage
      });
    } finally {
      stopLoading();
    }
  }, [isConfigured, selectedAI, userScriptCount, trackAction, getMostLikelyNext, getSessionStats, userJourneyStage, startLoading, stopLoading]);

  // Handlers for various features
  const handleCopyScript = useCallback(() => {
    navigator.clipboard.writeText(script);
    trackAction('click', 'copy_script', { scriptLength: script.length });
  }, [script, trackAction]);

  const handleScriptChange = useCallback((newScript: string) => {
    setScript(newScript);
  }, []);

  const handleOpenVoicePanel = useCallback(() => {
    setShowVoicePanel(true);
    trackAction('click', 'open_voice_panel', { scriptLength: script.length });
  }, [script.length, trackAction]);

  const handleToggleCollaboration = useCallback(() => {
    setShowCollaborationPanel(prev => !prev);
    trackAction('click', 'toggle_collaboration', { showing: !showCollaborationPanel });
  }, [showCollaborationPanel, trackAction]);

  const handleToggleTemplates = useCallback(() => {
    setShowTemplateLibrary(prev => !prev);
    if (!showTemplateLibrary) {
      loadFeaturedTemplates();
    }
    trackAction('click', 'toggle_templates', { showing: !showTemplateLibrary });
  }, [showTemplateLibrary, trackAction]);

  const handleShareCollaboration = useCallback((shareData: any) => {
    trackAction('collaboration', 'project_shared', shareData);
  }, [trackAction]);

  const handleOnboardingComplete = useCallback(() => {
    completeOnboarding();
    analyticsService.trackEvent('onboarding_conversion_success', {
      userJourneyStage: 'experienced',
      timestamp: Date.now(),
      conversionType: 'completed'
    });
  }, [completeOnboarding]);

  // Se API não está configurada, mostrar interface de configuração
  if (!isConfigured) {
    return (
      <Layout.Page variant="centered">
        <Navbar />
        <Layout.Section spacing="loose" className="pt-20">
          <Layout.Card variant="elevated" padding="lg" className="max-w-2xl mx-auto">
            <GeminiApiConfig />
          </Layout.Card>
        </Layout.Section>
      </Layout.Page>
    );
  }

  return (
    <Layout.Page variant="generator">
      <Navbar />
      
      {/* ONBOARDING FLOW */}
      <OnboardingFlow
        isOpen={isOnboardingOpen}
        onComplete={handleOnboardingComplete}
        onSkip={skipOnboarding}
        variant="first-time"
      />

      {/* HERO SECTION */}
      <Layout.Section spacing="loose" className="pt-20">
        <div className="text-center">
          <Layout.Heading 
            level={1} 
            className="mb-6 bg-gradient-to-r from-primary-600 via-accent-600 to-primary-800 bg-clip-text text-transparent"
          >
            Roteirar IA - Gerador V5.1
          </Layout.Heading>
          
          <Layout.Text variant="bodyLarge" color="muted" className="mb-8 max-w-2xl mx-auto">
            Transforme suas ideias em roteiros profissionais com inteligência preditiva
          </Layout.Text>

          {/* QUICK START PROMPT */}
          {showQuickStart && !hasCompletedOnboarding && (
            <div className="mb-8 max-w-2xl mx-auto">
              <QuickStartPrompt
                onStartOnboarding={startOnboarding}
                onDismiss={dismissQuickStart}
              />
            </div>
          )}
        </div>
      </Layout.Section>

      {/* MAIN CONTENT SECTION */}
      <Layout.Section spacing="normal" background="white">
        <Layout.Grid cols={3} gap="lg" className="max-w-7xl mx-auto">
          
          {/* FORM SECTION */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* AI SELECTOR */}
            {(userScriptCount >= 3 || visibleFeatures.includes('multi-ai')) && (
              <Layout.Card variant="elevated" padding="md">
                <Layout.Heading level={4} className="mb-4">
                  Escolha sua IA
                </Layout.Heading>
                <div className="flex gap-3 p-3 bg-neutral-50 rounded-lg">
                  <Button
                    variant={selectedAI === 'gemini' ? 'default' : 'outline'}
                    onClick={() => setSelectedAI('gemini')}
                    className="flex items-center gap-2"
                  >
                    ✨ Gemini 1.5 Flash
                  </Button>
                  <Button
                    variant={selectedAI === 'chatgpt' ? 'default' : 'outline'}
                    onClick={() => setSelectedAI('chatgpt')}
                    className="flex items-center gap-2"
                    disabled
                  >
                    🚀 ChatGPT (Em breve)
                  </Button>
                </div>
              </Layout.Card>
            )}

            {/* SCRIPT FORM */}
            <Layout.Card variant="elevated" padding="lg">
              <Layout.Heading level={3} className="mb-6">
                Dados do Roteiro
              </Layout.Heading>
              
              {isLoading && (
                <div className="mb-4">
                  <SmartLoadingStates
                    isLoading={true}
                    loadingStage={loadingStage}
                    className="w-full"
                  />
                </div>
              )}
              
              <ScriptForm onGenerate={handleGenerate} />
              
              {error && (
                <div className="mt-4 p-4 bg-error-50 border border-error-200 rounded-lg">
                  <Layout.Text variant="body" color="error">
                    {error}
                  </Layout.Text>
                </div>
              )}
            </Layout.Card>

            {/* ANALYTICS PANEL */}
            {(userScriptCount >= 2 || visibleFeatures.includes('analytics')) && (
              <Layout.Card variant="interactive" padding="md">
                <div className="flex items-center justify-between">
                  <div>
                    <Layout.Heading level={5}>Analytics Avançado</Layout.Heading>
                    <Layout.Text variant="bodySmall" color="muted">
                      Insights sobre performance dos roteiros
                    </Layout.Text>
                  </div>
                  <Button
                    onClick={() => setShowAnalytics(prev => !prev)}
                    variant={showAnalytics ? "default" : "outline"}
                    size="sm"
                  >
                    📊 {showAnalytics ? 'Ocultar' : 'Ver'} Analytics
                  </Button>
                </div>
              </Layout.Card>
            )}

            {/* COLLABORATION PANEL */}
            {(userScriptCount >= 3 || visibleFeatures.includes('collaboration')) && currentUser && (
              <Layout.Card variant="interactive" padding="md">
                <div className="flex items-center justify-between">
                  <div>
                    <Layout.Heading level={5}>Colaboração em Tempo Real</Layout.Heading>
                    <Layout.Text variant="bodySmall" color="muted">
                      Compartilhe e edite roteiros em tempo real
                    </Layout.Text>
                  </div>
                  <div className="flex space-x-2">
                    <ShareButton
                      projectId={currentProjectId}
                      onShare={handleShareCollaboration}
                      size="small"
                    />
                    <Button
                      onClick={handleToggleCollaboration}
                      variant={showCollaborationPanel ? "default" : "outline"}
                      size="sm"
                    >
                      👥 {showCollaborationPanel ? 'Ocultar' : 'Ver'} Painel
                    </Button>
                  </div>
                </div>
              </Layout.Card>
            )}

            {/* TEMPLATE LIBRARY */}
            {visibleFeatures.includes('templates') && (
              <Layout.Card variant="interactive" padding="md">
                <div className="flex items-center justify-between">
                  <div>
                    <Layout.Heading level={5}>Biblioteca de Templates</Layout.Heading>
                    <Layout.Text variant="bodySmall" color="muted">
                      {selectedTemplate 
                        ? `Template ativo: ${selectedTemplate.title}`
                        : `${featuredTemplates.length} templates disponíveis`
                      }
                    </Layout.Text>
                  </div>
                  <Button
                    onClick={handleToggleTemplates}
                    variant={showTemplateLibrary ? "default" : "outline"}
                    size="sm"
                  >
                    📚 {showTemplateLibrary ? 'Ocultar' : 'Ver'} Templates
                  </Button>
                </div>
              </Layout.Card>
            )}
          </div>

          {/* SIDEBAR */}
          <div className="space-y-6">
            <TouchGestureHandler
              enabledGestures={['swipe', 'tap', 'longpress']}
              onGesture={(gesture) => {
                if (gesture.type === 'swipe' && gesture.direction === 'up') {
                  trackAction({ type: 'swipe_up_features', target: 'progressive_disclosure' });
                } else if (gesture.type === 'longpress') {
                  trackAction({ type: 'longpress_advanced_mode', target: 'progressive_disclosure' });
                }
              }}
            >
              <ProgressiveFeatureDisclosure
                userScriptCount={userScriptCount}
                onFeatureToggle={handleFeatureToggle}
                visibleFeatures={visibleFeatures}
                variant="sidebar"
              />
            </TouchGestureHandler>
          </div>
        </Layout.Grid>
      </Layout.Section>

      {/* RESULT SECTION */}
      {script && (
        <Layout.Section spacing="normal" background="neutral">
          <div className="max-w-4xl mx-auto">
            <Layout.Card variant="elevated" padding="lg">
              <div className="flex items-center justify-between mb-6">
                <Layout.Heading level={2}>
                  Seu Roteiro Gerado
                </Layout.Heading>
                <div className="flex space-x-2">
                  <Button
                    onClick={handleCopyScript}
                    variant="outline"
                    size="sm"
                  >
                    📋 Copiar
                  </Button>
                  
                  {(userScriptCount >= 1 || visibleFeatures.includes('voice-synthesis')) && (
                    <Button
                      onClick={handleOpenVoicePanel}
                      variant="outline"
                      size="sm"
                    >
                      🎤 Áudio
                    </Button>
                  )}
                </div>
              </div>
              
              <AdvancedTextEditor
                value={script}
                onChange={handleScriptChange}
                projectId={currentProjectId}
                className="min-h-[400px]"
              />
            </Layout.Card>
          </div>
        </Layout.Section>
      )}

      {/* ANALYTICS DASHBOARD */}
      {showAnalytics && (userScriptCount >= 1 || visibleFeatures.includes('analytics')) && (
        <Layout.Section spacing="normal" background="white">
          <div className="max-w-6xl mx-auto">
            <AIInsightsDashboard />
          </div>
        </Layout.Section>
      )}

      {/* COLLABORATION PANEL */}
      {showCollaborationPanel && currentUser && (userScriptCount >= 3 || visibleFeatures.includes('collaboration')) && (
        <Layout.Section spacing="normal" background="neutral">
          <div className="max-w-4xl mx-auto">
            <CollaborationPanel
              projectId={currentProjectId}
              initialScript={script}
              onScriptChange={handleScriptChange}
            />
          </div>
        </Layout.Section>
      )}

      {/* VOICE SYNTHESIS PANEL */}
      {showVoicePanel && script && (
        <VoiceSynthesisPanel
          script={script}
          onClose={() => setShowVoicePanel(false)}
          projectId={currentProjectId}
        />
      )}

      {/* PWA COMPONENTS */}
      <PWAInstall />
      <PWAFeedback />
    </Layout.Page>
  );
};

export default GeneratorPage;