'use client';

import { motion } from 'framer-motion';
import { Skeleton, SkeletonButton } from '@/components/ui/skeleton';

// ===========================================
// PIXLY - Onboarding Loading
// Matches the two-panel onboarding layout
// ===========================================

export default function OnboardingLoading() {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Panel Skeleton */}
      <div className="hidden lg:flex lg:w-[420px] xl:w-[480px] flex-col bg-neutral-50 border-r border-neutral-100">
        <div className="flex flex-col h-full px-10 py-10">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-9 w-9 rounded-xl" />
            <Skeleton className="h-5 w-16" />
          </div>

          {/* Progress Steps */}
          <div className="mt-16">
            <Skeleton className="h-3 w-24 mb-6" />
            <div className="space-y-5">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-start gap-3">
                  <Skeleton className="h-7 w-7 rounded-full flex-shrink-0" />
                  <div className="pt-0.5">
                    <Skeleton className="h-4 w-32" />
                    {step === 1 && <Skeleton className="h-3 w-48 mt-1" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div className="mt-auto space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-neutral-100">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-4 w-36" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel Skeleton */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between px-6 py-5 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-9 w-9 rounded-xl" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>

        {/* Form Skeleton */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex items-center justify-center p-6 sm:p-10"
        >
          <div className="w-full max-w-[440px]">
            {/* Title */}
            <Skeleton className="h-8 w-80 mb-3" />
            <Skeleton className="h-4 w-64 mb-8" />

            {/* Form Field */}
            <div className="space-y-5">
              <div>
                <Skeleton className="h-4 w-28 mb-2" />
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-3 w-48 mt-1.5" />
              </div>

              <SkeletonButton size="lg" width="w-full" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
