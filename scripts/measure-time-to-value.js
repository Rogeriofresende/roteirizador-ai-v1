#!/usr/bin/env node

/**
 * V5.1 Time-to-Value Measurement Script
 * Mede o tempo desde o load inicial até o GeneratorPage estar interativo
 */

const { spawn } = require('child_process');
const puppeteer = require('puppeteer');

console.log('📊 V5.1 Time-to-Value Measurement');
console.log('==================================\n');

async function measureTimeToValue() {
  let devServer;
  
  try {
    // Start dev server
    console.log('🚀 Starting development server...');
    devServer = spawn('npm', ['run', 'dev'], {
      stdio: 'ignore',
      detached: false
    });
    
    // Wait for server to be ready
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('🌐 Launching browser...\n');
    
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Performance marks
    const metrics = {
      navigationStart: 0,
      firstPaint: 0,
      firstContentfulPaint: 0,
      domInteractive: 0,
      generatorPageLoaded: 0,
      firstInteraction: 0
    };
    
    // Monitor console logs
    page.on('console', msg => {
      if (msg.text().includes('GeneratorPage')) {
        console.log('✅ GeneratorPage loaded');
      }
    });
    
    console.log('📏 Measuring performance...\n');
    
    const startTime = Date.now();
    
    // Navigate to main page
    await page.goto('http://localhost:5173/', {
      waitUntil: 'networkidle0'
    });
    
    // Collect navigation timing
    const navigationTiming = await page.evaluate(() => {
      const timing = performance.timing;
      return {
        navigationStart: timing.navigationStart,
        domInteractive: timing.domInteractive - timing.navigationStart,
        loadComplete: timing.loadEventEnd - timing.navigationStart
      };
    });
    
    // Wait for GeneratorPage to be fully loaded
    await page.waitForSelector('h1', {
      timeout: 10000
    });
    
    const generatorLoadTime = Date.now() - startTime;
    
    // Measure time to first interaction
    const canInteract = await page.evaluate(() => {
      // Look for platform buttons and form inputs
      const platformButtons = document.querySelectorAll('button[type="button"]');
      const inputs = document.querySelectorAll('input, textarea');
      return platformButtons.length > 0 && inputs.length > 0;
    });
    
    const timeToInteractive = Date.now() - startTime;
    
    // Get Core Web Vitals
    const coreWebVitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        let metrics = {};
        
        // First Contentful Paint
        const paintEntries = performance.getEntriesByType('paint');
        const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        if (fcp) metrics.fcp = fcp.startTime;
        
        // Largest Contentful Paint
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          metrics.lcp = lastEntry.startTime;
        }).observe({ entryTypes: ['largest-contentful-paint'] });
        
        // First Input Delay (simulated)
        metrics.fid = 0; // Would need real user interaction
        
        // Cumulative Layout Shift
        let cls = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              cls += entry.value;
            }
          }
          metrics.cls = cls;
        }).observe({ entryTypes: ['layout-shift'] });
        
        setTimeout(() => resolve(metrics), 1000);
      });
    });
    
    await browser.close();
    
    // Display results
    console.log('📊 PERFORMANCE METRICS');
    console.log('=====================\n');
    
    console.log('⏱️  Time to First Interaction:');
    console.log(`   ${(timeToInteractive / 1000).toFixed(2)}s ${timeToInteractive < 5000 ? '✅' : '❌'} (Target: <5s)\n`);
    
    console.log('🎯 Key Milestones:');
    console.log(`   DOM Interactive: ${(navigationTiming.domInteractive / 1000).toFixed(2)}s`);
    console.log(`   Generator Loaded: ${(generatorLoadTime / 1000).toFixed(2)}s`);
    console.log(`   Ready for Input: ${(timeToInteractive / 1000).toFixed(2)}s\n`);
    
    console.log('🌐 Core Web Vitals:');
    console.log(`   FCP: ${coreWebVitals.fcp ? (coreWebVitals.fcp / 1000).toFixed(2) + 's' : 'N/A'}`);
    console.log(`   LCP: ${coreWebVitals.lcp ? (coreWebVitals.lcp / 1000).toFixed(2) + 's' : 'N/A'}`);
    console.log(`   CLS: ${coreWebVitals.cls ? coreWebVitals.cls.toFixed(3) : 'N/A'}\n`);
    
    const success = timeToInteractive < 5000;
    
    console.log(success ? 
      '✅ SUCCESS: Time-to-value target achieved!' : 
      '❌ FAILED: Time-to-value exceeds 5 second target'
    );
    
    process.exit(success ? 0 : 1);
    
  } catch (error) {
    console.error('❌ Error during measurement:', error.message);
    process.exit(1);
  } finally {
    if (devServer) {
      devServer.kill();
    }
  }
}

// Check if puppeteer is installed
try {
  require.resolve('puppeteer');
  measureTimeToValue();
} catch (e) {
  console.log('📦 Installing puppeteer...');
  const install = spawn('npm', ['install', '--save-dev', 'puppeteer'], {
    stdio: 'inherit'
  });
  
  install.on('close', (code) => {
    if (code === 0) {
      measureTimeToValue();
    } else {
      console.error('❌ Failed to install puppeteer');
      process.exit(1);
    }
  });
} 