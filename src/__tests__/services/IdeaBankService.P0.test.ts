/**
 * 🧪 IdeaBankService P0 Features Tests
 * Testes para as 4 prioridades P0 implementadas
 * Testing: Save Idea, Ideas History, Quick Add, Search Ideas
 */

import { IdeaBankService } from '../../services/business/IdeaBankService';
import { ServiceContainer } from '../../architecture/ServiceArchitecture';

describe('IdeaBankService - P0 Features', () => {
  let service: IdeaBankService;
  let mockContainer: any;
  let mockIdeaRepository: any;
  let mockAnalyticsService: any;

  beforeEach(() => {
    // Mock dos repositórios
    mockIdeaRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      findByUserId: jest.fn(),
      countByUserId: jest.fn(),
      search: jest.fn(),
      countSearch: jest.fn()
    };

    mockAnalyticsService = {
      trackEvent: jest.fn(),
      trackError: jest.fn()
    };

    // Mock do container de serviços
    mockContainer = {
      resolve: jest.fn(),
      register: jest.fn(),
      resolveAsync: jest.fn()
    };

    // Mock services que o IdeaBankService precisa
    const mockServices = {
      'GeminiService': { generateIdea: jest.fn() },
      'RateLimitingService': { canProceed: jest.fn(() => true) },
      'UsageTierService': { getCurrentTier: jest.fn() },
      'BudgetControlService': { canAfford: jest.fn(() => true) },
      'FallbackService': { getFallbackIdea: jest.fn() },
      'UserRepository': { findById: jest.fn() },
      'IdeaRepository': mockIdeaRepository,
      'PreferencesRepository': { findByUserId: jest.fn() },
      'PersonalizationService': { updatePreferences: jest.fn() },
      'AnalyticsService': mockAnalyticsService
    };

    // Configuração dos mocks por service name
    mockContainer.resolve.mockImplementation((serviceName: string) => {
      return mockServices[serviceName] || {};
    });

    mockContainer.resolveAsync.mockImplementation((serviceName: string) => {
      return Promise.resolve(mockServices[serviceName] || {});
    });

    service = new IdeaBankService(mockContainer);
    
    // Injetar os mocks diretamente
    service['ideaRepository'] = mockIdeaRepository;
    service['analyticsService'] = mockAnalyticsService;
  });

  describe('P0.1 - Save Idea', () => {
    it('should save a new idea successfully', async () => {
      const mockIdea = {
        id: 'idea_123',
        title: 'Test Idea',
        description: 'Test Description',
        category: 'test',
        userId: 'user_123',
        tags: ['test'],
        targetAudience: 'geral',
        implementation: 'test implementation',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const mockSavedIdea = { ...mockIdea, id: 'saved_idea_123' };

      // Mock repository methods
      mockIdeaRepository.findById.mockResolvedValue(null);
      mockIdeaRepository.create.mockResolvedValue(mockSavedIdea);
      mockAnalyticsService.trackEvent.mockResolvedValue(undefined);

      const result = await service.saveIdea({
        idea: mockIdea
      });

      expect(result.success).toBe(true);
      expect(result.savedIdea).toBeDefined();
      expect(mockIdeaRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Idea',
          description: 'Test Description',
          category: 'test'
        })
      );
    });

    it('should update existing idea when saving duplicate', async () => {
      const mockIdea = {
        id: 'idea_123',
        title: 'Test Idea',
        description: 'Test Description',
        category: 'test',
        userId: 'user_123',
        tags: ['test'],
        targetAudience: 'geral',
        implementation: 'test implementation',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const mockUpdatedIdea = { ...mockIdea, updatedAt: new Date().toISOString() };

      // Mock repository methods
      mockIdeaRepository.findById.mockResolvedValue(mockIdea);
      mockIdeaRepository.update.mockResolvedValue(mockUpdatedIdea);
      mockAnalyticsService.trackEvent.mockResolvedValue(undefined);

      const result = await service.saveIdea({
        idea: mockIdea
      });

      expect(result.success).toBe(true);
      expect(mockIdeaRepository.update).toHaveBeenCalledWith(
        'idea_123',
        expect.objectContaining({
          title: 'Test Idea',
          description: 'Test Description'
        })
      );
    });

    it('should handle save idea error', async () => {
      const mockIdea = {
        id: 'idea_123',
        title: 'Test Idea',
        description: 'Test Description',
        category: 'test',
        userId: 'user_123',
        tags: ['test'],
        targetAudience: 'geral',
        implementation: 'test implementation',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Mock repository error
      mockIdeaRepository.findById.mockRejectedValue(new Error('Database error'));

      const result = await service.saveIdea({
        idea: mockIdea
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('P0.2 - Ideas History', () => {
    it('should get user ideas history with pagination', async () => {
      const mockIdeas = [
        { id: 'idea_1', title: 'Idea 1', userId: 'user_123' },
        { id: 'idea_2', title: 'Idea 2', userId: 'user_123' }
      ];

      // Mock repository methods
      mockIdeaRepository.findByUserId.mockResolvedValue(mockIdeas);
      mockIdeaRepository.countByUserId.mockResolvedValue(25);
      mockAnalyticsService.trackEvent.mockResolvedValue(undefined);

      const result = await service.getUserIdeasHistory({
        userId: 'user_123',
        page: 1,
        limit: 20
      });

      expect(result.success).toBe(true);
      expect(result.ideas).toEqual(mockIdeas);
      expect(result.pagination.total).toBe(25);
      expect(result.pagination.totalPages).toBe(2); // Math.ceil(25/20) = 2
    });

    it('should handle ideas history error', async () => {
      // Mock repository error
      mockIdeaRepository.findByUserId.mockRejectedValue(new Error('Database error'));

      const result = await service.getUserIdeasHistory({
        userId: 'user_123',
        page: 1,
        limit: 10
      });

      expect(result.success).toBe(false);
      expect(result.ideas).toEqual([]);
      expect(result.error).toBeDefined();
    });
  });

  describe('P0.3 - Quick Add Idea', () => {
    it('should quick add idea successfully', async () => {
      const mockCreatedIdea = {
        id: 'quick_idea_123',
        title: 'Quick Test Idea',
        description: 'Quick test description',
        category: 'quick',
        userId: 'user_123',
        tags: ['quick'],
        targetAudience: 'geral',
        implementation: 'quick implementation',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Mock repository methods
      mockIdeaRepository.create.mockResolvedValue(mockCreatedIdea);
      mockAnalyticsService.trackEvent.mockResolvedValue(undefined);

      const result = await service.quickAddIdea({
        userId: 'user_123',
        title: 'Quick Test Idea',
        description: 'Quick test description'
      });

      expect(result.success).toBe(true);
      expect(result.idea).toEqual(mockCreatedIdea);
      expect(mockIdeaRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Quick Test Idea',
          description: 'Quick test description',
          userId: 'user_123'
        })
      );
    });

    it('should handle quick add with minimal data', async () => {
      const mockCreatedIdea = {
        id: 'quick_idea_123',
        title: 'Quick Test Idea',
        description: '',
        category: 'geral',
        userId: 'user_123',
        tags: [],
        targetAudience: 'geral',
        implementation: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Mock repository methods
      mockIdeaRepository.create.mockResolvedValue(mockCreatedIdea);
      mockAnalyticsService.trackEvent.mockResolvedValue(undefined);

      const result = await service.quickAddIdea({
        userId: 'user_123',
        title: 'Quick Test Idea'
      });

      expect(result.success).toBe(true);
      expect(result.idea?.description).toBe('');
      expect(result.idea?.category).toBe('geral');
      expect(result.idea?.tags).toEqual([]);
    });

    it('should handle quick add error', async () => {
      // Mock repository error
      mockIdeaRepository.create.mockRejectedValue(new Error('Database error'));

      const result = await service.quickAddIdea({
        userId: 'user_123',
        title: 'Quick Test Idea'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('P0.4 - Search Ideas', () => {
    it('should search ideas with filters', async () => {
      const mockSearchResults = [
        { id: 'idea_1', title: 'Marketing Idea', category: 'marketing' },
        { id: 'idea_2', title: 'Social Media Idea', category: 'marketing' }
      ];

      // Mock repository methods
      mockIdeaRepository.search.mockResolvedValue(mockSearchResults);
      mockIdeaRepository.countSearch.mockResolvedValue(2);
      mockAnalyticsService.trackEvent.mockResolvedValue(undefined);

      const result = await service.searchIdeas({
        userId: 'user_123',
        query: 'marketing',
        filters: { category: 'marketing' },
        page: 1,
        limit: 10
      });

      expect(result.success).toBe(true);
      expect(result.ideas).toEqual(mockSearchResults);
      expect(result.total).toBe(2);
      expect(result.pagination.totalPages).toBe(1);
    });

    it('should handle empty search results', async () => {
      // Mock repository methods
      mockIdeaRepository.search.mockResolvedValue([]);
      mockIdeaRepository.countSearch.mockResolvedValue(0);
      mockAnalyticsService.trackEvent.mockResolvedValue(undefined);

      const result = await service.searchIdeas({
        userId: 'user_123',
        query: 'nonexistent',
        page: 1,
        limit: 10
      });

      expect(result.success).toBe(true);
      expect(result.ideas).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.pagination.totalPages).toBe(0);
    });

    it('should handle search error', async () => {
      // Mock repository error
      mockIdeaRepository.search.mockRejectedValue(new Error('Database error'));

      const result = await service.searchIdeas({
        userId: 'user_123',
        query: 'test',
        page: 1,
        limit: 10
      });

      expect(result.success).toBe(false);
      expect(result.ideas).toEqual([]);
      expect(result.error).toBeDefined();
    });
  });

  describe('Integration Tests', () => {
    it('should track analytics for all P0 operations', async () => {
      const mockIdea = {
        id: 'test_idea',
        title: 'Test Idea',
        description: 'Test Description',
        category: 'test',
        userId: 'user_123',
        tags: ['test'],
        targetAudience: 'geral',
        implementation: 'test implementation',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Mock repository methods
      mockIdeaRepository.findById.mockResolvedValue(null);
      mockIdeaRepository.create.mockResolvedValue(mockIdea);
      mockAnalyticsService.trackEvent.mockResolvedValue(undefined);

      await service.saveIdea({
        idea: mockIdea
      });

      expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith(
        'idea_saved',
        expect.objectContaining({
          ideaId: 'test_idea',
          source: 'manual',
          category: 'test'
        })
      );
    });

    it('should validate all P0 methods exist', () => {
      expect(typeof service.saveIdea).toBe('function');
      expect(typeof service.getUserIdeasHistory).toBe('function');
      expect(typeof service.quickAddIdea).toBe('function');
      expect(typeof service.searchIdeas).toBe('function');
    });
  });
}); 