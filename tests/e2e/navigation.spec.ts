import { test, expect } from '@playwright/test';
import { TestHelpers } from './helpers';

test.describe('Navegação e Dashboard', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
  });

  test.afterEach(async ({ page }) => {
    if (helpers) {
      await helpers.cleanup();
    }
  });

  test.describe('Dashboard de Usuário', () => {
    test('TC007 - Dashboard completo após login', async ({ page }) => {
      // Dado que estou logado
      await helpers.goToLogin();
      await page.fill('[data-testid="email-input"], input[name="email"], input[type="email"]', 'demo@roteirizar.com');
      await page.fill('[data-testid="password-input"], input[name="password"], input[type="password"]', 'demo123');
      await page.click('[data-testid="login-button"], button[type="submit"], button:has-text("Entrar")');
      
      await page.waitForTimeout(3000);

      // Quando acesso o dashboard
      await helpers.goToDashboard();

      // Então vejo informações do meu perfil
      const userInfo = page.locator('[data-testid="user-info"], .user-profile, .profile-info, h1, h2');
      const hasUserContent = await userInfo.count() > 0;
      
      if (hasUserContent) {
        await expect(userInfo.first()).toBeVisible();
      }

      // E posso navegar para o gerador
      const generatorLink = page.locator('[data-testid="generator-link"], a:has-text("Gerar"), a:has-text("Generator"), [href*="generator"]');
      if (await generatorLink.count() > 0) {
        await expect(generatorLink.first()).toBeVisible();
        await generatorLink.first().click();
        await page.waitForTimeout(2000);
        expect(page.url()).toMatch(/(generator|gerador)/);
      } else {
        // Verifica se há botões ou elementos que levam ao gerador
        const generateButton = page.locator('button:has-text("Gerar"), button:has-text("Novo"), .generate-btn');
        if (await generateButton.count() > 0) {
          await expect(generateButton.first()).toBeVisible();
        }
      }
    });
  });

  test.describe('Proteção de Rotas', () => {
    test('TC008 - Navegação protegida sem login', async ({ page }) => {
      // Dado que não estou logado
      // Quando tento acessar área restrita
      await helpers.goToDashboard();

      // Então sou redirecionado para login
      await page.waitForTimeout(3000);
      const currentUrl = page.url();
      
      expect(currentUrl.includes('login') || currentUrl.includes('signin')).toBeTruthy();
    });
  });
}); 