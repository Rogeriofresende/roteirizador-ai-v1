import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, jest, beforeEach, afterEach } from '@testing-library/jest-dom';
import { usePWAAnalytics } from './usePWAAnalytics';

// jest.MockedFunction do localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// jest.MockedFunction do navigator
const mockNavigator = {
  onLine: true,
  userAgent: 'Mozilla/5.0 (Test Browser)',
  platform: 'Test Platform',
  language: 'pt-BR',
  standalone: false,
};

// jest.MockedFunction do window
const mockWindow = {
  matchMedia: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

Object.defineProperty(global, 'navigator', { value: mockNavigator, writable: true });
Object.defineProperty(global, 'window', { value: mockWindow, writable: true });

describe('usePWAAnalytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // jest.MockedFunction console.log e console.error
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Setup padrão do matchMedia
    mockWindow.matchMedia.mockReturnValue({ matches: false });
    
    // Reset navigator.onLine
    Object.defineProperty(navigator, 'onLine', { value: true, writable: true });
    
    // Reset localStorage
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    jest.restoreAlljest.MockedFunctions();
  });

  describe('Inicialização', () => {
    it('inicializa com estado padrão quando não há dados salvos', () => {
      const { result } = renderHook(() => usePWAAnalytics());

      expect(result.current.analytics).toEqual({
        installPromptShown: false,
        isInstalled: false,
        isStandalone: false,
        connectionStatus: 'online',
        installationSource: 'unknown',
        usageMetrics: {
          pageViews: 0,
          timeSpent: 0,
          offlineUsage: 0,
        },
      });
    });

    it('carrega dados salvos do localStorage', () => {
      const savedData = {
        installPromptShown: true,
        isInstalled: true,
        isStandalone: true,
        connectionStatus: 'offline',
        installationSource: 'browser-prompt',
        usageMetrics: {
          pageViews: 10,
          timeSpent: 5000,
          offlineUsage: 2,
        },
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedData));

      const { result } = renderHook(() => usePWAAnalytics());

      expect(result.current.analytics).toEqual(savedData);
    });

    it('detecta quando app está instalado (standalone)', () => {
      mockWindow.matchMedia.mockReturnValue({ matches: true });

      const { result } = renderHook(() => usePWAAnalytics());

      expect(result.current.analytics.isInstalled).toBe(true);
    });

    it('detecta modo standalone no iOS', () => {
      Object.defineProperty(navigator, 'standalone', { value: true });

      const { result } = renderHook(() => usePWAAnalytics());

      expect(result.current.analytics.isStandalone).toBe(true);
    });

    it('detecta status offline inicial', () => {
      Object.defineProperty(navigator, 'onLine', { value: false });

      const { result } = renderHook(() => usePWAAnalytics());

      expect(result.current.analytics.connectionStatus).toBe('offline');
    });

    it('registra event listeners para conexão', () => {
      renderHook(() => usePWAAnalytics());

      expect(mockWindow.addEventListener).toHaveBeenCalledWith('online', expect.any(Function));
      expect(mockWindow.addEventListener).toHaveBeenCalledWith('offline', expect.any(Function));
    });
  });

  describe('Persistência de Dados', () => {
    it('salva dados no localStorage quando analytics mudam', () => {
      const { result } = renderHook(() => usePWAAnalytics());

      act(() => {
        result.current.trackInstallPrompt();
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'pwa-analytics',
        expect.stringContaining('"installPromptShown":true')
      );
    });

    it('persiste alterações de métricas', () => {
      const { result } = renderHook(() => usePWAAnalytics());

      act(() => {
        result.current.trackPageView('/home');
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'pwa-analytics',
        expect.stringContaining('"pageViews":1')
      );
    });
  });

  describe('Event Handlers de Conexão', () => {
    it('atualiza status para online quando conexão é restaurada', () => {
      const { result } = renderHook(() => usePWAAnalytics());

      act(() => {
        const handler = mockWindow.addEventListener.mock.calls.find(
          call => call[0] === 'online'
        )?.[1];
        handler?.();
      });

      expect(result.current.analytics.connectionStatus).toBe('online');
    });

    it('atualiza status para offline e trackeia uso offline', () => {
      const { result } = renderHook(() => usePWAAnalytics());

      act(() => {
        const handler = mockWindow.addEventListener.mock.calls.find(
          call => call[0] === 'offline'
        )?.[1];
        handler?.();
      });

      expect(result.current.analytics.connectionStatus).toBe('offline');
      expect(result.current.analytics.usageMetrics.offlineUsage).toBe(1);
    });
  });

  describe('Tracking Functions', () => {
    describe('trackInstallPrompt', () => {
      it('marca prompt como mostrado', () => {
        const { result } = renderHook(() => usePWAAnalytics());

        act(() => {
          result.current.trackInstallPrompt();
        });

        expect(result.current.analytics.installPromptShown).toBe(true);
        expect(console.log).toHaveBeenCalledWith('PWA Analytics: Install prompt shown');
      });
    });

    describe('trackInstallation', () => {
      it('trackeia instalação via browser prompt', () => {
        const { result } = renderHook(() => usePWAAnalytics());

        act(() => {
          result.current.trackInstallation('browser-prompt');
        });

        expect(result.current.analytics.installationSource).toBe('browser-prompt');
        expect(result.current.analytics.isInstalled).toBe(true);
        expect(console.log).toHaveBeenCalledWith('PWA Analytics: Installation tracked - Source: browser-prompt');
      });

      it('trackeia instalação manual', () => {
        const { result } = renderHook(() => usePWAAnalytics());

        act(() => {
          result.current.trackInstallation('manual');
        });

        expect(result.current.analytics.installationSource).toBe('manual');
        expect(result.current.analytics.isInstalled).toBe(true);
        expect(console.log).toHaveBeenCalledWith('PWA Analytics: Installation tracked - Source: manual');
      });
    });

    describe('trackPageView', () => {
      it('incrementa contador de page views', () => {
        const { result } = renderHook(() => usePWAAnalytics());

        act(() => {
          result.current.trackPageView('/home');
        });

        expect(result.current.analytics.usageMetrics.pageViews).toBe(1);
        expect(console.log).toHaveBeenCalledWith('PWA Analytics: Page view - /home');
      });

      it('incrementa contador múltiplas vezes', () => {
        const { result } = renderHook(() => usePWAAnalytics());

        act(() => {
          result.current.trackPageView('/home');
          result.current.trackPageView('/generator');
          result.current.trackPageView('/dashboard');
        });

        expect(result.current.analytics.usageMetrics.pageViews).toBe(3);
      });
    });

    describe('trackOfflineUsage', () => {
      it('incrementa contador de uso offline', () => {
        const { result } = renderHook(() => usePWAAnalytics());

        act(() => {
          result.current.trackOfflineUsage();
        });

        expect(result.current.analytics.usageMetrics.offlineUsage).toBe(1);
        expect(console.log).toHaveBeenCalledWith('PWA Analytics: Offline usage tracked');
      });

      it('incrementa contador múltiplas vezes', () => {
        const { result } = renderHook(() => usePWAAnalytics());

        act(() => {
          result.current.trackOfflineUsage();
          result.current.trackOfflineUsage();
        });

        expect(result.current.analytics.usageMetrics.offlineUsage).toBe(2);
      });
    });

    describe('trackError', () => {
      it('loga erro com contexto', () => {
        const { result } = renderHook(() => usePWAAnalytics());

        act(() => {
          result.current.trackError('Test error message', 'component-test');
        });

        expect(console.error).toHaveBeenCalledWith(
          'PWA Analytics: Error in component-test:',
          'Test error message'
        );
      });

      it('loga diferentes tipos de erro', () => {
        const { result } = renderHook(() => usePWAAnalytics());

        act(() => {
          result.current.trackError('Network error', 'api-call');
          result.current.trackError('Parse error', 'json-parsing');
        });

        expect(console.error).toHaveBeenCalledTimes(2);
        expect(console.error).toHaveBeenNthCalledWith(
          1,
          'PWA Analytics: Error in api-call:',
          'Network error'
        );
        expect(console.error).toHaveBeenNthCalledWith(
          2,
          'PWA Analytics: Error in json-parsing:',
          'Parse error'
        );
      });
    });
  });

  describe('Export Analytics', () => {
    it('exporta relatório completo em JSON', () => {
      const { result } = renderHook(() => usePWAAnalytics());

      // Adicionar alguns dados primeiro
      act(() => {
        result.current.trackInstallPrompt();
        result.current.trackPageView('/home');
      });

      const report = result.current.exportAnalytics();
      const parsedReport = JSON.parse(report);

      expect(parsedReport).toHaveProperty('timestamp');
      expect(parsedReport).toHaveProperty('analytics');
      expect(parsedReport).toHaveProperty('sessionInfo');

      expect(parsedReport.analytics.installPromptShown).toBe(true);
      expect(parsedReport.analytics.usageMetrics.pageViews).toBe(1);

      expect(parsedReport.sessionInfo).toEqual({
        userAgent: 'Mozilla/5.0 (Test Browser)',
        platform: 'Test Platform',
        language: 'pt-BR',
        onLine: true,
      });
    });

    it('inclui timestamp válido no relatório', () => {
      const { result } = renderHook(() => usePWAAnalytics());

      const report = JSON.parse(result.current.exportAnalytics());
      const timestamp = new Date(report.timestamp);

      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.getTime()).toBeGreaterThan(Date.now() - 1000); // Menos de 1s atrás
    });

    it('inclui informações completas da sessão', () => {
      const { result } = renderHook(() => usePWAAnalytics());

      const report = JSON.parse(result.current.exportAnalytics());

      expect(report.sessionInfo.userAgent).toBe('Mozilla/5.0 (Test Browser)');
      expect(report.sessionInfo.platform).toBe('Test Platform');
      expect(report.sessionInfo.language).toBe('pt-BR');
      expect(report.sessionInfo.onLine).toBe(true);
    });
  });

  describe('Cleanup', () => {
    it('remove event listeners ao desmontar', () => {
      const { unmount } = renderHook(() => usePWAAnalytics());

      unmount();

      expect(mockWindow.removeEventListener).toHaveBeenCalledWith('online', expect.any(Function));
      expect(mockWindow.removeEventListener).toHaveBeenCalledWith('offline', expect.any(Function));
    });
  });

  describe('Edge Cases', () => {
    it('lida com localStorage indisponível', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      // Não deve quebrar, deve usar estado padrão
      const { result } = renderHook(() => usePWAAnalytics());

      expect(result.current.analytics.usageMetrics.pageViews).toBe(0);
    });

    it('lida com dados corrompidos no localStorage', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');

      // Deve usar estado padrão quando JSON está inválido
      const { result } = renderHook(() => usePWAAnalytics());

      expect(result.current.analytics.usageMetrics.pageViews).toBe(0);
    });

    it('funciona sem matchMedia', () => {
      mockWindow.matchMedia.mockImplementation(() => {
        throw new Error('matchMedia not supported');
      });

      // Não deve quebrar
      expect(() => {
        renderHook(() => usePWAAnalytics());
      }).not.toThrow();
    });

    it('funciona com navigator limitado', () => {
      Object.defineProperty(navigator, 'standalone', { value: undefined });

      const { result } = renderHook(() => usePWAAnalytics());

      expect(result.current.analytics.isStandalone).toBe(false);
    });
  });
}); 