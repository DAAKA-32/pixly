'use client';

import { useState, useCallback } from 'react';
import { Download, FileText, FileSpreadsheet, ChevronDown } from 'lucide-react';
import {
  exportCampaignsCSV,
  exportOverviewCSV,
  exportConversionsCSV,
  exportFullReportCSV,
  exportDashboardPDF,
} from '@/lib/export';
import type { DashboardMetrics } from '@/types';

// ===========================================
// PIXLY - Export Buttons
// CSV and PDF export for dashboard data
// ===========================================

interface ExportButtonsProps {
  metrics: DashboardMetrics | null;
  periodLabel: string;
  isLoading?: boolean;
}

export function ExportButtons({ metrics, periodLabel, isLoading }: ExportButtonsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleExport = useCallback(
    (type: 'csv_campaigns' | 'csv_overview' | 'csv_conversions' | 'csv_full' | 'pdf') => {
      if (!metrics) return;
      setIsOpen(false);

      switch (type) {
        case 'csv_campaigns':
          exportCampaignsCSV(metrics.byCampaign, periodLabel);
          break;
        case 'csv_overview':
          exportOverviewCSV(metrics, periodLabel);
          break;
        case 'csv_conversions':
          exportConversionsCSV(metrics.conversions, periodLabel);
          break;
        case 'csv_full':
          exportFullReportCSV(metrics, periodLabel);
          break;
        case 'pdf':
          exportDashboardPDF(metrics, periodLabel);
          break;
      }
    },
    [metrics, periodLabel]
  );

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading || !metrics}
        className="flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Download className="h-4 w-4" />
        Exporter
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-full z-20 mt-1.5 w-56 rounded-xl border border-neutral-200 bg-white py-1.5 shadow-lg">
            <div className="px-3 py-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                CSV
              </p>
            </div>
            <button
              onClick={() => handleExport('csv_full')}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              <FileSpreadsheet className="h-4 w-4 text-green-600" />
              Rapport complet
            </button>
            <button
              onClick={() => handleExport('csv_campaigns')}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              <FileSpreadsheet className="h-4 w-4 text-green-600" />
              Campagnes
            </button>
            <button
              onClick={() => handleExport('csv_overview')}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              <FileSpreadsheet className="h-4 w-4 text-green-600" />
              Vue d&apos;ensemble
            </button>
            <button
              onClick={() => handleExport('csv_conversions')}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              <FileSpreadsheet className="h-4 w-4 text-green-600" />
              Conversions
            </button>

            <div className="my-1.5 border-t border-neutral-100" />

            <div className="px-3 py-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                PDF
              </p>
            </div>
            <button
              onClick={() => handleExport('pdf')}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              <FileText className="h-4 w-4 text-red-600" />
              Rapport PDF
            </button>
          </div>
        </>
      )}
    </div>
  );
}
