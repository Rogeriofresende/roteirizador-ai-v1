// Fallback system for API failures
export class APIFallbackManager {
  private fallbackStrategies: Array<() => Promise<any>> = [];
  
  addFallback(strategy: () => Promise<any>): void {
    this.fallbackStrategies.push(strategy);
  }
  
  async executeWithFallbacks<T>(
    primaryOperation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    try {
      return await primaryOperation();
    } catch (primaryError) {
      console.warn(`${operationName} primary operation failed:`, primaryError);
      
      for (let i = 0; i < this.fallbackStrategies.length; i++) {
        try {
          console.log(`Attempting fallback ${i + 1} for ${operationName}`);
          return await this.fallbackStrategies[i]();
        } catch (fallbackError) {
          console.warn(`Fallback ${i + 1} failed:`, fallbackError);
        }
      }
      
      throw new Error(`${operationName} failed - all fallbacks exhausted`);
    }
  }
}

// Example fallback strategies for script generation
export const setupScriptGenerationFallbacks = () => {
  const fallbackManager = new APIFallbackManager();
  
  // Fallback 1: Use cached response
  fallbackManager.addFallback(async () => {
    const cached = getCachedScript();
    if (cached) return cached;
    throw new Error('No cached script available');
  });
  
  // Fallback 2: Use template-based generation
  fallbackManager.addFallback(async () => {
    return generateTemplateScript();
  });
  
  // Fallback 3: Return helpful error message
  fallbackManager.addFallback(async () => {
    return {
      script: 'Serviço temporariamente indisponível. Tente novamente em alguns minutos.',
      error: true
    };
  });
  
  return fallbackManager;
};

// Helper functions for fallbacks
const getCachedScript = (): string | null => {
  try {
    const cached = localStorage.getItem('last_generated_script');
    if (cached) {
      const parsedCache = JSON.parse(cached);
      const hourAgo = Date.now() - (60 * 60 * 1000);
      if (parsedCache.timestamp > hourAgo) {
        return parsedCache.script;
      }
    }
  } catch (error) {
    console.warn('Error reading cached script:', error);
  }
  return null;
};

const generateTemplateScript = (): string => {
  return `
# Roteiro Template

## Introdução
Olá! Bem-vindos ao nosso conteúdo sobre [ASSUNTO].

## Desenvolvimento
Hoje vamos explorar os principais pontos:
- Ponto 1: [DETALHE]
- Ponto 2: [DETALHE]
- Ponto 3: [DETALHE]

## Conclusão
Espero que tenham gostado! Não esqueçam de curtir e compartilhar.

---
*Este é um roteiro template gerado automaticamente. Para conteúdo personalizado, configure sua API key do Gemini.*
`;
}; 