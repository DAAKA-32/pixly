import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/api/keys';
import { adminDb } from '@/lib/firebase/admin';
import { getPlanLimits } from '@/lib/plans/features';
import type { ApiPermission, Plan } from '@/types';

// ===========================================
// PIXLY - Public API Middleware
// Shared authentication & CORS helpers for
// all /api/v1/* endpoints.
// ===========================================

/**
 * Standard CORS headers for external API access.
 */
export const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Access-Control-Max-Age': '86400',
};

/**
 * Handle CORS preflight requests.
 * Call this at the top of every API route's OPTIONS handler.
 */
export function handleCors(): NextResponse {
  return NextResponse.json(null, { status: 204, headers: corsHeaders });
}

/**
 * Build a JSON response with CORS headers.
 */
export function apiResponse<T>(data: T, status: number = 200): NextResponse {
  return NextResponse.json(data, { status, headers: corsHeaders });
}

/**
 * Build a JSON error response with CORS headers.
 */
export function apiError(
  code: string,
  message: string,
  status: number,
  details?: Record<string, unknown>
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: { code, message, ...(details ? { details } : {}) },
    },
    { status, headers: corsHeaders }
  );
}

/**
 * Authenticate an incoming API request using a Bearer token.
 *
 * Returns either the authenticated context (workspaceId + permissions)
 * or a ready-to-send NextResponse error.
 *
 * Usage in a route handler:
 * ```ts
 * const auth = await authenticateApiRequest(request);
 * if (auth instanceof NextResponse) return auth;
 * const { workspaceId, permissions } = auth;
 * ```
 */
export async function authenticateApiRequest(
  request: NextRequest
): Promise<{ workspaceId: string; permissions: ApiPermission[] } | NextResponse> {
  const authHeader = request.headers.get('authorization');

  if (!authHeader) {
    return apiError(
      'MISSING_AUTH',
      'Authorization header is required. Use: Authorization: Bearer pk_live_...',
      401
    );
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return apiError(
      'INVALID_AUTH_FORMAT',
      'Authorization header must use Bearer scheme: Bearer pk_live_...',
      401
    );
  }

  const apiKey = parts[1];

  try {
    const result = await validateApiKey(apiKey);

    if (!result.valid || !result.workspaceId || !result.permissions) {
      return apiError('INVALID_API_KEY', 'The provided API key is invalid or expired.', 401);
    }

    // Verify the workspace owner's plan allows API access
    const workspaceDoc = await adminDb.collection('workspaces').doc(result.workspaceId).get();
    if (workspaceDoc.exists) {
      const ownerId = workspaceDoc.data()?.ownerId;
      if (ownerId) {
        const userDoc = await adminDb.collection('users').doc(ownerId).get();
        const plan = (userDoc.data()?.plan as Plan) || 'free';
        if (!getPlanLimits(plan).apiAccess) {
          return apiError('PLAN_UPGRADE_REQUIRED', 'API access requires a Growth plan or higher.', 403);
        }
      }
    }

    return {
      workspaceId: result.workspaceId,
      permissions: result.permissions,
    };
  } catch (error) {
    console.error('API key validation error:', error);
    return apiError('AUTH_ERROR', 'An error occurred during authentication.', 500);
  }
}

/**
 * Check whether the authenticated permissions include a required permission.
 * Returns `null` if allowed, or a 403 NextResponse if denied.
 */
export function requirePermission(
  permissions: ApiPermission[],
  required: ApiPermission
): NextResponse | null {
  if (!permissions.includes(required)) {
    return apiError(
      'INSUFFICIENT_PERMISSIONS',
      `This API key does not have the "${required}" permission.`,
      403
    );
  }
  return null;
}

/**
 * Parse and validate a `period` query parameter.
 * Defaults to '30d' if not provided.
 */
export function parsePeriod(
  searchParams: URLSearchParams
): '7d' | '30d' | '90d' {
  const raw = searchParams.get('period');
  if (raw === '7d' || raw === '30d' || raw === '90d') {
    return raw;
  }
  return '30d';
}
