import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Textarea } from './ui/Textarea';
import { Badge } from './ui/Badge';

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
}

const PWAFeedback: React.FC<PWAFeedbackProps> = ({ onClose, isInstalled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<FeedbackData['type']>('suggestion');
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const feedbackTypes = [
    { id: 'installation', label: 'Instalação', emoji: '📱' },
    { id: 'performance', label: 'Performance', emoji: '⚡' },
    { id: 'bug', label: 'Bug/Erro', emoji: '🐛' },
    { id: 'suggestion', label: 'Sugestão', emoji: '💡' },
  ] as const;

  const handleSubmit = async () => {
    if (!message.trim()) return;

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
      // Salvar feedback localmente
      const existingFeedback = JSON.parse(localStorage.getItem('pwa-feedback') || '[]');
      existingFeedback.push(feedbackData);
      localStorage.setItem('pwa-feedback', JSON.stringify(existingFeedback));

      // Em produção, enviar para API
      console.log('PWA Feedback submitted:', feedbackData);

      setSubmitted(true);
      setTimeout(() => {
        setIsOpen(false);
        setSubmitted(false);
        setMessage('');
        onClose?.();
      }, 2000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-white/90 backdrop-blur-sm shadow-lg z-50"
      >
        💬 Feedback
      </Button>
    );
  }

  if (submitted) {
    return (
      <Card className="fixed bottom-4 right-4 w-80 p-4 bg-green-50 border-green-200 shadow-xl z-50">
        <div className="text-center">
          <div className="text-2xl mb-2">✅</div>
          <p className="text-green-800 font-medium">Obrigado pelo feedback!</p>
          <p className="text-green-600 text-sm">Sua opinião nos ajuda a melhorar.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 p-4 bg-white shadow-xl z-50 max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Feedback PWA</h3>
        <Button variant="ghost" size="sm" onClick={handleClose}>
          ✕
        </Button>
      </div>

      {/* Status do PWA */}
      <div className="mb-4 flex gap-2">
        <Badge variant={isInstalled ? 'default' : 'secondary'}>
          {isInstalled ? '📱 Instalado' : '🌐 Navegador'}
        </Badge>
        <Badge variant={navigator.onLine ? 'default' : 'destructive'}>
          {navigator.onLine ? '🟢 Online' : '🔴 Offline'}
        </Badge>
      </div>

      {/* Tipos de Feedback */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo de Feedback
        </label>
        <div className="grid grid-cols-2 gap-2">
          {feedbackTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setFeedbackType(type.id)}
              className={`p-2 text-sm rounded-lg border transition-colors ${
                feedbackType === type.id
                  ? 'bg-blue-50 border-blue-300 text-blue-800'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {type.emoji} {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Avaliação (1-5 estrelas)
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className={`text-2xl transition-colors ${
                star <= rating ? 'text-yellow-400' : 'text-gray-300'
              }`}
            >
              ⭐
            </button>
          ))}
        </div>
      </div>

      {/* Mensagem */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sua experiência
        </label>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={`Conte sua experiência com o ${feedbackType === 'installation' ? 'processo de instalação' : 
            feedbackType === 'performance' ? 'desempenho do app' :
            feedbackType === 'bug' ? 'problema encontrado' : 'sugestão de melhoria'}...`}
          rows={3}
          className="resize-none"
        />
      </div>

      {/* Botões */}
      <div className="flex gap-2">
        <Button
          onClick={handleSubmit}
          disabled={!message.trim() || isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? 'Enviando...' : 'Enviar Feedback'}
        </Button>
        <Button variant="outline" onClick={handleClose}>
          Cancelar
        </Button>
      </div>

      {/* Dica */}
      <p className="text-xs text-gray-500 mt-2 text-center">
        Feedback anônimo • Ajuda a melhorar sua experiência
      </p>
    </Card>
  );
};

export default PWAFeedback; 