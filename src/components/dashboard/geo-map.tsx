'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, TrendingUp, Users, DollarSign } from 'lucide-react';
import { formatCurrency, formatNumber, formatPercent, cn } from '@/lib/utils';
import type { GeoMetrics } from '@/types';

interface GeoMapProps {
  data: GeoMetrics[];
  isLoading?: boolean;
}

// Codes de drapeaux emoji par pays
const FLAGS: Record<string, string> = {
  FR: '🇫🇷', BE: '🇧🇪', CH: '🇨🇭', CA: '🇨🇦', US: '🇺🇸',
  GB: '🇬🇧', DE: '🇩🇪', IT: '🇮🇹', ES: '🇪🇸', NL: '🇳🇱',
  LU: '🇱🇺', MC: '🇲🇨', MA: '🇲🇦', TN: '🇹🇳', DZ: '🇩🇿',
  SN: '🇸🇳', CI: '🇨🇮', CM: '🇨🇲', MG: '🇲🇬', RE: '🇷🇪',
  MU: '🇲🇺', SC: '🇸🇨', NC: '🇳🇨', PF: '🇵🇫', GP: '🇬🇵',
  MQ: '🇲🇶', GF: '🇬🇫', PM: '🇵🇲', BL: '🇧🇱', MF: '🇲🇫',
  WF: '🇼🇫', YT: '🇾🇹',
};

function getFlag(countryCode: string): string {
  return FLAGS[countryCode] || '🌍';
}

// Insights marketing
function getInsight(metrics: GeoMetrics): {
  type: 'opportunity' | 'optimize' | 'strong' | null;
  message: string;
} | null {
  const { conversions, conversionRate, roas, visitors } = metrics;

  // Opportunité : beaucoup de visiteurs mais peu de conversions
  if (visitors > 50 && conversionRate < 1) {
    return {
      type: 'opportunity',
      message: `${visitors} visiteurs mais seulement ${conversions} conversions - optimisez vos pages`,
    };
  }

  // Fort potentiel : bon ROAS mais peu de volume
  if (roas > 3 && conversions < 10) {
    return {
      type: 'opportunity',
      message: `Excellent ROAS (${roas.toFixed(1)}x) - augmentez le budget ici`,
    };
  }

  // À optimiser : mauvais ROAS
  if (conversions > 5 && roas < 1.5) {
    return {
      type: 'optimize',
      message: `ROAS faible (${roas.toFixed(1)}x) - réduisez les dépenses ou optimisez`,
    };
  }

  // Performant
  if (conversions > 10 && roas > 2.5) {
    return {
      type: 'strong',
      message: `Zone très performante - ${conversions} conversions, ROAS ${roas.toFixed(1)}x`,
    };
  }

  return null;
}

export function GeoMap({ data, isLoading }: GeoMapProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 sm:p-6">
        <div className="h-5 w-32 animate-pulse rounded-md bg-neutral-100" />
        <div className="mt-5 space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-11 animate-pulse rounded-lg bg-neutral-50" />
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 sm:p-6">
        <h3 className="text-[13px] font-medium text-neutral-500">Géolocalisation</h3>
        <div className="mt-8 text-center">
          <MapPin className="mx-auto h-6 w-6 text-neutral-200" />
          <p className="mt-2 text-[13px] text-neutral-400">
            Les données de localisation apparaîtront ici
          </p>
        </div>
      </div>
    );
  }

  const totalConversions = data.reduce((sum, d) => sum + d.conversions, 0);
  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
  const top10 = data.slice(0, 10);

  // Identifier les insights
  const opportunities = data.filter(d => {
    const insight = getInsight(d);
    return insight?.type === 'opportunity';
  }).slice(0, 2);

  const toOptimize = data.filter(d => {
    const insight = getInsight(d);
    return insight?.type === 'optimize';
  }).slice(0, 2);

  const Wrapper = mounted ? motion.div : 'div';
  const wrapperProps = mounted ? {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] },
  } : {};

  return (
    <Wrapper
      {...wrapperProps}
      className="rounded-2xl border border-neutral-200/80 bg-white p-4 sm:p-6"
    >
      {/* Header */}
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
        <div>
          <h3 className="text-[13px] font-medium text-neutral-500">Géolocalisation</h3>
          <p className="mt-1 font-serif text-2xl tracking-tight text-neutral-900">
            {data.length} {data.length === 1 ? 'pays' : 'pays'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[11px] text-neutral-400">Total conversions</p>
            <p className="text-[15px] font-semibold tabular-nums text-neutral-900">
              {formatNumber(totalConversions)}
            </p>
          </div>
        </div>
      </div>

      {/* Insights Marketing */}
      {(opportunities.length > 0 || toOptimize.length > 0) && (
        <div className="mb-5 space-y-2">
          {opportunities.map((country) => {
            const insight = getInsight(country);
            if (!insight) return null;
            return (
              <div
                key={country.countryCode}
                className="flex items-start gap-2 rounded-lg border border-emerald-200/60 bg-emerald-50/50 px-3 py-2"
              >
                <TrendingUp className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-600" />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium text-emerald-800">
                    {getFlag(country.countryCode)} {country.countryName}
                  </p>
                  <p className="text-[11px] text-emerald-700">{insight.message}</p>
                </div>
              </div>
            );
          })}
          {toOptimize.map((country) => {
            const insight = getInsight(country);
            if (!insight) return null;
            return (
              <div
                key={country.countryCode}
                className="flex items-start gap-2 rounded-lg border border-amber-200/60 bg-amber-50/50 px-3 py-2"
              >
                <Users className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-600" />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium text-amber-800">
                    {getFlag(country.countryCode)} {country.countryName}
                  </p>
                  <p className="text-[11px] text-amber-700">{insight.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Top Countries List */}
      <div className="space-y-1.5">
        {top10.map((country, index) => {
          const percentage = totalConversions > 0
            ? (country.conversions / totalConversions) * 100
            : 0;
          const isSelected = selectedCountry === country.countryCode;

          return (
            <motion.div
              key={country.countryCode}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedCountry(isSelected ? null : country.countryCode)}
              className={cn(
                'group relative cursor-pointer overflow-hidden rounded-lg border px-3 py-2.5 transition-all',
                isSelected
                  ? 'border-primary-200 bg-primary-50/50'
                  : 'border-neutral-100 bg-neutral-50/50 hover:border-neutral-200 hover:bg-white'
              )}
            >
              {/* Progress bar background */}
              <div
                className={cn(
                  'absolute inset-y-0 left-0 transition-all',
                  isSelected ? 'bg-primary-100/40' : 'bg-neutral-100/60'
                )}
                style={{ width: `${percentage}%` }}
              />

              <div className="relative flex items-center justify-between gap-3">
                {/* Country */}
                <div className="flex min-w-0 flex-1 items-center gap-2.5">
                  <span className="text-lg leading-none">{getFlag(country.countryCode)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-neutral-900">
                      {country.countryName}
                    </p>
                    <p className="text-[11px] text-neutral-400">
                      {formatNumber(country.visitors)} visiteurs · CR {formatPercent(country.conversionRate)}
                    </p>
                  </div>
                </div>

                {/* Metrics */}
                <div className="flex flex-shrink-0 items-center gap-2 sm:gap-4">
                  <div className="text-right">
                    <p className="text-[10px] sm:text-[11px] text-neutral-400">Conv.</p>
                    <p className="text-[12px] sm:text-[13px] font-semibold tabular-nums text-neutral-900">
                      {formatNumber(country.conversions)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] sm:text-[11px] text-neutral-400">Revenu</p>
                    <p className="text-[12px] sm:text-[13px] font-semibold tabular-nums text-neutral-900">
                      {formatCurrency(country.revenue)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] sm:text-[11px] text-neutral-400">ROAS</p>
                    <p
                      className={cn(
                        'text-[13px] font-semibold tabular-nums',
                        country.roas >= 3
                          ? 'text-emerald-600'
                          : country.roas >= 1.5
                            ? 'text-neutral-900'
                            : 'text-red-500'
                      )}
                    >
                      {country.roas.toFixed(1)}x
                    </p>
                  </div>
                </div>
              </div>

              {/* Expanded details */}
              {isSelected && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 border-t border-primary-200/40 pt-3"
                >
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">
                      Part
                    </p>
                    <p className="mt-0.5 text-[13px] font-semibold text-neutral-900">
                      {formatPercent(percentage)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">
                      Visiteurs
                    </p>
                    <p className="mt-0.5 text-[13px] font-semibold text-neutral-900">
                      {formatNumber(country.visitors)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">
                      Taux conv.
                    </p>
                    <p className="mt-0.5 text-[13px] font-semibold text-neutral-900">
                      {formatPercent(country.conversionRate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">
                      ROAS
                    </p>
                    <p className="mt-0.5 text-[13px] font-semibold text-neutral-900">
                      {country.roas.toFixed(2)}x
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {data.length > 10 && (
        <div className="mt-3 text-center">
          <p className="text-[11px] text-neutral-400">
            +{data.length - 10} autre{data.length - 10 > 1 ? 's' : ''} pays
          </p>
        </div>
      )}
    </Wrapper>
  );
}
