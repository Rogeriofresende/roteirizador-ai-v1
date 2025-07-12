/**
 * 🎯 DataGrid Component - Advanced Data Display
 * 
 * Enterprise-grade data grid with cell editing, virtual scrolling, and bulk operations
 * Real-time updates, validation, and advanced filtering capabilities
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
import { colors, spacing, typography, borderRadius, shadows, transitions } from '../../tokens';
import { familiarElements } from '../../migration-patterns';
import { keyboardNavigation, screenReaderSupport } from '../../accessibility';

// ============================================================================
// DATAGRID TYPES & INTERFACES
// ============================================================================

export interface DataGridColumn<T = any> {
  key: string;
  title: string;
  dataIndex: keyof T;
  render?: (value: any, record: T, index: number, editing?: boolean) => ReactNode;
  editor?: {
    type: 'text' | 'number' | 'select' | 'date' | 'boolean' | 'custom';
    options?: Array<{ label: string; value: any }>;
    validation?: (value: any) => string | null;
    required?: boolean;
    component?: React.ComponentType<any>;
  };
  width?: string | number;
  minWidth?: string | number;
  maxWidth?: string | number;
  resizable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  editable?: boolean;
  frozen?: 'left' | 'right';
  align?: 'left' | 'center' | 'right';
  formatter?: (value: any) => string;
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'custom';
  aggregationFunction?: (values: any[]) => any;
}

export interface DataGridProps<T = any> extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  /** Grid data */
  data: T[];
  
  /** Grid columns configuration */
  columns: DataGridColumn<T>[];
  
  /** Loading state */
  loading?: boolean;
  
  /** Grid height */
  height?: number;
  
  /** Row height */
  rowHeight?: number;
  
  /** Enable virtual scrolling */
  virtual?: boolean;
  
  /** Buffer size for virtual scrolling */
  virtualBuffer?: number;
  
  /** Grid variant */
  variant?: 'default' | 'compact' | 'comfortable';
  
  /** Enable cell editing */
  editable?: boolean;
  
  /** Edit mode */
  editMode?: 'cell' | 'row' | 'batch';
  
  /** Enable row selection */
  selectable?: boolean;
  
  /** Selection type */
  selectionType?: 'single' | 'multiple';
  
  /** Enable bulk operations */
  bulkOperations?: Array<{
    key: string;
    label: string;
    icon?: ReactNode;
    action: (selectedRows: T[]) => void;
    disabled?: (selectedRows: T[]) => boolean;
  }>;
  
  /** Show summary row */
  showSummary?: boolean;
  
  /** Row key extractor */
  rowKey?: string | ((record: T) => string | number);
  
  /** Migration mode for styling */
  migrationMode?: 'familiar' | 'enhanced';
  
  /** Cost tier for Alpha integration */
  costTier?: 'free' | 'premium';
  
  /** Analytics tracking for Charlie integration */
  trackingId?: string;
  
  /** Callback when cell value changes */
  onCellChange?: (rowIndex: number, columnKey: string, newValue: any, oldValue: any) => void;
  
  /** Callback when row is selected */
  onRowSelect?: (selectedRows: T[], selectedRowKeys: (string | number)[]) => void;
  
  /** Callback when data is saved */
  onSave?: (changedData: T[]) => Promise<void>;
  
  /** Callback when data needs to be refreshed */
  onRefresh?: () => void;
  
  /** Custom cell renderer */
  cellRenderer?: (props: {
    value: any;
    record: T;
    column: DataGridColumn<T>;
    rowIndex: number;
    columnIndex: number;
    editing: boolean;
  }) => ReactNode;
}

export interface CellPosition {
  rowIndex: number;
  columnIndex: number;
}

export interface EditingCell extends CellPosition {
  value: any;
  originalValue: any;
  validation?: string;
}

// ============================================================================
// DATAGRID STYLES
// ============================================================================

const getDataGridStyles = (
  variant: DataGridProps['variant'] = 'default',
  migrationMode: DataGridProps['migrationMode'] = 'enhanced',
  costTier: DataGridProps['costTier'] = 'free'
): React.CSSProperties => {
  
  const variantConfig = {
    default: {
      cellPadding: `${spacing[3]} ${spacing[4]}`,
      fontSize: typography.fontSize.base
    },
    compact: {
      cellPadding: `${spacing[2]} ${spacing[3]}`,
      fontSize: typography.fontSize.sm
    },
    comfortable: {
      cellPadding: `${spacing[4]} ${spacing[5]}`,
      fontSize: typography.fontSize.base
    }
  };
  
  const config = variantConfig[variant];
  
  return {
    display: 'grid',
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    border: `1px solid ${colors.neutral[200]}`,
    borderRadius: migrationMode === 'familiar' ? borderRadius.base : borderRadius.md,
    overflow: 'hidden',
    fontSize: config.fontSize,
    fontFamily: typography.fontFamily.sans,
    position: 'relative'
  };
};

// ============================================================================
// DATAGRID COMPONENT
// ============================================================================

export const DataGrid = forwardRef<HTMLDivElement, DataGridProps>(
  ({
    data,
    columns,
    loading = false,
    height = 600,
    rowHeight = 48,
    virtual = true,
    virtualBuffer = 5,
    variant = 'default',
    editable = false,
    editMode = 'cell',
    selectable = false,
    selectionType = 'multiple',
    bulkOperations = [],
    showSummary = false,
    rowKey = 'id',
    migrationMode = 'enhanced',
    costTier = 'free',
    trackingId,
    onCellChange,
    onRowSelect,
    onSave,
    onRefresh,
    cellRenderer,
    className = '',
    ...props
  }, ref) => {
    
    const [selectedRowKeys, setSelectedRowKeys] = useState<(string | number)[]>([]);
    const [editingCells, setEditingCells] = useState<Map<string, EditingCell>>(new Map());
    const [scrollTop, setScrollTop] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [columnWidths, setColumnWidths] = useState<Map<string, number>>(new Map());
    const [sortConfig, setSortConfig] = useState<{ column: string; direction: 'asc' | 'desc' } | null>(null);
    const [filterValues, setFilterValues] = useState<Map<string, any>>(new Map());
    
    const containerRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    
    // Get row key
    const getRowKey = useCallback((record: any, index: number): string | number => {
      if (typeof rowKey === 'function') {
        return rowKey(record);
      }
      return record[rowKey] || index;
    }, [rowKey]);
    
    // Calculate virtual scrolling
    const visibleRange = useMemo(() => {
      if (!virtual) {
        return { start: 0, end: data.length };
      }
      
      const visibleCount = Math.ceil(height / rowHeight);
      const start = Math.max(0, Math.floor(scrollTop / rowHeight) - virtualBuffer);
      const end = Math.min(data.length, start + visibleCount + virtualBuffer * 2);
      
      return { start, end };
    }, [virtual, height, rowHeight, scrollTop, data.length, virtualBuffer]);
    
    // Filter and sort data
    const processedData = useMemo(() => {
      let filtered = [...data];
      
      // Apply filters
      filterValues.forEach((value, columnKey) => {
        if (value !== undefined && value !== '') {
          const column = columns.find(col => col.key === columnKey);
          if (column) {
            filtered = filtered.filter(record => {
              const cellValue = record[column.dataIndex];
              if (typeof value === 'string') {
                return String(cellValue).toLowerCase().includes(value.toLowerCase());
              }
              return cellValue === value;
            });
          }
        }
      });
      
      // Apply sorting
      if (sortConfig) {
        const column = columns.find(col => col.key === sortConfig.column);
        if (column) {
          filtered.sort((a, b) => {
            const aVal = a[column.dataIndex];
            const bVal = b[column.dataIndex];
            
            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
          });
        }
      }
      
      return filtered;
    }, [data, columns, filterValues, sortConfig]);
    
    // Handle cell editing
    const startEditing = (rowIndex: number, columnIndex: number) => {
      if (!editable) return;
      
      const column = columns[columnIndex];
      if (!column.editable) return;
      
      const record = processedData[rowIndex];
      const cellKey = `${rowIndex}-${columnIndex}`;
      const currentValue = record[column.dataIndex];
      
      setEditingCells(prev => new Map(prev).set(cellKey, {
        rowIndex,
        columnIndex,
        value: currentValue,
        originalValue: currentValue
      }));
    };
    
    const stopEditing = (rowIndex: number, columnIndex: number, save: boolean = true) => {
      const cellKey = `${rowIndex}-${columnIndex}`;
      const editingCell = editingCells.get(cellKey);
      
      if (!editingCell) return;
      
      if (save && editingCell.value !== editingCell.originalValue) {
        const column = columns[columnIndex];
        onCellChange?.(rowIndex, column.key, editingCell.value, editingCell.originalValue);
        
        // Analytics tracking
        if (trackingId && typeof window !== 'undefined') {
          const trackingData = {
            component: 'DataGrid',
            action: 'cell_edited',
            column: column.key,
            rowIndex,
            variant,
            migrationMode,
            costTier,
            trackingId,
            timestamp: new Date().toISOString()
          };
          
          window.dispatchEvent(new CustomEvent('design-system-interaction', {
            detail: trackingData
          }));
        }
      }
      
      setEditingCells(prev => {
        const newMap = new Map(prev);
        newMap.delete(cellKey);
        return newMap;
      });
    };
    
    const updateCellValue = (rowIndex: number, columnIndex: number, value: any) => {
      const cellKey = `${rowIndex}-${columnIndex}`;
      const editingCell = editingCells.get(cellKey);
      
      if (!editingCell) return;
      
      const column = columns[columnIndex];
      let validation: string | undefined;
      
      if (column.editor?.validation) {
        const validationResult = column.editor.validation(value);
        if (validationResult) {
          validation = validationResult;
        }
      }
      
      setEditingCells(prev => new Map(prev).set(cellKey, {
        ...editingCell,
        value,
        validation
      }));
    };
    
    // Handle row selection
    const toggleRowSelection = (rowKey: string | number) => {
      if (!selectable) return;
      
      let newSelectedKeys: (string | number)[];
      
      if (selectionType === 'single') {
        newSelectedKeys = selectedRowKeys.includes(rowKey) ? [] : [rowKey];
      } else {
        if (selectedRowKeys.includes(rowKey)) {
          newSelectedKeys = selectedRowKeys.filter(key => key !== rowKey);
        } else {
          newSelectedKeys = [...selectedRowKeys, rowKey];
        }
      }
      
      setSelectedRowKeys(newSelectedKeys);
      
      const selectedRows = processedData.filter(record => 
        newSelectedKeys.includes(getRowKey(record, 0))
      );
      
      onRowSelect?.(selectedRows, newSelectedKeys);
    };
    
    // Handle sorting
    const handleSort = (columnKey: string) => {
      const column = columns.find(col => col.key === columnKey);
      if (!column?.sortable) return;
      
      const newDirection = sortConfig?.column === columnKey && sortConfig.direction === 'asc' ? 'desc' : 'asc';
      setSortConfig({ column: columnKey, direction: newDirection });
    };
    
    // Handle filtering
    const handleFilter = (columnKey: string, value: any) => {
      setFilterValues(prev => new Map(prev).set(columnKey, value));
    };
    
    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent, rowIndex: number, columnIndex: number) => {
      const cellKey = `${rowIndex}-${columnIndex}`;
      const isEditing = editingCells.has(cellKey);
      
      if (isEditing) {
        switch (e.key) {
          case 'Enter':
            e.preventDefault();
            stopEditing(rowIndex, columnIndex, true);
            break;
          case 'Escape':
            e.preventDefault();
            stopEditing(rowIndex, columnIndex, false);
            break;
        }
      } else {
        switch (e.key) {
          case 'Enter':
          case 'F2':
            e.preventDefault();
            startEditing(rowIndex, columnIndex);
            break;
          case 'ArrowUp':
            e.preventDefault();
            if (rowIndex > 0) {
              // Focus previous row
            }
            break;
          case 'ArrowDown':
            e.preventDefault();
            if (rowIndex < processedData.length - 1) {
              // Focus next row
            }
            break;
          case 'ArrowLeft':
            e.preventDefault();
            if (columnIndex > 0) {
              // Focus previous column
            }
            break;
          case 'ArrowRight':
            e.preventDefault();
            if (columnIndex < columns.length - 1) {
              // Focus next column
            }
            break;
        }
      }
    };
    
    // Render cell editor
    const renderCellEditor = (column: DataGridColumn, editingCell: EditingCell) => {
      if (!column.editor) return null;
      
      const { type, options, component: CustomComponent } = column.editor;
      
      if (CustomComponent) {
        return (
          <CustomComponent
            value={editingCell.value}
            onChange={(value: any) => updateCellValue(editingCell.rowIndex, editingCell.columnIndex, value)}
            onBlur={() => stopEditing(editingCell.rowIndex, editingCell.columnIndex, true)}
            autoFocus
          />
        );
      }
      
      const baseInputStyles: React.CSSProperties = {
        width: '100%',
        height: '100%',
        border: editingCell.validation ? `2px solid ${colors.error[500]}` : `1px solid ${colors.primary[500]}`,
        borderRadius: borderRadius.sm,
        padding: spacing[2],
        fontSize: 'inherit',
        fontFamily: 'inherit',
        outline: 'none'
      };
      
      switch (type) {
        case 'text':
          return (
            <input
              type="text"
              value={editingCell.value || ''}
              onChange={(e) => updateCellValue(editingCell.rowIndex, editingCell.columnIndex, e.target.value)}
              onBlur={() => stopEditing(editingCell.rowIndex, editingCell.columnIndex, true)}
              style={baseInputStyles}
              autoFocus
            />
          );
          
        case 'number':
          return (
            <input
              type="number"
              value={editingCell.value || ''}
              onChange={(e) => updateCellValue(editingCell.rowIndex, editingCell.columnIndex, Number(e.target.value))}
              onBlur={() => stopEditing(editingCell.rowIndex, editingCell.columnIndex, true)}
              style={baseInputStyles}
              autoFocus
            />
          );
          
        case 'select':
          return (
            <select
              value={editingCell.value || ''}
              onChange={(e) => updateCellValue(editingCell.rowIndex, editingCell.columnIndex, e.target.value)}
              onBlur={() => stopEditing(editingCell.rowIndex, editingCell.columnIndex, true)}
              style={baseInputStyles}
              autoFocus
            >
              {options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          );
          
        case 'boolean':
          return (
            <input
              type="checkbox"
              checked={!!editingCell.value}
              onChange={(e) => updateCellValue(editingCell.rowIndex, editingCell.columnIndex, e.target.checked)}
              onBlur={() => stopEditing(editingCell.rowIndex, editingCell.columnIndex, true)}
              style={{ width: '20px', height: '20px' }}
              autoFocus
            />
          );
          
        default:
          return null;
      }
    };
    
    // Render cell content
    const renderCell = (record: any, column: DataGridColumn, rowIndex: number, columnIndex: number) => {
      const cellKey = `${rowIndex}-${columnIndex}`;
      const editingCell = editingCells.get(cellKey);
      const isEditing = !!editingCell;
      
      if (cellRenderer) {
        return cellRenderer({
          value: record[column.dataIndex],
          record,
          column,
          rowIndex,
          columnIndex,
          editing: isEditing
        });
      }
      
      if (isEditing) {
        return renderCellEditor(column, editingCell);
      }
      
      const value = record[column.dataIndex];
      
      if (column.render) {
        return column.render(value, record, rowIndex, isEditing);
      }
      
      if (column.formatter) {
        return column.formatter(value);
      }
      
      return String(value || '');
    };
    
    // Render header
    const renderHeader = () => (
      <div
        ref={headerRef}
        style={{
          display: 'flex',
          backgroundColor: costTier === 'premium' ? colors.costTier.premium.background : colors.neutral[50],
          borderBottom: `2px solid ${colors.neutral[200]}`,
          position: 'sticky',
          top: 0,
          zIndex: 2
        }}
      >
        {/* Selection column */}
        {selectable && (
          <div style={{
            width: '50px',
            padding: `${spacing[2]} ${spacing[3]}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRight: `1px solid ${colors.neutral[200]}`
          }}>
            {selectionType === 'multiple' && (
              <input
                type="checkbox"
                checked={selectedRowKeys.length === processedData.length && processedData.length > 0}
                onChange={(e) => {
                  if (e.target.checked) {
                    const allKeys = processedData.map((record, index) => getRowKey(record, index));
                    setSelectedRowKeys(allKeys);
                  } else {
                    setSelectedRowKeys([]);
                  }
                }}
              />
            )}
          </div>
        )}
        
        {/* Column headers */}
        {columns.map((column, index) => (
          <div
            key={column.key}
            style={{
              width: columnWidths.get(column.key) || column.width || 150,
              minWidth: column.minWidth || 100,
              maxWidth: column.maxWidth,
              padding: `${spacing[2]} ${spacing[3]}`,
              fontWeight: typography.fontWeight.semibold,
              color: costTier === 'premium' ? colors.costTier.premium.primary : colors.neutral[700],
              borderRight: `1px solid ${colors.neutral[200]}`,
              cursor: column.sortable ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              textAlign: column.align || 'left'
            }}
            onClick={() => column.sortable && handleSort(column.key)}
          >
            <span>{column.title}</span>
            
            {/* Sort indicator */}
            {column.sortable && (
              <span style={{ fontSize: '12px', marginLeft: spacing[1] }}>
                {sortConfig?.column === column.key ? 
                  (sortConfig.direction === 'asc' ? '▲' : '▼') : 
                  '↕'
                }
              </span>
            )}
          </div>
        ))}
      </div>
    );
    
    // Render data rows
    const renderRows = () => {
      const { start, end } = visibleRange;
      const visibleData = processedData.slice(start, end);
      
      return (
        <div
          style={{
            position: 'relative',
            height: virtual ? processedData.length * rowHeight : 'auto'
          }}
          onScroll={(e) => {
            setScrollTop(e.currentTarget.scrollTop);
            setScrollLeft(e.currentTarget.scrollLeft);
          }}
        >
          {visibleData.map((record, index) => {
            const actualIndex = start + index;
            const key = getRowKey(record, actualIndex);
            const isSelected = selectedRowKeys.includes(key);
            
            return (
              <div
                key={key}
                style={{
                  position: virtual ? 'absolute' : 'relative',
                  top: virtual ? actualIndex * rowHeight : 'auto',
                  width: '100%',
                  height: rowHeight,
                  display: 'flex',
                  backgroundColor: isSelected ? 
                    (costTier === 'premium' ? colors.costTier.premium.background : colors.primary[50]) : 
                    actualIndex % 2 === 1 ? colors.neutral[25] : 'white',
                  borderBottom: `1px solid ${colors.neutral[200]}`,
                  cursor: selectable ? 'pointer' : 'default'
                }}
                onClick={() => selectable && toggleRowSelection(key)}
              >
                {/* Selection cell */}
                {selectable && (
                  <div style={{
                    width: '50px',
                    padding: `${spacing[2]} ${spacing[3]}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRight: `1px solid ${colors.neutral[200]}`
                  }}>
                    <input
                      type={selectionType === 'single' ? 'radio' : 'checkbox'}
                      checked={isSelected}
                      onChange={() => toggleRowSelection(key)}
                    />
                  </div>
                )}
                
                {/* Data cells */}
                {columns.map((column, columnIndex) => (
                  <div
                    key={column.key}
                    style={{
                      width: columnWidths.get(column.key) || column.width || 150,
                      minWidth: column.minWidth || 100,
                      maxWidth: column.maxWidth,
                      padding: `${spacing[2]} ${spacing[3]}`,
                      borderRight: `1px solid ${colors.neutral[200]}`,
                      display: 'flex',
                      alignItems: 'center',
                      textAlign: column.align || 'left',
                      cursor: editable && column.editable ? 'pointer' : 'default',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (editable && column.editable) {
                        startEditing(actualIndex, columnIndex);
                      }
                    }}
                    onKeyDown={(e) => handleKeyDown(e, actualIndex, columnIndex)}
                    tabIndex={editable && column.editable ? 0 : -1}
                  >
                    {renderCell(record, column, actualIndex, columnIndex)}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      );
    };
    
    // Render bulk operations toolbar
    const renderBulkOperations = () => {
      if (!selectable || selectedRowKeys.length === 0 || bulkOperations.length === 0) {
        return null;
      }
      
      const selectedRows = processedData.filter(record => 
        selectedRowKeys.includes(getRowKey(record, 0))
      );
      
      return (
        <div style={{
          padding: spacing[3],
          backgroundColor: colors.primary[50],
          borderBottom: `1px solid ${colors.neutral[200]}`,
          display: 'flex',
          alignItems: 'center',
          gap: spacing[3]
        }}>
          <span style={{ fontWeight: typography.fontWeight.medium }}>
            {selectedRowKeys.length} {selectedRowKeys.length === 1 ? 'item selecionado' : 'itens selecionados'}
          </span>
          
          {bulkOperations.map(operation => (
            <button
              key={operation.key}
              disabled={operation.disabled?.(selectedRows)}
              onClick={() => operation.action(selectedRows)}
              style={{
                padding: `${spacing[1]} ${spacing[3]}`,
                backgroundColor: 'white',
                border: `1px solid ${colors.neutral[300]}`,
                borderRadius: borderRadius.sm,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: spacing[1],
                fontSize: typography.fontSize.sm
              }}
            >
              {operation.icon}
              {operation.label}
            </button>
          ))}
        </div>
      );
    };
    
    const gridStyles = getDataGridStyles(variant, migrationMode, costTier);
    
    return (
      <div
        ref={ref}
        className={`design-system-datagrid ${className}`}
        style={{
          ...gridStyles,
          height
        }}
        data-variant={variant}
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
        
        {/* Bulk operations toolbar */}
        {renderBulkOperations()}
        
        {/* Header */}
        {renderHeader()}
        
        {/* Data rows */}
        <div
          ref={containerRef}
          style={{
            flex: 1,
            overflow: 'auto',
            position: 'relative'
          }}
          onScroll={(e) => {
            setScrollTop(e.currentTarget.scrollTop);
            setScrollLeft(e.currentTarget.scrollLeft);
          }}
        >
          {renderRows()}
        </div>
        
        {/* Summary row */}
        {showSummary && (
          <div style={{
            borderTop: `2px solid ${colors.neutral[300]}`,
            backgroundColor: colors.neutral[100],
            display: 'flex',
            fontWeight: typography.fontWeight.semibold
          }}>
            {selectable && <div style={{ width: '50px' }} />}
            {columns.map(column => (
              <div
                key={`summary-${column.key}`}
                style={{
                  width: columnWidths.get(column.key) || column.width || 150,
                  padding: `${spacing[2]} ${spacing[3]}`,
                  borderRight: `1px solid ${colors.neutral[200]}`
                }}
              >
                {/* Summary calculations would go here */}
                {column.aggregation && 'Total'}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);

DataGrid.displayName = 'DataGrid';

// ============================================================================
// DATAGRID HOOKS
// ============================================================================

export const useDataGrid = <T extends any>(initialData: T[] = []) => {
  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<(string | number)[]>([]);
  const [editingCells, setEditingCells] = useState<Map<string, any>>(new Map());
  
  const bulkUpdate = (updates: Partial<T>[]) => {
    // Implementation for bulk updates
    setData(currentData => {
      return currentData.map((item, index) => {
        const update = updates[index];
        return update ? { ...item, ...update } : item;
      });
    });
  };
  
  const bulkDelete = (rowKeys: (string | number)[]) => {
    // Implementation for bulk delete
    setData(currentData => 
      currentData.filter((_, index) => !rowKeys.includes(index))
    );
  };
  
  return {
    data,
    loading,
    selectedRowKeys,
    editingCells,
    setData,
    setLoading,
    setSelectedRowKeys,
    setEditingCells,
    bulkUpdate,
    bulkDelete
  };
};

// ============================================================================
// EXPORT ALL DATAGRID COMPONENTS
// ============================================================================

export default DataGrid;

export {
  type DataGridProps,
  type DataGridColumn,
  type CellPosition,
  type EditingCell
}; 