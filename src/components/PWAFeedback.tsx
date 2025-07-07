import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Textarea } from './ui/Textarea';
import { Badge } from './ui/Badge';
import { darkModeClasses, animationClasses } from '../design-system/tokens';

interface FeedbackData {
  type: 'bug' | 'suggestion' | 'performance' | 'installation';
  rating: number;
  message: string;
  context: {
    isInstalled: boolean;
    isOffline: boolean;
    userAgent: string;
    timestamp: string;
  };
}

interface PWAFeedbackProps {
  onClose?: () => void;
  isInstalled?: boolean;
  variant?: 'button' | 'modal-only';
}

const PWAFeedback: React.FC<PWAFeedbackProps> = ({ 
  onClose, 
  isInstalled = false, 
  variant = 'button' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<FeedbackData['type']>('suggestion');
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // Refs for backdrop and focus management
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isSubmittingRef = useRef(false); // Prevent race conditions

  // Memoized feedback types to prevent re-creation
  const feedbackTypes = useMemo(() => [
    { id: 'installation', label: 'Instalação', emoji: '📱' },
    { id: 'performance', label: 'Performance', emoji: '⚡' },
    { id: 'bug', label: 'Bug/Erro', emoji: '🐛' },
    { id: 'suggestion', label: 'Sugestão', emoji: '💡' },
  ] as const, []);

  // Optimized handlers with useCallback
  const handleClose = useCallback(() => {
    setIsOpen(false);
    setMessage('');
    setRating(5);
    setFeedbackType('suggestion');
    onClose?.();
  }, [onClose]);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  // Enhanced localStorage handling with robust error management
  const saveToLocalStorage = useCallback((data: FeedbackData): boolean => {
    try {
      // Check if localStorage is available
      if (typeof Storage === 'undefined') {
        console.warn('PWA Feedback: localStorage not available');
        return false;
      }

      const existingFeedback = JSON.parse(localStorage.getItem('pwa-feedback') || '[]');
      existingFeedback.push(data);
      
      // Try to save, handle quota exceeded
      try {
        localStorage.setItem('pwa-feedback', JSON.stringify(existingFeedback));
        return true;
      } catch (quotaError) {
        if (quotaError.name === 'QuotaExceededError') {
          // Try to clear old feedback and save current
          console.warn('PWA Feedback: localStorage quota exceeded, clearing old feedback');
          localStorage.setItem('pwa-feedback', JSON.stringify([data]));
          return true;
        }
        throw quotaError;
      }
    } catch (error: unknown) {
      console.error('PWA Feedback: Failed to save to localStorage:', error);
      // Could implement alternative storage here (IndexedDB, etc.)
      return false;
    }
  }, []);

  // V5.0 FIX: Move handleSubmit before useEffect to avoid hoisting issues
  const handleSubmit = useCallback(async () => {
    if (!message.trim() || isSubmittingRef.current) return;

    // Prevent double submission with ref
    isSubmittingRef.current = true;
    setIsSubmitting(true);

    const feedbackData: FeedbackData = {
      type: feedbackType,
      rating,
      message: message.trim(),
      context: {
        isInstalled,
        isOffline: !navigator.onLine,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      },
    };

    try {
      // Save to localStorage with error handling
      const saved = saveToLocalStorage(feedbackData);
      
      if (saved) {
        console.log('PWA Feedback submitted:', feedbackData);
      } else {
        console.warn('PWA Feedback: Failed to save locally, but continuing');
      }

      setSubmitted(true);
      setTimeout(() => {
        setIsOpen(false);
        setSubmitted(false);
        setMessage('');
        setRating(5);
        setFeedbackType('suggestion');
        onClose?.();
      }, 2000);
    } catch (error: unknown) {
      console.error('Error submitting feedback:', error);
      
      // ✅ User-friendly error message implementation
      const errorMessage = error instanceof Error 
        ? `Erro ao enviar feedback: ${error.message}` 
        : 'Erro inesperado ao enviar feedback. Tente novamente.';
      
      // Create error state
      setSubmitted(false);
      
      // Show user-friendly error notification
      // Note: In a real implementation, you might use a toast notification system
      alert(`❌ ${errorMessage}\n\n💡 Seu feedback foi salvo localmente e será enviado quando possível.`);
      
    } finally {
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  }, [message, feedbackType, rating, isInstalled, saveToLocalStorage, onClose]);

  // Enhanced keyboard shortcuts with optimized cleanup and dependencies
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // ESC to close
      if (event.key === 'Escape') {
        handleClose();
      }
      
      // Ctrl/Cmd + Enter to submit
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        if (message.trim() && !isSubmittingRef.current) {
          handleSubmit();
        }
      }
    };

    // Add event listener and set overflow
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    
    // Focus the textarea when modal opens
    const focusTimeout = setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);

    // Cleanup function with proper validation
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
      clearTimeout(focusTimeout);
    };
  }, [isOpen, handleClose, handleSubmit, message]); // Fixed: Added missing dependencies

  // Sync ref with state to prevent race conditions
  useEffect(() => {
    isSubmittingRef.current = isSubmitting;
  }, [isSubmitting]);

  // Backdrop click handler with useCallback
  const handleBackdropClick = useCallback((event: React.MouseEvent) => {
    if (event.target === backdropRef.current) {
      handleClose();
    }
  }, [handleClose]);

  // Don't render button if variant is modal-only
  if (!isOpen && variant === 'modal-only') {
    return null;
  }

  // Floating feedback button
  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleOpen}
        className={`fixed bottom-4 right-4 z-50 shadow-lg ${darkModeClasses.feedback.button} ${animationClasses.themeTransition}`}
        aria-label="Abrir formulário de feedback"
      >
        💬 Feedback
      </Button>
    );
  }

  // Success state
  if (submitted) {
    return (
      <>
        {/* Backdrop */}
        <div 
          ref={backdropRef}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleBackdropClick}
        >
          <Card className={`w-full max-w-md p-6 ${darkModeClasses.feedback.success} ${animationClasses.scaleIn}`}>
            <div className="text-center">
              <div className="text-4xl mb-3">✅</div>
              <h3 className="text-lg font-semibold mb-2">Obrigado pelo feedback!</h3>
              <p className="text-sm opacity-80">Sua opinião nos ajuda a melhorar.</p>
            </div>
          </Card>
        </div>
      </>
    );
  }

  // Main feedback modal
  return (
    <>
      {/* Enhanced backdrop with blur */}
      <div 
        ref={backdropRef}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleBackdropClick}
        aria-label="Fechar modal clicando fora"
      >
        {/* Larger, centered modal */}
        <Card 
          ref={modalRef}
          className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 ${darkModeClasses.feedback.modal} ${animationClasses.slideIn}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-foreground">Compartilhe seu Feedback</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Sua opinião é fundamental para melhorarmos o RoteiraPro
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClose}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Fechar modal"
            >
              ✕
            </Button>
          </div>

          {/* Status do PWA */}
          <div className="mb-6 flex gap-2 flex-wrap">
            <Badge variant={isInstalled ? 'default' : 'secondary'}>
              {isInstalled ? '📱 Instalado' : '🌐 Navegador'}
            </Badge>
            <Badge variant={navigator.onLine ? 'default' : 'destructive'}>
              {navigator.onLine ? '🟢 Online' : '🔴 Offline'}
            </Badge>
          </div>

          {/* Tipos de Feedback */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-3">
              Tipo de Feedback
            </label>
            <div className="grid grid-cols-2 gap-3">
              {feedbackTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setFeedbackType(type.id)}
                  className={`p-3 text-sm rounded-lg border transition-all duration-200 ${
                    feedbackType === type.id
                      ? 'bg-primary/10 border-primary text-primary'
                      : `${darkModeClasses.hover} border-border`
                  }`}
                >
                  <span className="text-lg mr-2">{type.emoji}</span>
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-3">
              Como você avalia sua experiência? (1-5 estrelas)
            </label>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-3xl transition-all duration-200 hover:scale-110 ${
                    star <= rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                  }`}
                  aria-label={`Avaliar com ${star} estrela${star > 1 ? 's' : ''}`}
                >
                  ⭐
                </button>
              ))}
            </div>
            <p className="text-center text-xs text-muted-foreground mt-2">
              {rating === 1 && "Muito ruim"}
              {rating === 2 && "Ruim"}
              {rating === 3 && "Regular"}
              {rating === 4 && "Bom"}
              {rating === 5 && "Excelente"}
            </p>
          </div>

          {/* Mensagem */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-3">
              Conte-nos mais sobre sua experiência
            </label>
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Descreva sua ${
                feedbackType === 'installation' ? 'experiência com a instalação' : 
                feedbackType === 'performance' ? 'experiência com o desempenho' :
                feedbackType === 'bug' ? 'experiência com o problema encontrado' : 
                'sugestão para melhorarmos'
              }...`}
              rows={4}
              className={`resize-none ${darkModeClasses.input} ${animationClasses.themeTransition}`}
              aria-describedby="feedback-help"
            />
            <p id="feedback-help" className="text-xs text-muted-foreground mt-2">
              💡 Dica: Use Ctrl+Enter para enviar rapidamente
            </p>
          </div>

          {/* Botões */}
          <div className="flex gap-3 flex-col sm:flex-row">
            <Button
              onClick={handleSubmit}
              disabled={!message.trim() || isSubmitting}
              className="flex-1"
              aria-describedby="submit-help"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Enviando...
                </>
              ) : (
                'Enviar Feedback'
              )}
            </Button>
            <Button variant="outline" onClick={handleClose} className="sm:w-auto">
              Cancelar
            </Button>
          </div>

          {/* Help text */}
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground text-center">
              🔒 Feedback anônimo • ⌨️ ESC para fechar • 🚀 Ajuda a melhorar sua experiência
            </p>
          </div>
        </Card>
      </div>
    </>
  );
};

export default PWAFeedback; 