import { defineConfig } from 'cypress';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync, writeFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false, // Disable video for faster execution
    screenshotOnRunFailure: true,
    screenshotsFolder: 'evidence/screenshots',
    videosFolder: 'evidence/videos',
    setupNodeEvents(on, config) {
      // Evidence collection setup
      on('task', {
        collectEvidence: (data) => {
          try {
            const evidenceDir = join(__dirname, 'evidence');
            
            if (!existsSync(evidenceDir)) {
              mkdirSync(evidenceDir, { recursive: true });
            }
            
            const evidencePackage = {
              timestamp: new Date().toISOString(),
              type: data.type,
              evidence: data.evidence,
              metrics: data.metrics || {},
              screenshots: data.screenshots || []
            };
            
            const filename = `evidence-${Date.now()}.json`;
            writeFileSync(
              join(evidenceDir, filename),
              JSON.stringify(evidencePackage, null, 2)
            );
            
            console.log(`[EVIDENCE] Evidence collected: ${filename}`);
            return evidencePackage;
          } catch (error) {
            console.error('[EVIDENCE] Error collecting evidence:', error);
            return { error: error.message };
          }
        },
        
        // Log collection task
        logMessage: (message) => {
          console.log(`[EVIDENCE] ${new Date().toISOString()}: ${message}`);
          return null;
        }
      });
      
      // Performance monitoring
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.name === 'chrome') {
          launchOptions.args.push('--disable-web-security');
          launchOptions.args.push('--disable-features=VizDisplayCompositor');
          launchOptions.args.push('--no-sandbox');
          launchOptions.args.push('--disable-dev-shm-usage');
          launchOptions.args.push('--disable-background-timer-throttling');
          launchOptions.args.push('--disable-backgrounding-occluded-windows');
          launchOptions.args.push('--disable-renderer-backgrounding');
        }
        return launchOptions;
      });
      
      // Evidence collection on test failure
      on('after:screenshot', (details) => {
        console.log('[EVIDENCE] Screenshot captured:', details.path);
        return details;
      });
      
      return config;
    },
  },
}); 