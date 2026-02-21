'use client';

import { useMemo, useState, useCallback } from 'react';
import {
  MousePointerClick,
  Route,
  Search,
  ChevronDown,
  ChevronUp,
  BarChart3,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Wallet,
  RefreshCw,
} from 'lucide-react';
import { useAnalytics, type Period } from '@/hooks/use-analytics';
import { RevenueChart, ChannelBreakdown } from '@/components/dashboard/chart-card';
import { ExportButtons } from '@/components/dashboard/export-buttons';
import { Button } from '@/components/ui/button';
import { HelpButton } from '@/components/help/help-button';
import { cn, formatCurrency } from '@/lib/utils';
import { usePlanGate } from '@/hooks/use-plan-gate';
import type { Channel, AttributionModel, Conversion, Touchpoint } from '@/types';

// ===========================================
// PIXLY — Attribution Page
// Decision-oriented layout for marketing professionals
// Structure: Header → KPIs → Channels + Donut → Revenue → Campaigns
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
  tiktok: 'bg-neutral-900',
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
  tiktok: 'bg-neutral-900/80',
  linkedin: 'bg-sky-600/80',
  bing: 'bg-teal-500/80',
  organic: 'bg-green-500/80',
  direct: 'bg-neutral-400/80',
  email: 'bg-purple-500/80',
  referral: 'bg-amber-500/80',
  other: 'bg-neutral-300/80',
};

const channelHex: Record<Channel, string> = {
  meta: '#1877F2',
  google: '#EA4335',
  tiktok: '#000000',
  linkedin: '#0A66C2',
  bing: '#00809D',
  organic: '#22C55E',
  direct: '#6B7280',
  email: '#8B5CF6',
  referral: '#F59E0B',
  other: '#94A3B8',
};

const periodLabels: Record<Period, string> = {
  '7d': '7j',
  '30d': '30j',
  '90d': '90j',
};

const periodDescriptions: Record<Period, string> = {
  '7d': '7 derniers jours',
  '30d': '30 derniers jours',
  '90d': '90 derniers jours',
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

/** Format amount in EUR with French locale — smart decimals */
function fmtEur(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: amount >= 100 ? 0 : 2,
  }).format(amount);
}

/** Compact EUR format for channel rows */
function fmtCompact(amount: number): string {
  if (amount >= 10000) {
    return `${(amount / 1000).toFixed(0).replace('.', ',')}k\u202F€`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1).replace('.', ',')}k\u202F€`;
  }
  return `${Math.round(amount).toLocaleString('fr-FR')}\u202F€`;
}

const CHANNEL_DISPLAY_LIMIT = 5;
const CAMPAIGN_DISPLAY_LIMIT = 10;

// ===========================================
// Attribution model recalculation
// Redistributes conversion credit across touchpoints
// ===========================================

function recalculateAttribution(
  conversions: Conversion[],
  model: AttributionModel
): { byChannel: Record<string, { revenue: number; conversions: number }>; byCampaign: Record<string, { revenue: number; conversions: number }> } {
  const byChannel: Record<string, { revenue: number; conversions: number }> = {};
  const byCampaign: Record<string, { revenue: number; conversions: number }> = {};

  for (const conversion of conversions) {
    const touchpoints = conversion.attribution?.touchpoints;
    if (!touchpoints || touchpoints.length === 0) continue;

    const value = conversion.value || 0;
    const credits = computeCredits(touchpoints, model);

    for (let i = 0; i < touchpoints.length; i++) {
      const tp = touchpoints[i];
      const credit = credits[i];

      // Aggregate by channel
      if (!byChannel[tp.channel]) {
        byChannel[tp.channel] = { revenue: 0, conversions: 0 };
      }
      byChannel[tp.channel].revenue += value * credit;
      byChannel[tp.channel].conversions += credit;

      // Aggregate by campaign (use campaign name or fallback)
      const campaignKey = tp.campaign || `${tp.channel}_direct`;
      if (!byCampaign[campaignKey]) {
        byCampaign[campaignKey] = { revenue: 0, conversions: 0 };
      }
      byCampaign[campaignKey].revenue += value * credit;
      byCampaign[campaignKey].conversions += credit;
    }
  }

  return { byChannel, byCampaign };
}

/** Compute credit distribution for a set of touchpoints given an attribution model */
function computeCredits(touchpoints: Touchpoint[], model: AttributionModel): number[] {
  const n = touchpoints.length;
  const credits = new Array<number>(n).fill(0);

  switch (model) {
    case 'last_click':
      credits[n - 1] = 1;
      break;

    case 'first_click':
      credits[0] = 1;
      break;

    case 'linear':
      for (let i = 0; i < n; i++) {
        credits[i] = 1 / n;
      }
      break;

    case 'time_decay': {
      // Exponential decay with 7-day half-life — more recent = more credit
      const HALF_LIFE_MS = 7 * 24 * 60 * 60 * 1000;
      const DECAY = Math.LN2 / HALF_LIFE_MS;
      const lastTs = new Date(touchpoints[n - 1].timestamp).getTime();
      let totalWeight = 0;

      for (let i = 0; i < n; i++) {
        const ts = new Date(touchpoints[i].timestamp).getTime();
        const age = lastTs - ts; // ms from this touchpoint to the last one
        const weight = Math.exp(-DECAY * age);
        credits[i] = weight;
        totalWeight += weight;
      }

      // Normalize to sum to 1
      if (totalWeight > 0) {
        for (let i = 0; i < n; i++) {
          credits[i] /= totalWeight;
        }
      }
      break;
    }

    case 'position_based': {
      // 40% first, 40% last, 20% split among middle
      if (n === 1) {
        credits[0] = 1;
      } else if (n === 2) {
        credits[0] = 0.5;
        credits[1] = 0.5;
      } else {
        credits[0] = 0.4;
        credits[n - 1] = 0.4;
        const middleCredit = 0.2 / (n - 2);
        for (let i = 1; i < n - 1; i++) {
          credits[i] = middleCredit;
        }
      }
      break;
    }
  }

  return credits;
}

export default function AttributionPage() {
  const { metrics, isLoading, isFetching, period, setPeriod, refresh } = useAnalytics({ period: '30d' });
  const { canModel, requiredPlanForModel } = usePlanGate();
  const [attributionModel, setAttributionModel] = useState<AttributionModel>('last_click');
  const [sortBy, setSortBy] = useState<'revenue' | 'conversions' | 'roas'>('revenue');
  const [campaignSearch, setCampaignSearch] = useState('');
  const [showAllChannels, setShowAllChannels] = useState(false);
  const [showAllCampaigns, setShowAllCampaigns] = useState(false);
  const [channelFilter, setChannelFilter] = useState<Channel | null>(null);

  // === Recalculate attribution based on selected model ===
  const recalculated = useMemo(() => {
    if (!metrics?.conversions || metrics.conversions.length === 0) return null;
    return recalculateAttribution(metrics.conversions, attributionModel);
  }, [metrics?.conversions, attributionModel]);

  // === Channel data, sorted by revenue ===
  const channels = useMemo(() => {
    if (!metrics?.byChannel) return [];

    return Object.entries(metrics.byChannel)
      .filter(([_, data]) => data.revenue > 0 || data.conversions > 0)
      .map(([key, data]) => {
        const ch = key as Channel;
        // Override revenue/conversions with recalculated values if model is not last_click
        if (recalculated && attributionModel !== 'last_click' && recalculated.byChannel[ch]) {
          const recalc = recalculated.byChannel[ch];
          const revenue = recalc.revenue;
          const conversions = Math.round(recalc.conversions);
          return {
            ...data,
            channel: ch,
            revenue,
            conversions,
            roas: data.spend > 0 ? revenue / data.spend : 0,
          };
        }
        return {
          ...data,
          channel: ch,
          roas: data.spend > 0 ? data.revenue / data.spend : 0,
        };
      })
      .sort((a, b) => b.revenue - a.revenue);
  }, [metrics?.byChannel, recalculated, attributionModel]);

  // === Campaigns with search + sort + channel filter ===
  const campaigns = useMemo(() => {
    if (!metrics?.byCampaign) return [];
    let result = metrics.byCampaign.map((camp) => {
      // Override revenue/conversions with recalculated values if model is not last_click
      if (recalculated && attributionModel !== 'last_click') {
        const campaignKey = camp.campaignName || `${camp.channel}_direct`;
        const recalc = recalculated.byCampaign[campaignKey];
        if (recalc) {
          const revenue = recalc.revenue;
          const conversions = Math.round(recalc.conversions);
          return {
            ...camp,
            revenue,
            conversions,
            roas: camp.spend > 0 ? revenue / camp.spend : 0,
            cpa: conversions > 0 ? camp.spend / conversions : 0,
          };
        }
      }
      return { ...camp };
    });

    if (channelFilter) {
      result = result.filter((c) => c.channel === channelFilter);
    }

    if (campaignSearch.trim()) {
      const q = campaignSearch.toLowerCase().trim();
      result = result.filter((c) => c.campaignName.toLowerCase().includes(q));
    }

    switch (sortBy) {
      case 'conversions':
        return result.sort((a, b) => b.conversions - a.conversions);
      case 'roas':
        return result.sort((a, b) => b.roas - a.roas);
      default:
        return result.sort((a, b) => b.revenue - a.revenue);
    }
  }, [metrics?.byCampaign, sortBy, campaignSearch, channelFilter, recalculated, attributionModel]);

  // === Donut chart data ===
  const channelChartData = useMemo(() => {
    if (!channels.length) return [];
    const total = channels.reduce((sum, ch) => sum + ch.revenue, 0);
    return channels.map((ch) => ({
      channel: ch.channel,
      label: channelLabels[ch.channel],
      value: ch.revenue,
      percentage: total > 0 ? (ch.revenue / total) * 100 : 0,
      color: channelHex[ch.channel],
      conversions: ch.conversions,
    }));
  }, [channels]);

  // === Revenue over time ===
  const revenueChartData = useMemo(() => {
    if (!metrics?.revenueByDay) return [];
    return metrics.revenueByDay.map((day) => ({
      date: new Date(day.date).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
      }),
      revenue: day.revenue,
      conversions: day.conversions,
    }));
  }, [metrics?.revenueByDay]);

  // === KPI aggregates (use recalculated totals when model is not last_click) ===
  const totalSpend = metrics?.overview.totalSpend || 0;
  const totalRevenue = useMemo(() => {
    if (recalculated && attributionModel !== 'last_click') {
      return Object.values(recalculated.byChannel).reduce((sum, ch) => sum + ch.revenue, 0);
    }
    return metrics?.overview.totalRevenue || 0;
  }, [metrics?.overview.totalRevenue, recalculated, attributionModel]);
  const totalConversions = useMemo(() => {
    if (recalculated && attributionModel !== 'last_click') {
      return Math.round(Object.values(recalculated.byChannel).reduce((sum, ch) => sum + ch.conversions, 0));
    }
    return metrics?.overview.totalConversions || 0;
  }, [metrics?.overview.totalConversions, recalculated, attributionModel]);
  const overallRoas = totalSpend > 0 ? totalRevenue / totalSpend : 0;

  const maxChannelRevenue = channels.length > 0
    ? Math.max(...channels.map((c) => c.revenue))
    : 1;

  // Progressive disclosure
  const hasMoreChannels = channels.length > CHANNEL_DISPLAY_LIMIT;
  const visibleChannels = showAllChannels ? channels : channels.slice(0, CHANNEL_DISPLAY_LIMIT);

  const visibleCampaigns = showAllCampaigns ? campaigns : campaigns.slice(0, CAMPAIGN_DISPLAY_LIMIT);
  const hasMoreCampaigns = campaigns.length > CAMPAIGN_DISPLAY_LIMIT;

  // Active channels for filter pills
  const activeChannels = useMemo(() => {
    if (!metrics?.byCampaign) return [];
    const channelSet = new Set(metrics.byCampaign.map((c) => c.channel));
    return Array.from(channelSet).sort();
  }, [metrics?.byCampaign]);

  const handleRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* ===== HEADER ===== */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
            Attribution
          </h1>
          <p className="mt-0.5 text-[13px] text-neutral-400">
            Répartition de vos revenus par canal — {periodDescriptions[period]}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <ExportButtons
            metrics={metrics}
            periodLabel={periodLabels[period]}
            isLoading={isLoading}
          />

          <div className="flex rounded-lg border border-neutral-200/80 bg-white p-0.5">
            {(['7d', '30d', '90d'] as Period[]).map((range) => (
              <button
                key={range}
                onClick={() => setPeriod(range)}
                className={`rounded-md px-3 py-1.5 text-[13px] font-medium transition-all ${
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
            title="Rafraîchir"
            className="relative h-8 w-8"
          >
            <RefreshCw className={`h-3.5 w-3.5 transition-transform ${isFetching ? 'animate-spin' : ''}`} />
          </Button>

          <HelpButton pageId="attribution" />
        </div>
      </div>

      {/* ===== KPI CARDS ===== */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label="Revenu attribué"
          value={fmtEur(totalRevenue)}
          icon={<DollarSign className="h-3.5 w-3.5" />}
          isLoading={isLoading}
        />
        <KpiCard
          label="Dépenses pub"
          value={fmtEur(totalSpend)}
          icon={<Wallet className="h-3.5 w-3.5" />}
          isLoading={isLoading}
        />
        <KpiCard
          label="ROAS global"
          value={`${overallRoas.toFixed(2)}x`}
          valueColor={roasColor(overallRoas)}
          icon={<TrendingUp className="h-3.5 w-3.5" />}
          isLoading={isLoading}
          badge={overallRoas >= 2 ? { label: 'Rentable', variant: 'success' as const } : overallRoas >= 1 ? { label: 'Neutre', variant: 'warning' as const } : undefined}
        />
        <KpiCard
          label="Conversions"
          value={totalConversions.toLocaleString('fr-FR')}
          icon={<ShoppingCart className="h-3.5 w-3.5" />}
          isLoading={isLoading}
          subtitle={totalConversions > 0 && totalSpend > 0 ? `CPA ${fmtEur(totalSpend / totalConversions)}` : undefined}
        />
      </div>

      {/* ===== CHANNEL ATTRIBUTION + DONUT ===== */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Channel Bars — 2/3 width on desktop */}
        <div className="lg:col-span-2 rounded-xl border border-neutral-200/80 bg-white">
          <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <Route className="h-4 w-4 text-neutral-400" />
              <h2 className="text-[15px] font-semibold text-neutral-900">
                Attribution par canal
              </h2>
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <select
                value={attributionModel}
                onChange={(e) => {
                  const model = e.target.value as AttributionModel;
                  if (canModel(model)) setAttributionModel(model);
                }}
                className="rounded-md border border-neutral-200/80 bg-neutral-50 px-2.5 py-1 text-[11px] font-medium text-neutral-600 focus:outline-none focus:ring-1 focus:ring-neutral-300 cursor-pointer"
              >
                <option value="last_click">Dernier clic</option>
                <option value="first_click">{canModel('first_click') ? 'Premier clic' : `Premier clic (${requiredPlanForModel('first_click')})`}</option>
                <option value="linear" disabled={!canModel('linear')}>{canModel('linear') ? 'Linéaire' : `Linéaire (${requiredPlanForModel('linear')})`}</option>
                <option value="time_decay" disabled={!canModel('time_decay')}>{canModel('time_decay') ? 'Décroissance temporelle' : `Décroissance temporelle (${requiredPlanForModel('time_decay')})`}</option>
                <option value="position_based" disabled={!canModel('position_based')}>{canModel('position_based') ? 'Basé sur la position' : `Basé sur la position (${requiredPlanForModel('position_based')})`}</option>
              </select>
              <span className="text-[10px] text-neutral-400 leading-tight">
                Les résultats sont recalculés localement selon le modèle choisi.
              </span>
            </div>
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
                Aucune donnée d&apos;attribution pour cette période
              </p>
            ) : (
              <>
                {/* Desktop column headers */}
                <div className="hidden sm:flex items-center gap-3 px-3 -mx-3 pb-2 text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                  <span className="w-[140px] flex-shrink-0">Canal</span>
                  <span className="flex-1" />
                  <div className="flex items-center flex-shrink-0">
                    <span className="w-[68px] text-right">Dépense</span>
                    <span className="w-[68px] text-right">Revenu</span>
                    <span className="w-[46px] text-right">Conv.</span>
                    <span className="w-[56px] text-right">ROAS</span>
                    <span className="w-[44px] text-right">Part</span>
                  </div>
                </div>

                <div className="space-y-1 sm:space-y-0">
                  {visibleChannels.map((ch) => {
                    const share = totalRevenue > 0
                      ? (ch.revenue / totalRevenue) * 100
                      : 0;
                    const barWidth = maxChannelRevenue > 0
                      ? (ch.revenue / maxChannelRevenue) * 100
                      : 0;

                    return (
                      <div
                        key={ch.channel}
                        onClick={() => setChannelFilter(channelFilter === ch.channel ? null : ch.channel)}
                        className={cn(
                          'group flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3 rounded-lg px-3 py-2 sm:py-2.5 -mx-3 cursor-pointer transition-colors',
                          channelFilter === ch.channel
                            ? 'bg-neutral-100/80'
                            : 'hover:bg-neutral-50'
                        )}
                      >
                        {/* Channel label */}
                        <div className="flex items-center justify-between sm:justify-start sm:w-[140px] sm:flex-shrink-0">
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full flex-shrink-0 ${channelDots[ch.channel]}`} />
                            <span className="text-[13px] font-medium text-neutral-800 truncate">
                              {channelLabels[ch.channel]}
                            </span>
                          </div>
                          {/* Mobile: ROAS badge next to label */}
                          <span className={`sm:hidden inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold tabular-nums border ${roasBadge(ch.roas)}`}>
                            {ch.roas.toFixed(1)}x
                          </span>
                        </div>

                        {/* Bar */}
                        <div className="flex-1 h-4 sm:h-5 bg-neutral-100/60 rounded overflow-hidden">
                          <div
                            className={`h-full rounded ${channelBars[ch.channel]} transition-all duration-500`}
                            style={{ width: `${Math.max(barWidth, 2)}%` }}
                          />
                        </div>

                        {/* Desktop metrics */}
                        <div className="hidden sm:flex items-center flex-shrink-0 text-[13px] tabular-nums">
                          <span className="w-[68px] text-right text-neutral-500">
                            {fmtCompact(ch.spend)}
                          </span>
                          <span className="w-[68px] text-right font-semibold text-neutral-900">
                            {fmtCompact(ch.revenue)}
                          </span>
                          <span className="w-[46px] text-right text-neutral-600">
                            {ch.conversions}
                          </span>
                          <span className="w-[56px] text-right">
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold border ${roasBadge(ch.roas)}`}>
                              {ch.roas.toFixed(1)}x
                            </span>
                          </span>
                          <span className="w-[44px] text-right font-medium text-primary-600 text-[12px]">
                            {share.toFixed(0)}%
                          </span>
                        </div>

                        {/* Mobile metrics */}
                        <div className="flex items-center justify-between sm:hidden text-[12px] tabular-nums">
                          <span className="font-semibold text-neutral-900">
                            {fmtCompact(ch.revenue)}
                          </span>
                          <span className="text-neutral-500">
                            Dép. {fmtCompact(ch.spend)}
                          </span>
                          <span className="text-neutral-500">
                            {ch.conversions} conv.
                          </span>
                          <span className="font-medium text-primary-600">
                            {share.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Show more / less toggle */}
                {hasMoreChannels && (
                  <button
                    onClick={() => setShowAllChannels(!showAllChannels)}
                    className="mt-3 flex items-center gap-1 text-[12px] font-medium text-neutral-500 hover:text-neutral-700 transition-colors mx-auto"
                  >
                    {showAllChannels ? (
                      <>
                        <ChevronUp className="h-3.5 w-3.5" />
                        Voir moins
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3.5 w-3.5" />
                        Voir les {channels.length - CHANNEL_DISPLAY_LIMIT} autres canaux
                      </>
                    )}
                  </button>
                )}

                {/* Active filter indicator */}
                {channelFilter && (
                  <div className="mt-3 flex items-center justify-center gap-2">
                    <span className="text-[11px] text-neutral-500">
                      Filtrage campagnes :
                    </span>
                    <button
                      onClick={() => setChannelFilter(null)}
                      className="inline-flex items-center gap-1 rounded-md bg-primary-600 px-2 py-0.5 text-[11px] font-medium text-white"
                    >
                      <div className={`h-1.5 w-1.5 rounded-full ${channelDots[channelFilter]}`} style={{ filter: 'brightness(1.5)' }} />
                      {channelLabels[channelFilter]}
                      <span className="ml-0.5 opacity-60">×</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Donut Chart — visible on all screen sizes */}
        <ChannelBreakdown
          data={channelChartData}
          title="Répartition des revenus"
          isLoading={isLoading}
          formatValue={fmtEur}
        />
      </div>

      {/* ===== REVENUE TREND ===== */}
      <RevenueChart
        data={revenueChartData}
        title="Revenu attribué"
        isLoading={isLoading}
      />

      {/* ===== CAMPAIGN PERFORMANCE ===== */}
      <div className="rounded-xl border border-neutral-200/80 bg-white">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-neutral-100">
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

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400 pointer-events-none" />
              <input
                type="text"
                value={campaignSearch}
                onChange={(e) => setCampaignSearch(e.target.value)}
                placeholder="Rechercher..."
                className="h-8 w-36 sm:w-44 rounded-lg border border-neutral-200/80 bg-neutral-50 pl-8 pr-3 text-[12px] text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-300 focus:bg-white transition-colors"
              />
            </div>

            {/* Sort pills */}
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
        </div>

        {/* Channel filter pills */}
        {activeChannels.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto px-4 sm:px-5 py-2.5 border-b border-neutral-50 scrollbar-none">
            <button
              onClick={() => setChannelFilter(null)}
              className={cn(
                'flex-shrink-0 rounded-md px-2.5 py-1 text-[11px] font-medium transition-all',
                !channelFilter
                  ? 'bg-primary-600 text-white'
                  : 'bg-neutral-50 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700'
              )}
            >
              Tous
            </button>
            {activeChannels.map((ch) => (
              <button
                key={ch}
                onClick={() => setChannelFilter(channelFilter === ch ? null : ch)}
                className={cn(
                  'flex-shrink-0 flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium transition-all',
                  channelFilter === ch
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-50 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700'
                )}
              >
                <div
                  className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    channelFilter === ch ? '' : channelDots[ch]
                  )}
                  style={channelFilter === ch ? { backgroundColor: '#fff', opacity: 0.6 } : undefined}
                />
                {channelLabels[ch]}
              </button>
            ))}
          </div>
        )}

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
              {campaignSearch
                ? `Aucune campagne pour « ${campaignSearch} »`
                : channelFilter
                  ? `Aucune campagne ${channelLabels[channelFilter]} pour cette période`
                  : 'Aucune campagne pour cette période'}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile: card layout */}
            <div className="divide-y divide-neutral-100 sm:hidden">
              {visibleCampaigns.map((camp) => (
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
                        {fmtEur(camp.revenue)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider">Dépense</p>
                      <p className="text-[13px] text-neutral-600 tabular-nums mt-0.5">
                        {fmtEur(camp.spend)}
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
                  {visibleCampaigns.map((camp) => (
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
                        {fmtEur(camp.spend)}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums font-medium text-neutral-900">
                        {fmtEur(camp.revenue)}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums text-neutral-600">
                        {camp.conversions}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums text-neutral-500">
                        {fmtEur(camp.cpa)}
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

            {/* Show more / less campaigns */}
            {hasMoreCampaigns && (
              <div className="border-t border-neutral-100 px-5 py-3 text-center">
                <button
                  onClick={() => setShowAllCampaigns(!showAllCampaigns)}
                  className="inline-flex items-center gap-1 text-[12px] font-medium text-neutral-500 hover:text-neutral-700 transition-colors"
                >
                  {showAllCampaigns ? (
                    <>
                      <ChevronUp className="h-3.5 w-3.5" />
                      Voir moins
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3.5 w-3.5" />
                      Voir les {campaigns.length - CAMPAIGN_DISPLAY_LIMIT} autres campagnes
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ===========================================
// KPI Card — Premium, data-focused
// ===========================================

function KpiCard({
  label,
  value,
  valueColor,
  icon,
  isLoading,
  badge,
  subtitle,
}: {
  label: string;
  value: string;
  valueColor?: string;
  icon?: React.ReactNode;
  isLoading?: boolean;
  badge?: { label: string; variant: 'success' | 'warning' | 'danger' };
  subtitle?: string;
}) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-neutral-200/80 bg-white p-4 sm:p-5">
        <div className="h-3 w-20 animate-pulse rounded bg-neutral-100 mb-3" />
        <div className="h-7 w-28 animate-pulse rounded bg-neutral-100" />
      </div>
    );
  }

  const badgeColors = {
    success: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-700',
    danger: 'bg-red-50 text-red-600',
  };

  return (
    <div className="rounded-xl border border-neutral-200/80 bg-white p-4 sm:p-5 transition-all hover:border-neutral-300 hover:shadow-soft group">
      <div className="flex items-center gap-1.5">
        {icon && (
          <span className="text-neutral-400 group-hover:text-neutral-500 transition-colors">{icon}</span>
        )}
        <p className="text-[11px] sm:text-[12px] font-medium text-neutral-500 uppercase tracking-wide">
          {label}
        </p>
      </div>
      <div className="mt-2 sm:mt-2.5 flex items-baseline gap-2">
        <p className={cn(
          'font-serif text-xl sm:text-2xl leading-none tracking-tight tabular-nums',
          valueColor || 'text-neutral-900'
        )}>
          {value}
        </p>
        {badge && (
          <span className={cn('inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold', badgeColors[badge.variant])}>
            {badge.label}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="mt-1.5 text-[11px] text-neutral-400">{subtitle}</p>
      )}
    </div>
  );
}
