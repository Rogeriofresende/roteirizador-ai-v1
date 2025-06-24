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
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import type { 
  AIRefinementRequest,
  AISuggestion,
  TextSelection,
  GeminiRequest,
  GeminiResponse,
  EditorAnalytics
} from '../types';

export class AIEditorService {
  private static readonly GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
  private static readonly MAX_RETRIES = 3;
  private static readonly TIMEOUT = 30000; // 30 segundos

  // **REFINAMENTO DE TEXTO COM IA**

  static async refineText(request: AIRefinementRequest): Promise<AISuggestion[]> {
    try {
      // Salvar request no Firebase
      await this.saveRefinementRequest(request);

      // Gerar prompt baseado no tipo de refinamento
      const prompt = this.buildRefinementPrompt(request);

      // Chamar Gemini API
      const geminiResponse = await this.callGeminiAPI(prompt, request.context);

      // Processar resposta e gerar sugestões
      const suggestions = await this.processGeminiResponse(
        geminiResponse, 
        request
      );

      // Salvar sugestões no Firebase
      await Promise.all(
        suggestions.map(suggestion => this.saveSuggestion(suggestion))
      );

      // Atualizar status do request
      await this.updateRequestStatus(request.id, 'completed');

      // Track analytics
      await this.trackAIInteraction(request.userId, 'suggestion_generated', {
        refinementType: request.refinementType,
        suggestionsCount: suggestions.length,
        originalLength: request.originalText.length
      });

      return suggestions;

    } catch (error) {
      console.error('Erro no refinamento de texto:', error);
      await this.updateRequestStatus(request.id, 'failed');
      throw new Error(`Falha no refinamento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  static async getBatchSuggestions(
    text: string, 
    userId: string, 
    projectId: string,
    context: AIRefinementRequest['context']
  ): Promise<Record<string, AISuggestion[]>> {
    try {
      const refinementTypes: AIRefinementRequest['refinementType'][] = [
        'grammar', 'clarity', 'engagement', 'tone'
      ];

      const batchRequests = refinementTypes.map(type => ({
        id: `batch_${Date.now()}_${type}`,
        projectId,
        userId,
        originalText: text,
        selectedText: text,
        selectionStart: 0,
        selectionEnd: text.length,
        refinementType: type,
        userInstructions: `Melhore o texto focando em ${type}`,
        context,
        timestamp: Timestamp.now(),
        status: 'pending' as const
      }));

      const batchResults = await Promise.all(
        batchRequests.map(request => this.refineText(request))
      );

      return refinementTypes.reduce((acc, type, index) => {
        acc[type] = batchResults[index];
        return acc;
      }, {} as Record<string, AISuggestion[]>);

    } catch (error) {
      console.error('Erro no batch de sugestões:', error);
      throw error;
    }
  }

  // **ANÁLISE DE CONTEÚDO**

  static async analyzeContent(text: string, context: any): Promise<{
    sentiment: number;
    readabilityScore: number;
    engagementScore: number;
    keywordDensity: Record<string, number>;
    suggestions: string[];
  }> {
    try {
      const analysisPrompt = `
        Analise o seguinte texto de roteiro para ${context.platform}:
        
        "${text}"
        
        Forneça uma análise estruturada em JSON com:
        1. sentiment: número de -1 (negativo) a 1 (positivo)
        2. readabilityScore: número de 0 a 100 (facilidade de leitura)
        3. engagementScore: número de 0 a 100 (potencial de engajamento)
        4. keywordDensity: objeto com palavras-chave e suas frequências
        5. suggestions: array com 3-5 sugestões de melhoria específicas
        
        Considere o público-alvo: ${context.audience}
        Tom desejado: ${context.tone}
        Duração: ${context.duration} segundos
        
        Responda APENAS com o JSON válido.
      `;

      const response = await this.callGeminiAPI(analysisPrompt, context);
      const analysisText = response.candidates[0]?.content.parts[0]?.text;

      if (!analysisText) {
        throw new Error('Resposta vazia da análise');
      }

      // Parse JSON response
      const analysis = JSON.parse(analysisText.trim());
      
      return {
        sentiment: analysis.sentiment || 0,
        readabilityScore: analysis.readabilityScore || 50,
        engagementScore: analysis.engagementScore || 50,
        keywordDensity: analysis.keywordDensity || {},
        suggestions: analysis.suggestions || []
      };

    } catch (error) {
      console.error('Erro na análise de conteúdo:', error);
      return {
        sentiment: 0,
        readabilityScore: 50,
        engagementScore: 50,
        keywordDensity: {},
        suggestions: ['Erro na análise automática']
      };
    }
  }

  // **SUGESTÕES CONTEXTUAIS**

  static async getContextualSuggestions(
    selection: TextSelection,
    fullText: string,
    context: any
  ): Promise<string[]> {
    try {
      const prompt = `
        Texto completo do roteiro: "${fullText}"
        
        Texto selecionado: "${selection.selectedText}"
        Posição: caracteres ${selection.startIndex} a ${selection.endIndex}
        
        Contexto:
        - Plataforma: ${context.platform}
        - Público: ${context.audience}
        - Tom: ${context.tone}
        
        Forneça 5 sugestões específicas para melhorar APENAS o texto selecionado,
        considerando o contexto do roteiro completo.
        
        Responda com um array JSON de strings.
      `;

      const response = await this.callGeminiAPI(prompt, context);
      const suggestionsText = response.candidates[0]?.content.parts[0]?.text;

      if (!suggestionsText) {
        return ['Sem sugestões disponíveis'];
      }

      const suggestions = JSON.parse(suggestionsText.trim());
      return Array.isArray(suggestions) ? suggestions : ['Erro no formato das sugestões'];

    } catch (error) {
      console.error('Erro nas sugestões contextuais:', error);
      return ['Erro ao gerar sugestões'];
    }
  }

  // **GEMINI API**

  private static async callGeminiAPI(
    prompt: string, 
    context: any, 
    retryCount = 0
  ): Promise<GeminiResponse> {
    try {
      const apiKey = localStorage.getItem('GEMINI_API_KEY') || 
                     import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;

      if (!apiKey) {
        throw new Error('API Key do Gemini não configurada');
      }

      const requestBody: GeminiRequest = {
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: context.platform === 'LinkedIn' ? 0.7 : 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT);

      const response = await fetch(`${this.GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      const result: GeminiResponse = await response.json();

      if (!result.candidates || result.candidates.length === 0) {
        throw new Error('Nenhuma resposta gerada pela IA');
      }

      return result;

    } catch (error) {
      if (retryCount < this.MAX_RETRIES && !(error instanceof Error && error.name === 'AbortError')) {
        console.warn(`Tentativa ${retryCount + 1} falhou, tentando novamente...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return this.callGeminiAPI(prompt, context, retryCount + 1);
      }
      throw error;
    }
  }

  // **PROMPT ENGINEERING**

  private static buildRefinementPrompt(request: AIRefinementRequest): string {
    const basePrompts = {
      improve: `Melhore o seguinte texto de roteiro mantendo o sentido original, mas tornando-o mais claro, envolvente e adequado para ${request.context.platform}`,
      rewrite: `Reescreva completamente o seguinte texto mantendo a ideia principal, mas com uma abordagem mais criativa e envolvente`,
      tone: `Ajuste o tom do seguinte texto para ser mais ${request.context.tone} e adequado para ${request.context.audience}`,
      grammar: `Corrija a gramática e melhore a fluência do seguinte texto, mantendo o estilo original`,
      style: `Melhore o estilo de escrita do seguinte texto, tornando-o mais profissional e adequado para ${request.context.platform}`,
      clarity: `Torne o seguinte texto mais claro e fácil de entender, eliminando ambiguidades`,
      engagement: `Aumente o potencial de engajamento do seguinte texto, tornando-o mais atrativo para ${request.context.audience}`
    };

    const basePrompt = basePrompts[request.refinementType];
    
    return `
      ${basePrompt}:
      
      Texto original: "${request.originalText}"
      Texto selecionado para melhorar: "${request.selectedText}"
      
      Contexto:
      - Plataforma: ${request.context.platform}
      - Público-alvo: ${request.context.audience}
      - Tom desejado: ${request.context.tone}
      - Duração do vídeo: ${request.context.duration} segundos
      
      Instruções específicas do usuário: "${request.userInstructions}"
      
      Forneça a resposta em JSON com:
      {
        "suggestedText": "texto melhorado",
        "explanation": "explicação das mudanças",
        "improvements": {
          "clarity": 0-100,
          "engagement": 0-100,
          "grammar": 0-100,
          "tone": 0-100,
          "relevance": 0-100
        },
        "reasoning": "justificativa detalhada",
        "alternatives": ["alternativa 1", "alternativa 2", "alternativa 3"]
      }
    `;
  }

  private static async processGeminiResponse(
    response: GeminiResponse,
    request: AIRefinementRequest
  ): Promise<AISuggestion[]> {
    try {
      const responseText = response.candidates[0]?.content.parts[0]?.text;
      if (!responseText) {
        throw new Error('Resposta vazia da IA');
      }

      const parsedResponse = JSON.parse(responseText.trim());

      const suggestion: AISuggestion = {
        id: `suggestion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        requestId: request.id,
        originalText: request.selectedText,
        suggestedText: parsedResponse.suggestedText,
        explanation: parsedResponse.explanation,
        confidence: this.calculateConfidence(parsedResponse.improvements),
        improvements: parsedResponse.improvements,
        reasoning: parsedResponse.reasoning,
        alternatives: parsedResponse.alternatives || [],
        timestamp: Timestamp.now(),
        geminiModel: 'gemini-pro',
        tokensUsed: response.usageMetadata?.totalTokenCount || 0
      };

      return [suggestion];

    } catch (error) {
      console.error('Erro ao processar resposta do Gemini:', error);
      throw new Error('Falha ao processar resposta da IA');
    }
  }

  private static calculateConfidence(improvements: any): number {
    if (!improvements) return 0.5;
    
    const scores = Object.values(improvements) as number[];
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    return Math.min(average / 100, 1);
  }

  // **PERSISTÊNCIA NO FIREBASE**

  private static async saveRefinementRequest(request: AIRefinementRequest): Promise<void> {
    try {
      const requestRef = doc(db, 'ai_refinement_requests', request.id);
      await setDoc(requestRef, request);
    } catch (error) {
      console.error('Erro ao salvar request de refinamento:', error);
      throw error;
    }
  }

  private static async saveSuggestion(suggestion: AISuggestion): Promise<void> {
    try {
      const suggestionRef = doc(db, 'ai_suggestions', suggestion.id);
      await setDoc(suggestionRef, suggestion);
    } catch (error) {
      console.error('Erro ao salvar sugestão:', error);
      throw error;
    }
  }

  private static async updateRequestStatus(
    requestId: string, 
    status: AIRefinementRequest['status']
  ): Promise<void> {
    try {
      const requestRef = doc(db, 'ai_refinement_requests', requestId);
      await updateDoc(requestRef, { status });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  }

  // **HISTÓRICO E ANALYTICS**

  static async getUserAIHistory(userId: string, limit = 50): Promise<AISuggestion[]> {
    try {
      const suggestionsQuery = query(
        collection(db, 'ai_suggestions'),
        where('requestId', 'in', 
          (await getDocs(query(
            collection(db, 'ai_refinement_requests'),
            where('userId', '==', userId),
            orderBy('timestamp', 'desc'),
            limit(limit)
          ))).docs.map(doc => doc.id)
        ),
        orderBy('timestamp', 'desc')
      );

      const suggestionsSnapshot = await getDocs(suggestionsQuery);
      return suggestionsSnapshot.docs.map(doc => doc.data() as AISuggestion);

    } catch (error) {
      console.error('Erro ao obter histórico de IA:', error);
      return [];
    }
  }

  static async getAIAnalytics(userId: string): Promise<EditorAnalytics | null> {
    try {
      const analyticsDoc = await getDoc(doc(db, 'editor_analytics', userId));
      
      if (analyticsDoc.exists()) {
        return analyticsDoc.data() as EditorAnalytics;
      }

      // Calcular analytics se não existir
      return await this.calculateAIAnalytics(userId);

    } catch (error) {
      console.error('Erro ao obter analytics de IA:', error);
      return null;
    }
  }

  private static async calculateAIAnalytics(userId: string): Promise<EditorAnalytics> {
    try {
      const [requestsSnapshot, suggestionsSnapshot] = await Promise.all([
        getDocs(query(
          collection(db, 'ai_refinement_requests'),
          where('userId', '==', userId)
        )),
        getDocs(query(
          collection(db, 'ai_suggestions'),
          // Note: seria necessário adicionar userId nas suggestions também
        ))
      ]);

      const totalRequests = requestsSnapshot.size;
      const totalSuggestions = suggestionsSnapshot.size;

      // Calcular métricas básicas
      const analytics: EditorAnalytics = {
        userId,
        totalSessions: 0, // Seria calculado de editor_sessions
        totalEditingTime: 0,
        averageSessionDuration: 0,
        aiInteractions: totalRequests,
        suggestionsAccepted: 0, // Seria calculado baseado em accepted suggestions
        suggestionsRejected: 0,
        acceptanceRate: 0,
        favoriteImprovementTypes: {},
        productivityMetrics: {
          wordsPerMinute: 0,
          editsPerSession: 0,
          aiAssistanceRatio: 0
        },
        qualityMetrics: {
          averageImprovementScore: 0,
          clarityImprovement: 0,
          engagementImprovement: 0
        },
        timeStats: {
          peakProductivityHours: [],
          mostActiveDay: '',
          longestSession: 0
        }
      };

      // Salvar analytics calculado
      await setDoc(doc(db, 'editor_analytics', userId), analytics);
      
      return analytics;

    } catch (error) {
      console.error('Erro ao calcular analytics:', error);
      throw error;
    }
  }

  private static async trackAIInteraction(
    userId: string, 
    action: string, 
    data: any
  ): Promise<void> {
    try {
      const interactionRef = doc(collection(db, 'ai_interactions'));
      await setDoc(interactionRef, {
        userId,
        action,
        data,
        timestamp: Timestamp.now()
      });
    } catch (error) {
      console.error('Erro ao rastrear interação de IA:', error);
    }
  }

  // **UTILITÁRIOS**

  static validateSelection(selection: TextSelection, fullText: string): boolean {
    return (
      selection.startIndex >= 0 &&
      selection.endIndex <= fullText.length &&
      selection.startIndex < selection.endIndex &&
      selection.selectedText === fullText.substring(selection.startIndex, selection.endIndex)
    );
  }

  static extractContext(text: string, selection: TextSelection, contextSize = 50): string {
    const start = Math.max(0, selection.startIndex - contextSize);
    const end = Math.min(text.length, selection.endIndex + contextSize);
    return text.substring(start, end);
  }

  static estimateReadingTime(text: string, wordsPerMinute = 150): number {
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  static analyzeKeywordDensity(text: string): Record<string, number> {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);

    const density: Record<string, number> = {};
    const totalWords = words.length;

    words.forEach(word => {
      density[word] = (density[word] || 0) + 1;
    });

    // Converter para porcentagem
    Object.keys(density).forEach(word => {
      density[word] = Math.round((density[word] / totalWords) * 100);
    });

    return density;
  }
} 