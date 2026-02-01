// ===========================================
// PIXLY - Stripe Client Configuration
// Server-side Stripe client for API routes
// ===========================================

import Stripe from 'stripe';

// Stripe API version
const STRIPE_API_VERSION = '2025-12-15.clover' as const;

let stripeInstance: Stripe | null = null;

/**
 * Get the Stripe client instance (singleton pattern)
 * Throws an error if STRIPE_SECRET_KEY is not configured
 */
export function getStripe(): Stripe {
  if (stripeInstance) {
    return stripeInstance;
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error(
      'STRIPE_SECRET_KEY is not configured. Please add it to your .env.local file.'
    );
  }

  stripeInstance = new Stripe(secretKey, {
    apiVersion: STRIPE_API_VERSION,
    typescript: true,
  });

  return stripeInstance;
}

/**
 * Check if Stripe is configured
 */
export function isStripeConfigured(): boolean {
  return !!(
    process.env.STRIPE_SECRET_KEY &&
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  );
}

/**
 * Get the publishable key for client-side
 */
export function getStripePublishableKey(): string | undefined {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
}

// Subscription status types
export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'paused'
  | 'trialing'
  | 'unpaid';

// Subscription data stored in Firestore
export interface UserSubscription {
  // Stripe IDs
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripePriceId: string;

  // Plan info
  planId: string;
  planName: string;
  billingInterval: 'monthly' | 'annual';

  // Status
  status: SubscriptionStatus;

  // Dates
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialStart?: Date;
  trialEnd?: Date;
  canceledAt?: Date;
  cancelAtPeriodEnd: boolean;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// Checkout session metadata
export interface CheckoutMetadata {
  userId: string;
  planId: string;
  billingInterval: 'monthly' | 'annual';
}

// Customer portal session result
export interface PortalSessionResult {
  url: string;
}
