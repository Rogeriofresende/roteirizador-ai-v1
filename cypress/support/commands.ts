// cypress/support/commands.ts

/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to capture evidence with screenshot
       * @example cy.captureEvidence('test-step', { action: 'click-button' })
       */
      captureEvidence(type: string, data: any): Chainable<Element>
      
      /**
       * Custom command to wait for app to be fully loaded
       * @example cy.waitForAppLoad()
       */
      waitForAppLoad(): Chainable<Element>
      
      /**
       * Custom command to monitor console errors
       * @example cy.monitorConsole()
       */
      monitorConsole(): Chainable<Element>
      
      /**
       * Custom command to test service health
       * @example cy.testServiceHealth()
       */
      testServiceHealth(): Chainable<Element>
    }
  }
}

// Custom command to capture evidence
Cypress.Commands.add('captureEvidence', (type: string, data: any) => {
  cy.screenshot(`${type}-${Date.now()}`);
  cy.task('collectEvidence', {
    type,
    evidence: data,
    timestamp: new Date().toISOString(),
    url: Cypress.config('baseUrl'),
    viewport: {
      width: Cypress.config('viewportWidth'),
      height: Cypress.config('viewportHeight')
    }
  });
});

// Custom command to wait for app to be fully loaded
Cypress.Commands.add('waitForAppLoad', () => {
  // Wait for React app to be ready
  cy.get('body').should('be.visible');
  
  // Wait for root element to exist
  cy.get('#root').should('exist');
  
  // Wait for React app to render content inside root
  cy.get('#root').should('not.be.empty').then(($root) => {
    // If root has content, log for evidence
    cy.task('logMessage', `Root element has content: ${$root.html().length} characters`);
  });
  
  // Check for loading states (optional, non-blocking)
  cy.get('body').then(($body) => {
    const hasLoadingElements = $body.find('[data-testid="loading"], .loading, .spinner').length > 0;
    cy.task('logMessage', `Loading elements found: ${hasLoadingElements}`);
  });
  
  // Additional wait to ensure everything is settled
  cy.wait(2000);
});

// Custom command to monitor console errors
Cypress.Commands.add('monitorConsole', () => {
  cy.window().then((win) => {
    const logs: string[] = [];
    const originalConsoleError = win.console.error;
    const originalConsoleWarn = win.console.warn;
    
    // Override console.error
    win.console.error = (...args: any[]) => {
      const errorMessage = args.join(' ');
      logs.push(`ERROR: ${errorMessage}`);
      originalConsoleError.apply(win.console, args);
    };
    
    // Override console.warn  
    win.console.warn = (...args: any[]) => {
      const warnMessage = args.join(' ');
      logs.push(`WARN: ${warnMessage}`);
      originalConsoleWarn.apply(win.console, args);
    };
    
    // Store logs on window object for later access
    (win as any).cypressConsoleLogs = logs;
  });
});

// Custom command to test service health
Cypress.Commands.add('testServiceHealth', () => {
  cy.window().then((win) => {
    // Check if debug services are available
    if ((win as any).debugServices) {
      cy.then(async () => {
        try {
          const serviceStatus = await (win as any).debugServices.testServices();
          cy.task('collectEvidence', {
            type: 'service-health',
            evidence: {
              services: serviceStatus,
              available: true,
              timestamp: new Date().toISOString()
            }
          });
          return serviceStatus;
        } catch (error) {
          cy.task('collectEvidence', {
            type: 'service-health',
            evidence: {
              error: error.message,
              available: false,
              timestamp: new Date().toISOString()
            }
          });
          throw error;
        }
      });
    } else {
      cy.task('collectEvidence', {
        type: 'service-health',
        evidence: {
          debugServices: false,
          message: 'Debug services not available',
          timestamp: new Date().toISOString()
        }
      });
    }
  });
});

export {}; 