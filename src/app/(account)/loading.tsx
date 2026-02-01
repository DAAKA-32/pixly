'use client';

import { motion } from 'framer-motion';
import { Skeleton, SkeletonAvatar, SkeletonText, SkeletonButton } from '@/components/ui/skeleton';

// ===========================================
// PIXLY - Account Loading
// Next.js automatic loading state for account routes
// Profile & Settings pages
// ===========================================

export default function AccountLoading() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 animate-pulse rounded-lg bg-neutral-200" />
            <div className="h-5 w-24 animate-pulse rounded bg-neutral-200" />
          </div>
          <div className="h-9 w-28 animate-pulse rounded-xl bg-neutral-200" />
        </div>
      </header>

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="mx-auto max-w-4xl space-y-8 p-6 lg:p-8"
      >
        {/* Profile Banner Skeleton */}
        <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden">
          {/* Banner */}
          <Skeleton className="h-32 w-full rounded-none" />

          {/* Profile Info */}
          <div className="relative px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
              <SkeletonAvatar size="xl" className="ring-4 ring-white" />
              <div className="flex-1 pt-2 sm:pt-0 sm:pb-1">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="mt-2 h-4 w-32" />
              </div>
              <SkeletonButton size="sm" width="w-20" />
            </div>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Section 1 - Personal Info */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <div className="flex items-center gap-3 mb-6">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div>
                <Skeleton className="h-5 w-40" />
                <Skeleton className="mt-1 h-3 w-56" />
              </div>
            </div>

            <div className="space-y-4">
              {/* Form fields */}
              {[1, 2, 3].map((i) => (
                <div key={i}>
                  <Skeleton className="mb-2 h-4 w-24" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>
              ))}
            </div>
          </div>

          {/* Section 2 - Branding */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <div className="flex items-center gap-3 mb-6">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div>
                <Skeleton className="h-5 w-48" />
                <Skeleton className="mt-1 h-3 w-64" />
              </div>
            </div>

            {/* Avatar Style Options */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl border border-neutral-200 p-4 flex flex-col items-center gap-3">
                  <SkeletonAvatar size="lg" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-24" />
                </div>
              ))}
            </div>

            {/* Color Options */}
            <div className="flex gap-3 mb-4">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <Skeleton key={i} className="h-10 w-10 rounded-full" />
              ))}
            </div>
          </div>

          {/* Section 3 - Social Links */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <div className="flex items-center gap-3 mb-6">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div>
                <Skeleton className="h-5 w-36" />
                <Skeleton className="mt-1 h-3 w-48" />
              </div>
            </div>

            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i}>
                  <Skeleton className="mb-2 h-4 w-20" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <SkeletonButton size="lg" width="w-40" />
        </div>
      </motion.main>
    </div>
  );
}
