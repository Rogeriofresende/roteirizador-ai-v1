import { collection, doc, getDocs, setDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import type { FilterOptions } from '../types/enhanced';
import { createLogger } from '../utils/logger';

const logger = createLogger('FilterPersistenceService');

// Interface para filtros salvos
export interface SavedFilter {
  id: string;
  name: string;
  description?: string;
  filters: FilterOptions;
  userId: string;
  isDefault?: boolean;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Chaves para localStorage
const STORAGE_KEYS = {
  CURRENT_FILTERS: 'dashboard_current_filters',
  FILTER_HISTORY: 'dashboard_filter_history',
  PREFERENCES: 'dashboard_filter_preferences'
};

export class FilterPersistenceService {
  /**
   * Salva os filtros atuais no localStorage automaticamente
   */
  static saveCurrentFilters(filters: FilterOptions): void {
    try {
      const filtersToSave = {
        ...filters,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem(STORAGE_KEYS.CURRENT_FILTERS, JSON.stringify(filtersToSave));
      
      // Adicionar ao histórico
      this.addToFilterHistory(filters);
      
      logger.debug('Filtros salvos automaticamente', { filters });
    } catch (error) {
      logger.error('Erro ao salvar filtros atuais', error);
    }
  }

  /**
   * Carrega os filtros salvos do localStorage
   */
  static loadCurrentFilters(): FilterOptions | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_FILTERS);
      if (!saved) return null;

      const parsed = JSON.parse(saved);
      
      // Verificar se não está muito antigo (mais de 7 dias)
      const timestamp = new Date(parsed.timestamp);
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      if (timestamp < sevenDaysAgo) {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_FILTERS);
        return null;
      }

      // Remover campos de controle antes de retornar
      delete parsed.timestamp;
      
      return parsed as FilterOptions;
    } catch (error) {
      logger.error('Erro ao carregar filtros salvos', error);
      return null;
    }
  }

  /**
   * Adiciona filtros ao histórico de uso
   */
  private static addToFilterHistory(filters: FilterOptions): void {
    try {
      const historyRaw = localStorage.getItem(STORAGE_KEYS.FILTER_HISTORY);
      let history: Array<{ filters: FilterOptions; timestamp: string; hash: string }> = 
        historyRaw ? JSON.parse(historyRaw) : [];

      // Criar hash simples dos filtros para evitar duplicatas
      const hash = this.createFilterHash(filters);
      
      // Verificar se já existe no histórico recente
      const existingIndex = history.findIndex(item => item.hash === hash);
      
      if (existingIndex >= 0) {
        // Atualizar timestamp do existente
        history[existingIndex].timestamp = new Date().toISOString();
      } else {
        // Adicionar novo item
        history.unshift({
          filters,
          timestamp: new Date().toISOString(),
          hash
        });
      }

      // Manter apenas os últimos 20 filtros
      history = history.slice(0, 20);

      localStorage.setItem(STORAGE_KEYS.FILTER_HISTORY, JSON.stringify(history));
    } catch (error) {
      logger.error('Erro ao adicionar ao histórico de filtros', error);
    }
  }

  /**
   * Obtém o histórico de filtros usados
   */
  static getFilterHistory(): Array<{ filters: FilterOptions; timestamp: string; description: string }> {
    try {
      const historyRaw = localStorage.getItem(STORAGE_KEYS.FILTER_HISTORY);
      if (!historyRaw) return [];

      const history = JSON.parse(historyRaw);
      
      return history.map((item: any) => ({
        filters: item.filters,
        timestamp: item.timestamp,
        description: this.generateFilterDescription(item.filters)
      }));
    } catch (error) {
      logger.error('Erro ao obter histórico de filtros', error);
      return [];
    }
  }

  /**
   * Salva um preset de filtro nomeado no Firebase
   */
  static async saveFilterPreset(
    userId: string,
    name: string,
    filters: FilterOptions,
    description?: string
  ): Promise<string> {
    try {
      const presetId = `preset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const preset: SavedFilter = {
        id: presetId,
        name: name.trim(),
        description: description?.trim(),
        filters,
        userId,
        isDefault: false,
        usageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(doc(db, 'filter_presets', presetId), preset);
      
      logger.info('Preset de filtro salvo', { presetId, name });
      return presetId;
    } catch (error) {
      logger.error('Erro ao salvar preset de filtro', error);
      throw new Error('Falha ao salvar preset de filtro');
    }
  }

  /**
   * Carrega os presets de filtro do usuário
   */
  static async loadFilterPresets(userId: string): Promise<SavedFilter[]> {
    try {
      const q = query(
        collection(db, 'filter_presets'),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      );

      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as SavedFilter[];
    } catch (error) {
      logger.error('Erro ao carregar presets de filtro', error);
      return [];
    }
  }

  /**
   * Atualiza um preset existente
   */
  static async updateFilterPreset(
    presetId: string,
    updates: Partial<Pick<SavedFilter, 'name' | 'description' | 'filters'>>
  ): Promise<void> {
    try {
      const updateData = {
        ...updates,
        updatedAt: new Date()
      };

      await setDoc(doc(db, 'filter_presets', presetId), updateData, { merge: true });
      
      logger.info('Preset de filtro atualizado', { presetId });
    } catch (error) {
      logger.error('Erro ao atualizar preset de filtro', error);
      throw new Error('Falha ao atualizar preset de filtro');
    }
  }

  /**
   * Remove um preset de filtro
   */
  static async deleteFilterPreset(presetId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'filter_presets', presetId));
      
      logger.info('Preset de filtro removido', { presetId });
    } catch (error) {
      logger.error('Erro ao remover preset de filtro', error);
      throw new Error('Falha ao remover preset de filtro');
    }
  }

  /**
   * Incrementa o contador de uso de um preset
   */
  static async incrementPresetUsage(presetId: string): Promise<void> {
    try {
      // Para incremento, usamos uma transação simples
      const presetRef = doc(db, 'filter_presets', presetId);
      
      // Como não temos transações, vamos fazer um update simples
      await setDoc(presetRef, {
        usageCount: (await this.getPresetUsageCount(presetId)) + 1,
        updatedAt: new Date()
      }, { merge: true });
      
      logger.debug('Uso do preset incrementado', { presetId });
    } catch (error) {
      logger.error('Erro ao incrementar uso do preset', error);
    }
  }

  /**
   * Obtém o contador de uso atual de um preset
   */
  private static async getPresetUsageCount(presetId: string): Promise<number> {
    try {
      const q = query(collection(db, 'filter_presets'), where('id', '==', presetId));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        return snapshot.docs[0].data().usageCount || 0;
      }
      
      return 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Cria presets padrão para novos usuários
   */
  static async createDefaultPresets(userId: string): Promise<void> {
    try {
      const defaultPresets: Array<Pick<SavedFilter, 'name' | 'description' | 'filters'>> = [
        {
          name: 'Conteúdo Recente',
          description: 'Projetos criados nos últimos 7 dias',
          filters: {
            dateRange: {
              start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              end: new Date()
            },
            sortBy: 'date',
            sortOrder: 'desc'
          }
        },
        {
          name: 'Favoritos',
          description: 'Apenas projetos marcados como favoritos',
          filters: {
            isFavorite: true,
            sortBy: 'date',
            sortOrder: 'desc'
          }
        },
        {
          name: 'Rascunhos Pendentes',
          description: 'Projetos ainda não finalizados',
          filters: {
            status: ['draft'],
            sortBy: 'date',
            sortOrder: 'desc'
          }
        },
        {
          name: 'Conteúdo Instagram',
          description: 'Todos os projetos para Instagram',
          filters: {
            platforms: ['instagram'],
            sortBy: 'date',
            sortOrder: 'desc'
          }
        }
      ];

      for (const preset of defaultPresets) {
        await this.saveFilterPreset(
          userId,
          preset.name,
          preset.filters,
          preset.description
        );
      }

      logger.info('Presets padrão criados', { userId, count: defaultPresets.length });
    } catch (error) {
      logger.error('Erro ao criar presets padrão', error);
    }
  }

  /**
   * Salva preferências do usuário para filtros
   */
  static saveFilterPreferences(preferences: {
    autoSave: boolean;
    defaultSort: { sortBy: string; sortOrder: 'asc' | 'desc' };
    rememberExpanded: boolean;
    showFilterHistory: boolean;
  }): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences));
      logger.debug('Preferências de filtro salvas', preferences);
    } catch (error) {
      logger.error('Erro ao salvar preferências de filtro', error);
    }
  }

  /**
   * Carrega preferências do usuário para filtros
   */
  static loadFilterPreferences(): {
    autoSave: boolean;
    defaultSort: { sortBy: string; sortOrder: 'asc' | 'desc' };
    rememberExpanded: boolean;
    showFilterHistory: boolean;
  } {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      logger.error('Erro ao carregar preferências de filtro', error);
    }

    // Retornar padrões
    return {
      autoSave: true,
      defaultSort: { sortBy: 'date', sortOrder: 'desc' },
      rememberExpanded: false,
      showFilterHistory: true
    };
  }

  /**
   * Limpa todos os dados de filtros salvos
   */
  static clearAllSavedFilters(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_FILTERS);
      localStorage.removeItem(STORAGE_KEYS.FILTER_HISTORY);
      
      logger.info('Todos os filtros salvos foram limpos');
    } catch (error) {
      logger.error('Erro ao limpar filtros salvos', error);
    }
  }

  /**
   * Gera hash simples para filtros (para comparação)
   */
  private static createFilterHash(filters: FilterOptions): string {
    const key = JSON.stringify({
      platforms: filters.platforms?.sort(),
      formats: filters.formats?.sort(),
      status: filters.status?.sort(),
      tags: filters.tags?.sort(),
      folderId: filters.folderId,
      isFavorite: filters.isFavorite,
      dateRange: filters.dateRange ? {
        start: filters.dateRange.start.toISOString().split('T')[0],
        end: filters.dateRange.end.toISOString().split('T')[0]
      } : undefined
    });
    
    // Hash simples
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36);
  }

  /**
   * Gera descrição legível dos filtros
   */
  private static generateFilterDescription(filters: FilterOptions): string {
    const parts: string[] = [];

    if (filters.platforms?.length) {
      parts.push(`${filters.platforms.length} plataforma${filters.platforms.length > 1 ? 's' : ''}`);
    }

    if (filters.status?.length) {
      parts.push(`Status: ${filters.status.join(', ')}`);
    }

    if (filters.tags?.length) {
      parts.push(`${filters.tags.length} tag${filters.tags.length > 1 ? 's' : ''}`);
    }

    if (filters.isFavorite) {
      parts.push('Favoritos');
    }

    if (filters.dateRange) {
      parts.push('Com período definido');
    }

    return parts.length > 0 ? parts.join(' • ') : 'Filtros básicos';
  }
} 