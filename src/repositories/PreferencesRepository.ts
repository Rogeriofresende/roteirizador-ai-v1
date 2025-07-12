/**
 * Preferences Repository Implementation - Week 0 IA Alpha Days 4-5 Implementation
 * Data persistence layer for user preferences with versioning, learning tracking, and analytics
 * Supports PersonalizationService with comprehensive preference lifecycle management
 * 
 * Features:
 * - User preferences CRUD with versioning
 * - Learning system integration and progression tracking
 * - Preference analytics and insights
 * - A/B testing support for personalization strategies
 * - Migration support for preference data
 * - Integration with service architecture
 */

import { IRepository } from '../architecture/ServiceArchitecture';
import { UserPreferences } from '../database/schema';

// Query interfaces
export interface PreferencesQueryFilter {
  userId?: string;
  learningLevel?: 'basic' | 'behavioral' | 'contextual';
  lastUpdatedAfter?: Date;
  lastUpdatedBefore?: Date;
  hasPersonalizedRecommendations?: boolean;
  minDataPoints?: number;
  maxDataPoints?: number;
  confidenceRange?: { min: number; max: number };
}

export interface PreferencesQueryOptions {
  limit?: number;
  offset?: number;
  sortBy?: 'updatedAt' | 'learning.confidenceScore' | 'learning.dataPoints' | 'userId';
  sortOrder?: 'asc' | 'desc';
  includeHistory?: boolean;
  includeAnalytics?: boolean;
}

export interface PreferencesQueryResult {
  preferences: UserPreferences[];
  total: number;
  hasMore: boolean;
  aggregations?: {
    learningLevelDistribution: Record<string, number>;
    averageConfidenceScore: number;
    averageDataPoints: number;
    personalizedUsersCount: number;
  };
}

export interface PreferencesHistory {
  id: string;
  userId: string;
  version: number;
  preferences: UserPreferences;
  timestamp: Date;
  changedFields: string[];
  changeReason: string;
  migrationData?: {
    fromVersion: string;
    toVersion: string;
    preservedData: boolean;
  };
}

export interface PreferencesAnalytics {
  userId: string;
  learning: {
    currentLevel: 'basic' | 'behavioral' | 'contextual';
    progression: {
      startDate: Date;
      currentDataPoints: number;
      learningVelocity: number; // data points per day
      plateauDetected: boolean;
      nextLevelETA?: Date;
    };
    effectiveness: {
      accuracyScore: number;
      satisfactionScore: number;
      implementationRate: number;
      categoryAccuracy: Record<string, number>;
    };
  };
  engagement: {
    totalInteractions: number;
    lastInteractionDate: Date;
    averageSessionLength: number;
    preferenceStability: number; // how stable preferences are
  };
  personalization: {
    recommendationAccuracy: number;
    categoryDiversityScore: number;
    trendFollowingScore: number;
    riskToleranceScore: number;
  };
  abTesting?: {
    currentTests: Array<{
      testId: string;
      strategy: string;
      startDate: Date;
      metrics: Record<string, number>;
    }>;
    historicalResults: Array<{
      testId: string;
      winner: string;
      improvement: number;
      completedDate: Date;
    }>;
  };
}

export interface LearningProgressReport {
  userId: string;
  currentLevel: 'basic' | 'behavioral' | 'contextual';
  progress: {
    currentDataPoints: number;
    requiredForNext: number;
    progressPercentage: number;
    estimatedTimeToNext: number; // days
  };
  insights: {
    strongCategories: string[];
    weakCategories: string[];
    learningAcceleration: number;
    recommendedActions: string[];
  };
  comparison: {
    vsAverage: {
      dataPoints: number;
      confidence: number;
      satisfaction: number;
    };
    vsTarget: {
      onTrack: boolean;
      deviation: number;
      correctionNeeded: string[];
    };
  };
}

export interface PreferencesMigrationReport {
  userId: string;
  migrationStatus: {
    fromVersion: string;
    toVersion: string;
    started: Date;
    completed?: Date;
    success: boolean;
  };
  dataPreservation: {
    categoriesPreserved: string[];
    stylesPreserved: string[];
    interactionsPreserved: number;
    lossPercentage: number;
  };
  learningImpact: {
    levelMaintained: boolean;
    confidenceChange: number;
    dataPointsRetained: number;
    retrainingRequired: boolean;
  };
}

export class PreferencesRepository implements IRepository<UserPreferences> {
  private storage: Map<string, UserPreferences> = new Map(); // Mock storage - would be database
  private history: Map<string, PreferencesHistory[]> = new Map(); // userId -> history array
  private analytics: Map<string, PreferencesAnalytics> = new Map();
  private migrations: Map<string, PreferencesMigrationReport> = new Map();
  
  // Learning system tracking
  private learningMetrics: Map<string, {
    dailyDataPoints: Record<string, number>; // date -> count
    progressionHistory: Array<{ date: Date; level: string; confidence: number }>;
  }> = new Map();
  
  // Cache for performance
  private cache: Map<string, { data: any; expiry: number }> = new Map();
  private readonly CACHE_TTL = 300000; // 5 minutes

  constructor() {
    this.initializeMockData();
  }

  /**
   * Find preferences by user ID with caching
   */
  public async findByUserId(userId: string): Promise<UserPreferences | null> {
    // Check cache first
    const cached = this.getCachedData(`prefs_${userId}`);
    if (cached) {
      return cached as UserPreferences;
    }

    const preferences = this.storage.get(userId) || null;
    
    if (preferences) {
      this.setCachedData(`prefs_${userId}`, preferences);
    }
    
    return preferences;
  }

  /**
   * Find preferences by ID (using userId as ID)
   */
  public async findById(id: string): Promise<UserPreferences | null> {
    return this.findByUserId(id);
  }

  /**
   * Find preferences with advanced filtering
   */
  public async findMany(filter: PreferencesQueryFilter = {}, options: PreferencesQueryOptions = {}): Promise<PreferencesQueryResult> {
    const {
      limit = 50,
      offset = 0,
      sortBy = 'updatedAt',
      sortOrder = 'desc',
      includeHistory = false,
      includeAnalytics = false
    } = options;

    // Apply filters
    let filteredPreferences = Array.from(this.storage.values());
    
    if (filter.userId) {
      filteredPreferences = filteredPreferences.filter(prefs => prefs.userId === filter.userId);
    }
    
    if (filter.learningLevel) {
      filteredPreferences = filteredPreferences.filter(prefs => prefs.learning.level === filter.learningLevel);
    }
    
    if (filter.lastUpdatedAfter) {
      filteredPreferences = filteredPreferences.filter(prefs => prefs.updatedAt >= filter.lastUpdatedAfter!);
    }
    
    if (filter.lastUpdatedBefore) {
      filteredPreferences = filteredPreferences.filter(prefs => prefs.updatedAt <= filter.lastUpdatedBefore!);
    }
    
    if (filter.hasPersonalizedRecommendations !== undefined) {
      filteredPreferences = filteredPreferences.filter(prefs => 
        prefs.settings.personalizedRecommendations === filter.hasPersonalizedRecommendations
      );
    }
    
    if (filter.minDataPoints !== undefined) {
      filteredPreferences = filteredPreferences.filter(prefs => 
        prefs.learning.dataPoints >= filter.minDataPoints!
      );
    }
    
    if (filter.maxDataPoints !== undefined) {
      filteredPreferences = filteredPreferences.filter(prefs => 
        prefs.learning.dataPoints <= filter.maxDataPoints!
      );
    }
    
    if (filter.confidenceRange) {
      filteredPreferences = filteredPreferences.filter(prefs => 
        prefs.learning.confidenceScore >= filter.confidenceRange!.min &&
        prefs.learning.confidenceScore <= filter.confidenceRange!.max
      );
    }

    // Apply sorting
    filteredPreferences.sort((a, b) => {
      let valueA: any, valueB: any;
      
      switch (sortBy) {
        case 'updatedAt':
          valueA = a.updatedAt.getTime();
          valueB = b.updatedAt.getTime();
          break;
        case 'learning.confidenceScore':
          valueA = a.learning.confidenceScore;
          valueB = b.learning.confidenceScore;
          break;
        case 'learning.dataPoints':
          valueA = a.learning.dataPoints;
          valueB = b.learning.dataPoints;
          break;
        case 'userId':
          valueA = a.userId;
          valueB = b.userId;
          break;
        default:
          valueA = a.updatedAt.getTime();
          valueB = b.updatedAt.getTime();
      }
      
      return sortOrder === 'asc' ? 
        (typeof valueA === 'string' ? valueA.localeCompare(valueB) : valueA - valueB) :
        (typeof valueB === 'string' ? valueB.localeCompare(valueA) : valueB - valueA);
    });

    // Apply pagination
    const total = filteredPreferences.length;
    const paginatedPreferences = filteredPreferences.slice(offset, offset + limit);

    // Calculate aggregations
    const aggregations = this.calculateAggregations(filteredPreferences);

    return {
      preferences: paginatedPreferences,
      total,
      hasMore: offset + limit < total,
      aggregations
    };
  }

  /**
   * Create new preferences with initial learning setup
   */
  public async create(preferencesData: Omit<UserPreferences, 'id' | 'updatedAt'>): Promise<UserPreferences> {
    const preferences: UserPreferences = {
      ...preferencesData,
      id: preferencesData.userId, // Use userId as ID
      updatedAt: new Date(),
      
      // Initialize learning if not provided
      learning: preferencesData.learning || {
        level: 'basic',
        confidenceScore: 0.0,
        lastLearningUpdate: new Date(),
        dataPoints: 0
      },
      
      // Initialize settings if not provided
      settings: preferencesData.settings || {
        personalizedRecommendations: true,
        trendingContent: true,
        categoryDiversity: 0.7,
        difficulty: 'intermediate',
        contentLength: 'medium'
      },
      
      // Initialize interactions if not provided
      interactions: preferencesData.interactions || {
        likes: [],
        dislikes: [],
        saves: [],
        shares: [],
        implementations: []
      }
    };

    this.storage.set(preferences.userId, preferences);
    
    // Initialize analytics
    this.analytics.set(preferences.userId, this.initializePreferencesAnalytics(preferences.userId));
    
    // Initialize learning metrics
    this.learningMetrics.set(preferences.userId, {
      dailyDataPoints: {},
      progressionHistory: [{
        date: new Date(),
        level: preferences.learning.level,
        confidence: preferences.learning.confidenceScore
      }]
    });
    
    // Save to history
    await this.saveToHistory(preferences, [], 'initial_creation');
    
    // Clear cache
    this.clearPreferencesCache(preferences.userId);
    
    return preferences;
  }

  /**
   * Update preferences with versioning and analytics tracking
   */
  public async update(id: string, updates: Partial<UserPreferences>): Promise<UserPreferences> {
    const existingPreferences = await this.findById(id);
    if (!existingPreferences) {
      throw new Error(`Preferences for user ${id} not found`);
    }

    // Detect changed fields
    const changedFields = this.detectChangedFields(existingPreferences, updates);

    const updatedPreferences: UserPreferences = {
      ...existingPreferences,
      ...updates,
      userId: id, // Ensure userId doesn't change
      updatedAt: new Date()
    };

    // Handle learning level progression
    if (updates.learning && updates.learning.level !== existingPreferences.learning.level) {
      await this.handleLevelProgression(id, existingPreferences.learning.level, updates.learning.level);
    }

    this.storage.set(id, updatedPreferences);
    
    // Update analytics
    await this.updatePreferencesAnalytics(id, updatedPreferences, changedFields);
    
    // Update learning metrics
    await this.updateLearningMetrics(id, updatedPreferences);
    
    // Save to history
    await this.saveToHistory(updatedPreferences, changedFields, 'update');
    
    // Clear cache
    this.clearPreferencesCache(id);
    
    return updatedPreferences;
  }

  /**
   * Delete preferences with cleanup
   */
  public async delete(id: string): Promise<boolean> {
    const exists = this.storage.has(id);
    
    if (exists) {
      this.storage.delete(id);
      this.analytics.delete(id);
      this.learningMetrics.delete(id);
      this.history.delete(id);
      this.migrations.delete(id);
      this.clearPreferencesCache(id);
    }
    
    return exists;
  }

  /**
   * Update learning progress with data point tracking
   */
  public async updateLearningProgress(
    userId: string, 
    interaction: {
      type: string;
      category: string;
      impact: number;
    }
  ): Promise<UserPreferences> {
    const preferences = await this.findByUserId(userId);
    if (!preferences) {
      throw new Error(`Preferences for user ${userId} not found`);
    }

    const updatedLearning = {
      ...preferences.learning,
      dataPoints: preferences.learning.dataPoints + 1,
      lastLearningUpdate: new Date(),
      confidenceScore: Math.min(preferences.learning.confidenceScore + interaction.impact, 1.0)
    };

    // Check for level progression
    const newLevel = this.calculateLearningLevel(updatedLearning.dataPoints, updatedLearning.confidenceScore);
    if (newLevel !== updatedLearning.level) {
      updatedLearning.level = newLevel;
    }

    return this.update(userId, { learning: updatedLearning });
  }

  /**
   * Get preferences history
   */
  public async getPreferencesHistory(userId: string, limit: number = 50): Promise<PreferencesHistory[]> {
    const userHistory = this.history.get(userId) || [];
    return userHistory
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Get learning progress report
   */
  public async getLearningProgressReport(userId: string): Promise<LearningProgressReport> {
    const preferences = await this.findByUserId(userId);
    if (!preferences) {
      throw new Error(`Preferences for user ${userId} not found`);
    }

    const analytics = this.analytics.get(userId);
    const learningMetrics = this.learningMetrics.get(userId);

    const requiredForNext = this.getRequiredDataPointsForNextLevel(preferences.learning.level);
    const progressPercentage = (preferences.learning.dataPoints / requiredForNext) * 100;

    return {
      userId,
      currentLevel: preferences.learning.level,
      progress: {
        currentDataPoints: preferences.learning.dataPoints,
        requiredForNext,
        progressPercentage: Math.min(progressPercentage, 100),
        estimatedTimeToNext: this.estimateTimeToNextLevel(userId, preferences.learning.dataPoints, requiredForNext)
      },
      insights: {
        strongCategories: this.getStrongCategories(preferences),
        weakCategories: this.getWeakCategories(preferences),
        learningAcceleration: this.calculateLearningAcceleration(userId),
        recommendedActions: this.generateRecommendedActions(preferences)
      },
      comparison: {
        vsAverage: await this.compareToAverage(preferences),
        vsTarget: await this.compareToTarget(preferences)
      }
    };
  }

  /**
   * Get preferences analytics
   */
  public async getPreferencesAnalytics(userId: string): Promise<PreferencesAnalytics | null> {
    return this.analytics.get(userId) || null;
  }

  /**
   * Migrate preferences to new version
   */
  public async migratePreferences(
    userId: string, 
    fromVersion: string, 
    toVersion: string,
    preserveData: boolean = true
  ): Promise<PreferencesMigrationReport> {
    const preferences = await this.findByUserId(userId);
    if (!preferences) {
      throw new Error(`Preferences for user ${userId} not found`);
    }

    const migrationReport: PreferencesMigrationReport = {
      userId,
      migrationStatus: {
        fromVersion,
        toVersion,
        started: new Date(),
        success: false
      },
      dataPreservation: {
        categoriesPreserved: [],
        stylesPreserved: [],
        interactionsPreserved: 0,
        lossPercentage: 0
      },
      learningImpact: {
        levelMaintained: true,
        confidenceChange: 0,
        dataPointsRetained: 0,
        retrainingRequired: false
      }
    };

    try {
      // Perform migration based on version changes
      const migratedPreferences = await this.performMigration(preferences, fromVersion, toVersion, preserveData);
      
      // Calculate data preservation metrics
      migrationReport.dataPreservation = this.calculateDataPreservation(preferences, migratedPreferences);
      migrationReport.learningImpact = this.calculateLearningImpact(preferences, migratedPreferences);
      
      // Update preferences
      await this.update(userId, migratedPreferences);
      
      // Save migration report
      migrationReport.migrationStatus.completed = new Date();
      migrationReport.migrationStatus.success = true;
      this.migrations.set(userId, migrationReport);
      
      // Save to history
      await this.saveToHistory(migratedPreferences, ['migration'], `migration_${fromVersion}_to_${toVersion}`);

    } catch (error) {
      migrationReport.migrationStatus.success = false;
      console.error('Migration failed:', error);
    }

    return migrationReport;
  }

  /**
   * Get users for learning level promotion
   */
  public async getUsersForLevelPromotion(targetLevel: 'behavioral' | 'contextual'): Promise<UserPreferences[]> {
    const minDataPoints = targetLevel === 'behavioral' ? 20 : 50;
    const minConfidence = targetLevel === 'behavioral' ? 0.6 : 0.8;
    
    return this.findMany({
      learningLevel: targetLevel === 'behavioral' ? 'basic' : 'behavioral',
      minDataPoints,
      confidenceRange: { min: minConfidence, max: 1.0 }
    }).then(result => result.preferences);
  }

  /**
   * Bulk update preferences for A/B testing
   */
  public async bulkUpdateForABTest(
    userIds: string[], 
    testId: string, 
    strategy: string,
    updates: Partial<UserPreferences>
  ): Promise<{ success: number; failures: string[] }> {
    const results = { success: 0, failures: [] as string[] };
    
    for (const userId of userIds) {
      try {
        const preferences = await this.findByUserId(userId);
        if (preferences) {
          const updatedPreferences = {
            ...updates,
            // Add A/B test tracking to analytics
          };
          
          await this.update(userId, updatedPreferences);
          
          // Update analytics with A/B test info
          const analytics = this.analytics.get(userId);
          if (analytics && analytics.abTesting) {
            analytics.abTesting.currentTests.push({
              testId,
              strategy,
              startDate: new Date(),
              metrics: {}
            });
          }
          
          results.success++;
        }
      } catch (error) {
        results.failures.push(userId);
      }
    }
    
    return results;
  }

  // Private implementation methods
  private calculateAggregations(preferences: UserPreferences[]): any {
    const learningLevelDistribution = { basic: 0, behavioral: 0, contextual: 0 };
    let totalConfidence = 0;
    let totalDataPoints = 0;
    let personalizedUsers = 0;
    
    preferences.forEach(prefs => {
      learningLevelDistribution[prefs.learning.level]++;
      totalConfidence += prefs.learning.confidenceScore;
      totalDataPoints += prefs.learning.dataPoints;
      if (prefs.settings.personalizedRecommendations) {
        personalizedUsers++;
      }
    });
    
    return {
      learningLevelDistribution,
      averageConfidenceScore: preferences.length > 0 ? totalConfidence / preferences.length : 0,
      averageDataPoints: preferences.length > 0 ? totalDataPoints / preferences.length : 0,
      personalizedUsersCount: personalizedUsers
    };
  }

  private detectChangedFields(existing: UserPreferences, updates: Partial<UserPreferences>): string[] {
    const changedFields: string[] = [];
    
    Object.keys(updates).forEach(key => {
      const typedKey = key as keyof UserPreferences;
      if (JSON.stringify(existing[typedKey]) !== JSON.stringify(updates[typedKey])) {
        changedFields.push(key);
      }
    });
    
    return changedFields;
  }

  private async saveToHistory(
    preferences: UserPreferences, 
    changedFields: string[], 
    changeReason: string
  ): Promise<void> {
    const userId = preferences.userId;
    const userHistory = this.history.get(userId) || [];
    
    const historyEntry: PreferencesHistory = {
      id: this.generateHistoryId(),
      userId,
      version: userHistory.length + 1,
      preferences: { ...preferences },
      timestamp: new Date(),
      changedFields,
      changeReason
    };
    
    userHistory.push(historyEntry);
    this.history.set(userId, userHistory);
  }

  private calculateLearningLevel(dataPoints: number, confidenceScore: number): 'basic' | 'behavioral' | 'contextual' {
    if (dataPoints >= 50 && confidenceScore >= 0.8) {
      return 'contextual';
    } else if (dataPoints >= 20 && confidenceScore >= 0.6) {
      return 'behavioral';
    } else {
      return 'basic';
    }
  }

  private getRequiredDataPointsForNextLevel(currentLevel: string): number {
    switch (currentLevel) {
      case 'basic': return 20;
      case 'behavioral': return 50;
      case 'contextual': return 100;
      default: return 20;
    }
  }

  private estimateTimeToNextLevel(userId: string, currentPoints: number, requiredPoints: number): number {
    const metrics = this.learningMetrics.get(userId);
    if (!metrics) return 30; // Default 30 days
    
    const recentDays = Object.values(metrics.dailyDataPoints).slice(-7);
    const avgDailyPoints = recentDays.reduce((sum, points) => sum + points, 0) / Math.max(recentDays.length, 1);
    
    const pointsNeeded = requiredPoints - currentPoints;
    return avgDailyPoints > 0 ? Math.ceil(pointsNeeded / avgDailyPoints) : 30;
  }

  private getStrongCategories(preferences: UserPreferences): string[] {
    return Object.entries(preferences.categories)
      .filter(([_, score]) => (score as number) > 0.7)
      .map(([category, _]) => category)
      .slice(0, 5);
  }

  private getWeakCategories(preferences: UserPreferences): string[] {
    return Object.entries(preferences.categories)
      .filter(([_, score]) => (score as number) < 0.3)
      .map(([category, _]) => category)
      .slice(0, 3);
  }

  private calculateLearningAcceleration(userId: string): number {
    const metrics = this.learningMetrics.get(userId);
    if (!metrics || metrics.progressionHistory.length < 2) return 0;
    
    const recent = metrics.progressionHistory.slice(-5);
    const confidenceChange = recent[recent.length - 1].confidence - recent[0].confidence;
    const timespan = recent[recent.length - 1].date.getTime() - recent[0].date.getTime();
    
    return confidenceChange / (timespan / (1000 * 60 * 60 * 24)); // Per day
  }

  private generateRecommendedActions(preferences: UserPreferences): string[] {
    const actions: string[] = [];
    
    if (preferences.learning.dataPoints < 10) {
      actions.push('Interact with more content to improve personalization');
    }
    
    if (Object.keys(preferences.categories).length < 3) {
      actions.push('Explore different content categories');
    }
    
    if (preferences.learning.confidenceScore < 0.5) {
      actions.push('Provide more feedback on generated ideas');
    }
    
    return actions;
  }

  private async compareToAverage(preferences: UserPreferences): Promise<any> {
    const allPreferences = await this.findMany();
    const aggregations = this.calculateAggregations(allPreferences.preferences);
    
    return {
      dataPoints: preferences.learning.dataPoints - aggregations.averageDataPoints,
      confidence: preferences.learning.confidenceScore - aggregations.averageConfidenceScore,
      satisfaction: 0.75 // Mock satisfaction comparison
    };
  }

  private async compareToTarget(preferences: UserPreferences): Promise<any> {
    const targetDataPoints = this.getRequiredDataPointsForNextLevel(preferences.learning.level);
    const onTrack = preferences.learning.dataPoints >= targetDataPoints * 0.8;
    
    return {
      onTrack,
      deviation: targetDataPoints - preferences.learning.dataPoints,
      correctionNeeded: onTrack ? [] : ['Increase interaction frequency', 'Provide more feedback']
    };
  }

  private async handleLevelProgression(userId: string, oldLevel: string, newLevel: string): Promise<void> {
    const metrics = this.learningMetrics.get(userId);
    if (metrics) {
      metrics.progressionHistory.push({
        date: new Date(),
        level: newLevel,
        confidence: 0 // Will be updated with actual confidence
      });
    }
    
    console.log(`User ${userId} progressed from ${oldLevel} to ${newLevel}`);
  }

  private async updatePreferencesAnalytics(
    userId: string, 
    preferences: UserPreferences, 
    changedFields: string[]
  ): Promise<void> {
    const analytics = this.analytics.get(userId);
    if (analytics) {
      analytics.engagement.totalInteractions++;
      analytics.engagement.lastInteractionDate = new Date();
      analytics.learning.currentLevel = preferences.learning.level;
    }
  }

  private async updateLearningMetrics(userId: string, preferences: UserPreferences): Promise<void> {
    const metrics = this.learningMetrics.get(userId);
    if (metrics) {
      const today = new Date().toISOString().split('T')[0];
      metrics.dailyDataPoints[today] = (metrics.dailyDataPoints[today] || 0) + 1;
    }
  }

  private async performMigration(
    preferences: UserPreferences, 
    fromVersion: string, 
    toVersion: string, 
    preserveData: boolean
  ): Promise<Partial<UserPreferences>> {
    // Mock migration logic - would implement actual migration
    if (!preserveData) {
      return {
        learning: {
          level: 'basic',
          confidenceScore: 0,
          lastLearningUpdate: new Date(),
          dataPoints: 0
        }
      };
    }
    
    return preferences;
  }

  private calculateDataPreservation(old: UserPreferences, migrated: any): any {
    return {
      categoriesPreserved: Object.keys(old.categories),
      stylesPreserved: Object.keys(old.styles),
      interactionsPreserved: old.interactions.likes.length + old.interactions.saves.length,
      lossPercentage: 0
    };
  }

  private calculateLearningImpact(old: UserPreferences, migrated: any): any {
    return {
      levelMaintained: true,
      confidenceChange: 0,
      dataPointsRetained: old.learning.dataPoints,
      retrainingRequired: false
    };
  }

  private initializeMockData(): void {
    // Initialize with some mock preferences for development
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

  private clearPreferencesCache(userId: string): void {
    this.cache.delete(`prefs_${userId}`);
    this.cache.delete(`analytics_${userId}`);
    this.cache.delete(`learning_${userId}`);
  }

  private generateHistoryId(): string {
    return `hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializePreferencesAnalytics(userId: string): PreferencesAnalytics {
    return {
      userId,
      learning: {
        currentLevel: 'basic',
        progression: {
          startDate: new Date(),
          currentDataPoints: 0,
          learningVelocity: 0,
          plateauDetected: false
        },
        effectiveness: {
          accuracyScore: 0,
          satisfactionScore: 0,
          implementationRate: 0,
          categoryAccuracy: {}
        }
      },
      engagement: {
        totalInteractions: 0,
        lastInteractionDate: new Date(),
        averageSessionLength: 0,
        preferenceStability: 1.0
      },
      personalization: {
        recommendationAccuracy: 0.5,
        categoryDiversityScore: 0.7,
        trendFollowingScore: 0.5,
        riskToleranceScore: 0.5
      },
      abTesting: {
        currentTests: [],
        historicalResults: []
      }
    };
  }
}

export default PreferencesRepository; 