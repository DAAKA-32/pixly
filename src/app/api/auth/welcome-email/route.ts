import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth/verify-session';
import { sendWelcomeEmail } from '@/lib/email/resend';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

// ===========================================
// PIXLY - Welcome Email API
// Called client-side after successful signup
// ===========================================

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 3 calls per 60 seconds per IP
    const ip = getClientIp(request);
    const rateCheck = checkRateLimit(`welcome:${ip}`, { limit: 3, windowSeconds: 60 });
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const body = await request.json();
    const { sessionId, displayName, email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // Verify the caller is authenticated
    const session = await verifySession(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Send welcome email (non-blocking — don't fail the response)
    sendWelcomeEmail(email, displayName || 'there').catch((err) =>
      console.error('[Welcome Email] Error:', err)
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Welcome Email] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
