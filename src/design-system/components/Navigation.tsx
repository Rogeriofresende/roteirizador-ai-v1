/**
 * 🧭 Navigation Components - Design System Foundation
 * 
 * Migration-friendly navigation with accessibility and cost tier integration
 * Supporting Header, Sidebar, Breadcrumb variants with familiar/enhanced modes
 * 
 * Part of: WEEK 0 Days 3-4 - IA Beta Core Component Library
 * Integration: Design tokens + Migration patterns + Alpha cost tiers + Charlie monitoring
 */

import React, { forwardRef, HTMLAttributes, ReactNode, useState, useRef, useEffect } from 'react';
import { colors, spacing, typography, borderRadius, shadows, transitions, zIndex } from '../tokens';
import { familiarElements } from '../migration-patterns';
import { keyboardNavigation, screenReaderSupport } from '../accessibility';

// ============================================================================
// NAVIGATION TYPES & INTERFACES
// ============================================================================

export interface NavigationItem {
  id: string;
  label: string;
  href?: string;
  icon?: ReactNode;
  badge?: string | number;
  active?: boolean;
  disabled?: boolean;
  children?: NavigationItem[];
  onClick?: (event: React.MouseEvent) => void;
}

export interface NavigationProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Navigation variant */
  variant?: 'header' | 'sidebar' | 'breadcrumb' | 'tabs';
  
  /** Navigation size */
  size?: 'small' | 'medium' | 'large';
  
  /** Migration mode - familiar preserves existing look, enhanced adds improvements */
  migrationMode?: 'familiar' | 'enhanced';
  
  /** Navigation items */
  items: NavigationItem[];
  
  /** Current active item ID */
  activeItem?: string;
  
  /** Navigation logo/brand */
  logo?: ReactNode;
  
  /** Navigation title */
  title?: string;
  
  /** Navigation actions (buttons, etc.) */
  actions?: ReactNode;
  
  /** Collapsible sidebar */
  collapsible?: boolean;
  
  /** Collapsed state */
  collapsed?: boolean;
  
  /** Mobile responsive */
  responsive?: boolean;
  
  /** Cost tier for Alpha integration */
  costTier?: 'free' | 'premium';
  
  /** Analytics tracking for Charlie integration */
  trackingId?: string;
  
  /** Migration tooltip content */
  migrationTooltip?: string;
  
  /** Sticky positioning */
  sticky?: boolean;
  
  /** Callback when item is clicked */
  onItemClick?: (item: NavigationItem) => void;
  
  /** Callback when collapsed state changes */
  onCollapsedChange?: (collapsed: boolean) => void;
}

// ============================================================================
// HEADER NAVIGATION COMPONENT
// ============================================================================

export const HeaderNavigation = forwardRef<HTMLElement, NavigationProps>(
  ({
    items,
    activeItem,
    logo,
    title,
    actions,
    migrationMode = 'enhanced',
    responsive = true,
    costTier = 'free',
    trackingId,
    migrationTooltip,
    sticky = false,
    onItemClick,
    className = '',
    ...props
  }, ref) => {
    
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    
    // Header styles
    const headerStyles: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: 'white',
      borderBottom: `1px solid ${colors.neutral[200]}`,
      padding: `${spacing[4]} ${spacing[6]}`,
      boxShadow: migrationMode === 'enhanced' ? shadows.sm : undefined,
      position: sticky ? 'sticky' : 'static',
      top: sticky ? 0 : undefined,
      zIndex: sticky ? zIndex.sticky : undefined,
      transition: transitions.common.all
    };
    
    // Logo/Brand styles
    const logoStyles: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: spacing[3],
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      color: costTier === 'premium' ? colors.costTier.premium.primary : colors.primary[600],
      textDecoration: 'none'
    };
    
    // Navigation list styles
    const navListStyles: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: spacing[6],
      margin: 0,
      padding: 0,
      listStyle: 'none'
    };
    
    // Navigation item styles
    const getNavItemStyles = (item: NavigationItem): React.CSSProperties => ({
      padding: `${spacing[2]} ${spacing[4]}`,
      color: item.active ? 
        (costTier === 'premium' ? colors.costTier.premium.primary : colors.primary[600]) : 
        colors.neutral[700],
      textDecoration: 'none',
      fontSize: typography.fontSize.sm,
      fontWeight: item.active ? typography.fontWeight.semibold : typography.fontWeight.normal,
      borderRadius: migrationMode === 'enhanced' ? borderRadius.md : borderRadius.base,
      transition: transitions.common.all,
      cursor: item.disabled ? 'not-allowed' : 'pointer',
      opacity: item.disabled ? 0.5 : 1,
      backgroundColor: item.active && migrationMode === 'enhanced' ? 
        (costTier === 'premium' ? colors.costTier.premium.background : colors.primary[50]) : 
        'transparent'
    });
    
    // Actions styles
    const actionsStyles: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: spacing[3]
    };
    
    // Mobile menu button styles
    const mobileMenuButtonStyles: React.CSSProperties = {
      display: 'none',
      alignItems: 'center',
      justifyContent: 'center',
      width: '40px',
      height: '40px',
      border: 'none',
      backgroundColor: 'transparent',
      borderRadius: borderRadius.md,
      cursor: 'pointer',
      color: colors.neutral[600],
      fontSize: '20px'
    };
    
    // Mobile menu styles
    const mobileMenuStyles: React.CSSProperties = {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      backgroundColor: 'white',
      borderBottom: `1px solid ${colors.neutral[200]}`,
      boxShadow: shadows.lg,
      padding: spacing[4],
      display: mobileMenuOpen ? 'block' : 'none',
      zIndex: zIndex.dropdown
    };
    
    // Handle item click
    const handleItemClick = (item: NavigationItem, event: React.MouseEvent) => {
      if (item.disabled) {
        event.preventDefault();
        return;
      }
      
      // Analytics tracking
      if (trackingId && typeof window !== 'undefined') {
        const trackingData = {
          component: 'HeaderNavigation',
          action: 'item_click',
          itemId: item.id,
          itemLabel: item.label,
          migrationMode,
          costTier,
          trackingId,
          timestamp: new Date().toISOString()
        };
        
        window.dispatchEvent(new CustomEvent('design-system-interaction', {
          detail: trackingData
        }));
      }
      
      // Migration tooltip announcement
      if (migrationTooltip) {
        screenReaderSupport.announceToScreenReader(migrationTooltip, 'polite');
      }
      
      onItemClick?.(item);
      item.onClick?.(event);
      
      // Close mobile menu
      setMobileMenuOpen(false);
    };
    
    return (
      <header
        ref={ref}
        className={`design-system-header-navigation ${className}`}
        style={headerStyles}
        role="banner"
        {...props}
      >
        {/* Logo/Brand */}
        <div style={logoStyles}>
          {logo && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {logo}
            </div>
          )}
          {title && (
            <span>{title}</span>
          )}
        </div>
        
        {/* Desktop Navigation */}
        <nav role="navigation" aria-label="Navegação principal">
          <ul style={navListStyles} className="desktop-nav">
            {items.map((item) => (
              <li key={item.id}>
                <a
                  href={item.href}
                  style={getNavItemStyles(item)}
                  aria-current={item.active ? 'page' : undefined}
                  onClick={(e) => handleItemClick(item, e)}
                  onMouseEnter={(e) => {
                    if (!item.disabled && migrationMode === 'enhanced') {
                      e.currentTarget.style.backgroundColor = costTier === 'premium' ? 
                        colors.costTier.premium.background : colors.primary[50];
                      e.currentTarget.style.color = costTier === 'premium' ? 
                        colors.costTier.premium.primary : colors.primary[600];
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!item.disabled) {
                      const styles = getNavItemStyles(item);
                      e.currentTarget.style.backgroundColor = styles.backgroundColor as string;
                      e.currentTarget.style.color = styles.color as string;
                    }
                  }}
                >
                  {item.icon && (
                    <span style={{ marginRight: spacing[2] }} aria-hidden="true">
                      {item.icon}
                    </span>
                  )}
                  {item.label}
                  {item.badge && (
                    <span
                      style={{
                        marginLeft: spacing[2],
                        padding: `${spacing[1]} ${spacing[2]}`,
                        backgroundColor: colors.primary[500],
                        color: 'white',
                        borderRadius: borderRadius.full,
                        fontSize: typography.fontSize.xs,
                        fontWeight: typography.fontWeight.medium
                      }}
                      aria-label={`${item.badge} notificações`}
                    >
                      {item.badge}
                    </span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* Actions */}
        {actions && (
          <div style={actionsStyles}>
            {actions}
          </div>
        )}
        
        {/* Mobile Menu Button */}
        {responsive && (
          <button
            style={mobileMenuButtonStyles}
            className="mobile-menu-button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu de navegação"
            aria-expanded={mobileMenuOpen}
          >
            ☰
          </button>
        )}
        
        {/* Mobile Menu */}
        {responsive && (
          <div style={mobileMenuStyles} className="mobile-menu">
            <nav role="navigation" aria-label="Navegação móvel">
              <ul style={{ ...navListStyles, flexDirection: 'column', alignItems: 'stretch' }}>
                {items.map((item) => (
                  <li key={item.id}>
                    <a
                      href={item.href}
                      style={{
                        ...getNavItemStyles(item),
                        display: 'block',
                        width: '100%'
                      }}
                      aria-current={item.active ? 'page' : undefined}
                      onClick={(e) => handleItemClick(item, e)}
                    >
                      {item.icon && (
                        <span style={{ marginRight: spacing[2] }} aria-hidden="true">
                          {item.icon}
                        </span>
                      )}
                      {item.label}
                      {item.badge && (
                        <span
                          style={{
                            marginLeft: spacing[2],
                            padding: `${spacing[1]} ${spacing[2]}`,
                            backgroundColor: colors.primary[500],
                            color: 'white',
                            borderRadius: borderRadius.full,
                            fontSize: typography.fontSize.xs
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        )}
        
        {/* Migration Tooltip */}
        {migrationTooltip && (
          <span className="sr-only">
            {migrationTooltip}
          </span>
        )}
        
        <style jsx>{`
          @media (max-width: 768px) {
            .desktop-nav { display: none !important; }
            .mobile-menu-button { display: flex !important; }
          }
          @media (min-width: 769px) {
            .mobile-menu { display: none !important; }
          }
        `}</style>
      </header>
    );
  }
);

HeaderNavigation.displayName = 'HeaderNavigation';

// ============================================================================
// BREADCRUMB NAVIGATION COMPONENT
// ============================================================================

export interface BreadcrumbProps extends Omit<NavigationProps, 'variant'> {
  /** Breadcrumb separator */
  separator?: ReactNode;
  
  /** Maximum items to show before truncation */
  maxItems?: number;
}

export const BreadcrumbNavigation = forwardRef<HTMLElement, BreadcrumbProps>(
  ({
    items,
    separator = '/',
    maxItems = 5,
    migrationMode = 'enhanced',
    costTier = 'free',
    trackingId,
    migrationTooltip,
    onItemClick,
    className = '',
    ...props
  }, ref) => {
    
    // Breadcrumb styles
    const breadcrumbStyles: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: spacing[2],
      padding: `${spacing[2]} 0`,
      fontSize: typography.fontSize.sm,
      color: colors.neutral[600]
    };
    
    // Item styles
    const getItemStyles = (item: NavigationItem, isLast: boolean): React.CSSProperties => ({
      color: isLast ? colors.neutral[900] : colors.neutral[600],
      textDecoration: isLast ? 'none' : 'underline',
      cursor: isLast || item.disabled ? 'default' : 'pointer',
      fontWeight: isLast ? typography.fontWeight.medium : typography.fontWeight.normal,
      transition: transitions.common.colors
    });
    
    // Separator styles
    const separatorStyles: React.CSSProperties = {
      color: colors.neutral[400],
      fontSize: typography.fontSize.sm,
      userSelect: 'none'
    };
    
    // Handle item click
    const handleItemClick = (item: NavigationItem, event: React.MouseEvent, isLast: boolean) => {
      if (isLast || item.disabled) {
        event.preventDefault();
        return;
      }
      
      // Analytics tracking
      if (trackingId && typeof window !== 'undefined') {
        const trackingData = {
          component: 'BreadcrumbNavigation',
          action: 'item_click',
          itemId: item.id,
          itemLabel: item.label,
          migrationMode,
          costTier,
          trackingId,
          timestamp: new Date().toISOString()
        };
        
        window.dispatchEvent(new CustomEvent('design-system-interaction', {
          detail: trackingData
        }));
      }
      
      onItemClick?.(item);
      item.onClick?.(event);
    };
    
    // Truncate items if necessary
    const visibleItems = items.length > maxItems 
      ? [
          items[0],
          { id: 'truncated', label: '...', disabled: true },
          ...items.slice(-(maxItems - 2))
        ]
      : items;
    
    return (
      <nav
        ref={ref}
        className={`design-system-breadcrumb-navigation ${className}`}
        style={breadcrumbStyles}
        role="navigation"
        aria-label="Breadcrumb"
        {...props}
      >
        <ol style={{ display: 'flex', alignItems: 'center', gap: spacing[2], margin: 0, padding: 0, listStyle: 'none' }}>
          {visibleItems.map((item, index) => {
            const isLast = index === visibleItems.length - 1;
            const isTruncated = item.id === 'truncated';
            
            return (
              <React.Fragment key={item.id}>
                <li>
                  {isTruncated ? (
                    <span style={getItemStyles(item, false)}>
                      {item.label}
                    </span>
                  ) : (
                    <a
                      href={item.href}
                      style={getItemStyles(item, isLast)}
                      aria-current={isLast ? 'page' : undefined}
                      onClick={(e) => handleItemClick(item, e, isLast)}
                      onMouseEnter={(e) => {
                        if (!isLast && !item.disabled && migrationMode === 'enhanced') {
                          e.currentTarget.style.color = costTier === 'premium' ? 
                            colors.costTier.premium.primary : colors.primary[600];
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isLast && !item.disabled) {
                          e.currentTarget.style.color = colors.neutral[600];
                        }
                      }}
                    >
                      {item.icon && (
                        <span style={{ marginRight: spacing[1] }} aria-hidden="true">
                          {item.icon}
                        </span>
                      )}
                      {item.label}
                    </a>
                  )}
                </li>
                
                {!isLast && (
                  <li aria-hidden="true">
                    <span style={separatorStyles}>
                      {separator}
                    </span>
                  </li>
                )}
              </React.Fragment>
            );
          })}
        </ol>
        
        {/* Migration Tooltip */}
        {migrationTooltip && (
          <span className="sr-only">
            {migrationTooltip}
          </span>
        )}
      </nav>
    );
  }
);

BreadcrumbNavigation.displayName = 'BreadcrumbNavigation';

// ============================================================================
// TAB NAVIGATION COMPONENT
// ============================================================================

export const TabNavigation = forwardRef<HTMLElement, NavigationProps>(
  ({
    items,
    activeItem,
    migrationMode = 'enhanced',
    costTier = 'free',
    trackingId,
    migrationTooltip,
    onItemClick,
    className = '',
    ...props
  }, ref) => {
    
    const [focusedIndex, setFocusedIndex] = useState(0);
    const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
    
    // Tab container styles
    const tabContainerStyles: React.CSSProperties = {
      display: 'flex',
      borderBottom: `1px solid ${colors.neutral[200]}`,
      overflow: 'auto'
    };
    
    // Tab styles
    const getTabStyles = (item: NavigationItem, index: number): React.CSSProperties => ({
      padding: `${spacing[3]} ${spacing[4]}`,
      border: 'none',
      backgroundColor: 'transparent',
      color: item.active ? 
        (costTier === 'premium' ? colors.costTier.premium.primary : colors.primary[600]) : 
        colors.neutral[600],
      fontSize: typography.fontSize.sm,
      fontWeight: item.active ? typography.fontWeight.semibold : typography.fontWeight.normal,
      cursor: item.disabled ? 'not-allowed' : 'pointer',
      opacity: item.disabled ? 0.5 : 1,
      borderBottom: item.active ? 
        `2px solid ${costTier === 'premium' ? colors.costTier.premium.primary : colors.primary[600]}` : 
        '2px solid transparent',
      transition: transitions.common.all,
      outline: 'none'
    });
    
    // Handle keyboard navigation
    const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
      let newIndex = index;
      
      switch (event.key) {
        case keyboardNavigation.shortcuts.ARROW_LEFT:
          newIndex = index > 0 ? index - 1 : items.length - 1;
          break;
        case keyboardNavigation.shortcuts.ARROW_RIGHT:
          newIndex = index < items.length - 1 ? index + 1 : 0;
          break;
        case keyboardNavigation.shortcuts.HOME:
          newIndex = 0;
          break;
        case keyboardNavigation.shortcuts.END:
          newIndex = items.length - 1;
          break;
        default:
          return;
      }
      
      event.preventDefault();
      setFocusedIndex(newIndex);
      tabRefs.current[newIndex]?.focus();
    };
    
    // Handle tab click
    const handleTabClick = (item: NavigationItem, index: number) => {
      if (item.disabled) return;
      
      setFocusedIndex(index);
      
      // Analytics tracking
      if (trackingId && typeof window !== 'undefined') {
        const trackingData = {
          component: 'TabNavigation',
          action: 'tab_click',
          itemId: item.id,
          itemLabel: item.label,
          migrationMode,
          costTier,
          trackingId,
          timestamp: new Date().toISOString()
        };
        
        window.dispatchEvent(new CustomEvent('design-system-interaction', {
          detail: trackingData
        }));
      }
      
      onItemClick?.(item);
    };
    
    return (
      <div
        ref={ref}
        className={`design-system-tab-navigation ${className}`}
        role="tablist"
        {...props}
      >
        <div style={tabContainerStyles}>
          {items.map((item, index) => (
            <button
              key={item.id}
              ref={(el) => (tabRefs.current[index] = el)}
              role="tab"
              aria-selected={item.active}
              aria-controls={`tabpanel-${item.id}`}
              tabIndex={item.active ? 0 : -1}
              style={getTabStyles(item, index)}
              onClick={() => handleTabClick(item, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              disabled={item.disabled}
              onMouseEnter={(e) => {
                if (!item.disabled && migrationMode === 'enhanced') {
                  e.currentTarget.style.color = costTier === 'premium' ? 
                    colors.costTier.premium.primary : colors.primary[600];
                  e.currentTarget.style.backgroundColor = costTier === 'premium' ? 
                    colors.costTier.premium.background : colors.primary[50];
                }
              }}
              onMouseLeave={(e) => {
                if (!item.disabled) {
                  const styles = getTabStyles(item, index);
                  e.currentTarget.style.color = styles.color as string;
                  e.currentTarget.style.backgroundColor = styles.backgroundColor as string;
                }
              }}
            >
              {item.icon && (
                <span style={{ marginRight: spacing[2] }} aria-hidden="true">
                  {item.icon}
                </span>
              )}
              {item.label}
              {item.badge && (
                <span
                  style={{
                    marginLeft: spacing[2],
                    padding: `${spacing[1]} ${spacing[2]}`,
                    backgroundColor: colors.primary[500],
                    color: 'white',
                    borderRadius: borderRadius.full,
                    fontSize: typography.fontSize.xs
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
        
        {/* Migration Tooltip */}
        {migrationTooltip && (
          <span className="sr-only">
            {migrationTooltip}
          </span>
        )}
      </div>
    );
  }
);

TabNavigation.displayName = 'TabNavigation';

// ============================================================================
// MAIN NAVIGATION COMPONENT (Selector)
// ============================================================================

export const Navigation = forwardRef<HTMLElement, NavigationProps>(
  ({ variant = 'header', ...props }, ref) => {
    switch (variant) {
      case 'header':
        return <HeaderNavigation ref={ref} {...props} />;
      case 'breadcrumb':
        return <BreadcrumbNavigation ref={ref} {...props} />;
      case 'tabs':
        return <TabNavigation ref={ref} {...props} />;
      default:
        return <HeaderNavigation ref={ref} {...props} />;
    }
  }
);

Navigation.displayName = 'Navigation';

// ============================================================================
// EXPORT ALL NAVIGATION COMPONENTS
// ============================================================================

export default Navigation;

export {
  type NavigationProps,
  type NavigationItem,
  type BreadcrumbProps
}; 