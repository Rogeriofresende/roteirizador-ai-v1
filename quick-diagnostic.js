/**
 * 🚀 QUICK DIAGNOSTIC - DIAGNÓSTICO RÁPIDO DE PROBLEMAS
 * Execute este script no console do navegador para identificar problemas rapidamente
 * 
 * Como usar:
 * 1. Abra o navegador (http://localhost:5174)
 * 2. Pressione F12 para abrir o console
 * 3. Cole e execute este script
 * 4. Veja os resultados no console
 */

// Função principal de diagnóstico
function runQuickDiagnostic() {
  console.clear();
  console.log('🚀 DIAGNÓSTICO RÁPIDO - BANCO DE IDEIAS');
  console.log('=====================================');
  
  const issues = [];
  const warnings = [];
  const info = [];
  
  // 1. Verificar se React está funcionando
  try {
    if (window.React) {
      info.push('✅ React carregado com sucesso');
    } else {
      issues.push('❌ React não foi carregado');
    }
  } catch (error) {
    issues.push('❌ Erro ao verificar React: ' + error.message);
  }
  
  // 2. Verificar se os serviços estão disponíveis
  const services = ['analyticsService', 'geminiService', 'tallyService'];
  services.forEach(service => {
    try {
      if (window[service]) {
        info.push(`✅ ${service} disponível`);
      } else {
        warnings.push(`⚠️ ${service} não está disponível globalmente`);
      }
    } catch (error) {
      issues.push(`❌ Erro ao verificar ${service}: ${error.message}`);
    }
  });
  
  // 3. Verificar se a página atual é o Banco de Ideias
  const currentPath = window.location.pathname;
  if (currentPath.includes('/banco-ideias')) {
    info.push('✅ Você está na página do Banco de Ideias');
    
    // Verificar elementos específicos do Banco de Ideias
    const bancoElements = [
      'button[data-testid="generate-idea"]',
      '.idea-generation-form',
      '.banco-ideias',
      '[data-testid="banco-ideias"]'
    ];
    
    bancoElements.forEach(selector => {
      const element = document.querySelector(selector);
      if (element) {
        info.push(`✅ Elemento encontrado: ${selector}`);
      } else {
        warnings.push(`⚠️ Elemento não encontrado: ${selector}`);
      }
    });
    
  } else {
    warnings.push(`⚠️ Você não está na página do Banco de Ideias (atual: ${currentPath})`);
    info.push('💡 Navegue para /banco-ideias para testar a funcionalidade');
  }
  
  // 4. Verificar configurações de ambiente
  try {
    if (window.location.hostname === 'localhost') {
      info.push('✅ Rodando em ambiente de desenvolvimento');
    } else {
      info.push('📦 Rodando em ambiente de produção');
    }
  } catch (error) {
    issues.push('❌ Erro ao verificar ambiente: ' + error.message);
  }
  
  // 5. Verificar se há erros recentes no console
  const recentErrors = [];
  
  // Interceptar console.error temporariamente
  const originalError = console.error;
  console.error = function(...args) {
    recentErrors.push(args.join(' '));
    return originalError.apply(console, args);
  };
  
  // Aguardar alguns segundos para capturar erros
  setTimeout(() => {
    console.error = originalError;
    
    // 6. Verificar conectividade com APIs
    const testApiConnections = async () => {
      try {
        // Testar se consegue fazer requisições básicas
        const response = await fetch(window.location.origin + '/manifest.json');
        if (response.ok) {
          info.push('✅ Conectividade básica funcionando');
        } else {
          warnings.push('⚠️ Problema com conectividade básica');
        }
      } catch (error) {
        issues.push('❌ Erro de conectividade: ' + error.message);
      }
    };
    
    testApiConnections().then(() => {
      // 7. Mostrar resultados
      console.log('\n📊 RESULTADOS DO DIAGNÓSTICO:');
      console.log('=====================================');
      
      if (issues.length > 0) {
        console.log('\n❌ PROBLEMAS ENCONTRADOS:');
        issues.forEach((issue, index) => {
          console.log(`${index + 1}. ${issue}`);
        });
      }
      
      if (warnings.length > 0) {
        console.log('\n⚠️ AVISOS:');
        warnings.forEach((warning, index) => {
          console.log(`${index + 1}. ${warning}`);
        });
      }
      
      if (info.length > 0) {
        console.log('\n✅ INFORMAÇÕES:');
        info.forEach((item, index) => {
          console.log(`${index + 1}. ${item}`);
        });
      }
      
      if (recentErrors.length > 0) {
        console.log('\n🔍 ERROS RECENTES CAPTURADOS:');
        recentErrors.forEach((error, index) => {
          console.log(`${index + 1}. ${error}`);
        });
      }
      
      // 8. Recomendações
      console.log('\n💡 RECOMENDAÇÕES:');
      console.log('=====================================');
      
      if (issues.length > 0) {
        console.log('• Há problemas que precisam ser corrigidos');
        console.log('• Execute o script completo para análise detalhada');
      } else if (warnings.length > 0) {
        console.log('• Sistema funcionando com alguns avisos');
        console.log('• Avisos podem ser ignorados em desenvolvimento');
      } else {
        console.log('• Sistema aparenta estar funcionando corretamente');
        console.log('• Teste a geração de ideias manualmente');
      }
      
      // 9. Próximos passos
      console.log('\n🔧 PRÓXIMOS PASSOS:');
      console.log('=====================================');
      
      if (!currentPath.includes('/banco-ideias')) {
        console.log('1. Navegue para: http://localhost:5174/banco-ideias');
        console.log('2. Execute este diagnóstico novamente');
      } else {
        console.log('1. Teste gerar uma ideia manualmente');
        console.log('2. Verifique se o formulário está funcionando');
        console.log('3. Observe se há erros no console durante o uso');
      }
      
      // 10. Disponibilizar função de teste
      window.testIdeaGeneration = () => {
        console.log('🧪 Testando geração de ideias...');
        
        // Simular clique no botão de gerar ideia
        const generateBtn = document.querySelector('button[data-testid="generate-idea"], .generate-idea-button, button:contains("Gerar")');
        if (generateBtn) {
          generateBtn.click();
          console.log('✅ Botão de gerar ideia clicado');
        } else {
          console.log('❌ Botão de gerar ideia não encontrado');
        }
      };
      
      console.log('\n🧪 FUNÇÃO DE TESTE DISPONÍVEL:');
      console.log('Execute: testIdeaGeneration()');
      console.log('=====================================');
      
      // Salvar resultados para referência
      window.diagnosticResults = {
        issues,
        warnings,
        info,
        recentErrors,
        timestamp: new Date().toISOString(),
        currentPath,
        userAgent: navigator.userAgent
      };
      
    });
  }, 2000);
}

// Executar diagnóstico
runQuickDiagnostic();

// Disponibilizar função global para re-execução
window.runQuickDiagnostic = runQuickDiagnostic; 