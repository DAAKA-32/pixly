'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import { useAuth } from './use-auth';
import {
  getUserWorkspaces,
  createWorkspace as createWorkspaceDb,
  getWorkspace,
} from '@/lib/firebase/firestore';
import type { Workspace } from '@/types';

// ===========================================
// PIXLY - Workspace Hook
// Optimized with caching and parallel loading
// ===========================================

interface WorkspaceContextType {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  isLoading: boolean;
  selectWorkspace: (workspaceId: string) => Promise<void>;
  createWorkspace: (name: string) => Promise<Workspace>;
  refreshWorkspaces: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined
);

const WORKSPACE_STORAGE_KEY = 'pixly_current_workspace';
const WORKSPACE_CACHE_KEY = 'pixly_workspaces_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Cache utilities for optimistic loading
function getCachedWorkspaces(): { workspaces: Workspace[]; timestamp: number } | null {
  if (typeof window === 'undefined') return null;
  try {
    const cached = localStorage.getItem(WORKSPACE_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      // Restore Date objects
      parsed.workspaces = parsed.workspaces.map((w: any) => ({
        ...w,
        createdAt: new Date(w.createdAt),
      }));
      return parsed;
    }
  } catch {
    // Ignore cache errors
  }
  return null;
}

function setCachedWorkspaces(workspaces: Workspace[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      WORKSPACE_CACHE_KEY,
      JSON.stringify({ workspaces, timestamp: Date.now() })
    );
  } catch {
    // Ignore cache errors
  }
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const loadedRef = useRef(false);
  const userIdRef = useRef<string | null>(null);

  // Load workspaces with optimistic caching
  const loadWorkspaces = useCallback(async (userId: string) => {
    // Try to restore from cache first for instant display
    const cached = getCachedWorkspaces();
    const savedWorkspaceId = typeof window !== 'undefined'
      ? localStorage.getItem(WORKSPACE_STORAGE_KEY)
      : null;

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      // Use cached data immediately
      setWorkspaces(cached.workspaces);
      const savedWorkspace = savedWorkspaceId
        ? cached.workspaces.find((w) => w.id === savedWorkspaceId)
        : cached.workspaces[0];
      if (savedWorkspace) {
        setCurrentWorkspace(savedWorkspace);
      }
      setIsLoading(false);

      // Refresh in background silently
      getUserWorkspaces(userId).then((freshWorkspaces) => {
        setWorkspaces(freshWorkspaces);
        setCachedWorkspaces(freshWorkspaces);
        // Update current workspace if it changed
        if (savedWorkspaceId) {
          const updated = freshWorkspaces.find((w) => w.id === savedWorkspaceId);
          if (updated) setCurrentWorkspace(updated);
        }
      }).catch(console.error);

      return;
    }

    // No cache or expired - fetch fresh data
    setIsLoading(true);
    try {
      const userWorkspaces = await getUserWorkspaces(userId);
      setWorkspaces(userWorkspaces);
      setCachedWorkspaces(userWorkspaces);

      // Restore last selected workspace
      if (savedWorkspaceId) {
        const saved = userWorkspaces.find((w) => w.id === savedWorkspaceId);
        if (saved) {
          setCurrentWorkspace(saved);
        } else if (userWorkspaces.length > 0) {
          setCurrentWorkspace(userWorkspaces[0]);
          localStorage.setItem(WORKSPACE_STORAGE_KEY, userWorkspaces[0].id);
        }
      } else if (userWorkspaces.length > 0) {
        setCurrentWorkspace(userWorkspaces[0]);
        localStorage.setItem(WORKSPACE_STORAGE_KEY, userWorkspaces[0].id);
      }
    } catch (error) {
      console.error('Error loading workspaces:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Effect to handle auth state changes
  useEffect(() => {
    // Wait for auth to be ready
    if (authLoading) return;

    if (isAuthenticated && user) {
      // Prevent duplicate loads for same user
      if (userIdRef.current === user.id && loadedRef.current) {
        return;
      }
      userIdRef.current = user.id;
      loadedRef.current = true;
      loadWorkspaces(user.id);
    } else {
      // User logged out - clear state
      userIdRef.current = null;
      loadedRef.current = false;
      setWorkspaces([]);
      setCurrentWorkspace(null);
      setIsLoading(false);
      // Clear cache on logout
      if (typeof window !== 'undefined') {
        localStorage.removeItem(WORKSPACE_CACHE_KEY);
      }
    }
  }, [isAuthenticated, user, authLoading, loadWorkspaces]);

  const selectWorkspace = useCallback(async (workspaceId: string) => {
    // Optimistic update from cache first
    const cached = workspaces.find((w) => w.id === workspaceId);
    if (cached) {
      setCurrentWorkspace(cached);
      localStorage.setItem(WORKSPACE_STORAGE_KEY, workspaceId);
    }

    // Then fetch fresh data
    const workspace = await getWorkspace(workspaceId);
    if (workspace) {
      setCurrentWorkspace(workspace);
      localStorage.setItem(WORKSPACE_STORAGE_KEY, workspaceId);
    }
  }, [workspaces]);

  const createWorkspace = useCallback(async (name: string): Promise<Workspace> => {
    if (!user) throw new Error('User not authenticated');

    const workspace = await createWorkspaceDb(user.id, name);
    setWorkspaces((prev) => {
      const updated = [...prev, workspace];
      setCachedWorkspaces(updated);
      return updated;
    });
    setCurrentWorkspace(workspace);
    localStorage.setItem(WORKSPACE_STORAGE_KEY, workspace.id);

    return workspace;
  }, [user]);

  const refreshWorkspaces = useCallback(async () => {
    if (!user) return;
    // Force fresh fetch
    if (typeof window !== 'undefined') {
      localStorage.removeItem(WORKSPACE_CACHE_KEY);
    }
    await loadWorkspaces(user.id);
  }, [user, loadWorkspaces]);

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        currentWorkspace,
        isLoading,
        selectWorkspace,
        createWorkspace,
        refreshWorkspaces,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
