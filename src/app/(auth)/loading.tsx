'use client';

import { motion } from 'framer-motion';
import { LogoLoader } from '@/components/ui/loader';

// ===========================================
// PIXLY - Auth Loading
// Next.js automatic loading state for auth routes
// ===========================================

export default function AuthLoading() {
  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Form Area */}
      <div className="flex flex-1 flex-col justify-center px-8 py-12 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-8"
          >
            {/* Logo placeholder */}
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 animate-pulse rounded-xl bg-neutral-200" />
              <div className="h-6 w-24 animate-pulse rounded bg-neutral-200" />
            </div>

            {/* Title area */}
            <div className="space-y-2">
              <div className="h-8 w-48 animate-pulse rounded bg-neutral-200" />
              <div className="h-4 w-64 animate-pulse rounded bg-neutral-200" />
            </div>

            {/* Form skeleton */}
            <div className="space-y-6">
              {/* Input fields */}
              {[1, 2, 3].map((i) => (
                <div key={i}>
                  <div className="mb-2 h-4 w-20 animate-pulse rounded bg-neutral-200" />
                  <div className="h-12 w-full animate-pulse rounded-xl bg-neutral-200" />
                </div>
              ))}

              {/* Submit button */}
              <div className="h-12 w-full animate-pulse rounded-xl bg-primary-100" />

              {/* Divider */}
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-neutral-200" />
                <div className="h-4 w-8 animate-pulse rounded bg-neutral-200" />
                <div className="h-px flex-1 bg-neutral-200" />
              </div>

              {/* Social buttons */}
              <div className="h-12 w-full animate-pulse rounded-xl bg-neutral-100" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Branding Area */}
      <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center bg-gradient-to-br from-primary-500 to-primary-600">
        <LogoLoader size="lg" text="Chargement..." />
      </div>
    </div>
  );
}
