/**
 * 🔍 VERIFICAÇÃO DE CORREÇÕES - BANCO DE IDEIAS
 * Execute este script no console para verificar se as correções foram aplicadas
 */

console.clear();
console.log('🔍 VERIFICAÇÃO DE CORREÇÕES - BANCO DE IDEIAS');
console.log('=============================================');

// Contador de erros
let errorCount = 0;
const errors = [];

// Interceptar erros
const originalError = console.error;
console.error = function(...args) {
  errorCount++;
  errors.push(args.join(' '));
  return originalError.apply(console, args);
};

// Aguardar alguns segundos para capturar erros
setTimeout(() => {
  console.log('\n📊 RESULTADOS DA VERIFICAÇÃO:');
  console.log('=============================================');
  
  if (errorCount === 0) {
    console.log('✅ SUCESSO! Nenhum erro detectado após as correções');
    console.log('🎉 O Banco de Ideias está funcionando corretamente');
  } else {
    console.log(`❌ ${errorCount} erro(s) ainda detectado(s):`);
    errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
  }
  
  // Verificar se elementos estão renderizados
  const elements = {
    formulario: document.querySelector('form') || document.querySelector('[data-testid="idea-form"]'),
    botoes: document.querySelectorAll('button').length,
    inputs: document.querySelectorAll('input, select').length,
    cards: document.querySelectorAll('[class*="card"], [class*="Card"]').length,
    texto: document.body.textContent.includes('Banco de Ideias') || document.body.textContent.includes('Gerar Ideia')
  };
  
  console.log('\n🔍 ELEMENTOS RENDERIZADOS:');
  console.log('=============================================');
  console.log(`📄 Formulário: ${elements.formulario ? '✅ Encontrado' : '❌ Não encontrado'}`);
  console.log(`🔘 Botões: ${elements.botoes} encontrados`);
  console.log(`📝 Inputs: ${elements.inputs} encontrados`);
  console.log(`🎴 Cards: ${elements.cards} encontrados`);
  console.log(`📋 Texto relevante: ${elements.texto ? '✅ Encontrado' : '❌ Não encontrado'}`);
  
  // Score de funcionamento
  const score = (
    (errorCount === 0 ? 40 : 0) +
    (elements.formulario ? 20 : 0) +
    (elements.botoes >= 3 ? 15 : 0) +
    (elements.inputs >= 2 ? 10 : 0) +
    (elements.cards >= 1 ? 10 : 0) +
    (elements.texto ? 5 : 0)
  );
  
  console.log('\n📈 SCORE DE FUNCIONAMENTO:');
  console.log('=============================================');
  console.log(`📊 Score: ${score}/100`);
  
  if (score >= 90) {
    console.log('🎯 EXCELENTE! Banco de Ideias funcionando perfeitamente');
  } else if (score >= 70) {
    console.log('🎯 BOM! Banco de Ideias funcionando bem');
  } else if (score >= 50) {
    console.log('🎯 REGULAR! Banco de Ideias funcionando com alguns problemas');
  } else {
    console.log('🎯 PROBLEMA! Banco de Ideias precisa de mais correções');
  }
  
  // Próximos passos
  console.log('\n🔧 PRÓXIMOS PASSOS:');
  console.log('=============================================');
  
  if (score >= 90) {
    console.log('✅ Teste a geração de ideias manualmente');
    console.log('✅ Preencha o formulário e clique em "Gerar Ideia"');
    console.log('✅ Verifique se as ideias são geradas corretamente');
  } else if (errorCount > 0) {
    console.log('🔧 Ainda há erros que precisam ser corrigidos');
    console.log('🔧 Verifique os erros listados acima');
  } else {
    console.log('🔧 Elementos podem estar carregando ainda');
    console.log('🔧 Aguarde alguns segundos e execute novamente');
  }
  
  // Função para teste manual
  window.testBancoIdeias = () => {
    console.log('🧪 Executando teste manual...');
    
    // Tentar preencher formulário
    const selects = document.querySelectorAll('select');
    selects.forEach((select, index) => {
      if (select.options.length > 1) {
        select.selectedIndex = 1;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        console.log(`✅ Select ${index + 1} preenchido`);
      }
    });
    
    // Tentar clicar no botão de gerar
    const generateButton = document.querySelector('button[type="submit"], button:contains("Gerar"), [data-testid="generate-button"]');
    if (generateButton) {
      generateButton.click();
      console.log('✅ Botão de gerar clicado');
    } else {
      console.log('❌ Botão de gerar não encontrado');
    }
  };
  
  console.log('\n🛠️ FUNÇÃO DISPONÍVEL:');
  console.log('testBancoIdeias() - Teste manual completo');
  console.log('=============================================');
  
  // Restaurar console original
  console.error = originalError;
  
}, 3000);

console.log('⏳ Aguardando 3 segundos para verificar correções...');
console.log('🔍 Capturando erros...'); 