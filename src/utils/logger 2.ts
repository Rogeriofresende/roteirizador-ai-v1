/**
 * 📝 STRUCTURED LOGGER
 * Sistema de logging profissional com níveis e contexto
 */

import { config, isDevelopment, isProduction } from '../config/environment';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  [key: string]: any;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: LogContext;
  timestamp: string;
  environment: string;
  source?: string;
}

class Logger {
  private readonly isDev = isDevelopment();
  private readonly isProd = isProduction();
  private readonly logLevel = config.logLevel;

  /**
   * Determina se o log deve ser processado baseado no nível
   */
  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };

    return levels[level] >= levels[this.logLevel];
  }

  /**
   * Formata entrada de log
   */
  private formatLog(level: LogLevel, message: string, context?: LogContext, source?: string): LogEntry {
    return {
      level,
      message,
      context,
      timestamp: new Date().toISOString(),
      environment: config.environment,
      source,
    };
  }

  /**
   * Processa e emite log
   */
  private emit(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) return;

    const logMessage = this.isDev 
      ? this.formatDevLog(entry)
      : this.formatProdLog(entry);

    // Emitir para console apropriado
    switch (entry.level) {
      case 'debug':
        console.debug(logMessage);
        break;
      case 'info':
        console.info(logMessage);
        break;
      case 'warn':
        console.warn(logMessage);
        break;
      case 'error':
        console.error(logMessage);
        break;
    }

    // Em produção, podemos enviar para serviço de logging
    if (this.isProd && entry.level === 'error') {
      this.sendToExternalLogger(entry);
    }
  }

  /**
   * Formatação para desenvolvimento (legível)
   */
  private formatDevLog(entry: LogEntry): string {
    const emoji = {
      debug: '🔍',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
    }[entry.level];

    const timestamp = new Date(entry.timestamp).toLocaleTimeString();
    const source = entry.source ? `[${entry.source}]` : '';
    
    let message = `${emoji} ${timestamp} ${source} ${entry.message}`;
    
    if (entry.context && Object.keys(entry.context).length > 0) {
      message += `\n📋 Context: ${JSON.stringify(entry.context, null, 2)}`;
    }
    
    return message;
  }

  /**
   * Formatação para produção (JSON estruturado)
   */
  private formatProdLog(entry: LogEntry): string {
    return JSON.stringify(entry);
  }

  /**
   * Enviar para serviço externo de logging (produção)
   */
  private async sendToExternalLogger(entry: LogEntry): Promise<void> {
    // Implementar integração com serviços como Sentry, LogRocket, etc.
    // Por enquanto, apenas console.error
    try {
      // Aqui iria a integração real
      console.error('External Logger:', entry);
    } catch (error) {
      console.error('Failed to send log to external service:', error);
    }
  }

  /**
   * Log de debug
   */
  debug(message: string, context?: LogContext, source?: string): void {
    const entry = this.formatLog('debug', message, context, source);
    this.emit(entry);
  }

  /**
   * Log informativo
   */
  info(message: string, context?: LogContext, source?: string): void {
    const entry = this.formatLog('info', message, context, source);
    this.emit(entry);
  }

  /**
   * Log de warning
   */
  warn(message: string, context?: LogContext, source?: string): void {
    const entry = this.formatLog('warn', message, context, source);
    this.emit(entry);
  }

  /**
   * Log de erro
   */
  error(message: string, context?: LogContext, source?: string): void {
    const entry = this.formatLog('error', message, context, source);
    this.emit(entry);
  }

  /**
   * Log de performance
   */
  performance(operation: string, duration: number, context?: LogContext): void {
    this.info(`Performance: ${operation}`, {
      ...context,
      duration: `${duration}ms`,
      threshold: duration > 1000 ? 'SLOW' : 'OK',
    }, 'PERFORMANCE');
  }

  /**
   * Log de user action
   */
  userAction(action: string, context?: LogContext): void {
    this.info(`User Action: ${action}`, context, 'USER');
  }

  /**
   * Log de API call
   */
  apiCall(method: string, url: string, status: number, duration: number, context?: LogContext): void {
    const level = status >= 400 ? 'error' : status >= 300 ? 'warn' : 'info';
    
    this[level](`API Call: ${method} ${url}`, {
      ...context,
      status,
      duration: `${duration}ms`,
    }, 'API');
  }

  /**
   * Log de security event
   */
  security(event: string, context?: LogContext): void {
    this.warn(`Security Event: ${event}`, context, 'SECURITY');
  }

  /**
   * Criar logger com source fixo
   */
  createSourceLogger(source: string) {
    return {
      debug: (message: string, context?: LogContext) => this.debug(message, context, source),
      info: (message: string, context?: LogContext) => this.info(message, context, source),
      warn: (message: string, context?: LogContext) => this.warn(message, context, source),
      error: (message: string, context?: LogContext) => this.error(message, context, source),
      performance: (operation: string, duration: number, context?: LogContext) => 
        this.performance(operation, duration, context),
      userAction: (action: string, context?: LogContext) => this.userAction(action, context),
      apiCall: (method: string, url: string, status: number, duration: number, context?: LogContext) =>
        this.apiCall(method, url, status, duration, context),
      security: (event: string, context?: LogContext) => this.security(event, context),
    };
  }
}

// Singleton logger instance
export const logger = new Logger();

// Factory function para compatibilidade
export const createLogger = (source: string) => logger.createSourceLogger(source);

// Convenience exports para uso direto
export const { debug, info, warn, error, performance, userAction, apiCall, security } = logger;

export default logger; 