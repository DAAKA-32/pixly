'use client';

import { motion } from 'framer-motion';
import { Skeleton, SkeletonButton } from '@/components/ui/skeleton';

// ===========================================
// PIXLY - Integrations Loading
// Loading state for integrations & connections page
// ===========================================

export default function IntegrationsLoading() {
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
          <Skeleton className="mt-2 h-4 w-80" />
        </div>
      </div>

      {/* Pixel Code Section */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div>
            <Skeleton className="h-5 w-48" />
            <Skeleton className="mt-1 h-3 w-64" />
          </div>
        </div>
        <div className="rounded-xl bg-neutral-900 p-4">
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-4 w-full bg-neutral-700" />
            ))}
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <SkeletonButton size="sm" width="w-28" />
          <SkeletonButton size="sm" width="w-36" />
        </div>
      </div>

      {/* Ad Platforms */}
      <div>
        <Skeleton className="mb-4 h-6 w-40" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[
            { name: 'Meta Ads', color: 'bg-blue-500' },
            { name: 'Google Ads', color: 'bg-red-500' },
            { name: 'TikTok Ads', color: 'bg-neutral-900' },
            { name: 'LinkedIn Ads', color: 'bg-blue-700' },
          ].map((platform, i) => (
            <div key={i} className="rounded-2xl border border-neutral-200 bg-white p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className={`h-12 w-12 rounded-xl ${platform.color}`} />
                  <div>
                    <Skeleton className="h-5 w-28" />
                    <Skeleton className="mt-1 h-3 w-40" />
                  </div>
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>

              <SkeletonButton size="md" width="w-full" className="mt-4" />
            </div>
          ))}
        </div>
      </div>

      {/* Payment Platforms */}
      <div>
        <Skeleton className="mb-4 h-6 w-48" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-2xl border border-neutral-200 bg-white p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div>
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="mt-1 h-3 w-48" />
                  </div>
                </div>
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <SkeletonButton size="md" width="w-full" className="mt-4" />
            </div>
          ))}
        </div>
      </div>

      {/* Webhooks Section */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="mt-1 h-3 w-56" />
            </div>
          </div>
          <SkeletonButton size="sm" width="w-32" />
        </div>

        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between rounded-xl border border-neutral-100 p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <div>
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="mt-1 h-3 w-48" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
