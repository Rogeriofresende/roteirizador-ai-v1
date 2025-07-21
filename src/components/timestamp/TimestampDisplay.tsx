/**
 * TimestampDisplay.tsx - V8.1 Visual Timestamp Component
 * 
 * Visual timestamp component with multiple format options and tooltip
 * Accessible design WCAG 2.1 AA compliant
 * 
 * Created: 15 Janeiro 2025 - V8.1 Implementation
 * IA BETA - Frontend UX Enhancement
 */

import React, { useState, useEffect, useMemo } from 'react';
import { systemTimestamp, type TimestampResult, type TimestampConfig } from '@/services/timestamp';

export interface TimestampDisplayProps {
  timestamp?: TimestampResult | number | string | Date;
  format?: 'relative' | 'absolute' | 'iso' | 'unix';
  showTooltip?: boolean;
  updateInterval?: number; // milliseconds
  timezone?: string;
  locale?: string;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
  onClick?: (timestamp: TimestampResult) => void;
}

export interface TimestampTooltipInfo {
  absolute: string;
  relative: string;
  iso: string;
  timezone: string;
  precision: string;
  source: string;
}

/**
 * TimestampDisplay - Visual timestamp component
 * Displays timestamps in multiple formats with accessibility support
 */
export const TimestampDisplay: React.FC<TimestampDisplayProps> = ({
  timestamp,
  format = 'relative',
  showTooltip = true,
  updateInterval = 30000, // 30 seconds
  timezone,
  locale = 'pt-BR',
  className = '',
  style,
  ariaLabel,
  onClick
}) => {
  const [currentTimestamp, setCurrentTimestamp] = useState<TimestampResult | null>(null);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // Convert input timestamp to TimestampResult
  const processedTimestamp = useMemo(() => {
    if (!timestamp) {
      return systemTimestamp.getTimestamp({ timezone, locale });
    }

    // If already a TimestampResult, use it
    if (typeof timestamp === 'object' && 'source' in timestamp) {
      return timestamp as TimestampResult;
    }

    // Convert other types to TimestampResult
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

    // Generate TimestampResult from Date
    const config: TimestampConfig = { timezone, locale };
    return {
      timestamp: date.getTime(),
      iso: date.toISOString(),
      formatted: systemTimestamp.formatTimestamp(date, config),
      timezone: timezone || systemTimestamp.getInstance().formatTimestamp(date).split(' ').pop() || 'UTC',
      precision: 0.1,
      source: 'computer-time' as const
    };
  }, [timestamp, timezone, locale]);

  // Update current timestamp
  useEffect(() => {
    setCurrentTimestamp(processedTimestamp);
  }, [processedTimestamp]);

  // Auto-update for relative timestamps
  useEffect(() => {
    if (format === 'relative' && updateInterval > 0) {
      const interval = setInterval(() => {
        setLastUpdate(Date.now());
        if (currentTimestamp) {
          // Update relative time display
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
  }, [format, updateInterval, currentTimestamp, locale, timezone]);

  // Generate display text based on format
  const displayText = useMemo(() => {
    if (!currentTimestamp) return 'Carregando...';

    const date = new Date(currentTimestamp.timestamp);
    const config: TimestampConfig = { timezone, locale };

    switch (format) {
      case 'relative':
        return systemTimestamp.formatTimestamp(date, { ...config, format: 'relative' });
      case 'absolute':
        return systemTimestamp.formatTimestamp(date, { ...config, format: 'iso' });
      case 'iso':
        return currentTimestamp.iso;
      case 'unix':
        return Math.floor(currentTimestamp.timestamp / 1000).toString();
      default:
        return currentTimestamp.formatted;
    }
  }, [currentTimestamp, format, timezone, locale]);

  // Generate tooltip information
  const tooltipInfo = useMemo((): TimestampTooltipInfo | null => {
    if (!showTooltip || !currentTimestamp) return null;

    const date = new Date(currentTimestamp.timestamp);
    const config: TimestampConfig = { timezone, locale };

    return {
      absolute: systemTimestamp.formatTimestamp(date, { ...config, format: 'iso' }),
      relative: systemTimestamp.formatTimestamp(date, { ...config, format: 'relative' }),
      iso: currentTimestamp.iso,
      timezone: currentTimestamp.timezone,
      precision: `${currentTimestamp.precision.toFixed(2)}ms`,
      source: currentTimestamp.source
    };
  }, [currentTimestamp, showTooltip, timezone, locale]);

  // Handle click event
  const handleClick = () => {
    if (onClick && currentTimestamp) {
      onClick(currentTimestamp);
    }
  };

  // Accessibility attributes
  const accessibilityProps = {
    'aria-label': ariaLabel || `Timestamp: ${displayText}`,
    'aria-describedby': showTooltip ? 'timestamp-tooltip' : undefined,
    role: onClick ? 'button' : 'text',
    tabIndex: onClick ? 0 : undefined
  };

  // CSS classes
  const containerClasses = [
    'timestamp-display',
    format,
    onClick ? 'clickable' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <span
      className={containerClasses}
      style={{
        display: 'inline-block',
        position: 'relative',
        cursor: onClick ? 'pointer' : 'default',
        borderRadius: '4px',
        padding: '2px 6px',
        backgroundColor: 'transparent',
        border: '1px solid transparent',
        transition: 'all 0.2s ease',
        ...style
      }}
      onClick={handleClick}
      onMouseEnter={() => setIsTooltipVisible(true)}
      onMouseLeave={() => setIsTooltipVisible(false)}
      onFocus={() => setIsTooltipVisible(true)}
      onBlur={() => setIsTooltipVisible(false)}
      {...accessibilityProps}
    >
      {/* Main timestamp display */}
      <span className="timestamp-text">
        {displayText}
      </span>

      {/* Tooltip */}
      {showTooltip && tooltipInfo && isTooltipVisible && (
        <div
          id="timestamp-tooltip"
          className="timestamp-tooltip"
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#333',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            zIndex: 1000,
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            marginBottom: '4px',
            opacity: 0,
            animation: 'fadeIn 0.2s ease forwards'
          }}
          role="tooltip"
          aria-hidden="false"
        >
          <div style={{ marginBottom: '4px' }}>
            <strong>Absoluto:</strong> {tooltipInfo.absolute}
          </div>
          <div style={{ marginBottom: '4px' }}>
            <strong>Relativo:</strong> {tooltipInfo.relative}
          </div>
          <div style={{ marginBottom: '4px' }}>
            <strong>ISO:</strong> {tooltipInfo.iso}
          </div>
          <div style={{ marginBottom: '4px' }}>
            <strong>Timezone:</strong> {tooltipInfo.timezone}
          </div>
          <div style={{ marginBottom: '4px' }}>
            <strong>Performance:</strong> {tooltipInfo.precision}
          </div>
          <div>
            <strong>Fonte:</strong> {tooltipInfo.source}
          </div>
          
          {/* Tooltip arrow */}
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid #333'
            }}
          />
        </div>
      )}

      {/* CSS animations */}
      <style jsx>{`
        .timestamp-display.clickable:hover {
          background-color: #f5f5f5;
          border-color: #ddd;
        }
        
        .timestamp-display.clickable:focus {
          outline: 2px solid #007bff;
          outline-offset: 2px;
        }
        
        .timestamp-display.relative .timestamp-text {
          color: #666;
          font-style: italic;
        }
        
        .timestamp-display.absolute .timestamp-text {
          color: #333;
          font-weight: 500;
        }
        
        .timestamp-display.iso .timestamp-text {
          color: #444;
          font-family: monospace;
          font-size: 0.9em;
        }
        
        .timestamp-display.unix .timestamp-text {
          color: #666;
          font-family: monospace;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        
        @media (max-width: 768px) {
          .timestamp-tooltip {
            position: fixed !important;
            bottom: 20px !important;
            left: 20px !important;
            right: 20px !important;
            transform: none !important;
            text-align: center;
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .timestamp-display {
            transition: none;
          }
          
          .timestamp-tooltip {
            animation: none;
            opacity: 1;
          }
        }
      `}</style>
    </span>
  );
};

// Hook for using TimestampDisplay with automatic updates
export const useTimestampDisplay = (
  initialTimestamp?: TimestampResult | number | string | Date,
  options: Partial<TimestampDisplayProps> = {}
) => {
  const [timestamp, setTimestamp] = useState<TimestampResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateTimestamp = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let result: TimestampResult;

      if (initialTimestamp) {
        // Convert provided timestamp
        if (typeof initialTimestamp === 'object' && 'source' in initialTimestamp) {
          result = initialTimestamp as TimestampResult;
        } else {
          const date = new Date(initialTimestamp as any);
          result = {
            timestamp: date.getTime(),
            iso: date.toISOString(),
            formatted: systemTimestamp.formatTimestamp(date, { 
              timezone: options.timezone, 
              locale: options.locale 
            }),
            timezone: options.timezone || 'UTC',
            precision: 0.1,
            source: 'computer-time'
          };
        }
      } else {
        // Generate new timestamp
        result = systemTimestamp.getTimestamp({
          timezone: options.timezone,
          locale: options.locale
        });
      }

      setTimestamp(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    updateTimestamp();
  }, [initialTimestamp, options.timezone, options.locale]);

  return {
    timestamp,
    isLoading,
    error,
    refresh: updateTimestamp
  };
};

export default TimestampDisplay; 