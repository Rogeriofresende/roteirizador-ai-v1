import React, { useState, useRef, useCallback, memo, forwardRef, useId, useEffect, ReactNode, SelectHTMLAttributes } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Search, X, Check } from 'lucide-react';
import { theme as designTokens } from '../../design-system/tokens';

// ===== ALPHA TECHNICAL FOUNDATION: ADVANCED TYPESCRIPT INTERFACES =====

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
  icon?: React.ReactNode;
  description?: string;
  metadata?: Record<string, any>;
}

export interface SelectOptionGroup {
  label: string;
  options: SelectOption[];
  disabled?: boolean;
}

export interface FormSelectProps {
  // Core Props
  id?: string;
  name?: string;
  value?: string | string[];
  defaultValue?: string | string[];
  placeholder?: string;
  
  // V7.5 Enhanced Variants
  variant?: 'glass' | 'outlined' | 'filled' | 'minimal';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  
  // State Props
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  error?: boolean;
  success?: boolean;
  warning?: boolean;
  loading?: boolean;
  
  // Content Props
  label?: string;
  helperText?: string;
  errorMessage?: string;
  successMessage?: string;
  warningMessage?: string;
  
  // Select Specific Props
  options?: SelectOption[];
  optionGroups?: SelectOptionGroup[];
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  closeOnSelect?: boolean;
  maxSelections?: number;
  
  // Search Props
  searchPlaceholder?: string;
  noOptionsMessage?: string;
  loadingMessage?: string;
  onSearch?: (searchTerm: string) => void;
  searchDebounceMs?: number;
  
  // Dropdown Props
  dropdownPosition?: 'auto' | 'top' | 'bottom';
  dropdownMaxHeight?: number;
  dropdownWidth?: 'auto' | 'full' | number;
  virtualization?: boolean;
  
  // Custom Rendering
  renderOption?: (option: SelectOption, isSelected: boolean, isHighlighted: boolean) => React.ReactNode;
  renderSelectedValue?: (value: string | string[], options: SelectOption[]) => React.ReactNode;
  renderNoOptions?: () => React.ReactNode;
  
  // Interaction Props
  onChange?: (value: string | string[], selectedOptions: SelectOption | SelectOption[]) => void;
  onFocus?: (event: React.FocusEvent<HTMLDivElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLDivElement>) => void;
  onDropdownOpen?: () => void;
  onDropdownClose?: () => void;
  onClear?: () => void;
  
  // Layout Props
  fullWidth?: boolean;
  className?: string;
  style?: React.CSSProperties;
  selectClassName?: string;
  dropdownClassName?: string;
  optionClassName?: string;
  labelClassName?: string;
  
  // Advanced Props
  autoFocus?: boolean;
  'data-testid'?: string;
}

interface FormSelectState {
  isOpen: boolean;
  isFocused: boolean;
  isSearching: boolean;
  searchTerm: string;
  highlightedIndex: number;
  selectedOptions: SelectOption[];
}

interface ValidationState {
  isValid: boolean;
  message: string;
  type: 'error' | 'success' | 'warning' | 'none';
}

// ===== ALPHA PERFORMANCE OPTIMIZATION: HOOKS =====

const useSelectState = (
  value: string | string[] | undefined,
  options: SelectOption[],
  multiple: boolean
) => {
  return useMemo(() => {
    if (!value) return [];
    
    const values = Array.isArray(value) ? value : [value];
    return options.filter(option => values.includes(option.value));
  }, [value, options, multiple]);
};

const useFilteredOptions = (
  options: SelectOption[],
  optionGroups: SelectOptionGroup[] | undefined,
  searchTerm: string,
  selectedOptions: SelectOption[],
  multiple: boolean
) => {
  return useMemo(() => {
    let allOptions = options;
    
    // Handle option groups
    if (optionGroups) {
      allOptions = optionGroups.reduce((acc, group) => {
        return [...acc, ...group.options];
      }, [] as SelectOption[]);
    }
    
    // Filter by search term
    if (searchTerm) {
      allOptions = allOptions.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter out selected options if not multiple
    if (!multiple && selectedOptions.length > 0) {
      const selectedValues = selectedOptions.map(opt => opt.value);
      allOptions = allOptions.filter(option => !selectedValues.includes(option.value));
    }
    
    return allOptions;
  }, [options, optionGroups, searchTerm, selectedOptions, multiple]);
};

const useDropdownPosition = (
  triggerRef: React.RefObject<HTMLDivElement>,
  dropdownRef: React.RefObject<HTMLDivElement>,
  isOpen: boolean,
  position: 'auto' | 'top' | 'bottom'
) => {
  const [actualPosition, setActualPosition] = useState<'top' | 'bottom'>('bottom');
  
  useEffect(() => {
    if (!isOpen || !triggerRef.current || !dropdownRef.current || position !== 'auto') {
      setActualPosition(position === 'top' ? 'top' : 'bottom');
      return;
    }
    
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const dropdownHeight = dropdownRef.current.offsetHeight;
    const viewportHeight = window.innerHeight;
    
    const spaceBelow = viewportHeight - triggerRect.bottom;
    const spaceAbove = triggerRect.top;
    
    if (spaceBelow >= dropdownHeight || spaceBelow >= spaceAbove) {
      setActualPosition('bottom');
    } else {
      setActualPosition('top');
    }
  }, [isOpen, position]);
  
  return actualPosition;
};

const useKeyboardNavigation = (
  isOpen: boolean,
  filteredOptions: SelectOption[],
  highlightedIndex: number,
  onSelect: (option: SelectOption) => void,
  onClose: () => void,
  onOpen: () => void
) => {
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!isOpen) {
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
        event.preventDefault();
        onOpen();
      }
      return;
    }
    
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        return Math.min(highlightedIndex + 1, filteredOptions.length - 1);
      
      case 'ArrowUp':
        event.preventDefault();
        return Math.max(highlightedIndex - 1, 0);
      
      case 'Enter':
        event.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          onSelect(filteredOptions[highlightedIndex]);
        }
        return highlightedIndex;
      
      case 'Escape':
        event.preventDefault();
        onClose();
        return highlightedIndex;
      
      default:
        return highlightedIndex;
    }
  }, [isOpen, highlightedIndex, filteredOptions, onSelect, onClose, onOpen]);
  
  return handleKeyDown;
};

// ===== BETA V7.5 ENHANCED: GLASS-MORPHISM VARIANTS =====

const getVariantStyles = (variant: string, state: FormSelectState, validation: ValidationState) => {
  const baseStyles = {
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    borderRadius: designTokens.borderRadius.lg,
    cursor: 'pointer',
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const variants = {
    glass: {
      background: state.isFocused || state.isOpen
        ? 'rgba(255, 255, 255, 0.25)' 
        : 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      border: `1px solid ${state.isFocused || state.isOpen
        ? 'rgba(255, 255, 255, 0.3)' 
        : 'rgba(255, 255, 255, 0.2)'}`,
      boxShadow: state.isFocused || state.isOpen
        ? '0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 2px rgba(99, 102, 241, 0.2)' 
        : '0 4px 16px rgba(0, 0, 0, 0.05)',
    },
    
    outlined: {
      background: 'transparent',
      border: `2px solid ${state.isFocused || state.isOpen
        ? designTokens.colors.primary[500] 
        : designTokens.colors.neutral[300]}`,
      boxShadow: state.isFocused || state.isOpen
        ? `0 0 0 3px ${designTokens.colors.primary[100]}` 
        : 'none',
    },
    
    filled: {
      background: state.isFocused || state.isOpen
        ? designTokens.colors.neutral[50] 
        : designTokens.colors.neutral[100],
      border: `1px solid ${state.isFocused || state.isOpen
        ? designTokens.colors.primary[500] 
        : 'transparent'}`,
      borderRadius: designTokens.borderRadius.lg,
    },
    
    minimal: {
      background: 'transparent',
      border: 'none',
      borderBottom: `2px solid ${state.isFocused || state.isOpen
        ? designTokens.colors.primary[500] 
        : designTokens.colors.neutral[300]}`,
      borderRadius: 0,
      paddingLeft: 0,
      paddingRight: 0,
    },
  };

  let styles = { ...baseStyles, ...variants[variant as keyof typeof variants] };

  // Validation state overrides
  if (validation.type === 'error') {
    styles.border = `2px solid ${designTokens.colors.red[500]}`;
    styles.boxShadow = `0 0 0 3px ${designTokens.colors.red[100]}`;
  } else if (validation.type === 'success') {
    styles.border = `2px solid ${designTokens.colors.green[500]}`;
    styles.boxShadow = `0 0 0 3px ${designTokens.colors.green[100]}`;
  } else if (validation.type === 'warning') {
    styles.border = `2px solid ${designTokens.colors.yellow[500]}`;
    styles.boxShadow = `0 0 0 3px ${designTokens.colors.yellow[100]}`;
  }

  return styles;
};

const getSizeStyles = (size: string) => {
  const sizes = {
    sm: {
      minHeight: '32px',
      fontSize: designTokens.typography.fontSize.sm,
      padding: '6px 32px 6px 12px',
      gap: '6px',
    },
    md: {
      minHeight: '40px', 
      fontSize: designTokens.typography.fontSize.base,
      padding: '8px 36px 8px 16px',
      gap: '8px',
    },
    lg: {
      minHeight: '48px',
      fontSize: designTokens.typography.fontSize.lg,
      padding: '12px 40px 12px 20px',
      gap: '10px',
    },
    xl: {
      minHeight: '56px',
      fontSize: designTokens.typography.fontSize.xl,
      padding: '16px 44px 16px 24px',
      gap: '12px',
    },
  };
  
  return sizes[size as keyof typeof sizes] || sizes.md;
};

const getDropdownStyles = (variant: string, position: 'top' | 'bottom', maxHeight: number) => {
  const baseStyles = {
    position: 'absolute' as const,
    left: 0,
    right: 0,
    zIndex: 1000,
    maxHeight: `${maxHeight}px`,
    overflowY: 'auto' as const,
    borderRadius: designTokens.borderRadius.lg,
    border: `1px solid ${designTokens.colors.neutral[200]}`,
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
  };

  const positionStyles = position === 'top' 
    ? { bottom: '100%', marginBottom: '4px' }
    : { top: '100%', marginTop: '4px' };

  const variantStyles = {
    glass: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
    },
    outlined: {
      background: 'white',
    },
    filled: {
      background: 'white',
    },
    minimal: {
      background: 'white',
    },
  };

  return {
    ...baseStyles,
    ...positionStyles,
    ...variantStyles[variant as keyof typeof variantStyles],
  };
};

// ===== CHARLIE ACCESSIBILITY FRAMEWORK =====

const getAriaProps = (
  props: FormSelectProps,
  validation: ValidationState,
  selectId: string,
  isOpen: boolean,
  selectedOptions: SelectOption[],
  highlightedIndex: number
) => ({
  'aria-invalid': validation.type === 'error',
  'aria-describedby': [
    props.helperText && `${selectId}-helper`,
    validation.message && `${selectId}-validation`,
  ].filter(Boolean).join(' ') || undefined,
  'aria-required': props.required,
  'aria-label': !props.label ? props.placeholder : undefined,
  'aria-expanded': isOpen,
  'aria-haspopup': 'listbox',
  'aria-activedescendant': isOpen && highlightedIndex >= 0 ? `${selectId}-option-${highlightedIndex}` : undefined,
  role: 'combobox',
});

// ===== OPTION COMPONENT =====

const SelectOptionComponent: React.FC<{
  option: SelectOption;
  isSelected: boolean;
  isHighlighted: boolean;
  onClick: () => void;
  renderOption?: (option: SelectOption, isSelected: boolean, isHighlighted: boolean) => React.ReactNode;
  multiple: boolean;
  size: string;
  variant: string;
  index: number;
  selectId: string;
}> = ({ option, isSelected, isHighlighted, onClick, renderOption, multiple, size, variant, index, selectId }) => {
  const sizeStyles = {
    sm: { padding: '8px 12px', fontSize: designTokens.typography.fontSize.sm },
    md: { padding: '10px 16px', fontSize: designTokens.typography.fontSize.base },
    lg: { padding: '12px 20px', fontSize: designTokens.typography.fontSize.lg },
    xl: { padding: '14px 24px', fontSize: designTokens.typography.fontSize.xl },
  };

  const optionStyles = {
    ...sizeStyles[size as keyof typeof sizeStyles],
    display: 'flex',
    alignItems: 'center',
    gap: designTokens.spacing[2],
    cursor: option.disabled ? 'not-allowed' : 'pointer',
    color: option.disabled 
      ? designTokens.colors.neutral[400]
      : isSelected 
      ? designTokens.colors.primary[700]
      : designTokens.colors.neutral[700],
    background: isHighlighted 
      ? designTokens.colors.primary[50]
      : isSelected 
      ? designTokens.colors.primary[25]
      : 'transparent',
    opacity: option.disabled ? 0.5 : 1,
  };

  if (renderOption) {
    return (
      <motion.div
        id={`${selectId}-option-${index}`}
        role="option"
        aria-selected={isSelected}
        aria-disabled={option.disabled}
        style={optionStyles}
        onClick={!option.disabled ? onClick : undefined}
        whileHover={!option.disabled ? { backgroundColor: designTokens.colors.primary[50] } : {}}
        whileTap={!option.disabled ? { scale: 0.98 } : {}}
        transition={{ duration: 0.1 }}
      >
        {renderOption(option, isSelected, isHighlighted)}
      </motion.div>
    );
  }

  return (
    <motion.div
      id={`${selectId}-option-${index}`}
      role="option"
      aria-selected={isSelected}
      aria-disabled={option.disabled}
      style={optionStyles}
      onClick={!option.disabled ? onClick : undefined}
      whileHover={!option.disabled ? { backgroundColor: designTokens.colors.primary[50] } : {}}
      whileTap={!option.disabled ? { scale: 0.98 } : {}}
      transition={{ duration: 0.1 }}
    >
      {multiple && (
        <div style={{
          width: '16px',
          height: '16px',
          border: `2px solid ${isSelected ? designTokens.colors.primary[500] : designTokens.colors.neutral[300]}`,
          borderRadius: '3px',
          background: isSelected ? designTokens.colors.primary[500] : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {isSelected && <Check size={10} color="white" />}
        </div>
      )}
      
      {option.icon && (
        <span style={{ display: 'flex', alignItems: 'center' }}>
          {option.icon}
        </span>
      )}
      
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: isSelected ? 'medium' : 'normal' }}>
          {option.label}
        </div>
        {option.description && (
          <div style={{
            fontSize: designTokens.typography.fontSize.xs,
            color: designTokens.colors.neutral[500],
            marginTop: '2px',
          }}>
            {option.description}
          </div>
        )}
      </div>
      
      {!multiple && isSelected && (
        <Check size={16} color={designTokens.colors.primary[500]} />
      )}
    </motion.div>
  );
};

// ===== MAIN COMPONENT =====

export const FormSelect = memo(forwardRef<HTMLDivElement, FormSelectProps>(({
  // Core props
  id,
  name,
  value,
  defaultValue,
  placeholder = 'Select an option...',
  
  // V7.5 Enhanced props  
  variant = 'glass',
  size = 'md',
  
  // State props
  disabled = false,
  readOnly = false,
  required = false,
  error = false,
  success = false,
  warning = false,
  loading = false,
  
  // Content props
  label,
  helperText,
  errorMessage,
  successMessage,
  warningMessage,
  
  // Select specific props
  options = [],
  optionGroups,
  multiple = false,
  searchable = false,
  clearable = false,
  closeOnSelect = true,
  maxSelections,
  
  // Search props
  searchPlaceholder = 'Search options...',
  noOptionsMessage = 'No options found',
  loadingMessage = 'Loading...',
  onSearch,
  searchDebounceMs = 300,
  
  // Dropdown props
  dropdownPosition = 'auto',
  dropdownMaxHeight = 300,
  dropdownWidth = 'full',
  
  // Custom rendering
  renderOption,
  renderSelectedValue,
  renderNoOptions,
  
  // Interaction props
  onChange,
  onFocus,
  onBlur,
  onDropdownOpen,
  onDropdownClose,
  onClear,
  
  // Layout props
  fullWidth = false,
  className = '',
  style,
  selectClassName = '',
  dropdownClassName = '',
  optionClassName = '',
  labelClassName = '',
  
  // Advanced props
  autoFocus = false,
  'data-testid': testId,
  
  ...restProps
}, ref) => {
  // ===== STATE MANAGEMENT =====
  const selectId = useId();
  const finalId = id || selectId;
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  
  // Merge refs
  React.useImperativeHandle(ref, () => triggerRef.current!, []);
  
  const [state, setState] = useState<FormSelectState>({
    isOpen: false,
    isFocused: false,
    isSearching: false,
    searchTerm: '',
    highlightedIndex: 0,
    selectedOptions: [],
  });
  
  const validation = {
    isValid: !error,
    message: error ? errorMessage : success ? successMessage : warning ? warningMessage : '',
    type: error ? 'error' as const : success ? 'success' as const : warning ? 'warning' as const : 'none' as const,
  };
  
  // ===== HOOKS =====
  const selectedOptions = useSelectState(value || defaultValue, options, multiple);
  const filteredOptions = useFilteredOptions(options, optionGroups, state.searchTerm, selectedOptions, multiple);
  const dropdownActualPosition = useDropdownPosition(triggerRef, dropdownRef, state.isOpen, dropdownPosition);
  
  // ===== EVENT HANDLERS =====
  const handleOpen = useCallback(() => {
    if (disabled || readOnly) return;
    
    setState(prev => ({ ...prev, isOpen: true, highlightedIndex: 0 }));
    onDropdownOpen?.();
    
    // Focus search input if searchable
    if (searchable) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [disabled, readOnly, searchable, onDropdownOpen]);
  
  const handleClose = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      isOpen: false, 
      searchTerm: '', 
      isSearching: false,
      highlightedIndex: 0 
    }));
    onDropdownClose?.();
  }, [onDropdownClose]);
  
  const handleSelect = useCallback((option: SelectOption) => {
    if (option.disabled) return;
    
    let newValue: string | string[];
    let newSelectedOptions: SelectOption | SelectOption[];
    
    if (multiple) {
      const isSelected = selectedOptions.some(selected => selected.value === option.value);
      
      if (isSelected) {
        // Remove from selection
        const newSelected = selectedOptions.filter(selected => selected.value !== option.value);
        newValue = newSelected.map(opt => opt.value);
        newSelectedOptions = newSelected;
      } else {
        // Add to selection (check max selections)
        if (maxSelections && selectedOptions.length >= maxSelections) return;
        
        const newSelected = [...selectedOptions, option];
        newValue = newSelected.map(opt => opt.value);
        newSelectedOptions = newSelected;
      }
    } else {
      newValue = option.value;
      newSelectedOptions = option;
      
      if (closeOnSelect) {
        handleClose();
      }
    }
    
    setState(prev => ({ ...prev, selectedOptions: Array.isArray(newSelectedOptions) ? newSelectedOptions : [newSelectedOptions] }));
    onChange?.(newValue, newSelectedOptions);
  }, [selectedOptions, multiple, maxSelections, closeOnSelect, handleClose, onChange]);
  
  const handleClear = useCallback(() => {
    const newValue = multiple ? [] : '';
    const newSelectedOptions = multiple ? [] : null;
    
    setState(prev => ({ ...prev, selectedOptions: [] }));
    onChange?.(newValue as any, newSelectedOptions as any);
    onClear?.();
  }, [multiple, onChange, onClear]);
  
  const handleSearch = useCallback((searchTerm: string) => {
    setState(prev => ({ ...prev, searchTerm, highlightedIndex: 0 }));
    onSearch?.(searchTerm);
  }, [onSearch]);
  
  const handleKeyDown = useKeyboardNavigation(
    state.isOpen,
    filteredOptions,
    state.highlightedIndex,
    handleSelect,
    handleClose,
    handleOpen
  );
  
  const handleKeyDownWrapper = useCallback((event: React.KeyboardEvent) => {
    const newIndex = handleKeyDown(event);
    if (typeof newIndex === 'number' && newIndex !== state.highlightedIndex) {
      setState(prev => ({ ...prev, highlightedIndex: newIndex }));
    }
  }, [handleKeyDown, state.highlightedIndex]);
  
  const handleFocus = useCallback((event: React.FocusEvent<HTMLDivElement>) => {
    setState(prev => ({ ...prev, isFocused: true }));
    onFocus?.(event);
  }, [onFocus]);
  
  const handleBlur = useCallback((event: React.FocusEvent<HTMLDivElement>) => {
    // Don't close if focus is moving to dropdown
    if (!dropdownRef.current?.contains(event.relatedTarget)) {
      setState(prev => ({ ...prev, isFocused: false }));
      handleClose();
      onBlur?.(event);
    }
  }, [handleClose, onBlur]);
  
  // ===== CLOSE ON CLICK OUTSIDE =====
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        state.isOpen &&
        triggerRef.current &&
        dropdownRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [state.isOpen, handleClose]);
  
  // ===== STYLES =====
  const containerStyles = {
    width: fullWidth ? '100%' : 'auto',
    position: 'relative' as const,
  };
  
  const selectStyles = {
    ...getSizeStyles(size),
    ...getVariantStyles(variant, state, validation),
    width: '100%',
    outline: 'none',
    color: selectedOptions.length > 0 
      ? designTokens.colors.neutral[900] 
      : designTokens.colors.neutral[400],
    fontFamily: designTokens.typography.fontFamily.sans,
    fontWeight: designTokens.typography.fontWeight.normal,
  };
  
  const labelStyles = {
    display: 'block',
    marginBottom: designTokens.spacing[2],
    fontSize: designTokens.typography.fontSize.sm,
    fontWeight: designTokens.typography.fontWeight.medium,
    color: validation.type === 'error' 
      ? designTokens.colors.red[700] 
      : designTokens.colors.neutral[700],
  };
  
  const dropdownStyles = getDropdownStyles(variant, dropdownActualPosition, dropdownMaxHeight);
  
  // ===== RENDER SELECTED VALUE =====
  const renderSelectedDisplay = () => {
    if (renderSelectedValue) {
      return renderSelectedValue(multiple ? selectedOptions.map(opt => opt.value) : selectedOptions[0]?.value || '', selectedOptions);
    }
    
    if (selectedOptions.length === 0) {
      return (
        <span style={{ color: designTokens.colors.neutral[400] }}>
          {placeholder}
        </span>
      );
    }
    
    if (multiple) {
      if (selectedOptions.length === 1) {
        return selectedOptions[0].label;
      }
      return `${selectedOptions.length} selected`;
    }
    
    return selectedOptions[0]?.label;
  };
  
  // ===== RENDER =====
  return (
    <div style={containerStyles} className={className}>
      {/* Label */}
      {label && (
        <motion.label
          htmlFor={finalId}
          style={labelStyles}
          className={labelClassName}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
        >
          {label}
          {required && (
            <span style={{ color: designTokens.colors.red[500], marginLeft: 4 }}>
              *
            </span>
          )}
        </motion.label>
      )}
      
      {/* Select Trigger */}
      <div style={{ position: 'relative' }}>
        <motion.div
          ref={triggerRef}
          id={finalId}
          style={selectStyles}
          className={selectClassName}
          tabIndex={disabled ? -1 : 0}
          onClick={state.isOpen ? handleClose : handleOpen}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDownWrapper}
          data-testid={testId}
          {...getAriaProps(props, validation, finalId, state.isOpen, selectedOptions, state.highlightedIndex)}
          {...restProps}
          initial={{ scale: 0.98 }}
          animate={{ scale: 1 }}
          whileFocus={{ scale: 1.005 }}
          transition={{ duration: 0.1 }}
        >
          <div style={{ flex: 1, overflow: 'hidden' }}>
            {renderSelectedDisplay()}
          </div>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: designTokens.spacing[1],
            position: 'absolute',
            right: size === 'sm' ? '8px' : size === 'md' ? '12px' : '16px',
            top: '50%',
            transform: 'translateY(-50%)',
          }}>
            {loading && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{
                  width: '16px',
                  height: '16px',
                  border: `2px solid ${designTokens.colors.neutral[300]}`,
                  borderTop: `2px solid ${designTokens.colors.primary[500]}`,
                  borderRadius: '50%',
                }}
              />
            )}
            
            {clearable && selectedOptions.length > 0 && !loading && (
              <motion.button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '2px',
                  cursor: 'pointer',
                  color: designTokens.colors.neutral[500],
                  display: 'flex',
                  alignItems: 'center',
                }}
                whileHover={{ color: designTokens.colors.neutral[700] }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={14} />
              </motion.button>
            )}
            
            {!loading && (
              <motion.div
                style={{
                  color: designTokens.colors.neutral[500],
                  display: 'flex',
                  alignItems: 'center',
                }}
                animate={{ rotate: state.isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown size={16} />
              </motion.div>
            )}
          </div>
        </motion.div>
        
        {/* Dropdown */}
        <AnimatePresence>
          {state.isOpen && (
            <motion.div
              ref={dropdownRef}
              style={dropdownStyles}
              className={dropdownClassName}
              initial={{ opacity: 0, y: dropdownActualPosition === 'bottom' ? -8 : 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: dropdownActualPosition === 'bottom' ? -8 : 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
            >
              {/* Search Input */}
              {searchable && (
                <div style={{
                  padding: designTokens.spacing[3],
                  borderBottom: `1px solid ${designTokens.colors.neutral[200]}`,
                  position: 'sticky',
                  top: 0,
                  background: 'inherit',
                  zIndex: 1,
                }}>
                  <div style={{ position: 'relative' }}>
                    <Search 
                      size={16} 
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: designTokens.colors.neutral[400],
                      }}
                    />
                    <input
                      ref={searchRef}
                      type="text"
                      placeholder={searchPlaceholder}
                      value={state.searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px 8px 36px',
                        border: `1px solid ${designTokens.colors.neutral[300]}`,
                        borderRadius: designTokens.borderRadius.md,
                        fontSize: designTokens.typography.fontSize.sm,
                        outline: 'none',
                        background: 'white',
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'ArrowDown' && filteredOptions.length > 0) {
                          e.preventDefault();
                          setState(prev => ({ ...prev, highlightedIndex: 0 }));
                          triggerRef.current?.focus();
                        }
                      }}
                    />
                  </div>
                </div>
              )}
              
              {/* Options List */}
              <div 
                role="listbox"
                aria-multiselectable={multiple}
                style={{ 
                  maxHeight: dropdownMaxHeight - (searchable ? 60 : 0),
                  overflowY: 'auto',
                }}
              >
                {loading ? (
                  <div style={{
                    padding: designTokens.spacing[4],
                    textAlign: 'center',
                    color: designTokens.colors.neutral[500],
                    fontSize: designTokens.typography.fontSize.sm,
                  }}>
                    {loadingMessage}
                  </div>
                ) : filteredOptions.length === 0 ? (
                  <div style={{
                    padding: designTokens.spacing[4],
                    textAlign: 'center',
                    color: designTokens.colors.neutral[500],
                    fontSize: designTokens.typography.fontSize.sm,
                  }}>
                    {renderNoOptions ? renderNoOptions() : noOptionsMessage}
                  </div>
                ) : (
                  filteredOptions.map((option, index) => {
                    const isSelected = selectedOptions.some(selected => selected.value === option.value);
                    const isHighlighted = index === state.highlightedIndex;
                    
                    return (
                      <SelectOptionComponent
                        key={option.value}
                        option={option}
                        isSelected={isSelected}
                        isHighlighted={isHighlighted}
                        onClick={() => handleSelect(option)}
                        renderOption={renderOption}
                        multiple={multiple}
                        size={size}
                        variant={variant}
                        index={index}
                        selectId={finalId}
                      />
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Footer Information */}
      <AnimatePresence>
        {(helperText || validation.message) && (
          <motion.div
            style={{
              marginTop: designTokens.spacing[2],
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: designTokens.spacing[2],
            }}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
          >
            {/* Helper Text / Validation Message */}
            <div style={{ flex: 1 }}>
              {validation.message && (
                <div
                  id={`${finalId}-validation`}
                  style={{
                    fontSize: designTokens.typography.fontSize.sm,
                    color: validation.type === 'error' 
                      ? designTokens.colors.red[600]
                      : validation.type === 'success'
                      ? designTokens.colors.green[600] 
                      : validation.type === 'warning'
                      ? designTokens.colors.yellow[600]
                      : designTokens.colors.neutral[600],
                    marginBottom: helperText ? designTokens.spacing[1] : 0,
                  }}
                >
                  {validation.message}
                </div>
              )}
              
              {helperText && (
                <div
                  id={`${finalId}-helper`}
                  style={{
                    fontSize: designTokens.typography.fontSize.sm,
                    color: designTokens.colors.neutral[600],
                  }}
                >
                  {helperText}
                </div>
              )}
            </div>
            
            {/* Selection Info */}
            {multiple && selectedOptions.length > 0 && (
              <div style={{
                fontSize: designTokens.typography.fontSize.xs,
                color: designTokens.colors.neutral[500],
                flexShrink: 0,
              }}>
                {selectedOptions.length} of {maxSelections || options.length}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}));

FormSelect.displayName = 'FormSelect';

export default FormSelect; 