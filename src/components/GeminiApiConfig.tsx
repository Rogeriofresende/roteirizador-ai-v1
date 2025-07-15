/**
 * 🔧 GEMINI API CONFIGURATION COMPONENT - V7.5 Enhanced
 * Componente profissional para configuração segura da API Gemini - Professional Interface
 */

import React, { useState, useEffect, useCallback } from 'react';
import { geminiService } from '../services/geminiService';
import { analyticsService } from '../services/analyticsService';

// Design System Imports - Using Available Components
import { Layout } from '../design-system/components/Layout';
import { Card } from '../design-system/components/Card';
import { Button } from '../design-system/components/Button';

// UI Components (maintaining existing for complex forms)
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Alert } from './ui/Alert';
import { Badge } from './ui/Badge';
import { ExternalLink, Key, CheckCircle, AlertCircle, Globe, Shield, RefreshCw } from 'lucide-react';

// Simple loading spinner component
const LoadingSpinner: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`animate-spin rounded-full h-4 w-4 border-b-2 border-current ${className}`} />
);

interface ConfigurationStatus {
  isConfigured: boolean;
  isValid: boolean;
  isConnected: boolean;
  lastTested: Date | null;
  errorMessage?: string;
}

interface ConfigurationStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed' | 'error';
  action?: () => void;
}

export const GeminiApiConfig: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [status, setStatus] = useState<ConfigurationStatus>({
    isConfigured: false,
    isValid: false,
    isConnected: false,
    lastTested: null
  });
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [configSteps, setConfigSteps] = useState<ConfigurationStep[]>([]);

  // Define all callback functions with proper dependencies
  const initializeConfigSteps = useCallback(() => {
    const steps: ConfigurationStep[] = [
      {
        id: 'get-api-key',
        title: 'Obter API Key',
        description: 'Criar API key no Google AI Studio',
        status: 'pending'
      },
      {
        id: 'configure-key',
        title: 'Configurar Chave',
        description: 'Inserir API key no sistema',
        status: 'pending'
      },
      {
        id: 'test-connection',
        title: 'Testar Conexão',
        description: 'Validar conectividade com API',
        status: 'pending'
      },
      {
        id: 'ready',
        title: 'Sistema Pronto',
        description: 'Configuração completa e funcional',
        status: 'pending'
      }
    ];

    setConfigSteps(steps);
  }, []);
  
  const updateConfigSteps = useCallback((stepIds: string[], status: ConfigurationStep['status']) => {
    setConfigSteps(prev => 
      prev.map(step => 
        stepIds.includes(step.id) ? { ...step, status } : step
      )
    );
  }, []);

  const trackComponentMount = useCallback(() => {
    analyticsService.trackFeatureUsage('gemini_config_opened', {
      already_configured: geminiService.isConfigured(),
      timestamp: new Date().toISOString()
    });
  }, []);

  const testConnection = useCallback(async () => {
    setIsTestingConnection(true);

    try {
      const isConnected = await geminiService.testConnection();
      
      setStatus(prev => ({
        ...prev,
        isConnected,
        lastTested: new Date(),
        errorMessage: isConnected ? undefined : 'Falha na conexão com API'
      }));

      if (isConnected) {
        updateConfigSteps(['test-connection', 'ready'], 'completed');
      } else {
        updateConfigSteps(['test-connection'], 'error');
      }

      // Track resultado do teste
      analyticsService.trackUserAction('connection_test_completed', {
        success: isConnected,
        timestamp: new Date().toISOString()
      });

    } catch (error: unknown) {
      console.error('Erro ao testar conexão:', error);
      
      setStatus(prev => ({
        ...prev,
        isConnected: false,
        lastTested: new Date(),
        errorMessage: error instanceof Error ? error.message : 'Erro de conectividade'
      }));

      updateConfigSteps(['test-connection'], 'error');

      // Track erro
      analyticsService.trackError('Connection Test Failed', {
        error_message: error instanceof Error ? error.message : 'Erro desconhecido'
      });

    } finally {
      setIsTestingConnection(false);
    }
  }, [updateConfigSteps]);

  const initializeStatus = useCallback(async () => {
    const isConfigured = geminiService.isConfigured();
    
    setApiKey(isConfigured ? '••••••••••••••••••••••••••••••••••••••••' : '');
    setStatus(prev => ({
      ...prev,
      isConfigured,
      isValid: isConfigured
    }));

    if (isConfigured) {
      await testConnection();
    }
  }, [testConnection]);

  // Now initialize component after all functions are defined
  useEffect(() => {
    const initializeComponent = async () => {
      await initializeStatus();
      initializeConfigSteps();
      trackComponentMount();
    };
    
    initializeComponent();
  }, [initializeConfigSteps, initializeStatus, trackComponentMount]);

  const validateApiKey = (key: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!key || key.trim().length === 0) {
      errors.push('API key é obrigatória');
    }

    if (key.length < 20) {
      errors.push('API key muito curta (mínimo 20 caracteres)');
    }

    if (!key.startsWith('AIza')) {
      errors.push('API key deve começar com "AIza"');
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(key)) {
      errors.push('API key contém caracteres inválidos');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validar formato da API key
      const validation = validateApiKey(apiKey);
      if (!validation.valid) {
        throw new Error(validation.errors.join('. '));
      }

      // Track tentativa de configuração
      analyticsService.trackUserAction('api_key_configuration_attempt');

      // Configurar API key
      const success = geminiService.setAPIKey(apiKey);
      
      if (!success) {
        throw new Error('Falha ao configurar API key');
      }

      // Atualizar status
      setStatus(prev => ({
        ...prev,
        isConfigured: true,
        isValid: true,
        errorMessage: undefined
      }));

      // Atualizar steps
      updateConfigSteps(['get-api-key', 'configure-key'], 'completed');

      // Testar conexão automaticamente
      await testConnection();

      // Track sucesso
      analyticsService.trackUserAction('api_key_configured_successfully');

    } catch (error: unknown) {
      console.error('Erro ao configurar API key:', error);
      
      setStatus(prev => ({
        ...prev,
        isConfigured: false,
        isValid: false,
        errorMessage: error instanceof Error ? error.message : 'Erro desconhecido'
      }));

      // Track erro
      analyticsService.trackError('API Key Configuration Failed', {
        error_message: error instanceof Error ? error.message : 'Erro desconhecido',
        api_key_length: apiKey.length
      });

    } finally {
      setIsLoading(false);
    }
  };

  const removeApiKey = () => {
    geminiService.removeAPIKey();
    setApiKey('');
    setStatus({
      isConfigured: false,
      isValid: false,
      isConnected: false,
      lastTested: null
    });
    
    initializeConfigSteps();

    // Track remoção
    analyticsService.trackUserAction('api_key_removed');
  };

  const getStatusIcon = (stepStatus: ConfigurationStep['status']) => {
    switch (stepStatus) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />;
    }
  };

  const formatLastTested = (date: Date | null) => {
    if (!date) return 'Nunca testado';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `${diffMins} min atrás`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h atrás`;
    
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <Layout.Page variant="dashboard" className="max-w-6xl mx-auto">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Key className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              Configuração API Gemini
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Configure sua API key do Google Gemini para ativar a geração inteligente de roteiros com IA.
            Sistema profissional com validação, testes automáticos e monitoramento de segurança.
          </p>
        </div>

        {/* Status Overview Card */}
        <Card variant="elevated" className="border-2">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Status da Configuração</h2>
              <div className="flex space-x-3">
                <Badge variant={status.isConfigured ? 'success' : 'secondary'}>
                  {status.isConfigured ? 'Configurado' : 'Não Configurado'}
                </Badge>
                <Badge variant={status.isConnected ? 'success' : 'destructive'}>
                  {status.isConnected ? 'Conectado' : 'Desconectado'}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="flex items-center space-x-4">
                <Shield className={`w-8 h-8 ${status.isValid ? 'text-green-500' : 'text-gray-400'}`} />
                <div>
                  <p className="text-lg font-medium text-gray-900">API Key</p>
                  <p className="text-sm text-gray-600">
                    {status.isValid ? 'Válida e segura' : 'Não configurada'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Globe className={`w-8 h-8 ${status.isConnected ? 'text-green-500' : 'text-gray-400'}`} />
                <div>
                  <p className="text-lg font-medium text-gray-900">Conectividade</p>
                  <p className="text-sm text-gray-600">
                    {status.isConnected ? 'Online e funcional' : 'Offline ou com erro'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <RefreshCw className="w-8 h-8 text-gray-400" />
                <div>
                  <p className="text-lg font-medium text-gray-900">Último Teste</p>
                  <p className="text-sm text-gray-600">
                    {formatLastTested(status.lastTested)}
                  </p>
                </div>
              </div>
            </div>

            {status.errorMessage && (
              <Alert variant="destructive" className="border-2">
                <AlertCircle className="w-5 h-5" />
                <div>
                  <p className="font-medium">Erro de Configuração</p>
                  <p className="text-sm">{status.errorMessage}</p>
                </div>
              </Alert>
            )}
          </div>
        </Card>

        {/* Configuration Progress Card */}
        <Card variant="outlined" className="hover:shadow-lg transition-shadow">
          <div className="p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Progresso da Configuração</h2>
            <div className="space-y-6">
              {configSteps.map((step, index) => (
                <div key={step.id} className="flex items-center space-x-6 p-4 rounded-lg bg-gray-50">
                  <div className="flex-shrink-0">
                    {getStatusIcon(step.status)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{step.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                  </div>
                  <div className="text-sm font-medium text-gray-500 bg-white px-3 py-1 rounded-full">
                    {index + 1}/{configSteps.length}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Configuration Form */}
        {!status.isConfigured && (
          <Card variant="elevated" className="border-2">
            <div className="p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Configurar API Key</h2>
              
              {/* Instructions */}
              <Alert className="mb-8 border-2">
                <Key className="w-5 h-5" />
                <div>
                  <p className="font-medium text-lg">Como obter sua API Key</p>
                  <ol className="text-sm mt-4 space-y-2 list-decimal list-inside">
                    <li>Acesse <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center font-medium">Google AI Studio <ExternalLink className="w-3 h-3 ml-1" /></a></li>
                    <li>Faça login com sua conta Google</li>
                    <li>Clique em "Get API Key" → "Create API Key"</li>
                    <li>Copie a chave gerada e cole no campo abaixo</li>
                  </ol>
                </div>
              </Alert>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="apiKey" className="text-lg font-medium">API Key do Gemini</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIza... (cole sua API key aqui)"
                    className="font-mono text-lg p-4 mt-2"
                    disabled={isLoading}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Sua API key será armazenada localmente e criptografada para máxima segurança
                  </p>
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading || !apiKey.trim()}
                  variant="primary"
                  size="large"
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner className="w-5 h-5 mr-3" />
                      Configurando API Key...
                    </>
                  ) : (
                    <>
                      <Key className="w-5 h-5 mr-3" />
                      Configurar API Key
                    </>
                  )}
                </Button>
              </form>
            </div>
          </Card>
        )}

        {/* Configured Management Actions */}
        {status.isConfigured && (
          <Card variant="elevated" className="border-2">
            <div className="p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Gerenciar Configuração</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  onClick={testConnection}
                  disabled={isTestingConnection}
                  variant="secondary"
                  size="large"
                  className="w-full"
                >
                  {isTestingConnection ? (
                    <>
                      <LoadingSpinner className="w-5 h-5 mr-3" />
                      Testando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-5 h-5 mr-3" />
                      Testar Conexão
                    </>
                  )}
                </Button>

                <Button 
                  onClick={removeApiKey}
                  variant="danger"
                  size="large"
                  className="w-full"
                >
                  <AlertCircle className="w-5 h-5 mr-3" />
                  Remover API Key
                </Button>

                <Button 
                  onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  variant="ghost"
                  size="large"
                  className="w-full"
                >
                  Opções Avançadas
                </Button>
              </div>

              {/* Advanced Options */}
              {showAdvancedOptions && (
                <Card variant="subtle" className="mt-8 bg-gray-50 border-gray-200">
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Configurações Avançadas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <p className="font-medium text-gray-900">Modelo Utilizado</p>
                        <p className="text-gray-600">gemini-1.5-flash-latest</p>
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium text-gray-900">Limite de Tokens</p>
                        <p className="text-gray-600">~3,000 tokens por roteiro</p>
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium text-gray-900">Cache Local</p>
                        <p className="text-gray-600">API key em localStorage</p>
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium text-gray-900">Última Sincronização</p>
                        <p className="text-gray-600">{formatLastTested(status.lastTested)}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </Card>
        )}

        {/* Security & Privacy Information */}
        <Card variant="subtle" className="bg-blue-50 border-blue-200">
          <div className="p-8">
            <div className="flex items-start space-x-4">
              <Shield className="w-8 h-8 text-blue-600 mt-1" />
              <div>
                <h3 className="text-xl font-medium text-blue-900 mb-3">Segurança & Privacidade</h3>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 text-blue-600" />
                    <span>API key armazenada apenas no seu navegador (localStorage)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 text-blue-600" />
                    <span>Comunicação direta com Google AI (sem intermediários)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 text-blue-600" />
                    <span>Dados não são compartilhados com terceiros</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 text-blue-600" />
                    <span>Remova a chave a qualquer momento com um clique</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Layout.Page>
  );
}; 