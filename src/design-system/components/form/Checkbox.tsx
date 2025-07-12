/**
 * ☑️ Checkbox & Radio Components - Form Inputs
 * 
 * Custom styled checkbox and radio components with group management
 * Migration support, cost tier styling, and indeterminate states
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
  InputHTMLAttributes,
  ChangeEvent 
} from 'react';
import { colors, spacing, typography, borderRadius, shadows, transitions } from '../../tokens';
import { familiarElements } from '../../migration-patterns';
import { keyboardNavigation, screenReaderSupport } from '../../accessibility';

// ============================================================================
// CHECKBOX & RADIO TYPES & INTERFACES
// ============================================================================

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Checkbox label */
  label?: string;
  
  /** Checkbox description */
  description?: string;
  
  /** Checkbox size */
  size?: 'small' | 'medium' | 'large';
  
  /** Indeterminate state */
  indeterminate?: boolean;
  
  /** Error state */
  error?: boolean;
  
  /** Custom icon when checked */
  checkedIcon?: ReactNode;
  
  /** Custom icon when unchecked */
  uncheckedIcon?: ReactNode;
  
  /** Custom icon when indeterminate */
  indeterminateIcon?: ReactNode;
  
  /** Migration mode for styling */
  migrationMode?: 'familiar' | 'enhanced';
  
  /** Cost tier for Alpha integration */
  costTier?: 'free' | 'premium';
  
  /** Analytics tracking for Charlie integration */
  trackingId?: string;
  
  /** Label position */
  labelPosition?: 'left' | 'right';
  
  /** Callback when checked state changes */
  onCheckedChange?: (checked: boolean) => void;
}

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Radio label */
  label?: string;
  
  /** Radio description */
  description?: string;
  
  /** Radio size */
  size?: 'small' | 'medium' | 'large';
  
  /** Error state */
  error?: boolean;
  
  /** Custom icon when selected */
  selectedIcon?: ReactNode;
  
  /** Custom icon when unselected */
  unselectedIcon?: ReactNode;
  
  /** Migration mode for styling */
  migrationMode?: 'familiar' | 'enhanced';
  
  /** Cost tier for Alpha integration */
  costTier?: 'free' | 'premium';
  
  /** Analytics tracking for Charlie integration */
  trackingId?: string;
  
  /** Label position */
  labelPosition?: 'left' | 'right';
  
  /** Callback when selected state changes */
  onSelectedChange?: (selected: boolean) => void;
}

export interface CheckboxGroupProps {
  /** Group name */
  name?: string;
  
  /** Group label */
  label?: string;
  
  /** Group description */
  description?: string;
  
  /** Group values */
  value?: string[];
  
  /** Default values */
  defaultValue?: string[];
  
  /** Available options */
  options: Array<{
    value: string;
    label: string;
    description?: string;
    disabled?: boolean;
  }>;
  
  /** Group layout */
  layout?: 'vertical' | 'horizontal' | 'grid';
  
  /** Grid columns (when layout is grid) */
  gridColumns?: 2 | 3 | 4;
  
  /** Group size */
  size?: 'small' | 'medium' | 'large';
  
  /** Disabled state */
  disabled?: boolean;
  
  /** Error state */
  error?: string;
  
  /** Migration mode for styling */
  migrationMode?: 'familiar' | 'enhanced';
  
  /** Cost tier for Alpha integration */
  costTier?: 'free' | 'premium';
  
  /** Analytics tracking for Charlie integration */
  trackingId?: string;
  
  /** Callback when values change */
  onChange?: (values: string[]) => void;
}

export interface RadioGroupProps {
  /** Group name */
  name: string;
  
  /** Group label */
  label?: string;
  
  /** Group description */
  description?: string;
  
  /** Selected value */
  value?: string;
  
  /** Default value */
  defaultValue?: string;
  
  /** Available options */
  options: Array<{
    value: string;
    label: string;
    description?: string;
    disabled?: boolean;
  }>;
  
  /** Group layout */
  layout?: 'vertical' | 'horizontal' | 'grid';
  
  /** Grid columns (when layout is grid) */
  gridColumns?: 2 | 3 | 4;
  
  /** Group size */
  size?: 'small' | 'medium' | 'large';
  
  /** Disabled state */
  disabled?: boolean;
  
  /** Error state */
  error?: string;
  
  /** Migration mode for styling */
  migrationMode?: 'familiar' | 'enhanced';
  
  /** Cost tier for Alpha integration */
  costTier?: 'free' | 'premium';
  
  /** Analytics tracking for Charlie integration */
  trackingId?: string;
  
  /** Callback when value changes */
  onChange?: (value: string) => void;
}

// ============================================================================
// CHECKBOX STYLES
// ============================================================================

const getCheckboxStyles = (
  size: CheckboxProps['size'] = 'medium',
  migrationMode: CheckboxProps['migrationMode'] = 'enhanced',
  error: boolean = false,
  disabled: boolean = false,
  checked: boolean = false,
  indeterminate: boolean = false,
  costTier: CheckboxProps['costTier'] = 'free'
) => {
  
  // Size configurations
  const sizeConfig = {
    small: { size: '16px', fontSize: typography.fontSize.sm },
    medium: { size: '20px', fontSize: typography.fontSize.base },
    large: { size: '24px', fontSize: typography.fontSize.lg }
  };
  
  const config = sizeConfig[size];
  
  // Checkbox styles
  const checkboxStyles: React.CSSProperties = {
    width: config.size,
    height: config.size,
    borderRadius: migrationMode === 'familiar' ? borderRadius.sm : borderRadius.md,
    border: `2px solid`,
    borderColor: error 
      ? colors.error[500]
      : checked || indeterminate
        ? (costTier === 'premium' ? colors.costTier.premium.primary : colors.primary[500])
        : colors.neutral[300],
    backgroundColor: checked || indeterminate
      ? (costTier === 'premium' ? colors.costTier.premium.primary : colors.primary[500])
      : 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: transitions.common.all,
    opacity: disabled ? 0.5 : 1,
    color: 'white',
    fontSize: size === 'small' ? '10px' : size === 'large' ? '14px' : '12px'
  };
  
  // Label styles
  const labelStyles: React.CSSProperties = {
    fontSize: config.fontSize,
    color: disabled ? colors.neutral[400] : colors.neutral[700],
    lineHeight: typography.lineHeight.normal,
    cursor: disabled ? 'not-allowed' : 'pointer',
    userSelect: 'none'
  };
  
  return { checkboxStyles, labelStyles };
};

const getRadioStyles = (
  size: RadioProps['size'] = 'medium',
  migrationMode: RadioProps['migrationMode'] = 'enhanced',
  error: boolean = false,
  disabled: boolean = false,
  checked: boolean = false,
  costTier: RadioProps['costTier'] = 'free'
) => {
  
  // Size configurations
  const sizeConfig = {
    small: { size: '16px', dotSize: '6px', fontSize: typography.fontSize.sm },
    medium: { size: '20px', dotSize: '8px', fontSize: typography.fontSize.base },
    large: { size: '24px', dotSize: '10px', fontSize: typography.fontSize.lg }
  };
  
  const config = sizeConfig[size];
  
  // Radio styles
  const radioStyles: React.CSSProperties = {
    width: config.size,
    height: config.size,
    borderRadius: '50%',
    border: `2px solid`,
    borderColor: error 
      ? colors.error[500]
      : checked
        ? (costTier === 'premium' ? colors.costTier.premium.primary : colors.primary[500])
        : colors.neutral[300],
    backgroundColor: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: transitions.common.all,
    opacity: disabled ? 0.5 : 1,
    position: 'relative'
  };
  
  // Radio dot styles
  const radioDotStyles: React.CSSProperties = {
    width: config.dotSize,
    height: config.dotSize,
    borderRadius: '50%',
    backgroundColor: costTier === 'premium' ? colors.costTier.premium.primary : colors.primary[500],
    opacity: checked ? 1 : 0,
    transform: checked ? 'scale(1)' : 'scale(0)',
    transition: transitions.common.all
  };
  
  // Label styles
  const labelStyles: React.CSSProperties = {
    fontSize: config.fontSize,
    color: disabled ? colors.neutral[400] : colors.neutral[700],
    lineHeight: typography.lineHeight.normal,
    cursor: disabled ? 'not-allowed' : 'pointer',
    userSelect: 'none'
  };
  
  return { radioStyles, radioDotStyles, labelStyles };
};

// ============================================================================
// CHECKBOX COMPONENT
// ============================================================================

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({
    label,
    description,
    size = 'medium',
    indeterminate = false,
    error = false,
    checkedIcon,
    uncheckedIcon,
    indeterminateIcon,
    migrationMode = 'enhanced',
    costTier = 'free',
    trackingId,
    labelPosition = 'right',
    onCheckedChange,
    disabled = false,
    checked,
    onChange,
    className = '',
    id,
    ...props
  }, ref) => {
    
    const [isChecked, setIsChecked] = useState(checked || false);
    const checkboxRef = useRef<HTMLInputElement>(null);
    const uniqueId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
    
    // Handle indeterminate state
    useEffect(() => {
      if (checkboxRef.current) {
        checkboxRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);
    
    // Handle controlled state
    useEffect(() => {
      if (checked !== undefined) {
        setIsChecked(checked);
      }
    }, [checked]);
    
    // Handle change
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const newChecked = e.target.checked;
      
      if (checked === undefined) {
        setIsChecked(newChecked);
      }
      
      // Analytics tracking
      if (trackingId && typeof window !== 'undefined') {
        const trackingData = {
          component: 'Checkbox',
          action: newChecked ? 'checked' : 'unchecked',
          label,
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
      
      // Screen reader announcement
      screenReaderSupport.announceToScreenReader(
        `${label || 'Checkbox'} ${newChecked ? 'marcado' : 'desmarcado'}`,
        'assertive'
      );
      
      onCheckedChange?.(newChecked);
      onChange?.(e);
    };
    
    // Get computed styles
    const { checkboxStyles, labelStyles } = getCheckboxStyles(
      size,
      migrationMode,
      error,
      disabled,
      isChecked,
      indeterminate,
      costTier
    );
    
    // Get icon to display
    const getIcon = () => {
      if (indeterminate) {
        return indeterminateIcon || '━';
      }
      if (isChecked) {
        return checkedIcon || '✓';
      }
      return uncheckedIcon || '';
    };
    
    const renderContent = () => (
      <>
        {/* Checkbox */}
        <div style={checkboxStyles}>
          {getIcon()}
        </div>
        
        {/* Label and Description */}
        {(label || description) && (
          <div style={{ marginLeft: labelPosition === 'right' ? spacing[2] : 0, marginRight: labelPosition === 'left' ? spacing[2] : 0 }}>
            {label && (
              <label 
                htmlFor={uniqueId}
                style={labelStyles}
              >
                {label}
              </label>
            )}
            {description && (
              <div style={{
                fontSize: typography.fontSize.sm,
                color: disabled ? colors.neutral[400] : colors.neutral[600],
                marginTop: spacing[1],
                lineHeight: typography.lineHeight.normal
              }}>
                {description}
              </div>
            )}
          </div>
        )}
      </>
    );
    
    return (
      <div
        className={`design-system-checkbox ${className}`}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          flexDirection: labelPosition === 'left' ? 'row-reverse' : 'row',
          cursor: disabled ? 'not-allowed' : 'pointer'
        }}
        data-size={size}
        data-migration-mode={migrationMode}
        data-cost-tier={costTier}
        data-tracking-id={trackingId}
        data-error={error}
        data-disabled={disabled}
        onClick={(e) => {
          if (!disabled && e.target === e.currentTarget) {
            checkboxRef.current?.click();
          }
        }}
      >
        {/* Hidden Input */}
        <input
          ref={checkboxRef}
          type="checkbox"
          id={uniqueId}
          checked={isChecked}
          disabled={disabled}
          onChange={handleChange}
          style={{
            position: 'absolute',
            opacity: 0,
            width: 0,
            height: 0,
            margin: 0,
            padding: 0
          }}
          aria-invalid={error}
          aria-describedby={description ? `${uniqueId}-description` : undefined}
          {...props}
        />
        
        {renderContent()}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

// ============================================================================
// RADIO COMPONENT
// ============================================================================

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({
    label,
    description,
    size = 'medium',
    error = false,
    selectedIcon,
    unselectedIcon,
    migrationMode = 'enhanced',
    costTier = 'free',
    trackingId,
    labelPosition = 'right',
    onSelectedChange,
    disabled = false,
    checked,
    onChange,
    className = '',
    id,
    ...props
  }, ref) => {
    
    const [isSelected, setIsSelected] = useState(checked || false);
    const radioRef = useRef<HTMLInputElement>(null);
    const uniqueId = id || `radio-${Math.random().toString(36).substr(2, 9)}`;
    
    // Handle controlled state
    useEffect(() => {
      if (checked !== undefined) {
        setIsSelected(checked);
      }
    }, [checked]);
    
    // Handle change
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const newSelected = e.target.checked;
      
      if (checked === undefined) {
        setIsSelected(newSelected);
      }
      
      // Analytics tracking
      if (trackingId && typeof window !== 'undefined') {
        const trackingData = {
          component: 'Radio',
          action: newSelected ? 'selected' : 'deselected',
          label,
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
      
      // Screen reader announcement
      screenReaderSupport.announceToScreenReader(
        `${label || 'Radio'} ${newSelected ? 'selecionado' : 'desselecionado'}`,
        'assertive'
      );
      
      onSelectedChange?.(newSelected);
      onChange?.(e);
    };
    
    // Get computed styles
    const { radioStyles, radioDotStyles, labelStyles } = getRadioStyles(
      size,
      migrationMode,
      error,
      disabled,
      isSelected,
      costTier
    );
    
    const renderContent = () => (
      <>
        {/* Radio */}
        <div style={radioStyles}>
          {isSelected && (selectedIcon || <div style={radioDotStyles} />)}
          {!isSelected && unselectedIcon}
        </div>
        
        {/* Label and Description */}
        {(label || description) && (
          <div style={{ marginLeft: labelPosition === 'right' ? spacing[2] : 0, marginRight: labelPosition === 'left' ? spacing[2] : 0 }}>
            {label && (
              <label 
                htmlFor={uniqueId}
                style={labelStyles}
              >
                {label}
              </label>
            )}
            {description && (
              <div style={{
                fontSize: typography.fontSize.sm,
                color: disabled ? colors.neutral[400] : colors.neutral[600],
                marginTop: spacing[1],
                lineHeight: typography.lineHeight.normal
              }}>
                {description}
              </div>
            )}
          </div>
        )}
      </>
    );
    
    return (
      <div
        className={`design-system-radio ${className}`}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          flexDirection: labelPosition === 'left' ? 'row-reverse' : 'row',
          cursor: disabled ? 'not-allowed' : 'pointer'
        }}
        data-size={size}
        data-migration-mode={migrationMode}
        data-cost-tier={costTier}
        data-tracking-id={trackingId}
        data-error={error}
        data-disabled={disabled}
        onClick={(e) => {
          if (!disabled && e.target === e.currentTarget) {
            radioRef.current?.click();
          }
        }}
      >
        {/* Hidden Input */}
        <input
          ref={radioRef}
          type="radio"
          id={uniqueId}
          checked={isSelected}
          disabled={disabled}
          onChange={handleChange}
          style={{
            position: 'absolute',
            opacity: 0,
            width: 0,
            height: 0,
            margin: 0,
            padding: 0
          }}
          aria-invalid={error}
          aria-describedby={description ? `${uniqueId}-description` : undefined}
          {...props}
        />
        
        {renderContent()}
      </div>
    );
  }
);

Radio.displayName = 'Radio';

// ============================================================================
// CHECKBOX GROUP COMPONENT
// ============================================================================

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  name,
  label,
  description,
  value,
  defaultValue,
  options,
  layout = 'vertical',
  gridColumns = 2,
  size = 'medium',
  disabled = false,
  error,
  migrationMode = 'enhanced',
  costTier = 'free',
  trackingId,
  onChange
}) => {
  
  const [selectedValues, setSelectedValues] = useState<string[]>(
    value || defaultValue || []
  );
  
  // Handle controlled state
  useEffect(() => {
    if (value !== undefined) {
      setSelectedValues(value);
    }
  }, [value]);
  
  // Handle option change
  const handleOptionChange = (optionValue: string, checked: boolean) => {
    let newValues: string[];
    
    if (checked) {
      newValues = [...selectedValues, optionValue];
    } else {
      newValues = selectedValues.filter(val => val !== optionValue);
    }
    
    if (value === undefined) {
      setSelectedValues(newValues);
    }
    
    onChange?.(newValues);
  };
  
  // Get layout styles
  const getLayoutStyles = (): React.CSSProperties => {
    switch (layout) {
      case 'horizontal':
        return { display: 'flex', flexWrap: 'wrap', gap: spacing[4] };
      case 'grid':
        return { 
          display: 'grid', 
          gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
          gap: spacing[3]
        };
      default:
        return { display: 'flex', flexDirection: 'column', gap: spacing[3] };
    }
  };
  
  return (
    <div 
      className="design-system-checkbox-group"
      data-layout={layout}
      data-size={size}
      data-migration-mode={migrationMode}
      data-cost-tier={costTier}
      data-tracking-id={trackingId}
    >
      {/* Group Label */}
      {label && (
        <div style={{
          fontSize: typography.fontSize.base,
          fontWeight: typography.fontWeight.medium,
          color: colors.neutral[700],
          marginBottom: spacing[2]
        }}>
          {label}
        </div>
      )}
      
      {/* Group Description */}
      {description && (
        <div style={{
          fontSize: typography.fontSize.sm,
          color: colors.neutral[600],
          marginBottom: spacing[3],
          lineHeight: typography.lineHeight.normal
        }}>
          {description}
        </div>
      )}
      
      {/* Options */}
      <div style={getLayoutStyles()} role="group" aria-labelledby={label ? `${name}-label` : undefined}>
        {options.map((option) => (
          <Checkbox
            key={option.value}
            name={name}
            label={option.label}
            description={option.description}
            checked={selectedValues.includes(option.value)}
            disabled={disabled || option.disabled}
            size={size}
            error={!!error}
            migrationMode={migrationMode}
            costTier={costTier}
            trackingId={trackingId}
            onCheckedChange={(checked) => handleOptionChange(option.value, checked)}
          />
        ))}
      </div>
      
      {/* Error Message */}
      {error && (
        <div style={{
          fontSize: typography.fontSize.sm,
          color: colors.error[600],
          fontWeight: typography.fontWeight.medium,
          marginTop: spacing[2]
        }}>
          {error}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// RADIO GROUP COMPONENT
// ============================================================================

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  label,
  description,
  value,
  defaultValue,
  options,
  layout = 'vertical',
  gridColumns = 2,
  size = 'medium',
  disabled = false,
  error,
  migrationMode = 'enhanced',
  costTier = 'free',
  trackingId,
  onChange
}) => {
  
  const [selectedValue, setSelectedValue] = useState<string | undefined>(
    value || defaultValue
  );
  
  // Handle controlled state
  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);
  
  // Handle option change
  const handleOptionChange = (optionValue: string) => {
    if (value === undefined) {
      setSelectedValue(optionValue);
    }
    
    onChange?.(optionValue);
  };
  
  // Get layout styles
  const getLayoutStyles = (): React.CSSProperties => {
    switch (layout) {
      case 'horizontal':
        return { display: 'flex', flexWrap: 'wrap', gap: spacing[4] };
      case 'grid':
        return { 
          display: 'grid', 
          gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
          gap: spacing[3]
        };
      default:
        return { display: 'flex', flexDirection: 'column', gap: spacing[3] };
    }
  };
  
  return (
    <div 
      className="design-system-radio-group"
      data-layout={layout}
      data-size={size}
      data-migration-mode={migrationMode}
      data-cost-tier={costTier}
      data-tracking-id={trackingId}
    >
      {/* Group Label */}
      {label && (
        <div id={`${name}-label`} style={{
          fontSize: typography.fontSize.base,
          fontWeight: typography.fontWeight.medium,
          color: colors.neutral[700],
          marginBottom: spacing[2]
        }}>
          {label}
        </div>
      )}
      
      {/* Group Description */}
      {description && (
        <div style={{
          fontSize: typography.fontSize.sm,
          color: colors.neutral[600],
          marginBottom: spacing[3],
          lineHeight: typography.lineHeight.normal
        }}>
          {description}
        </div>
      )}
      
      {/* Options */}
      <div style={getLayoutStyles()} role="radiogroup" aria-labelledby={label ? `${name}-label` : undefined}>
        {options.map((option) => (
          <Radio
            key={option.value}
            name={name}
            value={option.value}
            label={option.label}
            description={option.description}
            checked={selectedValue === option.value}
            disabled={disabled || option.disabled}
            size={size}
            error={!!error}
            migrationMode={migrationMode}
            costTier={costTier}
            trackingId={trackingId}
            onSelectedChange={(selected) => {
              if (selected) {
                handleOptionChange(option.value);
              }
            }}
          />
        ))}
      </div>
      
      {/* Error Message */}
      {error && (
        <div style={{
          fontSize: typography.fontSize.sm,
          color: colors.error[600],
          fontWeight: typography.fontWeight.medium,
          marginTop: spacing[2]
        }}>
          {error}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// EXPORT ALL CHECKBOX & RADIO COMPONENTS
// ============================================================================

export default Checkbox;

export {
  Radio,
  CheckboxGroup,
  RadioGroup,
  type CheckboxProps,
  type RadioProps,
  type CheckboxGroupProps,
  type RadioGroupProps
}; 