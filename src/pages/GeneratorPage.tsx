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
import ShareButton from '../components/ShareButton';
import type { FormData } from '../types';
import { analyticsService } from '../services/analyticsService';
import { cn } from '../lib/utils';

// V5.1 Enhanced Framework imports
import { usePredictiveUX } from '../hooks/usePredictiveUX';
import { SmartLoadingStates, useSmartLoading } from '../components/ui/SmartLoadingStates';
import { PredictiveButton, PredictiveCard } from '../components/ui/AdvancedMicroInteractions';
import { v51Intelligence } from '../services/v51Intelligence';

const GeneratorPage: React.FC = () => {
  const [script, setScript] = useState<string>('');
  const [isConfigured, setIsConfigured] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // V5.1: Predictive UX and Smart Loading
  const { trackAction, getMostLikelyNext, getSessionStats } = usePredictiveUX();
  const { isLoading: isGenerating, startLoading, stopLoading, LoadingWrapper } = useSmartLoading('generator');

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
  }, [trackAction]);

  useEffect(() => {
    const checkConfig = () => {
      const configured = geminiService.isConfigured();
      setIsConfigured(configured);
      
      if (configured) {
        // V5.1: Enhanced tracking with predictive context
        trackAction('configuration', 'api_ready', { timestamp: Date.now() });
        analyticsService.trackUserAction('generator_ready', {
          timestamp: Date.now(),
          sessionStats: getSessionStats()
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
      prediction: getMostLikelyNext(),
      sessionStats: getSessionStats()
    });

    startLoading('script_generation');
    setScript('');
    
    try {
      // V5.1: Enhanced analytics with prediction context
      analyticsService.trackConversionFunnel('generation_started', {
        ...formData,
        predictiveContext: getMostLikelyNext(),
        sessionStats: getSessionStats()
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
      analyticsService.trackConversionFunnel('generation_completed', {
        ...formData,
        script_length: generatedScript.length,
        sessionStats: getSessionStats()
      });
      
    } catch (error: any) {
      console.error('Erro ao gerar roteiro:', error);
      
      // V5.1: Record failed pattern for learning
      v51Intelligence.recordPattern(
        'session_' + Date.now(),
        ['click:generate_script', 'error:generation_failed'],
        'error',
        { 
          errorType: error.message.substring(0, 100),
          platform: formData.platform
        }
      );
      
      // V5.1: Enhanced error tracking
      trackAction('error', 'generation_failed', { 
        error: error.message,
        formData 
      });
      
      analyticsService.trackError('Script Generation Failed', {
        error: error.message,
        platform: formData.platform,
        subject: formData.subject,
        sessionStats: getSessionStats()
      });

      let userMessage = 'Erro ao gerar roteiro. ';
      if (error.message.includes('API key')) {
        userMessage += 'Verifique sua API key do Gemini.';
      } else if (error.message.includes('quota')) {
        userMessage += 'Limite de uso atingido. Tente novamente mais tarde.';
      } else {
        userMessage += 'Tente novamente em alguns minutos.';
      }
      
      alert(userMessage);
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
              </div>

              {/* V5.1 Enhanced Script Area */}
              <div className="space-y-6">
                <LoadingWrapper
                  type="generator"
                  context="script_generation"
                  expectedDuration={8000}
                  onTimeout={() => alert('A geração está demorando mais que o esperado. Verifique sua conexão.')}
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
                        <textarea
                          ref={textareaRef}
                          value={script}
                          onChange={(e) => handleScriptChange(e.target.value)}
                          className="w-full h-96 p-4 border border-border rounded-lg resize-y focus:ring-2 focus:ring-primary dark:bg-background dark:text-foreground transition-all duration-200"
                          placeholder="Seu roteiro aparecerá aqui..."
                          onFocus={() => trackAction('focus', 'script_textarea')}
                        />
                        <div className="flex justify-end">
                          <PredictiveButton
                            onClick={handleCopyScript}
                            variant="outline"
                            data-track-id="copy_button"
                          >
                            📋 Copiar Roteiro
                          </PredictiveButton>
                        </div>
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
                </LoadingWrapper>
              </div>
            </div>

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