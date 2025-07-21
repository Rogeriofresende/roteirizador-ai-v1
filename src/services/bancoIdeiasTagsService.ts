/**
 * 💡 BANCO DE IDEIAS TAGS SERVICE
 * 
 * Serviço para Sistema de Tags Inteligentes
 * Gerado seguindo V9.0 Natural Language First - Teste Real
 * 
 * @author IA Alpha - Requirements Analyst + Backend
 * @created 2025-07-19T14:00:00Z
 * @methodology V9.0_NATURAL_LANGUAGE_FIRST
 * @feature ROIA-BDI-001 (Sistema de Tags Inteligentes)
 * @specification specs/banco-de-ideias-tags-inteligentes.md
 */

import { ROTEIRAR_CONTEXT } from '../config/roteirarContext';

// 🎯 INTERFACES BASEADAS NA NL SPECIFICATION
export interface Idea {
  id: string;
  title: string;
  description: string;
  tags: Tag[];
  category: string;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
}

export interface Tag {
  id: string;
  name: string;
  type: 'genre' | 'theme' | 'character' | 'setting' | 'mood' | 'custom';
  confidence: number; // 0-1, para tags sugeridas pela IA
  isAISuggested: boolean;
  color?: string;
}

export interface TagSuggestion {
  tag: Tag;
  relevance: number;
  reasoning: string;
}

export interface SearchFilters {
  tags?: string[];
  category?: string;
  rating?: { min: number; max: number };
  dateRange?: { start: Date; end: Date };
  textQuery?: string;
}

export interface SearchResult {
  ideas: Idea[];
  totalCount: number;
  searchTime: number;
  relevanceScore: number;
}

// 🤖 BANCO DE IDEIAS TAGS SERVICE
export class BancoIdeiasTagsService {
  private ideas: Map<string, Idea> = new Map();
  private tagIndex: Map<string, Set<string>> = new Map(); // tagId -> ideaIds
  private aiTaggingEnabled: boolean = true;

  constructor() {
    this.initializeService();
  }

  // 🚀 COMPORTAMENTO 1: AUTO-TAGGING INTELIGENTE
  // Conforme NL Spec: "Analisar texto da ideia e sugerir tags relevantes usando NLP"
  async suggestTags(ideaText: string): Promise<TagSuggestion[]> {
    if (ideaText.length < 50) {
      return []; // Aguardar mais contexto conforme especificação
    }

    try {
      // Simular integração com Gemini AI (conforme constraints técnicas)
      const suggestions = await this.analyzeTextWithAI(ideaText);
      
      // Filtrar tags ofensivas (conforme anti-behavior #1)
      const filteredSuggestions = suggestions.filter(s => 
        !this.isOffensiveTag(s.tag.name)
      );

      // Limitar a 5-8 tags conforme UX especificado
      return filteredSuggestions.slice(0, 6);
    } catch (error) {
      console.error('Erro no auto-tagging:', error);
      return this.getFallbackTags(ideaText);
    }
  }

  // 🔍 COMPORTAMENTO 2: BUSCA EM TEMPO REAL
  // Conforme NL Spec: "Filtrar ideias instantaneamente conforme usuário digita"
  async searchIdeas(filters: SearchFilters): Promise<SearchResult> {
    const startTime = Date.now();
    
    let filteredIdeas = Array.from(this.ideas.values());

    // Aplicar filtros conforme especificação
    if (filters.textQuery) {
      filteredIdeas = this.filterByText(filteredIdeas, filters.textQuery);
    }

    if (filters.tags && filters.tags.length > 0) {
      filteredIdeas = this.filterByTags(filteredIdeas, filters.tags);
    }

    if (filters.category) {
      filteredIdeas = filteredIdeas.filter(idea => idea.category === filters.category);
    }

    if (filters.rating) {
      filteredIdeas = filteredIdeas.filter(idea => 
        idea.rating >= filters.rating!.min && idea.rating <= filters.rating!.max
      );
    }

    // Ordenar por relevância
    const sortedIdeas = this.sortByRelevance(filteredIdeas, filters);

    const searchTime = Date.now() - startTime;
    
    // Validar performance requirement: < 300ms
    if (searchTime > 300) {
      console.warn(`Busca demorou ${searchTime}ms, acima do target de 300ms`);
    }

    return {
      ideas: sortedIdeas,
      totalCount: sortedIdeas.length,
      searchTime,
      relevanceScore: this.calculateRelevanceScore(sortedIdeas, filters)
    };
  }

  // 💡 COMPORTAMENTO 3: SUGESTÃO DE TAGS RELACIONADAS
  // Conforme NL Spec: "Mostrar tags relacionadas durante digitação"
  async getRelatedTags(currentTags: string[]): Promise<Tag[]> {
    const relatedTags: Map<string, number> = new Map();

    // Analisar ideias com tags similares
    for (const idea of this.ideas.values()) {
      const commonTags = idea.tags.filter(tag => 
        currentTags.includes(tag.name)
      );

      if (commonTags.length > 0) {
        // Adicionar outras tags da mesma ideia como relacionadas
        idea.tags.forEach(tag => {
          if (!currentTags.includes(tag.name)) {
            const currentScore = relatedTags.get(tag.name) || 0;
            relatedTags.set(tag.name, currentScore + 1);
          }
        });
      }
    }

    // Converter para array e ordenar por relevância
    const sorted = Array.from(relatedTags.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8) // Limitar conforme UX
      .map(([tagName, relevance]) => ({
        id: `related-${tagName}`,
        name: tagName,
        type: 'custom' as const,
        confidence: Math.min(relevance / 10, 1),
        isAISuggested: false
      }));

    return sorted;
  }

  // 📝 CRUD OPERATIONS PARA IDEIAS
  async createIdea(ideaData: Partial<Idea>): Promise<Idea> {
    const idea: Idea = {
      id: `idea-${Date.now()}`,
      title: ideaData.title || 'Nova Ideia',
      description: ideaData.description || '',
      tags: ideaData.tags || [],
      category: ideaData.category || 'geral',
      rating: ideaData.rating || 3,
      createdAt: new Date(),
      updatedAt: new Date(),
      authorId: ideaData.authorId || 'anonymous'
    };

    // Auto-suggest tags se habilitado
    if (this.aiTaggingEnabled && idea.description.length > 50) {
      const suggestions = await this.suggestTags(idea.description);
      idea.tags = [...idea.tags, ...suggestions.map(s => s.tag)];
    }

    this.ideas.set(idea.id, idea);
    this.updateTagIndex(idea);

    return idea;
  }

  async updateIdea(ideaId: string, updates: Partial<Idea>): Promise<Idea | null> {
    const idea = this.ideas.get(ideaId);
    if (!idea) return null;

    const updatedIdea = {
      ...idea,
      ...updates,
      updatedAt: new Date()
    };

    this.ideas.set(ideaId, updatedIdea);
    this.updateTagIndex(updatedIdea);

    return updatedIdea;
  }

  async deleteIdea(ideaId: string): Promise<boolean> {
    const idea = this.ideas.get(ideaId);
    if (!idea) return false;

    this.ideas.delete(ideaId);
    this.removeFromTagIndex(idea);
    
    return true;
  }

  async getIdea(ideaId: string): Promise<Idea | null> {
    return this.ideas.get(ideaId) || null;
  }

  async listIdeas(filters?: SearchFilters): Promise<Idea[]> {
    if (!filters) {
      return Array.from(this.ideas.values());
    }

    const result = await this.searchIdeas(filters);
    return result.ideas;
  }

  // 🔧 MÉTODOS AUXILIARES (IMPLEMENTAÇÃO INTERNA)
  private async analyzeTextWithAI(text: string): Promise<TagSuggestion[]> {
    // Simulação da integração com Gemini AI
    // Em produção, seria a chamada real para a API
    const simulatedSuggestions: TagSuggestion[] = [];

    // Análise simples de palavras-chave para demonstração
    const keywords = this.extractKeywords(text);
    
    for (const keyword of keywords) {
      const tagType = this.inferTagType(keyword);
      const confidence = Math.random() * 0.4 + 0.6; // 0.6-1.0

      simulatedSuggestions.push({
        tag: {
          id: `ai-${keyword}`,
          name: keyword,
          type: tagType,
          confidence,
          isAISuggested: true
        },
        relevance: confidence,
        reasoning: `Identificado como ${tagType} baseado no contexto`
      });
    }

    return simulatedSuggestions;
  }

  private extractKeywords(text: string): string[] {
    // Simulação de extração de palavras-chave
    const commonGenres = ['drama', 'comédia', 'suspense', 'terror', 'romance', 'ação'];
    const commonThemes = ['família', 'vingança', 'amor', 'amizade', 'superação', 'mistério'];
    const commonSettings = ['escola', 'trabalho', 'casa', 'cidade', 'campo', 'futuro'];

    const lowerText = text.toLowerCase();
    const found: string[] = [];

    [...commonGenres, ...commonThemes, ...commonSettings].forEach(keyword => {
      if (lowerText.includes(keyword)) {
        found.push(keyword);
      }
    });

    return found.slice(0, 5); // Limitar para performance
  }

  private inferTagType(keyword: string): Tag['type'] {
    const genres = ['drama', 'comédia', 'suspense', 'terror', 'romance', 'ação'];
    const themes = ['família', 'vingança', 'amor', 'amizade', 'superação', 'mistério'];
    const settings = ['escola', 'trabalho', 'casa', 'cidade', 'campo', 'futuro'];

    if (genres.includes(keyword)) return 'genre';
    if (themes.includes(keyword)) return 'theme';
    if (settings.includes(keyword)) return 'setting';
    return 'custom';
  }

  private isOffensiveTag(tagName: string): boolean {
    // Lista básica de palavras a evitar (conforme anti-behavior)
    const offensiveWords = ['ofensivo', 'discriminatório', 'violento'];
    return offensiveWords.some(word => tagName.toLowerCase().includes(word));
  }

  private getFallbackTags(text: string): TagSuggestion[] {
    // Fallback quando IA não funciona
    return [{
      tag: {
        id: 'fallback-geral',
        name: 'geral',
        type: 'custom',
        confidence: 0.5,
        isAISuggested: false
      },
      relevance: 0.5,
      reasoning: 'Tag padrão (fallback)'
    }];
  }

  private filterByText(ideas: Idea[], query: string): Idea[] {
    const lowerQuery = query.toLowerCase();
    return ideas.filter(idea =>
      idea.title.toLowerCase().includes(lowerQuery) ||
      idea.description.toLowerCase().includes(lowerQuery) ||
      idea.tags.some(tag => tag.name.toLowerCase().includes(lowerQuery))
    );
  }

  private filterByTags(ideas: Idea[], tagNames: string[]): Idea[] {
    return ideas.filter(idea =>
      tagNames.every(tagName =>
        idea.tags.some(tag => tag.name === tagName)
      )
    );
  }

  private sortByRelevance(ideas: Idea[], filters: SearchFilters): Idea[] {
    // Algoritmo simples de relevância
    return ideas.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      // Pontuação por rating
      scoreA += a.rating * 10;
      scoreB += b.rating * 10;

      // Pontuação por data (mais recente = melhor)
      const daysDiffA = (Date.now() - a.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      const daysDiffB = (Date.now() - b.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      scoreA += Math.max(0, 30 - daysDiffA);
      scoreB += Math.max(0, 30 - daysDiffB);

      // Pontuação por match de tags
      if (filters.tags) {
        const matchesA = a.tags.filter(tag => filters.tags!.includes(tag.name)).length;
        const matchesB = b.tags.filter(tag => filters.tags!.includes(tag.name)).length;
        scoreA += matchesA * 20;
        scoreB += matchesB * 20;
      }

      return scoreB - scoreA;
    });
  }

  private calculateRelevanceScore(ideas: Idea[], filters: SearchFilters): number {
    if (ideas.length === 0) return 0;

    // Score médio baseado em quantos filtros foram atendidos
    let totalScore = 0;
    for (const idea of ideas) {
      let ideaScore = 1; // Base score

      if (filters.tags) {
        const tagMatches = idea.tags.filter(tag => 
          filters.tags!.includes(tag.name)
        ).length;
        ideaScore += (tagMatches / filters.tags.length) * 0.5;
      }

      totalScore += Math.min(ideaScore, 1);
    }

    return totalScore / ideas.length;
  }

  private updateTagIndex(idea: Idea): void {
    // Remover ideias antigas do índice
    this.removeFromTagIndex(idea);

    // Adicionar ao índice
    idea.tags.forEach(tag => {
      if (!this.tagIndex.has(tag.name)) {
        this.tagIndex.set(tag.name, new Set());
      }
      this.tagIndex.get(tag.name)!.add(idea.id);
    });
  }

  private removeFromTagIndex(idea: Idea): void {
    idea.tags.forEach(tag => {
      const ideaSet = this.tagIndex.get(tag.name);
      if (ideaSet) {
        ideaSet.delete(idea.id);
        if (ideaSet.size === 0) {
          this.tagIndex.delete(tag.name);
        }
      }
    });
  }

  private initializeService(): void {
    // Inicialização do serviço
    console.log('🚀 Banco de Ideias Tags Service inicializado');
    console.log('📊 Context:', ROTEIRAR_CONTEXT.project);
    console.log('🤖 AI Tagging:', this.aiTaggingEnabled ? 'Habilitado' : 'Desabilitado');
  }

  // 📊 MÉTRICAS PARA MONITORAMENTO (conforme success criteria)
  getServiceMetrics() {
    return {
      totalIdeas: this.ideas.size,
      totalTags: this.tagIndex.size,
      averageTagsPerIdea: Array.from(this.ideas.values())
        .reduce((sum, idea) => sum + idea.tags.length, 0) / this.ideas.size || 0,
      aiSuggestedTagsPercentage: this.calculateAISuggestedPercentage()
    };
  }

  private calculateAISuggestedPercentage(): number {
    const allTags = Array.from(this.ideas.values())
      .flatMap(idea => idea.tags);
    
    if (allTags.length === 0) return 0;
    
    const aiSuggested = allTags.filter(tag => tag.isAISuggested).length;
    return (aiSuggested / allTags.length) * 100;
  }
}

// 🚀 EXPORT SINGLETON INSTANCE
export const bancoIdeiasTagsService = new BancoIdeiasTagsService();

export default bancoIdeiasTagsService;