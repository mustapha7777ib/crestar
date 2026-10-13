import Link from "next/link";
import { connection } from "next/server";
import { otherProducts } from "../load";
import { ProductEditor } from "../ProductEditor";

export default async function NewProductPage() {
  await connection();
  const others = await otherProducts();
  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <Link href="/admin/products" className="text-sm text-muted hover:text-ink">
        ← All products
      </Link>
      <h1 className="mb-8 mt-2 font-serif text-4xl">New product</h1>
      <ProductEditor initial={null} others={others} />
    </div>
  );
}
