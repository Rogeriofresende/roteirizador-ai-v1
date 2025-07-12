/// <reference types="cypress" />

describe('Performance Evidence Collection', () => {
  it('should meet performance benchmarks', () => {
    const startTime = Date.now();
    
    cy.visit('/');
    cy.waitForAppLoad();
    
    cy.then(() => {
      const loadTime = Date.now() - startTime;
      
      // Performance assertions
      expect(loadTime).to.be.lessThan(5000); // 5 second max load time
      
      // Collect performance evidence
      cy.captureEvidence('performance-benchmarks', {
        loadTime,
        target: 5000,
        passed: loadTime < 5000,
        status: loadTime < 2000 ? 'EXCELLENT' : loadTime < 3000 ? 'GOOD' : loadTime < 5000 ? 'ACCEPTABLE' : 'SLOW',
        timestamp: new Date().toISOString()
      });
    });
  });

  it('should collect Core Web Vitals', () => {
    cy.visit('/');
    cy.waitForAppLoad();
    
    cy.window().then((win) => {
      // Wait for performance entries
      cy.wait(3000);
      
      // Collect navigation timing
      const navigation = win.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        const metrics = {
          // Time to First Byte
          ttfb: navigation.responseStart - navigation.requestStart,
          
          // DOM Content Loaded
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          
          // Load Complete
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          
          // Total Load Time
          totalLoadTime: navigation.loadEventEnd - navigation.navigationStart,
          
          // DNS Lookup Time
          dnsTime: navigation.domainLookupEnd - navigation.domainLookupStart,
          
          // Connection Time
          connectionTime: navigation.connectEnd - navigation.connectStart
        };
        
        cy.captureEvidence('core-web-vitals', {
          ...metrics,
          navigation: {
            type: navigation.type,
            redirectCount: navigation.redirectCount
          },
          timestamp: new Date().toISOString()
        });
        
        // Performance assertions
        expect(metrics.ttfb).to.be.lessThan(800); // TTFB should be under 800ms
        expect(metrics.totalLoadTime).to.be.lessThan(3000); // Total load under 3s
      }
    });
  });

  it('should measure resource loading performance', () => {
    cy.visit('/');
    cy.waitForAppLoad();
    
    cy.window().then((win) => {
      // Wait for resources to load
      cy.wait(2000);
      
      const resources = win.performance.getEntriesByType('resource');
      
      // Analyze resource performance
      const resourceMetrics = {
        totalResources: resources.length,
        jsResources: resources.filter(r => r.name.includes('.js')).length,
        cssResources: resources.filter(r => r.name.includes('.css')).length,
        imageResources: resources.filter(r => r.name.match(/\.(jpg|jpeg|png|gif|svg|webp)/)).length,
        fontResources: resources.filter(r => r.name.match(/\.(woff|woff2|ttf|eot)/)).length,
        
        // Calculate average load times
        avgLoadTime: resources.reduce((sum, r) => sum + (r.responseEnd - r.startTime), 0) / resources.length,
        
        // Find slowest resource
        slowestResource: resources.reduce((slowest, current) => {
          const currentTime = current.responseEnd - current.startTime;
          const slowestTime = slowest.responseEnd - slowest.startTime;
          return currentTime > slowestTime ? current : slowest;
        }),
        
        // Count failed resources (if any)
        failedResources: resources.filter(r => r.responseEnd === 0).length
      };
      
      cy.captureEvidence('resource-performance', {
        ...resourceMetrics,
        slowestResourceTime: resourceMetrics.slowestResource.responseEnd - resourceMetrics.slowestResource.startTime,
        slowestResourceUrl: resourceMetrics.slowestResource.name,
        timestamp: new Date().toISOString()
      });
      
      // Performance assertions
      expect(resourceMetrics.avgLoadTime).to.be.lessThan(1000); // Average resource load under 1s
      expect(resourceMetrics.failedResources).to.equal(0); // No failed resources
    });
  });

  it('should measure JavaScript execution performance', () => {
    cy.visit('/');
    
    cy.window().then((win) => {
      // Measure script execution time
      const scriptStart = performance.now();
      
      cy.waitForAppLoad().then(() => {
        const scriptEnd = performance.now();
        const executionTime = scriptEnd - scriptStart;
        
        // Collect JavaScript performance metrics
        cy.captureEvidence('javascript-performance', {
          executionTime,
          target: 2000, // 2 second target for script execution
          passed: executionTime < 2000,
          status: executionTime < 500 ? 'EXCELLENT' : executionTime < 1000 ? 'GOOD' : executionTime < 2000 ? 'ACCEPTABLE' : 'SLOW',
          timestamp: new Date().toISOString()
        });
        
        // Performance assertion
        expect(executionTime).to.be.lessThan(2000); // JS execution under 2s
      });
    });
  });

  it('should monitor memory usage', () => {
    cy.visit('/');
    cy.waitForAppLoad();
    
    cy.window().then((win) => {
      // Check if performance.memory is available (Chrome only)
      if ((win.performance as any).memory) {
        const memory = (win.performance as any).memory;
        
        const memoryMetrics = {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
          memoryUsagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
        };
        
        cy.captureEvidence('memory-usage', {
          ...memoryMetrics,
          formattedUsed: (memoryMetrics.usedJSHeapSize / 1024 / 1024).toFixed(2) + ' MB',
          formattedTotal: (memoryMetrics.totalJSHeapSize / 1024 / 1024).toFixed(2) + ' MB',
          timestamp: new Date().toISOString()
        });
        
        // Memory usage assertion (should use less than 50% of heap limit)
        expect(memoryMetrics.memoryUsagePercentage).to.be.lessThan(50);
      } else {
        cy.captureEvidence('memory-usage', {
          available: false,
          message: 'Memory API not available (non-Chrome browser)',
          timestamp: new Date().toISOString()
        });
      }
    });
  });

  it('should measure paint and rendering performance', () => {
    cy.visit('/');
    cy.waitForAppLoad();
    
    cy.window().then((win) => {
      // Wait for paint events
      cy.wait(1000);
      
      // Get paint timing
      const paintEntries = win.performance.getEntriesByType('paint');
      
      const paintMetrics = {
        firstPaint: paintEntries.find(entry => entry.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
        paintEntriesCount: paintEntries.length
      };
      
      cy.captureEvidence('paint-performance', {
        ...paintMetrics,
        firstPaintStatus: paintMetrics.firstPaint < 1000 ? 'EXCELLENT' : paintMetrics.firstPaint < 2000 ? 'GOOD' : 'SLOW',
        fcpStatus: paintMetrics.firstContentfulPaint < 1500 ? 'EXCELLENT' : paintMetrics.firstContentfulPaint < 2500 ? 'GOOD' : 'SLOW',
        timestamp: new Date().toISOString()
      });
      
      // Paint timing assertions
      if (paintMetrics.firstPaint > 0) {
        expect(paintMetrics.firstPaint).to.be.lessThan(2000); // First paint under 2s
      }
      if (paintMetrics.firstContentfulPaint > 0) {
        expect(paintMetrics.firstContentfulPaint).to.be.lessThan(2500); // FCP under 2.5s
      }
    });
  });
}); 