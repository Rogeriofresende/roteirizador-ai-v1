import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { usePWA } from './usePWA';

// Mock da função initializeManifest
vi.mock('../utils/pwa-manifest', () => ({
  initializeManifest: vi.fn(),
}));

// Mock do navigator e window
const mockNavigator = {
  onLine: true,
  serviceWorker: {
    register: vi.fn(),
    getRegistration: vi.fn(),
  },
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
};

const mockWindow = {
  matchMedia: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
  location: { reload: vi.fn() },
};

const mockDocument = {
  hidden: false,
  referrer: '',
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};

Object.defineProperty(global, 'navigator', { value: mockNavigator, writable: true });
Object.defineProperty(global, 'window', { value: mockWindow, writable: true });
Object.defineProperty(global, 'document', { value: mockDocument, writable: true });
Object.defineProperty(global, 'caches', { value: { open: vi.fn() }, writable: true });

describe('usePWA', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset navigator.onLine
    Object.defineProperty(navigator, 'onLine', { value: true, writable: true });
    
    // Mock matchMedia
    mockWindow.matchMedia.mockReturnValue({
      matches: false,
      addListener: vi.fn(),
      removeListener: vi.fn(),
    });
    
    // Mock console métodos
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Inicialização', () => {
    it('inicializa com estado padrão correto', () => {
      const { result } = renderHook(() => usePWA());

      expect(result.current.isInstallable).toBe(false);
      expect(result.current.isInstalled).toBe(false);
      expect(result.current.isOffline).toBe(false);
      expect(result.current.hasUpdate).toBe(false);
      expect(result.current.isSupported).toBe(true);
    });

    it('detecta quando app está instalado (standalone)', () => {
      mockWindow.matchMedia.mockReturnValue({ matches: true });

      const { result } = renderHook(() => usePWA());

      expect(result.current.isInstalled).toBe(true);
    });

    it('detecta quando está offline', () => {
      Object.defineProperty(navigator, 'onLine', { value: false });

      const { result } = renderHook(() => usePWA());

      expect(result.current.isOffline).toBe(true);
    });

    it('registra todos os event listeners necessários', () => {
      renderHook(() => usePWA());

      expect(mockWindow.addEventListener).toHaveBeenCalledWith('beforeinstallprompt', expect.any(Function));
      expect(mockWindow.addEventListener).toHaveBeenCalledWith('appinstalled', expect.any(Function));
      expect(mockWindow.addEventListener).toHaveBeenCalledWith('online', expect.any(Function));
      expect(mockWindow.addEventListener).toHaveBeenCalledWith('offline', expect.any(Function));
      expect(mockDocument.addEventListener).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
    });
  });

  describe('Event Handlers', () => {
    it('trata evento beforeinstallprompt corretamente', () => {
      const { result } = renderHook(() => usePWA());

      const mockEvent = {
        preventDefault: vi.fn(),
        type: 'beforeinstallprompt',
      };

      // Simular o evento
      act(() => {
        const handler = mockWindow.addEventListener.mock.calls.find(
          call => call[0] === 'beforeinstallprompt'
        )?.[1];
        handler?.(mockEvent);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(result.current.isInstallable).toBe(true);
    });

    it('trata evento appinstalled corretamente', () => {
      const { result } = renderHook(() => usePWA());

      act(() => {
        const handler = mockWindow.addEventListener.mock.calls.find(
          call => call[0] === 'appinstalled'
        )?.[1];
        handler?.({});
      });

      expect(result.current.isInstalled).toBe(true);
      expect(result.current.isInstallable).toBe(false);
    });

    it('trata eventos online/offline corretamente', () => {
      const { result } = renderHook(() => usePWA());

      // Simular ficar offline
      act(() => {
        const handler = mockWindow.addEventListener.mock.calls.find(
          call => call[0] === 'offline'
        )?.[1];
        handler?.({});
      });

      expect(result.current.isOffline).toBe(true);

      // Simular voltar online
      act(() => {
        const handler = mockWindow.addEventListener.mock.calls.find(
          call => call[0] === 'online'
        )?.[1];
        handler?.({});
      });

      expect(result.current.isOffline).toBe(false);
    });

    it('trata update de service worker', () => {
      const { result } = renderHook(() => usePWA());

      act(() => {
        const handler = mockWindow.addEventListener.mock.calls.find(
          call => call[0] === 'sw-update-available'
        )?.[1];
        handler?.({});
      });

      expect(result.current.hasUpdate).toBe(true);
    });
  });

  describe('Função install', () => {
    it('instala com sucesso quando prompt está disponível', async () => {
      const mockPrompt = {
        prompt: vi.fn(),
        userChoice: Promise.resolve({ outcome: 'accepted' }),
      };

      const { result } = renderHook(() => usePWA());

      // Simular beforeinstallprompt
      act(() => {
        const handler = mockWindow.addEventListener.mock.calls.find(
          call => call[0] === 'beforeinstallprompt'
        )?.[1];
        handler?.(mockPrompt);
      });

      const installResult = await act(async () => {
        return await result.current.install();
      });

      expect(mockPrompt.prompt).toHaveBeenCalled();
      expect(installResult).toBe(true);
    });

    it('falha quando usuário recusa instalação', async () => {
      const mockPrompt = {
        prompt: vi.fn(),
        userChoice: Promise.resolve({ outcome: 'dismissed' }),
      };

      const { result } = renderHook(() => usePWA());

      act(() => {
        const handler = mockWindow.addEventListener.mock.calls.find(
          call => call[0] === 'beforeinstallprompt'
        )?.[1];
        handler?.(mockPrompt);
      });

      const installResult = await act(async () => {
        return await result.current.install();
      });

      expect(installResult).toBe(false);
    });

    it('retorna false quando não há prompt disponível', async () => {
      const { result } = renderHook(() => usePWA());

      const installResult = await act(async () => {
        return await result.current.install();
      });

      expect(installResult).toBe(false);
    });

    it('trata erros na instalação', async () => {
      const mockPrompt = {
        prompt: vi.fn().mockRejectedValue(new Error('Install failed')),
        userChoice: Promise.resolve({ outcome: 'accepted' }),
      };

      const { result } = renderHook(() => usePWA());

      act(() => {
        const handler = mockWindow.addEventListener.mock.calls.find(
          call => call[0] === 'beforeinstallprompt'
        )?.[1];
        handler?.(mockPrompt);
      });

      const installResult = await act(async () => {
        return await result.current.install();
      });

      expect(installResult).toBe(false);
      expect(console.error).toHaveBeenCalledWith('PWA Hook: Install failed:', expect.any(Error));
    });
  });

  describe('Função update', () => {
    it('executa update quando service worker waiting está disponível', async () => {
      const mockRegistration = {
        waiting: {
          postMessage: vi.fn(),
        },
        update: vi.fn(),
      };

      mockNavigator.serviceWorker.getRegistration.mockResolvedValue(mockRegistration);

      const { result } = renderHook(() => usePWA());

      await act(async () => {
        await result.current.update();
      });

      expect(mockRegistration.waiting.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });
    });

    it('força update quando não há worker waiting', async () => {
      const mockRegistration = {
        waiting: null,
        update: vi.fn(),
      };

      mockNavigator.serviceWorker.getRegistration.mockResolvedValue(mockRegistration);

      const { result } = renderHook(() => usePWA());

      await act(async () => {
        await result.current.update();
      });

      expect(mockRegistration.update).toHaveBeenCalled();
    });

    it('trata erros no update', async () => {
      mockNavigator.serviceWorker.getRegistration.mockRejectedValue(new Error('Update failed'));

      const { result } = renderHook(() => usePWA());

      await act(async () => {
        await result.current.update();
      });

      expect(console.error).toHaveBeenCalledWith('PWA Hook: Update failed:', expect.any(Error));
    });
  });

  describe('Função showInstallPrompt', () => {
    it('mostra prompt quando disponível', () => {
      const mockPrompt = {
        prompt: vi.fn(),
        userChoice: Promise.resolve({ outcome: 'accepted' }),
      };

      const { result } = renderHook(() => usePWA());

      act(() => {
        const handler = mockWindow.addEventListener.mock.calls.find(
          call => call[0] === 'beforeinstallprompt'
        )?.[1];
        handler?.(mockPrompt);
      });

      // Mock alert para instruções manuais
      global.alert = vi.fn();

      act(() => {
        result.current.showInstallPrompt();
      });

      expect(mockPrompt.prompt).toHaveBeenCalled();
    });

    it('mostra instruções manuais quando prompt não está disponível', () => {
      global.alert = vi.fn();
      
      const { result } = renderHook(() => usePWA());

      act(() => {
        result.current.showInstallPrompt();
      });

      expect(global.alert).toHaveBeenCalledWith(expect.stringContaining('Para instalar o app'));
    });

    it('mostra instruções específicas para iOS', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        writable: true,
      });

      global.alert = vi.fn();
      
      const { result } = renderHook(() => usePWA());

      act(() => {
        result.current.showInstallPrompt();
      });

      expect(global.alert).toHaveBeenCalledWith(expect.stringContaining('Safari'));
    });

    it('mostra instruções específicas para Android', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Linux; Android 10)',
        writable: true,
      });

      global.alert = vi.fn();
      
      const { result } = renderHook(() => usePWA());

      act(() => {
        result.current.showInstallPrompt();
      });

      expect(global.alert).toHaveBeenCalledWith(expect.stringContaining('Chrome'));
    });
  });

  describe('Função dismissUpdate', () => {
    it('remove flag de update disponível', () => {
      const { result } = renderHook(() => usePWA());

      // Primeiro simular update disponível
      act(() => {
        const handler = mockWindow.addEventListener.mock.calls.find(
          call => call[0] === 'sw-update-available'
        )?.[1];
        handler?.({});
      });

      expect(result.current.hasUpdate).toBe(true);

      // Agora dispensar
      act(() => {
        result.current.dismissUpdate();
      });

      expect(result.current.hasUpdate).toBe(false);
    });
  });

  describe('Service Worker Registration', () => {
    it('registra service worker com sucesso', async () => {
      const mockRegistration = {
        addEventListener: vi.fn(),
        waiting: null,
      };

      mockNavigator.serviceWorker.register.mockResolvedValue(mockRegistration);

      renderHook(() => usePWA());

      await waitFor(() => {
        expect(mockNavigator.serviceWorker.register).toHaveBeenCalledWith('/sw.js', {
          scope: '/',
        });
      });
    });

    it('trata erro no registro do service worker', async () => {
      mockNavigator.serviceWorker.register.mockRejectedValue(new Error('Registration failed'));

      renderHook(() => usePWA());

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith(
          'PWA Hook: Service worker registration failed:',
          expect.any(Error)
        );
      });
    });
  });

  describe('Cleanup', () => {
    it('remove event listeners ao desmontar', () => {
      const { unmount } = renderHook(() => usePWA());

      unmount();

      expect(mockWindow.removeEventListener).toHaveBeenCalledWith('beforeinstallprompt', expect.any(Function));
      expect(mockWindow.removeEventListener).toHaveBeenCalledWith('appinstalled', expect.any(Function));
      expect(mockWindow.removeEventListener).toHaveBeenCalledWith('online', expect.any(Function));
      expect(mockWindow.removeEventListener).toHaveBeenCalledWith('offline', expect.any(Function));
      expect(mockDocument.removeEventListener).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
    });
  });
}); 