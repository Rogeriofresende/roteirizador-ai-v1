/**
 * API Service Interface
 * Contract para serviços de API (Gemini, ChatGPT, etc.)
 */

import { IBaseService } from './IBaseService';

export interface APIRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
}

export interface APIResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  success: boolean;
}

export interface APIError {
  code: string;
  message: string;
  status?: number;
  details?: any;
  timestamp: Date;
}

export interface AIRequest {
  prompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  context?: any;
}

export interface AIResponse {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason: string;
  metadata?: any;
}

export interface IAPIService extends IBaseService {
  // Generic HTTP operations
  request<T>(request: APIRequest): Promise<APIResponse<T>>;
  get<T>(url: string, headers?: Record<string, string>): Promise<APIResponse<T>>;
  post<T>(url: string, data?: any, headers?: Record<string, string>): Promise<APIResponse<T>>;
  put<T>(url: string, data?: any, headers?: Record<string, string>): Promise<APIResponse<T>>;
  delete<T>(url: string, headers?: Record<string, string>): Promise<APIResponse<T>>;
  
  // Configuration
  setBaseURL(url: string): void;
  setDefaultHeaders(headers: Record<string, string>): void;
  setAuthToken(token: string): void;
  
  // Error handling
  onError(handler: (error: APIError) => void): void;
  
  // Rate limiting and circuit breaker
  getRateLimitStatus(): Promise<{
    remaining: number;
    resetTime: Date;
    limit: number;
  }>;
}

export interface IAIService extends IAPIService {
  // AI-specific operations
  generateText(request: AIRequest): Promise<AIResponse>;
  generateCode(request: AIRequest & { language?: string }): Promise<AIResponse>;
  analyze(content: string, analysisType: string): Promise<AIResponse>;
  
  // Model management
  getAvailableModels(): Promise<string[]>;
  setDefaultModel(model: string): void;
  
  // Token management
  estimateTokens(text: string): number;
  getTokenUsage(): Promise<{
    total: number;
    remaining: number;
    resetDate: Date;
  }>;
}

export interface APIConfig {
  baseURL: string;
  apiKey?: string;
  timeout: number;
  retries: number;
  rateLimit?: {
    requests: number;
    window: number; // in milliseconds
  };
  circuitBreaker?: {
    threshold: number;
    timeout: number;
  };
} 