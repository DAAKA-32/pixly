import { adminDb } from '@/lib/firebase/admin';
import type { ScheduledReport, OverviewMetrics, Channel } from '@/types';

// ===========================================
// PIXLY - Scheduled Reports Service (Phase 3.3)
// Create, manage, and generate automated email reports
// ===========================================

// ============ TYPES ============

export interface ReportContent {
  subject: string;
  htmlBody: string;
  csvAttachment: string;
}

interface ReportMetricRow {
  label: string;
  value: string;
  change?: string;
}

// ============ CRUD OPERATIONS ============

/**
 * Create a new scheduled report configuration
 */
export async function createScheduledReport(
  report: Omit<ScheduledReport, 'id' | 'createdAt' | 'lastSentAt'>
): Promise<ScheduledReport> {
  const docRef = adminDb.collection('scheduled_reports').doc();

  const now = new Date();
  const scheduledReport: ScheduledReport = {
    id: docRef.id,
    ...report,
    lastSentAt: null,
    createdAt: now,
  };

  await docRef.set({
    ...scheduledReport,
    createdAt: now,
    lastSentAt: null,
  });

  return scheduledReport;
}

/**
 * Retrieve all scheduled reports for a workspace
 */
export async function getScheduledReports(
  workspaceId: string
): Promise<ScheduledReport[]> {
  const snapshot = await adminDb
    .collection('scheduled_reports')
    .where('workspaceId', '==', workspaceId)
    .orderBy('createdAt', 'desc')
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      workspaceId: data.workspaceId,
      name: data.name,
      frequency: data.frequency,
      recipients: data.recipients,
      metrics: data.metrics,
      enabled: data.enabled,
      lastSentAt: data.lastSentAt?.toDate?.() ?? data.lastSentAt ?? null,
      nextSendAt: data.nextSendAt?.toDate?.() ?? data.nextSendAt ?? new Date(),
      createdAt: data.createdAt?.toDate?.() ?? data.createdAt ?? new Date(),
    } as ScheduledReport;
  });
}

/**
 * Update an existing scheduled report
 */
export async function updateScheduledReport(
  reportId: string,
  updates: Partial<ScheduledReport>
): Promise<void> {
  const docRef = adminDb.collection('scheduled_reports').doc(reportId);
  const doc = await docRef.get();

  if (!doc.exists) {
    throw new Error(`Rapport planifié introuvable : ${reportId}`);
  }

  // Strip id and createdAt from updates — immutable fields
  const { id: _id, createdAt: _createdAt, ...safeUpdates } = updates;
  await docRef.update({
    ...safeUpdates,
    updatedAt: new Date(),
  });
}

/**
 * Delete a scheduled report
 */
export async function deleteScheduledReport(
  reportId: string
): Promise<void> {
  const docRef = adminDb.collection('scheduled_reports').doc(reportId);
  const doc = await docRef.get();

  if (!doc.exists) {
    throw new Error(`Rapport planifié introuvable : ${reportId}`);
  }

  await docRef.delete();
}

// ============ REPORT GENERATION ============

/**
 * Generate the full report content (subject, HTML email, CSV)
 * for a given workspace and set of metrics.
 *
 * The actual email sending would use a service like SendGrid or Resend.
 * For now, this prepares the content and logs it.
 */
export async function generateReportContent(
  workspaceId: string,
  metrics: string[]
): Promise<ReportContent> {
  // Fetch raw conversion data for the last reporting period
  const { overview, dateLabel } = await fetchReportData(workspaceId);

  // Build metric rows based on requested metrics
  const rows = buildMetricRows(overview, metrics);

  const subject = `Pixly — Rapport ${dateLabel}`;
  const htmlBody = buildHtmlEmail(rows, dateLabel, workspaceId);
  const csvAttachment = buildCsvAttachment(rows, dateLabel);

  console.log(`[ScheduledReports] Generated report for workspace ${workspaceId}: ${subject}`);

  return { subject, htmlBody, csvAttachment };
}

// ============ SCHEDULING HELPERS ============

/**
 * Calculate the next send date based on frequency
 */
export function calculateNextSendAt(
  frequency: ScheduledReport['frequency'],
  fromDate: Date = new Date()
): Date {
  const next = new Date(fromDate);

  switch (frequency) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      next.setHours(8, 0, 0, 0); // 08:00 local
      break;
    case 'weekly':
      // Next Monday at 08:00
      next.setDate(next.getDate() + ((8 - next.getDay()) % 7 || 7));
      next.setHours(8, 0, 0, 0);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      next.setDate(1);
      next.setHours(8, 0, 0, 0);
      break;
  }

  return next;
}

/**
 * Get all reports that are due to be sent now
 */
export async function getDueReports(): Promise<ScheduledReport[]> {
  const now = new Date();

  const snapshot = await adminDb
    .collection('scheduled_reports')
    .where('enabled', '==', true)
    .where('nextSendAt', '<=', now)
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      workspaceId: data.workspaceId,
      name: data.name,
      frequency: data.frequency,
      recipients: data.recipients,
      metrics: data.metrics,
      enabled: data.enabled,
      lastSentAt: data.lastSentAt?.toDate?.() ?? null,
      nextSendAt: data.nextSendAt?.toDate?.() ?? new Date(),
      createdAt: data.createdAt?.toDate?.() ?? new Date(),
    } as ScheduledReport;
  });
}

/**
 * Mark a report as sent and schedule the next send
 */
export async function markReportSent(reportId: string): Promise<void> {
  const docRef = adminDb.collection('scheduled_reports').doc(reportId);
  const doc = await docRef.get();

  if (!doc.exists) return;

  const data = doc.data()!;
  const nextSendAt = calculateNextSendAt(data.frequency);

  await docRef.update({
    lastSentAt: new Date(),
    nextSendAt,
    updatedAt: new Date(),
  });
}

// ============ INTERNAL HELPERS ============

/**
 * Fetch aggregated data for the report.
 * Uses the conversions collection to build an overview.
 */
async function fetchReportData(
  workspaceId: string
): Promise<{ overview: OverviewMetrics; dateLabel: string }> {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 7);
  start.setHours(0, 0, 0, 0);

  const dateLabel = `${formatReportDate(start)} — ${formatReportDate(end)}`;

  // Fetch conversions for the period
  const conversionsSnap = await adminDb
    .collection('conversions')
    .where('workspaceId', '==', workspaceId)
    .where('timestamp', '>=', start)
    .where('timestamp', '<=', end)
    .get();

  let totalRevenue = 0;
  let totalConversions = 0;
  let purchaseCount = 0;

  conversionsSnap.docs.forEach((doc) => {
    const data = doc.data();
    totalConversions++;
    if (data.type === 'purchase') {
      totalRevenue += data.value || 0;
      purchaseCount++;
    }
  });

  const overview: OverviewMetrics = {
    totalSpend: 0, // Would need ad platform data
    totalRevenue,
    totalConversions,
    roas: 0,
    cpa: 0,
    conversionRate: 0,
    aov: purchaseCount > 0 ? totalRevenue / purchaseCount : 0,
  };

  return { overview, dateLabel };
}

/**
 * Build metric rows from overview data based on requested metrics
 */
function buildMetricRows(
  overview: OverviewMetrics,
  requestedMetrics: string[]
): ReportMetricRow[] {
  const allMetrics: Record<string, ReportMetricRow> = {
    revenue: {
      label: 'Chiffre d\'affaires',
      value: formatEur(overview.totalRevenue),
    },
    conversions: {
      label: 'Conversions',
      value: overview.totalConversions.toString(),
    },
    spend: {
      label: 'Dépenses publicitaires',
      value: formatEur(overview.totalSpend),
    },
    roas: {
      label: 'ROAS',
      value: `${overview.roas.toFixed(2)}x`,
    },
    cpa: {
      label: 'CPA',
      value: formatEur(overview.cpa),
    },
    aov: {
      label: 'Panier moyen',
      value: formatEur(overview.aov),
    },
    conversionRate: {
      label: 'Taux de conversion',
      value: `${(overview.conversionRate * 100).toFixed(1)} %`,
    },
  };

  // Return only requested metrics, or all if none specified
  const keys = requestedMetrics.length > 0
    ? requestedMetrics.filter((m) => m in allMetrics)
    : Object.keys(allMetrics);

  return keys.map((key) => allMetrics[key]);
}

/**
 * Build the HTML email body with KPI summary
 */
function buildHtmlEmail(
  rows: ReportMetricRow[],
  dateLabel: string,
  workspaceId: string
): string {
  const kpiRows = rows
    .map(
      (row) => `
        <tr>
          <td style="padding: 12px 16px; border-bottom: 1px solid #f3f4f6; font-size: 14px; color: #6b7280;">
            ${row.label}
          </td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #f3f4f6; font-size: 14px; font-weight: 600; color: #111827; text-align: right;">
            ${row.value}
          </td>
        </tr>`
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Rapport Pixly</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 32px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.06);">
          <!-- Header -->
          <tr>
            <td style="background-color: #10b981; padding: 24px 32px;">
              <h1 style="margin: 0; font-size: 20px; font-weight: 600; color: #ffffff; letter-spacing: -0.01em;">
                Pixly
              </h1>
              <p style="margin: 8px 0 0; font-size: 13px; color: rgba(255,255,255,0.85);">
                Rapport automatique
              </p>
            </td>
          </tr>
          <!-- Period -->
          <tr>
            <td style="padding: 24px 32px 8px;">
              <p style="margin: 0; font-size: 13px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em;">
                Période
              </p>
              <p style="margin: 4px 0 0; font-size: 15px; color: #374151; font-weight: 500;">
                ${dateLabel}
              </p>
            </td>
          </tr>
          <!-- KPI Table -->
          <tr>
            <td style="padding: 16px 32px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <thead>
                  <tr>
                    <th style="padding: 10px 16px; background-color: #f9fafb; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; text-align: left; font-weight: 500;">
                      Indicateur
                    </th>
                    <th style="padding: 10px 16px; background-color: #f9fafb; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; text-align: right; font-weight: 500;">
                      Valeur
                    </th>
                  </tr>
                </thead>
                <tbody>
                  ${kpiRows}
                </tbody>
              </table>
            </td>
          </tr>
          <!-- CTA -->
          <tr>
            <td style="padding: 0 32px 32px;" align="center">
              <a href="https://pixly.app/dashboard" style="display: inline-block; padding: 10px 24px; background-color: #10b981; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500;">
                Voir le tableau de bord
              </a>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 16px 32px; border-top: 1px solid #f3f4f6;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af; text-align: center;">
                Ce rapport a été généré automatiquement par Pixly.
                <br />
                Workspace : ${workspaceId}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

/**
 * Build CSV attachment content from metric rows
 */
function buildCsvAttachment(
  rows: ReportMetricRow[],
  dateLabel: string
): string {
  const header = 'Indicateur,Valeur';
  const dataRows = rows.map((row) => `"${row.label}","${row.value}"`);

  return [
    `# Rapport Pixly — ${dateLabel}`,
    '',
    header,
    ...dataRows,
  ].join('\n');
}

/**
 * Format a number as EUR for email display
 */
function formatEur(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format a date for report headers (e.g. "7 fév. 2026")
 */
function formatReportDate(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}
