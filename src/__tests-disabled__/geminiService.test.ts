import { describe, it, expect, jest, beforeEach } from '@testing-library/jest-dom';
import { generateScript, validateApiKey, getApiKeyFromUser } from './geminiService';
import { GoogleGenerativeAI } from '@google/generative-ai';

// jest.MockedFunction do Google Generative AI
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn(),
}));

const mockGoogleGenerativeAI = GoogleGenerativeAI as jest.MockedFunction;

describe('geminiService', () => {
  const mockGenerateContent = jest.fn();
  const mockGetGenerativeModel = jest.fn();

  beforeEach(() => {
    jest.clearAlljest.MockedFunctions();
    
    // Setup mock chain
    mockGetGenerativeModel.mockReturnValue({
      generateContent: mockGenerateContent,
    });
    
    mockGoogleGenerativeAI.mockImplementation(() => ({
      getGenerativeModel: mockGetGenerativeModel,
    }));

    // jest.MockedFunction localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });

    // jest.MockedFunction window.prompt
    Object.defineProperty(window, 'prompt', {
      value: jest.fn(),
      writable: true,
    });
  });

  describe('generateScript', () => {
    const mockFormData = {
      subject: 'Como fazer café',
      platform: 'youtube',
      duration: '60',
      targetAudience: 'iniciantes',
      tone: 'informal',
      objective: 'educar'
    };

    it('gera roteiro com sucesso', async () => {
      const mockResponse = {
        response: {
          text: () => 'Roteiro gerado com sucesso!'
        }
      };
      
      mockGenerateContent.mockResolvedValue(mockResponse);
      (window.localStorage.getItem as jest.MockedFunction).mockReturnValue('fake-api-key');

      const result = await generateScript(mockFormData);

      expect(result).toBe('Roteiro gerado com sucesso!');
      expect(mockGoogleGenerativeAI).toHaveBeenCalledWith('fake-api-key');
      expect(mockGetGenerativeModel).toHaveBeenCalledWith({ model: 'gemini-1.5-flash' });
      expect(mockGenerateContent).toHaveBeenCalled();
    });

    it('solicita API key quando não existe', async () => {
      (window.localStorage.getItem as jest.MockedFunction).mockReturnValue(null);
      (window.prompt as jest.MockedFunction).mockReturnValue('new-api-key');
      
      const mockResponse = {
        response: {
          text: () => 'Roteiro gerado!'
        }
      };
      mockGenerateContent.mockResolvedValue(mockResponse);

      const result = await generateScript(mockFormData);

      expect(window.prompt).toHaveBeenCalledWith(expect.stringContaining('API key'));
      expect(window.localStorage.setItem).toHaveBeenCalledWith('gemini_api_key', 'new-api-key');
      expect(result).toBe('Roteiro gerado!');
    });

    it('trata erro quando usuário cancela API key', async () => {
      (window.localStorage.getItem as jest.MockedFunction).mockReturnValue(null);
      (window.prompt as jest.MockedFunction).mockReturnValue(null);

      await expect(generateScript(mockFormData)).rejects.toThrow('API key é obrigatória');
    });

    it('trata erro da API Gemini', async () => {
      (window.localStorage.getItem as jest.MockedFunction).mockReturnValue('fake-api-key');
      mockGenerateContent.mockRejectedValue(new Error('API Error'));

      await expect(generateScript(mockFormData)).rejects.toThrow('Erro ao gerar roteiro');
    });

    it('inclui todos os parâmetros no prompt', async () => {
      const mockResponse = {
        response: {
          text: () => 'Roteiro personalizado'
        }
      };
      
      mockGenerateContent.mockResolvedValue(mockResponse);
      (window.localStorage.getItem as jest.MockedFunction).mockReturnValue('fake-api-key');

      await generateScript(mockFormData);

      const callArgs = mockGenerateContent.mock.calls[0][0];
      expect(callArgs).toContain('Como fazer café');
      expect(callArgs).toContain('youtube');
      expect(callArgs).toContain('60');
      expect(callArgs).toContain('iniciantes');
      expect(callArgs).toContain('informal');
      expect(callArgs).toContain('educar');
    });

    it('gera prompt diferente para cada plataforma', async () => {
      const mockResponse = {
        response: {
          text: () => 'Roteiro'
        }
      };
      mockGenerateContent.mockResolvedValue(mockResponse);
      (window.localStorage.getItem as jest.MockedFunction).mockReturnValue('fake-api-key');

      // Testa diferentes plataformas
      const platforms = ['youtube', 'tiktok', 'instagram', 'linkedin'];
      
      for (const platform of platforms) {
        await generateScript({
          ...mockFormData,
          platform
        });
      }

      expect(mockGenerateContent).toHaveBeenCalledTimes(platforms.length);
      
      // Cada chamada deve ter prompt específico da plataforma
      const calls = mockGenerateContent.mock.calls;
      calls.forEach((call, index) => {
        expect(call[0]).toContain(platforms[index]);
      });
    });
  });

  describe('validateApiKey', () => {
    it('valida API key correta', async () => {
      const mockResponse = {
        response: {
          text: () => 'Test response'
        }
      };
      mockGenerateContent.mockResolvedValue(mockResponse);

      const result = await validateApiKey('valid-key');

      expect(result).toBe(true);
      expect(mockGoogleGenerativeAI).toHaveBeenCalledWith('valid-key');
    });

    it('invalida API key incorreta', async () => {
      mockGenerateContent.mockRejectedValue(new Error('Invalid API key'));

      const result = await validateApiKey('invalid-key');

      expect(result).toBe(false);
    });

    it('retorna false para API key vazia', async () => {
      const result = await validateApiKey('');
      
      expect(result).toBe(false);
    });
  });

  describe('getApiKeyFromUser', () => {
    it('obtém nova API key do usuário', () => {
      (window.prompt as jest.MockedFunction).mockReturnValue('user-provided-key');

      const result = getApiKeyFromUser();

      expect(result).toBe('user-provided-key');
      expect(window.prompt).toHaveBeenCalledWith(
        expect.stringContaining('Google AI Studio')
      );
    });

    it('retorna null quando usuário cancela', () => {
      (window.prompt as jest.MockedFunction).mockReturnValue(null);

      const result = getApiKeyFromUser();

      expect(result).toBe(null);
    });

    it('salva API key no localStorage', () => {
      (window.prompt as jest.MockedFunction).mockReturnValue('new-key');

      getApiKeyFromUser();

      expect(window.localStorage.setItem).toHaveBeenCalledWith('gemini_api_key', 'new-key');
    });
  });

  describe('error handling', () => {
    it('trata erro de rede', async () => {
      (window.localStorage.getItem as jest.MockedFunction).mockReturnValue('fake-api-key');
      mockGenerateContent.mockRejectedValue(new Error('Network error'));

      await expect(generateScript(mockFormData)).rejects.toThrow('Erro ao gerar roteiro');
    });

    it('trata resposta vazia da API', async () => {
      const mockResponse = {
        response: {
          text: () => ''
        }
      };
      
      mockGenerateContent.mockResolvedValue(mockResponse);
      (window.localStorage.getItem as jest.MockedFunction).mockReturnValue('fake-api-key');

      await expect(generateScript(mockFormData)).rejects.toThrow('Resposta vazia');
    });

    it('trata timeout da API', async () => {
      (window.localStorage.getItem as jest.MockedFunction).mockReturnValue('fake-api-key');
      
      // Simula timeout
      mockGenerateContent.mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      );

      await expect(generateScript(mockFormData)).rejects.toThrow();
    });
  });
}); 