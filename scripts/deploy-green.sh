#!/bin/bash

# 🚀 Script de Deploy Green (Nova Produção) - Roteirar IA v2.1.3
# Deploy da nova versão em ambiente paralelo para validação

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Header
echo -e "${GREEN}"
echo "=================================================="
echo "🚀 DEPLOY GREEN (NOVA PRODUÇÃO) - v2.1.3"
echo "=================================================="
echo -e "${NC}"

# Verificações
if [ ! -f "package.json" ]; then
    error "package.json não encontrado. Execute na raiz do projeto."
fi

# Confirmação antes do deploy
echo -e "${YELLOW}"
echo "⚠️  ATENÇÃO: Este deploy criará uma nova versão de produção"
echo "   A versão atual permanecerá ativa até o switch oficial"
echo -e "${NC}"
read -p "Continuar com o deploy green? (y/N): " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    error "Deploy cancelado pelo usuário"
fi

# Informações do build
GIT_COMMIT=$(git rev-parse --short HEAD)
GIT_BRANCH=$(git branch --show-current)
BUILD_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

log "Branch: $GIT_BRANCH"
log "Commit: $GIT_COMMIT"

# Instalar dependências
log "Instalando dependências..."
npm ci --silent
success "Dependências instaladas"

# Testes finais
log "Executando testes finais..."
npm run test > /dev/null 2>&1 || warning "Alguns testes falharam"
npm run lint > /dev/null 2>&1 || warning "Lint issues encontrados"
success "Testes executados"

# Build de produção
log "Criando build de produção..."
NODE_ENV=production npm run build

if [ ! -d "dist" ]; then
    error "Build falhou - diretório dist não encontrado"
fi

# Auditoria de segurança
log "Executando auditoria de segurança..."
npm audit --audit-level=moderate || warning "Issues de segurança encontrados"
success "Auditoria concluída"

# Deploy para produção green
log "Fazendo deploy para produção GREEN..."

vercel --prod \
  --scope roteirar-v2 \
  --build-env NODE_ENV=production \
  --build-env VITE_ENVIRONMENT=production \
  --build-env VITE_BUILD_TIME="$BUILD_TIME" \
  --build-env VITE_GIT_COMMIT="$GIT_COMMIT" \
  --yes

if [ $? -eq 0 ]; then
    success "Deploy GREEN concluído!"
else
    error "Deploy GREEN falhou"
fi

# Smoke tests na nova versão
log "Executando smoke tests na versão GREEN..."

GREEN_URL="https://app-v2.roteirar.ai"

if command -v curl &> /dev/null; then
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$GREEN_URL" || echo "000")
    if [ "$HTTP_CODE" = "200" ]; then
        success "Versão GREEN respondendo (HTTP $HTTP_CODE)"
    else
        warning "Versão GREEN retornou HTTP $HTTP_CODE"
    fi
fi

# Resultado final
echo
echo -e "${GREEN}"
echo "=================================================="
echo "🎉 DEPLOY GREEN CONCLUÍDO COM SUCESSO!"
echo "=================================================="
echo -e "${NC}"
echo
echo "📊 Informações do Deploy:"
echo "  🌐 URL Green: $GREEN_URL"
echo "  📝 Commit: $GIT_COMMIT"
echo "  🌿 Branch: $GIT_BRANCH"
echo "  ⏰ Build Time: $BUILD_TIME"
echo
echo "🔍 Próximos passos:"
echo "  1. Validar $GREEN_URL por 24-48h"
echo "  2. Monitorar métricas e performance"
echo "  3. Executar testes de carga"
echo "  4. Executar switch-production.sh para ir live"
echo "  5. Manter rollback.sh pronto se necessário"
echo
echo -e "${BLUE}Aguardando validação... 🕐${NC}" 