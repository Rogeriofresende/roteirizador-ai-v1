// Presentation Layer - Clean Architecture AI Hook
// Modern hook integrating with GeminiAdapter and AI services

import { useState, useCallback, useEffect } from 'react';
import { GeminiAdapter } from '../infrastructure/adapters';
import { getEnvironmentConfig } from '../infrastructure/config/EnvironmentConfig';
import { createLogger } from '../utils/logger';

const logger = createLogger('useCleanAI');

interface AIGenerationRequest {
  prompt: string;
  context?: string;
  maxTokens?: number;
  temperature?: number;
  platform?: 'YouTube' | 'Instagram' | 'TikTok' | 'LinkedIn' | 'Twitter' | 'Facebook' | 'Podcast';
  tone?: 'Casual' | 'Formal' | 'Entusiasmado' | 'Educativo' | 'Humorístico' | 'Inspirador';
  audience?: 'Geral' | 'Jovem' | 'Adulto' | 'Profissional' | 'Especialista' | 'Iniciante';
  keywords?: string[];
  duration?: number;
}

interface AIGenerationResponse {
  content: string;
  metadata: {
    tokensUsed: number;
    processingTime: number;
    model: string;
    timestamp: Date;
  };
  quality: {
    score: number;
    suggestions: string[];
    warnings: string[];
  };
}

interface AIState {
  isGenerating: boolean;
  isConnected: boolean;
  error: string | null;
  lastGeneration: AIGenerationResponse | null;
  usage: {
    totalRequests: number;
    totalTokens: number;
    averageResponseTime: number;
  };
}

interface AIActions {
  generateScript: (request: AIGenerationRequest) => Promise<AIGenerationResponse>;
  generateContent: (request: AIGenerationRequest) => Promise<AIGenerationResponse>;
  enhanceContent: (content: string, instructions: string) => Promise<AIGenerationResponse>;
  testConnection: () => Promise<boolean>;
  updateConfiguration: (config: Partial<any>) => Promise<void>;
  clearError: () => void;
}

// Singleton instance for efficiency
let geminiAdapter: GeminiAdapter | null = null;

/**
 * Initialize Gemini adapter if not already initialized
 */
function initializeGeminiAdapter() {
  if (!geminiAdapter) {
    try {
      const envConfig = getEnvironmentConfig();
      const aiConfig = envConfig.getAIServiceConfig();
      
      geminiAdapter = new GeminiAdapter(aiConfig);
      logger.info('Gemini adapter initialized');
    } catch (error) {
      logger.error('Failed to initialize Gemini adapter:', error);
      throw error;
    }
  }
  
  return geminiAdapter;
}

/**
 * Create platform-specific prompt enhancement
 */
function enhancePromptForPlatform(
  prompt: string,
  platform?: string,
  tone?: string,
  audience?: string,
  keywords?: string[]
): string {
  let enhancedPrompt = prompt;
  
  if (platform) {
    enhancedPrompt += `\n\nPlatform: ${platform}`;
    
    // Add platform-specific instructions
    switch (platform) {
      case 'YouTube':
        enhancedPrompt += '\nOptimize for YouTube: engaging hook, clear structure, call-to-action.';
        break;
      case 'Instagram':
        enhancedPrompt += '\nOptimize for Instagram: visual storytelling, hashtag-friendly, concise.';
        break;
      case 'TikTok':
        enhancedPrompt += '\nOptimize for TikTok: trending format, quick engagement, viral potential.';
        break;
      case 'LinkedIn':
        enhancedPrompt += '\nOptimize for LinkedIn: professional tone, industry insights, networking focus.';
        break;
      case 'Twitter':
        enhancedPrompt += '\nOptimize for Twitter: concise, thread-friendly, engaging.';
        break;
      case 'Podcast':
        enhancedPrompt += '\nOptimize for Podcast: conversational, audio-friendly, natural flow.';
        break;
    }
  }
  
  if (tone) {
    enhancedPrompt += `\n\nTone: ${tone}`;
  }
  
  if (audience) {
    enhancedPrompt += `\n\nTarget Audience: ${audience}`;
  }
  
  if (keywords && keywords.length > 0) {
    enhancedPrompt += `\n\nKeywords to include: ${keywords.join(', ')}`;
  }
  
  return enhancedPrompt;
}

/**
 * Calculate content quality score
 */
function calculateQualityScore(content: string, request: AIGenerationRequest): {
  score: number;
  suggestions: string[];
  warnings: string[];
} {
  const suggestions: string[] = [];
  const warnings: string[] = [];
  let score = 100;
  
  // Length checks
  if (content.length < 100) {
    score -= 20;
    warnings.push('Content is too short');
  }
  
  if (content.length > 2000) {
    score -= 10;
    suggestions.push('Consider breaking into shorter sections');
  }
  
  // Keyword integration
  if (request.keywords && request.keywords.length > 0) {
    const keywordCount = request.keywords.filter(keyword => 
      content.toLowerCase().includes(keyword.toLowerCase())
    ).length;
    
    if (keywordCount === 0) {
      score -= 15;
      warnings.push('No target keywords found in content');
    } else if (keywordCount < request.keywords.length / 2) {
      score -= 10;
      suggestions.push('Consider including more target keywords');
    }
  }
  
  // Platform-specific checks
  if (request.platform === 'TikTok' && content.length > 500) {
    score -= 10;
    suggestions.push('TikTok content should be more concise');
  }
  
  if (request.platform === 'LinkedIn' && !content.includes('professional')) {
    suggestions.push('Consider adding professional context for LinkedIn');
  }
  
  // Engagement elements
  if (!content.includes('?') && !content.includes('!')) {
    score -= 5;
    suggestions.push('Add questions or exclamations for better engagement');
  }
  
  return {
    score: Math.max(0, Math.min(100, score)),
    suggestions,
    warnings
  };
}

/**
 * Clean Architecture AI Hook
 */
export function useCleanAI(): AIState & AIActions {
  const [state, setState] = useState<AIState>({
    isGenerating: false,
    isConnected: false,
    error: null,
    lastGeneration: null,
    usage: {
      totalRequests: 0,
      totalTokens: 0,
      averageResponseTime: 0
    }
  });

  /**
   * Update AI state
   */
  const updateState = useCallback((updates: Partial<AIState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * Set error state
   */
  const setError = useCallback((error: string | null) => {
    updateState({ error, isGenerating: false });
  }, [updateState]);

  /**
   * Update usage statistics
   */
  const updateUsage = useCallback((tokensUsed: number, responseTime: number) => {
    setState(prev => {
      const newTotalRequests = prev.usage.totalRequests + 1;
      const newTotalTokens = prev.usage.totalTokens + tokensUsed;
      const newAverageResponseTime = (
        (prev.usage.averageResponseTime * prev.usage.totalRequests + responseTime) / 
        newTotalRequests
      );
      
      return {
        ...prev,
        usage: {
          totalRequests: newTotalRequests,
          totalTokens: newTotalTokens,
          averageResponseTime: newAverageResponseTime
        }
      };
    });
  }, []);

  /**
   * Generate script content
   */
  const generateScript = useCallback(async (request: AIGenerationRequest): Promise<AIGenerationResponse> => {
    try {
      updateState({ isGenerating: true, error: null });
      
      const adapter = initializeGeminiAdapter();
      const startTime = Date.now();
      
      // Enhance prompt for script generation
      const enhancedPrompt = enhancePromptForPlatform(
        `Generate a script for the following request: ${request.prompt}`,
        request.platform,
        request.tone,
        request.audience,
        request.keywords
      );
      
      const response = await adapter.generateContent({
        prompt: enhancedPrompt,
        context: request.context,
        maxTokens: request.maxTokens || 1000,
        temperature: request.temperature || 0.7
      });
      
      const processingTime = Date.now() - startTime;
      const quality = calculateQualityScore(response.content, request);
      
      const generationResponse: AIGenerationResponse = {
        content: response.content,
        metadata: {
          tokensUsed: response.tokensUsed || 0,
          processingTime,
          model: response.model || 'gemini-pro',
          timestamp: new Date()
        },
        quality
      };
      
      updateUsage(generationResponse.metadata.tokensUsed, processingTime);
      updateState({ 
        isGenerating: false, 
        lastGeneration: generationResponse 
      });
      
      return generationResponse;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Script generation failed';
      setError(errorMessage);
      throw error;
    }
  }, [updateState, setError, updateUsage]);

  /**
   * Generate general content
   */
  const generateContent = useCallback(async (request: AIGenerationRequest): Promise<AIGenerationResponse> => {
    try {
      updateState({ isGenerating: true, error: null });
      
      const adapter = initializeGeminiAdapter();
      const startTime = Date.now();
      
      const enhancedPrompt = enhancePromptForPlatform(
        request.prompt,
        request.platform,
        request.tone,
        request.audience,
        request.keywords
      );
      
      const response = await adapter.generateContent({
        prompt: enhancedPrompt,
        context: request.context,
        maxTokens: request.maxTokens || 800,
        temperature: request.temperature || 0.7
      });
      
      const processingTime = Date.now() - startTime;
      const quality = calculateQualityScore(response.content, request);
      
      const generationResponse: AIGenerationResponse = {
        content: response.content,
        metadata: {
          tokensUsed: response.tokensUsed || 0,
          processingTime,
          model: response.model || 'gemini-pro',
          timestamp: new Date()
        },
        quality
      };
      
      updateUsage(generationResponse.metadata.tokensUsed, processingTime);
      updateState({ 
        isGenerating: false, 
        lastGeneration: generationResponse 
      });
      
      return generationResponse;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Content generation failed';
      setError(errorMessage);
      throw error;
    }
  }, [updateState, setError, updateUsage]);

  /**
   * Enhance existing content
   */
  const enhanceContent = useCallback(async (content: string, instructions: string): Promise<AIGenerationResponse> => {
    try {
      updateState({ isGenerating: true, error: null });
      
      const adapter = initializeGeminiAdapter();
      const startTime = Date.now();
      
      const prompt = `Enhance the following content according to these instructions: ${instructions}\n\nOriginal content:\n${content}`;
      
      const response = await adapter.enhanceTemplate({
        content,
        instructions,
        preserveStructure: true
      });
      
      const processingTime = Date.now() - startTime;
      
      const generationResponse: AIGenerationResponse = {
        content: response.enhancedContent,
        metadata: {
          tokensUsed: response.tokensUsed || 0,
          processingTime,
          model: response.model || 'gemini-pro',
          timestamp: new Date()
        },
        quality: {
          score: response.qualityScore || 85,
          suggestions: response.suggestions || [],
          warnings: []
        }
      };
      
      updateUsage(generationResponse.metadata.tokensUsed, processingTime);
      updateState({ 
        isGenerating: false, 
        lastGeneration: generationResponse 
      });
      
      return generationResponse;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Content enhancement failed';
      setError(errorMessage);
      throw error;
    }
  }, [updateState, setError, updateUsage]);

  /**
   * Test connection to AI service
   */
  const testConnection = useCallback(async (): Promise<boolean> => {
    try {
      const adapter = initializeGeminiAdapter();
      const health = await adapter.getHealth();
      
      const isConnected = health.status === 'healthy';
      updateState({ isConnected });
      
      return isConnected;
    } catch (error) {
      logger.error('Connection test failed:', error);
      updateState({ isConnected: false });
      return false;
    }
  }, [updateState]);

  /**
   * Update AI configuration
   */
  const updateConfiguration = useCallback(async (config: Partial<any>): Promise<void> => {
    try {
      const adapter = initializeGeminiAdapter();
      await adapter.updateConfiguration(config);
      
      logger.info('AI configuration updated');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Configuration update failed';
      setError(errorMessage);
      throw error;
    }
  }, [setError]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  /**
   * Initialize connection status
   */
  useEffect(() => {
    const checkConnection = async () => {
      try {
        await testConnection();
      } catch (error) {
        logger.warn('Initial connection check failed:', error);
      }
    };
    
    checkConnection();
  }, [testConnection]);

  return {
    ...state,
    generateScript,
    generateContent,
    enhanceContent,
    testConnection,
    updateConfiguration,
    clearError
  };
} 