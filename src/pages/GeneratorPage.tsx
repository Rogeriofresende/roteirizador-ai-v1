import React, { useState, useCallback, useEffect } from 'react';
// import { Header } from '../components/blocks/Header';
import ScriptForm from '../components/ScriptForm';
import EditableScriptArea from '../components/EditableScriptArea';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Button } from "../components/ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/Dialog';
import { Alert, AlertDescription } from '../components/ui/Alert';
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Separator } from "../components/ui/Separator";
import { geminiService } from '../services/geminiService';
// import ShareButton from '../components/ShareButton';
import type { FormData } from '../types';

const GeneratorPage: React.FC = () => {
  const [script, setScript] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    // Aguardar um pouco para o serviço inicializar
    const checkConfig = () => {
      const configured = geminiService.isConfigured();
      setIsConfigured(configured);
      console.log('🔍 Status inicial da configuração:', configured);
    };
    
    // Verificar imediatamente e depois de um delay
    checkConfig();
    setTimeout(checkConfig, 1000);
  }, []);

  const handleApiKeySubmit = async () => {
    if (!apiKey.trim()) {
      setError('Por favor, insira uma API key válida');
      return;
    }

    try {
      const success = await geminiService.setApiKey(apiKey.trim());
      if (success) {
        setIsConfigured(true);
        setShowApiKeyModal(false);
        setApiKey('');
        setError(null);
      } else {
        setError('API key inválida. Verifique se é uma chave válida do Google AI Studio.');
      }
    } catch (error) {
      setError('Erro ao configurar API key. Tente novamente.');
    }
  };

  const handleFormSubmit = useCallback(async (formData: FormData) => {
    console.log('📝 Formulário submetido:', formData);
    
    setIsLoading(true);
    setError(null);
    setScript('');

    try {
      // Verificar se está configurado antes de gerar
      if (!geminiService.isConfigured()) {
        console.log('❌ Serviço não configurado, abrindo modal');
        setShowApiKeyModal(true);
        setIsLoading(false);
        return;
      }

      // Mapear FormData para o formato que o novo serviço espera
      const params = {
        subject: formData.videoTopic || 'Conteúdo para redes sociais',
        platform: formData.platform?.toLowerCase() || 'youtube',
        duration: formData.duration || '60 segundos',
        tone: formData.toneOfVoice || 'informal',
        audience: formData.targetAudience || 'geral',
        objective: formData.videoGoal
      };

      console.log('🚀 Parâmetros para geração:', params);

      const generatedScript = await geminiService.generateScript(params);
      setScript(generatedScript);
      console.log('✅ Script gerado com sucesso!');
    } catch (error: any) {
      console.error('❌ Erro ao gerar roteiro:', error);
      setError(error.message || 'Erro desconhecido ao gerar roteiro');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleScriptUpdate = useCallback((newScript: string) => {
    setScript(newScript);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-500 to-indigo-700">
      {/* <Header /> */}
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              🎬 Gerador de Roteiros IA Pro
            </h1>
            <p className="text-xl text-white/80">
              Crie roteiros profissionais com inteligência artificial real
            </p>
            {isConfigured && (
              <p className="text-sm text-green-200 mt-2">
                ✅ IA configurada e pronta para usar!
              </p>
            )}
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Formulário */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-xl border border-white/20">
              <h2 className="text-2xl font-semibold text-white mb-6">
                📝 Configurações do Roteiro
              </h2>
              
              {!isConfigured && (
                <Alert className="mb-6 bg-yellow-500/20 border-yellow-500/30">
                  <AlertDescription className="text-yellow-100">
                    Configurando IA... Se não funcionar automaticamente, clique abaixo.
                    <Button 
                      onClick={() => setShowApiKeyModal(true)}
                      className="ml-2 bg-yellow-600 hover:bg-yellow-700"
                      size="sm"
                    >
                      Configurar Manualmente
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              <ScriptForm onSubmit={handleFormSubmit} isLoading={isLoading} />
            </div>

            {/* Resultado */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-xl border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-white">
                  📜 Seu Roteiro
                </h2>
                {script && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => navigator.clipboard.writeText(script)}
                      className="bg-green-600 hover:bg-green-700"
                      size="sm"
                    >
                      📋 Copiar
                    </Button>
                    {/* <ShareButton
                      shareData={{
                        title: 'Roteiro criado com Roteirar IA Pro',
                        text: 'Confira este roteiro incrível que criei com IA:',
                        content: script,
                        url: window.location.href,
                      }}
                      variant="outline"
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                    /> */}
                  </div>
                )}
              </div>

              {isLoading && (
                <div className="flex flex-col items-center justify-center h-64 text-white">
                  <LoadingSpinner size="lg" />
                  <p className="mt-4 text-lg">Gerando seu roteiro com IA...</p>
                  <p className="mt-2 text-sm text-white/70">Isso pode levar alguns segundos...</p>
                </div>
              )}

              {error && (
                <Alert className="mb-4 bg-red-500/20 border-red-500/30">
                  <AlertDescription className="text-red-100">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {script && !isLoading && (
                <div className="space-y-4">
                  <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                    <p className="text-green-100 text-sm mb-2">
                      ✅ Roteiro gerado com sucesso!
                    </p>
                    <p className="text-white/80 text-sm">
                      Use as opções avançadas para personalizar ainda mais seu roteiro.
                    </p>
                  </div>
                  
                  <EditableScriptArea
                    script={script}
                    onScriptUpdate={handleScriptUpdate}
                    isLoading={isLoading}
                  />
                </div>
              )}

              {!script && !isLoading && !error && (
                <div className="flex flex-col items-center justify-center h-64 text-white/60">
                  <div className="text-6xl mb-4">📝</div>
                  <p className="text-lg text-center">
                    Preencha o formulário e clique em "Gerar Roteiro" para começar!
                  </p>
                  <p className="text-sm text-center mt-2">
                    Use as opções avançadas para um resultado mais personalizado
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modal de API Key */}
      <Dialog open={showApiKeyModal} onOpenChange={setShowApiKeyModal}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>🔑 Configurar API do Google Gemini</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Como obter sua API Key:</h4>
              <ol className="text-sm text-blue-700 space-y-1">
                <li>1. Acesse <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="underline">aistudio.google.com</a></li>
                <li>2. Clique em "Get API key"</li>
                <li>3. Copie a chave gerada</li>
                <li>4. Cole aqui embaixo</li>
              </ol>
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key do Google Gemini</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="AIza..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleApiKeySubmit()}
              />
            </div>

            {error && (
              <Alert className="bg-red-50 border-red-200">
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end space-x-2">
              <Button
                onClick={() => setShowApiKeyModal(false)}
                variant="outline"
              >
                Cancelar
              </Button>
              <Button onClick={handleApiKeySubmit}>
                Salvar API Key
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GeneratorPage;