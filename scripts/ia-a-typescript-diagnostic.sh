#!/bin/bash

# =============================================================================
# IA A - DIAGNÓSTICO TYPESCRIPT & ARCHITECTURE
# Especialização: Backend/Architecture Specialist
# =============================================================================

echo "🏗️ IA A - DIAGNÓSTICO TYPESCRIPT & ARCHITECTURE"
echo "================================================"

# TypeScript compilation errors
echo "📝 Verificando erros de compilação TypeScript..."
npx tsc --noEmit --skipLibCheck 2>&1 | tee typescript-errors.log

# ESLint errors
echo "🔍 Verificando problemas ESLint..."
npx eslint src/ --ext .ts,.tsx --format json > eslint-results.json 2>/dev/null || true

# Build verification
echo "🏗️ Verificando processo de build..."
npm run build 2>&1 | tee build-errors.log

# Import/dependency analysis
echo "📦 Analisando dependências e imports..."
find src/ -name "*.tsx" -o -name "*.ts" | xargs grep -n "import.*from" | grep -E "(\.\.\/.*){3,}" > deep-imports.log || true

# Interface and type validation
echo "🔧 Verificando interfaces e tipos..."
grep -r "interface.*{" src/ > interfaces.log
grep -r "type.*=" src/ > types.log

# Architecture patterns check
echo "🏛️ Verificando padrões de arquitetura..."
find src/ -name "*.tsx" -o -name "*.ts" | xargs wc -l | sort -nr | head -20 > large-files.log

# Compilation final
echo "📊 Compilando resultados IA A..."
cat > ../results/phase7-diagnostics/ia-a-typescript-summary.json << INNER_EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "iaSpecialist": "IA_A_Backend_Architecture",
  "diagnosticFocus": "TypeScript compilation + Architecture validation",
  "categories": {
    "typescript_errors": "typescript-errors.log",
    "eslint_issues": "eslint-results.json", 
    "build_errors": "build-errors.log",
    "import_analysis": "deep-imports.log",
    "interface_validation": "interfaces.log + types.log",
    "architecture_patterns": "large-files.log"
  },
  "status": "DIAGNOSTIC_COMPLETE",
  "nextStep": "Categorization by analyze-errors-by-ia.sh"
}
INNER_EOF

echo "✅ IA A - Diagnóstico TypeScript & Architecture COMPLETO"
