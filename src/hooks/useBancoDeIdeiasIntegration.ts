/**
 * 🧠 useBancoDeIdeiasIntegration Hook - Complete Integration
 * 
 * Hook principal que garante que todos os serviços do Banco de Ideias
 * estejam funcionando corretamente juntos
 * 
 * Part of: WEEK 1 - Banco de Ideias Implementation
 * Integration: All services + hooks + components
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useIdeaGeneration } from './useIdeaGeneration';
import { usePersonalization } from './usePersonalization';
import { useBudgetManagement } from './useBudgetManagement';
import { getApplication } from '../architecture/ServiceArchitecture';
import { initializeBancoDeIdeiasServices } from '../architecture/ServiceInitializer';

// ============================================================================
// INTEGRATION STATE INTERFACE
// ============================================================================

interface BancoDeIdeiasIntegrationState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  servicesStatus: {
    [key: string]: boolean;
  };
  lastHealthCheck: Date | null;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export const useBancoDeIdeiasIntegration = () => {
  const { currentUser } = useAuth();
  const userId = currentUser?.uid || '';
  
  const [integrationState, setIntegrationState] = useState<BancoDeIdeiasIntegrationState>({
    isInitialized: false,
    isLoading: true,
    error: null,
    servicesStatus: {},
    lastHealthCheck: null
  });

  // Initialize underlying hooks
  const ideaGeneration = useIdeaGeneration();
  const personalization = usePersonalization(userId);
  const budgetManagement = useBudgetManagement(userId);

  // Initialize services
  const initializeServices = useCallback(async () => {
    try {
      setIntegrationState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Get application and container
      const app = getApplication();
      const container = app.getService('ServiceContainer');
      
      if (!container) {
        throw new Error('ServiceContainer not available');
      }
      
      // Initialize services
      await initializeBancoDeIdeiasServices(container);
      
      // Perform health check
      const healthResults = await performHealthCheck(container);
      
      setIntegrationState(prev => ({
        ...prev,
        isInitialized: true,
        isLoading: false,
        servicesStatus: healthResults,
        lastHealthCheck: new Date()
      }));
      
      console.log('✅ Banco de Ideias integration initialized successfully');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setIntegrationState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      
      console.error('❌ Banco de Ideias integration failed:', error);
    }
  }, []);

  // Perform health check
  const performHealthCheck = useCallback(async (container: any) => {
    const services = [
      'IdeaBankService',
      'GeminiService',
      'AnalyticsService',
      'PersonalizationService',
      'BudgetControlService',
      'RateLimitingService',
      'UsageTierService',
      'FallbackService'
    ];

    const results: { [key: string]: boolean } = {};

    for (const serviceName of services) {
      try {
        if (container.has(serviceName)) {
          const service = container.resolve(serviceName);
          if (service && typeof service.healthCheck === 'function') {
            results[serviceName] = await service.healthCheck();
          } else {
            results[serviceName] = true;
          }
        } else {
          results[serviceName] = false;
        }
      } catch (error) {
        console.warn(`Health check failed for ${serviceName}:`, error);
        results[serviceName] = false;
      }
    }

    return results;
  }, []);

  // Retry initialization
  const retryInitialization = useCallback(async () => {
    await initializeServices();
  }, [initializeServices]);

  // Initialize on mount
  useEffect(() => {
    initializeServices();
  }, [initializeServices]);

  // Auto health check every 5 minutes
  useEffect(() => {
    if (!integrationState.isInitialized) return;

    const interval = setInterval(async () => {
      try {
        const app = getApplication();
        const container = app.getService('ServiceContainer');
        
        if (container) {
          const healthResults = await performHealthCheck(container);
          setIntegrationState(prev => ({
            ...prev,
            servicesStatus: healthResults,
            lastHealthCheck: new Date()
          }));
        }
      } catch (error) {
        console.warn('Health check failed:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [integrationState.isInitialized, performHealthCheck]);

  // Check if system is ready
  const isSystemReady = useCallback(() => {
    return integrationState.isInitialized && 
           !integrationState.isLoading && 
           !integrationState.error &&
           userId &&
           Object.values(integrationState.servicesStatus).some(status => status);
  }, [integrationState, userId]);

  // Get system status
  const getSystemStatus = useCallback(() => {
    const healthyServices = Object.values(integrationState.servicesStatus).filter(status => status).length;
    const totalServices = Object.keys(integrationState.servicesStatus).length;
    
    return {
      healthy: healthyServices,
      total: totalServices,
      percentage: totalServices > 0 ? Math.round((healthyServices / totalServices) * 100) : 0,
      status: healthyServices === totalServices ? 'healthy' : 
              healthyServices > totalServices / 2 ? 'degraded' : 'unhealthy'
    };
  }, [integrationState.servicesStatus]);

  // Enhanced idea generation with integration
  const generateIdea = useCallback(async (formData: any) => {
    if (!isSystemReady()) {
      throw new Error('System not ready. Please try again.');
    }

    try {
      const result = await ideaGeneration.generateIdea({
        userId,
        category: formData.category,
        style: formData.style,
        targetAudience: formData.targetAudience,
        contentType: formData.contentType,
        keywords: formData.keywords,
        difficulty: formData.difficulty
      });

      // Track interaction
      if (result) {
        await personalization.trackInteraction('idea_generated', {
          category: formData.category,
          success: true
        });
      }

      return result;
    } catch (error) {
      await personalization.trackInteraction('idea_generation_failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }, [isSystemReady, ideaGeneration, personalization, userId]);

  // Enhanced feedback processing
  const processFeedback = useCallback(async (ideaId: string, feedback: any) => {
    if (!isSystemReady()) {
      throw new Error('System not ready. Please try again.');
    }

    try {
      const result = await ideaGeneration.processFeedback(userId, {
        ideaId,
        ...feedback
      });

      // Update personalization
      await personalization.updatePreferences({
        type: 'idea_feedback',
        data: feedback,
        timestamp: new Date().toISOString()
      });

      return result;
    } catch (error) {
      console.error('Feedback processing failed:', error);
      throw error;
    }
  }, [isSystemReady, ideaGeneration, personalization, userId]);

  return {
    // Integration state
    isInitialized: integrationState.isInitialized,
    isLoading: integrationState.isLoading,
    error: integrationState.error,
    servicesStatus: integrationState.servicesStatus,
    lastHealthCheck: integrationState.lastHealthCheck,
    
    // System status
    isSystemReady: isSystemReady(),
    systemStatus: getSystemStatus(),
    
    // Enhanced actions
    generateIdea,
    processFeedback,
    retryInitialization,
    
    // Underlying hooks (for direct access if needed)
    ideaGeneration,
    personalization,
    budgetManagement,
    
    // User info
    userId,
    isAuthenticated: !!currentUser
  };
};

export default useBancoDeIdeiasIntegration; 