import crypto from 'crypto';

// ===========================================
// PIXLY - TikTok Events API
// ===========================================

const TIKTOK_EVENTS_API_URL =
  'https://business-api.tiktok.com/open_api/v1.3/pixel/track/';

// -------------------------------------------
// Types
// -------------------------------------------

export interface TikTokEventPayload {
  pixelCode: string;
  accessToken: string;
  eventName: string; // 'CompletePayment' | 'SubmitForm'
  eventTime: number; // Unix timestamp
  userData: {
    ttclid?: string;
    hashedEmail?: string;
    ip?: string;
    userAgent?: string;
  };
  properties: {
    value: number;
    currency: string;
  };
  pageUrl?: string;
}

interface TikTokApiPayload {
  pixel_code: string;
  event: string;
  timestamp: string;
  context: {
    user_agent: string;
    ip: string;
    ad?: {
      callback: string;
    };
  };
  properties: {
    value: number;
    currency: string;
    contents?: Array<{
      content_type: string;
      content_id: string;
    }>;
  };
  page?: {
    url: string;
  };
  user?: {
    external_id: string;
  };
}

interface TikTokApiResponse {
  code: number;
  message: string;
  data?: Record<string, unknown>;
}

// -------------------------------------------
// Helpers
// -------------------------------------------

/**
 * Hash a value with SHA-256 for PII compliance.
 * TikTok requires: lowercase, trim whitespace, then SHA-256 hex digest.
 */
function hashSHA256(value: string): string {
  if (!value) return '';
  const normalized = value.toLowerCase().trim();
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

/**
 * Check if a string is already a valid SHA-256 hex digest (64 hex chars).
 */
function isAlreadyHashed(value: string): boolean {
  return /^[a-f0-9]{64}$/.test(value);
}

/**
 * Ensure an email value is hashed. If already hashed, return as-is.
 */
function ensureHashedEmail(email: string): string {
  if (!email) return '';
  return isAlreadyHashed(email) ? email : hashSHA256(email);
}

/**
 * Format a Unix timestamp (seconds) as an ISO 8601 string for TikTok.
 */
function formatTimestamp(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toISOString();
}

/**
 * Build the TikTok Events API payload from our internal payload format.
 */
function buildApiPayload(payload: TikTokEventPayload): TikTokApiPayload {
  const apiPayload: TikTokApiPayload = {
    pixel_code: payload.pixelCode,
    event: payload.eventName,
    timestamp: formatTimestamp(payload.eventTime),
    context: {
      user_agent: payload.userData.userAgent || '',
      ip: payload.userData.ip || '',
    },
    properties: {
      value: payload.properties.value,
      currency: payload.properties.currency.toUpperCase(),
    },
  };

  // Attach ttclid if present (ad click identifier)
  if (payload.userData.ttclid) {
    apiPayload.context.ad = {
      callback: payload.userData.ttclid,
    };
  }

  // Attach page URL if provided
  if (payload.pageUrl) {
    apiPayload.page = {
      url: payload.pageUrl,
    };
  }

  // Attach hashed email as external_id for user matching
  if (payload.userData.hashedEmail) {
    apiPayload.user = {
      external_id: ensureHashedEmail(payload.userData.hashedEmail),
    };
  }

  return apiPayload;
}

// -------------------------------------------
// Main export
// -------------------------------------------

/**
 * Send a conversion event to TikTok's Events API.
 *
 * @param payload - The event data to send
 * @returns An object indicating success or failure with an optional error message
 */
export async function sendTikTokEvent(
  payload: TikTokEventPayload
): Promise<{ success: boolean; error?: string }> {
  // Validate required fields
  if (!payload.pixelCode) {
    return { success: false, error: 'Missing pixel_code' };
  }
  if (!payload.accessToken) {
    return { success: false, error: 'Missing access_token' };
  }
  if (!payload.eventName) {
    return { success: false, error: 'Missing event name' };
  }

  const apiPayload = buildApiPayload(payload);

  try {
    const response = await fetch(TIKTOK_EVENTS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Token': payload.accessToken,
      },
      body: JSON.stringify(apiPayload),
    });

    const result: TikTokApiResponse = await response.json();

    // TikTok uses code 0 for success
    if (result.code !== 0) {
      return {
        success: false,
        error: result.message || `TikTok API error (code ${result.code})`,
      };
    }

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to send event to TikTok Events API',
    };
  }
}
