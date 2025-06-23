# 📊 Sistema de Monitoramento - Roteirar-ia

> Monitoramento completo de aplicação, performance, erros e métricas de negócio

## 📋 **Visão Geral**

O sistema de monitoramento do Roteirar-ia oferece visibilidade completa sobre:
- **Saúde da aplicação** (uptime, performance)
- **Experiência do usuário** (jornadas, conversões)
- **Erros e falhas** (tracking, alertas)
- **Métricas de negócio** (uso da IA, retenção)

---

## 🎯 **Métricas Principais**

### **SLIs/SLOs (Service Level Indicators/Objectives)**
```typescript
interface SLOs {
  availability: {
    target: 99.9;        // 99.9% uptime
    measurement: "monthly";
    alertThreshold: 99.5;
  };
  
  performance: {
    pageLoad: {
      target: 3000;      // <3s page load
      p95: 2000;         // 95% < 2s
    };
    scriptGeneration: {
      target: 10000;     // <10s generation
      p95: 7000;         // 95% < 7s
    };
  };
  
  errorRate: {
    target: 1;           // <1% error rate
    critical: 5;         // Alert at 5%
  };
  
  userSatisfaction: {
    conversionRate: 80;  // 80% form→script
    successRate: 95;     // 95% successful generations
  };
}
```

---

## 🔧 **Stack de Monitoramento**

### **Frontend Monitoring**
```typescript
// Real User Monitoring (RUM)
interface FrontendMetrics {
  performance: {
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    cumulativeLayoutShift: number;
    firstInputDelay: number;
    timeToInteractive: number;
  };
  
  userJourney: {
    pageViews: number;
    sessionDuration: number;
    bounceRate: number;
    conversionFunnel: ConversionSteps[];
  };
  
  errors: {
    jsErrors: ErrorEvent[];
    networkErrors: NetworkError[];
    consoleErrors: ConsoleError[];
  };
}

// Implementação com Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

export class PerformanceMonitor {
  private metrics: Record<string, number> = {};
  
  init() {
    getCLS((metric) => this.sendMetric('CLS', metric.value));
    getFID((metric) => this.sendMetric('FID', metric.value));
    getFCP((metric) => this.sendMetric('FCP', metric.value));
    getLCP((metric) => this.sendMetric('LCP', metric.value));
    getTTFB((metric) => this.sendMetric('TTFB', metric.value));
  }
  
  private sendMetric(name: string, value: number) {
    // Send to analytics service
    if (window.gtag) {
      window.gtag('event', 'web_vital', {
        event_category: 'performance',
        event_label: name,
        value: Math.round(value)
      });
    }
    
    // Store locally for debugging
    this.metrics[name] = value;
    console.log(`📊 ${name}: ${value}`);
  }
}
```

### **Error Tracking (Sentry)**
```typescript
// Configuração avançada do Sentry
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.NODE_ENV,
  
  integrations: [
    new Sentry.BrowserTracing({
      tracingOrigins: ["localhost", /^https:\/\/roteirar-ia\.com/],
    }),
    new Sentry.Replay({
      // Capture 10% of all sessions
      sessionSampleRate: 0.1,
      // Capture 100% of sessions with an error
      errorSampleRate: 1.0,
    }),
  ],
  
  tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  beforeSend(event, hint) {
    // Filter out noise
    if (event.exception?.values?.[0]?.type === 'ChunkLoadError') {
      return null; // Ignore chunk load errors
    }
    
    // Add user context
    event.user = {
      id: getCurrentUserId(),
      timestamp: new Date().toISOString()
    };
    
    return event;
  }
});

// Custom error boundary
export class ErrorBoundary extends Sentry.ErrorBoundary {
  fallback = ({ error, resetError }) => (
    <div className="error-boundary">
      <h2>Oops! Algo deu errado</h2>
      <p>{error.message}</p>
      <button onClick={resetError}>Tentar novamente</button>
    </div>
  );
}
```

---

## 📈 **Analytics & Business Metrics**

### **Google Analytics 4 Setup**
```typescript
// Enhanced analytics tracking
class AnalyticsService {
  private gtag: any;
  
  constructor() {
    this.gtag = window.gtag;
  }
  
  // User journey tracking
  trackPageView(page: string) {
    this.gtag('config', 'G-XXXXXXXXXX', {
      page_title: document.title,
      page_location: page
    });
  }
  
  // Script generation events
  trackScriptGeneration(data: {
    platform: string;
    duration: number;
    tone: string;
    success: boolean;
    generationTime: number;
  }) {
    this.gtag('event', 'generate_script', {
      event_category: 'ai_interaction',
      platform: data.platform,
      duration: data.duration,
      tone: data.tone,
      success: data.success,
      generation_time: data.generationTime,
      value: data.success ? 1 : 0
    });
  }
  
  // Conversion funnel
  trackFunnelStep(step: 'view_form' | 'enter_subject' | 'click_generate' | 'script_generated' | 'script_copied') {
    this.gtag('event', step, {
      event_category: 'conversion_funnel',
      timestamp: new Date().toISOString()
    });
  }
  
  // User engagement
  trackEngagement(action: string, category: string, value?: number) {
    this.gtag('event', action, {
      event_category: category,
      value: value
    });
  }
  
  // Performance tracking
  trackPerformance(metric: string, value: number, unit: string) {
    this.gtag('event', 'performance_metric', {
      event_category: 'performance',
      metric_name: metric,
      metric_value: value,
      metric_unit: unit
    });
  }
}
```

### **Custom Business Metrics**
```typescript
// Business intelligence tracking
interface BusinessMetrics {
  daily: {
    uniqueUsers: number;
    scriptsGenerated: number;
    successRate: number;
    avgGenerationTime: number;
    platformDistribution: Record<string, number>;
  };
  
  weekly: {
    userRetention: number;
    featureAdoption: Record<string, number>;
    errorTrends: number[];
    performanceTrends: number[];
  };
  
  monthly: {
    monthlyActiveUsers: number;
    churnRate: number;
    avgSessionsPerUser: number;
    topUseCases: string[];
  };
}

class BusinessMetricsService {
  async collectDailyMetrics(): Promise<BusinessMetrics['daily']> {
    const today = new Date().toISOString().split('T')[0];
    
    return {
      uniqueUsers: await this.getUniqueUsers(today),
      scriptsGenerated: await this.getScriptsCount(today),
      successRate: await this.getSuccessRate(today),
      avgGenerationTime: await this.getAvgGenerationTime(today),
      platformDistribution: await this.getPlatformDistribution(today)
    };
  }
  
  private async getUniqueUsers(date: string): Promise<number> {
    // Implementation to count unique users
    // Could use Firebase Analytics or custom tracking
    return 0;
  }
  
  // Additional metric collection methods...
}
```

---

## 🚨 **Sistema de Alertas**

### **Alert Configuration**
```typescript
interface AlertConfig {
  name: string;
  condition: string;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  channels: ('email' | 'slack' | 'sms')[];
  runbook?: string;
}

const ALERTS: AlertConfig[] = [
  {
    name: 'High Error Rate',
    condition: 'error_rate > 5%',
    threshold: 5,
    severity: 'critical',
    channels: ['slack', 'email'],
    runbook: 'docs/operations/troubleshooting.md#high-error-rate'
  },
  
  {
    name: 'Slow API Response',
    condition: 'gemini_api_response_time > 15s',
    threshold: 15000,
    severity: 'high',
    channels: ['slack'],
    runbook: 'docs/operations/troubleshooting.md#slow-api'
  },
  
  {
    name: 'Low Success Rate',
    condition: 'script_generation_success_rate < 90%',
    threshold: 90,
    severity: 'medium',
    channels: ['slack']
  },
  
  {
    name: 'High Memory Usage',
    condition: 'memory_usage > 80%',
    threshold: 80,
    severity: 'medium',
    channels: ['email']
  }
];
```

### **Alert Implementation**
```typescript
class AlertingService {
  private alerts: AlertConfig[] = ALERTS;
  private lastAlertTimes: Map<string, number> = new Map();
  
  checkAlerts(metrics: Record<string, number>) {
    for (const alert of this.alerts) {
      if (this.shouldTriggerAlert(alert, metrics)) {
        this.sendAlert(alert, metrics);
      }
    }
  }
  
  private shouldTriggerAlert(alert: AlertConfig, metrics: Record<string, number>): boolean {
    const lastAlert = this.lastAlertTimes.get(alert.name) || 0;
    const cooldown = 5 * 60 * 1000; // 5 minutes
    
    if (Date.now() - lastAlert < cooldown) {
      return false; // Still in cooldown
    }
    
    // Parse condition and check threshold
    return this.evaluateCondition(alert.condition, metrics, alert.threshold);
  }
  
  private async sendAlert(alert: AlertConfig, metrics: Record<string, number>) {
    this.lastAlertTimes.set(alert.name, Date.now());
    
    const message = this.formatAlertMessage(alert, metrics);
    
    for (const channel of alert.channels) {
      switch (channel) {
        case 'slack':
          await this.sendSlackAlert(message);
          break;
        case 'email':
          await this.sendEmailAlert(message);
          break;
      }
    }
  }
  
  private formatAlertMessage(alert: AlertConfig, metrics: Record<string, number>): string {
    return `
🚨 **${alert.severity.toUpperCase()}**: ${alert.name}

**Condition**: ${alert.condition}
**Current Values**: ${JSON.stringify(metrics, null, 2)}
**Time**: ${new Date().toISOString()}

${alert.runbook ? `**Runbook**: ${alert.runbook}` : ''}
    `.trim();
  }
  
  private async sendSlackAlert(message: string) {
    if (!import.meta.env.VITE_SLACK_WEBHOOK) return;
    
    await fetch(import.meta.env.VITE_SLACK_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: message,
        channel: '#alerts',
        username: 'Roteirar-ia Monitor'
      })
    });
  }
}
```

---

## 📊 **Dashboards**

### **Real-time Dashboard (React Component)**
```typescript
// MonitoringDashboard.tsx
export const MonitoringDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<LiveMetrics | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  
  useEffect(() => {
    const interval = setInterval(async () => {
      const newMetrics = await fetchLiveMetrics();
      setMetrics(newMetrics);
      
      const activeAlerts = await fetchActiveAlerts();
      setAlerts(activeAlerts);
    }, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  if (!metrics) return <LoadingSpinner />;
  
  return (
    <div className="monitoring-dashboard">
      <div className="header">
        <h1>Roteirar-ia Monitoring</h1>
        <div className="status">
          <StatusIndicator status={metrics.overall.status} />
          <span>Last updated: {new Date(metrics.timestamp).toLocaleTimeString()}</span>
        </div>
      </div>
      
      <div className="alerts-section">
        {alerts.length > 0 && (
          <AlertsList alerts={alerts} />
        )}
      </div>
      
      <div className="metrics-grid">
        <MetricCard
          title="Availability"
          value={`${metrics.availability}%`}
          trend={metrics.availabilityTrend}
          target={99.9}
        />
        
        <MetricCard
          title="Response Time"
          value={`${metrics.responseTime}ms`}
          trend={metrics.responseTimeTrend}
          target={3000}
        />
        
        <MetricCard
          title="Error Rate"
          value={`${metrics.errorRate}%`}
          trend={metrics.errorRateTrend}
          target={1}
          inverted
        />
        
        <MetricCard
          title="Scripts Generated"
          value={metrics.scriptsToday}
          trend={metrics.scriptsTrend}
        />
      </div>
      
      <div className="charts-section">
        <div className="chart">
          <h3>Response Time (24h)</h3>
          <TimeSeriesChart data={metrics.responseTimeHistory} />
        </div>
        
        <div className="chart">
          <h3>Error Rate (24h)</h3>
          <TimeSeriesChart data={metrics.errorRateHistory} />
        </div>
        
        <div className="chart">
          <h3>Script Generation Volume</h3>
          <BarChart data={metrics.scriptVolumeByHour} />
        </div>
        
        <div className="chart">
          <h3>Platform Distribution</h3>
          <PieChart data={metrics.platformDistribution} />
        </div>
      </div>
    </div>
  );
};
```

### **Health Check Endpoint**
```typescript
// Health check with detailed status
export async function healthCheck(): Promise<HealthCheckResponse> {
  const startTime = Date.now();
  
  const checks = await Promise.allSettled([
    checkGeminiAPI(),
    checkFirebaseConnection(),
    checkMemoryUsage(),
    checkDiskSpace(),
    checkNetworkLatency()
  ]);
  
  const responseTime = Date.now() - startTime;
  const allHealthy = checks.every(check => check.status === 'fulfilled');
  
  return {
    status: allHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    responseTime,
    version: import.meta.env.VITE_APP_VERSION,
    environment: import.meta.env.NODE_ENV,
    checks: {
      gemini: checks[0].status === 'fulfilled' ? 'healthy' : 'unhealthy',
      firebase: checks[1].status === 'fulfilled' ? 'healthy' : 'unhealthy',
      memory: checks[2].status === 'fulfilled' ? 'healthy' : 'unhealthy',
      disk: checks[3].status === 'fulfilled' ? 'healthy' : 'unhealthy',
      network: checks[4].status === 'fulfilled' ? 'healthy' : 'unhealthy'
    },
    details: checks.map((check, index) => ({
      name: ['gemini', 'firebase', 'memory', 'disk', 'network'][index],
      status: check.status,
      message: check.status === 'rejected' ? check.reason.message : 'OK'
    }))
  };
}

// Individual health checks
async function checkGeminiAPI(): Promise<void> {
  const response = await fetch('/api/health/gemini');
  if (!response.ok) throw new Error('Gemini API unreachable');
}

async function checkFirebaseConnection(): Promise<void> {
  // Test Firestore connection
  const db = getFirestore();
  await getDocs(query(collection(db, '_health'), limit(1)));
}

async function checkMemoryUsage(): Promise<void> {
  if (performance.memory) {
    const usage = performance.memory.usedJSHeapSize / performance.memory.totalJSHeapSize;
    if (usage > 0.9) throw new Error('High memory usage');
  }
}
```

---

## 🔍 **Logging Strategy**

### **Structured Logging**
```typescript
// Centralized logging service
interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  category: string;
  userId?: string;
  sessionId: string;
  metadata?: Record<string, any>;
  stack?: string;
}

class Logger {
  private sessionId: string;
  private userId?: string;
  
  constructor() {
    this.sessionId = this.generateSessionId();
  }
  
  setUserId(userId: string) {
    this.userId = userId;
  }
  
  info(message: string, category: string, metadata?: Record<string, any>) {
    this.log('info', message, category, metadata);
  }
  
  warn(message: string, category: string, metadata?: Record<string, any>) {
    this.log('warn', message, category, metadata);
  }
  
  error(message: string, category: string, error?: Error, metadata?: Record<string, any>) {
    this.log('error', message, category, {
      ...metadata,
      stack: error?.stack
    });
  }
  
  private log(level: LogEntry['level'], message: string, category: string, metadata?: Record<string, any>) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      category,
      userId: this.userId,
      sessionId: this.sessionId,
      metadata
    };
    
    // Console logging (development)
    if (import.meta.env.DEV) {
      console[level === 'debug' ? 'log' : level](
        `[${level.toUpperCase()}] ${category}: ${message}`,
        metadata
      );
    }
    
    // Send to logging service (production)
    if (import.meta.env.PROD) {
      this.sendToLoggingService(entry);
    }
    
    // Store locally for debugging
    this.storeLocally(entry);
  }
  
  private async sendToLoggingService(entry: LogEntry) {
    // Send to external logging service
    // Could be Sentry, LogRocket, or custom endpoint
    
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
    } catch (error) {
      // Fallback to localStorage if service unavailable
      this.storeLocally(entry);
    }
  }
  
  private storeLocally(entry: LogEntry) {
    const logs = JSON.parse(localStorage.getItem('app_logs') || '[]');
    logs.push(entry);
    
    // Keep only last 100 logs
    if (logs.length > 100) {
      logs.splice(0, logs.length - 100);
    }
    
    localStorage.setItem('app_logs', JSON.stringify(logs));
  }
  
  private generateSessionId(): string {
    return 'session_' + Math.random().toString(36).substr(2, 9);
  }
}

// Usage examples
const logger = new Logger();

// Script generation tracking
logger.info('Script generation started', 'ai_interaction', {
  platform: 'youtube',
  subject: 'cooking tips',
  duration: 60
});

// Error tracking
logger.error('API request failed', 'api_error', new Error('Network timeout'), {
  endpoint: '/api/generate',
  retryCount: 3
});
```

---

## 📱 **Monitoring Tools Setup**

### **External Services Configuration**

#### **1. Google Analytics 4**
```javascript
// gtag configuration
gtag('config', 'G-XXXXXXXXXX', {
  // Enhanced ecommerce
  custom_map: {
    'custom_parameter_1': 'platform',
    'custom_parameter_2': 'generation_time'
  },
  
  // User engagement
  engagement_time_msec: 1000,
  
  // Debug mode (development only)
  debug_mode: import.meta.env.DEV
});
```

#### **2. Sentry Configuration**
```bash
# Environment variables
VITE_SENTRY_DSN=https://your-key@sentry.io/project-id
VITE_SENTRY_ENVIRONMENT=production
VITE_SENTRY_RELEASE=1.0.0
VITE_SENTRY_SAMPLE_RATE=0.1
```

#### **3. Uptime Monitoring (UptimeRobot)**
```yaml
# Endpoints to monitor
endpoints:
  - name: "Homepage"
    url: "https://roteirar-ia.com"
    interval: 5  # minutes
    
  - name: "Health Check"
    url: "https://roteirar-ia.com/health"
    interval: 1
    
  - name: "API Generation"
    url: "https://roteirar-ia.com/api/generate"
    method: "POST"
    interval: 10
    headers:
      Content-Type: "application/json"
    body: '{"test": true}'
```

---

## 🎯 **KPIs e Métricas de Sucesso**

### **Technical KPIs**
```typescript
interface TechnicalKPIs {
  performance: {
    pageLoadTime: { target: 3000, current: number };
    timeToFirstByte: { target: 800, current: number };
    cumulativeLayoutShift: { target: 0.1, current: number };
    firstInputDelay: { target: 100, current: number };
  };
  
  reliability: {
    uptime: { target: 99.9, current: number };
    errorRate: { target: 1, current: number };
    meanTimeToRecovery: { target: 300, current: number }; // seconds
  };
  
  scalability: {
    concurrentUsers: { target: 1000, current: number };
    requestsPerSecond: { target: 100, current: number };
    memoryUsage: { target: 70, current: number }; // percentage
  };
}
```

### **Business KPIs**
```typescript
interface BusinessKPIs {
  user_engagement: {
    dailyActiveUsers: number;
    sessionDuration: number;
    bounceRate: number;
    conversionRate: number;
  };
  
  ai_performance: {
    generationSuccessRate: number;
    averageGenerationTime: number;
    userSatisfactionScore: number;
    scriptsGeneratedPerDay: number;
  };
  
  growth: {
    newUsersPerDay: number;
    userRetentionRate: number;
    monthlyActiveUsers: number;
    featureAdoptionRate: Record<string, number>;
  };
}
```

---

## 🚀 **Next Steps Implementation**

### **Monitoring Roadmap**
```
FASE 1 (Implementação Imediata):
□ Configurar Google Analytics 4 completo
□ Implementar error tracking com Sentry
□ Criar health check endpoints
□ Setup uptime monitoring básico

FASE 2 (Próximas 2 semanas):
□ Dashboard de monitoramento customizado
□ Sistema de alertas automatizado
□ Logging estruturado implementado
□ Métricas de negócio coletadas

FASE 3 (Próximo mês):
□ Advanced analytics e insights
□ Predictive monitoring
□ Automated performance optimization
□ Custom KPI dashboards
```

---

**Documentação criada:** Janeiro 2025  
**Status:** ✅ SISTEMA COMPLETO DE MONITORAMENTO  
**Próxima revisão:** Mensal  
**Versão:** 1.0

---

## 📞 **Suporte de Monitoramento**

Para problemas de monitoramento:
1. Verificar dashboards primeiro
2. Consultar [troubleshooting](troubleshooting.md)
3. Verificar logs de sistema
4. Escalar para DevOps via GitHub Issues 