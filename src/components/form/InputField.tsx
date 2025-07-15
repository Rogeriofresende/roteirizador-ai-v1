/**
 * 📝 INPUT FIELD - V7.5 Enhanced Professional Form Input
 * Componente de input profissional seguindo metodologia V7.5 Enhanced
 * Enhanced with validation states, icons, and accessibility features
 */

import React, { useState } from 'react';

// V7.5 Enhanced Design System Imports
import { Layout } from '../../design-system/components/Layout';

// V7.5 Enhanced Icons
import { 
  CheckCircle2, 
  AlertCircle, 
  Info,
  Eye,
  EyeOff 
} from 'lucide-react';

interface InputFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  error?: string;
  success?: boolean;
  helperText?: string;
  required?: boolean;
  variant?: 'default' | 'outlined' | 'filled' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  showPasswordToggle?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({ 
  id, 
  label, 
  value, 
  onChange, 
  placeholder, 
  disabled = false,
  type = 'text',
  error,
  success = false,
  helperText,
  required = false,
  variant = 'default',
  size = 'md',
  icon,
  showPasswordToggle = false
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // V7.5 Enhanced Validation State
  const validationState = error ? 'error' : success ? 'success' : 'neutral';
  
  // V7.5 Enhanced Input Type Logic
  const inputType = type === 'password' && showPassword ? 'text' : type;

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

  // V7.5 Enhanced Password Toggle Component
  const PasswordToggle = () => {
    if (type !== 'password' || !showPasswordToggle) return null;
    
    return (
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
        aria-label={showPassword ? 'Hide password' : 'Show password'}
      >
        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    );
  };

  return (
    <Layout.Section spacing="compact" className="w-full">
      
      {/* V7.5 Enhanced Label */}
      <label 
        htmlFor={id} 
        className={`
          block text-sm font-medium mb-2 transition-colors
          ${isFocused ? 'text-primary-700' : 'text-neutral-700'}
          ${disabled ? 'text-neutral-400' : ''}
        `}
      >
        {label}
        {required && <span className="text-error-500 ml-1">*</span>}
      </label>

      {/* V7.5 Enhanced Input Container */}
      <div className="relative">
        
        {/* Leading Icon */}
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
            {icon}
          </div>
        )}

        {/* V7.5 Enhanced Input */}
        <input
          type={inputType}
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full rounded-lg transition-all duration-200 font-medium
            placeholder:text-neutral-400 placeholder:font-normal
            disabled:bg-neutral-50 disabled:text-neutral-400 disabled:cursor-not-allowed
            ${sizeClasses[size]}
            ${variantClasses[variant]}
            ${validationClasses[validationState]}
            ${icon ? 'pl-10' : ''}
            ${(showPasswordToggle && type === 'password') || validationState !== 'neutral' ? 'pr-10' : ''}
          `}
          aria-invalid={validationState === 'error'}
          aria-describedby={
            error ? `${id}-error` : 
            helperText ? `${id}-helper` : undefined
          }
        />

        {/* Trailing Icons */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <ValidationIcon />
          <PasswordToggle />
        </div>
      </div>

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
            Looking good!
          </Layout.Text>
        </div>
      )}

    </Layout.Section>
  );
};

export default InputField; 