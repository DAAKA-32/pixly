'use client';

import { useEffect } from 'react';

// ===========================================
// Hash Scroll Handler
// Smooth-scrolls to the hash target on mount
// e.g. /features#funnel → scrolls to #funnel
// ===========================================

export function HashScrollHandler() {
  useEffect(() => {
    const hash = window.location.hash?.slice(1);
    if (!hash) return;

    // Wait for layout paint before scrolling
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = document.getElementById(hash);
        if (el) {
          const offset = 100; // account for fixed navigation
          const top = el.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });
  }, []);

  return null;
}
