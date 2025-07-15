/**
 * 🔍 DEBUG CONSOLE ERRORS - DIAGNÓSTICO AVANÇADO
 * Script para executar no console do navegador (F12) para identificar problemas específicos
 */

(function() {
  console.clear();
  console.log('🔍 INICIANDO DIAGNÓSTICO DE ERROS - BANCO DE IDEIAS');
  
  // Objeto para armazenar erros encontrados
  const diagnosticResults = {
    errors: [],
    warnings: [],
    networkErrors: [],
    reactErrors: [],
    importErrors: [],
    timestamp: new Date().toISOString()
  };

  // ============================================================================
  // 1. CAPTURA DE ERROS DO CONSOLE
  // ============================================================================
  
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  
  console.error = function(...args) {
    const errorMsg = args.join(' ');
    diagnosticResults.errors.push({
      type: 'console.error',
      message: errorMsg,
      timestamp: new Date().toISOString(),
      stack: new Error().stack
    });
    return originalConsoleError.apply(console, args);
  };
  
  console.warn = function(...args) {
    const warnMsg = args.join(' ');
    diagnosticResults.warnings.push({
      type: 'console.warn',
      message: warnMsg,
      timestamp: new Date().toISOString()
    });
    return originalConsoleWarn.apply(console, args);
  };

  // ============================================================================
  // 2. CAPTURA DE ERROS GLOBAIS
  // ============================================================================
  
  window.addEventListener('error', (event) => {
    diagnosticResults.errors.push({
      type: 'global-error',
      message: event.message,
      filename: event.filename,
      line: event.lineno,
      column: event.colno,
      error: event.error ? event.error.toString() : 'No error object',
      timestamp: new Date().toISOString()
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    diagnosticResults.errors.push({
      type: 'unhandled-promise',
      message: event.reason ? event.reason.toString() : 'Promise rejection',
      timestamp: new Date().toISOString()
    });
  });

  // ============================================================================
  // 3. INTERCEPTAÇÃO DE REQUISIÇÕES NETWORK
  // ============================================================================
  
  const originalFetch = window.fetch;
  window.fetch = async function(...args) {
    const url = args[0];
    const startTime = Date.now();
    
    try {
      const response = await originalFetch.apply(this, args);
      
      if (!response.ok) {
        diagnosticResults.networkErrors.push({
          type: 'network-error',
          url: url,
          status: response.status,
          statusText: response.statusText,
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString()
        });
      }
      
      return response;
    } catch (error) {
      diagnosticResults.networkErrors.push({
        type: 'network-failure',
        url: url,
        error: error.message,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  };

  // ============================================================================
  // 4. VERIFICAÇÃO DE COMPONENTES REACT
  // ============================================================================
  
  const checkReactComponents = () => {
    console.log('🔍 Verificando componentes React...');
    
    // Verificar se React está carregado
    if (!window.React) {
      diagnosticResults.reactErrors.push({
        type: 'react-not-loaded',
        message: 'React não foi carregado',
        timestamp: new Date().toISOString()
      });
    }
    
    // Verificar se há erros no React DevTools
    if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      console.log('✅ React DevTools detectado');
    } else {
      console.log('⚠️ React DevTools não detectado');
    }
    
    // Verificar elementos React na página
    const reactElements = document.querySelectorAll('[data-reactroot], [data-react-helmet]');
    console.log(`🔍 Elementos React encontrados: ${reactElements.length}`);
  };

  // ============================================================================
  // 5. VERIFICAÇÃO DE IMPORTS E MÓDULOS
  // ============================================================================
  
  const checkImports = () => {
    console.log('🔍 Verificando imports e módulos...');
    
    // Verificar se há erros de module loading
    if (window.importErrors) {
      diagnosticResults.importErrors.push(...window.importErrors);
    }
    
    // Verificar services específicos
    const servicesToCheck = [
      'IdeaBankService',
      'PersonalizationService',
      'AnalyticsService',
      'GeminiService'
    ];
    
    servicesToCheck.forEach(service => {
      try {
        if (window[service]) {
          console.log(`✅ ${service} está disponível`);
        } else {
          console.log(`⚠️ ${service} não está disponível`);
        }
      } catch (error) {
        diagnosticResults.importErrors.push({
          type: 'service-check-error',
          service: service,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });
  };

  // ============================================================================
  // 6. VERIFICAÇÃO ESPECÍFICA DO BANCO DE IDEIAS
  // ============================================================================
  
  const checkBancoDeIdeias = () => {
    console.log('🔍 Verificando Banco de Ideias...');
    
    // Verificar se a página está carregada
    const bancoIdeiasElement = document.querySelector('[data-testid="banco-ideias"], .banco-ideias, .idea-bank');
    if (bancoIdeiasElement) {
      console.log('✅ Elemento Banco de Ideias encontrado');
    } else {
      console.log('⚠️ Elemento Banco de Ideias não encontrado');
    }
    
    // Verificar se há erros nos hooks
    const hookErrors = [];
    if (window.useIdeaGeneration) {
      try {
        console.log('✅ useIdeaGeneration hook disponível');
      } catch (error) {
        hookErrors.push({ hook: 'useIdeaGeneration', error: error.message });
      }
    }
    
    if (hookErrors.length > 0) {
      diagnosticResults.reactErrors.push(...hookErrors);
    }
  };

  // ============================================================================
  // 7. ANÁLISE DE PERFORMANCE
  // ============================================================================
  
  const checkPerformance = () => {
    console.log('🔍 Verificando performance...');
    
    // Verificar Core Web Vitals
    if (window.performance && window.performance.getEntriesByType) {
      const navigationEntries = window.performance.getEntriesByType('navigation');
      if (navigationEntries.length > 0) {
        const nav = navigationEntries[0];
        console.log(`📊 DOM Content Loaded: ${nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart}ms`);
        console.log(`📊 Load Complete: ${nav.loadEventEnd - nav.loadEventStart}ms`);
      }
    }
    
    // Verificar memória
    if (window.performance && window.performance.memory) {
      const memory = window.performance.memory;
      console.log(`📊 Memória usado: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
      console.log(`📊 Memória total: ${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
    }
  };

  // ============================================================================
  // 8. EXECUTAR DIAGNÓSTICO COMPLETO
  // ============================================================================
  
  const runDiagnostic = () => {
    console.log('🚀 Executando diagnóstico completo...');
    
    checkReactComponents();
    checkImports();
    checkBancoDeIdeias();
    checkPerformance();
    
    // Aguardar alguns segundos para capturar erros
    setTimeout(() => {
      console.log('📊 RESULTADOS DO DIAGNÓSTICO:');
      console.log('==========================================');
      
      if (diagnosticResults.errors.length > 0) {
        console.error('❌ ERROS ENCONTRADOS:');
        diagnosticResults.errors.forEach((error, index) => {
          console.error(`${index + 1}. [${error.type}] ${error.message}`);
        });
      } else {
        console.log('✅ Nenhum erro encontrado');
      }
      
      if (diagnosticResults.warnings.length > 0) {
        console.warn('⚠️ WARNINGS ENCONTRADOS:');
        diagnosticResults.warnings.forEach((warning, index) => {
          console.warn(`${index + 1}. [${warning.type}] ${warning.message}`);
        });
      }
      
      if (diagnosticResults.networkErrors.length > 0) {
        console.error('🌐 ERROS DE REDE:');
        diagnosticResults.networkErrors.forEach((error, index) => {
          console.error(`${index + 1}. [${error.type}] ${error.url} - ${error.error || error.status}`);
        });
      }
      
      if (diagnosticResults.reactErrors.length > 0) {
        console.error('⚛️ ERROS DO REACT:');
        diagnosticResults.reactErrors.forEach((error, index) => {
          console.error(`${index + 1}. [${error.type}] ${error.message}`);
        });
      }
      
      console.log('==========================================');
      console.log('📋 Para copiar resultados completos, execute:');
      console.log('copy(window.diagnosticResults)');
      
      // Disponibilizar resultados globalmente
      window.diagnosticResults = diagnosticResults;
      
    }, 3000);
  };

  // ============================================================================
  // 9. INICIALIZAR DIAGNÓSTICO
  // ============================================================================
  
  console.log('🔍 Diagnóstico iniciado. Aguardando 3 segundos para capturar erros...');
  runDiagnostic();
  
  // Função para parar o diagnóstico
  window.stopDiagnostic = () => {
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
    window.fetch = originalFetch;
    console.log('🛑 Diagnóstico parado');
  };
  
  return {
    results: diagnosticResults,
    stop: window.stopDiagnostic
  };
})(); 