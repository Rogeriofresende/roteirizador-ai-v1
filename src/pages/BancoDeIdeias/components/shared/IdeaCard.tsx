/**
 * 🧠 BANCO DE IDEIAS - IDEA CARD V8.0 REFACTORED
 * Reusable idea card component - REFACTORED FOR V8.0 COMPLIANCE
 * Following V8.0 Unified Development methodology
 */

import React, { useState } from 'react';
import { Layout } from '../../../../design-system/components/Layout';
import { Button } from '../../../../design-system/components/Button';
import { 
  Tag, 
  Users, 
  Calendar,
  Sparkles,
  Clock
} from 'lucide-react';
import { IdeaResponse, IdeaFeedbackHandler } from '../../types';
import IdeaCardActions from './IdeaCardActions';

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
// IDEA CARD COMPONENT V8.0
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
  
  // ============================================================================
  // STATE
  // ============================================================================
  
  const [showMore, setShowMore] = useState(false);
  
  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };
  
  const formatDescription = (text: string, maxLength: number) => {
    if (text.length <= maxLength || showMore) return text;
    return text.substring(0, maxLength) + '...';
  };
  
  const handleCardClick = () => {
    if (onSelect) {
      onSelect(idea);
    }
  };
  
  // ============================================================================
  // RENDER VARIANTS
  // ============================================================================
  
  const renderCompactCard = () => (
    <Layout.Card 
      variant="outlined" 
      padding="md" 
      className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? 'ring-2 ring-primary-500' : ''}`}
      onClick={handleCardClick}
    >
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <Layout.Text variant="bodyMedium" className="font-semibold mb-1 truncate">
            {idea.title}
          </Layout.Text>
          <Layout.Text variant="bodySmall" color="muted" className="line-clamp-2">
            {idea.description}
          </Layout.Text>
        </div>
        
        {showActions && (
          <IdeaCardActions
            idea={idea}
            onFeedback={onFeedback}
            onEdit={onEdit}
            onShare={onShare}
            variant="compact"
          />
        )}
      </div>
      
      <div className="flex justify-between items-center mt-3">
        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-primary-100 text-primary-800">
          {idea.category}
        </span>
        <Layout.Text variant="bodySmall" color="muted" className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatDate(idea.createdAt)}
        </Layout.Text>
      </div>
    </Layout.Card>
  );
  
  const renderDetailedCard = () => (
    <Layout.Card 
      variant="outlined" 
      padding="lg" 
      className={`transition-all hover:shadow-lg ${isSelected ? 'ring-2 ring-primary-500' : ''}`}
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <Layout.Text variant="h4" className="font-bold mb-2">
            {idea.title}
          </Layout.Text>
          <div className="flex items-center gap-4 text-sm text-neutral-600">
            <span className="flex items-center gap-1">
              <Tag className="w-4 h-4" />
              {idea.category}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {idea.targetAudience}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(idea.createdAt)}
            </span>
          </div>
        </div>
        
        {showActions && (
          <IdeaCardActions
            idea={idea}
            onFeedback={onFeedback}
            onEdit={onEdit}
            onShare={onShare}
            variant="header"
          />
        )}
      </div>
      
      {/* Content */}
      <div className="space-y-4">
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
        
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800">
            <Sparkles className="w-3 h-3 mr-1" />
            {idea.contentType}
          </span>
          {idea.keywords?.map((keyword, index) => (
            <span key={index} className="px-2 py-1 bg-neutral-100 text-neutral-700 rounded-md text-xs">
              {keyword}
            </span>
          ))}
        </div>
      </div>
      
      {/* Footer */}
      {showActions && (
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-neutral-200">
          <Layout.Text variant="bodySmall" color="muted">
            Criado em {formatDate(idea.createdAt)}
          </Layout.Text>
          <IdeaCardActions
            idea={idea}
            onFeedback={onFeedback}
            onEdit={onEdit}
            onShare={onShare}
            variant="footer"
            showLabels={true}
          />
        </div>
      )}
    </Layout.Card>
  );
  
  const renderDefaultCard = () => (
    <Layout.Card 
      variant="outlined" 
      padding="lg" 
      className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? 'ring-2 ring-primary-500' : ''}`}
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <Layout.Text variant="h5" className="font-semibold flex-1">
          {idea.title}
        </Layout.Text>
        
        {showActions && (
          <IdeaCardActions
            idea={idea}
            onFeedback={onFeedback}
            onEdit={onEdit}
            onShare={onShare}
            variant="header"
          />
        )}
      </div>
      
      {/* Content */}
      <Layout.Text variant="body" className="leading-relaxed mb-4">
        {formatDescription(idea.description, 200)}
      </Layout.Text>
      
      {/* Tags and Metadata */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800">
          {idea.category}
        </span>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-neutral-100 text-neutral-700">
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
          <IdeaCardActions
            idea={idea}
            onFeedback={onFeedback}
            onEdit={onEdit}
            onShare={onShare}
            variant="footer"
          />
        )}
      </div>
    </Layout.Card>
  );
  
  // ============================================================================
  // MAIN RENDER
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