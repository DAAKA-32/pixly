'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';

// ===========================================
// PIXLY - Sidebar State Management
// Collapsible sidebar with localStorage persistence
// ===========================================

interface SidebarContextValue {
  isCollapsed: boolean;
  isHovered: boolean;
  toggle: () => void;
  collapse: () => void;
  expand: () => void;
  setHovered: (hovered: boolean) => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

const STORAGE_KEY = 'pixly-sidebar-collapsed';

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Restore state from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setIsCollapsed(stored === 'true');
    }
    setMounted(true);
  }, []);

  // Persist state to localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(STORAGE_KEY, String(isCollapsed));
    }
  }, [isCollapsed, mounted]);

  const toggle = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  const collapse = useCallback(() => {
    setIsCollapsed(true);
  }, []);

  const expand = useCallback(() => {
    setIsCollapsed(false);
  }, []);

  const handleSetHovered = useCallback((hovered: boolean) => {
    setIsHovered(hovered);
  }, []);

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        isHovered,
        toggle,
        collapse,
        expand,
        setHovered: handleSetHovered,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar(): SidebarContextValue {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
