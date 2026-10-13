import { Bone } from "@/components/ui/Skeleton";

// Shown while the payment status is confirmed with the provider.
export default function CompleteLoading() {
  return (
    <section className="motif" role="status" aria-busy="true">
      <div className="container-luxe grid grid-cols-[minmax(0,1fr)] gap-12 py-16 md:py-24 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-20">
        <div>
          <Bone className="h-14 w-14 rounded-t-full" />
          <Bone className="mt-8 h-3 w-36" />
          <Bone className="mt-5 h-14 w-3/4" />
          <Bone className="mt-6 h-4 w-full max-w-lg" />
          <Bone className="mt-3 h-4 w-2/3 max-w-md" />
          <Bone className="mt-10 h-[3.25rem] w-56" />
        </div>
        <div className="self-start border border-stone bg-paper p-6">
          <div className="flex justify-between">
            <Bone className="h-3 w-16" />
            <Bone className="h-7 w-32" />
          </div>
          {[0, 1].map((i) => (
            <div key={i} className="mt-6 flex items-center gap-4">
              <Bone className="aspect-[4/5] w-12" />
              <Bone className="h-4 flex-1" />
              <Bone className="h-4 w-14" />
            </div>
          ))}
          <Bone className="mt-8 h-20 w-full" />
        </div>
      </div>
    </section>
  );
}
