import { Page, expect } from '@playwright/test';
import { testUsers } from './test-data';

export class TestHelpers {
  constructor(private page: Page) {}

  // Navegação
  async goToHome() {
    await this.page.goto('/');
    await this.waitForPageLoad();
  }

  async goToLogin() {
    await this.page.goto('/login');
    await this.waitForPageLoad();
  }

  async goToSignup() {
    await this.page.goto('/signup');
    await this.waitForPageLoad();
  }

  async goToDashboard() {
    await this.page.goto('/dashboard');
    await this.waitForPageLoad();
  }

  async goToGenerator() {
    await this.page.goto('/generator');
    await this.waitForPageLoad();
  }

  // Autenticação
  async login(email?: string, password?: string) {
    const user = email && password ? { email, password } : testUsers.valid;
    
    await this.goToLogin();
    await this.page.fill('[data-testid="email-input"]', user.email);
    await this.page.fill('[data-testid="password-input"]', user.password);
    await this.page.click('[data-testid="login-button"]');
    
    // Aguarda redirect para dashboard
    await this.page.waitForURL('/dashboard');
  }

  async signup(name?: string, email?: string, password?: string) {
    const user = name && email && password 
      ? { name, email, password } 
      : testUsers.valid;
    
    await this.goToSignup();
    await this.page.fill('[data-testid="name-input"]', user.name);
    await this.page.fill('[data-testid="email-input"]', user.email);
    await this.page.fill('[data-testid="password-input"]', user.password);
    await this.page.click('[data-testid="signup-button"]');
  }

  async logout() {
    // Assume que há um botão de logout no header
    await this.page.click('[data-testid="logout-button"]');
    await this.page.waitForURL('/');
  }

  // Verificações de autenticação
  async expectToBeLoggedIn() {
    // Verifica se está na página protegida
    await expect(this.page).toHaveURL(/\/(dashboard|generator)/);
  }

  async expectToBeLoggedOut() {
    // Verifica se foi redirecionado para login
    await expect(this.page).toHaveURL(/\/(login|$)/);
  }

  // Geração de roteiros
  async generateScript(platform: string, topic: string) {
    await this.goToGenerator();
    
    // Seleciona plataforma
    await this.page.selectOption('[data-testid="platform-select"]', platform);
    
    // Preenche tópico
    await this.page.fill('[data-testid="topic-input"]', topic);
    
    // Clica em gerar
    await this.page.click('[data-testid="generate-button"]');
    
    // Aguarda resultado
    await this.page.waitForSelector('[data-testid="generated-script"]', { timeout: 30000 });
  }

  // Verificações de UI
  async expectElementToBeVisible(selector: string) {
    await expect(this.page.locator(selector)).toBeVisible();
  }

  async expectElementToHaveText(selector: string, text: string) {
    await expect(this.page.locator(selector)).toHaveText(text);
  }

  async expectElementToContainText(selector: string, text: string) {
    await expect(this.page.locator(selector)).toContainText(text);
  }

  // Performance e loading
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async measurePageLoadTime(): Promise<number> {
    const startTime = Date.now();
    await this.waitForPageLoad();
    return Date.now() - startTime;
  }

  // Formulários
  async fillForm(fields: Record<string, string>) {
    for (const [fieldName, value] of Object.entries(fields)) {
      await this.page.fill(`[data-testid="${fieldName}-input"]`, value);
    }
  }

  async expectFormError(fieldName: string, errorMessage: string) {
    const errorSelector = `[data-testid="${fieldName}-error"]`;
    await this.expectElementToBeVisible(errorSelector);
    await this.expectElementToContainText(errorSelector, errorMessage);
  }

  // Responsividade
  async setMobileViewport() {
    await this.page.setViewportSize({ width: 375, height: 667 });
  }

  async setDesktopViewport() {
    await this.page.setViewportSize({ width: 1280, height: 720 });
  }

  async setTabletViewport() {
    await this.page.setViewportSize({ width: 768, height: 1024 });
  }

  // Screenshots para debugging
  async takeScreenshot(name: string) {
    await this.page.screenshot({ 
      path: `test-results/screenshots/${name}.png`,
      fullPage: true 
    });
  }

  // Cleanup
  async cleanup() {
    // Limpa localStorage
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // Faz logout se estiver logado
    try {
      await this.logout();
    } catch {
      // Ignora erro se já estiver deslogado
    }
  }
} 