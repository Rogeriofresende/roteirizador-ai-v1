import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import type { FormData } from '../types';
import { analyticsService } from './analyticsService';

export class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: GenerativeModel | null = null;

  constructor() {
    console.log('🔧 GeminiService: Inicializando...');
    this.initializeModel();
  }

  private getApiKey(): string | null {
    // Prioridade: localStorage -> environment variable
    const localStorageKey = localStorage.getItem('GEMINI_API_KEY');
    if (localStorageKey && localStorageKey.trim()) {
      return localStorageKey.trim();
    }

    const envKey = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;
    if (envKey && envKey.trim()) {
      return envKey.trim();
    }

    return null;
  }

  private initializeModel() {
    try {
      const apiKey = this.getApiKey();
      
      if (!apiKey) {
        console.warn('⚠️ API key do Gemini não configurada. Configure através do localStorage ou variável de ambiente VITE_GOOGLE_GEMINI_API_KEY');
        this.genAI = null;
        this.model = null;
        return;
      }
      
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
      console.log('✅ Gemini AI inicializado com sucesso');
    } catch (error: unknown) {
      console.error('❌ Erro ao inicializar Gemini:', error);
      analyticsService.trackError('Gemini Initialization Failed', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      this.genAI = null;
      this.model = null;
    }
  }

  isConfigured(): boolean {
    return this.model !== null;
  }

  async generateScript(params: {
    subject: string;
    platform: string;
    duration: string;
    tone: string;
    audience: string;
    objective?: string;
  }): Promise<string> {
    const startTime = Date.now();
    
    try {
      console.log('🚀 Iniciando geração de roteiro...', params);
      
      // Track início da geração
      analyticsService.trackConversionFunnel('form_complete', params);
      
      if (!this.isConfigured()) {
        const error = 'Gemini API não configurado. Configure sua API key primeiro.';
        console.error('❌', error);
        
        // Track erro de configuração
        analyticsService.trackError('API Key Not Configured', {
          context: 'script_generation',
          platform: params.platform
        });
        
        throw new Error(error);
      }

      const prompt = this.buildPrompt(params);
      console.log('📝 Prompt criado, enviando para Gemini...');
      console.log('🔗 Fazendo chamada para API...');
      
      const result = await this.model.generateContent(prompt);
      console.log('📡 Resposta recebida da API');
      
      const response = await result.response;
      console.log('📄 Extraindo texto da resposta...');
      
      const text = response.text();
      const generationTime = Date.now() - startTime;
      
      console.log('✅ Roteiro gerado com sucesso! Tamanho:', text.length, 'caracteres');
      
      // Track sucesso da geração
      analyticsService.trackScriptGeneration({
        platform: params.platform,
        subject: params.subject,
        duration: params.duration,
        tone: params.tone,
        audience: params.audience,
        success: true,
        generation_time: generationTime,
        script_length: text.length
      });
      
      return text;

    } catch (error: unknown) {
      console.error('Erro ao gerar roteiro:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao gerar roteiro';
      throw new Error(errorMessage);
    }
  }

  async refineText(selectedText: string, refinementInstruction: string): Promise<string> {
    const startTime = Date.now();
    
    try {
      if (!this.isConfigured()) {
        throw new Error('Gemini API não configurado. Configure sua API key primeiro.');
      }

      const prompt = `
Refine o seguinte texto seguindo as instruções fornecidas.

TEXTO ORIGINAL:
"${selectedText}"

INSTRUÇÕES PARA REFINAMENTO:
${refinementInstruction}

DIRETRIZES:
- Mantenha o significado original
- Aplique apenas as mudanças solicitadas
- Mantenha o mesmo estilo se não especificado diferente
- Retorne apenas o texto refinado, sem explicações

TEXTO REFINADO:
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const refinedText = response.text();
      
      const processingTime = Date.now() - startTime;
      
      // Track uso da feature de refinamento
      analyticsService.trackFeatureUsage('text_refinement', {
        original_length: selectedText.length,
        refined_length: refinedText.length,
        processing_time: processingTime,
        success: true
      });
      
      return refinedText;
    } catch (error: unknown) {
      console.error('Erro ao refinar texto:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao refinar texto';
      throw new Error(errorMessage);
    }
  }

  private buildPrompt(params: {
    subject: string;
    platform: string;
    duration: string;
    tone: string;
    audience: string;
    objective?: string;
  }): string {
    const { subject, platform, duration, tone, audience, objective } = params;

    const basePrompt = `
Você é um especialista em criação de conteúdo para redes sociais e roteirista profissional.
Crie um roteiro completo e envolvente seguindo estas especificações:

ASSUNTO: ${subject}
PLATAFORMA: ${platform}
DURAÇÃO: ${duration}
TOM: ${tone}
PÚBLICO: ${audience}
${objective ? `OBJETIVO: ${objective}` : ''}

ESTRUTURA OBRIGATÓRIA:
1. TÍTULO/HOOK (chamativo e otimizado para ${platform})
2. INTRODUÇÃO (apresentação rápida e impactante)
3. DESENVOLVIMENTO (conteúdo principal estruturado)
4. CONCLUSÃO (resumo + call-to-action)

REQUISITOS ESPECÍFICOS PARA ${platform.toUpperCase()}:
`;

    // Adicionar requisitos específicos por plataforma
    let platformSpecifics = '';
    
    switch (platform.toLowerCase()) {
      case 'youtube':
        platformSpecifics = `
- Hook nos primeiros 5 segundos para retenção
- Estrutura didática com momentos de engajamento
- Call-to-action para like, subscribe e comentários
- Sugestões de cards e end screens
- SEO: título otimizado e descrição sugerida
- Timing sugerido para cada seção
`;
        break;
        
      case 'instagram':
        platformSpecifics = `
- Primeira frase impactante para parar o scroll
- Linguagem visual (descreva cenas/elementos visuais)
- Hashtags estratégicas (mix de populares + nicho)
- Stories complementares sugeridos
- Formato quadrado ou vertical (9:16)
- Texto overlay suggestions
`;
        break;
        
      case 'tiktok':
        platformSpecifics = `
- Hook extremamente rápido (3 segundos)
- Transições dinâmicas e efeitos
- Trends atuais aplicáveis
- Música/audio suggestions
- Texto overlay minimalista
- Loop potential para replay
`;
        break;
        
      case 'linkedin':
        platformSpecifics = `
- Tom profissional e autoridade
- Insights de mercado relevantes
- Storytelling corporativo
- Networking e value proposition
- CTA para engagement profissional
- Formato text-heavy otimizado
`;
        break;
        
      default:
        platformSpecifics = `
- Adaptado para as características da plataforma
- Linguagem adequada ao público
- Call-to-action relevante
- Formato otimizado para engajamento
`;
    }

    return basePrompt + platformSpecifics + `

INSTRUÇÕES FINAIS:
- Use linguagem ${tone} apropriada para ${audience}
- Duração total aproximada: ${duration}
- Seja criativo mas mantenha foco no assunto
- Inclua timing sugerido entre parênteses
- Adicione dicas de performance quando relevante

Gere um roteiro completo, criativo e pronto para produção:
`;
  }

  // Método para configurar API key dinamicamente
  setAPIKey(apiKey: string): boolean {
    try {
      if (!apiKey || typeof apiKey !== 'string') {
        throw new Error('API key inválida');
      }

      // Salvar no localStorage para persistência
      localStorage.setItem('GEMINI_API_KEY', apiKey);
      
      // Reinicializar o modelo
      this.initializeModel();
      
      // Track configuração de API key
      analyticsService.trackUserAction('api_key_configured', {
        success: this.isConfigured()
      });
      
      return this.isConfigured();
    } catch (error: unknown) {
      console.error('Erro ao configurar API key:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao configurar API key';
      analyticsService.trackError('API Key Configuration Failed', {
        error: errorMessage
      });
      return false;
    }
  }

  // Método para remover API key
  removeAPIKey(): void {
    localStorage.removeItem('GEMINI_API_KEY');
    this.genAI = null;
    this.model = null;
    
    analyticsService.trackUserAction('api_key_removed');
    console.log('API key removida');
  }

  // Método para testar conectividade
  async testConnection(): Promise<boolean> {
    try {
      if (!this.isConfigured()) {
        return false;
      }

      // Test simples com prompt mínimo
      const result = await this.model.generateContent('Test');
      const response = await result.response;
      const text = response.text();
      
      analyticsService.trackUserAction('connection_test', {
        success: true,
        response_length: text.length
      });
      
      return true;
    } catch (error: unknown) {
      console.error('Teste de conexão falhou:', error);
      
      analyticsService.trackUserAction('connection_test', {
        success: false,
        error_message: error instanceof Error ? error.message : 'Erro desconhecido ao testar conexão'
      });
      
      return false;
    }
  }
}

// Singleton export
export const geminiService = new GeminiService();

// Função legacy para compatibilidade
export const refineText = async (selectedText: string, refinementInstruction: string): Promise<string> => {
  return geminiService.refineText(selectedText, refinementInstruction);
};