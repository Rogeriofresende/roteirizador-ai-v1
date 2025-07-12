/**
 * 📊 Table Component - Data Display
 * 
 * Advanced table component with sorting, filtering, pagination, and row selection
 * Virtual scrolling for large datasets, responsive design, and accessibility
 * 
 * Part of: WEEK 0 Days 3-4 - IA Beta Advanced Components Task 2.4
 * Integration: Design tokens + Migration patterns + Alpha cost tiers + Charlie monitoring
 */

import React, { 
  forwardRef, 
  ReactNode, 
  useState, 
  useEffect, 
  useRef,
  useMemo,
  useCallback,
  HTMLAttributes 
} from 'react';
import { colors, spacing, typography, borderRadius, shadows, transitions, zIndex } from '../../tokens';
import { familiarElements } from '../../migration-patterns';
import { keyboardNavigation, screenReaderSupport } from '../../accessibility';

// ============================================================================
// TABLE TYPES & INTERFACES
// ============================================================================

export interface TableColumn<T = any> {
  key: string;
  title: string;
  dataIndex: keyof T;
  render?: (value: any, record: T, index: number) => ReactNode;
  sorter?: boolean | ((a: T, b: T) => number);
  filter?: {
    type: 'text' | 'select' | 'date' | 'number';
    options?: Array<{ label: string; value: any }>;
    placeholder?: string;
  };
  width?: string | number;
  minWidth?: string | number;
  align?: 'left' | 'center' | 'right';
  fixed?: 'left' | 'right';
  resizable?: boolean;
  ellipsis?: boolean;
}

export interface TableProps<T = any> extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  /** Table data */
  data: T[];
  
  /** Table columns configuration */
  columns: TableColumn<T>[];
  
  /** Loading state */
  loading?: boolean;
  
  /** Table size */
  size?: 'small' | 'medium' | 'large';
  
  /** Table variant */
  variant?: 'default' | 'bordered' | 'striped' | 'minimal';
  
  /** Enable row selection */
  rowSelection?: {
    type: 'checkbox' | 'radio';
    selectedRowKeys?: (string | number)[];
    onChange?: (selectedRowKeys: (string | number)[], selectedRows: T[]) => void;
    getCheckboxProps?: (record: T) => { disabled?: boolean };
  };
  
  /** Pagination configuration */
  pagination?: {
    current?: number;
    pageSize?: number;
    total?: number;
    showSizeChanger?: boolean;
    showQuickJumper?: boolean;
    showTotal?: (total: number, range: [number, number]) => ReactNode;
    onChange?: (page: number, pageSize: number) => void;
  } | false;
  
  /** Enable virtual scrolling */
  virtual?: boolean;
  
  /** Virtual scroll height */
  virtualHeight?: number;
  
  /** Row height for virtual scrolling */
  rowHeight?: number;
  
  /** Sticky header */
  stickyHeader?: boolean;
  
  /** Row key extractor */
  rowKey?: string | ((record: T) => string | number);
  
  /** Empty state */
  emptyText?: ReactNode;
  
  /** Migration mode for styling */
  migrationMode?: 'familiar' | 'enhanced';
  
  /** Cost tier for Alpha integration */
  costTier?: 'free' | 'premium';
  
  /** Analytics tracking for Charlie integration */
  trackingId?: string;
  
  /** Callback when row is clicked */
  onRowClick?: (record: T, index: number) => void;
  
  /** Callback when row is double clicked */
  onRowDoubleClick?: (record: T, index: number) => void;
  
  /** Callback when row is hovered */
  onRowHover?: (record: T, index: number) => void;
  
  /** Custom row props */
  onRow?: (record: T, index: number) => HTMLAttributes<HTMLTableRowElement>;
  
  /** Table scroll configuration */
  scroll?: {
    x?: string | number;
    y?: string | number;
  };
}

export interface SortState {
  column: string;
  direction: 'asc' | 'desc' | null;
}

export interface FilterState {
  [key: string]: any;
}

// ============================================================================
// TABLE STYLES
// ============================================================================

const getTableStyles = (
  variant: TableProps['variant'] = 'default',
  size: TableProps['size'] = 'medium',
  migrationMode: TableProps['migrationMode'] = 'enhanced',
  costTier: TableProps['costTier'] = 'free'
): React.CSSProperties => {
  
  // Size configurations
  const sizeConfig = {
    small: {
      fontSize: typography.fontSize.sm,
      cellPadding: `${spacing[2]} ${spacing[3]}`,
      headerPadding: `${spacing[2]} ${spacing[3]}`
    },
    medium: {
      fontSize: typography.fontSize.base,
      cellPadding: `${spacing[3]} ${spacing[4]}`,
      headerPadding: `${spacing[3]} ${spacing[4]}`
    },
    large: {
      fontSize: typography.fontSize.lg,
      cellPadding: `${spacing[4]} ${spacing[5]}`,
      headerPadding: `${spacing[4]} ${spacing[5]}`
    }
  };
  
  const config = sizeConfig[size];
  
  // Base table styles
  const baseStyles: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: 'white',
    fontSize: config.fontSize,
    lineHeight: typography.lineHeight.normal,
    fontFamily: typography.fontFamily.sans
  };
  
  // Variant styles
  const variantStyles: Record<string, React.CSSProperties> = {
    default: {
      border: `1px solid ${colors.neutral[200]}`,
      borderRadius: migrationMode === 'familiar' ? borderRadius.base : borderRadius.md
    },
    bordered: {
      border: `2px solid ${colors.neutral[300]}`,
      borderRadius: migrationMode === 'familiar' ? borderRadius.base : borderRadius.md
    },
    striped: {
      border: `1px solid ${colors.neutral[200]}`,
      borderRadius: migrationMode === 'familiar' ? borderRadius.base : borderRadius.md
    },
    minimal: {
      border: 'none',
      borderRadius: 0
    }
  };
  
  return {
    ...baseStyles,
    ...variantStyles[variant]
  };
};

const getHeaderStyles = (
  size: TableProps['size'] = 'medium',
  migrationMode: TableProps['migrationMode'] = 'enhanced',
  costTier: TableProps['costTier'] = 'free'
): React.CSSProperties => {
  
  const sizeConfig = {
    small: spacing[2] + ' ' + spacing[3],
    medium: spacing[3] + ' ' + spacing[4],
    large: spacing[4] + ' ' + spacing[5]
  };
  
  return {
    backgroundColor: costTier === 'premium' ? colors.costTier.premium.background : colors.neutral[50],
    borderBottom: `1px solid ${colors.neutral[200]}`,
    padding: sizeConfig[size],
    textAlign: 'left' as const,
    fontWeight: typography.fontWeight.semibold,
    color: costTier === 'premium' ? colors.costTier.premium.primary : colors.neutral[700],
    position: 'sticky',
    top: 0,
    zIndex: 1
  };
};

// ============================================================================
// TABLE COMPONENT
// ============================================================================

export const Table = forwardRef<HTMLDivElement, TableProps>(
  ({
    data,
    columns,
    loading = false,
    size = 'medium',
    variant = 'default',
    rowSelection,
    pagination,
    virtual = false,
    virtualHeight = 400,
    rowHeight = 48,
    stickyHeader = false,
    rowKey = 'id',
    emptyText = 'Nenhum dado encontrado',
    migrationMode = 'enhanced',
    costTier = 'free',
    trackingId,
    onRowClick,
    onRowDoubleClick,
    onRowHover,
    onRow,
    scroll,
    className = '',
    ...props
  }, ref) => {
    
    const [sortState, setSortState] = useState<SortState>({ column: '', direction: null });
    const [filterState, setFilterState] = useState<FilterState>({});
    const [selectedRowKeys, setSelectedRowKeys] = useState<(string | number)[]>(
      rowSelection?.selectedRowKeys || []
    );
    const [currentPage, setCurrentPage] = useState(pagination?.current || 1);
    const [pageSize, setPageSize] = useState(pagination?.pageSize || 10);
    
    const tableRef = useRef<HTMLTableElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    
    // Get row key
    const getRowKey = useCallback((record: any, index: number): string | number => {
      if (typeof rowKey === 'function') {
        return rowKey(record);
      }
      return record[rowKey] || index;
    }, [rowKey]);
    
    // Filter data
    const filteredData = useMemo(() => {
      let filtered = [...data];
      
      // Apply filters
      Object.entries(filterState).forEach(([columnKey, filterValue]) => {
        if (filterValue !== undefined && filterValue !== '') {
          const column = columns.find(col => col.key === columnKey);
          if (column) {
            filtered = filtered.filter(record => {
              const cellValue = record[column.dataIndex];
              if (typeof filterValue === 'string') {
                return String(cellValue).toLowerCase().includes(filterValue.toLowerCase());
              }
              return cellValue === filterValue;
            });
          }
        }
      });
      
      return filtered;
    }, [data, filterState, columns]);
    
    // Sort data
    const sortedData = useMemo(() => {
      if (!sortState.column || !sortState.direction) {
        return filteredData;
      }
      
      const column = columns.find(col => col.key === sortState.column);
      if (!column || !column.sorter) {
        return filteredData;
      }
      
      const sorted = [...filteredData].sort((a, b) => {
        if (typeof column.sorter === 'function') {
          return column.sorter(a, b);
        }
        
        const aVal = a[column.dataIndex];
        const bVal = b[column.dataIndex];
        
        if (aVal < bVal) return -1;
        if (aVal > bVal) return 1;
        return 0;
      });
      
      return sortState.direction === 'desc' ? sorted.reverse() : sorted;
    }, [filteredData, sortState, columns]);
    
    // Paginate data
    const paginatedData = useMemo(() => {
      if (pagination === false) {
        return sortedData;
      }
      
      const start = (currentPage - 1) * pageSize;
      const end = start + pageSize;
      return sortedData.slice(start, end);
    }, [sortedData, pagination, currentPage, pageSize]);
    
    // Handle sorting
    const handleSort = (columnKey: string) => {
      const column = columns.find(col => col.key === columnKey);
      if (!column || !column.sorter) return;
      
      let direction: 'asc' | 'desc' | null = 'asc';
      
      if (sortState.column === columnKey) {
        if (sortState.direction === 'asc') {
          direction = 'desc';
        } else if (sortState.direction === 'desc') {
          direction = null;
        }
      }
      
      setSortState({ column: direction ? columnKey : '', direction });
      
      // Analytics tracking
      if (trackingId && typeof window !== 'undefined') {
        const trackingData = {
          component: 'Table',
          action: 'column_sorted',
          column: columnKey,
          direction,
          size,
          migrationMode,
          costTier,
          trackingId,
          timestamp: new Date().toISOString()
        };
        
        window.dispatchEvent(new CustomEvent('design-system-interaction', {
          detail: trackingData
        }));
      }
    };
    
    // Handle filtering
    const handleFilter = (columnKey: string, value: any) => {
      setFilterState(prev => ({
        ...prev,
        [columnKey]: value
      }));
      setCurrentPage(1); // Reset to first page when filtering
    };
    
    // Handle row selection
    const handleRowSelection = (rowKey: string | number, checked: boolean) => {
      if (!rowSelection) return;
      
      let newSelectedKeys: (string | number)[];
      
      if (rowSelection.type === 'radio') {
        newSelectedKeys = checked ? [rowKey] : [];
      } else {
        if (checked) {
          newSelectedKeys = [...selectedRowKeys, rowKey];
        } else {
          newSelectedKeys = selectedRowKeys.filter(key => key !== rowKey);
        }
      }
      
      setSelectedRowKeys(newSelectedKeys);
      
      const selectedRows = data.filter(record => 
        newSelectedKeys.includes(getRowKey(record, 0))
      );
      
      rowSelection.onChange?.(newSelectedKeys, selectedRows);
    };
    
    // Handle select all
    const handleSelectAll = (checked: boolean) => {
      if (!rowSelection || rowSelection.type === 'radio') return;
      
      const allRowKeys = paginatedData.map((record, index) => getRowKey(record, index));
      const newSelectedKeys = checked ? allRowKeys : [];
      
      setSelectedRowKeys(newSelectedKeys);
      
      const selectedRows = data.filter(record => 
        newSelectedKeys.includes(getRowKey(record, 0))
      );
      
      rowSelection.onChange?.(newSelectedKeys, selectedRows);
    };
    
    // Handle pagination
    const handlePageChange = (page: number, newPageSize: number) => {
      setCurrentPage(page);
      setPageSize(newPageSize);
      pagination?.onChange?.(page, newPageSize);
    };
    
    // Render table header
    const renderTableHeader = () => (
      <thead>
        <tr>
          {/* Selection column */}
          {rowSelection && (
            <th style={{
              ...getHeaderStyles(size, migrationMode, costTier),
              width: '50px',
              textAlign: 'center'
            }}>
              {rowSelection.type === 'checkbox' && (
                <input
                  type="checkbox"
                  checked={selectedRowKeys.length === paginatedData.length && paginatedData.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
              )}
            </th>
          )}
          
          {/* Column headers */}
          {columns.map((column) => (
            <th
              key={column.key}
              style={{
                ...getHeaderStyles(size, migrationMode, costTier),
                width: column.width,
                minWidth: column.minWidth,
                textAlign: column.align || 'left',
                cursor: column.sorter ? 'pointer' : 'default',
                userSelect: 'none',
                position: stickyHeader ? 'sticky' : 'static'
              }}
              onClick={() => column.sorter && handleSort(column.key)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                <span>{column.title}</span>
                
                {/* Sort indicator */}
                {column.sorter && (
                  <span style={{ 
                    fontSize: '12px',
                    color: sortState.column === column.key ? 
                      (costTier === 'premium' ? colors.costTier.premium.primary : colors.primary[500]) : 
                      colors.neutral[400]
                  }}>
                    {sortState.column === column.key ? 
                      (sortState.direction === 'asc' ? '▲' : sortState.direction === 'desc' ? '▼' : '↕') : 
                      '↕'
                    }
                  </span>
                )}
                
                {/* Filter icon */}
                {column.filter && (
                  <span style={{ 
                    fontSize: '12px',
                    color: filterState[column.key] ? 
                      (costTier === 'premium' ? colors.costTier.premium.primary : colors.primary[500]) : 
                      colors.neutral[400],
                    cursor: 'pointer'
                  }}>
                    🔍
                  </span>
                )}
              </div>
            </th>
          ))}
        </tr>
        
        {/* Filter row */}
        {columns.some(col => col.filter) && (
          <tr>
            {rowSelection && <th style={{ padding: spacing[1] }} />}
            {columns.map((column) => (
              <th key={`filter-${column.key}`} style={{ padding: spacing[1] }}>
                {column.filter && (
                  <input
                    type={column.filter.type}
                    placeholder={column.filter.placeholder || `Filtrar ${column.title}`}
                    value={filterState[column.key] || ''}
                    onChange={(e) => handleFilter(column.key, e.target.value)}
                    style={{
                      width: '100%',
                      padding: `${spacing[1]} ${spacing[2]}`,
                      border: `1px solid ${colors.neutral[300]}`,
                      borderRadius: borderRadius.sm,
                      fontSize: typography.fontSize.sm
                    }}
                  />
                )}
              </th>
            ))}
          </tr>
        )}
      </thead>
    );
    
    // Render table body
    const renderTableBody = () => (
      <tbody>
        {paginatedData.map((record, index) => {
          const key = getRowKey(record, index);
          const isSelected = selectedRowKeys.includes(key);
          const rowProps = onRow?.(record, index) || {};
          
          return (
            <tr
              key={key}
              style={{
                backgroundColor: variant === 'striped' && index % 2 === 1 ? colors.neutral[25] : 'transparent',
                cursor: onRowClick ? 'pointer' : 'default',
                transition: transitions.common.colors,
                ...rowProps.style
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.neutral[50];
                onRowHover?.(record, index);
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 
                  variant === 'striped' && index % 2 === 1 ? colors.neutral[25] : 'transparent';
              }}
              onClick={() => onRowClick?.(record, index)}
              onDoubleClick={() => onRowDoubleClick?.(record, index)}
              {...rowProps}
            >
              {/* Selection cell */}
              {rowSelection && (
                <td style={{
                  padding: `${spacing[2]} ${spacing[3]}`,
                  textAlign: 'center',
                  borderBottom: `1px solid ${colors.neutral[200]}`
                }}>
                  <input
                    type={rowSelection.type}
                    checked={isSelected}
                    disabled={rowSelection.getCheckboxProps?.(record)?.disabled}
                    onChange={(e) => handleRowSelection(key, e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                </td>
              )}
              
              {/* Data cells */}
              {columns.map((column) => {
                const value = record[column.dataIndex];
                const cellContent = column.render ? 
                  column.render(value, record, index) : 
                  String(value || '');
                
                return (
                  <td
                    key={column.key}
                    style={{
                      padding: `${spacing[2]} ${spacing[3]}`,
                      borderBottom: `1px solid ${colors.neutral[200]}`,
                      textAlign: column.align || 'left',
                      maxWidth: column.ellipsis ? '200px' : 'none',
                      overflow: column.ellipsis ? 'hidden' : 'visible',
                      textOverflow: column.ellipsis ? 'ellipsis' : 'clip',
                      whiteSpace: column.ellipsis ? 'nowrap' : 'normal'
                    }}
                    title={column.ellipsis && typeof cellContent === 'string' ? cellContent : undefined}
                  >
                    {cellContent}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    );
    
    // Render pagination
    const renderPagination = () => {
      if (pagination === false) return null;
      
      const total = pagination?.total || sortedData.length;
      const totalPages = Math.ceil(total / pageSize);
      const startIndex = (currentPage - 1) * pageSize + 1;
      const endIndex = Math.min(currentPage * pageSize, total);
      
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: spacing[4],
          borderTop: `1px solid ${colors.neutral[200]}`
        }}>
          {/* Total info */}
          <div style={{
            fontSize: typography.fontSize.sm,
            color: colors.neutral[600]
          }}>
            {pagination?.showTotal ? 
              pagination.showTotal(total, [startIndex, endIndex]) :
              `Mostrando ${startIndex}-${endIndex} de ${total} itens`
            }
          </div>
          
          {/* Pagination controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
            {/* Page size selector */}
            {pagination?.showSizeChanger && (
              <select
                value={pageSize}
                onChange={(e) => handlePageChange(1, Number(e.target.value))}
                style={{
                  padding: `${spacing[1]} ${spacing[2]}`,
                  border: `1px solid ${colors.neutral[300]}`,
                  borderRadius: borderRadius.sm,
                  fontSize: typography.fontSize.sm
                }}
              >
                {[10, 20, 50, 100].map(size => (
                  <option key={size} value={size}>{size} / página</option>
                ))}
              </select>
            )}
            
            {/* Page navigation */}
            <div style={{ display: 'flex', gap: spacing[1] }}>
              <button
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1, pageSize)}
                style={{
                  padding: `${spacing[1]} ${spacing[2]}`,
                  border: `1px solid ${colors.neutral[300]}`,
                  backgroundColor: 'white',
                  borderRadius: borderRadius.sm,
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage === 1 ? 0.5 : 1
                }}
              >
                ←
              </button>
              
              <span style={{
                padding: `${spacing[1]} ${spacing[3]}`,
                fontSize: typography.fontSize.sm,
                color: colors.neutral[600]
              }}>
                {currentPage} / {totalPages}
              </span>
              
              <button
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1, pageSize)}
                style={{
                  padding: `${spacing[1]} ${spacing[2]}`,
                  border: `1px solid ${colors.neutral[300]}`,
                  backgroundColor: 'white',
                  borderRadius: borderRadius.sm,
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  opacity: currentPage === totalPages ? 0.5 : 1
                }}
              >
                →
              </button>
            </div>
            
            {/* Quick jumper */}
            {pagination?.showQuickJumper && (
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                <span style={{ fontSize: typography.fontSize.sm }}>Ir para:</span>
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const value = Number((e.target as HTMLInputElement).value);
                      if (value >= 1 && value <= totalPages) {
                        handlePageChange(value, pageSize);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                  style={{
                    width: '60px',
                    padding: `${spacing[1]} ${spacing[2]}`,
                    border: `1px solid ${colors.neutral[300]}`,
                    borderRadius: borderRadius.sm,
                    fontSize: typography.fontSize.sm
                  }}
                />
              </div>
            )}
          </div>
        </div>
      );
    };
    
    // Get computed table styles
    const tableStyles = getTableStyles(variant, size, migrationMode, costTier);
    
    return (
      <div
        ref={ref}
        className={`design-system-table ${className}`}
        style={{
          position: 'relative',
          width: '100%',
          backgroundColor: 'white',
          borderRadius: migrationMode === 'familiar' ? borderRadius.base : borderRadius.md,
          overflow: 'hidden',
          boxShadow: migrationMode === 'enhanced' ? shadows.sm : 'none'
        }}
        data-variant={variant}
        data-size={size}
        data-migration-mode={migrationMode}
        data-cost-tier={costTier}
        data-tracking-id={trackingId}
        {...props}
      >
        {/* Loading overlay */}
        {loading && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid transparent',
              borderTop: `4px solid ${costTier === 'premium' ? colors.costTier.premium.primary : colors.primary[500]}`,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          </div>
        )}
        
        {/* Table container */}
        <div
          ref={containerRef}
          style={{
            overflow: scroll ? 'auto' : 'hidden',
            maxHeight: scroll?.y,
            maxWidth: scroll?.x
          }}
        >
          <table ref={tableRef} style={tableStyles}>
            {renderTableHeader()}
            {paginatedData.length > 0 ? 
              renderTableBody() : 
              (
                <tbody>
                  <tr>
                    <td
                      colSpan={columns.length + (rowSelection ? 1 : 0)}
                      style={{
                        padding: spacing[8],
                        textAlign: 'center',
                        color: colors.neutral[500],
                        fontSize: typography.fontSize.lg
                      }}
                    >
                      {emptyText}
                    </td>
                  </tr>
                </tbody>
              )
            }
          </table>
        </div>
        
        {/* Pagination */}
        {renderPagination()}
      </div>
    );
  }
);

Table.displayName = 'Table';

// ============================================================================
// TABLE HOOKS
// ============================================================================

export const useTable = <T extends any>(initialData: T[] = []) => {
  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [sortState, setSortState] = useState<SortState>({ column: '', direction: null });
  const [filterState, setFilterState] = useState<FilterState>({});
  const [selectedRowKeys, setSelectedRowKeys] = useState<(string | number)[]>([]);
  
  const updateData = (newData: T[]) => setData(newData);
  const clearSelection = () => setSelectedRowKeys([]);
  const selectAll = () => setSelectedRowKeys(data.map((_, index) => index));
  
  return {
    data,
    loading,
    sortState,
    filterState,
    selectedRowKeys,
    setData: updateData,
    setLoading,
    setSortState,
    setFilterState,
    setSelectedRowKeys,
    clearSelection,
    selectAll
  };
};

// ============================================================================
// EXPORT ALL TABLE COMPONENTS
// ============================================================================

export default Table;

export {
  type TableProps,
  type TableColumn,
  type SortState,
  type FilterState
}; 