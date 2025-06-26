import { test, expect, Page } from '@playwright/test';

/**
 * End-to-End Integration Tests for Phase 2 Dashboard System
 * Tests all advanced features implemented in Days 1-4:
 * - Advanced Filters with Persistence
 * - Tag Management with Auto-Suggestions
 * - Search Performance and Caching
 * - User Experience Enhancements
 */

test.describe('Dashboard Integration - Phase 2', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // Mock user authentication
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('authUser', JSON.stringify({
        uid: 'test-user-123',
        email: 'test@example.com',
        displayName: 'Test User'
      }));
    });
  });

  test.describe('Advanced Filters System', () => {
    test('should load and persist filter preferences', async () => {
      await page.goto('/dashboard');
      
      // Wait for dashboard to load
      await expect(page.locator('[data-testid="dashboard-header"]')).toBeVisible();
      
      // Navigate to projects tab
      await page.click('button:has-text("Projetos")');
      
      // Verify advanced filters are loaded
      await expect(page.locator('[data-testid="dashboard-filters"]')).toBeVisible();
      
      // Test filter expansion
      await page.click('[data-testid="expand-filters"]');
      await expect(page.locator('[data-testid="platform-filter"]')).toBeVisible();
      
      // Apply platform filter
      await page.click('[data-testid="platform-instagram"]');
      
      // Verify filter is applied
      await expect(page.locator('[data-testid="active-filters"]')).toContainText('Instagram');
      
      // Test filter persistence
      await page.reload();
      await expect(page.locator('[data-testid="active-filters"]')).toContainText('Instagram');
    });

    test('should use filter presets effectively', async () => {
      await page.goto('/dashboard');
      await page.click('button:has-text("Projetos")');
      
      // Open filter presets
      await page.click('[data-testid="filter-presets-trigger"]');
      
      // Verify presets dropdown is visible
      await expect(page.locator('[data-testid="presets-dropdown"]')).toBeVisible();
      
      // Apply "Favoritos" preset
      await page.click('text=Favoritos');
      
      // Verify favorite filter is applied
      await expect(page.locator('[data-testid="favorite-filter"]')).toBeChecked();
      
      // Save current filters as new preset
      await page.click('[data-testid="save-preset-trigger"]');
      await page.fill('[data-testid="preset-name-input"]', 'Test Preset');
      await page.fill('[data-testid="preset-description-input"]', 'Test automation preset');
      await page.click('[data-testid="save-preset-confirm"]');
      
      // Verify preset was saved
      await page.click('[data-testid="filter-presets-trigger"]');
      await expect(page.locator('text=Test Preset')).toBeVisible();
    });

    test('should perform fast searches with caching', async () => {
      await page.goto('/dashboard');
      await page.click('button:has-text("Projetos")');
      
      // Measure search performance
      const startTime = Date.now();
      
      // Perform search
      await page.fill('[data-testid="search-input"]', 'tutorial');
      
      // Wait for search results
      await page.waitForLoadState('networkidle');
      const searchTime = Date.now() - startTime;
      
      // Verify search completed within performance targets (<300ms)
      expect(searchTime).toBeLessThan(300);
      
      // Verify search results are displayed
      await expect(page.locator('[data-testid="project-card"]').first()).toBeVisible();
      
      // Test cache hit on repeated search
      const cacheStartTime = Date.now();
      await page.fill('[data-testid="search-input"]', '');
      await page.fill('[data-testid="search-input"]', 'tutorial');
      
      await page.waitForLoadState('networkidle');
      const cacheSearchTime = Date.now() - cacheStartTime;
      
      // Cache hit should be significantly faster (<50ms)
      expect(cacheSearchTime).toBeLessThan(50);
    });
  });

  test.describe('Tag Management System', () => {
    test('should manage tags with full CRUD operations', async () => {
      await page.goto('/dashboard');
      
      // Navigate to tags tab
      await page.click('button:has-text("Tags")');
      
      // Wait for TagManager to load
      await expect(page.locator('[data-testid="tag-manager"]')).toBeVisible();
      
      // Create new tag
      await page.click('[data-testid="create-tag-button"]');
      await page.fill('[data-testid="tag-name-input"]', 'E2E Test Tag');
      await page.click('[data-testid="tag-color-blue"]');
      await page.fill('[data-testid="tag-description-input"]', 'Created by E2E test');
      await page.click('[data-testid="save-tag-button"]');
      
      // Verify tag was created
      await expect(page.locator('text=E2E Test Tag')).toBeVisible();
      
      // Test tag editing
      await page.click('[data-testid="tag-menu-E2E Test Tag"]');
      await page.click('text=Editar');
      await page.fill('[data-testid="edit-tag-name"]', 'Updated E2E Tag');
      await page.click('[data-testid="save-tag-edit"]');
      
      // Verify tag was updated
      await expect(page.locator('text=Updated E2E Tag')).toBeVisible();
      
      // Test bulk operations
      await page.click('[data-testid="select-tag-Updated E2E Tag"]');
      await page.click('[data-testid="bulk-delete-button"]');
      await page.click('[data-testid="confirm-bulk-delete"]');
      
      // Verify tag was deleted
      await expect(page.locator('text=Updated E2E Tag')).not.toBeVisible();
    });

    test('should provide analytics and usage statistics', async () => {
      await page.goto('/dashboard');
      await page.click('button:has-text("Tags")');
      
      // Open analytics modal
      await page.click('[data-testid="tag-analytics-button"]');
      
      // Verify analytics modal is displayed
      await expect(page.locator('[data-testid="tag-analytics-modal"]')).toBeVisible();
      
      // Verify analytics content
      await expect(page.locator('[data-testid="most-used-tags"]')).toBeVisible();
      await expect(page.locator('[data-testid="usage-statistics"]')).toBeVisible();
      
      // Test analytics data visualization
      await expect(page.locator('[data-testid="usage-chart"]')).toBeVisible();
    });
  });

  test.describe('Auto-Suggestions System', () => {
    test('should provide intelligent tag suggestions in ScriptForm', async () => {
      await page.goto('/generator');
      
      // Fill form to trigger suggestions
      await page.selectOption('[data-testid="platform-select"]', 'instagram');
      await page.selectOption('[data-testid="format-select"]', 'reel');
      await page.fill('[data-testid="video-topic"]', 'Como fazer um tutorial de marketing digital para iniciantes');
      await page.selectOption('[data-testid="video-goal"]', 'Educar audiência');
      
      // Wait for auto-suggestions to appear
      await expect(page.locator('[data-testid="tag-suggestions"]')).toBeVisible();
      
      // Verify suggestion quality
      await expect(page.locator('[data-testid="suggestion-marketing"]')).toBeVisible();
      await expect(page.locator('[data-testid="suggestion-educational"]')).toBeVisible();
      
      // Test applying suggestions
      await page.click('[data-testid="suggestion-marketing"]');
      
      // Verify tag was applied
      await expect(page.locator('[data-testid="selected-tag-marketing"]')).toBeVisible();
      
      // Test confidence scoring
      const confidenceText = await page.locator('[data-testid="suggestion-confidence"]').first().textContent();
      expect(confidenceText).toMatch(/\d+%/);
    });

    test('should update suggestions based on platform changes', async () => {
      await page.goto('/generator');
      
      // Fill initial content
      await page.fill('[data-testid="video-topic"]', 'Professional networking tips');
      
      // Select LinkedIn platform
      await page.selectOption('[data-testid="platform-select"]', 'linkedin');
      
      // Wait for platform-specific suggestions
      await expect(page.locator('[data-testid="tag-suggestions"]')).toBeVisible();
      await expect(page.locator('text=profissional')).toBeVisible();
      
      // Change to Instagram
      await page.selectOption('[data-testid="platform-select"]', 'instagram');
      
      // Verify suggestions updated
      await expect(page.locator('text=story')).toBeVisible();
    });
  });

  test.describe('Performance and User Experience', () => {
    test('should meet performance benchmarks', async () => {
      // Measure page load time
      const startTime = Date.now();
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      // Dashboard should load within 2 seconds
      expect(loadTime).toBeLessThan(2000);
      
      // Test lazy loading performance
      await page.click('button:has-text("Tags")');
      const tagLoadStart = Date.now();
      await expect(page.locator('[data-testid="tag-manager"]')).toBeVisible();
      const tagLoadTime = Date.now() - tagLoadStart;
      
      // Lazy loaded components should appear within 500ms
      expect(tagLoadTime).toBeLessThan(500);
    });

    test('should provide responsive design across devices', async () => {
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/dashboard');
      
      // Verify mobile-friendly layout
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
      await expect(page.locator('[data-testid="desktop-sidebar"]')).not.toBeVisible();
      
      // Test tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.reload();
      
      // Verify tablet layout
      await expect(page.locator('[data-testid="responsive-grid"]')).toHaveClass(/md:grid-cols-2/);
      
      // Test desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.reload();
      
      // Verify desktop layout
      await expect(page.locator('[data-testid="responsive-grid"]')).toHaveClass(/lg:grid-cols-3/);
    });

    test('should handle error states gracefully', async () => {
      // Simulate network error
      await page.route('**/api/**', route => route.abort());
      
      await page.goto('/dashboard');
      
      // Verify error handling
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
      
      // Test retry functionality
      await page.unroute('**/api/**');
      await page.click('[data-testid="retry-button"]');
      
      // Verify recovery
      await expect(page.locator('[data-testid="dashboard-content"]')).toBeVisible();
    });
  });

  test.describe('Integration Workflow', () => {
    test('should complete full user workflow', async () => {
      // 1. Navigate to dashboard
      await page.goto('/dashboard');
      
      // 2. Create and apply filter preset
      await page.click('button:has-text("Projetos")');
      await page.click('[data-testid="expand-filters"]');
      await page.click('[data-testid="platform-instagram"]');
      await page.click('[data-testid="save-preset-trigger"]');
      await page.fill('[data-testid="preset-name-input"]', 'Instagram Content');
      await page.click('[data-testid="save-preset-confirm"]');
      
      // 3. Navigate to tag management
      await page.click('button:has-text("Tags")');
      await page.click('[data-testid="create-tag-button"]');
      await page.fill('[data-testid="tag-name-input"]', 'Content Strategy');
      await page.click('[data-testid="save-tag-button"]');
      
      // 4. Create new project with auto-suggestions
      await page.goto('/generator');
      await page.selectOption('[data-testid="platform-select"]', 'instagram');
      await page.fill('[data-testid="video-topic"]', 'Content strategy for small businesses');
      
      // 5. Apply auto-suggested tags
      await expect(page.locator('[data-testid="tag-suggestions"]')).toBeVisible();
      await page.click('[data-testid="suggestion-content-strategy"]');
      
      // 6. Generate script
      await page.click('[data-testid="generate-script-button"]');
      
      // 7. Verify workflow completion
      await expect(page.locator('[data-testid="generated-script"]')).toBeVisible();
      
      // 8. Return to dashboard and verify project appears
      await page.goto('/dashboard');
      await page.click('button:has-text("Projetos")');
      await expect(page.locator('text=Content strategy')).toBeVisible();
    });
  });

  test.afterEach(async () => {
    await page.close();
  });
}); 