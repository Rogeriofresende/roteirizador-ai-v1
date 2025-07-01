import React, { useEffect, useRef, createContext, useContext, useState } from 'react';

// Contexto para gerenciamento de foco
interface FocusContextType {
  registerFocusable: (id: string, element: HTMLElement) => void;
  unregisterFocusable: (id: string) => void;
  focusNext: () => void;
  focusPrevious: () => void;
  focusFirst: () => void;
  focusLast: () => void;
  focusById: (id: string) => void;
  announceLive: (message: string, priority?: 'polite' | 'assertive') => void;
  isReducedMotion: boolean;
}

const FocusContext = createContext<FocusContextType | undefined>(undefined);

export const useFocusManager = () => {
  const context = useContext(FocusContext);
  if (!context) {
    throw new Error('useFocusManager deve ser usado dentro de FocusProvider');
  }
  return context;
};

// Provider de gerenciamento de foco
export const FocusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [focusableElements, setFocusableElements] = useState<Map<string, HTMLElement>>(new Map());
  const [currentFocusIndex, setCurrentFocusIndex] = useState<number>(-1);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const liveRegionRef = useRef<HTMLDivElement>(null);

  // Detectar preferência de movimento reduzido
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const registerFocusable = (id: string, element: HTMLElement) => {
    setFocusableElements(prev => new Map(prev).set(id, element));
  };

  const unregisterFocusable = (id: string) => {
    setFocusableElements(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
  };

  const getFocusableArray = () => {
    return Array.from(focusableElements.values()).filter(element => {
      return element.offsetParent !== null && !element.hasAttribute('disabled');
    });
  };

  const focusNext = () => {
    const elements = getFocusableArray();
    if (elements.length === 0) return;

    const nextIndex = (currentFocusIndex + 1) % elements.length;
    elements[nextIndex]?.focus();
    setCurrentFocusIndex(nextIndex);
  };

  const focusPrevious = () => {
    const elements = getFocusableArray();
    if (elements.length === 0) return;

    const prevIndex = currentFocusIndex <= 0 ? elements.length - 1 : currentFocusIndex - 1;
    elements[prevIndex]?.focus();
    setCurrentFocusIndex(prevIndex);
  };

  const focusFirst = () => {
    const elements = getFocusableArray();
    if (elements.length === 0) return;

    elements[0]?.focus();
    setCurrentFocusIndex(0);
  };

  const focusLast = () => {
    const elements = getFocusableArray();
    if (elements.length === 0) return;

    const lastIndex = elements.length - 1;
    elements[lastIndex]?.focus();
    setCurrentFocusIndex(lastIndex);
  };

  const focusById = (id: string) => {
    const element = focusableElements.get(id);
    if (element) {
      element.focus();
      const elements = getFocusableArray();
      const index = elements.indexOf(element);
      if (index !== -1) {
        setCurrentFocusIndex(index);
      }
    }
  };

  const announceLive = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (liveRegionRef.current) {
      liveRegionRef.current.setAttribute('aria-live', priority);
      liveRegionRef.current.textContent = message;
      
      // Limpar após um tempo para permitir novos anúncios
      setTimeout(() => {
        if (liveRegionRef.current) {
          liveRegionRef.current.textContent = '';
        }
      }, 1000);
    }
  };

  // Gerenciar teclas globais
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip se estiver digitando em um input
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement ||
          (event.target as HTMLElement)?.isContentEditable) {
        return;
      }

      // Navegação por setas (se Ctrl estiver pressionado)
      if (event.ctrlKey) {
        switch (event.key) {
          case 'ArrowDown':
            event.preventDefault();
            focusNext();
            break;
          case 'ArrowUp':
            event.preventDefault();
            focusPrevious();
            break;
          case 'Home':
            event.preventDefault();
            focusFirst();
            break;
          case 'End':
            event.preventDefault();
            focusLast();
            break;
        }
      }

      // Skip/Bypass links (permite pular navegação)
      if (event.key === 'Tab' && event.shiftKey && event.ctrlKey) {
        event.preventDefault();
        const mainContent = document.querySelector('[role="main"]') as HTMLElement;
        if (mainContent) {
          mainContent.focus();
          mainContent.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentFocusIndex, focusableElements]);

  return (
    <FocusContext.Provider
      value={{
        registerFocusable,
        unregisterFocusable,
        focusNext,
        focusPrevious,
        focusFirst,
        focusLast,
        focusById,
        announceLive,
        isReducedMotion
      }}
    >
      {children}
      
      {/* Live region para anúncios de tela */}
      <div
        ref={liveRegionRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      {/* Indicador visual de foco para usuários de teclado */}
      <style jsx global>{`
        .focus-visible {
          outline: 2px solid #3B82F6;
          outline-offset: 2px;
          border-radius: 4px;
        }
        
        /* Animações respeitando preferências do usuário */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </FocusContext.Provider>
  );
};

// Hook para elementos focusáveis
export const useFocusable = (id: string, autoRegister: boolean = true) => {
  const elementRef = useRef<HTMLElement>(null);
  const { registerFocusable, unregisterFocusable } = useFocusManager();

  useEffect(() => {
    if (autoRegister && elementRef.current) {
      registerFocusable(id, elementRef.current);
      
      return () => {
        unregisterFocusable(id);
      };
    }
  }, [id, autoRegister, registerFocusable, unregisterFocusable]);

  return elementRef;
};

// Componente Skip Link
export const SkipLink: React.FC<{ href: string; children: React.ReactNode }> = ({ 
  href, 
  children 
}) => {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium shadow-lg transition-all"
      onFocus={(e) => {
        e.target.scrollIntoView({ behavior: 'smooth' });
      }}
    >
      {children}
    </a>
  );
};

// Componente para anúncios de tela
export const ScreenReaderOnly: React.FC<{ 
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
}> = ({ children, as: Component = 'span' }) => {
  return (
    <Component className="sr-only">
      {children}
    </Component>
  );
};

// Hook para anúncios automáticos
export const useAnnouncer = () => {
  const { announceLive } = useFocusManager();

  const announceSuccess = (message: string) => {
    announceLive(`✅ ${message}`, 'polite');
  };

  const announceError = (message: string) => {
    announceLive(`❌ ${message}`, 'assertive');
  };

  const announceInfo = (message: string) => {
    announceLive(`ℹ️ ${message}`, 'polite');
  };

  const announceLoading = (message: string = 'Carregando...') => {
    announceLive(`⏳ ${message}`, 'polite');
  };

  return {
    announceSuccess,
    announceError,
    announceInfo,
    announceLoading,
    announce: announceLive
  };
};

// Componente de landmarks semânticos
export const Landmark: React.FC<{
  role: 'main' | 'navigation' | 'banner' | 'contentinfo' | 'complementary' | 'search';
  label?: string;
  children: React.ReactNode;
  className?: string;
}> = ({ role, label, children, className = '' }) => {
  const props: any = {
    role,
    className: `focus:outline-none ${className}`,
    tabIndex: -1
  };

  if (label) {
    props['aria-label'] = label;
  }

  return React.createElement(
    role === 'main' ? 'main' :
    role === 'navigation' ? 'nav' :
    role === 'banner' ? 'header' :
    role === 'contentinfo' ? 'footer' :
    role === 'search' ? 'search' :
    'section',
    props,
    children
  );
};

// Hook para detectar se o usuário está navegando por teclado
export const useKeyboardNavigation = () => {
  const [isKeyboardUser, setIsKeyboardUser] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        setIsKeyboardUser(true);
      }
    };

    const handleMouseDown = () => {
      setIsKeyboardUser(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  return isKeyboardUser;
};

// Componente para indicar regiões interativas
export const InteractiveRegion: React.FC<{
  children: React.ReactNode;
  label: string;
  description?: string;
  className?: string;
}> = ({ children, label, description, className = '' }) => {
  const isKeyboardUser = useKeyboardNavigation();

  return (
    <div
      role="region"
      aria-label={label}
      aria-describedby={description ? `${label}-desc` : undefined}
      className={`
        ${className}
        ${isKeyboardUser ? 'focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-opacity-50' : ''}
        transition-all duration-200
      `}
      tabIndex={-1}
    >
      {description && (
        <ScreenReaderOnly>
          <div id={`${label}-desc`}>{description}</div>
        </ScreenReaderOnly>
      )}
      {children}
    </div>
  );
}; 

// **KEYBOARD NAVIGATION**
useEffect(() => {
  if (!containerRef.current) return;

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'Tab':
        if (e.shiftKey) {
          e.preventDefault();
          focusPrevious();
        } else {
          e.preventDefault();
          focusNext();
        }
        break;
      case 'Home':
        e.preventDefault();
        focusFirst();
        break;
      case 'End':
        e.preventDefault();
        focusLast();
        break;
      case 'ArrowDown':
        if (direction === 'vertical' || direction === 'grid') {
          e.preventDefault();
          focusNext();
        }
        break;
      case 'ArrowUp':
        if (direction === 'vertical' || direction === 'grid') {
          e.preventDefault();
          focusPrevious();
        }
        break;
      case 'ArrowRight':
        if (direction === 'horizontal' || direction === 'grid') {
          e.preventDefault();
          focusNext();
        }
        break;
      case 'ArrowLeft':
        if (direction === 'horizontal' || direction === 'grid') {
          e.preventDefault();
          focusPrevious();
        }
        break;
    }
  };

  const container = containerRef.current;
  container.addEventListener('keydown', handleKeyDown);
  
  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
}, [direction, focusFirst, focusLast, focusNext, focusPrevious]); 