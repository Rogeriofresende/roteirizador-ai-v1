/**
 * Error Capture System V6.4 - Simplified & Effective
 * Sistema de captura de erros otimizado para reduzir false positives
 */

import { ErrorCollectionAdapter } from '../services/mockErrorCollection';

// 🔧 V6.4: Configuração simplificada
const ERROR_CAPTURE_CONFIG = {
  enabled: true, // ✅ CORRIGIDO: Habilitado em development
  maxErrors: 10,
  timeWindow: 30000, // 30 segundos
  // ✅ REALISTIC: Use relative endpoint to avoid connection refused
  endpoint: '/api/errors'
};

// 🛡️ OPTIMIZED: Sistema de patterns otimizado para máxima performance
const SYSTEM_PATTERNS = [
  // ✅ Console patterns (high frequency)
  'Console info: ℹ️',
  'Console warning: ⚠️',
  'console.info',
  'console.log',
  'console.debug',
  'console.warn',
  
  // ✅ Service initialization (startup only)
  'initialization',
  'Services initialization',
  'App initialization',
  'Error Capture System',
  'DI Container System',
  'DI System',
  
  // ✅ Analytics & Third-party (common in production)
  'Analytics disabled',
  'Microsoft Clarity',
  'Google Analytics',
  'Tally.so disabled',
  'Firebase Analytics',
  'Adobe Analytics',
  'Facebook Pixel',
  
  // ✅ Framework patterns (React/Vite)
  'React DevTools',
  'Download the React DevTools',
  'HMR',
  'vite:',
  'chunk-',
  'React Hook',
  'useEffect',
  'useState',
  'ReactDOM',
  'Fast Refresh',
  
  // ✅ Performance monitoring
  'Performance monitoring',
  'V51Intelligence',
  'performanceService',
  'Performance patterns',
  
  // ✅ Firebase & Auth (when configured)
  'Firebase Auth',
  'Firebase SDK',
  'Setting up Firebase',
  'Auth state changed',
  'Firebase Performance',
  'Firebase Remote Config',
  'Firebase Messaging',
  
  // ✅ PWA & Service Worker
  'PWA Install',
  'Service Worker',
  'SW Registration',
  'Cache API',
  'IndexedDB',
  'workbox',
  
  // ✅ Application-specific patterns
  'Patterns loaded',
  'Third-party error suppression',
  'preloadPages',
  'Code splitting',
  'lazy loaded',
  
  // ✅ Network & API (non-critical)
  'Network monitoring',
  'API health check',
  'Health check',
  'Connectivity check',
];

// 🚀 PERFORMANCE: Pre-compile patterns for faster matching
const COMPILED_PATTERNS = SYSTEM_PATTERNS.map(pattern => pattern.toLowerCase());

// 📊 Interface simplificada
interface ErrorData {
  type: 'javascript' | 'react' | 'network' | 'console';
  message: string;
  stack?: string;
  url?: string;
  timestamp: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

interface ErrorStats {
  totalErrors: number;
  criticalErrors: number;
  filteredCount: number;
  isActive: boolean;
  sessionId: string;
}

// 🔄 Circuit Breaker simplificado
class SimpleCircuitBreaker {
  private errorCount = 0;
  private lastReset = Date.now();
  
  shouldCapture(): boolean {
    const now = Date.now();
    
    if (now - this.lastReset > ERROR_CAPTURE_CONFIG.timeWindow) {
      this.errorCount = 0;
      this.lastReset = now;
    }
    
    if (this.errorCount >= ERROR_CAPTURE_CONFIG.maxErrors) {
      return false;
    }
    
    this.errorCount++;
    return true;
  }
  
  // ✅ CORRIGIDO: Método getStatus() implementado
  getStatus(): { errorCount: number; isOpen: boolean; timeUntilReset: number } {
    const now = Date.now();
    const timeUntilReset = Math.max(0, ERROR_CAPTURE_CONFIG.timeWindow - (now - this.lastReset));
    
    return {
      errorCount: this.errorCount,
      isOpen: this.errorCount >= ERROR_CAPTURE_CONFIG.maxErrors,
      timeUntilReset
    };
  }
}

// Estado global
let isInitialized = false;
let sessionId = '';
let filteredCount = 0;
const circuitBreaker = new SimpleCircuitBreaker();
let errorStats: ErrorStats = {
  totalErrors: 0,
  criticalErrors: 0,
  filteredCount: 0,
  isActive: false,
  sessionId: ''
};

/**
 * 🔍 OPTIMIZED: Verificar se deve capturar erro com performance melhorada
 */
const shouldCaptureError = (message: string): boolean => {
  if (!ERROR_CAPTURE_CONFIG.enabled || !circuitBreaker.shouldCapture()) {
    return false;
  }
  
  // 🚀 PERFORMANCE: Use lowercase once for all pattern matching
  const lowerMessage = message.toLowerCase();
  
  // 🚀 OPTIMIZED: Fast pattern matching using compiled patterns
  const isSystemLog = COMPILED_PATTERNS.some(pattern => 
    lowerMessage.includes(pattern)
  );
  
  if (isSystemLog) {
    filteredCount++;
    return false;
  }
  
  // ✅ ENHANCED: More comprehensive critical error detection
  const isCritical = lowerMessage.includes('cannot read propert') ||
                     lowerMessage.includes('is not a function') ||
                     lowerMessage.includes('is not defined') ||
                     lowerMessage.includes('uncaught') ||
                     lowerMessage.includes('typeerror') ||
                     lowerMessage.includes('referenceerror') ||
                     lowerMessage.includes('syntaxerror') ||
                     lowerMessage.includes('network error') ||
                     lowerMessage.includes('failed to fetch') ||
                     lowerMessage.includes('script error');
  
  return isCritical;
};

/**
 * 🎯 Categorizar severidade
 */
const categorizeError = (message: string): 'critical' | 'high' | 'medium' | 'low' => {
  if (message.includes('Cannot read property') || 
      message.includes('is not a function') || 
      message.includes('Uncaught')) {
    return 'critical';
  }
  
  if (message.includes('Network Error') || 
      message.includes('Failed to fetch')) {
    return 'high';
  }
  
  if (message.includes('Warning')) {
    return 'medium';
  }
  
  return 'low';
};

/**
 * 📤 Enviar erro para monitoramento (com fallback automático)
 */
const sendToMonitoring = async (errorData: ErrorData): Promise<void> => {
  if (!ERROR_CAPTURE_CONFIG.enabled) return;
  
  try {
    // ✅ USANDO ADAPTER: Auto-detecta servidor real ou mock
    await ErrorCollectionAdapter.collectError({
      ...errorData,
      sessionId,
      userAgent: navigator.userAgent
    });
  } catch (error) {
    // ✅ FALLBACK FINAL: Log local se tudo falhar
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const localErrors = JSON.parse(localStorage.getItem('offline_errors') || '[]');
        localErrors.push({
          ...errorData,
          sessionId,
          userAgent: navigator.userAgent,
          offlineAt: new Date().toISOString()
        });
        
        // Manter apenas últimos 50 erros
        if (localErrors.length > 50) {
          localErrors.splice(0, localErrors.length - 50);
        }
        
        localStorage.setItem('offline_errors', JSON.stringify(localErrors));
      } catch (storageError) {
        // Falha silenciosa se localStorage não disponível
      }
    }
  }
};

/**
 * 📊 Atualizar estatísticas
 */
const updateStats = (errorData: ErrorData): void => {
  errorStats.totalErrors++;
  errorStats.filteredCount = filteredCount;
  
  if (errorData.severity === 'critical') {
    errorStats.criticalErrors++;
  }
};

/**
 * 🚨 Capturar erro JavaScript
 */
const handleJavaScriptError = (event: ErrorEvent): void => {
  if (!shouldCaptureError(event.message)) return;
  
  const errorData: ErrorData = {
    type: 'javascript',
    message: event.message,
    stack: event.error?.stack,
    url: event.filename,
    timestamp: new Date().toISOString(),
    severity: categorizeError(event.message)
  };
  
  updateStats(errorData);
  sendToMonitoring(errorData);
};

/**
 * ⚛️ Capturar erro React
 */
export const handleReactError = (error: Error, errorInfo: { componentStack: string }): void => {
  if (!shouldCaptureError(error.message)) return;
  
  const errorData: ErrorData = {
    type: 'react',
    message: error.message,
    stack: `${error.stack}\n\nComponent Stack:${errorInfo.componentStack}`,
    url: window.location.href,
    timestamp: new Date().toISOString(),
    severity: categorizeError(error.message)
  };
  
  updateStats(errorData);
  sendToMonitoring(errorData);
};

/**
 * 🔧 Inicializar sistema de captura
 */
export const initializeErrorCapture = (): void => {
  if (isInitialized || !ERROR_CAPTURE_CONFIG.enabled) return;
  
  sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  errorStats = {
    totalErrors: 0,
    criticalErrors: 0,
    filteredCount: 0,
    isActive: true,
    sessionId
  };
  
  // Adicionar listeners apenas para erros críticos
  window.addEventListener('error', handleJavaScriptError);
  window.addEventListener('unhandledrejection', (event) => {
    const message = `Unhandled Promise Rejection: ${event.reason}`;
    if (shouldCaptureError(message)) {
      const errorData: ErrorData = {
        type: 'javascript',
        message,
        stack: event.reason?.stack,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        severity: categorizeError(message)
      };
      updateStats(errorData);
      sendToMonitoring(errorData);
    }
  });
  
  // Expor stats globalmente
  (window as any).errorCaptureStats = () => ({ ...errorStats });
  
  isInitialized = true;
};

/**
 * 🧹 Cleanup
 */
export const cleanupErrorCapture = (): void => {
  if (!isInitialized) return;
  
  window.removeEventListener('error', handleJavaScriptError);
  delete (window as any).errorCaptureStats;
  
  isInitialized = false;
  errorStats.isActive = false;
};

/**
 * 📈 Obter estatísticas
 */
export const getErrorCaptureStats = (): ErrorStats => {
  return { ...errorStats };
};

/**
 * 🧪 Trigger test error (para debugging)
 */
export const triggerTestError = (type: 'javascript' | 'react'): void => {
  if (type === 'javascript') {
    throw new Error('Test JavaScript error triggered manually');
  } else if (type === 'react') {
    handleReactError(new Error('Test React error'), { componentStack: '\n    in TestComponent' });
  }
};

export default {
  initializeErrorCapture,
  cleanupErrorCapture,
  getErrorCaptureStats,
  handleReactError,
  triggerTestError
}; 