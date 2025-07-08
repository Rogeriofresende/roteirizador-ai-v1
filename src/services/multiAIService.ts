/**
 * V6.2 Enhanced Framework - Multi-AI Service
 * Integração com múltiplas IAs: Gemini e ChatGPT
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { analyticsService } from './analyticsService';
import { createLogger } from '../utils/logger';
import { getDoc, doc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const logger = createLogger('multiAIService');

export type AIProvider = 'gemini' | 'chatgpt' | 'auto';

interface AIResponse {
  provider: AIProvider;
  content: string;
  tokens: number;
  latency: number;
  confidence: number;
  metadata?: Record<string, any>;
}

interface AICapabilities {
  provider: AIProvider;
  maxTokens: number;
  supportedLanguages: string[];
  features: string[];
  pricing: {
    inputCost: number;
    outputCost: number;
  };
  performance: {
    avgLatency: number;
    reliability: number;
  };
}

interface UserAIPreferences {
  userId: string;
  preferredProvider: AIProvider;
  fallbackProvider: AIProvider;
  autoSelectEnabled: boolean;
  qualityThreshold: number;
  maxLatency: number;
  costSensitivity: 'low' | 'medium' | 'high';
  lastUpdated: Timestamp;
}

export class MultiAIService {
  private static geminiClient: GoogleGenerativeAI | null = null;
  private static chatgptApiKey: string | null = null;
  private static userPreferences = new Map<string, UserAIPreferences>();
  private static performanceStats = new Map<AIProvider, { avgLatency: number; successRate: number }>();

  private static capabilities: Record<AIProvider, AICapabilities> = {
    gemini: {
      provider: 'gemini',
      maxTokens: 30720,
      supportedLanguages: ['pt', 'en', 'es', 'fr', 'de', 'it', 'ja', 'ko', 'zh'],
      features: ['text-generation', 'code-generation', 'creative-writing', 'analysis', 'translation'],
      pricing: {
        inputCost: 0.00025,
        outputCost: 0.0005
      },
      performance: {
        avgLatency: 1200,
        reliability: 0.98
      }
    },
    chatgpt: {
      provider: 'chatgpt',
      maxTokens: 128000,
      supportedLanguages: ['pt', 'en', 'es', 'fr', 'de', 'it', 'ja', 'ko', 'zh', 'ru', 'ar'],
      features: ['text-generation', 'code-generation', 'conversation', 'reasoning', 'vision'],
      pricing: {
        inputCost: 0.001,
        outputCost: 0.002
      },
      performance: {
        avgLatency: 1500,
        reliability: 0.99
      }
    },
    auto: {
      provider: 'auto',
      maxTokens: 128000,
      supportedLanguages: [],
      features: [],
      pricing: { inputCost: 0, outputCost: 0 },
      performance: { avgLatency: 0, reliability: 0 }
    }
  };

  /**
   * Inicializa o serviço com as chaves de API
   */
  static async initialize(geminiApiKey?: string, chatgptApiKey?: string): Promise<void> {
    try {
      // Inicializar Gemini
      if (geminiApiKey) {
        this.geminiClient = new GoogleGenerativeAI(geminiApiKey);
        logger.info('Gemini AI inicializado');
      }

      // Guardar chave ChatGPT
      if (chatgptApiKey) {
        this.chatgptApiKey = chatgptApiKey;
        logger.info('ChatGPT configurado');
      }

      // Carregar estatísticas de performance
      await this.loadPerformanceStats();

    } catch (error) {
      logger.error('Erro ao inicializar Multi-AI Service', error);
      throw error;
    }
  }

  /**
   * Gera conteúdo usando a IA selecionada ou automática
   */
  static async generateContent(
    userId: string,
    prompt: string,
    options: {
      provider?: AIProvider;
      maxTokens?: number;
      temperature?: number;
      systemPrompt?: string;
      context?: string;
    } = {}
  ): Promise<AIResponse> {
    try {
      const startTime = Date.now();
      
      // Obter preferências do usuário
      const preferences = await this.getUserPreferences(userId);
      const provider = options.provider || preferences.preferredProvider;

      let response: AIResponse;

      if (provider === 'auto') {
        response = await this.autoSelectAndGenerate(userId, prompt, options);
      } else {
        response = await this.generateWithProvider(provider, prompt, options);
      }

      // Verificar fallback se necessário
      if (response.confidence < preferences.qualityThreshold && preferences.fallbackProvider !== provider) {
        logger.info('Qualidade abaixo do threshold, tentando fallback', {
          provider,
          confidence: response.confidence,
          threshold: preferences.qualityThreshold
        });
        
        const fallbackResponse = await this.generateWithProvider(
          preferences.fallbackProvider,
          prompt,
          options
        );

        if (fallbackResponse.confidence > response.confidence) {
          response = fallbackResponse;
        }
      }

      // Atualizar estatísticas
      await this.updatePerformanceStats(response.provider, response.latency, true);

      // Analytics
      analyticsService.trackEvent('multi_ai_generation', {
        userId,
        provider: response.provider,
        tokens: response.tokens,
        latency: response.latency,
        confidence: response.confidence
      });

      return response;

    } catch (error) {
      logger.error('Erro ao gerar conteúdo', error);
      throw error;
    }
  }

  /**
   * Seleção automática da melhor IA para a tarefa
   */
  private static async autoSelectAndGenerate(
    userId: string,
    prompt: string,
    options: any
  ): Promise<AIResponse> {
    // Analisar prompt para determinar melhor provider
    const analysis = this.analyzePrompt(prompt);
    const preferences = await this.getUserPreferences(userId);

    // Calcular scores para cada provider
    const scores = new Map<AIProvider, number>();

    for (const [provider, capabilities] of Object.entries(this.capabilities)) {
      if (provider === 'auto') continue;

      let score = 0;

      // Score baseado em features necessárias
      analysis.requiredFeatures.forEach(feature => {
        if (capabilities.features.includes(feature)) score += 10;
      });

      // Score baseado em performance
      const stats = this.performanceStats.get(provider as AIProvider);
      if (stats) {
        score += stats.successRate * 20;
        score -= (stats.avgLatency / 1000) * 5;
      }

      // Score baseado em custo (se usuário é sensível a custo)
      if (preferences.costSensitivity === 'high') {
        score -= capabilities.pricing.outputCost * 100;
      }

      // Score baseado em idioma
      if (capabilities.supportedLanguages.includes(analysis.language)) {
        score += 5;
      }

      scores.set(provider as AIProvider, score);
    }

    // Selecionar provider com maior score
    let bestProvider: AIProvider = 'gemini';
    let bestScore = -Infinity;

    scores.forEach((score, provider) => {
      if (score > bestScore) {
        bestScore = score;
        bestProvider = provider;
      }
    });

    logger.info('Auto-selecionado provider', { 
      provider: bestProvider, 
      score: bestScore,
      analysis 
    });

    return await this.generateWithProvider(bestProvider, prompt, options);
  }

  /**
   * Gera conteúdo com um provider específico
   */
  private static async generateWithProvider(
    provider: AIProvider,
    prompt: string,
    options: any
  ): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      let content: string;
      let tokens: number;

      switch (provider) {
        case 'gemini':
          const geminiResponse = await this.generateWithGemini(prompt, options);
          content = geminiResponse.content;
          tokens = geminiResponse.tokens;
          break;

        case 'chatgpt':
          const chatgptResponse = await this.generateWithChatGPT(prompt, options);
          content = chatgptResponse.content;
          tokens = chatgptResponse.tokens;
          break;

        default:
          throw new Error(`Provider não suportado: ${provider}`);
      }

      const latency = Date.now() - startTime;
      const confidence = this.calculateConfidence(content, prompt, latency);

      return {
        provider,
        content,
        tokens,
        latency,
        confidence,
        metadata: {
          temperature: options.temperature || 0.7,
          maxTokens: options.maxTokens,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      const latency = Date.now() - startTime;
      await this.updatePerformanceStats(provider, latency, false);
      throw error;
    }
  }

  /**
   * Gera conteúdo usando Gemini
   */
  private static async generateWithGemini(
    prompt: string,
    options: any
  ): Promise<{ content: string; tokens: number }> {
    if (!this.geminiClient) {
      throw new Error('Gemini não está configurado');
    }

    const model = this.geminiClient.getGenerativeModel({ 
      model: 'gemini-pro',
      generationConfig: {
        temperature: options.temperature || 0.7,
        maxOutputTokens: options.maxTokens || 2048,
      }
    });

    const fullPrompt = options.systemPrompt 
      ? `${options.systemPrompt}\n\n${prompt}`
      : prompt;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    // Estimar tokens (aproximado)
    const tokens = Math.ceil(text.length / 4);

    return { content: text, tokens };
  }

  /**
   * Gera conteúdo usando ChatGPT
   */
  private static async generateWithChatGPT(
    prompt: string,
    options: any
  ): Promise<{ content: string; tokens: number }> {
    if (!this.chatgptApiKey) {
      throw new Error('ChatGPT não está configurado');
    }

    const messages = [];
    
    if (options.systemPrompt) {
      messages.push({
        role: 'system',
        content: options.systemPrompt
      });
    }

    messages.push({
      role: 'user',
      content: prompt
    });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.chatgptApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2048
      })
    });

    if (!response.ok) {
      throw new Error(`ChatGPT API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const tokens = data.usage.total_tokens;

    return { content, tokens };
  }

  /**
   * Compara respostas de diferentes IAs
   */
  static async compareProviders(
    userId: string,
    prompt: string,
    options: any = {}
  ): Promise<AIResponse[]> {
    const providers: AIProvider[] = ['gemini', 'chatgpt'];
    const responses: AIResponse[] = [];

    // Gerar com cada provider em paralelo
    const promises = providers.map(provider => 
      this.generateWithProvider(provider, prompt, options)
        .catch(error => {
          logger.error(`Erro com ${provider}`, error);
          return null;
        })
    );

    const results = await Promise.all(promises);

    results.forEach(result => {
      if (result) responses.push(result);
    });

    // Ordenar por confiança
    responses.sort((a, b) => b.confidence - a.confidence);

    // Analytics
    analyticsService.trackEvent('multi_ai_comparison', {
      userId,
      providersCompared: responses.map(r => r.provider),
      winnerProvider: responses[0]?.provider,
      confidenceDelta: responses[0]?.confidence - responses[1]?.confidence
    });

    return responses;
  }

  /**
   * Analisa o prompt para determinar características
   */
  private static analyzePrompt(prompt: string): {
    language: string;
    requiredFeatures: string[];
    complexity: 'low' | 'medium' | 'high';
    type: string;
  } {
    // Detectar idioma
    const language = this.detectLanguage(prompt);

    // Detectar features necessárias
    const requiredFeatures: string[] = [];
    
    if (prompt.includes('código') || prompt.includes('code') || prompt.includes('function')) {
      requiredFeatures.push('code-generation');
    }
    
    if (prompt.includes('criativo') || prompt.includes('creative') || prompt.includes('história')) {
      requiredFeatures.push('creative-writing');
    }
    
    if (prompt.includes('analisar') || prompt.includes('analyze') || prompt.includes('análise')) {
      requiredFeatures.push('analysis');
    }

    // Detectar complexidade
    const wordCount = prompt.split(/\s+/).length;
    let complexity: 'low' | 'medium' | 'high';
    
    if (wordCount < 50) complexity = 'low';
    else if (wordCount < 200) complexity = 'medium';
    else complexity = 'high';

    // Detectar tipo
    let type = 'general';
    if (requiredFeatures.includes('code-generation')) type = 'code';
    else if (requiredFeatures.includes('creative-writing')) type = 'creative';
    else if (requiredFeatures.includes('analysis')) type = 'analytical';

    return { language, requiredFeatures, complexity, type };
  }

  /**
   * Detecta idioma do prompt
   */
  private static detectLanguage(text: string): string {
    // Detecção simples baseada em palavras comuns
    const ptWords = ['de', 'que', 'e', 'para', 'com', 'em', 'um', 'uma'];
    const enWords = ['the', 'of', 'and', 'to', 'in', 'for', 'with', 'a'];
    
    const words = text.toLowerCase().split(/\s+/);
    let ptCount = 0;
    let enCount = 0;

    words.forEach(word => {
      if (ptWords.includes(word)) ptCount++;
      if (enWords.includes(word)) enCount++;
    });

    return ptCount > enCount ? 'pt' : 'en';
  }

  /**
   * Calcula confiança da resposta
   */
  private static calculateConfidence(
    response: string,
    prompt: string,
    latency: number
  ): number {
    let confidence = 0.5;

    // Aumentar confiança baseado no tamanho da resposta
    if (response.length > 100) confidence += 0.1;
    if (response.length > 500) confidence += 0.1;

    // Reduzir confiança se latência alta
    if (latency < 1000) confidence += 0.1;
    if (latency > 3000) confidence -= 0.1;

    // Verificar se resposta parece completa
    if (response.trim().endsWith('.') || response.trim().endsWith('!')) {
      confidence += 0.1;
    }

    // Verificar relevância (simplificado)
    const promptWords = prompt.toLowerCase().split(/\s+/);
    const responseWords = response.toLowerCase().split(/\s+/);
    const relevantWords = promptWords.filter(word => 
      word.length > 3 && responseWords.includes(word)
    );
    
    confidence += (relevantWords.length / promptWords.length) * 0.2;

    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Gerencia preferências do usuário
   */
  static async getUserPreferences(userId: string): Promise<UserAIPreferences> {
    // Verificar cache
    if (this.userPreferences.has(userId)) {
      return this.userPreferences.get(userId)!;
    }

    // Carregar do Firebase
    try {
      const prefDoc = await getDoc(doc(db, 'ai_preferences', userId));
      
      if (prefDoc.exists()) {
        const prefs = prefDoc.data() as UserAIPreferences;
        this.userPreferences.set(userId, prefs);
        return prefs;
      }
    } catch (error) {
      logger.error('Erro ao carregar preferências', error);
    }

    // Retornar padrão
    const defaultPrefs: UserAIPreferences = {
      userId,
      preferredProvider: 'auto',
      fallbackProvider: 'gemini',
      autoSelectEnabled: true,
      qualityThreshold: 0.6,
      maxLatency: 5000,
      costSensitivity: 'medium',
      lastUpdated: Timestamp.now()
    };

    this.userPreferences.set(userId, defaultPrefs);
    return defaultPrefs;
  }

  /**
   * Atualiza preferências do usuário
   */
  static async updateUserPreferences(
    userId: string,
    preferences: Partial<UserAIPreferences>
  ): Promise<void> {
    try {
      const current = await this.getUserPreferences(userId);
      const updated = {
        ...current,
        ...preferences,
        lastUpdated: Timestamp.now()
      };

      // Salvar no Firebase
      await setDoc(doc(db, 'ai_preferences', userId), updated);

      // Atualizar cache
      this.userPreferences.set(userId, updated);

      logger.info('Preferências atualizadas', { userId, preferences });

    } catch (error) {
      logger.error('Erro ao atualizar preferências', error);
      throw error;
    }
  }

  /**
   * Atualiza estatísticas de performance
   */
  private static async updatePerformanceStats(
    provider: AIProvider,
    latency: number,
    success: boolean
  ): Promise<void> {
    const current = this.performanceStats.get(provider) || {
      avgLatency: latency,
      successRate: success ? 1 : 0
    };

    // Média móvel exponencial
    const alpha = 0.1;
    current.avgLatency = current.avgLatency * (1 - alpha) + latency * alpha;
    current.successRate = current.successRate * (1 - alpha) + (success ? 1 : 0) * alpha;

    this.performanceStats.set(provider, current);

    // Salvar periodicamente no Firebase
    if (Math.random() < 0.1) { // 10% chance
      await this.savePerformanceStats();
    }
  }

  /**
   * Carrega estatísticas de performance
   */
  private static async loadPerformanceStats(): Promise<void> {
    try {
      const statsDoc = await getDoc(doc(db, 'system_stats', 'ai_performance'));
      
      if (statsDoc.exists()) {
        const data = statsDoc.data();
        
        Object.entries(data).forEach(([provider, stats]) => {
          if (provider !== 'lastUpdated') {
            this.performanceStats.set(provider as AIProvider, stats as any);
          }
        });
      }
    } catch (error) {
      logger.error('Erro ao carregar estatísticas', error);
    }
  }

  /**
   * Salva estatísticas de performance
   */
  private static async savePerformanceStats(): Promise<void> {
    try {
      const stats: Record<string, any> = {
        lastUpdated: Timestamp.now()
      };

      this.performanceStats.forEach((value, key) => {
        stats[key] = value;
      });

      await setDoc(doc(db, 'system_stats', 'ai_performance'), stats);
    } catch (error) {
      logger.error('Erro ao salvar estatísticas', error);
    }
  }

  /**
   * Obtém estatísticas de uso
   */
  static async getUsageStats(userId: string): Promise<{
    totalRequests: number;
    byProvider: Record<AIProvider, number>;
    totalTokens: number;
    estimatedCost: number;
    avgLatency: number;
  }> {
    // Implementar agregação de estatísticas
    return {
      totalRequests: 0,
      byProvider: { gemini: 0, chatgpt: 0, auto: 0 },
      totalTokens: 0,
      estimatedCost: 0,
      avgLatency: 0
    };
  }
} 