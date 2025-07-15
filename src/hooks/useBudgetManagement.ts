/**
 * 💰 useBudgetManagement Hook - Cost Control Integration
 * 
 * Custom hook for integrating with budget management and cost control system
 * Handles user tiers, cost tracking, budget alerts, and tier enforcement
 * 
 * Part of: WEEK 1 - Banco de Ideias Implementation
 * Integration: UserRepository + AnalyticsService + Cost Management System
 */

import { useState, useCallback, useEffect } from 'react';
import { getApplication } from '../architecture/ServiceArchitecture';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface BudgetStatus {
  dailyLimit: number;
  weeklyLimit: number;
  monthlyLimit: number;
  percentage: number;
  status: 'safe' | 'warning' | 'critical' | 'exceeded';
  remaining: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

export interface TierInfo {
  currentTier: 'free' | 'basic' | 'premium' | 'enterprise';
  benefits: string[];
  limits: {
    dailyIdeas: number;
    monthlyIdeas: number;
    advancedFeatures: boolean;
    prioritySupport: boolean;
    customization: boolean;
  };
  nextTier?: {
    name: string;
    benefits: string[];
    upgradePrice: number;
  };
}

export interface CostSummary {
  dailyCost: number;
  weeklyCost: number;
  monthlyCost: number;
  budgetStatus: BudgetStatus;
  tierInfo: TierInfo;
  recentTransactions: {
    id: string;
    type: string;
    cost: number;
    timestamp: string;
    description: string;
  }[];
  projectedCosts: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

export interface UsageMetrics {
  ideasGenerated: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  averageCostPerIdea: number;
  costEfficiency: 'excellent' | 'good' | 'average' | 'poor';
  peakUsageTimes: string[];
  recommendations: {
    optimizations: string[];
    tierSuggestions: string[];
  };
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

// Create fallback services when container is not available
const createFallbackServices = () => {
  return {
    userRepository: null,
    analyticsService: null
  };
};

export const useBudgetManagement = (userId: string) => {
  const [costSummary, setCostSummary] = useState<CostSummary | null>(null);
  const [usageMetrics, setUsageMetrics] = useState<UsageMetrics | null>(null);
  const [alerts, setAlerts] = useState<{
    type: 'budget' | 'tier' | 'limit';
    level: 'info' | 'warning' | 'critical';
    message: string;
    action?: string;
  }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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
        userRepository: await container.resolveAsync('UserRepository'),
        analyticsService: await container.resolveAsync('AnalyticsService')
      };
    } catch (error) {
      // Fallback para serviços mock/default em caso de erro
      console.warn('Failed to resolve services, using fallbacks:', error);
      return createFallbackServices();
    }
  };
  
  // Load cost summary from API
  const loadCostSummary = useCallback(async () => {
    if (!userId || loading) return; // ✅ Evitar chamadas simultâneas
    
    setLoading(true);
    setError(null);
    
    try {
      const { userRepository } = await getServices();
      
      // Check if service is available
      if (!userRepository) {
        console.warn('UserRepository not available, using fallback');
        const fallbackSummary = {
          dailyCost: 0,
          budgetStatus: {
            dailyLimit: 1.67,
            weeklyLimit: 11.67,
            monthlyLimit: 50,
            percentage: 0,
            status: 'safe' as const,
            remaining: { daily: 1.67, weekly: 11.67, monthly: 50 }
          },
          tierInfo: {
            currentTier: 'free' as const,
            benefits: ['5 ideias/dia', 'Suporte básico'],
            limits: {
              dailyIdeas: 5,
              monthlyIdeas: 100,
              advancedFeatures: false,
              prioritySupport: false,
              customization: false
            }
          }
        };
        setCostSummary(fallbackSummary);
        return fallbackSummary;
      }
      
      const summary = await userRepository.getUserCostSummary(userId);
      
      // Use summary from API or create default fallback
      const finalSummary = summary || {
        dailyCost: 0,
        budgetStatus: {
          dailyLimit: 1.67,
          weeklyLimit: 11.67,
          monthlyLimit: 50,
          percentage: 0,
          status: 'safe' as const,
          remaining: { daily: 1.67, weekly: 11.67, monthly: 50 }
        },
        tierInfo: {
          currentTier: 'free' as const,
          benefits: ['5 ideias/dia', 'Suporte básico'],
          limits: {
            dailyIdeas: 5,
            monthlyIdeas: 100,
            advancedFeatures: false,
            prioritySupport: false,
            customization: false
          }
        }
      };
      
      setCostSummary(finalSummary);
      
      // Check for budget alerts
      const newAlerts: BudgetAlert[] = [];
      
      if (finalSummary.budgetStatus.status === 'warning') {
        newAlerts.push({
          id: 'budget-warning',
          type: 'warning',
          title: 'Orçamento em Alerta',
          message: `Você usou ${finalSummary.budgetStatus.percentage}% do seu orçamento diário.`,
          action: 'Veja detalhes',
          timestamp: new Date().toISOString()
        });
      }
      
      setAlerts(newAlerts);
      
      return finalSummary;

    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao carregar informações de custo.';
      setError(errorMessage);
      
      // Set default fallback on error to allow idea generation
      const fallbackSummary = {
        dailyCost: 0,
        budgetStatus: {
          dailyLimit: 1.67,
          weeklyLimit: 11.67,
          monthlyLimit: 50,
          percentage: 0,
          status: 'safe' as const,
          remaining: { daily: 1.67, weekly: 11.67, monthly: 50 }
        },
        tierInfo: {
          currentTier: 'free' as const,
          benefits: ['5 ideias/dia', 'Suporte básico'],
          limits: {
            dailyIdeas: 5,
            monthlyIdeas: 100,
            advancedFeatures: false,
            prioritySupport: false,
            customization: false
          }
        }
      };
      setCostSummary(fallbackSummary);
      
      // Track error (optional)
      try {
        const { analyticsService } = await getServices();
        if (analyticsService) {
          await analyticsService.track({
            userId,
            eventType: 'error_event',
            category: 'budget_management',
            action: 'cost_summary_error',
            metadata: { error: errorMessage }
          });
        }
      } catch (trackingError) {
        console.warn('Failed to track budget error:', trackingError);
      }
      
      return fallbackSummary;
      
    } finally {
      setLoading(false);
    }
  }, [userId]); // ✅ CORREÇÃO: Só depender do userId
  
  // Load usage metrics
  const loadUsageMetrics = useCallback(async () => {
    if (!userId || loading) return; // ✅ Evitar chamadas simultâneas
    
    try {
      const { userRepository, analyticsService } = await getServices();
      
      // Check if services are available
      if (!analyticsService) {
        console.warn('AnalyticsService not available, skipping usage metrics');
        return null;
      }
      
      // Get usage data from analytics
      const usageData = await analyticsService.query({
        timeRange: { start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), end: new Date() },
        filters: { userId: [userId], category: ['idea_generation'] },
        aggregations: [
          { field: 'value', operation: 'sum' },
          { field: 'cost', operation: 'sum' },
          { field: 'timestamp', operation: 'count' }
        ]
      });
      
      if (usageData.success) {
        const metrics: UsageMetrics = {
          ideasGenerated: {
            today: usageData.aggregations.today || 0,
            thisWeek: usageData.aggregations.thisWeek || 0,
            thisMonth: usageData.aggregations.thisMonth || 0
          },
          averageCostPerIdea: usageData.aggregations.avgCost || 0,
          costEfficiency: usageData.aggregations.efficiency || 'good',
          peakUsageTimes: usageData.aggregations.peakTimes || [],
          recommendations: {
            optimizations: generateOptimizationRecommendations(usageData),
            tierSuggestions: generateTierRecommendations(usageData, costSummary)
          }
        };
        
        setUsageMetrics(metrics);
        return metrics;
      }
      
      return null;
      
    } catch (err: any) {
      console.warn('Failed to load usage metrics:', err);
      return null;
    }
  }, [userId]); // ✅ CORREÇÃO: Só depender do userId
  
  // Check if user can generate idea (budget/tier limits)
  const canGenerateIdea = useCallback((): {
    allowed: boolean;
    reason?: string;
    suggestedAction?: string;
  } => {
    // Allow generation while loading for better UX
    if (!costSummary) {
      return { allowed: true, reason: 'Carregando informações de orçamento...' };
    }
    
    // Check budget limits
    if (costSummary.budgetStatus.status === 'exceeded') {
      return {
        allowed: false,
        reason: 'Limite de orçamento diário excedido.',
        suggestedAction: 'wait_or_upgrade'
      };
    }
    
    // Check tier limits
    const tierLimits = costSummary.tierInfo.limits;
    if (usageMetrics && usageMetrics.ideasGenerated.today >= tierLimits.dailyIdeas) {
      return {
        allowed: false,
        reason: `Limite de ${tierLimits.dailyIdeas} ideias diárias atingido.`,
        suggestedAction: 'upgrade_tier'
      };
    }
    
    // Check if approaching limits
    if (costSummary.budgetStatus.percentage >= 90) {
      return {
        allowed: true,
        reason: 'Próximo do limite de orçamento. Use com moderação.'
      };
    }
    
    return { allowed: true };
  }, [costSummary, usageMetrics]);
  
  // Track cost for idea generation
  const trackIdeaCost = useCallback(async (cost: number, metadata: any = {}) => {
    if (!userId) return;
    
    try {
      const { analyticsService } = await getServices();
      
      if (!analyticsService) {
        console.warn('AnalyticsService not available, skipping cost tracking');
        return;
      }
      
      // Track cost event
      await analyticsService.track({
        userId,
        eventType: 'business_metric',
        category: 'cost_tracking',
        action: 'idea_generated',
        value: cost,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          tier: costSummary?.tierInfo.currentTier || 'unknown'
        }
      });
      
      // Reload cost summary after tracking
      await loadCostSummary();
      
    } catch (error) {
      console.warn('Failed to track idea cost:', error);
    }
  }, [userId, costSummary, loadCostSummary]);
  
  // Get tier upgrade recommendations
  const getTierUpgradeInfo = useCallback(() => {
    if (!costSummary || !usageMetrics) return null;
    
    const currentTier = costSummary.tierInfo.currentTier;
    const dailyUsage = usageMetrics.ideasGenerated.today;
    const monthlyUsage = usageMetrics.ideasGenerated.thisMonth;
    const avgCost = usageMetrics.averageCostPerIdea;
    
    // Calculate potential savings with upgrade
    let recommendation = null;
    
    if (currentTier === 'free' && (dailyUsage > 3 || monthlyUsage > 50)) {
      recommendation = {
        suggested: 'basic',
        reasoning: 'Você está usando mais que o ideal para o plano gratuito.',
        savings: 'Até 40% de economia em ideias',
        benefits: ['15 ideias/dia', 'Suporte prioritário', 'Personalização básica']
      };
    } else if (currentTier === 'basic' && (dailyUsage > 10 || avgCost > 0.02)) {
      recommendation = {
        suggested: 'premium',
        reasoning: 'Seu uso justifica o plano premium.',
        savings: 'Até 60% de economia + features avançadas',
        benefits: ['50 ideias/dia', 'IA avançada', 'Personalização completa', 'Relatórios detalhados']
      };
    }
    
    return recommendation;
  }, [costSummary, usageMetrics]);
  
  // Dismiss alert
  const dismissAlert = useCallback((index: number) => {
    setAlerts(prev => prev.filter((_, i) => i !== index));
  }, []);
  
  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  // Auto-load data on mount and userId change
  useEffect(() => {
    if (userId) {
      loadCostSummary();
      loadUsageMetrics();
    }
  }, [userId]); // ✅ CORREÇÃO: Remover dependências circulares

  // Auto-refresh every 5 minutes (reduced frequency)
  useEffect(() => {
    if (!userId) return;
    
    const interval = setInterval(() => {
      // Only refresh if not currently loading to prevent conflicts
      if (!loading) {
        loadCostSummary();
      }
    }, 5 * 60 * 1000); // ✅ CORREÇÃO: 5 minutos ao invés de 1

    return () => clearInterval(interval);
  }, [userId]); // ✅ CORREÇÃO: Remover dependências circulares
  
  return {
    // State
    costSummary,
    usageMetrics,
    alerts,
    loading,
    error,
    
    // Computed values
    canGenerateIdea: canGenerateIdea(),
    tierUpgradeInfo: getTierUpgradeInfo(),
    
    // Actions
    loadCostSummary,
    loadUsageMetrics,
    trackIdeaCost,
    dismissAlert,
    clearError
  };
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateOptimizationRecommendations(usageData: any): string[] {
  const recommendations = [];
  
  if (usageData.aggregations.avgCost > 0.02) {
    recommendations.push('Considere usar ideias em horários de menor demanda');
  }
  
  if (usageData.aggregations.unusedIdeas > 5) {
    recommendations.push('Implemente mais ideias geradas para melhor ROI');
  }
  
  return recommendations;
}

function generateTierRecommendations(usageData: any, costSummary: any): string[] {
  const recommendations = [];
  
  if (costSummary?.tierInfo.currentTier === 'free' && usageData.aggregations.thisMonth > 30) {
    recommendations.push('Upgrade para Basic: economia de até 40%');
  }
  
  return recommendations;
}

export default useBudgetManagement; 