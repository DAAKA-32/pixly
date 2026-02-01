'use client';

import { motion } from 'framer-motion';
import { Skeleton, SkeletonTable, SkeletonChart } from '@/components/ui/skeleton';

// ===========================================
// PIXLY - Attribution Loading
// Loading state for attribution analytics page
// ===========================================

export default function AttributionLoading() {
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
          <Skeleton className="h-7 w-40" />
          <Skeleton className="mt-2 h-4 w-72" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-48 rounded-xl" />
          <Skeleton className="h-10 w-10 rounded-xl" />
        </div>
      </div>

      {/* Model Selector */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div>
            <Skeleton className="h-5 w-48" />
            <Skeleton className="mt-1 h-3 w-64" />
          </div>
        </div>
        <div className="flex gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-10 w-28 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Attribution Flow Chart */}
      <SkeletonChart type="bar" className="h-96" />

      {/* Touchpoint Analysis */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <div className="flex items-center gap-3 mb-6">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div>
              <Skeleton className="h-5 w-36" />
              <Skeleton className="mt-1 h-3 w-48" />
            </div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="mt-1 h-2 w-full rounded-full" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
        <SkeletonChart type="donut" />
      </div>

      {/* Attribution Table */}
      <SkeletonTable rows={8} columns={6} />
    </motion.div>
  );
}
