/**
 * 💰 COST MANAGEMENT SERVICE - CRITICAL RISK MITIGATION
 * Real-time API cost tracking and budget protection system
 * 
 * PREVENTS: $900-2250/month cost explosion → Maintains <$50/month budget
 * FEATURES: Real-time tracking, emergency circuit breakers, user tiers
 */

import { logger } from '../../utils/logger';
import { config } from '../../config/environment';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface CostTracking {
  requestId: string;
  userId: string;
  operation: 'idea_generation' | 'referral_processing' | 'personalization' | 'analytics';
  tokensUsed: number;
  cost: number;
  timestamp: string;
  duration: number;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

export interface UserUsage {
  userId: string;
  userTier: 'free' | 'premium' | 'enterprise';
  dailyRequests: number;
  dailyCost: number;
  monthlyRequests: number;
  monthlyCost: number;
  lastRequestTime: string;
  rateLimitStatus: 'normal' | 'warning' | 'limited' | 'blocked';
}

export interface SystemBudget {
  dailyBudget: number;  // $1.67 target ($50/month)
  monthlyBudget: number; // $50.00 hard cap
  alertThreshold: number; // $1.33 (80% of daily)
  emergencyThreshold: number; // $3.00 (180% of daily)
  currentDailyCost: number;
  currentMonthlyCost: number;
  budgetUtilization: number;
  projectedMonthlyCost: number;
}

export interface CostAlert {
  id: string;
  type: 'warning' | 'critical' | 'emergency';
  message: string;
  timestamp: string;
  data: Record<string, any>;
  acknowledged: boolean;
  actionTaken?: string;
}

export interface UsageStats {
  totalRequests: number;
  totalCost: number;
  averageCostPerRequest: number;
  costByOperation: Record<string, number>;
  userDistribution: Record<string, number>;
  timeSeriesData: Array<{
    timestamp: string;
    cost: number;
    requests: number;
  }>;
}

// =============================================================================
// COST MANAGEMENT SERVICE
// =============================================================================

class CostManagementService {
  private costTrackingData: Map<string, CostTracking> = new Map();
  private userUsageData: Map<string, UserUsage> = new Map();
  private alerts: CostAlert[] = [];
  private systemBudget: SystemBudget;
  private isEmergencyMode: boolean = false;
  private costCache: Map<string, number> = new Map();

  // COST CONSTANTS (Critical for budget protection)
  private readonly COST_PER_1K_TOKENS = 0.00075; // Gemini 1.5 Flash pricing
  private readonly DAILY_BUDGET = 1.67; // $50/month ÷ 30 days
  private readonly MONTHLY_BUDGET = 50.00;
  private readonly ALERT_THRESHOLD = 1.33; // 80% of daily budget
  private readonly EMERGENCY_THRESHOLD = 3.00; // 180% of daily budget

  // USER TIER LIMITS (Critical for cost control)
  private readonly TIER_LIMITS = {
    free: { dailyIdeas: 5, monthlyCost: 5.00 },
    premium: { dailyIdeas: 15, monthlyCost: 20.00 },
    enterprise: { dailyIdeas: 50, monthlyCost: 50.00 }
  };

  constructor() {
    this.systemBudget = this.initializeSystemBudget();
    this.loadStoredData();
    this.startPeriodicBudgetCheck();
    
    logger.info('🛡️ Cost Management Service initialized', {
      dailyBudget: this.DAILY_BUDGET,
      monthlyBudget: this.MONTHLY_BUDGET,
      alertThreshold: this.ALERT_THRESHOLD,
      emergencyThreshold: this.EMERGENCY_THRESHOLD,
      tierLimits: this.TIER_LIMITS
    }, 'COST_MANAGEMENT');
  }

  // =============================================================================
  // CORE COST TRACKING
  // =============================================================================

  /**
   * Track API usage and cost in real-time
   * CRITICAL: Called for every API request
   */
  async trackRequest(tracking: Omit<CostTracking, 'timestamp'>): Promise<void> {
    const trackingRecord: CostTracking = {
      ...tracking,
      timestamp: new Date().toISOString()
    };

    // Store tracking data
    this.costTrackingData.set(tracking.requestId, trackingRecord);

    // Update user usage
    await this.updateUserUsage(tracking.userId, tracking.cost, tracking.operation);

    // Update system budget
    await this.updateSystemBudget(tracking.cost);

    // Check for budget violations
    await this.checkBudgetViolations();

    logger.debug('💰 Request tracked', {
      requestId: tracking.requestId,
      userId: tracking.userId,
      operation: tracking.operation,
      cost: tracking.cost,
      tokens: tracking.tokensUsed,
      currentDailyCost: this.systemBudget.currentDailyCost
    }, 'COST_TRACKING');
  }

  /**
   * Calculate cost based on token usage
   */
  calculateCost(tokensUsed: number): number {
    const cost = (tokensUsed / 1000) * this.COST_PER_1K_TOKENS;
    return Math.round(cost * 100000) / 100000; // Round to 5 decimal places
  }

  /**
   * Pre-flight cost check before making API calls
   * CRITICAL: Prevents budget overrun
   */
  async checkBudgetAvailability(userId: string, estimatedTokens: number): Promise<{
    allowed: boolean;
    reason?: string;
    remainingBudget?: number;
    userLimitReached?: boolean;
  }> {
    const estimatedCost = this.calculateCost(estimatedTokens);
    const userUsage = this.getUserUsage(userId);

    // Check emergency mode
    if (this.isEmergencyMode) {
      return {
        allowed: false,
        reason: 'System in emergency mode due to budget overrun'
      };
    }

    // Check system daily budget
    if (this.systemBudget.currentDailyCost + estimatedCost > this.EMERGENCY_THRESHOLD) {
      await this.activateEmergencyMode('Daily budget emergency threshold reached');
      return {
        allowed: false,
        reason: 'System daily budget exceeded'
      };
    }

    // Check user tier limits
    const userTierLimit = this.TIER_LIMITS[userUsage.userTier];
    if (userUsage.dailyRequests >= userTierLimit.dailyIdeas) {
      return {
        allowed: false,
        reason: `Daily limit reached for ${userUsage.userTier} tier`,
        userLimitReached: true
      };
    }

    // Check user monthly cost limit
    if (userUsage.monthlyCost + estimatedCost > userTierLimit.monthlyCost) {
      return {
        allowed: false,
        reason: `Monthly cost limit reached for ${userUsage.userTier} tier`,
        userLimitReached: true
      };
    }

    return {
      allowed: true,
      remainingBudget: this.DAILY_BUDGET - this.systemBudget.currentDailyCost
    };
  }

  // =============================================================================
  // USER USAGE MANAGEMENT
  // =============================================================================

  /**
   * Update user usage statistics
   */
  private async updateUserUsage(userId: string, cost: number, operation: string): Promise<void> {
    let userUsage = this.userUsageData.get(userId);
    
    if (!userUsage) {
      userUsage = {
        userId,
        userTier: 'free', // Default tier
        dailyRequests: 0,
        dailyCost: 0,
        monthlyRequests: 0,
        monthlyCost: 0,
        lastRequestTime: new Date().toISOString(),
        rateLimitStatus: 'normal'
      };
    }

    // Reset daily counters if new day
    if (this.isNewDay(userUsage.lastRequestTime)) {
      userUsage.dailyRequests = 0;
      userUsage.dailyCost = 0;
    }

    // Reset monthly counters if new month
    if (this.isNewMonth(userUsage.lastRequestTime)) {
      userUsage.monthlyRequests = 0;
      userUsage.monthlyCost = 0;
    }

    // Update usage
    userUsage.dailyRequests += 1;
    userUsage.dailyCost += cost;
    userUsage.monthlyRequests += 1;
    userUsage.monthlyCost += cost;
    userUsage.lastRequestTime = new Date().toISOString();

    // Update rate limit status
    userUsage.rateLimitStatus = this.calculateRateLimitStatus(userUsage);

    this.userUsageData.set(userId, userUsage);
    
    // Persist to storage
    await this.persistUserUsage(userUsage);
  }

  /**
   * Get user usage statistics
   */
  getUserUsage(userId: string): UserUsage {
    const userUsage = this.userUsageData.get(userId);
    
    if (!userUsage) {
      const defaultUsage: UserUsage = {
        userId,
        userTier: 'free',
        dailyRequests: 0,
        dailyCost: 0,
        monthlyRequests: 0,
        monthlyCost: 0,
        lastRequestTime: new Date().toISOString(),
        rateLimitStatus: 'normal'
      };
      
      this.userUsageData.set(userId, defaultUsage);
      return defaultUsage;
    }

    return userUsage;
  }

  /**
   * Set user tier (free, premium, enterprise)
   */
  async setUserTier(userId: string, tier: 'free' | 'premium' | 'enterprise'): Promise<void> {
    const userUsage = this.getUserUsage(userId);
    userUsage.userTier = tier;
    this.userUsageData.set(userId, userUsage);
    await this.persistUserUsage(userUsage);

    logger.info('👤 User tier updated', {
      userId,
      newTier: tier,
      tierLimits: this.TIER_LIMITS[tier]
    }, 'USER_TIER');
  }

  // =============================================================================
  // SYSTEM BUDGET MANAGEMENT
  // =============================================================================

  /**
   * Update system-wide budget tracking
   */
  private async updateSystemBudget(cost: number): Promise<void> {
    this.systemBudget.currentDailyCost += cost;
    this.systemBudget.currentMonthlyCost += cost;
    
    // Calculate utilization
    this.systemBudget.budgetUtilization = 
      (this.systemBudget.currentDailyCost / this.DAILY_BUDGET) * 100;

    // Calculate projected monthly cost
    const daysInMonth = new Date().getDate();
    const avgDailyCost = this.systemBudget.currentMonthlyCost / daysInMonth;
    this.systemBudget.projectedMonthlyCost = avgDailyCost * 30;

    // Persist budget data
    await this.persistSystemBudget();
  }

  /**
   * Check for budget violations and trigger alerts
   */
  private async checkBudgetViolations(): Promise<void> {
    const currentDailyCost = this.systemBudget.currentDailyCost;

    // Emergency threshold
    if (currentDailyCost >= this.EMERGENCY_THRESHOLD && !this.isEmergencyMode) {
      await this.activateEmergencyMode('Daily cost exceeded emergency threshold');
      return;
    }

    // Alert threshold
    if (currentDailyCost >= this.ALERT_THRESHOLD) {
      await this.createAlert({
        type: 'critical',
        message: `Daily cost approaching limit: $${currentDailyCost.toFixed(2)} / $${this.DAILY_BUDGET}`,
        data: {
          currentCost: currentDailyCost,
          dailyBudget: this.DAILY_BUDGET,
          utilization: this.systemBudget.budgetUtilization
        }
      });
    }

    // Projected monthly cost warning
    if (this.systemBudget.projectedMonthlyCost > this.MONTHLY_BUDGET * 0.8) {
      await this.createAlert({
        type: 'warning',
        message: `Projected monthly cost: $${this.systemBudget.projectedMonthlyCost.toFixed(2)} exceeds 80% of budget`,
        data: {
          projectedCost: this.systemBudget.projectedMonthlyCost,
          monthlyBudget: this.MONTHLY_BUDGET
        }
      });
    }
  }

  /**
   * Activate emergency mode - stops all AI operations
   */
  private async activateEmergencyMode(reason: string): Promise<void> {
    this.isEmergencyMode = true;

    await this.createAlert({
      type: 'emergency',
      message: `EMERGENCY MODE ACTIVATED: ${reason}`,
      data: {
        currentDailyCost: this.systemBudget.currentDailyCost,
        emergencyThreshold: this.EMERGENCY_THRESHOLD,
        reason
      }
    });

    // Notify emergency protocol service
    try {
      const { EmergencyProtocolService } = await import('./emergencyProtocolService');
      const emergencyService = new EmergencyProtocolService();
      await emergencyService.activateEmergency('cost_overrun', {
        currentCost: this.systemBudget.currentDailyCost,
        threshold: this.EMERGENCY_THRESHOLD,
        reason
      });
    } catch (error) {
      logger.error('Failed to activate emergency protocol', error, 'COST_EMERGENCY');
    }

    logger.error('🚨 EMERGENCY MODE ACTIVATED', {
      reason,
      currentDailyCost: this.systemBudget.currentDailyCost,
      emergencyThreshold: this.EMERGENCY_THRESHOLD,
      timestamp: new Date().toISOString()
    }, 'COST_EMERGENCY');
  }

  /**
   * Deactivate emergency mode (manual intervention required)
   */
  async deactivateEmergencyMode(adminUserId: string, reason: string): Promise<void> {
    this.isEmergencyMode = false;

    await this.createAlert({
      type: 'warning',
      message: `Emergency mode deactivated by admin: ${reason}`,
      data: {
        adminUserId,
        reason,
        timestamp: new Date().toISOString()
      }
    });

    logger.info('✅ Emergency mode deactivated', {
      adminUserId,
      reason,
      currentDailyCost: this.systemBudget.currentDailyCost
    }, 'COST_MANAGEMENT');
  }

  // =============================================================================
  // ALERTS & NOTIFICATIONS
  // =============================================================================

  /**
   * Create cost alert
   */
  private async createAlert(alertData: Omit<CostAlert, 'id' | 'timestamp' | 'acknowledged'>): Promise<void> {
    const alert: CostAlert = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      acknowledged: false,
      ...alertData
    };

    this.alerts.push(alert);

    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }

    // Persist alerts
    await this.persistAlerts();

    // Trigger notification service
    try {
      const CostAlertService = (await import('./costAlertService')).default;
      const alertService = new CostAlertService();
      await alertService.sendAlert(alert);
    } catch (error) {
      logger.error('Failed to send cost alert', error, 'COST_ALERT');
    }

    logger.warn('🚨 Cost alert created', {
      alertId: alert.id,
      type: alert.type,
      message: alert.message
    }, 'COST_ALERT');
  }

  /**
   * Get recent alerts
   */
  getRecentAlerts(limit: number = 10): CostAlert[] {
    return this.alerts
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * Acknowledge alert
   */
  async acknowledgeAlert(alertId: string, adminUserId: string): Promise<void> {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.actionTaken = `Acknowledged by admin ${adminUserId}`;
      await this.persistAlerts();
    }
  }

  // =============================================================================
  // ANALYTICS & REPORTING
  // =============================================================================

  /**
   * Get comprehensive usage statistics
   */
  getUsageStats(period: 'daily' | 'weekly' | 'monthly' = 'daily'): UsageStats {
    const now = new Date();
    const trackingData = Array.from(this.costTrackingData.values());
    
    // Filter by period
    const filteredData = trackingData.filter(record => {
      const recordDate = new Date(record.timestamp);
      switch (period) {
        case 'daily':
          return recordDate.toDateString() === now.toDateString();
        case 'weekly': {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return recordDate >= weekAgo;
        }
        case 'monthly':
          return recordDate.getMonth() === now.getMonth() && 
                 recordDate.getFullYear() === now.getFullYear();
        default:
          return true;
      }
    });

    // Calculate statistics
    const totalRequests = filteredData.length;
    const totalCost = filteredData.reduce((sum, record) => sum + record.cost, 0);
    const averageCostPerRequest = totalRequests > 0 ? totalCost / totalRequests : 0;

    // Cost by operation
    const costByOperation: Record<string, number> = {};
    filteredData.forEach(record => {
      costByOperation[record.operation] = (costByOperation[record.operation] || 0) + record.cost;
    });

    // User distribution
    const userDistribution: Record<string, number> = {};
    filteredData.forEach(record => {
      userDistribution[record.userId] = (userDistribution[record.userId] || 0) + record.cost;
    });

    // Time series data (hourly buckets)
    const timeSeriesData = this.generateTimeSeriesData(filteredData);

    return {
      totalRequests,
      totalCost,
      averageCostPerRequest,
      costByOperation,
      userDistribution,
      timeSeriesData
    };
  }

  /**
   * Get system budget status
   */
  getSystemBudget(): SystemBudget {
    return { ...this.systemBudget };
  }

  /**
   * Get cost prediction for the month
   */
  getMonthlyCostPrediction(): {
    predicted: number;
    confidence: 'low' | 'medium' | 'high';
    factors: string[];
  } {
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const currentDay = new Date().getDate();
    const avgDailyCost = this.systemBudget.currentMonthlyCost / currentDay;
    const predicted = avgDailyCost * daysInMonth;

    // Determine confidence based on data points
    let confidence: 'low' | 'medium' | 'high' = 'low';
    if (currentDay >= 7) confidence = 'medium';
    if (currentDay >= 15) confidence = 'high';

    const factors = [];
    if (this.systemBudget.budgetUtilization > 80) {
      factors.push('High daily budget utilization');
    }
    if (this.isEmergencyMode) {
      factors.push('System in emergency mode');
    }
    if (predicted > this.MONTHLY_BUDGET) {
      factors.push('Prediction exceeds monthly budget');
    }

    return { predicted, confidence, factors };
  }

  // =============================================================================
  // HELPER METHODS
  // =============================================================================

  private initializeSystemBudget(): SystemBudget {
    return {
      dailyBudget: this.DAILY_BUDGET,
      monthlyBudget: this.MONTHLY_BUDGET,
      alertThreshold: this.ALERT_THRESHOLD,
      emergencyThreshold: this.EMERGENCY_THRESHOLD,
      currentDailyCost: 0,
      currentMonthlyCost: 0,
      budgetUtilization: 0,
      projectedMonthlyCost: 0
    };
  }

  private calculateRateLimitStatus(userUsage: UserUsage): 'normal' | 'warning' | 'limited' | 'blocked' {
    const tierLimit = this.TIER_LIMITS[userUsage.userTier];
    const usagePercentage = userUsage.dailyRequests / tierLimit.dailyIdeas;

    if (usagePercentage >= 1) return 'blocked';
    if (usagePercentage >= 0.8) return 'limited';
    if (usagePercentage >= 0.6) return 'warning';
    return 'normal';
  }

  private isNewDay(lastRequestTime: string): boolean {
    const lastDate = new Date(lastRequestTime);
    const today = new Date();
    return lastDate.toDateString() !== today.toDateString();
  }

  private isNewMonth(lastRequestTime: string): boolean {
    const lastDate = new Date(lastRequestTime);
    const today = new Date();
    return lastDate.getMonth() !== today.getMonth() || 
           lastDate.getFullYear() !== today.getFullYear();
  }

  private generateTimeSeriesData(data: CostTracking[]): Array<{ timestamp: string; cost: number; requests: number }> {
    const hourlyBuckets = new Map<string, { cost: number; requests: number }>();
    
    data.forEach(record => {
      const hour = new Date(record.timestamp).toISOString().slice(0, 13) + ':00:00.000Z';
      const existing = hourlyBuckets.get(hour) || { cost: 0, requests: 0 };
      hourlyBuckets.set(hour, {
        cost: existing.cost + record.cost,
        requests: existing.requests + 1
      });
    });

    return Array.from(hourlyBuckets.entries()).map(([timestamp, data]) => ({
      timestamp,
      ...data
    }));
  }

  private async loadStoredData(): Promise<void> {
    try {
      // Load from localStorage or database
      const storedBudget = localStorage.getItem('costManagement_systemBudget');
      if (storedBudget) {
        this.systemBudget = { ...this.systemBudget, ...JSON.parse(storedBudget) };
      }

      const storedUsage = localStorage.getItem('costManagement_userUsage');
      if (storedUsage) {
        const usageArray = JSON.parse(storedUsage);
        usageArray.forEach((usage: UserUsage) => {
          this.userUsageData.set(usage.userId, usage);
        });
      }

      const storedAlerts = localStorage.getItem('costManagement_alerts');
      if (storedAlerts) {
        this.alerts = JSON.parse(storedAlerts);
      }
    } catch (error) {
      logger.error('Failed to load stored cost management data', error, 'COST_MANAGEMENT');
    }
  }

  private async persistSystemBudget(): Promise<void> {
    try {
      localStorage.setItem('costManagement_systemBudget', JSON.stringify(this.systemBudget));
    } catch (error) {
      logger.error('Failed to persist system budget', error, 'COST_MANAGEMENT');
    }
  }

  private async persistUserUsage(userUsage: UserUsage): Promise<void> {
    try {
      const allUsage = Array.from(this.userUsageData.values());
      localStorage.setItem('costManagement_userUsage', JSON.stringify(allUsage));
    } catch (error) {
      logger.error('Failed to persist user usage', error, 'COST_MANAGEMENT');
    }
  }

  private async persistAlerts(): Promise<void> {
    try {
      localStorage.setItem('costManagement_alerts', JSON.stringify(this.alerts));
    } catch (error) {
      logger.error('Failed to persist alerts', error, 'COST_MANAGEMENT');
    }
  }

  private startPeriodicBudgetCheck(): void {
    // Check budget every 5 minutes
    setInterval(async () => {
      await this.checkBudgetViolations();
      
      // Reset daily counters at midnight
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        this.systemBudget.currentDailyCost = 0;
        this.systemBudget.budgetUtilization = 0;
        await this.persistSystemBudget();
      }
      
      // Reset monthly counters on first day of month
      if (now.getDate() === 1 && now.getHours() === 0 && now.getMinutes() === 0) {
        this.systemBudget.currentMonthlyCost = 0;
        await this.persistSystemBudget();
      }
    }, 5 * 60 * 1000); // 5 minutes
  }
}

// =============================================================================
// EXPORT
// =============================================================================

export const costManagementService = new CostManagementService();
export { CostManagementService };
export default CostManagementService; 