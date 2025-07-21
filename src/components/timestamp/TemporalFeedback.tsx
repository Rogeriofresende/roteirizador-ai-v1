/**
 * TemporalFeedback.tsx - V8.1 Temporal Operations Feedback Component
 * 
 * User feedback component for timestamp operations with visual states
 * Success/error states, loading indicators, and toast notifications
 * 
 * Created: 15 Janeiro 2025 - V8.1 Implementation
 * IA BETA - Frontend UX Enhancement
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { systemTimestamp, validationSuite, type ValidationSuiteResult } from '@/services/timestamp';

export interface TemporalFeedbackProps {
  operation: 'generate' | 'validate' | 'migrate' | 'save' | 'sync' | 'restore';
  status: 'idle' | 'loading' | 'success' | 'error' | 'warning';
  message?: string;
  duration?: number; // ms for auto-hide
  showProgress?: boolean;
  progressValue?: number; // 0-100
  details?: any;
  onClose?: () => void;
  onRetry?: () => void;
  className?: string;
  style?: React.CSSProperties;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center';
}

export interface NotificationState {
  id: string;
  operation: string;
  status: TemporalFeedbackProps['status'];
  message: string;
  timestamp: number;
  duration: number;
  details?: any;
}

/**
 * TemporalFeedback - Visual feedback for timestamp operations
 * Provides immediate feedback with animations and auto-hide
 */
export const TemporalFeedback: React.FC<TemporalFeedbackProps> = ({
  operation,
  status,
  message,
  duration = 5000,
  showProgress = false,
  progressValue = 0,
  details,
  onClose,
  onRetry,
  className = '',
  style,
  position = 'top-right'
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(progressValue);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Auto-hide after duration
  useEffect(() => {
    if (status === 'success' && duration > 0) {
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose?.(), 300); // Wait for fade animation
      }, duration);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [status, duration, onClose]);

  // Update progress
  useEffect(() => {
    setProgress(progressValue);
  }, [progressValue]);

  // Handle close
  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => onClose?.(), 300);
  }, [onClose]);

  // Status configuration
  const statusConfig = {
    idle: {
      color: '#6b7280',
      backgroundColor: '#f9fafb',
      borderColor: '#d1d5db',
      icon: '⏳',
      title: 'Aguardando'
    },
    loading: {
      color: '#3b82f6',
      backgroundColor: '#eff6ff',
      borderColor: '#93c5fd',
      icon: '🔄',
      title: 'Processando'
    },
    success: {
      color: '#059669',
      backgroundColor: '#ecfdf5',
      borderColor: '#6ee7b7',
      icon: '✅',
      title: 'Sucesso'
    },
    error: {
      color: '#dc2626',
      backgroundColor: '#fef2f2',
      borderColor: '#fca5a5',
      icon: '❌',
      title: 'Erro'
    },
    warning: {
      color: '#d97706',
      backgroundColor: '#fffbeb',
      borderColor: '#fcd34d',
      icon: '⚠️',
      title: 'Atenção'
    }
  };

  const config = statusConfig[status];

  // Operation-specific messages
  const getOperationMessage = () => {
    if (message) return message;

    const messages = {
      generate: {
        loading: 'Gerando timestamp...',
        success: 'Timestamp gerado com sucesso',
        error: 'Erro ao gerar timestamp',
        warning: 'Timestamp gerado com advertências'
      },
      validate: {
        loading: 'Validando timestamp...',
        success: 'Timestamp válido',
        error: 'Timestamp inválido',
        warning: 'Timestamp com advertências'
      },
      migrate: {
        loading: 'Migrando dados...',
        success: 'Migração concluída',
        error: 'Erro na migração',
        warning: 'Migração concluída com advertências'
      },
      save: {
        loading: 'Salvando...',
        success: 'Salvo automaticamente',
        error: 'Erro ao salvar',
        warning: 'Salvo com advertências'
      },
      sync: {
        loading: 'Sincronizando...',
        success: 'Sincronização completa',
        error: 'Erro na sincronização',
        warning: 'Sincronização parcial'
      },
      restore: {
        loading: 'Restaurando...',
        success: 'Dados restaurados',
        error: 'Erro na restauração',
        warning: 'Restauração parcial'
      }
    };

    return messages[operation]?.[status] || `${operation} ${status}`;
  };

  // Position styles
  const positionStyles: Record<string, React.CSSProperties> = {
    'top-right': {
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 1000
    },
    'top-left': {
      position: 'fixed',
      top: '20px',
      left: '20px',
      zIndex: 1000
    },
    'bottom-right': {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 1000
    },
    'bottom-left': {
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      zIndex: 1000
    },
    'center': {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 1000
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`temporal-feedback ${status} ${className}`}
      style={{
        ...positionStyles[position],
        backgroundColor: config.backgroundColor,
        border: `1px solid ${config.borderColor}`,
        borderRadius: '8px',
        padding: '12px 16px',
        minWidth: '280px',
        maxWidth: '400px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(-10px)',
        transition: 'all 0.3s ease',
        ...style
      }}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span
            style={{
              fontSize: '16px',
              marginRight: '8px',
              animation: status === 'loading' ? 'spin 1s linear infinite' : 'none'
            }}
          >
            {config.icon}
          </span>
          <span
            style={{
              fontSize: '14px',
              fontWeight: '600',
              color: config.color
            }}
          >
            {config.title}
          </span>
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          style={{
            background: 'none',
            border: 'none',
            color: config.color,
            cursor: 'pointer',
            fontSize: '16px',
            opacity: 0.7,
            padding: '0',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
            transition: 'opacity 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
          aria-label="Fechar notificação"
        >
          ×
        </button>
      </div>

      {/* Message */}
      <div
        style={{
          fontSize: '13px',
          color: config.color,
          lineHeight: '1.4',
          marginBottom: showProgress ? '8px' : '0'
        }}
      >
        {getOperationMessage()}
      </div>

      {/* Progress bar */}
      {showProgress && (
        <div
          style={{
            width: '100%',
            height: '4px',
            backgroundColor: '#e5e7eb',
            borderRadius: '2px',
            overflow: 'hidden',
            marginBottom: '8px'
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              backgroundColor: config.color,
              borderRadius: '2px',
              transition: 'width 0.3s ease'
            }}
          />
        </div>
      )}

      {/* Details */}
      {details && (
        <div
          style={{
            fontSize: '11px',
            color: '#6b7280',
            marginTop: '6px',
            padding: '6px 8px',
            backgroundColor: '#f9fafb',
            borderRadius: '4px',
            fontFamily: 'monospace'
          }}
        >
          {typeof details === 'string' ? details : JSON.stringify(details, null, 2)}
        </div>
      )}

      {/* Actions */}
      {(status === 'error' && onRetry) && (
        <div style={{ marginTop: '8px', textAlign: 'right' }}>
          <button
            onClick={onRetry}
            style={{
              background: config.color,
              color: 'white',
              border: 'none',
              padding: '4px 12px',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'opacity 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* CSS animations */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .temporal-feedback {
            min-width: auto !important;
            max-width: calc(100vw - 40px) !important;
            left: 20px !important;
            right: 20px !important;
            transform: none !important;
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .temporal-feedback {
            transition: none !important;
          }
          
          .temporal-feedback * {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};

// Toast notification manager
export class TemporalNotificationManager {
  private static instance: TemporalNotificationManager;
  private notifications: NotificationState[] = [];
  private listeners: ((notifications: NotificationState[]) => void)[] = [];

  static getInstance(): TemporalNotificationManager {
    if (!TemporalNotificationManager.instance) {
      TemporalNotificationManager.instance = new TemporalNotificationManager();
    }
    return TemporalNotificationManager.instance;
  }

  show(props: Omit<TemporalFeedbackProps, 'onClose'>): string {
    const id = `notification-${Date.now()}-${Math.random()}`;
    
    const notification: NotificationState = {
      id,
      operation: props.operation,
      status: props.status,
      message: props.message || '',
      timestamp: Date.now(),
      duration: props.duration || 5000,
      details: props.details
    };

    this.notifications.push(notification);
    this.notifyListeners();

    // Auto-remove after duration
    if (notification.duration > 0 && props.status === 'success') {
      setTimeout(() => {
        this.remove(id);
      }, notification.duration);
    }

    return id;
  }

  remove(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notifyListeners();
  }

  clear(): void {
    this.notifications = [];
    this.notifyListeners();
  }

  subscribe(listener: (notifications: NotificationState[]) => void): () => void {
    this.listeners.push(listener);
    listener(this.notifications);

    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }
}

// Hook for using temporal notifications
export const useTemporalNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationState[]>([]);
  const manager = TemporalNotificationManager.getInstance();

  useEffect(() => {
    const unsubscribe = manager.subscribe(setNotifications);
    return unsubscribe;
  }, [manager]);

  const showNotification = useCallback((props: Omit<TemporalFeedbackProps, 'onClose'>) => {
    return manager.show(props);
  }, [manager]);

  const removeNotification = useCallback((id: string) => {
    manager.remove(id);
  }, [manager]);

  const clearNotifications = useCallback(() => {
    manager.clear();
  }, [manager]);

  return {
    notifications,
    showNotification,
    removeNotification,
    clearNotifications
  };
};

export default TemporalFeedback; 