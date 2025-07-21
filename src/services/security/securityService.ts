/**
 * 🔐 SECURITY SERVICE V9.0
 * 
 * Serviço avançado de segurança para autenticação e proteção
 * Implementa rate limiting, logs de segurança e validação de sessões
 * 
 * @methodology V9.0_NATURAL_LANGUAGE_FIRST
 * @specification SEC-001
 * @author IA Beta - Security Architect
 */

import { createLogger } from '../../utils/logger';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  userId?: string;
  email?: string;
  ip: string;
  userAgent: string;
  timestamp: Date;
  details: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export type SecurityEventType = 
  | 'login_attempt'
  | 'login_success'
  | 'login_failure'
  | 'logout'
  | 'password_change'
  | 'account_locked'
  | 'suspicious_activity'
  | 'rate_limit_exceeded'
  | 'unauthorized_access'
  | 'session_expired'
  | 'admin_action';

export interface RateLimitConfig {
  windowMs: number; // Janela de tempo em ms
  maxAttempts: number; // Máximo de tentativas
  blockDurationMs: number; // Tempo de bloqueio em ms
}

export interface SessionInfo {
  userId: string;
  sessionId: string;
  createdAt: Date;
  lastActivity: Date;
  ip: string;
  userAgent: string;
  isValid: boolean;
}

// ============================================================================
// SECURITY SERVICE CLASS
// ============================================================================

export class SecurityService {
  private logger = createLogger('SecurityService');
  private rateLimits = new Map<string, { count: number; firstAttempt: Date; blockedUntil?: Date }>();
  private activeSessions = new Map<string, SessionInfo>();
  private securityEvents: SecurityEvent[] = [];
  
  // Configurações de rate limiting
  private readonly configs = {
    login: { windowMs: 15 * 60 * 1000, maxAttempts: 5, blockDurationMs: 30 * 60 * 1000 }, // 5 tentativas em 15min, bloqueia por 30min
    api: { windowMs: 60 * 1000, maxAttempts: 100, blockDurationMs: 5 * 60 * 1000 }, // 100 requests por minuto
    signup: { windowMs: 60 * 60 * 1000, maxAttempts: 3, blockDurationMs: 60 * 60 * 1000 }, // 3 cadastros por hora
  };

  constructor() {
    this.logger.info('SecurityService initialized with enhanced protection');
    
    // Cleanup automático de dados antigos a cada hora
    setInterval(() => {
      this.cleanupOldData();
    }, 60 * 60 * 1000);
  }

  // ============================================================================
  // RATE LIMITING
  // ============================================================================

  /**
   * Verifica se uma ação está sendo executada dentro dos limites de rate
   */
  public checkRateLimit(
    identifier: string, 
    action: keyof typeof this.configs = 'api'
  ): { allowed: boolean; remainingAttempts: number; resetTime?: Date } {
    const config = this.configs[action];
    const key = `${action}:${identifier}`;
    const now = new Date();
    
    let record = this.rateLimits.get(key);
    
    // Se não existe registro ou janela expirou, criar novo
    if (!record || (now.getTime() - record.firstAttempt.getTime()) > config.windowMs) {
      record = { count: 0, firstAttempt: now };
      this.rateLimits.set(key, record);
    }
    
    // Verificar se está bloqueado
    if (record.blockedUntil && now < record.blockedUntil) {
      this.logSecurityEvent({
        type: 'rate_limit_exceeded',
        ip: this.getClientIP(),
        userAgent: this.getClientUserAgent(),
        details: { action, identifier, remainingBlockTime: record.blockedUntil.getTime() - now.getTime() },
        severity: 'medium'
      });
      
      return {
        allowed: false,
        remainingAttempts: 0,
        resetTime: record.blockedUntil
      };
    }
    
    // Incrementar contador
    record.count++;
    
    // Verificar se excedeu o limite
    if (record.count > config.maxAttempts) {
      record.blockedUntil = new Date(now.getTime() + config.blockDurationMs);
      
      this.logSecurityEvent({
        type: 'rate_limit_exceeded',
        ip: this.getClientIP(),
        userAgent: this.getClientUserAgent(),
        details: { action, identifier, attemptsCount: record.count },
        severity: 'high'
      });
      
      return {
        allowed: false,
        remainingAttempts: 0,
        resetTime: record.blockedUntil
      };
    }
    
    return {
      allowed: true,
      remainingAttempts: config.maxAttempts - record.count
    };
  }

  // ============================================================================
  // SESSION MANAGEMENT
  // ============================================================================

  /**
   * Cria uma nova sessão para o usuário
   */
  public createSession(userId: string): string {
    const sessionId = this.generateSessionId();
    const sessionInfo: SessionInfo = {
      userId,
      sessionId,
      createdAt: new Date(),
      lastActivity: new Date(),
      ip: this.getClientIP(),
      userAgent: this.getClientUserAgent(),
      isValid: true
    };
    
    this.activeSessions.set(sessionId, sessionInfo);
    
    this.logSecurityEvent({
      type: 'login_success',
      userId,
      ip: sessionInfo.ip,
      userAgent: sessionInfo.userAgent,
      details: { sessionId },
      severity: 'low'
    });
    
    this.logger.info(`Session created for user ${userId}: ${sessionId}`);
    return sessionId;
  }

  /**
   * Valida uma sessão existente
   */
  public validateSession(sessionId: string): { valid: boolean; session?: SessionInfo } {
    const session = this.activeSessions.get(sessionId);
    
    if (!session) {
      return { valid: false };
    }
    
    // Verificar se a sessão expirou (24 horas)
    const maxAge = 24 * 60 * 60 * 1000;
    const now = new Date();
    
    if (now.getTime() - session.lastActivity.getTime() > maxAge) {
      this.invalidateSession(sessionId, 'expired');
      return { valid: false };
    }
    
    // Atualizar última atividade
    session.lastActivity = now;
    this.activeSessions.set(sessionId, session);
    
    return { valid: true, session };
  }

  /**
   * Invalida uma sessão
   */
  public invalidateSession(sessionId: string, reason: 'logout' | 'expired' | 'security'): void {
    const session = this.activeSessions.get(sessionId);
    
    if (session) {
      session.isValid = false;
      this.activeSessions.delete(sessionId);
      
      this.logSecurityEvent({
        type: reason === 'logout' ? 'logout' : 'session_expired',
        userId: session.userId,
        ip: session.ip,
        userAgent: session.userAgent,
        details: { sessionId, reason },
        severity: reason === 'security' ? 'high' : 'low'
      });
      
      this.logger.info(`Session invalidated: ${sessionId} (reason: ${reason})`);
    }
  }

  /**
   * Lista sessões ativas de um usuário
   */
  public getUserSessions(userId: string): SessionInfo[] {
    return Array.from(this.activeSessions.values())
      .filter(session => session.userId === userId && session.isValid);
  }

  // ============================================================================
  // SECURITY LOGGING
  // ============================================================================

  /**
   * Registra um evento de segurança
   */
  public logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): void {
    const securityEvent: SecurityEvent = {
      ...event,
      id: this.generateEventId(),
      timestamp: new Date()
    };
    
    this.securityEvents.push(securityEvent);
    
    // Log baseado na severidade
    switch (event.severity) {
      case 'critical':
        this.logger.error(`CRITICAL SECURITY EVENT: ${event.type}`, securityEvent);
        break;
      case 'high':
        this.logger.warn(`HIGH SECURITY EVENT: ${event.type}`, securityEvent);
        break;
      case 'medium':
        this.logger.warn(`SECURITY EVENT: ${event.type}`, securityEvent);
        break;
      default:
        this.logger.info(`Security event: ${event.type}`, securityEvent);
    }
    
    // Manter apenas os últimos 1000 eventos
    if (this.securityEvents.length > 1000) {
      this.securityEvents = this.securityEvents.slice(-1000);
    }
  }

  /**
   * Busca eventos de segurança por filtros
   */
  public getSecurityEvents(filters?: {
    userId?: string;
    type?: SecurityEventType;
    severity?: SecurityEvent['severity'];
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): SecurityEvent[] {
    let events = [...this.securityEvents];
    
    if (filters) {
      if (filters.userId) {
        events = events.filter(e => e.userId === filters.userId);
      }
      if (filters.type) {
        events = events.filter(e => e.type === filters.type);
      }
      if (filters.severity) {
        events = events.filter(e => e.severity === filters.severity);
      }
      if (filters.startDate) {
        events = events.filter(e => e.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        events = events.filter(e => e.timestamp <= filters.endDate!);
      }
    }
    
    // Ordenar por timestamp (mais recente primeiro)
    events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    // Aplicar limite
    if (filters?.limit) {
      events = events.slice(0, filters.limit);
    }
    
    return events;
  }

  // ============================================================================
  // AUTHENTICATION HELPERS
  // ============================================================================

  /**
   * Valida tentativa de login
   */
  public validateLoginAttempt(email: string): { allowed: boolean; error?: string } {
    const rateLimitCheck = this.checkRateLimit(email, 'login');
    
    if (!rateLimitCheck.allowed) {
      return {
        allowed: false,
        error: `Muitas tentativas de login. Tente novamente ${rateLimitCheck.resetTime ? 'em ' + this.formatDuration(rateLimitCheck.resetTime.getTime() - Date.now()) : 'mais tarde'}.`
      };
    }
    
    // Validações adicionais
    if (!this.isValidEmail(email)) {
      this.logSecurityEvent({
        type: 'login_failure',
        email,
        ip: this.getClientIP(),
        userAgent: this.getClientUserAgent(),
        details: { reason: 'invalid_email' },
        severity: 'low'
      });
      
      return {
        allowed: false,
        error: 'Formato de email inválido.'
      };
    }
    
    return { allowed: true };
  }

  /**
   * Registra tentativa de login
   */
  public recordLoginAttempt(email: string, success: boolean, userId?: string): void {
    this.logSecurityEvent({
      type: success ? 'login_success' : 'login_failure',
      userId,
      email,
      ip: this.getClientIP(),
      userAgent: this.getClientUserAgent(),
      details: { success },
      severity: success ? 'low' : 'medium'
    });
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getClientIP(): string {
    // Em um ambiente real, isso viria do cabeçalho da requisição
    return '127.0.0.1';
  }

  private getClientUserAgent(): string {
    return typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private formatDuration(ms: number): string {
    const minutes = Math.ceil(ms / (60 * 1000));
    if (minutes < 60) {
      return `${minutes} minuto${minutes > 1 ? 's' : ''}`;
    }
    const hours = Math.ceil(minutes / 60);
    return `${hours} hora${hours > 1 ? 's' : ''}`;
  }

  private cleanupOldData(): void {
    const now = new Date();
    const maxAge = 24 * 60 * 60 * 1000; // 24 horas
    
    // Limpar rate limits antigos
    for (const [key, record] of this.rateLimits.entries()) {
      if (now.getTime() - record.firstAttempt.getTime() > maxAge) {
        this.rateLimits.delete(key);
      }
    }
    
    // Limpar sessões expiradas
    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (now.getTime() - session.lastActivity.getTime() > maxAge) {
        this.invalidateSession(sessionId, 'expired');
      }
    }
    
    // Manter apenas eventos dos últimos 7 dias
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    this.securityEvents = this.securityEvents.filter(event => event.timestamp > sevenDaysAgo);
    
    this.logger.info('Security data cleanup completed');
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  /**
   * Obtém estatísticas de segurança
   */
  public getSecurityStats(): {
    activeSessions: number;
    recentEvents: number;
    rateLimitedIPs: number;
    securityScore: number;
  } {
    const now = new Date();
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);
    
    const recentEvents = this.securityEvents.filter(e => e.timestamp > lastHour).length;
    const criticalEvents = this.securityEvents.filter(e => 
      e.timestamp > lastHour && (e.severity === 'high' || e.severity === 'critical')
    ).length;
    
    // Calcular score de segurança (0-100)
    let securityScore = 100;
    securityScore -= criticalEvents * 10; // -10 por evento crítico
    securityScore -= Math.min(recentEvents, 10) * 2; // -2 por evento recente (max 10)
    
    return {
      activeSessions: this.activeSessions.size,
      recentEvents,
      rateLimitedIPs: Array.from(this.rateLimits.values()).filter(r => r.blockedUntil && new Date() < r.blockedUntil).length,
      securityScore: Math.max(0, securityScore)
    };
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const securityService = new SecurityService();
export default securityService;