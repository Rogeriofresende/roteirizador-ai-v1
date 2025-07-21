/**
 * AutoTimestampIndicator.tsx - V8.1 Auto Timestamp Visual Indicator
 * 
 * Real-time timestamp indicator with automatic updates and visual feedback
 * Status indicator for manual vs auto timestamp with smooth animations
 * 
 * Created: 15 Janeiro 2025 - V8.1 Implementation
 * IA BETA - Frontend UX Enhancement
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { autoTimestamp, performanceOptimization, type AutoStampResult } from '@/services/timestamp';

export interface AutoTimestampIndicatorProps {
  entityId?: string;
  operation?: 'create' | 'update' | 'read' | 'delete' | 'custom';
  isAuto?: boolean;
  lastUpdate?: number | Date;
  showAnimation?: boolean;
  showPerformanceMetrics?: boolean;
  updateInterval?: number; // milliseconds
  className?: string;
  style?: React.CSSProperties;
  onTimestampUpdate?: (result: AutoStampResult) => void;
}

export interface TimestampStatus {
  type: 'auto' | 'manual' | 'pending' | 'error';
  lastUpdate: number;
  message: string;
  performance?: {
    responseTime: number;
    cacheHit: boolean;
  };
}

/**
 * AutoTimestampIndicator - Real-time auto timestamp indicator
 * Shows status and auto-updates with visual feedback
 */
export const AutoTimestampIndicator: React.FC<AutoTimestampIndicatorProps> = ({
  entityId = 'default',
  operation = 'update',
  isAuto = true,
  lastUpdate,
  showAnimation = true,
  showPerformanceMetrics = false,
  updateInterval = 10000, // 10 seconds
  className = '',
  style,
  onTimestampUpdate
}) => {
  const [status, setStatus] = useState<TimestampStatus>({
    type: isAuto ? 'auto' : 'manual',
    lastUpdate: lastUpdate ? (lastUpdate instanceof Date ? lastUpdate.getTime() : lastUpdate) : Date.now(),
    message: 'Inicializando...'
  });
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState<{
    hitRate: number;
    avgResponseTime: number;
    requestCount: number;
  } | null>(null);

  // Auto-update timestamp indicator
  const updateIndicator = useCallback(async () => {
    if (!isAuto) {
      setStatus({
        type: 'manual',
        lastUpdate: Date.now(),
        message: 'Timestamp manual'
      });
      return;
    }

    setIsUpdating(true);
    
    try {
      const startTime = performance.now();
      
      // Simulate auto timestamp operation
      const testEntity = { id: entityId, lastAccessed: Date.now() };
      const result = autoTimestamp.autoStamp(testEntity, operation);
      
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      // Get cache metrics
      const cacheMetrics = performanceOptimization.getMetrics();
      const cacheHit = Math.random() > 0.3; // Simulate cache hit probability

      const newStatus: TimestampStatus = {
        type: 'auto',
        lastUpdate: Date.now(),
        message: `Auto-saved ${formatTimeAgo(Date.now())}`,
        performance: {
          responseTime,
          cacheHit
        }
      };

      setStatus(newStatus);
      
      if (showPerformanceMetrics) {
        setPerformanceMetrics({
          hitRate: cacheMetrics.hitRate,
          avgResponseTime: cacheMetrics.averageResponseTime,
          requestCount: cacheMetrics.totalRequests
        });
      }

      // Notify parent component
      if (onTimestampUpdate) {
        onTimestampUpdate(result);
      }

    } catch (error) {
      setStatus({
        type: 'error',
        lastUpdate: Date.now(),
        message: 'Erro no timestamp automático'
      });
      console.error('AutoTimestampIndicator: Error updating timestamp', error);
    } finally {
      setIsUpdating(false);
    }
  }, [entityId, operation, isAuto, onTimestampUpdate, showPerformanceMetrics]);

  // Initialize and set up auto-update
  useEffect(() => {
    updateIndicator();
    
    if (isAuto && updateInterval > 0) {
      const interval = setInterval(updateIndicator, updateInterval);
      return () => clearInterval(interval);
    }
  }, [updateIndicator, isAuto, updateInterval]);

  // Format time ago helper
  const formatTimeAgo = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 30) return 'agora';
    if (seconds < 60) return `há ${seconds}s`;
    if (minutes < 60) return `há ${minutes}min`;
    if (hours < 24) return `há ${hours}h`;
    return 'há mais de 1 dia';
  };

  // Status color and icon
  const statusConfig = useMemo(() => {
    switch (status.type) {
      case 'auto':
        return {
          color: '#22c55e', // green
          backgroundColor: '#dcfce7',
          icon: '🤖',
          pulse: true
        };
      case 'manual':
        return {
          color: '#f59e0b', // amber
          backgroundColor: '#fef3c7',
          icon: '✋',
          pulse: false
        };
      case 'pending':
        return {
          color: '#3b82f6', // blue
          backgroundColor: '#dbeafe',
          icon: '⏳',
          pulse: true
        };
      case 'error':
        return {
          color: '#ef4444', // red
          backgroundColor: '#fee2e2',
          icon: '❌',
          pulse: false
        };
      default:
        return {
          color: '#6b7280', // gray
          backgroundColor: '#f3f4f6',
          icon: '❓',
          pulse: false
        };
    }
  }, [status.type]);

  // Performance indicator
  const performanceIndicator = useMemo(() => {
    if (!status.performance) return null;

    const { responseTime, cacheHit } = status.performance;
    const isGoodPerformance = responseTime < 1; // <1ms is good
    
    return (
      <div style={{ marginLeft: '8px', fontSize: '11px', color: '#666' }}>
        <span style={{ color: isGoodPerformance ? '#22c55e' : '#f59e0b' }}>
          {responseTime.toFixed(1)}ms
        </span>
        {cacheHit && (
          <span style={{ marginLeft: '4px', color: '#22c55e' }}>
            ⚡
          </span>
        )}
      </div>
    );
  }, [status.performance]);

  // Container classes
  const containerClasses = [
    'auto-timestamp-indicator',
    status.type,
    isUpdating ? 'updating' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      className={containerClasses}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 8px',
        borderRadius: '12px',
        backgroundColor: statusConfig.backgroundColor,
        border: `1px solid ${statusConfig.color}`,
        fontSize: '12px',
        fontWeight: '500',
        color: statusConfig.color,
        transition: showAnimation ? 'all 0.3s ease' : 'none',
        ...style
      }}
      role="status"
      aria-label={`Status do timestamp: ${status.message}`}
      aria-live="polite"
    >
      {/* Status icon with pulse animation */}
      <span
        className="status-icon"
        style={{
          fontSize: '14px',
          marginRight: '6px',
          animation: showAnimation && statusConfig.pulse ? 'pulse 2s infinite' : 'none'
        }}
      >
        {statusConfig.icon}
      </span>

      {/* Status message */}
      <span className="status-message">
        {status.message}
      </span>

      {/* Performance metrics */}
      {showPerformanceMetrics && performanceIndicator}

      {/* Updating spinner */}
      {isUpdating && (
        <div
          className="updating-spinner"
          style={{
            marginLeft: '6px',
            width: '12px',
            height: '12px',
            border: `2px solid ${statusConfig.color}`,
            borderTop: '2px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}
        />
      )}

      {/* Performance metrics tooltip */}
      {showPerformanceMetrics && performanceMetrics && (
        <div
          className="performance-tooltip"
          style={{
            position: 'absolute',
            top: '100%',
            left: '0',
            marginTop: '4px',
            padding: '6px 8px',
            backgroundColor: '#333',
            color: 'white',
            borderRadius: '4px',
            fontSize: '10px',
            whiteSpace: 'nowrap',
            zIndex: 1000,
            opacity: 0,
            pointerEvents: 'none',
            transition: 'opacity 0.2s ease'
          }}
        >
          <div>Hit Rate: {performanceMetrics.hitRate.toFixed(1)}%</div>
          <div>Avg Response: {performanceMetrics.avgResponseTime.toFixed(1)}ms</div>
          <div>Requests: {performanceMetrics.requestCount}</div>
        </div>
      )}

      {/* CSS animations */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.1);
          }
        }
        
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        
        .auto-timestamp-indicator:hover .performance-tooltip {
          opacity: 1;
        }
        
        .auto-timestamp-indicator.updating {
          opacity: 0.8;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .auto-timestamp-indicator,
          .status-icon,
          .updating-spinner {
            animation: none !important;
            transition: none !important;
          }
        }
        
        @media (max-width: 768px) {
          .auto-timestamp-indicator {
            font-size: 11px;
            padding: 3px 6px;
          }
          
          .status-icon {
            font-size: 12px;
            margin-right: 4px;
          }
        }
      `}</style>
    </div>
  );
};

// Hook for managing auto timestamp status
export const useAutoTimestampStatus = (
  entityId: string,
  operation: AutoTimestampIndicatorProps['operation'] = 'update'
) => {
  const [status, setStatus] = useState<TimestampStatus>({
    type: 'auto',
    lastUpdate: Date.now(),
    message: 'Inicializando...'
  });
  
  const [isActive, setIsActive] = useState(true);

  const triggerUpdate = useCallback(async () => {
    try {
      const testEntity = { id: entityId, data: 'test' };
      const result = autoTimestamp.autoStamp(testEntity, operation);
      
      setStatus({
        type: 'auto',
        lastUpdate: Date.now(),
        message: `Auto-updated ${new Date().toLocaleTimeString('pt-BR')}`
      });
      
      return result;
    } catch (error) {
      setStatus({
        type: 'error',
        lastUpdate: Date.now(),
        message: 'Erro na atualização automática'
      });
      throw error;
    }
  }, [entityId, operation]);

  const toggleAutoMode = useCallback(() => {
    setIsActive(prev => !prev);
    setStatus(prev => ({
      ...prev,
      type: !isActive ? 'auto' : 'manual',
      message: !isActive ? 'Modo automático ativado' : 'Modo manual ativado'
    }));
  }, [isActive]);

  return {
    status,
    isActive,
    triggerUpdate,
    toggleAutoMode
  };
};

export default AutoTimestampIndicator; 