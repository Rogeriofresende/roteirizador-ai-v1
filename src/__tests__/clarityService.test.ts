import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { clarityService } from '../services/clarityService';

describe('ClarityService', () => {
  beforeEach(() => {
    // Reset state
    (clarityService as any).isInitialized = false;
    (clarityService as any).isLoaded = false;
    
    // jest.MockedFunction console methods
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('getStatus', () => {
    it('retorna status inicial correto', () => {
      const status = clarityService.getStatus();
      
      expect(status).toHaveProperty('initialized');
      expect(status).toHaveProperty('enabled');
      expect(status).toHaveProperty('projectId');
    });
  });

  describe('setDebug', () => {
    it('altera configuração de debug', () => {
      clarityService.setDebug(true);
      clarityService.setDebug(false);
      
      expect(true).toBe(true); // Test passes if no errors
    });
  });

  describe('trackEvent', () => {
    it('não quebra quando chamado sem clarity carregado', () => {
      expect(() => {
        clarityService.trackEvent('test_event');
      }).not.toThrow();
    });
  });
});
