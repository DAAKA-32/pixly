import crypto from 'crypto';

// ===========================================
// PIXLY - Meta Conversions API Integration
// ===========================================

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MetaCAPIPayload {
  pixelId: string;
  accessToken: string;
  eventName: string; // 'Purchase' | 'Lead'
  eventTime: number; // Unix timestamp
  userData: {
    fbclid?: string;
    hashedEmail?: string;
    clientIpAddress?: string;
    clientUserAgent?: string;
  };
  customData: {
    value: number;
    currency: string;
  };
  eventSourceUrl?: string;
}

interface MetaEventPayload {
  event_name: string;
  event_time: number;
  action_source: 'website';
  event_source_url?: string;
  user_data: {
    em?: string;
    fbc?: string;
    client_ip_address?: string;
    client_user_agent?: string;
  };
  custom_data: {
    value: number;
    currency: string;
  };
}

interface MetaAPIResponse {
  events_received: number;
  messages?: string[];
  fbtrace_id: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Hash a value with SHA-256 after normalizing (lowercase + trim).
 * Returns the hex digest. Returns an empty string if the input is falsy.
 */
function hashSHA256(value: string): string {
  if (!value) return '';
  const normalized = value.toLowerCase().trim();
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

/**
 * Format a raw fbclid into the fbc cookie format expected by Meta CAPI.
 * Format: fb.1.{timestamp_ms}.{fbclid}
 */
function formatFbc(fbclid: string): string {
  return `fb.1.${Date.now()}.${fbclid}`;
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Send a single conversion event to Meta's Conversions API (CAPI).
 *
 * Endpoint: https://graph.facebook.com/v18.0/{pixelId}/events
 *
 * - Hashes email (if provided) with SHA-256 (normalized: lowercase + trim)
 * - Converts raw fbclid to fbc format: fb.1.{timestamp}.{fbclid}
 * - Returns a structured result with success flag and optional error message
 */
export async function sendConversionToMeta(
  payload: MetaCAPIPayload
): Promise<{ success: boolean; error?: string }> {
  const {
    pixelId,
    accessToken,
    eventName,
    eventTime,
    userData,
    customData,
    eventSourceUrl,
  } = payload;

  // Build user_data object
  const userDataPayload: MetaEventPayload['user_data'] = {};

  // Hash email if provided (normalize: lowercase, trim, then SHA-256)
  if (userData.hashedEmail) {
    userDataPayload.em = hashSHA256(userData.hashedEmail);
  }

  // Format fbclid as fbc parameter
  if (userData.fbclid) {
    userDataPayload.fbc = formatFbc(userData.fbclid);
  }

  if (userData.clientIpAddress) {
    userDataPayload.client_ip_address = userData.clientIpAddress;
  }

  if (userData.clientUserAgent) {
    userDataPayload.client_user_agent = userData.clientUserAgent;
  }

  // Build event payload following Meta CAPI spec
  const eventPayload: MetaEventPayload = {
    event_name: eventName,
    event_time: eventTime,
    action_source: 'website',
    user_data: userDataPayload,
    custom_data: {
      value: customData.value,
      currency: customData.currency,
    },
  };

  if (eventSourceUrl) {
    eventPayload.event_source_url = eventSourceUrl;
  }

  const url = `https://graph.facebook.com/v18.0/${pixelId}/events`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: [eventPayload],
        access_token: accessToken,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      const errorMessage =
        errorBody?.error?.message ||
        `Meta CAPI responded with status ${response.status}`;
      return { success: false, error: errorMessage };
    }

    const result: MetaAPIResponse = await response.json();

    if (result.events_received > 0) {
      return { success: true };
    }

    return {
      success: false,
      error: result.messages?.join(', ') || 'No events received by Meta',
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to send conversion to Meta CAPI';
    return { success: false, error: message };
  }
}
