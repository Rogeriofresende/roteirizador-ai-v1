import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, jest, beforeEach } from '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import GeneratorPage from './GeneratorPage';
import { useAuth } from '../contexts/AuthContext';

// jest.MockedFunction das dependências
jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../services/geminiService', () => ({
  generateScript: jest.fn(),
}));

const mockUseAuth = useAuth as jest.MockedFunction;

describe('GeneratorPage', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(
      <MemoryRouter>
        {component}
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    jest.clearAlljest.MockedFunctions();
    
    // jest.MockedFunction padrão do usuário autenticado
    mockUseAuth.mockReturnValue({
      currentUser: { uid: 'test-uid', email: 'test@example.com' },
    });
  });

  it('renderiza título da página', () => {
    renderWithRouter(<GeneratorPage />);
    
    expect(screen.getByText(/gerador de roteiros/i)).toBeInTheDocument();
  });

  it('renderiza formulário de geração', () => {
    renderWithRouter(<GeneratorPage />);
    
    expect(screen.getByLabelText(/assunto/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/plataforma/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /gerar roteiro/i })).toBeInTheDocument();
  });

  it('mostra área de resultado após geração', async () => {
    renderWithRouter(<GeneratorPage />);
    
    // Preenche formulário
    fireEvent.change(screen.getByLabelText(/assunto/i), {
      target: { value: 'Teste' }
    });

    // Submete
    fireEvent.click(screen.getByRole('button', { name: /gerar roteiro/i }));

    // Verifica área de resultado
    await waitFor(() => {
      expect(screen.getByText(/resultado/i)).toBeInTheDocument();
    });
  });

  it('permite salvar roteiro quando logado', async () => {
    renderWithRouter(<GeneratorPage />);
    
    // Simula roteiro gerado
    const scriptArea = screen.getByRole('textbox', { name: /roteiro/i });
    fireEvent.change(scriptArea, {
      target: { value: 'Roteiro de teste' }
    });

    // Deve mostrar botão salvar
    expect(screen.getByRole('button', { name: /salvar/i })).toBeInTheDocument();
  });

  it('não mostra botão salvar quando não logado', () => {
    mockUseAuth.mockReturnValue({
      currentUser: null,
    });

    renderWithRouter(<GeneratorPage />);
    
    expect(screen.queryByRole('button', { name: /salvar/i })).not.toBeInTheDocument();
  });

  it('permite compartilhar roteiro', () => {
    renderWithRouter(<GeneratorPage />);
    
    // Simula roteiro gerado
    const scriptArea = screen.getByRole('textbox', { name: /roteiro/i });
    fireEvent.change(scriptArea, {
      target: { value: 'Roteiro para compartilhar' }
    });

    // Deve mostrar botão compartilhar
    expect(screen.getByRole('button', { name: /compartilhar/i })).toBeInTheDocument();
  });

  it('mostra histórico de roteiros para usuário logado', () => {
    renderWithRouter(<GeneratorPage />);
    
    expect(screen.getByText(/histórico/i)).toBeInTheDocument();
  });

  it('permite editar roteiro gerado', () => {
    renderWithRouter(<GeneratorPage />);
    
    const scriptArea = screen.getByRole('textbox', { name: /roteiro/i });
    fireEvent.change(scriptArea, {
      target: { value: 'Roteiro editado' }
    });

    expect(scriptArea).toHaveValue('Roteiro editado');
  });

  it('mostra contagem de caracteres', () => {
    renderWithRouter(<GeneratorPage />);
    
    const scriptArea = screen.getByRole('textbox', { name: /roteiro/i });
    fireEvent.change(scriptArea, {
      target: { value: 'Teste' }
    });

    expect(screen.getByText(/5.*caracteres/i)).toBeInTheDocument();
  });

  it('tem botão para gerar novo roteiro', async () => {
    renderWithRouter(<GeneratorPage />);
    
    // Gera primeiro roteiro
    fireEvent.change(screen.getByLabelText(/assunto/i), {
      target: { value: 'Primeiro teste' }
    });
    fireEvent.click(screen.getByRole('button', { name: /gerar roteiro/i }));

    // Deve mostrar botão para novo roteiro
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /novo roteiro/i })).toBeInTheDocument();
    });
  });

  it('limpa formulário ao gerar novo roteiro', async () => {
    renderWithRouter(<GeneratorPage />);
    
    const subjectInput = screen.getByLabelText(/assunto/i);
    
    // Preenche e gera
    fireEvent.change(subjectInput, {
      target: { value: 'Teste' }
    });
    fireEvent.click(screen.getByRole('button', { name: /gerar roteiro/i }));

    // Clica em novo roteiro
    await waitFor(() => {
      const newButton = screen.getByRole('button', { name: /novo roteiro/i });
      fireEvent.click(newButton);
    });

    // Campo deve estar limpo
    expect(subjectInput).toHaveValue('');
  });
}); 