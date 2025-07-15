/**
 * 🧪 TESTE DO BANCO DE IDEIAS - VERIFICAÇÃO PÓS-CORREÇÃO
 * Execute este script no console do navegador para testar se as correções funcionaram
 */

console.clear();
console.log('🧪 TESTANDO BANCO DE IDEIAS - PÓS-CORREÇÃO');
console.log('==========================================');

// 1. Verificar se a página está carregando sem erros
const currentUrl = window.location.href;
console.log('📍 URL atual:', currentUrl);

// 2. Verificar se há erros no console
let errorCount = 0;
const originalError = console.error;
console.error = function(...args) {
  errorCount++;
  console.log(`❌ Erro ${errorCount}:`, args[0]);
  return originalError.apply(console, args);
};

// 3. Verificar se o componente principal está renderizado
setTimeout(() => {
  console.log('\n🔍 VERIFICANDO COMPONENTES...');
  
  // Verificar se o banco de ideias está renderizado
  const bancoIdeiasElements = [
    document.querySelector('[data-testid="banco-ideias"]'),
    document.querySelector('.banco-ideias'),
    document.querySelector('.idea-bank'),
    document.querySelector('main[role="main"]')
  ];
  
  const foundElements = bancoIdeiasElements.filter(el => el !== null);
  console.log(`✅ Elementos encontrados: ${foundElements.length}/4`);
  
  // Verificar se há formulário de geração
  const formElements = [
    document.querySelector('form'),
    document.querySelector('select'),
    document.querySelector('button[type="submit"]'),
    document.querySelector('input[type="text"]')
  ];
  
  const foundFormElements = formElements.filter(el => el !== null);
  console.log(`✅ Elementos de formulário: ${foundFormElements.length}/4`);
  
  // Verificar se há botões de ação
  const actionButtons = document.querySelectorAll('button');
  console.log(`✅ Botões encontrados: ${actionButtons.length}`);
  
  // Verificar se há erros de CSS/componentes
  const errorElements = document.querySelectorAll('.error, [data-error="true"]');
  console.log(`⚠️ Elementos de erro: ${errorElements.length}`);
  
  // Verificar se há componentes React funcionando
  const reactElements = document.querySelectorAll('[data-reactroot], [data-testid]');
  console.log(`⚛️ Elementos React: ${reactElements.length}`);
  
  // 4. Testar interações básicas
  console.log('\n🎯 TESTANDO INTERAÇÕES...');
  
  // Tentar encontrar botões de navegação
  const navButtons = document.querySelectorAll('button, a[href*="banco-ideias"]');
  console.log(`🧭 Elementos de navegação: ${navButtons.length}`);
  
  // Verificar se há tabs
  const tabs = document.querySelectorAll('[role="tab"], .tab, [data-tab]');
  console.log(`📑 Tabs encontradas: ${tabs.length}`);
  
  // 5. Resultados finais
  console.log('\n📊 RESULTADOS FINAIS:');
  console.log('==========================================');
  
  const score = (
    (foundElements.length * 25) +
    (foundFormElements.length * 15) +
    (Math.min(actionButtons.length, 5) * 5) +
    (Math.min(reactElements.length, 10) * 2) +
    (tabs.length * 10) -
    (errorElements.length * 20) -
    (errorCount * 10)
  );
  
  console.log(`📈 Score de funcionamento: ${score}/100`);
  
  if (score >= 80) {
    console.log('✅ BANCO DE IDEIAS FUNCIONANDO CORRETAMENTE!');
    console.log('🎉 As correções foram aplicadas com sucesso');
  } else if (score >= 60) {
    console.log('⚠️ BANCO DE IDEIAS PARCIALMENTE FUNCIONANDO');
    console.log('🔧 Algumas correções ainda podem ser necessárias');
  } else {
    console.log('❌ BANCO DE IDEIAS COM PROBLEMAS');
    console.log('🚨 Correções adicionais são necessárias');
  }
  
  // 6. Recomendações
  console.log('\n💡 RECOMENDAÇÕES:');
  console.log('==========================================');
  
  if (errorCount === 0) {
    console.log('✅ Nenhum erro detectado - excelente!');
  } else {
    console.log(`⚠️ ${errorCount} erros detectados - verifique o console`);
  }
  
  if (foundElements.length < 2) {
    console.log('🔧 Componentes principais podem não estar carregando');
  }
  
  if (foundFormElements.length < 2) {
    console.log('🔧 Formulário pode estar com problemas');
  }
  
  if (actionButtons.length < 3) {
    console.log('🔧 Botões de ação podem estar faltando');
  }
  
  // 7. Função de teste manual
  window.testManualIdea = () => {
    console.log('🧪 Testando geração manual de ideia...');
    
    // Procurar por botão de gerar ideia
    const generateButton = document.querySelector('button[type="submit"], button:contains("Gerar"), button:contains("Ideia")');
    if (generateButton) {
      console.log('✅ Botão de gerar encontrado');
      generateButton.click();
      console.log('🎯 Clique simulado no botão');
    } else {
      console.log('❌ Botão de gerar não encontrado');
    }
  };
  
  // 8. Função para limpar logs
  window.clearTestLogs = () => {
    console.clear();
    console.log('🧹 Logs limpos');
  };
  
  console.log('\n🛠️ FUNÇÕES DISPONÍVEIS:');
  console.log('testManualIdea() - Testar geração manual');
  console.log('clearTestLogs() - Limpar logs');
  console.log('==========================================');
  
  // Restaurar console.error original
  console.error = originalError;
  
}, 2000);

// 9. Função para monitorar erros contínuos
let continuousErrorCount = 0;
const errorMonitor = setInterval(() => {
  if (continuousErrorCount > 10) {
    console.log('🚨 Muitos erros detectados - parando monitor');
    clearInterval(errorMonitor);
  }
}, 5000);

console.log('⏳ Aguardando 2 segundos para análise completa...');
console.log('🔍 Monitorando erros contínuos...'); 