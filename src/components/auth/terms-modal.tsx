'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, FileText, Check, ExternalLink, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';

// ===========================================
// PIXLY - Terms Acceptance Modal
// Blocking modal for GDPR-compliant CGU acceptance
// Cannot be dismissed — user must accept to continue
// ===========================================

const PREMIUM_EASE = [0.22, 1, 0.36, 1] as const;

const LEGAL_LINKS = [
  {
    href: '/terms',
    label: "Conditions générales d'utilisation",
    icon: FileText,
  },
  {
    href: '/privacy',
    label: 'Politique de confidentialité',
    icon: Shield,
  },
  {
    href: '/cookies',
    label: 'Politique de cookies',
    icon: FileText,
  },
];

interface TermsModalProps {
  onAccepted: () => void;
  /** If true, show a logout button for users who want to decline */
  showLogout?: boolean;
}

export function TermsModal({ onAccepted, showLogout = true }: TermsModalProps) {
  const { acceptTerms, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAccept = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await acceptTerms();
      onAccepted();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Une erreur est survenue. Veuillez réessayer.'
      );
      setIsLoading(false);
    }
  };

  const handleDecline = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <AnimatePresence>
      {/* Backdrop — NOT dismissible */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      >
        {/* Modal */}
        <motion.div
          initial={{ scale: 0.97, y: 16, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.97, y: 16, opacity: 0 }}
          transition={{ duration: 0.3, ease: PREMIUM_EASE as unknown as number[] }}
          className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl"
          role="dialog"
          aria-label="Acceptation des conditions"
          aria-modal="true"
        >
          {/* Content */}
          <div className="px-6 sm:px-8 pb-6 pt-8 sm:pt-10">
            <div className="flex flex-col items-center text-center">
              {/* Icon */}
              <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-primary-50">
                <Shield className="h-7 w-7 sm:h-8 sm:w-8 text-primary-600" />
              </div>

              {/* Title */}
              <h2 className="mt-5 sm:mt-6 font-serif text-xl sm:text-2xl font-semibold text-neutral-900">
                Avant de commencer
              </h2>

              {/* Description */}
              <p className="mt-2 sm:mt-3 max-w-sm text-[13px] sm:text-[14px] leading-relaxed text-neutral-500">
                Pour utiliser Pixly, veuillez prendre connaissance et accepter
                nos conditions.
              </p>

              {/* Legal document links */}
              <div className="mt-5 sm:mt-6 w-full space-y-2">
                {LEGAL_LINKS.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-neutral-200/80 bg-neutral-50/50 px-4 py-3 text-left transition-colors hover:bg-neutral-100"
                  >
                    <Icon className="h-4 w-4 text-neutral-400 flex-shrink-0" />
                    <span className="text-sm text-neutral-700 flex-1">{label}</span>
                    <ExternalLink className="h-3.5 w-3.5 text-neutral-300" />
                  </Link>
                ))}
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="mt-4 text-sm text-red-500"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-neutral-100 px-6 sm:px-8 py-4">
            <Button
              className="w-full h-11 sm:h-12 text-sm sm:text-base font-medium shadow-lg shadow-primary-500/15"
              onClick={handleAccept}
              isLoading={isLoading}
            >
              <Check className="mr-2 h-4 w-4" />
              J&apos;accepte les conditions
            </Button>
            <p className="mt-3 text-center text-[11px] sm:text-xs text-neutral-400 leading-relaxed">
              En cliquant, vous acceptez nos CGU, notre politique de
              confidentialité et notre politique de cookies.
            </p>
            {showLogout && (
              <button
                onClick={handleDecline}
                className="mt-3 flex items-center justify-center gap-1.5 w-full text-[13px] font-medium text-neutral-400 transition-colors hover:text-neutral-600"
              >
                <LogOut className="h-3.5 w-3.5" />
                Se déconnecter
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
