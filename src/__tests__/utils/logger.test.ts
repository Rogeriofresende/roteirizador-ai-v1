import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { createLogger } from '../../utils/logger';

describe('Logger', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('cria logger com contexto correto', () => {
    const logger = createLogger('TestComponent');
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.error).toBe('function');
  });

  it('info log funciona corretamente', () => {
    const logger = createLogger('TestComponent');
    logger.info('Test message', { data: 'test' });
    
    // Logger deve funcionar sem quebrar
    expect(() => {
      logger.info('Test message');
    }).not.toThrow();
  });

  it('warn log funciona corretamente', () => {
    const logger = createLogger('TestComponent');
    
    expect(() => {
      logger.warn('Warning message', { warning: true });
    }).not.toThrow();
  });

  it('error log funciona corretamente', () => {
    const logger = createLogger('TestComponent');
    
    expect(() => {
      logger.error('Error message', { error: true });
    }).not.toThrow();
  });

  it('aceita contexto adicional', () => {
    const logger = createLogger('TestComponent');
    
    expect(() => {
      logger.info('Message with context', { 
        userId: 'test-user',
        action: 'test-action',
        timestamp: Date.now()
      });
    }).not.toThrow();
  });

  it('funciona sem contexto', () => {
    const logger = createLogger('TestComponent');
    
    expect(() => {
      logger.info('Simple message');
      logger.warn('Simple warning');
      logger.error('Simple error');
    }).not.toThrow();
  });

  it('lida com objetos complexos no contexto', () => {
    const logger = createLogger('TestComponent');
    
    expect(() => {
      logger.info('Complex context', {
        user: { id: 'test', name: 'Test User' },
        metadata: { version: '1.0', env: 'test' },
        array: [1, 2, 3],
        nested: { deep: { value: 'test' } }
      });
    }).not.toThrow();
  });

  it('funciona com diferentes componentes', () => {
    const logger1 = createLogger('Component1');
    const logger2 = createLogger('Component2');
    
    expect(() => {
      logger1.info('Message from component 1');
      logger2.info('Message from component 2');
    }).not.toThrow();
  });

  it('preserva performance em ambiente de produção', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    
    const logger = createLogger('PerfTest');
    const start = performance.now();
    
    for (let i = 0; i < 100; i++) {
      logger.info(`Message ${i}`, { iteration: i });
    }
    
    const end = performance.now();
    const duration = end - start;
    
    // Deve ser rápido mesmo com muitas chamadas
    expect(duration).toBeLessThan(1000); // 1 segundo
    
    process.env.NODE_ENV = originalEnv;
  });

  it('lida com valores null e undefined', () => {
    const logger = createLogger('NullTest');
    
    expect(() => {
      logger.info('Message with null', { value: null });
      logger.info('Message with undefined', { value: undefined });
      logger.info('Message with mixed', { 
        nullValue: null, 
        undefinedValue: undefined, 
        normalValue: 'test' 
      });
    }).not.toThrow();
  });
}); 