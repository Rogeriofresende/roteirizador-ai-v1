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
  const getServices = useCallback(() => {
    const app = getApplication();
    return {
      userRepository: app.getService('UserRepository'),
      analyticsService: app.getService('AnalyticsService')
    };
  }, []);
  
  // Load cost summary
  const loadCostSummary = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { userRepository } = getServices();
      
      const summary = await userRepository.getUserCostSummary(userId);
      
      if (summary) {
        setCostSummary(summary);
        
        // Check for budget alerts
        const newAlerts = [];
        
        if (summary.budgetStatus.percentage >= 90) {
          newAlerts.push({
            type: 'budget' as const,
            level: 'critical' as const,
            message: 'Você está próximo do limite de orçamento diário!',
            action: 'upgrade_tier'
          });
        } else if (summary.budgetStatus.percentage >= 75) {
          newAlerts.push({
            type: 'budget' as const,
            level: 'warning' as const,
            message: 'Você usou 75% do seu orçamento diário.',
            action: 'monitor_usage'
          });
        }
        
        // Check tier limits
        if (summary.tierInfo.currentTier === 'free' && summary.dailyCost > 0.50) {
          newAlerts.push({
            type: 'tier' as const,
            level: 'info' as const,
            message: 'Considere fazer upgrade para o plano Basic para mais ideias.',
            action: 'view_upgrade'
          });
        }
        
        setAlerts(newAlerts);
        
        return summary;
      }
      
      return null;
      
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao carregar informações de custo.';
      setError(errorMessage);
      
      // Track error
      const { analyticsService } = getServices();
      await analyticsService.track({
        userId,
        eventType: 'error_event',
        category: 'budget_management',
        action: 'cost_summary_error',
        metadata: { error: errorMessage }
      });
      
      return null;
      
    } finally {
      setLoading(false);
    }
  }, [userId, getServices]);
  
  // Load usage metrics
  const loadUsageMetrics = useCallback(async () => {
    if (!userId) return;
    
    try {
      const { userRepository, analyticsService } = getServices();
      
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
          costEfficiency: 
            usageData.aggregations.avgCost < 0.01 ? 'excellent' :
            usageData.aggregations.avgCost < 0.02 ? 'good' :
            usageData.aggregations.avgCost < 0.03 ? 'average' : 'poor',
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
      console.error('Error loading usage metrics:', err);
      return null;
    }
  }, [userId, getServices, costSummary]);
  
  // Check if user can generate idea (budget/tier limits)
  const canGenerateIdea = useCallback((): {
    allowed: boolean;
    reason?: string;
    suggestedAction?: string;
  } => {
    if (!costSummary) {
      return { allowed: false, reason: 'Carregando informações de orçamento...' };
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
      const { analyticsService } = getServices();
      
      // Track cost event
      await analyticsService.track({
        userId,
        eventType: 'business_metric',
        category: 'cost_tracking',
        action: 'idea_cost',
        value: cost,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          tier: costSummary?.tierInfo.currentTier
        }
      });
      
      // Reload cost summary to reflect new cost
      setTimeout(() => {
        loadCostSummary();
      }, 1000);
      
    } catch (err: any) {
      console.error('Error tracking idea cost:', err);
    }
  }, [userId, getServices, costSummary, loadCostSummary]);
  
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
  }, [userId, loadCostSummary, loadUsageMetrics]);
  
  // Auto-refresh every minute
  useEffect(() => {
    if (!userId) return;
    
    const interval = setInterval(() => {
      loadCostSummary();
    }, 60 * 1000); // 1 minute
    
    return () => clearInterval(interval);
  }, [userId, loadCostSummary]);
  
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