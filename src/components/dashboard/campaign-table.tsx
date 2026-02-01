'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowUpDown, TrendingUp, TrendingDown } from 'lucide-react';
import type { CampaignMetrics, Channel } from '@/types';

// ===========================================
// PIXLY - Campaign Performance Table
// Sortable, searchable campaign overview
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

const channelDots: Record<Channel, string> = {
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

type SortKey = 'campaignName' | 'spend' | 'revenue' | 'conversions' | 'roas' | 'cpa';
type SortDir = 'asc' | 'desc';

interface CampaignTableProps {
  campaigns: CampaignMetrics[];
  isLoading?: boolean;
}

export function CampaignTable({ campaigns, isLoading }: CampaignTableProps) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('revenue');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const filtered = useMemo(() => {
    let result = [...campaigns];

    // Search filter
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.campaignName.toLowerCase().includes(q) ||
          channelLabels[c.channel].toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sortDir === 'asc'
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });

    return result;
  }, [campaigns, search, sortKey, sortDir]);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-6">
        <div className="h-6 w-48 animate-pulse rounded-lg bg-neutral-200 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-neutral-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-100 p-5">
        <h3 className="text-lg font-semibold text-neutral-900">
          Campagnes
        </h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 rounded-lg border border-neutral-200 bg-neutral-50 pl-9 pr-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <SortHeader
                label="Campagne"
                sortKey="campaignName"
                currentKey={sortKey}
                direction={sortDir}
                onSort={toggleSort}
              />
              <th className="px-4 py-3 font-medium text-neutral-500">Canal</th>
              <SortHeader
                label="Dépense"
                sortKey="spend"
                currentKey={sortKey}
                direction={sortDir}
                onSort={toggleSort}
                align="right"
              />
              <SortHeader
                label="Revenu"
                sortKey="revenue"
                currentKey={sortKey}
                direction={sortDir}
                onSort={toggleSort}
                align="right"
              />
              <SortHeader
                label="Conv."
                sortKey="conversions"
                currentKey={sortKey}
                direction={sortDir}
                onSort={toggleSort}
                align="right"
              />
              <SortHeader
                label="ROAS"
                sortKey="roas"
                currentKey={sortKey}
                direction={sortDir}
                onSort={toggleSort}
                align="right"
              />
              <SortHeader
                label="CPA"
                sortKey="cpa"
                currentKey={sortKey}
                direction={sortDir}
                onSort={toggleSort}
                align="right"
              />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-neutral-500">
                  Aucune campagne trouvée
                </td>
              </tr>
            ) : (
              filtered.map((camp, idx) => (
                <motion.tr
                  key={camp.campaignId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.02 }}
                  className="hover:bg-neutral-50/80 transition-colors"
                >
                  <td className="px-4 py-3.5 font-medium text-neutral-900">
                    {camp.campaignName}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${channelDots[camp.channel]}`} />
                      <span className="text-neutral-600">
                        {channelLabels[camp.channel]}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right text-neutral-600">
                    {camp.spend.toLocaleString('fr-FR')} €
                  </td>
                  <td className="px-4 py-3.5 text-right font-medium text-neutral-900">
                    {camp.revenue.toLocaleString('fr-FR')} €
                  </td>
                  <td className="px-4 py-3.5 text-right text-neutral-600">
                    {camp.conversions}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className={`inline-flex items-center gap-1 font-semibold ${
                      camp.roas >= 4 ? 'text-green-600' :
                      camp.roas >= 2 ? 'text-primary-600' :
                      'text-red-600'
                    }`}>
                      {camp.roas >= 4 ? (
                        <TrendingUp className="h-3.5 w-3.5" />
                      ) : camp.roas < 2 ? (
                        <TrendingDown className="h-3.5 w-3.5" />
                      ) : null}
                      {camp.roas.toFixed(2)}x
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right text-neutral-600">
                    {camp.cpa.toFixed(2)} €
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Sortable column header
function SortHeader({
  label,
  sortKey,
  currentKey,
  direction,
  onSort,
  align = 'left',
}: {
  label: string;
  sortKey: SortKey;
  currentKey: SortKey;
  direction: SortDir;
  onSort: (key: SortKey) => void;
  align?: 'left' | 'right';
}) {
  const isActive = currentKey === sortKey;
  return (
    <th
      className={`px-4 py-3 font-medium text-neutral-500 cursor-pointer select-none hover:text-neutral-700 transition-colors ${
        align === 'right' ? 'text-right' : ''
      }`}
      onClick={() => onSort(sortKey)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <ArrowUpDown className={`h-3.5 w-3.5 ${isActive ? 'text-primary-500' : 'text-neutral-300'}`} />
      </span>
    </th>
  );
}
