// Infrastructure Layer - Script Repository Implementation
// Concrete repository for Script entities using Firestore

import { DocumentData, Timestamp } from 'firebase/firestore';
import { FirestoreRepository, QueryOptions } from './FirestoreRepository';
import { createLogger } from '../../utils/logger';

const logger = createLogger('ScriptRepository');

export interface Script {
  id?: string;
  userId: string;
  title: string;
  content: string;
  platform: 'YouTube' | 'Instagram' | 'TikTok' | 'LinkedIn' | 'Twitter' | 'Facebook' | 'Podcast';
  tone: 'Casual' | 'Formal' | 'Entusiasmado' | 'Educativo' | 'Humorístico' | 'Inspirador';
  audience: 'Geral' | 'Jovem' | 'Adulto' | 'Profissional' | 'Especialista' | 'Iniciante';
  keywords: string[];
  duration: number; // em segundos
  templateId?: string;
  status: 'draft' | 'published' | 'archived';
  analytics: {
    wordCount: number;
    readingTime: number;
    qualityScore: number;
    engagement: {
      views: number;
      likes: number;
      shares: number;
      comments: number;
    };
  };
  sharing: {
    isPublic: boolean;
    shareCode?: string;
    allowComments: boolean;
    allowDownload: boolean;
  };
  metadata: {
    createdAt: Timestamp;
    updatedAt: Timestamp;
    publishedAt?: Timestamp;
    lastViewedAt?: Timestamp;
    version: number;
    tags: string[];
  };
}

export interface ScriptFilters {
  userId?: string;
  platform?: string;
  tone?: string;
  audience?: string;
  status?: 'draft' | 'published' | 'archived';
  templateId?: string;
  isPublic?: boolean;
  createdAfter?: Date;
  updatedAfter?: Date;
  minDuration?: number;
  maxDuration?: number;
  minQualityScore?: number;
  tags?: string[];
}

export interface ScriptStats {
  totalScripts: number;
  publishedScripts: number;
  draftScripts: number;
  archivedScripts: number;
  scriptsByPlatform: Record<string, number>;
  scriptsByTone: Record<string, number>;
  averageQualityScore: number;
  totalViews: number;
  scriptsCreatedToday: number;
  scriptsCreatedThisWeek: number;
  scriptsCreatedThisMonth: number;
}

export class ScriptRepository extends FirestoreRepository<Script> {
  constructor() {
    super({
      collectionName: 'scripts',
      enableLogging: true,
      enableCache: true
    });
  }

  /**
   * Map Firestore document to Script entity
   */
  protected mapToEntity(data: DocumentData): Script {
    return {
      userId: data.userId,
      title: data.title,
      content: data.content,
      platform: data.platform,
      tone: data.tone,
      audience: data.audience,
      keywords: data.keywords || [],
      duration: data.duration || 0,
      templateId: data.templateId,
      status: data.status || 'draft',
      analytics: {
        wordCount: data.analytics?.wordCount || 0,
        readingTime: data.analytics?.readingTime || 0,
        qualityScore: data.analytics?.qualityScore || 0,
        engagement: {
          views: data.analytics?.engagement?.views || 0,
          likes: data.analytics?.engagement?.likes || 0,
          shares: data.analytics?.engagement?.shares || 0,
          comments: data.analytics?.engagement?.comments || 0
        }
      },
      sharing: {
        isPublic: data.sharing?.isPublic || false,
        shareCode: data.sharing?.shareCode,
        allowComments: data.sharing?.allowComments || false,
        allowDownload: data.sharing?.allowDownload || false
      },
      metadata: {
        createdAt: data.metadata?.createdAt || data.createdAt || Timestamp.now(),
        updatedAt: data.metadata?.updatedAt || data.updatedAt || Timestamp.now(),
        publishedAt: data.metadata?.publishedAt,
        lastViewedAt: data.metadata?.lastViewedAt,
        version: data.metadata?.version || 1,
        tags: data.metadata?.tags || []
      }
    };
  }

  /**
   * Map Script entity to Firestore document
   */
  protected mapFromEntity(entity: Script): DocumentData {
    return {
      userId: entity.userId,
      title: entity.title,
      content: entity.content,
      platform: entity.platform,
      tone: entity.tone,
      audience: entity.audience,
      keywords: entity.keywords,
      duration: entity.duration,
      templateId: entity.templateId,
      status: entity.status,
      analytics: entity.analytics,
      sharing: entity.sharing,
      metadata: entity.metadata
    };
  }

  /**
   * Find scripts by user ID
   */
  async findByUserId(userId: string, limit = 20): Promise<Script[]> {
    try {
      return await this.find({
        where: [{ field: 'userId', operator: '==', value: userId }],
        orderBy: [{ field: 'metadata.updatedAt', direction: 'desc' }],
        limit
      });
    } catch (error) {
      this.logger.error(`Error finding scripts for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Find scripts by platform
   */
  async findByPlatform(platform: string, limit = 20): Promise<Script[]> {
    try {
      return await this.find({
        where: [
          { field: 'platform', operator: '==', value: platform },
          { field: 'sharing.isPublic', operator: '==', value: true }
        ],
        orderBy: [{ field: 'metadata.createdAt', direction: 'desc' }],
        limit
      });
    } catch (error) {
      this.logger.error(`Error finding scripts for platform ${platform}:`, error);
      throw error;
    }
  }

  /**
   * Find scripts by template ID
   */
  async findByTemplateId(templateId: string, limit = 20): Promise<Script[]> {
    try {
      return await this.find({
        where: [{ field: 'templateId', operator: '==', value: templateId }],
        orderBy: [{ field: 'metadata.createdAt', direction: 'desc' }],
        limit
      });
    } catch (error) {
      this.logger.error(`Error finding scripts for template ${templateId}:`, error);
      throw error;
    }
  }

  /**
   * Find public scripts
   */
  async findPublicScripts(limit = 20): Promise<Script[]> {
    try {
      return await this.find({
        where: [
          { field: 'sharing.isPublic', operator: '==', value: true },
          { field: 'status', operator: '==', value: 'published' }
        ],
        orderBy: [{ field: 'analytics.engagement.views', direction: 'desc' }],
        limit
      });
    } catch (error) {
      this.logger.error('Error finding public scripts:', error);
      throw error;
    }
  }

  /**
   * Find scripts with filters
   */
  async findWithFilters(filters: ScriptFilters, limit = 20): Promise<Script[]> {
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
      if (filters.templateId) {
        queryOptions.where!.push({ field: 'templateId', operator: '==', value: filters.templateId });
      }
      if (filters.isPublic !== undefined) {
        queryOptions.where!.push({ field: 'sharing.isPublic', operator: '==', value: filters.isPublic });
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
      if (filters.minDuration) {
        queryOptions.where!.push({ field: 'duration', operator: '>=', value: filters.minDuration });
      }
      if (filters.maxDuration) {
        queryOptions.where!.push({ field: 'duration', operator: '<=', value: filters.maxDuration });
      }
      if (filters.minQualityScore) {
        queryOptions.where!.push({ field: 'analytics.qualityScore', operator: '>=', value: filters.minQualityScore });
      }

      return await this.find(queryOptions);
    } catch (error) {
      this.logger.error('Error finding scripts with filters:', error);
      throw error;
    }
  }

  /**
   * Update script analytics
   */
  async updateAnalytics(scriptId: string, analytics: Partial<Script['analytics']>): Promise<Script> {
    try {
      const updates: any = {
        'metadata.updatedAt': Timestamp.now()
      };

      // Update nested analytics
      Object.entries(analytics).forEach(([key, value]) => {
        if (key === 'engagement' && typeof value === 'object') {
          Object.entries(value).forEach(([engagementKey, engagementValue]) => {
            updates[`analytics.engagement.${engagementKey}`] = engagementValue;
          });
        } else {
          updates[`analytics.${key}`] = value;
        }
      });

      return await this.update(scriptId, updates);
    } catch (error) {
      this.logger.error(`Error updating analytics for script ${scriptId}:`, error);
      throw error;
    }
  }

  /**
   * Update script sharing settings
   */
  async updateSharingSettings(scriptId: string, sharing: Partial<Script['sharing']>): Promise<Script> {
    try {
      const updates: any = {
        'metadata.updatedAt': Timestamp.now()
      };

      // Update nested sharing settings
      Object.entries(sharing).forEach(([key, value]) => {
        updates[`sharing.${key}`] = value;
      });

      return await this.update(scriptId, updates);
    } catch (error) {
      this.logger.error(`Error updating sharing settings for script ${scriptId}:`, error);
      throw error;
    }
  }

  /**
   * Publish script
   */
  async publishScript(scriptId: string): Promise<Script> {
    try {
      return await this.update(scriptId, {
        status: 'published',
        'metadata.publishedAt': Timestamp.now(),
        'metadata.updatedAt': Timestamp.now()
      } as Partial<Script>);
    } catch (error) {
      this.logger.error(`Error publishing script ${scriptId}:`, error);
      throw error;
    }
  }

  /**
   * Archive script
   */
  async archiveScript(scriptId: string): Promise<Script> {
    try {
      return await this.update(scriptId, {
        status: 'archived',
        'metadata.updatedAt': Timestamp.now()
      } as Partial<Script>);
    } catch (error) {
      this.logger.error(`Error archiving script ${scriptId}:`, error);
      throw error;
    }
  }

  /**
   * Duplicate script
   */
  async duplicateScript(scriptId: string, userId: string, newTitle?: string): Promise<Script> {
    try {
      const originalScript = await this.getById(scriptId);
      if (!originalScript) {
        throw new Error('Script not found');
      }

      const duplicatedScript: Omit<Script, 'id'> = {
        ...originalScript,
        userId,
        title: newTitle || `${originalScript.title} (Copy)`,
        status: 'draft',
        sharing: {
          isPublic: false,
          allowComments: false,
          allowDownload: false
        },
        analytics: {
          wordCount: originalScript.analytics.wordCount,
          readingTime: originalScript.analytics.readingTime,
          qualityScore: originalScript.analytics.qualityScore,
          engagement: {
            views: 0,
            likes: 0,
            shares: 0,
            comments: 0
          }
        },
        metadata: {
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          version: 1,
          tags: originalScript.metadata.tags
        }
      };

      return await this.create(duplicatedScript);
    } catch (error) {
      this.logger.error(`Error duplicating script ${scriptId}:`, error);
      throw error;
    }
  }

  /**
   * Get script statistics
   */
  async getScriptStats(userId?: string): Promise<ScriptStats> {
    try {
      const query: QueryOptions = {
        where: userId ? [{ field: 'userId', operator: '==', value: userId }] : []
      };

      const scripts = await this.find(query);
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      const stats: ScriptStats = {
        totalScripts: scripts.length,
        publishedScripts: scripts.filter(s => s.status === 'published').length,
        draftScripts: scripts.filter(s => s.status === 'draft').length,
        archivedScripts: scripts.filter(s => s.status === 'archived').length,
        scriptsByPlatform: {},
        scriptsByTone: {},
        averageQualityScore: 0,
        totalViews: 0,
        scriptsCreatedToday: 0,
        scriptsCreatedThisWeek: 0,
        scriptsCreatedThisMonth: 0
      };

      let totalQualityScore = 0;

      scripts.forEach(script => {
        // Count by platform and tone
        stats.scriptsByPlatform[script.platform] = (stats.scriptsByPlatform[script.platform] || 0) + 1;
        stats.scriptsByTone[script.tone] = (stats.scriptsByTone[script.tone] || 0) + 1;

        // Sum quality scores and views
        totalQualityScore += script.analytics.qualityScore;
        stats.totalViews += script.analytics.engagement.views;

        // Count new scripts
        const createdAt = script.metadata.createdAt.toDate();
        if (createdAt >= today) stats.scriptsCreatedToday++;
        if (createdAt >= weekAgo) stats.scriptsCreatedThisWeek++;
        if (createdAt >= monthAgo) stats.scriptsCreatedThisMonth++;
      });

      // Calculate average quality score
      stats.averageQualityScore = scripts.length > 0 ? totalQualityScore / scripts.length : 0;

      return stats;
    } catch (error) {
      this.logger.error('Error getting script stats:', error);
      throw error;
    }
  }

  /**
   * Search scripts by content or title
   */
  async searchScripts(query: string, userId?: string, limit = 10): Promise<Script[]> {
    try {
      const normalizedQuery = query.toLowerCase().trim();
      
      const queryOptions: QueryOptions = {
        where: [],
        limit
      };

      if (userId) {
        queryOptions.where!.push({ field: 'userId', operator: '==', value: userId });
      }

      // Note: This is a simplified search - in production, you'd want to use 
      // a search service like Algolia or implement full-text search
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

      return await this.find(queryOptions);
    } catch (error) {
      this.logger.error('Error searching scripts:', error);
      throw error;
    }
  }
} 