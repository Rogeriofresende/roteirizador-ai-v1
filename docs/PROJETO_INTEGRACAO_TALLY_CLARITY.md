# 📋 PROJETO: Integração Tally.so + Microsoft Clarity

## **📊 VISÃO GERAL**

### **Objetivo**
Reintegrar e configurar as ferramentas **Tally.so** e **Microsoft Clarity** para melhorar a coleta de feedback dos usuários e análise comportamental da aplicação.

### **Justificativa**
- **Tally.so**: Coleta de feedback estruturado e pesquisas de UX
- **Microsoft Clarity**: Análise de comportamento com heatmaps e gravações de sessão
- **Complementaridade**: Dados quantitativos (Clarity) + dados qualitativos (Tally)

---

## **🎯 ESCOPO DO PROJETO**

### **Tally.so - Formulários e Feedback**
1. **Configuração da conta**
2. **Criação de formulários estratégicos**
3. **Integração no código**
4. **Analytics de submissões**

### **Microsoft Clarity - Análise Comportamental**
1. **Configuração da conta e projeto**
2. **Implementação do script de tracking**
3. **Configuração de metas e funis**
4. **Dashboard de monitoramento**

---

## **📋 CRONOGRAMA DE EXECUÇÃO**

### **FASE 1: Configuração de Contas (30min)**
- [ ] Criar/configurar conta Tally.so
- [ ] Criar/configurar projeto Microsoft Clarity
- [ ] Obter IDs e scripts necessários

### **FASE 2: Microsoft Clarity (45min)**
- [ ] Implementar script de tracking
- [ ] Configurar objetivos personalizados
- [ ] Testar funcionamento
- [ ] Verificar dados no dashboard

### **FASE 3: Tally.so (60min)**
- [ ] Criar formulários essenciais
- [ ] Implementar modais de feedback
- [ ] Configurar triggers automáticos
- [ ] Testar submissões

### **FASE 4: Integração e Testes (30min)**
- [ ] Verificar funcionamento conjunto
- [ ] Documentar configurações
- [ ] Deploy para produção

---

## **🛠️ ESPECIFICAÇÕES TÉCNICAS**

### **Microsoft Clarity**

#### **Implementação**
```typescript
// src/services/clarityService.ts
export class ClarityService {
  private static projectId = import.meta.env.VITE_CLARITY_PROJECT_ID;
  
  static initialize() {
    if (!this.projectId) {
      console.warn('Microsoft Clarity project ID not configured');
      return;
    }
    
    // Implementar script de tracking
    this.loadClarityScript();
    this.setupCustomEvents();
  }
  
  static trackEvent(eventName: string, data?: any) {
    if (typeof window.clarity === 'function') {
      window.clarity('event', eventName, data);
    }
  }
}
```

#### **Eventos Personalizados**
- `script_generated` - Quando usuário gera roteiro
- `ai_refinement_used` - Uso do editor IA
- `project_saved` - Salvamento de projeto
- `export_completed` - Export de conteúdo
- `pwa_installed` - Instalação PWA

### **Tally.so**

#### **Implementação**
```typescript
// src/services/tallyService.ts
export class TallyService {
  static showFeedbackForm(formId: string, trigger?: string) {
    if (typeof window.Tally === 'object') {
      window.Tally.openPopup(formId, {
        layout: 'modal',
        width: 600,
        autoClose: 5000
      });
    }
  }
  
  static trackFormEvent(formId: string, event: string) {
    // Analytics interno
    analyticsService.trackEvent('tally_form_interaction', 'engagement', {
      form_id: formId,
      event_type: event
    });
  }
}
```

#### **Formulários Estratégicos**
1. **Feedback de UX** - Após 3 roteiros gerados
2. **Pesquisa de Funcionalidades** - Modal semanal
3. **NPS Score** - Usuários ativos mensais
4. **Bug Report** - Link na navbar

---

## **🔧 IMPLEMENTAÇÃO DETALHADA**

### **1. Variáveis de Ambiente**
```bash
# .env.local
VITE_CLARITY_PROJECT_ID=seu_clarity_project_id
VITE_TALLY_FORM_FEEDBACK=seu_tally_form_id_feedback
VITE_TALLY_FORM_NPS=seu_tally_form_id_nps
VITE_TALLY_FORM_FEATURES=seu_tally_form_id_features
VITE_TALLY_FORM_BUGS=seu_tally_form_id_bugs
```

### **2. Configuração de Scripts**
```html
<!-- index.html -->
<!-- Microsoft Clarity -->
<script type="text/javascript">
  // Script será injetado dinamicamente
</script>

<!-- Tally.so -->
<script src="https://tally.so/widgets/embed.js"></script>
```

### **3. Integração com Analytics Existente**
```typescript
// src/services/analyticsService.ts
class AnalyticsService {
  // Método existente expandido
  trackEvent(event: string, category: string, properties?: any) {
    // GA4 existente
    this.trackToGA4(event, category, properties);
    
    // Microsoft Clarity
    ClarityService.trackEvent(event, properties);
    
    // Analytics interno existente
    this.trackToFirebase(event, category, properties);
  }
}
```

---

## **📊 MÉTRICAS DE SUCESSO**

### **Microsoft Clarity - KPIs**
- **Heatmaps**: Identificar áreas de maior interação
- **Recordings**: Analisar jornada do usuário
- **Dead Clicks**: Detectar elementos problemáticos
- **Rage Clicks**: Identificar pontos de frustração

### **Tally.so - KPIs**
- **Taxa de Resposta**: > 15% nos formulários
- **NPS Score**: Baseline e evolução
- **Feedback Quality**: Categorização de sugestões
- **Bug Reports**: Tempo de resolução

---

## **🎨 DESIGN DE INTEGRAÇÃO**

### **Tally Forms - Triggers**
```typescript
// Feedback automático após marcos
if (userStats.totalProjects === 3) {
  setTimeout(() => {
    TallyService.showFeedbackForm(TALLY_FORM_FEEDBACK, 'milestone_3_projects');
  }, 2000);
}

// NPS para usuários ativos
if (userStats.sessionsThisMonth >= 10) {
  TallyService.showFeedbackForm(TALLY_FORM_NPS, 'active_user_nps');
}
```

### **Clarity Events - Contextuais**
```typescript
// Editor IA usado
onAIRefinement((result) => {
  ClarityService.trackEvent('ai_refinement_success', {
    improvement_type: result.type,
    confidence: result.confidence,
    user_accepted: result.accepted
  });
});

// PWA instalado
onPWAInstalled(() => {
  ClarityService.trackEvent('pwa_installed', {
    install_prompt_shown: true,
    user_agent: navigator.userAgent
  });
});
```

---

## **🚀 PRÓXIMOS PASSOS**

### **Execução Imediata**
1. [ ] Criar contas e obter credenciais
2. [ ] Implementar Microsoft Clarity
3. [ ] Criar formulários Tally.so
4. [ ] Integrar no código
5. [ ] Testar funcionamento
6. [ ] Deploy e monitoramento

### **Pós-Implementação**
1. [ ] Análise semanal dos dados Clarity
2. [ ] Review mensal dos feedbacks Tally
3. [ ] Otimizações baseadas em insights
4. [ ] Documentação de learnings

---

## **💡 BENEFÍCIOS ESPERADOS**

### **Dados Quantitativos (Clarity)**
- Identificar páginas com alta taxa de abandono
- Otimizar UX baseado em heatmaps
- Detectar bugs de interface não reportados
- Medir eficácia de mudanças de design

### **Dados Qualitativos (Tally)**
- Feedback direto sobre funcionalidades
- Sugestões de melhorias prioritárias
- Validação de roadmap de produto
- Identificação de pain points específicos

### **Sinergia**
- Correlacionar feedback qualitativo com comportamento observado
- Priorizar melhorias com base em dados + opinião
- Melhorar taxa de retenção e satisfação
- Acelerar ciclo de desenvolvimento orientado por dados 