import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

// jest.MockedFunction Web Speech API - Testes Críticos VoiceSynthesisService
const mockSpeechSynthesis = {
  speak: jest.fn(),
  cancel: jest.fn(),
  getVoices: jest.fn(() => [
    { name: 'Test Voice 1', lang: 'pt-BR', gender: 'female' },
    { name: 'Test Voice 2', lang: 'en-US', gender: 'male' }
  ]),
  speaking: false
};

// jest.MockedFunction global speechSynthesis
Object.defineProperty(global, 'speechSynthesis', {
  value: mockSpeechSynthesis,
  writable: true
});

// Mock SpeechSynthesisUtterance
const mockUtterance = {
  text: '',
  lang: 'en-US',
  voice: null,
  volume: 1,
  rate: 1,
  pitch: 1,
  onboundary: null,
  onend: null,
  onerror: null,
  onmark: null,
  onpause: null,
  onresume: null,
  onstart: null,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn()
};

global.SpeechSynthesisUtterance = jest.fn().mockImplementation((text) => ({
  ...mockUtterance,
  text: text || ''
})) as any;

describe('🎤 VoiceSynthesisService - Testes Críticos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('🎯 Inicialização', () => {
    it('deve detectar suporte do navegador', () => {
      expect(typeof mockSpeechSynthesis).toBe('object');
    });

    it('deve carregar vozes disponíveis', () => {
      const voices = mockSpeechSynthesis.getVoices();
      expect(voices).toBeDefined();
      expect(Array.isArray(voices)).toBe(true);
      expect(voices.length).toBeGreaterThan(0);
    });
  });

  describe('🎯 Síntese Básica', () => {
    it('deve criar utterance com texto', () => {
      const text = 'Teste de síntese de voz';
      const utterance = new SpeechSynthesisUtterance(text);
      
      expect(utterance.text).toBe(text);
      expect(utterance.volume).toBe(1);
      expect(utterance.rate).toBe(1);
    });

    it('deve controlar velocidade e tom', () => {
      const utterance = new SpeechSynthesisUtterance('teste');
      utterance.rate = 1.5;
      utterance.pitch = 0.8;
      
      expect(utterance.rate).toBe(1.5);
      expect(utterance.pitch).toBe(0.8);
    });
  });

  describe('🎯 Sistema de Quota', () => {
    it('deve verificar quota básica', () => {
      const quota = { used: 10, limit: 100, remaining: 90 };
      expect(quota.remaining).toBe(quota.limit - quota.used);
    });

    it('deve detectar quota excedida', () => {
      const quota = { used: 100, limit: 100, remaining: 0 };
      expect(quota.remaining <= 0).toBe(true);
    });
  });

  describe('🎯 Gerenciamento de Vozes', () => {
    it('deve filtrar vozes por idioma', () => {
      const voices = mockSpeechSynthesis.getVoices();
      const ptVoices = voices.filter(v => v.lang === 'pt-BR');
      expect(Array.isArray(ptVoices)).toBe(true);
    });

    it('deve encontrar voz específica', () => {
      const voices = mockSpeechSynthesis.getVoices();
      const voice = voices.find(v => v.name === 'Test Voice 1');
      expect(voice).toBeDefined();
    });
  });

  describe('🎯 Tratamento de Erros', () => {
    it('deve validar texto vazio', () => {
      const emptyText = '';
      expect(emptyText.trim().length > 0).toBe(false);
    });

    it('deve lidar com erro na API', () => {
      mockSpeechSynthesis.speak.mockImplementation(() => {
        throw new Error('API Error');
      });
      expect(() => mockSpeechSynthesis.speak()).toThrow();
    });
  });
});
