// ===========================================
// PIXLY - Billing Loading Skeleton
// ===========================================

export default function BillingLoading() {
  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="h-7 w-32 animate-pulse rounded-md bg-neutral-100" />
          <div className="h-6 w-16 animate-pulse rounded-full bg-neutral-100" />
        </div>
        <div className="mt-1.5 h-4 w-64 animate-pulse rounded bg-neutral-50" />
      </div>

      {/* Trial banner skeleton */}
      <div className="rounded-xl border border-primary-200/40 bg-primary-50/30 px-4 py-3.5 sm:px-5 sm:py-4">
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 mb-3">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-pulse rounded bg-primary-100" />
            <div className="h-3.5 w-48 animate-pulse rounded bg-primary-100/70" />
          </div>
          <div className="h-3 w-28 animate-pulse rounded bg-primary-100/50" />
        </div>
        <div className="h-1.5 rounded-full bg-primary-100 overflow-hidden">
          <div className="h-full w-1/3 rounded-full bg-primary-200 animate-pulse" />
        </div>
      </div>

      {/* Abonnement */}
      <div className="rounded-xl border border-neutral-200/80 bg-white">
        <div className="flex items-center justify-between px-4 py-3.5 sm:px-5 sm:py-4 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-pulse rounded bg-neutral-100" />
            <div className="h-4 w-24 animate-pulse rounded bg-neutral-100" />
          </div>
        </div>
        <div className="p-4 sm:p-5 space-y-4">
          {/* Plan name + price */}
          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
            <div className="h-7 w-24 animate-pulse rounded bg-neutral-100" />
            <div className="h-3.5 w-40 animate-pulse rounded bg-neutral-50" />
          </div>
          {/* Annual savings */}
          <div className="h-3 w-36 animate-pulse rounded bg-emerald-50" />
          {/* Highlights */}
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-7 w-36 animate-pulse rounded-lg bg-neutral-50" />
            ))}
          </div>
          {/* Detail rows */}
          <div className="space-y-2.5 pt-1">
            <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-2">
              <div className="h-3.5 w-[160px] animate-pulse rounded bg-neutral-50" />
              <div className="h-3.5 w-32 animate-pulse rounded bg-neutral-100" />
            </div>
            <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-2">
              <div className="h-3.5 w-[160px] animate-pulse rounded bg-neutral-50" />
              <div className="h-3.5 w-56 animate-pulse rounded bg-neutral-50" />
            </div>
          </div>
          {/* Actions */}
          <div className="flex items-center gap-3 pt-1">
            <div className="h-9 w-40 animate-pulse rounded-xl bg-neutral-100" />
            <div className="h-3.5 w-24 animate-pulse rounded bg-neutral-50" />
          </div>
        </div>
      </div>

      {/* Moyen de paiement */}
      <div className="rounded-xl border border-neutral-200/80 bg-white">
        <div className="flex items-center justify-between px-4 py-3.5 sm:px-5 sm:py-4 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-pulse rounded bg-neutral-100" />
            <div className="h-4 w-32 animate-pulse rounded bg-neutral-100" />
          </div>
          <div className="h-3.5 w-14 animate-pulse rounded bg-neutral-50" />
        </div>
        <div className="p-4 sm:p-5">
          <div className="flex items-center gap-4">
            <div className="h-10 w-16 animate-pulse rounded-lg bg-neutral-100" />
            <div>
              <div className="h-3.5 w-36 animate-pulse rounded bg-neutral-100" />
              <div className="mt-1.5 h-3 w-20 animate-pulse rounded bg-neutral-50" />
            </div>
          </div>
        </div>
      </div>

      {/* Historique */}
      <div className="rounded-xl border border-neutral-200/80 bg-white">
        <div className="flex items-center gap-2 px-4 py-3.5 sm:px-5 sm:py-4 border-b border-neutral-100">
          <div className="h-4 w-4 animate-pulse rounded bg-neutral-100" />
          <div className="h-4 w-40 animate-pulse rounded bg-neutral-100" />
        </div>

        {/* Desktop table skeleton */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-neutral-100">
                {['w-20', 'w-32', 'w-14', 'w-14', 'w-10'].map((w, i) => (
                  <th key={i} className="px-5 py-3">
                    <div className={`h-3 ${w} animate-pulse rounded bg-neutral-50`} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {[1, 2, 3, 4, 5].map((row) => (
                <tr key={row}>
                  <td className="px-5 py-3">
                    <div className="h-3.5 w-28 animate-pulse rounded bg-neutral-50" />
                  </td>
                  <td className="px-5 py-3">
                    <div className="h-3.5 w-36 animate-pulse rounded bg-neutral-100" />
                  </td>
                  <td className="px-5 py-3">
                    <div className="h-3.5 w-12 animate-pulse rounded bg-neutral-100 ml-auto" />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-neutral-200" />
                      <div className="h-3.5 w-12 animate-pulse rounded bg-neutral-50" />
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="h-3.5 w-8 animate-pulse rounded bg-neutral-50 ml-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile card skeletons */}
        <div className="sm:hidden divide-y divide-neutral-100">
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="px-4 py-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-3.5 w-16 animate-pulse rounded bg-neutral-100" />
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-neutral-200" />
                  <div className="h-3 w-12 animate-pulse rounded bg-neutral-50" />
                </div>
              </div>
              <div className="h-3 w-40 animate-pulse rounded bg-neutral-50" />
              <div className="flex items-center justify-between">
                <div className="h-3 w-28 animate-pulse rounded bg-neutral-50" />
                <div className="h-3 w-8 animate-pulse rounded bg-neutral-50" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Annulation */}
      <div className="flex flex-col gap-3 rounded-xl border border-neutral-200/80 bg-white px-4 py-3.5 sm:px-5 sm:py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
        <div>
          <div className="h-3.5 w-36 animate-pulse rounded bg-neutral-100" />
          <div className="mt-1.5 h-3 w-64 animate-pulse rounded bg-neutral-50" />
        </div>
        <div className="h-3.5 w-14 animate-pulse rounded bg-neutral-50" />
      </div>

      {/* Security note */}
      <div className="flex items-center justify-center gap-2 py-1">
        <div className="h-3.5 w-3.5 animate-pulse rounded bg-neutral-100" />
        <div className="h-3 w-72 animate-pulse rounded bg-neutral-50" />
      </div>
    </div>
  );
}
