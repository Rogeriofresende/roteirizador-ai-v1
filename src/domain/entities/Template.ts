/**
 * Template Entity - Domain Layer
 * Roteirar IA - Clean Architecture Implementation
 */

import { PlatformType, FormatType } from './Script';

export interface TemplateProps {
  id: string;
  title: string;
  description: string;
  category: TemplateCategory;
  platform: PlatformType[];
  format: FormatType[];
  difficulty: TemplateDifficulty;
  structure: TemplateSection[];
  placeholders: TemplatePlaceholder[];
  examples: string[];
  tags: string[];
  duration: TemplateDuration;
  popularity: number;
  usage: number;
  rating: number;
  ratingCount: number;
  author: TemplateAuthor;
  isPremium: boolean;
  isPublic: boolean;
  isSystem: boolean;
  isVerified: boolean;
  metadata: TemplateMetadata;
  createdAt: Date;
  updatedAt: Date;
  lastUsedAt?: Date;
}

export type TemplateCategory = 'tutorial' | 'marketing' | 'entertainment' | 'educational' | 'news' | 'review' | 'storytelling' | 'business';
export type TemplateDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface TemplateDuration {
  min: number;
  max: number;
}

export interface TemplateSection {
  id: string;
  title: string;
  description?: string;
  content: string;
  order: number;
  duration: number;
  isRequired: boolean;
  suggestions?: string[];
}

export interface TemplatePlaceholder {
  id: string;
  name: string;
  description: string;
  type: PlaceholderType;
  defaultValue?: string;
  options?: string[];
  validation: PlaceholderValidation;
}

export type PlaceholderType = 'text' | 'textarea' | 'number' | 'select' | 'multiselect' | 'date' | 'url' | 'email';

export interface PlaceholderValidation {
  required: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  customMessage?: string;
}

export interface TemplateAuthor {
  id: string;
  name: string;
  verified: boolean;
  avatar?: string;
}

export interface TemplateMetadata {
  version: number;
  language: string;
  targetAudience: string[];
  businessGoals: string[];
  seoOptimized: boolean;
  accessibilityCompliant: boolean;
  conversionOptimized: boolean;
}

/**
 * Template Entity - Core business logic for template management
 */
export class Template {
  private constructor(private props: TemplateProps) {}

  // Factory methods
  static create(params: {
    title: string;
    description: string;
    category: TemplateCategory;
    platform: PlatformType[];
    format: FormatType[];
    difficulty: TemplateDifficulty;
    structure: Omit<TemplateSection, 'id'>[];
    placeholders: TemplatePlaceholder[];
    examples?: string[];
    tags?: string[];
    duration: TemplateDuration;
    authorId: string;
    authorName: string;
    isPremium?: boolean;
    isPublic?: boolean;
  }): Template {
    return new Template({
      id: this.generateTemplateId(),
      title: params.title,
      description: params.description,
      category: params.category,
      platform: params.platform,
      format: params.format,
      difficulty: params.difficulty,
      structure: params.structure.map((section, index) => ({
        ...section,
        id: `section_${index + 1}`,
        order: index + 1,
      })),
      placeholders: params.placeholders,
      examples: params.examples || [],
      tags: params.tags || [],
      duration: params.duration,
      popularity: 0,
      usage: 0,
      rating: 0,
      ratingCount: 0,
      author: {
        id: params.authorId,
        name: params.authorName,
        verified: false,
      },
      isPremium: params.isPremium || false,
      isPublic: params.isPublic || false,
      isSystem: false,
      isVerified: false,
      metadata: {
        version: 1,
        language: 'pt-BR',
        targetAudience: [],
        businessGoals: [],
        seoOptimized: false,
        accessibilityCompliant: false,
        conversionOptimized: false,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static fromPersistence(props: TemplateProps): Template {
    return new Template(props);
  }

  // Getters
  get id(): string { return this.props.id; }
  get title(): string { return this.props.title; }
  get description(): string { return this.props.description; }
  get category(): TemplateCategory { return this.props.category; }
  get platform(): PlatformType[] { return this.props.platform; }
  get format(): FormatType[] { return this.props.format; }
  get difficulty(): TemplateDifficulty { return this.props.difficulty; }
  get structure(): TemplateSection[] { return this.props.structure; }
  get placeholders(): TemplatePlaceholder[] { return this.props.placeholders; }
  get examples(): string[] { return this.props.examples; }
  get tags(): string[] { return this.props.tags; }
  get duration(): TemplateDuration { return this.props.duration; }
  get popularity(): number { return this.props.popularity; }
  get usage(): number { return this.props.usage; }
  get rating(): number { return this.props.rating; }
  get ratingCount(): number { return this.props.ratingCount; }
  get author(): TemplateAuthor { return this.props.author; }
  get isPremium(): boolean { return this.props.isPremium; }
  get isPublic(): boolean { return this.props.isPublic; }
  get isSystem(): boolean { return this.props.isSystem; }
  get isVerified(): boolean { return this.props.isVerified; }
  get metadata(): TemplateMetadata { return this.props.metadata; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }
  get lastUsedAt(): Date | undefined { return this.props.lastUsedAt; }

  // Domain methods - Business Rules

  /**
   * Update template title
   */
  updateTitle(newTitle: string): void {
    if (!newTitle.trim()) {
      throw new Error('Template title cannot be empty');
    }

    if (newTitle.length > 150) {
      throw new Error('Template title cannot exceed 150 characters');
    }

    this.props.title = newTitle.trim();
    this.props.updatedAt = new Date();
    this.incrementVersion();
  }

  /**
   * Update template description
   */
  updateDescription(newDescription: string): void {
    if (!newDescription.trim()) {
      throw new Error('Template description cannot be empty');
    }

    if (newDescription.length > 500) {
      throw new Error('Template description cannot exceed 500 characters');
    }

    this.props.description = newDescription.trim();
    this.props.updatedAt = new Date();
    this.incrementVersion();
  }

  /**
   * Add section to template
   */
  addSection(section: Omit<TemplateSection, 'id' | 'order'>): void {
    if (this.props.structure.length >= 20) {
      throw new Error('Cannot add more than 20 sections to a template');
    }

    const newSection: TemplateSection = {
      ...section,
      id: `section_${Date.now()}`,
      order: this.props.structure.length + 1,
    };

    this.props.structure.push(newSection);
    this.props.updatedAt = new Date();
    this.incrementVersion();
  }

  /**
   * Update section in template
   */
  updateSection(sectionId: string, updates: Partial<Omit<TemplateSection, 'id'>>): void {
    const sectionIndex = this.props.structure.findIndex(s => s.id === sectionId);
    
    if (sectionIndex === -1) {
      throw new Error('Section not found');
    }

    this.props.structure[sectionIndex] = {
      ...this.props.structure[sectionIndex],
      ...updates,
    };

    this.props.updatedAt = new Date();
    this.incrementVersion();
  }

  /**
   * Remove section from template
   */
  removeSection(sectionId: string): void {
    const sectionIndex = this.props.structure.findIndex(s => s.id === sectionId);
    
    if (sectionIndex === -1) {
      throw new Error('Section not found');
    }

    // Check if it's required and is the only required section
    const requiredSections = this.props.structure.filter(s => s.isRequired);
    if (this.props.structure[sectionIndex].isRequired && requiredSections.length === 1) {
      throw new Error('Cannot remove the only required section');
    }

    this.props.structure.splice(sectionIndex, 1);
    
    // Reorder remaining sections
    this.props.structure.forEach((section, index) => {
      section.order = index + 1;
    });

    this.props.updatedAt = new Date();
    this.incrementVersion();
  }

  /**
   * Add placeholder to template
   */
  addPlaceholder(placeholder: TemplatePlaceholder): void {
    if (this.props.placeholders.length >= 50) {
      throw new Error('Cannot add more than 50 placeholders to a template');
    }

    if (this.props.placeholders.some(p => p.id === placeholder.id)) {
      throw new Error('Placeholder ID already exists');
    }

    this.props.placeholders.push(placeholder);
    this.props.updatedAt = new Date();
    this.incrementVersion();
  }

  /**
   * Update placeholder in template
   */
  updatePlaceholder(placeholderId: string, updates: Partial<Omit<TemplatePlaceholder, 'id'>>): void {
    const placeholderIndex = this.props.placeholders.findIndex(p => p.id === placeholderId);
    
    if (placeholderIndex === -1) {
      throw new Error('Placeholder not found');
    }

    this.props.placeholders[placeholderIndex] = {
      ...this.props.placeholders[placeholderIndex],
      ...updates,
    };

    this.props.updatedAt = new Date();
    this.incrementVersion();
  }

  /**
   * Remove placeholder from template
   */
  removePlaceholder(placeholderId: string): void {
    const placeholderIndex = this.props.placeholders.findIndex(p => p.id === placeholderId);
    
    if (placeholderIndex === -1) {
      throw new Error('Placeholder not found');
    }

    // Check if placeholder is used in content
    const isUsedInContent = this.props.structure.some(section => 
      section.content.includes(`{{${placeholderId}}}`)
    );

    if (isUsedInContent) {
      throw new Error('Cannot remove placeholder that is used in template content');
    }

    this.props.placeholders.splice(placeholderIndex, 1);
    this.props.updatedAt = new Date();
    this.incrementVersion();
  }

  /**
   * Add tag to template
   */
  addTag(tag: string): void {
    const normalizedTag = tag.toLowerCase().trim();
    
    if (!normalizedTag) {
      throw new Error('Tag cannot be empty');
    }

    if (this.props.tags.length >= 20) {
      throw new Error('Cannot add more than 20 tags');
    }

    if (!this.props.tags.includes(normalizedTag)) {
      this.props.tags.push(normalizedTag);
      this.props.updatedAt = new Date();
    }
  }

  /**
   * Remove tag from template
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
   * Publish template
   */
  publish(): void {
    if (this.props.isPublic) {
      throw new Error('Template is already published');
    }

    this.validateForPublication();
    
    this.props.isPublic = true;
    this.props.updatedAt = new Date();
  }

  /**
   * Unpublish template
   */
  unpublish(): void {
    if (!this.props.isPublic) {
      throw new Error('Template is not published');
    }

    this.props.isPublic = false;
    this.props.updatedAt = new Date();
  }

  /**
   * Mark as system template
   */
  markAsSystem(): void {
    this.props.isSystem = true;
    this.props.isVerified = true;
    this.props.author.verified = true;
    this.props.updatedAt = new Date();
  }

  /**
   * Verify template
   */
  verify(): void {
    this.validateForVerification();
    
    this.props.isVerified = true;
    this.props.updatedAt = new Date();
  }

  /**
   * Unverify template
   */
  unverify(): void {
    this.props.isVerified = false;
    this.props.updatedAt = new Date();
  }

  /**
   * Record template usage
   */
  recordUsage(): void {
    this.props.usage += 1;
    this.props.lastUsedAt = new Date();
    this.updatePopularity();
  }

  /**
   * Add rating to template
   */
  addRating(rating: number): void {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const totalRating = this.props.rating * this.props.ratingCount;
    this.props.ratingCount += 1;
    this.props.rating = (totalRating + rating) / this.props.ratingCount;
    this.updatePopularity();
  }

  /**
   * Process template with placeholder values
   */
  processWithValues(placeholderValues: Record<string, any>): string {
    // Validate required placeholders
    const requiredPlaceholders = this.props.placeholders.filter(p => p.validation.required);
    const missingRequired = requiredPlaceholders.filter(p => !(p.id in placeholderValues));
    
    if (missingRequired.length > 0) {
      throw new Error(`Missing required placeholders: ${missingRequired.map(p => p.name).join(', ')}`);
    }

    // Validate placeholder values
    this.validatePlaceholderValues(placeholderValues);

    // Process sections
    let processedContent = '';
    this.props.structure
      .sort((a, b) => a.order - b.order)
      .forEach(section => {
        if (section.title) {
          processedContent += `${section.title}\n\n`;
        }
        processedContent += this.replacePlaceholders(section.content, placeholderValues);
        processedContent += '\n\n';
      });

    return processedContent.trim();
  }

  /**
   * Check if template can be used by user
   */
  canBeUsedBy(userId: string, userSubscription: 'free' | 'pro' | 'enterprise'): boolean {
    // Owner can always use
    if (this.props.author.id === userId) {
      return true;
    }

    // Premium templates require subscription
    if (this.props.isPremium && userSubscription === 'free') {
      return false;
    }

    // Public templates can be used by anyone
    return this.props.isPublic;
  }

  /**
   * Check if template can be edited by user
   */
  canBeEditedBy(userId: string): boolean {
    // Only author can edit (unless it's a system template)
    return this.props.author.id === userId && !this.props.isSystem;
  }

  /**
   * Get template analytics data
   */
  getAnalytics(): {
    totalUsage: number;
    rating: number;
    ratingCount: number;
    popularity: number;
    conversionRate: number;
    lastUsed?: Date;
  } {
    const conversionRate = this.props.usage > 0 ? (this.props.usage / (this.props.usage + 1000)) * 100 : 0;

    return {
      totalUsage: this.props.usage,
      rating: this.props.rating,
      ratingCount: this.props.ratingCount,
      popularity: this.props.popularity,
      conversionRate,
      lastUsed: this.props.lastUsedAt,
    };
  }

  /**
   * Get template for persistence
   */
  toPersistence(): TemplateProps {
    return { ...this.props };
  }

  // Private methods

  /**
   * Increment version
   */
  private incrementVersion(): void {
    this.props.metadata.version += 1;
  }

  /**
   * Update popularity based on usage and rating
   */
  private updatePopularity(): void {
    // Simple popularity algorithm: usage count weighted by rating
    const usageScore = Math.min(this.props.usage, 1000) / 10; // Max 100 points from usage
    const ratingScore = this.props.rating * 20; // Max 100 points from rating
    const recencyScore = this.calculateRecencyScore(); // Max 50 points from recency
    
    this.props.popularity = Math.round(usageScore + ratingScore + recencyScore);
  }

  /**
   * Calculate recency score for popularity
   */
  private calculateRecencyScore(): number {
    if (!this.props.lastUsedAt) return 0;
    
    const daysSinceLastUse = (Date.now() - this.props.lastUsedAt.getTime()) / (1000 * 60 * 60 * 24);
    
    // Decay factor: full points if used within 7 days, decay to 0 over 90 days
    if (daysSinceLastUse <= 7) return 50;
    if (daysSinceLastUse >= 90) return 0;
    
    return Math.round(50 * (1 - (daysSinceLastUse - 7) / 83));
  }

  /**
   * Validate template for publication
   */
  private validateForPublication(): void {
    if (!this.props.title.trim()) {
      throw new Error('Title is required for publication');
    }

    if (!this.props.description.trim()) {
      throw new Error('Description is required for publication');
    }

    if (this.props.structure.length === 0) {
      throw new Error('At least one section is required for publication');
    }

    if (!this.props.structure.some(s => s.isRequired)) {
      throw new Error('At least one required section is needed for publication');
    }

    if (this.props.placeholders.length === 0) {
      throw new Error('At least one placeholder is required for publication');
    }

    if (this.props.tags.length === 0) {
      throw new Error('At least one tag is required for publication');
    }
  }

  /**
   * Validate template for verification
   */
  private validateForVerification(): void {
    this.validateForPublication();

    if (this.props.examples.length === 0) {
      throw new Error('Examples are required for verification');
    }

    if (this.props.rating < 4.0) {
      throw new Error('Minimum rating of 4.0 is required for verification');
    }

    if (this.props.usage < 10) {
      throw new Error('Minimum 10 uses are required for verification');
    }
  }

  /**
   * Validate placeholder values
   */
  private validatePlaceholderValues(values: Record<string, any>): void {
    for (const placeholder of this.props.placeholders) {
      const value = values[placeholder.id];
      
      if (placeholder.validation.required && (value === undefined || value === '')) {
        throw new Error(`${placeholder.name} is required`);
      }

      if (value !== undefined && value !== '') {
        this.validatePlaceholderValue(placeholder, value);
      }
    }
  }

  /**
   * Validate individual placeholder value
   */
  private validatePlaceholderValue(placeholder: TemplatePlaceholder, value: any): void {
    const validation = placeholder.validation;

    if (placeholder.type === 'text' || placeholder.type === 'textarea') {
      if (validation.minLength && value.length < validation.minLength) {
        throw new Error(`${placeholder.name} must be at least ${validation.minLength} characters`);
      }
      if (validation.maxLength && value.length > validation.maxLength) {
        throw new Error(`${placeholder.name} cannot exceed ${validation.maxLength} characters`);
      }
    }

    if (placeholder.type === 'number') {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        throw new Error(`${placeholder.name} must be a valid number`);
      }
      if (validation.min !== undefined && numValue < validation.min) {
        throw new Error(`${placeholder.name} must be at least ${validation.min}`);
      }
      if (validation.max !== undefined && numValue > validation.max) {
        throw new Error(`${placeholder.name} cannot exceed ${validation.max}`);
      }
    }

    if (placeholder.type === 'select' && placeholder.options) {
      if (!placeholder.options.includes(value)) {
        throw new Error(`${placeholder.name} must be one of: ${placeholder.options.join(', ')}`);
      }
    }

    if (validation.pattern) {
      const regex = new RegExp(validation.pattern);
      if (!regex.test(value)) {
        throw new Error(validation.customMessage || `${placeholder.name} format is invalid`);
      }
    }
  }

  /**
   * Replace placeholders in content
   */
  private replacePlaceholders(content: string, values: Record<string, any>): string {
    let processedContent = content;
    
    for (const [key, value] of Object.entries(values)) {
      const placeholder = `{{${key}}}`;
      processedContent = processedContent.replace(new RegExp(placeholder, 'g'), String(value));
    }

    return processedContent;
  }

  // Static methods

  /**
   * Generate unique template ID
   */
  private static generateTemplateId(): string {
    return `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Validate template structure
   */
  static validateStructure(structure: TemplateSection[]): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (structure.length === 0) {
      errors.push('Template must have at least one section');
    }

    if (!structure.some(s => s.isRequired)) {
      errors.push('Template must have at least one required section');
    }

    // Check for duplicate orders
    const orders = structure.map(s => s.order);
    const duplicateOrders = orders.filter((order, index) => orders.indexOf(order) !== index);
    if (duplicateOrders.length > 0) {
      errors.push('Template sections must have unique order values');
    }

    // Check for empty content
    const emptySections = structure.filter(s => !s.content.trim());
    if (emptySections.length > 0) {
      errors.push('All template sections must have content');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
} 