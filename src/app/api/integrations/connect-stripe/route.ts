import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';
import { verifySession, verifyWorkspaceAccess, verifyIntegrationAccess } from '@/lib/auth/verify-session';

// ===========================================
// PIXLY - Stripe Connect API
// Verify Stripe API key and mark as connected
// ===========================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspaceId } = body;

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'workspaceId is required' },
        { status: 400 }
      );
    }

    // Verify authentication
    const cookieStore = await cookies();
    const session = await verifySession(cookieStore.get('pixly_session')?.value);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const hasAccess = await verifyWorkspaceAccess(session.uid, workspaceId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Verify plan allows Stripe integration
    const canConnect = await verifyIntegrationAccess(session.uid, 'stripe');
    if (!canConnect) {
      return NextResponse.json({ error: 'Upgrade required to use this integration' }, { status: 403 });
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 500 }
      );
    }

    // Verify the Stripe key by fetching account info
    const accountResponse = await fetch('https://api.stripe.com/v1/account', {
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
      },
    });

    if (!accountResponse.ok) {
      return NextResponse.json(
        { error: 'Invalid Stripe API key' },
        { status: 400 }
      );
    }

    const account = await accountResponse.json();

    // Update workspace with Stripe integration data
    const workspaceRef = adminDb.collection('workspaces').doc(workspaceId);
    await workspaceRef.update({
      'integrations.stripe': {
        connected: true,
        connectedAt: new Date(),
        accountId: account.id || null,
        accountName: account.settings?.dashboard?.display_name || account.business_profile?.name || 'Stripe',
        accessToken: null, // Using server-side key, no per-user token
        refreshToken: null,
        expiresAt: null,
      },
    });

    return NextResponse.json({
      success: true,
      accountName: account.settings?.dashboard?.display_name || account.business_profile?.name || 'Stripe',
    });
  } catch (error: any) {
    console.error('Stripe connect error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
