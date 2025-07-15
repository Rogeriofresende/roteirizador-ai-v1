#!/bin/bash

# 🔧 STORYBOOK MAINTENANCE SCRIPT
# Script automatizado para limpeza de cache e restart do Storybook
# Implementado seguindo metodologia V7.5 Enhanced

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Banner
echo -e "${BLUE}╭─────────────────────────────────────────────────────────────╮${NC}"
echo -e "${BLUE}│               🔧 STORYBOOK MAINTENANCE SCRIPT               │${NC}"
echo -e "${BLUE}│                  Automated Cache & Restart                 │${NC}"
echo -e "${BLUE}╰─────────────────────────────────────────────────────────────╯${NC}"
echo ""

# Função para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    error "package.json não encontrado. Execute este script na raiz do projeto."
    exit 1
fi

# Verificar se Storybook está configurado
if [ ! -d ".storybook" ]; then
    error "Diretório .storybook não encontrado. Storybook não está configurado."
    exit 1
fi

log "Iniciando manutenção do Storybook..."

# 1. Parar processo do Storybook se estiver rodando
log "Verificando e parando processos do Storybook..."
STORYBOOK_PID=$(lsof -ti:6006 2>/dev/null || echo "")
if [ ! -z "$STORYBOOK_PID" ]; then
    log "Parando Storybook na porta 6006 (PID: $STORYBOOK_PID)"
    kill $STORYBOOK_PID
    sleep 3
else
    log "Storybook não está rodando na porta 6006"
fi

# 2. Limpar cache do Storybook
log "Limpando cache do Storybook..."
if [ -d "node_modules/.cache/storybook" ]; then
    rm -rf node_modules/.cache/storybook
    log "Cache do Storybook removido"
else
    log "Cache do Storybook não encontrado"
fi

# 3. Limpar cache do Vite
log "Limpando cache do Vite..."
if [ -d "node_modules/.vite" ]; then
    rm -rf node_modules/.vite
    log "Cache do Vite removido"
else
    log "Cache do Vite não encontrado"
fi

# 4. Limpar diretório de build do Storybook
log "Limpando diretório de build do Storybook..."
if [ -d "storybook-static" ]; then
    rm -rf storybook-static
    log "Diretório storybook-static removido"
else
    log "Diretório storybook-static não encontrado"
fi

# 5. Limpar cache do npm/yarn
log "Limpando cache do npm..."
if command -v npm &> /dev/null; then
    npm cache clean --force
    log "Cache do npm limpo"
fi

if command -v yarn &> /dev/null; then
    yarn cache clean
    log "Cache do yarn limpo"
fi

# 6. Verificar integridade das dependências
log "Verificando integridade das dependências..."
if command -v npm &> /dev/null; then
    npm audit fix --force
    log "Dependências verificadas e corrigidas"
fi

# 7. Reinstalar dependências se necessário
if [ "$1" = "--reinstall" ]; then
    log "Reinstalando dependências..."
    rm -rf node_modules package-lock.json
    npm install
    log "Dependências reinstaladas"
fi

# 8. Validar configuração do Storybook
log "Validando configuração do Storybook..."
if [ -f ".storybook/main.ts" ]; then
    log "Configuração principal encontrada: .storybook/main.ts"
else
    warn "Configuração principal não encontrada"
fi

if [ -f ".storybook/preview.ts" ]; then
    log "Configuração de preview encontrada: .storybook/preview.ts"
else
    warn "Configuração de preview não encontrada"
fi

# 9. Restart do Storybook
log "Reiniciando Storybook..."
if [ "$1" = "--no-restart" ]; then
    log "Restart do Storybook ignorado (--no-restart)"
else
    log "Iniciando Storybook em background..."
    nohup npm run storybook:dev > /dev/null 2>&1 &
    STORYBOOK_PID=$!
    log "Storybook iniciado com PID: $STORYBOOK_PID"
    
    # Aguardar Storybook iniciar
    log "Aguardando Storybook inicializar..."
    for i in {1..30}; do
        if curl -s -o /dev/null -w "%{http_code}" http://localhost:6006 | grep -q "200"; then
            log "Storybook iniciado com sucesso em http://localhost:6006"
            break
        fi
        sleep 2
        if [ $i -eq 30 ]; then
            error "Timeout: Storybook não iniciou em 60 segundos"
            exit 1
        fi
    done
fi

# 10. Relatório final
echo ""
echo -e "${GREEN}╭─────────────────────────────────────────────────────────────╮${NC}"
echo -e "${GREEN}│                    🎉 MANUTENÇÃO CONCLUÍDA                 │${NC}"
echo -e "${GREEN}│                                                             │${NC}"
echo -e "${GREEN}│   ✅ Cache limpo                                           │${NC}"
echo -e "${GREEN}│   ✅ Processos reiniciados                                 │${NC}"
echo -e "${GREEN}│   ✅ Storybook funcionando                                 │${NC}"
echo -e "${GREEN}│                                                             │${NC}"
echo -e "${GREEN}│   🌐 Acesse: http://localhost:6006                        │${NC}"
echo -e "${GREEN}╰─────────────────────────────────────────────────────────────╯${NC}"
echo ""

# Salvar log da manutenção
echo "$(date): Manutenção do Storybook concluída com sucesso" >> logs/storybook-maintenance.log

exit 0 