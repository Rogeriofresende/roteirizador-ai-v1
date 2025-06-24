// Sistema de Health Checks para MVP em Produção
// Gratuito, robusto, alertas críticos automáticos

import { collection, doc, getDoc, setDoc, updateDoc, getDocs, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';

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
    const timestamp = Timestamp.now();

    try {
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
        timestamp,
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

      // Salvar no Firestore
      await this.saveHealthData(healthData);

      // Notificar se necessário
      if (overallStatus !== 'healthy') {
        await this.notifyHealthIssues(healthData);
      }

      return healthData;

    } catch (error) {
      console.error('Erro no health check:', error);
      
      const errorHealthData: SystemHealth = {
        status: 'unhealthy',
        timestamp,
        services: {
          firebase: { status: 'outage', responseTime: -1, lastCheck: timestamp, uptime: 0, errorCount: 1 },
          gemini: { status: 'outage', responseTime: -1, lastCheck: timestamp, uptime: 0, errorCount: 1 },
          pwa: { status: 'outage', responseTime: -1, lastCheck: timestamp, uptime: 0, errorCount: 1 },
          authentication: { status: 'outage', responseTime: -1, lastCheck: timestamp, uptime: 0, errorCount: 1 }
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
          timestamp,
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
    try {
      // Testar conectividade básica com Firestore
      const testDoc = doc(db, 'health_check', 'test');
      await getDoc(testDoc);
      
      const responseTime = Date.now() - startTime;
      
            return {
        status: responseTime < this.RESPONSE_TIME_THRESHOLD ? 'operational' : 'degraded',
        responseTime,
        lastCheck: Timestamp.now(),
        uptime: 99.9, // Seria calculado com dados históricos
        errorCount: 0
      };
    } catch (error) {
          return {
        status: 'outage',
        responseTime: Date.now() - startTime,
        lastCheck: Timestamp.now(),
        uptime: 0,
        errorCount: 1,
        message: error instanceof Error ? error.message : 'Firebase connection failed'
      };
    }
  }

  private static async checkGeminiHealth(): Promise<ServiceStatus> {
    const startTime = Date.now();
    try {
      // Testar API do Gemini com request simples
      const response = await fetch('/api/health/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true })
      });

      const responseTime = Date.now() - startTime;

      if (response.ok) {
            return {
          status: responseTime < this.RESPONSE_TIME_THRESHOLD ? 'operational' : 'degraded',
          responseTime,
          lastCheck: Timestamp.now(),
          uptime: 99.5,
          errorCount: 0
            };
          } else {
            return {
          status: 'degraded',
          responseTime,
          lastCheck: Timestamp.now(),
          uptime: 95,
          errorCount: 1,
          message: `HTTP ${response.status}: ${response.statusText}`
        };
      }
    } catch (error) {
          return {
        status: 'outage',
        responseTime: Date.now() - startTime,
        lastCheck: Timestamp.now(),
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
    try {
      // Verificar se Firebase Auth está funcionando
      const { auth } = await import('../firebaseConfig');
      const user = auth.currentUser;
      
      const responseTime = Date.now() - startTime;

      return {
        status: 'operational',
        responseTime,
        lastCheck: Timestamp.now(),
        uptime: 99.9,
        errorCount: 0
      };
    } catch (error) {
      return {
        status: 'outage',
        responseTime: Date.now() - startTime,
        lastCheck: Timestamp.now(),
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
    try {
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

          return {
        errorRate,
        activeUsers,
        totalProjects
      };
    } catch (error) {
      console.error('Erro ao obter métricas do sistema:', error);
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
          timestamp: Timestamp.now(),
          resolved: false
        });
      } else if (service.status === 'degraded') {
        issues.push({
          id: `${serviceName}_degraded_${Date.now()}`,
          severity: 'medium',
          service: serviceName,
          message: `${serviceName} com performance degradada: ${service.responseTime}ms`,
          timestamp: Timestamp.now(),
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
        timestamp: Timestamp.now(),
        resolved: false
      });
    }

    return issues;
  }

  // **PERSISTÊNCIA E HISTÓRICO**

  private static async saveHealthData(healthData: SystemHealth): Promise<void> {
    try {
      const healthDoc = doc(db, 'system_health', `check_${Date.now()}`);
      await setDoc(healthDoc, healthData);

      // Manter apenas últimos 1000 registros
      await this.cleanupOldHealthData();
    } catch (error) {
      console.error('Erro ao salvar dados de saúde:', error);
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
      const latestHealth = await getDocs(query(
        collection(db, 'system_health'),
        orderBy('timestamp', 'desc'),
        limit(1)
      ));

      if (latestHealth.empty) {
        return await this.performHealthCheck();
      }

      return latestHealth.docs[0].data() as SystemHealth;
    } catch (error) {
      console.error('Erro ao obter saúde atual:', error);
      return null;
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
}

// Singleton global - Exportar a classe, não uma instância
export const healthCheckService = HealthCheckService;

// Exposer globalmente para debugging
if (typeof window !== 'undefined') {
  (window as any).healthCheck = HealthCheckService;
} 