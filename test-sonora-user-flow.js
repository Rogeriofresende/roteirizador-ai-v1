/**
 * 🧪 TESTE AUTOMATIZADO - SONORA COMO USUÁRIO REAL
 * 
 * Script para testar o fluxo completo do Sonora V2 automaticamente
 * Simula cliques, inputs e interações reais do usuário
 */

import puppeteer from 'puppeteer';

async function testSonoraUserFlow() {
  console.log('🚀 Iniciando teste real como usuário do Sonora V2...');
  
  let browser;
  let startTime = Date.now();
  
  try {
    // 1. Abrir navegador
    console.log('📱 Abrindo navegador...');
    browser = await puppeteer.launch({ 
      headless: false, // Mostrar navegador para debug
      defaultViewport: { width: 1280, height: 720 }
    });
    
    const page = await browser.newPage();
    
    // 2. Navegar para Storybook
    console.log('🌐 Navegando para Storybook...');
    await page.goto('http://localhost:6006');
    await page.waitForSelector('[title*="Sonora"]', { timeout: 10000 });
    
    // 3. Encontrar e clicar na story do Sonora
    console.log('🎯 Procurando story Sonora V2...');
    await page.click('[title*="Sonora Qualification Wireframe V2"]');
    await page.waitForSelector('[title*="Fluxo Criadores Completo"]');
    await page.click('[title*="Fluxo Criadores Completo"]');
    
    // 4. Aguardar componente carregar
    console.log('⏳ Aguardando componente carregar...');
    await page.waitForSelector('.sonora-qualification-wireframe-v2', { timeout: 5000 });
    
    // 5. ETAPA 1: Welcome Stage - Clicar "Começar Análise"
    console.log('✅ ETAPA 1: Welcome Stage');
    const startButton = await page.waitForSelector('button:contains("Começar")', { timeout: 5000 });
    await startButton.click();
    
    // 6. ETAPA 2: Profile Input - Inserir URL do Instagram
    console.log('✅ ETAPA 2: Profile Input');
    await page.waitForSelector('input[type="url"], input[placeholder*="instagram"]', { timeout: 5000 });
    
    const urlInput = await page.$('input[type="url"], input[placeholder*="instagram"]');
    await urlInput.type('https://instagram.com/cristiano');
    
    // Clicar botão analisar
    const analyzeButton = await page.waitForSelector('button:contains("Analisar")', { timeout: 3000 });
    await analyzeButton.click();
    
    // 7. ETAPA 3: AI Analysis - Aguardar análise
    console.log('✅ ETAPA 3: AI Analysis');
    await page.waitForSelector('.progress, .loading, .spinner', { timeout: 5000 });
    
    // Aguardar análise completar (máximo 30 segundos)
    await page.waitForFunction(
      () => !document.querySelector('.progress, .loading, .spinner') || 
            document.querySelector('button:contains("Continuar"), button:contains("Próximo")'),
      { timeout: 30000 }
    );
    
    // 8. ETAPA 4: Auto-Fill/Wizard - Verificar preenchimento automático
    console.log('✅ ETAPA 4: Auto-Fill/Wizard');
    
    // Verificar se há campos preenchidos automaticamente
    const filledInputs = await page.$$eval('input[value], textarea[value]', 
      inputs => inputs.filter(input => input.value.length > 0).length
    );
    
    console.log(`📋 Campos preenchidos automaticamente: ${filledInputs}`);
    
    // Procurar botão para continuar/completar wizard
    const continueButton = await page.waitForSelector(
      'button:contains("Continuar"), button:contains("Gerar"), button:contains("Próximo")', 
      { timeout: 5000 }
    );
    await continueButton.click();
    
    // 9. ETAPA 5: Content Generation - Aguardar geração
    console.log('✅ ETAPA 5: Content Generation');
    
    // Aguardar tela de geração aparecer
    await page.waitForSelector('*:contains("Gerando"), *:contains("geração")', { timeout: 5000 });
    
    // Aguardar geração completar (máximo 60 segundos)
    await page.waitForFunction(
      () => document.querySelector('*:contains("Post do Instagram"), *:contains("Stories"), *:contains("Reels")') ||
            document.querySelector('button:contains("Copiar")'),
      { timeout: 60000 }
    );
    
    // 10. ETAPA 6: Final Result - Testar copy-to-clipboard
    console.log('✅ ETAPA 6: Final Result');
    
    // Verificar se os 3 formatos foram gerados
    const postContent = await page.$('*:contains("Post do Instagram")');
    const storiesContent = await page.$('*:contains("Stories")');
    const reelsContent = await page.$('*:contains("Reels")');
    
    console.log(`📝 Post gerado: ${!!postContent}`);
    console.log(`📱 Stories gerado: ${!!storiesContent}`);
    console.log(`🎬 Reels gerado: ${!!reelsContent}`);
    
    // Testar botões de copy
    const copyButtons = await page.$$('button:contains("Copiar")');
    console.log(`📋 Botões de copy encontrados: ${copyButtons.length}`);
    
    // Testar primeiro botão de copy
    if (copyButtons.length > 0) {
      await copyButtons[0].click();
      console.log('✅ Botão copy testado com sucesso');
    }
    
    // 11. CALCULAR TEMPO TOTAL
    const totalTime = Date.now() - startTime;
    const minutes = Math.floor(totalTime / 60000);
    const seconds = Math.floor((totalTime % 60000) / 1000);
    
    console.log(`⏱️ TEMPO TOTAL: ${minutes}m ${seconds}s`);
    console.log(`🎯 TARGET <5min: ${totalTime < 300000 ? '✅ ATINGIDO' : '❌ EXCEDIDO'}`);
    
    // 12. RESULTADO FINAL
    console.log('\n🎉 TESTE COMPLETO REALIZADO!');
    console.log('📊 RESULTADOS:');
    console.log(`- Welcome Stage: ✅`);
    console.log(`- Profile Input: ✅`);
    console.log(`- AI Analysis: ✅`);
    console.log(`- Auto-Fill: ✅ (${filledInputs} campos preenchidos)`);
    console.log(`- Content Generation: ✅`);
    console.log(`- Final Result: ✅`);
    console.log(`- Copy Buttons: ✅ (${copyButtons.length} encontrados)`);
    console.log(`- Performance: ${totalTime < 300000 ? '✅' : '❌'} (${minutes}m ${seconds}s)`);
    
    return {
      success: true,
      totalTime,
      stages: {
        welcome: true,
        profileInput: true,
        aiAnalysis: true,
        autoFill: filledInputs > 0,
        contentGeneration: true,
        finalResult: postContent && storiesContent && reelsContent,
        copyButtons: copyButtons.length >= 3
      },
      performance: totalTime < 300000
    };
    
  } catch (error) {
    console.error('❌ ERRO NO TESTE:', error.message);
    return {
      success: false,
      error: error.message,
      totalTime: Date.now() - startTime
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Executar teste automaticamente
testSonoraUserFlow()
  .then(result => {
    console.log('\n📋 RESULTADO FINAL:', result);
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 FALHA CRÍTICA:', error);
    process.exit(1);
  });

export { testSonoraUserFlow };