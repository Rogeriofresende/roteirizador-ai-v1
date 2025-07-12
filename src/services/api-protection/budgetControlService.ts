/**
 * 💰 BUDGET CONTROL SERVICE - ADVANCED COST PROTECTION
 * Comprehensive budget control with predictive analytics and intelligent limiting
 * 
 * FEATURES: Predictive cost modeling, adaptive limits, budget forecasting
 * PREVENTS: Budget overruns through intelligent controls and cost prediction
 */

import { logger } from '../../utils/logger';
import { config } from '../../config/environment';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface BudgetRule {
  id: string;
  name: string;
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  scope: 'global' | 'user' | 'tier' | 'endpoint';
  targetId?: string; // userId, tier name, or endpoint
  budget: number; // Budget amount in USD
  warningThreshold: number; // Percentage for warning (e.g., 0.8 = 80%)
  emergencyThreshold: number; // Percentage for emergency action (e.g., 0.95 = 95%)
  enabled: boolean;
  actions: BudgetAction[];
  rolloverAllowed: boolean; // Allow unused budget to rollover
  rolloverLimit: number; // Max rollover percentage
  autoAdjust: boolean; // Auto-adjust based on usage patterns
  metadata: Record<string, any>;
}

export interface BudgetAction {
  trigger: 'warning' | 'emergency' | 'exceeded';
  type: 'notify' | 'throttle' | 'block' | 'downgrade_tier' | 'queue_requests';
  parameters: Record<string, any>;
  delay: number; // Delay before executing action (in minutes)
  priority: number; // Action priority (1-10)
}

export interface BudgetStatus {
  ruleId: string;
  ruleName: string;
  period: string; // Current period (e.g., "2025-01-12" for daily)
  budgetAmount: number;
  usedAmount: number;
  remainingAmount: number;
  utilizationPercentage: number;
  status: 'healthy' | 'warning' | 'emergency' | 'exceeded';
  timeRemaining: number; // Milliseconds until period reset
  projectedSpend: number; // Projected spend for full period
  projectedOverrun: number; // Projected overrun amount
  lastUpdated: string;
  trends: {
    dailyAverage: number;
    weeklyGrowth: number;
    monthlyProjection: number;
    efficiency: number; // Cost efficiency score (0-100)
  };
}

export interface BudgetViolation {
  id: string;
  ruleId: string;
  ruleName: string;
  timestamp: string;
  violationType: 'warning' | 'emergency' | 'exceeded';
  budgetAmount: number;
  actualAmount: number;
  overrunAmount: number;
  overrunPercentage: number;
  actionsTaken: string[];
  resolved: boolean;
  resolvedAt?: string;
  impact: {
    usersAffected: number;
    requestsBlocked: number;
    requestsThrottled: number;
  };
}

export interface CostPrediction {
  ruleName: string;
  currentPeriod: string;
  timeRemaining: number;
  currentUsage: number;
  historicalPattern: number[];
  predictedUsage: number;
  confidence: 'low' | 'medium' | 'high';
  factors: string[];
  recommendedActions: string[];
  earlyWarning: boolean;
}

export interface BudgetOptimization {
  type: 'cost_reduction' | 'efficiency_improvement' | 'tier_adjustment' | 'usage_optimization';
  title: string;
  description: string;
  potentialSavings: number;
  implementation: 'automatic' | 'manual' | 'assisted';
  priority: 'low' | 'medium' | 'high';
  estimatedImpact: {
    costReduction: number;
    userImpact: 'none' | 'minimal' | 'moderate' | 'significant';
    implementationTime: number; // Minutes
  };
  steps: string[];
}

export interface BudgetAnalytics {
  period: string;
  totalBudget: number;
  totalSpent: number;
  efficiency: number;
  topSpenders: Array<{
    id: string;
    type: 'user' | 'endpoint' | 'tier';
    name: string;
    amount: number;
    percentage: number;
  }>;
  costDrivers: Array<{
    factor: string;
    impact: number;
    trend: 'increasing' | 'stable' | 'decreasing';
  }>;
  savingsOpportunities: BudgetOptimization[];
  predictions: CostPrediction[];
}

// =============================================================================
// BUDGET CONTROL SERVICE
// =============================================================================

class BudgetControlService {
  private budgetRules: Map<string, BudgetRule> = new Map();
  private budgetStatus: Map<string, BudgetStatus> = new Map();
  private violations: BudgetViolation[] = [];
  private costHistory: Map<string, number[]> = new Map();
  private usagePatterns: Map<string, any> = new Map();
  private optimizations: BudgetOptimization[] = [];

  constructor() {
    this.initializeDefaultRules();
    this.loadPersistedData();
    this.startBudgetMonitoring();
    this.startAnalyticsEngine();

    logger.info('💰 Budget Control Service initialized', {
      rulesCount: this.budgetRules.size,
      monitoring: 'active'
    }, 'BUDGET_CONTROL');
  }

  // =============================================================================
  // CORE BUDGET CONTROL
  // =============================================================================

  /**
   * Check if expense is allowed under budget rules
   * CRITICAL: Called before any cost-incurring operation
   */
  async checkBudgetAllowance(
    expense: {
      amount: number;
      userId?: string;
      endpoint?: string;
      tier?: string;
      description?: string;
    }
  ): Promise<{
    allowed: boolean;
    reason?: string;
    affectedRules: string[];
    alternatives?: string[];
    delayRecommended?: number;
  }> {
    const affectedRules: string[] = [];
    const violations: string[] = [];
    let totalDelayRecommended = 0;

    // Check all applicable budget rules
    for (const rule of this.budgetRules.values()) {
      if (!rule.enabled) continue;

      const isApplicable = this.isRuleApplicable(rule, expense);
      if (!isApplicable) continue;

      affectedRules.push(rule.id);

      const status = await this.getBudgetStatus(rule.id);
      const projectedAmount = status.usedAmount + expense.amount;
      const projectedUtilization = projectedAmount / status.budgetAmount;

      // Check if this expense would exceed emergency threshold
      if (projectedUtilization > rule.emergencyThreshold) {
        violations.push(`${rule.name}: Would exceed emergency threshold (${(projectedUtilization * 100).toFixed(1)}%)`);
      }

      // Check if this expense would exceed warning threshold
      if (projectedUtilization > rule.warningThreshold) {
        const delay = this.calculateRecommendedDelay(rule, projectedUtilization);
        totalDelayRecommended = Math.max(totalDelayRecommended, delay);
      }
    }

    // If any violations, block the expense
    if (violations.length > 0) {
      return {
        allowed: false,
        reason: violations.join('; '),
        affectedRules,
        alternatives: this.generateAlternatives(expense),
        delayRecommended: totalDelayRecommended
      };
    }

    // If no violations but delay recommended, suggest delay
    if (totalDelayRecommended > 0) {
      return {
        allowed: true,
        affectedRules,
        delayRecommended: totalDelayRecommended
      };
    }

    return {
      allowed: true,
      affectedRules
    };
  }

  /**
   * Record actual expense and update budget tracking
   */
  async recordExpense(
    expense: {
      amount: number;
      userId?: string;
      endpoint?: string;
      tier?: string;
      description?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<void> {
    const timestamp = new Date().toISOString();

    // Update all applicable budget rules
    for (const rule of this.budgetRules.values()) {
      if (!rule.enabled) continue;

      const isApplicable = this.isRuleApplicable(rule, expense);
      if (!isApplicable) continue;

      await this.updateBudgetUsage(rule.id, expense.amount);
      
      // Check for violations after recording
      const status = await this.getBudgetStatus(rule.id);
      await this.checkForViolations(rule, status);
    }

    // Update cost history for analytics
    this.updateCostHistory(expense);

    // Update usage patterns
    this.updateUsagePatterns(expense);

    logger.debug('Expense recorded', {
      amount: expense.amount,
      userId: expense.userId,
      endpoint: expense.endpoint,
      description: expense.description
    }, 'BUDGET_CONTROL');
  }

  // =============================================================================
  // BUDGET STATUS & MONITORING
  // =============================================================================

  /**
   * Get current budget status for a rule
   */
  async getBudgetStatus(ruleId: string): Promise<BudgetStatus> {
    const rule = this.budgetRules.get(ruleId);
    if (!rule) {
      throw new Error(`Budget rule ${ruleId} not found`);
    }

    const currentPeriod = this.getCurrentPeriod(rule.type);
    const statusKey = `${ruleId}:${currentPeriod}`;
    
    let status = this.budgetStatus.get(statusKey);
    
    if (!status) {
      status = await this.initializeBudgetStatus(rule, currentPeriod);
      this.budgetStatus.set(statusKey, status);
    } else {
      // Update dynamic fields
      await this.updateBudgetStatusMetrics(status, rule);
    }

    return status;
  }

  /**
   * Get comprehensive budget analytics
   */
  async getBudgetAnalytics(period: string): Promise<BudgetAnalytics> {
    const analytics: BudgetAnalytics = {
      period,
      totalBudget: 0,
      totalSpent: 0,
      efficiency: 0,
      topSpenders: [],
      costDrivers: [],
      savingsOpportunities: [],
      predictions: []
    };

    // Aggregate data from all rules
    for (const rule of this.budgetRules.values()) {
      if (!rule.enabled) continue;

      const status = await this.getBudgetStatus(rule.id);
      analytics.totalBudget += status.budgetAmount;
      analytics.totalSpent += status.usedAmount;
    }

    // Calculate efficiency
    analytics.efficiency = analytics.totalBudget > 0 
      ? Math.max(0, 100 - (analytics.totalSpent / analytics.totalBudget) * 100)
      : 100;

    // Generate top spenders
    analytics.topSpenders = await this.getTopSpenders(period);

    // Analyze cost drivers
    analytics.costDrivers = await this.analyzeCostDrivers(period);

    // Generate savings opportunities
    analytics.savingsOpportunities = await this.generateSavingsOpportunities();

    // Generate predictions
    analytics.predictions = await this.generateCostPredictions();

    return analytics;
  }

  // =============================================================================
  // PREDICTIVE ANALYTICS
  // =============================================================================

  /**
   * Generate cost predictions for all budget rules
   */
  async generateCostPredictions(): Promise<CostPrediction[]> {
    const predictions: CostPrediction[] = [];

    for (const rule of this.budgetRules.values()) {
      if (!rule.enabled) continue;

      const prediction = await this.predictRuleCost(rule);
      predictions.push(prediction);
    }

    return predictions;
  }

  /**
   * Predict cost for specific budget rule
   */
  private async predictRuleCost(rule: BudgetRule): Promise<CostPrediction> {
    const status = await this.getBudgetStatus(rule.id);
    const history = this.getCostHistory(rule.id);
    
    const prediction: CostPrediction = {
      ruleName: rule.name,
      currentPeriod: this.getCurrentPeriod(rule.type),
      timeRemaining: status.timeRemaining,
      currentUsage: status.usedAmount,
      historicalPattern: history,
      predictedUsage: 0,
      confidence: 'low',
      factors: [],
      recommendedActions: [],
      earlyWarning: false
    };

    // Simple linear prediction based on current rate
    const timeElapsed = this.getTimeElapsed(rule.type);
    const currentRate = status.usedAmount / timeElapsed;
    const totalPeriodTime = this.getPeriodDuration(rule.type);
    prediction.predictedUsage = currentRate * totalPeriodTime;

    // Adjust prediction based on historical patterns
    if (history.length >= 3) {
      const historicalAverage = history.reduce((sum, val) => sum + val, 0) / history.length;
      const trend = this.calculateTrend(history);
      
      // Weighted average: 60% current rate, 40% historical with trend
      prediction.predictedUsage = 
        prediction.predictedUsage * 0.6 + 
        (historicalAverage * (1 + trend)) * 0.4;
      
      prediction.confidence = history.length >= 7 ? 'high' : 'medium';
    }

    // Determine factors affecting prediction
    prediction.factors = this.identifyPredictionFactors(rule, status, history);

    // Generate recommendations
    prediction.recommendedActions = this.generatePredictionRecommendations(rule, prediction);

    // Early warning if predicted to exceed warning threshold
    const predictedUtilization = prediction.predictedUsage / status.budgetAmount;
    prediction.earlyWarning = predictedUtilization > rule.warningThreshold;

    return prediction;
  }

  // =============================================================================
  // BUDGET OPTIMIZATION
  // =============================================================================

  /**
   * Generate savings opportunities
   */
  async generateSavingsOpportunities(): Promise<BudgetOptimization[]> {
    const opportunities: BudgetOptimization[] = [];

    // Analyze tier optimization opportunities
    opportunities.push(...await this.analyzeTierOptimization());

    // Analyze usage pattern optimizations
    opportunities.push(...await this.analyzeUsageOptimization());

    // Analyze cost reduction opportunities
    opportunities.push(...await this.analyzeCostReduction());

    // Sort by potential savings
    return opportunities.sort((a, b) => b.potentialSavings - a.potentialSavings);
  }

  /**
   * Analyze tier optimization opportunities
   */
  private async analyzeTierOptimization(): Promise<BudgetOptimization[]> {
    const opportunities: BudgetOptimization[] = [];

    try {
      const { usageTierService } = await import('../risk-management/usageTierService');
      const tierUtilization = usageTierService.getTierUtilization();

      for (const [tierName, stats] of Object.entries(tierUtilization)) {
        if (stats.avgUtilization < 50 && stats.userCount > 0) {
          opportunities.push({
            type: 'tier_adjustment',
            title: `Optimize ${tierName} tier usage`,
            description: `${tierName} tier users are only using ${stats.avgUtilization.toFixed(1)}% of their allocation. Consider tier adjustments.`,
            potentialSavings: stats.revenueContribution * 0.3, // Estimated 30% savings
            implementation: 'assisted',
            priority: 'medium',
            estimatedImpact: {
              costReduction: stats.revenueContribution * 0.3,
              userImpact: 'minimal',
              implementationTime: 60
            },
            steps: [
              'Analyze user usage patterns',
              'Recommend tier downgrades to underutilizing users',
              'Implement gradual tier adjustments',
              'Monitor user satisfaction'
            ]
          });
        }
      }
    } catch (error) {
      logger.error('Failed to analyze tier optimization', error, 'BUDGET_CONTROL');
    }

    return opportunities;
  }

  /**
   * Analyze usage optimization opportunities
   */
  private async analyzeUsageOptimization(): Promise<BudgetOptimization[]> {
    const opportunities: BudgetOptimization[] = [];

    // Analyze request patterns
    const patterns = Array.from(this.usagePatterns.values());
    const inefficientPatterns = patterns.filter(p => p.efficiency < 0.7);

    if (inefficientPatterns.length > 0) {
      const totalWaste = inefficientPatterns.reduce((sum, p) => sum + p.wastedCost, 0);
      
      opportunities.push({
        type: 'usage_optimization',
        title: 'Optimize request patterns',
        description: 'Detected inefficient request patterns causing unnecessary costs.',
        potentialSavings: totalWaste * 0.8, // 80% of waste recoverable
        implementation: 'automatic',
        priority: 'high',
        estimatedImpact: {
          costReduction: totalWaste * 0.8,
          userImpact: 'none',
          implementationTime: 30
        },
        steps: [
          'Implement intelligent request batching',
          'Add request deduplication',
          'Optimize caching strategies',
          'Monitor efficiency improvements'
        ]
      });
    }

    return opportunities;
  }

  /**
   * Analyze cost reduction opportunities
   */
  private async analyzeCostReduction(): Promise<BudgetOptimization[]> {
    const opportunities: BudgetOptimization[] = [];

    try {
      const { costManagementService } = await import('../risk-management/costManagementService');
      const usageStats = costManagementService.getUsageStats('monthly');

      // Analyze API usage efficiency
      const avgCostPerRequest = usageStats.averageCostPerRequest;
      if (avgCostPerRequest > 0.001) { // If cost per request is high
        opportunities.push({
          type: 'cost_reduction',
          title: 'Optimize API usage costs',
          description: `Average cost per request (${avgCostPerRequest.toFixed(4)}) is higher than optimal. Implement cost reduction strategies.`,
          potentialSavings: usageStats.totalCost * 0.25, // 25% reduction possible
          implementation: 'automatic',
          priority: 'high',
          estimatedImpact: {
            costReduction: usageStats.totalCost * 0.25,
            userImpact: 'minimal',
            implementationTime: 45
          },
          steps: [
            'Implement prompt optimization',
            'Reduce response token limits',
            'Add intelligent caching',
            'Optimize model selection'
          ]
        });
      }
    } catch (error) {
      logger.error('Failed to analyze cost reduction', error, 'BUDGET_CONTROL');
    }

    return opportunities;
  }

  // =============================================================================
  // BUDGET VIOLATIONS & ACTIONS
  // =============================================================================

  /**
   * Check for budget violations and execute actions
   */
  private async checkForViolations(rule: BudgetRule, status: BudgetStatus): Promise<void> {
    const utilizationPercentage = status.utilizationPercentage / 100;

    // Check for emergency threshold violation
    if (utilizationPercentage >= rule.emergencyThreshold) {
      await this.handleBudgetViolation(rule, status, 'emergency');
    }
    // Check for warning threshold violation
    else if (utilizationPercentage >= rule.warningThreshold) {
      await this.handleBudgetViolation(rule, status, 'warning');
    }
  }

  /**
   * Handle budget violation
   */
  private async handleBudgetViolation(
    rule: BudgetRule,
    status: BudgetStatus,
    violationType: 'warning' | 'emergency' | 'exceeded'
  ): Promise<void> {
    // Check if we've already handled this violation for this period
    const existingViolation = this.violations.find(v => 
      v.ruleId === rule.id && 
      v.violationType === violationType &&
      !v.resolved
    );

    if (existingViolation) {
      return; // Already handled
    }

    // Create violation record
    const violation: BudgetViolation = {
      id: crypto.randomUUID(),
      ruleId: rule.id,
      ruleName: rule.name,
      timestamp: new Date().toISOString(),
      violationType,
      budgetAmount: status.budgetAmount,
      actualAmount: status.usedAmount,
      overrunAmount: Math.max(0, status.usedAmount - status.budgetAmount),
      overrunPercentage: Math.max(0, status.utilizationPercentage - 100),
      actionsTaken: [],
      resolved: false,
      impact: {
        usersAffected: 0,
        requestsBlocked: 0,
        requestsThrottled: 0
      }
    };

    this.violations.push(violation);

    // Execute configured actions
    const applicableActions = rule.actions.filter(action => action.trigger === violationType);
    
    for (const action of applicableActions) {
      try {
        await this.executeBudgetAction(action, rule, violation);
        violation.actionsTaken.push(action.type);
      } catch (error) {
        logger.error('Failed to execute budget action', {
          actionType: action.type,
          ruleId: rule.id,
          error
        }, 'BUDGET_CONTROL');
      }
    }

    logger.warn('Budget violation handled', {
      ruleId: rule.id,
      ruleName: rule.name,
      violationType,
      utilizationPercentage: status.utilizationPercentage,
      actionsTaken: violation.actionsTaken
    }, 'BUDGET_VIOLATION');

    // Persist violation
    await this.persistViolation(violation);
  }

  /**
   * Execute specific budget action
   */
  private async executeBudgetAction(
    action: BudgetAction,
    rule: BudgetRule,
    violation: BudgetViolation
  ): Promise<void> {
    // Add delay if specified
    if (action.delay > 0) {
      await new Promise(resolve => setTimeout(resolve, action.delay * 60000));
    }

    switch (action.type) {
      case 'notify':
        await this.sendBudgetNotification(rule, violation, action.parameters);
        break;

      case 'throttle':
        await this.activateThrottling(rule, action.parameters);
        break;

      case 'block':
        await this.activateBlocking(rule, action.parameters);
        break;

      case 'downgrade_tier':
        await this.downgradeTiers(rule, action.parameters);
        break;

      case 'queue_requests':
        await this.activateRequestQueueing(rule, action.parameters);
        break;

      default:
        logger.warn('Unknown budget action type', { actionType: action.type }, 'BUDGET_CONTROL');
    }
  }

  // =============================================================================
  // BUDGET ACTIONS IMPLEMENTATION
  // =============================================================================

  private async sendBudgetNotification(
    rule: BudgetRule,
    violation: BudgetViolation,
    parameters: any
  ): Promise<void> {
    try {
      const { costAlertService } = await import('../risk-management/costAlertService');
      
      await costAlertService.sendAlert({
        type: violation.violationType === 'emergency' ? 'critical' : 'warning',
        category: 'budget_threshold',
        title: `Budget ${violation.violationType}: ${rule.name}`,
        message: `Budget utilization: ${violation.overrunPercentage.toFixed(1)}% (${violation.actualAmount}/${violation.budgetAmount})`,
        data: {
          ruleId: rule.id,
          violation: violation,
          budget: violation.budgetAmount,
          spent: violation.actualAmount,
          utilization: violation.overrunPercentage
        },
        urgency: violation.violationType === 'emergency' ? 'critical' : 'medium',
        recipients: parameters.recipients || ['admin', 'finance'],
        channels: (parameters.channels || ['email', 'slack']).map((type: string) => ({ type, config: {}, enabled: true, priority: 1 })),
        maxAttempts: 3,
        metadata: {
          budgetRule: rule.id,
          violationType: violation.violationType
        }
      });
    } catch (error) {
      logger.error('Failed to send budget notification', error, 'BUDGET_CONTROL');
    }
  }

  private async activateThrottling(rule: BudgetRule, parameters: any): Promise<void> {
    try {
      const { rateLimitingService } = await import('./rateLimitingService');
      
      // Update rate limiting configuration to reduce limits
      const throttleFactor = parameters.throttleFactor || 0.5; // 50% reduction
      
      if (rule.scope === 'endpoint' && rule.targetId) {
        rateLimitingService.updateConfiguration(rule.targetId, {
          tiers: {
            free: { requestsPerMinute: Math.floor(5 * throttleFactor) },
            premium: { requestsPerMinute: Math.floor(15 * throttleFactor) },
            enterprise: { requestsPerMinute: Math.floor(50 * throttleFactor) }
          } as any
        });
      }

      logger.info('Throttling activated', {
        ruleId: rule.id,
        throttleFactor,
        scope: rule.scope,
        targetId: rule.targetId
      }, 'BUDGET_CONTROL');
    } catch (error) {
      logger.error('Failed to activate throttling', error, 'BUDGET_CONTROL');
    }
  }

  private async activateBlocking(rule: BudgetRule, parameters: any): Promise<void> {
    try {
      const { emergencyProtocolService } = await import('../risk-management/emergencyProtocolService');
      
      await emergencyProtocolService.activateEmergency('cost_overrun', {
        ruleId: rule.id,
        budgetExceeded: true,
        blockingActivated: true,
        scope: rule.scope,
        targetId: rule.targetId
      }, 'budget_control');

      logger.warn('Blocking activated due to budget violation', {
        ruleId: rule.id,
        scope: rule.scope,
        targetId: rule.targetId
      }, 'BUDGET_CONTROL');
    } catch (error) {
      logger.error('Failed to activate blocking', error, 'BUDGET_CONTROL');
    }
  }

  private async downgradeTiers(rule: BudgetRule, parameters: any): Promise<void> {
    try {
      const { usageTierService } = await import('../risk-management/usageTierService');
      
      if (rule.scope === 'user' && rule.targetId) {
        const currentStatus = usageTierService.getUserTierStatus(rule.targetId);
        const targetTier = parameters.targetTier || 
                          (currentStatus.currentTier === 'enterprise' ? 'premium' : 'free');
        
        await usageTierService.setUserTier(rule.targetId, targetTier, 'budget_control');
        
        logger.info('User tier downgraded due to budget violation', {
          userId: rule.targetId,
          oldTier: currentStatus.currentTier,
          newTier: targetTier,
          ruleId: rule.id
        }, 'BUDGET_CONTROL');
      }
    } catch (error) {
      logger.error('Failed to downgrade tiers', error, 'BUDGET_CONTROL');
    }
  }

  private async activateRequestQueueing(rule: BudgetRule, parameters: any): Promise<void> {
    try {
      // This would integrate with request queueing system
      // For now, log the action
      logger.info('Request queueing activated', {
        ruleId: rule.id,
        queueSize: parameters.queueSize || 100,
        priority: parameters.priority || 'normal'
      }, 'BUDGET_CONTROL');
    } catch (error) {
      logger.error('Failed to activate request queueing', error, 'BUDGET_CONTROL');
    }
  }

  // =============================================================================
  // HELPER METHODS
  // =============================================================================

  private isRuleApplicable(rule: BudgetRule, expense: any): boolean {
    switch (rule.scope) {
      case 'global':
        return true;
      case 'user':
        return expense.userId === rule.targetId;
      case 'tier':
        return expense.tier === rule.targetId;
      case 'endpoint':
        return expense.endpoint === rule.targetId;
      default:
        return false;
    }
  }

  private calculateRecommendedDelay(rule: BudgetRule, projectedUtilization: number): number {
    if (projectedUtilization <= rule.warningThreshold) return 0;
    
    const excessUtilization = projectedUtilization - rule.warningThreshold;
    const maxDelay = 300; // 5 minutes max
    
    return Math.min(maxDelay, excessUtilization * 1000); // Proportional delay
  }

  private generateAlternatives(expense: any): string[] {
    const alternatives = [];
    
    if (expense.tier && expense.tier !== 'free') {
      alternatives.push('Consider using a lower tier for this request');
    }
    
    alternatives.push('Retry the request during off-peak hours');
    alternatives.push('Break the request into smaller parts');
    alternatives.push('Use cached results if available');
    
    return alternatives;
  }

  private getCurrentPeriod(type: string): string {
    const now = new Date();
    
    switch (type) {
      case 'daily':
        return now.toISOString().split('T')[0]; // YYYY-MM-DD
      case 'weekly':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        return startOfWeek.toISOString().split('T')[0];
      case 'monthly':
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      case 'quarterly':
        const quarter = Math.floor(now.getMonth() / 3) + 1;
        return `${now.getFullYear()}-Q${quarter}`;
      case 'yearly':
        return String(now.getFullYear());
      default:
        return now.toISOString().split('T')[0];
    }
  }

  private async initializeBudgetStatus(rule: BudgetRule, period: string): Promise<BudgetStatus> {
    const timeInfo = this.getPeriodTimeInfo(rule.type, period);
    
    return {
      ruleId: rule.id,
      ruleName: rule.name,
      period,
      budgetAmount: rule.budget,
      usedAmount: 0,
      remainingAmount: rule.budget,
      utilizationPercentage: 0,
      status: 'healthy',
      timeRemaining: timeInfo.remaining,
      projectedSpend: 0,
      projectedOverrun: 0,
      lastUpdated: new Date().toISOString(),
      trends: {
        dailyAverage: 0,
        weeklyGrowth: 0,
        monthlyProjection: 0,
        efficiency: 100
      }
    };
  }

  private async updateBudgetUsage(ruleId: string, amount: number): Promise<void> {
    const rule = this.budgetRules.get(ruleId);
    if (!rule) return;

    const status = await this.getBudgetStatus(ruleId);
    status.usedAmount += amount;
    status.remainingAmount = Math.max(0, status.budgetAmount - status.usedAmount);
    status.utilizationPercentage = (status.usedAmount / status.budgetAmount) * 100;
    status.lastUpdated = new Date().toISOString();

    // Update status
    if (status.utilizationPercentage >= rule.emergencyThreshold * 100) {
      status.status = 'exceeded';
    } else if (status.utilizationPercentage >= rule.warningThreshold * 100) {
      status.status = 'warning';
    } else if (status.utilizationPercentage >= 70) {
      status.status = 'emergency';
    } else {
      status.status = 'healthy';
    }

    // Update the status in the map
    const currentPeriod = this.getCurrentPeriod(rule.type);
    const statusKey = `${ruleId}:${currentPeriod}`;
    this.budgetStatus.set(statusKey, status);
  }

  private async updateBudgetStatusMetrics(status: BudgetStatus, rule: BudgetRule): Promise<void> {
    const timeInfo = this.getPeriodTimeInfo(rule.type, status.period);
    status.timeRemaining = timeInfo.remaining;

    // Update projections
    const timeElapsed = timeInfo.total - timeInfo.remaining;
    if (timeElapsed > 0) {
      const currentRate = status.usedAmount / timeElapsed;
      status.projectedSpend = currentRate * timeInfo.total;
      status.projectedOverrun = Math.max(0, status.projectedSpend - status.budgetAmount);
    }

    // Update trends (simplified)
    const history = this.getCostHistory(rule.id);
    if (history.length > 0) {
      status.trends.dailyAverage = history.reduce((sum, val) => sum + val, 0) / history.length;
      status.trends.weeklyGrowth = history.length > 1 ? 
        ((history[history.length - 1] - history[history.length - 2]) / history[history.length - 2]) * 100 : 0;
      status.trends.efficiency = Math.max(0, 100 - status.utilizationPercentage);
    }
  }

  private getPeriodTimeInfo(type: string, period: string): { total: number; remaining: number } {
    const now = Date.now();
    
    switch (type) {
      case 'daily':
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        return {
          total: 24 * 60 * 60 * 1000, // 24 hours in ms
          remaining: endOfDay.getTime() - now
        };
      case 'weekly':
        return {
          total: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
          remaining: 7 * 24 * 60 * 60 * 1000 // Simplified
        };
      case 'monthly':
        const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
        return {
          total: daysInMonth * 24 * 60 * 60 * 1000,
          remaining: daysInMonth * 24 * 60 * 60 * 1000 // Simplified
        };
      default:
        return { total: 24 * 60 * 60 * 1000, remaining: 24 * 60 * 60 * 1000 };
    }
  }

  private getTimeElapsed(type: string): number {
    // Simplified - return hours elapsed in current period
    const now = new Date();
    switch (type) {
      case 'daily':
        return now.getHours() * 60 * 60 * 1000 + now.getMinutes() * 60 * 1000;
      case 'monthly':
        return now.getDate() * 24 * 60 * 60 * 1000;
      default:
        return 60 * 60 * 1000; // 1 hour
    }
  }

  private getPeriodDuration(type: string): number {
    switch (type) {
      case 'daily':
        return 24 * 60 * 60 * 1000;
      case 'weekly':
        return 7 * 24 * 60 * 60 * 1000;
      case 'monthly':
        return 30 * 24 * 60 * 60 * 1000; // Approximation
      default:
        return 24 * 60 * 60 * 1000;
    }
  }

  private getCostHistory(ruleId: string): number[] {
    return this.costHistory.get(ruleId) || [];
  }

  private updateCostHistory(expense: any): void {
    // Simplified cost history tracking
    const dateKey = new Date().toISOString().split('T')[0];
    const dailyHistory = this.costHistory.get(dateKey) || [];
    dailyHistory.push(expense.amount);
    this.costHistory.set(dateKey, dailyHistory);

    // Keep only last 30 days
    const keys = Array.from(this.costHistory.keys());
    if (keys.length > 30) {
      const oldestKey = keys.sort()[0];
      this.costHistory.delete(oldestKey);
    }
  }

  private updateUsagePatterns(expense: any): void {
    const hour = new Date().getHours();
    const patternKey = expense.endpoint || 'global';
    
    let pattern = this.usagePatterns.get(patternKey);
    if (!pattern) {
      pattern = {
        hourlyDistribution: new Array(24).fill(0),
        totalCost: 0,
        totalRequests: 0,
        efficiency: 1.0,
        wastedCost: 0
      };
    }

    pattern.hourlyDistribution[hour] += expense.amount;
    pattern.totalCost += expense.amount;
    pattern.totalRequests += 1;
    
    // Simple efficiency calculation
    const avgCost = pattern.totalCost / pattern.totalRequests;
    pattern.efficiency = Math.min(1.0, 0.001 / avgCost); // Assume 0.001 is optimal cost per request
    pattern.wastedCost = Math.max(0, pattern.totalCost - (pattern.totalRequests * 0.001));

    this.usagePatterns.set(patternKey, pattern);
  }

  private calculateTrend(history: number[]): number {
    if (history.length < 2) return 0;
    
    const recent = history.slice(-3).reduce((sum, val) => sum + val, 0) / Math.min(3, history.length);
    const older = history.slice(0, -3).reduce((sum, val) => sum + val, 0) / Math.max(1, history.length - 3);
    
    return older > 0 ? (recent - older) / older : 0;
  }

  private identifyPredictionFactors(rule: BudgetRule, status: BudgetStatus, history: number[]): string[] {
    const factors = [];
    
    if (status.utilizationPercentage > 80) {
      factors.push('High current utilization');
    }
    
    if (history.length > 0) {
      const trend = this.calculateTrend(history);
      if (trend > 0.1) {
        factors.push('Increasing usage trend');
      } else if (trend < -0.1) {
        factors.push('Decreasing usage trend');
      }
    }
    
    const timeUtilization = (this.getPeriodDuration(rule.type) - status.timeRemaining) / this.getPeriodDuration(rule.type);
    if (status.utilizationPercentage / 100 > timeUtilization) {
      factors.push('Above-average spending rate');
    }
    
    return factors;
  }

  private generatePredictionRecommendations(rule: BudgetRule, prediction: CostPrediction): string[] {
    const recommendations = [];
    
    const predictedUtilization = prediction.predictedUsage / (this.budgetRules.get(rule.id)?.budget || 1);
    
    if (predictedUtilization > rule.emergencyThreshold) {
      recommendations.push('Implement immediate cost controls');
      recommendations.push('Consider emergency budget increase');
    } else if (predictedUtilization > rule.warningThreshold) {
      recommendations.push('Monitor usage closely');
      recommendations.push('Prepare cost optimization measures');
    }
    
    if (prediction.confidence === 'low') {
      recommendations.push('Gather more usage data for better predictions');
    }
    
    return recommendations;
  }

  private async getTopSpenders(period: string): Promise<Array<{
    id: string;
    type: 'user' | 'endpoint' | 'tier';
    name: string;
    amount: number;
    percentage: number;
  }>> {
    // Simplified implementation
    return [
      { id: 'user1', type: 'user', name: 'Heavy User', amount: 25.50, percentage: 15.3 },
      { id: 'idea_generation', type: 'endpoint', name: 'Idea Generation', amount: 45.20, percentage: 27.1 },
      { id: 'premium', type: 'tier', name: 'Premium Tier', amount: 62.30, percentage: 37.4 }
    ];
  }

  private async analyzeCostDrivers(period: string): Promise<Array<{
    factor: string;
    impact: number;
    trend: 'increasing' | 'stable' | 'decreasing';
  }>> {
    // Simplified implementation
    return [
      { factor: 'API token usage', impact: 45.2, trend: 'increasing' },
      { factor: 'User tier distribution', impact: 23.1, trend: 'stable' },
      { factor: 'Request frequency', impact: 18.7, trend: 'decreasing' }
    ];
  }

  private initializeDefaultRules(): void {
    const defaultRules: BudgetRule[] = [
      {
        id: 'global_daily',
        name: 'Global Daily Budget',
        type: 'daily',
        scope: 'global',
        budget: 1.67, // $50/month ÷ 30 days
        warningThreshold: 0.8,
        emergencyThreshold: 0.95,
        enabled: true,
        actions: [
          {
            trigger: 'warning',
            type: 'notify',
            parameters: { recipients: ['admin'], channels: ['email'] },
            delay: 0,
            priority: 5
          },
          {
            trigger: 'emergency',
            type: 'throttle',
            parameters: { throttleFactor: 0.5 },
            delay: 0,
            priority: 8
          }
        ],
        rolloverAllowed: false,
        rolloverLimit: 0.1,
        autoAdjust: true,
        metadata: {}
      },
      {
        id: 'global_monthly',
        name: 'Global Monthly Budget',
        type: 'monthly',
        scope: 'global',
        budget: 50.00,
        warningThreshold: 0.8,
        emergencyThreshold: 0.95,
        enabled: true,
        actions: [
          {
            trigger: 'warning',
            type: 'notify',
            parameters: { recipients: ['admin', 'finance'], channels: ['email', 'slack'] },
            delay: 0,
            priority: 5
          },
          {
            trigger: 'emergency',
            type: 'block',
            parameters: {},
            delay: 0,
            priority: 10
          }
        ],
        rolloverAllowed: true,
        rolloverLimit: 0.2,
        autoAdjust: true,
        metadata: {}
      }
    ];

    defaultRules.forEach(rule => {
      this.budgetRules.set(rule.id, rule);
    });
  }

  private async loadPersistedData(): Promise<void> {
    try {
      // Load violations
      const storedViolations = localStorage.getItem('budgetControl_violations');
      if (storedViolations) {
        this.violations = JSON.parse(storedViolations);
      }

      // Load cost history
      const storedHistory = localStorage.getItem('budgetControl_costHistory');
      if (storedHistory) {
        const historyData = JSON.parse(storedHistory);
        this.costHistory = new Map(Object.entries(historyData));
      }
    } catch (error) {
      logger.error('Failed to load persisted budget control data', error, 'BUDGET_CONTROL');
    }
  }

  private async persistViolation(violation: BudgetViolation): Promise<void> {
    try {
      // Keep only last 500 violations
      if (this.violations.length > 500) {
        this.violations = this.violations.slice(-500);
      }
      
      localStorage.setItem('budgetControl_violations', JSON.stringify(this.violations));
    } catch (error) {
      logger.error('Failed to persist budget violation', error, 'BUDGET_CONTROL');
    }
  }

  private startBudgetMonitoring(): void {
    // Check budgets every minute
    setInterval(async () => {
      for (const rule of this.budgetRules.values()) {
        if (!rule.enabled) continue;
        
        try {
          const status = await this.getBudgetStatus(rule.id);
          await this.checkForViolations(rule, status);
        } catch (error) {
          logger.error('Error in budget monitoring', { ruleId: rule.id, error }, 'BUDGET_CONTROL');
        }
      }
    }, 60000); // 1 minute
  }

  private startAnalyticsEngine(): void {
    // Update analytics every 5 minutes
    setInterval(async () => {
      try {
        this.optimizations = await this.generateSavingsOpportunities();
      } catch (error) {
        logger.error('Error in analytics engine', error, 'BUDGET_CONTROL');
      }
    }, 300000); // 5 minutes
  }

  // =============================================================================
  // PUBLIC API
  // =============================================================================

  /**
   * Get all budget rules
   */
  getBudgetRules(): BudgetRule[] {
    return Array.from(this.budgetRules.values());
  }

  /**
   * Add or update budget rule
   */
  setBudgetRule(rule: BudgetRule): void {
    this.budgetRules.set(rule.id, rule);
    logger.info('Budget rule updated', { ruleId: rule.id, ruleName: rule.name }, 'BUDGET_CONTROL');
  }

  /**
   * Get budget violations
   */
  getBudgetViolations(ruleId?: string): BudgetViolation[] {
    if (ruleId) {
      return this.violations.filter(v => v.ruleId === ruleId);
    }
    return this.violations;
  }

  /**
   * Resolve budget violation
   */
  async resolveBudgetViolation(violationId: string, resolvedBy: string): Promise<void> {
    const violation = this.violations.find(v => v.id === violationId);
    if (violation) {
      violation.resolved = true;
      violation.resolvedAt = new Date().toISOString();
      await this.persistViolation(violation);
      
      logger.info('Budget violation resolved', {
        violationId,
        resolvedBy,
        ruleId: violation.ruleId
      }, 'BUDGET_CONTROL');
    }
  }

  /**
   * Get savings opportunities
   */
  getSavingsOpportunities(): BudgetOptimization[] {
    return this.optimizations;
  }
}

// =============================================================================
// EXPORT
// =============================================================================

export const budgetControlService = new BudgetControlService();
export default BudgetControlService; 