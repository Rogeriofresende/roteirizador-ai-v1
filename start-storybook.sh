#!/bin/bash

# 📚 Script para iniciar Storybook (localhost:6006)
# Execute este arquivo para ver a documentação V7.5

echo "🚀 INICIANDO STORYBOOK V7.5 ENHANCED..."
echo "==========================================="

# Navegar para o diretório do projeto
cd /Users/rogerioresende/Desktop/Roteirar-ia

echo "📁 Diretório atual: $(pwd)"
echo ""

# Verificar se o package.json existe
if [ ! -f "package.json" ]; then
    echo "❌ Erro: package.json não encontrado!"
    echo "📁 Certifique-se de estar no diretório correto"
    exit 1
fi

# Instalar dependências do Storybook
echo "📦 Instalando dependências Storybook..."
npm install --save-dev @storybook/react @storybook/react-vite @storybook/addon-essentials @storybook/addon-interactions @storybook/addon-links @storybook/addon-docs

if [ $? -ne 0 ]; then
    echo "❌ Erro na instalação das dependências"
    echo "🔄 Tentando instalação individual..."
    
    npm install --save-dev @storybook/react
    npm install --save-dev @storybook/react-vite
    npm install --save-dev @storybook/addon-essentials
    
    if [ $? -ne 0 ]; then
        echo "❌ Falha na instalação. Execute manualmente:"
        echo "npm install --save-dev @storybook/react @storybook/react-vite @storybook/addon-essentials"
        exit 1
    fi
fi

echo "✅ Dependências instaladas com sucesso!"
echo ""

# Verificar se os scripts existem no package.json
if ! grep -q "\"storybook\":" package.json; then
    echo "❌ Script 'storybook' não encontrado no package.json"
    echo "🔧 Adicionando script automaticamente..."
    
    # Backup do package.json
    cp package.json package.json.backup
    
    # Adicionar script se não existir
    sed -i '' 's/"scripts": {/"scripts": {\n    "storybook": "storybook dev -p 6006",\n    "build-storybook": "storybook build",/' package.json
    
    echo "✅ Scripts adicionados ao package.json"
fi

echo ""
echo "🚀 INICIANDO STORYBOOK..."
echo "Por favor, aguarde o carregamento..."
echo ""

# Iniciar Storybook
npm run storybook

echo ""
echo "🎯 STORYBOOK INICIADO!"
echo "🌐 Acesso: http://localhost:6006"
echo ""
echo "📚 SEÇÕES DISPONÍVEIS:"
echo "   📖 Design System / Design Tokens"
echo "   🔘 Design System / Components / Button"
echo "   🗃️ Design System / Components / Card"
echo ""
echo "✅ PRONTO PARA VISUALIZAÇÃO!"