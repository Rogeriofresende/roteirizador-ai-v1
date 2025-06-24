#!/bin/bash

# 🔧 Script de Configuração Automática - Tally.so + Clarity
# Execute: ./configure-tally.sh

echo "🚀 Configurando integração Tally.so + Clarity..."
echo ""

# Verificar se .env.local existe
if [ ! -f .env.local ]; then
    echo "📝 Criando arquivo .env.local..."
    touch .env.local
fi

# Configurar Clarity (já temos o ID)
echo "🔍 Configurando Microsoft Clarity..."
grep -q "VITE_CLARITY_PROJECT_ID" .env.local || echo "VITE_CLARITY_PROJECT_ID=s05cslzjy5" >> .env.local

# Solicitar IDs do Tally
echo ""
echo "📋 Digite os IDs dos formulários Tally.so:"
echo ""

read -p "🔤 Feedback Geral ID: " feedback_id
read -p "📊 NPS Survey ID: " nps_id  
read -p "🎯 Features Survey ID: " features_id
read -p "🐛 Bug Report ID: " bugs_id

echo ""
echo "💾 Salvando configurações..."

# Remover configurações antigas se existirem
sed -i '' '/VITE_TALLY_FORM_/d' .env.local

# Adicionar novas configurações
echo "VITE_TALLY_FORM_FEEDBACK=$feedback_id" >> .env.local
echo "VITE_TALLY_FORM_NPS=$nps_id" >> .env.local
echo "VITE_TALLY_FORM_FEATURES=$features_id" >> .env.local
echo "VITE_TALLY_FORM_BUGS=$bugs_id" >> .env.local

echo ""
echo "✅ Configuração concluída!"
echo ""
echo "📄 Arquivo .env.local criado com:"
echo "   - Microsoft Clarity: s05cslzjy5"
echo "   - Tally Feedback: $feedback_id"
echo "   - Tally NPS: $nps_id"
echo "   - Tally Features: $features_id"
echo "   - Tally Bugs: $bugs_id"
echo ""

# Testar se npm está disponível
if command -v npm &> /dev/null; then
    echo "🧪 Iniciando servidor para teste..."
    echo "   - Abra: http://localhost:5173"
    echo "   - Console (F12): TallyService.getStatus()"
    echo ""
    echo "Press Ctrl+C para parar o servidor"
    npm run dev
else
    echo "ℹ️  Execute 'npm run dev' para testar a integração"
fi

echo ""
echo "🎯 Próximos passos:"
echo "   1. Testar formulários localmente"
echo "   2. Configurar variáveis no Vercel"
echo "   3. Deploy para produção"
echo ""
echo "📚 Ver: setup-tally-integration.md para mais detalhes" 