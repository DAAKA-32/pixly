'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowUpDown, Filter, X, ChevronDown } from 'lucide-react';
import type { CampaignMetrics, Channel } from '@/types';
import type { DashboardFilters } from '@/components/dashboard/filter-panel';

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
  direct: 'bg-neutral-400',
  email: 'bg-purple-500',
  referral: 'bg-amber-500',
  other: 'bg-neutral-300',
};

const channelOptions: { value: Channel; label: string }[] = [
  { value: 'meta', label: 'Meta' },
  { value: 'google', label: 'Google' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'bing', label: 'Bing' },
  { value: 'organic', label: 'Organic' },
  { value: 'direct', label: 'Direct' },
  { value: 'email', label: 'Email' },
  { value: 'referral', label: 'Referral' },
];

type SortKey = 'campaignName' | 'spend' | 'revenue' | 'conversions' | 'roas' | 'cpa';
type SortDir = 'asc' | 'desc';

interface CampaignTableProps {
  campaigns: CampaignMetrics[];
  isLoading?: boolean;
  filters?: DashboardFilters;
  onFiltersChange?: (filters: DashboardFilters) => void;
}

export function CampaignTable({ campaigns, isLoading, filters, onFiltersChange }: CampaignTableProps) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('revenue');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const activeFilterCount = useMemo(() => {
    if (!filters) return 0;
    let count = 0;
    if (filters.channels.length > 0) count++;
    if (filters.status !== 'all') count++;
    if (filters.minRoas !== null) count++;
    return count;
  }, [filters]);

  const toggleChannel = (channel: Channel) => {
    if (!filters || !onFiltersChange) return;
    const newChannels = filters.channels.includes(channel)
      ? filters.channels.filter((c) => c !== channel)
      : [...filters.channels, channel];
    onFiltersChange({ ...filters, channels: newChannels });
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

  const displayed = showAll ? filtered : filtered.slice(0, 10);
  const hasMore = filtered.length > 10;

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
      <div className="flex flex-col gap-3 border-b border-neutral-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-baseline gap-2.5">
          <h3 className="text-[15px] font-semibold text-neutral-900">Campagnes</h3>
          <span className="text-[12px] tabular-nums text-neutral-400">
            {filtered.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
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
          {onFiltersChange && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`relative flex h-8 items-center gap-1.5 rounded-lg border px-3 text-[13px] font-medium transition-colors ${
                showFilters || activeFilterCount > 0
                  ? 'border-primary-200 bg-primary-50 text-primary-700'
                  : 'border-neutral-200/80 bg-neutral-50 text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <Filter className="h-3.5 w-3.5" />
              Filtres
              {activeFilterCount > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary-500 text-[9px] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Inline Filters */}
      <AnimatePresence>
        {showFilters && filters && onFiltersChange && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-3 border-b border-neutral-100 px-5 py-3 sm:flex-row sm:items-center sm:flex-wrap">
              {/* Channel pills */}
              <div className="flex flex-wrap gap-1.5">
                {channelOptions.map((option) => {
                  const isActive = filters.channels.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      onClick={() => toggleChannel(option.value)}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                        isActive
                          ? 'bg-primary-600 text-white'
                          : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>

              {/* Status toggle */}
              <div className="flex rounded-lg border border-neutral-200 bg-neutral-50 p-0.5">
                {([
                  { value: 'all', label: 'Tous' },
                  { value: 'profitable', label: 'Rentable' },
                  { value: 'unprofitable', label: 'Non rentable' },
                ] as const).map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => onFiltersChange({ ...filters, status: opt.value })}
                    className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                      filters.status === opt.value
                        ? 'bg-white text-neutral-900 shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* ROAS min */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-neutral-400">ROAS min.</span>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={filters.minRoas ?? ''}
                  onChange={(e) =>
                    onFiltersChange({
                      ...filters,
                      minRoas: e.target.value ? parseFloat(e.target.value) : null,
                    })
                  }
                  placeholder="—"
                  className="h-7 w-16 rounded-md border border-neutral-200 bg-neutral-50 px-2 text-[11px] tabular-nums text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-300 focus:bg-white focus:outline-none transition-all"
                />
              </div>

              {/* Clear */}
              {activeFilterCount > 0 && (
                <button
                  onClick={() => onFiltersChange({ channels: [], campaignSearch: '', minRoas: null, status: 'all' })}
                  className="flex items-center gap-1 text-[11px] font-medium text-red-500 hover:text-red-600 transition-colors"
                >
                  <X className="h-3 w-3" />
                  Réinitialiser
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile card layout */}
      <div className="divide-y divide-neutral-100 sm:hidden">
        {displayed.length === 0 ? (
          <div className="px-4 py-8 text-center text-[13px] text-neutral-400">
            Aucun résultat pour cette recherche
          </div>
        ) : (
          displayed.map((camp) => (
            <div key={camp.campaignId} className="px-4 py-3.5">
              <div className="mb-2.5 flex items-start gap-2">
                <div className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${channelDots[camp.channel]}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium leading-snug text-neutral-900">
                    {camp.campaignName}
                  </p>
                  <p className="mt-0.5 text-[11px] text-neutral-500">
                    {channelLabels[camp.channel]}
                  </p>
                </div>
                <span className={`inline-flex flex-shrink-0 items-center rounded-md px-2 py-0.5 text-[12px] font-semibold tabular-nums ${
                  camp.roas >= 4 ? 'bg-emerald-50 text-emerald-700' :
                  camp.roas >= 2 ? 'bg-neutral-100 text-neutral-700' :
                  'bg-red-50 text-red-600'
                }`}>
                  {camp.roas.toFixed(2)}x
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">Revenu</p>
                  <p className="mt-0.5 text-[13px] font-semibold tabular-nums text-neutral-900">
                    {camp.revenue.toLocaleString('fr-FR')} &euro;
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">Dépense</p>
                  <p className="mt-0.5 text-[13px] tabular-nums text-neutral-600">
                    {camp.spend.toLocaleString('fr-FR')} &euro;
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">CPA</p>
                  <p className="mt-0.5 text-[13px] tabular-nums text-neutral-600">
                    {camp.cpa.toFixed(2)} &euro;
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
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
          <motion.tbody
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="divide-y divide-neutral-50"
          >
            {displayed.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[13px] text-neutral-400">
                  Aucun résultat pour cette recherche
                </td>
              </tr>
            ) : (
              displayed.map((camp) => (
                <tr
                  key={camp.campaignId}
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
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[12px] font-semibold tabular-nums ${
                      camp.roas >= 4 ? 'bg-emerald-50 text-emerald-700' :
                      camp.roas >= 2 ? 'bg-neutral-100 text-neutral-700' :
                      'bg-red-50 text-red-600'
                    }`}>
                      {camp.roas.toFixed(2)}x
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-neutral-500">
                    {camp.cpa.toFixed(2)} &euro;
                  </td>
                </tr>
              ))
            )}
          </motion.tbody>
        </table>
      </div>

      {/* Show more */}
      {hasMore && !showAll && (
        <div className="border-t border-neutral-100 px-5 py-3 text-center">
          <button
            onClick={() => setShowAll(true)}
            className="text-[13px] font-medium text-neutral-500 hover:text-neutral-700 transition-colors"
          >
            Voir toutes les campagnes ({filtered.length})
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
