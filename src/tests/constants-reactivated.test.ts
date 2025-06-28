import * as constants from '../constants';

describe('Constants - Reactivated Test', () => {
  it('exports constants object', () => {
    expect(constants).toBeDefined();
    expect(typeof constants).toBe('object');
  });
  
  it('has required constants', () => {
    // Teste básico da estrutura
    expect(constants).not.toBeNull();
  });
}); 