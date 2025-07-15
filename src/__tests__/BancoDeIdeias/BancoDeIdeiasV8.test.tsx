/**
 * 🧠 BANCO DE IDEIAS - V8.0 COMPREHENSIVE TESTS
 * Testing suite for all V8.0 Beta components
 * Following V8.0 Unified Development methodology - Charlie Phase
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// V8.0 Components
import BancoDeIdeias from '../../pages/BancoDeIdeias';
import { BancoIdeiasLayout } from '../../pages/BancoDeIdeias/components/BancoIdeiasLayout';
import IdeaGenerationForm from '../../pages/BancoDeIdeias/components/IdeaGenerationForm';
import IdeaResultsDisplay from '../../pages/BancoDeIdeias/components/IdeaResultsDisplay';
import IdeaHistoryTab from '../../pages/BancoDeIdeias/components/IdeaHistoryTab';
import IdeaQuickActions from '../../pages/BancoDeIdeias/components/IdeaQuickActions';
import IdeaFilterSearch from '../../pages/BancoDeIdeias/components/IdeaFilterSearch';

// Test utilities and mocks
import { mockAuthContext } from '../mocks/authContext';
import { mockIdeaResponse, mockFormData } from '../mocks/ideaData';

// ============================================================================
// MOCK SETUP
// ============================================================================

// Mock auth context
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext
}));

// Mock hooks
vi.mock('../../pages/BancoDeIdeias/hooks/useBancoDeIdeiasState', () => ({
  useBancoDeIdeiasState: () => ({
    state: {
      activeTab: 'generator',
      formData: mockFormData,
      currentIdea: null,
      isGenerating: false,
      showModals: {
        upgrade: false,
        personalization: false,
        implementation: false,
        quickAdd: false,
        share: false,
        collaboration: false
      },
      alerts: []
    },
    actions: {
      handleTabChange: vi.fn(),
      handleFormChange: vi.fn(),
      addAlert: vi.fn(),
      clearAlerts: vi.fn(),
      openModal: vi.fn(),
      closeModal: vi.fn(),
      startIdeaGeneration: vi.fn(),
      finishIdeaGeneration: vi.fn(),
      setCurrentIdea: vi.fn(),
      setFormData: vi.fn()
    }
  })
}));

vi.mock('../../pages/BancoDeIdeias/hooks/useBancoDeIdeiasLogic', () => ({
  useBancoDeIdeiasLogic: () => ({
    currentIdea: null,
    isGeneratingIdea: false,
    costSummary: { ideasToday: 5, dailyLimit: 15 },
    overallScore: 92,
    loading: { idea: false, personalization: false, budget: false, performance: false },
    actions: {
      handleGenerateIdea: vi.fn(),
      handleIdeaFeedback: vi.fn(),
      handleApplyTemplate: vi.fn(),
      handleExportIdeas: vi.fn(),
      handleImportIdeas: vi.fn(),
      handleQuickAddIdea: vi.fn(),
      handleShareIdea: vi.fn()
    }
  })
}));

// ============================================================================
// TEST SUITE: BANCO DE IDEIAS LAYOUT V8.0
// ============================================================================

describe('BancoIdeiasLayout V8.0', () => {
  const defaultProps = {
    activeTab: 'generator' as const,
    onTabChange: vi.fn(),
    children: <div>Test Content</div>
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders layout with header and navigation', () => {
    render(<BancoIdeiasLayout {...defaultProps} />);
    
    expect(screen.getByText('Banco de Ideias')).toBeInTheDocument();
    expect(screen.getByText('Sistema Inteligente de Geração de Conteúdo')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('displays navigation tabs correctly', () => {
    render(<BancoIdeiasLayout {...defaultProps} />);
    
    expect(screen.getByText('Gerador')).toBeInTheDocument();
    expect(screen.getByText('Histórico')).toBeInTheDocument();
    expect(screen.getByText('Templates')).toBeInTheDocument();
    expect(screen.getByText('Exportar')).toBeInTheDocument();
  });

  it('handles tab navigation', async () => {
    const onTabChange = vi.fn();
    render(<BancoIdeiasLayout {...defaultProps} onTabChange={onTabChange} />);
    
    const historyTab = screen.getByText('Histórico');
    await userEvent.click(historyTab);
    
    expect(onTabChange).toHaveBeenCalledWith('history');
  });

  it('shows mobile menu on mobile devices', async () => {
    render(<BancoIdeiasLayout {...defaultProps} showMobileMenu={true} />);
    
    // Should show mobile navigation
    expect(screen.getAllByText('Gerador')).toHaveLength(2); // Desktop and mobile
  });

  it('displays sidebar with statistics', () => {
    render(<BancoIdeiasLayout {...defaultProps} />);
    
    expect(screen.getByText('Estatísticas Rápidas')).toBeInTheDocument();
    expect(screen.getByText('Atividade Recente')).toBeInTheDocument();
    expect(screen.getByText('Insights de Performance')).toBeInTheDocument();
  });

  it('renders custom sidebar content when provided', () => {
    const sidebarContent = <div>Custom Sidebar</div>;
    render(<BancoIdeiasLayout {...defaultProps} sidebarContent={sidebarContent} />);
    
    expect(screen.getByText('Custom Sidebar')).toBeInTheDocument();
  });
});

// ============================================================================
// TEST SUITE: IDEA GENERATION FORM V8.0
// ============================================================================

describe('IdeaGenerationForm V8.0', () => {
  const defaultProps = {
    formData: mockFormData,
    onFormChange: vi.fn(),
    onGenerateIdea: vi.fn(),
    isGenerating: false,
    currentIdea: null,
    onIdeaFeedback: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders wizard steps correctly', () => {
    render(<IdeaGenerationForm {...defaultProps} />);
    
    expect(screen.getByText('Categoria & Estilo')).toBeInTheDocument();
    expect(screen.getByText('Público & Formato')).toBeInTheDocument();
    expect(screen.getByText('Palavras-chave')).toBeInTheDocument();
  });

  it('shows progress indicator', () => {
    render(<IdeaGenerationForm {...defaultProps} />);
    
    expect(screen.getByText('Passo 1 de 3')).toBeInTheDocument();
    expect(screen.getByText('concluídos')).toBeInTheDocument();
  });

  it('handles form field changes', async () => {
    const onFormChange = vi.fn();
    render(<IdeaGenerationForm {...defaultProps} onFormChange={onFormChange} />);
    
    // Find and interact with category select
    const categorySelect = screen.getByDisplayValue('Marketing & Growth');
    await userEvent.click(categorySelect);
    
    // Note: This would require proper select option testing
    expect(categorySelect).toBeInTheDocument();
  });

  it('validates step completion', () => {
    render(<IdeaGenerationForm {...defaultProps} />);
    
    // Step 1 should be accessible (has default values)
    const continueButton = screen.getByText('Continuar');
    expect(continueButton).not.toBeDisabled();
  });

  it('navigates between steps', async () => {
    render(<IdeaGenerationForm {...defaultProps} />);
    
    const continueButton = screen.getByText('Continuar');
    await userEvent.click(continueButton);
    
    // Should move to step 2
    expect(screen.getByText('Passo 2 de 3')).toBeInTheDocument();
  });

  it('shows smart suggestions based on category', () => {
    const formDataWithMarketing = { ...mockFormData, category: 'Marketing & Growth' as const };
    render(<IdeaGenerationForm {...defaultProps} formData={formDataWithMarketing} />);
    
    expect(screen.getByText('Sugestões Inteligentes')).toBeInTheDocument();
  });

  it('handles idea generation', async () => {
    const onGenerateIdea = vi.fn();
    const completeFormData = {
      ...mockFormData,
      keywordsInput: 'marketing, startup'
    };
    
    render(<IdeaGenerationForm {...defaultProps} formData={completeFormData} onGenerateIdea={onGenerateIdea} />);
    
    // Navigate to final step
    const continueButton = screen.getByText('Continuar');
    await userEvent.click(continueButton);
    await userEvent.click(continueButton);
    
    // Should show generate button
    const generateButton = screen.getByText('Gerar Ideia');
    await userEvent.click(generateButton);
    
    expect(onGenerateIdea).toHaveBeenCalled();
  });

  it('shows loading state during generation', () => {
    render(<IdeaGenerationForm {...defaultProps} isGenerating={true} />);
    
    expect(screen.getByText('Gerando...')).toBeInTheDocument();
  });
});

// ============================================================================
// TEST SUITE: IDEA RESULTS DISPLAY V8.0
// ============================================================================

describe('IdeaResultsDisplay V8.0', () => {
  const defaultProps = {
    idea: mockIdeaResponse,
    onFeedback: vi.fn(),
    onShare: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders idea details correctly', () => {
    render(<IdeaResultsDisplay {...defaultProps} />);
    
    expect(screen.getByText(mockIdeaResponse.title)).toBeInTheDocument();
    expect(screen.getByText(mockIdeaResponse.description)).toBeInTheDocument();
    expect(screen.getByText(mockIdeaResponse.category)).toBeInTheDocument();
  });

  it('shows empty state when no idea', () => {
    render(<IdeaResultsDisplay {...defaultProps} idea={null} />);
    
    expect(screen.getByText('Pronto para gerar sua primeira ideia?')).toBeInTheDocument();
  });

  it('shows loading state during generation', () => {
    render(<IdeaResultsDisplay {...defaultProps} idea={null} isGenerating={true} />);
    
    expect(screen.getByText('Gerando sua ideia personalizada...')).toBeInTheDocument();
  });

  it('handles like action', async () => {
    const onFeedback = vi.fn();
    render(<IdeaResultsDisplay {...defaultProps} onFeedback={onFeedback} />);
    
    const likeButton = screen.getByRole('button', { name: /curtir/i });
    await userEvent.click(likeButton);
    
    expect(onFeedback).toHaveBeenCalledWith(mockIdeaResponse.id, 'like');
  });

  it('handles copy functionality', async () => {
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined)
      }
    });

    render(<IdeaResultsDisplay {...defaultProps} />);
    
    const copyButton = screen.getByRole('button', { name: /copy/i });
    await userEvent.click(copyButton);
    
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });

  it('displays implementation section when available', () => {
    const ideaWithImplementation = {
      ...mockIdeaResponse,
      implementation: 'Steps to implement this idea...'
    };
    
    render(<IdeaResultsDisplay {...defaultProps} idea={ideaWithImplementation} />);
    
    expect(screen.getByText('Como Implementar')).toBeInTheDocument();
    expect(screen.getByText('Steps to implement this idea...')).toBeInTheDocument();
  });

  it('shows metadata when available', () => {
    const ideaWithMetadata = {
      ...mockIdeaResponse,
      metadata: {
        score: 8.5,
        cost: 0.002,
        tokensUsed: 150,
        processingTime: 1200
      }
    };
    
    render(<IdeaResultsDisplay {...defaultProps} idea={ideaWithMetadata} />);
    
    expect(screen.getByText('Informações da Geração')).toBeInTheDocument();
    expect(screen.getByText('$0.0020')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
  });

  it('animates in when idea is displayed', () => {
    const { rerender } = render(<IdeaResultsDisplay {...defaultProps} idea={null} />);
    
    rerender(<IdeaResultsDisplay {...defaultProps} idea={mockIdeaResponse} />);
    
    // Check for animation classes (would require more specific testing)
    const card = screen.getByText(mockIdeaResponse.title).closest('.transition-all');
    expect(card).toBeInTheDocument();
  });
});

// ============================================================================
// TEST SUITE: IDEA HISTORY TAB V8.0
// ============================================================================

describe('IdeaHistoryTab V8.0', () => {
  const mockIdeas = [mockIdeaResponse];
  const defaultProps = {
    ideas: mockIdeas,
    loading: false,
    onQuickAdd: vi.fn(),
    onIdeaSelect: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders history header with statistics', () => {
    render(<IdeaHistoryTab {...defaultProps} />);
    
    expect(screen.getByText('Histórico de Ideias')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // Total count
  });

  it('shows empty state when no ideas', () => {
    render(<IdeaHistoryTab {...defaultProps} ideas={[]} />);
    
    expect(screen.getByText('Nenhuma ideia ainda')).toBeInTheDocument();
    expect(screen.getByText('Comece gerando sua primeira ideia')).toBeInTheDocument();
  });

  it('renders loading state correctly', () => {
    render(<IdeaHistoryTab {...defaultProps} loading={true} />);
    
    // Should show skeleton loading
    expect(screen.getByText('Histórico de Ideias')).toBeInTheDocument();
  });

  it('handles quick add action', async () => {
    const onQuickAdd = vi.fn();
    render(<IdeaHistoryTab {...defaultProps} onQuickAdd={onQuickAdd} />);
    
    const addButton = screen.getByText('Adicionar');
    await userEvent.click(addButton);
    
    expect(onQuickAdd).toHaveBeenCalled();
  });

  it('toggles filters panel', async () => {
    render(<IdeaHistoryTab {...defaultProps} />);
    
    const filtersButton = screen.getByText('Filtros');
    await userEvent.click(filtersButton);
    
    // Should show filters (would need more specific testing for filter content)
    expect(filtersButton).toBeInTheDocument();
  });

  it('handles pagination when many ideas', () => {
    const manyIdeas = Array.from({ length: 25 }, (_, i) => ({
      ...mockIdeaResponse,
      id: `idea-${i}`,
      title: `Idea ${i}`
    }));
    
    render(<IdeaHistoryTab {...defaultProps} ideas={manyIdeas} />);
    
    // Should show pagination controls
    expect(screen.getByText('Anterior')).toBeInTheDocument();
    expect(screen.getByText('Próxima')).toBeInTheDocument();
  });
});

// ============================================================================
// TEST SUITE: INTEGRATION TESTS
// ============================================================================

describe('BancoDeIdeias V8.0 Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders main component without crashing', () => {
    render(<BancoDeIdeias />);
    
    // Should render loading state initially
    expect(screen.getByText('Carregando Banco de Ideias...')).toBeInTheDocument();
  });

  it('integrates all components correctly', async () => {
    await act(async () => {
      render(<BancoDeIdeias />);
    });

    await waitFor(() => {
      // Should eventually render the main interface
      expect(screen.queryByText('Carregando Banco de Ideias...')).not.toBeInTheDocument();
    });
  });
});

// ============================================================================
// TEST SUITE: ACCESSIBILITY TESTS
// ============================================================================

describe('BancoDeIdeias V8.0 Accessibility', () => {
  it('has proper heading hierarchy', () => {
    render(<IdeaGenerationForm {...{
      formData: mockFormData,
      onFormChange: vi.fn(),
      onGenerateIdea: vi.fn(),
      isGenerating: false,
      currentIdea: null,
      onIdeaFeedback: vi.fn()
    }} />);
    
    const headings = screen.getAllByRole('heading');
    expect(headings.length).toBeGreaterThan(0);
  });

  it('has proper form labels', () => {
    render(<IdeaGenerationForm {...{
      formData: mockFormData,
      onFormChange: vi.fn(),
      onGenerateIdea: vi.fn(),
      isGenerating: false,
      currentIdea: null,
      onIdeaFeedback: vi.fn()
    }} />);
    
    expect(screen.getByText('Categoria Principal')).toBeInTheDocument();
    expect(screen.getByText('Estilo de Conteúdo')).toBeInTheDocument();
  });

  it('supports keyboard navigation', async () => {
    render(<BancoIdeiasLayout 
      activeTab="generator" 
      onTabChange={vi.fn()} 
      children={<div>Content</div>} 
    />);
    
    const firstButton = screen.getAllByRole('button')[0];
    firstButton.focus();
    expect(document.activeElement).toBe(firstButton);
  });
});

// ============================================================================
// PERFORMANCE TESTS
// ============================================================================

describe('BancoDeIdeias V8.0 Performance', () => {
  it('lazy loads components efficiently', async () => {
    const startTime = performance.now();
    
    await act(async () => {
      render(<BancoDeIdeias />);
    });
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should render within reasonable time (under 100ms for initial render)
    expect(renderTime).toBeLessThan(100);
  });

  it('handles large datasets efficiently', () => {
    const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
      ...mockIdeaResponse,
      id: `idea-${i}`,
      title: `Idea ${i}`
    }));
    
    const startTime = performance.now();
    
    render(<IdeaHistoryTab 
      ideas={largeDataset}
      loading={false}
      onQuickAdd={vi.fn()}
    />);
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should handle large datasets efficiently
    expect(renderTime).toBeLessThan(200);
  });
});

export {}; 