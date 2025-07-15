/**
 * 🧠 BANCO DE IDEIAS - IDEA CARD V8.0
 * Reusable idea card component
 * Following V8.0 Unified Development methodology
 */

import React, { useState } from 'react';
import { Layout } from '../../../../design-system/components/Layout';
import { Button } from '../../../../design-system/components/Button';
import { 
  Heart, 
  Share2, 
  Save, 
  Edit3, 
  MoreHorizontal, 
  Tag, 
  Users, 
  Calendar,
  Sparkles,
  TrendingUp,
  Clock
} from 'lucide-react';
import { IdeaResponse, IdeaFeedbackHandler } from '../../types';

// ============================================================================
// IDEA CARD PROPS
// ============================================================================

interface IdeaCardProps {
  idea: IdeaResponse;
  onFeedback?: IdeaFeedbackHandler;
  onEdit?: (idea: IdeaResponse) => void;
  onShare?: (idea: IdeaResponse) => void;
  onSelect?: (idea: IdeaResponse) => void;
  showActions?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
  isSelected?: boolean;
}

// ============================================================================
// IDEA CARD COMPONENT
// ============================================================================

export const IdeaCard: React.FC<IdeaCardProps> = ({
  idea,
  onFeedback,
  onEdit,
  onShare,
  onSelect,
  showActions = true,
  variant = 'default',
  isSelected = false
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showMore, setShowMore] = useState(false);
  
  // ============================================================================
  // HANDLERS
  // ============================================================================
  
  const handleLike = async () => {
    if (onFeedback) {
      await onFeedback(idea.id, 'like');
      setIsLiked(!isLiked);
    }
  };
  
  const handleSave = async () => {
    if (onFeedback) {
      await onFeedback(idea.id, 'save');
      setIsSaved(!isSaved);
    }
  };
  
  const handleShare = () => {
    if (onShare) {
      onShare(idea);
    } else if (onFeedback) {
      onFeedback(idea.id, 'share');
    }
  };
  
  const handleEdit = () => {
    if (onEdit) {
      onEdit(idea);
    }
  };
  
  const handleCardClick = () => {
    if (onSelect) {
      onSelect(idea);
    }
  };
  
  // ============================================================================
  // FORMAT HELPERS
  // ============================================================================
  
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'Data inválida';
    }
  };
  
  const formatDescription = (description: string, maxLength: number = 150) => {
    if (description.length <= maxLength) return description;
    return showMore ? description : `${description.substring(0, maxLength)}...`;
  };
  
  // ============================================================================
  // RENDER VARIANTS
  // ============================================================================
  
  const renderCompactCard = () => (
    <Layout.Card 
      variant={isSelected ? "elevated" : "outlined"} 
      padding="md" 
      className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? 'ring-2 ring-primary-500' : ''}`}
      onClick={handleCardClick}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <Layout.Heading level={4} className="mb-2 truncate">
            {idea.title}
          </Layout.Heading>
          <Layout.Text variant="bodySmall" color="muted" className="line-clamp-2">
            {idea.description}
          </Layout.Text>
          
          {/* Tags */}
          <div className="flex gap-1 mt-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-100 text-primary-800">
              <Tag className="w-3 h-3 mr-1" />
              {idea.category}
            </span>
          </div>
        </div>
        
        {showActions && (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleLike();
              }}
              className={isLiked ? 'text-red-500' : ''}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleSave();
              }}
              className={isSaved ? 'text-blue-500' : ''}
            >
              <Save className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </Button>
          </div>
        )}
      </div>
    </Layout.Card>
  );
  
  const renderDetailedCard = () => (
    <Layout.Card 
      variant={isSelected ? "elevated" : "outlined"} 
      padding="lg" 
      className={`transition-all hover:shadow-md ${isSelected ? 'ring-2 ring-primary-500' : ''}`}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <Layout.Heading level={3} className="mb-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary-600" />
            {idea.title}
          </Layout.Heading>
          
          {/* Metadata */}
          <div className="flex flex-wrap gap-4 text-sm text-neutral-600">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(idea.createdAt)}
            </div>
            {idea.metadata?.source && (
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                {idea.metadata.source === 'generated' ? 'Gerada por IA' : 'Manual'}
              </div>
            )}
          </div>
        </div>
        
        {showActions && (
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={handleEdit}>
              <Edit3 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="space-y-4">
        {/* Description */}
        <div>
          <Layout.Text variant="body" className="leading-relaxed">
            {formatDescription(idea.description, 300)}
          </Layout.Text>
          {idea.description.length > 300 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMore(!showMore)}
              className="mt-2 text-primary-600"
            >
              {showMore ? 'Ver menos' : 'Ver mais'}
            </Button>
          )}
        </div>
        
        {/* Implementation */}
        {idea.implementation && (
          <Layout.Card variant="outlined" padding="md" className="bg-neutral-50">
            <Layout.Text variant="bodySmall" className="font-medium text-neutral-700 mb-2">
              Implementação:
            </Layout.Text>
            <Layout.Text variant="bodySmall" color="muted">
              {idea.implementation}
            </Layout.Text>
          </Layout.Card>
        )}
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800">
            <Tag className="w-3 h-3 mr-1" />
            {idea.category}
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-secondary-100 text-secondary-800">
            <Users className="w-3 h-3 mr-1" />
            {idea.targetAudience}
          </span>
          {idea.keywords.slice(0, 3).map((keyword, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-neutral-100 text-neutral-700"
            >
              {keyword}
            </span>
          ))}
        </div>
      </div>
      
      {/* Actions */}
      {showActions && (
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-neutral-200">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`flex items-center gap-2 ${isLiked ? 'text-red-500' : ''}`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              Curtir
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              className={`flex items-center gap-2 ${isSaved ? 'text-blue-500' : ''}`}
            >
              <Save className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              Salvar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Compartilhar
            </Button>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onFeedback?.(idea.id, 'implement')}
            className="flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Implementar
          </Button>
        </div>
      )}
    </Layout.Card>
  );
  
  const renderDefaultCard = () => (
    <Layout.Card 
      variant={isSelected ? "elevated" : "outlined"} 
      padding="md" 
      className={`transition-all hover:shadow-md ${isSelected ? 'ring-2 ring-primary-500' : ''}`}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <Layout.Heading level={4} className="flex-1 pr-4">
          {idea.title}
        </Layout.Heading>
        
        {showActions && (
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={handleEdit}>
              <Edit3 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
      
      {/* Description */}
      <Layout.Text variant="body" color="muted" className="mb-4">
        {formatDescription(idea.description)}
      </Layout.Text>
      
      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-100 text-primary-800">
          <Tag className="w-3 h-3 mr-1" />
          {idea.category}
        </span>
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-secondary-100 text-secondary-800">
          <Users className="w-3 h-3 mr-1" />
          {idea.targetAudience}
        </span>
      </div>
      
      {/* Footer */}
      <div className="flex justify-between items-center">
        <Layout.Text variant="bodySmall" color="muted" className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatDate(idea.createdAt)}
        </Layout.Text>
        
        {showActions && (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={isLiked ? 'text-red-500' : ''}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              className={isSaved ? 'text-blue-500' : ''}
            >
              <Save className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </Layout.Card>
  );
  
  // ============================================================================
  // RENDER
  // ============================================================================
  
  switch (variant) {
    case 'compact':
      return renderCompactCard();
    case 'detailed':
      return renderDetailedCard();
    default:
      return renderDefaultCard();
  }
};

export default IdeaCard; 