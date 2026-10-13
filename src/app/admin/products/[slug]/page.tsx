import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { loadProductForm, otherProducts } from "../load";
import { ProductEditor } from "../ProductEditor";

export default async function EditProductPage({ params }: PageProps<"/admin/products/[slug]">) {
  await connection();
  const { slug } = await params;
  const [product, others] = await Promise.all([loadProductForm(slug), otherProducts(slug)]);
  if (!product) notFound();
  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <Link href="/admin/products" className="text-sm text-muted hover:text-ink">
        ← All products
      </Link>
      <div className="mb-8 mt-2 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-serif text-4xl">{product.name.en}</h1>
        <a href={`/en/products/${product.slug}`} target="_blank" className="text-sm text-muted underline hover:text-ink">
          View in shop ↗
        </a>
      </div>
      <ProductEditor initial={product} others={others} />
    </div>
  );
}
