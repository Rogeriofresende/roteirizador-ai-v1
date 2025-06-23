# Plano de Reformulação da UI - Roteirista PRO

Este documento descreve o plano de ação para a modernização completa da interface de usuário do aplicativo Roteirista PRO, com base na solicitação do usuário.

**Visão Geral:** O objetivo é aplicar uma identidade visual coesa, futurista e inspirada em designs como os da Apple, Tesla e SpaceX, utilizando elementos com transparência.

---

### Fase 1: Redesenho do Gerador de Roteiro (Ponto de Partida)

-   **Status:** Concluído
-   **Etapa 1.1: Inspiração Futurista:** Utilizar a ferramenta "Magic MCP" para obter um novo design para a página `GeneratorPage.tsx`.
-   **Etapa 1.2: Modernização dos Formulários:** Redesenhar os componentes de formulário existentes (`InputField`, `SelectField`, `TextareaField`, etc.) para que sigam a nova identidade visual.
-   **Etapa 1.3: Implementação no Gerador:** Aplicar o novo layout e os componentes redesenhados à página `GeneratorPage.tsx`.

---

### Fase 2: Criação do Novo Dashboard de Usuário

-   **Status:** Concluído
-   **Etapa 2.1: Geração da Tabela:** Utilizar a ferramenta para criar um novo componente de tabela detalhada e moderna.
-   **Etapa 2.2: Integração no Dashboard:** Substituir o conteúdo atual da `UserDashboardPage.tsx` pela nova tabela, adaptando-a para exibir os roteiros salvos.

---

### Fase 3: Novas Páginas de Login e Cadastro

-   **Status:** Concluído
-   **Etapa 3.1: Design Minimalista:** Buscar um design de formulário de autenticação moderno e minimalista.
-   **Etapa 3.2: Implementação:** Atualizar as páginas `LoginPage.tsx` e `SignupPage.tsx`, garantindo que usem os mesmos componentes de formulário da Fase 1 para manter a consistência.

---

### Fase 4: Finalização e Coesão Visual

-   **Status:** Concluído
-   **Etapa 4.1: Refinamento da Navegação:** Redesenhar a `Navbar` para que ela se alinhe com o novo estilo do aplicativo.
-   **Etapa 4.2: Revisão Geral:** Fazer uma varredura final em todo o aplicativo para garantir uma identidade visual coesa e polida. 