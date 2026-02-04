'use client';

import { useMemo, useState } from 'react';
import {
  MousePointerClick,
  BarChart3,
  Route,
} from 'lucide-react';
import { useAnalytics, type Period } from '@/hooks/use-analytics';
import { formatCurrency } from '@/lib/utils';
import type { Channel } from '@/types';

// ===========================================
// PIXLY - Attribution Page
// Data-focused, decision-oriented layout
// ===========================================

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
  tiktok: 'bg-neutral-800',
  linkedin: 'bg-sky-600',
  bing: 'bg-teal-500',
  organic: 'bg-green-500',
  direct: 'bg-neutral-400',
  email: 'bg-purple-500',
  referral: 'bg-amber-500',
  other: 'bg-neutral-300',
};

const channelBars: Record<Channel, string> = {
  meta: 'bg-blue-500/80',
  google: 'bg-red-500/80',
  tiktok: 'bg-neutral-800/80',
  linkedin: 'bg-sky-600/80',
  bing: 'bg-teal-500/80',
  organic: 'bg-green-500/80',
  direct: 'bg-neutral-400/80',
  email: 'bg-purple-500/80',
  referral: 'bg-amber-500/80',
  other: 'bg-neutral-300/80',
};

const periodLabels: Record<Period, string> = {
  '7d': '7j',
  '30d': '30j',
  '90d': '90j',
};

function roasColor(roas: number): string {
  if (roas >= 4) return 'text-emerald-600';
  if (roas >= 2) return 'text-neutral-900';
  if (roas >= 1) return 'text-amber-600';
  return 'text-red-500';
}

function roasBadge(roas: number): string {
  if (roas >= 4) return 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
  if (roas >= 2) return 'bg-neutral-50 text-neutral-700 border-neutral-200/60';
  if (roas >= 1) return 'bg-amber-50 text-amber-700 border-amber-200/60';
  return 'bg-red-50 text-red-600 border-red-200/60';
}

export default function AttributionPage() {
  const { metrics, isLoading, period, setPeriod } = useAnalytics({ period: '30d' });
  const [sortBy, setSortBy] = useState<'revenue' | 'conversions' | 'roas'>('revenue');

  const channels = useMemo(() => {
    if (!metrics?.byChannel) return [];
    return Object.entries(metrics.byChannel)
      .filter(([_, data]) => data.revenue > 0 || data.conversions > 0)
      .map(([key, data]) => ({
        ...data,
        channel: key as Channel,
        roas: data.spend > 0 ? data.revenue / data.spend : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [metrics?.byChannel]);

  const campaigns = useMemo(() => {
    if (!metrics?.byCampaign) return [];
    const sorted = [...metrics.byCampaign];
    switch (sortBy) {
      case 'conversions':
        return sorted.sort((a, b) => b.conversions - a.conversions);
      case 'roas':
        return sorted.sort((a, b) => b.roas - a.roas);
      default:
        return sorted.sort((a, b) => b.revenue - a.revenue);
    }
  }, [metrics?.byCampaign, sortBy]);

  const totalRevenue = metrics?.overview.totalRevenue || 0;
  const totalConversions = metrics?.overview.totalConversions || 0;
  const totalSpend = metrics?.overview.totalSpend || 0;
  const overallRoas = totalSpend > 0 ? totalRevenue / totalSpend : 0;

  const topChannel = channels.length > 0 ? channels[0] : null;
  const topChannelShare = topChannel && totalRevenue > 0
    ? ((topChannel.revenue / totalRevenue) * 100).toFixed(0)
    : '0';

  const maxChannelRevenue = channels.length > 0
    ? Math.max(...channels.map((c) => c.revenue))
    : 1;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[20px] sm:text-[22px] font-semibold tracking-tight text-neutral-900">
            Attribution
          </h1>
          <p className="mt-0.5 text-[13px] text-neutral-400">
            Contribution de chaque canal à vos conversions
          </p>
        </div>

        <div className="flex rounded-lg border border-neutral-200/80 bg-white p-0.5 self-start sm:self-auto">
          {(['7d', '30d', '90d'] as Period[]).map((range) => (
            <button
              key={range}
              onClick={() => setPeriod(range)}
              className={`rounded-md px-3.5 py-2 sm:px-3 sm:py-1.5 text-[13px] font-medium transition-all ${
                period === range
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              {periodLabels[range]}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <KpiCard
          label="Revenu attribué"
          value={formatCurrency(totalRevenue)}
          isLoading={isLoading}
        />
        <KpiCard
          label="Conversions"
          value={totalConversions.toLocaleString('fr-FR')}
          isLoading={isLoading}
        />
        <KpiCard
          label="ROAS global"
          value={`${overallRoas.toFixed(2)}x`}
          valueColor={roasColor(overallRoas)}
          isLoading={isLoading}
        />
        <KpiCard
          label="Canal dominant"
          value={topChannel ? channelLabels[topChannel.channel] : '—'}
          suffix={topChannel ? `${topChannelShare}%` : undefined}
          isLoading={isLoading}
        />
      </div>

      {/* Channel Attribution */}
      <div className="rounded-xl border border-neutral-200/80 bg-white">
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Route className="h-4 w-4 text-neutral-400" />
            <h2 className="text-[15px] font-semibold text-neutral-900">
              Attribution par canal
            </h2>
          </div>
          <span className="text-[12px] text-neutral-400">
            Modèle : Last-Click
          </span>
        </div>

        <div className="p-4 sm:p-5">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-lg bg-neutral-50" />
              ))}
            </div>
          ) : channels.length === 0 ? (
            <p className="py-8 text-center text-sm text-neutral-400">
              Aucune donnée d'attribution pour cette période
            </p>
          ) : (
            <div className="space-y-1.5 sm:space-y-2.5">
              {channels.map((ch) => {
                const share = totalRevenue > 0
                  ? (ch.revenue / totalRevenue) * 100
                  : 0;
                const barWidth = maxChannelRevenue > 0
                  ? (ch.revenue / maxChannelRevenue) * 100
                  : 0;

                return (
                  <div
                    key={ch.channel}
                    className="group flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4 rounded-lg px-3 py-2 sm:py-2.5 -mx-3 hover:bg-neutral-50 transition-colors"
                  >
                    {/* Channel label — on mobile: label + share side by side */}
                    <div className="flex items-center justify-between sm:justify-start sm:w-[140px] sm:flex-shrink-0">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full flex-shrink-0 ${channelDots[ch.channel]}`} />
                        <span className="text-[13px] font-medium text-neutral-800 truncate">
                          {channelLabels[ch.channel]}
                        </span>
                      </div>
                      <span className="text-[12px] font-semibold text-primary-600 sm:hidden">
                        {share.toFixed(1)}%
                      </span>
                    </div>

                    {/* Bar */}
                    <div className="flex-1 h-4 sm:h-6 bg-neutral-100/60 rounded overflow-hidden">
                      <div
                        className={`h-full rounded ${channelBars[ch.channel]} transition-all duration-500`}
                        style={{ width: `${Math.max(barWidth, 2)}%` }}
                      />
                    </div>

                    {/* Metrics — on mobile: revenue + conversions side by side */}
                    <div className="flex items-center justify-between sm:justify-end sm:gap-5 flex-shrink-0 text-[12px] sm:text-[13px] tabular-nums">
                      <span className="font-semibold text-neutral-900 sm:w-[72px] sm:text-right">
                        {ch.revenue >= 1000
                          ? `${(ch.revenue / 1000).toFixed(1)}k€`
                          : `${ch.revenue.toLocaleString('fr-FR')}€`
                        }
                      </span>
                      <span className="text-neutral-500 sm:w-[48px] sm:text-right">
                        {ch.conversions} cv
                      </span>
                      {/* Share % — hidden on mobile (shown next to label), visible on desktop */}
                      <span className="hidden sm:inline w-[44px] text-right font-medium text-primary-600">
                        {share.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Campaign Performance */}
      <div className="rounded-xl border border-neutral-200/80 bg-white">
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <MousePointerClick className="h-4 w-4 text-neutral-400" />
            <h2 className="text-[15px] font-semibold text-neutral-900">
              Campagnes
            </h2>
            {!isLoading && (
              <span className="text-[12px] text-neutral-400 ml-1">
                {campaigns.length}
              </span>
            )}
          </div>

          <div className="flex rounded-lg border border-neutral-200/80 bg-neutral-50 p-0.5">
            {([
              { key: 'revenue' as const, label: 'Revenu' },
              { key: 'conversions' as const, label: 'Conv.' },
              { key: 'roas' as const, label: 'ROAS' },
            ]).map((opt) => (
              <button
                key={opt.key}
                onClick={() => setSortBy(opt.key)}
                className={`rounded-md px-2.5 py-1.5 sm:py-1 text-[12px] font-medium transition-all ${
                  sortBy === opt.key
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-600'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="p-4 sm:p-5 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-neutral-50" />
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="py-12 text-center">
            <BarChart3 className="mx-auto h-6 w-6 text-neutral-300" />
            <p className="mt-2 text-[13px] text-neutral-400">
              Aucune campagne pour cette période
            </p>
          </div>
        ) : (
          <>
            {/* Mobile: card layout */}
            <div className="divide-y divide-neutral-100 sm:hidden">
              {campaigns.map((camp) => (
                <div key={camp.campaignId} className="px-4 py-3.5">
                  <div className="flex items-start gap-2 mb-2.5">
                    <div className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${channelDots[camp.channel]}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-neutral-900 leading-snug">
                        {camp.campaignName}
                      </p>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        {channelLabels[camp.channel]}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[12px] font-semibold tabular-nums border flex-shrink-0 ${roasBadge(camp.roas)}`}>
                      {camp.roas.toFixed(2)}x
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider">Revenu</p>
                      <p className="text-[13px] font-semibold text-neutral-900 tabular-nums mt-0.5">
                        {formatCurrency(camp.revenue)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider">Dépense</p>
                      <p className="text-[13px] text-neutral-600 tabular-nums mt-0.5">
                        {formatCurrency(camp.spend)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider">Conv.</p>
                      <p className="text-[13px] text-neutral-600 tabular-nums mt-0.5">
                        {camp.conversions}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: table layout */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-neutral-100 text-left">
                    <th className="px-5 py-3 font-medium text-neutral-400">Campagne</th>
                    <th className="px-5 py-3 font-medium text-neutral-400">Canal</th>
                    <th className="px-5 py-3 font-medium text-neutral-400 text-right">Dépense</th>
                    <th className="px-5 py-3 font-medium text-neutral-400 text-right">Revenu</th>
                    <th className="px-5 py-3 font-medium text-neutral-400 text-right">Conv.</th>
                    <th className="px-5 py-3 font-medium text-neutral-400 text-right">CPA</th>
                    <th className="px-5 py-3 font-medium text-neutral-400 text-right">ROAS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {campaigns.map((camp) => (
                    <tr
                      key={camp.campaignId}
                      className="hover:bg-neutral-50/60 transition-colors"
                    >
                      <td className="px-5 py-3 font-medium text-neutral-900 max-w-[240px] truncate">
                        {camp.campaignName}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${channelDots[camp.channel]}`} />
                          <span className="text-neutral-600">
                            {channelLabels[camp.channel]}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums text-neutral-500">
                        {formatCurrency(camp.spend)}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums font-medium text-neutral-900">
                        {formatCurrency(camp.revenue)}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums text-neutral-600">
                        {camp.conversions}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums text-neutral-500">
                        {formatCurrency(camp.cpa)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[12px] font-semibold tabular-nums border ${roasBadge(camp.roas)}`}>
                          {camp.roas.toFixed(2)}x
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ===========================================
// KPI Card - Compact inline metric
// ===========================================

function KpiCard({
  label,
  value,
  valueColor,
  suffix,
  isLoading,
}: {
  label: string;
  value: string;
  valueColor?: string;
  suffix?: string;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-neutral-200/80 bg-white px-3.5 py-3 sm:px-5 sm:py-4">
        <div className="h-3 w-20 animate-pulse rounded bg-neutral-100 mb-2.5" />
        <div className="h-6 w-24 animate-pulse rounded bg-neutral-100" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-neutral-200/80 bg-white px-3.5 py-3 sm:px-5 sm:py-4 transition-all hover:border-neutral-300 hover:shadow-soft">
      <p className="text-[10px] sm:text-[11px] font-medium text-neutral-400 uppercase tracking-wide">
        {label}
      </p>
      <div className="mt-1 sm:mt-1.5 flex items-baseline gap-1.5 sm:gap-2">
        <p className={`text-lg sm:text-xl font-semibold tabular-nums ${valueColor || 'text-neutral-900'}`}>
          {value}
        </p>
        {suffix && (
          <span className="text-[11px] sm:text-[12px] font-medium text-primary-600">{suffix}</span>
        )}
      </div>
    </div>
  );
}
