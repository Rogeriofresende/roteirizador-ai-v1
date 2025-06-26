import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { TallyService } from './tallyService';

describe('TallyService', () => {
  beforeEach(() => {
    // jest.MockedFunction console methods
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
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
