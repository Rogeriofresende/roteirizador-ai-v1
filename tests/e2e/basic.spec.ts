import { test, expect } from '@playwright/test';

test.describe('Teste Básico - Validação do Setup', () => {
  test('TC001 - Playwright está funcionando', async ({ page }) => {
    // Vai para uma página simples online
    await page.goto('https://example.com');
    
    // Verifica se a página carregou
    await expect(page).toHaveTitle(/Example Domain/);
    
    // Verifica se há texto na página
    const heading = page.locator('h1');
    await expect(heading).toContainText('Example Domain');
  });

  test('TC002 - Browser consegue navegar', async ({ page }) => {
    // Teste básico de navegação
    await page.goto('https://playwright.dev');
    
    // Verifica se carregou
    await expect(page).toHaveTitle(/Playwright/);
    
    // Verifica se consegue clicar em elementos
    const docsLink = page.locator('text=Docs').first();
    if (await docsLink.count() > 0) {
      await docsLink.click();
      
      // Aguarda navegação
      await page.waitForTimeout(2000);
      
      // Verifica se navegou
      expect(page.url()).toContain('playwright.dev');
    }
  });

  test('TC003 - Teste de responsividade básica', async ({ page }) => {
    await page.goto('https://example.com');
    
    // Testa viewport mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    // Verifica se página ainda está visível
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Volta para desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(1000);
    
    await expect(body).toBeVisible();
  });

  test('TC004 - Teste de performance básico', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('https://example.com');
    
    const loadTime = Date.now() - startTime;
    
    // Deve carregar em menos de 5 segundos
    expect(loadTime).toBeLessThan(5000);
    
    console.log(`Tempo de carregamento: ${loadTime}ms`);
  });
}); 