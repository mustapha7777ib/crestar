import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { categories } from "@/data/categories";
import { LOW_STOCK } from "@/lib/catalog-types";
import { db } from "@/lib/db";
import { toggleActiveAction, updateVariantAction } from "./actions";

export default async function ProductsPage({ searchParams }: PageProps<"/admin/products">) {
  await connection();
  const { saved } = await searchParams;
  const products = await db.product.findMany({ include: { variants: { orderBy: { sort: "asc" } } }, orderBy: { sort: "asc" } });
  const lowCount = products.flatMap((p) => p.variants).filter((v) => v.stock !== null && v.stock <= LOW_STOCK).length;

  return (
    <div className="mx-auto max-w-7xl px-5 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-stone pb-6">
        <div>
          <h1 className="font-serif text-4xl">Products</h1>
          <p className="mt-1 text-sm text-muted">
            {products.length} products · {lowCount} size{lowCount === 1 ? "" : "s"} low or sold out
          </p>
        </div>
        <Link href="/admin/products/new" className="bg-ink px-4 py-2 text-sm font-semibold text-paper">
          + New product
        </Link>
      </div>
      {typeof saved === "string" && (
        <p className="mt-4 border border-green/40 bg-green/10 px-4 py-3 text-sm">Saved. The shop shows the change on its next page load.</p>
      )}

      {categories.map((cat) => {
        const list = products.filter((p) => p.category === cat.id);
        if (!list.length) return null;
        return (
          <section key={cat.id} className="mt-10">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-teal-deep">{cat.name.en}</h2>
            <div className="overflow-x-auto border border-stone bg-paper">
              <table className="w-full min-w-[56rem] text-left text-sm">
                <tbody className="divide-y divide-stone/70 align-top">
                  {list.map((p) => (
                    <tr key={p.id} className={p.active ? "" : "opacity-60"}>
                      <td className="w-20 px-4 py-4">
                        <div className="relative aspect-[4/5] w-14 overflow-hidden bg-sand">
                          {p.images[0] && <Image src={p.images[0]} alt="" fill sizes="56px" className="object-cover" />}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Link href={`/admin/products/${p.slug}`} className="font-semibold hover:underline">
                          {p.nameEn}
                        </Link>
                        <p className="text-xs text-muted" dir="rtl">
                          {p.nameAr}
                        </p>
                        {!p.active && <p className="mt-1 text-xs font-semibold text-danger">Hidden from the shop</p>}
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-2">
                          {p.variants.map((v) => {
                            const low = v.stock !== null && v.stock <= LOW_STOCK;
                            return (
                              <form key={v.id} action={updateVariantAction} className="flex flex-wrap items-center gap-2">
                                <input type="hidden" name="variantId" value={v.id} />
                                <span className="w-28 text-xs">{v.labelEn}</span>
                                <label className="flex items-center gap-1 text-xs text-muted">
                                  QAR
                                  <input name="price" defaultValue={(v.price / 100).toString()} inputMode="decimal" className="w-20 border border-stone px-2 py-1 text-sm text-ink" />
                                </label>
                                <label className={`flex items-center gap-1 text-xs ${low ? "font-semibold text-danger" : "text-muted"}`}>
                                  Stock
                                  <input
                                    name="stock"
                                    defaultValue={v.stock === null ? "" : v.stock}
                                    placeholder="∞"
                                    inputMode="numeric"
                                    className="w-16 border border-stone px-2 py-1 text-sm text-ink"
                                  />
                                </label>
                                <button className="border border-stone px-2 py-1 text-xs hover:border-ink">Save</button>
                                {v.stock === 0 && <span className="text-xs font-semibold text-danger">Sold out</span>}
                              </form>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex flex-col items-end gap-2">
                          <Link href={`/admin/products/${p.slug}`} className="border border-ink px-3 py-1.5 text-xs font-semibold hover:bg-ink hover:text-paper">
                            Edit
                          </Link>
                          <form action={toggleActiveAction}>
                            <input type="hidden" name="slug" value={p.slug} />
                            <button className="text-xs text-muted underline hover:text-ink">{p.active ? "Hide from shop" : "Show in shop"}</button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </div>
  );
}
