# 🎬 **Roteirizar IA - Gerador de Roteiros Inteligente**

> **Versão:** 2.1.2 | **Status:** ✅ Produção Ready | **Monitoramento:** Sistema Empresarial Completo

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/Rogeriofresende/roteirizador-ai-v1)
[![Coverage](https://img.shields.io/badge/coverage-95%25-brightgreen)](https://github.com/Rogeriofresende/roteirizador-ai-v1)
[![Monitoring](https://img.shields.io/badge/monitoring-enterprise-blue)](https://github.com/Rogeriofresende/roteirizador-ai-v1)
[![PWA Ready](https://img.shields.io/badge/PWA-ready-purple)](https://github.com/Rogeriofresende/roteirizador-ai-v1)

---

## 🚀 **Sistema Completo com Monitoramento Empresarial**

**Roteirizar IA** é uma aplicação web Progressive Web App (PWA) que utiliza Google Gemini AI para gerar roteiros personalizados para diferentes plataformas de mídia social. **Agora com sistema de monitoramento empresarial completo!**

### **✨ Novidades da Versão 2.1.2**
- 🔍 **Health Checks Automáticos**: 4 verificações críticas em tempo real
- 📊 **Analytics Empresarial**: Google Analytics 4 + Business Intelligence
- 🎛️ **Dashboard Operacional**: Interface completa de monitoramento
- 🚨 **Alertas Automáticos**: Notificações críticas com cooldown inteligente
- ⌨️ **Atalhos Avançados**: `Ctrl+Shift+D` para dashboard instantâneo

---

## 🎯 **Principais Funcionalidades**

### **🤖 Geração de Roteiros com IA**
- Roteiros personalizados para YouTube, Instagram, TikTok, LinkedIn
- Múltiplos tons: profissional, casual, educativo, engraçado
- Segmentação por público-alvo específico
- Duração configurável dos conteúdos

### **🔍 Sistema de Monitoramento (NOVO)**
- **Health Checks**: Gemini API, Firebase, Performance, Storage
- **Analytics Real-time**: Conversão, performance, métricas de negócio
- **Dashboard Visual**: Status, alertas, exports, debugging
- **Alertas Críticos**: Notificações automáticas de problemas

### **👤 Gestão de Usuários**
- Autenticação Firebase (email/senha + Google)
- Dashboard personalizado de usuário
- Histórico de roteiros gerados
- Configurações personalizáveis

### **📱 Progressive Web App**
- Instalação nativa no dispositivo
- Funcionamento offline
- Notificações push
- Interface responsiva

---

## 🛠️ **Stack Tecnológica**

### **Frontend**
- ⚛️ **React 18** + TypeScript
- 🎨 **Tailwind CSS** + Tailwind Animate
- 🖼️ **Radix UI** (componentes acessíveis)
- 🎭 **Framer Motion** (animações)
- 📱 **PWA** (Vite PWA Plugin)

### **Backend/Services**
- 🔥 **Firebase** (Auth + Firestore)
- 🤖 **Google Gemini AI** (geração de conteúdo)
- 📊 **Google Analytics 4** (analytics empresarial)
- 🔍 **Custom Health Checks** (monitoramento)

### **DevOps**
- ⚡ **Vite** (build tool)
- 🚀 **Vercel** (deploy)
- 🧪 **Jest + Playwright** (testing)
- 📝 **ESLint + TypeScript** (quality)

---

## 📊 **Sistema de Monitoramento Empresarial**

### **🔍 Health Checks Automáticos**
```typescript
✅ Gemini API (40% peso)    - Conectividade e API key
✅ Firebase (30% peso)      - Auth e Firestore  
✅ Performance (20% peso)   - Memória e carregamento
✅ Storage (10% peso)       - localStorage e PWA
```

### **📈 Analytics de Negócio**
```typescript
✅ Taxa de Conversão        - Meta: >60%
✅ Tempo de Geração         - Meta: <10s
✅ Taxa de Erro            - Meta: <5%
✅ Web Vitals              - Google Core Web Vitals
```

### **🎛️ Dashboard Operacional**
- **Acesso**: `Ctrl + Shift + D` ou click no status na navbar
- **Features**: Status visual, export JSON, comandos debug
- **Auto-refresh**: A cada 30 segundos
- **Alertas**: Histórico e clear manual

### **📱 Status Indicator**
- 🟢 **HEALTHY** (70-100%): Sistema funcionando perfeitamente
- 🟡 **DEGRADED** (40-69%): Alguns problemas, não críticos  
- 🔴 **DOWN** (0-39%): Problemas sérios, atenção necessária

---

## ⚡ **Quick Start**

### **1. Configuração Básica**
```bash
# Clone do repositório
git clone https://github.com/Rogeriofresende/roteirizador-ai-v1.git
cd roteirizador-ai-v1

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local com suas chaves
```

### **2. Variáveis de Ambiente (.env.local)**
```bash
# OBRIGATÓRIO - Google Analytics 4
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# OBRIGATÓRIO - Firebase
VITE_FIREBASE_API_KEY=sua_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu_projeto_id
VITE_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

# OPCIONAL - Alertas externos
VITE_ALERT_WEBHOOK_URL=https://webhook.site/sua-url
VITE_DEBUG_MODE=true
```

### **3. Desenvolvimento**
```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview

# Executar testes
npm run test
npm run test:e2e
```

### **4. Configurar Google Analytics 4**
1. Acesse [Google Analytics](https://analytics.google.com/)
2. Crie uma propriedade GA4
3. Copie o Measurement ID (formato: G-XXXXXXXXXX)
4. Configure no `.env.local`

---

## 📚 **Documentação Completa**

### **Documentação Operacional**
- 📖 [**Guia Operacional de Produção**](docs/operations/GUIA_OPERACIONAL_PRODUCAO.md)
- 🎯 [**Sistema de Monitoramento**](docs/SISTEMA_MONITORAMENTO_IMPLEMENTADO.md)
- 🔧 [**Documentação Técnica Completa**](docs/DOCUMENTACAO_TECNICA_COMPLETA.md)

### **Documentação de Desenvolvimento**
- ⚙️ [**Setup de Desenvolvimento**](docs/developer-guide/setup.md)
- 🧪 [**Testes E2E**](docs/developer-guide/RELATORIO_TESTES_E2E.md)
- 📱 [**PWA Development**](docs/developer-guide/pwa-development.md)

### **Documentação de API**
- 🤖 [**Integração Gemini**](docs/api/gemini-integration.md)
- 🔥 [**Setup Firebase**](docs/api/firebase-setup.md)
- 🌐 [**APIs Externas**](docs/api/external-apis.md)

---

## 🎛️ **Como Usar o Sistema de Monitoramento**

### **Acesso Rápido**
```bash
# Dashboard operacional
Ctrl + Shift + D

# Console commands
healthCheck.getHealth()          # Status completo
analytics.getSessionData()      # Analytics da sessão
analytics.exportAnalyticsData() # Export completo
```

### **Interpretação de Status**
- **Status na Navbar**: Sempre visível (verde/amarelo/vermelho)
- **Score do Sistema**: 0-100% com pesos diferenciados
- **Alertas Automáticos**: Cooldown de 5min para evitar spam
- **Export de Dados**: JSON completo para análise

### **Comandos de Debug**
```javascript
// Health checks
healthCheck.getLastResults()     // Último resultado
healthCheck.getAlerts()         // Lista de alertas
healthCheck.clearAlerts()       // Limpar alertas

// Analytics
analytics.getConversionRate()   // Taxa de conversão
analytics.getDebugInfo()        // Info de debug
performance.memory              // Memória do browser
```

---

## 🚀 **Deploy e Produção**

### **Deploy na Vercel (Recomendado)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Configurar environment variables na Vercel dashboard
```

### **Build Otimizado**
```bash
npm run build

# Saída esperada:
dist/
├── index.html                  # ~4KB
├── assets/
│   ├── index-[hash].css       # ~2KB
│   └── index-[hash].js        # ~2MB
└── manifest.json              # PWA manifest
```

### **Environment Variables Produção**
```bash
# Na Vercel dashboard
VITE_GA_MEASUREMENT_ID=G-REAL_ID
VITE_FIREBASE_PROJECT_ID=projeto_real
# ... outras variáveis
```

---

## 🔍 **Monitoring & Analytics**

### **Métricas de Negócio**
```typescript
✅ Taxa de Conversão: (Scripts / PageViews) × 100
   🎯 Meta: >60% | 🔥 Excelente: >80% | ⚠️ Atenção: <40%

✅ Tempo de Geração: Média de tempo de resposta
   🎯 Meta: <10s | ⚡ Excelente: <5s | ⚠️ Lento: >15s

✅ Taxa de Erro: (Erros / Tentativas) × 100  
   🎯 Meta: <5% | ✅ Ótimo: <2% | ⚠️ Problema: >10%
```

### **Web Vitals Automáticos**
- **CLS** (Cumulative Layout Shift): <0.1
- **FID** (First Input Delay): <100ms
- **LCP** (Largest Contentful Paint): <2.5s
- **FCP** (First Contentful Paint): <1.8s
- **TTFB** (Time to First Byte): <800ms

### **Health Check Scoring**
```typescript
Score = (GEMINI_API × 0.4) + (FIREBASE × 0.3) + 
        (PERFORMANCE × 0.2) + (STORAGE × 0.1)

Status:
- 70-100%: HEALTHY   (🟢)
- 40-69%:  DEGRADED  (🟡)  
- 0-39%:   DOWN      (🔴)
```

---

## 🧪 **Testing**

### **Testes Unitários**
```bash
npm run test                    # Jest tests
npm run test:coverage          # Coverage report
```

### **Testes E2E**
```bash
npm run test:e2e               # Playwright E2E
npm run test:e2e:ui            # Interactive UI
```

### **Testing Checklist**
```bash
✅ Health checks funcionando
✅ Dashboard abre com Ctrl+Shift+D  
✅ Status indicator na navbar
✅ Analytics tracking events
✅ Export de dados funciona
✅ Alertas disparam corretamente
✅ Build success
✅ PWA installable
```

---

## 📦 **Dependências Principais**

### **Core Dependencies**
```json
{
  "@google/generative-ai": "^0.21.0",
  "firebase": "^10.13.2",
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^6.26.2",
  "web-vitals": "^4.2.4"
}
```

### **UI & Animation**
```json
{
  "@radix-ui/react-*": "^1.1.14+",
  "framer-motion": "^11.11.17",
  "lucide-react": "^0.523.0",
  "tailwindcss": "^3.4.13",
  "class-variance-authority": "^0.7.1"
}
```

---

## 🤝 **Contribuição**

### **Como Contribuir**
1. Fork do projeto
2. Criar feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit das mudanças (`git commit -m 'Add AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

### **Padrões de Código**
- **TypeScript**: Tipagem estrita
- **ESLint**: Regras configuradas
- **Prettier**: Formatação automática
- **Conventional Commits**: Padrão de commits

### **Testing Requirements**
- Testes unitários para novas features
- Testes E2E para fluxos críticos
- Coverage mínimo: 80%

---

## 📞 **Suporte**

### **Reporting Issues**
1. Abrir dashboard (`Ctrl+Shift+D`)
2. Exportar dados do sistema
3. Incluir screenshot da dashboard
4. Descrever passos para reproduzir
5. Abrir issue no GitHub

### **Debug Commands**
```javascript
// Status rápido
healthCheck.getLastResults()?.overall

// Analytics completo  
analytics.exportAnalyticsData()

// Reset completo (emergência)
localStorage.clear(); location.reload();
```

### **Links Úteis**
- 📊 [Google Analytics Dashboard](https://analytics.google.com/)
- 🔥 [Firebase Console](https://console.firebase.google.com/)
- 🤖 [Google AI Studio](https://makersuite.google.com/)

---

## 📄 **Licença**

Este projeto está licenciado sob a MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 🙏 **Agradecimentos**

- **Google Gemini AI** - Engine de geração de conteúdo
- **Firebase** - Backend-as-a-Service
- **Vercel** - Platform de deploy
- **React Team** - Framework frontend
- **Tailwind CSS** - Framework de estilos

---

## 📈 **Roadmap**

### **Versão 2.2.0 (Próxima)**
- 📧 Email alerts automáticos
- 💬 Slack/Discord integration
- 🔄 Real-time monitoring
- 📊 Advanced analytics

### **Versão 2.3.0 (Futuro)**
- 🤖 AI-powered insights
- 📈 Predictive analytics  
- 🔍 Anomaly detection
- 📱 Mobile app

---

**🚀 Sistema pronto para produção com monitoramento empresarial completo!**

**Próximo passo:** Configure o Google Analytics 4 e teste o dashboard com `Ctrl+Shift+D`

---

**Criado com ❤️ por [Rogerio Resende](https://github.com/Rogeriofresende)**  
**© 2025 Roteirizar IA - Sistema de Monitoramento Empresarial** 