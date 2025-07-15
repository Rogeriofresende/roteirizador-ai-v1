const puppeteer = require('puppeteer');

async function testBreadcrumb() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  const errors = [];
  
  // Capturar erros de console
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  try {
    // Testar Breadcrumb story
    await page.goto('http://localhost:6006/?path=/story/ui-breadcrumb--default');
    await page.waitForSelector('iframe[id="storybook-preview-iframe"]', { timeout: 10000 });
    
    // Aguardar um pouco para capturar erros
    await page.waitForTimeout(3000);
    
    if (errors.length === 0) {
      console.log('✅ Breadcrumb funcionando sem erros!');
    } else {
      console.log('❌ Erros encontrados:');
      errors.forEach(error => console.log('  -', error));
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  } finally {
    await browser.close();
  }
}

testBreadcrumb(); 