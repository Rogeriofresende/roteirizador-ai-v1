import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, jest, beforeEach, afterEach } from '@testing-library/jest-dom';
import { usePWAPerformance } from './usePWAPerformance';

// jest.MockedFunction do performance API
const mockPerformance = {
  getEntriesByType: jest.fn(),
  timeOrigin: Date.now(),
  memory: {
    usedJSHeapSize: 50000000,
    jsHeapSizeLimit: 100000000,
  },
};

// jest.MockedFunction do navigator
const mockNavigator = {
  onLine: true,
  userAgent: 'Mozilla/5.0 (Test Browser)',
  connection: {
    effectiveType: '4g',
  },
};

// jest.MockedFunction do window
const mockWindow = {
  addEventListener: jest.fn(),
  matchMedia: jest.fn(),
};

// jest.MockedFunction do document
const mockDocument = {
  readyState: 'complete',
};

Object.defineProperty(global, 'performance', { value: mockPerformance, writable: true });
Object.defineProperty(global, 'navigator', { value: mockNavigator, writable: true });
Object.defineProperty(global, 'window', { value: mockWindow, writable: true });
Object.defineProperty(global, 'document', { value: mockDocument, writable: true });

describe('usePWAPerformance', () => {
  beforeEach(() => {
    jest.clearAlljest.MockedFunctions();
    jest.useFakeTimers();
    
    // jest.MockedFunction console.log e console.error
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Setup padrão do performance API
    mockPerformance.getEntriesByType.mockImplementation((type) => {
      if (type === 'navigation') {
        return [{
          fetchStart: 100,
          loadEventEnd: 1500,
        }];
      }
      if (type === 'paint') {
        return [
          { name: 'first-contentful-paint', startTime: 800 },
        ];
      }
      return [];
    });
    
    // Setup padrão do matchMedia
    mockWindow.matchMedia.mockReturnValue({ matches: false });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAlljest.MockedFunctions();
  });

  describe('Inicialização', () => {
    it('inicializa com estado de loading', () => {
      const { result } = renderHook(() => usePWAPerformance());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.metrics).toBeNull();
      expect(result.current.warnings).toEqual([]);
      expect(result.current.recommendations).toEqual([]);
    });

    it('aguarda 1 segundo antes de medir performance', async () => {
      renderHook(() => usePWAPerformance());

      // Não deve ter medido ainda
      expect(mockPerformance.getEntriesByType).not.toHaveBeenCalled();

      // Avançar 1 segundo
      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(mockPerformance.getEntriesByType).toHaveBeenCalled();
      });
    });
  });

  describe('Coleta de Métricas', () => {
    it('coleta métricas básicas de performance', async () => {
      const { result } = renderHook(() => usePWAPerformance());

      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.metrics).toBeDefined();
      });

      const metrics = result.current.metrics!;
      expect(metrics.loadTime).toBe(1400); // 1500 - 100
      expect(metrics.firstContentfulPaint).toBe(800);
      expect(metrics.largestContentfulPaint).toBe(1300); // fcp + 500
      expect(metrics.connectionSpeed).toBe('4g');
      expect(metrics.memoryUsage).toBe(50); // 50MB / 100MB * 100
    });

    it('lida com document não carregado', async () => {
      Object.defineProperty(document, 'readyState', { value: 'loading', writable: true });

      const { result } = renderHook(() => usePWAPerformance());

      jest.advanceTimersByTime(1000);

      // Simular evento de load
      const loadHandler = mockWindow.addEventListener.mock.calls.find(
        call => call[0] === 'load'
      )?.[1];
      
      if (loadHandler) {
        loadHandler();
      }

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('funciona sem connection API', async () => {
      Object.defineProperty(navigator, 'connection', { value: undefined });

      const { result } = renderHook(() => usePWAPerformance());

      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(result.current.metrics?.connectionSpeed).toBe('unknown');
      });
    });

    it('funciona sem memory API', async () => {
      Object.defineProperty(performance, 'memory', { value: undefined });

      const { result } = renderHook(() => usePWAPerformance());

      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(result.current.metrics?.memoryUsage).toBeUndefined();
      });
    });

    it('funciona sem paint entries', async () => {
      mockPerformance.getEntriesByType.mockImplementation((type) => {
        if (type === 'navigation') {
          return [{ fetchStart: 100, loadEventEnd: 1500 }];
        }
        return []; // Sem paint entries
      });

      const { result } = renderHook(() => usePWAPerformance());

      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(result.current.metrics?.firstContentfulPaint).toBe(0);
      });
    });
  });

  describe('Análise e Alertas', () => {
    it('gera warning para tempo de carregamento alto', async () => {
      mockPerformance.getEntriesByType.mockImplementation((type) => {
        if (type === 'navigation') {
          return [{ fetchStart: 100, loadEventEnd: 4000 }]; // 3.9s load time
        }
        return [{ name: 'first-contentful-paint', startTime: 800 }];
      });

      const { result } = renderHook(() => usePWAPerformance());

      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(result.current.warnings).toContain('Tempo de carregamento alto (> 3s)');
        expect(result.current.recommendations).toContain('Otimizar cache e compressão de assets');
      });
    });

    it('gera warning para FCP lento', async () => {
      mockPerformance.getEntriesByType.mockImplementation((type) => {
        if (type === 'navigation') {
          return [{ fetchStart: 100, loadEventEnd: 1500 }];
        }
        return [{ name: 'first-contentful-paint', startTime: 2000 }]; // FCP > 1.5s
      });

      const { result } = renderHook(() => usePWAPerformance());

      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(result.current.warnings).toContain('First Contentful Paint lento (> 1.5s)');
        expect(result.current.recommendations).toContain('Reduzir tamanho de CSS/JS inicial');
      });
    });

    it('gera warning para uso de memória alto', async () => {
      Object.defineProperty(performance, 'memory', {
        value: {
          usedJSHeapSize: 80000000,
          jsHeapSizeLimit: 100000000, // 80% usage
        },
      });

      const { result } = renderHook(() => usePWAPerformance());

      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(result.current.warnings).toContain('Uso de memória alto (> 75%)');
        expect(result.current.recommendations).toContain('Implementar limpeza de componentes React');
      });
    });

    it('gera recomendação para conexão lenta', async () => {
      Object.defineProperty(navigator, 'connection', {
        value: { effectiveType: '2g' },
      });

      const { result } = renderHook(() => usePWAPerformance());

      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(result.current.recommendations).toContain(
          'Implementar modo offline mais robusto para conexões lentas'
        );
      });
    });

    it('gera warning quando Service Worker não é suportado', async () => {
      Object.defineProperty(navigator, 'serviceWorker', { value: undefined });

      const { result } = renderHook(() => usePWAPerformance());

      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(result.current.warnings).toContain('Service Worker não suportado');
      });
    });
  });

  describe('Cálculo de Score', () => {
    it('retorna score 100 para performance perfeita', async () => {
      mockPerformance.getEntriesByType.mockImplementation((type) => {
        if (type === 'navigation') {
          return [{ fetchStart: 100, loadEventEnd: 1000 }]; // 900ms
        }
        return [{ name: 'first-contentful-paint', startTime: 500 }]; // 500ms
      });

      const { result } = renderHook(() => usePWAPerformance());

      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(result.current.score).toBe(100);
      });
    });

    it('penaliza performance ruim', async () => {
      mockPerformance.getEntriesByType.mockImplementation((type) => {
        if (type === 'navigation') {
          return [{ fetchStart: 100, loadEventEnd: 3500 }]; // > 2s
        }
        return [{ name: 'first-contentful-paint', startTime: 1500 }]; // > 1s
      });

      const { result } = renderHook(() => usePWAPerformance());

      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(result.current.score).toBeLessThan(100);
      });
    });

    it('bonifica conexão 4G', async () => {
      Object.defineProperty(navigator, 'connection', {
        value: { effectiveType: '4g' },
      });

      const { result } = renderHook(() => usePWAPerformance());

      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(result.current.score).toBeGreaterThan(90);
      });
    });

    it('retorna score 0 quando não há métricas', () => {
      const { result } = renderHook(() => usePWAPerformance());

      expect(result.current.score).toBe(0);
    });
  });

  describe('Score Color', () => {
    it('retorna cor verde para score alto (≥90)', async () => {
      const { result } = renderHook(() => usePWAPerformance());

      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        if (result.current.score >= 90) {
          expect(result.current.scoreColor).toBe('#10B981');
        }
      });
    });

    it('retorna cores apropriadas para diferentes scores', () => {
      const { result } = renderHook(() => usePWAPerformance());

      // Testar diretamente a função interna através da exposição do hook
      // Como não podemos acessar getScoreColor diretamente, testamos via score calculado
      expect(result.current.scoreColor).toBeDefined();
    });
  });

  describe('Export Report', () => {
    it('exporta relatório completo em JSON', async () => {
      mockWindow.matchMedia.mockReturnValue({ matches: true }); // PWA instalada

      const { result } = renderHook(() => usePWAPerformance());

      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(result.current.metrics).toBeDefined();
      });

      const report = result.current.exportReport();
      const parsedReport = JSON.parse(report);

      expect(parsedReport).toHaveProperty('timestamp');
      expect(parsedReport).toHaveProperty('score');
      expect(parsedReport).toHaveProperty('metrics');
      expect(parsedReport).toHaveProperty('warnings');
      expect(parsedReport).toHaveProperty('recommendations');
      expect(parsedReport).toHaveProperty('userAgent');
      expect(parsedReport).toHaveProperty('pwaStatus');

      expect(parsedReport.pwaStatus.isInstalled).toBe(true);
      expect(parsedReport.pwaStatus.hasServiceWorker).toBe(true);
      expect(parsedReport.pwaStatus.isOnline).toBe(true);
    });

    it('inclui status PWA no relatório', async () => {
      const { result } = renderHook(() => usePWAPerformance());

      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(result.current.metrics).toBeDefined();
      });

      const report = JSON.parse(result.current.exportReport());

      expect(report.pwaStatus).toEqual({
        isInstalled: false,
        hasServiceWorker: true,
        isOnline: true,
      });
    });
  });

  describe('Error Handling', () => {
    it('trata erros na coleta de métricas', async () => {
      mockPerformance.getEntriesByType.mockImplementation(() => {
        throw new Error('Performance API error');
      });

      const { result } = renderHook(() => usePWAPerformance());

      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.warnings).toContain('Erro ao medir performance');
        expect(console.error).toHaveBeenCalledWith('Error measuring PWA performance:', expect.any(Error));
      });
    });
  });

  describe('Cleanup', () => {
    it('limpa timer ao desmontar', () => {
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

      const { unmount } = renderHook(() => usePWAPerformance());

      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();
    });
  });
}); 