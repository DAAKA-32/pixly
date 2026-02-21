'use client';

import { ReactNode, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn, formatCurrency, formatNumber, formatPercent } from '@/lib/utils';
import { Tooltip } from '@/components/ui/tooltip';

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
  tooltip?: string | ReactNode;
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
  tooltip,
  isLoading = false,
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
          <div className="h-3.5 w-24 animate-pulse rounded-md bg-neutral-100" />
          <div className="h-9 w-32 animate-pulse rounded-md bg-neutral-100" />
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
      <div className="flex items-center gap-1.5">
        {icon && (
          <span className="text-neutral-400">{icon}</span>
        )}
        <p className="text-[13px] font-medium tracking-wide text-neutral-500">{title}</p>
        {tooltip && (
          <Tooltip content={tooltip} showIcon />
        )}
      </div>

      <div className="mt-3">
        <p className="font-serif text-[24px] sm:text-[28px] lg:text-[32px] leading-none tracking-tight text-neutral-900">
          {formattedValue}
        </p>

        {description && (
          <p className="mt-1.5 text-[11px] text-neutral-400">{description}</p>
        )}

        {change !== null && (
          <div className="mt-3 flex items-center gap-1.5">
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
          </div>
        )}
      </div>
    </Wrapper>
  );
}

interface MetricCardMiniProps {
  title: string;
  value: number;
  previousValue?: number;
  format?: 'number' | 'currency' | 'percent' | 'roas';
  currency?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
  tooltip?: string | ReactNode;
  isLoading?: boolean;
}

export function MetricCardMini({
  title,
  value,
  previousValue,
  format = 'number',
  currency = 'EUR',
  icon,
  trend,
  className,
  tooltip,
  isLoading = false,
}: MetricCardMiniProps) {
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
        return formatNumber(value, { compact: true });
    }
  })();

  if (isLoading) {
    return (
      <div className={cn('rounded-xl border border-neutral-200/80 bg-white px-5 py-3.5', className)}>
        <div className="h-3 w-16 animate-pulse rounded bg-neutral-100" />
        <div className="mt-2 h-5 w-24 animate-pulse rounded bg-neutral-100" />
      </div>
    );
  }

  return (
    <div className={cn(
      'group rounded-xl border border-neutral-200/80 bg-white px-5 py-3.5',
      'transition-all duration-300 hover:border-neutral-300 hover:shadow-soft',
      className
    )}>
      <div className="flex items-center gap-1.5">
        {icon && (
          <span className="text-neutral-400">{icon}</span>
        )}
        <p className="text-[11px] font-medium text-neutral-500">{title}</p>
        {tooltip && (
          <Tooltip content={tooltip} showIcon />
        )}
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <p className="font-serif text-xl leading-none text-neutral-900">{formattedValue}</p>
        {change !== null && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 text-[11px] font-semibold tabular-nums',
              actualTrend === 'up' && 'text-emerald-600',
              actualTrend === 'down' && 'text-red-500',
              actualTrend === 'neutral' && 'text-neutral-400'
            )}
          >
            {actualTrend === 'up' ? (
              <TrendingUp className="h-2.5 w-2.5" />
            ) : actualTrend === 'down' ? (
              <TrendingDown className="h-2.5 w-2.5" />
            ) : (
              <Minus className="h-2.5 w-2.5" />
            )}
            {formatPercent(Math.abs(change))}
          </span>
        )}
      </div>
    </div>
  );
}
