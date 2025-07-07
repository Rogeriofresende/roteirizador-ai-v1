#!/bin/bash

echo "🔧 Smart Any Types Fix - Phase 2"
echo "================================"

# 1. Fix Firebase Timestamp types
echo "📅 Fixing Firebase Timestamp types..."
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/createdAt: any;/createdAt: Timestamp;/g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/updatedAt: any;/updatedAt: Timestamp;/g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/lastModified: any;/lastModified: Timestamp;/g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/timestamp: any;/timestamp: Timestamp;/g'

# 2. Fix error handlers
echo "⚠️ Fixing error handlers..."
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/catch (error: any)/catch (error: unknown)/g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/} catch (error) {/} catch (error: unknown) {/g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/error: any/error: unknown/g'

# 3. Fix event handlers
echo "🎯 Fixing event handlers..."
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/onChange: (value: any)/onChange: (value: string | number)/g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/onClick: (e: any)/onClick: (e: React.MouseEvent)/g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/onSubmit: (data: any)/onSubmit: (data: Record<string, unknown>)/g'

# 4. Fix Record<string, any> to Record<string, unknown>
echo "📦 Fixing Record types..."
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/Record<string, any>/Record<string, unknown>/g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/properties: any/properties: Record<string, unknown>/g'

# 5. Fix array types
echo "📋 Fixing array types..."
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/: any\[\]/: unknown[]/g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/Array<any>/Array<unknown>/g'

# 6. Fix specific React types
echo "⚛️ Fixing React types..."
find src -name "*.tsx" | xargs sed -i '' 's/children: any/children: React.ReactNode/g'
find src -name "*.tsx" | xargs sed -i '' 's/ref: any/ref: React.Ref<HTMLElement>/g'

# 7. Fix validation constraint types
echo "✅ Fixing validation types..."
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/constraint: any;/constraint: string | number | RegExp | ValidationFunction;/g'

# 8. Fix data types for common patterns
echo "💾 Fixing data types..."
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/data: any;/data: unknown;/g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/value: any;/value: unknown;/g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/result: any;/result: unknown;/g'

# 9. Fix jest mock types
echo "🧪 Fixing test types..."
find src/__tests* -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/jest.fn() as any/jest.fn() as jest.MockedFunction<any>/g'
find src/__tests* -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/as any as/as unknown as/g'

# 10. Add Timestamp import where needed
echo "📥 Adding missing imports..."
for file in $(grep -l "Timestamp" src/**/*.ts src/**/*.tsx 2>/dev/null | grep -v "from.*firebase"); do
  if ! grep -q "import.*Timestamp.*from.*firebase" "$file"; then
    # Check if there's already a firebase/firestore import
    if grep -q "from.*firebase/firestore" "$file"; then
      # Add Timestamp to existing import
      sed -i '' 's/from "@firebase\/firestore";/, Timestamp } from "@firebase\/firestore";/g' "$file"
      sed -i '' "s/from 'firebase\/firestore';/, Timestamp } from 'firebase\/firestore';/g" "$file"
    else
      # Add new import at the beginning after other imports
      sed -i '' '1,/^import/s/^import/import { Timestamp } from "firebase\/firestore";\
import/' "$file"
    fi
  fi
done

echo "✅ Smart Any Types Fix Complete!"
echo "📊 Check results with: npm run lint | grep no-explicit-any | wc -l" 