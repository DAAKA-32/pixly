import { Skeleton, SkeletonButton } from '@/components/ui/skeleton';

// ===========================================
// PIXLY - Checkout Loading
// Next.js automatic loading state for checkout
// ===========================================

export default function CheckoutLoading() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-5 w-32" />
        </div>
      </header>

      <main className="mx-auto max-w-5xl p-6 lg:p-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* Left Column - Form */}
          <div className="lg:col-span-3 space-y-6">
            {/* Plan Selection */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-6">
              <Skeleton className="mb-6 h-6 w-40" />

              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 rounded-xl border border-neutral-200 p-4"
                  >
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                      <Skeleton className="mt-2 h-3 w-64" />
                      <div className="mt-3 flex flex-wrap gap-2">
                        {[1, 2, 3].map((j) => (
                          <Skeleton key={j} className="h-5 w-20 rounded-full" />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Billing Info */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-6">
              <Skeleton className="mb-6 h-6 w-48" />

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Skeleton className="mb-2 h-4 w-16" />
                    <Skeleton className="h-12 w-full rounded-xl" />
                  </div>
                  <div>
                    <Skeleton className="mb-2 h-4 w-16" />
                    <Skeleton className="h-12 w-full rounded-xl" />
                  </div>
                </div>
                <div>
                  <Skeleton className="mb-2 h-4 w-20" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>
                <div>
                  <Skeleton className="mb-2 h-4 w-24" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-6">
              <Skeleton className="mb-6 h-6 w-44" />
              <Skeleton className="h-48 w-full rounded-xl" />
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 rounded-2xl border border-neutral-200 bg-white p-6">
              <Skeleton className="mb-6 h-6 w-32" />

              {/* Selected Plan */}
              <div className="rounded-xl bg-neutral-50 p-4 mb-6">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-6 w-6 rounded-full" />
                </div>
                <Skeleton className="mt-2 h-3 w-48" />
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 border-b border-neutral-200 pb-4 mb-4">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center mb-6">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-7 w-24" />
              </div>

              {/* CTA */}
              <SkeletonButton size="lg" width="w-full" />

              {/* Security badges */}
              <div className="mt-4 flex items-center justify-center gap-4">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
