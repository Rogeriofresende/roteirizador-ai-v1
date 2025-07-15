# 🔧 Storybook Troubleshooting Guide

**Guia Completo de Troubleshooting do Storybook**  
*Implementado seguindo metodologia V7.5 Enhanced*

## 🚨 Problemas Mais Comuns

### 1. **Erro 404 nos Addons** 
```bash
GET http://localhost:6006/sb-addons/.../manager-bundle.js 404 (Not Found)
```

**🔍 Causas:**
- Cache corrompido do Storybook
- Configuração incorreta dos addons
- Problema na compilação dos addons

**💊 Soluções:**
```bash
# Limpeza completa de cache
npm run storybook:clean
# ou
./scripts/storybook-maintenance.sh

# Verificar configuração
cat .storybook/main.ts
```

**✅ Prevenção:**
- Use sempre addons essenciais
- Mantenha configuração simples
- Execute limpeza regular de cache

---

### 2. **Erro de Parsing TypeScript/JSX**
```bash
Could not parse import/exports with acorn
```

**🔍 Causas:**
- Configuração TypeScript incorreta
- Problemas com JSX transform
- Dependências desatualizadas

**💊 Soluções:**
```bash
# Verificar tsconfig do Storybook
cat .storybook/tsconfig.json

# Regenerar configuração
npx storybook@latest upgrade
```

**✅ Configuração Correta:**
```json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "allowJs": true,
    "esModuleInterop": true
  }
}
```

---

### 3. **Storybook Não Inicia**
```bash
Port 6006 is not available
```

**🔍 Causas:**
- Porta 6006 ocupada
- Processo anterior não finalizou
- Configuração de rede

**💊 Soluções:**
```bash
# Verificar processo na porta
lsof -ti:6006

# Parar processo
kill $(lsof -ti:6006)

# Usar porta alternativa
npm run storybook:dev -- --port 6007
```

---

### 4. **Problema com Stories**
```bash
No stories found
```

**🔍 Causas:**
- Padrão de stories incorreto
- Arquivos .stories não encontrados
- Configuração main.ts incorreta

**💊 Soluções:**
```bash
# Verificar padrão de stories
grep -r "stories" .storybook/main.ts

# Verificar se stories existem
find src -name "*.stories.*"
```

**✅ Configuração Correta:**
```typescript
stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)']
```

---

## 🛠️ Ferramentas de Diagnóstico

### Health Check Automatizado
```bash
node scripts/storybook-health-check.js
```

### Manutenção Automatizada
```bash
./scripts/storybook-maintenance.sh
```

### Verificação Manual
```bash
# Verificar configuração
cat .storybook/main.ts
cat .storybook/preview.ts

# Verificar dependências
npm ls @storybook/react-vite
npm ls @storybook/addon-essentials

# Verificar processo
ps aux | grep storybook
lsof -ti:6006
```

---

## 📊 Logs e Monitoramento

### Localizações dos Logs
```bash
logs/storybook-health.log        # Health checks
logs/storybook-maintenance.log   # Manutenção
logs/storybook-health-*.json     # Relatórios detalhados
```

### Monitoramento em Tempo Real
```bash
# Acompanhar logs
tail -f logs/storybook-health.log

# Health check contínuo
watch -n 30 'node scripts/storybook-health-check.js'
```

---

## 🚀 Procedimentos de Emergência

### 1. **Reset Completo**
```bash
# Parar todos os processos
pkill -f storybook

# Limpeza total
rm -rf node_modules/.cache
rm -rf storybook-static
rm -rf node_modules/.vite

# Reinstalar
npm install
npm run storybook:dev
```

### 2. **Backup e Restauração**
```bash
# Backup configuração
cp -r .storybook .storybook.backup

# Restaurar configuração
cp -r .storybook.backup .storybook
```

### 3. **Rollback de Versão**
```bash
# Verificar versão atual
npm ls @storybook/react-vite

# Instalar versão específica
npm install @storybook/react-vite@8.6.14
```

---

## 🔍 Diagnóstico Avançado

### Verificar Dependências
```bash
# Conflitos de dependências
npm ls --depth=0 | grep storybook

# Verificar vulnerabilidades
npm audit --audit-level=moderate
```

### Análise de Performance
```bash
# Tempo de build
time npm run build-storybook

# Análise de bundle
npm run build-storybook -- --stats-json
```

### Debug Mode
```bash
# Storybook com debug
DEBUG=storybook:* npm run storybook:dev

# Logs detalhados
npm run storybook:dev -- --debug-webpack
```

---

## 📋 Checklist de Troubleshooting

### ✅ **Verificações Básicas**
- [ ] Processo do Storybook rodando
- [ ] Porta 6006 disponível
- [ ] Configuração .storybook/ presente
- [ ] Stories encontradas
- [ ] Dependências instaladas

### ✅ **Verificações Avançadas**
- [ ] Cache limpo
- [ ] Configuração TypeScript correta
- [ ] Addons funcionando
- [ ] Build bem-sucedido
- [ ] Performance adequada

### ✅ **Verificações de Produção**
- [ ] Health checks passando
- [ ] Monitoring ativo
- [ ] Logs disponíveis
- [ ] Alertas configurados
- [ ] Backup disponível

---

## 🆘 Suporte e Escalação

### Problemas Simples
1. Execute `./scripts/storybook-maintenance.sh`
2. Verifique logs em `logs/storybook-health.log`
3. Consulte este guia

### Problemas Complexos
1. Execute `node scripts/storybook-health-check.js`
2. Colete logs detalhados
3. Documente passos para reproduzir
4. Escale para equipe de desenvolvimento

### Problemas Críticos
1. Execute reset completo
2. Ative monitoring de emergência
3. Notifique stakeholders
4. Documente incident report

---

## 📚 Recursos Adicionais

### Documentação Oficial
- [Storybook Docs](https://storybook.js.org/docs)
- [React Vite Setup](https://storybook.js.org/docs/react/get-started/install)

### Comunidade
- [GitHub Issues](https://github.com/storybookjs/storybook/issues)
- [Discord](https://discord.gg/storybook)

### Ferramentas
- [Storybook CLI](https://storybook.js.org/docs/react/api/cli-options)
- [Addon Registry](https://storybook.js.org/addons)

---

## 🔄 Histórico de Versões

| Versão | Data | Mudanças |
|--------|------|----------|
| 1.0.0  | 2025-01-15 | Guia inicial criado |
| 1.1.0  | 2025-01-15 | Adicionado health checks |
| 1.2.0  | 2025-01-15 | Adicionado scripts de automação |

---

*Última atualização: 2025-01-15*  
*Mantido por: Equipe de Desenvolvimento* 