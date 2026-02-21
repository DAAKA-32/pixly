import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import {
  createWebhook,
  listWebhooks,
  deleteWebhook,
  verifyWebhookHealth,
} from '@/lib/webhooks/manager';
import type { WebhookEventType } from '@/types';

// ===========================================
// PIXLY - Webhook Registration API (Phase 3.7)
// REST endpoint for Zapier/Make connectors
//
// POST   /api/v1/webhook — Register a new webhook
// GET    /api/v1/webhook — List all webhooks
// DELETE /api/v1/webhook?id=xxx — Delete a webhook
// ===========================================

// ============ AUTH MIDDLEWARE ============

/**
 * Validate the Bearer API key and return the associated workspace ID.
 * API keys are stored in the `api_keys` Firestore collection.
 *
 * Required permission: varies by endpoint (checked per-route).
 */
async function authenticateApiKey(
  request: NextRequest,
  requiredPermission?: string
): Promise<{ workspaceId: string } | NextResponse> {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Clé API manquante ou invalide' },
      },
      { status: 401 }
    );
  }

  const apiKey = authHeader.slice('Bearer '.length).trim();

  if (!apiKey) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Clé API manquante' },
      },
      { status: 401 }
    );
  }

  // Look up the API key by its prefix+key (first 8 chars stored as prefix)
  const prefix = apiKey.substring(0, 8);

  const snapshot = await adminDb
    .collection('api_keys')
    .where('prefix', '==', prefix)
    .limit(5)
    .get();

  // Find exact match (prefix narrows the search, then verify full key)
  let matchedDoc: FirebaseFirestore.QueryDocumentSnapshot | null = null;

  for (const doc of snapshot.docs) {
    if (doc.data().key === apiKey) {
      matchedDoc = doc;
      break;
    }
  }

  if (!matchedDoc) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Clé API invalide' },
      },
      { status: 401 }
    );
  }

  const keyData = matchedDoc.data();

  // Check expiration
  if (keyData.expiresAt) {
    const expiresAt = keyData.expiresAt.toDate
      ? keyData.expiresAt.toDate()
      : new Date(keyData.expiresAt);
    if (expiresAt < new Date()) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Clé API expirée' },
        },
        { status: 401 }
      );
    }
  }

  // Check permission
  if (requiredPermission) {
    const permissions: string[] = keyData.permissions || [];
    if (!permissions.includes(requiredPermission)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: `Permission requise : ${requiredPermission}`,
          },
        },
        { status: 403 }
      );
    }
  }

  // Update last used timestamp
  await matchedDoc.ref.update({ lastUsedAt: new Date() });

  return { workspaceId: keyData.workspaceId };
}

// ============ POST — Register a webhook ============

export async function POST(request: NextRequest) {
  // Authenticate with write:events permission (webhook registration)
  const authResult = await authenticateApiKey(request, 'write:events');

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { workspaceId } = authResult;

  let body: { url?: string; events?: WebhookEventType[] };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Corps de requête JSON invalide' },
      },
      { status: 400 }
    );
  }

  // Validate required fields
  if (!body.url || typeof body.url !== 'string') {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Le champ "url" est requis' },
      },
      { status: 400 }
    );
  }

  if (!body.events || !Array.isArray(body.events) || body.events.length === 0) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Le champ "events" est requis (tableau non vide)',
        },
      },
      { status: 400 }
    );
  }

  // Validate event types
  const validEvents: WebhookEventType[] = [
    'conversion.created',
    'conversion.synced',
    'alert.triggered',
    'integration.connected',
    'integration.disconnected',
  ];

  const invalidEvents = body.events.filter(
    (e: string) => !validEvents.includes(e as WebhookEventType)
  );

  if (invalidEvents.length > 0) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: `Types d'événements invalides : ${invalidEvents.join(', ')}`,
          details: { validEvents },
        },
      },
      { status: 400 }
    );
  }

  try {
    const webhook = await createWebhook(workspaceId, body.url, body.events);

    return NextResponse.json(
      {
        success: true,
        data: {
          id: webhook.id,
          url: webhook.url,
          events: webhook.events,
          secret: webhook.secret,
          active: webhook.active,
          createdAt: webhook.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message },
      },
      { status: 500 }
    );
  }
}

// ============ GET — List webhooks ============

export async function GET(request: NextRequest) {
  // Authenticate with read:metrics permission (listing)
  const authResult = await authenticateApiKey(request, 'read:metrics');

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { workspaceId } = authResult;

  try {
    const webhooks = await listWebhooks(workspaceId);

    return NextResponse.json({
      success: true,
      data: webhooks.map((wh) => ({
        id: wh.id,
        url: wh.url,
        events: wh.events,
        active: wh.active,
        createdAt: wh.createdAt instanceof Date
          ? wh.createdAt.toISOString()
          : wh.createdAt,
        lastTriggeredAt: wh.lastTriggeredAt instanceof Date
          ? wh.lastTriggeredAt.toISOString()
          : wh.lastTriggeredAt,
        failureCount: wh.failureCount,
      })),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message },
      },
      { status: 500 }
    );
  }
}

// ============ DELETE — Delete a webhook ============

export async function DELETE(request: NextRequest) {
  // Authenticate with write:events permission
  const authResult = await authenticateApiKey(request, 'write:events');

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { workspaceId } = authResult;
  const webhookId = request.nextUrl.searchParams.get('id');

  if (!webhookId) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Le paramètre "id" est requis',
        },
      },
      { status: 400 }
    );
  }

  // Verify the webhook belongs to this workspace
  const docRef = adminDb.collection('webhooks').doc(webhookId);
  const doc = await docRef.get();

  if (!doc.exists) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'NOT_FOUND', message: 'Webhook introuvable' },
      },
      { status: 404 }
    );
  }

  if (doc.data()?.workspaceId !== workspaceId) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'FORBIDDEN', message: 'Accès refusé à ce webhook' },
      },
      { status: 403 }
    );
  }

  try {
    await deleteWebhook(webhookId);

    return NextResponse.json({
      success: true,
      data: { deleted: webhookId },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message },
      },
      { status: 500 }
    );
  }
}
