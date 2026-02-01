'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, ChevronDown } from 'lucide-react';
import type { Channel } from '@/types';

// ===========================================
// PIXLY - Filter Panel
// Dynamic filtering by channel, campaign, status
// ===========================================

const channelOptions: { value: Channel; label: string }[] = [
  { value: 'meta', label: 'Meta Ads' },
  { value: 'google', label: 'Google Ads' },
  { value: 'tiktok', label: 'TikTok Ads' },
  { value: 'linkedin', label: 'LinkedIn Ads' },
  { value: 'bing', label: 'Microsoft Ads' },
  { value: 'organic', label: 'Organic' },
  { value: 'direct', label: 'Direct' },
  { value: 'email', label: 'Email' },
  { value: 'referral', label: 'Referral' },
];

export interface DashboardFilters {
  channels: Channel[];
  campaignSearch: string;
  minRoas: number | null;
  status: 'all' | 'profitable' | 'unprofitable';
}

const defaultFilters: DashboardFilters = {
  channels: [],
  campaignSearch: '',
  minRoas: null,
  status: 'all',
};

interface FilterPanelProps {
  filters: DashboardFilters;
  onFiltersChange: (filters: DashboardFilters) => void;
}

export function FilterPanel({ filters, onFiltersChange }: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.channels.length > 0) count++;
    if (filters.campaignSearch) count++;
    if (filters.minRoas !== null) count++;
    if (filters.status !== 'all') count++;
    return count;
  }, [filters]);

  const toggleChannel = (channel: Channel) => {
    const newChannels = filters.channels.includes(channel)
      ? filters.channels.filter((c) => c !== channel)
      : [...filters.channels, channel];
    onFiltersChange({ ...filters, channels: newChannels });
  };

  const clearFilters = () => {
    onFiltersChange(defaultFilters);
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white">
      {/* Toggle Bar */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between px-5 py-3.5 text-left transition-colors hover:bg-neutral-50"
      >
        <div className="flex items-center gap-2.5">
          <Filter className="h-4 w-4 text-neutral-500" />
          <span className="text-sm font-medium text-neutral-700">Filtres</span>
          {activeFilterCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </div>
        <ChevronDown
          className={`h-4 w-4 text-neutral-400 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Filter Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-neutral-100 px-5 py-4 space-y-4">
              {/* Channel Filter */}
              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-neutral-500">
                  Canaux
                </label>
                <div className="flex flex-wrap gap-2">
                  {channelOptions.map((option) => {
                    const isActive = filters.channels.includes(option.value);
                    return (
                      <button
                        key={option.value}
                        onClick={() => toggleChannel(option.value)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                          isActive
                            ? 'bg-primary-500 text-white'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Campaign Search */}
              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-neutral-500">
                  Campagne
                </label>
                <input
                  type="text"
                  value={filters.campaignSearch}
                  onChange={(e) =>
                    onFiltersChange({ ...filters, campaignSearch: e.target.value })
                  }
                  placeholder="Rechercher une campagne..."
                  className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-6">
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Statut
                  </label>
                  <div className="flex rounded-lg border border-neutral-200 bg-neutral-50 p-0.5">
                    {([
                      { value: 'all', label: 'Tous' },
                      { value: 'profitable', label: 'Rentable' },
                      { value: 'unprofitable', label: 'Non rentable' },
                    ] as const).map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() =>
                          onFiltersChange({ ...filters, status: opt.value })
                        }
                        className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                          filters.status === opt.value
                            ? 'bg-white text-neutral-900 shadow-sm'
                            : 'text-neutral-500 hover:text-neutral-700'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ROAS Minimum */}
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-neutral-500">
                    ROAS min.
                  </label>
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
                    placeholder="ex: 2.0"
                    className="w-24 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Clear Filters */}
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 transition-colors"
                >
                  <X className="h-3 w-3" />
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export { defaultFilters };
