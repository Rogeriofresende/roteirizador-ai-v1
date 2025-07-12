/**
 * useScriptGeneration Hook - Modern Script Generation
 * IA Beta - Week 5 - Feature-based Organization
 */

import { useState, useCallback, useMemo } from 'react';
import { container } from '../../../services/container/DIContainer';
import type { ScriptFormData, GeneratedScript, AIServiceConfig } from '../types/script.types';

interface ScriptGenerationState {
  isGenerating: boolean;
  currentScript: GeneratedScript | null;
  history: GeneratedScript[];
  error: string | null;
  progress: number;
}

/**
 * Modern useScriptGeneration hook with DI container integration
 */
export function useScriptGeneration() {
  const [state, setState] = useState<ScriptGenerationState>({
    isGenerating: false,
    currentScript: null,
    history: [],
    error: null,
    progress: 0
  });

  // Get services from DI container
  const geminiService = useMemo(() => container.get('geminiService'), []);
  const analyticsService = useMemo(() => container.get('analyticsService'), []);

  const generateScript = useCallback(async (formData: ScriptFormData) => {
    setState(prev => ({ 
      ...prev, 
      isGenerating: true, 
      error: null,
      progress: 0 
    }));

    try {
      // Track generation start
      analyticsService.trackUserAction('script_generation_started', {
        platform: formData.platform,
        tone: formData.tone,
        audience: formData.audience
      });

      // Update progress
      setState(prev => ({ ...prev, progress: 25 }));

      // Generate script using Gemini service
      const script = await geminiService.generateScript(formData);
      
      setState(prev => ({ ...prev, progress: 75 }));

      // Create script object
      const generatedScript: GeneratedScript = {
        id: crypto.randomUUID(),
        content: script.content,
        title: script.title || formData.topic,
        metadata: {
          wordCount: script.content.split(' ').length,
          readingTime: Math.ceil(script.content.split(' ').length / 200),
          qualityScore: 85, // TODO: implement quality scoring
          seoScore: 80,     // TODO: implement SEO scoring
          engagementPrediction: 75
        },
        analytics: {
          views: 0,
          likes: 0,
          shares: 0,
          comments: 0,
          conversionRate: 0
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setState(prev => ({
        ...prev,
        isGenerating: false,
        currentScript: generatedScript,
        history: [generatedScript, ...prev.history],
        progress: 100
      }));

      // Track successful generation
      analyticsService.trackUserAction('script_generation_completed', {
        scriptId: generatedScript.id,
        wordCount: generatedScript.metadata.wordCount,
        platform: formData.platform
      });

      return generatedScript;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro na geração do script';
      
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: errorMessage,
        progress: 0
      }));

      // Track generation error
      analyticsService.trackError(error as Error, {
        context: 'script_generation',
        formData
      });

      throw error;
    }
  }, [geminiService, analyticsService]);

  const regenerateScript = useCallback(async (formData: ScriptFormData) => {
    return generateScript(formData);
  }, [generateScript]);

  const saveScript = useCallback(async (script: GeneratedScript) => {
    // TODO: Implement script saving to backend
    analyticsService.trackUserAction('script_saved', {
      scriptId: script.id,
      wordCount: script.metadata.wordCount
    });
  }, [analyticsService]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const clearHistory = useCallback(() => {
    setState(prev => ({ ...prev, history: [] }));
  }, []);

  return {
    // State
    isGenerating: state.isGenerating,
    currentScript: state.currentScript,
    history: state.history,
    error: state.error,
    progress: state.progress,
    
    // Actions
    generateScript,
    regenerateScript,
    saveScript,
    clearError,
    clearHistory
  };
}