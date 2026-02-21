import { adminDb } from '@/lib/firebase/admin';
import type { IntegrationState } from '@/types';
import { decryptToken, encryptToken } from '@/lib/crypto/tokens';

// ===========================================
// PIXLY - Token Manager
// Handles OAuth token refresh for integrations
// ===========================================

export type IntegrationType = 'meta' | 'google' | 'tiktok' | 'stripe' | 'shopify' | 'hubspot';

const TOKEN_REFRESH_BUFFER = 5 * 60 * 1000; // 5 minutes before expiry

/**
 * Get a valid access token for an integration.
 * Refreshes the token if expired or about to expire.
 */
export async function getValidToken(
  workspaceId: string,
  integration: IntegrationType
): Promise<string | null> {
  const workspaceRef = adminDb.collection('workspaces').doc(workspaceId);
  const workspaceDoc = await workspaceRef.get();

  if (!workspaceDoc.exists) return null;

  const data = workspaceDoc.data();
  const integrationState: IntegrationState = data?.integrations?.[integration];

  if (!integrationState?.connected || !integrationState.accessToken) {
    return null;
  }

  // Check if token is still valid
  const expiresAt = integrationState.expiresAt;
  const expiryTime = expiresAt instanceof Date
    ? expiresAt.getTime()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    : (expiresAt as any)?.toDate?.()?.getTime?.() ?? 0;

  const isExpired = expiryTime > 0 && Date.now() + TOKEN_REFRESH_BUFFER >= expiryTime;

  if (!isExpired) {
    return decryptToken(integrationState.accessToken);
  }

  // Token is expired or about to expire - refresh it
  const newToken = await refreshToken(workspaceId, integration, integrationState);
  return newToken;
}

/**
 * Refresh an OAuth token based on the integration type
 */
async function refreshToken(
  workspaceId: string,
  integration: IntegrationType,
  state: IntegrationState
): Promise<string | null> {
  try {
    switch (integration) {
      case 'google':
        return await refreshGoogleToken(workspaceId, state);
      case 'meta':
        return await refreshMetaToken(workspaceId, state);
      case 'tiktok':
        return await refreshTikTokToken(workspaceId, state);
      case 'hubspot':
        return await refreshHubSpotToken(workspaceId, state);
      default:
        return null;
    }
  } catch (error) {
    console.error(`Token refresh failed for ${integration}:`, error);

    // Mark integration as errored
    await adminDb.collection('workspaces').doc(workspaceId).update({
      [`integrations.${integration}.connected`]: false,
    });

    return null;
  }
}

/**
 * Refresh Google OAuth token using refresh_token
 */
async function refreshGoogleToken(
  workspaceId: string,
  state: IntegrationState
): Promise<string | null> {
  if (!state.refreshToken) {
    console.error('No refresh token available for Google');
    return null;
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
      client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
      refresh_token: decryptToken(state.refreshToken!),
      grant_type: 'refresh_token',
    }),
  });

  const data = await response.json();

  if (!data.access_token) {
    console.error('Google token refresh failed:', data.error);
    return null;
  }

  // Update Firestore with new token
  const newExpiresAt = new Date(Date.now() + data.expires_in * 1000);

  await adminDb.collection('workspaces').doc(workspaceId).update({
    'integrations.google.accessToken': encryptToken(data.access_token),
    'integrations.google.expiresAt': newExpiresAt,
  });

  return data.access_token;
}

/**
 * Refresh Meta long-lived token
 * Meta long-lived tokens last ~60 days and can be exchanged for new ones
 */
async function refreshMetaToken(
  workspaceId: string,
  state: IntegrationState
): Promise<string | null> {
  if (!state.accessToken) return null;

  // Exchange existing long-lived token for a new one
  const params = new URLSearchParams({
    grant_type: 'fb_exchange_token',
    client_id: process.env.META_APP_ID!,
    client_secret: process.env.META_APP_SECRET!,
    fb_exchange_token: decryptToken(state.accessToken!),
  });

  const response = await fetch(
    `https://graph.facebook.com/v18.0/oauth/access_token?${params}`
  );

  const data = await response.json();

  if (!data.access_token) {
    console.error('Meta token refresh failed:', data.error);
    return null;
  }

  const newExpiresAt = new Date(Date.now() + (data.expires_in || 5184000) * 1000);

  await adminDb.collection('workspaces').doc(workspaceId).update({
    'integrations.meta.accessToken': encryptToken(data.access_token),
    'integrations.meta.expiresAt': newExpiresAt,
  });

  return data.access_token;
}

/**
 * Refresh TikTok access token using refresh_token
 * TikTok tokens expire after 24 hours
 */
async function refreshTikTokToken(
  workspaceId: string,
  state: IntegrationState
): Promise<string | null> {
  if (!state.refreshToken) {
    console.error('No refresh token available for TikTok');
    return null;
  }

  const response = await fetch(
    'https://business-api.tiktok.com/open_api/v1.3/oauth2/refresh_token/',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        app_id: process.env.TIKTOK_APP_ID,
        secret: process.env.TIKTOK_APP_SECRET,
        refresh_token: decryptToken(state.refreshToken!),
      }),
    }
  );

  const result = await response.json();

  if (result.code !== 0 || !result.data?.access_token) {
    console.error('TikTok token refresh failed:', result.message);
    return null;
  }

  // Update Firestore with new tokens
  const newExpiresAt = new Date(Date.now() + (result.data.expires_in || 86400) * 1000);

  await adminDb.collection('workspaces').doc(workspaceId).update({
    'integrations.tiktok.accessToken': encryptToken(result.data.access_token),
    'integrations.tiktok.refreshToken': encryptToken(result.data.refresh_token),
    'integrations.tiktok.expiresAt': newExpiresAt,
  });

  return result.data.access_token;
}

/**
 * Refresh HubSpot access token using refresh_token
 * HubSpot tokens expire after 6 hours
 */
async function refreshHubSpotToken(
  workspaceId: string,
  state: IntegrationState
): Promise<string | null> {
  if (!state.refreshToken) {
    console.error('No refresh token available for HubSpot');
    return null;
  }

  const response = await fetch('https://api.hubapi.com/oauth/v1/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: process.env.HUBSPOT_CLIENT_ID!,
      client_secret: process.env.HUBSPOT_CLIENT_SECRET!,
      refresh_token: decryptToken(state.refreshToken),
    }),
  });

  const data = await response.json();

  if (!data.access_token) {
    console.error('HubSpot token refresh failed:', data.message || data.error);
    return null;
  }

  const newExpiresAt = new Date(Date.now() + (data.expires_in || 21600) * 1000);

  await adminDb.collection('workspaces').doc(workspaceId).update({
    'integrations.hubspot.accessToken': encryptToken(data.access_token),
    'integrations.hubspot.refreshToken': data.refresh_token ? encryptToken(data.refresh_token) : state.refreshToken,
    'integrations.hubspot.expiresAt': newExpiresAt,
  });

  return data.access_token;
}

/**
 * Get integration state from Firestore
 */
export async function getIntegrationState(
  workspaceId: string,
  integration: IntegrationType
): Promise<IntegrationState | null> {
  const workspaceDoc = await adminDb.collection('workspaces').doc(workspaceId).get();

  if (!workspaceDoc.exists) return null;

  const data = workspaceDoc.data();
  return data?.integrations?.[integration] ?? null;
}
