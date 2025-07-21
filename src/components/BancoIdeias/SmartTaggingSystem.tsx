/**
 * 🎯 SMART TAGGING SYSTEM V9.0
 * 
 * Sistema completo de tags inteligentes para o Banco de Ideias
 * Integra todos os componentes de tags em uma interface unificada
 * 
 * @methodology V9.0_NATURAL_LANGUAGE_FIRST
 * @feature Sistema de Tags Inteligentes
 * @author IA Beta - Solution Architect + Frontend
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Card } from '../ui/Card';
import { Sparkles, Hash, BarChart3, Settings, Plus } from 'lucide-react';
import { Button } from '../ui/Button';

// Import dos componentes criados
import TagSuggestionEngine, { SuggestedTag, TagSuggestionResult } from './TagSuggestionEngine';
import SmartTagSelector from './SmartTagSelector';
import TagAutoComplete from './TagAutoComplete';
import TagCloudVisualizer, { TagMetrics } from './TagCloudVisualizer';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface SmartTaggingSystemProps {
  ideaText: string;
  selectedTags: SuggestedTag[];
  onTagsChange: (tags: SuggestedTag[]) => void;
  existingTags?: TagMetrics[];
  mode?: 'compact' | 'full';
  showAnalytics?: boolean;
  maxTags?: number;
  className?: string;
}

interface TaggingStats {
  totalTags: number;
  categoriesUsed: number;
  avgConfidence: number;
  aiSuggested: number;
  customTags: number;
}

// ============================================================================
// MOCK DATA FOR DEMONSTRATION
// ============================================================================

const MOCK_EXISTING_TAGS: TagMetrics[] = [
  {
    id: 'drama-1',
    name: 'Drama',
    category: 'genero',
    count: 45,
    percentage: 18.2,
    trending: 'up',
    lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    associatedIdeas: 23
  },
  {
    id: 'comedia-1',
    name: 'Comédia',
    category: 'genero',
    count: 38,
    percentage: 15.4,
    trending: 'stable',
    lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    associatedIdeas: 19
  },
  {
    id: 'familia-1',
    name: 'Família',
    category: 'tema',
    count: 32,
    percentage: 13.0,
    trending: 'up',
    lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
    associatedIdeas: 16
  },
  {
    id: 'trabalho-1',
    name: 'Trabalho',
    category: 'tema',
    count: 28,
    percentage: 11.3,
    trending: 'down',
    lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    associatedIdeas: 14
  },
  {
    id: 'jovem-1',
    name: 'Jovem',
    category: 'publico',
    count: 25,
    percentage: 10.1,
    trending: 'stable',
    lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
    associatedIdeas: 12
  }
];

// ============================================================================
// SMART TAGGING SYSTEM COMPONENT
// ============================================================================

export const SmartTaggingSystem: React.FC<SmartTaggingSystemProps> = ({
  ideaText,
  selectedTags,
  onTagsChange,
  existingTags = MOCK_EXISTING_TAGS,
  mode = 'full',
  showAnalytics = true,
  maxTags = 10,
  className = ""
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [activeTab, setActiveTab] = useState('suggest');
  const [aiSuggestions, setAiSuggestions] = useState<SuggestedTag[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================
  
  const taggingStats: TaggingStats = {
    totalTags: selectedTags.length,
    categoriesUsed: new Set(selectedTags.map(tag => tag.category)).size,
    avgConfidence: selectedTags.length > 0 
      ? selectedTags.reduce((sum, tag) => sum + tag.confidence, 0) / selectedTags.length 
      : 0,
    aiSuggested: selectedTags.filter(tag => tag.confidence > 0.5).length,
    customTags: selectedTags.filter(tag => tag.confidence === 1.0).length
  };

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  const handleTagAdd = useCallback((tag: SuggestedTag) => {
    if (selectedTags.length >= maxTags) return;
    
    const isDuplicate = selectedTags.some(
      selected => selected.name.toLowerCase() === tag.name.toLowerCase()
    );
    
    if (!isDuplicate) {
      onTagsChange([...selectedTags, tag]);
    }
  }, [selectedTags, maxTags, onTagsChange]);

  const handleTagRemove = useCallback((tagId: string) => {
    onTagsChange(selectedTags.filter(tag => tag.id !== tagId));
  }, [selectedTags, onTagsChange]);

  const handleTagsGenerated = useCallback((tags: SuggestedTag[]) => {
    setAiSuggestions(tags);
  }, []);

  const handleCreateCustomTag = useCallback((tagName: string, category: string) => {
    const customTag: SuggestedTag = {
      id: `custom-${Date.now()}`,
      name: tagName,
      category: category as SuggestedTag['category'],
      confidence: 1.0,
      reasoning: 'Tag personalizada criada pelo usuário'
    };
    
    handleTagAdd(customTag);
  }, [handleTagAdd]);

  const handleClearAllTags = useCallback(() => {
    onTagsChange([]);
  }, [onTagsChange]);

  const handleApplyPopularTags = useCallback(() => {
    const popularTags: SuggestedTag[] = existingTags
      .slice(0, 5)
      .map(tag => ({
        id: `popular-${tag.id}`,
        name: tag.name,
        category: tag.category as SuggestedTag['category'],
        confidence: 0.8,
        reasoning: `Tag popular (${tag.count} usos)`
      }));
    
    popularTags.forEach(tag => handleTagAdd(tag));
  }, [existingTags, handleTagAdd]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================
  
  const renderCompactMode = () => (
    <div className="space-y-4">
      {/* Quick Tag Input */}
      <TagAutoComplete
        onTagSelect={handleTagAdd}
        onCreateCustomTag={handleCreateCustomTag}
        existingTags={selectedTags}
        suggestedTags={aiSuggestions}
        placeholder="Adicionar tags..."
        enableCustomTags={true}
      />

      {/* AI Suggestions (inline) */}
      {ideaText.trim() && (
        <TagSuggestionEngine
          ideaText={ideaText}
          onTagsGenerated={handleTagsGenerated}
          onTagSelect={handleTagAdd}
          selectedTags={selectedTags}
          maxSuggestions={6}
        />
      )}

      {/* Selected Tags Display */}
      <SmartTagSelector
        selectedTags={selectedTags}
        onTagAdd={handleTagAdd}
        onTagRemove={handleTagRemove}
        onTagsChange={onTagsChange}
        suggestedTags={aiSuggestions}
        maxTags={maxTags}
        enableFiltering={false}
      />
    </div>
  );

  const renderFullMode = () => (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="suggest" className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Sugerir
        </TabsTrigger>
        <TabsTrigger value="manage" className="flex items-center gap-2">
          <Hash className="w-4 h-4" />
          Gerenciar
        </TabsTrigger>
        <TabsTrigger value="analytics" className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Analytics
        </TabsTrigger>
        <TabsTrigger value="settings" className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Config
        </TabsTrigger>
      </TabsList>

      {/* Suggest Tab */}
      <TabsContent value="suggest" className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Sugestões Inteligentes
            </h3>
            
            <TagSuggestionEngine
              ideaText={ideaText}
              onTagsGenerated={handleTagsGenerated}
              onTagSelect={handleTagAdd}
              selectedTags={selectedTags}
              maxSuggestions={8}
            />
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Plus className="w-5 h-5 text-green-600" />
              Busca Rápida
            </h3>
            
            <TagAutoComplete
              onTagSelect={handleTagAdd}
              onCreateCustomTag={handleCreateCustomTag}
              existingTags={selectedTags}
              suggestedTags={aiSuggestions}
              placeholder="Buscar ou criar tags..."
              enableCustomTags={true}
              autoFocus={false}
            />

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button
                onClick={handleApplyPopularTags}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                Aplicar Tags Populares
              </Button>
              <Button
                onClick={handleClearAllTags}
                variant="outline"
                size="sm"
                className="text-xs text-red-600 border-red-300"
                disabled={selectedTags.length === 0}
              >
                Limpar Todas
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>

      {/* Manage Tab */}
      <TabsContent value="manage" className="space-y-6">
        <SmartTagSelector
          selectedTags={selectedTags}
          onTagAdd={handleTagAdd}
          onTagRemove={handleTagRemove}
          onTagsChange={onTagsChange}
          suggestedTags={aiSuggestions}
          maxTags={maxTags}
          enableFiltering={true}
          enableCustomTags={true}
        />
      </TabsContent>

      {/* Analytics Tab */}
      <TabsContent value="analytics" className="space-y-6">
        {showAnalytics && (
          <TagCloudVisualizer
            tags={existingTags}
            onTagClick={(tag) => {
              const suggestedTag: SuggestedTag = {
                id: `analytics-${tag.id}`,
                name: tag.name,
                category: tag.category as SuggestedTag['category'],
                confidence: 0.8,
                reasoning: `Tag popular com ${tag.count} usos`
              };
              handleTagAdd(suggestedTag);
            }}
            viewMode="cloud"
            showMetrics={true}
            maxTags={30}
            interactive={true}
          />
        )}
      </TabsContent>

      {/* Settings Tab */}
      <TabsContent value="settings" className="space-y-6">
        <Card className="p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Configurações do Sistema de Tags</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-700">Sugestões Automáticas</h4>
                <p className="text-sm text-gray-500">Gerar tags automaticamente enquanto digita</p>
              </div>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-700">Tags Personalizadas</h4>
                <p className="text-sm text-gray-500">Permitir criação de tags customizadas</p>
              </div>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-700">Limite de Tags</h4>
                <p className="text-sm text-gray-500">Máximo de tags por ideia</p>
              </div>
              <select className="px-3 py-1 border rounded-md">
                <option value="5">5 tags</option>
                <option value="10" selected>10 tags</option>
                <option value="15">15 tags</option>
                <option value="20">20 tags</option>
              </select>
            </div>
          </div>
        </Card>
      </TabsContent>
    </Tabs>
  );

  const renderStats = () => (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      <div className="text-center">
        <div className="text-2xl font-bold text-blue-600">{taggingStats.totalTags}</div>
        <div className="text-xs text-gray-500">Tags</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600">{taggingStats.categoriesUsed}</div>
        <div className="text-xs text-gray-500">Categorias</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-purple-600">
          {Math.round(taggingStats.avgConfidence * 100)}%
        </div>
        <div className="text-xs text-gray-500">Confiança</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-orange-600">{taggingStats.aiSuggested}</div>
        <div className="text-xs text-gray-500">IA</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-pink-600">{taggingStats.customTags}</div>
        <div className="text-xs text-gray-500">Custom</div>
      </div>
    </div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  
  return (
    <div className={`bg-white rounded-lg border ${className}`}>
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Hash className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-800">Sistema de Tags Inteligentes</h2>
              <p className="text-sm text-gray-600">
                Powered by V9.0 Natural Language First
              </p>
            </div>
          </div>
          
          {mode === 'full' && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Sparkles className="w-4 h-4" />
              <span>IA Ativa</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Stats */}
        {selectedTags.length > 0 && renderStats()}
        
        {/* Main Content */}
        {mode === 'compact' ? renderCompactMode() : renderFullMode()}
      </div>
    </div>
  );
};

export default SmartTaggingSystem;