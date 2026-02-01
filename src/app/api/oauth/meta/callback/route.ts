import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

// ===========================================
// PIXLY - Meta OAuth Callback
// ===========================================

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state'); // workspaceId
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(
      new URL('/dashboard/integrations?error=meta_auth_failed', request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/dashboard/integrations?error=no_code', request.url)
    );
  }

  try {
    // Exchange code for access token
    const tokenUrl = 'https://graph.facebook.com/v18.0/oauth/access_token';
    const params = new URLSearchParams({
      client_id: process.env.META_APP_ID!,
      client_secret: process.env.META_APP_SECRET!,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/meta/callback`,
      code,
    });

    const tokenResponse = await fetch(`${tokenUrl}?${params}`);
    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error('Meta token error:', tokenData.error);
      return NextResponse.redirect(
        new URL('/dashboard/integrations?error=token_exchange_failed', request.url)
      );
    }

    const { access_token, expires_in } = tokenData;

    // Get long-lived token
    const longLivedUrl = 'https://graph.facebook.com/v18.0/oauth/access_token';
    const longLivedParams = new URLSearchParams({
      grant_type: 'fb_exchange_token',
      client_id: process.env.META_APP_ID!,
      client_secret: process.env.META_APP_SECRET!,
      fb_exchange_token: access_token,
    });

    const longLivedResponse = await fetch(`${longLivedUrl}?${longLivedParams}`);
    const longLivedData = await longLivedResponse.json();

    const finalToken = longLivedData.access_token || access_token;
    const finalExpiry = longLivedData.expires_in || expires_in;

    // Get ad accounts
    const adAccountsResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/adaccounts?fields=name,account_id,account_status&access_token=${finalToken}`
    );
    const adAccountsData = await adAccountsResponse.json();

    const adAccount = adAccountsData.data?.[0];

    // Update workspace with integration data
    if (state) {
      const workspaceRef = adminDb.collection('workspaces').doc(state);
      await workspaceRef.update({
        'integrations.meta': {
          connected: true,
          connectedAt: new Date(),
          accountId: adAccount?.account_id || null,
          accountName: adAccount?.name || 'Meta Ads',
          accessToken: finalToken,
          refreshToken: null, // Meta doesn't use refresh tokens
          expiresAt: new Date(Date.now() + finalExpiry * 1000),
        },
      });
    }

    return NextResponse.redirect(
      new URL('/dashboard/integrations?success=meta', request.url)
    );
  } catch (error) {
    console.error('Meta OAuth error:', error);
    return NextResponse.redirect(
      new URL('/dashboard/integrations?error=oauth_failed', request.url)
    );
  }
}
