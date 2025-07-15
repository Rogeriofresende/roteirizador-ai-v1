import { renderHook, act } from '@testing-library/react';
import { usePWA } from '../../hooks/usePWA';

// Mock Service Worker
const mockServiceWorker = {
  register: jest.fn(),
  ready: Promise.resolve({
    active: {
      postMessage: jest.fn(),
    },
    waiting: null,
    installing: null,
    update: jest.fn(),
    unregister: jest.fn(),
    addEventListener: jest.fn(),
    showNotification: jest.fn(),
    sync: {
      register: jest.fn(),
    },
  }),
  addEventListener: jest.fn(),
  controller: null,
};

// Mock Navigator
Object.defineProperty(navigator, 'serviceWorker', {
  value: mockServiceWorker,
  writable: true,
});

Object.defineProperty(navigator, 'onLine', {
  value: true,
  writable: true,
});

Object.defineProperty(navigator, 'userAgent', {
  value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  writable: true,
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
  writable: true,
});

// Mock Notification
global.Notification = {
  permission: 'default',
  requestPermission: jest.fn().mockResolvedValue('granted'),
} as any;

describe('usePWA Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (navigator.serviceWorker.register as jest.Mock).mockResolvedValue(mockServiceWorker.ready);
  });

  describe('Initial State', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => usePWA());
      
      expect(result.current.isInstalled).toBe(false);
      expect(result.current.isStandalone).toBe(false);
      expect(result.current.isOnline).toBe(true);
      expect(result.current.canInstall).toBe(false);
      expect(result.current.installPromptEvent).toBe(null);
      expect(result.current.swUpdateAvailable).toBe(false);
    });

    it('should detect standalone mode', () => {
      (window.matchMedia as jest.Mock).mockReturnValue({
        matches: true,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      });

      const { result } = renderHook(() => usePWA());
      
      expect(result.current.isStandalone).toBe(true);
      expect(result.current.isInstalled).toBe(true);
    });
  });

  describe('Service Worker Registration', () => {
    it('should register service worker on mount', async () => {
      renderHook(() => usePWA());
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });
      
      expect(navigator.serviceWorker.register).toHaveBeenCalledWith('/sw.js');
    });

    it('should handle service worker registration failure', async () => {
      (navigator.serviceWorker.register as jest.Mock).mockRejectedValue(new Error('Registration failed'));
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      renderHook(() => usePWA());
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });
      
      expect(consoleSpy).toHaveBeenCalledWith('Service Worker registration failed:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('Online/Offline Detection', () => {
    it('should detect online status changes', () => {
      const { result } = renderHook(() => usePWA());
      
      expect(result.current.isOnline).toBe(true);
      
      // Simulate going offline
      Object.defineProperty(navigator, 'onLine', { value: false });
      window.dispatchEvent(new Event('offline'));
      
      expect(result.current.isOnline).toBe(false);
      
      // Simulate coming back online
      Object.defineProperty(navigator, 'onLine', { value: true });
      window.dispatchEvent(new Event('online'));
      
      expect(result.current.isOnline).toBe(true);
    });
  });

  describe('Install Prompt', () => {
    it('should handle beforeinstallprompt event', () => {
      const { result } = renderHook(() => usePWA());
      
      const mockEvent = {
        preventDefault: jest.fn(),
        prompt: jest.fn().mockResolvedValue(undefined),
        userChoice: Promise.resolve({ outcome: 'accepted' }),
      };
      
      act(() => {
        window.dispatchEvent(new CustomEvent('beforeinstallprompt', { detail: mockEvent }));
      });
      
      expect(result.current.canInstall).toBe(true);
      expect(result.current.installPromptEvent).toEqual(mockEvent);
    });

    it('should handle app installed event', () => {
      const { result } = renderHook(() => usePWA());
      
      // First trigger install prompt
      const mockEvent = {
        preventDefault: jest.fn(),
        prompt: jest.fn(),
        userChoice: Promise.resolve({ outcome: 'accepted' }),
      };
      
      act(() => {
        window.dispatchEvent(new CustomEvent('beforeinstallprompt', { detail: mockEvent }));
      });
      
      expect(result.current.canInstall).toBe(true);
      
      // Then trigger app installed
      act(() => {
        window.dispatchEvent(new Event('appinstalled'));
      });
      
      expect(result.current.canInstall).toBe(false);
      expect(result.current.installPromptEvent).toBe(null);
      expect(result.current.isInstalled).toBe(true);
    });

    it('should show install prompt successfully', async () => {
      const { result } = renderHook(() => usePWA());
      
      const mockEvent = {
        preventDefault: jest.fn(),
        prompt: jest.fn().mockResolvedValue(undefined),
        userChoice: Promise.resolve({ outcome: 'accepted' }),
      };
      
      act(() => {
        window.dispatchEvent(new CustomEvent('beforeinstallprompt', { detail: mockEvent }));
      });
      
      let installResult;
      await act(async () => {
        installResult = await result.current.showInstallPrompt();
      });
      
      expect(installResult).toBe(true);
      expect(mockEvent.prompt).toHaveBeenCalled();
      expect(result.current.canInstall).toBe(false);
    });

    it('should handle install prompt rejection', async () => {
      const { result } = renderHook(() => usePWA());
      
      const mockEvent = {
        preventDefault: jest.fn(),
        prompt: jest.fn().mockResolvedValue(undefined),
        userChoice: Promise.resolve({ outcome: 'dismissed' }),
      };
      
      act(() => {
        window.dispatchEvent(new CustomEvent('beforeinstallprompt', { detail: mockEvent }));
      });
      
      let installResult;
      await act(async () => {
        installResult = await result.current.showInstallPrompt();
      });
      
      expect(installResult).toBe(false);
    });
  });

  describe('Service Worker Updates', () => {
    it('should detect service worker updates', async () => {
      const mockRegistration = {
        ...mockServiceWorker.ready,
        addEventListener: jest.fn(),
        installing: {
          addEventListener: jest.fn(),
          state: 'installed',
        },
      };
      
      (navigator.serviceWorker.register as jest.Mock).mockResolvedValue(mockRegistration);
      
      const { result } = renderHook(() => usePWA());
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });
      
      // Simulate updatefound event
      const updateFoundCallback = mockRegistration.addEventListener.mock.calls
        .find(call => call[0] === 'updatefound')?.[1];
      
      if (updateFoundCallback) {
        act(() => {
          updateFoundCallback();
        });
        
        // Simulate statechange event
        const stateChangeCallback = mockRegistration.installing.addEventListener.mock.calls
          .find(call => call[0] === 'statechange')?.[1];
        
        if (stateChangeCallback) {
          // Set up controller to simulate existing service worker
          Object.defineProperty(navigator.serviceWorker, 'controller', {
            value: {},
            writable: true,
          });
          
          act(() => {
            stateChangeCallback();
          });
          
          expect(result.current.swUpdateAvailable).toBe(true);
        }
      }
    });

    it('should update service worker', async () => {
      const mockRegistration = {
        ...mockServiceWorker.ready,
        update: jest.fn().mockResolvedValue(undefined),
        waiting: {
          postMessage: jest.fn(),
        },
      };
      
      (navigator.serviceWorker.register as jest.Mock).mockResolvedValue(mockRegistration);
      
      const { result } = renderHook(() => usePWA());
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });
      
      // Mock window.location.reload
      const originalReload = window.location.reload;
      window.location.reload = jest.fn();
      
      await act(async () => {
        await result.current.updateServiceWorker();
      });
      
      expect(mockRegistration.update).toHaveBeenCalled();
      expect(mockRegistration.waiting.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });
      expect(window.location.reload).toHaveBeenCalled();
      
      // Restore original reload
      window.location.reload = originalReload;
    });
  });

  describe('Cache Management', () => {
    it('should clear cache', async () => {
      const { result } = renderHook(() => usePWA());
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });
      
      await act(async () => {
        await result.current.clearCache('all');
      });
      
      expect(mockServiceWorker.ready.active.postMessage).toHaveBeenCalledWith({
        type: 'CLEAR_CACHE',
        cacheType: 'all',
      }, expect.any(Array));
    });

    it('should get cache status', async () => {
      const { result } = renderHook(() => usePWA());
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });
      
      const cacheStatusPromise = result.current.getCacheStatus();
      
      expect(mockServiceWorker.ready.active.postMessage).toHaveBeenCalledWith({
        type: 'GET_CACHE_STATUS',
      }, expect.any(Array));
      
      await act(async () => {
        await cacheStatusPromise;
      });
    });

    it('should cache idea', async () => {
      const { result } = renderHook(() => usePWA());
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });
      
      const testIdea = {
        id: 'test-idea',
        title: 'Test Idea',
        description: 'Test description',
      };
      
      await act(async () => {
        await result.current.cacheIdea(testIdea);
      });
      
      expect(mockServiceWorker.ready.active.postMessage).toHaveBeenCalledWith({
        type: 'CACHE_IDEA',
        payload: testIdea,
      });
    });
  });

  describe('Notifications', () => {
    it('should request notification permission', async () => {
      const { result } = renderHook(() => usePWA());
      
      let permission;
      await act(async () => {
        permission = await result.current.requestNotificationPermission();
      });
      
      expect(permission).toBe('granted');
      expect(Notification.requestPermission).toHaveBeenCalled();
    });

    it('should show notification', async () => {
      const { result } = renderHook(() => usePWA());
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });
      
      await act(async () => {
        await result.current.showNotification('Test Title', {
          body: 'Test body',
        });
      });
      
      expect(mockServiceWorker.ready.showNotification).toHaveBeenCalledWith('Test Title', {
        icon: '/icons/android-chrome-192x192.png',
        badge: '/icons/badge-72x72.png',
        body: 'Test body',
      });
    });
  });

  describe('Device Detection', () => {
    it('should detect iOS device', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        writable: true,
      });
      
      const { result } = renderHook(() => usePWA());
      
      expect(result.current.isIOSDevice()).toBe(true);
      expect(result.current.isAndroidDevice()).toBe(false);
    });

    it('should detect Android device', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Linux; Android 10; SM-G975F)',
        writable: true,
      });
      
      const { result } = renderHook(() => usePWA());
      
      expect(result.current.isAndroidDevice()).toBe(true);
      expect(result.current.isIOSDevice()).toBe(false);
    });

    it('should provide install instructions based on device', () => {
      const { result } = renderHook(() => usePWA());
      
      // Test iOS instructions
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        writable: true,
      });
      
      expect(result.current.getInstallInstructions()).toContain('Adicionar à Tela Inicial');
      
      // Test Android instructions
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Linux; Android 10; SM-G975F)',
        writable: true,
      });
      
      expect(result.current.getInstallInstructions()).toContain('Instalar app');
    });
  });

  describe('Background Sync', () => {
    it('should register background sync', async () => {
      const { result } = renderHook(() => usePWA());
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });
      
      await act(async () => {
        await result.current.registerBackgroundSync('sync-ideas');
      });
      
      expect(mockServiceWorker.ready.sync.register).toHaveBeenCalledWith('sync-ideas');
    });
  });

  describe('Utility Functions', () => {
    it('should detect PWA support', () => {
      const { result } = renderHook(() => usePWA());
      
      expect(result.current.isPWASupported()).toBe(true);
    });

    it('should handle absence of PWA support', () => {
      const originalSW = navigator.serviceWorker;
      const originalCaches = window.caches;
      
      delete (navigator as any).serviceWorker;
      delete (window as any).caches;
      
      const { result } = renderHook(() => usePWA());
      
      expect(result.current.isPWASupported()).toBe(false);
      
      // Restore
      (navigator as any).serviceWorker = originalSW;
      (window as any).caches = originalCaches;
    });
  });
}); 