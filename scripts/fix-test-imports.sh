#!/bin/bash

echo "🔧 Fixing test imports..."

# Fix jest-dom imports
find src/__tests__ -name "*.test.*" -type f -exec sed -i '' "s/from '@testing-library\/jest-dom'/from '@jest\/globals'/g" {} \;

# Fix component imports based on their actual location
# Components in form/
sed -i '' "s/from '\.\/InputField'/from '..\/components\/form\/InputField'/g" src/__tests__/InputField.test.tsx
sed -i '' "s/from '\.\/SelectField'/from '..\/components\/form\/SelectField'/g" src/__tests__/SelectField.test.tsx
sed -i '' "s/from '\.\/TextareaField'/from '..\/components\/form\/TextareaField'/g" src/__tests__/TextareaField.test.tsx
sed -i '' "s/from '\.\/HybridSelectField'/from '..\/components\/form\/HybridSelectField'/g" src/__tests__/HybridSelectField.test.tsx
sed -i '' "s/from '\.\/PlatformSelector'/from '..\/components\/form\/PlatformSelector'/g" src/__tests__/PlatformSelector.test.tsx

# Components in ui/
sed -i '' "s/from '\.\/Button'/from '..\/components\/ui\/Button'/g" src/__tests__/Button.test.tsx

# Components in root
sed -i '' "s/from '\.\/Navbar'/from '..\/components\/Navbar'/g" src/__tests__/Navbar.test.tsx
sed -i '' "s/from '\.\/ScriptForm'/from '..\/components\/ScriptForm'/g" src/__tests__/ScriptForm.test.tsx
sed -i '' "s/from '\.\/EditableScriptArea'/from '..\/components\/EditableScriptArea'/g" src/__tests__/EditableScriptArea.test.tsx
sed -i '' "s/from '\.\/ShareButton'/from '..\/components\/ShareButton'/g" src/__tests__/ShareButton.test.tsx
sed -i '' "s/from '\.\/ProtectedRoute'/from '..\/components\/ProtectedRoute'/g" src/__tests__/ProtectedRoute.test.tsx
sed -i '' "s/from '\.\/PWAFeedback'/from '..\/components\/PWAFeedback'/g" src/__tests__/PWAFeedback.test.tsx
sed -i '' "s/from '\.\/PWAInstall'/from '..\/components\/PWAInstall'/g" src/__tests__/PWAInstall.test.tsx

# Components in editor/
sed -i '' "s/from '\.\/VoiceSynthesisPanel'/from '..\/components\/editor\/VoiceSynthesisPanel'/g" src/__tests__/VoiceSynthesisPanel.test.tsx

# Pages
sed -i '' "s/from '\.\/HomePage'/from '..\/pages\/HomePage'/g" src/__tests__/HomePage.test.tsx
sed -i '' "s/from '\.\/LoginPage'/from '..\/pages\/LoginPage'/g" src/__tests__/LoginPage.test.tsx
sed -i '' "s/from '\.\/SignupPage'/from '..\/pages\/SignupPage'/g" src/__tests__/SignupPage.test.tsx
sed -i '' "s/from '\.\/GeneratorPage'/from '..\/pages\/GeneratorPage'/g" src/__tests__/GeneratorPage.test.tsx
sed -i '' "s/from '\.\/UserDashboardPage'/from '..\/pages\/UserDashboardPage'/g" src/__tests__/UserDashboardPage.test.tsx

# Services
sed -i '' "s/from '\.\/clarityService'/from '..\/services\/clarityService'/g" src/__tests__/clarityService.test.ts
sed -i '' "s/from '\.\/tallyService'/from '..\/services\/tallyService'/g" src/__tests__/tallyService.test.ts

# Fix clearAlljest MockedFunctions
find src/__tests__ -name "*.test.*" -type f -exec sed -i '' "s/jest.clearAlljest.MockedFunctions()/jest.clearAllMocks()/g" {} \;

# Fix jest namespace issues
find src/__tests__ -name "*.test.*" -type f -exec sed -i '' "s/as jest.jest.MockedFunction/as jest.MockedFunction/g" {} \;

echo "✅ Test imports fixed!" 