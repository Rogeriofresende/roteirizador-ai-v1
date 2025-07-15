#!/usr/bin/env node

/**
 * Debug Script para Storybook - Metodologia V8.0
 * Análise sistemática de erros console e network
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 STORYBOOK ERROR DEBUGGER - V8.0');
console.log('=====================================');

// 1. Verificar configuração do Storybook
function checkStorybookConfig() {
  console.log('\n📋 1. CHECKING STORYBOOK CONFIGURATION...');
  
  const configFiles = [
    '.storybook/main.ts',
    '.storybook/preview.ts',
    'package.json'
  ];
  
  configFiles.forEach(file => {
    const exists = fs.existsSync(file);
    console.log(`  ${exists ? '✅' : '❌'} ${file}`);
    
    if (exists && file.endsWith('.ts')) {
      const content = fs.readFileSync(file, 'utf8');
      const hasErrors = content.includes('undefined') || content.includes('null');
      if (hasErrors) {
        console.log(`    ⚠️  Possible undefined references in ${file}`);
      }
    }
  });
}

// 2. Verificar stories com problemas
function checkStoriesFiles() {
  console.log('\n📚 2. SCANNING STORIES FILES...');
  
  const storiesPattern = /\.stories\.(ts|tsx|js|jsx)$/;
  
  function scanDirectory(dir) {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    files.forEach(file => {
      const fullPath = path.join(dir, file.name);
      
      if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
        scanDirectory(fullPath);
      } else if (file.isFile() && storiesPattern.test(file.name)) {
        console.log(`  📖 Found story: ${fullPath}`);
        
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          
          // Check for common issues
          const issues = [];
          
          // More precise detection of undefined imports (not legitimate undefined usage)
          const importUndefinedPattern = /import.*undefined/i;
          const exportUndefinedPattern = /export.*undefined/i;
          
          if (importUndefinedPattern.test(content) || exportUndefinedPattern.test(content)) {
            issues.push('Undefined import/export detected');
          }
          
          if (content.includes('export default') && !content.includes('Meta')) {
            issues.push('Missing Meta type');
          }
          
          // More precise detection of undefined component in meta
          const componentUndefinedPattern = /component:\s*undefined/;
          if (componentUndefinedPattern.test(content)) {
            issues.push('Undefined component in meta');
          }
          
          if (issues.length > 0) {
            console.log(`    ⚠️  Issues found:`);
            issues.forEach(issue => console.log(`      - ${issue}`));
          } else {
            console.log(`    ✅ No obvious issues`);
          }
          
        } catch (error) {
          console.log(`    ❌ Error reading file: ${error.message}`);
        }
      }
    });
  }
  
  scanDirectory('src');
}

// 3. Verificar logs de erro
function analyzeLogs() {
  console.log('\n📊 3. ANALYZING ERROR LOGS...');
  
  const logFiles = [
    'logs/browser-errors.json',
    'logs/error-analysis.json'
  ];
  
  logFiles.forEach(logFile => {
    if (fs.existsSync(logFile)) {
      console.log(`  📄 Reading ${logFile}...`);
      
      try {
        const content = JSON.parse(fs.readFileSync(logFile, 'utf8'));
        
        if (content.errors) {
          const reactErrors = content.errors.filter(e => 
            e.message && e.message.includes('React.jsx: type is invalid')
          );
          
          const templateErrors = content.errors.filter(e => 
            e.message && e.message.includes('templates em destaque')
          );
          
          console.log(`    🔴 React JSX errors: ${reactErrors.length}`);
          console.log(`    🔴 Template errors: ${templateErrors.length}`);
          
          if (reactErrors.length > 0) {
            console.log(`    First React error:`, reactErrors[0].message);
          }
          
          if (templateErrors.length > 0) {
            console.log(`    First template error:`, templateErrors[0].message);
          }
        }
        
      } catch (error) {
        console.log(`    ❌ Error parsing log: ${error.message}`);
      }
    } else {
      console.log(`  ⚠️  Log file not found: ${logFile}`);
    }
  });
}

// 4. Recomendar correções
function recommendFixes() {
  console.log('\n🛠️  4. RECOMMENDED FIXES...');
  
  console.log(`
Based on the analysis, here are the recommended fixes:

1. TEMPLATE SERVICE ERRORS:
   - Firebase is not configured in Storybook environment
   - Mock templates should be returned instead
   - Check firebaseConfig.ts for proper fallbacks

2. REACT JSX ERRORS:
   - Components are being rendered as undefined
   - Check import/export statements in stories
   - Verify all components have proper default exports

3. NETWORK ERRORS:
   - API calls failing in Storybook environment
   - Add proper mocking for external services
   - Configure Storybook to handle missing APIs

4. CONSOLE WARNINGS:
   - Services disabled warnings are expected in dev
   - Consider suppressing non-critical warnings
   - Add proper environment detection
  `);
}

// Executar análise
checkStorybookConfig();
checkStoriesFiles();
analyzeLogs();
recommendFixes();

console.log('\n✅ DEBUG ANALYSIS COMPLETE');
console.log('====================================='); 