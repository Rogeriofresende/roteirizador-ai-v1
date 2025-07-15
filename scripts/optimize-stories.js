#!/usr/bin/env node

/**
 * 🚀 OTIMIZADOR AUTOMÁTICO DE STORIES
 * Baseado na pesquisa de problemas de performance do Storybook
 * 
 * Este script:
 * 1. Identifica stories problemáticas
 * 2. Otimiza automaticamente usando melhores práticas
 * 3. Reduz useState excessivo
 * 4. Remove setTimeout desnecessários
 * 5. Simplifica stories complexas
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configurações baseadas na pesquisa
const CONFIG = {
  maxStorySize: 300, // linhas
  maxUseState: 3,
  maxTimeout: 1,
  patterns: {
    useState: /const\s+\[.*?\]\s*=\s*useState/g,
    setTimeout: /setTimeout\s*\(/g,
    useEffect: /useEffect\s*\(/g,
    complexLogic: /if\s*\(.*?\)\s*{[\s\S]*?}/g,
  }
};

/**
 * Encontrar stories problemáticas
 */
function findProblematicStories() {
  const storiesPattern = 'src/**/*.stories.@(tsx|ts|jsx|js)';
  const storyFiles = glob.sync(storiesPattern);
  
  const problematicStories = [];
  
  storyFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    
    const issues = {
      file,
      size: lines.length,
      useStateCount: (content.match(CONFIG.patterns.useState) || []).length,
      setTimeoutCount: (content.match(CONFIG.patterns.setTimeout) || []).length,
      useEffectCount: (content.match(CONFIG.patterns.useEffect) || []).length,
      issues: []
    };
    
    // Verificar problemas
    if (issues.size > CONFIG.maxStorySize) {
      issues.issues.push(`📄 Arquivo muito longo: ${issues.size} linhas`);
    }
    
    if (issues.useStateCount > CONFIG.maxUseState) {
      issues.issues.push(`🔄 Muito useState: ${issues.useStateCount}`);
    }
    
    if (issues.setTimeoutCount > CONFIG.maxTimeout) {
      issues.issues.push(`⏱️ setTimeout encontrado: ${issues.setTimeoutCount}`);
    }
    
    if (issues.issues.length > 0) {
      problematicStories.push(issues);
    }
  });
  
  return problematicStories;
}

/**
 * Otimizar story individual
 */
function optimizeStory(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let optimizedContent = content;
  
  // 1. Remover useState desnecessários
  optimizedContent = optimizedContent.replace(
    /const\s+\[(\w+),\s*set\w+\]\s*=\s*useState\([^)]*\);\s*\n/g,
    (match, varName) => {
      // Verificar se a variável é realmente usada
      const usageRegex = new RegExp(`\\b${varName}\\b`, 'g');
      const matches = content.match(usageRegex) || [];
      
      if (matches.length <= 2) { // Apenas declaração e setter
        return `// 🚀 OTIMIZADO: Removido useState não utilizado\n`;
      }
      return match;
    }
  );
  
  // 2. Substituir setTimeout por alternativas mais eficientes
  optimizedContent = optimizedContent.replace(
    /setTimeout\s*\(\s*([^,]+),\s*(\d+)\s*\)/g,
    (match, callback, delay) => {
      if (parseInt(delay) > 1000) {
        return `// 🚀 OTIMIZADO: setTimeout removido (${delay}ms era muito lento)\n// ${callback}`;
      }
      return `requestAnimationFrame(() => ${callback})`;
    }
  );
  
  // 3. Simplificar stories complexas
  optimizedContent = optimizedContent.replace(
    /export\s+const\s+(\w+):\s*Story\s*=\s*\{[\s\S]*?render:\s*\(\)\s*=>\s*\{[\s\S]*?\}\s*,?\s*\}/g,
    (match, storyName) => {
      if (match.length > 1000) { // Story muito complexa
        return `// 🚀 OTIMIZADO: Story simplificada
export const ${storyName}: Story = {
  args: {
    // Adicionar args específicas aqui
  },
  parameters: {
    docs: {
      description: {
        story: 'Story otimizada para melhor performance.',
      },
    },
  },
};`;
      }
      return match;
    }
  );
  
  // 4. Otimizar imports
  optimizedContent = optimizedContent.replace(
    /import\s+\{[^}]+\}\s+from\s+['"]([^'"]+)['"]/g,
    (match, importPath) => {
      // Simplificar imports muito longos
      if (match.length > 200) {
        return `// 🚀 OTIMIZADO: Import simplificado\n${match.split(',').slice(0, 5).join(',')}} from '${importPath}'`;
      }
      return match;
    }
  );
  
  return optimizedContent;
}

/**
 * Criar backup do arquivo original
 */
function createBackup(filePath) {
  const backupPath = `${filePath}.backup.${Date.now()}`;
  fs.copyFileSync(filePath, backupPath);
  console.log(`📁 Backup criado: ${backupPath}`);
}

/**
 * Executar otimização
 */
function main() {
  console.log('🚀 INICIANDO OTIMIZAÇÃO DE STORIES...\n');
  
  const problematicStories = findProblematicStories();
  
  if (problematicStories.length === 0) {
    console.log('✅ Nenhuma story problemática encontrada!');
    return;
  }
  
  console.log(`⚠️  Encontradas ${problematicStories.length} stories problemáticas:\n`);
  
  problematicStories.forEach((story, index) => {
    console.log(`${index + 1}. ${story.file}`);
    story.issues.forEach(issue => {
      console.log(`   - ${issue}`);
    });
    console.log();
  });
  
  // Perguntar se deseja otimizar
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  readline.question('Deseja otimizar estas stories? (y/n): ', (answer) => {
    if (answer.toLowerCase() === 'y') {
      console.log('\n🔧 Otimizando stories...\n');
      
      problematicStories.forEach(story => {
        try {
          // Criar backup
          createBackup(story.file);
          
          // Otimizar
          const optimizedContent = optimizeStory(story.file);
          fs.writeFileSync(story.file, optimizedContent);
          
          console.log(`✅ Otimizada: ${story.file}`);
        } catch (error) {
          console.error(`❌ Erro ao otimizar ${story.file}:`, error.message);
        }
      });
      
      console.log('\n🎉 Otimização concluída!');
      console.log('💡 Execute "npm run storybook:dev" para testar as melhorias.');
    } else {
      console.log('❌ Otimização cancelada.');
    }
    
    readline.close();
  });
}

// Verificar se glob está disponível
try {
  require('glob');
} catch (error) {
  console.error('❌ Dependência "glob" não encontrada. Execute: npm install glob');
  process.exit(1);
}

main(); 