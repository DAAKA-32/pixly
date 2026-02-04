'use client';

function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-neutral-100 ${className || ''}`} />;
}

export default function AccountLoading() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header skeleton */}
      <header className="border-b border-neutral-200/80 bg-white">
        <div className="mx-auto max-w-3xl px-6 py-5">
          <Sk className="mb-3 h-3.5 w-36" />
          <Sk className="h-6 w-40" />
          <Sk className="mt-1.5 h-3.5 w-56" />
        </div>
      </header>

      {/* Content skeleton */}
      <main className="mx-auto max-w-3xl px-6 py-8">
        <div className="space-y-10">
          {/* Section 1 */}
          <div>
            <Sk className="mb-3 h-3 w-28" />
            <div className="rounded-2xl border border-neutral-200/80 bg-white p-5">
              <div className="flex items-center gap-4">
                <Sk className="h-14 w-14 rounded-full" />
                <div>
                  <Sk className="h-4 w-32" />
                  <Sk className="mt-1.5 h-3 w-44" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2 - Form */}
          <div>
            <Sk className="mb-3 h-3 w-40" />
            <div className="rounded-2xl border border-neutral-200/80 bg-white">
              <div className="grid gap-5 p-5 sm:grid-cols-2">
                {[1, 2].map((i) => (
                  <div key={i}>
                    <Sk className="mb-1.5 h-3 w-24" />
                    <Sk className="h-10 w-full rounded-xl" />
                  </div>
                ))}
              </div>
              <div className="border-t border-neutral-100 px-5 py-3.5">
                <div className="flex justify-end">
                  <Sk className="h-8 w-24 rounded-xl" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3 - List rows */}
          <div>
            <Sk className="mb-3 h-3 w-20" />
            <div className="rounded-2xl border border-neutral-200/80 bg-white divide-y divide-neutral-100">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center justify-between px-5 py-4">
                  <div>
                    <Sk className="h-3.5 w-32" />
                    <Sk className="mt-1.5 h-3 w-48" />
                  </div>
                  <Sk className="h-8 w-20 rounded-xl" />
                </div>
              ))}
            </div>
          </div>

          {/* Section 4 - Toggles */}
          <div>
            <Sk className="mb-3 h-3 w-24" />
            <div className="rounded-2xl border border-neutral-200/80 bg-white divide-y divide-neutral-100">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between px-5 py-4">
                  <div>
                    <Sk className="h-3.5 w-36" />
                    <Sk className="mt-1.5 h-3 w-52" />
                  </div>
                  <Sk className="h-5 w-9 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
