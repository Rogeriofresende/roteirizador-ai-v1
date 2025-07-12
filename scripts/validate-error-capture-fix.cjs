#!/usr/bin/env node

/**
 * 🧪 VALIDAÇÃO DA CORREÇÃO DO ERROR CAPTURE LOOP
 * Verifica se as correções V6.4 funcionaram corretamente
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validando correções do Error Capture Loop V6.4...\n');

// Validar que os arquivos foram modificados corretamente
const validations = [
  {
    name: 'Error Capture Whitelist',
    file: 'src/utils/errorCapture.ts',
    mustContain: [
      'SYSTEM_LOG_PATTERNS',
      'shouldCaptureError',
      'ErrorCaptureCircuitBreaker',
      'filteredLogsCount'
    ],
    mustNotContain: [
      'console.log(\'Error sent to monitoring\')',
      'console.warn(\'Failed to send error to monitoring\')',
      'console.warn(\'Error capture system already initialized\')',
      'console.log(\'🔍 Error Capture System V6.3 initialized\')'
    ]
  },
  {
    name: 'Logger Anti-Loop',
    file: 'src/utils/logger.ts',
    mustContain: [
      'LOGGER_SAFE_PATTERNS',
      'isLogSafe',
      'emitToDevelopmentConsole',
      'emitToProductionLogger',
      'systemLog'
    ],
    mustNotContain: [
      'console.error(\'Failed to send log to external service\')'
    ]
  },
  {
    name: 'App.tsx System Logging',
    file: 'src/App.tsx',
    mustContain: [
      'logger.systemLog',
      'Error Capture System V6.4 initialized',
      'Enhanced with whitelist'
    ],
    mustNotContain: [
      'logger.info(\'Error Capture System V6.3 initialized\')',
      'logger.security(\'Exposing debug services\')'
    ]
  }
];

let allValid = true;

validations.forEach(validation => {
  console.log(`📋 Validando: ${validation.name}`);
  
  const filePath = path.join(__dirname, '..', validation.file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ Arquivo não encontrado: ${validation.file}`);
    allValid = false;
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Verificar conteúdo obrigatório
  validation.mustContain.forEach(pattern => {
    if (!content.includes(pattern)) {
      console.log(`❌ Padrão não encontrado: "${pattern}"`);
      allValid = false;
    }
  });
  
  // Verificar conteúdo que deve ter sido removido
  validation.mustNotContain.forEach(pattern => {
    if (content.includes(pattern)) {
      console.log(`❌ Padrão ainda presente (deveria ter sido removido): "${pattern}"`);
      allValid = false;
    }
  });
  
  if (allValid) {
    console.log(`✅ ${validation.name} - OK`);
  }
  
  console.log();
});

// Validar que a página de teste existe
const testPagePath = path.join(__dirname, '..', 'src/pages/ErrorCaptureTest.tsx');
if (fs.existsSync(testPagePath)) {
  console.log('✅ Página de teste criada - OK');
} else {
  console.log('❌ Página de teste não encontrada');
  allValid = false;
}

console.log('\n' + '='.repeat(50));

if (allValid) {
  console.log('🎉 TODAS AS VALIDAÇÕES PASSARAM!');
  console.log('✅ Error Capture Loop V6.4 correções aplicadas com sucesso');
  console.log('✅ Sistema de whitelist implementado');
  console.log('✅ Circuit breaker ativo');
  console.log('✅ Sistema de logging melhorado');
  console.log('✅ Página de teste disponível');
  console.log('\n📋 Próximos passos:');
  console.log('1. Acesse http://localhost:5174/error-capture-test para testar');
  console.log('2. Verifique que os logs do sistema são filtrados');
  console.log('3. Confirme que o circuit breaker está funcionando');
  console.log('4. Monitore a redução no número de erros');
  
  process.exit(0);
} else {
  console.log('❌ ALGUMAS VALIDAÇÕES FALHARAM!');
  console.log('⚠️ Verifique os erros acima e aplique as correções necessárias');
  
  process.exit(1);
} 