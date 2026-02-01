import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { getPlanByStripePriceId, isAnnualPrice } from '@/lib/stripe/config';
import Stripe from 'stripe';

// ===========================================
// PIXLY - Stripe Webhook Handler
// Handles subscription lifecycle events
// ===========================================

// Initialize Stripe only if credentials are available
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

function getStripeClient(): Stripe {
  if (!stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(stripeSecretKey, {
    apiVersion: '2025-12-15.clover',
  });
}

export async function POST(request: NextRequest) {
  if (!stripeSecretKey || !webhookSecret) {
    return NextResponse.json(
      { error: 'Stripe is not configured' },
      { status: 503 }
    );
  }

  const stripe = getStripeClient();
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret!);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Webhook signature verification failed:', message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      // ===========================================
      // SUBSCRIPTION EVENTS
      // ===========================================

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object as Stripe.Subscription);
        break;

      // ===========================================
      // CHECKOUT EVENTS
      // ===========================================

      case 'checkout.session.completed':
        await handleCheckoutComplete(event.data.object as Stripe.Checkout.Session);
        break;

      // ===========================================
      // INVOICE EVENTS
      // ===========================================

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      // ===========================================
      // PAYMENT EVENTS (for conversion tracking)
      // ===========================================

      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;

      case 'charge.succeeded':
        await handleChargeSuccess(event.data.object as Stripe.Charge);
        break;

      case 'charge.refunded':
        await handleRefund(event.data.object as Stripe.Charge);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// ===========================================
// SUBSCRIPTION HANDLERS
// ===========================================

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const customerId = typeof subscription.customer === 'string'
    ? subscription.customer
    : subscription.customer.id;

  const userId = subscription.metadata?.userId;
  const priceId = subscription.items.data[0]?.price.id;
  const plan = getPlanByStripePriceId(priceId);

  // Handle different API versions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sub = subscription as any;
  const currentPeriodStart = sub.current_period_start || sub.currentPeriodStart;
  const currentPeriodEnd = sub.current_period_end || sub.currentPeriodEnd;
  const cancelAtPeriodEnd = sub.cancel_at_period_end ?? sub.cancelAtPeriodEnd ?? false;
  const trialEnd = sub.trial_end || sub.trialEnd;

  console.log('Subscription created:', {
    subscriptionId: subscription.id,
    customerId,
    userId,
    planId: plan?.id,
    status: subscription.status,
  });

  // Find user by customer ID if userId not in metadata
  let targetUserId = userId;
  if (!targetUserId) {
    const usersQuery = await adminDb.collection('users')
      .where('stripeCustomerId', '==', customerId)
      .limit(1)
      .get();

    if (!usersQuery.empty) {
      targetUserId = usersQuery.docs[0].id;
    }
  }

  if (!targetUserId) {
    console.error('Could not find user for subscription:', subscription.id);
    return;
  }

  // Update user's subscription data
  await adminDb.collection('users').doc(targetUserId).set({
    subscription: {
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: customerId,
      stripePriceId: priceId,
      planId: plan?.id || 'unknown',
      planName: plan?.name || 'Unknown',
      billingInterval: isAnnualPrice(priceId) ? 'annual' : 'monthly',
      status: subscription.status,
      currentPeriodStart: currentPeriodStart ? new Date(currentPeriodStart * 1000) : null,
      currentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : null,
      trialEnd: trialEnd ? new Date(trialEnd * 1000) : null,
      cancelAtPeriodEnd,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    plan: plan?.id || 'free',
  }, { merge: true });

  // Create subscription history record
  await adminDb.collection('subscription_history').add({
    userId: targetUserId,
    subscriptionId: subscription.id,
    event: 'created',
    planId: plan?.id,
    status: subscription.status,
    timestamp: new Date(),
  });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = typeof subscription.customer === 'string'
    ? subscription.customer
    : subscription.customer.id;

  const priceId = subscription.items.data[0]?.price.id;
  const plan = getPlanByStripePriceId(priceId);

  // Handle different API versions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sub = subscription as any;
  const currentPeriodStart = sub.current_period_start || sub.currentPeriodStart;
  const currentPeriodEnd = sub.current_period_end || sub.currentPeriodEnd;
  const cancelAtPeriodEnd = sub.cancel_at_period_end ?? sub.cancelAtPeriodEnd ?? false;
  const canceledAt = sub.canceled_at || sub.canceledAt;

  console.log('Subscription updated:', {
    subscriptionId: subscription.id,
    status: subscription.status,
    cancelAtPeriodEnd,
  });

  // Find user by customer ID
  const usersQuery = await adminDb.collection('users')
    .where('stripeCustomerId', '==', customerId)
    .limit(1)
    .get();

  if (usersQuery.empty) {
    console.error('Could not find user for customer:', customerId);
    return;
  }

  const userDoc = usersQuery.docs[0];

  // Update subscription data
  await userDoc.ref.set({
    subscription: {
      stripePriceId: priceId,
      planId: plan?.id || 'unknown',
      planName: plan?.name || 'Unknown',
      billingInterval: isAnnualPrice(priceId) ? 'annual' : 'monthly',
      status: subscription.status,
      currentPeriodStart: currentPeriodStart ? new Date(currentPeriodStart * 1000) : null,
      currentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : null,
      cancelAtPeriodEnd,
      canceledAt: canceledAt ? new Date(canceledAt * 1000) : null,
      updatedAt: new Date(),
    },
    plan: subscription.status === 'active' || subscription.status === 'trialing'
      ? (plan?.id || 'free')
      : 'free',
  }, { merge: true });

  // Log the update
  await adminDb.collection('subscription_history').add({
    userId: userDoc.id,
    subscriptionId: subscription.id,
    event: 'updated',
    planId: plan?.id,
    status: subscription.status,
    cancelAtPeriodEnd,
    timestamp: new Date(),
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = typeof subscription.customer === 'string'
    ? subscription.customer
    : subscription.customer.id;

  console.log('Subscription deleted:', subscription.id);

  // Find user by customer ID
  const usersQuery = await adminDb.collection('users')
    .where('stripeCustomerId', '==', customerId)
    .limit(1)
    .get();

  if (usersQuery.empty) {
    console.error('Could not find user for customer:', customerId);
    return;
  }

  const userDoc = usersQuery.docs[0];

  // Update user to free plan
  await userDoc.ref.set({
    subscription: {
      status: 'canceled',
      canceledAt: new Date(),
      updatedAt: new Date(),
    },
    plan: 'free',
  }, { merge: true });

  // Log the cancellation
  await adminDb.collection('subscription_history').add({
    userId: userDoc.id,
    subscriptionId: subscription.id,
    event: 'deleted',
    timestamp: new Date(),
  });
}

async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  const customerId = typeof subscription.customer === 'string'
    ? subscription.customer
    : subscription.customer.id;

  console.log('Trial will end in 3 days:', subscription.id);

  // Find user by customer ID
  const usersQuery = await adminDb.collection('users')
    .where('stripeCustomerId', '==', customerId)
    .limit(1)
    .get();

  if (usersQuery.empty) return;

  const userDoc = usersQuery.docs[0];
  const userData = userDoc.data();

  // Create a notification for the user
  await adminDb.collection('notifications').add({
    userId: userDoc.id,
    type: 'trial_ending',
    title: 'Your trial is ending soon',
    message: 'Your free trial will end in 3 days. Add a payment method to continue using Pixly.',
    email: userData.email,
    read: false,
    createdAt: new Date(),
  });
}

// ===========================================
// CHECKOUT HANDLERS
// ===========================================

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  // Extract tracking data from metadata (for conversion tracking)
  const { pixelId, fpid, sessionId } = session.metadata || {};

  // Handle subscription checkout completion
  if (session.mode === 'subscription' && session.subscription) {
    console.log('Checkout completed for subscription:', session.subscription);
    // Subscription events will be handled by subscription.created webhook
  }

  // Conversion tracking (existing functionality)
  if (!pixelId) {
    console.log('No pixel ID in checkout session metadata - skipping conversion tracking');
    return;
  }

  // Find workspace by pixel ID
  const workspacesRef = adminDb.collection('workspaces');
  const workspaceQuery = await workspacesRef
    .where('pixelId', '==', pixelId)
    .limit(1)
    .get();

  if (workspaceQuery.empty) {
    console.log('Workspace not found for pixel:', pixelId);
    return;
  }

  const workspace = workspaceQuery.docs[0];

  // Create conversion event
  const conversionData = {
    workspaceId: workspace.id,
    pixelId,
    eventType: 'purchase',
    eventName: 'Stripe Checkout',
    timestamp: new Date(),
    sessionId: sessionId || null,
    fpid: fpid || null,
    value: (session.amount_total || 0) / 100,
    currency: session.currency?.toUpperCase() || 'USD',
    properties: {
      stripeSessionId: session.id,
      customerEmail: session.customer_email,
      paymentStatus: session.payment_status,
    },
    attributed: false,
    attributedTo: null,
  };

  await adminDb.collection('events').add(conversionData);
  await adminDb.collection('conversions').add({
    ...conversionData,
    type: 'purchase',
    synced: {
      meta: { synced: false, syncedAt: null, error: null },
      google: { synced: false, syncedAt: null, error: null },
    },
  });

  console.log('Conversion tracked from Stripe checkout:', session.id);
}

// ===========================================
// INVOICE HANDLERS
// ===========================================

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const customerId = typeof invoice.customer === 'string'
    ? invoice.customer
    : invoice.customer?.id;

  console.log('Invoice paid:', invoice.id, 'Amount:', invoice.amount_paid / 100);

  if (!customerId) return;

  // Find user
  const usersQuery = await adminDb.collection('users')
    .where('stripeCustomerId', '==', customerId)
    .limit(1)
    .get();

  if (usersQuery.empty) return;

  // Log payment
  await adminDb.collection('payments').add({
    userId: usersQuery.docs[0].id,
    invoiceId: invoice.id,
    amount: invoice.amount_paid / 100,
    currency: invoice.currency,
    status: 'paid',
    paidAt: new Date(),
  });
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = typeof invoice.customer === 'string'
    ? invoice.customer
    : invoice.customer?.id;

  console.log('Invoice payment failed:', invoice.id);

  if (!customerId) return;

  // Find user
  const usersQuery = await adminDb.collection('users')
    .where('stripeCustomerId', '==', customerId)
    .limit(1)
    .get();

  if (usersQuery.empty) return;

  const userDoc = usersQuery.docs[0];
  const userData = userDoc.data();

  // Create notification
  await adminDb.collection('notifications').add({
    userId: userDoc.id,
    type: 'payment_failed',
    title: 'Payment failed',
    message: 'Your payment could not be processed. Please update your payment method.',
    email: userData.email,
    read: false,
    createdAt: new Date(),
  });
}

// ===========================================
// PAYMENT HANDLERS (for conversion tracking)
// ===========================================

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const { pixelId, fpid, sessionId } = paymentIntent.metadata || {};

  if (!pixelId) return;

  const workspacesRef = adminDb.collection('workspaces');
  const workspaceQuery = await workspacesRef
    .where('pixelId', '==', pixelId)
    .limit(1)
    .get();

  if (workspaceQuery.empty) return;

  const workspace = workspaceQuery.docs[0];

  await adminDb.collection('events').add({
    workspaceId: workspace.id,
    pixelId,
    eventType: 'purchase',
    eventName: 'Stripe Payment',
    timestamp: new Date(),
    sessionId: sessionId || null,
    fpid: fpid || null,
    value: paymentIntent.amount / 100,
    currency: paymentIntent.currency.toUpperCase(),
    properties: {
      stripePaymentIntentId: paymentIntent.id,
    },
    attributed: false,
    attributedTo: null,
  });
}

async function handleChargeSuccess(charge: Stripe.Charge) {
  const { pixelId } = charge.metadata || {};

  if (!pixelId) return;

  console.log('Charge succeeded:', charge.id, charge.amount / 100, charge.currency);
}

async function handleRefund(charge: Stripe.Charge) {
  const { pixelId } = charge.metadata || {};

  if (!pixelId) return;

  console.log('Charge refunded:', charge.id, charge.amount_refunded / 100);

  const conversionsRef = adminDb.collection('conversions');
  const conversionQuery = await conversionsRef
    .where('properties.stripeChargeId', '==', charge.id)
    .limit(1)
    .get();

  if (!conversionQuery.empty) {
    const conversionDoc = conversionQuery.docs[0];
    await conversionDoc.ref.update({
      refunded: true,
      refundedAmount: charge.amount_refunded / 100,
      refundedAt: new Date(),
    });
  }
}
