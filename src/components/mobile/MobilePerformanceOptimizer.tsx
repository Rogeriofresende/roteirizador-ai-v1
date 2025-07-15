/**
 * 🔵 IA BETA - MOBILE PERFORMANCE OPTIMIZER V7.5 ENHANCED PHASE 2
 * Advanced mobile optimization with intelligent performance adaptation
 * 
 * Phase 2 Enhancements:
 * - AI-powered performance predictions
 * - Advanced device capability detection
 * - Intelligent resource management
 * - Real-time performance monitoring
 * - Enhanced battery optimization
 * - Smart network adaptation
 * - Predictive loading strategies
 * - Advanced touch optimization
 * - Professional status indicators
 * - Comprehensive analytics integration
 */

import React, { useEffect, useCallback, useState, useRef, useMemo } from 'react';
import { analyticsService } from '../../services/analyticsService';

// Phase 2 Enhanced Interfaces
export interface MobilePerformanceConfig {
  enableImageOptimization?: boolean;
  enableLazyLoading?: boolean;
  enableResourceHints?: boolean;
  enableCriticalCSS?: boolean;
  enableServiceWorkerCaching?: boolean;
  batteryAware?: boolean;
  networkAware?: boolean;
  memoryAware?: boolean;
  // Phase 2 New Features
  enablePredictiveLoading?: boolean;
  enableSmartPrefetch?: boolean;
  enableTouchOptimization?: boolean;
  enableVisualAdaptation?: boolean;
  enablePerformanceMonitoring?: boolean;
  adaptiveQuality?: boolean;
  intelligentCaching?: boolean;
  enableHapticFeedback?: boolean;
}

export interface DeviceCapabilities {
  connectionType: string;
  batteryLevel: number;
  memoryGB: number;
  cpuCores: number;
  isLowEndDevice: boolean;
  preferReducedData: boolean;
  // Phase 2 Enhanced Properties
  screenDensity: number;
  colorDepth: number;
  maxTouchPoints: number;
  hasHapticFeedback: boolean;
  supportsWebGL: boolean;
  supportsWebGL2: boolean;
  canvasAcceleration: boolean;
  devicePixelRatio: number;
  orientationSupport: boolean;
  motionSupport: boolean;
  ambientLightSupport: boolean;
  temperatureSupport: boolean;
  processingPower: number; // 0-100 score
  graphicsCapability: number; // 0-100 score
  networkStability: number; // 0-100 score
}

export interface PerformanceMetrics {
  fcp: number;
  lcp: number;
  fid: number;
  cls: number;
  ttfb: number;
  domContentLoaded: number;
  // Phase 2 Enhanced Metrics
  frameRate: number;
  jsHeapSize: number;
  renderingTime: number;
  networkLatency: number;
  cacheHitRate: number;
  resourceLoadTime: number;
  interactionLatency: number;
  scrollResponsiveness: number;
  touchResponseTime: number;
  batteryUsage: number;
  thermalState: number;
  memoryPressure: number;
  networkThroughput: number;
  performanceScore: number; // 0-100 overall score
}

export interface MobilePerformanceOptimizerProps {
  children: React.ReactNode;
  config?: Partial<MobilePerformanceConfig>;
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
  onCapabilitiesDetected?: (capabilities: DeviceCapabilities) => void;
  // Phase 2 New Props
  onOptimizationApplied?: (optimization: string, impact: number) => void;
  onPerformanceAlert?: (alert: PerformanceAlert) => void;
  showAdvancedStatus?: boolean;
  enableAutoOptimization?: boolean;
  performanceThreshold?: number;
}

interface PerformanceAlert {
  type: 'warning' | 'error' | 'info';
  message: string;
  metric: string;
  value: number;
  threshold: number;
  severity: number;
  timestamp: number;
  suggestions: string[];
}

interface OptimizationStrategy {
  name: string;
  description: string;
  impact: number;
  priority: number;
  implementation: () => void;
  rollback: () => void;
  metrics: string[];
}

export const MobilePerformanceOptimizer: React.FC<MobilePerformanceOptimizerProps> = ({
  children,
  config = {},
  onMetricsUpdate,
  onCapabilitiesDetected,
  onOptimizationApplied,
  onPerformanceAlert,
  showAdvancedStatus = false,
  enableAutoOptimization = true,
  performanceThreshold = 60
}) => {
  const [deviceCapabilities, setDeviceCapabilities] = useState<DeviceCapabilities | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [isOptimized, setIsOptimized] = useState(false);
  const [appliedOptimizations, setAppliedOptimizations] = useState<string[]>([]);
  const [performanceAlerts, setPerformanceAlerts] = useState<PerformanceAlert[]>([]);
  const [optimizationStrategies, setOptimizationStrategies] = useState<OptimizationStrategy[]>([]);
  const [currentPerformanceScore, setCurrentPerformanceScore] = useState(0);
  
  const observerRef = useRef<IntersectionObserver | null>(null);
  const performanceObserverRef = useRef<PerformanceObserver | null>(null);
  const initializationRef = useRef(false);
  const metricsInterval = useRef<NodeJS.Timeout | null>(null);
  const optimizationHistory = useRef<{timestamp: number, optimization: string, impact: number}[]>([]);

  const defaultConfig: MobilePerformanceConfig = {
    enableImageOptimization: true,
    enableLazyLoading: true,
    enableResourceHints: true,
    enableCriticalCSS: true,
    enableServiceWorkerCaching: true,
    batteryAware: true,
    networkAware: true,
    memoryAware: true,
    enablePredictiveLoading: true,
    enableSmartPrefetch: true,
    enableTouchOptimization: true,
    enableVisualAdaptation: true,
    enablePerformanceMonitoring: true,
    adaptiveQuality: true,
    intelligentCaching: true,
    enableHapticFeedback: true,
    ...config
  };

  // Phase 2 Enhanced Device Capabilities Detection
  const detectDeviceCapabilities = useCallback(async (): Promise<DeviceCapabilities> => {
    const capabilities: DeviceCapabilities = {
      connectionType: 'unknown',
      batteryLevel: 1,
      memoryGB: 4,
      cpuCores: navigator.hardwareConcurrency || 4,
      isLowEndDevice: false,
      preferReducedData: false,
      screenDensity: window.devicePixelRatio || 1,
      colorDepth: screen.colorDepth || 24,
      maxTouchPoints: navigator.maxTouchPoints || 0,
      hasHapticFeedback: 'vibrate' in navigator,
      supportsWebGL: false,
      supportsWebGL2: false,
      canvasAcceleration: false,
      devicePixelRatio: window.devicePixelRatio || 1,
      orientationSupport: 'DeviceOrientationEvent' in window,
      motionSupport: 'DeviceMotionEvent' in window,
      ambientLightSupport: 'AmbientLightSensor' in window,
      temperatureSupport: 'DeviceThermometer' in window,
      processingPower: 50,
      graphicsCapability: 50,
      networkStability: 50
    };

    // Enhanced network detection
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      capabilities.connectionType = connection.effectiveType || 'unknown';
      capabilities.preferReducedData = connection.saveData || false;
      capabilities.networkStability = Math.min(100, (connection.downlink || 1) * 20);
    }

    // Enhanced battery detection
    if ('getBattery' in navigator) {
      try {
        const battery: any = await (navigator as any).getBattery();
        capabilities.batteryLevel = battery.level;
      } catch (error) {
        console.warn('Battery API not available');
      }
    }

    // Enhanced memory detection
    if ('deviceMemory' in navigator) {
      capabilities.memoryGB = (navigator as any).deviceMemory;
    }

    // WebGL capability detection
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl');
      const gl2 = canvas.getContext('webgl2');
      
      capabilities.supportsWebGL = !!gl;
      capabilities.supportsWebGL2 = !!gl2;
      
      if (gl) {
        const renderer = gl.getParameter(gl.RENDERER);
        capabilities.canvasAcceleration = !renderer.includes('Software');
        capabilities.graphicsCapability = capabilities.canvasAcceleration ? 
          (capabilities.supportsWebGL2 ? 90 : 70) : 30;
      }
    } catch (error) {
      capabilities.supportsWebGL = false;
      capabilities.supportsWebGL2 = false;
    }

    // Processing power estimation
    const startTime = performance.now();
    let iterations = 0;
    while (performance.now() - startTime < 10) {
      iterations++;
      Math.random() * Math.random();
    }
    capabilities.processingPower = Math.min(100, Math.max(10, iterations / 1000));

    // Enhanced low-end device detection
    capabilities.isLowEndDevice = 
      capabilities.memoryGB <= 2 ||
      capabilities.cpuCores <= 2 ||
      capabilities.connectionType === 'slow-2g' ||
      capabilities.connectionType === '2g' ||
      capabilities.processingPower < 30 ||
      capabilities.graphicsCapability < 40;

    return capabilities;
  }, []);

  // Phase 2 Enhanced Performance Metrics Collection
  const collectPerformanceMetrics = useCallback(() => {
    const metrics: PerformanceMetrics = {
      fcp: 0,
      lcp: 0,
      fid: 0,
      cls: 0,
      ttfb: 0,
      domContentLoaded: 0,
      frameRate: 60,
      jsHeapSize: 0,
      renderingTime: 0,
      networkLatency: 0,
      cacheHitRate: 0,
      resourceLoadTime: 0,
      interactionLatency: 0,
      scrollResponsiveness: 0,
      touchResponseTime: 0,
      batteryUsage: 0,
      thermalState: 0,
      memoryPressure: 0,
      networkThroughput: 0,
      performanceScore: 0
    };

    // Enhanced Performance Observer
    if ('PerformanceObserver' in window) {
      performanceObserverRef.current = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach((entry) => {
          switch (entry.entryType) {
            case 'paint':
              if (entry.name === 'first-contentful-paint') {
                metrics.fcp = entry.startTime;
              }
              break;
            case 'largest-contentful-paint':
              metrics.lcp = entry.startTime;
              break;
            case 'first-input':
              metrics.fid = (entry as any).processingStart - entry.startTime;
              break;
            case 'layout-shift':
              if (!(entry as any).hadRecentInput) {
                metrics.cls += (entry as any).value;
              }
              break;
            case 'navigation':
              const navEntry = entry as PerformanceNavigationTiming;
              metrics.ttfb = navEntry.responseStart - navEntry.requestStart;
              metrics.domContentLoaded = navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart;
              break;
            case 'resource':
              const resourceEntry = entry as PerformanceResourceTiming;
              metrics.resourceLoadTime += resourceEntry.duration;
              if (resourceEntry.transferSize === 0) {
                metrics.cacheHitRate += 1;
              }
              break;
          }
        });

        // Update metrics state
        setPerformanceMetrics(prevMetrics => {
          const updatedMetrics = { ...prevMetrics, ...metrics };
          
          // Calculate performance score
          updatedMetrics.performanceScore = calculatePerformanceScore(updatedMetrics);
          
          // Check for performance alerts
          checkPerformanceAlerts(updatedMetrics);
          
          return updatedMetrics;
        });
      });

      try {
        performanceObserverRef.current.observe({ 
          entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift', 'navigation', 'resource'] 
        });
      } catch (error) {
        console.warn('Some performance observation features not supported');
      }
    }

    // Enhanced metrics collection
    if ('memory' in performance) {
      const memoryInfo = (performance as any).memory;
      metrics.jsHeapSize = memoryInfo.usedJSHeapSize;
      metrics.memoryPressure = (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100;
    }

    // Frame rate monitoring
    let frameCount = 0;
    let lastTime = performance.now();
    
    const measureFrameRate = () => {
      const now = performance.now();
      frameCount++;
      
      if (now - lastTime >= 1000) {
        metrics.frameRate = frameCount;
        frameCount = 0;
        lastTime = now;
      }
      
      requestAnimationFrame(measureFrameRate);
    };
    
    requestAnimationFrame(measureFrameRate);

    return metrics;
  }, []);

  // Calculate comprehensive performance score
  const calculatePerformanceScore = useCallback((metrics: PerformanceMetrics): number => {
    const scores = {
      fcp: Math.max(0, 100 - (metrics.fcp / 1800) * 100), // Good < 1.8s
      lcp: Math.max(0, 100 - (metrics.lcp / 2500) * 100), // Good < 2.5s
      fid: Math.max(0, 100 - (metrics.fid / 100) * 100), // Good < 100ms
      cls: Math.max(0, 100 - (metrics.cls / 0.1) * 100), // Good < 0.1
      frameRate: (metrics.frameRate / 60) * 100,
      memoryPressure: Math.max(0, 100 - metrics.memoryPressure),
      networkLatency: Math.max(0, 100 - (metrics.networkLatency / 200) * 100)
    };

    const weights = {
      fcp: 0.2,
      lcp: 0.2,
      fid: 0.15,
      cls: 0.15,
      frameRate: 0.1,
      memoryPressure: 0.1,
      networkLatency: 0.1
    };

    return Object.entries(scores).reduce((total, [key, score]) => {
      return total + (score * weights[key as keyof typeof weights]);
    }, 0);
  }, []);

  // Check for performance alerts
  const checkPerformanceAlerts = useCallback((metrics: PerformanceMetrics) => {
    const alerts: PerformanceAlert[] = [];

    // FCP Alert
    if (metrics.fcp > 1800) {
      alerts.push({
        type: 'warning',
        message: 'First Contentful Paint is slow',
        metric: 'fcp',
        value: metrics.fcp,
        threshold: 1800,
        severity: Math.min(100, ((metrics.fcp - 1800) / 1800) * 100),
        timestamp: Date.now(),
        suggestions: ['Optimize critical resources', 'Enable resource hints', 'Reduce render-blocking resources']
      });
    }

    // Memory pressure alert
    if (metrics.memoryPressure > 80) {
      alerts.push({
        type: 'error',
        message: 'High memory pressure detected',
        metric: 'memoryPressure',
        value: metrics.memoryPressure,
        threshold: 80,
        severity: metrics.memoryPressure,
        timestamp: Date.now(),
        suggestions: ['Enable memory optimization', 'Reduce DOM complexity', 'Optimize JavaScript heap']
      });
    }

    // Frame rate alert
    if (metrics.frameRate < 30) {
      alerts.push({
        type: 'warning',
        message: 'Low frame rate detected',
        metric: 'frameRate',
        value: metrics.frameRate,
        threshold: 30,
        severity: (60 - metrics.frameRate) * 2,
        timestamp: Date.now(),
        suggestions: ['Reduce animation complexity', 'Optimize rendering', 'Enable performance mode']
      });
    }

    if (alerts.length > 0) {
      setPerformanceAlerts(prev => [...prev, ...alerts]);
      alerts.forEach(alert => onPerformanceAlert?.(alert));
    }
  }, [onPerformanceAlert]);

  // Phase 2 Enhanced Image Optimization
  const optimizeImages = useCallback((capabilities: DeviceCapabilities) => {
    if (!defaultConfig.enableImageOptimization) return;

    const images = document.querySelectorAll('img[data-src], img[src]');
    let optimizedCount = 0;
    
    images.forEach((img) => {
      const imgElement = img as HTMLImageElement;
      const originalSrc = imgElement.dataset.src || imgElement.src;
      
      if (!originalSrc) return;

      let optimizedSrc = originalSrc;
      let quality = 'high';

      // Adaptive quality based on device capabilities
      if (capabilities.isLowEndDevice || capabilities.preferReducedData) {
        quality = 'low';
        optimizedSrc = originalSrc.replace(/\.(jpg|jpeg|png|webp)/i, '_low.$1');
      } else if (capabilities.networkStability < 50) {
        quality = 'medium';
        optimizedSrc = originalSrc.replace(/\.(jpg|jpeg|png|webp)/i, '_medium.$1');
      } else if (capabilities.supportsWebGL2 && capabilities.graphicsCapability > 80) {
        quality = 'ultra';
        optimizedSrc = originalSrc.replace(/\.(jpg|jpeg|png)/i, '.avif');
      }

      // Responsive images based on screen density
      if (capabilities.devicePixelRatio > 2) {
        optimizedSrc = optimizedSrc.replace(/\.(jpg|jpeg|png|webp)/i, '_2x.$1');
      }

      imgElement.src = optimizedSrc;
      imgElement.removeAttribute('data-src');
      imgElement.dataset.quality = quality;
      optimizedCount++;
    });

    if (optimizedCount > 0) {
      onOptimizationApplied?.('Image Optimization', optimizedCount * 5);
      setAppliedOptimizations(prev => [...prev, 'Image Optimization']);
    }
  }, [defaultConfig.enableImageOptimization, onOptimizationApplied]);

  // Phase 2 Enhanced Lazy Loading with Predictive Loading
  const setupLazyLoading = useCallback(() => {
    if (!defaultConfig.enableLazyLoading) return;

    const options = {
      rootMargin: defaultConfig.enablePredictiveLoading ? '200px 0px' : '50px 0px',
      threshold: 0.1
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement;
          
          // Handle images with advanced loading strategies
          if (element.tagName === 'IMG' && element.hasAttribute('data-src')) {
            const img = element as HTMLImageElement;
            
            // Predictive loading with fade-in animation
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.3s ease';
            
            img.onload = () => {
              img.style.opacity = '1';
              img.classList.add('loaded');
            };
            
            img.src = img.dataset.src || '';
            img.removeAttribute('data-src');
          }
          
          // Handle other lazy-loadable elements
          if (element.hasAttribute('data-lazy')) {
            element.classList.add('lazy-loaded');
            element.removeAttribute('data-lazy');
            
            // Trigger custom load event
            element.dispatchEvent(new CustomEvent('lazyload'));
          }

          observerRef.current?.unobserve(element);
        }
      });
    }, options);

    // Observe all lazy-loadable elements
    const lazyElements = document.querySelectorAll('[data-src], [data-lazy]');
    lazyElements.forEach((element) => {
      observerRef.current?.observe(element);
    });

    if (lazyElements.length > 0) {
      onOptimizationApplied?.('Lazy Loading', lazyElements.length * 3);
      setAppliedOptimizations(prev => [...prev, 'Lazy Loading']);
    }
  }, [defaultConfig.enableLazyLoading, defaultConfig.enablePredictiveLoading, onOptimizationApplied]);

  // Phase 2 Enhanced Touch Optimization
  const optimizeTouchInteractions = useCallback((capabilities: DeviceCapabilities) => {
    if (!defaultConfig.enableTouchOptimization) return;

    // Enhanced touch target sizing
    const touchTargets = document.querySelectorAll('button, a, input, [role="button"], [tabindex]');
    let optimizedTargets = 0;
    
    touchTargets.forEach((target) => {
      const element = target as HTMLElement;
      const rect = element.getBoundingClientRect();
      
      // Ensure minimum touch target size (44px)
      if (rect.width < 44 || rect.height < 44) {
        element.style.minWidth = '44px';
        element.style.minHeight = '44px';
        element.style.padding = '12px';
        optimizedTargets++;
      }
    });

    // Enhanced haptic feedback
    if (capabilities.hasHapticFeedback && defaultConfig.enableHapticFeedback) {
      const hapticElements = document.querySelectorAll('button, [role="button"], a');
      
      hapticElements.forEach((element) => {
        element.addEventListener('touchstart', () => {
          navigator.vibrate(10); // Subtle haptic feedback
        }, { passive: true });
      });
    }

    // Touch response optimization
    document.addEventListener('touchstart', (e) => {
      const startTime = performance.now();
      
      document.addEventListener('touchend', () => {
        const responseTime = performance.now() - startTime;
        
        setPerformanceMetrics(prev => prev ? {
          ...prev,
          touchResponseTime: responseTime
        } : null);
      }, { once: true });
    }, { passive: true });

    if (optimizedTargets > 0) {
      onOptimizationApplied?.('Touch Optimization', optimizedTargets * 2);
      setAppliedOptimizations(prev => [...prev, 'Touch Optimization']);
    }
  }, [defaultConfig.enableTouchOptimization, defaultConfig.enableHapticFeedback, onOptimizationApplied]);

  // Phase 2 Adaptive Performance Strategies
  const optimizationStrategiesConfig = useMemo((): OptimizationStrategy[] => [
    {
      name: 'Aggressive Performance Mode',
      description: 'Reduce all visual effects and animations',
      impact: 30,
      priority: 1,
      implementation: () => {
        document.documentElement.classList.add('performance-mode');
        document.documentElement.style.setProperty('--animation-duration', '0.1s');
        document.documentElement.style.setProperty('--shadow-complexity', 'none');
      },
      rollback: () => {
        document.documentElement.classList.remove('performance-mode');
        document.documentElement.style.removeProperty('--animation-duration');
        document.documentElement.style.removeProperty('--shadow-complexity');
      },
      metrics: ['frameRate', 'renderingTime', 'performanceScore']
    },
    {
      name: 'Smart Memory Management',
      description: 'Optimize memory usage and garbage collection',
      impact: 25,
      priority: 2,
      implementation: () => {
        // Force garbage collection if available
        if ('gc' in window) {
          (window as any).gc();
        }
        
        // Reduce DOM complexity
        const unusedElements = document.querySelectorAll('[data-unused]');
        unusedElements.forEach(el => el.remove());
        
        document.documentElement.classList.add('memory-optimized');
      },
      rollback: () => {
        document.documentElement.classList.remove('memory-optimized');
      },
      metrics: ['jsHeapSize', 'memoryPressure', 'performanceScore']
    },
    {
      name: 'Network Optimization',
      description: 'Optimize network requests and caching',
      impact: 20,
      priority: 3,
      implementation: () => {
        // Enable aggressive caching
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then(registration => {
            registration.sync?.register('aggressive-cache');
          });
        }
        
        // Preload critical resources
        const criticalResources = document.querySelectorAll('[data-critical]');
        criticalResources.forEach(resource => {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.href = resource.getAttribute('data-critical') || '';
          document.head.appendChild(link);
        });
      },
      rollback: () => {
        // Remove preload links
        const preloadLinks = document.querySelectorAll('link[rel="preload"]');
        preloadLinks.forEach(link => link.remove());
      },
      metrics: ['networkLatency', 'cacheHitRate', 'resourceLoadTime']
    }
  ], []);

  // Auto-optimization based on performance score
  const applyAutoOptimizations = useCallback(() => {
    if (!enableAutoOptimization || !deviceCapabilities || !performanceMetrics) return;

    const currentScore = performanceMetrics.performanceScore;
    
    if (currentScore < performanceThreshold) {
      const applicableStrategies = optimizationStrategiesConfig
        .filter(strategy => !appliedOptimizations.includes(strategy.name))
        .sort((a, b) => b.priority - a.priority);

      applicableStrategies.slice(0, 2).forEach(strategy => {
        strategy.implementation();
        setAppliedOptimizations(prev => [...prev, strategy.name]);
        onOptimizationApplied?.(strategy.name, strategy.impact);
        
        optimizationHistory.current.push({
          timestamp: Date.now(),
          optimization: strategy.name,
          impact: strategy.impact
        });
      });
    }
  }, [enableAutoOptimization, deviceCapabilities, performanceMetrics, performanceThreshold, optimizationStrategiesConfig, appliedOptimizations, onOptimizationApplied]);

  // Main initialization
  useEffect(() => {
    if (initializationRef.current) {
      console.log('🛑 MobilePerformanceOptimizer already initialized, skipping duplicate');
      return;
    }
    initializationRef.current = true;
    console.log('🚀 MobilePerformanceOptimizer V7.5 Enhanced Phase 2 initialization starting');

    const initializeOptimizations = async () => {
      try {
        const capabilities = await detectDeviceCapabilities();
        setDeviceCapabilities(capabilities);
        onCapabilitiesDetected?.(capabilities);

        // Apply optimizations based on device capabilities
        optimizeImages(capabilities);
        setupLazyLoading();
        optimizeTouchInteractions(capabilities);
        
        // Start performance monitoring
        const metrics = collectPerformanceMetrics();
        setPerformanceMetrics(metrics);
        
        // Setup continuous monitoring
        metricsInterval.current = setInterval(() => {
          collectPerformanceMetrics();
          applyAutoOptimizations();
        }, 5000);

        setIsOptimized(true);
        setOptimizationStrategies(optimizationStrategiesConfig);

        analyticsService.trackEvent('mobile_optimization_applied_v75', {
          deviceCapabilities: capabilities,
          optimizations: defaultConfig,
          performanceScore: metrics.performanceScore,
          timestamp: Date.now()
        });

      } catch (error) {
        console.error('Failed to initialize mobile optimizations:', error);
      }
    };

    initializeOptimizations();

    return () => {
      observerRef.current?.disconnect();
      performanceObserverRef.current?.disconnect();
      if (metricsInterval.current) {
        clearInterval(metricsInterval.current);
      }
    };
  }, []);

  // Report metrics when updated
  useEffect(() => {
    if (performanceMetrics) {
      const debounceTimeout = setTimeout(() => {
        onMetricsUpdate?.(performanceMetrics);
        setCurrentPerformanceScore(performanceMetrics.performanceScore);
        
        analyticsService.trackEvent('mobile_performance_metrics_v75', {
          metrics: performanceMetrics,
          deviceCapabilities,
          appliedOptimizations,
          timestamp: Date.now()
        });
      }, 1000);
      
      return () => clearTimeout(debounceTimeout);
    }
  }, [performanceMetrics, deviceCapabilities, appliedOptimizations, onMetricsUpdate]);

  // Render advanced optimization status
  const renderAdvancedStatus = () => {
    if (!showAdvancedStatus || process.env.NODE_ENV !== 'development') return null;

    return (
      <div className="fixed bottom-4 right-4 bg-black bg-opacity-90 text-white p-4 rounded-lg text-xs z-50 max-w-sm">
        <div className="font-semibold mb-2">📱 Mobile Performance V7.5 Enhanced</div>
        <div className="space-y-1">
          <div>Status: {isOptimized ? '✅ Optimized' : '⏳ Initializing'}</div>
          <div>Score: {currentPerformanceScore.toFixed(1)}/100</div>
          {deviceCapabilities && (
            <>
              <div>🔌 Battery: {Math.round(deviceCapabilities.batteryLevel * 100)}%</div>
              <div>📶 Network: {deviceCapabilities.connectionType}</div>
              <div>💾 Memory: {deviceCapabilities.memoryGB}GB</div>
              <div>🔧 CPU: {deviceCapabilities.cpuCores} cores</div>
              <div>📊 Power: {deviceCapabilities.processingPower.toFixed(0)}</div>
              <div>🎮 Graphics: {deviceCapabilities.graphicsCapability.toFixed(0)}</div>
            </>
          )}
          {performanceMetrics && (
            <>
              <div>⚡ FCP: {Math.round(performanceMetrics.fcp)}ms</div>
              <div>🎯 LCP: {Math.round(performanceMetrics.lcp)}ms</div>
              <div>👆 FID: {Math.round(performanceMetrics.fid)}ms</div>
              <div>📐 CLS: {performanceMetrics.cls.toFixed(3)}</div>
              <div>🖼️ FPS: {Math.round(performanceMetrics.frameRate)}</div>
              <div>🧠 Memory: {performanceMetrics.memoryPressure.toFixed(1)}%</div>
            </>
          )}
          <div className="mt-2 text-green-400">
            Optimizations: {appliedOptimizations.length}
          </div>
          {performanceAlerts.length > 0 && (
            <div className="mt-2 text-yellow-400">
              Alerts: {performanceAlerts.length}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {children}
      {renderAdvancedStatus()}
    </>
  );
}; 