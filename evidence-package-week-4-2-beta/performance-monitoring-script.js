// 🔵 IA BETA - PERFORMANCE MONITORING SCRIPT
// Week 4.2 Evidence Collection System

console.log('🔵 IA BETA - Iniciando Performance Monitoring');
console.log('📅 Timestamp:', new Date().toISOString());
console.log('🌐 Browser:', navigator.userAgent);

// Real browser performance measurement
const measurePerformance = () => {
  const navigation = performance.getEntriesByType('navigation')[0];
  const metrics = {
    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
    loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
    totalLoadTime: navigation.loadEventEnd - navigation.navigationStart,
    timestamp: new Date().toISOString(),
    browser: navigator.userAgent
  };
  
  console.log('📊 Performance Metrics:', metrics);
  return metrics;
};

// Comprehensive performance measurement
const performanceTest = () => {
  // Core Web Vitals measurement
  const vitals = {
    // Largest Contentful Paint
    LCP: performance.getEntriesByType('largest-contentful-paint')[0]?.startTime || 'N/A',
    
    // First Input Delay (approximate)
    FID: performance.getEntriesByType('first-input')[0] ? 
         performance.getEntriesByType('first-input')[0].processingStart - 
         performance.getEntriesByType('first-input')[0].startTime : 'N/A',
    
    // Cumulative Layout Shift
    CLS: performance.getEntriesByType('layout-shift')
      .filter(entry => !entry.hadRecentInput)
      .reduce((sum, entry) => sum + entry.value, 0),
    
    // Time to Interactive (approximate)
    TTI: performance.timing.domInteractive - performance.timing.navigationStart,
    
    // Page Load Time
    pageLoadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
    
    timestamp: new Date().toISOString(),
    browser: navigator.userAgent,
    url: window.location.href
  };
  
  console.log('🎯 Core Web Vitals:', vitals);
  return vitals;
};

// Simulate user interactions for performance
const simulateUserInteractions = async () => {
  console.log('🤖 Simulando interações do usuário...');
  const startTime = performance.now();
  
  // Simulate navigation
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Simulate form interaction
  const formElements = document.querySelectorAll('input, select, textarea');
  console.log(`📝 Encontrados ${formElements.length} elementos de formulário`);
  
  formElements.forEach((el, index) => {
    el.focus();
    console.log(`🔍 Focus no elemento ${index + 1}`);
    el.blur();
  });
  
  // Simulate script generation
  const generateBtn = document.querySelector('[data-testid="generate-btn"]') || 
                     document.querySelector('button[type="submit"]') ||
                     document.querySelector('.generate-btn') ||
                     document.querySelector('button:contains("Gerar")');
  
  if (generateBtn) {
    console.log('🎯 Botão de geração encontrado, simulando clique...');
    generateBtn.click();
    await new Promise(resolve => setTimeout(resolve, 2000));
  } else {
    console.log('⚠️ Botão de geração não encontrado');
  }
  
  const endTime = performance.now();
  const result = {
    interactionTime: endTime - startTime,
    timestamp: new Date().toISOString(),
    elementsFound: formElements.length,
    generateButtonFound: !!generateBtn
  };
  
  console.log('⏱️ Resultado da simulação:', result);
  return result;
};

// User Journey Testing
const testUserJourney = () => {
  console.log('🚀 Testando jornada do usuário...');
  
  const journey = {
    currentUrl: window.location.href,
    timestamp: new Date().toISOString(),
    elements: {
      navigation: !!document.querySelector('nav') || !!document.querySelector('.nav'),
      forms: document.querySelectorAll('form').length,
      buttons: document.querySelectorAll('button').length,
      inputs: document.querySelectorAll('input').length,
      selects: document.querySelectorAll('select').length,
      textareas: document.querySelectorAll('textarea').length
    },
    pageTitle: document.title,
    hasErrors: document.querySelectorAll('.error, .alert-error').length > 0
  };
  
  console.log('🗺️ Mapeamento da jornada:', journey);
  return journey;
};

// Error Detection
const detectErrors = () => {
  console.log('🔍 Detectando erros...');
  
  const errors = {
    consoleErrors: [], // Will be populated by console overrides
    visibleErrors: document.querySelectorAll('.error, .alert-error, .text-red, .bg-red').length,
    brokenImages: Array.from(document.querySelectorAll('img')).filter(img => !img.complete || img.naturalHeight === 0).length,
    timestamp: new Date().toISOString()
  };
  
  console.log('🚨 Detecção de erros:', errors);
  return errors;
};

// Feature Detection
const detectFeatures = () => {
  console.log('🔧 Detectando funcionalidades...');
  
  const features = {
    hasAIGeneration: !!document.querySelector('[data-testid*="generate"]') || 
                     !!document.querySelector('button:contains("Gerar")') ||
                     !!document.querySelector('.generate'),
    hasAuth: !!document.querySelector('[data-testid*="auth"]') || 
             !!document.querySelector('button:contains("Login")') ||
             !!document.querySelector('.login'),
    hasNavigation: !!document.querySelector('nav'),
    hasForms: document.querySelectorAll('form').length > 0,
    hasModals: document.querySelectorAll('.modal, [role="dialog"]').length > 0,
    timestamp: new Date().toISOString()
  };
  
  console.log('🎛️ Funcionalidades detectadas:', features);
  return features;
};

// Main execution function
const runBetaValidation = async () => {
  console.log('🔵 === IA BETA VALIDATION INICIADA ===');
  console.log('📅 Horário:', new Date().toLocaleString());
  
  const results = {
    basicPerformance: measurePerformance(),
    coreWebVitals: performanceTest(),
    userJourney: testUserJourney(),
    errors: detectErrors(),
    features: detectFeatures(),
    timestamp: new Date().toISOString()
  };
  
  console.log('🎯 Simulando interações do usuário...');
  results.interactions = await simulateUserInteractions();
  
  console.log('📊 === RESULTADOS COMPLETOS ===');
  console.log(JSON.stringify(results, null, 2));
  
  return results;
};

// Export for use
window.betaValidation = {
  measurePerformance,
  performanceTest,
  simulateUserInteractions,
  testUserJourney,
  detectErrors,
  detectFeatures,
  runBetaValidation
};

console.log('✅ Script de validação Beta carregado!');
console.log('🚀 Execute: betaValidation.runBetaValidation() para iniciar'); 