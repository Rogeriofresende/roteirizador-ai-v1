import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Zap, 
  Clock, 
  Gauge, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Monitor,
  Smartphone,
  Wifi,
  WifiOff,
  ChevronDown,
  ChevronUp,
  Settings,
  X
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { performanceService } from '../../services/performance';

// Core Web Vitals Types
interface WebVitalsData {
  LCP: number | null; // Largest Contentful Paint
  INP: number | null; // Interaction to Next Paint
  CLS: number | null; // Cumulative Layout Shift
  FCP: number | null; // First Contentful Paint
  TTFB: number | null; // Time to First Byte
}

interface PerformanceMetric {
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  benchmark: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
}

interface NetworkInfo {
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
}

interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  memory: number;
  cores: number;
  bandwidth: 'fast' | 'medium' | 'slow';
}

// Performance Monitor Component
export const AdvancedPerformanceMonitor: React.FC<{
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  autoOptimize?: boolean;
  showDetails?: boolean;
  onOptimization?: (optimization: string) => void;
}> = ({ 
  position = 'bottom-right', 
  autoOptimize = true, 
  showDetails = false,
  onOptimization 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [webVitals, setWebVitals] = useState<WebVitalsData>({
    LCP: null,
    INP: null,
    CLS: null,
    FCP: null,
    TTFB: null
  });
  
  const [performanceScore, setPerformanceScore] = useState<number>(0);
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [optimizations, setOptimizations] = useState<string[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  
  const intervalRef = useRef<NodeJS.Timeout>();
  const observerRef = useRef<PerformanceObserver>();

  // Initialize performance monitoring
  useEffect(() => {
    initializeMonitoring();
    detectDeviceCapabilities();
    detectNetworkConditions();
    
    return () => {
      cleanup();
    };
  }, []);

  // Auto-optimize based on performance
  useEffect(() => {
    if (autoOptimize && performanceScore < 70) {
      applyPerformanceOptimizations();
    }
  }, [performanceScore, autoOptimize]);

  const initializeMonitoring = useCallback(() => {
    // Set up interval to collect metrics
    intervalRef.current = setInterval(() => {
      collectWebVitals();
    }, 2000);

    // Set up Performance Observer for real-time metrics
    if ('PerformanceObserver' in window) {
      observerRef.current = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'largest-contentful-paint') {
            setWebVitals(prev => ({ ...prev, LCP: entry.startTime }));
          }
          if (entry.entryType === 'layout-shift') {
            const layoutShift = entry as any;
            if (!layoutShift.hadRecentInput) {
              setWebVitals(prev => ({ 
                ...prev, 
                CLS: (prev.CLS || 0) + layoutShift.value 
              }));
            }
          }
        });
      });

      try {
        observerRef.current.observe({ 
          entryTypes: ['largest-contentful-paint', 'layout-shift'] 
        });
      } catch (error) {
        console.warn('Performance Observer not fully supported:', error);
      }
    }
  }, []);

  const collectWebVitals = useCallback(() => {
    const vitals = performanceService.getWebVitals();
    setWebVitals(vitals);
    
    // Calculate performance score
    const score = calculatePerformanceScore(vitals);
    setPerformanceScore(score);
  }, []);

  const calculatePerformanceScore = (vitals: WebVitalsData): number => {
    let score = 100;
    
    // LCP scoring (weight: 25%)
    if (vitals.LCP) {
      if (vitals.LCP > 4000) score -= 25;
      else if (vitals.LCP > 2500) score -= 15;
    }
    
    // INP scoring (weight: 25%)
    if (vitals.INP) {
      if (vitals.INP > 500) score -= 25;
      else if (vitals.INP > 200) score -= 15;
    }
    
    // CLS scoring (weight: 25%)
    if (vitals.CLS) {
      if (vitals.CLS > 0.25) score -= 25;
      else if (vitals.CLS > 0.1) score -= 15;
    }
    
    // FCP scoring (weight: 15%)
    if (vitals.FCP) {
      if (vitals.FCP > 3000) score -= 15;
      else if (vitals.FCP > 1800) score -= 10;
    }
    
    // TTFB scoring (weight: 10%)
    if (vitals.TTFB) {
      if (vitals.TTFB > 1500) score -= 10;
      else if (vitals.TTFB > 800) score -= 5;
    }
    
    return Math.max(0, Math.min(100, score));
  };

  const detectDeviceCapabilities = useCallback(() => {
    const memory = (navigator as any).deviceMemory || 4;
    const cores = navigator.hardwareConcurrency || 4;
    
    const ua = navigator.userAgent.toLowerCase();
    let type: DeviceInfo['type'] = 'desktop';
    
    if (/mobile|android|iphone|ipod/.test(ua)) type = 'mobile';
    else if (/tablet|ipad/.test(ua)) type = 'tablet';
    
    let bandwidth: DeviceInfo['bandwidth'] = 'medium';
    if (memory >= 8 && cores >= 8) bandwidth = 'fast';
    else if (memory <= 2 || cores <= 2) bandwidth = 'slow';
    
    setDeviceInfo({ type, memory, cores, bandwidth });
  }, []);

  const detectNetworkConditions = useCallback(() => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      setNetworkInfo({
        effectiveType: connection.effectiveType || 'unknown',
        downlink: connection.downlink || 0,
        rtt: connection.rtt || 0,
        saveData: connection.saveData || false
      });

      connection.addEventListener('change', () => {
        setNetworkInfo({
          effectiveType: connection.effectiveType || 'unknown',
          downlink: connection.downlink || 0,
          rtt: connection.rtt || 0,
          saveData: connection.saveData || false
        });
      });
    }
  }, []);

  const applyPerformanceOptimizations = useCallback(() => {
    const newOptimizations: string[] = [];
    
    // Image optimization for slow connections
    if (networkInfo?.effectiveType === '2g' || networkInfo?.effectiveType === 'slow-2g') {
      document.querySelectorAll('img').forEach(img => {
        if (!img.getAttribute('data-optimized')) {
          img.setAttribute('loading', 'lazy');
          img.setAttribute('data-optimized', 'true');
        }
      });
      newOptimizations.push('Lazy loading enabled for images');
    }
    
    // Reduce animations for low-end devices
    if (deviceInfo?.bandwidth === 'slow') {
      document.documentElement.style.setProperty('--animation-duration', '0.1s');
      newOptimizations.push('Reduced animation duration for low-end device');
    }
    
    // Enable save-data optimizations
    if (networkInfo?.saveData) {
      document.documentElement.classList.add('save-data');
      newOptimizations.push('Save-data mode enabled');
    }
    
    // Preload critical resources
    if (webVitals.LCP && webVitals.LCP > 2500) {
      const criticalImages = document.querySelectorAll('img[data-critical]');
      criticalImages.forEach(img => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = (img as HTMLImageElement).src;
        document.head.appendChild(link);
      });
      newOptimizations.push('Preloaded critical images');
    }
    
    setOptimizations(prev => [...prev, ...newOptimizations]);
    newOptimizations.forEach(opt => onOptimization?.(opt));
  }, [webVitals, networkInfo, deviceInfo, onOptimization]);

  const getMetricStatus = (value: number | null, thresholds: [number, number]): PerformanceMetric['rating'] => {
    if (value === null) return 'good';
    if (value <= thresholds[0]) return 'good';
    if (value <= thresholds[1]) return 'needs-improvement';
    return 'poor';
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left': return 'bottom-6 left-6';
      case 'top-right': return 'top-6 right-6';
      case 'top-left': return 'top-6 left-6';
      default: return 'bottom-6 right-6';
    }
  };

  const cleanup = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (observerRef.current) observerRef.current.disconnect();
  };

  const formatValue = (value: number | null, unit: string): string => {
    if (value === null) return '--';
    if (unit === 'ms') return `${Math.round(value)}ms`;
    if (unit === 'score') return value.toFixed(3);
    return `${value}${unit}`;
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMetricColor = (rating: PerformanceMetric['rating']): string => {
    switch (rating) {
      case 'good': return 'text-green-600';
      case 'needs-improvement': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
    }
  };

  return (
    <div className={cn('fixed z-50', getPositionClasses())}>
      {/* Floating Performance Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 2 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-14 h-14 rounded-full shadow-lg border-2 border-white',
          'flex items-center justify-center text-white font-bold',
          'transition-all duration-300 hover:scale-110',
          performanceScore >= 90 ? 'bg-green-500' :
          performanceScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'
        )}
        title={`Performance Score: ${Math.round(performanceScore)}`}
      >
        <Gauge className="w-6 h-6" />
        <span className="absolute -bottom-1 -right-1 bg-white text-gray-900 text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
          {Math.round(performanceScore)}
        </span>
      </motion.button>

      {/* Performance Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: position.includes('right') ? 50 : -50, y: position.includes('top') ? -20 : 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: position.includes('right') ? 50 : -50, y: position.includes('top') ? -20 : 20 }}
            className={cn(
              'absolute bg-white rounded-lg shadow-xl border border-gray-200 p-4 min-w-[400px]',
              position.includes('right') ? 'right-16' : 'left-16',
              position.includes('top') ? 'top-0' : 'bottom-0'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold text-gray-900">Performance Monitor</h3>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsMonitoring(!isMonitoring)}
                  className={cn(
                    'p-1 rounded transition-colors',
                    isMonitoring ? 'text-green-500 hover:text-green-600' : 'text-gray-400 hover:text-gray-500'
                  )}
                  title={isMonitoring ? 'Monitoring Active' : 'Monitoring Paused'}
                >
                  <Zap className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Performance Score */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Overall Score</span>
                <span className={cn('text-2xl font-bold', getScoreColor(performanceScore))}>
                  {Math.round(performanceScore)}
                </span>
              </div>
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${performanceScore}%` }}
                  transition={{ duration: 1 }}
                  className={cn(
                    'h-full rounded-full',
                    performanceScore >= 90 ? 'bg-green-500' :
                    performanceScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                  )}
                />
              </div>
            </div>

            {/* Core Web Vitals */}
            <div className="space-y-3 mb-4">
              <h4 className="text-sm font-medium text-gray-700">Core Web Vitals</h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2 bg-gray-50 rounded">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">LCP</span>
                    <span className={cn('text-sm font-medium', getMetricColor(getMetricStatus(webVitals.LCP, [2500, 4000])))}>
                      {formatValue(webVitals.LCP, 'ms')}
                    </span>
                  </div>
                </div>
                
                <div className="p-2 bg-gray-50 rounded">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">INP</span>
                    <span className={cn('text-sm font-medium', getMetricColor(getMetricStatus(webVitals.INP, [200, 500])))}>
                      {formatValue(webVitals.INP, 'ms')}
                    </span>
                  </div>
                </div>
                
                <div className="p-2 bg-gray-50 rounded">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">CLS</span>
                    <span className={cn('text-sm font-medium', getMetricColor(getMetricStatus(webVitals.CLS, [0.1, 0.25])))}>
                      {formatValue(webVitals.CLS, 'score')}
                    </span>
                  </div>
                </div>
                
                <div className="p-2 bg-gray-50 rounded">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">FCP</span>
                    <span className={cn('text-sm font-medium', getMetricColor(getMetricStatus(webVitals.FCP, [1800, 3000])))}>
                      {formatValue(webVitals.FCP, 'ms')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Device & Network Info */}
            {(deviceInfo || networkInfo) && (
              <div className="space-y-2 mb-4">
                <h4 className="text-sm font-medium text-gray-700">Environment</h4>
                
                {deviceInfo && (
                  <div className="flex items-center space-x-4 text-xs text-gray-600">
                    {deviceInfo.type === 'mobile' ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                    <span>{deviceInfo.type}</span>
                    <span>{deviceInfo.memory}GB RAM</span>
                    <span>{deviceInfo.cores} cores</span>
                  </div>
                )}
                
                {networkInfo && (
                  <div className="flex items-center space-x-4 text-xs text-gray-600">
                    {networkInfo.downlink > 0 ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                    <span>{networkInfo.effectiveType}</span>
                    <span>{networkInfo.downlink}Mbps</span>
                    <span>{networkInfo.rtt}ms RTT</span>
                  </div>
                )}
              </div>
            )}

            {/* Optimizations Applied */}
            {optimizations.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Auto-Optimizations</h4>
                <div className="space-y-1">
                  {optimizations.slice(-3).map((opt, index) => (
                    <div key={index} className="flex items-center space-x-2 text-xs text-green-600">
                      <CheckCircle className="w-3 h-3" />
                      <span>{opt}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-2 mt-4">
              <button
                onClick={applyPerformanceOptimizations}
                className="flex-1 bg-blue-500 text-white text-xs py-2 px-3 rounded hover:bg-blue-600 transition-colors"
              >
                Optimize Now
              </button>
              
              <button
                onClick={collectWebVitals}
                className="bg-gray-100 text-gray-700 text-xs py-2 px-3 rounded hover:bg-gray-200 transition-colors"
              >
                Refresh
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Performance Context Hook
export const usePerformanceMonitor = () => {
  const [performanceData, setPerformanceData] = useState({
    score: 0,
    vitals: {},
    optimizations: []
  });

  const recordCustomMetric = useCallback((name: string, value: number) => {
    performanceService.recordMetric(name, value);
  }, []);

  const measureFunction = useCallback(<T,>(name: string, fn: () => T | Promise<T>): T | Promise<T> => {
    return performanceService.measureFunction(name, fn);
  }, []);

  return {
    performanceData,
    recordCustomMetric,
    measureFunction
  };
}; 