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

  // V5.1: Track user interactions for learning
  useEffect(() => {
    trackAction('navigation', 'generator_page', { 
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      screenSize: `${window.innerWidth}x${window.innerHeight}`
    });

    // V5.1: Record pattern for intelligence system
    v51Intelligence.recordPattern(
      'session_' + Date.now(),
      ['navigation:homepage', 'navigation:generator_page'],
      'success',
      { entryPoint: 'direct_access' }
    );
  }, []);

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
        trackAction('configuration', 'api_ready', { timestamp: Date.now() });
        analyticsService.trackEvent('generator_ready', {
          timestamp: Date.now(),
          sessionStats: getSessionStats(),
          context: 'generator_ready'
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
  }, [trackAction, getSessionStats]);

  // V5.1: Enhanced generate handler with predictive intelligence
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
      sessionStats: getSessionStats()
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
        context: 'generation_started'
      });
      
      // V5.1: Multi-AI Support - Route to selected AI service
      // TODO (IA B): Integrate ChatGPT service when available
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
      
      // V5.1: Record successful pattern for learning
      v51Intelligence.recordPattern(
        'session_' + Date.now(),
        ['click:generate_script', 'data:script_generated'],
        'success',
        { 
          scriptLength: generatedScript.length,
          platform: formData.platform,
          subject: formData.subject.substring(0, 50) // Truncate for privacy
        }
      );
      
      // Track successful generation with V5.1 context
      analyticsService.trackEvent('generation_completed', {
        ...formData,
        script_length: generatedScript.length,
        sessionStats: getSessionStats(),
        context: 'generation_completed'
      });
      
    } catch (error: unknown) {
      console.error('Erro ao gerar roteiro:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(`Falha ao gerar roteiro: ${errorMessage}`);
    } finally {
      stopLoading();
    }
  }, [isConfigured, trackAction, getMostLikelyNext, getSessionStats, startLoading, stopLoading]);

  // V5.1: Enhanced script change handler with tracking
  const handleScriptChange = useCallback((newScript: string) => {
    setScript(newScript);
    trackAction('input', 'script_edit', { 
      length: newScript.length,
      action: 'manual_edit'
    });
  }, [trackAction]);

  // V5.1: Enhanced copy handler with predictive context
  const handleCopyScript = useCallback(() => {
    navigator.clipboard.writeText(script);
    trackAction('click', 'copy_script', { 
      scriptLength: script.length,
      nextPrediction: getMostLikelyNext()
    });
    
    // V5.1: Record copy pattern for learning
    v51Intelligence.recordPattern(
      'session_' + Date.now(),
      ['data:script_generated', 'click:copy_script'],
      'success',
      { scriptLength: script.length }
    );
  }, [script, trackAction, getMostLikelyNext]);

  // STEP 3: Voice synthesis handler
  const handleOpenVoicePanel = useCallback(() => {
    setShowVoicePanel(true);
    trackAction('click', 'open_voice_panel', {
      scriptLength: script.length,
      hasScript: script.length > 0
    });
  }, [script.length, trackAction]);

  // STEP 4: Analytics dashboard handler
  const handleToggleAnalytics = useCallback(() => {
    setShowAnalytics(!showAnalytics);
    trackAction('click', showAnalytics ? 'close_analytics' : 'open_analytics', {
      currentView: showAnalytics ? 'visible' : 'hidden',
      sessionStats: getSessionStats()
    });
  }, [showAnalytics, trackAction, getSessionStats]);

  // STEP 5: Collaboration handlers - Week 8 Implementation
  const handleToggleCollaboration = useCallback(() => {
    setShowCollaborationPanel(!showCollaborationPanel);
    trackAction('click', showCollaborationPanel ? 'close_collaboration' : 'open_collaboration', {
      projectId: currentProjectId
    });
  }, [showCollaborationPanel, trackAction, currentProjectId]);

  const handleShareCollaboration = useCallback((shareLink: string) => {
    trackAction('collaboration', 'share_link_generated', {
      projectId: currentProjectId,
      shareLink
    });
    console.log('🔗 Collaboration link generated:', shareLink);
  }, [trackAction, currentProjectId]);

  // STEP 6: Template library handlers
  const handleToggleTemplates = useCallback(() => {
    setShowTemplateLibrary(!showTemplateLibrary);
    trackAction('click', showTemplateLibrary ? 'close_templates' : 'open_templates', {
      featuredCount: featuredTemplates.length
    });
  }, [showTemplateLibrary, featuredTemplates.length, trackAction]);

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
        scriptLength: newScript.content.length
      });

    } catch (error) {
      console.error('Erro ao usar template:', error);
      alert('Erro ao aplicar template: ' + (error as Error).message);
    }
  }, [currentUser, trackAction]);

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

            {/* V5.1 Enhanced Main Content Grid */}
            <div className="relative z-10 w-full grid lg:grid-cols-2 gap-8 max-w-7xl animate-appear opacity-0 delay-300">
              {/* V5.1 Enhanced Form Section */}
              <div className="space-y-6">
                {/* V5.1: Multi-AI Selector */}
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
                          newAI: 'gemini' 
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
                          newAI: 'chatgpt' 
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

                {/* STEP 4: Analytics Toggle Button */}
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

                {/* STEP 5: Collaboration Controls - Week 8 Implementation */}
                {currentUser && currentProjectId && (
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
                      data-track-id="template_library_toggle"
                    >
                      📝 {showTemplateLibrary ? 'Ocultar' : 'Ver'} Templates
                    </PredictiveButton>
                  </div>
                </PredictiveCard>
              </div>

              {/* V5.1 Enhanced Script Area */}
              <div className="space-y-6">
                <SmartLoadingStates
                  type="generator"
                  context="script_generation"
                  isLoading={isGenerating}
                >
                  <PredictiveCard 
                    className="p-6 h-fit"
                    data-track-id="script_card"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-semibold text-foreground">
                        Seu Roteiro
                      </h2>
                      {script && (
                        <ShareButton 
                          shareData={{
                            title: 'Roteiro criado com Roteirar IA V5.1',
                            text: 'Confira este roteiro criado com IA preditiva:',
                            content: script,
                            url: window.location.href
                          }}
                          className="ml-auto"
                          size="sm"
                        />
                      )}
                    </div>

                    <Separator className="mb-6" />
                    
                    {script ? (
                      <div className="space-y-4">
                        {/* STEP 2: Advanced Text Editor with Enterprise Features */}
                        {currentUser && currentProjectId && (
                          <AdvancedTextEditor
                            projectId={currentProjectId}
                            userId={currentUser.uid}
                            initialContent={script}
                            onContentChange={handleScriptChange}
                            onSelectionChange={(selection) => {
                              if (selection) {
                                trackAction('text_selection', 'editor_selection', {
                                  selectedLength: selection.selectedText.length,
                                  selectionStart: selection.startIndex,
                                  selectionEnd: selection.endIndex
                                });
                              }
                            }}
                            config={{
                              preferences: {
                                autoSave: true,
                                autoSaveInterval: 30,
                                aiSuggestionsEnabled: true,
                                showVersionHistory: true,
                                highlightChanges: true
                              }
                            }}
                            callbacks={{
                              onAIRequest: (request) => {
                                trackAction('ai_refinement', 'refinement_requested', {
                                  type: request.refinementType,
                                  textLength: request.selectedText.length
                                });
                              },
                              onVersionRestore: (version) => {
                                trackAction('version_restore', 'version_restored', {
                                  versionNumber: version.versionNumber,
                                  timestamp: version.timestamp
                                });
                              }
                            }}
                          />
                        )}
                        
                        {/* Fallback textarea if user not authenticated or no projectId */}
                        {(!currentUser || !currentProjectId) && (
                          <textarea
                            ref={textareaRef}
                            value={script}
                            onChange={(e) => handleScriptChange(e.target.value)}
                            className="w-full h-96 p-4 border border-border rounded-lg resize-y focus:ring-2 focus:ring-primary dark:bg-background dark:text-foreground transition-all duration-200"
                            placeholder="Seu roteiro aparecerá aqui..."
                            onFocus={() => trackAction('focus', 'script_textarea')}
                          />
                        )}
                        
                        <div className="flex flex-col sm:flex-row gap-3">
                          {/* V5.1: Enhanced Voice Synthesis Button */}
                          <PredictiveButton
                            onClick={handleOpenVoicePanel}
                            variant="default"
                            className={cn(
                              "flex items-center gap-2 flex-1 sm:flex-none",
                              "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700",
                              "text-white shadow-lg hover:shadow-xl transition-all"
                            )}
                            data-track-id="voice_button"
                            disabled={!script || script.length === 0}
                          >
                            <span className="text-xl">🎙️</span>
                            <span className="font-medium">Gerar Narração</span>
                            <span className="hidden sm:inline text-xs bg-white/20 px-2 py-0.5 rounded-full">
                              25+ vozes
                            </span>
                          </PredictiveButton>
                          
                          {/* Copy Button */}
                          <PredictiveButton
                            onClick={handleCopyScript}
                            variant="outline"
                            className="flex items-center gap-2"
                            data-track-id="copy_button"
                          >
                            <span>📋</span>
                            <span>Copiar Roteiro</span>
                          </PredictiveButton>
                        </div>
                        
                        {/* V5.1: Voice Synthesis Hint */}
                        {script && script.length > 50 && !showVoicePanel && (
                          <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                            <p className="text-sm text-purple-700 dark:text-purple-300 flex items-center gap-2">
                              <span>💡</span>
                              <span>
                                Novo! Transforme seu roteiro em áudio profissional com narração realista
                              </span>
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                        <div className="text-6xl mb-4">🤖</div>
                        <p className="text-lg text-center">
                          Preencha o formulário e clique em "Gerar Roteiro" para começar!
                        </p>
                        <p className="text-sm text-center mt-2">
                          Sua IA V5.1 está pronta para criar roteiros profissionais
                        </p>
                      </div>
                    )}
                  </PredictiveCard>
                </SmartLoadingStates>
              </div>
            </div>

            {/* V5.1: Voice Synthesis Panel - Now accessible to all users */}
            {script && showVoicePanel && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <VoiceSynthesisPanel
                  projectId={currentProjectId || `temp_${Date.now()}`}
                  userId={currentUser?.uid || 'anonymous'}
                  text={script}
                  isVisible={showVoicePanel}
                  onClose={() => {
                    setShowVoicePanel(false);
                    trackAction('click', 'close_voice_panel', {
                      sessionTime: Date.now(),
                      wasAuthenticated: !!currentUser
                    });
                  }}
                />
              </div>
            )}

            {/* STEP 4: Advanced Analytics Dashboard - Enterprise Feature */}
            {showAnalytics && (
              <div className="w-full max-w-7xl animate-appear opacity-100 mt-8">
                <PredictiveCard className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-foreground">
                      Analytics & Insights
                    </h2>
                    <PredictiveButton
                      onClick={handleToggleAnalytics}
                      variant="outline"
                      size="sm"
                    >
                      ✖️ Fechar
                    </PredictiveButton>
                  </div>
                  <AIInsightsDashboard 
                    showUserSegments={true}
                    maxInsights={10}
                  />
                </PredictiveCard>
              </div>
            )}

            {/* STEP 5: Collaboration Panel - Week 8 Implementation */}
            <CollaborationPanel
              projectId={currentProjectId}
              isVisible={showCollaborationPanel}
              onClose={handleToggleCollaboration}
              currentUserId={currentUser?.uid || ''}
            />

            {/* STEP 6: Template Library Panel - Enterprise Feature */}
            {showTemplateLibrary && (
              <div className="w-full max-w-7xl animate-appear opacity-100 mt-8">
                <PredictiveCard className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-foreground">
                      Biblioteca de Templates
                    </h2>
                    <PredictiveButton
                      onClick={handleToggleTemplates}
                      variant="outline"
                      size="sm"
                    >
                      ✖️ Fechar
                    </PredictiveButton>
                  </div>
                  
                  {featuredTemplates.length > 0 ? (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-4">Templates em Destaque</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {featuredTemplates.map((template) => (
                            <div key={template.id} className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
                              <div className="space-y-3">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="font-medium text-foreground">{template.title}</h4>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                      {template.description}
                                    </p>
                                  </div>
                                  <span className="text-lg">{TemplateService.getCategories().find(c => c.id === template.category)?.icon || '📝'}</span>
                                </div>
                                
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                  <span className="capitalize">{template.category}</span>
                                  <div className="flex items-center space-x-2">
                                    <span>⭐ {template.rating || 0}</span>
                                    <span>👁️ {template.usage || 0}</span>
                                  </div>
                                </div>
                                
                                <div className="flex space-x-2">
                                  <PredictiveButton
                                    onClick={() => handleUseTemplate(template)}
                                    size="sm"
                                    className="flex-1"
                                    data-track-id="use_template"
                                  >
                                    📄 Usar Template
                                  </PredictiveButton>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="text-center py-4 border-t border-border">
                        <p className="text-sm text-muted-foreground">
                          💡 Dica: Os templates usam placeholders que são automaticamente preenchidos com valores padrão
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">📝</div>
                      <h3 className="text-lg font-medium mb-2">Carregando Templates...</h3>
                      <p className="text-muted-foreground">
                        A biblioteca de templates está sendo preparada
                      </p>
                    </div>
                  )}
                </PredictiveCard>
              </div>
            )}

            {/* V5.1 Enhanced Glow Effect */}
            <div className="relative">
              <Glow
                variant="center"
                className="animate-appear-zoom opacity-0 delay-1000"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default GeneratorPage;