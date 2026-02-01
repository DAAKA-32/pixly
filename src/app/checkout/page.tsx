'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  ArrowLeft,
  Sparkles,
  CreditCard,
  Shield,
  Zap,
  Loader2,
  AlertCircle,
  Gift,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { PRICING_PLANS, STRIPE_CONFIG, getAnnualSavings } from '@/lib/stripe/config';

// ===========================================
// PIXLY - Checkout Page
// Premium checkout with Stripe integration
// ===========================================

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly');
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCanceled, setIsCanceled] = useState(false);

  // Get plan from URL params
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
      return;
    }

    const planId = searchParams.get('plan');
    const canceled = searchParams.get('canceled');

    if (canceled === 'true') {
      setIsCanceled(true);
    }

    if (planId && PRICING_PLANS.find((p) => p.id === planId)) {
      setSelectedPlanId(planId);
    } else if (!planId) {
      // Default to Growth plan
      setSelectedPlanId('growth');
    } else {
      // Invalid plan - redirect
      router.replace('/#pricing');
    }
  }, [isAuthenticated, authLoading, router, searchParams]);

  const selectedPlan = PRICING_PLANS.find((p) => p.id === selectedPlanId);
  const price = selectedPlan
    ? billingInterval === 'annual'
      ? selectedPlan.price.annual
      : selectedPlan.price.monthly
    : 0;

  // Handle checkout
  const handleCheckout = useCallback(async () => {
    if (!selectedPlanId) return;

    try {
      setIsCheckoutLoading(true);
      setError(null);

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlanId,
          billingInterval,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsCheckoutLoading(false);
    }
  }, [selectedPlanId, billingInterval]);

  if (authLoading || !selectedPlan) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          <p className="text-sm text-neutral-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-600">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-neutral-900">Pixly</span>
            </Link>

            <Link
              href="/#pricing"
              className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to plans
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Canceled Notice */}
          <AnimatePresence>
            {isCanceled && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-4"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  <p className="text-sm text-amber-700">
                    Checkout was canceled. Feel free to try again or choose a different plan.
                  </p>
                  <button
                    onClick={() => setIsCanceled(false)}
                    className="ml-auto text-sm text-amber-600 hover:text-amber-700"
                  >
                    Dismiss
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Alert */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-8 rounded-xl border border-red-200 bg-red-50 p-4"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <p className="text-sm text-red-700">{error}</p>
                  <button
                    onClick={() => setError(null)}
                    className="ml-auto text-sm text-red-600 hover:text-red-700"
                  >
                    Dismiss
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 sm:text-4xl">
              Start your free trial
            </h1>
            <p className="mt-3 text-lg text-neutral-600">
              {STRIPE_CONFIG.trial.days} days free trial · No credit card required
            </p>
          </div>

          {/* Plan Selector */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              {PRICING_PLANS.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`relative rounded-xl px-6 py-3 text-sm font-medium transition-all ${
                    selectedPlanId === plan.id
                      ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                      : 'bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  {plan.name}
                  {plan.popular && (
                    <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-amber-900">
                      <Sparkles className="h-3 w-3" />
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setBillingInterval('monthly')}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  billingInterval === 'monthly'
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingInterval('annual')}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  billingInterval === 'annual'
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Annual
                <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Left: Plan Details */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="rounded-2xl border-2 border-primary-500 bg-white p-8 shadow-xl shadow-primary-500/10">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold text-neutral-900">
                        {selectedPlan.name}
                      </h2>
                      {selectedPlan.popular && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2 py-0.5 text-xs font-semibold text-primary-600">
                          <Sparkles className="h-3 w-3" />
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-neutral-500">
                      {selectedPlan.description}
                    </p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6 rounded-xl bg-neutral-50 p-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-neutral-900">${price}</span>
                    <span className="text-lg text-neutral-500">/month</span>
                  </div>
                  {billingInterval === 'annual' && (
                    <p className="mt-1 text-sm text-green-600">
                      Save ${getAnnualSavings(selectedPlan)}/year with annual billing
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-2 text-sm text-neutral-600">
                    <Gift className="h-4 w-4 text-primary-500" />
                    <span>
                      First {STRIPE_CONFIG.trial.days} days free, then ${price}/month
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-semibold text-neutral-700 uppercase tracking-wide">
                    Included features
                  </p>
                  {selectedPlan.displayFeatures.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-50">
                          <Check className="h-3.5 w-3.5 text-primary-600" />
                        </div>
                      </div>
                      <span className="text-sm text-neutral-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Right: Checkout Action */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-lg">
                <h3 className="text-xl font-bold text-neutral-900 mb-6">
                  Complete your subscription
                </h3>

                <div className="space-y-6">
                  {/* Trial Highlight */}
                  <div className="rounded-xl border-2 border-primary-100 bg-primary-50 p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500">
                        <Gift className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-primary-900">
                          {STRIPE_CONFIG.trial.days}-day free trial
                        </h4>
                        <p className="mt-1 text-sm text-primary-700">
                          No credit card required to start. You'll only be charged after your trial ends.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Trust Badges */}
                  <div className="space-y-3 pt-4">
                    <div className="flex items-center gap-3 text-sm text-neutral-600">
                      <Shield className="h-5 w-5 text-primary-500" />
                      <span>Secure checkout powered by Stripe</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-neutral-600">
                      <Zap className="h-5 w-5 text-primary-500" />
                      <span>Instant access after sign up</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-neutral-600">
                      <Check className="h-5 w-5 text-primary-500" />
                      <span>Cancel anytime, no questions asked</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="pt-4">
                    <Button
                      onClick={handleCheckout}
                      disabled={isCheckoutLoading}
                      className="w-full h-14 text-lg font-semibold shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40"
                    >
                      {isCheckoutLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Redirecting to checkout...
                        </>
                      ) : (
                        <>
                          <CreditCard className="mr-2 h-5 w-5" />
                          Start free trial
                        </>
                      )}
                    </Button>
                    <p className="mt-4 text-center text-xs text-neutral-500">
                      By continuing, you agree to our{' '}
                      <Link href="/terms" className="text-primary-600 hover:underline">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-primary-600 hover:underline">
                        Privacy Policy
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bottom Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 rounded-xl border border-neutral-200 bg-white p-6 text-center"
          >
            <p className="text-sm text-neutral-600">
              <span className="font-semibold text-neutral-900">Questions?</span>
              {' '}Contact us at{' '}
              <a href="mailto:support@pixly.io" className="text-primary-600 hover:underline">
                support@pixly.io
              </a>
              {' '}or check our{' '}
              <Link href="/faq" className="text-primary-600 hover:underline">
                FAQ
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}

// Loading fallback
function CheckoutLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        <p className="text-sm text-neutral-500">Loading...</p>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutLoading />}>
      <CheckoutContent />
    </Suspense>
  );
}
