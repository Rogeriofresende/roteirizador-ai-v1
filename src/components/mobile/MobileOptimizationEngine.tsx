import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Smartphone, 
  Battery, 
  Signal, 
  Wifi, 
  Sun, 
  Moon, 
  Eye, 
  Hand, 
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Vibrate,
  RotateCcw,
  Compass,
  MapPin,
  Thermometer,
  Gauge
} from 'lucide-react';
import { cn } from '../../lib/utils';

// Mobile Device Capabilities
interface DeviceCapabilities {
  touch: boolean;
  orientation: boolean;
  vibration: boolean;
  geolocation: boolean;
  ambientLight: boolean;
  deviceMotion: boolean;
  batteryApi: boolean;
  networkInfo: boolean;
  memoryInfo: boolean;
}

interface BatteryInfo {
  level: number;
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
}

interface NetworkCondition {
  type: 'wifi' | 'cellular' | 'unknown';
  effectiveType: '2g' | '3g' | '4g' | '5g' | 'unknown';
  downlink: number;
  rtt: number;
  saveData: boolean;
}

interface DeviceOrientation {
  alpha: number;
  beta: number;
  gamma: number;
  isLandscape: boolean;
}

interface MobileOptimizations {
  powerSaving: boolean;
  dataReduction: boolean;
  gestureOptimization: boolean;
  visualAdaptation: boolean;
  performanceBoost: boolean;
  accessibilityEnhancement: boolean;
}

// Mobile Optimization Engine Component
export const MobileOptimizationEngine: React.FC<{
  autoOptimize?: boolean;
  showStatusIndicator?: boolean;
  onOptimizationChange?: (optimizations: MobileOptimizations) => void;
}> = ({ 
  autoOptimize = true, 
  showStatusIndicator = true,
  onOptimizationChange 
}) => {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>({
    touch: false,
    orientation: false,
    vibration: false,
    geolocation: false,
    ambientLight: false,
    deviceMotion: false,
    batteryApi: false,
    networkInfo: false,
    memoryInfo: false
  });

  const [batteryInfo, setBatteryInfo] = useState<BatteryInfo | null>(null);
  const [networkCondition, setNetworkCondition] = useState<NetworkCondition | null>(null);
  const [deviceOrientation, setDeviceOrientation] = useState<DeviceOrientation | null>(null);
  const [ambientLight, setAmbientLight] = useState<number | null>(null);
  const [isLowPowerMode, setIsLowPowerMode] = useState(false);
  
  const [optimizations, setOptimizations] = useState<MobileOptimizations>({
    powerSaving: false,
    dataReduction: false,
    gestureOptimization: false,
    visualAdaptation: false,
    performanceBoost: false,
    accessibilityEnhancement: false
  });

  const [isMobile, setIsMobile] = useState(false);
  const batteryRef = useRef<any>(null);

  // Initialize mobile detection and capabilities
  useEffect(() => {
    detectMobileDevice();
    detectDeviceCapabilities();
    initializeBatteryAPI();
    initializeNetworkAPI();
    initializeOrientationAPI();
    initializeAmbientLightAPI();
    initializeVisibilityAPI();
  }, []);

  // Auto-optimize based on conditions
  useEffect(() => {
    if (autoOptimize && isMobile) {
      performAutoOptimizations();
    }
  }, [batteryInfo, networkCondition, ambientLight, isLowPowerMode, autoOptimize, isMobile]);

  const detectMobileDevice = useCallback(() => {
    const ua = navigator.userAgent.toLowerCase();
    const mobile = /mobile|android|iphone|ipod|blackberry|iemobile|opera mini/.test(ua);
    setIsMobile(mobile);
    
    // Add mobile class to body for CSS optimizations
    if (mobile) {
      document.body.classList.add('mobile-device');
    }
  }, []);

  const detectDeviceCapabilities = useCallback(() => {
    const newCapabilities: DeviceCapabilities = {
      touch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      orientation: 'DeviceOrientationEvent' in window,
      vibration: 'vibrate' in navigator,
      geolocation: 'geolocation' in navigator,
      ambientLight: 'AmbientLightSensor' in window,
      deviceMotion: 'DeviceMotionEvent' in window,
      batteryApi: 'getBattery' in navigator,
      networkInfo: 'connection' in navigator,
      memoryInfo: 'memory' in performance
    };
    
    setCapabilities(newCapabilities);
  }, []);

  const initializeBatteryAPI = useCallback(async () => {
    if ('getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery();
        batteryRef.current = battery;
        
        const updateBatteryInfo = () => {
          setBatteryInfo({
            level: battery.level,
            charging: battery.charging,
            chargingTime: battery.chargingTime,
            dischargingTime: battery.dischargingTime
          });
          
          // Detect low power mode
          setIsLowPowerMode(battery.level < 0.2 && !battery.charging);
        };
        
        updateBatteryInfo();
        
        // Listen to battery events
        battery.addEventListener('chargingchange', updateBatteryInfo);
        battery.addEventListener('levelchange', updateBatteryInfo);
        battery.addEventListener('chargingtimechange', updateBatteryInfo);
        battery.addEventListener('dischargingtimechange', updateBatteryInfo);
        
      } catch (error) {
        console.warn('Battery API not available:', error);
      }
    }
  }, []);

  const initializeNetworkAPI = useCallback(() => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      const updateNetworkInfo = () => {
        setNetworkCondition({
          type: connection.type || 'unknown',
          effectiveType: connection.effectiveType || 'unknown',
          downlink: connection.downlink || 0,
          rtt: connection.rtt || 0,
          saveData: connection.saveData || false
        });
      };
      
      updateNetworkInfo();
      connection.addEventListener('change', updateNetworkInfo);
    }
  }, []);

  const initializeOrientationAPI = useCallback(() => {
    if ('DeviceOrientationEvent' in window) {
      const handleOrientation = (event: DeviceOrientationEvent) => {
        setDeviceOrientation({
          alpha: event.alpha || 0,
          beta: event.beta || 0,
          gamma: event.gamma || 0,
          isLandscape: Math.abs(window.orientation || 0) === 90
        });
      };
      
      window.addEventListener('deviceorientation', handleOrientation);
      
      // Also listen to orientation change
      window.addEventListener('orientationchange', () => {
        setTimeout(() => {
          setDeviceOrientation(prev => ({
            ...prev!,
            isLandscape: Math.abs(window.orientation || 0) === 90
          }));
        }, 100);
      });
    }
  }, []);

  const initializeAmbientLightAPI = useCallback(() => {
    if ('AmbientLightSensor' in window) {
      try {
        const sensor = new (window as any).AmbientLightSensor();
        sensor.addEventListener('reading', () => {
          setAmbientLight(sensor.illuminance);
        });
        sensor.start();
      } catch (error) {
        console.warn('Ambient Light Sensor not available:', error);
      }
    } else if ('ondevicelight' in window) {
      // Fallback for older browsers
      window.addEventListener('devicelight', (event: any) => {
        setAmbientLight(event.value);
      });
    }
  }, []);

  const initializeVisibilityAPI = useCallback(() => {
    // Page Visibility API for performance optimizations
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Page is hidden - reduce performance
        applyBackgroundOptimizations();
      } else {
        // Page is visible - restore performance
        restorePerformance();
      }
    });
  }, []);

  const performAutoOptimizations = useCallback(() => {
    const newOptimizations = { ...optimizations };
    
    // Power saving optimizations
    if (isLowPowerMode || (batteryInfo && batteryInfo.level < 0.15)) {
      newOptimizations.powerSaving = true;
      enablePowerSavingMode();
    }
    
    // Data reduction for slow networks
    if (networkCondition && (
      networkCondition.effectiveType === '2g' || 
      networkCondition.saveData ||
      networkCondition.downlink < 1.5
    )) {
      newOptimizations.dataReduction = true;
      enableDataReductionMode();
    }
    
    // Visual adaptation for ambient light
    if (ambientLight !== null) {
      newOptimizations.visualAdaptation = true;
      adaptToAmbientLight(ambientLight);
    }
    
    // Gesture optimization for touch devices
    if (capabilities.touch) {
      newOptimizations.gestureOptimization = true;
      optimizeTouchGestures();
    }
    
    // Performance boost for low-end devices
    if (isLowEndDevice()) {
      newOptimizations.performanceBoost = true;
      enablePerformanceBoost();
    }
    
    setOptimizations(newOptimizations);
    onOptimizationChange?.(newOptimizations);
  }, [batteryInfo, networkCondition, ambientLight, isLowPowerMode, capabilities, optimizations, onOptimizationChange]);

  const enablePowerSavingMode = useCallback(() => {
    // Reduce animations
    document.documentElement.style.setProperty('--animation-duration', '0s');
    document.documentElement.style.setProperty('--transition-duration', '0s');
    
    // Reduce update frequency
    document.documentElement.classList.add('power-saving-mode');
    
    // Pause non-critical background tasks
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        // Pause analytics, reduce polling frequency, etc.
      });
    }
  }, []);

  const enableDataReductionMode = useCallback(() => {
    // Replace high-res images with low-res versions
    document.querySelectorAll('img[data-src-low]').forEach(img => {
      const lowSrc = img.getAttribute('data-src-low');
      if (lowSrc) {
        (img as HTMLImageElement).src = lowSrc;
      }
    });
    
    // Defer non-critical resource loading
    document.documentElement.classList.add('data-reduction-mode');
    
    // Reduce image quality for future loads
    document.documentElement.style.setProperty('--image-quality', '0.7');
  }, []);

  const adaptToAmbientLight = useCallback((lux: number) => {
    // Dark mode for low light (< 10 lux)
    if (lux < 10) {
      document.documentElement.classList.add('ambient-dark');
      document.documentElement.classList.remove('ambient-bright');
    } 
    // Bright mode for bright light (> 1000 lux)
    else if (lux > 1000) {
      document.documentElement.classList.add('ambient-bright');
      document.documentElement.classList.remove('ambient-dark');
    }
    // Normal mode
    else {
      document.documentElement.classList.remove('ambient-dark', 'ambient-bright');
    }
  }, []);

  const optimizeTouchGestures = useCallback(() => {
    // Increase touch target sizes
    document.documentElement.classList.add('touch-optimized');
    
    // Enable haptic feedback where supported
    if (capabilities.vibration) {
      document.addEventListener('touchstart', (e) => {
        if ((e.target as Element).closest('button, a, [role="button"]')) {
          navigator.vibrate(10); // Subtle haptic feedback
        }
      }, { passive: true });
    }
    
    // Optimize scroll performance
    document.documentElement.style.setProperty('scroll-behavior', 'auto');
  }, [capabilities.vibration]);

  const enablePerformanceBoost = useCallback(() => {
    // Reduce visual effects
    document.documentElement.classList.add('performance-mode');
    
    // Simplify shadows and gradients
    document.documentElement.style.setProperty('--shadow-complexity', 'none');
    document.documentElement.style.setProperty('--gradient-complexity', 'linear');
    
    // Reduce render frequency
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        // Optimize expensive operations
      });
    }
  }, []);

  const isLowEndDevice = useCallback((): boolean => {
    const memory = (navigator as any).deviceMemory;
    const cores = navigator.hardwareConcurrency;
    
    return (
      (memory && memory <= 2) || 
      (cores && cores <= 2) ||
      (batteryInfo && batteryInfo.level < 0.3)
    );
  }, [batteryInfo]);

  const applyBackgroundOptimizations = useCallback(() => {
    // Pause animations and reduce updates when page is hidden
    document.documentElement.classList.add('page-hidden');
  }, []);

  const restorePerformance = useCallback(() => {
    // Restore normal performance when page is visible
    document.documentElement.classList.remove('page-hidden');
  }, []);

  const getStatusColor = useCallback(() => {
    let score = 0;
    if (batteryInfo && batteryInfo.level > 0.5) score += 20;
    if (networkCondition && networkCondition.downlink > 5) score += 20;
    if (!isLowPowerMode) score += 20;
    if (Object.values(optimizations).filter(Boolean).length >= 3) score += 40;
    
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  }, [batteryInfo, networkCondition, isLowPowerMode, optimizations]);

  // Don't render on desktop unless forced
  if (!isMobile && !showStatusIndicator) {
    return null;
  }

  return (
    <>
      {/* Mobile Status Indicator */}
      {showStatusIndicator && (
        <div className="fixed top-4 right-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 }}
            className={cn(
              'w-3 h-3 rounded-full',
              getStatusColor(),
              'shadow-lg border-2 border-white'
            )}
            title="Mobile Optimization Status"
          />
        </div>
      )}

      {/* Mobile Optimization Panel (Hidden by default, can be shown via debug) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-20 left-4 right-4 bg-white rounded-lg shadow-lg border p-4 z-40 max-h-60 overflow-y-auto">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm">Mobile Optimizations</h3>
          
          {/* Device Info */}
          <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
            {batteryInfo && (
              <div className="flex items-center space-x-1">
                <Battery className="w-3 h-3" />
                <span>{Math.round(batteryInfo.level * 100)}%</span>
              </div>
            )}
            
            {networkCondition && (
              <div className="flex items-center space-x-1">
                <Signal className="w-3 h-3" />
                <span>{networkCondition.effectiveType}</span>
              </div>
            )}
            
            {deviceOrientation && (
              <div className="flex items-center space-x-1">
                <Compass className="w-3 h-3" />
                <span>{deviceOrientation.isLandscape ? 'Landscape' : 'Portrait'}</span>
              </div>
            )}
            
            {ambientLight !== null && (
              <div className="flex items-center space-x-1">
                <Sun className="w-3 h-3" />
                <span>{Math.round(ambientLight)} lux</span>
              </div>
            )}
          </div>
          
          {/* Active Optimizations */}
          <div className="space-y-1">
            {Object.entries(optimizations).map(([key, active]) => (
              active && (
                <div key={key} className="text-xs text-green-600 flex items-center space-x-1">
                  <span className="w-1 h-1 bg-green-500 rounded-full" />
                  <span>{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                </div>
              )
            ))}
          </div>
        </div>
      )}
    </>
  );
};

// Hook for using mobile optimizations
export const useMobileOptimization = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [optimizationsActive, setOptimizationsActive] = useState<MobileOptimizations>({
    powerSaving: false,
    dataReduction: false,
    gestureOptimization: false,
    visualAdaptation: false,
    performanceBoost: false,
    accessibilityEnhancement: false
  });

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    setIsMobile(/mobile|android|iphone|ipod/.test(ua));
  }, []);

  return {
    isMobile,
    optimizationsActive,
    setOptimizationsActive
  };
}; 