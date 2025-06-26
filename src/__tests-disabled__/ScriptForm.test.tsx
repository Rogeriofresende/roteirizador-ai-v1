import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, jest, beforeEach } from '@testing-library/jest-dom';
import ScriptForm from './ScriptForm';
import { generateScript } from '../services/geminiService';

// jest.MockedFunction do serviço Gemini
jest.mock('../services/geminiService', () => ({
  generateScript: jest.fn(),
}));

const mockGenerateScript = generateScript as jest.MockedFunction;

describe('ScriptForm', () => {
  const mockOnScriptGenerated = jest.fn();

  beforeEach(() => {
    jest.clearAlljest.MockedFunctions();
  });

  it('renderiza todos os campos do formulário', () => {
    render(<ScriptForm onScriptGenerated={mockOnScriptGenerated} />);
    
    expect(screen.getByLabelText(/assunto/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/plataforma/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/duração/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/público-alvo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tom de voz/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /gerar roteiro/i })).toBeInTheDocument();
  });

  it('valida campos obrigatórios', async () => {
    render(<ScriptForm onScriptGenerated={mockOnScriptGenerated} />);
    
    const generateButton = screen.getByRole('button', { name: /gerar roteiro/i });
    fireEvent.click(generateButton);

    // Deve mostrar erro para campo obrigatório
    await waitFor(() => {
      const subjectInput = screen.getByLabelText(/assunto/i);
      expect(subjectInput).toBeInvalid();
    });
  });

  it('gera roteiro com sucesso', async () => {
    const mockScript = 'Roteiro gerado com sucesso!';
    mockGenerateScript.mockResolvedValue(mockScript);

    render(<ScriptForm onScriptGenerated={mockOnScriptGenerated} />);
    
    // Preenche o formulário
    fireEvent.change(screen.getByLabelText(/assunto/i), { 
      target: { value: 'Como fazer café' } 
    });
    
    fireEvent.change(screen.getByLabelText(/plataforma/i), { 
      target: { value: 'youtube' } 
    });

    fireEvent.change(screen.getByLabelText(/duração/i), { 
      target: { value: '60' } 
    });

    // Submete o formulário
    const generateButton = screen.getByRole('button', { name: /gerar roteiro/i });
    fireEvent.click(generateButton);

    // Verifica loading
    expect(screen.getByText(/gerando/i)).toBeInTheDocument();

    // Aguarda conclusão
    await waitFor(() => {
      expect(mockGenerateScript).toHaveBeenCalledWith({
        subject: 'Como fazer café',
        platform: 'youtube',
        duration: '60',
        targetAudience: '',
        tone: '',
        objective: ''
      });
      expect(mockOnScriptGenerated).toHaveBeenCalledWith(mockScript);
    });
  });

  it('trata erro na geração do roteiro', async () => {
    mockGenerateScript.mockRejectedValue(new Error('Erro na API'));

    render(<ScriptForm onScriptGenerated={mockOnScriptGenerated} />);
    
    // Preenche campos obrigatórios
    fireEvent.change(screen.getByLabelText(/assunto/i), { 
      target: { value: 'Teste' } 
    });

    // Submete
    fireEvent.click(screen.getByRole('button', { name: /gerar roteiro/i }));

    // Verifica erro
    await waitFor(() => {
      expect(screen.getByText(/erro.*gerar/i)).toBeInTheDocument();
    });
  });

  it('desabilita botão durante carregamento', async () => {
    mockGenerateScript.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

    render(<ScriptForm onScriptGenerated={mockOnScriptGenerated} />);
    
    fireEvent.change(screen.getByLabelText(/assunto/i), { 
      target: { value: 'Teste' } 
    });

    const generateButton = screen.getByRole('button', { name: /gerar roteiro/i });
    fireEvent.click(generateButton);

    expect(generateButton).toBeDisabled();
  });

  it('permite selecionar diferentes plataformas', () => {
    render(<ScriptForm onScriptGenerated={mockOnScriptGenerated} />);
    
    const platformSelect = screen.getByLabelText(/plataforma/i);
    
    // Verifica se tem as opções principais
    expect(screen.getByRole('option', { name: /youtube/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /tiktok/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /instagram/i })).toBeInTheDocument();
  });

  it('permite configurar duração personalizada', () => {
    render(<ScriptForm onScriptGenerated={mockOnScriptGenerated} />);
    
    const durationInput = screen.getByLabelText(/duração/i);
    fireEvent.change(durationInput, { target: { value: '120' } });
    
    expect(durationInput).toHaveValue('120');
  });

  it('persiste configurações do usuário', () => {
    render(<ScriptForm onScriptGenerated={mockOnScriptGenerated} />);
    
    // Preenche configurações
    fireEvent.change(screen.getByLabelText(/tom de voz/i), { 
      target: { value: 'informal' } 
    });
    
    fireEvent.change(screen.getByLabelText(/público-alvo/i), { 
      target: { value: 'jovens' } 
    });

    // Verifica se os valores ficaram
    expect(screen.getByDisplayValue('informal')).toBeInTheDocument();
    expect(screen.getByDisplayValue('jovens')).toBeInTheDocument();
  });
}); 