import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { verifySession } from '@/lib/auth/verify-session';
import { adminDb } from '@/lib/firebase/admin';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { CURRENT_TERMS_VERSION } from '@/lib/auth/terms';

// ===========================================
// PIXLY - Terms Acceptance API
// Records explicit CGU acceptance (GDPR compliant)
// Stores timestamp + version for audit trail
// ===========================================

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 calls per 60 seconds per IP
    const ip = getClientIp(request);
    const rateCheck = checkRateLimit(`terms:${ip}`, { limit: 5, windowSeconds: 60 });
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    // Verify the caller is authenticated via session cookie
    const cookieValue = request.cookies.get('pixly_session')?.value;
    const session = await verifySession(cookieValue);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Verify user exists in Firestore
    const userRef = adminDb.collection('users').doc(session.uid);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Idempotent: if already accepted with current version, return success
    const data = userDoc.data();
    if (data?.termsAcceptedAt && data?.termsVersion === CURRENT_TERMS_VERSION) {
      return NextResponse.json({
        success: true,
        message: 'Already accepted',
        termsVersion: CURRENT_TERMS_VERSION,
      });
    }

    // Record terms acceptance with server timestamp
    await userRef.update({
      termsAcceptedAt: FieldValue.serverTimestamp(),
      termsVersion: CURRENT_TERMS_VERSION,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      termsVersion: CURRENT_TERMS_VERSION,
    });
  } catch (error) {
    console.error('[Accept Terms] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
