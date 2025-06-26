import React from 'react';
import { SelectOption, SelectFieldOptions } from '../../types';
import { OTHER_KEY } from '../../constants';

interface HybridSelectFieldProps {
  id: string;
  label: string;
  selectValue: string;
  onSelectChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  textValue: string;
  onTextChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  options: SelectFieldOptions;
  disabled?: boolean;
}

// Função helper para normalizar opções
const normalizeOption = (option: string | SelectOption): SelectOption => {
  return typeof option === 'string' 
    ? { value: option, label: option }
    : option;
};

const HybridSelectField: React.FC<HybridSelectFieldProps> = ({
  id,
  label,
  selectValue,
  onSelectChange,
  textValue,
  onTextChange,
  options,
  disabled,
}) => {
  const showTextInput = selectValue === OTHER_KEY;

  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label} <span className="text-red-500">*</span>
      </label>
      <select
        id={id}
        value={selectValue}
        onChange={onSelectChange}
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
      {showTextInput && (
        <input
          type="text"
          value={textValue}
          onChange={onTextChange}
          placeholder="Especifique o seu"
          disabled={disabled}
          className="w-full px-3 py-2 mt-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      )}
    </div>
  );
};

export default HybridSelectField; 