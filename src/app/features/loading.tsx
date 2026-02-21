export default function FeaturesLoading() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero skeleton */}
      <div className="pt-28 pb-16 sm:pt-40 sm:pb-20">
        <div className="container-main text-center">
          <div className="mx-auto h-4 w-32 rounded-full bg-neutral-200 animate-pulse mb-6" />
          <div className="mx-auto h-12 w-3/4 max-w-xl rounded-lg bg-neutral-200 animate-pulse mb-4" />
          <div className="mx-auto h-5 w-2/3 max-w-lg rounded-lg bg-neutral-200 animate-pulse" />
        </div>
      </div>

      {/* Core features skeleton */}
      <div className="container-main space-y-12 pb-20">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-neutral-200 bg-white p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1 space-y-4">
                <div className="h-3 w-12 rounded bg-neutral-200 animate-pulse" />
                <div className="h-8 w-3/4 rounded-lg bg-neutral-200 animate-pulse" />
                <div className="h-4 w-full rounded bg-neutral-100 animate-pulse" />
                <div className="h-4 w-5/6 rounded bg-neutral-100 animate-pulse" />
                <div className="space-y-2 pt-4">
                  {[...Array(5)].map((_, j) => (
                    <div key={j} className="h-3 w-2/3 rounded bg-neutral-100 animate-pulse" />
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <div className="h-48 rounded-2xl bg-neutral-100 animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
