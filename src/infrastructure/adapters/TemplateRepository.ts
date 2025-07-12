// Infrastructure Layer - Template Repository Implementation
// Concrete repository for Template entities using Firestore

import { DocumentData, Timestamp } from 'firebase/firestore';
import { FirestoreRepository, QueryOptions } from './FirestoreRepository';
import { createLogger } from '../../utils/logger';

const logger = createLogger('TemplateRepository');

export interface Template {
  id?: string;
  userId: string;
  title: string;
  description: string;
  content: string;
  category: 'Marketing' | 'Education' | 'Entertainment' | 'Business' | 'Personal' | 'News' | 'Tutorial';
  platform: 'YouTube' | 'Instagram' | 'TikTok' | 'LinkedIn' | 'Twitter' | 'Facebook' | 'Podcast' | 'All';
  tone: 'Casual' | 'Formal' | 'Entusiasmado' | 'Educativo' | 'Humorístico' | 'Inspirador';
  audience: 'Geral' | 'Jovem' | 'Adulto' | 'Profissional' | 'Especialista' | 'Iniciante';
  tags: string[];
  placeholders: {
    name: string;
    type: 'text' | 'number' | 'select' | 'textarea';
    required: boolean;
    defaultValue?: string;
    options?: string[];
    description?: string;
  }[];
  status: 'draft' | 'published' | 'featured' | 'archived';
  analytics: {
    usageCount: number;
    rating: number;
    reviewCount: number;
    qualityScore: number;
    compatibility: {
      platforms: string[];
      tones: string[];
      audiences: string[];
    };
  };
  sharing: {
    isPublic: boolean;
    allowCloning: boolean;
    allowRating: boolean;
    licenseType: 'free' | 'premium' | 'restricted';
  };
  metadata: {
    createdAt: Timestamp;
    updatedAt: Timestamp;
    publishedAt?: Timestamp;
    featuredAt?: Timestamp;
    lastUsedAt?: Timestamp;
    version: number;
    authorName?: string;
  };
}

export interface TemplateFilters {
  userId?: string;
  category?: string;
  platform?: string;
  tone?: string;
  audience?: string;
  status?: 'draft' | 'published' | 'featured' | 'archived';
  isPublic?: boolean;
  licenseType?: 'free' | 'premium' | 'restricted';
  minRating?: number;
  createdAfter?: Date;
  updatedAfter?: Date;
  tags?: string[];
  featured?: boolean;
}

export interface TemplateStats {
  totalTemplates: number;
  publishedTemplates: number;
  featuredTemplates: number;
  draftTemplates: number;
  archivedTemplates: number;
  templatesByCategory: Record<string, number>;
  templatesByPlatform: Record<string, number>;
  averageRating: number;
  totalUsage: number;
  templatesCreatedToday: number;
  templatesCreatedThisWeek: number;
  templatesCreatedThisMonth: number;
}

export class TemplateRepository extends FirestoreRepository<Template> {
  constructor() {
    super({
      collectionName: 'templates',
      enableLogging: true,
      enableCache: true
    });
  }

  /**
   * Map Firestore document to Template entity
   */
  protected mapToEntity(data: DocumentData): Template {
    return {
      userId: data.userId,
      title: data.title,
      description: data.description,
      content: data.content,
      category: data.category,
      platform: data.platform,
      tone: data.tone,
      audience: data.audience,
      tags: data.tags || [],
      placeholders: data.placeholders || [],
      status: data.status || 'draft',
      analytics: {
        usageCount: data.analytics?.usageCount || 0,
        rating: data.analytics?.rating || 0,
        reviewCount: data.analytics?.reviewCount || 0,
        qualityScore: data.analytics?.qualityScore || 0,
        compatibility: {
          platforms: data.analytics?.compatibility?.platforms || [],
          tones: data.analytics?.compatibility?.tones || [],
          audiences: data.analytics?.compatibility?.audiences || []
        }
      },
      sharing: {
        isPublic: data.sharing?.isPublic || false,
        allowCloning: data.sharing?.allowCloning || false,
        allowRating: data.sharing?.allowRating || false,
        licenseType: data.sharing?.licenseType || 'free'
      },
      metadata: {
        createdAt: data.metadata?.createdAt || data.createdAt || Timestamp.now(),
        updatedAt: data.metadata?.updatedAt || data.updatedAt || Timestamp.now(),
        publishedAt: data.metadata?.publishedAt,
        featuredAt: data.metadata?.featuredAt,
        lastUsedAt: data.metadata?.lastUsedAt,
        version: data.metadata?.version || 1,
        authorName: data.metadata?.authorName
      }
    };
  }

  /**
   * Map Template entity to Firestore document
   */
  protected mapFromEntity(entity: Template): DocumentData {
    return {
      userId: entity.userId,
      title: entity.title,
      description: entity.description,
      content: entity.content,
      category: entity.category,
      platform: entity.platform,
      tone: entity.tone,
      audience: entity.audience,
      tags: entity.tags,
      placeholders: entity.placeholders,
      status: entity.status,
      analytics: entity.analytics,
      sharing: entity.sharing,
      metadata: entity.metadata
    };
  }

  /**
   * Find templates by user ID
   */
  async findByUserId(userId: string, limit = 20): Promise<Template[]> {
    try {
      return await this.find({
        where: [{ field: 'userId', operator: '==', value: userId }],
        orderBy: [{ field: 'metadata.updatedAt', direction: 'desc' }],
        limit
      });
    } catch (error) {
      this.logger.error(`Error finding templates for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Find templates by category
   */
  async findByCategory(category: string, limit = 20): Promise<Template[]> {
    try {
      return await this.find({
        where: [
          { field: 'category', operator: '==', value: category },
          { field: 'sharing.isPublic', operator: '==', value: true },
          { field: 'status', operator: '==', value: 'published' }
        ],
        orderBy: [{ field: 'analytics.rating', direction: 'desc' }],
        limit
      });
    } catch (error) {
      this.logger.error(`Error finding templates for category ${category}:`, error);
      throw error;
    }
  }

  /**
   * Find featured templates
   */
  async findFeatured(limit = 10): Promise<Template[]> {
    try {
      return await this.find({
        where: [
          { field: 'status', operator: '==', value: 'featured' },
          { field: 'sharing.isPublic', operator: '==', value: true }
        ],
        orderBy: [{ field: 'metadata.featuredAt', direction: 'desc' }],
        limit
      });
    } catch (error) {
      this.logger.error('Error finding featured templates:', error);
      throw error;
    }
  }

  /**
   * Find public templates
   */
  async findPublicTemplates(limit = 20): Promise<Template[]> {
    try {
      return await this.find({
        where: [
          { field: 'sharing.isPublic', operator: '==', value: true },
          { field: 'status', operator: 'in', value: ['published', 'featured'] }
        ],
        orderBy: [{ field: 'analytics.usageCount', direction: 'desc' }],
        limit
      });
    } catch (error) {
      this.logger.error('Error finding public templates:', error);
      throw error;
    }
  }

  /**
   * Find templates with filters
   */
  async findWithFilters(filters: TemplateFilters, limit = 20): Promise<Template[]> {
    try {
      const queryOptions: QueryOptions = {
        where: [],
        orderBy: [{ field: 'metadata.updatedAt', direction: 'desc' }],
        limit
      };

      // Add filters
      if (filters.userId) {
        queryOptions.where!.push({ field: 'userId', operator: '==', value: filters.userId });
      }
      if (filters.category) {
        queryOptions.where!.push({ field: 'category', operator: '==', value: filters.category });
      }
      if (filters.platform) {
        queryOptions.where!.push({ field: 'platform', operator: '==', value: filters.platform });
      }
      if (filters.tone) {
        queryOptions.where!.push({ field: 'tone', operator: '==', value: filters.tone });
      }
      if (filters.audience) {
        queryOptions.where!.push({ field: 'audience', operator: '==', value: filters.audience });
      }
      if (filters.status) {
        queryOptions.where!.push({ field: 'status', operator: '==', value: filters.status });
      }
      if (filters.isPublic !== undefined) {
        queryOptions.where!.push({ field: 'sharing.isPublic', operator: '==', value: filters.isPublic });
      }
      if (filters.licenseType) {
        queryOptions.where!.push({ field: 'sharing.licenseType', operator: '==', value: filters.licenseType });
      }
      if (filters.minRating) {
        queryOptions.where!.push({ field: 'analytics.rating', operator: '>=', value: filters.minRating });
      }
      if (filters.createdAfter) {
        queryOptions.where!.push({ 
          field: 'metadata.createdAt', 
          operator: '>=', 
          value: Timestamp.fromDate(filters.createdAfter) 
        });
      }
      if (filters.updatedAfter) {
        queryOptions.where!.push({ 
          field: 'metadata.updatedAt', 
          operator: '>=', 
          value: Timestamp.fromDate(filters.updatedAfter) 
        });
      }
      if (filters.featured) {
        queryOptions.where!.push({ field: 'status', operator: '==', value: 'featured' });
      }

      return await this.find(queryOptions);
    } catch (error) {
      this.logger.error('Error finding templates with filters:', error);
      throw error;
    }
  }

  /**
   * Search templates
   */
  async searchTemplates(query: string, filters?: Partial<TemplateFilters>, limit = 10): Promise<{ templates: Template[]; total: number }> {
    try {
      const normalizedQuery = query.toLowerCase().trim();
      
      const queryOptions: QueryOptions = {
        where: [],
        limit
      };

      // Add search conditions
      queryOptions.where!.push({
        field: 'title',
        operator: '>=',
        value: normalizedQuery
      });
      queryOptions.where!.push({
        field: 'title',
        operator: '<',
        value: normalizedQuery + '\uf8ff'
      });

      // Add filters if provided
      if (filters) {
        if (filters.category) {
          queryOptions.where!.push({ field: 'category', operator: '==', value: filters.category });
        }
        if (filters.platform) {
          queryOptions.where!.push({ field: 'platform', operator: '==', value: filters.platform });
        }
        if (filters.isPublic !== undefined) {
          queryOptions.where!.push({ field: 'sharing.isPublic', operator: '==', value: filters.isPublic });
        }
      }

      const templates = await this.find(queryOptions);
      
      return {
        templates,
        total: templates.length
      };
    } catch (error) {
      this.logger.error('Error searching templates:', error);
      throw error;
    }
  }

  /**
   * Update template analytics
   */
  async updateAnalytics(templateId: string, analytics: Partial<Template['analytics']>): Promise<Template> {
    try {
      const updates: any = {
        'metadata.updatedAt': Timestamp.now()
      };

      // Update nested analytics
      Object.entries(analytics).forEach(([key, value]) => {
        if (key === 'compatibility' && typeof value === 'object') {
          Object.entries(value).forEach(([compatKey, compatValue]) => {
            updates[`analytics.compatibility.${compatKey}`] = compatValue;
          });
        } else {
          updates[`analytics.${key}`] = value;
        }
      });

      return await this.update(templateId, updates);
    } catch (error) {
      this.logger.error(`Error updating analytics for template ${templateId}:`, error);
      throw error;
    }
  }

  /**
   * Update template sharing settings
   */
  async updateSharingSettings(templateId: string, sharing: Partial<Template['sharing']>): Promise<Template> {
    try {
      const updates: any = {
        'metadata.updatedAt': Timestamp.now()
      };

      // Update nested sharing settings
      Object.entries(sharing).forEach(([key, value]) => {
        updates[`sharing.${key}`] = value;
      });

      return await this.update(templateId, updates);
    } catch (error) {
      this.logger.error(`Error updating sharing settings for template ${templateId}:`, error);
      throw error;
    }
  }

  /**
   * Publish template
   */
  async publishTemplate(templateId: string): Promise<Template> {
    try {
      return await this.update(templateId, {
        status: 'published',
        'metadata.publishedAt': Timestamp.now(),
        'metadata.updatedAt': Timestamp.now()
      } as Partial<Template>);
    } catch (error) {
      this.logger.error(`Error publishing template ${templateId}:`, error);
      throw error;
    }
  }

  /**
   * Feature template
   */
  async featureTemplate(templateId: string): Promise<Template> {
    try {
      return await this.update(templateId, {
        status: 'featured',
        'metadata.featuredAt': Timestamp.now(),
        'metadata.updatedAt': Timestamp.now()
      } as Partial<Template>);
    } catch (error) {
      this.logger.error(`Error featuring template ${templateId}:`, error);
      throw error;
    }
  }

  /**
   * Archive template
   */
  async archiveTemplate(templateId: string): Promise<Template> {
    try {
      return await this.update(templateId, {
        status: 'archived',
        'metadata.updatedAt': Timestamp.now()
      } as Partial<Template>);
    } catch (error) {
      this.logger.error(`Error archiving template ${templateId}:`, error);
      throw error;
    }
  }

  /**
   * Clone template
   */
  async cloneTemplate(templateId: string, userId: string, newTitle?: string): Promise<Template> {
    try {
      const originalTemplate = await this.getById(templateId);
      if (!originalTemplate) {
        throw new Error('Template not found');
      }

      // Check if cloning is allowed
      if (!originalTemplate.sharing.allowCloning) {
        throw new Error('Template cloning is not allowed');
      }

      const clonedTemplate: Omit<Template, 'id'> = {
        ...originalTemplate,
        userId,
        title: newTitle || `${originalTemplate.title} (Clone)`,
        status: 'draft',
        sharing: {
          isPublic: false,
          allowCloning: false,
          allowRating: false,
          licenseType: 'free'
        },
        analytics: {
          usageCount: 0,
          rating: 0,
          reviewCount: 0,
          qualityScore: originalTemplate.analytics.qualityScore,
          compatibility: originalTemplate.analytics.compatibility
        },
        metadata: {
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          version: 1,
          authorName: undefined
        }
      };

      return await this.create(clonedTemplate);
    } catch (error) {
      this.logger.error(`Error cloning template ${templateId}:`, error);
      throw error;
    }
  }

  /**
   * Update template usage
   */
  async updateUsage(templateId: string): Promise<Template> {
    try {
      const template = await this.getById(templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      return await this.update(templateId, {
        'analytics.usageCount': template.analytics.usageCount + 1,
        'metadata.lastUsedAt': Timestamp.now(),
        'metadata.updatedAt': Timestamp.now()
      } as Partial<Template>);
    } catch (error) {
      this.logger.error(`Error updating usage for template ${templateId}:`, error);
      throw error;
    }
  }

  /**
   * Rate template
   */
  async rateTemplate(templateId: string, rating: number): Promise<Template> {
    try {
      const template = await this.getById(templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      if (!template.sharing.allowRating) {
        throw new Error('Template rating is not allowed');
      }

      const currentRating = template.analytics.rating;
      const currentReviewCount = template.analytics.reviewCount;
      
      // Calculate new average rating
      const newReviewCount = currentReviewCount + 1;
      const newRating = ((currentRating * currentReviewCount) + rating) / newReviewCount;

      return await this.update(templateId, {
        'analytics.rating': newRating,
        'analytics.reviewCount': newReviewCount,
        'metadata.updatedAt': Timestamp.now()
      } as Partial<Template>);
    } catch (error) {
      this.logger.error(`Error rating template ${templateId}:`, error);
      throw error;
    }
  }

  /**
   * Get template statistics
   */
  async getTemplateStats(userId?: string): Promise<TemplateStats> {
    try {
      const query: QueryOptions = {
        where: userId ? [{ field: 'userId', operator: '==', value: userId }] : []
      };

      const templates = await this.find(query);
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      const stats: TemplateStats = {
        totalTemplates: templates.length,
        publishedTemplates: templates.filter(t => t.status === 'published').length,
        featuredTemplates: templates.filter(t => t.status === 'featured').length,
        draftTemplates: templates.filter(t => t.status === 'draft').length,
        archivedTemplates: templates.filter(t => t.status === 'archived').length,
        templatesByCategory: {},
        templatesByPlatform: {},
        averageRating: 0,
        totalUsage: 0,
        templatesCreatedToday: 0,
        templatesCreatedThisWeek: 0,
        templatesCreatedThisMonth: 0
      };

      let totalRating = 0;
      let ratedTemplates = 0;

      templates.forEach(template => {
        // Count by category and platform
        stats.templatesByCategory[template.category] = (stats.templatesByCategory[template.category] || 0) + 1;
        stats.templatesByPlatform[template.platform] = (stats.templatesByPlatform[template.platform] || 0) + 1;

        // Sum ratings and usage
        if (template.analytics.reviewCount > 0) {
          totalRating += template.analytics.rating;
          ratedTemplates++;
        }
        stats.totalUsage += template.analytics.usageCount;

        // Count new templates
        const createdAt = template.metadata.createdAt.toDate();
        if (createdAt >= today) stats.templatesCreatedToday++;
        if (createdAt >= weekAgo) stats.templatesCreatedThisWeek++;
        if (createdAt >= monthAgo) stats.templatesCreatedThisMonth++;
      });

      // Calculate average rating
      stats.averageRating = ratedTemplates > 0 ? totalRating / ratedTemplates : 0;

      return stats;
    } catch (error) {
      this.logger.error('Error getting template stats:', error);
      throw error;
    }
  }

  /**
   * Get popular templates
   */
  async getPopularTemplates(limit = 10): Promise<Template[]> {
    try {
      return await this.find({
        where: [
          { field: 'sharing.isPublic', operator: '==', value: true },
          { field: 'status', operator: 'in', value: ['published', 'featured'] }
        ],
        orderBy: [{ field: 'analytics.usageCount', direction: 'desc' }],
        limit
      });
    } catch (error) {
      this.logger.error('Error getting popular templates:', error);
      throw error;
    }
  }

  /**
   * Get recent templates
   */
  async getRecentTemplates(limit = 10): Promise<Template[]> {
    try {
      return await this.find({
        where: [
          { field: 'sharing.isPublic', operator: '==', value: true },
          { field: 'status', operator: 'in', value: ['published', 'featured'] }
        ],
        orderBy: [{ field: 'metadata.createdAt', direction: 'desc' }],
        limit
      });
    } catch (error) {
      this.logger.error('Error getting recent templates:', error);
      throw error;
    }
  }
} 