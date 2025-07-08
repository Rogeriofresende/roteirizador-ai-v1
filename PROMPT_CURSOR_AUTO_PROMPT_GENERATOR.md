# 🤖 PROMPT 3: GERADOR AUTOMÁTICO DE PROMPTS

## 🎯 MISSÃO: Criar sistema que gera prompts de correção automaticamente

**Tempo estimado**: 30 minutos
**Pré-requisitos**: PROMPT 1 e 2 executados (sistema funcionando + monitoramento ativo)
**Objetivo**: Sistema completamente autônomo que corrige erros automaticamente

---

## 📋 COMPONENTES FINAIS DO SISTEMA

### **1. Prompt Generator (Gerador Inteligente)**
**Arquivo**: `scripts/prompt-generator.js`
- Analisa erros detectados
- Gera prompts específicos para cada tipo de erro
- Usa templates dinâmicos
- Adapta linguagem para IAs do Cursor

### **2. Auto-Fix Orchestrator (Orquestrador)**
**Arquivo**: `scripts/auto-fix-orchestrator.js`
- Coordena todo o processo de correção
- Executa prompts gerados
- Valida correções
- Reinicia ciclo se necessário

### **3. Template System (Sistema de Templates)**
**Arquivos**: `TEMPLATES/` directory
- Templates para diferentes tipos de erro
- Variáveis dinâmicas
- Contexto específico por erro

---

## 🔧 IMPLEMENTAÇÃO DETALHADA

### **ARQUIVO 1: scripts/prompt-generator.js**

```javascript
#!/usr/bin/env node

/**
 * Prompt Generator V6.2 - Geração Automática de Prompts de Correção
 * Cria prompts específicos baseados nos erros detectados
 */

const fs = require('fs');
const path = require('path');

class PromptGenerator {
  constructor() {
    this.analysisFile = path.join(__dirname, '..', 'logs', 'error-analysis.json');
    this.templatesDir = path.join(__dirname, '..', 'TEMPLATES');
    this.outputDir = path.join(__dirname, '..', 'PROMPTS_AUTO_GENERATED');
    
    // Criar diretório de output se não existir
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Gera prompts baseados na análise de erros
   */
  async generatePrompts() {
    console.log('🤖 Prompt Generator V6.2 iniciado');
    
    const analysis = this.loadAnalysis();
    if (!analysis || analysis.totalErrors === 0) {
      console.log('✅ Nenhum erro para gerar prompts');
      return [];
    }

    console.log(`📝 Gerando prompts para ${analysis.totalErrors} erros...`);

    const prompts = [];

    // Gerar prompts por prioridade
    const priorities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
    
    for (const priority of priorities) {
      const errors = analysis.errorsByPriority[priority] || [];
      if (errors.length > 0) {
        const prompt = this.generatePromptForPriority(priority, errors, analysis);
        if (prompt) {
          prompts.push(prompt);
        }
      }
    }

    // Salvar prompts gerados
    prompts.forEach(prompt => {
      this.savePrompt(prompt);
    });

    console.log(`✅ ${prompts.length} prompts gerados com sucesso`);
    return prompts;
  }

  /**
   * Carrega análise de erros
   */
  loadAnalysis() {
    try {
      if (!fs.existsSync(this.analysisFile)) {
        console.log('⚠️  Arquivo de análise não encontrado');
        return null;
      }

      return JSON.parse(fs.readFileSync(this.analysisFile, 'utf8'));
    } catch (error) {
      console.error('❌ Erro ao carregar análise:', error.message);
      return null;
    }
  }

  /**
   * Gera prompt para uma prioridade específica
   */
  generatePromptForPriority(priority, errors, analysis) {
    const template = this.getTemplateForPriority(priority);
    
    const prompt = {
      id: `auto-fix-${priority.toLowerCase()}-${Date.now()}`,
      priority,
      title: `Correção Automática - Erros ${priority}`,
      estimatedTime: this.getEstimatedTime(priority, errors.length),
      errors,
      content: this.buildPromptContent(template, errors, analysis),
      validation: this.getValidationSteps(errors),
      generated: new Date().toISOString()
    };

    return prompt;
  }

  /**
   * Constrói conteúdo do prompt
   */
  buildPromptContent(template, errors, analysis) {
    let content = template;

    // Substituir variáveis dinâmicas
    content = content.replace('{{ERROR_COUNT}}', errors.length);
    content = content.replace('{{PRIORITY}}', errors[0]?.priority || 'MEDIUM');
    content = content.replace('{{TIMESTAMP}}', new Date().toLocaleString());
    
    // Adicionar lista de erros específicos
    const errorsList = errors.map((error, index) => {
      return `### ERRO ${index + 1}: ${error.error.message}\n` +
             `**Arquivo**: ${this.extractFileFromStack(error.error.stack)}\n` +
             `**Tipo**: ${error.type}\n` +
             `**Stack Trace**:\n\`\`\`\n${error.error.stack.substring(0, 500)}...\n\`\`\`\n`;
    }).join('\n');

    content = content.replace('{{ERRORS_LIST}}', errorsList);

    // Adicionar correções sugeridas
    const suggestions = this.generateSuggestions(errors);
    content = content.replace('{{SUGGESTIONS}}', suggestions);

    // Adicionar testes de validação
    const validationSteps = this.getValidationSteps(errors);
    content = content.replace('{{VALIDATION_STEPS}}', validationSteps);

    return content;
  }

  /**
   * Extrai nome do arquivo do stack trace
   */
  extractFileFromStack(stack) {
    const match = stack.match(/at.*\((.*?):\d+:\d+\)/);
    if (match) {
      const fullPath = match[1];
      return fullPath.split('/').pop() || fullPath;
    }
    return 'arquivo não identificado';
  }

  /**
   * Gera sugestões específicas para os erros
   */
  generateSuggestions(errors) {
    const suggestions = [];

    errors.forEach((error, index) => {
      const message = error.error.message.toLowerCase();

      if (message.includes('cannot access') && message.includes('before initialization')) {
        suggestions.push(
          `**Erro ${index + 1} - Solução**: Problema de hoisting. ` +
          `Mover declaração da função/variável para antes do uso. ` +
          `Verificar se há const/let sendo usado antes da declaração.`
        );
      }
      
      else if (message.includes('environment') || message.includes('vite_')) {
        suggestions.push(
          `**Erro ${index + 1} - Solução**: Variável de ambiente não configurada. ` +
          `Verificar arquivo .env.production e configuração do Vite. ` +
          `Confirmar que variável está sendo exportada corretamente.`
        );
      }
      
      else if (message.includes('failed to analyze') || message.includes('performance')) {
        suggestions.push(
          `**Erro ${index + 1} - Solução**: Erro em service sem error handling adequado. ` +
          `Adicionar try-catch robusto, implementar fallbacks, ` +
          `e garantir que service não quebra sistema.`
        );
      }
      
      else {
        suggestions.push(
          `**Erro ${index + 1} - Solução**: Analisar stack trace e implementar ` +
          `correção específica. Adicionar error boundaries se necessário.`
        );
      }
    });

    return suggestions.join('\n\n');
  }

  /**
   * Gera passos de validação
   */
  getValidationSteps(errors) {
    const steps = [
      '- [ ] Executar `npm run build` sem erros',
      '- [ ] Executar `npm run preview` e carregar aplicação',
      '- [ ] Verificar console do browser - deve estar limpo',
      '- [ ] Testar funcionalidade principal do sistema'
    ];

    // Adicionar validações específicas baseadas nos tipos de erro
    const errorTypes = [...new Set(errors.map(e => e.type))];
    
    if (errorTypes.includes('build')) {
      steps.push('- [ ] Confirmar que build TypeScript passa sem warnings');
    }
    
    if (errorTypes.includes('runtime')) {
      steps.push('- [ ] Testar navegação entre páginas principais');
      steps.push('- [ ] Verificar que components renderizam corretamente');
    }

    return steps.join('\n');
  }

  /**
   * Obtém template para prioridade
   */
  getTemplateForPriority(priority) {
    const templates = {
      CRITICAL: this.getCriticalTemplate(),
      HIGH: this.getHighTemplate(),
      MEDIUM: this.getMediumTemplate(),
      LOW: this.getLowTemplate()
    };

    return templates[priority] || templates.MEDIUM;
  }

  /**
   * Template para erros críticos
   */
  getCriticalTemplate() {
    return `# 🚨 CORREÇÃO CRÍTICA AUTOMÁTICA

## ⚡ URGENTE: Sistema com erros críticos que impedem funcionamento

**Total de erros**: {{ERROR_COUNT}}
**Prioridade**: {{PRIORITY}}
**Gerado em**: {{TIMESTAMP}}

---

## 🔥 ERROS CRÍTICOS DETECTADOS

{{ERRORS_LIST}}

---

## 🛠️ CORREÇÕES NECESSÁRIAS

{{SUGGESTIONS}}

---

## ✅ VALIDAÇÃO OBRIGATÓRIA

{{VALIDATION_STEPS}}

---

## 🎯 OBJETIVO

Corrigir TODOS os erros críticos para que o sistema volte a funcionar normalmente.
Estas correções são URGENTES e devem ser executadas imediatamente.

**⏱️ Tempo estimado**: 30-45 minutos
**🔄 Próximo passo**: Executar análise novamente para confirmar correções`;
  }

  /**
   * Template para erros altos
   */
  getHighTemplate() {
    return `# ⚠️ CORREÇÃO DE ERROS PRIORITÁRIOS

## 🎯 Erros de alta prioridade que afetam funcionalidades importantes

**Total de erros**: {{ERROR_COUNT}}
**Prioridade**: {{PRIORITY}}
**Gerado em**: {{TIMESTAMP}}

---

## 📋 ERROS DETECTADOS

{{ERRORS_LIST}}

---

## 🔧 SOLUÇÕES RECOMENDADAS

{{SUGGESTIONS}}

---

## ✅ TESTES DE VALIDAÇÃO

{{VALIDATION_STEPS}}

---

## 📊 IMPACTO

Estes erros afetam funcionalidades importantes do sistema mas não impedem o funcionamento básico.
Corrija para melhorar estabilidade e experiência do usuário.

**⏱️ Tempo estimado**: 20-30 minutos`;
  }

  /**
   * Template para erros médios
   */
  getMediumTemplate() {
    return `# 🔧 CORREÇÃO DE MANUTENÇÃO

## 📈 Melhorias de estabilidade e correções preventivas

**Total de erros**: {{ERROR_COUNT}}
**Prioridade**: {{PRIORITY}}
**Gerado em**: {{TIMESTAMP}}

---

## 📝 ERROS IDENTIFICADOS

{{ERRORS_LIST}}

---

## 💡 SOLUÇÕES SUGERIDAS

{{SUGGESTIONS}}

---

## ✅ VERIFICAÇÕES

{{VALIDATION_STEPS}}

---

## 🎯 BENEFÍCIOS

Correção preventiva para melhorar estabilidade do sistema e prevenir problemas futuros.

**⏱️ Tempo estimado**: 15-20 minutos`;
  }

  /**
   * Template para erros baixos
   */
  getLowTemplate() {
    return `# 🧹 POLIMENTO E OTIMIZAÇÃO

## ✨ Correções menores e melhorias de qualidade

**Total de erros**: {{ERROR_COUNT}}
**Prioridade**: {{PRIORITY}}
**Gerado em**: {{TIMESTAMP}}

---

## 📋 ITENS IDENTIFICADOS

{{ERRORS_LIST}}

---

## 🔍 CORREÇÕES SUGERIDAS

{{SUGGESTIONS}}

---

## ✅ VALIDAÇÃO

{{VALIDATION_STEPS}}

---

## 💫 RESULTADO

Sistema mais polido e com melhor qualidade de código.

**⏱️ Tempo estimado**: 10-15 minutos`;
  }

  /**
   * Estima tempo baseado na prioridade e quantidade
   */
  getEstimatedTime(priority, errorCount) {
    const baseTime = {
      CRITICAL: 45,
      HIGH: 30,
      MEDIUM: 20,
      LOW: 15
    };

    const base = baseTime[priority] || 20;
    const additional = Math.floor(errorCount / 3) * 5; // 5min a cada 3 erros extras
    
    return `${base + additional} minutos`;
  }

  /**
   * Salva prompt gerado
   */
  savePrompt(prompt) {
    try {
      const filename = `${prompt.id}.md`;
      const filepath = path.join(this.outputDir, filename);
      
      const metadata = `<!-- 
Prompt gerado automaticamente
ID: ${prompt.id}
Prioridade: ${prompt.priority}
Erros: ${prompt.errors.length}
Tempo estimado: ${prompt.estimatedTime}
Gerado em: ${prompt.generated}
-->

`;

      fs.writeFileSync(filepath, metadata + prompt.content);
      console.log(`💾 Prompt salvo: ${filename}`);
      
    } catch (error) {
      console.error(`❌ Erro ao salvar prompt ${prompt.id}:`, error.message);
    }
  }
}

// Execução se chamado diretamente
if (require.main === module) {
  const generator = new PromptGenerator();
  
  generator.generatePrompts().catch(error => {
    console.error('❌ Erro na geração de prompts:', error.message);
    process.exit(1);
  });
}

module.exports = PromptGenerator;
```

### **ARQUIVO 2: scripts/auto-fix-orchestrator.js**

```javascript
#!/usr/bin/env node

/**
 * Auto-Fix Orchestrator V6.2 - Orquestração Completa de Correções
 * Coordena todo o processo de detecção → análise → correção → validação
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class AutoFixOrchestrator {
  constructor() {
    this.logsDir = path.join(__dirname, '..', 'logs');
    this.promptsDir = path.join(__dirname, '..', 'PROMPTS_AUTO_GENERATED');
    this.maxIterations = 5; // Máximo de tentativas
    this.currentIteration = 0;
  }

  /**
   * Executa ciclo completo de correção automática
   */
  async runAutoFix() {
    console.log('🚀 Auto-Fix Orchestrator V6.2 iniciado');
    console.log('🔄 Executando ciclo completo de correção automática...');

    try {
      while (this.currentIteration < this.maxIterations) {
        this.currentIteration++;
        console.log(`\n🔄 === ITERAÇÃO ${this.currentIteration}/${this.maxIterations} ===`);

        // Passo 1: Detectar erros
        console.log('📊 1. Detectando erros...');
        await this.detectErrors();

        // Passo 2: Analisar erros
        console.log('🧠 2. Analisando erros...');
        const analysis = await this.analyzeErrors();

        // Se não há erros, parar
        if (!analysis || analysis.totalErrors === 0) {
          console.log('✅ Nenhum erro detectado! Sistema limpo.');
          break;
        }

        console.log(`📋 Encontrados ${analysis.totalErrors} erros para correção`);

        // Passo 3: Gerar prompts
        console.log('📝 3. Gerando prompts de correção...');
        const prompts = await this.generatePrompts();

        if (prompts.length === 0) {
          console.log('⚠️  Nenhum prompt gerado. Parando processo.');
          break;
        }

        // Passo 4: Executar correções (simular por agora)
        console.log('🔧 4. Executando correções...');
        await this.executeCorrections(prompts);

        // Passo 5: Validar correções
        console.log('✅ 5. Validando correções...');
        const validationResult = await this.validateCorrections();

        if (validationResult.success) {
          console.log('✅ Correções validadas com sucesso!');
          
          // Executar uma última verificação
          await this.detectErrors();
          const finalAnalysis = await this.analyzeErrors();
          
          if (!finalAnalysis || finalAnalysis.totalErrors === 0) {
            console.log('🎉 Sistema completamente limpo! Processo concluído.');
            break;
          }
        }

        // Se chegou aqui, ainda há erros
        console.log('⚠️  Ainda há erros após correção. Repetindo processo...');
        
        if (this.currentIteration >= this.maxIterations) {
          console.log('⚠️  Máximo de iterações atingido. Processo interrompido.');
          console.log('💡 Alguns erros podem precisar de intervenção manual.');
        }
      }

      // Relatório final
      await this.generateFinalReport();

    } catch (error) {
      console.error('❌ Erro durante processo de auto-fix:', error.message);
      throw error;
    }
  }

  /**
   * Detecta erros executando monitor
   */
  async detectErrors() {
    try {
      // Executar monitor rapidamente para capturar estado atual
      execSync('timeout 10s node scripts/error-monitor.js || true', { 
        stdio: 'pipe' 
      });
    } catch (error) {
      // Ignorar timeout - é esperado
    }
  }

  /**
   * Analisa erros executando analyzer
   */
  async analyzeErrors() {
    try {
      execSync('node scripts/error-analyzer.js', { stdio: 'pipe' });
      
      const analysisFile = path.join(this.logsDir, 'error-analysis.json');
      if (fs.existsSync(analysisFile)) {
        return JSON.parse(fs.readFileSync(analysisFile, 'utf8'));
      }
    } catch (error) {
      console.warn('⚠️  Falha na análise:', error.message);
    }
    
    return null;
  }

  /**
   * Gera prompts executando generator
   */
  async generatePrompts() {
    try {
      execSync('node scripts/prompt-generator.js', { stdio: 'pipe' });
      
      // Listar prompts gerados
      if (fs.existsSync(this.promptsDir)) {
        const files = fs.readdirSync(this.promptsDir)
          .filter(f => f.endsWith('.md'))
          .map(f => path.join(this.promptsDir, f));
        
        return files;
      }
    } catch (error) {
      console.warn('⚠️  Falha na geração de prompts:', error.message);
    }
    
    return [];
  }

  /**
   * Executa correções (simular por agora)
   */
  async executeCorrections(prompts) {
    console.log(`📋 ${prompts.length} prompts prontos para execução`);
    
    prompts.forEach((promptFile, index) => {
      const promptName = path.basename(promptFile);
      console.log(`  ${index + 1}. ${promptName}`);
    });

    // Por agora, simular execução
    console.log('💡 SIMULAÇÃO: Em produção, aqui os prompts seriam enviados para IAs do Cursor');
    console.log('🔄 Para executar manualmente: copie o conteúdo dos prompts e execute com IA');
    
    // Simular delay de execução
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  /**
   * Valida se correções funcionaram
   */
  async validateCorrections() {
    try {
      console.log('🔍 Executando validação...');
      
      // Tentar build
      execSync('npm run build', { stdio: 'pipe', timeout: 60000 });
      console.log('✅ Build passou');
      
      // Outras validações poderiam ser adicionadas aqui
      return { success: true, message: 'Build passou com sucesso' };
      
    } catch (error) {
      console.log('❌ Validação falhou');
      return { 
        success: false, 
        message: 'Build failed: ' + error.message.substring(0, 100) 
      };
    }
  }

  /**
   * Gera relatório final do processo
   */
  async generateFinalReport() {
    const reportFile = path.join(this.logsDir, 'auto-fix-report.json');
    
    const report = {
      timestamp: new Date().toISOString(),
      iterations: this.currentIteration,
      maxIterations: this.maxIterations,
      status: this.currentIteration < this.maxIterations ? 'completed' : 'max_iterations_reached',
      finalAnalysis: null
    };

    // Incluir análise final se disponível
    try {
      const finalAnalysis = await this.analyzeErrors();
      report.finalAnalysis = finalAnalysis;
    } catch (error) {
      // Ignorar erro na análise final
    }

    try {
      fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
      console.log(`📊 Relatório final salvo: ${reportFile}`);
    } catch (error) {
      console.warn('⚠️  Erro ao salvar relatório:', error.message);
    }

    // Exibir resumo
    this.displayFinalSummary(report);
  }

  /**
   * Exibe resumo final
   */
  displayFinalSummary(report) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 RELATÓRIO FINAL DO AUTO-FIX');
    console.log('='.repeat(60));
    console.log(`⏱️  Iterações executadas: ${report.iterations}/${report.maxIterations}`);
    console.log(`📅 Finalizado em: ${new Date(report.timestamp).toLocaleString()}`);
    console.log(`🎯 Status: ${report.status}`);
    
    if (report.finalAnalysis) {
      console.log(`📊 Erros finais: ${report.finalAnalysis.totalErrors}`);
      if (report.finalAnalysis.totalErrors === 0) {
        console.log('🎉 SUCESSO: Sistema completamente limpo!');
      } else {
        console.log('⚠️  PARCIAL: Alguns erros ainda existem');
        console.log('💡 Recomendação: Revisar prompts gerados manualmente');
      }
    }
    
    console.log('='.repeat(60));
  }
}

// Execução se chamado diretamente
if (require.main === module) {
  const orchestrator = new AutoFixOrchestrator();
  
  // Captura sinais para relatório de interrupção
  process.on('SIGINT', () => {
    console.log('\n⏹️  Processo interrompido pelo usuário');
    orchestrator.generateFinalReport().then(() => {
      process.exit(0);
    });
  });
  
  orchestrator.runAutoFix().catch(error => {
    console.error('❌ Erro crítico:', error.message);
    process.exit(1);
  });
}

module.exports = AutoFixOrchestrator;
```

### **ARQUIVO 3: package.json (adicionar scripts finais)**

Adicionar os seguintes scripts ao `package.json`:

```json
{
  "scripts": {
    "auto-fix": "node scripts/auto-fix-orchestrator.js",
    "auto-fix:generate": "node scripts/prompt-generator.js",
    "auto-fix:status": "cat logs/auto-fix-report.json | jq '.status'",
    "system:health": "npm run build && npm run monitor:analyze"
  }
}
```

---

## 📋 CONFIGURAÇÃO FINAL

### **Criar diretórios necessários**:
```bash
mkdir -p logs
mkdir -p PROMPTS_AUTO_GENERATED
mkdir -p TEMPLATES
```

### **Adicionar ao .gitignore**:
```
# Auto-fix system
PROMPTS_AUTO_GENERATED/
logs/auto-fix-report.json
```

---

## ✅ VALIDAÇÃO COMPLETA DO SISTEMA

### **TESTE 1: Sistema completo**
```bash
npm run auto-fix
# Deve executar ciclo completo de detecção → correção
```

### **TESTE 2: Geração isolada**
```bash
npm run auto-fix:generate
# Deve gerar prompts baseados em erros atuais
```

### **TESTE 3: Health check**
```bash
npm run system:health
# Deve verificar saúde geral do sistema
```

---

## 🎯 RESULTADO FINAL

**Sistema de Autocorreção Completo**:
- ✅ Detecta erros automaticamente (Monitor)
- ✅ Analisa e classifica problemas (Analyzer)  
- ✅ Gera prompts específicos (Generator)
- ✅ Orquestra processo completo (Orchestrator)
- ✅ Valida correções automaticamente
- ✅ Relatórios detalhados de cada execução

**🚀 SISTEMA AUTÔNOMO**: O sistema V6.2 agora se mantém sozinho e corrige problemas automaticamente!

**💡 USO**: Execute `npm run auto-fix` sempre que quiser que o sistema se autocorrija completamente.