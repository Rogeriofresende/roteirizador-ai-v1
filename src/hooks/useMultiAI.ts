/**
 * V6.2 Enhanced Framework - useMultiAI Hook
 * Hook para integração com múltiplas IAs
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { MultiAIService, AIProvider } from '../services/multiAIService';
import { useAuth } from '../contexts/AuthContext';
import { createLogger } from '../utils/logger';

const logger = createLogger('useMultiAI');

interface MultiAIState {
  isGenerating: boolean;
  selectedProvider: AIProvider;
  lastResponse: {
    content: string;
    provider: AIProvider;
    confidence: number;
    tokens: number;
    latency: number;
  } | null;
  error: string | null;
  comparisonResults: Array<{
    provider: AIProvider;
    content: string;
    confidence: number;
  }> | null;
  preferences: {
    preferredProvider: AIProvider;
    autoSelectEnabled: boolean;
    costSensitivity: 'low' | 'medium' | 'high';
  };
}

export const useMultiAI = () => {
  const { user } = useAuth();
  const [state, setState] = useState<MultiAIState>({
    isGenerating: false,
    selectedProvider: 'auto',
    lastResponse: null,
    error: null,
    comparisonResults: null,
    preferences: {
      preferredProvider: 'auto',
      autoSelectEnabled: true,
      costSensitivity: 'medium'
    }
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  // Carregar preferências do usuário
  useEffect(() => {
    if (user?.uid) {
      loadUserPreferences();
    }
  }, [user?.uid]);

  const loadUserPreferences = async () => {
    if (!user?.uid) return;

    try {
      const prefs = await MultiAIService.getUserPreferences(user.uid);
      setState(prev => ({
        ...prev,
        selectedProvider: prefs.preferredProvider,
        preferences: {
          preferredProvider: prefs.preferredProvider,
          autoSelectEnabled: prefs.autoSelectEnabled,
          costSensitivity: prefs.costSensitivity
        }
      }));
    } catch (error) {
      logger.error('Erro ao carregar preferências', error);
    }
  };

  // Gerar conteúdo com IA selecionada
  const generateContent = useCallback(async (
    prompt: string,
    options: {
      provider?: AIProvider;
      maxTokens?: number;
      temperature?: number;
      systemPrompt?: string;
      streamResponse?: boolean;
    } = {}
  ) => {
    if (!user?.uid) {
      setState(prev => ({ ...prev, error: 'Usuário não autenticado' }));
      return null;
    }

    // Cancelar requisição anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setState(prev => ({
      ...prev,
      isGenerating: true,
      error: null,
      comparisonResults: null
    }));

    try {
      const response = await MultiAIService.generateContent(
        user.uid,
        prompt,
        {
          ...options,
          provider: options.provider || state.selectedProvider
        }
      );

      setState(prev => ({
        ...prev,
        isGenerating: false,
        lastResponse: {
          content: response.content,
          provider: response.provider,
          confidence: response.confidence,
          tokens: response.tokens,
          latency: response.latency
        }
      }));

      logger.info('Conteúdo gerado com sucesso', {
        provider: response.provider,
        tokens: response.tokens,
        latency: response.latency
      });

      return response;

    } catch (error: any) {
      if (error.name === 'AbortError') {
        logger.info('Geração cancelada pelo usuário');
        return null;
      }

      const errorMessage = error.message || 'Erro ao gerar conteúdo';
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: errorMessage
      }));

      logger.error('Erro ao gerar conteúdo', error);
      return null;
    }
  }, [user?.uid, state.selectedProvider]);

  // Comparar respostas de diferentes IAs
  const compareProviders = useCallback(async (
    prompt: string,
    options: {
      maxTokens?: number;
      temperature?: number;
      systemPrompt?: string;
    } = {}
  ) => {
    if (!user?.uid) {
      setState(prev => ({ ...prev, error: 'Usuário não autenticado' }));
      return null;
    }

    setState(prev => ({
      ...prev,
      isGenerating: true,
      error: null,
      lastResponse: null
    }));

    try {
      const responses = await MultiAIService.compareProviders(
        user.uid,
        prompt,
        options
      );

      const comparisonResults = responses.map(r => ({
        provider: r.provider,
        content: r.content,
        confidence: r.confidence
      }));

      setState(prev => ({
        ...prev,
        isGenerating: false,
        comparisonResults,
        lastResponse: responses[0] ? {
          content: responses[0].content,
          provider: responses[0].provider,
          confidence: responses[0].confidence,
          tokens: responses[0].tokens,
          latency: responses[0].latency
        } : null
      }));

      logger.info('Comparação concluída', {
        providersCount: responses.length,
        winner: responses[0]?.provider
      });

      return responses;

    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao comparar providers';
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: errorMessage
      }));

      logger.error('Erro ao comparar providers', error);
      return null;
    }
  }, [user?.uid]);

  // Selecionar provider
  const selectProvider = useCallback((provider: AIProvider) => {
    setState(prev => ({
      ...prev,
      selectedProvider: provider
    }));

    // Salvar preferência se não for 'auto'
    if (user?.uid && provider !== 'auto') {
      MultiAIService.updateUserPreferences(user.uid, {
        preferredProvider: provider
      }).catch(error => {
        logger.error('Erro ao salvar preferência', error);
      });
    }
  }, [user?.uid]);

  // Atualizar preferências
  const updatePreferences = useCallback(async (
    preferences: Partial<{
      preferredProvider: AIProvider;
      autoSelectEnabled: boolean;
      costSensitivity: 'low' | 'medium' | 'high';
      qualityThreshold: number;
      maxLatency: number;
    }>
  ) => {
    if (!user?.uid) return;

    try {
      await MultiAIService.updateUserPreferences(user.uid, preferences);
      
      setState(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          ...preferences
        }
      }));

      logger.info('Preferências atualizadas', preferences);

    } catch (error) {
      logger.error('Erro ao atualizar preferências', error);
      setState(prev => ({
        ...prev,
        error: 'Erro ao salvar preferências'
      }));
    }
  }, [user?.uid]);

  // Cancelar geração em andamento
  const cancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setState(prev => ({
        ...prev,
        isGenerating: false
      }));
    }
  }, []);

  // Obter estatísticas de uso
  const getUsageStats = useCallback(async () => {
    if (!user?.uid) return null;

    try {
      const stats = await MultiAIService.getUsageStats(user.uid);
      return stats;
    } catch (error) {
      logger.error('Erro ao obter estatísticas', error);
      return null;
    }
  }, [user?.uid]);

  // Regenerar com outro provider
  const regenerateWithProvider = useCallback(async (provider: AIProvider) => {
    if (!state.lastResponse) return null;

    // Usar o prompt original se disponível nos metadados
    const originalPrompt = state.lastResponse.content.substring(0, 100); // Simplificado
    
    return await generateContent(originalPrompt, {
      provider,
      maxTokens: state.lastResponse.tokens,
      temperature: 0.7
    });
  }, [state.lastResponse, generateContent]);

  // Stream de resposta (preparação futura)
  const streamContent = useCallback(async (
    prompt: string,
    onChunk: (chunk: string) => void,
    options: any = {}
  ) => {
    // Implementação futura para streaming
    logger.info('Streaming ainda não implementado, usando geração normal');
    const response = await generateContent(prompt, options);
    if (response) {
      onChunk(response.content);
    }
    return response;
  }, [generateContent]);

  return {
    // Estado
    isGenerating: state.isGenerating,
    selectedProvider: state.selectedProvider,
    lastResponse: state.lastResponse,
    error: state.error,
    comparisonResults: state.comparisonResults,
    preferences: state.preferences,

    // Ações principais
    generateContent,
    compareProviders,
    selectProvider,
    updatePreferences,
    cancelGeneration,

    // Ações auxiliares
    getUsageStats,
    regenerateWithProvider,
    streamContent,

    // Utilidades
    availableProviders: ['gemini', 'chatgpt', 'auto'] as AIProvider[],
    isAuthenticated: !!user?.uid,
    
    // Helpers
    getProviderName: (provider: AIProvider) => {
      const names = {
        gemini: 'Google Gemini',
        chatgpt: 'OpenAI ChatGPT',
        auto: 'Seleção Automática'
      };
      return names[provider] || provider;
    },

    getProviderIcon: (provider: AIProvider) => {
      const icons = {
        gemini: '✨',
        chatgpt: '🤖',
        auto: '🎯'
      };
      return icons[provider] || '🔮';
    }
  };
}; 