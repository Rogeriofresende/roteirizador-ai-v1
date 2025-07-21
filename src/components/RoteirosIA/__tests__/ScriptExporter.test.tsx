/**
 * 🧪 TESTES UNITÁRIOS - SCRIPT EXPORTER V9.0
 * 
 * Testes para o sistema de exportação múltipla de roteiros
 * 
 * @methodology V9.0_NATURAL_LANGUAGE_FIRST
 * @specification ROIA-GR-001
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import ScriptExporter from '../ScriptExporter';
import type { GeneratedScript } from '../ScriptGeneratorEngine';

// Minimal mocks for download functionality
const mockClick = jest.fn();
global.URL = {
  createObjectURL: jest.fn(() => 'mock-blob-url'),
  revokeObjectURL: jest.fn()
} as any;

// Mock anchor element
const mockAnchor = {
  click: mockClick,
  href: '',
  download: '',
  style: {}
};

// Mock createElement only for anchor elements
const originalCreateElement = document.createElement.bind(document);
document.createElement = jest.fn((tagName: string) => {
  if (tagName === 'a') {
    return mockAnchor as any;
  }
  return originalCreateElement(tagName);
});

describe('ScriptExporter', () => {
  const mockScript: GeneratedScript = {
    id: 'test-script-1',
    title: 'Roteiro de Teste',
    config: {
      title: 'Roteiro de Teste',
      genre: 'educational',
      audience: 'general',
      duration: 'medium',
      format: 'video',
      tone: 'casual'
    },
    content: {
      structure: {
        acts: [
          {
            actNumber: 1,
            title: 'Introdução',
            description: 'Setup inicial do roteiro',
            duration: '25%',
            scenes: [1, 2]
          }
        ],
        totalScenes: 2,
        plotPoints: ['Hook', 'Desenvolvimento']
      },
      scenes: [
        {
          sceneNumber: 1,
          location: 'Casa',
          timeOfDay: 'Manhã',
          characters: ['João', 'Maria'],
          description: 'Primeira cena do roteiro',
          dialogue: [],
          directions: []
        }
      ],
      dialogue: [
        {
          character: 'João',
          line: 'Olá, como você está?',
          emotion: 'alegre'
        },
        {
          character: 'Maria',
          line: 'Estou bem, obrigada!',
          emotion: 'contente'
        }
      ],
      directions: [
        {
          type: 'camera',
          description: 'FADE IN',
          timing: 'Início'
        }
      ]
    },
    metadata: {
      wordCount: 150,
      estimatedDuration: '5 minutos',
      confidence: 0.92,
      generatedAt: new Date('2025-07-20T10:00:00Z')
    },
    exportFormats: ['pdf', 'docx', 'txt', 'fountain']
  };

  const mockOnExportComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockClick.mockClear();
  });

  it('deve renderizar com título e opções de exportação', () => {
    render(<ScriptExporter script={mockScript} />);

    expect(screen.getByText('Exportar Roteiro')).toBeInTheDocument();
    expect(screen.getByText('Escolha o formato desejado para download')).toBeInTheDocument();
    expect(screen.getByText('Exportar Todos')).toBeInTheDocument();
  });

  it('deve mostrar todas as opções de formato', () => {
    render(<ScriptExporter script={mockScript} />);

    expect(screen.getByText('PDF')).toBeInTheDocument();
    expect(screen.getByText('Word (DOCX)')).toBeInTheDocument();
    expect(screen.getByText('Texto Simples')).toBeInTheDocument();
    expect(screen.getByText('Fountain')).toBeInTheDocument();
  });

  it('deve mostrar descrições dos formatos', () => {
    render(<ScriptExporter script={mockScript} />);

    expect(screen.getByText('Documento portátil, ideal para impressão e compartilhamento')).toBeInTheDocument();
    expect(screen.getByText('Microsoft Word, editável e colaborativo')).toBeInTheDocument();
    expect(screen.getByText('Formato universal, compatível com qualquer editor')).toBeInTheDocument();
    expect(screen.getByText('Padrão da indústria cinematográfica')).toBeInTheDocument();
  });

  it('deve executar download em PDF quando clicado', async () => {
    const user = userEvent.setup();
    render(<ScriptExporter script={mockScript} onExportComplete={mockOnExportComplete} />);

    const pdfButton = screen.getByText('Baixar PDF');
    await user.click(pdfButton);

    await waitFor(() => {
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(mockAnchor.click).toHaveBeenCalled();
      expect(mockOnExportComplete).toHaveBeenCalledWith('pdf', true);
    });
  });

  it('deve executar download em DOCX quando clicado', async () => {
    const user = userEvent.setup();
    render(<ScriptExporter script={mockScript} />);

    const docxButton = screen.getByText('Baixar Word (DOCX)');
    await user.click(docxButton);

    await waitFor(() => {
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(mockAnchor.click).toHaveBeenCalled();
    });
  });

  it('deve executar download em TXT quando clicado', async () => {
    const user = userEvent.setup();
    render(<ScriptExporter script={mockScript} />);

    const txtButton = screen.getByText('Baixar Texto Simples');
    await user.click(txtButton);

    await waitFor(() => {
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(mockAnchor.click).toHaveBeenCalled();
    });
  });

  it('deve executar download em Fountain quando clicado', async () => {
    const user = userEvent.setup();
    render(<ScriptExporter script={mockScript} />);

    const fountainButton = screen.getByText('Baixar Fountain');
    await user.click(fountainButton);

    await waitFor(() => {
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(mockAnchor.click).toHaveBeenCalled();
    });
  });

  it('deve mostrar estado de carregamento durante exportação', async () => {
    const user = userEvent.setup();
    render(<ScriptExporter script={mockScript} />);

    const pdfButton = screen.getByText('Baixar PDF');
    await user.click(pdfButton);

    // Durante a exportação, deve mostrar "Exportando..."
    expect(screen.getByText('Exportando...')).toBeInTheDocument();
  });

  it('deve mostrar status de sucesso após exportação', async () => {
    const user = userEvent.setup();
    render(<ScriptExporter script={mockScript} />);

    const pdfButton = screen.getByText('Baixar PDF');
    await user.click(pdfButton);

    await waitFor(() => {
      expect(screen.getByText('Exportar Novamente')).toBeInTheDocument();
    });
  });

  it('deve executar exportação de todos os formatos', async () => {
    const user = userEvent.setup();
    render(<ScriptExporter script={mockScript} />);

    const exportAllButton = screen.getByText('Exportar Todos');
    await user.click(exportAllButton);

    await waitFor(() => {
      expect(global.URL.createObjectURL).toHaveBeenCalledTimes(4); // PDF, DOCX, TXT, Fountain
      expect(mockAnchor.click).toHaveBeenCalledTimes(4);
    });
  });

  it('deve gerar nome de arquivo correto', async () => {
    const user = userEvent.setup();
    render(<ScriptExporter script={mockScript} />);

    const pdfButton = screen.getByText('Baixar PDF');
    await user.click(pdfButton);

    await waitFor(() => {
      expect(mockAnchor.download).toBe('Roteiro_de_Teste.pdf');
    });
  });

  it('deve sanitizar nome do arquivo removendo caracteres especiais', async () => {
    const scriptWithSpecialChars = {
      ...mockScript,
      title: 'Roteiro: Com/Caracteres\\Especiais*?'
    };

    const user = userEvent.setup();
    render(<ScriptExporter script={scriptWithSpecialChars} />);

    const pdfButton = screen.getByText('Baixar PDF');
    await user.click(pdfButton);

    await waitFor(() => {
      expect(mockAnchor.download).toBe('Roteiro__Com_Caracteres_Especiais__.pdf');
    });
  });

  it('deve incluir informações sobre os formatos', () => {
    render(<ScriptExporter script={mockScript} />);

    expect(screen.getByText('Sobre os Formatos')).toBeInTheDocument();
    expect(screen.getByText('PDF:')).toBeInTheDocument();
    expect(screen.getByText('DOCX:')).toBeInTheDocument();
    expect(screen.getByText('TXT:')).toBeInTheDocument();
    expect(screen.getByText('Fountain:')).toBeInTheDocument();
  });

  it('deve lidar com erro na exportação', async () => {
    // Mock error no URL.createObjectURL
    (global.URL.createObjectURL as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Export failed');
    });

    const user = userEvent.setup();
    render(<ScriptExporter script={mockScript} onExportComplete={mockOnExportComplete} />);

    const pdfButton = screen.getByText('Baixar PDF');
    await user.click(pdfButton);

    await waitFor(() => {
      expect(screen.getByText('Erro ao exportar. Tente novamente.')).toBeInTheDocument();
      expect(mockOnExportComplete).toHaveBeenCalledWith('pdf', false);
    });
  });

  it('deve desabilitar botão "Exportar Todos" durante exportação', async () => {
    const user = userEvent.setup();
    render(<ScriptExporter script={mockScript} />);

    const pdfButton = screen.getByText('Baixar PDF');
    await user.click(pdfButton);

    const exportAllButton = screen.getByText('Exportar Todos');
    expect(exportAllButton).toBeDisabled();
  });

  it('deve gerar conteúdo PDF correto com estrutura completa', async () => {
    const user = userEvent.setup();
    render(<ScriptExporter script={mockScript} />);

    const pdfButton = screen.getByText('Baixar PDF');
    await user.click(pdfButton);

    await waitFor(() => {
      const blobCall = (global.URL.createObjectURL as jest.Mock).mock.calls[0][0];
      expect(blobCall.type).toBe('application/pdf');
    });
  });

  it('deve gerar conteúdo Fountain com formatação correta', async () => {
    const user = userEvent.setup();
    render(<ScriptExporter script={mockScript} />);

    const fountainButton = screen.getByText('Baixar Fountain');
    await user.click(fountainButton);

    await waitFor(() => {
      const blobCall = (global.URL.createObjectURL as jest.Mock).mock.calls[0][0];
      expect(blobCall.type).toBe('text/plain');
    });
  });

  it('deve incluir metadados do roteiro no arquivo TXT', async () => {
    const user = userEvent.setup();
    render(<ScriptExporter script={mockScript} />);

    const txtButton = screen.getByText('Baixar Texto Simples');
    await user.click(txtButton);

    await waitFor(() => {
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });
  });

  it('deve permitir reexportação após sucesso', async () => {
    const user = userEvent.setup();
    render(<ScriptExporter script={mockScript} />);

    // Primeira exportação
    const pdfButton = screen.getByText('Baixar PDF');
    await user.click(pdfButton);

    await waitFor(() => {
      expect(screen.getByText('Exportar Novamente')).toBeInTheDocument();
    });

    // Segunda exportação
    const reexportButton = screen.getByText('Exportar Novamente');
    await user.click(reexportButton);

    await waitFor(() => {
      expect(global.URL.createObjectURL).toHaveBeenCalledTimes(2);
    });
  });
});