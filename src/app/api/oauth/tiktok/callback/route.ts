import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { encryptToken } from '@/lib/crypto/tokens';

// ===========================================
// PIXLY - TikTok Ads OAuth Callback
// Exchange authorization code for access token
// ===========================================

const TIKTOK_API_VERSION = 'v1.3';

interface TikTokTokenResponse {
  code: number;
  message: string;
  data?: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    refresh_expires_in: number;
    open_id: string;
    advertiser_ids: string[];
    scope: string[];
  };
}

interface TikTokAdvertiserInfo {
  code: number;
  message: string;
  data?: {
    list: Array<{
      advertiser_id: string;
      advertiser_name: string;
      status: string;
    }>;
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const authCode = searchParams.get('auth_code');
  const state = searchParams.get('state'); // workspaceId
  const error = searchParams.get('error');

  // TikTok uses error_description for error details
  const errorDescription = searchParams.get('error_description');

  if (error) {
    console.error('TikTok auth error:', error, errorDescription);
    return NextResponse.redirect(
      new URL('/integrations?error=tiktok_auth_failed', request.url)
    );
  }

  if (!authCode) {
    return NextResponse.redirect(
      new URL('/integrations?error=no_code', request.url)
    );
  }

  try {
    // Exchange auth code for access token
    const tokenResponse = await fetch(
      `https://business-api.tiktok.com/open_api/${TIKTOK_API_VERSION}/oauth2/access_token/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          app_id: process.env.TIKTOK_APP_ID,
          secret: process.env.TIKTOK_APP_SECRET,
          auth_code: authCode,
        }),
      }
    );

    const tokenData: TikTokTokenResponse = await tokenResponse.json();

    if (tokenData.code !== 0 || !tokenData.data) {
      console.error('TikTok token error:', tokenData.message);
      return NextResponse.redirect(
        new URL('/integrations?error=token_exchange_failed', request.url)
      );
    }

    const {
      access_token,
      refresh_token,
      expires_in,
      advertiser_ids,
    } = tokenData.data;

    // Get advertiser info for the first ad account
    let accountName = 'TikTok Ads';
    let accountId = advertiser_ids?.[0] || null;

    if (accountId) {
      const advertiserResponse = await fetch(
        `https://business-api.tiktok.com/open_api/${TIKTOK_API_VERSION}/advertiser/info/?advertiser_ids=${JSON.stringify([accountId])}`,
        {
          method: 'GET',
          headers: {
            'Access-Token': access_token,
          },
        }
      );

      const advertiserData: TikTokAdvertiserInfo = await advertiserResponse.json();

      if (advertiserData.code === 0 && advertiserData.data?.list?.[0]) {
        accountName = advertiserData.data.list[0].advertiser_name || accountName;
      }
    }

    // Update workspace with TikTok integration data
    if (state) {
      const workspaceRef = adminDb.collection('workspaces').doc(state);
      await workspaceRef.update({
        'integrations.tiktok': {
          connected: true,
          connectedAt: new Date(),
          accountId: accountId,
          accountName: accountName,
          accessToken: encryptToken(access_token),
          refreshToken: encryptToken(refresh_token),
          expiresAt: new Date(Date.now() + expires_in * 1000),
        },
      });
    }

    return NextResponse.redirect(
      new URL('/integrations?success=tiktok', request.url)
    );
  } catch (error) {
    console.error('TikTok OAuth error:', error);
    return NextResponse.redirect(
      new URL('/integrations?error=oauth_failed', request.url)
    );
  }
}
