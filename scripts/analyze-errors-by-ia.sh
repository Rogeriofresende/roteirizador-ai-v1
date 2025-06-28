#!/bin/bash

# =============================================================================
# ANÁLISE INTELIGENTE & CATEGORIZAÇÃO POR IA
# Sistema Multi-AI de Categorização de Erros
# =============================================================================

echo "🧠 ANÁLISE INTELIGENTE - CATEGORIZAÇÃO POR IA"
echo "=============================================="

cd results/phase7-diagnostics

# Análise dos resultados de cada IA
echo "📊 Analisando resultados de cada IA..."

# Contar erros por categoria
typescript_errors=$(wc -l < typescript-errors.log 2>/dev/null || echo "0")
build_errors=$(grep -c "error\|Error\|ERROR" build-errors.log 2>/dev/null || echo "0")
react_warnings=$(grep -c "warning\|Warning\|WARNING" react-warnings.log 2>/dev/null || echo "0")
missing_keys=$(wc -l < missing-keys.log 2>/dev/null || echo "0")
test_failures=$(grep -c "FAIL\|failing" test-results.log 2>/dev/null || echo "0")
console_statements=$(wc -l < console-statements.log 2>/dev/null || echo "0")

echo "🏗️ IA A - TypeScript/Architecture: $typescript_errors + $build_errors erros"
echo "🎨 IA B - Frontend/Components: $react_warnings + $missing_keys + $console_statements problemas"
echo "🛠️ IA C - Testing/QA: $test_failures falhas"

# Criar categorização inteligente
cat > FASE_7_ERROR_CATEGORIZATION.json << INNER_EOF
{
  "categorizationTimestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "methodology": "Intelligent Multi-AI Error Categorization",
  "totalErrorsDetected": $((typescript_errors + build_errors + react_warnings + missing_keys + test_failures + console_statements)),
  "categorization": {
    "categoryA_typescript_architecture": {
      "assignedTo": "IA_A",
      "errorCount": $((typescript_errors + build_errors)),
      "priority": "HIGH",
      "types": ["TypeScript compilation errors", "Build failures", "Architecture issues"],
      "files": ["TypeScript files", "Build configuration", "Architecture patterns"]
    },
    "categoryB_frontend_components": {
      "assignedTo": "IA_B", 
      "errorCount": $((react_warnings + missing_keys + console_statements)),
      "priority": "MEDIUM",
      "types": ["React warnings", "Missing key props", "Console statements", "UX inconsistencies"],
      "files": ["React components", "Frontend files", "UI patterns"]
    },
    "categoryC_testing_qa": {
      "assignedTo": "IA_C",
      "errorCount": $test_failures,
      "priority": "HIGH",
      "types": ["Test failures", "Performance issues", "Quality gate failures"],
      "files": ["Test files", "CI/CD configuration", "Quality gates"]
    }
  },
  "priorityAssignment": {
    "immediate_attention": ["Category A (build blocking)", "Category C (quality blocking)"],
    "medium_priority": ["Category B (warnings and cleanup)"],
    "coordination_required": ["Cross-cutting issues requiring multiple IAs"]
  }
}
INNER_EOF

echo "✅ Categorização inteligente COMPLETA"
echo "📁 Arquivo criado: FASE_7_ERROR_CATEGORIZATION.json"
