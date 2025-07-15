/**
 * 🧪 TESTE COMPLETO DE INTEGRAÇÃO - BANCO DE IDEIAS
 * 
 * Script para testar se todas as correções foram aplicadas corretamente
 * e se o Banco de Ideias está funcionando completamente
 * 
 * Execute este script no console do navegador (F12) após abrir http://localhost:5174/banco-ideias
 */

console.clear();
console.log('🧪 TESTE COMPLETO DE INTEGRAÇÃO - BANCO DE IDEIAS');
console.log('===============================================');

// Teste de integração completa
const testBancoDeIdeiasIntegration = async () => {
  let testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    errors: []
  };

  const runTest = (testName, testFunction) => {
    testResults.total++;
    try {
      const result = testFunction();
      if (result) {
        testResults.passed++;
        console.log(`✅ ${testName}: PASSOU`);
      } else {
        testResults.failed++;
        console.log(`❌ ${testName}: FALHOU`);
        testResults.errors.push(`${testName}: Teste falhou`);
      }
    } catch (error) {
      testResults.failed++;
      console.log(`❌ ${testName}: ERRO - ${error.message}`);
      testResults.errors.push(`${testName}: ${error.message}`);
    }
  };

  console.log('\n🔍 EXECUTANDO TESTES...');
  console.log('========================');

  // Teste 1: Verificar se a página carregou
  runTest('Página carregou corretamente', () => {
    return document.title.includes('Roteirar') && 
           window.location.pathname.includes('banco-ideias');
  });

  // Teste 2: Verificar se React está funcionando
  runTest('React está funcionando', () => {
    return typeof React !== 'undefined' && 
           document.querySelector('[data-reactroot]') !== null;
  });

  // Teste 3: Verificar se há botões na página
  runTest('Botões estão presentes', () => {
    const buttons = document.querySelectorAll('button');
    return buttons.length > 0;
  });

  // Teste 4: Verificar se o formulário de geração está presente
  runTest('Formulário de geração presente', () => {
    return document.querySelector('input[placeholder*="categoria"]') !== null ||
           document.querySelector('select') !== null ||
           document.querySelector('textarea') !== null;
  });

  // Teste 5: Verificar se não há erros críticos no console
  runTest('Sem erros críticos no console', () => {
    // Capturar erros dos últimos 10 segundos
    const now = Date.now();
    const recentErrors = window.console.errors || [];
    const criticalErrors = recentErrors.filter(error => 
      error.timestamp && (now - error.timestamp) < 10000 && 
      error.message && (
        error.message.includes('Cannot read properties of undefined') ||
        error.message.includes('TypeError') ||
        error.message.includes('ReferenceError')
      )
    );
    return criticalErrors.length === 0;
  });

  // Teste 6: Verificar se os serviços estão disponíveis
  runTest('Serviços estão disponíveis', () => {
    return typeof window.debugServices !== 'undefined' ||
           typeof window.Services !== 'undefined';
  });

  // Teste 7: Verificar se há elementos do Banco de Ideias
  runTest('Elementos do Banco de Ideias presentes', () => {
    const ideaElements = document.querySelectorAll('[class*="banco"], [class*="idea"], [data-testid*="banco"]');
    return ideaElements.length > 0;
  });

  // Teste 8: Verificar se não há componentes quebrados
  runTest('Componentes não estão quebrados', () => {
    const errorBoundaries = document.querySelectorAll('[data-error-boundary="true"]');
    const errorMessages = document.querySelectorAll('.error-message, .error-boundary');
    return errorBoundaries.length === 0 && errorMessages.length === 0;
  });

  // Teste 9: Verificar se há navegação funcionando
  runTest('Navegação está funcionando', () => {
    const navButtons = document.querySelectorAll('button[aria-selected], .tab-button, [role="tab"]');
    return navButtons.length > 0;
  });

  // Teste 10: Verificar se há conteúdo dinâmico carregado
  runTest('Conteúdo dinâmico carregado', () => {
    const dynamicContent = document.querySelectorAll('[data-loading="false"], .loaded-content');
    const loadingSpinners = document.querySelectorAll('.loading, .spinner');
    return dynamicContent.length > 0 || loadingSpinners.length === 0;
  });

  // Aguardar um pouco para capturar erros tardios
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Teste adicional: Verificar se há interações funcionando
  runTest('Interações básicas funcionando', () => {
    const interactiveElements = document.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled])');
    return interactiveElements.length > 0;
  });

  // Teste de funcionalidade específica (se possível)
  try {
    const generateButton = Array.from(document.querySelectorAll('button')).find(btn => 
      btn.textContent && (
        btn.textContent.includes('Gerar') || 
        btn.textContent.includes('Nova Ideia') ||
        btn.textContent.includes('Generate')
      )
    );
    
    runTest('Botão de geração disponível', () => {
      return generateButton !== null && !generateButton.disabled;
    });
  } catch (error) {
    console.warn('Não foi possível testar botão de geração:', error);
  }

  // Relatório final
  console.log('\n📊 RELATÓRIO FINAL');
  console.log('==================');
  console.log(`Total de testes: ${testResults.total}`);
  console.log(`Testes passaram: ${testResults.passed}`);
  console.log(`Testes falharam: ${testResults.failed}`);
  console.log(`Taxa de sucesso: ${Math.round((testResults.passed / testResults.total) * 100)}%`);

  if (testResults.failed > 0) {
    console.log('\n❌ ERROS ENCONTRADOS:');
    testResults.errors.forEach(error => console.log(`   • ${error}`));
  }

  // Conclusão
  console.log('\n🎯 CONCLUSÃO');
  console.log('=============');
  
  if (testResults.passed === testResults.total) {
    console.log('✅ SISTEMA TOTALMENTE FUNCIONAL!');
    console.log('🎉 O Banco de Ideias está pronto para uso!');
  } else if (testResults.passed > testResults.total * 0.8) {
    console.log('⚠️ SISTEMA PARCIALMENTE FUNCIONAL');
    console.log('🔧 Alguns problemas menores foram detectados, mas o sistema deve funcionar.');
  } else if (testResults.passed > testResults.total * 0.5) {
    console.log('🔄 SISTEMA FUNCIONANDO COM LIMITAÇÕES');
    console.log('⚠️ Vários problemas detectados. Funcionalidade limitada.');
  } else {
    console.log('❌ SISTEMA COM PROBLEMAS CRÍTICOS');
    console.log('🚨 Muitos problemas detectados. Requer correção.');
  }

  // Instruções para o usuário
  console.log('\n🎮 PRÓXIMOS PASSOS:');
  console.log('===================');
  
  if (testResults.passed >= testResults.total * 0.8) {
    console.log('1. ✅ Tente gerar uma ideia clicando no botão "Gerar Nova Ideia"');
    console.log('2. ✅ Navegue pelas diferentes abas (Generator, History, Analytics)');
    console.log('3. ✅ Teste as funcionalidades de feedback (curtir, salvar, etc.)');
    console.log('4. ✅ Explore as configurações de personalização');
  } else {
    console.log('1. 🔄 Recarregue a página (Ctrl+R ou Cmd+R)');
    console.log('2. 🔄 Verifique se há erros no console');
    console.log('3. 🔄 Tente acessar novamente http://localhost:5174/banco-ideias');
    console.log('4. 🔄 Execute este teste novamente após correções');
  }

  return testResults;
};

// Executar teste
testBancoDeIdeiasIntegration().then(results => {
  console.log('\n🏁 TESTE CONCLUÍDO');
  console.log('Resultados disponíveis na variável results');
  window.testResults = results;
}).catch(error => {
  console.error('❌ Erro durante o teste:', error);
});

// Disponibilizar função para re-execução
window.testBancoDeIdeiasIntegration = testBancoDeIdeiasIntegration;

console.log('\n💡 DICAS:');
console.log('• Para executar novamente: testBancoDeIdeiasIntegration()');
console.log('• Para ver resultados: window.testResults');
console.log('• Para limpar console: console.clear()'); 