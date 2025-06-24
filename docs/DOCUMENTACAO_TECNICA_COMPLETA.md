# 📚 **DOCUMENTAÇÃO TÉCNICA COMPLETA - SISTEMA DE MONITORAMENTO**

> **Versão:** 2.1.2 | **Data:** Janeiro 2025 | **Status:** Produção Ready ✅

---

## 🎯 **VISÃO GERAL DO PROJETO**

### **Sistema Implementado**
- **Aplicação**: SPA React + TypeScript
- **Infraestrutura**: Firebase (Auth + Firestore) + Google Gemini AI
- **Monitoramento**: Sistema completo de Health Checks + Analytics
- **Deploy**: Vercel (PWA Ready)
- **Custo**: R$ 0,00/mês (100% free tier)

### **Arquitetura Final**
```
Frontend (React/TS) ↔ Firebase ↔ Gemini AI
       ↓
Health Checks + Analytics (GA4)
       ↓
Dashboard + Alertas Automáticos
```

---

## 🏗️ **ARQUITETURA DE MONITORAMENTO**

### **1. Health Check Service** (`src/services/healthCheckService.ts`)

#### **Funcionalidades**
- ✅ **4 verificações automáticas**
- ✅ **Alertas críticos** com cooldown inteligente
- ✅ **Scoring system** (0-100%)
- ✅ **Notificações browser** para problemas sérios
- ✅ **Histórico de alertas** em localStorage

#### **Checks Implementados**
```typescript
interface HealthCheck {
  name: string;
  check: () => Promise<HealthResult>;
  critical: boolean;
  timeout: number;
}

// 1. GEMINI_API - Conectividade e API key
// 2. FIREBASE - Auth e Firestore
// 3. PERFORMANCE - Memória e carregamento
// 4. STORAGE - localStorage e PWA
```

#### **Configuração de Frequências**
```typescript
const HEALTH_CHECK_INTERVAL = 2 * 60 * 1000; // 2 minutos normal
const CRITICAL_CHECK_INTERVAL = 30 * 1000;   // 30s críticos
const ALERT_COOLDOWN = 5 * 60 * 1000;        // 5min cooldown
```

#### **Sistema de Scoring**
```typescript
// Peso dos checks
GEMINI_API: 40%    // Mais crítico
FIREBASE: 30%      // Essencial para auth
PERFORMANCE: 20%   // Importante para UX
STORAGE: 10%       // Menos crítico

// Status resultante
70-100%: HEALTHY
40-69%:  DEGRADED  
0-39%:   DOWN
```

### **2. Analytics Service** (`src/services/analyticsService.ts`)

#### **Integração Google Analytics 4**
```typescript
// Configuração
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

// Eventos trackados
- page_view: Navegação
- script_generation: Geração de roteiros
- feature_usage: Uso de funcionalidades
- error_tracking: Todos os erros JS
- conversion_funnel: Funil completo
```

#### **Web Vitals Automático**
```typescript
// Métricas coletadas automaticamente
- CLS (Cumulative Layout Shift)
- FID (First Input Delay)  
- LCP (Largest Contentful Paint)
- FCP (First Contentful Paint)
- TTFB (Time to First Byte)
```

#### **Business Metrics**
```typescript
interface BusinessMetrics {
  scripts_generated: number;
  conversion_rate: number;
  average_generation_time: number;
  error_rate: number;
  session_duration: number;
  feature_usage: Record<string, number>;
}
```

#### **Local Storage Backup**
```typescript
// Dados salvos localmente para redundância
roteirizar_analytics_session: SessionData
roteirizar_analytics_events: Event[]
roteirizar_analytics_metrics: BusinessMetrics
```

### **3. System Dashboard** (`src/components/SystemDashboard.tsx`)

#### **Interface Componentes**
```tsx
interface SystemDashboardProps {
  onClose: () => void;
}

// Seções do Dashboard
1. Status Geral (Score + Uptime)
2. Health Checks Individuais  
3. Analytics da Sessão
4. Alertas Recentes
5. Comandos de Debug
6. Actions (Export, Refresh, Links)
```

#### **Features Implementadas**
- ✅ **Auto-refresh** a cada 30 segundos
- ✅ **Export completo** em JSON
- ✅ **Clear de alertas** manual
- ✅ **Links diretos** para GA4
- ✅ **Status colorido** (verde/amarelo/vermelho)
- ✅ **Comandos debug** integrados

### **4. Navbar Integration** (`src/components/Navbar.tsx`)

#### **Status Indicator**
```tsx
// Indicador sempre visível
<button onClick={() => setShowDashboard(true)}>
  <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}>
    <div className="animate-pulse" />
  </div>
  <span>{getStatusText()}</span>
</button>

// Atalho de teclado
Ctrl + Shift + D = Abre dashboard
```

#### **Status Colors**
```typescript
healthy: 'bg-green-500'   // Sistema OK
degraded: 'bg-yellow-500' // Atenção  
down: 'bg-red-500'        // Problema
```

---

## 🔗 **INTEGRAÇÕES IMPLEMENTADAS**

### **1. Gemini Service Integration** (`src/services/geminiService.ts`)

#### **Analytics em Todas as Calls**
```typescript
// Antes de cada geração
analyticsService.trackConversionFunnel('form_complete', params);

// Sucesso
analyticsService.trackScriptGeneration({
  platform, subject, duration, tone, audience,
  success: true,
  generation_time: number,
  script_length: number
});

// Erro  
analyticsService.trackError('Script Generation Failed', {
  error: error.message,
  platform: params.platform
});
```

#### **Error Tracking Melhorado**
```typescript
// Erros específicos com contexto
if (error.message?.includes('API_KEY_INVALID')) {
  throw new Error('API key inválida. Verifique sua chave do Google AI Studio.');
}
if (error.message?.includes('QUOTA_EXCEEDED')) {
  throw new Error('Limite de uso da API atingido. Tente novamente mais tarde.');
}
// ... outros erros específicos
```

### **2. App.tsx Auto-Initialization**

#### **Sistema de Startup**
```tsx
useEffect(() => {
  const initializeMonitoring = async () => {
    try {
      console.log('🚀 Inicializando sistema de monitoramento...');
      
      // 1. Health Checks
      await healthCheckService.initialize();
      
      // 2. Analytics  
      await analyticsService.initialize();
      
      // 3. Error Boundaries
      window.addEventListener('error', handleGlobalError);
      
      console.log('✅ Sistema de monitoramento inicializado');
    } catch (error) {
      console.error('❌ Erro na inicialização:', error);
    }
  };
  
  initializeMonitoring();
}, []);
```

---

## 📊 **ESTRUTURA DE DADOS**

### **Health Check Results**
```typescript
interface HealthResult {
  status: 'healthy' | 'warning' | 'critical';
  message: string;
  details?: any;
  timestamp: string;
  responseTime: number;
}

interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'down';
  score: number;
  checks: Record<string, HealthResult>;
  lastCheck: string;
  uptime: number;
}
```

### **Analytics Events**
```typescript
interface AnalyticsEvent {
  event_name: string;
  event_category: string;
  timestamp: string;
  session_id: string;
  user_id?: string;
  custom_parameters: Record<string, any>;
}

interface ConversionFunnel {
  step: 'page_view' | 'form_start' | 'form_complete' | 'script_generated';
  platform?: string;
  session_id: string;
  user_id?: string;
}
```

### **Business Metrics**
```typescript
interface BusinessMetrics {
  total_sessions: number;
  total_page_views: number;
  total_scripts_generated: number;
  conversion_rate: number;
  average_session_duration: number;
  error_rate: number;
  top_platforms: Array<{platform: string, count: number}>;
  performance_metrics: WebVitalsData;
}
```

---

## 🔧 **CONFIGURAÇÃO E SETUP**

### **1. Variáveis de Ambiente**
```bash
# .env.local (obrigatório)
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# .env.local (opcional)  
VITE_ALERT_WEBHOOK_URL=https://webhook.site/sua-url
VITE_DEBUG_MODE=true
```

### **2. Dependencies Adicionadas**
```json
{
  "dependencies": {
    "@radix-ui/react-alert-dialog": "^1.1.14",
    "@radix-ui/react-dialog": "^1.1.14", 
    "@radix-ui/react-label": "^2.1.7",
    "@radix-ui/react-select": "^2.2.5",
    "@radix-ui/react-separator": "^1.1.7",
    "@radix-ui/react-slot": "^1.2.3",
    "@radix-ui/react-tabs": "^1.1.12",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.523.0",
    "react-hot-toast": "^2.4.1",
    "tailwind-merge": "^3.3.1", 
    "tailwindcss-animate": "^1.0.7",
    "web-vitals": "^4.2.4"
  }
}
```

### **3. Scripts Atualizados**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview",
    "test": "jest",
    "test:e2e": "playwright test",
    "test:coverage": "jest --coverage"
  }
}
```

---

## 🎛️ **INTERFACES E APIs**

### **1. Health Check Service API**
```typescript
class HealthCheckService {
  // Métodos públicos
  async initialize(): Promise<void>
  async getHealth(): Promise<SystemHealth>
  getLastResults(): SystemHealth | null
  getAlerts(): Alert[]
  clearAlerts(): void
  
  // Métodos de configuração
  addCheck(name: string, check: HealthCheck): void
  removeCheck(name: string): void
  updateThresholds(thresholds: Partial<Thresholds>): void
}
```

### **2. Analytics Service API**
```typescript
class AnalyticsService {
  // Inicialização
  async initialize(): Promise<void>
  
  // Tracking
  trackPageView(page: string, params?: Record<string, any>): void
  trackScriptGeneration(data: ScriptGenerationData): void
  trackError(error: string, context: Record<string, any>): void
  trackUserAction(action: string, params?: Record<string, any>): void
  trackConversionFunnel(step: FunnelStep, data?: any): void
  trackFeatureUsage(feature: string, data?: any): void
  
  // Analytics
  getSessionData(): SessionData
  getBusinessMetrics(): BusinessMetrics
  getConversionRate(): number
  exportAnalyticsData(): AnalyticsExport
}
```

### **3. System Dashboard API**
```typescript
interface SystemDashboardProps {
  onClose: () => void;
}

// Métodos disponíveis via props
loadDashboardData(): Promise<void>
exportData(): void
clearAlerts(): void
getStatusColor(status: string): string
formatUptime(ms: number): string
```

---

## 🚨 **SISTEMA DE ALERTAS**

### **1. Tipos de Alertas**
```typescript
interface Alert {
  timestamp: string;
  severity: 'WARNING' | 'CRITICAL';
  score: number;
  uptime: string;
  failedChecks: FailedCheck[];
}

interface FailedCheck {
  name: string;
  status: 'warning' | 'critical';
  message: string;
  details?: any;
}
```

### **2. Critérios de Disparo**
```typescript
// WARNING (Sistema degradado)
if (score < 70 && score >= 40) {
  triggerAlert('WARNING', systemHealth);
}

// CRITICAL (Sistema down)  
if (score < 40) {
  triggerAlert('CRITICAL', systemHealth);
  showBrowserNotification();
}
```

### **3. Cooldown System**
```typescript
const ALERT_COOLDOWN = 5 * 60 * 1000; // 5 minutos

// Evita spam de alertas
if (Date.now() - lastAlertTime < ALERT_COOLDOWN) {
  return; // Não disparar alerta
}
```

---

## 📈 **MÉTRICAS E KPIs**

### **1. Métricas de Sistema**
```typescript
// Health Score (0-100%)
const systemScore = calculateWeightedScore({
  GEMINI_API: 40,    // peso 40%
  FIREBASE: 30,      // peso 30% 
  PERFORMANCE: 20,   // peso 20%
  STORAGE: 10        // peso 10%
});

// Uptime
const uptime = Date.now() - startTime;

// Response Times
const avgResponseTime = checks.reduce((acc, check) => 
  acc + check.responseTime, 0) / checks.length;
```

### **2. Métricas de Negócio**
```typescript
// Taxa de Conversão
const conversionRate = (scriptsGenerated / pageViews) * 100;

// Meta: >60% para usuários orgânicos
// Excelente: >80%
// Atenção: <40%

// Tempo Médio de Geração
const avgGenerationTime = totalGenerationTime / scriptsGenerated;

// Meta: <10 segundos
// Excelente: <5 segundos
// Lento: >15 segundos

// Taxa de Erro
const errorRate = (errorCount / totalAttempts) * 100;

// Meta: <5%
// Ótimo: <2%  
// Problema: >10%
```

### **3. Web Vitals Automáticos**
```typescript
// Core Web Vitals
interface WebVitals {
  CLS: number;  // Cumulative Layout Shift
  FID: number;  // First Input Delay
  LCP: number;  // Largest Contentful Paint
  FCP: number;  // First Contentful Paint
  TTFB: number; // Time to First Byte
}

// Thresholds Google
const GOOD_THRESHOLDS = {
  CLS: 0.1,     // <0.1 = good
  FID: 100,     // <100ms = good  
  LCP: 2500,    // <2.5s = good
  FCP: 1800,    // <1.8s = good
  TTFB: 800     // <800ms = good
};
```

---

## 🛠️ **COMANDOS E DEBUGGING**

### **1. Console Commands**
```javascript
// Health Checks
healthCheck.getHealth()           // Status completo
healthCheck.getLastResults()      // Último resultado
healthCheck.getAlerts()          // Lista de alertas
healthCheck.clearAlerts()        // Limpar alertas

// Analytics  
analytics.getSessionData()       // Dados da sessão
analytics.getBusinessMetrics()   // Métricas de negócio
analytics.getConversionRate()    // Taxa de conversão
analytics.exportAnalyticsData()  // Export completo

// Debug específico
analytics.getDebugInfo()         // Info de debug
performance.memory               // Memória do browser
navigator.onLine                 // Status da conexão
```

### **2. Keyboard Shortcuts**
```
Ctrl + Shift + D = Abrir dashboard
F12              = Console do browser
Ctrl + Shift + I = Dev tools
```

### **3. URLs de Debug**
```
https://analytics.google.com/     // Google Analytics
https://console.firebase.google.com/  // Firebase Console
https://makersuite.google.com/    // Google AI Studio
```

---

## 📱 **PWA E PERFORMANCE**

### **1. Service Worker Updates**
```javascript
// sw.js - Cache do sistema de monitoramento
const MONITORING_CACHE = 'monitoring-v1';

// Recursos críticos sempre em cache
const CRITICAL_RESOURCES = [
  '/src/services/healthCheckService.ts',
  '/src/services/analyticsService.ts',
  '/src/components/SystemDashboard.tsx'
];
```

### **2. Performance Optimizations**
```typescript
// Lazy loading do dashboard
const SystemDashboard = React.lazy(() => 
  import('./SystemDashboard')
);

// Debounce de health checks
const debouncedHealthCheck = debounce(runHealthCheck, 1000);

// Local storage optimization
const MAX_STORED_EVENTS = 1000;
const MAX_STORED_ALERTS = 100;
```

---

## 🔒 **SEGURANÇA E PRIVACIDADE**

### **1. Dados Sensíveis**
```typescript
// API Keys nunca expostas
const apiKey = localStorage.getItem('GEMINI_API_KEY'); // Criptografado
const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;   // Público OK

// User data anonimizado
const userId = hashUserId(user.email); // Hash, não email real
```

### **2. Error Handling**
```typescript
// Nunca expor dados sensíveis em logs
catch (error) {
  console.error('Erro sanitizado:', sanitizeError(error));
  analytics.trackError('Safe Error Message', {
    type: error.constructor.name,
    // Sem stack traces ou dados internos
  });
}
```

---

## 🚀 **DEPLOY E PRODUÇÃO**

### **1. Build Process**
```bash
# Build otimizado
npm run build

# Saída esperada
dist/
├── index.html                    # Entry point
├── assets/
│   ├── index-[hash].css         # Styles
│   └── index-[hash].js          # Bundle (~2MB)
└── manifest.json                # PWA manifest
```

### **2. Environment Variables Production**
```bash
# Vercel
VITE_GA_MEASUREMENT_ID=G-REAL_ID
VITE_ALERT_WEBHOOK_URL=https://real-webhook.com

# Firebase (produção)
VITE_FIREBASE_API_KEY=real_key
VITE_FIREBASE_PROJECT_ID=real_project
```

### **3. Health Check URLs**
```
https://roteirizar.app/            # App principal
https://roteirizar.app/health      # Health endpoint (se implementado)
https://status.roteirizar.app/     # Status page (futuro)
```

---

## 📊 **MONITORING DASHBOARD FEATURES**

### **1. Visual Components**
```tsx
// Status Overview
<div className="bg-green-100 p-4">
  <h3>Status Geral</h3>  
  <p className="text-green-600">HEALTHY (95%)</p>
  <p>Uptime: 2d 14h</p>
</div>

// Individual Checks
{Object.entries(health.checks).map(([key, check]) => (
  <div className={`border-l-4 ${getBorderColor(check.status)}`}>
    <h4>{key.toUpperCase()}</h4>
    <p>{check.message}</p>
    <p>{check.responseTime}ms</p>
  </div>
))}

// Analytics Summary  
<div className="grid grid-cols-4 gap-4">
  <MetricCard title="Page Views" value={analytics.page_views} />
  <MetricCard title="Scripts" value={analytics.scripts_generated} />
  <MetricCard title="Conversão" value={`${conversionRate}%`} />
  <MetricCard title="Duração" value={formatUptime(sessionTime)} />
</div>
```

### **2. Export Functionality**
```typescript
const exportData = () => {
  const data = {
    timestamp: new Date().toISOString(),
    health: await healthCheckService.getHealth(),
    analytics: analyticsService.exportAnalyticsData(),
    alerts: healthCheckService.getAlerts(),
    system_info: {
      user_agent: navigator.userAgent,
      url: window.location.href,
      viewport: `${window.innerWidth}x${window.innerHeight}`
    }
  };
  
  // Download como JSON
  const blob = new Blob([JSON.stringify(data, null, 2)], 
    { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `roteirizar-dashboard-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};
```

---

## 🔄 **MAINTENANCE E UPDATES**

### **1. Checklist Semanal**
```
□ Verificar GA4 coletando dados
□ Revisar alertas da semana  
□ Exportar dados analytics
□ Verificar taxa de conversão
□ Limpar alerts antigos
□ Testar atalhos e funcionalidades
□ Verificar performance do bundle
□ Update dependencies (se necessário)
```

### **2. Monitoring de Monitoring**
```typescript
// Meta-monitoring: monitorar o próprio sistema de monitoring
const monitoringHealth = {
  ga4_working: !!window.gtag,
  local_storage_available: !!localStorage,
  health_checks_running: healthCheckService.isRunning(),
  dashboard_accessible: canOpenDashboard(),
  exports_working: canExportData()
};
```

---

## 📋 **TROUBLESHOOTING GUIDE**

### **1. Problemas Comuns**

#### **Dashboard não abre**
```javascript
// Debug steps
console.log('Dashboard available:', !!document.querySelector('[data-dashboard]'));
console.log('Keyboard listener:', document.hasEventListener);

// Solution
window.location.reload(); // Force reload
```

#### **Analytics não funciona**  
```javascript
// Check GA4
console.log('GA4 loaded:', !!window.gtag);
console.log('Measurement ID:', import.meta.env.VITE_GA_MEASUREMENT_ID);

// Solution: Configure .env.local
```

#### **Health checks sempre falham**
```javascript
// Check connectivity
console.log('Online:', navigator.onLine);
console.log('Firebase config:', !!firebase.apps.length);

// Solution: Check network/firewall
```

### **2. Error Codes**
```typescript
const ERROR_CODES = {
  HC001: 'Health check timeout',
  HC002: 'Invalid health check response', 
  AN001: 'Analytics initialization failed',
  AN002: 'GA4 not loaded',
  DB001: 'Dashboard component error',
  DB002: 'Dashboard data loading failed'
};
```

---

## 🎯 **ROADMAP FUTURO**

### **Fase 2: Alertas Externos**
- Email notifications
- Slack/Discord webhooks
- SMS alerts (critical only)

### **Fase 3: Advanced Analytics**
- Retention metrics
- Cohort analysis
- A/B testing framework

### **Fase 4: AI-Powered Insights**
- Anomaly detection
- Predictive analytics
- Auto-optimization suggestions

---

## 💡 **BEST PRACTICES**

### **1. Performance**
- Health checks: máximo 10s timeout
- Analytics: batch events locally
- Dashboard: lazy loading
- Exports: worker threads para grandes datasets

### **2. User Experience**
- Status sempre visível na UI
- Alertas não intrusivos
- Keyboard shortcuts memoráveis
- Export rápido (<5s)

### **3. Reliability**
- Fallbacks para todos os serviços
- Local storage como backup
- Graceful degradation
- Error boundaries globais

---

## 📞 **SUPORTE E CONTATO**

### **Logs Importantes**
```bash
# Browser Console
F12 > Console > Filter: "monitor"

# Export de dados
Ctrl+Shift+D > "Exportar Dados"

# Local storage
localStorage.getItem('roteirizar_analytics_session')
```

### **Reportar Problemas**
1. Abrir dashboard (Ctrl+Shift+D)
2. Exportar dados  
3. Incluir screenshot da dashboard
4. Descrever passos para reproduzir

---

**Documentação criada em:** Janeiro 2025  
**Versão do sistema:** 2.1.2  
**Status:** ✅ Produção Ready  
**Última atualização:** Janeiro 2025

---

**© 2025 Roteirizar IA - Sistema de Monitoramento Empresarial** 