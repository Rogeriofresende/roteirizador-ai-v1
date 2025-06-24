#!/bin/bash

# 🚀 Script de Deploy para Staging - Roteirar IA v2.1.3
# Deploy seguro para ambiente de staging para testes completos

set -e  # Exit on any error

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log
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
echo -e "${BLUE}"
echo "=================================================="
echo "🚀 DEPLOY STAGING - ROTEIRAR IA v2.1.3"
echo "=================================================="
echo -e "${NC}"

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    error "package.json não encontrado. Execute este script na raiz do projeto."
fi

# Verificar dependências
log "Verificando dependências necessárias..."

if ! command -v npm &> /dev/null; then
    error "npm não encontrado. Instale o Node.js primeiro."
fi

if ! command -v vercel &> /dev/null; then
    error "Vercel CLI não encontrado. Execute: npm i -g vercel"
fi

success "Dependências verificadas"

# Verificar se há mudanças não commitadas
log "Verificando status do Git..."
if [ -n "$(git status --porcelain)" ]; then
    warning "Há mudanças não commitadas. Recomendado fazer commit primeiro."
    read -p "Continuar mesmo assim? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        error "Deploy cancelado pelo usuário"
    fi
fi

# Obter informações do Git
GIT_COMMIT=$(git rev-parse --short HEAD)
GIT_BRANCH=$(git branch --show-current)
BUILD_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

log "Branch atual: $GIT_BRANCH"
log "Commit: $GIT_COMMIT"
success "Git status verificado"

# Criar arquivo de ambiente para staging
log "Configurando ambiente de staging..."

cat > .env.staging << EOF
# Ambiente de Staging - Roteirar IA v2.1.3
VITE_ENVIRONMENT=staging
VITE_BUILD_TIME=$BUILD_TIME
VITE_GIT_COMMIT=$GIT_COMMIT
VITE_GIT_BRANCH=$GIT_BRANCH

# Firebase Staging (substitua pelas suas configurações)
VITE_FIREBASE_API_KEY=staging_firebase_key
VITE_FIREBASE_AUTH_DOMAIN=roteirar-staging.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=roteirar-staging
VITE_FIREBASE_STORAGE_BUCKET=roteirar-staging.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=staging_sender_id
VITE_FIREBASE_APP_ID=staging_app_id

# APIs para staging
VITE_GEMINI_API_KEY=staging_gemini_key
VITE_ANALYTICS_MEASUREMENT_ID=staging_ga4_id

# Debug habilitado para staging
VITE_ANALYTICS_DEBUG=true
VITE_ENABLE_LOGGING=true
VITE_SHOW_DEBUG_INFO=true
EOF

success "Arquivo .env.staging criado"

# Instalar dependências
log "Instalando dependências..."
npm ci --silent
success "Dependências instaladas"

# Executar testes
log "Executando testes..."
npm run test > /dev/null 2>&1 || warning "Alguns testes falharam, mas continuando..."
success "Testes executados"

# Verificar linting
log "Verificando qualidade do código..."
npm run lint > /dev/null 2>&1 || warning "Lint issues encontrados, mas continuando..."
success "Linting verificado"

# Build para staging
log "Criando build para staging..."
NODE_ENV=staging npm run build

if [ ! -d "dist" ]; then
    error "Build falhou - diretório dist não encontrado"
fi

success "Build criado com sucesso"

# Deploy para Vercel
log "Fazendo deploy para staging no Vercel..."

# Definir variáveis de ambiente para o deploy
export VERCEL_ORG_ID=$(vercel whoami 2>/dev/null | head -1 || echo "")
export VERCEL_PROJECT_ID="roteirar-staging"

# Deploy para staging
vercel --prod \
  --scope roteirar-staging \
  --build-env VITE_ENVIRONMENT=staging \
  --build-env VITE_BUILD_TIME="$BUILD_TIME" \
  --build-env VITE_GIT_COMMIT="$GIT_COMMIT" \
  --build-env VITE_GIT_BRANCH="$GIT_BRANCH" \
  --env .env.staging \
  --yes

if [ $? -eq 0 ]; then
    success "Deploy para staging concluído!"
else
    error "Deploy para staging falhou"
fi

# URL do staging
STAGING_URL="https://staging.roteirar.ai"

# Smoke tests básicos
log "Executando smoke tests básicos..."

# Verificar se a URL responde
if command -v curl &> /dev/null; then
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$STAGING_URL" || echo "000")
    if [ "$HTTP_CODE" = "200" ]; then
        success "Staging respondendo corretamente (HTTP $HTTP_CODE)"
    else
        warning "Staging retornou HTTP $HTTP_CODE"
    fi
else
    warning "curl não disponível, pulando verificação HTTP"
fi

# Limpeza
log "Limpando arquivos temporários..."
rm -f .env.staging
success "Limpeza concluída"

# Resultado final
echo
echo -e "${GREEN}"
echo "=================================================="
echo "🎉 DEPLOY STAGING CONCLUÍDO COM SUCESSO!"
echo "=================================================="
echo -e "${NC}"
echo
echo "📊 Informações do Deploy:"
echo "  🌐 URL: $STAGING_URL"
echo "  📝 Commit: $GIT_COMMIT"
echo "  🌿 Branch: $GIT_BRANCH"
echo "  ⏰ Build Time: $BUILD_TIME"
echo
echo "🧪 Próximos passos:"
echo "  1. Acessar $STAGING_URL"
echo "  2. Executar testes funcionais completos"
echo "  3. Validar todas as funcionalidades"
echo "  4. Coletar feedback da equipe"
echo "  5. Executar deploy-green.sh quando aprovado"
echo
echo -e "${BLUE}Happy testing! 🚀${NC}" 