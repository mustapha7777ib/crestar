import { Bone, ProductGridSkeleton } from "@/components/ui/Skeleton";

export default function ShopLoading() {
  return (
    <div role="status" aria-busy="true">
      <section className="motif border-b border-stone/70">
        <div className="container-luxe flex flex-col items-center py-16 md:py-24">
          <Bone className="h-3 w-20" />
          <Bone className="mt-5 h-14 w-64 md:h-20 md:w-96" />
          <Bone className="mt-5 h-4 w-full max-w-md" />
        </div>
      </section>
      <section className="container-luxe py-10 md:py-14">
        <div className="flex gap-7">
          {["w-10", "w-24", "w-28", "w-32", "w-28"].map((w, i) => (
            <Bone key={i} className={`h-3 ${w}`} />
          ))}
        </div>
        <div className="mt-12">
          <ProductGridSkeleton />
        </div>
      </section>
    </div>
  );
}
