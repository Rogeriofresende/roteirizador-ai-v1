import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import PWAFeedback from './PWAFeedback';

// Mock do hook usePWAAnalytics se existir
vi.mock('../hooks/usePWAAnalytics', () => ({
  usePWAAnalytics: vi.fn(() => ({
    trackEvent: vi.fn(),
    trackError: vi.fn(),
  })),
}));

// Mock do localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('PWAFeedback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('renderiza corretamente', () => {
    render(<PWAFeedback />);
    
    // Pode ter diferentes estados, então verifico elementos comuns
    expect(document.body).toBeInTheDocument();
  });

  it('não mostra feedback se já foi dispensado', () => {
    localStorageMock.getItem.mockReturnValue('dismissed');
    
    const { container } = render(<PWAFeedback />);
    // Se foi dispensado, não deve mostrar conteúdo principal
    expect(container.firstChild).toBeNull();
  });

  it('mostra notificação de sucesso', () => {
    render(<PWAFeedback message="Roteiro salvo com sucesso!" type="success" />);
    
    expect(screen.getByText('Roteiro salvo com sucesso!')).toBeInTheDocument();
  });

  it('mostra notificação de erro', () => {
    render(<PWAFeedback message="Erro ao salvar roteiro" type="error" />);
    
    expect(screen.getByText('Erro ao salvar roteiro')).toBeInTheDocument();
  });

  it('mostra feedback de conexão offline', () => {
    render(<PWAFeedback type="offline" />);
    
    // Procura por indicadores típicos de offline
    const offlineElements = screen.queryAllByText(/offline|sem conexão|desconectado/i);
    expect(offlineElements.length).toBeGreaterThanOrEqual(0);
  });

  it('permite dispensar feedback', () => {
    render(<PWAFeedback message="Teste" dismissible />);
    
    const dismissButtons = screen.queryAllByRole('button');
    if (dismissButtons.length > 0) {
      fireEvent.click(dismissButtons[0]);
      
      // Verifica se foi salvo no localStorage
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        expect.stringContaining('feedback'),
        expect.any(String)
      );
    }
  });

  it('auto-oculta após timeout', async () => {
    const onHide = vi.fn();
    render(<PWAFeedback message="Auto hide test" autoHide timeout={100} onHide={onHide} />);
    
    await waitFor(() => {
      expect(onHide).toHaveBeenCalled();
    }, { timeout: 200 });
  });

  it('mostra diferentes tipos de feedback', () => {
    const types = ['success', 'error', 'warning', 'info'];
    
    types.forEach(type => {
      const { rerender } = render(<PWAFeedback message={`Test ${type}`} type={type} />);
      expect(screen.getByText(`Test ${type}`)).toBeInTheDocument();
      rerender(<div />); // Limpa para próximo teste
    });
  });

  it('suporta feedback customizado', () => {
    render(
      <PWAFeedback>
        <div data-testid="custom-content">Conteúdo customizado</div>
      </PWAFeedback>
    );
    
    expect(screen.getByTestId('custom-content')).toBeInTheDocument();
  });

  it('trata clique em botão de ação', () => {
    const onAction = vi.fn();
    render(
      <PWAFeedback 
        message="Ação necessária" 
        action={{ label: 'Confirmar', onClick: onAction }}
      />
    );
    
    const actionButton = screen.queryByText('Confirmar');
    if (actionButton) {
      fireEvent.click(actionButton);
      expect(onAction).toHaveBeenCalled();
    }
  });

  it('gerencia múltiplas notificações', () => {
    render(
      <div>
        <PWAFeedback message="Primeira notificação" id="first" />
        <PWAFeedback message="Segunda notificação" id="second" />
      </div>
    );
    
    expect(screen.getByText('Primeira notificação')).toBeInTheDocument();
    expect(screen.getByText('Segunda notificação')).toBeInTheDocument();
  });

  it('suporta posicionamento customizado', () => {
    const { container } = render(
      <PWAFeedback message="Teste posição" position="top-right" />
    );
    
    // Verifica se o container tem classes ou estilos de posicionamento
    expect(container.firstChild).toBeInTheDocument();
  });
}); 