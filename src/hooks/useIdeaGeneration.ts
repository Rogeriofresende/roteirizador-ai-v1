/**
 * 🧠 useIdeaGeneration Hook - Banco de Ideias Integration
 * 
 * Custom hook for integrating with IdeaBankService backend
 * Handles idea generation, feedback processing, and user journey tracking
 * 
 * Part of: WEEK 1 - Banco de Ideias Implementation
 * Integration: IdeaBankService + AnalyticsService + PersonalizationService
 */

import { useState, useCallback, useRef } from 'react';
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

export const useIdeaGeneration = () => {
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState<IdeaGenerationResponse['idea'][]>([]);
  const [currentIdea, setCurrentIdea] = useState<IdeaGenerationResponse['idea'] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<IdeaGenerationResponse['metadata'] | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Get services from container
  const getServices = useCallback(() => {
    const app = getApplication();
    return {
      ideaBankService: app.getService('IdeaBankService'),
      analyticsService: app.getService('AnalyticsService'),
      personalizationService: app.getService('PersonalizationService')
    };
  }, []);
  
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
      const { ideaBankService, analyticsService, personalizationService } = getServices();
      
      // Get personalized recommendations
      const recommendations = await personalizationService.generatePersonalizedRecommendations({
        userId: request.userId,
        context: {
          currentPreferences: {},
          recentInteractions: [],
          sessionData: {}
        }
      });
      
      // Apply personalization to request
      const personalizedRequest = {
        ...request,
        personalizedContext: recommendations.personalizedContent
      };
      
      // Generate idea with backend service
      const result = await ideaBankService.generateIdea(personalizedRequest);
      
      if (result.success) {
        setCurrentIdea(result.idea);
        setMetadata(result.metadata);
        setIdeas(prev => [result.idea, ...prev]);
        
        // Track successful generation
        await analyticsService.track({
          userId: request.userId,
          eventType: 'user_action',
          category: 'idea_generation',
          action: 'generate_idea',
          label: result.idea.category,
          value: 1,
          metadata: {
            category: result.idea.category,
            personalizationApplied: result.metadata.personalizationApplied,
            cost: result.metadata.cost,
            processingTime: result.metadata.processingTime
          }
        });
        
        // Track business metric
        await analyticsService.track({
          userId: request.userId,
          eventType: 'business_metric',
          category: 'idea_generation',
          action: 'idea_generated',
          value: 1,
          metadata: {
            category: result.idea.category,
            serviceLevel: result.metadata.serviceLevel,
            tierInfo: result.metadata.tierInfo
          }
        });
      }
      
      return result;
      
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return null; // Request was cancelled
      }
      
      const errorMessage = err.message || 'Erro ao gerar ideia. Tente novamente.';
      setError(errorMessage);
      
      // Track error
      const { analyticsService } = getServices();
      await analyticsService.track({
        userId: request.userId,
        eventType: 'error_event',
        category: 'idea_generation',
        action: 'generation_error',
        metadata: { 
          error: errorMessage, 
          context: 'idea_generation' 
        }
      });
      
      return null;
      
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [getServices]);
  
  // Process idea feedback
  const processFeedback = useCallback(async (
    userId: string,
    feedback: IdeaFeedback
  ): Promise<boolean> => {
    try {
      const { ideaBankService, analyticsService, personalizationService } = getServices();
      
      // Process feedback with backend service
      const result = await ideaBankService.processIdeaFeedback({
        userId,
        ideaId: feedback.ideaId,
        interactionType: feedback.interactionType,
        rating: feedback.rating,
        feedback: feedback.feedback
      });
      
      if (result.success) {
        // Update personalization based on feedback
        await personalizationService.updateUserPreferences(
          userId,
          {
            type: 'idea_feedback',
            data: feedback,
            timestamp: new Date().toISOString()
          }
        );
        
        // Track feedback
        await analyticsService.track({
          userId,
          eventType: 'user_action',
          category: 'idea_interaction',
          action: `idea_${feedback.interactionType}`,
          label: feedback.ideaId,
          value: feedback.rating || 1,
          metadata: {
            interactionType: feedback.interactionType,
            rating: feedback.rating,
            hasTextFeedback: !!feedback.feedback
          }
        });
        
        return true;
      }
      
      return false;
      
    } catch (err: any) {
      console.error('Error processing feedback:', err);
      
      // Track feedback error
      const { analyticsService } = getServices();
      await analyticsService.track({
        userId,
        eventType: 'error_event',
        category: 'idea_interaction',
        action: 'feedback_error',
        metadata: { 
          error: err.message, 
          context: 'feedback_processing',
          ideaId: feedback.ideaId
        }
      });
      
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
      
      const { ideaBankService } = getServices();
      
      const result = await ideaBankService.getUserIdeas({
        userId,
        filters,
        pagination,
        sort
      });
      
      if (result.success) {
        setIdeas(result.ideas);
        return result;
      }
      
      setError('Erro ao carregar ideias.');
      return null;
      
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
    cancelGeneration
  };
};

export default useIdeaGeneration; 