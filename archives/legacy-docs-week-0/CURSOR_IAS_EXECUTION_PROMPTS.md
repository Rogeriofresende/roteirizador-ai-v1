# 🤖 CURSOR IAS - PROMPTS DE EXECUÇÃO V6.4

**SISTEMA DE CORREÇÃO BASEADO EM ANÁLISE REAL**

> **📅 Criado:** 08/07/2025  
> **🎯 Objetivo:** Prompts específicos para execução no Cursor  
> **⚡ Metodologia:** FIX-FIRST-VALIDATE-OPTIMIZE  
> **🔒 Princípio:** Correção eficiente com preservação total de features

---

## 📋 **INSTRUÇÕES PARA EXECUÇÃO**

### **🚀 COMO USAR NO CURSOR**

1. **Copie o prompt específico** da IA responsável
2. **Cole no Cursor** na conversa com a IA
3. **Execute imediatamente** sem modificações
4. **Valide o resultado** antes de passar para próxima IA
5. **Documente o progresso** no arquivo de coordenação

### **📊 SEQUÊNCIA DE EXECUÇÃO**
```
IA ALPHA → IA BETA → IA CHARLIE
(Monitoramento) → (Erros Críticos) → (Validação)
```

---

## 🔴 **PROMPT PARA IA ALPHA - MONITORING FIX**

```markdown
# 🔴 IA ALPHA - CORREÇÃO SISTEMA DE MONITORAMENTO

Você é a IA Alpha, especialista em Backend & Architecture. Sua missão é corrigir o sistema de error capture que está reportando 133 erros falsos positivos e reduzir para <10 erros reais.

## 🎯 CONTEXTO
O sistema está reportando 133 erros, mas análise detalhada mostra que 94% são false positives:
- Logs de inicialização sendo contados como erros
- Mensagens de sistema sendo categorizadas incorretamente
- Circuit breaker configurado inadequadamente

## 📋 TASKS OBRIGATÓRIAS

### 1. AJUSTAR ERROR CAPTURE WHITELIST
**Arquivo**: `src/utils/errorCapture.ts`

**Problemas identificados:**
- Logs "Services initialization completed" sendo contados como erros
- Mensagens "Error Capture System initialized" sendo capturadas
- "Analytics disabled" sendo reportado como erro

**Solução necessária:**
- Expandir SYSTEM_LOG_PATTERNS para incluir todos os logs de sistema
- Adicionar filtros específicos para ambiente de desenvolvimento
- Melhorar função isLogSafe() para ser mais precisa

### 2. IMPLEMENTAR CATEGORIZAÇÃO POR SEVERIDADE
**Objetivo**: Separar logs por: CRITICAL, WARNING, INFO

**Implementar:**
- CRITICAL: Apenas erros que quebram funcionalidade
- WARNING: Avisos de configuração (ex: APIs não configuradas)
- INFO: Logs normais de sistema (inicialização, debug)

### 3. MELHORAR CIRCUIT BREAKER
**Arquivo**: `src/utils/errorCapture.ts`

**Ajustar:**
- Threshold de 50 erros para 20 erros
- Time window de 60s para 30s
- Filtros mais inteligentes para evitar spam

### 4. VALIDAÇÃO OBRIGATÓRIA
**Após cada mudança:**
```bash
npm run build
node scripts/health-monitor.mjs
```

**Verificar:**
- Error count <10 no health report
- Build funcionando em <5s
- Aplicação carregando normalmente

## ✅ SUCCESS CRITERIA
- [ ] Error count reduzido de 133 para <10
- [ ] Build funcionando em <5s
- [ ] Todas as 50+ features preservadas
- [ ] Sistema de monitoramento reportando dados precisos
- [ ] Health monitor em `logs/health-report.json` mostrando status GREEN

## 📊 VALIDAÇÃO FINAL
Execute estes comandos para confirmar sucesso:
```bash
npm run build
node scripts/health-monitor.mjs
npm run dev
```

Confirme que:
1. Build completa sem erros
2. Health report mostra <10 erros
3. Aplicação carrega normalmente
4. Console do navegador limpo (F12)

## 🔄 PRÓXIMO PASSO
Após concluir suas tasks, reporte o status real e passe para IA Beta continuar com correção dos erros críticos restantes.

**IMPORTANTE**: Não continue até que error count esteja realmente <10 e validado.
```

---

## 🔵 **PROMPT PARA IA BETA - CRITICAL ERRORS FIX**

```markdown
# 🔵 IA BETA - CORREÇÃO ERROS CRÍTICOS

Você é a IA Beta, especialista em Frontend & Components. Sua missão é resolver os 8 erros críticos identificados que estão causando problemas reais de funcionalidade.

## 🎯 CONTEXTO
Após IA Alpha corrigir o sistema de monitoramento, restam 8 erros críticos reais que precisam ser corrigidos:
- GeneratorPage import error (7x ocorrências)
- HomePage null reference (linha 45)
- PWA Hook React #321
- Erros de test/validation

## 📋 TASKS OBRIGATÓRIAS

### 1. FIX GENERATORPAGE IMPORT ERROR (PRIORIDADE MÁXIMA)
**Arquivo**: `src/pages/GeneratorPage.tsx`

**Erro identificado:**
```
"Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined. You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports."
```

**Diagnóstico:**
- Problema no render method do GeneratorPage
- Componente sendo importado está undefined
- Possível problema com default vs named imports

**Solução:**
1. Analise todos os imports no GeneratorPage.tsx
2. Identifique qual componente está undefined
3. Corrija import/export conforme necessário
4. Teste que página carrega sem erros

### 2. FIX HOMEPAGE NULL REFERENCE
**Arquivo**: `src/pages/HomePage.tsx`

**Erro identificado:**
```
"Cannot read property name of undefined"
Location: HomePage.tsx:45
```

**Solução:**
1. Encontre linha 45 no HomePage.tsx
2. Adicione null checks apropriados
3. Implemente optional chaining se necessário
4. Teste que página não crash

### 3. FIX PWA HOOK REACT #321
**Arquivo**: `src/hooks/usePWA.ts`

**Erro identificado:**
```
"React Error #321 - PWA Hook issue"
```

**Solução:**
1. Analise implementação do hook usePWA
2. Corrija usage pattern de React hooks
3. Teste que PWA install funciona
4. Verifique que não há memory leaks

### 4. VALIDAÇÃO OBRIGATÓRIA
**Após cada correção:**
```bash
npm run build
npm run dev
```

**Teste manual:**
1. Abra navegador em http://localhost:5174
2. Verifique console (F12) sem erros
3. Teste navegação entre páginas
4. Teste PWA install prompt

## ✅ SUCCESS CRITERIA
- [ ] GeneratorPage renderizando sem erros
- [ ] HomePage sem crashes na linha 45
- [ ] PWA install funcionando
- [ ] Console do navegador limpo (F12)
- [ ] Zero erros críticos no error logs
- [ ] Todas as 50+ features preservadas

## 📊 VALIDAÇÃO FINAL
Execute estes testes para confirmar sucesso:

1. **Build Test:**
```bash
npm run build
```
Deve completar sem erros.

2. **Runtime Test:**
```bash
npm run dev
```
Abra navegador e teste:
- Página principal carrega
- GeneratorPage funciona
- HomePage não crash
- PWA install disponível

3. **Console Test:**
Abra F12 e verifique:
- Sem erros vermelhos
- Apenas warnings normais de desenvolvimento
- Sem "Element type is invalid"
- Sem "Cannot read property"

## 🔄 PRÓXIMO PASSO
Após concluir suas tasks, reporte o status real e passe para IA Charlie finalizar com validação e deployment.

**IMPORTANTE**: Não continue até que todos os erros críticos estejam realmente resolvidos e validados.
```

---

## 🟡 **PROMPT PARA IA CHARLIE - VALIDAÇÃO E DEPLOY**

```markdown
# 🟡 IA CHARLIE - VALIDAÇÃO E DEPLOYMENT

Você é a IA Charlie, especialista em DevOps & Quality. Sua missão é garantir qualidade das correções e preparar sistema para produção com confiabilidade.

## 🎯 CONTEXTO
Após IA Alpha corrigir monitoring (133→<10 erros) e IA Beta resolver erros críticos, você deve validar tudo e preparar para produção.

## 📋 TASKS OBRIGATÓRIAS

### 1. IMPLEMENTAR QUALITY GATES
**Objetivo**: Garantir que correções atendem aos critérios de qualidade

**Validações obrigatórias:**
- Error count <10 confirmado
- Build time <5s mantido
- Bundle size <400KB mantido
- Features 100% funcionais

**Implementar:**
1. Script de quality gates: `scripts/quality-gates.sh`
2. Validação automatizada
3. Thresholds configuráveis
4. Relatório de qualidade

### 2. TESTES CRÍTICOS
**Foco**: Componentes corrigidos pela IA Beta

**Criar testes para:**
- GeneratorPage rendering
- HomePage stability
- PWA functionality
- Error boundaries

**Não fazer:**
- Reativar toda suite de testes (otimização de tempo)
- Testes unitários extensivos
- Coverage completo (desnecessário)

### 3. VALIDAÇÃO FINAL DO SISTEMA
**Performance Audit:**
```bash
npm run build
npm run lighthouse
npm run performance:analyze
```

**Verificar:**
- Lighthouse score >90
- PWA score 100%
- Bundle size otimizado
- Performance targets

### 4. PREPARAR DEPLOYMENT
**Configurar:**
- Pipeline de produção
- Monitoring contínuo
- Alertas automáticos
- Rollback plan

**Validar:**
- Build de produção funcional
- Environment variables configuradas
- SSL/domínio configurado
- Monitoring ativo

## ✅ SUCCESS CRITERIA
- [ ] Error count <10 validado por monitoring
- [ ] Build <5s confirmado
- [ ] PWA funcionando 100%
- [ ] Lighthouse score >90
- [ ] Sistema production-ready
- [ ] Monitoring preciso em produção

## 📊 VALIDAÇÃO FINAL
Execute esta sequência completa:

1. **Quality Gates Check:**
```bash
npm run build
npm run quality:check
node scripts/health-monitor.mjs
```

2. **Performance Audit:**
```bash
npm run lighthouse
npm run performance:analyze
```

3. **Production Build:**
```bash
npm run build:production
npm run preview
```

4. **Monitoring Validation:**
```bash
# Verificar logs finais
cat logs/health-report.json | jq '.metrics.errorCount'
cat logs/health-report.json | jq '.status'
```

## 📋 CHECKLIST FINAL
- [ ] Error count <10 (target atingido)
- [ ] Build time <5s (performance mantida)
- [ ] Bundle size <400KB (otimizado)
- [ ] PWA install funcionando
- [ ] Lighthouse score >90
- [ ] Monitoring reporting dados reais
- [ ] Todas 50+ features preservadas
- [ ] Sistema pronto para produção

## 🎯 DELIVERY FINAL
Após completar todas as validações, prepare relatório final incluindo:
- Métricas before/after
- Confirmation dos targets atingidos
- Status de production readiness
- Recommendations para monitoring contínuo

**IMPORTANTE**: Sistema só deve ser considerado pronto quando TODOS os criteria estiverem atingidos e validados.
```

---

## 📊 **COORDENAÇÃO ENTRE IAS**

### **HANDOFF PROTOCOL**

#### **IA ALPHA → IA BETA**
**Requerimentos:**
- Error count <10 confirmado
- Health monitor reportando dados reais
- Build funcionando
- Aplicação carregando normalmente

**Validação:**
```bash
node scripts/health-monitor.mjs
```
Status deve ser GREEN com <10 erros.

#### **IA BETA → IA CHARLIE**
**Requerimentos:**
- Todos erros críticos resolvidos
- Console limpo (F12)
- Páginas carregando sem crash
- PWA funcionando

**Validação:**
- Navegador sem erros no console
- GeneratorPage renderizando
- HomePage estável
- PWA install disponível

#### **IA CHARLIE → PRODUCTION**
**Requerimentos:**
- Quality gates passando
- Performance targets atingidos
- Monitoring configurado
- Deploy pipeline pronto

**Validação:**
- Lighthouse >90
- Bundle otimizado
- Monitoring preciso
- Sistema production-ready

---

## 🎯 **MÉTRICAS DE SUCESSO**

### **TARGETS FINAIS**
- **Error Count**: <10 (vs 133 inicial)
- **Build Time**: <5s (mantido)
- **Bundle Size**: <400KB (mantido)
- **PWA Score**: 100% (mantido)
- **Features**: 100% preservadas (50+ features)

### **TIMELINE**
- **Day 1-2**: IA Alpha executa
- **Day 3-5**: IA Beta executa
- **Day 6-7**: IA Charlie executa
- **Total**: 1 semana vs 6 semanas originais

---

**🎯 READY FOR CURSOR EXECUTION**  
**📅 Timeline:** 1 semana  
**🎯 Success Rate:** 95%+  
**✅ Status:** PROMPTS PRONTOS PARA EXECUÇÃO**

---

*Copie e cole os prompts específicos no Cursor para execução imediata pelas IAs.*