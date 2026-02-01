import type { PixelPayload, TrackingEvent, EventType, ClickIds } from '@/types';

// ===========================================
// PIXLY - Pixel Processing
// ===========================================

export function validatePixelPayload(payload: unknown): payload is PixelPayload {
  if (!payload || typeof payload !== 'object') return false;

  const p = payload as Record<string, unknown>;

  return (
    typeof p.pixelId === 'string' &&
    typeof p.event === 'string' &&
    typeof p.fpid === 'string' &&
    typeof p.timestamp === 'number'
  );
}

export function normalizeEventType(event: string): EventType {
  const normalized = event.toLowerCase().replace(/[^a-z_]/g, '_');

  const eventMap: Record<string, EventType> = {
    page_view: 'page_view',
    pageview: 'page_view',
    identify: 'identify',
    lead: 'lead',
    purchase: 'purchase',
    add_to_cart: 'add_to_cart',
    addtocart: 'add_to_cart',
    initiate_checkout: 'initiate_checkout',
    initiatecheckout: 'initiate_checkout',
    begin_checkout: 'initiate_checkout',
  };

  return eventMap[normalized] || 'custom';
}

export function extractClickIds(payload: PixelPayload): ClickIds {
  const clickIds = payload.clickIds || {};

  return {
    gclid: clickIds.gclid || null,
    fbclid: clickIds.fbclid || null,
    ttclid: clickIds.ttclid || null,
    li_fat_id: clickIds.li_fat_id || null,
    msclkid: clickIds.msclkid || null,
    utm_source: clickIds.utm_source || null,
    utm_medium: clickIds.utm_medium || null,
    utm_campaign: clickIds.utm_campaign || null,
    utm_content: clickIds.utm_content || null,
    utm_term: clickIds.utm_term || null,
  };
}

export function extractValue(payload: PixelPayload): {
  value: number | null;
  currency: string | null;
} {
  const props = payload.properties || {};

  let value: number | null = null;
  let currency: string | null = null;

  if (typeof props.value === 'number') {
    value = props.value;
  } else if (typeof props.value === 'string') {
    value = parseFloat(props.value) || null;
  }

  if (typeof props.currency === 'string') {
    currency = props.currency.toUpperCase();
  }

  return { value, currency };
}

export function buildTrackingEvent(
  payload: PixelPayload,
  workspaceId: string,
  ip: string
): Omit<TrackingEvent, 'id'> {
  const eventType = normalizeEventType(payload.event);
  const clickIds = extractClickIds(payload);
  const { value, currency } = extractValue(payload);

  return {
    pixelId: payload.pixelId,
    workspaceId,
    eventType,
    eventName: payload.event,
    timestamp: new Date(payload.timestamp),
    sessionId: payload.sessionId || '',
    fpid: payload.fpid,
    clickIds,
    hashedEmail: payload.hashedEmail || null,
    userId: null,
    context: {
      url: payload.context?.url || '',
      referrer: payload.context?.referrer || '',
      userAgent: payload.context?.userAgent || '',
      ip,
      country: null, // Can be enriched with IP geolocation
      city: null,
      device: {
        type: payload.context?.device?.type || 'desktop',
        os: payload.context?.device?.os || 'Unknown',
        browser: payload.context?.device?.browser || 'Unknown',
        screenWidth: payload.context?.device?.screenWidth || 0,
        screenHeight: payload.context?.device?.screenHeight || 0,
      },
    },
    properties: payload.properties || {},
    value,
    currency,
    attributed: false,
    attributedTo: null,
  };
}
