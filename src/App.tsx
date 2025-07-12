import React, { useEffect, useRef, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// TypeScript declaration for global window extensions
declare global {
  interface Window {
    debugServices?: {
      analytics: typeof import('./services/analyticsService').analyticsService;
      clarity: typeof import('./services/clarityService').clarityService;
      tally: typeof import('./services/tallyService').tallyService;
      performance: typeof import('./services/performance').performanceService;
      config: typeof import('./config/environment').config;
      getStatus: () => Record<string, boolean>;
      getConfig: () => { environment: string; version: string; debugMode: boolean };
      validateEnv: () => ReturnType<typeof import('./config/environment').validateEnvironment>;
      preloadAllPages: () => Promise<unknown[]>;
      testServices: () => Promise<Array<{ service: string; success: boolean }>>;
    };
  }
}

// Core components (loaded synchronously for critical path)
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { PWAInstall } from './components/PWAInstall';
import ErrorBoundary from './components/ui/ErrorBoundary';
import { suppressThirdPartyErrors } from './utils/thirdPartyErrorSuppressor';

// Loading components
import { PageLoadingSpinner } from './components/ui/PageLoadingSpinner';

// Professional services
import { analyticsService } from './services/analyticsService';
import { clarityService } from './services/clarityService';
import { tallyService } from './services/tallyService';
import { config, isDevelopment, validateEnvironment } from './config/environment';
import { logger } from './utils/logger';
import { performanceService } from './services/performance';
import { initializeErrorCapture, cleanupErrorCapture } from './utils/errorCapture';

// V6.4 Week 2: DI System Integration - MAIS ROBUSTO COM ERROR HANDLING
import { 
  initializeServiceSystem, 
  disposeServiceSystem, 
  getSystemStatus,
  Services
} from './services';

// =============================================================================
// LAZY LOADED PAGES - CODE SPLITTING
// =============================================================================

// Lazy load all pages for optimal bundle splitting
const HomePage = React.lazy(() => 
  performanceService.measureFunction('load_HomePage', () => 
    import('./pages/HomePage').then(module => {
      logger.log('debug', 'HomePage lazy loaded', {}, 'CODE_SPLITTING');
      return module;
    })
  )
);

const GeneratorPage = React.lazy(() => 
  performanceService.measureFunction('load_GeneratorPage', () => 
    import('./pages/GeneratorPage').then(module => {
      // 🚀 WEEK 7: Preload related AI chunks when GeneratorPage loads
      import('./services/geminiService');
      import('./services/multiAIService');
      import('./components/ScriptForm');
      logger.log('debug', 'GeneratorPage lazy loaded with AI dependencies preloaded', {}, 'CODE_SPLITTING');
      return module;
    })
  )
);

const LoginPage = React.lazy(() => 
  performanceService.measureFunction('load_LoginPage', () => 
    import('./pages/LoginPage').then(module => {
      logger.log('debug', 'LoginPage lazy loaded', {}, 'CODE_SPLITTING');
      return module;
    })
  )
);

const SignupPage = React.lazy(() => 
  performanceService.measureFunction('load_SignupPage', () => 
    import('./pages/SignupPage').then(module => {
      logger.log('debug', 'SignupPage lazy loaded', {}, 'CODE_SPLITTING');
      return module;
    })
  )
);

const SimpleUserDashboard = React.lazy(() => 
  performanceService.measureFunction('load_SimpleUserDashboard', () => 
    import('./pages/SimpleUserDashboard').then(module => {
      // 🚀 WEEK 7: Preload dashboard-related chunks
      import('./services/projectService');
      import('./services/analyticsService');
      import('./components/dashboard/ProjectCard');
      logger.log('debug', 'SimpleUserDashboard lazy loaded with dashboard dependencies preloaded', {}, 'CODE_SPLITTING');
      return module;
    })
  )
);

const AdminDashboard = React.lazy(() => 
  performanceService.measureFunction('load_AdminDashboard', () => 
    import('./pages/AdminDashboard').then(module => {
      // 🚀 WEEK 7: Preload admin-related chunks  
      import('./services/adminService');
      import('./services/systemHealthService');
      import('./components/admin/ErrorDashboard');
      logger.log('debug', 'AdminDashboard lazy loaded with admin dependencies preloaded', {}, 'CODE_SPLITTING');
      return module;
    })
  )
);

const ErrorCaptureTest = React.lazy(() => 
  performanceService.measureFunction('load_ErrorCaptureTest', () => 
    import('./pages/ErrorCaptureTest').then(module => {
      logger.log('debug', 'ErrorCaptureTest lazy loaded', {}, 'CODE_SPLITTING');
      return module;
    })
  )
);

const BancoDeIdeias = React.lazy(() => 
  performanceService.measureFunction('load_BancoDeIdeias', () => 
    import('./pages/BancoDeIdeias').then(module => {
      logger.log('debug', 'BancoDeIdeias lazy loaded', {}, 'CODE_SPLITTING');
      return module;
    })
  )
);

// =============================================================================
// PRELOADING STRATEGY
// =============================================================================

const preloadPages = () => {
  // 🚀 WEEK 7: INTELLIGENT PRELOADING STRATEGY
  const preloadPromises = [];
  
  // Priority 1: Critical path - Generator page (main functionality)
  preloadPromises.push(
    import('./pages/GeneratorPage').then(() => 
      logger.log('debug', 'GeneratorPage preloaded', {}, 'CODE_SPLITTING')
    )
  );
  
  // Priority 2: User authentication state determines next preloads
  const isAuthenticated = localStorage.getItem('firebase:auth:user');
  
  if (isAuthenticated) {
    // Authenticated users: preload dashboard and related services
    preloadPromises.push(
      import('./pages/SimpleUserDashboard').then(() => 
        logger.log('debug', 'SimpleUserDashboard preloaded for authenticated user', {}, 'CODE_SPLITTING')
      )
    );
    
    // Preload dashboard services
    preloadPromises.push(
      Promise.all([
        import('./services/projectService'),
        import('./services/analyticsService'),
        import('./components/dashboard/ProjectCard')
      ]).then(() => 
        logger.log('debug', 'Dashboard services preloaded', {}, 'CODE_SPLITTING')
      )
    );
  } else {
    // Non-authenticated users: preload auth flow
    preloadPromises.push(
      import('./pages/LoginPage').then(() => 
        logger.log('debug', 'LoginPage preloaded for non-authenticated user', {}, 'CODE_SPLITTING')
      )
    );
  }
  
  // Priority 3: Homepage (marketing/about) - lowest priority
  setTimeout(() => {
    import('./pages/HomePage').then(() => 
      logger.log('debug', 'HomePage preloaded (deferred)', {}, 'CODE_SPLITTING')
    );
  }, 2000);
  
  // 🚀 WEEK 7: Conditional admin preloading based on user role
  if (isAuthenticated) {
    try {
      const userData = JSON.parse(localStorage.getItem('firebase:auth:user') || '{}');
      const userEmail = userData.email || '';
      
      // Check if user might be admin (basic heuristic)
      if (userEmail.includes('admin') || userEmail.includes('support') || userEmail.includes('@roteirar')) {
        setTimeout(() => {
          import('./pages/AdminDashboard').then(() => 
            logger.log('debug', 'AdminDashboard preloaded for potential admin user', {}, 'CODE_SPLITTING')
          );
        }, 3000);
      }
    } catch (error) {
      logger.log('debug', 'Could not parse user data for admin preload', { error }, 'CODE_SPLITTING');
    }
  }
  
  Promise.allSettled(preloadPromises).then((results) => {
    const successful = results.filter(result => result.status === 'fulfilled').length;
    const total = results.length;
    
    logger.log('info', 'Intelligent preloading completed', {
      successful,
      total,
      successRate: `${Math.round((successful / total) * 100)}%`,
      isAuthenticated: !!isAuthenticated,
      strategy: 'Week 7 Performance Optimization'
    }, 'CODE_SPLITTING');
  });
};

// =============================================================================
// MAIN APP COMPONENT
// =============================================================================

import './App.css';
import './styles/BancoDeIdeias.css';

const App: React.FC = () => {
  const initialized = useRef(false);

  useEffect(() => {
    // Prevent double initialization in React Strict Mode
    if (initialized.current) {
      logger.log('debug', 'App already initialized, skipping...', {}, 'APP');
      return;
    }
    
    initialized.current = true;
    
    // 🔍 V6.4: Initialize Error Capture System FIRST - FIX: Usar systemLog
    initializeErrorCapture();
    logger.log('info', 'Error Capture System V6.4 initialized - Enhanced with whitelist', {}, 'APP');
    
    // 🛡️ THIRD-PARTY ERROR SUPPRESSION
    // Initialize global error suppression for scripts like Microsoft Clarity
    const cleanupErrorSuppressor = suppressThirdPartyErrors();
    logger.log('debug', 'Third-party error suppression activated', {
      patterns: ['clarity.ms', 'Cannot read properties of undefined', 's05cslzjy5'],
      status: 'active'
    }, 'APP');
    
    // Record app initialization performance
    const initStartTime = performance.now();
    
    // Validate environment first
    const validation = validateEnvironment();
    if (!validation.valid) {
      logger.log('warn', 'Environment validation warnings detected', {
        errors: validation.errors,
        environment: config.environment
      }, 'APP');
    }

    logger.log('info', 'App initialization started', {
      environment: config.environment,
      version: config.version,
      debugMode: config.debugMode,
      timestamp: new Date().toISOString()
    }, 'APP');

    const initializeServices = async () => {
      try {
        // V6.4 Week 2: Initialize DI Container System first - COM FALLBACK SEGURO
        logger.log('info', 'Initializing DI Container System V6.4...', {}, 'APP');
        
        let diResult;
        try {
          diResult = await initializeServiceSystem();
        } catch (diError) {
          // FALLBACK: Se DI System falhar, continuar com sistema legado
          logger.log('warn', 'DI System initialization failed, using legacy fallback', {
            error: diError instanceof Error ? diError.message : 'Unknown error'
          }, 'APP');
          
          diResult = {
            success: false,
            errors: ['DI System unavailable, using legacy services'],
            registeredServices: 0,
            initializedServices: 0
          };
        }
        
        if (!diResult.success) {
          logger.log('warn', 'DI System initialization had issues', {
            errors: diResult.errors,
            registeredServices: diResult.registeredServices,
            initializedServices: diResult.initializedServices
          }, 'APP');
        }

        // Initialize legacy services in parallel (maintaining backward compatibility)
        const legacyServicePromises = [
          analyticsService.initialize().catch(err => ({ service: 'analytics', error: err })),
          clarityService.initialize().catch(err => ({ service: 'clarity', error: err })),
          tallyService.initialize().catch(err => ({ service: 'tally', error: err })),
        ];

        const legacyResults = await Promise.allSettled(legacyServicePromises);
        
        // Process legacy results
        const serviceStatus: Record<string, boolean> = {};
        const serviceErrors: string[] = [...diResult.errors];

        legacyResults.forEach((result, index) => {
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
          servicesInitialized: Object.keys(serviceStatus).length + diResult.registeredServices,
          successfulServices: Object.values(serviceStatus).filter(Boolean).length + diResult.initializedServices,
          diSystemEnabled: true,
          registeredServices: diResult.registeredServices,
          initializedServices: diResult.initializedServices
        });

        // 🔧 V6.4: Enhanced logging with DI system status
        logger.log('info', 'Services initialization completed with DI System V6.4', {
          diSystem: {
            success: diResult.success,
            registeredServices: diResult.registeredServices,
            initializedServices: diResult.initializedServices
          },
          legacyServices: {
            status: serviceStatus,
            successCount: Object.values(serviceStatus).filter(Boolean).length,
            totalCount: Object.keys(serviceStatus).length
          },
          errors: serviceErrors.length > 0 ? serviceErrors : undefined,
          duration: `${initDuration.toFixed(2)}ms`
        }, 'APP');

        // Preload pages after successful initialization
        setTimeout(preloadPages, 1000);

        // Expose debug services ONLY in development - CORRIGIDO isDevelopment
        if (isDevelopment) {
          logger.log('warn', 'Exposing debug services with DI System for development', {
            environment: config.environment,
            services: Object.keys(serviceStatus),
            diSystemEnabled: true
          }, 'APP');

          window.debugServices = {
            // Legacy services (backward compatibility)
            analytics: analyticsService,
            clarity: clarityService,
            tally: tallyService,
            performance: performanceService,
            config,
            
            // V6.4 Week 2: DI System debug utilities - COM FALLBACK SEGURO
            DI: {
              getSystemStatus: async () => {
                try {
                  return await getSystemStatus();
                } catch (error) {
                  return { error: 'DI System not available', available: false };
                }
              },
              Services: Services || {},
              getSystemHealth: () => {
                try {
                  return Services?.getSystemHealth?.() || { status: 'unavailable' };
                } catch (error) {
                  return { status: 'error', error: error instanceof Error ? error.message : 'Unknown error' };
                }
              },
              getStats: () => {
                try {
                  return Services?.getStats?.() || { status: 'unavailable' };
                } catch (error) {
                  return { status: 'error', error: error instanceof Error ? error.message : 'Unknown error' };
                }
              }
            },
            
            // Utility functions
            getStatus: () => serviceStatus,
            getConfig: () => ({
              environment: config.environment,
              version: config.version,
              debugMode: config.debugMode,
              diSystemEnabled: true
            }),
            validateEnv: () => validateEnvironment(),
            
            // Code splitting utilities
            preloadAllPages: () => {
              const allPages = [
                import('./pages/HomePage'),
                import('./pages/GeneratorPage'),
                import('./pages/LoginPage'),
                import('./pages/SignupPage'),
                import('./pages/SimpleUserDashboard'),
              ];
              return Promise.all(allPages);
            },
            
            // Enhanced testing utilities with DI - COM FALLBACK SEGURO
            testServices: async () => {
              logger.log('info', 'Testing all services (legacy + DI)...', {}, 'DEBUG');
              
              // Test legacy services
              const legacyTests = await Promise.allSettled([
                analyticsService.trackEvent?.('debug_test', { source: 'debug_services' }),
                clarityService.trackEvent?.('debug_test'),
                tallyService.trackEvent?.('debug_test')
              ]);
              
              const legacyResults = legacyTests.map((test, i) => ({
                service: ['analytics', 'clarity', 'tally'][i],
                success: test.status === 'fulfilled',
                type: 'legacy'
              }));
              
              // Test DI system - COM FALLBACK
              let diResults = [];
              try {
                const diStatus = await getSystemStatus();
                diResults = [{
                  service: 'DI_System',
                  success: diStatus.initialized && diStatus.health.overall === 'healthy',
                  type: 'di',
                  details: diStatus
                }];
              } catch (error) {
                diResults = [{
                  service: 'DI_System',
                  success: false,
                  type: 'di',
                  error: error instanceof Error ? error.message : 'DI System unavailable'
                }];
              }
              
              const allResults = [...legacyResults, ...diResults];
              
              logger.log('info', 'Service tests completed (legacy + DI)', { 
                results: allResults
              }, 'DEBUG');
              
              return allResults;
            }
          };
          
          logger.log('debug', 'Debug services exposed globally', {
            services: Object.keys(serviceStatus),
            utilities: ['getStatus()', 'getConfig()', 'validateEnv()', 'testServices()', 'preloadAllPages()']
          }, 'APP');
        } else {
          logger.log('info', 'Production mode: Debug services not exposed', {
            environment: config.environment
          }, 'APP');
        }

      } catch (error: unknown) {
        logger.error('Critical error during service initialization', { 
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          environment: config.environment
        }, 'APP');
        
        // In production, we might want to send this to external monitoring
        if (!isDevelopment) {
          // This would integrate with external error tracking
          console.error('CRITICAL: Service initialization failed in production', error);
        }
      }
    };

    // Run initialization
    initializeServices();

    // Cleanup function
    return () => {
      logger.log('debug', 'App cleanup initiated', {}, 'APP');
      initialized.current = false;
      
      // 🔍 V6.4: Cleanup error capture system
      cleanupErrorCapture();
      logger.log('debug', 'Error capture system cleaned up', {}, 'APP');
      
      // 🛡️ Cleanup error suppression
      cleanupErrorSuppressor();
      logger.log('debug', 'Third-party error suppression cleaned up', {}, 'APP');
      
      // V6.4 Week 2: Dispose DI Container System - COM FALLBACK SEGURO
      disposeServiceSystem().then(() => {
        logger.log('debug', 'DI Container System disposed', {}, 'APP');
      }).catch(error => {
        logger.log('warn', 'Error disposing DI Container System (may not be available)', { 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }, 'APP');
      });
      
      // Clean up debug services in development - CORRIGIDO isDevelopment
      if (isDevelopment && window.debugServices) {
        delete window.debugServices;
        logger.log('debug', 'Debug services cleaned up', {}, 'APP');
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
                  {/* V5.1 CRITICAL: Direct access to main functionality - NO AUTH REQUIRED */}
                  <Route 
                    path="/" 
                    element={<GeneratorPage />} 
                  />
                  {/* WEEK 1: Banco de Ideias - Nueva Feature */}
                  <Route 
                    path="/banco-ideias" 
                    element={<BancoDeIdeias />} 
                  />
                  {/* V5.1: Marketing/About moved to secondary routes */}
                  <Route 
                    path="/home" 
                    element={<HomePage />} 
                  />
                  <Route 
                    path="/about" 
                    element={<HomePage />} 
                  />
                  {/* V5.1: Keep generator route for backward compatibility */}
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
                        <SimpleUserDashboard />
                      </ProtectedRoute>
                    } 
                  />
                  {/* V6.2: Admin Dashboard com Intelligence */}
                  <Route 
                    path="/admin" 
                    element={
                      <ProtectedRoute>
                        <AdminDashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/error-capture-test" 
                    element={<ErrorCaptureTest />} 
                  />
                  <Route 
                    path="/status" 
                    element={
                      <React.Suspense fallback={<PageLoadingSpinner />}>
                        {React.createElement(React.lazy(() => import('./pages/SystemStatus').then(m => ({ default: m.SystemStatus }))))}
                      </React.Suspense>
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
