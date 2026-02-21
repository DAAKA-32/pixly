// ===========================================
// PIXLY — Attribution Loading Skeleton
// ===========================================

export default function AttributionLoading() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="h-6 w-32 animate-pulse rounded-md bg-neutral-100" />
          <div className="mt-1.5 h-3.5 w-56 sm:w-72 animate-pulse rounded bg-neutral-50" />
        </div>
        <div className="flex rounded-lg border border-neutral-200/80 bg-white p-0.5 self-start sm:self-auto">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-9 w-12 sm:h-8 animate-pulse rounded-md bg-neutral-50 mx-0.5" />
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-neutral-200/80 bg-white px-3.5 py-3 sm:px-5 sm:py-4">
            <div className="h-3 w-16 sm:w-20 animate-pulse rounded bg-neutral-100 mb-2" />
            <div className="h-5 sm:h-6 w-20 sm:w-24 animate-pulse rounded bg-neutral-100" />
          </div>
        ))}
      </div>

      {/* Channel Attribution + Donut */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Channel Bars — 2/3 */}
        <div className="lg:col-span-2 rounded-xl border border-neutral-200/80 bg-white">
          <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-pulse rounded bg-neutral-100" />
              <div className="h-4 w-32 sm:w-36 animate-pulse rounded bg-neutral-100" />
            </div>
            <div className="h-5 w-16 animate-pulse rounded-md bg-neutral-50" />
          </div>
          <div className="p-4 sm:p-5">
            {/* Desktop column headers */}
            <div className="hidden sm:flex items-center gap-3 px-3 -mx-3 pb-3">
              <div className="w-[140px] flex-shrink-0 h-2.5 animate-pulse rounded bg-neutral-50" />
              <div className="flex-1" />
              <div className="flex items-center flex-shrink-0 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-2.5 w-12 animate-pulse rounded bg-neutral-50" />
                ))}
              </div>
            </div>

            <div className="space-y-1 sm:space-y-0">
              {[100, 72, 55, 38, 20].map((width, i) => (
                <div key={i} className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3 px-3 py-2.5 -mx-3">
                  {/* Channel name */}
                  <div className="flex items-center justify-between sm:justify-start sm:w-[140px] sm:flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-neutral-200" />
                      <div className="h-3.5 w-20 animate-pulse rounded bg-neutral-100" />
                    </div>
                    <div className="h-5 w-10 animate-pulse rounded bg-neutral-50 sm:hidden" />
                  </div>
                  {/* Bar */}
                  <div className="flex-1 h-4 sm:h-5 bg-neutral-100/60 rounded overflow-hidden">
                    <div
                      className="h-full rounded bg-neutral-200/60 animate-pulse"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                  {/* Desktop metrics */}
                  <div className="hidden sm:flex items-center flex-shrink-0 gap-1">
                    <div className="h-3.5 w-[68px] animate-pulse rounded bg-neutral-50" />
                    <div className="h-3.5 w-[68px] animate-pulse rounded bg-neutral-100" />
                    <div className="h-5 w-[56px] animate-pulse rounded-md bg-neutral-50" />
                    <div className="h-3.5 w-[44px] animate-pulse rounded bg-neutral-50" />
                  </div>
                  {/* Mobile metrics */}
                  <div className="flex items-center justify-between sm:hidden">
                    <div className="h-3 w-14 animate-pulse rounded bg-neutral-100" />
                    <div className="h-3 w-16 animate-pulse rounded bg-neutral-50" />
                    <div className="h-3 w-8 animate-pulse rounded bg-neutral-50" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Donut — desktop only, 1/3 */}
        <div className="hidden lg:block rounded-2xl border border-neutral-200/80 bg-white p-6">
          <div className="h-3.5 w-32 animate-pulse rounded bg-neutral-100 mb-5" />
          <div className="mx-auto h-44 w-44 animate-pulse rounded-full bg-neutral-50" />
          <div className="mt-5 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-neutral-200" />
                  <div className="flex-1 h-3 animate-pulse rounded bg-neutral-50" />
                  <div className="h-3 w-14 animate-pulse rounded bg-neutral-100" />
                  <div className="h-3 w-8 animate-pulse rounded bg-neutral-50" />
                </div>
                <div className="ml-5">
                  <div className="h-1 animate-pulse rounded-full bg-neutral-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue Trend Chart */}
      <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 sm:p-6">
        <div className="mb-5 flex items-baseline justify-between">
          <div>
            <div className="h-3.5 w-24 animate-pulse rounded bg-neutral-100" />
            <div className="mt-2 h-7 w-32 animate-pulse rounded bg-neutral-100" />
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-neutral-200" />
            <div className="h-2.5 w-14 animate-pulse rounded bg-neutral-50" />
          </div>
        </div>
        <div className="h-64 animate-pulse rounded-lg bg-neutral-50/50" />
      </div>

      {/* Campaign Performance */}
      <div className="rounded-xl border border-neutral-200/80 bg-white">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-pulse rounded bg-neutral-100" />
            <div className="h-4 w-24 animate-pulse rounded bg-neutral-100" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-36 sm:w-44 animate-pulse rounded-lg bg-neutral-50" />
            <div className="flex rounded-lg border border-neutral-200/80 bg-neutral-50 p-0.5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-7 w-12 sm:w-14 animate-pulse rounded-md bg-neutral-100/60 mx-0.5" />
              ))}
            </div>
          </div>
        </div>

        {/* Mobile: card skeletons */}
        <div className="divide-y divide-neutral-100 sm:hidden">
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="px-4 py-3.5">
              <div className="flex items-start gap-2 mb-2.5">
                <div className="mt-1 h-2 w-2 animate-pulse rounded-full bg-neutral-200" />
                <div className="flex-1">
                  <div className="h-3.5 w-3/4 animate-pulse rounded bg-neutral-100 mb-1.5" />
                  <div className="h-3 w-16 animate-pulse rounded bg-neutral-50" />
                </div>
                <div className="h-5 w-12 animate-pulse rounded-md bg-neutral-100" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map((col) => (
                  <div key={col}>
                    <div className="h-2.5 w-10 animate-pulse rounded bg-neutral-50 mb-1" />
                    <div className="h-3.5 w-14 animate-pulse rounded bg-neutral-100" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: table skeleton */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-neutral-100">
                {['w-32', 'w-20', 'w-16', 'w-16', 'w-12', 'w-14', 'w-14'].map((w, i) => (
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
                    <div className="h-3.5 w-40 animate-pulse rounded bg-neutral-100" />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-neutral-200" />
                      <div className="h-3.5 w-16 animate-pulse rounded bg-neutral-50" />
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="h-3.5 w-14 animate-pulse rounded bg-neutral-50 ml-auto" />
                  </td>
                  <td className="px-5 py-3">
                    <div className="h-3.5 w-14 animate-pulse rounded bg-neutral-100 ml-auto" />
                  </td>
                  <td className="px-5 py-3">
                    <div className="h-3.5 w-8 animate-pulse rounded bg-neutral-50 ml-auto" />
                  </td>
                  <td className="px-5 py-3">
                    <div className="h-3.5 w-14 animate-pulse rounded bg-neutral-50 ml-auto" />
                  </td>
                  <td className="px-5 py-3">
                    <div className="h-6 w-14 animate-pulse rounded-md bg-neutral-100 ml-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
