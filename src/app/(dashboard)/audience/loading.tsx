// ===========================================
// PIXLY -- Audience Loading Skeleton
// ===========================================

export default function AudienceLoading() {
  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="h-6 w-28 animate-pulse rounded-md bg-neutral-100" />
          <div className="mt-1.5 h-3.5 w-56 animate-pulse rounded bg-neutral-50" />
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex rounded-lg border border-neutral-200/80 bg-white p-0.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-9 w-12 sm:h-8 animate-pulse rounded-md bg-neutral-50 mx-0.5" />
            ))}
          </div>
          <div className="h-8 w-8 animate-pulse rounded-xl bg-neutral-100" />
        </div>
      </div>

      {/* Dimension Tabs */}
      <div className="flex items-center gap-1 rounded-lg border border-neutral-200/80 bg-white p-1">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-8 w-24 animate-pulse rounded-md bg-neutral-50" />
        ))}
      </div>

      {/* Top Segment Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-neutral-200/80 bg-white p-4 sm:p-5">
            <div className="h-3 w-36 animate-pulse rounded bg-neutral-50 mb-3" />
            <div className="h-3.5 w-20 animate-pulse rounded bg-neutral-100 mb-2" />
            <div className="h-6 w-24 animate-pulse rounded bg-neutral-100 mb-2" />
            <div className="h-2.5 w-28 animate-pulse rounded bg-neutral-50" />
          </div>
        ))}
      </div>

      {/* Segment Table */}
      <div className="rounded-xl border border-neutral-200/80 bg-white">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-100 sm:px-5 sm:py-4">
          <div className="h-4 w-4 animate-pulse rounded bg-neutral-100" />
          <div className="h-4 w-36 animate-pulse rounded bg-neutral-100" />
        </div>

        {/* Mobile cards */}
        <div className="divide-y divide-neutral-100 sm:hidden">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="px-4 py-3.5">
              <div className="flex items-center justify-between mb-2.5">
                <div className="h-3.5 w-24 animate-pulse rounded bg-neutral-100" />
                <div className="h-3.5 w-16 animate-pulse rounded bg-neutral-100" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map((j) => (
                  <div key={j}>
                    <div className="h-2.5 w-12 animate-pulse rounded bg-neutral-50 mb-1" />
                    <div className="h-3.5 w-14 animate-pulse rounded bg-neutral-100" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-neutral-100">
                {['w-24', 'w-16', 'w-16', 'w-16', 'w-16', 'w-14', 'w-14'].map((w, i) => (
                  <th key={i} className="px-5 py-3">
                    <div className={`h-3 ${w} animate-pulse rounded bg-neutral-50`} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {[1, 2, 3, 4, 5].map((row) => (
                <tr key={row}>
                  <td className="px-5 py-3"><div className="h-3.5 w-28 animate-pulse rounded bg-neutral-100" /></td>
                  <td className="px-5 py-3"><div className="h-3.5 w-14 animate-pulse rounded bg-neutral-50 ml-auto" /></td>
                  <td className="px-5 py-3"><div className="h-3.5 w-12 animate-pulse rounded bg-neutral-50 ml-auto" /></td>
                  <td className="px-5 py-3"><div className="h-3.5 w-16 animate-pulse rounded bg-neutral-100 ml-auto" /></td>
                  <td className="px-5 py-3"><div className="h-3.5 w-12 animate-pulse rounded bg-neutral-50 ml-auto" /></td>
                  <td className="px-5 py-3"><div className="h-3.5 w-14 animate-pulse rounded bg-neutral-50 ml-auto" /></td>
                  <td className="px-5 py-3"><div className="h-6 w-14 animate-pulse rounded-md bg-neutral-100 ml-auto" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom row: Device donut + Geo */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-neutral-200/80 bg-white p-4 sm:p-6">
          <div className="h-3.5 w-32 animate-pulse rounded bg-neutral-100 mb-5" />
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <div className="h-44 w-44 animate-pulse rounded-full bg-neutral-50 flex-shrink-0" />
            <div className="flex-1 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-neutral-200" />
                    <div className="flex-1 h-3 animate-pulse rounded bg-neutral-50" />
                    <div className="h-3 w-14 animate-pulse rounded bg-neutral-100" />
                    <div className="h-3 w-8 animate-pulse rounded bg-neutral-50" />
                  </div>
                  <div className="ml-[22px]">
                    <div className="h-1 animate-pulse rounded-full bg-neutral-100" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200/80 bg-white p-4 sm:p-6">
          <div className="h-3.5 w-28 animate-pulse rounded bg-neutral-100 mb-5" />
          <div className="h-44 animate-pulse rounded-lg bg-neutral-50/50" />
        </div>
      </div>
    </div>
  );
}
