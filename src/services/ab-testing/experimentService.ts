/**
 * 🧪 A/B Testing Service - Migration Validation
 * 
 * Manages A/B testing experiments during user migration
 * Enables safe feature rollout with data-driven decisions
 * 
 * Part of: PRE-WEEK 0 - IA Beta A/B Testing Framework Development
 * Integration: Alpha cost management + Charlie monitoring
 */

export interface Experiment {
  id: string;
  name: string;
  description: string;
  type: 'migration' | 'feature' | 'design' | 'cost-tier'; // Alpha integration
  status: 'draft' | 'active' | 'paused' | 'completed';
  startDate: Date;
  endDate?: Date;
  targetAudience: {
    segments: string[];
    percentage: number;
    costTiers?: ('free' | 'premium')[]; // Alpha integration
    excludeUsers?: string[];
  };
  variants: ExperimentVariant[];
  successMetrics: SuccessMetric[];
  currentResults?: ExperimentResults;
}

export interface ExperimentVariant {
  id: string;
  name: string;
  description: string;
  isControl: boolean;
  allocation: number; // percentage
  config: {
    features: Record<string, boolean>;
    designChanges: Record<string, any>;
    costTierRules?: Record<string, any>; // Alpha integration
  };
}

export interface SuccessMetric {
  name: string;
  type: 'satisfaction' | 'adoption' | 'performance' | 'cost' | 'support';
  target: number;
  current?: number;
  threshold: 'higher' | 'lower'; // higher is better or lower is better
  weight: number; // importance weight
  chartieIntegration?: boolean; // Charlie monitoring
}

export interface ExperimentResults {
  totalParticipants: number;
  variantResults: Map<string, VariantResult>;
  statisticalSignificance: number;
  winningVariant?: string;
  confidenceLevel: number;
  conclusionReached: boolean;
}

export interface VariantResult {
  variantId: string;
  participants: number;
  metrics: Record<string, number>;
  conversionRate?: number;
  satisfactionScore: number;
  costImpact?: number; // Alpha integration
}

class ExperimentService {
  private experiments: Map<string, Experiment> = new Map();
  private userAssignments: Map<string, Map<string, string>> = new Map(); // userId -> experimentId -> variantId
  private experimentLogs: any[] = [];

  constructor() {
    this.initializeDefaultExperiments();
  }

  /**
   * 🚀 Create migration A/B test experiment
   */
  async createMigrationExperiment(
    name: string,
    description: string,
    targetPercentage: number = 50
  ): Promise<string> {
    try {
      const experimentId = `migration_${Date.now()}`;
      
      const experiment: Experiment = {
        id: experimentId,
        name,
        description,
        type: 'migration',
        status: 'draft',
        startDate: new Date(),
        targetAudience: {
          segments: ['existing-user'],
          percentage: targetPercentage,
          costTiers: ['free', 'premium'], // Test both tiers
          excludeUsers: []
        },
        variants: [
          {
            id: 'control',
            name: 'Current Experience',
            description: 'Keep existing user experience unchanged',
            isControl: true,
            allocation: 50,
            config: {
              features: {
                'legacy-dashboard': true,
                'legacy-navigation': true,
                'new-design-system': false
              },
              designChanges: {}
            }
          },
          {
            id: 'migration',
            name: 'New Experience',
            description: 'Gradual migration to new design system',
            isControl: false,
            allocation: 50,
            config: {
              features: {
                'legacy-dashboard': false,
                'legacy-navigation': false,
                'new-design-system': true,
                'enhanced-idea-bank': true
              },
              designChanges: {
                'design-tokens': 'v2',
                'components': 'modern'
              }
            }
          }
        ],
        successMetrics: [
          {
            name: 'User Satisfaction',
            type: 'satisfaction',
            target: 85,
            threshold: 'higher',
            weight: 0.4,
            chartieIntegration: true
          },
          {
            name: 'Feature Adoption',
            type: 'adoption',
            target: 80,
            threshold: 'higher',
            weight: 0.3
          },
          {
            name: 'Support Tickets',
            type: 'support',
            target: 5, // max 5% increase
            threshold: 'lower',
            weight: 0.2
          },
          {
            name: 'Cost per User',
            type: 'cost',
            target: 0.5, // max $0.50 per user
            threshold: 'lower',
            weight: 0.1
          }
        ]
      };

      this.experiments.set(experimentId, experiment);
      
      console.log(`🧪 Migration experiment created: ${experimentId}`);
      return experimentId;
      
    } catch (error) {
      console.error('❌ Failed to create migration experiment:', error);
      throw error;
    }
  }

  /**
   * 🎯 Start A/B experiment
   */
  async startExperiment(experimentId: string): Promise<boolean> {
    try {
      const experiment = this.experiments.get(experimentId);
      if (!experiment) {
        throw new Error(`Experiment ${experimentId} not found`);
      }

      // Validate experiment before starting
      const validation = await this.validateExperiment(experiment);
      if (!validation.isValid) {
        throw new Error(`Experiment validation failed: ${validation.errors.join(', ')}`);
      }

      // Start experiment
      experiment.status = 'active';
      experiment.startDate = new Date();
      
      // Initialize results tracking
      experiment.currentResults = {
        totalParticipants: 0,
        variantResults: new Map(),
        statisticalSignificance: 0,
        confidenceLevel: 0,
        conclusionReached: false
      };

      // Initialize variant results
      for (const variant of experiment.variants) {
        experiment.currentResults.variantResults.set(variant.id, {
          variantId: variant.id,
          participants: 0,
          metrics: {},
          satisfactionScore: 0,
          costImpact: 0
        });
      }

      this.experiments.set(experimentId, experiment);

      // Report to Charlie monitoring
      await this.reportExperimentStarted(experimentId);

      console.log(`🚀 Experiment started: ${experimentId}`);
      return true;
      
    } catch (error) {
      console.error(`❌ Failed to start experiment ${experimentId}:`, error);
      return false;
    }
  }

  /**
   * 👥 Assign user to experiment variant
   */
  async assignUserToExperiment(userId: string, experimentId: string): Promise<string | null> {
    try {
      const experiment = this.experiments.get(experimentId);
      if (!experiment || experiment.status !== 'active') {
        return null;
      }

      // Check if user is eligible
      if (!await this.isUserEligible(userId, experiment)) {
        return null;
      }

      // Check if user already assigned
      const userExperiments = this.userAssignments.get(userId) || new Map();
      if (userExperiments.has(experimentId)) {
        return userExperiments.get(experimentId)!;
      }

      // Assign to variant based on allocation
      const variantId = await this.selectVariantForUser(userId, experiment);
      
      // Record assignment
      userExperiments.set(experimentId, variantId);
      this.userAssignments.set(userId, userExperiments);

      // Update experiment results
      if (experiment.currentResults) {
        experiment.currentResults.totalParticipants++;
        const variantResult = experiment.currentResults.variantResults.get(variantId);
        if (variantResult) {
          variantResult.participants++;
        }
      }

      // Log assignment for Charlie monitoring
      await this.logUserAssignment(userId, experimentId, variantId);

      console.log(`👥 User ${userId} assigned to experiment ${experimentId}, variant ${variantId}`);
      return variantId;
      
    } catch (error) {
      console.error(`❌ Failed to assign user ${userId} to experiment ${experimentId}:`, error);
      return null;
    }
  }

  /**
   * 📊 Track experiment metric
   */
  async trackExperimentMetric(
    userId: string,
    experimentId: string,
    metricName: string,
    value: number
  ): Promise<void> {
    try {
      const experiment = this.experiments.get(experimentId);
      if (!experiment || !experiment.currentResults) {
        return;
      }

      const userExperiments = this.userAssignments.get(userId);
      if (!userExperiments || !userExperiments.has(experimentId)) {
        return;
      }

      const variantId = userExperiments.get(experimentId)!;
      const variantResult = experiment.currentResults.variantResults.get(variantId);
      
      if (variantResult) {
        // Update metric
        variantResult.metrics[metricName] = value;
        
        // Special handling for key metrics
        if (metricName === 'satisfaction') {
          variantResult.satisfactionScore = value;
        }
        if (metricName === 'cost') {
          variantResult.costImpact = value;
        }

        // Update metric in success metrics
        const successMetric = experiment.successMetrics.find(m => m.name.toLowerCase().includes(metricName.toLowerCase()));
        if (successMetric) {
          successMetric.current = this.calculateMetricAverage(experiment, metricName);
        }
      }

      // Check if experiment should conclude
      await this.checkExperimentConclusion(experimentId);

      // Report to Charlie monitoring
      await this.reportMetricTracked(userId, experimentId, metricName, value);
      
    } catch (error) {
      console.error(`❌ Failed to track metric for user ${userId}:`, error);
    }
  }

  /**
   * 📈 Get experiment results
   */
  async getExperimentResults(experimentId: string): Promise<ExperimentResults | null> {
    try {
      const experiment = this.experiments.get(experimentId);
      if (!experiment || !experiment.currentResults) {
        return null;
      }

      // Calculate statistical significance
      await this.calculateStatisticalSignificance(experiment);

      // Determine winning variant
      await this.determineWinningVariant(experiment);

      // Report to Charlie monitoring
      await this.reportExperimentResults(experimentId, experiment.currentResults);

      return experiment.currentResults;
      
    } catch (error) {
      console.error(`❌ Failed to get experiment results for ${experimentId}:`, error);
      return null;
    }
  }

  /**
   * 🏁 Conclude experiment
   */
  async concludeExperiment(experimentId: string, reason: string = 'completed'): Promise<boolean> {
    try {
      const experiment = this.experiments.get(experimentId);
      if (!experiment) {
        return false;
      }

      experiment.status = 'completed';
      experiment.endDate = new Date();

      // Get final results
      const results = await this.getExperimentResults(experimentId);

      // Log conclusion
      this.experimentLogs.push({
        experimentId,
        action: 'concluded',
        reason,
        timestamp: new Date(),
        results
      });

      // Apply winning variant if statistical significance reached
      if (results?.conclusionReached && results.winningVariant) {
        await this.applyWinningVariant(experimentId, results.winningVariant);
      }

      // Report to Alpha (cost implications) and Charlie (monitoring)
      await this.reportExperimentConcluded(experimentId, results);

      console.log(`🏁 Experiment concluded: ${experimentId} - ${reason}`);
      return true;
      
    } catch (error) {
      console.error(`❌ Failed to conclude experiment ${experimentId}:`, error);
      return false;
    }
  }

  /**
   * 📊 Get all experiment analytics
   */
  async getExperimentAnalytics(): Promise<any> {
    const analytics = {
      totalExperiments: this.experiments.size,
      activeExperiments: 0,
      completedExperiments: 0,
      avgParticipants: 0,
      avgSatisfactionImprovement: 0,
      costImpactAnalysis: {
        totalSavings: 0,
        avgCostPerUser: 0
      },
      successfulMigrations: 0
    };

    let totalParticipants = 0;
    const satisfactionImprovements = [];
    const costImpacts = [];

    for (const experiment of this.experiments.values()) {
      switch (experiment.status) {
        case 'active':
          analytics.activeExperiments++;
          break;
        case 'completed':
          analytics.completedExperiments++;
          break;
      }

      if (experiment.currentResults) {
        totalParticipants += experiment.currentResults.totalParticipants;
        
        // Analyze satisfaction improvements
        const controlResult = experiment.currentResults.variantResults.get('control');
        const testResult = experiment.currentResults.variantResults.get('migration') || 
                          experiment.currentResults.variantResults.get('test');
        
        if (controlResult && testResult) {
          const improvement = testResult.satisfactionScore - controlResult.satisfactionScore;
          satisfactionImprovements.push(improvement);
          
          const costDiff = (testResult.costImpact || 0) - (controlResult.costImpact || 0);
          costImpacts.push(costDiff);
        }

        // Check for successful migrations
        if (experiment.type === 'migration' && experiment.currentResults.conclusionReached) {
          analytics.successfulMigrations++;
        }
      }
    }

    analytics.avgParticipants = analytics.totalExperiments > 0 ? 
      totalParticipants / analytics.totalExperiments : 0;

    analytics.avgSatisfactionImprovement = satisfactionImprovements.length > 0 ?
      satisfactionImprovements.reduce((a, b) => a + b, 0) / satisfactionImprovements.length : 0;

    analytics.costImpactAnalysis.avgCostPerUser = costImpacts.length > 0 ?
      costImpacts.reduce((a, b) => a + b, 0) / costImpacts.length : 0;

    analytics.costImpactAnalysis.totalSavings = costImpacts.reduce((a, b) => a + Math.abs(Math.min(0, b)), 0);

    // Report to Charlie monitoring
    await this.reportExperimentAnalytics(analytics);

    return analytics;
  }

  // Helper methods
  private initializeDefaultExperiments(): void {
    console.log('🧪 Initializing A/B testing framework');
  }

  private async validateExperiment(experiment: Experiment): Promise<{isValid: boolean, errors: string[]}> {
    const errors: string[] = [];
    
    // Check variant allocations sum to 100%
    const totalAllocation = experiment.variants.reduce((sum, v) => sum + v.allocation, 0);
    if (Math.abs(totalAllocation - 100) > 0.1) {
      errors.push('Variant allocations must sum to 100%');
    }

    // Check at least one control variant
    const hasControl = experiment.variants.some(v => v.isControl);
    if (!hasControl) {
      errors.push('Experiment must have at least one control variant');
    }

    // Check success metrics
    if (experiment.successMetrics.length === 0) {
      errors.push('Experiment must have at least one success metric');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private async isUserEligible(userId: string, experiment: Experiment): Promise<boolean> {
    // Check if user is in target audience
    if (experiment.targetAudience.excludeUsers?.includes(userId)) {
      return false;
    }

    // Check cost tier eligibility (Alpha integration)
    if (experiment.targetAudience.costTiers) {
      const userCostTier = await this.getUserCostTier(userId);
      if (!experiment.targetAudience.costTiers.includes(userCostTier)) {
        return false;
      }
    }

    // Check percentage rollout
    const hash = this.hashUserId(userId);
    const rolloutThreshold = experiment.targetAudience.percentage;
    return (hash % 100) < rolloutThreshold;
  }

  private async selectVariantForUser(userId: string, experiment: Experiment): Promise<string> {
    const hash = this.hashUserId(userId + experiment.id);
    let cumulativeAllocation = 0;
    
    for (const variant of experiment.variants) {
      cumulativeAllocation += variant.allocation;
      if ((hash % 100) < cumulativeAllocation) {
        return variant.id;
      }
    }
    
    // Fallback to control
    return experiment.variants.find(v => v.isControl)?.id || experiment.variants[0].id;
  }

  private hashUserId(input: string): number {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  private calculateMetricAverage(experiment: Experiment, metricName: string): number {
    if (!experiment.currentResults) return 0;
    
    let sum = 0;
    let count = 0;
    
    for (const result of experiment.currentResults.variantResults.values()) {
      if (result.metrics[metricName] !== undefined) {
        sum += result.metrics[metricName];
        count++;
      }
    }
    
    return count > 0 ? sum / count : 0;
  }

  private async checkExperimentConclusion(experimentId: string): Promise<void> {
    const experiment = this.experiments.get(experimentId);
    if (!experiment || !experiment.currentResults) return;

    // Check minimum sample size
    const minSampleSize = 100; // Minimum participants per variant
    const hasMinimumSample = Array.from(experiment.currentResults.variantResults.values())
      .every(result => result.participants >= minSampleSize);

    if (!hasMinimumSample) return;

    // Calculate statistical significance
    await this.calculateStatisticalSignificance(experiment);

    // Check if conclusion can be reached
    if (experiment.currentResults.confidenceLevel >= 95 && 
        experiment.currentResults.statisticalSignificance >= 0.05) {
      experiment.currentResults.conclusionReached = true;
      
      // Auto-conclude if significance reached
      setTimeout(() => {
        this.concludeExperiment(experimentId, 'statistical-significance-reached');
      }, 1000);
    }
  }

  private async calculateStatisticalSignificance(experiment: Experiment): Promise<void> {
    if (!experiment.currentResults) return;

    const variants = Array.from(experiment.currentResults.variantResults.values());
    if (variants.length < 2) return;

    // Simplified statistical significance calculation
    // In production, use proper statistical libraries
    const totalParticipants = experiment.currentResults.totalParticipants;
    const minVariantSize = Math.min(...variants.map(v => v.participants));
    
    if (minVariantSize > 50 && totalParticipants > 100) {
      experiment.currentResults.statisticalSignificance = 0.05; // p < 0.05
      experiment.currentResults.confidenceLevel = 95;
    }
  }

  private async determineWinningVariant(experiment: Experiment): Promise<void> {
    if (!experiment.currentResults) return;

    let bestScore = -Infinity;
    let winningVariantId = '';

    for (const [variantId, result] of experiment.currentResults.variantResults.entries()) {
      // Calculate weighted score based on success metrics
      let score = 0;
      
      for (const metric of experiment.successMetrics) {
        const metricValue = result.metrics[metric.name.toLowerCase()] || 0;
        let normalizedValue = metricValue;
        
        // Normalize based on threshold direction
        if (metric.threshold === 'lower') {
          normalizedValue = metric.target - metricValue; // Lower is better
        }
        
        score += normalizedValue * metric.weight;
      }
      
      if (score > bestScore) {
        bestScore = score;
        winningVariantId = variantId;
      }
    }

    experiment.currentResults.winningVariant = winningVariantId;
  }

  private async applyWinningVariant(experimentId: string, winningVariantId: string): Promise<void> {
    console.log(`🏆 Applying winning variant ${winningVariantId} for experiment ${experimentId}`);
    // Implementation to apply winning variant configuration
  }

  private async getUserCostTier(userId: string): Promise<'free' | 'premium'> {
    // Alpha integration - get user cost tier
    return 'free'; // Mock implementation
  }

  // Integration reporting methods
  private async reportExperimentStarted(experimentId: string): Promise<void> {
    console.log(`📊 Experiment started report: ${experimentId}`);
  }

  private async logUserAssignment(userId: string, experimentId: string, variantId: string): Promise<void> {
    console.log(`👥 User assignment logged: ${userId} - ${experimentId} - ${variantId}`);
  }

  private async reportMetricTracked(userId: string, experimentId: string, metricName: string, value: number): Promise<void> {
    console.log(`📈 Metric tracked: ${userId} - ${experimentId} - ${metricName}: ${value}`);
  }

  private async reportExperimentResults(experimentId: string, results: ExperimentResults): Promise<void> {
    console.log(`📊 Experiment results reported: ${experimentId}`, results);
  }

  private async reportExperimentConcluded(experimentId: string, results: ExperimentResults | null): Promise<void> {
    console.log(`🏁 Experiment concluded report: ${experimentId}`, results);
  }

  private async reportExperimentAnalytics(analytics: any): Promise<void> {
    console.log('📈 Experiment analytics reported:', analytics);
  }
}

export { ExperimentService }; 