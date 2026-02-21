'use client';

import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2 } from 'lucide-react';
import { HELP_CONTENT, type HelpPageId } from '@/lib/help/content';

// ===========================================
// PIXLY - Contextual Help Drawer
// Slide-in panel with page-specific content
// ===========================================

interface HelpDrawerProps {
  pageId: HelpPageId;
  isOpen: boolean;
  onClose: () => void;
}

const PREMIUM_EASE = [0.22, 1, 0.36, 1] as const;

export function HelpDrawer({ pageId, isOpen, onClose }: HelpDrawerProps) {
  const content = HELP_CONTENT[pageId];

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-[2px]"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ duration: 0.3, ease: PREMIUM_EASE as unknown as number[] }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[400px] flex-col bg-white shadow-2xl"
            role="dialog"
            aria-label={`Aide : ${content.title}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-200/80 px-6 py-4">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                  Aide
                </p>
                <h2 className="mt-0.5 text-lg font-semibold text-neutral-900">
                  {content.title}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {/* Description */}
              <p className="text-[13px] leading-relaxed text-neutral-600">
                {content.description}
              </p>

              {/* Sections */}
              {content.sections.map((section) => (
                <div key={section.title} className="mt-6">
                  <h3 className="text-[12px] font-semibold uppercase tracking-wider text-neutral-400">
                    {section.title}
                  </h3>
                  <dl className="mt-3 space-y-3">
                    {section.items.map((item) => (
                      <div key={item.term}>
                        <dt className="text-[13px] font-medium text-neutral-900">
                          {item.term}
                        </dt>
                        <dd className="mt-0.5 text-[12px] leading-relaxed text-neutral-500">
                          {item.definition}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}

              {/* Tips */}
              {content.tips.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-[12px] font-semibold uppercase tracking-wider text-neutral-400">
                    Conseils
                  </h3>
                  <div className="mt-3 space-y-2">
                    {content.tips.map((tip, i) => (
                      <div
                        key={i}
                        className="flex gap-2.5 rounded-xl border border-emerald-200/60 bg-emerald-50/50 px-3.5 py-3"
                      >
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-500" />
                        <p className="text-[12px] leading-relaxed text-emerald-800">
                          {tip.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
