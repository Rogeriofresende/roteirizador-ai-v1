import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import type { FormData } from '../types';
import { analyticsService } from './analyticsService';
import { GeminiAuthManager } from './geminiAuthManager';
import { NetworkResilienceManager } from './networkResilienceManager';
import { APICircuitBreaker } from './apiCircuitBreaker';
import { APIFallbackManager, setupScriptGenerationFallbacks } from './apiFallbackManager';

export class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: GenerativeModel | null = null;
  private authManager: GeminiAuthManager | null = null;
  private networkManager: NetworkResilienceManager;
  private circuitBreaker: APICircuitBreaker;
  private fallbackManager: APIFallbackManager;
  
  // 🚀 WEEK 7: AI Response Optimization
  private responseCache = new Map<string, {
    response: string;
    timestamp: number;
    ttl: number;
    hitCount: number;
    quality: number;
  }>();
  private streamingConnections = new Map<string, AbortController>();
  
  // 🚀 WEEK 7: Performance Metrics
  private metrics = {
    totalRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    streamingRequests: 0,
    avgResponseTime: 0,
    avgQuality: 0
  };

  constructor() {
    console.log('🔧 GeminiService: Inicializando com resiliência aprimorada...');
    this.networkManager = new NetworkResilienceManager();
    this.circuitBreaker = new APICircuitBreaker();
    this.fallbackManager = setupScriptGenerationFallbacks();
    this.initializeModel();
    
    // 🚀 WEEK 7: Start cache maintenance
    this.startCacheMaintenace();
  }

  private getApiKey(): string | null {
    // Prioridade: localStorage -> environment variable
    const localStorageKey = localStorage.getItem('GEMINI_API_KEY');
    if (localStorageKey && localStorageKey.trim()) {
      console.log('🔑 Using API key from localStorage');
      return localStorageKey.trim();
    }

    const envKey = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;
    if (envKey && envKey.trim()) {
      console.log('🔑 Using API key from environment variable');
      console.log('🔍 API key prefix:', envKey.substring(0, 10) + '...');
      return envKey.trim();
    }

    console.warn('❌ No API key found in localStorage or environment');
    return null;
  }

  private initializeModel() {
    try {
      const apiKey = this.getApiKey();
      
      if (!apiKey) {
        console.warn('⚠️ API key do Gemini não configurada. Configure através do localStorage ou variável de ambiente VITE_GOOGLE_GEMINI_API_KEY');
        this.genAI = null;
        this.model = null;
        this.authManager = null;
        return;
      }
      
      // Initialize authentication manager
      this.authManager = new GeminiAuthManager(apiKey);
      
      // ✅ CORRIGIDO: Usar endpoint correto e headers apropriados
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash",
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      });
      
      console.log('✅ Gemini AI inicializado com sucesso com resiliência aprimorada');
    } catch (error: unknown) {
      console.error('❌ Erro ao inicializar Gemini:', error);
      analyticsService.trackError('Gemini Initialization Failed', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      this.genAI = null;
      this.model = null;
      this.authManager = null;
    }
  }

  isConfigured(): boolean {
    return this.model !== null && this.authManager !== null;
  }

  async generateScript(params: {
    subject: string;
    platform: string;
    duration: string;
    tone: string;
    audience: string;
    objective?: string;
  }): Promise<string> {
    const startTime = Date.now();
    
    try {
      console.log('🚀 Iniciando geração de roteiro com resiliência aprimorada...', params);
      
      // Track início da geração
      analyticsService.trackConversionFunnel('form_complete', params);
      
      if (!this.isConfigured()) {
        const error = 'Gemini API não configurado. Configure sua API key primeiro.';
        console.error('❌', error);
        
        // Track erro de configuração
        analyticsService.trackError('API Key Not Configured', {
          context: 'script_generation',
          platform: params.platform
        });
        
        throw new Error(error);
      }

      // ✅ VALIDAÇÃO: Parâmetros obrigatórios
      if (!params.subject?.trim() || !params.platform?.trim()) {
        throw new Error('Parâmetros obrigatórios ausentes (subject ou platform)');
      }

      // Cache the script for fallback
      const cacheKey = `script_${JSON.stringify(params)}`;
      
      // ✅ IMPLEMENTADO: Usar fallback manager para operação principal
      const result = await this.fallbackManager.executeWithFallbacks(
        () => this.generateScriptWithResilience(params),
        'script_generation'
      );
      
      const generationTime = Date.now() - startTime;
      
      // Cache successful result
      try {
        localStorage.setItem('last_generated_script', JSON.stringify({
          script: result,
          timestamp: Date.now(),
          params
        }));
      } catch (cacheError) {
        console.warn('Failed to cache script:', cacheError);
      }
      
      console.log('✅ Roteiro gerado com sucesso! Tamanho:', result.length, 'caracteres');
      
      // Track sucesso da geração
      analyticsService.trackScriptGeneration({
        platform: params.platform,
        subject: params.subject,
        duration: params.duration,
        tone: params.tone,
        audience: params.audience,
        success: true,
        generation_time: generationTime,
        script_length: result.length,
        circuit_breaker_state: this.circuitBreaker.getState(),
        failure_count: this.circuitBreaker.getFailureCount()
      });
      
      return result;

    } catch (error: unknown) {
      console.error('❌ Erro ao gerar roteiro:', error);
      
      // ✅ MELHORADO: Error tracking detalhado
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao gerar roteiro';
      
      analyticsService.trackError('Script Generation Failed', {
        context: 'script_generation',
        platform: params.platform,
        error: errorMessage,
        configured: this.isConfigured(),
        circuit_breaker_state: this.circuitBreaker.getState(),
        failure_count: this.circuitBreaker.getFailureCount()
      });
      
      // ✅ FALLBACK: Mensagem mais amigável para usuário
      if (errorMessage.includes('400') || errorMessage.includes('Bad Request')) {
        throw new Error('Configuração da API Gemini inválida. Verifique sua API key.');
      } else if (errorMessage.includes('429') || errorMessage.includes('quota')) {
        throw new Error('Limite de uso da API atingido. Tente novamente mais tarde.');
      } else if (errorMessage.includes('não configurado')) {
        throw new Error(errorMessage);
      } else if (errorMessage.includes('Circuit breaker is OPEN')) {
        throw new Error('Serviço temporariamente indisponível devido a múltiplas falhas. Tente novamente em alguns minutos.');
      } else {
        throw new Error('Erro temporário na geração. Tente novamente em alguns instantes.');
      }
    }
  }

  // ✅ NOVO: Método principal com resiliência completa
  private async generateScriptWithResilience(params: {
    subject: string;
    platform: string;
    duration: string;
    tone: string;
    audience: string;
    objective?: string;
  }): Promise<string> {
    // Use circuit breaker para evitar chamadas desnecessárias
    return await this.circuitBreaker.execute(async () => {
      // Use network resilience manager para retry automático
      return await this.networkManager.executeWithRetry(
        async () => {
          // Validate API key before making request
          const validatedApiKey = await this.authManager!.getValidatedApiKey();
          
          const prompt = this.buildPrompt(params);
          console.log('📝 Prompt criado, enviando para Gemini com resiliência...');
          
          // ✅ CORRIGIDO: Usar estrutura de request correta para Gemini API
          const requestBody = {
            contents: [
              {
                parts: [
                  {
                    text: prompt
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048,
              topP: 0.95,
              topK: 40
            },
            safetySettings: [
              {
                category: 'HARM_CATEGORY_HARASSMENT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
              },
              {
                category: 'HARM_CATEGORY_HATE_SPEECH',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
              },
              {
                category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
              },
              {
                category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
              }
            ]
          };

          // ✅ CORRIGIDO: Usar fetch direto com headers corretos
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${validatedApiKey}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(requestBody)
            }
          );

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ Gemini API Error:', response.status, errorData);
            
            // ✅ MELHORADO: Tratamento específico para diferentes tipos de erro
            if (response.status === 400) {
              throw new Error(`Bad Request (400): ${errorData.error?.message || 'Invalid request format'}`);
            } else if (response.status === 401) {
              throw new Error(`Unauthorized (401): ${errorData.error?.message || 'Invalid API key'}`);
            } else if (response.status === 429) {
              throw new Error(`Rate Limited (429): ${errorData.error?.message || 'Too many requests'}`);
            } else if (response.status >= 500) {
              throw new Error(`Server Error (${response.status}): ${errorData.error?.message || 'Internal server error'}`);
            } else {
              throw new Error(`API Error (${response.status}): ${errorData.error?.message || response.statusText}`);
            }
          }

          const result = await response.json();
          console.log('📡 Resposta recebida da API');
          
          // ✅ CORRIGIDO: Extrair texto corretamente da resposta
          if (!result.candidates || result.candidates.length === 0) {
            throw new Error('Nenhuma resposta gerada pela IA');
          }

          const text = result.candidates[0]?.content?.parts?.[0]?.text;
          
          if (!text || text.trim().length < 50) {
            throw new Error('Resposta da API muito curta ou vazia');
          }

          return text.trim();
        },
        'gemini_api_call'
      );
    });
  }

  async refineText(selectedText: string, refinementInstruction: string): Promise<string> {
    const startTime = Date.now();
    
    try {
      if (!this.isConfigured()) {
        throw new Error('Gemini API não configurado. Configure sua API key primeiro.');
      }

      const prompt = `
Refine o seguinte texto seguindo as instruções fornecidas.

TEXTO ORIGINAL:
"${selectedText}"

INSTRUÇÕES PARA REFINAMENTO:
${refinementInstruction}

DIRETRIZES:
- Mantenha o significado original
- Aplique apenas as mudanças solicitadas
- Mantenha o mesmo estilo se não especificado diferente
- Retorne apenas o texto refinado, sem explicações

TEXTO REFINADO:
`;

      // ✅ IMPLEMENTADO: Usar resiliência para refinamento também
      const refinedText = await this.circuitBreaker.execute(async () => {
        return await this.networkManager.executeWithRetry(
          async () => {
            const validatedApiKey = await this.authManager!.getValidatedApiKey();
            
            const requestBody = {
              contents: [
                {
                  parts: [
                    {
                      text: prompt
                    }
                  ]
                }
              ],
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 1024,
                topP: 0.8,
                topK: 20
              }
            };

            const response = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${validatedApiKey}`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
              }
            );

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(`API Error: ${response.status} - ${errorData.error?.message || response.statusText}`);
            }

            const result = await response.json();
            
            if (!result.candidates || result.candidates.length === 0) {
              throw new Error('Nenhuma resposta gerada pela IA');
            }

            const text = result.candidates[0]?.content?.parts?.[0]?.text;
            
            if (!text) {
              throw new Error('Resposta vazia da API');
            }

            return text.trim();
          },
          'gemini_text_refinement'
        );
      });
      
      const processingTime = Date.now() - startTime;
      
      // Track uso da feature de refinamento
      analyticsService.trackFeatureUsage('text_refinement', {
        original_length: selectedText.length,
        refined_length: refinedText.length,
        processing_time: processingTime,
        success: true
      });
      
      return refinedText;
    } catch (error: unknown) {
      console.error('Erro ao refinar texto:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao refinar texto';
      throw new Error(errorMessage);
    }
  }

  private buildPrompt(params: {
    subject: string;
    platform: string;
    duration: string;
    tone: string;
    audience: string;
    objective?: string;
  }): string {
    const { subject, platform, duration, tone, audience, objective } = params;

    const basePrompt = `
Você é um especialista em criação de conteúdo para redes sociais e roteirista profissional.
Crie um roteiro completo e envolvente seguindo estas especificações:

ASSUNTO: ${subject}
PLATAFORMA: ${platform}
DURAÇÃO: ${duration}
TOM: ${tone}
PÚBLICO: ${audience}
${objective ? `OBJETIVO: ${objective}` : ''}

ESTRUTURA OBRIGATÓRIA:
1. TÍTULO/HOOK (chamativo e otimizado para ${platform})
2. INTRODUÇÃO (apresentação rápida e impactante)
3. DESENVOLVIMENTO (conteúdo principal estruturado)
4. CONCLUSÃO (resumo + call-to-action)

REQUISITOS ESPECÍFICOS PARA ${platform.toUpperCase()}:
`;

    // Adicionar requisitos específicos por plataforma
    let platformSpecifics = '';
    
    switch (platform.toLowerCase()) {
      case 'youtube':
        platformSpecifics = `
- Hook nos primeiros 5 segundos para retenção
- Estrutura didática com momentos de engajamento
- Call-to-action para like, subscribe e comentários
- Sugestões de cards e end screens
- SEO: título otimizado e descrição sugerida
- Timing sugerido para cada seção
`;
        break;
        
      case 'instagram':
        platformSpecifics = `
- Primeira frase impactante para parar o scroll
- Linguagem visual (descreva cenas/elementos visuais)
- Hashtags estratégicas (mix de populares + nicho)
- Stories complementares sugeridos
- Formato quadrado ou vertical (9:16)
- Texto overlay suggestions
`;
        break;
        
      case 'tiktok':
        platformSpecifics = `
- Hook extremamente rápido (3 segundos)
- Transições dinâmicas e efeitos
- Trends atuais aplicáveis
- Música/audio suggestions
- Texto overlay minimalista
- Loop potential para replay
`;
        break;
        
      case 'linkedin':
        platformSpecifics = `
- Tom profissional e autoridade
- Insights de mercado relevantes
- Storytelling corporativo
- Networking e value proposition
- CTA para engagement profissional
- Formato text-heavy otimizado
`;
        break;
        
      default:
        platformSpecifics = `
- Adaptado para as características da plataforma
- Linguagem adequada ao público
- Call-to-action relevante
- Formato otimizado para engajamento
`;
    }

    return basePrompt + platformSpecifics + `

INSTRUÇÕES FINAIS:
- Use linguagem ${tone} apropriada para ${audience}
- Duração total aproximada: ${duration}
- Seja criativo mas mantenha foco no assunto
- Inclua timing sugerido entre parênteses
- Adicione dicas de performance quando relevante

Gere um roteiro completo, criativo e pronto para produção:
`;
  }

  // Método para configurar API key dinamicamente
  setAPIKey(apiKey: string): boolean {
    try {
      if (!apiKey || typeof apiKey !== 'string') {
        throw new Error('API key inválida');
      }

      // Salvar no localStorage para persistência
      localStorage.setItem('GEMINI_API_KEY', apiKey);
      
      // Reinicializar o modelo
      this.initializeModel();
      
      // Track configuração de API key
      analyticsService.trackUserAction('api_key_configured', {
        success: this.isConfigured()
      });
      
      return this.isConfigured();
    } catch (error: unknown) {
      console.error('Erro ao configurar API key:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao configurar API key';
      analyticsService.trackError('API Key Configuration Failed', {
        error: errorMessage
      });
      return false;
    }
  }

  // Método para remover API key
  removeAPIKey(): void {
    localStorage.removeItem('GEMINI_API_KEY');
    this.genAI = null;
    this.model = null;
    this.authManager = null;
    
    analyticsService.trackUserAction('api_key_removed');
    console.log('API key removida');
  }

  // Método para testar conectividade
  async testConnection(): Promise<boolean> {
    try {
      if (!this.isConfigured()) {
        return false;
      }

      // ✅ IMPLEMENTADO: Test usando resiliência
      await this.circuitBreaker.execute(async () => {
        const validatedApiKey = await this.authManager!.getValidatedApiKey();
        
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${validatedApiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: 'Hello'
                    }
                  ]
                }
              ],
              generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 10
              }
            })
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Connection test failed: ${response.status} - ${errorData.error?.message || response.statusText}`);
        }

        const result = await response.json();
        return result.candidates?.[0]?.content?.parts?.[0]?.text || '';
      });
      
      analyticsService.trackUserAction('connection_test', {
        success: true,
        circuit_breaker_state: this.circuitBreaker.getState()
      });
      
      return true;
    } catch (error: unknown) {
      console.error('Teste de conexão falhou:', error);
      
      analyticsService.trackUserAction('connection_test', {
        success: false,
        error_message: error instanceof Error ? error.message : 'Erro desconhecido ao testar conexão',
        circuit_breaker_state: this.circuitBreaker.getState()
      });
      
      return false;
    }
  }

  // ✅ NOVO: Método para obter status do sistema
  getSystemStatus(): {
    configured: boolean;
    circuitBreakerState: string;
    failureCount: number;
    lastTested: Date | null;
  } {
    return {
      configured: this.isConfigured(),
      circuitBreakerState: this.circuitBreaker.getState(),
      failureCount: this.circuitBreaker.getFailureCount(),
      lastTested: this.authManager?.lastValidated || null
    };
  }

  // 🚀 WEEK 7 DAY 2: AI Response Optimization - Streaming & Advanced Caching

  /**
   * Generate script with streaming support for real-time experience
   */
  async generateScriptStreaming(
    params: {
      subject: string;
      platform: string;
      duration: string;
      tone: string;
      audience: string;
      objective?: string;
    },
    onChunk: (chunk: { text: string; isComplete: boolean; progress: number }) => void
  ): Promise<string> {
    const startTime = Date.now();
    const requestId = `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.metrics.totalRequests++;
    this.metrics.streamingRequests++;

    try {
      // Check cache first for instant response
      const cacheKey = this.generateCacheKey(params);
      const cached = this.getCachedResponse(cacheKey);
      
      if (cached) {
        this.metrics.cacheHits++;
        console.log('📦 Serving from cache with simulated streaming');
        
        // Simulate streaming for cached response to maintain UX consistency
        const words = cached.response.split(' ');
        const chunkSize = Math.max(5, Math.floor(words.length / 15));
        
        for (let i = 0; i < words.length; i += chunkSize) {
          const chunk = words.slice(i, i + chunkSize).join(' ') + ' ';
          const progress = Math.min(95, (i / words.length) * 100);
          
          onChunk({
            text: chunk,
            isComplete: false,
            progress
          });
          
          await new Promise(resolve => setTimeout(resolve, 80)); // Smooth streaming experience
        }
        
        onChunk({ text: '', isComplete: true, progress: 100 });
        
        // Track cache hit performance
        analyticsService.trackFeatureUsage('streaming_cache_hit', {
          cache_age: Date.now() - cached.timestamp,
          hit_count: cached.hitCount,
          script_length: cached.response.length
        });
        
        return cached.response;
      }

      this.metrics.cacheMisses++;

      if (!this.isConfigured()) {
        throw new Error('Gemini API não configurado. Configure sua API key primeiro.');
      }

      // Create abort controller for user cancellation
      const abortController = new AbortController();
      this.streamingConnections.set(requestId, abortController);

      console.log('🚀 Starting streaming generation...');

      // Use resilience for streaming request
      const fullText = await this.circuitBreaker.execute(async () => {
        return await this.networkManager.executeWithRetry(
          async () => {
            const validatedApiKey = await this.authManager!.getValidatedApiKey();
            const prompt = this.buildPrompt(params);

            const requestBody = {
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048,
                topP: 0.95,
                topK: 40
              }
            };

            // Note: Using regular endpoint as streaming is simulated for better UX
            const response = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${validatedApiKey}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
                signal: abortController.signal
              }
            );

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(`API Error: ${response.status} - ${errorData.error?.message || response.statusText}`);
            }

            const result = await response.json();
            
            if (!result.candidates || result.candidates.length === 0) {
              throw new Error('No response generated');
            }

            const text = result.candidates[0]?.content?.parts?.[0]?.text;
            if (!text || text.trim().length < 50) {
              throw new Error('Response too short or empty');
            }

            return text.trim();
          },
          'streaming_generation'
        );
      });

      // Simulate streaming for better UX (even with instant API response)
      const words = fullText.split(' ');
      const chunkSize = Math.max(5, Math.floor(words.length / 20));
      
      for (let i = 0; i < words.length; i += chunkSize) {
        if (abortController.signal.aborted) {
          throw new Error('Generation cancelled by user');
        }

        const chunk = words.slice(i, i + chunkSize).join(' ') + ' ';
        const progress = Math.min(95, (i / words.length) * 100);
        
        onChunk({
          text: chunk,
          isComplete: false,
          progress
        });
        
        await new Promise(resolve => setTimeout(resolve, 60)); // Smooth streaming
      }

      onChunk({ text: '', isComplete: true, progress: 100 });

      // Cache successful result with quality assessment
      const quality = this.assessResponseQuality(fullText, params);
      this.cacheResponse(cacheKey, fullText, quality);

      const responseTime = Date.now() - startTime;
      this.updateMetrics(responseTime, quality);

      console.log('✅ Streaming generation completed successfully');
      
      // Enhanced analytics tracking
      analyticsService.trackScriptGeneration({
        platform: params.platform,
        subject: params.subject,
        duration: params.duration,
        tone: params.tone,
        audience: params.audience,
        success: true,
        generation_time: responseTime,
        script_length: fullText.length,
        streaming: true,
        cache_miss: true,
        quality_score: quality
      });

      return fullText;

    } catch (error) {
      console.error('❌ Streaming generation failed:', error);
      
      // Track streaming failure
      analyticsService.trackError('Streaming Generation Failed', {
        request_id: requestId,
        platform: params.platform,
        error: error instanceof Error ? error.message : 'Unknown error',
        streaming: true
      });
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Generation cancelled by user');
      }
      
      throw error;
    } finally {
      this.streamingConnections.delete(requestId);
    }
  }

  /**
   * Cancel active streaming generation
   */
  cancelStreaming(requestId?: string): number {
    if (requestId) {
      const controller = this.streamingConnections.get(requestId);
      if (controller) {
        controller.abort();
        this.streamingConnections.delete(requestId);
        return 1;
      }
      return 0;
    }

    // Cancel all active streams
    const count = this.streamingConnections.size;
    this.streamingConnections.forEach(controller => controller.abort());
    this.streamingConnections.clear();
    
    console.log(`🛑 Cancelled ${count} active streaming connections`);
    return count;
  }

  /**
   * Enhanced cache key generation with context awareness
   */
  private generateCacheKey(params: any): string {
    const normalized = {
      subject: params.subject?.toLowerCase().trim(),
      platform: params.platform?.toLowerCase().trim(),
      duration: params.duration?.toLowerCase().trim(),
      tone: params.tone?.toLowerCase().trim(),
      audience: params.audience?.toLowerCase().trim(),
      objective: params.objective?.toLowerCase().trim() || ''
    };
    
    const key = JSON.stringify(normalized);
    return btoa(key).replace(/[^a-zA-Z0-9]/g, '').substring(0, 40);
  }

  /**
   * Get cached response with hit tracking
   */
  private getCachedResponse(cacheKey: string): { 
    response: string; 
    hitCount: number; 
    timestamp: number;
  } | null {
    const entry = this.responseCache.get(cacheKey);
    
    if (!entry) return null;
    
    // Check TTL expiration
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.responseCache.delete(cacheKey);
      return null;
    }
    
    // Update access statistics
    entry.hitCount++;
    
    return {
      response: entry.response,
      hitCount: entry.hitCount,
      timestamp: entry.timestamp
    };
  }

  /**
   * Cache response with intelligent TTL based on quality and usage
   */
  private cacheResponse(cacheKey: string, response: string, quality: number): void {
    // Dynamic TTL based on quality and content type
    let ttl = 600000; // Base: 10 minutes
    
    // Quality-based extension
    if (quality > 0.8) ttl *= 2;    // 20 minutes for high quality
    if (quality > 0.9) ttl *= 1.5;  // 30 minutes for excellent quality
    
    // Content-based extension
    if (response.length > 1000) ttl *= 1.2; // Longer content cached longer
    if (response.includes('TÍTULO') && response.includes('CONCLUSÃO')) ttl *= 1.3; // Well-structured content
    
    const entry = {
      response,
      timestamp: Date.now(),
      ttl,
      hitCount: 0,
      quality
    };

    this.responseCache.set(cacheKey, entry);
    
    // Intelligent cache management - keep high-quality entries longer
    if (this.responseCache.size > 150) {
      this.evictLowQualityEntries();
    }

    console.log(`💾 Cached response (quality: ${quality.toFixed(2)}, TTL: ${Math.round(ttl/60000)}min)`);
  }

  /**
   * Assess response quality for caching decisions
   */
  private assessResponseQuality(response: string, params: any): number {
    let quality = 0.5; // Base quality
    
    // Length indicators
    if (response.length > 200) quality += 0.1;
    if (response.length > 500) quality += 0.1;
    if (response.length > 1000) quality += 0.1;
    
    // Structure indicators
    if (response.includes('TÍTULO') || response.includes('HOOK')) quality += 0.1;
    if (response.includes('INTRODUÇÃO')) quality += 0.05;
    if (response.includes('DESENVOLVIMENTO')) quality += 0.05;
    if (response.includes('CONCLUSÃO')) quality += 0.1;
    
    // Platform-specific quality
    const platform = params.platform?.toLowerCase();
    if (platform === 'youtube' && response.includes('subscribe')) quality += 0.05;
    if (platform === 'instagram' && response.includes('#')) quality += 0.05;
    if (platform === 'tiktok' && response.includes('hook')) quality += 0.05;
    
    // Content coherence (basic check)
    const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 10);
    if (sentences.length > 3) quality += 0.05;
    if (sentences.length > 6) quality += 0.05;
    
    return Math.min(1, Math.max(0, quality));
  }

  /**
   * Update performance metrics with moving averages
   */
  private updateMetrics(responseTime: number, quality: number): void {
    const alpha = 0.2; // Smoothing factor for moving average
    
    this.metrics.avgResponseTime = this.metrics.avgResponseTime * (1 - alpha) + responseTime * alpha;
    this.metrics.avgQuality = this.metrics.avgQuality * (1 - alpha) + quality * alpha;
  }

  /**
   * Intelligent cache eviction - remove low quality and old entries first
   */
  private evictLowQualityEntries(): void {
    const entries = Array.from(this.responseCache.entries())
      .map(([key, entry]) => ({
        key,
        entry,
        score: (entry.quality * 0.7) + (entry.hitCount * 0.2) + ((Date.now() - entry.timestamp) / entry.ttl * -0.1)
      }))
      .sort((a, b) => a.score - b.score); // Lowest score first
    
    // Remove bottom 30% of entries
    const toRemove = Math.floor(entries.length * 0.3);
    for (let i = 0; i < toRemove; i++) {
      this.responseCache.delete(entries[i].key);
    }
    
    console.log(`🗑️ Evicted ${toRemove} low-quality cache entries`);
  }

  /**
   * Get comprehensive performance metrics
   */
  getPerformanceMetrics() {
    const cacheHitRate = this.metrics.totalRequests > 0 
      ? (this.metrics.cacheHits / this.metrics.totalRequests) * 100 
      : 0;

    const streamingRate = this.metrics.totalRequests > 0
      ? (this.metrics.streamingRequests / this.metrics.totalRequests) * 100
      : 0;

    // Cache quality analysis
    const cacheEntries = Array.from(this.responseCache.values());
    const avgCacheQuality = cacheEntries.length > 0
      ? cacheEntries.reduce((sum, e) => sum + e.quality, 0) / cacheEntries.length
      : 0;

    const totalCacheHits = cacheEntries.reduce((sum, e) => sum + e.hitCount, 0);

    return {
      ...this.metrics,
      cacheHitRate: Math.round(cacheHitRate * 100) / 100,
      streamingRate: Math.round(streamingRate * 100) / 100,
      cacheSize: this.responseCache.size,
      activeStreams: this.streamingConnections.size,
      avgCacheQuality: Math.round(avgCacheQuality * 100) / 100,
      totalCacheHits,
      avgResponseTime: Math.round(this.metrics.avgResponseTime),
      avgQuality: Math.round(this.metrics.avgQuality * 100) / 100
    };
  }

  /**
   * Get detailed cache analytics
   */
  getCacheAnalytics() {
    const entries = Array.from(this.responseCache.values());
    
    if (entries.length === 0) {
      return {
        totalEntries: 0,
        totalHits: 0,
        avgQuality: 0,
        avgAge: 0,
        qualityDistribution: { low: 0, medium: 0, high: 0 },
        sizeDistribution: { small: 0, medium: 0, large: 0 }
      };
    }

    const now = Date.now();
    const totalHits = entries.reduce((sum, e) => sum + e.hitCount, 0);
    const avgQuality = entries.reduce((sum, e) => sum + e.quality, 0) / entries.length;
    const avgAge = entries.reduce((sum, e) => sum + (now - e.timestamp), 0) / entries.length;

    // Quality distribution
    const qualityDistribution = {
      low: entries.filter(e => e.quality < 0.6).length,
      medium: entries.filter(e => e.quality >= 0.6 && e.quality < 0.8).length,
      high: entries.filter(e => e.quality >= 0.8).length
    };

    // Size distribution
    const sizeDistribution = {
      small: entries.filter(e => e.response.length < 500).length,
      medium: entries.filter(e => e.response.length >= 500 && e.response.length < 1500).length,
      large: entries.filter(e => e.response.length >= 1500).length
    };

    return {
      totalEntries: entries.length,
      totalHits,
      avgQuality: Math.round(avgQuality * 100) / 100,
      avgAge: Math.round(avgAge / 60000), // in minutes
      qualityDistribution,
      sizeDistribution
    };
  }

  /**
   * Clear cache with optional selective clearing
   */
  clearCache(selective = false): number {
    if (!selective) {
      const count = this.responseCache.size;
      this.responseCache.clear();
      console.log(`🧹 Cleared entire cache (${count} entries)`);
      return count;
    }

    // Selective clearing - remove low quality and old entries
    const now = Date.now();
    let cleared = 0;

    for (const [key, entry] of this.responseCache.entries()) {
      const age = now - entry.timestamp;
      const shouldClear = entry.quality < 0.5 || age > entry.ttl * 0.8 || entry.hitCount === 0;
      
      if (shouldClear) {
        this.responseCache.delete(key);
        cleared++;
      }
    }

    console.log(`🧹 Selectively cleared ${cleared} cache entries`);
    return cleared;
  }

  /**
   * Start automatic cache maintenance
   */
  private startCacheMaintenace(): void {
    // Run every 5 minutes
    setInterval(() => {
      const now = Date.now();
      let expiredCount = 0;

      for (const [key, entry] of this.responseCache.entries()) {
        if (now - entry.timestamp > entry.ttl) {
          this.responseCache.delete(key);
          expiredCount++;
        }
      }

      if (expiredCount > 0) {
        console.log(`🕒 Auto-cleanup: removed ${expiredCount} expired cache entries`);
      }

      // Log cache statistics periodically
      if (Math.random() < 0.1) { // 10% chance
        const metrics = this.getPerformanceMetrics();
        console.log('📊 Cache stats:', {
          size: metrics.cacheSize,
          hitRate: `${metrics.cacheHitRate}%`,
          avgQuality: metrics.avgCacheQuality
        });
      }
    }, 300000);
  }
}

// Singleton export
export const geminiService = new GeminiService();

// Função legacy para compatibilidade
export const refineText = async (selectedText: string, refinementInstruction: string): Promise<string> => {
  return geminiService.refineText(selectedText, refinementInstruction);
};