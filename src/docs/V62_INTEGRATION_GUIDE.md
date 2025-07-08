# Guia de Integração V6.2 Services - IA A Frontend

## 🚀 Visão Geral

Os services V6.2 estão prontos e otimizados para integração. Este guia mostra como integrar cada funcionalidade no frontend.

## 📋 Checklist de Integração

### 1. Adicionar V62ServicesProvider ao App.tsx
```tsx
import { V62ServicesProvider } from './contexts/V62ServicesProvider';

function App() {
  return (
    <AuthProvider>
      <V62ServicesProvider>
        {/* resto da aplicação */}
      </V62ServicesProvider>
    </AuthProvider>
  );
}
```

### 2. Inicialização Manual (se necessário)
```tsx
import { initializeV62Services } from './services/initializeServices';

// Em componente de setup ou App.tsx
useEffect(() => {
  initializeV62Services().then(result => {
    console.log('V6.2 Services initialized:', result);
  });
}, []);
```

## 🎯 Integrações por Funcionalidade

### 1. **Predictive UX** - PlatformSelector
```tsx
import { usePredictiveUX } from '../hooks/usePredictiveUX';

function PlatformSelector() {
  const { 
    suggestions,
    recordInteraction,
    getPlatformScores 
  } = usePredictiveUX();

  // Obter sugestões personalizadas
  const platformSuggestions = suggestions.filter(s => s.type === 'platform');
  
  // Registrar clique
  const handlePlatformClick = (platform: string) => {
    recordInteraction('platform_select', { platform });
  };

  // Ordenar plataformas por score
  const scores = getPlatformScores();
  const sortedPlatforms = platforms.sort((a, b) => 
    (scores[b.id] || 0) - (scores[a.id] || 0)
  );
}
```

### 2. **Multi-AI Selection** - GeneratorPage
```tsx
import { useMultiAI } from '../hooks/useMultiAI';

function GeneratorPage() {
  const {
    selectedProvider,
    selectProvider,
    generateContent,
    compareProviders,
    isGenerating
  } = useMultiAI();

  // Gerar com IA selecionada
  const handleGenerate = async () => {
    const response = await generateContent(prompt, {
      provider: selectedProvider,
      temperature: 0.7
    });
  };

  // Comparar respostas
  const handleCompare = async () => {
    const comparisons = await compareProviders(prompt);
    // Mostrar resultados side-by-side
  };
}
```

### 3. **Voice Synthesis** - Integração Global
```tsx
import { useVoiceSynthesis } from '../hooks/useVoiceSynthesis';

function VoiceButton({ text }) {
  const { speak, stop, speaking, supported } = useVoiceSynthesis();

  if (!supported) return null;

  return (
    <button onClick={() => speaking ? stop() : speak(text)}>
      {speaking ? '⏹️ Parar' : '🔊 Ouvir'}
    </button>
  );
}
```

### 4. **Smart Loading States** - Qualquer Operação Async
```tsx
import { useSmartLoading } from '../hooks/useSmartLoading';

function MyComponent() {
  const loading = useSmartLoading('content_generation');

  const handleAction = async () => {
    await loading.withProgress(async (updateProgress) => {
      updateProgress(10, 'Preparando prompt...');
      // ... operação
      updateProgress(50, 'Gerando conteúdo...');
      // ... mais operações
      updateProgress(90, 'Finalizando...');
    });
  };

  if (loading.isLoading) {
    return (
      <LoadingOverlay 
        message={loading.message}
        progress={loading.progress}
        canCancel={loading.canCancel}
        onCancel={loading.cancelLoading}
      />
    );
  }
}
```

### 5. **Direct Access UX** - Layout Principal
```tsx
import { useDirectAccess } from '../hooks/useDirectAccess';

function AppLayout() {
  const { isCommandPaletteOpen, toggleCommandPalette } = useDirectAccess();

  // Atalho global Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleCommandPalette();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {isCommandPaletteOpen && <CommandPalette />}
      {/* resto do layout */}
    </>
  );
}
```

### 6. **Advanced Micro-interactions** - Botões e Elementos
```tsx
import { useAdvancedMicroInteractions } from '../hooks/useAdvancedMicroInteractions';

function PremiumButton({ children, onClick }) {
  const { bindInteraction, createSuccess, createError } = useAdvancedMicroInteractions();
  
  // Bind automático de interações
  const buttonProps = bindInteraction({
    interactionId: 'premium_button_click',
    trigger: 'click'
  });

  const handleClick = async (e) => {
    try {
      await onClick();
      createSuccess(e.currentTarget);
    } catch (error) {
      createError(e.currentTarget);
    }
  };

  return (
    <button 
      {...buttonProps.props}
      ref={buttonProps.ref}
      onClick={handleClick}
      className="premium-button"
    >
      {children}
    </button>
  );
}
```

### 7. **Intelligence Dashboard** - Admin Panel
```tsx
import { useIntelligenceDashboard } from '../hooks/useIntelligenceDashboard';

function AdminDashboard() {
  const { 
    dashboardData,
    insights,
    alerts,
    serviceHealth 
  } = useIntelligenceDashboard();

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Widgets de métricas */}
      {dashboardData.widgets.map(widget => (
        <MetricCard key={widget.id} {...widget} />
      ))}
      
      {/* Insights em tempo real */}
      <InsightsFeed insights={insights} />
      
      {/* Alertas */}
      <AlertsPanel alerts={alerts} />
    </div>
  );
}
```

## 🔧 Configuração Avançada

### Desabilitar Services Específicos
```tsx
<V62ServicesProvider config={{
  enablePredictiveUX: true,
  enableMultiAI: true,
  enableVoiceSynthesis: false, // Desabilitado
  enableSmartLoading: true,
  enableDirectAccess: true,
  enableMicroInteractions: true,
  enablePerformanceMonitoring: false, // Desabilitado
  enableIntelligenceDashboard: true
}}>
```

### Configurar Intensidade das Micro-interações
```tsx
<V62ServicesProvider config={{
  microInteractionsIntensity: 'premium', // 'subtle' | 'normal' | 'premium'
  performanceThresholds: {
    fps: 30, // Alerta se FPS < 30
    memory: 150 * 1024 * 1024, // 150MB
    latency: 2000 // 2s
  }
}}>
```

## 📊 Monitoramento de Performance

```tsx
import { useV62Performance } from '../contexts/V62ServicesProvider';

function PerformanceIndicator() {
  const { fps, latency, errorRate } = useV62Performance();
  
  return (
    <div className="performance-stats">
      <span>FPS: {fps}</span>
      <span>Latência: {latency}ms</span>
      <span>Erros: {errorRate}%</span>
    </div>
  );
}
```

## 🎨 Exemplos de Integração Completa

### GeneratorPage com Todas as Features
```tsx
import { useMultiAI } from '../hooks/useMultiAI';
import { useSmartLoading } from '../hooks/useSmartLoading';
import { useAdvancedMicroInteractions } from '../hooks/useAdvancedMicroInteractions';
import { useVoiceSynthesis } from '../hooks/useVoiceSynthesis';
import { usePredictiveUX } from '../hooks/usePredictiveUX';

function EnhancedGeneratorPage() {
  const multiAI = useMultiAI();
  const loading = useSmartLoading('content_generation');
  const microInteractions = useAdvancedMicroInteractions();
  const voice = useVoiceSynthesis();
  const predictive = usePredictiveUX();

  const handleGenerate = async () => {
    // Registrar interação para aprendizado
    predictive.recordInteraction('generate_click', {
      platform: selectedPlatform,
      aiProvider: multiAI.selectedProvider
    });

    // Gerar com loading inteligente
    const result = await loading.withProgress(async (update) => {
      update(10, 'Analisando prompt...');
      
      const response = await multiAI.generateContent(prompt, {
        provider: multiAI.selectedProvider
      });
      
      update(90, 'Finalizando...');
      return response;
    });

    // Feedback de sucesso com micro-interação
    if (result) {
      microInteractions.createSuccess();
      
      // Opção de ouvir o resultado
      if (voice.supported) {
        voice.speak(result.content);
      }
    }
  };

  return (
    <div className="generator-page">
      {/* UI com todas as integrações */}
    </div>
  );
}
```

## 📌 Notas Importantes

1. **Lazy Loading**: Os services são carregados sob demanda para melhor performance
2. **Error Boundaries**: Adicione error boundaries ao redor de componentes que usam services
3. **TypeScript**: Todos os hooks e services são 100% tipados
4. **SSR**: Compatible com server-side rendering (services detectam ambiente)
5. **Mobile**: Micro-interações adaptam-se automaticamente para mobile

## 🚨 Troubleshooting

### Service não inicializado
```tsx
// Verificar se service está disponível
import { useServiceAvailable } from '../contexts/V62ServicesProvider';

function MyComponent() {
  const isMultiAIAvailable = useServiceAvailable('multiAI');
  
  if (!isMultiAIAvailable) {
    return <div>Multi-AI não disponível</div>;
  }
  
  // Usar o service normalmente
}
```

### Performance Issues
```tsx
// Desabilitar features pesadas em devices lentos
const [reducedMotion] = useMediaQuery('(prefers-reduced-motion: reduce)');

<V62ServicesProvider config={{
  enableMicroInteractions: !reducedMotion,
  enablePerformanceMonitoring: !reducedMotion
}}>
```

## ✅ Próximos Passos

1. Integrar V62ServicesProvider no App.tsx
2. Adicionar micro-interações aos botões principais
3. Implementar smart loading no GeneratorPage
4. Configurar command palette (Cmd+K)
5. Adicionar voice synthesis aos resultados
6. Implementar predictive UX no PlatformSelector
7. Configurar multi-AI selector

---

**Todos os services estão prontos e testados. A integração é plug-and-play!** 