// Tag Service - Advanced tag management system
// Handles creation, organization, and analytics for user tags

import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  Timestamp
} from 'firebase/firestore';

import { Tag, CreateTagData, TagUsageStats } from '../types/enhanced';
import { createLogger } from '../utils/logger';

const logger = createLogger('TagService');

export class TagService {
  private db = getFirestore();
  private collection = 'tags';

  // Predefined color palette for tags
  private readonly DEFAULT_COLORS = [
    '#3B82F6', // Blue
    '#10B981', // Green  
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#06B6D4', // Cyan
    '#F97316', // Orange
    '#84CC16', // Lime
    '#EC4899', // Pink
    '#6B7280', // Gray
    '#14B8A6', // Teal
    '#A855F7'  // Violet
  ];

  /**
   * Create a new tag
   */
  async createTag(userId: string, data: CreateTagData): Promise<Tag> {
    try {
      logger.info('Creating new tag', { userId, name: data.name });

      // Check if tag name already exists for this user
      const existingTag = await this.getTagByName(userId, data.name);
      if (existingTag) {
        throw new Error(`Tag with name "${data.name}" already exists`);
      }

      const tagData: Omit<Tag, 'id'> = {
        userId,
        name: data.name.trim(),
        color: data.color || this.getRandomColor(),
        description: data.description?.trim() || null,
        usageCount: 0,
        lastUsedAt: null,
        isSystem: data.isSystem || false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(this.db, this.collection), tagData);
      const tag: Tag = {
        id: docRef.id,
        ...tagData
      };

      logger.info('Tag created successfully', { tagId: docRef.id, name: data.name });
      return tag;
    } catch (error) {
      logger.error('Failed to create tag', { error, userId, name: data.name });
      throw new Error(`Failed to create tag: ${error.message}`);
    }
  }

  /**
   * Update an existing tag
   */
  async updateTag(tagId: string, updates: Partial<Tag>): Promise<void> {
    try {
      logger.info('Updating tag', { tagId });

      const updateData = {
        ...updates,
        updatedAt: Timestamp.now()
      };

      // Remove fields that shouldn't be updated
      delete updateData.id;
      delete updateData.userId;
      delete updateData.createdAt;
      delete updateData.usageCount; // Use incrementUsage instead

      await updateDoc(doc(this.db, this.collection, tagId), updateData);
      logger.info('Tag updated successfully', { tagId });
    } catch (error) {
      logger.error('Failed to update tag', { error, tagId });
      throw new Error(`Failed to update tag: ${error.message}`);
    }
  }

  /**
   * Delete a tag
   */
  async deleteTag(tagId: string): Promise<void> {
    try {
      logger.info('Deleting tag', { tagId });

      // Check if tag is a system tag
      const tag = await this.getTag(tagId);
      if (tag?.isSystem) {
        throw new Error('Cannot delete system tags');
      }

      await deleteDoc(doc(this.db, this.collection, tagId));
      logger.info('Tag deleted successfully', { tagId });
    } catch (error) {
      logger.error('Failed to delete tag', { error, tagId });
      throw new Error(`Failed to delete tag: ${error.message}`);
    }
  }

  /**
   * Get a single tag by ID
   */
  async getTag(tagId: string): Promise<Tag | null> {
    try {
      const docSnap = await getDoc(doc(this.db, this.collection, tagId));
      
      if (!docSnap.exists()) {
        return null;
      }

      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Tag;
    } catch (error) {
      logger.error('Failed to get tag', { error, tagId });
      throw new Error(`Failed to get tag: ${error.message}`);
    }
  }

  /**
   * Get all tags for a user
   */
  async getUserTags(userId: string): Promise<Tag[]> {
    try {
      logger.info('Getting user tags', { userId });

      const q = query(
        collection(this.db, this.collection),
        where('userId', '==', userId),
        orderBy('usageCount', 'desc'),
        orderBy('name', 'asc')
      );

      const snapshot = await getDocs(q);
      const tags = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Tag));

      logger.info('User tags retrieved', { userId, count: tags.length });
      return tags;
    } catch (error) {
      logger.error('Failed to get user tags', { error, userId });
      throw new Error(`Failed to get user tags: ${error.message}`);
    }
  }

  /**
   * Get tag by name (for checking duplicates)
   */
  async getTagByName(userId: string, name: string): Promise<Tag | null> {
    try {
      const q = query(
        collection(this.db, this.collection),
        where('userId', '==', userId),
        where('name', '==', name.trim())
      );

      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as Tag;
    } catch (error) {
      logger.error('Failed to get tag by name', { error, userId, name });
      throw new Error(`Failed to get tag by name: ${error.message}`);
    }
  }

  /**
   * Increment tag usage count
   */
  async incrementTagUsage(tagId: string): Promise<void> {
    try {
      const tag = await this.getTag(tagId);
      if (!tag) {
        throw new Error('Tag not found');
      }

      await updateDoc(doc(this.db, this.collection, tagId), {
        usageCount: tag.usageCount + 1,
        lastUsedAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      logger.debug('Tag usage incremented', { tagId });
    } catch (error) {
      logger.error('Failed to increment tag usage', { error, tagId });
      throw new Error(`Failed to increment tag usage: ${error.message}`);
    }
  }

  /**
   * Bulk increment usage for multiple tags
   */
  async bulkIncrementUsage(tagIds: string[]): Promise<void> {
    try {
      logger.info('Bulk incrementing tag usage', { tagIds });

      const promises = tagIds.map(tagId => this.incrementTagUsage(tagId));
      await Promise.all(promises);

      logger.info('Bulk tag usage incremented', { count: tagIds.length });
    } catch (error) {
      logger.error('Failed to bulk increment tag usage', { error, tagIds });
      throw new Error(`Failed to bulk increment tag usage: ${error.message}`);
    }
  }

  /**
   * Get tag usage statistics
   */
  async getTagUsageStats(userId: string): Promise<TagUsageStats[]> {
    try {
      logger.info('Getting tag usage stats', { userId });

      const tags = await this.getUserTags(userId);
      const totalUsage = tags.reduce((sum, tag) => sum + tag.usageCount, 0);

      const stats: TagUsageStats[] = tags
        .filter(tag => tag.usageCount > 0)
        .map(tag => ({
          tagId: tag.id,
          tagName: tag.name,
          usageCount: tag.usageCount,
          percentage: totalUsage > 0 ? Math.round((tag.usageCount / totalUsage) * 100) : 0
        }))
        .sort((a, b) => b.usageCount - a.usageCount);

      logger.info('Tag usage stats calculated', { userId, statsCount: stats.length });
      return stats;
    } catch (error) {
      logger.error('Failed to get tag usage stats', { error, userId });
      throw new Error(`Failed to get tag usage stats: ${error.message}`);
    }
  }

  /**
   * Get suggested tags based on content
   */
  async getSuggestedTags(userId: string, content: string): Promise<Tag[]> {
    try {
      logger.info('Getting suggested tags', { userId });

      // Get all user tags
      const allTags = await this.getUserTags(userId);
      
      // Simple keyword matching for suggestions
      const contentLower = content.toLowerCase();
      const suggested = allTags.filter(tag => {
        const tagWords = tag.name.toLowerCase().split(' ');
        return tagWords.some(word => contentLower.includes(word));
      });

      // Sort by usage count and limit to top 5
      const sortedSuggestions = suggested
        .sort((a, b) => b.usageCount - a.usageCount)
        .slice(0, 5);

      logger.info('Tag suggestions generated', { 
        userId, 
        suggestions: sortedSuggestions.length 
      });

      return sortedSuggestions;
    } catch (error) {
      logger.error('Failed to get suggested tags', { error, userId });
      return []; // Return empty array on error
    }
  }

  /**
   * Create default system tags for new users
   */
  async createDefaultTags(userId: string): Promise<Tag[]> {
    try {
      logger.info('Creating default tags for user', { userId });

      const defaultTags = [
        { name: 'Marketing', color: '#3B82F6', description: 'Marketing content' },
        { name: 'Educational', color: '#10B981', description: 'Educational content' },
        { name: 'Entertainment', color: '#F59E0B', description: 'Entertainment content' },
        { name: 'Tutorial', color: '#8B5CF6', description: 'How-to and tutorial content' },
        { name: 'Review', color: '#EF4444', description: 'Product and service reviews' }
      ];

      const createdTags: Tag[] = [];

      for (const tagData of defaultTags) {
        try {
          const tag = await this.createTag(userId, {
            ...tagData,
            isSystem: true
          });
          createdTags.push(tag);
        } catch (error) {
          // Skip if tag already exists
          logger.debug('Skipping existing default tag', { name: tagData.name });
        }
      }

      logger.info('Default tags created', { userId, count: createdTags.length });
      return createdTags;
    } catch (error) {
      logger.error('Failed to create default tags', { error, userId });
      throw new Error(`Failed to create default tags: ${error.message}`);
    }
  }

  /**
   * Search tags by name
   */
  async searchTags(userId: string, searchQuery: string): Promise<Tag[]> {
    try {
      logger.info('Searching tags', { userId, searchQuery });

      const allTags = await this.getUserTags(userId);
      const query = searchQuery.toLowerCase().trim();

      const results = allTags.filter(tag => 
        tag.name.toLowerCase().includes(query) ||
        (tag.description && tag.description.toLowerCase().includes(query))
      );

      logger.info('Tag search completed', { 
        userId, 
        searchQuery, 
        results: results.length 
      });

      return results;
    } catch (error) {
      logger.error('Failed to search tags', { error, userId, searchQuery });
      throw new Error(`Failed to search tags: ${error.message}`);
    }
  }

  /**
   * Get most popular tags across all users (for insights)
   */
  async getPopularTags(limit: number = 10): Promise<Tag[]> {
    try {
      logger.info('Getting popular tags', { limit });

      const q = query(
        collection(this.db, this.collection),
        where('isSystem', '==', false),
        orderBy('usageCount', 'desc'),
        orderBy('name', 'asc')
      );

      const snapshot = await getDocs(q);
      const tags = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Tag))
        .slice(0, limit);

      logger.info('Popular tags retrieved', { count: tags.length });
      return tags;
    } catch (error) {
      logger.error('Failed to get popular tags', { error });
      throw new Error(`Failed to get popular tags: ${error.message}`);
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private getRandomColor(): string {
    const randomIndex = Math.floor(Math.random() * this.DEFAULT_COLORS.length);
    return this.DEFAULT_COLORS[randomIndex];
  }

  /**
   * Validate tag name
   */
  private validateTagName(name: string): boolean {
    const trimmed = name.trim();
    return trimmed.length >= 2 && trimmed.length <= 30 && 
           /^[a-zA-Z0-9\s\-_]+$/.test(trimmed);
  }

  /**
   * Validate color hex code
   */
  private validateColor(color: string): boolean {
    return /^#[0-9A-F]{6}$/i.test(color);
  }
}

// Export singleton instance
export const tagService = new TagService();
