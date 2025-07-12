/**
 * 📐 Panel Component - Resizable Layout
 * 
 * Resizable panel component with split layouts and drag handles
 * Support for horizontal/vertical splits and nested panels
 * 
 * Part of: WEEK 0 Days 3-4 - IA Beta Advanced Components Task 2.4.2
 */

import React, { forwardRef, ReactNode, useState, useRef, HTMLAttributes } from 'react';
import { colors, spacing, typography, borderRadius, shadows, transitions } from '../../tokens';

export interface PanelProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  children: ReactNode;
  direction?: 'horizontal' | 'vertical';
  resizable?: boolean;
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  header?: ReactNode;
  footer?: ReactNode;
  collapsible?: boolean;
  collapsed?: boolean;
  onResize?: (size: number) => void;
  onCollapse?: (collapsed: boolean) => void;
}

export const Panel = forwardRef<HTMLDivElement, PanelProps>(
  ({
    children,
    direction = 'vertical',
    resizable = false,
    defaultSize = 300,
    minSize = 100,
    maxSize = 800,
    header,
    footer,
    collapsible = false,
    collapsed = false,
    onResize,
    onCollapse,
    style,
    ...props
  }, ref) => {
    
    const [size, setSize] = useState(defaultSize);
    const [isCollapsed, setIsCollapsed] = useState(collapsed);
    const [isDragging, setIsDragging] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);
    
    const handleToggleCollapse = () => {
      const newCollapsed = !isCollapsed;
      setIsCollapsed(newCollapsed);
      onCollapse?.(newCollapsed);
    };
    
    const handleMouseDown = (e: React.MouseEvent) => {
      if (!resizable) return;
      setIsDragging(true);
      e.preventDefault();
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !panelRef.current) return;
      
      const rect = panelRef.current.getBoundingClientRect();
      const newSize = direction === 'horizontal' 
        ? e.clientX - rect.left 
        : e.clientY - rect.top;
      
      const clampedSize = Math.max(minSize, Math.min(maxSize, newSize));
      setSize(clampedSize);
      onResize?.(clampedSize);
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    React.useEffect(() => {
      if (isDragging) {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        
        return () => {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        };
      }
    }, [isDragging]);
    
    const panelStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'white',
      border: `1px solid ${colors.neutral[200]}`,
      borderRadius: borderRadius.md,
      overflow: 'hidden',
      ...(direction === 'horizontal' ? { width: isCollapsed ? 'auto' : size } : { height: isCollapsed ? 'auto' : size }),
      transition: transitions.common.all,
      ...style
    };
    
    const handleStyle: React.CSSProperties = {
      backgroundColor: colors.neutral[200],
      cursor: direction === 'horizontal' ? 'ew-resize' : 'ns-resize',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      userSelect: 'none',
      ...(direction === 'horizontal' 
        ? { width: '6px', height: '100%' } 
        : { height: '6px', width: '100%' }
      )
    };
    
    return (
      <div ref={ref} style={{ display: 'flex', flexDirection: direction === 'horizontal' ? 'row' : 'column' }}>
        <div ref={panelRef} style={panelStyle} {...props}>
          {/* Header */}
          {header && (
            <div style={{
              padding: spacing[3],
              borderBottom: `1px solid ${colors.neutral[200]}`,
              backgroundColor: colors.neutral[50],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>{header}</div>
              {collapsible && (
                <button
                  onClick={handleToggleCollapse}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: spacing[1],
                    borderRadius: borderRadius.sm
                  }}
                >
                  {isCollapsed ? '▼' : '▲'}
                </button>
              )}
            </div>
          )}
          
          {/* Content */}
          {!isCollapsed && (
            <div style={{ flex: 1, padding: spacing[4], overflow: 'auto' }}>
              {children}
            </div>
          )}
          
          {/* Footer */}
          {footer && !isCollapsed && (
            <div style={{
              padding: spacing[3],
              borderTop: `1px solid ${colors.neutral[200]}`,
              backgroundColor: colors.neutral[50]
            }}>
              {footer}
            </div>
          )}
        </div>
        
        {/* Resize Handle */}
        {resizable && !isCollapsed && (
          <div
            style={handleStyle}
            onMouseDown={handleMouseDown}
          >
            <div style={{
              width: direction === 'horizontal' ? '2px' : '20px',
              height: direction === 'horizontal' ? '20px' : '2px',
              backgroundColor: colors.neutral[400],
              borderRadius: '1px'
            }} />
          </div>
        )}
      </div>
    );
  }
);

Panel.displayName = 'Panel';

export interface SplitPanelProps extends HTMLAttributes<HTMLDivElement> {
  left?: ReactNode;
  right?: ReactNode;
  top?: ReactNode;
  bottom?: ReactNode;
  direction?: 'horizontal' | 'vertical';
  defaultSplit?: number;
  minSize?: number;
  resizable?: boolean;
}

export const SplitPanel = forwardRef<HTMLDivElement, SplitPanelProps>(
  ({
    left, right, top, bottom,
    direction = 'horizontal',
    defaultSplit = 50,
    minSize = 20,
    resizable = true,
    style,
    ...props
  }, ref) => {
    
    const [split, setSplit] = useState(defaultSplit);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    
    const primary = direction === 'horizontal' ? left : top;
    const secondary = direction === 'horizontal' ? right : bottom;
    
    const handleMouseDown = (e: React.MouseEvent) => {
      if (!resizable) return;
      setIsDragging(true);
      e.preventDefault();
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const pos = direction === 'horizontal' 
        ? ((e.clientX - rect.left) / rect.width) * 100
        : ((e.clientY - rect.top) / rect.height) * 100;
      
      const clampedPos = Math.max(minSize, Math.min(100 - minSize, pos));
      setSplit(clampedPos);
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    React.useEffect(() => {
      if (isDragging) {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        
        return () => {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        };
      }
    }, [isDragging]);
    
    const containerStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: direction === 'horizontal' ? 'row' : 'column',
      width: '100%',
      height: '100%',
      ...style
    };
    
    const primaryStyle: React.CSSProperties = {
      ...(direction === 'horizontal' 
        ? { width: `${split}%`, height: '100%' }
        : { height: `${split}%`, width: '100%' }
      ),
      overflow: 'hidden'
    };
    
    const secondaryStyle: React.CSSProperties = {
      ...(direction === 'horizontal' 
        ? { width: `${100 - split}%`, height: '100%' }
        : { height: `${100 - split}%`, width: '100%' }
      ),
      overflow: 'hidden'
    };
    
    const dividerStyle: React.CSSProperties = {
      backgroundColor: colors.neutral[200],
      cursor: direction === 'horizontal' ? 'ew-resize' : 'ns-resize',
      flexShrink: 0,
      ...(direction === 'horizontal' 
        ? { width: '4px', height: '100%' }
        : { height: '4px', width: '100%' }
      )
    };
    
    return (
      <div ref={containerRef} style={containerStyle} {...props}>
        <div style={primaryStyle}>{primary}</div>
        {resizable && (
          <div style={dividerStyle} onMouseDown={handleMouseDown} />
        )}
        <div style={secondaryStyle}>{secondary}</div>
      </div>
    );
  }
);

SplitPanel.displayName = 'SplitPanel';

export default Panel; 