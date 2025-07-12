import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, XCircle, Info, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
  className?: string;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
  className
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Animação de entrada
    const enterTimer = setTimeout(() => setIsVisible(true), 50);
    
    // Auto-dismiss
    if (duration > 0) {
      const exitTimer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => onClose(id), 300);
      }, duration);
      
      return () => {
        clearTimeout(enterTimer);
        clearTimeout(exitTimer);
      };
    }

    return () => clearTimeout(enterTimer);
  }, [id, duration, onClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onClose(id), 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return null;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800';
    }
  };

  return (
    <div
      className={cn(
        'pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg border shadow-lg transition-all duration-300 ease-in-out',
        getColors(),
        isVisible && !isExiting
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0',
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          
          <div className="ml-3 w-0 flex-1">
            <p className={cn(
              'text-sm font-medium',
              type === 'success' && 'text-green-800 dark:text-green-200',
              type === 'error' && 'text-red-800 dark:text-red-200',
              type === 'warning' && 'text-yellow-800 dark:text-yellow-200',
              type === 'info' && 'text-blue-800 dark:text-blue-200'
            )}>
              {title}
            </p>
            
            {message && (
              <p className={cn(
                'mt-1 text-sm',
                type === 'success' && 'text-green-700 dark:text-green-300',
                type === 'error' && 'text-red-700 dark:text-red-300',
                type === 'warning' && 'text-yellow-700 dark:text-yellow-300',
                type === 'info' && 'text-blue-700 dark:text-blue-300'
              )}>
                {message}
              </p>
            )}
          </div>
          
          <div className="ml-4 flex flex-shrink-0">
            <button
              className={cn(
                'inline-flex rounded-md p-1.5 transition-colors hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-offset-2',
                type === 'success' && 'text-green-500 focus:ring-green-600',
                type === 'error' && 'text-red-500 focus:ring-red-600',
                type === 'warning' && 'text-yellow-500 focus:ring-yellow-600',
                type === 'info' && 'text-blue-500 focus:ring-blue-600'
              )}
              onClick={handleClose}
              aria-label="Fechar notificação"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Progress bar para auto-dismiss */}
      {duration > 0 && (
        <div className="h-1 bg-black/10">
          <div
            className={cn(
              'h-full transition-all ease-linear',
              type === 'success' && 'bg-green-600',
              type === 'error' && 'bg-red-600',
              type === 'warning' && 'bg-yellow-600',
              type === 'info' && 'bg-blue-600'
            )}
            style={{
              animation: `shrink ${duration}ms linear forwards`
            }}
          />
        </div>
      )}
      
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

// Provider de contexto para toasts
interface ToastContextType {
  showToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast deve ser usado dentro de ToastProvider');
  }
  return context;
};

interface ToastState {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const showToast = (type: ToastType, title: string, message?: string, duration?: number) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastState = { id, type, title, message, duration };
    
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Container de toasts */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={removeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}; 