import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { tallyService } from '../services/tallyService';

describe('TallyService', () => {
  beforeEach(() => {
    // jest.MockedFunction console methods
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('getStatus', () => {
    it('retorna status correto', () => {
      const status = tallyService.getStatus();
      
      expect(status).toHaveProperty('enabled');
      expect(status).toHaveProperty('initialized');
      expect(status).toHaveProperty('formsConfigured');
    });
  });

  describe('showGeneralFeedback', () => {
    it('não quebra quando chamado', () => {
      expect(() => {
        tallyService.showGeneralFeedback();
      }).not.toThrow();
    });
  });

  describe('showNPSSurvey', () => {
    it('não quebra quando chamado', () => {
      expect(() => {
        tallyService.showNPSSurvey();
      }).not.toThrow();
    });
  });

  describe('showBugReport', () => {
    it('não quebra quando chamado', () => {
      expect(() => {
        tallyService.showBugReport();
      }).not.toThrow();
    });
  });
});
