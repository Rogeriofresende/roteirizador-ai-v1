/**
 * UserManagementService - Domain Service
 * Roteirar IA - Clean Architecture Implementation
 */

import { User, SubscriptionTier } from '../entities/User';
import { UserCredentials, AuthProvider } from '../value-objects/UserCredentials';

export interface UserRegistrationRequest {
  email: string;
  displayName?: string;
  password?: string;
  provider: AuthProvider;
  providerId?: string;
  photoURL?: string;
  acceptedTerms: boolean;
  marketingOptIn: boolean;
}

export interface UserUpdateRequest {
  displayName?: string;
  photoURL?: string;
  preferences?: {
    theme?: 'light' | 'dark' | 'auto';
    language?: string;
    notifications?: boolean;
    analyticsOptIn?: boolean;
  };
}

export interface PasswordChangeRequest {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

export interface UserValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface SecurityAuditResult {
  securityScore: number;
  vulnerabilities: SecurityVulnerability[];
  recommendations: SecurityRecommendation[];
  lastAudit: Date;
}

export interface SecurityVulnerability {
  type: VulnerabilityType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedUsers: number;
  recommendation: string;
}

export type VulnerabilityType = 'weak_password' | 'unverified_email' | 'no_2fa' | 'inactive_account' | 'suspicious_activity';

export interface SecurityRecommendation {
  action: string;
  priority: 'low' | 'medium' | 'high';
  impact: string;
  estimatedTime: string;
}

/**
 * UserManagementService - Core business logic for user lifecycle and permissions
 */
export class UserManagementService {
  constructor(
    private passwordHasher: IPasswordHasher,
    private emailService: IEmailService,
    private auditLogger: IAuditLogger
  ) {}

  /**
   * Register new user
   */
  async registerUser(request: UserRegistrationRequest): Promise<User> {
    // 1. Validate registration request
    const validation = this.validateRegistrationRequest(request);
    if (!validation.isValid) {
      throw new Error(`Registration validation failed: ${validation.errors.join(', ')}`);
    }

    // 2. Check if user already exists
    const existingUser = await this.checkExistingUser(request.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // 3. Create user credentials
    let credentials: UserCredentials;
    if (request.provider === 'email') {
      if (!request.password) {
        throw new Error('Password is required for email registration');
      }
      
      const passwordHash = await this.passwordHasher.hash(request.password);
      credentials = UserCredentials.createEmailCredentials({
        email: request.email,
        passwordHash,
        isVerified: false, // Email verification required
      });
    } else {
      if (!request.providerId) {
        throw new Error('Provider ID is required for social registration');
      }
      
      credentials = UserCredentials.createSocialCredentials({
        email: request.email,
        provider: request.provider,
        providerId: request.providerId,
        isVerified: true, // Social logins are pre-verified
      });
    }

    // 4. Create user entity
    const user = User.create({
      email: request.email,
      displayName: request.displayName,
      photoURL: request.photoURL,
      emailVerified: credentials.isVerified,
      role: User.isAdminEmail(request.email) ? 'admin' : 'user',
      isActive: true,
      isBlocked: false,
      preferences: {
        theme: 'auto',
        language: 'pt-BR',
        notifications: true,
        analyticsOptIn: request.marketingOptIn,
      },
      subscription: 'free',
    });

    // 5. Send verification email if needed
    if (!credentials.isVerified) {
      await this.sendEmailVerification(user);
    }

    // 6. Log registration event
    await this.auditLogger.logUserEvent({
      userId: user.id,
      action: 'user_registered',
      details: {
        email: user.email,
        provider: request.provider,
        emailVerified: credentials.isVerified,
      },
    });

    return user;
  }

  /**
   * Authenticate user login
   */
  async authenticateUser(email: string, password: string): Promise<{ user: User; sessionData: SessionData }> {
    // 1. Get user credentials
    const credentials = await this.getUserCredentials(email);
    if (!credentials) {
      throw new Error('Invalid email or password');
    }

    // 2. Check if account can attempt login
    const authCheck = credentials.canAttemptLogin();
    if (!authCheck.canAuthenticate) {
      throw new Error(authCheck.reason);
    }

    // 3. Verify password for email auth
    if (credentials.provider === 'email') {
      const isValidPassword = await this.passwordHasher.verify(password, credentials.toPersistence().passwordHash!);
      if (!isValidPassword) {
        // Record failed attempt
        const updatedCredentials = credentials.recordFailedAuth();
        await this.updateUserCredentials(updatedCredentials);
        
        await this.auditLogger.logSecurityEvent({
          email,
          action: 'login_failed',
          reason: 'invalid_password',
          ip: 'unknown', // Would be injected from context
        });
        
        throw new Error('Invalid email or password');
      }
    }

    // 4. Get user entity
    const user = await this.getUserByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    // 5. Perform authentication
    user.authenticate();

    // 6. Record successful authentication
    const updatedCredentials = credentials.recordSuccessfulAuth();
    await this.updateUserCredentials(updatedCredentials);

    // 7. Generate session data
    const sessionData = this.generateSessionData(user);

    // 8. Log successful login
    await this.auditLogger.logUserEvent({
      userId: user.id,
      action: 'user_login',
      details: {
        email: user.email,
        provider: credentials.provider,
        sessionId: sessionData.sessionId,
      },
    });

    return { user, sessionData };
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, updates: UserUpdateRequest): Promise<User> {
    // 1. Get existing user
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // 2. Validate updates
    const validation = this.validateUserUpdates(updates);
    if (!validation.isValid) {
      throw new Error(`Update validation failed: ${validation.errors.join(', ')}`);
    }

    // 3. Apply updates
    if (updates.displayName !== undefined) {
      // User entity would have an updateDisplayName method
      // user.updateDisplayName(updates.displayName);
    }

    if (updates.preferences) {
      user.updatePreferences(updates.preferences);
    }

    // 4. Log profile update
    await this.auditLogger.logUserEvent({
      userId: user.id,
      action: 'profile_updated',
      details: {
        updatedFields: Object.keys(updates),
      },
    });

    return user;
  }

  /**
   * Change user password
   */
  async changePassword(request: PasswordChangeRequest): Promise<void> {
    // 1. Get user credentials
    const credentials = await this.getUserCredentialsById(request.userId);
    if (!credentials) {
      throw new Error('User not found');
    }

    if (credentials.provider !== 'email') {
      throw new Error('Cannot change password for social login accounts');
    }

    // 2. Verify current password
    const isValidPassword = await this.passwordHasher.verify(
      request.currentPassword, 
      credentials.toPersistence().passwordHash!
    );
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    // 3. Validate new password
    const passwordValidation = this.validatePassword(request.newPassword);
    if (!passwordValidation.isValid) {
      throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
    }

    // 4. Hash new password
    const newPasswordHash = await this.passwordHasher.hash(request.newPassword);

    // 5. Update credentials
    const updatedCredentials = credentials.updatePassword(newPasswordHash);
    await this.updateUserCredentials(updatedCredentials);

    // 6. Log password change
    await this.auditLogger.logSecurityEvent({
      userId: request.userId,
      action: 'password_changed',
      details: {
        strength: passwordValidation.strength,
      },
    });
  }

  /**
   * Upgrade user subscription
   */
  async upgradeSubscription(userId: string, newTier: SubscriptionTier): Promise<User> {
    // 1. Get user
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // 2. Validate subscription upgrade
    if (!this.canUpgradeToTier(user, newTier)) {
      throw new Error('Invalid subscription upgrade');
    }

    // 3. Upgrade subscription
    user.upgradeSubscription(newTier);

    // 4. Log subscription change
    await this.auditLogger.logUserEvent({
      userId: user.id,
      action: 'subscription_upgraded',
      details: {
        fromTier: user.subscription,
        toTier: newTier,
      },
    });

    return user;
  }

  /**
   * Block user account
   */
  async blockUser(targetUserId: string, adminUserId: string, reason: string): Promise<void> {
    // 1. Validate admin permissions
    const admin = await this.getUserById(adminUserId);
    if (!admin || !admin.hasPermission('canManageUsers')) {
      throw new Error('Insufficient permissions to block users');
    }

    // 2. Get target user
    const targetUser = await this.getUserById(targetUserId);
    if (!targetUser) {
      throw new Error('Target user not found');
    }

    // 3. Block user
    targetUser.block(adminUserId, reason);

    // 4. Log admin action
    await this.auditLogger.logAdminAction({
      adminId: adminUserId,
      action: 'user_blocked',
      targetUserId,
      reason,
    });
  }

  /**
   * Perform security audit
   */
  async performSecurityAudit(): Promise<SecurityAuditResult> {
    const vulnerabilities: SecurityVulnerability[] = [];
    const recommendations: SecurityRecommendation[] = [];

    // 1. Check for weak passwords
    const weakPasswordUsers = await this.findUsersWithWeakPasswords();
    if (weakPasswordUsers > 0) {
      vulnerabilities.push({
        type: 'weak_password',
        severity: 'medium',
        description: `${weakPasswordUsers} users have weak passwords`,
        affectedUsers: weakPasswordUsers,
        recommendation: 'Encourage users to update their passwords',
      });
    }

    // 2. Check for unverified emails
    const unverifiedUsers = await this.findUnverifiedUsers();
    if (unverifiedUsers > 0) {
      vulnerabilities.push({
        type: 'unverified_email',
        severity: 'low',
        description: `${unverifiedUsers} users have unverified emails`,
        affectedUsers: unverifiedUsers,
        recommendation: 'Send verification reminders',
      });
    }

    // 3. Check for users without 2FA
    const no2FAUsers = await this.findUsersWithout2FA();
    if (no2FAUsers > 0) {
      vulnerabilities.push({
        type: 'no_2fa',
        severity: 'medium',
        description: `${no2FAUsers} users without two-factor authentication`,
        affectedUsers: no2FAUsers,
        recommendation: 'Promote 2FA adoption',
      });
    }

    // 4. Generate recommendations
    if (vulnerabilities.length > 0) {
      recommendations.push({
        action: 'Implement password strength requirements',
        priority: 'high',
        impact: 'Improved account security',
        estimatedTime: '2 hours',
      });

      recommendations.push({
        action: 'Send security awareness emails',
        priority: 'medium',
        impact: 'Increased user security awareness',
        estimatedTime: '1 hour',
      });
    }

    // 5. Calculate security score
    const totalUsers = await this.getTotalUserCount();
    const totalVulnerabilities = vulnerabilities.reduce((sum, v) => sum + v.affectedUsers, 0);
    const securityScore = Math.max(0, 100 - (totalVulnerabilities / totalUsers) * 100);

    return {
      securityScore: Math.round(securityScore),
      vulnerabilities,
      recommendations,
      lastAudit: new Date(),
    };
  }

  // Private methods

  private validateRegistrationRequest(request: UserRegistrationRequest): UserValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (!request.email) {
      errors.push('Email is required');
    } else if (!User.isValidEmail(request.email)) {
      errors.push('Invalid email format');
    }

    if (!request.acceptedTerms) {
      errors.push('Terms and conditions must be accepted');
    }

    if (request.provider === 'email' && request.password) {
      const passwordValidation = this.validatePassword(request.password);
      if (!passwordValidation.isValid) {
        errors.push(...passwordValidation.errors);
      }
    }

    if (request.displayName && request.displayName.length < 2) {
      warnings.push('Display name should be at least 2 characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
    };
  }

  private validatePassword(password: string): { isValid: boolean; errors: string[]; strength: number } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    // Calculate strength score
    let strength = 0;
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 10;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[a-z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 15;
    if (password.length >= 16) strength += 10;

    return {
      isValid: errors.length === 0,
      errors,
      strength: Math.min(strength, 100),
    };
  }

  private validateUserUpdates(updates: UserUpdateRequest): UserValidationResult {
    const errors: string[] = [];

    if (updates.displayName !== undefined) {
      if (updates.displayName.length < 2) {
        errors.push('Display name must be at least 2 characters');
      }
      if (updates.displayName.length > 50) {
        errors.push('Display name cannot exceed 50 characters');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: [],
      suggestions: [],
    };
  }

  private canUpgradeToTier(user: User, newTier: SubscriptionTier): boolean {
    const tierOrder = { free: 0, pro: 1, enterprise: 2 };
    return tierOrder[newTier] > tierOrder[user.subscription];
  }

  private generateSessionData(user: User): SessionData {
    return {
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id,
      email: user.email,
      role: user.role,
      permissions: user.getPermissions(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };
  }

  private async sendEmailVerification(user: User): Promise<void> {
    // Implementation would use email service
    // await this.emailService.sendVerificationEmail(user.email, user.id);
  }

  // Placeholder implementations for interface dependencies
  private async checkExistingUser(email: string): Promise<User | null> {
    // Would use user repository
    return null;
  }

  private async getUserCredentials(email: string): Promise<UserCredentials | null> {
    // Would use credentials repository
    return null;
  }

  private async getUserCredentialsById(userId: string): Promise<UserCredentials | null> {
    // Would use credentials repository
    return null;
  }

  private async updateUserCredentials(credentials: UserCredentials): Promise<void> {
    // Would use credentials repository
  }

  private async getUserByEmail(email: string): Promise<User | null> {
    // Would use user repository
    return null;
  }

  private async getUserById(userId: string): Promise<User | null> {
    // Would use user repository
    return null;
  }

  private async findUsersWithWeakPasswords(): Promise<number> {
    return 0; // Placeholder
  }

  private async findUnverifiedUsers(): Promise<number> {
    return 0; // Placeholder
  }

  private async findUsersWithout2FA(): Promise<number> {
    return 0; // Placeholder
  }

  private async getTotalUserCount(): Promise<number> {
    return 1; // Placeholder
  }
}

// Supporting interfaces and types

export interface SessionData {
  sessionId: string;
  userId: string;
  email: string;
  role: string;
  permissions: any;
  expiresAt: Date;
}

export interface IPasswordHasher {
  hash(password: string): Promise<string>;
  verify(password: string, hash: string): Promise<boolean>;
}

export interface IEmailService {
  sendVerificationEmail(email: string, userId: string): Promise<void>;
  sendPasswordResetEmail(email: string, resetToken: string): Promise<void>;
}

export interface IAuditLogger {
  logUserEvent(event: UserEvent): Promise<void>;
  logSecurityEvent(event: SecurityEvent): Promise<void>;
  logAdminAction(action: AdminAction): Promise<void>;
}

export interface UserEvent {
  userId: string;
  action: string;
  details: any;
  timestamp?: Date;
}

export interface SecurityEvent {
  userId?: string;
  email?: string;
  action: string;
  reason?: string;
  ip?: string;
  userAgent?: string;
  details?: any;
  timestamp?: Date;
}

export interface AdminAction {
  adminId: string;
  action: string;
  targetUserId?: string;
  reason?: string;
  details?: any;
  timestamp?: Date;
} 