// Infrastructure Layer - User Repository Implementation
// Concrete repository for User entities using Firestore

import { DocumentData, Timestamp } from 'firebase/firestore';
import { FirestoreRepository, QueryOptions } from './FirestoreRepository';
import { createLogger } from '../../utils/logger';

const logger = createLogger('UserRepository');

export interface User {
  id?: string;
  uid: string; // Firebase Auth UID
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
  role: 'user' | 'admin' | 'moderator';
  subscription: 'free' | 'pro' | 'enterprise';
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: 'pt' | 'en' | 'es';
    notifications: {
      email: boolean;
      push: boolean;
      marketing: boolean;
    };
    defaults: {
      platform: string;
      tone: string;
      audience: string;
    };
  };
  usage: {
    scriptsGenerated: number;
    templatesCreated: number;
    collaborationsStarted: number;
    lastActivity: Timestamp;
  };
  metadata: {
    createdAt: Timestamp;
    updatedAt: Timestamp;
    lastLoginAt?: Timestamp;
    isActive: boolean;
    isBanned: boolean;
    banReason?: string;
  };
}

export interface UserProfile {
  id: string;
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: string;
  subscription: string;
  emailVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  lastActivity: Date;
}

export interface UserFilters {
  role?: 'user' | 'admin' | 'moderator';
  subscription?: 'free' | 'pro' | 'enterprise';
  emailVerified?: boolean;
  isActive?: boolean;
  isBanned?: boolean;
  createdAfter?: Date;
  lastActivityAfter?: Date;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  usersByRole: Record<string, number>;
  usersBySubscription: Record<string, number>;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
}

export class UserRepository extends FirestoreRepository<User> {
  constructor() {
    super({
      collectionName: 'users',
      enableLogging: true,
      enableCache: true
    });
  }

  /**
   * Map Firestore document to User entity
   */
  protected mapToEntity(data: DocumentData): User {
    return {
      uid: data.uid,
      email: data.email,
      displayName: data.displayName,
      photoURL: data.photoURL,
      emailVerified: data.emailVerified || false,
      role: data.role || 'user',
      subscription: data.subscription || 'free',
      preferences: {
        theme: data.preferences?.theme || 'light',
        language: data.preferences?.language || 'pt',
        notifications: {
          email: data.preferences?.notifications?.email ?? true,
          push: data.preferences?.notifications?.push ?? true,
          marketing: data.preferences?.notifications?.marketing ?? false
        },
        defaults: {
          platform: data.preferences?.defaults?.platform || 'YouTube',
          tone: data.preferences?.defaults?.tone || 'Casual',
          audience: data.preferences?.defaults?.audience || 'Geral'
        }
      },
      usage: {
        scriptsGenerated: data.usage?.scriptsGenerated || 0,
        templatesCreated: data.usage?.templatesCreated || 0,
        collaborationsStarted: data.usage?.collaborationsStarted || 0,
        lastActivity: data.usage?.lastActivity || Timestamp.now()
      },
      metadata: {
        createdAt: data.metadata?.createdAt || data.createdAt || Timestamp.now(),
        updatedAt: data.metadata?.updatedAt || data.updatedAt || Timestamp.now(),
        lastLoginAt: data.metadata?.lastLoginAt,
        isActive: data.metadata?.isActive ?? true,
        isBanned: data.metadata?.isBanned || false,
        banReason: data.metadata?.banReason
      }
    };
  }

  /**
   * Map User entity to Firestore document
   */
  protected mapFromEntity(entity: User): DocumentData {
    return {
      uid: entity.uid,
      email: entity.email,
      displayName: entity.displayName,
      photoURL: entity.photoURL,
      emailVerified: entity.emailVerified,
      role: entity.role,
      subscription: entity.subscription,
      preferences: entity.preferences,
      usage: entity.usage,
      metadata: entity.metadata
    };
  }

  /**
   * Find user by Firebase Auth UID
   */
  async findByUid(uid: string): Promise<User | null> {
    try {
      const users = await this.findByField('uid', uid);
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      this.logger.error(`Error finding user by UID ${uid}:`, error);
      throw error;
    }
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      const users = await this.findByField('email', email.toLowerCase());
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      this.logger.error(`Error finding user by email ${email}:`, error);
      throw error;
    }
  }

  /**
   * Create user from Firebase Auth data
   */
  async createFromAuth(authUser: {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    emailVerified: boolean;
  }): Promise<User> {
    try {
      const userData: Omit<User, 'id'> = {
        uid: authUser.uid,
        email: authUser.email.toLowerCase(),
        displayName: authUser.displayName,
        photoURL: authUser.photoURL,
        emailVerified: authUser.emailVerified,
        role: 'user',
        subscription: 'free',
        preferences: {
          theme: 'light',
          language: 'pt',
          notifications: {
            email: true,
            push: true,
            marketing: false
          },
          defaults: {
            platform: 'YouTube',
            tone: 'Casual',
            audience: 'Geral'
          }
        },
        usage: {
          scriptsGenerated: 0,
          templatesCreated: 0,
          collaborationsStarted: 0,
          lastActivity: Timestamp.now()
        },
        metadata: {
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          lastLoginAt: Timestamp.now(),
          isActive: true,
          isBanned: false
        }
      };

      return await this.create(userData);
    } catch (error) {
      this.logger.error('Error creating user from auth:', error);
      throw error;
    }
  }

  /**
   * Update user last login
   */
  async updateLastLogin(userId: string): Promise<void> {
    try {
      await this.update(userId, {
        'metadata.lastLoginAt': Timestamp.now(),
        'metadata.updatedAt': Timestamp.now()
      } as Partial<User>);
    } catch (error) {
      this.logger.error(`Error updating last login for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Update user activity
   */
  async updateActivity(userId: string, activity: {
    scriptsGenerated?: number;
    templatesCreated?: number;
    collaborationsStarted?: number;
  }): Promise<void> {
    try {
      const updates: any = {
        'usage.lastActivity': Timestamp.now(),
        'metadata.updatedAt': Timestamp.now()
      };

      if (activity.scriptsGenerated) {
        updates['usage.scriptsGenerated'] = activity.scriptsGenerated;
      }
      if (activity.templatesCreated) {
        updates['usage.templatesCreated'] = activity.templatesCreated;
      }
      if (activity.collaborationsStarted) {
        updates['usage.collaborationsStarted'] = activity.collaborationsStarted;
      }

      await this.update(userId, updates);
    } catch (error) {
      this.logger.error(`Error updating activity for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Update user preferences
   */
  async updatePreferences(userId: string, preferences: Partial<User['preferences']>): Promise<User> {
    try {
      const updates: any = {
        'metadata.updatedAt': Timestamp.now()
      };

      // Update nested preferences
      Object.entries(preferences).forEach(([key, value]) => {
        updates[`preferences.${key}`] = value;
      });

      return await this.update(userId, updates);
    } catch (error) {
      this.logger.error(`Error updating preferences for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Ban/unban user
   */
  async setBanStatus(userId: string, isBanned: boolean, reason?: string): Promise<User> {
    try {
      const updates: Partial<User> = {
        'metadata.isBanned': isBanned,
        'metadata.updatedAt': Timestamp.now()
      } as any;

      if (isBanned && reason) {
        (updates as any)['metadata.banReason'] = reason;
      } else if (!isBanned) {
        (updates as any)['metadata.banReason'] = null;
      }

      return await this.update(userId, updates);
    } catch (error) {
      this.logger.error(`Error setting ban status for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Find users with filters
   */
  async findUsersWithFilters(filters: UserFilters, limit = 20): Promise<User[]> {
    try {
      const queryOptions: QueryOptions = {
        where: [],
        orderBy: [{ field: 'metadata.createdAt', direction: 'desc' }],
        limit
      };

      // Add filters
      if (filters.role) {
        queryOptions.where!.push({ field: 'role', operator: '==', value: filters.role });
      }
      if (filters.subscription) {
        queryOptions.where!.push({ field: 'subscription', operator: '==', value: filters.subscription });
      }
      if (filters.emailVerified !== undefined) {
        queryOptions.where!.push({ field: 'emailVerified', operator: '==', value: filters.emailVerified });
      }
      if (filters.isActive !== undefined) {
        queryOptions.where!.push({ field: 'metadata.isActive', operator: '==', value: filters.isActive });
      }
      if (filters.isBanned !== undefined) {
        queryOptions.where!.push({ field: 'metadata.isBanned', operator: '==', value: filters.isBanned });
      }
      if (filters.createdAfter) {
        queryOptions.where!.push({ 
          field: 'metadata.createdAt', 
          operator: '>=', 
          value: Timestamp.fromDate(filters.createdAfter) 
        });
      }
      if (filters.lastActivityAfter) {
        queryOptions.where!.push({ 
          field: 'usage.lastActivity', 
          operator: '>=', 
          value: Timestamp.fromDate(filters.lastActivityAfter) 
        });
      }

      return await this.find(queryOptions);
    } catch (error) {
      this.logger.error('Error finding users with filters:', error);
      throw error;
    }
  }

  /**
   * Get user profiles (simplified view)
   */
  async getUserProfiles(userIds: string[]): Promise<UserProfile[]> {
    try {
      const users = await Promise.all(
        userIds.map(id => this.getById(id))
      );

      return users
        .filter((user): user is User => user !== null)
        .map(user => ({
          id: user.id!,
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: user.role,
          subscription: user.subscription,
          emailVerified: user.emailVerified,
          isActive: user.metadata.isActive,
          createdAt: user.metadata.createdAt.toDate(),
          lastActivity: user.usage.lastActivity.toDate()
        }));
    } catch (error) {
      this.logger.error('Error getting user profiles:', error);
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<UserStats> {
    try {
      const allUsers = await this.getAll();
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      const stats: UserStats = {
        totalUsers: allUsers.length,
        activeUsers: allUsers.filter(u => u.metadata.isActive && !u.metadata.isBanned).length,
        verifiedUsers: allUsers.filter(u => u.emailVerified).length,
        usersByRole: {},
        usersBySubscription: {},
        newUsersToday: 0,
        newUsersThisWeek: 0,
        newUsersThisMonth: 0
      };

      // Count by role and subscription
      allUsers.forEach(user => {
        stats.usersByRole[user.role] = (stats.usersByRole[user.role] || 0) + 1;
        stats.usersBySubscription[user.subscription] = (stats.usersBySubscription[user.subscription] || 0) + 1;

        // Count new users
        const createdAt = user.metadata.createdAt.toDate();
        if (createdAt >= today) stats.newUsersToday++;
        if (createdAt >= weekAgo) stats.newUsersThisWeek++;
        if (createdAt >= monthAgo) stats.newUsersThisMonth++;
      });

      return stats;
    } catch (error) {
      this.logger.error('Error getting user stats:', error);
      throw error;
    }
  }

  /**
   * Search users by name or email
   */
  async searchUsers(query: string, limit = 10): Promise<UserProfile[]> {
    try {
      // Note: Firestore doesn't support full-text search natively
      // This is a simplified implementation that matches email prefixes
      const normalizedQuery = query.toLowerCase().trim();
      
      const users = await this.find({
        where: [
          { field: 'email', operator: '>=', value: normalizedQuery },
          { field: 'email', operator: '<', value: normalizedQuery + '\uf8ff' }
        ],
        limit
      });

      return this.getUserProfiles(users.map(u => u.id!));
    } catch (error) {
      this.logger.error('Error searching users:', error);
      throw error;
    }
  }
} 