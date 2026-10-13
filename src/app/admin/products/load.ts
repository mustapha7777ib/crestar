import "server-only";
import { isCategoryId } from "@/data/categories";
import { towns } from "@/data/towns";
import type { L } from "@/i18n/config";
import { db } from "@/lib/db";
import type { ProductForm } from "./schema";

/** Read a product straight from the database (not the shop's cache) for editing. */
export async function loadProductForm(slug: string): Promise<ProductForm | null> {
  const p = await db.product.findUnique({ where: { slug }, include: { variants: { orderBy: { sort: "asc" } } } });
  if (!p) return null;
  return {
    originalSlug: p.slug,
    slug: p.slug,
    category: isCategoryId(p.category) ? p.category : "pantry",
    town: (p.town in towns ? p.town : "kano") as ProductForm["town"],
    active: p.active,
    handmade: p.handmade,
    featured: p.featured,
    name: { en: p.nameEn, ar: p.nameAr },
    tagline: { en: p.taglineEn, ar: p.taglineAr },
    story: { en: p.storyEn, ar: p.storyAr },
    badge: { en: p.badgeEn ?? "", ar: p.badgeAr ?? "" },
    images: p.images,
    details: Array.isArray(p.details) ? (p.details as { label: L; value: L }[]) : [],
    bundle: p.bundle,
    variants: p.variants.map((v) => ({
      code: v.code,
      label: { en: v.labelEn, ar: v.labelAr },
      price: v.price,
      stock: v.stock,
      weight: v.weight,
    })),
  };
}

export async function otherProducts(except?: string) {
  const rows = await db.product.findMany({ where: { category: { not: "gifts" } }, orderBy: { sort: "asc" }, select: { slug: true, nameEn: true } });
  return rows.filter((r) => r.slug !== except).map((r) => ({ slug: r.slug, name: r.nameEn }));
}
