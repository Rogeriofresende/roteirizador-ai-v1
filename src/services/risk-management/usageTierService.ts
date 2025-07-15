/**
 * 👤 USAGE TIER SERVICE - USER TIER MANAGEMENT
 * Manages user tiers, limits, and upgrade recommendations
 * 
 * PREVENTS: Cost overrun through intelligent tier management
 * FEATURES: Dynamic tier limits, usage tracking, upgrade recommendations
 */

import { logger } from '../../utils/logger';
import { config } from '../../config/environment';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface UserTier {
  id: string;
  name: 'free' | 'premium' | 'enterprise';
  displayName: string;
  description: string;
  price: number; // Monthly price in USD
  limits: TierLimits;
  features: string[];
  priority: number; // Higher number = higher priority
  upgradeThreshold: number; // Usage percentage to suggest upgrade
}

export interface TierLimits {
  dailyIdeas: number;
  monthlyIdeas: number;
  dailyCost: number;
  monthlyCost: number;
  requestsPerMinute: number;
  requestsPerHour: number;
  advancedFeatures: boolean;
  prioritySupport: boolean;
  apiAccess: boolean;
  collaborators: number;
}

export interface UserTierStatus {
  userId: string;
  currentTier: 'free' | 'premium' | 'enterprise';
  since: string;
  usage: TierUsage;
  recommendations: TierRecommendation[];
  violations: TierViolation[];
  upgradeEligible: boolean;
  nextBillingDate?: string;
  subscriptionStatus?: 'active' | 'trial' | 'cancelled' | 'expired';
}

export interface TierUsage {
  period: 'daily' | 'monthly';
  ideas: {
    used: number;
    limit: number;
    percentage: number;
  };
  cost: {
    used: number;
    limit: number;
    percentage: number;
  };
  requests: {
    used: number;
    limit: number;
    percentage: number;
  };
  features: {
    [feature: string]: {
      used: number;
      limit?: number;
      allowed: boolean;
    };
  };
}

export interface TierRecommendation {
  id: string;
  type: 'upgrade' | 'downgrade' | 'feature_unlock' | 'usage_optimization';
  targetTier?: 'free' | 'premium' | 'enterprise';
  title: string;
  description: string;
  benefits: string[];
  urgency: 'low' | 'medium' | 'high';
  validUntil: string;
  metadata: Record<string, any>;
}

export interface TierViolation {
  id: string;
  type: 'limit_exceeded' | 'feature_restricted' | 'rate_limited';
  limit: string;
  current: number;
  threshold: number;
  timestamp: string;
  action: 'warning' | 'block' | 'throttle';
  resolved: boolean;
}

export interface TierAnalytics {
  userId: string;
  tier: string;
  usagePatterns: {
    peakHours: number[];
    dailyAverage: number;
    weeklyTrends: number[];
    monthlyGrowth: number;
  };
  costEfficiency: {
    costPerIdea: number;
    valueScore: number;
    recommendedTier: string;
    savings: number;
  };
  behaviorInsights: {
    powerUser: boolean;
    consistentUser: boolean;
    occasionalUser: boolean;
    riskOfChurn: number;
  };
}

// =============================================================================
// USAGE TIER SERVICE
// =============================================================================

class UsageTierService {
  private tiers: Map<string, UserTier> = new Map();
  private userTierStatus: Map<string, UserTierStatus> = new Map();
  private usageHistory: Map<string, any[]> = new Map();
  private violationHistory: TierViolation[] = [];

  constructor() {
    this.initializeTiers();
    this.loadUserData();
    this.startUsageTracking();
    
    logger.info('👤 Usage Tier Service initialized', {
      tiersCount: this.tiers.size,
      usersTracked: this.userTierStatus.size
    }, 'USAGE_TIER');
  }

  // =============================================================================
  // TIER MANAGEMENT
  // =============================================================================

  /**
   * Initialize default tier configurations
   */
  private initializeTiers(): void {
    const defaultTiers: UserTier[] = [
      {
        id: 'free',
        name: 'free',
        displayName: 'Free',
        description: 'Perfect for getting started with idea generation',
        price: 0,
        limits: {
          dailyIdeas: 5,
          monthlyIdeas: 150,
          dailyCost: 1.00,
          monthlyCost: 5.00,
          requestsPerMinute: 2,
          requestsPerHour: 60,
          advancedFeatures: false,
          prioritySupport: false,
          apiAccess: false,
          collaborators: 0
        },
        features: [
          'Basic idea generation',
          'Standard templates',
          'Community support',
          'Mobile app access'
        ],
        priority: 1,
        upgradeThreshold: 80 // Suggest upgrade at 80% usage
      },
      {
        id: 'premium',
        name: 'premium',
        displayName: 'Premium',
        description: 'For content creators who need more ideas and features',
        price: 19.99,
        limits: {
          dailyIdeas: 15,
          monthlyIdeas: 450,
          dailyCost: 3.00,
          monthlyCost: 20.00,
          requestsPerMinute: 5,
          requestsPerHour: 200,
          advancedFeatures: true,
          prioritySupport: true,
          apiAccess: false,
          collaborators: 3
        },
        features: [
          'Advanced idea generation',
          'Premium templates',
          'Personalization engine',
          'Priority support',
          'Analytics dashboard',
          'Team collaboration (3 members)',
          'Custom branding'
        ],
        priority: 2,
        upgradeThreshold: 85 // Suggest upgrade at 85% usage
      },
      {
        id: 'enterprise',
        name: 'enterprise',
        displayName: 'Enterprise',
        description: 'For agencies and large teams with unlimited needs',
        price: 99.99,
        limits: {
          dailyIdeas: 50,
          monthlyIdeas: 1500,
          dailyCost: 10.00,
          monthlyCost: 50.00,
          requestsPerMinute: 10,
          requestsPerHour: 500,
          advancedFeatures: true,
          prioritySupport: true,
          apiAccess: true,
          collaborators: -1 // Unlimited
        },
        features: [
          'Unlimited idea generation',
          'Custom AI models',
          'API access',
          'White-label solution',
          'Dedicated support',
          'Advanced analytics',
          'Unlimited team members',
          'Custom integrations',
          'SLA guarantee'
        ],
        priority: 3,
        upgradeThreshold: 90 // Suggest upgrade at 90% usage
      }
    ];

    defaultTiers.forEach(tier => {
      this.tiers.set(tier.id, tier);
    });
  }

  /**
   * Get tier configuration
   */
  getTier(tierName: string): UserTier | null {
    return this.tiers.get(tierName) || null;
  }

  /**
   * Get all available tiers
   */
  getAllTiers(): UserTier[] {
    return Array.from(this.tiers.values()).sort((a, b) => a.priority - b.priority);
  }

  // =============================================================================
  // USER TIER STATUS
  // =============================================================================

  /**
   * Get user's current tier status
   */
  getUserTierStatus(userId: string): UserTierStatus {
    let status = this.userTierStatus.get(userId);
    
    if (!status) {
      status = this.createDefaultUserTierStatus(userId);
      this.userTierStatus.set(userId, status);
    }

    // Update usage data in real-time
    status.usage = this.calculateCurrentUsage(userId);
    status.recommendations = this.generateRecommendations(userId, status);
    status.upgradeEligible = this.checkUpgradeEligibility(userId, status);

    return status;
  }

  /**
   * Set user tier (upgrade/downgrade)
   */
  async setUserTier(
    userId: string, 
    newTier: 'free' | 'premium' | 'enterprise',
    adminUserId?: string
  ): Promise<void> {
    const currentStatus = this.getUserTierStatus(userId);
    const oldTier = currentStatus.currentTier;
    
    if (oldTier === newTier) {
      logger.info('User tier unchanged', { userId, tier: newTier }, 'TIER_MANAGEMENT');
      return;
    }

    // Validate tier change
    const tierConfig = this.getTier(newTier);
    if (!tierConfig) {
      throw new Error(`Invalid tier: ${newTier}`);
    }

    // Update tier status
    currentStatus.currentTier = newTier;
    currentStatus.since = new Date().toISOString();
    currentStatus.subscriptionStatus = newTier === 'free' ? undefined : 'active';
    
    // Calculate next billing date for paid tiers
    if (newTier !== 'free') {
      const nextBilling = new Date();
      nextBilling.setMonth(nextBilling.getMonth() + 1);
      currentStatus.nextBillingDate = nextBilling.toISOString();
    }

    // Clear previous violations and recommendations
    currentStatus.violations = [];
    currentStatus.recommendations = [];

    this.userTierStatus.set(userId, currentStatus);
    await this.persistUserTierStatus(userId, currentStatus);

    // Log tier change
    logger.info('User tier changed', {
      userId,
      oldTier,
      newTier,
      changedBy: adminUserId || 'user',
      timestamp: new Date().toISOString()
    }, 'TIER_CHANGE');

    // Notify cost management service
    try {
      const { costManagementService } = await import('./costManagementService');
      await costManagementService.setUserTier(userId, newTier);
    } catch (error) {
      logger.error('Failed to update cost management service', error, 'TIER_INTEGRATION');
    }
  }

  // =============================================================================
  // USAGE TRACKING & LIMITS
  // =============================================================================

  /**
   * Check if user can perform action based on tier limits
   */
  async checkUsageLimit(
    userId: string, 
    action: 'idea_generation' | 'api_request' | 'feature_access',
    metadata?: Record<string, any>
  ): Promise<{
    allowed: boolean;
    reason?: string;
    limitType?: string;
    current?: number;
    limit?: number;
    suggestUpgrade?: boolean;
  }> {
    const status = this.getUserTierStatus(userId);
    const tier = this.getTier(status.currentTier);
    
    if (!tier) {
      return { allowed: false, reason: 'Invalid user tier' };
    }

    const now = new Date();
    const usage = status.usage;

    switch (action) {
      case 'idea_generation':
        // Check daily idea limit
        if (usage.ideas.used >= tier.limits.dailyIdeas) {
          await this.recordViolation(userId, {
            type: 'limit_exceeded',
            limit: 'dailyIdeas',
            current: usage.ideas.used,
            threshold: tier.limits.dailyIdeas,
            action: 'block'
          });

          const suggestUpgrade = usage.ideas.percentage >= tier.upgradeThreshold;
          
          return {
            allowed: false,
            reason: `Daily idea limit reached (${tier.limits.dailyIdeas})`,
            limitType: 'dailyIdeas',
            current: usage.ideas.used,
            limit: tier.limits.dailyIdeas,
            suggestUpgrade
          };
        }

        // Check rate limiting
        const recentRequests = this.getRecentRequests(userId, 60000); // Last minute
        if (recentRequests >= tier.limits.requestsPerMinute) {
          await this.recordViolation(userId, {
            type: 'rate_limited',
            limit: 'requestsPerMinute',
            current: recentRequests,
            threshold: tier.limits.requestsPerMinute,
            action: 'throttle'
          });

          return {
            allowed: false,
            reason: 'Rate limit exceeded. Please wait before making another request.',
            limitType: 'requestsPerMinute',
            current: recentRequests,
            limit: tier.limits.requestsPerMinute
          };
        }
        
        break;

      case 'feature_access':
        const feature = metadata?.feature;
        if (feature && !this.checkFeatureAccess(tier, feature)) {
          await this.recordViolation(userId, {
            type: 'feature_restricted',
            limit: feature,
            current: 0,
            threshold: 1,
            action: 'block'
          });

          return {
            allowed: false,
            reason: `Feature '${feature}' not available in ${tier.displayName} tier`,
            limitType: 'featureAccess',
            suggestUpgrade: true
          };
        }
        break;

      case 'api_request':
        if (!tier.limits.apiAccess) {
          return {
            allowed: false,
            reason: 'API access not available in current tier',
            limitType: 'apiAccess',
            suggestUpgrade: true
          };
        }
        break;
    }

    return { allowed: true };
  }

  /**
   * Track usage for analytics and recommendations
   */
  async trackUsage(
    userId: string,
    action: string,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    const timestamp = new Date().toISOString();
    const usage = {
      userId,
      action,
      timestamp,
      metadata
    };

    // Store usage data
    const userHistory = this.usageHistory.get(userId) || [];
    userHistory.push(usage);
    
    // Keep only last 1000 usage records per user
    if (userHistory.length > 1000) {
      userHistory.splice(0, userHistory.length - 1000);
    }
    
    this.usageHistory.set(userId, userHistory);

    // Update tier status with new usage
    const status = this.getUserTierStatus(userId);
    status.usage = this.calculateCurrentUsage(userId);

    // Check for upgrade recommendations
    await this.checkUpgradeRecommendations(userId, status);

    logger.debug('Usage tracked', {
      userId,
      action,
      metadata
    }, 'USAGE_TRACKING');
  }

  // =============================================================================
  // RECOMMENDATIONS ENGINE
  // =============================================================================

  /**
   * Generate tier recommendations for user
   */
  private generateRecommendations(userId: string, status: UserTierStatus): TierRecommendation[] {
    const recommendations: TierRecommendation[] = [];
    const tier = this.getTier(status.currentTier);
    
    if (!tier) return recommendations;

    const usage = status.usage;

    // Upgrade recommendation based on usage
    if (usage.ideas.percentage >= tier.upgradeThreshold) {
      const nextTier = this.getNextTier(status.currentTier);
      if (nextTier) {
        recommendations.push({
          id: crypto.randomUUID(),
          type: 'upgrade',
          targetTier: nextTier.name,
          title: `Upgrade to ${nextTier.displayName}`,
          description: `You're using ${usage.ideas.percentage.toFixed(1)}% of your ${tier.displayName} limits. Upgrade for more ideas and features.`,
          benefits: this.getUpgradeBenefits(tier, nextTier),
          urgency: usage.ideas.percentage >= 95 ? 'high' : usage.ideas.percentage >= 85 ? 'medium' : 'low',
          validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
          metadata: {
            currentUsage: usage.ideas.percentage,
            currentTier: tier.name,
            targetTier: nextTier.name,
            monthlySavings: this.calculatePotentialSavings(tier, nextTier, usage)
          }
        });
      }
    }

    // Feature unlock recommendations
    if (status.currentTier === 'free' && usage.ideas.percentage >= 50) {
      recommendations.push({
        id: crypto.randomUUID(),
        type: 'feature_unlock',
        targetTier: 'premium',
        title: 'Unlock Advanced Features',
        description: 'Get access to personalization, analytics, and premium templates.',
        benefits: [
          'Personalized idea suggestions',
          'Advanced analytics dashboard',
          'Premium content templates',
          'Priority customer support'
        ],
        urgency: 'medium',
        validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days
        metadata: {
          unlockedFeatures: ['personalization', 'analytics', 'premium_templates'],
          trialOffered: true
        }
      });
    }

    // Usage optimization recommendations
    if (usage.ideas.percentage < 30 && status.currentTier === 'premium') {
      recommendations.push({
        id: crypto.randomUUID(),
        type: 'usage_optimization',
        title: 'Optimize Your Usage',
        description: `You're only using ${usage.ideas.percentage.toFixed(1)}% of your Premium features. Here's how to get more value.`,
        benefits: [
          'Set up automated idea generation',
          'Use advanced personalization features',
          'Invite team members to collaborate',
          'Explore analytics insights'
        ],
        urgency: 'low',
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        metadata: {
          underutilizedFeatures: ['automation', 'team_collaboration', 'analytics'],
          optimizationTips: true
        }
      });
    }

    return recommendations;
  }

  /**
   * Check and create upgrade recommendations
   */
  private async checkUpgradeRecommendations(userId: string, status: UserTierStatus): Promise<void> {
    const tier = this.getTier(status.currentTier);
    if (!tier) return;

    const usage = status.usage;

    // Create upgrade recommendation if approaching limits
    if (usage.ideas.percentage >= tier.upgradeThreshold) {
      const existingUpgradeRec = status.recommendations.find(r => r.type === 'upgrade');
      
      if (!existingUpgradeRec) {
        const nextTier = this.getNextTier(status.currentTier);
        if (nextTier) {
          const recommendation: TierRecommendation = {
            id: crypto.randomUUID(),
            type: 'upgrade',
            targetTier: nextTier.name,
            title: `Consider upgrading to ${nextTier.displayName}`,
            description: `You're approaching your ${tier.displayName} limits. Upgrade for ${nextTier.limits.dailyIdeas} daily ideas and more features.`,
            benefits: this.getUpgradeBenefits(tier, nextTier),
            urgency: usage.ideas.percentage >= 95 ? 'high' : 'medium',
            validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            metadata: {
              triggeredByUsage: usage.ideas.percentage,
              currentLimits: tier.limits,
              newLimits: nextTier.limits
            }
          };

          status.recommendations.push(recommendation);
          
          logger.info('Upgrade recommendation created', {
            userId,
            currentTier: tier.name,
            targetTier: nextTier.name,
            usagePercentage: usage.ideas.percentage
          }, 'TIER_RECOMMENDATION');
        }
      }
    }
  }

  // =============================================================================
  // ANALYTICS & INSIGHTS
  // =============================================================================

  /**
   * Generate tier analytics for user
   */
  getTierAnalytics(userId: string): TierAnalytics {
    const status = this.getUserTierStatus(userId);
    const tier = this.getTier(status.currentTier);
    const history = this.usageHistory.get(userId) || [];

    if (!tier) {
      throw new Error(`Invalid tier for user ${userId}`);
    }

    // Calculate usage patterns
    const usagePatterns = this.calculateUsagePatterns(history);
    const costEfficiency = this.calculateCostEfficiency(userId, tier, history);
    const behaviorInsights = this.calculateBehaviorInsights(history);

    return {
      userId,
      tier: tier.name,
      usagePatterns,
      costEfficiency,
      behaviorInsights
    };
  }

  /**
   * Get tier utilization across all users
   */
  getTierUtilization(): Record<string, {
    userCount: number;
    avgUtilization: number;
    revenueContribution: number;
    conversionRate: number;
  }> {
    const tierStats: Record<string, any> = {};

    // Initialize stats for all tiers
    this.getAllTiers().forEach(tier => {
      tierStats[tier.name] = {
        userCount: 0,
        totalUtilization: 0,
        revenueContribution: 0,
        conversionRate: 0
      };
    });

    // Calculate stats from user data
    this.userTierStatus.forEach(status => {
      const tierName = status.currentTier;
      if (tierStats[tierName]) {
        tierStats[tierName].userCount++;
        tierStats[tierName].totalUtilization += status.usage.ideas.percentage;
        
        const tier = this.getTier(tierName);
        if (tier) {
          tierStats[tierName].revenueContribution += tier.price;
        }
      }
    });

    // Calculate averages and rates
    Object.keys(tierStats).forEach(tierName => {
      const stats = tierStats[tierName];
      if (stats.userCount > 0) {
        stats.avgUtilization = stats.totalUtilization / stats.userCount;
      }
      delete stats.totalUtilization; // Clean up intermediate value
    });

    return tierStats;
  }

  // =============================================================================
  // HELPER METHODS
  // =============================================================================

  private createDefaultUserTierStatus(userId: string): UserTierStatus {
    return {
      userId,
      currentTier: 'free',
      since: new Date().toISOString(),
      usage: this.calculateCurrentUsage(userId),
      recommendations: [],
      violations: [],
      upgradeEligible: false,
      subscriptionStatus: undefined
    };
  }

  private calculateCurrentUsage(userId: string): TierUsage {
    const status = this.userTierStatus.get(userId);
    const tier = this.getTier(status?.currentTier || 'free');
    const history = this.usageHistory.get(userId) || [];

    if (!tier) {
      return this.getDefaultUsage();
    }

    // Calculate daily usage
    const today = new Date().toDateString();
    const todayUsage = history.filter(h => 
      new Date(h.timestamp).toDateString() === today
    );

    const dailyIdeas = todayUsage.filter(h => h.action === 'idea_generation').length;
    const dailyRequests = todayUsage.length;

    // Calculate monthly usage
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const monthlyUsage = history.filter(h => {
      const date = new Date(h.timestamp);
      return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
    });

    const monthlyIdeas = monthlyUsage.filter(h => h.action === 'idea_generation').length;

    return {
      period: 'daily',
      ideas: {
        used: dailyIdeas,
        limit: tier.limits.dailyIdeas,
        percentage: tier.limits.dailyIdeas > 0 ? (dailyIdeas / tier.limits.dailyIdeas) * 100 : 0
      },
      cost: {
        used: 0, // This would be populated by cost management service
        limit: tier.limits.dailyCost,
        percentage: 0
      },
      requests: {
        used: dailyRequests,
        limit: tier.limits.requestsPerHour, // Using hourly limit for simplicity
        percentage: tier.limits.requestsPerHour > 0 ? (dailyRequests / tier.limits.requestsPerHour) * 100 : 0
      },
      features: this.calculateFeatureUsage(tier, todayUsage)
    };
  }

  private calculateFeatureUsage(tier: UserTier, usage: any[]): Record<string, any> {
    return {
      personalization: {
        used: usage.filter(h => h.action === 'personalization_request').length,
        allowed: tier.limits.advancedFeatures
      },
      analytics: {
        used: usage.filter(h => h.action === 'analytics_view').length,
        allowed: tier.limits.advancedFeatures
      },
      api: {
        used: usage.filter(h => h.action === 'api_request').length,
        allowed: tier.limits.apiAccess
      }
    };
  }

  private getDefaultUsage(): TierUsage {
    return {
      period: 'daily',
      ideas: { used: 0, limit: 5, percentage: 0 },
      cost: { used: 0, limit: 1, percentage: 0 },
      requests: { used: 0, limit: 60, percentage: 0 },
      features: {}
    };
  }

  private getNextTier(currentTier: string): UserTier | null {
    switch (currentTier) {
      case 'free': {
        return this.getTier('premium');
      }
      case 'premium': {
        return this.getTier('enterprise');
      }
      default:
        return null;
    }
  }

  private getUpgradeBenefits(currentTier: UserTier, nextTier: UserTier): string[] {
    const benefits = [];
    
    if (nextTier.limits.dailyIdeas > currentTier.limits.dailyIdeas) {
      benefits.push(`${nextTier.limits.dailyIdeas} daily ideas (vs ${currentTier.limits.dailyIdeas})`);
    }
    
    if (nextTier.limits.advancedFeatures && !currentTier.limits.advancedFeatures) {
      benefits.push('Advanced personalization features');
      benefits.push('Analytics dashboard');
    }
    
    if (nextTier.limits.prioritySupport && !currentTier.limits.prioritySupport) {
      benefits.push('Priority customer support');
    }
    
    if (nextTier.limits.apiAccess && !currentTier.limits.apiAccess) {
      benefits.push('API access for integrations');
    }

    return benefits;
  }

  private calculatePotentialSavings(currentTier: UserTier, nextTier: UserTier, usage: TierUsage): number {
    // This would calculate potential cost savings based on efficiency
    // For now, return a placeholder value
    return Math.max(0, currentTier.limits.monthlyCost - nextTier.limits.monthlyCost);
  }

  private checkFeatureAccess(tier: UserTier, feature: string): boolean {
    switch (feature) {
      case 'personalization':
      case 'analytics':
      case 'premium_templates': {
        return tier.limits.advancedFeatures;
      }
      case 'api_access': {
        return tier.limits.apiAccess;
      }
      case 'priority_support': {
        return tier.limits.prioritySupport;
      }
      case 'team_collaboration': {
        return tier.limits.collaborators > 0;
      }
      default:
        return true; // Basic features available to all
    }
  }

  private getRecentRequests(userId: string, timeWindowMs: number): number {
    const history = this.usageHistory.get(userId) || [];
    const cutoff = Date.now() - timeWindowMs;
    
    return history.filter(h => 
      new Date(h.timestamp).getTime() > cutoff
    ).length;
  }

  private async recordViolation(userId: string, violationData: Omit<TierViolation, 'id' | 'timestamp' | 'resolved'>): Promise<void> {
    const violation: TierViolation = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      resolved: false,
      ...violationData
    };

    // Add to user's violations
    const status = this.getUserTierStatus(userId);
    status.violations.push(violation);

    // Add to global violation history
    this.violationHistory.push(violation);

    // Keep only last 100 violations per user
    if (status.violations.length > 100) {
      status.violations = status.violations.slice(-100);
    }

    logger.warn('Tier violation recorded', {
      userId,
      violationType: violation.type,
      limit: violation.limit,
      current: violation.current,
      threshold: violation.threshold
    }, 'TIER_VIOLATION');
  }

  private checkUpgradeEligibility(userId: string, status: UserTierStatus): boolean {
    const tier = this.getTier(status.currentTier);
    if (!tier) return false;

    const usage = status.usage;
    
    // Eligible if using more than upgrade threshold
    return usage.ideas.percentage >= tier.upgradeThreshold;
  }

  private calculateUsagePatterns(history: any[]): any {
    // Implement usage pattern analysis
    return {
      peakHours: [9, 10, 14, 15, 16], // Example peak hours
      dailyAverage: history.length / 30, // Rough daily average
      weeklyTrends: [0, 1, 2, 3, 4, 5, 6].map(day => 
        history.filter(h => new Date(h.timestamp).getDay() === day).length
      ),
      monthlyGrowth: 5.2 // Example growth percentage
    };
  }

  private calculateCostEfficiency(userId: string, tier: UserTier, history: any[]): any {
    const ideasGenerated = history.filter(h => h.action === 'idea_generation').length;
    const costPerIdea = ideasGenerated > 0 ? tier.price / ideasGenerated : 0;
    
    return {
      costPerIdea,
      valueScore: Math.min(100, (ideasGenerated / tier.limits.monthlyIdeas) * 100),
      recommendedTier: tier.name,
      savings: 0
    };
  }

  private calculateBehaviorInsights(history: any[]): any {
    const recentActivity = history.filter(h => 
      new Date(h.timestamp).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000
    );

    return {
      powerUser: recentActivity.length > 100,
      consistentUser: recentActivity.length > 20 && recentActivity.length <= 100,
      occasionalUser: recentActivity.length <= 20,
      riskOfChurn: recentActivity.length < 5 ? 0.8 : 0.2
    };
  }

  private async loadUserData(): Promise<void> {
    try {
      const storedData = localStorage.getItem('usageTier_userStatus');
      if (storedData) {
        const userData = JSON.parse(storedData);
        userData.forEach((status: UserTierStatus) => {
          this.userTierStatus.set(status.userId, status);
        });
      }
    } catch (error) {
      logger.error('Failed to load user tier data', error, 'USAGE_TIER');
    }
  }

  private async persistUserTierStatus(userId: string, status: UserTierStatus): Promise<void> {
    try {
      const allStatus = Array.from(this.userTierStatus.values());
      localStorage.setItem('usageTier_userStatus', JSON.stringify(allStatus));
    } catch (error) {
      logger.error('Failed to persist user tier status', error, 'USAGE_TIER');
    }
  }

  private startUsageTracking(): void {
    // Periodic cleanup of old data
    setInterval(() => {
      this.cleanupOldData();
    }, 24 * 60 * 60 * 1000); // Daily cleanup
  }

  private cleanupOldData(): void {
    const cutoff = Date.now() - 90 * 24 * 60 * 60 * 1000; // 90 days
    
    // Clean up usage history
    this.usageHistory.forEach((history, userId) => {
      const filteredHistory = history.filter(h => 
        new Date(h.timestamp).getTime() > cutoff
      );
      this.usageHistory.set(userId, filteredHistory);
    });

    // Clean up violation history
    this.violationHistory = this.violationHistory.filter(v => 
      new Date(v.timestamp).getTime() > cutoff
    );

    logger.info('Old usage data cleaned up', {
      cutoffDate: new Date(cutoff).toISOString()
    }, 'USAGE_TIER');
  }
}

// =============================================================================
// EXPORT
// =============================================================================

export const usageTierService = new UsageTierService();
export { UsageTierService };
export default UsageTierService; 