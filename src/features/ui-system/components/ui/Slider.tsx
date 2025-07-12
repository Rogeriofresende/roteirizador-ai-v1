import React, { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '../../lib/utils';

export interface SliderProps {
  value: number[];
  onValueChange: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  className,
  orientation = 'horizontal',
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const isVertical = orientation === 'vertical';

  // Normalizar valor para porcentagem
  const normalizeValue = useCallback((val: number) => {
    return ((val - min) / (max - min)) * 100;
  }, [min, max]);

  // Converter posição para valor
  const positionToValue = useCallback((position: number, rect: DOMRect) => {
    const percentage = isVertical 
      ? (rect.height - position) / rect.height
      : position / rect.width;
    
    const rawValue = min + percentage * (max - min);
    const steppedValue = Math.round(rawValue / step) * step;
    return Math.max(min, Math.min(max, steppedValue));
  }, [min, max, step, isVertical]);

  // Handler para movimento do mouse/touch
  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!sliderRef.current || dragIndex === null) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const position = isVertical ? clientY - rect.top : clientX - rect.left;
    const newValue = positionToValue(position, rect);

    const newValues = [...value];
    newValues[dragIndex] = newValue;
    onValueChange(newValues);
  }, [value, onValueChange, dragIndex, positionToValue, isVertical]);

  // Event handlers
  const handleMouseDown = (index: number) => (event: React.MouseEvent) => {
    if (disabled) return;
    
    event.preventDefault();
    setIsDragging(true);
    setDragIndex(index);
  };

  const handleTouchStart = (index: number) => (event: React.TouchEvent) => {
    if (disabled) return;
    
    event.preventDefault();
    setIsDragging(true);
    setDragIndex(index);
  };

  // Efeitos para eventos globais
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (event: MouseEvent) => {
      handleMove(event.clientX, event.clientY);
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        handleMove(event.touches[0].clientX, event.touches[0].clientY);
      }
    };

    const handleEnd = () => {
      setIsDragging(false);
      setDragIndex(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchend', handleEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, handleMove]);

  // Handler para clique na track
  const handleTrackClick = (event: React.MouseEvent) => {
    if (disabled) return;

    const rect = sliderRef.current?.getBoundingClientRect();
    if (!rect) return;

    const position = isVertical 
      ? event.clientY - rect.top 
      : event.clientX - rect.left;
    
    const newValue = positionToValue(position, rect);
    
    // Encontrar o thumb mais próximo
    let closestIndex = 0;
    let closestDistance = Math.abs(value[0] - newValue);
    
    for (let i = 1; i < value.length; i++) {
      const distance = Math.abs(value[i] - newValue);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = i;
      }
    }

    const newValues = [...value];
    newValues[closestIndex] = newValue;
    onValueChange(newValues);
  };

  // Handler para teclado
  const handleKeyDown = (index: number) => (event: React.KeyboardEvent) => {
    if (disabled) return;

    let newValue = value[index];
    const increment = step;

    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowRight':
        newValue = Math.min(max, newValue + increment);
        break;
      case 'ArrowDown':
      case 'ArrowLeft':
        newValue = Math.max(min, newValue - increment);
        break;
      case 'Home':
        newValue = min;
        break;
      case 'End':
        newValue = max;
        break;
      case 'PageUp':
        newValue = Math.min(max, newValue + increment * 10);
        break;
      case 'PageDown':
        newValue = Math.max(min, newValue - increment * 10);
        break;
      default:
        return;
    }

    event.preventDefault();
    const newValues = [...value];
    newValues[index] = newValue;
    onValueChange(newValues);
  };

  return (
    <div
      className={cn(
        'relative flex items-center select-none touch-none',
        isVertical ? 'flex-col h-full w-5' : 'w-full h-5',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {/* Track */}
      <div
        ref={sliderRef}
        className={cn(
          'relative bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer',
          isVertical ? 'w-2 flex-1' : 'h-2 flex-1',
          disabled && 'cursor-not-allowed'
        )}
        onClick={handleTrackClick}
      >
        {/* Range fill */}
        {value.length === 1 && (
          <div
            className={cn(
              'absolute bg-blue-600 dark:bg-blue-500 rounded-full',
              isVertical ? 'w-full bottom-0' : 'h-full left-0'
            )}
            style={{
              [isVertical ? 'height' : 'width']: `${normalizeValue(value[0])}%`
            }}
          />
        )}

        {/* Range fill para múltiplos valores */}
        {value.length > 1 && (
          <div
            className={cn(
              'absolute bg-blue-600 dark:bg-blue-500 rounded-full',
              isVertical ? 'w-full' : 'h-full'
            )}
            style={{
              [isVertical ? 'bottom' : 'left']: `${normalizeValue(Math.min(...value))}%`,
              [isVertical ? 'height' : 'width']: `${normalizeValue(Math.max(...value)) - normalizeValue(Math.min(...value))}%`
            }}
          />
        )}

        {/* Thumbs */}
        {value.map((val, index) => (
          <div
            key={index}
            className={cn(
              'absolute w-5 h-5 bg-white dark:bg-gray-900 border-2 border-blue-600 dark:border-blue-500 rounded-full shadow-md cursor-grab transition-all duration-150',
              'hover:border-blue-700 dark:hover:border-blue-400 hover:shadow-lg',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900',
              isDragging && dragIndex === index && 'cursor-grabbing scale-110 shadow-lg',
              disabled && 'cursor-not-allowed'
            )}
            style={{
              [isVertical ? 'bottom' : 'left']: `calc(${normalizeValue(val)}% - 10px)`
            }}
            onMouseDown={handleMouseDown(index)}
            onTouchStart={handleTouchStart(index)}
            onKeyDown={handleKeyDown(index)}
            tabIndex={disabled ? -1 : 0}
            role="slider"
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={val}
            aria-label={ariaLabel || `Slider ${index + 1}`}
            aria-labelledby={ariaLabelledBy}
            aria-disabled={disabled}
            aria-orientation={orientation}
          />
        ))}
      </div>

      {/* Labels opcionais */}
      <div className={cn(
        'flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1',
        isVertical && 'hidden'
      )}>
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}; 