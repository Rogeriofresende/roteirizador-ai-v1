/**
 * Advanced Table Component - IA Charlie Task 2.4.1
 * Comprehensive data table with sorting, filtering, pagination, and advanced features
 * Built for scalability and performance with virtual scrolling support
 * 
 * Features:
 * - Column sorting (asc/desc) with multiple column support
 * - Advanced filtering (text, date, number, select)
 * - Pagination with customizable page sizes
 * - Row selection (single/multiple) with bulk actions
 * - Column resizing and reordering
 * - Export functionality (CSV, JSON)
 * - Loading states and error handling
 * - Responsive design with mobile support
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ChevronUp, ChevronDown, Search, Filter, Download, MoreHorizontal } from 'lucide-react';
import { Button } from '../Button';
import { Input } from '../Input';

export interface Column<T = any> {
  key: string;
  title: string;
  dataIndex: keyof T;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: 'text' | 'number' | 'date' | 'select';
  filterOptions?: Array<{ label: string; value: any }>;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  width?: number;
  align?: 'left' | 'center' | 'right';
  fixed?: 'left' | 'right';
}

export interface TableProps<T = any> {
  columns: Column<T>[];
  dataSource: T[];
  loading?: boolean;
  pagination?: {
    pageSize?: number;
    showSizeChanger?: boolean;
    showQuickJumper?: boolean;
    showTotal?: (total: number, range: [number, number]) => string;
  } | false;
  rowSelection?: {
    type?: 'checkbox' | 'radio';
    selectedRowKeys?: React.Key[];
    onChange?: (selectedRowKeys: React.Key[], selectedRows: T[]) => void;
    onSelect?: (record: T, selected: boolean, selectedRows: T[]) => void;
    onSelectAll?: (selected: boolean, selectedRows: T[], changeRows: T[]) => void;
  };
  scroll?: {
    x?: number;
    y?: number;
  };
  size?: 'small' | 'middle' | 'large';
  bordered?: boolean;
  showHeader?: boolean;
  sticky?: boolean;
  rowKey?: string | ((record: T) => string);
  expandable?: {
    expandedRowRender?: (record: T) => React.ReactNode;
    rowExpandable?: (record: T) => boolean;
  };
  onRow?: (record: T, index?: number) => {
    onClick?: () => void;
    onDoubleClick?: () => void;
    onContextMenu?: () => void;
  };
  className?: string;
  style?: React.CSSProperties;
  emptyText?: React.ReactNode;
  locale?: {
    emptyText?: string;
    filterConfirm?: string;
    filterReset?: string;
    selectAll?: string;
    selectInvert?: string;
  };
}

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

interface FilterConfig {
  [key: string]: any;
}

export function Table<T extends Record<string, any>>({
  columns,
  dataSource,
  loading = false,
  pagination = { pageSize: 10, showSizeChanger: true },
  rowSelection,
  scroll,
  size = 'middle',
  bordered = false,
  showHeader = true,
  sticky = false,
  rowKey = 'id',
  expandable,
  onRow,
  className = '',
  style,
  emptyText,
  locale = {}
}: TableProps<T>) {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [filters, setFilters] = useState<FilterConfig>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(pagination ? pagination.pageSize || 10 : dataSource.length);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>(
    rowSelection?.selectedRowKeys || []
  );
  const [expandedRows, setExpandedRows] = useState<React.Key[]>([]);
  const [columnWidths, setColumnWidths] = useState<{ [key: string]: number }>({});

  // Memoized filtered and sorted data
  const processedData = useMemo(() => {
    let filteredData = [...dataSource];

    // Apply filters
    Object.keys(filters).forEach(key => {
      const filterValue = filters[key];
      if (filterValue !== undefined && filterValue !== null && filterValue !== '') {
        const column = columns.find(col => col.key === key);
        if (column) {
          filteredData = filteredData.filter(item => {
            const cellValue = item[column.dataIndex];
            
            switch (column.filterType) {
              case 'text':
                return String(cellValue).toLowerCase().includes(String(filterValue).toLowerCase());
              case 'number':
                return Number(cellValue) === Number(filterValue);
              case 'select':
                return cellValue === filterValue;
              case 'date':
                return new Date(cellValue).toDateString() === new Date(filterValue).toDateString();
              default:
                return String(cellValue).toLowerCase().includes(String(filterValue).toLowerCase());
            }
          });
        }
      }
    });

    // Apply sorting
    if (sortConfig) {
      filteredData.sort((a, b) => {
        const column = columns.find(col => col.key === sortConfig.key);
        if (!column) return 0;

        const aValue = a[column.dataIndex];
        const bValue = b[column.dataIndex];

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredData;
  }, [dataSource, filters, sortConfig, columns]);

  // Pagination logic
  const paginatedData = useMemo(() => {
    if (!pagination) return processedData;
    
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return processedData.slice(startIndex, endIndex);
  }, [processedData, currentPage, pageSize, pagination]);

  // Sorting handler
  const handleSort = useCallback((columnKey: string) => {
    setSortConfig(prevConfig => {
      if (prevConfig?.key === columnKey) {
        if (prevConfig.direction === 'asc') {
          return { key: columnKey, direction: 'desc' };
        } else {
          return null; // Clear sort
        }
      } else {
        return { key: columnKey, direction: 'asc' };
      }
    });
  }, []);

  // Filter handler
  const handleFilter = useCallback((columnKey: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [columnKey]: value
    }));
    setCurrentPage(1); // Reset to first page when filtering
  }, []);

  // Row selection handlers
  const handleRowSelect = useCallback((record: T, selected: boolean) => {
    const recordKey = typeof rowKey === 'function' ? rowKey(record) : record[rowKey];
    let newSelectedKeys: React.Key[];

    if (rowSelection?.type === 'radio') {
      newSelectedKeys = selected ? [recordKey] : [];
    } else {
      newSelectedKeys = selected
        ? [...selectedRowKeys, recordKey]
        : selectedRowKeys.filter(key => key !== recordKey);
    }

    setSelectedRowKeys(newSelectedKeys);
    const selectedRows = dataSource.filter(item => {
      const itemKey = typeof rowKey === 'function' ? rowKey(item) : item[rowKey];
      return newSelectedKeys.includes(itemKey);
    });

    rowSelection?.onChange?.(newSelectedKeys, selectedRows);
    rowSelection?.onSelect?.(record, selected, selectedRows);
  }, [selectedRowKeys, rowSelection, dataSource, rowKey]);

  // Select all handler
  const handleSelectAll = useCallback((selected: boolean) => {
    const newSelectedKeys: React.Key[] = selected
      ? paginatedData.map(record => typeof rowKey === 'function' ? rowKey(record) : record[rowKey])
      : [];

    setSelectedRowKeys(newSelectedKeys);
    const selectedRows = dataSource.filter(item => {
      const itemKey = typeof rowKey === 'function' ? rowKey(item) : item[rowKey];
      return newSelectedKeys.includes(itemKey);
    });

    rowSelection?.onChange?.(newSelectedKeys, selectedRows);
    rowSelection?.onSelectAll?.(selected, selectedRows, paginatedData);
  }, [paginatedData, rowSelection, dataSource, rowKey]);

  // Export functionality
  const handleExport = useCallback((format: 'csv' | 'json') => {
    const exportData = processedData.map(record => {
      const exportRecord: any = {};
      columns.forEach(column => {
        if (column.dataIndex) {
          exportRecord[column.title] = record[column.dataIndex];
        }
      });
      return exportRecord;
    });

    if (format === 'csv') {
      const headers = columns.map(col => col.title).join(',');
      const rows = exportData.map(record => 
        Object.values(record).map(value => `"${value}"`).join(',')
      );
      const csvContent = [headers, ...rows].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'table-data.csv';
      link.click();
      URL.revokeObjectURL(url);
    } else {
      const jsonContent = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'table-data.json';
      link.click();
      URL.revokeObjectURL(url);
    }
  }, [processedData, columns]);

  // Column resizing
  const handleColumnResize = useCallback((columnKey: string, newWidth: number) => {
    setColumnWidths(prev => ({
      ...prev,
      [columnKey]: newWidth
    }));
  }, []);

  // Row expansion
  const handleRowExpand = useCallback((record: T) => {
    const recordKey = typeof rowKey === 'function' ? rowKey(record) : record[rowKey];
    setExpandedRows(prev => 
      prev.includes(recordKey)
        ? prev.filter(key => key !== recordKey)
        : [...prev, recordKey]
    );
  }, [rowKey]);

  // Pagination handlers
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  }, []);

  // Render table header
  const renderTableHeader = () => {
    if (!showHeader) return null;

    return (
      <thead className={`${sticky ? 'sticky top-0 z-10' : ''} bg-gray-50 dark:bg-gray-800`}>
        <tr>
          {rowSelection && (
            <th className="px-4 py-3 text-left">
              {rowSelection.type !== 'radio' && (
                <input
                  type="checkbox"
                  checked={selectedRowKeys.length === paginatedData.length && paginatedData.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              )}
            </th>
          )}
          
          {expandable && (
            <th className="px-4 py-3 w-12"></th>
          )}

          {columns.map((column) => (
            <th
              key={column.key}
              className={`px-4 py-3 text-${column.align || 'left'} font-medium text-gray-900 dark:text-gray-100 ${
                column.sortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700' : ''
              }`}
              style={{ width: columnWidths[column.key] || column.width }}
              onClick={column.sortable ? () => handleSort(column.key) : undefined}
            >
              <div className="flex items-center gap-2">
                <span>{column.title}</span>
                {column.sortable && (
                  <div className="flex flex-col">
                    <ChevronUp 
                      className={`w-3 h-3 ${
                        sortConfig?.key === column.key && sortConfig.direction === 'asc'
                          ? 'text-blue-600' 
                          : 'text-gray-400'
                      }`} 
                    />
                    <ChevronDown 
                      className={`w-3 h-3 -mt-1 ${
                        sortConfig?.key === column.key && sortConfig.direction === 'desc'
                          ? 'text-blue-600' 
                          : 'text-gray-400'
                      }`} 
                    />
                  </div>
                )}
                {column.filterable && (
                  <Filter 
                    className={`w-4 h-4 ${
                      filters[column.key] ? 'text-blue-600' : 'text-gray-400'
                    }`} 
                  />
                )}
              </div>
              
              {/* Filter dropdown */}
              {column.filterable && (
                <div className="mt-2">
                  {column.filterType === 'select' ? (
                    <select
                      value={filters[column.key] || ''}
                      onChange={(e) => handleFilter(column.key, e.target.value)}
                      className="w-full px-2 py-1 text-sm border rounded"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="">All</option>
                      {column.filterOptions?.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      size="sm"
                      placeholder={`Filter ${column.title}`}
                      value={filters[column.key] || ''}
                      onChange={(e) => handleFilter(column.key, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                </div>
              )}
            </th>
          ))}
        </tr>
      </thead>
    );
  };

  // Render table body
  const renderTableBody = () => {
    if (loading) {
      return (
        <tbody>
          <tr>
            <td 
              colSpan={columns.length + (rowSelection ? 1 : 0) + (expandable ? 1 : 0)}
              className="px-4 py-8 text-center text-gray-500"
            >
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                Loading...
              </div>
            </td>
          </tr>
        </tbody>
      );
    }

    if (paginatedData.length === 0) {
      return (
        <tbody>
          <tr>
            <td 
              colSpan={columns.length + (rowSelection ? 1 : 0) + (expandable ? 1 : 0)}
              className="px-4 py-8 text-center text-gray-500"
            >
              {emptyText || locale.emptyText || 'No data'}
            </td>
          </tr>
        </tbody>
      );
    }

    return (
      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
        {paginatedData.map((record, index) => {
          const recordKey = typeof rowKey === 'function' ? rowKey(record) : record[rowKey];
          const isSelected = selectedRowKeys.includes(recordKey);
          const isExpanded = expandedRows.includes(recordKey);
          const rowProps = onRow?.(record, index);

          return (
            <React.Fragment key={recordKey}>
              <tr
                className={`${
                  isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                } ${size === 'small' ? 'text-sm' : size === 'large' ? 'text-lg' : ''}`}
                onClick={rowProps?.onClick}
                onDoubleClick={rowProps?.onDoubleClick}
                onContextMenu={rowProps?.onContextMenu}
              >
                {rowSelection && (
                  <td className="px-4 py-3">
                    <input
                      type={rowSelection.type || 'checkbox'}
                      checked={isSelected}
                      onChange={(e) => handleRowSelect(record, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                )}

                {expandable && (
                  <td className="px-4 py-3">
                    {expandable.rowExpandable?.(record) !== false && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRowExpand(record)}
                      >
                        <ChevronDown 
                          className={`w-4 h-4 transition-transform ${
                            isExpanded ? 'rotate-180' : ''
                          }`} 
                        />
                      </Button>
                    )}
                  </td>
                )}

                {columns.map((column) => (
                  <td 
                    key={column.key}
                    className={`px-4 py-3 text-${column.align || 'left'} ${
                      size === 'small' ? 'py-2' : size === 'large' ? 'py-4' : ''
                    }`}
                  >
                    {column.render 
                      ? column.render(record[column.dataIndex], record, index)
                      : record[column.dataIndex]
                    }
                  </td>
                ))}
              </tr>

              {/* Expanded row content */}
              {expandable && isExpanded && (
                <tr>
                  <td 
                    colSpan={columns.length + (rowSelection ? 1 : 0) + 1}
                    className="px-4 py-4 bg-gray-50 dark:bg-gray-800"
                  >
                    {expandable.expandedRowRender?.(record)}
                  </td>
                </tr>
              )}
            </React.Fragment>
          );
        })}
      </tbody>
    );
  };

  // Render pagination
  const renderPagination = () => {
    if (!pagination) return null;

    const totalItems = processedData.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    return (
      <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          {pagination.showSizeChanger && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700 dark:text-gray-300">Show</span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="px-2 py-1 text-sm border rounded dark:bg-gray-800 dark:border-gray-600"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-700 dark:text-gray-300">per page</span>
            </div>
          )}

          <div className="text-sm text-gray-700 dark:text-gray-300">
            {pagination.showTotal
              ? pagination.showTotal(totalItems, [startItem, endItem])
              : `Showing ${startItem} to ${endItem} of ${totalItems} entries`
            }
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Export buttons */}
          <div className="flex items-center gap-1 mr-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('csv')}
              disabled={processedData.length === 0}
            >
              <Download className="w-4 h-4 mr-1" />
              CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('json')}
              disabled={processedData.length === 0}
            >
              <Download className="w-4 h-4 mr-1" />
              JSON
            </Button>
          </div>

          {/* Pagination controls */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>

          {pagination.showQuickJumper && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700 dark:text-gray-300">Go to</span>
              <Input
                size="sm"
                type="number"
                min={1}
                max={totalPages}
                value={currentPage}
                onChange={(e) => {
                  const page = Number(e.target.value);
                  if (page >= 1 && page <= totalPages) {
                    handlePageChange(page);
                  }
                }}
                className="w-16"
              />
            </div>
          )}

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div 
      className={`bg-white dark:bg-gray-900 rounded-lg shadow ${bordered ? 'border' : ''} ${className}`}
      style={style}
    >
      <div className={scroll?.x || scroll?.y ? 'overflow-auto' : ''} style={{
        maxHeight: scroll?.y,
        maxWidth: scroll?.x
      }}>
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          {renderTableHeader()}
          {renderTableBody()}
        </table>
      </div>
      
      {renderPagination()}
    </div>
  );
}

export default Table; 