# 🌐 APIs Externas - Roteirar-ia

> Documentação de todas as APIs e serviços externos utilizados

## 📋 **Visão Geral**

O Roteirar-ia integra com diversos serviços externos para prover funcionalidades completas:

| Serviço | Função | Status | Tier |
|---------|--------|--------|------|
| Google Gemini | Geração de IA | ✅ Ativo | Gratuito |
| Firebase | Auth + Database | ✅ Ativo | Gratuito |
| Vercel/Netlify | Hosting | 🔄 Planejado | Gratuito |
| Google Analytics | Métricas | 🔄 Futuro | Gratuito |

---

## 🤖 **Google Gemini AI**

### **Configuração**
```typescript
const GEMINI_CONFIG = {
  baseURL: 'https://generativelanguage.googleapis.com/v1beta',
  model: 'gemini-1.5-flash-latest',
  timeout: 30000,
  rateLimits: {
    requestsPerMinute: 60,
    tokensPerDay: 1000000
  }
};
```

### **Endpoints Utilizados**
```typescript
const endpoints = {
  generateContent: '/models/gemini-1.5-flash-latest:generateContent',
  listModels: '/models'
};
```

### **Error Handling**
```typescript
const handleGeminiError = (error: any) => {
  switch (error.code) {
    case 400: return 'API key inválida';
    case 429: return 'Rate limit excedido';
    case 500: return 'Erro interno da API';
    default: return 'Erro desconhecido';
  }
};
```

---

## 🔥 **Firebase Services**

### **Authentication**
```typescript
const AUTH_METHODS = {
  email: 'signInWithEmailAndPassword',
  google: 'GoogleAuthProvider',
  anonymous: 'signInAnonymously'
};
```

### **Firestore**
```typescript
const COLLECTIONS = {
  users: 'users',
  scripts: 'scripts', 
  usage: 'usage',
  stats: 'stats'
};
```

### **Security Rules**
```javascript
// Resumo das regras de segurança
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    match /scripts/{scriptId} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }
  }
}
```

---

## 📊 **Analytics & Monitoring**

### **Google Analytics 4 (Futuro)**
```typescript
const GA_EVENTS = {
  script_generated: {
    event_category: 'engagement',
    event_label: 'platform'
  },
  user_signup: {
    event_category: 'conversion', 
    event_label: 'method'
  },
  app_loaded: {
    event_category: 'performance',
    value: 'load_time'
  }
};
```

### **Sentry Error Tracking (Futuro)**
```typescript
const SENTRY_CONFIG = {
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.VITE_ENVIRONMENT,
  tracesSampleRate: 0.1,
  beforeSend: (event) => {
    // Filter sensitive data
    delete event.user?.email;
    return event;
  }
};
```

---

## 🌐 **Hosting & CDN**

### **Vercel**
```json
// vercel.json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### **Netlify**
```toml
# netlify.toml
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 🔑 **Gestão de API Keys**

### **Environment Variables**
```bash
# Produção
VITE_GOOGLE_GEMINI_API_KEY=AIza...
VITE_FIREBASE_API_KEY=AIza...
VITE_SENTRY_DSN=https://...
VITE_GA_MEASUREMENT_ID=G-...

# Desenvolvimento
VITE_ENVIRONMENT=development
VITE_DEBUG_MODE=true
```

### **Security Best Practices**
```typescript
// Validação de API keys
const validateAPIKey = (key: string, service: string): boolean => {
  const patterns = {
    gemini: /^AIza[0-9A-Za-z-_]{35}$/,
    firebase: /^AIza[0-9A-Za-z-_]{35}$/,
    ga: /^G-[A-Z0-9]{10}$/
  };
  
  return patterns[service]?.test(key) || false;
};

// Rotation de keys
const rotateAPIKeys = async () => {
  // Implementar rotação automática se necessário
};
```

---

## ⚡ **Rate Limiting & Quotas**

### **Limites por Serviço**
```typescript
const RATE_LIMITS = {
  gemini: {
    requestsPerMinute: 60,
    tokensPerDay: 1000000,
    concurrent: 10
  },
  firebase: {
    reads: 50000, // per day
    writes: 20000, // per day
    deletes: 20000 // per day
  },
  vercel: {
    functions: 100, // per hour (hobby)
    bandwidth: '100GB' // per month
  }
};
```

### **Monitoring Implementation**
```typescript
class APILimitMonitor {
  private counters = new Map<string, number>();
  
  checkLimit(service: string, operation: string): boolean {
    const key = `${service}:${operation}`;
    const current = this.counters.get(key) || 0;
    const limit = RATE_LIMITS[service]?.[operation] || Infinity;
    
    return current < limit;
  }
  
  incrementCounter(service: string, operation: string): void {
    const key = `${service}:${operation}`;
    this.counters.set(key, (this.counters.get(key) || 0) + 1);
  }
}
```

---

## 🔄 **Fallback Strategies**

### **API Failure Handling**
```typescript
const withFallback = async <T>(
  primary: () => Promise<T>,
  fallback: () => Promise<T>,
  condition: (error: any) => boolean
): Promise<T> => {
  try {
    return await primary();
  } catch (error) {
    if (condition(error)) {
      console.warn('Primary API failed, using fallback');
      return await fallback();
    }
    throw error;
  }
};

// Exemplo de uso
const generateScript = async (params: any) => {
  return withFallback(
    () => geminiService.generate(params),
    () => generateLocalTemplate(params),
    (error) => error.code === 429 // Rate limit
  );
};
```

### **Offline Support**
```typescript
const OFFLINE_CAPABILITIES = {
  scriptGeneration: false, // Requires API
  scriptEditing: true,     // Local only
  scriptSaving: false,     // Requires Firebase
  userAuth: false          // Requires Firebase
};

const checkOnlineStatus = (): boolean => {
  return navigator.onLine && 
         window.performance.now() - lastAPICall < 30000;
};
```

---

## 📈 **Performance Optimization**

### **Caching Strategy**
```typescript
const CACHE_CONFIG = {
  gemini: {
    ttl: 3600000, // 1 hour
    maxSize: 100, // responses
    strategy: 'lru' // least recently used
  },
  firebase: {
    ttl: 300000, // 5 minutes
    maxSize: 50,
    strategy: 'fifo'
  }
};
```

### **Request Optimization**
```typescript
const optimizeRequest = (request: APIRequest) => {
  // Batch requests when possible
  // Compress payloads
  // Use appropriate content-type
  // Set reasonable timeouts
  
  return {
    ...request,
    headers: {
      'Content-Encoding': 'gzip',
      'Accept-Encoding': 'gzip',
      ...request.headers
    },
    timeout: request.timeout || 30000
  };
};
```

---

## 🚨 **Error Handling Matrix**

| Serviço | Erro | Código | Ação |
|---------|------|--------|------|
| Gemini | API Key Invalid | 400 | Reconfigurar |
| Gemini | Rate Limit | 429 | Retry + Backoff |
| Firebase | Permission Denied | 403 | Reauth |
| Firebase | Not Found | 404 | Create Resource |
| Network | Timeout | - | Retry |
| Network | Offline | - | Queue/Fallback |

### **Error Recovery Implementation**
```typescript
const handleAPIError = async (error: APIError, context: string) => {
  const strategy = ERROR_STRATEGIES[error.code] || 'default';
  
  switch (strategy) {
    case 'retry':
      return await retryWithBackoff(context);
    case 'fallback':
      return await useFallbackService(context);
    case 'reauth':
      await reauthenticateUser();
      return await retryOriginalRequest(context);
    default:
      throw new UserFriendlyError(error);
  }
};
```

---

## 🧪 **Testing APIs**

### **Mock Services**
```typescript
// Para desenvolvimento e testes
const mockServices = {
  gemini: new MockGeminiService(),
  firebase: new MockFirebaseService()
};

const getService = (name: string) => {
  return process.env.NODE_ENV === 'test' 
    ? mockServices[name]
    : realServices[name];
};
```

### **Integration Tests**
```typescript
describe('API Integrations', () => {
  test('should handle Gemini API correctly', async () => {
    const result = await geminiService.generateScript({
      subject: 'test',
      platform: 'youtube'
    });
    
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });
  
  test('should fallback gracefully on API failure', async () => {
    // Mock API failure
    jest.spyOn(geminiService, 'generate')
        .mockRejectedValue(new Error('API Error'));
    
    const result = await generateWithFallback(params);
    expect(result).toContain('template'); // Fallback response
  });
});
```

---

## 📊 **Monitoring Dashboard**

### **Health Checks**
```typescript
const healthChecks = {
  gemini: () => testGeminiAPI(),
  firebase: () => testFirebaseConnection(),
  external: () => testExternalServices()
};

const getSystemHealth = async () => {
  const results = await Promise.allSettled(
    Object.entries(healthChecks).map(async ([name, check]) => ({
      service: name,
      status: await check(),
      timestamp: new Date()
    }))
  );
  
  return results.map(result => 
    result.status === 'fulfilled' ? result.value : {
      service: 'unknown',
      status: 'error',
      error: result.reason
    }
  );
};
```

---

## 📚 **Recursos Úteis**

### **Documentação Oficial**
- [Google Gemini API](https://ai.google.dev/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com)

### **Ferramentas de Monitoramento**
- [Firebase Console](https://console.firebase.google.com/)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Vercel Dashboard](https://vercel.com/dashboard)

---

**Documentação criada:** Janeiro 2025  
**Última atualização:** Janeiro 2025  
**Versão:** 1.0 