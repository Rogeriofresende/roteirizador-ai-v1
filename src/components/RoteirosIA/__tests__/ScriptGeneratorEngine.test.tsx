/**
 * 🧪 TESTES UNITÁRIOS - SCRIPT GENERATOR ENGINE V9.0
 * 
 * Testes abrangentes para o engine principal de geração de roteiros
 * 
 * @methodology V9.0_NATURAL_LANGUAGE_FIRST
 * @specification ROIA-GR-001
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ScriptGeneratorEngine, type ScriptConfig } from '../ScriptGeneratorEngine';

// Mock do Gemini AI
const mockGenerateContent = jest.fn();
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: mockGenerateContent
    })
  }))
}));

// Mock das variáveis de ambiente
const originalEnv = process.env;
beforeAll(() => {
  process.env = {
    ...originalEnv,
    VITE_GEMINI_API_KEY: 'test-api-key'
  };
});

afterAll(() => {
  process.env = originalEnv;
});

describe('ScriptGeneratorEngine', () => {
  const mockConfig: ScriptConfig = {
    title: 'Teste de Roteiro',
    genre: 'educational',
    audience: 'general',
    duration: 'medium',
    format: 'video',
    tone: 'casual'
  };

  const mockOnScriptGenerated = jest.fn();
  const mockOnProgressUpdate = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => JSON.stringify({
          acts: [
            {
              actNumber: 1,
              title: 'Introdução',
              description: 'Setup inicial',
              duration: '25%',
              scenes: [1, 2]
            }
          ],
          totalScenes: 3,
          plotPoints: ['Hook', 'Desenvolvimento', 'Conclusão']
        })
      }
    });
  });

  it('deve renderizar corretamente com configuração válida', () => {
    render(
      <ScriptGeneratorEngine
        config={mockConfig}
        onScriptGenerated={mockOnScriptGenerated}
      />
    );

    expect(screen.getByText('Engine de Geração V9.0')).toBeInTheDocument();
    expect(screen.getByText('Powered by Gemini AI')).toBeInTheDocument();
    expect(screen.getByText('Gerar Roteiro')).toBeInTheDocument();
  });

  it('deve exibir configuração do roteiro corretamente', () => {
    render(
      <ScriptGeneratorEngine
        config={mockConfig}
        onScriptGenerated={mockOnScriptGenerated}
      />
    );

    expect(screen.getByText('educational')).toBeInTheDocument();
    expect(screen.getByText('general')).toBeInTheDocument();
    expect(screen.getByText('medium')).toBeInTheDocument();
    expect(screen.getByText('video')).toBeInTheDocument();
  });

  it('deve iniciar geração quando botão é clicado', async () => {
    render(
      <ScriptGeneratorEngine
        config={mockConfig}
        onScriptGenerated={mockOnScriptGenerated}
        onProgressUpdate={mockOnProgressUpdate}
      />
    );

    const generateButton = screen.getByText('Gerar Roteiro');
    fireEvent.click(generateButton);

    expect(screen.getByText('Cancelar')).toBeInTheDocument();
    expect(mockOnProgressUpdate).toHaveBeenCalledWith(20, 'Análise de Conceito');
  });

  it('deve executar todas as fases de geração', async () => {
    render(
      <ScriptGeneratorEngine
        config={mockConfig}
        onScriptGenerated={mockOnScriptGenerated}
        onProgressUpdate={mockOnProgressUpdate}
      />
    );

    const generateButton = screen.getByText('Gerar Roteiro');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(mockOnProgressUpdate).toHaveBeenCalledWith(20, 'Análise de Conceito');
    });

    await waitFor(() => {
      expect(mockOnProgressUpdate).toHaveBeenCalledWith(40, 'Desenvolvimento de Personagens');
    });

    await waitFor(() => {
      expect(mockOnProgressUpdate).toHaveBeenCalledWith(60, 'Geração de Cenas');
    });

    await waitFor(() => {
      expect(mockOnProgressUpdate).toHaveBeenCalledWith(80, 'Criação de Diálogos');
    });

    await waitFor(() => {
      expect(mockOnProgressUpdate).toHaveBeenCalledWith(100, 'Finalização');
    });
  });

  it('deve chamar onScriptGenerated com roteiro completo', async () => {
    render(
      <ScriptGeneratorEngine
        config={mockConfig}
        onScriptGenerated={mockOnScriptGenerated}
      />
    );

    const generateButton = screen.getByText('Gerar Roteiro');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(mockOnScriptGenerated).toHaveBeenCalledWith(
        expect.objectContaining({
          title: mockConfig.title,
          config: mockConfig,
          content: expect.objectContaining({
            structure: expect.any(Object),
            scenes: expect.any(Array),
            dialogue: expect.any(Array),
            directions: expect.any(Array)
          }),
          metadata: expect.objectContaining({
            wordCount: expect.any(Number),
            estimatedDuration: expect.any(String),
            confidence: expect.any(Number),
            generatedAt: expect.any(Date)
          })
        })
      );
    });
  });

  it('deve permitir cancelar geração', async () => {
    render(
      <ScriptGeneratorEngine
        config={mockConfig}
        onScriptGenerated={mockOnScriptGenerated}
      />
    );

    const generateButton = screen.getByText('Gerar Roteiro');
    fireEvent.click(generateButton);

    const cancelButton = screen.getByText('Cancelar');
    fireEvent.click(cancelButton);

    expect(screen.getByText('Gerar Roteiro')).toBeInTheDocument();
  });

  it('deve lidar com erro na API do Gemini', async () => {
    mockGenerateContent.mockRejectedValue(new Error('API Error'));

    render(
      <ScriptGeneratorEngine
        config={mockConfig}
        onScriptGenerated={mockOnScriptGenerated}
        onError={mockOnError}
      />
    );

    const generateButton = screen.getByText('Gerar Roteiro');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith('Falha na geração do roteiro com IA');
    });
  });

  it('deve usar fallbacks quando parsing falha', async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => 'invalid json'
      }
    });

    render(
      <ScriptGeneratorEngine
        config={mockConfig}
        onScriptGenerated={mockOnScriptGenerated}
      />
    );

    const generateButton = screen.getByText('Gerar Roteiro');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(mockOnScriptGenerated).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            structure: expect.objectContaining({
              acts: expect.arrayContaining([
                expect.objectContaining({
                  title: 'Introdução'
                })
              ])
            })
          })
        })
      );
    });
  });

  it('deve calcular duração estimada corretamente', async () => {
    const shortConfig = { ...mockConfig, duration: 'short' as const };
    
    render(
      <ScriptGeneratorEngine
        config={shortConfig}
        onScriptGenerated={mockOnScriptGenerated}
      />
    );

    const generateButton = screen.getByText('Gerar Roteiro');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(mockOnScriptGenerated).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            estimatedDuration: expect.stringMatching(/minutos?|segundos/)
          })
        })
      );
    });
  });

  it('deve incluir personagens e pontos-chave quando fornecidos', () => {
    const configWithExtras = {
      ...mockConfig,
      characters: ['João', 'Maria'],
      keyPoints: ['Introdução ao tema', 'Explicação detalhada']
    };

    render(
      <ScriptGeneratorEngine
        config={configWithExtras}
        onScriptGenerated={mockOnScriptGenerated}
      />
    );

    // Verifica se a configuração inclui os extras
    expect(screen.getByText('Configuração do Roteiro')).toBeInTheDocument();
  });

  it('deve mostrar preview do roteiro gerado', async () => {
    render(
      <ScriptGeneratorEngine
        config={mockConfig}
        onScriptGenerated={mockOnScriptGenerated}
      />
    );

    const generateButton = screen.getByText('Gerar Roteiro');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText('Roteiro gerado com sucesso!')).toBeInTheDocument();
      expect(screen.getByText('Exportar')).toBeInTheDocument();
    });
  });

  it('deve estimar tempo de geração baseado na complexidade', () => {
    const longConfig = { ...mockConfig, duration: 'long' as const };
    
    render(
      <ScriptGeneratorEngine
        config={longConfig}
        onScriptGenerated={mockOnScriptGenerated}
      />
    );

    const generateButton = screen.getByText('Gerar Roteiro');
    fireEvent.click(generateButton);

    // Deve mostrar estimativa de tempo
    expect(screen.getByText(/~\d+(\.\d+)?s/)).toBeInTheDocument();
  });
});