# �� **DEPLOYMENT ROTEIRAR IA v2.1.3**
## Guia Rápido para Deploy Profissional

---

## **⚡ QUICK START**

### **Deploy Staging (Testes):**
```bash
npm run deploy:staging
```

### **Deploy Produção (Go Live):**
```bash
npm run deploy:green    # Deploy green environment
# Aguardar 24-48h validação
npm run deploy:switch   # Switch para produção
```

### **Rollback Emergência:**
```bash
npm run deploy:rollback
```

---

## **📋 CHECKLIST PRÉ-DEPLOY**

### **Antes de Qualquer Deploy:**
- [ ] Código commitado e pushed
- [ ] Testes passando: `npm test`
- [ ] Lint sem erros: `npm run lint`
- [ ] Build local funciona: `npm run build`
- [ ] Vercel CLI autenticado: `vercel whoami`

---

## **🌍 AMBIENTES**

| Ambiente | URL | Uso |
|----------|-----|-----|
| **Staging** | staging.roteirar.ai | Testes completos |
| **Production Green** | app-v2.roteirar.ai | Nova versão paralela |
| **Production Current** | app.roteirar.ai | Versão ativa |

---

## **🔄 FLUXO BLUE-GREEN**

```
1. 🧪 Deploy Staging
   ↓
2. ✅ Validar Staging
   ↓  
3. 🚀 Deploy Green
   ↓
4. ⏰ Aguardar 24-48h
   ↓
5. 🔄 Switch Produção
```

---

## **📊 COMANDOS ÚTEIS**

### **Monitoramento:**
```bash
# Status de todos ambientes
curl -I https://app.roteirar.ai
curl -I https://staging.roteirar.ai
curl -I https://app-v2.roteirar.ai

# Logs do Vercel
vercel logs --limit=50

# Auditoria de performance
npm run lighthouse:production
```

### **Debug:**
```bash
# Build local para debug
npm run build:staging
npm run preview

# Verificar aliases
vercel alias ls

# Status do projeto
vercel ls
```

---

## **🚨 EMERGÊNCIAS**

### **Site fora do ar:**
```bash
# Rollback imediato
npm run deploy:rollback

# Verificar se voltou
curl -I https://app.roteirar.ai
```

### **Deploy falhou:**
```bash
# Limpar e tentar novamente
rm -rf node_modules dist
npm install
npm run deploy:staging
```

---

## **📞 CONTATOS DE EMERGÊNCIA**

- **DevOps**: +55 11 99999-0001
- **Tech Lead**: +55 11 99999-0002  
- **CTO**: +55 11 99999-0003

---

## **📚 DOCUMENTAÇÃO COMPLETA**

- [Projeto Deployment](./PROJETO_DEPLOYMENT_PROFISSIONAL.md)
- [Checklist Validação](./CHECKLIST_VALIDACAO.md)
- [Troubleshooting](./TROUBLESHOOTING.md)
- [Relatório Execução](./RELATORIO_EXECUCAO_DEPLOYMENT.md)

---

**🎯 Remember**: Always test in staging first!  
**⚡ Emergency**: Use rollback if anything goes wrong!  
**📊 Monitor**: Keep an eye on metrics after deploy!
