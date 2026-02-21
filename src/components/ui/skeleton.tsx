import { cn } from '@/lib/utils';

// ===========================================
// PIXLY - Skeleton Components
// Reusable skeleton primitives for loading states
// Single animation: CSS animate-pulse (opacity 1.5s)
// ===========================================

// ============ BASE SKELETON ============
interface SkeletonProps {
  className?: string;
  animate?: boolean;
  style?: React.CSSProperties;
}

export function Skeleton({ className, animate = true, style }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-md bg-neutral-200/70',
        animate && 'animate-pulse',
        className
      )}
      style={style}
    />
  );
}

// ============ TEXT SKELETON ============
interface SkeletonTextProps {
  lines?: number;
  className?: string;
  lastLineWidth?: string;
}

export function SkeletonText({ lines = 3, className, lastLineWidth = 'w-3/4' }: SkeletonTextProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4',
            i === lines - 1 ? lastLineWidth : 'w-full'
          )}
        />
      ))}
    </div>
  );
}

// ============ AVATAR SKELETON ============
interface SkeletonAvatarProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const avatarSizes = {
  xs: 'h-6 w-6',
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
};

export function SkeletonAvatar({ size = 'md', className }: SkeletonAvatarProps) {
  return <Skeleton className={cn('rounded-full', avatarSizes[size], className)} />;
}

// ============ BUTTON SKELETON ============
interface SkeletonButtonProps {
  size?: 'sm' | 'md' | 'lg';
  width?: string;
  className?: string;
}

const buttonSizes = {
  sm: 'h-9',
  md: 'h-11',
  lg: 'h-12',
};

export function SkeletonButton({ size = 'md', width = 'w-24', className }: SkeletonButtonProps) {
  return <Skeleton className={cn('rounded-xl', buttonSizes[size], width, className)} />;
}

// ============ CARD SKELETON ============
interface SkeletonCardProps {
  hasImage?: boolean;
  hasActions?: boolean;
  className?: string;
}

export function SkeletonCard({ hasImage = false, hasActions = false, className }: SkeletonCardProps) {
  return (
    <div className={cn('rounded-2xl border border-neutral-200 bg-white p-6', className)}>
      {hasImage && <Skeleton className="mb-4 h-40 w-full rounded-xl" />}
      <div className="flex items-start gap-3">
        <SkeletonAvatar size="md" />
        <div className="flex-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-2 h-3 w-24" />
        </div>
      </div>
      <SkeletonText lines={2} className="mt-4" />
      {hasActions && (
        <div className="mt-4 flex gap-2">
          <SkeletonButton size="sm" width="w-20" />
          <SkeletonButton size="sm" width="w-20" />
        </div>
      )}
    </div>
  );
}

// ============ LIST ITEM SKELETON ============
interface SkeletonListItemProps {
  hasAvatar?: boolean;
  hasAction?: boolean;
  className?: string;
}

export function SkeletonListItem({ hasAvatar = true, hasAction = false, className }: SkeletonListItemProps) {
  return (
    <div className={cn('flex items-center gap-4 p-4', className)}>
      {hasAvatar && <SkeletonAvatar size="md" />}
      <div className="flex-1">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-2 h-3 w-48" />
      </div>
      {hasAction && <SkeletonButton size="sm" width="w-16" />}
    </div>
  );
}

// ============ TABLE SKELETON ============
interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function SkeletonTable({ rows = 5, columns = 4, className }: SkeletonTableProps) {
  return (
    <div className={cn('rounded-2xl border border-neutral-200 bg-white', className)}>
      {/* Header */}
      <div className="flex gap-4 border-b border-neutral-200 px-6 py-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className={cn('h-3', i === 0 ? 'w-32' : 'flex-1')} />
        ))}
      </div>
      {/* Rows */}
      <div className="divide-y divide-neutral-100">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex items-center gap-4 px-6 py-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton
                key={colIndex}
                className={cn(
                  'h-4',
                  colIndex === 0 ? 'w-24' : 'flex-1'
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ METRIC CARD SKELETON ============
export function SkeletonMetricCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-2xl border border-neutral-200 bg-white p-6', className)}>
      <div className="flex items-start justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
      <div className="mt-4">
        <Skeleton className="h-8 w-32" />
        <div className="mt-2 flex items-center gap-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  );
}

// ============ CHART SKELETON ============
interface SkeletonChartProps {
  type?: 'bar' | 'line' | 'donut';
  className?: string;
}

export function SkeletonChart({ type = 'bar', className }: SkeletonChartProps) {
  if (type === 'donut') {
    return (
      <div className={cn('rounded-2xl border border-neutral-200 bg-white p-6', className)}>
        <div className="mb-6 flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div>
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-1 h-3 w-24" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-6">
          <Skeleton className="h-32 w-32 rounded-full" />
          <div className="w-full space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-3 flex-1" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('rounded-2xl border border-neutral-200 bg-white p-6', className)}>
      <div className="mb-6 flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div>
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-1 h-3 w-40" />
        </div>
      </div>
      {type === 'bar' ? (
        <div className="flex h-48 items-end justify-between gap-2 px-4">
          {[40, 65, 45, 80, 55, 70, 50, 85, 60, 75, 45, 90].map((h, i) => (
            <Skeleton
              key={i}
              className="w-full rounded-t-md"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      ) : (
        <div className="h-48 relative">
          <Skeleton className="absolute bottom-0 left-0 right-0 h-1/2 rounded-lg" />
          <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-2 w-8" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============ FORM SKELETON ============
interface SkeletonFormProps {
  fields?: number;
  hasSubmit?: boolean;
  className?: string;
}

export function SkeletonForm({ fields = 3, hasSubmit = true, className }: SkeletonFormProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i}>
          <Skeleton className="mb-2 h-4 w-24" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      ))}
      {hasSubmit && (
        <div className="flex justify-end">
          <SkeletonButton size="md" width="w-32" />
        </div>
      )}
    </div>
  );
}

// ============ PROFILE SKELETON ============
export function SkeletonProfile({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-2xl border border-neutral-200 bg-white overflow-hidden', className)}>
      {/* Banner */}
      <Skeleton className="h-32 w-full rounded-none" />
      {/* Profile */}
      <div className="relative px-6 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
          <Skeleton className="h-24 w-24 rounded-full ring-4 ring-white" />
          <div className="flex-1 pt-2 sm:pt-0 sm:pb-1">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="mt-2 h-4 w-32" />
          </div>
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// ============ GRID SKELETON ============
interface SkeletonGridProps {
  count?: number;
  columns?: 1 | 2 | 3 | 4;
  itemType?: 'card' | 'metric';
  className?: string;
}

const gridCols = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
};

export function SkeletonGrid({ count = 4, columns = 4, itemType = 'metric', className }: SkeletonGridProps) {
  return (
    <div className={cn('grid gap-6', gridCols[columns], className)}>
      {Array.from({ length: count }).map((_, i) => (
        itemType === 'metric' ? (
          <SkeletonMetricCard key={i} />
        ) : (
          <SkeletonCard key={i} />
        )
      ))}
    </div>
  );
}
