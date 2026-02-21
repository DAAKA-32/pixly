'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Zap, MousePointer } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { integrationIcons } from '@/components/integrations/icons';
import type { Conversion, AttributionModel, Channel, Touchpoint } from '@/types';

// ===========================================
// PIXLY - Customer Journey Modal
// Premium timeline visualization of every touchpoint
// leading to a conversion event
// ===========================================

interface CustomerJourneyModalProps {
  conversion: Conversion | null;
  isOpen: boolean;
  onClose: () => void;
}

// ---- Channel visual mapping ----

const channelDotColor: Record<string, string> = {
  meta: 'bg-blue-500',
  google: 'bg-red-500',
  tiktok: 'bg-neutral-900',
  linkedin: 'bg-sky-600',
  bing: 'bg-teal-500',
  organic: 'bg-green-500',
  direct: 'bg-neutral-400',
  email: 'bg-purple-500',
  referral: 'bg-amber-500',
  other: 'bg-neutral-300',
};

const channelRingColor: Record<string, string> = {
  meta: 'ring-blue-500/20',
  google: 'ring-red-500/20',
  tiktok: 'ring-neutral-900/20',
  linkedin: 'ring-sky-600/20',
  bing: 'ring-teal-500/20',
  organic: 'ring-green-500/20',
  direct: 'ring-neutral-400/20',
  email: 'ring-purple-500/20',
  referral: 'ring-amber-500/20',
  other: 'ring-neutral-300/20',
};

const channelIconColor: Record<string, string> = {
  meta: 'text-blue-600',
  google: 'text-red-600',
  tiktok: 'text-neutral-900',
  linkedin: 'text-sky-700',
  bing: 'text-teal-600',
  organic: 'text-green-600',
  direct: 'text-neutral-500',
  email: 'text-purple-600',
  referral: 'text-amber-600',
  other: 'text-neutral-400',
};

const channelIconBg: Record<string, string> = {
  meta: 'bg-blue-50',
  google: 'bg-red-50',
  tiktok: 'bg-neutral-100',
  linkedin: 'bg-sky-50',
  bing: 'bg-teal-50',
  organic: 'bg-green-50',
  direct: 'bg-neutral-50',
  email: 'bg-purple-50',
  referral: 'bg-amber-50',
  other: 'bg-neutral-50',
};

const channelLabels: Record<string, string> = {
  meta: 'Meta Ads',
  google: 'Google Ads',
  tiktok: 'TikTok Ads',
  linkedin: 'LinkedIn Ads',
  bing: 'Microsoft Ads',
  organic: 'Organic',
  direct: 'Direct',
  email: 'Email',
  referral: 'Referral',
  other: 'Autre',
};

const attributionModelLabels: Record<AttributionModel, string> = {
  first_click: 'Premier clic',
  last_click: 'Dernier clic',
  linear: 'Linéaire',
  time_decay: 'Time Decay',
  position_based: 'Position Based (U)',
};

// ---- Helpers ----

function formatTimestamp(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date instanceof Date ? date : new Date(date));
}

function computeJourneyDuration(touchpoints: Touchpoint[], conversionTimestamp: Date): string {
  if (touchpoints.length === 0) return '—';

  const first = touchpoints[0].timestamp instanceof Date
    ? touchpoints[0].timestamp
    : new Date(touchpoints[0].timestamp);
  const last = conversionTimestamp instanceof Date
    ? conversionTimestamp
    : new Date(conversionTimestamp);

  const diffMs = last.getTime() - first.getTime();
  if (diffMs < 0) return '—';

  const minutes = Math.floor(diffMs / 60_000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    const remainingHours = hours % 24;
    return remainingHours > 0
      ? `${days}j ${remainingHours}h`
      : `${days} jour${days > 1 ? 's' : ''}`;
  }
  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}min`
      : `${hours}h`;
  }
  if (minutes > 0) return `${minutes} min`;
  return '< 1 min';
}

// ---- Animation config ----

const PREMIUM_EASE = [0.22, 1, 0.36, 1] as const;

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: PREMIUM_EASE },
  },
  exit: {
    opacity: 0,
    y: 16,
    scale: 0.97,
    transition: { duration: 0.25, ease: PREMIUM_EASE },
  },
};

// ---- Component ----

export function CustomerJourneyModal({
  conversion,
  isOpen,
  onClose,
}: CustomerJourneyModalProps) {
  const touchpoints = conversion?.attribution?.touchpoints || [];
  const model = conversion?.attribution?.model || 'last_click';

  const journeyDuration = useMemo(() => {
    if (!conversion) return '—';
    return computeJourneyDuration(touchpoints, conversion.timestamp);
  }, [conversion, touchpoints]);

  // Prevent background scroll when open
  // (handled externally or via body scroll lock in sidebar provider)

  if (!conversion) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            key="journey-backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            key="journey-modal"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative z-10 mx-4 mt-[10vh] mb-12 w-full max-w-lg rounded-2xl bg-white shadow-2xl"
            role="dialog"
            aria-label="Parcours client"
          >
            {/* ── Header ── */}
            <div className="flex items-start justify-between border-b border-neutral-100 px-5 py-4 sm:px-6 sm:py-5">
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-neutral-900">
                  Parcours client
                </h2>
                <p className="mt-0.5 text-[13px] text-neutral-500">
                  {touchpoints.length} point{touchpoints.length !== 1 ? 's' : ''} de contact
                  {' '}&middot;{' '}
                  {conversion.type === 'purchase' ? 'Achat' : 'Lead'}
                  {' '}&middot;{' '}
                  {formatCurrency(conversion.value, conversion.currency)}
                </p>
              </div>
              <button
                onClick={onClose}
                className="ml-4 flex-shrink-0 rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* ── Summary pills ── */}
            <div className="flex flex-wrap items-center gap-2 border-b border-neutral-100 px-5 py-3 sm:px-6">
              {/* Journey duration */}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600">
                <Clock className="h-3 w-3 text-neutral-400" />
                {journeyDuration}
              </span>
              {/* Attribution model */}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600">
                <Zap className="h-3 w-3 text-neutral-400" />
                {attributionModelLabels[model]}
              </span>
              {/* Touchpoint count */}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600">
                <MousePointer className="h-3 w-3 text-neutral-400" />
                {touchpoints.length} interaction{touchpoints.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* ── Timeline ── */}
            <div
              className="overflow-y-auto px-5 py-5 sm:px-6 sm:py-6"
              style={{ maxHeight: 'calc(80vh - 160px)' }}
            >
              {touchpoints.length > 0 ? (
                <div className="relative">
                  {/* Vertical connecting line */}
                  <div
                    className="absolute left-[15px] top-5 w-[2px] bg-neutral-200"
                    style={{ bottom: '0px' }}
                    aria-hidden="true"
                  />

                  {/* Touchpoint nodes */}
                  <div className="space-y-0">
                    {touchpoints.map((tp, idx) => {
                      const isLast = idx === touchpoints.length - 1;
                      const channel = tp.channel || 'other';
                      const dot = channelDotColor[channel] || channelDotColor.other;
                      const ring = channelRingColor[channel] || channelRingColor.other;
                      const iconColor = channelIconColor[channel] || channelIconColor.other;
                      const iconBg = channelIconBg[channel] || channelIconBg.other;
                      const ChannelIcon = integrationIcons[channel as keyof typeof integrationIcons];
                      const creditPercent = Math.round(tp.credit * 100);
                      const label = channelLabels[channel] || channel;
                      const ts = tp.timestamp instanceof Date ? tp.timestamp : new Date(tp.timestamp);

                      return (
                        <motion.div
                          key={`tp-${idx}`}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.35,
                            delay: idx * 0.06,
                            ease: PREMIUM_EASE,
                          }}
                          className="relative flex gap-3.5 pb-6 last:pb-0"
                        >
                          {/* Dot + icon column */}
                          <div className="relative z-10 flex flex-col items-center">
                            {/* Dot */}
                            <div
                              className={cn(
                                'flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full ring-4',
                                isLast ? 'bg-emerald-500 ring-emerald-500/20' : `${dot} ${ring}`
                              )}
                            >
                              {isLast ? (
                                <CheckIcon className="h-3.5 w-3.5 text-white" />
                              ) : ChannelIcon ? (
                                <ChannelIcon className="h-3 w-3 text-white" />
                              ) : (
                                <div className="h-2 w-2 rounded-full bg-white" />
                              )}
                            </div>
                          </div>

                          {/* Content card */}
                          <div
                            className={cn(
                              'flex-1 rounded-xl border px-3.5 py-3 transition-colors',
                              isLast
                                ? 'border-emerald-200 bg-emerald-50/50'
                                : 'border-neutral-200/80 bg-white hover:bg-neutral-50/50'
                            )}
                          >
                            {/* Top row: channel + credit pill */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  {/* Channel icon badge */}
                                  {ChannelIcon && (
                                    <span
                                      className={cn(
                                        'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded',
                                        iconBg
                                      )}
                                    >
                                      <ChannelIcon className={cn('h-2.5 w-2.5', iconColor)} />
                                    </span>
                                  )}
                                  <span className="text-[13px] font-semibold text-neutral-900">
                                    {tp.source || label}
                                  </span>
                                  {isLast && (
                                    <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                                      Conversion
                                    </span>
                                  )}
                                  {idx === 0 && !isLast && (
                                    <span className="rounded-md bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-500">
                                      Premier contact
                                    </span>
                                  )}
                                </div>

                                {/* Medium / campaign */}
                                <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-neutral-500">
                                  {tp.medium && tp.medium !== 'none' && (
                                    <span className="capitalize">{tp.medium}</span>
                                  )}
                                  {tp.medium && tp.medium !== 'none' && tp.campaign && (
                                    <span className="text-neutral-300">/</span>
                                  )}
                                  {tp.campaign && (
                                    <span className="truncate text-neutral-600" title={tp.campaign}>
                                      {tp.campaign}
                                    </span>
                                  )}
                                </div>

                                {/* Timestamp */}
                                <p className="mt-1.5 text-[11px] text-neutral-400">
                                  {formatTimestamp(ts)}
                                </p>
                              </div>

                              {/* Credit pill */}
                              <span
                                className={cn(
                                  'flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums',
                                  isLast
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : creditPercent >= 40
                                      ? 'bg-neutral-900 text-white'
                                      : 'bg-neutral-100 text-neutral-600'
                                )}
                              >
                                {creditPercent}%
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Conversion result card */}
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: touchpoints.length * 0.06 + 0.1,
                      ease: PREMIUM_EASE,
                    }}
                    className="ml-[42px] mt-4 rounded-xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-50/30 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-500">
                        <CheckIcon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-emerald-900">
                          {conversion.type === 'purchase' ? 'Achat confirmé' : 'Lead capturé'}
                        </p>
                        <p className="text-lg font-bold tabular-nums text-emerald-700">
                          {formatCurrency(conversion.value, conversion.currency)}
                        </p>
                      </div>
                    </div>
                    <p className="mt-2 text-[11px] text-emerald-600">
                      {formatTimestamp(
                        conversion.timestamp instanceof Date
                          ? conversion.timestamp
                          : new Date(conversion.timestamp)
                      )}
                    </p>
                  </motion.div>
                </div>
              ) : (
                /* Empty state */
                <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-6 py-10 text-center">
                  <MousePointer className="mx-auto h-8 w-8 text-neutral-300" />
                  <p className="mt-3 text-sm font-medium text-neutral-500">
                    Aucun point de contact enregistré
                  </p>
                  <p className="mt-1 text-xs text-neutral-400">
                    Les interactions menant a cette conversion n&apos;ont pas pu etre retracees.
                  </p>
                </div>
              )}
            </div>

            {/* ── Footer ── */}
            <div className="flex items-center justify-between border-t border-neutral-100 px-5 py-3 sm:px-6">
              <p className="text-[11px] text-neutral-400">
                ID : {conversion.id.slice(0, 12)}&hellip;
              </p>
              <button
                onClick={onClose}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-100"
              >
                Fermer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ---- Check icon (inline SVG to avoid extra dependency) ----

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
