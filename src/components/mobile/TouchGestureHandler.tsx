import React, { useRef, useCallback, useEffect, useState } from 'react';
import { analyticsService } from '../../services/analyticsService';

export interface TouchGesture {
  type: 'tap' | 'doubletap' | 'longpress' | 'swipe' | 'pinch' | 'pan';
  direction?: 'left' | 'right' | 'up' | 'down';
  distance?: number;
  duration?: number;
  scale?: number;
  velocity?: number;
}

export interface TouchGestureHandlerProps {
  children: React.ReactNode;
  onGesture?: (gesture: TouchGesture, event: TouchEvent) => void;
  enabledGestures?: TouchGesture['type'][];
  sensitivity?: 'low' | 'medium' | 'high';
  className?: string;
  swipeThreshold?: number;
  longPressDelay?: number;
  doubleTapDelay?: number;
  preventDefaultTouches?: boolean;
}

interface TouchState {
  startTime: number;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  lastTapTime: number;
  touchCount: number;
  isLongPress: boolean;
  longPressTimer: NodeJS.Timeout | null;
}

export const TouchGestureHandler: React.FC<TouchGestureHandlerProps> = ({
  children,
  onGesture,
  enabledGestures = ['tap', 'swipe', 'longpress'],
  sensitivity = 'medium',
  className = '',
  swipeThreshold = 50,
  longPressDelay = 500,
  doubleTapDelay = 300,
  preventDefaultTouches = false
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [touchState, setTouchState] = useState<TouchState>({
    startTime: 0,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    lastTapTime: 0,
    touchCount: 0,
    isLongPress: false,
    longPressTimer: null
  });

  // Sensitivity configurations
  const sensitivityConfig = {
    low: { swipeThreshold: swipeThreshold * 1.5, velocityThreshold: 0.3 },
    medium: { swipeThreshold, velocityThreshold: 0.5 },
    high: { swipeThreshold: swipeThreshold * 0.7, velocityThreshold: 0.8 }
  };

  const config = sensitivityConfig[sensitivity];

  // Utility functions
  const getDistance = useCallback((x1: number, y1: number, x2: number, y2: number) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }, []);

  const getSwipeDirection = useCallback((startX: number, startY: number, endX: number, endY: number) => {
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      return deltaX > 0 ? 'right' : 'left';
    } else {
      return deltaY > 0 ? 'down' : 'up';
    }
  }, []);

  const clearLongPressTimer = useCallback(() => {
    if (touchState.longPressTimer) {
      clearTimeout(touchState.longPressTimer);
      setTouchState(prev => ({ ...prev, longPressTimer: null, isLongPress: false }));
    }
  }, [touchState.longPressTimer]);

  // Touch event handlers
  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (preventDefaultTouches) {
      event.preventDefault();
    }

    const touch = event.touches[0];
    const now = Date.now();
    
    clearLongPressTimer();

    setTouchState(prev => ({
      ...prev,
      startTime: now,
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      touchCount: event.touches.length,
      isLongPress: false
    }));

    // Setup long press detection
    if (enabledGestures.includes('longpress')) {
      const timer = setTimeout(() => {
        setTouchState(prev => ({ ...prev, isLongPress: true }));
        
        onGesture?.({
          type: 'longpress',
          duration: longPressDelay
        }, event);

        // Haptic feedback for long press
        if ('vibrate' in navigator) {
          navigator.vibrate([50, 30, 50]);
        }

        analyticsService.trackEvent('touch_gesture', {
          type: 'longpress',
          duration: longPressDelay,
          timestamp: Date.now()
        });
      }, longPressDelay);

      setTouchState(prev => ({ ...prev, longPressTimer: timer }));
    }
  }, [enabledGestures, longPressDelay, onGesture, preventDefaultTouches, clearLongPressTimer]);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (preventDefaultTouches) {
      event.preventDefault();
    }

    const touch = event.touches[0];
    
    setTouchState(prev => ({
      ...prev,
      currentX: touch.clientX,
      currentY: touch.clientY
    }));

    // Cancel long press if user moves too much
    const distance = getDistance(touchState.startX, touchState.startY, touch.clientX, touch.clientY);
    if (distance > 10) {
      clearLongPressTimer();
    }

    // Handle pan gesture
    if (enabledGestures.includes('pan') && event.touches.length === 1) {
      const deltaX = touch.clientX - touchState.startX;
      const deltaY = touch.clientY - touchState.startY;
      
      onGesture?.({
        type: 'pan',
        direction: getSwipeDirection(touchState.startX, touchState.startY, touch.clientX, touch.clientY),
        distance: Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      }, event);
    }
  }, [touchState.startX, touchState.startY, enabledGestures, onGesture, getDistance, getSwipeDirection, preventDefaultTouches, clearLongPressTimer]);

  const handleTouchEnd = useCallback((event: TouchEvent) => {
    if (preventDefaultTouches) {
      event.preventDefault();
    }

    const now = Date.now();
    const duration = now - touchState.startTime;
    const distance = getDistance(touchState.startX, touchState.startY, touchState.currentX, touchState.currentY);
    const velocity = distance / duration;

    clearLongPressTimer();

    // Don't process other gestures if long press was triggered
    if (touchState.isLongPress) {
      return;
    }

    // Handle swipe gesture
    if (enabledGestures.includes('swipe') && distance >= config.swipeThreshold && velocity >= config.velocityThreshold) {
      const direction = getSwipeDirection(touchState.startX, touchState.startY, touchState.currentX, touchState.currentY);
      
      onGesture?.({
        type: 'swipe',
        direction,
        distance,
        velocity,
        duration
      }, event);

      // Haptic feedback for swipe
      if ('vibrate' in navigator) {
        navigator.vibrate(20);
      }

      analyticsService.trackEvent('touch_gesture', {
        type: 'swipe',
        direction,
        distance,
        velocity,
        duration,
        timestamp: Date.now()
      });

      return;
    }

    // Handle tap and double tap
    if (enabledGestures.includes('tap') && distance < 10 && duration < 300) {
      const timeSinceLastTap = now - touchState.lastTapTime;
      
      if (enabledGestures.includes('doubletap') && timeSinceLastTap < doubleTapDelay) {
        // Double tap detected
        onGesture?.({
          type: 'doubletap',
          duration: timeSinceLastTap
        }, event);

        // Haptic feedback for double tap
        if ('vibrate' in navigator) {
          navigator.vibrate([30, 20, 30]);
        }

        analyticsService.trackEvent('touch_gesture', {
          type: 'doubletap',
          duration: timeSinceLastTap,
          timestamp: Date.now()
        });

        setTouchState(prev => ({ ...prev, lastTapTime: 0 }));
      } else {
        // Single tap detected (delay to check for double tap)
        setTimeout(() => {
          if (Date.now() - now >= doubleTapDelay) {
            onGesture?.({
              type: 'tap',
              duration
            }, event);

            // Subtle haptic feedback for tap
            if ('vibrate' in navigator) {
              navigator.vibrate(10);
            }

            analyticsService.trackEvent('touch_gesture', {
              type: 'tap',
              duration,
              timestamp: Date.now()
            });
          }
        }, doubleTapDelay);

        setTouchState(prev => ({ ...prev, lastTapTime: now }));
      }
    }
  }, [
    touchState,
    enabledGestures,
    config,
    doubleTapDelay,
    onGesture,
    getDistance,
    getSwipeDirection,
    preventDefaultTouches,
    clearLongPressTimer
  ]);

  // Setup event listeners
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: !preventDefaultTouches });
    element.addEventListener('touchmove', handleTouchMove, { passive: !preventDefaultTouches });
    element.addEventListener('touchend', handleTouchEnd, { passive: !preventDefaultTouches });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, preventDefaultTouches]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearLongPressTimer();
    };
  }, [clearLongPressTimer]);

  return (
    <div
      ref={elementRef}
      className={`touch-gesture-handler ${className}`}
      style={{
        touchAction: enabledGestures.includes('pan') ? 'none' : 'manipulation',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none'
      }}
    >
      {children}
    </div>
  );
}; 