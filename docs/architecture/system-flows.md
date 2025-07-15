# 🔄 Fluxos do Sistema - Roteirar IA

## 📊 Visão Geral dos Fluxos

Este documento contém todos os fluxos críticos do sistema, atualizados automaticamente e versionados junto com o código.

## 🎯 Fluxo Principal do Usuário

```mermaid
graph TD
    A[🏠 Acesso à Aplicação] --> B{🔐 Usuário Logado?}
    B -->|Não| C[📝 Login/Cadastro]
    B -->|Sim| D[📊 Dashboard Principal]
    
    C --> E[🔥 Firebase Auth]
    E --> F[✅ Autenticação Sucesso]
    F --> D
    
    D --> G[💡 Gerar Ideias]
    D --> H[📅 Planejar Conteúdo]
    D --> I[📈 Ver Analytics]
    D --> J[⚙️ Configurações]
    
    G --> K[📝 Banco de Ideias Form]
    H --> L[📅 Calendário Editorial]
    I --> M[📊 Dashboard Analytics]
    J --> N[⚙️ Painel Configurações]
    
    style A fill:#e1f5fe
    style D fill:#f3e5f5
    style G fill:#e8f5e8
    style H fill:#fff3e0
    style I fill:#fce4ec
```

## 💡 Fluxo Detalhado: Geração de Ideias

```mermaid
sequenceDiagram
    participant U as 👤 Usuário
    participant F as 📝 Form
    participant V as ✅ Validação
    participant G as 🤖 Gemini API
    participant S as 💾 Storage
    participant H as 📚 Histórico
    
    U->>F: Preenche formulário
    F->>V: Valida dados
    V->>G: Envia prompt para IA
    G->>G: Processa com Gemini
    G->>F: Retorna ideias geradas
    F->>U: Exibe resultados
    U->>S: Clica "Salvar"
    S->>H: Adiciona ao histórico
    H->>U: Confirma salvamento
    
    Note over G: Google Gemini 1.5 Flash<br/>Rate limit: 60 req/min
    Note over S: Local Storage +<br/>Firebase Firestore
```

## 🏗️ Arquitetura de Serviços (Clean Architecture)

```mermaid
graph TB
    subgraph "🎨 Presentation Layer"
        A[React Components]
        B[Pages]
        C[Hooks]
        D[Contexts]
    end
    
    subgraph "🔧 Application Layer"
        E[Service DI Container]
        F[Use Cases]
        G[DTOs]
        H[Interfaces]
    end
    
    subgraph "💼 Domain Layer"
        I[Entities]
        J[Business Rules]
        K[Domain Services]
        L[Repositories]
    end
    
    subgraph "🌐 Infrastructure Layer"
        M[Firebase Client]
        N[Gemini Client]
        O[Analytics Client]
        P[Cache Layer]
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
    L --> P
    
    style A fill:#e3f2fd
    style E fill:#f1f8e9
    style I fill:#fff8e1
    style M fill:#fce4ec
```

## 📱 Estados da Aplicação

```mermaid
stateDiagram-v2
    [*] --> Loading
    Loading --> Unauthenticated: Auth Check Failed
    Loading --> Authenticated: Auth Check Success
    
    Unauthenticated --> Authenticating: Login Attempt
    Authenticating --> Authenticated: Success
    Authenticating --> Unauthenticated: Failed
    
    Authenticated --> Dashboard: Default Route
    Dashboard --> IdeaGeneration: User Intent
    Dashboard --> Calendar: User Intent
    Dashboard --> Analytics: User Intent
    
    IdeaGeneration --> Processing: Generate Ideas
    Processing --> Success: AI Response
    Processing --> Error: API Error
    Success --> Dashboard: Save Complete
    Error --> IdeaGeneration: Retry
    
    Calendar --> Planning: View/Edit
    Planning --> Dashboard: Save Complete
    
    Analytics --> Insights: Load Data
    Insights --> Dashboard: View Complete
```

## 🔄 Ciclo de Vida dos Dados

```mermaid
graph LR
    A[📝 Input do Usuário] --> B[🔍 Validação]
    B --> C[🤖 Processamento IA]
    C --> D[📄 Resultado Gerado]
    D --> E[💾 Persistência Local]
    E --> F[☁️ Sync Remoto]
    F --> G[📊 Analytics]
    G --> H[📈 Insights]
    H --> I[🎯 Recomendações]
    I --> A
    
    style A fill:#e8f5e8
    style C fill:#fff3e0
    style D fill:#e1f5fe
    style F fill:#f3e5f5
    style H fill:#fce4ec
```

## ⚡ Performance & Monitoring

```mermaid
graph TD
    A[🚀 App Start] --> B[⏱️ Performance Monitor]
    B --> C[📊 Metrics Collection]
    C --> D{🔍 Threshold Check}
    
    D -->|Normal| E[✅ Continue Monitoring]
    D -->|Warning| F[⚠️ Log Warning]
    D -->|Critical| G[🚨 Alert & Recovery]
    
    E --> C
    F --> H[📝 Performance Log]
    G --> I[🔄 Auto Recovery]
    
    H --> J[📈 Analytics Dashboard]
    I --> K[🛠️ Error Reporting]
    
    J --> L[👨‍💻 Developer Insights]
    K --> M[🔧 Auto Fix Attempts]
    
    style A fill:#e8f5e8
    style D fill:#fff3e0
    style G fill:#ffebee
```

## 🧪 Testing Flow

```mermaid
graph LR
    A[💻 Code Change] --> B[🧪 Unit Tests]
    B --> C[🔗 Integration Tests]
    C --> D[🌐 E2E Tests]
    D --> E[📊 Coverage Report]
    E --> F{✅ Pass Threshold?}
    
    F -->|Yes| G[🚀 Deploy Staging]
    F -->|No| H[❌ Block Deployment]
    
    G --> I[🔍 Staging Tests]
    I --> J[📈 Performance Tests]
    J --> K[✅ Production Deploy]
    
    H --> L[📝 Fix Required]
    L --> A
    
    style F fill:#fff3e0
    style G fill:#e8f5e8
    style H fill:#ffebee
    style K fill:#e1f5fe
```

---

## 📋 Como Atualizar Este Documento

Este arquivo é **versionado junto com o código** e deve ser atualizado quando:

1. **Novos fluxos** são implementados
2. **Arquitetura** é modificada  
3. **Integrações** são adicionadas/removidas
4. **Performance** patterns mudam

### Comandos para Regenerar Diagramas:

```bash
# Visualizar no VS Code com Mermaid Preview
code docs/architecture/system-flows.md

# Gerar PNGs automaticamente (se needed)
npm run generate-diagrams
```

### IA Automation:

```typescript
// IA pode detectar mudanças e atualizar automaticamente
const updateFlows = {
  trigger: "Code changes in /src/services/ or /src/components/",
  action: "Regenerate relevant flow diagrams", 
  validation: "Ensure diagrams match current implementation"
}
``` 