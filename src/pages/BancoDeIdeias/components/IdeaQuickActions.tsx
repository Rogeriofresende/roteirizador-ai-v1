/**
 * 🧠 BANCO DE IDEIAS - QUICK ACTIONS V8.0
 * Floating action buttons and quick access modals
 * Following V8.0 Unified Development methodology - Frontend Phase
 */

import React, { useState, useEffect } from 'react';
import { Layout } from '../../../design-system/components/Layout';
import { Button } from '../../../design-system/components/Button';
import { Input } from '../../../design-system/components/Input';
import { Select } from '../../../design-system/components/form/Select';
import { 
  Plus, 
  Zap, 
  Download, 
  Share2, 
  X,
  Sparkles,
  FileText,
  Search,
  BookOpen,
  Target,
  Hash,
  Clock,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

import { IdeaFormData, IdeaResponse } from '../types';
import { CATEGORY_OPTIONS, DEFAULT_FORM_DATA } from '../constants';

// ============================================================================
// QUICK ACTIONS PROPS
// ============================================================================

interface IdeaQuickActionsProps {
  onQuickAdd: (data: Partial<IdeaResponse>) => Promise<void>;
  onQuickGenerate: (formData: Partial<IdeaFormData>) => Promise<void>;
  onExport: () => void;
  onShare: () => void;
  className?: string;
}

// ============================================================================
// QUICK ACTION TYPES
// ============================================================================

interface QuickIdeaData {
  title: string;
  description: string;
  category: string;
  tags: string[];
}

// ============================================================================
// MAIN QUICK ACTIONS COMPONENT
// ============================================================================

export const IdeaQuickActions: React.FC<IdeaQuickActionsProps> = ({
  onQuickAdd,
  onQuickGenerate,
  onExport,
  onShare,
  className = ''
}) => {
  
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showQuickGenerate, setShowQuickGenerate] = useState(false);
  const [actionsExpanded, setActionsExpanded] = useState(false);
  
  const [quickIdeaData, setQuickIdeaData] = useState<QuickIdeaData>({
    title: '',
    description: '',
    category: '',
    tags: []
  });
  
  const [quickFormData, setQuickFormData] = useState<Partial<IdeaFormData>>({
    category: DEFAULT_FORM_DATA.category,
    targetAudience: DEFAULT_FORM_DATA.targetAudience,
    keywordsInput: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // ============================================================================
  // KEYBOARD SHORTCUTS
  // ============================================================================
  
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + N = Quick Add
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        setShowQuickAdd(true);
      }
      
      // Ctrl/Cmd + G = Quick Generate
      if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
        e.preventDefault();
        setShowQuickGenerate(true);
      }
      
      // Escape = Close modals
      if (e.key === 'Escape') {
        setShowQuickAdd(false);
        setShowQuickGenerate(false);
        setActionsExpanded(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);
  
  // ============================================================================
  // HANDLERS
  // ============================================================================
  
  const handleQuickAdd = async () => {
    if (!quickIdeaData.title.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      await onQuickAdd({
        title: quickIdeaData.title,
        description: quickIdeaData.description || `Ideia sobre ${quickIdeaData.title}`,
        category: quickIdeaData.category || 'Marketing & Growth',
        keywords: quickIdeaData.tags,
        createdAt: new Date().toISOString(),
        id: `quick_${Date.now()}`,
        targetAudience: 'Startups',
        contentType: 'Posts',
        difficulty: 'intermediate',
        implementation: '',
        savedAt: new Date().toISOString(),
        metadata: {
          source: 'manual'
        }
      });
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      
      // Reset form
      setQuickIdeaData({
        title: '',
        description: '',
        category: '',
        tags: []
      });
      
      setShowQuickAdd(false);
      
    } catch (error) {
      console.error('Erro ao adicionar ideia:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleQuickGenerate = async () => {
    setIsSubmitting(true);
    
    try {
      const keywords = quickFormData.keywordsInput
        ?.split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0) || [];
      
      await onQuickGenerate({
        ...quickFormData,
        keywords,
        style: 'Startups',
        contentType: 'Posts',
        difficulty: 'intermediate'
      });
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      
      setShowQuickGenerate(false);
      
    } catch (error) {
      console.error('Erro ao gerar ideia:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleTagsChange = (value: string) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    setQuickIdeaData(prev => ({ ...prev, tags }));
  };
  
  // ============================================================================
  // FLOATING ACTION BUTTON
  // ============================================================================
  
  const renderFloatingActions = () => (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      {/* Expanded Actions */}
      {actionsExpanded && (
        <div className="mb-4 space-y-3 animate-slide-up">
          <Button
            onClick={() => {
              setShowQuickAdd(true);
              setActionsExpanded(false);
            }}
            className="w-full flex items-center gap-3 shadow-lg"
            variant="secondary"
          >
            <Plus className="w-5 h-5" />
            Adicionar Ideia
            <span className="text-xs opacity-75">Ctrl+N</span>
          </Button>
          
          <Button
            onClick={() => {
              setShowQuickGenerate(true);
              setActionsExpanded(false);
            }}
            className="w-full flex items-center gap-3 shadow-lg"
            variant="secondary"
          >
            <Zap className="w-5 h-5" />
            Gerar Rápido
            <span className="text-xs opacity-75">Ctrl+G</span>
          </Button>
          
          <Button
            onClick={onExport}
            className="w-full flex items-center gap-3 shadow-lg"
            variant="secondary"
          >
            <Download className="w-5 h-5" />
            Exportar Tudo
          </Button>
          
          <Button
            onClick={onShare}
            className="w-full flex items-center gap-3 shadow-lg"
            variant="secondary"
          >
            <Share2 className="w-5 h-5" />
            Compartilhar
          </Button>
        </div>
      )}
      
      {/* Main FAB */}
      <Button
        onClick={() => setActionsExpanded(!actionsExpanded)}
        size="lg"
        className={`
          w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300
          ${actionsExpanded ? 'rotate-45' : ''}
        `}
      >
        {actionsExpanded ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
      </Button>
    </div>
  );
  
  // ============================================================================
  // QUICK ADD MODAL
  // ============================================================================
  
  const renderQuickAddModal = () => {
    if (!showQuickAdd) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <Layout.Card variant="elevated" padding="lg" className="w-full max-w-md mx-4">
          <div className="flex justify-between items-center mb-6">
            <Layout.Heading level={3} className="flex items-center gap-2">
              <Plus className="w-6 h-6 text-primary-600" />
              Adicionar Ideia Rápida
            </Layout.Heading>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowQuickAdd(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Título da Ideia *
              </label>
              <Input
                value={quickIdeaData.title}
                onChange={(e) => setQuickIdeaData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Video sobre marketing para startups"
                className="w-full"
                autoFocus
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Descrição (opcional)
              </label>
              <Input
                value={quickIdeaData.description}
                onChange={(e) => setQuickIdeaData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Breve descrição da ideia..."
                className="w-full"
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Categoria
              </label>
              <Select
                value={quickIdeaData.category}
                onChange={(value) => setQuickIdeaData(prev => ({ ...prev, category: value }))}
                options={[
                  { value: '', label: 'Selecione uma categoria...' },
                  ...CATEGORY_OPTIONS
                ]}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Tags (separadas por vírgula)
              </label>
              <Input
                value={quickIdeaData.tags.join(', ')}
                onChange={(e) => handleTagsChange(e.target.value)}
                placeholder="marketing, startup, video, growth"
                className="w-full"
              />
            </div>
          </div>
          
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowQuickAdd(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleQuickAdd}
              disabled={!quickIdeaData.title.trim() || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Adicionar
                </>
              )}
            </Button>
          </div>
        </Layout.Card>
      </div>
    );
  };
  
  // ============================================================================
  // QUICK GENERATE MODAL
  // ============================================================================
  
  const renderQuickGenerateModal = () => {
    if (!showQuickGenerate) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <Layout.Card variant="elevated" padding="lg" className="w-full max-w-md mx-4">
          <div className="flex justify-between items-center mb-6">
            <Layout.Heading level={3} className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-primary-600" />
              Geração Rápida
            </Layout.Heading>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowQuickGenerate(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Categoria
              </label>
              <Select
                value={quickFormData.category || ''}
                onChange={(value) => setQuickFormData(prev => ({ ...prev, category: value as any }))}
                options={CATEGORY_OPTIONS}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Público-Alvo
              </label>
              <Select
                value={quickFormData.targetAudience || ''}
                onChange={(value) => setQuickFormData(prev => ({ ...prev, targetAudience: value as any }))}
                options={[
                  { value: 'Startups', label: 'Startups' },
                  { value: 'Jovens', label: 'Jovens' },
                  { value: 'Profissionais', label: 'Profissionais' },
                  { value: 'Empreendedores', label: 'Empreendedores' }
                ]}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Palavras-chave
              </label>
              <Input
                value={quickFormData.keywordsInput || ''}
                onChange={(e) => setQuickFormData(prev => ({ ...prev, keywordsInput: e.target.value }))}
                placeholder="growth, marketing, saas, produto"
                className="w-full"
                autoFocus
              />
              <p className="text-xs text-neutral-500 mt-1">
                Separe as palavras-chave com vírgula
              </p>
            </div>
          </div>
          
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowQuickGenerate(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleQuickGenerate}
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Gerar
                </>
              )}
            </Button>
          </div>
        </Layout.Card>
      </div>
    );
  };
  
  // ============================================================================
  // SUCCESS MESSAGE
  // ============================================================================
  
  const renderSuccessMessage = () => {
    if (!showSuccess) return null;
    
    return (
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-5 h-5" />
          Ação realizada com sucesso!
        </div>
      </div>
    );
  };
  
  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  
  return (
    <>
      {renderFloatingActions()}
      {renderQuickAddModal()}
      {renderQuickGenerateModal()}
      {renderSuccessMessage()}
      
      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default IdeaQuickActions; 