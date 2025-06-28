# 🤖 FASE 7 - PROMPTS COORDENADOS PARA EXECUÇÃO MULTI-AI

> **Data:** 27 de Janeiro de 2025  
> **Base:** Resultados da descoberta automatizada concluída  
> **Status:** Work assignments estruturados prontos para execução  
> **Metodologia:** Multi-AI Coordinated Error Resolution

---

## 🏗️ **PROMPT PARA IA A - BACKEND/ARCHITECTURE SPECIALIST**

### **📊 STATUS DA DESCOBERTA AUTOMATIZADA:**
```bash
✅ TypeScript compilation errors: 0 detected
✅ ESLint issues: 0 detected  
✅ Build process: ✅ SUCCESS (330KB gzipped)
✅ Architecture patterns: Clean and consistent
✅ Import/export patterns: No deep imports detected
```

### **🎯 ASSIGNMENT IA A - TRACK 7.1:**

**🚀 EXCELENTE NOTÍCIA: Sua área está PERFEITA!**

#### **📋 RESPONSABILIDADES ATUAIS:**
1. **Coordination Support (15min):**
   - Monitor resolução das IAs B e C
   - Validar que mudanças não quebrem arquitetura
   - Estar disponível para suporte técnico

2. **Final Validation (15min):**
   - Re-executar diagnostic scripts após correções
   - Confirmar zero impacto na arquitetura
   - Validar build final

#### **🤝 COORDINATION PROTOCOL:**
- **Status:** STANDBY (sem problemas detectados)
- **Priority:** BAIXA (suporte às outras IAs)
- **Files to Monitor:** package.json (IA B), test configs (IA C)
- **Action Required:** Estar disponível para architectural guidance

#### **✅ SUCCESS CRITERIA:**
- Arquitetura mantida íntegra após correções
- Build process mantido funcionando
- Zero regressões introduzidas

---

## 🎨 **PROMPT PARA IA B - FRONTEND/UX SPECIALIST**

### **📊 STATUS DA DESCOBERTA AUTOMATIZADA:**
```bash
⚠️ React warnings detected: npm script issue
❌ Missing npm "start" script (current scripts use "dev")
✅ Missing key props: 0 detected
✅ Console statements: 0 detected  
✅ Accessibility violations: 0 detected
✅ Mobile responsive issues: 0 detected
```

### **🎯 ASSIGNMENT IA B - TRACK 7.2:**

**🔧 PROBLEMA SIMPLES DETECTADO: Quick fix necessário**

#### **📋 RESPONSABILIDADES ESPECÍFICAS:**

1. **Quick Fix npm Scripts (15min):**
   ```bash
   # Problema detectado:
   npm error Missing script: "start"
   
   # Solução necessária:
   # Verificar package.json e ajustar scripts conforme necessário
   # Scripts atuais provavelmente usam "dev" ao invés de "start"
   ```

2. **Validation Testing (15min):**
   - Testar que componentes React carregam sem warnings
   - Verificar que todas as rotas funcionam
   - Confirmar UX consistency mantida

#### **🔍 DIAGNOSTIC FILES TO CHECK:**
- `react-warnings.log` - Contém detalhes do erro npm
- `missing-keys.log` - Confirmar que permanece vazio
- `console-statements.log` - Confirmar que permanece limpo

#### **🤝 COORDINATION WITH OTHER IAs:**
- **With IA A:** Confirmar que mudanças no package.json não quebram build
- **With IA C:** Coordenar que scripts funcionem com sistema de testes

#### **✅ SUCCESS CRITERIA:**
- Script npm "start" ou "dev" funcionando corretamente
- Zero React warnings no console
- Todos os componentes carregando sem erros
- UX consistency mantida

---

## 🛠️ **PROMPT PARA IA C - DEVOPS/QA SPECIALIST**

### **📊 STATUS DA DESCOBERTA AUTOMATIZADA:**
```bash
⚠️ Test results: 4988 linhas (análise necessária)
⚠️ Security audit: Vulnerabilidade esbuild <=0.24.2 (moderada)
✅ CI/CD pipeline: Detectado e funcionando
✅ Jest configuration: Válida
⚠️ Performance tests: Volume alto de dados para análise
```

### **🎯 ASSIGNMENT IA C - TRACK 7.3 (PRIORITY ALTA):**

**🔍 INVESTIGAÇÃO PROFUNDA NECESSÁRIA**

#### **📋 RESPONSABILIDADES CRÍTICAS:**

1. **Security Vulnerability Resolution (20min):**
   ```bash
   # Problema detectado:
   esbuild <=0.24.2 - Severity: moderate
   GHSA-67mh-4wv8-2f99 - Development server vulnerability
   
   # Ações necessárias:
   # 1. Analisar impacto da vulnerabilidade
   # 2. Avaliar se `npm audit fix --force` é seguro
   # 3. Testar que fix não quebra build
   ```

2. **Test Results Deep Dive (20min):**
   ```bash
   # Dados para análise:
   test-results.log: 4988 linhas
   
   # Investigação necessária:
   # 1. Identificar quais testes estão falhando
   # 2. Categorizar tipos de falhas
   # 3. Priorizar fixes críticos vs minor
   ```

3. **Performance Analysis (10min):**
   ```bash
   # Arquivos para análise:
   performance-test.log: 42KB de dados
   potential-bottlenecks.log: Verificar se vazio
   
   # Foco: Identificar gargalos reais vs false positives
   ```

#### **🔍 DIAGNOSTIC FILES TO ANALYZE:**
- `test-results.log` - **CRITICAL:** 4988 linhas para análise
- `security-audit.log` - **HIGH:** Vulnerabilidade esbuild
- `performance-test.log` - **MEDIUM:** Performance optimization
- `build-quality.log` - **LOW:** Quality gates validation

#### **🤝 COORDINATION WITH OTHER IAs:**
- **With IA A:** Validar que security fixes não quebram arquitetura
- **With IA B:** Coordenar que npm script fixes funcionem com testes
- **Cross-Impact:** Todas as mudanças devem ser testadas em conjunto

#### **✅ SUCCESS CRITERIA:**
- Vulnerabilidade de segurança resolvida
- Taxa de sucesso dos testes ≥ 95%
- Performance benchmarks dentro dos limites
- CI/CD pipeline funcionando sem falhas
- Zero security vulnerabilities remaining

---

## 🔄 **SEQUÊNCIA DE EXECUÇÃO COORDENADA:**

### **⚡ FASE 1: EXECUÇÃO PARALELA (45min)**
1. **IA C inicia imediatamente** - Problemas mais críticos (security + testing)
2. **IA B aguarda 15min, depois inicia** - Quick fix simples (npm scripts)  
3. **IA A em standby** - Suporte e monitoramento contínuo

### **⚡ FASE 2: VALIDAÇÃO COORDENADA (15min)**
1. **IA A valida integração** - Confirma que todas as mudanças funcionam juntas
2. **Re-run diagnostic scripts** - Confirma zero errors no sistema
3. **Cross-impact verification** - Valida zero conflitos entre mudanças

---

## 📋 **COORDINATION PROTOCOL OBRIGATÓRIO:**

### **🤝 REAL-TIME UPDATES:**
- Update em `FASE_7_RESOLUTION_PROGRESS.md` a cada 15 minutos
- Declare conflitos imediatamente se detectados
- Comunique dependencies entre mudanças

### **🚨 EMERGENCY PROTOCOL:**
- Se IA C encontrar problemas críticos → IA A e IA B pausam
- Se IA B introduzir breaking changes → IA A valida imediatamente  
- Se qualquer IA detectar cross-impact → coordenação imediata

### **✅ FINAL VALIDATION:**
- Todas as 3 IAs devem confirmar zero errors
- Re-run completo de diagnostic scripts
- Confirmation de zero conflicts entre mudanças

---

## 🎊 **READY FOR EXECUTION!**

```bash
🎯 PHASE 7 COORDINATED RESOLUTION: READY TO START!
🏗️ IA A: STANDBY for coordination support
🎨 IA B: READY for npm scripts quick fix  
🛠️ IA C: READY for security + testing deep dive

🚀 START COMMAND: IA C begins immediately
⏱️ ESTIMATED TOTAL TIME: 60 minutes
🎯 TARGET: Sistema Roteirar IA com ZERO ERROS
```

**🤖 CADA IA AGORA TEM SEU ASSIGNMENT ESPECÍFICO E PODE EXECUTAR COORDENADAMENTE!**
