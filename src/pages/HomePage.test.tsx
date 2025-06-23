import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import HomePage from './HomePage';

// Mock do react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('HomePage', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(
      <MemoryRouter>
        {component}
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza título principal', () => {
    renderWithRouter(<HomePage />);
    
    expect(screen.getByText(/roteirizar ia/i)).toBeInTheDocument();
  });

  it('renderiza seção hero com CTA', () => {
    renderWithRouter(<HomePage />);
    
    expect(screen.getByText(/gerar roteiro/i)).toBeInTheDocument();
    expect(screen.getByText(/começar agora/i)).toBeInTheDocument();
  });

  it('mostra features principais', () => {
    renderWithRouter(<HomePage />);
    
    expect(screen.getByText(/ia real/i)).toBeInTheDocument();
    expect(screen.getByText(/plataformas/i)).toBeInTheDocument();
    expect(screen.getByText(/personalização/i)).toBeInTheDocument();
  });

  it('navega para gerador ao clicar no CTA', () => {
    renderWithRouter(<HomePage />);
    
    const ctaButton = screen.getByRole('button', { name: /começar agora/i });
    fireEvent.click(ctaButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/generator');
  });

  it('mostra todas as plataformas suportadas', () => {
    renderWithRouter(<HomePage />);
    
    expect(screen.getByText(/youtube/i)).toBeInTheDocument();
    expect(screen.getByText(/tiktok/i)).toBeInTheDocument();
    expect(screen.getByText(/instagram/i)).toBeInTheDocument();
    expect(screen.getByText(/linkedin/i)).toBeInTheDocument();
  });

  it('tem link para login', () => {
    renderWithRouter(<HomePage />);
    
    const loginLink = screen.getByRole('link', { name: /entrar/i });
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  it('tem seção de FAQ', () => {
    renderWithRouter(<HomePage />);
    
    expect(screen.getByText(/perguntas frequentes/i)).toBeInTheDocument();
  });

  it('é responsivo com breakpoints', () => {
    renderWithRouter(<HomePage />);
    
    // Verifica classes responsivas
    const heroSection = screen.getByRole('main');
    expect(heroSection).toHaveClass(/container|max-w/);
  });
}); 