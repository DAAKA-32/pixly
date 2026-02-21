import { adminDb } from '@/lib/firebase/admin';
import crypto from 'crypto';
import type { WebhookEndpoint, WebhookEventType } from '@/types';

// ===========================================
// PIXLY - Webhook Manager (Phase 3.7)
// Create, manage, and trigger webhooks
// for Zapier/Make connector integration
// ===========================================

// ============ CONSTANTS ============

/** Maximum consecutive failures before auto-disabling a webhook */
const MAX_FAILURE_COUNT = 10;

/** Timeout for webhook delivery requests (ms) */
const DELIVERY_TIMEOUT_MS = 10_000;

// ============ CRUD OPERATIONS ============

/**
 * Register a new webhook endpoint for a workspace.
 * Generates a random secret for HMAC-SHA256 signature verification.
 */
export async function createWebhook(
  workspaceId: string,
  url: string,
  events: WebhookEventType[]
): Promise<WebhookEndpoint> {
  // Validate URL
  try {
    new URL(url);
  } catch {
    throw new Error(`URL de webhook invalide : ${url}`);
  }

  if (events.length === 0) {
    throw new Error('Au moins un type d\'événement est requis');
  }

  const docRef = adminDb.collection('webhooks').doc();
  const secret = crypto.randomBytes(32).toString('hex');
  const now = new Date();

  const webhook: WebhookEndpoint = {
    id: docRef.id,
    workspaceId,
    url,
    events,
    secret,
    active: true,
    createdAt: now,
    lastTriggeredAt: null,
    failureCount: 0,
  };

  await docRef.set({
    ...webhook,
    createdAt: now,
    lastTriggeredAt: null,
  });

  return webhook;
}

/**
 * List all webhooks for a workspace.
 */
export async function listWebhooks(
  workspaceId: string
): Promise<WebhookEndpoint[]> {
  const snapshot = await adminDb
    .collection('webhooks')
    .where('workspaceId', '==', workspaceId)
    .orderBy('createdAt', 'desc')
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      workspaceId: data.workspaceId,
      url: data.url,
      events: data.events,
      secret: data.secret,
      active: data.active,
      createdAt: data.createdAt?.toDate?.() ?? data.createdAt ?? new Date(),
      lastTriggeredAt: data.lastTriggeredAt?.toDate?.() ?? data.lastTriggeredAt ?? null,
      failureCount: data.failureCount ?? 0,
    } as WebhookEndpoint;
  });
}

/**
 * Delete a webhook endpoint.
 */
export async function deleteWebhook(webhookId: string): Promise<void> {
  const docRef = adminDb.collection('webhooks').doc(webhookId);
  const doc = await docRef.get();

  if (!doc.exists) {
    throw new Error(`Webhook introuvable : ${webhookId}`);
  }

  await docRef.delete();
}

/**
 * Enable or disable a webhook endpoint.
 */
export async function toggleWebhook(
  webhookId: string,
  active: boolean
): Promise<void> {
  const docRef = adminDb.collection('webhooks').doc(webhookId);
  const doc = await docRef.get();

  if (!doc.exists) {
    throw new Error(`Webhook introuvable : ${webhookId}`);
  }

  const updates: Record<string, unknown> = {
    active,
    updatedAt: new Date(),
  };

  // Reset failure count when re-enabling
  if (active) {
    updates.failureCount = 0;
  }

  await docRef.update(updates);
}

// ============ TRIGGERING ============

/**
 * Trigger all active webhooks that match the given event type
 * for a specific workspace.
 *
 * Sends a POST request to each matching endpoint with:
 * - JSON payload body
 * - `X-Pixly-Signature` header (HMAC-SHA256)
 * - `X-Pixly-Event` header
 * - `X-Pixly-Delivery` header (unique delivery ID)
 */
export async function triggerWebhook(
  workspaceId: string,
  eventType: WebhookEventType,
  payload: Record<string, unknown>
): Promise<void> {
  // Find all active webhooks for this workspace that subscribe to this event
  const snapshot = await adminDb
    .collection('webhooks')
    .where('workspaceId', '==', workspaceId)
    .where('active', '==', true)
    .get();

  const matchingWebhooks = snapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    .filter((wh: Record<string, unknown>) => {
      const events = wh.events as WebhookEventType[];
      return events.includes(eventType);
    });

  if (matchingWebhooks.length === 0) {
    return;
  }

  // Build the delivery payload
  const deliveryPayload = {
    event: eventType,
    workspace_id: workspaceId,
    timestamp: new Date().toISOString(),
    data: payload,
  };

  const bodyString = JSON.stringify(deliveryPayload);

  // Deliver to each webhook concurrently
  const deliveries = matchingWebhooks.map((wh: Record<string, unknown>) =>
    deliverWebhook(
      wh.id as string,
      wh.url as string,
      wh.secret as string,
      eventType,
      bodyString
    )
  );

  await Promise.allSettled(deliveries);
}

/**
 * Deliver a webhook payload to a single endpoint.
 * Handles success/failure tracking.
 */
async function deliverWebhook(
  webhookId: string,
  url: string,
  secret: string,
  eventType: WebhookEventType,
  bodyString: string
): Promise<void> {
  const deliveryId = crypto.randomUUID();
  const signature = generateWebhookSignature(bodyString, secret);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DELIVERY_TIMEOUT_MS);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Pixly-Signature': signature,
        'X-Pixly-Event': eventType,
        'X-Pixly-Delivery': deliveryId,
        'User-Agent': 'Pixly-Webhook/1.0',
      },
      body: bodyString,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (response.ok) {
      // Success: update last triggered, reset failure count
      await adminDb.collection('webhooks').doc(webhookId).update({
        lastTriggeredAt: new Date(),
        failureCount: 0,
      });

      // Log successful delivery
      await logDelivery(webhookId, deliveryId, eventType, response.status, true);
    } else {
      // HTTP error
      await handleDeliveryFailure(
        webhookId,
        deliveryId,
        eventType,
        `HTTP ${response.status}: ${response.statusText}`
      );
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    await handleDeliveryFailure(webhookId, deliveryId, eventType, message);
  }
}

/**
 * Handle a delivery failure: increment failure count and auto-disable
 * if the threshold is exceeded.
 */
async function handleDeliveryFailure(
  webhookId: string,
  deliveryId: string,
  eventType: WebhookEventType,
  errorMessage: string
): Promise<void> {
  const docRef = adminDb.collection('webhooks').doc(webhookId);
  const doc = await docRef.get();

  if (!doc.exists) return;

  const currentFailures = (doc.data()?.failureCount ?? 0) + 1;
  const updates: Record<string, unknown> = {
    failureCount: currentFailures,
    lastTriggeredAt: new Date(),
  };

  // Auto-disable after too many consecutive failures
  if (currentFailures >= MAX_FAILURE_COUNT) {
    updates.active = false;
    console.warn(
      `[Webhooks] Auto-disabled webhook ${webhookId} after ${currentFailures} consecutive failures`
    );
  }

  await docRef.update(updates);

  // Log the failed delivery
  await logDelivery(webhookId, deliveryId, eventType, 0, false, errorMessage);

  console.error(
    `[Webhooks] Delivery failed for ${webhookId}: ${errorMessage}`
  );
}

/**
 * Log a webhook delivery attempt for audit trail.
 */
async function logDelivery(
  webhookId: string,
  deliveryId: string,
  eventType: WebhookEventType,
  statusCode: number,
  success: boolean,
  error?: string
): Promise<void> {
  await adminDb.collection('webhook_deliveries').add({
    webhookId,
    deliveryId,
    eventType,
    statusCode,
    success,
    error: error ?? null,
    timestamp: new Date(),
  });
}

// ============ SIGNATURE ============

/**
 * Generate an HMAC-SHA256 signature for a webhook payload.
 * The receiving endpoint can use this to verify the payload integrity.
 *
 * @param payload - The raw JSON string body
 * @param secret - The webhook secret key
 * @returns The HMAC-SHA256 hex digest prefixed with "sha256="
 */
export function generateWebhookSignature(
  payload: string,
  secret: string
): string {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload, 'utf8');
  return `sha256=${hmac.digest('hex')}`;
}

/**
 * Verify a webhook signature against a payload.
 * Uses constant-time comparison to prevent timing attacks.
 */
export function verifyWebhookSignature(
  payload: string,
  secret: string,
  receivedSignature: string
): boolean {
  const expectedSignature = generateWebhookSignature(payload, secret);

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(receivedSignature)
    );
  } catch {
    return false;
  }
}

// ============ HEALTH CHECK ============

/**
 * Send a test ping to verify a webhook endpoint is reachable.
 * Returns health status and HTTP status code.
 */
export async function verifyWebhookHealth(
  webhookId: string
): Promise<{ healthy: boolean; statusCode?: number }> {
  const docRef = adminDb.collection('webhooks').doc(webhookId);
  const doc = await docRef.get();

  if (!doc.exists) {
    throw new Error(`Webhook introuvable : ${webhookId}`);
  }

  const data = doc.data()!;
  const url = data.url as string;
  const secret = data.secret as string;

  const pingPayload = JSON.stringify({
    event: 'ping',
    workspace_id: data.workspaceId,
    timestamp: new Date().toISOString(),
    data: { message: 'Webhook health check from Pixly' },
  });

  const signature = generateWebhookSignature(pingPayload, secret);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DELIVERY_TIMEOUT_MS);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Pixly-Signature': signature,
        'X-Pixly-Event': 'ping',
        'X-Pixly-Delivery': crypto.randomUUID(),
        'User-Agent': 'Pixly-Webhook/1.0',
      },
      body: pingPayload,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    return {
      healthy: response.ok,
      statusCode: response.status,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Webhooks] Health check failed for ${webhookId}:`, message);
    return { healthy: false };
  }
}
