/**
 * 🧪 TESTES UNITÁRIOS - SCRIPT WIZARD V9.0
 * 
 * Testes para o wizard de 3 passos de geração de roteiros
 * 
 * @methodology V9.0_NATURAL_LANGUAGE_FIRST
 * @specification ROIA-GR-001
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import ScriptWizard from '../ScriptWizard';

// Mock do ScriptGeneratorEngine
jest.mock('../ScriptGeneratorEngine', () => ({
  ScriptGeneratorEngine: ({ onScriptGenerated, config }: any) => (
    <div data-testid="script-generator-engine">
      <button 
        onClick={() => onScriptGenerated({
          id: 'test-script',
          title: config.title,
          config,
          content: { structure: {}, scenes: [], dialogue: [], directions: [] },
          metadata: { wordCount: 100, estimatedDuration: '5 min', confidence: 0.9, generatedAt: new Date() },
          exportFormats: ['pdf']
        })}
      >
        Generate Test Script
      </button>
    </div>
  )
}));

describe('ScriptWizard', () => {
  const mockOnComplete = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar com título e descrição corretos', () => {
    render(<ScriptWizard onComplete={mockOnComplete} />);

    expect(screen.getByText('Assistente de Roteiros IA')).toBeInTheDocument();
    expect(screen.getByText('Crie roteiros profissionais em 3 passos simples')).toBeInTheDocument();
  });

  it('deve mostrar os 3 passos do wizard', () => {
    render(<ScriptWizard onComplete={mockOnComplete} />);

    expect(screen.getByText('Configuração')).toBeInTheDocument();
    expect(screen.getByText('Detalhes')).toBeInTheDocument();
    expect(screen.getByText('Geração')).toBeInTheDocument();
  });

  it('deve começar no primeiro passo', () => {
    render(<ScriptWizard onComplete={mockOnComplete} />);

    expect(screen.getByText('Título do Roteiro *')).toBeInTheDocument();
    expect(screen.getByDisplayValue('')).toBeInTheDocument(); // Input vazio inicialmente
  });

  it('deve validar título obrigatório no primeiro passo', async () => {
    const user = userEvent.setup();
    render(<ScriptWizard onComplete={mockOnComplete} />);

    const nextButton = screen.getByText('Próximo');
    await user.click(nextButton);

    expect(screen.getByText('Título é obrigatório')).toBeInTheDocument();
  });

  it('deve permitir avançar com título válido', async () => {
    const user = userEvent.setup();
    render(<ScriptWizard onComplete={mockOnComplete} />);

    const titleInput = screen.getByLabelText(/título do roteiro/i);
    await user.type(titleInput, 'Meu Roteiro de Teste');

    const nextButton = screen.getByText('Próximo');
    await user.click(nextButton);

    expect(screen.getByText('Personagens (Opcional)')).toBeInTheDocument();
  });

  it('deve permitir selecionar diferentes configurações', async () => {
    const user = userEvent.setup();
    render(<ScriptWizard onComplete={mockOnComplete} />);

    // Preencher título
    const titleInput = screen.getByLabelText(/título do roteiro/i);
    await user.type(titleInput, 'Teste');

    // Alterar gênero
    const genreSelect = screen.getByLabelText(/gênero/i);
    await user.selectOptions(genreSelect, 'comedy');
    expect(genreSelect).toHaveValue('comedy');

    // Alterar público
    const audienceSelect = screen.getByLabelText(/público-alvo/i);
    await user.selectOptions(audienceSelect, 'teens');
    expect(audienceSelect).toHaveValue('teens');
  });

  it('deve permitir adicionar personagens no segundo passo', async () => {
    const user = userEvent.setup();
    render(<ScriptWizard onComplete={mockOnComplete} />);

    // Preencher título e avançar
    await user.type(screen.getByLabelText(/título do roteiro/i), 'Teste');
    await user.click(screen.getByText('Próximo'));

    // Adicionar personagem
    const characterInput = screen.getByPlaceholderText('Nome do personagem');
    await user.type(characterInput, 'João');
    await user.keyboard('{Enter}');

    expect(screen.getByText('João')).toBeInTheDocument();
    expect(screen.getByText('1/10 personagens')).toBeInTheDocument();
  });

  it('deve permitir adicionar pontos-chave no segundo passo', async () => {
    const user = userEvent.setup();
    render(<ScriptWizard onComplete={mockOnComplete} />);

    // Avançar para segundo passo
    await user.type(screen.getByLabelText(/título do roteiro/i), 'Teste');
    await user.click(screen.getByText('Próximo'));

    // Adicionar ponto-chave
    const keyPointInput = screen.getByPlaceholderText(/explicar benefícios/i);
    await user.type(keyPointInput, 'Introdução ao tema');
    await user.keyboard('{Enter}');

    expect(screen.getByText('Introdução ao tema')).toBeInTheDocument();
    expect(screen.getByText('1/8 pontos-chave')).toBeInTheDocument();
  });

  it('deve limitar número de personagens a 10', async () => {
    const user = userEvent.setup();
    render(<ScriptWizard onComplete={mockOnComplete} />);

    // Avançar para segundo passo
    await user.type(screen.getByLabelText(/título do roteiro/i), 'Teste');
    await user.click(screen.getByText('Próximo'));

    // Adicionar 11 personagens (deve parar em 10)
    const characterInput = screen.getByPlaceholderText('Nome do personagem');
    for (let i = 1; i <= 11; i++) {
      await user.type(characterInput, `Personagem ${i}`);
      await user.keyboard('{Enter}');
    }

    expect(screen.getByText('10/10 personagens')).toBeInTheDocument();
    expect(screen.queryByText('Personagem 11')).not.toBeInTheDocument();
  });

  it('deve permitir remover personagens e pontos-chave', async () => {
    const user = userEvent.setup();
    render(<ScriptWizard onComplete={mockOnComplete} />);

    // Avançar e adicionar personagem
    await user.type(screen.getByLabelText(/título do roteiro/i), 'Teste');
    await user.click(screen.getByText('Próximo'));

    const characterInput = screen.getByPlaceholderText('Nome do personagem');
    await user.type(characterInput, 'João');
    await user.keyboard('{Enter}');

    // Remover personagem
    const removeButton = screen.getByText('Remover');
    await user.click(removeButton);

    expect(screen.queryByText('João')).not.toBeInTheDocument();
    expect(screen.getByText('0/10 personagens')).toBeInTheDocument();
  });

  it('deve mostrar revisão da configuração no terceiro passo', async () => {
    const user = userEvent.setup();
    render(<ScriptWizard onComplete={mockOnComplete} />);

    // Preencher primeiro passo
    await user.type(screen.getByLabelText(/título do roteiro/i), 'Roteiro de Teste');
    await user.click(screen.getByText('Próximo'));

    // Pular segundo passo
    await user.click(screen.getByText('Próximo'));

    // Verificar revisão no terceiro passo
    expect(screen.getByText('Revisão da Configuração')).toBeInTheDocument();
    expect(screen.getByText('Roteiro de Teste')).toBeInTheDocument();
    expect(screen.getByText('educational')).toBeInTheDocument();
  });

  it('deve permitir voltar aos passos anteriores', async () => {
    const user = userEvent.setup();
    render(<ScriptWizard onComplete={mockOnComplete} />);

    // Avançar para terceiro passo
    await user.type(screen.getByLabelText(/título do roteiro/i), 'Teste');
    await user.click(screen.getByText('Próximo'));
    await user.click(screen.getByText('Próximo'));

    // Voltar para segundo passo
    await user.click(screen.getByText('Anterior'));
    expect(screen.getByText('Personagens (Opcional)')).toBeInTheDocument();

    // Voltar para primeiro passo
    await user.click(screen.getByText('Anterior'));
    expect(screen.getByText('Título do Roteiro *')).toBeInTheDocument();
  });

  it('deve chamar onComplete quando roteiro é gerado', async () => {
    const user = userEvent.setup();
    render(<ScriptWizard onComplete={mockOnComplete} />);

    // Completar wizard
    await user.type(screen.getByLabelText(/título do roteiro/i), 'Teste');
    await user.click(screen.getByText('Próximo'));
    await user.click(screen.getByText('Próximo'));
    await user.click(screen.getByText('Gerar Roteiro'));

    // Simular geração do roteiro
    await user.click(screen.getByText('Generate Test Script'));

    expect(mockOnComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Teste',
        id: 'test-script'
      })
    );
  });

  it('deve chamar onCancel quando cancelar é clicado', async () => {
    const user = userEvent.setup();
    render(<ScriptWizard onCancel={mockOnCancel} />);

    const cancelButton = screen.getByText('Cancelar');
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('deve mostrar progresso dos passos corretamente', async () => {
    const user = userEvent.setup();
    render(<ScriptWizard onComplete={mockOnComplete} />);

    expect(screen.getByText('Passo 1 de 3')).toBeInTheDocument();

    await user.type(screen.getByLabelText(/título do roteiro/i), 'Teste');
    await user.click(screen.getByText('Próximo'));

    expect(screen.getByText('Passo 2 de 3')).toBeInTheDocument();

    await user.click(screen.getByText('Próximo'));

    expect(screen.getByText('Passo 3 de 3')).toBeInTheDocument();
  });

  it('deve validar tamanho mínimo do título', async () => {
    const user = userEvent.setup();
    render(<ScriptWizard onComplete={mockOnComplete} />);

    await user.type(screen.getByLabelText(/título do roteiro/i), 'AB');
    await user.click(screen.getByText('Próximo'));

    expect(screen.getByText('Título deve ter pelo menos 3 caracteres')).toBeInTheDocument();
  });

  it('deve mostrar contador de caracteres do título', async () => {
    const user = userEvent.setup();
    render(<ScriptWizard onComplete={mockOnComplete} />);

    const titleInput = screen.getByLabelText(/título do roteiro/i);
    await user.type(titleInput, 'Título de teste');

    expect(screen.getByText('15/100 caracteres')).toBeInTheDocument();
  });

  it('deve desabilitar botão "Anterior" no primeiro passo', () => {
    render(<ScriptWizard onComplete={mockOnComplete} />);

    const previousButton = screen.getByText('Anterior');
    expect(previousButton).toBeDisabled();
  });

  it('deve mostrar botão "Gerar Roteiro" apenas no último passo', async () => {
    const user = userEvent.setup();
    render(<ScriptWizard onComplete={mockOnComplete} />);

    // Primeiro passo - não deve mostrar "Gerar Roteiro"
    expect(screen.queryByText('Gerar Roteiro')).not.toBeInTheDocument();

    // Avançar para último passo
    await user.type(screen.getByLabelText(/título do roteiro/i), 'Teste');
    await user.click(screen.getByText('Próximo'));
    await user.click(screen.getByText('Próximo'));

    expect(screen.getByText('Gerar Roteiro')).toBeInTheDocument();
  });
});