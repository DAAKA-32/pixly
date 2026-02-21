// ===========================================
// PIXLY - Auth Loading
// Skeleton matching the split login layout
// ===========================================

export default function AuthLoading() {
  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Left Panel — Logo skeleton (fixed) */}
      <div className="hidden lg:flex lg:w-[48%] flex-shrink-0 items-center justify-center bg-neutral-50 border-r border-neutral-200/60">
        <div className="flex flex-col items-center">
          <div className="h-16 w-16 animate-pulse rounded-xl bg-neutral-200" />
          <div className="mt-5 h-7 w-20 animate-pulse rounded bg-neutral-200" />
        </div>
      </div>

      {/* Right Panel — Form skeleton */}
      <div className="flex-1 overflow-y-auto flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-[400px] space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col items-center">
            <div className="h-14 w-14 animate-pulse rounded-xl bg-neutral-200" />
            <div className="mt-3 h-5 w-16 animate-pulse rounded bg-neutral-200" />
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <div className="h-7 w-52 mx-auto animate-pulse rounded bg-neutral-200" />
            <div className="h-4 w-64 mx-auto animate-pulse rounded bg-neutral-100" />
          </div>

          {/* Form fields */}
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i}>
                <div className="mb-1.5 h-4 w-16 animate-pulse rounded bg-neutral-200" />
                <div className="h-12 w-full animate-pulse rounded-xl bg-neutral-100" />
              </div>
            ))}

            {/* Submit button */}
            <div className="pt-2">
              <div className="h-12 w-full animate-pulse rounded-xl bg-primary-100" />
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="h-px flex-1 bg-neutral-200" />
              <div className="h-3 w-6 animate-pulse rounded bg-neutral-200" />
              <div className="h-px flex-1 bg-neutral-200" />
            </div>

            {/* Social button */}
            <div className="h-12 w-full animate-pulse rounded-xl bg-neutral-100" />
          </div>
        </div>
      </div>
    </div>
  );
}
