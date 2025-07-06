import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import SelectField from '../components/form/SelectField';

describe('SelectField', () => {
  const defaultProps = {
    label: 'Categoria',
    name: 'category',
    value: '',
    onChange: jest.fn(),
    options: [
      { value: 'educational', label: 'Educacional' },
      { value: 'entertainment', label: 'Entretenimento' },
      { value: 'business', label: 'Negócios' },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza label e select', () => {
    render(<SelectField {...defaultProps} />);
    
    expect(screen.getByLabelText('Categoria')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('mostra todas as opções', () => {
    render(<SelectField {...defaultProps} />);
    
    expect(screen.getByText('Educacional')).toBeInTheDocument();
    expect(screen.getByText('Entretenimento')).toBeInTheDocument();
    expect(screen.getByText('Negócios')).toBeInTheDocument();
  });

  it('chama onChange ao selecionar opção', () => {
    render(<SelectField {...defaultProps} />);
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'educational' } });
    
    expect(defaultProps.onChange).toHaveBeenCalledWith({
      target: { name: 'category', value: 'educational' }
    });
  });

  it('mostra valor selecionado', () => {
    const propsWithValue = {
      ...defaultProps,
      value: 'business',
    };

    render(<SelectField {...propsWithValue} />);
    
    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('business');
  });

  it('mostra mensagem de erro', () => {
    render(<SelectField {...defaultProps} error="Seleção obrigatória" />);
    
    expect(screen.getByText('Seleção obrigatória')).toBeInTheDocument();
  });

  it('desabilita quando disabled', () => {
    render(<SelectField {...defaultProps} disabled />);
    
    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
  });

  it('marca como required quando obrigatório', () => {
    render(<SelectField {...defaultProps} required />);
    
    const select = screen.getByRole('combobox');
    expect(select).toHaveAttribute('required');
  });
}); 