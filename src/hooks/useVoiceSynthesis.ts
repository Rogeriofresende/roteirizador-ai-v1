/**
 * V6.2 Enhanced Framework - useVoiceSynthesis Hook
 * Hook para síntese de voz integrada
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { VoiceSynthesisService } from '../services/voiceSynthesisService';
import { useAuth } from '../contexts/AuthContext';
import { createLogger } from '../utils/logger';

const logger = createLogger('useVoiceSynthesis');

interface VoiceSynthesisState {
  isInitialized: boolean;
  isSpeaking: boolean;
  isPaused: boolean;
  isLoading: boolean;
  selectedVoice: string | null;
  availableVoices: Array<{
    id: string;
    name: string;
    language: string;
    gender: string;
    isPremium: boolean;
  }>;
  currentText: string | null;
  error: string | null;
  settings: {
    rate: number;
    pitch: number;
    volume: number;
  };
}

interface UseVoiceSynthesisOptions {
  autoInitialize?: boolean;
  defaultVoice?: string;
  defaultLanguage?: string;
  onSpeechEnd?: () => void;
  onSpeechError?: (error: string) => void;
}

export const useVoiceSynthesis = (options: UseVoiceSynthesisOptions = {}) => {
  const { user } = useAuth();
  const [state, setState] = useState<VoiceSynthesisState>({
    isInitialized: false,
    isSpeaking: false,
    isPaused: false,
    isLoading: false,
    selectedVoice: options.defaultVoice || null,
    availableVoices: [],
    currentText: null,
    error: null,
    settings: {
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0
    }
  });

  const projectIdRef = useRef<string>('default');
  const speakingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Inicializar serviço
  useEffect(() => {
    if (options.autoInitialize !== false) {
      initialize();
    }

    return () => {
      if (speakingTimeoutRef.current) {
        clearTimeout(speakingTimeoutRef.current);
      }
    };
  }, []);

  // Monitorar estado de fala
  useEffect(() => {
    const checkSpeaking = () => {
      const isSpeaking = VoiceSynthesisService.isSpeaking();
      const isPaused = VoiceSynthesisService.isPaused();
      
      setState(prev => {
        if (prev.isSpeaking !== isSpeaking || prev.isPaused !== isPaused) {
          return { ...prev, isSpeaking, isPaused };
        }
        return prev;
      });

      if (isSpeaking && !isPaused) {
        speakingTimeoutRef.current = setTimeout(checkSpeaking, 100);
      } else if (!isSpeaking && options.onSpeechEnd) {
        options.onSpeechEnd();
      }
    };

    if (state.isSpeaking) {
      checkSpeaking();
    }

    return () => {
      if (speakingTimeoutRef.current) {
        clearTimeout(speakingTimeoutRef.current);
      }
    };
  }, [state.isSpeaking, options.onSpeechEnd]);

  // Inicializar voice synthesis
  const initialize = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      await VoiceSynthesisService.initialize();
      const voices = VoiceSynthesisService.getAvailableVoices(options.defaultLanguage);

      const formattedVoices = voices.map(v => ({
        id: v.id,
        name: v.displayName,
        language: v.language,
        gender: v.gender,
        isPremium: v.isPremium
      }));

      setState(prev => ({
        ...prev,
        isInitialized: true,
        isLoading: false,
        availableVoices: formattedVoices,
        selectedVoice: prev.selectedVoice || formattedVoices[0]?.id || null
      }));

      logger.info('Voice synthesis inicializado', { 
        voicesCount: formattedVoices.length 
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao inicializar';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      logger.error('Erro ao inicializar voice synthesis', error);
    }
  }, [options.defaultLanguage]);

  // Sintetizar texto
  const speak = useCallback(async (text: string, voiceId?: string) => {
    if (!state.isInitialized) {
      await initialize();
    }

    if (!user?.uid) {
      setState(prev => ({ ...prev, error: 'Usuário não autenticado' }));
      return;
    }

    const selectedVoiceId = voiceId || state.selectedVoice;
    if (!selectedVoiceId) {
      setState(prev => ({ ...prev, error: 'Nenhuma voz selecionada' }));
      return;
    }

    try {
      setState(prev => ({
        ...prev,
        isLoading: true,
        error: null,
        currentText: text
      }));

      // Parar fala anterior se existir
      if (state.isSpeaking) {
        VoiceSynthesisService.stop();
      }

      const synthesis = await VoiceSynthesisService.synthesizeText(
        projectIdRef.current,
        user.uid,
        text,
        selectedVoiceId,
        {
          rate: state.settings.rate,
          pitch: state.settings.pitch,
          volume: state.settings.volume
        }
      );

      setState(prev => ({
        ...prev,
        isLoading: false,
        isSpeaking: true,
        isPaused: false
      }));

      logger.info('Síntese iniciada', { 
        textLength: text.length,
        voiceId: selectedVoiceId
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro na síntese';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      
      if (options.onSpeechError) {
        options.onSpeechError(errorMessage);
      }
      
      logger.error('Erro na síntese de voz', error);
    }
  }, [state.isInitialized, state.selectedVoice, state.settings, user?.uid, initialize]);

  // Pausar fala
  const pause = useCallback(() => {
    if (state.isSpeaking && !state.isPaused) {
      VoiceSynthesisService.pause();
      setState(prev => ({ ...prev, isPaused: true }));
      logger.debug('Fala pausada');
    }
  }, [state.isSpeaking, state.isPaused]);

  // Retomar fala
  const resume = useCallback(() => {
    if (state.isSpeaking && state.isPaused) {
      VoiceSynthesisService.resume();
      setState(prev => ({ ...prev, isPaused: false }));
      logger.debug('Fala retomada');
    }
  }, [state.isSpeaking, state.isPaused]);

  // Parar fala
  const stop = useCallback(() => {
    if (state.isSpeaking) {
      VoiceSynthesisService.stop();
      setState(prev => ({
        ...prev,
        isSpeaking: false,
        isPaused: false,
        currentText: null
      }));
      logger.debug('Fala parada');
    }
  }, [state.isSpeaking]);

  // Selecionar voz
  const selectVoice = useCallback((voiceId: string) => {
    setState(prev => ({ ...prev, selectedVoice: voiceId }));
    logger.debug('Voz selecionada', { voiceId });
  }, []);

  // Atualizar configurações
  const updateSettings = useCallback((settings: Partial<VoiceSynthesisState['settings']>) => {
    setState(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...settings
      }
    }));
    logger.debug('Configurações atualizadas', settings);
  }, []);

  // Preview de voz
  const previewVoice = useCallback(async (voiceId: string, sampleText?: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      await VoiceSynthesisService.previewVoice(voiceId, sampleText);

      setState(prev => ({ ...prev, isLoading: false }));
      logger.info('Preview de voz executado', { voiceId });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro no preview';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      logger.error('Erro no preview de voz', error);
    }
  }, []);

  // Obter vozes por idioma
  const getVoicesByLanguage = useCallback((language: string) => {
    return state.availableVoices.filter(voice => 
      voice.language.startsWith(language) || voice.language.includes(language)
    );
  }, [state.availableVoices]);

  // Obter histórico de sínteses
  const getSynthesisHistory = useCallback(async (limit: number = 20) => {
    if (!user?.uid) return [];

    try {
      const history = await VoiceSynthesisService.getUserSyntheses(user.uid, limit);
      return history;
    } catch (error) {
      logger.error('Erro ao obter histórico', error);
      return [];
    }
  }, [user?.uid]);

  // Verificar suporte
  const checkSupport = useCallback(() => {
    return VoiceSynthesisService.isSupported();
  }, []);

  return {
    // Estado
    isInitialized: state.isInitialized,
    isSpeaking: state.isSpeaking,
    isPaused: state.isPaused,
    isLoading: state.isLoading,
    error: state.error,
    
    // Vozes
    availableVoices: state.availableVoices,
    selectedVoice: state.selectedVoice,
    currentText: state.currentText,
    
    // Configurações
    settings: state.settings,
    
    // Ações principais
    speak,
    pause,
    resume,
    stop,
    
    // Ações auxiliares
    initialize,
    selectVoice,
    updateSettings,
    previewVoice,
    
    // Utilidades
    getVoicesByLanguage,
    getSynthesisHistory,
    checkSupport,
    
    // Estados derivados
    canSpeak: state.isInitialized && !state.isLoading && !state.isSpeaking,
    canPause: state.isSpeaking && !state.isPaused,
    canResume: state.isSpeaking && state.isPaused,
    canStop: state.isSpeaking,
    hasError: !!state.error,
    isReady: state.isInitialized && !state.isLoading
  };
};

/**
 * Hook para controles de acessibilidade com voz
 */
export const useAccessibleVoice = () => {
  const [isEnabled, setIsEnabled] = useState(() => {
    const stored = localStorage.getItem('accessible_voice_enabled');
    return stored === 'true';
  });

  const voice = useVoiceSynthesis({
    autoInitialize: isEnabled,
    defaultLanguage: 'pt-BR',
    onSpeechEnd: () => {
      logger.debug('Leitura acessível concluída');
    }
  });

  // Habilitar/desabilitar voz acessível
  const toggleAccessibleVoice = useCallback(() => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    localStorage.setItem('accessible_voice_enabled', String(newState));
    
    if (newState && !voice.isInitialized) {
      voice.initialize();
    } else if (!newState && voice.isSpeaking) {
      voice.stop();
    }
    
    logger.info('Voz acessível', { enabled: newState });
  }, [isEnabled, voice]);

  // Ler elemento focado
  const readFocusedElement = useCallback(() => {
    if (!isEnabled || !voice.isReady) return;

    const focused = document.activeElement;
    if (!focused) return;

    let text = '';
    
    // Extrair texto baseado no tipo de elemento
    if (focused.getAttribute('aria-label')) {
      text = focused.getAttribute('aria-label') || '';
    } else if (focused.textContent) {
      text = focused.textContent.trim();
    } else if ((focused as HTMLInputElement).value) {
      text = `Campo de entrada com valor: ${(focused as HTMLInputElement).value}`;
    }

    if (text) {
      voice.speak(text);
    }
  }, [isEnabled, voice]);

  // Ler notificação
  const readNotification = useCallback((message: string, priority: 'low' | 'medium' | 'high' = 'medium') => {
    if (!isEnabled || !voice.isReady) return;

    // Interromper fala atual se prioridade alta
    if (priority === 'high' && voice.isSpeaking) {
      voice.stop();
    }

    // Aguardar um pouco se necessário
    setTimeout(() => {
      voice.speak(message);
    }, priority === 'high' ? 0 : 100);
  }, [isEnabled, voice]);

  // Setup de listeners
  useEffect(() => {
    if (!isEnabled) return;

    const handleFocus = (e: FocusEvent) => {
      if (e.target instanceof HTMLElement) {
        readFocusedElement();
      }
    };

    document.addEventListener('focus', handleFocus, true);
    
    return () => {
      document.removeEventListener('focus', handleFocus, true);
    };
  }, [isEnabled, readFocusedElement]);

  return {
    ...voice,
    isAccessibleVoiceEnabled: isEnabled,
    toggleAccessibleVoice,
    readFocusedElement,
    readNotification
  };
}; 