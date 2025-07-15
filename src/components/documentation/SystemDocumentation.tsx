import React, { useState } from 'react';

interface DiagramData {
  id: string;
  title: string;
  description: string;
  mermaidCode: string;
  category: 'architecture' | 'flow' | 'data' | 'performance';
  lastUpdated: string;
}

const diagrams: DiagramData[] = [
  {
    id: 'system-overview',
    title: '🏗️ Visão Geral do Sistema',
    description: 'Arquitetura Clean Architecture com camadas bem definidas',
    category: 'architecture',
    lastUpdated: '2025-01-15',
    mermaidCode: `graph TB
      subgraph "🎨 Presentation"
        A[Components]
        B[Pages]
        C[Hooks]
      end
      subgraph "🔧 Application"
        D[Services]
        E[Use Cases]
        F[DTOs]
      end
      subgraph "💼 Domain"
        G[Entities]
        H[Business Rules]
      end
      subgraph "🌐 Infrastructure"
        I[APIs]
        J[Database]
        K[Cache]
      end
      A --> D
      D --> G
      G --> I`
  },
  {
    id: 'user-flow',
    title: '👤 Fluxo do Usuário',
    description: 'Jornada completa do usuário no sistema',
    category: 'flow',
    lastUpdated: '2025-01-15',
    mermaidCode: `graph TD
      A[Login] --> B[Dashboard]
      B --> C[Gerar Ideias]
      B --> D[Calendário]
      C --> E[Resultados]
      E --> F[Salvar]
      F --> G[Histórico]`
  },
  {
    id: 'data-flow',
    title: '🔄 Fluxo de Dados',
    description: 'Como os dados transitam pelo sistema',
    category: 'data',
    lastUpdated: '2025-01-15',
    mermaidCode: `sequenceDiagram
      participant U as Usuário
      participant C as Component
      participant S as Service
      participant A as API
      U->>C: Input
      C->>S: Process
      S->>A: Request
      A->>S: Response
      S->>C: Data
      C->>U: Display`
  },
  {
    id: 'performance',
    title: '⚡ Monitoramento',
    description: 'Sistema de performance e health checks',
    category: 'performance',
    lastUpdated: '2025-01-15',
    mermaidCode: `graph LR
      A[App] --> B[Metrics]
      B --> C{Health?}
      C -->|OK| D[Continue]
      C -->|Error| E[Alert]
      E --> F[Recovery]`
  }
];

const categories = {
  architecture: { label: '🏗️ Arquitetura', color: '#1976d2' },
  flow: { label: '🔄 Fluxos', color: '#388e3c' },
  data: { label: '📊 Dados', color: '#f57c00' },
  performance: { label: '⚡ Performance', color: '#7b1fa2' }
};

export const SystemDocumentation: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDiagram, setSelectedDiagram] = useState<DiagramData | null>(null);

  const filteredDiagrams = selectedCategory === 'all' 
    ? diagrams 
    : diagrams.filter(d => d.category === selectedCategory);

  return (
    <div style={{ 
      fontFamily: 'system-ui', 
      height: '100vh', 
      display: 'flex',
      backgroundColor: '#f5f5f5'
    }}>
      {/* Sidebar */}
      <div style={{ 
        width: '300px', 
        backgroundColor: 'white', 
        borderRight: '1px solid #e0e0e0',
        padding: '20px',
        overflowY: 'auto'
      }}>
        <h2 style={{ 
          margin: '0 0 20px 0', 
          color: '#1976d2',
          fontSize: '18px',
          fontWeight: '600'
        }}>
          📐 Documentação do Sistema
        </h2>

        {/* Category Filter */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '14px', marginBottom: '8px', color: '#666' }}>
            Filtrar por categoria:
          </h3>
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            <option value="all">🔍 Todos</option>
            {Object.entries(categories).map(([key, cat]) => (
              <option key={key} value={key}>{cat.label}</option>
            ))}
          </select>
        </div>

        {/* Diagram List */}
        <div>
          {filteredDiagrams.map((diagram) => (
            <div
              key={diagram.id}
              onClick={() => setSelectedDiagram(diagram)}
              style={{
                padding: '12px',
                margin: '0 0 8px 0',
                backgroundColor: selectedDiagram?.id === diagram.id ? '#e3f2fd' : '#fafafa',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ 
                fontSize: '14px', 
                fontWeight: '500',
                marginBottom: '4px',
                color: categories[diagram.category].color
              }}>
                {diagram.title}
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: '#666',
                lineHeight: '1.4'
              }}>
                {diagram.description}
              </div>
              <div style={{ 
                fontSize: '11px', 
                color: '#999',
                marginTop: '4px'
              }}>
                Atualizado: {diagram.lastUpdated}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '20px' }}>
        {selectedDiagram ? (
          <div>
            <div style={{ 
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              marginBottom: '20px'
            }}>
              <h1 style={{ 
                margin: '0 0 12px 0',
                color: categories[selectedDiagram.category].color,
                fontSize: '24px'
              }}>
                {selectedDiagram.title}
              </h1>
              <p style={{ 
                color: '#666',
                lineHeight: '1.6',
                margin: '0 0 20px 0'
              }}>
                {selectedDiagram.description}
              </p>
              
              <div style={{
                backgroundColor: '#f8f9fa',
                border: '1px solid #e9ecef',
                borderRadius: '6px',
                padding: '16px'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px'
                }}>
                  <h3 style={{ 
                    margin: 0,
                    fontSize: '16px',
                    color: '#495057'
                  }}>
                    📋 Código Mermaid:
                  </h3>
                  <button
                    onClick={() => navigator.clipboard.writeText(selectedDiagram.mermaidCode)}
                    style={{
                      padding: '6px 12px',
                      border: '1px solid #007bff',
                      backgroundColor: '#007bff',
                      color: 'white',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    📋 Copiar
                  </button>
                </div>
                <pre style={{
                  fontSize: '12px',
                  fontFamily: 'Monaco, monospace',
                  overflow: 'auto',
                  backgroundColor: 'white',
                  padding: '12px',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  margin: 0,
                  lineHeight: '1.4'
                }}>
                  {selectedDiagram.mermaidCode}
                </pre>
              </div>

              <div style={{
                marginTop: '16px',
                padding: '12px',
                backgroundColor: '#d1ecf1',
                border: '1px solid #bee5eb',
                borderRadius: '4px',
                fontSize: '14px'
              }}>
                💡 <strong>Como usar:</strong> 
                <br />
                1. Copie o código Mermaid acima
                <br />
                2. Cole no VS Code (com extensão Mermaid Preview)
                <br />
                3. Ou cole em qualquer editor online que suporte Mermaid
                <br />
                4. O diagrama será renderizado automaticamente
              </div>

              <div style={{
                marginTop: '16px',
                padding: '12px',
                backgroundColor: '#f8d7da',
                border: '1px solid #f5c6cb',
                borderRadius: '4px',
                fontSize: '13px'
              }}>
                🤖 <strong>Atualização Automática:</strong> 
                Este diagrama é atualizado automaticamente pela IA sempre que há mudanças significativas no sistema.
                Última atualização: {selectedDiagram.lastUpdated}
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '8px',
            textAlign: 'center',
            color: '#666'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📐</div>
            <h2 style={{ marginBottom: '8px', color: '#1976d2' }}>
              Selecione um diagrama
            </h2>
            <p>
              Escolha um item na sidebar para visualizar a documentação detalhada
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemDocumentation; 