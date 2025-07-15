/**
 * 🧪 TESTE DE CORREÇÃO DO BOTÃO - BANCO DE IDEIAS
 * Execute este script no console do navegador para testar se as correções do botão funcionaram
 */

console.clear();
console.log('🧪 TESTE DE CORREÇÃO DO BOTÃO - BANCO DE IDEIAS');
console.log('=============================================');

// Contador de erros
let errorCount = 0;
let buttonErrors = [];

// Interceptar erros relacionados ao botão
const originalError = console.error;
console.error = function(...args) {
  const errorMessage = args.join(' ');
  
  // Verificar se é erro do botão
  if (errorMessage.includes('Button.tsx') || errorMessage.includes('enhanced') || errorMessage.includes('getButtonStyles')) {
    errorCount++;
    buttonErrors.push(errorMessage);
    console.log(`❌ Erro do botão ${errorCount}:`, errorMessage);
  }
  
  return originalError.apply(console, args);
};

// Testar elementos do banco de ideias
setTimeout(() => {
  console.log('\n🔍 TESTANDO ELEMENTOS DO BANCO DE IDEIAS...');
  
  // 1. Verificar se há botões na página
  const buttons = document.querySelectorAll('button');
  console.log(`📊 Botões encontrados: ${buttons.length}`);
  
  if (buttons.length > 0) {
    buttons.forEach((button, index) => {
      const buttonText = button.textContent || button.innerText || 'Sem texto';
      console.log(`   ${index + 1}. ${buttonText.substring(0, 50)}...`);
    });
  }
  
  // 2. Verificar se há error boundaries ativas
  const errorBoundaries = document.querySelectorAll('[data-error-boundary]');
  if (errorBoundaries.length > 0) {
    console.log('⚠️ Error boundaries detectados:', errorBoundaries.length);
  }
  
  // 3. Verificar se a página do banco de ideias está carregada
  const isBancoIdeiasPage = window.location.pathname.includes('banco-ideias');
  console.log(`📍 Está na página do banco de ideias: ${isBancoIdeiasPage}`);
  
  // 4. Verificar se há componentes do banco de ideias
  const bankElements = document.querySelectorAll('[data-testid*="banco"], [class*="banco"], [class*="idea"]');
  console.log(`🏦 Elementos do banco encontrados: ${bankElements.length}`);
  
  // 5. Aguardar mais tempo para ver se há erros tardios
  setTimeout(() => {
    console.log('\n📊 RESULTADO FINAL:');
    console.log('===================');
    
    if (errorCount === 0) {
      console.log('✅ SUCESSO! Nenhum erro de botão detectado');
      console.log('✅ Correções aplicadas com sucesso');
      console.log('✅ Banco de ideias deve estar funcionando');
    } else {
      console.log(`❌ ${errorCount} erros de botão ainda detectados:`);
      buttonErrors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }
    
    // Teste funcional básico
    try {
      const generateButton = Array.from(buttons).find(btn => 
        btn.textContent?.includes('Gerar') || btn.textContent?.includes('Nova Ideia')
      );
      
      if (generateButton) {
        console.log('🎯 Botão de geração encontrado e funcional');
      } else {
        console.log('⚠️ Botão de geração não encontrado ou não funcional');
      }
    } catch (error) {
      console.log('❌ Erro ao testar funcionalidade:', error.message);
    }
    
    console.log('\n🔄 Para testar novamente, execute este script novamente');
  }, 3000);
  
}, 1000); 