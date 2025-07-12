/**
 * 📝 Feedback Collection - Migration Communication
 * 
 * Components for collecting user feedback and satisfaction during migration
 * Real-time satisfaction tracking and feedback analysis
 * 
 * Part of: PRE-WEEK 0 - IA Beta Communication Templates Development
 * Integration: Charlie satisfaction tracking + Alpha cost awareness
 */

import React, { useState, useEffect } from 'react';

// Feedback interfaces
export interface FeedbackData {
  id: string;
  userId: string;
  type: 'satisfaction' | 'feature' | 'bug' | 'suggestion' | 'migration';
  rating?: number; // 1-5 stars
  category: string;
  message: string;
  timestamp: Date;
  costTier?: 'free' | 'premium'; // Alpha integration
  context?: {
    featureUsed?: string;
    migrationStep?: string;
    userAgent?: string;
    pageUrl?: string;
  };
}

export interface SatisfactionSurveyProps {
  isOpen: boolean;
  onSubmit: (feedback: Omit<FeedbackData, 'id' | 'timestamp'>) => void;
  onClose: () => void;
  userId: string;
  costTier?: 'free' | 'premium';
  context?: {
    trigger: 'migration' | 'feature-usage' | 'scheduled' | 'manual';
    featureUsed?: string;
    migrationStep?: string;
  };
}

export interface QuickFeedbackProps {
  position?: 'bottom-right' | 'bottom-left' | 'side';
  onFeedback: (feedback: Omit<FeedbackData, 'id' | 'timestamp'>) => void;
  userId: string;
  costTier?: 'free' | 'premium';
}

export interface RatingComponentProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  size?: 'small' | 'medium' | 'large';
  style?: 'stars' | 'emojis' | 'numbers';
}

// Star Rating Component
export const RatingComponent: React.FC<RatingComponentProps> = ({
  value,
  onChange,
  max = 5,
  size = 'medium',
  style = 'stars'
}) => {
  const [hoverValue, setHoverValue] = useState(0);

  const sizes = {
    small: { fontSize: '16px', gap: '4px' },
    medium: { fontSize: '24px', gap: '6px' },
    large: { fontSize: '32px', gap: '8px' }
  };

  const getIcon = (index: number) => {
    const isActive = index <= (hoverValue || value);
    
    switch (style) {
      case 'emojis':
        const emojis = ['😞', '🙁', '😐', '🙂', '😍'];
        return emojis[index - 1] || '😐';
      case 'numbers':
        return index.toString();
      case 'stars':
      default:
        return isActive ? '⭐' : '☆';
    }
  };

  const getColor = (index: number) => {
    const isActive = index <= (hoverValue || value);
    
    if (style === 'emojis') return 'transparent';
    if (style === 'numbers') return isActive ? '#3b82f6' : '#d1d5db';
    
    return isActive ? '#fbbf24' : '#d1d5db';
  };

  return (
    <div style={{ 
      display: 'flex', 
      gap: sizes[size].gap,
      alignItems: 'center'
    }}>
      {Array.from({ length: max }, (_, i) => i + 1).map(index => (
        <button
          key={index}
          onClick={() => onChange(index)}
          onMouseEnter={() => setHoverValue(index)}
          onMouseLeave={() => setHoverValue(0)}
          style={{
            background: 'transparent',
            border: style === 'numbers' ? '2px solid' : 'none',
            borderColor: getColor(index),
            borderRadius: style === 'numbers' ? '50%' : '0',
            color: getColor(index),
            fontSize: sizes[size].fontSize,
            cursor: 'pointer',
            padding: style === 'numbers' ? '8px' : '4px',
            minWidth: style === 'numbers' ? '40px' : 'auto',
            minHeight: style === 'numbers' ? '40px' : 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
        >
          {getIcon(index)}
        </button>
      ))}
    </div>
  );
};

// Satisfaction Survey Modal
export const SatisfactionSurvey: React.FC<SatisfactionSurveyProps> = ({
  isOpen,
  onSubmit,
  onClose,
  userId,
  costTier = 'free',
  context
}) => {
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { id: 'interface', label: 'Interface e Design', icon: '🎨' },
    { id: 'performance', label: 'Performance', icon: '⚡' },
    { id: 'features', label: 'Funcionalidades', icon: '🛠️' },
    { id: 'usability', label: 'Facilidade de Uso', icon: '👆' },
    { id: 'overall', label: 'Experiência Geral', icon: '⭐' }
  ];

  const handleSubmit = async () => {
    if (rating === 0) return;

    setIsSubmitting(true);

    const feedback: Omit<FeedbackData, 'id' | 'timestamp'> = {
      userId,
      type: 'satisfaction',
      rating,
      category: category || 'overall',
      message,
      costTier,
      context: {
        featureUsed: context?.featureUsed,
        migrationStep: context?.migrationStep,
        pageUrl: window.location.href,
        userAgent: navigator.userAgent
      }
    };

    try {
      await onSubmit(feedback);
      onClose();
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

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
    >
      <div
        style={{
          background: 'white',
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '500px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: '700', 
            color: '#1f2937',
            marginBottom: '8px'
          }}>
            Como está sua experiência?
          </h2>
          
          {costTier === 'premium' && (
            <div style={{ 
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '600',
              marginBottom: '8px'
            }}>
              ⭐ USUÁRIO PREMIUM
            </div>
          )}
          
          <p style={{ fontSize: '16px', color: '#6b7280' }}>
            {context?.trigger === 'migration' 
              ? 'Como você está se sentindo com as mudanças?'
              : 'Sua opinião é muito importante para nós!'
            }
          </p>
        </div>

        {/* Rating */}
        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <label style={{ 
            display: 'block',
            fontSize: '14px', 
            fontWeight: '600', 
            color: '#374151',
            marginBottom: '12px'
          }}>
            Avaliação Geral
          </label>
          
          <RatingComponent
            value={rating}
            onChange={setRating}
            size="large"
            style="emojis"
          />
          
          <div style={{ 
            fontSize: '12px', 
            color: '#6b7280',
            marginTop: '8px'
          }}>
            {rating === 0 ? 'Clique para avaliar' :
             rating === 1 ? 'Muito insatisfeito' :
             rating === 2 ? 'Insatisfeito' :
             rating === 3 ? 'Neutro' :
             rating === 4 ? 'Satisfeito' : 'Muito satisfeito'}
          </div>
        </div>

        {/* Category */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ 
            display: 'block',
            fontSize: '14px', 
            fontWeight: '600', 
            color: '#374151',
            marginBottom: '12px'
          }}>
            Categoria (opcional)
          </label>
          
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '8px'
          }}>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                style={{
                  background: category === cat.id ? '#eff6ff' : '#f9fafb',
                  border: `2px solid ${category === cat.id ? '#3b82f6' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  padding: '12px 8px',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: category === cat.id ? '#1e40af' : '#6b7280',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '16px', marginBottom: '4px' }}>
                  {cat.icon}
                </div>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Message */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ 
            display: 'block',
            fontSize: '14px', 
            fontWeight: '600', 
            color: '#374151',
            marginBottom: '8px'
          }}>
            Comentários (opcional)
          </label>
          
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={
              rating <= 2 
                ? "O que podemos melhorar?"
                : rating >= 4 
                ? "O que você mais gostou?"
                : "Conte-nos sua experiência..."
            }
            style={{
              width: '100%',
              minHeight: '80px',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
          />
        </div>

        {/* Context info */}
        {context && (
          <div style={{
            background: '#f9fafb',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              Contexto: {context.trigger === 'migration' ? 'Migração do sistema' : 
                        context.trigger === 'feature-usage' ? `Uso da funcionalidade: ${context.featureUsed}` :
                        'Pesquisa de satisfação'}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ 
          display: 'flex', 
          gap: '12px',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              color: '#6b7280',
              border: '1px solid #d1d5db',
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Agora não
          </button>

          <button
            onClick={handleSubmit}
            disabled={rating === 0 || isSubmitting}
            style={{
              background: rating === 0 || isSubmitting ? '#f3f4f6' : 'linear-gradient(135deg, #3b82f6, #2563eb)',
              color: rating === 0 || isSubmitting ? '#9ca3af' : 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: rating === 0 || isSubmitting ? 'not-allowed' : 'pointer'
            }}
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Avaliação'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Quick Feedback Widget
export const QuickFeedback: React.FC<QuickFeedbackProps> = ({
  position = 'bottom-right',
  onFeedback,
  userId,
  costTier = 'free'
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'quick' | 'detailed'>('quick');
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');

  const positionStyles = {
    'bottom-right': { bottom: '20px', right: '20px' },
    'bottom-left': { bottom: '20px', left: '20px' },
    'side': { top: '50%', right: '0', transform: 'translateY(-50%)' }
  };

  const handleQuickRating = async (ratingValue: number) => {
    const feedback: Omit<FeedbackData, 'id' | 'timestamp'> = {
      userId,
      type: 'satisfaction',
      rating: ratingValue,
      category: 'quick-feedback',
      message: '',
      costTier,
      context: {
        pageUrl: window.location.href,
        userAgent: navigator.userAgent
      }
    };

    await onFeedback(feedback);
    setIsExpanded(false);
    setRating(0);
  };

  const handleDetailedSubmit = async () => {
    if (rating === 0 && !message.trim()) return;

    const feedback: Omit<FeedbackData, 'id' | 'timestamp'> = {
      userId,
      type: message.toLowerCase().includes('bug') ? 'bug' : 'suggestion',
      rating: rating || undefined,
      category: 'detailed-feedback',
      message: message.trim(),
      costTier,
      context: {
        pageUrl: window.location.href,
        userAgent: navigator.userAgent
      }
    };

    await onFeedback(feedback);
    setIsExpanded(false);
    setFeedbackType('quick');
    setRating(0);
    setMessage('');
  };

  return (
    <div
      style={{
        position: 'fixed',
        ...positionStyles[position],
        zIndex: 9999
      }}
    >
      {!isExpanded ? (
        // Collapsed state
        <button
          onClick={() => setIsExpanded(true)}
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            color: 'white',
            border: 'none',
            borderRadius: position === 'side' ? '8px 0 0 8px' : '50%',
            width: position === 'side' ? '60px' : '56px',
            height: '56px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            transition: 'transform 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          💬
        </button>
      ) : (
        // Expanded state
        <div
          style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            width: '280px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
            border: '1px solid #e2e8f0'
          }}
        >
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <h4 style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              color: '#1f2937',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              💬 Feedback
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
            </h4>
            
            <button
              onClick={() => setIsExpanded(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#9ca3af',
                fontSize: '18px',
                cursor: 'pointer'
              }}
            >
              ×
            </button>
          </div>

          {feedbackType === 'quick' ? (
            // Quick feedback
            <div>
              <p style={{ 
                fontSize: '14px', 
                color: '#6b7280',
                marginBottom: '16px'
              }}>
                Como está sua experiência?
              </p>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}>
                {[1, 2, 3, 4, 5].map(value => (
                  <button
                    key={value}
                    onClick={() => handleQuickRating(value)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      fontSize: '24px',
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: '4px',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {value === 1 ? '😞' : value === 2 ? '🙁' : value === 3 ? '😐' : value === 4 ? '🙂' : '😍'}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setFeedbackType('detailed')}
                style={{
                  background: 'transparent',
                  color: '#3b82f6',
                  border: 'none',
                  fontSize: '12px',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  width: '100%',
                  textAlign: 'center'
                }}
              >
                Deixar comentário detalhado
              </button>
            </div>
          ) : (
            // Detailed feedback
            <div>
              <div style={{ marginBottom: '12px' }}>
                <RatingComponent
                  value={rating}
                  onChange={setRating}
                  size="small"
                  style="stars"
                />
              </div>
              
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Conte-nos sua experiência..."
                style={{
                  width: '100%',
                  minHeight: '60px',
                  padding: '8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '12px',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  marginBottom: '12px'
                }}
              />
              
              <div style={{ 
                display: 'flex', 
                gap: '8px',
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={() => setFeedbackType('quick')}
                  style={{
                    background: 'transparent',
                    color: '#6b7280',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Voltar
                </button>
                
                <button
                  onClick={handleDetailedSubmit}
                  disabled={rating === 0 && !message.trim()}
                  style={{
                    background: (rating === 0 && !message.trim()) ? '#f3f4f6' : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                    color: (rating === 0 && !message.trim()) ? '#9ca3af' : 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: (rating === 0 && !message.trim()) ? 'not-allowed' : 'pointer'
                  }}
                >
                  Enviar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Feedback Analytics Hook (for Charlie integration)
export const useFeedbackAnalytics = () => {
  const [feedbackData, setFeedbackData] = useState<FeedbackData[]>([]);

  const addFeedback = (feedback: Omit<FeedbackData, 'id' | 'timestamp'>) => {
    const newFeedback: FeedbackData = {
      ...feedback,
      id: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    setFeedbackData(prev => [...prev, newFeedback]);
    
    // Report to Charlie monitoring system
    reportFeedbackToCharlie(newFeedback);
    
    return newFeedback;
  };

  const getAnalytics = () => {
    const analytics = {
      totalFeedback: feedbackData.length,
      averageRating: 0,
      satisfactionTrend: [] as number[],
      categoryBreakdown: {} as Record<string, number>,
      costTierComparison: {
        free: { count: 0, avgRating: 0 },
        premium: { count: 0, avgRating: 0 }
      }
    };

    if (feedbackData.length === 0) return analytics;

    // Calculate average rating
    const ratingsOnly = feedbackData.filter(f => f.rating !== undefined);
    if (ratingsOnly.length > 0) {
      analytics.averageRating = ratingsOnly.reduce((sum, f) => sum + (f.rating || 0), 0) / ratingsOnly.length;
    }

    // Category breakdown
    feedbackData.forEach(f => {
      analytics.categoryBreakdown[f.category] = (analytics.categoryBreakdown[f.category] || 0) + 1;
    });

    // Cost tier comparison
    feedbackData.forEach(f => {
      const tier = f.costTier || 'free';
      analytics.costTierComparison[tier].count++;
      if (f.rating) {
        analytics.costTierComparison[tier].avgRating += f.rating;
      }
    });

    // Calculate averages for cost tiers
    if (analytics.costTierComparison.free.count > 0) {
      analytics.costTierComparison.free.avgRating /= analytics.costTierComparison.free.count;
    }
    if (analytics.costTierComparison.premium.count > 0) {
      analytics.costTierComparison.premium.avgRating /= analytics.costTierComparison.premium.count;
    }

    return analytics;
  };

  return {
    feedbackData,
    addFeedback,
    getAnalytics
  };
};

// Helper function to report feedback to Charlie monitoring system
const reportFeedbackToCharlie = (feedback: FeedbackData) => {
  // Charlie monitoring integration
  console.log('📊 Feedback reported to Charlie:', {
    userId: feedback.userId,
    type: feedback.type,
    rating: feedback.rating,
    category: feedback.category,
    costTier: feedback.costTier,
    timestamp: feedback.timestamp
  });
};

export default {
  RatingComponent,
  SatisfactionSurvey,
  QuickFeedback,
  useFeedbackAnalytics
}; 