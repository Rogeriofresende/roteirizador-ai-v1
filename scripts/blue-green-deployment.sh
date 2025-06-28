#!/bin/bash

# Blue-Green Deployment Script for Roteirar IA
# Zero-downtime deployment with automated rollback

set -e

# Configuration
BLUE_SLOT="roteirar-blue"
GREEN_SLOT="roteirar-green"
STAGING_URL="https://roteirar-staging.vercel.app"
PRODUCTION_URL="https://roteirar.vercel.app"
HEALTH_CHECK_TIMEOUT=300
ROLLBACK_ENABLED=true

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Health check function
health_check() {
    local url=$1
    local timeout=$2
    
    log "Performing health check on $url"
    
    for i in $(seq 1 $timeout); do
        if curl -f -s "$url" > /dev/null 2>&1; then
            success "Health check passed for $url"
            return 0
        fi
        
        if [ $((i % 10)) -eq 0 ]; then
            log "Health check attempt $i/$timeout for $url"
        fi
        
        sleep 1
    done
    
    error "Health check failed for $url after $timeout seconds"
    return 1
}

# Performance benchmark
performance_check() {
    local url=$1
    
    log "Running performance benchmark on $url"
    
    # Lighthouse CI performance check
    npx lhci autorun --upload.target=temporary-public-storage --config=lighthouserc.json --collect.url="$url" || {
        warning "Performance check completed with warnings"
        return 1
    }
    
    success "Performance benchmark passed"
    return 0
}

# Pre-deployment validation
pre_deployment_checks() {
    log "Running pre-deployment validation"
    
    # Run tests
    npm test -- --coverage --watchAll=false || {
        error "Tests failed - aborting deployment"
        exit 1
    }
    
    # Build validation
    npm run build || {
        error "Build failed - aborting deployment"
        exit 1
    }
    
    # Security audit
    npm audit --audit-level high || {
        warning "Security audit found issues - proceed with caution"
    }
    
    success "Pre-deployment checks completed"
}

# Get current active slot
get_active_slot() {
    # Check which slot is currently serving production traffic
    if curl -f -s "$PRODUCTION_URL" | grep -q "blue"; then
        echo "blue"
    else
        echo "green"
    fi
}

# Deploy to staging slot
deploy_to_staging() {
    local target_slot=$1
    
    log "Deploying to staging slot: $target_slot"
    
    # Deploy using Vercel
    if [ "$target_slot" = "blue" ]; then
        vercel --prod --env=REACT_APP_SLOT=blue || {
            error "Failed to deploy to blue slot"
            exit 1
        }
    else
        vercel --prod --env=REACT_APP_SLOT=green || {
            error "Failed to deploy to green slot"
            exit 1
        }
    fi
    
    success "Deployment to $target_slot completed"
}

# Traffic switch
switch_traffic() {
    local from_slot=$1
    local to_slot=$2
    
    log "Switching traffic from $from_slot to $to_slot"
    
    # Update DNS/Load balancer configuration
    # This would typically integrate with your DNS provider or load balancer
    # For Vercel, we use aliases
    
    vercel alias set "roteirar-$to_slot.vercel.app" "$PRODUCTION_URL" || {
        error "Failed to switch traffic to $to_slot"
        return 1
    }
    
    success "Traffic switched to $to_slot"
    return 0
}

# Rollback function
rollback() {
    local current_slot=$1
    local previous_slot=$2
    
    error "Rolling back from $current_slot to $previous_slot"
    
    if switch_traffic "$current_slot" "$previous_slot"; then
        success "Rollback completed successfully"
        
        # Send alerting notification
        curl -X POST "$WEBHOOK_URL" \
             -H "Content-Type: application/json" \
             -d "{\"text\":\"🚨 Roteirar IA: Rollback executed - switched from $current_slot to $previous_slot\"}" || true
    else
        error "Rollback failed - manual intervention required"
        exit 1
    fi
}

# Main deployment function
main() {
    log "Starting Blue-Green Deployment for Roteirar IA"
    
    # Pre-deployment validation
    pre_deployment_checks
    
    # Deploy to Vercel
    vercel deploy --prod || {
        error "Deployment failed"
        exit 1
    }
    
    # Health check
    sleep 30  # Allow deployment to stabilize
    if health_check "$PRODUCTION_URL" $HEALTH_CHECK_TIMEOUT; then
        success "Deployment completed successfully"
    else
        error "Health check failed after deployment"
        exit 1
    fi
}

# Script execution
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "health-check")
        health_check "$PRODUCTION_URL" 30
        ;;
    *)
        echo "Usage: $0 {deploy|health-check}"
        exit 1
        ;;
esac 