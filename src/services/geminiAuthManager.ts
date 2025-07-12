// Enhanced authentication management for Gemini API
export class GeminiAuthManager {
  private apiKey: string;
  private lastValidated: Date | null = null;
  private validationInterval = 24 * 60 * 60 * 1000; // 24 hours
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  async validateCredentials(): Promise<boolean> {
    try {
      // First, validate API key format
      if (!this.apiKey || !this.apiKey.startsWith('AIza')) {
        console.warn('⚠️ Invalid API key format');
        return false;
      }

      // Try different models in order of preference
      const modelsToTest = [
        'gemini-2.0-flash',
        'gemini-1.5-flash-latest',
        'gemini-1.5-flash'
      ];

      for (const model of modelsToTest) {
        console.log(`🧪 Testing model: ${model}`);
        
        const testResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-goog-api-key': this.apiKey
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: 'Hello'
                }]
              }]
            })
          }
        );

        console.log(`🔍 Model ${model} response status: ${testResponse.status}`);

        if (testResponse.ok) {
          this.lastValidated = new Date();
          console.log(`✅ Gemini API credentials validated successfully with model: ${model}`);
          return true;
        } else {
          let errorData;
          try {
            errorData = await testResponse.json();
          } catch {
            errorData = { error: 'No JSON response' };
          }
          
          console.warn(`❌ Model ${model} failed:`, {
            status: testResponse.status,
            error: errorData?.error?.message || 'Unknown error'
          });

          // If it's a 404, the model doesn't exist, try next one
          if (testResponse.status === 404) {
            continue;
          }
          
          // If it's other errors (like 401/403), log detailed info
          if (testResponse.status === 400 || testResponse.status === 401 || testResponse.status === 403) {
            console.error('❌ API validation failed with model:', model, {
              status: testResponse.status,
              statusText: testResponse.statusText,
              error: errorData
            });
            
            // Try to extract more specific error information
            if (errorData?.error) {
              console.log('🔍 Error details:', {
                code: errorData.error.code,
                message: errorData.error.message,
                status: errorData.error.status
              });
            }
          }
        }
      }

      // If we get here, all models failed
      console.error('❌ All Gemini models failed validation');
      return false;
    } catch (error) {
      console.error('❌ Auth validation network error:', error);
      return false;
    }
  }
  
  async getValidatedApiKey(): Promise<string> {
    const now = new Date();
    const needsValidation = !this.lastValidated || 
      (now.getTime() - this.lastValidated.getTime()) > this.validationInterval;
    
    if (needsValidation) {
      const isValid = await this.validateCredentials();
      if (!isValid) {
        throw new Error('API credentials are invalid or expired');
      }
    }
    
    return this.apiKey;
  }
} 