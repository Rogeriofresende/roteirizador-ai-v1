# 📖 GUIA DE EXECUÇÃO - SISTEMA DE AUTOCORREÇÃO V6.2

## 🎯 VISÃO GERAL

Sistema criado com **3 prompts sequenciais** que transformam seu projeto em um **sistema autônomo** que **detecta e corrige erros automaticamente**.

---

## 📋 PROMPTS CRIADOS

### **🚨 PROMPT 1: CORREÇÃO CRÍTICA ATUAL**
**Arquivo**: `PROMPT_CURSOR_CORRECAO_ERROS_ATUAIS.md`
- **Objetivo**: Corrigir erros atuais que quebram o sistema
- **Tempo**: 45 minutos
- **Foco**: ReferenceError, environment variables, AIAnalyticsService
- **Status**: ✅ Pronto para execução

### **📊 PROMPT 2: SISTEMA DE MONITORAMENTO**  
**Arquivo**: `PROMPT_CURSOR_SISTEMA_MONITORAMENTO.md`
- **Objetivo**: Implementar monitoramento automático 24/7
- **Tempo**: 30 minutos
- **Cria**: Scripts de monitor, analyzer, dashboard
- **Status**: ✅ Pronto para execução

### **🤖 PROMPT 3: GERADOR AUTOMÁTICO**
**Arquivo**: `PROMPT_CURSOR_AUTO_PROMPT_GENERATOR.md`
- **Objetivo**: Sistema que gera prompts de correção automaticamente
- **Tempo**: 30 minutos
- **Cria**: Generator, orchestrator, templates
- **Status**: ✅ Pronto para execução

---

## 🚀 COMO EXECUTAR

### **ETAPA 1: Corrigir Erros Atuais**
```bash
# 1. Copie todo o conteúdo do arquivo:
cat PROMPT_CURSOR_CORRECAO_ERROS_ATUAIS.md

# 2. Cole no Cursor IA
# 3. Execute e aguarde conclusão (~45min)
# 4. Valide que sistema carrega sem erros críticos
```

### **ETAPA 2: Implementar Monitoramento**
```bash
# 1. Após ETAPA 1 concluída, copie:
cat PROMPT_CURSOR_SISTEMA_MONITORAMENTO.md

# 2. Cole no Cursor IA
# 3. Execute e aguarde conclusão (~30min)
# 4. Teste: npm run monitor:start
```

### **ETAPA 3: Ativar Autocorreção**
```bash
# 1. Após ETAPA 2 concluída, copie:
cat PROMPT_CURSOR_AUTO_PROMPT_GENERATOR.md

# 2. Cole no Cursor IA
# 3. Execute e aguarde conclusão (~30min)
# 4. Teste: npm run auto-fix
```

---

## 🎯 RESULTADO FINAL

Após executar os 3 prompts, você terá:

### **🛡️ Sistema Protegido**
- ✅ Erros atuais corrigidos
- ✅ Sistema funcionando 100%
- ✅ Build estável sem warnings

### **📊 Monitoramento Ativo**
- ✅ Detecta novos erros automaticamente
- ✅ Classifica por prioridade
- ✅ Dashboard visual de status
- ✅ Relatórios detalhados

### **🤖 Autocorreção Inteligente**
- ✅ Gera prompts específicos para cada erro
- ✅ Orquestra processo completo de correção
- ✅ Valida que correções funcionaram
- ✅ Ciclo completo automático

---

## 💡 COMANDOS ÚTEIS

### **Monitoramento Manual**:
```bash
npm run monitor:start        # Inicia monitoramento
npm run monitor:analyze      # Analisa erros detectados
npm run monitor:status       # Mostra status atual
```

### **Autocorreção Manual**:
```bash
npm run auto-fix            # Executa ciclo completo de correção
npm run auto-fix:generate   # Gera apenas prompts
npm run auto-fix:status     # Status do último auto-fix
```

### **Health Check**:
```bash
npm run system:health       # Verifica saúde geral do sistema
```

---

## 🔄 FLUXO OPERACIONAL

### **Modo Automático** (Recomendado):
1. **Sistema roda normalmente**
2. **Monitor detecta** problema automaticamente
3. **Analyzer classifica** e prioriza
4. **Generator cria** prompt específico
5. **Você executa** prompt no Cursor
6. **Sistema valida** que correção funcionou
7. **Repete** até sistema limpo

### **Modo Manual** (Quando necessário):
```bash
# 1. Detectar problemas
npm run system:health

# 2. Se houver erros, gerar correções
npm run auto-fix:generate

# 3. Executar prompts gerados com IA
# (arquivos em PROMPTS_AUTO_GENERATED/)

# 4. Validar correções
npm run system:health
```

---

## 🎉 BENEFÍCIOS

### **Para Você**:
- ⚡ **Nunca mais sistema quebrado** por muito tempo
- 🚀 **Foca em features**, não em debug
- 🛡️ **Sistema se mantém sozinho**
- 📊 **Visibilidade total** de problemas

### **Para o Projeto**:
- 🏗️ **Arquitetura robusta** com autocorreção
- 📈 **Qualidade sempre melhorando**
- 🔄 **Processo escalável** para qualquer feature
- 💡 **Aprendizado contínuo** de padrões

---

## 🎯 PRÓXIMOS PASSOS

1. **Execute os 3 prompts** sequencialmente
2. **Teste o sistema** com `npm run auto-fix`
3. **Configure monitoramento** para rodar periodicamente
4. **Adicione novos padrões** conforme necessário
5. **Aproveite sistema autônomo**! 🚀

---

**🏆 RESULTADO**: Sistema V6.2 Ultimate que **nunca para de funcionar** e se **mantém sozinho**!