#!/usr/bin/env node

/**
 * 🔍 STORYBOOK DIAGNOSTIC TOOL
 * Ferramenta para diagnosticar problemas no Storybook
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuração
const SRC_DIR = path.join(__dirname, '../src');
const STORIES_PATTERN = '**/*.stories.@(js|jsx|ts|tsx)';

// Cores para output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

// Função para buscar arquivos de stories
function findStoryFiles() {
  const glob = require('glob');
  return glob.sync(STORIES_PATTERN, { cwd: SRC_DIR });
}

// Analisar complexidade de uma story
function analyzeStoryComplexity(filePath) {
  const content = fs.readFileSync(path.join(SRC_DIR, filePath), 'utf8');
  
  const analysis = {
    fileName: filePath,
    lines: content.split('\n').length,
    imports: (content.match(/^import/gm) || []).length,
    exports: (content.match(/^export/gm) || []).length,
    useState: (content.match(/useState/g) || []).length,
    useEffect: (content.match(/useEffect/g) || []).length,
    stories: (content.match(/export const \w+: Story/g) || []).length,
    complexPatterns: [],
    issues: []
  };

  // Detectar padrões problemáticos
  if (analysis.lines > 500) {
    analysis.issues.push(`📄 Arquivo muito longo: ${analysis.lines} linhas`);
  }
  
  if (analysis.imports > 20) {
    analysis.issues.push(`📦 Muitas importações: ${analysis.imports}`);
  }
  
  if (analysis.useState > 5) {
    analysis.issues.push(`🔄 Muito estado: ${analysis.useState} useState`);
  }
  
  if (analysis.useEffect > 3) {
    analysis.issues.push(`⚡ Muitos effects: ${analysis.useEffect} useEffect`);
  }

  // Detectar padrões específicos problemáticos
  if (content.includes('Promise.all')) {
    analysis.complexPatterns.push('Promise.all (potential blocking)');
  }
  
  if (content.includes('setTimeout')) {
    analysis.complexPatterns.push('setTimeout (potential memory leak)');
  }
  
  if (content.includes('setInterval')) {
    analysis.complexPatterns.push('setInterval (potential memory leak)');
  }
  
  if (content.includes('fetch(')) {
    analysis.complexPatterns.push('fetch calls (potential network issues)');
  }

  return analysis;
}

// Função principal
function main() {
  console.log(`${colors.blue}🔍 STORYBOOK DIAGNOSTIC TOOL${colors.reset}`);
  console.log('=' .repeat(50));
  
  const storyFiles = findStoryFiles();
  console.log(`📚 Encontrados ${storyFiles.length} arquivos de stories`);
  
  let totalIssues = 0;
  let criticalFiles = [];
  
  // Analisar cada arquivo
  storyFiles.forEach(file => {
    const analysis = analyzeStoryComplexity(file);
    
    if (analysis.issues.length > 0) {
      console.log(`\n${colors.yellow}⚠️  ${file}${colors.reset}`);
      analysis.issues.forEach(issue => {
        console.log(`   ${issue}`);
      });
      totalIssues += analysis.issues.length;
    }
    
    if (analysis.complexPatterns.length > 0) {
      console.log(`   ${colors.red}🔴 Padrões complexos:${colors.reset}`);
      analysis.complexPatterns.forEach(pattern => {
        console.log(`     - ${pattern}`);
      });
    }
    
    // Arquivos críticos (múltiplos problemas)
    if (analysis.issues.length > 2 || analysis.complexPatterns.length > 1) {
      criticalFiles.push({
        file,
        score: analysis.issues.length + analysis.complexPatterns.length
      });
    }
  });
  
  // Resumo
  console.log('\n' + '=' .repeat(50));
  console.log(`${colors.blue}📊 RESUMO DO DIAGNÓSTICO${colors.reset}`);
  console.log(`Total de problemas: ${totalIssues}`);
  console.log(`Arquivos críticos: ${criticalFiles.length}`);
  
  if (criticalFiles.length > 0) {
    console.log(`\n${colors.red}🚨 ARQUIVOS CRÍTICOS (prioridade alta):${colors.reset}`);
    criticalFiles
      .sort((a, b) => b.score - a.score)
      .forEach(item => {
        console.log(`   ${item.file} (score: ${item.score})`);
      });
  }
  
  // Recomendações
  console.log(`\n${colors.green}💡 RECOMENDAÇÕES:${colors.reset}`);
  console.log('1. Simplifique stories com muitos useState/useEffect');
  console.log('2. Divida arquivos grandes em múltiplos arquivos');
  console.log('3. Use mocks ao invés de calls reais de API');
  console.log('4. Remova importações desnecessárias');
  console.log('5. Considere lazy loading para stories complexas');
  
  // Status final
  if (totalIssues === 0) {
    console.log(`\n${colors.green}✅ Storybook está otimizado!${colors.reset}`);
  } else if (totalIssues < 10) {
    console.log(`\n${colors.yellow}⚠️  Alguns problemas encontrados, mas manejáveis${colors.reset}`);
  } else {
    console.log(`\n${colors.red}🚨 Muitos problemas encontrados, requer atenção${colors.reset}`);
  }
}

// Executar
if (require.main === module) {
  main();
} 