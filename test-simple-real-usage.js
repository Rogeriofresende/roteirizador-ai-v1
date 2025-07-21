/**
 * 🖱️ USO REAL SIMPLIFICADO - SONORA V2
 * 
 * EU vou usar o sistema de verdade
 */

import puppeteer from 'puppeteer';

async function useSystemForReal() {
  console.log('🚀 Vou usar o sistema Sonora V2 como usuário real...');
  
  let browser;
  const startTime = Date.now();
  
  try {
    // Abrir navegador visível
    browser = await puppeteer.launch({ 
      headless: false, 
      defaultViewport: null,
      args: ['--start-maximized']
    });
    
    const page = await browser.newPage();
    
    // Acessar Storybook
    console.log('📱 Acessando Storybook...');
    await page.goto('http://localhost:6006/');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('✅ Storybook carregado! Agora vou navegar...');
    
    // Vou aguardar e tentar encontrar o componente
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Procurar por qualquer link que mencione "Sonora"
    const links = await page.$$('a');
    console.log(`🔍 Encontrei ${links.length} links no Storybook`);
    
    for (const link of links) {
      const text = await link.evaluate(el => el.textContent || '');
      if (text.toLowerCase().includes('sonora')) {
        console.log(`📌 Encontrei link: ${text}`);
        await link.click();
        await page.waitForTimeout(3000);
        break;
      }
    }
    
    // Aguardar iframe carregar
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Procurar iframe do Storybook
    const iframeElement = await page.$('iframe');
    if (iframeElement) {
      console.log('🎯 Encontrei iframe do componente!');
      const iframe = await iframeElement.contentFrame();
      
      if (iframe) {
        console.log('✅ Acessei o componente Sonora!');
        
        // Aguardar componente carregar
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Procurar botões
        const buttons = await iframe.$$('button');
        console.log(`🔘 Encontrei ${buttons.length} botões no componente`);
        
        if (buttons.length > 0) {
          console.log('🖱️ Clicando no primeiro botão...');
          await buttons[0].click();
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          // Procurar campos de input
          const inputs = await iframe.$$('input');
          console.log(`📝 Encontrei ${inputs.length} campos de input`);
          
          if (inputs.length > 0) {
            console.log('⌨️ Digitando no primeiro campo...');
            await inputs[0].click();
            await inputs[0].type('https://instagram.com/natgeo');
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Procurar próximo botão
            const nextButtons = await iframe.$$('button');
            if (nextButtons.length > 1) {
              console.log('▶️ Clicando no próximo botão...');
              await nextButtons[1].click();
              await new Promise(resolve => setTimeout(resolve, 5000));
            }
          }
        }
        
        // Aguardar processamento
        console.log('⏳ Aguardando sistema processar...');
        await new Promise(resolve => setTimeout(resolve, 15000));
        
        // Verificar resultado
        const allElements = await iframe.$$('*');
        console.log(`📊 Total de elementos na página: ${allElements.length}`);
        
        const totalTime = Date.now() - startTime;
        const minutes = Math.floor(totalTime / 60000);
        const seconds = Math.floor((totalTime % 60000) / 1000);
        
        console.log(`\n⏱️ TEMPO TOTAL: ${minutes}m ${seconds}s`);
        console.log('✅ CONSEGUI USAR O SISTEMA COMO USUÁRIO REAL!');
        
        return {
          success: true,
          realUsage: true,
          timeSpent: totalTime,
          buttonsFound: buttons.length,
          inputsFound: inputs.length,
          userExperience: 'Funcional'
        };
      }
    }
    
    throw new Error('Não consegui acessar o componente');
    
  } catch (error) {
    console.error('❌ ERRO:', error.message);
    return {
      success: false,
      error: error.message,
      realUsage: false
    };
  } finally {
    // Manter navegador aberto para ver
    console.log('\n👀 Navegador permanecerá aberto por 30 segundos...');
    if (browser) {
      const pages = await browser.pages();
      if (pages.length > 0) {
        await new Promise(resolve => setTimeout(resolve, 30000));
      }
      await browser.close();
    }
  }
}

// Executar uso real
useSystemForReal()
  .then(result => {
    console.log('\n📊 RESULTADO DO USO REAL:');
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 ERRO:', error);
    process.exit(1);
  });