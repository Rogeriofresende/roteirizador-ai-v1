import React, { 
  useState, 
  useRef, 
  useEffect, 
  useCallback, 
  useMemo,
  forwardRef,
  useImperativeHandle,
  ReactNode,
  FocusEvent,
  ChangeEvent,
  KeyboardEvent,
  MouseEvent
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FixedSizeList as List } from 'react-window';
import './FormSelect.css';

// ==========================================
// 🔴 IA ALPHA - ADVANCED TYPESCRIPT INTERFACES
// ==========================================

/**
 * V7.5 Enhanced FormSelect Option Interface
 */
export interface FormSelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  group?: string;
  icon?: ReactNode;
  description?: string;
  metadata?: Record<string, any>;
}

/**
 * V7.5 Enhanced Option Group Interface
 */
export interface FormSelectOptionGroup {
  label: string;
  options: FormSelectOption[];
  disabled?: boolean;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

/**
 * V7.5 Enhanced Virtual Scrolling Configuration
 */
export interface FormSelectVirtualScrolling {
  enabled: boolean;
  itemHeight?: number;
  maxVisibleItems?: number;
  threshold?: number; // Minimum items to enable virtual scrolling
  overscan?: number; // Items to render outside visible area
}

/**
 * V7.5 Enhanced Search Configuration
 */
export interface FormSelectSearch {
  enabled: boolean;
  placeholder?: string;
  fuzzyMatching?: boolean;
  searchFields?: ('label' | 'value' | 'description')[];
  caseSensitive?: boolean;
  minCharsToSearch?: number;
  customFilter?: (option: FormSelectOption, searchValue: string) => boolean;
}

/**
 * V7.5 Enhanced Multi-select Configuration
 */
export interface FormSelectMultiSelect {
  enabled: boolean;
  maxSelections?: number;
  allowSelectAll?: boolean;
  chipVariant?: 'default' | 'outlined' | 'filled';
  chipRemovable?: boolean;
  displayFormat?: 'chips' | 'count' | 'list';
  placeholder?: string;
  emptyPlaceholder?: string;
}

/**
 * V7.5 Enhanced Dropdown Positioning
 */
export interface FormSelectDropdownPosition {
  placement?: 'bottom' | 'top' | 'auto';
  alignment?: 'start' | 'center' | 'end';
  offset?: number;
  boundaryDetection?: boolean;
  maxHeight?: number;
  minWidth?: number;
  matchTriggerWidth?: boolean;
}

/**
 * V7.5 Enhanced Loading State
 */
export interface FormSelectLoadingState {
  isLoading: boolean;
  loadingText?: string;
  skeleton?: boolean;
  skeletonItems?: number;
}

/**
 * V7.5 Enhanced Validation State
 */
export interface FormSelectValidationState {
  isValid: boolean;
  isDirty: boolean;
  isTouched: boolean;
  isValidating: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * V7.5 Enhanced Event Handlers
 */
export interface FormSelectEventHandlers {
  onChange?: (value: string | string[], option?: FormSelectOption | FormSelectOption[]) => void;
  onSearch?: (searchValue: string) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onFocus?: (event: FocusEvent<HTMLElement>) => void;
  onBlur?: (event: FocusEvent<HTMLElement>) => void;
  onOptionSelect?: (option: FormSelectOption) => void;
  onOptionDeselect?: (option: FormSelectOption) => void;
  onClear?: () => void;
}

/**
 * V7.5 Enhanced Main FormSelect Props Interface
 */
export interface FormSelectProps {
  // V7.5 Core Design System Integration
  variant?: 'glass' | 'outlined' | 'filled' | 'minimal' | 'floating';
  size?: 'sm' | 'md' | 'lg';
  
  // Glass-morphism Effects
  glassEffect?: 'subtle' | 'medium' | 'strong';
  
  // Enhanced Validation System
  validationState?: 'neutral' | 'success' | 'warning' | 'error';
  
  // Core Select Properties
  options: FormSelectOption[] | FormSelectOptionGroup[];
  value?: string | string[];
  defaultValue?: string | string[];
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  
  // Professional Features
  label?: string;
  helperText?: string;
  errorText?: string;
  leadingIcon?: ReactNode;
  clearable?: boolean;
  
  // Advanced Features
  virtualScrolling?: FormSelectVirtualScrolling;
  search?: FormSelectSearch;
  multiSelect?: FormSelectMultiSelect;
  dropdownPosition?: FormSelectDropdownPosition;
  loadingState?: FormSelectLoadingState;
  
  // Custom Rendering
  customOptionRenderer?: (option: FormSelectOption, isSelected: boolean, isHighlighted: boolean) => ReactNode;
  customValueRenderer?: (value: string | string[], options: FormSelectOption[]) => ReactNode;
  customEmptyRenderer?: () => ReactNode;
  
  // Performance & Accessibility
  id?: string;
  name?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  screenReaderText?: string;
  
  // Animation System
  animationPreset?: 'smooth' | 'bounce' | 'slide';
  
  // V7.5 Enhanced Event Handlers
  eventHandlers?: FormSelectEventHandlers;
  
  // Analytics Integration
  analyticsId?: string;
  trackInteractions?: boolean;
  
  // Additional Props
  className?: string;
}

/**
 * V7.5 Enhanced Ref Interface
 */
export interface FormSelectRef {
  focus: () => void;
  blur: () => void;
  open: () => void;
  close: () => void;
  clear: () => void;
  selectAll: () => void;
  deselectAll: () => void;
  getSelectedOptions: () => FormSelectOption[];
  setValue: (value: string | string[]) => void;
  search: (query: string) => void;
  scrollToOption: (optionValue: string | number) => void;
}

// ==========================================
// 🔴 IA ALPHA - PERFORMANCE HOOKS
// ==========================================

/**
 * Virtual scrolling hook with performance optimization
 */
function useVirtualScrolling(
  options: FormSelectOption[],
  config: FormSelectVirtualScrolling,
  containerRef: React.RefObject<HTMLDivElement>
) {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 10 });
  const listRef = useRef<List>(null);
  
  const shouldUseVirtualScrolling = useMemo(() => {
    return config.enabled && options.length >= (config.threshold || 100);
  }, [config.enabled, config.threshold, options.length]);
  
  const itemHeight = config.itemHeight || 40;
  const maxVisibleItems = config.maxVisibleItems || 10;
  const overscan = config.overscan || 5;
  
  const scrollToIndex = useCallback((index: number) => {
    if (listRef.current && shouldUseVirtualScrolling) {
      listRef.current.scrollToItem(index, 'smart');
    }
  }, [shouldUseVirtualScrolling]);
  
  const scrollToOption = useCallback((optionValue: string | number) => {
    const index = options.findIndex(option => option.value === optionValue);
    if (index !== -1) {
      scrollToIndex(index);
    }
  }, [options, scrollToIndex]);
  
  return {
    shouldUseVirtualScrolling,
    listRef,
    itemHeight,
    maxVisibleItems,
    overscan,
    visibleRange,
    setVisibleRange,
    scrollToIndex,
    scrollToOption
  };
}

/**
 * Search functionality hook with fuzzy matching
 */
function useFormSelectSearch(
  options: FormSelectOption[],
  config: FormSelectSearch
) {
  const [searchValue, setSearchValue] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<FormSelectOption[]>(options);
  
  const fuzzyMatch = useCallback((text: string, query: string): boolean => {
    if (!config.fuzzyMatching) {
      return config.caseSensitive ? 
        text.includes(query) : 
        text.toLowerCase().includes(query.toLowerCase());
    }
    
    const queryChars = (config.caseSensitive ? query : query.toLowerCase()).split('');
    const textChars = (config.caseSensitive ? text : text.toLowerCase()).split('');
    
    let queryIndex = 0;
    for (let i = 0; i < textChars.length && queryIndex < queryChars.length; i++) {
      if (textChars[i] === queryChars[queryIndex]) {
        queryIndex++;
      }
    }
    
    return queryIndex === queryChars.length;
  }, [config.caseSensitive, config.fuzzyMatching]);
  
  const searchOptions = useCallback((query: string) => {
    if (!config.enabled || query.length < (config.minCharsToSearch || 0)) {
      setFilteredOptions(options);
      return;
    }
    
    const filtered = options.filter(option => {
      if (config.customFilter) {
        return config.customFilter(option, query);
      }
      
      const searchFields = config.searchFields || ['label'];
      return searchFields.some(field => {
        const value = option[field as keyof FormSelectOption];
        if (typeof value === 'string') {
          return fuzzyMatch(value, query);
        }
        return false;
      });
    });
    
    setFilteredOptions(filtered);
  }, [options, config, fuzzyMatch]);
  
  useEffect(() => {
    searchOptions(searchValue);
  }, [searchValue, searchOptions]);
  
  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
  }, []);
  
  const clearSearch = useCallback(() => {
    setSearchValue('');
    setFilteredOptions(options);
  }, [options]);
  
  return {
    searchValue,
    filteredOptions,
    handleSearchChange,
    clearSearch,
    searchOptions
  };
}

/**
 * Multi-select state management hook
 */
function useMultiSelect(
  config: FormSelectMultiSelect,
  options: FormSelectOption[],
  value?: string | string[],
  onChange?: (value: string | string[]) => void
) {
  const [selectedValues, setSelectedValues] = useState<string[]>(() => {
    if (config.enabled) {
      return Array.isArray(value) ? value : (value ? [value] : []);
    }
    return [];
  });
  
  const selectedOptions = useMemo(() => {
    return options.filter(option => selectedValues.includes(String(option.value)));
  }, [options, selectedValues]);
  
  const isSelected = useCallback((optionValue: string | number) => {
    return selectedValues.includes(String(optionValue));
  }, [selectedValues]);
  
  const canSelect = useCallback(() => {
    if (!config.maxSelections) return true;
    return selectedValues.length < config.maxSelections;
  }, [config.maxSelections, selectedValues.length]);
  
  const toggleOption = useCallback((option: FormSelectOption) => {
    const valueStr = String(option.value);
    let newValues: string[];
    
    if (isSelected(option.value)) {
      newValues = selectedValues.filter(v => v !== valueStr);
    } else {
      if (!canSelect()) return;
      newValues = config.enabled ? [...selectedValues, valueStr] : [valueStr];
    }
    
    setSelectedValues(newValues);
    onChange?.(config.enabled ? newValues : (newValues[0] || ''));
  }, [selectedValues, isSelected, canSelect, config.enabled, onChange]);
  
  const selectAll = useCallback(() => {
    if (!config.enabled || !config.allowSelectAll) return;
    
    const allValues = options
      .filter(option => !option.disabled)
      .slice(0, config.maxSelections || options.length)
      .map(option => String(option.value));
    
    setSelectedValues(allValues);
    onChange?.(allValues);
  }, [config, options, onChange]);
  
  const deselectAll = useCallback(() => {
    setSelectedValues([]);
    onChange?.(config.enabled ? [] : '');
  }, [config.enabled, onChange]);
  
  const removeValue = useCallback((valueToRemove: string) => {
    const newValues = selectedValues.filter(v => v !== valueToRemove);
    setSelectedValues(newValues);
    onChange?.(config.enabled ? newValues : (newValues[0] || ''));
  }, [selectedValues, config.enabled, onChange]);
  
  return {
    selectedValues,
    selectedOptions,
    isSelected,
    canSelect,
    toggleOption,
    selectAll,
    deselectAll,
    removeValue
  };
}

/**
 * Keyboard navigation hook
 */
function useKeyboardNavigation(
  filteredOptions: FormSelectOption[],
  isOpen: boolean,
  onSelect: (option: FormSelectOption) => void,
  onClose: () => void,
  scrollToIndex: (index: number) => void
) {
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  
  const moveHighlight = useCallback((direction: 'up' | 'down' | 'first' | 'last') => {
    if (!isOpen || filteredOptions.length === 0) return;
    
    let newIndex: number;
    
    switch (direction) {
      case 'up':
        newIndex = highlightedIndex <= 0 ? filteredOptions.length - 1 : highlightedIndex - 1;
        break;
      case 'down':
        newIndex = highlightedIndex >= filteredOptions.length - 1 ? 0 : highlightedIndex + 1;
        break;
      case 'first':
        newIndex = 0;
        break;
      case 'last':
        newIndex = filteredOptions.length - 1;
        break;
      default:
        return;
    }
    
    // Skip disabled options
    while (filteredOptions[newIndex]?.disabled) {
      if (direction === 'up' || direction === 'last') {
        newIndex = newIndex <= 0 ? filteredOptions.length - 1 : newIndex - 1;
      } else {
        newIndex = newIndex >= filteredOptions.length - 1 ? 0 : newIndex + 1;
      }
      
      // Prevent infinite loop if all options are disabled
      if (filteredOptions.every(option => option.disabled)) break;
    }
    
    setHighlightedIndex(newIndex);
    scrollToIndex(newIndex);
  }, [isOpen, filteredOptions, highlightedIndex, scrollToIndex]);
  
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isOpen) return;
    
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        moveHighlight('down');
        break;
      case 'ArrowUp':
        event.preventDefault();
        moveHighlight('up');
        break;
      case 'Home':
        event.preventDefault();
        moveHighlight('first');
        break;
      case 'End':
        event.preventDefault();
        moveHighlight('last');
        break;
      case 'Enter':
        event.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          onSelect(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        event.preventDefault();
        onClose();
        break;
    }
  }, [isOpen, highlightedIndex, filteredOptions, moveHighlight, onSelect, onClose]);
  
  // Reset highlight when options change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [filteredOptions]);
  
  return {
    highlightedIndex,
    setHighlightedIndex,
    handleKeyDown
  };
}

/**
 * Dropdown positioning hook
 */
function useDropdownPositioning(
  triggerRef: React.RefObject<HTMLElement>,
  dropdownRef: React.RefObject<HTMLElement>,
  config: FormSelectDropdownPosition,
  isOpen: boolean
) {
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    placement: config.placement || 'bottom'
  });
  
  const calculatePosition = useCallback(() => {
    if (!triggerRef.current || !dropdownRef.current || !isOpen) return;
    
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const dropdownRect = dropdownRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    let top = 0;
    let left = 0;
    let placement = config.placement || 'bottom';
    
    // Calculate vertical position
    if (config.placement === 'auto' || config.boundaryDetection) {
      const spaceBelow = viewportHeight - triggerRect.bottom;
      const spaceAbove = triggerRect.top;
      
      if (placement === 'bottom' && spaceBelow < dropdownRect.height && spaceAbove > dropdownRect.height) {
        placement = 'top';
      } else if (placement === 'top' && spaceAbove < dropdownRect.height && spaceBelow > dropdownRect.height) {
        placement = 'bottom';
      }
    }
    
    if (placement === 'top') {
      top = triggerRect.top - dropdownRect.height - (config.offset || 4);
    } else {
      top = triggerRect.bottom + (config.offset || 4);
    }
    
    // Calculate horizontal position
    switch (config.alignment) {
      case 'center':
        left = triggerRect.left + (triggerRect.width - dropdownRect.width) / 2;
        break;
      case 'end':
        left = triggerRect.right - dropdownRect.width;
        break;
      default: // 'start'
        left = triggerRect.left;
        break;
    }
    
    // Boundary detection for horizontal position
    if (config.boundaryDetection) {
      if (left < 0) {
        left = 8; // Padding from viewport edge
      } else if (left + dropdownRect.width > viewportWidth) {
        left = viewportWidth - dropdownRect.width - 8;
      }
    }
    
    setPosition({ top, left, placement });
  }, [triggerRef, dropdownRef, config, isOpen]);
  
  useEffect(() => {
    if (isOpen) {
      calculatePosition();
      
      const handleResize = () => calculatePosition();
      const handleScroll = () => calculatePosition();
      
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleScroll);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, [isOpen, calculatePosition]);
  
  return { position, calculatePosition };
}

// ==========================================
// 🔴 IA ALPHA - MAIN COMPONENT
// ==========================================

/**
 * V7.5 Enhanced FormSelect Component
 * Professional dropdown with virtual scrolling, search, and multi-select
 */
export const FormSelect = forwardRef<FormSelectRef, FormSelectProps>(
  ({
    variant = 'outlined',
    size = 'md',
    glassEffect = 'subtle',
    validationState = 'neutral',
    options = [],
    value,
    defaultValue,
    placeholder = 'Select an option...',
    disabled = false,
    readOnly = false,
    required = false,
    label,
    helperText,
    errorText,
    leadingIcon,
    clearable = false,
    virtualScrolling = { enabled: true, itemHeight: 40, maxVisibleItems: 10, threshold: 100 },
    search = { enabled: false },
    multiSelect = { enabled: false },
    dropdownPosition = { placement: 'auto', alignment: 'start', boundaryDetection: true },
    loadingState = { isLoading: false },
    customOptionRenderer,
    customValueRenderer,
    customEmptyRenderer,
    id,
    name,
    ariaLabel,
    ariaDescribedBy,
    screenReaderText,
    animationPreset = 'smooth',
    eventHandlers = {},
    analyticsId,
    trackInteractions = false,
    className = ''
  }, ref) => {
    
    // Flatten grouped options
    const flatOptions = useMemo(() => {
      return options.reduce<FormSelectOption[]>((acc, item) => {
        if ('options' in item) {
          // It's a group
          return [...acc, ...item.options];
        } else {
          // It's a single option
          return [...acc, item];
        }
      }, []);
    }, [options]);
    
    // State Management
    const [isOpen, setIsOpen] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [isTouched, setIsTouched] = useState(false);
    
    // Refs
    const triggerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    
    // Hooks
    const { searchValue, filteredOptions, handleSearchChange, clearSearch } = useFormSelectSearch(flatOptions, search);
    const { selectedValues, selectedOptions, isSelected, toggleOption, selectAll, deselectAll, removeValue } = useMultiSelect(
      multiSelect, 
      flatOptions, 
      value, 
      eventHandlers.onChange
    );
    const { shouldUseVirtualScrolling, listRef, itemHeight, maxVisibleItems, scrollToIndex, scrollToOption } = useVirtualScrolling(
      filteredOptions, 
      virtualScrolling, 
      containerRef
    );
    const { highlightedIndex, setHighlightedIndex, handleKeyDown } = useKeyboardNavigation(
      filteredOptions,
      isOpen,
      toggleOption,
      () => setIsOpen(false),
      scrollToIndex
    );
    const { position } = useDropdownPositioning(triggerRef, dropdownRef, dropdownPosition, isOpen);
    
    // Event Handlers
    const handleOpen = useCallback(() => {
      if (disabled || readOnly) return;
      
      setIsOpen(true);
      setIsFocused(true);
      eventHandlers.onOpen?.();
      
      // Focus search input if search is enabled
      if (search.enabled) {
        setTimeout(() => searchInputRef.current?.focus(), 0);
      }
    }, [disabled, readOnly, search.enabled, eventHandlers]);
    
    const handleClose = useCallback(() => {
      setIsOpen(false);
      clearSearch();
      eventHandlers.onClose?.();
    }, [clearSearch, eventHandlers]);
    
    const handleToggle = useCallback(() => {
      if (isOpen) {
        handleClose();
      } else {
        handleOpen();
      }
    }, [isOpen, handleOpen, handleClose]);
    
    const handleOptionSelect = useCallback((option: FormSelectOption) => {
      if (option.disabled) return;
      
      toggleOption(option);
      eventHandlers.onOptionSelect?.(option);
      
      // Close dropdown for single select
      if (!multiSelect.enabled) {
        handleClose();
      }
      
      setIsTouched(true);
      
      // Analytics tracking
      if (trackInteractions && analyticsId) {
        // Analytics implementation would go here
      }
    }, [toggleOption, multiSelect.enabled, handleClose, eventHandlers, trackInteractions, analyticsId]);
    
    const handleClear = useCallback(() => {
      deselectAll();
      clearSearch();
      eventHandlers.onClear?.();
    }, [deselectAll, clearSearch, eventHandlers]);
    
    const handleFocus = useCallback((event: FocusEvent<HTMLElement>) => {
      setIsFocused(true);
      eventHandlers.onFocus?.(event);
    }, [eventHandlers]);
    
    const handleBlur = useCallback((event: FocusEvent<HTMLElement>) => {
      // Only blur if focus is moving outside the component
      if (!event.currentTarget.contains(event.relatedTarget as Node)) {
        setIsFocused(false);
        setIsTouched(true);
        handleClose();
        eventHandlers.onBlur?.(event);
      }
    }, [handleClose, eventHandlers]);
    
    // Click outside handler
    useEffect(() => {
      const handleClickOutside = (event: Event) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          handleClose();
        }
      };
      
      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }
    }, [isOpen, handleClose]);
    
    // Imperative Handle
    useImperativeHandle(ref, () => ({
      focus: () => triggerRef.current?.focus(),
      blur: () => triggerRef.current?.blur(),
      open: handleOpen,
      close: handleClose,
      clear: handleClear,
      selectAll,
      deselectAll,
      getSelectedOptions: () => selectedOptions,
      setValue: (newValue: string | string[]) => {
        eventHandlers.onChange?.(newValue);
      },
      search: handleSearchChange,
      scrollToOption
    }), [handleOpen, handleClose, handleClear, selectAll, deselectAll, selectedOptions, eventHandlers, handleSearchChange, scrollToOption]);
    
    // CSS Classes
    const containerClasses = [
      'form-select-container',
      `form-select-container--${variant}`,
      `form-select-container--${size}`,
      `form-select-container--glass-${glassEffect}`,
      isOpen && 'form-select-container--open',
      isFocused && 'form-select-container--focused',
      validationState !== 'neutral' && `form-select-container--${validationState}`,
      disabled && 'form-select-container--disabled',
      readOnly && 'form-select-container--readonly',
      multiSelect.enabled && 'form-select-container--multi',
      className
    ].filter(Boolean).join(' ');
    
    // Value display for trigger
    const displayValue = useMemo(() => {
      if (customValueRenderer) {
        return customValueRenderer(multiSelect.enabled ? selectedValues : (selectedValues[0] || ''), selectedOptions);
      }
      
      if (multiSelect.enabled) {
        if (selectedOptions.length === 0) {
          return multiSelect.emptyPlaceholder || placeholder;
        }
        
        if (multiSelect.displayFormat === 'count') {
          return `${selectedOptions.length} selected`;
        }
        
        if (multiSelect.displayFormat === 'list') {
          return selectedOptions.map(opt => opt.label).join(', ');
        }
        
        // Default chips format handled in render
        return null;
      }
      
      return selectedOptions[0]?.label || placeholder;
    }, [customValueRenderer, multiSelect, selectedValues, selectedOptions, placeholder]);
    
    return (
      <div className={containerClasses} ref={containerRef}>
        {/* Label */}
        {label && (
          <label className="form-select-label" htmlFor={id}>
            {label}
            {required && (
              <span className="form-select-required" aria-label="required">*</span>
            )}
          </label>
        )}
        
        {/* Trigger */}
        <div
          ref={triggerRef}
          className="form-select-trigger"
          onClick={handleToggle}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          tabIndex={disabled ? -1 : 0}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
          aria-required={required}
          aria-invalid={validationState === 'error'}
          id={id}
        >
          {/* Leading Icon */}
          {leadingIcon && (
            <div className="form-select-leading-icon">
              {leadingIcon}
            </div>
          )}
          
          {/* Value Display */}
          <div className="form-select-value">
            {multiSelect.enabled && multiSelect.displayFormat === 'chips' && selectedOptions.length > 0 ? (
              <div className="form-select-chips">
                {selectedOptions.map(option => (
                  <motion.div
                    key={option.value}
                    className={`form-select-chip form-select-chip--${multiSelect.chipVariant || 'default'}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="form-select-chip-label">{option.label}</span>
                    {multiSelect.chipRemovable !== false && (
                      <button
                        type="button"
                        className="form-select-chip-remove"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeValue(String(option.value));
                        }}
                        aria-label={`Remove ${option.label}`}
                      >
                        ×
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <span className={selectedOptions.length === 0 ? 'form-select-placeholder' : 'form-select-selected'}>
                {displayValue}
              </span>
            )}
          </div>
          
          {/* Actions */}
          <div className="form-select-actions">
            {clearable && selectedOptions.length > 0 && (
              <button
                type="button"
                className="form-select-clear"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                aria-label="Clear selection"
              >
                ×
              </button>
            )}
            
            <div className={`form-select-arrow ${isOpen ? 'form-select-arrow--open' : ''}`}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 10l5 5 5-5z"/>
              </svg>
            </div>
          </div>
        </div>
        
        {/* Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={dropdownRef}
              className="form-select-dropdown"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'fixed',
                top: position.top,
                left: position.left,
                zIndex: 1000,
                minWidth: dropdownPosition.minWidth || triggerRef.current?.offsetWidth,
                maxHeight: dropdownPosition.maxHeight || 300
              }}
            >
              {/* Search */}
              {search.enabled && (
                <div className="form-select-search">
                  <input
                    ref={searchInputRef}
                    type="text"
                    className="form-select-search-input"
                    placeholder={search.placeholder || 'Search options...'}
                    value={searchValue}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                </div>
              )}
              
              {/* Options */}
              <div className="form-select-options" role="listbox" aria-multiselectable={multiSelect.enabled}>
                {loadingState.isLoading ? (
                  <div className="form-select-loading">
                    {loadingState.skeleton ? (
                      Array.from({ length: loadingState.skeletonItems || 5 }, (_, i) => (
                        <div key={i} className="form-select-option-skeleton" />
                      ))
                    ) : (
                      <div className="form-select-loading-text">
                        {loadingState.loadingText || 'Loading...'}
                      </div>
                    )}
                  </div>
                ) : filteredOptions.length === 0 ? (
                  <div className="form-select-empty">
                    {customEmptyRenderer ? (
                      customEmptyRenderer()
                    ) : (
                      <span>No options found</span>
                    )}
                  </div>
                ) : shouldUseVirtualScrolling ? (
                  <List
                    ref={listRef}
                    height={Math.min(maxVisibleItems * itemHeight, filteredOptions.length * itemHeight)}
                    itemCount={filteredOptions.length}
                    itemSize={itemHeight}
                    itemData={{
                      options: filteredOptions,
                      isSelected,
                      highlightedIndex,
                      onSelect: handleOptionSelect,
                      customRenderer: customOptionRenderer
                    }}
                  >
                    {OptionItem}
                  </List>
                ) : (
                  filteredOptions.map((option, index) => (
                    <OptionItem
                      key={option.value}
                      index={index}
                      data={{
                        options: filteredOptions,
                        isSelected,
                        highlightedIndex,
                        onSelect: handleOptionSelect,
                        customRenderer: customOptionRenderer
                      }}
                    />
                  ))
                )}
              </div>
              
              {/* Multi-select actions */}
              {multiSelect.enabled && multiSelect.allowSelectAll && (
                <div className="form-select-multi-actions">
                  <button
                    type="button"
                    className="form-select-multi-action"
                    onClick={selectAll}
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    className="form-select-multi-action"
                    onClick={deselectAll}
                  >
                    Clear All
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Helper Text */}
        {helperText && !errorText && (
          <p className="form-select-helper-text">
            {helperText}
          </p>
        )}
        
        {/* Error Text */}
        {errorText && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="form-select-error-text"
            role="alert"
          >
            {errorText}
          </motion.p>
        )}
        
        {/* Screen Reader Text */}
        {screenReaderText && (
          <span className="sr-only">
            {screenReaderText}
          </span>
        )}
      </div>
    );
  }
);

// ==========================================
// 🔴 IA ALPHA - OPTION ITEM COMPONENT
// ==========================================

interface OptionItemProps {
  index: number;
  style?: React.CSSProperties;
  data: {
    options: FormSelectOption[];
    isSelected: (value: string | number) => boolean;
    highlightedIndex: number;
    onSelect: (option: FormSelectOption) => void;
    customRenderer?: (option: FormSelectOption, isSelected: boolean, isHighlighted: boolean) => ReactNode;
  };
}

const OptionItem: React.FC<OptionItemProps> = ({ index, style, data }) => {
  const { options, isSelected, highlightedIndex, onSelect, customRenderer } = data;
  const option = options[index];
  
  if (!option) return null;
  
  const isOptionSelected = isSelected(option.value);
  const isHighlighted = index === highlightedIndex;
  
  const handleClick = () => {
    if (!option.disabled) {
      onSelect(option);
    }
  };
  
  const optionClasses = [
    'form-select-option',
    isOptionSelected && 'form-select-option--selected',
    isHighlighted && 'form-select-option--highlighted',
    option.disabled && 'form-select-option--disabled'
  ].filter(Boolean).join(' ');
  
  return (
    <div
      style={style}
      className={optionClasses}
      onClick={handleClick}
      role="option"
      aria-selected={isOptionSelected}
      aria-disabled={option.disabled}
    >
      {customRenderer ? (
        customRenderer(option, isOptionSelected, isHighlighted)
      ) : (
        <>
          {option.icon && (
            <div className="form-select-option-icon">
              {option.icon}
            </div>
          )}
          
          <div className="form-select-option-content">
            <div className="form-select-option-label">
              {option.label}
            </div>
            {option.description && (
              <div className="form-select-option-description">
                {option.description}
              </div>
            )}
          </div>
          
          {isOptionSelected && (
            <div className="form-select-option-check">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </div>
          )}
        </>
      )}
    </div>
  );
};

FormSelect.displayName = 'FormSelect';

export default FormSelect; 