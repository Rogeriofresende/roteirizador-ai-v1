import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

// Component para exibir arquitetura no Storybook
const ArchitectureViewer = ({ 
  title, 
  mermaidCode, 
  description 
}: { 
  title: string; 
  mermaidCode: string; 
  description: string; 
}) => {
  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui' }}>
      <h2 style={{ color: '#1976d2', marginBottom: '16px' }}>{title}</h2>
      <p style={{ marginBottom: '24px', color: '#666', lineHeight: '1.6' }}>
        {description}
      </p>
      
      {/* Mermaid diagram - renderizado automaticamente pelo Storybook */}
      <div style={{ 
        border: '1px solid #e0e0e0', 
        borderRadius: '8px', 
        padding: '20px',
        backgroundColor: '#fafafa',
        overflow: 'auto'
      }}>
        <pre style={{ 
          fontSize: '12px', 
          fontFamily: 'monospace',
          margin: 0,
          whiteSpace: 'pre-wrap',
          color: '#333'
        }}>
          {mermaidCode}
        </pre>
      </div>
      
      <div style={{ 
        marginTop: '16px', 
        padding: '12px', 
        backgroundColor: '#e3f2fd',
        borderRadius: '4px',
        fontSize: '14px'
      }}>
        💡 <strong>Como usar:</strong> Copie o código Mermaid acima e cole em qualquer editor que suporte Mermaid (VS Code, GitHub, etc.)
      </div>
    </div>
  );
};

const meta: Meta<typeof ArchitectureViewer> = {
  title: '📐 Architecture/System Flows',
  component: ArchitectureViewer,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Documentação completa da arquitetura e fluxos do sistema. Atualizada automaticamente pela IA.'
      }
    }
  }
};

export default meta;
type Story = StoryObj<typeof ArchitectureViewer>;

// 🎯 Story 1: Visão Geral do Sistema
export const SystemOverview: Story = {
  args: {
    title: '🏗️ Visão Geral da Arquitetura',
    description: 'Arquitetura Clean Architecture com DI Container, 20+ serviços enterprise e componentes React organizados por features.',
    mermaidCode: `graph TB
    subgraph "🎨 Presentation Layer"
        A[React Components]
        B[Pages & Routes]
        C[Custom Hooks]
        D[Context Providers]
    end
    
    subgraph "🔧 Application Layer"
        E[DI Container]
        F[Service Registry]
        G[Use Cases]
        H[DTOs & Interfaces]
    end
    
    subgraph "💼 Domain Layer"
        I[User Entity]
        J[Script Entity]
        K[Business Rules]
        L[Domain Services]
    end
    
    subgraph "🌐 Infrastructure"
        M[Firebase Client]
        N[Gemini AI Client]
        O[Analytics Services]
        P[Cache & Storage]
    end
    
    A --> E
    B --> F
    C --> G
    D --> H
    
    E --> I
    F --> J
    G --> K
    H --> L
    
    I --> M
    J --> N
    K --> O
    L --> P`
  }
};

// 💡 Story 2: User Journey
export const UserJourney: Story = {
  args: {
    title: '👤 Jornada Completa do Usuário',
    description: 'Fluxo completo desde o primeiro acesso até a geração de conteúdo, incluindo autenticação, dashboard e funcionalidades principais.',
    mermaidCode: `graph TD
    A[🏠 Primeiro Acesso] --> B{🔐 Autenticado?}
    B -->|Não| C[📝 Login/Cadastro]
    B -->|Sim| D[📊 Dashboard]
    
    C --> E[🔥 Firebase Auth]
    E --> F[✅ Sucesso]
    F --> D
    
    D --> G[💡 Gerar Ideias]
    D --> H[📅 Planejar]
    D --> I[📈 Analytics]
    
    G --> J[📝 Formulário]
    J --> K[🤖 IA Processing]
    K --> L[📄 Resultados]
    L --> M[💾 Salvar]
    
    H --> N[📅 Calendário]
    N --> O[➕ Quick Add]
    O --> P[📋 Agendamento]
    
    I --> Q[📊 Métricas]
    Q --> R[📈 Insights]
    R --> S[🎯 Recomendações]`
  }
};

// 🔄 Story 3: Data Flow
export const DataFlow: Story = {
  args: {
    title: '🔄 Fluxo de Dados e Estados',
    description: 'Como os dados fluem através do sistema, desde a entrada do usuário até a persistência e sincronização.',
    mermaidCode: `sequenceDiagram
    participant U as 👤 Usuário
    participant C as 🎨 Component
    participant S as 🔧 Service
    participant D as 💼 Domain
    participant I as 🌐 Infrastructure
    participant E as 🌍 External API
    
    U->>C: Ação do usuário
    C->>S: Chama service via DI
    S->>D: Executa regra de negócio
    D->>I: Acessa infrastructure
    I->>E: Chama API externa
    E->>I: Retorna dados
    I->>D: Processa resposta
    D->>S: Aplica regras
    S->>C: Atualiza estado
    C->>U: Exibe resultado`
  }
};

// ⚡ Story 4: Performance & Monitoring
export const PerformanceFlow: Story = {
  args: {
    title: '⚡ Performance & Monitoring',
    description: 'Sistema de monitoramento em tempo real, detecção de problemas e auto-recovery implementado.',
    mermaidCode: `graph LR
    A[🚀 App Start] --> B[📊 Metrics]
    B --> C{🔍 Health?}
    
    C -->|✅ OK| D[Continue]
    C -->|⚠️ Warning| E[Log Alert]
    C -->|🚨 Critical| F[Auto Recovery]
    
    D --> G[📈 Analytics]
    E --> H[📝 Report]
    F --> I[🔄 Restart Service]
    
    G --> J[👨‍💻 Insights]
    H --> K[🛠️ Debug Info]
    I --> L[✅ Recovery Success]`
  }
};

// 🧪 Story 5: Testing Strategy
export const TestingStrategy: Story = {
  args: {
    title: '🧪 Estratégia de Testes',
    description: 'Pipeline completo de testes: unitários, integração, E2E e cobertura. Sistema atual com 128/153 testes passando.',
    mermaidCode: `graph TD
    A[💻 Code Change] --> B[🧪 Unit Tests]
    B --> C[🔗 Integration Tests]
    C --> D[🌐 E2E Tests]
    D --> E[📊 Coverage Report]
    
    E --> F{✅ >85% Coverage?}
    F -->|Yes| G[🚀 Deploy Staging]
    F -->|No| H[❌ Block Deploy]
    
    G --> I[🔍 Smoke Tests]
    I --> J[📈 Performance Tests]
    J --> K[✅ Production Deploy]
    
    H --> L[📝 Fix Required]
    L --> A
    
    style F fill:#fff3e0
    style G fill:#e8f5e8
    style H fill:#ffebee`
  }
};

// 🔧 Story 6: Service Architecture
export const ServiceArchitecture: Story = {
  args: {
    title: '🔧 Arquitetura de Serviços (DI System)',
    description: 'Sistema de Dependency Injection com 20+ serviços enterprise, registro automático e controle de lifecycle.',
    mermaidCode: `graph TB
    subgraph "📦 DI Container"
        A[Service Registry]
        B[Lifecycle Manager]
        C[Dependency Resolver]
    end
    
    subgraph "🔧 Core Services"
        D[Analytics Service]
        E[Auth Service]
        F[AI Generation Service]
        G[Voice Synthesis Service]
    end
    
    subgraph "📊 Monitoring Services"
        H[Performance Service]
        I[Error Tracking Service]
        J[Health Check Service]
    end
    
    subgraph "🌐 External Services"
        K[Firebase Service]
        L[Gemini Service]
        M[Clarity Service]
        N[Tally Service]
    end
    
    A --> D
    A --> E
    A --> F
    A --> G
    
    B --> H
    B --> I
    B --> J
    
    C --> K
    C --> L
    C --> M
    C --> N`
  }
}; 