/**
 * 🧠 BANCO DE IDEIAS - LOGIC HOOK V8.0
 * Business logic extracted from monolithic BancoDeIdeias.tsx
 * Following V8.0 Unified Development methodology
 */

import { useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useIdeaGeneration } from '../../../hooks/useIdeaGeneration';
import { usePersonalization } from '../../../hooks/usePersonalization';
import { useBudgetManagement } from '../../../hooks/useBudgetManagement';
import { useIdeaCache } from '../../../hooks/useIdeaCache';
import { useUsage } from '../../../hooks/useUsage';
import { useSharing } from '../../../hooks/useSharing';
import usePerformanceMonitoring from '../../../hooks/usePerformanceMonitoring';

import { 
  IdeaFormData, 
  IdeaResponse, 
  IdeaTemplate,
  IdeaFeedbackHandler,
  TemplateApplyHandler,
  ExportHandler,
  ImportHandler
} from '../types';

import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../constants';

interface UseBancoDeIdeiasLogicProps {
  onAlert: (type: 'success' | 'error' | 'warning', message: string) => void;
  onIdeaGenerated: (idea: IdeaResponse | null) => void;
  onGenerationStart: () => void;
  onGenerationProgress: (progress: number) => void;
}

export const useBancoDeIdeiasLogic = ({
  onAlert,
  onIdeaGenerated,
  onGenerationStart,
  onGenerationProgress
}: UseBancoDeIdeiasLogicProps) => {
  
  const { currentUser } = useAuth();
  const userId = currentUser?.uid || '';
  
  // ============================================================================
  // CORE HOOKS
  // ============================================================================
  
  const {
    currentIdea,
    isGeneratingIdea,
    generateIdea,
    saveIdea,
    getIdeasHistory,
    quickAddIdea,
    searchIdeas,
    loading: ideaLoading,
    error: ideaError,
    metadata: ideaMetadata,
    clearError: clearIdeaError,
  } = useIdeaGeneration();
  
  const {
    recommendations,
    learningProgress,
    uiAdaptations,
    trackInteraction,
    loading: personalizationLoading
  } = usePersonalization(userId);
  
  const {
    costSummary,
    canGenerateIdea,
    alerts: budgetAlerts,
    tierUpgradeInfo,
    trackIdeaCost,
    loading: budgetLoading
  } = useBudgetManagement(userId);
  
  const {
    getCachedOrFetch,
    preloadCache,
    clearCache: clearIdeaCache,
    cacheStats
  } = useIdeaCache();
  
  const {
    usageData,
    trackUsage
  } = useUsage(userId);
  
  const { quickShare, isSharing } = useSharing();
  
  const {
    webVitals,
    performanceReport,
    overallScore,
    isLoading: performanceLoading,
    generateReport,
    refreshMetrics,
    getMetricByName,
    getPerformanceAlerts,
    getPerformanceRecommendations
  } = usePerformanceMonitoring({
    userId,
    reportingEndpoint: '/api/performance',
    reportingInterval: 15000,
    enabled: true
  });
  
  // ============================================================================
  // IDEA GENERATION LOGIC
  // ============================================================================
  
  const handleGenerateIdea = useCallback(async (formData: IdeaFormData) => {
    if (!canGenerateIdea || isGeneratingIdea) return;
    
    onGenerationStart();
    
    // Track performance start
    const startTime = performance.now();
    
    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        onGenerationProgress(prev => Math.min(prev + 10, 90));
      }, 200);
      
      const cacheKey = {
        formData,
        userId,
        timestamp: Date.now()
      };
      
      const newIdea = await getCachedOrFetch(
        cacheKey,
        () => generateIdea(formData),
        5 * 60 * 1000 // 5 minutes cache
      );
      
      clearInterval(progressInterval);
      onGenerationProgress(100);
      
      if (newIdea) {
        onIdeaGenerated(newIdea);
        
        // Track performance metrics
        const endTime = performance.now();
        const generationTime = endTime - startTime;
        
        await trackUsage('idea_generated', {
          category: formData.category,
          cached: Boolean(cacheStats.hits > 0),
          generationTime,
          performanceScore: overallScore
        });
        
        onAlert('success', SUCCESS_MESSAGES.IDEA_GENERATED);
      }
      
    } catch (error) {
      console.error('Erro ao gerar ideia:', error);
      onAlert('error', ERROR_MESSAGES.IDEA_GENERATION_FAILED);
      onIdeaGenerated(null);
    } finally {
      onGenerationProgress(0);
    }
  }, [
    canGenerateIdea,
    isGeneratingIdea,
    formData,
    userId,
    generateIdea,
    getCachedOrFetch,
    trackUsage,
    cacheStats,
    overallScore,
    onGenerationStart,
    onGenerationProgress,
    onIdeaGenerated,
    onAlert
  ]);
  
  // ============================================================================
  // IDEA FEEDBACK LOGIC
  // ============================================================================
  
  const handleIdeaFeedback: IdeaFeedbackHandler = useCallback(async (
    ideaId: string,
    interactionType: 'like' | 'dislike' | 'save' | 'share' | 'implement',
    rating?: number,
    feedback?: string
  ) => {
    try {
      if (interactionType === 'save' && currentIdea) {
        const saved = await saveIdea(currentIdea);
        if (saved) {
          onAlert('success', SUCCESS_MESSAGES.IDEA_SAVED);
        } else {
          onAlert('error', ERROR_MESSAGES.IDEA_SAVE_FAILED);
        }
      } else {
        // For other interactions, use the original method
        await trackInteraction('idea_feedback', {
          ideaId,
          type: interactionType,
          rating,
          hasTextFeedback: !!feedback
        });
      }
      
    } catch (error) {
      console.error('Erro ao processar feedback:', error);
      onAlert('error', 'Erro ao processar ação. Tente novamente.');
    }
  }, [currentIdea, saveIdea, trackInteraction, onAlert]);
  
  // ============================================================================
  // TEMPLATE LOGIC
  // ============================================================================
  
  const handleApplyTemplate: TemplateApplyHandler = useCallback((template: IdeaTemplate) => {
    try {
      // Apply template data to form
      const templateFormData = {
        ...template.formData,
        // Ensure all required fields have values
        category: template.formData.category || 'Marketing & Growth',
        style: template.formData.style || 'Startups',
        targetAudience: template.formData.targetAudience || 'Startups',
        contentType: template.formData.contentType || 'Videos',
        keywords: template.formData.keywords || [],
        keywordsInput: template.formData.keywords?.join(', ') || '',
        difficulty: template.formData.difficulty || 'intermediate'
      } as IdeaFormData;
      
      // Template would be applied through parent component
      // This hook only provides the logic
      
      onAlert('success', SUCCESS_MESSAGES.TEMPLATE_APPLIED.replace('Template', `Template "${template.name}"`));
      
      return templateFormData;
    } catch (error) {
      console.error('Erro ao aplicar template:', error);
      onAlert('error', 'Erro ao aplicar template. Tente novamente.');
      return null;
    }
  }, [onAlert]);
  
  // ============================================================================
  // EXPORT/IMPORT LOGIC
  // ============================================================================
  
  const handleExportIdeas: ExportHandler = useCallback(async (ideas: IdeaResponse[]) => {
    try {
      await trackUsage('ideas_exported', { count: ideas.length });
      onAlert('success', SUCCESS_MESSAGES.IDEAS_EXPORTED.replace('Ideias', `${ideas.length} ideias`));
    } catch (error) {
      console.error('Erro ao exportar ideias:', error);
      onAlert('error', 'Erro ao exportar ideias. Tente novamente.');
    }
  }, [trackUsage, onAlert]);
  
  const handleImportIdeas: ImportHandler = useCallback(async (ideas: IdeaResponse[]) => {
    try {
      // Process imported ideas
      for (const idea of ideas) {
        await saveIdea({
          ...idea,
          metadata: {
            ...idea.metadata,
            imported: true,
            importedAt: new Date().toISOString()
          }
        });
      }
      
      await trackUsage('ideas_imported', { count: ideas.length });
      onAlert('success', SUCCESS_MESSAGES.IDEAS_IMPORTED.replace('Ideias', `${ideas.length} ideias`));
      
    } catch (error) {
      console.error('Erro ao importar ideias:', error);
      onAlert('error', 'Erro ao importar ideias. Tente novamente.');
      throw error;
    }
  }, [saveIdea, trackUsage, onAlert]);
  
  // ============================================================================
  // QUICK ADD LOGIC
  // ============================================================================
  
  const handleQuickAddIdea = useCallback(async (data: {
    title: string;
    description?: string;
    category?: string;
    tags?: string[];
  }) => {
    try {
      const addedIdea = await quickAddIdea({
        ...data,
        userId
      });
      
      if (addedIdea) {
        onAlert('success', 'Ideia adicionada com sucesso!');
        return addedIdea;
      }
    } catch (error) {
      console.error('Erro ao adicionar ideia:', error);
      onAlert('error', 'Erro ao adicionar ideia. Tente novamente.');
      return null;
    }
  }, [quickAddIdea, userId, onAlert]);
  
  // ============================================================================
  // SHARING LOGIC
  // ============================================================================
  
  const handleShareIdea = useCallback(async (idea: IdeaResponse) => {
    try {
      await quickShare(idea);
      onAlert('success', 'Ideia compartilhada com sucesso!');
    } catch (error) {
      console.error('Erro ao compartilhar ideia:', error);
      onAlert('error', 'Erro ao compartilhar ideia. Tente novamente.');
    }
  }, [quickShare, onAlert]);
  
  // ============================================================================
  // RETURN ALL LOGIC
  // ============================================================================
  
  return {
    // States from hooks
    currentIdea,
    isGeneratingIdea,
    ideaLoading,
    ideaError,
    ideaMetadata,
    recommendations,
    learningProgress,
    uiAdaptations,
    costSummary,
    canGenerateIdea,
    budgetAlerts,
    tierUpgradeInfo,
    usageData,
    webVitals,
    performanceReport,
    overallScore,
    cacheStats,
    isSharing,
    
    // Loading states
    loading: {
      idea: ideaLoading,
      personalization: personalizationLoading,
      budget: budgetLoading,
      performance: performanceLoading,
    },
    
    // Actions
    actions: {
      // Idea actions
      handleGenerateIdea,
      handleIdeaFeedback,
      
      // Template actions
      handleApplyTemplate,
      
      // Export/Import actions
      handleExportIdeas,
      handleImportIdeas,
      
      // Quick add actions
      handleQuickAddIdea,
      
      // Sharing actions
      handleShareIdea,
      
      // Utility actions
      clearIdeaError,
      clearIdeaCache,
      refreshMetrics,
      getPerformanceAlerts,
      getPerformanceRecommendations,
    }
  };
}; 