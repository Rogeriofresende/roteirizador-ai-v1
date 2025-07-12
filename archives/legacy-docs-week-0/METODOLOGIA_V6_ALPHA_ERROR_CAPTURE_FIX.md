# 🚨 FIX-FIRST CRÍTICO - IA ALPHA ERROR CAPTURE V6.3

## 🔴 SITUAÇÃO CRÍTICA ATUAL
- **Build Status**: ❌ QUEBRADO - "Failed to resolve import './utils/errorCapture'"
- **App Status**: ❌ NÃO CARREGA - Import quebrado em App.tsx
- **Downtime**: 2+ horas
- **Backend**: ✅ Pronto e aguardando (porta 3001)
- **Dashboard**: ✅ Pronto e aguardando dados reais

## 🎯 MISSÃO: Completar Frontend Error Capture System

### ⚡ FASE 1: FIX-FIRST IMEDIATO (5 min)
**OBJETIVO**: Fazer app voltar a funcionar AGORA

```bash
# COMANDO 1 - Criar arquivo mínimo funcional
cat > src/utils/errorCapture.ts << 'EOF'
// V6.3 Error Capture System - Fix-First Implementation

export function initializeErrorCapture() {
  console.log('[V6.3] Error capture initialized');
}

export function cleanupErrorCapture() {
  console.log('[V6.3] Error capture cleaned up');
}

export function sendErrorToMonitoring(error: any) {
  console.log('[V6.3] Error captured:', error);
}
EOF

# COMANDO 2 - Verificar que app carrega
npm run dev
# DEVE funcionar em http://localhost:5173
```

### 📋 FASE 2: ORGANIZE-SECOND (30 min)
**OBJETIVO**: Implementar sistema completo de captura

#### 2.1 Global Error Handlers
```typescript
// src/utils/errorCapture.ts - Adicionar:

let errorQueue: ErrorData[] = [];
const MAX_QUEUE_SIZE = 100;
const BATCH_SIZE = 10;
const API_ENDPOINT = 'http://localhost:3001/api/errors';

// Handler para erros JavaScript
window.onerror = (message, source, lineno, colno, error) => {
  captureError({
    type: 'javascript',
    message: message.toString(),
    stack: error?.stack || '',
    url: source || window.location.href,
    line: lineno,
    column: colno,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    severity: 'error'
  });
  return true;
};

// Handler para promises rejeitadas
window.addEventListener('unhandledrejection', (event) => {
  captureError({
    type: 'javascript',
    message: event.reason?.message || 'Unhandled Promise Rejection',
    stack: event.reason?.stack || '',
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    severity: 'error'
  });
});
```

#### 2.2 Network Monitoring
```typescript
// Interceptar fetch
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  const startTime = Date.now();
  try {
    const response = await originalFetch(...args);
    const duration = Date.now() - startTime;
    
    if (!response.ok) {
      captureError({
        type: 'network',
        message: `HTTP ${response.status}: ${response.statusText}`,
        stack: `URL: ${args[0]}\nStatus: ${response.status}`,
        url: args[0].toString(),
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        severity: response.status >= 500 ? 'error' : 'warning'
      });
    }
    
    // Alertar para requests lentos
    if (duration > 3000) {
      console.warn(`Slow request: ${args[0]} took ${duration}ms`);
    }
    
    return response;
  } catch (error) {
    captureError({
      type: 'network',
      message: error.message,
      stack: error.stack || '',
      url: args[0].toString(),
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      severity: 'error'
    });
    throw error;
  }
};
```

#### 2.3 Console Monitoring
```typescript
// Capturar console.error e console.warn
const originalError = console.error;
const originalWarn = console.warn;

console.error = (...args) => {
  originalError.apply(console, args);
  captureError({
    type: 'console',
    message: args.map(arg => String(arg)).join(' '),
    stack: new Error().stack || '',
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    severity: 'error'
  });
};

console.warn = (...args) => {
  originalWarn.apply(console, args);
  // Filtrar warnings irrelevantes
  const message = args.join(' ');
  if (!message.includes('DevTools') && !message.includes('extension')) {
    captureError({
      type: 'console',
      message: message,
      stack: new Error().stack || '',
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      severity: 'warning'
    });
  }
};
```

### 🚀 FASE 3: OPTIMIZE-THIRD (25 min)
**OBJETIVO**: Integração completa e otimizações

#### 3.1 Sistema de Envio Robusto
```typescript
async function sendBatchToBackend(errors: ErrorData[]) {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errors.map(error => ({
        type: mapErrorType(error.type),
        priority: calculatePriority(error),
        message: error.message,
        stack: error.stack?.substring(0, 2000),
        url: error.url,
        userAgent: error.userAgent,
        timestamp: error.timestamp,
        severity: error.severity
      })))
    });
    
    if (response.ok) {
      console.log(`[V6.3] Sent ${errors.length} errors to monitoring`);
      return true;
    }
    throw new Error(`Server returned ${response.status}`);
  } catch (error) {
    console.error('[V6.3] Failed to send errors:', error);
    saveToLocalStorage(errors);
    return false;
  }
}

// Processar fila a cada 5 segundos
setInterval(() => {
  if (errorQueue.length > 0) {
    const batch = errorQueue.splice(0, BATCH_SIZE);
    sendBatchToBackend(batch);
  }
}, 5000);
```

#### 3.2 React Integration Hook
```typescript
// src/hooks/useErrorCapture.ts
import { useEffect } from 'react';
import { captureError } from '../utils/errorCapture';

export function useErrorCapture(componentName: string) {
  useEffect(() => {
    const handleError = (error: Error, errorInfo: any) => {
      captureError({
        type: 'react',
        message: `React Error in ${componentName}: ${error.message}`,
        stack: errorInfo.componentStack || error.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        severity: 'error'
      });
    };
    
    // Registrar handler específico do componente
    return () => {
      // Cleanup se necessário
    };
  }, [componentName]);
}
```

## ✅ VALIDAÇÃO OBRIGATÓRIA

### Teste 1: Build e Load
```bash
npm run build  # DEVE passar sem erros
npm run dev    # App DEVE carregar normalmente
```

### Teste 2: Captura de Erros
```javascript
// Console do browser:
// 1. JavaScript Error
throw new Error('Test JS Error V6.3');

// 2. Network Error  
fetch('https://api.invalid-domain.com/test');

// 3. Console Warning
console.warn('Test Warning V6.3');

// 4. React Error - Usar ErrorTestPanel
```

### Teste 3: Verificar Backend
```bash
# Terminal 1: Verificar servidor rodando
curl http://localhost:3001/health

# Terminal 2: Ver logs do servidor
# Deve mostrar "Error collected" quando erros forem enviados

# Terminal 3: Verificar arquivo de erros
cat logs/browser-errors.json
```

### Teste 4: Dashboard
- Abrir http://localhost:5173/admin
- Navegar para aba "Erros"
- Verificar que erros aparecem em tempo real
- Testar filtros e alertas

## 📊 CHECKLIST FINAL

- [ ] App carrega sem erros
- [ ] errorCapture.ts implementado com todos os handlers
- [ ] Erros JavaScript são capturados
- [ ] Erros de Network são capturados
- [ ] Console warnings são capturados
- [ ] Erros são enviados para backend (porta 3001)
- [ ] Dashboard mostra erros em tempo real
- [ ] ErrorTestPanel funciona para todos os tipos
- [ ] Performance impact < 1%
- [ ] Sem memory leaks

## 🎯 RESULTADO ESPERADO

Sistema V6.3 100% funcional com:
- Frontend capturando TODOS os tipos de erro
- Backend recebendo e processando (já pronto)
- Dashboard mostrando em tempo real (já pronto)
- Integração end-to-end completa

**TEMPO TOTAL**: 60 minutos
**PRIORIDADE**: CRÍTICA - Sistema está quebrado

---

**INICIAR IMEDIATAMENTE COM FIX-FIRST!** 