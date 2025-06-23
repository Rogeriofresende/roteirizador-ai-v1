# 🔗 Webhooks & Integrações - Roteirar-ia

> Documentação de webhooks e integrações com serviços externos

## 📋 **Visão Geral**

Sistema de webhooks para integrações futuras e notificações em tempo real.

**Status Atual:** 🔄 Planejado (implementação futura)  
**Prioridade:** Baixa (após funcionalidades core)

---

## 🎯 **Webhooks Planejados**

### **1. Notificações de Sistema**
```typescript
interface SystemWebhook {
  event: 'system.health' | 'system.error' | 'system.maintenance';
  payload: {
    timestamp: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    details?: any;
  };
  destinations: string[]; // URLs de destino
}
```

### **2. Eventos de Usuário**
```typescript
interface UserWebhook {
  event: 'user.registered' | 'user.script_generated' | 'user.limit_reached';
  payload: {
    userId: string;
    timestamp: string;
    data: any;
  };
  destinations: string[];
}
```

### **3. Integrações Externas**
```typescript
interface IntegrationWebhook {
  event: 'integration.success' | 'integration.failure' | 'integration.timeout';
  payload: {
    service: string;
    operation: string;
    timestamp: string;
    result?: any;
    error?: string;
  };
}
```

---

## 🔧 **Implementação Técnica**

### **Webhook Manager**
```typescript
class WebhookManager {
  private endpoints = new Map<string, WebhookEndpoint>();
  
  async send(event: string, payload: any): Promise<void> {
    const endpoints = this.getEndpointsForEvent(event);
    
    await Promise.allSettled(
      endpoints.map(endpoint => this.sendToEndpoint(endpoint, {
        event,
        payload,
        timestamp: new Date().toISOString(),
        id: this.generateId()
      }))
    );
  }
  
  private async sendToEndpoint(endpoint: WebhookEndpoint, data: any) {
    const response = await fetch(endpoint.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': this.generateSignature(data, endpoint.secret),
        'User-Agent': 'Roteirar-ia/1.0'
      },
      body: JSON.stringify(data),
      timeout: 30000
    });
    
    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status}`);
    }
  }
}
```

### **Security & Verification**
```typescript
const generateSignature = (payload: any, secret: string): string => {
  const crypto = require('crypto');
  return crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
};

const verifySignature = (payload: string, signature: string, secret: string): boolean => {
  const expectedSignature = generateSignature(payload, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
};
```

---

## 🔗 **Integrações Planejadas**

### **Slack Integration**
```typescript
const slackWebhook = {
  url: process.env.SLACK_WEBHOOK_URL,
  events: ['system.error', 'user.limit_reached'],
  formatter: (event: string, payload: any) => ({
    text: `🚨 ${event}`,
    attachments: [{
      color: event.includes('error') ? 'danger' : 'warning',
      fields: [
        { title: 'Timestamp', value: payload.timestamp, short: true },
        { title: 'Details', value: JSON.stringify(payload, null, 2) }
      ]
    }]
  })
};
```

### **Discord Integration**
```typescript
const discordWebhook = {
  url: process.env.DISCORD_WEBHOOK_URL,
  events: ['system.health', 'user.registered'],
  formatter: (event: string, payload: any) => ({
    embeds: [{
      title: `Roteirar-ia: ${event}`,
      description: payload.message || 'Event triggered',
      color: 0x00ff00,
      timestamp: payload.timestamp,
      fields: Object.entries(payload).map(([key, value]) => ({
        name: key,
        value: String(value),
        inline: true
      }))
    }]
  })
};
```

### **Email Notifications**
```typescript
const emailWebhook = {
  service: 'sendgrid', // ou 'mailgun', 'ses'
  events: ['system.critical', 'user.important'],
  template: {
    from: 'noreply@roteirar-ia.com',
    subject: (event: string) => `[Roteirar-ia] ${event}`,
    html: (payload: any) => `
      <h2>Notificação do Sistema</h2>
      <p><strong>Evento:</strong> ${payload.event}</p>
      <p><strong>Horário:</strong> ${payload.timestamp}</p>
      <p><strong>Detalhes:</strong></p>
      <pre>${JSON.stringify(payload.data, null, 2)}</pre>
    `
  }
};
```

---

## 📊 **Monitoring & Analytics**

### **Webhook Analytics**
```typescript
interface WebhookAnalytics {
  totalSent: number;
  successRate: number;
  averageResponseTime: number;
  failuresByEndpoint: Map<string, number>;
  eventDistribution: Map<string, number>;
}

class WebhookAnalytics {
  track(event: string, endpoint: string, success: boolean, responseTime: number) {
    // Implementar tracking de métricas
  }
  
  generateReport(): WebhookAnalytics {
    // Gerar relatório de performance
  }
}
```

### **Health Monitoring**
```typescript
const webhookHealthCheck = async (): Promise<boolean> => {
  try {
    // Testar endpoints críticos
    const testPayload = { test: true, timestamp: new Date().toISOString() };
    
    const results = await Promise.allSettled([
      fetch(slackWebhook.url, { method: 'POST', body: JSON.stringify(testPayload) }),
      fetch(discordWebhook.url, { method: 'POST', body: JSON.stringify(testPayload) })
    ]);
    
    return results.some(result => result.status === 'fulfilled');
  } catch (error) {
    console.error('Webhook health check failed:', error);
    return false;
  }
};
```

---

## 🔄 **Retry & Error Handling**

### **Retry Logic**
```typescript
const retryWebhook = async (
  endpoint: string,
  payload: any,
  maxAttempts: number = 3
): Promise<void> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await sendWebhook(endpoint, payload);
      return; // Success
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < maxAttempts) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // All attempts failed
  await logWebhookFailure(endpoint, payload, lastError);
};
```

### **Dead Letter Queue**
```typescript
class DeadLetterQueue {
  private failedWebhooks: Array<{
    endpoint: string;
    payload: any;
    error: string;
    timestamp: string;
    attempts: number;
  }> = [];
  
  add(endpoint: string, payload: any, error: string): void {
    this.failedWebhooks.push({
      endpoint,
      payload,
      error,
      timestamp: new Date().toISOString(),
      attempts: 0
    });
  }
  
  async retryAll(): Promise<void> {
    const toRetry = this.failedWebhooks.splice(0);
    
    for (const item of toRetry) {
      try {
        await sendWebhook(item.endpoint, item.payload);
      } catch (error) {
        item.attempts++;
        if (item.attempts < 5) {
          this.failedWebhooks.push(item); // Re-queue
        }
      }
    }
  }
}
```

---

## 🛠️ **Configuração de Desenvolvimento**

### **Local Testing**
```typescript
// webhook-test-server.js
const express = require('express');
const app = express();

app.use(express.json());

app.post('/webhook/test', (req, res) => {
  console.log('Webhook received:', {
    headers: req.headers,
    body: req.body,
    timestamp: new Date().toISOString()
  });
  
  res.status(200).json({ received: true });
});

app.listen(3001, () => {
  console.log('Webhook test server running on http://localhost:3001');
});
```

### **Environment Configuration**
```bash
# .env.local
WEBHOOK_SLACK_URL=https://hooks.slack.com/services/...
WEBHOOK_DISCORD_URL=https://discord.com/api/webhooks/...
WEBHOOK_SECRET=your-webhook-secret-key
WEBHOOK_ENABLED=true
WEBHOOK_RETRY_ATTEMPTS=3
WEBHOOK_TIMEOUT=30000
```

---

## 📚 **Future Integrations**

### **Planned Services**
```typescript
const futureIntegrations = {
  zapier: {
    description: 'Trigger automations based on user actions',
    priority: 'medium',
    complexity: 'low'
  },
  
  notion: {
    description: 'Save scripts to Notion databases',
    priority: 'low',
    complexity: 'medium'
  },
  
  airtable: {
    description: 'Content management workflows',
    priority: 'low',
    complexity: 'medium'
  },
  
  googleSheets: {
    description: 'Export scripts and analytics',
    priority: 'medium',
    complexity: 'low'
  },
  
  trello: {
    description: 'Content planning integration',
    priority: 'low',
    complexity: 'low'
  }
};
```

### **Third-party Webhook Receivers**
```typescript
const webhookReceivers = {
  github: {
    url: '/webhook/github',
    events: ['push', 'pull_request'],
    purpose: 'Deploy triggers and documentation updates'
  },
  
  stripe: {
    url: '/webhook/stripe',
    events: ['payment.succeeded', 'subscription.updated'],
    purpose: 'Handle subscription changes'
  },
  
  sendgrid: {
    url: '/webhook/sendgrid',
    events: ['delivered', 'bounce', 'click'],
    purpose: 'Email delivery tracking'
  }
};
```

---

## 🔒 **Security Considerations**

### **Best Practices**
```typescript
const securityChecklist = [
  'Always verify webhook signatures',
  'Use HTTPS only for webhook URLs',
  'Implement rate limiting',
  'Log all webhook activities',
  'Rotate webhook secrets regularly',
  'Validate payload schemas',
  'Implement idempotency',
  'Set reasonable timeouts',
  'Monitor for suspicious activity'
];
```

### **Implementation Example**
```typescript
const secureWebhookHandler = async (req: Request, res: Response) => {
  // 1. Verify signature
  const signature = req.headers['x-webhook-signature'];
  if (!verifySignature(req.body, signature, WEBHOOK_SECRET)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // 2. Check rate limits
  if (!rateLimiter.check(req.ip)) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }
  
  // 3. Validate schema
  const validation = webhookSchema.validate(req.body);
  if (validation.error) {
    return res.status(400).json({ error: 'Invalid payload' });
  }
  
  // 4. Process webhook
  try {
    await processWebhook(req.body);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Processing failed' });
  }
};
```

---

## 📈 **Implementation Roadmap**

### **Phase 1: Core Infrastructure** (Futuro)
- [ ] Webhook manager implementation
- [ ] Basic security (signatures)
- [ ] Retry logic and error handling
- [ ] Local testing setup

### **Phase 2: Essential Integrations** (Futuro)
- [ ] Slack notifications
- [ ] Email alerts for critical events
- [ ] System health monitoring
- [ ] Analytics tracking

### **Phase 3: Advanced Features** (Futuro)
- [ ] Discord integration
- [ ] Third-party service webhooks
- [ ] Advanced analytics
- [ ] Custom webhook configurations

---

**Documentação criada:** Janeiro 2025  
**Última atualização:** Janeiro 2025  
**Versão:** 1.0  
**Status:** 🔄 Planejado para implementação futura 