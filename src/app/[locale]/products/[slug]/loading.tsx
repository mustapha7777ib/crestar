import { Bone } from "@/components/ui/Skeleton";

export default function ProductLoading() {
  return (
    <div className="container-luxe pb-20 pt-6 md:pt-10" role="status" aria-busy="true">
      <Bone className="h-3 w-56" />
      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-10 md:mt-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-16 xl:gap-24">
        <div className="flex flex-col-reverse gap-4 md:flex-row md:items-start">
          <div className="flex gap-3 md:flex-col">
            {[0, 1, 2].map((i) => (
              <Bone key={i} className="aspect-[4/5] w-16 md:w-20" />
            ))}
          </div>
          <Bone className="aspect-[4/5] min-w-0 flex-1" />
        </div>
        <div>
          <Bone className="h-3 w-40" />
          <Bone className="mt-5 h-12 w-4/5" />
          <Bone className="mt-3 h-4 w-1/2" />
          <Bone className="mt-8 h-16 w-full" />
          <Bone className="mt-8 h-9 w-28" />
          <div className="mt-8 flex gap-2">
            {[0, 1, 2].map((i) => (
              <Bone key={i} className="h-14 w-24" />
            ))}
          </div>
          <div className="mt-8 flex gap-3">
            <Bone className="h-[3.25rem] w-32" />
            <Bone className="h-[3.25rem] flex-1" />
          </div>
          {[0, 1, 2].map((i) => (
            <Bone key={i} className="mt-6 h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
