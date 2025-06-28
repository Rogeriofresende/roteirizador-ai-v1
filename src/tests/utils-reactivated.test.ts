import { cn } from '../lib/utils';

describe('Utils - Reactivated Test', () => {
  it('merges class names correctly', () => {
    const result = cn('class1', 'class2');
    expect(result).toBe('class1 class2');
  });
  
  it('handles undefined values', () => {
    const result = cn('class1', undefined, 'class2');
    expect(result).toBe('class1 class2');
  });
  
  it('handles conditional classes', () => {
    const isActive = true;
    const result = cn('base', isActive && 'active');
    expect(result).toBe('base active');
  });
  
  it('handles empty input', () => {
    const result = cn();
    expect(result).toBe('');
  });
  
  it('handles arrays of classes', () => {
    const result = cn(['class1', 'class2']);
    expect(result).toBe('class1 class2');
  });
}); 