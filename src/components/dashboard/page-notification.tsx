'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  LayoutDashboard,
  BarChart3,
  Filter,
  Target,
  Zap,
  CreditCard,
  Users,
} from 'lucide-react';
import { usePageNotifications } from '@/hooks/use-page-notifications';
import { getNotificationForRoute } from '@/lib/help/notifications';
import type { HelpPageId } from '@/lib/help/content';

// ===========================================
// PIXLY - Page Notification
// Inline pedagogical card shown once per page
// ===========================================

const PREMIUM_EASE = [0.22, 1, 0.36, 1] as const;

const pageIcons: Record<HelpPageId, React.ElementType> = {
  dashboard: LayoutDashboard,
  attribution: BarChart3,
  funnel: Filter,
  audience: Target,
  integrations: Zap,
  billing: CreditCard,
  team: Users,
};

export function PageNotification() {
  const pathname = usePathname();
  const { isPageSeen, markSeen, isReady } = usePageNotifications();
  const [dismissed, setDismissed] = useState(false);

  // Reset dismissed state when navigating to a new page
  useEffect(() => {
    setDismissed(false);
  }, [pathname]);

  if (!isReady) return null;

  const notification = getNotificationForRoute(pathname);
  if (!notification) return null;

  const { pageId } = notification;
  if (isPageSeen(pageId) || dismissed) return null;

  const Icon = pageIcons[pageId];

  const handleDismiss = () => {
    setDismissed(true);
    markSeen(pageId);
  };

  return (
    <AnimatePresence>
      <motion.div
        key={pageId}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3, ease: PREMIUM_EASE as unknown as number[] }}
        className="mb-5"
      >
        <div className="relative flex items-start gap-3.5 rounded-xl border border-primary-200/60 bg-primary-50/50 px-4 py-3.5 sm:items-center sm:gap-4 sm:px-5">
          {/* Icon */}
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary-100">
            <Icon className="h-4.5 w-4.5 text-primary-600" />
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <p className="text-sm sm:text-[13px] font-semibold text-primary-900">
              {notification.title}
            </p>
            <p className="mt-0.5 text-xs sm:text-[12px] leading-relaxed text-primary-700/80">
              {notification.description}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-shrink-0 items-center gap-1.5 sm:gap-2">
            <button
              onClick={handleDismiss}
              className="rounded-lg bg-primary-500 px-3.5 py-2 sm:px-3 sm:py-1.5 text-xs sm:text-[12px] font-medium text-white transition-colors hover:bg-primary-600"
            >
              Compris
            </button>
            <button
              onClick={handleDismiss}
              className="flex h-9 w-9 sm:h-7 sm:w-7 items-center justify-center rounded-lg text-primary-400 transition-colors hover:bg-primary-100 hover:text-primary-600"
              aria-label="Fermer la notification"
            >
              <X className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
