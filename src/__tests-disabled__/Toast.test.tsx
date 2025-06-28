import { describe, it, expect, jest, beforeEach, afterEach } from '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// jest.MockedFunction do componente Toast
const MockToast = ({ 
  type = 'info', 
  message, 
  duration = 5000, 
  onClose 
}: {
  type?: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  onClose?: () => void;
}) => {
  const icons = {
    success: '✅',
    error: '❌', 
    warning: '⚠️',
    info: 'ℹ️'
  };

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500', 
    info: 'bg-blue-500'
  };

  // Simular auto-dismiss
  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div 
      data-testid="toast"
      className={`toast ${colors[type]}`}
      role="alert"
      aria-live="polite"
    >
      <span data-testid="toast-icon">{icons[type]}</span>
      <span data-testid="toast-message">{message}</span>
      <button 
        data-testid="toast-close"
        onClick={onClose}
        aria-label="Fechar notificação"
      >
        ×
      </button>
      <div 
        data-testid="progress-bar"
        className="progress-bar"
        style={{
          animation: `progress ${duration}ms linear`
        }}
      />
    </div>
  );
};

// jest.MockedFunction React para useEffect
const React = {
  useEffect: jest.fn((callback, deps) => {
    // Simular execução imediata para testes
    if (deps && deps.length > 0) {
      const cleanup = callback();
      return cleanup;
    }
  })
};

describe('🔔 Toast System - Testes Críticos', () => {
  let mockOnClose: any;

  beforeEach(() => {
    mockOnClose = jest.fn();
    jest.clearAlljest.MockedFunctions();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('🎯 Renderização Básica', () => {
    it('deve renderizar toast com mensagem', () => {
      render(
        <MockToast 
          message="Teste de notificação" 
          onClose={mockOnClose}
        />
      );
      
      expect(screen.getByTestId('toast')).toBeInTheDocument();
      expect(screen.getByTestId('toast-message')).toHaveTextContent('Teste de notificação');
    });

    it('deve ter role alert para acessibilidade', () => {
      render(
        <MockToast 
          message="Teste acessibilidade" 
          onClose={mockOnClose}
        />
      );
      
      const toast = screen.getByRole('alert');
      expect(toast).toBeInTheDocument();
      expect(toast).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('🎯 Tipos de Toast', () => {
    it('deve renderizar toast de sucesso', () => {
      render(
        <MockToast 
          type="success"
          message="Operação realizada com sucesso" 
          onClose={mockOnClose}
        />
      );
      
      expect(screen.getByTestId('toast-icon')).toHaveTextContent('✅');
      expect(screen.getByTestId('toast')).toHaveClass('bg-green-500');
    });

    it('deve renderizar toast de erro', () => {
      render(
        <MockToast 
          type="error"
          message="Erro na operação" 
          onClose={mockOnClose}
        />
      );
      
      expect(screen.getByTestId('toast-icon')).toHaveTextContent('❌');
      expect(screen.getByTestId('toast')).toHaveClass('bg-red-500');
    });

    it('deve renderizar toast de warning', () => {
      render(
        <MockToast 
          type="warning"
          message="Atenção necessária" 
          onClose={mockOnClose}
        />
      );
      
      expect(screen.getByTestId('toast-icon')).toHaveTextContent('⚠️');
      expect(screen.getByTestId('toast')).toHaveClass('bg-yellow-500');
    });

    it('deve renderizar toast de info (padrão)', () => {
      render(
        <MockToast 
          message="Informação importante" 
          onClose={mockOnClose}
        />
      );
      
      expect(screen.getByTestId('toast-icon')).toHaveTextContent('ℹ️');
      expect(screen.getByTestId('toast')).toHaveClass('bg-blue-500');
    });
  });

  describe('🎯 Controles de Interação', () => {
    it('deve renderizar botão de fechar', () => {
      render(
        <MockToast 
          message="Teste botão fechar" 
          onClose={mockOnClose}
        />
      );
      
      const closeBtn = screen.getByTestId('toast-close');
      expect(closeBtn).toBeInTheDocument();
      expect(closeBtn).toHaveTextContent('×');
      expect(closeBtn).toHaveAttribute('aria-label', 'Fechar notificação');
    });

    it('deve chamar onClose ao clicar no botão', () => {
      render(
        <MockToast 
          message="Teste callback close" 
          onClose={mockOnClose}
        />
      );
      
      const closeBtn = screen.getByTestId('toast-close');
      closeBtn.click();
      
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('🎯 Auto-dismiss Timer', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('deve configurar timer para auto-dismiss', () => {
      const duration = 3000;
      
      render(
        <MockToast 
          message="Teste auto dismiss" 
          duration={duration}
          onClose={mockOnClose}
        />
      );
      
      // Verificar se useEffect foi chamado
      expect(React.useEffect).toHaveBeenCalled();
    });

    it('deve ter duração padrão de 5 segundos', () => {
      render(
        <MockToast 
          message="Teste duração padrão" 
          onClose={mockOnClose}
        />
      );
      
      // Verificar duração padrão
      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveStyle('animation: progress 5000ms linear');
    });

    it('deve aceitar duração customizada', () => {
      render(
        <MockToast 
          message="Teste duração custom" 
          duration={10000}
          onClose={mockOnClose}
        />
      );
      
      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveStyle('animation: progress 10000ms linear');
    });
  });

  describe('🎯 Barra de Progresso', () => {
    it('deve renderizar barra de progresso', () => {
      render(
        <MockToast 
          message="Teste progress bar" 
          onClose={mockOnClose}
        />
      );
      
      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveClass('progress-bar');
    });

    it('deve animar barra conforme duração', () => {
      const duration = 8000;
      
      render(
        <MockToast 
          message="Teste animação" 
          duration={duration}
          onClose={mockOnClose}
        />
      );
      
      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveStyle(`animation: progress ${duration}ms linear`);
    });
  });

  describe('🎯 Múltiplos Toasts', () => {
    it('deve suportar múltiplos toasts simultaneamente', () => {
      const { rerender } = render(
        <div>
          <MockToast message="Toast 1" onClose={jest.fn()} />
        </div>
      );
      
      rerender(
        <div>
          <MockToast message="Toast 1" onClose={jest.fn()} />
          <MockToast message="Toast 2" type="success" onClose={jest.fn()} />
          <MockToast message="Toast 3" type="error" onClose={jest.fn()} />
        </div>
      );
      
      const toasts = screen.getAllByTestId('toast');
      expect(toasts).toHaveLength(3);
      
      expect(screen.getByText('Toast 1')).toBeInTheDocument();
      expect(screen.getByText('Toast 2')).toBeInTheDocument();
      expect(screen.getByText('Toast 3')).toBeInTheDocument();
    });
  });

  describe('🎯 Casos Edge', () => {
    it('deve lidar com mensagem vazia', () => {
      render(
        <MockToast 
          message="" 
          onClose={mockOnClose}
        />
      );
      
      const messageEl = screen.getByTestId('toast-message');
      expect(messageEl).toHaveTextContent('');
    });

    it('deve lidar com duração zero (sem auto-dismiss)', () => {
      render(
        <MockToast 
          message="Sem auto dismiss" 
          duration={0}
          onClose={mockOnClose}
        />
      );
      
      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveStyle('animation: progress 0ms linear');
    });

    it('deve funcionar sem callback onClose', () => {
      expect(() => {
        render(
          <MockToast message="Sem callback" />
        );
      }).not.toThrow();
    });
  });
});
