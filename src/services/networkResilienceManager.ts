// Retry logic with exponential backoff
export class NetworkResilienceManager {
  private maxRetries = 3;
  private baseDelay = 1000;
  private maxDelay = 10000;
  
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === this.maxRetries - 1) {
          throw new Error(`${operationName} failed after ${this.maxRetries} attempts: ${lastError.message}`);
        }
        
        const delay = Math.min(
          this.baseDelay * Math.pow(2, attempt),
          this.maxDelay
        );
        
        console.warn(`${operationName} attempt ${attempt + 1} failed, retrying in ${delay}ms:`, error);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  }
} 