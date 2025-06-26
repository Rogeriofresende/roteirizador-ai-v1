import React from 'react';
import { SelectOption, SelectFieldOptions } from '../../types';

interface SelectFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectFieldOptions;
  disabled?: boolean;
}

// Função helper para normalizar opções
const normalizeOption = (option: string | SelectOption): SelectOption => {
  return typeof option === 'string' 
    ? { value: option, label: option }
    : option;
};

const SelectField: React.FC<SelectFieldProps> = ({ id, label, value, onChange, options, disabled }) => {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label} <span className="text-red-500">*</span>
      </label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      >
        <option value="" disabled>Selecione uma opção...</option>
        {options.map((option) => {
          const normalizedOption = normalizeOption(option);
          return (
            <option key={normalizedOption.value} value={normalizedOption.value}>
              {normalizedOption.label}
            </option>
          );
        })}
      </select>
    </div>
  );
};

export default SelectField; 