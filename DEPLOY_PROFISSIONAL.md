# 🚀 DEPLOY PROFISSIONAL VIA GITHUB

## 📋 **OPÇÕES DISPONÍVEIS**

### 🌟 **1. VERCEL (RECOMENDADO)**
**✅ Melhor para React/Next.js**
- Deploy automático via GitHub
- Edge network global (CDN)
- SSL grátis + domínio customizado
- Preview deploys em PRs
- Zero configuração

### 🏠 **2. HOSTINGER (roteiropro.com)**
**✅ Usando seu domínio existente**
- Deploy via GitHub Actions + FTP
- Controle total do servidor
- SSL configurado
- Performance otimizada

### 🌐 **3. NETLIFY**
**✅ Alternativa ao Vercel**
- Deploy automático
- Forms handling
- Functions serverless
- Edge functions

---

## 🎯 **CONFIGURAÇÃO PASSO A PASSO**

### **OPÇÃO 1: VERCEL (MAIS FÁCIL)**

#### **1.1 - Criar Repositório GitHub**
```bash
# Já criamos o commit local, agora precisamos:
git remote add origin https://github.com/SEU_USUARIO/roteirizaria.git
git push -u origin main
```

#### **1.2 - Conectar com Vercel**
1. Acesse [vercel.com](https://vercel.com)
2. Login com GitHub
3. Import repository: `roteirizaria`
4. Framework: **Vite** (auto-detectado)
5. Deploy!

#### **1.3 - Configurar Domínio Customizado**
1. Vercel Dashboard → Project → Settings → Domains
2. Adicionar: `roteiropro.com`
3. Configurar DNS no Hostinger:
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```

#### **1.4 - Variáveis de Ambiente**
Adicionar no Vercel:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_GEMINI_API_KEY=your_gemini_key
```

---

### **OPÇÃO 2: HOSTINGER (MANUAL)**

#### **2.1 - Upload via FTP**
1. Painel Hostinger → File Manager
2. Upload `roteiropro-deploy.zip`
3. Extrair em `public_html/`
4. Verificar `.htaccess`

#### **2.2 - Deploy Automático (Avançado)**
Configurar GitHub Actions com credenciais FTP:
```yaml
# Secrets no GitHub:
HOSTINGER_FTP_HOST=ftp.hostinger.com
HOSTINGER_FTP_USER=seu_usuario
HOSTINGER_FTP_PASSWORD=sua_senha
```

---

## 🔧 **CONFIGURAÇÕES AVANÇADAS**

### **Performance Otimizations**

#### **Vercel (vercel.json)**
```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "functions": {
    "app/**/*": {
      "runtime": "nodejs18.x"
    }
  },
  "routes": [
    {
      "src": "/manifest.json",
      "dest": "/manifest.json",
      "headers": {
        "cache-control": "public, max-age=604800"
      }
    },
    {
      "src": "/sw.js",
      "dest": "/sw.js",
      "headers": {
        "cache-control": "public, max-age=0"
      }
    },
    {
      "src": "/assets/(.*)",
      "dest": "/assets/$1",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      }
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### **PWA Optimizations**
```json
{
  "cleanUrls": true,
  "trailingSlash": false,
  "rewrites": [
    {
      "source": "/offline",
      "destination": "/offline.html"
    }
  ]
}
```

---

## 🔐 **VARIÁVEIS DE AMBIENTE**

### **Desenvolvimento (.env.local)**
```env
VITE_FIREBASE_API_KEY=development_key
VITE_FIREBASE_AUTH_DOMAIN=dev-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=dev-project
VITE_GEMINI_API_KEY=dev_gemini_key
VITE_APP_ENV=development
```

### **Produção (Vercel/Hostinger)**
```env
VITE_FIREBASE_API_KEY=production_key
VITE_FIREBASE_AUTH_DOMAIN=roteirizaria.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=roteirizaria-prod
VITE_GEMINI_API_KEY=prod_gemini_key
VITE_APP_ENV=production
```

---

## 📊 **MONITORAMENTO E ANALYTICS**

### **Vercel Analytics**
```typescript
// Adicionar ao main.tsx
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <>
      <YourApp />
      <Analytics />
    </>
  );
}
```

### **Performance Monitoring**
```typescript
// hooks/usePerformance.ts
export const usePerformance = () => {
  useEffect(() => {
    // Web Vitals tracking
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(console.log);
      getFID(console.log);
      getFCP(console.log);
      getLCP(console.log);
      getTTFB(console.log);
    });
  }, []);
};
```

---

## 🚨 **TROUBLESHOOTING**

### **Problema: Build falha no deploy**
```bash
# Verificar locally
npm run build

# Limpar cache
npm ci
rm -rf dist node_modules
npm install
npm run build
```

### **Problema: PWA não funciona**
```javascript
// Verificar service worker registration
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(reg => console.log('SW registered', reg))
    .catch(err => console.log('SW registration failed', err));
}
```

### **Problema: Rotas 404**
Verificar:
- Vercel: `vercel.json` com fallback para `/index.html`
- Hostinger: `.htaccess` com RewriteRule

---

## 🎯 **PRÓXIMOS PASSOS**

### **Imediato**
1. ✅ Criar repositório no GitHub
2. ✅ Conectar com Vercel
3. ✅ Deploy automático ativo

### **Configurações Avançadas**
1. 🔧 Domínio customizado (`roteiropro.com`)
2. 📊 Analytics e monitoring
3. 🔒 Security headers
4. ⚡ Performance optimization

### **Manutenção**
1. 🔄 CI/CD pipeline completo
2. 🧪 Testes automáticos
3. 📈 Monitoring de performance
4. 🚨 Error tracking

---

## 📞 **SUPORTE**

### **Vercel**
- Docs: [vercel.com/docs](https://vercel.com/docs)
- Discord: Vercel Community
- GitHub: vercel/vercel

### **Hostinger**
- Suporte: Painel de controle
- Docs: help.hostinger.com
- Chat: Suporte 24/7

---

**🎉 RESULTADO FINAL**: Site profissional rodando em `https://roteiropro.com` com deploy automático via GitHub!

**📅 Data**: 23 de Junho de 2025  
**Status**: ✅ Configuração Profissional Pronta 