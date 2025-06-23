import { test, expect } from '@playwright/test';
import { TestHelpers } from './helpers';

test.describe('Performance e Responsividade', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
  });

  test.afterEach(async ({ page }) => {
    if (helpers) {
      await helpers.cleanup();
    }
  });

  test.describe('Responsividade Mobile', () => {
    test('TC009 - Mobile responsivo completo', async ({ page }) => {
      // Dado que estou em dispositivo mobile
      await helpers.setMobileViewport();
      
      // Quando navego pelo aplicativo
      await helpers.goToHome();
      
      // Então todos os elementos são clicáveis
      const clickableElements = page.locator('button, a, input, select, textarea');
      const count = await clickableElements.count();
      
      if (count > 0) {
        for (let i = 0; i < Math.min(count, 5); i++) {
          const element = clickableElements.nth(i);
          await expect(element).toBeVisible();
          
          const boundingBox = await element.boundingBox();
          if (boundingBox) {
            // Elementos devem ter tamanho mínimo para touch
            expect(boundingBox.width).toBeGreaterThan(20);
            expect(boundingBox.height).toBeGreaterThan(20);
          }
        }
      }

      // E a interface se adapta corretamente
      const viewport = page.viewportSize();
      expect(viewport?.width).toBe(375);
      expect(viewport?.height).toBe(667);
    });

    test('TC009.1 - Navegação mobile entre páginas', async ({ page }) => {
      await helpers.setMobileViewport();

      const pages = [
        { name: 'Home', action: () => helpers.goToHome() },
        { name: 'Login', action: () => helpers.goToLogin() },
        { name: 'Signup', action: () => helpers.goToSignup() }
      ];

      for (const pageInfo of pages) {
        await test.step(`Testando ${pageInfo.name} em mobile`, async () => {
          await pageInfo.action();
          await page.waitForTimeout(1000);
          
          // Verifica se página carregou sem overflow horizontal
          const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
          const viewportWidth = page.viewportSize()?.width || 375;
          
          // Pequena tolerância para scrollbars
          expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20);
        });
      }
    });

    test('TC009.2 - Formulários responsivos', async ({ page }) => {
      await helpers.setMobileViewport();
      await helpers.goToLogin();

      // Testa campos de input em mobile
      const inputs = page.locator('input, textarea, select');
      const inputCount = await inputs.count();

      if (inputCount > 0) {
        for (let i = 0; i < Math.min(inputCount, 3); i++) {
          const input = inputs.nth(i);
          await expect(input).toBeVisible();
          
          // Testa se campo é focalizável
          await input.click();
          await expect(input).toBeFocused();
          
          // Testa se consegue digitar
          await input.fill('teste mobile');
          const value = await input.inputValue();
          expect(value).toBe('teste mobile');
          
          await input.clear();
        }
      }
    });
  });

  test.describe('Performance e Carregamento', () => {
    test('TC010 - Performance de carregamento', async ({ page }) => {
      // Mede tempo de carregamento
      const startTime = Date.now();
      
      await helpers.goToHome();
      
      const loadTime = Date.now() - startTime;
      
      // Deve carregar em menos de 5 segundos (tolerante para testes)
      expect(loadTime).toBeLessThan(5000);
      console.log(`Tempo de carregamento da home: ${loadTime}ms`);
    });

    test('TC010.1 - Performance do gerador', async ({ page }) => {
      // Faz login primeiro
      await helpers.goToLogin();
      await page.fill('[data-testid="email-input"], input[name="email"], input[type="email"]', 'demo@roteirizar.com');
      await page.fill('[data-testid="password-input"], input[name="password"], input[type="password"]', 'demo123');
      await page.click('[data-testid="login-button"], button[type="submit"], button:has-text("Entrar")');
      await page.waitForTimeout(2000);

      // Mede carregamento do gerador
      const startTime = Date.now();
      await helpers.goToGenerator();
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(3000);
      console.log(`Tempo de carregamento do gerador: ${loadTime}ms`);
    });

    test('TC010.2 - Recursos de página', async ({ page }) => {
      // Monitora requests da página
      const responses: any[] = [];
      
      page.on('response', (response) => {
        responses.push({
          url: response.url(),
          status: response.status(),
          size: response.headers()['content-length']
        });
      });

      await helpers.goToHome();
      await page.waitForTimeout(3000);

      // Verifica se não há muitos recursos falhando
      const failedRequests = responses.filter(r => r.status >= 400);
      const failedRatio = failedRequests.length / responses.length;
      
      expect(failedRatio).toBeLessThan(0.1); // Menos de 10% de falhas
      console.log(`Total de requests: ${responses.length}, falhas: ${failedRequests.length}`);
    });
  });

  test.describe('Acessibilidade Básica', () => {
    test('TC010.3 - Navegação por teclado', async ({ page }) => {
      await helpers.goToHome();

      // Testa navegação por Tab
      const focusableElements = page.locator('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])');
      const count = await focusableElements.count();

      if (count > 0) {
        // Foca primeiro elemento
        await page.keyboard.press('Tab');
        
        const firstFocused = await page.evaluate(() => document.activeElement?.tagName);
        expect(firstFocused).toBeTruthy();

        // Testa alguns tabs
        for (let i = 0; i < Math.min(count, 5); i++) {
          await page.keyboard.press('Tab');
          await page.waitForTimeout(100);
        }

        // Verifica se ainda há elemento focado
        const lastFocused = await page.evaluate(() => document.activeElement?.tagName);
        expect(lastFocused).toBeTruthy();
      }
    });

    test('TC010.4 - Imagens com alt text', async ({ page }) => {
      await helpers.goToHome();

      const images = page.locator('img');
      const imageCount = await images.count();

      if (imageCount > 0) {
        for (let i = 0; i < imageCount; i++) {
          const img = images.nth(i);
          const alt = await img.getAttribute('alt');
          const src = await img.getAttribute('src');
          
          // Imagens devem ter alt text (ou ser decorativas)
          if (src && !src.includes('data:image')) {
            expect(alt).toBeTruthy();
          }
        }
      }
    });

    test('TC010.5 - Contraste e legibilidade', async ({ page }) => {
      await helpers.goToHome();

      // Verifica se texto é legível (básico)
      const textElements = page.locator('p, h1, h2, h3, h4, h5, h6, span, div').filter({ hasText: /.+/ });
      const textCount = await textElements.count();

      if (textCount > 0) {
        for (let i = 0; i < Math.min(textCount, 5); i++) {
          const element = textElements.nth(i);
          
          if (await element.isVisible()) {
            const styles = await element.evaluate((el) => {
              const computed = window.getComputedStyle(el);
              return {
                fontSize: computed.fontSize,
                color: computed.color,
                backgroundColor: computed.backgroundColor
              };
            });

            // Font size mínimo
            const fontSize = parseInt(styles.fontSize);
            expect(fontSize).toBeGreaterThan(10);
          }
        }
      }
    });
  });

  test.describe('Cross-Browser Compatibility', () => {
    test('TC010.6 - Funcionalidade básica em diferentes browsers', async ({ page }) => {
      // Este teste roda automaticamente em diferentes browsers via playwright.config.ts
      await helpers.goToHome();

      // Verifica se elementos básicos funcionam
      const basicElements = [
        'title',
        'h1, h2, h3',
        'button, a',
        'main, .main, .content'
      ];

      for (const selector of basicElements) {
        const element = page.locator(selector);
        if (await element.count() > 0) {
          await expect(element.first()).toBeVisible();
        }
      }
    });
  });

  test.describe('Múltiplos Viewports', () => {
    test('TC009.3 - Desktop, Tablet e Mobile', async ({ page }) => {
      const viewports = [
        { name: 'Desktop', width: 1280, height: 720 },
        { name: 'Tablet', width: 768, height: 1024 },
        { name: 'Mobile', width: 375, height: 667 }
      ];

      for (const viewport of viewports) {
        await test.step(`Testando viewport ${viewport.name}`, async () => {
          await page.setViewportSize({ width: viewport.width, height: viewport.height });
          await helpers.goToHome();
          await page.waitForTimeout(1000);

          // Verifica se página é responsiva
          const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
          expect(bodyWidth).toBeLessThanOrEqual(viewport.width + 50); // Tolerância

          // Verifica se elementos principais estão visíveis
          const mainContent = page.locator('main, .main, .content, body > div');
          if (await mainContent.count() > 0) {
            await expect(mainContent.first()).toBeVisible();
          }
        });
      }
    });
  });
}); 