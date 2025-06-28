import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  fallbackComponent?: ReactNode;
  resetKeys?: Array<string | number>;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class TestErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error for debugging
    console.group('🚨 Test Error Boundary Caught Error');
    console.error('Error:', error);
    console.error('Component Stack:', errorInfo.componentStack);
    console.groupEnd();
  }

  componentDidUpdate(prevProps: Props) {
    const { resetKeys } = this.props;
    const { hasError } = this.state;
    
    if (hasError && resetKeys !== prevProps.resetKeys) {
      if (resetKeys && prevProps.resetKeys) {
        const hasResetKeyChanged = resetKeys.some((key, idx) => key !== prevProps.resetKeys![idx]);
        if (hasResetKeyChanged) {
          this.resetErrorBoundary();
        }
      }
    }
  }

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
    
    this.resetTimeoutId = window.setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null
      });
    }, 100);
  };

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  render() {
    if (this.state.hasError) {
      // Return custom fallback component if provided
      if (this.props.fallbackComponent) {
        return this.props.fallbackComponent;
      }

      // Default fallback UI for tests
      return (
        <div data-testid="error-boundary" role="alert">
          <h2>🚨 Component Error Caught in Tests</h2>
          <p>Error: {this.state.error?.message}</p>
          <button 
            onClick={this.resetErrorBoundary}
            data-testid="reset-error-boundary"
          >
            Reset
          </button>
          <details style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }}>
            <summary>Error Details (Click to expand)</summary>
            {this.state.error && this.state.error.stack}
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

// Helper function for testing error boundaries
export const renderWithErrorBoundary = (
  component: ReactNode,
  options: {
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    fallbackComponent?: ReactNode;
    resetKeys?: Array<string | number>;
  } = {}
) => {
  return (
    <TestErrorBoundary {...options}>
      {component}
    </TestErrorBoundary>
  );
};

// Test helper for triggering errors
export const ErrorThrowingComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error triggered intentionally');
  }
  return <div data-testid="no-error">No error thrown</div>;
}; 