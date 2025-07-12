import { logger } from './logger';

/**
 * 🛡️ SCRIPT ERROR SUPPRESSOR
 * Suprime erros de scripts third-party para evitar poluição do console
 */
export const suppressThirdPartyErrors = (): (() => void) => {
  const originalError = window.onerror;

  window.onerror = (message, source, lineno, colno, error) => {
    const errorStr = String(message);
    const sourceStr = String(source || '');

    const thirdPartyPatterns = [
      'clarity.ms',
      'Cannot read properties of undefined',
      's05cslzjy5'
    ];

    const isThirdPartyError = thirdPartyPatterns.some(pattern =>
      errorStr.includes(pattern) || sourceStr.includes(pattern)
    );

    if (isThirdPartyError) {
      logger.debug('Global third-party error suppressed', {
        message: errorStr.substring(0, 100) + '...',
        source: sourceStr.substring(0, 100) + '...',
        status: 'suppressed-global'
      });
      
      return true; // Prevent error from showing in console
    }

    return originalError 
      ? originalError(message, source, lineno, colno, error) 
      : false;
  };

  return () => {
    window.onerror = originalError;
    logger.debug('Third-party error suppression cleaned up');
  };
}; 