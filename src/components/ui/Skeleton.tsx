// Building blocks for loading.tsx files and pre-hydration states.
// Shapes mirror the real components so nothing jumps when content arrives.

export function Bone({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

export function ProductCardSkeleton({ arched = false }: { arched?: boolean }) {
  return (
    <div aria-hidden="true">
      <Bone className={`aspect-[4/5] ${arched ? "rounded-t-full" : ""}`} />
      <div className="pt-4">
        <Bone className="h-2.5 w-32" />
        <Bone className="mt-3 h-5 w-3/4" />
        <Bone className="mt-2 h-3.5 w-1/2" />
        <Bone className="mt-3 h-3.5 w-20" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-14 md:grid-cols-3 md:gap-x-7 xl:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Two-column form + summary, used by checkout and the bag before they hydrate. */
export function CheckoutSkeleton() {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-16" role="status" aria-busy="true">
      <div className="space-y-10">
        {[0, 1].map((section) => (
          <div key={section}>
            <Bone className="h-8 w-40" />
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {[0, 1, 2, 3].map((f) => (
                <div key={f} className={f > 1 ? "sm:col-span-2" : ""}>
                  <Bone className="h-3 w-24" />
                  <Bone className="mt-2 h-[3.25rem] w-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="self-start border border-stone bg-paper p-6">
        <Bone className="h-7 w-44" />
        {[0, 1].map((l) => (
          <div key={l} className="mt-6 flex items-center gap-4">
            <Bone className="aspect-[4/5] w-14" />
            <div className="flex-1">
              <Bone className="h-4 w-3/4" />
              <Bone className="mt-2 h-3 w-1/3" />
            </div>
            <Bone className="h-4 w-14" />
          </div>
        ))}
        <Bone className="mt-8 h-4 w-full" />
        <Bone className="mt-3 h-4 w-full" />
        <Bone className="mt-6 h-[3.25rem] w-full" />
      </div>
    </div>
  );
}
