/**
 * TemplateMetadata Value Object - Domain Layer
 * Roteirar IA - Clean Architecture Implementation
 */

import { TemplateCategory, TemplateDifficulty } from '../entities/Template';
import { PlatformType } from '../entities/Script';

export interface TemplateMetadataProps {
  category: TemplateCategory;
  platforms: PlatformType[];
  difficulty: TemplateDifficulty;
  language: string;
  targetAudience: string[];
  businessGoals: string[];
  keywords: string[];
  estimatedUsageTime: number; // in minutes
  requiredSkillLevel: SkillLevel;
  industryFocus: string[];
  seoOptimized: boolean;
  accessibilityCompliant: boolean;
  conversionOptimized: boolean;
  lastOptimized?: Date;
}

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

/**
 * TemplateMetadata Value Object - Immutable template metadata with business rules
 */
export class TemplateMetadata {
  private constructor(private readonly props: TemplateMetadataProps) {
    this.validate();
  }

  static create(params: {
    category: TemplateCategory;
    platforms: PlatformType[];
    difficulty: TemplateDifficulty;
    language?: string;
    targetAudience?: string[];
    businessGoals?: string[];
    keywords?: string[];
    estimatedUsageTime?: number;
    requiredSkillLevel?: SkillLevel;
    industryFocus?: string[];
    seoOptimized?: boolean;
    accessibilityCompliant?: boolean;
    conversionOptimized?: boolean;
  }): TemplateMetadata {
    return new TemplateMetadata({
      category: params.category,
      platforms: params.platforms,
      difficulty: params.difficulty,
      language: params.language || 'pt-BR',
      targetAudience: params.targetAudience || [],
      businessGoals: params.businessGoals || [],
      keywords: params.keywords || [],
      estimatedUsageTime: params.estimatedUsageTime || 10,
      requiredSkillLevel: params.requiredSkillLevel || params.difficulty as SkillLevel,
      industryFocus: params.industryFocus || [],
      seoOptimized: params.seoOptimized || false,
      accessibilityCompliant: params.accessibilityCompliant || false,
      conversionOptimized: params.conversionOptimized || false,
    });
  }

  static fromPersistence(props: TemplateMetadataProps): TemplateMetadata {
    return new TemplateMetadata(props);
  }

  // Getters
  get category(): TemplateCategory { return this.props.category; }
  get platforms(): PlatformType[] { return [...this.props.platforms]; }
  get difficulty(): TemplateDifficulty { return this.props.difficulty; }
  get language(): string { return this.props.language; }
  get targetAudience(): string[] { return [...this.props.targetAudience]; }
  get businessGoals(): string[] { return [...this.props.businessGoals]; }
  get keywords(): string[] { return [...this.props.keywords]; }
  get estimatedUsageTime(): number { return this.props.estimatedUsageTime; }
  get requiredSkillLevel(): SkillLevel { return this.props.requiredSkillLevel; }
  get industryFocus(): string[] { return [...this.props.industryFocus]; }
  get seoOptimized(): boolean { return this.props.seoOptimized; }
  get accessibilityCompliant(): boolean { return this.props.accessibilityCompliant; }
  get conversionOptimized(): boolean { return this.props.conversionOptimized; }
  get lastOptimized(): Date | undefined { return this.props.lastOptimized; }

  // Domain methods

  /**
   * Check if template is suitable for platform
   */
  isSuitableForPlatform(platform: PlatformType): boolean {
    return this.props.platforms.includes(platform);
  }

  /**
   * Check if template matches user skill level
   */
  matchesSkillLevel(userSkillLevel: SkillLevel): boolean {
    const skillLevels: SkillLevel[] = ['beginner', 'intermediate', 'advanced', 'expert'];
    const userLevel = skillLevels.indexOf(userSkillLevel);
    const requiredLevel = skillLevels.indexOf(this.props.requiredSkillLevel);
    
    return userLevel >= requiredLevel;
  }

  /**
   * Check if template targets specific audience
   */
  targetsAudience(audience: string): boolean {
    return this.props.targetAudience.some(target => 
      target.toLowerCase().includes(audience.toLowerCase())
    );
  }

  /**
   * Check if template supports business goal
   */
  supportsBusinessGoal(goal: string): boolean {
    return this.props.businessGoals.some(templateGoal => 
      templateGoal.toLowerCase().includes(goal.toLowerCase())
    );
  }

  /**
   * Get compatibility score with user requirements
   */
  getCompatibilityScore(requirements: TemplateRequirements): CompatibilityScore {
    let score = 0;
    const factors: string[] = [];

    // Platform compatibility (40 points)
    if (requirements.platform && this.isSuitableForPlatform(requirements.platform)) {
      score += 40;
      factors.push(`Compatible with ${requirements.platform}`);
    }

    // Skill level match (20 points)
    if (requirements.skillLevel && this.matchesSkillLevel(requirements.skillLevel)) {
      score += 20;
      factors.push(`Matches ${requirements.skillLevel} skill level`);
    }

    // Target audience match (20 points)
    if (requirements.targetAudience) {
      const audienceMatch = this.props.targetAudience.some(target =>
        target.toLowerCase().includes(requirements.targetAudience!.toLowerCase())
      );
      if (audienceMatch) {
        score += 20;
        factors.push('Matches target audience');
      }
    }

    // Business goal alignment (10 points)
    if (requirements.businessGoal && this.supportsBusinessGoal(requirements.businessGoal)) {
      score += 10;
      factors.push('Supports business goal');
    }

    // Industry focus (5 points)
    if (requirements.industry) {
      const industryMatch = this.props.industryFocus.some(industry =>
        industry.toLowerCase().includes(requirements.industry!.toLowerCase())
      );
      if (industryMatch) {
        score += 5;
        factors.push('Industry focused');
      }
    }

    // Quality bonuses (5 points each)
    if (this.props.seoOptimized) {
      score += 5;
      factors.push('SEO optimized');
    }

    return {
      score: Math.min(score, 100),
      level: this.getCompatibilityLevel(score),
      factors,
      estimatedSetupTime: this.calculateSetupTime(requirements),
    };
  }

  /**
   * Get quality assessment
   */
  getQualityAssessment(): QualityAssessment {
    let score = 0;
    const strengths: string[] = [];
    const improvementAreas: string[] = [];

    // SEO optimization
    if (this.props.seoOptimized) {
      score += 25;
      strengths.push('SEO optimized');
    } else {
      improvementAreas.push('Add SEO optimization');
    }

    // Accessibility compliance
    if (this.props.accessibilityCompliant) {
      score += 25;
      strengths.push('Accessibility compliant');
    } else {
      improvementAreas.push('Improve accessibility compliance');
    }

    // Conversion optimization
    if (this.props.conversionOptimized) {
      score += 25;
      strengths.push('Conversion optimized');
    } else {
      improvementAreas.push('Add conversion optimization');
    }

    // Platform coverage
    const platformCoverage = this.props.platforms.length / 7; // 7 total platforms
    score += platformCoverage * 15;
    if (platformCoverage > 0.5) {
      strengths.push('Good platform coverage');
    } else {
      improvementAreas.push('Expand platform support');
    }

    // Keywords coverage
    if (this.props.keywords.length >= 5) {
      score += 10;
      strengths.push('Good keyword coverage');
    } else {
      improvementAreas.push('Add more relevant keywords');
    }

    return {
      score: Math.round(score),
      level: this.getQualityLevel(score),
      strengths,
      improvementAreas,
      lastAssessed: new Date(),
    };
  }

  /**
   * Add optimization
   */
  withOptimization(type: OptimizationType): TemplateMetadata {
    const updates: Partial<TemplateMetadataProps> = {
      lastOptimized: new Date(),
    };

    switch (type) {
      case 'seo':
        updates.seoOptimized = true;
        break;
      case 'accessibility':
        updates.accessibilityCompliant = true;
        break;
      case 'conversion':
        updates.conversionOptimized = true;
        break;
    }

    return new TemplateMetadata({
      ...this.props,
      ...updates,
    });
  }

  /**
   * Add keyword
   */
  withKeyword(keyword: string): TemplateMetadata {
    const normalizedKeyword = keyword.toLowerCase().trim();
    
    if (this.props.keywords.includes(normalizedKeyword)) {
      return this;
    }

    if (this.props.keywords.length >= 20) {
      throw new Error('Cannot add more than 20 keywords');
    }

    return new TemplateMetadata({
      ...this.props,
      keywords: [...this.props.keywords, normalizedKeyword],
    });
  }

  /**
   * Add target audience
   */
  withTargetAudience(audience: string): TemplateMetadata {
    const normalizedAudience = audience.trim();
    
    if (this.props.targetAudience.includes(normalizedAudience)) {
      return this;
    }

    if (this.props.targetAudience.length >= 10) {
      throw new Error('Cannot add more than 10 target audiences');
    }

    return new TemplateMetadata({
      ...this.props,
      targetAudience: [...this.props.targetAudience, normalizedAudience],
    });
  }

  /**
   * Update for platform
   */
  forPlatform(platform: PlatformType): TemplateMetadata {
    if (this.props.platforms.includes(platform)) {
      return this;
    }

    return new TemplateMetadata({
      ...this.props,
      platforms: [...this.props.platforms, platform],
    });
  }

  /**
   * Equals comparison
   */
  equals(other: TemplateMetadata): boolean {
    return (
      this.props.category === other.props.category &&
      JSON.stringify(this.props.platforms.sort()) === JSON.stringify(other.props.platforms.sort()) &&
      this.props.difficulty === other.props.difficulty &&
      this.props.language === other.props.language
    );
  }

  /**
   * Get for persistence
   */
  toPersistence(): TemplateMetadataProps {
    return { ...this.props };
  }

  // Private methods

  private validate(): void {
    if (!this.props.category) {
      throw new Error('Category is required');
    }

    if (!this.props.platforms || this.props.platforms.length === 0) {
      throw new Error('At least one platform is required');
    }

    if (!this.props.difficulty) {
      throw new Error('Difficulty is required');
    }

    if (!this.props.language) {
      throw new Error('Language is required');
    }

    if (this.props.estimatedUsageTime < 1 || this.props.estimatedUsageTime > 480) {
      throw new Error('Estimated usage time must be between 1 and 480 minutes');
    }
  }

  private getCompatibilityLevel(score: number): CompatibilityLevel {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
  }

  private getQualityLevel(score: number): QualityLevel {
    if (score >= 80) return 'premium';
    if (score >= 60) return 'standard';
    if (score >= 40) return 'basic';
    return 'needs-improvement';
  }

  private calculateSetupTime(requirements: TemplateRequirements): number {
    let baseTime = this.props.estimatedUsageTime;

    // Adjust based on skill level match
    if (requirements.skillLevel) {
      const skillLevels: SkillLevel[] = ['beginner', 'intermediate', 'advanced', 'expert'];
      const userLevel = skillLevels.indexOf(requirements.skillLevel);
      const requiredLevel = skillLevels.indexOf(this.props.requiredSkillLevel);
      
      if (userLevel < requiredLevel) {
        baseTime *= 1.5; // Takes longer if skill gap
      } else if (userLevel > requiredLevel) {
        baseTime *= 0.8; // Faster if overqualified
      }
    }

    return Math.round(baseTime);
  }
}

// Supporting types

export interface TemplateRequirements {
  platform?: PlatformType;
  skillLevel?: SkillLevel;
  targetAudience?: string;
  businessGoal?: string;
  industry?: string;
}

export interface CompatibilityScore {
  score: number;
  level: CompatibilityLevel;
  factors: string[];
  estimatedSetupTime: number;
}

export type CompatibilityLevel = 'excellent' | 'good' | 'fair' | 'poor';

export interface QualityAssessment {
  score: number;
  level: QualityLevel;
  strengths: string[];
  improvementAreas: string[];
  lastAssessed: Date;
}

export type QualityLevel = 'premium' | 'standard' | 'basic' | 'needs-improvement';
export type OptimizationType = 'seo' | 'accessibility' | 'conversion'; 