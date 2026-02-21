'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Settings,
  LogOut,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { Avatar } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/toast';

// ===========================================
// PIXLY - Profile Menu
// Dropdown menu accessible via avatar click
// ===========================================

interface ProfileMenuProps {
  isCollapsed?: boolean;
}

const menuItems = [
  {
    id: 'profile',
    label: 'Mon Profil',
    icon: User,
    href: '/profile',
  },
  {
    id: 'settings',
    label: 'Paramètres',
    icon: Settings,
    href: '/settings',
  },
];

export function ProfileMenu({ isCollapsed = false }: ProfileMenuProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close menu on Escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleNavigate = useCallback((href: string) => {
    setIsOpen(false);
    router.push(href);
  }, [router]);

  const handleLogout = useCallback(async () => {
    setIsOpen(false);
    // Set flag for login page to show logout success toast
    sessionStorage.setItem('pixly_logout_success', 'true');
    await logout();
    // Force hard navigation to ensure complete state reset
    // This bypasses client-side caching and forces middleware check
    window.location.href = '/login';
  }, [logout]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggle();
    }
  }, [handleToggle]);

  return (
    <div className="relative">
      {/* Dropdown Menu (positioned above trigger) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={cn(
              'absolute left-0 right-0 z-50',
              'bottom-full mb-2',
              'rounded-xl border border-neutral-200 bg-white shadow-lg',
              'overflow-hidden max-h-[calc(100vh-120px)] overflow-y-auto'
            )}
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="profile-menu-button"
          >
            {/* User Info Header */}
            <div className="border-b border-neutral-100 px-4 py-3">
              <p className="text-sm font-medium text-neutral-900 truncate">
                {user?.displayName || 'Utilisateur'}
              </p>
              <p className="text-xs text-neutral-500 truncate">
                {user?.email}
              </p>
            </div>

            {/* Menu Items */}
            <div className="py-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.href)}
                  className={cn(
                    'flex w-full items-center gap-3 px-4 py-3 text-left',
                    'text-sm text-neutral-700 transition-colors',
                    'hover:bg-neutral-50 focus:bg-neutral-50 focus:outline-none'
                  )}
                  role="menuitem"
                >
                  <item.icon className="h-4 w-4 text-neutral-400" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* Logout */}
            <div className="border-t border-neutral-100 py-1">
              <button
                onClick={handleLogout}
                className={cn(
                  'flex w-full items-center gap-3 px-4 py-2.5 text-left',
                  'text-sm text-red-600 transition-colors',
                  'hover:bg-red-50 focus:bg-red-50 focus:outline-none'
                )}
                role="menuitem"
              >
                <LogOut className="h-4 w-4" />
                <span>Se déconnecter</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger Button */}
      <button
        ref={triggerRef}
        id="profile-menu-button"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className={cn(
          'flex w-full items-center gap-3 rounded-xl p-2.5 transition-colors',
          'hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
          isOpen && 'bg-neutral-50',
          isCollapsed && 'justify-center'
        )}
      >
        <Avatar
          fallback={user?.displayName || user?.email || 'U'}
          size="md"
        />

        {!isCollapsed && (
          <>
            <div className="flex-1 min-w-0 text-left">
              <p className="truncate text-sm font-medium text-neutral-900">
                {user?.displayName || 'User'}
              </p>
              <p className="truncate text-xs text-neutral-500">
                {user?.email}
              </p>
            </div>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronUp className="h-4 w-4 text-neutral-400" />
            </motion.div>
          </>
        )}
      </button>
    </div>
  );
}
