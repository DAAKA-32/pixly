import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { encryptToken } from '@/lib/crypto/tokens';
import {
  exchangeShopifyCode,
  fetchShopInfo,
  verifyShopifyHmac,
} from '@/lib/integrations/shopify';

// ===========================================
// PIXLY - Shopify OAuth Callback
// Exchange authorization code for access token
// ===========================================

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const shop = searchParams.get('shop');
  const state = searchParams.get('state'); // workspaceId
  const hmac = searchParams.get('hmac');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (error) {
    console.error('Shopify auth error:', error, errorDescription);
    return NextResponse.redirect(
      new URL('/integrations?error=shopify_auth_failed', request.url)
    );
  }

  if (!code || !shop) {
    return NextResponse.redirect(
      new URL('/integrations?error=no_code', request.url)
    );
  }

  // Verify HMAC signature to ensure the request came from Shopify
  const apiSecret = process.env.SHOPIFY_API_SECRET;
  if (apiSecret && hmac) {
    const queryParams: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });

    const isValid = verifyShopifyHmac(queryParams, apiSecret);
    if (!isValid) {
      console.error('Shopify HMAC verification failed');
      return NextResponse.redirect(
        new URL('/integrations?error=shopify_auth_failed', request.url)
      );
    }
  }

  try {
    // Exchange authorization code for permanent access token
    const tokenData = await exchangeShopifyCode(shop, code);

    if (!tokenData.access_token) {
      console.error('Shopify token exchange returned no access token');
      return NextResponse.redirect(
        new URL('/integrations?error=token_exchange_failed', request.url)
      );
    }

    const { access_token, scope } = tokenData;

    // Fetch shop info to get the store name and details
    let shopName = shop;
    let shopDomain = shop;
    let shopCurrency = 'EUR';

    try {
      const shopInfo = await fetchShopInfo(shop, access_token);
      shopName = shopInfo.name || shop;
      shopDomain = shopInfo.myshopify_domain || shop;
      shopCurrency = shopInfo.currency || 'EUR';
    } catch (shopError) {
      console.warn('Could not fetch Shopify shop info:', shopError);
      // Continue with defaults - the connection still works
    }

    // Update workspace with Shopify integration data
    if (state) {
      const workspaceRef = adminDb.collection('workspaces').doc(state);
      await workspaceRef.update({
        'integrations.shopify': {
          connected: true,
          connectedAt: new Date(),
          accountId: shopDomain,
          accountName: shopName,
          accessToken: encryptToken(access_token),
          refreshToken: null, // Shopify uses permanent tokens, no refresh needed
          expiresAt: null, // Shopify offline tokens don't expire
          metadata: {
            shop: shopDomain,
            scope,
            currency: shopCurrency,
          },
        },
      });
    }

    return NextResponse.redirect(
      new URL('/integrations?success=shopify', request.url)
    );
  } catch (error) {
    console.error('Shopify OAuth error:', error);
    return NextResponse.redirect(
      new URL('/integrations?error=oauth_failed', request.url)
    );
  }
}
