/**
 * 🧪 useIdeaGeneration Hook P0 Features Tests
 * Testes para as 4 prioridades P0 implementadas no hook
 * Testing: Save Idea, Ideas History, Quick Add, Search Ideas
 */

import { renderHook, act } from '@testing-library/react';
import { useIdeaGeneration } from '../../hooks/useIdeaGeneration';

// Mock da arquitetura de serviços
jest.mock('../../architecture/ServiceArchitecture', () => ({
  getApplication: jest.fn(() => ({
    getService: jest.fn(() => ({
      resolveAsync: jest.fn()
    }))
  }))
}));

describe('useIdeaGeneration Hook - P0 Features', () => {
  let mockIdeaBankService: any;
  let mockAnalyticsService: any;
  let mockPersonalizationService: any;

  beforeEach(() => {
    // Mock services
    mockIdeaBankService = {
      saveIdea: jest.fn(),
      getUserIdeasHistory: jest.fn(),
      quickAddIdea: jest.fn(),
      searchIdeas: jest.fn(),
      generateIdea: jest.fn(),
      processIdeaFeedback: jest.fn()
    };

    mockAnalyticsService = {
      trackEvent: jest.fn(),
      trackError: jest.fn()
    };

    mockPersonalizationService = {
      generatePersonalizedRecommendations: jest.fn(),
      updateUserPreferences: jest.fn()
    };

    // Mock do container
    const mockContainer = {
      resolveAsync: jest.fn().mockImplementation((serviceName: string) => {
        switch (serviceName) {
          case 'IdeaBankService':
            return Promise.resolve(mockIdeaBankService);
          case 'AnalyticsService':
            return Promise.resolve(mockAnalyticsService);
          case 'PersonalizationService':
            return Promise.resolve(mockPersonalizationService);
          default:
            return Promise.resolve(null);
        }
      })
    };

    const mockApp = {
      getService: jest.fn(() => mockContainer)
    };

    require('../../architecture/ServiceArchitecture').getApplication.mockReturnValue(mockApp);
  });

  describe('P0.1 - Save Idea', () => {
    it('should save idea successfully', async () => {
      const mockIdea = {
        id: 'idea_123',
        title: 'Test Idea',
        description: 'Test description',
        category: 'instagram',
        targetAudience: 'creators',
        implementation: 'Test implementation',
        tags: ['test', 'idea']
      };

      mockIdeaBankService.saveIdea.mockResolvedValue({
        success: true,
        savedIdea: mockIdea
      });

      const { result } = renderHook(() => useIdeaGeneration());

      let saveResult: boolean;
      await act(async () => {
        saveResult = await result.current.saveIdea(mockIdea);
      });

      expect(saveResult).toBe(true);
      expect(mockIdeaBankService.saveIdea).toHaveBeenCalledWith({
        userId: mockIdea.userId || '',
        idea: mockIdea,
        metadata: expect.objectContaining({
          source: 'generated'
        })
      });
    });

    it('should handle save idea failure', async () => {
      const mockIdea = {
        id: 'idea_123',
        title: 'Test Idea',
        description: 'Test description',
        category: 'instagram',
        targetAudience: 'creators',
        implementation: 'Test implementation',
        tags: ['test', 'idea']
      };

      mockIdeaBankService.saveIdea.mockResolvedValue({
        success: false,
        error: 'Save failed'
      });

      const { result } = renderHook(() => useIdeaGeneration());

      let saveResult: boolean;
      await act(async () => {
        saveResult = await result.current.saveIdea(mockIdea);
      });

      expect(saveResult).toBe(false);
    });

    it('should handle save idea when service unavailable', async () => {
      const mockIdea = {
        id: 'idea_123',
        title: 'Test Idea',
        description: 'Test description',
        category: 'instagram',
        targetAudience: 'creators',
        implementation: 'Test implementation',
        tags: ['test', 'idea']
      };

      // Mock service unavailable
      const mockContainer = {
        resolveAsync: jest.fn().mockResolvedValue(null)
      };

      const mockApp = {
        getService: jest.fn(() => mockContainer)
      };

      require('../../architecture/ServiceArchitecture').getApplication.mockReturnValue(mockApp);

      const { result } = renderHook(() => useIdeaGeneration());

      let saveResult: boolean;
      await act(async () => {
        saveResult = await result.current.saveIdea(mockIdea);
      });

      expect(saveResult).toBe(false);
    });
  });

  describe('P0.2 - Ideas History', () => {
    it('should get ideas history successfully', async () => {
      const mockIdeas = [
        {
          id: 'idea_1',
          title: 'Idea 1',
          description: 'Description 1',
          category: 'instagram',
          status: 'saved'
        },
        {
          id: 'idea_2',
          title: 'Idea 2',
          description: 'Description 2',
          category: 'tiktok',
          status: 'saved'
        }
      ];

      mockIdeaBankService.getUserIdeasHistory.mockResolvedValue({
        success: true,
        ideas: mockIdeas,
        pagination: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1
        }
      });

      const { result } = renderHook(() => useIdeaGeneration());

      let historyResult: any;
      await act(async () => {
        historyResult = await result.current.getIdeasHistory('user_123', {
          page: 1,
          limit: 10
        });
      });

      expect(historyResult.success).toBe(true);
      expect(historyResult.ideas).toEqual(mockIdeas);
      expect(result.current.ideas).toEqual(mockIdeas);
      expect(mockIdeaBankService.getUserIdeasHistory).toHaveBeenCalledWith({
        userId: 'user_123',
        filters: undefined,
        pagination: { page: 1, limit: 10 },
        sort: { field: 'savedAt', order: 'desc' }
      });
    });

    it('should handle ideas history with filters', async () => {
      const mockIdeas = [
        {
          id: 'idea_1',
          title: 'Instagram Idea',
          description: 'Instagram description',
          category: 'instagram',
          status: 'saved'
        }
      ];

      mockIdeaBankService.getUserIdeasHistory.mockResolvedValue({
        success: true,
        ideas: mockIdeas,
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1
        }
      });

      const { result } = renderHook(() => useIdeaGeneration());

      await act(async () => {
        await result.current.getIdeasHistory('user_123', {
          page: 1,
          limit: 10,
          filters: {
            category: 'instagram'
          }
        });
      });

      expect(mockIdeaBankService.getUserIdeasHistory).toHaveBeenCalledWith({
        userId: 'user_123',
        filters: { category: 'instagram' },
        pagination: { page: 1, limit: 10 },
        sort: { field: 'savedAt', order: 'desc' }
      });
    });

    it('should handle ideas history error', async () => {
      mockIdeaBankService.getUserIdeasHistory.mockResolvedValue({
        success: false,
        error: 'History load failed'
      });

      const { result } = renderHook(() => useIdeaGeneration());

      await act(async () => {
        await result.current.getIdeasHistory('user_123');
      });

      expect(result.current.error).toBe('History load failed');
    });
  });

  describe('P0.3 - Quick Add Idea', () => {
    it('should quick add idea successfully', async () => {
      const mockAddedIdea = {
        id: 'idea_quick_123',
        title: 'Quick Idea',
        description: 'Quick description',
        category: 'geral',
        targetAudience: 'geral',
        implementation: 'Desenvolvida pelo usuário',
        status: 'manual',
        tags: ['quick']
      };

      mockIdeaBankService.quickAddIdea.mockResolvedValue({
        success: true,
        idea: mockAddedIdea
      });

      const { result } = renderHook(() => useIdeaGeneration());

      let addResult: any;
      await act(async () => {
        addResult = await result.current.quickAddIdea({
          title: 'Quick Idea',
          description: 'Quick description',
          category: 'geral',
          tags: ['quick']
        });
      });

      expect(addResult).toEqual(mockAddedIdea);
      expect(result.current.ideas).toContain(mockAddedIdea);
      expect(mockIdeaBankService.quickAddIdea).toHaveBeenCalledWith({
        userId: '',
        title: 'Quick Idea',
        description: 'Quick description',
        category: 'geral',
        tags: ['quick']
      });
    });

    it('should handle quick add with minimal data', async () => {
      const mockAddedIdea = {
        id: 'idea_minimal_123',
        title: 'Minimal Idea',
        description: '',
        category: 'geral',
        targetAudience: 'geral',
        implementation: 'Desenvolvida pelo usuário',
        status: 'manual',
        tags: []
      };

      mockIdeaBankService.quickAddIdea.mockResolvedValue({
        success: true,
        idea: mockAddedIdea
      });

      const { result } = renderHook(() => useIdeaGeneration());

      let addResult: any;
      await act(async () => {
        addResult = await result.current.quickAddIdea({
          title: 'Minimal Idea'
        });
      });

      expect(addResult).toEqual(mockAddedIdea);
      expect(mockIdeaBankService.quickAddIdea).toHaveBeenCalledWith({
        userId: '',
        title: 'Minimal Idea',
        description: undefined,
        category: undefined,
        tags: undefined
      });
    });

    it('should handle quick add failure', async () => {
      mockIdeaBankService.quickAddIdea.mockResolvedValue({
        success: false,
        error: 'Quick add failed'
      });

      const { result } = renderHook(() => useIdeaGeneration());

      let addResult: any;
      await act(async () => {
        addResult = await result.current.quickAddIdea({
          title: 'Failed Idea'
        });
      });

      expect(addResult).toBeNull();
    });
  });

  describe('P0.4 - Search Ideas', () => {
    it('should search ideas successfully', async () => {
      const mockSearchResults = [
        {
          id: 'idea_1',
          title: 'Instagram Post Idea',
          description: 'Description about Instagram',
          category: 'instagram',
          tags: ['instagram', 'posts']
        },
        {
          id: 'idea_2',
          title: 'Another Instagram Idea',
          description: 'Another description',
          category: 'instagram',
          tags: ['instagram', 'stories']
        }
      ];

      mockIdeaBankService.searchIdeas.mockResolvedValue({
        success: true,
        ideas: mockSearchResults,
        total: 2,
        pagination: {
          page: 1,
          limit: 10,
          totalPages: 1
        }
      });

      const { result } = renderHook(() => useIdeaGeneration());

      let searchResult: any;
      await act(async () => {
        searchResult = await result.current.searchIdeas(
          'user_123',
          'instagram',
          { category: 'instagram' },
          { page: 1, limit: 10 }
        );
      });

      expect(searchResult.success).toBe(true);
      expect(searchResult.ideas).toEqual(mockSearchResults);
      expect(result.current.ideas).toEqual(mockSearchResults);
      expect(mockIdeaBankService.searchIdeas).toHaveBeenCalledWith({
        userId: 'user_123',
        searchTerm: 'instagram',
        filters: { category: 'instagram' },
        pagination: { page: 1, limit: 10 }
      });
    });

    it('should handle empty search results', async () => {
      mockIdeaBankService.searchIdeas.mockResolvedValue({
        success: true,
        ideas: [],
        total: 0,
        pagination: {
          page: 1,
          limit: 10,
          totalPages: 0
        }
      });

      const { result } = renderHook(() => useIdeaGeneration());

      let searchResult: any;
      await act(async () => {
        searchResult = await result.current.searchIdeas('user_123', 'nonexistent');
      });

      expect(searchResult.success).toBe(true);
      expect(searchResult.ideas).toEqual([]);
      expect(result.current.ideas).toEqual([]);
    });

    it('should handle search error', async () => {
      mockIdeaBankService.searchIdeas.mockResolvedValue({
        success: false,
        error: 'Search failed'
      });

      const { result } = renderHook(() => useIdeaGeneration());

      await act(async () => {
        await result.current.searchIdeas('user_123', 'test');
      });

      expect(result.current.error).toBe('Search failed');
    });
  });

  describe('Integration Tests', () => {
    it('should maintain loading state during operations', async () => {
      mockIdeaBankService.getUserIdeasHistory.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          ideas: [],
          pagination: { total: 0, page: 1, limit: 10, totalPages: 0 }
        }), 100))
      );

      const { result } = renderHook(() => useIdeaGeneration());

      expect(result.current.loading).toBe(false);

      act(() => {
        result.current.getIdeasHistory('user_123');
      });

      expect(result.current.loading).toBe(true);

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      expect(result.current.loading).toBe(false);
    });

    it('should clear errors when new operations start', async () => {
      // Set initial error
      mockIdeaBankService.getUserIdeasHistory.mockResolvedValue({
        success: false,
        error: 'Initial error'
      });

      const { result } = renderHook(() => useIdeaGeneration());

      await act(async () => {
        await result.current.getIdeasHistory('user_123');
      });

      expect(result.current.error).toBe('Initial error');

      // Start new operation
      mockIdeaBankService.searchIdeas.mockResolvedValue({
        success: true,
        ideas: [],
        total: 0,
        pagination: { page: 1, limit: 10, totalPages: 0 }
      });

      await act(async () => {
        await result.current.searchIdeas('user_123', 'test');
      });

      expect(result.current.error).toBeNull();
    });
  });
}); 