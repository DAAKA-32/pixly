'use client';

import { motion } from 'framer-motion';

// ===========================================
// PIXLY - Dashboard Skeleton Loading
// Premium loading experience matching final layout
// Responsive: desktop sidebar + mobile header
// ===========================================

function SkeletonPulse({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-neutral-200/70 ${className || ''}`}
      style={style}
    />
  );
}

function MetricCardSkeleton() {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <SkeletonPulse className="h-4 w-24" />
        <SkeletonPulse className="h-10 w-10 rounded-xl" />
      </div>
      <div className="mt-4">
        <SkeletonPulse className="h-8 w-32" />
        <SkeletonPulse className="mt-2 h-4 w-20" />
      </div>
    </div>
  );
}

function SecondaryMetricSkeleton() {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6">
      <div className="flex items-center gap-3">
        <SkeletonPulse className="h-10 w-10 rounded-xl" />
        <div>
          <SkeletonPulse className="h-3 w-20" />
          <SkeletonPulse className="mt-2 h-6 w-24" />
        </div>
      </div>
      <SkeletonPulse className="mt-2 h-3 w-32" />
    </div>
  );
}

function ChartSkeleton({ height = 'h-72' }: { height?: string }) {
  return (
    <div className={`rounded-2xl border border-neutral-200 bg-white p-6 ${height}`}>
      <div className="mb-6 flex items-center gap-3">
        <SkeletonPulse className="h-10 w-10 rounded-xl" />
        <div>
          <SkeletonPulse className="h-4 w-32" />
          <SkeletonPulse className="mt-1 h-3 w-40" />
        </div>
      </div>
      <div className="flex h-48 items-end justify-between gap-2 px-4">
        {[40, 65, 45, 80, 55, 70, 50, 85, 60, 75, 45, 90].map((h, i) => (
          <SkeletonPulse
            key={i}
            className="w-full rounded-t-md"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}

function DonutChartSkeleton() {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6">
      <div className="mb-6 flex items-center gap-3">
        <SkeletonPulse className="h-10 w-10 rounded-xl" />
        <div>
          <SkeletonPulse className="h-4 w-36" />
          <SkeletonPulse className="mt-1 h-3 w-28" />
        </div>
      </div>
      <div className="flex flex-col items-center gap-6">
        <SkeletonPulse className="h-32 w-32 rounded-full" />
        <div className="w-full space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <SkeletonPulse className="h-3 w-3 rounded-full" />
              <SkeletonPulse className="h-3 flex-1" />
              <SkeletonPulse className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SkeletonPulse className="h-10 w-10 rounded-xl" />
          <div>
            <SkeletonPulse className="h-4 w-40" />
            <SkeletonPulse className="mt-1 h-3 w-28" />
          </div>
        </div>
      </div>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex gap-4 border-b border-neutral-100 pb-3">
          <SkeletonPulse className="h-3 w-24" />
          <SkeletonPulse className="h-3 w-20" />
          <SkeletonPulse className="h-3 w-16" />
          <SkeletonPulse className="h-3 flex-1" />
          <SkeletonPulse className="h-3 w-24" />
        </div>
        {/* Rows */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4 py-3">
            <SkeletonPulse className="h-8 w-8 rounded-lg" />
            <SkeletonPulse className="h-4 w-24" />
            <SkeletonPulse className="h-5 w-16 rounded-full" />
            <SkeletonPulse className="h-4 flex-1" />
            <SkeletonPulse className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-neutral-200 bg-white hidden lg:block">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-neutral-200 px-4">
          <SkeletonPulse className="h-7 w-7 rounded-xl" />
          <SkeletonPulse className="h-5 w-16" />
        </div>

        {/* Workspace */}
        <div className="border-b border-neutral-200 p-3">
          <div className="flex items-center gap-3 rounded-xl bg-neutral-50 px-3 py-2.5">
            <SkeletonPulse className="h-9 w-9 rounded-lg" />
            <div>
              <SkeletonPulse className="h-4 w-24" />
              <SkeletonPulse className="mt-1 h-3 w-16" />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl px-3 py-2.5">
              <SkeletonPulse className="h-5 w-5" />
              <SkeletonPulse className="h-4 w-20" />
            </div>
          ))}
        </nav>

        {/* Help */}
        <div className="border-t border-neutral-200 p-3">
          <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
            <SkeletonPulse className="h-5 w-5" />
            <SkeletonPulse className="h-4 w-12" />
          </div>
        </div>

        {/* User */}
        <div className="border-t border-neutral-200 p-3">
          <div className="flex items-center gap-3 p-2">
            <SkeletonPulse className="h-10 w-10 rounded-full" />
            <div className="flex-1">
              <SkeletonPulse className="h-4 w-24" />
              <SkeletonPulse className="mt-1 h-3 w-32" />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function MobileHeaderSkeleton() {
  return (
    <div className="fixed top-0 left-0 right-0 z-30 flex h-14 items-center border-b border-neutral-200 bg-white px-4 lg:hidden">
      <SkeletonPulse className="h-10 w-10 rounded-xl" />
      <div className="flex flex-1 items-center justify-center gap-2">
        <SkeletonPulse className="h-7 w-7 rounded-xl" />
        <SkeletonPulse className="h-5 w-14" />
      </div>
      <div className="w-9" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <SidebarSkeleton />
      <MobileHeaderSkeleton />

      <main className="dashboard-content min-h-screen px-4 pb-6 pt-20 lg:ml-64 lg:px-8 lg:pb-8 lg:pt-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <SkeletonPulse className="h-7 w-32" />
              <SkeletonPulse className="mt-2 h-4 w-64" />
            </div>
            <div className="flex items-center gap-3">
              <SkeletonPulse className="h-10 w-48 rounded-xl" />
              <SkeletonPulse className="h-10 w-10 rounded-xl" />
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <SecondaryMetricSkeleton />
            <SecondaryMetricSkeleton />
            <SecondaryMetricSkeleton />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ChartSkeleton height="h-96" />
            </div>
            <DonutChartSkeleton />
          </div>

          {/* Table */}
          <TableSkeleton />
        </motion.div>
      </main>
    </div>
  );
}

// Compact loading indicator for transitions
export function DashboardLoadingOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-50/80 backdrop-blur-sm"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-primary-100" />
          <div className="absolute inset-0 h-12 w-12 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
        </div>
        <p className="text-sm font-medium text-neutral-600">Chargement du dashboard...</p>
      </div>
    </motion.div>
  );
}

export { MetricCardSkeleton, ChartSkeleton, TableSkeleton, SidebarSkeleton, MobileHeaderSkeleton };
