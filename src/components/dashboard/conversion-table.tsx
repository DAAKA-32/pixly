'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock } from 'lucide-react';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import type { Conversion } from '@/types';

interface ConversionTableProps {
  conversions: Conversion[];
  isLoading?: boolean;
}

const channelLabels: Record<string, string> = {
  meta: 'Meta',
  google: 'Google',
  tiktok: 'TikTok',
  linkedin: 'LinkedIn',
  bing: 'Bing',
  direct: 'Direct',
  organic: 'Organic',
  email: 'Email',
  referral: 'Referral',
};

const channelDots: Record<string, string> = {
  meta: 'bg-blue-500',
  google: 'bg-red-500',
  tiktok: 'bg-neutral-800',
  linkedin: 'bg-sky-600',
  bing: 'bg-teal-500',
  direct: 'bg-neutral-400',
  organic: 'bg-green-500',
  email: 'bg-purple-500',
  referral: 'bg-amber-500',
};

export function ConversionTable({ conversions, isLoading }: ConversionTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-neutral-200/80 bg-white">
        <div className="px-5 py-4">
          <div className="h-5 w-40 animate-pulse rounded-md bg-neutral-100" />
        </div>
        <div className="px-5 pb-4 space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex animate-pulse items-center gap-3 rounded-lg bg-neutral-50 p-3">
              <div className="h-2 w-2 rounded-full bg-neutral-200" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-28 rounded bg-neutral-200" />
                <div className="h-2.5 w-20 rounded bg-neutral-100" />
              </div>
              <div className="h-4 w-16 rounded bg-neutral-200" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (conversions.length === 0) {
    return (
      <div className="rounded-2xl border border-neutral-200/80 bg-white">
        <div className="px-5 py-4">
          <h3 className="text-[15px] font-semibold text-neutral-900">Conversions récentes</h3>
        </div>
        <div className="px-5 pb-8 pt-4 text-center">
          <p className="text-[13px] text-neutral-400">
            Les conversions apparaîtront ici une fois le tracking configuré
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-white">
      <div className="flex items-baseline justify-between border-b border-neutral-100 px-5 py-4">
        <h3 className="text-[15px] font-semibold text-neutral-900">Conversions récentes</h3>
        <span className="text-[12px] tabular-nums text-neutral-400">
          {conversions.length}
        </span>
      </div>

      <div className="divide-y divide-neutral-50">
        {conversions.map((conversion, index) => {
          const channel = conversion.attribution?.touchpoints[0]?.channel || 'direct';
          const campaign = conversion.attribution?.touchpoints[0]?.campaign;

          return (
            <motion.div
              key={conversion.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.03 }}
              className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-neutral-50/50"
            >
              {/* Channel dot */}
              <div className={`h-2 w-2 flex-shrink-0 rounded-full ${channelDots[channel] || 'bg-neutral-400'}`} />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium capitalize text-neutral-900">
                    {conversion.type}
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    {channelLabels[channel] || channel}
                  </span>
                </div>
                {campaign && (
                  <p className="mt-0.5 truncate text-[11px] text-neutral-400">
                    {campaign}
                  </p>
                )}
              </div>

              {/* Value + time */}
              <div className="flex-shrink-0 text-right">
                <p className="text-[13px] font-semibold tabular-nums text-neutral-900">
                  {formatCurrency(conversion.value, conversion.currency)}
                </p>
                <p className="text-[11px] tabular-nums text-neutral-400">
                  {formatRelativeTime(conversion.timestamp)}
                </p>
              </div>

              {/* Sync indicators */}
              <div className="flex flex-shrink-0 items-center gap-1">
                <SyncIndicator
                  platform="Meta"
                  synced={conversion.synced?.meta?.synced || false}
                />
                <SyncIndicator
                  platform="Google"
                  synced={conversion.synced?.google?.synced || false}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

const SyncIndicator = memo(function SyncIndicator({
  platform,
  synced,
}: {
  platform: string;
  synced: boolean;
}) {
  return (
    <div
      className="flex items-center justify-center"
      title={`${platform}: ${synced ? 'Synchronisé' : 'En attente'}`}
    >
      {synced ? (
        <CheckCircle className="h-3 w-3 text-emerald-500" />
      ) : (
        <Clock className="h-3 w-3 text-neutral-300" />
      )}
    </div>
  );
});
