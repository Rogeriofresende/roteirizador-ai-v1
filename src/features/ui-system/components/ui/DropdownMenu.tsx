/**
 * 📋 DROPDOWN MENU COMPONENT
 * Simple dropdown menu implementation
 */

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface DropdownMenuProps {
  children: React.ReactNode;
}

interface DropdownMenuTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

interface DropdownMenuContentProps {
  children: React.ReactNode;
  className?: string;
}

interface DropdownMenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

interface DropdownMenuSeparatorProps {
  className?: string;
}

// =============================================================================
// CONTEXT
// =============================================================================

interface DropdownContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLDivElement>;
}

const DropdownContext = React.createContext<DropdownContextType | undefined>(undefined);

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen, triggerRef }}>
      <div className="relative" ref={triggerRef}>
        {children}
      </div>
    </DropdownContext.Provider>
  );
};

// =============================================================================
// TRIGGER COMPONENT
// =============================================================================

export const DropdownMenuTrigger: React.FC<DropdownMenuTriggerProps> = ({ 
  children, 
  asChild = false 
}) => {
  const context = React.useContext(DropdownContext);
  if (!context) {
    throw new Error('DropdownMenuTrigger must be used within DropdownMenu');
  }

  const { isOpen, setIsOpen } = context;

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  if (asChild) {
    return React.cloneElement(children as React.ReactElement, {
      onClick: handleClick
    });
  }

  return (
    <div onClick={handleClick} className="cursor-pointer">
      {children}
    </div>
  );
};

// =============================================================================
// CONTENT COMPONENT
// =============================================================================

export const DropdownMenuContent: React.FC<DropdownMenuContentProps> = ({ 
  children, 
  className 
}) => {
  const context = React.useContext(DropdownContext);
  if (!context) {
    throw new Error('DropdownMenuContent must be used within DropdownMenu');
  }

  const { isOpen } = context;

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50",
        "animate-in fade-in-0 zoom-in-95 duration-200",
        className
      )}
    >
      <div className="py-1">
        {children}
      </div>
    </div>
  );
};

// =============================================================================
// ITEM COMPONENT
// =============================================================================

export const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({ 
  children, 
  onClick, 
  className,
  disabled = false 
}) => {
  const context = React.useContext(DropdownContext);
  if (!context) {
    throw new Error('DropdownMenuItem must be used within DropdownMenu');
  }

  const { setIsOpen } = context;

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
      setIsOpen(false);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {children}
    </div>
  );
};

// =============================================================================
// SEPARATOR COMPONENT
// =============================================================================

export const DropdownMenuSeparator: React.FC<DropdownMenuSeparatorProps> = ({ 
  className 
}) => {
  return (
    <div 
      className={cn(
        "h-px bg-gray-200 my-1",
        className
      )}
    />
  );
};

export default DropdownMenu; 