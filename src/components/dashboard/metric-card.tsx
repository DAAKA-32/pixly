'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn, formatCurrency, formatNumber, formatPercent } from '@/lib/utils';

// ===========================================
// PIXLY - Metric Card Component
// ===========================================

interface MetricCardProps {
  title: string;
  value: number;
  previousValue?: number;
  format?: 'number' | 'currency' | 'percent' | 'roas';
  currency?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
  description?: string;
  isLoading?: boolean;
}

export function MetricCard({
  title,
  value,
  previousValue,
  format = 'number',
  currency = 'EUR',
  icon,
  trend,
  className,
  description,
  isLoading = false,
}: MetricCardProps) {
  // Calculate change percentage
  const change = previousValue
    ? ((value - previousValue) / previousValue) * 100
    : null;

  // Determine trend from change if not provided
  const actualTrend = trend || (change ? (change > 0 ? 'up' : change < 0 ? 'down' : 'neutral') : 'neutral');

  // Format value based on type
  const formattedValue = (() => {
    switch (format) {
      case 'currency':
        return formatCurrency(value, currency);
      case 'percent':
        return `${value.toFixed(1)}%`;
      case 'roas':
        return `${value.toFixed(2)}x`;
      default:
        return formatNumber(value, { compact: value >= 10000 });
    }
  })();

  const TrendIcon = actualTrend === 'up' ? TrendingUp : actualTrend === 'down' ? TrendingDown : Minus;

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn('metric-card', className)}
      >
        <div className="flex items-start justify-between">
          <div className="h-4 w-20 animate-pulse rounded bg-neutral-200" />
          {icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100">
              <div className="h-5 w-5 animate-pulse rounded bg-neutral-200" />
            </div>
          )}
        </div>
        <div className="mt-4">
          <div className="h-8 w-32 animate-pulse rounded bg-neutral-200" />
          <div className="mt-2 h-4 w-24 animate-pulse rounded bg-neutral-100" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('metric-card', className)}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-500">{title}</p>
          {description && (
            <p className="text-xs text-neutral-400">{description}</p>
          )}
        </div>
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-4">
        <p className="text-3xl font-bold text-neutral-900">{formattedValue}</p>

        {change !== null && (
          <div className="mt-2 flex items-center gap-1">
            <div
              className={cn(
                'flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium',
                actualTrend === 'up' && 'bg-green-50 text-green-700',
                actualTrend === 'down' && 'bg-red-50 text-red-700',
                actualTrend === 'neutral' && 'bg-neutral-100 text-neutral-600'
              )}
            >
              <TrendIcon className="h-3 w-3" />
              <span>{formatPercent(Math.abs(change))}</span>
            </div>
            <span className="text-xs text-neutral-500">vs période préc.</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Mini variant for compact displays
export function MetricCardMini({
  title,
  value,
  format = 'number',
  currency = 'USD',
}: {
  title: string;
  value: number;
  format?: 'number' | 'currency' | 'percent' | 'roas';
  currency?: string;
}) {
  const formattedValue = (() => {
    switch (format) {
      case 'currency':
        return formatCurrency(value, currency);
      case 'percent':
        return `${value.toFixed(1)}%`;
      case 'roas':
        return `${value.toFixed(2)}x`;
      default:
        return formatNumber(value, { compact: true });
    }
  })();

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <p className="text-xs font-medium text-neutral-500">{title}</p>
      <p className="mt-1 text-xl font-bold text-neutral-900">{formattedValue}</p>
    </div>
  );
}
