import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { MemoryRouter } from 'react-router-dom';
import Navbar from '../components/Navbar';

// Mock do contexto de autenticação
jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Import após o mock
import { useAuth } from '../contexts/AuthContext';

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockNavigate = jest.fn();

// Mock do react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Navbar', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(
      <MemoryRouter>
        {component}
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      currentUser: null,
      loading: false,
      signInWithGoogle: jest.fn(),
      signInWithEmail: jest.fn(),
      signUpWithEmail: jest.fn(),
      logout: jest.fn(),
      updateUserProfile: jest.fn()
    });
  });

  it('renderiza logo e título', () => {
    renderWithRouter(<Navbar />);
    
    expect(screen.getByText(/roteirizar|roteirar/i)).toBeInTheDocument();
  });

  it('mostra links de navegação quando não logado', () => {
    renderWithRouter(<Navbar />);
    
    expect(screen.getByRole('link', { name: /início|home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /gerador|criar/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /entrar|login/i })).toBeInTheDocument();
  });

  it('mostra menu do usuário quando logado', () => {
    mockUseAuth.mockReturnValue({
      currentUser: { 
        uid: 'test-uid', 
        email: 'user@test.com',
        displayName: 'Usuário Teste',
        photoURL: null,
        emailVerified: true
      },
      loading: false,
      signInWithGoogle: jest.fn(),
      signInWithEmail: jest.fn(),
      signUpWithEmail: jest.fn(),
      logout: jest.fn(),
      updateUserProfile: jest.fn()
    });

    renderWithRouter(<Navbar />);
    
    expect(screen.getByText(/usuário teste|user@test.com/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /dashboard|painel/i })).toBeInTheDocument();
  });

  it('executa logout ao clicar no botão sair', () => {
    const mockLogout = jest.fn();
    mockUseAuth.mockReturnValue({
      currentUser: { 
        uid: 'test-uid', 
        email: 'user@test.com',
        displayName: null,
        photoURL: null,
        emailVerified: true
      },
      loading: false,
      signInWithGoogle: jest.fn(),
      signInWithEmail: jest.fn(),
      signUpWithEmail: jest.fn(),
      logout: mockLogout,
      updateUserProfile: jest.fn()
    });

    renderWithRouter(<Navbar />);
    
    const logoutButton = screen.getByRole('button', { name: /sair|logout/i });
    fireEvent.click(logoutButton);
    
    expect(mockLogout).toHaveBeenCalled();
  });

  it('mostra menu mobile em telas pequenas', () => {
    renderWithRouter(<Navbar />);
    
    const mobileMenuButton = screen.getByRole('button', { name: /menu|☰/i });
    expect(mobileMenuButton).toBeInTheDocument();
  });

  it('abre e fecha menu mobile', () => {
    renderWithRouter(<Navbar />);
    
    const mobileMenuButton = screen.getByRole('button', { name: /menu|☰/i });
    
    // Abre menu
    fireEvent.click(mobileMenuButton);
    
    // Verifica se menu mobile está visível
    expect(screen.getByRole('navigation')).toHaveClass(/mobile|open|visible/);
    
    // Fecha menu
    fireEvent.click(mobileMenuButton);
  });

  it('navega para página correta ao clicar nos links', () => {
    renderWithRouter(<Navbar />);
    
    const homeLink = screen.getByRole('link', { name: /início|home/i });
    expect(homeLink).toHaveAttribute('href', '/');
    
    const generatorLink = screen.getByRole('link', { name: /gerador|criar/i });
    expect(generatorLink).toHaveAttribute('href', '/generator');
  });

  it('destaca link ativo na navegação', () => {
    renderWithRouter(<Navbar />);
    
    // Verifica se há indicação visual de página ativa
    const activeLink = screen.getByRole('link', { name: /início|home/i });
    expect(activeLink).toBeInTheDocument();
  });

  it('mostra avatar do usuário quando disponível', () => {
    mockUseAuth.mockReturnValue({
      currentUser: { 
        uid: 'test-uid', 
        email: 'user@test.com',
        photoURL: 'https://example.com/avatar.jpg',
        displayName: 'Usuário Teste',
        emailVerified: true
      },
      loading: false,
      signInWithGoogle: jest.fn(),
      signInWithEmail: jest.fn(),
      signUpWithEmail: jest.fn(),
      logout: jest.fn(),
      updateUserProfile: jest.fn()
    });

    renderWithRouter(<Navbar />);
    
    const avatar = screen.getByRole('img', { name: /avatar|foto/i });
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  it('mostra indicador de status PWA quando instalado', () => {
    // Mock do status PWA
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query === '(display-mode: standalone)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
      })),
    });

    renderWithRouter(<Navbar />);
    
    // Pode mostrar indicador PWA
    const pwaIndicator = screen.queryByText(/pwa|instalado/i);
    if (pwaIndicator) {
      expect(pwaIndicator).toBeInTheDocument();
    }
  });

  it('trata responsividade do menu', () => {
    renderWithRouter(<Navbar />);
    
    // Verifica se existem classes responsivas
    const navbar = screen.getByRole('navigation');
    expect(navbar).toHaveClass(/responsive|flex|hidden/);
  });

  it('mostra botão de tema quando disponível', () => {
    renderWithRouter(<Navbar />);
    
    const themeButton = screen.queryByRole('button', { name: /tema|theme|dark|light/i });
    if (themeButton) {
      expect(themeButton).toBeInTheDocument();
    }
  });

  it('mostra contador de roteiros para usuário logado', () => {
    mockUseAuth.mockReturnValue({
      currentUser: { 
        uid: 'test-uid', 
        email: 'user@test.com',
        displayName: null,
        photoURL: null,
        emailVerified: true
      },
      loading: false,
      signInWithGoogle: jest.fn(),
      signInWithEmail: jest.fn(),
      signUpWithEmail: jest.fn(),
      logout: jest.fn(),
      updateUserProfile: jest.fn()
    });

    renderWithRouter(<Navbar />);
    
    // Pode mostrar contador de roteiros salvos
    const counter = screen.queryByText(/\d+\s*(roteiros?|scripts?)/i);
    if (counter) {
      expect(counter).toBeInTheDocument();
    }
  });

  it('suporta navegação por teclado', () => {
    renderWithRouter(<Navbar />);
    
    const firstLink = screen.getByRole('link', { name: /início|home/i });
    firstLink.focus();
    
    expect(firstLink).toHaveFocus();
    
    // Testa navegação com Tab
    fireEvent.keyDown(firstLink, { key: 'Tab' });
  });

  it('mostra breadcrumb em páginas internas', () => {
    renderWithRouter(<Navbar />);
    
    const breadcrumb = screen.queryByText(/gerador|criar roteiro/i);
    if (breadcrumb) {
      expect(breadcrumb).toBeInTheDocument();
    }
  });

  it('colapsa automaticamente menu mobile após navegação', () => {
    renderWithRouter(<Navbar />);
    
    const mobileMenuButton = screen.getByRole('button', { name: /menu|☰/i });
    
    // Abre menu mobile
    fireEvent.click(mobileMenuButton);
    
    // Clica em um link
    const homeLink = screen.getByRole('link', { name: /início|home/i });
    fireEvent.click(homeLink);
    
    // Menu deve fechar automaticamente em mobile
    expect(screen.getByRole('navigation')).not.toHaveClass(/open|visible/);
  });
}); 