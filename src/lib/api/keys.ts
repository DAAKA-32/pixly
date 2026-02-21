import { adminDb } from '@/lib/firebase/admin';
import crypto from 'crypto';
import type { ApiKey, ApiPermission } from '@/types';

// ===========================================
// PIXLY - API Key Management
// Keys are stored hashed in Firestore.
// The raw key is returned only once on creation.
// ===========================================

const API_KEYS_COLLECTION = 'api_keys';

/**
 * Generate a new API key with the `pk_live_` prefix.
 * Returns the raw key (shown once) and a display prefix.
 */
export function generateApiKey(): { key: string; prefix: string } {
  const randomHex = crypto.randomBytes(16).toString('hex'); // 32 hex chars
  const key = `pk_live_${randomHex}`;
  const prefix = key.slice(0, 12); // "pk_live_XXXX" for display
  return { key, prefix };
}

/**
 * Hash an API key for secure storage.
 * Uses SHA-256 so we never store the raw key.
 */
function hashKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

/**
 * Create a new API key for a workspace.
 * Returns the full ApiKey object with the raw key populated.
 * The raw key will NOT be retrievable after this call.
 */
export async function createApiKey(
  workspaceId: string,
  name: string,
  permissions: ApiPermission[]
): Promise<ApiKey> {
  const { key, prefix } = generateApiKey();
  const hashedKey = hashKey(key);

  const now = new Date();
  const docRef = adminDb.collection(API_KEYS_COLLECTION).doc();

  const apiKeyDoc = {
    workspaceId,
    name,
    keyHash: hashedKey,
    prefix,
    permissions,
    createdAt: now,
    lastUsedAt: null,
    expiresAt: null,
  };

  await docRef.set(apiKeyDoc);

  // Return with the raw key (only time it's available)
  return {
    id: docRef.id,
    workspaceId,
    name,
    key, // raw key — show once to the user
    prefix,
    permissions,
    createdAt: now,
    lastUsedAt: null,
    expiresAt: null,
  };
}

/**
 * Validate an API key from an incoming request.
 * Hashes the provided key and looks it up in Firestore.
 * Updates `lastUsedAt` on successful validation.
 */
export async function validateApiKey(
  key: string
): Promise<{ valid: boolean; workspaceId?: string; permissions?: ApiPermission[] }> {
  if (!key || !key.startsWith('pk_live_')) {
    return { valid: false };
  }

  const hashedKey = hashKey(key);

  const snapshot = await adminDb
    .collection(API_KEYS_COLLECTION)
    .where('keyHash', '==', hashedKey)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return { valid: false };
  }

  const doc = snapshot.docs[0];
  const data = doc.data();

  // Check expiration
  if (data.expiresAt) {
    const expiresAt = data.expiresAt.toDate ? data.expiresAt.toDate() : new Date(data.expiresAt);
    if (expiresAt < new Date()) {
      return { valid: false };
    }
  }

  // Update last used timestamp (fire-and-forget)
  doc.ref.update({ lastUsedAt: new Date() }).catch(() => {
    // Non-critical — don't block the request
  });

  return {
    valid: true,
    workspaceId: data.workspaceId,
    permissions: data.permissions as ApiPermission[],
  };
}

/**
 * List all API keys for a workspace.
 * Returns keys without the raw key (only prefix is available).
 */
export async function listApiKeys(workspaceId: string): Promise<ApiKey[]> {
  const snapshot = await adminDb
    .collection(API_KEYS_COLLECTION)
    .where('workspaceId', '==', workspaceId)
    .orderBy('createdAt', 'desc')
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      workspaceId: data.workspaceId,
      name: data.name,
      key: data.prefix + '••••••••', // masked
      prefix: data.prefix,
      permissions: data.permissions as ApiPermission[],
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
      lastUsedAt: data.lastUsedAt
        ? (data.lastUsedAt.toDate ? data.lastUsedAt.toDate() : new Date(data.lastUsedAt))
        : null,
      expiresAt: data.expiresAt
        ? (data.expiresAt.toDate ? data.expiresAt.toDate() : new Date(data.expiresAt))
        : null,
    };
  });
}

/**
 * Revoke (delete) an API key by its document ID.
 */
export async function revokeApiKey(keyId: string): Promise<void> {
  const docRef = adminDb.collection(API_KEYS_COLLECTION).doc(keyId);
  const doc = await docRef.get();

  if (!doc.exists) {
    throw new Error('API key not found');
  }

  await docRef.delete();
}
