import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import {
  validatePixelPayload,
  buildTrackingEvent,
} from '@/lib/tracking/pixel';
import { deduplicateTouchpoints, shouldSyncToPlatform } from '@/lib/attribution/dedupe';
import type { ClickIds, Touchpoint, Channel } from '@/types';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

// ===========================================
// PIXLY - Tracking API Endpoint
// With deduplication + platform sync (CAPI/Enhanced Conversions)
// ===========================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 100 requests per 10 seconds per IP
    const clientIp = getClientIp(request);
    const rateCheck = checkRateLimit(`track:${clientIp}`, { limit: 100, windowSeconds: 10 });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded' },
        { status: 429, headers: { ...corsHeaders, 'Retry-After': String(Math.ceil((rateCheck.resetAt - Date.now()) / 1000)) } }
      );
    }

    const payload = await request.json();

    if (!validatePixelPayload(payload)) {
      return NextResponse.json(
        { success: false, error: 'Invalid payload' },
        { status: 400, headers: corsHeaders }
      );
    }

    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // Look up workspace by pixel ID
    const workspacesRef = adminDb.collection('workspaces');
    const workspaceQuery = await workspacesRef
      .where('pixelId', '==', payload.pixelId)
      .limit(1)
      .get();

    if (workspaceQuery.empty) {
      return NextResponse.json(
        { success: false, error: 'Invalid pixel ID' },
        { status: 404, headers: corsHeaders }
      );
    }

    const workspace = workspaceQuery.docs[0];
    const workspaceId = workspace.id;
    const workspaceData = workspace.data();

    // Build tracking event (with geolocation)
    const event = await buildTrackingEvent(payload, workspaceId, ip);

    // Save event to Firestore
    const eventRef = adminDb.collection('events').doc();
    await eventRef.set({
      ...event,
      timestamp: new Date(event.timestamp),
    });

    // Handle session
    await updateSession(payload, workspaceId, eventRef.id);

    // If conversion event, process attribution with deduplication + sync
    if (['lead', 'purchase'].includes(event.eventType)) {
      await processConversion(event, eventRef.id, workspaceId, workspaceData);
    }

    return NextResponse.json(
      { success: true, eventId: eventRef.id },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('[Track API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

async function updateSession(
  payload: { pixelId: string; fpid: string; sessionId: string; context?: { url?: string; referrer?: string }; clickIds?: Record<string, string | null> },
  workspaceId: string,
  eventId: string
) {
  const sessionsRef = adminDb.collection('sessions');
  const sessionQuery = await sessionsRef
    .where('pixelId', '==', payload.pixelId)
    .where('fpid', '==', payload.fpid)
    .where('id', '==', payload.sessionId)
    .limit(1)
    .get();

  if (sessionQuery.empty) {
    await sessionsRef.doc(payload.sessionId).set({
      pixelId: payload.pixelId,
      workspaceId,
      fpid: payload.fpid,
      startedAt: new Date(),
      lastActivityAt: new Date(),
      landingPage: payload.context?.url || '',
      referrer: payload.context?.referrer || '',
      clickIds: payload.clickIds || {},
      events: [eventId],
      converted: false,
      conversionValue: null,
    });
  } else {
    const sessionDoc = sessionQuery.docs[0];
    const events = sessionDoc.data().events || [];
    await sessionDoc.ref.update({
      lastActivityAt: new Date(),
      events: [...events, eventId],
    });
  }
}

/**
 * Gather all touchpoints for this user (fpid) across sessions
 */
async function getUserTouchpoints(
  workspaceId: string,
  fpid: string,
  lookbackDays: number = 30
): Promise<Touchpoint[]> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - lookbackDays);

  const sessionsRef = adminDb.collection('sessions');
  const sessionsQuery = await sessionsRef
    .where('workspaceId', '==', workspaceId)
    .where('fpid', '==', fpid)
    .where('startedAt', '>=', cutoff)
    .orderBy('startedAt', 'asc')
    .get();

  const touchpoints: Touchpoint[] = [];

  for (const sessionDoc of sessionsQuery.docs) {
    const session = sessionDoc.data();
    const clickIds = session.clickIds || {};
    const channel = getChannelFromClickIds(clickIds as ClickIds);

    touchpoints.push({
      sessionId: sessionDoc.id,
      channel: channel as Channel,
      source: clickIds.utm_source || 'direct',
      medium: clickIds.utm_medium || 'none',
      campaign: clickIds.utm_campaign || null,
      clickId: getFirstClickId(clickIds as ClickIds),
      timestamp: session.startedAt?.toDate?.() || new Date(session.startedAt),
      credit: 0, // Will be assigned by attribution model
    });
  }

  return touchpoints;
}

async function processConversion(
  event: Awaited<ReturnType<typeof buildTrackingEvent>>,
  eventId: string,
  workspaceId: string,
  workspaceData: FirebaseFirestore.DocumentData
) {
  const conversionsRef = adminDb.collection('conversions');

  // Gather all touchpoints for deduplication
  const allTouchpoints = await getUserTouchpoints(
    workspaceId,
    event.fpid,
    workspaceData.settings?.attributionWindow || 30
  );

  // Build the current touchpoint
  const currentTouchpoint: Touchpoint = {
    sessionId: event.sessionId,
    channel: getChannelFromClickIds(event.clickIds) as Channel,
    source: event.clickIds.utm_source || 'direct',
    medium: event.clickIds.utm_medium || 'none',
    campaign: event.clickIds.utm_campaign || null,
    clickId: getFirstClickId(event.clickIds),
    timestamp: new Date(),
    credit: 1,
  };

  // Ensure current touchpoint is included
  const touchpoints = allTouchpoints.length > 0 ? allTouchpoints : [currentTouchpoint];

  // Run deduplication across platforms
  let dedupeResult;
  try {
    dedupeResult = deduplicateTouchpoints(touchpoints, {
      lookbackWindow: workspaceData.settings?.attributionWindow || 30,
      dedupeWindowHours: 24,
    });
  } catch {
    // Fallback to current touchpoint if dedupe fails
    dedupeResult = {
      winner: currentTouchpoint,
      allTouchpoints: [currentTouchpoint],
      deduplicated: [],
      reason: 'Fallback - single touchpoint',
    };
  }

  // Assign credit based on last-click (default model)
  // All touchpoints stored for client-side model switching
  const attributedTouchpoints = touchpoints.map((tp, i) => ({
    ...tp,
    credit: i === touchpoints.length - 1 ? 1 : 0, // Last-click default
    timestamp: tp.timestamp instanceof Date ? tp.timestamp : new Date(tp.timestamp),
  }));

  // Save conversion with full touchpoint history
  const conversionRef = await conversionsRef.add({
    workspaceId,
    eventId,
    type: event.eventType === 'purchase' ? 'purchase' : 'lead',
    value: event.value || 0,
    currency: event.currency || 'EUR',
    timestamp: new Date(),
    fpid: event.fpid,
    hashedEmail: event.hashedEmail || null,
    attribution: {
      model: 'last_click',
      touchpoints: attributedTouchpoints,
      conversionId: eventId,
      conversionValue: event.value || 0,
      attributedAt: new Date(),
      dedupeApplied: dedupeResult.deduplicated.length > 0,
      dedupeReason: dedupeResult.reason,
    },
    synced: {
      meta: { synced: false, syncedAt: null, error: null },
      google: { synced: false, syncedAt: null, error: null },
      tiktok: { synced: false, syncedAt: null, error: null },
    },
  });

  // Update session as converted
  if (event.sessionId) {
    const sessionRef = adminDb.collection('sessions').doc(event.sessionId);
    const sessionDoc = await sessionRef.get();
    if (sessionDoc.exists) {
      await sessionRef.update({
        converted: true,
        conversionValue: event.value || 0,
      });
    }
  }

  // Async: Sync to ad platforms (non-blocking)
  syncToPlatforms(
    conversionRef.id,
    event,
    dedupeResult,
    workspaceData
  ).catch((err) => console.error('[Track API] Sync error:', err));
}

/**
 * Sync conversion to ad platforms (Meta CAPI, Google Enhanced Conversions, TikTok Events)
 * Runs asynchronously after the main response
 */
async function syncToPlatforms(
  conversionId: string,
  event: Awaited<ReturnType<typeof buildTrackingEvent>>,
  dedupeResult: { winner: Touchpoint; allTouchpoints: Touchpoint[]; deduplicated: Touchpoint[]; reason: string },
  workspaceData: FirebaseFirestore.DocumentData
) {
  const integrations = workspaceData.integrations || {};
  const conversionRef = adminDb.collection('conversions').doc(conversionId);

  // === Meta CAPI Sync ===
  if (
    integrations.meta?.connected &&
    integrations.meta?.accessToken &&
    shouldSyncToPlatform(dedupeResult, 'meta')
  ) {
    try {
      const { sendConversionToMeta } = await import('@/lib/integrations/meta-capi');
      const result = await sendConversionToMeta({
        pixelId: workspaceData.pixelId,
        accessToken: integrations.meta.accessToken,
        eventName: event.eventType === 'purchase' ? 'Purchase' : 'Lead',
        eventTime: Math.floor(Date.now() / 1000),
        userData: {
          fbclid: event.clickIds.fbclid || undefined,
          hashedEmail: event.hashedEmail || undefined,
          clientIpAddress: event.context?.ip,
          clientUserAgent: event.context?.userAgent,
        },
        customData: {
          value: event.value || 0,
          currency: event.currency || 'EUR',
        },
        eventSourceUrl: event.context?.url,
      });

      await conversionRef.update({
        'synced.meta': {
          synced: result.success,
          syncedAt: new Date(),
          error: result.error || null,
        },
      });
    } catch (err) {
      console.error('[Sync] Meta CAPI error:', err);
      await conversionRef.update({
        'synced.meta.error': err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }

  // === Google Enhanced Conversions Sync ===
  if (
    integrations.google?.connected &&
    integrations.google?.accessToken &&
    shouldSyncToPlatform(dedupeResult, 'google')
  ) {
    try {
      const { sendEnhancedConversionToGoogle } = await import(
        '@/lib/integrations/google-enhanced-conversions'
      );
      const conversion = {
        gclid: event.clickIds.gclid || undefined,
        conversionDateTime: new Date().toISOString(),
        conversionValue: event.value || 0,
        currencyCode: event.currency || 'EUR',
        hashedEmail: event.hashedEmail || undefined,
      };

      const result = await sendEnhancedConversionToGoogle(
        conversion,
        integrations.google.accountId || '',
        'default', // conversionActionId
        integrations.google.accessToken,
        process.env.GOOGLE_ADS_DEVELOPER_TOKEN || ''
      );

      await conversionRef.update({
        'synced.google': {
          synced: result.success,
          syncedAt: new Date(),
          error: result.error || null,
        },
      });
    } catch (err) {
      console.error('[Sync] Google Enhanced Conversions error:', err);
      await conversionRef.update({
        'synced.google.error': err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }

  // === TikTok Events API Sync ===
  if (
    integrations.tiktok?.connected &&
    integrations.tiktok?.accessToken &&
    shouldSyncToPlatform(dedupeResult, 'tiktok')
  ) {
    try {
      const { sendTikTokEvent } = await import('@/lib/integrations/tiktok-events');
      const result = await sendTikTokEvent({
        pixelCode: workspaceData.pixelId,
        accessToken: integrations.tiktok.accessToken,
        eventName: event.eventType === 'purchase' ? 'CompletePayment' : 'SubmitForm',
        eventTime: Math.floor(Date.now() / 1000),
        userData: {
          ttclid: event.clickIds.ttclid || undefined,
          hashedEmail: event.hashedEmail || undefined,
          ip: event.context?.ip,
          userAgent: event.context?.userAgent,
        },
        properties: {
          value: event.value || 0,
          currency: event.currency || 'EUR',
        },
        pageUrl: event.context?.url,
      });

      await conversionRef.update({
        'synced.tiktok': {
          synced: result.success,
          syncedAt: new Date(),
          error: result.error || null,
        },
      });
    } catch (err) {
      console.error('[Sync] TikTok Events error:', err);
      await conversionRef.update({
        'synced.tiktok.error': err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }
}

function getChannelFromClickIds(clickIds: ClickIds): string {
  if (clickIds.gclid) return 'google';
  if (clickIds.fbclid) return 'meta';
  if (clickIds.ttclid) return 'tiktok';
  if (clickIds.li_fat_id) return 'linkedin';
  if (clickIds.msclkid) return 'bing';
  if (clickIds.utm_source) return clickIds.utm_source.toLowerCase();
  return 'direct';
}

function getFirstClickId(clickIds: ClickIds): string | null {
  return (
    clickIds.gclid ||
    clickIds.fbclid ||
    clickIds.ttclid ||
    clickIds.li_fat_id ||
    clickIds.msclkid ||
    null
  );
}
