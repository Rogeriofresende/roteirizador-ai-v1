#!/usr/bin/env node

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function validateFixes() {
  console.log('🔍 Validating Error Fixes...');
  
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    const errors = [];
    
    // Capturar erros do console
    page.on('error', (err) => {
      errors.push({
        type: 'page-error',
        message: err.message,
        stack: err.stack
      });
    });
    
    page.on('pageerror', (err) => {
      errors.push({
        type: 'page-error',
        message: err.message,
        stack: err.stack
      });
    });
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push({
          type: 'console-error',
          message: msg.text(),
          location: msg.location()
        });
      }
    });
    
    // Testar HomePage
    console.log('📄 Testing HomePage...');
    await page.goto('http://localhost:5174/', { waitUntil: 'networkidle2' });
    
    // Aguardar carregamento completo
    await page.waitForTimeout(3000);
    
    // Testar interações básicas
    try {
      await page.click('button', { timeout: 5000 });
      console.log('✅ HomePage interactions working');
    } catch (e) {
      console.log('⚠️  HomePage interactions limited:', e.message);
    }
    
    // Testar GeneratorPage
    console.log('📄 Testing GeneratorPage...');
    try {
      await page.goto('http://localhost:5174/generator', { waitUntil: 'networkidle2' });
      await page.waitForTimeout(2000);
      console.log('✅ GeneratorPage loaded successfully');
    } catch (e) {
      console.log('⚠️  GeneratorPage issues:', e.message);
    }
    
    // Resultados
    const report = {
      timestamp: new Date().toISOString(),
      totalErrors: errors.length,
      errors: errors,
      pwaFixed: errors.filter(e => e.message.includes('React Error #321')).length === 0,
      nullReferenceFixed: errors.filter(e => e.message.includes('Cannot read property name of undefined')).length === 0,
      status: errors.length === 0 ? 'ALL_FIXED' : 'SOME_ERRORS_REMAIN'
    };
    
    // Salvar relatório
    const reportPath = path.join(__dirname, '..', 'logs', 'validation-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n📊 VALIDATION REPORT');
    console.log('====================');
    console.log(`Total errors found: ${errors.length}`);
    console.log(`PWA Error #321 fixed: ${report.pwaFixed ? '✅' : '❌'}`);
    console.log(`Null reference fixed: ${report.nullReferenceFixed ? '✅' : '❌'}`);
    console.log(`Overall status: ${report.status}`);
    
    if (errors.length > 0) {
      console.log('\n🚨 REMAINING ERRORS:');
      errors.forEach((error, i) => {
        console.log(`${i + 1}. ${error.type}: ${error.message}`);
      });
    }
    
    console.log(`\n📄 Full report saved to: ${reportPath}`);
    
    return report;
    
  } catch (error) {
    console.error('❌ Validation failed:', error);
    return { status: 'VALIDATION_FAILED', error: error.message };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  validateFixes().then(report => {
    process.exit(report.status === 'ALL_FIXED' ? 0 : 1);
  });
}

export default validateFixes; 