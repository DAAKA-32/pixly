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

// ===========================================
// PIXLY - Public API: Metrics
// GET /api/v1/metrics?period=30d
// ===========================================

export async function OPTIONS() {
  return handleCors();
}

export async function GET(request: NextRequest) {
  // 1. Authenticate
  const auth = await authenticateApiRequest(request);
  if (auth instanceof NextResponse) return auth;

  // 2. Check permission
  const denied = requirePermission(auth.permissions, 'read:metrics');
  if (denied) return denied;

  // 3. Parse query params
  const { searchParams } = new URL(request.url);
  const period = parsePeriod(searchParams);

  try {
    // 4. Fetch metrics using existing service
    const metrics = await getDashboardMetrics(auth.workspaceId, period);

    // 5. Shape the public response
    const channelBreakdown = Object.entries(metrics.byChannel)
      .filter(([, data]) => data.conversions > 0 || data.spend > 0 || data.revenue > 0)
      .map(([channel, data]) => ({
        channel,
        spend: data.spend,
        revenue: data.revenue,
        conversions: data.conversions,
        roas: data.roas,
        cpa: data.cpa,
        impressions: data.impressions,
        clicks: data.clicks,
        ctr: data.ctr,
      }));

    const campaigns = metrics.byCampaign.map((c) => ({
      campaignId: c.campaignId,
      campaignName: c.campaignName,
      channel: c.channel,
      spend: c.spend,
      revenue: c.revenue,
      conversions: c.conversions,
      roas: c.roas,
      cpa: c.cpa,
    }));

    return apiResponse({
      success: true,
      data: {
        period,
        overview: metrics.overview,
        channels: channelBreakdown,
        campaigns,
        revenueByDay: metrics.revenueByDay || [],
      },
    });
  } catch (error) {
    console.error('API v1 /metrics error:', error);
    return apiError(
      'INTERNAL_ERROR',
      'An error occurred while fetching metrics.',
      500
    );
  }
}
