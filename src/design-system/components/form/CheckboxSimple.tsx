/**
 * 🎨 Checkbox Component - Simple Version for Banco de Ideias
 * 
 * Simplified checkbox component for immediate use in Banco de Ideias
 * Part of: WEEK 1 - Banco de Ideias Implementation
 */

import React, { forwardRef, useState, useEffect, ChangeEvent } from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CheckboxSimpleProps {
  label?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const CheckboxSimple = forwardRef<HTMLInputElement, CheckboxSimpleProps>(
  ({ label, checked = false, onCheckedChange, disabled = false, className = '' }, ref) => {
    const [isChecked, setIsChecked] = useState(checked);
    
    useEffect(() => {
      setIsChecked(checked);
    }, [checked]);
    
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const newChecked = e.target.checked;
      setIsChecked(newChecked);
      onCheckedChange?.(newChecked);
    };
    
    return (
      <label className={`checkbox-simple ${className}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: disabled ? 'not-allowed' : 'pointer' }}>
        <input
          ref={ref}
          type="checkbox"
          checked={isChecked}
          onChange={handleChange}
          disabled={disabled}
          style={{ margin: 0 }}
        />
        {label && <span style={{ color: disabled ? '#999' : '#333' }}>{label}</span>}
      </label>
    );
  }
);

CheckboxSimple.displayName = 'CheckboxSimple';

export default CheckboxSimple; 