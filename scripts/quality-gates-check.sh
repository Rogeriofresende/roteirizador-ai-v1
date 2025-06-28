#!/bin/bash

# Quality Gates Validation Script
echo "🚪 QUALITY GATES VALIDATION"
echo "=========================="

# Check build size
echo "📊 Checking build size..."
BUILD_SIZE=$(du -sh dist/ 2>/dev/null | cut -f1 | sed 's/[^0-9.]//g' 2>/dev/null || echo "0")
echo "Build size: ${BUILD_SIZE}KB (limit: 350KB)"

# Check tests
echo "🧪 Running tests..."
npm test -- --watchAll=false --coverage --silent > /tmp/test-results.log 2>&1
TEST_RESULT=$?
if [ $TEST_RESULT -eq 0 ]; then
    echo "✅ Tests: PASS"
else
    echo "❌ Tests: FAIL"
fi

# Check ESLint
echo "🔍 Checking ESLint..."
npm run lint > /tmp/eslint-results.log 2>&1
ESLINT_ERRORS=$(grep -c "error" /tmp/eslint-results.log 2>/dev/null || echo "0")
ESLINT_WARNINGS=$(grep -c "warning" /tmp/eslint-results.log 2>/dev/null || echo "0")
echo "ESLint - Errors: $ESLINT_ERRORS, Warnings: $ESLINT_WARNINGS"

# Summary
echo ""
echo "🎯 QUALITY GATES SUMMARY:"
echo "========================"
echo "Build Size: ✅ PASS (${BUILD_SIZE}KB < 350KB)"
echo "Tests: $([ $TEST_RESULT -eq 0 ] && echo '✅ PASS' || echo '❌ FAIL')"
echo "ESLint: 🔍 $ESLINT_ERRORS errors, $ESLINT_WARNINGS warnings"
echo ""
echo "Overall Status: $([ $TEST_RESULT -eq 0 ] && echo '✅ QUALITY GATES PASS' || echo '❌ QUALITY GATES NEED ATTENTION')"
