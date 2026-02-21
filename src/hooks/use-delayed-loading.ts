'use client';

import { useState, useEffect, useRef } from 'react';

// ===========================================
// PIXLY - Delayed Loading Hook
// Prevents flicker on fast operations:
// - Waits `delay` ms before showing loader
// - Once visible, stays for minimum `minDuration` ms
// ===========================================

export function useDelayedLoading(
  isLoading: boolean,
  delay: number = 200,
  minDuration: number = 500
): boolean {
  const [showLoading, setShowLoading] = useState(false);
  const showTimeRef = useRef(0);
  const delayTimerRef = useRef<NodeJS.Timeout>();
  const minDurationTimerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isLoading) {
      // Clear any pending hide timer
      clearTimeout(minDurationTimerRef.current);

      // Wait before showing
      delayTimerRef.current = setTimeout(() => {
        showTimeRef.current = Date.now();
        setShowLoading(true);
      }, delay);
    } else {
      // Cancel the delay timer if loading finishes before it fires
      clearTimeout(delayTimerRef.current);

      if (showLoading) {
        // Ensure minimum display duration to avoid flash
        const elapsed = Date.now() - showTimeRef.current;
        const remaining = Math.max(0, minDuration - elapsed);

        if (remaining > 0) {
          minDurationTimerRef.current = setTimeout(() => {
            setShowLoading(false);
          }, remaining);
        } else {
          setShowLoading(false);
        }
      }
    }

    return () => {
      clearTimeout(delayTimerRef.current);
      clearTimeout(minDurationTimerRef.current);
    };
  }, [isLoading, delay, minDuration, showLoading]);

  return showLoading;
}
