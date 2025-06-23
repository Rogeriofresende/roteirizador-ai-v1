# 🌐 Deploy em Produção - Roteirar-ia

> Guia completo para deploy do Roteirar-ia em produção com todas as configurações necessárias

## 📋 **Visão Geral**

Este documento detalha **passo a passo** como fazer o deploy do Roteirar-ia em produção, desde a configuração inicial até o monitoramento contínuo. Seguindo este guia, você terá uma aplicação **100% funcional** em produção.

---

## 🎯 **Pré-requisitos**

### **Contas Necessárias**
```
✅ OBRIGATÓRIAS:
□ Conta GitHub (repositório do código)
□ Conta Google Cloud (Gemini AI API)
□ Conta Firebase (autenticação + banco)
□ Conta Vercel/Netlify (hosting)

🔄 OPCIONAIS (mas recomendadas):
□ Domínio próprio (GoDaddy, Namecheap, etc.)
□ Conta Sentry (error tracking)
□ Conta Google Analytics (métricas)
```

### **Ferramentas Locais**
```bash
# Instalar se não tiver
npm install -g vercel-cli
npm install -g firebase-tools
git --version  # Verificar se Git está instalado
```

---

## 🚀 **ETAPA 1: Preparação do Código**

### **1.1 Verificar Build Local**
```bash
# No diretório do projeto
cd Roteirar-ia

# Instalar dependências
npm install

# Verificar se build funciona
npm run build

# Testar localmente
npm run preview
```

### **1.2 Configurar Variáveis de Ambiente**
```bash
# Criar arquivo de produção
cp .env.example .env.production

# Editar variáveis de produção
nano .env.production
```

**Configurar `.env.production`:**
```bash
# Produção - Roteirar-ia
NODE_ENV=production
VITE_APP_NAME="Roteirar-ia"
VITE_APP_VERSION="1.0.0"

# Google Gemini API (OBRIGATÓRIO)
VITE_GEMINI_API_KEY="AIza..." # Sua API key real

# Firebase Produção (OBRIGATÓRIO)
VITE_FIREBASE_API_KEY="AIza..."
VITE_FIREBASE_AUTH_DOMAIN="roteirar-ia-prod.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="roteirar-ia-prod"
VITE_FIREBASE_STORAGE_BUCKET="roteirar-ia-prod.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789"
VITE_FIREBASE_APP_ID="1:123456789:web:abc123"

# URLs de Produção
VITE_API_URL="https://roteirar-ia.com"
VITE_APP_URL="https://roteirar-ia.com"

# Analytics (OPCIONAL)
VITE_GA_TRACKING_ID="G-XXXXXXXXXX"
VITE_SENTRY_DSN="https://..."

# Features
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_REPORTING=true
VITE_DEBUG_MODE=false
```

---

## 🔥 **ETAPA 2: Configurar Firebase**

### **2.1 Criar Projeto Firebase**
```bash
# Login no Firebase
firebase login

# Criar projeto (ou usar existente)
firebase projects:create roteirar-ia-prod --display-name "Roteirar-ia Produção"

# Inicializar no diretório
firebase init
```

**Configurações do Firebase Init:**
```
? Which Firebase features? 
 ◉ Firestore
 ◉ Hosting  
 ◉ Storage
 ◉ Authentication

? Project: roteirar-ia-prod
? Firestore rules file: firestore.rules
? Firestore indexes file: firestore.indexes.json
? Public directory: dist
? Single-page app: Yes
? Overwrite index.html: No
```

### **2.2 Configurar Authentication**
```bash
# Acessar console Firebase
# https://console.firebase.google.com/

# Ir em Authentication > Sign-in method
# Ativar:
# - Email/Password ✅
# - Google ✅

# Configurar domínios autorizados:
# - localhost (desenvolvimento)
# - roteirar-ia.com (produção)
# - seu-dominio.vercel.app (se usando Vercel)
```

### **2.3 Configurar Firestore**
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuários podem acessar apenas seus dados
    match /users/{userId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == userId;
    }

    // Scripts do usuário
    match /scripts/{scriptId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null 
        && request.auth.uid == request.resource.data.userId;
    }

    // Analytics - apenas leitura para usuários
    match /analytics/{docId} {
      allow read: if request.auth != null;
      allow write: if false; // Apenas server-side
    }
  }
}
```

```bash
# Deploy das regras
firebase deploy --only firestore:rules
```

---

## ⚡ **ETAPA 3: Deploy no Vercel**

### **3.1 Preparar para Vercel**
```bash
# Login no Vercel
vercel login

# Configurar projeto
vercel
```

**Configurações do Vercel:**
```
? Set up and deploy? Yes
? Which scope? Sua conta
? What's your project's name? roteirar-ia
? In which directory is your code located? ./
? Want to override the settings? Yes

Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### **3.2 Configurar Environment Variables**
```bash
# Adicionar variáveis de ambiente no Vercel
vercel env add VITE_GEMINI_API_KEY
vercel env add VITE_FIREBASE_API_KEY
vercel env add VITE_FIREBASE_AUTH_DOMAIN
vercel env add VITE_FIREBASE_PROJECT_ID
# ... adicionar todas as variáveis necessárias
```

### **3.3 Configurar vercel.json**
```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://generativelanguage.googleapis.com https://*.firebaseapp.com https://*.firebase.googleapis.com; frame-src https://www.google.com;"
        }
      ]
    }
  ]
}
```

### **3.4 Deploy Final**
```bash
# Deploy para produção
vercel --prod

# Verificar deployment
curl -I https://seu-projeto.vercel.app
```

---

## 🌍 **ETAPA 4: Configurar Domínio Próprio**

### **4.1 Comprar Domínio (Opcional)**
```
Recomendações:
- Namecheap.com (barato e confiável)
- GoDaddy.com (popular)
- Cloudflare.com (com CDN incluso)

Sugestões de domínio:
- roteirar-ia.com
- roteirizador.app
- scriptai.com.br
```

### **4.2 Configurar DNS no Vercel**
```bash
# Adicionar domínio customizado
vercel domains add roteirar-ia.com

# Configurar DNS (no painel do registrador)
# Adicionar registro CNAME:
# Nome: @
# Valor: cname.vercel-dns.com
```

### **4.3 Verificar SSL**
```bash
# Verificar certificado SSL
curl -I https://roteirar-ia.com

# Deve retornar:
# HTTP/2 200
# server: Vercel
```

---

## 📊 **ETAPA 5: Configurar Monitoramento**

### **5.1 Google Analytics**
```html
<!-- Adicionar em index.html -->
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### **5.2 Error Tracking (Sentry)**
```bash
# Instalar Sentry
npm install @sentry/react @sentry/tracing

# Configurar em main.tsx
```

```typescript
// src/main.tsx
import * as Sentry from "@sentry/react";

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: "production",
    tracesSampleRate: 0.1,
  });
}
```

### **5.3 Health Check Endpoint**
```typescript
// src/utils/health.ts
export const healthCheck = async (): Promise<HealthStatus> => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: import.meta.env.VITE_APP_VERSION,
    environment: import.meta.env.NODE_ENV,
    services: {
      gemini: await checkGeminiAPI(),
      firebase: await checkFirebase()
    }
  };
};

// Adicionar rota /health
```

---

## 🔒 **ETAPA 6: Configurações de Segurança**

### **6.1 Security Headers (já configurado no vercel.json)**
```
✅ X-Frame-Options: DENY
✅ X-Content-Type-Options: nosniff  
✅ Referrer-Policy: strict-origin-when-cross-origin
✅ Strict-Transport-Security: max-age=31536000
✅ Content-Security-Policy: configurado
```

### **6.2 Firebase Security Rules**
```javascript
// Regras já configuradas na Etapa 2.3
// Verificar se estão ativas:
firebase deploy --only firestore:rules
```

### **6.3 Rate Limiting**
```typescript
// Já implementado no código
// Verificar se está funcionando:
// - 10 requests/minuto por usuário
// - Logs de rate limiting no Firestore
```

---

## ✅ **ETAPA 7: Testes de Produção**

### **7.1 Smoke Tests**
```bash
# Criar script de teste
cat > scripts/smoke-test.sh << 'EOF'
#!/bin/bash

URL=${1:-https://roteirar-ia.com}

echo "🧪 Executando smoke tests em $URL"

# Test 1: Homepage carrega
echo "Test 1: Homepage..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL")
if [ $STATUS -eq 200 ]; then
  echo "✅ Homepage OK ($STATUS)"
else
  echo "❌ Homepage FAIL ($STATUS)"
  exit 1
fi

# Test 2: Health check
echo "Test 2: Health check..."
HEALTH=$(curl -s "$URL/health" | jq -r '.status' 2>/dev/null || echo "error")
if [ "$HEALTH" = "ok" ]; then
  echo "✅ Health check OK"
else
  echo "❌ Health check FAIL"
  exit 1
fi

# Test 3: Assets carregam
echo "Test 3: Assets..."
ASSETS=$(curl -s -o /dev/null -w "%{http_code}" "$URL/assets/index.js")
if [ $ASSETS -eq 200 ]; then
  echo "✅ Assets OK ($ASSETS)"
else
  echo "⚠️ Assets WARNING ($ASSETS)"
fi

echo "🎉 Smoke tests completed!"
EOF

chmod +x scripts/smoke-test.sh

# Executar testes
./scripts/smoke-test.sh https://roteirar-ia.com
```

### **7.2 User Journey Tests**
```
Manual Tests Checklist:

□ Homepage carrega corretamente
□ Botão "Gerar Roteiro" está visível
□ Modal de API key abre quando necessário
□ Campo de assunto aceita texto
□ Seletor de plataforma funciona
□ Geração de roteiro funciona (com API key válida)
□ Resultado aparece na tela
□ Botão de copiar funciona
□ Responsividade mobile funciona
□ Links de documentação funcionam
```

### **7.3 Performance Tests**
```bash
# Lighthouse CI
npm install -g @lhci/cli

# Executar audit
lhci autorun --upload.target=temporary-public-storage

# Ou manual:
lighthouse https://roteirar-ia.com --output=html --output-path=./lighthouse-report.html
```

---

## 📋 **CHECKLIST DE DEPLOY**

### **Pré-Deploy**
```
□ Código testado localmente
□ Build funciona sem erros
□ Variáveis de ambiente configuradas
□ Firebase configurado e testado
□ Security headers configurados
□ Analytics configurado
□ Error tracking configurado
```

### **Durante Deploy**
```
□ Deploy executado com sucesso
□ DNS propagado (se domínio próprio)
□ SSL ativo e funcionando
□ Smoke tests passando
□ Health check respondendo
□ Analytics coletando dados
```

### **Pós-Deploy**
```
□ User journey tests executados
□ Performance audit realizado
□ Error tracking funcionando
□ Monitoramento ativo
□ Documentação atualizada
□ Equipe notificada
```

---

## 🚨 **Troubleshooting**

### **Problemas Comuns**

**Build fails:**
```bash
# Limpar cache
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# Verificar variáveis de ambiente
echo $VITE_GEMINI_API_KEY
```

**Firebase connection error:**
```bash
# Verificar configuração
firebase projects:list
firebase use roteirar-ia-prod

# Testar regras
firebase firestore:rules:test
```

**Domain not working:**
```bash
# Verificar DNS
dig roteirar-ia.com
nslookup roteirar-ia.com

# Verificar Vercel
vercel domains ls
```

**SSL issues:**
```bash
# Forçar renovação SSL no Vercel
vercel certs issue roteirar-ia.com

# Verificar configuração
curl -I https://roteirar-ia.com
```

---

## 📊 **Monitoramento Contínuo**

### **Métricas a Acompanhar**
```
Performance:
- Page load time < 3s
- First contentful paint < 1.5s
- Lighthouse score > 90

Funcionalidade:
- Script generation success rate > 95%
- API error rate < 5%
- User journey completion rate

Negócio:
- Daily active users
- Scripts generated per day
- User retention rate
```

### **Alerts Configurados**
```
🚨 CRITICAL:
- Site down (response time > 30s)
- Error rate > 10%
- Failed deployments

⚠️ WARNING:
- Performance degradation > 20%
- Error rate > 5%
- High API usage
```

---

## 📚 **Recursos Úteis**

### **Comandos de Manutenção**
```bash
# Verificar status
vercel ls
firebase projects:list

# Logs
vercel logs roteirar-ia.com
firebase functions:log

# Re-deploy
vercel --prod
firebase deploy
```

### **Backup Procedures**
```bash
# Backup Firestore
firebase firestore:export gs://roteirar-ia-backup/$(date +%Y%m%d)

# Backup código
git tag v1.0.0
git push origin v1.0.0
```

---

## 🎯 **Próximos Passos Pós-Deploy**

1. **Beta Testing** - Convidar 5-10 usuários
2. **Feedback Collection** - Implementar formulário
3. **Performance Optimization** - Baseado em métricas reais
4. **Feature Expansion** - Baseado em feedback
5. **Marketing** - Product Hunt, redes sociais

---

**Documentação criada:** Janeiro 2025  
**Status:** ✅ PRONTO PARA PRODUÇÃO  
**Próxima revisão:** Após primeiro deploy  
**Versão:** 1.0

---

## 📞 **Suporte de Deploy**

Em caso de problemas:
1. Verificar este documento primeiro
2. Consultar [troubleshooting](../operations/troubleshooting.md)
3. Verificar logs de deploy
4. Contatar suporte via GitHub Issues 