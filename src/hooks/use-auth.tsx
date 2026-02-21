'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  ReactNode,
} from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  onAuthChange,
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  signOut,
  getUserData,
} from '@/lib/firebase/auth';
import type { User } from '@/types';

// ===========================================
// PIXLY - Auth Hook
// Synchronous session management
// ===========================================

// Cookie management for middleware integration
const SESSION_COOKIE_NAME = 'pixly_session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function setSessionCookie(userId: string) {
  document.cookie = `${SESSION_COOKIE_NAME}=${userId}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

function removeSessionCookie() {
  document.cookie = `${SESSION_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<{ isNewUser: boolean }>;
  signInGoogle: () => Promise<{ isNewUser: boolean }>;
  acceptTerms: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Track if auth was resolved by signIn/signUp to skip redundant onAuthChange processing
  const authResolvedRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    // Safety timeout - stop loading if Firebase doesn't respond in 10s
    const timeout = setTimeout(() => {
      if (mounted && isLoading) {
        console.warn('[Auth] Timeout - Firebase did not respond in time');
        setIsLoading(false);
      }
    }, 10000);

    const unsubscribe = onAuthChange(async (fbUser) => {
      if (!mounted) return;

      // If auth was already resolved by signIn/signUp, skip redundant processing
      if (authResolvedRef.current) {
        authResolvedRef.current = false;
        if (mounted) setIsLoading(false);
        return;
      }

      setFirebaseUser(fbUser);

      if (fbUser) {
        try {
          const userData = await getUserData(fbUser.uid);
          if (mounted) {
            setUser(userData);
            setSessionCookie(fbUser.uid);
          }
        } catch (error) {
          console.error('[Auth] Error fetching user data:', error);
          if (mounted) {
            setUser(null);
          }
        }
      } else {
        setUser(null);
        removeSessionCookie();
      }

      if (mounted) {
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(timeout);
      unsubscribe();
    };
  }, []);

  // signIn: sets cookie + loads user data BEFORE resolving
  // No race condition: everything is ready when the promise resolves
  const signIn = async (email: string, password: string) => {
    const fbUser = await signInWithEmail(email, password);
    // Set cookie IMMEDIATELY - synchronous, available before any redirect
    setSessionCookie(fbUser.uid);
    setFirebaseUser(fbUser);
    // Load user data before resolving
    const userData = await getUserData(fbUser.uid);
    setUser(userData);
    // Mark as resolved so onAuthChange skips redundant processing
    authResolvedRef.current = true;
  };

  // signUp: same pattern - cookie + user data set before resolving
  const signUp = async (email: string, password: string, name: string): Promise<{ isNewUser: boolean }> => {
    const fbUser = await signUpWithEmail(email, password, name);
    setSessionCookie(fbUser.uid);
    setFirebaseUser(fbUser);
    const userData = await getUserData(fbUser.uid);
    setUser(userData);
    authResolvedRef.current = true;
    return { isNewUser: true };
  };

  // signInGoogle: returns isNewUser so the caller can show terms modal
  const signInGoogle = async (): Promise<{ isNewUser: boolean }> => {
    const { user: fbUser, isNewUser } = await signInWithGoogle();
    setSessionCookie(fbUser.uid);
    setFirebaseUser(fbUser);
    const userData = await getUserData(fbUser.uid);
    setUser(userData);
    authResolvedRef.current = true;
    return { isNewUser };
  };

  const acceptTerms = async () => {
    const res = await fetch('/api/auth/accept-terms', { method: 'POST' });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Erreur lors de l\'acceptation des CGU');
    }
    // Refresh user data to get updated termsAcceptedAt + termsVersion
    if (firebaseUser) {
      const userData = await getUserData(firebaseUser.uid);
      setUser(userData);
    }
  };

  const refreshUser = async () => {
    if (firebaseUser) {
      const userData = await getUserData(firebaseUser.uid);
      setUser(userData);
    }
  };

  const logout = async () => {
    await signOut();
    setUser(null);
    setFirebaseUser(null);
    removeSessionCookie();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        isLoading,
        isAuthenticated: !!user,
        signIn,
        signUp,
        signInGoogle,
        acceptTerms,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
