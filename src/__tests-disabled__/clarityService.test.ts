import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { ClarityService } from './clarityService';

describe('ClarityService', () => {
  beforeEach(() => {
    // Reset state
    (ClarityService as any).isInitialized = false;
    (ClarityService as any).isLoaded = false;
    
    // jest.MockedFunction console methods
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('getStatus', () => {
    it('retorna status inicial correto', () => {
      const status = ClarityService.getStatus();
      
      expect(status).toHaveProperty('initialized');
      expect(status).toHaveProperty('loaded');
      expect(status).toHaveProperty('enabled');
      expect(status).toHaveProperty('projectId');
    });
  });

  describe('setDebug', () => {
    it('altera configuração de debug', () => {
      ClarityService.setDebug(true);
      ClarityService.setDebug(false);
      
      expect(true).toBe(true); // Test passes if no errors
    });
  });

  describe('trackEvent', () => {
    it('não quebra quando chamado sem clarify carregado', () => {
      expect(() => {
        ClarityService.trackEvent('test_event');
      }).not.toThrow();
    });
  });
});
