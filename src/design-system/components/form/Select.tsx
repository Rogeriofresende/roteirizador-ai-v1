/**
 * 🔽 Select Component - Form Input
 * 
 * Select dropdown with keyboard navigation and multi-select support
 * Custom styling, option grouping, and virtual scrolling for large datasets
 * 
 * Part of: WEEK 0 Days 3-4 - IA Beta Form Components
 * Integration: Design tokens + Migration patterns + Alpha cost tiers + Charlie monitoring
 */

import React, { 
  forwardRef, 
  ReactNode, 
  useState, 
  useEffect, 
  useRef,
  useCallback,
  HTMLAttributes 
} from 'react';
import { colors, spacing, typography, borderRadius, shadows, transitions, zIndex } from '../../tokens';
import { familiarElements } from '../../migration-patterns';
import { keyboardNavigation, screenReaderSupport } from '../../accessibility';

// ============================================================================
// SELECT TYPES & INTERFACES
// ============================================================================

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  description?: string;
  icon?: ReactNode;
  group?: string;
  data?: any;
}

export interface SelectOptionGroup {
  label: string;
  options: SelectOption[];
  disabled?: boolean;
}

export interface SelectProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'onSelect'> {
  /** Select options */
  options: SelectOption[] | SelectOptionGroup[];
  
  /** Selected value(s) */
  value?: string | number | (string | number)[];
  
  /** Default selected value(s) */
  defaultValue?: string | number | (string | number)[];
  
  /** Placeholder text */
  placeholder?: string;
  
  /** Select variant */
  variant?: 'default' | 'outlined' | 'filled';
  
  /** Select size */
  size?: 'small' | 'medium' | 'large';
  
  /** Multiple selection */
  multiple?: boolean;
  
  /** Searchable options */
  searchable?: boolean;
  
  /** Clearable selection */
  clearable?: boolean;
  
  /** Disabled state */
  disabled?: boolean;
  
  /** Loading state */
  loading?: boolean;
  
  /** Error state */
  error?: boolean;
  
  /** Maximum height for dropdown */
  maxHeight?: string;
  
  /** Virtual scrolling for large datasets */
  virtual?: boolean;
  
  /** Virtual item height */
  virtualItemHeight?: number;
  
  /** Migration mode for styling */
  migrationMode?: 'familiar' | 'enhanced';
  
  /** Cost tier for Alpha integration */
  costTier?: 'free' | 'premium';
  
  /** Analytics tracking for Charlie integration */
  trackingId?: string;
  
  /** Custom option renderer */
  renderOption?: (option: SelectOption, isSelected: boolean) => ReactNode;
  
  /** Custom selected value renderer */
  renderValue?: (value: string | number | (string | number)[]) => ReactNode;
  
  /** Search filter function */
  filterOption?: (option: SelectOption, searchValue: string) => boolean;
  
  /** No options message */
  noOptionsMessage?: string;
  
  /** Loading message */
  loadingMessage?: string;
  
  /** Callback when value changes */
  onChange?: (value: string | number | (string | number)[], option?: SelectOption | SelectOption[]) => void;
  
  /** Callback when option is selected */
  onSelect?: (option: SelectOption) => void;
  
  /** Callback when dropdown opens */
  onOpen?: () => void;
  
  /** Callback when dropdown closes */
  onClose?: () => void;
  
  /** Callback when search changes */
  onSearchChange?: (searchValue: string) => void;
}

// ============================================================================
// SELECT STYLES
// ============================================================================

const getSelectStyles = (
  variant: SelectProps['variant'] = 'default',
  size: SelectProps['size'] = 'medium',
  migrationMode: SelectProps['migrationMode'] = 'enhanced',
  disabled: boolean = false,
  error: boolean = false,
  focused: boolean = false,
  costTier: SelectProps['costTier'] = 'free'
): React.CSSProperties => {
  
  // Base styles
  const baseStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.base,
    lineHeight: typography.lineHeight.normal,
    backgroundColor: 'white',
    border: '1px solid',
    borderRadius: migrationMode === 'familiar' ? borderRadius.base : borderRadius.md,
    transition: transitions.common.all,
    cursor: disabled ? 'not-allowed' : 'pointer',
    outline: 'none',
    position: 'relative'
  };

  // Size styles
  const sizeStyles: Record<string, React.CSSProperties> = {
    small: {
      padding: `${spacing[2]} ${spacing[3]}`,
      fontSize: typography.fontSize.sm,
      minHeight: '32px'
    },
    medium: {
      padding: `${spacing[3]} ${spacing[4]}`,
      fontSize: typography.fontSize.base,
      minHeight: '40px'
    },
    large: {
      padding: `${spacing[4]} ${spacing[5]}`,
      fontSize: typography.fontSize.lg,
      minHeight: '48px'
    }
  };

  // State-based styles
  let borderColor = colors.neutral[300];
  let boxShadow = 'none';
  
  if (error) {
    borderColor = colors.error[500];
    boxShadow = focused ? `0 0 0 3px ${colors.error[100]}` : 'none';
  } else if (focused) {
    borderColor = costTier === 'premium' ? colors.costTier.premium.primary : colors.primary[500];
    boxShadow = `0 0 0 3px ${costTier === 'premium' ? colors.costTier.premium.background : colors.primary[100]}`;
  }

  // Variant styles
  const variantStyles: Record<string, React.CSSProperties> = {
    default: {
      borderColor,
      boxShadow: migrationMode === 'enhanced' ? boxShadow : 'none'
    },
    outlined: {
      borderColor,
      backgroundColor: 'transparent',
      boxShadow: migrationMode === 'enhanced' ? boxShadow : 'none'
    },
    filled: {
      borderColor: 'transparent',
      backgroundColor: colors.neutral[50],
      boxShadow: migrationMode === 'enhanced' ? boxShadow : 'none'
    }
  };

  // Disabled styles
  if (disabled) {
    return {
      ...baseStyles,
      ...sizeStyles[size],
      ...variantStyles[variant],
      opacity: 0.5,
      cursor: 'not-allowed',
      backgroundColor: colors.neutral[100],
      borderColor: colors.neutral[200]
    };
  }

  return {
    ...baseStyles,
    ...sizeStyles[size],
    ...variantStyles[variant]
  };
};

// ============================================================================
// SELECT COMPONENT
// ============================================================================

export const Select = forwardRef<HTMLDivElement, SelectProps>(
  ({
    options,
    value,
    defaultValue,
    placeholder = 'Selecione...',
    variant = 'default',
    size = 'medium',
    multiple = false,
    searchable = false,
    clearable = false,
    disabled = false,
    loading = false,
    error = false,
    maxHeight = '200px',
    virtual = false,
    virtualItemHeight = 40,
    migrationMode = 'enhanced',
    costTier = 'free',
    trackingId,
    renderOption,
    renderValue,
    filterOption,
    noOptionsMessage = 'Nenhuma opção encontrada',
    loadingMessage = 'Carregando...',
    onChange,
    onSelect,
    onOpen,
    onClose,
    onSearchChange,
    className = '',
    ...props
  }, ref) => {
    
    const [isOpen, setIsOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const [selectedValues, setSelectedValues] = useState<(string | number)[]>(() => {
      if (value !== undefined) {
        return Array.isArray(value) ? value : [value];
      }
      if (defaultValue !== undefined) {
        return Array.isArray(defaultValue) ? defaultValue : [defaultValue];
      }
      return [];
    });
    
    const selectRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const optionRefs = useRef<(HTMLDivElement | null)[]>([]);
    
    // Flatten options from groups
    const flattenOptions = (opts: SelectOption[] | SelectOptionGroup[]): SelectOption[] => {
      const flattened: SelectOption[] = [];
      
      opts.forEach(item => {
        if ('options' in item) {
          // It's a group
          flattened.push(...item.options);
        } else {
          // It's an option
          flattened.push(item);
        }
      });
      
      return flattened;
    };
    
    const allOptions = flattenOptions(options);
    
    // Filter options based on search
    const filteredOptions = searchable && searchValue
      ? allOptions.filter(option => {
          if (filterOption) {
            return filterOption(option, searchValue);
          }
          return option.label.toLowerCase().includes(searchValue.toLowerCase());
        })
      : allOptions;
    
    // Get selected options
    const getSelectedOptions = (): SelectOption[] => {
      return selectedValues.map(val => 
        allOptions.find(opt => opt.value === val)
      ).filter(Boolean) as SelectOption[];
    };
    
    // Handle option selection
    const handleOptionSelect = (option: SelectOption) => {
      if (option.disabled) return;
      
      let newSelectedValues: (string | number)[];
      
      if (multiple) {
        if (selectedValues.includes(option.value)) {
          newSelectedValues = selectedValues.filter(val => val !== option.value);
        } else {
          newSelectedValues = [...selectedValues, option.value];
        }
      } else {
        newSelectedValues = [option.value];
        setIsOpen(false);
      }
      
      setSelectedValues(newSelectedValues);
      
      // Reset search and focus
      setSearchValue('');
      setFocusedIndex(-1);
      
      // Analytics tracking
      if (trackingId && typeof window !== 'undefined') {
        const trackingData = {
          component: 'Select',
          action: 'option_selected',
          optionValue: option.value,
          optionLabel: option.label,
          multiple,
          searchable,
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
      
      // Callbacks
      const finalValue = multiple ? newSelectedValues : newSelectedValues[0];
      const selectedOptions = multiple ? getSelectedOptions() : option;
      
      onChange?.(finalValue, selectedOptions);
      onSelect?.(option);
      
      // Screen reader announcement
      screenReaderSupport.announceToScreenReader(
        `${option.label} ${multiple ? 'adicionado à seleção' : 'selecionado'}`,
        'assertive'
      );
    };
    
    // Handle clear selection
    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedValues([]);
      setSearchValue('');
      
      const finalValue = multiple ? [] : undefined;
      onChange?.(finalValue, multiple ? [] : undefined);
      
      screenReaderSupport.announceToScreenReader('Seleção limpa', 'assertive');
    };
    
    // Handle dropdown toggle
    const handleToggle = () => {
      if (disabled || loading) return;
      
      const newIsOpen = !isOpen;
      setIsOpen(newIsOpen);
      
      if (newIsOpen) {
        setFocusedIndex(selectedValues.length > 0 ? 
          filteredOptions.findIndex(opt => opt.value === selectedValues[0]) : 0
        );
        onOpen?.();
        
        // Focus search input if searchable
        setTimeout(() => {
          if (searchable && searchRef.current) {
            searchRef.current.focus();
          }
        }, 0);
      } else {
        onClose?.();
      }
    };
    
    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
      switch (e.key) {
        case keyboardNavigation.shortcuts.ENTER:
        case keyboardNavigation.shortcuts.SPACE:
          e.preventDefault();
          if (!isOpen) {
            handleToggle();
          } else if (focusedIndex >= 0 && filteredOptions[focusedIndex]) {
            handleOptionSelect(filteredOptions[focusedIndex]);
          }
          break;
          
        case keyboardNavigation.shortcuts.ESCAPE:
          if (isOpen) {
            setIsOpen(false);
            onClose?.();
          }
          break;
          
        case keyboardNavigation.shortcuts.ARROW_DOWN:
          e.preventDefault();
          if (!isOpen) {
            handleToggle();
          } else {
            setFocusedIndex(prev => 
              prev < filteredOptions.length - 1 ? prev + 1 : 0
            );
          }
          break;
          
        case keyboardNavigation.shortcuts.ARROW_UP:
          e.preventDefault();
          if (isOpen) {
            setFocusedIndex(prev => 
              prev > 0 ? prev - 1 : filteredOptions.length - 1
            );
          }
          break;
          
        case keyboardNavigation.shortcuts.HOME:
          if (isOpen) {
            e.preventDefault();
            setFocusedIndex(0);
          }
          break;
          
        case keyboardNavigation.shortcuts.END:
          if (isOpen) {
            e.preventDefault();
            setFocusedIndex(filteredOptions.length - 1);
          }
          break;
      }
    };
    
    // Handle search input
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newSearchValue = e.target.value;
      setSearchValue(newSearchValue);
      setFocusedIndex(0);
      onSearchChange?.(newSearchValue);
    };
    
    // Click outside to close
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
          setIsOpen(false);
          onClose?.();
        }
      };
      
      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen, onClose]);
    
    // Scroll focused option into view
    useEffect(() => {
      if (isOpen && focusedIndex >= 0 && optionRefs.current[focusedIndex]) {
        optionRefs.current[focusedIndex]?.scrollIntoView({
          block: 'nearest'
        });
      }
    }, [focusedIndex, isOpen]);
    
    // Get computed styles
    const selectStyles = getSelectStyles(
      variant,
      size,
      migrationMode,
      disabled,
      error,
      isOpen,
      costTier
    );
    
    // Render selected value
    const renderSelectedValue = () => {
      if (renderValue) {
        return renderValue(multiple ? selectedValues : selectedValues[0]);
      }
      
      const selectedOptions = getSelectedOptions();
      
      if (selectedOptions.length === 0) {
        return (
          <span style={{ color: colors.neutral[500] }}>
            {placeholder}
          </span>
        );
      }
      
      if (multiple) {
        if (selectedOptions.length === 1) {
          return selectedOptions[0].label;
        }
        return `${selectedOptions.length} itens selecionados`;
      }
      
      return selectedOptions[0]?.label || '';
    };
    
    // Render option
    const renderOptionItem = (option: SelectOption, index: number) => {
      const isSelected = selectedValues.includes(option.value);
      const isFocused = index === focusedIndex;
      
      if (renderOption) {
        return renderOption(option, isSelected);
      }
      
      return (
        <div
          key={option.value}
          ref={el => optionRefs.current[index] = el}
          style={{
            padding: `${spacing[2]} ${spacing[3]}`,
            cursor: option.disabled ? 'not-allowed' : 'pointer',
            backgroundColor: isFocused ? 
              (costTier === 'premium' ? colors.costTier.premium.background : colors.primary[50]) :
              isSelected ? colors.neutral[100] : 'transparent',
            color: option.disabled ? colors.neutral[400] : 
                   isFocused ? (costTier === 'premium' ? colors.costTier.premium.primary : colors.primary[600]) :
                   colors.neutral[900],
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2],
            transition: transitions.common.colors,
            opacity: option.disabled ? 0.5 : 1
          }}
          onClick={() => handleOptionSelect(option)}
          onMouseEnter={() => setFocusedIndex(index)}
          role="option"
          aria-selected={isSelected}
          aria-disabled={option.disabled}
        >
          {/* Multiple selection checkbox */}
          {multiple && (
            <div style={{
              width: '16px',
              height: '16px',
              border: `2px solid ${isSelected ? colors.primary[500] : colors.neutral[300]}`,
              borderRadius: borderRadius.sm,
              backgroundColor: isSelected ? colors.primary[500] : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px'
            }}>
              {isSelected && '✓'}
            </div>
          )}
          
          {/* Option icon */}
          {option.icon && (
            <span style={{ fontSize: '16px' }}>
              {option.icon}
            </span>
          )}
          
          {/* Option content */}
          <div style={{ flex: 1 }}>
            <div>{option.label}</div>
            {option.description && (
              <div style={{
                fontSize: typography.fontSize.xs,
                color: colors.neutral[600],
                marginTop: spacing[1]
              }}>
                {option.description}
              </div>
            )}
          </div>
          
          {/* Selected indicator for single select */}
          {!multiple && isSelected && (
            <span style={{ color: colors.primary[500] }}>✓</span>
          )}
        </div>
      );
    };
    
    return (
      <div
        ref={selectRef}
        className={`design-system-select ${className}`}
        style={{ position: 'relative', width: '100%' }}
        data-variant={variant}
        data-size={size}
        data-migration-mode={migrationMode}
        data-cost-tier={costTier}
        data-tracking-id={trackingId}
        data-multiple={multiple}
        data-searchable={searchable}
        data-open={isOpen}
        {...props}
      >
        {/* Select Trigger */}
        <div
          ref={ref}
          style={selectStyles}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          tabIndex={disabled ? -1 : 0}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-disabled={disabled}
          aria-invalid={error}
        >
          {/* Selected Value */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            {renderSelectedValue()}
          </div>
          
          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[1] }}>
            {/* Clear Button */}
            {clearable && selectedValues.length > 0 && !disabled && (
              <button
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  padding: spacing[1],
                  color: colors.neutral[500],
                  fontSize: '14px',
                  borderRadius: borderRadius.sm
                }}
                onClick={handleClear}
                aria-label="Limpar seleção"
              >
                ×
              </button>
            )}
            
            {/* Loading Spinner */}
            {loading && (
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid transparent',
                borderTop: `2px solid ${colors.primary[500]}`,
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            )}
            
            {/* Dropdown Arrow */}
            {!loading && (
              <span
                style={{
                  color: colors.neutral[500],
                  fontSize: '12px',
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: transitions.common.transform
                }}
              >
                ▼
              </span>
            )}
          </div>
        </div>
        
        {/* Dropdown */}
        {isOpen && (
          <div
            ref={dropdownRef}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: 'white',
              border: `1px solid ${colors.neutral[200]}`,
              borderRadius: borderRadius.md,
              boxShadow: shadows.lg,
              zIndex: zIndex.dropdown,
              maxHeight,
              overflow: 'auto',
              marginTop: spacing[1]
            }}
            role="listbox"
            aria-multiselectable={multiple}
          >
            {/* Search Input */}
            {searchable && (
              <div style={{
                padding: spacing[2],
                borderBottom: `1px solid ${colors.neutral[200]}`
              }}>
                <input
                  ref={searchRef}
                  type="text"
                  value={searchValue}
                  onChange={handleSearchChange}
                  placeholder="Buscar..."
                  style={{
                    width: '100%',
                    padding: spacing[2],
                    border: `1px solid ${colors.neutral[200]}`,
                    borderRadius: borderRadius.sm,
                    fontSize: typography.fontSize.sm,
                    outline: 'none'
                  }}
                />
              </div>
            )}
            
            {/* Options */}
            {loading ? (
              <div style={{
                padding: spacing[4],
                textAlign: 'center',
                color: colors.neutral[600]
              }}>
                {loadingMessage}
              </div>
            ) : filteredOptions.length === 0 ? (
              <div style={{
                padding: spacing[4],
                textAlign: 'center',
                color: colors.neutral[600]
              }}>
                {noOptionsMessage}
              </div>
            ) : (
              <div>
                {filteredOptions.map((option, index) => renderOptionItem(option, index))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

// ============================================================================
// SELECT HOOKS
// ============================================================================

export const useSelect = (initialValue?: string | number | (string | number)[]) => {
  const [value, setValue] = useState(initialValue);
  const [isOpen, setIsOpen] = useState(false);
  
  const handleChange = (newValue: string | number | (string | number)[]) => {
    setValue(newValue);
  };
  
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(prev => !prev);
  
  return {
    value,
    isOpen,
    setValue: handleChange,
    open,
    close,
    toggle
  };
};

// ============================================================================
// EXPORT ALL SELECT COMPONENTS
// ============================================================================

export default Select;

export {
  type SelectProps,
  type SelectOption,
  type SelectOptionGroup
}; 