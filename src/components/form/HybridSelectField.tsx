import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  Edit, 
  Type,
  X 
} from 'lucide-react';
import { SelectOption, SelectFieldOptions } from '../../types';
import { OTHER_KEY } from '../../constants';

// Layout.Section - V7.5 Enhanced Structure
const Layout = {
  Section: ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`relative ${className}`}>{children}</div>
  ),
  Container: ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`flex flex-col space-y-2 ${className}`}>{children}</div>
  ),
  Row: ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`flex items-center space-x-2 ${className}`}>{children}</div>
  ),
  Grid: ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`grid gap-3 ${className}`}>{children}</div>
  )
};

// V7.5 Enhanced Interfaces
type ValidationState = 'error' | 'success' | 'neutral';
type SizeVariant = 'sm' | 'md' | 'lg';
type StyleVariant = 'default' | 'outlined' | 'filled' | 'minimal';

interface HybridSelectFieldProps {
  id: string;
  label: string;
  selectValue: string;
  onSelectChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  textValue: string;
  onTextChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  options: SelectFieldOptions;
  disabled?: boolean;
  
  // V7.5 Enhanced Props
  validationState?: ValidationState;
  errorMessage?: string;
  successMessage?: string;
  helperText?: string;
  size?: SizeVariant;
  variant?: StyleVariant;
  required?: boolean;
  isLoading?: boolean;
  placeholder?: string;
  textPlaceholder?: string;
  maxLength?: number;
  showCharacterCount?: boolean;
  clearable?: boolean;
  'aria-describedby'?: string;
  'aria-label'?: string;
}

// Função helper para normalizar opções (PRESERVADA)
const normalizeOption = (option: string | SelectOption): SelectOption => {
  return typeof option === 'string' 
    ? { value: option, label: option }
    : option;
};

// V7.5 Enhanced Styling System
const getFieldStyles = (
  validationState: ValidationState,
  size: SizeVariant,
  variant: StyleVariant,
  disabled: boolean,
  isLoading: boolean
) => {
  // Base styles
  const baseStyles = 'w-full transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1';
  
  // Size variants
  const sizeStyles = {
    sm: 'px-2 py-1 text-sm rounded-md',
    md: 'px-3 py-2 text-base rounded-md',
    lg: 'px-4 py-3 text-lg rounded-lg'
  };
  
  // Style variants
  const variantStyles = {
    default: 'border bg-white shadow-sm',
    outlined: 'border-2 bg-transparent',
    filled: 'border-0 bg-gray-50',
    minimal: 'border-0 border-b-2 bg-transparent rounded-none'
  };
  
  // Validation states
  const validationStyles = {
    neutral: {
      default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
      outlined: 'border-gray-400 focus:border-blue-600 focus:ring-blue-600',
      filled: 'bg-gray-50 focus:bg-gray-100 focus:ring-blue-500',
      minimal: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
    },
    error: {
      default: 'border-red-300 focus:border-red-500 focus:ring-red-500',
      outlined: 'border-red-500 focus:border-red-600 focus:ring-red-600',
      filled: 'bg-red-50 focus:bg-red-100 focus:ring-red-500',
      minimal: 'border-red-500 focus:border-red-600 focus:ring-red-600'
    },
    success: {
      default: 'border-green-300 focus:border-green-500 focus:ring-green-500',
      outlined: 'border-green-500 focus:border-green-600 focus:ring-green-600',
      filled: 'bg-green-50 focus:bg-green-100 focus:ring-green-500',
      minimal: 'border-green-500 focus:border-green-600 focus:ring-green-600'
    }
  };
  
  // Disabled state
  const disabledStyles = disabled || isLoading
    ? 'opacity-50 cursor-not-allowed bg-gray-100'
    : 'cursor-pointer hover:border-gray-400';
  
  return `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${validationStyles[validationState][variant]} ${disabledStyles}`;
};

// Feature Indicators Component
const FeatureIndicators: React.FC<{
  validationState: ValidationState;
  showText: boolean;
  isLoading: boolean;
  size: SizeVariant;
}> = ({ validationState, showText, isLoading, size }) => {
  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 20 : 16;
  
  return (
    <Layout.Row className="justify-between items-center mt-1">
      <Layout.Row>
        {validationState === 'error' && (
          <AlertCircle 
            size={iconSize} 
            className="text-red-500 animate-pulse" 
            aria-label="Erro de validação"
          />
        )}
        {validationState === 'success' && (
          <CheckCircle2 
            size={iconSize} 
            className="text-green-500" 
            aria-label="Validação bem-sucedida"
          />
        )}
        {validationState === 'neutral' && (
          <Info 
            size={iconSize} 
            className="text-blue-500" 
            aria-label="Informação"
          />
        )}
        
        {showText && (
          <Edit 
            size={iconSize} 
            className="text-purple-500 animate-bounce" 
            aria-label="Campo de texto ativo"
          />
        )}
        
        {isLoading && (
          <div 
            className="animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"
            style={{ width: iconSize, height: iconSize }}
            aria-label="Carregando"
          />
        )}
      </Layout.Row>
      
      <Layout.Row>
        <Type 
          size={iconSize - 2} 
          className="text-gray-400" 
          aria-label="Campo híbrido"
        />
      </Layout.Row>
    </Layout.Row>
  );
};

// Character Counter Component
const CharacterCounter: React.FC<{
  current: number;
  max?: number;
  size: SizeVariant;
}> = ({ current, max, size }) => {
  if (!max) return null;
  
  const percentage = (current / max) * 100;
  const isNearLimit = percentage > 80;
  const isAtLimit = current >= max;
  
  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-sm' : 'text-xs';
  
  return (
    <div className={`${textSize} ${isAtLimit ? 'text-red-500' : isNearLimit ? 'text-yellow-500' : 'text-gray-500'} flex items-center space-x-1`}>
      <Type size={12} />
      <span>{current}/{max}</span>
    </div>
  );
};

// Main Component
const HybridSelectField: React.FC<HybridSelectFieldProps> = ({
  id,
  label,
  selectValue,
  onSelectChange,
  textValue,
  onTextChange,
  options,
  disabled = false,
  validationState = 'neutral',
  errorMessage,
  successMessage,
  helperText,
  size = 'md',
  variant = 'default',
  required = false,
  isLoading = false,
  placeholder = 'Selecione uma opção...',
  textPlaceholder = 'Especifique o seu',
  maxLength,
  showCharacterCount = false,
  clearable = false,
  'aria-describedby': ariaDescribedBy,
  'aria-label': ariaLabel,
}) => {
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const selectRef = useRef<HTMLSelectElement>(null);
  const textRef = useRef<HTMLInputElement>(null);
  
  const showTextInput = selectValue === OTHER_KEY;
  const fieldStyles = getFieldStyles(validationState, size, variant, disabled, isLoading);
  
  // Auto-focus text input when "Other" is selected
  useEffect(() => {
    if (showTextInput && textRef.current) {
      textRef.current.focus();
    }
  }, [showTextInput]);
  
  // Validation message display
  const getValidationMessage = () => {
    if (validationState === 'error' && errorMessage) return errorMessage;
    if (validationState === 'success' && successMessage) return successMessage;
    return helperText;
  };
  
  const validationMessage = getValidationMessage();
  
  // Clear text input handler
  const handleClearText = () => {
    onTextChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
  };
  
  // Enhanced select change handler
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSelectChange(e);
    // Clear text value when switching away from "Other"
    if (e.target.value !== OTHER_KEY && textValue) {
      handleClearText();
    }
  };
  
  return (
    <Layout.Section className="w-full">
      <Layout.Container>
        {/* Label with Enhanced Styling */}
        <Layout.Row className="justify-between items-center">
          <label 
            htmlFor={id}
            className={`block font-medium text-gray-700 ${
              size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'
            }`}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          
          {isLoading && (
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600" />
              <span>Carregando...</span>
            </div>
          )}
        </Layout.Row>
        
        {/* Select Field */}
        <div className="relative">
          <select
            ref={selectRef}
            id={id}
            value={selectValue}
            onChange={handleSelectChange}
            disabled={disabled || isLoading}
            required={required}
            className={`${fieldStyles} appearance-none pr-10`}
            onFocus={() => setIsSelectOpen(true)}
            onBlur={() => setIsSelectOpen(false)}
            aria-label={ariaLabel || label}
            aria-describedby={ariaDescribedBy || `${id}-description`}
            aria-invalid={validationState === 'error'}
          >
            <option value="" disabled>{placeholder}</option>
            {options.map((option) => {
              const normalizedOption = normalizeOption(option);
              return (
                <option key={normalizedOption.value} value={normalizedOption.value}>
                  {normalizedOption.label}
                </option>
              );
            })}
          </select>
          
          {/* Select Arrow Icon */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            {isSelectOpen ? (
              <ChevronUp 
                size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} 
                className="text-gray-400"
                aria-hidden="true"
              />
            ) : (
              <ChevronDown 
                size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} 
                className="text-gray-400"
                aria-hidden="true"
              />
            )}
          </div>
        </div>
        
        {/* Conditional Text Input */}
        {showTextInput && (
          <Layout.Section className="relative">
            <div className="relative">
              <input
                ref={textRef}
                type="text"
                value={textValue}
                onChange={onTextChange}
                placeholder={textPlaceholder}
                disabled={disabled || isLoading}
                maxLength={maxLength}
                className={`${fieldStyles} ${clearable && textValue ? 'pr-10' : ''}`}
                aria-label={`${label} - campo personalizado`}
                aria-describedby={`${id}-text-description`}
                aria-invalid={validationState === 'error'}
              />
              
              {/* Clear Button for Text Input */}
              {clearable && textValue && !disabled && !isLoading && (
                <button
                  type="button"
                  onClick={handleClearText}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Limpar campo de texto"
                >
                  <X size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
                </button>
              )}
            </div>
            
            {/* Character Counter for Text Input */}
            {showCharacterCount && (
              <Layout.Row className="justify-end mt-1">
                <CharacterCounter 
                  current={textValue.length} 
                  max={maxLength} 
                  size={size}
                />
              </Layout.Row>
            )}
          </Layout.Section>
        )}
        
        {/* Feature Indicators */}
        <FeatureIndicators
          validationState={validationState}
          showText={showTextInput}
          isLoading={isLoading}
          size={size}
        />
        
        {/* Validation/Helper Message */}
        {validationMessage && (
          <Layout.Row className="items-start space-x-2">
            {validationState === 'error' && (
              <AlertCircle 
                size={14} 
                className="text-red-500 mt-0.5 flex-shrink-0" 
                aria-hidden="true"
              />
            )}
            {validationState === 'success' && (
              <CheckCircle2 
                size={14} 
                className="text-green-500 mt-0.5 flex-shrink-0" 
                aria-hidden="true"
              />
            )}
            {validationState === 'neutral' && (
              <Info 
                size={14} 
                className="text-blue-500 mt-0.5 flex-shrink-0" 
                aria-hidden="true"
              />
            )}
            <p 
              id={`${id}-description`}
              className={`text-sm ${
                validationState === 'error' ? 'text-red-600' :
                validationState === 'success' ? 'text-green-600' :
                'text-gray-600'
              }`}
            >
              {validationMessage}
            </p>
          </Layout.Row>
        )}
        
        {/* Additional Description for Screen Readers */}
        <div id={`${id}-text-description`} className="sr-only">
          Campo de texto condicional para especificar opção personalizada quando "Outro" for selecionado
        </div>
      </Layout.Container>
    </Layout.Section>
  );
};

export default HybridSelectField; 