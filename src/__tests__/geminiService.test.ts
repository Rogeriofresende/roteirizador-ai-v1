import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { geminiService, GeminiService } from '../services/geminiService';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Mock GoogleGenerativeAI
jest.mock('@google/generative-ai');
const MockedGoogleGenerativeAI = GoogleGenerativeAI as jest.MockedClass<typeof GoogleGenerativeAI>;

describe('GeminiService', () => {
  let mockModel: any;
  let mockGenAI: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });

    // Mock console methods
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // Setup mock model
    mockModel = {
      generateContent: jest.fn(),
    };

    mockGenAI = {
      getGenerativeModel: jest.fn().mockReturnValue(mockModel),
    };

    MockedGoogleGenerativeAI.mockImplementation(() => mockGenAI);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('generateScript', () => {
    it('should generate script successfully', async () => {
      // Setup
      const mockResponse = {
        response: Promise.resolve({
          text: () => 'Generated script content'
        })
      };
      
      mockModel.generateContent.mockResolvedValue(mockResponse);
      
      // Mock API key
      (window.localStorage.getItem as jest.Mock).mockReturnValue('test-api-key');
      
      // Test
      const params = {
        subject: 'Test Subject',
        platform: 'youtube',
        duration: '5 minutes',
        tone: 'casual',
        audience: 'general'
      };

      const result = await geminiService.generateScript(params);
      
      expect(result).toBe('Generated script content');
      expect(mockModel.generateContent).toHaveBeenCalled();
    });

    it('should throw error when not configured', async () => {
      // Setup - no API key
      (window.localStorage.getItem as jest.Mock).mockReturnValue(null);
      
      const params = {
        subject: 'Test Subject',
        platform: 'youtube',
        duration: '5 minutes',
        tone: 'casual',
        audience: 'general'
      };

      await expect(geminiService.generateScript(params)).rejects.toThrow('Gemini API não configurado');
    });
  });

  describe('setAPIKey', () => {
    it('should set API key successfully', () => {
      const result = geminiService.setAPIKey('test-api-key');
      
      expect(window.localStorage.setItem).toHaveBeenCalledWith('GEMINI_API_KEY', 'test-api-key');
      expect(result).toBe(true);
    });

    it('should reject invalid API key', () => {
      const result = geminiService.setAPIKey('');
      
      expect(result).toBe(false);
    });
  });

  describe('isConfigured', () => {
    it('should return true when properly configured', () => {
      (window.localStorage.getItem as jest.Mock).mockReturnValue('test-api-key');
      
      // Create new instance to trigger initialization
      const service = new GeminiService();
      
      expect(service.isConfigured()).toBe(true);
    });

    it('should return false when not configured', () => {
      (window.localStorage.getItem as jest.Mock).mockReturnValue(null);
      
      // Create new instance to trigger initialization
      const service = new GeminiService();
      
      expect(service.isConfigured()).toBe(false);
    });
  });
}); 