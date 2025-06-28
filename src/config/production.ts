// Production Configuration for Roteirar IA
// Security, monitoring, and performance settings

export interface ProductionConfig {
  security: {
    enableCSP: boolean;
    enableHSTS: boolean;
    enableRateLimit: boolean;
    maxRequestsPerMinute: number;
  };
  monitoring: {
    enablePerformanceTracking: boolean;
    enableErrorReporting: boolean;
    enableHealthChecks: boolean;
    metricsEndpoint?: string;
  };
  caching: {
    enableServiceWorker: boolean;
    cacheStrategy: 'network-first' | 'cache-first' | 'stale-while-revalidate';
    maxCacheSize: number; // MB
  };
  deployment: {
    environment: 'production' | 'staging' | 'development';
    version: string;
    buildTimestamp: number;
  };
}

export const productionConfig: ProductionConfig = {
  security: {
    enableCSP: true,
    enableHSTS: true,
    enableRateLimit: true,
    maxRequestsPerMinute: 100
  },
  monitoring: {
    enablePerformanceTracking: true,
    enableErrorReporting: true,
    enableHealthChecks: true,
    metricsEndpoint: '/api/metrics'
  },
  caching: {
    enableServiceWorker: true,
    cacheStrategy: 'stale-while-revalidate',
    maxCacheSize: 50 // 50MB
  },
  deployment: {
    environment: process.env.NODE_ENV === 'production' ? 'production' : 'staging',
    version: 'v2.1.0-phase6',
    buildTimestamp: Date.now()
  }
};

// Security headers configuration
export const securityHeaders = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://generativelanguage.googleapis.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://generativelanguage.googleapis.com https://api.vercel.com",
    "frame-ancestors 'none'"
  ].join('; '),
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-XSS-Protection': '1; mode=block'
};

// Performance monitoring thresholds
export const performanceThresholds = {
  LCP: { warning: 2500, critical: 4000 }, // Largest Contentful Paint (ms)
  FID: { warning: 100, critical: 300 },   // First Input Delay (ms)
  CLS: { warning: 0.1, critical: 0.25 },  // Cumulative Layout Shift
  TTFB: { warning: 800, critical: 1800 }, // Time to First Byte (ms)
  bundleSize: { warning: 500, critical: 1000 } // KB
};

// Error reporting configuration
export const errorReportingConfig = {
  enabled: process.env.NODE_ENV === 'production',
  maxErrors: 50, // Max errors to store locally
  batchSize: 10, // Errors to send in each batch
  endpoint: '/api/errors',
  sensitiveKeys: ['password', 'token', 'secret', 'key'] // Keys to redact
};

// Health check endpoints
export const healthCheckEndpoints = [
  {
    name: 'Frontend Application',
    url: '/',
    method: 'HEAD' as const,
    timeout: 5000,
    expectedStatus: [200, 304]
  },
  {
    name: 'Service Worker',
    url: '/sw.js',
    method: 'HEAD' as const,
    timeout: 3000,
    expectedStatus: [200]
  }
];

// Deployment verification
export const verifyProductionReadiness = (): boolean => {
  const checks = [
    process.env.NODE_ENV === 'production',
    productionConfig.security.enableCSP,
    productionConfig.monitoring.enablePerformanceTracking,
    productionConfig.caching.enableServiceWorker
  ];
  
  return checks.every(Boolean);
};

// Initialize production settings
export const initializeProduction = () => {
  if (typeof window === 'undefined') return;
  
  // Set up global error handling
  if (errorReportingConfig.enabled) {
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
      // Send to error reporting service
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      // Send to error reporting service
    });
  }
  
  // Apply security headers (client-side validation)
  if (productionConfig.security.enableCSP) {
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = securityHeaders['Content-Security-Policy'];
    document.head.appendChild(meta);
  }
  
  if (process.env.NODE_ENV === 'development') {
    // Only log in development for debugging
    console.log('🚀 Production configuration initialized', {
      version: productionConfig.deployment.version,
      environment: productionConfig.deployment.environment,
      security: productionConfig.security.enableCSP,
      monitoring: productionConfig.monitoring.enablePerformanceTracking
    });
  }
};

// Export for use in other modules
export default productionConfig; 