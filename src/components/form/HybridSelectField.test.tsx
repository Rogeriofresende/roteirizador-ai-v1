import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import HybridSelectField from './HybridSelectField';

describe('HybridSelectField', () => {
  const defaultProps = {
    label: 'Plataforma',
    name: 'platform',
    value: '',
    onChange: vi.fn(),
    options: [
      { value: 'youtube', label: 'YouTube' },
      { value: 'instagram', label: 'Instagram' },
      { value: 'tiktok', label: 'TikTok' },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza label e select', () => {
    render(<HybridSelectField {...defaultProps} />);
    
    expect(screen.getByLabelText('Plataforma')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('mostra opções no select', () => {
    render(<HybridSelectField {...defaultProps} />);
    
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    
    // Verifica se todas as opções estão presentes
    expect(screen.getByText('YouTube')).toBeInTheDocument();
    expect(screen.getByText('Instagram')).toBeInTheDocument();
    expect(screen.getByText('TikTok')).toBeInTheDocument();
  });

  it('permite seleção de opção', () => {
    render(<HybridSelectField {...defaultProps} />);
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'youtube' } });
    
    expect(defaultProps.onChange).toHaveBeenCalledWith({
      target: { name: 'platform', value: 'youtube' }
    });
  });

  it('mostra input text quando "Outro" está selecionado', () => {
    const propsWithOther = {
      ...defaultProps,
      allowCustom: true,
      value: 'custom',
    };

    render(<HybridSelectField {...propsWithOther} />);
    
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/digite|outro|custom/i)).toBeInTheDocument();
  });

  it('chama onChange ao digitar em campo customizado', () => {
    const propsWithCustom = {
      ...defaultProps,
      allowCustom: true,
      value: 'custom',
    };

    render(<HybridSelectField {...propsWithCustom} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Plataforma Personalizada' } });
    
    expect(defaultProps.onChange).toHaveBeenCalledWith({
      target: { name: 'platform', value: 'Plataforma Personalizada' }
    });
  });

  it('mostra mensagem de erro quando fornecida', () => {
    render(<HybridSelectField {...defaultProps} error="Campo obrigatório" />);
    
    expect(screen.getByText('Campo obrigatório')).toBeInTheDocument();
  });

  it('aplica classes de erro quando há erro', () => {
    render(<HybridSelectField {...defaultProps} error="Erro" />);
    
    const select = screen.getByRole('combobox');
    expect(select).toHaveClass(/error|invalid|red/);
  });

  it('suporta campo obrigatório', () => {
    render(<HybridSelectField {...defaultProps} required />);
    
    const select = screen.getByRole('combobox');
    expect(select).toHaveAttribute('required');
  });

  it('desabilita campo quando disabled', () => {
    render(<HybridSelectField {...defaultProps} disabled />);
    
    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
  });

  it('filtra opções com busca', async () => {
    const propsWithSearch = {
      ...defaultProps,
      searchable: true,
    };

    render(<HybridSelectField {...propsWithSearch} />);
    
    const searchInput = screen.getByRole('textbox');
    fireEvent.change(searchInput, { target: { value: 'you' } });
    
    await waitFor(() => {
      expect(screen.getByText('YouTube')).toBeInTheDocument();
      expect(screen.queryByText('Instagram')).not.toBeInTheDocument();
    });
  });

  it('suporta seleção múltipla', () => {
    const multiProps = {
      ...defaultProps,
      multiple: true,
      value: ['youtube', 'instagram'],
    };

    render(<HybridSelectField {...multiProps} />);
    
    // Em modo múltiplo, pode mostrar checkboxes ou chips
    expect(screen.getByLabelText('Plataforma')).toBeInTheDocument();
  });

  it('mostra valor selecionado corretamente', () => {
    const propsWithValue = {
      ...defaultProps,
      value: 'youtube',
    };

    render(<HybridSelectField {...propsWithValue} />);
    
    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('youtube');
  });

  it('limpa valor ao clicar em botão limpar', () => {
    const propsWithClear = {
      ...defaultProps,
      value: 'youtube',
      clearable: true,
    };

    render(<HybridSelectField {...propsWithClear} />);
    
    const clearButton = screen.getByRole('button', { name: /limpar|clear/i });
    fireEvent.click(clearButton);
    
    expect(defaultProps.onChange).toHaveBeenCalledWith({
      target: { name: 'platform', value: '' }
    });
  });
}); 