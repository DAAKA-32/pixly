'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Check,
  Sparkles,
  Shield,
  Zap,
  Loader2,
  ExternalLink,
  Calendar,
  AlertCircle,
  Crown,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { PRICING_PLANS, ENTERPRISE_PLAN, getAnnualSavings } from '@/lib/stripe/config';

// ===========================================
// PIXLY - Billing Page
// Subscription management with Stripe
// ===========================================

interface SubscriptionData {
  id: string;
  status: string;
  plan: string;
  planName: string;
  billingInterval: 'monthly' | 'annual';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
  trialEnd: string | null;
  isTrialing: boolean;
  daysUntilTrialEnd: number | null;
}

interface PaymentMethod {
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
}

interface SubscriptionResponse {
  subscription: SubscriptionData | null;
  plan: string;
  status: string;
  paymentMethod: PaymentMethod | null;
}

export default function BillingPage() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string>('free');
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState<string | null>(null);
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly');
  const [error, setError] = useState<string | null>(null);

  // Fetch subscription data
  const fetchSubscription = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/stripe/subscription');

      if (!response.ok) {
        throw new Error('Failed to fetch subscription');
      }

      const data: SubscriptionResponse = await response.json();
      setSubscription(data.subscription);
      setPaymentMethod(data.paymentMethod);
      setCurrentPlan(data.plan || 'free');

      if (data.subscription?.billingInterval) {
        setBillingInterval(data.subscription.billingInterval);
      }
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setCurrentPlan(user?.plan || 'free');
    } finally {
      setIsLoading(false);
    }
  }, [user?.plan]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  // Handle plan selection
  const handleSelectPlan = async (planId: string) => {
    try {
      setIsCheckoutLoading(planId);
      setError(null);

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, billingInterval }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout or Customer Portal
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsCheckoutLoading(null);
    }
  };

  // Open customer portal
  const handleOpenPortal = async () => {
    try {
      setIsPortalLoading(true);
      setError(null);

      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to open billing portal');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Portal error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsPortalLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get status badge
  const getStatusBadge = () => {
    if (!subscription) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">
          Free Plan
        </span>
      );
    }

    if (subscription.isTrialing) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          Trial ({subscription.daysUntilTrialEnd} days left)
        </span>
      );
    }

    if (subscription.cancelAtPeriodEnd) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          Canceling
        </span>
      );
    }

    if (subscription.status === 'active') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          Active
        </span>
      );
    }

    if (subscription.status === 'past_due') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
          Past Due
        </span>
      );
    }

    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Subscription</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Manage your subscription and billing
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-red-200 bg-red-50 p-4"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Current Plan */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-neutral-200 bg-white p-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50">
              {currentPlan === 'free' ? (
                <CreditCard className="h-6 w-6 text-primary-600" />
              ) : (
                <Crown className="h-6 w-6 text-primary-600" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">
                Current plan:{' '}
                <span className="text-primary-600 capitalize">
                  {subscription?.planName || currentPlan}
                </span>
              </h2>
              <p className="text-sm text-neutral-500">
                {subscription ? (
                  <>
                    {subscription.billingInterval === 'annual' ? 'Annual' : 'Monthly'} billing
                    {subscription.isTrialing && ' (Trial)'}
                  </>
                ) : (
                  'Upgrade to unlock all features'
                )}
              </p>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        {/* Subscription Details */}
        {subscription && (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4">
              <div className="flex items-center gap-2 text-sm text-neutral-500">
                <Calendar className="h-4 w-4" />
                Current period
              </div>
              <p className="mt-1 text-sm font-medium text-neutral-900">
                {formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
              </p>
            </div>

            {subscription.trialEnd && subscription.isTrialing && (
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Sparkles className="h-4 w-4" />
                  Trial ends
                </div>
                <p className="mt-1 text-sm font-medium text-blue-900">
                  {formatDate(subscription.trialEnd)}
                </p>
              </div>
            )}

            {subscription.cancelAtPeriodEnd && (
              <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                <div className="flex items-center gap-2 text-sm text-amber-600">
                  <AlertCircle className="h-4 w-4" />
                  Access until
                </div>
                <p className="mt-1 text-sm font-medium text-amber-900">
                  {formatDate(subscription.currentPeriodEnd)}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Manage Subscription Button */}
        {subscription && (
          <div className="mt-6">
            <Button
              variant="outline"
              onClick={handleOpenPortal}
              disabled={isPortalLoading}
              className="gap-2"
            >
              {isPortalLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ExternalLink className="h-4 w-4" />
              )}
              Manage subscription
            </Button>
          </div>
        )}
      </motion.div>

      {/* Billing Interval Toggle */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => setBillingInterval('monthly')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
            billingInterval === 'monthly'
              ? 'bg-primary-500 text-white'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setBillingInterval('annual')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
            billingInterval === 'annual'
              ? 'bg-primary-500 text-white'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          }`}
        >
          Annual
          <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
            -20%
          </span>
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {PRICING_PLANS.map((plan, idx) => {
          const isCurrentPlan = currentPlan === plan.id;
          const price = billingInterval === 'annual' ? plan.price.annual : plan.price.monthly;
          const savings = getAnnualSavings(plan);

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`relative rounded-2xl border-2 bg-white p-6 transition-all duration-300 ${
                plan.popular
                  ? 'border-primary-500 shadow-lg shadow-primary-500/10'
                  : isCurrentPlan
                  ? 'border-primary-300 shadow-md'
                  : 'border-neutral-200 hover:border-neutral-300 hover:shadow-md'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 px-3 py-1 text-xs font-semibold text-white">
                    <Sparkles className="h-3 w-3" />
                    Recommended
                  </span>
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-lg font-bold text-neutral-900">{plan.name}</h3>
                <p className="text-sm text-neutral-500">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-neutral-900">${price}</span>
                <span className="text-neutral-500">/month</span>
                {billingInterval === 'annual' && (
                  <p className="mt-1 text-xs text-green-600">
                    Save ${savings}/year
                  </p>
                )}
              </div>

              <div className="space-y-3 mb-6">
                {plan.displayFeatures.map((feature, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="flex-shrink-0 mt-0.5">
                      <Check className="h-4 w-4 text-primary-500" />
                    </div>
                    <span className="text-sm text-neutral-700">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                variant={isCurrentPlan ? 'outline' : plan.popular ? 'primary' : 'outline'}
                className={`w-full ${
                  plan.popular && !isCurrentPlan ? 'shadow-lg shadow-primary-500/25' : ''
                }`}
                disabled={isCurrentPlan || isCheckoutLoading === plan.id}
                onClick={() => handleSelectPlan(plan.id)}
              >
                {isCheckoutLoading === plan.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isCurrentPlan ? (
                  'Current plan'
                ) : (
                  plan.cta
                )}
              </Button>
            </motion.div>
          );
        })}
      </div>

      {/* Enterprise Plan */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl border border-neutral-200 bg-gradient-to-br from-neutral-900 to-neutral-800 p-8 text-white"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold">{ENTERPRISE_PLAN.name}</h3>
            <p className="mt-2 text-neutral-300">{ENTERPRISE_PLAN.description}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {ENTERPRISE_PLAN.displayFeatures.slice(0, 3).map((feature, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium"
                >
                  <Check className="h-3 w-3" />
                  {feature}
                </span>
              ))}
            </div>
          </div>
          <Button
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-neutral-900 shrink-0"
            onClick={() => window.location.href = 'mailto:sales@pixly.io'}
          >
            Contact Sales
          </Button>
        </div>
      </motion.div>

      {/* Payment Method */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl border border-neutral-200 bg-white p-6"
      >
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">
          Payment method
        </h2>
        {paymentMethod ? (
          <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-16 items-center justify-center rounded-lg bg-white border border-neutral-200">
                <span className="text-xs font-bold uppercase text-neutral-600">
                  {paymentMethod.brand}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-900">
                  •••• •••• •••• {paymentMethod.last4}
                </p>
                <p className="text-xs text-neutral-500">
                  Expires {paymentMethod.expMonth}/{paymentMethod.expYear}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleOpenPortal}>
              Update
            </Button>
          </div>
        ) : (
          <div className="rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50 p-8 text-center">
            <CreditCard className="mx-auto h-10 w-10 text-neutral-400 mb-3" />
            <p className="text-sm font-medium text-neutral-600 mb-1">
              No payment method configured
            </p>
            <p className="text-xs text-neutral-500 mb-4">
              {subscription
                ? 'Add a card to continue your subscription after trial'
                : 'Subscribe to a plan to add a payment method'}
            </p>
            {subscription && (
              <Button variant="outline" size="sm" onClick={handleOpenPortal}>
                Add card
              </Button>
            )}
          </div>
        )}
      </motion.div>

      {/* Trust Section */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4">
          <Shield className="h-5 w-5 text-primary-500" />
          <span className="text-sm text-neutral-700">Secure payments via Stripe</span>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4">
          <Zap className="h-5 w-5 text-primary-500" />
          <span className="text-sm text-neutral-700">Instant activation</span>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4">
          <Check className="h-5 w-5 text-primary-500" />
          <span className="text-sm text-neutral-700">Cancel anytime</span>
        </div>
      </div>
    </div>
  );
}
