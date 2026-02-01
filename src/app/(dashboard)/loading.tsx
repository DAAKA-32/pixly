'use client';

import { motion } from 'framer-motion';
import { LogoLoader } from '@/components/ui/loader';
import {
  SkeletonMetricCard,
  SkeletonChart,
  SkeletonTable,
} from '@/components/ui/skeleton';

// ===========================================
// PIXLY - Dashboard Loading
// Next.js automatic loading state for dashboard routes
// ===========================================

function SidebarSkeleton() {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-neutral-200 bg-white">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-neutral-200 px-6">
          <div className="h-8 w-8 animate-pulse rounded-lg bg-neutral-200" />
          <div className="h-6 w-24 animate-pulse rounded bg-neutral-200" />
        </div>

        {/* Workspace Selector */}
        <div className="border-b border-neutral-200 p-4">
          <div className="rounded-xl bg-neutral-50 px-4 py-3">
            <div className="h-4 w-28 animate-pulse rounded bg-neutral-200" />
            <div className="mt-1 h-3 w-20 animate-pulse rounded bg-neutral-200" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl px-3 py-2.5">
              <div className="h-5 w-5 animate-pulse rounded bg-neutral-200" />
              <div className="h-4 w-20 animate-pulse rounded bg-neutral-200" />
            </div>
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-neutral-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-full bg-neutral-200" />
            <div className="flex-1">
              <div className="h-4 w-24 animate-pulse rounded bg-neutral-200" />
              <div className="mt-1 h-3 w-32 animate-pulse rounded bg-neutral-200" />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Sidebar Skeleton */}
      <SidebarSkeleton />

      {/* Main Content */}
      <main className="ml-64 min-h-screen p-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="h-7 w-32 animate-pulse rounded bg-neutral-200" />
              <div className="mt-2 h-4 w-64 animate-pulse rounded bg-neutral-200" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-48 animate-pulse rounded-xl bg-neutral-200" />
              <div className="h-10 w-10 animate-pulse rounded-xl bg-neutral-200" />
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <SkeletonMetricCard />
            <SkeletonMetricCard />
            <SkeletonMetricCard />
            <SkeletonMetricCard />
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-neutral-200 bg-white p-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 animate-pulse rounded-xl bg-neutral-200" />
                  <div>
                    <div className="h-3 w-20 animate-pulse rounded bg-neutral-200" />
                    <div className="mt-2 h-6 w-24 animate-pulse rounded bg-neutral-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <SkeletonChart type="bar" />
            </div>
            <SkeletonChart type="donut" />
          </div>

          {/* Table */}
          <SkeletonTable rows={5} columns={5} />
        </motion.div>
      </main>
    </div>
  );
}
