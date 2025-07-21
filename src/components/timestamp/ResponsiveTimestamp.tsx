/**
 * ResponsiveTimestamp.tsx - V8.1 Mobile-First Responsive Timestamp Component
 * 
 * Mobile-first timestamp display with adaptive layout for different screen sizes
 * Touch-friendly interactions and performance optimized for mobile
 * 
 * Created: 15 Janeiro 2025 - V8.1 Implementation
 * IA BETA - Frontend UX Enhancement
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { systemTimestamp, type TimestampResult, type TimestampConfig } from '@/services/timestamp';

export interface ResponsiveTimestampProps {
  timestamp?: TimestampResult | number | string | Date;
  format?: 'adaptive' | 'mobile' | 'tablet' | 'desktop';
  showDetails?: 'auto' | 'always' | 'never';
  touchOptimized?: boolean;
  compactMode?: boolean;
  updateInterval?: number;
  timezone?: string;
  locale?: string;
  className?: string;
  style?: React.CSSProperties;
  onTap?: (timestamp: TimestampResult) => void;
}

export interface DeviceBreakpoints {
  mobile: number;
  tablet: number;
  desktop: number;
}

export interface ResponsiveLayout {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  orientation: 'portrait' | 'landscape';
}

/**
 * ResponsiveTimestamp - Mobile-first responsive timestamp display
 * Adapts layout and functionality based on screen size and device capabilities
 */
export const ResponsiveTimestamp: React.FC<ResponsiveTimestampProps> = ({
  timestamp,
  format = 'adaptive',
  showDetails = 'auto',
  touchOptimized = true,
  compactMode = false,
  updateInterval = 30000,
  timezone,
  locale = 'pt-BR',
  className = '',
  style,
  onTap
}) => {
  const [currentTimestamp, setCurrentTimestamp] = useState<TimestampResult | null>(null);
  const [layout, setLayout] = useState<ResponsiveLayout>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    screenWidth: 1920,
    orientation: 'landscape'
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastTouchTime, setLastTouchTime] = useState(0);

  // Default breakpoints
  const breakpoints: DeviceBreakpoints = {
    mobile: 768,
    tablet: 1024,
    desktop: 1200
  };

  // Detect device and screen size
  const updateLayout = useCallback(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    setLayout({
      isMobile: width < breakpoints.mobile,
      isTablet: width >= breakpoints.mobile && width < breakpoints.desktop,
      isDesktop: width >= breakpoints.desktop,
      screenWidth: width,
      orientation: width > height ? 'landscape' : 'portrait'
    });
  }, [breakpoints]);

  // Initialize layout detection
  useEffect(() => {
    updateLayout();
    
    const handleResize = () => {
      updateLayout();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateLayout]);

  // Process timestamp input
  const processedTimestamp = useMemo(() => {
    if (!timestamp) {
      return systemTimestamp.getTimestamp({ timezone, locale });
    }

    if (typeof timestamp === 'object' && 'source' in timestamp) {
      return timestamp as TimestampResult;
    }

    let date: Date;
    if (timestamp instanceof Date) {
      date = timestamp;
    } else if (typeof timestamp === 'number') {
      date = new Date(timestamp);
    } else if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    } else {
      date = new Date();
    }

    return {
      timestamp: date.getTime(),
      iso: date.toISOString(),
      formatted: systemTimestamp.formatTimestamp(date, { timezone, locale }),
      timezone: timezone || 'UTC',
      precision: 0.1,
      source: 'computer-time' as const
    };
  }, [timestamp, timezone, locale]);

  // Update current timestamp
  useEffect(() => {
    setCurrentTimestamp(processedTimestamp);
  }, [processedTimestamp]);

  // Auto-update interval
  useEffect(() => {
    if (updateInterval > 0) {
      const interval = setInterval(() => {
        if (currentTimestamp) {
          const updatedTimestamp = {
            ...currentTimestamp,
            formatted: systemTimestamp.formatTimestamp(
              new Date(currentTimestamp.timestamp),
              { format: 'relative', locale, timezone }
            )
          };
          setCurrentTimestamp(updatedTimestamp);
        }
      }, updateInterval);

      return () => clearInterval(interval);
    }
  }, [currentTimestamp, updateInterval, locale, timezone]);

  // Determine display format based on device
  const getDisplayFormat = (): string => {
    if (!currentTimestamp) return 'Carregando...';

    const date = new Date(currentTimestamp.timestamp);
    const config: TimestampConfig = { timezone, locale };

    switch (format) {
      case 'mobile':
        return systemTimestamp.formatTimestamp(date, { ...config, format: 'relative' });
      case 'tablet':
        return systemTimestamp.formatTimestamp(date, { ...config, format: 'iso' });
      case 'desktop':
        return systemTimestamp.formatTimestamp(date, { ...config, format: 'iso' });
      case 'adaptive':
      default:
        if (layout.isMobile) {
          return systemTimestamp.formatTimestamp(date, { ...config, format: 'relative' });
        } else if (layout.isTablet) {
          return compactMode
            ? systemTimestamp.formatTimestamp(date, { ...config, format: 'relative' })
            : systemTimestamp.formatTimestamp(date, { ...config, format: 'iso' });
        } else {
          return systemTimestamp.formatTimestamp(date, { ...config, format: 'iso' });
        }
    }
  };

  // Handle touch interactions
  const handleTouch = useCallback((event: React.TouchEvent) => {
    if (!touchOptimized) return;

    const now = Date.now();
    const timeDiff = now - lastTouchTime;

    // Double-tap detection
    if (timeDiff < 300) {
      setIsExpanded(prev => !prev);
      if (onTap && currentTimestamp) {
        onTap(currentTimestamp);
      }
    }

    setLastTouchTime(now);
  }, [touchOptimized, lastTouchTime, onTap, currentTimestamp]);

  // Handle click/tap
  const handleClick = useCallback(() => {
    if (layout.isMobile || layout.isTablet) {
      setIsExpanded(prev => !prev);
    }
    
    if (onTap && currentTimestamp) {
      onTap(currentTimestamp);
    }
  }, [layout, onTap, currentTimestamp]);

  // Determine if details should be shown
  const shouldShowDetails = useMemo(() => {
    switch (showDetails) {
      case 'always':
        return true;
      case 'never':
        return false;
      case 'auto':
      default:
        return isExpanded || (!layout.isMobile && !compactMode);
    }
  }, [showDetails, isExpanded, layout.isMobile, compactMode]);

  // Generate detailed info
  const detailedInfo = useMemo(() => {
    if (!currentTimestamp || !shouldShowDetails) return null;

    const date = new Date(currentTimestamp.timestamp);
    const config: TimestampConfig = { timezone, locale };

    return {
      relative: systemTimestamp.formatTimestamp(date, { ...config, format: 'relative' }),
      absolute: systemTimestamp.formatTimestamp(date, { ...config, format: 'iso' }),
      iso: currentTimestamp.iso,
      unix: Math.floor(currentTimestamp.timestamp / 1000),
      timezone: currentTimestamp.timezone,
      source: currentTimestamp.source
    };
  }, [currentTimestamp, shouldShowDetails, timezone, locale]);

  // Responsive styles
  const containerStyles = useMemo((): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      display: 'inline-block',
      position: 'relative',
      cursor: touchOptimized ? 'pointer' : 'default',
      userSelect: 'none',
      transition: 'all 0.2s ease',
      ...style
    };

    if (layout.isMobile) {
      return {
        ...baseStyles,
        padding: '8px 12px',
        fontSize: '14px',
        borderRadius: '8px',
        backgroundColor: '#f8f9fa',
        border: '1px solid #e9ecef',
        minHeight: '44px', // Touch target size
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: '100%'
      };
    } else if (layout.isTablet) {
      return {
        ...baseStyles,
        padding: '6px 10px',
        fontSize: '13px',
        borderRadius: '6px',
        backgroundColor: compactMode ? '#f8f9fa' : 'transparent',
        border: compactMode ? '1px solid #e9ecef' : 'none'
      };
    } else {
      return {
        ...baseStyles,
        padding: '4px 8px',
        fontSize: '12px',
        borderRadius: '4px'
      };
    }
  }, [layout, touchOptimized, compactMode, style]);

  // Details styles
  const detailsStyles = useMemo((): React.CSSProperties => {
    if (layout.isMobile) {
      return {
        position: 'absolute',
        top: '100%',
        left: '0',
        right: '0',
        marginTop: '4px',
        padding: '12px',
        backgroundColor: 'white',
        border: '1px solid #e9ecef',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 1000,
        fontSize: '12px'
      };
    } else if (layout.isTablet) {
      return {
        marginTop: '6px',
        padding: '8px',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px',
        fontSize: '11px'
      };
    } else {
      return {
        display: 'inline-block',
        marginLeft: '8px',
        fontSize: '11px',
        color: '#666'
      };
    }
  }, [layout]);

  const displayText = getDisplayFormat();
  const containerClasses = [
    'responsive-timestamp',
    layout.isMobile ? 'mobile' : '',
    layout.isTablet ? 'tablet' : '',
    layout.isDesktop ? 'desktop' : '',
    isExpanded ? 'expanded' : '',
    compactMode ? 'compact' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      className={containerClasses}
      style={containerStyles}
      onClick={handleClick}
      onTouchEnd={handleTouch}
      role={touchOptimized ? 'button' : 'text'}
      tabIndex={touchOptimized ? 0 : undefined}
      aria-label={`Timestamp: ${displayText}${shouldShowDetails ? ' (toque para mais detalhes)' : ''}`}
      aria-expanded={shouldShowDetails}
    >
      {/* Main timestamp display */}
      <span className="timestamp-main">
        {displayText}
      </span>

      {/* Expand indicator for mobile */}
      {layout.isMobile && touchOptimized && (
        <span
          style={{
            marginLeft: '8px',
            fontSize: '10px',
            color: '#666',
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}
        >
          ▼
        </span>
      )}

      {/* Detailed information */}
      {shouldShowDetails && detailedInfo && (
        <div className="timestamp-details" style={detailsStyles}>
          {layout.isMobile ? (
            // Mobile: Vertical layout
            <div>
              <div style={{ marginBottom: '6px' }}>
                <strong>Relativo:</strong> {detailedInfo.relative}
              </div>
              <div style={{ marginBottom: '6px' }}>
                <strong>Absoluto:</strong> {detailedInfo.absolute}
              </div>
              <div style={{ marginBottom: '6px' }}>
                <strong>ISO:</strong> {detailedInfo.iso}
              </div>
              <div style={{ marginBottom: '6px' }}>
                <strong>Unix:</strong> {detailedInfo.unix}
              </div>
              <div style={{ marginBottom: '6px' }}>
                <strong>Timezone:</strong> {detailedInfo.timezone}
              </div>
              <div>
                <strong>Fonte:</strong> {detailedInfo.source}
              </div>
            </div>
          ) : layout.isTablet ? (
            // Tablet: Compact layout
            <div>
              <div>Relativo: {detailedInfo.relative}</div>
              <div>ISO: {detailedInfo.iso}</div>
              <div>Timezone: {detailedInfo.timezone}</div>
            </div>
          ) : (
            // Desktop: Inline layout
            <span>
              {detailedInfo.relative} | {detailedInfo.timezone}
            </span>
          )}
        </div>
      )}

      {/* CSS for responsive behavior */}
      <style jsx>{`
        .responsive-timestamp {
          -webkit-tap-highlight-color: transparent;
        }
        
        .responsive-timestamp.mobile:active {
          background-color: #e9ecef;
          transform: scale(0.98);
        }
        
        .responsive-timestamp.tablet:hover {
          background-color: #f8f9fa;
        }
        
        .responsive-timestamp.desktop:hover {
          opacity: 0.8;
        }
        
        @media (max-width: 767px) {
          .responsive-timestamp {
            display: block !important;
            width: 100%;
            text-align: center;
          }
          
          .timestamp-details {
            position: fixed !important;
            bottom: 20px;
            left: 20px;
            right: 20px;
            top: auto !important;
            margin: 0 !important;
          }
        }
        
        @media (orientation: landscape) and (max-height: 500px) {
          .responsive-timestamp.mobile {
            padding: 4px 8px;
            min-height: 36px;
            font-size: 12px;
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .responsive-timestamp,
          .responsive-timestamp * {
            transition: none !important;
            animation: none !important;
          }
        }
        
        @media (hover: none) {
          .responsive-timestamp:hover {
            background-color: initial !important;
            opacity: 1 !important;
          }
        }
      `}</style>
    </div>
  );
};

// Hook for responsive timestamp management
export const useResponsiveTimestamp = (
  timestamp?: TimestampResult | number | string | Date,
  options: Partial<ResponsiveTimestampProps> = {}
) => {
  const [layout, setLayout] = useState<ResponsiveLayout>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    screenWidth: 1920,
    orientation: 'landscape'
  });

  const [isExpanded, setIsExpanded] = useState(false);

  // Update layout on screen size change
  useEffect(() => {
    const updateLayout = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setLayout({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1200,
        isDesktop: width >= 1200,
        screenWidth: width,
        orientation: width > height ? 'landscape' : 'portrait'
      });
    };

    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, []);

  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  return {
    layout,
    isExpanded,
    toggleExpanded,
    setIsExpanded
  };
};

export default ResponsiveTimestamp; 