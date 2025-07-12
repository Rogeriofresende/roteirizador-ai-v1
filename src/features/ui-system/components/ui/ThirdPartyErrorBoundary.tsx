import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '../../utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  scriptName?: string;
}

interface State {
  hasError: boolean;
  errorInfo?: string;
}

/**
 * 🛡️ THIRD PARTY ERROR BOUNDARY
 * 
 * Boundary específico para isolar erros de scripts third-party
 * (Microsoft Clarity, Google Analytics, etc.) evitando que 
 * contaminem o console ou quebrem a aplicação principal.
 */
export class ThirdPartyErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Analisa se é erro conhecido de third-party
    const isThirdPartyError = 
      error.message?.includes('Cannot read properties of undefined') ||
      error.message?.includes('clarity') ||
      error.message?.includes('gtag') ||
      error.stack?.includes('clarity.ms') ||
      error.stack?.includes('google-analytics') ||
      error.stack?.includes('googleapis.com');

    if (isThirdPartyError) {
      logger.debug('Third-party script error caught and isolated', { 
        error: error.message,
        stack: error.stack?.substring(0, 200) + '...',
        type: 'third-party-isolated'
      });
      
      return { 
        hasError: true, 
        errorInfo: `Third-party script error: ${error.message}` 
      };
    }

    // Se não é third-party, re-throw para error boundary principal
    throw error;
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { scriptName = 'unknown' } = this.props;
    
    // Log detalhado para debugging
    logger.warn('Third-party error boundary activated', {
      scriptName,
      error: error.message,
      componentStack: errorInfo.componentStack?.substring(0, 300) + '...',
      errorBoundary: 'ThirdPartyErrorBoundary',
      action: 'error-isolated'
    });
  }

  render() {
    if (this.state.hasError) {
      // Silent failure para third-party components
      const { scriptName = 'Third-party script' } = this.props;
      
      logger.debug('Third-party component failed silently', {
        scriptName,
        fallbackUsed: 'silent',
        errorInfo: this.state.errorInfo
      });
      
      return null;
    }

    return this.props.children;
  }
}

/**
 * 🛡️ SCRIPT ERROR SUPPRESSOR
 * Moved to separate utility file to avoid Fast Refresh conflicts
 */

export default ThirdPartyErrorBoundary;
