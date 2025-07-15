/**
 * 🧠 BANCO DE IDEIAS - ERROR BOUNDARY V8.0
 * Error boundary component for robust error handling
 * Following V8.0 Unified Development methodology
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Layout } from '../../../../design-system/components/Layout';
import { Button } from '../../../../design-system/components/Button';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

// ============================================================================
// ERROR BOUNDARY STATE
// ============================================================================

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

// ============================================================================
// ERROR BOUNDARY COMPONENT
// ============================================================================

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Generate unique error ID for tracking
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error for debugging
    console.error('🚨 Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Track error in analytics (if available)
    try {
      if (window.gtag) {
        window.gtag('event', 'exception', {
          description: error.toString(),
          fatal: false,
          custom_map: {
            error_boundary: 'BancoDeIdeias'
          }
        });
      }
    } catch (trackingError) {
      console.warn('Error tracking failed:', trackingError);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    });
  };

  handleReportError = () => {
    const { error, errorInfo, errorId } = this.state;
    
    // Create error report
    const errorReport = {
      errorId,
      message: error?.message || 'Unknown error',
      stack: error?.stack || 'No stack trace',
      componentStack: errorInfo?.componentStack || 'No component stack',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    // Copy to clipboard for easy reporting
    navigator.clipboard?.writeText(JSON.stringify(errorReport, null, 2))
      .then(() => {
        alert('Relatório de erro copiado para a área de transferência. Envie para o suporte técnico.');
      })
      .catch(() => {
        alert('Não foi possível copiar o relatório. Tire um screenshot desta tela.');
      });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback provided
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Default error UI
      return (
        <Layout.Card variant="outlined" padding="lg" className="border-red-200 bg-red-50">
          <div className="text-center space-y-6">
            {/* Error Icon */}
            <div className="flex justify-center">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            
            {/* Error Message */}
            <div className="space-y-2">
              <Layout.Heading level={3} className="text-red-800">
                Ops! Algo deu errado
              </Layout.Heading>
              <Layout.Text variant="body" color="muted" className="text-red-700">
                Ocorreu um erro inesperado neste componente. Tente recarregar ou volte à página inicial.
              </Layout.Text>
            </div>
            
            {/* Error Details (if enabled) */}
            {this.props.showDetails && this.state.error && (
              <Layout.Card variant="outlined" padding="md" className="bg-red-100 border-red-200">
                <Layout.Text variant="bodySmall" className="font-mono text-red-800 text-left">
                  <strong>Erro:</strong> {this.state.error.message}<br />
                  <strong>ID:</strong> {this.state.errorId}
                </Layout.Text>
              </Layout.Card>
            )}
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={this.handleRetry}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Tentar Novamente
              </Button>
              
              <Button
                onClick={() => window.location.href = '/'}
                variant="ghost"
                className="flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Voltar ao Início
              </Button>
              
              <Button
                onClick={this.handleReportError}
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-red-600 hover:text-red-700"
              >
                <Bug className="w-4 h-4" />
                Reportar Erro
              </Button>
            </div>
            
            {/* Help Text */}
            <Layout.Text variant="bodySmall" color="muted" className="text-red-600">
              Se o problema persistir, entre em contato com o suporte técnico com o ID do erro.
            </Layout.Text>
          </div>
        </Layout.Card>
      );
    }

    return this.props.children;
  }
}

// ============================================================================
// FUNCTIONAL ERROR FALLBACK
// ============================================================================

interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
  title?: string;
  message?: string;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
  title = "Erro no Componente",
  message = "Este componente encontrou um erro e não pode ser exibido."
}) => (
  <Layout.Card variant="outlined" padding="md" className="border-red-200 bg-red-50">
    <div className="text-center space-y-4">
      <AlertTriangle className="w-6 h-6 text-red-600 mx-auto" />
      
      <div className="space-y-1">
        <Layout.Heading level={4} className="text-red-800">
          {title}
        </Layout.Heading>
        <Layout.Text variant="bodySmall" className="text-red-700">
          {message}
        </Layout.Text>
      </div>
      
      {error && (
        <Layout.Text variant="bodySmall" className="font-mono text-red-600 bg-red-100 p-2 rounded">
          {error.message}
        </Layout.Text>
      )}
      
      {resetError && (
        <Button
          onClick={resetError}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Tentar Novamente
        </Button>
      )}
    </div>
  </Layout.Card>
);

// ============================================================================
// SIMPLE ERROR MESSAGE
// ============================================================================

interface SimpleErrorProps {
  message: string;
  onRetry?: () => void;
}

export const SimpleError: React.FC<SimpleErrorProps> = ({ message, onRetry }) => (
  <div className="flex items-center justify-center p-4 bg-red-50 border border-red-200 rounded-lg">
    <div className="flex items-center space-x-3">
      <AlertTriangle className="w-5 h-5 text-red-600" />
      <Layout.Text variant="body" className="text-red-800">
        {message}
      </Layout.Text>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="ghost"
          size="sm"
          className="text-red-600 hover:text-red-700"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      )}
    </div>
  </div>
);

// ============================================================================
// EXPORT
// ============================================================================

export default ErrorBoundary; 