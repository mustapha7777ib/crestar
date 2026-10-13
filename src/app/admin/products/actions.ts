"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-guard";
import { refreshCatalogNow } from "@/lib/catalog";
import { db } from "@/lib/db";
import { productFormSchema, type ProductForm } from "./schema";

export type SaveResult = { ok: false; error: string } | undefined;

export async function saveProduct(form: ProductForm): Promise<SaveResult> {
  await requireAdmin();
  const parsed = productFormSchema.safeParse(form);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, error: `${issue.path.join(" › ") || "Form"}: ${issue.message}` };
  }
  const p = parsed.data;

  const clash = await db.product.findUnique({ where: { slug: p.slug } });
  if (clash && p.slug !== p.originalSlug) return { ok: false, error: `The web address "${p.slug}" is already used by another product.` };

  const data = {
    slug: p.slug,
    category: p.category,
    town: p.town,
    active: p.active,
    handmade: p.handmade,
    featured: p.featured,
    nameEn: p.name.en,
    nameAr: p.name.ar,
    taglineEn: p.tagline.en,
    taglineAr: p.tagline.ar,
    storyEn: p.story.en,
    storyAr: p.story.ar,
    badgeEn: p.badge.en || null,
    badgeAr: p.badge.ar || null,
    images: p.images,
    details: p.details,
    bundle: p.bundle.filter((s) => s !== p.slug),
  };
  const variantData = (v: ProductForm["variants"][number], sort: number) => ({
    labelEn: v.label.en,
    labelAr: v.label.ar,
    price: v.price,
    stock: v.stock,
    weight: v.weight,
    sort,
  });

  if (!p.originalSlug) {
    const last = await db.product.aggregate({ _max: { sort: true } });
    await db.product.create({
      data: {
        ...data,
        sort: (last._max.sort ?? 0) + 1,
        variants: { create: p.variants.map((v, i) => ({ code: v.code, ...variantData(v, i) })) },
      },
    });
  } else {
    const existing = await db.product.findUnique({ where: { slug: p.originalSlug }, include: { variants: true } });
    if (!existing) return { ok: false, error: "This product no longer exists." };
    const keep = new Set(p.variants.map((v) => v.code));
    await db.$transaction([
      db.product.update({ where: { id: existing.id }, data }),
      // Removed sizes are deleted; past orders keep their own copy of the details.
      db.variant.deleteMany({ where: { productId: existing.id, code: { notIn: [...keep] } } }),
      ...p.variants.map((v, i) =>
        db.variant.upsert({
          where: { productId_code: { productId: existing.id, code: v.code } },
          create: { productId: existing.id, code: v.code, ...variantData(v, i) },
          update: variantData(v, i),
        }),
      ),
    ]);
  }

  refreshCatalogNow();
  revalidatePath("/admin/products");
  redirect(`/admin/products?saved=${encodeURIComponent(p.slug)}`);
}

/** Quick price/stock change from the products list. */
export async function updateVariantAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("variantId") ?? "");
  const price = Math.round(Number(formData.get("price")) * 100);
  const stockRaw = String(formData.get("stock") ?? "").trim();
  const stock = stockRaw === "" ? null : Math.max(0, Math.floor(Number(stockRaw)));
  if (!id || !Number.isFinite(price) || price < 0 || (stock !== null && !Number.isFinite(stock))) return;
  await db.variant.update({ where: { id }, data: { price, stock } });
  refreshCatalogNow();
  revalidatePath("/admin/products");
}

export async function toggleActiveAction(formData: FormData) {
  await requireAdmin();
  const slug = String(formData.get("slug") ?? "");
  const product = await db.product.findUnique({ where: { slug } });
  if (!product) return;
  await db.product.update({ where: { slug }, data: { active: !product.active } });
  refreshCatalogNow();
  revalidatePath("/admin/products");
}
