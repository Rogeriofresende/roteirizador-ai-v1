#!/usr/bin/env node
/**
 * 📝 CREATE NATURAL LANGUAGE SPECIFICATION SCRIPT
 * 
 * Script automatizado para criar especificações V9.0 Natural Language First
 * Implementa Metodologia V9.0 - Sistema Revolucionário
 * 
 * @author IA Alpha - Requirements Analyst + Backend
 * @created 2025-07-19T15:00:00Z
 * @methodology V9.0_NATURAL_LANGUAGE_FIRST
 */

const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');

// 🎯 CONFIGURAÇÃO DO SCRIPT
const SPECS_DIR = path.join(__dirname, '../specs');
const TEMPLATE_PATH = path.join(__dirname, '../src/templates/roteirarNLSpecTemplate.md');

// 🔧 INTERFACE READLINE
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

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
  console.log(`${colors.bold}${colors.blue}🚀 CRIADOR DE ESPECIFICAÇÕES V9.0 NATURAL LANGUAGE FIRST${colors.reset}\n`);
  
  try {
    // Verificar se diretório specs existe
    await ensureSpecsDirectory();
    
    // Coletar informações básicas
    const specData = await collectSpecificationData();
    
    // Gerar especificação
    const specContent = await generateSpecification(specData);
    
    // Salvar arquivo
    const fileName = await saveSpecification(specData.title, specContent);
    
    console.log(`${colors.green}✅ Especificação criada com sucesso!${colors.reset}`);
    console.log(`📁 Arquivo: ${colors.bold}specs/${fileName}${colors.reset}`);
    console.log(`\n${colors.yellow}📋 Próximos passos:${colors.reset}`);
    console.log(`1. Editar a especificação em specs/${fileName}`);
    console.log(`2. Executar: ${colors.bold}npm run spec:validate${colors.reset}`);
    console.log(`3. Executar: ${colors.bold}npm run spec:generate${colors.reset}`);
    
  } catch (error) {
    console.error(`${colors.red}❌ Erro: ${error.message}${colors.reset}`);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// 📁 GARANTIR QUE DIRETÓRIO SPECS EXISTE
async function ensureSpecsDirectory() {
  try {
    await fs.access(SPECS_DIR);
  } catch (error) {
    console.log(`${colors.yellow}📁 Criando diretório specs...${colors.reset}`);
    await fs.mkdir(SPECS_DIR, { recursive: true });
  }
}

// 📝 COLETAR DADOS DA ESPECIFICAÇÃO
async function collectSpecificationData() {
  console.log(`${colors.blue}📋 Coleta de Informações Básicas${colors.reset}\n`);
  
  const specData = {};
  
  // Título da feature
  specData.title = await askQuestion('🎯 Título da Feature: ');
  
  // Categoria
  console.log('\n📂 Categorias disponíveis:');
  console.log('1. banco-de-ideias');
  console.log('2. geracao-roteiros');
  console.log('3. timeline-editor');
  console.log('4. pwa-features');
  console.log('5. colaboracao');
  console.log('6. export-import');
  
  const categoryChoice = await askQuestion('\n📂 Selecione categoria (1-6): ');
  const categories = ['banco-de-ideias', 'geracao-roteiros', 'timeline-editor', 'pwa-features', 'colaboracao', 'export-import'];
  specData.category = categories[parseInt(categoryChoice) - 1] || 'geral';
  
  // Prioridade
  console.log('\n🎯 Prioridades disponíveis:');
  console.log('1. Low');
  console.log('2. Medium'); 
  console.log('3. High');
  console.log('4. Critical');
  
  const priorityChoice = await askQuestion('\n🎯 Selecione prioridade (1-4): ');
  const priorities = ['Low', 'Medium', 'High', 'Critical'];
  specData.priority = priorities[parseInt(priorityChoice) - 1] || 'Medium';
  
  // Complexidade
  console.log('\n🔧 Complexidades disponíveis:');
  console.log('1. Simple');
  console.log('2. Medium');
  console.log('3. Complex');
  console.log('4. Enterprise');
  
  const complexityChoice = await askQuestion('\n🔧 Selecione complexidade (1-4): ');
  const complexities = ['Simple', 'Medium', 'Complex', 'Enterprise'];
  specData.complexity = complexities[parseInt(complexityChoice) - 1] || 'Medium';
  
  // Descrição básica
  specData.description = await askQuestion('\n📝 Descrição básica (o que será implementado): ');
  specData.justification = await askQuestion('💡 Justificativa (por que é necessário): ');
  
  // Timeline
  specData.timeline = await askQuestion('⏰ Timeline estimado (ex: Sprint 3 - 3 semanas): ');
  
  console.log(`\n${colors.green}✅ Informações coletadas com sucesso!${colors.reset}\n`);
  
  return specData;
}

// 🎨 GERAR ESPECIFICAÇÃO BASEADA NO TEMPLATE
async function generateSpecification(specData) {
  try {
    // Carregar template base
    const template = await fs.readFile(TEMPLATE_PATH, 'utf8');
    
    // Gerar ID único
    const specId = generateSpecId(specData.category);
    
    // Substituir placeholders no template
    let content = template
      .replace(/\[Nome da Feature\/Funcionalidade\]/g, specData.title)
      .replace(/\[Banco de Ideias \/ Geração de Roteiros \/ Timeline Editor \/ PWA Feature\]/g, formatCategory(specData.category))
      .replace(/\[Low \/ Medium \/ High \/ Critical\]/g, specData.priority)
      .replace(/\[Simple \/ Medium \/ Complex \/ Enterprise\]/g, specData.complexity)
      .replace(/\[Sprint X - Y semanas\]/g, specData.timeline)
      .replace(/\[Team Lead \/ Product Owner\]/g, 'Product Owner Roteirar IA');
    
    // Adicionar informações específicas coletadas
    content = content.replace(
      /Implementar sistema de tags inteligentes no Banco de Ideias para categorização automática e busca avançada das ideias de roteiro\./g,
      specData.description
    );
    
    content = content.replace(
      /Usuários têm dificuldade em encontrar ideias relevantes entre centenas de registros, impactando a produtividade criativa\./g,
      specData.justification
    );
    
    // Atualizar metadados
    const now = new Date();
    content = content.replace(/\*\*ID:\*\* ROIA-BDI-001/g, `**ID:** ${specId}`);
    content = content.replace(/\*\*Data:\*\* [0-9]{4}-[0-9]{2}-[0-9]{2}/g, `**Data:** ${now.toISOString().split('T')[0]}`);
    
    return content;
    
  } catch (error) {
    throw new Error(`Erro ao gerar especificação: ${error.message}`);
  }
}

// 🆔 GERAR ID ÚNICO PARA ESPECIFICAÇÃO
function generateSpecId(category) {
  const prefixes = {
    'banco-de-ideias': 'ROIA-BDI',
    'geracao-roteiros': 'ROIA-GR',
    'timeline-editor': 'ROIA-TL',
    'pwa-features': 'ROIA-PWA',
    'colaboracao': 'ROIA-COL',
    'export-import': 'ROIA-EXP'
  };
  
  const prefix = prefixes[category] || 'ROIA-GEN';
  const timestamp = Date.now().toString().slice(-6); // Últimos 6 dígitos
  
  return `${prefix}-${timestamp}`;
}

// 🏷️ FORMATAR CATEGORIA
function formatCategory(category) {
  const categories = {
    'banco-de-ideias': 'Banco de Ideias',
    'geracao-roteiros': 'Geração de Roteiros',
    'timeline-editor': 'Timeline Editor',
    'pwa-features': 'PWA Features',
    'colaboracao': 'Colaboração',
    'export-import': 'Export/Import'
  };
  
  return categories[category] || 'Geral';
}

// 💾 SALVAR ESPECIFICAÇÃO
async function saveSpecification(title, content) {
  // Gerar nome do arquivo
  const fileName = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') + '.md';
  
  const filePath = path.join(SPECS_DIR, fileName);
  
  // Verificar se arquivo já existe
  try {
    await fs.access(filePath);
    const overwrite = await askQuestion(`⚠️  Arquivo ${fileName} já existe. Sobrescrever? (s/N): `);
    if (!overwrite.toLowerCase().startsWith('s')) {
      throw new Error('Operação cancelada pelo usuário');
    }
  } catch (error) {
    // Arquivo não existe, tudo bem
  }
  
  // Salvar arquivo
  await fs.writeFile(filePath, content, 'utf8');
  
  return fileName;
}

// ❓ FUNÇÃO AUXILIAR PARA PERGUNTAS
function askQuestion(question) {
  return new Promise(resolve => {
    rl.question(`${colors.yellow}${question}${colors.reset}`, answer => {
      resolve(answer.trim());
    });
  });
}

// 🏃‍♂️ EXECUTAR SCRIPT
if (require.main === module) {
  main();
}

module.exports = {
  collectSpecificationData,
  generateSpecification,
  saveSpecification
};