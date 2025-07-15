/**
 * 🧠 useIdeaGeneration Hook - Banco de Ideias Integration
 * 
 * Custom hook for integrating with IdeaBankService backend
 * Handles idea generation, feedback processing, and user journey tracking
 * 
 * Part of: WEEK 1 - Banco de Ideias Implementation
 * Integration: IdeaBankService + AnalyticsService + PersonalizationService
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { getApplication } from '../architecture/ServiceArchitecture';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface IdeaGenerationRequest {
  userId: string;
  category?: string;
  style?: string;
  targetAudience?: string;
  contentType?: string;
  keywords?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export interface IdeaGenerationResponse {
  success: boolean;
  idea: {
    id: string;
    title: string;
    description: string;
    category: string;
    targetAudience: string;
    implementation: string;
    tags: string[];
  };
  metadata: {
    cost: number;
    tokensUsed: number;
    processingTime: number;
    source: string;
    serviceLevel: string;
    personalizationApplied: boolean;
    tierInfo: {
      current: string;
      remaining: number;
      resetTime: string;
    };
  };
  recommendations: string[];
}

export interface IdeaFeedback {
  ideaId: string;
  interactionType: 'like' | 'dislike' | 'save' | 'share' | 'implement';
  rating?: number;
  feedback?: string;
}

export interface IdeaFilters {
  category?: string;
  status?: string;
  dateRange?: { start: Date; end: Date };
  rating?: number;
}

export interface IdeaPagination {
  page: number;
  limit: number;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

// Create fallback services when container is not available
const createFallbackServices = () => {
  return {
    ideaBankService: null,
    personalizationService: null,
    analyticsService: null
  };
};

export const useIdeaGeneration = () => {
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState<IdeaGenerationResponse['idea'][]>([]);
  const [currentIdea, setCurrentIdea] = useState<IdeaGenerationResponse['idea'] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<IdeaGenerationResponse['metadata'] | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Debug: Monitor currentIdea changes
  useEffect(() => {
    console.log('🔍 currentIdea mudou para:', currentIdea);
  }, [currentIdea]);
  
  // Get services from container
  const getServices = async () => {
    try {
      const app = getApplication();
      // Get container through service resolution (now properly registered)
      const container = app.getService('ServiceContainer');
      
      if (!container) {
        console.warn('Container not available, using fallback services');
        return createFallbackServices();
      }
      
      return {
        ideaBankService: await container.resolveAsync('IdeaBankService'),
        analyticsService: await container.resolveAsync('AnalyticsService'),
        personalizationService: await container.resolveAsync('PersonalizationService')
      };
    } catch (error) {
      // Fallback para serviços mock/default em caso de erro
      console.warn('Failed to resolve idea generation services, using fallbacks:', error);
      return {
        ideaBankService: null,
        analyticsService: null,
        personalizationService: null
      };
    }
  };
  
  // Generate new idea
  const generateIdea = useCallback(async (request: IdeaGenerationRequest): Promise<IdeaGenerationResponse | null> => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);
    
    try {
      const { ideaBankService, analyticsService, personalizationService } = await getServices();
      
      // Check if required services are available
      if (!ideaBankService) {
        const errorMsg = 'IdeaBankService não disponível';
        setError(errorMsg);
        console.warn('IdeaBankService not available, cannot generate idea');
        return null;
      }
      
      // Get personalized recommendations (optional)
      let recommendations = null;
      if (personalizationService) {
        try {
          recommendations = await personalizationService.generatePersonalizedRecommendations({
            userId: request.userId,
            context: {
              currentPreferences: {},
              recentInteractions: [],
              sessionData: {}
            }
          });
        } catch (err) {
          console.warn('Failed to get personalized recommendations:', err);
        }
      }
      
      // Apply personalization to request
      const personalizedRequest = {
        ...request,
        personalizedContext: recommendations?.personalizedContent || null
      };
      
      // Generate idea with backend service
      const result = await ideaBankService.generateIdea(personalizedRequest);
      
      if (result.success && result.idea) {
        const newIdea = result.idea;
        
        console.log('🔄 Atualizando currentIdea com:', newIdea);
        setCurrentIdea(newIdea);
        setIdeas(prev => [newIdea, ...prev].slice(0, 10)); // Keep last 10 ideas
        setMetadata(result.metadata);
        
        console.log('✅ States atualizados - currentIdea deveria ser:', newIdea.title);
        
        // Track successful generation (optional)
        if (analyticsService) {
          await analyticsService.trackEvent('idea_generated', {
            userId: request.userId,
            ideaId: newIdea.id,
            category: newIdea.category,
            difficulty: newIdea.difficulty,
            hasPersonalization: !!recommendations,
            generationTime: result.metadata?.generationTime
          });
        }
        
        return result;
      } else {
        const errorMsg = result.error || 'Erro ao gerar ideia.';
        console.log('❌ Erro na geração:', errorMsg);
        setError(errorMsg);
        return null;
      }
      
    } catch (err: any) {
      const errorMessage = err.message || 'Erro inesperado ao gerar ideia.';
      setError(errorMessage);
      
      // Track error (optional)
      const { analyticsService } = await getServices();
      if (analyticsService) {
        await analyticsService.trackError('idea_generation_error', {
          userId: request.userId,
          error: errorMessage,
          context: 'idea_generation',
          category: request.category
        });
      }
      
      return null;
      
    } finally {
      setLoading(false);
    }
  }, [getServices]);
  
  // Process idea feedback
  const processFeedback = useCallback(async (
    userId: string,
    feedback: IdeaFeedback
  ): Promise<boolean> => {
    try {
      const { ideaBankService, analyticsService, personalizationService } = await getServices();
      
      // Check if required service is available
      if (!ideaBankService) {
        console.warn('IdeaBankService not available, cannot process feedback');
        return false;
      }
      
      // Process feedback with backend service
      const result = await ideaBankService.processIdeaFeedback({
        userId,
        ideaId: feedback.ideaId,
        interactionType: feedback.interactionType,
        rating: feedback.rating,
        feedback: feedback.feedback
      });
      
      if (result.success) {
        // Update personalization based on feedback (optional)
        if (personalizationService) {
          try {
            await personalizationService.updateUserPreferences(
              userId,
              {
                type: 'idea_feedback',
                data: feedback,
                timestamp: new Date().toISOString()
              }
            );
          } catch (err) {
            console.warn('Failed to update personalization preferences:', err);
          }
        }
        
        // Track feedback (optional)
        if (analyticsService) {
          await analyticsService.trackEvent(`idea_${feedback.interactionType}`, {
            userId,
            ideaId: feedback.ideaId,
            rating: feedback.rating || 1,
            interactionType: feedback.interactionType,
            hasTextFeedback: !!feedback.feedback
          });
        }
        
        return true;
      }
      
      return false;
      
    } catch (err: any) {
      console.error('Error processing feedback:', err);
      
      // Track feedback error (optional)
      const { analyticsService } = await getServices();
      if (analyticsService) {
        await analyticsService.trackError('feedback_error', {
          userId,
          error: err.message,
          context: 'feedback_processing',
          ideaId: feedback.ideaId
        });
      }
      
      return false;
    }
  }, [getServices]);
  
  // Get user ideas with filters
  const getUserIdeas = useCallback(async (
    userId: string,
    filters?: IdeaFilters,
    pagination?: IdeaPagination,
    sort?: { field: string; order: 'asc' | 'desc' }
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const { ideaBankService } = await getServices();
      
      if (!ideaBankService) {
        console.warn('IdeaBankService not available, cannot get user ideas');
        setError('Serviço não disponível para carregar ideias.');
        return;
      }
      
      const result = await ideaBankService.getUserIdeas({
        userId,
        limit: 50,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      
      if (result.success) {
        setIdeas(result.ideas || []);
      } else {
        setError(result.error || 'Erro ao carregar ideias do usuário.');
      }
      
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao carregar ideias.';
      setError(errorMessage);
      return null;
      
    } finally {
      setLoading(false);
    }
  }, [getServices]);
  
  // Clear current idea
  const clearCurrentIdea = useCallback(() => {
    setCurrentIdea(null);
    setMetadata(null);
  }, []);
  
  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  // Cancel ongoing request
  const cancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setLoading(false);
    }
  }, []);
  
  // P0.1 - Save idea functionality
  const saveIdea = useCallback(async (idea: IdeaGenerationResponse['idea']): Promise<boolean> => {
    try {
      const { ideaBankService } = await getServices();
      
      if (!ideaBankService) {
        console.warn('IdeaBankService not available, cannot save idea');
        return false;
      }
      
      const result = await ideaBankService.saveIdea({
        userId: idea.userId || '',
        idea: idea,
        metadata: {
          source: 'generated',
          cost: metadata?.cost || 0,
          tokensUsed: metadata?.tokensUsed || 0
        }
      });
      
      return result.success;
    } catch (error) {
      console.error('Error saving idea:', error);
      return false;
    }
  }, [getServices, metadata]);

  // P0.2 - Get ideas history
  const getIdeasHistory = useCallback(async (
    userId: string,
    options?: { page?: number; limit?: number; filters?: IdeaFilters }
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const { ideaBankService } = await getServices();
      
      if (!ideaBankService) {
        console.warn('IdeaBankService not available, cannot get ideas history');
        setError('Serviço não disponível para carregar histórico.');
        return;
      }
      
      const result = await ideaBankService.getUserIdeasHistory({
        userId,
        filters: options?.filters,
        pagination: {
          page: options?.page || 1,
          limit: options?.limit || 20
        },
        sort: { field: 'savedAt', order: 'desc' }
      });
      
      if (result.success) {
        setIdeas(result.ideas || []);
        return result;
      } else {
        setError(result.error || 'Erro ao carregar histórico de ideias.');
        return null;
      }
    } catch (error) {
      console.error('Error getting ideas history:', error);
      setError('Erro ao carregar histórico de ideias.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [getServices]);

  // P0.3 - Quick add idea
  const quickAddIdea = useCallback(async (data: {
    title: string;
    description?: string;
    category?: string;
    tags?: string[];
  }): Promise<IdeaGenerationResponse['idea'] | null> => {
    try {
      const { ideaBankService } = await getServices();
      
      if (!ideaBankService) {
        console.warn('IdeaBankService not available, cannot quick add idea');
        return null;
      }
      
      const result = await ideaBankService.quickAddIdea({
        userId: data.userId || '',
        title: data.title,
        description: data.description,
        category: data.category,
        tags: data.tags
      });
      
      if (result.success && result.idea) {
        // Update local state
        setIdeas(prev => [result.idea, ...prev]);
        return result.idea;
      }
      
      return null;
    } catch (error) {
      console.error('Error quick adding idea:', error);
      return null;
    }
  }, [getServices]);

  // P0.4 - Search ideas
  const searchIdeas = useCallback(async (
    userId: string,
    searchTerm: string,
    filters?: {
      category?: string;
      tags?: string[];
      dateRange?: { start: Date; end: Date };
    },
    pagination?: { page?: number; limit?: number }
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const { ideaBankService } = await getServices();
      
      if (!ideaBankService) {
        console.warn('IdeaBankService not available, cannot search ideas');
        setError('Serviço não disponível para busca.');
        return null;
      }
      
      const result = await ideaBankService.searchIdeas({
        userId,
        searchTerm,
        filters,
        pagination: {
          page: pagination?.page || 1,
          limit: pagination?.limit || 20
        }
      });
      
      if (result.success) {
        setIdeas(result.ideas);
        return result;
      } else {
        setError(result.error || 'Erro ao buscar ideias.');
        return null;
      }
    } catch (error) {
      console.error('Error searching ideas:', error);
      setError('Erro ao buscar ideias.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [getServices]);

  return {
    // State
    loading,
    ideas,
    currentIdea,
    error,
    metadata,
    
    // Actions
    generateIdea,
    processFeedback,
    getUserIdeas,
    clearCurrentIdea,
    clearError,
    cancelGeneration,
    
    // P0 New Features
    saveIdea,
    getIdeasHistory,
    quickAddIdea,
    searchIdeas
  };
};

export default useIdeaGeneration; 