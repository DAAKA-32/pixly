'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Target,
  RefreshCw,
  BarChart3,
  Wallet,
  CreditCard,
} from 'lucide-react';
import { useAnalytics, type Period } from '@/hooks/use-analytics';
import { useWorkspace } from '@/hooks/use-workspace';
import { MetricCard, MetricCardMini } from '@/components/dashboard/metric-card';
import { RevenueChart, ChannelBreakdown } from '@/components/dashboard/chart-card';
import { ConversionTable } from '@/components/dashboard/conversion-table';
import { CampaignTable } from '@/components/dashboard/campaign-table';
import { GeoMap } from '@/components/dashboard/geo-map';
import { defaultFilters, type DashboardFilters } from '@/components/dashboard/filter-panel';
import { AlertNotification } from '@/components/dashboard/alert-notification';
import { ExportButtons } from '@/components/dashboard/export-buttons';
import { Button } from '@/components/ui/button';
import { HelpButton } from '@/components/help/help-button';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import type { Channel } from '@/types';

const channelColors: Record<Channel, string> = {
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
  other: 'Other',
};

const periodLabels: Record<Period, string> = {
  '7d': '7j',
  '30d': '30j',
  '90d': '90j',
};

export default function DashboardPage() {
  const { metrics, previousMetrics, isLoading, isFetching, period, setPeriod, refresh, lastUpdatedAt } = useAnalytics({
    period: '30d',
    autoRefresh: true,
    refreshInterval: 60000,
  });
  const { currentWorkspace } = useWorkspace();

  const [filters, setFilters] = useState<DashboardFilters>(defaultFilters);

  const filteredCampaigns = useMemo(() => {
    if (!metrics?.byCampaign) return [];

    let result = [...metrics.byCampaign];

    if (filters.channels.length > 0) {
      result = result.filter((c) => filters.channels.includes(c.channel));
    }

    if (filters.campaignSearch) {
      const q = filters.campaignSearch.toLowerCase();
      result = result.filter((c) => c.campaignName.toLowerCase().includes(q));
    }

    if (filters.status === 'profitable') {
      result = result.filter((c) => c.roas >= 2);
    } else if (filters.status === 'unprofitable') {
      result = result.filter((c) => c.roas < 2 && c.spend > 0);
    }

    if (filters.minRoas !== null) {
      result = result.filter((c) => c.roas >= filters.minRoas!);
    }

    return result;
  }, [metrics?.byCampaign, filters]);

  const channelData = useMemo(() => {
    if (!metrics?.byChannel) return [];

    return Object.entries(metrics.byChannel)
      .filter(([channel, data]) => {
        if (filters.channels.length > 0 && !filters.channels.includes(channel as Channel)) {
          return false;
        }
        return data.revenue > 0 || data.conversions > 0;
      })
      .map(([channel, data]) => ({
        channel: channel as Channel,
        label: channelLabels[channel as Channel] || channel,
        value: data.revenue,
        conversions: data.conversions,
        color: channelColors[channel as Channel] || '#94A3B8',
        percentage: metrics.overview.totalRevenue > 0
          ? (data.revenue / metrics.overview.totalRevenue) * 100
          : 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [metrics?.byChannel, metrics?.overview.totalRevenue, filters.channels]);

  const revenueChartData = useMemo(() => {
    if (!metrics?.revenueByDay) return [];

    return metrics.revenueByDay.map((day) => ({
      date: new Date(day.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
      revenue: day.revenue,
      conversions: day.conversions,
    }));
  }, [metrics?.revenueByDay]);

  const filteredConversions = useMemo(() => {
    if (!metrics?.conversions) return [];
    if (filters.channels.length === 0) return metrics.conversions;

    return metrics.conversions.filter((c) => {
      const channel = c.attribution?.touchpoints[0]?.channel;
      return channel && filters.channels.includes(channel);
    });
  }, [metrics?.conversions, filters.channels]);

  const handleRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
            Vue d&apos;ensemble
          </h1>
          {currentWorkspace && (
            <p className="mt-0.5 text-[13px] text-neutral-400">
              {currentWorkspace.name}
              {lastUpdatedAt ? (
                <span className="ml-2 text-neutral-300">
                  &middot;
                  <span className="ml-2">
                    Mis à jour {formatRelativeTime(new Date(lastUpdatedAt))}
                  </span>
                </span>
              ) : null}
            </p>
          )}
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
            title="Rafraîchir"
            className="relative h-8 w-8"
          >
            <RefreshCw className={`h-3.5 w-3.5 transition-transform ${isFetching ? 'animate-spin' : ''}`} />
          </Button>

          <HelpButton pageId="dashboard" />
        </div>
      </div>

      {/* Primary KPI row */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
        <MetricCard
          title="Revenu Total"
          value={metrics?.overview.totalRevenue || 0}
          previousValue={previousMetrics?.totalRevenue ?? undefined}
          format="currency"
          icon={<DollarSign className="h-3.5 w-3.5" />}
          tooltip="Le revenu total généré par toutes vos conversions sur la période sélectionnée."
          isLoading={isLoading}
        />
        <MetricCard
          title="ROAS"
          value={metrics?.overview.roas || 0}
          previousValue={previousMetrics?.roas ?? undefined}
          format="roas"
          icon={<TrendingUp className="h-3.5 w-3.5" />}
          tooltip="Return On Ad Spend : pour chaque euro dépensé en publicité, combien vous rapportez. Un ROAS de 3x signifie 3€ de revenu pour 1€ de dépense."
          isLoading={isLoading}
        />
        <MetricCard
          title="Conversions"
          value={metrics?.overview.totalConversions || 0}
          previousValue={previousMetrics?.totalConversions ?? undefined}
          icon={<ShoppingCart className="h-3.5 w-3.5" />}
          tooltip="Le nombre total de conversions (achats, leads) trackées sur cette période."
          isLoading={isLoading}
        />
        <MetricCard
          title="Panier Moyen"
          value={metrics?.overview.aov || 0}
          previousValue={previousMetrics?.aov ?? undefined}
          format="currency"
          icon={<Target className="h-3.5 w-3.5" />}
          tooltip="Average Order Value : la valeur moyenne d'une conversion. Calculé en divisant le revenu total par le nombre de conversions."
          isLoading={isLoading}
        />
      </div>

      {/* Secondary metrics */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4">
        <MetricCardMini
          title="Dépenses Pub"
          value={metrics?.overview.totalSpend || 0}
          previousValue={previousMetrics?.totalSpend ?? undefined}
          format="currency"
          icon={<Wallet className="h-3 w-3" />}
          tooltip="Le montant total dépensé en publicité sur toutes vos plateformes (Meta, Google, TikTok, etc.)."
          isLoading={isLoading}
        />
        <MetricCardMini
          title="CPA"
          value={metrics?.overview.cpa || 0}
          previousValue={previousMetrics?.cpa ?? undefined}
          format="currency"
          icon={<CreditCard className="h-3 w-3" />}
          tooltip="Cost Per Acquisition : le coût moyen pour acquérir une conversion. Calculé en divisant les dépenses pub par le nombre de conversions."
          isLoading={isLoading}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart data={revenueChartData} isLoading={isLoading} />
        </div>
        <ChannelBreakdown data={channelData} isLoading={isLoading} />
      </div>

      {/* Geolocation Map */}
      {metrics?.byCountry && metrics.byCountry.length > 0 && (
        <GeoMap data={metrics.byCountry} isLoading={isLoading} />
      )}

      {/* Campaign Table with inline filters */}
      <CampaignTable
        campaigns={filteredCampaigns}
        isLoading={isLoading}
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Activity Feed */}
      <ConversionTable
        conversions={filteredConversions}
        isLoading={isLoading}
      />

      {/* Alerts at bottom */}
      {!isLoading && (
        <AlertNotification metrics={metrics} workspace={currentWorkspace} />
      )}

      {/* Empty State */}
      {!isLoading && metrics?.overview.totalConversions === 0 && (
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-white p-10 text-center">
          <BarChart3 className="mx-auto h-7 w-7 text-neutral-300" />
          <h3 className="mt-3 text-[15px] font-semibold text-neutral-900">
            Pas encore de données
          </h3>
          <p className="mt-1.5 text-[13px] text-neutral-400">
            Installez votre pixel de tracking pour commencer à suivre vos conversions et revenus.
          </p>
          <Link href="/integrations">
            <Button className="mt-5">
              Installer le pixel
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
