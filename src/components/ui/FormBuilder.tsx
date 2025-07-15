import React, { useState, useRef, useCallback, memo, forwardRef, useId, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  Eye, 
  Code, 
  Download,
  Upload,
  Copy,
  RotateCcw,
  Settings,
  Layout,
  Grid,
  List,
  Box,
  Type,
  CheckSquare,
  Circle,
  Mail,
  Lock,
  Send,
  Sparkles,
  TrendingUp,
  Target,
  Zap,
  Shield,
  Clock
} from 'lucide-react';
import { theme as designTokens } from '../../design-system/tokens';

// Import all form components
import FormInput from './FormInput';
import FormTextarea from './FormTextarea';
import FormSelect from './FormSelect';
import FormCheckbox from './FormCheckbox';
import FormRadio from './FormRadio';
import FormValidation from './FormValidation';
import FormSubmit from './FormSubmit';

// Layout.Section - V7.5 Enhanced Structure
const Layout = {
  Section: ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`relative ${className}`}>{children}</div>
  ),
  Container: ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`flex flex-col space-y-3 ${className}`}>{children}</div>
  ),
  Row: ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`flex items-center space-x-2 ${className}`}>{children}</div>
  ),
  Grid: ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`grid gap-4 ${className}`}>{children}</div>
  )
};

// ===== ALPHA TECHNICAL FOUNDATION: ADVANCED TYPESCRIPT INTERFACES =====

export interface FormField {
  id: string;
  type: 'input' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'validation' | 'submit';
  label?: string;
  name: string;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  defaultValue?: any;
  validation?: {
    rules?: any[];
    asyncRules?: any[];
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
  };
  options?: Array<{ value: any; label: string; disabled?: boolean }>;
  props?: Record<string, any>;
  layout?: {
    width?: 'full' | 'half' | 'third' | 'quarter';
    order?: number;
    column?: number;
    row?: number;
  };
  conditional?: {
    field: string;
    value: any;
    operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater' | 'less';
  };
  metadata?: {
    createdAt: number;
    updatedAt: number;
    version: string;
    author?: string;
  };
}

export interface FormSchema {
  id: string;
  name: string;
  description?: string;
  version: string;
  fields: FormField[];
  layout?: {
    type: 'single' | 'grid' | 'tabs' | 'steps';
    columns?: number;
    gap?: 'sm' | 'md' | 'lg' | 'xl';
    responsive?: boolean;
  };
  styling?: {
    variant: 'glass' | 'outlined' | 'filled' | 'minimal';
    size: 'sm' | 'md' | 'lg' | 'xl';
    theme?: 'light' | 'dark' | 'auto';
  };
  behavior?: {
    autoSave?: boolean;
    autoSaveInterval?: number;
    showProgress?: boolean;
    allowReset?: boolean;
    confirmBeforeSubmit?: boolean;
  };
  validation?: {
    enableRealTime?: boolean;
    showValidationSummary?: boolean;
    stopOnFirstError?: boolean;
  };
  metadata?: {
    createdAt: number;
    updatedAt: number;
    createdBy?: string;
    tags?: string[];
  };
}

export interface FormBuilderProps {
  // Core Props
  id?: string;
  name?: string;
  schema?: FormSchema;
  defaultSchema?: FormSchema;
  
  // V7.5 Enhanced Variants
  variant?: 'glass' | 'outlined' | 'filled' | 'minimal';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  
  // Builder Configuration
  mode?: 'builder' | 'preview' | 'readonly';
  allowEdit?: boolean;
  allowAddFields?: boolean;
  allowRemoveFields?: boolean;
  allowReorder?: boolean;
  allowDuplicate?: boolean;
  
  // Form Generation
  onSchemaChange?: (schema: FormSchema) => void;
  onFormSubmit?: (data: any, schema: FormSchema) => Promise<any>;
  onFormReset?: () => void;
  onFieldAdd?: (field: FormField) => void;
  onFieldRemove?: (fieldId: string) => void;
  onFieldUpdate?: (fieldId: string, field: FormField) => void;
  onFieldReorder?: (fromIndex: number, toIndex: number) => void;
  
  // Data Management
  formData?: Record<string, any>;
  onFormDataChange?: (data: Record<string, any>) => void;
  
  // Advanced Features
  enableAutoSave?: boolean;
  autoSaveInterval?: number;
  enableDragDrop?: boolean;
  enableExport?: boolean;
  enableImport?: boolean;
  enablePreview?: boolean;
  enableCodeView?: boolean;
  enableValidation?: boolean;
  enableTemplates?: boolean;
  
  // Layout Props
  fullWidth?: boolean;
  className?: string;
  style?: React.CSSProperties;
  builderClassName?: string;
  previewClassName?: string;
  
  // Advanced Props
  'data-testid'?: string;
}

interface FormBuilderState {
  currentSchema: FormSchema;
  formData: Record<string, any>;
  selectedFieldId: string | null;
  draggedFieldId: string | null;
  isPreviewMode: boolean;
  isCodeViewMode: boolean;
  isDirty: boolean;
  lastSavedAt: number | null;
  validationErrors: Record<string, string[]>;
  buildHistory: FormSchema[];
  historyIndex: number;
}

interface FieldTemplate {
  id: string;
  name: string;
  description: string;
  type: FormField['type'];
  icon: React.ReactNode;
  defaultField: Partial<FormField>;
  category: 'basic' | 'advanced' | 'layout' | 'validation';
}

// ===== ALPHA PERFORMANCE OPTIMIZATION: HOOKS =====

const useFormBuilder = (initialSchema?: FormSchema) => {
  const [builderState, setBuilderState] = useState<FormBuilderState>({
    currentSchema: initialSchema || createEmptySchema(),
    formData: {},
    selectedFieldId: null,
    draggedFieldId: null,
    isPreviewMode: false,
    isCodeViewMode: false,
    isDirty: false,
    lastSavedAt: null,
    validationErrors: {},
    buildHistory: [initialSchema || createEmptySchema()],
    historyIndex: 0,
  });

  const generateFieldId = useCallback(() => {
    return `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const addField = useCallback((template: FieldTemplate, position?: number) => {
    const newField: FormField = {
      id: generateFieldId(),
      type: template.type,
      name: `${template.type}_${Date.now()}`,
      label: template.name,
      ...template.defaultField,
      metadata: {
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: '1.0.0',
      },
    };

    setBuilderState(prev => {
      const newFields = [...prev.currentSchema.fields];
      const insertIndex = position !== undefined ? position : newFields.length;
      newFields.splice(insertIndex, 0, newField);

      const newSchema = {
        ...prev.currentSchema,
        fields: newFields,
        metadata: {
          ...prev.currentSchema.metadata,
          updatedAt: Date.now(),
        },
      };

      // Add to history
      const newHistory = prev.buildHistory.slice(0, prev.historyIndex + 1);
      newHistory.push(newSchema);

      return {
        ...prev,
        currentSchema: newSchema,
        selectedFieldId: newField.id,
        isDirty: true,
        buildHistory: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  }, [generateFieldId]);

  const removeField = useCallback((fieldId: string) => {
    setBuilderState(prev => {
      const newFields = prev.currentSchema.fields.filter(field => field.id !== fieldId);
      const newSchema = {
        ...prev.currentSchema,
        fields: newFields,
        metadata: {
          ...prev.currentSchema.metadata,
          updatedAt: Date.now(),
        },
      };

      // Add to history
      const newHistory = prev.buildHistory.slice(0, prev.historyIndex + 1);
      newHistory.push(newSchema);

      return {
        ...prev,
        currentSchema: newSchema,
        selectedFieldId: prev.selectedFieldId === fieldId ? null : prev.selectedFieldId,
        isDirty: true,
        buildHistory: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  }, []);

  const updateField = useCallback((fieldId: string, updates: Partial<FormField>) => {
    setBuilderState(prev => {
      const newFields = prev.currentSchema.fields.map(field =>
        field.id === fieldId
          ? {
              ...field,
              ...updates,
              metadata: {
                ...field.metadata,
                updatedAt: Date.now(),
              },
            }
          : field
      );

      const newSchema = {
        ...prev.currentSchema,
        fields: newFields,
        metadata: {
          ...prev.currentSchema.metadata,
          updatedAt: Date.now(),
        },
      };

      return {
        ...prev,
        currentSchema: newSchema,
        isDirty: true,
      };
    });
  }, []);

  const reorderFields = useCallback((fromIndex: number, toIndex: number) => {
    setBuilderState(prev => {
      const newFields = [...prev.currentSchema.fields];
      const [movedField] = newFields.splice(fromIndex, 1);
      newFields.splice(toIndex, 0, movedField);

      const newSchema = {
        ...prev.currentSchema,
        fields: newFields,
        metadata: {
          ...prev.currentSchema.metadata,
          updatedAt: Date.now(),
        },
      };

      // Add to history
      const newHistory = prev.buildHistory.slice(0, prev.historyIndex + 1);
      newHistory.push(newSchema);

      return {
        ...prev,
        currentSchema: newSchema,
        isDirty: true,
        buildHistory: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  }, []);

  const duplicateField = useCallback((fieldId: string) => {
    setBuilderState(prev => {
      const fieldToDuplicate = prev.currentSchema.fields.find(f => f.id === fieldId);
      if (!fieldToDuplicate) return prev;

      const newField: FormField = {
        ...fieldToDuplicate,
        id: generateFieldId(),
        name: `${fieldToDuplicate.name}_copy`,
        label: `${fieldToDuplicate.label} (Copy)`,
        metadata: {
          createdAt: Date.now(),
          updatedAt: Date.now(),
          version: '1.0.0',
        },
      };

      const fieldIndex = prev.currentSchema.fields.findIndex(f => f.id === fieldId);
      const newFields = [...prev.currentSchema.fields];
      newFields.splice(fieldIndex + 1, 0, newField);

      const newSchema = {
        ...prev.currentSchema,
        fields: newFields,
        metadata: {
          ...prev.currentSchema.metadata,
          updatedAt: Date.now(),
        },
      };

      return {
        ...prev,
        currentSchema: newSchema,
        selectedFieldId: newField.id,
        isDirty: true,
      };
    });
  }, [generateFieldId]);

  const updateFormData = useCallback((fieldName: string, value: any) => {
    setBuilderState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        [fieldName]: value,
      },
    }));
  }, []);

  const resetForm = useCallback(() => {
    setBuilderState(prev => ({
      ...prev,
      formData: {},
      validationErrors: {},
    }));
  }, []);

  const togglePreview = useCallback(() => {
    setBuilderState(prev => ({
      ...prev,
      isPreviewMode: !prev.isPreviewMode,
    }));
  }, []);

  const toggleCodeView = useCallback(() => {
    setBuilderState(prev => ({
      ...prev,
      isCodeViewMode: !prev.isCodeViewMode,
    }));
  }, []);

  const saveSchema = useCallback(() => {
    setBuilderState(prev => ({
      ...prev,
      isDirty: false,
      lastSavedAt: Date.now(),
    }));
  }, []);

  const undo = useCallback(() => {
    setBuilderState(prev => {
      if (prev.historyIndex > 0) {
        const newIndex = prev.historyIndex - 1;
        return {
          ...prev,
          currentSchema: prev.buildHistory[newIndex],
          historyIndex: newIndex,
          isDirty: true,
        };
      }
      return prev;
    });
  }, []);

  const redo = useCallback(() => {
    setBuilderState(prev => {
      if (prev.historyIndex < prev.buildHistory.length - 1) {
        const newIndex = prev.historyIndex + 1;
        return {
          ...prev,
          currentSchema: prev.buildHistory[newIndex],
          historyIndex: newIndex,
          isDirty: true,
        };
      }
      return prev;
    });
  }, []);

  const exportSchema = useCallback(() => {
    return JSON.stringify(builderState.currentSchema, null, 2);
  }, [builderState.currentSchema]);

  const importSchema = useCallback((schemaJson: string) => {
    try {
      const parsedSchema = JSON.parse(schemaJson) as FormSchema;
      setBuilderState(prev => ({
        ...prev,
        currentSchema: parsedSchema,
        isDirty: true,
        selectedFieldId: null,
      }));
      return true;
    } catch (error) {
      console.error('Failed to import schema:', error);
      return false;
    }
  }, []);

  return {
    builderState,
    addField,
    removeField,
    updateField,
    reorderFields,
    duplicateField,
    updateFormData,
    resetForm,
    togglePreview,
    toggleCodeView,
    saveSchema,
    undo,
    redo,
    exportSchema,
    importSchema,
  };
};

// ===== FIELD TEMPLATES =====

const FIELD_TEMPLATES: FieldTemplate[] = [
  {
    id: 'input',
    name: 'Text Input',
    description: 'Single line text input',
    type: 'input',
    icon: <Type size={16} />,
    defaultField: {
      placeholder: 'Enter text...',
      validation: {
        rules: [],
        validateOnChange: true,
        validateOnBlur: true,
      },
    },
    category: 'basic',
  },
  {
    id: 'textarea',
    name: 'Text Area',
    description: 'Multi-line text input',
    type: 'textarea',
    icon: <Box size={16} />,
    defaultField: {
      placeholder: 'Enter description...',
      props: {
        rows: 4,
        autoResize: true,
      },
    },
    category: 'basic',
  },
  {
    id: 'select',
    name: 'Select Dropdown',
    description: 'Dropdown selection',
    type: 'select',
    icon: <List size={16} />,
    defaultField: {
      placeholder: 'Select option...',
      options: [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
        { value: 'option3', label: 'Option 3' },
      ],
    },
    category: 'basic',
  },
  {
    id: 'checkbox',
    name: 'Checkbox Group',
    description: 'Multiple selection checkboxes',
    type: 'checkbox',
    icon: <CheckSquare size={16} />,
    defaultField: {
      options: [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
        { value: 'option3', label: 'Option 3' },
      ],
    },
    category: 'basic',
  },
  {
    id: 'radio',
    name: 'Radio Group',
    description: 'Single selection radio buttons',
    type: 'radio',
    icon: <Circle size={16} />,
    defaultField: {
      options: [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
        { value: 'option3', label: 'Option 3' },
      ],
    },
    category: 'basic',
  },
  {
    id: 'email',
    name: 'Email Input',
    description: 'Email input with validation',
    type: 'validation',
    icon: <Mail size={16} />,
    defaultField: {
      props: {
        type: 'email',
      },
      validation: {
        rules: [
          { name: 'required', message: 'Email is required' },
          { name: 'email', message: 'Please enter a valid email' },
        ],
      },
    },
    category: 'advanced',
  },
  {
    id: 'password',
    name: 'Password Input',
    description: 'Password input with strength validation',
    type: 'validation',
    icon: <Lock size={16} />,
    defaultField: {
      props: {
        type: 'password',
        showPasswordToggle: true,
      },
      validation: {
        rules: [
          { name: 'required', message: 'Password is required' },
          { name: 'minLength', message: 'Password must be at least 8 characters', min: 8 },
        ],
      },
    },
    category: 'advanced',
  },
  {
    id: 'submit',
    name: 'Submit Button',
    description: 'Form submission button',
    type: 'submit',
    icon: <Send size={16} />,
    defaultField: {
      label: 'Submit',
      props: {
        buttonText: 'Submit Form',
        showProgress: true,
        showRetryCount: true,
      },
    },
    category: 'layout',
  },
];

// ===== HELPER FUNCTIONS =====

function createEmptySchema(): FormSchema {
  return {
    id: `schema_${Date.now()}`,
    name: 'New Form',
    version: '1.0.0',
    fields: [],
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
      stopOnFirstError: false,
    },
    metadata: {
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tags: [],
    },
  };
}

// ===== V7.5 ENHANCED: FIELD TEMPLATES COMPONENT =====
const FieldTemplatesPanel: React.FC<{
  onAddField: (template: FieldTemplate) => void;
  size: string;
}> = ({ onAddField, size }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('basic');
  
  const categories = [
    { id: 'basic', name: 'Basic', icon: <Type size={14} /> },
    { id: 'advanced', name: 'Advanced', icon: <Sparkles size={14} /> },
    { id: 'layout', name: 'Layout', icon: <Layout size={14} /> },
    { id: 'validation', name: 'Validation', icon: <Shield size={14} /> },
  ];

  const filteredTemplates = FIELD_TEMPLATES.filter(
    template => template.category === selectedCategory
  );

  return (
    <Layout.Container className="p-4 bg-white border-r border-gray-200">
      <Layout.Row className="justify-between items-center mb-4">
        <h3 style={{
          fontSize: designTokens.typography.fontSize.lg,
          fontWeight: designTokens.typography.fontWeight.semibold,
          color: designTokens.colors.neutral[800],
          margin: 0,
        }}>
          Field Templates
        </h3>
        <Target size={16} className="text-blue-500" />
      </Layout.Row>

      {/* Category Tabs */}
      <div style={{
        display: 'flex',
        marginBottom: designTokens.spacing[4],
        borderBottom: `1px solid ${designTokens.colors.neutral[200]}`,
      }}>
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            style={{
              padding: `${designTokens.spacing[2]} ${designTokens.spacing[3]}`,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: designTokens.typography.fontSize.sm,
              fontWeight: designTokens.typography.fontWeight.medium,
              color: selectedCategory === category.id 
                ? designTokens.colors.blue[600] 
                : designTokens.colors.neutral[600],
              borderBottom: selectedCategory === category.id 
                ? `2px solid ${designTokens.colors.blue[600]}` 
                : '2px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: designTokens.spacing[1],
            }}
          >
            {category.icon}
            {category.name}
          </button>
        ))}
      </div>

      {/* Template List */}
      <div style={{
        display: 'grid',
        gap: designTokens.spacing[2],
      }}>
        {filteredTemplates.map(template => (
          <motion.button
            key={template.id}
            onClick={() => onAddField(template)}
            style={{
              padding: designTokens.spacing[3],
              border: `1px solid ${designTokens.colors.neutral[200]}`,
              borderRadius: designTokens.borderRadius.md,
              background: 'white',
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: designTokens.spacing[3],
            }}
            whileHover={{
              scale: 1.02,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            }}
            whileTap={{ scale: 0.98 }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: designTokens.borderRadius.md,
              backgroundColor: designTokens.colors.blue[100],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: designTokens.colors.blue[600],
            }}>
              {template.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: designTokens.typography.fontSize.sm,
                fontWeight: designTokens.typography.fontWeight.medium,
                color: designTokens.colors.neutral[800],
                marginBottom: designTokens.spacing[1],
              }}>
                {template.name}
              </div>
              <div style={{
                fontSize: designTokens.typography.fontSize.xs,
                color: designTokens.colors.neutral[600],
              }}>
                {template.description}
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </Layout.Container>
  );
};

// ===== V7.5 ENHANCED: FIELD EDITOR COMPONENT =====
const FieldEditor: React.FC<{
  field: FormField | null;
  onUpdateField: (fieldId: string, updates: Partial<FormField>) => void;
  onRemoveField: (fieldId: string) => void;
  onDuplicateField: (fieldId: string) => void;
  size: string;
}> = ({ field, onUpdateField, onRemoveField, onDuplicateField, size }) => {
  if (!field) {
    return (
      <Layout.Container className="p-4 bg-gray-50 border-l border-gray-200">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '200px',
          color: designTokens.colors.neutral[500],
        }}>
          <Settings size={32} className="mb-2" />
          <p style={{ margin: 0, fontSize: designTokens.typography.fontSize.sm }}>
            Select a field to edit properties
          </p>
        </div>
      </Layout.Container>
    );
  }

  const handleUpdateField = (key: string, value: any) => {
    onUpdateField(field.id, { [key]: value });
  };

  const handleUpdateProps = (key: string, value: any) => {
    onUpdateField(field.id, {
      props: {
        ...field.props,
        [key]: value,
      },
    });
  };

  return (
    <Layout.Container className="p-4 bg-white border-l border-gray-200">
      <Layout.Row className="justify-between items-center mb-4">
        <h3 style={{
          fontSize: designTokens.typography.fontSize.lg,
          fontWeight: designTokens.typography.fontWeight.semibold,
          color: designTokens.colors.neutral[800],
          margin: 0,
        }}>
          Field Settings
        </h3>
        <Layout.Row>
          <button
            onClick={() => onDuplicateField(field.id)}
            style={{
              padding: designTokens.spacing[1],
              border: `1px solid ${designTokens.colors.neutral[300]}`,
              borderRadius: designTokens.borderRadius.sm,
              background: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Duplicate field"
          >
            <Copy size={14} />
          </button>
          <button
            onClick={() => onRemoveField(field.id)}
            style={{
              padding: designTokens.spacing[1],
              border: `1px solid ${designTokens.colors.red[300]}`,
              borderRadius: designTokens.borderRadius.sm,
              background: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: designTokens.colors.red[600],
            }}
            title="Remove field"
          >
            <Trash2 size={14} />
          </button>
        </Layout.Row>
      </Layout.Row>

      <Layout.Container className="space-y-4">
        {/* Basic Properties */}
        <div>
          <label style={{
            display: 'block',
            fontSize: designTokens.typography.fontSize.sm,
            fontWeight: designTokens.typography.fontWeight.medium,
            color: designTokens.colors.neutral[700],
            marginBottom: designTokens.spacing[1],
          }}>
            Label
          </label>
          <input
            type="text"
            value={field.label || ''}
            onChange={(e) => handleUpdateField('label', e.target.value)}
            style={{
              width: '100%',
              padding: designTokens.spacing[2],
              border: `1px solid ${designTokens.colors.neutral[300]}`,
              borderRadius: designTokens.borderRadius.sm,
              fontSize: designTokens.typography.fontSize.sm,
            }}
          />
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: designTokens.typography.fontSize.sm,
            fontWeight: designTokens.typography.fontWeight.medium,
            color: designTokens.colors.neutral[700],
            marginBottom: designTokens.spacing[1],
          }}>
            Name
          </label>
          <input
            type="text"
            value={field.name}
            onChange={(e) => handleUpdateField('name', e.target.value)}
            style={{
              width: '100%',
              padding: designTokens.spacing[2],
              border: `1px solid ${designTokens.colors.neutral[300]}`,
              borderRadius: designTokens.borderRadius.sm,
              fontSize: designTokens.typography.fontSize.sm,
            }}
          />
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: designTokens.typography.fontSize.sm,
            fontWeight: designTokens.typography.fontWeight.medium,
            color: designTokens.colors.neutral[700],
            marginBottom: designTokens.spacing[1],
          }}>
            Placeholder
          </label>
          <input
            type="text"
            value={field.placeholder || ''}
            onChange={(e) => handleUpdateField('placeholder', e.target.value)}
            style={{
              width: '100%',
              padding: designTokens.spacing[2],
              border: `1px solid ${designTokens.colors.neutral[300]}`,
              borderRadius: designTokens.borderRadius.sm,
              fontSize: designTokens.typography.fontSize.sm,
            }}
          />
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: designTokens.typography.fontSize.sm,
            fontWeight: designTokens.typography.fontWeight.medium,
            color: designTokens.colors.neutral[700],
            marginBottom: designTokens.spacing[1],
          }}>
            Helper Text
          </label>
          <input
            type="text"
            value={field.helperText || ''}
            onChange={(e) => handleUpdateField('helperText', e.target.value)}
            style={{
              width: '100%',
              padding: designTokens.spacing[2],
              border: `1px solid ${designTokens.colors.neutral[300]}`,
              borderRadius: designTokens.borderRadius.sm,
              fontSize: designTokens.typography.fontSize.sm,
            }}
          />
        </div>

        {/* Checkboxes */}
        <Layout.Row>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: designTokens.spacing[2],
            fontSize: designTokens.typography.fontSize.sm,
            cursor: 'pointer',
          }}>
            <input
              type="checkbox"
              checked={field.required || false}
              onChange={(e) => handleUpdateField('required', e.target.checked)}
            />
            Required
          </label>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: designTokens.spacing[2],
            fontSize: designTokens.typography.fontSize.sm,
            cursor: 'pointer',
          }}>
            <input
              type="checkbox"
              checked={field.disabled || false}
              onChange={(e) => handleUpdateField('disabled', e.target.checked)}
            />
            Disabled
          </label>
        </Layout.Row>

        {/* Options for select/checkbox/radio */}
        {(field.type === 'select' || field.type === 'checkbox' || field.type === 'radio') && (
          <div>
            <label style={{
              display: 'block',
              fontSize: designTokens.typography.fontSize.sm,
              fontWeight: designTokens.typography.fontWeight.medium,
              color: designTokens.colors.neutral[700],
              marginBottom: designTokens.spacing[1],
            }}>
              Options
            </label>
            <div style={{
              border: `1px solid ${designTokens.colors.neutral[300]}`,
              borderRadius: designTokens.borderRadius.sm,
              padding: designTokens.spacing[2],
              backgroundColor: designTokens.colors.neutral[50],
            }}>
              {field.options?.map((option, index) => (
                <Layout.Row key={index} className="mb-2">
                  <input
                    type="text"
                    value={option.label}
                    onChange={(e) => {
                      const newOptions = [...(field.options || [])];
                      newOptions[index] = { ...option, label: e.target.value };
                      handleUpdateField('options', newOptions);
                    }}
                    style={{
                      flex: 1,
                      padding: designTokens.spacing[1],
                      border: `1px solid ${designTokens.colors.neutral[300]}`,
                      borderRadius: designTokens.borderRadius.sm,
                      fontSize: designTokens.typography.fontSize.sm,
                    }}
                    placeholder="Option label"
                  />
                  <button
                    onClick={() => {
                      const newOptions = field.options?.filter((_, i) => i !== index);
                      handleUpdateField('options', newOptions);
                    }}
                    style={{
                      padding: designTokens.spacing[1],
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      color: designTokens.colors.red[600],
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                </Layout.Row>
              ))}
              <button
                onClick={() => {
                  const newOptions = [
                    ...(field.options || []),
                    { value: `option${(field.options?.length || 0) + 1}`, label: 'New Option' },
                  ];
                  handleUpdateField('options', newOptions);
                }}
                style={{
                  padding: designTokens.spacing[1],
                  border: `1px dashed ${designTokens.colors.neutral[400]}`,
                  borderRadius: designTokens.borderRadius.sm,
                  background: 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: designTokens.spacing[1],
                  fontSize: designTokens.typography.fontSize.sm,
                  color: designTokens.colors.neutral[600],
                }}
              >
                <Plus size={14} />
                Add Option
              </button>
            </div>
          </div>
        )}
      </Layout.Container>
    </Layout.Container>
  );
};

// ===== V7.5 ENHANCED: FORM RENDERER COMPONENT =====
const FormRenderer: React.FC<{
  schema: FormSchema;
  formData: Record<string, any>;
  onFormDataChange: (name: string, value: any) => void;
  onFormSubmit?: (data: any) => Promise<any>;
  selectedFieldId?: string | null;
  onFieldSelect?: (fieldId: string) => void;
  mode: 'builder' | 'preview' | 'readonly';
}> = ({ schema, formData, onFormDataChange, onFormSubmit, selectedFieldId, onFieldSelect, mode }) => {
  const renderField = (field: FormField) => {
    const isSelected = selectedFieldId === field.id;
    const baseProps = {
      key: field.id,
      name: field.name,
      label: field.label,
      placeholder: field.placeholder,
      helperText: field.helperText,
      required: field.required,
      disabled: field.disabled,
      value: formData[field.name] || field.defaultValue,
      onChange: (value: any) => onFormDataChange(field.name, value),
      variant: schema.styling?.variant || 'outlined',
      size: schema.styling?.size || 'md',
      ...field.props,
    };

    const wrapperStyle = {
      position: 'relative' as const,
      border: mode === 'builder' && isSelected 
        ? `2px solid ${designTokens.colors.blue[500]}` 
        : mode === 'builder' 
        ? '2px solid transparent' 
        : undefined,
      borderRadius: designTokens.borderRadius.md,
      padding: mode === 'builder' ? designTokens.spacing[1] : undefined,
      cursor: mode === 'builder' ? 'pointer' : undefined,
    };

    const handleClick = (e: React.MouseEvent) => {
      if (mode === 'builder' && onFieldSelect) {
        e.stopPropagation();
        onFieldSelect(field.id);
      }
    };

    let component;
    switch (field.type) {
      case 'input':
        component = <FormInput {...baseProps} />;
        break;
      case 'textarea':
        component = <FormTextarea {...baseProps} />;
        break;
      case 'select':
        component = <FormSelect {...baseProps} options={field.options || []} />;
        break;
      case 'checkbox':
        component = <FormCheckbox {...baseProps} options={field.options || []} />;
        break;
      case 'radio':
        component = <FormRadio {...baseProps} options={field.options || []} />;
        break;
      case 'validation':
        component = <FormValidation {...baseProps} />;
        break;
      case 'submit':
        component = (
          <FormSubmit
            {...baseProps}
            onSubmit={onFormSubmit}
            formData={formData}
            buttonText={field.props?.buttonText || 'Submit'}
          />
        );
        break;
      default:
        component = <div>Unknown field type: {field.type}</div>;
    }

    return (
      <div style={wrapperStyle} onClick={handleClick}>
        {component}
        {mode === 'builder' && isSelected && (
          <div style={{
            position: 'absolute',
            top: -8,
            right: -8,
            backgroundColor: designTokens.colors.blue[500],
            color: 'white',
            borderRadius: designTokens.borderRadius.full,
            width: 20,
            height: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: designTokens.typography.fontSize.xs,
            fontWeight: designTokens.typography.fontWeight.bold,
          }}>
            ✓
          </div>
        )}
      </div>
    );
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: schema.layout?.type === 'grid' 
      ? `repeat(${schema.layout.columns || 1}, 1fr)` 
      : '1fr',
    gap: schema.layout?.gap === 'sm' ? designTokens.spacing[2] :
         schema.layout?.gap === 'lg' ? designTokens.spacing[6] :
         schema.layout?.gap === 'xl' ? designTokens.spacing[8] :
         designTokens.spacing[4],
  };

  return (
    <div style={gridStyle}>
      {schema.fields.map(renderField)}
    </div>
  );
};

// ===== MAIN COMPONENT =====

const FormBuilder = memo(forwardRef<HTMLDivElement, FormBuilderProps>((props, ref) => {
  const {
    // Core props
    id,
    name,
    schema: externalSchema,
    defaultSchema,
    
    // V7.5 Enhanced props
    variant = 'outlined',
    size = 'md',
    
    // Builder configuration
    mode = 'builder',
    allowEdit = true,
    allowAddFields = true,
    allowRemoveFields = true,
    allowReorder = true,
    allowDuplicate = true,
    
    // Form generation
    onSchemaChange,
    onFormSubmit,
    onFormReset,
    onFieldAdd,
    onFieldRemove,
    onFieldUpdate,
    onFieldReorder,
    
    // Data management
    formData: externalFormData,
    onFormDataChange,
    
    // Advanced features
    enableAutoSave = false,
    autoSaveInterval = 5000,
    enableDragDrop = true,
    enableExport = true,
    enableImport = true,
    enablePreview = true,
    enableCodeView = true,
    enableValidation = true,
    enableTemplates = true,
    
    // Layout props
    fullWidth = true,
    className = '',
    style = {},
    builderClassName = '',
    previewClassName = '',
    
    // Advanced props
    'data-testid': testId,
    
    ...restProps
  } = props;

  // ===== HOOKS & STATE =====
  const builderId = useId();
  const finalId = id || builderId;
  
  const {
    builderState,
    addField,
    removeField,
    updateField,
    reorderFields,
    duplicateField,
    updateFormData,
    resetForm,
    togglePreview,
    toggleCodeView,
    saveSchema,
    undo,
    redo,
    exportSchema,
    importSchema,
  } = useFormBuilder(externalSchema || defaultSchema);

  // ===== EFFECTS =====
  useEffect(() => {
    if (onSchemaChange) {
      onSchemaChange(builderState.currentSchema);
    }
  }, [builderState.currentSchema, onSchemaChange]);

  useEffect(() => {
    if (onFormDataChange) {
      onFormDataChange(builderState.formData);
    }
  }, [builderState.formData, onFormDataChange]);

  // Auto-save functionality
  useEffect(() => {
    if (enableAutoSave && builderState.isDirty) {
      const interval = setInterval(() => {
        saveSchema();
      }, autoSaveInterval);
      
      return () => clearInterval(interval);
    }
  }, [enableAutoSave, builderState.isDirty, autoSaveInterval, saveSchema]);

  // ===== EVENT HANDLERS =====
  const handleAddField = useCallback((template: FieldTemplate) => {
    addField(template);
    onFieldAdd?.(template.defaultField as FormField);
  }, [addField, onFieldAdd]);

  const handleRemoveField = useCallback((fieldId: string) => {
    removeField(fieldId);
    onFieldRemove?.(fieldId);
  }, [removeField, onFieldRemove]);

  const handleUpdateField = useCallback((fieldId: string, updates: Partial<FormField>) => {
    updateField(fieldId, updates);
    onFieldUpdate?.(fieldId, updates as FormField);
  }, [updateField, onFieldUpdate]);

  const handleReorderFields = useCallback((fromIndex: number, toIndex: number) => {
    reorderFields(fromIndex, toIndex);
    onFieldReorder?.(fromIndex, toIndex);
  }, [reorderFields, onFieldReorder]);

  const handleFormSubmit = useCallback(async (data: any) => {
    if (onFormSubmit) {
      return await onFormSubmit(data, builderState.currentSchema);
    }
  }, [onFormSubmit, builderState.currentSchema]);

  const handleExport = useCallback(() => {
    const schemaJson = exportSchema();
    const blob = new Blob([schemaJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${builderState.currentSchema.name.replace(/\s+/g, '_')}_schema.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [exportSchema, builderState.currentSchema.name]);

  const handleImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (importSchema(content)) {
          console.log('Schema imported successfully');
        } else {
          console.error('Failed to import schema');
        }
      };
      reader.readAsText(file);
    }
  }, [importSchema]);

  // ===== STYLES =====
  const containerStyles = {
    width: fullWidth ? '100%' : 'auto',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    ...style,
  };

  // ===== RENDER =====
  return (
    <Layout.Section ref={ref} style={containerStyles} className={className} data-testid={testId}>
      {/* Header */}
      <Layout.Row className="justify-between items-center p-4 bg-white border-b border-gray-200">
        <Layout.Row>
          <h1 style={{
            fontSize: designTokens.typography.fontSize.xl,
            fontWeight: designTokens.typography.fontWeight.bold,
            color: designTokens.colors.neutral[800],
            margin: 0,
          }}>
            {builderState.currentSchema.name}
          </h1>
          {builderState.isDirty && (
            <span style={{
              fontSize: designTokens.typography.fontSize.xs,
              color: designTokens.colors.orange[600],
              backgroundColor: designTokens.colors.orange[100],
              padding: `2px 8px`,
              borderRadius: designTokens.borderRadius.full,
              marginLeft: designTokens.spacing[2],
            }}>
              Unsaved
            </span>
          )}
        </Layout.Row>
        
        <Layout.Row>
          {/* Actions */}
          <button
            onClick={undo}
            disabled={builderState.historyIndex <= 0}
            style={{
              padding: designTokens.spacing[2],
              border: `1px solid ${designTokens.colors.neutral[300]}`,
              borderRadius: designTokens.borderRadius.sm,
              background: 'white',
              cursor: builderState.historyIndex <= 0 ? 'not-allowed' : 'pointer',
              opacity: builderState.historyIndex <= 0 ? 0.5 : 1,
            }}
            title="Undo"
          >
            <RotateCcw size={16} />
          </button>
          
          <button
            onClick={redo}
            disabled={builderState.historyIndex >= builderState.buildHistory.length - 1}
            style={{
              padding: designTokens.spacing[2],
              border: `1px solid ${designTokens.colors.neutral[300]}`,
              borderRadius: designTokens.borderRadius.sm,
              background: 'white',
              cursor: builderState.historyIndex >= builderState.buildHistory.length - 1 ? 'not-allowed' : 'pointer',
              opacity: builderState.historyIndex >= builderState.buildHistory.length - 1 ? 0.5 : 1,
            }}
            title="Redo"
          >
            <RotateCcw size={16} style={{ transform: 'scaleX(-1)' }} />
          </button>
          
          {enablePreview && (
            <button
              onClick={togglePreview}
              style={{
                padding: `${designTokens.spacing[2]} ${designTokens.spacing[3]}`,
                border: `1px solid ${designTokens.colors.neutral[300]}`,
                borderRadius: designTokens.borderRadius.sm,
                background: builderState.isPreviewMode ? designTokens.colors.blue[100] : 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: designTokens.spacing[1],
                fontSize: designTokens.typography.fontSize.sm,
              }}
            >
              <Eye size={16} />
              {builderState.isPreviewMode ? 'Edit' : 'Preview'}
            </button>
          )}
          
          {enableCodeView && (
            <button
              onClick={toggleCodeView}
              style={{
                padding: `${designTokens.spacing[2]} ${designTokens.spacing[3]}`,
                border: `1px solid ${designTokens.colors.neutral[300]}`,
                borderRadius: designTokens.borderRadius.sm,
                background: builderState.isCodeViewMode ? designTokens.colors.purple[100] : 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: designTokens.spacing[1],
                fontSize: designTokens.typography.fontSize.sm,
              }}
            >
              <Code size={16} />
              Code
            </button>
          )}
          
          {enableExport && (
            <button
              onClick={handleExport}
              style={{
                padding: `${designTokens.spacing[2]} ${designTokens.spacing[3]}`,
                border: `1px solid ${designTokens.colors.neutral[300]}`,
                borderRadius: designTokens.borderRadius.sm,
                background: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: designTokens.spacing[1],
                fontSize: designTokens.typography.fontSize.sm,
              }}
            >
              <Download size={16} />
              Export
            </button>
          )}
          
          {enableImport && (
            <label style={{
              padding: `${designTokens.spacing[2]} ${designTokens.spacing[3]}`,
              border: `1px solid ${designTokens.colors.neutral[300]}`,
              borderRadius: designTokens.borderRadius.sm,
              background: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: designTokens.spacing[1],
              fontSize: designTokens.typography.fontSize.sm,
            }}>
              <Upload size={16} />
              Import
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                style={{ display: 'none' }}
              />
            </label>
          )}
          
          <button
            onClick={saveSchema}
            style={{
              padding: `${designTokens.spacing[2]} ${designTokens.spacing[3]}`,
              border: `1px solid ${designTokens.colors.green[300]}`,
              borderRadius: designTokens.borderRadius.sm,
              background: designTokens.colors.green[500],
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: designTokens.spacing[1],
              fontSize: designTokens.typography.fontSize.sm,
            }}
          >
            <Save size={16} />
            Save
          </button>
        </Layout.Row>
      </Layout.Row>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {builderState.isCodeViewMode ? (
          /* Code View */
          <div style={{ flex: 1, padding: designTokens.spacing[4] }}>
            <pre style={{
              width: '100%',
              height: '100%',
              padding: designTokens.spacing[4],
              backgroundColor: designTokens.colors.neutral[900],
              color: designTokens.colors.neutral[100],
              borderRadius: designTokens.borderRadius.md,
              fontSize: designTokens.typography.fontSize.sm,
              fontFamily: 'Monaco, Consolas, monospace',
              overflow: 'auto',
              margin: 0,
            }}>
              {JSON.stringify(builderState.currentSchema, null, 2)}
            </pre>
          </div>
        ) : (
          <>
            {/* Left Panel - Templates */}
            {!builderState.isPreviewMode && enableTemplates && (
              <div style={{ width: '280px', flexShrink: 0 }}>
                <FieldTemplatesPanel
                  onAddField={handleAddField}
                  size={size}
                />
              </div>
            )}

            {/* Center Panel - Form */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ 
                flex: 1, 
                padding: designTokens.spacing[6], 
                backgroundColor: designTokens.colors.neutral[50],
                overflow: 'auto',
              }}>
                <div style={{
                  maxWidth: '800px',
                  margin: '0 auto',
                  backgroundColor: 'white',
                  borderRadius: designTokens.borderRadius.lg,
                  padding: designTokens.spacing[6],
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}>
                  {builderState.currentSchema.fields.length === 0 ? (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '300px',
                      color: designTokens.colors.neutral[500],
                      textAlign: 'center',
                    }}>
                      <Layout size={48} className="mb-4" />
                      <h3 style={{ margin: 0, fontSize: designTokens.typography.fontSize.lg }}>
                        No fields added yet
                      </h3>
                      <p style={{ margin: `${designTokens.spacing[2]} 0 0`, fontSize: designTokens.typography.fontSize.sm }}>
                        Select a field template from the left panel to get started
                      </p>
                    </div>
                  ) : (
                    <FormRenderer
                      schema={builderState.currentSchema}
                      formData={externalFormData || builderState.formData}
                      onFormDataChange={updateFormData}
                      onFormSubmit={handleFormSubmit}
                      selectedFieldId={builderState.selectedFieldId}
                      onFieldSelect={(fieldId) => {
                        builderState.selectedFieldId = fieldId;
                      }}
                      mode={builderState.isPreviewMode ? 'preview' : 'builder'}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Right Panel - Field Editor */}
            {!builderState.isPreviewMode && allowEdit && (
              <div style={{ width: '320px', flexShrink: 0 }}>
                <FieldEditor
                  field={builderState.currentSchema.fields.find(f => f.id === builderState.selectedFieldId) || null}
                  onUpdateField={handleUpdateField}
                  onRemoveField={handleRemoveField}
                  onDuplicateField={duplicateField}
                  size={size}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Status Bar */}
      <Layout.Row className="justify-between items-center p-2 bg-gray-100 border-t border-gray-200 text-sm text-gray-600">
        <Layout.Row>
          <span>{builderState.currentSchema.fields.length} fields</span>
          <span>•</span>
          <span>Version {builderState.currentSchema.version}</span>
          {builderState.lastSavedAt && (
            <>
              <span>•</span>
              <span>Last saved: {new Date(builderState.lastSavedAt).toLocaleTimeString()}</span>
            </>
          )}
        </Layout.Row>
        
        <Layout.Row>
          <Sparkles size={14} className="text-yellow-500" />
          <span>FormBuilder V7.5 Enhanced</span>
        </Layout.Row>
      </Layout.Row>
    </Layout.Section>
  );
}));

FormBuilder.displayName = 'FormBuilder';

export default FormBuilder; 