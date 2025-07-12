import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { analyticsService } from '../../services/analyticsService';

describe('AnalyticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('inicializa corretamente', () => {
    expect(analyticsService).toBeDefined();
    expect(typeof analyticsService.trackEvent).toBe('function');
    expect(typeof analyticsService.trackPageView).toBe('function');
    expect(typeof analyticsService.trackUserAction).toBe('function');
    expect(typeof analyticsService.trackError).toBe('function');
  });

  it('possui todas as funções esperadas', () => {
    expect(typeof analyticsService.initialize).toBe('function');
    expect(typeof analyticsService.getStatus).toBe('function');
    expect(typeof analyticsService.isEnabled).toBe('function');
    expect(typeof analyticsService.trackFeatureUsage).toBe('function');
    expect(typeof analyticsService.trackScriptGeneration).toBe('function');
  });

  it('trackEvent não quebra quando chamado', () => {
    expect(() => {
      analyticsService.trackEvent('test_event', { data: 'test' });
    }).not.toThrow();
  });

  it('trackUserAction não quebra quando chamado', () => {
    expect(() => {
      analyticsService.trackUserAction('user_click', { button: 'header' });
    }).not.toThrow();
  });

  it('trackError não quebra quando chamado', () => {
    expect(() => {
      analyticsService.trackError('Test error', { component: 'test' });
    }).not.toThrow();
  });

  it('trackPageView não quebra quando chamado', () => {
    expect(() => {
      analyticsService.trackPageView('/test-page');
    }).not.toThrow();
  });

  it('trackFeatureUsage não quebra quando chamado', () => {
    expect(() => {
      analyticsService.trackFeatureUsage('script_generation', { success: true });
    }).not.toThrow();
  });

  it('trackScriptGeneration aceita dados esperados', () => {
    const scriptData = {
      platform: 'youtube',
      subject: 'test topic',
      duration: '5-10 min',
      tone: 'professional',
      audience: 'developers',
      success: true,
      generation_time: 1500,
      script_length: 250,
    };

    expect(() => {
      analyticsService.trackScriptGeneration(scriptData);
    }).not.toThrow();
  });

  it('getStatus retorna status do service', () => {
    const status = analyticsService.getStatus();
    expect(typeof status).toBe('object');
  });

  it('isEnabled retorna boolean', () => {
    const enabled = analyticsService.isEnabled();
    expect(typeof enabled).toBe('boolean');
  });

  it('funciona em ambiente de teste sem erros', () => {
    expect(() => {
      analyticsService.initialize();
    }).not.toThrow();
  });

  it('getDashboardMetrics não quebra quando chamado', () => {
    expect(() => {
      analyticsService.getDashboardMetrics();
    }).not.toThrow();
  });
}); 