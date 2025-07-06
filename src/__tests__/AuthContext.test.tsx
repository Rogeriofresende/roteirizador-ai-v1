import React from 'react';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { AuthProvider, useAuth } from './AuthContext';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';

// Mock do Firebase Auth
jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(),
}));

// Mock do firebaseConfig
jest.mock('../firebaseConfig', () => ({
  auth: {},
}));

const mockOnAuthStateChanged = onAuthStateChanged as jest.MockedFunction<typeof onAuthStateChanged>;

// Mock user do Firebase
const mockUser: Partial<User> = {
  uid: 'test-uid-123',
  email: 'test@example.com',
  displayName: 'Test User',
  emailVerified: true,
};

describe('AuthContext', () => {
  let unsubscribeMock: ReturnType<typeof jest.fn>;

  beforeEach(() => {
    jest.clearAllMocks();
    unsubscribeMock = jest.fn();
    mockOnAuthStateChanged.mockReturnValue(unsubscribeMock);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('AuthProvider', () => {
    it('inicializa com loading true', () => {
      mockOnAuthStateChanged.mockImplementation((_auth, _callback) => {
        // Não chama callback imediatamente para manter loading
        return unsubscribeMock;
      });

      render(
        <AuthProvider>
          <div data-testid="child">Child content</div>
        </AuthProvider>
      );

      // Filho não deve ser renderizado enquanto loading
      expect(screen.queryByTestId('child')).not.toBeInTheDocument();
    });

    it('renderiza filhos após carregar (sem usuário)', async () => {
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        // Simular Firebase retornando null (não logado)
        setTimeout(() => callback(null), 0);
        return unsubscribeMock;
      });

      render(
        <AuthProvider>
          <div data-testid="child">Child content</div>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('child')).toBeInTheDocument();
      });
    });

    it('renderiza filhos após carregar (com usuário)', async () => {
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        // Simular Firebase retornando usuário logado
        setTimeout(() => callback(mockUser), 0);
        return unsubscribeMock;
      });

      render(
        <AuthProvider>
          <div data-testid="child">Child content</div>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('child')).toBeInTheDocument();
      });
    });

    it('registra listener no Firebase Auth', () => {
      render(
        <AuthProvider>
          <div>Test</div>
        </AuthProvider>
      );

      expect(mockOnAuthStateChanged).toHaveBeenCalledWith(
        {}, // mock auth object
        expect.any(Function)
      );
    });

    it('limpa listener ao desmontar', () => {
      const { unmount } = render(
        <AuthProvider>
          <div>Test</div>
        </AuthProvider>
      );

      unmount();

      expect(unsubscribeMock).toHaveBeenCalled();
    });

    it('atualiza estado quando usuário faz login', async () => {
      let authCallback: ((user: User | null) => void) | null = null;

      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        authCallback = callback;
        return unsubscribeMock;
      });

      const TestComponent = () => {
        const { currentUser, loading } = useAuth();
        return (
          <div>
            <div data-testid="loading">{loading.toString()}</div>
            <div data-testid="user-email">{currentUser?.email || 'No user'}</div>
          </div>
        );
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Simular mudança de estado: usuário faz login
      if (authCallback) {
        authCallback(mockUser as User);
      }

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
        expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
      });
    });

    it('atualiza estado quando usuário faz logout', async () => {
      let authCallback: ((user: User | null) => void) | null = null;

      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        authCallback = callback;
        // Iniciar com usuário logado
        setTimeout(() => callback(mockUser), 0);
        return unsubscribeMock;
      });

      const TestComponent = () => {
        const { currentUser, loading } = useAuth();
        return (
          <div>
            <div data-testid="loading">{loading.toString()}</div>
            <div data-testid="user-email">{currentUser?.email || 'No user'}</div>
          </div>
        );
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Aguardar login inicial
      await waitFor(() => {
        expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
      });

      // Simular logout
      if (authCallback) {
        authCallback(null);
      }

      await waitFor(() => {
        expect(screen.getByTestId('user-email')).toHaveTextContent('No user');
      });
    });
  });

  describe('useAuth hook', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    it('retorna valores iniciais corretos', async () => {
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        setTimeout(() => callback(null), 0);
        return unsubscribeMock;
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Estado inicial
      expect(result.current.loading).toBe(true);
      expect(result.current.currentUser).toBeNull();

      // Após Firebase responder
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('retorna usuário quando logado', async () => {
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        setTimeout(() => callback(mockUser), 0);
        return unsubscribeMock;
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.currentUser).toEqual(mockUser);
      });
    });

    it('retorna null quando não logado', async () => {
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        setTimeout(() => callback(null), 0);
        return unsubscribeMock;
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.currentUser).toBeNull();
      });
    });

    it('atualiza quando estado de auth muda', async () => {
      let authCallback: ((user: User | null) => void) | null = null;

      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        authCallback = callback;
        // Iniciar sem usuário
        setTimeout(() => callback(null), 0);
        return unsubscribeMock;
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Estado inicial: sem usuário
      await waitFor(() => {
        expect(result.current.currentUser).toBeNull();
      });

      // Simular login
      if (authCallback) {
        authCallback(mockUser as User);
      }

      await waitFor(() => {
        expect(result.current.currentUser).toEqual(mockUser);
      });

      // Simular logout
      if (authCallback) {
        authCallback(null);
      }

      await waitFor(() => {
        expect(result.current.currentUser).toBeNull();
      });
    });

    it('trava erro quando usado fora do AuthProvider', () => {
      // Mock console.error para não poluir output dos testes
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useAuth());
      }).toThrow();

      consoleSpy.mockRestore();
    });
  });

  describe('Context Value', () => {
    it('fornece valores corretos para componentes filhos', async () => {
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        setTimeout(() => callback(mockUser), 0);
        return unsubscribeMock;
      });

      const TestComponent = () => {
        const auth = useAuth();
        return (
          <div>
            <div data-testid="loading">{auth.loading.toString()}</div>
            <div data-testid="user-uid">{auth.currentUser?.uid || 'No UID'}</div>
            <div data-testid="user-email">{auth.currentUser?.email || 'No Email'}</div>
            <div data-testid="user-name">{auth.currentUser?.displayName || 'No Name'}</div>
            <div data-testid="email-verified">{auth.currentUser?.emailVerified?.toString() || 'false'}</div>
          </div>
        );
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
        expect(screen.getByTestId('user-uid')).toHaveTextContent('test-uid-123');
        expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
        expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
        expect(screen.getByTestId('email-verified')).toHaveTextContent('true');
      });
    });

    it('permite múltiplos componentes acessarem o mesmo contexto', async () => {
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        setTimeout(() => callback(mockUser), 0);
        return unsubscribeMock;
      });

      const Component1 = () => {
        const { currentUser } = useAuth();
        return <div data-testid="comp1">{currentUser?.email || 'No user'}</div>;
      };

      const Component2 = () => {
        const { currentUser } = useAuth();
        return <div data-testid="comp2">{currentUser?.uid || 'No UID'}</div>;
      };

      render(
        <AuthProvider>
          <Component1 />
          <Component2 />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('comp1')).toHaveTextContent('test@example.com');
        expect(screen.getByTestId('comp2')).toHaveTextContent('test-uid-123');
      });
    });
  });

  describe('Firebase Integration', () => {
    it('lida com mudanças rápidas de estado', async () => {
      let authCallback: ((user: User | null) => void) | null = null;

      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        authCallback = callback;
        return unsubscribeMock;
      });

      const { result } = renderHook(() => useAuth(), { 
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider> 
      });

      // Múltiplas mudanças rápidas
      if (authCallback) {
        authCallback(mockUser as User);
        authCallback(null);
        authCallback(mockUser as User);
      }

      await waitFor(() => {
        expect(result.current.currentUser).toEqual(mockUser);
        expect(result.current.loading).toBe(false);
      });
    });

    it('mantém referência estável do callback', () => {
      const { rerender } = render(
        <AuthProvider>
          <div>Test</div>
        </AuthProvider>
      );

      const firstCall = mockOnAuthStateChanged.mock.calls[0];

      rerender(
        <AuthProvider>
          <div>Test Updated</div>
        </AuthProvider>
      );

      // Não deve registrar novo listener em re-render
      expect(mockOnAuthStateChanged).toHaveBeenCalledTimes(1);
      expect(mockOnAuthStateChanged.mock.calls[0]).toBe(firstCall);
    });
  });
}); 