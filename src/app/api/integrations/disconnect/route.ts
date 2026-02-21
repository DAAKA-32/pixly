import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';
import { verifySession, verifyWorkspaceAccess } from '@/lib/auth/verify-session';

// ===========================================
// PIXLY - Integration Disconnect API
// ===========================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspaceId, integrationId } = body;

    if (!workspaceId || !integrationId) {
      return NextResponse.json(
        { error: 'workspaceId and integrationId are required' },
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

    const validIntegrations = ['meta', 'google', 'tiktok', 'stripe', 'shopify', 'hubspot'];
    if (!validIntegrations.includes(integrationId)) {
      return NextResponse.json(
        { error: 'Invalid integration ID' },
        { status: 400 }
      );
    }

    const workspaceRef = adminDb.collection('workspaces').doc(workspaceId);
    const workspaceDoc = await workspaceRef.get();

    if (!workspaceDoc.exists) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 }
      );
    }

    // Reset integration state
    await workspaceRef.update({
      [`integrations.${integrationId}`]: {
        connected: false,
        connectedAt: null,
        accountId: null,
        accountName: null,
        accessToken: null,
        refreshToken: null,
        expiresAt: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Disconnect error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
