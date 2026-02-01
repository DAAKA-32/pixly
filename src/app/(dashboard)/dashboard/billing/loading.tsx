'use client';

import { motion } from 'framer-motion';
import { Skeleton, SkeletonButton, SkeletonTable } from '@/components/ui/skeleton';

// ===========================================
// PIXLY - Billing Loading
// Loading state for billing & subscription page
// ===========================================

export default function BillingLoading() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-7 w-32" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
      </div>

      {/* Current Plan Card */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-14 w-14 rounded-2xl" />
            <div>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="mt-2 h-4 w-48" />
            </div>
          </div>
          <div className="text-right">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="mt-1 h-4 w-16" />
          </div>
        </div>

        {/* Usage Stats */}
        <div className="mt-6 grid grid-cols-3 gap-6 border-t border-neutral-100 pt-6">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-2 h-6 w-32" />
              <Skeleton className="mt-2 h-2 w-full rounded-full" />
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          <SkeletonButton size="md" width="w-36" />
          <SkeletonButton size="md" width="w-32" />
        </div>
      </div>

      {/* Plans Grid */}
      <div>
        <Skeleton className="mb-4 h-6 w-48" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl border border-neutral-200 bg-white p-6">
              <Skeleton className="h-5 w-24" />
              <div className="mt-4 flex items-baseline gap-1">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="mt-2 h-4 w-32" />

              <div className="mt-6 space-y-3">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 flex-1" />
                  </div>
                ))}
              </div>

              <SkeletonButton size="md" width="w-full" className="mt-6" />
            </div>
          ))}
        </div>
      </div>

      {/* Billing History */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div>
              <Skeleton className="h-5 w-40" />
              <Skeleton className="mt-1 h-3 w-56" />
            </div>
          </div>
        </div>
        <SkeletonTable rows={5} columns={4} className="border-0 p-0" />
      </div>
    </motion.div>
  );
}
