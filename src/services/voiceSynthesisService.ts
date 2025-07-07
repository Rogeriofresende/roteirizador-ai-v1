import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  updateDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import type { 
  VoiceSynthesis,
  VoiceProfile
} from '../types';

export class VoiceSynthesisService {
  private static synthesis: SpeechSynthesis | null = null;
  private static availableVoices: VoiceProfile[] = [];
  private static currentUtterance: SpeechSynthesisUtterance | null = null;

  // **INICIALIZAÇÃO DO SERVIÇO**

  static async initialize(): Promise<void> {
    if (!this.isSupported()) {
      console.warn('Speech Synthesis não é suportada neste navegador');
      return;
    }

    this.synthesis = window.speechSynthesis;
    await this.loadAvailableVoices();
    
    // Event listeners para mudanças de vozes
    this.synthesis.onvoiceschanged = () => {
      this.loadAvailableVoices();
    };
  }

  static isSupported(): boolean {
    return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  }

  // **GESTÃO DE VOZES**

  private static async loadAvailableVoices(): Promise<void> {
    if (!this.synthesis) return;

    const voices = this.synthesis.getVoices();
    this.availableVoices = voices.map(voice => ({
      id: `browser_${voice.name.replace(/\s+/g, '_').toLowerCase()}`,
      name: voice.name,
      displayName: voice.name,
      language: voice.lang,
      gender: this.detectGender(voice.name),
      accent: this.detectAccent(voice.lang),
      description: `${voice.name} - ${voice.lang}`,
      isAvailable: true,
      isPremium: false,
      provider: 'browser'
    }));

    // Adicionar vozes premium se disponíveis
    await this.loadPremiumVoices();
  }

  private static async loadPremiumVoices(): Promise<void> {
    // Aqui seria a integração com serviços premium como ElevenLabs, Azure, etc.
    const premiumVoices: VoiceProfile[] = [
      {
        id: 'elevenlabs_rachel',
        name: 'Rachel',
        displayName: 'Rachel (Premium)',
        language: 'en-US',
        gender: 'female',
        accent: 'American',
        description: 'Voz feminina profissional com qualidade superior',
        sampleUrl: '/samples/rachel.mp3',
        isAvailable: true,
        isPremium: true,
        provider: 'elevenlabs'
      },
      {
        id: 'azure_pt_br_female',
        name: 'Francisca',
        displayName: 'Francisca (Premium)',
        language: 'pt-BR',
        gender: 'female',
        accent: 'Brazilian',
        description: 'Voz feminina brasileira natural e expressiva',
        sampleUrl: '/samples/francisca.mp3',
        isAvailable: true,
        isPremium: true,
        provider: 'azure'
      }
    ];

    this.availableVoices.push(...premiumVoices);
  }

  static getAvailableVoices(language?: string): VoiceProfile[] {
    let voices = this.availableVoices;
    
    if (language) {
      voices = voices.filter(voice => 
        voice.language.startsWith(language) || 
        voice.language.includes(language)
      );
    }

    return voices.sort((a, b) => {
      // Priorizar vozes do idioma português
      const aIsPt = a.language.startsWith('pt');
      const bIsPt = b.language.startsWith('pt');
      
      if (aIsPt && !bIsPt) return -1;
      if (!aIsPt && bIsPt) return 1;
      
      // Priorizar vozes premium
      if (a.isPremium && !b.isPremium) return -1;
      if (!a.isPremium && b.isPremium) return 1;
      
      return a.displayName.localeCompare(b.displayName);
    });
  }

  static getVoiceById(voiceId: string): VoiceProfile | null {
    return this.availableVoices.find(voice => voice.id === voiceId) || null;
  }

  // **SÍNTESE DE VOZ**

  static async synthesizeText(
    projectId: string,
    userId: string,
    text: string,
    voiceId: string,
    settings?: Partial<VoiceSynthesis['settings']>
  ): Promise<VoiceSynthesis> {
    try {
      const voice = this.getVoiceById(voiceId);
      if (!voice) {
        throw new Error('Voz não encontrada');
      }

      // Criar objeto de síntese
      const synthesis: VoiceSynthesis = {
        id: `voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        projectId,
        userId,
        text: this.preprocessText(text),
        voice: {
          name: voice.name,
          lang: voice.language,
          gender: voice.gender,
          accent: voice.accent
        },
        settings: {
          rate: 1.0,
          pitch: 1.0,
          volume: 1.0,
          emphasis: 'moderate',
          pause: {
            sentence: 500,
            paragraph: 1000
          },
          ...settings
        },
        status: 'pending',
        createdAt: Timestamp.now()
      };

      // Salvar no Firebase
      await this.saveSynthesis(synthesis);

      // Executar síntese
      if (voice.provider === 'browser') {
        return await this.synthesizeWithBrowser(synthesis);
      } else {
        return await this.synthesizeWithPremiumProvider(synthesis);
      }

    } catch (error: unknown) {
      console.error('Erro na síntese de voz:', error);
      throw new Error(`Falha na síntese: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  private static async synthesizeWithBrowser(synthesis: VoiceSynthesis): Promise<VoiceSynthesis> {
    return new Promise(async (resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('Synthesis não inicializada'));
        return;
      }

      // Atualizar status
      synthesis.status = 'processing';
      await this.updateSynthesis(synthesis.id, { status: 'processing' });

      // Criar utterance
      const utterance = new SpeechSynthesisUtterance(synthesis.text);
      
      // Encontrar voz do navegador
      const browserVoices = this.synthesis.getVoices();
      const voice = browserVoices.find(v => v.name === synthesis.voice.name);
      
      if (voice) {
        utterance.voice = voice;
      }

      // Configurar parâmetros
      utterance.rate = synthesis.settings.rate;
      utterance.pitch = synthesis.settings.pitch;
      utterance.volume = synthesis.settings.volume;
      utterance.lang = synthesis.voice.lang;

      // Calcular duração estimada
      const estimatedDuration = this.estimateDuration(synthesis.text, synthesis.settings.rate);
      synthesis.duration = estimatedDuration;

      // Event listeners
      utterance.onstart = async () => {
        console.log('Síntese iniciada');
      };

      utterance.onend = async () => {
        synthesis.status = 'completed';
        synthesis.processedAt = Timestamp.now();
        
        await this.updateSynthesis(synthesis.id, {
          status: 'completed',
          processedAt: synthesis.processedAt,
          duration: synthesis.duration
        });

        resolve(synthesis);
      };

      utterance.onerror = async (event) => {
        synthesis.status = 'failed';
        
        await this.updateSynthesis(synthesis.id, {
          status: 'failed',
          processedAt: Timestamp.now()
        });

        reject(new Error(`Erro na síntese: ${event.error}`));
      };

      // Iniciar síntese
      this.currentUtterance = utterance;
      this.synthesis.speak(utterance);
    });
  }

  private static async synthesizeWithPremiumProvider(synthesis: VoiceSynthesis): Promise<VoiceSynthesis> {
    // Implementação para provedores premium (ElevenLabs, Azure, etc.)
    // Por enquanto, simular com delay
    
    synthesis.status = 'processing';
    await this.updateSynthesis(synthesis.id, { status: 'processing' });

    // Simular processamento
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simular URL de áudio gerada
    synthesis.audioUrl = `/generated/audio/${synthesis.id}.mp3`;
    synthesis.duration = this.estimateDuration(synthesis.text, synthesis.settings.rate);
    synthesis.status = 'completed';
    synthesis.processedAt = Timestamp.now();

    await this.updateSynthesis(synthesis.id, {
      status: 'completed',
      audioUrl: synthesis.audioUrl,
      duration: synthesis.duration,
      processedAt: synthesis.processedAt
    });

    return synthesis;
  }

  // **CONTROLE DE REPRODUÇÃO**

  static pause(): void {
    if (this.synthesis) {
      this.synthesis.pause();
    }
  }

  static resume(): void {
    if (this.synthesis) {
      this.synthesis.resume();
    }
  }

  static stop(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.currentUtterance = null;
    }
  }

  static isSpeaking(): boolean {
    return this.synthesis ? this.synthesis.speaking : false;
  }

  static isPaused(): boolean {
    return this.synthesis ? this.synthesis.paused : false;
  }

  // **PREVIEW E TESTE**

  static async previewVoice(voiceId: string, sampleText?: string): Promise<void> {
    const voice = this.getVoiceById(voiceId);
    if (!voice) {
      throw new Error('Voz não encontrada');
    }

    const text = sampleText || this.getSampleText(voice.language);
    
    if (voice.provider === 'browser') {
      return this.previewBrowserVoice(voice, text);
    } else if (voice.sampleUrl) {
      return this.playAudioSample(voice.sampleUrl);
    }
  }

  private static async previewBrowserVoice(voice: VoiceProfile, text: string): Promise<void> {
    if (!this.synthesis) {
      throw new Error('Synthesis não inicializada');
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const browserVoices = this.synthesis.getVoices();
    const browserVoice = browserVoices.find(v => v.name === voice.name);
    
    if (browserVoice) {
      utterance.voice = browserVoice;
    }
    
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    this.synthesis.speak(utterance);
  }

  private static async playAudioSample(sampleUrl: string): Promise<void> {
    const audio = new Audio(sampleUrl);
    await audio.play();
  }

  // **HISTÓRICO E ANALYTICS**

  static async getUserSyntheses(userId: string, limit = 20): Promise<VoiceSynthesis[]> {
    try {
      const synthesesQuery = query(
        collection(db, 'voice_syntheses'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limit)
      );

      const snapshot = await getDocs(synthesesQuery);
      return snapshot.docs.map(doc => doc.data() as VoiceSynthesis);
    } catch (error: unknown) {
      console.error('Erro ao obter sínteses do usuário:', error);
      return [];
    }
  }

  static async getProjectSyntheses(projectId: string): Promise<VoiceSynthesis[]> {
    try {
      const synthesesQuery = query(
        collection(db, 'voice_syntheses'),
        where('projectId', '==', projectId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(synthesesQuery);
      return snapshot.docs.map(doc => doc.data() as VoiceSynthesis);
    } catch (error: unknown) {
      console.error('Erro ao obter sínteses do projeto:', error);
      return [];
    }
  }

  // **UTILITÁRIOS E HELPERS**

  private static preprocessText(text: string): string {
    // Limpar e otimizar texto para síntese
    return text
      .replace(/\n+/g, '. ') // Quebras de linha viram pausas
      .replace(/\s+/g, ' ')  // Múltiplos espaços viram um
      .replace(/([.!?])\s*([.!?])/g, '$1 ') // Múltipla pontuação
      .trim();
  }

  private static estimateDuration(text: string, rate: number): number {
    // Estimar duração baseada na velocidade média de fala
    const wordsPerMinute = 150 * rate; // 150 WPM é a média
    const words = text.split(/\s+/).length;
    return Math.ceil((words / wordsPerMinute) * 60); // segundos
  }

  private static detectGender(voiceName: string): 'male' | 'female' | 'neutral' {
    const femaleNames = ['female', 'woman', 'lady', 'maria', 'ana', 'lucia', 'rachel', 'sarah', 'emma'];
    const maleNames = ['male', 'man', 'john', 'michael', 'david', 'daniel', 'carlos', 'joão'];
    
    const name = voiceName.toLowerCase();
    
    if (femaleNames.some(fn => name.includes(fn))) return 'female';
    if (maleNames.some(mn => name.includes(mn))) return 'male';
    
    return 'neutral';
  }

  private static detectAccent(language: string): string {
    const accents: Record<string, string> = {
      'en-US': 'American',
      'en-GB': 'British',
      'en-AU': 'Australian',
      'pt-BR': 'Brazilian',
      'pt-PT': 'Portuguese',
      'es-ES': 'Spanish',
      'es-MX': 'Mexican',
      'fr-FR': 'French',
      'de-DE': 'German',
      'it-IT': 'Italian'
    };
    
    return accents[language] || language.split('-')[1] || 'Unknown';
  }

  private static getSampleText(language: string): string {
    const samples: Record<string, string> = {
      'pt-BR': 'Olá! Esta é uma amostra da voz em português brasileiro. Como você está hoje?',
      'pt-PT': 'Olá! Esta é uma amostra da voz em português europeu. Como está?',
      'en-US': 'Hello! This is a sample of the American English voice. How are you today?',
      'en-GB': 'Hello! This is a sample of the British English voice. How are you today?',
      'es-ES': '¡Hola! Esta es una muestra de la voz en español. ¿Cómo estás hoy?',
      'fr-FR': 'Bonjour! Ceci est un échantillon de la voix française. Comment allez-vous?',
      'de-DE': 'Hallo! Dies ist eine Probe der deutschen Stimme. Wie geht es Ihnen?',
      'it-IT': 'Ciao! Questo è un campione della voce italiana. Come stai oggi?'
    };

    // Tentar idioma específico primeiro, depois genérico
    return samples[language] || 
           samples[language.split('-')[0]] || 
           samples['en-US'];
  }

  // **PERSISTÊNCIA FIREBASE**

  private static async saveSynthesis(synthesis: VoiceSynthesis): Promise<void> {
    try {
      const synthesisRef = doc(db, 'voice_syntheses', synthesis.id);
      await setDoc(synthesisRef, synthesis);
    } catch (error: unknown) {
      console.error('Erro ao salvar síntese:', error);
      throw error;
    }
  }

  private static async updateSynthesis(synthesisId: string, updates: Partial<VoiceSynthesis>): Promise<void> {
    try {
      const synthesisRef = doc(db, 'voice_syntheses', synthesisId);
      await updateDoc(synthesisRef, updates);
    } catch (error: unknown) {
      console.error('Erro ao atualizar síntese:', error);
    }
  }

  static async getSynthesis(synthesisId: string): Promise<VoiceSynthesis | null> {
    try {
      const synthesisDoc = await getDoc(doc(db, 'voice_syntheses', synthesisId));
      return synthesisDoc.exists() ? synthesisDoc.data() as VoiceSynthesis : null;
    } catch (error: unknown) {
      console.error('Erro ao obter síntese:', error);
      return null;
    }
  }

  // **CONFIGURAÇÕES E PREFERÊNCIAS**

  static async saveUserVoicePreferences(userId: string, preferences: {
    favoriteVoices: string[];
    defaultSettings: VoiceSynthesis['settings'];
    language: string;
  }): Promise<void> {
    try {
      const preferencesRef = doc(db, 'voice_preferences', userId);
      await setDoc(preferencesRef, {
        ...preferences,
        updatedAt: Timestamp.now()
      });
    } catch (error: unknown) {
      console.error('Erro ao salvar preferências de voz:', error);
    }
  }

  static async getUserVoicePreferences(userId: string): Promise<any> {
    try {
      const preferencesDoc = await getDoc(doc(db, 'voice_preferences', userId));
      return preferencesDoc.exists() ? preferencesDoc.data() : null;
    } catch (error: unknown) {
      console.error('Erro ao obter preferências de voz:', error);
      return null;
    }
  }

  // **ANALYTICS**

  static async trackVoiceUsage(userId: string, voiceId: string, duration: number): Promise<void> {
    try {
      const analyticsRef = doc(collection(db, 'voice_analytics'));
      await setDoc(analyticsRef, {
        userId,
        voiceId,
        duration,
        timestamp: Timestamp.now()
      });
    } catch (error: unknown) {
      console.error('Erro ao rastrear uso de voz:', error);
    }
  }

  // **QUOTA E LIMITES**

  static async checkUserQuota(userId: string): Promise<{
    used: number;
    limit: number;
    remaining: number;
    resetDate: Date;
  }> {
    try {
      // Obter uso do mês atual
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const usageQuery = query(
        collection(db, 'voice_syntheses'),
        where('userId', '==', userId),
        where('createdAt', '>=', Timestamp.fromDate(startOfMonth))
      );

      const usageSnapshot = await getDocs(usageQuery);
      const used = usageSnapshot.size;

      // Limites por plano (seria dinâmico baseado no plano do usuário)
      const limit = 100; // 100 sínteses por mês no plano básico
      
      const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      return {
        used,
        limit,
        remaining: Math.max(0, limit - used),
        resetDate
      };
    } catch (error: unknown) {
      console.error('Erro ao verificar quota:', error);
      return { used: 0, limit: 100, remaining: 100, resetDate: new Date() };
    }
  }
} 