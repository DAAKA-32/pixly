import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

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

    const validIntegrations = ['meta', 'google', 'stripe', 'shopify'];
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
