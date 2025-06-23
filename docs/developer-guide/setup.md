# ⚡ Setup de Desenvolvimento - Roteirizar IA

> Guia completo para configurar o ambiente de desenvolvimento

## 📋 **Pré-requisitos**

### **Tecnologias Necessárias**
```bash
# Node.js 18+ (recomendado 20+)
node --version  # v20.x.x

# npm 9+
npm --version   # 9.x.x

# Python 3.8+ (para servidor local)
python3 --version  # 3.8+

# Git
git --version  # 2.x.x
```

### **Ferramentas Recomendadas**
- **IDE:** VSCode, WebStorm, ou Cursor
- **Terminal:** iTerm2, Hyper, ou terminal padrão
- **Navegador:** Chrome DevTools para debugging

---

## 🚀 **Instalação Rápida**

### **1. Clonar o Repositório**
```bash
# Clone via HTTPS
git clone https://github.com/seu-usuario/roteirizar-ia.git

# Ou via SSH
git clone git@github.com:seu-usuario/roteirizar-ia.git

# Navegar para o diretório
cd roteirizar-ia
```

### **2. Instalar Dependências**
```bash
# Instalar pacotes npm
npm install

# Verificar instalação
npm list --depth=0
```

### **3. Configurar Variáveis de Ambiente**
```bash
# Copiar template
cp .env.local.example .env.local

# Editar com suas chaves
nano .env.local
```

**Exemplo de `.env.local`:**
```env
# Google Gemini API
VITE_GOOGLE_GEMINI_API_KEY=sua_chave_aqui

# Firebase (se usando autenticação)
VITE_FIREBASE_API_KEY=sua_chave_firebase
VITE_FIREBASE_AUTH_DOMAIN=projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto

# Ambiente
VITE_ENVIRONMENT=development
```

### **4. Executar em Desenvolvimento**
```bash
# Opção 1: Servidor Vite (desenvolvimento com hot reload)
npm run dev

# Opção 2: Servidor Python (produção local)
python3 -m http.server 8080
```

---

## 🏗️ **Estrutura do Projeto**

### **Visão Geral**
```
roteirizar-ia/
├── 📁 src/                    # Código fonte principal
│   ├── 📁 components/         # Componentes React
│   │   ├── 📁 ui/            # Componentes base (shadcn/ui)
│   │   ├── 📁 form/          # Componentes de formulário
│   │   └── 📁 blocks/        # Blocos de layout
│   ├── 📁 pages/             # Páginas da aplicação
│   ├── 📁 services/          # Integrações e APIs
│   ├── 📁 contexts/          # Context APIs React
│   ├── 📁 lib/               # Utilitários
│   └── 📁 tests/             # Testes unitários
├── 📁 public/                 # Arquivos estáticos
├── 📁 docs/                   # Documentação
├── 📄 package.json            # Dependências e scripts
├── 📄 vite.config.ts          # Configuração Vite
├── 📄 tailwind.config.js      # Configuração Tailwind
└── 📄 tsconfig.json           # Configuração TypeScript
```

### **Arquivos de Configuração**

#### **`vite.config.ts`**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    open: true
  }
})
```

#### **`tailwind.config.js`**
```javascript
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Customizações do tema
    },
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
}
```

---

## 🛠️ **Scripts Disponíveis**

### **Desenvolvimento**
```bash
# Servidor de desenvolvimento (hot reload)
npm run dev              # http://localhost:3000

# Servidor de desenvolvimento (rede)
npm run dev -- --host    # Acesso via rede local
```

### **Build e Deploy**
```bash
# Build para produção
npm run build

# Preview da build
npm run preview

# Verificar build
npm run build && npm run preview
```

### **Qualidade de Código**
```bash
# Linting
npm run lint            # Verificar problemas
npm run lint:fix        # Corrigir automaticamente

# Formatação
npm run format          # Prettier (se configurado)

# Type checking
npm run type-check      # Verificar tipos TypeScript
```

### **Testes**
```bash
# Executar todos os testes
npm run test

# Testes em modo watch
npm run test:watch

# Coverage de testes
npm run test:coverage

# Testes específicos
npm run test -- UserPage.test.tsx
```

---

## 🧪 **Configuração de Testes**

### **Jest + Testing Library**
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
  ],
}
```

### **Exemplo de Teste**
```typescript
// src/tests/components/Button.test.tsx
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/Button'

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })
})
```

---

## 🔧 **Configuração do Editor**

### **VSCode - Extensões Recomendadas**
```json
// .vscode/extensions.json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

### **VSCode - Settings**
```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

### **Prettier Configuration**
```json
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

---

## 📦 **Dependências Principais**

### **Runtime**
```json
{
  "react": "^19.1.0",
  "react-dom": "^19.1.0",
  "react-router-dom": "^7.6.2",
  "@google/generative-ai": "^0.24.1",
  "firebase": "^11.9.1",
  "framer-motion": "^12.18.1",
  "lucide-react": "^0.519.0"
}
```

### **Development**
```json
{
  "typescript": "~5.8.3",
  "vite": "^6.3.5",
  "@vitejs/plugin-react": "^4.4.1",
  "tailwindcss": "^4.1.10",
  "eslint": "^9.25.0",
  "vitest": "^3.2.4"
}
```

---

## 🚨 **Troubleshooting de Setup**

### **Problema: Dependências não instalam**
```bash
# Limpar cache
npm cache clean --force

# Deletar node_modules e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### **Problema: Erros de TypeScript**
```bash
# Verificar versão do TypeScript
npm list typescript

# Reinstalar tipos
npm install --save-dev @types/react @types/react-dom

# Limpar cache do TypeScript
npx tsc --build --clean
```

### **Problema: Vite não carrega**
```bash
# Verificar porta disponível
lsof -i :3000

# Usar porta diferente
npm run dev -- --port 3001

# Limpar cache do Vite
rm -rf node_modules/.vite
```

### **Problema: Tailwind não funciona**
```bash
# Verificar configuração
npx tailwindcss -i ./src/index.css -o ./dist/output.css --watch

# Reinstalar Tailwind
npm uninstall tailwindcss
npm install -D tailwindcss@latest
```

---

## 🔄 **Fluxo de Desenvolvimento**

### **1. Antes de Começar**
```bash
# Atualizar branch main
git checkout main
git pull origin main

# Criar nova branch
git checkout -b feature/nova-funcionalidade
```

### **2. Durante o Desenvolvimento**
```bash
# Executar testes frequentemente
npm run test

# Verificar linting
npm run lint

# Commit com mensagens claras
git add .
git commit -m "feat: adiciona nova funcionalidade X"
```

### **3. Antes do Push**
```bash
# Build e teste final
npm run build
npm run test

# Push da branch
git push origin feature/nova-funcionalidade
```

---

## 📊 **Monitoramento de Desenvolvimento**

### **Performance**
```bash
# Análise de bundle
npm run build
npx vite-bundle-analyzer dist

# Lighthouse para performance
npm run preview
# Abrir DevTools > Lighthouse
```

### **Debugging**
```javascript
// Console de debugging do sistema
window.monitoring?.getStatus()

// React DevTools
// Instalar extensão React DevTools
```

---

## 🔐 **Segurança**

### **Variáveis de Ambiente**
- ✅ **Nunca** commite `.env.local`
- ✅ Use `VITE_` prefix para variáveis públicas
- ✅ Mantenha chaves sensíveis fora do código

### **Dependências**
```bash
# Auditoria de segurança
npm audit

# Corrigir vulnerabilidades
npm audit fix

# Verificar pacotes desatualizados
npm outdated
```

---

## 📚 **Recursos Adicionais**

### **Documentação**
- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript Handbook](https://typescriptlang.org/docs)

### **Ferramentas Úteis**
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Vite Bundle Analyzer](https://github.com/btd/rollup-plugin-visualizer)
- [Tailwind IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

---

**Criado:** Junho 2025  
**Atualizado:** Junho 2025  
**Versão:** 1.0  
**Próxima revisão:** Trimestral 