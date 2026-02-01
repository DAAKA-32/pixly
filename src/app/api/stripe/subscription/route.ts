import { NextRequest, NextResponse } from 'next/server';
import { getStripe, isStripeConfigured } from '@/lib/stripe/client';
import { getPlanByStripePriceId, isAnnualPrice } from '@/lib/stripe/config';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';

// ===========================================
// PIXLY - Subscription Status API
// Get current user's subscription details
// ===========================================

export async function GET() {
  try {
    // Check if Stripe is configured
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { subscription: null, plan: 'free' },
        { status: 200 }
      );
    }

    // Get the session cookie to authenticate the user
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('pixly_session')?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify the session and get user
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
    } catch {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    const userId = decodedToken.uid;

    // Get user data from Firestore
    const userDoc = await adminDb.collection('users').doc(userId).get();
    const userData = userDoc.data();

    if (!userData?.stripeCustomerId) {
      return NextResponse.json({
        subscription: null,
        plan: 'free',
        status: 'inactive',
      });
    }

    const stripe = getStripe();

    // Get active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: userData.stripeCustomerId,
      status: 'all',
      limit: 1,
      expand: ['data.default_payment_method'],
    });

    if (subscriptions.data.length === 0) {
      return NextResponse.json({
        subscription: null,
        plan: 'free',
        status: 'inactive',
      });
    }

    const subscription = subscriptions.data[0];
    const priceId = subscription.items.data[0]?.price.id;
    const plan = getPlanByStripePriceId(priceId);
    const isAnnual = isAnnualPrice(priceId);

    // Access subscription properties (handle different API versions)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sub = subscription as any;
    const currentPeriodStart = sub.current_period_start || sub.currentPeriodStart;
    const currentPeriodEnd = sub.current_period_end || sub.currentPeriodEnd;
    const cancelAtPeriodEnd = sub.cancel_at_period_end ?? sub.cancelAtPeriodEnd ?? false;
    const canceledAt = sub.canceled_at || sub.canceledAt;
    const trialEnd = sub.trial_end || sub.trialEnd;

    // Format subscription data
    const subscriptionData = {
      id: subscription.id,
      status: subscription.status,
      plan: plan?.id || 'unknown',
      planName: plan?.name || 'Unknown',
      billingInterval: isAnnual ? 'annual' : 'monthly',
      currentPeriodStart: currentPeriodStart ? new Date(currentPeriodStart * 1000).toISOString() : null,
      currentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : null,
      cancelAtPeriodEnd,
      canceledAt: canceledAt ? new Date(canceledAt * 1000).toISOString() : null,
      trialEnd: trialEnd ? new Date(trialEnd * 1000).toISOString() : null,
      isTrialing: subscription.status === 'trialing',
      daysUntilTrialEnd: trialEnd
        ? Math.ceil((trialEnd * 1000 - Date.now()) / (1000 * 60 * 60 * 24))
        : null,
    };

    // Get payment method if available
    let paymentMethod = null;
    if (subscription.default_payment_method && typeof subscription.default_payment_method !== 'string') {
      const pm = subscription.default_payment_method;
      if (pm.card) {
        paymentMethod = {
          brand: pm.card.brand,
          last4: pm.card.last4,
          expMonth: pm.card.exp_month,
          expYear: pm.card.exp_year,
        };
      }
    }

    return NextResponse.json({
      subscription: subscriptionData,
      plan: plan?.id || 'free',
      status: subscription.status,
      paymentMethod,
      features: plan?.features || null,
    });
  } catch (error) {
    console.error('Subscription fetch error:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}
