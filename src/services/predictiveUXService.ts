/**
 * V6.2 Enhanced Framework - Predictive UX Service
 * Core service para aprendizado de padrões e predições inteligentes
 */

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
  increment
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { analyticsService } from './analyticsService';
import { createLogger } from '../utils/logger';

const logger = createLogger('predictiveUXService');

interface UserPattern {
  id: string;
  userId: string;
  sessionId: string;
  sequence: string[];
  nextAction: string;
  confidence: number;
  occurrences: number;
  avgTimeBetween: number;
  lastSeen: Timestamp;
  context: {
    timeOfDay: string;
    deviceType: string;
    location?: string;
  };
}

interface PredictionModel {
  userId: string;
  patterns: UserPattern[];
  totalSessions: number;
  accuracy: number;
  lastUpdated: Timestamp;
}

interface SmartSuggestion {
  action: string;
  confidence: number;
  reasoning: string;
  preloadData?: any;
  context: string;
}

export class PredictiveUXService {
  private static userModels = new Map<string, PredictionModel>();
  private static learningThreshold = 3; // Mínimo de ocorrências para considerar padrão
  private static confidenceThreshold = 0.4; // Mínimo de confiança para sugestões

  /**
   * Inicializa o serviço e carrega modelos do usuário
   */
  static async initialize(userId: string): Promise<void> {
    try {
      const model = await this.loadUserModel(userId);
      if (model) {
        this.userModels.set(userId, model);
        logger.info('Modelo de usuário carregado', { userId, patternsCount: model.patterns.length });
      }
    } catch (error) {
      logger.error('Erro ao inicializar PredictiveUX', error);
    }
  }

  /**
   * Registra uma ação do usuário e atualiza padrões
   */
  static async recordUserAction(
    userId: string, 
    action: string, 
    context: Record<string, any>,
    sessionId: string
  ): Promise<void> {
    try {
      // Adicionar contexto temporal
      const timeContext = {
        ...context,
        timeOfDay: this.getTimeOfDay(),
        deviceType: this.getDeviceType(),
        timestamp: Date.now()
      };

      // Atualizar sessão atual
      await this.updateSessionData(userId, sessionId, action, timeContext);

      // Analisar padrões em tempo real
      await this.analyzeRealtimePatterns(userId, sessionId, action);

      // Analytics
      analyticsService.trackEvent('predictive_ux_action_recorded', {
        userId,
        action,
        sessionId,
        hasModel: this.userModels.has(userId)
      });

    } catch (error) {
      logger.error('Erro ao registrar ação', error);
    }
  }

  /**
   * Obtém sugestões inteligentes baseadas no contexto atual
   */
  static async getSmartSuggestions(
    userId: string, 
    currentContext: string,
    limit: number = 5
  ): Promise<SmartSuggestion[]> {
    try {
      const model = this.userModels.get(userId);
      if (!model || model.patterns.length === 0) {
        return this.getDefaultSuggestions(currentContext);
      }

      // Filtrar padrões relevantes ao contexto
      const relevantPatterns = model.patterns.filter(pattern => 
        pattern.confidence >= this.confidenceThreshold &&
        this.isPatternRelevant(pattern, currentContext)
      );

      // Ordenar por confiança e relevância
      const sortedPatterns = relevantPatterns.sort((a, b) => {
        const scoreA = a.confidence * this.calculateRelevanceScore(a, currentContext);
        const scoreB = b.confidence * this.calculateRelevanceScore(b, currentContext);
        return scoreB - scoreA;
      });

      // Converter para sugestões
      const suggestions = sortedPatterns.slice(0, limit).map(pattern => ({
        action: pattern.nextAction,
        confidence: pattern.confidence,
        reasoning: this.generateReasoning(pattern),
        preloadData: this.getPreloadData(pattern.nextAction),
        context: currentContext
      }));

      // Analytics
      analyticsService.trackEvent('smart_suggestions_generated', {
        userId,
        context: currentContext,
        suggestionsCount: suggestions.length,
        topConfidence: suggestions[0]?.confidence || 0
      });

      return suggestions;

    } catch (error) {
      logger.error('Erro ao gerar sugestões', error);
      return [];
    }
  }

  /**
   * Prevê a próxima ação mais provável
   */
  static async predictNextAction(
    userId: string, 
    currentSequence: string[]
  ): Promise<{ action: string; confidence: number } | null> {
    try {
      const model = this.userModels.get(userId);
      if (!model) return null;

      // Encontrar padrões que correspondem à sequência atual
      const matchingPatterns = model.patterns.filter(pattern => 
        this.sequenceMatches(currentSequence, pattern.sequence)
      );

      if (matchingPatterns.length === 0) return null;

      // Calcular ação mais provável ponderada por confiança e recência
      const predictions = new Map<string, number>();
      
      matchingPatterns.forEach(pattern => {
        const recencyBoost = this.calculateRecencyBoost(pattern.lastSeen);
        const score = pattern.confidence * pattern.occurrences * recencyBoost;
        
        predictions.set(
          pattern.nextAction,
          (predictions.get(pattern.nextAction) || 0) + score
        );
      });

      // Encontrar melhor predição
      let bestAction = '';
      let bestScore = 0;
      
      predictions.forEach((score, action) => {
        if (score > bestScore) {
          bestScore = score;
          bestAction = action;
        }
      });

      if (!bestAction) return null;

      // Calcular confiança normalizada
      const totalScore = Array.from(predictions.values()).reduce((a, b) => a + b, 0);
      const confidence = bestScore / totalScore;

      return { action: bestAction, confidence };

    } catch (error) {
      logger.error('Erro ao prever próxima ação', error);
      return null;
    }
  }

  /**
   * Otimiza pré-carregamento baseado em predições
   */
  static async getPreloadTargets(userId: string): Promise<string[]> {
    try {
      const predictions = await this.getSmartSuggestions(userId, 'navigation', 3);
      
      return predictions
        .filter(p => p.confidence > 0.6)
        .map(p => p.action)
        .filter(action => action.startsWith('navigate:') || action.includes('page'));

    } catch (error) {
      logger.error('Erro ao obter alvos de pré-carregamento', error);
      return [];
    }
  }

  /**
   * Aprende com feedback do usuário
   */
  static async learnFromFeedback(
    userId: string,
    suggestion: string,
    wasUseful: boolean
  ): Promise<void> {
    try {
      const model = this.userModels.get(userId);
      if (!model) return;

      // Atualizar confiança do padrão
      const pattern = model.patterns.find(p => p.nextAction === suggestion);
      if (pattern) {
        const adjustment = wasUseful ? 0.1 : -0.05;
        pattern.confidence = Math.max(0, Math.min(1, pattern.confidence + adjustment));
        
        // Salvar atualização
        await this.savePattern(pattern);
      }

      // Analytics
      analyticsService.trackEvent('predictive_ux_feedback', {
        userId,
        suggestion,
        wasUseful,
        newConfidence: pattern?.confidence
      });

    } catch (error) {
      logger.error('Erro ao processar feedback', error);
    }
  }

  /**
   * Analisa padrões em tempo real
   */
  private static async analyzeRealtimePatterns(
    userId: string,
    sessionId: string,
    action: string
  ): Promise<void> {
    try {
      const sessionRef = doc(db, 'predictive_sessions', sessionId);
      const sessionDoc = await getDoc(sessionRef);
      
      if (!sessionDoc.exists()) {
        // Nova sessão
        await setDoc(sessionRef, {
          userId,
          sessionId,
          actions: [action],
          startTime: Timestamp.now(),
          lastAction: Timestamp.now()
        });
        return;
      }

      const sessionData = sessionDoc.data();
      const actions = [...(sessionData.actions || []), action];
      
      // Atualizar sessão
      await updateDoc(sessionRef, {
        actions,
        lastAction: Timestamp.now()
      });

      // Extrair padrões se houver sequência suficiente
      if (actions.length >= 2) {
        await this.extractPatterns(userId, sessionId, actions);
      }

    } catch (error) {
      logger.error('Erro na análise em tempo real', error);
    }
  }

  /**
   * Extrai padrões de uma sequência de ações
   */
  private static async extractPatterns(
    userId: string,
    sessionId: string,
    actions: string[]
  ): Promise<void> {
    const windowSize = 5; // Janela de observação
    
    for (let i = 0; i < actions.length - 1; i++) {
      const window = Math.min(windowSize, actions.length - i);
      
      for (let w = 2; w <= window; w++) {
        const sequence = actions.slice(i, i + w - 1);
        const nextAction = actions[i + w - 1];
        
        // Criar ou atualizar padrão
        const patternId = `${userId}_${sequence.join('_')}`;
        await this.updatePattern(userId, sessionId, patternId, sequence, nextAction);
      }
    }
  }

  /**
   * Atualiza ou cria um padrão
   */
  private static async updatePattern(
    userId: string,
    sessionId: string,
    patternId: string,
    sequence: string[],
    nextAction: string
  ): Promise<void> {
    try {
      const patternRef = doc(db, 'user_patterns', patternId);
      const patternDoc = await getDoc(patternRef);
      
      if (patternDoc.exists()) {
        // Atualizar padrão existente
        await updateDoc(patternRef, {
          occurrences: increment(1),
          lastSeen: Timestamp.now(),
          confidence: increment(0.01) // Aumentar confiança gradualmente
        });
      } else {
        // Criar novo padrão
        const pattern: UserPattern = {
          id: patternId,
          userId,
          sessionId,
          sequence,
          nextAction,
          confidence: 0.3, // Confiança inicial
          occurrences: 1,
          avgTimeBetween: 0,
          lastSeen: Timestamp.now(),
          context: {
            timeOfDay: this.getTimeOfDay(),
            deviceType: this.getDeviceType()
          }
        };
        
        await setDoc(patternRef, pattern);
      }

      // Atualizar modelo local
      await this.refreshUserModel(userId);

    } catch (error) {
      logger.error('Erro ao atualizar padrão', error);
    }
  }

  /**
   * Helpers e utilitários
   */
  private static getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour < 6) return 'madrugada';
    if (hour < 12) return 'manhã';
    if (hour < 18) return 'tarde';
    return 'noite';
  }

  private static getDeviceType(): string {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  private static isPatternRelevant(pattern: UserPattern, context: string): boolean {
    return pattern.sequence.some(action => action.includes(context)) ||
           pattern.nextAction.includes(context);
  }

  private static calculateRelevanceScore(pattern: UserPattern, context: string): number {
    let score = 1.0;
    
    // Boost para contexto temporal similar
    if (pattern.context.timeOfDay === this.getTimeOfDay()) score *= 1.2;
    
    // Boost para dispositivo similar
    if (pattern.context.deviceType === this.getDeviceType()) score *= 1.1;
    
    // Penalidade para padrões antigos
    const daysSinceLastSeen = (Date.now() - pattern.lastSeen.toMillis()) / (1000 * 60 * 60 * 24);
    if (daysSinceLastSeen > 7) score *= 0.8;
    if (daysSinceLastSeen > 30) score *= 0.5;
    
    return score;
  }

  private static calculateRecencyBoost(lastSeen: Timestamp): number {
    const hoursSince = (Date.now() - lastSeen.toMillis()) / (1000 * 60 * 60);
    
    if (hoursSince < 1) return 2.0;
    if (hoursSince < 24) return 1.5;
    if (hoursSince < 168) return 1.2; // 1 semana
    return 1.0;
  }

  private static sequenceMatches(current: string[], pattern: string[]): boolean {
    if (current.length < pattern.length) return false;
    
    // Verificar se o padrão está contido na sequência atual
    const currentStr = current.join('|');
    const patternStr = pattern.join('|');
    
    return currentStr.includes(patternStr);
  }

  private static generateReasoning(pattern: UserPattern): string {
    const frequency = pattern.occurrences > 10 ? 'frequentemente' : 'às vezes';
    const confidence = pattern.confidence > 0.7 ? 'alta' : 'moderada';
    
    return `Baseado em seu comportamento, você ${frequency} realiza esta ação após ${pattern.sequence[pattern.sequence.length - 1]}. Confiança: ${confidence}.`;
  }

  private static getPreloadData(action: string): any {
    // Dados específicos para pré-carregamento baseado na ação
    if (action.includes('dashboard')) {
      return { preloadCharts: true, cacheStats: true };
    }
    if (action.includes('editor')) {
      return { preloadTemplates: true, initializeAI: true };
    }
    return null;
  }

  private static getDefaultSuggestions(context: string): SmartSuggestion[] {
    // Sugestões padrão quando não há modelo do usuário
    const defaults: Record<string, SmartSuggestion[]> = {
      navigation: [
        {
          action: 'navigate:dashboard',
          confidence: 0.5,
          reasoning: 'Dashboard é um ponto de partida comum',
          context: 'navigation'
        }
      ],
      editor: [
        {
          action: 'use:template',
          confidence: 0.4,
          reasoning: 'Templates aceleram a criação de conteúdo',
          context: 'editor'
        }
      ]
    };
    
    return defaults[context] || [];
  }

  /**
   * Persistência e carregamento de modelos
   */
  private static async loadUserModel(userId: string): Promise<PredictionModel | null> {
    try {
      const patternsQuery = query(
        collection(db, 'user_patterns'),
        where('userId', '==', userId),
        where('occurrences', '>=', this.learningThreshold),
        orderBy('confidence', 'desc'),
        limit(100)
      );

      const snapshot = await getDocs(patternsQuery);
      const patterns = snapshot.docs.map(doc => doc.data() as UserPattern);

      if (patterns.length === 0) return null;

      return {
        userId,
        patterns,
        totalSessions: patterns.length,
        accuracy: this.calculateModelAccuracy(patterns),
        lastUpdated: Timestamp.now()
      };

    } catch (error) {
      logger.error('Erro ao carregar modelo do usuário', error);
      return null;
    }
  }

  private static async refreshUserModel(userId: string): Promise<void> {
    const model = await this.loadUserModel(userId);
    if (model) {
      this.userModels.set(userId, model);
    }
  }

  private static async savePattern(pattern: UserPattern): Promise<void> {
    const patternRef = doc(db, 'user_patterns', pattern.id);
    await updateDoc(patternRef, {
      confidence: pattern.confidence,
      lastSeen: Timestamp.now()
    });
  }

  private static calculateModelAccuracy(patterns: UserPattern[]): number {
    if (patterns.length === 0) return 0;
    
    const totalConfidence = patterns.reduce((sum, p) => sum + p.confidence, 0);
    return totalConfidence / patterns.length;
  }

  private static async updateSessionData(
    userId: string,
    sessionId: string,
    action: string,
    context: Record<string, any>
  ): Promise<void> {
    const sessionRef = doc(db, 'user_sessions', sessionId);
    await setDoc(sessionRef, {
      userId,
      sessionId,
      lastAction: action,
      lastContext: context,
      timestamp: Timestamp.now()
    }, { merge: true });
  }

  /**
   * Limpa dados antigos para otimização
   */
  static async cleanupOldData(daysToKeep: number = 90): Promise<void> {
    // Implementar limpeza de padrões antigos
    logger.info('Limpeza de dados antigos iniciada', { daysToKeep });
  }
} 