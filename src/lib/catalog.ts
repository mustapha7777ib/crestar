import "server-only";
import type { Prisma } from "@prisma/client";
import { revalidatePath, revalidateTag, unstable_cache, updateTag } from "next/cache";
import { isCategoryId } from "@/data/categories";
import { towns, type TownId } from "@/data/towns";
import type { L } from "@/i18n/config";
import { db } from "./db";
import type { Product } from "./catalog-types";

// The catalogue is read from the database through one cached query, so pages
// stay fast and the database is not woken on every visit. refreshCatalog()
// clears it after an edit or a stock change; it also refreshes every 5 minutes.

const CATALOG_TAG = "catalog";

type ProductRow = Prisma.ProductGetPayload<{ include: { variants: true } }>;

function toProduct(row: ProductRow, rating?: { average: number; count: number }): Product {
  const badge = row.badgeEn && row.badgeAr ? { en: row.badgeEn, ar: row.badgeAr } : undefined;
  return {
    slug: row.slug,
    category: isCategoryId(row.category) ? row.category : "pantry",
    name: { en: row.nameEn, ar: row.nameAr },
    tagline: { en: row.taglineEn, ar: row.taglineAr },
    story: { en: row.storyEn, ar: row.storyAr },
    town: (row.town in towns ? row.town : "kano") as TownId,
    details: Array.isArray(row.details) ? (row.details as { label: L; value: L }[]) : [],
    images: row.images.length ? row.images : ["/images/editorial/spice-baskets.jpg"],
    variants: [...row.variants]
      .sort((a, b) => a.sort - b.sort)
      .map((v) => ({ id: v.code, label: { en: v.labelEn, ar: v.labelAr }, price: v.price, stock: v.stock, weight: v.weight })),
    ...(badge ? { badge } : {}),
    ...(row.featured !== null ? { featured: row.featured } : {}),
    handmade: row.handmade,
    ...(row.bundle.length ? { bundle: row.bundle } : {}),
    active: row.active,
    ...(rating && rating.count > 0 ? { rating } : {}),
  };
}

async function loadCatalog(): Promise<Product[]> {
  const [rows, ratings] = await Promise.all([
    db.product.findMany({ include: { variants: true }, orderBy: [{ sort: "asc" }, { createdAt: "asc" }] }),
    db.review.groupBy({ by: ["productSlug"], where: { status: "APPROVED" }, _avg: { rating: true }, _count: true }),
  ]);
  const bySlug = new Map(
    ratings.map((r) => [r.productSlug, { average: Math.round((r._avg.rating ?? 0) * 10) / 10, count: r._count }]),
  );
  return rows.filter((r) => r.variants.length > 0).map((r) => toProduct(r, bySlug.get(r.slug)));
}

const cachedCatalog = unstable_cache(loadCatalog, ["catalog-v1"], { tags: [CATALOG_TAG], revalidate: 300 });

/** Every product, including hidden ones (for admin and order history). */
export async function getAllProducts(): Promise<Product[]> {
  return cachedCatalog();
}

/** Products shown in the shop. */
export async function getCatalog(): Promise<Product[]> {
  return (await cachedCatalog()).filter((p) => p.active !== false);
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  return (await getCatalog()).find((p) => p.slug === slug);
}

export async function featuredProducts(): Promise<Product[]> {
  return (await getCatalog()).filter((p) => p.featured !== undefined).sort((a, b) => a.featured! - b.featured!);
}

export async function productsIn(category: string): Promise<Product[]> {
  return (await getCatalog()).filter((p) => p.category === category);
}

/** Same category first, then anything else, never the product itself. */
export async function relatedProducts(product: Product, count = 4): Promise<Product[]> {
  const all = await getCatalog();
  const same = all.filter((p) => p.category === product.category && p.slug !== product.slug);
  const other = all.filter((p) => p.category !== product.category);
  return [...same, ...other].slice(0, count);
}

/**
 * Clear the cached catalogue and the pages built from it. Only callable from
 * server actions and route handlers (not while a page is rendering).
 */
export function refreshCatalog() {
  revalidateTag(CATALOG_TAG, "max");
  revalidatePath("/[locale]", "layout");
}

/** For admin server actions: the edit shows on the very next page load. */
export function refreshCatalogNow() {
  updateTag(CATALOG_TAG);
  revalidatePath("/[locale]", "layout");
}
