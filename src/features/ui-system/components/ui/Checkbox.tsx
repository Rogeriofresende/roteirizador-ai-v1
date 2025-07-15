/**
 * ☑️ CHECKBOX COMPONENT
 * Simple checkbox implementation
 */

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CheckboxProps {
  checked?: boolean;
  indeterminate?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked = false,
  indeterminate = false,
  onCheckedChange,
  disabled = false,
  className,
  id
}) => {
  const handleChange = () => {
    if (!disabled && onCheckedChange) {
      onCheckedChange(!checked);
    }
  };

  return (
    <div 
      className={cn(
        "inline-flex items-center justify-center w-4 h-4 border border-gray-300 rounded cursor-pointer transition-colors",
        checked && "bg-blue-600 border-blue-600",
        indeterminate && "bg-blue-600 border-blue-600",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={handleChange}
      id={id}
    >
      {checked && !indeterminate && (
        <Check className="w-3 h-3 text-white" />
      )}
      {indeterminate && (
        <div className="w-2 h-0.5 bg-white rounded" />
      )}
    </div>
  );
};

export default Checkbox;
