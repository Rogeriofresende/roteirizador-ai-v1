#!/bin/bash

# =============================================================================
# IA B - DIAGNÓSTICO FRONTEND & COMPONENTS
# Especialização: Frontend/UX Specialist
# =============================================================================

echo "🎨 IA B - DIAGNÓSTICO FRONTEND & COMPONENTS"
echo "==========================================="

# React warnings and console errors
echo "⚛️ Verificando React warnings e console errors..."
npm start 2>&1 | head -50 > react-warnings.log &
REACT_PID=$!
sleep 10
kill $REACT_PID 2>/dev/null || true

# Component key props validation
echo "🔑 Verificando key props em componentes..."
find src/ -name "*.tsx" | xargs grep -n "\.map(" | grep -v "key=" > missing-keys.log || true

# Accessibility violations
echo "♿ Verificando violações de acessibilidade..."
find src/ -name "*.tsx" | xargs grep -E "(onClick|onSubmit)" | grep -v "onKeyDown\|role=" > accessibility-issues.log || true

# Console.log statements
echo "📢 Verificando console.log statements..."
find src/ -name "*.tsx" -o -name "*.ts" | xargs grep -n "console\." > console-statements.log || true

# Mobile responsiveness issues
echo "📱 Verificando problemas de responsividade..."
find src/ -name "*.tsx" | xargs grep -E "(px|em)" | grep -v "rem\|%\|vw\|vh" > hardcoded-dimensions.log || true

# UX consistency check
echo "🎨 Verificando consistência de UX..."
find src/ -name "*.tsx" | xargs grep -E "(className|style=)" | grep -E "color:|background:" > inline-styles.log || true

# Component complexity analysis
echo "�� Analisando complexidade de componentes..."
find src/components/ -name "*.tsx" | xargs wc -l | sort -nr | head -10 > complex-components.log

echo "📊 Compilando resultados IA B..."
cat > ../results/phase7-diagnostics/ia-b-frontend-summary.json << INNER_EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "iaSpecialist": "IA_B_Frontend_UX",
  "diagnosticFocus": "React components + UX consistency + Responsive issues",
  "categories": {
    "react_warnings": "react-warnings.log",
    "missing_keys": "missing-keys.log",
    "accessibility_violations": "accessibility-issues.log",
    "console_statements": "console-statements.log", 
    "responsive_issues": "hardcoded-dimensions.log",
    "ux_consistency": "inline-styles.log",
    "component_complexity": "complex-components.log"
  },
  "status": "DIAGNOSTIC_COMPLETE",
  "nextStep": "Categorization by analyze-errors-by-ia.sh"
}
INNER_EOF

echo "✅ IA B - Diagnóstico Frontend & Components COMPLETO"
