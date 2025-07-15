import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { theme as designTokens } from '../../design-system/tokens';
import { Heading, Text } from '../../design-system/components/Layout';
import { Button } from '../../design-system/components/Button';

// V7.5 Enhanced Breadcrumb Types
export interface BreadcrumbItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  isDropdown?: boolean;
  dropdownItems?: BreadcrumbItem[];
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  variant?: 'default' | 'glass' | 'minimal' | 'cards';
  size?: 'sm' | 'md' | 'lg';
  showBackButton?: boolean;
  showHomeIcon?: boolean;
  maxItems?: number;
  className?: string;
  separator?: React.ReactNode;
  onItemClick?: (item: BreadcrumbItem) => void;
  onBackClick?: () => void;
}

// V7.5 Enhanced Breadcrumb Component
export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  variant = 'glass',
  size = 'md',
  showBackButton = false,
  showHomeIcon = true,
  maxItems = 5,
  className,
  separator = <ChevronRight size={16} />,
  onItemClick,
  onBackClick,
}) => {
  // V7.5 Enhanced Item Processing
  const processedItems = React.useMemo(() => {
    if (items.length <= maxItems) return items;
    
    // Collapse middle items if exceeded maxItems
    const firstItem = items[0];
    const lastItems = items.slice(-(maxItems - 2));
    
    return [
      firstItem,
      {
        id: 'collapsed',
        label: '...',
        isDropdown: true,
        dropdownItems: items.slice(1, -(maxItems - 2)),
      },
      ...lastItems,
    ];
  }, [items, maxItems]);

  // V7.5 Enhanced Style System
  const getVariantStyles = () => {
    const baseStyles = {
      display: 'flex',
      alignItems: 'center',
      padding: designTokens.spacing.md,
      borderRadius: designTokens.borderRadius.lg,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    };

    const variantStyles = {
      default: {
        background: designTokens.colors.background,
        border: `1px solid ${designTokens.colors.border}`,
      },
      glass: {
        background: designTokens.glassEffect.light,
        backdropFilter: 'blur(12px)',
        border: `1px solid ${designTokens.colors.border}`,
        boxShadow: designTokens.shadows.sm,
      },
      minimal: {
        background: 'transparent',
      },
      cards: {
        background: designTokens.colors.background,
        boxShadow: designTokens.shadows.md,
        border: `1px solid ${designTokens.colors.border}`,
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

  // V7.5 Enhanced Back Button Component
  const BackButton: React.FC = () => {
    if (!showBackButton) return null;

    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={onBackClick}
        className={cn(
          'mr-2 p-2 transition-all duration-200',
          'hover:scale-105 focus:scale-105'
        )}
        aria-label="Voltar à página anterior"
      >
        {/* ArrowLeft size is not defined in the new imports, so it's removed */}
      </Button>
    );
  };

  // V7.5 Enhanced Breadcrumb Item Component
  const BreadcrumbItemComponent: React.FC<{ 
    item: BreadcrumbItem; 
    isLast: boolean;
    index: number;
  }> = ({ item, isLast, index }) => {
    const handleClick = () => {
      if (onItemClick) {
        onItemClick(item);
      }
    };

    const itemContent = (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        className={cn(
          'flex items-center gap-2 transition-all duration-200',
          'group relative',
          item.href && !item.isActive && 'cursor-pointer hover:scale-105',
          item.isActive && 'cursor-default',
          variant === 'cards' && 'px-3 py-1 rounded-md bg-white/50'
        )}
        onClick={handleClick}
      >
        {/* Home Icon for First Item */}
        {index === 0 && showHomeIcon && (
          <Home 
            size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16}
            className="opacity-70"
          />
        )}
        
        {/* Custom Icon */}
        {item.icon && index !== 0 && (
          <span className="opacity-70">
            {item.icon}
          </span>
        )}

        {/* Item Label */}
        <Text
          variant={size === 'sm' ? 'caption' : size === 'lg' ? 'body' : 'small'}
          className={cn(
            'transition-colors duration-200',
            item.isActive 
              ? 'font-semibold' 
              : 'hover:opacity-80 focus:opacity-80',
            item.href && !item.isActive && 'underline-offset-2 hover:underline'
          )}
          style={{
            color: item.isActive 
              ? designTokens.colors.text.primary 
              : designTokens.colors.text.secondary,
          }}
        >
          {item.label}
        </Text>

        {/* Active Indicator */}
        {item.isActive && variant === 'glass' && (
          <motion.div
            layoutId="breadcrumb-active"
            className="absolute inset-0 rounded-md"
            style={{
              background: designTokens.glassEffect.medium,
              zIndex: -1,
            }}
            initial={false}
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}

        {/* Dropdown Indicator */}
        {item.isDropdown && (
          <span className="text-xs opacity-50">⋯</span>
        )}
      </motion.div>
    );

    // Wrap with Link if href provided
    if (item.href && !item.isActive) {
      return (
        <Link
          to={item.href}
          className="flex items-center focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-md"
          style={{ 
            focusRingColor: designTokens.colors.primary,
            textDecoration: 'none' 
          }}
        >
          {itemContent}
        </Link>
      );
    }

    return (
      <div
        role={item.isDropdown ? "button" : undefined}
        tabIndex={item.isDropdown ? 0 : undefined}
        className={cn(
          'focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-md',
          item.isDropdown && 'cursor-pointer'
        )}
        style={{ focusRingColor: designTokens.colors.primary }}
      >
        {itemContent}
      </div>
    );
  };

  // V7.5 Enhanced Separator Component
  const SeparatorComponent: React.FC<{ index: number }> = ({ index }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 + 0.05 }}
      className="flex items-center opacity-40"
      style={{ color: designTokens.colors.text.secondary }}
      role="presentation"
      aria-hidden="true"
    >
      {separator}
    </motion.div>
  );

  return (
    <nav
      role="navigation"
      aria-label="Breadcrumb"
      className={cn('breadcrumb-v75-enhanced', className)}
      style={getVariantStyles()}
    >
      <div 
        className="flex items-center w-full"
        style={getSizeStyles()}
      >
        {/* Back Button */}
        <BackButton />

        {/* Breadcrumb Items */}
        <ol className="flex items-center list-none m-0 p-0" role="list">
          {processedItems.map((item, index) => {
            const isLast = index === processedItems.length - 1;
            
            return (
              <li key={item.id} className="flex items-center" role="listitem">
                <BreadcrumbItemComponent 
                  item={item} 
                  isLast={isLast}
                  index={index}
                />
                
                {/* Separator */}
                {!isLast && (
                  <SeparatorComponent index={index} />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};

// V7.5 Enhanced Export with Default Props
export default Breadcrumb; 