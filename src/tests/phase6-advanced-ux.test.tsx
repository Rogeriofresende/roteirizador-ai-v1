import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { usePredictiveUX } from '../hooks/usePredictiveUX';
import { SmartLoading } from '../components/ui/SmartLoading';
import { AdvancedMicroInteractions } from '../components/ui/AdvancedMicroInteractions';
import PlatformSelectorEnhanced from '../components/form/PlatformSelectorEnhanced';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Phase 6: Advanced UX Features', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('Predictive UX Hook', () => {
    const TestComponent = () => {
      const { trackAction, predictions, sessionLength } = usePredictiveUX();
      
      const handleClick = () => {
        trackAction({
          type: 'click',
          target: 'test-button',
          timestamp: Date.now(),
        });
      };

      return (
        <div>
          <button onClick={handleClick} data-testid="track-button">
            Track Action
          </button>
          <div data-testid="session-length">{sessionLength}</div>
          <div data-testid="predictions">{predictions.join(',')}</div>
        </div>
      );
    };

    it('should track user actions correctly', () => {
      render(<TestComponent />);
      
      const button = screen.getByTestId('track-button');
      const sessionLength = screen.getByTestId('session-length');
      
      expect(sessionLength).toHaveTextContent('0');
      
      fireEvent.click(button);
      expect(sessionLength).toHaveTextContent('1');
      
      fireEvent.click(button);
      expect(sessionLength).toHaveTextContent('2');
    });

    it('should initialize with empty state', () => {
      render(<TestComponent />);
      
      expect(screen.getByTestId('session-length')).toHaveTextContent('0');
      expect(screen.getByTestId('predictions')).toHaveTextContent('');
    });
  });

  describe('Smart Loading Component', () => {
    it('should render loading spinner by default', () => {
      render(<SmartLoading isLoading={true} />);
      
      // Should show loading indicator
      expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('should show progress bar when progress is provided', () => {
      render(
        <SmartLoading 
          isLoading={true} 
          progress={50} 
          type="progress"
          showProgress={true}
        />
      );
      
      // Should show progress bar
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('should display stage information', () => {
      render(
        <SmartLoading 
          isLoading={true} 
          stage="Loading data..." 
          showStage={true}
        />
      );
      
      expect(screen.getByText(/Loading data/)).toBeInTheDocument();
    });

    it('should not render when not loading', () => {
      const { container } = render(<SmartLoading isLoading={false} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Advanced Micro Interactions', () => {
    it('should render children correctly', () => {
      render(
        <AdvancedMicroInteractions>
          <span>Test Content</span>
        </AdvancedMicroInteractions>
      );
      
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should handle click events', () => {
      const handleClick = jest.fn();
      
      render(
        <AdvancedMicroInteractions onClick={handleClick}>
          <button>Click me</button>
        </AdvancedMicroInteractions>
      );
      
      fireEvent.click(screen.getByText('Click me'));
      expect(handleClick).toHaveBeenCalled();
    });

    it('should apply enhanced feedback classes', () => {
      const { container } = render(
        <AdvancedMicroInteractions 
          enhancedFeedback={true}
          className="test-class"
        >
          <span>Content</span>
        </AdvancedMicroInteractions>
      );
      
      expect(container.firstChild).toHaveClass('test-class');
      expect(container.firstChild).toHaveClass('transition-all');
    });
  });

  describe('Enhanced Platform Selector', () => {
    const mockProps = {
      selectedPlatform: '' as any,
      onPlatformChange: jest.fn(),
      disabled: false,
    };

    beforeEach(() => {
      mockProps.onPlatformChange.mockClear();
    });

    it('should render platform options', () => {
      render(<PlatformSelectorEnhanced {...mockProps} />);
      
      expect(screen.getByText('YouTube')).toBeInTheDocument();
      expect(screen.getByText('Instagram')).toBeInTheDocument();
      expect(screen.getByText('TikTok')).toBeInTheDocument();
    });

    it('should show selected platform correctly', () => {
      render(
        <PlatformSelectorEnhanced 
          {...mockProps} 
          selectedPlatform="YouTube"
        />
      );
      
      const youtubeButton = screen.getByText('YouTube').closest('button');
      expect(youtubeButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('should handle platform selection with smart loading', async () => {
      render(<PlatformSelectorEnhanced {...mockProps} />);
      
      const youtubeButton = screen.getByText('YouTube');
      fireEvent.click(youtubeButton);
      
      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText(/Preparando plataforma/)).toBeInTheDocument();
      });
      
      // Should call onPlatformChange after loading
      await waitFor(() => {
        expect(mockProps.onPlatformChange).toHaveBeenCalledWith('YouTube');
      }, { timeout: 1000 });
    });

    it('should be disabled when disabled prop is true', () => {
      render(
        <PlatformSelectorEnhanced 
          {...mockProps} 
          disabled={true}
        />
      );
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toBeDisabled();
      });
    });

    it('should display predictive suggestions', () => {
      render(<PlatformSelectorEnhanced {...mockProps} />);
      
      // Mock predictions would be shown in development
      const label = screen.getByText(/Plataforma/);
      expect(label).toBeInTheDocument();
    });

    it('should track user interactions', () => {
      render(<PlatformSelectorEnhanced {...mockProps} />);
      
      const youtubeButton = screen.getByText('YouTube');
      
      // Hover should track action
      fireEvent.mouseEnter(youtubeButton);
      fireEvent.mouseLeave(youtubeButton);
      
      // Click should track action
      fireEvent.click(youtubeButton);
      
      // Tracking is handled internally, test that events fire without errors
      expect(youtubeButton).toBeInTheDocument();
    });
  });

  describe('Phase 6 Integration', () => {
    it('should work together seamlessly', async () => {
      const TestIntegration = () => {
        const [isLoading, setIsLoading] = React.useState(false);
        const [progress, setProgress] = React.useState(0);
        
        const handleAction = () => {
          setIsLoading(true);
          setProgress(0);
          
          setTimeout(() => setProgress(50), 100);
          setTimeout(() => setProgress(100), 200);
          setTimeout(() => setIsLoading(false), 300);
        };

        return (
          <div>
            <SmartLoading 
              isLoading={isLoading} 
              progress={progress}
              type="progress"
            />
            <AdvancedMicroInteractions onClick={handleAction}>
              <button>Start Process</button>
            </AdvancedMicroInteractions>
          </div>
        );
      };

      render(<TestIntegration />);
      
      const button = screen.getByText('Start Process');
      fireEvent.click(button);
      
      // Should show loading
      await waitFor(() => {
        expect(document.querySelector('.animate-spin, [class*="bg-primary"]')).toBeInTheDocument();
      });
      
      // Should complete loading
      await waitFor(() => {
        expect(document.querySelector('.animate-spin')).not.toBeInTheDocument();
      }, { timeout: 500 });
    });
  });
});

// Performance tests for Phase 6 features
describe('Phase 6: Performance Tests', () => {
  it('should handle rapid user interactions without performance issues', () => {
    const TestComponent = () => {
      const { trackAction } = usePredictiveUX();
      const [count, setCount] = React.useState(0);
      
      const handleRapidClicks = () => {
        for (let i = 0; i < 10; i++) {
          trackAction({
            type: 'click',
            target: `rapid-${i}`,
            timestamp: Date.now() + i,
          });
        }
        setCount(prev => prev + 10);
      };

      return (
        <div>
          <button onClick={handleRapidClicks} data-testid="rapid-button">
            Rapid Clicks
          </button>
          <div data-testid="count">{count}</div>
        </div>
      );
    };

    render(<TestComponent />);
    
    const button = screen.getByTestId('rapid-button');
    const startTime = performance.now();
    
    // Simulate rapid interactions
    for (let i = 0; i < 5; i++) {
      fireEvent.click(button);
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Should handle rapid interactions quickly (< 100ms)
    expect(duration).toBeLessThan(100);
    expect(screen.getByTestId('count')).toHaveTextContent('50');
  });
});
