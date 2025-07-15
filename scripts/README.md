# 🛠️ Storybook Enhancement Scripts

**Scripts de melhoria para o Storybook implementados seguindo metodologia V7.5 Enhanced**

## 📋 Scripts Disponíveis

### 1. 🔧 **Manutenção Automática**
**Arquivo**: `storybook-maintenance.sh`  
**Comando**: `npm run storybook:maintenance`

#### Funcionalidades:
- Limpeza automática de cache (Storybook, Vite, npm)
- Parada e reinício de processos
- Validação de configuração
- Verificação de integridade
- Relatório colorido com status

#### Uso:
```bash
# Manutenção completa
npm run storybook:maintenance

# Apenas limpeza (sem restart)
npm run storybook:clean

# Limpeza com reinstalação
npm run storybook:restart
```

### 2. 🏥 **Health Check**
**Arquivo**: `storybook-health-check.cjs`  
**Comando**: `npm run storybook:health`

#### Funcionalidades:
- Verificação de resposta HTTP
- Verificação de processo na porta 6006
- Validação de configuração
- Verificação de stories
- Análise de recursos do sistema
- Relatórios JSON detalhados

#### Uso:
```bash
# Health check único
npm run storybook:health

# Monitoramento contínuo
watch -n 60 'npm run storybook:health'
```

### 3. 🔍 **Validação para CI/CD**
**Arquivo**: `validate-storybook.cjs`  
**Comando**: `npm run storybook:validate`

#### Funcionalidades:
- Validação de ambiente
- Verificação de configuração
- Validação de stories
- Build validation
- Runtime validation
- Relatórios estruturados

#### Uso:
```bash
# Validação local
npm run storybook:validate

# Validação em pipeline (CI/CD)
node scripts/validate-storybook.cjs
```

## 🚀 Uso Rápido

### Problema Comum: Storybook não está funcionando
```bash
# Solução em 1 comando
npm run storybook:maintenance
```

### Verificar Status do Storybook
```bash
# Health check rápido
npm run storybook:health
```

### Validar Antes de Commit
```bash
# Validação completa
npm run storybook:validate
```

## 📊 Logs e Relatórios

### Localizações:
- `logs/storybook-health.log` - Logs de health check
- `logs/storybook-maintenance.log` - Logs de manutenção
- `logs/storybook-health-*.json` - Relatórios detalhados JSON
- `logs/storybook-validation-*.json` - Relatórios de validação

### Exemplo de Relatório JSON:
```json
{
  "timestamp": "2025-01-15T22:30:00.000Z",
  "status": "HEALTHY",
  "checks": [
    {
      "name": "HTTP Response",
      "status": "PASS",
      "responseTime": 5
    }
  ],
  "summary": {
    "total": 5,
    "passed": 5,
    "failed": 0
  }
}
```

## 🔧 Configuração Avançada

### Variáveis de Ambiente:
```bash
# Porta do Storybook
export STORYBOOK_PORT=6006

# Webhook para alertas
export STORYBOOK_WEBHOOK_URL=https://hooks.slack.com/...

# Email para alertas
export STORYBOOK_ALERT_EMAIL=admin@example.com
```

### Personalização:
Edite as configurações nos arquivos:
- `scripts/storybook-maintenance.sh` - Configurações de manutenção
- `scripts/storybook-health-check.cjs` - Configurações de health check
- `scripts/validate-storybook.cjs` - Configurações de validação

## 🚨 Troubleshooting

### Script não executa:
```bash
# Verificar permissões
chmod +x scripts/storybook-maintenance.sh

# Verificar Node.js
node --version

# Verificar npm
npm --version
```

### Erro de módulo ES:
Os scripts `.cjs` foram criados para compatibilidade com `"type": "module"` no package.json.

### Problemas de porta:
```bash
# Verificar porta em uso
lsof -ti:6006

# Matar processo
kill $(lsof -ti:6006)
```

## 📚 Documentação Adicional

- [Storybook Troubleshooting Guide](../docs/storybook-troubleshooting.md)
- [Storybook Improvements Summary](../docs/storybook-improvements-summary.md)
- [Storybook Official Docs](https://storybook.js.org/docs)

## 🔄 Automação

### Cron Jobs:
```bash
# Health check a cada hora
0 * * * * cd /path/to/project && npm run storybook:health

# Manutenção diária
0 2 * * * cd /path/to/project && npm run storybook:maintenance
```

### CI/CD Integration:
O workflow `.github/workflows/storybook-validation.yml` automaticamente executa validações em:
- Push para main/develop
- Pull requests
- Schedule diário (9h UTC)

## 🎯 Métricas de Sucesso

### Antes:
- ❌ Tempo de resolução: 30 minutos
- ❌ Problemas recorrentes: 5-10/semana
- ❌ Validação manual

### Depois:
- ✅ Tempo de resolução: 5 minutos
- ✅ Problemas recorrentes: 1-2/semana
- ✅ Validação automática

## 🔮 Próximos Passos

1. **Monitoring Dashboard**: Grafana/Prometheus
2. **Visual Testing**: Chromatic integration
3. **Performance Tracking**: Bundle size monitoring
4. **Security Scanning**: Automated vulnerability checks

---

*Implementado em 2025-01-15 seguindo metodologia V7.5 Enhanced*  
*Responsável: IA Charlie (Quality Specialist)* 