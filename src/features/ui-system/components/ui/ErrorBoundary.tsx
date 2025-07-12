/**
 * 🛡️ ERROR BOUNDARY COMPONENT
 * Professional React Error Boundary with logging and recovery options
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '../../utils/logger';
import { config } from '../../config/environment';
import { Button } from './Button';
import { Card } from './Card';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showErrorDetails?: boolean;
  isolateErrors?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
  retryCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;
  private retryTimeout: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError } = this.props;
    const { errorId } = this.state;

    // Log error with structured data
    logger.error('React Error Boundary triggered', {
      errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      retryCount: this.state.retryCount,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getUserId(),
    }, 'ERROR_BOUNDARY');

    // Call custom error handler if provided
    if (onError) {
      try {
        onError(error, errorInfo);
      } catch (handlerError) {
        logger.error('Error in custom error handler', {
          originalError: error.message,
          handlerError: handlerError instanceof Error ? handlerError.message : 'Unknown',
        }, 'ERROR_BOUNDARY');
      }
    }

    // Update state with error info
    this.setState({
      errorInfo,
    });

    // Report to external error tracking (production only)
    if (config.environment === 'production') {
      this.reportToExternalService(error, errorInfo, errorId || 'unknown');
    }
  }

  private getUserId(): string | null {
    try {
      // Get user ID from auth context or localStorage
      return localStorage.getItem('userId') || 'anonymous';
    } catch {
      return 'unknown';
    }
  }

  private async reportToExternalService(error: Error, errorInfo: ErrorInfo, errorId: string) {
    try {
      // Here you would integrate with services like Sentry, LogRocket, etc.
      // For now, we'll just log it as a structured error
      logger.error('External error report', {
        service: 'external_error_tracking',
        errorId,
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name,
        },
        errorInfo: {
          componentStack: errorInfo.componentStack,
        },
        metadata: {
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent,
          environment: config.environment,
          version: config.version,
        },
      }, 'EXTERNAL_TRACKING');
    } catch (reportError) {
      logger.error('Failed to report to external service', {
        originalError: error.message,
        reportError: reportError instanceof Error ? reportError.message : 'Unknown',
      }, 'ERROR_BOUNDARY');
    }
  }

  private handleRetry = () => {
    const { retryCount } = this.state;
    
    if (retryCount >= this.maxRetries) {
      logger.warn('Max retry attempts reached', {
        retryCount,
        maxRetries: this.maxRetries,
        errorId: this.state.errorId,
      }, 'ERROR_BOUNDARY');
      return;
    }

    logger.info('Retrying after error', {
      retryCount: retryCount + 1,
      errorId: this.state.errorId,
    }, 'ERROR_BOUNDARY');

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: retryCount + 1,
    });

    // Clear any existing timeout
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }

    // Reset retry count after successful render (30 seconds)
    this.retryTimeout = setTimeout(() => {
      this.setState({ retryCount: 0 });
    }, 30000);
  };

  private handleReload = () => {
    logger.info('User triggered page reload', {
      errorId: this.state.errorId,
    }, 'ERROR_BOUNDARY');
    
    window.location.reload();
  };

  private handleGoHome = () => {
    logger.info('User navigated to home', {
      errorId: this.state.errorId,
    }, 'ERROR_BOUNDARY');
    
    window.location.href = '/';
  };

  private handleReportBug = () => {
    const { error, errorInfo, errorId } = this.state;
    
    const bugReport = {
      errorId,
      message: error?.message || 'Unknown error',
      stack: error?.stack || 'No stack trace',
      componentStack: errorInfo?.componentStack || 'No component stack',
      url: window.location.href,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    };

    // Copy to clipboard
    navigator.clipboard.writeText(JSON.stringify(bugReport, null, 2))
      .then(() => {
        logger.info('Bug report copied to clipboard', { errorId }, 'ERROR_BOUNDARY');
        alert('Relatório de erro copiado para a área de transferência. Cole em seu e-mail de suporte.');
      })
      .catch(() => {
        logger.warn('Failed to copy bug report', { errorId }, 'ERROR_BOUNDARY');
        console.log('Bug Report:', bugReport);
        alert('Não foi possível copiar. Verifique o console para detalhes do erro.');
      });
  };

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  render() {
    const { hasError, error, retryCount, errorId } = this.state;
    const { children, fallback, showErrorDetails = config.debugMode } = this.props;

    if (hasError) {
      // Custom fallback provided
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="w-full max-w-lg p-6 text-center">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="h-12 w-12 text-destructive" />
            </div>
            
            <h1 className="text-2xl font-bold mb-2 text-foreground">
              Oops! Algo deu errado
            </h1>
            
            <p className="text-muted-foreground mb-6">
              Encontramos um erro inesperado. Nossa equipe foi notificada automaticamente.
            </p>

            {showErrorDetails && error && (
              <div className="mb-6 p-4 bg-muted rounded-lg text-left">
                <h3 className="font-semibold mb-2 text-sm">Detalhes do Erro:</h3>
                <p className="text-xs text-muted-foreground mb-2">
                  ID: {errorId}
                </p>
                <p className="text-xs font-mono bg-background p-2 rounded border overflow-auto max-h-32">
                  {error.message}
                </p>
              </div>
            )}

            <div className="space-y-3">
              {retryCount < this.maxRetries && (
                <Button 
                  onClick={this.handleRetry} 
                  className="w-full"
                  variant="default"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Tentar Novamente ({this.maxRetries - retryCount} tentativas restantes)
                </Button>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button 
                  onClick={this.handleGoHome} 
                  variant="outline"
                  className="w-full"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Ir para Início
                </Button>

                <Button 
                  onClick={this.handleReload} 
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Recarregar Página
                </Button>
              </div>

              <Button 
                onClick={this.handleReportBug} 
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground"
              >
                <Bug className="w-4 h-4 mr-2" />
                Reportar Bug
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mt-6">
              Se o problema persistir, entre em contato com o suporte.
            </p>
          </Card>
        </div>
      );
    }

    return children;
  }
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Hook moved to separate file to avoid Fast Refresh conflicts

export default ErrorBoundary; 