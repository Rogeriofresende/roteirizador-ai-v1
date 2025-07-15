/**
 * 🛡️ SYSTEM ERROR BOUNDARY V8.0 - UX ENHANCEMENT
 * Error boundary inteligente integrado com monitoring consolidado
 * Auto-reporting e recovery baseado nos sistemas enterprise
 * Metodologia: V8.0 Consolidation Strategy
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Bug, ExternalLink } from 'lucide-react';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  enableRetry?: boolean;
  enableReporting?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
  retryCount: number;
  isReporting: boolean;
}

interface ErrorReport {
  id: string;
  timestamp: number;
  error: {
    message: string;
    stack?: string;
    name: string;
  };
  errorInfo: {
    componentStack: string;
  };
  context: {
    userAgent: string;
    url: string;
    userId?: string;
    systemHealth?: any;
    performance?: any;
  };
  systemState: {
    diInitialized: boolean;
    cacheMetrics: any;
    monitoringHealth: any;
  };
}

// =============================================================================
// ERROR BOUNDARY CLASS
// =============================================================================

export class SystemErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeout: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0,
      isReporting: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Auto-report error if enabled
    if (this.props.enableReporting !== false) {
      this.reportError(error, errorInfo);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Caught Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.groupEnd();
    }
  }

  // =============================================================================
  // ERROR REPORTING
  // =============================================================================

  private reportError = async (error: Error, errorInfo: ErrorInfo) => {
    if (this.state.isReporting) return;
    
    this.setState({ isReporting: true });

    try {
      const errorReport: ErrorReport = {
        id: this.state.errorId!,
        timestamp: Date.now(),
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name
        },
        errorInfo: {
          componentStack: errorInfo.componentStack
        },
        context: {
          userAgent: navigator.userAgent,
          url: window.location.href,
          // userId would come from auth context
        },
        systemState: await this.collectSystemState()
      };

      // In a real app, this would send to your error reporting service
      console.warn('Error Report Generated:', errorReport);
      
      // Store locally for debugging
      const existingReports = JSON.parse(
        localStorage.getItem('error-reports') || '[]'
      );
      existingReports.push(errorReport);
      
      // Keep only last 10 reports
      if (existingReports.length > 10) {
        existingReports.splice(0, existingReports.length - 10);
      }
      
      localStorage.setItem('error-reports', JSON.stringify(existingReports));

      // Send to monitoring system if available
      if (window.dataLayer) {
        window.dataLayer.push({
          event: 'error_boundary_triggered',
          error_id: errorReport.id,
          error_message: error.message,
          component_stack: errorInfo.componentStack
        });
      }

    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    } finally {
      this.setState({ isReporting: false });
    }
  };

  private collectSystemState = async (): Promise<ErrorReport['systemState']> => {
    try {
      // In a real implementation, this would access the consolidated systems
      // For now, we'll simulate the data structure
      return {
        diInitialized: true, // Would come from useDI()
        cacheMetrics: {
          hitRate: 0,
          memoryUsage: 0,
          entriesCount: 0
        }, // Would come from useCache()
        monitoringHealth: {
          status: 'unknown',
          score: 0
        } // Would come from useMonitoring()
      };
    } catch (error) {
      console.error('Failed to collect system state:', error);
      return {
        diInitialized: false,
        cacheMetrics: null,
        monitoringHealth: null
      };
    }
  };

  // =============================================================================
  // ERROR RECOVERY
  // =============================================================================

  private handleRetry = () => {
    if (this.state.retryCount >= 3) {
      console.warn('Maximum retry attempts reached');
      return;
    }

    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: prevState.retryCount + 1,
      isReporting: false
    }));

    // Add small delay to prevent immediate re-error
    this.retryTimeout = setTimeout(() => {
      // Force a re-render
      this.forceUpdate();
    }, 100);
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleReportBug = () => {
    const errorReport = {
      error: this.state.error?.message,
      stack: this.state.error?.stack,
      component: this.state.errorInfo?.componentStack,
      url: window.location.href,
      timestamp: new Date().toISOString()
    };

    const bugReportUrl = `mailto:support@example.com?subject=Bug Report&body=${encodeURIComponent(
      `Error Details:\n${JSON.stringify(errorReport, null, 2)}`
    )}`;

    window.open(bugReportUrl);
  };

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  // =============================================================================
  // RENDER
  // =============================================================================

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border border-red-200 rounded-lg shadow-lg p-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Something went wrong
                </h2>
                <p className="text-sm text-gray-600">
                  An unexpected error occurred
                </p>
              </div>
            </div>

            {/* Error Details */}
            {this.props.showDetails && this.state.error && (
              <div className="mb-4 p-3 bg-gray-50 rounded border">
                <details className="text-sm">
                  <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                    Error Details
                  </summary>
                  <div className="space-y-2 text-gray-600">
                    <div>
                      <strong>Message:</strong> {this.state.error.message}
                    </div>
                    {this.state.errorId && (
                      <div>
                        <strong>Error ID:</strong> {this.state.errorId}
                      </div>
                    )}
                    {this.state.error.stack && (
                      <div>
                        <strong>Stack:</strong>
                        <pre className="mt-1 text-xs bg-white p-2 rounded border overflow-x-auto">
                          {this.state.error.stack.slice(0, 500)}
                          {this.state.error.stack.length > 500 && '...'}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              {/* Primary Actions */}
              <div className="flex gap-2">
                {this.props.enableRetry !== false && this.state.retryCount < 3 && (
                  <button
                    onClick={this.handleRetry}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                  </button>
                )}
                
                <button
                  onClick={this.handleReload}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reload Page
                </button>
              </div>

              {/* Secondary Actions */}
              <div className="flex gap-2 text-sm">
                <button
                  onClick={this.handleReportBug}
                  className="flex items-center gap-1 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <Bug className="w-4 h-4" />
                  Report Bug
                </button>
                
                <button
                  onClick={() => window.open('/help', '_blank')}
                  className="flex items-center gap-1 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Get Help
                </button>
              </div>
            </div>

            {/* Retry Count Indicator */}
            {this.state.retryCount > 0 && (
              <div className="mt-4 text-xs text-gray-500 text-center">
                Retry attempt: {this.state.retryCount}/3
              </div>
            )}

            {/* Reporting Status */}
            {this.state.isReporting && (
              <div className="mt-4 text-xs text-blue-600 text-center">
                Reporting error...
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// =============================================================================
// FUNCTIONAL WRAPPER WITH HOOKS
// =============================================================================

interface SystemErrorBoundaryWithHooksProps extends Omit<ErrorBoundaryProps, 'onError'> {
  children: ReactNode;
}

export const SystemErrorBoundaryWithHooks: React.FC<SystemErrorBoundaryWithHooksProps> = (props) => {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    // Here you could use the monitoring hooks to report the error
    // const monitoring = useMonitoring();
    // monitoring.createAlert('error', 'high', 'Component Error', error.message);
    
    console.error('Error caught by SystemErrorBoundary:', error, errorInfo);
  };

  return (
    <SystemErrorBoundary {...props} onError={handleError} />
  );
};

// =============================================================================
// HOC FOR COMPONENT WRAPPING
// =============================================================================

export function withSystemErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<ErrorBoundaryProps>
) {
  const WrappedComponent = (props: P) => (
    <SystemErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </SystemErrorBoundary>
  );

  WrappedComponent.displayName = `withSystemErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export const getStoredErrorReports = (): ErrorReport[] => {
  try {
    return JSON.parse(localStorage.getItem('error-reports') || '[]');
  } catch (error) {
    console.error('Failed to retrieve error reports:', error);
    return [];
  }
};

export const clearStoredErrorReports = (): void => {
  localStorage.removeItem('error-reports');
};

// =============================================================================
// EXPORTS
// =============================================================================

export default SystemErrorBoundary; 