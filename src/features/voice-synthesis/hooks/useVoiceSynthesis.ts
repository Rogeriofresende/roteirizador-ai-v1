/**
 * useVoiceSynthesis Hook - Modern Voice Synthesis
 * IA Beta - Week 5 - Feature-based Organization
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { container } from '../../../services/container/DIContainer';
import type { VoiceConfig, VoiceOption, AudioGeneration, VoiceSynthesisState } from '../types/voice.types';

/**
 * Modern useVoiceSynthesis hook with DI container integration
 */
export function useVoiceSynthesis() {
  const [state, setState] = useState<VoiceSynthesisState>({
    voices: [],
    selectedVoice: null,
    isGenerating: false,
    generationProgress: 0,
    audioUrl: null,
    error: null
  });

  // Get services from DI container
  const voiceService = useMemo(() => container.get('voiceService'), []);
  const analyticsService = useMemo(() => container.get('analyticsService'), []);

  // Load available voices on mount
  useEffect(() => {
    const loadVoices = async () => {
      try {
        const voices = await voiceService.getAvailableVoices();
        setState(prev => ({ ...prev, voices }));
      } catch (error) {
        setState(prev => ({ 
          ...prev, 
          error: 'Erro ao carregar vozes disponíveis' 
        }));
      }
    };

    loadVoices();
  }, [voiceService]);

  const selectVoice = useCallback((voiceConfig: VoiceConfig) => {
    setState(prev => ({ ...prev, selectedVoice: voiceConfig }));
    
    analyticsService.trackUserAction('voice_selected', {
      voice: voiceConfig.voice,
      language: voiceConfig.language,
      gender: voiceConfig.gender
    });
  }, [analyticsService]);

  const generateAudio = useCallback(async (text: string, voiceConfig?: VoiceConfig) => {
    const configToUse = voiceConfig || state.selectedVoice;
    
    if (!configToUse) {
      throw new Error('Nenhuma voz selecionada');
    }

    setState(prev => ({ 
      ...prev, 
      isGenerating: true, 
      generationProgress: 0,
      error: null,
      audioUrl: null
    }));

    try {
      // Track generation start
      analyticsService.trackUserAction('voice_generation_started', {
        voice: configToUse.voice,
        textLength: text.length,
        language: configToUse.language
      });

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setState(prev => ({
          ...prev,
          generationProgress: Math.min(prev.generationProgress + 10, 90)
        }));
      }, 200);

      // Generate audio using voice service
      const audioGeneration = await voiceService.generateAudio(text, configToUse);
      
      clearInterval(progressInterval);

      setState(prev => ({
        ...prev,
        isGenerating: false,
        generationProgress: 100,
        audioUrl: audioGeneration.audioUrl
      }));

      // Track successful generation
      analyticsService.trackUserAction('voice_generation_completed', {
        audioId: audioGeneration.id,
        duration: audioGeneration.duration,
        voice: configToUse.voice
      });

      return audioGeneration;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro na síntese de voz';
      
      setState(prev => ({
        ...prev,
        isGenerating: false,
        generationProgress: 0,
        error: errorMessage
      }));

      // Track generation error
      analyticsService.trackError(error as Error, {
        context: 'voice_synthesis',
        voiceConfig: configToUse
      });

      throw error;
    }
  }, [state.selectedVoice, voiceService, analyticsService]);

  const previewVoice = useCallback(async (voiceOption: VoiceOption) => {
    try {
      const previewAudio = await voiceService.previewVoice(voiceOption);
      
      analyticsService.trackUserAction('voice_previewed', {
        voice: voiceOption.name,
        language: voiceOption.language
      });

      return previewAudio;
    } catch (error) {
      analyticsService.trackError(error as Error, {
        context: 'voice_preview',
        voiceOption
      });
      throw error;
    }
  }, [voiceService, analyticsService]);

  const clearAudio = useCallback(() => {
    setState(prev => ({ ...prev, audioUrl: null, generationProgress: 0 }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Helper computed values
  const canGenerate = useMemo(() => {
    return state.selectedVoice && !state.isGenerating;
  }, [state.selectedVoice, state.isGenerating]);

  const availableLanguages = useMemo(() => {
    return [...new Set(state.voices.map(voice => voice.language))];
  }, [state.voices]);

  const voicesByLanguage = useMemo(() => {
    return state.voices.reduce((acc, voice) => {
      if (!acc[voice.language]) {
        acc[voice.language] = [];
      }
      acc[voice.language].push(voice);
      return acc;
    }, {} as Record<string, VoiceOption[]>);
  }, [state.voices]);

  return {
    // State
    voices: state.voices,
    selectedVoice: state.selectedVoice,
    isGenerating: state.isGenerating,
    generationProgress: state.generationProgress,
    audioUrl: state.audioUrl,
    error: state.error,
    
    // Computed
    canGenerate,
    availableLanguages,
    voicesByLanguage,
    
    // Actions
    selectVoice,
    generateAudio,
    previewVoice,
    clearAudio,
    clearError
  };
} 