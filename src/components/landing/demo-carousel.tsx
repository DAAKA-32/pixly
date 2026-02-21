'use client';

import { useState, useCallback } from 'react';
import {
  LayoutDashboard,
  BarChart3,
  Filter,
  Target,
  Zap,
  Users,
  CreditCard,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

// ===========================================
// DEMO CAROUSEL — Landing page interactive demo
// 7 slides matching all sidebar pages
// ===========================================

const SLIDES = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'attribution', label: 'Attribution', icon: BarChart3 },
  { id: 'funnel', label: 'Funnel', icon: Filter },
  { id: 'audience', label: 'Audience', icon: Target },
  { id: 'integrations', label: 'Intégrations', icon: Zap },
  { id: 'team', label: 'Équipe', icon: Users },
  { id: 'billing', label: 'Facturation', icon: CreditCard },
] as const;

// Shared chrome bar for all mockups
function Chrome({ title, url }: { title: string; url: string }) {
  return (
    <div className="px-4 sm:px-5 py-2.5 sm:py-3 border-b border-neutral-100 flex items-center gap-2.5 bg-neutral-50/60 flex-shrink-0">
      <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
      <span className="text-[11px] sm:text-[12px] font-semibold text-neutral-700">{title}</span>
      <span className="ml-auto text-[10px] text-neutral-300 hidden sm:block">{url}</span>
    </div>
  );
}

// Period selector pill (reused across pages)
function PeriodPills({ active = 1 }: { active?: number }) {
  return (
    <div className="flex rounded-md border border-neutral-200/80 bg-white p-0.5">
      {['7j', '30j', '90j'].map((p, i) => (
        <span
          key={p}
          className={`text-[9px] sm:text-[10px] px-2 sm:px-2.5 py-0.5 rounded font-medium ${
            i === active ? 'bg-neutral-900 text-white' : 'text-neutral-400'
          }`}
        >
          {p}
        </span>
      ))}
    </div>
  );
}

// KPI card (reused in Dashboard + Attribution)
function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-neutral-200/80 bg-white p-2.5 sm:p-3.5">
      <p className="text-[8px] sm:text-[9px] font-medium text-neutral-500 uppercase tracking-wide">{label}</p>
      <p className="mt-1 font-serif text-sm sm:text-lg font-bold text-neutral-900 tracking-tight tabular-nums">{value}</p>
    </div>
  );
}

// ─── MOCKUP: Dashboard ───
function MockDashboard() {
  return (
    <div className="flex flex-col h-full">
      <Chrome title="Vue d'ensemble" url="pixly.app/dashboard" />
      <div className="p-3 sm:p-5 space-y-3 sm:space-y-4 flex-1 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-[10px] sm:text-[11px] text-neutral-400">30 derniers jours</p>
          <PeriodPills />
        </div>

        {/* Primary KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
          <KpiCard label="Revenu Total" value="127 493 €" />
          <KpiCard label="ROAS" value="4,2x" />
          <KpiCard label="Conversions" value="1 847" />
          <KpiCard label="Panier Moyen" value="69 €" />
        </div>

        {/* Secondary KPIs */}
        <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
          {[{ l: 'Dépenses Pub', v: '30 355 €' }, { l: 'CPA', v: '16,43 €' }].map((k) => (
            <div key={k.l} className="rounded-lg border border-neutral-200/60 bg-neutral-50/50 px-2.5 py-1.5 sm:px-3 sm:py-2 flex items-center justify-between">
              <p className="text-[8px] sm:text-[9px] font-medium text-neutral-500">{k.l}</p>
              <p className="text-[10px] sm:text-[12px] font-semibold text-neutral-900 tabular-nums">{k.v}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5">
          <div className="sm:col-span-2 rounded-xl border border-neutral-200/80 bg-white p-2.5 sm:p-3.5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[9px] sm:text-[10px] font-medium text-neutral-500">Revenu par jour</p>
              <p className="text-[8px] sm:text-[9px] text-neutral-300">30j</p>
            </div>
            <div className="flex items-end gap-[2px] sm:gap-1 h-16 sm:h-24">
              {[40, 55, 35, 65, 48, 72, 58, 45, 68, 82, 60, 75, 90, 65].map((h, i) => (
                <div key={i} className={`flex-1 rounded-t ${i === 12 ? 'bg-emerald-500' : 'bg-neutral-200/80'}`} style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-neutral-200/80 bg-white p-2.5 sm:p-3.5">
            <p className="text-[9px] sm:text-[10px] font-medium text-neutral-500 mb-2">Par canal</p>
            <div className="flex flex-col items-center">
              <svg viewBox="0 0 80 80" className="h-12 w-12 sm:h-14 sm:w-14">
                <circle cx="40" cy="40" r="28" fill="none" stroke="#f5f5f5" strokeWidth="8" />
                {[
                  { color: '#1877F2', pct: 48, offset: 0 },
                  { color: '#EA4335', pct: 34, offset: 48 },
                  { color: '#000', pct: 18, offset: 82 },
                ].map((s) => (
                  <circle key={s.color} cx="40" cy="40" r="28" fill="none" stroke={s.color} strokeWidth="8"
                    strokeDasharray={`${(s.pct / 100) * 175.9} 175.9`}
                    strokeDashoffset={`${-(s.offset / 100) * 175.9}`}
                    transform="rotate(-90 40 40)" strokeLinecap="round" />
                ))}
              </svg>
              <div className="mt-1.5 space-y-0.5 w-full">
                {[{ n: 'Meta Ads', c: '#1877F2', p: '48%' }, { n: 'Google Ads', c: '#EA4335', p: '34%' }, { n: 'TikTok Ads', c: '#000', p: '18%' }].map((ch) => (
                  <div key={ch.n} className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: ch.c }} />
                    <span className="text-[7px] sm:text-[8px] text-neutral-600 flex-1">{ch.n}</span>
                    <span className="text-[7px] sm:text-[8px] font-medium text-neutral-900 tabular-nums">{ch.p}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Campaign preview */}
        <div className="rounded-xl border border-neutral-200/80 bg-white overflow-hidden">
          <div className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 border-b border-neutral-100 flex items-center justify-between">
            <p className="text-[9px] sm:text-[10px] font-semibold text-neutral-700">Campagnes</p>
            <p className="text-[8px] sm:text-[9px] text-neutral-400">Top 3</p>
          </div>
          {[
            { name: 'Summer Sale - Lookalike', ch: 'Meta Ads', color: '#1877F2', rev: '18 430 €', roas: '5,2x', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200/60' },
            { name: 'Brand Search - FR', ch: 'Google Ads', color: '#EA4335', rev: '14 210 €', roas: '3,8x', cls: 'bg-neutral-50 text-neutral-700 border-neutral-200/60' },
            { name: 'Retargeting Video', ch: 'TikTok Ads', color: '#000', rev: '8 541 €', roas: '2,1x', cls: 'bg-neutral-50 text-neutral-700 border-neutral-200/60' },
          ].map((c) => (
            <div key={c.name} className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 flex items-center gap-2 border-b border-neutral-50 last:border-0">
              <div className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
              <div className="flex-1 min-w-0">
                <p className="text-[8px] sm:text-[9px] font-medium text-neutral-900 truncate">{c.name}</p>
                <p className="text-[7px] sm:text-[8px] text-neutral-400">{c.ch}</p>
              </div>
              <span className="text-[8px] sm:text-[9px] font-semibold text-neutral-900 tabular-nums hidden sm:block">{c.rev}</span>
              <span className={`text-[7px] sm:text-[8px] font-semibold px-1.5 py-0.5 rounded border tabular-nums ${c.cls}`}>{c.roas}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── MOCKUP: Attribution ───
function MockAttribution() {
  const channels = [
    { name: 'Meta Ads', color: '#1877F2', width: 78, spend: '10,4k €', rev: '49 832 €', conv: 412, roas: '4,8x', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200/60', share: '48%' },
    { name: 'Google Ads', color: '#EA4335', width: 55, spend: '11,0k €', rev: '35 120 €', conv: 287, roas: '3,2x', cls: 'bg-neutral-50 text-neutral-700 border-neutral-200/60', share: '34%' },
    { name: 'TikTok Ads', color: '#171717', width: 38, spend: '7,1k €', rev: '18 541 €', conv: 148, roas: '2,6x', cls: 'bg-neutral-50 text-neutral-700 border-neutral-200/60', share: '18%' },
  ];

  return (
    <div className="flex flex-col h-full">
      <Chrome title="Attribution" url="pixly.app/attribution" />
      <div className="p-3 sm:p-5 space-y-3 sm:space-y-4 flex-1 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1 flex-wrap">
            {['Dernier clic', 'Premier clic', 'Linéaire', 'Décrois. temp.', 'Position'].map((m, i) => (
              <span key={m} className={`text-[7px] sm:text-[8px] px-1.5 sm:px-2 py-0.5 rounded-full font-medium ${i === 0 ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-500'}`}>{m}</span>
            ))}
          </div>
          <PeriodPills />
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
          <KpiCard label="Revenu attribué" value="103 493 €" />
          <KpiCard label="Dépenses pub" value="28 500 €" />
          <KpiCard label="ROAS global" value="3,63x" />
          <KpiCard label="Conversions" value="847" />
        </div>

        {/* Channel bars + Donut */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5">
          <div className="sm:col-span-2 rounded-xl border border-neutral-200/80 bg-white p-2.5 sm:p-3.5">
            <p className="text-[9px] sm:text-[10px] font-semibold text-neutral-700 mb-2 sm:mb-3">Attribution par canal</p>
            {/* Column headers - desktop */}
            <div className="hidden sm:flex items-center gap-2 mb-1.5 text-[7px] font-medium text-neutral-400 uppercase tracking-wider">
              <span className="w-20 flex-shrink-0">Canal</span>
              <span className="flex-1" />
              <span className="w-12 text-right">Dépense</span>
              <span className="w-12 text-right">Revenu</span>
              <span className="w-8 text-right">Conv.</span>
              <span className="w-10 text-right">ROAS</span>
              <span className="w-8 text-right">Part</span>
            </div>
            <div className="space-y-1.5 sm:space-y-1">
              {channels.map((ch) => (
                <div key={ch.name} className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 w-16 sm:w-20 flex-shrink-0">
                    <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: ch.color }} />
                    <span className="text-[8px] sm:text-[9px] font-medium text-neutral-700 truncate">{ch.name}</span>
                  </div>
                  <div className="flex-1 h-4 sm:h-5 bg-neutral-100 rounded overflow-hidden">
                    <div className="h-full rounded" style={{ width: `${ch.width}%`, backgroundColor: ch.color, opacity: 0.8 }} />
                  </div>
                  <div className="hidden sm:flex items-center flex-shrink-0 text-[8px] tabular-nums">
                    <span className="w-12 text-right text-neutral-500">{ch.spend}</span>
                    <span className="w-12 text-right font-semibold text-neutral-900">{ch.rev}</span>
                    <span className="w-8 text-right text-neutral-600">{ch.conv}</span>
                    <span className="w-10 text-right"><span className={`px-1 py-0.5 rounded border text-[7px] font-semibold ${ch.cls}`}>{ch.roas}</span></span>
                    <span className="w-8 text-right font-medium text-emerald-600">{ch.share}</span>
                  </div>
                  <span className="sm:hidden text-[7px] font-semibold px-1 py-0.5 rounded border tabular-nums bg-emerald-50 text-emerald-700 border-emerald-200/60 flex-shrink-0">{ch.roas}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-neutral-200/80 bg-white p-2.5 sm:p-3.5 flex flex-col items-center justify-center">
            <p className="text-[9px] sm:text-[10px] font-medium text-neutral-500 mb-2 self-start">Répartition</p>
            <svg viewBox="0 0 100 100" className="h-16 w-16 sm:h-20 sm:w-20">
              <circle cx="50" cy="50" r="35" fill="none" stroke="#f5f5f5" strokeWidth="10" />
              {[
                { color: '#1877F2', pct: 48, offset: 0 },
                { color: '#EA4335', pct: 34, offset: 48 },
                { color: '#171717', pct: 18, offset: 82 },
              ].map((s) => (
                <circle key={s.color} cx="50" cy="50" r="35" fill="none" stroke={s.color} strokeWidth="10"
                  strokeDasharray={`${(s.pct / 100) * 220} 220`}
                  strokeDashoffset={`${-(s.offset / 100) * 220}`}
                  transform="rotate(-90 50 50)" strokeLinecap="round" />
              ))}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MOCKUP: Funnel ───
function MockFunnel() {
  const steps = [
    { label: 'Visite', count: '24 312', pct: 100, color: 'bg-neutral-200' },
    { label: 'Ajout panier', count: '2 917', pct: 12, color: 'bg-emerald-200' },
    { label: 'Paiement initié', count: '1 312', pct: 5.4, color: 'bg-emerald-400' },
    { label: 'Achat', count: '608', pct: 2.5, color: 'bg-emerald-500' },
  ];

  return (
    <div className="flex flex-col h-full">
      <Chrome title="Analyse de Funnel" url="pixly.app/funnel" />
      <div className="p-3 sm:p-5 space-y-3 sm:space-y-4 flex-1 overflow-hidden">
        <div className="flex items-center justify-between">
          <p className="text-[10px] sm:text-[11px] text-neutral-400">Visite → Panier → Checkout → Achat</p>
          <PeriodPills />
        </div>

        {/* Funnel bars */}
        <div className="rounded-xl border border-neutral-200/80 bg-white p-3 sm:p-4">
          <p className="text-[9px] sm:text-[10px] font-semibold text-neutral-700 mb-3">Parcours de conversion</p>
          <div className="space-y-2 sm:space-y-2.5">
            {steps.map((step, i) => (
              <div key={step.label} className="flex items-center gap-3">
                <div className="w-24 sm:w-28 flex-shrink-0 text-right">
                  <p className="text-[9px] sm:text-[10px] font-medium text-neutral-700">{step.label}</p>
                </div>
                <div className="flex-1 relative">
                  <div className="h-8 sm:h-10 w-full rounded-lg bg-neutral-50" />
                  <div className={`absolute inset-y-0 left-0 rounded-lg ${step.color}`} style={{ width: `${Math.max(step.pct, 3)}%` }} />
                  <span className="absolute inset-y-0 left-0 flex items-center ml-2 font-serif text-xs sm:text-sm tabular-nums text-neutral-800">{step.count}</span>
                </div>
                <div className="w-14 sm:w-20 flex-shrink-0 text-right">
                  {i === 0 ? (
                    <span className="text-[9px] sm:text-[10px] text-neutral-400">100%</span>
                  ) : (
                    <div>
                      <p className="text-[10px] sm:text-[11px] font-semibold tabular-nums text-neutral-900">{step.pct}%</p>
                      <p className="text-[8px] sm:text-[9px] tabular-nums text-red-400">-{Math.round(((steps[i - 1].pct - step.pct) / steps[i - 1].pct) * 100)}%</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg py-1.5 px-3">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-[9px] sm:text-[10px] font-semibold text-emerald-700">Taux de conversion global : 2,5%</span>
          </div>
        </div>

        {/* Drop-off cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
          {[
            { label: 'Visite → Panier', rate: '12,0%', lost: '88,0%' },
            { label: 'Panier → Checkout', rate: '45,0%', lost: '55,0%' },
            { label: 'Checkout → Achat', rate: '46,3%', lost: '53,7%' },
          ].map((t) => (
            <div key={t.label} className="rounded-xl border border-neutral-200/80 bg-white p-2 sm:p-3">
              <p className="text-[7px] sm:text-[8px] font-medium text-neutral-500 mb-1.5">{t.label}</p>
              <p className="font-serif text-sm sm:text-lg tabular-nums text-neutral-900 leading-none">{t.rate}</p>
              <p className="text-[7px] sm:text-[8px] tabular-nums text-red-400 mt-1">-{t.lost} perdu</p>
              <div className="h-1.5 w-full rounded-full bg-red-100/60 mt-1.5">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: t.rate }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── MOCKUP: Audience ───
function MockAudience() {
  const dims = ['Device', 'Pays', 'Navigateur', 'OS', 'Canal', 'Campagne'];
  const segments = [
    { name: 'Desktop', visitors: '14 832', conv: '623', cr: '4,2%', rev: '39 712 €' },
    { name: 'Mobile', visitors: '8 194', conv: '312', cr: '3,8%', rev: '38 240 €' },
    { name: 'Tablet', visitors: '1 286', conv: '41', cr: '3,2%', rev: '5 041 €' },
  ];

  return (
    <div className="flex flex-col h-full">
      <Chrome title="Audience" url="pixly.app/audience" />
      <div className="p-3 sm:p-5 space-y-3 sm:space-y-4 flex-1 overflow-hidden">
        <div className="flex items-center justify-between">
          <p className="text-[10px] sm:text-[11px] text-neutral-400">Segmentation de votre audience</p>
          <PeriodPills />
        </div>

        {/* Dimension tabs */}
        <div className="flex gap-0.5 sm:gap-1 overflow-x-auto">
          {dims.map((d, i) => (
            <span key={d} className={`text-[7px] sm:text-[8px] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md font-medium whitespace-nowrap flex-shrink-0 ${i === 0 ? 'bg-neutral-900 text-white' : 'bg-neutral-50 text-neutral-400'}`}>{d}</span>
          ))}
        </div>

        {/* Top segment cards */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          {[
            { label: 'Meilleur CR', seg: 'Desktop', value: '4,2%', color: '#0F9D58', bg: '#edfcf2' },
            { label: 'Plus haut revenu', seg: 'Desktop', value: '39 712 €', color: '#2563eb', bg: '#eff6ff' },
            { label: 'Meilleur AOV', seg: 'Desktop', value: '64 €', color: '#7c3aed', bg: '#f5f3ff' },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border p-1.5 sm:p-2" style={{ borderColor: `${s.color}30`, backgroundColor: `${s.bg}80` }}>
              <p className="text-[6px] sm:text-[7px] font-medium" style={{ color: s.color }}>{s.label}</p>
              <p className="text-[9px] sm:text-[11px] font-bold text-neutral-900 mt-0.5">{s.value}</p>
              <p className="text-[6px] sm:text-[7px] text-neutral-500">{s.seg}</p>
            </div>
          ))}
        </div>

        {/* Segment table */}
        <div className="rounded-xl border border-neutral-200/80 bg-white overflow-hidden">
          <div className="grid grid-cols-5 gap-1 px-2.5 py-1.5 bg-neutral-50 border-b border-neutral-100">
            {['Segment', 'Visiteurs', 'Conv.', 'CR', 'Revenu'].map((h) => (
              <span key={h} className="text-[6px] sm:text-[7px] font-semibold text-neutral-400 uppercase">{h}</span>
            ))}
          </div>
          {segments.map((seg) => (
            <div key={seg.name} className="grid grid-cols-5 gap-1 px-2.5 py-1.5 border-b border-neutral-50 last:border-0">
              <span className="text-[8px] sm:text-[9px] font-medium text-neutral-900">{seg.name}</span>
              <span className="text-[8px] sm:text-[9px] text-neutral-600 tabular-nums">{seg.visitors}</span>
              <span className="text-[8px] sm:text-[9px] text-neutral-600 tabular-nums">{seg.conv}</span>
              <span className="text-[8px] sm:text-[9px] font-medium text-emerald-600 tabular-nums">{seg.cr}</span>
              <span className="text-[8px] sm:text-[9px] font-medium text-neutral-900 tabular-nums">{seg.rev}</span>
            </div>
          ))}
        </div>

        {/* Device donut */}
        <div className="rounded-xl border border-neutral-200/80 bg-white p-2.5 sm:p-3.5 flex items-center gap-4">
          <svg viewBox="0 0 80 80" className="h-14 w-14 sm:h-16 sm:w-16 flex-shrink-0">
            <circle cx="40" cy="40" r="28" fill="none" stroke="#f5f5f5" strokeWidth="8" />
            {[
              { color: '#3b82f6', pct: 62, offset: 0 },
              { color: '#0F9D58', pct: 33, offset: 62 },
              { color: '#f59e0b', pct: 5, offset: 95 },
            ].map((s) => (
              <circle key={s.color} cx="40" cy="40" r="28" fill="none" stroke={s.color} strokeWidth="8"
                strokeDasharray={`${(s.pct / 100) * 175.9} 175.9`}
                strokeDashoffset={`${-(s.offset / 100) * 175.9}`}
                transform="rotate(-90 40 40)" strokeLinecap="round" />
            ))}
          </svg>
          <div className="space-y-1 flex-1">
            {[{ n: 'Desktop', c: '#3b82f6', p: '62%' }, { n: 'Mobile', c: '#0F9D58', p: '33%' }, { n: 'Tablet', c: '#f59e0b', p: '5%' }].map((d) => (
              <div key={d.n} className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.c }} />
                <span className="text-[8px] sm:text-[9px] text-neutral-600 flex-1">{d.n}</span>
                <span className="text-[8px] sm:text-[9px] font-medium text-neutral-900 tabular-nums">{d.p}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MOCKUP: Integrations ───
function MockIntegrations() {
  const integrations = [
    { name: 'Meta Ads', desc: 'Facebook et Instagram Ads', color: '#1877F2', connected: true },
    { name: 'Google Ads', desc: 'Search, Display et YouTube', color: '#EA4335', connected: true },
    { name: 'TikTok Ads', desc: 'Publicité TikTok', color: '#171717', connected: true },
    { name: 'Stripe', desc: 'Paiements et revenus', color: '#635BFF', connected: false },
    { name: 'Shopify', desc: 'Commandes et panier', color: '#96BF48', connected: false },
  ];

  return (
    <div className="flex flex-col h-full">
      <Chrome title="Intégrations" url="pixly.app/integrations" />
      <div className="p-3 sm:p-5 space-y-3 sm:space-y-4 flex-1 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-[10px] sm:text-[11px] text-neutral-400">Connectez vos outils</p>
          <div className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2 py-1">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-[8px] sm:text-[9px] font-medium text-emerald-700">3 connectées</span>
          </div>
        </div>

        {/* Pixel tracking */}
        <div className="rounded-xl border border-neutral-200/80 bg-white p-2.5 sm:p-3.5 flex items-center gap-3">
          <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-neutral-900 flex items-center justify-center flex-shrink-0">
            <span className="text-[9px] sm:text-[10px] text-white/80">{'</>'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-[10px] sm:text-[11px] font-semibold text-neutral-900">Pixel de tracking</p>
              <span className="text-[7px] sm:text-[8px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-medium">Actif</span>
            </div>
            <p className="text-[8px] sm:text-[9px] text-neutral-400 truncate">ID: px_a1b2c3d4</p>
          </div>
        </div>

        {/* Categories */}
        {[
          { label: 'Plateformes publicitaires', items: integrations.slice(0, 3) },
          { label: 'Sources de revenus', items: integrations.slice(3) },
        ].map((cat) => (
          <div key={cat.label}>
            <p className="text-[7px] sm:text-[8px] font-semibold uppercase tracking-widest text-neutral-400 mb-1.5 sm:mb-2">{cat.label}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2">
              {cat.items.map((int) => (
                <div key={int.name} className={`rounded-xl border p-2 sm:p-2.5 ${int.connected ? 'border-emerald-200/80 bg-emerald-50/30' : 'border-neutral-200/80 bg-white'}`}>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${int.color}12`, color: int.color }}>
                      <span className="text-[8px] sm:text-[9px] font-bold">{int.name[0]}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[8px] sm:text-[9px] font-semibold text-neutral-900 truncate">{int.name}</p>
                      {int.connected ? (
                        <div className="flex items-center gap-1">
                          <div className="h-1 w-1 rounded-full bg-emerald-500" />
                          <span className="text-[6px] sm:text-[7px] text-emerald-600 font-medium">Connecté</span>
                        </div>
                      ) : (
                        <span className="text-[6px] sm:text-[7px] text-neutral-400">Disponible</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MOCKUP: Team ───
function MockTeam() {
  const members = [
    { initials: 'EN', name: 'Emilien Nepveu', email: 'emilien@pixly.app', role: 'Propriétaire', roleClass: 'bg-neutral-900 text-white' },
    { initials: 'MD', name: 'Marie Dupont', email: 'marie@startup.com', role: 'Administrateur', roleClass: 'bg-primary-100 text-primary-700' },
    { initials: 'TM', name: 'Thomas Martin', email: 'thomas@startup.com', role: 'Éditeur', roleClass: 'bg-amber-100 text-amber-700' },
    { initials: 'SB', name: 'Sophie Bernard', email: 'sophie@startup.com', role: 'Lecteur', roleClass: 'bg-neutral-100 text-neutral-600' },
  ];

  return (
    <div className="flex flex-col h-full">
      <Chrome title="Équipe" url="pixly.app/team" />
      <div className="p-3 sm:p-5 space-y-3 sm:space-y-4 flex-1 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-[10px] sm:text-[11px] text-neutral-400">Gérez les membres de votre espace</p>
          <span className="text-[8px] sm:text-[9px] font-medium bg-emerald-500 text-white px-2.5 py-1 rounded-lg">+ Inviter</span>
        </div>

        {/* Members */}
        <div className="rounded-xl border border-neutral-200/80 bg-white overflow-hidden">
          <div className="px-3 sm:px-4 py-2 border-b border-neutral-100 flex items-center gap-2">
            <Users className="h-3.5 w-3.5 text-neutral-400" />
            <p className="text-[10px] sm:text-[11px] font-semibold text-neutral-700">Membres</p>
            <span className="text-[9px] sm:text-[10px] text-neutral-400 ml-1">{members.length}</span>
          </div>
          <div className="divide-y divide-neutral-50">
            {members.map((m) => (
              <div key={m.initials} className="px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2.5 sm:gap-3">
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center flex-shrink-0">
                  <span className="text-[8px] sm:text-[9px] font-bold text-neutral-600">{m.initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] sm:text-[10px] font-medium text-neutral-900 truncate">{m.name}</p>
                  <p className="text-[7px] sm:text-[8px] text-neutral-400 truncate">{m.email}</p>
                </div>
                <span className={`text-[7px] sm:text-[8px] font-medium px-1.5 sm:px-2 py-0.5 rounded-full flex-shrink-0 ${m.roleClass}`}>{m.role}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pending invites */}
        <div className="rounded-xl border border-neutral-200/80 bg-white overflow-hidden">
          <div className="px-3 sm:px-4 py-2 border-b border-neutral-100 flex items-center gap-2">
            <span className="text-[9px] sm:text-[10px] text-neutral-400">⏳</span>
            <p className="text-[10px] sm:text-[11px] font-semibold text-neutral-700">Invitations en attente</p>
            <span className="text-[9px] sm:text-[10px] text-neutral-400 ml-1">1</span>
          </div>
          <div className="px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2.5 sm:gap-3">
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0">
              <span className="text-[9px] text-neutral-400">✉</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] sm:text-[10px] font-medium text-neutral-700 truncate">lucas@agence.com</p>
              <p className="text-[7px] sm:text-[8px] text-neutral-400">Envoyée le 12 fév. 2026</p>
            </div>
            <span className="text-[7px] sm:text-[8px] font-medium px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 flex-shrink-0">Éditeur</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MOCKUP: Billing ───
function MockBilling() {
  return (
    <div className="flex flex-col h-full">
      <Chrome title="Facturation" url="pixly.app/billing" />
      <div className="p-3 sm:p-5 space-y-3 sm:space-y-4 flex-1 overflow-hidden">
        {/* Status badge */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2 py-1">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-[8px] sm:text-[9px] font-medium text-emerald-700">Abonnement actif</span>
          </span>
        </div>

        {/* Plan card */}
        <div className="rounded-xl border border-neutral-200/80 bg-white p-3 sm:p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-[8px] sm:text-[9px] font-medium text-neutral-500 uppercase tracking-wide">Plan actuel</p>
              <p className="font-serif text-xl sm:text-2xl font-bold text-neutral-900 mt-1">Growth</p>
            </div>
            <div className="text-right">
              <p className="text-lg sm:text-xl font-bold text-neutral-900 tabular-nums">99 €<span className="text-[10px] sm:text-[11px] font-normal text-neutral-500">/mois</span></p>
            </div>
          </div>
          <div className="space-y-1.5 mb-3">
            {['Jusqu\'à 100k€ de dépenses/mois', 'Toutes les plateformes', 'Attribution multi-touch'].map((f) => (
              <div key={f} className="flex items-center gap-1.5">
                <div className="h-3.5 w-3.5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-[7px] text-emerald-600">✓</span>
                </div>
                <span className="text-[8px] sm:text-[9px] text-neutral-600">{f}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 text-[8px] sm:text-[9px] text-neutral-400">
            <span>Prochaine facturation : <span className="font-medium text-neutral-700">15 mars 2026</span></span>
          </div>
        </div>

        {/* Payment method */}
        <div className="rounded-xl border border-neutral-200/80 bg-white p-3 sm:p-4 flex items-center gap-3">
          <div className="h-8 w-12 sm:h-9 sm:w-14 rounded-md bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center flex-shrink-0">
            <span className="text-[8px] sm:text-[9px] font-bold text-white">VISA</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] sm:text-[10px] font-medium text-neutral-900">•••• •••• •••• 4242</p>
            <p className="text-[7px] sm:text-[8px] text-neutral-400">Expire 09/27</p>
          </div>
          <span className="text-[8px] sm:text-[9px] font-medium text-neutral-500 border border-neutral-200/80 px-2 py-1 rounded-lg flex-shrink-0">Modifier</span>
        </div>

        {/* Billing history */}
        <div className="rounded-xl border border-neutral-200/80 bg-white overflow-hidden">
          <div className="px-3 sm:px-4 py-2 border-b border-neutral-100">
            <p className="text-[10px] sm:text-[11px] font-semibold text-neutral-700">Historique</p>
          </div>
          <div className="divide-y divide-neutral-50">
            {[
              { date: '15 fév. 2026', desc: 'Growth — Mensuel', amount: '99,00 €', status: 'Payée' },
              { date: '15 janv. 2026', desc: 'Growth — Mensuel', amount: '99,00 €', status: 'Payée' },
              { date: '15 déc. 2025', desc: 'Growth — Mensuel', amount: '99,00 €', status: 'Payée' },
            ].map((inv) => (
              <div key={inv.date} className="px-3 sm:px-4 py-2 flex items-center gap-2 sm:gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[8px] sm:text-[9px] font-medium text-neutral-900">{inv.desc}</p>
                  <p className="text-[7px] sm:text-[8px] text-neutral-400">{inv.date}</p>
                </div>
                <span className="text-[8px] sm:text-[9px] font-semibold text-neutral-900 tabular-nums flex-shrink-0">{inv.amount}</span>
                <span className="text-[7px] sm:text-[8px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded flex-shrink-0">{inv.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SLIDE DISPATCH ───
const MOCKUP_MAP: Record<string, () => JSX.Element> = {
  dashboard: MockDashboard,
  attribution: MockAttribution,
  funnel: MockFunnel,
  audience: MockAudience,
  integrations: MockIntegrations,
  team: MockTeam,
  billing: MockBilling,
};

// ===========================================
// CAROUSEL COMPONENT
// ===========================================

export function DemoCarousel() {
  const [active, setActive] = useState(0);

  const prev = useCallback(() => {
    setActive((i) => (i === 0 ? SLIDES.length - 1 : i - 1));
  }, []);

  const next = useCallback(() => {
    setActive((i) => (i === SLIDES.length - 1 ? 0 : i + 1));
  }, []);

  const Mockup = MOCKUP_MAP[SLIDES[active].id];

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Page tabs */}
      <div className="flex items-center justify-center gap-1 sm:gap-1.5 overflow-x-auto scrollbar-none px-2">
        {SLIDES.map((slide, i) => {
          const Icon = slide.icon;
          return (
            <button
              key={slide.id}
              onClick={() => setActive(i)}
              className={`flex flex-shrink-0 items-center gap-1 sm:gap-1.5 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-[12px] font-medium transition-all duration-200 ${
                i === active
                  ? 'bg-neutral-900 text-white shadow-sm'
                  : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700'
              }`}
              aria-label={`Voir la page ${slide.label}`}
            >
              <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span className="hidden sm:inline">{slide.label}</span>
            </button>
          );
        })}
      </div>

      {/* Mockup frame */}
      <div className="relative group">
        {/* Arrow left */}
        <button
          onClick={prev}
          className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/90 border border-neutral-200/80 shadow-md text-neutral-600 hover:bg-white hover:text-neutral-900 transition-all opacity-70 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100"
          aria-label="Page précédente"
        >
          <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>

        {/* Arrow right */}
        <button
          onClick={next}
          className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/90 border border-neutral-200/80 shadow-md text-neutral-600 hover:bg-white hover:text-neutral-900 transition-all opacity-70 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100"
          aria-label="Page suivante"
        >
          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>

        {/* Frame */}
        <div className="rounded-2xl border border-neutral-200/80 bg-white shadow-elevated overflow-hidden">
          <div className="h-[400px] sm:h-[480px] lg:h-[540px] overflow-hidden">
            {Mockup && <Mockup />}
          </div>
        </div>
      </div>

      {/* Dot indicators */}
      <div className="flex items-center justify-center gap-1.5" role="tablist">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.id}
            onClick={() => setActive(i)}
            className={`rounded-full transition-all duration-200 ${
              i === active
                ? 'h-2 w-6 bg-neutral-900'
                : 'h-2 w-2 bg-neutral-300 hover:bg-neutral-400'
            }`}
            role="tab"
            aria-selected={i === active}
            aria-label={slide.label}
          />
        ))}
      </div>
    </div>
  );
}
