# 🚀 GUIA DE DEPLOY - ROTEIROPRO.COM (HOSTINGER)

## 📋 **PRÉ-REQUISITOS COMPLETADOS**
- ✅ Build de produção gerado (`dist/`)
- ✅ Arquivo `.htaccess` configurado para SPA
- ✅ PWA completamente configurado
- ✅ Arquivo ZIP criado: `roteiropro-deploy.zip`

---

## 🎯 **INSTRUÇÕES DE DEPLOY NO HOSTINGER**

### **Passo 1: Acessar o File Manager**
1. Entre no painel do Hostinger
2. Vá em **"File Manager"** ou **"Gerenciador de Arquivos"**
3. Navegue até a pasta `public_html` do domínio `roteiropro.com`

### **Passo 2: Backup (Recomendado)**
```bash
# Se houver arquivos existentes, faça backup primeiro
# Baixe ou renomeie a pasta current antes de continuar
```

### **Passo 3: Upload dos Arquivos**
**Opção A - Upload do ZIP:**
1. Upload do arquivo `roteiropro-deploy.zip`
2. Extrair o ZIP diretamente na pasta `public_html`
3. Deletar o arquivo ZIP após extração

**Opção B - Upload Manual:**
1. Selecionar todos os arquivos da pasta `dist/`
2. Upload via drag & drop ou botão upload
3. Aguardar conclusão do upload

### **Passo 4: Verificar Estrutura de Arquivos**
A estrutura final deve ficar assim:
```
public_html/
├── .htaccess                 # ⭐ FUNDAMENTAL para SPA routing
├── index.html               # Página principal
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker
├── offline.html            # Página offline PWA
├── vite.svg               # Favicon
├── assets/
│   ├── index-k4RRUkjF.js  # JavaScript bundle
│   └── index-D0uoCqWm.css # CSS bundle
├── icons/                 # Ícones PWA (todos os tamanhos)
│   ├── icon-192x192.png
│   ├── icon-512x512.png
│   └── ... (outros tamanhos)
└── screenshots/           # Screenshots PWA
    ├── desktop-1.png
    └── mobile-1.png
```

---

## ⚙️ **CONFIGURAÇÕES IMPORTANTES**

### **1. Verificar Permissões**
- Certifique-se que o arquivo `.htaccess` tem permissão **644**
- Arquivos HTML/CSS/JS devem ter permissão **644**
- Pastas devem ter permissão **755**

### **2. DNS/Domínio**
Já configurado no Hostinger:
- ✅ `roteiropro.com` → Ativo
- ✅ Renovação automática ativa
- ✅ Nameservers: `ns1.dns-parking.com` / `ns2.dns-parking.com`

### **3. SSL Certificate**
- Verificar se o SSL está ativo para `https://roteiropro.com`
- Se não estiver, ativar nas configurações do domínio

---

## 🔧 **CONFIGURAÇÕES PWA ESPECÍFICAS**

### **Service Worker**
- ✅ Arquivo `sw.js` configurado
- ✅ Cache strategy implementada
- ✅ Offline functionality ativa

### **Manifest**
- ✅ `manifest.json` com todas as configurações
- ✅ Ícones em todos os tamanhos necessários
- ✅ Screenshots para app store

### **Performance**
- ✅ `.htaccess` com compressão GZIP
- ✅ Cache headers configurados
- ✅ Assets otimizados (230KB total)

---

## 🌐 **APÓS O DEPLOY**

### **1. Teste Imediato**
Acessar: `https://roteiropro.com`
- ✅ Site carrega corretamente
- ✅ Navegação entre páginas funciona
- ✅ PWA install prompt aparece

### **2. Testes PWA**
- ✅ Instalar PWA no celular/desktop
- ✅ Testar modo offline
- ✅ Verificar notificações

### **3. Performance Check**
- ✅ Google PageSpeed Insights
- ✅ PWA audit no Chrome DevTools
- ✅ Lighthouse score

---

## 🚨 **TROUBLESHOOTING**

### **Problema: Página em branco**
**Solução**: Verificar se o arquivo `.htaccess` foi uploadado corretamente

### **Problema: 404 em rotas internas**
**Solução**: 
```apache
# Adicionar ao .htaccess se não estiver funcionando:
Options -MultiViews
```

### **Problema: PWA não instala**
**Solução**: 
1. Verificar se está usando HTTPS
2. Verificar se `manifest.json` está acessível
3. Verificar se `sw.js` está registrado

### **Problema: Service Worker não funciona**
**Solução**:
1. Verificar MIME type: `AddType application/javascript .js`
2. Limpar cache do navegador
3. Hard refresh (Ctrl+F5)

---

## 📊 **INFORMAÇÕES TÉCNICAS**

### **Build Info**
- **Framework**: Vite 6.3.5
- **Bundle Size**: 230.55 kB (55.12 kB gzipped)
- **CSS Size**: 2.44 kB (1.04 kB gzipped)
- **Assets**: Otimizados e versionados

### **PWA Features**
- ✅ Installable
- ✅ Works Offline
- ✅ Responsive Design
- ✅ Fast Loading
- ✅ App-like Experience

### **Performance Target**
- **Lighthouse Score**: 90+ esperado
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1

---

## 🎉 **CONCLUSÃO**

Após seguir este guia, o **Roteirizar IA** estará rodando em produção em:
**🌐 https://roteiropro.com**

Com todas as funcionalidades:
- ✅ Geração de roteiros com Google Gemini AI
- ✅ Autenticação Firebase
- ✅ PWA completo e instalável
- ✅ Performance otimizada
- ✅ SEO friendly
- ✅ Modo offline

---

**📞 Suporte**: Se houver problemas, verificar logs do Hostinger ou solicitar ajuda técnica.

**📅 Data**: 23 de Junho de 2025  
**Versão**: 2.1.2  
**Status**: ✅ Pronto para Deploy 