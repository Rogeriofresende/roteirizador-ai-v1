import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import InputField from './InputField';

describe('InputField', () => {
  const defaultProps = {
    label: 'Título',
    name: 'title',
    value: '',
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza label e input', () => {
    render(<InputField {...defaultProps} />);
    
    expect(screen.getByLabelText('Título')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('chama onChange ao digitar', () => {
    render(<InputField {...defaultProps} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Novo título' } });
    
    expect(defaultProps.onChange).toHaveBeenCalledWith({
      target: { name: 'title', value: 'Novo título' }
    });
  });

  it('mostra placeholder quando fornecido', () => {
    render(<InputField {...defaultProps} placeholder="Digite o título..." />);
    
    expect(screen.getByPlaceholderText('Digite o título...')).toBeInTheDocument();
  });

  it('aplica tipo de input correto', () => {
    render(<InputField {...defaultProps} type="email" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('mostra mensagem de erro', () => {
    render(<InputField {...defaultProps} error="Campo obrigatório" />);
    
    expect(screen.getByText('Campo obrigatório')).toBeInTheDocument();
  });

  it('aplica classes de erro', () => {
    render(<InputField {...defaultProps} error="Erro" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass(/error|invalid|red/);
  });

  it('desabilita quando disabled', () => {
    render(<InputField {...defaultProps} disabled />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('marca como required quando obrigatório', () => {
    render(<InputField {...defaultProps} required />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('required');
  });

  it('aplica limite máximo de caracteres', () => {
    render(<InputField {...defaultProps} maxLength={50} />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('maxlength', '50');
  });

  it('mostra contador de caracteres quando habilitado', () => {
    const propsWithCounter = {
      ...defaultProps,
      value: 'Exemplo',
      showCharCount: true,
      maxLength: 100,
    };

    render(<InputField {...propsWithCounter} />);
    
    expect(screen.getByText('7/100')).toBeInTheDocument();
  });

  it('mostra ícone quando fornecido', () => {
    render(<InputField {...defaultProps} icon="🔍" />);
    
    expect(screen.getByText('🔍')).toBeInTheDocument();
  });

  it('suporta autofoco', () => {
    render(<InputField {...defaultProps} autoFocus />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveFocus();
  });

  it('permite apenas leitura quando readOnly', () => {
    render(<InputField {...defaultProps} readOnly />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('readonly');
  });

  it('aplica classe CSS customizada', () => {
    render(<InputField {...defaultProps} className="custom-input" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('custom-input');
  });

  it('trata eventos de foco', () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    
    render(<InputField {...defaultProps} onFocus={onFocus} onBlur={onBlur} />);
    
    const input = screen.getByRole('textbox');
    
    fireEvent.focus(input);
    expect(onFocus).toHaveBeenCalled();
    
    fireEvent.blur(input);
    expect(onBlur).toHaveBeenCalled();
  });
}); 