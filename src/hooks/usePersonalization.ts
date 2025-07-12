/**
 * 🎯 usePersonalization Hook - Personalization Engine Integration
 * 
 * Custom hook for integrating with PersonalizationService backend
 * Handles user preference learning, A/B testing, and adaptive UX
 * 
 * Part of: WEEK 1 - Banco de Ideias Implementation
 * Integration: PersonalizationService + AnalyticsService
 */

import { useState, useCallback, useEffect } from 'react';
import { getApplication } from '../architecture/ServiceArchitecture';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface UserPreferences {
  categories: string[];
  styles: string[];
  targetAudiences: string[];
  contentTypes: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  themes: {
    preferred: string[];
    disliked: string[];
  };
  learningStyle: 'visual' | 'textual' | 'interactive';
  sessionPreferences: {
    ideaFrequency: number;
    feedbackFrequency: number;
    notificationLevel: 'minimal' | 'moderate' | 'detailed';
  };
}

export interface PersonalizationInsights {
  progress: {
    dataPoints: number;
    accuracy: number;
    completeness: number;
    learningStage: 'initial' | 'learning' | 'optimized';
  };
  preferences: UserPreferences;
  recommendations: {
    categories: string[];
    nextSuggestions: string[];
    improvementAreas: string[];
  };
  patterns: {
    bestPerformingContent: string[];
    engagementTimes: string[];
    preferredJourney: string;
  };
}

export interface PersonalizationRecommendations {
  personalizedContent: {
    suggestedCategories: string[];
    adaptedDifficulty: string;
    contextualKeywords: string[];
  };
  uiAdaptations: {
    layout: 'compact' | 'detailed' | 'visual';
    interactionStyle: 'minimal' | 'guided' | 'exploratory';
    informationDensity: 'low' | 'medium' | 'high';
  };
  nextActions: {
    suggested: string[];
    priority: 'low' | 'medium' | 'high';
  };
}

export interface ABTestConfig {
  testId: string;
  assignedStrategy: string;
  testVariant: string;
  metrics: string[];
  duration: number;
}

export interface InteractionData {
  type: string;
  data: any;
  timestamp: string;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export const usePersonalization = (userId: string) => {
  const [insights, setInsights] = useState<PersonalizationInsights | null>(null);
  const [recommendations, setRecommendations] = useState<PersonalizationRecommendations | null>(null);
  const [abTestConfig, setAbTestConfig] = useState<ABTestConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get services from container
  const getServices = useCallback(() => {
    const app = getApplication();
    return {
      personalizationService: app.getService('PersonalizationService'),
      analyticsService: app.getService('AnalyticsService')
    };
  }, []);
  
  // Load personalization insights
  const loadInsights = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { personalizationService } = getServices();
      
      const result = await personalizationService.getPersonalizationInsights(userId);
      
      if (result.success) {
        setInsights(result.insights);
        return result.insights;
      } else {
        setError('Erro ao carregar insights de personalização.');
        return null;
      }
      
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao carregar insights.';
      setError(errorMessage);
      
      // Track error
      const { analyticsService } = getServices();
      await analyticsService.track({
        userId,
        eventType: 'error_event',
        category: 'personalization',
        action: 'insights_load_error',
        metadata: { error: errorMessage }
      });
      
      return null;
      
    } finally {
      setLoading(false);
    }
  }, [userId, getServices]);
  
  // Generate personalized recommendations
  const getRecommendations = useCallback(async (context?: {
    currentPreferences?: Partial<UserPreferences>;
    recentInteractions?: InteractionData[];
    sessionData?: any;
  }) => {
    if (!userId) return null;
    
    try {
      const { personalizationService } = getServices();
      
      const result = await personalizationService.generatePersonalizedRecommendations({
        userId,
        context: context || {}
      });
      
      if (result.success) {
        setRecommendations(result.recommendations);
        return result.recommendations;
      }
      
      return null;
      
    } catch (err: any) {
      console.error('Error getting recommendations:', err);
      return null;
    }
  }, [userId, getServices]);
  
  // Update user preferences based on interaction
  const updatePreferences = useCallback(async (interaction: InteractionData) => {
    if (!userId) return false;
    
    try {
      const { personalizationService, analyticsService } = getServices();
      
      // Update preferences
      const result = await personalizationService.updateUserPreferences(
        userId,
        interaction
      );
      
      if (result.success) {
        // Track preference update
        await analyticsService.track({
          userId,
          eventType: 'user_action',
          category: 'personalization',
          action: 'preference_updated',
          metadata: {
            interactionType: interaction.type,
            dataPoints: result.updatedPreferences?.dataPoints || 0
          }
        });
        
        // Reload insights to reflect changes
        await loadInsights();
        
        return true;
      }
      
      return false;
      
    } catch (err: any) {
      console.error('Error updating preferences:', err);
      return false;
    }
  }, [userId, getServices, loadInsights]);
  
  // Setup A/B testing for personalization
  const setupABTest = useCallback(async (strategies: {
    name: string;
    config: any;
  }[], metrics: string[] = ['engagement_rate', 'satisfaction_score']) => {
    if (!userId) return null;
    
    try {
      const { personalizationService } = getServices();
      
      const config = await personalizationService.runPersonalizationABTest(
        userId,
        {
          strategies,
          metrics,
          duration: 14 // days
        }
      );
      
      if (config.success) {
        setAbTestConfig(config.testConfig);
        return config.testConfig;
      }
      
      return null;
      
    } catch (err: any) {
      console.error('Error setting up A/B test:', err);
      return null;
    }
  }, [userId, getServices]);
  
  // Get learning progress
  const getLearningProgress = useCallback(() => {
    if (!insights?.progress) return null;
    
    const { dataPoints, accuracy, completeness, learningStage } = insights.progress;
    
    return {
      stage: learningStage,
      accuracy: Math.round(accuracy * 100),
      completeness: Math.round(completeness * 100),
      dataPoints,
      isReady: learningStage !== 'initial' && completeness > 0.3,
      recommendationQuality: 
        learningStage === 'optimized' ? 'excellent' :
        learningStage === 'learning' ? 'good' : 'basic'
    };
  }, [insights]);
  
  // Get UI adaptations based on user preferences
  const getUIAdaptations = useCallback(() => {
    if (!recommendations?.uiAdaptations) return null;
    
    const { layout, interactionStyle, informationDensity } = recommendations.uiAdaptations;
    
    return {
      layout,
      interactionStyle,
      informationDensity,
      classNames: {
        container: `layout-${layout} interaction-${interactionStyle} density-${informationDensity}`,
        layout: `layout-${layout}`,
        interaction: `interaction-${interactionStyle}`,
        density: `density-${informationDensity}`
      }
    };
  }, [recommendations]);
  
  // Track personalization interaction
  const trackInteraction = useCallback(async (
    action: string,
    metadata: any = {}
  ) => {
    if (!userId) return;
    
    try {
      const { analyticsService } = getServices();
      
      await analyticsService.track({
        userId,
        eventType: 'user_action',
        category: 'personalization',
        action,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          learningStage: insights?.progress?.learningStage || 'initial'
        }
      });
      
    } catch (err: any) {
      console.error('Error tracking personalization interaction:', err);
    }
  }, [userId, getServices, insights]);
  
  // Auto-load insights on mount and userId change
  useEffect(() => {
    if (userId) {
      loadInsights();
    }
  }, [userId, loadInsights]);
  
  // Auto-refresh insights every 5 minutes
  useEffect(() => {
    if (!userId) return;
    
    const interval = setInterval(() => {
      loadInsights();
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(interval);
  }, [userId, loadInsights]);
  
  return {
    // State
    insights,
    recommendations,
    abTestConfig,
    loading,
    error,
    
    // Computed values
    learningProgress: getLearningProgress(),
    uiAdaptations: getUIAdaptations(),
    
    // Actions
    loadInsights,
    getRecommendations,
    updatePreferences,
    setupABTest,
    trackInteraction
  };
};

export default usePersonalization; 