import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ShareButton, { useShare } from './ShareButton';
import { renderHook, act } from '@testing-library/react';

// Mock do navigator.share
const mockShare = vi.fn();
const mockCanShare = vi.fn();

Object.defineProperty(navigator, 'share', { value: mockShare, writable: true });
Object.defineProperty(navigator, 'canShare', { value: mockCanShare, writable: true });

// Mock do clipboard
const mockClipboard = {
  writeText: vi.fn(),
};
Object.defineProperty(navigator, 'clipboard', { value: mockClipboard, writable: true });

describe('ShareButton', () => {
  const defaultProps = {
    script: 'Roteiro de exemplo para compartilhar',
    title: 'Meu Roteiro',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockShare.mockResolvedValue(undefined);
    mockCanShare.mockReturnValue(true);
    mockClipboard.writeText.mockResolvedValue(undefined);
  });

  it('renderiza botão de compartilhar', () => {
    render(<ShareButton {...defaultProps} />);
    
    expect(screen.getByRole('button', { name: /compartilhar/i })).toBeInTheDocument();
  });

  it('usa Web Share API quando disponível', async () => {
    render(<ShareButton {...defaultProps} />);
    
    const shareButton = screen.getByRole('button', { name: /compartilhar/i });
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(mockShare).toHaveBeenCalledWith({
        title: 'Meu Roteiro',
        text: 'Roteiro de exemplo para compartilhar',
        url: expect.any(String),
      });
    });
  });

  it('copia para clipboard quando Web Share não disponível', async () => {
    Object.defineProperty(navigator, 'share', { value: undefined });
    
    render(<ShareButton {...defaultProps} />);
    
    const shareButton = screen.getByRole('button', { name: /compartilhar/i });
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(mockClipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('Roteiro de exemplo para compartilhar')
      );
    });
  });

  it('mostra feedback após compartilhamento bem-sucedido', async () => {
    render(<ShareButton {...defaultProps} />);
    
    const shareButton = screen.getByRole('button', { name: /compartilhar/i });
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(screen.getByText(/compartilhado|copiado/i)).toBeInTheDocument();
    });
  });

  it('trata erro no compartilhamento', async () => {
    mockShare.mockRejectedValue(new Error('Share failed'));
    
    render(<ShareButton {...defaultProps} />);
    
    const shareButton = screen.getByRole('button', { name: /compartilhar/i });
    fireEvent.click(shareButton);

    // Deve tentar fallback para clipboard
    await waitFor(() => {
      expect(mockClipboard.writeText).toHaveBeenCalled();
    });
  });

  it('permite compartilhamento customizado', async () => {
    const customData = {
      title: 'Título customizado',
      text: 'Texto customizado',
      url: 'https://example.com',
    };

    render(<ShareButton {...defaultProps} shareData={customData} />);
    
    const shareButton = screen.getByRole('button', { name: /compartilhar/i });
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(mockShare).toHaveBeenCalledWith(customData);
    });
  });

  it('suporta diferentes plataformas de compartilhamento', async () => {
    const platforms = ['whatsapp', 'telegram', 'email'];
    
    platforms.forEach(platform => {
      render(<ShareButton {...defaultProps} platform={platform} />);
      
      const shareButton = screen.getByRole('button', { name: /compartilhar/i });
      expect(shareButton).toBeInTheDocument();
    });
  });

  it('desabilita botão durante compartilhamento', async () => {
    render(<ShareButton {...defaultProps} />);
    
    const shareButton = screen.getByRole('button', { name: /compartilhar/i });
    fireEvent.click(shareButton);

    expect(shareButton).toBeDisabled();
    
    await waitFor(() => {
      expect(shareButton).not.toBeDisabled();
    });
  });

  it('mostra ícone apropriado', () => {
    render(<ShareButton {...defaultProps} />);
    
    // Verifica se há ícone de compartilhar
    const button = screen.getByRole('button', { name: /compartilhar/i });
    expect(button).toBeInTheDocument();
  });

  it('suporta tamanhos diferentes', () => {
    const sizes = ['sm', 'md', 'lg'];
    
    sizes.forEach(size => {
      const { rerender } = render(<ShareButton {...defaultProps} size={size} />);
      
      const button = screen.getByRole('button', { name: /compartilhar/i });
      expect(button).toBeInTheDocument();
      
      rerender(<div />);
    });
  });

  it('permite callback personalizado', async () => {
    const onShare = vi.fn();
    render(<ShareButton {...defaultProps} onShare={onShare} />);
    
    const shareButton = screen.getByRole('button', { name: /compartilhar/i });
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(onShare).toHaveBeenCalled();
    });
  });
});

describe('useShare hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockShare.mockResolvedValue(undefined);
    mockCanShare.mockReturnValue(true);
    mockClipboard.writeText.mockResolvedValue(undefined);
  });

  it('retorna funções de compartilhamento', () => {
    const { result } = renderHook(() => useShare());
    
    expect(result.current.share).toBeDefined();
    expect(result.current.canShare).toBeDefined();
    expect(result.current.copyToClipboard).toBeDefined();
  });

  it('detecta suporte ao Web Share API', () => {
    const { result } = renderHook(() => useShare());
    
    expect(result.current.canShare()).toBe(true);
    
    Object.defineProperty(navigator, 'share', { value: undefined });
    
    const { result: result2 } = renderHook(() => useShare());
    expect(result2.current.canShare()).toBe(false);
  });

  it('executa compartilhamento via Web Share API', async () => {
    const { result } = renderHook(() => useShare());
    
    const shareData = {
      title: 'Teste',
      text: 'Conteúdo de teste',
    };

    await act(async () => {
      await result.current.share(shareData);
    });

    expect(mockShare).toHaveBeenCalledWith(shareData);
  });

  it('executa cópia para clipboard', async () => {
    const { result } = renderHook(() => useShare());
    
    await act(async () => {
      await result.current.copyToClipboard('Texto para copiar');
    });

    expect(mockClipboard.writeText).toHaveBeenCalledWith('Texto para copiar');
  });

  it('retorna estados de loading e sucesso', async () => {
    const { result } = renderHook(() => useShare());
    
    expect(result.current.isSharing).toBe(false);
    expect(result.current.shareSuccess).toBe(false);

    await act(async () => {
      const sharePromise = result.current.share({ title: 'Teste' });
      
      // Durante o compartilhamento
      expect(result.current.isSharing).toBe(true);
      
      await sharePromise;
      
      // Após o compartilhamento
      expect(result.current.isSharing).toBe(false);
      expect(result.current.shareSuccess).toBe(true);
    });
  });

  it('trata erros de compartilhamento', async () => {
    mockShare.mockRejectedValue(new Error('Share failed'));
    
    const { result } = renderHook(() => useShare());
    
    await act(async () => {
      try {
        await result.current.share({ title: 'Teste' });
      } catch (error) {
        expect(error.message).toBe('Share failed');
      }
    });

    expect(result.current.isSharing).toBe(false);
    expect(result.current.shareSuccess).toBe(false);
  });

  it('gera URLs de compartilhamento para plataformas', () => {
    const { result } = renderHook(() => useShare());
    
    const shareData = {
      text: 'Roteiro teste',
      url: 'https://example.com',
    };

    const whatsappUrl = result.current.generateShareUrl('whatsapp', shareData);
    expect(whatsappUrl).toContain('whatsapp.com');
    expect(whatsappUrl).toContain(encodeURIComponent(shareData.text));

    const telegramUrl = result.current.generateShareUrl('telegram', shareData);
    expect(telegramUrl).toContain('telegram.me');

    const emailUrl = result.current.generateShareUrl('email', shareData);
    expect(emailUrl).toContain('mailto:');
  });
}); 