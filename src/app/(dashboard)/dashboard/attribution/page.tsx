'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  GitBranch,
  MousePointerClick,
} from 'lucide-react';
import { useAnalytics } from '@/hooks/use-analytics';
import type { Channel } from '@/types';

// ===========================================
// PIXLY - Attribution Page
// Multi-touch attribution analysis
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
  other: 'Other',
};

const channelColors: Record<Channel, string> = {
  meta: 'bg-blue-500',
  google: 'bg-red-500',
  tiktok: 'bg-neutral-900',
  linkedin: 'bg-sky-600',
  bing: 'bg-teal-500',
  organic: 'bg-green-500',
  direct: 'bg-neutral-500',
  email: 'bg-purple-500',
  referral: 'bg-amber-500',
  other: 'bg-neutral-400',
};

export default function AttributionPage() {
  const { metrics, isLoading, period, setPeriod } = useAnalytics({ period: '30d' });

  const campaigns = useMemo(() => {
    if (!metrics?.byCampaign) return [];
    return [...metrics.byCampaign].sort((a, b) => b.revenue - a.revenue);
  }, [metrics?.byCampaign]);

  const channels = useMemo(() => {
    if (!metrics?.byChannel) return [];
    return Object.entries(metrics.byChannel)
      .filter(([_, data]) => data.revenue > 0 || data.conversions > 0)
      .map(([key, data]) => ({
        ...data,
        channel: key as Channel,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [metrics?.byChannel]);

  const totalRevenue = metrics?.overview.totalRevenue || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Attribution</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Analysez la contribution de chaque canal et campagne
          </p>
        </div>
        <div className="flex rounded-xl border border-neutral-200 bg-white p-1">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setPeriod(range)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                period === range
                  ? 'bg-primary-500 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              {range === '7d' ? '7 jours' : range === '30d' ? '30 jours' : '90 jours'}
            </button>
          ))}
        </div>
      </div>

      {/* Attribution Model Info */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
            <GitBranch className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">
              Attribution Last-Click
            </h2>
            <p className="text-sm text-neutral-500">
              Le dernier point de contact avant la conversion reçoit 100% du crédit
            </p>
          </div>
        </div>
      </div>

      {/* Channel Attribution */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="h-5 w-5 text-neutral-700" />
          <h2 className="text-lg font-semibold text-neutral-900">
            Attribution par Canal
          </h2>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-neutral-100" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {channels.map((ch, idx) => {
              const percentage = totalRevenue > 0
                ? (ch.revenue / totalRevenue) * 100
                : 0;

              return (
                <motion.div
                  key={ch.channel}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="rounded-xl border border-neutral-100 bg-neutral-50 p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full ${channelColors[ch.channel]}`} />
                      <span className="text-sm font-semibold text-neutral-900">
                        {channelLabels[ch.channel]}
                      </span>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <span className="text-neutral-500">
                        {ch.conversions} conv.
                      </span>
                      <span className="font-semibold text-neutral-900">
                        {ch.revenue.toLocaleString('fr-FR')} €
                      </span>
                      <span className="text-primary-600 font-medium">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="h-2 rounded-full bg-neutral-200 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.6, delay: idx * 0.05 }}
                      className={`h-full rounded-full ${channelColors[ch.channel]}`}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Campaign Performance */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6">
        <div className="flex items-center gap-2 mb-6">
          <MousePointerClick className="h-5 w-5 text-neutral-700" />
          <h2 className="text-lg font-semibold text-neutral-900">
            Performance des Campagnes
          </h2>
        </div>

        {isLoading ? (
          <div className="h-64 animate-pulse rounded-xl bg-neutral-100" />
        ) : (
          <div className="overflow-hidden rounded-xl border border-neutral-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50 text-left">
                  <th className="px-4 py-3 font-medium text-neutral-500">Campagne</th>
                  <th className="px-4 py-3 font-medium text-neutral-500">Canal</th>
                  <th className="px-4 py-3 font-medium text-neutral-500 text-right">Dépense</th>
                  <th className="px-4 py-3 font-medium text-neutral-500 text-right">Revenu</th>
                  <th className="px-4 py-3 font-medium text-neutral-500 text-right">Conv.</th>
                  <th className="px-4 py-3 font-medium text-neutral-500 text-right">ROAS</th>
                  <th className="px-4 py-3 font-medium text-neutral-500 text-right">CPA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {campaigns.map((camp, idx) => (
                  <motion.tr
                    key={camp.campaignId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.03 }}
                    className="hover:bg-neutral-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-neutral-900">
                      {camp.campaignName}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${channelColors[camp.channel]}`} />
                        <span className="text-neutral-600">
                          {channelLabels[camp.channel]}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-neutral-600">
                      {camp.spend.toLocaleString('fr-FR')} €
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-neutral-900">
                      {camp.revenue.toLocaleString('fr-FR')} €
                    </td>
                    <td className="px-4 py-3 text-right text-neutral-600">
                      {camp.conversions}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-semibold ${
                        camp.roas >= 4 ? 'text-green-600' :
                        camp.roas >= 2 ? 'text-primary-600' :
                        'text-red-600'
                      }`}>
                        {camp.roas.toFixed(2)}x
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-neutral-600">
                      {camp.cpa.toFixed(2)} €
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
