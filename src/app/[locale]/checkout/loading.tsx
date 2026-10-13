import { Bone, CheckoutSkeleton } from "@/components/ui/Skeleton";

export default function CheckoutLoading() {
  return (
    <section className="container-luxe pb-24 pt-12 md:pt-16">
      <Bone className="mb-10 h-12 w-56" />
      <CheckoutSkeleton />
    </section>
  );
}
