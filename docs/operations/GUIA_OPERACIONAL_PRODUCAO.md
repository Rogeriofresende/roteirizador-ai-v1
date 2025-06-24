# 🚀 **GUIA OPERACIONAL - ROTEIRIZAR IA EM PRODUÇÃO**

> **Sistema de monitoramento empresarial implementado para MVP solo**  
> **Custo: R$ 0,00 | Alertas críticos automáticos | Estrutura evolutiva**

---

## 📊 **SISTEMA DE MONITORAMENTO IMPLEMENTADO**

### **✅ O QUE ESTÁ FUNCIONANDO AGORA**

#### **🔍 Health Checks Automáticos**
- **Gemini API**: Conectividade e API key ✅
- **Firebase**: Autenticação e Firestore ✅ 
- **Performance**: Memória e carregamento ✅
- **Storage**: localStorage e PWA ✅
- **Frequência**: A cada 2 minutos (críticos: 30s)

#### **📈 Analytics Completo (Google GA4)**
- **Business Metrics**: Scripts gerados, conversões
- **User Journey**: Funil completo trackado
- **Performance**: Web Vitals automático
- **Error Tracking**: Todos os erros capturados
- **Session Data**: Dados locais + GA4

#### **🚨 Sistema de Alertas**
- **Alertas Críticos**: Sistema down, API falhando
- **Notificações Browser**: Para problemas sérios
- **Console Logging**: Tudo registrado para debug
- **Local Storage**: Histórico de alertas mantido

---

## 🎯 **COMO USAR O SISTEMA**

### **1. ACESSO AO DASHBOARD**

#### **Método 1: Via Interface**
- Clique no **indicador de status** na navbar (bolinha verde/amarela/vermelha)
- Status sempre visível: "Sistema OK", "Atenção", "Problema"

#### **Método 2: Atalho de Teclado**
```
Ctrl + Shift + D = Abre dashboard instantaneamente
```

#### **Método 3: Console do Navegador**
```javascript
// Verificar saúde geral
healthCheck.getHealth()

// Ver últimos resultados
healthCheck.getLastResults()

// Verificar alertas
healthCheck.getAlerts()

// Analytics da sessão
analytics.getSessionData()

// Exportar todos os dados
analytics.exportAnalyticsData()
```

### **2. INTERPRETANDO O DASHBOARD**

#### **Status Geral**
- **🟢 HEALTHY (70-100%)**: Tudo funcionando
- **🟡 DEGRADED (40-69%)**: Alguns problemas, não críticos
- **🔴 DOWN (0-39%)**: Problemas sérios, precisa atenção

#### **Health Checks Individuais**
- **GEMINI API**: Se vermelho = API key inválida ou quota
- **FIREBASE**: Se vermelho = problema de conectividade  
- **PERFORMANCE**: Se amarelo = app lento, limpar cache
- **STORAGE**: Se amarelo = localStorage cheio

#### **Analytics da Sessão**
- **Page Views**: Páginas visitadas na sessão
- **Scripts Gerados**: Quantos roteiros foram criados
- **Conversão**: % de visitantes que geram roteiros
- **Duração**: Tempo ativo na sessão

---

## 🚨 **PROCEDIMENTOS DE EMERGÊNCIA**

### **ALERTA CRÍTICO: Sistema DOWN**

#### **Passo 1: Diagnóstico Rápido (30 segundos)**
```javascript
// No console (F12):
healthCheck.getHealth()
```

**Verificar:**
- **Score < 40%**: Sistema realmente com problema
- **Gemini API critical**: Problema com IA
- **Firebase critical**: Problema com autenticação

#### **Passo 2: Soluções Imediatas**

**Se Gemini API Crítico:**
```javascript
// Testar API key
localStorage.getItem('GEMINI_API_KEY')

// Se null ou inválida, reconfigurar
localStorage.setItem('GEMINI_API_KEY', 'sua_nova_key')
location.reload()
```

**Se Firebase Crítico:**
- Verificar se firebase.com está acessível
- Tentar recarregar a página
- Verificar configurações de rede/firewall

**Se Performance Crítica:**
```javascript
// Limpar dados locais
localStorage.clear()
location.reload()
```

#### **Passo 3: Escalar se Necessário**
- Exportar dados do dashboard
- Documentar o problema
- Se persistir > 15 minutos, considerar manutenção

### **ALERTA: Sistema DEGRADADO**

#### **Ações Recomendadas**
1. **Monitorar**: Sistema ainda funciona, mas com problemas
2. **Investigar**: Quais checks estão amarelos/vermelhos
3. **Documentar**: Salvar dados para análise posterior
4. **Aguardar**: Muitos problemas se resolvem sozinhos

---

## 📈 **MÉTRICAS DE NEGÓCIO - COMO INTERPRETAR**

### **Taxa de Conversão (Crítica para o Negócio)**
```
Conversão = (Scripts Gerados / Page Views) × 100

🎯 Meta: >60% para usuários orgânicos
🔥 Excelente: >80%
⚠️ Atenção: <40%
```

### **Tempo de Geração (Performance)**
```
🎯 Meta: <10 segundos
⚡ Excelente: <5 segundos  
⚠️ Lento: >15 segundos
```

### **Taxa de Erro (Qualidade)**
```
🎯 Meta: <5% dos scripts falham
✅ Ótimo: <2%
⚠️ Problema: >10%
```

### **Indicadores de Crescimento**
- **Scripts/dia**: Tendência de uso
- **Sessions > 5min**: Engajamento real
- **Features utilizadas**: Copiar, download, refinar

---

## 🔧 **CONFIGURAÇÃO INICIAL**

### **Google Analytics 4 (OBRIGATÓRIO)**

#### **1. Criar Conta GA4**
```
1. Acesse: https://analytics.google.com/
2. Criar propriedade > GA4
3. Copiar MEASUREMENT_ID (formato: G-XXXXXXXXXX)
```

#### **2. Configurar no Projeto**
```bash
# .env.local (criar se não existe)
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

#### **3. Verificar Funcionamento**
```javascript
// Console do navegador
analytics.getDebugInfo()
// Deve mostrar: ga4_loaded: true
```

### **Alertas Externos (OPCIONAL)**

#### **Webhook Gratuito**
```bash
# .env.local
VITE_ALERT_WEBHOOK_URL=https://webhook.site/sua-url-unica
```

**Como configurar:**
1. Acesse webhook.site
2. Copie sua URL única
3. Adicione no .env.local
4. Reinicie o sistema

---

## 🎯 **ROADMAP DE MELHORIAS**

### **Fase Atual: ✅ MVP Empresarial**
- Health checks robustos
- Analytics completo
- Alertas críticos
- Dashboard operacional

### **Próxima Fase: 📈 Crescimento**
- Email alerts automáticos
- Slack/Discord integration  
- Métricas de retenção
- A/B testing

### **Fase Avançada: 🚀 Escala**
- Error tracking externo (Sentry)
- Performance monitoring avançado
- Business intelligence dashboard
- Automated incident response

---

## 🔍 **TROUBLESHOOTING AVANÇADO**

### **Problema: Analytics não funciona**
```javascript
// Verificar carregamento GA4
console.log('GA4 loaded:', !!window.gtag)

// Verificar configuração
analytics.getDebugInfo()

// Forçar reload de GA4
location.reload()
```

### **Problema: Health checks sempre falham**
```javascript
// Verificar conectividade
navigator.onLine

// Testar APIs manualmente
fetch('https://generativelanguage.googleapis.com/v1beta/models')
```

### **Problema: Performance degradada**
```javascript
// Verificar memory usage
console.log(performance.memory)

// Limpar logs antigos
healthCheck.clearAlerts()
localStorage.clear()
```

### **Problema: Dashboard não abre**
```javascript
// Verificar erros no console
// Tentar atalho: Ctrl+Shift+D
// Verificar se componente foi carregado
```

---

## 📊 **COMANDOS ESSENCIAIS PARA PRODUÇÃO**

### **Status Rápido**
```javascript
// Saúde geral em uma linha
healthCheck.getLastResults()?.overall

// Conversão atual
analytics.getConversionRate()

// Uptime do sistema
healthCheck.getLastResults()?.uptime
```

### **Export de Dados**
```javascript
// Todos os dados de monitoramento
const data = {
  health: await healthCheck.getHealth(),
  analytics: analytics.exportAnalyticsData(),
  alerts: healthCheck.getAlerts()
}
console.log(JSON.stringify(data, null, 2))
```

### **Reset Completo (Emergência)**
```javascript
// Limpar tudo e reiniciar
localStorage.clear()
sessionStorage.clear()
location.reload()
```

---

## 📞 **SUPORTE E MANUTENÇÃO**

### **Níveis de Problemas**

#### **🟢 Nível 1: Auto-resolução**
- Status degraded por <15 minutos
- Alertas não críticos
- Performance temporariamente lenta

#### **🟡 Nível 2: Investigação**
- Status down por >15 minutos
- Gemini API falhando consistentemente
- Taxa de conversão <20%

#### **🔴 Nível 3: Ação Imediata**
- Sistema inacessível
- Perda de dados de usuários
- API keys comprometidas

### **Checklist de Manutenção Semanal**
```
□ Verificar GA4 está coletando dados
□ Revisar alertas da semana
□ Exportar dados de analytics
□ Verificar taxa de conversão
□ Limpar alerts antigos
□ Testar atalhos e funcionalidades
```

---

## 💰 **CUSTOS E LIMITES**

### **Tier Gratuito Atual**
```
✅ Google Analytics 4: GRATUITO
✅ Health Checks: GRATUITO  
✅ Browser Notifications: GRATUITO
✅ Local Storage: GRATUITO
✅ Console Logging: GRATUITO

Total Operacional: R$ 0,00/mês
```

### **Limites a Monitorar**
```
📊 GA4: 10M eventos/mês (muito difícil atingir)
💾 localStorage: 5-10MB (limpa automaticamente)
🔔 Browser notifications: Depende do usuário aceitar
```

---

## 🎉 **CONCLUSÃO**

**Sistema implementado com sucesso!** 

✅ **Você agora tem:**
- Monitoramento empresarial completo
- Alertas automáticos para problemas críticos  
- Analytics de negócio essencial
- Dashboard operacional profissional
- Custo zero operacional
- Base sólida para escalar

✅ **Próximos passos:**
1. Configure o GA4 (MEASUREMENT_ID)
2. Teste o atalho Ctrl+Shift+D
3. Monitore por 1 semana
4. Use os dados para otimizar o produto

**O sistema está pronto para usuários reais! 🚀**

---

**Documentação criada:** Janeiro 2025  
**Última atualização:** Janeiro 2025  
**Versão:** 1.0.0  
**Autor:** Sistema de Monitoramento Roteirizar IA 