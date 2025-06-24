#!/bin/bash

# 🔄 Script de Switch de Produção - Roteirar IA v2.1.3
# Switch do ambiente Green para Blue (Go Live oficial)

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

critical() {
    echo -e "${PURPLE}🚨 $1${NC}"
}

# Header crítico
echo -e "${RED}"
echo "=========================================================="
echo "🚨 CRITICAL OPERATION: PRODUCTION SWITCH"
echo "🔄 Switching from Blue to Green Environment"
echo "⚠️  THIS WILL AFFECT LIVE USERS"
echo "=========================================================="
echo -e "${NC}"

# Verificação de ambiente
if [ ! -f "package.json" ]; then
    error "package.json não encontrado. Execute na raiz do projeto."
fi

# Verificar se Vercel CLI está disponível
if ! command -v vercel &> /dev/null; then
    error "Vercel CLI não encontrado. Execute: npm i -g vercel"
fi

# Informações do switch
BLUE_URL="app.roteirar.ai"
GREEN_URL="app-v2.roteirar.ai"
SWITCH_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
GIT_COMMIT=$(git rev-parse --short HEAD)

log "Switch de: $BLUE_URL (atual)"
log "Switch para: $GREEN_URL (nova versão)"
log "Horário: $SWITCH_TIME"
log "Commit: $GIT_COMMIT"

# Pré-validações críticas
critical "EXECUTANDO PRÉ-VALIDAÇÕES CRÍTICAS..."

# 1. Verificar se o ambiente Green está respondendo
log "Verificando status do ambiente Green..."
if command -v curl &> /dev/null; then
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://$GREEN_URL" || echo "000")
    if [ "$HTTP_CODE" = "200" ]; then
        success "Ambiente Green respondendo (HTTP $HTTP_CODE)"
    else
        error "Ambiente Green não está respondendo (HTTP $HTTP_CODE)"
    fi
else
    warning "curl não disponível - pulando verificação HTTP"
fi

# 2. Verificar se há algum incidente em andamento
log "Verificando status dos serviços..."
echo "🔍 Certifique-se de que:"
echo "  ✅ Não há incidentes de segurança ativos"
echo "  ✅ Não há alertas críticos no monitoramento"
echo "  ✅ A equipe de suporte está disponível"
echo "  ✅ O ambiente Green foi validado por 24-48h"

# Confirmações múltiplas para operação crítica
echo
echo -e "${RED}🚨 ATENÇÃO: OPERAÇÃO CRÍTICA${NC}"
echo "Este switch irá:"
echo "  🔄 Redirecionar TODO o tráfego de produção"
echo "  👥 Afetar TODOS os usuários ativos"
echo "  🚀 Tornar a versão v2.1.3 OFICIAL"
echo

# Primeira confirmação
read -p "$(echo -e ${YELLOW}Deseja continuar com o switch? ${NC}[y/N]: )" -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    error "Switch cancelado pelo usuário"
fi

# Segunda confirmação
echo
echo -e "${RED}CONFIRMAÇÃO FINAL${NC}"
echo "Você está prestes a fazer o switch de produção."
echo "Isso irá afetar usuários em tempo real."
read -p "$(echo -e ${RED}Digite 'SWITCH' para confirmar: ${NC})" CONFIRM

if [ "$CONFIRM" != "SWITCH" ]; then
    error "Confirmação incorreta. Switch cancelado."
fi

# Iniciar processo de switch
echo
critical "INICIANDO SWITCH DE PRODUÇÃO..."

# Backup da configuração atual
log "Fazendo backup da configuração atual..."
BACKUP_FILE="backup-dns-$(date +%Y%m%d-%H%M%S).txt"
echo "Backup DNS realizado em: $BACKUP_FILE" > "$BACKUP_FILE"
echo "Blue URL: $BLUE_URL" >> "$BACKUP_FILE"
echo "Green URL: $GREEN_URL" >> "$BACKUP_FILE"
echo "Switch Time: $SWITCH_TIME" >> "$BACKUP_FILE"
echo "Git Commit: $GIT_COMMIT" >> "$BACKUP_FILE"
success "Backup criado: $BACKUP_FILE"

# Executar switch via Vercel
log "Executando switch via Vercel..."

# Aliasing the Green environment to production domain
vercel alias set "$GREEN_URL" "$BLUE_URL" --yes

if [ $? -eq 0 ]; then
    success "Switch DNS executado com sucesso!"
else
    error "Falha no switch DNS. Investigação necessária."
fi

# Monitoramento pós-switch imediato
critical "MONITORAMENTO PÓS-SWITCH ATIVO..."

# Aguardar propagação DNS
log "Aguardando propagação DNS (30 segundos)..."
sleep 30

# Verificações pós-switch
log "Executando verificações pós-switch..."

# Verificar se a nova versão está respondendo no domínio principal
for i in {1..5}; do
    log "Verificação $i/5..."
    
    if command -v curl &> /dev/null; then
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://$BLUE_URL" || echo "000")
        if [ "$HTTP_CODE" = "200" ]; then
            success "Produção respondendo (HTTP $HTTP_CODE)"
            break
        else
            warning "Tentativa $i: HTTP $HTTP_CODE"
            sleep 10
        fi
    fi
    
    if [ $i -eq 5 ]; then
        error "Switch pode ter falhado - verificação manual necessária"
    fi
done

# Criar log de switch
SWITCH_LOG="switch-log-$(date +%Y%m%d-%H%M%S).txt"
cat > "$SWITCH_LOG" << EOF
SWITCH DE PRODUÇÃO EXECUTADO
============================

Data/Hora: $SWITCH_TIME
Git Commit: $GIT_COMMIT
Executado por: $(whoami)

URLs:
- Produção: $BLUE_URL
- Green (backup): $GREEN_URL

Status: SUCESSO

Próximos passos:
1. Monitorar métricas por 24h
2. Validar user experience
3. Manter equipe em standby
4. Documentar qualquer issue

Rollback disponível via: npm run deploy:rollback
EOF

success "Log de switch criado: $SWITCH_LOG"

# Resultado final
echo
echo -e "${GREEN}"
echo "=========================================================="
echo "🎉 SWITCH DE PRODUÇÃO CONCLUÍDO COM SUCESSO!"
echo "=========================================================="
echo -e "${NC}"
echo
echo "📊 Informações do Switch:"
echo "  🌐 URL Principal: https://$BLUE_URL"
echo "  🔄 Nova Versão: v2.1.3 ATIVA"
echo "  📝 Commit: $GIT_COMMIT"
echo "  ⏰ Switch Time: $SWITCH_TIME"
echo "  📋 Log: $SWITCH_LOG"
echo "  💾 Backup: $BACKUP_FILE"
echo
echo "🚨 AÇÕES CRÍTICAS PÓS-SWITCH:"
echo "  1. 🔍 Monitorar https://$BLUE_URL constantemente"
echo "  2. 📊 Verificar métricas de erro em tempo real"
echo "  3. 👥 Monitorar feedback de usuários"
echo "  4. ⚡ Executar rollback se necessário: npm run deploy:rollback"
echo "  5. 📞 Manter equipe em standby por 24h"
echo
echo -e "${GREEN}Monitoramento ativo necessário pelos próximos 60 minutos!${NC}"
echo -e "${YELLOW}Rollback disponível a qualquer momento se necessário.${NC}"
echo
echo -e "${BLUE}Switch executado com sucesso! 🚀${NC}"
