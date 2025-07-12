// Infrastructure Layer - Project Repository Implementation
// Concrete repository for Project entities using Firestore

import { DocumentData, Timestamp } from 'firebase/firestore';
import { FirestoreRepository, QueryOptions } from './FirestoreRepository';
import { createLogger } from '../../utils/logger';

const logger = createLogger('ProjectRepository');

export interface Project {
  id?: string;
  ownerId: string;
  title: string;
  description: string;
  category: 'Marketing' | 'Education' | 'Entertainment' | 'Business' | 'Personal' | 'News' | 'Tutorial';
  platform: 'YouTube' | 'Instagram' | 'TikTok' | 'LinkedIn' | 'Twitter' | 'Facebook' | 'Podcast' | 'Multi';
  status: 'planning' | 'active' | 'completed' | 'paused' | 'cancelled';
  privacy: 'public' | 'private' | 'team';
  settings: {
    allowInvites: boolean;
    requireApproval: boolean;
    maxCollaborators: number;
    defaultRole: 'viewer' | 'editor' | 'admin';
    notifications: {
      newCollaborator: boolean;
      scriptUpdates: boolean;
      deadlineReminders: boolean;
    };
  };
  collaborators: {
    userId: string;
    role: 'owner' | 'admin' | 'editor' | 'viewer';
    permissions: {
      canEdit: boolean;
      canInvite: boolean;
      canManageSettings: boolean;
      canDeleteProject: boolean;
    };
    joinedAt: Timestamp;
    lastActiveAt: Timestamp;
    invitedBy?: string;
  }[];
  content: {
    scripts: string[]; // Script IDs
    templates: string[]; // Template IDs
    resources: {
      id: string;
      name: string;
      type: 'link' | 'file' | 'note';
      url?: string;
      content?: string;
      uploadedBy: string;
      uploadedAt: Timestamp;
    }[];
  };
  timeline: {
    milestones: {
      id: string;
      title: string;
      description: string;
      dueDate: Timestamp;
      completed: boolean;
      completedAt?: Timestamp;
      completedBy?: string;
    }[];
    deadlines: {
      id: string;
      title: string;
      description: string;
      date: Timestamp;
      priority: 'low' | 'medium' | 'high';
      completed: boolean;
      assignedTo?: string;
    }[];
  };
  analytics: {
    totalCollaborators: number;
    totalScripts: number;
    totalTemplates: number;
    completionRate: number;
    activityScore: number;
    lastActivity: Timestamp;
  };
  metadata: {
    createdAt: Timestamp;
    updatedAt: Timestamp;
    completedAt?: Timestamp;
    archivedAt?: Timestamp;
    tags: string[];
    version: number;
  };
}

export interface ProjectFilters {
  ownerId?: string;
  userId?: string; // User is owner or collaborator
  category?: string;
  platform?: string;
  status?: 'planning' | 'active' | 'completed' | 'paused' | 'cancelled';
  privacy?: 'public' | 'private' | 'team';
  createdAfter?: Date;
  updatedAfter?: Date;
  completedAfter?: Date;
  tags?: string[];
  hasDeadlines?: boolean;
  isActive?: boolean;
}

export interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  projectsByCategory: Record<string, number>;
  projectsByPlatform: Record<string, number>;
  projectsByStatus: Record<string, number>;
  averageCompletionRate: number;
  totalCollaborators: number;
  projectsCreatedToday: number;
  projectsCreatedThisWeek: number;
  projectsCreatedThisMonth: number;
}

export class ProjectRepository extends FirestoreRepository<Project> {
  constructor() {
    super({
      collectionName: 'projects',
      enableLogging: true,
      enableCache: true
    });
  }

  /**
   * Map Firestore document to Project entity
   */
  protected mapToEntity(data: DocumentData): Project {
    return {
      ownerId: data.ownerId,
      title: data.title,
      description: data.description,
      category: data.category,
      platform: data.platform,
      status: data.status || 'planning',
      privacy: data.privacy || 'private',
      settings: {
        allowInvites: data.settings?.allowInvites ?? true,
        requireApproval: data.settings?.requireApproval ?? false,
        maxCollaborators: data.settings?.maxCollaborators || 10,
        defaultRole: data.settings?.defaultRole || 'viewer',
        notifications: {
          newCollaborator: data.settings?.notifications?.newCollaborator ?? true,
          scriptUpdates: data.settings?.notifications?.scriptUpdates ?? true,
          deadlineReminders: data.settings?.notifications?.deadlineReminders ?? true
        }
      },
      collaborators: data.collaborators || [],
      content: {
        scripts: data.content?.scripts || [],
        templates: data.content?.templates || [],
        resources: data.content?.resources || []
      },
      timeline: {
        milestones: data.timeline?.milestones || [],
        deadlines: data.timeline?.deadlines || []
      },
      analytics: {
        totalCollaborators: data.analytics?.totalCollaborators || 0,
        totalScripts: data.analytics?.totalScripts || 0,
        totalTemplates: data.analytics?.totalTemplates || 0,
        completionRate: data.analytics?.completionRate || 0,
        activityScore: data.analytics?.activityScore || 0,
        lastActivity: data.analytics?.lastActivity || Timestamp.now()
      },
      metadata: {
        createdAt: data.metadata?.createdAt || data.createdAt || Timestamp.now(),
        updatedAt: data.metadata?.updatedAt || data.updatedAt || Timestamp.now(),
        completedAt: data.metadata?.completedAt,
        archivedAt: data.metadata?.archivedAt,
        tags: data.metadata?.tags || [],
        version: data.metadata?.version || 1
      }
    };
  }

  /**
   * Map Project entity to Firestore document
   */
  protected mapFromEntity(entity: Project): DocumentData {
    return {
      ownerId: entity.ownerId,
      title: entity.title,
      description: entity.description,
      category: entity.category,
      platform: entity.platform,
      status: entity.status,
      privacy: entity.privacy,
      settings: entity.settings,
      collaborators: entity.collaborators,
      content: entity.content,
      timeline: entity.timeline,
      analytics: entity.analytics,
      metadata: entity.metadata
    };
  }

  /**
   * Find projects by owner ID
   */
  async findByOwnerId(ownerId: string, limit = 20): Promise<Project[]> {
    try {
      return await this.find({
        where: [{ field: 'ownerId', operator: '==', value: ownerId }],
        orderBy: [{ field: 'metadata.updatedAt', direction: 'desc' }],
        limit
      });
    } catch (error) {
      this.logger.error(`Error finding projects for owner ${ownerId}:`, error);
      throw error;
    }
  }

  /**
   * Find projects by user (owner or collaborator)
   */
  async findByUser(userId: string, filters?: Partial<ProjectFilters>, limit = 20): Promise<Project[]> {
    try {
      // First, get projects where user is owner
      const ownedProjects = await this.find({
        where: [{ field: 'ownerId', operator: '==', value: userId }],
        orderBy: [{ field: 'metadata.updatedAt', direction: 'desc' }],
        limit
      });

      // Then, get projects where user is collaborator
      const collaboratedProjects = await this.find({
        where: [{ field: 'collaborators', operator: 'array-contains', value: { userId } }],
        orderBy: [{ field: 'metadata.updatedAt', direction: 'desc' }],
        limit
      });

      // Combine and deduplicate
      const allProjects = [...ownedProjects];
      collaboratedProjects.forEach(project => {
        if (!allProjects.find(p => p.id === project.id)) {
          allProjects.push(project);
        }
      });

      // Apply filters if provided
      let filteredProjects = allProjects;
      if (filters) {
        filteredProjects = allProjects.filter(project => {
          if (filters.category && project.category !== filters.category) return false;
          if (filters.platform && project.platform !== filters.platform) return false;
          if (filters.status && project.status !== filters.status) return false;
          if (filters.privacy && project.privacy !== filters.privacy) return false;
          if (filters.isActive !== undefined) {
            const isActive = project.status === 'active' || project.status === 'planning';
            if (filters.isActive !== isActive) return false;
          }
          return true;
        });
      }

      // Sort by updated date and limit
      return filteredProjects
        .sort((a, b) => b.metadata.updatedAt.toMillis() - a.metadata.updatedAt.toMillis())
        .slice(0, limit);
    } catch (error) {
      this.logger.error(`Error finding projects for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Find public projects
   */
  async findPublicProjects(limit = 20): Promise<Project[]> {
    try {
      return await this.find({
        where: [{ field: 'privacy', operator: '==', value: 'public' }],
        orderBy: [{ field: 'analytics.activityScore', direction: 'desc' }],
        limit
      });
    } catch (error) {
      this.logger.error('Error finding public projects:', error);
      throw error;
    }
  }

  /**
   * Check if user has collaboration access
   */
  async hasCollaborationAccess(projectId: string, userId: string): Promise<boolean> {
    try {
      const project = await this.getById(projectId);
      if (!project) return false;

      // Owner always has access
      if (project.ownerId === userId) return true;

      // Check if user is a collaborator
      return project.collaborators.some(collab => collab.userId === userId);
    } catch (error) {
      this.logger.error(`Error checking collaboration access for project ${projectId} and user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Check if user has collaboration rights (can edit)
   */
  async hasCollaborationRights(projectId: string, userId: string): Promise<boolean> {
    try {
      const project = await this.getById(projectId);
      if (!project) return false;

      // Owner always has rights
      if (project.ownerId === userId) return true;

      // Check if user is a collaborator with edit rights
      const collaborator = project.collaborators.find(collab => collab.userId === userId);
      return collaborator?.permissions.canEdit || false;
    } catch (error) {
      this.logger.error(`Error checking collaboration rights for project ${projectId} and user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Add collaborator to project
   */
  async addCollaborator(projectId: string, collaborator: {
    userId: string;
    role: 'admin' | 'editor' | 'viewer';
    invitedBy: string;
  }): Promise<Project> {
    try {
      const project = await this.getById(projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      // Check if user is already a collaborator
      if (project.collaborators.some(collab => collab.userId === collaborator.userId)) {
        throw new Error('User is already a collaborator');
      }

      // Check max collaborators limit
      if (project.collaborators.length >= project.settings.maxCollaborators) {
        throw new Error('Maximum number of collaborators reached');
      }

      const newCollaborator = {
        userId: collaborator.userId,
        role: collaborator.role,
        permissions: this.getPermissionsForRole(collaborator.role),
        joinedAt: Timestamp.now(),
        lastActiveAt: Timestamp.now(),
        invitedBy: collaborator.invitedBy
      };

      const updatedCollaborators = [...project.collaborators, newCollaborator];

      return await this.update(projectId, {
        collaborators: updatedCollaborators,
        'analytics.totalCollaborators': updatedCollaborators.length,
        'metadata.updatedAt': Timestamp.now()
      } as Partial<Project>);
    } catch (error) {
      this.logger.error(`Error adding collaborator to project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Remove collaborator from project
   */
  async removeCollaborator(projectId: string, userId: string): Promise<Project> {
    try {
      const project = await this.getById(projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      const updatedCollaborators = project.collaborators.filter(collab => collab.userId !== userId);

      return await this.update(projectId, {
        collaborators: updatedCollaborators,
        'analytics.totalCollaborators': updatedCollaborators.length,
        'metadata.updatedAt': Timestamp.now()
      } as Partial<Project>);
    } catch (error) {
      this.logger.error(`Error removing collaborator from project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Update collaborator role
   */
  async updateCollaboratorRole(projectId: string, userId: string, role: 'admin' | 'editor' | 'viewer'): Promise<Project> {
    try {
      const project = await this.getById(projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      const updatedCollaborators = project.collaborators.map(collab => {
        if (collab.userId === userId) {
          return {
            ...collab,
            role,
            permissions: this.getPermissionsForRole(role)
          };
        }
        return collab;
      });

      return await this.update(projectId, {
        collaborators: updatedCollaborators,
        'metadata.updatedAt': Timestamp.now()
      } as Partial<Project>);
    } catch (error) {
      this.logger.error(`Error updating collaborator role for project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Add script to project
   */
  async addScript(projectId: string, scriptId: string): Promise<Project> {
    try {
      const project = await this.getById(projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      if (project.content.scripts.includes(scriptId)) {
        throw new Error('Script already in project');
      }

      const updatedScripts = [...project.content.scripts, scriptId];

      return await this.update(projectId, {
        'content.scripts': updatedScripts,
        'analytics.totalScripts': updatedScripts.length,
        'analytics.lastActivity': Timestamp.now(),
        'metadata.updatedAt': Timestamp.now()
      } as Partial<Project>);
    } catch (error) {
      this.logger.error(`Error adding script to project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Remove script from project
   */
  async removeScript(projectId: string, scriptId: string): Promise<Project> {
    try {
      const project = await this.getById(projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      const updatedScripts = project.content.scripts.filter(id => id !== scriptId);

      return await this.update(projectId, {
        'content.scripts': updatedScripts,
        'analytics.totalScripts': updatedScripts.length,
        'metadata.updatedAt': Timestamp.now()
      } as Partial<Project>);
    } catch (error) {
      this.logger.error(`Error removing script from project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Update project status
   */
  async updateStatus(projectId: string, status: Project['status']): Promise<Project> {
    try {
      const updates: any = {
        status,
        'metadata.updatedAt': Timestamp.now()
      };

      if (status === 'completed') {
        updates['metadata.completedAt'] = Timestamp.now();
      }

      return await this.update(projectId, updates);
    } catch (error) {
      this.logger.error(`Error updating status for project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Get project statistics
   */
  async getProjectStats(userId?: string): Promise<ProjectStats> {
    try {
      const query: QueryOptions = {
        where: userId ? [{ field: 'ownerId', operator: '==', value: userId }] : []
      };

      const projects = await this.find(query);
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      const stats: ProjectStats = {
        totalProjects: projects.length,
        activeProjects: projects.filter(p => p.status === 'active' || p.status === 'planning').length,
        completedProjects: projects.filter(p => p.status === 'completed').length,
        projectsByCategory: {},
        projectsByPlatform: {},
        projectsByStatus: {},
        averageCompletionRate: 0,
        totalCollaborators: 0,
        projectsCreatedToday: 0,
        projectsCreatedThisWeek: 0,
        projectsCreatedThisMonth: 0
      };

      let totalCompletionRate = 0;

      projects.forEach(project => {
        // Count by category, platform, and status
        stats.projectsByCategory[project.category] = (stats.projectsByCategory[project.category] || 0) + 1;
        stats.projectsByPlatform[project.platform] = (stats.projectsByPlatform[project.platform] || 0) + 1;
        stats.projectsByStatus[project.status] = (stats.projectsByStatus[project.status] || 0) + 1;

        // Sum completion rates and collaborators
        totalCompletionRate += project.analytics.completionRate;
        stats.totalCollaborators += project.analytics.totalCollaborators;

        // Count new projects
        const createdAt = project.metadata.createdAt.toDate();
        if (createdAt >= today) stats.projectsCreatedToday++;
        if (createdAt >= weekAgo) stats.projectsCreatedThisWeek++;
        if (createdAt >= monthAgo) stats.projectsCreatedThisMonth++;
      });

      // Calculate average completion rate
      stats.averageCompletionRate = projects.length > 0 ? totalCompletionRate / projects.length : 0;

      return stats;
    } catch (error) {
      this.logger.error('Error getting project stats:', error);
      throw error;
    }
  }

  /**
   * Get permissions for role
   */
  private getPermissionsForRole(role: 'owner' | 'admin' | 'editor' | 'viewer') {
    switch (role) {
      case 'owner':
        return {
          canEdit: true,
          canInvite: true,
          canManageSettings: true,
          canDeleteProject: true
        };
      case 'admin':
        return {
          canEdit: true,
          canInvite: true,
          canManageSettings: true,
          canDeleteProject: false
        };
      case 'editor':
        return {
          canEdit: true,
          canInvite: false,
          canManageSettings: false,
          canDeleteProject: false
        };
      case 'viewer':
      default:
        return {
          canEdit: false,
          canInvite: false,
          canManageSettings: false,
          canDeleteProject: false
        };
    }
  }
} 