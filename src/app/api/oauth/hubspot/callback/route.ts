import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { encryptToken } from '@/lib/crypto/tokens';
import { exchangeHubSpotCode } from '@/lib/integrations/hubspot';

// ===========================================
// PIXLY - HubSpot OAuth Callback
// Exchange authorization code for access token
// ===========================================

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state'); // workspaceId
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (error) {
    console.error('HubSpot auth error:', error, errorDescription);
    return NextResponse.redirect(
      new URL('/integrations?error=hubspot_auth_failed', request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/integrations?error=no_code', request.url)
    );
  }

  try {
    // Exchange authorization code for tokens
    const { accessToken, refreshToken } = await exchangeHubSpotCode(code);

    // Fetch HubSpot account info to get the portal name
    let accountName = 'HubSpot CRM';
    let accountId: string | null = null;

    try {
      const infoResponse = await fetch(
        `https://api.hubapi.com/oauth/v1/access-tokens/${accessToken}`
      );
      if (infoResponse.ok) {
        const info = await infoResponse.json();
        accountId = info.hub_id?.toString() || null;
        accountName = info.hub_domain || 'HubSpot CRM';
      }
    } catch (infoError) {
      console.warn('Could not fetch HubSpot account info:', infoError);
      // Continue with defaults
    }

    // Update workspace with HubSpot integration data
    if (state) {
      const workspaceRef = adminDb.collection('workspaces').doc(state);
      await workspaceRef.update({
        'integrations.hubspot': {
          connected: true,
          connectedAt: new Date(),
          accountId,
          accountName,
          accessToken: encryptToken(accessToken),
          refreshToken: refreshToken ? encryptToken(refreshToken) : null,
          expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000), // HubSpot tokens expire in 6 hours
        },
      });
    }

    return NextResponse.redirect(
      new URL('/integrations?success=hubspot', request.url)
    );
  } catch (error) {
    console.error('HubSpot OAuth error:', error);
    return NextResponse.redirect(
      new URL('/integrations?error=oauth_failed', request.url)
    );
  }
}
