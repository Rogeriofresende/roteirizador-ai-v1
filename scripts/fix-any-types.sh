#!/bin/bash

echo "🔧 Fixing any types in critical files..."

# Fix window.gtag any types
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/window\.gtag?: (\.\.\.[^)]*any[^)]*) => void/window.gtag?: (...args: unknown[]) => void/g'

# Fix error handlers to use unknown
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/catch (error: any)/catch (error: unknown)/g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/} catch (error) {/} catch (error: unknown) {/g'

# Fix Record<string, any> to Record<string, unknown> where safe
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/Record<string, any>/Record<string, unknown>/g'

# Fix common any[] to unknown[]
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/: any\[\]/: unknown[]/g'

# Fix MockedFunction types
find src/__tests__ -name "*.test.*" | xargs sed -i '' 's/as jest\.MockedFunction;/as jest.MockedFunction<typeof /g'

echo "✅ Basic any types fixed! Run lint to check remaining issues." 