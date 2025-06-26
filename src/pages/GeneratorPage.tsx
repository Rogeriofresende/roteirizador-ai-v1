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

const GeneratorPage: React.FC = () => {
  const [script, setScript] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const checkConfig = () => {
      const configured = geminiService.isConfigured();
      setIsConfigured(configured);
      
      if (configured) {
        // Track successful configuration
        analyticsService.trackUserAction('generator_ready', {
          timestamp: Date.now()
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
  }, []);

  const handleGenerate = useCallback(async (formData: FormData) => {
    if (!isConfigured) {
      alert('Configure sua API key do Gemini primeiro!');
      return;
    }

    setIsGenerating(true);
    setScript('');
    
    try {
      // Track generation start
      analyticsService.trackConversionFunnel('generation_started', formData);
      
      const generatedScript = await geminiService.generateScript({
        subject: formData.subject,
        platform: formData.platform,
        duration: formData.duration,
        tone: formData.tone,
        audience: formData.audience,
        objective: formData.objective
      });
      
      setScript(generatedScript);
      
      // Track successful generation
      analyticsService.trackConversionFunnel('generation_completed', {
        ...formData,
        script_length: generatedScript.length
      });
      
    } catch (error: any) {
      console.error('Erro ao gerar roteiro:', error);
      
      // Track generation error
      analyticsService.trackError('Script Generation Failed', {
        error: error.message,
        platform: formData.platform,
        subject: formData.subject
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
      setIsGenerating(false);
    }
  }, [isConfigured]);

  const handleScriptChange = useCallback((newScript: string) => {
    setScript(newScript);
  }, []);

  // Se API não está configurada, mostrar interface de configuração profissional
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
            {/* Title */}
            <h1 className="relative z-10 inline-block animate-appear bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-4xl font-semibold leading-tight text-transparent drop-shadow-2xl sm:text-6xl sm:leading-tight">
              RoteiroPro - Gerador IA
            </h1>

            {/* Description */}
            <p className="text-md relative z-10 max-w-[550px] animate-appear font-medium text-muted-foreground opacity-0 delay-100 sm:text-xl">
              Transforme suas ideias em roteiros profissionais
            </p>

            {/* Main Content Grid */}
            <div className="relative z-10 w-full grid lg:grid-cols-2 gap-8 max-w-7xl animate-appear opacity-0 delay-300">
              {/* Formulário */}
              <div className="space-y-6">
                <Card className="p-6">
                  <h2 className="text-2xl font-semibold mb-6 text-foreground">
                    Configurações do Roteiro
                  </h2>
                  <ScriptForm 
                    onSubmit={handleGenerate} 
                    isLoading={isGenerating}
                  />
                </Card>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <PWAInstall />
                  <PWAFeedback />
                </div>
              </div>

              {/* Área do Roteiro */}
              <div className="space-y-6">
                <Card className="p-6 h-fit">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-foreground">
                      Seu Roteiro
                    </h2>
                    {script && (
                      <ShareButton 
                        shareData={{
                          title: 'Roteiro criado com RoteiroPro',
                          text: 'Confira este roteiro criado com IA:',
                          content: script,
                          url: window.location.href
                        }}
                        className="ml-auto"
                        size="sm"
                      />
                    )}
                  </div>

                  <Separator className="mb-6" />
                  
                  {isGenerating ? (
                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                      <p className="text-lg">Gerando seu roteiro com IA...</p>
                      <p className="text-sm mt-2">Isso pode levar alguns segundos...</p>
                    </div>
                  ) : script ? (
                    <div className="space-y-4">
                      <textarea
                        ref={textareaRef}
                        value={script}
                        onChange={(e) => handleScriptChange(e.target.value)}
                        className="w-full h-96 p-4 border border-border rounded-lg resize-y focus:ring-2 focus:ring-primary dark:bg-background dark:text-foreground"
                        placeholder="Seu roteiro aparecerá aqui..."
                      />
                      <div className="flex justify-end">
                        <Button
                          onClick={() => navigator.clipboard.writeText(script)}
                          variant="outline"
                        >
                          📋 Copiar Roteiro
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                      <div className="text-6xl mb-4">📝</div>
                      <p className="text-lg text-center">
                        Preencha o formulário e clique em "Gerar Roteiro" para começar!
                      </p>
                      <p className="text-sm text-center mt-2">
                        Sua IA está pronta para criar roteiros profissionais
                      </p>
                    </div>
                  )}
                </Card>
              </div>
            </div>

            {/* Glow Effect */}
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