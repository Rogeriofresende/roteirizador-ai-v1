/**
 * V6.2 Enhanced Framework - Advanced Micro-interactions Service
 * Micro-interações premium com feedback háptico e animações fluidas
 */

import { createLogger } from '../utils/logger';

const logger = createLogger('advancedMicroInteractionsService');

export interface MicroInteraction {
  id: string;
  type: 'haptic' | 'visual' | 'audio' | 'combined';
  trigger: 'click' | 'hover' | 'focus' | 'success' | 'error' | 'loading' | 'gesture';
  intensity: 'subtle' | 'light' | 'medium' | 'strong';
  duration: number;
  pattern?: HapticPattern;
  visual?: VisualEffect;
  audio?: AudioFeedback;
  enabled: boolean;
}

export interface HapticPattern {
  type: 'impact' | 'notification' | 'selection' | 'custom';
  intensity: number; // 0-1
  sharpness?: number; // 0-1
  pattern?: number[]; // Custom vibration pattern [duration, pause, duration, ...]
}

export interface VisualEffect {
  type: 'ripple' | 'glow' | 'bounce' | 'shake' | 'pulse' | 'morph' | 'particle';
  color?: string;
  duration: number;
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'spring' | 'bounce';
  scale?: number;
  opacity?: number;
  blur?: number;
  particleCount?: number;
}

export interface AudioFeedback {
  type: 'tap' | 'success' | 'error' | 'notification' | 'custom';
  volume: number; // 0-1
  pitch?: number; // 0.5-2
  url?: string; // For custom sounds
}

interface InteractionPreset {
  name: string;
  description: string;
  interactions: MicroInteraction[];
}

interface UserPreferences {
  hapticEnabled: boolean;
  visualEnabled: boolean;
  audioEnabled: boolean;
  reducedMotion: boolean;
  intensityMultiplier: number;
}

export class AdvancedMicroInteractionsService {
  private static interactions = new Map<string, MicroInteraction>();
  private static presets = new Map<string, InteractionPreset>();
  private static userPreferences: UserPreferences = {
    hapticEnabled: true,
    visualEnabled: true,
    audioEnabled: true,
    reducedMotion: false,
    intensityMultiplier: 1.0
  };
  private static audioContext: AudioContext | null = null;
  private static audioBuffers = new Map<string, AudioBuffer>();
  private static vibrationSupported = 'vibrate' in navigator;

  /**
   * Interações padrão premium
   */
  private static defaultInteractions: MicroInteraction[] = [
    // Click interactions
    {
      id: 'button_click',
      type: 'combined',
      trigger: 'click',
      intensity: 'light',
      duration: 100,
      pattern: {
        type: 'impact',
        intensity: 0.6,
        sharpness: 0.8
      },
      visual: {
        type: 'ripple',
        duration: 400,
        easing: 'ease-out',
        opacity: 0.3
      },
      audio: {
        type: 'tap',
        volume: 0.2
      },
      enabled: true
    },
    {
      id: 'success_action',
      type: 'combined',
      trigger: 'success',
      intensity: 'medium',
      duration: 300,
      pattern: {
        type: 'notification',
        intensity: 0.8,
        pattern: [50, 50, 50]
      },
      visual: {
        type: 'pulse',
        color: '#4ade80',
        duration: 600,
        easing: 'spring',
        scale: 1.05
      },
      audio: {
        type: 'success',
        volume: 0.3,
        pitch: 1.2
      },
      enabled: true
    },
    {
      id: 'error_feedback',
      type: 'combined',
      trigger: 'error',
      intensity: 'strong',
      duration: 400,
      pattern: {
        type: 'custom',
        intensity: 1.0,
        pattern: [100, 30, 100]
      },
      visual: {
        type: 'shake',
        duration: 500,
        easing: 'ease-in-out',
        scale: 1.02
      },
      audio: {
        type: 'error',
        volume: 0.4,
        pitch: 0.8
      },
      enabled: true
    },
    {
      id: 'hover_enhance',
      type: 'visual',
      trigger: 'hover',
      intensity: 'subtle',
      duration: 200,
      visual: {
        type: 'glow',
        duration: 200,
        easing: 'ease-in-out',
        opacity: 0.8,
        blur: 8
      },
      enabled: true
    },
    {
      id: 'focus_ring',
      type: 'visual',
      trigger: 'focus',
      intensity: 'light',
      duration: 300,
      visual: {
        type: 'morph',
        color: '#3b82f6',
        duration: 300,
        easing: 'spring',
        scale: 1.02,
        opacity: 0.5
      },
      enabled: true
    },
    {
      id: 'loading_pulse',
      type: 'visual',
      trigger: 'loading',
      intensity: 'subtle',
      duration: 1000,
      visual: {
        type: 'pulse',
        duration: 1000,
        easing: 'ease-in-out',
        scale: 1.05,
        opacity: 0.6
      },
      enabled: true
    },
    {
      id: 'gesture_feedback',
      type: 'haptic',
      trigger: 'gesture',
      intensity: 'medium',
      duration: 50,
      pattern: {
        type: 'selection',
        intensity: 0.7
      },
      enabled: true
    }
  ];

  /**
   * Presets de interação
   */
  private static defaultPresets: InteractionPreset[] = [
    {
      name: 'Premium',
      description: 'Experiência completa com todas as interações',
      interactions: this.defaultInteractions
    },
    {
      name: 'Subtle',
      description: 'Interações sutis e elegantes',
      interactions: this.defaultInteractions.map(i => ({
        ...i,
        intensity: 'subtle' as const,
        pattern: i.pattern ? { ...i.pattern, intensity: i.pattern.intensity * 0.5 } : undefined,
        audio: i.audio ? { ...i.audio, volume: i.audio.volume * 0.5 } : undefined
      }))
    },
    {
      name: 'Accessibility',
      description: 'Otimizado para acessibilidade',
      interactions: this.defaultInteractions.filter(i => 
        i.type !== 'visual' || i.visual?.type === 'pulse'
      )
    }
  ];

  /**
   * Inicializa o serviço
   */
  static async initialize(): Promise<void> {
    try {
      // Carregar interações padrão
      this.loadDefaultInteractions();

      // Verificar preferências do sistema
      await this.checkSystemPreferences();

      // Inicializar contexto de áudio
      await this.initializeAudio();

      // Carregar presets
      this.loadPresets();

      logger.info('Micro-interactions inicializadas', {
        hapticSupport: this.vibrationSupported,
        audioEnabled: this.userPreferences.audioEnabled,
        reducedMotion: this.userPreferences.reducedMotion
      });

    } catch (error) {
      logger.error('Erro ao inicializar micro-interactions', error);
    }
  }

  /**
   * Dispara uma micro-interação
   */
  static async trigger(
    interactionId: string,
    element?: HTMLElement,
    customOptions?: Partial<MicroInteraction>
  ): Promise<void> {
    const interaction = this.interactions.get(interactionId);
    if (!interaction || !interaction.enabled) return;

    // Mesclar com opções customizadas
    const finalInteraction = customOptions 
      ? { ...interaction, ...customOptions }
      : interaction;

    // Verificar preferências do usuário
    if (!this.shouldTrigger(finalInteraction)) return;

    try {
      // Executar em paralelo para melhor performance
      const promises: Promise<void>[] = [];

      if (finalInteraction.pattern && this.userPreferences.hapticEnabled) {
        promises.push(this.triggerHaptic(finalInteraction.pattern, finalInteraction.intensity));
      }

      if (finalInteraction.visual && this.userPreferences.visualEnabled && element) {
        promises.push(this.triggerVisual(element, finalInteraction.visual, finalInteraction.intensity));
      }

      if (finalInteraction.audio && this.userPreferences.audioEnabled) {
        promises.push(this.triggerAudio(finalInteraction.audio));
      }

      await Promise.all(promises);

      logger.debug('Interação disparada', { interactionId });

    } catch (error) {
      logger.error('Erro ao disparar interação', error);
    }
  }

  /**
   * Dispara feedback háptico
   */
  private static async triggerHaptic(
    pattern: HapticPattern,
    intensity: MicroInteraction['intensity']
  ): Promise<void> {
    if (!this.vibrationSupported) return;

    const intensityMap = {
      subtle: 0.3,
      light: 0.5,
      medium: 0.7,
      strong: 1.0
    };

    const finalIntensity = pattern.intensity * intensityMap[intensity] * this.userPreferences.intensityMultiplier;

    try {
      switch (pattern.type) {
        case 'impact':
          navigator.vibrate(Math.round(30 * finalIntensity));
          break;

        case 'notification':
          navigator.vibrate([
            Math.round(50 * finalIntensity),
            50,
            Math.round(50 * finalIntensity)
          ]);
          break;

        case 'selection':
          navigator.vibrate(Math.round(10 * finalIntensity));
          break;

        case 'custom':
          if (pattern.pattern) {
            const adjustedPattern = pattern.pattern.map((duration, index) => 
              index % 2 === 0 ? Math.round(duration * finalIntensity) : duration
            );
            navigator.vibrate(adjustedPattern);
          }
          break;
      }
    } catch (error) {
      logger.debug('Vibração não suportada ou falhou', error);
    }
  }

  /**
   * Dispara efeito visual
   */
  private static async triggerVisual(
    element: HTMLElement,
    visual: VisualEffect,
    intensity: MicroInteraction['intensity']
  ): Promise<void> {
    if (this.userPreferences.reducedMotion) return;

    const intensityMultiplier = {
      subtle: 0.5,
      light: 0.7,
      medium: 1.0,
      strong: 1.3
    }[intensity];

    // Criar elemento de efeito
    const effectElement = document.createElement('div');
    effectElement.className = `micro-interaction-${visual.type}`;
    effectElement.style.cssText = `
      position: absolute;
      pointer-events: none;
      z-index: 9999;
    `;

    // Configurar efeito baseado no tipo
    switch (visual.type) {
      case 'ripple':
        await this.createRippleEffect(element, effectElement, visual, intensityMultiplier);
        break;

      case 'glow':
        await this.createGlowEffect(element, effectElement, visual, intensityMultiplier);
        break;

      case 'bounce':
        await this.createBounceEffect(element, visual, intensityMultiplier);
        break;

      case 'shake':
        await this.createShakeEffect(element, visual, intensityMultiplier);
        break;

      case 'pulse':
        await this.createPulseEffect(element, visual, intensityMultiplier);
        break;

      case 'morph':
        await this.createMorphEffect(element, visual, intensityMultiplier);
        break;

      case 'particle':
        await this.createParticleEffect(element, effectElement, visual, intensityMultiplier);
        break;
    }
  }

  /**
   * Efeitos visuais específicos
   */
  private static async createRippleEffect(
    element: HTMLElement,
    effectElement: HTMLElement,
    visual: VisualEffect,
    intensity: number
  ): Promise<void> {
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;

    effectElement.style.cssText += `
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: ${visual.color || 'currentColor'};
      opacity: ${(visual.opacity || 0.3) * intensity};
      transform: translate(-50%, -50%) scale(0);
      transition: transform ${visual.duration}ms ${visual.easing}, opacity ${visual.duration}ms ${visual.easing};
    `;

    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(effectElement);

    // Posicionar no centro do clique
    const clickHandler = (e: MouseEvent) => {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      effectElement.style.left = `${x}px`;
      effectElement.style.top = `${y}px`;
    };

    element.addEventListener('click', clickHandler, { once: true });

    // Animar
    requestAnimationFrame(() => {
      effectElement.style.transform = 'translate(-50%, -50%) scale(1)';
      effectElement.style.opacity = '0';
    });

    // Limpar após animação
    setTimeout(() => {
      effectElement.remove();
    }, visual.duration);
  }

  private static async createGlowEffect(
    element: HTMLElement,
    effectElement: HTMLElement,
    visual: VisualEffect,
    intensity: number
  ): Promise<void> {
    const originalBoxShadow = element.style.boxShadow;
    const color = visual.color || getComputedStyle(element).color;
    
    element.style.transition = `box-shadow ${visual.duration}ms ${visual.easing}`;
    element.style.boxShadow = `0 0 ${(visual.blur || 8) * intensity}px ${color}`;

    setTimeout(() => {
      element.style.boxShadow = originalBoxShadow;
    }, visual.duration);
  }

  private static async createBounceEffect(
    element: HTMLElement,
    visual: VisualEffect,
    intensity: number
  ): Promise<void> {
    const scale = (visual.scale || 1.1) * intensity;
    const originalTransform = element.style.transform;

    element.style.transition = `transform ${visual.duration}ms ${visual.easing}`;
    element.style.transform = `${originalTransform} scale(${scale})`;

    setTimeout(() => {
      element.style.transform = originalTransform;
    }, visual.duration / 2);
  }

  private static async createShakeEffect(
    element: HTMLElement,
    visual: VisualEffect,
    intensity: number
  ): Promise<void> {
    const amplitude = 5 * intensity;
    const originalTransform = element.style.transform;
    const keyframes = [
      { transform: `${originalTransform} translateX(0)` },
      { transform: `${originalTransform} translateX(-${amplitude}px)` },
      { transform: `${originalTransform} translateX(${amplitude}px)` },
      { transform: `${originalTransform} translateX(-${amplitude}px)` },
      { transform: `${originalTransform} translateX(${amplitude}px)` },
      { transform: `${originalTransform} translateX(0)` }
    ];

    element.animate(keyframes, {
      duration: visual.duration,
      easing: visual.easing
    });
  }

  private static async createPulseEffect(
    element: HTMLElement,
    visual: VisualEffect,
    intensity: number
  ): Promise<void> {
    const scale = ((visual.scale || 1.05) - 1) * intensity + 1;
    const originalTransform = element.style.transform;

    const keyframes = [
      { transform: `${originalTransform} scale(1)`, opacity: '1' },
      { transform: `${originalTransform} scale(${scale})`, opacity: String(visual.opacity || 0.8) },
      { transform: `${originalTransform} scale(1)`, opacity: '1' }
    ];

    element.animate(keyframes, {
      duration: visual.duration,
      easing: visual.easing,
      iterations: visual.type === 'pulse' ? Infinity : 1
    });
  }

  private static async createMorphEffect(
    element: HTMLElement,
    visual: VisualEffect,
    intensity: number
  ): Promise<void> {
    const scale = ((visual.scale || 1.02) - 1) * intensity + 1;
    const borderRadius = getComputedStyle(element).borderRadius;
    const newRadius = parseInt(borderRadius) * 1.5;

    const keyframes = [
      { 
        transform: 'scale(1)', 
        borderRadius: borderRadius,
        filter: 'brightness(1)'
      },
      { 
        transform: `scale(${scale})`, 
        borderRadius: `${newRadius}px`,
        filter: `brightness(${1.2 * intensity})`
      },
      { 
        transform: 'scale(1)', 
        borderRadius: borderRadius,
        filter: 'brightness(1)'
      }
    ];

    element.animate(keyframes, {
      duration: visual.duration,
      easing: visual.easing
    });
  }

  private static async createParticleEffect(
    element: HTMLElement,
    effectElement: HTMLElement,
    visual: VisualEffect,
    intensity: number
  ): Promise<void> {
    const rect = element.getBoundingClientRect();
    const particleCount = (visual.particleCount || 10) * intensity;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.style.cssText = `
        position: absolute;
        width: 4px;
        height: 4px;
        background: ${visual.color || 'currentColor'};
        border-radius: 50%;
        pointer-events: none;
        left: 50%;
        top: 50%;
      `;

      effectElement.appendChild(particle);

      // Animar partícula
      const angle = (Math.PI * 2 * i) / particleCount;
      const distance = 50 + Math.random() * 50;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;

      particle.animate([
        { 
          transform: 'translate(-50%, -50%) scale(1)',
          opacity: '1'
        },
        { 
          transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(0)`,
          opacity: '0'
        }
      ], {
        duration: visual.duration,
        easing: visual.easing
      });
    }

    element.appendChild(effectElement);
    setTimeout(() => effectElement.remove(), visual.duration);
  }

  /**
   * Dispara feedback de áudio
   */
  private static async triggerAudio(audio: AudioFeedback): Promise<void> {
    if (!this.audioContext) return;

    try {
      let buffer = this.audioBuffers.get(audio.type);
      
      if (!buffer && audio.url) {
        // Carregar áudio customizado
        buffer = await this.loadAudioBuffer(audio.url);
      }

      if (!buffer) {
        // Gerar som sintético
        buffer = await this.generateSyntheticSound(audio.type);
      }

      if (buffer) {
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();

        source.buffer = buffer;
        source.playbackRate.value = audio.pitch || 1;
        gainNode.gain.value = audio.volume * this.userPreferences.intensityMultiplier;

        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        source.start();
      }

    } catch (error) {
      logger.debug('Erro ao reproduzir áudio', error);
    }
  }

  /**
   * Gera sons sintéticos
   */
  private static async generateSyntheticSound(type: string): Promise<AudioBuffer | null> {
    if (!this.audioContext) return null;

    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.1;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const channel = buffer.getChannelData(0);

    switch (type) {
      case 'tap':
        // Som de toque suave
        for (let i = 0; i < channel.length; i++) {
          const t = i / sampleRate;
          channel[i] = Math.sin(2 * Math.PI * 800 * t) * Math.exp(-t * 30);
        }
        break;

      case 'success':
        // Som ascendente de sucesso
        for (let i = 0; i < channel.length; i++) {
          const t = i / sampleRate;
          const freq = 400 + (t * 800);
          channel[i] = Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 10);
        }
        break;

      case 'error':
        // Som descendente de erro
        for (let i = 0; i < channel.length; i++) {
          const t = i / sampleRate;
          const freq = 600 - (t * 400);
          channel[i] = Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 15);
        }
        break;

      case 'notification':
        // Som de notificação
        for (let i = 0; i < channel.length; i++) {
          const t = i / sampleRate;
          const envelope = Math.sin(Math.PI * t / duration);
          channel[i] = Math.sin(2 * Math.PI * 1000 * t) * envelope * 0.3;
        }
        break;
    }

    this.audioBuffers.set(type, buffer);
    return buffer;
  }

  /**
   * Configurações e preferências
   */
  static updatePreferences(preferences: Partial<UserPreferences>): void {
    this.userPreferences = {
      ...this.userPreferences,
      ...preferences
    };

    // Salvar no localStorage
    localStorage.setItem('microInteractionPrefs', JSON.stringify(this.userPreferences));

    logger.info('Preferências atualizadas', preferences);
  }

  static getPreferences(): UserPreferences {
    return { ...this.userPreferences };
  }

  static setPreset(presetName: string): void {
    const preset = this.presets.get(presetName);
    if (!preset) return;

    // Limpar interações atuais
    this.interactions.clear();

    // Carregar interações do preset
    preset.interactions.forEach(interaction => {
      this.interactions.set(interaction.id, { ...interaction });
    });

    logger.info('Preset aplicado', { presetName });
  }

  /**
   * Métodos auxiliares
   */
  private static loadDefaultInteractions(): void {
    this.defaultInteractions.forEach(interaction => {
      this.interactions.set(interaction.id, { ...interaction });
    });
  }

  private static async checkSystemPreferences(): Promise<void> {
    // Verificar preferência de movimento reduzido
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.userPreferences.reducedMotion = true;
      this.userPreferences.visualEnabled = false;
    }

    // Carregar preferências salvas
    const saved = localStorage.getItem('microInteractionPrefs');
    if (saved) {
      try {
        const prefs = JSON.parse(saved);
        this.userPreferences = { ...this.userPreferences, ...prefs };
      } catch (error) {
        logger.debug('Erro ao carregar preferências', error);
      }
    }
  }

  private static async initializeAudio(): Promise<void> {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Garantir que o contexto está ativo
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
    } catch (error) {
      logger.debug('AudioContext não disponível', error);
      this.userPreferences.audioEnabled = false;
    }
  }

  private static async loadAudioBuffer(url: string): Promise<AudioBuffer | null> {
    if (!this.audioContext) return null;

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      return audioBuffer;
    } catch (error) {
      logger.error('Erro ao carregar áudio', error);
      return null;
    }
  }

  private static loadPresets(): void {
    this.defaultPresets.forEach(preset => {
      this.presets.set(preset.name, preset);
    });
  }

  private static shouldTrigger(interaction: MicroInteraction): boolean {
    // Verificar se o tipo de interação está habilitado
    switch (interaction.type) {
      case 'haptic':
        return this.userPreferences.hapticEnabled;
      case 'visual':
        return this.userPreferences.visualEnabled && !this.userPreferences.reducedMotion;
      case 'audio':
        return this.userPreferences.audioEnabled;
      case 'combined':
        return true; // Pelo menos um tipo será executado
      default:
        return false;
    }
  }

  /**
   * Registra interação customizada
   */
  static registerInteraction(interaction: MicroInteraction): void {
    this.interactions.set(interaction.id, interaction);
    logger.debug('Interação registrada', { id: interaction.id });
  }

  /**
   * Remove interação
   */
  static unregisterInteraction(interactionId: string): void {
    this.interactions.delete(interactionId);
    logger.debug('Interação removida', { id: interactionId });
  }

  /**
   * Obtém todas as interações
   */
  static getAllInteractions(): MicroInteraction[] {
    return Array.from(this.interactions.values());
  }

  /**
   * Obtém interação específica
   */
  static getInteraction(interactionId: string): MicroInteraction | undefined {
    return this.interactions.get(interactionId);
  }

  /**
   * Cleanup
   */
  static cleanup(): void {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.audioBuffers.clear();
    logger.info('Micro-interactions cleanup executado');
  }
} 