# 🚀 CI/CD e Deployment - Roteirar-ia

> Guia completo de Continuous Integration, Continuous Deployment e estratégias de deploy

## 📋 **Visão Geral**

O Roteirar-ia utiliza uma pipeline de CI/CD moderna para garantir qualidade, segurança e confiabilidade nos deployments. Este documento detalha toda a arquitetura de deployment, desde commits até produção.

---

## 🏗️ **Arquitetura de Deploy**

### **Ambientes**
```
🔄 Development → 🧪 Staging → 🚀 Production
     ↓              ↓            ↓
  localhost    staging.app    roteirar-ia.com
```

### **Pipeline Overview**
1. **Commit** → GitHub Actions triggered
2. **CI Tests** → Unit, Integration, E2E
3. **Security Scan** → Vulnerability check
4. **Build** → Production-ready bundle
5. **Deploy Staging** → Automatic deployment
6. **Smoke Tests** → Health verification
7. **Manual Approval** → Production gate
8. **Deploy Production** → Blue-green deployment
9. **Monitoring** → Health & performance tracking

---

## ⚙️ **GitHub Actions Configuration**

### **Main CI Pipeline (.github/workflows/ci.yml)**
```yaml
name: CI Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20]
    
    steps:
    - name: Checkout
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Lint & Type Check
      run: |
        npm run lint
        npm run type-check
        
    - name: Run Tests
      run: |
        npm run test:unit
        npm run test:integration
        npm run test:e2e
        
    - name: Build
      run: npm run build
      
    - name: Upload Coverage
      uses: codecov/codecov-action@v3
```

### **Security Scanning**
```yaml
security-scan:
  runs-on: ubuntu-latest
  steps:
  - name: Checkout
    uses: actions/checkout@v4
    
  - name: Run npm audit
    run: npm audit --audit-level=high
    
  - name: Snyk Security Scan
    uses: snyk/actions/node@master
    env:
      SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

---

## 🚀 **Deployment Strategies**

### **Staging Deployment (Automatic)**
```yaml
deploy-staging:
  if: github.ref == 'refs/heads/develop'
  needs: [test, security-scan]
  runs-on: ubuntu-latest
  environment: staging
  
  steps:
  - name: Deploy to Vercel Staging
    uses: vercel/action@v1
    with:
      vercel-token: ${{ secrets.VERCEL_TOKEN }}
      vercel-args: '--env=staging'
      
  - name: Run Smoke Tests
    run: npm run test:smoke -- --url=${{ steps.deploy.outputs.url }}
```

### **Production Deployment (Manual Approval)**
```yaml
deploy-production:
  if: github.ref == 'refs/heads/main'
  needs: [test, security-scan]
  runs-on: ubuntu-latest
  environment: production
  
  steps:
  - name: Manual Approval Required
    uses: trstringer/manual-approval@v1
    with:
      secret: ${{ github.TOKEN }}
      approvers: tech-lead,product-owner
      
  - name: Deploy to Production
    uses: vercel/action@v1
    with:
      vercel-token: ${{ secrets.VERCEL_TOKEN }}
      vercel-args: '--prod'
```

---

## 🔒 **Environment Configuration**

### **Required Secrets**
```bash
# Deployment
VERCEL_TOKEN=                 # Vercel deployment token
VERCEL_ORG_ID=               # Organization ID
VERCEL_PROJECT_ID=           # Project ID

# API Configuration  
STAGING_GEMINI_API_KEY=      # Staging Gemini API key
PROD_GEMINI_API_KEY=         # Production Gemini API key
STAGING_FIREBASE_CONFIG=     # Staging Firebase config
PROD_FIREBASE_CONFIG=        # Production Firebase config

# Monitoring
SENTRY_DSN=                  # Error tracking
SLACK_WEBHOOK=               # Deployment notifications
CODECOV_TOKEN=               # Code coverage
```

### **Environment Variables**
```typescript
// Environment-specific configuration
interface EnvironmentConfig {
  environment: 'development' | 'staging' | 'production';
  apiUrl: string;
  geminiApiKey: string;
  firebase: FirebaseConfig;
  features: FeatureFlags;
  monitoring: MonitoringConfig;
}

// Production config
export const productionConfig: EnvironmentConfig = {
  environment: 'production',
  apiUrl: 'https://api.roteirar-ia.com',
  geminiApiKey: process.env.VITE_GEMINI_API_KEY!,
  firebase: {
    apiKey: process.env.VITE_FIREBASE_API_KEY!,
    authDomain: "roteirar-ia-prod.firebaseapp.com",
    projectId: "roteirar-ia-prod",
  },
  features: {
    debugMode: false,
    analytics: true,
    errorReporting: true
  },
  monitoring: {
    sentryDsn: process.env.VITE_SENTRY_DSN!,
    enablePerformanceMonitoring: true
  }
};
```

---

## 📊 **Quality Gates**

### **Automated Quality Checks**
```bash
# Quality gates that must pass before deployment
quality_gates:
  unit_tests:
    coverage: >=80%
    pass_rate: 100%
    
  integration_tests:
    pass_rate: 100%
    
  e2e_tests:
    critical_paths: 100%
    
  security_scan:
    critical_vulnerabilities: 0
    high_vulnerabilities: <=2
    
  performance:
    lighthouse_performance: >=90
    bundle_size: <=2MB
    
  accessibility:
    lighthouse_accessibility: >=95
    axe_violations: 0
```

### **Quality Gate Script**
```bash
#!/bin/bash
# scripts/quality-gates.sh

echo "🔍 Running Quality Gates..."

# Test Coverage
COVERAGE=$(npm run test:coverage:check | grep -o '[0-9]*' | tail -1)
if [ $COVERAGE -lt 80 ]; then
  echo "❌ Coverage: $COVERAGE% < 80%"
  exit 1
fi
echo "✅ Coverage: $COVERAGE%"

# Security Scan
npm audit --audit-level=high
if [ $? -ne 0 ]; then
  echo "❌ Security vulnerabilities found"
  exit 1
fi
echo "✅ Security: No critical vulnerabilities"

# Bundle Size
BUNDLE_SIZE=$(du -sh dist/assets/*.js | cut -f1)
echo "✅ Bundle size: $BUNDLE_SIZE"

echo "🎉 All quality gates passed!"
```

---

## 🔄 **Rollback Procedures**

### **Automatic Rollback Triggers**
```yaml
# Conditions that trigger automatic rollback:
rollback_triggers:
  health_check_failures: 3_consecutive
  error_rate_spike: >5%_for_5min
  response_time_spike: >2s_for_3min
  user_complaints: >10_in_15min
```

### **Manual Rollback Script**
```bash
#!/bin/bash
# scripts/rollback.sh

ENVIRONMENT=${1:-production}
VERSION=${2:-previous}

echo "🔄 Rolling back $ENVIRONMENT to $VERSION..."

if [ "$VERSION" = "previous" ]; then
    DEPLOYMENT_ID=$(vercel ls --json | jq -r '.[1].uid')
else
    DEPLOYMENT_ID=$VERSION
fi

# Perform rollback
vercel alias set $DEPLOYMENT_ID roteirar-ia.com

# Verify rollback
curl -f https://roteirar-ia.com/health || {
    echo "❌ Rollback health check failed"
    exit 1
}

echo "✅ Rollback completed successfully"

# Notify team
curl -X POST $SLACK_WEBHOOK -d "{
  \"text\": \"🔄 Rollback completed: $ENVIRONMENT → $VERSION\",
  \"channel\": \"#deployments\"
}"
```

---

## 📊 **Monitoring & Health Checks**

### **Health Check Endpoints**
```typescript
// src/utils/health.ts
export const healthChecks = {
  basic: {
    endpoint: '/health',
    expected: { status: 'ok' }
  },
  
  detailed: {
    endpoint: '/health/detailed',
    checks: [
      'database_connection',
      'external_apis',
      'memory_usage',
      'disk_space'
    ]
  },
  
  readiness: {
    endpoint: '/health/ready',
    description: 'Ready to serve traffic'
  }
};

// Health check implementation
export async function performHealthCheck(): Promise<HealthStatus> {
  const checks = await Promise.allSettled([
    checkGeminiAPI(),
    checkFirebase(),
    checkMemoryUsage(),
    checkResponseTime()
  ]);
  
  return {
    status: checks.every(c => c.status === 'fulfilled') ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    checks: checks.map(formatCheckResult)
  };
}
```

### **Deployment Monitoring**
```bash
#!/bin/bash
# scripts/monitor-deployment.sh

URL=$1
DURATION=${2:-300}  # 5 minutes
SUCCESS_THRESHOLD=${3:-95}

echo "📊 Monitoring deployment: $URL"

START_TIME=$(date +%s)
SUCCESS_COUNT=0
TOTAL_COUNT=0

while [ $(($(date +%s) - START_TIME)) -lt $DURATION ]; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL/health")
    TOTAL_COUNT=$((TOTAL_COUNT + 1))
    
    if [ $STATUS -eq 200 ]; then
        SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    fi
    
    SUCCESS_RATE=$((SUCCESS_COUNT * 100 / TOTAL_COUNT))
    echo "Health: $SUCCESS_COUNT/$TOTAL_COUNT (${SUCCESS_RATE}%)"
    
    if [ $SUCCESS_RATE -lt $SUCCESS_THRESHOLD ]; then
        echo "❌ Success rate below threshold!"
        exit 1
    fi
    
    sleep 10
done

echo "✅ Deployment monitoring successful: ${SUCCESS_RATE}%"
```

---

## 🐳 **Docker Support**

### **Multi-stage Dockerfile**
```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Production stage  
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost/health || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### **Docker Compose (Development)**
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:80"
    environment:
      - NODE_ENV=development
    volumes:
      - ./src:/app/src:ro
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

---

## 📋 **Deployment Checklist**

### **Pre-Deployment**
```
□ All CI tests passing
□ Security scan completed  
□ Code review approved
□ Documentation updated
□ Environment variables set
□ Database migrations ready
□ Rollback plan prepared
□ Team notified
```

### **Post-Deployment**
```
□ Health checks passing
□ Smoke tests completed
□ Performance metrics normal
□ Error rates within limits
□ User journeys verified
□ Monitoring alerts configured
□ Success notification sent
```

---

## 🔧 **Troubleshooting**

### **Common Issues & Solutions**

**Build Failures:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# Check build logs
npm run build --verbose
```

**Deployment Failures:**
```bash
# Check Vercel deployment logs
vercel logs [deployment-url]

# Verify environment variables
vercel env ls

# Check secrets configuration
vercel secrets ls
```

**Performance Issues:**
```bash
# Analyze bundle size
npm run analyze

# Run performance audit
npm run lighthouse

# Check memory usage
npm run test:memory
```

---

## 📚 **Related Documentation**

- [🔒 Security Configuration](security.md)
- [📊 Monitoring Setup](../operations/monitoring.md)
- [🏗️ Architecture Overview](../architecture/overview.md)
- [🔧 Troubleshooting](../operations/troubleshooting.md)

---

**Documentação criada:** Janeiro 2025  
**Última atualização:** Janeiro 2025  
**Versão:** 1.0 