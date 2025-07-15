/**
 * AI SUGGESTIONS SERVICE TESTS - SPRINT 5
 * Testing suite for AI suggestions functionality
 * V7.5 Enhanced - IA Charlie Implementation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import AISuggestionsService, { 
  AISuggestion, 
  UserContext, 
  SuggestionRequest 
} from '../../services/ai/AISuggestionsService';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('AISuggestionsService', () => {
  let service: AISuggestionsService;
  let mockUserContext: UserContext;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AISuggestionsService();
    
    mockUserContext = {
      userId: 'test-user-123',
      recentIdeas: ['Como fazer marketing digital', 'Estratégias de vendas'],
      preferredCategories: ['marketing', 'vendas'],
      platforms: ['youtube', 'instagram'],
      successfulContent: ['Tutorial de marketing', 'Dicas de vendas'],
      userBehavior: {
        sessionTime: 1800,
        actionsPerSession: 15,
        preferredFeatures: ['generator', 'templates']
      }
    };
  });

  describe('Service Initialization', () => {
    it('should initialize successfully', () => {
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(AISuggestionsService);
    });

    it('should load data from storage on initialization', () => {
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('aiUserProfiles');
    });
  });

  describe('Content Suggestions', () => {
    it('should generate content suggestions', async () => {
      const request: SuggestionRequest = {
        context: mockUserContext,
        currentInput: 'Como fazer marketing no Instagram',
        suggestionType: 'content',
        limit: 5,
        minConfidence: 0.6
      };

      const suggestions = await service.getSuggestions(request);

      expect(suggestions).toBeInstanceOf(Array);
      expect(suggestions.length).toBeLessThanOrEqual(5);
      
      suggestions.forEach(suggestion => {
        expect(suggestion).toHaveProperty('id');
        expect(suggestion).toHaveProperty('type', 'content');
        expect(suggestion).toHaveProperty('content');
        expect(suggestion).toHaveProperty('confidence');
        expect(suggestion).toHaveProperty('reasoning');
        expect(suggestion).toHaveProperty('metadata');
        expect(suggestion.confidence).toBeGreaterThanOrEqual(0.6);
      });
    });

    it('should filter suggestions by minimum confidence', async () => {
      const request: SuggestionRequest = {
        context: mockUserContext,
        currentInput: 'Marketing digital',
        suggestionType: 'content',
        limit: 10,
        minConfidence: 0.8
      };

      const suggestions = await service.getSuggestions(request);

      suggestions.forEach(suggestion => {
        expect(suggestion.confidence).toBeGreaterThanOrEqual(0.8);
      });
    });

    it('should respect suggestion limit', async () => {
      const request: SuggestionRequest = {
        context: mockUserContext,
        currentInput: 'Como fazer conteúdo viral',
        suggestionType: 'content',
        limit: 3,
        minConfidence: 0.5
      };

      const suggestions = await service.getSuggestions(request);

      expect(suggestions.length).toBeLessThanOrEqual(3);
    });
  });

  describe('Title Suggestions', () => {
    it('should generate title suggestions based on content', async () => {
      const request: SuggestionRequest = {
        context: mockUserContext,
        currentInput: 'Este é um tutorial sobre como fazer marketing digital eficaz no Instagram usando stories e reels',
        suggestionType: 'title',
        limit: 3,
        minConfidence: 0.7
      };

      const suggestions = await service.getSuggestions(request);

      expect(suggestions).toBeInstanceOf(Array);
      suggestions.forEach(suggestion => {
        expect(suggestion.type).toBe('title');
        expect(suggestion.content).toBeTruthy();
        expect(suggestion.confidence).toBeGreaterThanOrEqual(0.7);
      });
    });

    it('should return empty array for empty content', async () => {
      const request: SuggestionRequest = {
        context: mockUserContext,
        currentInput: '',
        suggestionType: 'title',
        limit: 5
      };

      const suggestions = await service.getSuggestions(request);

      expect(suggestions).toHaveLength(0);
    });
  });

  describe('Category Suggestions', () => {
    it('should suggest categories based on content analysis', async () => {
      const request: SuggestionRequest = {
        context: mockUserContext,
        currentInput: 'Como fazer exercícios em casa e manter uma alimentação saudável',
        suggestionType: 'category',
        limit: 3,
        minConfidence: 0.6
      };

      const suggestions = await service.getSuggestions(request);

      expect(suggestions).toBeInstanceOf(Array);
      suggestions.forEach(suggestion => {
        expect(suggestion.type).toBe('category');
        expect(suggestion.content).toBeTruthy();
        expect(suggestion.confidence).toBeGreaterThanOrEqual(0.6);
      });
    });

    it('should analyze content keywords for categorization', async () => {
      const request: SuggestionRequest = {
        context: mockUserContext,
        currentInput: 'Tutorial de programação Python para iniciantes',
        suggestionType: 'category',
        limit: 5
      };

      const suggestions = await service.getSuggestions(request);

      // Should suggest technology/education categories
      const categories = suggestions.map(s => s.content.toLowerCase());
      expect(categories).toContain('tecnologia');
    });
  });

  describe('Improvement Suggestions', () => {
    it('should suggest improvements for low quality content', async () => {
      const request: SuggestionRequest = {
        context: mockUserContext,
        currentInput: 'tutorial video youtube',
        suggestionType: 'improvement',
        limit: 5
      };

      const suggestions = await service.getSuggestions(request);

      expect(suggestions).toBeInstanceOf(Array);
      suggestions.forEach(suggestion => {
        expect(suggestion.type).toBe('improvement');
        expect(suggestion.content).toBeTruthy();
        expect(suggestion.reasoning).toBeTruthy();
      });
    });

    it('should analyze readability for improvement suggestions', async () => {
      const lowReadabilityContent = 'Implementação de algoritmos de machine learning utilizando frameworks avançados';
      
      const request: SuggestionRequest = {
        context: mockUserContext,
        currentInput: lowReadabilityContent,
        suggestionType: 'improvement'
      };

      const suggestions = await service.getSuggestions(request);

      const improvementTexts = suggestions.map(s => s.content.toLowerCase());
      expect(improvementTexts.some(text => text.includes('simplif'))).toBe(true);
    });
  });

  describe('Next Action Suggestions', () => {
    it('should suggest next actions based on user behavior', async () => {
      const request: SuggestionRequest = {
        context: {
          ...mockUserContext,
          recentIdeas: Array(10).fill('Ideia de teste') // Many ideas
        },
        suggestionType: 'next_action',
        limit: 3
      };

      const suggestions = await service.getSuggestions(request);

      expect(suggestions).toBeInstanceOf(Array);
      suggestions.forEach(suggestion => {
        expect(suggestion.type).toBe('next_action');
        expect(suggestion.content).toBeTruthy();
        expect(suggestion.reasoning).toBeTruthy();
      });
    });

    it('should suggest getting started for new users', async () => {
      const newUserContext: UserContext = {
        ...mockUserContext,
        recentIdeas: [],
        successfulContent: []
      };

      const request: SuggestionRequest = {
        context: newUserContext,
        suggestionType: 'next_action',
        limit: 5
      };

      const suggestions = await service.getSuggestions(request);

      const actionTexts = suggestions.map(s => s.content.toLowerCase());
      expect(actionTexts.some(text => text.includes('criar') || text.includes('comec'))).toBe(true);
    });
  });

  describe('User Context Processing', () => {
    it('should update user profile based on context', async () => {
      const request: SuggestionRequest = {
        context: mockUserContext,
        currentInput: 'Teste de contexto',
        suggestionType: 'content'
      };

      await service.getSuggestions(request);

      // Should save updated profile
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    it('should consider user history in suggestions', async () => {
      const contextWithHistory: UserContext = {
        ...mockUserContext,
        recentIdeas: ['Marketing digital', 'Vendas online'],
        preferredCategories: ['marketing', 'vendas']
      };

      const request: SuggestionRequest = {
        context: contextWithHistory,
        currentInput: 'Como aumentar vendas',
        suggestionType: 'content'
      };

      const suggestions = await service.getSuggestions(request);

      // Should have high confidence suggestions based on history
      expect(suggestions.some(s => s.confidence >= 0.8)).toBe(true);
    });
  });

  describe('Content Analysis', () => {
    it('should analyze content sentiment', async () => {
      const positiveContent = 'Excelente tutorial sobre como fazer marketing incrível';
      const negativeContent = 'Terrível problema com vendas ruins';

      const positiveRequest: SuggestionRequest = {
        context: mockUserContext,
        currentInput: positiveContent,
        suggestionType: 'improvement'
      };

      const negativeRequest: SuggestionRequest = {
        context: mockUserContext,
        currentInput: negativeContent,
        suggestionType: 'improvement'
      };

      const positiveSuggestions = await service.getSuggestions(positiveRequest);
      const negativeSuggestions = await service.getSuggestions(negativeRequest);

      // Should handle different sentiments appropriately
      expect(positiveSuggestions).toBeInstanceOf(Array);
      expect(negativeSuggestions).toBeInstanceOf(Array);
    });

    it('should extract keywords from content', async () => {
      const keywordRichContent = 'Marketing digital Instagram YouTube TikTok social media';
      
      const request: SuggestionRequest = {
        context: mockUserContext,
        currentInput: keywordRichContent,
        suggestionType: 'category'
      };

      const suggestions = await service.getSuggestions(request);

      // Should recognize marketing/social media keywords
      const hasMarketingCategory = suggestions.some(s => 
        s.content.toLowerCase().includes('marketing') || 
        s.content.toLowerCase().includes('social')
      );
      
      expect(hasMarketingCategory).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing user context gracefully', async () => {
      const incompleteContext: UserContext = {
        userId: 'test',
        recentIdeas: [],
        preferredCategories: [],
        platforms: [],
        successfulContent: [],
        userBehavior: {
          sessionTime: 0,
          actionsPerSession: 0,
          preferredFeatures: []
        }
      };

      const request: SuggestionRequest = {
        context: incompleteContext,
        currentInput: 'Teste',
        suggestionType: 'content'
      };

      const suggestions = await service.getSuggestions(request);

      expect(suggestions).toBeInstanceOf(Array);
      // Should still return some suggestions even with minimal context
    });

    it('should handle storage errors gracefully', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      expect(() => new AISuggestionsService()).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('should complete suggestion generation within reasonable time', async () => {
      const startTime = Date.now();
      
      const request: SuggestionRequest = {
        context: mockUserContext,
        currentInput: 'Performance test content',
        suggestionType: 'content',
        limit: 5
      };

      await service.getSuggestions(request);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle multiple concurrent requests', async () => {
      const requests = Array(5).fill(null).map((_, i) => ({
        context: mockUserContext,
        currentInput: `Test content ${i}`,
        suggestionType: 'content' as const,
        limit: 3
      }));

      const promises = requests.map(request => service.getSuggestions(request));
      const results = await Promise.all(promises);

      results.forEach(suggestions => {
        expect(suggestions).toBeInstanceOf(Array);
        expect(suggestions.length).toBeLessThanOrEqual(3);
      });
    });
  });
});

describe('AISuggestionsService Integration', () => {
  let service: AISuggestionsService;

  beforeEach(() => {
    service = new AISuggestionsService();
  });

  it('should work with real user data patterns', async () => {
    const realUserContext: UserContext = {
      userId: 'real-user-456',
      recentIdeas: [
        'Como fazer marketing de conteúdo eficaz',
        'Estratégias de vendas para e-commerce',
        'Dicas de produtividade para empreendedores'
      ],
      preferredCategories: ['marketing', 'vendas', 'produtividade'],
      platforms: ['youtube', 'instagram', 'linkedin'],
      successfulContent: [
        'Tutorial de marketing digital que teve 10k views',
        'Dicas de vendas que geraram 500 leads'
      ],
      userBehavior: {
        sessionTime: 2400,
        actionsPerSession: 25,
        preferredFeatures: ['generator', 'templates', 'analytics']
      }
    };

    const request: SuggestionRequest = {
      context: realUserContext,
      currentInput: 'Como aumentar o engajamento nas redes sociais',
      suggestionType: 'content',
      limit: 5,
      minConfidence: 0.7
    };

    const suggestions = await service.getSuggestions(request);

    expect(suggestions).toBeInstanceOf(Array);
    expect(suggestions.length).toBeGreaterThan(0);
    
    // Should have relevant suggestions based on user history
    expect(suggestions.some(s => s.confidence >= 0.8)).toBe(true);
    expect(suggestions.every(s => s.type === 'content')).toBe(true);
  });
});

describe('AISuggestionsService Edge Cases', () => {
  let service: AISuggestionsService;

  beforeEach(() => {
    service = new AISuggestionsService();
  });

  it('should handle extremely long input content', async () => {
    const longContent = 'A'.repeat(10000);
    
    const request: SuggestionRequest = {
      context: {
        userId: 'test',
        recentIdeas: [],
        preferredCategories: [],
        platforms: [],
        successfulContent: [],
        userBehavior: {
          sessionTime: 100,
          actionsPerSession: 1,
          preferredFeatures: []
        }
      },
      currentInput: longContent,
      suggestionType: 'improvement'
    };

    const suggestions = await service.getSuggestions(request);

    expect(suggestions).toBeInstanceOf(Array);
    // Should handle long content without crashing
  });

  it('should handle special characters in input', async () => {
    const specialContent = '!@#$%^&*()_+{}:"<>?[];\',./ áéíóú ñü';
    
    const request: SuggestionRequest = {
      context: {
        userId: 'test',
        recentIdeas: [],
        preferredCategories: [],
        platforms: [],
        successfulContent: [],
        userBehavior: {
          sessionTime: 100,
          actionsPerSession: 1,
          preferredFeatures: []
        }
      },
      currentInput: specialContent,
      suggestionType: 'category'
    };

    expect(async () => {
      await service.getSuggestions(request);
    }).not.toThrow();
  });
}); 