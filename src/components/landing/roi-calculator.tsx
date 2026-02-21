'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';

// ===========================================
// PIXLY - ROI Calculator
// Interactive simulator: "Sans Pixly" vs "Avec Pixly"
// ===========================================

function formatEur(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace('.', ',')}M €`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}k €`;
  return `${Math.round(value).toLocaleString('fr-FR')} €`;
}

function formatPct(value: number): string {
  return `${value.toFixed(1).replace('.', ',')}%`;
}

// Slider config
const AD_SPEND_MIN = 5_000;
const AD_SPEND_MAX = 200_000;
const AD_SPEND_STEP = 5_000;

const CONV_VALUE_MIN = 20;
const CONV_VALUE_MAX = 500;
const CONV_VALUE_STEP = 10;

// Calculation logic
function computeROI(adSpend: number, convValue: number) {
  // Without Pixly: standard conversion rate, some wasted spend
  const convRateWithout = 2.1; // %
  const wastedPctWithout = 32; // % of budget wasted on wrong channels
  const conversionsWithout = Math.round((adSpend / convValue) * (convRateWithout / 100) * 10);
  const revenueWithout = conversionsWithout * convValue;

  // With Pixly: better attribution → better allocation → higher conversions
  const convRateWith = 3.4; // % (improved from better targeting)
  const wastedPctWith = 11; // % (reduced waste)
  const conversionsWithPx = Math.round((adSpend / convValue) * (convRateWith / 100) * 10);
  const revenueWithPx = conversionsWithPx * convValue;

  // Additional revenue recovered
  const additionalRevenue = revenueWithPx - revenueWithout;

  // Subscription cost (Growth plan typical)
  const subscriptionCost = adSpend <= 25_000 ? 49 : adSpend <= 100_000 ? 99 : 199;
  const annualSubscription = subscriptionCost * 12;

  // Net gain and ROI
  const netAnnualGain = (additionalRevenue * 12) - annualSubscription;
  const annualROI = annualSubscription > 0 ? Math.round((netAnnualGain / annualSubscription) * 100) : 0;

  return {
    without: {
      convRate: convRateWithout,
      conversions: conversionsWithout,
      revenue: revenueWithout,
      wastedPct: wastedPctWithout,
    },
    withPixly: {
      convRate: convRateWith,
      conversions: conversionsWithPx,
      revenue: revenueWithPx,
      wastedPct: wastedPctWith,
    },
    additionalRevenue,
    subscriptionCost,
    annualSubscription,
    netAnnualGain,
    annualROI,
  };
}

// Slider thumb style (CSS-in-JS for cross-browser)
const sliderThumbStyles = `
  [data-roi-slider]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: white;
    border: 2px solid #0F9D58;
    box-shadow: 0 1px 4px rgba(0,0,0,0.15), 0 0 0 4px rgba(15,157,88,0.1);
    cursor: pointer;
    transition: box-shadow 200ms ease, transform 200ms ease;
  }
  [data-roi-slider]::-webkit-slider-thumb:hover {
    box-shadow: 0 2px 8px rgba(0,0,0,0.2), 0 0 0 6px rgba(15,157,88,0.15);
    transform: scale(1.1);
  }
  [data-roi-slider]::-webkit-slider-thumb:active {
    box-shadow: 0 1px 4px rgba(0,0,0,0.15), 0 0 0 8px rgba(15,157,88,0.2);
  }
  [data-roi-slider]::-moz-range-thumb {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: white;
    border: 2px solid #0F9D58;
    box-shadow: 0 1px 4px rgba(0,0,0,0.15), 0 0 0 4px rgba(15,157,88,0.1);
    cursor: pointer;
  }
`;

export function ROICalculator() {
  const [adSpend, setAdSpend] = useState(30_000);
  const [convValue, setConvValue] = useState(80);

  const handleAdSpend = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setAdSpend(Number(e.target.value));
  }, []);

  const handleConvValue = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setConvValue(Number(e.target.value));
  }, []);

  const roi = computeROI(adSpend, convValue);

  // Fill percentage for slider gradient
  const adSpendPct = ((adSpend - AD_SPEND_MIN) / (AD_SPEND_MAX - AD_SPEND_MIN)) * 100;
  const convValuePct = ((convValue - CONV_VALUE_MIN) / (CONV_VALUE_MAX - CONV_VALUE_MIN)) * 100;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: sliderThumbStyles }} />

      <div className="max-w-5xl mx-auto">
        {/* Main card */}
        <div
          className="rounded-3xl bg-white overflow-hidden"
          style={{
            boxShadow: '0 1px 2px rgba(0,0,0,0.03), 0 4px 24px rgba(0,0,0,0.06)',
            border: '1px solid rgba(0,0,0,0.05)',
          }}
        >
          {/* Top: Sliders */}
          <div className="p-6 sm:p-10 lg:p-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12">
              {/* Slider 1: Ad Spend */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-neutral-600">
                    Dépenses pub mensuelles
                  </label>
                  <span className="text-lg font-bold text-neutral-900 font-serif tabular-nums">
                    {adSpend.toLocaleString('fr-FR')} €
                  </span>
                </div>
                <input
                  data-roi-slider=""
                  type="range"
                  min={AD_SPEND_MIN}
                  max={AD_SPEND_MAX}
                  step={AD_SPEND_STEP}
                  value={adSpend}
                  onChange={handleAdSpend}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer outline-none"
                  style={{
                    background: `linear-gradient(to right, #0F9D58 0%, #0F9D58 ${adSpendPct}%, #e5e7eb ${adSpendPct}%, #e5e7eb 100%)`,
                  }}
                  aria-label="Dépenses publicitaires mensuelles"
                />
                <div className="flex justify-between mt-1.5 text-xs text-neutral-400">
                  <span>5k €</span>
                  <span>200k €</span>
                </div>
              </div>

              {/* Slider 2: Conversion Value */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-neutral-600">
                    Valeur moyenne par conversion
                  </label>
                  <span className="text-lg font-bold text-neutral-900 font-serif tabular-nums">
                    {convValue} €
                  </span>
                </div>
                <input
                  data-roi-slider=""
                  type="range"
                  min={CONV_VALUE_MIN}
                  max={CONV_VALUE_MAX}
                  step={CONV_VALUE_STEP}
                  value={convValue}
                  onChange={handleConvValue}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer outline-none"
                  style={{
                    background: `linear-gradient(to right, #0F9D58 0%, #0F9D58 ${convValuePct}%, #e5e7eb ${convValuePct}%, #e5e7eb 100%)`,
                  }}
                  aria-label="Valeur moyenne par conversion"
                />
                <div className="flex justify-between mt-1.5 text-xs text-neutral-400">
                  <span>20 €</span>
                  <span>500 €</span>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-neutral-100" />

          {/* Middle: Comparison */}
          <div className="p-6 sm:p-10 lg:p-12">
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-6">
              Votre ROI projeté
            </p>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 md:gap-0 items-stretch">
              {/* Sans Pixly */}
              <div className="rounded-2xl border border-neutral-200/80 bg-neutral-50/60 p-5 sm:p-7">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-2 h-2 rounded-full bg-neutral-300" />
                  <span className="text-sm font-semibold text-neutral-500">Sans Pixly</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-neutral-400 mb-0.5">Taux de conversion</p>
                    <p className="text-2xl font-bold font-serif text-neutral-700 tabular-nums">
                      {formatPct(roi.without.convRate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400 mb-0.5">Conversions / mois</p>
                    <p className="text-2xl font-bold font-serif text-neutral-700 tabular-nums">
                      {roi.without.conversions.toLocaleString('fr-FR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400 mb-0.5">Revenu mensuel</p>
                    <p className="text-2xl font-bold font-serif text-neutral-700 tabular-nums">
                      {formatEur(roi.without.revenue)}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-neutral-200/80">
                    <div className="flex items-center gap-1.5">
                      <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                      <p className="text-xs text-red-400 font-medium">
                        {roi.without.wastedPct}% du budget mal alloué
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Arrow separator */}
              <div className="hidden md:flex items-center justify-center px-5">
                <div className="flex flex-col items-center gap-2">
                  <ArrowRight className="w-5 h-5 text-primary-400" />
                  <span className="text-[10px] font-semibold text-primary-500 uppercase tracking-wider whitespace-nowrap [writing-mode:vertical-lr] rotate-180">
                    Pixly
                  </span>
                </div>
              </div>

              {/* Mobile arrow */}
              <div className="flex md:hidden items-center justify-center">
                <div className="flex items-center gap-2">
                  <div className="h-px w-8 bg-primary-200" />
                  <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-primary-500 rotate-90 md:rotate-0" />
                  </div>
                  <div className="h-px w-8 bg-primary-200" />
                </div>
              </div>

              {/* Avec Pixly */}
              <div className="rounded-2xl border-2 border-primary-200/80 bg-primary-50/30 p-5 sm:p-7 relative">
                <div className="absolute -top-3 right-5">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary-500 text-white text-[10px] font-bold uppercase tracking-wider">
                    <TrendingUp className="w-3 h-3" />
                    +{Math.round(((roi.withPixly.revenue - roi.without.revenue) / roi.without.revenue) * 100)}%
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-5">
                  <div className="w-2 h-2 rounded-full bg-primary-500" />
                  <span className="text-sm font-semibold text-primary-700">Avec Pixly</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-primary-400 mb-0.5">Taux de conversion</p>
                    <p className="text-2xl font-bold font-serif text-neutral-900 tabular-nums">
                      {formatPct(roi.withPixly.convRate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-primary-400 mb-0.5">Conversions / mois</p>
                    <p className="text-2xl font-bold font-serif text-neutral-900 tabular-nums">
                      {roi.withPixly.conversions.toLocaleString('fr-FR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-primary-400 mb-0.5">Revenu mensuel</p>
                    <p className="text-2xl font-bold font-serif text-neutral-900 tabular-nums">
                      {formatEur(roi.withPixly.revenue)}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-primary-200/60">
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-primary-500" />
                      <p className="text-xs text-primary-600 font-medium">
                        Seulement {roi.withPixly.wastedPct}% de budget mal alloué
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom: 4 KPIs */}
          <div className="border-t border-neutral-100 bg-neutral-50/40">
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-neutral-100">
              {/* Additional Revenue */}
              <div className="p-5 sm:p-7 text-center">
                <p className="text-xs text-neutral-400 mb-2">Revenu récupéré / mois</p>
                <p className="text-xl sm:text-2xl font-bold font-serif text-primary-600 tabular-nums">
                  +{formatEur(roi.additionalRevenue)}
                </p>
              </div>

              {/* Subscription Cost */}
              <div className="p-5 sm:p-7 text-center">
                <p className="text-xs text-neutral-400 mb-2">Abonnement Pixly</p>
                <p className="text-xl sm:text-2xl font-bold font-serif text-neutral-700 tabular-nums">
                  {roi.subscriptionCost} € <span className="text-sm font-normal text-neutral-400">/ mois</span>
                </p>
              </div>

              {/* Net Annual Gain */}
              <div className="p-5 sm:p-7 text-center">
                <p className="text-xs text-neutral-400 mb-2">Gain net annuel</p>
                <p className="text-xl sm:text-2xl font-bold font-serif text-primary-600 tabular-nums">
                  +{formatEur(roi.netAnnualGain)}
                </p>
              </div>

              {/* Annual ROI */}
              <div className="p-5 sm:p-7 text-center">
                <p className="text-xs text-neutral-400 mb-2">ROI annuel</p>
                <p className="text-xl sm:text-2xl font-bold font-serif tabular-nums" style={{ color: roi.annualROI > 0 ? '#0F9D58' : '#dc2626' }}>
                  {roi.annualROI > 0 ? '+' : ''}{roi.annualROI.toLocaleString('fr-FR')}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-neutral-400 mt-5">
          * Projections basées sur les résultats moyens observés chez nos clients. Résultats individuels variables.
        </p>
      </div>
    </>
  );
}
