import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { 
  Check, 
  X, 
  AlertCircle, 
  Info, 
  Loader2, 
  Sparkles,
  Heart,
  Star,
  Zap,
  ChevronDown
} from 'lucide-react';
import { cn } from '../../lib/utils';

// Success Animation Component
export const SuccessAnimation: React.FC<{
  show: boolean;
  message?: string;
  onComplete?: () => void;
}> = ({ show, message = "Sucesso!", onComplete }) => {
  useEffect(() => {
    if (show && onComplete) {
      const timer = setTimeout(onComplete, 2000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "backOut" }}
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/20 backdrop-blur-sm"
        >
          <motion.div
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            className="bg-white p-8 rounded-2xl shadow-2xl border border-green-200"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4, ease: "backOut" }}
              className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Check className="w-8 h-8 text-green-600" />
            </motion.div>
            
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl font-semibold text-gray-900 text-center mb-2"
            >
              {message}
            </motion.h3>
            
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="h-1 bg-gradient-to-r from-green-400 to-blue-500 rounded-full"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Loading Button with States
export const SmartButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  loading?: boolean;
  success?: boolean;
  error?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ 
  children, 
  onClick, 
  loading = false, 
  success = false, 
  error = false,
  disabled = false,
  variant = 'primary',
  size = 'md',
  className 
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const getVariantClasses = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-gray-100 text-gray-900 hover:bg-gray-200';
      case 'outline':
        return 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50';
      default:
        return 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'lg':
        return 'px-8 py-4 text-lg';
      default:
        return 'px-6 py-3';
    }
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || loading}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      animate={{
        backgroundColor: success ? '#10B981' : error ? '#EF4444' : undefined,
      }}
      transition={{ duration: 0.2 }}
      className={cn(
        'relative font-medium rounded-lg transition-all duration-200 flex items-center justify-center space-x-2',
        getVariantClasses(),
        getSizeClasses(),
        disabled && 'opacity-50 cursor-not-allowed',
        isPressed && 'transform scale-95',
        className
      )}
    >
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="flex items-center space-x-2"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Carregando...</span>
          </motion.div>
        )}
        
        {success && !loading && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="flex items-center space-x-2"
          >
            <Check className="w-4 h-4" />
            <span>Concluído!</span>
          </motion.div>
        )}
        
        {error && !loading && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="flex items-center space-x-2"
          >
            <X className="w-4 h-4" />
            <span>Erro</span>
          </motion.div>
        )}
        
        {!loading && !success && !error && (
          <motion.div
            key="default"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

// Floating Notification System
export const FloatingNotification: React.FC<{
  show: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
}> = ({ 
  show, 
  type, 
  title, 
  description, 
  onClose, 
  autoClose = true, 
  duration = 4000 
}) => {
  useEffect(() => {
    if (show && autoClose && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [show, autoClose, onClose, duration]);

  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: <Check className="w-5 h-5" />,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          iconColor: 'text-green-600',
          titleColor: 'text-green-900',
          descColor: 'text-green-700'
        };
      case 'error':
        return {
          icon: <X className="w-5 h-5" />,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600',
          titleColor: 'text-red-900',
          descColor: 'text-red-700'
        };
      case 'warning':
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          iconColor: 'text-amber-600',
          titleColor: 'text-amber-900',
          descColor: 'text-amber-700'
        };
      default:
        return {
          icon: <Info className="w-5 h-5" />,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600',
          titleColor: 'text-blue-900',
          descColor: 'text-blue-700'
        };
    }
  };

  const config = getTypeConfig();

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -50, x: '-50%' }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={cn(
            'fixed top-6 left-1/2 z-50 max-w-md w-full mx-4',
            'border rounded-lg shadow-lg backdrop-blur-sm',
            config.bgColor,
            config.borderColor
          )}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
            className="p-4"
          >
            <div className="flex items-start space-x-3">
              <div className={cn('p-1 rounded-full', config.iconColor)}>
                {config.icon}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className={cn('font-medium text-sm', config.titleColor)}>
                  {title}
                </h4>
                {description && (
                  <p className={cn('text-sm mt-1', config.descColor)}>
                    {description}
                  </p>
                )}
              </div>
              
              {onClose && (
                <button
                  onClick={onClose}
                  className={cn(
                    'p-1 rounded-full hover:bg-white/50 transition-colors',
                    config.iconColor
                  )}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Expandable Card with Animation
export const ExpandableCard: React.FC<{
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  defaultExpanded?: boolean;
  className?: string;
}> = ({ title, children, icon, defaultExpanded = false, className }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <motion.div
      layout
      className={cn(
        'border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm',
        className
      )}
    >
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
        whileHover={{ backgroundColor: 'rgb(249 250 251)' }}
        whileTap={{ scale: 0.995 }}
      >
        <div className="flex items-center space-x-3">
          {icon && (
            <motion.div
              animate={{ rotate: isExpanded ? 360 : 0 }}
              transition={{ duration: 0.3 }}
              className="text-gray-600"
            >
              {icon}
            </motion.div>
          )}
          <h3 className="font-medium text-gray-900">{title}</h3>
        </div>
        
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </motion.div>
      </motion.button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="border-t border-gray-200"
          >
            <div className="p-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Floating Action Button with Ripple Effect
export const FloatingActionButton: React.FC<{
  onClick?: () => void;
  icon: React.ReactNode;
  label?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}> = ({ 
  onClick, 
  icon, 
  label, 
  position = 'bottom-right', 
  size = 'md',
  color = 'primary'
}) => {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) onClick();

    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const newRipple = { id: Date.now(), x, y };
    setRipples(prev => [...prev, newRipple]);

    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left':
        return 'bottom-6 left-6';
      case 'top-right':
        return 'top-6 right-6';
      case 'top-left':
        return 'top-6 left-6';
      default:
        return 'bottom-6 right-6';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-12 h-12';
      case 'lg':
        return 'w-16 h-16';
      default:
        return 'w-14 h-14';
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'secondary':
        return 'bg-gray-600 hover:bg-gray-700';
      case 'success':
        return 'bg-green-600 hover:bg-green-700';
      case 'warning':
        return 'bg-amber-600 hover:bg-amber-700';
      case 'danger':
        return 'bg-red-600 hover:bg-red-700';
      default:
        return 'bg-blue-600 hover:bg-blue-700';
    }
  };

  return (
    <motion.div
      className={cn('fixed z-50', getPositionClasses())}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
    >
      {label && (
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2"
        >
          <div className="bg-gray-900 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap">
            {label}
          </div>
        </motion.div>
      )}
      
      <motion.button
        onClick={handleClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={cn(
          'relative overflow-hidden rounded-full text-white shadow-lg transition-colors',
          'flex items-center justify-center',
          getSizeClasses(),
          getColorClasses()
        )}
      >
        {icon}
        
        {/* Ripple Effects */}
        {ripples.map(ripple => (
          <motion.span
            key={ripple.id}
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute bg-white rounded-full pointer-events-none"
            style={{
              left: ripple.x - 10,
              top: ripple.y - 10,
              width: 20,
              height: 20,
            }}
          />
        ))}
      </motion.button>
    </motion.div>
  );
};

// Like Animation Component
export const LikeAnimation: React.FC<{
  show: boolean;
  onComplete?: () => void;
}> = ({ show, onComplete }) => {
  const controls = useAnimation();

  useEffect(() => {
    if (show) {
      controls.start({
        scale: [1, 1.2, 1],
        rotate: [0, -10, 10, 0],
        transition: { duration: 0.6, ease: "easeInOut" }
      }).then(() => {
        if (onComplete) onComplete();
      });
    }
  }, [show, controls, onComplete]);

  return (
    <motion.div
      animate={controls}
      className="inline-block"
    >
      <Heart className={cn(
        "w-5 h-5 transition-colors duration-200",
        show ? "text-red-500 fill-current" : "text-gray-400"
      )} />
    </motion.div>
  );
};

// Star Rating with Animation
export const AnimatedStarRating: React.FC<{
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
}> = ({ rating, maxRating = 5, size = 'md', interactive = false, onChange }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-8 h-8';
      default:
        return 'w-6 h-6';
    }
  };

  return (
    <div className="flex items-center space-x-1">
      {Array.from({ length: maxRating }, (_, index) => {
        const starValue = index + 1;
        const isActive = starValue <= (hoverRating || rating);

        return (
          <motion.button
            key={index}
            disabled={!interactive}
            onMouseEnter={() => interactive && setHoverRating(starValue)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            onClick={() => interactive && onChange && onChange(starValue)}
            whileHover={interactive ? { scale: 1.2 } : {}}
            whileTap={interactive ? { scale: 0.9 } : {}}
            animate={{
              scale: isActive ? 1 : 0.8,
              rotate: isActive ? [0, 360] : 0,
            }}
            transition={{
              duration: 0.3,
              delay: index * 0.1,
              rotate: { duration: 0.6 }
            }}
            className={cn(
              'transition-colors',
              interactive && 'cursor-pointer',
              !interactive && 'cursor-default'
            )}
          >
            <Star className={cn(
              getSizeClass(),
              isActive ? 'text-yellow-400 fill-current' : 'text-gray-300'
            )} />
          </motion.button>
        );
      })}
    </div>
  );
};

// Progress Ring with Animation
export const AnimatedProgressRing: React.FC<{
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
  duration?: number;
}> = ({ 
  progress, 
  size = 60, 
  strokeWidth = 4, 
  color = '#3B82F6', 
  backgroundColor = '#E5E7EB',
  showPercentage = true,
  duration = 1
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration, ease: "easeInOut" }}
          style={{
            strokeDasharray: `${strokeDasharray} ${strokeDasharray}`,
          }}
        />
      </svg>
      
      {showPercentage && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: duration * 0.5 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <span className="text-sm font-medium text-gray-700">
            {Math.round(progress)}%
          </span>
        </motion.div>
      )}
    </div>
  );
}; 