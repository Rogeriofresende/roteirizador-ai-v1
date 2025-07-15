/**
 * 🧠 BANCO DE IDEIAS - IDEA HISTORY V8.0
 * Idea history component extracted from monolithic BancoDeIdeias.tsx
 * Following V8.0 Unified Development methodology
 */

import React from 'react';
import { Layout } from '../../../../design-system/components/Layout';
import { Button } from '../../../../design-system/components/Button';
import { BarChart3, Plus, Search, Filter } from 'lucide-react';

import { IdeaHistoryProps } from '../../types';
import { LoadingStates } from '../shared/LoadingStates';
import ErrorBoundary from '../shared/ErrorBoundary';
import IdeaCard from '../shared/IdeaCard';

// ============================================================================
// IDEA HISTORY COMPONENT
// ============================================================================

const IdeaHistory: React.FC<IdeaHistoryProps> = ({
  onQuickAdd,
  ideas,
  loading,
  onIdeaSelect
}) => {
  
  // ============================================================================
  // HEADER SECTION
  // ============================================================================
  
  const renderHeader = () => (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <Layout.Heading level={3} className="flex items-center gap-2">
        <BarChart3 className="w-6 h-6 text-primary-600" />
        Histórico de Ideias
      </Layout.Heading>
      
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Search className="w-4 h-4" />
          <span className="hidden sm:inline">Buscar</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          <span className="hidden sm:inline">Filtrar</span>
        </Button>
        
        <Button
          onClick={onQuickAdd}
          variant="default"
          size="sm"
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Adicionar</span>
        </Button>
      </div>
    </div>
  );
  
  // ============================================================================
  // EMPTY STATE
  // ============================================================================
  
  const renderEmptyState = () => (
    <Layout.Card variant="outlined" padding="lg" className="text-center">
      <div className="space-y-4">
        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto">
          <BarChart3 className="w-8 h-8 text-neutral-400" />
        </div>
        
        <div className="space-y-2">
          <Layout.Heading level={4} className="text-neutral-700">
            Nenhuma ideia encontrada
          </Layout.Heading>
          <Layout.Text variant="body" color="muted">
            Comece gerando sua primeira ideia ou adicione uma manualmente.
          </Layout.Text>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={onQuickAdd}
            variant="default"
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Adicionar Ideia
          </Button>
          
          <Button
            variant="outline"
            onClick={() => {
              // Navigate to generator tab - would be handled by parent
              console.log('Navigate to generator');
            }}
          >
            Gerar Nova Ideia
          </Button>
        </div>
      </div>
    </Layout.Card>
  );
  
  // ============================================================================
  // IDEAS LIST
  // ============================================================================
  
  const renderIdeasList = () => {
    if (ideas.length === 0) {
      return renderEmptyState();
    }
    
    return (
      <div className="space-y-4">
        {ideas.map((idea) => (
          <IdeaCard
            key={idea.id}
            idea={idea}
            onSelect={onIdeaSelect}
            variant="default"
            showActions={true}
          />
        ))}
        
        {/* Load More Button (if needed) */}
        {ideas.length > 0 && ideas.length % 20 === 0 && (
          <div className="text-center pt-4">
            <Button
              variant="outline"
              onClick={() => {
                // Load more logic would be handled by parent
                console.log('Load more ideas');
              }}
            >
              Carregar Mais
            </Button>
          </div>
        )}
      </div>
    );
  };
  
  // ============================================================================
  // LOADING STATE
  // ============================================================================
  
  if (loading) {
    return (
      <ErrorBoundary>
        <div className="space-y-6">
          {renderHeader()}
          <LoadingStates.IdeasListSkeleton />
        </div>
      </ErrorBoundary>
    );
  }
  
  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  
  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {renderHeader()}
        {renderIdeasList()}
        
        {/* Stats Section */}
        {ideas.length > 0 && (
          <Layout.Card variant="outlined" padding="md" className="bg-neutral-50">
            <div className="flex justify-between items-center text-sm text-neutral-600">
              <span>Total de ideias: {ideas.length}</span>
              <span>Última atualização: {new Date().toLocaleDateString('pt-BR')}</span>
            </div>
          </Layout.Card>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default IdeaHistory; 