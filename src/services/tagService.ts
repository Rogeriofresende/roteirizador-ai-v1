import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy, Timestamp, increment } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import type { Tag } from '../types';

export class TagService {
  private static readonly PREDEFINED_COLORS = [
    '#3B82F6', // Blue
    '#EF4444', // Red
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#F97316', // Orange
    '#6366F1', // Indigo
  ];

  /**
   * Obter todas as tags do usuário
   */
  static async getUserTags(userId: string): Promise<Tag[]> {
    try {
      const q = query(
        collection(db, 'tags'),
        where('userId', '==', userId),
        orderBy('usageCount', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Tag[];
    } catch (error) {
      console.error('Erro ao carregar tags:', error);
      return [];
    }
  }

  /**
   * Criar nova tag
   */
  static async createTag(userId: string, tagData: Partial<Tag>): Promise<string> {
    try {
      // Verificar se tag já existe
      const existingTags = await this.getUserTags(userId);
      const tagExists = existingTags.some(tag => 
        tag.name.toLowerCase() === tagData.name?.toLowerCase()
      );

      if (tagExists) {
        throw new Error('Tag já existe');
      }

      const tag: Omit<Tag, 'id'> = {
        userId,
        name: tagData.name!.trim(),
        color: tagData.color || this.generateRandomColor(),
        category: tagData.category || 'custom',
        usageCount: 0,
        createdAt: Timestamp.now(),
        isSystemTag: false
      };

      const docRef = await addDoc(collection(db, 'tags'), tag);
      return docRef.id;
    } catch (error) {
      console.error('Erro ao criar tag:', error);
      throw error;
    }
  }

  /**
   * Atualizar tag existente
   */
  static async updateTag(tagId: string, updates: Partial<Tag>): Promise<void> {
    try {
      const tagRef = doc(db, 'tags', tagId);
      const updateData: any = { ...updates };
      
      // Remover campos que não devem ser atualizados
      delete updateData.id;
      delete updateData.userId;
      delete updateData.createdAt;
      delete updateData.usageCount;

      await updateDoc(tagRef, updateData);
    } catch (error) {
      console.error('Erro ao atualizar tag:', error);
      throw new Error('Falha ao atualizar tag');
    }
  }

  /**
   * Excluir tag
   */
  static async deleteTag(tagId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'tags', tagId));
    } catch (error) {
      console.error('Erro ao excluir tag:', error);
      throw new Error('Falha ao excluir tag');
    }
  }

  /**
   * Incrementar contador de uso da tag
   */
  static async incrementTagUsage(tagIds: string[]): Promise<void> {
    try {
      const promises = tagIds.map(tagId => {
        const tagRef = doc(db, 'tags', tagId);
        return updateDoc(tagRef, {
          usageCount: increment(1)
        });
      });

      await Promise.all(promises);
    } catch (error) {
      console.error('Erro ao incrementar uso da tag:', error);
    }
  }

  /**
   * Decrementar contador de uso da tag
   */
  static async decrementTagUsage(tagIds: string[]): Promise<void> {
    try {
      const promises = tagIds.map(tagId => {
        const tagRef = doc(db, 'tags', tagId);
        return updateDoc(tagRef, {
          usageCount: increment(-1)
        });
      });

      await Promise.all(promises);
    } catch (error) {
      console.error('Erro ao decrementar uso da tag:', error);
    }
  }

  /**
   * Obter tags por categoria
   */
  static async getTagsByCategory(
    userId: string, 
    category: Tag['category']
  ): Promise<Tag[]> {
    try {
      const q = query(
        collection(db, 'tags'),
        where('userId', '==', userId),
        where('category', '==', category),
        orderBy('name')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Tag[];
    } catch (error) {
      console.error('Erro ao carregar tags por categoria:', error);
      return [];
    }
  }

  /**
   * Buscar tags por nome (para autocomplete)
   */
  static async searchTags(userId: string, searchTerm: string): Promise<Tag[]> {
    try {
      const allTags = await this.getUserTags(userId);
      const searchTermLower = searchTerm.toLowerCase();
      
      return allTags.filter(tag => 
        tag.name.toLowerCase().includes(searchTermLower)
      ).slice(0, 10);
    } catch (error) {
      console.error('Erro ao buscar tags:', error);
      return [];
    }
  }

  /**
   * Criar tags do sistema (pré-definidas)
   */
  static async createSystemTags(userId: string): Promise<void> {
    try {
      const existingTags = await this.getUserTags(userId);
      const existingSystemTags = existingTags.filter(tag => tag.isSystemTag);

      // Tags do sistema por categoria
      const systemTags = [
        // Platform tags
        { name: 'YouTube', category: 'platform' as const, color: '#FF0000' },
        { name: 'Instagram', category: 'platform' as const, color: '#E4405F' },
        { name: 'TikTok', category: 'platform' as const, color: '#000000' },
        { name: 'Facebook', category: 'platform' as const, color: '#1877F2' },
        { name: 'LinkedIn', category: 'platform' as const, color: '#0077B5' },
        { name: 'Twitter', category: 'platform' as const, color: '#1DA1F2' },

        // Tone tags
        { name: 'Profissional', category: 'tone' as const, color: '#374151' },
        { name: 'Casual', category: 'tone' as const, color: '#10B981' },
        { name: 'Educativo', category: 'tone' as const, color: '#3B82F6' },
        { name: 'Engraçado', category: 'tone' as const, color: '#F59E0B' },
        { name: 'Inspiracional', category: 'tone' as const, color: '#8B5CF6' },

        // Status tags
        { name: 'Rascunho', category: 'status' as const, color: '#9CA3AF' },
        { name: 'Em Progresso', category: 'status' as const, color: '#F59E0B' },
        { name: 'Pronto', category: 'status' as const, color: '#10B981' },
        { name: 'Publicado', category: 'status' as const, color: '#3B82F6' },

        // Audience tags
        { name: 'Iniciantes', category: 'audience' as const, color: '#84CC16' },
        { name: 'Intermediário', category: 'audience' as const, color: '#F97316' },
        { name: 'Avançado', category: 'audience' as const, color: '#EF4444' },
        { name: 'Geral', category: 'audience' as const, color: '#6366F1' },
      ];

      // Criar apenas tags que não existem
      const promises = systemTags
        .filter(sysTag => !existingSystemTags.some(existing => existing.name === sysTag.name))
        .map(tagData => {
          const tag: Omit<Tag, 'id'> = {
            userId,
            name: tagData.name,
            color: tagData.color,
            category: tagData.category,
            usageCount: 0,
            createdAt: Timestamp.now(),
            isSystemTag: true
          };

          return addDoc(collection(db, 'tags'), tag);
        });

      await Promise.all(promises);
    } catch (error) {
      console.error('Erro ao criar tags do sistema:', error);
    }
  }

  /**
   * Obter sugestões de tags baseadas no conteúdo
   */
  static async suggestTagsFromContent(
    content: string, 
    formData: any,
    existingTags: Tag[]
  ): Promise<Tag[]> {
    try {
      const suggestions: Tag[] = [];
      const contentLower = content.toLowerCase();

      // Sugerir baseado na plataforma
      const platformTag = existingTags.find(tag => 
        tag.category === 'platform' && 
        tag.name.toLowerCase() === formData.platform?.toLowerCase()
      );
      if (platformTag) suggestions.push(platformTag);

      // Sugerir baseado no tom
      const toneTag = existingTags.find(tag => 
        tag.category === 'tone' && 
        tag.name.toLowerCase() === formData.tone?.toLowerCase()
      );
      if (toneTag) suggestions.push(toneTag);

      // Sugerir baseado no público
      const audienceTag = existingTags.find(tag => 
        tag.category === 'audience' && 
        tag.name.toLowerCase() === formData.audience?.toLowerCase()
      );
      if (audienceTag) suggestions.push(audienceTag);

      // Sugerir baseado em palavras-chave no conteúdo
      const keywordMatches = existingTags.filter(tag => 
        contentLower.includes(tag.name.toLowerCase()) ||
        formData.subject?.toLowerCase().includes(tag.name.toLowerCase())
      );

      // Combinar sugestões e remover duplicatas
      const allSuggestions = [...suggestions, ...keywordMatches];
      const uniqueSuggestions = allSuggestions.filter((tag, index, array) => 
        array.findIndex(t => t.id === tag.id) === index
      );

      // Ordenar por relevância (usage count)
      return uniqueSuggestions
        .sort((a, b) => b.usageCount - a.usageCount)
        .slice(0, 8);
    } catch (error) {
      console.error('Erro ao sugerir tags:', error);
      return [];
    }
  }

  /**
   * Estatísticas de tags
   */
  static async getTagStats(userId: string): Promise<{
    totalTags: number;
    tagsByCategory: Record<string, number>;
    mostUsedTags: Tag[];
    unusedTags: Tag[];
  }> {
    try {
      const tags = await this.getUserTags(userId);

      const tagsByCategory: Record<string, number> = {};
      tags.forEach(tag => {
        tagsByCategory[tag.category] = (tagsByCategory[tag.category] || 0) + 1;
      });

      const mostUsedTags = tags
        .filter(tag => tag.usageCount > 0)
        .sort((a, b) => b.usageCount - a.usageCount)
        .slice(0, 10);

      const unusedTags = tags.filter(tag => tag.usageCount === 0);

      return {
        totalTags: tags.length,
        tagsByCategory,
        mostUsedTags,
        unusedTags
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas de tags:', error);
      return {
        totalTags: 0,
        tagsByCategory: {},
        mostUsedTags: [],
        unusedTags: []
      };
    }
  }

  /**
   * Limpeza automática de tags não utilizadas
   */
  static async cleanupUnusedTags(userId: string, maxUnusedDays: number = 30): Promise<number> {
    try {
      const tags = await this.getUserTags(userId);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - maxUnusedDays);

      const tagsToDelete = tags.filter(tag => 
        !tag.isSystemTag && 
        tag.usageCount === 0 && 
        tag.createdAt.toDate() < cutoffDate
      );

      const deletePromises = tagsToDelete.map(tag => this.deleteTag(tag.id));
      await Promise.all(deletePromises);

      return tagsToDelete.length;
    } catch (error) {
      console.error('Erro na limpeza de tags:', error);
      return 0;
    }
  }

  /**
   * Gerar cor aleatória para tag
   */
  private static generateRandomColor(): string {
    return this.PREDEFINED_COLORS[
      Math.floor(Math.random() * this.PREDEFINED_COLORS.length)
    ];
  }

  /**
   * Validar dados da tag
   */
  static validateTagData(tagData: Partial<Tag>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!tagData.name?.trim()) {
      errors.push('Nome da tag é obrigatório');
    } else if (tagData.name.length > 30) {
      errors.push('Nome da tag deve ter no máximo 30 caracteres');
    }

    if (tagData.color && !/^#[0-9A-F]{6}$/i.test(tagData.color)) {
      errors.push('Cor deve estar no formato hexadecimal (#RRGGBB)');
    }

    const validCategories = ['platform', 'tone', 'audience', 'status', 'custom'];
    if (tagData.category && !validCategories.includes(tagData.category)) {
      errors.push('Categoria inválida');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
} 