import type { CampaignMetrics, Channel } from '@/types';

// ===========================================
// PIXLY - Meta Ads Data Fetching
// Fetches campaign performance from Meta Marketing API
// ===========================================

const META_API_VERSION = 'v18.0';
const META_BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`;

interface MetaCampaignInsight {
  campaign_id: string;
  campaign_name: string;
  spend: string;
  impressions: string;
  clicks: string;
  actions?: Array<{
    action_type: string;
    value: string;
  }>;
  action_values?: Array<{
    action_type: string;
    value: string;
  }>;
}

interface MetaInsightsResponse {
  data: MetaCampaignInsight[];
  paging?: {
    cursors: { before: string; after: string };
    next?: string;
  };
}

interface MetaAdSpendResult {
  totalSpend: number;
  campaigns: CampaignMetrics[];
  impressions: number;
  clicks: number;
}

/**
 * Fetch campaign insights from Meta Marketing API
 */
export async function fetchMetaCampaigns(
  adAccountId: string,
  accessToken: string,
  dateRange: { start: Date; end: Date }
): Promise<MetaAdSpendResult> {
  const since = formatDate(dateRange.start);
  const until = formatDate(dateRange.end);

  // Ensure account ID has act_ prefix
  const accountId = adAccountId.startsWith('act_')
    ? adAccountId
    : `act_${adAccountId}`;

  const fields = [
    'campaign_id',
    'campaign_name',
    'spend',
    'impressions',
    'clicks',
    'actions',
    'action_values',
  ].join(',');

  const params = new URLSearchParams({
    fields,
    time_range: JSON.stringify({ since, until }),
    level: 'campaign',
    access_token: accessToken,
    limit: '500',
  });

  const url = `${META_BASE_URL}/${accountId}/insights?${params}`;

  try {
    const allInsights: MetaCampaignInsight[] = [];
    let nextUrl: string | undefined = url;

    // Handle pagination
    while (nextUrl) {
      const response = await fetch(nextUrl);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData?.error?.message || `Meta API error: ${response.status}`
        );
      }

      const data: MetaInsightsResponse = await response.json();
      allInsights.push(...data.data);
      nextUrl = data.paging?.next;
    }

    return parseMetaInsights(allInsights);
  } catch (error: any) {
    console.error('Failed to fetch Meta campaigns:', error.message);
    throw error;
  }
}

/**
 * Fetch total ad spend for a date range (aggregated)
 */
export async function fetchMetaAdSpend(
  adAccountId: string,
  accessToken: string,
  dateRange: { start: Date; end: Date }
): Promise<number> {
  const since = formatDate(dateRange.start);
  const until = formatDate(dateRange.end);

  const accountId = adAccountId.startsWith('act_')
    ? adAccountId
    : `act_${adAccountId}`;

  const params = new URLSearchParams({
    fields: 'spend',
    time_range: JSON.stringify({ since, until }),
    access_token: accessToken,
  });

  const url = `${META_BASE_URL}/${accountId}/insights?${params}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Meta API error: ${response.status}`);
    }

    const data = await response.json();
    return parseFloat(data.data?.[0]?.spend || '0');
  } catch (error: any) {
    console.error('Failed to fetch Meta ad spend:', error.message);
    return 0;
  }
}

/**
 * Fetch daily spend breakdown for chart data
 */
export async function fetchMetaDailySpend(
  adAccountId: string,
  accessToken: string,
  dateRange: { start: Date; end: Date }
): Promise<Array<{ date: string; spend: number }>> {
  const since = formatDate(dateRange.start);
  const until = formatDate(dateRange.end);

  const accountId = adAccountId.startsWith('act_')
    ? adAccountId
    : `act_${adAccountId}`;

  const params = new URLSearchParams({
    fields: 'spend',
    time_range: JSON.stringify({ since, until }),
    time_increment: '1', // Daily breakdown
    access_token: accessToken,
    limit: '500',
  });

  const url = `${META_BASE_URL}/${accountId}/insights?${params}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Meta API error: ${response.status}`);
    }

    const data = await response.json();
    return (data.data || []).map((day: any) => ({
      date: day.date_start,
      spend: parseFloat(day.spend || '0'),
    }));
  } catch (error: any) {
    console.error('Failed to fetch Meta daily spend:', error.message);
    return [];
  }
}

// ============ HELPERS ============

function parseMetaInsights(insights: MetaCampaignInsight[]): MetaAdSpendResult {
  let totalSpend = 0;
  let totalImpressions = 0;
  let totalClicks = 0;

  const campaigns: CampaignMetrics[] = insights.map((insight) => {
    const spend = parseFloat(insight.spend || '0');
    const impressions = parseInt(insight.impressions || '0', 10);
    const clicks = parseInt(insight.clicks || '0', 10);

    // Extract purchase conversions and revenue from actions
    const conversions = extractActionValue(insight.actions, [
      'offsite_conversion.fb_pixel_purchase',
      'purchase',
      'omni_purchase',
    ]);

    const revenue = extractActionValue(insight.action_values, [
      'offsite_conversion.fb_pixel_purchase',
      'purchase',
      'omni_purchase',
    ]);

    totalSpend += spend;
    totalImpressions += impressions;
    totalClicks += clicks;

    const roas = spend > 0 ? revenue / spend : 0;
    const cpa = conversions > 0 ? spend / conversions : 0;
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;

    return {
      campaignId: insight.campaign_id,
      campaignName: insight.campaign_name,
      channel: 'meta' as Channel,
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

function extractActionValue(
  actions: MetaCampaignInsight['actions'] | MetaCampaignInsight['action_values'],
  actionTypes: string[]
): number {
  if (!actions) return 0;
  const action = actions.find((a) => actionTypes.includes(a.action_type));
  return parseFloat(action?.value || '0');
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}
