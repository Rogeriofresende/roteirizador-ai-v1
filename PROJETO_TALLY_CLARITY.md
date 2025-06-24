# PROJETO: Integração Tally.so + Microsoft Clarity

## VISÃO GERAL

### Objetivo
Reintegrar e configurar as ferramentas Tally.so e Microsoft Clarity para melhorar a coleta de feedback dos usuários e análise comportamental da aplicação.

### Justificativa
- Tally.so: Coleta de feedback estruturado e pesquisas de UX
- Microsoft Clarity: Análise de comportamento com heatmaps e gravações de sessão
- Complementaridade: Dados quantitativos (Clarity) + dados qualitativos (Tally)

## ESCOPO DO PROJETO

### Tally.so - Formulários e Feedback
1. Configuração da conta
2. Criação de formulários estratégicos
3. Integração no código
4. Analytics de submissões

### Microsoft Clarity - Análise Comportamental
1. Configuração da conta e projeto
2. Implementação do script de tracking
3. Configuração de metas e funis
4. Dashboard de monitoramento

## CRONOGRAMA DE EXECUÇÃO

### FASE 1: Configuração de Contas (30min)
- [ ] Criar/configurar conta Tally.so
- [ ] Criar/configurar projeto Microsoft Clarity
- [ ] Obter IDs e scripts necessários

### FASE 2: Microsoft Clarity (45min)
- [ ] Implementar script de tracking
- [ ] Configurar objetivos personalizados
- [ ] Testar funcionamento
- [ ] Verificar dados no dashboard

### FASE 3: Tally.so (60min)
- [ ] Criar formulários essenciais
- [ ] Implementar modais de feedback
- [ ] Configurar triggers automáticos
- [ ] Testar submissões

### FASE 4: Integração e Testes (30min)
- [ ] Verificar funcionamento conjunto
- [ ] Documentar configurações
- [ ] Deploy para produção

## ESPECIFICAÇÕES TÉCNICAS

### Microsoft Clarity
```typescript
// src/services/clarityService.ts
export class ClarityService {
  private static projectId = import.meta.env.VITE_CLARITY_PROJECT_ID;
  
  static initialize() {
    if (!this.projectId) {
      console.warn('Microsoft Clarity project ID not configured');
      return;
    }
    
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

### Tally.so
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
}
```

## PRÓXIMOS PASSOS

1. [ ] Criar contas e obter credenciais
2. [ ] Implementar Microsoft Clarity
3. [ ] Criar formulários Tally.so
4. [ ] Integrar no código
5. [ ] Testar funcionamento
6. [ ] Deploy e monitoramento 