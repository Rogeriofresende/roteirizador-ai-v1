/**
 * 🎯 SMART PROVIDERS V8.0
 * Integração inteligente aproveitando infraestrutura robusta existente
 * Metodologia V8.0 Unified Development
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { geminiService } from '../../services/geminiService';
import { analyticsService } from '../../services/analyticsService';
import { useBancoDeIdeiasState } from '../../pages/BancoDeIdeias/hooks/useBancoDeIdeiasState';

// ============================================================================
// CONTEXT DEFINITIONS
// ============================================================================

interface StorybookServicesContext {
  geminiService: typeof geminiService;
  analyticsService: typeof analyticsService;
  mode: 'storybook' | 'production' | 'development';
}

const StorybookContext = createContext<StorybookServicesContext | null>(null);

// ============================================================================
// SMART SERVICE FACTORY
// ============================================================================

const createStorybookServices = () => {
  // Aproveitar serviços reais com fallbacks inteligentes
  const isStorybookEnv = globalThis.STORYBOOK_ENVIRONMENT === true;
  
  return {
    geminiService: {
      ...geminiService,
      // Override para Storybook com dados reais simulados
      generateContent: async (request: any) => {
        console.log('🎭 [STORYBOOK] Using smart mock for Gemini');
        
        // Simular resposta baseada em request real
        return {
          response: {
            text: () => generateSmartMockResponse(request)
          }
        };
      }
    },
    analyticsService: {
      ...analyticsService,
      // Manter analytics reais para Storybook
      trackEvent: (event: string, data: any) => {
        console.log(`📊 [STORYBOOK] Analytics:`, event, data);
        // Chamar analytics real para coletar dados de uso do Storybook
        return analyticsService.trackEvent(`storybook_${event}`, data);
      }
    },
    mode: 'storybook' as const
  };
};

// ============================================================================
// SMART MOCK GENERATOR
// ============================================================================

const generateSmartMockResponse = (request: any) => {
  const prompt = request.contents?.[0]?.parts?.[0]?.text || '';
  
  // Detectar tipo de análise baseado no prompt
  if (prompt.includes('Analise os seguintes perfis')) {
    return `{
  "confidence": 87,
  "insights": [
    {
      "type": "strength",
      "title": "Presença Consistente",
      "description": "Mantém atividade regular e engajada nas redes sociais",
      "impact": "high"
    },
    {
      "type": "opportunity", 
      "title": "Potencial de Crescimento",
      "description": "Excelente oportunidade para expandir audiência com conteúdo otimizado",
      "impact": "high"
    },
    {
      "type": "improvement",
      "title": "Diversificação de Conteúdo",
      "description": "Pode explorar novos formatos para aumentar engajamento",
      "impact": "medium"
    }
  ],
  "topTopics": ["Lifestyle", "Tecnologia", "Educação"],
  "profileSummary": {
    "mainStyle": "Conteúdo educativo e inspirador",
    "engagement": "Alto engajamento com audiência ativa",
    "frequency": "Postagem regular, 3-4x por semana",
    "audience": "Profissionais jovens e criativos"
  }
}`;
  }
  
  // Fallback para outros tipos de prompt
  return 'Resposta simulada inteligente baseada em dados reais do sistema.';
};

// ============================================================================
// STORYBOOK PROVIDER COMPONENT
// ============================================================================

interface StorybookProviderProps {
  children: ReactNode;
  mode?: 'storybook' | 'production' | 'development';
  mockData?: any;
}

export const StorybookProvider: React.FC<StorybookProviderProps> = ({ 
  children, 
  mode = 'storybook',
  mockData = {}
}) => {
  const services = createStorybookServices();
  
  return (
    <StorybookContext.Provider value={{ ...services, mode }}>
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="storybook-provider">
          {children}
        </div>
      </MemoryRouter>
    </StorybookContext.Provider>
  );
};

// ============================================================================
// ESTADO GLOBAL PROVIDER
// ============================================================================

export const StorybookStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Usar hook real de estado do Banco de Ideias
  const bancoState = useBancoDeIdeiasState();
  
  return (
    <div className="storybook-state-provider">
      {children}
    </div>
  );
};

// ============================================================================
// PROVIDER COMBINADO
// ============================================================================

export const CombinedStorybookProvider: React.FC<StorybookProviderProps> = ({ 
  children, 
  ...props 
}) => {
  return (
    <StorybookProvider {...props}>
      <StorybookStateProvider>
        {children}
      </StorybookStateProvider>
    </StorybookProvider>
  );
};

// ============================================================================
// HOOKS
// ============================================================================

export const useStorybookServices = () => {
  const context = useContext(StorybookContext);
  if (!context) {
    throw new Error('useStorybookServices must be used within StorybookProvider');
  }
  return context;
};

// ============================================================================
// EXPORTS
// ============================================================================

export { StorybookContext };
export default CombinedStorybookProvider;
