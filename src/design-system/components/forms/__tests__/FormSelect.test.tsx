import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { FormSelect, FormSelectRef, FormSelectOption } from '../FormSelect';
import '@testing-library/jest-dom';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock react-window for testing
jest.mock('react-window', () => ({
  FixedSizeList: ({ children, itemData, itemCount }: any) => (
    <div data-testid="virtual-list">
      {Array.from({ length: Math.min(itemCount, 10) }, (_, index) => 
        children({ index, data: itemData, style: {} })
      )}
    </div>
  )
}));

// ==========================================
// 🟡 IA CHARLIE - QUALITY EXCELLENCE TESTS
// ==========================================

describe('FormSelect V7.5 Enhanced', () => {
  const user = userEvent.setup();
  
  // Sample test data
  const simpleOptions: FormSelectOption[] = [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry' },
    { value: 'date', label: 'Date' }
  ];
  
  const optionsWithIcons: FormSelectOption[] = [
    { value: 'user1', label: 'John Doe', icon: <span>👤</span>, description: 'Software Engineer' },
    { value: 'user2', label: 'Jane Smith', icon: <span>👤</span>, description: 'Product Manager' },
    { value: 'user3', label: 'Bob Johnson', icon: <span>👤</span>, description: 'UI/UX Designer', disabled: true }
  ];
  
  const largeOptionsList: FormSelectOption[] = Array.from({ length: 200 }, (_, i) => ({
    value: `option-${i}`,
    label: `Option ${i + 1}`,
    description: i % 5 === 0 ? `Description ${i + 1}` : undefined
  }));
  
  // ==========================================
  // BASIC RENDERING TESTS
  // ==========================================
  
  describe('Basic Rendering', () => {
    test('renders without crashing', () => {
      render(<FormSelect options={simpleOptions} />);
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
    
    test('renders with label', () => {
      render(<FormSelect options={simpleOptions} label="Select Fruit" />);
      expect(screen.getByLabelText('Select Fruit')).toBeInTheDocument();
    });
    
    test('renders with placeholder', () => {
      render(<FormSelect options={simpleOptions} placeholder="Choose an option" />);
      expect(screen.getByText('Choose an option')).toBeInTheDocument();
    });
    
    test('renders with helper text', () => {
      render(<FormSelect options={simpleOptions} helperText="Select your preferred option" />);
      expect(screen.getByText('Select your preferred option')).toBeInTheDocument();
    });
    
    test('renders with error text', () => {
      render(<FormSelect options={simpleOptions} errorText="This field is required" />);
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });
  });
  
  // ==========================================
  // VARIANT TESTS
  // ==========================================
  
  describe('Variants', () => {
    test('renders glass variant with correct classes', () => {
      const { container } = render(<FormSelect options={simpleOptions} variant="glass" />);
      expect(container.querySelector('.form-select-container--glass')).toBeInTheDocument();
    });
    
    test('renders outlined variant with correct classes', () => {
      const { container } = render(<FormSelect options={simpleOptions} variant="outlined" />);
      expect(container.querySelector('.form-select-container--outlined')).toBeInTheDocument();
    });
    
    test('renders filled variant with correct classes', () => {
      const { container } = render(<FormSelect options={simpleOptions} variant="filled" />);
      expect(container.querySelector('.form-select-container--filled')).toBeInTheDocument();
    });
    
    test('renders minimal variant with correct classes', () => {
      const { container } = render(<FormSelect options={simpleOptions} variant="minimal" />);
      expect(container.querySelector('.form-select-container--minimal')).toBeInTheDocument();
    });
    
    test('renders floating variant with correct classes', () => {
      const { container } = render(<FormSelect options={simpleOptions} variant="floating" />);
      expect(container.querySelector('.form-select-container--floating')).toBeInTheDocument();
    });
  });
  
  // ==========================================
  // SIZE TESTS
  // ==========================================
  
  describe('Sizes', () => {
    test('renders small size with correct classes', () => {
      const { container } = render(<FormSelect options={simpleOptions} size="sm" />);
      expect(container.querySelector('.form-select-container--sm')).toBeInTheDocument();
    });
    
    test('renders medium size with correct classes', () => {
      const { container } = render(<FormSelect options={simpleOptions} size="md" />);
      expect(container.querySelector('.form-select-container--md')).toBeInTheDocument();
    });
    
    test('renders large size with correct classes', () => {
      const { container } = render(<FormSelect options={simpleOptions} size="lg" />);
      expect(container.querySelector('.form-select-container--lg')).toBeInTheDocument();
    });
  });
  
  // ==========================================
  // DROPDOWN INTERACTION TESTS
  // ==========================================
  
  describe('Dropdown Interactions', () => {
    test('opens dropdown on click', async () => {
      render(<FormSelect options={simpleOptions} />);
      
      const trigger = screen.getByRole('combobox');
      await user.click(trigger);
      
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
    
    test('closes dropdown on outside click', async () => {
      render(
        <div>
          <FormSelect options={simpleOptions} />
          <button>Outside button</button>
        </div>
      );
      
      const trigger = screen.getByRole('combobox');
      await user.click(trigger);
      
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      
      await user.click(screen.getByText('Outside button'));
      
      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-expanded', 'false');
      });
    });
    
    test('displays all options when opened', async () => {
      render(<FormSelect options={simpleOptions} />);
      
      await user.click(screen.getByRole('combobox'));
      
      for (const option of simpleOptions) {
        expect(screen.getByText(option.label)).toBeInTheDocument();
      }
    });
    
    test('selects option on click', async () => {
      const mockOnChange = jest.fn();
      render(
        <FormSelect 
          options={simpleOptions} 
          eventHandlers={{ onChange: mockOnChange }}
        />
      );
      
      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByText('Apple'));
      
      expect(mockOnChange).toHaveBeenCalledWith('apple', expect.any(Object));
    });
    
    test('closes dropdown after single selection', async () => {
      render(<FormSelect options={simpleOptions} />);
      
      const trigger = screen.getByRole('combobox');
      await user.click(trigger);
      await user.click(screen.getByText('Apple'));
      
      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-expanded', 'false');
      });
    });
  });
  
  // ==========================================
  // SEARCH FUNCTIONALITY TESTS
  // ==========================================
  
  describe('Search Functionality', () => {
    test('shows search input when search is enabled', async () => {
      render(<FormSelect options={simpleOptions} search={{ enabled: true }} />);
      
      await user.click(screen.getByRole('combobox'));
      
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
    
    test('filters options based on search input', async () => {
      render(<FormSelect options={simpleOptions} search={{ enabled: true }} />);
      
      await user.click(screen.getByRole('combobox'));
      const searchInput = screen.getByRole('textbox');
      
      await user.type(searchInput, 'app');
      
      expect(screen.getByText('Apple')).toBeInTheDocument();
      expect(screen.queryByText('Banana')).not.toBeInTheDocument();
    });
    
    test('shows empty state when no options match search', async () => {
      render(<FormSelect options={simpleOptions} search={{ enabled: true }} />);
      
      await user.click(screen.getByRole('combobox'));
      const searchInput = screen.getByRole('textbox');
      
      await user.type(searchInput, 'xyz');
      
      expect(screen.getByText('No options found')).toBeInTheDocument();
    });
    
    test('calls onSearch handler when searching', async () => {
      const mockOnSearch = jest.fn();
      render(
        <FormSelect 
          options={simpleOptions} 
          search={{ enabled: true }}
          eventHandlers={{ onSearch: mockOnSearch }}
        />
      );
      
      await user.click(screen.getByRole('combobox'));
      const searchInput = screen.getByRole('textbox');
      
      await user.type(searchInput, 'test');
      
      expect(mockOnSearch).toHaveBeenCalledWith('test');
    });
    
    test('supports fuzzy matching when enabled', async () => {
      render(
        <FormSelect 
          options={simpleOptions} 
          search={{ enabled: true, fuzzyMatching: true }}
        />
      );
      
      await user.click(screen.getByRole('combobox'));
      const searchInput = screen.getByRole('textbox');
      
      await user.type(searchInput, 'apl'); // Should match "Apple"
      
      expect(screen.getByText('Apple')).toBeInTheDocument();
    });
    
    test('supports custom filter function', async () => {
      const customFilter = jest.fn((option, searchValue) => 
        option.label.toLowerCase().includes(searchValue.toLowerCase())
      );
      
      render(
        <FormSelect 
          options={simpleOptions} 
          search={{ enabled: true, customFilter }}
        />
      );
      
      await user.click(screen.getByRole('combobox'));
      const searchInput = screen.getByRole('textbox');
      
      await user.type(searchInput, 'app');
      
      expect(customFilter).toHaveBeenCalled();
    });
  });
  
  // ==========================================
  // MULTI-SELECT TESTS
  // ==========================================
  
  describe('Multi-select Functionality', () => {
    test('allows multiple selections when enabled', async () => {
      const mockOnChange = jest.fn();
      render(
        <FormSelect 
          options={simpleOptions} 
          multiSelect={{ enabled: true }}
          eventHandlers={{ onChange: mockOnChange }}
        />
      );
      
      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByText('Apple'));
      await user.click(screen.getByText('Banana'));
      
      expect(mockOnChange).toHaveBeenLastCalledWith(['apple', 'banana'], expect.any(Array));
    });
    
    test('displays chips for selected options', async () => {
      render(
        <FormSelect 
          options={simpleOptions} 
          multiSelect={{ enabled: true, displayFormat: 'chips' }}
          value={['apple', 'banana']}
        />
      );
      
      expect(screen.getByText('Apple')).toBeInTheDocument();
      expect(screen.getByText('Banana')).toBeInTheDocument();
    });
    
    test('removes option when chip remove button is clicked', async () => {
      const mockOnChange = jest.fn();
      render(
        <FormSelect 
          options={simpleOptions} 
          multiSelect={{ enabled: true, displayFormat: 'chips', chipRemovable: true }}
          value={['apple', 'banana']}
          eventHandlers={{ onChange: mockOnChange }}
        />
      );
      
      const removeButtons = screen.getAllByLabelText(/Remove/);
      await user.click(removeButtons[0]);
      
      expect(mockOnChange).toHaveBeenCalled();
    });
    
    test('shows count display format', () => {
      render(
        <FormSelect 
          options={simpleOptions} 
          multiSelect={{ enabled: true, displayFormat: 'count' }}
          value={['apple', 'banana']}
        />
      );
      
      expect(screen.getByText('2 selected')).toBeInTheDocument();
    });
    
    test('shows list display format', () => {
      render(
        <FormSelect 
          options={simpleOptions} 
          multiSelect={{ enabled: true, displayFormat: 'list' }}
          value={['apple', 'banana']}
        />
      );
      
      expect(screen.getByText('Apple, Banana')).toBeInTheDocument();
    });
    
    test('respects maximum selections limit', async () => {
      render(
        <FormSelect 
          options={simpleOptions} 
          multiSelect={{ enabled: true, maxSelections: 2 }}
          value={['apple', 'banana']}
        />
      );
      
      await user.click(screen.getByRole('combobox'));
      
      // Third option should not be selectable
      const cherryOption = screen.getByText('Cherry');
      await user.click(cherryOption);
      
      // Should still only have 2 selections
      expect(screen.getByText('2 selected')).toBeInTheDocument();
    });
    
    test('provides select all functionality', async () => {
      const mockOnChange = jest.fn();
      render(
        <FormSelect 
          options={simpleOptions} 
          multiSelect={{ enabled: true, allowSelectAll: true }}
          eventHandlers={{ onChange: mockOnChange }}
        />
      );
      
      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByText('Select All'));
      
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.arrayContaining(['apple', 'banana', 'cherry', 'date']),
        expect.any(Array)
      );
    });
  });
  
  // ==========================================
  // VIRTUAL SCROLLING TESTS
  // ==========================================
  
  describe('Virtual Scrolling', () => {
    test('enables virtual scrolling for large option lists', () => {
      render(
        <FormSelect 
          options={largeOptionsList} 
          virtualScrolling={{ enabled: true, threshold: 50 }}
        />
      );
      
      // Component should render without issues
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
    
    test('renders virtual list when threshold is exceeded', async () => {
      render(
        <FormSelect 
          options={largeOptionsList} 
          virtualScrolling={{ enabled: true, threshold: 50 }}
        />
      );
      
      await user.click(screen.getByRole('combobox'));
      
      expect(screen.getByTestId('virtual-list')).toBeInTheDocument();
    });
    
    test('does not use virtual scrolling when below threshold', async () => {
      render(
        <FormSelect 
          options={simpleOptions} 
          virtualScrolling={{ enabled: true, threshold: 50 }}
        />
      );
      
      await user.click(screen.getByRole('combobox'));
      
      expect(screen.queryByTestId('virtual-list')).not.toBeInTheDocument();
    });
    
    test('handles virtual scrolling with search', async () => {
      render(
        <FormSelect 
          options={largeOptionsList} 
          search={{ enabled: true }}
          virtualScrolling={{ enabled: true, threshold: 50 }}
        />
      );
      
      await user.click(screen.getByRole('combobox'));
      const searchInput = screen.getByRole('textbox');
      
      await user.type(searchInput, 'Option 1');
      
      // Should filter options and potentially disable virtual scrolling
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
  });
  
  // ==========================================
  // KEYBOARD NAVIGATION TESTS
  // ==========================================
  
  describe('Keyboard Navigation', () => {
    test('opens dropdown with Enter key', async () => {
      render(<FormSelect options={simpleOptions} />);
      
      const trigger = screen.getByRole('combobox');
      trigger.focus();
      await user.keyboard('{Enter}');
      
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });
    
    test('opens dropdown with Space key', async () => {
      render(<FormSelect options={simpleOptions} />);
      
      const trigger = screen.getByRole('combobox');
      trigger.focus();
      await user.keyboard(' ');
      
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });
    
    test('navigates options with arrow keys', async () => {
      render(<FormSelect options={simpleOptions} />);
      
      const trigger = screen.getByRole('combobox');
      trigger.focus();
      await user.keyboard('{Enter}');
      
      // Navigate down
      await user.keyboard('{ArrowDown}');
      
      // First option should be highlighted
      expect(screen.getByText('Apple')).toHaveClass('form-select-option--highlighted');
    });
    
    test('selects option with Enter key', async () => {
      const mockOnChange = jest.fn();
      render(
        <FormSelect 
          options={simpleOptions} 
          eventHandlers={{ onChange: mockOnChange }}
        />
      );
      
      const trigger = screen.getByRole('combobox');
      trigger.focus();
      await user.keyboard('{Enter}');
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');
      
      expect(mockOnChange).toHaveBeenCalledWith('apple', expect.any(Object));
    });
    
    test('closes dropdown with Escape key', async () => {
      render(<FormSelect options={simpleOptions} />);
      
      const trigger = screen.getByRole('combobox');
      trigger.focus();
      await user.keyboard('{Enter}');
      
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      
      await user.keyboard('{Escape}');
      
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });
    
    test('jumps to first option with Home key', async () => {
      render(<FormSelect options={simpleOptions} />);
      
      const trigger = screen.getByRole('combobox');
      trigger.focus();
      await user.keyboard('{Enter}');
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Home}');
      
      expect(screen.getByText('Apple')).toHaveClass('form-select-option--highlighted');
    });
    
    test('jumps to last option with End key', async () => {
      render(<FormSelect options={simpleOptions} />);
      
      const trigger = screen.getByRole('combobox');
      trigger.focus();
      await user.keyboard('{Enter}');
      await user.keyboard('{End}');
      
      expect(screen.getByText('Date')).toHaveClass('form-select-option--highlighted');
    });
    
    test('skips disabled options during navigation', async () => {
      render(<FormSelect options={optionsWithIcons} />);
      
      const trigger = screen.getByRole('combobox');
      trigger.focus();
      await user.keyboard('{Enter}');
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowDown}');
      
      // Should skip the disabled option (Bob Johnson)
      expect(screen.getByText('John Doe')).toHaveClass('form-select-option--highlighted');
    });
  });
  
  // ==========================================
  // ACCESSIBILITY TESTS
  // ==========================================
  
  describe('Accessibility', () => {
    test('has no accessibility violations', async () => {
      const { container } = render(
        <FormSelect
          options={simpleOptions}
          label="Accessible select"
          helperText="Select an option"
          ariaLabel="Custom aria label"
        />
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
    
    test('associates label with select', () => {
      render(<FormSelect options={simpleOptions} label="Test Label" id="test-select" />);
      
      const select = screen.getByRole('combobox');
      const label = screen.getByText('Test Label');
      
      expect(select).toHaveAttribute('id', 'test-select');
      expect(label).toHaveAttribute('for', 'test-select');
    });
    
    test('supports aria-label', () => {
      render(<FormSelect options={simpleOptions} ariaLabel="Custom aria label" />);
      
      const select = screen.getByRole('combobox');
      expect(select).toHaveAttribute('aria-label', 'Custom aria label');
    });
    
    test('supports aria-describedby', () => {
      render(<FormSelect options={simpleOptions} ariaDescribedBy="helper-text" />);
      
      const select = screen.getByRole('combobox');
      expect(select).toHaveAttribute('aria-describedby', 'helper-text');
    });
    
    test('sets correct ARIA attributes for dropdown', async () => {
      render(<FormSelect options={simpleOptions} />);
      
      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      
      await user.click(trigger);
      
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
    
    test('sets correct ARIA attributes for options', async () => {
      render(<FormSelect options={simpleOptions} value="apple" />);
      
      await user.click(screen.getByRole('combobox'));
      
      const options = screen.getAllByRole('option');
      expect(options[0]).toHaveAttribute('aria-selected', 'true');
      expect(options[1]).toHaveAttribute('aria-selected', 'false');
    });
    
    test('sets aria-invalid for error state', () => {
      render(<FormSelect options={simpleOptions} validationState="error" />);
      
      const select = screen.getByRole('combobox');
      expect(select).toHaveAttribute('aria-invalid', 'true');
    });
    
    test('sets aria-required for required fields', () => {
      render(<FormSelect options={simpleOptions} required />);
      
      const select = screen.getByRole('combobox');
      expect(select).toHaveAttribute('aria-required', 'true');
    });
    
    test('provides screen reader text', () => {
      render(<FormSelect options={simpleOptions} screenReaderText="Additional context" />);
      
      expect(screen.getByText('Additional context')).toHaveClass('sr-only');
    });
    
    test('error messages have alert role', () => {
      render(<FormSelect options={simpleOptions} errorText="This field is required" />);
      
      const errorMessage = screen.getByText('This field is required');
      expect(errorMessage).toHaveAttribute('role', 'alert');
    });
    
    test('supports multi-select ARIA attributes', async () => {
      render(<FormSelect options={simpleOptions} multiSelect={{ enabled: true }} />);
      
      await user.click(screen.getByRole('combobox'));
      
      const listbox = screen.getByRole('listbox');
      expect(listbox).toHaveAttribute('aria-multiselectable', 'true');
    });
  });
  
  // ==========================================
  // STATE MANAGEMENT TESTS
  // ==========================================
  
  describe('State Management', () => {
    test('shows focused state when focused', async () => {
      const { container } = render(<FormSelect options={simpleOptions} />);
      
      const trigger = screen.getByRole('combobox');
      await user.click(trigger);
      
      expect(container.querySelector('.form-select-container--focused')).toBeInTheDocument();
    });
    
    test('shows open state when dropdown is open', async () => {
      const { container } = render(<FormSelect options={simpleOptions} />);
      
      await user.click(screen.getByRole('combobox'));
      
      expect(container.querySelector('.form-select-container--open')).toBeInTheDocument();
    });
    
    test('shows validation states', () => {
      const { rerender, container } = render(<FormSelect options={simpleOptions} validationState="success" />);
      expect(container.querySelector('.form-select-container--success')).toBeInTheDocument();
      
      rerender(<FormSelect options={simpleOptions} validationState="warning" />);
      expect(container.querySelector('.form-select-container--warning')).toBeInTheDocument();
      
      rerender(<FormSelect options={simpleOptions} validationState="error" />);
      expect(container.querySelector('.form-select-container--error')).toBeInTheDocument();
    });
    
    test('handles disabled state', () => {
      const { container } = render(<FormSelect options={simpleOptions} disabled />);
      
      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveAttribute('tabindex', '-1');
      expect(container.querySelector('.form-select-container--disabled')).toBeInTheDocument();
    });
    
    test('handles readonly state', () => {
      const { container } = render(<FormSelect options={simpleOptions} readOnly />);
      
      expect(container.querySelector('.form-select-container--readonly')).toBeInTheDocument();
    });
  });
  
  // ==========================================
  // REF INTERFACE TESTS
  // ==========================================
  
  describe('Ref Interface', () => {
    test('provides imperative handle methods', () => {
      const ref = React.createRef<FormSelectRef>();
      render(<FormSelect options={simpleOptions} ref={ref} />);
      
      expect(ref.current).toMatchObject({
        focus: expect.any(Function),
        blur: expect.any(Function),
        open: expect.any(Function),
        close: expect.any(Function),
        clear: expect.any(Function),
        selectAll: expect.any(Function),
        deselectAll: expect.any(Function),
        getSelectedOptions: expect.any(Function),
        setValue: expect.any(Function),
        search: expect.any(Function),
        scrollToOption: expect.any(Function)
      });
    });
    
    test('focus method works', () => {
      const ref = React.createRef<FormSelectRef>();
      render(<FormSelect options={simpleOptions} ref={ref} />);
      
      const trigger = screen.getByRole('combobox');
      ref.current?.focus();
      
      expect(trigger).toHaveFocus();
    });
    
    test('open and close methods work', async () => {
      const ref = React.createRef<FormSelectRef>();
      render(<FormSelect options={simpleOptions} ref={ref} />);
      
      const trigger = screen.getByRole('combobox');
      
      act(() => {
        ref.current?.open();
      });
      
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      
      act(() => {
        ref.current?.close();
      });
      
      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-expanded', 'false');
      });
    });
    
    test('getSelectedOptions method returns correct data', () => {
      const ref = React.createRef<FormSelectRef>();
      render(<FormSelect options={simpleOptions} ref={ref} value="apple" />);
      
      const selectedOptions = ref.current?.getSelectedOptions();
      
      expect(selectedOptions).toEqual([
        expect.objectContaining({ value: 'apple', label: 'Apple' })
      ]);
    });
    
    test('selectAll and deselectAll methods work for multi-select', () => {
      const ref = React.createRef<FormSelectRef>();
      const mockOnChange = jest.fn();
      render(
        <FormSelect 
          options={simpleOptions} 
          ref={ref}
          multiSelect={{ enabled: true }}
          eventHandlers={{ onChange: mockOnChange }}
        />
      );
      
      act(() => {
        ref.current?.selectAll();
      });
      
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.arrayContaining(['apple', 'banana', 'cherry', 'date']),
        expect.any(Array)
      );
      
      act(() => {
        ref.current?.deselectAll();
      });
      
      expect(mockOnChange).toHaveBeenCalledWith([], []);
    });
  });
  
  // ==========================================
  // PERFORMANCE TESTS
  // ==========================================
  
  describe('Performance', () => {
    test('handles large option lists efficiently', () => {
      const startTime = performance.now();
      
      render(
        <FormSelect 
          options={largeOptionsList} 
          virtualScrolling={{ enabled: true }}
        />
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render large lists in reasonable time (< 100ms)
      expect(renderTime).toBeLessThan(100);
    });
    
    test('search performance with large datasets', async () => {
      render(
        <FormSelect 
          options={largeOptionsList} 
          search={{ enabled: true }}
          virtualScrolling={{ enabled: true }}
        />
      );
      
      await user.click(screen.getByRole('combobox'));
      const searchInput = screen.getByRole('textbox');
      
      const startTime = performance.now();
      
      await user.type(searchInput, 'Option 1');
      
      const endTime = performance.now();
      const searchTime = endTime - startTime;
      
      // Search should be performant even with large datasets
      expect(searchTime).toBeLessThan(200);
    });
    
    test('virtual scrolling reduces DOM nodes', async () => {
      const { container } = render(
        <FormSelect 
          options={largeOptionsList} 
          virtualScrolling={{ enabled: true, threshold: 10 }}
        />
      );
      
      await user.click(screen.getByRole('combobox'));
      
      // Should render fewer DOM nodes than total options
      const renderedOptions = container.querySelectorAll('.form-select-option');
      expect(renderedOptions.length).toBeLessThan(largeOptionsList.length);
    });
  });
  
  // ==========================================
  // EDGE CASES AND ERROR HANDLING
  // ==========================================
  
  describe('Edge Cases', () => {
    test('handles empty options array', () => {
      render(<FormSelect options={[]} />);
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
    
    test('handles options with duplicate values', () => {
      const duplicateOptions = [
        { value: 'duplicate', label: 'First' },
        { value: 'duplicate', label: 'Second' }
      ];
      
      render(<FormSelect options={duplicateOptions} />);
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
    
    test('handles invalid value prop', () => {
      render(<FormSelect options={simpleOptions} value="invalid-value" />);
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
    
    test('handles options with special characters', async () => {
      const specialOptions = [
        { value: 'special-1', label: 'Option with "quotes"' },
        { value: 'special-2', label: 'Option with <tags>' },
        { value: 'special-3', label: 'Option with émojis 🎉' }
      ];
      
      render(<FormSelect options={specialOptions} />);
      
      await user.click(screen.getByRole('combobox'));
      
      expect(screen.getByText('Option with "quotes"')).toBeInTheDocument();
      expect(screen.getByText('Option with <tags>')).toBeInTheDocument();
      expect(screen.getByText('Option with émojis 🎉')).toBeInTheDocument();
    });
    
    test('handles rapid open/close operations', async () => {
      render(<FormSelect options={simpleOptions} />);
      
      const trigger = screen.getByRole('combobox');
      
      // Rapid open/close should not cause errors
      for (let i = 0; i < 5; i++) {
        await user.click(trigger);
        await user.keyboard('{Escape}');
      }
      
      expect(trigger).toBeInTheDocument();
    });
    
    test('handles search with no matching results', async () => {
      render(<FormSelect options={simpleOptions} search={{ enabled: true }} />);
      
      await user.click(screen.getByRole('combobox'));
      const searchInput = screen.getByRole('textbox');
      
      await user.type(searchInput, 'nonexistent');
      
      expect(screen.getByText('No options found')).toBeInTheDocument();
    });
    
    test('maintains focus management during interactions', async () => {
      render(<FormSelect options={simpleOptions} search={{ enabled: true }} />);
      
      const trigger = screen.getByRole('combobox');
      await user.click(trigger);
      
      const searchInput = screen.getByRole('textbox');
      expect(searchInput).toHaveFocus();
      
      await user.keyboard('{Escape}');
      
      expect(trigger).toHaveFocus();
    });
  });
  
  // ==========================================
  // INTEGRATION TESTS
  // ==========================================
  
  describe('Integration', () => {
    test('works with form submission', async () => {
      const mockSubmit = jest.fn();
      
      const TestForm = () => {
        const [value, setValue] = React.useState('');
        
        return (
          <form onSubmit={(e) => { e.preventDefault(); mockSubmit(value); }}>
            <FormSelect
              options={simpleOptions}
              value={value}
              eventHandlers={{ onChange: setValue }}
            />
            <button type="submit">Submit</button>
          </form>
        );
      };
      
      render(<TestForm />);
      
      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByText('Apple'));
      await user.click(screen.getByRole('button'));
      
      expect(mockSubmit).toHaveBeenCalledWith('apple');
    });
    
    test('integrates with external validation library', async () => {
      const externalValidator = (value: string) => {
        if (!value) return 'Selection is required';
        if (value === 'cherry') return 'Cherry is not allowed';
        return '';
      };
      
      const TestComponent = () => {
        const [value, setValue] = React.useState('');
        const [error, setError] = React.useState('');
        
        React.useEffect(() => {
          setError(externalValidator(value));
        }, [value]);
        
        return (
          <FormSelect
            options={simpleOptions}
            value={value}
            eventHandlers={{ onChange: setValue }}
            validationState={error ? 'error' : 'neutral'}
            errorText={error}
          />
        );
      };
      
      render(<TestComponent />);
      
      expect(screen.getByText('Selection is required')).toBeInTheDocument();
      
      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByText('Cherry'));
      
      expect(screen.getByText('Cherry is not allowed')).toBeInTheDocument();
      
      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByText('Apple'));
      
      expect(screen.queryByText('Cherry is not allowed')).not.toBeInTheDocument();
      expect(screen.queryByText('Selection is required')).not.toBeInTheDocument();
    });
  });
}); 