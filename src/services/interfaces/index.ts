/**
 * Service Interfaces Index
 * Exporta todos os contratos de interface para o sistema de serviços
 */

// Base interfaces
export * from './IBaseService';

// Specific service interfaces
export * from './IAnalyticsService';
export * from './IStorageService';
export * from './IAPIService';

// Common types for DI Container
export interface ServiceIdentifier<T = any> {
  name: string;
  version?: string;
  interface: new (...args: any[]) => T;
}

export interface ServiceRegistration<T = any> {
  identifier: ServiceIdentifier<T>;
  implementation: new (...args: any[]) => T;
  lifecycle: 'singleton' | 'transient' | 'scoped';
  dependencies?: ServiceIdentifier<any>[];
  factory?: (...args: any[]) => T;
  config?: any;
}

export interface DIContainer {
  register<T>(registration: ServiceRegistration<T>): void;
  resolve<T>(identifier: ServiceIdentifier<T>): Promise<T>;
  resolveSync<T>(identifier: ServiceIdentifier<T>): T;
  isRegistered<T>(identifier: ServiceIdentifier<T>): boolean;
  dispose(): Promise<void>;
} 