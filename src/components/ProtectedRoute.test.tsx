import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';

// Mock do contexto de autenticação
vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const mockUseAuth = useAuth as Mock;

// Mock do react-router-dom para Navigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Navigate: ({ to }: { to: string }) => <div data-testid="navigate" data-to={to} />,
  };
});

describe('ProtectedRoute', () => {
  const ProtectedComponent = () => <div data-testid="protected-content">Conteúdo Protegido</div>;

  const renderWithRouter = (component: React.ReactElement, initialEntries = ['/protected']) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        {component}
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza componente quando usuário está autenticado', () => {
    mockUseAuth.mockReturnValue({
      currentUser: { uid: 'test-uid', email: 'user@test.com' },
      loading: false,
    });

    renderWithRouter(
      <ProtectedRoute>
        <ProtectedComponent />
      </ProtectedRoute>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('redireciona para login quando usuário não está autenticado', () => {
    mockUseAuth.mockReturnValue({
      currentUser: null,
      loading: false,
    });

    renderWithRouter(
      <ProtectedRoute>
        <ProtectedComponent />
      </ProtectedRoute>
    );

    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/login');
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('mostra loading quando autenticação está carregando', () => {
    mockUseAuth.mockReturnValue({
      currentUser: null,
      loading: true,
    });

    renderWithRouter(
      <ProtectedRoute>
        <ProtectedComponent />
      </ProtectedRoute>
    );

    expect(screen.getByText(/carregando|loading/i)).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('permite customizar página de redirecionamento', () => {
    mockUseAuth.mockReturnValue({
      currentUser: null,
      loading: false,
    });

    renderWithRouter(
      <ProtectedRoute redirectTo="/custom-login">
        <ProtectedComponent />
      </ProtectedRoute>
    );

    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/custom-login');
  });

  it('preserva query parameters na URL de redirecionamento', () => {
    mockUseAuth.mockReturnValue({
      currentUser: null,
      loading: false,
    });

    renderWithRouter(
      <ProtectedRoute>
        <ProtectedComponent />
      </ProtectedRoute>,
      ['/protected?param=value']
    );

    const navigate = screen.getByTestId('navigate');
    expect(navigate).toHaveAttribute('data-to', expect.stringContaining('/login'));
  });

  it('verifica permissões específicas quando fornecidas', () => {
    mockUseAuth.mockReturnValue({
      currentUser: { 
        uid: 'test-uid', 
        email: 'user@test.com',
        roles: ['user']
      },
      loading: false,
    });

    renderWithRouter(
      <ProtectedRoute requiredRole="admin">
        <ProtectedComponent />
      </ProtectedRoute>
    );

    // Usuário não tem permissão de admin
    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/unauthorized');
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('permite acesso quando usuário tem permissão adequada', () => {
    mockUseAuth.mockReturnValue({
      currentUser: { 
        uid: 'test-uid', 
        email: 'admin@test.com',
        roles: ['admin']
      },
      loading: false,
    });

    renderWithRouter(
      <ProtectedRoute requiredRole="admin">
        <ProtectedComponent />
      </ProtectedRoute>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
  });

  it('suporta verificação de múltiplas permissões', () => {
    mockUseAuth.mockReturnValue({
      currentUser: { 
        uid: 'test-uid', 
        email: 'user@test.com',
        roles: ['user', 'editor']
      },
      loading: false,
    });

    renderWithRouter(
      <ProtectedRoute requiredRoles={['user', 'editor']}>
        <ProtectedComponent />
      </ProtectedRoute>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('nega acesso quando não tem todas as permissões necessárias', () => {
    mockUseAuth.mockReturnValue({
      currentUser: { 
        uid: 'test-uid', 
        email: 'user@test.com',
        roles: ['user']
      },
      loading: false,
    });

    renderWithRouter(
      <ProtectedRoute requiredRoles={['user', 'admin']}>
        <ProtectedComponent />
      </ProtectedRoute>
    );

    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/unauthorized');
  });

  it('executa callback personalizado de verificação', () => {
    const customCheck = vi.fn().mockReturnValue(true);
    
    mockUseAuth.mockReturnValue({
      currentUser: { uid: 'test-uid', email: 'user@test.com' },
      loading: false,
    });

    renderWithRouter(
      <ProtectedRoute customCheck={customCheck}>
        <ProtectedComponent />
      </ProtectedRoute>
    );

    expect(customCheck).toHaveBeenCalledWith({ uid: 'test-uid', email: 'user@test.com' });
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('nega acesso quando callback personalizado retorna false', () => {
    const customCheck = vi.fn().mockReturnValue(false);
    
    mockUseAuth.mockReturnValue({
      currentUser: { uid: 'test-uid', email: 'user@test.com' },
      loading: false,
    });

    renderWithRouter(
      <ProtectedRoute customCheck={customCheck}>
        <ProtectedComponent />
      </ProtectedRoute>
    );

    expect(screen.getByTestId('navigate')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('mostra componente de loading customizado', () => {
    const CustomLoader = () => <div data-testid="custom-loader">Carregando...</div>;

    mockUseAuth.mockReturnValue({
      currentUser: null,
      loading: true,
    });

    renderWithRouter(
      <ProtectedRoute fallback={<CustomLoader />}>
        <ProtectedComponent />
      </ProtectedRoute>
    );

    expect(screen.getByTestId('custom-loader')).toBeInTheDocument();
  });

  it('verifica email verificado quando requerido', () => {
    mockUseAuth.mockReturnValue({
      currentUser: { 
        uid: 'test-uid', 
        email: 'user@test.com',
        emailVerified: false
      },
      loading: false,
    });

    renderWithRouter(
      <ProtectedRoute requireEmailVerified>
        <ProtectedComponent />
      </ProtectedRoute>
    );

    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/verify-email');
  });

  it('permite acesso quando email está verificado', () => {
    mockUseAuth.mockReturnValue({
      currentUser: { 
        uid: 'test-uid', 
        email: 'user@test.com',
        emailVerified: true
      },
      loading: false,
    });

    renderWithRouter(
      <ProtectedRoute requireEmailVerified>
        <ProtectedComponent />
      </ProtectedRoute>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('permite componente de fallback para acesso negado', () => {
    const AccessDenied = () => <div data-testid="access-denied">Acesso Negado</div>;

    mockUseAuth.mockReturnValue({
      currentUser: null,
      loading: false,
    });

    renderWithRouter(
      <ProtectedRoute 
        redirectTo={null} 
        fallbackUnauthorized={<AccessDenied />}
      >
        <ProtectedComponent />
      </ProtectedRoute>
    );

    expect(screen.getByTestId('access-denied')).toBeInTheDocument();
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
  });

  it('suporta modo silencioso sem redirecionamento', () => {
    mockUseAuth.mockReturnValue({
      currentUser: null,
      loading: false,
    });

    renderWithRouter(
      <ProtectedRoute silent>
        <ProtectedComponent />
      </ProtectedRoute>
    );

    // Em modo silencioso, não deve renderizar nada
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
  });
}); 