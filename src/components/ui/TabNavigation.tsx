import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus } from "lucide-react";
import { theme as designTokens } from "../../design-system/tokens";
import { Text } from "../../design-system/components/Layout";
import { Button } from "../../design-system/components/Button";
import { cn } from '../../lib/utils';

// V7.5 Enhanced Tab Types
export interface TabItem {
  id: string;
  label: string;
  content?: React.ReactNode;
  icon?: React.ReactNode;
  badge?: string | number;
  isActive?: boolean;
  isDisabled?: boolean;
  isClosable?: boolean;
  onClick?: (tab: TabItem) => void;
  onClose?: (tab: TabItem) => void;
}

export interface TabNavigationProps {
  tabs: TabItem[];
  variant?: 'default' | 'glass' | 'minimal' | 'cards' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  orientation?: 'horizontal' | 'vertical';
  allowAddTab?: boolean;
  allowCloseTab?: boolean;
  allowReorder?: boolean;
  maxTabs?: number;
  className?: string;
  tabClassName?: string;
  contentClassName?: string;
  activeTabId?: string;
  renderContent?: boolean;
  onTabChange?: (tab: TabItem) => void;
  onTabAdd?: () => void;
  onTabClose?: (tab: TabItem) => void;
  onTabReorder?: (tabs: TabItem[]) => void;
}

// V7.5 Enhanced TabNavigation Component
export const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  variant = 'glass',
  size = 'md',
  orientation = 'horizontal',
  allowAddTab = false,
  allowCloseTab = false,
  allowReorder = false,
  maxTabs = 10,
  className,
  tabClassName,
  contentClassName,
  activeTabId,
  renderContent = true,
  onTabChange,
  onTabAdd,
  onTabClose,
  onTabReorder,
}) => {
  // V7.5 Enhanced State Management
  const [internalActiveTab, setInternalActiveTab] = useState<string>(
    activeTabId || tabs.find(tab => tab.isActive)?.id || tabs[0]?.id || ''
  );
  const [draggedTab, setDraggedTab] = useState<string | null>(null);
  const [dropIndicator, setDropIndicator] = useState<number | null>(null);
  const [overflowTabs, setOverflowTabs] = useState<TabItem[]>([]);
  const [showOverflow, setShowOverflow] = useState(false);

  const tabsRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);

  // V7.5 Enhanced Active Tab Management
  const activeTab = activeTabId || internalActiveTab;
  const currentTab = tabs.find(tab => tab.id === activeTab);

  useEffect(() => {
    if (activeTabId) {
      setInternalActiveTab(activeTabId);
    }
  }, [activeTabId]);

  // V7.5 Enhanced Tab Selection Handler
  const handleTabClick = (tab: TabItem) => {
    if (tab.isDisabled) return;
    
    const newActiveTab = tab.id;
    setInternalActiveTab(newActiveTab);
    onTabChange?.(tab);
    tab.onClick?.(tab);
  };

  // V7.5 Enhanced Tab Close Handler
  const handleTabClose = (tab: TabItem, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!allowCloseTab || tab.isDisabled) return;
    
    onTabClose?.(tab);
    tab.onClose?.(tab);
  };

  // V7.5 Enhanced Add Tab Handler
  const handleAddTab = () => {
    if (tabs.length >= maxTabs) return;
    onTabAdd?.();
  };

  // V7.5 Enhanced Style System
  const getTabNavigationStyles = () => {
    const baseStyles = {
      display: 'flex',
      flexDirection: orientation === 'vertical' ? 'column' : 'row',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    };

    const variantStyles = {
      default: {
        backgroundColor: designTokens.colors.background,
        border: `1px solid ${designTokens.colors.border}`,
        borderRadius: designTokens.borderRadius.lg,
      },
      glass: {
        background: designTokens.glassEffect.light,
        backdropFilter: 'blur(12px)',
        border: `1px solid ${designTokens.colors.border}`,
        borderRadius: designTokens.borderRadius.lg,
        boxShadow: designTokens.shadows.sm,
      },
      minimal: {
        backgroundColor: 'transparent',
      },
      cards: {
        backgroundColor: 'transparent',
        gap: designTokens.spacing.xs,
      },
      underline: {
        backgroundColor: 'transparent',
        borderBottom: `2px solid ${designTokens.colors.border}`,
      },
    };

    return { ...baseStyles, ...variantStyles[variant] };
  };

  const getSizeStyles = () => {
    const sizeStyles = {
      sm: {
        padding: designTokens.spacing.sm,
        gap: designTokens.spacing.xs,
      },
      md: {
        padding: designTokens.spacing.md,
        gap: designTokens.spacing.sm,
      },
      lg: {
        padding: designTokens.spacing.lg,
        gap: designTokens.spacing.md,
      },
    };

    return sizeStyles[size];
  };

  // V7.5 Enhanced Tab Item Component
  const TabItemComponent = React.forwardRef<
    HTMLButtonElement,
    { 
      tab: TabItem; 
      index: number;
      isOverflow?: boolean;
    }
  >(({ tab, index, isOverflow = false }, ref) => {
    const isActive = tab.id === activeTab;

    const tabStyles = {
      display: 'flex',
      alignItems: 'center',
      gap: designTokens.spacing.sm,
      padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
      borderRadius: variant === 'cards' 
        ? designTokens.borderRadius.md 
        : variant === 'underline' 
        ? '0' 
        : designTokens.borderRadius.sm,
      cursor: tab.isDisabled ? 'not-allowed' : 'pointer',
      opacity: tab.isDisabled ? 0.5 : 1,
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative' as const,
      minWidth: '0',
      flex: variant === 'cards' ? 'none' : '0 1 auto',
    };

    const getTabVariantStyles = () => {
      if (variant === 'cards') {
        return {
          backgroundColor: isActive 
            ? designTokens.colors.background 
            : 'transparent',
          border: `1px solid ${designTokens.colors.border}`,
          boxShadow: isActive ? designTokens.shadows.sm : 'none',
        };
      }

      if (variant === 'underline') {
        return {
          backgroundColor: 'transparent',
          borderBottom: isActive 
            ? `2px solid ${designTokens.colors.primary}` 
            : '2px solid transparent',
        };
      }

      return {
        backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
      };
    };

    return (
      <motion.div
        className={cn(
          'tab-item flex items-center relative',
          'hover:bg-white/10 focus:bg-white/20',
          tabClassName
        )}
        style={{ ...tabStyles, ...getTabVariantStyles() }}
        onClick={() => handleTabClick(tab)}
        initial={{ opacity: 0, x: orientation === 'horizontal' ? -20 : 0, y: orientation === 'vertical' ? -20 : 0 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        exit={{ opacity: 0, x: orientation === 'horizontal' ? -20 : 0, y: orientation === 'vertical' ? -20 : 0 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ scale: tab.isDisabled ? 1 : 1.02 }}
        whileTap={{ scale: tab.isDisabled ? 1 : 0.98 }}
        role="tab"
        tabIndex={tab.isDisabled ? -1 : 0}
        aria-selected={isActive}
        aria-disabled={tab.isDisabled}
      >
        {/* Icon */}
        {tab.icon && (
          <motion.div
            className="flex-shrink-0"
            animate={{ rotate: isActive ? 5 : 0 }}
            transition={{ duration: 0.2 }}
            style={{ color: designTokens.colors.text.secondary }}
          >
            {tab.icon}
          </motion.div>
        )}

        {/* Label */}
        <Text
          variant={size === 'sm' ? 'caption' : size === 'lg' ? 'body' : 'small'}
          className={cn(
            'truncate transition-colors duration-200 select-none',
            isActive ? 'font-semibold' : 'font-medium'
          )}
          style={{
            color: isActive 
              ? designTokens.colors.text.primary 
              : designTokens.colors.text.secondary,
          }}
        >
          {tab.label}
        </Text>

        {/* Badge */}
        {tab.badge && (
          <motion.span
            className="px-2 py-1 text-xs rounded-full font-medium flex-shrink-0"
            style={{
              backgroundColor: designTokens.colors.primary,
              color: designTokens.colors.white,
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
          >
            {tab.badge}
          </motion.span>
        )}

        {/* Close Button */}
        {allowCloseTab && tab.isClosable !== false && (
          <motion.button
            className={cn(
              'ml-1 p-1 rounded-full opacity-0 group-hover:opacity-100',
              'hover:bg-white/20 transition-all duration-200'
            )}
            onClick={(e) => handleTabClose(tab, e)}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label={`Fechar aba ${tab.label}`}
          >
            <X size={14} />
          </motion.button>
        )}

        {/* Active Indicator */}
        {isActive && variant !== 'underline' && variant !== 'cards' && (
          <motion.div
            layoutId="tab-active-indicator"
            className="absolute inset-0 rounded-inherit"
            style={{
              background: designTokens.glassEffect.medium,
              zIndex: -1,
            }}
            initial={false}
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
      </motion.div>
    );
  });

  // Set display name for forwardRef
  TabItemComponent.displayName = 'TabItemComponent';

  // V7.5 Enhanced Tab List Component
  const TabListComponent: React.FC = () => (
    <div
      ref={tabsRef}
      className={cn(
        'tab-list flex overflow-hidden',
        orientation === 'vertical' ? 'flex-col' : 'flex-row'
      )}
      style={getSizeStyles()}
      role="tablist"
      aria-orientation={orientation}
    >
      <AnimatePresence mode="popLayout">
        {tabs.map((tab, index) => (
          <TabItemComponent 
            key={tab.id} 
            tab={tab} 
            index={index}
          />
        ))}
      </AnimatePresence>

      {/* Add Tab Button */}
      {allowAddTab && tabs.length < maxTabs && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: tabs.length * 0.05 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddTab}
            className="flex-shrink-0"
            aria-label="Adicionar nova aba"
          >
            <Plus size={16} />
          </Button>
        </motion.div>
      )}
    </div>
  );

  // V7.5 Enhanced Content Component
  const TabContentComponent: React.FC = () => {
    if (!renderContent || !currentTab?.content) return null;

    return (
      <motion.div
        key={activeTab}
        className={cn(
          'tab-content flex-1 overflow-auto',
          contentClassName
        )}
        style={{
          padding: designTokens.spacing.lg,
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
      >
        {currentTab.content}
      </motion.div>
    );
  };

  return (
    <div
      className={cn('tab-navigation-v75-enhanced', className)}
      style={getTabNavigationStyles()}
    >
      <TabListComponent />
      <AnimatePresence mode="wait">
        <TabContentComponent />
      </AnimatePresence>
    </div>
  );
};

// V7.5 Enhanced Default Export
export default TabNavigation; 