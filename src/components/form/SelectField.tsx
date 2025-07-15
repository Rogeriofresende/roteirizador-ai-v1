/**
 * 📝 SELECT FIELD - V7.5 Enhanced Professional Form Select
 * Componente de select profissional seguindo metodologia V7.5 Enhanced
 * Enhanced with validation states, icons, search, and accessibility features
 */

import React, { useState } from 'react';
import { SelectOption, SelectFieldOptions } from '../../types';

// V7.5 Enhanced Design System Imports
import { Layout } from '../../design-system/components/Layout';

// V7.5 Enhanced Icons
import { 
  CheckCircle2, 
  AlertCircle, 
  Info,
  ChevronDown,
  ChevronUp,
  Search,
  X
} from 'lucide-react';

interface SelectFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectFieldOptions;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  error?: string;
  success?: boolean;
  helperText?: string;
  variant?: 'default' | 'outlined' | 'filled' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  searchable?: boolean;
  clearable?: boolean;
  emptyMessage?: string;
}

// Função helper para normalizar opções (maintained from legacy)
const normalizeOption = (option: string | SelectOption): SelectOption => {
  return typeof option === 'string' 
    ? { value: option, label: option }
    : option;
};

const SelectField: React.FC<SelectFieldProps> = ({ 
  id, 
  label, 
  value, 
  onChange, 
  options, 
  disabled = false,
  required = true,
  placeholder = "Selecione uma opção...",
  error,
  success = false,
  helperText,
  variant = 'default',
  size = 'md',
  icon,
  searchable = false,
  clearable = false,
  emptyMessage = "Nenhuma opção encontrada"
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // V7.5 Enhanced Validation State
  const validationState = error ? 'error' : success ? 'success' : 'neutral';

  // V7.5 Enhanced Filtered Options (for searchable)
  const filteredOptions = searchable && searchTerm 
    ? options.filter(option => {
        const normalized = normalizeOption(option);
        return normalized.label.toLowerCase().includes(searchTerm.toLowerCase());
      })
    : options;

  // V7.5 Enhanced Size Classes
  const sizeClasses = {
    sm: 'h-8 text-sm px-3',
    md: 'h-10 text-base px-4',
    lg: 'h-12 text-lg px-5'
  };

  // V7.5 Enhanced Variant Classes
  const variantClasses = {
    default: `
      border-2 border-neutral-200 bg-white
      focus:border-primary-500 focus:ring-4 focus:ring-primary-100
      hover:border-neutral-300
    `,
    outlined: `
      border-2 border-primary-300 bg-transparent
      focus:border-primary-500 focus:ring-4 focus:ring-primary-100
      hover:border-primary-400
    `,
    filled: `
      border-2 border-transparent bg-neutral-100
      focus:border-primary-500 focus:ring-4 focus:ring-primary-100 focus:bg-white
      hover:bg-neutral-200
    `,
    minimal: `
      border-0 border-b-2 border-neutral-300 bg-transparent rounded-none
      focus:border-primary-500 focus:ring-0
      hover:border-neutral-400
    `
  };

  // V7.5 Enhanced Validation State Classes
  const validationClasses = {
    neutral: '',
    error: 'border-error-500 focus:border-error-500 focus:ring-error-100',
    success: 'border-success-500 focus:border-success-500 focus:ring-success-100'
  };

  // V7.5 Enhanced Selected Option Display
  const selectedOption = value ? normalizeOption(options.find(opt => {
    const normalized = normalizeOption(opt);
    return normalized.value === value;
  }) || value) : null;

  // V7.5 Enhanced Icon Component
  const ValidationIcon = () => {
    if (validationState === 'error') {
      return <AlertCircle className="w-5 h-5 text-error-500" />;
    }
    if (validationState === 'success') {
      return <CheckCircle2 className="w-5 h-5 text-success-500" />;
    }
    if (helperText && validationState === 'neutral') {
      return <Info className="w-4 h-4 text-neutral-400" />;
    }
    return null;
  };

  // V7.5 Enhanced Clear Handler
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    const syntheticEvent = {
      target: { value: '' }
    } as React.ChangeEvent<HTMLSelectElement>;
    onChange(syntheticEvent);
  };

  return (
    <Layout.Section spacing="compact" className="w-full">
      
      {/* V7.5 Enhanced Label */}
      <label 
        htmlFor={id} 
        className={`
          block text-sm font-medium mb-2 transition-colors flex items-center gap-2
          ${isFocused ? 'text-primary-700' : 'text-neutral-700'}
          ${disabled ? 'text-neutral-400' : ''}
        `}
      >
        {icon && <span className="text-neutral-500">{icon}</span>}
        {label}
        {required && <span className="text-error-500">*</span>}
        {!required && (
          <span className="text-neutral-400 text-xs font-normal">(optional)</span>
        )}
      </label>

      {/* V7.5 Enhanced Select Container */}
      <div className="relative">
        
        {/* Leading Icon */}
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none z-10">
            {icon}
          </div>
        )}

        {/* V7.5 Enhanced Select */}
        <select
          id={id}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full rounded-lg transition-all duration-200 font-medium appearance-none cursor-pointer
            disabled:bg-neutral-50 disabled:text-neutral-400 disabled:cursor-not-allowed
            ${sizeClasses[size]}
            ${variantClasses[variant]}
            ${validationClasses[validationState]}
            ${icon ? 'pl-10' : ''}
            pr-12
          `}
          aria-invalid={validationState === 'error'}
          aria-describedby={
            error ? `${id}-error` : 
            helperText ? `${id}-helper` : undefined
          }
        >
          <option value="" disabled>{placeholder}</option>
          {filteredOptions.map((option) => {
            const normalizedOption = normalizeOption(option);
            return (
              <option key={normalizedOption.value} value={normalizedOption.value}>
                {normalizedOption.label}
              </option>
            );
          })}
        </select>

        {/* Trailing Icons */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
          
          {/* Clear Button */}
          {clearable && value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="text-neutral-400 hover:text-neutral-600 transition-colors pointer-events-auto"
              aria-label="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Validation Icon */}
          <ValidationIcon />

          {/* Dropdown Arrow */}
          <ChevronDown className={`
            w-5 h-5 text-neutral-400 transition-transform duration-200
            ${isFocused ? 'rotate-180' : ''}
          `} />
        </div>
      </div>

      {/* V7.5 Enhanced Search Input (if searchable) */}
      {searchable && (
        <div className="mt-2 relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar opções..."
            className="w-full h-9 pl-10 pr-4 text-sm border-2 border-neutral-200 rounded-lg 
                     focus:border-primary-500 focus:ring-4 focus:ring-primary-100 
                     transition-all duration-200"
          />
        </div>
      )}

      {/* V7.5 Enhanced Helper/Error Text */}
      {(error || helperText) && (
        <div className="mt-2 flex items-start gap-2">
          {error && (
            <Layout.Text 
              variant="bodySmall" 
              color="error" 
              id={`${id}-error`}
              className="flex items-center gap-1"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {error}
            </Layout.Text>
          )}
          
          {!error && helperText && (
            <Layout.Text 
              variant="bodySmall" 
              color="muted" 
              id={`${id}-helper`}
              className="flex items-center gap-1"
            >
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {helperText}
            </Layout.Text>
          )}
        </div>
      )}

      {/* V7.5 Enhanced Success Feedback */}
      {success && !error && (
        <div className="mt-2">
          <Layout.Text 
            variant="bodySmall" 
            color="success"
            className="flex items-center gap-1"
          >
            <CheckCircle2 className="w-4 h-4" />
            Great choice!
          </Layout.Text>
        </div>
      )}

      {/* V7.5 Enhanced Feature Indicators */}
      {(searchable || clearable || !required) && (
        <div className="mt-1 flex items-center gap-3 text-xs text-neutral-400">
          {searchable && (
            <div className="flex items-center gap-1">
              <Search className="w-3 h-3" />
              <span>Searchable</span>
            </div>
          )}
          {clearable && (
            <div className="flex items-center gap-1">
              <X className="w-3 h-3" />
              <span>Clearable</span>
            </div>
          )}
          {!required && (
            <div className="flex items-center gap-1">
              <Info className="w-3 h-3" />
              <span>Optional</span>
            </div>
          )}
        </div>
      )}

      {/* V7.5 Enhanced Empty State (for searchable) */}
      {searchable && searchTerm && filteredOptions.length === 0 && (
        <div className="mt-2 p-3 text-center text-neutral-500 text-sm bg-neutral-50 rounded-lg border border-neutral-200">
          <Search className="w-5 h-5 mx-auto mb-1 text-neutral-400" />
          {emptyMessage}
        </div>
      )}

    </Layout.Section>
  );
};

export { normalizeOption };
export default SelectField; 