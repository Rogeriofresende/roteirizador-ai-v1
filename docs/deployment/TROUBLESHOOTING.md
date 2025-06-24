# 🔧 **GUIA DE TROUBLESHOOTING - DEPLOYMENT**
## Roteirar IA v2.1.3 - Soluções para Problemas Comuns

---

## **🚨 PROBLEMAS CRÍTICOS**

### **1. Deploy Falha Completamente**

#### **Sintomas:**
- Script para com erro
- Build falha
- Vercel retorna erro

#### **Soluções:**
```bash
# Verificar dependências
npm ci
npm audit fix

# Limpar cache
rm -rf node_modules dist
npm install

# Verificar Vercel CLI
vercel --version
vercel login

# Re-executar deploy
npm run deploy:staging
```

---

### **2. Site Não Responde Após Deploy**

#### **Diagnóstico:**
```bash
# Verificar status da URL
curl -I https://staging.roteirar.ai

# Verificar logs do Vercel
vercel logs

# Testar localmente
npm run preview
```

#### **Soluções:**
```bash
# Re-deploy forçado
vercel --force

# Rollback se necessário
npm run deploy:rollback
```

---

### **3. Problemas de DNS/Alias**

#### **Soluções:**
```bash
# Verificar aliases atuais
vercel alias ls

# Remover alias problemático
vercel alias rm https://staging.roteirar.ai

# Re-aplicar alias
vercel alias set projeto-id.vercel.app staging.roteirar.ai
```

---

## **🚨 PROCEDIMENTOS DE EMERGÊNCIA**

### **1. Rollback de Emergência**

```bash
# Rollback automático
npm run deploy:rollback

# Verificar rollback
curl -I https://app.roteirar.ai
```

### **2. Comunicação de Incidente**

```bash
# Template de comunicação
echo "🚨 INCIDENT REPORT
Date: $(date)
Issue: [DESCRIÇÃO]
Impact: [IMPACTO NOS USUÁRIOS]
Status: [INVESTIGATING/RESOLVING/RESOLVED]
" > incident-$(date +%Y%m%d-%H%M).txt
```

---

## **📞 ESCALATION MATRIX**

### **Nível 1 - DevOps Engineer**
- **SLA**: 15 minutos para resposta
- **Ações**: Diagnóstico inicial, rollback se necessário

### **Nível 2 - Tech Lead**  
- **SLA**: 30 minutos para resposta
- **Ações**: Análise de código, hotfix, coordenação

### **Nível 3 - CTO**
- **SLA**: 1 hora para resposta
- **Ações**: Decisões estratégicas, comunicação executiva

---

**Status:** 🔧 Guia de troubleshooting ativo  
**Última Atualização:** Janeiro 2024
