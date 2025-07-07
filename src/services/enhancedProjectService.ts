// Enhanced Project Service - Phase 2 Dashboard Implementation
// Comprehensive project management with advanced filtering, tagging, and organization

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
  limit,
  startAfter,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore';

import { 
  EnhancedProject, 
  FilterOptions, 
  CreateProjectData,
  UpdateProjectData,
  DashboardStats,
  TrendData,
  SortOption,
  ProjectStatus,
  PlatformType
} from '../types/enhanced';

import { createLogger } from '../utils/logger';

const logger = createLogger('EnhancedProjectService');

export class EnhancedProjectService {
  private db = getFirestore();
  private collection = 'enhanced_projects';

  /**
   * Create a new enhanced project
   */
  async createProject(userId: string, data: CreateProjectData): Promise<EnhancedProject> {
    try {
      logger.info('Creating new enhanced project', { userId, title: data.title });

      const enhancedData: Omit<EnhancedProject, 'id'> = {
        userId,
        title: data.title,
        content: data.content,
        formData: data.formData,
        
        // Organization
        tags: data.tags || [],
        folderId: data.folderId || null,
        isFavorite: false,
        status: data.status || 'draft',
        
        // Metrics
        version: 1,
        wordCount: this.calculateWordCount(data.content),
        estimatedDuration: this.calculateDuration(data.content),
        lastEditedAt: Timestamp.now(),
        
        // Engagement
        viewCount: 0,
        editCount: 0,
        
        // Sharing
        isShared: false,
        shareLink: null,
        sharedAt: null,
        
        // Metadata
        thumbnailUrl: null,
        originalPrompt: data.formData.topic,
        aiModelUsed: 'gemini-pro',
        generationTime: null,
        
        // Timestamps
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(this.db, this.collection), enhancedData);
      const project: EnhancedProject = {
        id: docRef.id,
        ...enhancedData
      };

      logger.info('Project created successfully', { projectId: docRef.id });
      return project;
    } catch (error: unknown) {
      logger.error('Failed to create project', { error, userId });
      throw new Error(`Failed to create project: ${error.message}`);
    }
  }

  /**
   * Update an existing project
   */
  async updateProject(projectId: string, updates: UpdateProjectData): Promise<void> {
    try {
      logger.info('Updating project', { projectId });

      const updateData: UpdateProjectData = {
        ...updates,
        updatedAt: Timestamp.now(),
        lastEditedAt: Timestamp.now()
      };

      // Update word count if content changed
      if (updates.content) {
        updateData.wordCount = this.calculateWordCount(updates.content);
        updateData.estimatedDuration = this.calculateDuration(updates.content);
        updateData.editCount = (updates.editCount || 0) + 1;
      }

      await updateDoc(doc(this.db, this.collection, projectId), updateData);
      logger.info('Project updated successfully', { projectId });
    } catch (error: unknown) {
      logger.error('Failed to update project', { error, projectId });
      throw new Error(`Failed to update project: ${error.message}`);
    }
  }

  /**
   * Delete a project
   */
  async deleteProject(projectId: string): Promise<void> {
    try {
      logger.info('Deleting project', { projectId });
      await deleteDoc(doc(this.db, this.collection, projectId));
      logger.info('Project deleted successfully', { projectId });
    } catch (error: unknown) {
      logger.error('Failed to delete project', { error, projectId });
      throw new Error(`Failed to delete project: ${error.message}`);
    }
  }

  /**
   * Get a single project by ID
   */
  async getProject(projectId: string): Promise<EnhancedProject | null> {
    try {
      const docSnap = await getDoc(doc(this.db, this.collection, projectId));
      
      if (!docSnap.exists()) {
        return null;
      }

      return {
        id: docSnap.id,
        ...docSnap.data()
      } as EnhancedProject;
    } catch (error: unknown) {
      logger.error('Failed to get project', { error, projectId });
      throw new Error(`Failed to get project: ${error.message}`);
    }
  }

  /**
   * Get projects with advanced filtering
   */
  async getProjectsByFilters(userId: string, filters: FilterOptions): Promise<EnhancedProject[]> {
    try {
      logger.info('Getting projects with filters', { userId, filters });

      let q = query(
        collection(this.db, this.collection),
        where('userId', '==', userId)
      );

      // Apply Firestore-compatible filters
      if (filters.platforms?.length === 1) {
        q = query(q, where('formData.platform', '==', filters.platforms[0]));
      }

      if (filters.status?.length === 1) {
        q = query(q, where('status', '==', filters.status[0]));
      }

      if (filters.isFavorite !== undefined) {
        q = query(q, where('isFavorite', '==', filters.isFavorite));
      }

      if (filters.folderId) {
        q = query(q, where('folderId', '==', filters.folderId));
      }

      // Apply date range filter
      if (filters.dateRange) {
        q = query(
          q,
          where('createdAt', '>=', Timestamp.fromDate(filters.dateRange.start)),
          where('createdAt', '<=', Timestamp.fromDate(filters.dateRange.end))
        );
      }

      // Apply sorting
      q = this.applySorting(q, filters.sortBy, filters.sortOrder);

      // Apply limit
      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      const snapshot = await getDocs(q);
      let projects = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as EnhancedProject));

      // Apply client-side filters for complex conditions
      projects = this.applyClientSideFilters(projects, filters);

      logger.info('Projects retrieved successfully', { 
        userId, 
        count: projects.length 
      });

      return projects;
    } catch (error: unknown) {
      logger.error('Failed to get projects by filters', { error, userId, filters });
      throw new Error(`Failed to get projects: ${error.message}`);
    }
  }

  /**
   * Search projects by text query
   */
  async searchProjects(
    userId: string, 
    searchQuery: string, 
    filters?: FilterOptions
  ): Promise<EnhancedProject[]> {
    try {
      logger.info('Searching projects', { userId, searchQuery });

      // Get all projects with basic filters
      const allProjects = await this.getProjectsByFilters(userId, filters || {
        sortBy: 'date',
        sortOrder: 'desc'
      });

      // Perform client-side text search
      const searchTerms = searchQuery.toLowerCase().split(' ');
      const results = allProjects.filter(project => {
        const searchableText = [
          project.title,
          project.content,
          project.formData.topic,
          project.formData.objective,
          ...(project.tags || [])
        ].join(' ').toLowerCase();

        return searchTerms.every(term => searchableText.includes(term));
      });

      logger.info('Search completed', { 
        userId, 
        query: searchQuery, 
        results: results.length 
      });

      return results;
    } catch (error: unknown) {
      logger.error('Failed to search projects', { error, userId, searchQuery });
      throw new Error(`Failed to search projects: ${error.message}`);
    }
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(userId: string, dateRange?: { start: Date; end: Date }): Promise<DashboardStats> {
    try {
      logger.info('Getting dashboard stats', { userId });

      // Get all projects for the user
      const allProjects = await this.getProjectsByFilters(userId, {
        sortBy: 'date',
        sortOrder: 'desc'
      });

      // Calculate date ranges
      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisWeekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Filter projects by date
      const projectsThisMonth = allProjects.filter(p => 
        p.createdAt.toDate() >= thisMonthStart
      );
      const projectsThisWeek = allProjects.filter(p => 
        p.createdAt.toDate() >= thisWeekStart
      );

      // Calculate basic metrics
      const totalWords = allProjects.reduce((sum, p) => sum + p.wordCount, 0);
      const averageWordsPerScript = allProjects.length > 0 ? 
        Math.round(totalWords / allProjects.length) : 0;

      // Find most used platform and format
      const platformCounts = this.countByField(allProjects, 'formData.platform');
      const formatCounts = this.countByField(allProjects, 'formData.format');
      
      const mostUsedPlatform = this.getMostUsed(platformCounts) as PlatformType;
      const mostUsedFormat = this.getMostUsed(formatCounts);

      // Calculate productivity trend (last 30 days)
      const trendData = this.calculateTrendData(allProjects, 30);

      // Calculate completion rate
      const completedProjects = allProjects.filter(p => p.status === 'completed');
      const completionRate = allProjects.length > 0 ? 
        Math.round((completedProjects.length / allProjects.length) * 100) : 0;

      const stats: DashboardStats = {
        totalProjects: allProjects.length,
        projectsThisMonth: projectsThisMonth.length,
        totalWords,
        averageWordsPerScript,
        mostUsedPlatform,
        mostUsedFormat,
        productivityTrend: trendData,
        timeSpentWriting: this.estimateTimeSpent(allProjects),
        completionRate
      };

      logger.info('Dashboard stats calculated', { userId, stats });
      return stats;
    } catch (error: unknown) {
      logger.error('Failed to get dashboard stats', { error, userId });
      throw new Error(`Failed to get dashboard stats: ${error.message}`);
    }
  }

  /**
   * Bulk operations
   */
  async bulkUpdateProjects(
    projectIds: string[], 
    updates: Partial<EnhancedProject>
  ): Promise<void> {
    try {
      logger.info('Bulk updating projects', { projectIds, updates });

      const updatePromises = projectIds.map(id => 
        this.updateProject(id, {
          ...updates,
          updatedAt: Timestamp.now()
        })
      );

      await Promise.all(updatePromises);
      logger.info('Bulk update completed', { count: projectIds.length });
    } catch (error: unknown) {
      logger.error('Failed to bulk update projects', { error, projectIds });
      throw new Error(`Failed to bulk update projects: ${error.message}`);
    }
  }

  async bulkDeleteProjects(projectIds: string[]): Promise<void> {
    try {
      logger.info('Bulk deleting projects', { projectIds });

      const deletePromises = projectIds.map(id => this.deleteProject(id));
      await Promise.all(deletePromises);

      logger.info('Bulk delete completed', { count: projectIds.length });
    } catch (error: unknown) {
      logger.error('Failed to bulk delete projects', { error, projectIds });
      throw new Error(`Failed to bulk delete projects: ${error.message}`);
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private calculateWordCount(content: string): number {
    return content.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  private calculateDuration(content: string): number {
    // Estimate 150 words per minute reading speed
    const wordCount = this.calculateWordCount(content);
    return Math.ceil((wordCount / 150) * 60); // seconds
  }

  private applySorting(q: any, sortBy: SortOption, sortOrder: 'asc' | 'desc'): any {
    switch (sortBy) {
      case 'date':
        return query(q, orderBy('createdAt', sortOrder));
      case 'title':
        return query(q, orderBy('title', sortOrder));
      case 'wordCount':
        return query(q, orderBy('wordCount', sortOrder));
      case 'editCount':
        return query(q, orderBy('editCount', sortOrder));
      case 'viewCount':
        return query(q, orderBy('viewCount', sortOrder));
      default:
        return query(q, orderBy('createdAt', 'desc'));
    }
  }

  private applyClientSideFilters(
    projects: EnhancedProject[], 
    filters: FilterOptions
  ): EnhancedProject[] {
    let filtered = [...projects];

    // Filter by multiple platforms
    if (filters.platforms?.length > 1) {
      filtered = filtered.filter(p => 
        filters.platforms.includes(p.formData.platform)
      );
    }

    // Filter by multiple statuses
    if (filters.status?.length > 1) {
      filtered = filtered.filter(p => 
        filters.status.includes(p.status)
      );
    }

    // Filter by multiple formats
    if (filters.formats?.length) {
      filtered = filtered.filter(p => 
        filters.formats.includes(p.formData.format)
      );
    }

    // Filter by tags
    if (filters.tags?.length) {
      filtered = filtered.filter(p => 
        filters.tags.some(tag => p.tags.includes(tag))
      );
    }

    return filtered;
  }

  private countByField(projects: EnhancedProject[], fieldPath: string): Record<string, number> {
    const counts: Record<string, number> = {};
    
    projects.forEach(project => {
      const value = this.getNestedValue(project, fieldPath);
      if (value) {
        counts[value] = (counts[value] || 0) + 1;
      }
    });

    return counts;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private getMostUsed(counts: Record<string, number>): string {
    return Object.entries(counts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '';
  }

  private calculateTrendData(projects: EnhancedProject[], days: number): TrendData[] {
    const now = new Date();
    const trendData: TrendData[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];

      const dayProjects = projects.filter(p => {
        const projectDate = p.createdAt.toDate().toISOString().split('T')[0];
        return projectDate === dateStr;
      });

      trendData.push({
        date: dateStr,
        projectsCreated: dayProjects.length,
        wordsWritten: dayProjects.reduce((sum, p) => sum + p.wordCount, 0),
        timeSpent: dayProjects.reduce((sum, p) => sum + p.estimatedDuration, 0) / 60 // minutes
      });
    }

    return trendData;
  }

  private estimateTimeSpent(projects: EnhancedProject[]): number {
    // Estimate time spent writing (not just reading)
    // Assume 30 words per minute writing speed
    const totalWords = projects.reduce((sum, p) => sum + p.wordCount, 0);
    return Math.round(totalWords / 30); // minutes
  }
}

// Export singleton instance
export const enhancedProjectService = new EnhancedProjectService();
