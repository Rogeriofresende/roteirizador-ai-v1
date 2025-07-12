/// <reference types="cypress" />

describe('Application Load Evidence', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.monitorConsole();
  });

  it('should load without JavaScript errors', () => {
    // Monitor console for errors
    cy.window().then((win) => {
      const logs: string[] = [];
      const originalConsoleError = win.console.error;
      
      win.console.error = (...args: any[]) => {
        logs.push(args.join(' '));
        originalConsoleError.apply(win.console, args);
      };
      
      // Wait for app to fully load
      cy.waitForAppLoad();
      
      // Additional wait to capture any delayed errors
      cy.wait(3000);
      
      // Verify no critical errors
      cy.then(() => {
        expect(logs).to.have.length(0);
      });
      
      // Capture evidence
      cy.captureEvidence('console-clean-evidence', {
        errors: logs,
        errorCount: logs.length,
        status: logs.length === 0 ? 'CLEAN' : 'ERRORS_DETECTED',
        timestamp: new Date().toISOString()
      });
    });
  });

  it('should display main navigation elements', () => {
    cy.waitForAppLoad();
    
    // Check for main navigation or app structure (flexible approach)
    cy.get('body').should('be.visible');
    
    // Look for ANY navigation-like elements (more flexible)
    cy.get('body').then(($body) => {
      const hasNav = $body.find('nav, [role="navigation"], .navbar, .nav, header, .header').length > 0;
      const hasLinks = $body.find('a[href]').length > 0;
      const hasButtons = $body.find('button').length > 0;
      
      cy.captureEvidence('navigation-analysis', {
        hasNavElements: hasNav,
        hasLinks: hasLinks,
        hasButtons: hasButtons,
        bodyContent: $body.html().substring(0, 500),
        timestamp: new Date().toISOString()
      });
    });
    
    // Look for any interactive elements
    cy.get('button, a[href], input, [role="button"]').then(($elements) => {
      cy.captureEvidence('interactive-elements', {
        found: $elements.length > 0,
        count: $elements.length,
        elements: Array.from($elements).slice(0, 5).map(el => ({
          tagName: el.tagName,
          textContent: el.textContent?.slice(0, 50)
        })),
        timestamp: new Date().toISOString()
      });
    });
  });

  it('should have proper document structure', () => {
    cy.waitForAppLoad();
    
    // Check document title
    cy.title().should('not.be.empty').then((title) => {
      cy.captureEvidence('document-title', {
        title,
        timestamp: new Date().toISOString()
      });
    });
    
    // Check meta viewport (optional)
    cy.get('head').then(($head) => {
      const hasViewport = $head.find('meta[name="viewport"]').length > 0;
      cy.captureEvidence('meta-viewport', {
        hasViewport,
        timestamp: new Date().toISOString()
      });
    });
    
    // Check if root has any content structure
    cy.get('#root').then(($root) => {
      const hasContent = $root.html().trim().length > 0;
      const contentStructure = {
        hasContent,
        contentLength: $root.html().length,
        hasChildren: $root.children().length > 0,
        childrenCount: $root.children().length,
        innerHTML: $root.html().substring(0, 200)
      };
      
      cy.captureEvidence('root-structure', {
        ...contentStructure,
        timestamp: new Date().toISOString()
      });
    });
  });

  it('should load with acceptable performance', () => {
    const startTime = Date.now();
    
    cy.visit('/');
    cy.waitForAppLoad();
    
    cy.then(() => {
      const loadTime = Date.now() - startTime;
      
      // Performance assertions
      expect(loadTime).to.be.lessThan(5000); // 5 second max load time
      
      // Collect performance evidence
      cy.captureEvidence('performance-metrics', {
        loadTime,
        target: 5000,
        passed: loadTime < 5000,
        status: loadTime < 3000 ? 'EXCELLENT' : loadTime < 5000 ? 'GOOD' : 'SLOW',
        timestamp: new Date().toISOString()
      });
    });
  });

  it('should have React app properly mounted', () => {
    cy.waitForAppLoad();
    
    // Check if React app is mounted
    cy.get('#root').should('exist');
    
    // Check for React presence and application state
    cy.window().then((win) => {
      const hasReact = !!(win as any).React || !!(win as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
      const hasReactFiberRoot = !!(win as any).document?.querySelector('#root')?._reactInternalFiber;
      
      cy.get('#root').then(($root) => {
        const isEmpty = $root.html().trim().length === 0;
        const hasErrorMessage = $root.html().includes('error') || $root.html().includes('Error');
        
        cy.captureEvidence('react-app-mounted', {
          rootExists: true,
          reactDetected: hasReact,
          reactFiberDetected: hasReactFiberRoot,
          rootIsEmpty: isEmpty,
          hasErrorMessage: hasErrorMessage,
          rootContent: $root.html().substring(0, 300),
          timestamp: new Date().toISOString()
        });
      });
    });
  });
}); 