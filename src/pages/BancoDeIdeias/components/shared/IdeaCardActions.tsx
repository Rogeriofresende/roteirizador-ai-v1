/**
 * 🧠 BANCO DE IDEIAS - IDEA CARD ACTIONS V8.0
 * Extracted actions component from IdeaCard for V8.0 compliance
 * Following V8.0 Unified Development methodology
 */

import React, { useState } from 'react';
import { Button } from '../../../../design-system/components/Button';
import { 
  Heart, 
  Share2, 
  Save, 
  Edit3, 
  MoreHorizontal,
  TrendingUp
} from 'lucide-react';
import { IdeaResponse, IdeaFeedbackHandler } from '../../types';

// ============================================================================
// IDEA CARD ACTIONS PROPS
// ============================================================================

interface IdeaCardActionsProps {
  idea: IdeaResponse;
  onFeedback?: IdeaFeedbackHandler;
  onEdit?: (idea: IdeaResponse) => void;
  onShare?: (idea: IdeaResponse) => void;
  variant?: 'default' | 'compact' | 'header' | 'footer';
  showLabels?: boolean;
}

// ============================================================================
// IDEA CARD ACTIONS COMPONENT
// ============================================================================

export const IdeaCardActions: React.FC<IdeaCardActionsProps> = ({
  idea,
  onFeedback,
  onEdit,
  onShare,
  variant = 'default',
  showLabels = false
}) => {
  
  // ============================================================================
  // STATE
  // ============================================================================
  
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  
  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  const handleLike = async () => {
    if (!onFeedback) return;
    
    setIsLoading('like');
    try {
      await onFeedback(idea.id, 'like');
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error liking idea:', error);
    } finally {
      setIsLoading(null);
    }
  };
  
  const handleSave = async () => {
    if (!onFeedback) return;
    
    setIsLoading('save');
    try {
      await onFeedback(idea.id, 'save');
      setIsSaved(!isSaved);
    } catch (error) {
      console.error('Error saving idea:', error);
    } finally {
      setIsLoading(null);
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
  
  const handleImplement = async () => {
    if (!onFeedback) return;
    
    setIsLoading('implement');
    try {
      await onFeedback(idea.id, 'implement');
    } catch (error) {
      console.error('Error implementing idea:', error);
    } finally {
      setIsLoading(null);
    }
  };
  
  // ============================================================================
  // RENDER VARIANTS
  // ============================================================================
  
  const renderHeaderActions = () => (
    <div className="flex gap-1">
      <Button variant="ghost" size="sm" onClick={handleEdit}>
        <Edit3 className="w-4 h-4" />
        {showLabels && <span className="ml-1">Editar</span>}
      </Button>
      <Button variant="ghost" size="sm">
        <MoreHorizontal className="w-4 h-4" />
        {showLabels && <span className="ml-1">Menu</span>}
      </Button>
    </div>
  );
  
  const renderFooterActions = () => (
    <div className="flex gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLike}
        disabled={isLoading === 'like'}
        className={isLiked ? 'text-red-500' : ''}
      >
        <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
        {showLabels && <span className="ml-1">Curtir</span>}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSave}
        disabled={isLoading === 'save'}
        className={isSaved ? 'text-blue-500' : ''}
      >
        <Save className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
        {showLabels && <span className="ml-1">Salvar</span>}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleShare}
      >
        <Share2 className="w-4 h-4" />
        {showLabels && <span className="ml-1">Compartilhar</span>}
      </Button>
      <Button
        variant="primary"
        size="sm"
        onClick={handleImplement}
        disabled={isLoading === 'implement'}
      >
        <TrendingUp className="w-4 h-4" />
        {showLabels && <span className="ml-1">Implementar</span>}
      </Button>
    </div>
  );
  
  const renderCompactActions = () => (
    <div className="flex gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLike}
        className={isLiked ? 'text-red-500' : ''}
      >
        <Heart className={`w-3 h-3 ${isLiked ? 'fill-current' : ''}`} />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSave}
        className={isSaved ? 'text-blue-500' : ''}
      >
        <Save className={`w-3 h-3 ${isSaved ? 'fill-current' : ''}`} />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleShare}
      >
        <Share2 className="w-3 h-3" />
      </Button>
    </div>
  );
  
  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  
  switch (variant) {
    case 'header':
      return renderHeaderActions();
    case 'footer':
      return renderFooterActions();
    case 'compact':
      return renderCompactActions();
    default:
      return renderFooterActions();
  }
};

export default IdeaCardActions; 