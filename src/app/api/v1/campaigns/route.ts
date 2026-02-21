import { NextRequest, NextResponse } from 'next/server';
import {
  authenticateApiRequest,
  requirePermission,
  handleCors,
  apiResponse,
  apiError,
  parsePeriod,
} from '@/lib/api/middleware';
import { getDashboardMetrics } from '@/lib/analytics/metrics';
import type { Channel } from '@/types';

// ===========================================
// PIXLY - Public API: Campaigns
// GET /api/v1/campaigns?period=30d&channel=meta
// ===========================================

const VALID_CHANNELS: Channel[] = [
  'meta', 'google', 'tiktok', 'linkedin', 'bing',
  'organic', 'direct', 'email', 'referral', 'other',
];

export async function OPTIONS() {
  return handleCors();
}

export async function GET(request: NextRequest) {
  // 1. Authenticate
  const auth = await authenticateApiRequest(request);
  if (auth instanceof NextResponse) return auth;

  // 2. Check permission
  const denied = requirePermission(auth.permissions, 'read:campaigns');
  if (denied) return denied;

  // 3. Parse query params
  const { searchParams } = new URL(request.url);
  const period = parsePeriod(searchParams);
  const channelFilter = searchParams.get('channel') as Channel | null;

  if (channelFilter && !VALID_CHANNELS.includes(channelFilter)) {
    return apiError(
      'INVALID_PARAMETER',
      `Invalid channel "${channelFilter}". Must be one of: ${VALID_CHANNELS.join(', ')}`,
      400
    );
  }

  const sortBy = searchParams.get('sort') || 'revenue';
  const validSorts = ['revenue', 'conversions', 'spend', 'roas', 'cpa'];
  if (!validSorts.includes(sortBy)) {
    return apiError(
      'INVALID_PARAMETER',
      `Invalid sort field "${sortBy}". Must be one of: ${validSorts.join(', ')}`,
      400
    );
  }

  let limit = parseInt(searchParams.get('limit') || '', 10);
  if (isNaN(limit) || limit < 1) limit = 50;
  if (limit > 200) limit = 200;

  try {
    // 4. Fetch full metrics (campaigns are computed from conversions)
    const metrics = await getDashboardMetrics(auth.workspaceId, period);

    // 5. Filter by channel
    let campaigns = metrics.byCampaign;
    if (channelFilter) {
      campaigns = campaigns.filter((c) => c.channel === channelFilter);
    }

    // 6. Sort
    campaigns = [...campaigns].sort((a, b) => {
      const aVal = a[sortBy as keyof typeof a] as number;
      const bVal = b[sortBy as keyof typeof b] as number;
      return bVal - aVal; // descending
    });

    // 7. Limit
    const total = campaigns.length;
    campaigns = campaigns.slice(0, limit);

    // 8. Shape the public response
    const data = campaigns.map((c) => ({
      campaignId: c.campaignId,
      campaignName: c.campaignName,
      channel: c.channel,
      spend: c.spend,
      revenue: c.revenue,
      conversions: c.conversions,
      roas: c.roas,
      cpa: c.cpa,
      impressions: c.impressions,
      clicks: c.clicks,
      ctr: c.ctr,
    }));

    return apiResponse({
      success: true,
      data: {
        period,
        ...(channelFilter ? { channel: channelFilter } : {}),
        campaigns: data,
        total,
      },
    });
  } catch (error) {
    console.error('API v1 /campaigns error:', error);
    return apiError(
      'INTERNAL_ERROR',
      'An error occurred while fetching campaigns.',
      500
    );
  }
}
