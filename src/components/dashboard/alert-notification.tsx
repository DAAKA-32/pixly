'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  TrendingDown,
  DollarSign,
  X,
  Bell,
  ChevronDown,
} from 'lucide-react';
import type { DashboardMetrics, CampaignMetrics } from '@/types';

// ===========================================
// PIXLY - Alert & Notification System
// Monitors KPIs and triggers alerts
// ===========================================

export interface AlertThresholds {
  minRoas: number;
  maxCpa: number;
  maxSpendPerCampaign: number;
}

const DEFAULT_THRESHOLDS: AlertThresholds = {
  minRoas: 2.0,
  maxCpa: 50,
  maxSpendPerCampaign: 5000,
};

export interface Alert {
  id: string;
  type: 'warning' | 'critical';
  category: 'roas' | 'cpa' | 'budget';
  title: string;
  message: string;
  campaignName?: string;
  value: number;
  threshold: number;
  timestamp: Date;
}

interface AlertNotificationProps {
  metrics: DashboardMetrics | null;
  thresholds?: AlertThresholds;
}

export function AlertNotification({
  metrics,
  thresholds = DEFAULT_THRESHOLDS,
}: AlertNotificationProps) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [isExpanded, setIsExpanded] = useState(false);

  const alerts = useMemo(() => {
    if (!metrics) return [];

    const result: Alert[] = [];

    // Check overall ROAS
    if (metrics.overview.roas > 0 && metrics.overview.roas < thresholds.minRoas) {
      result.push({
        id: 'global_roas',
        type: metrics.overview.roas < 1 ? 'critical' : 'warning',
        category: 'roas',
        title: 'ROAS global bas',
        message: `Le ROAS global est de ${metrics.overview.roas.toFixed(2)}x (seuil: ${thresholds.minRoas}x)`,
        value: metrics.overview.roas,
        threshold: thresholds.minRoas,
        timestamp: new Date(),
      });
    }

    // Check overall CPA
    if (metrics.overview.cpa > 0 && metrics.overview.cpa > thresholds.maxCpa) {
      result.push({
        id: 'global_cpa',
        type: metrics.overview.cpa > thresholds.maxCpa * 1.5 ? 'critical' : 'warning',
        category: 'cpa',
        title: 'CPA trop élevé',
        message: `Le coût par acquisition est de ${metrics.overview.cpa.toFixed(2)}€ (seuil: ${thresholds.maxCpa}€)`,
        value: metrics.overview.cpa,
        threshold: thresholds.maxCpa,
        timestamp: new Date(),
      });
    }

    // Check per-campaign alerts
    for (const campaign of metrics.byCampaign) {
      // Campaign ROAS
      if (campaign.roas > 0 && campaign.roas < thresholds.minRoas && campaign.spend > 100) {
        result.push({
          id: `camp_roas_${campaign.campaignId}`,
          type: campaign.roas < 1 ? 'critical' : 'warning',
          category: 'roas',
          title: 'Campagne peu rentable',
          message: `"${campaign.campaignName}" a un ROAS de ${campaign.roas.toFixed(2)}x`,
          campaignName: campaign.campaignName,
          value: campaign.roas,
          threshold: thresholds.minRoas,
          timestamp: new Date(),
        });
      }

      // Campaign budget exceeded
      if (campaign.spend > thresholds.maxSpendPerCampaign) {
        result.push({
          id: `camp_budget_${campaign.campaignId}`,
          type: campaign.spend > thresholds.maxSpendPerCampaign * 1.2 ? 'critical' : 'warning',
          category: 'budget',
          title: 'Budget dépassé',
          message: `"${campaign.campaignName}" a dépensé ${campaign.spend.toLocaleString('fr-FR')}€ (limite: ${thresholds.maxSpendPerCampaign.toLocaleString('fr-FR')}€)`,
          campaignName: campaign.campaignName,
          value: campaign.spend,
          threshold: thresholds.maxSpendPerCampaign,
          timestamp: new Date(),
        });
      }
    }

    return result;
  }, [metrics, thresholds]);

  const visibleAlerts = useMemo(
    () => alerts.filter((a) => !dismissedIds.has(a.id)),
    [alerts, dismissedIds]
  );

  const criticalCount = visibleAlerts.filter((a) => a.type === 'critical').length;
  const warningCount = visibleAlerts.filter((a) => a.type === 'warning').length;

  const dismiss = useCallback((id: string) => {
    setDismissedIds((prev) => new Set([...Array.from(prev), id]));
  }, []);

  const dismissAll = useCallback(() => {
    setDismissedIds(new Set(alerts.map((a) => a.id)));
  }, [alerts]);

  if (visibleAlerts.length === 0) return null;

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between px-5 py-3.5 text-left transition-colors hover:bg-neutral-50"
      >
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Bell className="h-4 w-4 text-neutral-500" />
            {visibleAlerts.length > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                {visibleAlerts.length}
              </span>
            )}
          </div>
          <span className="text-sm font-medium text-neutral-700">Alertes</span>
          <div className="flex items-center gap-1.5">
            {criticalCount > 0 && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                {criticalCount} critique{criticalCount > 1 ? 's' : ''}
              </span>
            )}
            {warningCount > 0 && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                {warningCount} avertissement{warningCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {visibleAlerts.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                dismissAll();
              }}
              className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              Tout ignorer
            </button>
          )}
          <ChevronDown
            className={`h-4 w-4 text-neutral-400 transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {/* Alert List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-neutral-100 divide-y divide-neutral-50">
              {visibleAlerts.map((alert) => (
                <AlertItem key={alert.id} alert={alert} onDismiss={dismiss} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AlertItem({
  alert,
  onDismiss,
}: {
  alert: Alert;
  onDismiss: (id: string) => void;
}) {
  const isCritical = alert.type === 'critical';

  const Icon =
    alert.category === 'roas'
      ? TrendingDown
      : alert.category === 'budget'
      ? DollarSign
      : AlertTriangle;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10, height: 0 }}
      className={`flex items-start gap-3 px-5 py-3 ${
        isCritical ? 'bg-red-50/50' : 'bg-amber-50/30'
      }`}
    >
      <div
        className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ${
          isCritical ? 'bg-red-100' : 'bg-amber-100'
        }`}
      >
        <Icon
          className={`h-3.5 w-3.5 ${
            isCritical ? 'text-red-600' : 'text-amber-600'
          }`}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium ${
            isCritical ? 'text-red-900' : 'text-amber-900'
          }`}
        >
          {alert.title}
        </p>
        <p
          className={`text-xs ${
            isCritical ? 'text-red-700' : 'text-amber-700'
          }`}
        >
          {alert.message}
        </p>
      </div>
      <button
        onClick={() => onDismiss(alert.id)}
        className="mt-0.5 flex-shrink-0 rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}

export { DEFAULT_THRESHOLDS };
