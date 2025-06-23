# 🔧 TROUBLESHOOTING & FAQ - ROTEIRIZADOR IA

## 🚨 **PROBLEMAS COMUNS E SOLUÇÕES**

### **1. Aviso de Segurança no Console do Navegador**

**Problema:** Ao executar `window.monitoring.getStatus()` aparece um aviso sobre não colar código.

**Solução:** ✅ **NORMAL** - Este é um aviso padrão de segurança do navegador
- O aviso **NÃO impede** o funcionamento
- É uma medida de proteção contra código malicioso
- Você pode continuar usando os comandos normalmente
- Para evitar o aviso: digite `allow pasting` e pressione Enter

**Comando para remover aviso:**
```javascript
// Digite exatamente isso no console:
allow pasting
```

---

### **2. Sistema de Monitoramento Não Inicia**

**Sintomas:**
- `window.monitoring` retorna `undefined`
- Console não mostra "📊 Sistema de Monitoramento iniciado"

**Diagnóstico:**
```javascript
// Verificar se as dependências carregaram
console.log('React:', typeof React);
console.log('ReactDOM:', typeof ReactDOM);
console.log('Monitoring:', typeof window.monitoring);
```

**Soluções:**
1. **Recarregar a página** (F5)
2. **Limpar cache** (Ctrl+Shift+R ou Cmd+Shift+R)
3. **Verificar conexão com internet** (dependências CDN)
4. **Aguardar carregamento completo** (até 5 segundos)

---

### **3. Servidor HTTP Não Inicia**

**Sintomas:**
- `http://localhost:8080` não carrega
- Erro "Connection refused"

**Soluções:**
```bash
# 1. Verificar se porta está em uso
lsof -i :8080

# 2. Matar processos na porta
pkill -f "python.*8080"

# 3. Tentar porta diferente
cd roteirizador-app && python3 -m http.server 8081

# 4. Verificar se Python está instalado
python3 --version
```

---

### **4. Logs Não Estão Sendo Salvos**

**Sintomas:**
- `window.monitoring.logs` está vazio
- localStorage não funciona

**Diagnóstico:**
```javascript
// Testar localStorage
try {
    localStorage.setItem('test', 'value');
    console.log('localStorage OK');
} catch(e) {
    console.error('localStorage falhou:', e);
}
```

**Soluções:**
1. **Verificar modo privado**: Sair do modo incógnito
2. **Limpar dados do site**: Configurações > Privacidade
3. **Verificar quota**: `navigator.storage.estimate()`
4. **Reconfigurar sistema**: Recarregar página

---

### **5. Performance Degradada**

**Sintomas:**
- App muito lento
- Tempos de resposta > 5 segundos

**Diagnóstico:**
```javascript
// Verificar performance
window.monitoring.metrics
// Verificar logs de performance
window.monitoring.logs.filter(log => log.action.includes('performance'))
```

**Soluções:**
1. **Limpar logs antigos**:
   ```javascript
   // Limpar logs manualmente se necessário
   window.monitoring.logs = window.monitoring.logs.slice(-100);
   window.monitoring.saveLogsToStorage();
   ```

2. **Reiniciar sistema de monitoramento**:
   ```javascript
   // Em último caso, recarregar página
   location.reload();
   ```

---

### **6. Geração de Roteiro Falha**

**Sintomas:**
- Botão "Gerar Roteiro" não responde
- Erro durante geração

**Diagnóstico:**
```javascript
// Verificar health status
window.monitoring.healthStatus.scriptGeneration
// Verificar últimos erros
window.monitoring.logs.filter(log => log.level === 'error').slice(-5)
```

**Soluções:**
1. **Verificar formulário**: Assunto preenchido
2. **Aguardar carregamento**: React pode ainda estar carregando
3. **Recarregar aplicação**: Voltar e carregar novamente
4. **Verificar JavaScript**: Console do navegador por erros

---

## 📊 **COMANDOS DE DIAGNÓSTICO**

### **Health Check Completo**
```javascript
// Verificação completa do sistema
console.log('=== DIAGNÓSTICO COMPLETO ===');
console.log('Monitoring:', !!window.monitoring);
console.log('Health Score:', window.monitoring?.getHealthScore?.());
console.log('Status:', window.monitoring?.getStatus?.());
console.log('Uptime:', Math.round((Date.now() - window.monitoring?.startTime) / 60000) + ' min');
console.log('Logs Count:', window.monitoring?.logs?.length);
console.log('Error Count:', window.monitoring?.metrics?.errorCount);
```

### **Performance Check**
```javascript
// Verificar performance atual
const perfData = {
    loadTime: window.monitoring?.metrics?.loadTime,
    avgResponse: window.monitoring?.metrics?.averageResponseTime,
    errorRate: (window.monitoring?.metrics?.errorCount || 0) / (window.monitoring?.metrics?.functionsExecuted || 1) * 100
};
console.log('Performance:', perfData);
```

### **Logs de Erro**
```javascript
// Ver todos os erros recentes
window.monitoring?.logs
    ?.filter(log => log.level === 'error')
    ?.slice(-10)
    ?.forEach(log => console.log(log.timestamp, log.action, log.data));
```

---

## 🆘 **PROCEDIMENTOS DE EMERGÊNCIA**

### **Sistema Completamente Não Funcional**

**Procedimento:**
1. **Backup dos dados**:
   ```javascript
   // Exportar dados antes de reset
   if (window.monitoring) {
       window.monitoring.exportLogs();
   }
   ```

2. **Reset completo**:
   ```bash
   # Limpar tudo e reiniciar
   cd roteirizador-app
   pkill -f "python.*8080"
   rm -rf __pycache__
   python3 -m http.server 8080
   ```

3. **Reset do navegador**:
   - Limpar cache e dados do site
   - Fechar e reabrir navegador
   - Acessar novamente `http://localhost:8080`

### **Dados Corrompidos**

```javascript
// Limpar dados corrompidos do localStorage
localStorage.removeItem('roteirizador_monitoring');
location.reload();
```

---

## ❓ **FAQ - PERGUNTAS FREQUENTES**

### **Q: O monitoramento afeta a performance da aplicação?**
**A:** Não significativamente. O sistema adiciona <100ms ao carregamento e <1% de overhead durante uso. Foi otimizado para ser invisível ao usuário.

### **Q: Os dados ficam salvos entre sessões?**
**A:** Sim, os logs ficam salvos no localStorage do navegador. Cada sessão gera um ID único, mas o histórico é mantido.

### **Q: Posso desabilitar o monitoramento?**
**A:** Sim, você pode:
```javascript
// Desabilitar temporariamente
window.monitoring.isEnabled = false;

// Reabilitar
window.monitoring.isEnabled = true;
```

### **Q: Como exportar dados para análise externa?**
**A:** Use o comando de exportação:
```javascript
// Exporta arquivo JSON com todos os dados
window.monitoring.exportLogs();
```

### **Q: O sistema funciona offline?**
**A:** Parcialmente. A aplicação standalone funciona, mas as dependências React do CDN precisam ter sido carregadas pelo menos uma vez.

### **Q: Como adicionar novos testes automáticos?**
**A:** Edite o arquivo `index.html` e adicione novos métodos na classe `MonitoringSystem`. Exemplo:
```javascript
async testNewFeature() {
    try {
        // Seu teste aqui
        return { passed: true, message: 'Test passed' };
    } catch (error) {
        return { passed: false, message: error.message };
    }
}
```

### **Q: Posso integrar com outras ferramentas?**
**A:** Sim, o sistema foi projetado para ser extensível. Você pode:
- Exportar dados para Sentry
- Enviar métricas para Google Analytics  
- Criar webhooks para Slack/Discord
- Integrar com qualquer API externa

---

## 🔍 **MÉTRICAS DE DIAGNÓSTICO**

### **Valores Normais Esperados:**
- **Health Score**: 70-100%
- **Load Time**: <5000ms
- **Error Count**: 0-2 por sessão
- **Average Response Time**: <100ms
- **Test Success Rate**: >80%

### **Valores que Indicam Problemas:**
- **Health Score**: <50%
- **Load Time**: >10000ms
- **Error Count**: >5 por sessão
- **Average Response Time**: >500ms
- **Test Success Rate**: <60%

---

## 📞 **SUPORTE E ESCALAÇÃO**

### **Níveis de Suporte:**

**Nível 1: Auto-diagnóstico**
- Usar comandos de diagnóstico deste documento
- Tentar soluções básicas (reload, limpar cache)
- Verificar documentação

**Nível 2: Análise de logs**
- Exportar e analisar logs detalhados
- Identificar padrões de erro
- Implementar correções pontuais

**Nível 3: Desenvolvimento**
- Modificações no código do monitoramento
- Implementação de novas funcionalidades
- Integração com ferramentas externas

---

## 📚 **RECURSOS ADICIONAIS**

### **Documentação Relacionada:**
- `PLANO_MONITORAMENTO.md` - Visão geral do sistema
- `TESTE_MONITORAMENTO.md` - Como testar funcionalidades
- `PROXIMOS_PASSOS.md` - Roadmap e próximas implementações

### **Comandos Úteis:**
```javascript
// Verificação rápida diária
window.monitoring.getStatus()

// Relatório completo
window.monitoring.generateReport()

// Limpar logs antigos
window.monitoring.logs = window.monitoring.logs.slice(-500)

// Reset completo
localStorage.removeItem('roteirizador_monitoring'); location.reload()
```

---

**Documento atualizado em:** [Data Atual]  
**Versão:** 1.0  
**Próxima revisão:** Mensal ou conforme necessário 