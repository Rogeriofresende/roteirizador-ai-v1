/**
 * Script Entity - Domain Layer
 * Roteirar IA - Clean Architecture Implementation
 */

export interface ScriptProps {
  id: string;
  userId: string;
  title: string;
  content: string;
  platform: PlatformType;
  format: FormatType;
  objective: string;
  targetAudience: string;
  tone: string;
  duration: number;
  tags: string[];
  isPublic: boolean;
  status: ScriptStatus;
  version: number;
  wordCount: number;
  estimatedDuration: number;
  viewCount: number;
  editCount: number;
  isShared: boolean;
  shareLink?: string;
  sharedAt?: Date;
  originalPrompt?: string;
  aiModelUsed?: string;
  generationTime?: number;
  metadata: ScriptMetadata;
  createdAt: Date;
  updatedAt: Date;
  lastEditedAt?: Date;
}

export type PlatformType = 'YouTube' | 'Instagram' | 'TikTok' | 'LinkedIn' | 'Twitter' | 'Podcast' | 'Facebook';
export type FormatType = 'tutorial' | 'review' | 'entertainment' | 'educational' | 'marketing' | 'news' | 'storytelling';
export type ScriptStatus = 'draft' | 'published' | 'archived' | 'deleted';

export interface ScriptMetadata {
  fromTemplate?: string;
  templateTitle?: string;
  processedAt?: Date;
  aiGenerated: boolean;
  qualityScore?: number;
  readabilityScore?: number;
  engagementPrediction?: number;
  keywords: string[];
}

/**
 * Script Entity - Core business logic for script management
 */
export class Script {
  private constructor(private props: ScriptProps) {}

  // Factory methods
  static create(params: {
    userId: string;
    title: string;
    content: string;
    platform: PlatformType;
    format: FormatType;
    objective: string;
    targetAudience: string;
    tone: string;
    tags?: string[];
    originalPrompt?: string;
    aiModelUsed?: string;
    generationTime?: number;
    fromTemplate?: string;
  }): Script {
    const content = params.content || '';
    const wordCount = this.calculateWordCount(content);
    const estimatedDuration = this.estimateDuration(content, params.platform);

    return new Script({
      id: this.generateScriptId(),
      userId: params.userId,
      title: params.title,
      content,
      platform: params.platform,
      format: params.format,
      objective: params.objective,
      targetAudience: params.targetAudience,
      tone: params.tone,
      duration: estimatedDuration,
      tags: params.tags || [],
      isPublic: false,
      status: 'draft',
      version: 1,
      wordCount,
      estimatedDuration,
      viewCount: 0,
      editCount: 0,
      isShared: false,
      originalPrompt: params.originalPrompt,
      aiModelUsed: params.aiModelUsed,
      generationTime: params.generationTime,
      metadata: {
        fromTemplate: params.fromTemplate,
        aiGenerated: !!params.aiModelUsed,
        keywords: this.extractKeywords(content),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static fromPersistence(props: ScriptProps): Script {
    return new Script(props);
  }

  // Getters
  get id(): string { return this.props.id; }
  get userId(): string { return this.props.userId; }
  get title(): string { return this.props.title; }
  get content(): string { return this.props.content; }
  get platform(): PlatformType { return this.props.platform; }
  get format(): FormatType { return this.props.format; }
  get objective(): string { return this.props.objective; }
  get targetAudience(): string { return this.props.targetAudience; }
  get tone(): string { return this.props.tone; }
  get duration(): number { return this.props.duration; }
  get tags(): string[] { return this.props.tags; }
  get isPublic(): boolean { return this.props.isPublic; }
  get status(): ScriptStatus { return this.props.status; }
  get version(): number { return this.props.version; }
  get wordCount(): number { return this.props.wordCount; }
  get estimatedDuration(): number { return this.props.estimatedDuration; }
  get viewCount(): number { return this.props.viewCount; }
  get editCount(): number { return this.props.editCount; }
  get isShared(): boolean { return this.props.isShared; }
  get shareLink(): string | undefined { return this.props.shareLink; }
  get sharedAt(): Date | undefined { return this.props.sharedAt; }
  get originalPrompt(): string | undefined { return this.props.originalPrompt; }
  get aiModelUsed(): string | undefined { return this.props.aiModelUsed; }
  get generationTime(): number | undefined { return this.props.generationTime; }
  get metadata(): ScriptMetadata { return this.props.metadata; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }
  get lastEditedAt(): Date | undefined { return this.props.lastEditedAt; }

  // Domain methods - Business Rules

  /**
   * Update script content
   */
  updateContent(newContent: string): void {
    if (!newContent.trim()) {
      throw new Error('Script content cannot be empty');
    }

    this.props.content = newContent;
    this.props.wordCount = Script.calculateWordCount(newContent);
    this.props.estimatedDuration = Script.estimateDuration(newContent, this.props.platform);
    this.props.metadata.keywords = Script.extractKeywords(newContent);
    this.props.editCount += 1;
    this.props.lastEditedAt = new Date();
    this.props.updatedAt = new Date();
    this.incrementVersion();
  }

  /**
   * Update script title
   */
  updateTitle(newTitle: string): void {
    if (!newTitle.trim()) {
      throw new Error('Script title cannot be empty');
    }

    if (newTitle.length > 100) {
      throw new Error('Script title cannot exceed 100 characters');
    }

    this.props.title = newTitle.trim();
    this.props.updatedAt = new Date();
  }

  /**
   * Add tag to script
   */
  addTag(tag: string): void {
    const normalizedTag = tag.toLowerCase().trim();
    
    if (!normalizedTag) {
      throw new Error('Tag cannot be empty');
    }

    if (this.props.tags.length >= 10) {
      throw new Error('Cannot add more than 10 tags');
    }

    if (!this.props.tags.includes(normalizedTag)) {
      this.props.tags.push(normalizedTag);
      this.props.updatedAt = new Date();
    }
  }

  /**
   * Remove tag from script
   */
  removeTag(tag: string): void {
    const normalizedTag = tag.toLowerCase().trim();
    const index = this.props.tags.indexOf(normalizedTag);
    
    if (index > -1) {
      this.props.tags.splice(index, 1);
      this.props.updatedAt = new Date();
    }
  }

  /**
   * Publish script
   */
  publish(): void {
    if (this.props.status === 'published') {
      throw new Error('Script is already published');
    }

    if (this.props.content.trim().length < 50) {
      throw new Error('Script content is too short to publish (minimum 50 characters)');
    }

    this.props.status = 'published';
    this.props.isPublic = true;
    this.props.updatedAt = new Date();
  }

  /**
   * Archive script
   */
  archive(): void {
    if (this.props.status === 'archived') {
      throw new Error('Script is already archived');
    }

    this.props.status = 'archived';
    this.props.isPublic = false;
    this.props.updatedAt = new Date();
  }

  /**
   * Mark script as deleted (soft delete)
   */
  markAsDeleted(): void {
    this.props.status = 'deleted';
    this.props.isPublic = false;
    this.props.isShared = false;
    this.props.shareLink = undefined;
    this.props.updatedAt = new Date();
  }

  /**
   * Share script
   */
  share(): void {
    if (this.props.status === 'deleted') {
      throw new Error('Cannot share deleted script');
    }

    if (this.props.content.trim().length < 50) {
      throw new Error('Script content is too short to share');
    }

    this.props.isShared = true;
    this.props.shareLink = this.generateShareLink();
    this.props.sharedAt = new Date();
    this.props.updatedAt = new Date();
  }

  /**
   * Unshare script
   */
  unshare(): void {
    this.props.isShared = false;
    this.props.shareLink = undefined;
    this.props.sharedAt = undefined;
    this.props.updatedAt = new Date();
  }

  /**
   * Increment view count
   */
  incrementViewCount(): void {
    this.props.viewCount += 1;
  }

  /**
   * Update quality score
   */
  updateQualityScore(score: number): void {
    if (score < 0 || score > 100) {
      throw new Error('Quality score must be between 0 and 100');
    }

    this.props.metadata.qualityScore = score;
    this.props.updatedAt = new Date();
  }

  /**
   * Update readability score
   */
  updateReadabilityScore(score: number): void {
    if (score < 0 || score > 100) {
      throw new Error('Readability score must be between 0 and 100');
    }

    this.props.metadata.readabilityScore = score;
    this.props.updatedAt = new Date();
  }

  /**
   * Update engagement prediction
   */
  updateEngagementPrediction(prediction: number): void {
    if (prediction < 0 || prediction > 100) {
      throw new Error('Engagement prediction must be between 0 and 100');
    }

    this.props.metadata.engagementPrediction = prediction;
    this.props.updatedAt = new Date();
  }

  /**
   * Check if script can be edited by user
   */
  canBeEditedBy(userId: string): boolean {
    return this.props.userId === userId && this.props.status !== 'deleted';
  }

  /**
   * Check if script can be viewed by user
   */
  canBeViewedBy(userId: string): boolean {
    // Owner can always view
    if (this.props.userId === userId) {
      return true;
    }

    // Public scripts can be viewed by anyone
    if (this.props.isPublic && this.props.status === 'published') {
      return true;
    }

    // Shared scripts can be viewed with link
    if (this.props.isShared && this.props.status !== 'deleted') {
      return true;
    }

    return false;
  }

  /**
   * Get platform-specific constraints
   */
  getPlatformConstraints(): {
    maxDuration: number;
    recommendedLength: { min: number; max: number };
    preferredFormats: FormatType[];
  } {
    switch (this.props.platform) {
      case 'YouTube':
        return {
          maxDuration: 3600, // 1 hour
          recommendedLength: { min: 300, max: 1200 }, // 5-20 minutes
          preferredFormats: ['tutorial', 'review', 'entertainment', 'educational']
        };
      case 'Instagram':
        return {
          maxDuration: 60, // 1 minute for reels
          recommendedLength: { min: 15, max: 60 },
          preferredFormats: ['entertainment', 'marketing', 'storytelling']
        };
      case 'TikTok':
        return {
          maxDuration: 180, // 3 minutes
          recommendedLength: { min: 15, max: 60 },
          preferredFormats: ['entertainment', 'educational', 'tutorial']
        };
      case 'LinkedIn':
        return {
          maxDuration: 600, // 10 minutes
          recommendedLength: { min: 60, max: 300 },
          preferredFormats: ['educational', 'news', 'marketing']
        };
      case 'Podcast':
        return {
          maxDuration: 7200, // 2 hours
          recommendedLength: { min: 900, max: 3600 }, // 15-60 minutes
          preferredFormats: ['educational', 'entertainment', 'news', 'storytelling']
        };
      default:
        return {
          maxDuration: 1800, // 30 minutes
          recommendedLength: { min: 60, max: 600 },
          preferredFormats: ['tutorial', 'review', 'educational']
        };
    }
  }

  /**
   * Increment version
   */
  private incrementVersion(): void {
    this.props.version += 1;
  }

  /**
   * Generate share link
   */
  private generateShareLink(): string {
    return `https://roteirar.ai/scripts/shared/${this.props.id}`;
  }

  /**
   * Get script for persistence
   */
  toPersistence(): ScriptProps {
    return { ...this.props };
  }

  // Static utility methods

  /**
   * Generate unique script ID
   */
  private static generateScriptId(): string {
    return `script_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Calculate word count
   */
  static calculateWordCount(content: string): number {
    return content.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Estimate duration based on content and platform
   */
  static estimateDuration(content: string, platform: PlatformType): number {
    const wordCount = this.calculateWordCount(content);
    let wordsPerMinute = 150; // Default speaking rate

    // Adjust speaking rate by platform
    switch (platform) {
      case 'TikTok':
      case 'Instagram':
        wordsPerMinute = 180; // Faster for short-form content
        break;
      case 'Podcast':
        wordsPerMinute = 130; // Slower for conversational content
        break;
      case 'LinkedIn':
        wordsPerMinute = 140; // Professional, slightly slower
        break;
    }

    return Math.ceil((wordCount / wordsPerMinute) * 60); // Return duration in seconds
  }

  /**
   * Extract keywords from content
   */
  static extractKeywords(content: string): string[] {
    // Simple keyword extraction - in a real app, you'd use more sophisticated NLP
    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);

    // Get word frequency
    const wordCount: Record<string, number> = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    // Return top 10 most frequent words
    return Object.entries(wordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  /**
   * Validate script content for platform
   */
  static validateForPlatform(content: string, platform: PlatformType): {
    isValid: boolean;
    warnings: string[];
    suggestions: string[];
  } {
    const warnings: string[] = [];
    const suggestions: string[] = [];
    const duration = this.estimateDuration(content, platform);
    const constraints = new Script({
      id: '', userId: '', title: '', content, platform,
      format: 'tutorial', objective: '', targetAudience: '', tone: '',
      duration: 0, tags: [], isPublic: false, status: 'draft',
      version: 1, wordCount: 0, estimatedDuration: 0, viewCount: 0,
      editCount: 0, isShared: false, metadata: { aiGenerated: false, keywords: [] },
      createdAt: new Date(), updatedAt: new Date()
    } as ScriptProps).getPlatformConstraints();

    if (duration > constraints.maxDuration) {
      warnings.push(`Content is too long for ${platform} (${duration}s > ${constraints.maxDuration}s)`);
      suggestions.push(`Consider splitting into multiple parts or reducing content`);
    }

    if (duration < constraints.recommendedLength.min) {
      warnings.push(`Content might be too short for ${platform} (${duration}s < ${constraints.recommendedLength.min}s)`);
      suggestions.push(`Consider adding more details or examples`);
    }

    if (duration > constraints.recommendedLength.max) {
      warnings.push(`Content might be too long for optimal engagement (${duration}s > ${constraints.recommendedLength.max}s)`);
      suggestions.push(`Consider focusing on key points for better retention`);
    }

    return {
      isValid: warnings.length === 0,
      warnings,
      suggestions
    };
  }
} 