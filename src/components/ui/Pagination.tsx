import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, MoreHorizontal, ChevronsLeft, ChevronsRight } from 'lucide-react';

// V7.5 Enhanced Design System Integration
import { theme as designTokens } from '../../design-system/tokens';
import { Text } from '../../design-system/components/Layout';
import { Button } from '../../design-system/components/Button/Button';
import { cn } from '../../lib/utils';

// V7.5 Enhanced Pagination Types
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  itemsPerPage?: number;
  variant?: 'default' | 'glass' | 'minimal' | 'rounded' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  showPageNumbers?: boolean;
  showPageInfo?: boolean;
  showItemsPerPage?: boolean;
  maxVisiblePages?: number;
  className?: string;
  pageClassName?: string;
  onPageChange?: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  itemsPerPageOptions?: number[];
  disabled?: boolean;
  loading?: boolean;
}

// V7.5 Enhanced Pagination Component
export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage = 10,
  variant = 'glass',
  size = 'md',
  showFirstLast = true,
  showPrevNext = true,
  showPageNumbers = true,
  showPageInfo = true,
  showItemsPerPage = false,
  maxVisiblePages = 5,
  className,
  pageClassName,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [5, 10, 20, 50],
  disabled = false,
  loading = false,
}) => {
  // V7.5 Enhanced Page Calculation
  const startItem = totalItems ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = totalItems ? Math.min(currentPage * itemsPerPage, totalItems) : 0;

  // V7.5 Enhanced Visible Pages Calculation
  const getVisiblePages = () => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const halfVisible = Math.floor(maxVisiblePages / 2);
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();
  const showStartEllipsis = visiblePages[0] > 2;
  const showEndEllipsis = visiblePages[visiblePages.length - 1] < totalPages - 1;

  // V7.5 Enhanced Style System
  const getPaginationStyles = () => {
    const baseStyles = {
      display: 'flex',
      alignItems: 'center',
      gap: designTokens.spacing.sm,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    };

    const variantStyles = {
      default: {
        backgroundColor: designTokens.colors.background,
        border: `1px solid ${designTokens.colors.border}`,
        borderRadius: designTokens.borderRadius.lg,
        padding: designTokens.spacing.md,
      },
      glass: {
        background: designTokens.glassEffect.light,
        backdropFilter: 'blur(12px)',
        border: `1px solid ${designTokens.colors.border}`,
        borderRadius: designTokens.borderRadius.lg,
        padding: designTokens.spacing.md,
        boxShadow: designTokens.shadows.sm,
      },
      minimal: {
        backgroundColor: 'transparent',
        padding: designTokens.spacing.sm,
      },
      rounded: {
        backgroundColor: designTokens.colors.background,
        borderRadius: designTokens.borderRadius.full,
        padding: designTokens.spacing.md,
        boxShadow: designTokens.shadows.md,
      },
      outlined: {
        backgroundColor: 'transparent',
        border: `2px solid ${designTokens.colors.border}`,
        borderRadius: designTokens.borderRadius.lg,
        padding: designTokens.spacing.md,
      },
    };

    return { ...baseStyles, ...variantStyles[variant] };
  };

  const getSizeStyles = () => {
    const sizeStyles = {
      sm: {
        fontSize: '14px',
        gap: designTokens.spacing.xs,
      },
      md: {
        fontSize: '16px',
        gap: designTokens.spacing.sm,
      },
      lg: {
        fontSize: '18px',
        gap: designTokens.spacing.md,
      },
    };

    return sizeStyles[size];
  };

  // V7.5 Enhanced Page Button Component
  const PageButton: React.FC<{
    page: number;
    isActive?: boolean;
    isDisabled?: boolean;
    children?: React.ReactNode;
    onClick?: () => void;
    'aria-label'?: string;
  }> = ({ page, isActive = false, isDisabled = false, children, onClick, 'aria-label': ariaLabel }) => {
    const buttonStyles = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: size === 'sm' ? '32px' : size === 'lg' ? '48px' : '40px',
      height: size === 'sm' ? '32px' : size === 'lg' ? '48px' : '40px',
      borderRadius: variant === 'rounded' 
        ? designTokens.borderRadius.full 
        : designTokens.borderRadius.md,
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      opacity: isDisabled ? 0.4 : 1,
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative' as const,
    };

    const getButtonVariantStyles = () => {
      if (isActive) {
        return {
          backgroundColor: designTokens.colors.primary,
          color: designTokens.colors.white,
          boxShadow: designTokens.shadows.sm,
        };
      }

      if (variant === 'outlined') {
        return {
          backgroundColor: 'transparent',
          border: `1px solid ${designTokens.colors.border}`,
          color: designTokens.colors.text.primary,
        };
      }

      return {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        color: designTokens.colors.text.primary,
      };
    };

    return (
      <motion.button
        className={cn(
          'pagination-button flex items-center justify-center',
          'hover:bg-white/20 focus:bg-white/30 focus:outline-none',
          pageClassName
        )}
        style={{ ...buttonStyles, ...getButtonVariantStyles() }}
        onClick={onClick}
        disabled={isDisabled || disabled || loading}
        whileHover={{ scale: isDisabled ? 1 : 1.05 }}
        whileTap={{ scale: isDisabled ? 1 : 0.95 }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        aria-label={ariaLabel || `Página ${page}`}
        aria-current={isActive ? 'page' : undefined}
      >
        {children || (
          <Text
            variant={size === 'sm' ? 'caption' : size === 'lg' ? 'body' : 'small'}
            className="font-medium select-none"
          >
            {page}
          </Text>
        )}

        {/* Active Indicator */}
        {isActive && (
          <motion.div
            layoutId="pagination-active-indicator"
            className="absolute inset-0 rounded-inherit"
            style={{
              background: `linear-gradient(135deg, ${designTokens.colors.primary}, ${designTokens.colors.secondary})`,
              zIndex: -1,
            }}
            initial={false}
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
      </motion.button>
    );
  };

  // V7.5 Enhanced Navigation Handlers
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || disabled || loading) return;
    onPageChange?.(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    onItemsPerPageChange?.(newItemsPerPage);
  };

  // V7.5 Enhanced Ellipsis Component
  const EllipsisButton: React.FC = () => (
    <div
      className="flex items-center justify-center"
      style={{
        minWidth: size === 'sm' ? '32px' : size === 'lg' ? '48px' : '40px',
        height: size === 'sm' ? '32px' : size === 'lg' ? '48px' : '40px',
        color: designTokens.colors.text.secondary,
      }}
    >
      <MoreHorizontal size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />
    </div>
  );

  // V7.5 Enhanced Page Info Component
  const PageInfo: React.FC = () => {
    if (!showPageInfo) return null;

    return (
      <Text
        variant={size === 'sm' ? 'caption' : size === 'lg' ? 'body' : 'small'}
        className="select-none whitespace-nowrap"
        style={{ color: designTokens.colors.text.secondary }}
      >
        {totalItems ? (
          `${startItem}-${endItem} de ${totalItems} itens`
        ) : (
          `Página ${currentPage} de ${totalPages}`
        )}
      </Text>
    );
  };

  // V7.5 Enhanced Items Per Page Selector
  const ItemsPerPageSelector: React.FC = () => {
    if (!showItemsPerPage || !onItemsPerPageChange) return null;

    return (
      <div className="flex items-center gap-2">
        <Text
          variant={size === 'sm' ? 'caption' : 'small'}
          style={{ color: designTokens.colors.text.secondary }}
        >
          Itens por página:
        </Text>
        <select
          value={itemsPerPage}
          onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
          className="px-2 py-1 rounded border focus:outline-none focus:ring-2"
          style={{
            backgroundColor: designTokens.colors.background,
            borderColor: designTokens.colors.border,
            focusRingColor: designTokens.colors.primary,
            color: designTokens.colors.text.primary,
            fontSize: size === 'sm' ? '12px' : size === 'lg' ? '16px' : '14px',
          }}
          disabled={disabled || loading}
        >
          {itemsPerPageOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    );
  };

  if (totalPages <= 1 && !showPageInfo && !showItemsPerPage) {
    return null;
  }

  return (
    <div
      className={cn('pagination-v75-enhanced flex flex-wrap items-center justify-between gap-4', className)}
      style={getPaginationStyles()}
      role="navigation"
      aria-label="Paginação"
    >
      {/* Page Info & Items Per Page */}
      <div className="flex items-center gap-4">
        <PageInfo />
        <ItemsPerPageSelector />
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center" style={getSizeStyles()}>
          {/* First Page */}
          {showFirstLast && (
            <PageButton
              page={1}
              isDisabled={currentPage === 1}
              onClick={() => handlePageChange(1)}
              aria-label="Primeira página"
            >
              <ChevronsLeft size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />
            </PageButton>
          )}

          {/* Previous Page */}
          {showPrevNext && (
            <PageButton
              page={currentPage - 1}
              isDisabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              aria-label="Página anterior"
            >
              <ChevronLeft size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />
            </PageButton>
          )}

          {/* Page Numbers */}
          {showPageNumbers && (
            <>
              {/* First page if not in visible range */}
              {showStartEllipsis && (
                <>
                  <PageButton
                    page={1}
                    isActive={currentPage === 1}
                    onClick={() => handlePageChange(1)}
                  />
                  <EllipsisButton />
                </>
              )}

              {/* Visible page range */}
              {visiblePages.map((page) => (
                <PageButton
                  key={page}
                  page={page}
                  isActive={currentPage === page}
                  onClick={() => handlePageChange(page)}
                />
              ))}

              {/* Last page if not in visible range */}
              {showEndEllipsis && (
                <>
                  <EllipsisButton />
                  <PageButton
                    page={totalPages}
                    isActive={currentPage === totalPages}
                    onClick={() => handlePageChange(totalPages)}
                  />
                </>
              )}
            </>
          )}

          {/* Next Page */}
          {showPrevNext && (
            <PageButton
              page={currentPage + 1}
              isDisabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              aria-label="Próxima página"
            >
              <ChevronRight size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />
            </PageButton>
          )}

          {/* Last Page */}
          {showFirstLast && (
            <PageButton
              page={totalPages}
              isDisabled={currentPage === totalPages}
              onClick={() => handlePageChange(totalPages)}
              aria-label="Última página"
            >
              <ChevronsRight size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />
            </PageButton>
          )}
        </div>
      )}
    </div>
  );
};

// V7.5 Enhanced Default Export
export default Pagination; 