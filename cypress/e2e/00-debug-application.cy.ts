/// <reference types="cypress" />

describe('Debug Application State', () => {
  it('should capture detailed application state and errors', () => {
    // Collect console errors
    const consoleErrors: string[] = [];
    const consoleWarnings: string[] = [];
    
    cy.visit('/', {
      onBeforeLoad(win) {
        // Override console methods to capture errors
        win.console.error = (...args) => {
          consoleErrors.push(args.join(' '));
        };
        win.console.warn = (...args) => {
          consoleWarnings.push(args.join(' '));
        };
      }
    });
    
    // Wait for initial page load
    cy.wait(5000);
    
    // Capture detailed state
    cy.window().then((win) => {
      cy.get('#root').then(($root) => {
        const rootHtml = $root.html();
        const hasReact = !!(win as any).React || !!(win as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
        
        cy.captureEvidence('debug-application-state', {
          rootEmpty: rootHtml.trim().length === 0,
          rootHtml: rootHtml.substring(0, 1000),
          consoleErrors: consoleErrors,
          consoleWarnings: consoleWarnings,
          hasReact: hasReact,
          documentTitle: win.document.title,
          userAgent: win.navigator.userAgent,
          scripts: Array.from(win.document.scripts).map(s => ({
            src: s.src,
            type: s.type,
            loaded: s.readyState
          })),
          timestamp: new Date().toISOString()
        });
        
        // Log findings
        cy.task('logMessage', `Root is empty: ${rootHtml.trim().length === 0}`);
        cy.task('logMessage', `Console errors count: ${consoleErrors.length}`);
        cy.task('logMessage', `Console warnings count: ${consoleWarnings.length}`);
        cy.task('logMessage', `React detected: ${hasReact}`);
        
        if (consoleErrors.length > 0) {
          consoleErrors.forEach((error, index) => {
            cy.task('logMessage', `Error ${index + 1}: ${error}`);
          });
        }
      });
    });
    
    cy.screenshot('debug-application-state');
  });
}); 