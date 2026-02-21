'use client';

import { memo, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock } from 'lucide-react';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import { CustomerJourneyModal } from './customer-journey-modal';
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
  tiktok: 'bg-neutral-900',
  linkedin: 'bg-sky-600',
  bing: 'bg-teal-500',
  direct: 'bg-neutral-400',
  organic: 'bg-green-500',
  email: 'bg-purple-500',
  referral: 'bg-amber-500',
};

const typeLabels: Record<string, string> = {
  purchase: 'Achat',
  lead: 'Lead',
  add_to_cart: 'Panier',
  initiate_checkout: 'Checkout',
};

export function ConversionTable({ conversions, isLoading }: ConversionTableProps) {
  const [showAll, setShowAll] = useState(false);
  const [selectedConversion, setSelectedConversion] = useState<Conversion | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleConversionClick = (conversion: Conversion) => {
    setSelectedConversion(conversion);
    setIsModalOpen(true);
  };

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
          <h3 className="text-[15px] font-semibold text-neutral-900">Activité récente</h3>
        </div>
        <div className="px-5 pb-8 pt-4 text-center">
          <p className="text-[13px] text-neutral-400">
            Dès que votre pixel sera actif, les conversions s&apos;afficheront ici.
          </p>
        </div>
      </div>
    );
  }

  const displayed = showAll ? conversions : conversions.slice(0, 8);
  const hasMore = conversions.length > 8;

  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-white">
      <div className="flex items-baseline justify-between border-b border-neutral-100 px-5 py-4">
        <div>
          <h3 className="text-[15px] font-semibold text-neutral-900">Activité récente</h3>
          <p className="mt-0.5 text-[11px] text-neutral-400">Cliquez sur une conversion pour voir le parcours client</p>
        </div>
        <span className="text-[12px] tabular-nums text-neutral-400">
          {conversions.length}
        </span>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="divide-y divide-neutral-50"
      >
        {displayed.map((conversion) => {
          const channel = conversion.attribution?.touchpoints[0]?.channel || 'direct';
          const campaign = conversion.attribution?.touchpoints[0]?.campaign;

          return (
            <div
              key={conversion.id}
              onClick={() => handleConversionClick(conversion)}
              className="flex items-center gap-2 sm:gap-4 px-3 sm:px-5 py-3.5 transition-colors hover:bg-neutral-50/50 cursor-pointer active:bg-neutral-100/50"
            >
              {/* Channel dot */}
              <div className={`h-2 w-2 flex-shrink-0 rounded-full ${channelDots[channel] || 'bg-neutral-400'}`} />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium text-neutral-900">
                    {typeLabels[conversion.type] || conversion.type}
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
              <div className="hidden sm:flex flex-shrink-0 items-center gap-2">
                <SyncIndicator
                  platform="Meta"
                  synced={conversion.synced?.meta?.synced || false}
                />
                <SyncIndicator
                  platform="Google"
                  synced={conversion.synced?.google?.synced || false}
                />
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Show more / less */}
      {hasMore && !showAll && (
        <div className="border-t border-neutral-100 px-5 py-3 text-center">
          <button
            onClick={() => setShowAll(true)}
            className="text-[13px] font-medium text-neutral-500 hover:text-neutral-700 transition-colors"
          >
            Voir tout ({conversions.length})
          </button>
        </div>
      )}
      {showAll && hasMore && (
        <div className="border-t border-neutral-100 px-5 py-3 text-center">
          <button
            onClick={() => setShowAll(false)}
            className="text-[13px] font-medium text-neutral-500 hover:text-neutral-700 transition-colors"
          >
            Réduire
          </button>
        </div>
      )}

      {/* Customer Journey Modal */}
      <CustomerJourneyModal
        conversion={selectedConversion}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
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
      className="flex items-center gap-0.5"
      title={`${platform}: ${synced ? 'Synchronisé' : 'En attente'}`}
    >
      <span className="text-[9px] font-medium text-neutral-400">{platform[0]}</span>
      {synced ? (
        <CheckCircle className="h-3 w-3 text-emerald-500" />
      ) : (
        <Clock className="h-3 w-3 text-neutral-300" />
      )}
    </div>
  );
});
