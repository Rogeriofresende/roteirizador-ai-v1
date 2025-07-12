/**
 * Hook for manually triggering error boundary (for testing)
 */
export function useErrorHandler() {
  return (error: Error, errorInfo?: { componentStack?: string }) => {
    // This will be caught by the nearest error boundary
    throw error;
  };
} 