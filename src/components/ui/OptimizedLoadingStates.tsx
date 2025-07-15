import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, 
  Brain, 
  Sparkles, 
  Zap, 
  FileText, 
  Mic,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { cn } from '../../lib/utils';

// Smart Loading Spinner with Context
export const SmartLoadingSpinner: React.FC<{
  type?: 'script' | 'voice' | 'analysis' | 'save' | 'general';
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  progress?: number;
  className?: string;
}> = ({ type = 'general', size = 'md', message, progress, className }) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const getTypeConfig = () => {
    switch (type) {
      case 'script':
        return {
          icon: <Brain className="text-blue-500" />,
          color: 'text-blue-500',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          defaultMessage: 'Gerando roteiro'
        };
      case 'voice':
        return {
          icon: <Mic className="text-purple-500" />,
          color: 'text-purple-500',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          defaultMessage: 'Sintetizando voz'
        };
      case 'analysis':
        return {
          icon: <Sparkles className="text-amber-500" />,
          color: 'text-amber-500',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          defaultMessage: 'Analisando conteúdo'
        };
      case 'save':
        return {
          icon: <FileText className="text-green-500" />,
          color: 'text-green-500',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          defaultMessage: 'Salvando'
        };
      default:
        return {
          icon: <Loader2 className="text-gray-500" />,
          color: 'text-gray-500',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          defaultMessage: 'Processando'
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return { icon: 'w-4 h-4', container: 'p-2', text: 'text-xs' };
      case 'lg':
        return { icon: 'w-8 h-8', container: 'p-6', text: 'text-lg' };
      default:
        return { icon: 'w-6 h-6', container: 'p-4', text: 'text-sm' };
    }
  };

  const config = getTypeConfig();
  const sizeClasses = getSizeClasses();
  const displayMessage = message || config.defaultMessage;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn(
        'inline-flex items-center space-x-3 rounded-lg border',
        config.bgColor,
        config.borderColor,
        sizeClasses.container,
        className
      )}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className={sizeClasses.icon}
      >
        {config.icon}
      </motion.div>
      
      <div className="flex flex-col">
        <span className={cn('font-medium', config.color, sizeClasses.text)}>
          {displayMessage}{dots}
        </span>
        
        {progress !== undefined && (
          <div className="mt-1">
            <div className="w-24 h-1 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
                className={cn('h-full rounded-full', 
                  type === 'script' ? 'bg-blue-500' :
                  type === 'voice' ? 'bg-purple-500' :
                  type === 'analysis' ? 'bg-amber-500' :
                  type === 'save' ? 'bg-green-500' : 'bg-gray-500'
                )}
              />
            </div>
            <span className="text-xs text-gray-500 mt-1">{Math.round(progress)}%</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Skeleton Components for Different Content Types
export const SkeletonLoader: React.FC<{
  type: 'text' | 'card' | 'list' | 'form' | 'dashboard';
  lines?: number;
  className?: string;
}> = ({ type, lines = 3, className }) => {
  const renderTextSkeleton = () => (
    <div className="space-y-2">
      {Array.from({ length: lines }, (_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.1 }}
          className={cn(
            'h-4 bg-gray-200 rounded animate-pulse',
            i === 0 && 'w-3/4',
            i === 1 && 'w-full',
            i === 2 && 'w-1/2',
            i > 2 && 'w-5/6'
          )}
        />
      ))}
    </div>
  );

  const renderCardSkeleton = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-gray-200 rounded-lg p-4 space-y-3"
    >
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
          <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded animate-pulse" />
        <div className="h-3 bg-gray-200 rounded animate-pulse w-4/5" />
      </div>
    </motion.div>
  );

  const renderListSkeleton = () => (
    <div className="space-y-3">
      {Array.from({ length: lines }, (_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex items-center space-x-3"
        >
          <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
          <div className="flex-1 h-4 bg-gray-200 rounded animate-pulse" />
          <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
        </motion.div>
      ))}
    </div>
  );

  const renderFormSkeleton = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
        <div className="h-10 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
        <div className="h-10 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/5" />
        <div className="h-20 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="h-10 bg-gray-200 rounded animate-pulse w-1/3" />
    </div>
  );

  const renderDashboardSkeleton = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="h-8 bg-gray-200 rounded animate-pulse w-1/3" />
        <div className="h-8 bg-gray-200 rounded animate-pulse w-24" />
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }, (_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="border border-gray-200 rounded-lg p-4 space-y-3"
          >
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
            <div className="h-8 bg-gray-200 rounded animate-pulse w-1/3" />
          </motion.div>
        ))}
      </div>
      
      {/* Content Area */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded animate-pulse w-1/4" />
          {renderListSkeleton()}
        </div>
      </div>
    </div>
  );

  const content = () => {
    switch (type) {
      case 'card':
        return renderCardSkeleton();
      case 'list':
        return renderListSkeleton();
      case 'form':
        return renderFormSkeleton();
      case 'dashboard':
        return renderDashboardSkeleton();
      default:
        return renderTextSkeleton();
    }
  };

  return (
    <div className={className}>
      {content()}
    </div>
  );
};

// Progressive Loading Component
export const ProgressiveLoader: React.FC<{
  stages: Array<{
    id: string;
    label: string;
    duration: number;
    icon?: React.ReactNode;
  }>;
  currentStage: string;
  onComplete?: () => void;
  className?: string;
}> = ({ stages, currentStage, onComplete, className }) => {
  const currentIndex = stages.findIndex(stage => stage.id === currentStage);
  const [completedStages, setCompletedStages] = useState<string[]>([]);

  useEffect(() => {
    if (currentIndex > 0) {
      const newCompleted = stages.slice(0, currentIndex).map(s => s.id);
      setCompletedStages(newCompleted);
    }
  }, [currentIndex, stages]);

  useEffect(() => {
    if (currentStage === stages[stages.length - 1]?.id && onComplete) {
      const timer = setTimeout(onComplete, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentStage, stages, onComplete]);

  return (
    <div className={cn('space-y-4', className)}>
      <div className="space-y-3">
        {stages.map((stage, index) => {
          const isCompleted = completedStages.includes(stage.id);
          const isCurrent = stage.id === currentStage;
          const isPending = index > currentIndex;

          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'flex items-center space-x-3 p-3 rounded-lg border transition-all',
                isCompleted && 'bg-green-50 border-green-200',
                isCurrent && 'bg-blue-50 border-blue-200',
                isPending && 'bg-gray-50 border-gray-200'
              )}
            >
              <div className={cn(
                'flex items-center justify-center w-8 h-8 rounded-full',
                isCompleted && 'bg-green-500 text-white',
                isCurrent && 'bg-blue-500 text-white',
                isPending && 'bg-gray-300 text-gray-500'
              )}>
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : isCurrent ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    {stage.icon || <Loader2 className="w-5 h-5" />}
                  </motion.div>
                ) : (
                  stage.icon || <div className="w-2 h-2 bg-current rounded-full" />
                )}
              </div>
              
              <div className="flex-1">
                <span className={cn(
                  'font-medium',
                  isCompleted && 'text-green-900',
                  isCurrent && 'text-blue-900',
                  isPending && 'text-gray-500'
                )}>
                  {stage.label}
                </span>
                
                {isCurrent && (
                  <div className="mt-1">
                    <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: stage.duration / 1000, ease: "linear" }}
                        className="h-full bg-blue-500 rounded-full"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              {isCompleted && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-green-500"
                >
                  <CheckCircle className="w-5 h-5" />
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// Smart Loading Placeholder for Pages
export const PageLoadingPlaceholder: React.FC<{
  type: 'generator' | 'dashboard' | 'analytics' | 'settings';
  message?: string;
}> = ({ type, message }) => {
  const getConfig = () => {
    switch (type) {
      case 'generator':
        return {
          icon: <Brain className="w-12 h-12 text-blue-500" />,
          title: 'Carregando Gerador',
          description: 'Preparando IA para criar roteiros incríveis',
          color: 'blue'
        };
      case 'dashboard':
        return {
          icon: <FileText className="w-12 h-12 text-purple-500" />,
          title: 'Carregando Dashboard',
          description: 'Organizando seus projetos e estatísticas',
          color: 'purple'
        };
      case 'analytics':
        return {
          icon: <Sparkles className="w-12 h-12 text-amber-500" />,
          title: 'Carregando Analytics',
          description: 'Analisando performance dos seus roteiros',
          color: 'amber'
        };
      case 'settings':
        return {
          icon: <Zap className="w-12 h-12 text-green-500" />,
          title: 'Carregando Configurações',
          description: 'Preparando opções de personalização',
          color: 'green'
        };
      default:
        return {
          icon: <Loader2 className="w-12 h-12 text-gray-500" />,
          title: 'Carregando',
          description: 'Aguarde um momento...',
          color: 'gray'
        };
    }
  };

  const config = getConfig();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6 max-w-md mx-auto p-8"
      >
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 3, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
          className={cn(
            'mx-auto w-24 h-24 rounded-full flex items-center justify-center',
            `bg-${config.color}-50 border-4 border-${config.color}-200`
          )}
        >
          {config.icon}
        </motion.div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">
            {config.title}
          </h2>
          <p className="text-gray-600">
            {message || config.description}
          </p>
        </div>
        
        <SkeletonLoader type="card" className="mt-8" />
      </motion.div>
    </div>
  );
};

// Error State with Retry
export const ErrorStateWithRetry: React.FC<{
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}> = ({ 
  title = "Ops! Algo deu errado", 
  message = "Não foi possível carregar o conteúdo. Tente novamente.",
  onRetry,
  retryLabel = "Tentar novamente",
  className
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn('text-center space-y-4 p-8', className)}
    >
      <motion.div
        animate={{ 
          rotate: [0, -10, 10, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center"
      >
        <AlertTriangle className="w-8 h-8 text-red-500" />
      </motion.div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-gray-600">{message}</p>
      </div>
      
      {onRetry && (
        <motion.button
          onClick={onRetry}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
        >
          {retryLabel}
        </motion.button>
      )}
    </motion.div>
  );
}; 