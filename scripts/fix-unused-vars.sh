#!/bin/bash

echo "🔧 Fixing unused vars..."

# Prefix unused function parameters with underscore
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' -E 's/\((([a-zA-Z_][a-zA-Z0-9_]*)(: [^,)]+)?),/\(_\2\3,/g'

# Remove unused imports (common React testing library)
find src -name "*.test.*" -o -name "*.spec.*" | xargs sed -i '' '/^import.*fireEvent.*from.*testing-library.*react.*$/d'
find src -name "*.test.*" -o -name "*.spec.*" | xargs sed -i '' '/^import.*waitFor.*from.*testing-library.*react.*$/d'

# Fix common unused destructuring in catch blocks
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/catch (error)/catch (_error)/g'

# Fix unused parameters in arrow functions
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' -E 's/\((error|err|e)\) => {/(_\1) => {/g'

echo "✅ Basic unused vars fixed! Some manual fixes may still be needed." 