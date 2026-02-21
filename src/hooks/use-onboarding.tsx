'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { updateUserOnboarding } from '@/lib/firebase/firestore';

// ===========================================
// PIXLY - Onboarding State Hook
// Manages welcome modal visibility via Firestore
// ===========================================

const SESSION_KEY = 'pixly_onboarding_dismissed';

export function useOnboarding() {
  const { user } = useAuth();
  const [shouldShowWelcome, setShouldShowWelcome] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsReady(false);
      return;
    }

    // Already completed in Firestore
    if (user.onboardingCompleted) {
      setShouldShowWelcome(false);
      setIsReady(true);
      return;
    }

    // No workspace yet — user hasn't finished the onboarding wizard
    if (user.workspaceIds.length === 0) {
      setShouldShowWelcome(false);
      setIsReady(true);
      return;
    }

    // Already dismissed this session
    const dismissedThisSession = sessionStorage.getItem(SESSION_KEY);
    if (dismissedThisSession) {
      setShouldShowWelcome(false);
      setIsReady(true);
      return;
    }

    // Show the welcome modal
    setShouldShowWelcome(true);
    setIsReady(true);
  }, [user]);

  const completeOnboarding = useCallback(async () => {
    if (!user) return;
    setShouldShowWelcome(false);
    sessionStorage.setItem(SESSION_KEY, 'true');
    try {
      await updateUserOnboarding(user.id, true);
    } catch (err) {
      console.error('Failed to update onboarding status:', err);
    }
  }, [user]);

  const resetOnboarding = useCallback(async () => {
    if (!user) return;
    sessionStorage.removeItem(SESSION_KEY);
    try {
      await updateUserOnboarding(user.id, false);
    } catch (err) {
      console.error('Failed to reset onboarding status:', err);
    }
  }, [user]);

  return {
    shouldShowWelcome,
    isReady,
    completeOnboarding,
    resetOnboarding,
  };
}
