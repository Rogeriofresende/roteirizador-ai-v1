"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/Button"

// Enhanced localStorage handling with error management and race condition prevention
const ThemeStorage = {
  key: "vite-ui-theme",
  
  get(): "light" | "dark" | null {
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return null;
      }
      
      const stored = localStorage.getItem(this.key);
      return stored === "dark" || stored === "light" ? stored : null;
    } catch (error: unknown) {
      console.warn('ThemeToggle: Failed to read from localStorage:', error);
      return null;
    }
  },
  
  set(theme: "light" | "dark"): boolean {
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return false;
      }
      
      localStorage.setItem(this.key, theme);
      return true;
    } catch (error: unknown) {
      console.warn('ThemeToggle: Failed to write to localStorage:', error);
      return false;
    }
  }
};

// Enhanced system preference detection with proper cleanup
const useSystemPreference = () => {
  const [systemPrefersDark, setSystemPrefersDark] = React.useState(false);
  const mediaQueryRef = React.useRef<MediaQueryList | null>(null);
  
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      mediaQueryRef.current = window.matchMedia("(prefers-color-scheme: dark)");
      setSystemPrefersDark(mediaQueryRef.current.matches);
      
      const handleChange = (e: MediaQueryListEvent) => {
        setSystemPrefersDark(e.matches);
      };
      
      // Modern browsers
      if (mediaQueryRef.current.addEventListener) {
        mediaQueryRef.current.addEventListener('change', handleChange);
      } else {
        // Legacy browsers
        mediaQueryRef.current.addListener(handleChange);
      }
      
      return () => {
        if (mediaQueryRef.current) {
          if (mediaQueryRef.current.removeEventListener) {
            mediaQueryRef.current.removeEventListener('change', handleChange);
          } else {
            mediaQueryRef.current.removeListener(handleChange);
          }
        }
      };
    } catch (error: unknown) {
      console.warn('ThemeToggle: System preference detection failed:', error);
      setSystemPrefersDark(false);
    }
  }, []);
  
  return systemPrefersDark;
};

export function useTheme() {
  const [theme, setTheme] = React.useState<"light" | "dark">("light");
  const [isMounted, setIsMounted] = React.useState(false);
  const systemPrefersDark = useSystemPreference();
  const isInitializedRef = React.useRef(false);
  const themeTransitionTimeoutRef = React.useRef<NodeJS.Timeout>();

  // Enhanced initialization with proper hydration safety
  React.useEffect(() => {
    if (isInitializedRef.current) return;
    
    setIsMounted(true);
    
    // Batch the theme determination and application
    requestAnimationFrame(() => {
      const storedTheme = ThemeStorage.get();
      
      let initialTheme: "light" | "dark";
      
      if (storedTheme) {
        initialTheme = storedTheme;
      } else {
        // Use system preference as fallback
        initialTheme = systemPrefersDark ? "dark" : "light";
        // Save the initial theme determination
        ThemeStorage.set(initialTheme);
      }
      
      setTheme(initialTheme);
      isInitializedRef.current = true;
    });
  }, [systemPrefersDark]);

  // Enhanced theme application with performance optimization
  React.useEffect(() => {
    if (!isMounted || !isInitializedRef.current) return;
    
    // Clear any existing timeout to prevent race conditions
    if (themeTransitionTimeoutRef.current) {
      clearTimeout(themeTransitionTimeoutRef.current);
    }
    
    // Apply theme changes in next frame to prevent layout thrashing
    requestAnimationFrame(() => {
      try {
        // Safely update body classes
        if (document.body) {
          document.body.classList.remove("light", "dark");
          document.body.classList.add(theme);
          
          // Add smooth transition only after first paint to prevent flash
          if (!document.body.style.transition) {
            document.body.style.transition = "background-color 0.3s ease, color 0.3s ease";
          }
        }
        
        // Save to localStorage with error handling
        const saved = ThemeStorage.set(theme);
        
        if (!saved) {
          console.warn('ThemeToggle: Failed to persist theme preference');
        }
      } catch (error: unknown) {
        console.error('ThemeToggle: Failed to apply theme:', error);
      }
    });
    
    // Cleanup function
    return () => {
      if (themeTransitionTimeoutRef.current) {
        clearTimeout(themeTransitionTimeoutRef.current);
      }
    };
  }, [theme, isMounted]);

  // Optimized toggle function with race condition prevention
  const toggleTheme = React.useCallback(() => {
    if (!isInitializedRef.current) return;
    
    setTheme(prevTheme => {
      const newTheme = prevTheme === "dark" ? "light" : "dark";
      
      // Dispatch custom event for other components that might listen
      if (typeof window !== 'undefined') {
        try {
          window.dispatchEvent(new CustomEvent('themechange', { 
            detail: { theme: newTheme, previousTheme: prevTheme } 
          }));
        } catch (error: unknown) {
          // Ignore event dispatch errors
        }
      }
      
      return newTheme;
    });
  }, []);

  // Effect to sync with system preference changes when no stored theme
  React.useEffect(() => {
    if (!isInitializedRef.current || ThemeStorage.get()) return;
    
    // If no stored theme, follow system preference
    const newTheme = systemPrefersDark ? "dark" : "light";
    if (theme !== newTheme) {
      setTheme(newTheme);
    }
  }, [systemPrefersDark, theme]);

  // Apply theme with transition
  React.useEffect(() => {
    const currentTimeoutRef = themeTransitionTimeoutRef.current;
    
    return () => {
      if (currentTimeoutRef) {
        clearTimeout(currentTimeoutRef);
      }
    };
  }, []);

  return { theme, toggleTheme, isMounted: isMounted && isInitializedRef.current };
}

export function ThemeToggle() {
  const { toggleTheme, theme, isMounted } = useTheme();

  // Enhanced hydration safety with consistent fallback
  if (!isMounted) {
    return (
      <Button 
        variant="outline" 
        size="icon" 
        aria-label="Loading theme toggle"
        className="transition-colors duration-300"
        disabled
      >
        <Sun className="h-[1.2rem] w-[1.2rem] opacity-50" />
      </Button>
    );
  }

  return (
    <Button 
      variant="outline" 
      size="icon" 
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      className="transition-colors duration-300 hover:bg-accent"
    >
      <Sun className={`h-[1.2rem] w-[1.2rem] transition-all duration-300 ${
        theme === 'dark' ? 'rotate-90 scale-0' : 'rotate-0 scale-100'
      }`} />
      <Moon className={`absolute h-[1.2rem] w-[1.2rem] transition-all duration-300 ${
        theme === 'dark' ? 'rotate-0 scale-100' : 'rotate-90 scale-0'
      }`} />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
} 