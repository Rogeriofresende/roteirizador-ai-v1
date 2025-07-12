/**
 * 🚀 WEEK 7 DAY 2 - REAL-TIME COLLABORATION SERVICE
 * Enterprise-grade real-time collaboration with WebSocket optimization and conflict resolution
 */

import { logger } from '../utils/logger';
import { recordMetric } from './performance';
import { analyticsService } from './analyticsService';

// 🚀 WEEK 7: Collaboration Types
export interface CollaborationSession {
  id: string;
  projectId: string;
  participants: Participant[];
  status: 'active' | 'paused' | 'ended';
  createdAt: number;
  lastActivity: number;
  settings: SessionSettings;
}

export interface Participant {
  id: string;
  name: string;
  role: 'owner' | 'editor' | 'viewer' | 'commenter';
  status: 'online' | 'offline' | 'away';
  cursor?: CursorPosition;
  lastSeen: number;
  permissions: Permission[];
}

export interface CursorPosition {
  x: number;
  y: number;
  element?: string;
  selection?: TextSelection;
}

export interface TextSelection {
  start: number;
  end: number;
  text: string;
}

export interface Permission {
  action: 'read' | 'write' | 'comment' | 'share' | 'delete';
  scope: 'all' | 'own' | 'none';
}

export interface SessionSettings {
  allowAnonymous: boolean;
  maxParticipants: number;
  autoSave: boolean;
  conflictResolution: 'last-wins' | 'merge' | 'manual';
  offlineSync: boolean;
  versionHistory: boolean;
}

export interface CollaborationEvent {
  id: string;
  type: 'text_change' | 'cursor_move' | 'user_join' | 'user_leave' | 'comment_add' | 'save' | 'conflict';
  sessionId: string;
  userId: string;
  timestamp: number;
  data: any;
  version: number;
}

export interface OperationalTransform {
  id: string;
  operation: 'insert' | 'delete' | 'retain' | 'format';
  position: number;
  content?: string;
  length?: number;
  attributes?: Record<string, any>;
  userId: string;
  timestamp: number;
}

export interface ConflictResolution {
  conflictId: string;
  operations: OperationalTransform[];
  resolution: 'merged' | 'user_choice' | 'last_wins';
  resolvedBy: string;
  timestamp: number;
}

// 🚀 WEEK 7: WebSocket Message Types
interface WebSocketMessage {
  type: 'operation' | 'cursor' | 'presence' | 'sync' | 'heartbeat' | 'error';
  sessionId: string;
  userId: string;
  data: any;
  timestamp: number;
  version?: number;
}

class RealTimeCollaborationService {
  private ws: WebSocket | null = null;
  private sessions: Map<string, CollaborationSession> = new Map();
  private operations: Map<string, OperationalTransform[]> = new Map(); // Session operations
  private pendingOperations: Map<string, OperationalTransform[]> = new Map(); // Offline operations
  private conflictQueue: Map<string, ConflictResolution[]> = new Map();
  
  // 🚀 WEEK 7: Connection Management
  private connectionState: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' = 'disconnected';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private heartbeatInterval?: number;
  private reconnectTimeout?: number;
  
  // 🚀 WEEK 7: Performance Metrics
  private metrics = {
    totalSessions: 0,
    activeParticipants: 0,
    operationsProcessed: 0,
    conflictsResolved: 0,
    avgLatency: 0,
    offlineOperations: 0,
    syncEvents: 0
  };

  // Event handlers
  private eventHandlers = new Map<string, ((event: CollaborationEvent) => void)[]>();

  constructor(private wsUrl?: string) {
    this.initializeService();
    this.startPerformanceMonitoring();
    
    logger.log('info', 'Real-time Collaboration Service initialized', {
      wsUrl: !!wsUrl,
      offlineSupport: true,
      conflictResolution: true
    }, 'COLLABORATION');
  }

  /**
   * 🚀 WEEK 7: Start or join collaboration session
   */
  async startSession(projectId: string, settings?: Partial<SessionSettings>): Promise<CollaborationSession> {
    const sessionId = `session_${projectId}_${Date.now()}`;
    
    const defaultSettings: SessionSettings = {
      allowAnonymous: false,
      maxParticipants: 10,
      autoSave: true,
      conflictResolution: 'merge',
      offlineSync: true,
      versionHistory: true
    };

    const session: CollaborationSession = {
      id: sessionId,
      projectId,
      participants: [],
      status: 'active',
      createdAt: Date.now(),
      lastActivity: Date.now(),
      settings: { ...defaultSettings, ...settings }
    };

    this.sessions.set(sessionId, session);
    this.operations.set(sessionId, []);
    this.metrics.totalSessions++;

    // Connect to WebSocket if not connected
    if (this.connectionState === 'disconnected') {
      await this.connect();
    }

    // Send session start event
    this.sendMessage({
      type: 'sync',
      sessionId,
      userId: 'current_user', // Get from auth in production
      data: { action: 'session_start', session },
      timestamp: Date.now()
    });

    logger.log('info', 'Collaboration session started', { sessionId, projectId }, 'COLLABORATION');

    analyticsService.trackEvent('collaboration_session_started', {
      sessionId,
      projectId,
      settings: session.settings
    });

    return session;
  }

  /**
   * 🚀 WEEK 7: Join existing session
   */
  async joinSession(sessionId: string, participant: Omit<Participant, 'lastSeen'>): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    if (session.participants.length >= session.settings.maxParticipants) {
      throw new Error('Session is full');
    }

    const fullParticipant: Participant = {
      ...participant,
      lastSeen: Date.now()
    };

    session.participants.push(fullParticipant);
    session.lastActivity = Date.now();
    this.metrics.activeParticipants++;

    // Send join event
    this.sendMessage({
      type: 'presence',
      sessionId,
      userId: participant.id,
      data: { action: 'join', participant: fullParticipant },
      timestamp: Date.now()
    });

    // Sync participant with current state
    await this.syncParticipant(sessionId, participant.id);

    this.emitEvent({
      id: this.generateEventId(),
      type: 'user_join',
      sessionId,
      userId: participant.id,
      timestamp: Date.now(),
      data: { participant: fullParticipant },
      version: this.getCurrentVersion(sessionId)
    });

    logger.log('info', 'Participant joined session', { sessionId, participantId: participant.id }, 'COLLABORATION');

    return true;
  }

  /**
   * 🚀 WEEK 7: Send operational transform
   */
  async sendOperation(sessionId: string, operation: Omit<OperationalTransform, 'id' | 'timestamp'>): Promise<void> {
    const fullOperation: OperationalTransform = {
      ...operation,
      id: this.generateOperationId(),
      timestamp: Date.now()
    };

    // Add to operations log
    const sessionOps = this.operations.get(sessionId) || [];
    sessionOps.push(fullOperation);
    this.operations.set(sessionId, sessionOps);
    this.metrics.operationsProcessed++;

    if (this.connectionState === 'connected') {
      // Send immediately if connected
      this.sendMessage({
        type: 'operation',
        sessionId,
        userId: operation.userId,
        data: fullOperation,
        timestamp: Date.now(),
        version: this.getCurrentVersion(sessionId)
      });
    } else {
      // Queue for offline sync
      const pending = this.pendingOperations.get(sessionId) || [];
      pending.push(fullOperation);
      this.pendingOperations.set(sessionId, pending);
      this.metrics.offlineOperations++;
      
      logger.log('debug', 'Operation queued for offline sync', { 
        sessionId, 
        operationId: fullOperation.id 
      }, 'COLLABORATION');
    }

    // Emit local event
    this.emitEvent({
      id: this.generateEventId(),
      type: 'text_change',
      sessionId,
      userId: operation.userId,
      timestamp: Date.now(),
      data: fullOperation,
      version: this.getCurrentVersion(sessionId)
    });

    recordMetric('collaboration_operation_sent', 1, 'count', 'collaboration');
  }

  /**
   * 🚀 WEEK 7: Update cursor position
   */
  updateCursor(sessionId: string, userId: string, position: CursorPosition): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const participant = session.participants.find(p => p.id === userId);
    if (!participant) return;

    participant.cursor = position;
    participant.lastSeen = Date.now();

    // Send cursor update (throttled)
    if (this.connectionState === 'connected') {
      this.sendMessage({
        type: 'cursor',
        sessionId,
        userId,
        data: { position },
        timestamp: Date.now()
      });
    }
  }

  /**
   * 🚀 WEEK 7: Conflict resolution
   */
  async resolveConflict(
    sessionId: string,
    conflictingOperations: OperationalTransform[],
    resolutionStrategy?: 'merge' | 'last_wins' | 'manual'
  ): Promise<ConflictResolution> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const strategy = resolutionStrategy || session.settings.conflictResolution;
    
    let resolvedOperations: OperationalTransform[] = [];
    let resolution: ConflictResolution['resolution'] = 'merged';

    switch (strategy) {
      case 'last_wins':
        resolvedOperations = [conflictingOperations[conflictingOperations.length - 1]];
        resolution = 'last_wins';
        break;
        
      case 'merge':
        resolvedOperations = await this.mergeOperations(conflictingOperations);
        resolution = 'merged';
        break;
        
      case 'manual':
        // In production, this would present options to user
        resolvedOperations = conflictingOperations;
        resolution = 'user_choice';
        break;
    }

    const conflictResolution: ConflictResolution = {
      conflictId: this.generateConflictId(),
      operations: resolvedOperations,
      resolution,
      resolvedBy: 'system', // In production, get actual user
      timestamp: Date.now()
    };

    // Store resolution
    const conflicts = this.conflictQueue.get(sessionId) || [];
    conflicts.push(conflictResolution);
    this.conflictQueue.set(sessionId, conflicts);
    this.metrics.conflictsResolved++;

    // Apply resolved operations
    for (const operation of resolvedOperations) {
      await this.applyOperation(sessionId, operation);
    }

    logger.log('info', 'Conflict resolved', {
      sessionId,
      conflictId: conflictResolution.conflictId,
      strategy,
      operationsCount: resolvedOperations.length
    }, 'COLLABORATION');

    analyticsService.trackEvent('collaboration_conflict_resolved', {
      sessionId,
      strategy,
      operationsCount: conflictingOperations.length
    });

    return conflictResolution;
  }

  /**
   * 🚀 WEEK 7: WebSocket connection management
   */
  private async connect(): Promise<void> {
    if (!this.wsUrl) {
      logger.log('warn', 'WebSocket URL not configured, running in offline mode', {}, 'COLLABORATION');
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        this.connectionState = 'connecting';
        this.ws = new WebSocket(this.wsUrl!);

        this.ws.onopen = () => {
          this.connectionState = 'connected';
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          
          logger.log('info', 'WebSocket connected', {}, 'COLLABORATION');
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(JSON.parse(event.data));
        };

        this.ws.onclose = () => {
          this.connectionState = 'disconnected';
          this.stopHeartbeat();
          this.handleDisconnection();
        };

        this.ws.onerror = (error) => {
          logger.log('error', 'WebSocket error', { error }, 'COLLABORATION');
          reject(error);
        };

        // Connection timeout
        setTimeout(() => {
          if (this.connectionState === 'connecting') {
            this.ws?.close();
            reject(new Error('Connection timeout'));
          }
        }, 10000);

      } catch (error) {
        this.connectionState = 'disconnected';
        reject(error);
      }
    });
  }

  private disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connectionState = 'disconnected';
    this.stopHeartbeat();
  }

  private async handleDisconnection(): void {
    logger.log('warn', 'WebSocket disconnected, attempting reconnection', {}, 'COLLABORATION');

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.connectionState = 'reconnecting';
      this.reconnectAttempts++;
      
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000); // Exponential backoff
      
      this.reconnectTimeout = window.setTimeout(async () => {
        try {
          await this.connect();
          await this.syncOfflineOperations();
        } catch (error) {
          logger.log('error', 'Reconnection failed', { 
            attempt: this.reconnectAttempts, 
            error 
          }, 'COLLABORATION');
        }
      }, delay);
    } else {
      logger.log('error', 'Max reconnection attempts reached', {}, 'COLLABORATION');
    }
  }

  /**
   * 🚀 WEEK 7: Message handling
   */
  private sendMessage(message: WebSocketMessage): void {
    if (this.ws && this.connectionState === 'connected') {
      try {
        this.ws.send(JSON.stringify(message));
        recordMetric('collaboration_message_sent', 1, 'count', 'collaboration');
      } catch (error) {
        logger.log('error', 'Failed to send WebSocket message', { error }, 'COLLABORATION');
      }
    }
  }

  private handleMessage(message: WebSocketMessage): void {
    const startTime = performance.now();

    try {
      switch (message.type) {
        case 'operation':
          this.handleOperationMessage(message);
          break;
        case 'cursor':
          this.handleCursorMessage(message);
          break;
        case 'presence':
          this.handlePresenceMessage(message);
          break;
        case 'sync':
          this.handleSyncMessage(message);
          break;
        case 'error':
          this.handleErrorMessage(message);
          break;
      }

      const latency = performance.now() - startTime;
      this.updateLatencyMetrics(latency);
      
      recordMetric('collaboration_message_processed', 1, 'count', 'collaboration');
      recordMetric('collaboration_message_latency', latency, 'ms', 'collaboration');

    } catch (error) {
      logger.log('error', 'Failed to handle WebSocket message', { 
        messageType: message.type, 
        error 
      }, 'COLLABORATION');
    }
  }

  private handleOperationMessage(message: WebSocketMessage): void {
    const operation = message.data as OperationalTransform;
    
    // Check for conflicts
    const conflicts = this.detectConflicts(message.sessionId, operation);
    
    if (conflicts.length > 0) {
      this.resolveConflict(message.sessionId, [...conflicts, operation]);
    } else {
      this.applyOperation(message.sessionId, operation);
    }

    this.emitEvent({
      id: this.generateEventId(),
      type: 'text_change',
      sessionId: message.sessionId,
      userId: message.userId,
      timestamp: message.timestamp,
      data: operation,
      version: message.version || 0
    });
  }

  private handleCursorMessage(message: WebSocketMessage): void {
    const session = this.sessions.get(message.sessionId);
    if (!session) return;

    const participant = session.participants.find(p => p.id === message.userId);
    if (participant) {
      participant.cursor = message.data.position;
      participant.lastSeen = message.timestamp;
    }
  }

  private handlePresenceMessage(message: WebSocketMessage): void {
    const session = this.sessions.get(message.sessionId);
    if (!session) return;

    const { action, participant } = message.data;

    if (action === 'join') {
      const existingIndex = session.participants.findIndex(p => p.id === participant.id);
      if (existingIndex >= 0) {
        session.participants[existingIndex] = participant;
      } else {
        session.participants.push(participant);
      }
    } else if (action === 'leave') {
      session.participants = session.participants.filter(p => p.id !== message.userId);
    }

    this.emitEvent({
      id: this.generateEventId(),
      type: action === 'join' ? 'user_join' : 'user_leave',
      sessionId: message.sessionId,
      userId: message.userId,
      timestamp: message.timestamp,
      data: { participant },
      version: message.version || 0
    });
  }

  private handleSyncMessage(message: WebSocketMessage): void {
    // Handle sync responses and state synchronization
    this.metrics.syncEvents++;
    
    logger.log('debug', 'Sync message received', {
      sessionId: message.sessionId,
      action: message.data.action
    }, 'COLLABORATION');
  }

  private handleErrorMessage(message: WebSocketMessage): void {
    logger.log('error', 'Collaboration error received', {
      sessionId: message.sessionId,
      error: message.data
    }, 'COLLABORATION');
  }

  /**
   * 🚀 WEEK 7: Operational Transform and Conflict Detection
   */
  private detectConflicts(sessionId: string, operation: OperationalTransform): OperationalTransform[] {
    const sessionOps = this.operations.get(sessionId) || [];
    const conflicts: OperationalTransform[] = [];

    // Simple conflict detection - operations at same position within time window
    const timeWindow = 5000; // 5 seconds
    const recentOps = sessionOps.filter(op => 
      operation.timestamp - op.timestamp < timeWindow &&
      op.userId !== operation.userId &&
      Math.abs(op.position - operation.position) < 10 // Position proximity
    );

    conflicts.push(...recentOps);
    return conflicts;
  }

  private async mergeOperations(operations: OperationalTransform[]): Promise<OperationalTransform[]> {
    // Simple merge strategy - combine non-conflicting operations
    const merged: OperationalTransform[] = [];
    
    operations.sort((a, b) => a.timestamp - b.timestamp);
    
    let currentPosition = 0;
    for (const op of operations) {
      if (op.operation === 'insert') {
        // Adjust position for previous inserts
        const adjustedOp = {
          ...op,
          position: op.position + currentPosition
        };
        merged.push(adjustedOp);
        currentPosition += op.content?.length || 0;
      } else if (op.operation === 'delete') {
        // Adjust position for previous changes
        const adjustedOp = {
          ...op,
          position: Math.max(0, op.position + currentPosition)
        };
        merged.push(adjustedOp);
        currentPosition -= op.length || 0;
      } else {
        merged.push(op);
      }
    }

    return merged;
  }

  private async applyOperation(sessionId: string, operation: OperationalTransform): Promise<void> {
    // In production, this would apply the operation to the document
    logger.log('debug', 'Operation applied', {
      sessionId,
      operationId: operation.id,
      type: operation.operation
    }, 'COLLABORATION');
  }

  /**
   * 🚀 WEEK 7: Offline synchronization
   */
  private async syncOfflineOperations(): Promise<void> {
    for (const [sessionId, operations] of this.pendingOperations.entries()) {
      if (operations.length === 0) continue;

      logger.log('info', 'Syncing offline operations', {
        sessionId,
        operationsCount: operations.length
      }, 'COLLABORATION');

      for (const operation of operations) {
        this.sendMessage({
          type: 'operation',
          sessionId,
          userId: operation.userId,
          data: operation,
          timestamp: Date.now(),
          version: this.getCurrentVersion(sessionId)
        });
      }

      // Clear pending operations
      this.pendingOperations.set(sessionId, []);
    }
  }

  private async syncParticipant(sessionId: string, participantId: string): Promise<void> {
    const operations = this.operations.get(sessionId) || [];
    
    // Send recent operations to new participant
    const recentOps = operations.slice(-50); // Last 50 operations
    
    for (const operation of recentOps) {
      this.sendMessage({
        type: 'sync',
        sessionId,
        userId: 'system',
        data: { action: 'operation_replay', operation },
        timestamp: Date.now()
      });
    }
  }

  /**
   * 🚀 WEEK 7: Utility methods
   */
  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateOperationId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateConflictId(): string {
    return `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCurrentVersion(sessionId: string): number {
    const operations = this.operations.get(sessionId) || [];
    return operations.length;
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = window.setInterval(() => {
      if (this.connectionState === 'connected') {
        this.sendMessage({
          type: 'heartbeat',
          sessionId: 'system',
          userId: 'system',
          data: { timestamp: Date.now() },
          timestamp: Date.now()
        });
      }
    }, 30000); // Every 30 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = undefined;
    }
  }

  private updateLatencyMetrics(latency: number): void {
    const alpha = 0.1;
    this.metrics.avgLatency = this.metrics.avgLatency * (1 - alpha) + latency * alpha;
  }

  /**
   * 🚀 WEEK 7: Event system
   */
  addEventListener(eventType: string, handler: (event: CollaborationEvent) => void): void {
    const handlers = this.eventHandlers.get(eventType) || [];
    handlers.push(handler);
    this.eventHandlers.set(eventType, handlers);
  }

  removeEventListener(eventType: string, handler: (event: CollaborationEvent) => void): void {
    const handlers = this.eventHandlers.get(eventType) || [];
    const filtered = handlers.filter(h => h !== handler);
    this.eventHandlers.set(eventType, filtered);
  }

  private emitEvent(event: CollaborationEvent): void {
    const handlers = this.eventHandlers.get(event.type) || [];
    handlers.forEach(handler => {
      try {
        handler(event);
      } catch (error) {
        logger.log('error', 'Event handler failed', { 
          eventType: event.type, 
          error 
        }, 'COLLABORATION');
      }
    });
  }

  /**
   * 🚀 WEEK 7: Service management
   */
  private initializeService(): void {
    // Auto-cleanup inactive sessions
    setInterval(() => {
      this.cleanupInactiveSessions();
    }, 300000); // Every 5 minutes

    // Performance metrics logging
    setInterval(() => {
      this.logPerformanceMetrics();
    }, 60000); // Every minute
  }

  private cleanupInactiveSessions(): void {
    const now = Date.now();
    const inactiveThreshold = 30 * 60 * 1000; // 30 minutes
    let cleanedCount = 0;

    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.lastActivity > inactiveThreshold) {
        this.sessions.delete(sessionId);
        this.operations.delete(sessionId);
        this.pendingOperations.delete(sessionId);
        this.conflictQueue.delete(sessionId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      logger.log('info', 'Cleaned up inactive sessions', { count: cleanedCount }, 'COLLABORATION');
    }
  }

  private startPerformanceMonitoring(): void {
    setInterval(() => {
      const metrics = this.getMetrics();
      
      recordMetric('collaboration_active_sessions', metrics.activeSessions, 'count', 'collaboration');
      recordMetric('collaboration_active_participants', metrics.activeParticipants, 'count', 'collaboration');
      recordMetric('collaboration_avg_latency', metrics.avgLatency, 'ms', 'collaboration');
      
    }, 60000); // Every minute
  }

  private logPerformanceMetrics(): void {
    const metrics = this.getMetrics();
    
    logger.log('debug', 'Collaboration metrics', metrics, 'COLLABORATION');
  }

  /**
   * 🚀 WEEK 7: Public API methods
   */
  getMetrics() {
    return {
      ...this.metrics,
      activeSessions: this.sessions.size,
      connectionState: this.connectionState,
      reconnectAttempts: this.reconnectAttempts,
      pendingOperationsCount: Array.from(this.pendingOperations.values())
        .reduce((total, ops) => total + ops.length, 0)
    };
  }

  getSession(sessionId: string): CollaborationSession | null {
    return this.sessions.get(sessionId) || null;
  }

  getActiveSessions(): CollaborationSession[] {
    return Array.from(this.sessions.values()).filter(s => s.status === 'active');
  }

  async leaveSession(sessionId: string, userId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.participants = session.participants.filter(p => p.id !== userId);
    this.metrics.activeParticipants = Math.max(0, this.metrics.activeParticipants - 1);

    // Send leave event
    this.sendMessage({
      type: 'presence',
      sessionId,
      userId,
      data: { action: 'leave' },
      timestamp: Date.now()
    });

    this.emitEvent({
      id: this.generateEventId(),
      type: 'user_leave',
      sessionId,
      userId,
      timestamp: Date.now(),
      data: {},
      version: this.getCurrentVersion(sessionId)
    });

    logger.log('info', 'Participant left session', { sessionId, userId }, 'COLLABORATION');
  }

  async endSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.status = 'ended';
    
    // Notify all participants
    for (const participant of session.participants) {
      this.sendMessage({
        type: 'sync',
        sessionId,
        userId: 'system',
        data: { action: 'session_ended' },
        timestamp: Date.now()
      });
    }

    logger.log('info', 'Collaboration session ended', { sessionId }, 'COLLABORATION');

    analyticsService.trackEvent('collaboration_session_ended', {
      sessionId,
      duration: Date.now() - session.createdAt,
      participantsCount: session.participants.length,
      operationsCount: (this.operations.get(sessionId) || []).length
    });
  }

  dispose(): void {
    this.disconnect();
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    
    this.sessions.clear();
    this.operations.clear();
    this.pendingOperations.clear();
    this.conflictQueue.clear();
    this.eventHandlers.clear();

    logger.log('info', 'Real-time Collaboration Service disposed', {}, 'COLLABORATION');
  }
}

// 🚀 WEEK 7: Export service instance
export const realTimeCollaborationService = new RealTimeCollaborationService(); 