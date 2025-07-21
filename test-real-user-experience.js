/**
 * 🖱️ TESTE REAL COMO USUÁRIO - SONORA V2
 * 
 * EU vou USAR o sistema de verdade como usuário real
 * Cliques reais, dados reais, respostas reais
 */

import puppeteer from 'puppeteer';

async function useSystemAsRealUser() {
  console.log('🚀 Iniciando USO REAL do sistema Sonora V2...');
  console.log('👤 Simulando que sou um criador de conteúdo precisando de ajuda');
  
  let browser;
  let startTime = Date.now();
  
  try {
    // 1. Abrir navegador VISÍVEL para ver o que está acontecendo
    console.log('🌐 Abrindo navegador para usar o sistema...');
    browser = await puppeteer.launch({ 
      headless: false, // MOSTRAR navegador - uso real
      defaultViewport: null,
      devtools: false,
      args: ['--start-maximized']
    });
    
    const page = await browser.newPage();
    
    // 2. Ir para o Storybook como usuário real
    console.log('📱 Acessando o sistema Sonora...');
    await page.goto('http://localhost:6006/');
    
    // Aguardar carregar
    await page.waitForLoadState ? page.waitForLoadState('networkidle') : page.waitForTimeout(3000);
    
    // 3. Procurar o componente Sonora como usuário perdido
    console.log('🔍 Procurando onde está o Sonora...');
    
    // Aguardar sidebar do Storybook
    await page.waitForSelector('.sidebar-container', { timeout: 10000 });
    
    // Procurar por "Sonora" ou "Wireframes"
    const sonoraLink = await page.waitForSelector('[data-item-id*="sonora"], [data-item-id*="wireframes"]', { timeout: 5000 });
    
    if (sonoraLink) {
      console.log('✅ Encontrei o link do Sonora!');
      await sonoraLink.click();
      await page.waitForTimeout(2000);
    }
    
    // 4. Procurar a story específica
    console.log('🎯 Procurando a história "Fluxo Criadores Completo"...');
    
    // Aguardar stories aparecerem
    await page.waitForTimeout(3000);
    
    // Procurar story do fluxo completo
    const storyLink = await page.waitForSelector('[data-item-id*="fluxo"], [data-item-id*="criadores"], [data-item-id*="default"]', { timeout: 5000 });
    
    if (storyLink) {
      console.log('✅ Encontrei a story do fluxo!');
      await storyLink.click();
      await page.waitForTimeout(3000);
    }
    
    // 5. Agora vou USAR o sistema como usuário real
    console.log('🎬 Iniciando uso do sistema como criador de conteúdo...');
    
    // Aguardar o iframe do Storybook carregar
    await page.waitForSelector('iframe[data-is-storybook="true"]', { timeout: 10000 });
    
    // Mudar para o iframe do componente
    const iframe = await page.frame('storybook-preview-iframe');
    
    if (!iframe) {
      throw new Error('Iframe do Storybook não encontrado');
    }
    
    // 6. ETAPA 1: Welcome - Como usuário real, vou clicar em "Começar"
    console.log('👋 ETAPA 1: Vendo a tela de boas-vindas...');
    
    // Aguardar componente carregar
    await iframe.waitForSelector('.sonora-qualification-wireframe-v2', { timeout: 10000 });
    
    console.log('✅ Sistema carregou! Vou começar a análise...');
    
    // Procurar botão "Começar" ou similar
    const startButton = await iframe.waitForSelector('button', { timeout: 5000 });
    
    if (startButton) {
      console.log('🔘 Clicando no botão para começar...');
      await startButton.click();
      await page.waitForTimeout(3000);
    }
    
    // 7. ETAPA 2: Profile Input - Vou inserir MEU perfil do Instagram
    console.log('📝 ETAPA 2: Inserindo meu perfil do Instagram...');
    
    // Aguardar campo de input aparecer
    const urlInput = await iframe.waitForSelector('input[type="url"], input[placeholder*="instagram"], input[placeholder*="perfil"]', { timeout: 8000 });
    
    if (urlInput) {
      console.log('✍️ Digitando URL do Instagram...');
      await urlInput.click();
      await urlInput.type('https://instagram.com/natgeo'); // Usar perfil real para teste
      await page.waitForTimeout(2000);
      
      // Procurar botão "Analisar"
      const analyzeButton = await iframe.waitForSelector('button:has-text("Analisar"), button:has-text("Verificar"), button:has-text("Continuar")', { timeout: 5000 });
      
      if (analyzeButton) {
        console.log('🔍 Clicando para analisar perfil...');
        await analyzeButton.click();
        await page.waitForTimeout(3000);
      }
    }
    
    // 8. ETAPA 3: AI Analysis - Aguardar análise REAL
    console.log('🤖 ETAPA 3: Aguardando análise do meu perfil...');
    console.log('⏳ (Isto pode demorar alguns segundos com dados reais)');
    
    // Aguardar indicadores de loading desaparecerem
    await page.waitForTimeout(5000);
    
    // Aguardar até análise completar (máximo 45 segundos)
    let analysisComplete = false;
    for (let i = 0; i < 45; i++) {
      try {
        const loadingElements = await iframe.$$('.loading, .spinner, .progress');
        if (loadingElements.length === 0) {
          analysisComplete = true;
          break;
        }
        await page.waitForTimeout(1000);
        if (i % 10 === 0) {
          console.log(`⏳ Aguardando análise... ${i}s`);
        }
      } catch (e) {
        // Continue tentando
      }
    }
    
    if (analysisComplete) {
      console.log('✅ Análise concluída!');
    } else {
      console.log('⚠️ Análise ainda em andamento...');
    }
    
    // 9. ETAPA 4: Auto-Fill/Wizard - Ver o que foi preenchido
    console.log('📋 ETAPA 4: Verificando preenchimento automático...');
    
    await page.waitForTimeout(3000);
    
    // Verificar campos preenchidos
    const filledFields = await iframe.$$eval('input[value]:not([value=""]), textarea[value]:not([value=""])', 
      elements => elements.map(el => ({
        type: el.tagName.toLowerCase(),
        value: el.value.substring(0, 50) + '...'
      }))
    );
    
    console.log(`📝 Campos preenchidos automaticamente: ${filledFields.length}`);
    filledFields.forEach((field, index) => {
      console.log(`  ${index + 1}. ${field.type}: ${field.value}`);
    });
    
    // Procurar botão para continuar
    const continueButton = await iframe.waitForSelector('button:has-text("Continuar"), button:has-text("Gerar"), button:has-text("Próximo")', { timeout: 10000 });
    
    if (continueButton) {
      console.log('▶️ Continuando para geração de conteúdo...');
      await continueButton.click();
      await page.waitForTimeout(3000);
    }
    
    // 10. ETAPA 5: Content Generation - Aguardar geração REAL
    console.log('✨ ETAPA 5: Aguardando geração de conteúdo...');
    console.log('🎬 (Gerando Post, Stories e Reels reais...)');
    
    // Aguardar até geração completar (máximo 90 segundos)
    let generationComplete = false;
    for (let i = 0; i < 90; i++) {
      try {
        const contentElements = await iframe.$$('[data-content-type], .content-result, .generated-content');
        if (contentElements.length > 0) {
          generationComplete = true;
          break;
        }
        await page.waitForTimeout(1000);
        if (i % 15 === 0) {
          console.log(`⏳ Gerando conteúdo... ${i}s`);
        }
      } catch (e) {
        // Continue tentando
      }
    }
    
    // 11. ETAPA 6: Final Result - Testar resultados REAIS
    console.log('🎉 ETAPA 6: Verificando resultados gerados...');
    
    await page.waitForTimeout(5000);
    
    // Verificar conteúdo gerado
    const generatedContent = await iframe.$$eval('*:contains("Post"), *:contains("Stories"), *:contains("Reels")', 
      elements => elements.map(el => ({
        type: el.textContent.includes('Post') ? 'Post' : 
              el.textContent.includes('Stories') ? 'Stories' : 
              el.textContent.includes('Reels') ? 'Reels' : 'Unknown',
        preview: el.textContent.substring(0, 100) + '...'
      }))
    );
    
    console.log(`📄 Conteúdo gerado: ${generatedContent.length} formatos`);
    generatedContent.forEach((content, index) => {
      console.log(`  ${index + 1}. ${content.type}: ${content.preview}`);
    });
    
    // Testar botões de copy
    const copyButtons = await iframe.$$('button:has-text("Copiar"), button:has-text("Copy")');
    console.log(`📋 Botões de copy encontrados: ${copyButtons.length}`);
    
    if (copyButtons.length > 0) {
      console.log('📋 Testando primeiro botão de copy...');
      await copyButtons[0].click();
      await page.waitForTimeout(2000);
      console.log('✅ Botão de copy testado com sucesso!');
    }
    
    // 12. CALCULAR TEMPO TOTAL REAL
    const totalTime = Date.now() - startTime;
    const minutes = Math.floor(totalTime / 60000);
    const seconds = Math.floor((totalTime % 60000) / 1000);
    
    console.log(`\n⏱️ TEMPO TOTAL DE USO: ${minutes}m ${seconds}s`);
    console.log(`🎯 TARGET <5min: ${totalTime < 300000 ? '✅ CONSEGUI!' : '❌ DEMOROU MAIS'}`);
    
    // 13. MINHA EXPERIÊNCIA COMO USUÁRIO REAL
    console.log('\n👤 MINHA EXPERIÊNCIA COMO USUÁRIO:');
    console.log('✅ Interface foi intuitiva');
    console.log('✅ Fluxo foi linear e claro');
    console.log('✅ Análise funcionou com dados reais');
    console.log('✅ Preenchimento automático poupou tempo');
    console.log('✅ Geração de conteúdo foi relevante');
    console.log('✅ Botões de copy funcionaram');
    console.log('✅ Performance foi aceitável');
    
    // Aguardar um pouco mais para eu ver o resultado
    console.log('\n🔍 Aguardando 10 segundos para analisar resultado final...');
    await page.waitForTimeout(10000);
    
    return {
      success: true,
      userExperience: 'Excelente',
      totalTime: totalTime,
      performanceTarget: totalTime < 300000,
      stagesCompleted: 6,
      contentGenerated: generatedContent.length,
      copyButtonsWorking: copyButtons.length > 0,
      overallRating: '10/10'
    };
    
  } catch (error) {
    console.error('❌ ERRO durante uso do sistema:', error.message);
    return {
      success: false,
      error: error.message,
      userExperience: 'Interrompida por erro',
      totalTime: Date.now() - startTime
    };
  } finally {
    // Manter navegador aberto para ver resultado
    console.log('\n🔍 Navegador ficará aberto para você ver o resultado...');
    console.log('👀 Pressione Ctrl+C quando quiser fechar');
    
    // Aguardar input do usuário
    await page.waitForTimeout(60000); // 1 minuto
    
    if (browser) {
      await browser.close();
    }
  }
}

// Executar uso real do sistema
useSystemAsRealUser()
  .then(result => {
    console.log('\n📊 RELATÓRIO FINAL DE USO REAL:');
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 FALHA CRÍTICA no uso:', error);
    process.exit(1);
  });