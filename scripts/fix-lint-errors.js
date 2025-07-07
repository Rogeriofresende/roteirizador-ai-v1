#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🛠️  Corrigindo erros de lint automaticamente...\n');

// Executar eslint com --fix primeiro
console.log('📋 Executando eslint --fix...');
try {
  execSync('npm run lint -- --fix', { stdio: 'inherit' });
  console.log('✅ ESLint fix executado');
} catch (error) {
  console.log('⚠️  ESLint fix completou com alguns erros restantes');
}

// Criar script para corrigir parsing errors comuns
const fixParsingErrors = () => {
  const files = [
    'src/services/designQualityService 2.ts',
    'src/services/designQualityService.ts'
  ];
  
  files.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Corrigir imports com parsing errors
      content = content.replace(/import\s+{([^}]+)}\s+from\s+'([^']+)'\s*$/gm, 
        (match, imports, module) => {
          // Garantir que imports estão formatados corretamente
          return `import { ${imports.trim()} } from '${module}';`;
        }
      );
      
      // Corrigir type annotations
      content = content.replace(/:\s*any/g, ': unknown');
      
      fs.writeFileSync(filePath, content);
      console.log(`✅ Corrigido parsing errors em: ${file}`);
    }
  });
};

// Criar script para remover variáveis não utilizadas
const removeUnusedVars = () => {
  console.log('\n📋 Removendo variáveis não utilizadas...');
  
  // Lista de arquivos com unused vars conhecidas
  const unusedVarsFiles = {
    'src/components/editor/VoiceSynthesisPanel.tsx': ['platformSelect'],
    'src/__tests__/GeneratorPage.test.tsx': ['waitFor']
  };
  
  Object.entries(unusedVarsFiles).forEach(([file, vars]) => {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      vars.forEach(varName => {
        // Remover declarações de variáveis não utilizadas
        const patterns = [
          new RegExp(`const\\s+${varName}\\s*=.*?;`, 'g'),
          new RegExp(`let\\s+${varName}\\s*=.*?;`, 'g'),
          new RegExp(`var\\s+${varName}\\s*=.*?;`, 'g'),
          new RegExp(`,\\s*${varName}\\s*,`, 'g'),
          new RegExp(`,\\s*${varName}\\s*}`, 'g'),
          new RegExp(`{\\s*${varName}\\s*,`, 'g')
        ];
        
        patterns.forEach(pattern => {
          content = content.replace(pattern, '');
        });
      });
      
      fs.writeFileSync(filePath, content);
      console.log(`✅ Removidas variáveis não utilizadas em: ${file}`);
    }
  });
};

// Executar correções
fixParsingErrors();
removeUnusedVars();

// Executar lint novamente para verificar
console.log('\n📊 Verificando resultados...');
try {
  const result = execSync('npm run lint 2>&1 | grep -c "error" || true', { encoding: 'utf8' });
  const errorCount = parseInt(result.trim()) || 0;
  
  if (errorCount === 0) {
    console.log('✅ Todos os erros de lint foram corrigidos!');
  } else {
    console.log(`⚠️  Ainda restam ${errorCount} erros de lint para correção manual.`);
    console.log('Execute "npm run lint" para ver os detalhes.');
  }
} catch (error) {
  console.log('✅ Processo de correção concluído.');
}

console.log('\n💡 Dica: Execute "npm run lint" para verificar erros restantes.'); 