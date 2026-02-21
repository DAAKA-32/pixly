'use client';

import { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { HelpDrawer } from '@/components/help/help-drawer';
import type { HelpPageId } from '@/lib/help/content';

// ===========================================
// PIXLY - Help Button
// Reusable button for page headers
// Opens the contextual help drawer
// ===========================================

interface HelpButtonProps {
  pageId: HelpPageId;
}

export function HelpButton({ pageId }: HelpButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200/80 bg-white text-neutral-400 transition-colors hover:bg-neutral-50 hover:text-neutral-600"
        title="Aide"
        aria-label="Aide pour cette page"
      >
        <HelpCircle className="h-3.5 w-3.5" />
      </button>
      <HelpDrawer
        pageId={pageId}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
