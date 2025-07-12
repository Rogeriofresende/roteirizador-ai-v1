// Infrastructure Layer - Gemini AI Adapter
// External service adapter for Google Gemini AI integration

import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { createLogger } from '../../utils/logger';

const logger = createLogger('GeminiAdapter');

export interface GeminiConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  topK?: number;
  topP?: number;
  maxOutputTokens?: number;
  timeout?: number;
  maxRetries?: number;
}

export interface GenerationRequest {
  prompt: string;
  context?: any;
  generationConfig?: {
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
  };
  safetySettings?: Array<{
    category: string;
    threshold: string;
  }>;
}

export interface GenerationResponse {
  text: string;
  finishReason?: string;
  safetyRatings?: Array<{
    category: string;
    probability: string;
  }>;
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
  };
}

export interface ConnectionTestResult {
  success: boolean;
  responseTime: number;
  error?: string;
}

export class GeminiAdapter {
  private genAI: GoogleGenerativeAI | null = null;
  private model: GenerativeModel | null = null;
  private config: GeminiConfig;
  private logger = createLogger('GeminiAdapter');

  constructor(config: GeminiConfig) {
    this.config = {
      model: 'gemini-1.5-flash-latest',
      temperature: 0.8,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
      timeout: 30000,
      maxRetries: 3,
      ...config
    };

    this.initialize();
  }

  /**
   * Initialize the Gemini AI service
   */
  private initialize(): void {
    try {
      if (!this.config.apiKey || !this.config.apiKey.trim()) {
        throw new Error('Gemini API key is required');
      }

      this.genAI = new GoogleGenerativeAI(this.config.apiKey);
      this.model = this.genAI.getGenerativeModel({ 
        model: this.config.model! 
      });

      this.logger.info('Gemini AI adapter initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Gemini AI:', error);
      this.genAI = null;
      this.model = null;
    }
  }

  /**
   * Check if the adapter is properly configured
   */
  isConfigured(): boolean {
    return this.genAI !== null && this.model !== null;
  }

  /**
   * Test connection to Gemini API
   */
  async testConnection(): Promise<ConnectionTestResult> {
    const startTime = Date.now();

    try {
      if (!this.isConfigured()) {
        return {
          success: false,
          responseTime: 0,
          error: 'Gemini AI not configured'
        };
      }

      // Simple test generation
      const response = await this.generateContent({
        prompt: 'Test connection. Respond with "OK".',
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 10
        }
      });

      const responseTime = Date.now() - startTime;

      return {
        success: true,
        responseTime,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.logger.error('Connection test failed:', error);

      return {
        success: false,
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generate content using Gemini AI
   */
  async generateContent(request: GenerationRequest): Promise<GenerationResponse> {
    if (!this.isConfigured()) {
      throw new Error('Gemini AI not configured. Please check your API key.');
    }

    const startTime = Date.now();
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.config.maxRetries!; attempt++) {
      try {
        this.logger.info(`Generation attempt ${attempt}/${this.config.maxRetries}`);

        // Prepare generation config
        const generationConfig = {
          temperature: request.generationConfig?.temperature ?? this.config.temperature,
          topK: request.generationConfig?.topK ?? this.config.topK,
          topP: request.generationConfig?.topP ?? this.config.topP,
          maxOutputTokens: request.generationConfig?.maxOutputTokens ?? this.config.maxOutputTokens,
        };

        // Prepare safety settings
        const safetySettings = request.safetySettings ?? [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ];

        // Create timeout controller
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

        try {
          const result = await this.model!.generateContent({
            contents: [
              {
                role: 'user',
                parts: [{ text: request.prompt }]
              }
            ],
            generationConfig,
            safetySettings
          });

          clearTimeout(timeoutId);

          const response = result.response;
          const text = response.text();

          if (!text || text.trim().length === 0) {
            throw new Error('Empty response from Gemini AI');
          }

          const responseTime = Date.now() - startTime;

          this.logger.info(`Content generated successfully in ${responseTime}ms`);

          return {
            text: text.trim(),
            finishReason: response.candidates?.[0]?.finishReason,
            safetyRatings: response.candidates?.[0]?.safetyRatings,
            usageMetadata: result.response.usageMetadata
          };

        } catch (error) {
          clearTimeout(timeoutId);
          throw error;
        }

      } catch (error: any) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        this.logger.warn(`Attempt ${attempt} failed:`, lastError.message);

        // Check if it's a rate limit error
        if (error?.status === 429 || error?.message?.includes('rate limit')) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          this.logger.info(`Rate limited. Retrying in ${delay}ms...`);
          await this.sleep(delay);
          continue;
        }

        // Check if it's a recoverable error
        if (error?.status >= 500 && attempt < this.config.maxRetries!) {
          const delay = 1000 * attempt; // Linear backoff for server errors
          this.logger.info(`Server error. Retrying in ${delay}ms...`);
          await this.sleep(delay);
          continue;
        }

        // If it's a client error (4xx), don't retry
        if (error?.status >= 400 && error?.status < 500) {
          break;
        }
      }
    }

    // If all retries failed
    this.logger.error('All generation attempts failed:', lastError);
    throw lastError || new Error('Generation failed after all retries');
  }

  /**
   * Generate script content (specialized method)
   */
  async generateScript(params: {
    subject: string;
    platform: string;
    duration: string;
    tone: string;
    audience: string;
    objective?: string;
  }): Promise<string> {
    const prompt = this.buildScriptPrompt(params);
    
    const response = await this.generateContent({
      prompt,
      context: params,
      generationConfig: {
        temperature: params.platform === 'LinkedIn' ? 0.7 : 0.8,
        maxOutputTokens: 2048
      }
    });

    return response.text;
  }

  /**
   * Build script generation prompt
   */
  private buildScriptPrompt(params: {
    subject: string;
    platform: string;
    duration: string;
    tone: string;
    audience: string;
    objective?: string;
  }): string {
    return `
Crie um roteiro ${params.platform.toLowerCase()} sobre "${params.subject}".

ESPECIFICAÇÕES:
- Duração: ${params.duration}
- Tom: ${params.tone}
- Audiência: ${params.audience}
${params.objective ? `- Objetivo: ${params.objective}` : ''}

ESTRUTURA OBRIGATÓRIA:
1. **GANCHO** (primeiros 3-5 segundos)
2. **DESENVOLVIMENTO** (conteúdo principal)
3. **CALL TO ACTION** (engajamento final)

REQUIREMENTS:
- Linguagem ${params.tone.toLowerCase()}
- Adequado para ${params.platform}
- Otimizado para retenção
- Com timing específico
- Include hashtags relevantes (apenas 3-5)

FORMATO: Markdown com timecodes
`.trim();
  }

  /**
   * Get adapter configuration info
   */
  getInfo(): {
    configured: boolean;
    model: string;
    config: Partial<GeminiConfig>;
  } {
    return {
      configured: this.isConfigured(),
      model: this.config.model!,
      config: {
        temperature: this.config.temperature,
        topK: this.config.topK,
        topP: this.config.topP,
        maxOutputTokens: this.config.maxOutputTokens,
        timeout: this.config.timeout,
        maxRetries: this.config.maxRetries
      }
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<GeminiConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Reinitialize if API key changed
    if (newConfig.apiKey) {
      this.initialize();
    }

    this.logger.info('Configuration updated');
  }

  /**
   * Get health status
   */
  async getHealth(): Promise<{
    status: 'healthy' | 'unhealthy';
    configured: boolean;
    lastTest?: Date;
    responseTime?: number;
    error?: string;
  }> {
    const configured = this.isConfigured();
    
    if (!configured) {
      return {
        status: 'unhealthy',
        configured: false,
        error: 'Not configured'
      };
    }

    try {
      const testResult = await this.testConnection();
      
      return {
        status: testResult.success ? 'healthy' : 'unhealthy',
        configured: true,
        lastTest: new Date(),
        responseTime: testResult.responseTime,
        error: testResult.error
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        configured: true,
        lastTest: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Utility method for delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Dispose resources
   */
  dispose(): void {
    this.genAI = null;
    this.model = null;
    this.logger.info('Gemini adapter disposed');
  }
} 