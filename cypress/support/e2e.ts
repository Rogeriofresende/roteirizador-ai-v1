// cypress/support/e2e.ts
import './commands';

// Disable uncaught exception handling for cleaner evidence collection
Cypress.on('uncaught:exception', (err, runnable) => {
  // Log the error for evidence collection but don't fail the test
  console.log('[EVIDENCE] Uncaught exception:', err.message);
  
  // Return false to prevent Cypress from failing the test
  // We want to capture evidence even when there are errors
  return false;
});

// Performance monitoring
beforeEach(() => {
  cy.window().then((win) => {
    // Clear performance entries
    if (win.performance && win.performance.clearResourceTimings) {
      win.performance.clearResourceTimings();
    }
    
    // Mark test start time
    if (win.performance && win.performance.mark) {
      win.performance.mark('test-start');
    }
  });
});

afterEach(() => {
  cy.window().then((win) => {
    // Mark test end time
    if (win.performance && win.performance.mark) {
      win.performance.mark('test-end');
    }
    
    // Collect performance evidence
    if (win.performance && win.performance.getEntriesByType) {
      const navigationEntries = win.performance.getEntriesByType('navigation');
      const resourceEntries = win.performance.getEntriesByType('resource');
      
      cy.task('collectEvidence', {
        type: 'performance-after-test',
        evidence: {
          navigation: navigationEntries,
          resources: resourceEntries.length,
          timestamp: new Date().toISOString()
        }
      });
    }
  });
}); 