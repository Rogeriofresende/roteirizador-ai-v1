#!/bin/bash

# 🔔 SONORA V1 MVP - Desktop Dialog Notification System (V8.1 Enhanced)
# Metodologia V8.1 Enhanced - Decision Request Dialog System
# Usage: ./notify-decision-dialog.sh "message" "urgency" "feature"

MESSAGE="$1"
URGENCY="$2"  # low/medium/high
FEATURE="$3"
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")

# Validate parameters
if [ -z "$MESSAGE" ]; then
    echo "❌ Error: Message is required"
    echo "Usage: ./notify-decision-dialog.sh \"message\" \"urgency\" \"feature\""
    exit 1
fi

if [ -z "$URGENCY" ]; then
    URGENCY="medium"
fi

if [ -z "$FEATURE" ]; then
    FEATURE="General"
fi

# Set dialog properties based on urgency
case $URGENCY in
    "low") 
        SLA="24h"
        TITLE="SONORA - Decisão (não urgente)"
        ICON="note"
        ;;
    "medium") 
        SLA="4h"
        TITLE="SONORA - Decisão Importante"
        ICON="caution"
        ;;
    "high") 
        SLA="1h"
        TITLE="🚨 SONORA - DECISÃO CRÍTICA"
        ICON="stop"
        ;;
    *) 
        SLA="4h"
        TITLE="SONORA - Decisão"
        ICON="note"
        URGENCY="medium"
        ;;
esac

# Create dialog message
DIALOG_MESSAGE="🔔 DECISÃO NECESSÁRIA - SONORA MVP

📱 Feature: $FEATURE
⚡ Urgência: $URGENCY (SLA: $SLA)
📋 Problema: $MESSAGE

🎯 PRÓXIMOS PASSOS:
1. Clique OK para continuar
2. Abra o arquivo: DECISION_REQUEST_ROGERIO.md
3. Preencha seção 'RESPOSTA DO PRODUCT OWNER'
4. Salve arquivo → desenvolvimento continua

⏰ Deadline: $SLA para resposta"

# Log notification attempt
echo "🔔 Enviando dialog de decisão..."
echo "   📧 Mensagem: $MESSAGE"
echo "   ⚡ Urgência: $URGENCY ($SLA SLA)"
echo "   📱 Feature: $FEATURE"
echo "   🕐 Timestamp: $TIMESTAMP"

# Show dialog box (more reliable than notifications)
DIALOG_RESULT=$(osascript -e "display dialog \"$DIALOG_MESSAGE\" with title \"$TITLE\" with icon $ICON buttons {\"Cancelar\", \"Abrir Arquivo\", \"OK\"} default button \"Abrir Arquivo\"")

# Check dialog result
if [[ $DIALOG_RESULT == *"Abrir Arquivo"* ]]; then
    echo "✅ Dialog mostrado! Usuário escolheu 'Abrir Arquivo'"
    
    # Try to open file in Cursor/VS Code
    if command -v cursor &> /dev/null; then
        cursor DECISION_REQUEST_ROGERIO.md
        echo "📂 Arquivo aberto no Cursor"
    elif command -v code &> /dev/null; then
        code DECISION_REQUEST_ROGERIO.md
        echo "📂 Arquivo aberto no VS Code"
    else
        open DECISION_REQUEST_ROGERIO.md
        echo "📂 Arquivo aberto no aplicativo padrão"
    fi
    
elif [[ $DIALOG_RESULT == *"OK"* ]]; then
    echo "✅ Dialog mostrado! Usuário clicou OK"
    echo "📝 Lembre-se: abra DECISION_REQUEST_ROGERIO.md para responder"
    
elif [[ $DIALOG_RESULT == *"Cancelar"* ]]; then
    echo "⚠️  Usuário cancelou - desenvolvimento continuará sem decisão"
    echo "🔄 IA implementará opção mais conservadora"
    
else
    echo "❌ Erro inesperado no dialog"
    exit 1
fi

# Log to notification history
echo "$TIMESTAMP|$URGENCY|$FEATURE|$MESSAGE|DIALOG" >> .notification-history.log

# Create marker file for first-time setup
if [ ! -f .cursor-notifications ]; then
    echo "🔔 Desktop dialog system initialized - $(date)" > .cursor-notifications
    echo "📝 Sistema de dialog inicializado pela primeira vez"
fi

# Display success summary
echo ""
echo "📊 RESUMO DA NOTIFICAÇÃO:"
echo "   ✅ Dialog exibido com sucesso"
echo "   📱 Feature: $FEATURE"
echo "   ⚡ Urgência: $URGENCY"
echo "   ⏰ SLA: $SLA para resposta"
echo "   📁 Arquivo: DECISION_REQUEST_ROGERIO.md"
echo "" 