/**
 * Mock Error Collection Service V6.4
 * Fallback para quando o servidor de coleta de erros não está disponível
 */

interface MockErrorData {
  id: string;
  type: string;
  message: string;
  stack?: string;
  url?: string;
  userAgent?: string;
  timestamp: string;
  sessionId?: string;
}

interface MockErrorStats {
  totalErrors: number;
  criticalErrors: number;
  lastUpdate: string;
  status: 'active' | 'offline';
}

class MockErrorCollectionService {
  private errors: MockErrorData[] = [];
  private readonly STORAGE_KEY = 'mock_error_collection';
  private readonly MAX_ERRORS = 100;

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Simular endpoint POST /api/errors
   */
  async collectError(errorData: Partial<MockErrorData>): Promise<{ success: boolean; errorId: string }> {
    const mockError: MockErrorData = {
      id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: errorData.type || 'unknown',
      message: errorData.message || 'No message',
      stack: errorData.stack,
      url: errorData.url || window.location.href,
      userAgent: errorData.userAgent || navigator.userAgent,
      timestamp: new Date().toISOString(),
      sessionId: errorData.sessionId
    };

    this.errors.push(mockError);

    // Manter apenas os últimos erros
    if (this.errors.length > this.MAX_ERRORS) {
      this.errors = this.errors.slice(-this.MAX_ERRORS);
    }

    this.saveToStorage();

    console.log('📊 [MOCK] Error collected:', mockError.type, '-', mockError.message.substring(0, 50));

    return {
      success: true,
      errorId: mockError.id
    };
  }

  /**
   * Simular endpoint GET /api/errors/status
   */
  async getStatus(): Promise<MockErrorStats> {
    const criticalErrors = this.errors.filter(error => 
      error.message.includes('Cannot read property') ||
      error.message.includes('is not a function') ||
      error.message.includes('Uncaught')
    ).length;

    return {
      totalErrors: this.errors.length,
      criticalErrors,
      lastUpdate: new Date().toISOString(),
      status: 'active'
    };
  }

  /**
   * Simular endpoint GET /api/errors/analysis
   */
  async getAnalysis(): Promise<any> {
    const errorsByType = this.errors.reduce((acc, error) => {
      acc[error.type] = (acc[error.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recentErrors = this.errors.slice(-10);

    return {
      timestamp: new Date().toISOString(),
      totalErrors: this.errors.length,
      errorsByType,
      recentErrors,
      insights: [
        {
          type: 'mock-service',
          message: 'Usando serviço mock - servidor principal indisponível',
          severity: 'info'
        }
      ]
    };
  }

  /**
   * Carregar erros do localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.errors = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Falha ao carregar erros do storage:', error);
      this.errors = [];
    }
  }

  /**
   * Salvar erros no localStorage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.errors));
    } catch (error) {
      console.warn('Falha ao salvar erros no storage:', error);
    }
  }

  /**
   * Limpar todos os erros
   */
  clearErrors(): void {
    this.errors = [];
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Verificar se deve usar mock (servidor indisponível)
   */
  static async shouldUseMock(endpoint: string): Promise<boolean> {
    try {
      const response = await fetch(`${endpoint}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(2000) // 2 segundos timeout
      });
      return !response.ok;
    } catch (error) {
      return true; // Servidor indisponível
    }
  }
}

// Singleton export
export const mockErrorCollection = new MockErrorCollectionService();

/**
 * Error Collection Adapter V6.4
 * Auto-detecta se deve usar servidor real ou mock
 */
export class ErrorCollectionAdapter {
  private static useMock: boolean | null = null;
  // ✅ REALISTIC: Use relative endpoint or disable if no backend
  private static endpoint = '/api/errors'; // Will gracefully fail instead of connection refused

  /**
   * Coletar erro (com fallback automático)
   */
  static async collectError(errorData: any): Promise<any> {
    // In development, always use mock to avoid 404 errors
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      return mockErrorCollection.collectError(errorData);
    }

    // Verificar se deve usar mock (apenas uma vez por sessão)
    if (this.useMock === null) {
      this.useMock = await MockErrorCollectionService.shouldUseMock(this.endpoint.replace('/api/errors', ''));
      
      if (this.useMock) {
        console.log('🔄 [ERROR COLLECTION] Servidor indisponível, usando mock service');
      }
    }

    if (this.useMock) {
      return mockErrorCollection.collectError(errorData);
    }

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorData),
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      // Don't log this error in development to avoid console pollution
      if (typeof window === 'undefined' || window.location.hostname !== 'localhost') {
        console.warn('🔄 [ERROR COLLECTION] Fallback para mock service:', error);
      }
      this.useMock = true;
      return mockErrorCollection.collectError(errorData);
    }
  }

  /**
   * Obter status (com fallback automático)
   */
  static async getStatus(): Promise<any> {
    if (this.useMock === true) {
      return mockErrorCollection.getStatus();
    }

    try {
      const response = await fetch(`${this.endpoint}/status`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000)
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('🔄 [ERROR COLLECTION] Fallback para mock service');
      this.useMock = true;
      return mockErrorCollection.getStatus();
    }
  }
}

export default ErrorCollectionAdapter; 