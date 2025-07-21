#!/usr/bin/env node
/**
 * ✅ VALIDATE NATURAL LANGUAGE SPECIFICATIONS SCRIPT
 * 
 * Script automatizado para validar especificações V9.0 Natural Language First
 * Implementa Metodologia V9.0 - Sistema Revolucionário
 * 
 * @author IA Charlie - Implementation Planner + Testing
 * @created 2025-07-19T15:15:00Z
 * @methodology V9.0_NATURAL_LANGUAGE_FIRST
 */

const fs = require('fs').promises;
const path = require('path');

// 🎯 CONFIGURAÇÃO DO SCRIPT
const SPECS_DIR = path.join(__dirname, '../specs');
const VALIDATION_THRESHOLDS = {
  MIN_OVERALL_SCORE: 0.75,
  MIN_COMPLETENESS: 0.80,
  MIN_CLARITY: 0.70,
  MIN_TESTABILITY: 0.80
};

// 🎨 CORES PARA OUTPUT
const colors = {
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// 🚀 FUNÇÃO PRINCIPAL
async function main() {
  console.log(`${colors.bold}${colors.blue}✅ VALIDADOR DE ESPECIFICAÇÕES V9.0 NATURAL LANGUAGE FIRST${colors.reset}\n`);
  
  try {
    // Encontrar arquivos de especificação
    const specFiles = await findSpecificationFiles();
    
    if (specFiles.length === 0) {
      console.log(`${colors.yellow}⚠️  Nenhuma especificação encontrada em ${SPECS_DIR}${colors.reset}`);
      console.log(`💡 Execute: ${colors.bold}npm run spec:create${colors.reset} para criar uma nova especificação`);
      return;
    }
    
    console.log(`📋 Encontradas ${specFiles.length} especificação(ões) para validar\n`);
    
    let allValid = true;
    const results = [];
    
    // Validar cada especificação
    for (const specFile of specFiles) {
      console.log(`${colors.blue}📝 Validando: ${specFile}${colors.reset}`);
      
      const validation = await validateSpecification(specFile);
      results.push({ file: specFile, validation });
      
      displayValidationResult(specFile, validation);
      
      if (!validation.isValid) {
        allValid = false;
      }
      
      console.log(''); // Linha em branco
    }
    
    // Resumo geral
    displaySummary(results, allValid);
    
    // Exit code baseado na validação
    process.exit(allValid ? 0 : 1);
    
  } catch (error) {
    console.error(`${colors.red}❌ Erro: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// 📁 ENCONTRAR ARQUIVOS DE ESPECIFICAÇÃO
async function findSpecificationFiles() {
  try {
    const files = await fs.readdir(SPECS_DIR);
    return files.filter(file => file.endsWith('.md') && !file.startsWith('_'));
  } catch (error) {
    return [];
  }
}

// ✅ VALIDAR ESPECIFICAÇÃO
async function validateSpecification(fileName) {
  const filePath = path.join(SPECS_DIR, fileName);
  
  try {
    const content = await fs.readFile(filePath, 'utf8');
    
    // Executar validações
    const completeness = validateCompleteness(content);
    const clarity = validateClarity(content);
    const testability = validateTestability(content);
    
    // Calcular score geral
    const score = (completeness.score + clarity.score + testability.score) / 3;
    
    // Determinar se é válido
    const isValid = score >= VALIDATION_THRESHOLDS.MIN_OVERALL_SCORE &&
                   completeness.score >= VALIDATION_THRESHOLDS.MIN_COMPLETENESS &&
                   clarity.score >= VALIDATION_THRESHOLDS.MIN_CLARITY &&
                   testability.score >= VALIDATION_THRESHOLDS.MIN_TESTABILITY;
    
    // Coletar issues
    const issues = [
      ...completeness.issues,
      ...clarity.issues,
      ...testability.issues
    ];
    
    // Gerar sugestões
    const suggestions = generateSuggestions(completeness, clarity, testability);
    
    return {
      isValid,
      score,
      completeness: completeness.score,
      clarity: clarity.score,
      testability: testability.score,
      issues,
      suggestions,
      lastValidated: new Date()
    };
    
  } catch (error) {
    throw new Error(`Erro ao validar ${fileName}: ${error.message}`);
  }
}

// 📊 VALIDAR COMPLETUDE
function validateCompleteness(content) {
  const requiredSections = [
    'METADADOS',
    'VISÃO GERAL',
    'EXPERIÊNCIA DO USUÁRIO',
    'COMPORTAMENTO TÉCNICO',
    'CRITÉRIOS DE SUCESSO',
    'CONSTRAINTS E DEPENDÊNCIAS'
  ];
  
  const issues = [];
  let sectionsFound = 0;
  
  // Verificar seções obrigatórias
  for (const section of requiredSections) {
    if (content.includes(section)) {
      sectionsFound++;
    } else {
      issues.push({
        type: 'error',
        section: section,
        message: `Seção obrigatória "${section}" não encontrada`,
        severity: 'high',
        fixable: false
      });
    }
  }
  
  // Verificar campos específicos obrigatórios
  const requiredFields = [
    { field: 'Título', pattern: /\*\*Título\*\*/ },
    { field: 'Categoria', pattern: /\*\*Categoria\*\*/ },
    { field: 'Prioridade', pattern: /\*\*Prioridade\*\*/ },
    { field: 'O QUE', pattern: /\*\*O QUE\*\*/ },
    { field: 'POR QUE', pattern: /\*\*POR QUE\*\*/ },
    { field: 'QUEM', pattern: /\*\*QUEM\*\*/ },
    { field: 'User Journey', pattern: /\*\*🚶‍♂️ JORNADA DO USUÁRIO\*\*/ }
  ];
  
  let fieldsFound = 0;
  for (const field of requiredFields) {
    if (field.pattern.test(content)) {
      fieldsFound++;
    } else {
      issues.push({
        type: 'warning',
        section: 'Campos obrigatórios',
        message: `Campo "${field.field}" não encontrado ou mal formatado`,
        severity: 'medium',
        fixable: true
      });
    }
  }
  
  // Calcular score
  const sectionScore = sectionsFound / requiredSections.length;
  const fieldScore = fieldsFound / requiredFields.length;
  const score = (sectionScore + fieldScore) / 2;
  
  return { score, issues };
}

// 🔍 VALIDAR CLAREZA
function validateClarity(content) {
  const issues = [];
  let clarityScore = 1.0;
  
  // Verificar se descrições são muito vagas
  const vagueTerms = ['algo', 'alguma coisa', 'etc', 'entre outros', 'e assim por diante'];
  for (const term of vagueTerms) {
    if (content.toLowerCase().includes(term)) {
      issues.push({
        type: 'suggestion',
        section: 'Clareza',
        message: `Evitar termos vagos como "${term}"`,
        severity: 'low',
        fixable: true
      });
      clarityScore -= 0.05;
    }
  }
  
  // Verificar se comportamentos são mensuráveis
  const behaviorSections = content.match(/\*\*Comportamento:\*\*(.*?)(?=\*\*|$)/gs) || [];
  let measurableBehaviors = 0;
  
  for (const behavior of behaviorSections) {
    const hasMeasurableTerms = /\b(tempo|segundos|minutos|percentual|número|quantidade|taxa|score)\b/i.test(behavior);
    if (hasMeasurableTerms) {
      measurableBehaviors++;
    }
  }
  
  if (behaviorSections.length > 0) {
    const measurabilityRatio = measurableBehaviors / behaviorSections.length;
    if (measurabilityRatio < 0.5) {
      issues.push({
        type: 'warning',
        section: 'Comportamentos',
        message: 'Poucos comportamentos são mensuráveis. Adicione métricas específicas.',
        severity: 'medium',
        fixable: true
      });
      clarityScore -= 0.1;
    }
  }
  
  // Verificar tamanho das descrições
  const descriptions = content.match(/\*\*Descrição:\*\*(.*?)(?=\*\*|$)/gs) || [];
  for (const desc of descriptions) {
    if (desc.length < 50) {
      issues.push({
        type: 'suggestion',
        section: 'Descrições',
        message: 'Descrição muito curta. Adicione mais contexto.',
        severity: 'low',
        fixable: true
      });
      clarityScore -= 0.05;
    }
  }
  
  const score = Math.max(0, clarityScore);
  return { score, issues };
}

// 🧪 VALIDAR TESTABILIDADE
function validateTestability(content) {
  const issues = [];
  let testabilityScore = 1.0;
  
  // Verificar se há critérios de aceitação
  const hasAcceptanceCriteria = /critério de aceitação|acceptance|aceitação/i.test(content);
  if (!hasAcceptanceCriteria) {
    issues.push({
      type: 'error',
      section: 'Critérios de Sucesso',
      message: 'Nenhum critério de aceitação encontrado',
      severity: 'high',
      fixable: true
    });
    testabilityScore -= 0.2;
  }
  
  // Verificar se comportamentos são testáveis
  const testableKeywords = ['verificar', 'validar', 'testar', 'medir', 'confirmar'];
  let testableStatements = 0;
  
  for (const keyword of testableKeywords) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    const matches = content.match(regex) || [];
    testableStatements += matches.length;
  }
  
  if (testableStatements < 3) {
    issues.push({
      type: 'warning',
      section: 'Testabilidade',
      message: 'Poucos comportamentos testáveis identificados. Use verbos como "verificar", "validar", "medir".',
      severity: 'medium',
      fixable: true
    });
    testabilityScore -= 0.15;
  }
  
  // Verificar métricas quantificáveis
  const hasMetrics = /\d+%|\d+\s*(segundo|minuto|ms|seg)|\d+\s*vezes|>\s*\d+|<\s*\d+/g.test(content);
  if (!hasMetrics) {
    issues.push({
      type: 'warning',
      section: 'Métricas',
      message: 'Poucas métricas quantificáveis encontradas. Adicione números específicos.',
      severity: 'medium',
      fixable: true
    });
    testabilityScore -= 0.1;
  }
  
  const score = Math.max(0, testabilityScore);
  return { score, issues };
}

// 💡 GERAR SUGESTÕES
function generateSuggestions(completeness, clarity, testability) {
  const suggestions = [];
  
  if (completeness.score < 0.9) {
    suggestions.push('Adicione mais detalhes nas seções obrigatórias');
  }
  
  if (clarity.score < 0.8) {
    suggestions.push('Use linguagem mais específica e evite termos vagos');
    suggestions.push('Adicione exemplos concretos para clarificar requisitos');
  }
  
  if (testability.score < 0.8) {
    suggestions.push('Defina critérios de aceitação mensuráveis');
    suggestions.push('Adicione métricas quantificáveis (tempo, percentual, quantidade)');
  }
  
  return suggestions;
}

// 📊 EXIBIR RESULTADO DA VALIDAÇÃO
function displayValidationResult(fileName, validation) {
  const statusIcon = validation.isValid ? '✅' : '❌';
  const statusText = validation.isValid ? 'VÁLIDA' : 'INVÁLIDA';
  const statusColor = validation.isValid ? colors.green : colors.red;
  
  console.log(`${statusIcon} ${statusColor}${statusText}${colors.reset} - Score: ${(validation.score * 100).toFixed(1)}%`);
  
  // Mostrar métricas detalhadas
  console.log(`   📊 Completude: ${getScoreIndicator(validation.completeness)} ${(validation.completeness * 100).toFixed(1)}%`);
  console.log(`   🔍 Clareza: ${getScoreIndicator(validation.clarity)} ${(validation.clarity * 100).toFixed(1)}%`);
  console.log(`   🧪 Testabilidade: ${getScoreIndicator(validation.testability)} ${(validation.testability * 100).toFixed(1)}%`);
  
  // Mostrar issues se houver
  if (validation.issues.length > 0) {
    console.log(`\n   🚨 Issues encontrados (${validation.issues.length}):`);
    for (const issue of validation.issues.slice(0, 3)) { // Mostrar apenas os 3 primeiros
      const icon = getIssueIcon(issue.type);
      console.log(`   ${icon} ${issue.message} (${issue.section})`);
    }
    
    if (validation.issues.length > 3) {
      console.log(`   ... e mais ${validation.issues.length - 3} issues`);
    }
  }
  
  // Mostrar sugestões principais
  if (validation.suggestions.length > 0) {
    console.log(`\n   💡 Sugestões principais:`);
    for (const suggestion of validation.suggestions.slice(0, 2)) {
      console.log(`   • ${suggestion}`);
    }
  }
}

// 📈 INDICADOR DE SCORE
function getScoreIndicator(score) {
  if (score >= 0.9) return '🟢';
  if (score >= 0.7) return '🟡';
  return '🔴';
}

// 🎯 ÍCONE DE ISSUE
function getIssueIcon(type) {
  switch (type) {
    case 'error': return '❌';
    case 'warning': return '⚠️';
    case 'suggestion': return '💡';
    default: return 'ℹ️';
  }
}

// 📋 EXIBIR RESUMO GERAL
function displaySummary(results, allValid) {
  console.log(`${colors.bold}📊 RESUMO GERAL${colors.reset}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  
  const validCount = results.filter(r => r.validation.isValid).length;
  const totalCount = results.length;
  
  console.log(`📝 Especificações analisadas: ${totalCount}`);
  console.log(`✅ Válidas: ${colors.green}${validCount}${colors.reset}`);
  console.log(`❌ Inválidas: ${colors.red}${totalCount - validCount}${colors.reset}`);
  
  // Score médio
  const avgScore = results.reduce((sum, r) => sum + r.validation.score, 0) / totalCount;
  console.log(`📊 Score médio: ${getScoreIndicator(avgScore)} ${(avgScore * 100).toFixed(1)}%`);
  
  // Status final
  if (allValid) {
    console.log(`\n${colors.green}🎉 Todas as especificações estão válidas!${colors.reset}`);
    console.log(`💡 Próximo passo: ${colors.bold}npm run spec:generate${colors.reset}`);
  } else {
    console.log(`\n${colors.red}⚠️  Algumas especificações precisam de ajustes${colors.reset}`);
    console.log(`💡 Corrija os issues encontrados e execute novamente`);
  }
}

// 🏃‍♂️ EXECUTAR SCRIPT
if (require.main === module) {
  main();
}

module.exports = {
  validateSpecification,
  validateCompleteness,
  validateClarity,
  validateTestability
};