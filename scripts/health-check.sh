#!/bin/bash
# health-check.sh - IA Charlie System Health Monitoring
# Week 4 Critical Fixes - Continuous Monitoring Protocol

DATE=$(date +%Y%m%d)
TIME=$(date +%H%M)
LOG_DIR="logs/day-$DATE"
mkdir -p "$LOG_DIR"

echo "=== SYSTEM HEALTH CHECK $(date) ==="
echo "IA CHARLIE - Week 4 Monitoring Protocol"
echo "========================================"

# Server Status
echo "🔍 SERVER STATUS:"
if curl -s http://localhost:5173/ > /dev/null; then
    echo "✅ Server: UP (http://localhost:5173/)"
else
    echo "❌ Server: DOWN"
fi

# Build Status
echo ""
echo "🔨 BUILD STATUS:"
if npm run build --silent > "$LOG_DIR/build-$TIME.log" 2>&1; then
    BUILD_TIME=$(grep "built in" "$LOG_DIR/build-$TIME.log" | grep -o '[0-9.]*s')
    BUNDLE_SIZE=$(grep "gzip:" "$LOG_DIR/build-$TIME.log" | grep index | grep -o '[0-9.]*kB')
    echo "✅ Build: SUCCESS ($BUILD_TIME)"
    echo "📦 Bundle: $BUNDLE_SIZE (target: <400KB)"
else
    echo "❌ Build: FAILED"
fi

# Test Status
echo ""
echo "🧪 TEST STATUS:"
if npm run test --silent --passWithNoTests > "$LOG_DIR/test-$TIME.log" 2>&1; then
    echo "✅ Tests: PASS"
else
    echo "❌ Tests: FAIL"
fi

# Process Monitoring
echo ""
echo "⚙️ PROCESS STATUS:"
NODE_PROCESSES=$(ps aux | grep node | grep -v grep | wc -l)
echo "🟢 Node Processes: $NODE_PROCESSES"

# Network Status
echo ""
echo "🌐 NETWORK STATUS:"
if netstat -tulpn 2>/dev/null | grep :5173 > /dev/null; then
    echo "✅ Port 5173: LISTENING"
else
    echo "⚠️ Port 5173: NOT LISTENING"
fi

# Error Collection
echo ""
echo "🚨 ERROR COLLECTION:"
npm run lint 2>&1 | grep -i error > "$LOG_DIR/lint-errors-$TIME.txt" || echo "No lint errors"
echo "📝 Logs saved to: $LOG_DIR/"

echo ""
echo "=== HEALTH CHECK COMPLETE $(date) ===" 