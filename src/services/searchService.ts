import { collection, query, where, getDocs, orderBy, limit, Query, DocumentData } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import type { EnhancedProject, ProjectFilters } from '../types';

export class SearchService {
  /**
   * Busca projetos com filtros avançados
   */
  static async searchProjects(
    userId: string, 
    filters: ProjectFilters
  ): Promise<{ projects: EnhancedProject[]; totalCount: number }> {
    try {
      let firebaseQuery: Query<DocumentData> = collection(db, 'scripts');
      
      // Filtro base por usuário
      firebaseQuery = query(firebaseQuery, where('userId', '==', userId));

      // Aplicar filtros no servidor (quando possível)
      if (filters.tags?.length && filters.tags.length <= 10) {
        firebaseQuery = query(firebaseQuery, where('tags', 'array-contains-any', filters.tags));
      }

      if (filters.folders?.length && filters.folders.length <= 10) {
        firebaseQuery = query(firebaseQuery, where('folderId', 'in', filters.folders));
      }

      if (filters.platforms?.length && filters.platforms.length <= 10) {
        firebaseQuery = query(firebaseQuery, where('formData.platform', 'in', filters.platforms));
      }

      if (filters.status?.length && filters.status.length <= 10) {
        firebaseQuery = query(firebaseQuery, where('status', 'in', filters.status));
      }

      if (filters.isFavorite !== undefined) {
        firebaseQuery = query(firebaseQuery, where('isFavorite', '==', filters.isFavorite));
      }

      // Ordenação
      firebaseQuery = query(firebaseQuery, orderBy(filters.sortBy, filters.sortOrder));

      // Limite inicial (aplicaremos paginação no client-side se necessário)
      if (filters.limit) {
        firebaseQuery = query(firebaseQuery, limit(filters.limit + (filters.offset || 0)));
      }

      const snapshot = await getDocs(firebaseQuery);
      let projects = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as EnhancedProject[];

      // Aplicar filtros no client-side (para maior flexibilidade)
      projects = this.applyClientSideFilters(projects, filters);

      // Aplicar paginação no client-side
      const startIndex = filters.offset || 0;
      const endIndex = filters.limit ? startIndex + filters.limit : projects.length;
      const paginatedProjects = projects.slice(startIndex, endIndex);

      return {
        projects: paginatedProjects,
        totalCount: projects.length
      };
    } catch (error) {
      console.error('Erro ao buscar projetos:', error);
      throw new Error('Falha ao buscar projetos');
    }
  }

  /**
   * Aplica filtros que não podem ser processados pelo Firebase
   */
  private static applyClientSideFilters(
    projects: EnhancedProject[], 
    filters: ProjectFilters
  ): EnhancedProject[] {
    let filteredProjects = [...projects];

    // Busca textual
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredProjects = filteredProjects.filter(project => 
        (project.title?.toLowerCase().includes(searchTerm)) ||
        (project.content?.toLowerCase().includes(searchTerm)) ||
        (project.formData.subject?.toLowerCase().includes(searchTerm)) ||
        (project.formData.additionalNotes?.toLowerCase().includes(searchTerm)) ||
        project.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Filtro de duração
    if (filters.duration) {
      filteredProjects = filteredProjects.filter(project => {
        const duration = project.formData.duration;
        return duration >= filters.duration!.min && duration <= filters.duration!.max;
      });
    }

    // Filtro de range de datas
    if (filters.dateRange) {
      filteredProjects = filteredProjects.filter(project => {
        const projectDate = project.createdAt.toDate();
        return projectDate >= filters.dateRange!.start && projectDate <= filters.dateRange!.end;
      });
    }

    return filteredProjects;
  }

  /**
   * Busca rápida por texto (usado para autocomplete)
   */
  static async quickSearch(userId: string, searchTerm: string, limit: number = 5): Promise<EnhancedProject[]> {
    if (!searchTerm.trim()) return [];

    try {
      const q = query(
        collection(db, 'scripts'),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc'),
        limit(20) // Buscar mais itens para filtrar no client
      );

      const snapshot = await getDocs(q);
      const projects = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as EnhancedProject[];

      // Filtrar por termo de busca
      const searchTermLower = searchTerm.toLowerCase();
      const filtered = projects.filter(project => 
        (project.title?.toLowerCase().includes(searchTermLower)) ||
        (project.formData.subject?.toLowerCase().includes(searchTermLower)) ||
        project.tags.some(tag => tag.toLowerCase().includes(searchTermLower))
      );

      return filtered.slice(0, limit);
    } catch (error) {
      console.error('Erro na busca rápida:', error);
      return [];
    }
  }

  /**
   * Obtém sugestões de filtros baseadas nos dados do usuário
   */
  static async getFilterSuggestions(userId: string): Promise<{
    platforms: string[];
    tags: string[];
    folders: { id: string; name: string }[];
  }> {
    try {
      const q = query(
        collection(db, 'scripts'),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc'),
        limit(100)
      );

      const snapshot = await getDocs(q);
      const projects = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as EnhancedProject[];

      // Extrair plataformas únicas
      const platforms = [...new Set(projects.map(p => p.formData.platform))].filter(Boolean);

      // Extrair tags únicas
      const allTags = projects.flatMap(p => p.tags || []);
      const tags = [...new Set(allTags)].filter(Boolean);

      // Extrair pastas (isso seria melhorado com um serviço dedicado)
      const folderIds = [...new Set(projects.map(p => p.folderId))].filter(Boolean);
      const folders = folderIds.map(id => ({ id, name: `Pasta ${id.slice(0, 8)}` })); // Placeholder

      return {
        platforms: platforms.sort(),
        tags: tags.sort(),
        folders
      };
    } catch (error) {
      console.error('Erro ao obter sugestões de filtros:', error);
      return {
        platforms: [],
        tags: [],
        folders: []
      };
    }
  }

  /**
   * Busca projetos relacionados baseados em tags similares
   */
  static async getRelatedProjects(
    userId: string, 
    projectId: string, 
    limit: number = 5
  ): Promise<EnhancedProject[]> {
    try {
      // Primeiro, obter o projeto atual
      const allProjects = await this.searchProjects(userId, {
        sortBy: 'updatedAt',
        sortOrder: 'desc',
        limit: 50
      });

      const currentProject = allProjects.projects.find(p => p.id === projectId);
      if (!currentProject) return [];

      // Calcular relevância baseada em tags similares
      const relatedProjects = allProjects.projects
        .filter(p => p.id !== projectId)
        .map(project => {
          const commonTags = project.tags.filter(tag => 
            currentProject.tags.includes(tag)
          ).length;
          
          const platformMatch = project.formData.platform === currentProject.formData.platform ? 1 : 0;
          const toneMatch = project.formData.tone === currentProject.formData.tone ? 0.5 : 0;
          
          const relevanceScore = commonTags * 2 + platformMatch + toneMatch;
          
          return { ...project, relevanceScore };
        })
        .filter(p => p.relevanceScore > 0)
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, limit);

      return relatedProjects;
    } catch (error) {
      console.error('Erro ao buscar projetos relacionados:', error);
      return [];
    }
  }

  /**
   * Estatísticas de busca para analytics
   */
  static async getSearchStats(userId: string): Promise<{
    totalProjects: number;
    projectsByPlatform: Record<string, number>;
    projectsByStatus: Record<string, number>;
    averageWordsPerProject: number;
    mostUsedTags: Array<{ tag: string; count: number }>;
  }> {
    try {
      const allProjects = await this.searchProjects(userId, {
        sortBy: 'createdAt',
        sortOrder: 'desc',
        limit: 1000 // Buscar todos os projetos para estatísticas
      });

      const projects = allProjects.projects;

      // Projetos por plataforma
      const projectsByPlatform: Record<string, number> = {};
      projects.forEach(p => {
        const platform = p.formData.platform;
        projectsByPlatform[platform] = (projectsByPlatform[platform] || 0) + 1;
      });

      // Projetos por status
      const projectsByStatus: Record<string, number> = {};
      projects.forEach(p => {
        const status = p.status || 'draft';
        projectsByStatus[status] = (projectsByStatus[status] || 0) + 1;
      });

      // Média de palavras por projeto
      const totalWords = projects.reduce((sum, p) => sum + (p.wordCount || 0), 0);
      const averageWordsPerProject = projects.length > 0 ? Math.round(totalWords / projects.length) : 0;

      // Tags mais usadas
      const tagCounts: Record<string, number> = {};
      projects.forEach(p => {
        p.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });

      const mostUsedTags = Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return {
        totalProjects: projects.length,
        projectsByPlatform,
        projectsByStatus,
        averageWordsPerProject,
        mostUsedTags
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas de busca:', error);
      return {
        totalProjects: 0,
        projectsByPlatform: {},
        projectsByStatus: {},
        averageWordsPerProject: 0,
        mostUsedTags: []
      };
    }
  }
} 