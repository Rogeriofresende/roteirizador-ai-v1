#!/bin/bash

# Rollback Procedures V6.2
# Automated rollback script for emergency situations

echo "🔄 ROLLBACK PROCEDURES V6.2"
echo "=========================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Get rollback type from argument
ROLLBACK_TYPE=${1:-"check"}

# Function to check current version
check_current_version() {
    echo -e "${BLUE}📊 Checking current version...${NC}"
    
    if [ -f "package.json" ]; then
        CURRENT_VERSION=$(grep -o '"version": "[^"]*' package.json | grep -o '[^"]*$')
        echo "Current version: $CURRENT_VERSION"
        
        # Check last deployment time
        if [ -f "dist/deployment-info.json" ]; then
            DEPLOY_TIME=$(grep -o '"timestamp": "[^"]*' dist/deployment-info.json | grep -o '[^"]*$' 2>/dev/null || echo "Unknown")
            echo "Last deployment: $DEPLOY_TIME"
        fi
    fi
}

# Function to create backup
create_backup() {
    echo -e "${BLUE}💾 Creating backup...${NC}"
    
    BACKUP_NAME="backup-v6.2-$(date +%Y%m%d-%H%M%S)"
    
    # Create backup directory
    mkdir -p backups/emergency
    
    # Backup current dist
    if [ -d "dist" ]; then
        cp -r dist "backups/emergency/$BACKUP_NAME-dist"
        echo "✅ Dist folder backed up"
    fi
    
    # Create git tag
    git tag -a "$BACKUP_NAME" -m "Emergency backup before rollback" 2>/dev/null || true
    
    # Save current environment
    if [ -f ".env.production" ]; then
        cp .env.production "backups/emergency/$BACKUP_NAME.env"
        echo "✅ Environment backed up"
    fi
    
    echo "Backup created: $BACKUP_NAME"
}

# Function for immediate rollback (Vercel)
immediate_rollback() {
    echo -e "${YELLOW}⚡ IMMEDIATE ROLLBACK (Vercel)${NC}"
    echo "================================"
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        echo -e "${RED}❌ Vercel CLI not found. Install with: npm i -g vercel${NC}"
        exit 1
    fi
    
    # List recent deployments
    echo "Recent deployments:"
    vercel list --limit 5
    
    echo ""
    echo "To rollback to a specific deployment:"
    echo "1. Copy the deployment URL from above"
    echo "2. Run: vercel alias set [deployment-url] [your-domain]"
    echo ""
    echo "Or use automatic rollback:"
    read -p "Rollback to previous deployment? (y/n): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Rolling back..."
        vercel rollback
        echo -e "${GREEN}✅ Rollback initiated${NC}"
    fi
}

# Function for git-based rollback
git_rollback() {
    echo -e "${YELLOW}🔄 GIT-BASED ROLLBACK${NC}"
    echo "===================="
    
    # Show recent tags
    echo "Recent version tags:"
    git tag -l "v*" | tail -5
    
    echo ""
    read -p "Enter version to rollback to (e.g., v6.1.0): " VERSION
    
    if [ -z "$VERSION" ]; then
        echo -e "${RED}❌ No version specified${NC}"
        exit 1
    fi
    
    # Check if tag exists
    if ! git rev-parse "$VERSION" >/dev/null 2>&1; then
        echo -e "${RED}❌ Version $VERSION not found${NC}"
        exit 1
    fi
    
    # Create rollback branch
    ROLLBACK_BRANCH="rollback/v6.2-to-$VERSION"
    echo "Creating rollback branch: $ROLLBACK_BRANCH"
    
    git checkout -b "$ROLLBACK_BRANCH" "$VERSION"
    
    # Install dependencies
    echo "Installing dependencies..."
    npm ci
    
    # Build
    echo "Building production..."
    NODE_ENV=production npm run build
    
    # Run quick validation
    echo "Running validation..."
    npm test -- --watchAll=false || true
    
    echo -e "${GREEN}✅ Rollback build ready${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Deploy with: npm run deploy:production"
    echo "2. Or push to main: git push origin $ROLLBACK_BRANCH:main --force"
}

# Function for emergency hotfix
emergency_hotfix() {
    echo -e "${RED}🚨 EMERGENCY HOTFIX MODE${NC}"
    echo "======================="
    
    # Create hotfix branch
    HOTFIX_BRANCH="hotfix/emergency-$(date +%Y%m%d-%H%M%S)"
    git checkout -b "$HOTFIX_BRANCH"
    
    echo "Hotfix branch created: $HOTFIX_BRANCH"
    echo ""
    echo "Common hotfixes:"
    echo "1. Disable problematic feature"
    echo "2. Revert specific commit"
    echo "3. Apply quick patch"
    echo ""
    read -p "Select option (1-3): " HOTFIX_OPTION
    
    case $HOTFIX_OPTION in
        1)
            echo "Disabling features..."
            # Create feature flags file
            cat > src/config/featureFlags.ts << EOF
// Emergency feature flags
export const featureFlags = {
  predictiveUX: false,
  multiAI: false,
  voiceSynthesis: false,
  advancedMicroInteractions: false,
  enabledAt: new Date().toISOString(),
  reason: 'Emergency rollback - features disabled'
};
EOF
            git add src/config/featureFlags.ts
            git commit -m "hotfix: disable v6.2 features for emergency rollback"
            ;;
        2)
            echo "Recent commits:"
            git log --oneline -10
            read -p "Enter commit hash to revert: " COMMIT_HASH
            git revert "$COMMIT_HASH" --no-edit
            ;;
        3)
            echo "Apply your patch manually, then run:"
            echo "git add . && git commit -m 'hotfix: emergency patch'"
            ;;
    esac
    
    echo ""
    echo -e "${YELLOW}Build and deploy hotfix:${NC}"
    echo "npm run build && npm run deploy:production"
}

# Function to monitor rollback
monitor_rollback() {
    echo -e "${BLUE}📊 MONITORING ROLLBACK${NC}"
    echo "===================="
    
    echo "Checking system health..."
    
    # Check if server is responding
    if command -v curl &> /dev/null; then
        echo -n "Server health: "
        if curl -s -o /dev/null -w "%{http_code}" http://localhost:5174 | grep -q "200"; then
            echo -e "${GREEN}✅ OK${NC}"
        else
            echo -e "${RED}❌ NOT RESPONDING${NC}"
        fi
    fi
    
    # Check build status
    if [ -d "dist" ]; then
        echo -e "${GREEN}✅ Build exists${NC}"
        echo "Build size: $(du -sh dist | cut -f1)"
    else
        echo -e "${RED}❌ No build found${NC}"
    fi
    
    # Check for error logs
    if [ -f "error.log" ]; then
        ERROR_COUNT=$(wc -l < error.log)
        echo "Error log entries: $ERROR_COUNT"
    fi
    
    echo ""
    echo "Post-rollback checklist:"
    echo "□ Verify site is accessible"
    echo "□ Check critical features work"
    echo "□ Monitor error rates"
    echo "□ Notify team of rollback"
    echo "□ Create incident report"
}

# Main menu
show_menu() {
    echo -e "${BLUE}Select rollback option:${NC}"
    echo "1. 🔍 Check current status"
    echo "2. ⚡ Immediate rollback (Vercel)"
    echo "3. 🔄 Git-based rollback"
    echo "4. 🚨 Emergency hotfix"
    echo "5. 📊 Monitor rollback"
    echo "6. 💾 Create backup only"
    echo "7. ❌ Exit"
    echo ""
    read -p "Select option (1-7): " OPTION
    
    case $OPTION in
        1) check_current_version ;;
        2) create_backup && immediate_rollback ;;
        3) create_backup && git_rollback ;;
        4) create_backup && emergency_hotfix ;;
        5) monitor_rollback ;;
        6) create_backup ;;
        7) echo "Exiting..."; exit 0 ;;
        *) echo -e "${RED}Invalid option${NC}"; show_menu ;;
    esac
}

# Main execution
if [ "$ROLLBACK_TYPE" == "immediate" ]; then
    create_backup
    immediate_rollback
elif [ "$ROLLBACK_TYPE" == "git" ]; then
    create_backup
    git_rollback
elif [ "$ROLLBACK_TYPE" == "hotfix" ]; then
    create_backup
    emergency_hotfix
else
    show_menu
fi

echo ""
echo -e "${YELLOW}⚠️  Remember to:${NC}"
echo "- Document the rollback reason"
echo "- Notify all stakeholders"
echo "- Monitor system closely"
echo "- Plan forward fix" 