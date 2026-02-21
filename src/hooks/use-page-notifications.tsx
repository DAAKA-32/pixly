'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ALL_PAGE_IDS } from '@/lib/help/notifications';
import type { HelpPageId } from '@/lib/help/content';

// ===========================================
// PIXLY - Page Notifications Hook
// Tracks which pages have been "discovered"
// via localStorage for lightweight persistence
// ===========================================

const STORAGE_KEY = 'pixly_pages_seen';

function loadSeenPages(): Set<HelpPageId> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as string[];
    return new Set(parsed as HelpPageId[]);
  } catch {
    return new Set();
  }
}

function persistSeenPages(seen: Set<HelpPageId>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(seen)));
  } catch {
    // localStorage unavailable
  }
}

export function usePageNotifications() {
  const [seenPages, setSeenPages] = useState<Set<HelpPageId>>(new Set());
  const [mounted, setMounted] = useState(false);

  // Load from localStorage after mount (SSR-safe)
  useEffect(() => {
    setSeenPages(loadSeenPages());
    setMounted(true);
  }, []);

  const isPageSeen = useCallback(
    (pageId: HelpPageId): boolean => {
      if (!mounted) return true; // Hide badges during SSR/hydration
      return seenPages.has(pageId);
    },
    [seenPages, mounted]
  );

  const markSeen = useCallback((pageId: HelpPageId) => {
    setSeenPages((prev) => {
      if (prev.has(pageId)) return prev;
      const next = new Set(prev);
      next.add(pageId);
      persistSeenPages(next);
      return next;
    });
  }, []);

  const unseenPages = useMemo(() => {
    if (!mounted) return [];
    return ALL_PAGE_IDS.filter((id) => !seenPages.has(id));
  }, [seenPages, mounted]);

  const unseenCount = unseenPages.length;

  const resetAll = useCallback(() => {
    setSeenPages(new Set());
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // localStorage unavailable
    }
  }, []);

  return {
    isPageSeen,
    markSeen,
    unseenPages,
    unseenCount,
    resetAll,
    isReady: mounted,
  };
}
