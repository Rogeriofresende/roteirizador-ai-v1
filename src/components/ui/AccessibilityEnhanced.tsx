import React, { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  Volume2, 
  VolumeX, 
  Keyboard, 
  MousePointer,
  Type,
  Contrast,
  ChevronDown,
  ChevronUp,
  Info,
  AlertCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';

// Accessibility Context
interface AccessibilityContextType {
  highContrast: boolean;
  reducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  keyboardNavigation: boolean;
  screenReader: boolean;
  setHighContrast: (value: boolean) => void;
  setReducedMotion: (value: boolean) => void;
  setFontSize: (size: 'small' | 'medium' | 'large' | 'extra-large') => void;
  setKeyboardNavigation: (value: boolean) => void;
  setScreenReader: (value: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};

// Accessibility Provider
export const AccessibilityProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [highContrast, setHighContrast] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessibility-high-contrast') === 'true';
    }
    return false;
  });

  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
             localStorage.getItem('accessibility-reduced-motion') === 'true';
    }
    return false;
  });

  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large' | 'extra-large'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('accessibility-font-size') as any) || 'medium';
    }
    return 'medium';
  });

  const [keyboardNavigation, setKeyboardNavigation] = useState(false);
  const [screenReader, setScreenReader] = useState(false);

  // Apply accessibility settings
  useEffect(() => {
    const root = document.documentElement;
    
    // High contrast
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    localStorage.setItem('accessibility-high-contrast', highContrast.toString());

    // Reduced motion
    if (reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
    localStorage.setItem('accessibility-reduced-motion', reducedMotion.toString());

    // Font size
    root.className = root.className.replace(/font-size-\w+/g, '');
    root.classList.add(`font-size-${fontSize}`);
    localStorage.setItem('accessibility-font-size', fontSize);

  }, [highContrast, reducedMotion, fontSize]);

  // Detect keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setKeyboardNavigation(true);
      }
    };

    const handleMouseDown = () => {
      setKeyboardNavigation(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  const value = {
    highContrast,
    reducedMotion,
    fontSize,
    keyboardNavigation,
    screenReader,
    setHighContrast,
    setReducedMotion,
    setFontSize,
    setKeyboardNavigation,
    setScreenReader
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};

// Skip Navigation Component
export const SkipNavigation: React.FC<{
  links: Array<{ href: string; label: string }>;
}> = ({ links }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="sr-only focus-within:not-sr-only">
      <div className="fixed top-0 left-0 z-50 bg-blue-600 text-white p-2 space-x-2">
        {links.map((link, index) => (
          <a
            key={index}
            href={link.href}
            className="underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
            onFocus={() => setIsVisible(true)}
            onBlur={() => setIsVisible(false)}
          >
            {link.label}
          </a>
        ))}
      </div>
    </div>
  );
};

// Screen Reader Only Text
export const ScreenReaderOnly: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <span className="sr-only">
      {children}
    </span>
  );
};

// Accessible Button with Enhanced States
export const AccessibleButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  ariaLabel?: string;
  ariaDescribedBy?: string;
  className?: string;
}> = ({ 
  children, 
  onClick, 
  disabled = false, 
  type = 'button',
  variant = 'primary',
  size = 'md',
  ariaLabel,
  ariaDescribedBy,
  className 
}) => {
  const { keyboardNavigation, reducedMotion } = useAccessibility();
  const [isPressed, setIsPressed] = useState(false);

  const getVariantClasses = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500';
      case 'danger':
        return 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500';
      default:
        return 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-2 text-sm min-h-[36px] min-w-[36px]';
      case 'lg':
        return 'px-8 py-4 text-lg min-h-[48px] min-w-[48px]';
      default:
        return 'px-4 py-3 min-h-[44px] min-w-[44px]';
    }
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      whileHover={!disabled && !reducedMotion ? { scale: 1.02 } : {}}
      whileTap={!disabled && !reducedMotion ? { scale: 0.98 } : {}}
      className={cn(
        'font-medium rounded-lg transition-all duration-200 relative',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        keyboardNavigation ? 'focus:ring-2' : 'focus:ring-1',
        getVariantClasses(),
        getSizeClasses(),
        disabled && 'opacity-50 cursor-not-allowed',
        isPressed && 'transform scale-95',
        className
      )}
    >
      {children}
      
      {/* High contrast border for keyboard focus */}
      {keyboardNavigation && (
        <div className="absolute inset-0 border-2 border-yellow-400 rounded-lg pointer-events-none opacity-0 focus-within:opacity-100" />
      )}
    </motion.button>
  );
};

// Accessible Form Input
export const AccessibleInput: React.FC<{
  label: string;
  type?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
}> = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  required = false,
  error,
  helpText,
  disabled = false,
  id,
  className 
}) => {
  const generatedId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${generatedId}-error`;
  const helpId = `${generatedId}-help`;
  const { keyboardNavigation } = useAccessibility();

  return (
    <div className={cn('space-y-2', className)}>
      <label
        htmlFor={generatedId}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && (
          <>
            <span className="text-red-500 ml-1" aria-label="campo obrigatório">*</span>
            <ScreenReaderOnly>(obrigatório)</ScreenReaderOnly>
          </>
        )}
      </label>
      
      <input
        id={generatedId}
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={cn(
          error && errorId,
          helpText && helpId
        )}
        className={cn(
          'w-full px-3 py-2 border border-gray-300 rounded-lg',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
          'placeholder:text-gray-400',
          'min-h-[44px]', // Touch target size
          error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
          disabled && 'bg-gray-100 cursor-not-allowed opacity-50',
          keyboardNavigation && 'focus:ring-2 focus:ring-offset-1'
        )}
      />
      
      {helpText && (
        <p id={helpId} className="text-sm text-gray-600">
          {helpText}
        </p>
      )}
      
      {error && (
        <p id={errorId} className="text-sm text-red-600 flex items-center space-x-1">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

// Accessible Modal with Focus Management
export const AccessibleModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}> = ({ isOpen, onClose, title, children, className }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const { reducedMotion } = useAccessibility();

  // Focus management
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focus the modal after it opens
      setTimeout(() => {
        const firstFocusable = modalRef.current?.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as HTMLElement;
        firstFocusable?.focus();
      }, 100);
    } else {
      // Return focus to previous element
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);

  // Trap focus within modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        const focusableElements = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <motion.div
        ref={modalRef}
        initial={reducedMotion ? {} : { opacity: 0, scale: 0.9 }}
        animate={reducedMotion ? {} : { opacity: 1, scale: 1 }}
        exit={reducedMotion ? {} : { opacity: 0, scale: 0.9 }}
        className={cn(
          'bg-white rounded-lg shadow-xl max-w-md w-full m-4 max-h-[90vh] overflow-y-auto',
          className
        )}
      >
        <div className="p-6">
          <h2 id="modal-title" className="text-xl font-semibold text-gray-900 mb-4">
            {title}
          </h2>
          {children}
        </div>
      </motion.div>
    </div>
  );
};

// Accessible Dropdown with Keyboard Navigation
export const AccessibleDropdown: React.FC<{
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}> = ({ trigger, children, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { reducedMotion } = useAccessibility();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {trigger}
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={reducedMotion ? {} : { opacity: 0, y: -10 }}
            animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
            exit={reducedMotion ? {} : { opacity: 0, y: -10 }}
            className="absolute z-10 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[200px]"
            role="menu"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Accessibility Settings Panel
export const AccessibilityPanel: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const {
    highContrast,
    reducedMotion,
    fontSize,
    setHighContrast,
    setReducedMotion,
    setFontSize
  } = useAccessibility();

  const fontSizeOptions = [
    { value: 'small', label: 'Pequeno' },
    { value: 'medium', label: 'Médio' },
    { value: 'large', label: 'Grande' },
    { value: 'extra-large', label: 'Extra Grande' }
  ];

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      title="Configurações de Acessibilidade"
      className="max-w-lg"
    >
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Visual</h3>
          
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="high-contrast" className="font-medium text-gray-700">
                Alto Contraste
              </label>
              <p className="text-sm text-gray-600">
                Aumenta o contraste para melhor visibilidade
              </p>
            </div>
            <button
              id="high-contrast"
              onClick={() => setHighContrast(!highContrast)}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                highContrast ? 'bg-blue-600' : 'bg-gray-200'
              )}
              role="switch"
              aria-checked={highContrast}
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  highContrast ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="reduced-motion" className="font-medium text-gray-700">
                Reduzir Animações
              </label>
              <p className="text-sm text-gray-600">
                Diminui ou remove animações e transições
              </p>
            </div>
            <button
              id="reduced-motion"
              onClick={() => setReducedMotion(!reducedMotion)}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                reducedMotion ? 'bg-blue-600' : 'bg-gray-200'
              )}
              role="switch"
              aria-checked={reducedMotion}
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  reducedMotion ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Texto</h3>
          
          <div>
            <label htmlFor="font-size" className="block font-medium text-gray-700 mb-2">
              Tamanho da Fonte
            </label>
            <select
              id="font-size"
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {fontSizeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <AccessibleButton
            variant="secondary"
            onClick={onClose}
          >
            Fechar
          </AccessibleButton>
        </div>
      </div>
    </AccessibleModal>
  );
};

// Floating Accessibility Button
export const AccessibilityFloatingButton: React.FC = () => {
  const [showPanel, setShowPanel] = useState(false);
  const { reducedMotion } = useAccessibility();

  return (
    <>
      <motion.button
        initial={reducedMotion ? {} : { scale: 0 }}
        animate={reducedMotion ? {} : { scale: 1 }}
        transition={reducedMotion ? {} : { delay: 1, type: "spring" }}
        onClick={() => setShowPanel(true)}
        className="fixed bottom-6 left-6 z-40 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="Abrir configurações de acessibilidade"
        title="Configurações de Acessibilidade"
      >
        <Eye className="w-6 h-6" />
      </motion.button>

      <AccessibilityPanel
        isOpen={showPanel}
        onClose={() => setShowPanel(false)}
      />
    </>
  );
}; 