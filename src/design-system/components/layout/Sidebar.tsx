/**
 * 📱 Sidebar Component - Navigation Layout
 * 
 * Collapsible sidebar component with responsive behavior and navigation items
 * Support for nested menus, icons, and mobile-friendly interactions
 * 
 * Part of: WEEK 0 Days 3-4 - IA Beta Advanced Components Task 2.4.2
 */

import React, { forwardRef, ReactNode, useState, HTMLAttributes } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown, Menu, X, Home, Settings } from 'lucide-react';

// V7.5 Enhanced Design System Integration
import { theme as designTokens } from '../../tokens';
import { Heading, Text } from '../Layout';
import { Button } from '../Button';
import { cn } from '../../../lib/utils';

// V7.5 Enhanced Sidebar Types
export interface SidebarItem {
  id: string;
  label: string;
  icon?: ReactNode;
  href?: string;
  isActive?: boolean;
  isDisabled?: boolean;
  badge?: string | number;
  children?: SidebarItem[];
  onClick?: () => void;
  external?: boolean;
}

export interface SidebarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  items: SidebarItem[];
  collapsed?: boolean;
  collapsible?: boolean;
  width?: string;
  collapsedWidth?: string;
  position?: 'left' | 'right';
  variant?: 'default' | 'glass' | 'minimal' | 'floating';
  title?: string;
  logo?: ReactNode;
  showTitle?: boolean;
  autoCollapse?: boolean;
  onItemClick?: (item: SidebarItem) => void;
  onToggle?: (collapsed: boolean) => void;
}

// V7.5 Enhanced Sidebar Component
export const Sidebar = forwardRef<HTMLDivElement, SidebarProps>(
  ({
    items,
    collapsed = false,
    collapsible = true,
    width = '280px',
    collapsedWidth = '72px',
    position = 'left',
    variant = 'glass',
    title = 'Menu',
    logo,
    showTitle = true,
    autoCollapse = false,
    onItemClick,
    onToggle,
    style,
    className,
    ...props
  }, ref) => {
    
    // V7.5 Enhanced State Management
    const [isCollapsed, setIsCollapsed] = useState(collapsed);
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);
    
    // V7.5 Enhanced Handlers
    const handleToggle = () => {
      const newCollapsed = !isCollapsed;
      setIsCollapsed(newCollapsed);
      onToggle?.(newCollapsed);
      
      // Auto-collapse nested items when sidebar collapses
      if (newCollapsed) {
        setExpandedItems(new Set());
      }
    };
    
    const handleItemClick = (item: SidebarItem) => {
      if (item.isDisabled) return;
      
      if (item.children && item.children.length > 0) {
        // Handle nested items
        const newExpanded = new Set(expandedItems);
        if (newExpanded.has(item.id)) {
          newExpanded.delete(item.id);
        } else {
          newExpanded.add(item.id);
        }
        setExpandedItems(newExpanded);
      } else {
        // Handle leaf items
        onItemClick?.(item);
        item.onClick?.();
        
        // Auto-collapse on mobile
        if (autoCollapse && window.innerWidth <= 768) {
          setIsCollapsed(true);
        }
      }
    };

    // V7.5 Enhanced Style System
    const getSidebarStyles = () => {
      const baseStyles = {
        width: isCollapsed ? collapsedWidth : width,
        height: '100vh',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        position: 'relative' as const,
        zIndex: 10,
      };

      const variantStyles = {
        default: {
          backgroundColor: designTokens.colors.background,
          borderRight: `1px solid ${designTokens.colors.border}`,
        },
        glass: {
          background: designTokens.glassEffect.medium,
          backdropFilter: 'blur(20px)',
          borderRight: `1px solid ${designTokens.colors.border}`,
          boxShadow: designTokens.shadows.lg,
        },
        minimal: {
          backgroundColor: 'transparent',
        },
        floating: {
          backgroundColor: designTokens.colors.background,
          boxShadow: designTokens.shadows.xl,
          margin: designTokens.spacing.md,
          borderRadius: designTokens.borderRadius.lg,
          height: `calc(100vh - ${designTokens.spacing.lg})`,
        },
      };

      return { ...baseStyles, ...variantStyles[variant], ...style };
    };

    // V7.5 Enhanced Header Component
    const SidebarHeader: React.FC = () => (
      <motion.header
        className="border-b flex items-center justify-between p-4"
        style={{ 
          borderColor: designTokens.colors.border,
          minHeight: '72px'
        }}
        animate={{ padding: isCollapsed ? '16px 12px' : '16px' }}
        transition={{ duration: 0.3 }}
      >
        {/* Logo & Title */}
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3"
            >
              {logo && (
                <div className="w-8 h-8 flex items-center justify-center">
                  {logo}
                </div>
              )}
              {showTitle && (
                <Heading 
                  variant="h4" 
                  className="font-semibold"
                  style={{ color: designTokens.colors.text.primary }}
                >
                  {title}
                </Heading>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle Button */}
        {collapsible && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggle}
            className={cn(
              'transition-all duration-200 hover:scale-105',
              isCollapsed && 'mx-auto'
            )}
            aria-label={isCollapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
          >
            {isCollapsed ? <Menu size={20} /> : <X size={20} />}
          </Button>
        )}
      </motion.header>
    );

    // V7.5 Enhanced Navigation Item Component
    const SidebarItemComponent: React.FC<{
      item: SidebarItem;
      level?: number;
      index: number;
    }> = ({ item, level = 0, index }) => {
      const hasChildren = item.children && item.children.length > 0;
      const isExpanded = expandedItems.has(item.id);
      const isHovered = hoveredItem === item.id;

      const itemContent = (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className={cn(
            'flex items-center justify-between p-3 mx-2 rounded-lg',
            'transition-all duration-200 cursor-pointer relative group',
            item.isActive && 'bg-white/20',
            item.isDisabled && 'opacity-50 cursor-not-allowed',
            !item.isDisabled && 'hover:bg-white/10 focus:bg-white/20'
          )}
          style={{
            marginLeft: level > 0 ? `${level * 16}px` : 0,
          }}
          onClick={() => handleItemClick(item)}
          onMouseEnter={() => setHoveredItem(item.id)}
          onMouseLeave={() => setHoveredItem(null)}
          role="button"
          tabIndex={item.isDisabled ? -1 : 0}
          aria-expanded={hasChildren ? isExpanded : undefined}
          aria-disabled={item.isDisabled}
        >
          {/* Icon & Label */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Icon */}
            {item.icon && (
              <motion.div
                className="flex-shrink-0"
                animate={{ 
                  scale: isHovered ? 1.1 : 1,
                  rotate: item.isActive ? 5 : 0 
                }}
                transition={{ duration: 0.2 }}
                style={{ color: designTokens.colors.text.secondary }}
              >
                {item.icon}
              </motion.div>
            )}

            {/* Label */}
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 min-w-0"
                >
                  <Text
                    variant="small"
                    className={cn(
                      'truncate transition-colors duration-200',
                      item.isActive ? 'font-semibold' : 'font-medium'
                    )}
                    style={{
                      color: item.isActive 
                        ? designTokens.colors.text.primary 
                        : designTokens.colors.text.secondary,
                    }}
                  >
                    {item.label}
                  </Text>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Badges & Indicators */}
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2"
              >
                {/* Badge */}
                {item.badge && (
                  <span
                    className="px-2 py-1 text-xs rounded-full font-medium"
                    style={{
                      backgroundColor: designTokens.colors.primary,
                      color: designTokens.colors.white,
                    }}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Expand Indicator */}
                {hasChildren && (
                  <motion.div
                    animate={{ rotate: isExpanded ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ color: designTokens.colors.text.secondary }}
                  >
                    <ChevronRight size={16} />
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active Indicator */}
          {item.isActive && (
            <motion.div
              layoutId="sidebar-active-indicator"
              className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full"
              style={{ backgroundColor: designTokens.colors.primary }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
        </motion.div>
      );

      // Wrap with Link if href is provided
      if (item.href && !item.isDisabled && !hasChildren) {
        return (
          <Link
            to={item.href}
            className="block focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg"
            style={{ focusRingColor: designTokens.colors.primary }}
            target={item.external ? '_blank' : undefined}
            rel={item.external ? 'noopener noreferrer' : undefined}
          >
            {itemContent}
          </Link>
        );
      }

      return (
        <div
          className="focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg"
          style={{ focusRingColor: designTokens.colors.primary }}
        >
          {itemContent}
        </div>
      );
    };

    // V7.5 Enhanced Navigation Section
    const NavigationSection: React.FC = () => (
      <nav 
        className="flex-1 overflow-y-auto py-4" 
        style={{ 
          scrollbarWidth: 'thin',
          scrollbarColor: `${designTokens.colors.border} transparent`
        }}
        role="navigation"
        aria-label="Navegação principal"
      >
        <div className="space-y-1">
          {items.map((item, index) => (
            <div key={item.id}>
              <SidebarItemComponent item={item} index={index} />
              
              {/* Nested Items */}
              <AnimatePresence>
                {!isCollapsed && 
                 item.children && 
                 expandedItems.has(item.id) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="ml-4 mt-2 space-y-1">
                      {item.children.map((child, childIndex) => (
                        <SidebarItemComponent 
                          key={child.id} 
                          item={child} 
                          level={1}
                          index={childIndex}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </nav>
    );

    return (
      <motion.aside
        ref={ref}
        className={cn('sidebar-v75-enhanced flex flex-col', className)}
        style={getSidebarStyles()}
        animate={{ 
          width: isCollapsed ? collapsedWidth : width 
        }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 30 
        }}
        {...props}
      >
        <SidebarHeader />
        <NavigationSection />
      </motion.aside>
    );
  }
);

// V7.5 Enhanced Display Name
Sidebar.displayName = 'Sidebar';

// V7.5 Enhanced Default Export
export default Sidebar; 