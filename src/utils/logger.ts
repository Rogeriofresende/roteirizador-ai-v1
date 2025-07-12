/**
 * Logger System V6.4
 * Sistema de logging melhorado para evitar false positives
 */
import { environment } from '../config/environment';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  source?: string;
}

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private logLevel: LogLevel = environment.logging.level as LogLevel;
  private consoleLogging = environment.logging.consoleLogging;

  private shouldLog(level: LogLevel): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.logLevel);
  }

  private createLogEntry(level: LogLevel, message: string, context?: Record<string, any>, source?: string): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      source
    };
  }

  private addToBuffer(entry: LogEntry): void {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  private formatMessage(level: LogLevel, message: string, context?: Record<string, any>): string {
    const timestamp = new Date().toLocaleTimeString();
    const emoji = {
      debug: '🔍',
      info: 'ℹ️',
      warn: '⚠️',
      error: '🚨'
    }[level];
    
    let formattedMessage = `${emoji} ${timestamp} [${level.toUpperCase()}] ${message}`;
    
    if (context) {
      formattedMessage += `\n📋 Context: ${JSON.stringify(context, null, 2)}`;
    }
    
    return formattedMessage;
  }

  debug(message: string, context?: Record<string, any>, source?: string): void {
    if (!this.shouldLog('debug')) return;
    
    const entry = this.createLogEntry('debug', message, context, source);
    this.addToBuffer(entry);
    
    if (this.consoleLogging && environment.isDevelopment) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  info(message: string, context?: Record<string, any>, source?: string): void {
    if (!this.shouldLog('info')) return;
    
    const entry = this.createLogEntry('info', message, context, source);
    this.addToBuffer(entry);
    
    if (this.consoleLogging) {
      console.info(this.formatMessage('info', message, context));
    }
  }

  warn(message: string, context?: Record<string, any>, source?: string): void {
    if (!this.shouldLog('warn')) return;
    
    const entry = this.createLogEntry('warn', message, context, source);
    this.addToBuffer(entry);
    
    if (this.consoleLogging) {
      console.warn(this.formatMessage('warn', message, context));
    }
  }

  error(message: string, context?: Record<string, any>, source?: string): void {
    if (!this.shouldLog('error')) return;
    
    const entry = this.createLogEntry('error', message, context, source);
    this.addToBuffer(entry);
    
    if (this.consoleLogging) {
      console.error(this.formatMessage('error', message, context));
    }
  }

  // Métodos utilitários
  getLogs(level?: LogLevel): LogEntry[] {
    return level ? this.logs.filter(log => log.level === level) : this.logs;
  }

  clearLogs(): void {
    this.logs = [];
  }

  getLogStats(): { total: number; byLevel: Record<LogLevel, number> } {
    const byLevel = this.logs.reduce((acc, log) => {
      acc[log.level] = (acc[log.level] || 0) + 1;
      return acc;
    }, {} as Record<LogLevel, number>);

    return {
      total: this.logs.length,
      byLevel
    };
  }

  // Métodos específicos para diferentes componentes
  logAppInitialization(context: Record<string, any>): void {
    this.info('App initialization started', context, 'APP');
  }

  logServiceInitialization(serviceName: string, status: Record<string, any>): void {
    this.info(`${serviceName} initialization completed`, status, serviceName);
  }

  logUserAction(action: string, context: Record<string, any>): void {
    this.info(`User action: ${action}`, context, 'USER');
  }

  logApiCall(endpoint: string, method: string, status: number, duration?: number): void {
    const level = status >= 400 ? 'warn' : 'info';
    this.log(level, `API call: ${method} ${endpoint} - ${status}`, {
      endpoint,
      method,
      status,
      duration
    }, 'API');
  }

  logPerformance(metric: string, value: number, context?: Record<string, any>): void {
    if (environment.isDevelopment) {
      this.debug(`Performance metric: ${metric} = ${value}`, context, 'PERFORMANCE');
    }
  }

  // Método genérico de log
  log(level: LogLevel, message: string, context?: Record<string, any>, source?: string): void {
    switch (level) {
      case 'debug':
        this.debug(message, context, source);
        break;
      case 'info':
        this.info(message, context, source);
        break;
      case 'warn':
        this.warn(message, context, source);
        break;
      case 'error':
        this.error(message, context, source);
        break;
    }
  }
}

// Instância singleton
export const logger = new Logger();

// Funções de conveniência
export const logInfo = (message: string, context?: Record<string, any>, source?: string) => 
  logger.info(message, context, source);

export const logWarn = (message: string, context?: Record<string, any>, source?: string) => 
  logger.warn(message, context, source);

export const logError = (message: string, context?: Record<string, any>, source?: string) => 
  logger.error(message, context, source);

export const logDebug = (message: string, context?: Record<string, any>, source?: string) => 
  logger.debug(message, context, source);

// Função de compatibilidade para códigos existentes
export const createLogger = (source: string) => ({
  debug: (message: string, context?: Record<string, any>) => logger.debug(message, context, source),
  info: (message: string, context?: Record<string, any>) => logger.info(message, context, source),
  warn: (message: string, context?: Record<string, any>) => logger.warn(message, context, source),
  error: (message: string, context?: Record<string, any>) => logger.error(message, context, source),
  log: (level: LogLevel, message: string, context?: Record<string, any>) => logger.log(level, message, context, source)
});

export default logger; 