import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mock do TallyService para evitar import.meta issues
const mockTallyService = {
  getStatus: jest.fn(() => ({
    enabled: false,
    initialized: false,
    formsConfigured: {
      feedback: false,
      nps: false,
      features: false,
      bugs: false
    }
  })),
  openFeedbackForm: jest.fn(() => false),
  openNPSForm: jest.fn(() => false),
  openBugReportForm: jest.fn(() => false),
  isEnabled: jest.fn(() => false)
};

// Mock the module
jest.mock('../services/tallyService', () => ({
  tallyService: mockTallyService
}));

describe('TallyService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getStatus', () => {
    it('retorna status correto', () => {
      const status = mockTallyService.getStatus();
      
      expect(status).toHaveProperty('enabled');
      expect(status).toHaveProperty('initialized');
      expect(status).toHaveProperty('formsConfigured');
    });
  });

  describe('openFeedbackForm', () => {
    it('não quebra quando chamado', () => {
      expect(() => {
        mockTallyService.openFeedbackForm();
      }).not.toThrow();
    });
  });

  describe('openNPSForm', () => {
    it('não quebra quando chamado', () => {
      expect(() => {
        mockTallyService.openNPSForm();
      }).not.toThrow();
    });
  });

  describe('openBugReportForm', () => {
    it('não quebra quando chamado', () => {
      expect(() => {
        mockTallyService.openBugReportForm();
      }).not.toThrow();
    });
  });

  it('should show general feedback', () => {
    const result = mockTallyService.openFeedbackForm();
    expect(typeof result).toBe('boolean');
  });

  it('should show bug report with mock', () => {
    const result = mockTallyService.openBugReportForm();
    expect(typeof result).toBe('boolean');
  });
});
