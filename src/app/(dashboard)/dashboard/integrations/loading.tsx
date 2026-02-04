'use client';

import { motion } from 'framer-motion';

function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-neutral-100 ${className || ''}`} />;
}

export default function IntegrationsLoading() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <Sk className="h-6 w-32" />
        <Sk className="mt-2 h-3.5 w-64" />
      </div>

      {/* Pixel section */}
      <div className="rounded-2xl border border-neutral-200/80 bg-white px-4 py-3.5 sm:px-5 sm:py-4">
        <div className="flex items-center gap-3">
          <Sk className="h-9 w-9 rounded-lg" />
          <div>
            <Sk className="h-4 w-32" />
            <Sk className="mt-1.5 h-3 w-48" />
          </div>
        </div>
      </div>

      {/* Categories */}
      {[3, 2, 1].map((count, catIdx) => (
        <div key={catIdx}>
          <Sk className="mb-3 h-3.5 w-40" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-neutral-200/80 bg-white p-4 sm:p-5">
                <div className="flex items-center gap-3">
                  <Sk className="h-10 w-10 rounded-xl" />
                  <div>
                    <Sk className="h-4 w-24" />
                    <Sk className="mt-1.5 h-3 w-36" />
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <Sk className="h-3 w-20" />
                  <Sk className="h-9 w-24 rounded-xl sm:h-8" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </motion.div>
  );
}
