'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/hooks/use-sidebar';
import { PageNotification } from './page-notification';
import { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from './sidebar';

// ===========================================
// PIXLY - Dashboard Main Content Area
// Responsive to sidebar collapse state
// Content fade-in on route transitions
// Mobile: full-width with top header offset
// ===========================================

interface DashboardMainProps {
  children: React.ReactNode;
}

export function DashboardMain({ children }: DashboardMainProps) {
  const { isCollapsed } = useSidebar();
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 1023px)');
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  // Mobile: no margin (sidebar is a drawer). Desktop: respond to sidebar state.
  const marginLeft = isMobile
    ? 0
    : isCollapsed
      ? SIDEBAR_COLLAPSED_WIDTH
      : SIDEBAR_WIDTH;

  return (
    <motion.main
      initial={false}
      animate={{ marginLeft }}
      transition={{
        duration: isMobile ? 0 : 0.3,
        ease: [0.4, 0, 0.2, 1],
      }}
      className="min-h-screen px-4 pb-6 pt-20 lg:px-8 lg:pb-8 lg:pt-8"
    >
      <motion.div
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <PageNotification />
        {children}
      </motion.div>
    </motion.main>
  );
}
