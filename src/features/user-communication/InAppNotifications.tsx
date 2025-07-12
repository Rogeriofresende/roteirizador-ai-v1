/**
 * 📱 In-App Notifications - Migration Communication
 * 
 * React components for in-app notifications during migration
 * Toast, banner, and modal notification systems
 * 
 * Part of: PRE-WEEK 0 - IA Beta Communication Templates Development
 * Integration: Alpha cost notifications + Charlie satisfaction tracking
 */

import React, { useState, useEffect } from 'react';

// Notification types and interfaces
export interface NotificationProps {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  duration?: number; // milliseconds, 0 for persistent
  onClose?: () => void;
  onClick?: () => void;
  costTier?: 'free' | 'premium'; // Alpha integration
  satisfactionScore?: number; // Charlie integration
}

export interface ToastNotificationProps extends NotificationProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export interface BannerNotificationProps extends NotificationProps {
  position?: 'top' | 'bottom';
  priority?: 'low' | 'medium' | 'high';
}

export interface ModalNotificationProps extends NotificationProps {
  isOpen: boolean;
  actions?: {
    primary?: { label: string; action: () => void };
    secondary?: { label: string; action: () => void };
  };
}

// Toast Notification Component
export const ToastNotification: React.FC<ToastNotificationProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  position = 'top-right',
  onClose,
  onClick,
  costTier
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  const getTypeStyles = () => {
    const styles = {
      success: {
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        icon: '✅'
      },
      info: {
        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        icon: 'ℹ️'
      },
      warning: {
        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        icon: '⚠️'
      },
      error: {
        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        icon: '❌'
      }
    };
    return styles[type];
  };

  const getPositionStyles = () => {
    const positions = {
      'top-right': { top: '20px', right: '20px' },
      'top-left': { top: '20px', left: '20px' },
      'bottom-right': { bottom: '20px', right: '20px' },
      'bottom-left': { bottom: '20px', left: '20px' }
    };
    return positions[position];
  };

  if (!isVisible) return null;

  const typeStyle = getTypeStyles();
  const positionStyle = getPositionStyles();

  return (
    <div
      style={{
        position: 'fixed',
        ...positionStyle,
        zIndex: 9999,
        transform: isAnimating ? 'translateX(400px)' : 'translateX(0)',
        transition: 'transform 0.3s ease-in-out',
        maxWidth: '400px',
        background: typeStyle.background,
        color: 'white',
        borderRadius: '8px',
        padding: '16px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        cursor: onClick ? 'pointer' : 'default'
      }}
      onClick={onClick}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <span style={{ fontSize: '20px', flexShrink: 0 }}>
          {typeStyle.icon}
        </span>
        
        <div style={{ flex: 1 }}>
          <div style={{ 
            fontSize: '16px', 
            fontWeight: '600', 
            marginBottom: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {title}
            {costTier === 'premium' && (
              <span style={{ 
                fontSize: '12px', 
                background: 'rgba(255,255,255,0.2)', 
                padding: '2px 6px', 
                borderRadius: '10px' 
              }}>
                ⭐ Premium
              </span>
            )}
          </div>
          
          <div style={{ 
            fontSize: '14px', 
            opacity: 0.9, 
            lineHeight: '1.4' 
          }}>
            {message}
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'white',
            fontSize: '18px',
            cursor: 'pointer',
            opacity: 0.7,
            flexShrink: 0
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
};

// Banner Notification Component
export const BannerNotification: React.FC<BannerNotificationProps> = ({
  id,
  type,
  title,
  message,
  position = 'top',
  priority = 'medium',
  onClose,
  onClick,
  costTier
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const getPriorityStyles = () => {
    const styles = {
      low: { borderLeft: '4px solid #6b7280' },
      medium: { borderLeft: '4px solid #3b82f6' },
      high: { borderLeft: '4px solid #ef4444' }
    };
    return styles[priority];
  };

  const getTypeBackground = () => {
    const backgrounds = {
      success: '#ecfdf5',
      info: '#eff6ff',
      warning: '#fffbeb',
      error: '#fef2f2'
    };
    return backgrounds[type];
  };

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        [position]: 0,
        left: 0,
        right: 0,
        zIndex: 9998,
        background: getTypeBackground(),
        ...getPriorityStyles(),
        padding: '12px 16px',
        cursor: onClick ? 'pointer' : 'default'
      }}
      onClick={onClick}
    >
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ 
            fontSize: '14px', 
            fontWeight: '600', 
            color: '#374151',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {title}
            {costTier === 'premium' && (
              <span style={{ 
                fontSize: '10px', 
                background: '#fbbf24', 
                color: 'white',
                padding: '2px 6px', 
                borderRadius: '8px' 
              }}>
                PREMIUM
              </span>
            )}
          </div>
          
          <div style={{ 
            fontSize: '13px', 
            color: '#6b7280',
            marginTop: '2px'
          }}>
            {message}
          </div>
        </div>

        {onClose && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsVisible(false);
              onClose();
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#6b7280',
              fontSize: '16px',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

// Modal Notification Component
export const ModalNotification: React.FC<ModalNotificationProps> = ({
  id,
  type,
  title,
  message,
  isOpen,
  actions,
  onClose,
  costTier,
  satisfactionScore
}) => {
  if (!isOpen) return null;

  const getTypeIcon = () => {
    const icons = {
      success: '🎉',
      info: 'ℹ️',
      warning: '⚠️',
      error: '❌'
    };
    return icons[type];
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10000,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          padding: '32px',
          maxWidth: '500px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          transform: 'scale(1)',
          transition: 'transform 0.2s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>
            {getTypeIcon()}
          </div>
          
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: '700', 
            color: '#1f2937',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
          }}>
            {title}
            {costTier === 'premium' && (
              <span style={{ 
                fontSize: '12px', 
                background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                color: 'white',
                padding: '4px 8px', 
                borderRadius: '12px',
                fontWeight: '600'
              }}>
                ⭐ PREMIUM
              </span>
            )}
          </h2>
          
          <p style={{ 
            fontSize: '16px', 
            color: '#6b7280',
            lineHeight: '1.6'
          }}>
            {message}
          </p>

          {satisfactionScore && (
            <div style={{
              marginTop: '16px',
              padding: '12px',
              background: '#f3f4f6',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                Sua última avaliação: {satisfactionScore}% de satisfação
              </div>
            </div>
          )}
        </div>

        <div style={{ 
          display: 'flex', 
          gap: '12px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          {actions?.primary && (
            <button
              onClick={actions.primary.action}
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'transform 0.1s ease'
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {actions.primary.label}
            </button>
          )}

          {actions?.secondary && (
            <button
              onClick={actions.secondary.action}
              style={{
                background: 'transparent',
                color: '#6b7280',
                border: '1px solid #d1d5db',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {actions.secondary.label}
            </button>
          )}

          {!actions && (
            <button
              onClick={onClose}
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Entendi
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Progress Notification Component (for migration progress)
export const ProgressNotification: React.FC<{
  title: string;
  progress: number; // 0-100
  currentStep: string;
  totalSteps: number;
  currentStepNumber: number;
  onCancel?: () => void;
}> = ({
  title,
  progress,
  currentStep,
  totalSteps,
  currentStepNumber,
  onCancel
}) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10001,
        background: 'white',
        borderRadius: '12px',
        padding: '32px',
        minWidth: '400px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ fontSize: '32px', marginBottom: '16px' }}>⚡</div>
        <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937' }}>
          {title}
        </h3>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginBottom: '8px',
          fontSize: '14px',
          color: '#6b7280'
        }}>
          <span>Etapa {currentStepNumber} de {totalSteps}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        
        <div style={{
          width: '100%',
          height: '8px',
          background: '#e5e7eb',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              transition: 'width 0.3s ease'
            }}
          />
        </div>
      </div>

      <div style={{ 
        fontSize: '16px', 
        color: '#374151',
        textAlign: 'center',
        marginBottom: '20px'
      }}>
        {currentStep}
      </div>

      {onCancel && (
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={onCancel}
            style={{
              background: 'transparent',
              color: '#6b7280',
              border: '1px solid #d1d5db',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
};

// Notification Container Hook
export const useNotificationContainer = () => {
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);

  const addNotification = (notification: Omit<NotificationProps, 'id'>) => {
    const id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setNotifications(prev => [...prev, { ...notification, id }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications
  };
};

// Notification Container Component
export const NotificationContainer: React.FC<{
  notifications: NotificationProps[];
  onRemove: (id: string) => void;
}> = ({ notifications, onRemove }) => {
  return (
    <>
      {notifications.map((notification) => (
        <ToastNotification
          key={notification.id}
          {...notification}
          onClose={() => onRemove(notification.id)}
        />
      ))}
    </>
  );
};

export default {
  ToastNotification,
  BannerNotification,
  ModalNotification,
  ProgressNotification,
  useNotificationContainer,
  NotificationContainer
}; 