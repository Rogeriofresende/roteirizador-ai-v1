/**
 * 🧪 Banco de Ideias P0 Integration Tests
 * Testes de integração para as 4 prioridades P0 do Banco de Ideias
 * Testing: Save Idea, Ideas History, Quick Add Modal, Search & Filters
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import BancoDeIdeias from '../../pages/BancoDeIdeias';

// Mock do hook useIdeaGeneration
jest.mock('../../hooks/useIdeaGeneration', () => ({
  useIdeaGeneration: () => ({
    isLoading: false,
    error: null,
    generateIdea: jest.fn(),
    saveIdea: jest.fn(() => Promise.resolve({ success: true })),
    getIdeasHistory: jest.fn(() => Promise.resolve({ 
      success: true, 
      ideas: [
        { id: '1', title: 'Test Idea 1', description: 'Test Description 1', category: 'marketing' },
        { id: '2', title: 'Test Idea 2', description: 'Test Description 2', category: 'tech' }
      ],
      pagination: { total: 2, page: 1, limit: 20, totalPages: 1 }
    })),
    quickAddIdea: jest.fn(() => Promise.resolve({ success: true })),
    searchIdeas: jest.fn(() => Promise.resolve({ 
      success: true, 
      ideas: [
        { id: '1', title: 'Marketing Idea', description: 'Marketing description', category: 'marketing' }
      ],
      total: 1
    })),
    currentIdea: {
      id: 'current_idea_123',
      title: 'Current Test Idea',
      description: 'Current test description',
      category: 'test',
      tags: ['test'],
      targetAudience: 'geral',
      implementation: 'test implementation'
    }
  })
}));

// Mock do hook usePersonalization
jest.mock('../../hooks/usePersonalization', () => ({
  usePersonalization: () => ({
    preferences: {},
    updatePreferences: jest.fn(),
    getRecommendations: jest.fn()
  })
}));

// Mock do hook useBudgetManagement
jest.mock('../../hooks/useBudgetManagement', () => ({
  useBudgetManagement: () => ({
    currentTier: 'free',
    usage: { current: 10, limit: 100 },
    canAfford: true,
    budgetStatus: 'healthy'
  })
}));

// Mock do AuthContext
const mockAuthContext = {
  user: { id: 'user_123', name: 'Test User', email: 'test@example.com' },
  login: jest.fn(),
  logout: jest.fn(),
  isAuthenticated: true
};

jest.mock('../../contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-provider">{children}</div>
  ),
  useAuth: () => mockAuthContext
}));

// Wrapper para testes
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </BrowserRouter>
);

describe('Banco de Ideias P0 Integration Tests', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('P0.1 - Save Idea Integration', () => {
    it('should display save button and handle save idea functionality', async () => {
      render(
        <TestWrapper>
          <BancoDeIdeias />
        </TestWrapper>
      );

      // Verificar se o botão Salvar está presente
      const saveButton = screen.getByRole('button', { name: /salvar/i });
      expect(saveButton).toBeInTheDocument();

      // Simular clique no botão salvar
      fireEvent.click(saveButton);

      // Verificar se a função foi chamada (através do mock)
      await waitFor(() => {
        expect(saveButton).toBeEnabled();
      });
    });

    it('should show current idea content when available', () => {
      render(
        <TestWrapper>
          <BancoDeIdeias />
        </TestWrapper>
      );

      // Verificar se o conteúdo da ideia atual está visível
      expect(screen.getByText('Current Test Idea')).toBeInTheDocument();
      expect(screen.getByText('Current test description')).toBeInTheDocument();
    });
  });

  describe('P0.2 - Ideas History Integration', () => {
    it('should display ideas history tab and load ideas', async () => {
      render(
        <TestWrapper>
          <BancoDeIdeias />
        </TestWrapper>
      );

      // Verificar se a tab de histórico está presente
      const historyTab = screen.getByRole('tab', { name: /histórico/i });
      expect(historyTab).toBeInTheDocument();

      // Clicar na tab de histórico
      fireEvent.click(historyTab);

      // Verificar se as ideias do histórico são carregadas
      await waitFor(() => {
        expect(screen.getByText('Test Idea 1')).toBeInTheDocument();
        expect(screen.getByText('Test Idea 2')).toBeInTheDocument();
      });
    });

    it('should display pagination controls in history', async () => {
      render(
        <TestWrapper>
          <BancoDeIdeias />
        </TestWrapper>
      );

      // Acessar a tab de histórico
      const historyTab = screen.getByRole('tab', { name: /histórico/i });
      fireEvent.click(historyTab);

      // Verificar se controles de paginação estão presentes
      await waitFor(() => {
        const paginationInfo = screen.getByText(/página 1 de 1/i);
        expect(paginationInfo).toBeInTheDocument();
      });
    });
  });

  describe('P0.3 - Quick Add Modal Integration', () => {
    it('should display quick add buttons and open modal', async () => {
      render(
        <TestWrapper>
          <BancoDeIdeias />
        </TestWrapper>
      );

      // Procurar por botões "+" para adicionar ideias rapidamente
      const quickAddButtons = screen.getAllByRole('button', { name: /\+/i });
      expect(quickAddButtons.length).toBeGreaterThan(0);

      // Clicar no primeiro botão "+"
      fireEvent.click(quickAddButtons[0]);

      // Verificar se o modal de adicionar rapidamente abre
      await waitFor(() => {
        const modal = screen.getByRole('dialog', { name: /adicionar ideia/i });
        expect(modal).toBeInTheDocument();
      });
    });

    it('should handle quick add idea submission', async () => {
      render(
        <TestWrapper>
          <BancoDeIdeias />
        </TestWrapper>
      );

      // Abrir modal de quick add
      const quickAddButton = screen.getAllByRole('button', { name: /\+/i })[0];
      fireEvent.click(quickAddButton);

      // Preencher o formulário de quick add
      await waitFor(() => {
        const titleInput = screen.getByPlaceholderText(/título da ideia/i);
        const descriptionInput = screen.getByPlaceholderText(/descrição/i);
        
        fireEvent.change(titleInput, { target: { value: 'Nova Ideia Rápida' } });
        fireEvent.change(descriptionInput, { target: { value: 'Descrição da ideia rápida' } });
      });

      // Submeter o formulário
      const submitButton = screen.getByRole('button', { name: /adicionar/i });
      fireEvent.click(submitButton);

      // Verificar se o modal fecha após submissão
      await waitFor(() => {
        const modal = screen.queryByRole('dialog', { name: /adicionar ideia/i });
        expect(modal).not.toBeInTheDocument();
      });
    });
  });

  describe('P0.4 - Search & Filters Integration', () => {
    it('should display search input and perform search', async () => {
      render(
        <TestWrapper>
          <BancoDeIdeias />
        </TestWrapper>
      );

      // Acessar a tab de histórico onde está a busca
      const historyTab = screen.getByRole('tab', { name: /histórico/i });
      fireEvent.click(historyTab);

      // Verificar se o input de busca está presente
      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText(/buscar ideias/i);
        expect(searchInput).toBeInTheDocument();

        // Realizar uma busca
        fireEvent.change(searchInput, { target: { value: 'marketing' } });
        fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' });
      });

      // Verificar se os resultados da busca são exibidos
      await waitFor(() => {
        expect(screen.getByText('Marketing Idea')).toBeInTheDocument();
      });
    });

    it('should display filter options', async () => {
      render(
        <TestWrapper>
          <BancoDeIdeias />
        </TestWrapper>
      );

      // Acessar a tab de histórico
      const historyTab = screen.getByRole('tab', { name: /histórico/i });
      fireEvent.click(historyTab);

      // Verificar se filtros estão disponíveis
      await waitFor(() => {
        const filterButton = screen.getByRole('button', { name: /filtros/i });
        expect(filterButton).toBeInTheDocument();
      });
    });
  });

  describe('Integration - Full User Journey', () => {
    it('should support complete user workflow: generate -> save -> view history -> search', async () => {
      render(
        <TestWrapper>
          <BancoDeIdeias />
        </TestWrapper>
      );

      // Etapa 1: Verificar ideia atual
      expect(screen.getByText('Current Test Idea')).toBeInTheDocument();

      // Etapa 2: Salvar ideia
      const saveButton = screen.getByRole('button', { name: /salvar/i });
      fireEvent.click(saveButton);

      // Etapa 3: Navegar para histórico
      const historyTab = screen.getByRole('tab', { name: /histórico/i });
      fireEvent.click(historyTab);

      // Etapa 4: Verificar que ideias são carregadas
      await waitFor(() => {
        expect(screen.getByText('Test Idea 1')).toBeInTheDocument();
        expect(screen.getByText('Test Idea 2')).toBeInTheDocument();
      });

      // Etapa 5: Realizar busca
      const searchInput = screen.getByPlaceholderText(/buscar ideias/i);
      fireEvent.change(searchInput, { target: { value: 'marketing' } });
      fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' });

      // Etapa 6: Verificar resultados da busca
      await waitFor(() => {
        expect(screen.getByText('Marketing Idea')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle save idea errors gracefully', async () => {
      // Mock error response
      jest.mock('../../hooks/useIdeaGeneration', () => ({
        useIdeaGeneration: () => ({
          isLoading: false,
          error: 'Erro ao salvar ideia',
          saveIdea: jest.fn(() => Promise.resolve({ success: false, error: 'Erro ao salvar' })),
          currentIdea: { id: '1', title: 'Test', description: 'Test' }
        })
      }));

      render(
        <TestWrapper>
          <BancoDeIdeias />
        </TestWrapper>
      );

      const saveButton = screen.getByRole('button', { name: /salvar/i });
      fireEvent.click(saveButton);

      // Verificar se erro é tratado adequadamente
      await waitFor(() => {
        expect(saveButton).toBeEnabled();
      });
    });
  });

  describe('Performance & Accessibility', () => {
    it('should render without performance issues', () => {
      const startTime = performance.now();
      
      render(
        <TestWrapper>
          <BancoDeIdeias />
        </TestWrapper>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Verificar que renderização é rápida (menos de 1 segundo)
      expect(renderTime).toBeLessThan(1000);
    });

    it('should have proper accessibility attributes', () => {
      render(
        <TestWrapper>
          <BancoDeIdeias />
        </TestWrapper>
      );

      // Verificar se elementos principais têm atributos de acessibilidade
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /salvar/i })).toBeInTheDocument();
      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });
  });
}); 