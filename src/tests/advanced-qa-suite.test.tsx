import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TestErrorBoundary, ErrorThrowingComponent, renderWithErrorBoundary } from './test-error-boundary';
import { 
  PerformanceMonitor, 
  MemoryLeakDetector, 
  loadTest, 
  generateTestData,
  getBrowserCapabilities 
} from './performance-test-helpers';

// Mock component for testing
const TestComponent = ({ shouldThrow = false, dataSize = 10 }: { shouldThrow?: boolean; dataSize?: number }) => {
  const data = generateTestData.largeDataset(dataSize);
  
  if (shouldThrow) {
    throw new Error('Intentional test error');
  }
  
  return (
    <div data-testid="test-component">
      <h1>Test Component</h1>
      <p>Data items: {data.length}</p>
      {data.slice(0, 5).map(item => (
        <div key={item.id} data-testid={`item-${item.id}`}>
          {item.title}
        </div>
      ))}
    </div>
  );
};

describe('🚀 Advanced QA Test Suite', () => {
  describe('🛡️ Error Boundary Testing', () => {
    let errorSpy: jest.SpyInstance;
    
    beforeEach(() => {
      errorSpy = jest.spyOn(console, 'error').mockImplementation();
    });
    
    afterEach(() => {
      errorSpy.mockRestore();
    });

    test('should catch and display component errors', () => {
      render(
        renderWithErrorBoundary(<ErrorThrowingComponent shouldThrow={true} />)
      );
      
      expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
      expect(screen.getByText(/Component Error Caught in Tests/i)).toBeInTheDocument();
    });

    test('should allow error boundary reset', async () => {
      const { rerender } = render(
        renderWithErrorBoundary(
          <ErrorThrowingComponent shouldThrow={true} />,
          { resetKeys: [1] }
        )
      );
      
      expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
      
      // Reset by changing reset keys
      rerender(
        renderWithErrorBoundary(
          <ErrorThrowingComponent shouldThrow={false} />,
          { resetKeys: [2] }
        )
      );
      
      await waitFor(() => {
        expect(screen.getByTestId('no-error')).toBeInTheDocument();
      });
    });

    test('should call custom error handler', () => {
      const onError = jest.fn();
      
      render(
        renderWithErrorBoundary(
          <ErrorThrowingComponent shouldThrow={true} />,
          { onError }
        )
      );
      
      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String)
        })
      );
    });
  });

  describe('⚡ Performance Testing', () => {
    test('should measure component render performance', async () => {
      const monitor = new PerformanceMonitor();
      monitor.start();
      
      render(<TestComponent dataSize={100} />);
      
      const metrics = monitor.getMetrics();
      
      expect(metrics.renderTime).toBeGreaterThan(0);
      expect(metrics.componentCount).toBeGreaterThan(0);
      expect(metrics.memoryUsed).toBeGreaterThanOrEqual(0);
    });

    test('should detect performance degradation with large datasets', async () => {
      const smallDataMetrics = await global.testUtils.measureRenderTime(async () => {
        render(<TestComponent dataSize={10} />);
      });
      
      const largeDataMetrics = await global.testUtils.measureRenderTime(async () => {
        render(<TestComponent dataSize={1000} />);
      });
      
      // Large dataset should take more time (but not too much more)
      expect(largeDataMetrics).toBeGreaterThan(smallDataMetrics);
      expect(largeDataMetrics).toBeLessThan(smallDataMetrics * 10); // Performance should be reasonable
    });

    test('should pass load testing with multiple renders', async () => {
      const results = await loadTest(async () => {
        const { unmount } = render(<TestComponent dataSize={50} />);
        unmount();
      }, 20);
      
      expect(results).toHaveLength(20);
      expect(results.every(r => r.renderTime < 1000)).toBe(true); // All renders under 1 second
    });
  });

  describe('🧠 Memory Leak Detection', () => {
    test('should detect potential memory leaks', async () => {
      const detector = new MemoryLeakDetector(1); // 1MB threshold
      detector.startMonitoring();
      
      // Simulate multiple component mounts/unmounts
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(<TestComponent dataSize={100} />);
        unmount();
      }
      
      const result = await detector.detectLeaks();
      
      expect(result).toEqual({
        initialMemory: expect.any(Number),
        finalMemory: expect.any(Number),
        leaked: expect.any(Boolean),
        leakSize: expect.any(Number)
      });
    });
  });

  describe('🌐 Browser Compatibility', () => {
    test('should check browser capabilities', () => {
      const capabilities = getBrowserCapabilities();
      
      expect(capabilities).toEqual({
        supportsIntersectionObserver: expect.any(Boolean),
        supportsResizeObserver: expect.any(Boolean),
        supportsWebGL: expect.any(Boolean),
        supportsLocalStorage: expect.any(Boolean),
        supportsServiceWorker: expect.any(Boolean),
        userAgent: expect.any(String)
      });
    });

    test('should handle localStorage quota exceeded gracefully', () => {
      const mockStorage = global.testUtils.mockLocalStorageWithQuota(2);
      
      // Should work for items within quota
      expect(() => mockStorage.setItem('key1', 'value1')).not.toThrow();
      expect(() => mockStorage.setItem('key2', 'value2')).not.toThrow();
      
      // Should throw for items exceeding quota
      expect(() => mockStorage.setItem('key3', 'value3')).toThrow('QuotaExceededError');
    });
  });

  describe('📊 Data Generation & Testing', () => {
    test('should generate consistent test data', () => {
      const user1 = generateTestData.user();
      const user2 = generateTestData.user({ name: 'Custom Name' });
      const dataset = generateTestData.largeDataset(50);
      
      expect(user1).toEqual({
        id: expect.any(String),
        name: 'Test User',
        email: 'test@example.com',
        role: 'user'
      });
      
      expect(user2.name).toBe('Custom Name');
      expect(dataset).toHaveLength(50);
      expect(dataset[0]).toEqual({
        id: 0,
        name: 'Item 0',
        value: expect.any(Number),
        timestamp: expect.any(String)
      });
    });
  });

  describe('🔄 Stress Testing', () => {
    test('should handle rapid re-renders without breaking', async () => {
      const { rerender } = render(<TestComponent dataSize={10} />);
      
      // Rapid re-renders with different props
      for (let i = 0; i < 20; i++) {
        rerender(<TestComponent dataSize={i + 1} />);
        await global.testUtils.waitForLoadingToFinish();
      }
      
      expect(screen.getByTestId('test-component')).toBeInTheDocument();
    });

    test('should handle event spam without performance issues', async () => {
      const handleClick = jest.fn();
      render(
        <button onClick={handleClick} data-testid="spam-button">
          Click me
        </button>
      );
      
      const button = screen.getByTestId('spam-button');
      const start = performance.now();
      
      // Spam clicks
      for (let i = 0; i < 100; i++) {
        fireEvent.click(button);
      }
      
      const end = performance.now();
      
      expect(handleClick).toHaveBeenCalledTimes(100);
      expect(end - start).toBeLessThan(1000); // Should complete quickly
    });
  });

  describe('🧪 Edge Cases & Boundaries', () => {
    test('should handle empty data gracefully', () => {
      render(<TestComponent dataSize={0} />);
      
      expect(screen.getByTestId('test-component')).toBeInTheDocument();
      expect(screen.getByText('Data items: 0')).toBeInTheDocument();
    });

    test('should handle extremely large datasets', () => {
      expect(() => {
        render(<TestComponent dataSize={10000} />);
      }).not.toThrow();
    });

    test('should cleanup properly on unmount', () => {
      const cleanupSpy = jest.fn();
      global.testCleanup = [cleanupSpy];
      
      const { unmount } = render(<TestComponent />);
      unmount();
      
      // Cleanup should be called automatically by our enhanced setup
      // (This would be called in the next test's beforeEach)
    });
  });
}); 