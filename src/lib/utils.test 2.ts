import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility', () => {
  it('should merge classes correctly', () => {
    expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white');
  });

  it('should handle conditional classes', () => {
    expect(cn('base', { conditional: true })).toBe('base conditional');
    expect(cn('base', { conditional: false })).toBe('base');
  });

  it('should override conflicting tailwind classes', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2');
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
  });

  it('should handle various types of inputs', () => {
    expect(cn('a', null, undefined, 'b', false, { c: true, d: false })).toBe('a b c');
  });
}); 