'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  BarChart3,
  Zap,
  CreditCard,
  HelpCircle,
  PanelLeftClose,
  X,
  Menu,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWorkspace } from '@/hooks/use-workspace';
import { useSidebar } from '@/hooks/use-sidebar';
import { ProfileMenu } from './profile-menu';
import { LogoIcon } from '@/components/ui/logo';

// ===========================================
// PIXLY - Dashboard Sidebar
// Desktop: collapsible with edge toggle
// Mobile: drawer with top header bar
// ===========================================

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Attribution', href: '/dashboard/attribution', icon: BarChart3 },
  { name: 'Intégrations', href: '/dashboard/integrations', icon: Zap },
  { name: 'Facturation', href: '/dashboard/billing', icon: CreditCard },
];

const SIDEBAR_WIDTH = 256;
const SIDEBAR_COLLAPSED_WIDTH = 72;

export function Sidebar() {
  const pathname = usePathname();
  const { currentWorkspace } = useWorkspace();
  const { isCollapsed, isMobileOpen, toggle, openMobile, closeMobile } = useSidebar();

  const expanded = !isCollapsed;

  // Shared content for desktop + mobile drawer
  const sidebarContent = (mobile: boolean) => {
    const show = mobile || expanded;

    return (
      <div className="flex h-full flex-col">
        {/* ── Header ── */}
        <div
          className={cn(
            'flex h-16 items-center border-b border-neutral-200',
            show ? 'px-3' : 'justify-center px-2'
          )}
        >
          <Link
            href="/dashboard"
            className={cn(
              'flex items-center gap-2.5 min-w-0',
              show && 'flex-1'
            )}
            onClick={mobile ? closeMobile : undefined}
          >
            <div className="flex-shrink-0 flex items-center justify-center w-10 h-10">
              <LogoIcon size="xs" />
            </div>
            {show && (
              <span className="text-lg font-bold text-neutral-900 whitespace-nowrap">
                Pixly
              </span>
            )}
          </Link>

          {mobile ? (
            <button
              onClick={closeMobile}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
              aria-label="Fermer le menu"
            >
              <X className="h-5 w-5" />
            </button>
          ) : show ? (
            <button
              onClick={toggle}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
              title="Réduire la sidebar"
              aria-label="Réduire la sidebar"
            >
              <PanelLeftClose className="h-[18px] w-[18px]" />
            </button>
          ) : null}
        </div>

        {/* ── Workspace ── */}
        <div className="border-b border-neutral-200 p-3">
          <div
            className={cn(
              'flex items-center rounded-xl bg-neutral-50 transition-colors hover:bg-neutral-100',
              show ? 'gap-3 px-3 py-2.5' : 'justify-center px-2 py-2.5'
            )}
          >
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-600 font-semibold text-sm">
              {currentWorkspace?.name?.charAt(0).toUpperCase() || 'W'}
            </div>
            {show && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-neutral-900">
                  {currentWorkspace?.name || 'Espace de travail'}
                </p>
                <p className="truncate text-xs text-neutral-500">
                  {currentWorkspace?.pixelId || 'Aucun pixel'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={mobile ? closeMobile : undefined}
                className={cn(
                  'group relative flex items-center rounded-xl text-sm font-medium transition-colors',
                  show ? 'gap-3 px-3 py-2.5' : 'justify-center px-2 py-2.5',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                )}
                title={!show ? item.name : undefined}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {show && <span className="whitespace-nowrap">{item.name}</span>}
                {isActive && (
                  <motion.div
                    layoutId={mobile ? 'sidebar-active-mobile' : 'sidebar-active'}
                    className="absolute left-0 h-8 w-1 rounded-r-full bg-primary-500"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── Help ── */}
        <div className="border-t border-neutral-200 p-3">
          <Link
            href="/help"
            onClick={mobile ? closeMobile : undefined}
            className={cn(
              'flex items-center rounded-xl text-sm font-medium text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700 transition-colors',
              show ? 'gap-3 px-3 py-2.5' : 'justify-center px-2 py-2.5'
            )}
            title={!show ? 'Aide' : undefined}
          >
            <HelpCircle className="h-5 w-5 flex-shrink-0" />
            {show && <span>Aide</span>}
          </Link>
        </div>

        {/* ── Profile ── */}
        <div className="border-t border-neutral-200 p-3">
          <ProfileMenu isCollapsed={!show} />
        </div>
      </div>
    );
  };

  return (
    <>
      {/* ── Mobile Header Bar ── */}
      <div className="fixed top-0 left-0 right-0 z-30 flex h-14 items-center border-b border-neutral-200 bg-white px-4 lg:hidden">
        <button
          onClick={openMobile}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-neutral-600 hover:bg-neutral-100 transition-colors -ml-1"
          aria-label="Ouvrir le menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link href="/dashboard" className="flex flex-1 items-center justify-center gap-2">
          <LogoIcon size="xs" />
          <span className="text-lg font-bold text-neutral-900">Pixly</span>
        </Link>
        <div className="w-9" />
      </div>

      {/* ── Desktop Sidebar ── */}
      <aside
        style={{
          width: expanded ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH,
          transition: 'width 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        className="fixed left-0 top-0 z-40 h-screen border-r border-neutral-200 bg-white hidden lg:block group/sidebar"
      >
        {sidebarContent(false)}

        {/* Edge toggle — appears on sidebar hover */}
        <button
          onClick={toggle}
          className={cn(
            'absolute -right-3 top-7 z-50',
            'flex h-6 w-6 items-center justify-center',
            'rounded-full border border-neutral-200/80 bg-white shadow-sm',
            'text-neutral-400 hover:text-neutral-600 hover:shadow-md',
            'opacity-0 group-hover/sidebar:opacity-100 focus:opacity-100',
            'focus:outline-none focus:ring-2 focus:ring-primary-500/40',
            'transition-all duration-200'
          )}
          aria-label={isCollapsed ? 'Ouvrir la sidebar' : 'Réduire la sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </button>
      </aside>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px] lg:hidden"
              onClick={closeMobile}
            />
            <motion.aside
              initial={{ x: -SIDEBAR_WIDTH }}
              animate={{ x: 0 }}
              exit={{ x: -SIDEBAR_WIDTH }}
              transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
              className="fixed left-0 top-0 z-50 h-screen border-r border-neutral-200 bg-white shadow-2xl lg:hidden"
              style={{ width: SIDEBAR_WIDTH }}
            >
              {sidebarContent(true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH };
