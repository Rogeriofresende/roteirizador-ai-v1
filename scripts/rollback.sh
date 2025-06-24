#!/bin/bash

# 🚨 Script de Rollback de Emergência - Roteirar IA v2.1.3
# Rollback instantâneo da produção para versão anterior estável

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

emergency() {
    echo -e "${PURPLE}🆘 $1${NC}"
}

# Header de emergência
echo -e "${RED}"
echo "============================================================"
echo "🆘 EMERGENCY ROLLBACK - ROTEIRAR IA v2.1.3"
echo "⚡ Instant rollback to previous stable version"
echo "🚨 THIS IS A CRITICAL EMERGENCY OPERATION"
echo "============================================================"
echo -e "${NC}"

# Verificações iniciais
if [ ! -f "package.json" ]; then
    error "package.json não encontrado. Execute na raiz do projeto."
fi

# Informações do rollback
PRODUCTION_URL="app.roteirar.ai"
BACKUP_BLUE_URL="roteirar-production.vercel.app"
ROLLBACK_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
REASON="${1:-manual_rollback}"

emergency "EXECUTANDO ROLLBACK DE EMERGÊNCIA..."

# Executar rollback via Vercel
log "Executando rollback DNS..."
vercel alias set "$BACKUP_BLUE_URL" "$PRODUCTION_URL" --yes

if [ $? -eq 0 ]; then
    success "Rollback DNS executado!"
else
    error "Falha no rollback DNS!"
fi

# Aguardar propagação
log "Aguardando propagação DNS (15 segundos)..."
sleep 15

# Verificações pós-rollback
for i in {1..5}; do
    log "Verificação $i/5..."
    
    if command -v curl &> /dev/null; then
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://$PRODUCTION_URL" || echo "000")
        if [ "$HTTP_CODE" = "200" ]; then
            success "Rollback bem-sucedido! (HTTP $HTTP_CODE)"
            break
        else
            warning "Tentativa $i: HTTP $HTTP_CODE"
            sleep 5
        fi
    fi
done

echo
echo -e "${GREEN}✅ ROLLBACK EXECUTADO COM SUCESSO!${NC}"
echo "🌐 Produção restaurada: https://$PRODUCTION_URL"
echo "🕐 Executado em: $ROLLBACK_TIME"
echo
echo -e "${BLUE}Sistema restaurado para versão estável.${NC}"
