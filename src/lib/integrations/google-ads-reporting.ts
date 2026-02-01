import type { CampaignMetrics, Channel } from '@/types';

// ===========================================
// PIXLY - Google Ads Reporting
// Fetches campaign performance from Google Ads API
// ===========================================

const GOOGLE_ADS_API_VERSION = 'v14';
const GOOGLE_ADS_BASE_URL = `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}`;

interface GoogleCampaignRow {
  campaign: {
    id: string;
    name: string;
    status: string;
  };
  metrics: {
    costMicros: string;
    impressions: string;
    clicks: string;
    conversions: number;
    conversionsValue: number;
  };
}

interface GoogleReportResponse {
  results?: GoogleCampaignRow[];
  fieldMask?: string;
  requestId?: string;
}

interface GoogleAdSpendResult {
  totalSpend: number;
  campaigns: CampaignMetrics[];
  impressions: number;
  clicks: number;
}

/**
 * Fetch campaign performance from Google Ads Reporting API
 */
export async function fetchGoogleCampaigns(
  customerId: string,
  accessToken: string,
  dateRange: { start: Date; end: Date }
): Promise<GoogleAdSpendResult> {
  const startDate = formatDate(dateRange.start);
  const endDate = formatDate(dateRange.end);

  // Google Ads Query Language (GAQL)
  const gaqlQuery = `
    SELECT
      campaign.id,
      campaign.name,
      campaign.status,
      metrics.cost_micros,
      metrics.impressions,
      metrics.clicks,
      metrics.conversions,
      metrics.conversions_value
    FROM campaign
    WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
      AND campaign.status != 'REMOVED'
    ORDER BY metrics.cost_micros DESC
  `;

  const url = `${GOOGLE_ADS_BASE_URL}/customers/${customerId}/googleAds:searchStream`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
      },
      body: JSON.stringify({ query: gaqlQuery }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData?.error?.message || `Google Ads API error: ${response.status}`
      );
    }

    // searchStream returns an array of response batches
    const data: GoogleReportResponse[] = await response.json();

    const allRows: GoogleCampaignRow[] = [];
    for (const batch of data) {
      if (batch.results) {
        allRows.push(...batch.results);
      }
    }

    return parseGoogleCampaigns(allRows);
  } catch (error: any) {
    console.error('Failed to fetch Google campaigns:', error.message);
    throw error;
  }
}

/**
 * Fetch total ad spend (aggregated across all campaigns)
 */
export async function fetchGoogleAdSpend(
  customerId: string,
  accessToken: string,
  dateRange: { start: Date; end: Date }
): Promise<number> {
  const startDate = formatDate(dateRange.start);
  const endDate = formatDate(dateRange.end);

  const gaqlQuery = `
    SELECT metrics.cost_micros
    FROM customer
    WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
  `;

  const url = `${GOOGLE_ADS_BASE_URL}/customers/${customerId}/googleAds:searchStream`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
      },
      body: JSON.stringify({ query: gaqlQuery }),
    });

    if (!response.ok) {
      throw new Error(`Google Ads API error: ${response.status}`);
    }

    const data: GoogleReportResponse[] = await response.json();
    const row = data[0]?.results?.[0];
    return microsToEuros(row?.metrics?.costMicros || '0');
  } catch (error: any) {
    console.error('Failed to fetch Google ad spend:', error.message);
    return 0;
  }
}

/**
 * Fetch daily spend breakdown
 */
export async function fetchGoogleDailySpend(
  customerId: string,
  accessToken: string,
  dateRange: { start: Date; end: Date }
): Promise<Array<{ date: string; spend: number }>> {
  const startDate = formatDate(dateRange.start);
  const endDate = formatDate(dateRange.end);

  const gaqlQuery = `
    SELECT
      segments.date,
      metrics.cost_micros
    FROM customer
    WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
    ORDER BY segments.date ASC
  `;

  const url = `${GOOGLE_ADS_BASE_URL}/customers/${customerId}/googleAds:searchStream`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
      },
      body: JSON.stringify({ query: gaqlQuery }),
    });

    if (!response.ok) {
      throw new Error(`Google Ads API error: ${response.status}`);
    }

    const data: GoogleReportResponse[] = await response.json();
    const rows = data.flatMap((batch) => batch.results || []);

    return rows.map((row: any) => ({
      date: row.segments?.date || '',
      spend: microsToEuros(row.metrics?.costMicros || '0'),
    }));
  } catch (error: any) {
    console.error('Failed to fetch Google daily spend:', error.message);
    return [];
  }
}

// ============ HELPERS ============

function parseGoogleCampaigns(rows: GoogleCampaignRow[]): GoogleAdSpendResult {
  let totalSpend = 0;
  let totalImpressions = 0;
  let totalClicks = 0;

  const campaigns: CampaignMetrics[] = rows.map((row) => {
    const spend = microsToEuros(row.metrics.costMicros);
    const impressions = parseInt(row.metrics.impressions || '0', 10);
    const clicks = parseInt(row.metrics.clicks || '0', 10);
    const conversions = row.metrics.conversions || 0;
    const revenue = row.metrics.conversionsValue || 0;

    totalSpend += spend;
    totalImpressions += impressions;
    totalClicks += clicks;

    const roas = spend > 0 ? revenue / spend : 0;
    const cpa = conversions > 0 ? spend / conversions : 0;
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;

    return {
      campaignId: row.campaign.id,
      campaignName: row.campaign.name,
      channel: 'google' as Channel,
      spend,
      revenue,
      conversions,
      roas,
      cpa,
      impressions,
      clicks,
      ctr,
    };
  });

  return {
    totalSpend,
    campaigns,
    impressions: totalImpressions,
    clicks: totalClicks,
  };
}

/**
 * Convert Google Ads micros (millionths) to currency units
 */
function microsToEuros(micros: string): number {
  return parseInt(micros || '0', 10) / 1_000_000;
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}
