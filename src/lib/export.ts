import type { DashboardMetrics, CampaignMetrics, Conversion, Channel } from '@/types';

// ===========================================
// PIXLY - Data Export Utilities
// CSV and PDF export for dashboard data
// ===========================================

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

// ============ CSV EXPORT ============

function escapeCSV(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function arrayToCSV(headers: string[], rows: (string | number)[][]): string {
  const headerLine = headers.map(escapeCSV).join(',');
  const dataLines = rows.map((row) => row.map(escapeCSV).join(','));
  return [headerLine, ...dataLines].join('\n');
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob(['\ufeff' + content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export campaign data as CSV
 */
export function exportCampaignsCSV(campaigns: CampaignMetrics[], periodLabel: string) {
  const headers = [
    'Campagne',
    'Canal',
    'Dépense (€)',
    'Revenu (€)',
    'Conversions',
    'ROAS',
    'CPA (€)',
    'Impressions',
    'Clics',
    'CTR (%)',
  ];

  const rows = campaigns.map((c) => [
    c.campaignName,
    channelLabels[c.channel] || c.channel,
    c.spend.toFixed(2),
    c.revenue.toFixed(2),
    c.conversions,
    c.roas.toFixed(2),
    c.cpa.toFixed(2),
    c.impressions,
    c.clicks,
    c.ctr.toFixed(2),
  ]);

  const csv = arrayToCSV(headers, rows);
  const date = new Date().toISOString().split('T')[0];
  downloadFile(csv, `pixly_campagnes_${periodLabel}_${date}.csv`, 'text/csv');
}

/**
 * Export overview metrics as CSV
 */
export function exportOverviewCSV(metrics: DashboardMetrics, periodLabel: string) {
  const headers = ['Métrique', 'Valeur'];

  const rows: (string | number)[][] = [
    ['Revenu Total (€)', metrics.overview.totalRevenue.toFixed(2)],
    ['Dépenses Pub (€)', metrics.overview.totalSpend.toFixed(2)],
    ['ROAS', metrics.overview.roas.toFixed(2)],
    ['Conversions', metrics.overview.totalConversions],
    ['CPA (€)', metrics.overview.cpa.toFixed(2)],
    ['Panier Moyen (€)', metrics.overview.aov.toFixed(2)],
    ['Taux de conversion (%)', (metrics.overview.conversionRate * 100).toFixed(2)],
  ];

  // Add channel breakdown
  rows.push(['', '']);
  rows.push(['--- Répartition par Canal ---', '']);
  rows.push(['Canal', 'Revenu (€)']);

  Object.entries(metrics.byChannel).forEach(([channel, data]) => {
    if (data.revenue > 0 || data.conversions > 0) {
      rows.push([channelLabels[channel as Channel] || channel, data.revenue.toFixed(2)]);
    }
  });

  const csv = arrayToCSV(headers, rows);
  const date = new Date().toISOString().split('T')[0];
  downloadFile(csv, `pixly_overview_${periodLabel}_${date}.csv`, 'text/csv');
}

/**
 * Export conversions as CSV
 */
export function exportConversionsCSV(conversions: Conversion[], periodLabel: string) {
  const headers = [
    'ID',
    'Type',
    'Valeur (€)',
    'Devise',
    'Canal',
    'Campagne',
    'Date',
    'Sync Meta',
    'Sync Google',
  ];

  const rows = conversions.map((c) => [
    c.id,
    c.type,
    c.value.toFixed(2),
    c.currency,
    c.attribution?.touchpoints[0]?.channel || 'direct',
    c.attribution?.touchpoints[0]?.campaign || 'N/A',
    c.timestamp instanceof Date ? c.timestamp.toISOString() : String(c.timestamp),
    c.synced?.meta?.synced ? 'Oui' : 'Non',
    c.synced?.google?.synced ? 'Oui' : 'Non',
  ]);

  const csv = arrayToCSV(headers, rows);
  const date = new Date().toISOString().split('T')[0];
  downloadFile(csv, `pixly_conversions_${periodLabel}_${date}.csv`, 'text/csv');
}

/**
 * Export full dashboard report as CSV
 */
export function exportFullReportCSV(metrics: DashboardMetrics, periodLabel: string) {
  const sections: string[] = [];

  // Overview section
  sections.push('RAPPORT PIXLY - Vue d\'ensemble');
  sections.push(`Période: ${periodLabel}`);
  sections.push(`Date d'export: ${new Date().toLocaleDateString('fr-FR')}`);
  sections.push('');
  sections.push('Métrique,Valeur');
  sections.push(`Revenu Total,${metrics.overview.totalRevenue.toFixed(2)} €`);
  sections.push(`Dépenses Pub,${metrics.overview.totalSpend.toFixed(2)} €`);
  sections.push(`ROAS,${metrics.overview.roas.toFixed(2)}x`);
  sections.push(`Conversions,${metrics.overview.totalConversions}`);
  sections.push(`CPA,${metrics.overview.cpa.toFixed(2)} €`);
  sections.push(`Panier Moyen,${metrics.overview.aov.toFixed(2)} €`);

  // Campaign section
  sections.push('');
  sections.push('CAMPAGNES');
  sections.push('Campagne,Canal,Dépense,Revenu,Conversions,ROAS,CPA');
  for (const c of metrics.byCampaign) {
    sections.push(
      `${escapeCSV(c.campaignName)},${channelLabels[c.channel]},${c.spend.toFixed(2)},${c.revenue.toFixed(2)},${c.conversions},${c.roas.toFixed(2)},${c.cpa.toFixed(2)}`
    );
  }

  // Revenue by day
  if (metrics.revenueByDay && metrics.revenueByDay.length > 0) {
    sections.push('');
    sections.push('REVENU PAR JOUR');
    sections.push('Date,Revenu,Conversions');
    for (const day of metrics.revenueByDay) {
      sections.push(`${day.date},${day.revenue.toFixed(2)},${day.conversions}`);
    }
  }

  const content = sections.join('\n');
  const date = new Date().toISOString().split('T')[0];
  downloadFile(content, `pixly_rapport_complet_${periodLabel}_${date}.csv`, 'text/csv');
}

// ============ PDF EXPORT ============

/**
 * Export dashboard as PDF using browser print functionality.
 * Opens a styled print-friendly window with the report data.
 */
export function exportDashboardPDF(metrics: DashboardMetrics, periodLabel: string) {
  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow) return;

  const html = buildPDFHTML(metrics, periodLabel);
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();

  // Wait for content to render before triggering print
  setTimeout(() => {
    printWindow.print();
  }, 300);
}

function buildPDFHTML(metrics: DashboardMetrics, periodLabel: string): string {
  const date = new Date().toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const campaignRows = metrics.byCampaign
    .map(
      (c) => `
      <tr>
        <td>${c.campaignName}</td>
        <td>${channelLabels[c.channel]}</td>
        <td class="num">${c.spend.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</td>
        <td class="num">${c.revenue.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</td>
        <td class="num">${c.conversions}</td>
        <td class="num">${c.roas.toFixed(2)}x</td>
        <td class="num">${c.cpa.toFixed(2)} €</td>
      </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Pixly - Rapport ${periodLabel}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1a1a1a; padding: 40px; font-size: 13px; line-height: 1.5; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; border-bottom: 2px solid #111; padding-bottom: 16px; }
    .header h1 { font-size: 24px; font-weight: 700; }
    .header .meta { text-align: right; color: #666; font-size: 12px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
    .kpi { border: 1px solid #e5e5e5; border-radius: 8px; padding: 16px; }
    .kpi .label { font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
    .kpi .value { font-size: 22px; font-weight: 700; margin-top: 4px; }
    h2 { font-size: 16px; font-weight: 600; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #e5e5e5; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
    th { text-align: left; font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; padding: 8px 12px; border-bottom: 2px solid #e5e5e5; }
    td { padding: 8px 12px; border-bottom: 1px solid #f0f0f0; font-size: 12px; }
    td.num, th.num { text-align: right; }
    tr:hover { background: #fafafa; }
    .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e5e5; color: #999; font-size: 10px; text-align: center; }
    @media print {
      body { padding: 20px; }
      .kpi-grid { gap: 8px; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>Pixly</h1>
      <p style="color:#666">Rapport de performance marketing</p>
    </div>
    <div class="meta">
      <p>Période : ${periodLabel}</p>
      <p>Généré le ${date}</p>
    </div>
  </div>

  <div class="kpi-grid">
    <div class="kpi">
      <div class="label">Revenu Total</div>
      <div class="value">${metrics.overview.totalRevenue.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</div>
    </div>
    <div class="kpi">
      <div class="label">ROAS</div>
      <div class="value">${metrics.overview.roas.toFixed(2)}x</div>
    </div>
    <div class="kpi">
      <div class="label">Conversions</div>
      <div class="value">${metrics.overview.totalConversions}</div>
    </div>
    <div class="kpi">
      <div class="label">CPA</div>
      <div class="value">${metrics.overview.cpa.toFixed(2)} €</div>
    </div>
  </div>

  <h2>Performance des Campagnes</h2>
  <table>
    <thead>
      <tr>
        <th>Campagne</th>
        <th>Canal</th>
        <th class="num">Dépense</th>
        <th class="num">Revenu</th>
        <th class="num">Conv.</th>
        <th class="num">ROAS</th>
        <th class="num">CPA</th>
      </tr>
    </thead>
    <tbody>
      ${campaignRows}
    </tbody>
  </table>

  <div class="footer">
    Rapport généré automatiquement par Pixly &mdash; ${date}
  </div>
</body>
</html>`;
}
