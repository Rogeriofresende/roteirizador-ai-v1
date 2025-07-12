/**
 * 🎯 Grid Component - Flexible Layout System
 * 
 * Responsive grid system with configurable columns, gaps, and alignment
 * Support for auto-layout, fractional columns, and nested grids
 * 
 * Part of: WEEK 0 Days 3-4 - IA Beta Advanced Components Task 2.4.2
 */

import React, { forwardRef, ReactNode, HTMLAttributes } from 'react';
import { spacing } from '../../tokens';

export interface GridProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  children: ReactNode;
  columns?: number | string | { sm?: number; md?: number; lg?: number; xl?: number };
  gap?: keyof typeof spacing | number;
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  justifyContent?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  autoFit?: boolean;
  minColumnWidth?: string;
}

export const Grid = forwardRef<HTMLDivElement, GridProps>(
  ({
    children,
    columns = 12,
    gap = 4,
    alignItems = 'stretch',
    justifyContent = 'start',
    autoFit = false,
    minColumnWidth = '250px',
    style,
    ...props
  }, ref) => {
    
    const getGridTemplateColumns = () => {
      if (autoFit) return `repeat(auto-fit, minmax(${minColumnWidth}, 1fr))`;
      if (typeof columns === 'number') return `repeat(${columns}, 1fr)`;
      if (typeof columns === 'string') return columns;
      return 'repeat(12, 1fr)'; // fallback
    };
    
    const gapValue = typeof gap === 'number' ? `${gap}px` : spacing[gap];
    
    const gridStyle: React.CSSProperties = {
      display: 'grid',
      gridTemplateColumns: getGridTemplateColumns(),
      gap: gapValue,
      alignItems,
      justifyContent,
      ...style
    };
    
    return (
      <div ref={ref} style={gridStyle} {...props}>
        {children}
      </div>
    );
  }
);

Grid.displayName = 'Grid';

export interface GridItemProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  span?: number | { sm?: number; md?: number; lg?: number; xl?: number };
  start?: number;
  end?: number;
}

export const GridItem = forwardRef<HTMLDivElement, GridItemProps>(
  ({ children, span = 1, start, end, style, ...props }, ref) => {
    
    const getGridColumn = () => {
      if (start && end) return `${start} / ${end}`;
      if (start) return `${start} / span ${typeof span === 'number' ? span : 1}`;
      if (typeof span === 'number') return `span ${span}`;
      return undefined;
    };
    
    const itemStyle: React.CSSProperties = {
      gridColumn: getGridColumn(),
      ...style
    };
    
    return (
      <div ref={ref} style={itemStyle} {...props}>
        {children}
      </div>
    );
  }
);

GridItem.displayName = 'GridItem';

export default Grid; 