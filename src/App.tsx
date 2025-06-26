import React, { useEffect, useRef, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Core components (loaded synchronously for critical path)
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { PWAInstall } from './components/PWAInstall';
import ErrorBoundary from './components/ui/ErrorBoundary';

// Loading components
import { PageLoadingSpinner } from './components/ui/PageLoadingSpinner';

// Professional services
import { analyticsService } from './services/analyticsService';
import { clarityService } from './services/clarityService';
import { tallyService } from './services/tallyService';
import { config, isDevelopment, validateEnvironment } from './config/environment';
import { logger } from './utils/logger';
import { performanceService } from './services/performance';

// =============================================================================
// LAZY LOADED PAGES - CODE SPLITTING
// =============================================================================

// Lazy load all pages for optimal bundle splitting
const HomePage = React.lazy(() => 
  performanceService.measureFunction('load_HomePage', () => 
    import('./pages/HomePage').then(module => {
      logger.debug('HomePage lazy loaded', {}, 'CODE_SPLITTING');
      return module;
    })
  )
);

const GeneratorPage = React.lazy(() => 
  performanceService.measureFunction('load_GeneratorPage', () => 
    import('./pages/GeneratorPage').then(module => {
      logger.debug('GeneratorPage lazy loaded', {}, 'CODE_SPLITTING');
      return module;
    })
  )
);

const LoginPage = React.lazy(() => 
  performanceService.measureFunction('load_LoginPage', () => 
    import('./pages/LoginPage').then(module => {
      logger.debug('LoginPage lazy loaded', {}, 'CODE_SPLITTING');
      return module;
    })
  )
);

const SignupPage = React.lazy(() => 
  performanceService.measureFunction('load_SignupPage', () => 
    import('./pages/SignupPage').then(module => {
      logger.debug('SignupPage lazy loaded', {}, 'CODE_SPLITTING');
      return module;
    })
  )
);

const UserDashboardPage = React.lazy(() => 
  performanceService.measureFunction('load_UserDashboardPage', () => 
    import('./pages/UserDashboardPage').then(module => {
      logger.debug('UserDashboardPage lazy loaded', {}, 'CODE_SPLITTING');
      return module;
    })
  )
);

// =============================================================================
// PRELOADING STRATEGY
// =============================================================================

const preloadPages = () => {
  // Preload critical pages after initial load
  const preloadPromises = [
    import('./pages/GeneratorPage'),
    import('./pages/LoginPage'),
  ];
  
  // Preload user dashboard if authenticated
  if (localStorage.getItem('firebase:auth:user')) {
    preloadPromises.push(import('./pages/UserDashboardPage'));
  }
  
  Promise.all(preloadPromises).then(() => {
    logger.debug('Critical pages preloaded', {}, 'CODE_SPLITTING');
  }).catch(error => {
    logger.warn('Page preloading failed', { error }, 'CODE_SPLITTING');
  });
};

// =============================================================================
// MAIN APP COMPONENT
// =============================================================================

import './App.css';

const App: React.FC = () => {
  const initialized = useRef(false);

  useEffect(() => {
    // Prevent double initialization in React Strict Mode
    if (initialized.current) {
      logger.debug('App already initialized, skipping...', {}, 'APP');
      return;
    }
    
    initialized.current = true;
    
    // Record app initialization performance
    const initStartTime = performance.now();
    
    // Validate environment first
    const validation = validateEnvironment();
    if (!validation.valid) {
      logger.warn('Environment validation warnings detected', {
        errors: validation.errors,
        environment: config.environment
      }, 'APP');
    }

    logger.info('App initialization started', {
      environment: config.environment,
      version: config.version,
      debugMode: config.debugMode,
      timestamp: new Date().toISOString()
    }, 'APP');

    const initializeServices = async () => {
      try {
        // Initialize core services in parallel
        const servicePromises = [
          analyticsService.initialize().catch(err => ({ service: 'analytics', error: err })),
          clarityService.initialize().catch(err => ({ service: 'clarity', error: err })),
          tallyService.initialize().catch(err => ({ service: 'tally', error: err })),
        ];

        const results = await Promise.allSettled(servicePromises);
        
        // Process results
        const serviceStatus: Record<string, boolean> = {};
        const serviceErrors: string[] = [];

        results.forEach((result, index) => {
          const serviceName = ['analytics', 'clarity', 'tally'][index];
          
          if (result.status === 'fulfilled') {
            const value = result.value;
            if (value && typeof value === 'object' && 'error' in value) {
              serviceStatus[serviceName] = false;
              serviceErrors.push(`${serviceName}: ${value.error}`);
            } else {
              serviceStatus[serviceName] = true;
            }
          } else {
            serviceStatus[serviceName] = false;
            serviceErrors.push(`${serviceName}: ${result.reason}`);
          }
        });

        // Record initialization performance
        const initDuration = performance.now() - initStartTime;
        performanceService.recordMetric('app_initialization', initDuration, 'ms', 'loading', {
          servicesInitialized: Object.keys(serviceStatus).length,
          successfulServices: Object.values(serviceStatus).filter(Boolean).length,
        });

        // Log initialization results
        logger.info('Services initialization completed', {
          status: serviceStatus,
          successCount: Object.values(serviceStatus).filter(Boolean).length,
          totalCount: Object.keys(serviceStatus).length,
          errors: serviceErrors.length > 0 ? serviceErrors : undefined,
          duration: `${initDuration.toFixed(2)}ms`
        }, 'APP');

        // Preload pages after successful initialization
        setTimeout(preloadPages, 1000);

        // Expose debug services ONLY in development
        if (isDevelopment()) {
          logger.security('Exposing debug services for development', {
            environment: config.environment,
            services: Object.keys(serviceStatus)
          }, 'APP');

          (window as any).debugServices = {
            analytics: analyticsService,
            clarity: clarityService,
            tally: tallyService,
            performance: performanceService,
            config,
            
            // Utility functions
            getStatus: () => serviceStatus,
            getConfig: () => ({
              environment: config.environment,
              version: config.version,
              debugMode: config.debugMode
            }),
            validateEnv: () => validateEnvironment(),
            
            // Code splitting utilities
            preloadAllPages: () => {
              const allPages = [
                import('./pages/HomePage'),
                import('./pages/GeneratorPage'),
                import('./pages/LoginPage'),
                import('./pages/SignupPage'),
                import('./pages/UserDashboardPage'),
              ];
              return Promise.all(allPages);
            },
            
            // Testing utilities
            testServices: async () => {
              logger.info('Testing all services...', {}, 'DEBUG');
              const tests = await Promise.allSettled([
                analyticsService.trackEvent?.('debug_test', { source: 'debug_services' }),
                clarityService.trackEvent?.('debug_test'),
                tallyService.trackEvent?.('debug_test')
              ]);
              
              const testResults = tests.map((test, i) => ({
                service: ['analytics', 'clarity', 'tally'][i],
                success: test.status === 'fulfilled'
              }));
              
              logger.info('Service tests completed', { results: testResults }, 'DEBUG');
              return testResults;
            }
          };
          
          logger.debug('Debug services exposed globally', {
            services: Object.keys(serviceStatus),
            utilities: ['getStatus()', 'getConfig()', 'validateEnv()', 'testServices()', 'preloadAllPages()']
          }, 'APP');
        } else {
          logger.info('Production mode: Debug services not exposed', {
            environment: config.environment
          }, 'APP');
        }

      } catch (error) {
        logger.error('Critical error during service initialization', { 
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          environment: config.environment
        }, 'APP');
        
        // In production, we might want to send this to external monitoring
        if (!isDevelopment()) {
          // This would integrate with external error tracking
          console.error('CRITICAL: Service initialization failed in production', error);
        }
      }
    };

    // Run initialization
    initializeServices();

    // Cleanup function
    return () => {
      logger.debug('App cleanup initiated', {}, 'APP');
      initialized.current = false;
      
      // Clean up debug services in development
      if (isDevelopment() && (window as any).debugServices) {
        delete (window as any).debugServices;
        logger.debug('Debug services cleaned up', {}, 'APP');
      }
    };
  }, []); // Empty dependency array for one-time initialization

  return (
    <ErrorBoundary>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <div className="min-h-screen bg-background text-foreground">
            <ErrorBoundary isolateErrors>
              <Suspense fallback={<PageLoadingSpinner message="Carregando aplicação..." />}>
                <Routes>
                  <Route 
                    path="/" 
                    element={<HomePage />} 
                  />
                  <Route 
                    path="/generator" 
                    element={<GeneratorPage />} 
                  />
                  <Route 
                    path="/login" 
                    element={<LoginPage />} 
                  />
                  <Route 
                    path="/signup" 
                    element={<SignupPage />} 
                  />
                  <Route 
                    path="/dashboard" 
                    element={
                      <ProtectedRoute>
                        <UserDashboardPage />
                      </ProtectedRoute>
                    } 
                  />
                </Routes>
              </Suspense>
            </ErrorBoundary>
            
            <PWAInstall variant="banner" />
            
            <Toaster 
              position="top-right"
              toastOptions={{
                className: 'dark:bg-card dark:text-card-foreground',
                duration: 4000,
              }}
            />
          </div>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
};

// Wrapper for additional setup
const AppWrapper: React.FC = () => {
  return <App />;
};

export default AppWrapper;
