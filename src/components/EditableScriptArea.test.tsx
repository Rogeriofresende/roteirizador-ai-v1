import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import EditableScriptArea from './EditableScriptArea';

describe('EditableScriptArea', () => {
  const defaultProps = {
    script: 'Roteiro de exemplo para teste',
    onScriptChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza o textarea com o script fornecido', () => {
    render(<EditableScriptArea {...defaultProps} />);
    
    const textarea = screen.getByDisplayValue('Roteiro de exemplo para teste');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveAttribute('rows');
  });

  it('chama onScriptChange quando texto é modificado', () => {
    render(<EditableScriptArea {...defaultProps} />);
    
    const textarea = screen.getByDisplayValue(defaultProps.script);
    fireEvent.change(textarea, { target: { value: 'Novo texto do roteiro' } });
    
    expect(defaultProps.onScriptChange).toHaveBeenCalledWith('Novo texto do roteiro');
  });

  it('mostra contador de caracteres', () => {
    render(<EditableScriptArea {...defaultProps} showCharCount />);
    
    expect(screen.getByText(/\d+ caracteres?/i)).toBeInTheDocument();
    expect(screen.getByText('25 caracteres')).toBeInTheDocument();
  });

  it('atualiza contador quando texto muda', () => {
    render(<EditableScriptArea {...defaultProps} showCharCount />);
    
    const textarea = screen.getByDisplayValue(defaultProps.script);
    fireEvent.change(textarea, { target: { value: 'Texto curto' } });
    
    expect(screen.getByText('11 caracteres')).toBeInTheDocument();
  });

  it('mostra contador de palavras quando habilitado', () => {
    render(<EditableScriptArea {...defaultProps} showWordCount />);
    
    expect(screen.getByText(/\d+ palavras?/i)).toBeInTheDocument();
    expect(screen.getByText('5 palavras')).toBeInTheDocument();
  });

  it('aplica placeholder quando fornecido', () => {
    const placeholder = 'Digite seu roteiro aqui...';
    render(<EditableScriptArea script="" onScriptChange={vi.fn()} placeholder={placeholder} />);
    
    expect(screen.getByPlaceholderText(placeholder)).toBeInTheDocument();
  });

  it('desabilita textarea quando readOnly', () => {
    render(<EditableScriptArea {...defaultProps} readOnly />);
    
    const textarea = screen.getByDisplayValue(defaultProps.script);
    expect(textarea).toHaveAttribute('readonly');
  });

  it('aplica altura customizada', () => {
    render(<EditableScriptArea {...defaultProps} rows={10} />);
    
    const textarea = screen.getByDisplayValue(defaultProps.script);
    expect(textarea).toHaveAttribute('rows', '10');
  });

  it('suporta autofoco', () => {
    render(<EditableScriptArea {...defaultProps} autoFocus />);
    
    const textarea = screen.getByDisplayValue(defaultProps.script);
    expect(textarea).toHaveFocus();
  });

  it('trata eventos de teclado', () => {
    const onKeyDown = vi.fn();
    render(<EditableScriptArea {...defaultProps} onKeyDown={onKeyDown} />);
    
    const textarea = screen.getByDisplayValue(defaultProps.script);
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });
    
    expect(onKeyDown).toHaveBeenCalled();
  });

  it('suporta salvamento automático', async () => {
    const onAutoSave = vi.fn();
    render(
      <EditableScriptArea 
        {...defaultProps} 
        autoSave 
        autoSaveDelay={100}
        onAutoSave={onAutoSave}
      />
    );
    
    const textarea = screen.getByDisplayValue(defaultProps.script);
    fireEvent.change(textarea, { target: { value: 'Texto modificado' } });
    
    await waitFor(() => {
      expect(onAutoSave).toHaveBeenCalledWith('Texto modificado');
    }, { timeout: 200 });
  });

  it('formata texto automaticamente', () => {
    render(<EditableScriptArea {...defaultProps} autoFormat />);
    
    const textarea = screen.getByDisplayValue(defaultProps.script);
    fireEvent.change(textarea, { target: { value: '   texto   com   espaços   ' } });
    
    // Verifica se espaços extras foram removidos
    expect(defaultProps.onScriptChange).toHaveBeenCalledWith('texto com espaços');
  });

  it('valida tamanho máximo', () => {
    const maxLength = 10;
    render(<EditableScriptArea {...defaultProps} maxLength={maxLength} />);
    
    const textarea = screen.getByDisplayValue(defaultProps.script);
    expect(textarea).toHaveAttribute('maxlength', maxLength.toString());
  });

  it('mostra indicador de limite de caracteres', () => {
    const maxLength = 50;
    render(
      <EditableScriptArea 
        {...defaultProps} 
        maxLength={maxLength}
        showCharCount 
        showLimit
      />
    );
    
    expect(screen.getByText('25/50')).toBeInTheDocument();
  });

  it('destaca texto que excede limite', () => {
    const maxLength = 20;
    render(
      <EditableScriptArea 
        script="Este texto é muito longo para o limite"
        onScriptChange={vi.fn()}
        maxLength={maxLength}
        showCharCount
        highlightLimit
      />
    );
    
    // Verifica se há indicação visual de excesso
    expect(screen.getByText(/\d+\/\d+/)).toBeInTheDocument();
  });

  it('suporta modo de pré-visualização', () => {
    render(<EditableScriptArea {...defaultProps} preview />);
    
    // Em modo preview, deve mostrar o texto mas não como textarea editável
    expect(screen.getByText(defaultProps.script)).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('permite alternar entre edição e preview', () => {
    const { rerender } = render(<EditableScriptArea {...defaultProps} />);
    
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    
    rerender(<EditableScriptArea {...defaultProps} preview />);
    
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByText(defaultProps.script)).toBeInTheDocument();
  });
}); 