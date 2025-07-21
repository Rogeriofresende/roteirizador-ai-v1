#!/bin/bash

# 🔔 SONORA V1 MVP - Desktop Notification System
# Metodologia V8.1 Enhanced - Decision Request Notification
# Usage: ./notify-decision.sh "message" "urgency" "feature"

MESSAGE="$1"
URGENCY="$2"  # low/medium/high
FEATURE="$3"
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")

# Validate parameters
if [ -z "$MESSAGE" ]; then
    echo "❌ Error: Message is required"
    echo "Usage: ./notify-decision.sh \"message\" \"urgency\" \"feature\""
    exit 1
fi

if [ -z "$URGENCY" ]; then
    URGENCY="medium"
fi

if [ -z "$FEATURE" ]; then
    FEATURE="General"
fi

# Set notification sound based on urgency
case $URGENCY in
    "low") 
        SOUND="Blow"
        SLA="24h"
        TITLE="SONORA - Decisão (não urgente)"
        ;;
    "medium") 
        SOUND="Glass"
        SLA="4h"
        TITLE="SONORA - Decisão Importante"
        ;;
    "high") 
        SOUND="Sosumi"
        SLA="1h"
        TITLE="SONORA - DECISÃO CRÍTICA"
        ;;
    *) 
        SOUND="Glass"
        SLA="4h"
        TITLE="SONORA - Decisão"
        URGENCY="medium"
        ;;
esac

# Create notification subtitle
SUBTITLE="Feature: $FEATURE | SLA: $SLA"

# Log notification attempt
echo "🔔 Enviando notificação..."
echo "   📧 Mensagem: $MESSAGE"
echo "   ⚡ Urgência: $URGENCY ($SLA SLA)"
echo "   📱 Feature: $FEATURE"
echo "   🕐 Timestamp: $TIMESTAMP"

# Send macOS desktop notification
osascript -e "display notification \"$MESSAGE\" with title \"$TITLE\" subtitle \"$SUBTITLE\" sound name \"$SOUND\""

# Check if notification was successful
if [ $? -eq 0 ]; then
    echo "✅ Notificação enviada com sucesso!"
    
    # Log to notification history
    echo "$TIMESTAMP|$URGENCY|$FEATURE|$MESSAGE" >> .notification-history.log
    
    # Create marker file for first-time setup
    if [ ! -f .cursor-notifications ]; then
        echo "🔔 Desktop notification system initialized - $(date)" > .cursor-notifications
        echo "📝 Sistema de notificação inicializado pela primeira vez"
    fi
    
else
    echo "❌ Erro ao enviar notificação"
    exit 1
fi

# Display next steps for user
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "   1. Clique na notificação quando aparecer"
echo "   2. Abra o arquivo DECISION_REQUEST_ROGERIO.md"
echo "   3. Preencha a seção 'RESPOSTA DO PRODUCT OWNER'"
echo "   4. Salve o arquivo para continuar desenvolvimento"
echo ""
echo "⏰ SLA: $SLA para resposta ($URGENCY urgency)" 