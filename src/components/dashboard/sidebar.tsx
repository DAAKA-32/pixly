'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  BarChart3,
  Zap,
  CreditCard,
  HelpCircle,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWorkspace } from '@/hooks/use-workspace';
import { useSidebar } from '@/hooks/use-sidebar';
import { ProfileMenu } from './profile-menu';
import { LogoIcon } from '@/components/ui/logo';

// ===========================================
// PIXLY - Dashboard Sidebar
// Collapsible with synchronized CSS transitions
// ===========================================

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Attribution', href: '/dashboard/attribution', icon: BarChart3 },
  { name: 'Integrations', href: '/dashboard/integrations', icon: Zap },
  { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
];

const SIDEBAR_WIDTH = 256; // 16rem = w-64
const SIDEBAR_COLLAPSED_WIDTH = 72; // w-18
const TRANSITION_DURATION = 250; // ms - single source of truth for timing

export function Sidebar() {
  const pathname = usePathname();
  const { currentWorkspace } = useWorkspace();
  const { isCollapsed, isHovered, toggle, setHovered } = useSidebar();

  // Determine effective collapsed state (expand on hover when collapsed)
  const showExpanded = !isCollapsed || isHovered;
  const currentWidth = showExpanded ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH;

  // CSS transition style for synchronized animations
  const transitionStyle = `all ${TRANSITION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`;

  return (
    <aside
      onMouseEnter={() => isCollapsed && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: currentWidth,
        transition: transitionStyle,
      }}
      className="fixed left-0 top-0 z-40 h-screen border-r border-neutral-200 bg-white"
    >
      <div className="flex h-full flex-col overflow-hidden">
        {/* Header: Logo + Toggle */}
        <div className="flex h-16 items-center border-b border-neutral-200 px-3">
          {/* Logo Section */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 min-w-0 flex-1"
          >
            <div className="flex-shrink-0 flex items-center justify-center w-10 h-10">
              <LogoIcon size="xs" />
            </div>
            <span
              style={{
                opacity: showExpanded ? 1 : 0,
                transform: showExpanded ? 'translateX(0)' : 'translateX(-8px)',
                transition: transitionStyle,
              }}
              className={cn(
                'text-lg font-bold text-neutral-900 whitespace-nowrap',
                !showExpanded && 'pointer-events-none'
              )}
            >
              Pixly
            </span>
          </Link>

          {/* Toggle Button - Fixed position */}
          <button
            onClick={toggle}
            style={{ transition: transitionStyle }}
            className={cn(
              'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg',
              'text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600',
              'transition-colors'
            )}
            title={isCollapsed ? 'Agrandir la sidebar' : 'Réduire la sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <PanelLeft className="h-5 w-5" />
            ) : (
              <PanelLeftClose className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Workspace Selector */}
        <div className="border-b border-neutral-200 p-3">
          <button
            style={{ transition: transitionStyle }}
            className={cn(
              'flex w-full items-center gap-3 rounded-xl bg-neutral-50 text-left',
              'hover:bg-neutral-100',
              showExpanded ? 'px-3 py-2.5' : 'px-2 py-2.5 justify-center'
            )}
          >
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-600 font-semibold text-sm">
              {currentWorkspace?.name?.charAt(0).toUpperCase() || 'W'}
            </div>
            <div
              style={{
                opacity: showExpanded ? 1 : 0,
                maxWidth: showExpanded ? '150px' : '0px',
                transition: transitionStyle,
              }}
              className="min-w-0 overflow-hidden"
            >
              <p className="truncate text-sm font-medium text-neutral-900">
                {currentWorkspace?.name || 'Select workspace'}
              </p>
              <p className="truncate text-xs text-neutral-500">
                {currentWorkspace?.pixelId || 'No pixel'}
              </p>
            </div>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                style={{ transition: transitionStyle }}
                className={cn(
                  'group relative flex items-center gap-3 rounded-xl text-sm font-medium',
                  showExpanded ? 'px-3 py-2.5' : 'px-2 py-2.5 justify-center',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                )}
                title={!showExpanded ? item.name : undefined}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span
                  style={{
                    opacity: showExpanded ? 1 : 0,
                    maxWidth: showExpanded ? '150px' : '0px',
                    transition: transitionStyle,
                  }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  {item.name}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="absolute left-0 h-8 w-1 rounded-r-full bg-primary-500"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Help */}
        <div className="border-t border-neutral-200 p-3">
          <Link
            href="/help"
            style={{ transition: transitionStyle }}
            className={cn(
              'flex items-center gap-3 rounded-xl text-sm font-medium text-neutral-500',
              'hover:bg-neutral-50 hover:text-neutral-700',
              showExpanded ? 'px-3 py-2.5' : 'px-2 py-2.5 justify-center'
            )}
            title={!showExpanded ? 'Help & Support' : undefined}
          >
            <HelpCircle className="h-5 w-5 flex-shrink-0" />
            <span
              style={{
                opacity: showExpanded ? 1 : 0,
                maxWidth: showExpanded ? '150px' : '0px',
                transition: transitionStyle,
              }}
              className="whitespace-nowrap overflow-hidden"
            >
              Help & Support
            </span>
          </Link>
        </div>

        {/* User Profile Menu */}
        <div className="border-t border-neutral-200 p-3">
          <ProfileMenu isCollapsed={!showExpanded} />
        </div>
      </div>
    </aside>
  );
}

// Export constants for layout usage
export { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH };
