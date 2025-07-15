/**
 * PERSONALIZED RECOMMENDATION SERVICE - SPRINT 5
 * AI-powered personalized recommendations system
 * V7.5 Enhanced - IA Alpha Implementation
 */

// Types and Interfaces
export interface Recommendation {
  id: string;
  type: 'content' | 'template' | 'action' | 'feature' | 'collaboration';
  title: string;
  description: string;
  confidence: number;
  relevanceScore: number;
  priority: 'high' | 'medium' | 'low';
  reasoning: string;
  metadata: {
    basedOn: string[];
    category: string;
    estimatedValue: number;
    timeToComplete: number;
    difficulty: 'easy' | 'medium' | 'hard';
  };
  createdAt: Date;
  expiresAt?: Date;
}

export interface UserProfile {
  userId: string;
  preferences: {
    contentTypes: string[];
    platforms: string[];
    topics: string[];
    difficulty: 'easy' | 'medium' | 'hard';
  };
  behavior: {
    sessionDuration: number;
    actionsPerSession: number;
    mostUsedFeatures: string[];
    timeOfDay: string[];
    weeklyPattern: number[];
  };
  performance: {
    successRate: number;
    completionRate: number;
    shareRate: number;
    collaborationRate: number;
  };
  goals: {
    primary: string;
    secondary: string[];
    timeline: string;
  };
}

export interface ContentItem {
  id: string;
  type: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  performance: {
    views: number;
    likes: number;
    shares: number;
    comments: number;
  };
  createdAt: Date;
  userId: string;
}

export interface RecommendationEngine {
  collaborative: CollaborativeFilter;
  contentBased: ContentBasedFilter;
  hybrid: HybridFilter;
  contextual: ContextualFilter;
}

// Personalized Recommendation Service Implementation
export class PersonalizedRecommendationService {
  private userProfiles: Map<string, UserProfile> = new Map();
  private contentItems: Map<string, ContentItem> = new Map();
  private recommendations: Map<string, Recommendation[]> = new Map();
  private userInteractions: Map<string, any[]> = new Map();
  private similarityMatrix: Map<string, Map<string, number>> = new Map();

  constructor() {
    this.initializeService();
  }

  /**
   * Initialize recommendation service
   */
  private initializeService(): void {
    this.loadFromStorage();
    this.calculateUserSimilarities();
    
    // Update recommendations periodically
    setInterval(() => {
      this.updateRecommendations();
    }, 600000); // Every 10 minutes
  }

  /**
   * Get personalized recommendations for user
   */
  public async getRecommendations(
    userId: string,
    type?: Recommendation['type'],
    limit: number = 10
  ): Promise<Recommendation[]> {
    // Update user profile
    await this.updateUserProfile(userId);

    // Generate recommendations using different algorithms
    const collaborativeRecs = await this.generateCollaborativeRecommendations(userId);
    const contentBasedRecs = await this.generateContentBasedRecommendations(userId);
    const contextualRecs = await this.generateContextualRecommendations(userId);
    
    // Combine and score recommendations
    const allRecommendations = [
      ...collaborativeRecs,
      ...contentBasedRecs,
      ...contextualRecs
    ];

    // Remove duplicates and apply hybrid scoring
    const uniqueRecommendations = this.removeDuplicates(allRecommendations);
    const scoredRecommendations = this.applyHybridScoring(uniqueRecommendations, userId);

    // Filter by type if specified
    let filteredRecommendations = scoredRecommendations;
    if (type) {
      filteredRecommendations = scoredRecommendations.filter(rec => rec.type === type);
    }

    // Sort by relevance and confidence
    const sortedRecommendations = filteredRecommendations
      .sort((a, b) => {
        const scoreA = a.relevanceScore * a.confidence;
        const scoreB = b.relevanceScore * b.confidence;
        return scoreB - scoreA;
      })
      .slice(0, limit);

    // Store recommendations for user
    this.recommendations.set(userId, sortedRecommendations);
    
    return sortedRecommendations;
  }

  /**
   * Generate collaborative filtering recommendations
   */
  private async generateCollaborativeRecommendations(userId: string): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];
    const userProfile = this.userProfiles.get(userId);
    
    if (!userProfile) return recommendations;

    // Find similar users
    const similarUsers = this.findSimilarUsers(userId, 5);
    
    // Get content liked by similar users
    similarUsers.forEach(similarUser => {
      const similarUserContent = this.getUserContent(similarUser.userId);
      
      similarUserContent.forEach(content => {
        // Check if user hasn't seen this content
        if (!this.hasUserSeenContent(userId, content.id)) {
          recommendations.push({
            id: `collab_${Date.now()}_${content.id}`,
            type: 'content',
            title: `Conteúdo sugerido: ${content.title}`,
            description: `Baseado em usuários com interesses similares`,
            confidence: similarUser.similarity * 0.8,
            relevanceScore: this.calculateContentRelevance(content, userProfile),
            priority: 'medium',
            reasoning: `Usuários com perfil similar ao seu acharam este conteúdo interessante`,
            metadata: {
              basedOn: ['collaborative_filtering'],
              category: content.category,
              estimatedValue: 7,
              timeToComplete: 15,
              difficulty: 'medium'
            },
            createdAt: new Date()
          });
        }
      });
    });

    return recommendations;
  }

  /**
   * Generate content-based recommendations
   */
  private async generateContentBasedRecommendations(userId: string): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];
    const userProfile = this.userProfiles.get(userId);
    
    if (!userProfile) return recommendations;

    // Get user's content history
    const userContent = this.getUserContent(userId);
    
    // Find content similar to user's preferences
    const allContent = Array.from(this.contentItems.values());
    
    allContent.forEach(content => {
      if (!this.hasUserSeenContent(userId, content.id)) {
        const similarity = this.calculateContentSimilarity(userContent, content);
        
        if (similarity > 0.6) {
          recommendations.push({
            id: `content_${Date.now()}_${content.id}`,
            type: 'content',
            title: `Conteúdo relacionado: ${content.title}`,
            description: `Baseado no seu histórico de conteúdo`,
            confidence: similarity,
            relevanceScore: this.calculateContentRelevance(content, userProfile),
            priority: similarity > 0.8 ? 'high' : 'medium',
            reasoning: `Similar ao conteúdo que você já criou e gostou`,
            metadata: {
              basedOn: ['content_similarity'],
              category: content.category,
              estimatedValue: 8,
              timeToComplete: 20,
              difficulty: 'medium'
            },
            createdAt: new Date()
          });
        }
      }
    });

    return recommendations;
  }

  /**
   * Generate contextual recommendations
   */
  private async generateContextualRecommendations(userId: string): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];
    const userProfile = this.userProfiles.get(userId);
    
    if (!userProfile) return recommendations;

    // Time-based recommendations
    const timeOfDay = new Date().getHours();
    const dayOfWeek = new Date().getDay();
    
    // Morning recommendations
    if (timeOfDay >= 6 && timeOfDay <= 11) {
      recommendations.push({
        id: `morning_${Date.now()}`,
        type: 'action',
        title: 'Planeje seu conteúdo do dia',
        description: 'Comece o dia organizando suas ideias',
        confidence: 0.8,
        relevanceScore: 0.9,
        priority: 'high',
        reasoning: 'Baseado no seu padrão de uso matinal',
        metadata: {
          basedOn: ['time_context'],
          category: 'productivity',
          estimatedValue: 9,
          timeToComplete: 10,
          difficulty: 'easy'
        },
        createdAt: new Date()
      });
    }

    // Weekend recommendations
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      recommendations.push({
        id: `weekend_${Date.now()}`,
        type: 'feature',
        title: 'Explore novas funcionalidades',
        description: 'Experimente recursos que você ainda não usou',
        confidence: 0.7,
        relevanceScore: 0.8,
        priority: 'medium',
        reasoning: 'Finais de semana são ideais para explorar',
        metadata: {
          basedOn: ['weekend_context'],
          category: 'exploration',
          estimatedValue: 6,
          timeToComplete: 30,
          difficulty: 'easy'
        },
        createdAt: new Date()
      });
    }

    // Performance-based recommendations
    if (userProfile.performance.successRate < 0.5) {
      recommendations.push({
        id: `improve_${Date.now()}`,
        type: 'template',
        title: 'Use templates para melhorar resultados',
        description: 'Templates testados podem aumentar sua taxa de sucesso',
        confidence: 0.9,
        relevanceScore: 0.95,
        priority: 'high',
        reasoning: 'Sua taxa de sucesso pode ser melhorada com templates',
        metadata: {
          basedOn: ['performance_data'],
          category: 'improvement',
          estimatedValue: 10,
          timeToComplete: 5,
          difficulty: 'easy'
        },
        createdAt: new Date()
      });
    }

    // Collaboration recommendations
    if (userProfile.performance.collaborationRate < 0.3) {
      recommendations.push({
        id: `collab_${Date.now()}`,
        type: 'collaboration',
        title: 'Colabore com outros usuários',
        description: 'Trabalhe em equipe para criar conteúdo melhor',
        confidence: 0.85,
        relevanceScore: 0.8,
        priority: 'medium',
        reasoning: 'Colaboração pode melhorar a qualidade do seu conteúdo',
        metadata: {
          basedOn: ['collaboration_data'],
          category: 'social',
          estimatedValue: 8,
          timeToComplete: 45,
          difficulty: 'medium'
        },
        createdAt: new Date()
      });
    }

    return recommendations;
  }

  /**
   * Apply hybrid scoring to recommendations
   */
  private applyHybridScoring(recommendations: Recommendation[], userId: string): Recommendation[] {
    const userProfile = this.userProfiles.get(userId);
    if (!userProfile) return recommendations;

    return recommendations.map(rec => {
      // Base score from individual algorithms
      let score = rec.relevanceScore * rec.confidence;

      // Boost based on user preferences
      if (userProfile.preferences.contentTypes.includes(rec.type)) {
        score *= 1.2;
      }

      // Boost based on user goals
      if (rec.metadata.category === userProfile.goals.primary) {
        score *= 1.3;
      }

      // Boost based on priority
      switch (rec.priority) {
        case 'high':
          score *= 1.1;
          break;
        case 'low':
          score *= 0.9;
          break;
      }

      // Apply time decay for older recommendations
      const age = Date.now() - rec.createdAt.getTime();
      const daysSinceCreated = age / (1000 * 60 * 60 * 24);
      if (daysSinceCreated > 1) {
        score *= Math.exp(-daysSinceCreated * 0.1);
      }

      return {
        ...rec,
        relevanceScore: Math.min(1, score)
      };
    });
  }

  /**
   * Find similar users based on behavior and preferences
   */
  private findSimilarUsers(userId: string, limit: number = 5): { userId: string; similarity: number }[] {
    const userProfile = this.userProfiles.get(userId);
    if (!userProfile) return [];

    const similarities: { userId: string; similarity: number }[] = [];

    this.userProfiles.forEach((profile, otherUserId) => {
      if (otherUserId !== userId) {
        const similarity = this.calculateUserSimilarity(userProfile, profile);
        similarities.push({ userId: otherUserId, similarity });
      }
    });

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  /**
   * Calculate user similarity
   */
  private calculateUserSimilarity(profile1: UserProfile, profile2: UserProfile): number {
    // Calculate similarity based on preferences
    const prefSimilarity = this.calculatePreferenceSimilarity(profile1.preferences, profile2.preferences);
    
    // Calculate similarity based on behavior
    const behaviorSimilarity = this.calculateBehaviorSimilarity(profile1.behavior, profile2.behavior);
    
    // Calculate similarity based on goals
    const goalSimilarity = this.calculateGoalSimilarity(profile1.goals, profile2.goals);

    // Weighted average
    return (prefSimilarity * 0.4 + behaviorSimilarity * 0.4 + goalSimilarity * 0.2);
  }

  /**
   * Calculate preference similarity
   */
  private calculatePreferenceSimilarity(pref1: UserProfile['preferences'], pref2: UserProfile['preferences']): number {
    const contentTypeSimilarity = this.calculateArraySimilarity(pref1.contentTypes, pref2.contentTypes);
    const platformSimilarity = this.calculateArraySimilarity(pref1.platforms, pref2.platforms);
    const topicSimilarity = this.calculateArraySimilarity(pref1.topics, pref2.topics);
    
    return (contentTypeSimilarity + platformSimilarity + topicSimilarity) / 3;
  }

  /**
   * Calculate behavior similarity
   */
  private calculateBehaviorSimilarity(behavior1: UserProfile['behavior'], behavior2: UserProfile['behavior']): number {
    const sessionDiff = Math.abs(behavior1.sessionDuration - behavior2.sessionDuration);
    const sessionSimilarity = 1 - (sessionDiff / Math.max(behavior1.sessionDuration, behavior2.sessionDuration));
    
    const featureSimilarity = this.calculateArraySimilarity(behavior1.mostUsedFeatures, behavior2.mostUsedFeatures);
    
    return (sessionSimilarity + featureSimilarity) / 2;
  }

  /**
   * Calculate goal similarity
   */
  private calculateGoalSimilarity(goals1: UserProfile['goals'], goals2: UserProfile['goals']): number {
    const primaryMatch = goals1.primary === goals2.primary ? 1 : 0;
    const secondaryMatch = this.calculateArraySimilarity(goals1.secondary, goals2.secondary);
    
    return (primaryMatch * 0.7 + secondaryMatch * 0.3);
  }

  /**
   * Calculate array similarity (Jaccard similarity)
   */
  private calculateArraySimilarity(arr1: string[], arr2: string[]): number {
    const set1 = new Set(arr1);
    const set2 = new Set(arr2);
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return union.size === 0 ? 0 : intersection.size / union.size;
  }

  /**
   * Calculate content similarity
   */
  private calculateContentSimilarity(userContent: ContentItem[], targetContent: ContentItem): number {
    if (userContent.length === 0) return 0;

    const similarities = userContent.map(content => {
      // Category similarity
      const categoryMatch = content.category === targetContent.category ? 1 : 0;
      
      // Tag similarity
      const tagSimilarity = this.calculateArraySimilarity(content.tags, targetContent.tags);
      
      // Content similarity (simple keyword matching)
      const contentSimilarity = this.calculateTextSimilarity(content.content, targetContent.content);
      
      return (categoryMatch * 0.4 + tagSimilarity * 0.4 + contentSimilarity * 0.2);
    });

    return Math.max(...similarities);
  }

  /**
   * Calculate text similarity
   */
  private calculateTextSimilarity(text1: string, text2: string): number {
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    
    return this.calculateArraySimilarity(words1, words2);
  }

  /**
   * Calculate content relevance to user
   */
  private calculateContentRelevance(content: ContentItem, userProfile: UserProfile): number {
    let relevance = 0.5; // Base relevance

    // Category preference
    if (userProfile.preferences.contentTypes.includes(content.category)) {
      relevance += 0.3;
    }

    // Topic preference
    const topicMatch = content.tags.some(tag => userProfile.preferences.topics.includes(tag));
    if (topicMatch) {
      relevance += 0.2;
    }

    // Performance-based relevance
    const performanceScore = (content.performance.likes + content.performance.shares) / 
                           Math.max(1, content.performance.views);
    relevance += performanceScore * 0.1;

    return Math.min(1, relevance);
  }

  /**
   * Remove duplicate recommendations
   */
  private removeDuplicates(recommendations: Recommendation[]): Recommendation[] {
    const seen = new Set();
    return recommendations.filter(rec => {
      const key = `${rec.type}_${rec.title}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  /**
   * Update user profile based on recent activity
   */
  private async updateUserProfile(userId: string): Promise<void> {
    // Get user interactions
    const interactions = this.userInteractions.get(userId) || [];
    
    // Update profile based on interactions
    const profile = this.userProfiles.get(userId);
    if (profile && interactions.length > 0) {
      // Update preferences based on recent interactions
      // This would analyze recent behavior and update preferences accordingly
      console.log(`📊 Updated profile for user ${userId}`);
    }
  }

  /**
   * Get user content
   */
  private getUserContent(userId: string): ContentItem[] {
    return Array.from(this.contentItems.values())
      .filter(item => item.userId === userId);
  }

  /**
   * Check if user has seen content
   */
  private hasUserSeenContent(userId: string, contentId: string): boolean {
    const interactions = this.userInteractions.get(userId) || [];
    return interactions.some(interaction => interaction.contentId === contentId);
  }

  /**
   * Calculate user similarities for collaborative filtering
   */
  private calculateUserSimilarities(): void {
    const userIds = Array.from(this.userProfiles.keys());
    
    userIds.forEach(userId1 => {
      const similarities = new Map<string, number>();
      
      userIds.forEach(userId2 => {
        if (userId1 !== userId2) {
          const profile1 = this.userProfiles.get(userId1)!;
          const profile2 = this.userProfiles.get(userId2)!;
          const similarity = this.calculateUserSimilarity(profile1, profile2);
          similarities.set(userId2, similarity);
        }
      });
      
      this.similarityMatrix.set(userId1, similarities);
    });
  }

  /**
   * Update recommendations periodically
   */
  private updateRecommendations(): void {
    console.log('🔄 Updating personalized recommendations...');
    
    // Update similarity matrix
    this.calculateUserSimilarities();
    
    // Clear old recommendations
    this.recommendations.clear();
    
    console.log('✅ Recommendations updated successfully');
  }

  /**
   * Load data from storage
   */
  private loadFromStorage(): void {
    try {
      const storedProfiles = localStorage.getItem('userProfiles');
      if (storedProfiles) {
        const profiles = JSON.parse(storedProfiles);
        this.userProfiles = new Map(profiles);
      }

      const storedContent = localStorage.getItem('contentItems');
      if (storedContent) {
        const content = JSON.parse(storedContent);
        this.contentItems = new Map(content);
      }

      const storedInteractions = localStorage.getItem('userInteractions');
      if (storedInteractions) {
        const interactions = JSON.parse(storedInteractions);
        this.userInteractions = new Map(interactions);
      }
    } catch (error) {
      console.error('Error loading recommendation data:', error);
    }
  }

  /**
   * Save data to storage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem('userProfiles', JSON.stringify(Array.from(this.userProfiles.entries())));
      localStorage.setItem('contentItems', JSON.stringify(Array.from(this.contentItems.entries())));
      localStorage.setItem('userInteractions', JSON.stringify(Array.from(this.userInteractions.entries())));
    } catch (error) {
      console.error('Error saving recommendation data:', error);
    }
  }
}

// Additional interfaces for collaborative filtering
interface CollaborativeFilter {
  generateRecommendations(userId: string): Promise<Recommendation[]>;
}

interface ContentBasedFilter {
  generateRecommendations(userId: string): Promise<Recommendation[]>;
}

interface HybridFilter {
  combineRecommendations(recommendations: Recommendation[]): Recommendation[];
}

interface ContextualFilter {
  generateContextualRecommendations(userId: string): Promise<Recommendation[]>;
}

export default PersonalizedRecommendationService; 