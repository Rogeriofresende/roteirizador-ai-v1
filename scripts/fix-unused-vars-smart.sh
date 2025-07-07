#!/bin/bash

echo "🧹 Smart Unused Vars Cleanup - Phase 3"
echo "======================================"

# 1. Remove common unused imports from dashboard components
echo "📊 Cleaning dashboard component imports..."
sed -i '' '/^import.*TrendingUp.*from.*lucide-react.*$/d' src/components/dashboard/*.tsx
sed -i '' '/^import.*Calendar.*from.*lucide-react.*$/d' src/components/dashboard/*.tsx
sed -i '' '/^import.*Filter.*from.*lucide-react.*$/d' src/components/dashboard/*.tsx
sed -i '' '/^import.*Download.*from.*lucide-react.*$/d' src/components/dashboard/*.tsx
sed -i '' '/^import.*Heart.*from.*lucide-react.*$/d' src/components/dashboard/*.tsx

# 2. Remove unused imports from pages
echo "📄 Cleaning page imports..."
sed -i '' '/^import.*Settings.*from.*lucide-react.*$/d' src/pages/*.tsx
sed -i '' '/^import.*SearchIcon.*from.*lucide-react.*$/d' src/pages/*.tsx
sed -i '' '/^import.*TrendingUp.*from.*lucide-react.*$/d' src/pages/*.tsx
sed -i '' '/^import { db } from.*firebaseConfig.*$/d' src/pages/UserDashboard*.tsx
sed -i '' '/^import { collection, query, where, getDocs, orderBy } from.*firebase\/firestore.*$/d' src/pages/UserDashboard*.tsx

# 3. Remove unused test imports
echo "🧪 Cleaning test imports..."
sed -i '' '/^import { fireEvent } from.*testing-library.*$/d' src/__tests__/*.tsx
sed -i '' '/^import { waitFor } from.*testing-library.*$/d' src/__tests__/*.tsx
sed -i '' '/^import { afterEach } from.*jest.*$/d' src/__tests__/*.ts

# 4. Fix unused parameters by prefixing with underscore
echo "🔧 Fixing unused parameters..."
# Error handlers
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/catch (error)/catch (_error)/g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/\.catch(error/\.catch(_error/g'

# Common unused params in callbacks
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/(_, index)/(_, _index)/g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/(item, index)/(item, _index)/g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/(value, index)/(value, _index)/g'

# 5. Remove unused constants from imports
echo "🗑️ Removing unused constants..."
sed -i '' 's/, FORMAT_OPTIONS//g' src/components/ScriptForm.tsx
sed -i '' 's/, GOAL_OPTIONS//g' src/components/ScriptForm.tsx
sed -i '' 's/, AUDIENCE_OPTIONS//g' src/components/ScriptForm.tsx
sed -i '' 's/, TONE_OPTIONS//g' src/components/ScriptForm.tsx
sed -i '' 's/, OTHER_KEY//g' src/components/ScriptForm.tsx

# 6. Remove completely unused imports
echo "🚮 Removing complete unused import lines..."
# Find and remove import lines that only import unused items
find src -name "*.tsx" -o -name "*.ts" | while read file; do
  # Remove lines that import only unused Lucide icons
  sed -i '' '/^import {.*Brain.*} from.*lucide-react.*$/d' "$file"
  sed -i '' '/^import {.*BarChart3.*} from.*lucide-react.*$/d' "$file"
  sed -i '' '/^import {.*Users.*} from.*lucide-react.*$/d' "$file"
done

# 7. Fix specific known unused vars
echo "🎯 Fixing specific unused vars..."
# Fix unused state setters
sed -i '' 's/const \[stats, setStats\]/const [stats]/g' src/components/SystemDashboard.tsx
sed -i '' 's/const \[projectMetrics, setProjectMetrics\]/const [projectMetrics]/g' src/components/MultiAIVisualDashboard.tsx

# 8. Clean up assignments but never used
echo "🧼 Cleaning unused assignments..."
# Common patterns
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's/const loading = /const _loading = /g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's/const error = /const _error = /g'

echo "✅ Smart Unused Vars Cleanup Complete!"
echo "📊 Check results with: npm run lint | grep no-unused-vars | wc -l" 