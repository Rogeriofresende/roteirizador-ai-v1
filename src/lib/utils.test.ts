/**
 * 🧪 BASIC JEST TEST
 * Teste básico para validar se Jest está funcionando
 */

import { cn } from './utils';

describe('Utils - Jest Test Validation', () => {
  it('should merge class names correctly', () => {
    const result = cn('base-class', 'additional-class');
    expect(result).toContain('base-class');
    expect(result).toContain('additional-class');
  });

  it('should handle conditional classes', () => {
    const isActive = true;
    const result = cn('base', isActive && 'active');
    expect(result).toContain('base');
    expect(result).toContain('active');
  });

  it('should work with basic JavaScript', () => {
    expect(2 + 2).toBe(4);
    expect('hello').toBe('hello');
    expect(true).toBeTruthy();
  });
}); 