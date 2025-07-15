/**
 * 📝 TEXTAREA FIELD - V7.5 Enhanced Professional Form Textarea
 * Componente de textarea profissional seguindo metodologia V7.5 Enhanced
 * Enhanced with auto-resize, character count, validation states, and accessibility
 */

import React, { useState, useRef, useEffect } from 'react';

// V7.5 Enhanced Design System Imports
import { Layout } from '../../design-system/components/Layout';

// V7.5 Enhanced Icons
import { 
  CheckCircle2, 
  AlertCircle, 
  Info,
  Type,
  FileText,
  MessageSquare
} from 'lucide-react';

interface TextareaFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  isOptional?: boolean;
  rows?: number;
  maxLength?: number;
  minRows?: number;
  maxRows?: number;
  autoResize?: boolean;
  showCharacterCount?: boolean;
  error?: string;
  success?: boolean;
  helperText?: string;
  variant?: 'default' | 'outlined' | 'filled' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

const TextareaField: React.FC<TextareaFieldProps> = ({ 
  id, 
  label, 
  value, 
  onChange, 
  placeholder, 
  disabled = false,
  isOptional = false,
  rows = 4,
  maxLength,
  minRows = 2,
  maxRows = 12,
  autoResize = false,
  showCharacterCount = false,
  error,
  success = false,
  helperText,
  variant = 'default',
  size = 'md',
  icon
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // V7.5 Enhanced Auto-resize Logic
  useEffect(() => {
    if (autoResize && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      
      const scrollHeight = textarea.scrollHeight;
      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
      const minHeight = lineHeight * minRows;
      const maxHeight = lineHeight * maxRows;
      
      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
      textarea.style.height = `${newHeight}px`;
    }
  }, [value, autoResize, minRows, maxRows]);

  // V7.5 Enhanced Validation State
  const validationState = error ? 'error' : success ? 'success' : 'neutral';
  
  // V7.5 Enhanced Character Count Logic
  const characterCount = value.length;
  const isNearLimit = maxLength && characterCount > maxLength * 0.8;
  const isOverLimit = maxLength && characterCount > maxLength;

  // V7.5 Enhanced Size Classes
  const sizeClasses = {
    sm: 'text-sm px-3 py-2',
    md: 'text-base px-4 py-3',
    lg: 'text-lg px-5 py-4'
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

  // V7.5 Enhanced Character Count Component
  const CharacterCount = () => {
    if (!showCharacterCount && !maxLength) return null;

    return (
      <div className="flex items-center gap-1 text-xs">
        <Type className="w-3 h-3" />
        <span className={`
          transition-colors
          ${isOverLimit ? 'text-error-600 font-semibold' : 
            isNearLimit ? 'text-warning-600' : 'text-neutral-500'}
        `}>
          {characterCount}
          {maxLength && `/${maxLength}`}
        </span>
      </div>
    );
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
        {!isOptional && <span className="text-error-500">*</span>}
        {isOptional && (
          <span className="text-neutral-400 text-xs font-normal">(optional)</span>
        )}
      </label>

      {/* V7.5 Enhanced Textarea Container */}
      <div className="relative">
        
        {/* V7.5 Enhanced Textarea */}
        <textarea
          ref={textareaRef}
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          rows={autoResize ? minRows : rows}
          maxLength={maxLength}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full rounded-lg transition-all duration-200 font-medium resize-none
            placeholder:text-neutral-400 placeholder:font-normal
            disabled:bg-neutral-50 disabled:text-neutral-400 disabled:cursor-not-allowed
            ${sizeClasses[size]}
            ${variantClasses[variant]}
            ${validationClasses[validationState]}
            ${autoResize ? 'overflow-hidden' : 'overflow-auto'}
          `}
          style={{
            minHeight: autoResize ? `${parseInt(getComputedStyle(document.documentElement).fontSize) * 1.5 * minRows}px` : undefined
          }}
          aria-invalid={validationState === 'error'}
          aria-describedby={
            error ? `${id}-error` : 
            helperText ? `${id}-helper` : undefined
          }
        />

        {/* Validation Icon */}
        {validationState !== 'neutral' && (
          <div className="absolute top-3 right-3">
            <ValidationIcon />
          </div>
        )}
      </div>

      {/* V7.5 Enhanced Footer - Character Count & Helper Text */}
      <div className="mt-2 flex items-start justify-between gap-2">
        
        {/* Helper/Error Text */}
        <div className="flex-1">
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

          {success && !error && (
            <Layout.Text 
              variant="bodySmall" 
              color="success"
              className="flex items-center gap-1"
            >
              <CheckCircle2 className="w-4 h-4" />
              Looking good!
            </Layout.Text>
          )}
        </div>

        {/* Character Count */}
        <CharacterCount />
      </div>

      {/* V7.5 Enhanced Feature Indicators */}
      {(autoResize || maxLength) && (
        <div className="mt-1 flex items-center gap-3 text-xs text-neutral-400">
          {autoResize && (
            <div className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              <span>Auto-resize</span>
            </div>
          )}
          {maxLength && (
            <div className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              <span>Max {maxLength} chars</span>
            </div>
          )}
        </div>
      )}

    </Layout.Section>
  );
};

export default TextareaField; 