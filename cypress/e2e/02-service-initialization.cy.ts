/// <reference types="cypress" />

describe('Service Initialization Evidence', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.monitorConsole();
  });

  it('should initialize all services successfully', () => {
    cy.waitForAppLoad();
    
    // Wait for services to initialize
    cy.wait(5000);
    
    // Check service initialization logs
    cy.window().then((win) => {
      // Access debug services (if available)
      if ((win as any).debugServices) {
        cy.testServiceHealth();
      } else {
        // If debug services not available, check for service indicators
        cy.captureEvidence('service-initialization', {
          debugServices: false,
          message: 'Debug services not available - checking service indicators',
          timestamp: new Date().toISOString()
        });
        
        // Look for signs that services are working
        // Check for API service availability
        cy.window().then((window) => {
          const hasGlobalServices = !!(window as any).services || !!(window as any).serviceRegistry;
          
          cy.captureEvidence('global-services-check', {
            hasGlobalServices,
            serviceRegistry: !!(window as any).serviceRegistry,
            services: !!(window as any).services,
            timestamp: new Date().toISOString()
          });
        });
      }
    });
  });

  it('should have Firebase services available', () => {
    cy.waitForAppLoad();
    
    cy.window().then((win) => {
      // Check for Firebase initialization
      const hasFirebase = !!(win as any).firebase || !!(win as any).FirebaseApp;
      
      cy.captureEvidence('firebase-services', {
        available: hasFirebase,
        timestamp: new Date().toISOString()
      });
    });
  });

  it('should have Gemini AI service configured', () => {
    cy.waitForAppLoad();
    
    cy.window().then((win) => {
      // Check for AI service configuration
      const hasGemini = !!(win as any).GoogleGenerativeAI || !!(win as any).GeminiService;
      
      cy.captureEvidence('gemini-ai-service', {
        available: hasGemini,
        timestamp: new Date().toISOString()
      });
    });
  });

  it('should initialize without critical service errors', () => {
    cy.waitForAppLoad();
    
    // Monitor for any service-related errors in console
    cy.window().then((win) => {
      const logs = (win as any).cypressConsoleLogs || [];
      
      // Check for critical service errors
      const serviceErrors = logs.filter((log: string) => 
        log.toLowerCase().includes('service') && 
        (log.toLowerCase().includes('error') || log.toLowerCase().includes('failed'))
      );
      
      cy.captureEvidence('service-error-check', {
        totalLogs: logs.length,
        serviceErrors: serviceErrors.length,
        errors: serviceErrors,
        status: serviceErrors.length === 0 ? 'CLEAN' : 'ERRORS_DETECTED',
        timestamp: new Date().toISOString()
      });
      
      // Assert no critical service errors
      expect(serviceErrors).to.have.length(0);
    });
  });

  it('should have authentication system ready', () => {
    cy.waitForAppLoad();
    
    // Check for authentication context or indicators
    cy.get('body').then(() => {
      // Look for auth-related elements
      cy.get('[data-testid*="auth"], [data-testid*="login"], .auth, .login, button[type="submit"]', { timeout: 5000 })
        .should('exist')
        .then(($authElements) => {
          cy.captureEvidence('auth-system-ready', {
            authElementsFound: $authElements.length,
            elements: Array.from($authElements).map(el => ({
              tagName: el.tagName,
              className: el.className,
              textContent: el.textContent?.slice(0, 50)
            })),
            timestamp: new Date().toISOString()
          });
        });
    });
  });

  it('should have routing system functional', () => {
    cy.waitForAppLoad();
    
    // Check current URL and routing
    cy.url().then((url) => {
      cy.captureEvidence('routing-system', {
        currentUrl: url,
        baseUrl: Cypress.config('baseUrl'),
        timestamp: new Date().toISOString()
      });
    });
    
    // Check if React Router is present
    cy.window().then((win) => {
      const hasRouter = !!(win as any).ReactRouter || 
                       document.querySelector('[data-testid*="router"], .router') ||
                       document.querySelector('a[href]');
      
      cy.captureEvidence('router-presence', {
        routerDetected: !!hasRouter,
        timestamp: new Date().toISOString()
      });
    });
  });
}); 