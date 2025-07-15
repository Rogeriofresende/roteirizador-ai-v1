#!/bin/bash

# 🧪 Script de Teste V7.5 Enhanced - Execução Completa
# Execute este script para testar todas as implementações

echo "🚀 INICIANDO TESTES V7.5 ENHANCED..."
echo "============================================"

# Verificar diretório atual
echo "📁 Diretório atual: $(pwd)"
echo ""

# 1. Instalar dependências do Storybook
echo "📦 ETAPA 1: Instalando dependências Storybook..."
echo "Executando: npm install --save-dev @storybook/react @storybook/react-vite @storybook/addon-essentials @storybook/addon-interactions @storybook/addon-links @storybook/addon-docs"

npm install --save-dev @storybook/react @storybook/react-vite @storybook/addon-essentials @storybook/addon-interactions @storybook/addon-links @storybook/addon-docs

if [ $? -eq 0 ]; then
    echo "✅ Dependências Storybook instaladas com sucesso!"
else
    echo "❌ Erro na instalação das dependências"
    exit 1
fi

echo ""

# 2. Iniciar aplicação principal (V7.0)
echo "📱 ETAPA 2: Iniciando aplicação principal (V7.0 Enhanced)..."
echo "Executando: npm run dev"

npm run dev &
APP_PID=$!

echo "✅ Aplicação principal iniciada (PID: $APP_PID)"
echo "🌐 Acesso: http://localhost:5173"
echo "📍 Navegue para: Banco de Ideias"
echo ""

# Aguardar alguns segundos para a aplicação carregar
sleep 5

# 3. Iniciar Storybook (V7.5)
echo "📚 ETAPA 3: Iniciando Storybook (V7.5 Documentation)..."
echo "Executando: npm run storybook"

npm run storybook &
STORYBOOK_PID=$!

echo "✅ Storybook iniciado (PID: $STORYBOOK_PID)"
echo "🌐 Acesso: http://localhost:6006"
echo ""

# Aguardar Storybook carregar
sleep 10

echo "🎯 TESTES PRONTOS PARA VALIDAÇÃO!"
echo "============================================"
echo ""
echo "📱 APLICAÇÃO PRINCIPAL V7.0:"
echo "   🔗 URL: http://localhost:5173"
echo "   📍 Página: Banco de Ideias"
echo "   ✅ Validar: Glass-morphism, colored shadows, modern gradients"
echo ""
echo "📚 STORYBOOK DOCUMENTATION V7.5:"
echo "   🔗 URL: http://localhost:6006"
echo "   📍 Seções: Design System > Design Tokens"
echo "   📍 Seções: Design System > Components > Button"
echo "   📍 Seções: Design System > Components > Card"
echo "   ✅ Validar: Design tokens, component library, interactive examples"
echo ""
echo "📋 CHECKLIST DE VALIDAÇÃO:"
echo "   [ ] Background gradiente moderno no Banco de Ideias"
echo "   [ ] Cards com glass-morphism e blur effects"
echo "   [ ] Buttons com gradientes e hover animations"
echo "   [ ] Typography Inter font carregada"
echo "   [ ] Storybook Design Tokens página carrega"
echo "   [ ] Button stories todas funcionais"
echo "   [ ] Card stories com examples reais"
echo "   [ ] Code examples copy-pasteable"
echo ""
echo "⚠️  Para parar os servidores:"
echo "   kill $APP_PID $STORYBOOK_PID"
echo ""
echo "🎉 EXECUÇÃO COMPLETA! Valide manualmente nos browsers."