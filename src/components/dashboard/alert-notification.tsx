'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Bell,
  ChevronDown,
  Info,
  X,
  Unplug,
  TrendingDown,
  DollarSign,
  Target,
  ShoppingCart,
} from 'lucide-react';
import { useAlerts, detectAlerts } from '@/hooks/use-alerts';
import type { Alert } from '@/hooks/use-alerts';
import type { DashboardMetrics, Workspace } from '@/types';

// ===========================================
// PIXLY - Smart Alert & Notification System
// Phase 2.2 - Anomaly detection with severity
// ===========================================

interface AlertNotificationProps {
  metrics: DashboardMetrics | null;
  workspace: Workspace | null;
}

// ---- Severity config ----

const SEVERITY_CONFIG = {
  critical: {
    bg: 'bg-red-50/60',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    titleColor: 'text-red-900',
    messageColor: 'text-red-700',
    badgeBg: 'bg-red-100',
    badgeText: 'text-red-700',
    label: 'critique',
    pluralLabel: 'critiques',
  },
  warning: {
    bg: 'bg-amber-50/40',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    titleColor: 'text-amber-900',
    messageColor: 'text-amber-700',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-700',
    label: 'avertissement',
    pluralLabel: 'avertissements',
  },
  info: {
    bg: 'bg-primary-50/40',
    iconBg: 'bg-primary-100',
    iconColor: 'text-primary-600',
    titleColor: 'text-primary-900',
    messageColor: 'text-primary-700',
    badgeBg: 'bg-primary-100',
    badgeText: 'text-primary-700',
    label: 'info',
    pluralLabel: 'infos',
  },
} as const;

// ---- Icon mapping by metric ----

function getAlertIcon(alert: Alert) {
  switch (alert.metric) {
    case 'roas':
    case 'campaign_roas':
      return TrendingDown;
    case 'cpa':
    case 'spend':
      return DollarSign;
    case 'conversion_rate':
      return Target;
    case 'conversions':
      return ShoppingCart;
    case 'integration':
      return Unplug;
    default:
      if (alert.type === 'critical') return Bell;
      if (alert.type === 'info') return Info;
      return AlertTriangle;
  }
}

// ---- Premium easing ----

const EASE_REVEAL = [0.22, 1, 0.36, 1];

// ---- Main component ----

export function AlertNotification({ metrics, workspace }: AlertNotificationProps) {
  const {
    thresholds,
    dismissedIds,
    dismissAlert,
    dismissAll,
  } = useAlerts();

  const [isExpanded, setIsExpanded] = useState(false);
  const hasAutoExpanded = useRef(false);

  // Run detection
  const allAlerts = useMemo(
    () => detectAlerts(metrics, thresholds, workspace),
    [metrics, thresholds, workspace]
  );

  // Filter out dismissed alerts
  const visibleAlerts = useMemo(
    () => allAlerts.filter((a) => !dismissedIds.has(a.id)),
    [allAlerts, dismissedIds]
  );

  // Counts by severity
  const criticalCount = visibleAlerts.filter((a) => a.type === 'critical').length;
  const warningCount = visibleAlerts.filter((a) => a.type === 'warning').length;
  const infoCount = visibleAlerts.filter((a) => a.type === 'info').length;

  // Auto-expand when critical alerts appear (once)
  useEffect(() => {
    if (criticalCount > 0 && !hasAutoExpanded.current) {
      setIsExpanded(true);
      hasAutoExpanded.current = true;
    }
  }, [criticalCount]);

  // Handle dismiss all
  const handleDismissAll = () => {
    dismissAll(visibleAlerts.map((a) => a.id));
  };

  if (visibleAlerts.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE_REVEAL }}
      className="rounded-xl border border-neutral-200/80 bg-white overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between px-5 py-3.5 text-left transition-colors hover:bg-neutral-50/80"
      >
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Bell className="h-4 w-4 text-neutral-500" />
            {visibleAlerts.length > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white leading-none">
                {visibleAlerts.length > 9 ? '9+' : visibleAlerts.length}
              </span>
            )}
          </div>
          <span className="text-sm font-medium text-neutral-700">Alertes</span>
          <div className="flex items-center gap-1.5">
            {criticalCount > 0 && (
              <span className={`rounded-full ${SEVERITY_CONFIG.critical.badgeBg} px-2 py-0.5 text-[10px] font-semibold ${SEVERITY_CONFIG.critical.badgeText}`}>
                {criticalCount} {criticalCount > 1 ? SEVERITY_CONFIG.critical.pluralLabel : SEVERITY_CONFIG.critical.label}
              </span>
            )}
            {warningCount > 0 && (
              <span className={`rounded-full ${SEVERITY_CONFIG.warning.badgeBg} px-2 py-0.5 text-[10px] font-semibold ${SEVERITY_CONFIG.warning.badgeText}`}>
                {warningCount} {warningCount > 1 ? SEVERITY_CONFIG.warning.pluralLabel : SEVERITY_CONFIG.warning.label}
              </span>
            )}
            {infoCount > 0 && (
              <span className={`rounded-full ${SEVERITY_CONFIG.info.badgeBg} px-2 py-0.5 text-[10px] font-semibold ${SEVERITY_CONFIG.info.badgeText}`}>
                {infoCount} {infoCount > 1 ? SEVERITY_CONFIG.info.pluralLabel : SEVERITY_CONFIG.info.label}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {visibleAlerts.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDismissAll();
              }}
              className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              Tout effacer
            </button>
          )}
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-4 w-4 text-neutral-400" />
          </motion.div>
        </div>
      </button>

      {/* Alert List */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE_REVEAL }}
            className="overflow-hidden"
          >
            <div className="border-t border-neutral-100 divide-y divide-neutral-100/60">
              <AnimatePresence initial={false}>
                {visibleAlerts.map((alert, index) => (
                  <AlertItem
                    key={alert.id}
                    alert={alert}
                    index={index}
                    onDismiss={dismissAlert}
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ---- Individual alert item ----

function AlertItem({
  alert,
  index,
  onDismiss,
}: {
  alert: Alert;
  index: number;
  onDismiss: (id: string) => void;
}) {
  const config = SEVERITY_CONFIG[alert.type];
  const Icon = getAlertIcon(alert);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8, height: 0, marginTop: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0 }}
      transition={{
        duration: 0.2,
        ease: EASE_REVEAL,
        delay: index * 0.03,
      }}
      className={`flex items-start gap-3 px-5 py-3 ${config.bg}`}
    >
      {/* Icon */}
      <div
        className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ${config.iconBg}`}
      >
        <Icon className={`h-3.5 w-3.5 ${config.iconColor}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={`text-sm font-medium ${config.titleColor}`}>
            {alert.title}
          </p>
          {alert.currentValue !== undefined && alert.threshold !== undefined && (
            <MetricBadge alert={alert} config={config} />
          )}
        </div>
        <p className={`mt-0.5 text-xs leading-relaxed ${config.messageColor}`}>
          {alert.message}
        </p>
      </div>

      {/* Dismiss button */}
      <button
        onClick={() => onDismiss(alert.id)}
        className="mt-0.5 flex-shrink-0 rounded-md p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
        aria-label="Ignorer cette alerte"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}

// ---- Metric comparison badge ----

function MetricBadge({
  alert,
  config,
}: {
  alert: Alert;
  config: (typeof SEVERITY_CONFIG)[keyof typeof SEVERITY_CONFIG];
}) {
  if (alert.currentValue === undefined || alert.threshold === undefined) return null;

  // Show how far off from threshold
  let deviation: string;
  if (alert.metric === 'roas' || alert.metric === 'campaign_roas') {
    const diff = alert.threshold - alert.currentValue;
    deviation = `-${diff.toFixed(1)}x`;
  } else if (alert.metric === 'conversion_rate') {
    const diff = alert.threshold - alert.currentValue;
    deviation = `-${diff.toFixed(1)}pp`;
  } else {
    // CPA, spend — current exceeds threshold
    const pctOver = ((alert.currentValue - alert.threshold) / alert.threshold) * 100;
    deviation = `+${pctOver.toFixed(0)}%`;
  }

  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${config.badgeBg} ${config.badgeText}`}
    >
      {deviation}
    </span>
  );
}
