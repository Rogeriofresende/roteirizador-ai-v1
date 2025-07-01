#!/bin/bash

# 🔍 HEALTH CHECK OBRIGATÓRIO - METODOLOGIA V6.0
# Valida todas as condições da metodologia antes de permitir trabalho

echo "🔍 HEALTH CHECK METODOLOGIA V6.0"
echo "=================================="

ERRORS=0
WARNINGS=0

# 1. VERIFICAR SISTEMA FUNCIONANDO
echo "📊 1. Sistema funcionando..."
if npm run build --silent > /dev/null 2>&1; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    ERRORS=$((ERRORS + 1))
fi

# 2. VERIFICAR DOCUMENTO MESTRE
echo "📚 2. Documento mestre..."
CURRENT_YEAR=$(date +%Y)
MASTER_DOC="*STATUS_ATUAL_${CURRENT_YEAR}.md"

if ls $MASTER_DOC 1> /dev/null 2>&1; then
    echo "✅ Documento mestre existe"
else
    echo "❌ Documento mestre não encontrado: *STATUS_ATUAL_${CURRENT_YEAR}.md"
    ERRORS=$((ERRORS + 1))
fi

# 3. VERIFICAR COORDENAÇÃO SIMPLES
echo "🤝 3. Coordenação simples..."
if [ -f "COORDENACAO_SIMPLES.md" ]; then
    echo "✅ COORDENACAO_SIMPLES.md existe"
else
    echo "❌ COORDENACAO_SIMPLES.md não encontrado"
    ERRORS=$((ERRORS + 1))
fi

# 4. VERIFICAR ORGANIZAÇÃO ARQUIVOS
echo "🗂️ 4. Organização arquivos..."
MD_COUNT=$(ls *.md 2>/dev/null | wc -l)
if [ $MD_COUNT -le 15 ]; then
    echo "✅ Arquivos .md na raiz: $MD_COUNT (≤15)"
else
    echo "⚠️ Muitos arquivos .md na raiz: $MD_COUNT (recomendado ≤15)"
    WARNINGS=$((WARNINGS + 1))
fi

# 5. VERIFICAR ARCHIVES
echo "📁 5. Archives organizados..."
if [ -d "archives/historical-docs" ]; then
    ARCHIVED_COUNT=$(ls archives/historical-docs/ 2>/dev/null | wc -l)
    echo "✅ Archives: $ARCHIVED_COUNT arquivos organizados"
else
    echo "⚠️ Pasta archives/historical-docs não existe"
    WARNINGS=$((WARNINGS + 1))
fi

# 6. VERIFICAR DEPENDENCIES
echo "📦 6. Dependencies..."
if npm audit --audit-level high --silent > /dev/null 2>&1; then
    echo "✅ No high-severity vulnerabilities"
else
    echo "⚠️ High-severity vulnerabilities encontradas"
    WARNINGS=$((WARNINGS + 1))
fi

# RESULTADO FINAL
echo "=================================="
echo "📊 RESULTADO HEALTH CHECK:"
echo "❌ Errors: $ERRORS"
echo "⚠️ Warnings: $WARNINGS"

if [ $ERRORS -eq 0 ]; then
    echo "🎯 STATUS: READY FOR WORK ✅"
    echo "✅ Sistema em compliance com Metodologia V6.0"
    exit 0
else
    echo "🚨 STATUS: FIX REQUIRED ❌"
    echo "❌ Execute correções antes de continuar trabalho"
    exit 1
fi 