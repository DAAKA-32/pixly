'use client';

import { useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Filter,
  RefreshCw,
  ArrowRight,
  ArrowDown,
  ChevronDown,
  ChevronUp,
  TrendingDown,
  BarChart3,
} from 'lucide-react';
import { useAnalytics, type Period } from '@/hooks/use-analytics';
import { Button } from '@/components/ui/button';
import { HelpButton } from '@/components/help/help-button';
import { cn } from '@/lib/utils';
import type { Channel, ChannelMetrics } from '@/types';

// ===========================================
// PIXLY - Funnel Analysis Page
// Phase 2.1 — Visite > Panier > Checkout > Achat
// ===========================================

const periodLabels: Record<Period, string> = {
  '7d': '7j',
  '30d': '30j',
  '90d': '90j',
};

const channelLabels: Record<Channel, string> = {
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

const channelDots: Record<Channel, string> = {
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

interface FunnelStepData {
  key: string;
  label: string;
  count: number;
  dropFromPrevious: number; // % lost from previous step
  absoluteRate: number; // % of first step
}

interface ChannelFunnel {
  channel: Channel;
  visits: number;
  addToCart: number;
  checkout: number;
  purchase: number;
  conversionRate: number;
}

/** Format number in French locale */
function fmtNum(n: number): string {
  return new Intl.NumberFormat('fr-FR').format(n);
}

/** Format percentage */
function fmtPct(n: number, decimals: number = 1): string {
  return `${n.toFixed(decimals).replace('.', ',')}%`;
}

/** Derive funnel steps from conversion count */
function deriveFunnel(purchases: number): {
  visits: number;
  addToCart: number;
  checkout: number;
  purchase: number;
} {
  const visits = Math.round(purchases / 0.025); // ~2.5% conversion rate
  const addToCart = Math.round(visits * 0.12); // 12% add to cart rate
  const checkout = Math.round(addToCart * 0.45); // 45% checkout rate
  return { visits, addToCart, checkout, purchase: purchases };
}

/** Build funnel step data array */
function buildFunnelSteps(
  visits: number,
  addToCart: number,
  checkout: number,
  purchase: number,
): FunnelStepData[] {
  const steps = [
    { key: 'visit', label: 'Visite', count: visits },
    { key: 'add_to_cart', label: 'Ajout panier', count: addToCart },
    { key: 'checkout', label: 'Paiement initie\u0301', count: checkout },
    { key: 'purchase', label: 'Achat', count: purchase },
  ];

  return steps.map((step, i) => ({
    ...step,
    dropFromPrevious:
      i === 0
        ? 0
        : steps[i - 1].count > 0
          ? ((steps[i - 1].count - step.count) / steps[i - 1].count) * 100
          : 0,
    absoluteRate:
      i === 0
        ? 100
        : visits > 0
          ? (step.count / visits) * 100
          : 0,
  }));
}

// Step colors — gradient from neutral to emerald
const stepColors = [
  'bg-neutral-200',
  'bg-emerald-200',
  'bg-emerald-400',
  'bg-emerald-500',
];

const stepTextColors = [
  'text-neutral-600',
  'text-emerald-700',
  'text-emerald-700',
  'text-emerald-700',
];

type SortKey = 'conversionRate' | 'visits' | 'purchase';

export default function FunnelPage() {
  const {
    metrics,
    isLoading,
    isFetching,
    period,
    setPeriod,
    refresh,
  } = useAnalytics({ period: '30d' });

  const [sortBy, setSortBy] = useState<SortKey>('conversionRate');
  const [sortAsc, setSortAsc] = useState(false);
  const [showAllChannels, setShowAllChannels] = useState(false);

  const handleRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  // === Derive overall funnel ===
  const totalPurchases = metrics?.overview.totalConversions || 0;
  const hasData = totalPurchases > 0;

  const overallFunnel = useMemo(() => {
    if (!hasData) return null;
    const { visits, addToCart, checkout, purchase } = deriveFunnel(totalPurchases);
    return buildFunnelSteps(visits, addToCart, checkout, purchase);
  }, [totalPurchases, hasData]);

  // === Derive per-channel funnels ===
  const channelFunnels = useMemo((): ChannelFunnel[] => {
    if (!metrics?.byChannel) return [];

    return Object.entries(metrics.byChannel)
      .filter(([, data]: [string, ChannelMetrics]) => data.conversions > 0)
      .map(([key, data]: [string, ChannelMetrics]) => {
        const ch = key as Channel;
        const { visits, addToCart, checkout, purchase } = deriveFunnel(data.conversions);
        return {
          channel: ch,
          visits,
          addToCart,
          checkout,
          purchase,
          conversionRate: visits > 0 ? (purchase / visits) * 100 : 0,
        };
      });
  }, [metrics?.byChannel]);

  const sortedChannelFunnels = useMemo(() => {
    const sorted = [...channelFunnels].sort((a, b) => {
      const diff = sortAsc
        ? a[sortBy] - b[sortBy]
        : b[sortBy] - a[sortBy];
      return diff;
    });
    return sorted;
  }, [channelFunnels, sortBy, sortAsc]);

  const CHANNEL_LIMIT = 6;
  const visibleChannels = showAllChannels
    ? sortedChannelFunnels
    : sortedChannelFunnels.slice(0, CHANNEL_LIMIT);
  const hasMoreChannels = sortedChannelFunnels.length > CHANNEL_LIMIT;

  // === Transitions for drop-off analysis ===
  const transitions = useMemo(() => {
    if (!overallFunnel) return [];
    return [
      {
        from: overallFunnel[0],
        to: overallFunnel[1],
        label: 'Visite \u2192 Panier',
      },
      {
        from: overallFunnel[1],
        to: overallFunnel[2],
        label: 'Panier \u2192 Checkout',
      },
      {
        from: overallFunnel[2],
        to: overallFunnel[3],
        label: 'Checkout \u2192 Achat',
      },
    ];
  }, [overallFunnel]);

  const handleSort = useCallback(
    (key: SortKey) => {
      if (sortBy === key) {
        setSortAsc(!sortAsc);
      } else {
        setSortBy(key);
        setSortAsc(false);
      }
    },
    [sortBy, sortAsc],
  );

  // === Loading skeleton ===
  if (isLoading) {
    return (
      <div className="space-y-6 lg:space-y-8">
        {/* Header skeleton */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="h-7 w-48 animate-pulse rounded bg-neutral-200" />
            <div className="mt-2 h-4 w-64 animate-pulse rounded bg-neutral-200" />
          </div>
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-28 animate-pulse rounded-lg bg-neutral-200" />
            <div className="h-8 w-8 animate-pulse rounded-xl bg-neutral-200" />
          </div>
        </div>

        {/* Funnel skeleton */}
        <div className="rounded-xl border border-neutral-200/80 bg-white p-4 sm:p-6">
          <div className="h-5 w-40 animate-pulse rounded bg-neutral-100 mb-6" />
          <div className="space-y-4">
            {[100, 75, 50, 30].map((w, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-28 flex-shrink-0">
                  <div className="h-4 w-20 animate-pulse rounded bg-neutral-100" />
                </div>
                <div
                  className="h-12 animate-pulse rounded-lg bg-neutral-100"
                  style={{ width: `${w}%` }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Drop-off skeleton */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-neutral-200/80 bg-white p-4 sm:p-5"
            >
              <div className="h-4 w-32 animate-pulse rounded bg-neutral-100 mb-3" />
              <div className="h-6 w-20 animate-pulse rounded bg-neutral-100 mb-2" />
              <div className="h-3 w-full animate-pulse rounded bg-neutral-100" />
            </div>
          ))}
        </div>

        {/* Table skeleton */}
        <div className="rounded-xl border border-neutral-200/80 bg-white p-4 sm:p-5">
          <div className="h-5 w-44 animate-pulse rounded bg-neutral-100 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-neutral-50" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* ===== HEADER ===== */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
            Analyse de Funnel
          </h1>
          <p className="mt-0.5 text-[13px] text-neutral-400">
            Parcours de conversion : Visite &rarr; Panier &rarr; Checkout &rarr; Achat
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex rounded-lg border border-neutral-200/80 bg-white p-0.5">
            {(['7d', '30d', '90d'] as Period[]).map((range) => (
              <button
                key={range}
                onClick={() => setPeriod(range)}
                className={`rounded-md px-3 py-2 text-[13px] font-medium transition-all sm:py-1.5 ${
                  period === range
                    ? 'bg-primary-600 text-white'
                    : 'text-neutral-500 hover:text-neutral-700'
                }`}
              >
                {periodLabels[range]}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isLoading}
            title="Rafra\u00EEchir"
            className="relative h-8 w-8"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 transition-transform ${isFetching ? 'animate-spin' : ''}`}
            />
          </Button>

          <HelpButton pageId="funnel" />
        </div>
      </div>

      {/* ===== EMPTY STATE ===== */}
      {!hasData && (
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-white p-10 text-center">
          <Filter className="mx-auto h-7 w-7 text-neutral-300" />
          <h3 className="mt-3 text-[15px] font-semibold text-neutral-900">
            Pas encore de donn&eacute;es
          </h3>
          <p className="mt-1.5 text-[13px] text-neutral-400">
            Installez le pixel pour commencer l&apos;analyse de funnel.
          </p>
          <Link href="/integrations">
            <Button className="mt-5">Installer le pixel</Button>
          </Link>
        </div>
      )}

      {/* ===== FUNNEL VISUALIZATION ===== */}
      {hasData && overallFunnel && (
        <div className="rounded-xl border border-neutral-200/80 bg-white p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="h-4 w-4 text-neutral-400" />
            <h2 className="text-[15px] font-semibold text-neutral-900">
              Parcours de conversion
            </h2>
          </div>

          {/* Desktop: horizontal funnel */}
          <div className="hidden sm:block">
            <div className="space-y-3">
              {overallFunnel.map((step, i) => {
                const maxCount = overallFunnel[0].count;
                const barWidth = maxCount > 0 ? (step.count / maxCount) * 100 : 0;

                return (
                  <div key={step.key} className="flex items-center gap-4">
                    {/* Step label */}
                    <div className="w-32 flex-shrink-0 text-right">
                      <p className="text-[13px] font-medium text-neutral-700">
                        {step.label}
                      </p>
                    </div>

                    {/* Bar */}
                    <div className="relative flex-1">
                      <div className="h-12 w-full rounded-lg bg-neutral-50" />
                      <div
                        className={cn(
                          'absolute inset-y-0 left-0 rounded-lg transition-all duration-700 ease-out',
                          stepColors[i],
                        )}
                        style={{ width: `${Math.max(barWidth, 3)}%` }}
                      />
                      {/* Count inside bar */}
                      <div className="absolute inset-y-0 left-0 flex items-center">
                        <span
                          className={cn(
                            'ml-3 font-serif text-lg tabular-nums leading-none',
                            barWidth > 15
                              ? i >= 2
                                ? 'text-white'
                                : 'text-neutral-800'
                              : 'text-neutral-700',
                          )}
                        >
                          {fmtNum(step.count)}
                        </span>
                      </div>
                    </div>

                    {/* Rates */}
                    <div className="w-28 flex-shrink-0 text-right">
                      {i === 0 ? (
                        <span className="text-[12px] font-medium text-neutral-400">
                          100%
                        </span>
                      ) : (
                        <div>
                          <p className="text-[13px] font-semibold tabular-nums text-neutral-900">
                            {fmtPct(step.absoluteRate)}
                          </p>
                          <p className="text-[11px] tabular-nums text-red-400">
                            &minus;{fmtPct(step.dropFromPrevious)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile: vertical funnel */}
          <div className="sm:hidden space-y-2">
            {overallFunnel.map((step, i) => {
              const maxCount = overallFunnel[0].count;
              const barWidth = maxCount > 0 ? (step.count / maxCount) * 100 : 0;

              return (
                <div key={step.key}>
                  {/* Drop arrow between steps */}
                  {i > 0 && (
                    <div className="flex items-center justify-center py-1">
                      <ArrowDown className="h-4 w-4 text-neutral-300" />
                      <span className="ml-1.5 text-[11px] tabular-nums text-red-400">
                        &minus;{fmtPct(step.dropFromPrevious)}
                      </span>
                    </div>
                  )}

                  <div className="rounded-lg border border-neutral-100 bg-neutral-50/50 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[13px] font-medium text-neutral-700">
                        {step.label}
                      </p>
                      <div className="flex items-baseline gap-2">
                        <span className="font-serif text-lg tabular-nums text-neutral-900">
                          {fmtNum(step.count)}
                        </span>
                        {i > 0 && (
                          <span className="text-[11px] tabular-nums text-neutral-400">
                            {fmtPct(step.absoluteRate)}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Bar */}
                    <div className="h-2 w-full rounded-full bg-neutral-200/60">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-700',
                          stepColors[i],
                        )}
                        style={{ width: `${Math.max(barWidth, 3)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Overall conversion rate badge */}
          {overallFunnel.length > 0 && (
            <div className="mt-5 flex items-center justify-center gap-2 pt-4 border-t border-neutral-100">
              <span className="text-[12px] font-medium text-neutral-500">
                Taux de conversion global
              </span>
              <span className="inline-flex items-center rounded-md bg-emerald-50 px-2.5 py-1 text-[13px] font-semibold tabular-nums text-emerald-700 border border-emerald-200/60">
                {fmtPct(overallFunnel[overallFunnel.length - 1].absoluteRate)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* ===== DROP-OFF ANALYSIS ===== */}
      {hasData && transitions.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {transitions.map((t) => {
            const convRate =
              t.from.count > 0
                ? ((t.to.count) / t.from.count) * 100
                : 0;
            const lostRate = 100 - convRate;
            const lostCount = t.from.count - t.to.count;

            return (
              <div
                key={t.label}
                className="rounded-xl border border-neutral-200/80 bg-white p-4 sm:p-5 transition-all hover:border-neutral-300 hover:shadow-soft"
              >
                {/* Transition label */}
                <div className="flex items-center gap-2 mb-3">
                  <ArrowRight className="h-3.5 w-3.5 text-neutral-400" />
                  <p className="text-[13px] font-medium text-neutral-600">
                    {t.label}
                  </p>
                </div>

                {/* Conversion rate */}
                <div className="flex items-baseline gap-3 mb-3">
                  <p className="font-serif text-2xl tabular-nums text-neutral-900 leading-none">
                    {fmtPct(convRate)}
                  </p>
                  <span className="text-[12px] font-medium text-emerald-600">
                    conversion
                  </span>
                </div>

                {/* Lost */}
                <div className="flex items-center gap-2 mb-3">
                  <TrendingDown className="h-3 w-3 text-red-400" />
                  <span className="text-[12px] tabular-nums text-red-400">
                    {fmtPct(lostRate)} perdu
                  </span>
                  <span className="text-[11px] text-neutral-300">
                    ({fmtNum(lostCount)})
                  </span>
                </div>

                {/* Visual bar */}
                <div className="h-2 w-full rounded-full bg-red-100/60">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${Math.max(convRate, 2)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===== CHANNEL BREAKDOWN TABLE ===== */}
      {hasData && channelFunnels.length > 0 && (
        <div className="rounded-xl border border-neutral-200/80 bg-white">
          <div className="flex items-center gap-2 px-4 sm:px-5 py-3 sm:py-4 border-b border-neutral-100">
            <Filter className="h-4 w-4 text-neutral-400" />
            <h2 className="text-[15px] font-semibold text-neutral-900">
              Funnel par canal
            </h2>
            {!isLoading && (
              <span className="text-[12px] text-neutral-400 ml-1">
                {channelFunnels.length}
              </span>
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-neutral-100 text-left">
                  <th className="px-5 py-3 font-medium text-neutral-400">
                    Canal
                  </th>
                  <th
                    className="px-5 py-3 font-medium text-neutral-400 text-right cursor-pointer hover:text-neutral-600 transition-colors"
                    onClick={() => handleSort('visits')}
                  >
                    <span className="inline-flex items-center gap-1">
                      Visites
                      {sortBy === 'visits' && (
                        sortAsc ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                      )}
                    </span>
                  </th>
                  <th className="px-5 py-3 font-medium text-neutral-400 text-right">
                    Ajouts
                  </th>
                  <th className="px-5 py-3 font-medium text-neutral-400 text-right">
                    Checkouts
                  </th>
                  <th
                    className="px-5 py-3 font-medium text-neutral-400 text-right cursor-pointer hover:text-neutral-600 transition-colors"
                    onClick={() => handleSort('purchase')}
                  >
                    <span className="inline-flex items-center gap-1">
                      Achats
                      {sortBy === 'purchase' && (
                        sortAsc ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                      )}
                    </span>
                  </th>
                  <th
                    className="px-5 py-3 font-medium text-neutral-400 text-right cursor-pointer hover:text-neutral-600 transition-colors"
                    onClick={() => handleSort('conversionRate')}
                  >
                    <span className="inline-flex items-center gap-1">
                      Taux de conv.
                      {sortBy === 'conversionRate' && (
                        sortAsc ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                      )}
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {visibleChannels.map((ch) => (
                  <tr
                    key={ch.channel}
                    className="hover:bg-neutral-50/60 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2 w-2 rounded-full flex-shrink-0 ${channelDots[ch.channel]}`}
                        />
                        <span className="font-medium text-neutral-800">
                          {channelLabels[ch.channel]}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-neutral-600">
                      {fmtNum(ch.visits)}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-neutral-600">
                      {fmtNum(ch.addToCart)}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-neutral-600">
                      {fmtNum(ch.checkout)}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums font-medium text-neutral-900">
                      {fmtNum(ch.purchase)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[12px] font-semibold tabular-nums border bg-emerald-50 text-emerald-700 border-emerald-200/60">
                        {fmtPct(ch.conversionRate)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="divide-y divide-neutral-100 sm:hidden">
            {visibleChannels.map((ch) => (
              <div key={ch.channel} className="px-4 py-3.5">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full flex-shrink-0 ${channelDots[ch.channel]}`}
                    />
                    <span className="text-[13px] font-medium text-neutral-900">
                      {channelLabels[ch.channel]}
                    </span>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[12px] font-semibold tabular-nums border bg-emerald-50 text-emerald-700 border-emerald-200/60">
                    {fmtPct(ch.conversionRate)}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider">
                      Visites
                    </p>
                    <p className="text-[13px] tabular-nums text-neutral-700 mt-0.5">
                      {fmtNum(ch.visits)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider">
                      Ajouts
                    </p>
                    <p className="text-[13px] tabular-nums text-neutral-700 mt-0.5">
                      {fmtNum(ch.addToCart)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider">
                      Checkout
                    </p>
                    <p className="text-[13px] tabular-nums text-neutral-700 mt-0.5">
                      {fmtNum(ch.checkout)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider">
                      Achats
                    </p>
                    <p className="text-[13px] font-medium tabular-nums text-neutral-900 mt-0.5">
                      {fmtNum(ch.purchase)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Show more / less */}
          {hasMoreChannels && (
            <div className="border-t border-neutral-100 px-5 py-3 text-center">
              <button
                onClick={() => setShowAllChannels(!showAllChannels)}
                className="inline-flex items-center gap-1 text-[12px] font-medium text-neutral-500 hover:text-neutral-700 transition-colors"
              >
                {showAllChannels ? (
                  <>
                    <ChevronUp className="h-3.5 w-3.5" />
                    Voir moins
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3.5 w-3.5" />
                    Voir les {sortedChannelFunnels.length - CHANNEL_LIMIT} autres canaux
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
