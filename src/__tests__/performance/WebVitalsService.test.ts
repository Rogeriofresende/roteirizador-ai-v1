import { WebVitalsService } from '../../services/monitoring/WebVitalsService';

// Mock Web Vitals
jest.mock('web-vitals', () => ({
  getCLS: jest.fn(),
  getFCP: jest.fn(),
  getFID: jest.fn(),
  getLCP: jest.fn(),
  getTTFB: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

// Mock PerformanceObserver
global.PerformanceObserver = jest.fn().mockImplementation((callback) => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;

describe('WebVitalsService', () => {
  let service: WebVitalsService;
  
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('{}');
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);
  });

  afterEach(() => {
    service?.destroy();
  });

  describe('Initialization', () => {
    it('should initialize with default options', () => {
      service = new WebVitalsService();
      expect(service).toBeDefined();
      expect(service.getMetrics()).toEqual([]);
    });

    it('should initialize with custom options', () => {
      const options = {
        reportingEndpoint: '/custom/endpoint',
        userId: 'test-user',
        reportingInterval: 60000,
      };
      
      service = new WebVitalsService(options);
      expect(service).toBeDefined();
    });

    it('should generate unique session ID', () => {
      const service1 = new WebVitalsService();
      const service2 = new WebVitalsService();
      
      const report1 = service1.generatePerformanceReport();
      const report2 = service2.generatePerformanceReport();
      
      expect(report1.sessionId).not.toBe(report2.sessionId);
      
      service1.destroy();
      service2.destroy();
    });
  });

  describe('Metric Handling', () => {
    beforeEach(() => {
      service = new WebVitalsService({
        reportingEndpoint: '/test/endpoint',
        userId: 'test-user',
      });
    });

    it('should handle LCP metric correctly', () => {
      const mockMetric = {
        name: 'LCP',
        value: 2000,
        delta: 100,
        id: 'test-lcp-id',
      };

      // Simulate metric callback
      service['handleMetric'](mockMetric);

      const metrics = service.getMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0]).toMatchObject({
        name: 'LCP',
        value: 2000,
        rating: 'good',
        delta: 100,
        id: 'test-lcp-id',
      });
    });

    it('should rate metrics correctly', () => {
      const testCases = [
        { name: 'LCP', value: 2000, expectedRating: 'good' },
        { name: 'LCP', value: 3000, expectedRating: 'needs-improvement' },
        { name: 'LCP', value: 5000, expectedRating: 'poor' },
        { name: 'FID', value: 50, expectedRating: 'good' },
        { name: 'FID', value: 200, expectedRating: 'needs-improvement' },
        { name: 'FID', value: 400, expectedRating: 'poor' },
        { name: 'CLS', value: 0.05, expectedRating: 'good' },
        { name: 'CLS', value: 0.15, expectedRating: 'needs-improvement' },
        { name: 'CLS', value: 0.3, expectedRating: 'poor' },
      ];

      testCases.forEach(({ name, value, expectedRating }) => {
        const rating = service['getRating'](name, value);
        expect(rating).toBe(expectedRating);
      });
    });
  });

  describe('Performance Report Generation', () => {
    beforeEach(() => {
      service = new WebVitalsService({ userId: 'test-user' });
    });

    it('should generate performance report', () => {
      const report = service.generatePerformanceReport();
      
      expect(report).toMatchObject({
        timestamp: expect.any(Number),
        url: expect.any(String),
        sessionId: expect.any(String),
        userId: 'test-user',
        metrics: expect.any(Array),
        resourceLoadTimes: expect.any(Array),
      });
    });

    it('should include navigation metrics in report', () => {
      const navigationMetrics = {
        totalTime: 1000,
        domContentLoadedTime: 500,
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(navigationMetrics));
      
      const report = service.generatePerformanceReport();
      
      expect(report.pageLoadTime).toBe(1000);
      expect(report.domContentLoadedTime).toBe(500);
    });

    it('should include resource metrics in report', () => {
      const resourceMetrics = [
        { name: 'script.js', duration: 100, size: 1000, type: 'script', cached: false },
        { name: 'style.css', duration: 50, size: 500, type: 'stylesheet', cached: true },
      ];
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(resourceMetrics));
      
      const report = service.generatePerformanceReport();
      
      expect(report.resourceLoadTimes).toEqual(resourceMetrics);
    });
  });

  describe('Analytics Integration', () => {
    beforeEach(() => {
      service = new WebVitalsService({
        reportingEndpoint: '/analytics/endpoint',
        userId: 'test-user',
      });
    });

    it('should send metrics to custom endpoint', async () => {
      const mockMetric = {
        name: 'LCP',
        value: 2000,
        delta: 100,
        id: 'test-lcp-id',
      };

      service['handleMetric'](mockMetric);

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(fetch).toHaveBeenCalledWith('/analytics/endpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('"type":"web-vital"'),
      });
    });

    it('should handle network errors gracefully', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValue(new Error('Network error'));

      const mockMetric = {
        name: 'LCP',
        value: 2000,
        delta: 100,
        id: 'test-lcp-id',
      };

      // Should not throw
      expect(() => service['handleMetric'](mockMetric)).not.toThrow();
    });
  });

  describe('Resource Type Detection', () => {
    beforeEach(() => {
      service = new WebVitalsService();
    });

    it('should detect resource types correctly', () => {
      const testCases = [
        { url: 'https://example.com/script.js', expected: 'script' },
        { url: 'https://example.com/style.css', expected: 'stylesheet' },
        { url: 'https://example.com/image.png', expected: 'image' },
        { url: 'https://example.com/font.woff2', expected: 'font' },
        { url: 'https://example.com/api/data', expected: 'api' },
        { url: 'https://example.com/unknown', expected: 'other' },
      ];

      testCases.forEach(({ url, expected }) => {
        const type = service['getResourceType'](url);
        expect(type).toBe(expected);
      });
    });
  });

  describe('Cache Management', () => {
    beforeEach(() => {
      service = new WebVitalsService();
    });

    it('should store navigation metrics', () => {
      const metrics = { totalTime: 1000, domContentLoadedTime: 500 };
      service['storeNavigationMetrics'](metrics);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'navigation_metrics',
        JSON.stringify(metrics)
      );
    });

    it('should store resource metrics', () => {
      const resourceMetric = {
        name: 'script.js',
        duration: 100,
        size: 1000,
        type: 'script',
        cached: false,
      };
      
      service['storeResourceMetrics'](resourceMetric);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'resource_metrics',
        JSON.stringify([resourceMetric])
      );
    });

    it('should append to existing resource metrics', () => {
      const existingMetrics = [
        { name: 'existing.js', duration: 50, size: 500, type: 'script', cached: true },
      ];
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingMetrics));
      
      const newMetric = {
        name: 'new.js',
        duration: 100,
        size: 1000,
        type: 'script',
        cached: false,
      };
      
      service['storeResourceMetrics'](newMetric);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'resource_metrics',
        JSON.stringify([...existingMetrics, newMetric])
      );
    });
  });

  describe('Cleanup', () => {
    beforeEach(() => {
      service = new WebVitalsService();
    });

    it('should clear metrics', () => {
      service.clearMetrics();
      
      expect(service.getMetrics()).toEqual([]);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('navigation_metrics');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('resource_metrics');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('paint_metrics');
    });

    it('should disconnect performance observer on destroy', () => {
      const mockDisconnect = jest.fn();
      service['performanceObserver'] = { disconnect: mockDisconnect } as any;
      
      service.destroy();
      
      expect(mockDisconnect).toHaveBeenCalled();
    });
  });
});

// Integration test with real Web Vitals
describe('WebVitalsService Integration', () => {
  let service: WebVitalsService;
  
  beforeEach(() => {
    service = new WebVitalsService({
      reportingEndpoint: '/test/endpoint',
      userId: 'integration-test-user',
    });
  });

  afterEach(() => {
    service?.destroy();
  });

  it('should integrate with web-vitals library', () => {
    const { getCLS, getFCP, getFID, getLCP, getTTFB } = require('web-vitals');
    
    expect(getCLS).toHaveBeenCalledWith(expect.any(Function));
    expect(getFCP).toHaveBeenCalledWith(expect.any(Function));
    expect(getFID).toHaveBeenCalledWith(expect.any(Function));
    expect(getLCP).toHaveBeenCalledWith(expect.any(Function));
    expect(getTTFB).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should handle real metric callbacks', () => {
    const { getCLS } = require('web-vitals');
    const callback = getCLS.mock.calls[0][0];
    
    const realMetric = {
      name: 'CLS',
      value: 0.1,
      delta: 0.05,
      id: 'real-cls-id',
    };
    
    callback(realMetric);
    
    const metrics = service.getMetrics();
    expect(metrics).toContainEqual(
      expect.objectContaining({
        name: 'CLS',
        value: 0.1,
        rating: 'good',
      })
    );
  });
}); 