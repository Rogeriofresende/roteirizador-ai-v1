#!/bin/bash

# =============================================================================
# IA C - DIAGNÓSTICO TESTING & QA
# Especialização: DevOps/QA Specialist
# =============================================================================

echo "🛠️ IA C - DIAGNÓSTICO TESTING & QA"
echo "=================================="

# Test suite execution
echo "🧪 Executando suite de testes..."
npm test -- --watchAll=false --coverage --verbose 2>&1 | tee test-results.log

# Jest configuration validation
echo "⚙️ Verificando configuração Jest..."
npm test -- --showConfig > jest-config.log 2>&1

# Performance testing
echo "⚡ Verificando performance de testes..."
time npm test -- --watchAll=false > performance-test.log 2>&1

# CI/CD pipeline validation
echo "🔄 Verificando pipeline CI/CD..."
if [ -f ".github/workflows/production-deployment.yml" ]; then
    echo "✅ Pipeline CI/CD encontrado" > cicd-status.log
else
    echo "❌ Pipeline CI/CD não encontrado" > cicd-status.log
fi

# Test coverage analysis
echo "📊 Analisando cobertura de testes..."
find src/ -name "*.test.ts" -o -name "*.test.tsx" | wc -l > test-files-count.log
find src/ -name "*.ts" -o -name "*.tsx" | grep -v ".test." | wc -l > source-files-count.log

# Quality gates verification
echo "🚪 Verificando quality gates..."
npm run build > build-quality.log 2>&1
echo "Build exit code: $?" >> build-quality.log

# Performance bottlenecks
echo "🐌 Verificando gargalos de performance..."
find src/ -name "*.tsx" | xargs grep -E "(useEffect.*\[\]|useState.*=.*\[\])" > potential-bottlenecks.log || true

# Dependency vulnerabilities
echo "🔐 Verificando vulnerabilidades..."
npm audit --audit-level=moderate > security-audit.log 2>&1 || true

echo "📊 Compilando resultados IA C..."
cat > ../results/phase7-diagnostics/ia-c-testing-summary.json << INNER_EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "iaSpecialist": "IA_C_DevOps_QA",
  "diagnosticFocus": "Test suite + CI/CD + Performance + Quality gates",
  "categories": {
    "test_execution": "test-results.log",
    "jest_configuration": "jest-config.log",
    "performance_testing": "performance-test.log",
    "cicd_validation": "cicd-status.log",
    "test_coverage": "test-files-count.log + source-files-count.log",
    "quality_gates": "build-quality.log",
    "performance_bottlenecks": "potential-bottlenecks.log",
    "security_audit": "security-audit.log"
  },
  "status": "DIAGNOSTIC_COMPLETE",
  "nextStep": "Categorization by analyze-errors-by-ia.sh"
}
INNER_EOF

echo "✅ IA C - Diagnóstico Testing & QA COMPLETO"
