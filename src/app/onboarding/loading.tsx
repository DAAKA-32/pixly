'use client';

import { motion } from 'framer-motion';
import { LogoLoader } from '@/components/ui/loader';
import { Skeleton, SkeletonButton } from '@/components/ui/skeleton';

// ===========================================
// PIXLY - Onboarding Loading
// Next.js automatic loading state for onboarding
// ===========================================

export default function OnboardingLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-xl"
      >
        {/* Logo and Progress */}
        <div className="mb-8 flex flex-col items-center">
          <LogoLoader size="md" />

          {/* Progress Steps */}
          <div className="mt-8 flex items-center gap-2">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <Skeleton className="h-8 w-8 rounded-full" />
                {step < 4 && <Skeleton className="mx-1 h-0.5 w-8" />}
              </div>
            ))}
          </div>
        </div>

        {/* Content Card */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
          {/* Step Title */}
          <div className="mb-6 text-center">
            <Skeleton className="mx-auto h-7 w-64" />
            <Skeleton className="mx-auto mt-2 h-4 w-80" />
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            {[1, 2].map((i) => (
              <div key={i}>
                <Skeleton className="mb-2 h-4 w-28" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            ))}

            {/* Options Grid */}
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="rounded-xl border border-neutral-200 p-4"
                >
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <Skeleton className="mt-3 h-4 w-24" />
                  <Skeleton className="mt-1 h-3 w-32" />
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex justify-between">
            <SkeletonButton size="md" width="w-24" />
            <SkeletonButton size="md" width="w-32" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
