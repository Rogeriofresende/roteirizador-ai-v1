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
  Timestamp,
  startAfter,
  aggregateField,
  aggregate,
  AggregateQuerySnapshot,
  sum,
  average,
  count
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import type { 
  AdvancedAnalytics,
  ProductivityInsight,
  Script,
  AIRefinementRequest,
  CollaborationSession,
  VoiceSynthesis
} from '../types';

export class AdvancedAnalyticsService {
  private static analyticsCache: Map<string, any> = new Map();
  private static cacheExpiry = 5 * 60 * 1000; // 5 minutos

  // **ANALYTICS PRINCIPAIS**

  static async getUserAnalytics(
    userId: string,
    period: { start: Date; end: Date }
  ): Promise<AdvancedAnalytics> {
    try {
      const cacheKey = `analytics_${userId}_${period.start.getTime()}_${period.end.getTime()}`;
      
      // Verificar cache
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;

      // Calcular analytics
      const analytics: AdvancedAnalytics = {
        userId,
        period: {
          start: Timestamp.fromDate(period.start),
          end: Timestamp.fromDate(period.end)
        },
        productivity: await this.calculateProductivityMetrics(userId, period),
        collaboration: await this.calculateCollaborationMetrics(userId, period),
        aiUsage: await this.calculateAIUsageMetrics(userId, period),
        contentQuality: await this.calculateContentQualityMetrics(userId, period),
        platformPerformance: await this.calculatePlatformPerformance(userId, period)
      };

      // Salvar no cache
      this.setCachedData(cacheKey, analytics);

      // Salvar snapshot para histórico
      await this.saveAnalyticsSnapshot(analytics);

      return analytics;

    } catch (error) {
      console.error('Erro ao obter analytics do usuário:', error);
      throw error;
    }
  }

  // **MÉTRICAS DE PRODUTIVIDADE**

  private static async calculateProductivityMetrics(
    userId: string,
    period: { start: Date; end: Date }
  ): Promise<AdvancedAnalytics['productivity']> {
    try {
      // Projetos criados no período
      const projectsQuery = query(
        collection(db, 'scripts'),
        where('userId', '==', userId),
        where('createdAt', '>=', Timestamp.fromDate(period.start)),
        where('createdAt', '<=', Timestamp.fromDate(period.end))
      );
      const projectsSnapshot = await getDocs(projectsQuery);
      const projects = projectsSnapshot.docs.map(doc => doc.data() as Script);

      // Calcular métricas básicas
      const totalProjectsCreated = projects.length;
      const totalWordsWritten = projects.reduce((sum, project) => 
        sum + (project.content ? project.content.split(' ').length : 0), 0
      );

      // Sessões de edição (simulado - seria obtido de logs de atividade)
      const totalEditingSessions = await this.getEditingSessions(userId, period);
      const averageSessionDuration = await this.getAverageSessionDuration(userId, period);

      // Horários de pico de produtividade
      const peakProductivityHours = await this.calculatePeakHours(userId, period);

      // Tendência de produtividade (comparar com período anterior)
      const previousPeriod = {
        start: new Date(period.start.getTime() - (period.end.getTime() - period.start.getTime())),
        end: period.start
      };
      const previousMetrics = await this.getProductivityTrend(userId, previousPeriod);
      const productivityTrend = totalProjectsCreated > 0 && previousMetrics.projects > 0 
        ? ((totalProjectsCreated - previousMetrics.projects) / previousMetrics.projects) * 100
        : 0;

      // Métricas de eficiência
      const efficiency = await this.calculateEfficiencyMetrics(userId, period);

      return {
        totalProjectsCreated,
        totalWordsWritten,
        totalEditingSessions,
        averageSessionDuration,
        peakProductivityHours,
        productivityTrend,
        efficiency
      };

    } catch (error) {
      console.error('Erro ao calcular métricas de produtividade:', error);
      return {
        totalProjectsCreated: 0,
        totalWordsWritten: 0,
        totalEditingSessions: 0,
        averageSessionDuration: 0,
        peakProductivityHours: [],
        productivityTrend: 0,
        efficiency: {
          wordsPerMinute: 0,
          editsPerMinute: 0,
          aiAssistanceRatio: 0
        }
      };
    }
  }

  private static async calculateEfficiencyMetrics(
    userId: string,
    period: { start: Date; end: Date }
  ): Promise<AdvancedAnalytics['productivity']['efficiency']> {
    try {
      // Palavras por minuto (baseado em sessões de edição)
      const totalWords = await this.getTotalWordsInPeriod(userId, period);
      const totalMinutes = await this.getTotalEditingMinutes(userId, period);
      const wordsPerMinute = totalMinutes > 0 ? totalWords / totalMinutes : 0;

      // Edições por minuto
      const totalEdits = await this.getTotalEditsInPeriod(userId, period);
      const editsPerMinute = totalMinutes > 0 ? totalEdits / totalMinutes : 0;

      // Taxa de assistência da IA
      const aiRequests = await this.getAIRequestsInPeriod(userId, period);
      const totalActions = totalEdits + aiRequests;
      const aiAssistanceRatio = totalActions > 0 ? aiRequests / totalActions : 0;

      return {
        wordsPerMinute: Math.round(wordsPerMinute * 100) / 100,
        editsPerMinute: Math.round(editsPerMinute * 100) / 100,
        aiAssistanceRatio: Math.round(aiAssistanceRatio * 100) / 100
      };

    } catch (error) {
      console.error('Erro ao calcular métricas de eficiência:', error);
      return {
        wordsPerMinute: 0,
        editsPerMinute: 0,
        aiAssistanceRatio: 0
      };
    }
  }

  // **MÉTRICAS DE COLABORAÇÃO**

  private static async calculateCollaborationMetrics(
    userId: string,
    period: { start: Date; end: Date }
  ): Promise<AdvancedAnalytics['collaboration']> {
    try {
      // Sessões hospedadas
      const hostedSessionsQuery = query(
        collection(db, 'collaboration_sessions'),
        where('hostUserId', '==', userId),
        where('startedAt', '>=', Timestamp.fromDate(period.start)),
        where('startedAt', '<=', Timestamp.fromDate(period.end))
      );
      const hostedSnapshot = await getDocs(hostedSessionsQuery);
      const sessionsHosted = hostedSnapshot.size;

      // Sessões participadas (seria necessário uma query mais complexa)
      const sessionsParticipated = await this.getParticipatedSessions(userId, period);

      // Comentários dados e recebidos
      const commentsQuery = query(
        collection(db, 'comments'),
        where('userId', '==', userId),
        where('createdAt', '>=', Timestamp.fromDate(period.start)),
        where('createdAt', '<=', Timestamp.fromDate(period.end))
      );
      const commentsSnapshot = await getDocs(commentsQuery);
      const commentsGiven = commentsSnapshot.size;

      const commentsReceived = await this.getCommentsReceived(userId, period);

      // Compartilhamentos
      const sharesSent = await this.getSharesSent(userId, period);
      const sharesReceived = await this.getSharesReceived(userId, period);

      return {
        sessionsHosted,
        sessionsParticipated,
        commentsGiven,
        commentsReceived,
        sharesSent,
        sharesReceived
      };

    } catch (error) {
      console.error('Erro ao calcular métricas de colaboração:', error);
      return {
        sessionsHosted: 0,
        sessionsParticipated: 0,
        commentsGiven: 0,
        commentsReceived: 0,
        sharesSent: 0,
        sharesReceived: 0
      };
    }
  }

  // **MÉTRICAS DE USO DE IA**

  private static async calculateAIUsageMetrics(
    userId: string,
    period: { start: Date; end: Date }
  ): Promise<AdvancedAnalytics['aiUsage']> {
    try {
      // Requisições totais de IA
      const aiRequestsQuery = query(
        collection(db, 'ai_refinement_requests'),
        where('userId', '==', userId),
        where('createdAt', '>=', Timestamp.fromDate(period.start)),
        where('createdAt', '<=', Timestamp.fromDate(period.end))
      );
      const aiRequestsSnapshot = await getDocs(aiRequestsQuery);
      const totalRequests = aiRequestsSnapshot.size;

      // Sugestões bem-sucedidas
      const aiSuggestionsQuery = query(
        collection(db, 'ai_suggestions'),
        where('userId', '==', userId),
        where('createdAt', '>=', Timestamp.fromDate(period.start)),
        where('createdAt', '<=', Timestamp.fromDate(period.end)),
        where('isAccepted', '==', true)
      );
      const suggestionsSnapshot = await getDocs(aiSuggestionsQuery);
      const successfulSuggestions = suggestionsSnapshot.size;

      // Taxa de aceitação
      const acceptanceRate = totalRequests > 0 ? successfulSuggestions / totalRequests : 0;

      // Tipos favoritos de refinamento
      const favoriteTypes = await this.getFavoriteAITypes(userId, period);

      // Tokens consumidos e custo estimado
      const { tokensConsumed, costEstimate } = await this.calculateAICosts(userId, period);

      // Melhoria de qualidade
      const qualityImprovement = await this.calculateQualityImprovement(userId, period);

      return {
        totalRequests,
        successfulSuggestions,
        acceptanceRate: Math.round(acceptanceRate * 100) / 100,
        favoriteTypes,
        tokensConsumed,
        costEstimate,
        qualityImprovement
      };

    } catch (error) {
      console.error('Erro ao calcular métricas de IA:', error);
      return {
        totalRequests: 0,
        successfulSuggestions: 0,
        acceptanceRate: 0,
        favoriteTypes: {},
        tokensConsumed: 0,
        costEstimate: 0,
        qualityImprovement: 0
      };
    }
  }

  // **MÉTRICAS DE QUALIDADE DE CONTEÚDO**

  private static async calculateContentQualityMetrics(
    userId: string,
    period: { start: Date; end: Date }
  ): Promise<AdvancedAnalytics['contentQuality']> {
    try {
      // Obter todos os projetos do período
      const projectsQuery = query(
        collection(db, 'scripts'),
        where('userId', '==', userId),
        where('createdAt', '>=', Timestamp.fromDate(period.start)),
        where('createdAt', '<=', Timestamp.fromDate(period.end))
      );
      const projectsSnapshot = await getDocs(projectsQuery);
      const projects = projectsSnapshot.docs.map(doc => doc.data() as Script);

      if (projects.length === 0) {
        return {
          averageReadabilityScore: 0,
          averageEngagementScore: 0,
          averageSentiment: 0,
          topKeywords: {},
          improvementTrend: 0
        };
      }

      // Calcular scores médios
      let totalReadability = 0;
      let totalEngagement = 0;
      let totalSentiment = 0;
      const keywordCounts: Record<string, number> = {};

      for (const project of projects) {
        // Calcular readability (Flesch Reading Ease simplificado)
        const readability = this.calculateReadabilityScore(project.content || '');
        totalReadability += readability;

        // Calcular engagement (baseado em comprimento, estrutura, etc.)
        const engagement = this.calculateEngagementScore(project);
        totalEngagement += engagement;

        // Calcular sentimento
        const sentiment = this.calculateSentimentScore(project.content || '');
        totalSentiment += sentiment;

        // Extrair keywords
        const keywords = this.extractKeywords(project.content || '');
        keywords.forEach(keyword => {
          keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
        });
      }

      // Médias
      const averageReadabilityScore = totalReadability / projects.length;
      const averageEngagementScore = totalEngagement / projects.length;
      const averageSentiment = totalSentiment / projects.length;

      // Top keywords
      const topKeywords = Object.fromEntries(
        Object.entries(keywordCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10)
      );

      // Tendência de melhoria (comparar com período anterior)
      const improvementTrend = await this.calculateQualityTrend(userId, period);

      return {
        averageReadabilityScore: Math.round(averageReadabilityScore * 100) / 100,
        averageEngagementScore: Math.round(averageEngagementScore * 100) / 100,
        averageSentiment: Math.round(averageSentiment * 100) / 100,
        topKeywords,
        improvementTrend
      };

    } catch (error) {
      console.error('Erro ao calcular métricas de qualidade:', error);
      return {
        averageReadabilityScore: 0,
        averageEngagementScore: 0,
        averageSentiment: 0,
        topKeywords: {},
        improvementTrend: 0
      };
    }
  }

  // **PERFORMANCE POR PLATAFORMA**

  private static async calculatePlatformPerformance(
    userId: string,
    period: { start: Date; end: Date }
  ): Promise<AdvancedAnalytics['platformPerformance']> {
    try {
      const performance: AdvancedAnalytics['platformPerformance'] = {};

      // Obter projetos por plataforma
      const projectsQuery = query(
        collection(db, 'scripts'),
        where('userId', '==', userId),
        where('createdAt', '>=', Timestamp.fromDate(period.start)),
        where('createdAt', '<=', Timestamp.fromDate(period.end))
      );
      const projectsSnapshot = await getDocs(projectsQuery);
      const projects = projectsSnapshot.docs.map(doc => doc.data() as Script);

      // Agrupar por plataforma
      const platformGroups: Record<string, Script[]> = {};
      projects.forEach(project => {
        const platform = project.platform || 'outros';
        if (!platformGroups[platform]) {
          platformGroups[platform] = [];
        }
        platformGroups[platform].push(project);
      });

      // Calcular métricas por plataforma
      for (const [platform, platformProjects] of Object.entries(platformGroups)) {
        const scriptsCreated = platformProjects.length;
        
        // Views e engagement médios (simulado - seria integrado com APIs das plataformas)
        const averageViews = await this.getAverageViews(platformProjects);
        const averageEngagement = await this.getAverageEngagement(platformProjects);
        
        // Taxa de sucesso (baseada em métricas como views, engagement)
        const successRate = this.calculateSuccessRate(platformProjects);

        performance[platform] = {
          scriptsCreated,
          averageViews,
          averageEngagement,
          successRate
        };
      }

      return performance;

    } catch (error) {
      console.error('Erro ao calcular performance por plataforma:', error);
      return {};
    }
  }

  // **INSIGHTS E RECOMENDAÇÕES**

  static async generateProductivityInsights(userId: string): Promise<ProductivityInsight[]> {
    try {
      const insights: ProductivityInsight[] = [];
      
      // Obter analytics dos últimos 30 dias
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
      const analytics = await this.getUserAnalytics(userId, { start: startDate, end: endDate });

      // Insight: Produtividade
      if (analytics.productivity.productivityTrend > 20) {
        insights.push({
          id: `insight_${Date.now()}_1`,
          userId,
          type: 'achievement',
          title: '🚀 Produtividade em Alta!',
          description: `Sua produtividade aumentou ${analytics.productivity.productivityTrend.toFixed(1)}% este mês. Continue assim!`,
          data: { trend: analytics.productivity.productivityTrend },
          priority: 'high',
          isRead: false,
          createdAt: Timestamp.now()
        });
      }

      // Insight: Uso de IA
      if (analytics.aiUsage.acceptanceRate < 0.5 && analytics.aiUsage.totalRequests > 10) {
        insights.push({
          id: `insight_${Date.now()}_2`,
          userId,
          type: 'tip',
          title: '💡 Dica: Melhore o uso da IA',
          description: `Sua taxa de aceitação de sugestões da IA é ${(analytics.aiUsage.acceptanceRate * 100).toFixed(1)}%. Tente ser mais específico nas suas solicitações.`,
          data: { acceptanceRate: analytics.aiUsage.acceptanceRate },
          priority: 'medium',
          isRead: false,
          createdAt: Timestamp.now()
        });
      }

      // Insight: Horários de pico
      if (analytics.productivity.peakProductivityHours.length > 0) {
        const peakHour = analytics.productivity.peakProductivityHours[0];
        insights.push({
          id: `insight_${Date.now()}_3`,
          userId,
          type: 'tip',
          title: '⏰ Seu Horário de Pico',
          description: `Você é mais produtivo às ${peakHour}h. Agende suas tarefas mais importantes para este horário.`,
          data: { peakHour },
          priority: 'low',
          isRead: false,
          createdAt: Timestamp.now()
        });
      }

      // Insight: Colaboração
      if (analytics.collaboration.sessionsHosted > 5) {
        insights.push({
          id: `insight_${Date.now()}_4`,
          userId,
          type: 'achievement',
          title: '🤝 Líder Colaborativo',
          description: `Você hospedou ${analytics.collaboration.sessionsHosted} sessões de colaboração este mês. Ótimo trabalho em equipe!`,
          data: { sessions: analytics.collaboration.sessionsHosted },
          priority: 'medium',
          isRead: false,
          createdAt: Timestamp.now()
        });
      }

      // Salvar insights no Firebase
      for (const insight of insights) {
        await setDoc(doc(db, 'productivity_insights', insight.id), insight);
      }

      return insights;

    } catch (error) {
      console.error('Erro ao gerar insights:', error);
      return [];
    }
  }

  // **COMPARAÇÕES E BENCHMARKS**

  static async compareWithAverage(userId: string): Promise<{
    productivity: number; // % em relação à média
    aiUsage: number;
    contentQuality: number;
    collaboration: number;
  }> {
    try {
      // Obter métricas do usuário
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
      const userAnalytics = await this.getUserAnalytics(userId, { start: startDate, end: endDate });

      // Obter médias globais (seria cachado e atualizado periodicamente)
      const globalAverages = await this.getGlobalAverages();

      return {
        productivity: this.calculatePercentageVsAverage(
          userAnalytics.productivity.totalProjectsCreated,
          globalAverages.avgProjectsPerMonth
        ),
        aiUsage: this.calculatePercentageVsAverage(
          userAnalytics.aiUsage.totalRequests,
          globalAverages.avgAIRequestsPerMonth
        ),
        contentQuality: this.calculatePercentageVsAverage(
          userAnalytics.contentQuality.averageReadabilityScore,
          globalAverages.avgReadabilityScore
        ),
        collaboration: this.calculatePercentageVsAverage(
          userAnalytics.collaboration.sessionsHosted + userAnalytics.collaboration.sessionsParticipated,
          globalAverages.avgCollaborationSessions
        )
      };

    } catch (error) {
      console.error('Erro ao comparar com média:', error);
      return { productivity: 0, aiUsage: 0, contentQuality: 0, collaboration: 0 };
    }
  }

  // **HELPER METHODS**

  private static getCachedData(key: string): any {
    const cached = this.analyticsCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }
    return null;
  }

  private static setCachedData(key: string, data: any): void {
    this.analyticsCache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  private static async saveAnalyticsSnapshot(analytics: AdvancedAnalytics): Promise<void> {
    try {
      const snapshotId = `snapshot_${analytics.userId}_${Date.now()}`;
      await setDoc(doc(db, 'analytics_snapshots', snapshotId), analytics);
    } catch (error) {
      console.error('Erro ao salvar snapshot de analytics:', error);
    }
  }

  private static calculateReadabilityScore(text: string): number {
    // Implementação simplificada do Flesch Reading Ease
    const sentences = text.split(/[.!?]+/).length - 1;
    const words = text.split(/\s+/).length;
    const syllables = this.countSyllables(text);

    if (sentences === 0 || words === 0) return 0;

    const avgSentenceLength = words / sentences;
    const avgSyllablesPerWord = syllables / words;

    const score = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
    return Math.max(0, Math.min(100, score));
  }

  private static countSyllables(text: string): number {
    // Contagem simplificada de sílabas
    return text.toLowerCase()
      .replace(/[^a-z]/g, '')
      .replace(/[aeiou]{2,}/g, 'a')
      .replace(/[^aeiou]/g, '')
      .length || 1;
  }

  private static calculateEngagementScore(project: Script): number {
    let score = 50; // Base score

    const content = project.content || '';
    const wordCount = content.split(' ').length;

    // Penalizar textos muito curtos ou muito longos
    if (wordCount < 100) score -= 20;
    if (wordCount > 2000) score -= 10;
    if (wordCount >= 200 && wordCount <= 800) score += 15;

    // Bonificar estrutura
    if (content.includes('\n')) score += 10; // Tem parágrafos
    if (content.includes('?')) score += 5; // Tem perguntas
    if (content.includes('!')) score += 5; // Tem exclamações

    // Bonificar tags relevantes
    if (project.tags && project.tags.length > 0) score += 10;

    return Math.max(0, Math.min(100, score));
  }

  private static calculateSentimentScore(text: string): number {
    // Análise de sentimento simplificada
    const positiveWords = ['bom', 'ótimo', 'excelente', 'fantástico', 'incrível', 'amor', 'feliz'];
    const negativeWords = ['ruim', 'péssimo', 'terrível', 'ódio', 'triste', 'problema', 'difícil'];

    const words = text.toLowerCase().split(/\s+/);
    let sentiment = 50; // Neutro

    words.forEach(word => {
      if (positiveWords.some(pw => word.includes(pw))) sentiment += 2;
      if (negativeWords.some(nw => word.includes(nw))) sentiment -= 2;
    });

    return Math.max(0, Math.min(100, sentiment));
  }

  private static extractKeywords(text: string): string[] {
    // Extração simplificada de keywords
    const stopWords = ['o', 'a', 'e', 'de', 'do', 'da', 'em', 'um', 'uma', 'para', 'com', 'por'];
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.includes(word));

    const wordCount: Record<string, number> = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    return Object.entries(wordCount)
      .filter(([, count]) => count >= 2)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);
  }

  private static calculatePercentageVsAverage(userValue: number, avgValue: number): number {
    if (avgValue === 0) return 0;
    return Math.round(((userValue - avgValue) / avgValue) * 100);
  }

  // Métodos auxiliares que seriam implementados com dados reais
  private static async getEditingSessions(userId: string, period: { start: Date; end: Date }): Promise<number> {
    // Implementação seria baseada em logs de atividade
    return Math.floor(Math.random() * 20) + 10;
  }

  private static async getAverageSessionDuration(userId: string, period: { start: Date; end: Date }): Promise<number> {
    // Em minutos
    return Math.floor(Math.random() * 60) + 30;
  }

  private static async calculatePeakHours(userId: string, period: { start: Date; end: Date }): Promise<number[]> {
    // Seria baseado em timestamps de atividade
    return [9, 14, 20]; // 9h, 14h, 20h
  }

  private static async getProductivityTrend(userId: string, period: { start: Date; end: Date }): Promise<{projects: number}> {
    return { projects: Math.floor(Math.random() * 10) + 5 };
  }

  private static async getTotalWordsInPeriod(userId: string, period: { start: Date; end: Date }): Promise<number> {
    return Math.floor(Math.random() * 10000) + 5000;
  }

  private static async getTotalEditingMinutes(userId: string, period: { start: Date; end: Date }): Promise<number> {
    return Math.floor(Math.random() * 500) + 200;
  }

  private static async getTotalEditsInPeriod(userId: string, period: { start: Date; end: Date }): Promise<number> {
    return Math.floor(Math.random() * 200) + 100;
  }

  private static async getAIRequestsInPeriod(userId: string, period: { start: Date; end: Date }): Promise<number> {
    return Math.floor(Math.random() * 50) + 20;
  }

  private static async getParticipatedSessions(userId: string, period: { start: Date; end: Date }): Promise<number> {
    return Math.floor(Math.random() * 10) + 2;
  }

  private static async getCommentsReceived(userId: string, period: { start: Date; end: Date }): Promise<number> {
    return Math.floor(Math.random() * 15) + 5;
  }

  private static async getSharesSent(userId: string, period: { start: Date; end: Date }): Promise<number> {
    return Math.floor(Math.random() * 8) + 2;
  }

  private static async getSharesReceived(userId: string, period: { start: Date; end: Date }): Promise<number> {
    return Math.floor(Math.random() * 5) + 1;
  }

  private static async getFavoriteAITypes(userId: string, period: { start: Date; end: Date }): Promise<Record<string, number>> {
    return {
      'improve': Math.floor(Math.random() * 20) + 10,
      'clarity': Math.floor(Math.random() * 15) + 8,
      'engagement': Math.floor(Math.random() * 12) + 6,
      'tone': Math.floor(Math.random() * 10) + 4
    };
  }

  private static async calculateAICosts(userId: string, period: { start: Date; end: Date }): Promise<{tokensConsumed: number, costEstimate: number}> {
    const tokens = Math.floor(Math.random() * 50000) + 20000;
    const cost = tokens * 0.00002; // $0.00002 por token (estimativa)
    return { tokensConsumed: tokens, costEstimate: Math.round(cost * 100) / 100 };
  }

  private static async calculateQualityImprovement(userId: string, period: { start: Date; end: Date }): Promise<number> {
    return Math.round((Math.random() * 30 + 10) * 100) / 100; // 10-40% improvement
  }

  private static async calculateQualityTrend(userId: string, period: { start: Date; end: Date }): Promise<number> {
    return Math.round((Math.random() * 20 - 10) * 100) / 100; // -10% to +10%
  }

  private static async getAverageViews(projects: Script[]): Promise<number> {
    return Math.floor(Math.random() * 10000) + 1000;
  }

  private static async getAverageEngagement(projects: Script[]): Promise<number> {
    return Math.round((Math.random() * 0.15 + 0.05) * 100) / 100; // 5-20% engagement
  }

  private static calculateSuccessRate(projects: Script[]): number {
    return Math.round((Math.random() * 0.4 + 0.6) * 100) / 100; // 60-100% success rate
  }

  private static async getGlobalAverages(): Promise<{
    avgProjectsPerMonth: number;
    avgAIRequestsPerMonth: number;
    avgReadabilityScore: number;
    avgCollaborationSessions: number;
  }> {
    // Seria calculado periodicamente e cachado
    return {
      avgProjectsPerMonth: 15,
      avgAIRequestsPerMonth: 35,
      avgReadabilityScore: 65,
      avgCollaborationSessions: 8
    };
  }

  // **RELATÓRIOS EXPORTÁVEIS**

  static async generateMonthlyReport(userId: string): Promise<{
    summary: string;
    analytics: AdvancedAnalytics;
    insights: ProductivityInsight[];
    recommendations: string[];
  }> {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
      
      const analytics = await this.getUserAnalytics(userId, { start: startDate, end: endDate });
      const insights = await this.generateProductivityInsights(userId);
      
      const summary = this.generateSummaryText(analytics);
      const recommendations = this.generateRecommendations(analytics);

      return {
        summary,
        analytics,
        insights,
        recommendations
      };

    } catch (error) {
      console.error('Erro ao gerar relatório mensal:', error);
      throw error;
    }
  }

  private static generateSummaryText(analytics: AdvancedAnalytics): string {
    return `No período analisado, você criou ${analytics.productivity.totalProjectsCreated} projetos, ` +
           `escreveu ${analytics.productivity.totalWordsWritten} palavras e teve uma taxa de aceitação de IA de ` +
           `${(analytics.aiUsage.acceptanceRate * 100).toFixed(1)}%. Sua produtividade teve uma tendência de ` +
           `${analytics.productivity.productivityTrend > 0 ? 'crescimento' : 'declínio'} de ` +
           `${Math.abs(analytics.productivity.productivityTrend).toFixed(1)}%.`;
  }

  private static generateRecommendations(analytics: AdvancedAnalytics): string[] {
    const recommendations: string[] = [];

    if (analytics.productivity.productivityTrend < 0) {
      recommendations.push('Considere revisar sua rotina de trabalho para melhorar a produtividade.');
    }

    if (analytics.aiUsage.acceptanceRate < 0.7) {
      recommendations.push('Tente ser mais específico nas solicitações à IA para obter melhores sugestões.');
    }

    if (analytics.collaboration.sessionsHosted === 0) {
      recommendations.push('Explore recursos de colaboração para trabalhar em equipe.');
    }

    if (analytics.contentQuality.averageReadabilityScore < 50) {
      recommendations.push('Foque em criar conteúdo mais claro e fácil de ler.');
    }

    return recommendations;
  }
} 