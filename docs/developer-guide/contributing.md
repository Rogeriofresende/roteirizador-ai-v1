# 🤝 Guia de Contribuição - Roteirar-ia

> Guia completo para desenvolvedores que desejam contribuir com o projeto

## 🎯 **Bem-vindo(a) Contribuidor(a)!**

Obrigado pelo interesse em contribuir com o **Roteirar-ia**! Este projeto é uma plataforma de geração de roteiros com IA que utiliza Google Gemini para criar conteúdo otimizado para diferentes plataformas sociais.

### **Como Contribuir:**
- 🐛 **Reportar bugs** usando nosso [template de bug report](../templates/bug-report.md)
- ✨ **Sugerir funcionalidades** usando nosso [template de feature request](../templates/feature-request.md)
- 💻 **Contribuir com código** seguindo este guia
- 📚 **Melhorar documentação** 
- 🧪 **Escrever testes**
- 🎨 **Melhorar UX/UI**

---

## 🚀 **Setup do Ambiente de Desenvolvimento**

### **Pré-requisitos**
```bash
- Node.js 18+ 
- npm 9+
- Git
- VS Code (recomendado)
- Conta Google (para Gemini API)
- Conta Firebase
```

### **1. Fork e Clone**
```bash
# 1. Faça fork do repositório
# 2. Clone seu fork
git clone https://github.com/SEU_USUARIO/Roteirar-ia.git
cd Roteirar-ia

# 3. Adicione o repositório original como upstream
git remote add upstream https://github.com/ORIGINAL_USER/Roteirar-ia.git
```

### **2. Instalação de Dependências**
```bash
# Instalar dependências
npm install

# Verificar se tudo está funcionando
npm run lint
npm run test
```

### **3. Configuração do Ambiente**
```bash
# Copiar arquivo de ambiente
cp .env.example .env.local

# Configurar variáveis necessárias:
# VITE_FIREBASE_API_KEY=
# VITE_FIREBASE_AUTH_DOMAIN=
# VITE_FIREBASE_PROJECT_ID=
# VITE_GEMINI_API_KEY=
```

### **4. Executar Projeto**
```bash
# Ambiente de desenvolvimento
npm run dev

# Verificar build de produção
npm run build
npm run preview
```

---

## 📋 **Fluxo de Contribuição**

### **1. Antes de Começar**
- [ ] Verifique se já existe uma [issue](https://github.com/org/repo/issues) relacionada
- [ ] Se não existe, crie uma issue descrevendo o problema/funcionalidade
- [ ] Aguarde feedback dos maintainers antes de começar o desenvolvimento
- [ ] Para bugs críticos, pode começar imediatamente

### **2. Criando uma Branch**
```bash
# Sempre trabalhe em uma branch separada
git checkout -b tipo/descricao-curta

# Exemplos de nomes de branch:
git checkout -b feature/novo-editor-roteiro
git checkout -b bugfix/corrigir-login-google
git checkout -b docs/atualizar-readme
git checkout -b refactor/melhorar-performance
```

### **3. Desenvolvendo**
- Siga os [padrões de código](#-padrões-de-código)
- Escreva [testes](#-escrevendo-testes) para novas funcionalidades
- Mantenha commits [bem organizados](#-padrões-de-commit)
- Teste em diferentes navegadores/dispositivos

### **4. Abrindo Pull Request**
- Use nosso [template de PR](#-template-de-pull-request)
- Descreva claramente as mudanças
- Referencie issues relacionadas (#123)
- Aguarde review dos maintainers
- Faça os ajustes solicitados

---

## 💻 **Padrões de Código**

### **TypeScript**
```typescript
// ✅ BOM - Interfaces bem definidas
interface RoteiroPlatform {
  id: string;
  name: string;
  maxLength: number;
  features: string[];
}

// ✅ BOM - Tipos específicos
type GenerationStatus = 'idle' | 'loading' | 'success' | 'error';

// ❌ EVITAR - Tipos muito genéricos
const data: any = getData();
```

### **React Components**
```tsx
// ✅ BOM - Componente funcional com TypeScript
interface ButtonProps {
  variant: 'primary' | 'secondary';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant, 
  children, 
  onClick, 
  disabled = false 
}) => {
  return (
    <button 
      className={`btn btn-${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
```

### **Hooks Customizados**
```tsx
// ✅ BOM - Hook customizado tipado
export const useScriptGeneration = () => {
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [script, setScript] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const generateScript = useCallback(async (prompt: string) => {
    setStatus('loading');
    setError(null);
    
    try {
      const result = await geminiService.generateScript(prompt);
      setScript(result);
      setStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setStatus('error');
    }
  }, []);

  return { status, script, error, generateScript };
};
```

### **Styling (Tailwind CSS)**
```tsx
// ✅ BOM - Classes organizadas e responsivas
<div className="
  flex flex-col gap-4 
  p-6 rounded-lg 
  bg-white dark:bg-gray-800 
  shadow-md hover:shadow-lg 
  transition-shadow duration-200
  md:flex-row md:gap-6
">

// ❌ EVITAR - Classes muito longas em uma linha
<div className="flex flex-col gap-4 p-6 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow duration-200 md:flex-row md:gap-6">
```

### **Error Handling**
```typescript
// ✅ BOM - Error handling estruturado
try {
  const result = await geminiService.generateScript(prompt);
  return result;
} catch (error) {
  console.error('Erro na geração do roteiro:', error);
  
  if (error instanceof ApiRateLimitError) {
    throw new Error('Muitas requisições. Tente novamente em alguns minutos.');
  }
  
  if (error instanceof ApiKeyError) {
    throw new Error('Erro de autenticação. Verifique sua API key.');
  }
  
  throw new Error('Erro interno. Tente novamente.');
}
```

---

## 🧪 **Escrevendo Testes**

### **Estrutura de Testes**
```
src/
├── components/
│   ├── Button.tsx
│   └── Button.test.tsx
├── hooks/
│   ├── useScriptGeneration.ts
│   └── useScriptGeneration.test.ts
└── services/
    ├── geminiService.ts
    └── geminiService.test.ts
```

### **Testes de Componentes**
```tsx
// Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button variant="primary">Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(
      <Button variant="primary" onClick={handleClick}>
        Click me
      </Button>
    );
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(
      <Button variant="primary" disabled>
        Click me
      </Button>
    );
    
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### **Testes de Hooks**
```tsx
// useScriptGeneration.test.ts
import { renderHook, act } from '@testing-library/react';
import { useScriptGeneration } from './useScriptGeneration';

describe('useScriptGeneration', () => {
  it('should initialize with idle status', () => {
    const { result } = renderHook(() => useScriptGeneration());
    
    expect(result.current.status).toBe('idle');
    expect(result.current.script).toBe('');
    expect(result.current.error).toBeNull();
  });

  it('should generate script successfully', async () => {
    const { result } = renderHook(() => useScriptGeneration());
    
    await act(async () => {
      await result.current.generateScript('Test prompt');
    });
    
    expect(result.current.status).toBe('success');
    expect(result.current.script).toBeTruthy();
  });
});
```

### **Testes E2E**
```typescript
// tests/e2e/script-generation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Script Generation', () => {
  test('should generate script for YouTube', async ({ page }) => {
    await page.goto('/');
    
    // Login
    await page.click('[data-testid="login-button"]');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="submit-button"]');
    
    // Navigate to generator
    await page.click('[data-testid="generator-link"]');
    
    // Fill form
    await page.fill('[data-testid="subject-input"]', 'Como fazer pão caseiro');
    await page.selectOption('[data-testid="platform-select"]', 'youtube');
    
    // Generate script
    await page.click('[data-testid="generate-button"]');
    
    // Wait for result
    await expect(page.locator('[data-testid="script-output"]')).toBeVisible();
    await expect(page.locator('[data-testid="script-output"]')).toContainText('pão');
  });
});
```

---

## 📝 **Padrões de Commit**

### **Formato de Commit**
```
tipo(escopo): descrição curta

Descrição detalhada (opcional)

- Mudança específica 1
- Mudança específica 2

Refs: #123, #456
```

### **Tipos de Commit**
- **feat**: Nova funcionalidade
- **fix**: Correção de bug
- **docs**: Mudanças na documentação
- **style**: Formatação, ponto e vírgula, etc
- **refactor**: Refatoração sem mudança de funcionalidade
- **test**: Adição ou correção de testes
- **chore**: Mudanças no build, ferramentas, etc

### **Exemplos**
```bash
# Feature
git commit -m "feat(generator): adicionar suporte para LinkedIn posts

- Implementar template específico para LinkedIn
- Adicionar validação de caracteres
- Incluir sugestões de hashtags

Refs: #234"

# Bug fix
git commit -m "fix(auth): corrigir login com Google

- Resolver problema de redirect
- Melhorar tratamento de erro
- Atualizar testes

Refs: #123"

# Docs
git commit -m "docs(api): atualizar documentação do Gemini

- Adicionar exemplos de uso
- Documentar novos parâmetros
- Corrigir links quebrados"
```

---

## 🔍 **Code Review Guidelines**

### **Para Autores de PR**
- [ ] Código está funcionando localmente
- [ ] Testes estão passando
- [ ] Documentação foi atualizada
- [ ] Breaking changes estão documentadas
- [ ] Screenshots/GIFs para mudanças visuais
- [ ] Performance não foi degradada

### **Para Reviewers**
- [ ] Código segue os padrões do projeto
- [ ] Lógica está clara e bem implementada
- [ ] Testes cobrem casos importantes
- [ ] Não introduz vulnerabilidades
- [ ] Performance é aceitável
- [ ] UX/UI está consistente

### **Checklist de Review**
```markdown
## Code Review Checklist

### Funcionalidade
- [ ] Feature funciona como esperado
- [ ] Edge cases estão cobertos
- [ ] Error handling adequado

### Código
- [ ] Código é limpo e legível
- [ ] Não há duplicação desnecessária
- [ ] Nomenclatura é clara

### Testes
- [ ] Testes unitários adequados
- [ ] Testes E2E se necessário
- [ ] Coverage não diminuiu

### Performance
- [ ] Sem vazamentos de memória
- [ ] Bundle size não aumentou significativamente
- [ ] Loading times aceitáveis

### Segurança
- [ ] Inputs são validados
- [ ] Não há exposição de dados sensíveis
- [ ] CORS configurado corretamente
```

---

## 🎯 **Template de Pull Request**

```markdown
## 📋 Descrição

Descrição clara e concisa das mudanças implementadas.

## 🎯 Tipo de Mudança

- [ ] 🐛 Bug fix (mudança que corrige um problema)
- [ ] ✨ Nova feature (mudança que adiciona funcionalidade)
- [ ] 💥 Breaking change (mudança que quebra compatibilidade)
- [ ] 📚 Documentação (mudança apenas em documentação)
- [ ] 🔧 Refactoring (mudança que não corrige bug nem adiciona feature)
- [ ] ⚡ Performance (mudança que melhora performance)
- [ ] 🧪 Testes (adição ou correção de testes)

## 🧪 Testes

- [ ] Testes unitários adicionados/atualizados
- [ ] Testes E2E adicionados/atualizados
- [ ] Todos os testes estão passando
- [ ] Testado manualmente em múltiplos navegadores

## 📱 Screenshots (se aplicável)

| Antes | Depois |
|-------|--------|
| ![]() | ![]()  |

## 📋 Checklist

- [ ] Código segue os padrões do projeto
- [ ] Self-review realizado
- [ ] Comentários adicionados em código complexo
- [ ] Documentação atualizada
- [ ] Não quebra funcionalidades existentes
- [ ] Commits seguem padrão de mensagem

## 🔗 Issues Relacionadas

Refs: #123, #456
Closes: #789
```

---

## 🏗️ **Arquitetura do Projeto**

### **Estrutura de Pastas**
```
src/
├── components/          # Componentes React reutilizáveis
│   ├── ui/             # Componentes base (Button, Input, etc)
│   ├── form/           # Componentes de formulário
│   └── blocks/         # Componentes complexos
├── pages/              # Páginas da aplicação
├── hooks/              # Custom hooks
├── services/           # Integração com APIs externas
├── contexts/           # Context providers
├── lib/                # Utilitários e helpers
├── types.ts            # Definições de tipos
└── constants.ts        # Constantes da aplicação
```

### **Padrões de Import**
```typescript
// ✅ BOM - Imports organizados
// React imports
import React, { useState, useEffect } from 'react';

// Third-party imports
import { Button } from '@/components/ui/Button';
import { useAuthContext } from '@/contexts/AuthContext';

// Internal imports
import { geminiService } from '@/services/geminiService';
import { ScriptTemplate } from '@/types';

// Relative imports
import './ComponentName.css';
```

---

## 🐛 **Debugging e Troubleshooting**

### **Tools Recomendadas**
- **React Developer Tools** - Debug components e hooks
- **Redux DevTools** - Se usar Redux/Zustand
- **Network Tab** - Debug API calls
- **Lighthouse** - Performance e acessibilidade

### **Problemas Comuns**
```typescript
// Problema: "Cannot read property of undefined"
// Solução: Sempre verifique se dados existem
const userName = user?.name ?? 'Usuário anônimo';

// Problema: Infinite re-renders
// Solução: Memoize funções e objetos
const handleClick = useCallback(() => {
  // logic here
}, [dependency]);

// Problema: Memory leaks em useEffect
// Solução: Sempre limpe subscriptions
useEffect(() => {
  const subscription = service.subscribe(callback);
  
  return () => {
    subscription.unsubscribe();
  };
}, []);
```

---

## 🚀 **Deploy e CI/CD**

### **Processo de Deploy**
1. **PR aprovado** → Merge para `main`
2. **CI/CD Pipeline** → Executa testes e build
3. **Deploy automático** → Para staging primeiro
4. **Smoke tests** → Validação automática
5. **Deploy produção** → Após aprovação manual

### **Ambientes**
- **Development**: Local development
- **Staging**: `staging.roteirar-ia.com`
- **Production**: `roteirar-ia.com`

---

## 📞 **Comunicação e Suporte**

### **Canais de Comunicação**
- **GitHub Issues**: Para bugs e feature requests
- **GitHub Discussions**: Para perguntas gerais
- **Discord**: `#dev-channel` para discussões em tempo real
- **Email**: dev@roteirar-ia.com para assuntos privados

### **Mantainers**
- **@tech-lead** - Tech Lead (architecture, reviews)
- **@frontend-lead** - Frontend Lead (UI/UX, components)
- **@backend-lead** - Backend Lead (APIs, integrations)

### **Office Hours**
- **Segunda-feira 14:00-15:00** - Q&A geral
- **Quinta-feira 10:00-11:00** - Code review session

---

## 🏆 **Reconhecimento**

### **Contribuidores Ativos**
Contribuidores que fazem PRs regulares ou ajudam significativamente:
- Recebem badge especial no GitHub
- Mencionados em release notes
- Convite para roadmap planning sessions

### **First-time Contributors**
- Tag especial no primeiro PR
- Menção em monthly newsletter
- Welcome package com stickers 🎉

---

## 📚 **Recursos Adicionais**

### **Documentação Técnica**
- [Arquitetura do Sistema](../architecture/overview.md)
- [API Documentation](../api/)
- [Testes E2E](PLANO_TESTES_E2E.md)

### **Tutorials**
- [Setup do Ambiente](setup.md)
- [Guia do Gemini API](../user-guide/setup-gemini-api.md)
- [Troubleshooting](../operations/troubleshooting.md)

### **External Resources**
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Vitest Guide](https://vitest.dev/guide/)
- [Playwright Docs](https://playwright.dev/docs/intro)

---

## ❓ **FAQ**

### **Posso trabalhar em issues já atribuídas?**
Sim, mas comente na issue perguntando se ainda está ativa e se pode ajudar.

### **Como escolher uma issue para trabalhar?**
Procure por labels: `good first issue`, `help wanted`, `bug`, `enhancement`.

### **Preciso de permissão para criar issues?**
Não! Issues são sempre bem-vindas. Use nossos templates para melhor organização.

### **Como reportar vulnerabilidades?**
Envie email direto para security@roteirar-ia.com em vez de criar issue pública.

### **Posso contribuir apenas com documentação?**
Absolutamente! Documentação é super importante e sempre precisamos de melhorias.

---

**Obrigado por contribuir com o Roteirar-ia! 🚀**

*Última atualização: Janeiro 2025* 