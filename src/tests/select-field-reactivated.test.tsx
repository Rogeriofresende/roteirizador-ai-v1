import React from 'react';
import { render, screen } from '@testing-library/react';
import SelectField from '../components/form/SelectField';

describe('SelectField - Reactivated Test', () => {
  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' }
  ];
  
  it('renders with label', () => {
    render(<SelectField id="test-select" label="Test Select" value="" onChange={() => {}} options={options} />);
    const label = screen.getByText('Test Select');
    expect(label).toBeDefined();
  });
  
  it('renders select element', () => {
    render(<SelectField id="select" label="Select" value="" onChange={() => {}} options={options} />);
    const selectElement = screen.getByRole('combobox');
    expect(selectElement).toBeDefined();
  });
  
  it('can be disabled', () => {
    render(<SelectField id="disabled-select" label="Disabled Select" value="" onChange={() => {}} options={options} disabled />);
    const select = screen.getByRole('combobox');
    expect((select as HTMLSelectElement).disabled).toBe(true);
  });
  
  it('renders default option', () => {
    render(<SelectField id="default" label="Default" value="" onChange={() => {}} options={options} />);
    const defaultOption = screen.getByText('Selecione uma opção...');
    expect(defaultOption).toBeDefined();
  });
}); 