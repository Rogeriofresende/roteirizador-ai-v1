#!/bin/bash

# Quality Gates V6.2 - Enterprise Grade Validation System
# Integração com CI/CD e validação completa

echo "🚪 QUALITY GATES V6.2 - ENTERPRISE VALIDATION"
echo "============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Initialize counters
PASSED_GATES=0
FAILED_GATES=0
WARNINGS=0

# Quality Gate 1: Build Performance
echo -e "${BLUE}🏗️  Gate 1: Build Performance${NC}"
echo "----------------------------"
BUILD_START=$(date +%s.%N)
if npm run build > /tmp/build-output.log 2>&1; then
    BUILD_END=$(date +%s.%N)
    BUILD_TIME=$(echo "$BUILD_END - $BUILD_START" | bc)
    BUILD_TIME_FORMATTED=$(printf "%.2f" $BUILD_TIME)
    
    # Extract bundle size from build output
    BUNDLE_SIZE=$(grep -oE 'dist/assets/index-[a-zA-Z0-9]+\.js\s+[0-9.]+ kB' /tmp/build-output.log | grep -oE '[0-9.]+' | tail -n1)
    GZIP_SIZE=$(grep -oE 'gzip: [0-9.]+ kB' /tmp/build-output.log | grep -oE '[0-9.]+')
    
    echo "Build Time: ${BUILD_TIME_FORMATTED}s"
    echo "Bundle Size: ${BUNDLE_SIZE}KB"
    echo "Gzip Size: ${GZIP_SIZE}KB"
    
    # Check thresholds
    if (( $(echo "$BUILD_TIME < 3" | bc -l) )); then
        echo -e "${GREEN}✅ Build time PASS (<3s)${NC}"
        ((PASSED_GATES++))
    else
        echo -e "${RED}❌ Build time FAIL (>3s)${NC}"
        ((FAILED_GATES++))
    fi
    
    if (( $(echo "$GZIP_SIZE < 350" | bc -l) )); then
        echo -e "${GREEN}✅ Bundle size PASS (<350KB)${NC}"
        ((PASSED_GATES++))
    else
        echo -e "${RED}❌ Bundle size FAIL (>350KB)${NC}"
        ((FAILED_GATES++))
    fi
else
    echo -e "${RED}❌ Build FAILED${NC}"
    ((FAILED_GATES++))
fi
echo ""

# Quality Gate 2: TypeScript Compilation
echo -e "${BLUE}📘 Gate 2: TypeScript Compilation${NC}"
echo "---------------------------------"
if npx tsc --noEmit > /tmp/tsc-output.log 2>&1; then
    echo -e "${GREEN}✅ TypeScript compilation PASS (0 errors)${NC}"
    ((PASSED_GATES++))
else
    TSC_ERRORS=$(grep -c "error TS" /tmp/tsc-output.log 2>/dev/null || echo "0")
    echo -e "${RED}❌ TypeScript compilation FAIL (${TSC_ERRORS} errors)${NC}"
    ((FAILED_GATES++))
fi
echo ""

# Quality Gate 3: ESLint
echo -e "${BLUE}🔍 Gate 3: Code Quality (ESLint)${NC}"
echo "--------------------------------"
npm run lint > /tmp/eslint-output.log 2>&1 || true
ESLINT_ERRORS=$(grep -oE '[0-9]+ errors?' /tmp/eslint-output.log | grep -oE '[0-9]+' | head -n1 || echo "0")
ESLINT_WARNINGS=$(grep -oE '[0-9]+ warnings?' /tmp/eslint-output.log | grep -oE '[0-9]+' | head -n1 || echo "0")

echo "ESLint Errors: $ESLINT_ERRORS"
echo "ESLint Warnings: $ESLINT_WARNINGS"

if [ "$ESLINT_ERRORS" -eq 0 ]; then
    echo -e "${GREEN}✅ ESLint PASS (0 errors)${NC}"
    ((PASSED_GATES++))
elif [ "$ESLINT_ERRORS" -lt 50 ]; then
    echo -e "${YELLOW}⚠️  ESLint WARNING (<50 errors)${NC}"
    ((WARNINGS++))
else
    echo -e "${RED}❌ ESLint FAIL (>50 errors)${NC}"
    ((FAILED_GATES++))
fi
echo ""

# Quality Gate 4: Test Suite
echo -e "${BLUE}🧪 Gate 4: Test Suite${NC}"
echo "--------------------"
if npm test -- --watchAll=false --passWithNoTests > /tmp/test-output.log 2>&1; then
    TESTS_PASSED=$(grep -oE 'Tests:\s+[0-9]+ passed' /tmp/test-output.log | grep -oE '[0-9]+' || echo "0")
    TESTS_FAILED=$(grep -oE 'Tests:\s+[0-9]+ failed' /tmp/test-output.log | grep -oE '[0-9]+' || echo "0")
    TESTS_TOTAL=$(grep -oE 'Tests:.*[0-9]+ total' /tmp/test-output.log | grep -oE '[0-9]+' | tail -n1 || echo "0")
    
    echo "Tests Passed: $TESTS_PASSED"
    echo "Tests Failed: $TESTS_FAILED"
    echo "Tests Total: $TESTS_TOTAL"
    
    if [ "$TESTS_FAILED" -eq 0 ] && [ "$TESTS_TOTAL" -gt 0 ]; then
        echo -e "${GREEN}✅ All tests PASS${NC}"
        ((PASSED_GATES++))
    elif [ "$TESTS_TOTAL" -eq 0 ]; then
        echo -e "${YELLOW}⚠️  No tests found${NC}"
        ((WARNINGS++))
    else
        echo -e "${RED}❌ Tests FAIL (${TESTS_FAILED} failed)${NC}"
        ((FAILED_GATES++))
    fi
else
    echo -e "${RED}❌ Test suite execution FAILED${NC}"
    ((FAILED_GATES++))
fi
echo ""

# Quality Gate 5: Security Audit
echo -e "${BLUE}🔒 Gate 5: Security Audit${NC}"
echo "------------------------"
npm audit --audit-level=moderate > /tmp/audit-output.log 2>&1 || true
VULNERABILITIES=$(grep -oE '[0-9]+ vulnerabilities' /tmp/audit-output.log | grep -oE '[0-9]+' | head -n1 || echo "0")

if [ "$VULNERABILITIES" -eq 0 ]; then
    echo -e "${GREEN}✅ No security vulnerabilities${NC}"
    ((PASSED_GATES++))
else
    echo -e "${YELLOW}⚠️  ${VULNERABILITIES} vulnerabilities found${NC}"
    ((WARNINGS++))
fi
echo ""

# Quality Gate 6: Bundle Analysis
echo -e "${BLUE}📊 Gate 6: Bundle Analysis${NC}"
echo "-------------------------"
if [ -d "dist" ]; then
    DIST_SIZE=$(du -sh dist/ | cut -f1)
    echo "Distribution folder size: $DIST_SIZE"
    
    # Check for source maps (should not be in production)
    if find dist -name "*.map" | grep -q .; then
        echo -e "${YELLOW}⚠️  Source maps found in dist${NC}"
        ((WARNINGS++))
    else
        echo -e "${GREEN}✅ No source maps in production build${NC}"
        ((PASSED_GATES++))
    fi
else
    echo -e "${YELLOW}⚠️  No dist folder found${NC}"
    ((WARNINGS++))
fi
echo ""

# Quality Gate 7: Performance Budget
echo -e "${BLUE}⚡ Gate 7: Performance Budget${NC}"
echo "----------------------------"
if [ -f "performance-metrics-v6.json" ]; then
    # Read latest quality score from metrics
    QUALITY_SCORE=$(tail -n 50 performance-metrics-v6.json | grep -oE '"qualityScore":\s*[0-9]+' | tail -n1 | grep -oE '[0-9]+' || echo "0")
    echo "Quality Score: ${QUALITY_SCORE}/100"
    
    if [ "$QUALITY_SCORE" -ge 90 ]; then
        echo -e "${GREEN}✅ Excellent quality (>90)${NC}"
        ((PASSED_GATES++))
    elif [ "$QUALITY_SCORE" -ge 70 ]; then
        echo -e "${YELLOW}⚠️  Good quality (70-90)${NC}"
        ((WARNINGS++))
    else
        echo -e "${RED}❌ Poor quality (<70)${NC}"
        ((FAILED_GATES++))
    fi
else
    echo -e "${YELLOW}⚠️  No performance metrics found${NC}"
    ((WARNINGS++))
fi
echo ""

# Final Summary
echo "============================================="
echo -e "${BLUE}📋 QUALITY GATES SUMMARY${NC}"
echo "============================================="
echo -e "Passed Gates: ${GREEN}${PASSED_GATES}${NC}"
echo -e "Failed Gates: ${RED}${FAILED_GATES}${NC}"
echo -e "Warnings: ${YELLOW}${WARNINGS}${NC}"
echo ""

# Determine overall status
TOTAL_GATES=$((PASSED_GATES + FAILED_GATES))
if [ "$FAILED_GATES" -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL QUALITY GATES PASSED!${NC}"
    echo "Ready for production deployment ✅"
    EXIT_CODE=0
elif [ "$FAILED_GATES" -le 2 ]; then
    echo -e "${YELLOW}⚠️  QUALITY GATES NEED ATTENTION${NC}"
    echo "Minor issues detected - review before deployment"
    EXIT_CODE=1
else
    echo -e "${RED}❌ QUALITY GATES FAILED${NC}"
    echo "Major issues detected - fix before deployment"
    EXIT_CODE=2
fi

# Generate detailed report
echo ""
echo "📄 Generating detailed report..."
cat > quality-gates-report.json << EOF
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "summary": {
    "passed": $PASSED_GATES,
    "failed": $FAILED_GATES,
    "warnings": $WARNINGS,
    "total": $TOTAL_GATES
  },
  "gates": {
    "build": {
      "buildTime": "${BUILD_TIME_FORMATTED}s",
      "bundleSize": "${BUNDLE_SIZE}KB",
      "gzipSize": "${GZIP_SIZE}KB"
    },
    "typescript": {
      "errors": ${TSC_ERRORS:-0}
    },
    "eslint": {
      "errors": $ESLINT_ERRORS,
      "warnings": $ESLINT_WARNINGS
    },
    "tests": {
      "passed": ${TESTS_PASSED:-0},
      "failed": ${TESTS_FAILED:-0},
      "total": ${TESTS_TOTAL:-0}
    },
    "security": {
      "vulnerabilities": $VULNERABILITIES
    },
    "quality": {
      "score": ${QUALITY_SCORE:-0}
    }
  },
  "status": "$([ $EXIT_CODE -eq 0 ] && echo "PASS" || echo "FAIL")"
}
EOF

echo "Report saved to quality-gates-report.json"
echo ""

# CI/CD Integration Message
if [ -n "$CI" ]; then
    echo "🔄 CI/CD Integration Active"
    echo "Exit code: $EXIT_CODE"
fi

exit $EXIT_CODE 