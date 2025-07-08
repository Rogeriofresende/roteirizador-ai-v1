/**
 * V6.2 Enhanced Framework - Advanced Micro-interactions Hook
 * Hook para facilitar o uso de micro-interações premium nos componentes
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { AdvancedMicroInteractionsService, MicroInteraction, HapticPattern, VisualEffect, AudioFeedback } from '../services/advancedMicroInteractionsService';
import { createLogger } from '../utils/logger';

const logger = createLogger('useAdvancedMicroInteractions');

export interface MicroInteractionOptions {
  immediate?: boolean;
  customPattern?: HapticPattern;
  customVisual?: VisualEffect;
  customAudio?: AudioFeedback;
  intensity?: MicroInteraction['intensity'];
  disabled?: boolean;
}

export interface BindInteractionOptions extends MicroInteractionOptions {
  interactionId: string;
  trigger?: MicroInteraction['trigger'];
}

export interface UseAdvancedMicroInteractionsReturn {
  trigger: (interactionId: string, options?: MicroInteractionOptions) => Promise<void>;
  bindInteraction: (options: BindInteractionOptions) => {
    ref: (element: HTMLElement | null) => void;
    props: Record<string, any>;
  };
  registerCustomInteraction: (interaction: MicroInteraction) => void;
  updatePreferences: (preferences: any) => void;
  getPreferences: () => any;
  setPreset: (presetName: string) => void;
  createRipple: (event: React.MouseEvent) => Promise<void>;
  createGlow: (element: HTMLElement | null, duration?: number) => Promise<void>;
  createBounce: (element: HTMLElement | null) => Promise<void>;
  createSuccess: (element?: HTMLElement | null) => Promise<void>;
  createError: (element?: HTMLElement | null) => Promise<void>;
  vibratePattern: (pattern: number | number[]) => void;
  playSound: (type: AudioFeedback['type'], volume?: number) => Promise<void>;
}

export function useAdvancedMicroInteractions(): UseAdvancedMicroInteractionsReturn {
  const elementsRef = useRef<Map<string, HTMLElement>>(new Map());
  const [initialized, setInitialized] = useState(false);

  // Inicializar serviço
  useEffect(() => {
    const init = async () => {
      if (!initialized) {
        await AdvancedMicroInteractionsService.initialize();
        setInitialized(true);
        logger.debug('Micro-interactions hook inicializado');
      }
    };

    init();

    return () => {
      // Cleanup não é necessário pois o serviço é singleton
    };
  }, [initialized]);

  /**
   * Dispara uma interação pelo ID
   */
  const trigger = useCallback(async (
    interactionId: string,
    options?: MicroInteractionOptions
  ): Promise<void> => {
    if (!initialized || options?.disabled) return;

    const element = elementsRef.current.get(interactionId) || undefined;

    try {
      await AdvancedMicroInteractionsService.trigger(
        interactionId,
        element,
        {
          pattern: options?.customPattern,
          visual: options?.customVisual,
          audio: options?.customAudio,
          intensity: options?.intensity
        }
      );
    } catch (error) {
      logger.error('Erro ao disparar interação', error);
    }
  }, [initialized]);

  /**
   * Vincula uma interação a um elemento
   */
  const bindInteraction = useCallback((options: BindInteractionOptions) => {
    const { interactionId, trigger: triggerType = 'click', disabled, ...interactionOptions } = options;

    const elementRef = (element: HTMLElement | null) => {
      if (element) {
        elementsRef.current.set(interactionId, element);
      } else {
        elementsRef.current.delete(interactionId);
      }
    };

    const eventHandlers: Record<string, any> = {};

    if (!disabled) {
      switch (triggerType) {
        case 'click':
          eventHandlers.onClick = async (e: React.MouseEvent) => {
            await trigger(interactionId, { ...interactionOptions, immediate: true });
          };
          break;

        case 'hover':
          eventHandlers.onMouseEnter = async () => {
            await trigger(interactionId, interactionOptions);
          };
          break;

        case 'focus':
          eventHandlers.onFocus = async () => {
            await trigger(interactionId, interactionOptions);
          };
          break;
      }
    }

    return {
      ref: elementRef,
      props: eventHandlers
    };
  }, [trigger]);

  /**
   * Registra uma interação customizada
   */
  const registerCustomInteraction = useCallback((interaction: MicroInteraction) => {
    AdvancedMicroInteractionsService.registerInteraction(interaction);
    logger.debug('Interação customizada registrada', { id: interaction.id });
  }, []);

  /**
   * Atualiza preferências do usuário
   */
  const updatePreferences = useCallback((preferences: any) => {
    AdvancedMicroInteractionsService.updatePreferences(preferences);
  }, []);

  /**
   * Obtém preferências atuais
   */
  const getPreferences = useCallback(() => {
    return AdvancedMicroInteractionsService.getPreferences();
  }, []);

  /**
   * Define um preset
   */
  const setPreset = useCallback((presetName: string) => {
    AdvancedMicroInteractionsService.setPreset(presetName);
  }, []);

  /**
   * Helpers para efeitos comuns
   */
  
  // Cria efeito ripple no ponto do clique
  const createRipple = useCallback(async (event: React.MouseEvent) => {
    if (!initialized) return;

    const element = event.currentTarget as HTMLElement;
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Criar interação temporária com posição customizada
    const tempId = `ripple_${Date.now()}`;
    registerCustomInteraction({
      id: tempId,
      type: 'visual',
      trigger: 'click',
      intensity: 'light',
      duration: 400,
      visual: {
        type: 'ripple',
        duration: 400,
        easing: 'ease-out',
        opacity: 0.3
      },
      enabled: true
    });

    // Configurar posição do ripple
    element.style.position = 'relative';
    element.style.overflow = 'hidden';

    await trigger(tempId, { immediate: true });

    // Limpar interação temporária
    setTimeout(() => {
      AdvancedMicroInteractionsService.unregisterInteraction(tempId);
    }, 500);
  }, [initialized, registerCustomInteraction, trigger]);

  // Cria efeito de glow
  const createGlow = useCallback(async (
    element: HTMLElement | null,
    duration: number = 300
  ) => {
    if (!initialized || !element) return;

    const tempId = `glow_${Date.now()}`;
    elementsRef.current.set(tempId, element);

    registerCustomInteraction({
      id: tempId,
      type: 'visual',
      trigger: 'hover',
      intensity: 'medium',
      duration,
      visual: {
        type: 'glow',
        duration,
        easing: 'ease-in-out',
        blur: 12,
        opacity: 0.8
      },
      enabled: true
    });

    await trigger(tempId);

    setTimeout(() => {
      AdvancedMicroInteractionsService.unregisterInteraction(tempId);
      elementsRef.current.delete(tempId);
    }, duration + 100);
  }, [initialized, registerCustomInteraction, trigger]);

  // Cria efeito de bounce
  const createBounce = useCallback(async (element: HTMLElement | null) => {
    if (!initialized || !element) return;

    const tempId = `bounce_${Date.now()}`;
    elementsRef.current.set(tempId, element);

    registerCustomInteraction({
      id: tempId,
      type: 'visual',
      trigger: 'click',
      intensity: 'medium',
      duration: 300,
      visual: {
        type: 'bounce',
        duration: 300,
        easing: 'spring',
        scale: 1.1
      },
      enabled: true
    });

    await trigger(tempId);

    setTimeout(() => {
      AdvancedMicroInteractionsService.unregisterInteraction(tempId);
      elementsRef.current.delete(tempId);
    }, 400);
  }, [initialized, registerCustomInteraction, trigger]);

  // Cria feedback de sucesso
  const createSuccess = useCallback(async (element?: HTMLElement | null) => {
    if (!initialized) return;

    await trigger('success_action', { immediate: true });

    if (element) {
      const tempId = `success_visual_${Date.now()}`;
      elementsRef.current.set(tempId, element);

      registerCustomInteraction({
        id: tempId,
        type: 'visual',
        trigger: 'success',
        intensity: 'medium',
        duration: 600,
        visual: {
          type: 'pulse',
          color: '#4ade80',
          duration: 600,
          easing: 'spring',
          scale: 1.05
        },
        enabled: true
      });

      await trigger(tempId);

      setTimeout(() => {
        AdvancedMicroInteractionsService.unregisterInteraction(tempId);
        elementsRef.current.delete(tempId);
      }, 700);
    }
  }, [initialized, registerCustomInteraction, trigger]);

  // Cria feedback de erro
  const createError = useCallback(async (element?: HTMLElement | null) => {
    if (!initialized) return;

    await trigger('error_feedback', { immediate: true });

    if (element) {
      const tempId = `error_visual_${Date.now()}`;
      elementsRef.current.set(tempId, element);

      registerCustomInteraction({
        id: tempId,
        type: 'visual',
        trigger: 'error',
        intensity: 'strong',
        duration: 500,
        visual: {
          type: 'shake',
          duration: 500,
          easing: 'ease-in-out',
          scale: 1.02
        },
        enabled: true
      });

      await trigger(tempId);

      setTimeout(() => {
        AdvancedMicroInteractionsService.unregisterInteraction(tempId);
        elementsRef.current.delete(tempId);
      }, 600);
    }
  }, [initialized, registerCustomInteraction, trigger]);

  // Vibração customizada
  const vibratePattern = useCallback((pattern: number | number[]) => {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (error) {
        logger.debug('Vibração não suportada', error);
      }
    }
  }, []);

  // Reproduzir som
  const playSound = useCallback(async (
    type: AudioFeedback['type'],
    volume: number = 0.5
  ) => {
    if (!initialized) return;

    const tempId = `sound_${Date.now()}`;
    
    registerCustomInteraction({
      id: tempId,
      type: 'audio',
      trigger: 'click',
      intensity: 'medium',
      duration: 100,
      audio: {
        type,
        volume
      },
      enabled: true
    });

    await trigger(tempId);

    setTimeout(() => {
      AdvancedMicroInteractionsService.unregisterInteraction(tempId);
    }, 200);
  }, [initialized, registerCustomInteraction, trigger]);

  return {
    trigger,
    bindInteraction,
    registerCustomInteraction,
    updatePreferences,
    getPreferences,
    setPreset,
    createRipple,
    createGlow,
    createBounce,
    createSuccess,
    createError,
    vibratePattern,
    playSound
  };
}

/**
 * Hook para vincular rapidamente interações comuns
 */
export function useInteractionButton(
  options: Partial<BindInteractionOptions> = {}
) {
  const { bindInteraction } = useAdvancedMicroInteractions();

  return bindInteraction({
    interactionId: 'button_click',
    trigger: 'click',
    ...options
  });
}

export function useInteractionHover(
  element: HTMLElement | null,
  options: MicroInteractionOptions = {}
) {
  const { trigger } = useAdvancedMicroInteractions();

  useEffect(() => {
    if (!element || options.disabled) return;

    const handleMouseEnter = () => {
      trigger('hover_enhance', options);
    };

    element.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [element, options, trigger]);
}

export function useInteractionFocus(
  element: HTMLElement | null,
  options: MicroInteractionOptions = {}
) {
  const { trigger } = useAdvancedMicroInteractions();

  useEffect(() => {
    if (!element || options.disabled) return;

    const handleFocus = () => {
      trigger('focus_ring', options);
    };

    element.addEventListener('focus', handleFocus);

    return () => {
      element.removeEventListener('focus', handleFocus);
    };
  }, [element, options, trigger]);
} 