'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

// ===========================================
// PIXLY - Account Page Header
// Back navigation + title for full-width pages
// ===========================================

interface AccountHeaderProps {
  title: string;
  description?: string;
  backHref?: string;
  className?: string;
}

export function AccountHeader({
  title,
  description,
  backHref = '/dashboard',
  className,
}: AccountHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    router.push(backHref);
  };

  return (
    <header className={cn('border-b border-neutral-200 bg-white', className)}>
      <div className="mx-auto max-w-5xl px-6 py-6">
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={handleBack}
          className="mb-4 flex items-center gap-2 text-sm text-neutral-500 transition-colors hover:text-neutral-900"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Retour au dashboard</span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <h1 className="text-2xl font-bold text-neutral-900">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-neutral-500">{description}</p>
          )}
        </motion.div>
      </div>
    </header>
  );
}
