# 🏗️ Arquitetura de Componentes - Roteirar-ia

> Documentação detalhada da estrutura e organização dos componentes React

## 📋 **Visão Geral**

O sistema de componentes do Roteirar-ia é estruturado em camadas hierárquicas, seguindo princípios de design system e composição. Cada camada tem responsabilidades específicas e oferece diferentes níveis de abstração.

---

## 🏛️ **Hierarquia de Componentes**

```
📦 Components Architecture
├── 🎯 ui/              # Componentes básicos (Design System)
├── 📋 form/            # Componentes de formulário
├── 🧩 blocks/          # Componentes complexos e reutilizáveis
├── 📄 pages/           # Componentes de página
└── 🔌 contexts/        # Providers e contextos
```

---

## 🎯 **Camada UI (Design System)**

### **Propósito**
Componentes básicos e fundamentais que implementam o design system. São altamente reutilizáveis e sem lógica de negócio.

### **Estrutura**
```
src/components/ui/
├── Button.tsx          # Botões com variações
├── Input.tsx           # Campos de entrada
├── Card.tsx            # Containers
├── Dialog.tsx          # Modais e diálogos
├── Alert.tsx           # Alertas e notificações
├── Badge.tsx           # Tags e badges
├── Skeleton.tsx        # Loading placeholders
├── LoadingSpinner.tsx  # Indicadores de carregamento
├── Table.tsx           # Tabelas
├── Tabs.tsx            # Navegação em abas
└── ThemeToggle.tsx     # Alternador de tema
```

### **Exemplo de Implementação**
```tsx
// Button.tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  disabled = false,
  loading = false,
  onClick
}) => {
  const baseClasses = 'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        disabled && 'opacity-50 cursor-not-allowed',
        loading && 'cursor-wait'
      )}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <LoadingSpinner size="sm" />
          {children}
        </div>
      ) : (
        children
      )}
    </button>
  );
};
```

---

## 📋 **Camada Form**

### **Propósito**
Componentes especializados em formulários, validação e entrada de dados. Integram com bibliotecas como React Hook Form.

### **Estrutura**
```
src/components/form/
├── InputField.tsx        # Campo de entrada com label e erro
├── TextareaField.tsx     # Área de texto com validação
├── SelectField.tsx       # Seletor dropdown
├── HybridSelectField.tsx # Seletor híbrido (dropdown + input)
└── PlatformSelector.tsx  # Seletor específico de plataformas
```

### **Exemplo de Implementação**
```tsx
// InputField.tsx
interface InputFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'number';
  placeholder?: string;
  required?: boolean;
  error?: string;
  value: string;
  onChange: (value: string) => void;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  type = 'text',
  placeholder,
  required = false,
  error,
  value,
  onChange
}) => {
  return (
    <div className="space-y-1">
      <Label htmlFor={name} required={required}>
        {label}
      </Label>
      
      <Input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        error={!!error}
      />
      
      {error && (
        <Alert variant="error" size="sm">
          {error}
        </Alert>
      )}
    </div>
  );
};
```

---

## 🧩 **Camada Blocks**

### **Propósito**
Componentes complexos que combinam múltiplos componentes menores. Contêm lógica de negócio específica e são menos reutilizáveis.

### **Estrutura**
```
src/components/blocks/
├── HeroSection.tsx       # Seção hero da homepage
├── ScriptForm.tsx        # Formulário principal de geração
├── Navbar.tsx           # Barra de navegação
├── ProtectedRoute.tsx   # Wrapper para rotas protegidas
└── EditableScriptArea.tsx # Área editável de roteiro
```

### **Exemplo de Implementação**
```tsx
// ScriptForm.tsx
interface ScriptFormProps {
  onSubmit: (data: ScriptFormData) => void;
  isLoading: boolean;
}

export const ScriptForm: React.FC<ScriptFormProps> = ({
  onSubmit,
  isLoading
}) => {
  const [formData, setFormData] = useState<ScriptFormData>({
    subject: '',
    platform: 'youtube',
    tone: 'professional',
    length: 'medium'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    onSubmit(formData);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <InputField
          label="Assunto do Roteiro"
          name="subject"
          placeholder="Ex: Como fazer pão caseiro"
          required
          value={formData.subject}
          onChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}
          error={errors.subject}
        />

        <PlatformSelector
          value={formData.platform}
          onChange={(platform) => setFormData(prev => ({ ...prev, platform }))}
          error={errors.platform}
        />

        <div className="flex gap-4">
          <SelectField
            label="Tom"
            name="tone"
            options={TONE_OPTIONS}
            value={formData.tone}
            onChange={(tone) => setFormData(prev => ({ ...prev, tone }))}
          />

          <SelectField
            label="Duração"
            name="length"
            options={LENGTH_OPTIONS}
            value={formData.length}
            onChange={(length) => setFormData(prev => ({ ...prev, length }))}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isLoading}
          className="w-full"
        >
          {isLoading ? 'Gerando Roteiro...' : 'Gerar Roteiro'}
        </Button>
      </form>
    </Card>
  );
};
```

---

## 📄 **Camada Pages**

### **Propósito**
Componentes que representam páginas completas da aplicação. Orquestram múltiplos blocks e gerenciam estado de página.

### **Estrutura**
```
src/pages/
├── HomePage.tsx          # Página inicial
├── LoginPage.tsx         # Página de login
├── SignupPage.tsx        # Página de cadastro
├── GeneratorPage.tsx     # Página de geração de roteiros
└── UserDashboardPage.tsx # Dashboard do usuário
```

### **Exemplo de Implementação**
```tsx
// GeneratorPage.tsx
export const GeneratorPage: React.FC = () => {
  const { user } = useAuthContext();
  const { generateScript, isLoading, error } = useScriptGeneration();
  const [generatedScript, setGeneratedScript] = useState<string>('');

  const handleFormSubmit = async (formData: ScriptFormData) => {
    try {
      const script = await generateScript(formData);
      setGeneratedScript(script);
    } catch (err) {
      console.error('Erro na geração:', err);
    }
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulário */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Gerador de Roteiros
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Crie roteiros otimizados para suas plataformas favoritas
              </p>
            </div>

            <ScriptForm
              onSubmit={handleFormSubmit}
              isLoading={isLoading}
            />

            {error && (
              <Alert variant="error">
                {error}
              </Alert>
            )}
          </div>

          {/* Resultado */}
          <div className="space-y-6">
            {generatedScript ? (
              <EditableScriptArea
                script={generatedScript}
                onChange={setGeneratedScript}
              />
            ) : (
              <Card className="h-96 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <p>Seu roteiro aparecerá aqui</p>
                  <p className="text-sm mt-1">Preencha o formulário para começar</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
```

---

## 🔌 **Camada Contexts**

### **Propósito**
Gerenciamento de estado global e lógica compartilhada entre componentes.

### **Estrutura**
```
src/contexts/
├── AuthContext.tsx      # Autenticação e usuário
├── ThemeContext.tsx     # Tema claro/escuro
└── ScriptContext.tsx    # Estado dos roteiros
```

### **Exemplo de Implementação**
```tsx
// AuthContext.tsx
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          name: firebaseUser.displayName || 'Usuário'
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const signup = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName: name });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      logout,
      signup
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext deve ser usado dentro de AuthProvider');
  }
  return context;
};
```

---

## 🔄 **Fluxo de Dados**

### **Padrão de Props Down, Events Up**
```
Pages (Estado global)
  ↓ props
Blocks (Lógica de negócio)
  ↓ props
UI Components (Apresentação)
  ↑ eventos
Blocks (Processamento)
  ↑ eventos
Pages (Atualização de estado)
```

### **Exemplo de Fluxo**
```tsx
// 1. Page mantém estado
const [scripts, setScripts] = useState<Script[]>([]);

// 2. Page passa props para Block
<ScriptList
  scripts={scripts}
  onEdit={(script) => handleEdit(script)}
  onDelete={(id) => handleDelete(id)}
/>

// 3. Block processa e passa para UI
<Card>
  <Button onClick={() => onEdit(script)}>
    Editar
  </Button>
  <Button variant="danger" onClick={() => onDelete(script.id)}>
    Excluir
  </Button>
</Card>

// 4. UI emite eventos que sobem a hierarquia
```

---

## 🎨 **Padrões de Design**

### **Composition over Inheritance**
```tsx
// ✅ BOM - Composição
<Card>
  <Card.Header>
    <Card.Title>Título</Card.Title>
  </Card.Header>
  <Card.Content>
    Conteúdo
  </Card.Content>
  <Card.Footer>
    <Button>Ação</Button>
  </Card.Footer>
</Card>

// ❌ EVITAR - Hierarquia rígida
<SpecializedCard
  title="Título"
  content="Conteúdo"
  action="Ação"
/>
```

### **Render Props Pattern**
```tsx
// Para compartilhar lógica entre componentes
<DataFetcher url="/api/scripts">
  {({ data, loading, error }) => (
    loading ? <Skeleton /> :
    error ? <Alert variant="error">{error}</Alert> :
    <ScriptList scripts={data} />
  )}
</DataFetcher>
```

### **Compound Components**
```tsx
// Componentes que trabalham juntos
export const Tabs = ({ children, defaultValue }) => {
  // lógica compartilhada
};

Tabs.List = TabsList;
Tabs.Trigger = TabsTrigger;
Tabs.Content = TabsContent;

// Uso
<Tabs defaultValue="tab1">
  <Tabs.List>
    <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
    <Tabs.Trigger value="tab2">Tab 2</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="tab1">Conteúdo 1</Tabs.Content>
  <Tabs.Content value="tab2">Conteúdo 2</Tabs.Content>
</Tabs>
```

---

## 🧪 **Testabilidade**

### **Estrutura de Testes**
```
src/components/
├── ui/
│   ├── Button.tsx
│   └── Button.test.tsx
├── form/
│   ├── InputField.tsx
│   └── InputField.test.tsx
└── blocks/
    ├── ScriptForm.tsx
    └── ScriptForm.test.tsx
```

### **Estratégias de Teste**
1. **UI Components**: Renderização, props, eventos
2. **Form Components**: Validação, submissão
3. **Blocks**: Integração entre componentes
4. **Pages**: Fluxos completos (E2E)

---

## 📊 **Performance**

### **Otimizações Implementadas**
- **React.memo**: Para componentes puros
- **useMemo/useCallback**: Para cálculos pesados
- **Lazy Loading**: Para componentes grandes
- **Code Splitting**: Por rota/funcionalidade

### **Exemplo de Otimização**
```tsx
// Componente memorizado
export const ExpensiveComponent = React.memo<Props>(({
  data,
  onAction
}) => {
  // Cálculo pesado memorizado
  const processedData = useMemo(() => {
    return expensiveCalculation(data);
  }, [data]);

  // Callback memorizado
  const handleAction = useCallback((item) => {
    onAction(item);
  }, [onAction]);

  return (
    <div>
      {processedData.map(item => (
        <Item
          key={item.id}
          data={item}
          onClick={handleAction}
        />
      ))}
    </div>
  );
});
```

---

## 🔧 **Ferramentas e Utilitários**

### **Utilitários de Styling**
```tsx
// lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### **Hooks Customizados**
```tsx
// hooks/useLocalStorage.ts
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}
```

---

## 📝 **Convenções de Nomenclatura**

### **Componentes**
- **PascalCase**: `ButtonComponent`
- **Descritivo**: `UserProfileCard` não `Card`
- **Sufixo claro**: `Modal`, `Form`, `List`

### **Props e Estados**
- **camelCase**: `isLoading`, `userData`
- **Booleanos**: Prefixo `is`, `has`, `can`
- **Handlers**: Prefixo `on`, `handle`

### **Arquivos**
- **Componentes**: `ComponentName.tsx`
- **Testes**: `ComponentName.test.tsx`
- **Styles**: `ComponentName.module.css`
- **Stories**: `ComponentName.stories.tsx`

---

**Documentação criada:** Janeiro 2025  
**Última atualização:** Janeiro 2025  
**Versão:** 1.0 