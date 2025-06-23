# Migração de Componentes para Horizon UI

Este documento registra o processo de migração dos componentes de UI da aplicação de um tema `shadcn/ui` padrão para o tema customizado **Horizon UI for shadcn/ui**.

## Fases da Migração

### Fase 1: Atualização do Tema Base e Componentes Iniciais
- **Status:** Concluída ✅

- **Passos Executados:**
  1.  **Atualização do `index.css`:** As variáveis de cor globais foram substituídas pelas do tema Horizon UI.
  2.  **Correção de Bug de Build:** Um erro `Cannot apply unknown utility class` foi corrigido substituindo diretivas `@apply` por CSS puro no `index.css`.
  3.  **Migração de Componentes de Formulário:** Os componentes `Button`, `Card`, `Input`, `Label`, `Textarea` e `Select` foram atualizados com os novos estilos e estruturas do Horizon UI.
  4.  **Refatoração do `Select`:** O componente `Select` teve uma *breaking change*, exigindo a instalação de `@radix-ui/react-select` e a refatoração da `GeneratorPage` para usar a nova API.

### Fase 2: Migração dos Componentes Restantes e Revisão Geral
- **Status:** Concluída ✅

- **Passos Executados:**
  1.  **Migração de Componentes de UI:** Os componentes `Table`, `Tabs`, `Dialog`, `Separator` e `Skeleton` foram atualizados para as versões do Horizon UI.
  2.  **Refatoração da Página de Dashboard:** A `UserDashboardPage` foi atualizada para usar a nova sintaxe de componentes `Table`, corrigindo uma quebra de layout.
  3.  **Revisão Visual Completa:** Todas as páginas (`HomePage`, `GeneratorPage`, `UserDashboardPage`, `LoginPage`, `SignupPage`) foram inspecionadas para garantir a consistência visual com o novo tema.
  4.  **Criação deste Documento:** O arquivo `MIGRACAO_HORIZON_UI.md` foi criado para documentar o processo.

## Próximos Passos Sugeridos

- **Revisão de Funcionalidade:** Testar todas as interações do usuário em todas as páginas para garantir que as mudanças visuais não introduziram bugs de comportamento.
- **Otimização de Performance:** Analisar o impacto dos novos componentes e estilos (ex: `backdrop-blur`) na performance da aplicação.
- **Limpeza de Código:** Remover quaisquer estilos ou componentes antigos que não estão mais em uso. 