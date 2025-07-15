import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import InputField from '../components/form/InputField';

describe('InputField - Reactivated Test', () => {
  it('renders with label', () => {
    render(<InputField id="test-input-1752598066" label="Test Label" value="" onChange={() => {}} />);
    const label = screen.getByText('Test Label');
    expect(label).toBeDefined();
  });
  
  it('accepts user input', () => {
    const handleChange = jest.fn();
    render(<InputField id="input" label="Input" value="" onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test input' } });
    
    expect(handleChange).toHaveBeenCalled();
  });
  
  it('can be disabled', () => {
    render(<InputField id="disabled" label="Disabled" value="" onChange={() => {}} disabled />);
    const input = screen.getByRole('textbox');
    expect((input as HTMLInputElement).disabled).toBe(true);
  });
  
  it('shows placeholder', () => {
    render(<InputField id="placeholder" label="With Placeholder" value="" onChange={() => {}} placeholder="Enter text here" />);
    const input = screen.getByPlaceholderText('Enter text here');
    expect(input).toBeDefined();
  });
}); 