'use client';

import { useEffect } from 'react';

// ===========================================
// PIXLY - Zoom & Scroll Guard
// Prevents unwanted zoom and page movement
// ===========================================

export function ZoomGuard() {
  useEffect(() => {
    // ── Keyboard zoom prevention (Ctrl/Cmd + +/-/0) ──
    function handleKeyDown(e: KeyboardEvent) {
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === '+' || e.key === '-' || e.key === '=' || e.key === '0')
      ) {
        e.preventDefault();
      }
    }

    // ── Trackpad / mouse wheel zoom prevention (Ctrl + scroll) ──
    function handleWheel(e: WheelEvent) {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
    }

    // ── Safari pinch gesture prevention ──
    function handleGesture(e: Event) {
      e.preventDefault();
    }

    // ── iOS input focus zoom prevention ──
    const isIOS =
      typeof navigator !== 'undefined' &&
      /iPad|iPhone|iPod/.test(navigator.userAgent);

    function handleFocusIn(e: FocusEvent) {
      if (!isIOS) return;
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'SELECT' ||
        target.tagName === 'TEXTAREA'
      ) {
        const computed = window.getComputedStyle(target);
        const fontSize = parseFloat(computed.fontSize);
        if (fontSize < 16) {
          target.style.fontSize = '16px';
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('gesturestart', handleGesture);
    document.addEventListener('gesturechange', handleGesture);
    document.addEventListener('focusin', handleFocusIn);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('wheel', handleWheel);
      document.removeEventListener('gesturestart', handleGesture);
      document.removeEventListener('gesturechange', handleGesture);
      document.removeEventListener('focusin', handleFocusIn);
    };
  }, []);

  return null;
}
