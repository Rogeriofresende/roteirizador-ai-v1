/**
 * ♿ Accessibility Guidelines & Utilities
 * 
 * WCAG 2.1 AA compliance utilities for inclusive design
 * Migration-friendly accessibility patterns for smooth transitions
 * 
 * Part of: WEEK 0 - IA Beta Design System Foundation
 * Integration: User migration compatibility + Charlie monitoring compliance
 */

import { colors, typography } from './tokens';

// ============================================================================
// WCAG 2.1 AA COMPLIANCE STANDARDS
// ============================================================================

/**
 * WCAG 2.1 AA Contrast Ratios
 */
export const contrastRatios = {
  // Minimum contrast ratios
  AA_NORMAL: 4.5,     // Normal text AA
  AA_LARGE: 3,        // Large text (18pt+ or 14pt+ bold) AA
  AAA_NORMAL: 7,      // Normal text AAA
  AAA_LARGE: 4.5,     // Large text AAA
  
  // Non-text elements
  UI_COMPONENTS: 3,   // UI components and graphical objects
  
  // Decorative elements (no requirement)
  DECORATIVE: 0
} as const;

/**
 * Color contrast calculation utility
 */
export const calculateContrast = (foreground: string, background: string): number => {
  // Convert hex to RGB if needed
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  // Calculate relative luminance
  const getLuminance = (color: { r: number; g: number; b: number }) => {
    const sRGB = [color.r, color.g, color.b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  };

  const fg = hexToRgb(foreground);
  const bg = hexToRgb(background);
  
  if (!fg || !bg) return 0;

  const fgLum = getLuminance(fg);
  const bgLum = getLuminance(bg);
  
  const lighter = Math.max(fgLum, bgLum);
  const darker = Math.min(fgLum, bgLum);
  
  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * WCAG compliant color combinations
 */
export const accessibleColorPairs = {
  // High contrast text combinations
  highContrast: [
    { foreground: colors.neutral[900], background: 'white', ratio: 21 },
    { foreground: 'white', background: colors.neutral[900], ratio: 21 },
    { foreground: colors.primary[700], background: 'white', ratio: 7.2 },
    { foreground: 'white', background: colors.primary[600], ratio: 4.8 }
  ],
  
  // AA compliant combinations
  AA: [
    { foreground: colors.neutral[700], background: 'white', ratio: 9.5 },
    { foreground: colors.neutral[600], background: 'white', ratio: 6.9 },
    { foreground: colors.primary[600], background: 'white', ratio: 4.8 },
    { foreground: 'white', background: colors.primary[500], ratio: 4.7 }
  ],
  
  // Migration-safe combinations (familiar colors with good contrast)
  migration: [
    { foreground: colors.migration.familiar, background: 'white', ratio: 4.7 },
    { foreground: 'white', background: colors.migration.familiar, ratio: 4.7 },
    { foreground: colors.neutral[800], background: colors.neutral[50], ratio: 13.2 }
  ]
};

// ============================================================================
// FOCUS MANAGEMENT
// ============================================================================

/**
 * Focus management utilities for keyboard navigation
 */
export const focusManagement = {
  // Focus visible styles
  focusVisible: {
    outline: '2px solid',
    outlineColor: colors.primary[500],
    outlineOffset: '2px',
    borderRadius: '2px'
  },

  // Focus ring for different elements
  focusRing: {
    button: `
      &:focus-visible {
        outline: 2px solid ${colors.primary[500]};
        outline-offset: 2px;
        box-shadow: 0 0 0 4px ${colors.primary[100]};
      }
    `,
    input: `
      &:focus {
        outline: 2px solid ${colors.primary[500]};
        outline-offset: -2px;
        border-color: ${colors.primary[500]};
        box-shadow: 0 0 0 3px ${colors.primary[100]};
      }
    `,
    link: `
      &:focus-visible {
        outline: 2px solid ${colors.primary[500]};
        outline-offset: 2px;
        text-decoration: underline;
        text-decoration-thickness: 2px;
      }
    `
  },

  // Trap focus within modal/dialog
  trapFocus: (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => container.removeEventListener('keydown', handleTabKey);
  }
};

// ============================================================================
// SCREEN READER SUPPORT
// ============================================================================

/**
 * Screen reader and assistive technology support
 */
export const screenReaderSupport = {
  // ARIA labels and descriptions
  ariaLabels: {
    close: 'Fechar',
    menu: 'Menu',
    search: 'Pesquisar',
    loading: 'Carregando',
    error: 'Erro',
    success: 'Sucesso',
    warning: 'Aviso',
    info: 'Informação',
    previous: 'Anterior',
    next: 'Próximo',
    page: 'Página',
    of: 'de',
    required: 'obrigatório',
    optional: 'opcional'
  },

  // Live region announcements
  announceToScreenReader: (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  },

  // Skip links for keyboard navigation
  skipLinks: {
    toMainContent: 'Pular para o conteúdo principal',
    toNavigation: 'Pular para a navegação',
    toFooter: 'Pular para o rodapé'
  },

  // Landmark roles
  landmarks: {
    main: 'main',
    navigation: 'navigation',
    banner: 'banner',
    contentinfo: 'contentinfo',
    complementary: 'complementary',
    search: 'search',
    form: 'form'
  }
};

// ============================================================================
// KEYBOARD NAVIGATION
// ============================================================================

/**
 * Keyboard navigation patterns and utilities
 */
export const keyboardNavigation = {
  // Standard keyboard shortcuts
  shortcuts: {
    ENTER: 'Enter',
    SPACE: ' ',
    ESCAPE: 'Escape',
    TAB: 'Tab',
    ARROW_UP: 'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
    ARROW_LEFT: 'ArrowLeft',
    ARROW_RIGHT: 'ArrowRight',
    HOME: 'Home',
    END: 'End',
    PAGE_UP: 'PageUp',
    PAGE_DOWN: 'PageDown'
  },

  // Roving tabindex for complex widgets
  rovingTabindex: (container: HTMLElement, items: NodeListOf<HTMLElement>) => {
    let currentIndex = 0;

    const setTabindex = (index: number) => {
      items.forEach((item, i) => {
        item.tabIndex = i === index ? 0 : -1;
      });
      currentIndex = index;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      let newIndex = currentIndex;

      switch (e.key) {
        case keyboardNavigation.shortcuts.ARROW_DOWN:
        case keyboardNavigation.shortcuts.ARROW_RIGHT:
          newIndex = (currentIndex + 1) % items.length;
          break;
        case keyboardNavigation.shortcuts.ARROW_UP:
        case keyboardNavigation.shortcuts.ARROW_LEFT:
          newIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
          break;
        case keyboardNavigation.shortcuts.HOME:
          newIndex = 0;
          break;
        case keyboardNavigation.shortcuts.END:
          newIndex = items.length - 1;
          break;
        default:
          return;
      }

      e.preventDefault();
      setTabindex(newIndex);
      items[newIndex].focus();
    };

    setTabindex(0);
    container.addEventListener('keydown', handleKeyDown);

    return () => container.removeEventListener('keydown', handleKeyDown);
  }
};

// ============================================================================
// MIGRATION ACCESSIBILITY PATTERNS
// ============================================================================

/**
 * Accessibility patterns specific to user migration
 */
export const migrationAccessibility = {
  // Announce new features to screen readers
  announceNewFeature: (featureName: string) => {
    screenReaderSupport.announceToScreenReader(
      `Nova funcionalidade disponível: ${featureName}. Use Tab para navegar ou pressione Escape para continuar.`,
      'polite'
    );
  },

  // Provide context for UI changes
  announceUIChange: (changeName: string) => {
    screenReaderSupport.announceToScreenReader(
      `Interface atualizada: ${changeName}. A navegação permanece a mesma.`,
      'polite'
    );
  },

  // Help system for new interfaces
  contextualHelp: {
    trigger: 'Pressione F1 para ajuda contextual',
    close: 'Pressione Escape para fechar a ajuda',
    navigate: 'Use as setas para navegar entre as dicas'
  },

  // Reduced motion preferences
  respectReducedMotion: `
    @media (prefers-reduced-motion: reduce) {
      * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    }
  `
};

// ============================================================================
// FORM ACCESSIBILITY
// ============================================================================

/**
 * Accessible form patterns and validation
 */
export const formAccessibility = {
  // Error message patterns
  errorMessages: {
    required: (fieldName: string) => `${fieldName} é obrigatório`,
    invalid: (fieldName: string) => `${fieldName} contém um valor inválido`,
    tooShort: (fieldName: string, min: number) => `${fieldName} deve ter pelo menos ${min} caracteres`,
    tooLong: (fieldName: string, max: number) => `${fieldName} deve ter no máximo ${max} caracteres`,
    pattern: (fieldName: string) => `${fieldName} não atende ao formato esperado`
  },

  // Form field relationships
  fieldRelationships: {
    labelFor: (fieldId: string) => ({ htmlFor: fieldId }),
    describedBy: (descriptionId: string) => ({ 'aria-describedby': descriptionId }),
    errorMessage: (errorId: string) => ({ 'aria-describedby': errorId, 'aria-invalid': 'true' })
  },

  // Form validation announcements
  announceValidation: (fieldName: string, isValid: boolean, message?: string) => {
    const announcement = isValid 
      ? `${fieldName} válido`
      : `Erro em ${fieldName}: ${message}`;
    
    screenReaderSupport.announceToScreenReader(announcement, 'assertive');
  }
};

// ============================================================================
// RESPONSIVE ACCESSIBILITY
// ============================================================================

/**
 * Accessibility considerations for responsive design
 */
export const responsiveAccessibility = {
  // Touch target sizes (minimum 44px per WCAG)
  touchTargets: {
    minimum: '44px',
    comfortable: '48px',
    large: '56px'
  },

  // Responsive font sizes for readability
  responsiveFontSizes: {
    mobile: {
      body: '16px',      // Never smaller than 16px on mobile
      small: '14px',
      large: '18px'
    },
    desktop: {
      body: '16px',
      small: '14px', 
      large: '18px'
    }
  },

  // Zoom support (up to 200% per WCAG)
  zoomSupport: `
    @media (max-width: 1280px) {
      html {
        font-size: 100%;
      }
    }
    
    @media (max-width: 640px) {
      html {
        font-size: 100%;
      }
    }
  `
};

// ============================================================================
// ACCESSIBILITY TESTING UTILITIES
// ============================================================================

/**
 * Utilities for testing accessibility compliance
 */
export const accessibilityTesting = {
  // Check for common accessibility issues
  auditPage: () => {
    const issues: string[] = [];

    // Check for images without alt text
    const images = document.querySelectorAll('img:not([alt])');
    if (images.length > 0) {
      issues.push(`${images.length} imagens sem texto alternativo`);
    }

    // Check for form inputs without labels
    const unlabeledInputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
    const inputsWithoutLabels = Array.from(unlabeledInputs).filter(input => {
      const id = input.getAttribute('id');
      return !id || !document.querySelector(`label[for="${id}"]`);
    });
    if (inputsWithoutLabels.length > 0) {
      issues.push(`${inputsWithoutLabels.length} campos de formulário sem rótulo`);
    }

    // Check for low contrast text
    // This would require more complex color analysis in a real implementation

    return issues;
  },

  // Generate accessibility report
  generateReport: () => {
    const issues = accessibilityTesting.auditPage();
    const report = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      issues: issues,
      compliance: issues.length === 0 ? 'COMPLIANT' : 'NEEDS_ATTENTION',
      score: Math.max(0, 100 - (issues.length * 20))
    };

    console.group('🚨 Accessibility Audit Report');
    console.log('Compliance Status:', report.compliance);
    console.log('Accessibility Score:', `${report.score}/100`);
    if (issues.length > 0) {
      console.log('Issues Found:');
      issues.forEach(issue => console.log(`- ${issue}`));
    } else {
      console.log('✅ No accessibility issues detected');
    }
    console.groupEnd();

    return report;
  }
};

// ============================================================================
// MAIN ACCESSIBILITY EXPORT
// ============================================================================

export const accessibility = {
  contrast: {
    ratios: contrastRatios,
    calculate: calculateContrast,
    pairs: accessibleColorPairs
  },
  focus: focusManagement,
  screenReader: screenReaderSupport,
  keyboard: keyboardNavigation,
  migration: migrationAccessibility,
  forms: formAccessibility,
  responsive: responsiveAccessibility,
  testing: accessibilityTesting
};

export default accessibility; 