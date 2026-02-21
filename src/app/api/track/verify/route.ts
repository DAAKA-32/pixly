import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

// ===========================================
// PIXLY - Pixel Verification Endpoint
// Checks if any tracking events exist for a given pixel ID
// ===========================================

export async function GET(request: NextRequest) {
  const pixelId = request.nextUrl.searchParams.get('pixelId');
  if (!pixelId) {
    return NextResponse.json({ verified: false }, { status: 400 });
  }

  // Check if any events exist for this pixel
  const eventsRef = adminDb.collection('events');
  const snapshot = await eventsRef
    .where('pixelId', '==', pixelId)
    .limit(1)
    .get();

  return NextResponse.json({ verified: !snapshot.empty });
}
