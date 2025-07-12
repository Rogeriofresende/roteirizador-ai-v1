/**
 * UserCredentials Value Object - Domain Layer
 * Roteirar IA - Clean Architecture Implementation
 */

export interface UserCredentialsProps {
  email: string;
  passwordHash?: string;
  provider: AuthProvider;
  providerId?: string;
  isVerified: boolean;
  twoFactorEnabled: boolean;
  lastPasswordChange?: Date;
  failedAttempts: number;
  lockedUntil?: Date;
}

export type AuthProvider = 'email' | 'google' | 'facebook' | 'github' | 'apple';

/**
 * UserCredentials Value Object - Immutable authentication credentials
 */
export class UserCredentials {
  private constructor(private readonly props: UserCredentialsProps) {
    this.validate();
  }

  static createEmailCredentials(params: {
    email: string;
    passwordHash: string;
    isVerified?: boolean;
    twoFactorEnabled?: boolean;
  }): UserCredentials {
    return new UserCredentials({
      email: params.email.toLowerCase().trim(),
      passwordHash: params.passwordHash,
      provider: 'email',
      isVerified: params.isVerified || false,
      twoFactorEnabled: params.twoFactorEnabled || false,
      failedAttempts: 0,
    });
  }

  static createSocialCredentials(params: {
    email: string;
    provider: Exclude<AuthProvider, 'email'>;
    providerId: string;
    isVerified?: boolean;
  }): UserCredentials {
    return new UserCredentials({
      email: params.email.toLowerCase().trim(),
      provider: params.provider,
      providerId: params.providerId,
      isVerified: params.isVerified || true, // Social logins are typically pre-verified
      twoFactorEnabled: false,
      failedAttempts: 0,
    });
  }

  static fromPersistence(props: UserCredentialsProps): UserCredentials {
    return new UserCredentials(props);
  }

  // Getters
  get email(): string {
    return this.props.email;
  }

  get provider(): AuthProvider {
    return this.props.provider;
  }

  get providerId(): string | undefined {
    return this.props.providerId;
  }

  get isVerified(): boolean {
    return this.props.isVerified;
  }

  get twoFactorEnabled(): boolean {
    return this.props.twoFactorEnabled;
  }

  get lastPasswordChange(): Date | undefined {
    return this.props.lastPasswordChange;
  }

  get failedAttempts(): number {
    return this.props.failedAttempts;
  }

  get lockedUntil(): Date | undefined {
    return this.props.lockedUntil;
  }

  // Domain methods

  /**
   * Check if account is currently locked
   */
  isLocked(): boolean {
    if (!this.props.lockedUntil) {
      return false;
    }
    return new Date() < this.props.lockedUntil;
  }

  /**
   * Check if password needs to be changed
   */
  needsPasswordChange(): boolean {
    if (!this.props.lastPasswordChange) {
      return false; // New accounts or social logins don't need password change
    }

    const daysSinceChange = (Date.now() - this.props.lastPasswordChange.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceChange > 90; // Password expires after 90 days
  }

  /**
   * Check if account can attempt login
   */
  canAttemptLogin(): AuthenticationCheck {
    if (this.isLocked()) {
      return {
        canAuthenticate: false,
        reason: 'Account is temporarily locked due to too many failed attempts',
        nextAttemptAllowedAt: this.props.lockedUntil,
      };
    }

    if (!this.props.isVerified) {
      return {
        canAuthenticate: false,
        reason: 'Email address must be verified before login',
        requiresEmailVerification: true,
      };
    }

    if (this.props.failedAttempts >= 3) {
      return {
        canAuthenticate: false,
        reason: 'Too many failed attempts. Account will be locked after next failed attempt.',
        warningLevel: 'high',
      };
    }

    return {
      canAuthenticate: true,
      reason: 'Authentication allowed',
    };
  }

  /**
   * Record successful authentication
   */
  recordSuccessfulAuth(): UserCredentials {
    return new UserCredentials({
      ...this.props,
      failedAttempts: 0,
      lockedUntil: undefined,
    });
  }

  /**
   * Record failed authentication attempt
   */
  recordFailedAuth(): UserCredentials {
    const newFailedAttempts = this.props.failedAttempts + 1;
    let lockedUntil: Date | undefined;

    // Lock account after 5 failed attempts
    if (newFailedAttempts >= 5) {
      lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
    }

    return new UserCredentials({
      ...this.props,
      failedAttempts: newFailedAttempts,
      lockedUntil,
    });
  }

  /**
   * Verify email address
   */
  verifyEmail(): UserCredentials {
    return new UserCredentials({
      ...this.props,
      isVerified: true,
    });
  }

  /**
   * Enable two-factor authentication
   */
  enableTwoFactor(): UserCredentials {
    if (this.props.provider !== 'email') {
      throw new Error('Two-factor authentication is only available for email/password accounts');
    }

    return new UserCredentials({
      ...this.props,
      twoFactorEnabled: true,
    });
  }

  /**
   * Disable two-factor authentication
   */
  disableTwoFactor(): UserCredentials {
    return new UserCredentials({
      ...this.props,
      twoFactorEnabled: false,
    });
  }

  /**
   * Update password hash
   */
  updatePassword(newPasswordHash: string): UserCredentials {
    if (this.props.provider !== 'email') {
      throw new Error('Cannot update password for social login accounts');
    }

    return new UserCredentials({
      ...this.props,
      passwordHash: newPasswordHash,
      lastPasswordChange: new Date(),
      failedAttempts: 0,
      lockedUntil: undefined,
    });
  }

  /**
   * Change email address
   */
  changeEmail(newEmail: string): UserCredentials {
    const normalizedEmail = newEmail.toLowerCase().trim();
    
    if (!this.isValidEmail(normalizedEmail)) {
      throw new Error('Invalid email format');
    }

    return new UserCredentials({
      ...this.props,
      email: normalizedEmail,
      isVerified: false, // Require re-verification for new email
    });
  }

  /**
   * Reset account after unlock
   */
  resetLock(): UserCredentials {
    return new UserCredentials({
      ...this.props,
      failedAttempts: 0,
      lockedUntil: undefined,
    });
  }

  /**
   * Get authentication strength score
   */
  getSecurityScore(): SecurityScore {
    let score = 0;
    const factors: string[] = [];

    // Base score for verified email
    if (this.props.isVerified) {
      score += 30;
      factors.push('Verified email');
    }

    // Two-factor authentication
    if (this.props.twoFactorEnabled) {
      score += 40;
      factors.push('Two-factor authentication');
    }

    // Social login bonus (inherently more secure)
    if (this.props.provider !== 'email') {
      score += 20;
      factors.push(`${this.props.provider} OAuth`);
    }

    // Recent password change
    if (this.props.lastPasswordChange) {
      const daysSinceChange = (Date.now() - this.props.lastPasswordChange.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceChange <= 30) {
        score += 10;
        factors.push('Recent password change');
      }
    }

    // No failed attempts
    if (this.props.failedAttempts === 0) {
      score += 10;
      factors.push('No failed login attempts');
    }

    return {
      score: Math.min(score, 100),
      level: this.getSecurityLevel(score),
      factors,
      recommendations: this.getSecurityRecommendations(),
    };
  }

  /**
   * Check if credentials are for admin access
   */
  isAdminCredentials(): boolean {
    const adminEmails = [
      'admin@roteirar.ai',
      'rogerio@roteirar.ai',
      // Add more admin emails as needed
    ];
    return adminEmails.includes(this.props.email);
  }

  /**
   * Get credential summary for logging (sensitive data removed)
   */
  getSummary(): CredentialSummary {
    return {
      email: this.props.email,
      provider: this.props.provider,
      isVerified: this.props.isVerified,
      twoFactorEnabled: this.props.twoFactorEnabled,
      hasRecentActivity: this.props.failedAttempts === 0,
      securityLevel: this.getSecurityScore().level,
    };
  }

  /**
   * Equals comparison
   */
  equals(other: UserCredentials): boolean {
    return (
      this.props.email === other.props.email &&
      this.props.provider === other.props.provider &&
      this.props.providerId === other.props.providerId
    );
  }

  /**
   * Get for persistence (excludes sensitive methods)
   */
  toPersistence(): UserCredentialsProps {
    return { ...this.props };
  }

  // Private methods

  private validate(): void {
    if (!this.props.email) {
      throw new Error('Email is required');
    }

    if (!this.isValidEmail(this.props.email)) {
      throw new Error('Invalid email format');
    }

    if (!this.props.provider) {
      throw new Error('Authentication provider is required');
    }

    if (this.props.provider === 'email' && !this.props.passwordHash) {
      throw new Error('Password hash is required for email authentication');
    }

    if (this.props.provider !== 'email' && !this.props.providerId) {
      throw new Error('Provider ID is required for social authentication');
    }

    if (this.props.failedAttempts < 0) {
      throw new Error('Failed attempts cannot be negative');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private getSecurityLevel(score: number): SecurityLevel {
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    if (score >= 40) return 'low';
    return 'very-low';
  }

  private getSecurityRecommendations(): string[] {
    const recommendations: string[] = [];

    if (!this.props.isVerified) {
      recommendations.push('Verify your email address');
    }

    if (!this.props.twoFactorEnabled && this.props.provider === 'email') {
      recommendations.push('Enable two-factor authentication');
    }

    if (this.needsPasswordChange()) {
      recommendations.push('Consider changing your password (last changed over 90 days ago)');
    }

    if (this.props.failedAttempts > 0) {
      recommendations.push('Review recent login attempts for suspicious activity');
    }

    return recommendations;
  }
}

// Supporting types

export interface AuthenticationCheck {
  canAuthenticate: boolean;
  reason: string;
  nextAttemptAllowedAt?: Date;
  requiresEmailVerification?: boolean;
  warningLevel?: 'low' | 'medium' | 'high';
}

export interface SecurityScore {
  score: number;
  level: SecurityLevel;
  factors: string[];
  recommendations: string[];
}

export type SecurityLevel = 'very-low' | 'low' | 'medium' | 'high';

export interface CredentialSummary {
  email: string;
  provider: AuthProvider;
  isVerified: boolean;
  twoFactorEnabled: boolean;
  hasRecentActivity: boolean;
  securityLevel: SecurityLevel;
} 