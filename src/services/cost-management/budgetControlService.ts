/**
 * 💰 BUDGET CONTROL SERVICE - ENHANCED COST MANAGEMENT
 * Advanced budget monitoring and control with automatic interventions
 * 
 * FEATURES:
 * - Real-time budget monitoring per user and globally
 * - Automatic tier-based budget controls
 * - Smart intervention system (rate limiting, service degradation)
 * - Budget forecasting and analytics
 * - Integration with Emergency Protocol Service
 * - Budget analytics and forecasting
 * - User notification and communication
 */

import CostManagementService from '../risk-management/costManagementService';
import { UsageTierService, UserTier } from '../risk-management/usageTierService';
import EmergencyProtocolService from '../risk-management/emergencyProtocolService';

// Budget Configuration Types
export interface BudgetConfig {
  daily: number;
  monthly: number;
  emergency: number;
  warningThresholds: {
    yellow: number;    // 80% budget
    orange: number;    // 100% budget
    red: number;       // 180% emergency
  };
}

export interface UserBudgetLimits {
  tier: UserTier;
  dailyLimit: number;
  monthlyLimit: number;
  currentSpending: {
    daily: number;
    monthly: number;
    lastUpdate: Date;
  };
  overage: {
    allowed: boolean;
    maxOverage: number;
    currentOverage: number;
  };
}

export interface BudgetAlert {
  id: string;
  userId: string;
  type: 'warning' | 'limit' | 'emergency' | 'overage';
  threshold: number;
  currentSpending: number;
  budgetLimit: number;
  percentage: number;
  timestamp: Date;
  acknowledged: boolean;
}

export interface BudgetIntervention {
  id: string;
  type: 'rate_limit' | 'service_degradation' | 'circuit_breaker' | 'user_notification';
  severity: 'low' | 'medium' | 'high' | 'critical';
  reason: string;
  action: string;
  timestamp: Date;
  resolved: boolean;
  resolutionTime?: Date;
}

export interface BudgetForecast {
  daily: {
    projected: number;
    confidence: number;
    trend: 'increasing' | 'stable' | 'decreasing';
  };
  monthly: {
    projected: number;
    remainingBudget: number;
    daysRemaining: number;
    burnRate: number;
  };
  recommendations: string[];
}

export class BudgetControlService {
  private costManagement: CostManagementService;
  private usageTiers: UsageTierService;
  private emergencyProtocol: EmergencyProtocolService;
  
  // Global budget configuration
  private globalBudget: BudgetConfig = {
    daily: 1.67,     // $50/month ÷ 30 days
    monthly: 50.00,  // $50/month hard cap
    emergency: 3.00, // Emergency circuit breaker
    warningThresholds: {
      yellow: 0.80,  // 80% = $1.33/day or $40/month
      orange: 1.00,  // 100% = $1.67/day or $50/month
      red: 1.80      // 180% = $3.00/day emergency
    }
  };

  // Tier-specific budget allocations
  private tierBudgets: Record<UserTier, { daily: number; monthly: number; overage: number }> = {
    free: { daily: 0.50, monthly: 15.00, overage: 0.10 },      // 30% of global budget
    premium: { daily: 1.00, monthly: 30.00, overage: 0.20 },   // 60% of global budget  
    enterprise: { daily: 1.67, monthly: 50.00, overage: 0.50 } // 100% of global budget
  };

  // Storage keys
  private readonly STORAGE_KEY = 'roteirar_budget_control';
  private readonly ALERTS_KEY = 'roteirar_budget_alerts';
  private readonly INTERVENTIONS_KEY = 'roteirar_budget_interventions';

  constructor() {
    this.costManagement = new CostManagementService();
    this.usageTiers = new UsageTierService();
    this.emergencyProtocol = new EmergencyProtocolService();
    this.initializeBudgetMonitoring();
  }

  /**
   * Initialize budget monitoring system
   */
  private initializeBudgetMonitoring(): void {
    // Start real-time budget monitoring
    setInterval(() => {
      this.performBudgetCheck();
    }, 30000); // Check every 30 seconds

    // Daily budget reset at midnight
    this.scheduleDailyReset();
    
    // Monthly budget analysis
    this.scheduleMonthlyAnalysis();
  }

  /**
   * Get current budget status for user
   */
  public async getUserBudgetStatus(userId: string): Promise<UserBudgetLimits> {
    const userTier = await this.usageTiers.getUserTier(userId);
    const currentCosts = await this.costManagement.getUserCostSummary(userId);
    
    const tierBudget = this.tierBudgets[userTier.tier];
    
    return {
      tier: userTier.tier,
      dailyLimit: tierBudget.daily,
      monthlyLimit: tierBudget.monthly,
      currentSpending: {
        daily: currentCosts.today,
        monthly: currentCosts.thisMonth,
        lastUpdate: new Date()
      },
      overage: {
        allowed: userTier.tier !== 'free',
        maxOverage: tierBudget.overage,
        currentOverage: Math.max(0, currentCosts.today - tierBudget.daily)
      }
    };
  }

  /**
   * Check if user can proceed with operation based on budget
   */
  public async canUserProceed(userId: string, estimatedCost: number): Promise<{
    allowed: boolean;
    reason?: string;
    intervention?: BudgetIntervention;
    alternative?: string;
  }> {
    const budgetStatus = await this.getUserBudgetStatus(userId);
    const dailyRemaining = budgetStatus.dailyLimit - budgetStatus.currentSpending.daily;
    const monthlyRemaining = budgetStatus.monthlyLimit - budgetStatus.currentSpending.monthly;

    // Check daily budget
    if (estimatedCost > dailyRemaining) {
      // Check if overage is allowed
      if (budgetStatus.overage.allowed && 
          (budgetStatus.currentSpending.daily + estimatedCost) <= 
          (budgetStatus.dailyLimit + budgetStatus.overage.maxOverage)) {
        
        // Allow with overage warning
        await this.createBudgetAlert(userId, 'overage', 
          budgetStatus.currentSpending.daily + estimatedCost, budgetStatus.dailyLimit);
        
        return {
          allowed: true,
          reason: 'Overage allowed for premium/enterprise tier',
          alternative: 'Operating in overage mode - consider upgrading tier'
        };
      }

      // Budget exceeded - create intervention
      const intervention = await this.createBudgetIntervention(userId, 'rate_limit', 'high',
        `Daily budget exceeded: $${estimatedCost.toFixed(4)} requested, $${dailyRemaining.toFixed(4)} remaining`);

      return {
        allowed: false,
        reason: `Daily budget exceeded. Remaining: $${dailyRemaining.toFixed(4)}`,
        intervention,
        alternative: 'Upgrade tier or wait for daily reset'
      };
    }

    // Check monthly budget
    if (estimatedCost > monthlyRemaining) {
      const intervention = await this.createBudgetIntervention(userId, 'circuit_breaker', 'critical',
        `Monthly budget exceeded: $${estimatedCost.toFixed(4)} requested, $${monthlyRemaining.toFixed(4)} remaining`);

      return {
        allowed: false,
        reason: `Monthly budget exceeded. Remaining: $${monthlyRemaining.toFixed(4)}`,
        intervention,
        alternative: 'Upgrade tier or wait for monthly reset'
      };
    }

    return { allowed: true };
  }

  /**
   * Perform comprehensive budget check across all users
   */
  private async performBudgetCheck(): Promise<void> {
    const globalCosts = await this.costManagement.getGlobalCostSummary();
    
    // Check global daily budget
    if (globalCosts.today >= this.globalBudget.daily * this.globalBudget.warningThresholds.yellow) {
      await this.handleGlobalBudgetWarning(globalCosts.today);
    }

    // Check global emergency threshold
    if (globalCosts.today >= this.globalBudget.emergency) {
      await this.handleEmergencyBudgetBreach(globalCosts.today);
    }

    // Check individual user budgets
    await this.checkUserBudgets();
  }

  /**
   * Handle global budget warning
   */
  private async handleGlobalBudgetWarning(currentSpending: number): Promise<void> {
    const percentage = (currentSpending / this.globalBudget.daily) * 100;
    
    if (percentage >= 80 && percentage < 100) {
      // Yellow warning - increase monitoring
      this.adjustMonitoringFrequency('increased');
      await this.notifyAdmins('budget_warning', `Global budget at ${percentage.toFixed(1)}%`);
      
    } else if (percentage >= 100 && percentage < 180) {
      // Orange alert - implement rate limiting
      await this.implementGlobalRateLimiting('moderate');
      await this.notifyAdmins('budget_alert', `Global budget exceeded: ${percentage.toFixed(1)}%`);
      
    } else if (percentage >= 180) {
      // Red alert - emergency procedures
      await this.emergencyProtocol.triggerEmergency('cost_overrun', {
        currentSpending,
        budgetLimit: this.globalBudget.daily,
        percentage: percentage.toFixed(1)
      });
    }
  }

  /**
   * Handle emergency budget breach
   */
  private async handleEmergencyBudgetBreach(currentSpending: number): Promise<void> {
    // Immediate circuit breaker activation
    await this.emergencyProtocol.triggerEmergency('cost_overrun', {
      currentSpending,
      emergencyThreshold: this.globalBudget.emergency,
      action: 'circuit_breaker_activated'
    });

    // Stop all non-essential operations
    await this.implementGlobalRateLimiting('emergency');
    
    // Create critical intervention
    await this.createBudgetIntervention('global', 'circuit_breaker', 'critical',
      `Emergency budget breach: $${currentSpending.toFixed(4)} exceeds $${this.globalBudget.emergency} threshold`);
  }

  /**
   * Check individual user budgets
   */
  private async checkUserBudgets(): Promise<void> {
    // Get all active users (this would come from user management system)
    const activeUsers = await this.getActiveUsers();
    
    for (const userId of activeUsers) {
      const budgetStatus = await this.getUserBudgetStatus(userId);
      
      // Calculate budget percentage used
      const dailyPercentage = (budgetStatus.currentSpending.daily / budgetStatus.dailyLimit) * 100;
      const monthlyPercentage = (budgetStatus.currentSpending.monthly / budgetStatus.monthlyLimit) * 100;
      
      // Check for alerts
      if (dailyPercentage >= 80) {
        await this.createBudgetAlert(userId, 'warning', 
          budgetStatus.currentSpending.daily, budgetStatus.dailyLimit);
      }
      
      if (dailyPercentage >= 100) {
        await this.createBudgetAlert(userId, 'limit', 
          budgetStatus.currentSpending.daily, budgetStatus.dailyLimit);
      }
    }
  }

  /**
   * Create budget alert
   */
  private async createBudgetAlert(userId: string, type: BudgetAlert['type'], 
    currentSpending: number, budgetLimit: number): Promise<BudgetAlert> {
    
    const alert: BudgetAlert = {
      id: this.generateId(),
      userId,
      type,
      threshold: this.getThresholdForType(type),
      currentSpending,
      budgetLimit,
      percentage: (currentSpending / budgetLimit) * 100,
      timestamp: new Date(),
      acknowledged: false
    };

    // Store alert
    const alerts = this.getBudgetAlerts();
    alerts.push(alert);
    localStorage.setItem(this.ALERTS_KEY, JSON.stringify(alerts));

    // Notify user (integration with Beta's communication system)
    await this.notifyUser(userId, alert);

    return alert;
  }

  /**
   * Create budget intervention
   */
  private async createBudgetIntervention(userId: string, type: BudgetIntervention['type'],
    severity: BudgetIntervention['severity'], reason: string): Promise<BudgetIntervention> {
    
    const intervention: BudgetIntervention = {
      id: this.generateId(),
      type,
      severity,
      reason,
      action: this.getActionForIntervention(type),
      timestamp: new Date(),
      resolved: false
    };

    // Store intervention
    const interventions = this.getBudgetInterventions();
    interventions.push(intervention);
    localStorage.setItem(this.INTERVENTIONS_KEY, JSON.stringify(interventions));

    // Execute intervention
    await this.executeIntervention(intervention);

    return intervention;
  }

  /**
   * Generate budget forecast
   */
  public async generateBudgetForecast(): Promise<BudgetForecast> {
    const globalCosts = await this.costManagement.getGlobalCostSummary();
    const costHistory = await this.costManagement.getCostHistory(7); // 7 days
    
    // Calculate daily trend
    const dailyTrend = this.calculateTrend(costHistory.map(d => d.totalCost));
    const avgDailyCost = costHistory.reduce((sum, d) => sum + d.totalCost, 0) / costHistory.length;
    
    // Project monthly spending
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const daysPassed = new Date().getDate();
    const monthlyProjection = (globalCosts.thisMonth / daysPassed) * daysInMonth;
    
    return {
      daily: {
        projected: avgDailyCost * (1 + dailyTrend),
        confidence: this.calculateConfidence(costHistory),
        trend: dailyTrend > 0.1 ? 'increasing' : dailyTrend < -0.1 ? 'decreasing' : 'stable'
      },
      monthly: {
        projected: monthlyProjection,
        remainingBudget: this.globalBudget.monthly - globalCosts.thisMonth,
        daysRemaining: daysInMonth - daysPassed,
        burnRate: globalCosts.thisMonth / daysPassed
      },
      recommendations: this.generateRecommendations(monthlyProjection, globalCosts)
    };
  }

  /**
   * Get budget analytics
   */
  public async getBudgetAnalytics(): Promise<{
    current: any;
    forecast: BudgetForecast;
    alerts: BudgetAlert[];
    interventions: BudgetIntervention[];
    efficiency: {
      costPerUser: number;
      costPerIdea: number;
      tierDistribution: Record<UserTier, number>;
    };
  }> {
    const globalCosts = await this.costManagement.getGlobalCostSummary();
    const forecast = await this.generateBudgetForecast();
    const alerts = this.getBudgetAlerts().filter(a => !a.acknowledged);
    const interventions = this.getBudgetInterventions().filter(i => !i.resolved);
    
    return {
      current: globalCosts,
      forecast,
      alerts,
      interventions,
      efficiency: await this.calculateEfficiencyMetrics()
    };
  }

  // Helper methods
  private getActiveUsers(): Promise<string[]> {
    // This would integrate with user management system
    // For now, get from localStorage or mock data
    return Promise.resolve(['user1', 'user2', 'user3']);
  }

  private getBudgetAlerts(): BudgetAlert[] {
    const stored = localStorage.getItem(this.ALERTS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  private getBudgetInterventions(): BudgetIntervention[] {
    const stored = localStorage.getItem(this.INTERVENTIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  private generateId(): string {
    return `budget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getThresholdForType(type: BudgetAlert['type']): number {
    switch (type) {
      case 'warning': return this.globalBudget.warningThresholds.yellow;
      case 'limit': return this.globalBudget.warningThresholds.orange;
      case 'emergency': return this.globalBudget.warningThresholds.red;
      case 'overage': return 1.0;
      default: return 0.8;
    }
  }

  private getActionForIntervention(type: BudgetIntervention['type']): string {
    switch (type) {
      case 'rate_limit': return 'Reduce API call frequency';
      case 'service_degradation': return 'Limit features to essential only';
      case 'circuit_breaker': return 'Stop all non-critical operations';
      case 'user_notification': return 'Send budget alert to user';
      default: return 'Monitor situation';
    }
  }

  private async executeIntervention(intervention: BudgetIntervention): Promise<void> {
    switch (intervention.type) {
      case 'rate_limit':
        // Trigger rate limiting (will integrate with RateLimitingService)
        console.log('Implementing rate limiting due to budget concerns');
        break;
      case 'service_degradation':
        // Reduce service level
        await this.emergencyProtocol.degradeService('minimal');
        break;
      case 'circuit_breaker':
        // Stop services
        await this.emergencyProtocol.triggerEmergency('cost_overrun', { intervention });
        break;
      case 'user_notification':
        // Send notification (integrate with Beta's communication system)
        console.log('Sending budget notification to user');
        break;
    }
  }

  private async notifyUser(userId: string, alert: BudgetAlert): Promise<void> {
    // This will integrate with IA Beta's communication system
    console.log(`Budget alert for user ${userId}: ${alert.type} at ${alert.percentage.toFixed(1)}%`);
  }

  private async notifyAdmins(type: string, message: string): Promise<void> {
    // Admin notification system
    console.log(`Admin alert [${type}]: ${message}`);
  }

  private adjustMonitoringFrequency(level: 'normal' | 'increased' | 'high'): void {
    // Adjust monitoring frequency based on budget status
    console.log(`Adjusting monitoring frequency to: ${level}`);
  }

  private async implementGlobalRateLimiting(level: 'moderate' | 'aggressive' | 'emergency'): Promise<void> {
    // This will integrate with RateLimitingService
    console.log(`Implementing global rate limiting: ${level}`);
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    const recent = values.slice(-3).reduce((sum, v) => sum + v, 0) / 3;
    const older = values.slice(0, -3).reduce((sum, v) => sum + v, 0) / Math.max(1, values.length - 3);
    return (recent - older) / older;
  }

  private calculateConfidence(history: any[]): number {
    // Simple confidence calculation based on data consistency
    if (history.length < 3) return 0.5;
    const variance = this.calculateVariance(history.map(h => h.totalCost));
    return Math.max(0.3, Math.min(0.95, 1 - (variance / 0.5)));
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length;
  }

  private generateRecommendations(projection: number, current: any): string[] {
    const recommendations = [];
    
    if (projection > this.globalBudget.monthly * 1.1) {
      recommendations.push('Consider implementing stricter rate limiting');
      recommendations.push('Review user tier distributions for optimization');
    }
    
    if (current.today > this.globalBudget.daily * 0.8) {
      recommendations.push('Monitor daily usage more closely');
      recommendations.push('Consider degrading non-essential features');
    }
    
    return recommendations;
  }

  private async calculateEfficiencyMetrics(): Promise<any> {
    // Calculate cost efficiency metrics
    return {
      costPerUser: 0.25, // Mock data - would calculate from real usage
      costPerIdea: 0.05,
      tierDistribution: {
        free: 0.7,
        premium: 0.25,
        enterprise: 0.05
      }
    };
  }

  private scheduleDailyReset(): void {
    // Schedule daily budget reset at midnight
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const msUntilMidnight = midnight.getTime() - now.getTime();
    
    setTimeout(() => {
      this.performDailyReset();
      setInterval(() => this.performDailyReset(), 24 * 60 * 60 * 1000);
    }, msUntilMidnight);
  }

  private scheduleMonthlyAnalysis(): void {
    // Schedule monthly analysis on the 1st of each month
    setInterval(() => {
      if (new Date().getDate() === 1) {
        this.performMonthlyAnalysis();
      }
    }, 24 * 60 * 60 * 1000);
  }

  private async performDailyReset(): Promise<void> {
    console.log('Performing daily budget reset');
    // Reset daily counters, clear resolved alerts, etc.
  }

  private async performMonthlyAnalysis(): Promise<void> {
    console.log('Performing monthly budget analysis');
    // Generate monthly reports, optimize budgets, etc.
  }
}

export default BudgetControlService; 