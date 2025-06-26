import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import PlatformSelector from './PlatformSelector';

describe('PlatformSelector', () => {
  const defaultProps = {
    value: '',
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAlljest.MockedFunctions();
  });

  it('renderiza seletor de plataformas', () => {
    render(<PlatformSelector {...defaultProps} />);
    
    expect(screen.getByLabelText(/plataforma/i)).toBeInTheDocument();
  });

  it('mostra opções de plataformas principais', () => {
    render(<PlatformSelector {...defaultProps} />);
    
    expect(screen.getByText('YouTube')).toBeInTheDocument();
    expect(screen.getByText('Instagram')).toBeInTheDocument();
    expect(screen.getByText('TikTok')).toBeInTheDocument();
  });

  it('permite seleção de plataforma', () => {
    render(<PlatformSelector {...defaultProps} />);
    
    const youtubeOption = screen.getByText('YouTube');
    fireEvent.click(youtubeOption);
    
    expect(defaultProps.onChange).toHaveBeenCalledWith('youtube');
  });

  it('mostra plataforma selecionada', () => {
    render(<PlatformSelector {...defaultProps} value="instagram" />);
    
    const selectedPlatform = screen.getByText('Instagram');
    expect(selectedPlatform).toHaveClass(/selected|active|checked/);
  });

  it('suporta modo de seleção múltipla', () => {
    const multiProps = {
      ...defaultProps,
      multiple: true,
      value: ['youtube', 'instagram'],
    };

    render(<PlatformSelector {...multiProps} />);
    
    // Em modo múltiplo, múltiplas plataformas podem estar selecionadas
    expect(screen.getByText('YouTube')).toHaveClass(/selected|active|checked/);
    expect(screen.getByText('Instagram')).toHaveClass(/selected|active|checked/);
  });

  it('permite opção customizada', () => {
    render(<PlatformSelector {...defaultProps} allowCustom />);
    
    expect(screen.getByText(/outro|custom|personalizada/i)).toBeInTheDocument();
  });

  it('mostra ícones das plataformas', () => {
    render(<PlatformSelector {...defaultProps} showIcons />);
    
    // Verifica se há ícones ou elementos visuais para as plataformas
    const icons = screen.getAllByRole('img');
    expect(icons.length).toBeGreaterThan(0);
  });

  it('filtra plataformas por busca', () => {
    render(<PlatformSelector {...defaultProps} searchable />);
    
    const searchInput = screen.getByPlaceholderText(/buscar|pesquisar/i);
    fireEvent.change(searchInput, { target: { value: 'you' } });
    
    expect(screen.getByText('YouTube')).toBeInTheDocument();
    expect(screen.queryByText('Instagram')).not.toBeInTheDocument();
  });
}); 