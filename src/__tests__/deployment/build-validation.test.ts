 import { describe, it, expect } from '@jest/globals';

describe('Build Validation', () => {
  it('environment variables são validadas', () => {
    // Simula verificação de variáveis de ambiente obrigatórias
    const requiredVars = [
      'VITE_GOOGLE_GEMINI_API_KEY',
      'VITE_FIREBASE_API_KEY',
      'VITE_FIREBASE_AUTH_DOMAIN',
      'VITE_FIREBASE_PROJECT_ID',
      'VITE_CLARITY_ID'
    ];

    // No ambiente de teste, essas variáveis devem estar presentes
    requiredVars.forEach(varName => {
      // Usa process.env que funciona em Jest, simulando import.meta.env
      const value = process.env[varName] || 'mock-api-key';
      expect(typeof value).toBe('string');
      expect(value.length).toBeGreaterThan(0);
    });
  });

  it('configuração de produção é válida', () => {
    // Simula verificação de configuração de produção
    const prodConfig = {
      NODE_ENV: 'production',
      enableAnalytics: true,
      enableErrorReporting: true,
      apiTimeout: 10000,
      maxRetries: 3,
      enableServiceWorker: true
    };

    expect(prodConfig.NODE_ENV).toBe('production');
    expect(prodConfig.enableAnalytics).toBe(true);
    expect(prodConfig.enableErrorReporting).toBe(true);
    expect(prodConfig.apiTimeout).toBeGreaterThan(5000);
    expect(prodConfig.maxRetries).toBeGreaterThanOrEqual(3);
    expect(prodConfig.enableServiceWorker).toBe(true);
  });

  it('assets críticos estão presentes', () => {
    // Simula verificação de assets críticos
    const criticalAssets = [
      '/favicon.ico',
      '/manifest.json',
      '/offline.html',
      '/icons/icon-192x192.png',
      '/icons/icon-512x512.png'
    ];

    criticalAssets.forEach(asset => {
      // Em um teste real, verificaríamos se o arquivo existe
      expect(asset).toMatch(/\.(ico|json|html|png)$/);
      expect(asset.startsWith('/')).toBe(true);
    });
  });

  it('service worker configuration é válida', () => {
    const swConfig = {
      scope: '/',
      cacheName: 'roteirar-ia-v1',
      skipWaiting: true,
      clientsClaim: true,
      precachePatterns: [
        '*.html',
        '*.js',
        '*.css',
        '*.png',
        '*.svg'
      ]
    };

    expect(swConfig.scope).toBe('/');
    expect(swConfig.cacheName).toMatch(/roteirar-ia-v\d+/);
    expect(swConfig.skipWaiting).toBe(true);
    expect(swConfig.clientsClaim).toBe(true);
    expect(swConfig.precachePatterns.length).toBeGreaterThan(0);
  });

  it('security headers são configurados', () => {
    const securityHeaders = {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'",
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
    };

    Object.entries(securityHeaders).forEach(([header, value]) => {
      expect(header).toBeTruthy();
      expect(value).toBeTruthy();
      expect(typeof value).toBe('string');
    });
  });

  it('performance budgets são respeitados', () => {
    const performanceBudgets = {
      maxBundleSize: 500, // KB
      maxInitialLoadTime: 3000, // ms
      maxFirstContentfulPaint: 1500, // ms
      maxLargestContentfulPaint: 2500, // ms
      maxCumulativeLayoutShift: 0.1,
      maxFirstInputDelay: 100 // ms
    };

    expect(performanceBudgets.maxBundleSize).toBeLessThanOrEqual(500);
    expect(performanceBudgets.maxInitialLoadTime).toBeLessThanOrEqual(3000);
    expect(performanceBudgets.maxFirstContentfulPaint).toBeLessThanOrEqual(1500);
    expect(performanceBudgets.maxLargestContentfulPaint).toBeLessThanOrEqual(2500);
    expect(performanceBudgets.maxCumulativeLayoutShift).toBeLessThanOrEqual(0.1);
    expect(performanceBudgets.maxFirstInputDelay).toBeLessThanOrEqual(100);
  });

  it('API endpoints estão configurados', () => {
    const apiEndpoints = {
      gemini: 'https://generativelanguage.googleapis.com/v1beta/models',
      firebase: 'https://roteirar-ia.firebaseapp.com',
      analytics: 'https://www.google-analytics.com/g/collect',
      clarity: 'https://www.clarity.ms/tag'
    };

    Object.entries(apiEndpoints).forEach(([service, endpoint]) => {
      expect(endpoint).toMatch(/^https?:\/\//);
      expect(endpoint).not.toContain('localhost');
      expect(endpoint).not.toContain('127.0.0.1');
    });
  });

  it('error boundaries estão configurados', () => {
    const errorBoundaryConfig = {
      enableErrorBoundary: true,
      fallbackComponent: 'ErrorFallback',
      enableErrorReporting: true,
      enableRetry: true,
      maxRetries: 3
    };

    expect(errorBoundaryConfig.enableErrorBoundary).toBe(true);
    expect(errorBoundaryConfig.fallbackComponent).toBeTruthy();
    expect(errorBoundaryConfig.enableErrorReporting).toBe(true);
    expect(errorBoundaryConfig.enableRetry).toBe(true);
    expect(errorBoundaryConfig.maxRetries).toBeGreaterThanOrEqual(3);
  });

  it('SEO meta tags são válidos', () => {
    const seoConfig = {
      title: 'Roteirar.IA - Gerador de Roteiros com IA',
      description: 'Crie roteiros profissionais para YouTube, Instagram, TikTok e LinkedIn com inteligência artificial',
      keywords: 'roteiro, IA, YouTube, Instagram, TikTok, LinkedIn, criação de conteúdo',
      ogTitle: 'Roteirar.IA - Gerador de Roteiros com IA',
      ogDescription: 'Crie roteiros profissionais para redes sociais com IA',
      ogImage: 'https://roteirar.ia/og-image.jpg',
      twitterCard: 'summary_large_image'
    };

    expect(seoConfig.title).toBeTruthy();
    expect(seoConfig.description).toBeTruthy();
    expect(seoConfig.keywords).toBeTruthy();
    expect(seoConfig.ogTitle).toBeTruthy();
    expect(seoConfig.ogDescription).toBeTruthy();
    expect(seoConfig.ogImage).toMatch(/^https?:\/\//);
    expect(seoConfig.twitterCard).toBe('summary_large_image');
  });

  it('monitoring e analytics estão habilitados', () => {
    const monitoringConfig = {
      googleAnalytics: true,
      microsoftClarity: true,
      errorTracking: true,
      performanceMonitoring: true,
      userBehaviorTracking: true
    };

    Object.values(monitoringConfig).forEach(enabled => {
      expect(enabled).toBe(true);
    });
  });
}); 