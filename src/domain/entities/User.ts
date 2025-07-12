/**
 * User Entity - Domain Layer
 * Roteirar IA - Clean Architecture Implementation
 */

import { UserRole, UserPermissions } from '../../types/auth';

export interface UserProps {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
  role: UserRole;
  isActive: boolean;
  isBlocked: boolean;
  createdAt: Date;
  lastLoginAt: Date;
  lastActiveAt: Date;
  preferences: UserPreferences;
  subscription: SubscriptionTier;
  adminMetadata?: AdminMetadata;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: boolean;
  analyticsOptIn: boolean;
}

export type SubscriptionTier = 'free' | 'pro' | 'enterprise';

export interface AdminMetadata {
  adminSince: Date;
  lastAdminAction: Date;
  adminNotes?: string;
}

/**
 * User Entity - Core business logic for user management
 */
export class User {
  private constructor(private props: UserProps) {}

  // Factory methods
  static create(props: Omit<UserProps, 'id' | 'createdAt' | 'lastLoginAt' | 'lastActiveAt'>): User {
    return new User({
      ...props,
      id: this.generateUserId(),
      createdAt: new Date(),
      lastLoginAt: new Date(),
      lastActiveAt: new Date(),
    });
  }

  static fromPersistence(props: UserProps): User {
    return new User(props);
  }

  // Getters
  get id(): string { return this.props.id; }
  get email(): string { return this.props.email; }
  get displayName(): string | undefined { return this.props.displayName; }
  get photoURL(): string | undefined { return this.props.photoURL; }
  get emailVerified(): boolean { return this.props.emailVerified; }
  get role(): UserRole { return this.props.role; }
  get isActive(): boolean { return this.props.isActive; }
  get isBlocked(): boolean { return this.props.isBlocked; }
  get createdAt(): Date { return this.props.createdAt; }
  get lastLoginAt(): Date { return this.props.lastLoginAt; }
  get lastActiveAt(): Date { return this.props.lastActiveAt; }
  get preferences(): UserPreferences { return this.props.preferences; }
  get subscription(): SubscriptionTier { return this.props.subscription; }
  get adminMetadata(): AdminMetadata | undefined { return this.props.adminMetadata; }

  // Domain methods - Business Rules

  /**
   * Authenticate user login
   */
  authenticate(): void {
    if (this.props.isBlocked) {
      throw new Error('User account is blocked');
    }

    if (!this.props.isActive) {
      throw new Error('User account is inactive');
    }

    if (!this.props.emailVerified) {
      throw new Error('Email not verified');
    }

    this.updateLastLogin();
  }

  /**
   * Update user activity
   */
  updateActivity(): void {
    this.props.lastActiveAt = new Date();
  }

  /**
   * Update last login time
   */
  private updateLastLogin(): void {
    this.props.lastLoginAt = new Date();
    this.updateActivity();
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(permission: keyof UserPermissions): boolean {
    const permissions = this.getPermissions();
    return permissions[permission];
  }

  /**
   * Get user permissions based on role
   */
  getPermissions(): UserPermissions {
    const basePermissions: UserPermissions = {
      // Project permissions
      canCreateProjects: true,
      canEditOwnProjects: true,
      canDeleteOwnProjects: true,
      canShareProjects: true,
      
      // Admin permissions (default false)
      canViewAdminDashboard: false,
      canManageUsers: false,
      canViewSystemLogs: false,
      canModifySystemSettings: false,
      canViewAdvancedAnalytics: false,
      
      // Special permissions
      canAccessBetaFeatures: false,
      canExportProjects: true,
      canUseAIFeatures: true,
    };

    if (this.props.role === 'admin') {
      return {
        ...basePermissions,
        canViewAdminDashboard: true,
        canManageUsers: true,
        canViewSystemLogs: true,
        canModifySystemSettings: true,
        canViewAdvancedAnalytics: true,
        canAccessBetaFeatures: true,
      };
    }

    // Subscription-based permissions
    if (this.props.subscription === 'pro' || this.props.subscription === 'enterprise') {
      basePermissions.canAccessBetaFeatures = true;
    }

    return basePermissions;
  }

  /**
   * Block user account
   */
  block(adminUserId: string, reason?: string): void {
    if (this.props.role === 'admin') {
      throw new Error('Cannot block admin user');
    }

    this.props.isBlocked = true;
    this.props.isActive = false;
    
    if (this.props.adminMetadata) {
      this.props.adminMetadata.lastAdminAction = new Date();
      this.props.adminMetadata.adminNotes = reason || 'User blocked';
    }
  }

  /**
   * Unblock user account
   */
  unblock(adminUserId: string): void {
    this.props.isBlocked = false;
    this.props.isActive = true;
    
    if (this.props.adminMetadata) {
      this.props.adminMetadata.lastAdminAction = new Date();
      this.props.adminMetadata.adminNotes = 'User unblocked';
    }
  }

  /**
   * Promote to admin
   */
  promoteToAdmin(promoterAdminId: string): void {
    if (this.props.role === 'admin') {
      throw new Error('User is already an admin');
    }

    this.props.role = 'admin';
    this.props.adminMetadata = {
      adminSince: new Date(),
      lastAdminAction: new Date(),
      adminNotes: `Promoted by admin ${promoterAdminId}`,
    };
  }

  /**
   * Demote from admin
   */
  demoteFromAdmin(demotorAdminId: string): void {
    if (this.props.role !== 'admin') {
      throw new Error('User is not an admin');
    }

    this.props.role = 'user';
    this.props.adminMetadata = undefined;
  }

  /**
   * Update user preferences
   */
  updatePreferences(preferences: Partial<UserPreferences>): void {
    this.props.preferences = {
      ...this.props.preferences,
      ...preferences,
    };
  }

  /**
   * Upgrade subscription
   */
  upgradeSubscription(tier: SubscriptionTier): void {
    const tierOrder = { free: 0, pro: 1, enterprise: 2 };
    
    if (tierOrder[tier] <= tierOrder[this.props.subscription]) {
      throw new Error('Cannot downgrade or maintain same subscription tier');
    }

    this.props.subscription = tier;
  }

  /**
   * Check if user can perform action based on subscription
   */
  canPerformActionBySubscription(action: 'ai_generation' | 'export' | 'collaboration' | 'analytics'): boolean {
    switch (action) {
      case 'ai_generation':
        return true; // All tiers can use AI
      case 'export':
        return this.props.subscription !== 'free';
      case 'collaboration':
        return this.props.subscription === 'enterprise';
      case 'analytics':
        return this.props.subscription === 'pro' || this.props.subscription === 'enterprise';
      default:
        return false;
    }
  }

  /**
   * Get user for persistence
   */
  toPersistence(): UserProps {
    return { ...this.props };
  }

  /**
   * Generate unique user ID
   */
  private static generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Check if user is admin by email
   */
  static isAdminEmail(email: string): boolean {
    const adminEmails = [
      'admin@roteirar.ai',
      'rogerio@roteirar.ai',
      // Add more admin emails as needed
    ];
    return adminEmails.includes(email.toLowerCase());
  }
} 