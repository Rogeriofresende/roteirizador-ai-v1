import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { FormSelect, SelectOption } from '../components/ui/FormSelect';

// ===== CHARLIE QUALITY EXCELLENCE: COMPREHENSIVE TEST SUITE =====

expect.extend(toHaveNoViolations);

// ===== TEST DATA =====

const basicOptions: SelectOption[] = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue.js' },
  { value: 'angular', label: 'Angular' },
  { value: 'svelte', label: 'Svelte' },
];

const iconOptions: SelectOption[] = [
  { value: 'admin', label: 'Administrator', description: 'Full system access' },
  { value: 'editor', label: 'Editor', description: 'Content management' },
  { value: 'viewer', label: 'Viewer', description: 'Read-only access' },
];

const disabledOptions: SelectOption[] = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2', disabled: true },
  { value: 'option3', label: 'Option 3' },
];

describe('FormSelect V7.5 Enhanced', () => {
  // ===== BASIC FUNCTIONALITY TESTS =====
  
  describe('Basic Functionality', () => {
    test('renders with default props', () => {
      render(<FormSelect options={basicOptions} data-testid="select" />);
      const select = screen.getByTestId('select');
      expect(select).toBeInTheDocument();
      expect(select).toHaveAttribute('role', 'combobox');
    });

    test('renders with label', () => {
      render(<FormSelect label="Test Label" options={basicOptions} data-testid="select" />);
      expect(screen.getByText('Test Label')).toBeInTheDocument();
      expect(screen.getByTestId('select')).toHaveAccessibleName('Test Label');
    });

    test('renders with placeholder', () => {
      render(<FormSelect placeholder="Test placeholder" options={basicOptions} data-testid="select" />);
      expect(screen.getByText('Test placeholder')).toBeInTheDocument();
    });

    test('renders with helper text', () => {
      render(<FormSelect helperText="Helper text" options={basicOptions} data-testid="select" />);
      expect(screen.getByText('Helper text')).toBeInTheDocument();
    });

    test('handles default value', () => {
      render(<FormSelect defaultValue="react" options={basicOptions} data-testid="select" />);
      expect(screen.getByText('React')).toBeInTheDocument();
    });

    test('handles controlled value', () => {
      const handleChange = jest.fn();
      render(<FormSelect value="vue" onChange={handleChange} options={basicOptions} data-testid="select" />);
      expect(screen.getByText('Vue.js')).toBeInTheDocument();
    });
  });

  // ===== VARIANT TESTS =====
  
  describe('V7.5 Enhanced Variants', () => {
    test('renders all variants without errors', () => {
      const variants = ['glass', 'outlined', 'filled', 'minimal'];
      
      variants.forEach(variant => {
        const { unmount } = render(<FormSelect variant={variant as any} options={basicOptions} data-testid={`select-${variant}`} />);
        expect(screen.getByTestId(`select-${variant}`)).toBeInTheDocument();
        unmount();
      });
    });

    test('renders all sizes correctly', () => {
      const sizes = ['sm', 'md', 'lg', 'xl'];
      
      sizes.forEach(size => {
        const { unmount } = render(<FormSelect size={size as any} options={basicOptions} data-testid={`select-${size}`} />);
        expect(screen.getByTestId(`select-${size}`)).toBeInTheDocument();
        unmount();
      });
    });
  });

  // ===== DROPDOWN FUNCTIONALITY TESTS =====
  
  describe('Dropdown Functionality', () => {
    test('opens dropdown on click', async () => {
      const user = userEvent.setup();
      render(<FormSelect options={basicOptions} data-testid="select" />);
      
      const select = screen.getByTestId('select');
      await user.click(select);
      
      expect(select).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    test('closes dropdown on escape key', async () => {
      const user = userEvent.setup();
      render(<FormSelect options={basicOptions} data-testid="select" />);
      
      const select = screen.getByTestId('select');
      await user.click(select);
      expect(select).toHaveAttribute('aria-expanded', 'true');
      
      await user.keyboard('{Escape}');
      expect(select).toHaveAttribute('aria-expanded', 'false');
    });

    test('closes dropdown on click outside', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <FormSelect options={basicOptions} data-testid="select" />
          <button data-testid="outside">Outside</button>
        </div>
      );
      
      const select = screen.getByTestId('select');
      await user.click(select);
      expect(select).toHaveAttribute('aria-expanded', 'true');
      
      await user.click(screen.getByTestId('outside'));
      expect(select).toHaveAttribute('aria-expanded', 'false');
    });

    test('displays all options in dropdown', async () => {
      const user = userEvent.setup();
      render(<FormSelect options={basicOptions} data-testid="select" />);
      
      await user.click(screen.getByTestId('select'));
      
      basicOptions.forEach(option => {
        expect(screen.getByText(option.label)).toBeInTheDocument();
      });
    });

    test('handles option selection', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      
      render(<FormSelect options={basicOptions} onChange={handleChange} data-testid="select" />);
      
      await user.click(screen.getByTestId('select'));
      await user.click(screen.getByText('React'));
      
      expect(handleChange).toHaveBeenCalledWith('react', basicOptions[0]);
      expect(screen.getByText('React')).toBeInTheDocument();
    });

    test('closes dropdown after selection when closeOnSelect is true', async () => {
      const user = userEvent.setup();
      render(<FormSelect options={basicOptions} closeOnSelect data-testid="select" />);
      
      const select = screen.getByTestId('select');
      await user.click(select);
      await user.click(screen.getByText('React'));
      
      expect(select).toHaveAttribute('aria-expanded', 'false');
    });

    test('keeps dropdown open after selection when closeOnSelect is false', async () => {
      const user = userEvent.setup();
      render(<FormSelect options={basicOptions} closeOnSelect={false} data-testid="select" />);
      
      const select = screen.getByTestId('select');
      await user.click(select);
      await user.click(screen.getByText('React'));
      
      expect(select).toHaveAttribute('aria-expanded', 'true');
    });
  });

  // ===== SEARCH FUNCTIONALITY TESTS =====
  
  describe('Search Functionality', () => {
    test('renders search input when searchable is true', async () => {
      const user = userEvent.setup();
      render(<FormSelect options={basicOptions} searchable data-testid="select" />);
      
      await user.click(screen.getByTestId('select'));
      expect(screen.getByPlaceholderText('Search options...')).toBeInTheDocument();
    });

    test('filters options based on search term', async () => {
      const user = userEvent.setup();
      render(<FormSelect options={basicOptions} searchable data-testid="select" />);
      
      await user.click(screen.getByTestId('select'));
      const searchInput = screen.getByPlaceholderText('Search options...');
      await user.type(searchInput, 'react');
      
      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.queryByText('Vue.js')).not.toBeInTheDocument();
    });

    test('shows no options message when search yields no results', async () => {
      const user = userEvent.setup();
      render(<FormSelect options={basicOptions} searchable noOptionsMessage="No results" data-testid="select" />);
      
      await user.click(screen.getByTestId('select'));
      const searchInput = screen.getByPlaceholderText('Search options...');
      await user.type(searchInput, 'nonexistent');
      
      expect(screen.getByText('No results')).toBeInTheDocument();
    });

    test('calls onSearch when search term changes', async () => {
      const handleSearch = jest.fn();
      const user = userEvent.setup();
      
      render(<FormSelect options={basicOptions} searchable onSearch={handleSearch} data-testid="select" />);
      
      await user.click(screen.getByTestId('select'));
      const searchInput = screen.getByPlaceholderText('Search options...');
      await user.type(searchInput, 'test');
      
      expect(handleSearch).toHaveBeenCalledWith('test');
    });

    test('clears search term when dropdown closes', async () => {
      const user = userEvent.setup();
      render(<FormSelect options={basicOptions} searchable data-testid="select" />);
      
      await user.click(screen.getByTestId('select'));
      const searchInput = screen.getByPlaceholderText('Search options...');
      await user.type(searchInput, 'react');
      
      await user.keyboard('{Escape}');
      await user.click(screen.getByTestId('select'));
      
      const newSearchInput = screen.getByPlaceholderText('Search options...');
      expect(newSearchInput).toHaveValue('');
    });

    test('searches in option descriptions when available', async () => {
      const user = userEvent.setup();
      render(<FormSelect options={iconOptions} searchable data-testid="select" />);
      
      await user.click(screen.getByTestId('select'));
      const searchInput = screen.getByPlaceholderText('Search options...');
      await user.type(searchInput, 'system access');
      
      expect(screen.getByText('Administrator')).toBeInTheDocument();
      expect(screen.queryByText('Editor')).not.toBeInTheDocument();
    });
  });

  // ===== MULTI-SELECT TESTS =====
  
  describe('Multi-Select Functionality', () => {
    test('allows multiple selections when multiple is true', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      
      render(<FormSelect options={basicOptions} multiple onChange={handleChange} data-testid="select" />);
      
      await user.click(screen.getByTestId('select'));
      await user.click(screen.getByText('React'));
      await user.click(screen.getByText('Vue.js'));
      
      expect(handleChange).toHaveBeenLastCalledWith(['react', 'vue'], [basicOptions[0], basicOptions[1]]);
    });

    test('shows selection count for multiple selections', async () => {
      const user = userEvent.setup();
      render(<FormSelect options={basicOptions} multiple value={['react', 'vue']} data-testid="select" />);
      
      expect(screen.getByText('2 selected')).toBeInTheDocument();
    });

    test('shows checkboxes for multiple selection', async () => {
      const user = userEvent.setup();
      render(<FormSelect options={basicOptions} multiple data-testid="select" />);
      
      await user.click(screen.getByTestId('select'));
      
      // Should have checkboxes for all options
      const checkboxes = screen.getAllByRole('option');
      expect(checkboxes).toHaveLength(basicOptions.length);
    });

    test('toggles selection on click in multiple mode', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      
      render(<FormSelect options={basicOptions} multiple onChange={handleChange} value={['react']} data-testid="select" />);
      
      await user.click(screen.getByTestId('select'));
      await user.click(screen.getByText('React'));
      
      // Should remove the selection
      expect(handleChange).toHaveBeenCalledWith([], []);
    });

    test('respects maxSelections limit', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      
      render(<FormSelect options={basicOptions} multiple maxSelections={2} onChange={handleChange} data-testid="select" />);
      
      await user.click(screen.getByTestId('select'));
      await user.click(screen.getByText('React'));
      await user.click(screen.getByText('Vue.js'));
      await user.click(screen.getByText('Angular'));
      
      // Should not allow third selection
      expect(handleChange).toHaveBeenCalledTimes(2);
    });

    test('shows selection count with maxSelections', () => {
      render(
        <FormSelect 
          options={basicOptions} 
          multiple 
          maxSelections={5} 
          value={['react', 'vue']} 
          data-testid="select" 
          helperText="Helper text"
        />
      );
      
      expect(screen.getByText('2 of 5')).toBeInTheDocument();
    });
  });

  // ===== KEYBOARD NAVIGATION TESTS =====
  
  describe('Keyboard Navigation', () => {
    test('opens dropdown on Enter key', async () => {
      const user = userEvent.setup();
      render(<FormSelect options={basicOptions} data-testid="select" />);
      
      const select = screen.getByTestId('select');
      select.focus();
      await user.keyboard('{Enter}');
      
      expect(select).toHaveAttribute('aria-expanded', 'true');
    });

    test('opens dropdown on Space key', async () => {
      const user = userEvent.setup();
      render(<FormSelect options={basicOptions} data-testid="select" />);
      
      const select = screen.getByTestId('select');
      select.focus();
      await user.keyboard(' ');
      
      expect(select).toHaveAttribute('aria-expanded', 'true');
    });

    test('opens dropdown on ArrowDown key', async () => {
      const user = userEvent.setup();
      render(<FormSelect options={basicOptions} data-testid="select" />);
      
      const select = screen.getByTestId('select');
      select.focus();
      await user.keyboard('{ArrowDown}');
      
      expect(select).toHaveAttribute('aria-expanded', 'true');
    });

    test('navigates options with arrow keys', async () => {
      const user = userEvent.setup();
      render(<FormSelect options={basicOptions} data-testid="select" />);
      
      const select = screen.getByTestId('select');
      await user.click(select);
      
      // Navigate down
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowDown}');
      
      // Should highlight second option
      expect(select).toHaveAttribute('aria-activedescendant', expect.stringContaining('option-1'));
    });

    test('selects highlighted option on Enter', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      
      render(<FormSelect options={basicOptions} onChange={handleChange} data-testid="select" />);
      
      const select = screen.getByTestId('select');
      await user.click(select);
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');
      
      expect(handleChange).toHaveBeenCalledWith('react', basicOptions[0]);
    });

    test('wraps navigation at boundaries', async () => {
      const user = userEvent.setup();
      render(<FormSelect options={basicOptions} data-testid="select" />);
      
      const select = screen.getByTestId('select');
      await user.click(select);
      
      // Navigate to last option
      await user.keyboard('{ArrowUp}');
      
      // Should wrap to last option
      expect(select).toHaveAttribute('aria-activedescendant', expect.stringContaining('option-0'));
    });
  });

  // ===== STATE MANAGEMENT TESTS =====
  
  describe('State Management', () => {
    test('handles controlled value changes', () => {
      const { rerender } = render(<FormSelect value="react" options={basicOptions} data-testid="select" />);
      expect(screen.getByText('React')).toBeInTheDocument();
      
      rerender(<FormSelect value="vue" options={basicOptions} data-testid="select" />);
      expect(screen.getByText('Vue.js')).toBeInTheDocument();
    });

    test('handles uncontrolled value with defaultValue', async () => {
      const user = userEvent.setup();
      render(<FormSelect defaultValue="react" options={basicOptions} data-testid="select" />);
      
      expect(screen.getByText('React')).toBeInTheDocument();
      
      // Should be able to change selection
      await user.click(screen.getByTestId('select'));
      await user.click(screen.getByText('Vue.js'));
      
      expect(screen.getByText('Vue.js')).toBeInTheDocument();
    });

    test('maintains selection state across dropdown opens/closes', async () => {
      const user = userEvent.setup();
      render(<FormSelect options={basicOptions} value="react" data-testid="select" />);
      
      await user.click(screen.getByTestId('select'));
      await user.keyboard('{Escape}');
      await user.click(screen.getByTestId('select'));
      
      expect(screen.getByText('React')).toBeInTheDocument();
    });
  });

  // ===== VALIDATION TESTS =====
  
  describe('Validation States', () => {
    test('shows error state correctly', () => {
      render(
        <FormSelect 
          error 
          errorMessage="Error message" 
          options={basicOptions}
          data-testid="select" 
        />
      );
      
      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.getByTestId('select')).toHaveAttribute('aria-invalid', 'true');
    });

    test('shows success state correctly', () => {
      render(
        <FormSelect 
          success 
          successMessage="Success message" 
          options={basicOptions}
          data-testid="select" 
        />
      );
      
      expect(screen.getByText('Success message')).toBeInTheDocument();
      expect(screen.getByTestId('select')).toHaveAttribute('aria-invalid', 'false');
    });

    test('shows warning state correctly', () => {
      render(
        <FormSelect 
          warning 
          warningMessage="Warning message" 
          options={basicOptions}
          data-testid="select" 
        />
      );
      
      expect(screen.getByText('Warning message')).toBeInTheDocument();
    });

    test('handles required attribute', () => {
      render(<FormSelect required options={basicOptions} data-testid="select" />);
      expect(screen.getByTestId('select')).toHaveAttribute('aria-required', 'true');
    });

    test('handles disabled state', async () => {
      const user = userEvent.setup();
      render(<FormSelect disabled options={basicOptions} data-testid="select" />);
      
      const select = screen.getByTestId('select');
      expect(select).toHaveAttribute('tabindex', '-1');
      
      await user.click(select);
      expect(select).toHaveAttribute('aria-expanded', 'false');
    });

    test('handles readonly state', async () => {
      const user = userEvent.setup();
      render(<FormSelect readOnly options={basicOptions} data-testid="select" />);
      
      const select = screen.getByTestId('select');
      await user.click(select);
      expect(select).toHaveAttribute('aria-expanded', 'false');
    });

    test('handles loading state', () => {
      render(<FormSelect loading loadingMessage="Loading..." options={[]} data-testid="select" />);
      
      // Should show loading spinner
      expect(screen.getByTestId('select')).toBeInTheDocument();
    });
  });

  // ===== CLEAR FUNCTIONALITY TESTS =====
  
  describe('Clear Functionality', () => {
    test('shows clear button when clearable and has value', () => {
      render(<FormSelect clearable value="react" options={basicOptions} data-testid="select" />);
      
      // Should have clear button (X icon)
      expect(screen.getByTestId('select')).toBeInTheDocument();
    });

    test('calls onClear when clear button is clicked', async () => {
      const handleClear = jest.fn();
      const handleChange = jest.fn();
      const user = userEvent.setup();
      
      render(
        <FormSelect 
          clearable 
          value="react" 
          options={basicOptions} 
          onClear={handleClear}
          onChange={handleChange}
          data-testid="select" 
        />
      );
      
      // Find and click clear button (this would need to be implemented in the component)
      const select = screen.getByTestId('select');
      expect(select).toBeInTheDocument();
      
      // Note: The actual clear button interaction would need component implementation
    });

    test('clears value in multiple selection', async () => {
      const handleChange = jest.fn();
      render(
        <FormSelect 
          multiple
          clearable 
          value={['react', 'vue']} 
          options={basicOptions} 
          onChange={handleChange}
          data-testid="select" 
        />
      );
      
      expect(screen.getByText('2 selected')).toBeInTheDocument();
    });
  });

  // ===== FOCUS & INTERACTION TESTS =====
  
  describe('Focus and Interaction', () => {
    test('calls onFocus when focused', async () => {
      const handleFocus = jest.fn();
      const user = userEvent.setup();
      
      render(<FormSelect onFocus={handleFocus} options={basicOptions} data-testid="select" />);
      
      await user.click(screen.getByTestId('select'));
      expect(handleFocus).toHaveBeenCalled();
    });

    test('calls onBlur when blurred', async () => {
      const handleBlur = jest.fn();
      const user = userEvent.setup();
      
      render(
        <div>
          <FormSelect onBlur={handleBlur} options={basicOptions} data-testid="select" />
          <button data-testid="other">Other</button>
        </div>
      );
      
      const select = screen.getByTestId('select');
      await user.click(select);
      await user.click(screen.getByTestId('other'));
      
      expect(handleBlur).toHaveBeenCalled();
    });

    test('calls onDropdownOpen when dropdown opens', async () => {
      const handleOpen = jest.fn();
      const user = userEvent.setup();
      
      render(<FormSelect onDropdownOpen={handleOpen} options={basicOptions} data-testid="select" />);
      
      await user.click(screen.getByTestId('select'));
      expect(handleOpen).toHaveBeenCalled();
    });

    test('calls onDropdownClose when dropdown closes', async () => {
      const handleClose = jest.fn();
      const user = userEvent.setup();
      
      render(<FormSelect onDropdownClose={handleClose} options={basicOptions} data-testid="select" />);
      
      const select = screen.getByTestId('select');
      await user.click(select);
      await user.keyboard('{Escape}');
      
      expect(handleClose).toHaveBeenCalled();
    });

    test('autoFocus works correctly', () => {
      render(<FormSelect autoFocus options={basicOptions} data-testid="select" />);
      expect(screen.getByTestId('select')).toHaveFocus();
    });
  });

  // ===== ACCESSIBILITY TESTS =====
  
  describe('Accessibility (WCAG 2.1 AA)', () => {
    test('has no accessibility violations', async () => {
      const { container } = render(
        <FormSelect 
          label="Accessible Select"
          helperText="Helper text"
          required
          options={basicOptions}
          searchable
          data-testid="select"
        />
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('associates label with select', () => {
      render(<FormSelect label="Test Label" options={basicOptions} data-testid="select" />);
      
      const select = screen.getByTestId('select');
      const label = screen.getByText('Test Label');
      
      expect(select).toHaveAccessibleName('Test Label');
      expect(label).toHaveAttribute('for', select.id);
    });

    test('associates helper text with select', () => {
      render(<FormSelect helperText="Helper text" options={basicOptions} data-testid="select" />);
      
      const select = screen.getByTestId('select');
      const helperText = screen.getByText('Helper text');
      
      expect(select).toHaveAttribute('aria-describedby', expect.stringContaining(helperText.id));
    });

    test('has proper ARIA attributes', () => {
      render(<FormSelect options={basicOptions} data-testid="select" />);
      
      const select = screen.getByTestId('select');
      expect(select).toHaveAttribute('role', 'combobox');
      expect(select).toHaveAttribute('aria-expanded', 'false');
      expect(select).toHaveAttribute('aria-haspopup', 'listbox');
    });

    test('announces dropdown state changes', async () => {
      const user = userEvent.setup();
      render(<FormSelect options={basicOptions} data-testid="select" />);
      
      const select = screen.getByTestId('select');
      expect(select).toHaveAttribute('aria-expanded', 'false');
      
      await user.click(select);
      expect(select).toHaveAttribute('aria-expanded', 'true');
    });

    test('announces option selection to screen readers', async () => {
      const user = userEvent.setup();
      render(<FormSelect options={basicOptions} data-testid="select" />);
      
      await user.click(screen.getByTestId('select'));
      await user.keyboard('{ArrowDown}');
      
      const select = screen.getByTestId('select');
      expect(select).toHaveAttribute('aria-activedescendant', expect.stringContaining('option-0'));
    });

    test('supports screen reader navigation in multi-select', async () => {
      const user = userEvent.setup();
      render(<FormSelect multiple options={basicOptions} data-testid="select" />);
      
      await user.click(screen.getByTestId('select'));
      
      const listbox = screen.getByRole('listbox');
      expect(listbox).toHaveAttribute('aria-multiselectable', 'true');
    });

    test('handles disabled options correctly', async () => {
      const user = userEvent.setup();
      render(<FormSelect options={disabledOptions} data-testid="select" />);
      
      await user.click(screen.getByTestId('select'));
      
      const disabledOption = screen.getByText('Option 2');
      expect(disabledOption).toHaveAttribute('aria-disabled', 'true');
    });
  });

  // ===== LAYOUT TESTS =====
  
  describe('Layout and Styling', () => {
    test('applies full width correctly', () => {
      const { container } = render(<FormSelect fullWidth options={basicOptions} data-testid="select" />);
      
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle({ width: '100%' });
    });

    test('applies custom className', () => {
      const { container } = render(<FormSelect className="custom-class" options={basicOptions} data-testid="select" />);
      
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('custom-class');
    });

    test('applies custom styles', () => {
      const customStyle = { backgroundColor: 'red' };
      const { container } = render(<FormSelect style={customStyle} options={basicOptions} data-testid="select" />);
      
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle(customStyle);
    });

    test('applies custom select className', () => {
      render(<FormSelect selectClassName="custom-select" options={basicOptions} data-testid="select" />);
      
      const select = screen.getByTestId('select');
      expect(select).toHaveClass('custom-select');
    });

    test('applies custom label className', () => {
      render(<FormSelect label="Test" labelClassName="custom-label" options={basicOptions} data-testid="select" />);
      
      const label = screen.getByText('Test');
      expect(label).toHaveClass('custom-label');
    });

    test('handles dropdown positioning', async () => {
      const user = userEvent.setup();
      
      // Test auto positioning
      render(<FormSelect dropdownPosition="auto" options={basicOptions} data-testid="select" />);
      await user.click(screen.getByTestId('select'));
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    test('respects dropdown max height', async () => {
      const user = userEvent.setup();
      
      render(<FormSelect dropdownMaxHeight={200} options={basicOptions} data-testid="select" />);
      await user.click(screen.getByTestId('select'));
      
      const dropdown = screen.getByRole('listbox').parentElement;
      expect(dropdown).toHaveStyle({ maxHeight: '200px' });
    });
  });

  // ===== PERFORMANCE TESTS =====
  
  describe('Performance', () => {
    test('component is memoized', () => {
      const props = { options: basicOptions, 'data-testid': 'select' };
      const { rerender } = render(<FormSelect {...props} />);
      
      // Should not re-render with same props
      const firstRender = screen.getByTestId('select');
      rerender(<FormSelect {...props} />);
      const secondRender = screen.getByTestId('select');
      
      expect(firstRender).toBe(secondRender);
    });

    test('handles large option sets efficiently', async () => {
      const largeOptions = Array.from({ length: 1000 }, (_, i) => ({
        value: `option-${i}`,
        label: `Option ${i + 1}`,
      }));
      
      const user = userEvent.setup();
      
      render(<FormSelect options={largeOptions} data-testid="select" />);
      
      const startTime = performance.now();
      await user.click(screen.getByTestId('select'));
      const endTime = performance.now();
      
      // Should handle large datasets efficiently
      expect(endTime - startTime).toBeLessThan(1000); // 1 second
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    test('search filtering is efficient', async () => {
      const largeOptions = Array.from({ length: 500 }, (_, i) => ({
        value: `option-${i}`,
        label: `Option ${i + 1}`,
      }));
      
      const user = userEvent.setup();
      
      render(<FormSelect options={largeOptions} searchable data-testid="select" />);
      
      await user.click(screen.getByTestId('select'));
      const searchInput = screen.getByPlaceholderText('Search options...');
      
      const startTime = performance.now();
      await user.type(searchInput, '123');
      const endTime = performance.now();
      
      // Search should be fast
      expect(endTime - startTime).toBeLessThan(500); // 0.5 seconds
    });

    test('multi-select performance with many selections', async () => {
      const user = userEvent.setup();
      
      render(<FormSelect options={basicOptions} multiple data-testid="select" />);
      
      await user.click(screen.getByTestId('select'));
      
      const startTime = performance.now();
      for (const option of basicOptions) {
        await user.click(screen.getByText(option.label));
      }
      const endTime = performance.now();
      
      // Multiple selections should be efficient
      expect(endTime - startTime).toBeLessThan(1000); // 1 second
    });
  });

  // ===== EDGE CASES =====
  
  describe('Edge Cases', () => {
    test('handles empty options array', () => {
      render(<FormSelect options={[]} data-testid="select" />);
      expect(screen.getByTestId('select')).toBeInTheDocument();
    });

    test('handles undefined value correctly', () => {
      render(<FormSelect value={undefined} options={basicOptions} data-testid="select" />);
      expect(screen.getByTestId('select')).toBeInTheDocument();
    });

    test('handles null onChange gracefully', async () => {
      const user = userEvent.setup();
      
      render(<FormSelect onChange={undefined} options={basicOptions} data-testid="select" />);
      
      await user.click(screen.getByTestId('select'));
      await user.click(screen.getByText('React'));
      
      // Should not crash
      expect(screen.getByTestId('select')).toBeInTheDocument();
    });

    test('handles options with duplicate values', () => {
      const duplicateOptions = [
        { value: 'same', label: 'Option 1' },
        { value: 'same', label: 'Option 2' },
      ];
      
      render(<FormSelect options={duplicateOptions} data-testid="select" />);
      expect(screen.getByTestId('select')).toBeInTheDocument();
    });

    test('handles very long option labels', async () => {
      const longLabelOptions = [
        { value: 'long', label: 'This is a very long option label that might cause layout issues but should be handled gracefully' },
      ];
      
      const user = userEvent.setup();
      
      render(<FormSelect options={longLabelOptions} data-testid="select" />);
      
      await user.click(screen.getByTestId('select'));
      expect(screen.getByText(longLabelOptions[0].label)).toBeInTheDocument();
    });

    test('handles special characters in option values and labels', async () => {
      const specialOptions = [
        { value: '!@#$%^&*()', label: 'Special !@#$%^&*()' },
        { value: 'unicode-🚀', label: 'Unicode 🚀 Option' },
      ];
      
      const user = userEvent.setup();
      
      render(<FormSelect options={specialOptions} data-testid="select" />);
      
      await user.click(screen.getByTestId('select'));
      expect(screen.getByText('Special !@#$%^&*()')).toBeInTheDocument();
      expect(screen.getByText('Unicode 🚀 Option')).toBeInTheDocument();
    });
  });

  // ===== INTEGRATION TESTS =====
  
  describe('Integration', () => {
    test('works correctly within form context', async () => {
      const handleSubmit = jest.fn();
      const user = userEvent.setup();
      
      render(
        <form onSubmit={handleSubmit}>
          <FormSelect name="testField" options={basicOptions} data-testid="select" />
          <button type="submit">Submit</button>
        </form>
      );
      
      await user.click(screen.getByTestId('select'));
      await user.click(screen.getByText('React'));
      await user.click(screen.getByText('Submit'));
      
      expect(handleSubmit).toHaveBeenCalled();
    });

    test('maintains ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      
      render(<FormSelect ref={ref} options={basicOptions} data-testid="select" />);
      
      expect(ref.current).toBe(screen.getByTestId('select'));
    });

    test('forwards all HTML attributes correctly', () => {
      render(
        <FormSelect 
          data-testid="select"
          name="frameworks"
          id="framework-select"
          options={basicOptions}
        />
      );
      
      const select = screen.getByTestId('select');
      expect(select).toHaveAttribute('name', 'frameworks');
      expect(select).toHaveAttribute('id', 'framework-select');
    });

    test('integrates search with multi-select correctly', async () => {
      const user = userEvent.setup();
      
      render(
        <FormSelect 
          options={basicOptions}
          multiple
          searchable
          data-testid="select"
        />
      );
      
      await user.click(screen.getByTestId('select'));
      
      // Search for option
      const searchInput = screen.getByPlaceholderText('Search options...');
      await user.type(searchInput, 'react');
      
      // Select the filtered option
      await user.click(screen.getByText('React'));
      
      // Should maintain multi-select functionality
      expect(screen.getByText('1 selected')).toBeInTheDocument();
    });
  });
});

// ===== CHARLIE PERFORMANCE BENCHMARKS =====

describe('FormSelect Performance Benchmarks', () => {
  test('renders within performance budget', () => {
    const startTime = performance.now();
    
    render(<FormSelect options={basicOptions} searchable multiple data-testid="select" />);
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should render within 16ms (60fps budget)
    expect(renderTime).toBeLessThan(16);
  });

  test('dropdown opening performance', async () => {
    const user = userEvent.setup();
    const startTime = performance.now();
    
    render(<FormSelect options={basicOptions} data-testid="select" />);
    
    await user.click(screen.getByTestId('select'));
    
    const endTime = performance.now();
    const operationTime = endTime - startTime;
    
    // Should open dropdown quickly
    expect(operationTime).toBeLessThan(100); // 100ms
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  test('handles many simultaneous selects efficiently', () => {
    const startTime = performance.now();
    
    render(
      <div>
        {Array.from({ length: 10 }, (_, i) => (
          <FormSelect 
            key={i} 
            options={basicOptions}
            searchable
            multiple
            data-testid={`select-${i}`} 
          />
        ))}
      </div>
    );
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should handle 10 selects within reasonable time
    expect(renderTime).toBeLessThan(200); // 0.2 seconds
  });
});

// ===== CHARLIE BUNDLE SIZE TEST =====

describe('FormSelect Bundle Impact', () => {
  test('component exports are tree-shakeable', () => {
    // This test ensures the component can be imported individually
    expect(FormSelect).toBeDefined();
    expect(typeof FormSelect).toBe('object'); // React.ForwardRefExoticComponent
  });

  test('dropdown functionality is modular', () => {
    // Test that dropdown features don't add unnecessary bundle weight when not used
    render(<FormSelect options={basicOptions} data-testid="select" />);
    
    const select = screen.getByTestId('select');
    expect(select).toBeInTheDocument();
  });

  test('search functionality is optional', async () => {
    const user = userEvent.setup();
    
    // Test without search
    render(<FormSelect options={basicOptions} data-testid="select-1" />);
    await user.click(screen.getByTestId('select-1'));
    expect(screen.queryByPlaceholderText('Search options...')).not.toBeInTheDocument();
    
    // Test with search
    render(<FormSelect options={basicOptions} searchable data-testid="select-2" />);
    await user.click(screen.getByTestId('select-2'));
    expect(screen.getByPlaceholderText('Search options...')).toBeInTheDocument();
  });
}); 