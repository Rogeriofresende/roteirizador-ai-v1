import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  updateDoc,
  deleteDoc,
  Timestamp,
  increment
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import type { 
  ScriptTemplate,
  TemplateSection,
  TemplatePlaceholder,
  Script
} from '../types';

export class TemplateService {
  private static templatesCache: Map<string, ScriptTemplate[]> = new Map();
  private static cacheExpiry = 10 * 60 * 1000; // 10 minutos

  // **GESTÃO DE TEMPLATES**

  static async getTemplates(filters?: {
    category?: string;
    platform?: string;
    difficulty?: string;
    searchTerm?: string;
    onlyPublic?: boolean;
    userId?: string;
  }): Promise<ScriptTemplate[]> {
    try {
      const cacheKey = JSON.stringify(filters);
      
      // Verificar cache
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;

      // Construir query base
      let templatesQuery = query(
        collection(db, 'script_templates'),
        orderBy('popularity', 'desc'),
        orderBy('createdAt', 'desc')
      );

      // Aplicar filtros
      if (filters?.onlyPublic !== false) {
        templatesQuery = query(templatesQuery, where('isPublic', '==', true));
      }

      if (filters?.category) {
        templatesQuery = query(templatesQuery, where('category', '==', filters.category));
      }

      if (filters?.difficulty) {
        templatesQuery = query(templatesQuery, where('difficulty', '==', filters.difficulty));
      }

      if (filters?.userId) {
        templatesQuery = query(templatesQuery, where('author.id', '==', filters.userId));
      }

      const snapshot = await getDocs(templatesQuery);
      let templates = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      } as ScriptTemplate));

      // Filtros no lado cliente (por limitações do Firestore)
      if (filters?.platform) {
        templates = templates.filter(template => 
          template.platform.includes(filters.platform!)
        );
      }

      if (filters?.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase();
        templates = templates.filter(template =>
          template.title.toLowerCase().includes(searchTerm) ||
          template.description.toLowerCase().includes(searchTerm) ||
          template.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      }

      // Salvar no cache
      this.setCachedData(cacheKey, templates);

      return templates;

    } catch (error) {
      console.error('Erro ao obter templates:', error);
      return [];
    }
  }

  static async getTemplateById(templateId: string): Promise<ScriptTemplate | null> {
    try {
      const templateDoc = await getDoc(doc(db, 'script_templates', templateId));
      
      if (!templateDoc.exists()) {
        return null;
      }

      return {
        ...templateDoc.data(),
        id: templateDoc.id
      } as ScriptTemplate;

    } catch (error) {
      console.error('Erro ao obter template:', error);
      return null;
    }
  }

  static async getFeaturedTemplates(limit = 6): Promise<ScriptTemplate[]> {
    try {
      const featuredQuery = query(
        collection(db, 'script_templates'),
        where('isPublic', '==', true),
        orderBy('rating', 'desc'),
        orderBy('usage', 'desc'),
        limit(limit)
      );

      const snapshot = await getDocs(featuredQuery);
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      } as ScriptTemplate));

    } catch (error) {
      console.error('Erro ao obter templates em destaque:', error);
      return [];
    }
  }

  static async getPopularTemplates(category?: string, limit = 10): Promise<ScriptTemplate[]> {
    try {
      let popularQuery = query(
        collection(db, 'script_templates'),
        where('isPublic', '==', true),
        orderBy('popularity', 'desc'),
        limit(limit)
      );

      if (category) {
        popularQuery = query(popularQuery, where('category', '==', category));
      }

      const snapshot = await getDocs(popularQuery);
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      } as ScriptTemplate));

    } catch (error) {
      console.error('Erro ao obter templates populares:', error);
      return [];
    }
  }

  // **CRIAÇÃO E EDIÇÃO DE TEMPLATES**

  static async createTemplate(
    template: Omit<ScriptTemplate, 'id' | 'usage' | 'rating' | 'createdAt' | 'updatedAt'>
  ): Promise<ScriptTemplate> {
    try {
      const templateId = `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const newTemplate: ScriptTemplate = {
        ...template,
        id: templateId,
        usage: 0,
        rating: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      await setDoc(doc(db, 'script_templates', templateId), newTemplate);

      // Invalidar cache
      this.invalidateCache();

      return newTemplate;

    } catch (error) {
      console.error('Erro ao criar template:', error);
      throw error;
    }
  }

  static async updateTemplate(
    templateId: string,
    updates: Partial<ScriptTemplate>
  ): Promise<void> {
    try {
      await updateDoc(doc(db, 'script_templates', templateId), {
        ...updates,
        updatedAt: Timestamp.now()
      });

      // Invalidar cache
      this.invalidateCache();

    } catch (error) {
      console.error('Erro ao atualizar template:', error);
      throw error;
    }
  }

  static async deleteTemplate(templateId: string, userId: string): Promise<void> {
    try {
      // Verificar se o usuário é o autor
      const template = await this.getTemplateById(templateId);
      if (!template || template.author.id !== userId) {
        throw new Error('Não autorizado a deletar este template');
      }

      await deleteDoc(doc(db, 'script_templates', templateId));

      // Invalidar cache
      this.invalidateCache();

    } catch (error) {
      console.error('Erro ao deletar template:', error);
      throw error;
    }
  }

  // **USO DE TEMPLATES**

  static async useTemplate(
    templateId: string,
    userId: string,
    placeholderValues: Record<string, any>
  ): Promise<Script> {
    try {
      const template = await this.getTemplateById(templateId);
      if (!template) {
        throw new Error('Template não encontrado');
      }

      // Processar conteúdo do template
      const processedContent = this.processTemplate(template, placeholderValues);

      // Criar novo script baseado no template
      const script: Omit<Script, 'id'> = {
        userId,
        title: this.replacePlaceholders(template.title, placeholderValues),
        content: processedContent,
        platform: template.platform[0] || 'youtube',
        duration: this.estimateDuration(processedContent),
        tags: [...template.tags],
        isPublic: false,
        metadata: {
          fromTemplate: templateId,
          templateTitle: template.title,
          processedAt: new Date()
        },
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      // Incrementar uso do template
      await this.incrementTemplateUsage(templateId);

      // Registrar uso para analytics
      await this.trackTemplateUsage(templateId, userId);

      return script as Script;

    } catch (error) {
      console.error('Erro ao usar template:', error);
      throw error;
    }
  }

  private static processTemplate(
    template: ScriptTemplate,
    placeholderValues: Record<string, any>
  ): string {
    let content = '';

    // Processar cada seção do template
    template.structure.forEach(section => {
      content += `${section.title ? section.title + '\n\n' : ''}`;
      content += this.replacePlaceholders(section.content, placeholderValues);
      content += '\n\n';
    });

    return content.trim();
  }

  private static replacePlaceholders(text: string, values: Record<string, any>): string {
    let result = text;

    // Substituir placeholders no formato {{placeholder}}
    const placeholderRegex = /\{\{(\w+)\}\}/g;
    result = result.replace(placeholderRegex, (match, placeholder) => {
      return values[placeholder] !== undefined ? String(values[placeholder]) : match;
    });

    // Processar condicionais simples {{if:condition}}content{{/if}}
    const conditionalRegex = /\{\{if:(\w+)\}\}(.*?)\{\{\/if\}\}/gs;
    result = result.replace(conditionalRegex, (match, condition, content) => {
      return values[condition] ? content : '';
    });

    return result;
  }

  private static estimateDuration(content: string): number {
    // Estimar duração baseada no número de palavras
    // Assume 150 palavras por minuto de fala
    const words = content.split(/\s+/).length;
    return Math.ceil((words / 150) * 60); // em segundos
  }

  // **AVALIAÇÃO E FEEDBACK**

  static async rateTemplate(
    templateId: string,
    userId: string,
    rating: number
  ): Promise<void> {
    try {
      if (rating < 1 || rating > 5) {
        throw new Error('Avaliação deve ser entre 1 e 5');
      }

      // Registrar avaliação individual
      const ratingId = `rating_${templateId}_${userId}`;
      await setDoc(doc(db, 'template_ratings', ratingId), {
        templateId,
        userId,
        rating,
        createdAt: Timestamp.now()
      });

      // Atualizar média do template
      await this.updateTemplateRating(templateId);

    } catch (error) {
      console.error('Erro ao avaliar template:', error);
      throw error;
    }
  }

  private static async updateTemplateRating(templateId: string): Promise<void> {
    try {
      // Obter todas as avaliações do template
      const ratingsQuery = query(
        collection(db, 'template_ratings'),
        where('templateId', '==', templateId)
      );
      const ratingsSnapshot = await getDocs(ratingsQuery);
      
      if (ratingsSnapshot.empty) return;

      // Calcular média
      const ratings = ratingsSnapshot.docs.map(doc => doc.data().rating);
      const averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;

      // Atualizar template
      await updateDoc(doc(db, 'script_templates', templateId), {
        rating: Math.round(averageRating * 100) / 100
      });

    } catch (error) {
      console.error('Erro ao atualizar avaliação do template:', error);
    }
  }

  // **CATEGORIAS E ORGANIZAÇÃO**

  static getCategories(): Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
  }> {
    return [
      {
        id: 'educational',
        name: 'Educacional',
        description: 'Templates para conteúdo educativo e tutoriais',
        icon: '🎓'
      },
      {
        id: 'entertainment',
        name: 'Entretenimento',
        description: 'Templates para conteúdo divertido e viral',
        icon: '🎭'
      },
      {
        id: 'marketing',
        name: 'Marketing',
        description: 'Templates para vendas e promoção de produtos',
        icon: '💼'
      },
      {
        id: 'news',
        name: 'Notícias',
        description: 'Templates para conteúdo jornalístico',
        icon: '📰'
      },
      {
        id: 'tutorial',
        name: 'Tutorial',
        description: 'Templates para ensinar processos passo a passo',
        icon: '🛠️'
      },
      {
        id: 'review',
        name: 'Review',
        description: 'Templates para análises e críticas',
        icon: '⭐'
      },
      {
        id: 'story',
        name: 'História',
        description: 'Templates para narrativas e storytelling',
        icon: '📚'
      }
    ];
  }

  static getDifficultyLevels(): Array<{
    id: string;
    name: string;
    description: string;
    color: string;
  }> {
    return [
      {
        id: 'beginner',
        name: 'Iniciante',
        description: 'Fácil de usar, ideal para começar',
        color: 'green'
      },
      {
        id: 'intermediate',
        name: 'Intermediário',
        description: 'Requer alguma experiência',
        color: 'yellow'
      },
      {
        id: 'advanced',
        name: 'Avançado',
        description: 'Para usuários experientes',
        color: 'red'
      }
    ];
  }

  // **TEMPLATES PADRÃO**

  static async createDefaultTemplates(): Promise<void> {
    try {
      const defaultTemplates = this.getDefaultTemplatesData();

      for (const templateData of defaultTemplates) {
        const existingTemplate = await this.getTemplateById(templateData.id);
        
        if (!existingTemplate) {
          await setDoc(doc(db, 'script_templates', templateData.id), templateData);
        }
      }

    } catch (error) {
      console.error('Erro ao criar templates padrão:', error);
    }
  }

  private static getDefaultTemplatesData(): ScriptTemplate[] {
    return [
      {
        id: 'youtube_tutorial_basic',
        title: 'Tutorial Básico para YouTube',
        description: 'Template simples para criar tutoriais passo a passo no YouTube',
        category: 'tutorial',
        platform: ['youtube'],
        duration: { min: 300, max: 600 },
        structure: [
          {
            id: 'intro',
            title: 'Introdução',
            description: 'Apresentação do vídeo',
            content: `Olá pessoal! Sejam bem-vindos ao meu canal!\n\nNo vídeo de hoje, eu vou ensinar vocês como {{skill}}.\n\nSe você quer aprender {{benefit}}, esse vídeo é pra você!`,
            order: 1,
            duration: 30,
            isRequired: true,
            suggestions: ['Seja entusiasmado', 'Explique o valor do conteúdo']
          },
          {
            id: 'content',
            title: 'Conteúdo Principal',
            description: 'Desenvolvimento do tutorial',
            content: `Primeiro, {{step1}}.\n\nDepois, {{step2}}.\n\nPor fim, {{step3}}.\n\nVamos ver isso na prática!`,
            order: 2,
            duration: 400,
            isRequired: true,
            suggestions: ['Divida em passos claros', 'Use exemplos práticos']
          },
          {
            id: 'conclusion',
            title: 'Conclusão',
            description: 'Encerramento do vídeo',
            content: `E aí, gostaram? {{skill}} é mais fácil do que parece, né?\n\nSe o vídeo ajudou, deixa o like e se inscreve no canal!\n\nNos comentários, conta pra mim: {{question}}\n\nAté o próximo vídeo!`,
            order: 3,
            duration: 60,
            isRequired: true,
            suggestions: ['Peça engajamento', 'Faça uma pergunta']
          }
        ],
        placeholders: [
          {
            id: 'skill',
            name: 'Habilidade',
            description: 'O que será ensinado no tutorial',
            type: 'text',
            validation: { required: true, minLength: 5, maxLength: 100 }
          },
          {
            id: 'benefit',
            name: 'Benefício',
            description: 'Qual benefício o espectador terá',
            type: 'text',
            validation: { required: true, minLength: 10, maxLength: 150 }
          },
          {
            id: 'step1',
            name: 'Primeiro Passo',
            description: 'Primeiro passo do tutorial',
            type: 'text',
            validation: { required: true }
          },
          {
            id: 'step2',
            name: 'Segundo Passo',
            description: 'Segundo passo do tutorial',
            type: 'text',
            validation: { required: true }
          },
          {
            id: 'step3',
            name: 'Terceiro Passo',
            description: 'Terceiro passo do tutorial',
            type: 'text',
            validation: { required: true }
          },
          {
            id: 'question',
            name: 'Pergunta de Engajamento',
            description: 'Pergunta para os comentários',
            type: 'text',
            validation: { required: true }
          }
        ],
        examples: [
          'Como fazer cookies caseiros',
          'Tutorial de maquiagem para iniciantes',
          'Como plantar suculentas'
        ],
        tags: ['tutorial', 'youtube', 'passo-a-passo', 'ensino'],
        difficulty: 'beginner',
        popularity: 150,
        usage: 1250,
        rating: 4.7,
        author: {
          id: 'system',
          name: 'Roteirar IA',
          verified: true
        },
        isPremium: false,
        isPublic: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      },
      {
        id: 'instagram_story_promo',
        title: 'Promoção para Stories do Instagram',
        description: 'Template para criar stories promocionais engajantes',
        category: 'marketing',
        platform: ['instagram'],
        duration: { min: 15, max: 30 },
        structure: [
          {
            id: 'hook',
            title: 'Gancho',
            description: 'Chamar atenção nos primeiros segundos',
            content: `🔥 {{urgency}} 🔥\n\n{{product}} com {{discount}}% OFF!`,
            order: 1,
            duration: 5,
            isRequired: true,
            suggestions: ['Use emojis chamativos', 'Crie urgência']
          },
          {
            id: 'benefits',
            title: 'Benefícios',
            description: 'Destacar os principais benefícios',
            content: `✅ {{benefit1}}\n✅ {{benefit2}}\n✅ {{benefit3}}`,
            order: 2,
            duration: 10,
            isRequired: true,
            suggestions: ['Use bullet points', 'Foque em resultados']
          },
          {
            id: 'cta',
            title: 'Call to Action',
            description: 'Chamada para ação',
            content: `Desliza pra cima e garante o seu!\n\n⏰ Só até {{deadline}}!`,
            order: 3,
            duration: 5,
            isRequired: true,
            suggestions: ['Seja claro e direto', 'Crie escassez']
          }
        ],
        placeholders: [
          {
            id: 'urgency',
            name: 'Urgência',
            description: 'Frase de urgência',
            type: 'select',
            options: ['ÚLTIMAS HORAS', 'SUPER PROMOÇÃO', 'OFERTA RELÂMPAGO', 'QUEIMA DE ESTOQUE'],
            validation: { required: true }
          },
          {
            id: 'product',
            name: 'Produto',
            description: 'Nome do produto em promoção',
            type: 'text',
            validation: { required: true, maxLength: 50 }
          },
          {
            id: 'discount',
            name: 'Desconto',
            description: 'Porcentagem de desconto',
            type: 'number',
            validation: { required: true }
          },
          {
            id: 'benefit1',
            name: 'Benefício 1',
            description: 'Primeiro benefício do produto',
            type: 'text',
            validation: { required: true, maxLength: 80 }
          },
          {
            id: 'benefit2',
            name: 'Benefício 2',
            description: 'Segundo benefício do produto',
            type: 'text',
            validation: { required: true, maxLength: 80 }
          },
          {
            id: 'benefit3',
            name: 'Benefício 3',
            description: 'Terceiro benefício do produto',
            type: 'text',
            validation: { required: true, maxLength: 80 }
          },
          {
            id: 'deadline',
            name: 'Prazo',
            description: 'Quando a promoção termina',
            type: 'text',
            validation: { required: true }
          }
        ],
        examples: [
          'Curso online com desconto',
          'Produto físico em promoção',
          'Serviço com oferta especial'
        ],
        tags: ['marketing', 'instagram', 'promoção', 'vendas', 'stories'],
        difficulty: 'beginner',
        popularity: 200,
        usage: 890,
        rating: 4.5,
        author: {
          id: 'system',
          name: 'Roteirar IA',
          verified: true
        },
        isPremium: false,
        isPublic: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }
    ];
  }

  // **ANALYTICS E TRACKING**

  private static async incrementTemplateUsage(templateId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'script_templates', templateId), {
        usage: increment(1),
        popularity: increment(1)
      });
    } catch (error) {
      console.error('Erro ao incrementar uso do template:', error);
    }
  }

  private static async trackTemplateUsage(templateId: string, userId: string): Promise<void> {
    try {
      const trackingId = `usage_${templateId}_${userId}_${Date.now()}`;
      await setDoc(doc(db, 'template_usage_tracking', trackingId), {
        templateId,
        userId,
        usedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Erro ao rastrear uso do template:', error);
    }
  }

  static async getTemplateAnalytics(templateId: string): Promise<{
    totalUsage: number;
    uniqueUsers: number;
    averageRating: number;
    ratingCount: number;
    recentUsage: { date: string; count: number }[];
  }> {
    try {
      const template = await this.getTemplateById(templateId);
      if (!template) {
        throw new Error('Template não encontrado');
      }

      // Obter contagem de avaliações
      const ratingsQuery = query(
        collection(db, 'template_ratings'),
        where('templateId', '==', templateId)
      );
      const ratingsSnapshot = await getDocs(ratingsQuery);

      // Obter uso recente (últimos 30 dias)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const usageQuery = query(
        collection(db, 'template_usage_tracking'),
        where('templateId', '==', templateId),
        where('usedAt', '>=', Timestamp.fromDate(thirtyDaysAgo))
      );
      const usageSnapshot = await getDocs(usageQuery);

      // Calcular usuários únicos
      const uniqueUserIds = new Set(
        usageSnapshot.docs.map(doc => doc.data().userId)
      );

      // Calcular uso por dia
      const usageByDay: Record<string, number> = {};
      usageSnapshot.docs.forEach(doc => {
        const date = doc.data().usedAt.toDate().toISOString().split('T')[0];
        usageByDay[date] = (usageByDay[date] || 0) + 1;
      });

      const recentUsage = Object.entries(usageByDay)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return {
        totalUsage: template.usage,
        uniqueUsers: uniqueUserIds.size,
        averageRating: template.rating,
        ratingCount: ratingsSnapshot.size,
        recentUsage
      };

    } catch (error) {
      console.error('Erro ao obter analytics do template:', error);
      return {
        totalUsage: 0,
        uniqueUsers: 0,
        averageRating: 0,
        ratingCount: 0,
        recentUsage: []
      };
    }
  }

  // **CACHE MANAGEMENT**

  private static getCachedData(key: string): ScriptTemplate[] | null {
    const cached = this.templatesCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }
    return null;
  }

  private static setCachedData(key: string, data: ScriptTemplate[]): void {
    this.templatesCache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  private static invalidateCache(): void {
    this.templatesCache.clear();
  }

  // **VALIDAÇÃO DE TEMPLATES**

  static validateTemplate(template: Partial<ScriptTemplate>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!template.title || template.title.length < 5) {
      errors.push('Título deve ter pelo menos 5 caracteres');
    }

    if (!template.description || template.description.length < 20) {
      errors.push('Descrição deve ter pelo menos 20 caracteres');
    }

    if (!template.category) {
      errors.push('Categoria é obrigatória');
    }

    if (!template.platform || template.platform.length === 0) {
      errors.push('Pelo menos uma plataforma deve ser selecionada');
    }

    if (!template.structure || template.structure.length === 0) {
      errors.push('Template deve ter pelo menos uma seção');
    }

    if (template.structure) {
      template.structure.forEach((section, index) => {
        if (!section.title || section.title.length < 3) {
          errors.push(`Seção ${index + 1}: título muito curto`);
        }
        if (!section.content || section.content.length < 10) {
          errors.push(`Seção ${index + 1}: conteúdo muito curto`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // **DUPLICAÇÃO E CUSTOMIZAÇÃO**

  static async duplicateTemplate(
    templateId: string,
    userId: string,
    newTitle?: string
  ): Promise<ScriptTemplate> {
    try {
      const originalTemplate = await this.getTemplateById(templateId);
      if (!originalTemplate) {
        throw new Error('Template não encontrado');
      }

      const duplicatedTemplate = {
        ...originalTemplate,
        title: newTitle || `${originalTemplate.title} (Cópia)`,
        author: {
          id: userId,
          name: 'Usuário', // Seria obtido do perfil
          verified: false
        },
        isPublic: false,
        usage: 0,
        rating: 0,
        popularity: 0
      };

      delete (duplicatedTemplate as any).id;

      return await this.createTemplate(duplicatedTemplate);

    } catch (error) {
      console.error('Erro ao duplicar template:', error);
      throw error;
    }
  }

  // **IMPORTAÇÃO E EXPORTAÇÃO**

  static async exportTemplate(templateId: string): Promise<string> {
    try {
      const template = await this.getTemplateById(templateId);
      if (!template) {
        throw new Error('Template não encontrado');
      }

      // Remover dados desnecessários para exportação
      const exportData = {
        ...template,
        usage: undefined,
        rating: undefined,
        popularity: undefined,
        createdAt: undefined,
        updatedAt: undefined
      };

      return JSON.stringify(exportData, null, 2);

    } catch (error) {
      console.error('Erro ao exportar template:', error);
      throw error;
    }
  }

  static async importTemplate(
    templateData: string,
    userId: string
  ): Promise<ScriptTemplate> {
    try {
      const parsedTemplate = JSON.parse(templateData);
      
      // Validar template
      const validation = this.validateTemplate(parsedTemplate);
      if (!validation.isValid) {
        throw new Error(`Template inválido: ${validation.errors.join(', ')}`);
      }

      // Ajustar dados para importação
      parsedTemplate.author = {
        id: userId,
        name: 'Usuário', // Seria obtido do perfil
        verified: false
      };
      parsedTemplate.isPublic = false;
      delete parsedTemplate.id;

      return await this.createTemplate(parsedTemplate);

    } catch (error) {
      console.error('Erro ao importar template:', error);
      throw error;
    }
  }
} 