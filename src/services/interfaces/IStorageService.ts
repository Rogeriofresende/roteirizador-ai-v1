/**
 * Storage Service Interface
 * Contract para serviços de armazenamento (cache, database, localStorage)
 */

import { IBaseService } from './IBaseService';

export interface StorageItem<T = any> {
  key: string;
  value: T;
  ttl?: number;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface StorageQuery {
  collection?: string;
  filters?: Record<string, any>;
  orderBy?: { field: string; direction: 'asc' | 'desc' };
  limit?: number;
  offset?: number;
}

export interface StorageMetrics {
  totalItems: number;
  totalSize: number;
  hitRate?: number;
  missRate?: number;
  operations: {
    reads: number;
    writes: number;
    deletes: number;
  };
}

export interface IStorageService extends IBaseService {
  // Basic CRUD operations
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<boolean>;
  exists(key: string): Promise<boolean>;
  
  // Batch operations
  getMultiple<T>(keys: string[]): Promise<(T | null)[]>;
  setMultiple<T>(items: Array<{ key: string; value: T; ttl?: number }>): Promise<void>;
  deleteMultiple(keys: string[]): Promise<number>;
  
  // Collection operations (for database services)
  query<T>(query: StorageQuery): Promise<T[]>;
  count(query: StorageQuery): Promise<number>;
  
  // Cache-specific operations
  invalidate(pattern?: string): Promise<void>;
  clear(): Promise<void>;
  
  // Storage management
  getStorageMetrics(): Promise<StorageMetrics>;
  optimize(): Promise<void>;
  
  // Transaction support (for database services)
  transaction<T>(operations: () => Promise<T>): Promise<T>;
}

export interface CacheConfig {
  maxSize?: number;
  defaultTTL?: number;
  strategy: 'LRU' | 'LFU' | 'FIFO';
  persistent?: boolean;
}

export interface DatabaseConfig {
  connectionString?: string;
  poolSize?: number;
  timeout?: number;
  retryPolicy?: {
    maxRetries: number;
    backoffMs: number;
  };
} 