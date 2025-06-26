// Sistema de Health Checks para MVP em Produção
// Gratuito, robusto, alertas críticos automáticos

import { collection, doc, getDoc, setDoc, updateDoc, getDocs, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebaseConfig';

interface HealthCheck {
  name: string;
  check: () => Promise<HealthResult>;
  critical: boolean;
  timeout: number;
}

interface HealthResult {
  status: 'healthy' | 'warning' | 'critical';
  message: string;
  details?: any;
  timestamp: string;
  responseTime: number;
}

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Timestamp;
  services: {
    firebase: ServiceStatus;
    gemini: ServiceStatus;
    pwa: ServiceStatus;
    authentication: ServiceStatus;
  };
  metrics: {
    responseTime: number;
    uptime: number;
    errorRate: number;
    activeUsers: number;
    totalProjects: number;
  };
  issues: SystemIssue[];
}

interface ServiceStatus {
  status: 'operational' | 'degraded' | 'outage';
  responseTime: number;
  lastCheck: Timestamp;
  uptime: number;
  errorCount: number;
  message?: string;
}

interface SystemIssue {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  service: string;
  message: string;
  timestamp: Timestamp;
  resolved: boolean;
  resolvedAt?: Timestamp;
}

interface PerformanceMetrics {
  cpuUsage: number;
  memoryUsage: number;
  networkLatency: number;
  databaseResponseTime: number;
  geminiApiResponseTime: number;
  errorRate: number;
  requestsPerMinute: number;
  timestamp: Timestamp;
}

interface MaintenanceWindow {
  id: string;
  title: string;
  description: string;
  startTime: Timestamp;
  endTime: Timestamp;
  affectedServices: string[];
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  createdBy: string;
  notifications: {
    email: boolean;
    inApp: boolean;
    beforeWindow: number; // minutos antes
  };
}

export class HealthCheckService {
  private static readonly HEALTH_CHECK_INTERVAL = 60000; // 1 minuto
  private static readonly ERROR_THRESHOLD = 0.05; // 5% de taxa de erro
  private static readonly RESPONSE_TIME_THRESHOLD = 2000; // 2 segundos
  private static isMonitoring = false;
  private static monitoringInterval: NodeJS.Timeout | null = null;
  private static alertsCache: any[] = []; // Cache para alertas
  private static healthCache: any = null; // Cache para health data quando Firebase não disponível

  // **VERIFICAÇÃO DE FIREBASE**
  private static checkFirebaseAvailable(): boolean {
    return isFirebaseConfigured && db !== null;
  }

  // **MONITORAMENTO PRINCIPAL**

  static async startMonitoring(): Promise<void> {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    console.log('🔍 Iniciando monitoramento de saúde do sistema...');

    // Check inicial
    await this.performHealthCheck();

    // Configurar interval
    this.monitoringInterval = setInterval(async () => {
      try {
        await this.performHealthCheck();
      } catch (error) {
        console.error('Erro no health check automático:', error);
      }
    }, this.HEALTH_CHECK_INTERVAL);
  }

  static stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    console.log('⏹️ Monitoramento de saúde do sistema parado.');
  }

  static async performHealthCheck(): Promise<SystemHealth> {
    const startTime = Date.now();
    const timestamp = new Date(); // Usar Date normal se Firebase não disponível

    try {
      console.log('🔧 DEBUG: Executando performHealthCheck()');
      
      // Verificar serviços em paralelo
      const [
        firebaseStatus,
        geminiStatus,
        pwaStatus,
        authStatus,
        metrics
      ] = await Promise.all([
        this.checkFirebaseHealth(),
        this.checkGeminiHealth(),
        this.checkPWAHealth(),
        this.checkAuthenticationHealth(),
        this.getSystemMetrics()
      ]);

      const responseTime = Date.now() - startTime;

      // Determinar status geral
      const services = {
        firebase: firebaseStatus,
        gemini: geminiStatus,
        pwa: pwaStatus,
        authentication: authStatus
      };

      const overallStatus = this.determineOverallStatus(services);

      // Detectar problemas
      const issues = await this.detectIssues(services, metrics);

      const healthData: SystemHealth = {
        status: overallStatus,
        timestamp: this.checkFirebaseAvailable() ? Timestamp.now() : new Date() as any,
        services,
        metrics: {
          responseTime,
          uptime: this.calculateUptime(),
          errorRate: metrics.errorRate,
          activeUsers: metrics.activeUsers,
          totalProjects: metrics.totalProjects
        },
        issues
      };

      // Salvar (Firebase ou cache local)
      await this.saveHealthData(healthData);

      // Notificar se necessário
      if (overallStatus !== 'healthy') {
        await this.notifyHealthIssues(healthData);
      }

      console.log('✅ DEBUG: performHealthCheck() concluído com sucesso');
      return healthData;

    } catch (error) {
      console.error('❌ DEBUG: Erro no performHealthCheck():', error);
      
      const errorHealthData: SystemHealth = {
        status: 'unhealthy',
        timestamp: this.checkFirebaseAvailable() ? Timestamp.now() : new Date() as any,
        services: {
          firebase: { status: 'outage', responseTime: -1, lastCheck: this.checkFirebaseAvailable() ? Timestamp.now() : new Date() as any, uptime: 0, errorCount: 1 },
          gemini: { status: 'outage', responseTime: -1, lastCheck: this.checkFirebaseAvailable() ? Timestamp.now() : new Date() as any, uptime: 0, errorCount: 1 },
          pwa: { status: 'outage', responseTime: -1, lastCheck: this.checkFirebaseAvailable() ? Timestamp.now() : new Date() as any, uptime: 0, errorCount: 1 },
          authentication: { status: 'outage', responseTime: -1, lastCheck: this.checkFirebaseAvailable() ? Timestamp.now() : new Date() as any, uptime: 0, errorCount: 1 }
        },
        metrics: {
          responseTime: Date.now() - startTime,
          uptime: 0,
          errorRate: 1,
          activeUsers: 0,
          totalProjects: 0
        },
        issues: [{
          id: `error_${Date.now()}`,
          severity: 'critical',
          service: 'system',
          message: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: this.checkFirebaseAvailable() ? Timestamp.now() : new Date() as any,
          resolved: false
        }]
      };

      await this.saveHealthData(errorHealthData);
      return errorHealthData;
    }
  }

  // **VERIFICAÇÕES DE SERVIÇOS**

  private static async checkFirebaseHealth(): Promise<ServiceStatus> {
    const startTime = Date.now();
    console.log('🔧 DEBUG: Verificando saúde do Firebase...');
    
    try {
      if (!this.checkFirebaseAvailable()) {
        console.log('🔧 DEBUG: Firebase não configurado - retornando status degraded');
        return {
          status: 'degraded',
          responseTime: Date.now() - startTime,
          lastCheck: new Date() as any,
          uptime: 0,
          errorCount: 0,
          message: 'Firebase não configurado - modo offline'
        };
      }

      // Testar conectividade básica com Firestore
      const testDoc = doc(db, 'health_check', 'test');
      await getDoc(testDoc);
      
      const responseTime = Date.now() - startTime;
      console.log('✅ DEBUG: Firebase health check passou');
      
      return {
        status: responseTime < this.RESPONSE_TIME_THRESHOLD ? 'operational' : 'degraded',
        responseTime,
        lastCheck: Timestamp.now(),
        uptime: 99.9,
        errorCount: 0
      };
    } catch (error) {
      console.error('❌ DEBUG: Erro no Firebase health check:', error);
      return {
        status: 'outage',
        responseTime: Date.now() - startTime,
        lastCheck: new Date() as any,
        uptime: 0,
        errorCount: 1,
        message: error instanceof Error ? error.message : 'Firebase connection failed'
      };
    }
  }

    private static async checkGeminiHealth(): Promise<ServiceStatus> {
    const startTime = Date.now();
    console.log('🔧 DEBUG: Verificando saúde do Gemini...');
    
    try {
      // Não fazer chamada para /api/health/gemini que não existe
      // Em vez disso, verificar se GeminiService está configurado
      const { geminiService } = await import('../services/geminiService');
      const isConfigured = geminiService.isConfigured();
      
      const responseTime = Date.now() - startTime;
      console.log('🔧 DEBUG: Gemini configurado:', isConfigured);

      return {
        status: isConfigured ? 'operational' : 'degraded',
        responseTime,
        lastCheck: this.checkFirebaseAvailable() ? Timestamp.now() : new Date() as any,
        uptime: isConfigured ? 99.5 : 50,
        errorCount: isConfigured ? 0 : 1,
        message: isConfigured ? 'Gemini API configurado' : 'Gemini API não configurado'
      };
    } catch (error) {
      console.error('❌ DEBUG: Erro no Gemini health check:', error);
      return {
        status: 'outage',
        responseTime: Date.now() - startTime,
        lastCheck: this.checkFirebaseAvailable() ? Timestamp.now() : new Date() as any,
        uptime: 0,
        errorCount: 1,
        message: error instanceof Error ? error.message : 'Gemini API unreachable'
      };
    }
  }

  private static async checkPWAHealth(): Promise<ServiceStatus> {
    const startTime = Date.now();
    try {
      // Verificar recursos PWA
      const checks = await Promise.all([
        this.checkServiceWorker(),
        this.checkManifest(),
        this.checkOfflineCapability()
      ]);

      const responseTime = Date.now() - startTime;
      const allPassed = checks.every(check => check);

          return {
        status: allPassed ? 'operational' : 'degraded',
        responseTime,
        lastCheck: Timestamp.now(),
        uptime: allPassed ? 99.8 : 90,
        errorCount: checks.filter(check => !check).length,
        message: allPassed ? undefined : 'Some PWA features not working'
      };
    } catch (error) {
          return {
        status: 'outage',
        responseTime: Date.now() - startTime,
        lastCheck: Timestamp.now(),
        uptime: 0,
        errorCount: 1,
        message: error instanceof Error ? error.message : 'PWA check failed'
      };
    }
  }

  private static async checkAuthenticationHealth(): Promise<ServiceStatus> {
    const startTime = Date.now();
    console.log('🔧 DEBUG: Verificando saúde do Authentication...');
    
    try {
      if (!this.checkFirebaseAvailable()) {
        console.log('🔧 DEBUG: Firebase não configurado - authentication degraded');
        return {
          status: 'degraded',
          responseTime: Date.now() - startTime,
          lastCheck: this.checkFirebaseAvailable() ? Timestamp.now() : new Date() as any,
          uptime: 0,
          errorCount: 0,
          message: 'Firebase Authentication não configurado - modo offline'
        };
      }

      // Verificar se Firebase Auth está funcionando
      const { auth } = await import('../firebaseConfig');
      
      if (!auth) {
        console.log('🔧 DEBUG: Auth object é null');
        return {
          status: 'degraded',
          responseTime: Date.now() - startTime,
          lastCheck: Timestamp.now(),
          uptime: 0,
          errorCount: 1,
          message: 'Firebase Auth não inicializado'
        };
      }

      const user = auth.currentUser;
      const responseTime = Date.now() - startTime;
      console.log('✅ DEBUG: Authentication health check passou');

      return {
        status: 'operational',
        responseTime,
        lastCheck: Timestamp.now(),
        uptime: 99.9,
        errorCount: 0,
        message: user ? 'Usuário autenticado' : 'Authentication disponível'
      };
    } catch (error) {
      console.error('❌ DEBUG: Erro no Authentication health check:', error);
      return {
        status: 'outage',
        responseTime: Date.now() - startTime,
        lastCheck: this.checkFirebaseAvailable() ? Timestamp.now() : new Date() as any,
        uptime: 0,
        errorCount: 1,
        message: error instanceof Error ? error.message : 'Authentication service failed'
      };
    }
  }

  // **MÉTRICAS E ANÁLISES**

    private static async getSystemMetrics(): Promise<{
    errorRate: number;
    activeUsers: number;
    totalProjects: number;
  }> {
    console.log('🔧 DEBUG: Obtendo métricas do sistema...');
    
    try {
      if (!this.checkFirebaseAvailable()) {
        console.log('🔧 DEBUG: Firebase não disponível - usando métricas mock');
        return {
          errorRate: 0.01, // 1% de erro simulado
          activeUsers: 1, // Usuário atual
          totalProjects: 0
        };
      }

      // Buscar métricas recentes (última hora)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      const [errorsSnapshot, usersSnapshot, projectsSnapshot] = await Promise.all([
        getDocs(query(
          collection(db, 'system_errors'),
          where('timestamp', '>=', Timestamp.fromDate(oneHourAgo))
        )),
        getDocs(query(
          collection(db, 'user_analytics'),
          where('lastActive', '>=', Timestamp.fromDate(oneHourAgo))
        )),
        getDocs(collection(db, 'scripts'))
      ]);

      const totalRequests = 1000; // Seria obtido de logs reais
      const errorRate = errorsSnapshot.size / totalRequests;
      const activeUsers = usersSnapshot.size;
      const totalProjects = projectsSnapshot.size;

      console.log('✅ DEBUG: Métricas obtidas do Firebase');
      return {
        errorRate,
        activeUsers,
        totalProjects
      };
    } catch (error) {
      console.error('❌ DEBUG: Erro ao obter métricas:', error);
      return {
        errorRate: 1,
        activeUsers: 0,
        totalProjects: 0
      };
    }
  }

  private static calculateUptime(): number {
    // Calcular uptime baseado em dados históricos
    // Por enquanto, retorna valor mock
    return 99.5;
  }

  private static determineOverallStatus(services: SystemHealth['services']): SystemHealth['status'] {
    const statuses = Object.values(services).map(service => service.status);
    
    if (statuses.includes('outage')) {
      return 'unhealthy';
    } else if (statuses.includes('degraded')) {
      return 'degraded';
    } else {
      return 'healthy';
    }
  }

  private static async detectIssues(
    services: SystemHealth['services'],
    metrics: any
  ): Promise<SystemIssue[]> {
    const issues: SystemIssue[] = [];

    // Verificar problemas de performance
    Object.entries(services).forEach(([serviceName, service]) => {
      if (service.status === 'outage') {
        issues.push({
          id: `${serviceName}_outage_${Date.now()}`,
          severity: 'critical',
          service: serviceName,
          message: `${serviceName} está fora do ar: ${service.message || 'Motivo desconhecido'}`,
          timestamp: this.checkFirebaseAvailable() ? Timestamp.now() : new Date() as any,
          resolved: false
        });
      } else if (service.status === 'degraded') {
        issues.push({
          id: `${serviceName}_degraded_${Date.now()}`,
          severity: 'medium',
          service: serviceName,
          message: `${serviceName} com performance degradada: ${service.responseTime}ms`,
          timestamp: this.checkFirebaseAvailable() ? Timestamp.now() : new Date() as any,
          resolved: false
        });
      }
    });

    // Verificar taxa de erro alta
    if (metrics.errorRate > this.ERROR_THRESHOLD) {
      issues.push({
        id: `high_error_rate_${Date.now()}`,
        severity: 'high',
        service: 'system',
        message: `Taxa de erro alta: ${(metrics.errorRate * 100).toFixed(2)}%`,
        timestamp: this.checkFirebaseAvailable() ? Timestamp.now() : new Date() as any,
        resolved: false
      });
    }

    return issues;
  }

  // **PERSISTÊNCIA E HISTÓRICO**

  private static async saveHealthData(healthData: SystemHealth): Promise<void> {
    console.log('🔧 DEBUG: Salvando dados de saúde...');
    
    try {
      if (this.checkFirebaseAvailable()) {
        console.log('🔧 DEBUG: Salvando no Firebase...');
        const healthDoc = doc(db, 'system_health', `check_${Date.now()}`);
        await setDoc(healthDoc, healthData);
        await this.cleanupOldHealthData();
        console.log('✅ DEBUG: Dados salvos no Firebase');
      } else {
        console.log('🔧 DEBUG: Firebase não disponível - salvando em cache local');
        this.healthCache = healthData;
        console.log('✅ DEBUG: Dados salvos em cache local');
      }
    } catch (error) {
      console.error('❌ DEBUG: Erro ao salvar dados de saúde:', error);
      // Fallback para cache local mesmo se Firebase falhar
      this.healthCache = healthData;
    }
  }

  private static async cleanupOldHealthData(): Promise<void> {
    try {
      const oldRecords = await getDocs(query(
        collection(db, 'system_health'),
        orderBy('timestamp', 'desc'),
        limit(1000)
      ));

      // Em uma implementação real, deletaria registros além do limite
      if (oldRecords.size > 1000) {
        // Implementar limpeza
      }
    } catch (error) {
      console.error('Erro na limpeza de dados antigos:', error);
    }
  }

  // **NOTIFICAÇÕES E ALERTAS**

  static async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('📱 Notificações não suportadas neste navegador');
      return false;
    }

    if (Notification.permission === 'granted') {
      console.log('✅ Permissão para notificações já concedida');
      return true;
    }

    if (Notification.permission === 'denied') {
      console.log('❌ Permissão para notificações negada pelo usuário');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('✅ Permissão para notificações concedida');
        return true;
      } else {
        console.log('❌ Permissão para notificações negada');
        return false;
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão para notificações:', error);
      return false;
    }
  }

  private static async notifyHealthIssues(healthData: SystemHealth): Promise<void> {
    if (healthData.issues.length === 0) return;

    const criticalIssues = healthData.issues.filter(issue => issue.severity === 'critical');
    
    if (criticalIssues.length > 0) {
      console.error('🚨 PROBLEMAS CRÍTICOS DETECTADOS:');
      criticalIssues.forEach(issue => {
        console.error(`- ${issue.service}: ${issue.message}`);
      });

      // Mostrar notificação se autorizado
      if (Notification.permission === 'granted') {
        try {
          new Notification('🚨 Roteirizar IA - Problema Crítico', {
            body: `${criticalIssues.length} problema(s) crítico(s) detectado(s)`,
            icon: '/icons/icon-192x192.png',
            tag: 'health-critical'
          });
        } catch (error) {
          console.error('Erro ao mostrar notificação:', error);
        }
      }

      // Em produção, enviaria notificações por email/Slack
      // await this.sendCriticalAlert(criticalIssues);
    }
  }

  // **VERIFICAÇÕES PWA ESPECÍFICAS**

  private static async checkServiceWorker(): Promise<boolean> {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        return registration ? registration.active !== null : false;
      }
      return false;
    } catch {
      return false;
    }
  }

  private static async checkManifest(): Promise<boolean> {
    try {
      const response = await fetch('/manifest.json');
      return response.ok;
    } catch {
      return false;
    }
  }

  private static async checkOfflineCapability(): Promise<boolean> {
    try {
      // Verificar se cache está funcionando
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        return cacheNames.length > 0;
      }
      return false;
    } catch {
      return false;
    }
  }

  // **API PÚBLICA**

  static async getCurrentHealth(): Promise<SystemHealth | null> {
    try {
      if (this.checkFirebaseAvailable()) {
        const latestHealth = await getDocs(query(
          collection(db, 'system_health'),
          orderBy('timestamp', 'desc'),
          limit(1)
        ));

        if (!latestHealth.empty) {
          const data = latestHealth.docs[0].data() as SystemHealth;
          return data;
        } else {
          return await this.performHealthCheck();
        }
      } else {
        return this.healthCache || await this.performHealthCheck();
      }
    } catch (error) {
      console.error('Erro ao obter saúde atual:', error);
      return this.healthCache;
    }
  }

  static async getHealthHistory(hours: number = 24): Promise<SystemHealth[]> {
    try {
      const hoursAgo = new Date(Date.now() - hours * 60 * 60 * 1000);
      
      const healthSnapshot = await getDocs(query(
        collection(db, 'system_health'),
        where('timestamp', '>=', Timestamp.fromDate(hoursAgo)),
        orderBy('timestamp', 'desc')
      ));

      return healthSnapshot.docs.map(doc => doc.data() as SystemHealth);
    } catch (error) {
      console.error('Erro ao obter histórico de saúde:', error);
      return [];
    }
  }

  static async getSystemUptime(days: number = 30): Promise<number> {
    try {
      const history = await this.getHealthHistory(days * 24);
      if (history.length === 0) return 100;

      const healthyChecks = history.filter(h => h.status === 'healthy').length;
      return (healthyChecks / history.length) * 100;
    } catch (error) {
      console.error('Erro ao calcular uptime:', error);
      return 0;
    }
  }

  static async getPerformanceMetrics(): Promise<PerformanceMetrics[]> {
    try {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      const metricsSnapshot = await getDocs(query(
        collection(db, 'performance_metrics'),
        where('timestamp', '>=', Timestamp.fromDate(oneWeekAgo)),
        orderBy('timestamp', 'desc')
      ));

      return metricsSnapshot.docs.map(doc => doc.data() as PerformanceMetrics);
    } catch (error) {
      console.error('Erro ao obter métricas de performance:', error);
      return [];
    }
  }

  // **MANUTENÇÃO**

  static async scheduleMaintenanceWindow(maintenance: Omit<MaintenanceWindow, 'id'>): Promise<string> {
    try {
      const maintenanceId = `maintenance_${Date.now()}`;
      const maintenanceDoc = doc(db, 'maintenance_windows', maintenanceId);
      
      await setDoc(maintenanceDoc, {
        ...maintenance,
        id: maintenanceId
      });

      return maintenanceId;
    } catch (error) {
      console.error('Erro ao agendar janela de manutenção:', error);
      throw error;
    }
  }

  static async getUpcomingMaintenance(): Promise<MaintenanceWindow[]> {
    try {
      const now = Timestamp.now();
      
      const maintenanceSnapshot = await getDocs(query(
        collection(db, 'maintenance_windows'),
        where('startTime', '>', now),
        where('status', '==', 'scheduled'),
        orderBy('startTime')
      ));

      return maintenanceSnapshot.docs.map(doc => doc.data() as MaintenanceWindow);
    } catch (error) {
      console.error('Erro ao obter manutenções programadas:', error);
      return [];
    }
  }

  // **MÉTODOS AUSENTES ADICIONADOS PARA CORRIGIR SISTEMA DASHBOARD**

  static async getHealth(): Promise<any> {
    try {
      const currentHealth = await this.getCurrentHealth();
      if (currentHealth) {
        // Transformar para formato esperado pelo SystemDashboard
        return {
          overall: currentHealth.status === 'healthy' ? 'healthy' : 
                   currentHealth.status === 'degraded' ? 'degraded' : 'down',
          score: this.calculateHealthScore(currentHealth),
          checks: this.transformServicesToChecks(currentHealth.services),
          lastCheck: currentHealth.timestamp instanceof Date ? 
                     currentHealth.timestamp.toISOString() : 
                     currentHealth.timestamp.toDate().toISOString(),
          uptime: currentHealth.metrics.uptime
        };
      } else {
        const newHealth = await this.performHealthCheck();
        return {
          overall: newHealth.status === 'healthy' ? 'healthy' : 
                   newHealth.status === 'degraded' ? 'degraded' : 'down',
          score: this.calculateHealthScore(newHealth),
          checks: this.transformServicesToChecks(newHealth.services),
          lastCheck: newHealth.timestamp instanceof Date ? 
                     newHealth.timestamp.toISOString() : 
                     newHealth.timestamp.toDate().toISOString(),
          uptime: newHealth.metrics.uptime
        };
      }
    } catch (error) {
      console.error('Erro em getHealth():', error);
      return {
        overall: 'down',
        score: 0,
        checks: {},
        lastCheck: new Date().toISOString(),
        uptime: 0
      };
    }
  }

  static getAlerts(): any[] {
    return this.alertsCache;
  }

  static clearAlerts(): void {
    this.alertsCache = [];
  }

  // Métodos auxiliares para conversão de dados
  private static calculateHealthScore(healthData: SystemHealth): number {
    const services = Object.values(healthData.services);
    const operationalCount = services.filter(s => s.status === 'operational').length;
    return Math.round((operationalCount / services.length) * 100);
  }

  private static transformServicesToChecks(services: SystemHealth['services']): Record<string, any> {
    const checks: Record<string, any> = {};
    
    Object.entries(services).forEach(([serviceName, service]) => {
      checks[serviceName] = {
        status: service.status === 'operational' ? 'healthy' : 
                service.status === 'degraded' ? 'warning' : 'critical',
        message: service.message || `${serviceName} status: ${service.status}`,
        responseTime: service.responseTime,
        timestamp: service.lastCheck instanceof Date ? 
                   service.lastCheck.toISOString() : 
                   service.lastCheck.toDate().toISOString()
      };
    });

    return checks;
  }
}

// Singleton global - Exportar a classe, não uma instância
export const healthCheckService = HealthCheckService;

// Exposer globalmente para debugging
if (typeof window !== 'undefined') {
  (window as any).healthCheck = HealthCheckService;
} 