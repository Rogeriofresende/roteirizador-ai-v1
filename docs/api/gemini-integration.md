# 🤖 Integração Google Gemini AI - Roteirar-ia

> Documentação completa para integração com Google Gemini 1.5 Flash

## 📋 **Visão Geral**

O Roteirar-ia utiliza o **Google Gemini 1.5 Flash** como engine principal de IA para geração de roteiros. Esta documentação cobre toda a configuração, uso e troubleshooting da integração.

### **Especificações da API**
- **Modelo:** `gemini-1.5-flash-latest`
- **Endpoint:** `https://generativelanguage.googleapis.com/v1beta/models`
- **Autenticação:** API Key
- **Rate Limit:** 60 requests/minuto (tier gratuito)
- **Token Limit:** 1M tokens/dia (tier gratuito)

---

## 🔑 **Configuração da API Key**

### **1. Obter API Key**

#### **Passo 1: Acesso ao Google AI Studio**
```bash
URL: https://aistudio.google.com/
Requisitos: Conta Google ativa
```

#### **Passo 2: Criação da API Key**
1. Login no Google AI Studio
2. Clique em **"API key"** no menu lateral
3. Clique em **"Create API key"**
4. Selecione projeto existente ou crie novo
5. Copie a API key gerada

**Formato da API Key:**
```
AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### **2. Configuração no Projeto**

#### **Método 1: Variável de Ambiente (Recomendado)**
```bash
# .env.local
VITE_GOOGLE_GEMINI_API_KEY=sua_api_key_aqui
```

#### **Método 2: Configuração Runtime**
```javascript
// Via localStorage (para desenvolvimento)
localStorage.setItem("GEMINI_API_KEY", "sua_api_key_aqui");
```

#### **Método 3: Configuração Manual no App**
O app solicita automaticamente a API key na primeira geração de roteiro.

---

## 🏗️ **Implementação Técnica**

### **Service Layer**

#### **GeminiService.ts - Estrutura Principal**
```typescript
interface GeminiConfig {
  apiKey: string;
  model: string;
  baseURL: string;
  timeout: number;
  retryAttempts: number;
}

interface GenerationParams {
  subject: string;
  platform: Platform;
  duration?: number;
  tone?: string;
  audience?: string;
  format?: string;
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
    finishReason: string;
  }>;
  usageMetadata: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

class GeminiService {
  private config: GeminiConfig;
  
  constructor(apiKey: string) {
    this.config = {
      apiKey,
      model: 'gemini-1.5-flash-latest',
      baseURL: 'https://generativelanguage.googleapis.com/v1beta',
      timeout: 30000,
      retryAttempts: 3
    };
  }
  
  async generateScript(params: GenerationParams): Promise<string> {
    const prompt = this.buildPrompt(params);
    const response = await this.callAPI(prompt);
    return this.extractContent(response);
  }
  
  private buildPrompt(params: GenerationParams): string {
    // Implementação de construção de prompt otimizado
  }
  
  private async callAPI(prompt: string): Promise<GeminiResponse> {
    // Implementação da chamada para API
  }
}
```

### **Configuração de Endpoints**

#### **Endpoint Principal - Content Generation**
```typescript
const ENDPOINTS = {
  generateContent: `/models/${model}:generateContent`,
  streamGenerateContent: `/models/${model}:streamGenerateContent`,
  listModels: '/models',
  getModel: (model: string) => `/models/${model}`
};

// URL completa
const fullURL = `${baseURL}${ENDPOINTS.generateContent}?key=${apiKey}`;
```

#### **Headers Padrão**
```typescript
const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};
```

---

## 📨 **Estrutura de Requests e Responses**

### **Request Format**

#### **Payload Básico**
```json
{
  "contents": [
    {
      "parts": [
        {
          "text": "Crie um roteiro para YouTube sobre como fazer café perfeito"
        }
      ]
    }
  ],
  "generationConfig": {
    "temperature": 0.7,
    "topK": 40,
    "topP": 0.95,
    "maxOutputTokens": 2048,
    "stopSequences": []
  },
  "safetySettings": [
    {
      "category": "HARM_CATEGORY_HARASSMENT",
      "threshold": "BLOCK_MEDIUM_AND_ABOVE"
    }
  ]
}
```

#### **Payload com Configurações Otimizadas**
```json
{
  "contents": [
    {
      "parts": [
        {
          "text": "Prompt otimizado para plataforma específica..."
        }
      ]
    }
  ],
  "generationConfig": {
    "temperature": 0.8,
    "topK": 40,
    "topP": 0.95,
    "maxOutputTokens": 1500,
    "candidateCount": 1
  }
}
```

### **Response Format**

#### **Resposta de Sucesso**
```json
{
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "text": "# Roteiro: Como Fazer Café Perfeito\n\n## Introdução (0-15s)\nOlá, pessoal! Você já se perguntou qual é o segredo para fazer um café realmente perfeito em casa?..."
          }
        ],
        "role": "model"
      },
      "finishReason": "STOP",
      "index": 0,
      "safetyRatings": [
        {
          "category": "HARM_CATEGORY_HARASSMENT",
          "probability": "NEGLIGIBLE"
        }
      ]
    }
  ],
  "usageMetadata": {
    "promptTokenCount": 125,
    "candidatesTokenCount": 847,
    "totalTokenCount": 972
  }
}
```

#### **Resposta de Erro**
```json
{
  "error": {
    "code": 400,
    "message": "API key not valid. Please pass a valid API key.",
    "status": "INVALID_ARGUMENT",
    "details": [
      {
        "@type": "type.googleapis.com/google.rpc.ErrorInfo",
        "reason": "API_KEY_INVALID"
      }
    ]
  }
}
```

---

## 🎯 **Prompts Otimizados por Plataforma**

### **Template Base**
```typescript
const basePrompt = `
Você é um especialista em criação de conteúdo para redes sociais.
Crie um roteiro profissional e envolvente seguindo estas especificações:

ASSUNTO: {subject}
PLATAFORMA: {platform}
DURAÇÃO: {duration}
TOM: {tone}
PÚBLICO: {audience}

ESTRUTURA OBRIGATÓRIA:
1. Título/Hook (chamativo)
2. Introdução (apresentação rápida)
3. Desenvolvimento (conteúdo principal)
4. Conclusão (resumo + CTA)

REQUISITOS:
- Linguagem {tone}
- Adequado para {audience}
- Otimizado para {platform}
- Duração aproximada: {duration}
- Include timing sugerido para cada seção
- Adicione dicas de performance/engagement
`;
```

### **YouTube Specific**
```typescript
const youtubePrompt = `
${basePrompt}

CARACTERÍSTICAS YOUTUBE:
- Hook nos primeiros 5 segundos
- Estrutura didática clara
- Momentos de retenção (a cada 30s)
- Call-to-action para like/subscribe
- Sugestões de próximo vídeo
- Keywords para SEO

FORMATO DE SAÍDA:
📺 TÍTULO: [título otimizado SEO]
🎬 DESCRIÇÃO: [resumo para description]
⏱️ DURAÇÃO TOTAL: {duration}

[Roteiro com timestamps detalhados]
`;
```

### **Instagram Specific**
```typescript
const instagramPrompt = `
${basePrompt}

CARACTERÍSTICAS INSTAGRAM:
- Visual primeiro (descrição das cenas)
- Hashtags estratégicas
- Stories complementares
- Carrossel quando aplicável
- Formato vertical (9:16)

FORMATO DE SAÍDA:
📱 TÍTULO: [título envolvente]
#️⃣ HASHTAGS: [mix de populares + nicho]
📖 STORIES: [ideias para stories]

[Roteiro com cues visuais]
`;
```

### **TikTok Specific**
```typescript
const tiktokPrompt = `
${basePrompt}

CARACTERÍSTICAS TIKTOK:
- Hook nos primeiros 3 segundos
- Transições rápidas
- Trends e challenges
- Música/efeitos sonoros
- Loop potential

FORMATO DE SAÍDA:
🎵 TÍTULO: [título viral]
🎶 MÚSICA: [sugestão de áudio]
🔥 TRENDS: [trends aplicáveis]

[Roteiro com beats/ritmo]
`;
```

### **LinkedIn Specific**
```typescript
const linkedinPrompt = `
${basePrompt}

CARACTERÍSTICAS LINKEDIN:
- Tom profissional
- Insights de mercado
- Storytelling corporativo
- Networking focus
- Value proposition clara

FORMATO DE SAÍDA:
💼 TÍTULO: [título profissional]
🎯 INSIGHT: [principal takeaway]
🤝 NETWORKING: [call to connection]

[Roteiro business-focused]
`;
```

---

## ⚡ **Otimizações de Performance**

### **Rate Limiting**
```typescript
class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests = 60; // por minuto
  private readonly timeWindow = 60000; // 1 minuto
  
  canMakeRequest(): boolean {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    return this.requests.length < this.maxRequests;
  }
  
  recordRequest(): void {
    this.requests.push(Date.now());
  }
}
```

### **Retry Logic**
```typescript
async function retryRequest<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts) break;
      
      // Exponential backoff
      await new Promise(resolve => 
        setTimeout(resolve, delay * Math.pow(2, attempt - 1))
      );
    }
  }
  
  throw lastError!;
}
```

### **Caching Strategy**
```typescript
interface CacheEntry {
  data: string;
  timestamp: number;
  hash: string;
}

class ResponseCache {
  private cache = new Map<string, CacheEntry>();
  private readonly TTL = 3600000; // 1 hora
  
  get(key: string): string | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  set(key: string, data: string): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      hash: this.generateHash(data)
    });
  }
  
  private generateHash(data: string): string {
    // Simple hash implementation
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }
}
```

---

## 💰 **Gestão de Custos**

### **Tier Gratuito**
```
📊 Limites Gratuitos:
- 60 requests/minuto
- 1M tokens/dia
- 15 requests/minuto para streaming

💰 Estimativa de Uso:
- 1 roteiro médio ≈ 1,500-3,000 tokens
- ~300-600 roteiros gratuitos/dia
- Uso normal: 50-100 roteiros/dia = GRATUITO
```

### **Monitoring de Uso**
```typescript
class UsageMonitor {
  private tokenCount = 0;
  private requestCount = 0;
  private dailyReset = new Date();
  
  trackUsage(tokensUsed: number): void {
    this.resetIfNewDay();
    
    this.tokenCount += tokensUsed;
    this.requestCount++;
    
    this.logUsage();
    this.checkLimits();
  }
  
  private checkLimits(): void {
    const tokenLimit = 1000000; // 1M tokens
    const warningThreshold = 0.8; // 80%
    
    if (this.tokenCount > tokenLimit * warningThreshold) {
      console.warn(`Token usage at ${Math.round(this.tokenCount / tokenLimit * 100)}%`);
    }
  }
  
  getDailyStats() {
    return {
      tokens: this.tokenCount,
      requests: this.requestCount,
      date: this.dailyReset.toDateString()
    };
  }
}
```

---

## 🔧 **Error Handling**

### **Tipos de Erro Comuns**

#### **API Key Inválida (400)**
```typescript
interface APIKeyError {
  code: 400;
  message: "API key not valid";
  status: "INVALID_ARGUMENT";
}

// Handling
if (error.status === "INVALID_ARGUMENT") {
  throw new Error("API key inválida. Verifique sua configuração.");
}
```

#### **Rate Limit Exceeded (429)**
```typescript
interface RateLimitError {
  code: 429;
  message: "Resource has been exhausted";
  status: "RESOURCE_EXHAUSTED";
}

// Handling
if (error.code === 429) {
  const retryAfter = error.headers?.['retry-after'] || 60;
  throw new Error(`Rate limit excedido. Tente novamente em ${retryAfter}s`);
}
```

#### **Token Limit Exceeded (429)**
```typescript
// Daily token limit reached
if (error.message?.includes("token")) {
  throw new Error("Limite diário de tokens excedido. Aguarde 24h ou considere upgrade.");
}
```

#### **Network Errors**
```typescript
interface NetworkError {
  code: "NETWORK_ERROR";
  message: string;
  retryable: boolean;
}

// Handling
if (error.code === "NETWORK_ERROR") {
  if (error.retryable) {
    return await retryRequest(apiCall, 3);
  }
  throw new Error("Erro de conexão. Verifique sua internet.");
}
```

### **Error Recovery Strategies**

#### **Graceful Degradation**
```typescript
async function generateWithFallback(params: GenerationParams): Promise<string> {
  try {
    return await geminiService.generateScript(params);
  } catch (error) {
    if (error.code === 429) {
      // Rate limit - try simpler prompt
      return await geminiService.generateScript({
        ...params,
        format: "simple"
      });
    }
    
    if (error.code === 400) {
      // API key issue - show setup guide
      throw new Error("Configuração necessária. Veja o guia de setup.");
    }
    
    // Network issues - show offline message
    throw new Error("Erro temporário. Tente novamente em alguns momentos.");
  }
}
```

---

## 🧪 **Testing**

### **Unit Tests**
```typescript
describe('GeminiService', () => {
  let service: GeminiService;
  
  beforeEach(() => {
    service = new GeminiService('test-api-key');
  });
  
  test('should build correct prompt for YouTube', () => {
    const params = {
      subject: 'Café perfeito',
      platform: 'youtube',
      duration: 300,
      tone: 'casual'
    };
    
    const prompt = service.buildPrompt(params);
    expect(prompt).toContain('PLATAFORMA: youtube');
    expect(prompt).toContain('DURAÇÃO: 300');
  });
  
  test('should handle API errors gracefully', async () => {
    // Mock API error
    global.fetch = jest.fn().mockRejectedValue(new Error('API Error'));
    
    await expect(service.generateScript({})).rejects.toThrow('API Error');
  });
});
```

### **Integration Tests**
```typescript
describe('Gemini Integration', () => {
  test('should generate valid script', async () => {
    const params = {
      subject: 'Test subject',
      platform: 'youtube'
    };
    
    const result = await geminiService.generateScript(params);
    
    expect(result).toBeTruthy();
    expect(result.length).toBeGreaterThan(100);
    expect(result).toContain('TÍTULO:');
  });
});
```

---

## 📊 **Monitoramento e Métricas**

### **Métricas Essenciais**
```typescript
interface GeminiMetrics {
  requestCount: number;
  tokenUsage: number;
  averageResponseTime: number;
  errorRate: number;
  successRate: number;
  costEstimation: number;
}

class MetricsCollector {
  private metrics: GeminiMetrics = {
    requestCount: 0,
    tokenUsage: 0,
    averageResponseTime: 0,
    errorRate: 0,
    successRate: 0,
    costEstimation: 0
  };
  
  recordRequest(tokens: number, responseTime: number, success: boolean): void {
    this.metrics.requestCount++;
    this.metrics.tokenUsage += tokens;
    this.updateAverageResponseTime(responseTime);
    this.updateSuccessRate(success);
    this.updateCostEstimation(tokens);
  }
}
```

---

## 🚨 **Troubleshooting**

### **Problemas Comuns**

#### **1. "API key not valid"**
**Causa:** API key incorreta ou expirada  
**Solução:**
1. Verificar se API key foi copiada corretamente
2. Regenerar API key no Google AI Studio
3. Verificar se projeto tem API Gemini habilitada

#### **2. "Resource has been exhausted"**
**Causa:** Rate limit ou token limit excedido  
**Solução:**
1. Aguardar reset do rate limit (1 minuto)
2. Implementar retry com backoff
3. Considerar upgrade para tier pago

#### **3. Resposta vazia ou incompleta**
**Causa:** Prompt muito longo ou configuração inadequada  
**Solução:**
1. Reduzir tamanho do prompt
2. Ajustar maxOutputTokens
3. Modificar temperature/topP

#### **4. Conteúdo filtrado**
**Causa:** Safety filters bloquearam conteúdo  
**Solução:**
1. Revisar prompt para conteúdo inadequado
2. Ajustar safetySettings se necessário
3. Reformular assunto se muito polêmico

### **Comandos de Diagnóstico**
```javascript
// Testar API key
await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
  .then(r => r.json())
  .then(d => console.log('API Key válida:', !!d.models));

// Verificar rate limit
console.log('Rate limit status:', rateLimiter.canMakeRequest());

// Verificar uso de tokens
console.log('Usage stats:', usageMonitor.getDailyStats());
```

---

## 📚 **Recursos Adicionais**

### **Links Oficiais**
- [Google AI Studio](https://aistudio.google.com/)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Pricing Information](https://ai.google.dev/pricing)
- [Safety Settings Guide](https://ai.google.dev/docs/safety_setting_gemini)

### **Ferramentas de Desenvolvimento**
- [API Explorer](https://ai.google.dev/api/rest)
- [Prompt Gallery](https://ai.google.dev/examples)
- [Safety Classifier](https://ai.google.dev/docs/safety_classifier)

---

**Documentação criada:** Janeiro 2025  
**Última atualização:** Janeiro 2025  
**Versão:** 1.0  
**Próxima revisão:** Trimestral ou quando houver mudanças na API 