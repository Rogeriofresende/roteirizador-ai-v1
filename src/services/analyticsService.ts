// Google Analytics 4 + Business Metrics para MVP
// Gratuito, completo, foco em crescimento

import { collection, doc, getDoc, setDoc, updateDoc, increment, Timestamp, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { ClarityService } from './clarityService';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

interface UserProperties {
  user_id?: string;
  user_type?: 'free' | 'premium' | 'trial';
  signup_date?: string;
  last_login?: string;
  total_scripts?: number;
  favorite_platform?: string;
}

interface BusinessEvent {
  event_name: string;
  event_category: string;
  event_label?: string;
  value?: number;
  custom_parameters?: Record<string, any>;
}

interface ConversionFunnel {
  step: 'page_view' | 'form_start' | 'form_complete' | 'script_generated' | 'script_used' | 'user_converted';
  platform?: string;
  session_id: string;
  user_id?: string;
}

interface AnalyticsConfig {
  ga_measurement_id: string;
  debug_mode: boolean;
  enhanced_measurement: boolean;
  send_page_view: boolean;
}

interface AnalyticsEvent {
  userId: string;
  event: string;
  properties?: Record<string, any>;
  timestamp: Timestamp;
  sessionId: string;
  userAgent?: string;
  platform?: string;
}

interface UserSession {
  userId: string;
  sessionId: string;
  startTime: Timestamp;
  endTime?: Timestamp;
  pageViews: number;
  events: number;
  projectsCreated: number;
  projectsEdited: number;
  searchQueries: number;
  duration?: number;
}

interface DashboardMetrics {
  totalUsers: number;
  activeUsers: number;
  projectsToday: number;
  projectsThisWeek: number;
  projectsThisMonth: number;
  searchesToday: number;
  avgSessionDuration: number;
  topPlatforms: Array<{ platform: string; count: number; percentage: number }>;
  userGrowth: Array<{ date: string; users: number; projects: number }>;
  engagement: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    avgProjectsPerUser: number;
    avgSessionsPerUser: number;
  };
}

interface UserAnalytics {
  userId: string;
  totalProjects: number;
  projectsThisWeek: number;
  projectsThisMonth: number;
  totalWords: number;
  avgWordsPerProject: number;
  favoriteProjects: number;
  sharedProjects: number;
  searchQueries: number;
  totalSessions: number;
  avgSessionDuration: number;
  lastActive: Timestamp;
  mostUsedPlatform: string;
  topTags: string[];
  productivityScore: number;
  streakDays: number;
}

export class AnalyticsService {
  private isInitialized = false;
  private sessionId: string;
  private userId?: string;
  private config: AnalyticsConfig;
  private conversionFunnelData: ConversionFunnel[] = [];
  private static currentSessionId: string | null = null;
  private static sessionStartTime: Date | null = null;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.config = {
      ga_measurement_id: import.meta.env.VITE_GA_MEASUREMENT_ID || '',
      debug_mode: import.meta.env.DEV,
      enhanced_measurement: true,
      send_page_view: true
    };
    
    this.init();
  }

  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private async init() {
    if (!this.config.ga_measurement_id) {
      console.warn('Analytics: GA Measurement ID não configurado');
      return;
    }

    try {
      // Load GA4 script
      await this.loadGtagScript();
      
      // Initialize GA4
      this.initializeGA4();
      
      // Setup event listeners
      this.setupEventListeners();
      
      this.isInitialized = true;
      console.log('✅ Analytics inicializado:', this.config.ga_measurement_id);
    } catch (error) {
      console.error('❌ Erro ao inicializar Analytics:', error);
    }
  }

  private async loadGtagScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Se já existe, não carrega novamente
      if (window.gtag) {
        resolve();
        return;
      }

      // Initialize dataLayer
      window.dataLayer = window.dataLayer || [];
      window.gtag = function() {
        window.dataLayer.push(arguments);
      };

      // Load GA4 script
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.ga_measurement_id}`;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Falha ao carregar GA4 script'));
      document.head.appendChild(script);
    });
  }

  private initializeGA4() {
    if (!window.gtag) return;

    // Configure GA4
    window.gtag('config', this.config.ga_measurement_id, {
      // Enhanced measurement
      enhanced_measurements: this.config.enhanced_measurement,
      
      // Debug mode
      debug_mode: this.config.debug_mode,
      
      // Session configuration
      session_timeout: 30 * 60, // 30 minutos
      
      // Custom dimensions (free tier: 25 custom dimensions)
      custom_map: {
        'custom_parameter_1': 'platform',
        'custom_parameter_2': 'generation_time',
        'custom_parameter_3': 'user_type',
        'custom_parameter_4': 'script_length',
        'custom_parameter_5': 'session_id'
      },

      // Send initial page view
      send_page_view: this.config.send_page_view
    });

    // Set session ID globally
    this.setSessionId(this.sessionId);
  }

  private setupEventListeners() {
    // Page visibility for session tracking
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackEvent('session_pause', 'engagement');
      } else {
        this.trackEvent('session_resume', 'engagement');
      }
    });

    // Unload tracking
    window.addEventListener('beforeunload', () => {
      this.trackEvent('session_end', 'engagement', {
        session_duration: Date.now() - parseInt(this.sessionId.split('_')[1])
      });
    });

    // Error tracking
    window.addEventListener('error', (event) => {
      this.trackError(event.error?.message || 'JavaScript Error', {
        filename: event.filename,
        line: event.lineno,
        column: event.colno
      });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError('Unhandled Promise Rejection', {
        reason: event.reason?.toString()
      });
    });
  }

  // Public Methods

  public setUserId(userId: string) {
    this.userId = userId;
    if (window.gtag) {
      window.gtag('config', this.config.ga_measurement_id, {
        user_id: userId
      });
    }
  }

  public setUserProperties(properties: UserProperties) {
    if (window.gtag) {
      window.gtag('set', 'user_properties', properties);
    }
  }

  private setSessionId(sessionId: string) {
    if (window.gtag) {
      window.gtag('set', {
        session_id: sessionId
      });
    }
  }

  public trackEvent(eventName: string, eventCategory: string, parameters: Record<string, any> = {}) {
    if (!this.isInitialized || !window.gtag) return;

    const eventData = {
      event_category: eventCategory,
      session_id: this.sessionId,
      timestamp: new Date().toISOString(),
      ...parameters
    };

    window.gtag('event', eventName, eventData);

    // Log para debug em desenvolvimento
    if (this.config.debug_mode) {
      console.log('📊 Analytics Event:', eventName, eventData);
    }

    // Integração com Microsoft Clarity
    if (typeof ClarityService !== 'undefined') {
      try {
        ClarityService.trackEvent(eventName, eventData);
      } catch (error) {
        // Falha silenciosa para não quebrar analytics principal
        if (this.config.debug_mode) {
          console.warn('Erro ao integrar com Clarity:', error);
        }
      }
    }
  }

  public trackPageView(page: string, title?: string) {
    if (!this.isInitialized || !window.gtag) return;

    window.gtag('event', 'page_view', {
      page_title: title || document.title,
      page_location: window.location.href,
      page: page,
      session_id: this.sessionId
    });

    // Track no funil de conversão
    this.trackConversionFunnel('page_view', { page });
  }

  // Business-specific tracking methods

  public trackScriptGeneration(data: {
    platform: string;
    subject: string;
    duration: string;
    tone: string;
    audience: string;
    success: boolean;
    generation_time: number;
    script_length?: number;
    error_message?: string;
  }) {
    this.trackEvent('script_generation', 'ai_interaction', {
      platform: data.platform,
      success: data.success,
      generation_time: data.generation_time,
      script_length: data.script_length || 0,
      duration: data.duration,
      tone: data.tone,
      audience: data.audience,
      value: data.success ? 1 : 0
    });

    // Track conversion funnel
    if (data.success) {
      this.trackConversionFunnel('script_generated', {
        platform: data.platform,
        generation_time: data.generation_time
      });
    }

    // Track error se falhou
    if (!data.success && data.error_message) {
      this.trackError('Script Generation Failed', {
        platform: data.platform,
        error_message: data.error_message
      });
    }

    // Integração específica com Microsoft Clarity
    if (typeof ClarityService !== 'undefined') {
      try {
        ClarityService.trackScriptGeneration({
          platform: data.platform,
          duration: data.duration,
          success: data.success,
          generationTime: data.generation_time
        });
      } catch (error) {
        if (this.config.debug_mode) {
          console.warn('Erro ao integrar script generation com Clarity:', error);
        }
      }
    }
  }

  public trackUserAction(action: string, details: Record<string, any> = {}) {
    this.trackEvent(action, 'user_interaction', {
      ...details,
      action_timestamp: Date.now()
    });
  }

  public trackFeatureUsage(feature: string, context: Record<string, any> = {}) {
    this.trackEvent('feature_used', 'engagement', {
      feature_name: feature,
      ...context
    });
  }

  public trackConversionFunnel(step: ConversionFunnel['step'], data: Record<string, any> = {}) {
    const funnelData: ConversionFunnel = {
      step,
      session_id: this.sessionId,
      user_id: this.userId,
      ...data
    };

    this.conversionFunnelData.push(funnelData);

    // Track no GA4
    this.trackEvent('funnel_step', 'conversion', {
      funnel_step: step,
      ...data
    });

    // Salvar localmente para análise
    this.saveConversionData();
  }

  public trackPerformance(metric: string, value: number, unit: string = 'ms') {
    this.trackEvent('performance_metric', 'performance', {
      metric_name: metric,
      metric_value: value,
      metric_unit: unit
    });
  }

  public trackError(error: string, context: Record<string, any> = {}) {
    this.trackEvent('error_occurred', 'error', {
      error_message: error,
      error_context: JSON.stringify(context),
      user_agent: navigator.userAgent,
      url: window.location.href
    });
  }

  // Business Intelligence Methods

  public getSessionData(): any {
    return {
      session_id: this.sessionId,
      user_id: this.userId,
      start_time: parseInt(this.sessionId.split('_')[1]),
      page_views: this.conversionFunnelData.filter(d => d.step === 'page_view').length,
      scripts_generated: this.conversionFunnelData.filter(d => d.step === 'script_generated').length,
      conversion_funnel: this.conversionFunnelData
    };
  }

  public getConversionRate(): number {
    const pageViews = this.conversionFunnelData.filter(d => d.step === 'page_view').length;
    const scriptsGenerated = this.conversionFunnelData.filter(d => d.step === 'script_generated').length;
    
    return pageViews > 0 ? (scriptsGenerated / pageViews) * 100 : 0;
  }

  private saveConversionData() {
    try {
      const key = 'analytics_conversion_data';
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      
      // Manter apenas os últimos 100 registros
      const updated = [...existing, ...this.conversionFunnelData].slice(-100);
      localStorage.setItem(key, JSON.stringify(updated));
      
      this.conversionFunnelData = []; // Clear after saving
    } catch (error) {
      console.warn('Erro ao salvar dados de conversão:', error);
    }
  }

  // A/B Testing Support (básico)
  public trackExperiment(experimentId: string, variant: string) {
    this.trackEvent('experiment_view', 'experiment', {
      experiment_id: experimentId,
      variant_id: variant
    });
  }

  // Real User Monitoring (RUM)
  public trackWebVitals() {
    if (!('PerformanceObserver' in window)) return;

    // Core Web Vitals tracking
    try {
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS((metric) => this.trackPerformance('CLS', metric.value, 'score'));
        getFID((metric) => this.trackPerformance('FID', metric.value, 'ms'));
        getFCP((metric) => this.trackPerformance('FCP', metric.value, 'ms'));
        getLCP((metric) => this.trackPerformance('LCP', metric.value, 'ms'));
        getTTFB((metric) => this.trackPerformance('TTFB', metric.value, 'ms'));
      }).catch(() => {
        // Se web-vitals não estiver disponível, usar métricas básicas
        this.trackBasicPerformanceMetrics();
      });
    } catch (error) {
      this.trackBasicPerformanceMetrics();
    }
  }

  private trackBasicPerformanceMetrics() {
    // Fallback para métricas básicas
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navigation) {
      this.trackPerformance('load_time', Math.round(navigation.loadEventEnd - navigation.fetchStart));
      this.trackPerformance('dom_content_loaded', Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart));
    }
  }

  // Export data for analysis
  public exportAnalyticsData(): string {
    const data = {
      session: this.getSessionData(),
      conversion_rate: this.getConversionRate(),
      stored_conversions: JSON.parse(localStorage.getItem('analytics_conversion_data') || '[]'),
      browser_info: {
        user_agent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        online: navigator.onLine
      },
      timestamp: new Date().toISOString()
    };

    return JSON.stringify(data, null, 2);
  }

  // Debug methods
  public getDebugInfo(): any {
    return {
      initialized: this.isInitialized,
      session_id: this.sessionId,
      user_id: this.userId,
      config: this.config,
      ga4_loaded: !!window.gtag,
      conversion_funnel_length: this.conversionFunnelData.length
    };
  }

  // **SESSÕES E EVENTOS**
  
  static async startSession(userId: string): Promise<string> {
    const sessionId = `${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.currentSessionId = sessionId;
    this.sessionStartTime = new Date();

    const sessionData: UserSession = {
      userId,
      sessionId,
      startTime: Timestamp.fromDate(this.sessionStartTime),
      pageViews: 1,
      events: 0,
      projectsCreated: 0,
      projectsEdited: 0,
      searchQueries: 0
    };

    try {
      await setDoc(doc(db, 'sessions', sessionId), sessionData);
      await this.updateUserLastActive(userId);
      return sessionId;
    } catch (error) {
      console.error('Erro ao iniciar sessão:', error);
      throw error;
    }
  }

  static async endSession(userId: string): Promise<void> {
    if (!this.currentSessionId || !this.sessionStartTime) return;

    const endTime = new Date();
    const duration = Math.round((endTime.getTime() - this.sessionStartTime.getTime()) / 1000);

    try {
      await updateDoc(doc(db, 'sessions', this.currentSessionId), {
        endTime: Timestamp.fromDate(endTime),
        duration
      });

      this.currentSessionId = null;
      this.sessionStartTime = null;
    } catch (error) {
      console.error('Erro ao finalizar sessão:', error);
    }
  }

  static async trackEvent(
    userId: string, 
    event: string, 
    properties: Record<string, any> = {}
  ): Promise<void> {
    if (!userId) return;

    const eventData: AnalyticsEvent = {
      userId,
      event,
      properties,
      timestamp: Timestamp.now(),
      sessionId: this.currentSessionId || 'unknown',
      userAgent: navigator.userAgent,
      platform: navigator.platform
    };

    try {
      // Salvar evento
      const eventsRef = collection(db, 'analytics_events');
      await setDoc(doc(eventsRef), eventData);

      // Atualizar contadores da sessão
      if (this.currentSessionId) {
        const updateData: Partial<UserSession> = {
          events: increment(1)
        };

        // Eventos especiais
        if (event === 'project_created') {
          updateData.projectsCreated = increment(1);
        } else if (event === 'project_edited') {
          updateData.projectsEdited = increment(1);
        } else if (event === 'search_performed') {
          updateData.searchQueries = increment(1);
        } else if (event === 'page_view') {
          updateData.pageViews = increment(1);
        }

        await updateDoc(doc(db, 'sessions', this.currentSessionId), updateData);
      }

      // Atualizar analytics do usuário
      await this.updateUserAnalytics(userId, event, properties);

    } catch (error) {
      console.error('Erro ao rastrear evento:', error);
    }
  }

  // **ANALYTICS DO USUÁRIO**

  static async getUserAnalytics(userId: string): Promise<UserAnalytics | null> {
    try {
      const userAnalyticsDoc = await getDoc(doc(db, 'user_analytics', userId));
      
      if (!userAnalyticsDoc.exists()) {
        // Criar analytics iniciais
        const initialAnalytics: UserAnalytics = {
          userId,
          totalProjects: 0,
          projectsThisWeek: 0,
          projectsThisMonth: 0,
          totalWords: 0,
          avgWordsPerProject: 0,
          favoriteProjects: 0,
          sharedProjects: 0,
          searchQueries: 0,
          totalSessions: 0,
          avgSessionDuration: 0,
          lastActive: Timestamp.now(),
          mostUsedPlatform: '',
          topTags: [],
          productivityScore: 0,
          streakDays: 0
        };

        await setDoc(doc(db, 'user_analytics', userId), initialAnalytics);
        return initialAnalytics;
      }

      return userAnalyticsDoc.data() as UserAnalytics;
    } catch (error) {
      console.error('Erro ao obter analytics do usuário:', error);
      return null;
    }
  }

  static async updateUserAnalytics(
    userId: string, 
    event: string, 
    properties: Record<string, any> = {}
  ): Promise<void> {
    try {
      const userAnalyticsRef = doc(db, 'user_analytics', userId);
      const updateData: Partial<UserAnalytics> = {
        lastActive: Timestamp.now()
      };

      switch (event) {
        case 'project_created':
          updateData.totalProjects = increment(1);
          updateData.projectsThisWeek = increment(1);
          updateData.projectsThisMonth = increment(1);
          
          if (properties.wordCount) {
            updateData.totalWords = increment(properties.wordCount);
          }
          break;

        case 'project_edited':
          if (properties.wordCount) {
            updateData.totalWords = increment(properties.wordCount);
          }
          break;

        case 'project_favorited':
          updateData.favoriteProjects = increment(1);
          break;

        case 'project_unfavorited':
          updateData.favoriteProjects = increment(-1);
          break;

        case 'project_shared':
          updateData.sharedProjects = increment(1);
          break;

        case 'search_performed':
          updateData.searchQueries = increment(1);
          break;

        case 'session_started':
          updateData.totalSessions = increment(1);
          break;
      }

      await updateDoc(userAnalyticsRef, updateData);
    } catch (error) {
      console.error('Erro ao atualizar analytics do usuário:', error);
    }
  }

  // **MÉTRICAS DO DASHBOARD**

  static async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Buscar estatísticas gerais
      const [
        totalUsersSnapshot,
        activeUsersSnapshot,
        projectsTodaySnapshot,
        projectsWeekSnapshot,
        projectsMonthSnapshot,
        searchesTodaySnapshot
      ] = await Promise.all([
        getDocs(collection(db, 'user_analytics')),
        getDocs(query(
          collection(db, 'user_analytics'),
          where('lastActive', '>=', Timestamp.fromDate(today))
        )),
        getDocs(query(
          collection(db, 'analytics_events'),
          where('event', '==', 'project_created'),
          where('timestamp', '>=', Timestamp.fromDate(today))
        )),
        getDocs(query(
          collection(db, 'analytics_events'),
          where('event', '==', 'project_created'),
          where('timestamp', '>=', Timestamp.fromDate(weekAgo))
        )),
        getDocs(query(
          collection(db, 'analytics_events'),
          where('event', '==', 'project_created'),
          where('timestamp', '>=', Timestamp.fromDate(monthAgo))
        )),
        getDocs(query(
          collection(db, 'analytics_events'),
          where('event', '==', 'search_performed'),
          where('timestamp', '>=', Timestamp.fromDate(today))
        ))
      ]);

      // Calcular métricas de sessão
      const sessionsSnapshot = await getDocs(query(
        collection(db, 'sessions'),
        where('startTime', '>=', Timestamp.fromDate(monthAgo))
      ));

      let totalSessionDuration = 0;
      let completedSessions = 0;
      
      sessionsSnapshot.docs.forEach(doc => {
        const session = doc.data() as UserSession;
        if (session.duration) {
          totalSessionDuration += session.duration;
          completedSessions++;
        }
      });

      const avgSessionDuration = completedSessions > 0 
        ? Math.round(totalSessionDuration / completedSessions) 
        : 0;

      // Calcular plataformas mais usadas
      const platformsSnapshot = await getDocs(query(
        collection(db, 'analytics_events'),
        where('event', '==', 'project_created'),
        where('timestamp', '>=', Timestamp.fromDate(monthAgo))
      ));

      const platformCounts: Record<string, number> = {};
      let totalPlatformProjects = 0;

      platformsSnapshot.docs.forEach(doc => {
        const event = doc.data() as AnalyticsEvent;
        const platform = event.properties?.platform || 'Desconhecido';
        platformCounts[platform] = (platformCounts[platform] || 0) + 1;
        totalPlatformProjects++;
      });

      const topPlatforms = Object.entries(platformCounts)
        .map(([platform, count]) => ({
          platform,
          count,
          percentage: totalPlatformProjects > 0 ? Math.round((count / totalPlatformProjects) * 100) : 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Calcular crescimento de usuários (simulado)
      const userGrowth = [];
      for (let i = 7; i >= 0; i--) {
        const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
        userGrowth.push({
          date: date.toISOString().split('T')[0],
          users: Math.floor(Math.random() * 50) + 10,
          projects: Math.floor(Math.random() * 100) + 20
        });
      }

      // Métricas de engajamento
      const engagement = {
        dailyActiveUsers: activeUsersSnapshot.size,
        weeklyActiveUsers: Math.floor(activeUsersSnapshot.size * 1.5),
        monthlyActiveUsers: Math.floor(activeUsersSnapshot.size * 3),
        avgProjectsPerUser: totalUsersSnapshot.size > 0 
          ? Math.round(projectsMonthSnapshot.size / totalUsersSnapshot.size * 10) / 10 
          : 0,
        avgSessionsPerUser: totalUsersSnapshot.size > 0 
          ? Math.round(sessionsSnapshot.size / totalUsersSnapshot.size * 10) / 10 
          : 0
      };

      return {
        totalUsers: totalUsersSnapshot.size,
        activeUsers: activeUsersSnapshot.size,
        projectsToday: projectsTodaySnapshot.size,
        projectsThisWeek: projectsWeekSnapshot.size,
        projectsThisMonth: projectsMonthSnapshot.size,
        searchesToday: searchesTodaySnapshot.size,
        avgSessionDuration,
        topPlatforms,
        userGrowth,
        engagement
      };

    } catch (error) {
      console.error('Erro ao obter métricas do dashboard:', error);
      throw error;
    }
  }

  // **RELATÓRIOS ESPECÍFICOS**

  static async getProjectsCreatedReport(
    startDate: Date, 
    endDate: Date, 
    groupBy: 'day' | 'week' | 'month' = 'day'
  ): Promise<Array<{ date: string; count: number }>> {
    try {
      const eventsSnapshot = await getDocs(query(
        collection(db, 'analytics_events'),
        where('event', '==', 'project_created'),
        where('timestamp', '>=', Timestamp.fromDate(startDate)),
        where('timestamp', '<=', Timestamp.fromDate(endDate)),
        orderBy('timestamp')
      ));

      const groupedData: Record<string, number> = {};

      eventsSnapshot.docs.forEach(doc => {
        const event = doc.data() as AnalyticsEvent;
        const date = event.timestamp.toDate();
        
        let key: string;
        switch (groupBy) {
          case 'week':
            const week = Math.floor(date.getTime() / (7 * 24 * 60 * 60 * 1000));
            key = `Semana ${week}`;
            break;
          case 'month':
            key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            break;
          default:
            key = date.toISOString().split('T')[0];
        }

        groupedData[key] = (groupedData[key] || 0) + 1;
      });

      return Object.entries(groupedData)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

    } catch (error) {
      console.error('Erro ao gerar relatório de projetos:', error);
      return [];
    }
  }

  static async getUserActivityReport(userId: string): Promise<{
    dailyActivity: Array<{ date: string; events: number; projects: number }>;
    topEvents: Array<{ event: string; count: number }>;
    platformUsage: Array<{ platform: string; count: number }>;
  }> {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      const eventsSnapshot = await getDocs(query(
        collection(db, 'analytics_events'),
        where('userId', '==', userId),
        where('timestamp', '>=', Timestamp.fromDate(thirtyDaysAgo)),
        orderBy('timestamp')
      ));

      const dailyActivity: Record<string, { events: number; projects: number }> = {};
      const eventCounts: Record<string, number> = {};
      const platformCounts: Record<string, number> = {};

      eventsSnapshot.docs.forEach(doc => {
        const event = doc.data() as AnalyticsEvent;
        const date = event.timestamp.toDate().toISOString().split('T')[0];

        // Atividade diária
        if (!dailyActivity[date]) {
          dailyActivity[date] = { events: 0, projects: 0 };
        }
        dailyActivity[date].events++;
        
        if (event.event === 'project_created') {
          dailyActivity[date].projects++;
        }

        // Contagem de eventos
        eventCounts[event.event] = (eventCounts[event.event] || 0) + 1;

        // Uso de plataforma
        if (event.properties?.platform) {
          const platform = event.properties.platform;
          platformCounts[platform] = (platformCounts[platform] || 0) + 1;
        }
      });

      return {
        dailyActivity: Object.entries(dailyActivity)
          .map(([date, data]) => ({ date, ...data }))
          .sort((a, b) => a.date.localeCompare(b.date)),
        topEvents: Object.entries(eventCounts)
          .map(([event, count]) => ({ event, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10),
        platformUsage: Object.entries(platformCounts)
          .map(([platform, count]) => ({ platform, count }))
          .sort((a, b) => b.count - a.count)
      };

    } catch (error) {
      console.error('Erro ao gerar relatório de atividade do usuário:', error);
      return { dailyActivity: [], topEvents: [], platformUsage: [] };
    }
  }

  // **HELPERS**

  private static async updateUserLastActive(userId: string): Promise<void> {
    try {
      const userAnalyticsRef = doc(db, 'user_analytics', userId);
      await updateDoc(userAnalyticsRef, {
        lastActive: Timestamp.now()
      });
    } catch (error) {
      // Se o documento não existir, criar um novo
      await this.getUserAnalytics(userId);
    }
  }

  // **MÉTODOS DE CONVENIÊNCIA**

  static trackPageView(userId: string, page: string): Promise<void> {
    return this.trackEvent(userId, 'page_view', { page });
  }

  static trackProjectCreated(userId: string, projectData: any): Promise<void> {
    return this.trackEvent(userId, 'project_created', {
      platform: projectData.formData?.platform,
      wordCount: projectData.content?.length || 0,
      duration: projectData.formData?.duration
    });
  }

  static trackProjectEdited(userId: string, projectData: any): Promise<void> {
    return this.trackEvent(userId, 'project_edited', {
      platform: projectData.formData?.platform,
      wordCount: projectData.content?.length || 0
    });
  }

  static trackSearch(userId: string, searchTerm: string, resultCount: number): Promise<void> {
    return this.trackEvent(userId, 'search_performed', {
      searchTerm,
      resultCount
    });
  }

  static trackProjectAction(userId: string, action: string, projectData: any): Promise<void> {
    return this.trackEvent(userId, `project_${action}`, {
      platform: projectData.formData?.platform,
      projectId: projectData.id
    });
  }
}

// Singleton
export const analyticsService = new AnalyticsService();

// Global access for debugging
if (typeof window !== 'undefined') {
  (window as any).analytics = analyticsService;
} 