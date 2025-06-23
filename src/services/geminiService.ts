import { GoogleGenerativeAI } from "@google/generative-ai";
import type { FormData } from '../types';

export class GeminiService {
  private apiKey: string | null = null;
  private model: any = null;
  
  // API key padrão do projeto (a fornecida pelo usuário)
  private readonly DEFAULT_API_KEY = 'AIzaSyBRZJQv8YJGrkUUitTFHVUQc46rkS6SEZI';

  constructor() {
    console.log('🔧 GeminiService: Inicializando...');
    this.initializeFromStorage();
  }

  private initializeFromStorage() {
    try {
      console.log('🔍 GeminiService: Verificando fontes de API key...');
      
      // Prioridade: localStorage > env > default API key
      const storedKey = localStorage.getItem('GEMINI_API_KEY');
      const envKey = import.meta.env?.VITE_GEMINI_API_KEY;
      
      console.log('📋 Fontes de API key:', {
        storedKey: storedKey ? `${storedKey.substring(0, 10)}...` : 'não encontrada',
        envKey: envKey ? `${envKey.substring(0, 10)}...` : 'não encontrada',
        defaultKey: this.DEFAULT_API_KEY ? `${this.DEFAULT_API_KEY.substring(0, 10)}...` : 'não disponível'
      });
      
      const apiKey = storedKey || envKey || this.DEFAULT_API_KEY;
      
      if (apiKey) {
        console.log('✅ API key encontrada, inicializando modelo...');
        this.apiKey = apiKey;
        this.initializeModel();
        
        // Se não havia no localStorage, salvar a chave padrão
        if (!storedKey) {
          localStorage.setItem('GEMINI_API_KEY', apiKey);
          console.log('💾 API key salva no localStorage');
        }
      } else {
        console.log('❌ Nenhuma API key encontrada');
      }
    } catch (error) {
      console.error('❌ Erro ao inicializar do storage:', error);
    }
  }

  private async initializeModel() {
    try {
      if (!this.apiKey) {
        console.log('❌ Não há API key para inicializar modelo');
        return;
      }
      
      console.log('🚀 Inicializando modelo Gemini...');
      
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(this.apiKey);
      this.model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      console.log('✅ Gemini API configurada com sucesso');
    } catch (error) {
      console.error('❌ Erro ao inicializar Gemini:', error);
      this.model = null;
    }
  }

  async setApiKey(apiKey: string): Promise<boolean> {
    try {
      console.log('🔑 Configurando nova API key...');
      this.apiKey = apiKey;
      localStorage.setItem('GEMINI_API_KEY', apiKey);
      await this.initializeModel();
      const success = this.model !== null;
      console.log(success ? '✅ API key configurada com sucesso' : '❌ Falha ao configurar API key');
      return success;
    } catch (error) {
      console.error('❌ Erro ao configurar API key:', error);
      return false;
    }
  }

  isConfigured(): boolean {
    const configured = this.apiKey !== null && this.model !== null;
    console.log('🔍 Status de configuração:', { 
      hasApiKey: this.apiKey !== null, 
      hasModel: this.model !== null, 
      configured 
    });
    return configured;
  }

  async generateScript(params: {
    subject: string;
    platform: string;
    duration: string;
    tone: string;
    audience: string;
    objective?: string;
  }): Promise<string> {
    try {
      console.log('🚀 Iniciando geração de roteiro...', params);
      
      if (!this.isConfigured()) {
        const error = 'Gemini API não configurado. Configure sua API key primeiro.';
        console.error('❌', error);
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
      console.log('✅ Roteiro gerado com sucesso! Tamanho:', text.length, 'caracteres');
      
      return text;

    } catch (error: any) {
      console.error('❌ ERRO DETALHADO ao gerar roteiro:');
      console.error('- Mensagem:', error.message);
      console.error('- Tipo:', error.constructor.name);
      console.error('- Stack:', error.stack);
      console.error('- Objeto completo:', error);
      
      // Mensagens de erro mais específicas
      if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('API key')) {
        throw new Error('API key inválida. Verifique sua chave do Google AI Studio.');
      }
      if (error.message?.includes('QUOTA_EXCEEDED')) {
        throw new Error('Limite de uso da API atingido. Tente novamente mais tarde.');
      }
      if (error.message?.includes('SAFETY')) {
        throw new Error('Conteúdo bloqueado por políticas de segurança. Tente um assunto diferente.');
      }
      if (error.message?.includes('PERMISSION_DENIED')) {
        throw new Error('Permissão negada. Verifique se sua API key tem as permissões necessárias.');
      }
      if (error.message?.includes('RESOURCE_EXHAUSTED')) {
        throw new Error('Recursos esgotados na API. Tente novamente em alguns minutos.');
      }
      
      // Erro genérico com mais detalhes
      throw new Error(`Erro ao gerar roteiro: ${error.message || 'Erro desconhecido'}. Verifique o console para mais detalhes.`);
    }
  }

  async refineText(selectedText: string, refinementInstruction: string): Promise<string> {
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
      return response.text();

    } catch (error: any) {
      console.error('Erro ao refinar texto:', error);
      throw new Error(`Erro ao refinar texto: ${error.message || 'Erro desconhecido'}`);
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

    return `
Crie um roteiro ${tone} para ${platform} sobre "${subject}".

ESPECIFICAÇÕES:
- Duração: ${duration}
- Tom: ${tone}
- Público-alvo: ${audience}
${objective ? `- Objetivo: ${objective}` : ''}
- Plataforma: ${platform}

FORMATO DO ROTEIRO:
1. **GANCHO** (primeiros 3-5 segundos):
   - Frase impactante que prende a atenção

2. **INTRODUÇÃO** (5-10 segundos):
   - Apresentação do tema
   - Promise do que será entregue

3. **DESENVOLVIMENTO** (corpo principal):
   - Conteúdo principal organizado
   - Pontos práticos e acionáveis
   - Exemplos concretos

4. **CONCLUSÃO** (últimos 5-10 segundos):
   - Resumo do valor entregue
   - Call-to-action específico

DIRETRIZES ESPECÍFICAS PARA ${platform.toUpperCase()}:
${this.getPlatformGuidelines(platform)}

INSTRUÇÕES IMPORTANTES:
- Use linguagem ${tone}
- Adapte para ${audience}
- Mantenha a duração aproximada de ${duration}
- Inclua timing aproximado para cada seção
- Seja específico e prático
- Evite informações genéricas

Gere apenas o roteiro, sem explicações adicionais.
`;
  }

  private getPlatformGuidelines(platform: string): string {
    const guidelines: Record<string, string> = {
      'youtube': `
- Início forte para reter audiência
- Estrutura clara com introdução, desenvolvimento e conclusão
- Call-to-action para like, subscribe e comentários
- Mencione outros vídeos relacionados se relevante`,
      
      'instagram': `
- Primeira frase deve parar o scroll
- Visual thinking - descreva elementos visuais
- Use hashtags estratégicas no final
- Incentive salvamento e compartilhamento`,
      
      'tiktok': `
- Hook nos primeiros 2 segundos
- Ritmo acelerado e dinâmico
- Trends e sons populares quando possível
- Final que incentiva rewatching`,
      
      'linkedin': `
- Tom profissional mas acessível
- Insights valiosos para carreira/negócios
- Storytelling profissional
- Call-to-action para networking`
    };

    return guidelines[platform.toLowerCase()] || guidelines['youtube'];
  }
}

// Instância singleton
export const geminiService = new GeminiService();

// Função legacy para compatibilidade
export const refineText = async (selectedText: string, refinementInstruction: string): Promise<string> => {
  return geminiService.refineText(selectedText, refinementInstruction);
}; 