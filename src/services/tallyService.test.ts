import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TallyService } from './tallyService';

describe('TallyService', () => {
  beforeEach(() => {
    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('getStatus', () => {
    it('retorna status correto', () => {
      const status = TallyService.getStatus();
      
      expect(status).toHaveProperty('enabled');
      expect(status).toHaveProperty('scriptLoaded');
      expect(status).toHaveProperty('formsConfigured');
    });
  });

  describe('showGeneralFeedback', () => {
    it('não quebra quando chamado', () => {
      expect(() => {
        TallyService.showGeneralFeedback();
      }).not.toThrow();
    });
  });

  describe('showNPSSurvey', () => {
    it('não quebra quando chamado', () => {
      expect(() => {
        TallyService.showNPSSurvey();
      }).not.toThrow();
    });
  });

  describe('showBugReport', () => {
    it('não quebra quando chamado', () => {
      expect(() => {
        TallyService.showBugReport();
      }).not.toThrow();
    });
  });
});
