'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

// ===========================================
// PIXLY — Tutorial State Management
// Tracks tutorial completion per feature
// ===========================================

const STORAGE_KEY = 'pixly-tutorials';

interface TutorialState {
  pixel: boolean;
}

interface TutorialContextValue {
  /** Whether the pixel tutorial has been completed */
  pixelTutorialDone: boolean;
  /** Mark the pixel tutorial as completed */
  completePixelTutorial: () => void;
  /** Reset the pixel tutorial (allow re-viewing) */
  resetPixelTutorial: () => void;
  /** Whether the pixel tutorial drawer is open */
  isPixelTutorialOpen: boolean;
  /** Open the pixel tutorial drawer */
  openPixelTutorial: () => void;
  /** Close the pixel tutorial drawer */
  closePixelTutorial: () => void;
}

const TutorialContext = createContext<TutorialContextValue | null>(null);

function loadState(): TutorialState {
  if (typeof window === 'undefined') return { pixel: false };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as TutorialState;
  } catch {
    // Corrupted — reset
  }
  return { pixel: false };
}

function saveState(state: TutorialState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage full or blocked — silent fail
  }
}

export function TutorialProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TutorialState>({ pixel: false });
  const [isPixelTutorialOpen, setIsPixelTutorialOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  const completePixelTutorial = useCallback(() => {
    setState((prev) => {
      const next = { ...prev, pixel: true };
      saveState(next);
      return next;
    });
  }, []);

  const resetPixelTutorial = useCallback(() => {
    setState((prev) => {
      const next = { ...prev, pixel: false };
      saveState(next);
      return next;
    });
  }, []);

  const openPixelTutorial = useCallback(() => setIsPixelTutorialOpen(true), []);
  const closePixelTutorial = useCallback(() => setIsPixelTutorialOpen(false), []);

  return (
    <TutorialContext.Provider
      value={{
        pixelTutorialDone: hydrated ? state.pixel : false,
        completePixelTutorial,
        resetPixelTutorial,
        isPixelTutorialOpen,
        openPixelTutorial,
        closePixelTutorial,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  const ctx = useContext(TutorialContext);
  if (!ctx) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return ctx;
}
