/**
 * 🎨 GENERATOR PAGE - V7.5 Enhanced Professional Interface
 * Página de geração de script otimizada seguindo metodologia V7.5 Enhanced
 * Following methodology specs from MAPEAMENTO_VISUAL_TELAS_FLUXOS.md
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { geminiService } from '../../../services/geminiService';
import { analyticsService } from '../../../services/analyticsService';
import type { FormData } from '../types';

// V7.5 Enhanced Design System Imports
import { Layout } from '../../../design-system/components/Layout';
import { Button } from '../../../design-system/components/Button';
import { Card } from '../../../design-system/components/Card';

// Core Components (simplified imports)
import Navbar from '../components/Navbar';
import ScriptForm from '../components/ScriptForm';
import { GeminiApiConfig } from '../../../components/GeminiApiConfig';
import ShareButton from '../components/ShareButton';

// Advanced Features (conditional imports)
import { AdvancedTextEditor } from '../components/editor/AdvancedTextEditor';
import { VoiceSynthesisPanel } from '../components/editor/VoiceSynthesisPanel';

// V7.5 Enhanced Icons
import { 
  Lightbulb, 
  Wand2, 
  FileText, 
  Copy, 
  Mic, 
  Sparkles,
  Settings,
  Users,
  BarChart3,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

const GeneratorPage: React.FC = () => {
  const { currentUser } = useAuth();
  
  // Core State - V7.5 Enhanced
  const [script, setScript] = useState<string>('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Advanced Features State - Simplified
  const [currentProjectId, setCurrentProjectId] = useState<string>('');
  const [showVoicePanel, setShowVoicePanel] = useState(false);
  const [selectedAI, setSelectedAI] = useState<'gemini' | 'chatgpt'>('gemini');

  // V7.5 Enhanced Project ID initialization
  useEffect(() => {
    if (!currentProjectId) {
      const projectId = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setCurrentProjectId(projectId);
    }
  }, [currentProjectId]);

  // V7.5 Enhanced Configuration Check
  useEffect(() => {
    const checkConfig = () => {
      const configured = geminiService.isConfigured();
      setIsConfigured(configured);
      
      if (configured) {
        analyticsService.trackEvent('generator_ready', {
          timestamp: Date.now(),
          context: 'generator_ready'
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
  }, []);

  // V7.5 Enhanced Generate Handler
  const handleGenerate = useCallback(async (formData: FormData) => {
    if (!isConfigured) {
      alert('Configure sua API key do Gemini primeiro!');
      return;
    }

    setIsGenerating(true);
    setScript('');
    setError(null);
    
    try {
      analyticsService.trackEvent('generation_started', {
        ...formData,
        selectedAI,
        context: 'generation_started'
      });
      
      const generatedScript = await geminiService.generateScript({
        subject: formData.subject,
        platform: formData.platform,
        duration: formData.duration,
        tone: formData.tone,
        audience: formData.audience,
        objective: formData.objective
      });
      
      setScript(generatedScript);
      
      analyticsService.trackEvent('generation_completed', {
        ...formData,
        script_length: generatedScript.length,
        context: 'generation_completed'
      });
      
    } catch (error: unknown) {
      console.error('Erro ao gerar roteiro:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(`Falha ao gerar roteiro: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  }, [isConfigured, selectedAI]);

  // V7.5 Enhanced Script Change Handler
  const handleScriptChange = useCallback((newScript: string) => {
    setScript(newScript);
    analyticsService.trackEvent('script_edit', { 
      length: newScript.length,
      action: 'manual_edit'
    });
  }, []);

  // V7.5 Enhanced Copy Handler
  const handleCopyScript = useCallback(() => {
    navigator.clipboard.writeText(script);
    analyticsService.trackEvent('copy_script', { 
      scriptLength: script.length
    });
  }, [script]);

  // V7.5 Enhanced Voice Panel Handler
  const handleOpenVoicePanel = useCallback(() => {
    setShowVoicePanel(true);
    analyticsService.trackEvent('open_voice_panel', {
      scriptLength: script.length,
      hasScript: script.length > 0
    });
  }, [script.length]);

  // Configuration Screen - V7.5 Enhanced
  if (!isConfigured) {
    return (
      <>
        <Navbar />
        <Layout.Page variant="minimal" padding="responsive">
          <Layout.Section spacing="comfortable" maxWidth="container">
            <GeminiApiConfig />
          </Layout.Section>
        </Layout.Page>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Layout.Page variant="generator" padding="responsive">
        <Layout.Section spacing="comfortable" maxWidth="container">
          
          {/* V7.5 Enhanced Header */}
          <div className="text-center mb-12">
            <Layout.Heading level={1} className="mb-4 flex items-center justify-center gap-3">
              <Wand2 className="w-8 h-8 text-primary-600" />
              <span>Gerador de Roteiros IA</span>
              <Sparkles className="w-6 h-6 text-warm-500" />
            </Layout.Heading>
            <Layout.Text variant="subtitle" color="muted" className="max-w-2xl mx-auto">
              Transforme suas ideias em roteiros profissionais com inteligência artificial
            </Layout.Text>
          </div>

          {/* V7.5 Enhanced AI Selector */}
          <Layout.Section background="subtle" spacing="comfortable" className="rounded-lg mb-8">
            <Layout.Heading level={3} className="mb-4 text-center">
              🤖 Escolha sua IA
            </Layout.Heading>
            <div className="flex justify-center gap-4 max-w-md mx-auto">
              <Button
                variant={selectedAI === 'gemini' ? 'default' : 'outline'}
                className="flex items-center gap-2 flex-1"
                onClick={() => setSelectedAI('gemini')}
              >
                <span className="text-xl">🧠</span>
                <span>Gemini AI</span>
                {selectedAI === 'gemini' && <CheckCircle2 className="w-4 h-4" />}
              </Button>
              <Button
                variant={selectedAI === 'chatgpt' ? 'default' : 'outline'}
                className="flex items-center gap-2 flex-1"
                onClick={() => setSelectedAI('chatgpt')}
              >
                <span className="text-xl">🤖</span>
                <span>ChatGPT</span>
                {selectedAI === 'chatgpt' && <CheckCircle2 className="w-4 h-4" />}
              </Button>
            </div>
            <Layout.Text variant="bodySmall" color="muted" className="text-center mt-3">
              {selectedAI === 'gemini' 
                ? '⚡ Gemini: Rápido e criativo, ideal para conteúdo viral'
                : '💡 ChatGPT: Detalhado e eloquente, perfeito para roteiros complexos'
              }
            </Layout.Text>
          </Layout.Section>

          {/* V7.5 Enhanced Main Content Grid */}
          <Layout.Grid cols={2} gap="xl" className="items-start">
            
            {/* Form Section - V7.5 Enhanced */}
            <div className="space-y-6">
              <Layout.Card variant="elevated" padding="lg">
                <Layout.Heading level={3} className="mb-6 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary-600" />
                  Configurações do Roteiro
                </Layout.Heading>
                <ScriptForm 
                  onSubmit={handleGenerate} 
                  isLoading={isGenerating}
                />
              </Layout.Card>

              {/* Quick Actions - V7.5 Enhanced */}
              <Layout.Card variant="outlined" padding="md">
                <Layout.Heading level={4} className="mb-4">
                  ⚡ Ações Rápidas
                </Layout.Heading>
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => analyticsService.trackEvent('quick_action', { action: 'analytics' })}
                  >
                    <BarChart3 className="w-4 h-4" />
                    Analytics
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => analyticsService.trackEvent('quick_action', { action: 'collaboration' })}
                  >
                    <Users className="w-4 h-4" />
                    Colaborar
                  </Button>
                </div>
              </Layout.Card>
            </div>

            {/* Script Section - V7.5 Enhanced */}
            <div className="space-y-6">
              <Layout.Card variant="elevated" padding="lg">
                <div className="flex items-center justify-between mb-6">
                  <Layout.Heading level={3} className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary-600" />
                    Seu Roteiro
                  </Layout.Heading>
                  {script && (
                    <ShareButton 
                      shareData={{
                        title: 'Roteiro criado com Roteirar IA V7.5',
                        text: 'Confira este roteiro criado com IA:',
                        content: script,
                        url: window.location.href
                      }}
                      size="sm"
                    />
                  )}
                </div>

                {/* Loading State - V7.5 Enhanced */}
                {isGenerating && (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"></div>
                    <Layout.Text variant="body" color="muted">
                      ✨ Criando seu roteiro personalizado...
                    </Layout.Text>
                    <Layout.Text variant="bodySmall" color="muted">
                      Isso pode levar alguns segundos
                    </Layout.Text>
                  </div>
                )}

                {/* Error State - V7.5 Enhanced */}
                {error && (
                  <div className="p-4 bg-error-50 border border-error-200 rounded-lg">
                    <Layout.Text variant="body" color="error">
                      {error}
                    </Layout.Text>
                  </div>
                )}

                {/* Script Content - V7.5 Enhanced */}
                {script && !isGenerating && (
                  <div className="space-y-4">
                    {/* Advanced Editor or Fallback */}
                    {currentUser && currentProjectId ? (
                      <AdvancedTextEditor
                        projectId={currentProjectId}
                        userId={currentUser.uid}
                        initialContent={script}
                        onContentChange={handleScriptChange}
                        config={{
                          preferences: {
                            autoSave: true,
                            autoSaveInterval: 30,
                            aiSuggestionsEnabled: true,
                            showVersionHistory: true,
                            highlightChanges: true
                          }
                        }}
                      />
                    ) : (
                      <textarea
                        value={script}
                        onChange={(e) => handleScriptChange(e.target.value)}
                        className="w-full h-96 p-4 border border-neutral-300 rounded-lg resize-y focus:ring-2 focus:ring-primary-500 transition-all duration-200"
                        placeholder="Seu roteiro aparecerá aqui..."
                      />
                    )}

                    {/* Action Buttons - V7.5 Enhanced */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={handleOpenVoicePanel}
                        className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                        disabled={!script || script.length === 0}
                      >
                        <Mic className="w-4 h-4" />
                        <span>Gerar Narração</span>
                        <span className="hidden sm:inline text-xs bg-white/20 px-2 py-0.5 rounded-full">
                          25+ vozes
                        </span>
                      </Button>
                      
                      <Button
                        onClick={handleCopyScript}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        <span>Copiar Roteiro</span>
                      </Button>
                    </div>

                    {/* Success Hint - V7.5 Enhanced */}
                    {script && script.length > 50 && !showVoicePanel && (
                      <Layout.Section background="subtle" spacing="tight" className="rounded-lg">
                        <Layout.Text variant="bodySmall" color="muted" className="flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-warm-500" />
                          <span>
                            Novo! Transforme seu roteiro em áudio profissional com narração realista
                          </span>
                        </Layout.Text>
                      </Layout.Section>
                    )}
                  </div>
                )}

                {/* Empty State - V7.5 Enhanced */}
                {!script && !isGenerating && !error && (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                      <Wand2 className="w-8 h-8 text-primary-600" />
                    </div>
                    <Layout.Heading level={4} className="mb-2">
                      Pronto para criar!
                    </Layout.Heading>
                    <Layout.Text variant="body" color="muted" className="mb-4">
                      Preencha o formulário e clique em "Gerar Roteiro" para começar
                    </Layout.Text>
                    <Layout.Text variant="bodySmall" color="muted">
                      Sua IA V7.5 Enhanced está pronta para criar roteiros profissionais
                    </Layout.Text>
                  </div>
                )}
              </Layout.Card>
            </div>
          </Layout.Grid>

          {/* Voice Synthesis Panel - V7.5 Enhanced */}
          {script && showVoicePanel && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <VoiceSynthesisPanel
                projectId={currentProjectId || `temp_${Date.now()}`}
                userId={currentUser?.uid || 'anonymous'}
                text={script}
                isVisible={showVoicePanel}
                onClose={() => {
                  setShowVoicePanel(false);
                  analyticsService.trackEvent('close_voice_panel', {
                    sessionTime: Date.now(),
                    wasAuthenticated: !!currentUser
                  });
                }}
              />
            </div>
          )}

        </Layout.Section>
      </Layout.Page>
    </>
  );
};

export default GeneratorPage;