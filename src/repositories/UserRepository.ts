/**
 * User Repository Implementation - Week 0 IA Alpha Days 4-5 Implementation
 * Data persistence layer for user management with tier, cost tracking, and migration support
 * Implements repository pattern with comprehensive user lifecycle management
 * 
 * Features:
 * - User CRUD operations with tier management
 * - Cost tracking and budget management
 * - Migration support and data preservation
 * - Analytics and usage tracking
 * - Query optimization and indexing
 * - Integration with service architecture
 */

import { IRepository } from '../architecture/ServiceArchitecture';
import { User, UserPreferences } from '../database/schema';

// Query interfaces
export interface UserQueryFilter {
  tier?: 'free' | 'premium' | 'enterprise';
  status?: 'active' | 'suspended' | 'migrating' | 'inactive';
  migrationStatus?: 'none' | 'pending' | 'in_progress' | 'completed';
  createdAfter?: Date;
  createdBefore?: Date;
  lastActiveAfter?: Date;
  lastActiveBefore?: Date;
  budgetExceeded?: boolean;
  costRange?: { min: number; max: number };
}

export interface UserQueryOptions {
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'lastLoginAt' | 'tier' | 'costTracking.dailyCost' | 'usage.lastActive';
  sortOrder?: 'asc' | 'desc';
  includePreferences?: boolean;
  includeUsageStats?: boolean;
}

export interface UserQueryResult {
  users: User[];
  total: number;
  hasMore: boolean;
  aggregations?: {
    tierDistribution: Record<string, number>;
    statusDistribution: Record<string, number>;
    averageCost: number;
    totalActiveUsers: number;
  };
}

export interface UserCostSummary {
  userId: string;
  dailyCost: number;
  monthlyCost: number;
  totalCost: number;
  budgetStatus: {
    dailyLimit: number;
    monthlyLimit: number;
    remainingDaily: number;
    remainingMonthly: number;
    percentage: number;
  };
  tierInfo: {
    currentTier: string;
    upgradeDate?: Date;
    benefits: string[];
    limits: any;
  };
}

export interface UserAnalytics {
  userId: string;
  engagement: {
    ideasGenerated: number;
    averageRating: number;
    implementationRate: number;
    lastActiveDate: Date;
    streakDays: number;
  };
  costs: {
    totalSpent: number;
    averageCostPerIdea: number;
    monthlySpending: number;
    costEfficiency: number;
  };
  personalization: {
    learningLevel: string;
    preferenceCategories: string[];
    personalizationScore: number;
    satisfactionScore: number;
  };
  referrals: {
    referralsMade: number;
    referralsSuccessful: number;
    pointsEarned: number;
    tier: string;
  };
}

export class UserRepository implements IRepository<User> {
  private storage: Map<string, User> = new Map(); // Mock storage - would be database
  private preferencesStorage: Map<string, UserPreferences> = new Map();
  private analytics: Map<string, UserAnalytics> = new Map();
  
  // Cache for performance
  private cache: Map<string, { data: any; expiry: number }> = new Map();
  private readonly CACHE_TTL = 300000; // 5 minutes

  constructor() {
    this.initializeMockData();
  }

  /**
   * Find user by ID with caching
   */
  public async findById(id: string): Promise<User | null> {
    // Check cache first
    const cached = this.getCachedData(`user_${id}`);
    if (cached) {
      return cached as User;
    }

    const user = this.storage.get(id) || null;
    
    if (user) {
      this.setCachedData(`user_${id}`, user);
    }
    
    return user;
  }

  /**
   * Find users with advanced filtering and pagination
   */
  public async findMany(filter: UserQueryFilter = {}, options: UserQueryOptions = {}): Promise<UserQueryResult> {
    const {
      limit = 50,
      offset = 0,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      includePreferences = false,
      includeUsageStats = false
    } = options;

    // Apply filters
    let filteredUsers = Array.from(this.storage.values());
    
    if (filter.tier) {
      filteredUsers = filteredUsers.filter(user => user.tier === filter.tier);
    }
    
    if (filter.status) {
      filteredUsers = filteredUsers.filter(user => user.status === filter.status);
    }
    
    if (filter.migrationStatus) {
      filteredUsers = filteredUsers.filter(user => user.migration.status === filter.migrationStatus);
    }
    
    if (filter.createdAfter) {
      filteredUsers = filteredUsers.filter(user => user.createdAt >= filter.createdAfter!);
    }
    
    if (filter.createdBefore) {
      filteredUsers = filteredUsers.filter(user => user.createdAt <= filter.createdBefore!);
    }
    
    if (filter.budgetExceeded) {
      filteredUsers = filteredUsers.filter(user => 
        user.costTracking.dailyCost > this.getDailyBudgetLimit(user.tier)
      );
    }
    
    if (filter.costRange) {
      filteredUsers = filteredUsers.filter(user => 
        user.costTracking.monthlyCost >= filter.costRange!.min &&
        user.costTracking.monthlyCost <= filter.costRange!.max
      );
    }

    // Apply sorting
    filteredUsers.sort((a, b) => {
      let valueA: any, valueB: any;
      
      switch (sortBy) {
        case 'createdAt':
          valueA = a.createdAt.getTime();
          valueB = b.createdAt.getTime();
          break;
        case 'lastLoginAt':
          valueA = a.lastLoginAt?.getTime() || 0;
          valueB = b.lastLoginAt?.getTime() || 0;
          break;
        case 'tier':
          const tierOrder = { free: 1, premium: 2, enterprise: 3 };
          valueA = tierOrder[a.tier];
          valueB = tierOrder[b.tier];
          break;
        case 'costTracking.dailyCost':
          valueA = a.costTracking.dailyCost;
          valueB = b.costTracking.dailyCost;
          break;
        case 'usage.lastActive':
          valueA = a.usage.lastActive.getTime();
          valueB = b.usage.lastActive.getTime();
          break;
        default:
          valueA = a.createdAt.getTime();
          valueB = b.createdAt.getTime();
      }
      
      return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
    });

    // Apply pagination
    const total = filteredUsers.length;
    const paginatedUsers = filteredUsers.slice(offset, offset + limit);
    
    // Enhance with additional data if requested
    if (includePreferences || includeUsageStats) {
      // Would enhance users with preferences and usage stats
      // For now, mock enhancement
    }

    // Calculate aggregations
    const aggregations = {
      tierDistribution: this.calculateTierDistribution(filteredUsers),
      statusDistribution: this.calculateStatusDistribution(filteredUsers),
      averageCost: this.calculateAverageCost(filteredUsers),
      totalActiveUsers: filteredUsers.filter(u => u.status === 'active').length
    };

    return {
      users: paginatedUsers,
      total,
      hasMore: offset + limit < total,
      aggregations
    };
  }

  /**
   * Create new user with tier setup
   */
  public async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const user: User = {
      ...userData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      
      // Initialize tier info if not provided
      tierInfo: userData.tierInfo || {
        currentTier: userData.tier || 'free',
        autoRenew: false,
        paymentStatus: 'active'
      },
      
      // Initialize usage tracking
      usage: userData.usage || {
        ideasGenerated: 0,
        personalizations: 0,
        referrals: 0,
        lastActive: new Date(),
        monthlyReset: new Date(),
        streakDays: 0
      },
      
      // Initialize cost tracking
      costTracking: userData.costTracking || {
        totalCost: 0,
        dailyCost: 0,
        monthlyCost: 0,
        lastCostUpdate: new Date(),
        budgetAlerts: true,
        costEfficiency: 0
      },
      
      // Initialize migration support
      migration: userData.migration || {
        status: 'none',
        dataPreserved: true,
        experienceMode: 'new'
      }
    };

    this.storage.set(user.id, user);
    
    // Initialize analytics
    this.analytics.set(user.id, this.initializeUserAnalytics(user.id));
    
    // Clear cache
    this.clearUserCache(user.id);
    
    return user;
  }

  /**
   * Update user with cost tracking and tier management
   */
  public async update(id: string, updates: Partial<User>): Promise<User> {
    const existingUser = await this.findById(id);
    if (!existingUser) {
      throw new Error(`User with id ${id} not found`);
    }

    const updatedUser: User = {
      ...existingUser,
      ...updates,
      id, // Ensure ID doesn't change
      updatedAt: new Date()
    };

    // Handle tier changes
    if (updates.tier && updates.tier !== existingUser.tier) {
      updatedUser.tierInfo = {
        ...updatedUser.tierInfo,
        currentTier: updates.tier,
        upgradeDate: new Date()
      };
    }

    this.storage.set(id, updatedUser);
    
    // Clear cache
    this.clearUserCache(id);
    
    return updatedUser;
  }

  /**
   * Delete user with cleanup
   */
  public async delete(id: string): Promise<boolean> {
    const exists = this.storage.has(id);
    
    if (exists) {
      this.storage.delete(id);
      this.preferencesStorage.delete(id);
      this.analytics.delete(id);
      this.clearUserCache(id);
    }
    
    return exists;
  }

  /**
   * Update user cost tracking
   */
  public async updateCostTracking(userId: string, cost: number, operation: string): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    const updatedCostTracking = {
      ...user.costTracking,
      totalCost: user.costTracking.totalCost + cost,
      dailyCost: user.costTracking.dailyCost + cost,
      monthlyCost: user.costTracking.monthlyCost + cost,
      lastCostUpdate: new Date(),
      costEfficiency: this.calculateCostEfficiency(user, cost)
    };

    return this.update(userId, { costTracking: updatedCostTracking });
  }

  /**
   * Update user usage statistics
   */
  public async updateUsageStats(userId: string, operation: string, increment: number = 1): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    const updatedUsage = { ...user.usage, lastActive: new Date() };
    
    switch (operation) {
      case 'idea_generation':
        updatedUsage.ideasGenerated += increment;
        break;
      case 'personalization':
        updatedUsage.personalizations += increment;
        break;
      case 'referral':
        updatedUsage.referrals += increment;
        break;
    }

    // Update streak if user was active yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (user.usage.lastActive.toDateString() === yesterday.toDateString()) {
      updatedUsage.streakDays = user.usage.streakDays + 1;
    } else if (user.usage.lastActive.toDateString() !== new Date().toDateString()) {
      updatedUsage.streakDays = 1; // Reset streak
    }

    return this.update(userId, { usage: updatedUsage });
  }

  /**
   * Get user cost summary with budget analysis
   */
  public async getUserCostSummary(userId: string): Promise<UserCostSummary> {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    const dailyLimit = this.getDailyBudgetLimit(user.tier);
    const monthlyLimit = this.getMonthlyBudgetLimit(user.tier);

    return {
      userId,
      dailyCost: user.costTracking.dailyCost,
      monthlyCost: user.costTracking.monthlyCost,
      totalCost: user.costTracking.totalCost,
      budgetStatus: {
        dailyLimit,
        monthlyLimit,
        remainingDaily: Math.max(0, dailyLimit - user.costTracking.dailyCost),
        remainingMonthly: Math.max(0, monthlyLimit - user.costTracking.monthlyCost),
        percentage: (user.costTracking.dailyCost / dailyLimit) * 100
      },
      tierInfo: {
        currentTier: user.tier,
        upgradeDate: user.tierInfo.upgradeDate,
        benefits: this.getTierBenefits(user.tier),
        limits: this.getTierLimits(user.tier)
      }
    };
  }

  /**
   * Get comprehensive user analytics
   */
  public async getUserAnalytics(userId: string): Promise<UserAnalytics | null> {
    const analytics = this.analytics.get(userId);
    if (!analytics) {
      return null;
    }

    // Update with latest data
    const user = await this.findById(userId);
    if (user) {
      analytics.engagement.ideasGenerated = user.usage.ideasGenerated;
      analytics.engagement.lastActiveDate = user.usage.lastActive;
      analytics.engagement.streakDays = user.usage.streakDays;
      analytics.costs.totalSpent = user.costTracking.totalCost;
      analytics.costs.monthlySpending = user.costTracking.monthlyCost;
      analytics.costs.costEfficiency = user.costTracking.costEfficiency;
    }

    return analytics;
  }

  /**
   * Find users for migration
   */
  public async findUsersForMigration(batchSize: number = 100): Promise<User[]> {
    return this.findMany(
      { migrationStatus: 'none' },
      { limit: batchSize, sortBy: 'createdAt', sortOrder: 'asc' }
    ).then(result => result.users);
  }

  /**
   * Update migration status
   */
  public async updateMigrationStatus(
    userId: string, 
    status: 'none' | 'pending' | 'in_progress' | 'completed',
    preserveData: boolean = true
  ): Promise<User> {
    const migration = {
      status,
      startDate: status === 'in_progress' ? new Date() : undefined,
      completedDate: status === 'completed' ? new Date() : undefined,
      dataPreserved: preserveData,
      experienceMode: 'hybrid' as const
    };

    return this.update(userId, { migration });
  }

  /**
   * Get tier distribution analytics
   */
  public async getTierAnalytics(): Promise<{
    distribution: Record<string, number>;
    costs: Record<string, { total: number; average: number; users: number }>;
    upgrades: Array<{ from: string; to: string; count: number; revenue: number }>;
  }> {
    const allUsers = await this.findMany();
    
    const distribution = this.calculateTierDistribution(allUsers.users);
    const costs = this.calculateTierCosts(allUsers.users);
    const upgrades = this.calculateTierUpgrades(allUsers.users);

    return { distribution, costs, upgrades };
  }

  // Private helper methods
  private initializeMockData(): void {
    // Initialize with some mock users for development
    const mockUsers = [
      {
        email: 'user1@example.com',
        name: 'John Doe',
        tier: 'free' as const,
        status: 'active' as const
      },
      {
        email: 'user2@example.com', 
        name: 'Jane Smith',
        tier: 'premium' as const,
        status: 'active' as const
      }
    ];

    mockUsers.forEach(async (userData) => {
      await this.create(userData);
    });
  }

  private getCachedData(key: string): any {
    const cached = this.cache.get(key);
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + this.CACHE_TTL
    });
  }

  private clearUserCache(userId: string): void {
    this.cache.delete(`user_${userId}`);
    this.cache.delete(`analytics_${userId}`);
    this.cache.delete(`cost_summary_${userId}`);
  }

  private generateId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDailyBudgetLimit(tier: string): number {
    switch (tier) {
      case 'free': return 0.50;
      case 'premium': return 1.00;
      case 'enterprise': return 1.67;
      default: return 0.50;
    }
  }

  private getMonthlyBudgetLimit(tier: string): number {
    switch (tier) {
      case 'free': return 15.00;
      case 'premium': return 30.00;
      case 'enterprise': return 50.00;
      default: return 15.00;
    }
  }

  private getTierBenefits(tier: string): string[] {
    switch (tier) {
      case 'free': return ['5 ideas per day', 'Basic personalization'];
      case 'premium': return ['15 ideas per day', 'Advanced personalization', 'Priority support'];
      case 'enterprise': return ['50 ideas per day', 'Full personalization', 'Priority support', 'Analytics dashboard'];
      default: return [];
    }
  }

  private getTierLimits(tier: string): any {
    switch (tier) {
      case 'free': return { ideasPerDay: 5, personalizations: 10 };
      case 'premium': return { ideasPerDay: 15, personalizations: 50 };
      case 'enterprise': return { ideasPerDay: 50, personalizations: 200 };
      default: return { ideasPerDay: 5, personalizations: 10 };
    }
  }

  private calculateCostEfficiency(user: User, newCost: number): number {
    const totalIdeas = user.usage.ideasGenerated + 1;
    const totalCost = user.costTracking.totalCost + newCost;
    return totalCost / totalIdeas;
  }

  private initializeUserAnalytics(userId: string): UserAnalytics {
    return {
      userId,
      engagement: {
        ideasGenerated: 0,
        averageRating: 0,
        implementationRate: 0,
        lastActiveDate: new Date(),
        streakDays: 0
      },
      costs: {
        totalSpent: 0,
        averageCostPerIdea: 0,
        monthlySpending: 0,
        costEfficiency: 0
      },
      personalization: {
        learningLevel: 'basic',
        preferenceCategories: [],
        personalizationScore: 0,
        satisfactionScore: 0
      },
      referrals: {
        referralsMade: 0,
        referralsSuccessful: 0,
        pointsEarned: 0,
        tier: 'helper'
      }
    };
  }

  private calculateTierDistribution(users: User[]): Record<string, number> {
    const distribution = { free: 0, premium: 0, enterprise: 0 };
    users.forEach(user => distribution[user.tier]++);
    return distribution;
  }

  private calculateStatusDistribution(users: User[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    users.forEach(user => {
      distribution[user.status] = (distribution[user.status] || 0) + 1;
    });
    return distribution;
  }

  private calculateAverageCost(users: User[]): number {
    if (users.length === 0) return 0;
    const totalCost = users.reduce((sum, user) => sum + user.costTracking.monthlyCost, 0);
    return totalCost / users.length;
  }

  private calculateTierCosts(users: User[]): Record<string, { total: number; average: number; users: number }> {
    const costs: Record<string, { total: number; average: number; users: number }> = {};
    
    ['free', 'premium', 'enterprise'].forEach(tier => {
      const tierUsers = users.filter(u => u.tier === tier);
      const total = tierUsers.reduce((sum, u) => sum + u.costTracking.monthlyCost, 0);
      costs[tier] = {
        total,
        average: tierUsers.length > 0 ? total / tierUsers.length : 0,
        users: tierUsers.length
      };
    });
    
    return costs;
  }

  private calculateTierUpgrades(users: User[]): Array<{ from: string; to: string; count: number; revenue: number }> {
    // Mock implementation - would track actual upgrade history
    return [
      { from: 'free', to: 'premium', count: 5, revenue: 150 },
      { from: 'premium', to: 'enterprise', count: 2, revenue: 200 }
    ];
  }
}

export default UserRepository; 