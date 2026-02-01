import type { CampaignMetrics } from '@/types';

// ===========================================
// PIXLY - TikTok Ads Reporting
// Fetch campaign metrics from TikTok Marketing API
// ===========================================

const TIKTOK_API_VERSION = 'v1.3';

interface TikTokReportResponse {
  code: number;
  message: string;
  request_id: string;
  data?: {
    list: Array<{
      dimensions: {
        campaign_id: string;
      };
      metrics: {
        campaign_name: string;
        spend: string;
        impressions: string;
        clicks: string;
        conversion: string;
        ctr: string;
        cpc: string;
        cpm: string;
      };
    }>;
    page_info?: {
      total_number: number;
      page: number;
      page_size: number;
      total_page: number;
    };
  };
}

interface TikTokCampaignResult {
  totalSpend: number;
  impressions: number;
  clicks: number;
  campaigns: CampaignMetrics[];
}

/**
 * Fetch TikTok campaign data for a date range
 */
export async function fetchTikTokCampaigns(
  advertiserId: string,
  accessToken: string,
  dateRange: { start: Date; end: Date }
): Promise<TikTokCampaignResult | null> {
  try {
    const startDate = formatDate(dateRange.start);
    const endDate = formatDate(dateRange.end);

    const params = new URLSearchParams({
      advertiser_id: advertiserId,
      start_date: startDate,
      end_date: endDate,
      data_level: 'AUCTION_CAMPAIGN',
      page_size: '200',
      report_type: 'BASIC',
      metrics: JSON.stringify([
        'spend',
        'impressions',
        'clicks',
        'conversion',
        'ctr',
        'cpc',
        'cpm',
        'campaign_name',
      ]),
      dimensions: JSON.stringify(['campaign_id']),
    });

    const response = await fetch(
      `https://business-api.tiktok.com/open_api/${TIKTOK_API_VERSION}/report/integrated/get/?${params}`,
      {
        method: 'GET',
        headers: {
          'Access-Token': accessToken,
        },
      }
    );

    const result: TikTokReportResponse = await response.json();

    if (result.code !== 0 || !result.data?.list) {
      console.error('TikTok reporting error:', result.message);
      return null;
    }

    let totalSpend = 0;
    let totalImpressions = 0;
    let totalClicks = 0;

    const campaigns: CampaignMetrics[] = result.data.list.map((item) => {
      const spend = parseFloat(item.metrics.spend) || 0;
      const impressions = parseInt(item.metrics.impressions) || 0;
      const clicks = parseInt(item.metrics.clicks) || 0;
      const conversions = parseInt(item.metrics.conversion) || 0;

      totalSpend += spend;
      totalImpressions += impressions;
      totalClicks += clicks;

      return {
        campaignId: item.dimensions.campaign_id,
        campaignName: item.metrics.campaign_name,
        channel: 'tiktok' as const,
        spend,
        revenue: 0, // Will be calculated from attributed conversions
        conversions,
        roas: 0, // Will be calculated
        cpa: conversions > 0 ? spend / conversions : 0,
        impressions,
        clicks,
        ctr: parseFloat(item.metrics.ctr) || 0,
      };
    });

    return {
      totalSpend,
      impressions: totalImpressions,
      clicks: totalClicks,
      campaigns,
    };
  } catch (error) {
    console.error('Failed to fetch TikTok campaigns:', error);
    return null;
  }
}

/**
 * Get TikTok ad account information
 */
export async function getTikTokAccountInfo(
  advertiserId: string,
  accessToken: string
): Promise<{ name: string; status: string } | null> {
  try {
    const response = await fetch(
      `https://business-api.tiktok.com/open_api/${TIKTOK_API_VERSION}/advertiser/info/?advertiser_ids=${JSON.stringify([advertiserId])}`,
      {
        method: 'GET',
        headers: {
          'Access-Token': accessToken,
        },
      }
    );

    const result = await response.json();

    if (result.code === 0 && result.data?.list?.[0]) {
      return {
        name: result.data.list[0].advertiser_name,
        status: result.data.list[0].status,
      };
    }

    return null;
  } catch (error) {
    console.error('Failed to get TikTok account info:', error);
    return null;
  }
}

/**
 * Format date for TikTok API (YYYY-MM-DD)
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
