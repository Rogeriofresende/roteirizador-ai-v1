/**
 * 🚀 UNIFIED EVENT SYSTEM V8.0 - CONSOLIDATION STRATEGY
 * Consolida: EnterpriseEventBus + RealTimeCollaborationService + Event Sourcing
 * Metodologia: V8.0 Consolidation - construindo sobre assets existentes
 * Integration: DI + Cache + Monitoring + Performance systems
 */

import { EventEmitter } from 'events';
import { createLogger } from '../../utils/logger';

const logger = createLogger('UnifiedEventSystem');

// =============================================================================
// TYPES & INTERFACES - UNIFIED EVENT ARCHITECTURE
// =============================================================================

export interface UnifiedEvent {
  id: string;
  type: string;
  source: string;
  target?: string;
  data: any;
  timestamp: number;
  version: number;
  correlation_id?: string;
  causation_id?: string;
  retry_count: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
}

export interface EventStore {
  append(events: UnifiedEvent[]): Promise<void>;
  getEvents(streamId: string, fromVersion?: number): Promise<UnifiedEvent[]>;
  getSnapshot(streamId: string): Promise<any>;
  saveSnapshot(streamId: string, snapshot: any, version: number): Promise<void>;
}

export interface CommandHandler<T = any> {
  handle(command: T): Promise<UnifiedEvent[]>;
}

export interface QueryHandler<T = any, R = any> {
  handle(query: T): Promise<R>;
}

export interface EventHandler {
  handle(event: UnifiedEvent): Promise<void>;
}

export interface SagaStep {
  execute(data: any): Promise<any>;
  compensate?(data: any): Promise<void>;
}

// =============================================================================
// EVENT STORE IMPLEMENTATION - CONSOLIDATION
// =============================================================================

class InMemoryEventStore implements EventStore {
  private streams: Map<string, UnifiedEvent[]> = new Map();
  private snapshots: Map<string, { data: any; version: number }> = new Map();

  async append(events: UnifiedEvent[]): Promise<void> {
    for (const event of events) {
      const streamId = event.correlation_id || event.id;
      
      if (!this.streams.has(streamId)) {
        this.streams.set(streamId, []);
      }
      
      this.streams.get(streamId)!.push(event);
      
      logger.debug(`Event appended to stream ${streamId}:`, {
        eventType: event.type,
        version: event.version
      });
    }
  }

  async getEvents(streamId: string, fromVersion: number = 0): Promise<UnifiedEvent[]> {
    const events = this.streams.get(streamId) || [];
    return events.filter(event => event.version >= fromVersion);
  }

  async getSnapshot(streamId: string): Promise<any> {
    return this.snapshots.get(streamId)?.data || null;
  }

  async saveSnapshot(streamId: string, snapshot: any, version: number): Promise<void> {
    this.snapshots.set(streamId, { data: snapshot, version });
    logger.debug(`Snapshot saved for stream ${streamId} at version ${version}`);
  }
}

// =============================================================================
// UNIFIED EVENT SYSTEM - MAIN CLASS
// =============================================================================

export class UnifiedEventSystem extends EventEmitter {
  private eventStore: EventStore;
  private commandHandlers: Map<string, CommandHandler> = new Map();
  private queryHandlers: Map<string, QueryHandler> = new Map();
  private eventHandlers: Map<string, EventHandler[]> = new Map();
  private sagaSteps: Map<string, SagaStep[]> = new Map();
  
  // Consolidation from existing systems
  private subscribers: Map<string, Set<(event: UnifiedEvent) => void>> = new Map();
  private deadLetterQueue: UnifiedEvent[] = [];
  private maxRetries: number = 3;
  private maxQueueSize: number = 10000;
  
  // Integration with consolidated systems (Phase 1.3)
  private diProvider: any;
  private cacheProvider: any;
  private monitoringProvider: any;
  private performanceProvider: any;

  constructor(
    eventStore?: EventStore,
    systemProviders?: {
      di?: any;
      cache?: any;
      monitoring?: any;
      performance?: any;
    }
  ) {
    super();
    
    this.eventStore = eventStore || new InMemoryEventStore();
    
    // Integration with Phase 1.3 consolidated systems
    if (systemProviders) {
      this.diProvider = systemProviders.di;
      this.cacheProvider = systemProviders.cache;
      this.monitoringProvider = systemProviders.monitoring;
      this.performanceProvider = systemProviders.performance;
    }
    
    this.setupIntegrationPoints();
    
    logger.info('🚀 Unified Event System V8.0 initialized', {
      hasEventStore: !!eventStore,
      hasSystemIntegration: !!systemProviders,
      consolidationStrategy: 'V8.0'
    });
  }

  // =============================================================================
  // COMMAND & QUERY SEPARATION (CQRS)
  // =============================================================================

  registerCommandHandler<T>(commandType: string, handler: CommandHandler<T>): void {
    this.commandHandlers.set(commandType, handler);
    logger.debug(`Command handler registered: ${commandType}`);
  }

  registerQueryHandler<T, R>(queryType: string, handler: QueryHandler<T, R>): void {
    this.queryHandlers.set(queryType, handler);
    logger.debug(`Query handler registered: ${queryType}`);
  }

  async executeCommand<T>(commandType: string, command: T): Promise<UnifiedEvent[]> {
    const startTime = performance.now();
    
    try {
      const handler = this.commandHandlers.get(commandType);
      if (!handler) {
        throw new Error(`No handler registered for command: ${commandType}`);
      }

      // Performance monitoring integration
      if (this.performanceProvider) {
        this.performanceProvider.startOperation(`command.${commandType}`);
      }

      const events = await handler.handle(command);
      
      // Store events
      await this.eventStore.append(events);
      
      // Publish events
      for (const event of events) {
        await this.publishEvent(event);
      }

      const duration = performance.now() - startTime;
      
      // Monitoring integration
      if (this.monitoringProvider) {
        this.monitoringProvider.recordMetric('command.executed', {
          type: commandType,
          duration,
          eventsGenerated: events.length
        });
      }

      logger.info(`Command executed: ${commandType}`, {
        duration,
        eventsGenerated: events.length
      });

      return events;
      
    } catch (error) {
      // Error monitoring integration
      if (this.monitoringProvider) {
        this.monitoringProvider.recordError('command.failed', {
          type: commandType,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
      
      logger.error(`Command execution failed: ${commandType}`, error);
      throw error;
    }
  }

  async executeQuery<T, R>(queryType: string, query: T): Promise<R> {
    const startTime = performance.now();
    
    try {
      const handler = this.queryHandlers.get(queryType);
      if (!handler) {
        throw new Error(`No handler registered for query: ${queryType}`);
      }

      // Cache integration for queries
      let cacheKey: string | undefined;
      if (this.cacheProvider) {
        cacheKey = `query:${queryType}:${JSON.stringify(query)}`;
        const cached = await this.cacheProvider.get(cacheKey);
        if (cached) {
          logger.debug(`Query cache hit: ${queryType}`);
          return cached;
        }
      }

      const result = await handler.handle(query);
      
      // Cache the result
      if (this.cacheProvider && cacheKey) {
        await this.cacheProvider.set(cacheKey, result, {
          ttl: 300000, // 5 minutes
          tags: [`query.${queryType}`]
        });
      }

      const duration = performance.now() - startTime;
      
      // Monitoring integration
      if (this.monitoringProvider) {
        this.monitoringProvider.recordMetric('query.executed', {
          type: queryType,
          duration,
          cached: false
        });
      }

      logger.info(`Query executed: ${queryType}`, { duration });

      return result;
      
    } catch (error) {
      logger.error(`Query execution failed: ${queryType}`, error);
      throw error;
    }
  }

  // =============================================================================
  // EVENT SOURCING & PUBLISHING
  // =============================================================================

  async publishEvent(event: UnifiedEvent): Promise<void> {
    try {
      // Store event for sourcing
      await this.eventStore.append([event]);
      
      // Deliver to subscribers (consolidated from existing EventBus)
      await this.deliverEvent(event);
      
      // Handle event with registered handlers
      const handlers = this.eventHandlers.get(event.type) || [];
      for (const handler of handlers) {
        try {
          await handler.handle(event);
        } catch (error) {
          logger.error(`Event handler failed for ${event.type}:`, error);
          await this.handleEventFailure(event, error);
        }
      }

      this.emit('event-published', event);
      
    } catch (error) {
      logger.error('Failed to publish event:', error);
      throw error;
    }
  }

  registerEventHandler(eventType: string, handler: EventHandler): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    
    this.eventHandlers.get(eventType)!.push(handler);
    logger.debug(`Event handler registered: ${eventType}`);
  }

  // =============================================================================
  // SAGA PATTERNS - DISTRIBUTED TRANSACTIONS
  // =============================================================================

  registerSaga(sagaType: string, steps: SagaStep[]): void {
    this.sagaSteps.set(sagaType, steps);
    logger.debug(`Saga registered: ${sagaType} with ${steps.length} steps`);
  }

  async executeSaga(sagaType: string, initialData: any): Promise<any> {
    const steps = this.sagaSteps.get(sagaType);
    if (!steps) {
      throw new Error(`No saga registered: ${sagaType}`);
    }

    const sagaId = `saga_${sagaType}_${Date.now()}`;
    const completedSteps: { step: number; data: any }[] = [];
    
    try {
      let currentData = initialData;
      
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        
        logger.debug(`Executing saga step ${i + 1}/${steps.length} for ${sagaType}`);
        
        const result = await step.execute(currentData);
        completedSteps.push({ step: i, data: result });
        currentData = result;
      }

      // Saga completed successfully
      const completionEvent: UnifiedEvent = {
        id: `${sagaId}_completed`,
        type: 'saga.completed',
        source: 'UnifiedEventSystem',
        data: { sagaType, result: currentData },
        timestamp: Date.now(),
        version: 1,
        correlation_id: sagaId,
        retry_count: 0,
        priority: 'medium'
      };

      await this.publishEvent(completionEvent);
      
      logger.info(`Saga completed: ${sagaType}`, { sagaId, steps: completedSteps.length });
      
      return currentData;
      
    } catch (error) {
      // Saga failed - execute compensations
      logger.error(`Saga failed: ${sagaType}`, { sagaId, error });
      
      await this.compensateSaga(sagaType, completedSteps, sagaId);
      
      throw error;
    }
  }

  private async compensateSaga(
    sagaType: string, 
    completedSteps: { step: number; data: any }[], 
    sagaId: string
  ): Promise<void> {
    const steps = this.sagaSteps.get(sagaType)!;
    
    // Execute compensations in reverse order
    for (let i = completedSteps.length - 1; i >= 0; i--) {
      const { step, data } = completedSteps[i];
      const sagaStep = steps[step];
      
      if (sagaStep.compensate) {
        try {
          await sagaStep.compensate(data);
          logger.debug(`Compensated saga step ${step + 1} for ${sagaType}`);
        } catch (compensationError) {
          logger.error(`Compensation failed for step ${step + 1}:`, compensationError);
        }
      }
    }

    // Publish saga failure event
    const failureEvent: UnifiedEvent = {
      id: `${sagaId}_failed`,
      type: 'saga.failed',
      source: 'UnifiedEventSystem',
      data: { sagaType, compensatedSteps: completedSteps.length },
      timestamp: Date.now(),
      version: 1,
      correlation_id: sagaId,
      retry_count: 0,
      priority: 'high'
    };

    await this.publishEvent(failureEvent);
  }

  // =============================================================================
  // INTEGRATION POINTS WITH CONSOLIDATED SYSTEMS (Phase 1.3)
  // =============================================================================

  private setupIntegrationPoints(): void {
    // Cache invalidation events
    this.subscribe('cache.invalidate', async (event: UnifiedEvent) => {
      if (this.cacheProvider) {
        await this.cacheProvider.clear(event.data.tags);
      }
    });

    // Health monitoring events
    this.subscribe('health.degraded', async (event: UnifiedEvent) => {
      if (this.monitoringProvider) {
        this.monitoringProvider.createAlert('performance', 'medium', 
          'System Health Degraded', event.data.message);
      }
    });

    // Performance budget events
    this.subscribe('performance.budget.exceeded', async (event: UnifiedEvent) => {
      if (this.performanceProvider) {
        this.performanceProvider.recordBudgetExceeded(event.data.metric, event.data.value);
      }
    });

    // DI service lifecycle events
    this.subscribe('service.initialized', async (event: UnifiedEvent) => {
      if (this.diProvider) {
        this.diProvider.registerService(event.data.serviceId, event.data.instance);
      }
    });

    logger.debug('Integration points setup completed');
  }

  // =============================================================================
  // CONSOLIDATED EVENT DELIVERY (from existing EventBus)
  // =============================================================================

  subscribe(eventType: string, handler: (event: UnifiedEvent) => void): () => void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }
    
    this.subscribers.get(eventType)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.subscribers.get(eventType)?.delete(handler);
    };
  }

  private async deliverEvent(event: UnifiedEvent): Promise<void> {
    const handlers = this.subscribers.get(event.type) || new Set();
    
    for (const handler of handlers) {
      try {
        await handler(event);
        this.emit('event-delivered', { eventId: event.id, handler: handler.name });
      } catch (error) {
        this.emit('event-delivery-failed', { 
          eventId: event.id, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
        
        await this.handleEventFailure(event, error);
      }
    }
  }

  private async handleEventFailure(event: UnifiedEvent, error: any): Promise<void> {
    if (event.retry_count < this.maxRetries) {
      // Retry with exponential backoff
      const delay = Math.pow(2, event.retry_count) * 1000;
      
      setTimeout(async () => {
        const retryEvent = { ...event, retry_count: event.retry_count + 1 };
        await this.deliverEvent(retryEvent);
      }, delay);
      
    } else {
      // Send to dead letter queue
      this.deadLetterQueue.push(event);
      
      // Trim dead letter queue if needed
      if (this.deadLetterQueue.length > this.maxQueueSize) {
        this.deadLetterQueue.shift();
      }
      
      logger.error(`Event sent to dead letter queue: ${event.id}`, { error });
    }
  }

  // =============================================================================
  // REPLAY & RECOVERY
  // =============================================================================

  async replayEvents(streamId: string, fromVersion: number = 0): Promise<void> {
    const events = await this.eventStore.getEvents(streamId, fromVersion);
    
    for (const event of events) {
      await this.publishEvent(event);
    }
    
    logger.info(`Replayed ${events.length} events for stream ${streamId}`);
  }

  async rebuildProjection(streamId: string, projectionHandler: EventHandler): Promise<void> {
    const events = await this.eventStore.getEvents(streamId);
    
    for (const event of events) {
      await projectionHandler.handle(event);
    }
    
    logger.info(`Rebuilt projection for stream ${streamId} with ${events.length} events`);
  }

  // =============================================================================
  // METRICS & MONITORING
  // =============================================================================

  getMetrics(): any {
    return {
      totalEvents: Array.from(this.eventHandlers.values()).flat().length,
      commandHandlers: this.commandHandlers.size,
      queryHandlers: this.queryHandlers.size,
      sagaTypes: this.sagaSteps.size,
      deadLetterQueueSize: this.deadLetterQueue.length,
      subscribers: Array.from(this.subscribers.values()).reduce((sum, set) => sum + set.size, 0)
    };
  }

  getDeadLetterQueue(): UnifiedEvent[] {
    return [...this.deadLetterQueue];
  }

  clearDeadLetterQueue(): void {
    this.deadLetterQueue.length = 0;
    logger.info('Dead letter queue cleared');
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export default UnifiedEventSystem; 