/**
 * 📊 METRICS SERVICE V9.0
 * 
 * Serviço avançado de métricas e analytics em tempo real
 * Rastreia uso de recursos, performance e comportamento do usuário
 * 
 * @methodology V9.0_NATURAL_LANGUAGE_FIRST
 * @specification METRICS-001
 * @author IA Beta - Analytics Architect
 */

import { createLogger } from '../../utils/logger';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface UserMetrics {
  userId: string;
  sessionId: string;
  events: MetricEvent[];
  sessionStart: Date;
  lastActivity: Date;
  totalScreenTime: number;
  pageViews: number;
  featuresUsed: Set<string>;
}

export interface MetricEvent {
  id: string;
  type: MetricEventType;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  data: Record<string, any>;
  duration?: number;
  metadata: {
    userAgent: string;
    viewport: { width: number; height: number };
    url: string;
    referrer?: string;
  };
}

export type MetricEventType = 
  | 'page_view'
  | 'feature_used'
  | 'script_generated'
  | 'script_exported'
  | 'user_interaction'
  | 'performance_metric'
  | 'error_occurred'
  | 'session_start'
  | 'session_end'
  | 'api_call'
  | 'auth_action';

export interface PerformanceMetrics {
  pageLoadTime: number;
  apiResponseTimes: Map<string, number[]>;
  renderTimes: Map<string, number>;
  memoryUsage?: number;
  errorRate: number;
  timestamp: Date;
}

export interface UsageStats {
  totalUsers: number;
  activeUsers: number;
  scriptsGenerated: number;
  scriptsExported: number;
  averageSessionDuration: number;
  topFeatures: Array<{ feature: string; usage: number }>;
  performanceScore: number;
}

export interface AnalyticsFilter {
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  eventType?: MetricEventType;
  feature?: string;
  limit?: number;
}

// ============================================================================
// METRICS SERVICE CLASS
// ============================================================================

export class MetricsService {
  private logger = createLogger('MetricsService');
  private events: MetricEvent[] = [];
  private userSessions = new Map<string, UserMetrics>();
  private performanceData: PerformanceMetrics[] = [];
  
  // Performance observers
  private observers: PerformanceObserver[] = [];
  
  constructor() {
    this.logger.info('MetricsService initialized with real-time tracking');
    this.initializePerformanceTracking();
    this.startPeriodicCleanup();
  }

  // ============================================================================
  // EVENT TRACKING
  // ============================================================================

  /**
   * Registra um evento de métrica
   */
  public trackEvent(
    type: MetricEventType,
    data: Record<string, any> = {},
    userId?: string,
    duration?: number
  ): void {
    const event: MetricEvent = {
      id: this.generateEventId(),
      type,
      timestamp: new Date(),
      userId,
      sessionId: this.getCurrentSessionId(),
      data,
      duration,
      metadata: {
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        url: window.location.href,
        referrer: document.referrer || undefined
      }
    };

    this.events.push(event);
    this.updateUserSession(event);

    // Log importante eventos
    if (['error_occurred', 'script_generated', 'api_call'].includes(type)) {
      this.logger.info(`Metric tracked: ${type}`, { 
        eventId: event.id, 
        data: event.data 
      });
    }

    // Manter apenas últimos 10000 eventos
    if (this.events.length > 10000) {
      this.events = this.events.slice(-10000);
    }
  }

  /**
   * Rastreia visualização de página
   */
  public trackPageView(page: string, userId?: string): void {
    this.trackEvent('page_view', {
      page,
      title: document.title,
      loadTime: performance.now()
    }, userId);
  }

  /**
   * Rastreia uso de funcionalidade
   */
  public trackFeatureUsage(feature: string, action: string, metadata: Record<string, any> = {}, userId?: string): void {
    this.trackEvent('feature_used', {
      feature,
      action,
      ...metadata
    }, userId);

    // Atualizar lista de features usadas na sessão
    const sessionId = this.getCurrentSessionId();
    const session = this.userSessions.get(sessionId);
    if (session) {
      session.featuresUsed.add(feature);
    }
  }

  /**
   * Rastreia geração de roteiro
   */
  public trackScriptGeneration(
    scriptConfig: Record<string, any>,
    success: boolean,
    duration: number,
    userId?: string
  ): void {
    this.trackEvent('script_generated', {
      config: scriptConfig,
      success,
      wordCount: scriptConfig.estimatedWords || 0,
      genre: scriptConfig.genre,
      audience: scriptConfig.audience
    }, userId, duration);
  }

  /**
   * Rastreia exportação de roteiro
   */
  public trackScriptExport(format: string, scriptTitle: string, success: boolean, userId?: string): void {
    this.trackEvent('script_exported', {
      format,
      scriptTitle,
      success,
      fileSize: 0 // Seria calculado em produção
    }, userId);
  }

  /**
   * Rastreia chamadas de API
   */
  public trackApiCall(endpoint: string, method: string, responseTime: number, success: boolean, userId?: string): void {
    this.trackEvent('api_call', {
      endpoint,
      method,
      responseTime,
      success,
      statusCode: success ? 200 : 500
    }, userId, responseTime);

    // Atualizar métricas de performance
    this.updateApiPerformance(endpoint, responseTime);
  }

  /**
   * Rastreia erros da aplicação
   */
  public trackError(error: Error, context: string, userId?: string): void {
    this.trackEvent('error_occurred', {
      message: error.message,
      stack: error.stack,
      context,
      errorType: error.name
    }, userId);

    this.logger.error(`Application error tracked: ${error.message}`, {
      context,
      userId
    });
  }

  // ============================================================================
  // SESSION MANAGEMENT
  // ============================================================================

  /**
   * Inicia uma nova sessão de usuário
   */
  public startUserSession(userId: string): string {
    const sessionId = this.generateSessionId();
    
    const userMetrics: UserMetrics = {
      userId,
      sessionId,
      events: [],
      sessionStart: new Date(),
      lastActivity: new Date(),
      totalScreenTime: 0,
      pageViews: 0,
      featuresUsed: new Set()
    };

    this.userSessions.set(sessionId, userMetrics);
    
    this.trackEvent('session_start', {
      userId,
      timestamp: new Date().toISOString()
    }, userId);

    this.logger.info(`User session started: ${sessionId} for user ${userId}`);
    return sessionId;
  }

  /**
   * Finaliza sessão de usuário
   */
  public endUserSession(sessionId: string): void {
    const session = this.userSessions.get(sessionId);
    if (!session) return;

    const sessionDuration = Date.now() - session.sessionStart.getTime();
    
    this.trackEvent('session_end', {
      duration: sessionDuration,
      pageViews: session.pageViews,
      featuresUsed: Array.from(session.featuresUsed),
      screenTime: session.totalScreenTime
    }, session.userId);

    this.userSessions.delete(sessionId);
    this.logger.info(`User session ended: ${sessionId}, duration: ${sessionDuration}ms`);
  }

  /**
   * Atualiza atividade da sessão
   */
  private updateUserSession(event: MetricEvent): void {
    const sessionId = this.getCurrentSessionId();
    const session = this.userSessions.get(sessionId);
    
    if (session) {
      session.lastActivity = new Date();
      session.events.push(event);
      
      if (event.type === 'page_view') {
        session.pageViews++;
      }
    }
  }

  // ============================================================================
  // PERFORMANCE TRACKING
  // ============================================================================

  /**
   * Inicializa tracking de performance
   */
  private initializePerformanceTracking(): void {
    // Navigation timing
    if ('performance' in window && 'getEntriesByType' in performance) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
          if (navigationEntries.length > 0) {
            const nav = navigationEntries[0];
            this.trackPerformanceMetric('page_load', nav.loadEventEnd - nav.loadEventStart);
          }
        }, 0);
      });
    }

    // Long tasks observer
    if ('PerformanceObserver' in window) {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.trackPerformanceMetric('long_task', entry.duration);
          }
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.push(longTaskObserver);
      } catch (e) {
        // Long tasks not supported
      }

      // Largest Contentful Paint
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.trackPerformanceMetric('lcp', lastEntry.startTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (e) {
        // LCP not supported
      }

      // First Input Delay
      try {
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.trackPerformanceMetric('fid', (entry as any).processingStart - entry.startTime);
          }
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch (e) {
        // FID not supported
      }
    }

    // Memory usage (if available)
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        this.trackPerformanceMetric('memory_usage', memory.usedJSHeapSize);
      }, 30000); // Every 30 seconds
    }
  }

  /**
   * Registra métrica de performance
   */
  private trackPerformanceMetric(metric: string, value: number): void {
    this.trackEvent('performance_metric', {
      metric,
      value,
      timestamp: Date.now()
    });
  }

  /**
   * Atualiza métricas de performance de API
   */
  private updateApiPerformance(endpoint: string, responseTime: number): void {
    const now = new Date();
    
    // Encontrar ou criar registro de performance
    let perfData = this.performanceData.find(p => 
      now.getTime() - p.timestamp.getTime() < 60000 // Últimos 60 segundos
    );
    
    if (!perfData) {
      perfData = {
        pageLoadTime: 0,
        apiResponseTimes: new Map(),
        renderTimes: new Map(),
        errorRate: 0,
        timestamp: now
      };
      this.performanceData.push(perfData);
    }

    // Atualizar tempos de resposta da API
    if (!perfData.apiResponseTimes.has(endpoint)) {
      perfData.apiResponseTimes.set(endpoint, []);
    }
    perfData.apiResponseTimes.get(endpoint)!.push(responseTime);

    // Manter apenas últimas 100 métricas
    if (this.performanceData.length > 100) {
      this.performanceData = this.performanceData.slice(-100);
    }
  }

  // ============================================================================
  // ANALYTICS & REPORTING
  // ============================================================================

  /**
   * Obtém estatísticas de uso
   */
  public getUsageStats(filter?: AnalyticsFilter): UsageStats {
    let filteredEvents = this.events;

    // Aplicar filtros
    if (filter) {
      if (filter.startDate) {
        filteredEvents = filteredEvents.filter(e => e.timestamp >= filter.startDate!);
      }
      if (filter.endDate) {
        filteredEvents = filteredEvents.filter(e => e.timestamp <= filter.endDate!);
      }
      if (filter.userId) {
        filteredEvents = filteredEvents.filter(e => e.userId === filter.userId);
      }
      if (filter.eventType) {
        filteredEvents = filteredEvents.filter(e => e.type === filter.eventType);
      }
    }

    // Calcular estatísticas
    const uniqueUsers = new Set(filteredEvents.map(e => e.userId).filter(Boolean)).size;
    const activeUsers = new Set(
      filteredEvents
        .filter(e => e.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000))
        .map(e => e.userId)
        .filter(Boolean)
    ).size;

    const scriptsGenerated = filteredEvents.filter(e => e.type === 'script_generated').length;
    const scriptsExported = filteredEvents.filter(e => e.type === 'script_exported').length;

    // Sessões ativas
    const sessionEvents = filteredEvents.filter(e => e.type === 'session_start' || e.type === 'session_end');
    const sessionDurations = this.calculateSessionDurations(sessionEvents);
    const averageSessionDuration = sessionDurations.length > 0 
      ? sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length 
      : 0;

    // Features mais usadas
    const featureUsage = new Map<string, number>();
    filteredEvents
      .filter(e => e.type === 'feature_used')
      .forEach(e => {
        const feature = e.data.feature;
        featureUsage.set(feature, (featureUsage.get(feature) || 0) + 1);
      });

    const topFeatures = Array.from(featureUsage.entries())
      .map(([feature, usage]) => ({ feature, usage }))
      .sort((a, b) => b.usage - a.usage)
      .slice(0, 10);

    // Score de performance
    const performanceScore = this.calculatePerformanceScore();

    return {
      totalUsers: uniqueUsers,
      activeUsers,
      scriptsGenerated,
      scriptsExported,
      averageSessionDuration,
      topFeatures,
      performanceScore
    };
  }

  /**
   * Obtém eventos filtrados
   */
  public getEvents(filter?: AnalyticsFilter): MetricEvent[] {
    let events = [...this.events];

    if (filter) {
      if (filter.startDate) {
        events = events.filter(e => e.timestamp >= filter.startDate!);
      }
      if (filter.endDate) {
        events = events.filter(e => e.timestamp <= filter.endDate!);
      }
      if (filter.userId) {
        events = events.filter(e => e.userId === filter.userId);
      }
      if (filter.eventType) {
        events = events.filter(e => e.type === filter.eventType);
      }
      if (filter.feature) {
        events = events.filter(e => e.data.feature === filter.feature);
      }
    }

    // Ordenar por timestamp (mais recente primeiro)
    events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Aplicar limite
    if (filter?.limit) {
      events = events.slice(0, filter.limit);
    }

    return events;
  }

  /**
   * Obtém métricas de performance
   */
  public getPerformanceMetrics(): PerformanceMetrics | null {
    if (this.performanceData.length === 0) return null;

    const latest = this.performanceData[this.performanceData.length - 1];
    
    // Calcular taxa de erro
    const recentEvents = this.events.filter(e => 
      e.timestamp > new Date(Date.now() - 60 * 60 * 1000)
    );
    const errorEvents = recentEvents.filter(e => e.type === 'error_occurred').length;
    const totalEvents = recentEvents.length;
    const errorRate = totalEvents > 0 ? (errorEvents / totalEvents) * 100 : 0;

    return {
      ...latest,
      errorRate
    };
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCurrentSessionId(): string {
    // Em produção, viria do contexto da sessão
    return localStorage.getItem('currentSessionId') || 'default_session';
  }

  private calculateSessionDurations(sessionEvents: MetricEvent[]): number[] {
    const sessions = new Map<string, { start?: Date; end?: Date }>();
    
    sessionEvents.forEach(event => {
      const sessionId = event.sessionId || 'unknown';
      if (!sessions.has(sessionId)) {
        sessions.set(sessionId, {});
      }
      
      const session = sessions.get(sessionId)!;
      if (event.type === 'session_start') {
        session.start = event.timestamp;
      } else if (event.type === 'session_end') {
        session.end = event.timestamp;
      }
    });

    return Array.from(sessions.values())
      .filter(s => s.start && s.end)
      .map(s => s.end!.getTime() - s.start!.getTime());
  }

  private calculatePerformanceScore(): number {
    const recentPerf = this.performanceData.slice(-10); // Últimas 10 amostras
    if (recentPerf.length === 0) return 100;

    let score = 100;

    // Penalizar por tempos de resposta altos
    recentPerf.forEach(perf => {
      perf.apiResponseTimes.forEach(times => {
        const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
        if (avgTime > 1000) score -= 10; // -10 para APIs > 1s
        else if (avgTime > 500) score -= 5; // -5 para APIs > 500ms
      });
    });

    // Penalizar por taxa de erro
    const avgErrorRate = recentPerf.reduce((sum, p) => sum + p.errorRate, 0) / recentPerf.length;
    score -= avgErrorRate * 2; // -2 por % de erro

    return Math.max(0, Math.min(100, score));
  }

  private startPeriodicCleanup(): void {
    // Limpeza a cada hora
    setInterval(() => {
      const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 dias

      // Limpar eventos antigos
      this.events = this.events.filter(e => e.timestamp > cutoff);

      // Limpar métricas de performance antigas
      this.performanceData = this.performanceData.filter(p => p.timestamp > cutoff);

      // Limpar sessões inativas
      for (const [sessionId, session] of this.userSessions.entries()) {
        if (session.lastActivity < new Date(Date.now() - 60 * 60 * 1000)) {
          this.endUserSession(sessionId);
        }
      }

      this.logger.info('Metrics cleanup completed');
    }, 60 * 60 * 1000);
  }

  /**
   * Destroi o serviço e limpa recursos
   */
  public destroy(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.logger.info('MetricsService destroyed');
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const metricsService = new MetricsService();
export default metricsService;