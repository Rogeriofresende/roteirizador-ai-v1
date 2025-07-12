import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { describe, it, expect, jest, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

// Silenciar warnings de console para testes limpos
const originalConsoleWarn = console.warn;
const originalConsoleInfo = console.info;

beforeAll(() => {
  console.warn = jest.fn();
  console.info = jest.fn();
});

afterAll(() => {
  console.warn = originalConsoleWarn;
  console.info = originalConsoleInfo;
});

describe('AuthContext - Demo Mode Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('AuthProvider - Demo Mode', () => {
    it('renderiza filhos com usuário demo quando Firebase não configurado', async () => {
      render(
        <AuthProvider>
          <div data-testid="child">Child content</div>
        </AuthProvider>
      );

      // Em modo demo, filhos são renderizados imediatamente com usuário demo
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('fornece usuário demo consistente', async () => {
      const TestComponent = () => {
        const { currentUser, loading } = useAuth();
        return (
          <div>
            <div data-testid="loading">{loading.toString()}</div>
            <div data-testid="user-email">{currentUser?.email || 'No user'}</div>
            <div data-testid="user-uid">{currentUser?.uid || 'No UID'}</div>
            <div data-testid="user-name">{currentUser?.displayName || 'No Name'}</div>
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
        expect(screen.getByTestId('user-email')).toHaveTextContent('demo@roteirar.ia');
        expect(screen.getByTestId('user-uid')).toHaveTextContent('demo-user');
        expect(screen.getByTestId('user-name')).toHaveTextContent('Usuário Demo');
      });
    });

    it('mantém estado consistente durante re-renders', () => {
      const TestComponent = () => {
        const { currentUser } = useAuth();
        return <div data-testid="user-email">{currentUser?.email || 'No user'}</div>;
      };

      const { rerender } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('user-email')).toHaveTextContent('demo@roteirar.ia');

      // Re-render para verificar consistência
      rerender(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('user-email')).toHaveTextContent('demo@roteirar.ia');
    });
  });

  describe('useAuth hook - Demo Mode', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    it('retorna usuário demo e loading false', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.currentUser).not.toBeNull();
        expect(result.current.currentUser?.email).toBe('demo@roteirar.ia');
        expect(result.current.currentUser?.uid).toBe('demo-user');
      });
    });

    it('fornece permissions e preferences consistentes', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        const user = result.current.currentUser;
        expect(user).toHaveProperty('permissions');
        expect(user).toHaveProperty('preferences');
        expect(user).toHaveProperty('role', 'user');
        expect(user).toHaveProperty('isActive', true);
        expect(user).toHaveProperty('emailVerified', true);
      });
    });

    it('fornece valores padrão quando usado fora do AuthProvider', () => {
      // Em modo demo, o hook funciona mesmo fora do provider (retorna contexto padrão)
      const { result } = renderHook(() => useAuth());

      // Valores padrão do contexto
      expect(result.current.currentUser).toBeNull();
      expect(result.current.loading).toBe(true);
      expect(result.current.isFirebaseEnabled).toBe(false);
      expect(result.current.isAdmin).toBe(false);
      expect(result.current.isUser).toBe(false);
    });
  });

  describe('Context Value - Demo Mode', () => {
    it('fornece estrutura de dados esperada do usuário demo', async () => {
      const TestComponent = () => {
        const auth = useAuth();
        return (
          <div>
            <div data-testid="loading">{auth.loading.toString()}</div>
            <div data-testid="user-uid">{auth.currentUser?.uid}</div>
            <div data-testid="user-email">{auth.currentUser?.email}</div>
            <div data-testid="user-name">{auth.currentUser?.displayName}</div>
            <div data-testid="email-verified">{auth.currentUser?.emailVerified?.toString()}</div>
            <div data-testid="user-role">{(auth.currentUser as any)?.role}</div>
            <div data-testid="user-active">{(auth.currentUser as any)?.isActive?.toString()}</div>
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
        expect(screen.getByTestId('user-uid')).toHaveTextContent('demo-user');
        expect(screen.getByTestId('user-email')).toHaveTextContent('demo@roteirar.ia');
        expect(screen.getByTestId('user-name')).toHaveTextContent('Usuário Demo');
        expect(screen.getByTestId('email-verified')).toHaveTextContent('true');
        expect(screen.getByTestId('user-role')).toHaveTextContent('user');
        expect(screen.getByTestId('user-active')).toHaveTextContent('true');
      });
    });

    it('permite múltiplos componentes acessarem o mesmo contexto demo', async () => {
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
        expect(screen.getByTestId('comp1')).toHaveTextContent('demo@roteirar.ia');
        expect(screen.getByTestId('comp2')).toHaveTextContent('demo-user');
      });
    });
  });

  describe('Demo Mode Stability', () => {
    it('mantém dados consistentes entre múltiplos renders', async () => {
      const { result } = renderHook(() => useAuth(), { 
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider> 
      });

      await waitFor(() => {
        expect(result.current.currentUser?.email).toBe('demo@roteirar.ia');
      });

      const firstUser = result.current.currentUser;

      // Força re-render
      const { result: result2 } = renderHook(() => useAuth(), { 
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider> 
      });

      await waitFor(() => {
        expect(result2.current.currentUser?.email).toBe('demo@roteirar.ia');
        expect(result2.current.currentUser?.uid).toBe(firstUser?.uid);
      });
    });

    it('não gera erros no console em operação normal', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <AuthProvider>
          <div>Test content</div>
        </AuthProvider>
      );

      // Console.error não deve ter sido chamado (apenas console.warn para demo mode)
      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
}); 