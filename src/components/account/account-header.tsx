'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

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

  return (
    <header className={cn('border-b border-neutral-200/80 bg-white', className)}>
      <div className="mx-auto max-w-3xl px-6 py-5">
        <button
          onClick={() => router.push(backHref)}
          className="mb-3 flex items-center gap-1.5 text-[13px] text-neutral-400 transition-colors hover:text-neutral-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Retour au dashboard
        </button>

        <h1 className="text-[22px] font-semibold tracking-tight text-neutral-900">
          {title}
        </h1>
        {description && (
          <p className="mt-0.5 text-[13px] text-neutral-500">{description}</p>
        )}
      </div>
    </header>
  );
}
