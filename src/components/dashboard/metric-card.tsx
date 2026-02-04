'use client';

import { ReactNode, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn, formatCurrency, formatNumber, formatPercent } from '@/lib/utils';

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
  accent?: string;
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
  accent,
}: MetricCardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const change = previousValue
    ? ((value - previousValue) / previousValue) * 100
    : null;

  const actualTrend = trend || (change ? (change > 0 ? 'up' : change < 0 ? 'down' : 'neutral') : 'neutral');

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

  const Wrapper = mounted ? motion.div : 'div';
  const wrapperProps = mounted ? {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  } : {};

  if (isLoading) {
    return (
      <Wrapper
        {...wrapperProps}
        className={cn('relative overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-5', className)}
      >
        <div className="space-y-4">
          <div className="h-3.5 w-20 animate-pulse rounded-md bg-neutral-100" />
          <div className="h-8 w-28 animate-pulse rounded-md bg-neutral-100" />
          <div className="h-3 w-16 animate-pulse rounded-md bg-neutral-50" />
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper
      {...wrapperProps}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-5',
        'transition-all duration-300 hover:border-neutral-300 hover:shadow-soft',
        className
      )}
    >
      {/* Subtle top accent line */}
      {accent && (
        <div
          className="absolute inset-x-0 top-0 h-[2px]"
          style={{ backgroundColor: accent }}
        />
      )}

      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-medium tracking-wide text-neutral-500">{title}</p>
        {icon && (
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-neutral-50 text-neutral-400 transition-colors group-hover:bg-neutral-100 group-hover:text-neutral-500">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3">
        <p className="text-[28px] font-semibold leading-none tracking-tight text-neutral-900">
          {formattedValue}
        </p>

        {description && (
          <p className="mt-1.5 text-[11px] text-neutral-400">{description}</p>
        )}

        {change !== null && (
          <div className="mt-3 flex items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center gap-0.5 text-[12px] font-semibold tabular-nums',
                actualTrend === 'up' && 'text-emerald-600',
                actualTrend === 'down' && 'text-red-500',
                actualTrend === 'neutral' && 'text-neutral-400'
              )}
            >
              {actualTrend === 'up' ? (
                <TrendingUp className="h-3 w-3" />
              ) : actualTrend === 'down' ? (
                <TrendingDown className="h-3 w-3" />
              ) : (
                <Minus className="h-3 w-3" />
              )}
              {formatPercent(Math.abs(change))}
            </span>
            <span className="text-[11px] text-neutral-400">vs préc.</span>
          </div>
        )}
      </div>
    </Wrapper>
  );
}

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
    <div className="rounded-xl border border-neutral-200/80 bg-white p-3.5">
      <p className="text-[11px] font-medium text-neutral-500">{title}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums text-neutral-900">{formattedValue}</p>
    </div>
  );
}
