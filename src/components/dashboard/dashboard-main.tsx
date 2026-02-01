'use client';

import { motion } from 'framer-motion';
import { useSidebar } from '@/hooks/use-sidebar';
import { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from './sidebar';

// ===========================================
// PIXLY - Dashboard Main Content Area
// Responsive to sidebar collapse state
// ===========================================

interface DashboardMainProps {
  children: React.ReactNode;
}

export function DashboardMain({ children }: DashboardMainProps) {
  const { isCollapsed, isHovered } = useSidebar();

  // Calculate margin based on sidebar state
  const marginLeft = isCollapsed && !isHovered ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  return (
    <motion.main
      initial={false}
      animate={{ marginLeft }}
      transition={{
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      }}
      className="min-h-screen p-8"
    >
      {children}
    </motion.main>
  );
}
