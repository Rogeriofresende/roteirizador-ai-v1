import React, { useEffect, useCallback, useState, useRef } from 'react';
import { analyticsService } from '../../services/analyticsService';

export interface MobilePerformanceConfig {
  enableImageOptimization?: boolean;
  enableLazyLoading?: boolean;
  enableResourceHints?: boolean;
  enableCriticalCSS?: boolean;
  enableServiceWorkerCaching?: boolean;
  batteryAware?: boolean;
  networkAware?: boolean;
  memoryAware?: boolean;
}

export interface DeviceCapabilities {
  connectionType: 'slow-2g' | '2g' | '3g' | '4g' | 'unknown';
  batteryLevel: number;
  memoryGB: number;
  cpuCores: number;
  isLowEndDevice: boolean;
  preferReducedData: boolean;
}

export interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
  domContentLoaded: number;
}

interface MobilePerformanceOptimizerProps {
  children: React.ReactNode;
  config?: MobilePerformanceConfig;
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
  onCapabilitiesDetected?: (capabilities: DeviceCapabilities) => void;
}

export const MobilePerformanceOptimizer: React.FC<MobilePerformanceOptimizerProps> = ({
  children,
  config = {},
  onMetricsUpdate,
  onCapabilitiesDetected
}) => {
  const [deviceCapabilities, setDeviceCapabilities] = useState<DeviceCapabilities | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [isOptimized, setIsOptimized] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const performanceObserverRef = useRef<PerformanceObserver | null>(null);

  const defaultConfig: MobilePerformanceConfig = {
    enableImageOptimization: true,
    enableLazyLoading: true,
    enableResourceHints: true,
    enableCriticalCSS: true,
    enableServiceWorkerCaching: true,
    batteryAware: true,
    networkAware: true,
    memoryAware: true,
    ...config
  };

  // Detect device capabilities
  const detectDeviceCapabilities = useCallback(async (): Promise<DeviceCapabilities> => {
    const capabilities: DeviceCapabilities = {
      connectionType: 'unknown',
      batteryLevel: 1,
      memoryGB: 4,
      cpuCores: navigator.hardwareConcurrency || 4,
      isLowEndDevice: false,
      preferReducedData: false
    };

    // Network detection
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      capabilities.connectionType = connection.effectiveType || 'unknown';
      capabilities.preferReducedData = connection.saveData || false;
    }

    // Battery detection
    if ('getBattery' in navigator) {
      try {
        const battery: any = await (navigator as any).getBattery();
        capabilities.batteryLevel = battery.level;
      } catch (error) {
        console.warn('Battery API not available');
      }
    }

    // Memory detection
    if ('deviceMemory' in navigator) {
      capabilities.memoryGB = (navigator as any).deviceMemory;
    }

    // Low-end device detection
    capabilities.isLowEndDevice = 
      capabilities.memoryGB <= 2 ||
      capabilities.cpuCores <= 2 ||
      capabilities.connectionType === 'slow-2g' ||
      capabilities.connectionType === '2g';

    return capabilities;
  }, []);

  // Optimize images based on device capabilities
  const optimizeImages = useCallback((capabilities: DeviceCapabilities) => {
    if (!defaultConfig.enableImageOptimization) return;

    const images = document.querySelectorAll('img[data-src]');
    
    images.forEach((img) => {
      const imgElement = img as HTMLImageElement;
      const originalSrc = imgElement.dataset.src;
      
      if (!originalSrc) return;

      let optimizedSrc = originalSrc;

      // Apply different optimization based on device capabilities
      if (capabilities.isLowEndDevice || capabilities.preferReducedData) {
        // Use lower quality images for low-end devices
        optimizedSrc = originalSrc.replace(/\.(jpg|jpeg|png|webp)/i, '_low.$1');
      } else if (capabilities.connectionType === '4g' && capabilities.memoryGB >= 4) {
        // Use high-quality images for capable devices
        optimizedSrc = originalSrc.replace(/\.(jpg|jpeg|png)/i, '.webp');
      }

      imgElement.src = optimizedSrc;
      imgElement.removeAttribute('data-src');
    });
  }, [defaultConfig.enableImageOptimization]);

  // Setup lazy loading
  const setupLazyLoading = useCallback(() => {
    if (!defaultConfig.enableLazyLoading) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;
            
            // Handle images
            if (element.tagName === 'IMG' && element.hasAttribute('data-src')) {
              const img = element as HTMLImageElement;
              img.src = img.dataset.src || '';
              img.removeAttribute('data-src');
              img.classList.add('loaded');
            }
            
            // Handle other lazy-loadable elements
            if (element.hasAttribute('data-lazy')) {
              element.classList.add('lazy-loaded');
              element.removeAttribute('data-lazy');
            }

            observerRef.current?.unobserve(element);
          }
        });
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.1
      }
    );

    // Observe all lazy-loadable elements
    document.querySelectorAll('[data-src], [data-lazy]').forEach((element) => {
      observerRef.current?.observe(element);
    });
  }, [defaultConfig.enableLazyLoading]);

  // Add resource hints
  const addResourceHints = useCallback((capabilities: DeviceCapabilities) => {
    if (!defaultConfig.enableResourceHints) return;

    const head = document.head;

    // DNS prefetching for external resources
    const dnsPrefetchUrls = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://api.gemini.com'
    ];

    dnsPrefetchUrls.forEach((url) => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = url;
      head.appendChild(link);
    });

    // Preload critical resources based on device capabilities
    if (!capabilities.isLowEndDevice) {
      const criticalResources = [
        { href: '/fonts/inter-var.woff2', as: 'font', type: 'font/woff2' },
        { href: '/icons/sprite.svg', as: 'image' }
      ];

      criticalResources.forEach(({ href, as, type }) => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = href;
        link.as = as;
        if (type) link.type = type;
        if (as === 'font') link.crossOrigin = 'anonymous';
        head.appendChild(link);
      });
    }
  }, [defaultConfig.enableResourceHints]);

  // Apply critical CSS optimization
  const applyCriticalCSS = useCallback((capabilities: DeviceCapabilities) => {
    if (!defaultConfig.enableCriticalCSS) return;

    // For low-end devices, inline critical CSS and defer non-critical
    if (capabilities.isLowEndDevice) {
      const nonCriticalSheets = document.querySelectorAll('link[rel="stylesheet"]:not([data-critical])');
      
      nonCriticalSheets.forEach((sheet) => {
        const link = sheet as HTMLLinkElement;
        link.media = 'print';
        link.onload = () => {
          link.media = 'all';
        };
      });
    }
  }, [defaultConfig.enableCriticalCSS]);

  // Collect performance metrics
  const collectPerformanceMetrics = useCallback(() => {
    if ('PerformanceObserver' in window) {
      performanceObserverRef.current = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach((entry) => {
          if (entry.entryType === 'paint' || entry.entryType === 'largest-contentful-paint') {
            setPerformanceMetrics(prev => ({
              ...prev!,
              fcp: entry.entryType === 'paint' && entry.name === 'first-contentful-paint' ? entry.startTime : prev?.fcp || 0,
              lcp: entry.entryType === 'largest-contentful-paint' ? entry.startTime : prev?.lcp || 0
            }));
          }

          if (entry.entryType === 'first-input') {
            setPerformanceMetrics(prev => ({
              ...prev!,
              fid: (entry as any).processingStart - entry.startTime
            }));
          }

          if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
            setPerformanceMetrics(prev => ({
              ...prev!,
              cls: (prev?.cls || 0) + (entry as any).value
            }));
          }

          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            setPerformanceMetrics(prev => ({
              ...prev!,
              ttfb: navEntry.responseStart - navEntry.requestStart,
              domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart
            }));
          }
        });
      });

      // Observe different types of performance entries
      try {
        performanceObserverRef.current.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift', 'navigation'] });
      } catch (error) {
        console.warn('Some performance observation features not supported');
      }
    }

    // Fallback for basic metrics
    setTimeout(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        setPerformanceMetrics({
          fcp: 0,
          lcp: 0,
          fid: 0,
          cls: 0,
          ttfb: navigation.responseStart - navigation.requestStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart
        });
      }
    }, 1000);
  }, []);

  // Battery-aware optimizations
  const applyBatteryOptimizations = useCallback((capabilities: DeviceCapabilities) => {
    if (!defaultConfig.batteryAware) return;

    if (capabilities.batteryLevel < 0.2) {
      // Low battery: reduce animations and effects
      document.body.classList.add('low-battery-mode');
      
      // Disable non-essential animations
      const style = document.createElement('style');
      style.textContent = `
        .low-battery-mode * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      `;
      document.head.appendChild(style);
    }
  }, [defaultConfig.batteryAware]);

  // Network-aware optimizations
  const applyNetworkOptimizations = useCallback((capabilities: DeviceCapabilities) => {
    if (!defaultConfig.networkAware) return;

    if (capabilities.connectionType === 'slow-2g' || capabilities.connectionType === '2g' || capabilities.preferReducedData) {
      // Slow network: enable data saver mode
      document.body.classList.add('data-saver-mode');
      
      // Disable autoplay videos
      document.querySelectorAll('video[autoplay]').forEach((video) => {
        (video as HTMLVideoElement).removeAttribute('autoplay');
        (video as HTMLVideoElement).preload = 'none';
      });

      // Reduce image quality
      document.querySelectorAll('img').forEach((img) => {
        if (!img.dataset.originalSrc) {
          img.dataset.originalSrc = img.src;
          img.src = img.src.replace(/\.(jpg|jpeg|png)/i, '_compressed.$1');
        }
      });
    }
  }, [defaultConfig.networkAware]);

  // Initialize optimizations
  useEffect(() => {
    const initializeOptimizations = async () => {
      try {
        const capabilities = await detectDeviceCapabilities();
        setDeviceCapabilities(capabilities);
        onCapabilitiesDetected?.(capabilities);

        // Apply optimizations based on device capabilities
        optimizeImages(capabilities);
        addResourceHints(capabilities);
        applyCriticalCSS(capabilities);
        applyBatteryOptimizations(capabilities);
        applyNetworkOptimizations(capabilities);
        
        // Setup lazy loading
        setupLazyLoading();
        
        // Collect performance metrics
        collectPerformanceMetrics();

        setIsOptimized(true);

        analyticsService.trackEvent('mobile_optimization_applied', {
          deviceCapabilities: capabilities,
          optimizations: defaultConfig,
          timestamp: Date.now()
        });

      } catch (error) {
        console.error('Failed to initialize mobile optimizations:', error);
      }
    };

    initializeOptimizations();

    // Cleanup
    return () => {
      observerRef.current?.disconnect();
      performanceObserverRef.current?.disconnect();
    };
  }, []);

  // Report metrics when updated
  useEffect(() => {
    if (performanceMetrics) {
      onMetricsUpdate?.(performanceMetrics);
      
      analyticsService.trackEvent('mobile_performance_metrics', {
        metrics: performanceMetrics,
        deviceCapabilities,
        timestamp: Date.now()
      });
    }
  }, [performanceMetrics, deviceCapabilities, onMetricsUpdate]);

  // Render optimization indicators for development
  const renderOptimizationStatus = () => {
    if (process.env.NODE_ENV !== 'development') return null;

    return (
      <div className="fixed bottom-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded text-xs z-50">
        <div>📱 Mobile Optimized: {isOptimized ? '✅' : '⏳'}</div>
        {deviceCapabilities && (
          <>
            <div>🔌 Battery: {Math.round(deviceCapabilities.batteryLevel * 100)}%</div>
            <div>📶 Network: {deviceCapabilities.connectionType}</div>
            <div>💾 Memory: {deviceCapabilities.memoryGB}GB</div>
            <div>🔧 CPU: {deviceCapabilities.cpuCores} cores</div>
          </>
        )}
        {performanceMetrics && (
          <>
            <div>⚡ FCP: {Math.round(performanceMetrics.fcp)}ms</div>
            <div>🎯 LCP: {Math.round(performanceMetrics.lcp)}ms</div>
            <div>👆 FID: {Math.round(performanceMetrics.fid)}ms</div>
          </>
        )}
      </div>
    );
  };

  return (
    <>
      {children}
      {renderOptimizationStatus()}
    </>
  );
}; 