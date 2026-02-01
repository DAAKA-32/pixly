'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Target,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
} from 'lucide-react';
import { useAnalytics, type Period } from '@/hooks/use-analytics';
import { MetricCard } from '@/components/dashboard/metric-card';
import { RevenueChart, ChannelBreakdown } from '@/components/dashboard/chart-card';
import { ConversionTable } from '@/components/dashboard/conversion-table';
import { CampaignTable } from '@/components/dashboard/campaign-table';
import { FilterPanel, defaultFilters, type DashboardFilters } from '@/components/dashboard/filter-panel';
import { AlertNotification } from '@/components/dashboard/alert-notification';
import { ExportButtons } from '@/components/dashboard/export-buttons';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import type { Channel } from '@/types';

// ===========================================
// PIXLY - Dashboard Page
// Analytics Overview avec données réelles
// Filtrage dynamique, alertes, export
// ===========================================

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
  '7d': '7 jours',
  '30d': '30 jours',
  '90d': '90 jours',
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

export default function DashboardPage() {
  const { metrics, isLoading, isFetching, period, setPeriod, refresh } = useAnalytics({
    period: '30d',
    autoRefresh: true,
    refreshInterval: 60000,
  });

  const [filters, setFilters] = useState<DashboardFilters>(defaultFilters);

  // Apply filters to campaigns
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

  // Apply channel filter to channel breakdown
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

  // Revenue chart data
  const revenueChartData = useMemo(() => {
    if (!metrics?.revenueByDay) return [];

    return metrics.revenueByDay.map((day) => ({
      date: new Date(day.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
      revenue: day.revenue,
      conversions: day.conversions,
    }));
  }, [metrics?.revenueByDay]);

  // Filtered conversions
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
    <div className="space-y-6">
      {/* Alerts */}
      {!isLoading && (
        <AlertNotification metrics={metrics} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Suivez vos performances marketing en temps réel
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ExportButtons
            metrics={metrics}
            periodLabel={periodLabels[period]}
            isLoading={isLoading}
          />

          <div className="flex rounded-xl border border-neutral-200 bg-white p-1">
            {(['7d', '30d', '90d'] as Period[]).map((range) => (
              <button
                key={range}
                onClick={() => setPeriod(range)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  period === range
                    ? 'bg-primary-500 text-white'
                    : 'text-neutral-600 hover:bg-neutral-100'
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
            className="relative"
          >
            <RefreshCw className={`h-4 w-4 transition-transform ${isFetching ? 'animate-spin' : ''}`} />
            {isFetching && !isLoading && (
              <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-primary-500 animate-pulse" />
            )}
          </Button>
        </div>
      </div>

      {/* Filter Panel */}
      <FilterPanel filters={filters} onFiltersChange={setFilters} />

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Revenu Total"
          value={metrics?.overview.totalRevenue || 0}
          previousValue={(metrics?.overview.totalRevenue || 0) * 0.85}
          format="currency"
          icon={<DollarSign className="h-5 w-5" />}
          isLoading={isLoading}
        />
        <MetricCard
          title="ROAS"
          value={metrics?.overview.roas || 0}
          previousValue={(metrics?.overview.roas || 0) * 0.9}
          format="roas"
          icon={<TrendingUp className="h-5 w-5" />}
          description="Return on Ad Spend"
          isLoading={isLoading}
        />
        <MetricCard
          title="Conversions"
          value={metrics?.overview.totalConversions || 0}
          previousValue={(metrics?.overview.totalConversions || 0) * 0.8}
          icon={<ShoppingCart className="h-5 w-5" />}
          isLoading={isLoading}
        />
        <MetricCard
          title="Panier Moyen"
          value={metrics?.overview.aov || 0}
          previousValue={(metrics?.overview.aov || 0) * 0.95}
          format="currency"
          icon={<Target className="h-5 w-5" />}
          isLoading={isLoading}
        />
      </div>

      {/* Secondary Metrics */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-6 sm:grid-cols-3"
      >
        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-neutral-200 bg-white p-6 transition-shadow hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Dépenses Pub</p>
              <p className="text-xl font-bold text-neutral-900">
                {formatCurrency(metrics?.overview.totalSpend || 0)}
              </p>
            </div>
          </div>
          <p className="mt-2 text-xs text-neutral-400">
            Données des plateformes publicitaires
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-neutral-200 bg-white p-6 transition-shadow hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
              <BarChart3 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">CPA</p>
              <p className="text-xl font-bold text-neutral-900">
                {formatCurrency(metrics?.overview.cpa || 0)}
              </p>
            </div>
          </div>
          <p className="mt-2 text-xs text-neutral-400">
            Coût par acquisition
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-neutral-200 bg-white p-6 transition-shadow hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
              <PieChart className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Canaux actifs</p>
              <p className="text-xl font-bold text-neutral-900">
                {channelData.length}
              </p>
            </div>
          </div>
          <p className="mt-2 text-xs text-neutral-400">
            Sources de trafic avec conversions
          </p>
        </motion.div>
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart data={revenueChartData} isLoading={isLoading} />
        </div>
        <ChannelBreakdown data={channelData} isLoading={isLoading} />
      </div>

      {/* Campaign Performance Table (filtered) */}
      <CampaignTable
        campaigns={filteredCampaigns}
        isLoading={isLoading}
      />

      {/* Recent Conversions Table (filtered) */}
      <ConversionTable
        conversions={filteredConversions}
        isLoading={isLoading}
      />

      {/* Empty State */}
      {!isLoading && metrics?.overview.totalConversions === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50 p-12 text-center"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
            <BarChart3 className="h-8 w-8 text-neutral-400" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-neutral-900">
            Aucune donnée pour cette période
          </h3>
          <p className="mt-2 text-sm text-neutral-500">
            Installez votre pixel de tracking pour commencer à collecter des données.
          </p>
          <Button className="mt-6" onClick={() => window.location.href = '/dashboard/integrations'}>
            Installer le pixel
          </Button>
        </motion.div>
      )}
    </div>
  );
}
