import { NextRequest, NextResponse } from 'next/server';
import {
  authenticateApiRequest,
  requirePermission,
  handleCors,
  apiResponse,
  apiError,
  parsePeriod,
} from '@/lib/api/middleware';
import { getDateRange, fetchConversions } from '@/lib/analytics/metrics';

// ===========================================
// PIXLY - Public API: Conversions
// GET /api/v1/conversions?period=30d&limit=100&offset=0
// ===========================================

const MAX_LIMIT = 500;
const DEFAULT_LIMIT = 100;

export async function OPTIONS() {
  return handleCors();
}

export async function GET(request: NextRequest) {
  // 1. Authenticate
  const auth = await authenticateApiRequest(request);
  if (auth instanceof NextResponse) return auth;

  // 2. Check permission
  const denied = requirePermission(auth.permissions, 'read:conversions');
  if (denied) return denied;

  // 3. Parse query params
  const { searchParams } = new URL(request.url);
  const period = parsePeriod(searchParams);

  let limit = parseInt(searchParams.get('limit') || '', 10);
  if (isNaN(limit) || limit < 1) limit = DEFAULT_LIMIT;
  if (limit > MAX_LIMIT) limit = MAX_LIMIT;

  let offset = parseInt(searchParams.get('offset') || '', 10);
  if (isNaN(offset) || offset < 0) offset = 0;

  const typeFilter = searchParams.get('type'); // 'lead' | 'purchase' | null

  if (typeFilter && typeFilter !== 'lead' && typeFilter !== 'purchase') {
    return apiError(
      'INVALID_PARAMETER',
      'The "type" parameter must be "lead" or "purchase".',
      400
    );
  }

  try {
    // 4. Fetch conversions
    const dateRange = getDateRange(period);
    const allConversions = await fetchConversions(auth.workspaceId, dateRange);

    // 5. Apply type filter
    const filtered = typeFilter
      ? allConversions.filter((c) => c.type === typeFilter)
      : allConversions;

    // 6. Paginate
    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + limit);

    // 7. Shape the public response
    const conversions = paginated.map((c) => ({
      id: c.id,
      type: c.type,
      value: c.value,
      currency: c.currency,
      timestamp: c.timestamp.toISOString(),
      attribution: c.attribution
        ? {
            model: c.attribution.model,
            touchpoints: c.attribution.touchpoints.map((t) => ({
              channel: t.channel,
              source: t.source,
              medium: t.medium,
              campaign: t.campaign,
              credit: t.credit,
            })),
          }
        : null,
    }));

    return apiResponse({
      success: true,
      data: {
        period,
        conversions,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      },
    });
  } catch (error) {
    console.error('API v1 /conversions error:', error);
    return apiError(
      'INTERNAL_ERROR',
      'An error occurred while fetching conversions.',
      500
    );
  }
}
