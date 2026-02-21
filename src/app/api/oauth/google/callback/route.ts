import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { encryptToken } from '@/lib/crypto/tokens';

// ===========================================
// PIXLY - Google Ads OAuth Callback
// ===========================================

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state'); // workspaceId
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(
      new URL('/integrations?error=google_auth_failed', request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/integrations?error=no_code', request.url)
    );
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
        client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/google/callback`,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Google token exchange failed:', tokenResponse.status, errorText);
      return NextResponse.redirect(
        new URL('/integrations?error=token_exchange_failed', request.url)
      );
    }

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error('Google token error:', tokenData.error);
      return NextResponse.redirect(
        new URL('/integrations?error=token_exchange_failed', request.url)
      );
    }

    const { access_token, refresh_token, expires_in } = tokenData;

    // Try to get customer accounts if developer token is available
    let customerId: string | null = null;
    const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;

    if (developerToken) {
      try {
        const customersResponse = await fetch(
          'https://googleads.googleapis.com/v14/customers:listAccessibleCustomers',
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
              'developer-token': developerToken,
            },
          }
        );

        if (customersResponse.ok) {
          const customersData = await customersResponse.json();
          customerId = customersData.resourceNames?.[0]?.split('/')[1] || null;
        }
      } catch (customerError) {
        console.warn('Could not fetch Google Ads customers:', customerError);
      }
    }

    // Update workspace with integration data
    if (state) {
      const workspaceRef = adminDb.collection('workspaces').doc(state);
      await workspaceRef.update({
        'integrations.google': {
          connected: true,
          connectedAt: new Date(),
          accountId: customerId || null,
          accountName: 'Google Ads',
          accessToken: encryptToken(access_token),
          refreshToken: refresh_token ? encryptToken(refresh_token) : null,
          expiresAt: new Date(Date.now() + expires_in * 1000),
        },
      });
    }

    return NextResponse.redirect(
      new URL('/integrations?success=google', request.url)
    );
  } catch (error) {
    console.error('Google OAuth error:', error);
    return NextResponse.redirect(
      new URL('/integrations?error=oauth_failed', request.url)
    );
  }
}
