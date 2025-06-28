/**
 * Mock Services for Development Environment
 * Provides fallback functionality when Firebase is not configured
 */

import type { EnhancedProject, FormData } from '../types';
import { createLogger } from '../utils/logger';

const logger = createLogger('MockServices');

// Mock data store
class MockDataStore {
  private static projects: EnhancedProject[] = [];
  private static tags: string[] = ['exemplo', 'teste', 'mockup'];
  private static nextId = 1;

  static getProjects(): EnhancedProject[] {
    return [...this.projects];
  }

  static addProject(project: Omit<EnhancedProject, 'id'>): EnhancedProject {
    const newProject: EnhancedProject = {
      ...project,
      id: `mock_${this.nextId++}`,
      createdAt: new Date() as any,
      updatedAt: new Date() as any
    };
    
    this.projects.push(newProject);
    logger.info('Mock project added', { id: newProject.id, title: newProject.title });
    return newProject;
  }

  static updateProject(id: string, updates: Partial<EnhancedProject>): boolean {
    const index = this.projects.findIndex(p => p.id === id);
    if (index === -1) return false;

    this.projects[index] = { 
      ...this.projects[index], 
      ...updates, 
      updatedAt: new Date() as any 
    };
    
    logger.info('Mock project updated', { id, updates: Object.keys(updates) });
    return true;
  }

  static deleteProject(id: string): boolean {
    const index = this.projects.findIndex(p => p.id === id);
    if (index === -1) return false;

    this.projects.splice(index, 1);
    logger.info('Mock project deleted', { id });
    return true;
  }

  static getTags(): string[] {
    return [...this.tags];
  }
}

// Mock Project Service
export class MockProjectService {
  static async createProject(
    userId: string,
    formData: FormData,
    content: string,
    additionalData?: any
  ): Promise<string> {
    const project = MockDataStore.addProject({
      userId,
      title: additionalData?.title || formData.subject,
      content,
      formData,
      tags: additionalData?.tags || [],
      folderId: additionalData?.folderId,
      isFavorite: false,
      status: additionalData?.status || 'draft',
      version: 1,
      wordCount: content.split(' ').length,
      viewCount: 0,
      editCount: 0,
      isShared: false
    } as any);

    return project.id;
  }

  static async getUserProjects(userId: string): Promise<EnhancedProject[]> {
    const projects = MockDataStore.getProjects().filter(p => p.userId === userId);
    logger.info('Mock projects retrieved', { userId, count: projects.length });
    return projects;
  }

  static async getProject(projectId: string): Promise<EnhancedProject | null> {
    const projects = MockDataStore.getProjects();
    return projects.find(p => p.id === projectId) || null;
  }

  static async updateProject(projectId: string, updates: Partial<EnhancedProject>): Promise<boolean> {
    return MockDataStore.updateProject(projectId, updates);
  }

  static async deleteProject(projectId: string): Promise<boolean> {
    return MockDataStore.deleteProject(projectId);
  }

  static async duplicateProject(projectId: string, newTitle?: string): Promise<string> {
    const original = await this.getProject(projectId);
    if (!original) throw new Error('Projeto original não encontrado');

    return this.createProject(
      original.userId,
      original.formData,
      original.content,
      {
        ...original,
        title: newTitle || `${original.title} (Cópia)`,
        tags: original.tags
      }
    );
  }

  static async migrateOldProject(project: any): Promise<EnhancedProject> {
    // Para mock, apenas retorna o projeto como está
    return project;
  }

  static async shareProject(projectId: string): Promise<{ shareUrl: string } | null> {
    const project = await this.getProject(projectId);
    if (!project) return null;

    const shareUrl = `${window.location.origin}/shared/${projectId}`;
    MockDataStore.updateProject(projectId, { 
      isShared: true, 
      shareLink: shareUrl 
    } as any);

    return { shareUrl };
  }

  static async exportProject(projectId: string): Promise<{ content: string } | null> {
    const project = await this.getProject(projectId);
    if (!project) return null;

    return {
      content: JSON.stringify(project, null, 2)
    };
  }
}

// Mock Search Service
export class MockSearchService {
  static async searchProjects(userId: string, filters: any): Promise<EnhancedProject[]> {
    let projects = MockDataStore.getProjects().filter(p => p.userId === userId);

    // Apply filters
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      projects = projects.filter(p => 
        p.title.toLowerCase().includes(searchTerm) ||
        p.content.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.tags && filters.tags.length > 0) {
      projects = projects.filter(p => 
        filters.tags.some((tag: string) => p.tags.includes(tag))
      );
    }

    if (filters.platforms && filters.platforms.length > 0) {
      projects = projects.filter(p => 
        filters.platforms.includes(p.formData.platform)
      );
    }

    // Sort
    if (filters.sortBy) {
      projects.sort((a, b) => {
        const aVal = a[filters.sortBy as keyof EnhancedProject];
        const bVal = b[filters.sortBy as keyof EnhancedProject];
        
        if (filters.sortOrder === 'desc') {
          return bVal > aVal ? 1 : -1;
        }
        return aVal > bVal ? 1 : -1;
      });
    }

    logger.info('Mock search executed', { 
      userId, 
      filters: Object.keys(filters), 
      results: projects.length 
    });

    return projects;
  }
}

// Mock Tag Service
export class MockTagService {
  static async getUserTags(userId: string): Promise<string[]> {
    const userProjects = MockDataStore.getProjects().filter(p => p.userId === userId);
    const tags = new Set<string>();
    
    userProjects.forEach(project => {
      project.tags.forEach(tag => tags.add(tag));
    });

    return Array.from(tags);
  }

  static async createTag(userId: string, tagName: string): Promise<string> {
    logger.info('Mock tag created', { userId, tagName });
    return tagName;
  }

  static async deleteTag(userId: string, tagName: string): Promise<boolean> {
    logger.info('Mock tag deleted', { userId, tagName });
    return true;
  }

  static async incrementTagUsage(tags: string[]): Promise<void> {
    logger.debug('Mock tag usage incremented', { tags });
  }

  static async decrementTagUsage(tags: string[]): Promise<void> {
    logger.debug('Mock tag usage decremented', { tags });
  }
}

// Mock Analytics Service
export class MockAnalyticsService {
  trackPageView(userId: string, page: string): void {
    logger.debug('Mock page view tracked', { userId, page });
  }

  trackSearch(userId: string, query: string, results: number): void {
    logger.debug('Mock search tracked', { userId, query, results });
  }

  trackProjectAction(userId: string, action: string, project: any): void {
    logger.debug('Mock project action tracked', { userId, action, projectId: project.id });
  }
}

// Check if Firebase is configured
export const isFirebaseAvailable = (): boolean => {
  try {
    return !!(
      import.meta.env.VITE_FIREBASE_API_KEY &&
      import.meta.env.VITE_FIREBASE_PROJECT_ID
    );
  } catch {
    return false;
  }
};

// Service factory that returns real or mock services
export const createServiceFactory = () => {
  const useFirebase = isFirebaseAvailable();
  
  logger.info('Service factory initialized', { 
    useFirebase,
    mode: useFirebase ? 'Firebase' : 'Mock'
  });

  return {
    async getProjectService() {
      if (useFirebase) {
        const { ProjectService } = await import('./projectService');
        return ProjectService;
      }
      return MockProjectService;
    },

    async getSearchService() {
      if (useFirebase) {
        const { SearchService } = await import('./searchService');
        return SearchService;
      }
      return MockSearchService;
    },

    async getTagService() {
      if (useFirebase) {
        const { TagService } = await import('./tagService');
        return TagService;
      }
      return MockTagService;
    },

    async getAnalyticsService() {
      if (useFirebase) {
        const { analyticsService } = await import('./analyticsService');
        return analyticsService;
      }
      return new MockAnalyticsService();
    }
  };
};

export const serviceFactory = createServiceFactory();
