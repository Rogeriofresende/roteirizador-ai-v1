#!/usr/bin/env node

/**
 * Prompt Generator V6.2 - Geração Automática de Prompts de Correção
 * Cria prompts específicos baseados nos erros detectados
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
const generator = new PromptGenerator();

generator.generatePrompts().catch(error => {
  console.error('❌ Erro na geração de prompts:', error.message);
  process.exit(1);
});

export default PromptGenerator; 