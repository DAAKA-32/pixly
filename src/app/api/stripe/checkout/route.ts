import { NextRequest, NextResponse } from 'next/server';
import { getStripe, isStripeConfigured } from '@/lib/stripe/client';
import { getPlanById, STRIPE_CONFIG } from '@/lib/stripe/config';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';

// ===========================================
// PIXLY - Stripe Checkout Session API
// Creates checkout sessions for subscriptions
// ===========================================

interface CheckoutRequestBody {
  planId: string;
  billingInterval: 'monthly' | 'annual';
  source?: 'onboarding';
}

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 503 }
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
    const userEmail = decodedToken.email;

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email not found' },
        { status: 400 }
      );
    }

    // Parse request body
    const body: CheckoutRequestBody = await request.json();
    const { planId, billingInterval, source } = body;

    // Validate plan
    const plan = getPlanById(planId);
    if (!plan) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      );
    }

    // Get the appropriate price ID
    const priceId = billingInterval === 'annual'
      ? plan.stripePriceId.annual
      : plan.stripePriceId.monthly;

    // Get or create Stripe customer
    const stripe = getStripe();
    let stripeCustomerId: string;

    // Check if user already has a Stripe customer ID
    const userDoc = await adminDb.collection('users').doc(userId).get();
    const userData = userDoc.data();

    if (userData?.stripeCustomerId) {
      stripeCustomerId = userData.stripeCustomerId;
    } else {
      // Create a new Stripe customer
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          firebaseUserId: userId,
        },
      });
      stripeCustomerId = customer.id;

      // Save the customer ID to Firestore
      await adminDb.collection('users').doc(userId).set(
        { stripeCustomerId },
        { merge: true }
      );
    }

    // Check if user already has an active subscription
    const existingSubscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: 'active',
      limit: 1,
    });

    if (existingSubscriptions.data.length > 0) {
      // User already has a subscription - redirect to customer portal
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: stripeCustomerId,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
      });

      return NextResponse.json({
        type: 'portal',
        url: portalSession.url,
        message: 'Redirecting to manage your existing subscription',
      });
    }

    // Create checkout session with trial period
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      // 14-day free trial without requiring payment method upfront
      subscription_data: {
        trial_period_days: STRIPE_CONFIG.trial.days,
        metadata: {
          userId,
          planId,
          billingInterval,
        },
      },
      // Collect payment method during trial signup
      payment_method_collection: STRIPE_CONFIG.trial.requiresPaymentMethod
        ? 'always'
        : 'if_required',
      // URLs — onboarding source returns to onboarding flow
      success_url: source === 'onboarding'
        ? `${process.env.NEXT_PUBLIC_APP_URL}/onboarding?session_id={CHECKOUT_SESSION_ID}`
        : `${process.env.NEXT_PUBLIC_APP_URL}${STRIPE_CONFIG.urls.success}`,
      cancel_url: source === 'onboarding'
        ? `${process.env.NEXT_PUBLIC_APP_URL}/onboarding?canceled=true`
        : `${process.env.NEXT_PUBLIC_APP_URL}${STRIPE_CONFIG.urls.cancel}&plan=${planId}`,
      // Metadata for tracking
      metadata: {
        userId,
        planId,
        billingInterval,
      },
      // Allow promotion codes
      allow_promotion_codes: true,
      // Billing address collection
      billing_address_collection: 'auto',
      // Tax calculation (optional - enable if needed)
      // automatic_tax: { enabled: true },
    });

    return NextResponse.json({
      type: 'checkout',
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error) {
    console.error('Checkout session error:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
