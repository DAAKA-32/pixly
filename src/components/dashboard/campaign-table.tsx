'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowUpDown, TrendingUp, TrendingDown } from 'lucide-react';
import type { CampaignMetrics, Channel } from '@/types';

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

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.campaignName.toLowerCase().includes(q) ||
          channelLabels[c.channel].toLowerCase().includes(q)
      );
    }

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
      <div className="rounded-2xl border border-neutral-200/80 bg-white">
        <div className="p-5">
          <div className="h-5 w-32 animate-pulse rounded-md bg-neutral-100" />
        </div>
        <div className="px-5 pb-5 space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-11 animate-pulse rounded-lg bg-neutral-50" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
        <div className="flex items-baseline gap-2.5">
          <h3 className="text-[15px] font-semibold text-neutral-900">Campagnes</h3>
          <span className="text-[12px] tabular-nums text-neutral-400">
            {filtered.length}
          </span>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 rounded-lg border border-neutral-200/80 bg-neutral-50 pl-8 pr-3 text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-300 focus:bg-white focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-neutral-100 text-left">
              <SortHeader
                label="Campagne"
                sortKey="campaignName"
                currentKey={sortKey}
                direction={sortDir}
                onSort={toggleSort}
              />
              <th className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-neutral-400">Canal</th>
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
                <td colSpan={7} className="px-4 py-8 text-center text-[13px] text-neutral-400">
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
                  className="transition-colors hover:bg-neutral-50/60"
                >
                  <td className="max-w-[220px] truncate px-4 py-3 font-medium text-neutral-900">
                    {camp.campaignName}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className={`h-1.5 w-1.5 rounded-full ${channelDots[camp.channel]}`} />
                      <span className="text-neutral-500">
                        {channelLabels[camp.channel]}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-neutral-500">
                    {camp.spend.toLocaleString('fr-FR')} &euro;
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums font-medium text-neutral-900">
                    {camp.revenue.toLocaleString('fr-FR')} &euro;
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-neutral-500">
                    {camp.conversions}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`inline-flex items-center gap-0.5 tabular-nums font-semibold ${
                      camp.roas >= 4 ? 'text-emerald-600' :
                      camp.roas >= 2 ? 'text-neutral-900' :
                      'text-red-500'
                    }`}>
                      {camp.roas >= 4 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : camp.roas < 2 && camp.spend > 0 ? (
                        <TrendingDown className="h-3 w-3" />
                      ) : null}
                      {camp.roas.toFixed(2)}x
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-neutral-500">
                    {camp.cpa.toFixed(2)} &euro;
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
      className={`cursor-pointer select-none px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider transition-colors hover:text-neutral-600 ${
        isActive ? 'text-neutral-600' : 'text-neutral-400'
      } ${align === 'right' ? 'text-right' : ''}`}
      onClick={() => onSort(sortKey)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <ArrowUpDown className={`h-3 w-3 ${isActive ? 'text-emerald-500' : 'text-neutral-300'}`} />
      </span>
    </th>
  );
}
