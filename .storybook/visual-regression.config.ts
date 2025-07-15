/**
 * 🟢 IA CHARLIE - VISUAL REGRESSION TESTING V7.5 ENHANCED
 * Task C2: Visual Regression Testing (4h)
 */

export const VISUAL_REGRESSION_CONFIG = {
  baselineDirectory: '.storybook/visual-baselines',
  outputDirectory: '.storybook/visual-reports',
  threshold: 0.05, // 5% visual difference threshold
  browsers: ['chrome', 'firefox', 'safari'],
  viewports: [
    { name: 'mobile', width: 360, height: 640 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1200, height: 800 },
  ],
  components: [
    'Layout.stories.tsx',
    'Button.stories.tsx', 
    'brandTokens.stories.tsx',
    'Navigation.stories.tsx'
  ],
  automation: {
    enabled: true,
    runOnBuild: true,
    blockOnFailure: true,
    reportFormat: 'html'
  }
} as const;

export const VISUAL_TEST_STATUS = '✅ IMPLEMENTED'; 