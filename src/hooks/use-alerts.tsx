'use client';

import { useState, useEffect, useCallback } from 'react';
import type { DashboardMetrics, Workspace } from '@/types';

// ===========================================
// PIXLY - Smart Alert System (Phase 2.2)
// Threshold-based anomaly detection
// ===========================================

export interface AlertThresholds {
  roasMin: number | null; // Alert if ROAS < this
  cpaMax: number | null; // Alert if CPA > this
  spendDailyMax: number | null; // Alert if daily spend > this
  conversionRateMin: number | null; // Alert if CR < this (%)
  enabled: boolean;
}

export interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  metric?: string;
  currentValue?: number;
  threshold?: number;
  timestamp: Date;
  dismissed: boolean;
}

const DEFAULT_THRESHOLDS: AlertThresholds = {
  roasMin: 2, // Alert si ROAS < 2x
  cpaMax: 50, // Alert si CPA > 50€
  spendDailyMax: 1000, // Alert si spend > 1000€/jour
  conversionRateMin: 1, // Alert si CR < 1%
  enabled: true,
};

const THRESHOLDS_STORAGE_KEY = 'pixly_alert_thresholds';
const DISMISSED_STORAGE_KEY = 'pixly_dismissed_alerts';

// ---- Persistence helpers ----

function loadThresholds(): AlertThresholds {
  if (typeof window === 'undefined') return DEFAULT_THRESHOLDS;
  try {
    const stored = localStorage.getItem(THRESHOLDS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_THRESHOLDS, ...parsed };
    }
  } catch (e) {
    console.error('[Alerts] Failed to load thresholds:', e);
  }
  return DEFAULT_THRESHOLDS;
}

function loadDismissedIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const stored = localStorage.getItem(DISMISSED_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Clean up entries older than 24h
      const now = Date.now();
      const valid = parsed.filter(
        (entry: { id: string; at: number }) => now - entry.at < 24 * 60 * 60 * 1000
      );
      if (valid.length !== parsed.length) {
        localStorage.setItem(DISMISSED_STORAGE_KEY, JSON.stringify(valid));
      }
      return new Set(valid.map((e: { id: string }) => e.id));
    }
  } catch (e) {
    console.error('[Alerts] Failed to load dismissed IDs:', e);
  }
  return new Set();
}

function persistDismissedIds(ids: Set<string>) {
  if (typeof window === 'undefined') return;
  try {
    const entries = Array.from(ids).map((id) => ({ id, at: Date.now() }));
    localStorage.setItem(DISMISSED_STORAGE_KEY, JSON.stringify(entries));
  } catch (e) {
    console.error('[Alerts] Failed to save dismissed IDs:', e);
  }
}

// ---- Smart detection logic ----

const INTEGRATION_LABELS: Record<string, string> = {
  meta: 'Meta Ads',
  google: 'Google Ads',
  tiktok: 'TikTok Ads',
  stripe: 'Stripe',
  shopify: 'Shopify',
};

export function detectAlerts(
  metrics: DashboardMetrics | null,
  thresholds: AlertThresholds,
  workspace: Workspace | null
): Alert[] {
  const alerts: Alert[] = [];
  const now = new Date();

  if (!thresholds.enabled) return alerts;

  // ---- 1. ROAS below minimum → critical ----
  if (
    metrics &&
    thresholds.roasMin !== null &&
    metrics.overview.roas > 0 &&
    metrics.overview.roas < thresholds.roasMin
  ) {
    const isCritical = metrics.overview.roas < 1;
    alerts.push({
      id: 'roas_low',
      type: isCritical ? 'critical' : 'warning',
      title: isCritical ? 'ROAS critique' : 'ROAS en baisse',
      message: `Le ROAS global est de ${metrics.overview.roas.toFixed(2)}x, en dessous du seuil de ${thresholds.roasMin}x.`,
      metric: 'roas',
      currentValue: metrics.overview.roas,
      threshold: thresholds.roasMin,
      timestamp: now,
      dismissed: false,
    });
  }

  // ---- 2. CPA exceeding maximum → warning ----
  if (
    metrics &&
    thresholds.cpaMax !== null &&
    metrics.overview.cpa > 0 &&
    metrics.overview.cpa > thresholds.cpaMax
  ) {
    const isCritical = metrics.overview.cpa > thresholds.cpaMax * 2;
    alerts.push({
      id: 'cpa_high',
      type: isCritical ? 'critical' : 'warning',
      title: 'CPA trop élevé',
      message: `Le coût par acquisition est de ${metrics.overview.cpa.toFixed(2)}\u202F\u20AC, au-dessus du seuil de ${thresholds.cpaMax}\u202F\u20AC.`,
      metric: 'cpa',
      currentValue: metrics.overview.cpa,
      threshold: thresholds.cpaMax,
      timestamp: now,
      dismissed: false,
    });
  }

  // ---- 3. Daily spend exceeding budget → warning ----
  if (
    metrics &&
    thresholds.spendDailyMax !== null &&
    metrics.overview.totalSpend > 0
  ) {
    // Estimate daily spend from the period data
    const dayCount = metrics.revenueByDay?.length || 30;
    const estimatedDailySpend = metrics.overview.totalSpend / dayCount;

    if (estimatedDailySpend > thresholds.spendDailyMax) {
      const isCritical = estimatedDailySpend > thresholds.spendDailyMax * 1.5;
      alerts.push({
        id: 'spend_high',
        type: isCritical ? 'critical' : 'warning',
        title: 'Dépenses quotidiennes élevées',
        message: `Les dépenses moyennes sont de ~${estimatedDailySpend.toFixed(0)}\u202F\u20AC/jour (seuil : ${thresholds.spendDailyMax}\u202F\u20AC).`,
        metric: 'spend',
        currentValue: estimatedDailySpend,
        threshold: thresholds.spendDailyMax,
        timestamp: now,
        dismissed: false,
      });
    }
  }

  // ---- 4. Conversion rate below minimum → info ----
  if (
    metrics &&
    thresholds.conversionRateMin !== null &&
    metrics.overview.conversionRate !== undefined
  ) {
    const crPercent = metrics.overview.conversionRate * 100;
    if (crPercent < thresholds.conversionRateMin && crPercent > 0) {
      alerts.push({
        id: 'cr_low',
        type: 'info',
        title: 'Taux de conversion faible',
        message: `Le taux de conversion est de ${crPercent.toFixed(1)}%, en dessous du seuil de ${thresholds.conversionRateMin}%.`,
        metric: 'conversion_rate',
        currentValue: crPercent,
        threshold: thresholds.conversionRateMin,
        timestamp: now,
        dismissed: false,
      });
    }
  }

  // ---- 5. Integration disconnected → critical ----
  if (workspace?.integrations) {
    const integrations = workspace.integrations;
    for (const [key, state] of Object.entries(integrations)) {
      // Only alert for integrations that were previously connected
      // (connectedAt exists but connected is false)
      if (!state.connected && state.connectedAt) {
        const label = INTEGRATION_LABELS[key] || key;
        alerts.push({
          id: `integration_disconnected_${key}`,
          type: 'critical',
          title: `${label} déconnecté`,
          message: `L'intégration ${label} a été déconnectée. Reconnectez-la pour continuer le suivi.`,
          metric: 'integration',
          timestamp: now,
          dismissed: false,
        });
      }
    }
  }

  // ---- 6. No conversions in recent period when historically active → warning ----
  if (metrics && metrics.revenueByDay && metrics.revenueByDay.length >= 2) {
    const days = metrics.revenueByDay;
    // Check if there's historical activity (at least some conversions in earlier days)
    const totalHistorical = days
      .slice(0, -1)
      .reduce((sum, d) => sum + d.conversions, 0);
    const lastDay = days[days.length - 1];

    if (totalHistorical > 0 && lastDay && lastDay.conversions === 0) {
      alerts.push({
        id: 'no_conversions_recent',
        type: 'warning',
        title: 'Aucune conversion récente',
        message: `Aucune conversion enregistrée le dernier jour, alors que l'activité historique est normale.`,
        metric: 'conversions',
        currentValue: 0,
        timestamp: now,
        dismissed: false,
      });
    }
  }

  // ---- Per-campaign critical ROAS (below 1x with significant spend) ----
  if (metrics && thresholds.roasMin !== null) {
    for (const campaign of metrics.byCampaign) {
      if (
        campaign.roas > 0 &&
        campaign.roas < 1 &&
        campaign.spend > 100
      ) {
        alerts.push({
          id: `camp_roas_${campaign.campaignId}`,
          type: 'critical',
          title: 'Campagne non rentable',
          message: `"${campaign.campaignName}" a un ROAS de ${campaign.roas.toFixed(2)}x avec ${campaign.spend.toLocaleString('fr-FR')}\u202F\u20AC dépensés.`,
          metric: 'campaign_roas',
          currentValue: campaign.roas,
          threshold: 1,
          timestamp: now,
          dismissed: false,
        });
      }
    }
  }

  // Sort: critical first, then warning, then info
  const order: Record<Alert['type'], number> = { critical: 0, warning: 1, info: 2 };
  alerts.sort((a, b) => order[a.type] - order[b.type]);

  return alerts;
}

// ---- Hook ----

export function useAlerts() {
  const [thresholds, setThresholds] = useState<AlertThresholds>(DEFAULT_THRESHOLDS);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  // Load from localStorage on mount
  useEffect(() => {
    setThresholds(loadThresholds());
    setDismissedIds(loadDismissedIds());
  }, []);

  // Save thresholds
  const saveThresholds = useCallback((newThresholds: AlertThresholds) => {
    try {
      localStorage.setItem(THRESHOLDS_STORAGE_KEY, JSON.stringify(newThresholds));
      setThresholds(newThresholds);
    } catch (e) {
      console.error('[Alerts] Failed to save thresholds:', e);
    }
  }, []);

  // Reset thresholds to defaults
  const resetThresholds = useCallback(() => {
    saveThresholds(DEFAULT_THRESHOLDS);
  }, [saveThresholds]);

  // Dismiss a single alert
  const dismissAlert = useCallback((id: string) => {
    setDismissedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      persistDismissedIds(next);
      return next;
    });
  }, []);

  // Dismiss all alerts
  const dismissAll = useCallback((alertIds: string[]) => {
    setDismissedIds((prev) => {
      const next = new Set(prev);
      for (const id of alertIds) {
        next.add(id);
      }
      persistDismissedIds(next);
      return next;
    });
  }, []);

  // Clear all dismissals
  const clearDismissed = useCallback(() => {
    setDismissedIds(new Set());
    if (typeof window !== 'undefined') {
      localStorage.removeItem(DISMISSED_STORAGE_KEY);
    }
  }, []);

  return {
    thresholds,
    dismissedIds,
    saveThresholds,
    resetThresholds,
    dismissAlert,
    dismissAll,
    clearDismissed,
    detectAlerts,
  };
}

export { DEFAULT_THRESHOLDS };
