import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc,
  orderBy, 
  Timestamp,
  increment,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import type { EnhancedProject, SavedScript, FormData } from '../types';
import { TagService } from './tagService';

export class ProjectService {
  /**
   * Criar novo projeto aprimorado
   */
  static async createProject(
    userId: string,
    formData: FormData,
    content: string,
    additionalData?: {
      tags?: string[];
      folderId?: string;
      status?: 'draft' | 'completed' | 'published';
      title?: string;
    }
  ): Promise<string> {
    try {
      const wordCount = this.countWords(content);
      
      const project: Omit<EnhancedProject, 'id'> = {
        userId,
        title: additionalData?.title || formData.subject,
        content,
        formData,
        tags: additionalData?.tags || [],
        folderId: additionalData?.folderId,
        isFavorite: false,
        status: additionalData?.status || 'draft',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        version: 1,
        wordCount,
        viewCount: 0,
        editCount: 0,
        isShared: false
      };

      const docRef = await addDoc(collection(db, 'scripts'), project);

      // Incrementar contador de uso das tags
      if (project.tags.length > 0) {
        await TagService.incrementTagUsage(project.tags);
      }

      return docRef.id;
    } catch (error: unknown) {
      console.error('Erro ao criar projeto:', error);
      throw new Error('Falha ao criar projeto');
    }
  }

  /**
   * Atualizar projeto existente
   */
  static async updateProject(
    projectId: string,
    updates: Partial<EnhancedProject>
  ): Promise<void> {
    try {
      // Obter projeto atual para comparar tags
      const currentProject = await this.getProject(projectId);
      if (!currentProject) {
        throw new Error('Projeto não encontrado');
      }

      const updateData: any = { ...updates };
      
      // Atualizar contagem de palavras se o conteúdo foi alterado
      if (updates.content) {
        updateData.wordCount = this.countWords(updates.content);
        updateData.editCount = increment(1);
      }

      // Atualizar timestamp
      updateData.updatedAt = Timestamp.now();
      
      // Se foi uma edição manual do conteúdo, atualizar lastEditedAt
      if (updates.content) {
        updateData.lastEditedAt = Timestamp.now();
      }

      // Remover campos que não devem ser atualizados
      delete updateData.id;
      delete updateData.userId;
      delete updateData.createdAt;
      delete updateData.version; // Versão será gerenciada separadamente

      const projectRef = doc(db, 'scripts', projectId);
      await updateDoc(projectRef, updateData);

      // Atualizar contadores de tags se necessário
      if (updates.tags) {
        const oldTags = currentProject.tags || [];
        const newTags = updates.tags;
        
        // Tags removidas
        const removedTags = oldTags.filter(tag => !newTags.includes(tag));
        if (removedTags.length > 0) {
          await TagService.decrementTagUsage(removedTags);
        }

        // Tags adicionadas
        const addedTags = newTags.filter(tag => !oldTags.includes(tag));
        if (addedTags.length > 0) {
          await TagService.incrementTagUsage(addedTags);
        }
      }
    } catch (error: unknown) {
      console.error('Erro ao atualizar projeto:', error);
      throw new Error('Falha ao atualizar projeto');
    }
  }

  /**
   * Obter projeto por ID
   */
  static async getProject(projectId: string): Promise<EnhancedProject | null> {
    try {
      const projectRef = doc(db, 'scripts', projectId);
      const snapshot = await getDoc(projectRef);
      
      if (!snapshot.exists()) {
        return null;
      }

      // Incrementar contador de visualizações
      await updateDoc(projectRef, {
        viewCount: increment(1)
      });

      return {
        id: snapshot.id,
        ...snapshot.data()
      } as EnhancedProject;
    } catch (error: unknown) {
      console.error('Erro ao obter projeto:', error);
      return null;
    }
  }

  /**
   * Excluir projeto
   */
  static async deleteProject(projectId: string): Promise<void> {
    try {
      // Obter projeto para decrementar tags
      const project = await this.getProject(projectId);
      if (project && project.tags.length > 0) {
        await TagService.decrementTagUsage(project.tags);
      }

      await deleteDoc(doc(db, 'scripts', projectId));
    } catch (error: unknown) {
      console.error('Erro ao excluir projeto:', error);
      throw new Error('Falha ao excluir projeto');
    }
  }

  /**
   * Duplicar projeto
   */
  static async duplicateProject(
    projectId: string,
    newTitle?: string
  ): Promise<string> {
    try {
      const original = await this.getProject(projectId);
      if (!original) {
        throw new Error('Projeto original não encontrado');
      }

      const duplicatedProject: Omit<EnhancedProject, 'id'> = {
        ...original,
        title: newTitle || `${original.title} (Cópia)`,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        version: 1,
        viewCount: 0,
        editCount: 0,
        isShared: false,
        shareLink: undefined,
        shareExpiresAt: undefined
      };

      const docRef = await addDoc(collection(db, 'scripts'), duplicatedProject);

      // Incrementar contador de uso das tags
      if (duplicatedProject.tags.length > 0) {
        await TagService.incrementTagUsage(duplicatedProject.tags);
      }

      return docRef.id;
    } catch (error: unknown) {
      console.error('Erro ao duplicar projeto:', error);
      throw new Error('Falha ao duplicar projeto');
    }
  }

  /**
   * Marcar/desmarcar como favorito
   */
  static async toggleFavorite(projectId: string): Promise<boolean> {
    try {
      const project = await this.getProject(projectId);
      if (!project) {
        throw new Error('Projeto não encontrado');
      }

      const newFavoriteStatus = !project.isFavorite;
      
      await updateDoc(doc(db, 'scripts', projectId), {
        isFavorite: newFavoriteStatus,
        updatedAt: Timestamp.now()
      });

      return newFavoriteStatus;
    } catch (error: unknown) {
      console.error('Erro ao alterar favorito:', error);
      throw new Error('Falha ao alterar status de favorito');
    }
  }

  /**
   * Mover projeto para pasta
   */
  static async moveToFolder(
    projectId: string, 
    folderId: string | null
  ): Promise<void> {
    try {
      await updateDoc(doc(db, 'scripts', projectId), {
        folderId: folderId || null,
        updatedAt: Timestamp.now()
      });
    } catch (error: unknown) {
      console.error('Erro ao mover projeto:', error);
      throw new Error('Falha ao mover projeto para pasta');
    }
  }

  /**
   * Atualizar status do projeto
   */
  static async updateStatus(
    projectId: string,
    status: 'draft' | 'completed' | 'published'
  ): Promise<void> {
    try {
      await updateDoc(doc(db, 'scripts', projectId), {
        status,
        updatedAt: Timestamp.now()
      });
    } catch (error: unknown) {
      console.error('Erro ao atualizar status:', error);
      throw new Error('Falha ao atualizar status do projeto');
    }
  }

  /**
   * Gerar link de compartilhamento
   */
  static async generateShareLink(
    projectId: string,
    expirationHours: number = 24
  ): Promise<string> {
    try {
      const shareLink = `${window.location.origin}/shared/${projectId}/${this.generateShareToken()}`;
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + expirationHours);

      await updateDoc(doc(db, 'scripts', projectId), {
        isShared: true,
        shareLink,
        shareExpiresAt: Timestamp.fromDate(expiresAt),
        updatedAt: Timestamp.now()
      });

      return shareLink;
    } catch (error: unknown) {
      console.error('Erro ao gerar link de compartilhamento:', error);
      throw new Error('Falha ao gerar link de compartilhamento');
    }
  }

  /**
   * Revogar compartilhamento
   */
  static async revokeShare(projectId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'scripts', projectId), {
        isShared: false,
        shareLink: null,
        shareExpiresAt: null,
        updatedAt: Timestamp.now()
      });
    } catch (error: unknown) {
      console.error('Erro ao revogar compartilhamento:', error);
      throw new Error('Falha ao revogar compartilhamento');
    }
  }

  /**
   * Migrar projetos antigos para o novo formato
   */
  static async migrateOldProjects(userId: string): Promise<void> {
    try {
      // Buscar projetos no formato antigo
      const q = query(
        collection(db, 'scripts'),
        where('userId', '==', userId)
      );

      const snapshot = await getDocs(q);
      const batch = writeBatch(db);

      snapshot.docs.forEach(docSnapshot => {
        const data = docSnapshot.data() as SavedScript;
        
        // Verificar se já está no novo formato
        if ('tags' in data) return; // Já migrado

        // Preparar dados para migração
        const migratedData: Partial<EnhancedProject> = {
          title: data.formData.subject,
          content: data.scriptContent,
          tags: [],
          isFavorite: false,
          status: 'draft' as const,
          updatedAt: data.createdAt,
          version: 1,
          wordCount: this.countWords(data.scriptContent),
          viewCount: 0,
          editCount: 0,
          isShared: false
        };

        batch.update(doc(db, 'scripts', docSnapshot.id), migratedData);
      });

      await batch.commit();
    } catch (error: unknown) {
      console.error('Erro na migração:', error);
      throw new Error('Falha na migração de projetos');
    }
  }

  /**
   * Obter projetos relacionados
   */
  static async getRelatedProjects(
    projectId: string,
    limit: number = 5
  ): Promise<EnhancedProject[]> {
    try {
      const project = await this.getProject(projectId);
      if (!project) return [];

      // Buscar projetos do mesmo usuário
      const q = query(
        collection(db, 'scripts'),
        where('userId', '==', project.userId),
        orderBy('updatedAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const allProjects = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as EnhancedProject))
        .filter(p => p.id !== projectId);

      // Calcular score de relevância
      const scored = allProjects.map(p => {
        let score = 0;
        
        // Tags em comum (peso maior)
        const commonTags = p.tags.filter(tag => project.tags.includes(tag));
        score += commonTags.length * 3;
        
        // Mesma plataforma
        if (p.formData.platform === project.formData.platform) score += 2;
        
        // Mesmo tom
        if (p.formData.tone === project.formData.tone) score += 1;
        
        // Mesma pasta
        if (p.folderId && p.folderId === project.folderId) score += 2;
        
        return { ...p, relevanceScore: score };
      });

      return scored
        .filter(p => p.relevanceScore > 0)
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, limit);
    } catch (error: unknown) {
      console.error('Erro ao buscar projetos relacionados:', error);
      return [];
    }
  }

  /**
   * Backup de projeto para JSON
   */
  static async exportProject(projectId: string): Promise<string> {
    try {
      const project = await this.getProject(projectId);
      if (!project) {
        throw new Error('Projeto não encontrado');
      }

      const exportData = {
        ...project,
        exportedAt: new Date().toISOString(),
        version: '2.0'
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error: unknown) {
      console.error('Erro ao exportar projeto:', error);
      throw new Error('Falha ao exportar projeto');
    }
  }

  /**
   * Obter estatísticas do usuário
   */
  static async getUserProjectStats(userId: string): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byPlatform: Record<string, number>;
    totalWords: number;
    avgWordsPerProject: number;
    favorites: number;
    shared: number;
  }> {
    try {
      const q = query(
        collection(db, 'scripts'),
        where('userId', '==', userId)
      );

      const snapshot = await getDocs(q);
      const projects = snapshot.docs.map(doc => 
        ({ id: doc.id, ...doc.data() } as EnhancedProject)
      );

      const stats = {
        total: projects.length,
        byStatus: {} as Record<string, number>,
        byPlatform: {} as Record<string, number>,
        totalWords: 0,
        avgWordsPerProject: 0,
        favorites: 0,
        shared: 0
      };

      projects.forEach(project => {
        // Status
        const status = project.status || 'draft';
        stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
        
        // Platform
        const platform = project.formData.platform;
        stats.byPlatform[platform] = (stats.byPlatform[platform] || 0) + 1;
        
        // Words
        stats.totalWords += project.wordCount || 0;
        
        // Favorites
        if (project.isFavorite) stats.favorites++;
        
        // Shared
        if (project.isShared) stats.shared++;
      });

      stats.avgWordsPerProject = stats.total > 0 
        ? Math.round(stats.totalWords / stats.total) 
        : 0;

      return stats;
    } catch (error: unknown) {
      console.error('Erro ao obter estatísticas:', error);
      return {
        total: 0,
        byStatus: {},
        byPlatform: {},
        totalWords: 0,
        avgWordsPerProject: 0,
        favorites: 0,
        shared: 0
      };
    }
  }

  /**
   * Utilitários privados
   */
  private static countWords(text: string): number {
    if (!text || typeof text !== 'string') return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  private static generateShareToken(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  /**
   * Limpeza de projetos antigos (se necessário)
   */
  static async cleanupOldProjects(
    userId: string, 
    daysOld: number = 365
  ): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const q = query(
        collection(db, 'scripts'),
        where('userId', '==', userId),
        where('status', '==', 'draft')
      );

      const snapshot = await getDocs(q);
      const oldProjects = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as EnhancedProject))
        .filter(project => 
          project.createdAt.toDate() < cutoffDate &&
          !project.isFavorite &&
          project.editCount === 0
        );

      const deletePromises = oldProjects.map(project => 
        this.deleteProject(project.id)
      );

      await Promise.all(deletePromises);
      return oldProjects.length;
    } catch (error: unknown) {
      console.error('Erro na limpeza de projetos:', error);
      return 0;
    }
  }
} 