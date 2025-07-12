import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { clarityService } from '../services/clarityService';

// Mock do window.clarity
declare global {
  interface Window {
    clarity?: {
      (method: string, ...args: unknown[]): void;
      consent?: boolean;
      [key: string]: any;
    };
  }
}

describe('ClarityService', () => {
  beforeEach(() => {
    // Reset state
    (clarityService as any).isInitialized = false;
    (clarityService as any).initializationAttempts = 0;
    
    // Mock console methods
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Reset window.clarity
    delete window.clarity;
  });

  describe('getStatus', () => {
    it('retorna status inicial correto', () => {
      const status = clarityService.getStatus();
      
      expect(status).toHaveProperty('initialized');
      expect(status).toHaveProperty('enabled');
      expect(status).toHaveProperty('projectId');
      expect(status).toHaveProperty('attempts');
      expect(status).toHaveProperty('clarityAvailable');
      
      expect(status.initialized).toBe(false);
      expect(status.clarityAvailable).toBe(false);
    });
  });

  describe('isEnabled', () => {
    it('retorna false quando não inicializado', () => {
      expect(clarityService.isEnabled()).toBe(false);
    });
  });

  describe('trackEvent', () => {
    it('não quebra quando chamado sem clarity carregado', () => {
      expect(() => {
        clarityService.trackEvent('test_event');
      }).not.toThrow();
    });

    it('chama window.clarity quando disponível', () => {
      // Mock window.clarity
      const mockClarity = jest.fn();
      window.clarity = mockClarity;
      (clarityService as any).isInitialized = true;
      (clarityService as any).config.enabled = true;

      clarityService.trackEvent('test_event', { test: 'data' });

      expect(mockClarity).toHaveBeenCalledWith('event', 'test_event', { test: 'data' });
    });
  });

  describe('trackPageView', () => {
    it('chama trackEvent com page_view', () => {
      const trackEventSpy = jest.spyOn(clarityService, 'trackEvent');
      
      clarityService.trackPageView('/test-page');
      
      expect(trackEventSpy).toHaveBeenCalledWith('page_view', { page: '/test-page' });
    });
  });

  describe('trackUserAction', () => {
    it('chama trackEvent com user_action', () => {
      const trackEventSpy = jest.spyOn(clarityService, 'trackEvent');
      
      clarityService.trackUserAction('click_button', { button: 'submit' });
      
      expect(trackEventSpy).toHaveBeenCalledWith('user_action', { 
        action: 'click_button', 
        button: 'submit' 
      });
    });
  });

  describe('identify', () => {
    it('não quebra quando chamado sem clarity carregado', () => {
      expect(() => {
        clarityService.identify('user-123');
      }).not.toThrow();
    });

    it('chama window.clarity quando disponível', () => {
      // Mock window.clarity
      const mockClarity = jest.fn();
      window.clarity = mockClarity;
      (clarityService as any).isInitialized = true;
      (clarityService as any).config.enabled = true;

      clarityService.identify('user-123', { name: 'Test User' });

      expect(mockClarity).toHaveBeenCalledWith('identify', 'user-123', { name: 'Test User' });
    });
  });
});
