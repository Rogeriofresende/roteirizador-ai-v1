import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import TextareaField from '../components/form/TextareaField';

describe('TextareaField', () => {
  const defaultProps = {
    label: 'Descrição',
    name: 'description',
    value: '',
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza label e textarea', () => {
    render(<TextareaField {...defaultProps} />);
    
    expect(screen.getByLabelText('Descrição')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('chama onChange ao digitar', () => {
    render(<TextareaField {...defaultProps} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Novo texto' } });
    
    expect(defaultProps.onChange).toHaveBeenCalledWith({
      target: { name: 'description', value: 'Novo texto' }
    });
  });

  it('mostra contador de caracteres', () => {
    const propsWithCounter = {
      ...defaultProps,
      value: 'Texto exemplo',
      showCharCount: true,
      maxLength: 100,
    };

    render(<TextareaField {...propsWithCounter} />);
    
    expect(screen.getByText('12/100')).toBeInTheDocument();
  });

  it('aplica limite máximo de caracteres', () => {
    render(<TextareaField {...defaultProps} maxLength={50} />);
    
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('maxlength', '50');
  });

  it('mostra mensagem de erro', () => {
    render(<TextareaField {...defaultProps} error="Campo obrigatório" />);
    
    expect(screen.getByText('Campo obrigatório')).toBeInTheDocument();
  });

  it('permite redimensionamento quando habilitado', () => {
    render(<TextareaField {...defaultProps} resizable />);
    
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveStyle(/resize:\s*(both|vertical)/);
  });
}); 