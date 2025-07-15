#!/usr/bin/env node

/**
 * 🔍 STORYBOOK QUICK HEALTH CHECK
 * Verificação rápida e prática - focada em resultados imediatos
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔍 VERIFICANDO STORYBOOK - ANÁLISE RÁPIDA\n');

// 1. Verificar se está rodando
try {
  const processes = execSync('ps aux | grep storybook', { encoding: 'utf8' });
  const storybookProcesses = processes.split('\n').filter(line => 
    line.includes('storybook dev') && !line.includes('grep')
  );
  
  if (storybookProcesses.length > 0) {
    console.log('✅ STORYBOOK RODANDO:');
    storybookProcesses.forEach(proc => {
      const pid = proc.trim().split(/\s+/)[1];
      console.log(`   📦 PID: ${pid} - Porta 6006`);
    });
  } else {
    console.log('❌ STORYBOOK NÃO ESTÁ RODANDO');
  }
} catch (error) {
  console.log('❌ ERRO AO VERIFICAR PROCESSOS:', error.message);
}

// 2. Verificar acessibilidade
try {
  const curlResult = execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:6006', 
    { encoding: 'utf8', timeout: 5000 });
  
  if (curlResult.trim() === '200') {
    console.log('✅ STORYBOOK ACESSÍVEL: http://localhost:6006');
  } else {
    console.log(`❌ STORYBOOK NÃO ACESSÍVEL: Status ${curlResult.trim()}`);
  }
} catch (error) {
  console.log('❌ STORYBOOK NÃO RESPONDE');
}

// 3. Verificar build errors recentes
try {
  console.log('\n📋 VERIFICANDO LOGS RECENTES:');
  const logFiles = [
    './logs/day-20250709/lint-errors-1208.txt',
    './logs/day-20250711/lint-errors-1609.txt'
  ];
  
  logFiles.forEach(logFile => {
    if (fs.existsSync(logFile)) {
      const content = fs.readFileSync(logFile, 'utf8');
      const storybookErrors = content.split('\n').filter(line => 
        line.includes('storybook') || line.includes('stories')
      );
      
      if (storybookErrors.length > 0) {
        console.log(`⚠️  ${logFile}:`);
        storybookErrors.slice(0, 3).forEach(error => 
          console.log(`   ${error.substring(0, 80)}...`)
        );
      }
    }
  });
} catch (error) {
  console.log('⚠️  Não foi possível verificar logs');
}

// 4. Verificar status dos stories
try {
  console.log('\n📚 VERIFICANDO STORIES:');
  const storybookFiles = execSync('find src -name "*.stories.tsx" -o -name "*.stories.ts"', 
    { encoding: 'utf8' });
  const storyFiles = storybookFiles.trim().split('\n').filter(f => f);
  
  console.log(`📊 TOTAL DE STORIES: ${storyFiles.length} arquivos`);
  
  // Verificar se há erros de TypeScript nos stories
  try {
    execSync('npx tsc --noEmit --project .storybook/tsconfig.json', 
      { encoding: 'utf8', stdio: 'pipe' });
    console.log('✅ TypeScript: Sem erros nos stories');
  } catch (tscError) {
    const errorOutput = tscError.stdout || tscError.stderr || '';
    const storyTSErrors = errorOutput.split('\n').filter(line => 
      line.includes('.stories.') && line.includes('error')
    );
    
    if (storyTSErrors.length > 0) {
      console.log(`❌ TypeScript: ${storyTSErrors.length} erros nos stories`);
      storyTSErrors.slice(0, 3).forEach(error => 
        console.log(`   ${error.substring(0, 80)}...`)
      );
    }
  }
} catch (error) {
  console.log('⚠️  Não foi possível verificar stories');
}

console.log('\n🎯 PRÓXIMOS PASSOS PROFISSIONAIS:');
console.log('1. 🌐 Acesse: http://localhost:6006');
console.log('2. 🔍 Verifique console do browser (F12)');
console.log('3. 📊 Execute análise completa: node scripts/professional-debugging-storybook.js');
console.log('4. 🚀 Para restart: npm run storybook:dev');

console.log('\n💡 DICA PROFISSIONAL:');
console.log('Em empresas reais, isso seria monitorado automaticamente com:');
console.log('- Sentry para errors em tempo real');
console.log('- Chromatic para visual regression testing');  
console.log('- CI/CD com health checks automáticos'); 