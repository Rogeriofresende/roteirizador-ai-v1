/**
 * Project Entity - Domain Layer
 * Roteirar IA - Clean Architecture Implementation
 */

export interface ProjectProps {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  status: ProjectStatus;
  visibility: ProjectVisibility;
  scripts: string[]; // Script IDs
  collaborators: ProjectCollaborator[];
  settings: ProjectSettings;
  metadata: ProjectMetadata;
  tags: string[];
  folderId?: string;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt: Date;
  deadline?: Date;
  archiveAt?: Date;
}

export type ProjectStatus = 'active' | 'paused' | 'completed' | 'archived' | 'deleted';
export type ProjectVisibility = 'private' | 'team' | 'public';
export type ProjectRole = 'viewer' | 'editor' | 'admin' | 'owner';

export interface ProjectCollaborator {
  userId: string;
  role: ProjectRole;
  permissions: ProjectPermissions;
  invitedAt: Date;
  joinedAt?: Date;
  lastActiveAt?: Date;
  invitedBy: string;
  status: CollaboratorStatus;
}

export type CollaboratorStatus = 'pending' | 'active' | 'inactive' | 'removed';

export interface ProjectPermissions {
  canViewScripts: boolean;
  canEditScripts: boolean;
  canCreateScripts: boolean;
  canDeleteScripts: boolean;
  canInviteUsers: boolean;
  canManageSettings: boolean;
  canExportProject: boolean;
  canArchiveProject: boolean;
}

export interface ProjectSettings {
  allowPublicViewing: boolean;
  allowComments: boolean;
  allowSuggestions: boolean;
  allowRealTimeEditing: boolean;
  defaultScriptTemplate?: string;
  autoSaveInterval: number; // in seconds
  maxCollaborators: number;
  requireApprovalForChanges: boolean;
  enableVersionHistory: boolean;
  notificationSettings: ProjectNotificationSettings;
}

export interface ProjectNotificationSettings {
  emailNotifications: boolean;
  newCollaborator: boolean;
  scriptChanges: boolean;
  comments: boolean;
  deadlineReminders: boolean;
  weeklyDigest: boolean;
}

export interface ProjectMetadata {
  totalScripts: number;
  totalWords: number;
  totalDuration: number;
  lastModifiedBy?: string;
  version: number;
  platform?: string[];
  category?: string;
  businessGoals?: string[];
  targetAudience?: string[];
}

/**
 * Project Entity - Core business logic for project management
 */
export class Project {
  private constructor(private props: ProjectProps) {}

  // Factory methods
  static create(params: {
    name: string;
    description: string;
    ownerId: string;
    visibility?: ProjectVisibility;
    settings?: Partial<ProjectSettings>;
    tags?: string[];
    folderId?: string;
    deadline?: Date;
  }): Project {
    return new Project({
      id: this.generateProjectId(),
      name: params.name,
      description: params.description,
      ownerId: params.ownerId,
      status: 'active',
      visibility: params.visibility || 'private',
      scripts: [],
      collaborators: [],
      settings: {
        allowPublicViewing: false,
        allowComments: true,
        allowSuggestions: true,
        allowRealTimeEditing: true,
        autoSaveInterval: 30,
        maxCollaborators: 10,
        requireApprovalForChanges: false,
        enableVersionHistory: true,
        notificationSettings: {
          emailNotifications: true,
          newCollaborator: true,
          scriptChanges: true,
          comments: true,
          deadlineReminders: true,
          weeklyDigest: false,
        },
        ...params.settings,
      },
      metadata: {
        totalScripts: 0,
        totalWords: 0,
        totalDuration: 0,
        version: 1,
      },
      tags: params.tags || [],
      folderId: params.folderId,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastAccessedAt: new Date(),
      deadline: params.deadline,
    });
  }

  static fromPersistence(props: ProjectProps): Project {
    return new Project(props);
  }

  // Getters
  get id(): string { return this.props.id; }
  get name(): string { return this.props.name; }
  get description(): string { return this.props.description; }
  get ownerId(): string { return this.props.ownerId; }
  get status(): ProjectStatus { return this.props.status; }
  get visibility(): ProjectVisibility { return this.props.visibility; }
  get scripts(): string[] { return this.props.scripts; }
  get collaborators(): ProjectCollaborator[] { return this.props.collaborators; }
  get settings(): ProjectSettings { return this.props.settings; }
  get metadata(): ProjectMetadata { return this.props.metadata; }
  get tags(): string[] { return this.props.tags; }
  get folderId(): string | undefined { return this.props.folderId; }
  get isFavorite(): boolean { return this.props.isFavorite; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }
  get lastAccessedAt(): Date { return this.props.lastAccessedAt; }
  get deadline(): Date | undefined { return this.props.deadline; }
  get archiveAt(): Date | undefined { return this.props.archiveAt; }

  // Domain methods - Business Rules

  /**
   * Update project name
   */
  updateName(newName: string, userId: string): void {
    this.ensureCanEdit(userId);
    
    if (!newName.trim()) {
      throw new Error('Project name cannot be empty');
    }

    if (newName.length > 100) {
      throw new Error('Project name cannot exceed 100 characters');
    }

    this.props.name = newName.trim();
    this.props.updatedAt = new Date();
    this.props.metadata.lastModifiedBy = userId;
    this.incrementVersion();
  }

  /**
   * Update project description
   */
  updateDescription(newDescription: string, userId: string): void {
    this.ensureCanEdit(userId);

    if (newDescription.length > 1000) {
      throw new Error('Project description cannot exceed 1000 characters');
    }

    this.props.description = newDescription.trim();
    this.props.updatedAt = new Date();
    this.props.metadata.lastModifiedBy = userId;
  }

  /**
   * Add script to project
   */
  addScript(scriptId: string, userId: string): void {
    this.ensureCanCreateScripts(userId);

    if (this.props.scripts.includes(scriptId)) {
      throw new Error('Script is already in this project');
    }

    if (this.props.scripts.length >= 100) {
      throw new Error('Cannot add more than 100 scripts to a project');
    }

    this.props.scripts.push(scriptId);
    this.props.metadata.totalScripts = this.props.scripts.length;
    this.props.updatedAt = new Date();
    this.props.metadata.lastModifiedBy = userId;
    this.updateLastAccess(userId);
  }

  /**
   * Remove script from project
   */
  removeScript(scriptId: string, userId: string): void {
    this.ensureCanDeleteScripts(userId);

    const index = this.props.scripts.indexOf(scriptId);
    if (index === -1) {
      throw new Error('Script not found in project');
    }

    this.props.scripts.splice(index, 1);
    this.props.metadata.totalScripts = this.props.scripts.length;
    this.props.updatedAt = new Date();
    this.props.metadata.lastModifiedBy = userId;
  }

  /**
   * Invite collaborator to project
   */
  inviteCollaborator(params: {
    userId: string;
    role: ProjectRole;
    invitedBy: string;
    customPermissions?: Partial<ProjectPermissions>;
  }): void {
    this.ensureCanInviteUsers(params.invitedBy);

    if (params.userId === this.props.ownerId) {
      throw new Error('Cannot invite project owner as collaborator');
    }

    if (this.props.collaborators.some(c => c.userId === params.userId)) {
      throw new Error('User is already a collaborator');
    }

    if (this.props.collaborators.length >= this.props.settings.maxCollaborators) {
      throw new Error(`Cannot exceed maximum of ${this.props.settings.maxCollaborators} collaborators`);
    }

    const permissions = params.customPermissions || this.getDefaultPermissionsForRole(params.role);

    const collaborator: ProjectCollaborator = {
      userId: params.userId,
      role: params.role,
      permissions,
      invitedAt: new Date(),
      invitedBy: params.invitedBy,
      status: 'pending',
    };

    this.props.collaborators.push(collaborator);
    this.props.updatedAt = new Date();
  }

  /**
   * Accept collaboration invitation
   */
  acceptInvitation(userId: string): void {
    const collaborator = this.props.collaborators.find(c => c.userId === userId);
    
    if (!collaborator) {
      throw new Error('Collaboration invitation not found');
    }

    if (collaborator.status !== 'pending') {
      throw new Error('Invitation is not pending');
    }

    collaborator.status = 'active';
    collaborator.joinedAt = new Date();
    collaborator.lastActiveAt = new Date();
    this.props.updatedAt = new Date();
  }

  /**
   * Remove collaborator from project
   */
  removeCollaborator(targetUserId: string, requestingUserId: string): void {
    // Owner can remove anyone, collaborators can only remove themselves
    if (requestingUserId !== this.props.ownerId && requestingUserId !== targetUserId) {
      this.ensureCanManageSettings(requestingUserId);
    }

    const collaboratorIndex = this.props.collaborators.findIndex(c => c.userId === targetUserId);
    
    if (collaboratorIndex === -1) {
      throw new Error('Collaborator not found');
    }

    this.props.collaborators[collaboratorIndex].status = 'removed';
    this.props.updatedAt = new Date();
  }

  /**
   * Update collaborator role
   */
  updateCollaboratorRole(targetUserId: string, newRole: ProjectRole, requestingUserId: string): void {
    this.ensureIsOwner(requestingUserId);

    const collaborator = this.props.collaborators.find(c => c.userId === targetUserId);
    
    if (!collaborator) {
      throw new Error('Collaborator not found');
    }

    if (collaborator.status !== 'active') {
      throw new Error('Cannot update role of inactive collaborator');
    }

    collaborator.role = newRole;
    collaborator.permissions = this.getDefaultPermissionsForRole(newRole);
    this.props.updatedAt = new Date();
  }

  /**
   * Update project settings
   */
  updateSettings(newSettings: Partial<ProjectSettings>, userId: string): void {
    this.ensureCanManageSettings(userId);

    // Validate maxCollaborators
    if (newSettings.maxCollaborators !== undefined) {
      if (newSettings.maxCollaborators < 1 || newSettings.maxCollaborators > 50) {
        throw new Error('Max collaborators must be between 1 and 50');
      }

      const activeCollaborators = this.props.collaborators.filter(c => c.status === 'active').length;
      if (newSettings.maxCollaborators < activeCollaborators) {
        throw new Error('Cannot set max collaborators below current active count');
      }
    }

    // Validate autoSaveInterval
    if (newSettings.autoSaveInterval !== undefined) {
      if (newSettings.autoSaveInterval < 10 || newSettings.autoSaveInterval > 300) {
        throw new Error('Auto save interval must be between 10 and 300 seconds');
      }
    }

    this.props.settings = {
      ...this.props.settings,
      ...newSettings,
    };

    this.props.updatedAt = new Date();
    this.props.metadata.lastModifiedBy = userId;
  }

  /**
   * Add tag to project
   */
  addTag(tag: string, userId: string): void {
    this.ensureCanEdit(userId);

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
   * Remove tag from project
   */
  removeTag(tag: string, userId: string): void {
    this.ensureCanEdit(userId);

    const normalizedTag = tag.toLowerCase().trim();
    const index = this.props.tags.indexOf(normalizedTag);
    
    if (index > -1) {
      this.props.tags.splice(index, 1);
      this.props.updatedAt = new Date();
    }
  }

  /**
   * Mark as favorite
   */
  markAsFavorite(userId: string): void {
    this.ensureCanView(userId);
    this.props.isFavorite = true;
    this.updateLastAccess(userId);
  }

  /**
   * Unmark as favorite
   */
  unmarkAsFavorite(userId: string): void {
    this.ensureCanView(userId);
    this.props.isFavorite = false;
    this.updateLastAccess(userId);
  }

  /**
   * Update project status
   */
  updateStatus(newStatus: ProjectStatus, userId: string): void {
    this.ensureCanManageSettings(userId);

    if (this.props.status === 'deleted' && newStatus !== 'active') {
      throw new Error('Cannot change status of deleted project');
    }

    this.props.status = newStatus;
    this.props.updatedAt = new Date();
    this.props.metadata.lastModifiedBy = userId;

    if (newStatus === 'archived') {
      this.props.archiveAt = new Date();
    }
  }

  /**
   * Set deadline
   */
  setDeadline(deadline: Date, userId: string): void {
    this.ensureCanManageSettings(userId);

    if (deadline <= new Date()) {
      throw new Error('Deadline must be in the future');
    }

    this.props.deadline = deadline;
    this.props.updatedAt = new Date();
  }

  /**
   * Remove deadline
   */
  removeDeadline(userId: string): void {
    this.ensureCanManageSettings(userId);
    this.props.deadline = undefined;
    this.props.updatedAt = new Date();
  }

  /**
   * Update last access time
   */
  updateLastAccess(userId: string): void {
    this.props.lastAccessedAt = new Date();
    
    const collaborator = this.props.collaborators.find(c => c.userId === userId);
    if (collaborator) {
      collaborator.lastActiveAt = new Date();
    }
  }

  /**
   * Update project metadata
   */
  updateMetadata(updates: Partial<ProjectMetadata>, userId: string): void {
    this.ensureCanEdit(userId);

    this.props.metadata = {
      ...this.props.metadata,
      ...updates,
      lastModifiedBy: userId,
    };

    this.props.updatedAt = new Date();
  }

  /**
   * Check if user can view project
   */
  canBeViewedBy(userId: string): boolean {
    // Owner can always view
    if (this.props.ownerId === userId) {
      return true;
    }

    // Deleted projects can only be viewed by owner
    if (this.props.status === 'deleted') {
      return false;
    }

    // Public projects can be viewed by anyone
    if (this.props.visibility === 'public') {
      return true;
    }

    // Active collaborators can view
    const collaborator = this.props.collaborators.find(c => c.userId === userId);
    return collaborator?.status === 'active' && collaborator.permissions.canViewScripts;
  }

  /**
   * Check if user can edit project
   */
  canBeEditedBy(userId: string): boolean {
    // Owner can always edit (unless deleted)
    if (this.props.ownerId === userId && this.props.status !== 'deleted') {
      return true;
    }

    // Active collaborators with edit permissions
    const collaborator = this.props.collaborators.find(c => c.userId === userId);
    return collaborator?.status === 'active' && collaborator.permissions.canEditScripts;
  }

  /**
   * Get project analytics
   */
  getAnalytics(): {
    totalScripts: number;
    totalWords: number;
    totalDuration: number;
    activeCollaborators: number;
    lastActivity: Date;
    completionRate: number;
    isOverdue: boolean;
  } {
    const activeCollaborators = this.props.collaborators.filter(c => c.status === 'active').length;
    const completionRate = this.props.status === 'completed' ? 100 : 
                          this.props.status === 'active' ? 50 : 0;
    const isOverdue = this.props.deadline ? new Date() > this.props.deadline : false;

    return {
      totalScripts: this.props.metadata.totalScripts,
      totalWords: this.props.metadata.totalWords,
      totalDuration: this.props.metadata.totalDuration,
      activeCollaborators,
      lastActivity: this.props.lastAccessedAt,
      completionRate,
      isOverdue,
    };
  }

  /**
   * Get project for persistence
   */
  toPersistence(): ProjectProps {
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
   * Get default permissions for role
   */
  private getDefaultPermissionsForRole(role: ProjectRole): ProjectPermissions {
    switch (role) {
      case 'owner':
        return {
          canViewScripts: true,
          canEditScripts: true,
          canCreateScripts: true,
          canDeleteScripts: true,
          canInviteUsers: true,
          canManageSettings: true,
          canExportProject: true,
          canArchiveProject: true,
        };
      case 'admin':
        return {
          canViewScripts: true,
          canEditScripts: true,
          canCreateScripts: true,
          canDeleteScripts: true,
          canInviteUsers: true,
          canManageSettings: true,
          canExportProject: true,
          canArchiveProject: false,
        };
      case 'editor':
        return {
          canViewScripts: true,
          canEditScripts: true,
          canCreateScripts: true,
          canDeleteScripts: false,
          canInviteUsers: false,
          canManageSettings: false,
          canExportProject: true,
          canArchiveProject: false,
        };
      case 'viewer':
      default:
        return {
          canViewScripts: true,
          canEditScripts: false,
          canCreateScripts: false,
          canDeleteScripts: false,
          canInviteUsers: false,
          canManageSettings: false,
          canExportProject: false,
          canArchiveProject: false,
        };
    }
  }

  /**
   * Permission check helpers
   */
  private ensureIsOwner(userId: string): void {
    if (this.props.ownerId !== userId) {
      throw new Error('Only project owner can perform this action');
    }
  }

  private ensureCanView(userId: string): void {
    if (!this.canBeViewedBy(userId)) {
      throw new Error('User does not have permission to view this project');
    }
  }

  private ensureCanEdit(userId: string): void {
    if (!this.canBeEditedBy(userId)) {
      throw new Error('User does not have permission to edit this project');
    }
  }

  private ensureCanCreateScripts(userId: string): void {
    if (this.props.ownerId === userId) return;
    
    const collaborator = this.props.collaborators.find(c => c.userId === userId);
    if (!collaborator?.permissions.canCreateScripts) {
      throw new Error('User does not have permission to create scripts');
    }
  }

  private ensureCanDeleteScripts(userId: string): void {
    if (this.props.ownerId === userId) return;
    
    const collaborator = this.props.collaborators.find(c => c.userId === userId);
    if (!collaborator?.permissions.canDeleteScripts) {
      throw new Error('User does not have permission to delete scripts');
    }
  }

  private ensureCanInviteUsers(userId: string): void {
    if (this.props.ownerId === userId) return;
    
    const collaborator = this.props.collaborators.find(c => c.userId === userId);
    if (!collaborator?.permissions.canInviteUsers) {
      throw new Error('User does not have permission to invite users');
    }
  }

  private ensureCanManageSettings(userId: string): void {
    if (this.props.ownerId === userId) return;
    
    const collaborator = this.props.collaborators.find(c => c.userId === userId);
    if (!collaborator?.permissions.canManageSettings) {
      throw new Error('User does not have permission to manage settings');
    }
  }

  // Static methods

  /**
   * Generate unique project ID
   */
  private static generateProjectId(): string {
    return `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Validate project name
   */
  static isValidName(name: string): boolean {
    return name.trim().length >= 3 && name.trim().length <= 100;
  }

  /**
   * Get project visibility options for user
   */
  static getVisibilityOptions(userSubscription: 'free' | 'pro' | 'enterprise'): ProjectVisibility[] {
    const baseOptions: ProjectVisibility[] = ['private'];
    
    if (userSubscription === 'pro' || userSubscription === 'enterprise') {
      baseOptions.push('team');
    }
    
    if (userSubscription === 'enterprise') {
      baseOptions.push('public');
    }
    
    return baseOptions;
  }
} 