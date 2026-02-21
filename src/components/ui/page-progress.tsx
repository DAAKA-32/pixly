'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';

// ===========================================
// PIXLY - Page Progress Bar
// NProgress-style thin bar at top during route transitions
// Emerald (#10b981) to match primary color
// ===========================================

export function PageProgress() {
  const pathname = usePathname();
  const [state, setState] = useState<'idle' | 'loading' | 'completing'>('idle');
  const [progress, setProgress] = useState(0);
  const prevPathname = useRef(pathname);
  const trickleTimer = useRef<NodeJS.Timeout>();
  const completeTimer = useRef<NodeJS.Timeout>();

  const cleanup = useCallback(() => {
    clearInterval(trickleTimer.current);
    clearTimeout(completeTimer.current);
  }, []);

  useEffect(() => {
    // Skip initial mount
    if (prevPathname.current === pathname) return;
    prevPathname.current = pathname;

    cleanup();

    // Start: jump to 30%, then trickle
    setState('loading');
    setProgress(30);

    trickleTimer.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        // Slow down as we approach 90%
        const increment = prev < 50 ? 8 : prev < 70 ? 4 : 1.5;
        return Math.min(prev + increment, 90);
      });
    }, 200);

    // Complete after a short delay (Next.js renders the new page)
    completeTimer.current = setTimeout(() => {
      cleanup();
      setProgress(100);
      setState('completing');

      // Hide after completion animation
      setTimeout(() => {
        setState('idle');
        setProgress(0);
      }, 300);
    }, 350);

    return cleanup;
  }, [pathname, cleanup]);

  if (state === 'idle') return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] h-[2px] pointer-events-none"
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full bg-primary-500 transition-all ease-out"
        style={{
          width: `${progress}%`,
          transitionDuration: state === 'completing' ? '200ms' : '400ms',
          opacity: state === 'completing' ? 0 : 1,
        }}
      />
    </div>
  );
}
