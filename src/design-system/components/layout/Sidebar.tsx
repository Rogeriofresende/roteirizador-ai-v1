/**
 * 📱 Sidebar Component - Navigation Layout
 * 
 * Collapsible sidebar component with responsive behavior and navigation items
 * Support for nested menus, icons, and mobile-friendly interactions
 * 
 * Part of: WEEK 0 Days 3-4 - IA Beta Advanced Components Task 2.4.2
 */

import React, { forwardRef, ReactNode, useState, HTMLAttributes } from 'react';
import { colors, spacing, typography, borderRadius, shadows, transitions } from '../../tokens';

export interface SidebarItem {
  id: string;
  label: string;
  icon?: ReactNode;
  href?: string;
  active?: boolean;
  disabled?: boolean;
  children?: SidebarItem[];
  onClick?: () => void;
}

export interface SidebarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  items: SidebarItem[];
  collapsed?: boolean;
  collapsible?: boolean;
  width?: string;
  collapsedWidth?: string;
  position?: 'left' | 'right';
  variant?: 'default' | 'minimal' | 'floating';
  onItemClick?: (item: SidebarItem) => void;
  onToggle?: (collapsed: boolean) => void;
}

export const Sidebar = forwardRef<HTMLDivElement, SidebarProps>(
  ({
    items,
    collapsed = false,
    collapsible = true,
    width = '250px',
    collapsedWidth = '60px',
    position = 'left',
    variant = 'default',
    onItemClick,
    onToggle,
    style,
    ...props
  }, ref) => {
    
    const [isCollapsed, setIsCollapsed] = useState(collapsed);
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
    
    const handleToggle = () => {
      const newCollapsed = !isCollapsed;
      setIsCollapsed(newCollapsed);
      onToggle?.(newCollapsed);
    };
    
    const handleItemClick = (item: SidebarItem) => {
      if (item.children) {
        const newExpanded = new Set(expandedItems);
        if (newExpanded.has(item.id)) {
          newExpanded.delete(item.id);
        } else {
          newExpanded.add(item.id);
        }
        setExpandedItems(newExpanded);
      } else {
        onItemClick?.(item);
        item.onClick?.();
      }
    };
    
    const renderItem = (item: SidebarItem, level = 0) => (
      <div key={item.id} style={{ marginLeft: level > 0 ? spacing[4] : 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: `${spacing[2]} ${spacing[3]}`,
            cursor: item.disabled ? 'not-allowed' : 'pointer',
            backgroundColor: item.active ? colors.primary[100] : 'transparent',
            color: item.active ? colors.primary[700] : colors.neutral[700],
            borderRadius: borderRadius.md,
            margin: `${spacing[1]} 0`,
            opacity: item.disabled ? 0.5 : 1,
            transition: transitions.common.all
          }}
          onClick={() => !item.disabled && handleItemClick(item)}
        >
          {item.icon && (
            <span style={{ marginRight: isCollapsed ? 0 : spacing[2], fontSize: '18px' }}>
              {item.icon}
            </span>
          )}
          {!isCollapsed && (
            <>
              <span style={{ flex: 1, fontSize: typography.fontSize.sm }}>{item.label}</span>
              {item.children && (
                <span style={{ fontSize: '12px' }}>
                  {expandedItems.has(item.id) ? '▼' : '▶'}
                </span>
              )}
            </>
          )}
        </div>
        
        {!isCollapsed && item.children && expandedItems.has(item.id) && (
          <div>
            {item.children.map(child => renderItem(child, level + 1))}
          </div>
        )}
      </div>
    );
    
    const sidebarStyle: React.CSSProperties = {
      width: isCollapsed ? collapsedWidth : width,
      height: '100vh',
      backgroundColor: variant === 'floating' ? 'white' : colors.neutral[50],
      borderRight: variant !== 'floating' ? `1px solid ${colors.neutral[200]}` : 'none',
      boxShadow: variant === 'floating' ? shadows.lg : 'none',
      transition: transitions.common.all,
      overflow: 'hidden',
      position: 'relative',
      ...style
    };
    
    return (
      <div ref={ref} style={sidebarStyle} {...props}>
        {/* Header */}
        <div style={{
          padding: spacing[4],
          borderBottom: `1px solid ${colors.neutral[200]}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {!isCollapsed && (
            <h3 style={{
              margin: 0,
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.semibold,
              color: colors.neutral[900]
            }}>
              Menu
            </h3>
          )}
          
          {collapsible && (
            <button
              onClick={handleToggle}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: spacing[1],
                borderRadius: borderRadius.sm,
                fontSize: '16px'
              }}
            >
              {isCollapsed ? '▶' : '◀'}
            </button>
          )}
        </div>
        
        {/* Navigation */}
        <nav style={{ padding: spacing[2], flex: 1 }}>
          {items.map(item => renderItem(item))}
        </nav>
      </div>
    );
  }
);

Sidebar.displayName = 'Sidebar';
export default Sidebar; 