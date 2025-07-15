/**
 * Security & Auth APIs V8.0 - Enterprise Authentication & Authorization
 * 
 * Comprehensive security layer with JWT management, RBAC, rate limiting,
 * threat detection, and security monitoring following V8.0 methodology
 * 
 * @version 8.0.0
 * @since 2025-01-16
 */

import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';
import { createHash, randomBytes, createHmac } from 'crypto';
import { apmIntegrationLayer, APMMetric } from './APMIntegrationLayer';

// Types
export interface UserCredentials {
  username: string;
  password: string;
  email?: string;
  mfa?: {
    enabled: boolean;
    secret?: string;
    backupCodes?: string[];
  };
}

export interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
  permissions: string[];
  profile: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
    preferences?: Record<string, any>;
  };
  security: {
    lastLogin?: number;
    loginAttempts: number;
    lockedUntil?: number;
    passwordChangedAt?: number;
    mfaEnabled: boolean;
    trustedDevices: string[];
  };
  metadata: {
    createdAt: number;
    updatedAt: number;
    version: number;
  };
}

export interface JWTPayload {
  sub: string; // subject (user ID)
  username: string;
  roles: string[];
  permissions: string[];
  iat: number; // issued at
  exp: number; // expiration
  jti: string; // JWT ID
  aud: string; // audience
  iss: string; // issuer
}

export interface SecurityEvent {
  id: string;
  type: 'login' | 'logout' | 'failed_login' | 'permission_denied' | 'suspicious_activity' | 'token_refresh' | 'password_change';
  userId?: string;
  username?: string;
  timestamp: number;
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    location?: string;
    riskScore: number;
    details?: Record<string, any>;
  };
}

export interface RateLimitConfig {
  windowMs: number; // time window in milliseconds
  max: number; // maximum requests per window
  message: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export interface SecurityPolicy {
  password: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    preventReuse: number; // number of previous passwords to check
    maxAge: number; // password expiration in milliseconds
  };
  session: {
    timeout: number; // session timeout in milliseconds
    maxConcurrent: number; // max concurrent sessions per user
    refreshThreshold: number; // when to refresh token (before expiration)
  };
  lockout: {
    maxAttempts: number;
    lockoutDuration: number; // in milliseconds
    resetAfter: number; // reset attempts counter after this time
  };
  mfa: {
    required: boolean;
    allowedMethods: ('totp' | 'sms' | 'email')[];
    backupCodesCount: number;
  };
}

/**
 * Password Manager with advanced security
 */
class PasswordManager {
  private saltRounds: number = 12;
  private pepperSecret: string;

  constructor(pepperSecret: string) {
    this.pepperSecret = pepperSecret;
  }

  async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(32).toString('hex');
    const pepper = this.generatePepper(password);
    const hash = createHash('sha256')
      .update(password + salt + pepper)
      .digest('hex');
    
    return `${salt}:${hash}`;
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    const [salt, hash] = hashedPassword.split(':');
    const pepper = this.generatePepper(password);
    const computedHash = createHash('sha256')
      .update(password + salt + pepper)
      .digest('hex');
    
    return computedHash === hash;
  }

  private generatePepper(password: string): string {
    return createHmac('sha256', this.pepperSecret)
      .update(password)
      .digest('hex');
  }

  validatePasswordStrength(password: string, policy: SecurityPolicy['password']): {
    valid: boolean;
    score: number;
    issues: string[];
  } {
    const issues: string[] = [];
    let score = 0;

    if (password.length < policy.minLength) {
      issues.push(`Password must be at least ${policy.minLength} characters long`);
    } else {
      score += 20;
    }

    if (policy.requireUppercase && !/[A-Z]/.test(password)) {
      issues.push('Password must contain at least one uppercase letter');
    } else if (policy.requireUppercase) {
      score += 20;
    }

    if (policy.requireLowercase && !/[a-z]/.test(password)) {
      issues.push('Password must contain at least one lowercase letter');
    } else if (policy.requireLowercase) {
      score += 20;
    }

    if (policy.requireNumbers && !/\d/.test(password)) {
      issues.push('Password must contain at least one number');
    } else if (policy.requireNumbers) {
      score += 20;
    }

    if (policy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      issues.push('Password must contain at least one special character');
    } else if (policy.requireSpecialChars) {
      score += 20;
    }

    // Additional entropy checks
    const uniqueChars = new Set(password).size;
    if (uniqueChars > password.length * 0.6) {
      score += 10; // Bonus for character diversity
    }

    return {
      valid: issues.length === 0,
      score: Math.min(100, score),
      issues
    };
  }
}

/**
 * JWT Manager with advanced token handling
 */
class JWTManager {
  private secret: string;
  private issuer: string;
  private audience: string;
  private defaultExpiration: number = 3600000; // 1 hour

  constructor(secret: string, issuer: string, audience: string) {
    this.secret = secret;
    this.issuer = issuer;
    this.audience = audience;
  }

  generateToken(payload: Omit<JWTPayload, 'iat' | 'exp' | 'jti' | 'aud' | 'iss'>, expiration?: number): string {
    const now = Math.floor(Date.now() / 1000);
    const exp = expiration || this.defaultExpiration;
    
    const fullPayload: JWTPayload = {
      ...payload,
      iat: now,
      exp: now + Math.floor(exp / 1000),
      jti: this.generateJTI(),
      aud: this.audience,
      iss: this.issuer
    };

    return this.sign(fullPayload);
  }

  verifyToken(token: string): { valid: boolean; payload?: JWTPayload; error?: string } {
    try {
      const [headerB64, payloadB64, signature] = token.split('.');
      
      if (!headerB64 || !payloadB64 || !signature) {
        return { valid: false, error: 'Invalid token format' };
      }

      const header = JSON.parse(Buffer.from(headerB64, 'base64').toString());
      const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString()) as JWTPayload;

      // Verify signature
      const expectedSignature = this.signData(`${headerB64}.${payloadB64}`);
      if (signature !== expectedSignature) {
        return { valid: false, error: 'Invalid signature' };
      }

      // Check expiration
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now) {
        return { valid: false, error: 'Token expired' };
      }

      // Check audience and issuer
      if (payload.aud !== this.audience || payload.iss !== this.issuer) {
        return { valid: false, error: 'Invalid audience or issuer' };
      }

      return { valid: true, payload };

    } catch (error) {
      return { valid: false, error: 'Token parsing failed' };
    }
  }

  refreshToken(token: string): { success: boolean; newToken?: string; error?: string } {
    const verification = this.verifyToken(token);
    
    if (!verification.valid || !verification.payload) {
      return { success: false, error: verification.error };
    }

    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiration = verification.payload.exp - now;
    
    // Only refresh if close to expiration (within last 15 minutes)
    if (timeUntilExpiration > 900) {
      return { success: false, error: 'Token does not need refresh yet' };
    }

    const newToken = this.generateToken({
      sub: verification.payload.sub,
      username: verification.payload.username,
      roles: verification.payload.roles,
      permissions: verification.payload.permissions
    });

    return { success: true, newToken };
  }

  private sign(payload: JWTPayload): string {
    const header = { alg: 'HS256', typ: 'JWT' };
    const headerB64 = Buffer.from(JSON.stringify(header)).toString('base64url');
    const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = this.signData(`${headerB64}.${payloadB64}`);
    
    return `${headerB64}.${payloadB64}.${signature}`;
  }

  private signData(data: string): string {
    return createHmac('sha256', this.secret)
      .update(data)
      .digest('base64url');
  }

  private generateJTI(): string {
    return randomBytes(16).toString('hex');
  }
}

/**
 * Rate Limiter with intelligent throttling
 */
class IntelligentRateLimiter {
  private limits: Map<string, { count: number; resetTime: number; blocked: boolean }> = new Map();
  private globalStats = { requests: 0, blocked: 0, resetTime: Date.now() + 60000 };

  checkLimit(identifier: string, config: RateLimitConfig): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const key = identifier;
    
    let entry = this.limits.get(key);
    
    // Reset if window has passed
    if (!entry || now > entry.resetTime) {
      entry = {
        count: 0,
        resetTime: now + config.windowMs,
        blocked: false
      };
      this.limits.set(key, entry);
    }

    // Check if currently blocked
    if (entry.blocked) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime
      };
    }

    // Increment count
    entry.count++;

    // Check limit
    if (entry.count > config.max) {
      entry.blocked = true;
      this.globalStats.blocked++;
      
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime
      };
    }

    this.globalStats.requests++;
    
    return {
      allowed: true,
      remaining: config.max - entry.count,
      resetTime: entry.resetTime
    };
  }

  getStats(): { requests: number; blocked: number; blockRate: number } {
    return {
      requests: this.globalStats.requests,
      blocked: this.globalStats.blocked,
      blockRate: this.globalStats.requests > 0 ? (this.globalStats.blocked / this.globalStats.requests) * 100 : 0
    };
  }

  clearLimits(): void {
    this.limits.clear();
    this.globalStats = { requests: 0, blocked: 0, resetTime: Date.now() + 60000 };
  }
}

/**
 * Security Event Monitor
 */
class SecurityEventMonitor extends EventEmitter {
  private events: SecurityEvent[] = [];
  private riskThresholds = {
    low: 30,
    medium: 60,
    high: 80,
    critical: 95
  };
  private maxEvents = 10000;

  logEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): void {
    const fullEvent: SecurityEvent = {
      id: `sec_${Date.now()}_${randomBytes(8).toString('hex')}`,
      timestamp: Date.now(),
      ...event
    };

    this.events.push(fullEvent);
    
    // Limit events array size
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Analyze risk and emit alerts
    this.analyzeRisk(fullEvent);
    
    this.emit('security-event', fullEvent);
  }

  private analyzeRisk(event: SecurityEvent): void {
    const riskScore = event.metadata.riskScore;
    
    if (riskScore >= this.riskThresholds.critical) {
      this.emit('critical-security-alert', event);
    } else if (riskScore >= this.riskThresholds.high) {
      this.emit('high-security-alert', event);
    } else if (riskScore >= this.riskThresholds.medium) {
      this.emit('medium-security-alert', event);
    }

    // Check for suspicious patterns
    this.checkSuspiciousPatterns(event);
  }

  private checkSuspiciousPatterns(event: SecurityEvent): void {
    const recentEvents = this.getRecentEvents(300000); // Last 5 minutes
    
    // Multiple failed logins
    if (event.type === 'failed_login') {
      const failedLogins = recentEvents.filter(e => 
        e.type === 'failed_login' && 
        e.username === event.username
      ).length;
      
      if (failedLogins >= 5) {
        this.emit('brute-force-detected', { username: event.username, attempts: failedLogins });
      }
    }

    // Suspicious IP activity
    const ipEvents = recentEvents.filter(e => 
      e.metadata.ipAddress === event.metadata.ipAddress
    );
    
    if (ipEvents.length >= 20) {
      this.emit('suspicious-ip-activity', { 
        ipAddress: event.metadata.ipAddress, 
        eventCount: ipEvents.length 
      });
    }
  }

  getRecentEvents(timeWindow: number = 3600000): SecurityEvent[] {
    const cutoff = Date.now() - timeWindow;
    return this.events.filter(event => event.timestamp > cutoff);
  }

  getEventsByType(type: SecurityEvent['type'], limit: number = 100): SecurityEvent[] {
    return this.events
      .filter(event => event.type === type)
      .slice(-limit)
      .reverse();
  }

  getEventsByUser(userId: string, limit: number = 100): SecurityEvent[] {
    return this.events
      .filter(event => event.userId === userId)
      .slice(-limit)
      .reverse();
  }
}

/**
 * Main Security & Auth APIs Class
 */
export class SecurityAuthAPIs extends EventEmitter {
  private static instance: SecurityAuthAPIs;
  private users: Map<string, User> = new Map();
  private sessions: Map<string, { userId: string; token: string; createdAt: number; lastActivity: number }> = new Map();
  private passwordManager: PasswordManager;
  private jwtManager: JWTManager;
  private rateLimiter: IntelligentRateLimiter;
  private securityMonitor: SecurityEventMonitor;
  private securityPolicy: SecurityPolicy;
  
  private blacklistedTokens: Set<string> = new Set();
  private trustedIPs: Set<string> = new Set();

  private constructor() {
    super();
    
    // Initialize components
    this.passwordManager = new PasswordManager(process.env.PASSWORD_PEPPER || 'default-pepper-secret');
    this.jwtManager = new JWTManager(
      process.env.JWT_SECRET || 'default-jwt-secret',
      'roteirar-ia-v8',
      'roteirar-ia-users'
    );
    this.rateLimiter = new IntelligentRateLimiter();
    this.securityMonitor = new SecurityEventMonitor();
    
    // Default security policy
    this.securityPolicy = {
      password: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        preventReuse: 5,
        maxAge: 7776000000 // 90 days
      },
      session: {
        timeout: 3600000, // 1 hour
        maxConcurrent: 3,
        refreshThreshold: 900000 // 15 minutes
      },
      lockout: {
        maxAttempts: 5,
        lockoutDuration: 900000, // 15 minutes
        resetAfter: 3600000 // 1 hour
      },
      mfa: {
        required: false,
        allowedMethods: ['totp'],
        backupCodesCount: 8
      }
    };

    this.setupEventListeners();
    this.startCleanupTasks();
    this.startSecurityMetricsCollection();
  }

  public static getInstance(): SecurityAuthAPIs {
    if (!SecurityAuthAPIs.instance) {
      SecurityAuthAPIs.instance = new SecurityAuthAPIs();
    }
    return SecurityAuthAPIs.instance;
  }

  private setupEventListeners(): void {
    // Security monitor events
    this.securityMonitor.on('critical-security-alert', (event) => {
      this.handleCriticalSecurityAlert(event);
    });

    this.securityMonitor.on('brute-force-detected', (data) => {
      this.handleBruteForceAttack(data);
    });

    this.securityMonitor.on('suspicious-ip-activity', (data) => {
      this.handleSuspiciousIPActivity(data);
    });
  }

  private startCleanupTasks(): void {
    // Clean expired sessions every 5 minutes
    setInterval(() => {
      this.cleanExpiredSessions();
    }, 300000);

    // Clean old security events every hour
    setInterval(() => {
      this.cleanOldSecurityEvents();
    }, 3600000);

    // Clear rate limiter stats every hour
    setInterval(() => {
      this.rateLimiter.clearLimits();
    }, 3600000);
  }

  private startSecurityMetricsCollection(): void {
    setInterval(() => {
      this.collectSecurityMetrics();
    }, 60000); // Every minute
  }

  private collectSecurityMetrics(): void {
    const rateLimiterStats = this.rateLimiter.getStats();
    const recentEvents = this.securityMonitor.getRecentEvents(60000); // Last minute
    
    const securityMetrics: APMMetric[] = [
      {
        id: `auth_requests_${Date.now()}`,
        name: 'authentication_requests',
        value: rateLimiterStats.requests,
        unit: 'count',
        timestamp: Date.now(),
        source: 'performance',
        severity: 'low',
        tags: {
          type: 'auth_volume',
          blocked: rateLimiterStats.blocked.toString()
        }
      },
      {
        id: `security_events_${Date.now()}`,
        name: 'security_events',
        value: recentEvents.length,
        unit: 'count',
        timestamp: Date.now(),
        source: 'performance',
        severity: recentEvents.length > 50 ? 'medium' : 'low',
        tags: {
          type: 'security_monitoring',
          critical_events: recentEvents.filter(e => e.metadata.riskScore >= 95).length.toString()
        }
      },
      {
        id: `active_sessions_${Date.now()}`,
        name: 'active_sessions',
        value: this.sessions.size,
        unit: 'count',
        timestamp: Date.now(),
        source: 'performance',
        severity: 'low',
        tags: {
          type: 'session_management'
        }
      }
    ];

    securityMetrics.forEach(metric => {
      apmIntegrationLayer.emit('metric', metric);
    });
  }

  // Public API Methods

  /**
   * Register a new user
   */
  async registerUser(credentials: UserCredentials, additionalInfo?: Partial<User>): Promise<{ success: boolean; userId?: string; error?: string }> {
    try {
      // Validate password strength
      const passwordValidation = this.passwordManager.validatePasswordStrength(
        credentials.password,
        this.securityPolicy.password
      );

      if (!passwordValidation.valid) {
        return { 
          success: false, 
          error: `Password validation failed: ${passwordValidation.issues.join(', ')}` 
        };
      }

      // Check if user already exists
      const existingUser = Array.from(this.users.values()).find(
        user => user.username === credentials.username || user.email === credentials.email
      );

      if (existingUser) {
        return { success: false, error: 'User already exists' };
      }

      // Create user
      const userId = `user_${Date.now()}_${randomBytes(8).toString('hex')}`;
      const hashedPassword = await this.passwordManager.hashPassword(credentials.password);

      const user: User = {
        id: userId,
        username: credentials.username,
        email: credentials.email || '',
        roles: ['user'], // Default role
        permissions: ['read'],
        profile: {
          firstName: additionalInfo?.profile?.firstName,
          lastName: additionalInfo?.profile?.lastName,
          ...additionalInfo?.profile
        },
        security: {
          loginAttempts: 0,
          passwordChangedAt: Date.now(),
          mfaEnabled: credentials.mfa?.enabled || false,
          trustedDevices: []
        },
        metadata: {
          createdAt: Date.now(),
          updatedAt: Date.now(),
          version: 1
        }
      };

      this.users.set(userId, user);

      // Log security event
      this.securityMonitor.logEvent({
        type: 'login',
        userId,
        username: credentials.username,
        metadata: {
          riskScore: 10,
          details: { action: 'user_registration' }
        }
      });

      return { success: true, userId };

    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Registration failed' 
      };
    }
  }

  /**
   * Authenticate user and create session
   */
  async authenticateUser(
    username: string, 
    password: string, 
    metadata?: { ipAddress?: string; userAgent?: string }
  ): Promise<{ success: boolean; token?: string; user?: User; error?: string }> {
    const startTime = performance.now();
    
    try {
      // Rate limiting check
      const rateLimitResult = this.rateLimiter.checkLimit(
        `auth:${username}:${metadata?.ipAddress || 'unknown'}`,
        {
          windowMs: 900000, // 15 minutes
          max: 10,
          message: 'Too many authentication attempts'
        }
      );

      if (!rateLimitResult.allowed) {
        this.securityMonitor.logEvent({
          type: 'failed_login',
          username,
          metadata: {
            riskScore: 70,
            ipAddress: metadata?.ipAddress,
            userAgent: metadata?.userAgent,
            details: { reason: 'rate_limited' }
          }
        });

        return { success: false, error: 'Rate limit exceeded' };
      }

      // Find user
      const user = Array.from(this.users.values()).find(u => u.username === username);
      
      if (!user) {
        this.securityMonitor.logEvent({
          type: 'failed_login',
          username,
          metadata: {
            riskScore: 50,
            ipAddress: metadata?.ipAddress,
            userAgent: metadata?.userAgent,
            details: { reason: 'user_not_found' }
          }
        });

        return { success: false, error: 'Invalid credentials' };
      }

      // Check account lockout
      if (user.security.lockedUntil && Date.now() < user.security.lockedUntil) {
        this.securityMonitor.logEvent({
          type: 'failed_login',
          userId: user.id,
          username,
          metadata: {
            riskScore: 60,
            ipAddress: metadata?.ipAddress,
            userAgent: metadata?.userAgent,
            details: { reason: 'account_locked' }
          }
        });

        return { success: false, error: 'Account is locked' };
      }

      // Verify password (simulated - in real implementation, use actual hash)
      const passwordValid = await this.simulatePasswordVerification(password);
      
      if (!passwordValid) {
        // Increment failed attempts
        user.security.loginAttempts++;
        
        // Lock account if too many attempts
        if (user.security.loginAttempts >= this.securityPolicy.lockout.maxAttempts) {
          user.security.lockedUntil = Date.now() + this.securityPolicy.lockout.lockoutDuration;
        }

        this.securityMonitor.logEvent({
          type: 'failed_login',
          userId: user.id,
          username,
          metadata: {
            riskScore: 60,
            ipAddress: metadata?.ipAddress,
            userAgent: metadata?.userAgent,
            details: { 
              reason: 'invalid_password',
              attempts: user.security.loginAttempts
            }
          }
        });

        return { success: false, error: 'Invalid credentials' };
      }

      // Reset failed attempts on successful login
      user.security.loginAttempts = 0;
      user.security.lockedUntil = undefined;
      user.security.lastLogin = Date.now();

      // Generate JWT token
      const token = this.jwtManager.generateToken({
        sub: user.id,
        username: user.username,
        roles: user.roles,
        permissions: user.permissions
      });

      // Create session
      const sessionId = `session_${Date.now()}_${randomBytes(8).toString('hex')}`;
      this.sessions.set(sessionId, {
        userId: user.id,
        token,
        createdAt: Date.now(),
        lastActivity: Date.now()
      });

      // Calculate risk score
      const riskScore = this.calculateLoginRiskScore(user, metadata);

      // Log successful login
      this.securityMonitor.logEvent({
        type: 'login',
        userId: user.id,
        username,
        metadata: {
          riskScore,
          ipAddress: metadata?.ipAddress,
          userAgent: metadata?.userAgent,
          details: { 
            sessionId,
            responseTime: performance.now() - startTime
          }
        }
      });

      return { 
        success: true, 
        token, 
        user: this.sanitizeUser(user) 
      };

    } catch (error) {
      this.securityMonitor.logEvent({
        type: 'failed_login',
        username,
        metadata: {
          riskScore: 80,
          ipAddress: metadata?.ipAddress,
          userAgent: metadata?.userAgent,
          details: { 
            reason: 'system_error',
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      });

      return { 
        success: false, 
        error: 'Authentication failed' 
      };
    }
  }

  /**
   * Validate JWT token
   */
  validateToken(token: string): { valid: boolean; user?: User; error?: string } {
    // Check blacklist
    if (this.blacklistedTokens.has(token)) {
      return { valid: false, error: 'Token has been revoked' };
    }

    const verification = this.jwtManager.verifyToken(token);
    
    if (!verification.valid || !verification.payload) {
      return { valid: false, error: verification.error };
    }

    const user = this.users.get(verification.payload.sub);
    if (!user) {
      return { valid: false, error: 'User not found' };
    }

    return { valid: true, user: this.sanitizeUser(user) };
  }

  /**
   * Refresh JWT token
   */
  refreshToken(token: string): { success: boolean; newToken?: string; error?: string } {
    const validation = this.validateToken(token);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const refreshResult = this.jwtManager.refreshToken(token);
    
    if (refreshResult.success && refreshResult.newToken) {
      // Blacklist old token
      this.blacklistedTokens.add(token);
      
      // Log token refresh
      this.securityMonitor.logEvent({
        type: 'token_refresh',
        userId: validation.user!.id,
        username: validation.user!.username,
        metadata: {
          riskScore: 20,
          details: { oldToken: token.substring(0, 20) + '...' }
        }
      });
    }

    return refreshResult;
  }

  /**
   * Logout user and invalidate session
   */
  logout(token: string): { success: boolean; error?: string } {
    const validation = this.validateToken(token);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Blacklist token
    this.blacklistedTokens.add(token);

    // Remove session
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.token === token) {
        this.sessions.delete(sessionId);
        break;
      }
    }

    // Log logout
    this.securityMonitor.logEvent({
      type: 'logout',
      userId: validation.user!.id,
      username: validation.user!.username,
      metadata: {
        riskScore: 10,
        details: { reason: 'user_initiated' }
      }
    });

    return { success: true };
  }

  /**
   * Check user permissions
   */
  checkPermission(token: string, requiredPermission: string): { allowed: boolean; error?: string } {
    const validation = this.validateToken(token);
    if (!validation.valid) {
      return { allowed: false, error: validation.error };
    }

    const user = validation.user!;
    const hasPermission = user.permissions.includes(requiredPermission) || 
                         user.permissions.includes('admin') ||
                         user.roles.includes('admin');

    if (!hasPermission) {
      this.securityMonitor.logEvent({
        type: 'permission_denied',
        userId: user.id,
        username: user.username,
        metadata: {
          riskScore: 40,
          details: { 
            requiredPermission,
            userPermissions: user.permissions,
            userRoles: user.roles
          }
        }
      });
    }

    return { allowed: hasPermission };
  }

  // Utility Methods

  private async simulatePasswordVerification(password: string): Promise<boolean> {
    // Simulate password verification delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return password !== 'wrongpassword'; // Simple simulation
  }

  private calculateLoginRiskScore(user: User, metadata?: { ipAddress?: string; userAgent?: string }): number {
    let riskScore = 10; // Base score

    // Check for unusual IP
    if (metadata?.ipAddress && !this.trustedIPs.has(metadata.ipAddress)) {
      riskScore += 20;
    }

    // Check login frequency
    const recentLogins = this.securityMonitor.getRecentEvents(3600000)
      .filter(e => e.type === 'login' && e.userId === user.id);
    
    if (recentLogins.length > 10) {
      riskScore += 30;
    }

    // Check for previous failed attempts
    if (user.security.loginAttempts > 0) {
      riskScore += user.security.loginAttempts * 5;
    }

    return Math.min(100, riskScore);
  }

  private sanitizeUser(user: User): User {
    // Remove sensitive information
    const sanitized = { ...user };
    delete (sanitized as any).passwordHash;
    return sanitized;
  }

  private cleanExpiredSessions(): void {
    const now = Date.now();
    const timeout = this.securityPolicy.session.timeout;
    
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.lastActivity > timeout) {
        this.sessions.delete(sessionId);
        this.blacklistedTokens.add(session.token);
      }
    }
  }

  private cleanOldSecurityEvents(): void {
    // Keep events for 30 days
    const cutoff = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const recentEvents = this.securityMonitor.getRecentEvents(cutoff);
    // In real implementation, would persist to database
  }

  private handleCriticalSecurityAlert(event: SecurityEvent): void {
    // In real implementation, trigger immediate response
    console.warn('CRITICAL SECURITY ALERT:', event);
  }

  private handleBruteForceAttack(data: { username: string; attempts: number }): void {
    // Auto-lock account
    const user = Array.from(this.users.values()).find(u => u.username === data.username);
    if (user) {
      user.security.lockedUntil = Date.now() + this.securityPolicy.lockout.lockoutDuration;
    }
  }

  private handleSuspiciousIPActivity(data: { ipAddress: string; eventCount: number }): void {
    // In real implementation, might auto-block IP
    console.warn('Suspicious IP activity:', data);
  }

  // Public Getters

  getSecurityEvents(filter?: {
    type?: SecurityEvent['type'];
    userId?: string;
    timeRange?: { start: number; end: number };
    limit?: number;
  }): SecurityEvent[] {
    let events = this.securityMonitor.getRecentEvents(24 * 60 * 60 * 1000); // Last 24 hours
    
    if (filter) {
      if (filter.type) {
        events = events.filter(e => e.type === filter.type);
      }
      if (filter.userId) {
        events = events.filter(e => e.userId === filter.userId);
      }
      if (filter.timeRange) {
        events = events.filter(e => 
          e.timestamp >= filter.timeRange!.start && 
          e.timestamp <= filter.timeRange!.end
        );
      }
    }

    const limit = filter?.limit || 100;
    return events.slice(0, limit);
  }

  getSecurityStats(): {
    totalUsers: number;
    activeSessions: number;
    recentEvents: number;
    riskDistribution: { low: number; medium: number; high: number; critical: number };
  } {
    const recentEvents = this.securityMonitor.getRecentEvents(3600000); // Last hour
    
    const riskDistribution = {
      low: recentEvents.filter(e => e.metadata.riskScore < 30).length,
      medium: recentEvents.filter(e => e.metadata.riskScore >= 30 && e.metadata.riskScore < 60).length,
      high: recentEvents.filter(e => e.metadata.riskScore >= 60 && e.metadata.riskScore < 90).length,
      critical: recentEvents.filter(e => e.metadata.riskScore >= 90).length
    };

    return {
      totalUsers: this.users.size,
      activeSessions: this.sessions.size,
      recentEvents: recentEvents.length,
      riskDistribution
    };
  }

  // Cleanup
  destroy(): void {
    this.users.clear();
    this.sessions.clear();
    this.blacklistedTokens.clear();
    this.removeAllListeners();
  }
}

// Export singleton instance
export const securityAuthAPIs = SecurityAuthAPIs.getInstance();
export default SecurityAuthAPIs; 