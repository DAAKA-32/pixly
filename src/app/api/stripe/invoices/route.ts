import { NextResponse } from 'next/server';
import { getStripe, isStripeConfigured } from '@/lib/stripe/client';
import { adminDb } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth/verify-session';

// ===========================================
// PIXLY - Invoices API
// Fetch real invoice history from Stripe
// ===========================================

export async function GET() {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json({ invoices: [] });
    }

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('pixly_session')?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify session and get user
    const session = await verifySession(sessionCookie);
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }
    const userDoc = await adminDb.collection('users').doc(session.uid).get();
    const userData = userDoc.data();

    if (!userData?.stripeCustomerId) {
      return NextResponse.json({ invoices: [] });
    }

    const stripe = getStripe();

    // Fetch invoices from Stripe
    const stripeInvoices = await stripe.invoices.list({
      customer: userData.stripeCustomerId,
      limit: 20,
    });

    const invoices = stripeInvoices.data.map((inv) => ({
      id: inv.id,
      date: inv.created ? new Date(inv.created * 1000).toISOString() : null,
      description: inv.lines.data[0]?.description || 'Abonnement Pixly',
      amount: (inv.amount_paid ?? inv.total ?? 0) / 100,
      currency: inv.currency?.toUpperCase() || 'EUR',
      status: inv.status === 'paid' ? 'paid' : inv.status === 'open' ? 'pending' : 'failed',
      pdfUrl: inv.invoice_pdf || null,
    }));

    return NextResponse.json({ invoices });
  } catch (error) {
    console.error('Invoice fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}
