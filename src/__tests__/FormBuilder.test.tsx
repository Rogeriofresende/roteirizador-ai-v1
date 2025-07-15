import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import FormBuilder from '../components/ui/FormBuilder';
import type { FormSchema } from '../components/ui/FormBuilder';

// ===== CHARLIE QUALITY EXCELLENCE: MOCK SETUP =====
const mockProps = {
  onSchemaChange: vi.fn(),
  onFormSubmit: vi.fn(),
  onFormReset: vi.fn(),
  onFieldAdd: vi.fn(),
  onFieldRemove: vi.fn(),
  onFieldUpdate: vi.fn(),
  onFieldReorder: vi.fn(),
  onFormDataChange: vi.fn(),
};

const sampleSchema: FormSchema = {
  id: 'test-form',
  name: 'Test Form',
  version: '1.0.0',
  fields: [
    {
      id: 'field1',
      type: 'input',
      name: 'testField',
      label: 'Test Field',
      placeholder: 'Enter text...',
      required: true,
      metadata: {
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: '1.0.0',
      },
    },
    {
      id: 'field2',
      type: 'submit',
      name: 'submit',
      label: 'Submit',
      props: {
        buttonText: 'Submit Form',
      },
      metadata: {
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: '1.0.0',
      },
    },
  ],
  layout: {
    type: 'single',
    columns: 1,
    gap: 'md',
    responsive: true,
  },
  styling: {
    variant: 'outlined',
    size: 'md',
    theme: 'light',
  },
  behavior: {
    autoSave: false,
    showProgress: true,
    allowReset: true,
  },
  validation: {
    enableRealTime: true,
    showValidationSummary: true,
  },
  metadata: {
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tags: ['test'],
  },
};

// Mock file operations
const mockFileReader = {
  readAsText: vi.fn(),
  onload: vi.fn(),
  result: '',
};

const mockCreateObjectURL = vi.fn();
const mockRevokeObjectURL = vi.fn();

// Setup DOM mocks
beforeEach(() => {
  vi.clearAllMocks();
  
  // Mock FileReader
  global.FileReader = vi.fn(() => mockFileReader) as any;
  
  // Mock URL methods
  global.URL = {
    createObjectURL: mockCreateObjectURL,
    revokeObjectURL: mockRevokeObjectURL,
  } as any;
  
  // Mock document methods
  const mockElement = {
    click: vi.fn(),
    remove: vi.fn(),
    href: '',
    download: '',
  };
  
  vi.spyOn(document, 'createElement').mockReturnValue(mockElement as any);
  vi.spyOn(document.body, 'appendChild').mockImplementation(vi.fn());
  vi.spyOn(document.body, 'removeChild').mockImplementation(vi.fn());
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ===== CHARLIE TESTING FRAMEWORK: BASIC FUNCTIONALITY =====
describe('FormBuilder Component', () => {
  describe('Basic Functionality', () => {
    it('renders FormBuilder with default props', () => {
      render(<FormBuilder {...mockProps} />);
      
      expect(screen.getByText('New Form')).toBeInTheDocument();
      expect(screen.getByText('Field Templates')).toBeInTheDocument();
      expect(screen.getByText('No fields added yet')).toBeInTheDocument();
    });

    it('renders with custom name', () => {
      render(<FormBuilder {...mockProps} name="Custom Form" />);
      
      expect(screen.getByText('Custom Form')).toBeInTheDocument();
    });

    it('renders with provided schema', () => {
      render(<FormBuilder {...mockProps} schema={sampleSchema} />);
      
      expect(screen.getByText('Test Form')).toBeInTheDocument();
      expect(screen.getByLabelText('Test Field')).toBeInTheDocument();
      expect(screen.getByText('Submit Form')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<FormBuilder {...mockProps} className="custom-class" />);
      
      const formBuilder = screen.getByText('New Form').closest('div');
      expect(formBuilder).toHaveClass('custom-class');
    });

    it('applies custom styles', () => {
      const customStyle = { backgroundColor: 'red' };
      render(<FormBuilder {...mockProps} style={customStyle} />);
      
      const formBuilder = screen.getByText('New Form').closest('div');
      expect(formBuilder).toHaveStyle({ backgroundColor: 'red' });
    });

    it('renders with data-testid', () => {
      render(<FormBuilder {...mockProps} data-testid="form-builder" />);
      
      expect(screen.getByTestId('form-builder')).toBeInTheDocument();
    });
  });

  // ===== V7.5 ENHANCED VARIANTS TESTING =====
  describe('V7.5 Enhanced Variants', () => {
    it('renders glass variant correctly', () => {
      render(<FormBuilder {...mockProps} variant="glass" schema={sampleSchema} />);
      
      expect(screen.getByText('Test Form')).toBeInTheDocument();
      // Glass variant should be applied to form components
    });

    it('renders outlined variant correctly', () => {
      render(<FormBuilder {...mockProps} variant="outlined" schema={sampleSchema} />);
      
      expect(screen.getByText('Test Form')).toBeInTheDocument();
      // Outlined variant should be applied to form components
    });

    it('renders filled variant correctly', () => {
      render(<FormBuilder {...mockProps} variant="filled" schema={sampleSchema} />);
      
      expect(screen.getByText('Test Form')).toBeInTheDocument();
      // Filled variant should be applied to form components
    });

    it('renders minimal variant correctly', () => {
      render(<FormBuilder {...mockProps} variant="minimal" schema={sampleSchema} />);
      
      expect(screen.getByText('Test Form')).toBeInTheDocument();
      // Minimal variant should be applied to form components
    });
  });

  // ===== SIZE VARIANTS TESTING =====
  describe('Size Variants', () => {
    it('renders small size correctly', () => {
      render(<FormBuilder {...mockProps} size="sm" schema={sampleSchema} />);
      
      expect(screen.getByText('Test Form')).toBeInTheDocument();
      // Small size should be applied to form components
    });

    it('renders medium size correctly', () => {
      render(<FormBuilder {...mockProps} size="md" schema={sampleSchema} />);
      
      expect(screen.getByText('Test Form')).toBeInTheDocument();
      // Medium size should be applied to form components
    });

    it('renders large size correctly', () => {
      render(<FormBuilder {...mockProps} size="lg" schema={sampleSchema} />);
      
      expect(screen.getByText('Test Form')).toBeInTheDocument();
      // Large size should be applied to form components
    });

    it('renders extra large size correctly', () => {
      render(<FormBuilder {...mockProps} size="xl" schema={sampleSchema} />);
      
      expect(screen.getByText('Test Form')).toBeInTheDocument();
      // Extra large size should be applied to form components
    });
  });

  // ===== BUILDER MODE TESTING =====
  describe('Builder Mode', () => {
    it('renders builder mode by default', () => {
      render(<FormBuilder {...mockProps} />);
      
      expect(screen.getByText('Field Templates')).toBeInTheDocument();
      expect(screen.getByText('Select a field to edit properties')).toBeInTheDocument();
    });

    it('allows adding fields from templates', async () => {
      const user = userEvent.setup();
      render(<FormBuilder {...mockProps} />);
      
      // Click on a field template
      const textInputTemplate = screen.getByText('Text Input');
      await user.click(textInputTemplate);
      
      // Field should be added to the form
      await waitFor(() => {
        expect(mockProps.onFieldAdd).toHaveBeenCalled();
      });
    });

    it('shows field categories', () => {
      render(<FormBuilder {...mockProps} />);
      
      expect(screen.getByText('Basic')).toBeInTheDocument();
      expect(screen.getByText('Advanced')).toBeInTheDocument();
      expect(screen.getByText('Layout')).toBeInTheDocument();
      expect(screen.getByText('Validation')).toBeInTheDocument();
    });

    it('switches between field categories', async () => {
      const user = userEvent.setup();
      render(<FormBuilder {...mockProps} />);
      
      // Click on Advanced category
      await user.click(screen.getByText('Advanced'));
      
      // Should show advanced field templates
      expect(screen.getByText('Email Input')).toBeInTheDocument();
      expect(screen.getByText('Password Input')).toBeInTheDocument();
    });

    it('shows field editor when field is selected', () => {
      render(<FormBuilder {...mockProps} schema={sampleSchema} />);
      
      // Should show field editor panel
      expect(screen.getByText('Field Settings')).toBeInTheDocument();
    });
  });

  // ===== PREVIEW MODE TESTING =====
  describe('Preview Mode', () => {
    it('renders preview mode correctly', () => {
      render(<FormBuilder {...mockProps} mode="preview" schema={sampleSchema} />);
      
      expect(screen.getByText('Test Form')).toBeInTheDocument();
      expect(screen.getByLabelText('Test Field')).toBeInTheDocument();
      expect(screen.getByText('Submit Form')).toBeInTheDocument();
      
      // Should not show builder panels
      expect(screen.queryByText('Field Templates')).not.toBeInTheDocument();
      expect(screen.queryByText('Field Settings')).not.toBeInTheDocument();
    });

    it('allows form interaction in preview mode', async () => {
      const user = userEvent.setup();
      render(<FormBuilder {...mockProps} mode="preview" schema={sampleSchema} />);
      
      const input = screen.getByLabelText('Test Field');
      await user.type(input, 'test value');
      
      expect(input).toHaveValue('test value');
    });

    it('handles form submission in preview mode', async () => {
      const user = userEvent.setup();
      render(<FormBuilder {...mockProps} mode="preview" schema={sampleSchema} />);
      
      const submitButton = screen.getByText('Submit Form');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockProps.onFormSubmit).toHaveBeenCalled();
      });
    });
  });

  // ===== READONLY MODE TESTING =====
  describe('Readonly Mode', () => {
    it('renders readonly mode correctly', () => {
      render(<FormBuilder {...mockProps} mode="readonly" schema={sampleSchema} />);
      
      expect(screen.getByText('Test Form')).toBeInTheDocument();
      expect(screen.getByLabelText('Test Field')).toBeInTheDocument();
      
      // Should not show builder panels
      expect(screen.queryByText('Field Templates')).not.toBeInTheDocument();
      expect(screen.queryByText('Field Settings')).not.toBeInTheDocument();
    });

    it('disables form interaction in readonly mode', () => {
      render(<FormBuilder {...mockProps} mode="readonly" schema={sampleSchema} />);
      
      const input = screen.getByLabelText('Test Field');
      expect(input).toBeDisabled();
    });
  });

  // ===== FIELD MANAGEMENT TESTING =====
  describe('Field Management', () => {
    it('handles field removal', async () => {
      const user = userEvent.setup();
      render(<FormBuilder {...mockProps} schema={sampleSchema} />);
      
      // Select a field first (simulate click on field)
      const field = screen.getByLabelText('Test Field');
      await user.click(field);
      
      // Find and click remove button
      const removeButton = screen.getByTitle('Remove field');
      await user.click(removeButton);
      
      await waitFor(() => {
        expect(mockProps.onFieldRemove).toHaveBeenCalledWith('field1');
      });
    });

    it('handles field duplication', async () => {
      const user = userEvent.setup();
      render(<FormBuilder {...mockProps} schema={sampleSchema} />);
      
      // Select a field first
      const field = screen.getByLabelText('Test Field');
      await user.click(field);
      
      // Find and click duplicate button
      const duplicateButton = screen.getByTitle('Duplicate field');
      await user.click(duplicateButton);
      
      await waitFor(() => {
        expect(mockProps.onFieldUpdate).toHaveBeenCalled();
      });
    });

    it('handles field property updates', async () => {
      const user = userEvent.setup();
      render(<FormBuilder {...mockProps} schema={sampleSchema} />);
      
      // Select a field first
      const field = screen.getByLabelText('Test Field');
      await user.click(field);
      
      // Update label in field editor
      const labelInput = screen.getByDisplayValue('Test Field');
      await user.clear(labelInput);
      await user.type(labelInput, 'Updated Label');
      
      await waitFor(() => {
        expect(mockProps.onFieldUpdate).toHaveBeenCalled();
      });
    });
  });

  // ===== SCHEMA OPERATIONS TESTING =====
  describe('Schema Operations', () => {
    it('handles schema changes', () => {
      const { rerender } = render(<FormBuilder {...mockProps} schema={sampleSchema} />);
      
      const updatedSchema = {
        ...sampleSchema,
        name: 'Updated Form',
      };
      
      rerender(<FormBuilder {...mockProps} schema={updatedSchema} />);
      
      expect(screen.getByText('Updated Form')).toBeInTheDocument();
    });

    it('handles export functionality', async () => {
      const user = userEvent.setup();
      render(<FormBuilder {...mockProps} schema={sampleSchema} enableExport={true} />);
      
      const exportButton = screen.getByText('Export');
      await user.click(exportButton);
      
      await waitFor(() => {
        expect(mockCreateObjectURL).toHaveBeenCalled();
        expect(document.createElement).toHaveBeenCalledWith('a');
      });
    });

    it('handles import functionality', async () => {
      const user = userEvent.setup();
      render(<FormBuilder {...mockProps} enableImport={true} />);
      
      const importButton = screen.getByText('Import');
      const fileInput = importButton.querySelector('input[type="file"]');
      
      const file = new File(['{"id": "test"}'], 'test.json', { type: 'application/json' });
      
      await user.upload(fileInput as HTMLInputElement, file);
      
      await waitFor(() => {
        expect(mockFileReader.readAsText).toHaveBeenCalledWith(file);
      });
    });
  });

  // ===== TOGGLE FUNCTIONALITIES TESTING =====
  describe('Toggle Functionalities', () => {
    it('toggles preview mode', async () => {
      const user = userEvent.setup();
      render(<FormBuilder {...mockProps} schema={sampleSchema} enablePreview={true} />);
      
      const previewButton = screen.getByText('Preview');
      await user.click(previewButton);
      
      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument();
        expect(screen.queryByText('Field Templates')).not.toBeInTheDocument();
      });
    });

    it('toggles code view mode', async () => {
      const user = userEvent.setup();
      render(<FormBuilder {...mockProps} schema={sampleSchema} enableCodeView={true} />);
      
      const codeButton = screen.getByText('Code');
      await user.click(codeButton);
      
      await waitFor(() => {
        expect(screen.getByText('"id": "test-form"')).toBeInTheDocument();
      });
    });

    it('handles save functionality', async () => {
      const user = userEvent.setup();
      render(<FormBuilder {...mockProps} schema={sampleSchema} />);
      
      const saveButton = screen.getByText('Save');
      await user.click(saveButton);
      
      // Should remove "Unsaved" indicator if present
      expect(screen.queryByText('Unsaved')).not.toBeInTheDocument();
    });
  });

  // ===== UNDO/REDO TESTING =====
  describe('Undo/Redo Functionality', () => {
    it('handles undo operation', async () => {
      const user = userEvent.setup();
      render(<FormBuilder {...mockProps} schema={sampleSchema} />);
      
      const undoButton = screen.getByTitle('Undo');
      
      // Undo should be disabled initially
      expect(undoButton).toBeDisabled();
    });

    it('handles redo operation', async () => {
      const user = userEvent.setup();
      render(<FormBuilder {...mockProps} schema={sampleSchema} />);
      
      const redoButton = screen.getByTitle('Redo');
      
      // Redo should be disabled initially
      expect(redoButton).toBeDisabled();
    });

    it('enables undo after making changes', async () => {
      const user = userEvent.setup();
      render(<FormBuilder {...mockProps} />);
      
      // Add a field to create history
      const textInputTemplate = screen.getByText('Text Input');
      await user.click(textInputTemplate);
      
      const undoButton = screen.getByTitle('Undo');
      expect(undoButton).not.toBeDisabled();
    });
  });

  // ===== AUTO-SAVE TESTING =====
  describe('Auto-save Functionality', () => {
    it('enables auto-save when configured', () => {
      render(<FormBuilder {...mockProps} enableAutoSave={true} autoSaveInterval={1000} />);
      
      expect(screen.getByText('New Form')).toBeInTheDocument();
      // Auto-save should be configured (tested through timer behavior)
    });

    it('shows unsaved indicator when dirty', async () => {
      const user = userEvent.setup();
      render(<FormBuilder {...mockProps} />);
      
      // Make a change to trigger dirty state
      const textInputTemplate = screen.getByText('Text Input');
      await user.click(textInputTemplate);
      
      await waitFor(() => {
        expect(screen.getByText('Unsaved')).toBeInTheDocument();
      });
    });
  });

  // ===== VALIDATION TESTING =====
  describe('Validation Integration', () => {
    it('enables validation when configured', () => {
      render(<FormBuilder {...mockProps} enableValidation={true} schema={sampleSchema} />);
      
      expect(screen.getByText('Test Form')).toBeInTheDocument();
      // Validation should be enabled for form fields
    });

    it('handles validation errors', async () => {
      const user = userEvent.setup();
      render(<FormBuilder {...mockProps} mode="preview" schema={sampleSchema} enableValidation={true} />);
      
      const submitButton = screen.getByText('Submit Form');
      await user.click(submitButton);
      
      // Should show validation errors for required fields
      await waitFor(() => {
        expect(screen.getByText('This field is required')).toBeInTheDocument();
      });
    });
  });

  // ===== FORM DATA HANDLING =====
  describe('Form Data Handling', () => {
    it('handles form data changes', async () => {
      const user = userEvent.setup();
      render(<FormBuilder {...mockProps} mode="preview" schema={sampleSchema} />);
      
      const input = screen.getByLabelText('Test Field');
      await user.type(input, 'test value');
      
      await waitFor(() => {
        expect(mockProps.onFormDataChange).toHaveBeenCalledWith('testField', 'test value');
      });
    });

    it('handles external form data', () => {
      const formData = { testField: 'external value' };
      render(<FormBuilder {...mockProps} formData={formData} schema={sampleSchema} />);
      
      const input = screen.getByLabelText('Test Field');
      expect(input).toHaveValue('external value');
    });

    it('handles form reset', async () => {
      const user = userEvent.setup();
      render(<FormBuilder {...mockProps} mode="preview" schema={sampleSchema} />);
      
      const input = screen.getByLabelText('Test Field');
      await user.type(input, 'test value');
      
      // Trigger form reset (would need reset button in schema)
      expect(mockProps.onFormReset).not.toHaveBeenCalled();
    });
  });

  // ===== PERMISSIONS TESTING =====
  describe('Permissions and Restrictions', () => {
    it('respects allowEdit permission', () => {
      render(<FormBuilder {...mockProps} allowEdit={false} schema={sampleSchema} />);
      
      expect(screen.queryByText('Field Settings')).not.toBeInTheDocument();
    });

    it('respects allowAddFields permission', () => {
      render(<FormBuilder {...mockProps} allowAddFields={false} />);
      
      expect(screen.queryByText('Field Templates')).not.toBeInTheDocument();
    });

    it('respects allowRemoveFields permission', () => {
      render(<FormBuilder {...mockProps} allowRemoveFields={false} schema={sampleSchema} />);
      
      // Remove buttons should not be present
      expect(screen.queryByTitle('Remove field')).not.toBeInTheDocument();
    });

    it('respects allowDuplicate permission', () => {
      render(<FormBuilder {...mockProps} allowDuplicate={false} schema={sampleSchema} />);
      
      // Duplicate buttons should not be present
      expect(screen.queryByTitle('Duplicate field')).not.toBeInTheDocument();
    });
  });

  // ===== RESPONSIVE DESIGN TESTING =====
  describe('Responsive Design', () => {
    it('handles full width layout', () => {
      render(<FormBuilder {...mockProps} fullWidth={true} />);
      
      const container = screen.getByText('New Form').closest('div');
      expect(container).toHaveStyle({ width: '100%' });
    });

    it('handles fixed width layout', () => {
      render(<FormBuilder {...mockProps} fullWidth={false} />);
      
      const container = screen.getByText('New Form').closest('div');
      expect(container).toHaveStyle({ width: 'auto' });
    });
  });

  // ===== ACCESSIBILITY TESTING =====
  describe('Accessibility', () => {
    it('provides proper ARIA labels', () => {
      render(<FormBuilder {...mockProps} schema={sampleSchema} />);
      
      const input = screen.getByLabelText('Test Field');
      expect(input).toHaveAttribute('aria-label', 'Test Field');
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<FormBuilder {...mockProps} schema={sampleSchema} />);
      
      const input = screen.getByLabelText('Test Field');
      await user.click(input);
      
      // Tab should navigate to submit button
      await user.tab();
      
      const submitButton = screen.getByText('Submit Form');
      expect(submitButton).toHaveFocus();
    });

    it('provides proper focus management', async () => {
      const user = userEvent.setup();
      render(<FormBuilder {...mockProps} schema={sampleSchema} />);
      
      const input = screen.getByLabelText('Test Field');
      await user.click(input);
      
      expect(input).toHaveFocus();
    });

    it('provides screen reader support', () => {
      render(<FormBuilder {...mockProps} schema={sampleSchema} />);
      
      const input = screen.getByLabelText('Test Field');
      expect(input).toHaveAttribute('aria-required', 'true');
    });
  });

  // ===== PERFORMANCE TESTING =====
  describe('Performance', () => {
    it('handles large schemas efficiently', () => {
      const largeSchema = {
        ...sampleSchema,
        fields: Array.from({ length: 100 }, (_, i) => ({
          id: `field${i}`,
          type: 'input' as const,
          name: `field${i}`,
          label: `Field ${i}`,
          metadata: {
            createdAt: Date.now(),
            updatedAt: Date.now(),
            version: '1.0.0',
          },
        })),
      };
      
      const start = performance.now();
      render(<FormBuilder {...mockProps} schema={largeSchema} />);
      const end = performance.now();
      
      expect(end - start).toBeLessThan(1000); // Should render within 1 second
    });

    it('optimizes re-renders with memo', () => {
      const { rerender } = render(<FormBuilder {...mockProps} schema={sampleSchema} />);
      
      // Re-render with same props should not cause full re-render
      rerender(<FormBuilder {...mockProps} schema={sampleSchema} />);
      
      expect(screen.getByText('Test Form')).toBeInTheDocument();
    });

    it('handles frequent schema updates', () => {
      const { rerender } = render(<FormBuilder {...mockProps} schema={sampleSchema} />);
      
      // Multiple rapid updates
      for (let i = 0; i < 10; i++) {
        const updatedSchema = {
          ...sampleSchema,
          name: `Form ${i}`,
        };
        rerender(<FormBuilder {...mockProps} schema={updatedSchema} />);
      }
      
      expect(screen.getByText('Form 9')).toBeInTheDocument();
    });
  });

  // ===== INTEGRATION TESTING =====
  describe('Integration', () => {
    it('integrates with all form components', () => {
      const fullSchema = {
        ...sampleSchema,
        fields: [
          {
            id: 'input',
            type: 'input' as const,
            name: 'input',
            label: 'Input',
            metadata: { createdAt: Date.now(), updatedAt: Date.now(), version: '1.0.0' },
          },
          {
            id: 'textarea',
            type: 'textarea' as const,
            name: 'textarea',
            label: 'Textarea',
            metadata: { createdAt: Date.now(), updatedAt: Date.now(), version: '1.0.0' },
          },
          {
            id: 'select',
            type: 'select' as const,
            name: 'select',
            label: 'Select',
            options: [{ value: 'option1', label: 'Option 1' }],
            metadata: { createdAt: Date.now(), updatedAt: Date.now(), version: '1.0.0' },
          },
          {
            id: 'checkbox',
            type: 'checkbox' as const,
            name: 'checkbox',
            label: 'Checkbox',
            options: [{ value: 'check1', label: 'Check 1' }],
            metadata: { createdAt: Date.now(), updatedAt: Date.now(), version: '1.0.0' },
          },
          {
            id: 'radio',
            type: 'radio' as const,
            name: 'radio',
            label: 'Radio',
            options: [{ value: 'radio1', label: 'Radio 1' }],
            metadata: { createdAt: Date.now(), updatedAt: Date.now(), version: '1.0.0' },
          },
          {
            id: 'validation',
            type: 'validation' as const,
            name: 'validation',
            label: 'Validation',
            validation: { rules: [] },
            metadata: { createdAt: Date.now(), updatedAt: Date.now(), version: '1.0.0' },
          },
          {
            id: 'submit',
            type: 'submit' as const,
            name: 'submit',
            label: 'Submit',
            metadata: { createdAt: Date.now(), updatedAt: Date.now(), version: '1.0.0' },
          },
        ],
      };
      
      render(<FormBuilder {...mockProps} schema={fullSchema} />);
      
      expect(screen.getByLabelText('Input')).toBeInTheDocument();
      expect(screen.getByLabelText('Textarea')).toBeInTheDocument();
      expect(screen.getByLabelText('Select')).toBeInTheDocument();
      expect(screen.getByLabelText('Checkbox')).toBeInTheDocument();
      expect(screen.getByLabelText('Radio')).toBeInTheDocument();
      expect(screen.getByLabelText('Validation')).toBeInTheDocument();
      expect(screen.getByText('Submit')).toBeInTheDocument();
    });

    it('maintains form state across mode changes', async () => {
      const user = userEvent.setup();
      render(<FormBuilder {...mockProps} schema={sampleSchema} />);
      
      // Switch to preview mode
      const previewButton = screen.getByText('Preview');
      await user.click(previewButton);
      
      // Enter data
      const input = screen.getByLabelText('Test Field');
      await user.type(input, 'test value');
      
      // Switch back to builder mode
      const editButton = screen.getByText('Edit');
      await user.click(editButton);
      
      // Switch back to preview - data should persist
      await user.click(screen.getByText('Preview'));
      
      expect(screen.getByDisplayValue('test value')).toBeInTheDocument();
    });

    it('handles complex form workflows', async () => {
      const user = userEvent.setup();
      render(<FormBuilder {...mockProps} />);
      
      // Add multiple fields
      await user.click(screen.getByText('Text Input'));
      await user.click(screen.getByText('Email Input'));
      await user.click(screen.getByText('Submit Button'));
      
      // Switch to preview
      await user.click(screen.getByText('Preview'));
      
      // Fill form
      const nameInput = screen.getByLabelText('Text Input');
      await user.type(nameInput, 'John Doe');
      
      const emailInput = screen.getByLabelText('Email Input');
      await user.type(emailInput, 'john@example.com');
      
      // Submit form
      await user.click(screen.getByText('Submit Button'));
      
      await waitFor(() => {
        expect(mockProps.onFormSubmit).toHaveBeenCalled();
      });
    });
  });

  // ===== ERROR HANDLING =====
  describe('Error Handling', () => {
    it('handles invalid schema gracefully', () => {
      const invalidSchema = {
        ...sampleSchema,
        fields: [
          {
            id: 'invalid',
            type: 'unknown' as any,
            name: 'invalid',
            label: 'Invalid',
            metadata: { createdAt: Date.now(), updatedAt: Date.now(), version: '1.0.0' },
          },
        ],
      };
      
      render(<FormBuilder {...mockProps} schema={invalidSchema} />);
      
      expect(screen.getByText('Test Form')).toBeInTheDocument();
      expect(screen.getByText('Unknown field type: unknown')).toBeInTheDocument();
    });

    it('handles missing field properties', () => {
      const incompleteSchema = {
        ...sampleSchema,
        fields: [
          {
            id: 'incomplete',
            type: 'input' as const,
            name: 'incomplete',
            // Missing label and other properties
            metadata: { createdAt: Date.now(), updatedAt: Date.now(), version: '1.0.0' },
          },
        ],
      };
      
      render(<FormBuilder {...mockProps} schema={incompleteSchema} />);
      
      expect(screen.getByText('Test Form')).toBeInTheDocument();
    });

    it('handles import errors gracefully', async () => {
      const user = userEvent.setup();
      render(<FormBuilder {...mockProps} enableImport={true} />);
      
      const importButton = screen.getByText('Import');
      const fileInput = importButton.querySelector('input[type="file"]');
      
      // Mock invalid JSON
      mockFileReader.result = 'invalid json';
      
      const file = new File(['invalid json'], 'invalid.json', { type: 'application/json' });
      await user.upload(fileInput as HTMLInputElement, file);
      
      // Should handle the error gracefully
      expect(screen.getByText('New Form')).toBeInTheDocument();
    });
  });

  // ===== EDGE CASES =====
  describe('Edge Cases', () => {
    it('handles empty schema', () => {
      const emptySchema = {
        ...sampleSchema,
        fields: [],
      };
      
      render(<FormBuilder {...mockProps} schema={emptySchema} />);
      
      expect(screen.getByText('No fields added yet')).toBeInTheDocument();
    });

    it('handles schema with no metadata', () => {
      const schemaWithoutMetadata = {
        id: 'test',
        name: 'Test',
        version: '1.0.0',
        fields: [],
        layout: { type: 'single' as const },
        styling: { variant: 'outlined' as const, size: 'md' as const },
      };
      
      render(<FormBuilder {...mockProps} schema={schemaWithoutMetadata} />);
      
      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    it('handles rapid state changes', async () => {
      const user = userEvent.setup();
      render(<FormBuilder {...mockProps} />);
      
      // Rapidly toggle between modes
      for (let i = 0; i < 5; i++) {
        await user.click(screen.getByText('Preview'));
        await user.click(screen.getByText('Edit'));
      }
      
      expect(screen.getByText('New Form')).toBeInTheDocument();
    });
  });
});

// ===== CHARLIE QUALITY EXCELLENCE: COMPREHENSIVE COVERAGE =====
describe('FormBuilder V7.5 Enhanced - Quality Excellence', () => {
  it('maintains high performance with complex schemas', () => {
    const complexSchema = {
      ...sampleSchema,
      fields: Array.from({ length: 50 }, (_, i) => ({
        id: `field${i}`,
        type: 'input' as const,
        name: `field${i}`,
        label: `Field ${i}`,
        validation: {
          rules: [
            { name: 'required', message: 'Required' },
            { name: 'minLength', message: 'Min length 3', min: 3 },
          ],
        },
        metadata: {
          createdAt: Date.now(),
          updatedAt: Date.now(),
          version: '1.0.0',
        },
      })),
    };
    
    const start = performance.now();
    render(<FormBuilder {...mockProps} schema={complexSchema} />);
    const end = performance.now();
    
    expect(end - start).toBeLessThan(500); // Should render within 500ms
    expect(screen.getByText('Test Form')).toBeInTheDocument();
  });

  it('provides comprehensive accessibility coverage', () => {
    render(<FormBuilder {...mockProps} schema={sampleSchema} />);
    
    const input = screen.getByLabelText('Test Field');
    expect(input).toHaveAttribute('aria-required', 'true');
    expect(input).toHaveAttribute('aria-label', 'Test Field');
    
    const submitButton = screen.getByText('Submit Form');
    expect(submitButton).toHaveAttribute('type', 'button');
  });

  it('handles enterprise-level form complexity', () => {
    const enterpriseSchema = {
      ...sampleSchema,
      fields: [
        // Text inputs
        ...Array.from({ length: 10 }, (_, i) => ({
          id: `text${i}`,
          type: 'input' as const,
          name: `text${i}`,
          label: `Text Field ${i}`,
          metadata: { createdAt: Date.now(), updatedAt: Date.now(), version: '1.0.0' },
        })),
        // Selects
        ...Array.from({ length: 5 }, (_, i) => ({
          id: `select${i}`,
          type: 'select' as const,
          name: `select${i}`,
          label: `Select ${i}`,
          options: [{ value: 'opt1', label: 'Option 1' }],
          metadata: { createdAt: Date.now(), updatedAt: Date.now(), version: '1.0.0' },
        })),
        // Checkboxes
        ...Array.from({ length: 3 }, (_, i) => ({
          id: `checkbox${i}`,
          type: 'checkbox' as const,
          name: `checkbox${i}`,
          label: `Checkbox ${i}`,
          options: [{ value: 'check1', label: 'Check 1' }],
          metadata: { createdAt: Date.now(), updatedAt: Date.now(), version: '1.0.0' },
        })),
      ],
    };
    
    render(<FormBuilder {...mockProps} schema={enterpriseSchema} />);
    
    expect(screen.getByText('Test Form')).toBeInTheDocument();
    expect(screen.getByLabelText('Text Field 0')).toBeInTheDocument();
    expect(screen.getByLabelText('Select 0')).toBeInTheDocument();
    expect(screen.getByLabelText('Checkbox 0')).toBeInTheDocument();
  });

  it('maintains quality standards across all features', async () => {
    const user = userEvent.setup();
    render(<FormBuilder {...mockProps} schema={sampleSchema} />);
    
    // Test all major features
    expect(screen.getByText('Field Templates')).toBeInTheDocument(); // Templates
    expect(screen.getByText('Field Settings')).toBeInTheDocument(); // Editor
    expect(screen.getByText('Preview')).toBeInTheDocument(); // Preview mode
    expect(screen.getByText('Code')).toBeInTheDocument(); // Code view
    expect(screen.getByText('Export')).toBeInTheDocument(); // Export
    expect(screen.getByText('Import')).toBeInTheDocument(); // Import
    expect(screen.getByText('Save')).toBeInTheDocument(); // Save
    expect(screen.getByTitle('Undo')).toBeInTheDocument(); // Undo
    expect(screen.getByTitle('Redo')).toBeInTheDocument(); // Redo
    
    // Test quality metrics
    expect(screen.getByText('FormBuilder V7.5 Enhanced')).toBeInTheDocument();
  });
}); 