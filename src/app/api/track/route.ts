import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import {
  validatePixelPayload,
  buildTrackingEvent,
} from '@/lib/tracking/pixel';
import type { ClickIds } from '@/types';

// ===========================================
// PIXLY - Tracking API Endpoint
// ===========================================

// CORS headers
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
    // Parse payload
    const payload = await request.json();

    // Validate payload
    if (!validatePixelPayload(payload)) {
      return NextResponse.json(
        { success: false, error: 'Invalid payload' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Get client IP
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

    // Build tracking event
    const event = buildTrackingEvent(payload, workspaceId, ip);

    // Save event to Firestore
    const eventRef = adminDb.collection('events').doc();
    await eventRef.set({
      ...event,
      timestamp: new Date(event.timestamp),
    });

    // Handle session
    await updateSession(payload, workspaceId, eventRef.id);

    // If conversion event, process attribution
    if (['lead', 'purchase'].includes(event.eventType)) {
      await processConversion(event, eventRef.id, workspaceId);
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
    // Create new session
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
    // Update existing session
    const sessionDoc = sessionQuery.docs[0];
    const events = sessionDoc.data().events || [];
    await sessionDoc.ref.update({
      lastActivityAt: new Date(),
      events: [...events, eventId],
    });
  }
}

async function processConversion(
  event: ReturnType<typeof buildTrackingEvent>,
  eventId: string,
  workspaceId: string
) {
  // Simple last-click attribution for now
  // More sophisticated attribution can be added later
  const conversionsRef = adminDb.collection('conversions');

  await conversionsRef.add({
    workspaceId,
    eventId,
    type: event.eventType === 'purchase' ? 'purchase' : 'lead',
    value: event.value || 0,
    currency: event.currency || 'USD',
    timestamp: new Date(),
    attribution: {
      model: 'last_click',
      touchpoints: [
        {
          sessionId: event.sessionId,
          channel: getChannelFromClickIds(event.clickIds),
          source: event.clickIds.utm_source || 'direct',
          medium: event.clickIds.utm_medium || 'none',
          campaign: event.clickIds.utm_campaign || null,
          clickId: getFirstClickId(event.clickIds),
          timestamp: new Date(),
          credit: 1,
        },
      ],
      conversionId: eventId,
      conversionValue: event.value || 0,
      attributedAt: new Date(),
    },
    synced: {
      meta: { synced: false, syncedAt: null, error: null },
      google: { synced: false, syncedAt: null, error: null },
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
