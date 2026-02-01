import { NextRequest, NextResponse } from 'next/server';
import { getValidToken, getIntegrationState } from '@/lib/integrations/token-manager';
import { fetchMetaCampaigns } from '@/lib/integrations/meta-ads';
import { fetchGoogleCampaigns } from '@/lib/integrations/google-ads-reporting';
import { fetchTikTokCampaigns } from '@/lib/integrations/tiktok-ads-reporting';
import type { CampaignMetrics, Channel } from '@/types';

// ===========================================
// PIXLY - Ad Data API Route
// Fetches campaign data from all connected platforms
// ===========================================

interface AdDataResponse {
  adSpend: Record<Channel, number>;
  campaigns: CampaignMetrics[];
  channelMetrics: Record<string, {
    impressions: number;
    clicks: number;
    spend: number;
  }>;
}

export async function GET(request: NextRequest) {
  const workspaceId = request.nextUrl.searchParams.get('workspaceId');
  const period = request.nextUrl.searchParams.get('period') || '30d';

  if (!workspaceId) {
    return NextResponse.json(
      { error: 'workspaceId is required' },
      { status: 400 }
    );
  }

  const dateRange = getDateRange(period);

  const result: AdDataResponse = {
    adSpend: {
      meta: 0, google: 0, tiktok: 0, linkedin: 0, bing: 0,
      organic: 0, direct: 0, email: 0, referral: 0, other: 0,
    },
    campaigns: [],
    channelMetrics: {},
  };

  // Fetch from all connected platforms in parallel
  const [metaResult, googleResult, tiktokResult] = await Promise.allSettled([
    fetchMetaData(workspaceId, dateRange),
    fetchGoogleData(workspaceId, dateRange),
    fetchTikTokData(workspaceId, dateRange),
  ]);

  // Merge Meta results
  if (metaResult.status === 'fulfilled' && metaResult.value) {
    result.adSpend.meta = metaResult.value.totalSpend;
    result.campaigns.push(...metaResult.value.campaigns);
    result.channelMetrics.meta = {
      impressions: metaResult.value.impressions,
      clicks: metaResult.value.clicks,
      spend: metaResult.value.totalSpend,
    };
  }

  // Merge Google results
  if (googleResult.status === 'fulfilled' && googleResult.value) {
    result.adSpend.google = googleResult.value.totalSpend;
    result.campaigns.push(...googleResult.value.campaigns);
    result.channelMetrics.google = {
      impressions: googleResult.value.impressions,
      clicks: googleResult.value.clicks,
      spend: googleResult.value.totalSpend,
    };
  }

  // Merge TikTok results
  if (tiktokResult.status === 'fulfilled' && tiktokResult.value) {
    result.adSpend.tiktok = tiktokResult.value.totalSpend;
    result.campaigns.push(...tiktokResult.value.campaigns);
    result.channelMetrics.tiktok = {
      impressions: tiktokResult.value.impressions,
      clicks: tiktokResult.value.clicks,
      spend: tiktokResult.value.totalSpend,
    };
  }

  return NextResponse.json(result);
}

// ============ PLATFORM FETCHERS ============

async function fetchMetaData(
  workspaceId: string,
  dateRange: { start: Date; end: Date }
) {
  const state = await getIntegrationState(workspaceId, 'meta');
  if (!state?.connected || !state.accountId) return null;

  const accessToken = await getValidToken(workspaceId, 'meta');
  if (!accessToken) return null;

  return fetchMetaCampaigns(state.accountId, accessToken, dateRange);
}

async function fetchGoogleData(
  workspaceId: string,
  dateRange: { start: Date; end: Date }
) {
  const state = await getIntegrationState(workspaceId, 'google');
  if (!state?.connected || !state.accountId) return null;

  const accessToken = await getValidToken(workspaceId, 'google');
  if (!accessToken) return null;

  return fetchGoogleCampaigns(state.accountId, accessToken, dateRange);
}

async function fetchTikTokData(
  workspaceId: string,
  dateRange: { start: Date; end: Date }
) {
  const state = await getIntegrationState(workspaceId, 'tiktok');
  if (!state?.connected || !state.accountId) return null;

  const accessToken = await getValidToken(workspaceId, 'tiktok');
  if (!accessToken) return null;

  return fetchTikTokCampaigns(state.accountId, accessToken, dateRange);
}

// ============ HELPERS ============

function getDateRange(period: string): { start: Date; end: Date } {
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const start = new Date();
  start.setHours(0, 0, 0, 0);

  switch (period) {
    case '7d':
      start.setDate(start.getDate() - 7);
      break;
    case '90d':
      start.setDate(start.getDate() - 90);
      break;
    case '30d':
    default:
      start.setDate(start.getDate() - 30);
      break;
  }

  return { start, end };
}
